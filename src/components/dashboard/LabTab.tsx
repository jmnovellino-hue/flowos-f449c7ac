import { motion } from 'framer-motion';
import { Brain, Moon, Utensils, Activity, Lock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

const bioMetrics = [
  { id: 'sleep', label: 'Sleep Quality', icon: Moon, value: 7, max: 10, color: 'primary' },
  { id: 'nutrition', label: 'Nutrition', icon: Utensils, value: 6, max: 10, color: 'secondary' },
  { id: 'movement', label: 'Movement', icon: Activity, value: 8, max: 10, color: 'accent' },
];

const insights = [
  {
    type: 'warning',
    title: 'PFC Glucose Alert',
    message: 'Based on 5.5h sleep, expect reduced emotional regulation today. Consider delaying sensitive feedback sessions.',
  },
  {
    type: 'tip',
    title: 'Optimal Window',
    message: 'Your cortisol peaks at 10am. Schedule your most challenging work between 9-11am.',
  },
  {
    type: 'insight',
    title: 'Pattern Detected',
    message: 'Your decision quality drops 23% after skipping breakfast. Prioritize morning nutrition.',
  },
];

export const LabTab = () => {
  const [metrics, setMetrics] = useState({
    sleep: 7,
    nutrition: 6,
    movement: 8,
  });
  const [isPremium] = useState(true); // Toggle to show locked state

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto pb-24 md:pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-2">
          The Lab
        </h1>
        <p className="text-lg text-muted-foreground">
          Physiology dictates Psychology. Track your bio-foundation.
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bio Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Today's Bio-Foundation</span>
            </div>

            <div className="space-y-6">
              {bioMetrics.map((metric) => (
                <div key={metric.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${metric.color}/10 flex items-center justify-center`}>
                        <metric.icon className={`w-5 h-5 text-${metric.color}`} />
                      </div>
                      <span className="font-medium text-foreground">{metric.label}</span>
                    </div>
                    <span className="text-2xl font-display font-semibold text-foreground">
                      {metrics[metric.id as keyof typeof metrics]}/{metric.max}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={metrics[metric.id as keyof typeof metrics]}
                    onChange={(e) => setMetrics({ ...metrics, [metric.id]: parseInt(e.target.value) })}
                    className="w-full accent-primary h-2 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <Button className="w-full mt-6 bg-primary hover:bg-primary/90 glow-emerald">
              Log Today's Metrics
            </Button>
          </motion.div>

          {/* Weekly Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground">7-Day Trends</span>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="text-center">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <div className="mt-2 space-y-1">
                    <div 
                      className="h-8 rounded bg-primary/20"
                      style={{ 
                        height: `${20 + Math.random() * 40}px`,
                        opacity: i === 6 ? 0.3 : 1
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary" />
                <span className="text-muted-foreground">Sleep</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-secondary" />
                <span className="text-muted-foreground">Nutrition</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-accent" />
                <span className="text-muted-foreground">Movement</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Neuro-Analysis Section */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`glass-surface rounded-2xl p-6 relative overflow-hidden ${!isPremium ? 'select-none' : ''}`}
          >
            {!isPremium && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground text-center px-4 mb-4">
                  Upgrade to Architect tier for Neuro-Analysis
                </p>
                <Button size="sm" className="bg-primary">
                  Upgrade Now
                </Button>
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                Neuro-Analysis
              </span>
            </div>

            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl ${
                    insight.type === 'warning' 
                      ? 'bg-destructive/10 border border-destructive/20' 
                      : 'bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {insight.type === 'warning' && (
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-surface rounded-2xl p-6"
          >
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Bio-Foundation Score
              </p>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="8"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(7/10) * 352} 352`}
                    className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-display font-bold text-foreground">70</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Good foundation for leadership performance
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
