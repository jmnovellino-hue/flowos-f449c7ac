import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, Crown, Heart, Brain, ChevronRight, Settings, LogOut, ExternalLink, Mail, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContactSection } from './ContactSection';
import h2hLogo from '../../assets/h2h-logo-light.png';

interface ProfileTabProps {
  userProfile: {
    name: string;
    archetype: string;
    values: string[];
    tier: string;
    streak: number;
  };
  userId?: string;
  onNavigateToArchetype?: () => void;
  onNavigateToShadow?: () => void;
}

export const ProfileTab = ({ userProfile, userId, onNavigateToArchetype, onNavigateToShadow }: ProfileTabProps) => {
  const [email, setEmail] = useState('');
  const [weeklyDigestEnabled, setWeeklyDigestEnabled] = useState(true);
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSendingDigest, setIsSendingDigest] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    if (userId) {
      loadEmailSettings();
    }
  }, [userId]);

  const loadEmailSettings = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('email, weekly_digest_enabled, email_verified')
      .eq('user_id', userId)
      .single();
    
    if (data) {
      setEmail(data.email || '');
      setWeeklyDigestEnabled(data.weekly_digest_enabled ?? true);
      setEmailVerified(data.email_verified ?? false);
    }
  };

  const saveEmailSettings = async () => {
    if (!userId) return;
    setIsSavingEmail(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ 
        email, 
        weekly_digest_enabled: weeklyDigestEnabled 
      })
      .eq('user_id', userId);
    
    setIsSavingEmail(false);
    
    if (error) {
      toast.error('Failed to save email settings');
    } else {
      toast.success('Email settings saved');
      // Reset verification status if email changed
      setEmailVerified(false);
    }
  };

  const sendVerificationEmail = async () => {
    if (!userId || !email) {
      toast.error('Please enter and save your email first');
      return;
    }
    
    setIsSendingVerification(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('send-verification-email', {
        body: { email }
      });
      
      if (error) throw error;
      
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setIsSendingVerification(false);
    }
  };

  const sendTestDigest = async () => {
    if (!userId || !email) {
      toast.error('Please save your email first');
      return;
    }
    
    setIsSendingDigest(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('weekly-wisdom-digest', {
        body: { userId }
      });
      
      if (error) throw error;
      
      toast.success('Digest sent! Check your email.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send digest');
    } finally {
      setIsSendingDigest(false);
    }
  };

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

            <Button variant="outline" className="w-full mt-6" onClick={onNavigateToShadow}>
              View Full Shadow Report
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>

          {/* Archetype Analysis Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">Archetype Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Explore your full leadership archetype breakdown including strengths, challenges, and growth path.
            </p>
            <Button variant="outline" className="w-full" onClick={onNavigateToArchetype}>
              View Full Analysis
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

          {/* About H2H */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <img src={h2hLogo} alt="The H2H Experiment" className="h-8 w-auto" />
              <span className="font-medium text-foreground">The H2H Experiment</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              FlowOS is part of the H2H Inner Lab program – a transformative journey for conscious leaders.
            </p>
            <a 
              href="https://theh2hexperiment.com/about-us" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full glow-turquoise">
                Learn About H2H
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>

          {/* Weekly Digest Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Weekly Wisdom Digest</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Receive a weekly email summarizing your saved insights, conversations, and commitment progress.
            </p>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="digest-email" className="text-sm text-muted-foreground">Email Address</Label>
                <div className="relative mt-1">
                  <Input
                    id="digest-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                  />
                  {emailVerified && (
                    <CheckCircle className="w-5 h-5 text-primary absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                
                {email && !emailVerified && (
                  <div className="mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-500">Email not verified</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                      onClick={sendVerificationEmail}
                      disabled={isSendingVerification}
                    >
                      {isSendingVerification ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        'Send verification'
                      )}
                    </Button>
                  </div>
                )}
                
                {emailVerified && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Email verified - you'll receive weekly digests
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="digest-toggle" className="text-sm">Enable Weekly Digest</Label>
                <Switch
                  id="digest-toggle"
                  checked={weeklyDigestEnabled}
                  onCheckedChange={setWeeklyDigestEnabled}
                />
              </div>
              
              <p className="text-xs text-muted-foreground">
                Digests are sent automatically every Sunday at 9am UTC.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  onClick={saveEmailSettings} 
                  disabled={isSavingEmail}
                  className="flex-1"
                >
                  {isSavingEmail ? 'Saving...' : 'Save Settings'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={sendTestDigest}
                  disabled={isSendingDigest || !email || !emailVerified}
                  title={!emailVerified ? 'Please verify your email first' : ''}
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSendingDigest ? 'Sending...' : 'Send Now'}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Contact Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <ContactSection />
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
