import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, Loader2, Volume2, Wind, Zap, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MeditationConfig {
  backgroundSound: 'nature' | 'elevate' | 'enlightenment' | null;
  duration: number | null;
  decompress: boolean | null;
  grounding: boolean | null;
  selfAffirmation: string | null;
  manifestation: boolean | null;
  gratefulness: boolean | null;
}

const initialConfig: MeditationConfig = {
  backgroundSound: null,
  duration: null,
  decompress: null,
  grounding: null,
  selfAffirmation: null,
  manifestation: null,
  gratefulness: null,
};

const backgroundSounds = [
  { id: 'nature', label: 'Nature Balance', frequency: '432Hz', description: 'Grounding & harmony with natural rhythms', icon: Wind },
  { id: 'elevate', label: 'Elevate', frequency: '777Hz', description: 'Spiritual elevation & divine connection', icon: Zap },
  { id: 'enlightenment', label: 'Enlightenment', frequency: '1111Hz', description: 'Awakening & higher consciousness', icon: Sun },
];

const durations = [5, 10, 15, 20, 30];

const affirmationTypes = [
  'Self-worth and confidence',
  'Abundance and prosperity',
  'Health and vitality',
  'Love and relationships',
  'Career and success',
  'Peace and calm',
];

interface MeditationBuilderProps {
  onComplete: (script: string) => void;
  onCancel: () => void;
}

export const MeditationBuilder = ({ onComplete, onCancel }: MeditationBuilderProps) => {
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<MeditationConfig>(initialConfig);
  const [isGenerating, setIsGenerating] = useState(false);

  const steps = [
    { key: 'backgroundSound', title: 'Background Sound', subtitle: 'Choose your frequency foundation' },
    { key: 'duration', title: 'Duration', subtitle: 'How long would you like to meditate?' },
    { key: 'decompress', title: 'Decompress', subtitle: 'Start with a 3-breath reset?' },
    { key: 'grounding', title: 'Grounding', subtitle: 'Include grounding techniques?' },
    { key: 'selfAffirmation', title: 'Self-Affirmation', subtitle: 'Add positive affirmations?' },
    { key: 'manifestation', title: 'Manifestation', subtitle: 'Include visualization exercise?' },
    { key: 'gratefulness', title: 'Gratefulness', subtitle: 'End with gratitude practice?' },
  ];

  const canProceed = () => {
    const currentStep = steps[step].key;
    if (currentStep === 'backgroundSound') return config.backgroundSound !== null;
    if (currentStep === 'duration') return config.duration !== null;
    if (currentStep === 'selfAffirmation') return config.selfAffirmation !== undefined;
    return config[currentStep as keyof MeditationConfig] !== null;
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      await generateMeditation();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onCancel();
    }
  };

  const generateMeditation = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio-script', {
        body: {
          type: 'meditation',
          backgroundSound: config.backgroundSound,
          duration: config.duration,
          decompress: config.decompress,
          grounding: config.grounding,
          selfAffirmation: config.selfAffirmation,
          manifestation: config.manifestation,
          gratefulness: config.gratefulness,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      onComplete(data.script);
      toast.success('Your meditation has been created!');
    } catch (error) {
      console.error('Error generating meditation:', error);
      toast.error('Failed to generate meditation. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStepContent = () => {
    const currentStep = steps[step].key;

    if (currentStep === 'backgroundSound') {
      return (
        <div className="grid gap-3">
          {backgroundSounds.map((sound) => {
            const Icon = sound.icon;
            return (
              <button
                key={sound.id}
                onClick={() => setConfig({ ...config, backgroundSound: sound.id as 'nature' | 'elevate' | 'enlightenment' })}
                className={`p-4 rounded-xl text-left transition-all flex items-start gap-4 ${
                  config.backgroundSound === sound.id
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  config.backgroundSound === sound.id ? 'bg-primary/30' : 'bg-muted'
                }`}>
                  <Icon className={`w-5 h-5 ${config.backgroundSound === sound.id ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{sound.label}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent">{sound.frequency}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{sound.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentStep === 'duration') {
      return (
        <div className="flex flex-wrap gap-3">
          {durations.map((d) => (
            <button
              key={d}
              onClick={() => setConfig({ ...config, duration: d })}
              className={`px-6 py-4 rounded-xl font-medium transition-all ${
                config.duration === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/30 text-foreground hover:bg-muted/50'
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      );
    }

    if (currentStep === 'selfAffirmation') {
      return (
        <div className="space-y-3">
          <button
            onClick={() => setConfig({ ...config, selfAffirmation: null })}
            className={`w-full p-4 rounded-xl text-left transition-all ${
              config.selfAffirmation === null
                ? 'bg-muted/50 border-2 border-muted'
                : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
            }`}
          >
            <span className="font-medium text-foreground">Skip affirmations</span>
          </button>
          <div className="grid gap-2">
            {affirmationTypes.map((type) => (
              <button
                key={type}
                onClick={() => setConfig({ ...config, selfAffirmation: type })}
                className={`p-3 rounded-xl text-left transition-all ${
                  config.selfAffirmation === type
                    ? 'bg-primary/20 border-2 border-primary'
                    : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                }`}
              >
                <span className="text-sm font-medium text-foreground">{type}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Boolean options (decompress, grounding, manifestation, gratefulness)
    const currentValue = config[currentStep as keyof MeditationConfig];
    return (
      <div className="flex gap-4">
        <button
          onClick={() => setConfig({ ...config, [currentStep]: true })}
          className={`flex-1 p-6 rounded-xl font-medium transition-all ${
            currentValue === true
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/30 text-foreground hover:bg-muted/50'
          }`}
        >
          Yes
        </button>
        <button
          onClick={() => setConfig({ ...config, [currentStep]: false })}
          className={`flex-1 p-6 rounded-xl font-medium transition-all ${
            currentValue === false
              ? 'bg-muted/50 border-2 border-muted text-foreground'
              : 'bg-muted/30 text-foreground hover:bg-muted/50'
          }`}
        >
          No
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg glass-surface rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Progress */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-display font-semibold text-foreground mb-1">
            {steps[step].title}
          </h2>
          <p className="text-sm text-muted-foreground">{steps[step].subtitle}</p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-6"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={isGenerating}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : step === steps.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
