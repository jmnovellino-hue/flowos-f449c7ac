import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Lightbulb,
  FlaskConical,
  BookOpen,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface JournalInsightsProps {
  mood: number;
  energy: number;
  thoughts?: string;
  concerns?: string;
  isVisible: boolean;
  onClose: () => void;
}

interface Insights {
  insight: string;
  recommendation: string;
  microExperiment: string;
  wisdom: string;
}

export const JournalInsights = ({
  mood,
  energy,
  thoughts,
  concerns,
  isVisible,
  onClose
}: JournalInsightsProps) => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && !insights && !isLoading) {
      fetchInsights();
    }
  }, [isVisible]);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('journal-insights', {
        body: { mood, energy, thoughts, concerns }
      });

      if (fnError) {
        throw fnError;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setInsights(data);
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError(err.message || 'Failed to generate insights');
      
      if (err.message?.includes('Rate limit')) {
        toast.error('Please wait a moment before generating more insights');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const insightCards = insights ? [
    {
      id: 'insight',
      icon: Sparkles,
      title: 'Your State Today',
      content: insights.insight,
      color: 'primary'
    },
    {
      id: 'recommendation',
      icon: Lightbulb,
      title: 'Recommended Action',
      content: insights.recommendation,
      color: 'secondary'
    },
    {
      id: 'experiment',
      icon: FlaskConical,
      title: 'Micro-Experiment',
      content: insights.microExperiment,
      color: 'accent'
    },
    {
      id: 'wisdom',
      icon: BookOpen,
      title: 'Wisdom for Today',
      content: insights.wisdom,
      color: 'primary'
    }
  ] : [];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isLoading ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5 text-primary" />
                </motion.div>
                <h4 className="font-medium text-foreground">AI Insights for Today</h4>
              </div>
              <div className="flex items-center gap-2">
                {insights && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchInsights}
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
                >
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </motion.div>
                <p className="text-muted-foreground text-sm">Analyzing your journal entry...</p>
                <p className="text-muted-foreground/60 text-xs mt-1">Generating personalized insights</p>
              </motion.div>
            )}

            {error && !isLoading && (
              <div className="text-center py-8">
                <p className="text-destructive text-sm mb-2">{error}</p>
                <Button variant="outline" size="sm" onClick={fetchInsights}>
                  Try Again
                </Button>
              </div>
            )}

            {insights && !isLoading && (
              <div className="grid gap-3 sm:grid-cols-2">
                {insightCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl bg-${card.color}/5 border border-${card.color}/20`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <card.icon className={`w-4 h-4 text-${card.color}`} />
                      <span className={`text-xs font-medium text-${card.color} uppercase tracking-wider`}>
                        {card.title}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {card.content}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
