import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Share2,
  X,
  Download,
  Twitter,
  Linkedin,
  Facebook,
  Copy,
  Check,
  Trophy,
  Flame,
  Star,
  Sparkles,
  Zap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BadgeData {
  id: string;
  name: string;
  title: string;
  level: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xp: number;
  streak: number;
  percentile: number;
  archetype?: string;
}

interface SocialBadgeShareProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeData;
}

const TIER_COLORS = {
  bronze: 'from-amber-700 to-amber-900',
  silver: 'from-slate-400 to-slate-600',
  gold: 'from-yellow-400 to-amber-500',
  platinum: 'from-cyan-400 to-blue-500',
};

const TIER_BORDERS = {
  bronze: 'border-amber-600',
  silver: 'border-slate-400',
  gold: 'border-yellow-400',
  platinum: 'border-cyan-400',
};

export const SocialBadgeShare = ({ isOpen, onClose, badge }: SocialBadgeShareProps) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  const shareText = `🏆 I've achieved "${badge.title}" (Level ${badge.level}) in FlowOS!

📊 My Journey:
• ${badge.streak} day streak 🔥
• Top ${100 - badge.percentile}% of conscious leaders
• ${badge.xp.toLocaleString()} XP earned

Join me on the path to conscious leadership! 
#FlowOS #H2HInnerLab #ConsciousLeadership #PersonalGrowth`;

  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Badge text copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('twitter');
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('linkedin');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    trackShare('facebook');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FlowOS Badge: ${badge.title}`,
          text: shareText,
          url: shareUrl,
        });
        trackShare('native');
      } catch (error) {
        // User cancelled or error
        console.log('Share cancelled');
      }
    } else {
      handleCopyText();
    }
  };

  const trackShare = async (platform: string) => {
    // Could track share analytics here
    toast.success(`Shared to ${platform}!`);
  };

  const handleDownloadBadge = async () => {
    setIsGenerating(true);
    
    // Create a canvas to generate badge image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsGenerating(false);
      return;
    }

    canvas.width = 600;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 800);
    gradient.addColorStop(0, '#0a0a0f');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 800);

    // Badge circle
    ctx.beginPath();
    ctx.arc(300, 280, 120, 0, Math.PI * 2);
    const badgeGradient = ctx.createRadialGradient(300, 280, 0, 300, 280, 120);
    if (badge.tier === 'gold') {
      badgeGradient.addColorStop(0, '#fbbf24');
      badgeGradient.addColorStop(1, '#d97706');
    } else if (badge.tier === 'platinum') {
      badgeGradient.addColorStop(0, '#22d3ee');
      badgeGradient.addColorStop(1, '#0284c7');
    } else if (badge.tier === 'silver') {
      badgeGradient.addColorStop(0, '#94a3b8');
      badgeGradient.addColorStop(1, '#475569');
    } else {
      badgeGradient.addColorStop(0, '#d97706');
      badgeGradient.addColorStop(1, '#78350f');
    }
    ctx.fillStyle = badgeGradient;
    ctx.fill();

    // Level number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Inter, system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(badge.level.toString(), 300, 305);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, system-ui';
    ctx.fillText(badge.title, 300, 460);

    // Stats
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '24px Inter, system-ui';
    ctx.fillText(`${badge.streak} Day Streak 🔥`, 300, 540);
    ctx.fillText(`${badge.xp.toLocaleString()} XP`, 300, 580);
    ctx.fillText(`Top ${100 - badge.percentile}%`, 300, 620);

    // FlowOS branding
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 28px Inter, system-ui';
    ctx.fillText('FlowOS', 300, 720);
    ctx.fillStyle = '#71717a';
    ctx.font = '16px Inter, system-ui';
    ctx.fillText('by H2H Inner Lab', 300, 750);

    // Download
    const link = document.createElement('a');
    link.download = `flowos-badge-${badge.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setIsGenerating(false);
    toast.success('Badge image downloaded!');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-background rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Share Your Achievement
              </h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Badge Preview */}
            <div ref={badgeRef} className="mb-6">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 20px rgba(99, 102, 241, 0.3)',
                    '0 0 40px rgba(99, 102, 241, 0.5)',
                    '0 0 20px rgba(99, 102, 241, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={`relative rounded-2xl p-6 bg-gradient-to-br ${TIER_COLORS[badge.tier]} border-2 ${TIER_BORDERS[badge.tier]}`}
              >
                {/* Sparkle effects */}
                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [0, 1, 0],
                        opacity: [0, 1, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.4,
                      }}
                      className="absolute w-2 h-2 bg-white rounded-full"
                      style={{
                        left: `${20 + i * 15}%`,
                        top: `${20 + (i % 3) * 20}%`,
                      }}
                    />
                  ))}
                </div>

                <div className="relative text-center text-white">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
                  >
                    <span className="text-4xl font-bold">{badge.level}</span>
                  </motion.div>
                  
                  <h3 className="text-2xl font-display font-bold mb-1">{badge.title}</h3>
                  <p className="text-white/80 text-sm mb-4">Level {badge.level} • {badge.tier.charAt(0).toUpperCase() + badge.tier.slice(1)}</p>
                  
                  <div className="flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <Flame className="w-4 h-4" />
                      <span>{badge.streak} streak</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>{badge.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-white/60 mt-4">FlowOS by H2H Inner Lab</p>
                </div>
              </motion.div>
            </div>

            {/* Share Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={handleShareTwitter}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Twitter className="w-5 h-5 text-sky-500" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareLinkedIn}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareFacebook}
                  className="flex flex-col items-center gap-1 h-auto py-3"
                >
                  <Facebook className="w-5 h-5 text-blue-500" />
                  <span className="text-xs">Facebook</span>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleCopyText}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Text
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownloadBadge}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'Creating...' : 'Download'}
                </Button>
              </div>

              {navigator.share && (
                <Button onClick={handleNativeShare} className="w-full gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
            </div>

            {/* Preview text */}
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <p className="text-xs text-muted-foreground mb-2">Share message preview:</p>
              <p className="text-sm whitespace-pre-line">{shareText}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
