import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Check, Crown, Zap, Brain, Sparkles, Lock } from 'lucide-react';

interface SubscriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier?: string;
}

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  yearlyPrice: number;
  icon: typeof Crown;
  features: string[];
  highlighted?: boolean;
  color: string;
}

const tiers: Tier[] = [
  {
    id: 'mirror',
    name: 'The Mirror',
    tagline: 'Begin the journey within',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Brain,
    color: 'text-muted-foreground',
    features: [
      'Daily journaling & mood tracking',
      'Basic wellness Lab activities',
      'Access to free Codex resources (4 tools)',
      'Morning Architect meditation',
      '3-Breath Reset audio',
      'Community access',
    ],
  },
  {
    id: 'flow',
    name: 'The Flow',
    tagline: 'Master your daily rhythm',
    monthlyPrice: 5.99,
    yearlyPrice: 57.50, // 20% discount
    icon: Zap,
    color: 'text-primary',
    features: [
      'Everything in The Mirror, plus:',
      'Full Meditation Builder (custom sessions)',
      'Sleep Better frequencies (all tracks)',
      'Flow-tier Codex resources (7 tools)',
      'Energy Audit Framework',
      'Difficult Conversation Blueprint',
      'Stoic Decision Matrix',
      'Save unlimited audio sessions',
    ],
  },
  {
    id: 'architect',
    name: 'The Architect',
    tagline: 'Design your internal architecture',
    monthlyPrice: 8.99,
    yearlyPrice: 86.30, // 20% discount
    icon: Crown,
    color: 'text-secondary',
    highlighted: true,
    features: [
      'Everything in The Flow, plus:',
      'Peak Performance Primer Builder',
      'Architect-tier Codex resources (10 tools)',
      'Shadow Integration Workbook',
      'Conflict Synthesis Framework',
      'Strategic Narrative Playbook',
      'Commitment Tracker with analytics',
      'Priority support',
    ],
  },
  {
    id: 'oracle',
    name: 'The Oracle',
    tagline: 'Unlock the complete system',
    monthlyPrice: 14.99,
    yearlyPrice: 143.90, // 20% discount
    icon: Sparkles,
    color: 'text-amber-400',
    features: [
      'Everything in The Architect, plus:',
      'The Architect AI (unlimited coaching)',
      'Full Codex library (12+ tools)',
      '19-Core Processor Manual',
      'Quarterly Life Architecture Sprint',
      'Archetype & Shadow deep analysis',
      'Wisdom Library (save AI insights)',
      'Early access to new features',
      'Direct founder access',
    ],
  },
];

export const SubscriptionModal = ({ open, onOpenChange, currentTier = 'mirror' }: SubscriptionModalProps) => {
  const [isYearly, setIsYearly] = useState(true);

  const formatPrice = (tier: Tier) => {
    if (tier.monthlyPrice === 0) return 'Free';
    const price = isYearly ? (tier.yearlyPrice / 12).toFixed(2) : tier.monthlyPrice.toFixed(2);
    return `€${price}`;
  };

  const getBillingText = (tier: Tier) => {
    if (tier.monthlyPrice === 0) return 'Forever free';
    if (isYearly) {
      return `€${tier.yearlyPrice.toFixed(2)}/year (save 20%)`;
    }
    return `€${tier.monthlyPrice}/month`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-4">
          <DialogTitle className="text-2xl md:text-3xl font-display">
            Choose Your Path
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Invest in your internal architecture. Transform how you lead.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 pb-6">
          <span className={`text-sm ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Monthly
          </span>
          <Switch
            checked={isYearly}
            onCheckedChange={setIsYearly}
            className="data-[state=checked]:bg-primary"
          />
          <span className={`text-sm ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-2 text-xs text-secondary font-medium">Save 20%</span>
          </span>
        </div>

        {/* Tiers Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, index) => {
            const Icon = tier.icon;
            const isCurrentTier = tier.id === currentTier;
            
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 flex flex-col ${
                  tier.highlighted 
                    ? 'bg-gradient-to-b from-secondary/10 to-secondary/5 border-2 border-secondary/50' 
                    : 'glass-surface'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-secondary text-secondary-foreground text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <div className={`w-12 h-12 mx-auto rounded-xl bg-muted/50 flex items-center justify-center mb-3 ${tier.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-foreground">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tier.tagline}
                  </p>
                </div>

                <div className="text-center mb-4">
                  <div className="text-3xl font-display font-bold text-foreground">
                    {formatPrice(tier)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {getBillingText(tier)}
                  </p>
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.color}`} />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    tier.highlighted 
                      ? 'bg-secondary hover:bg-secondary/90 text-secondary-foreground' 
                      : tier.monthlyPrice === 0 
                        ? 'bg-muted hover:bg-muted/80 text-foreground'
                        : 'bg-primary hover:bg-primary/90'
                  }`}
                  disabled={isCurrentTier}
                >
                  {isCurrentTier ? 'Current Plan' : tier.monthlyPrice === 0 ? 'Get Started' : 'Upgrade'}
                </Button>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          All plans include a 14-day money-back guarantee. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
};
