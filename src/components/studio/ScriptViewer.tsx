import { motion } from 'framer-motion';
import { X, Volume2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

interface ScriptViewerProps {
  script: string;
  title: string;
  onClose: () => void;
}

export const ScriptViewer = ({ script, title, onClose }: ScriptViewerProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      toast.success('Script copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl glass-surface rounded-2xl p-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground">
                {title}
              </h2>
              <p className="text-xs text-muted-foreground">AI-Generated Script</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Script Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="prose prose-sm prose-invert max-w-none">
            <div className="bg-muted/30 rounded-xl p-6 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {script}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-medium">Tip:</span> This script is designed to be read aloud or used with a text-to-speech service. Copy it to use in your preferred audio tool.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
