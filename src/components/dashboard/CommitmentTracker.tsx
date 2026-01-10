import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Calendar, CheckCircle2, XCircle, Clock, 
  ChevronDown, ChevronUp, Sparkles, Award, TrendingUp,
  MessageSquare, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCommitments, Commitment, CommitmentLog } from '@/hooks/useCommitments';
import { Progress } from '@/components/ui/progress';

interface CommitmentTrackerProps {
  expanded?: boolean;
}

export const CommitmentTracker = ({ expanded = false }: CommitmentTrackerProps) => {
  const { 
    getActiveCommitments, 
    getCompletedCommitments, 
    logCheckIn, 
    completeCommitment,
    getCommitmentLogs,
    loading 
  } = useCommitments();
  
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [selectedCommitment, setSelectedCommitment] = useState<Commitment | null>(null);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [checkInData, setCheckInData] = useState({
    practiced: true,
    notes: '',
    moodBefore: 3,
    moodAfter: 3,
  });
  const [completionReflection, setCompletionReflection] = useState('');
  const [logs, setLogs] = useState<CommitmentLog[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const activeCommitments = getActiveCommitments();
  const completedCommitments = getCompletedCommitments();
  const currentCommitment = activeCommitments[0];

  useEffect(() => {
    if (currentCommitment) {
      getCommitmentLogs(currentCommitment.id).then(setLogs);
    }
  }, [currentCommitment]);

  if (loading) {
    return (
      <div className="glass-surface rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-muted/50 rounded w-1/3 mb-4" />
        <div className="h-20 bg-muted/30 rounded" />
      </div>
    );
  }

  if (!currentCommitment && completedCommitments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-surface rounded-2xl p-6 text-center"
      >
        <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Active Commitments</h3>
        <p className="text-sm text-muted-foreground">
          Complete the onboarding assessment to set your first Iceberg Commitment.
        </p>
      </motion.div>
    );
  }

  const calculateDaysRemaining = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateProgress = (commitment: Commitment) => {
    const created = new Date(commitment.created_at);
    const deadline = new Date(commitment.deadline);
    const now = new Date();
    const totalDays = Math.ceil((deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    const elapsed = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(100, Math.round((elapsed / totalDays) * 100));
  };

  const hasCheckedInToday = () => {
    if (!logs.length) return false;
    const today = new Date().toISOString().split('T')[0];
    return logs.some(log => log.log_date === today);
  };

  const handleCheckIn = async () => {
    if (!currentCommitment) return;
    setSubmitting(true);
    try {
      await logCheckIn(
        currentCommitment.id,
        checkInData.practiced,
        checkInData.notes,
        checkInData.moodBefore,
        checkInData.moodAfter
      );
      const newLogs = await getCommitmentLogs(currentCommitment.id);
      setLogs(newLogs);
      setShowCheckIn(false);
      setCheckInData({ practiced: true, notes: '', moodBefore: 3, moodAfter: 3 });
    } catch (err) {
      console.error('Check-in failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!currentCommitment) return;
    setSubmitting(true);
    try {
      await completeCommitment(currentCommitment.id, completionReflection);
      setShowCompletion(false);
      setCompletionReflection('');
    } catch (err) {
      console.error('Completion failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const daysRemaining = currentCommitment ? calculateDaysRemaining(currentCommitment.deadline) : 0;
  const progress = currentCommitment ? calculateProgress(currentCommitment) : 0;
  const checkedInToday = hasCheckedInToday();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-6 cursor-pointer hover:bg-muted/20 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Iceberg Commitment</h3>
              <p className="text-sm text-muted-foreground">
                {currentCommitment 
                  ? `${daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Deadline reached!'}`
                  : `${completedCommitments.length} completed`
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentCommitment && (
              <>
                {checkedInToday ? (
                  <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Checked in
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    Check in today
                  </span>
                )}
              </>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Progress bar preview */}
        {currentCommitment && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{currentCommitment.days_practiced} days practiced</span>
              <span>{progress}% through journey</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && currentCommitment && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-border/50"
          >
            <div className="p-6 space-y-6">
              {/* Commitment summary */}
              <div className="space-y-4">
                <div className="p-4 bg-muted/20 rounded-xl">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Your Commitment
                  </h4>
                  <p className="text-sm text-foreground">{currentCommitment.commitment}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-muted/20 rounded-xl text-center">
                    <Calendar className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{daysRemaining}</p>
                    <p className="text-xs text-muted-foreground">Days left</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl text-center">
                    <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">{currentCommitment.days_practiced}</p>
                    <p className="text-xs text-muted-foreground">Practiced</p>
                  </div>
                  <div className="p-3 bg-muted/20 rounded-xl text-center">
                    <Award className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">
                      {logs.length > 0 
                        ? Math.round((logs.filter(l => l.practiced).length / logs.length) * 100)
                        : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </div>
                </div>
              </div>

              {/* Check-in section */}
              {!showCheckIn && !showCompletion && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCheckIn(true)}
                    disabled={checkedInToday}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {checkedInToday ? 'Already checked in' : 'Daily Check-in'}
                  </Button>
                  {daysRemaining <= 0 && (
                    <Button
                      onClick={() => setShowCompletion(true)}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      Complete Journey
                    </Button>
                  )}
                </div>
              )}

              {/* Check-in form */}
              <AnimatePresence>
                {showCheckIn && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 p-4 bg-muted/10 rounded-xl border border-border/50"
                  >
                    <h4 className="font-medium text-foreground">Daily Check-in</h4>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Did you practice your commitment today?
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCheckInData({ ...checkInData, practiced: true })}
                          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            checkInData.practiced 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Yes
                        </button>
                        <button
                          onClick={() => setCheckInData({ ...checkInData, practiced: false })}
                          className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            !checkInData.practiced 
                              ? 'bg-destructive text-destructive-foreground' 
                              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          <XCircle className="w-4 h-4" />
                          No
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        How did you feel before? (1-5)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCheckInData({ ...checkInData, moodBefore: n })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              checkInData.moodBefore === n
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        How did you feel after? (1-5)
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCheckInData({ ...checkInData, moodAfter: n })}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                              checkInData.moodAfter === n
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50 hover:bg-muted'
                            }`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        Notes (optional)
                      </label>
                      <textarea
                        value={checkInData.notes}
                        onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
                        placeholder="Any reflections on today's practice..."
                        className="w-full h-20 bg-muted/50 border border-border/50 rounded-xl p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCheckIn(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCheckIn}
                        disabled={submitting}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {submitting ? 'Saving...' : 'Save Check-in'}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completion form */}
              <AnimatePresence>
                {showCompletion && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4 p-4 bg-primary/5 rounded-xl border border-primary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Complete Your Journey</h4>
                        <p className="text-sm text-muted-foreground">Reflect on your transformation</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground mb-2 block">
                        How has this commitment changed you?
                      </label>
                      <textarea
                        value={completionReflection}
                        onChange={(e) => setCompletionReflection(e.target.value)}
                        placeholder="Describe the transformation you've experienced..."
                        className="w-full h-32 bg-muted/50 border border-border/50 rounded-xl p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setShowCompletion(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={submitting || !completionReflection.trim()}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {submitting ? 'Completing...' : 'Complete Journey'}
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recent logs */}
              {logs.length > 0 && !showCheckIn && !showCompletion && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Recent Check-ins
                  </h4>
                  <div className="space-y-2">
                    {logs.slice(0, 5).map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {log.practiced ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive" />
                          )}
                          <span className="text-sm text-foreground">
                            {new Date(log.log_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        {log.notes && (
                          <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Completed commitments preview */}
      {isExpanded && completedCommitments.length > 0 && (
        <div className="border-t border-border/50 p-6">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
            Completed Journeys
          </h4>
          <div className="space-y-2">
            {completedCommitments.slice(0, 3).map((commitment) => (
              <div 
                key={commitment.id}
                className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
              >
                <Award className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{commitment.commitment}</p>
                  <p className="text-xs text-muted-foreground">
                    Completed {new Date(commitment.completed_at!).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
