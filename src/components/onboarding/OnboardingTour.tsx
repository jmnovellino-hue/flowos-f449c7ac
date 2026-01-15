import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Headphones, 
  FlaskConical, 
  MessageCircle, 
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface OnboardingTourProps {
  onComplete: () => void;
  onDismiss: () => void;
}

const tourSteps = [
  {
    id: 'welcome',
    icon: Sparkles,
    title: 'Welcome to FlowOS',
    description: 'Your personal operating system for leadership transformation. Let me show you around the key features designed to help you build lasting habits and unlock your potential.',
    highlight: null,
  },
  {
    id: 'home',
    icon: Home,
    title: 'Home Dashboard',
    description: 'Your daily command center. Start each day with wisdom, log your mood and energy, and track your commitments. The Daily Journal is your core habit—use it to capture your state and receive AI-powered insights.',
    highlight: 'home',
  },
  {
    id: 'codex',
    icon: BookOpen,
    title: 'The Codex',
    description: 'A library of battle-tested frameworks, templates, and wisdom from The H2H Experiment. Resources are organized by tier—unlock more as you progress.',
    highlight: 'codex',
  },
  {
    id: 'studio',
    icon: Headphones,
    title: 'The Studio',
    description: 'AI-powered audio content for the liminal spaces of your day. Create custom meditations, performance primers, or use our ready-made sessions with binaural frequencies.',
    highlight: 'studio',
  },
  {
    id: 'lab',
    icon: FlaskConical,
    title: 'The Lab',
    description: 'Your personal experimentation space. Try micro-experiments backed by science, build wellness routines, and sync your calendar to get AI insights on your energy patterns.',
    highlight: 'lab',
  },
  {
    id: 'architect',
    icon: MessageCircle,
    title: 'The Architect',
    description: 'Your AI leadership advisor, trained on wisdom from 19 core thinkers. Ask questions, explore your challenges, and receive personalized guidance for your unique journey.',
    highlight: 'architect',
  },
];

export const OnboardingTour = ({ onComplete, onDismiss }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem('h2h_tour_completed', 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('h2h_tour_completed', 'true');
    }
    onDismiss();
  };

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === tourSteps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative glass-surface rounded-2xl p-8 max-w-lg w-full mx-4 border border-primary/20"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-primary'
                    : index < currentStep
                    ? 'w-3 bg-primary/50'
                    : 'w-3 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/10 flex items-center justify-center">
              <StepIcon className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-display font-semibold text-foreground mb-3">
              {step.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Don't show again checkbox */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Checkbox
              id="dontShowAgain"
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked === true)}
            />
            <label
              htmlFor="dontShowAgain"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Don't show this tour again
            </label>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <span className="text-sm text-muted-foreground">
              {currentStep + 1} of {tourSteps.length}
            </span>

            <Button onClick={handleNext} className="gap-1">
              {isLastStep ? (
                <>
                  Get Started
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
