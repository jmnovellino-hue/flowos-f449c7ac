import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, X, Users, DollarSign, Mic, AlertTriangle, Briefcase, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { LucideIcon } from 'lucide-react';

const situations = [
  { id: 'board-meeting', label: 'Board Meeting', description: 'High-stakes presentation to executives', icon: Briefcase },
  { id: 'difficult-conversation', label: 'Difficult Conversation', description: 'Addressing conflict or delivering hard news', icon: AlertTriangle },
  { id: 'salary-negotiation', label: 'Salary Negotiation', description: 'Advocating for your compensation', icon: DollarSign },
  { id: 'public-speaking', label: 'Public Speaking', description: 'Presenting to a large audience', icon: Mic },
  { id: 'job-interview', label: 'Job Interview', description: 'Making a strong first impression', icon: Users },
  { id: 'relationship-talk', label: 'Relationship Talk', description: 'Important conversation with a partner', icon: Heart },
];

interface PerformanceBuilderProps {
  onComplete: (script: string, situation: string) => void;
  onCancel: () => void;
}

export const PerformanceBuilder = ({ onComplete, onCancel }: PerformanceBuilderProps) => {
  const [selectedSituation, setSelectedSituation] = useState<string | null>(null);
  const [customSituation, setCustomSituation] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const situation = selectedSituation === 'custom' ? customSituation : 
      situations.find(s => s.id === selectedSituation)?.label || '';
    
    if (!situation.trim()) {
      toast.error('Please select or describe your situation');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio-script', {
        body: {
          type: 'performance',
          situation,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onComplete(data.script, situation);
      toast.success('Your primer has been created!');
    } catch (error) {
      console.error('Error generating performance primer:', error);
      toast.error('Failed to generate. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = selectedSituation && (selectedSituation !== 'custom' || customSituation.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-surface rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-foreground mb-1">
              Peak Performance Primer
            </h2>
            <p className="text-sm text-muted-foreground">
              What situation are you preparing for?
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Situation Options */}
        <div className="grid gap-2 mb-4">
          {situations.map((situation) => {
            const Icon = situation.icon as LucideIcon;
            return (
              <button
                key={situation.id}
                onClick={() => setSelectedSituation(situation.id)}
                className={`p-4 rounded-xl text-left transition-all flex items-center gap-4 ${
                  selectedSituation === situation.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedSituation === situation.id ? 'bg-primary/30' : 'bg-muted'
                }`}>
                  <Icon className={`w-5 h-5 ${selectedSituation === situation.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <span className="font-medium text-foreground block">{situation.label}</span>
                  <span className="text-xs text-muted-foreground">{situation.description}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Option */}
        <div className="mb-6">
          <button
            onClick={() => setSelectedSituation('custom')}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              selectedSituation === 'custom'
                ? 'bg-primary/20 border-2 border-primary'
                : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
            }`}
          >
            <span className="font-medium text-foreground">Something else...</span>
          </button>
          {selectedSituation === 'custom' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3"
            >
              <Input
                placeholder="Describe your situation..."
                value={customSituation}
                onChange={(e) => setCustomSituation(e.target.value)}
                className="bg-background/50"
              />
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isGenerating}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Primer
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
