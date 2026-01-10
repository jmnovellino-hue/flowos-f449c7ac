import { motion } from 'framer-motion';
import { User, Shield, Crown, Heart, Brain, ChevronRight, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import h2hLogo from '@/assets/h2h-logo-light.png';
interface ProfileTabProps {
  userProfile: {
    name: string;
    archetype: string;
    values: string[];
    tier: string;
    streak: number;
  };
}

export const ProfileTab = ({ userProfile }: ProfileTabProps) => {
  const shadowTraits = [
    { name: 'Martyr Syndrome', level: 72, description: 'Tendency to overwork and sacrifice personal needs' },
    { name: 'Control Compulsion', level: 58, description: 'Difficulty delegating and trusting others' },
    { name: 'Validation Seeking', level: 45, description: 'Need for external recognition of efforts' },
  ];

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          Your Profile
        </h1>
        <p className="text-lg text-muted-foreground">
          H2H Leadership Identity & Analysis
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-surface rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col md:flex-row items-start gap-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-turquoise">
                <User className="w-12 h-12 text-primary-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary uppercase tracking-wider">
                    {userProfile.tier} Tier
                  </span>
                </div>
                <h2 className="text-2xl font-display font-semibold text-foreground mb-1">
                  {userProfile.name}
                </h2>
                <p className="text-lg text-primary font-medium mb-4">
                  {userProfile.archetype}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {userProfile.values.map((value) => (
                    <span
                      key={value}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {value}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shadow Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Shadow Analysis</span>
            </div>

            <div className="space-y-6">
              {shadowTraits.map((trait, index) => (
                <div key={trait.name}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{trait.name}</span>
                    <span className={`text-sm font-medium ${
                      trait.level > 70 ? 'text-destructive' : 
                      trait.level > 50 ? 'text-secondary' : 'text-primary'
                    }`}>
                      {trait.level}%
                    </span>
                  </div>
                  <Progress 
                    value={trait.level} 
                    className={`h-2 ${
                      trait.level > 70 ? '[&>div]:bg-destructive' : 
                      trait.level > 50 ? '[&>div]:bg-secondary' : ''
                    }`}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-6">
              View Full Shadow Report
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Values Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">Core Values</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {userProfile.values.map((value, index) => (
                <div
                  key={value}
                  className="p-4 rounded-xl bg-muted/50 text-center"
                >
                  <div className="text-3xl font-display font-bold text-gradient-primary mb-2">
                    #{index + 1}
                  </div>
                  <h4 className="font-medium text-foreground">{value}</h4>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Side Column */}
        <div className="space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-surface rounded-2xl p-6"
          >
            <h3 className="font-medium text-foreground mb-4">Journey Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current Streak</span>
                <span className="text-xl font-display font-bold text-secondary">
                  {userProfile.streak} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Experiments Done</span>
                <span className="text-xl font-display font-bold text-foreground">24</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bio Logs</span>
                <span className="text-xl font-display font-bold text-foreground">89</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Architect Chats</span>
                <span className="text-xl font-display font-bold text-foreground">156</span>
              </div>
            </div>
          </motion.div>

          {/* Tier Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-surface rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-secondary/20 to-primary/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="font-medium text-foreground">H2H Inner Lab</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Full access to all Inner Lab features including AI mentorship, Bio-analysis, and Shadow reports.
              </p>
              <div className="text-2xl font-display font-bold text-secondary mb-1">
                $99<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
              <p className="text-xs text-muted-foreground">Renews Jan 15, 2026</p>
              
              {/* H2H Branding */}
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                <img src={h2hLogo} alt="H2H" className="h-4 w-auto opacity-60" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">The H2H Experiment</span>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <Button variant="outline" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-3" />
              Account Settings
            </Button>
            <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
