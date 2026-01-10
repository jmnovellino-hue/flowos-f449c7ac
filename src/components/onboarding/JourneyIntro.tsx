import { motion } from 'framer-motion';
import { Eye, Compass, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import h2hLogo from '../../assets/h2h-logo-light.png';

interface JourneyIntroProps {
  onBegin: () => void;
}

const steps = [
  {
    icon: Eye,
    title: 'The Mirror',
    subtitle: 'Discovery',
    description: 'You cannot change what you cannot see. We map your default leadership style and hidden blind spots.',
  },
  {
    icon: Compass,
    title: 'The Compass',
    subtitle: 'Calibration',
    description: 'Direction matters more than speed. We stress-test your values against real-world ethical dilemmas.',
  },
  {
    icon: Building2,
    title: 'The Architecture',
    subtitle: 'Construction',
    description: 'Structure creates freedom. You unlock the daily tools—audio, wisdom, and metrics—to build your legacy.',
  },
];

export const JourneyIntro = ({ onBegin }: JourneyIntroProps) => {
  return (
    <div className="min-h-screen bg-background neural-grid flex items-center justify-center p-6">
      {/* Ambient effects */}
      <div className="fixed top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full relative z-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          {/* H2H Logo */}
          <div className="flex justify-center mb-4">
            <img src={h2hLogo} alt="The H2H Experiment" className="h-10 w-auto opacity-80" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <span className="text-xs font-medium text-primary uppercase tracking-wider">H2H Inner Lab</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-display font-semibold text-foreground mb-4">
            The Call to Adventure
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            The value of the Inner Lab comes from honest self-assessment, not passive consumption. 
            Your transformation begins with truth.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.15 }}
              className="glass-surface rounded-xl p-6 flex gap-6 items-start group hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-accent/20 transition-all duration-300">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    {step.subtitle}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <Button
            onClick={onBegin}
            size="lg"
            className="h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-lg glow-turquoise hover:glow-turquoise-intense transition-all duration-300 group"
          >
            Begin Assessment
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.div>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Takes approximately 8-10 minutes
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};
