import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Bell,
  BellOff,
  Check,
  X,
  Moon,
  Utensils,
  Activity,
  Timer,
  Droplets,
  Wind,
  BookHeart,
  Loader2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun', fullLabel: 'Sunday' },
  { id: 1, label: 'Mon', fullLabel: 'Monday' },
  { id: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { id: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { id: 4, label: 'Thu', fullLabel: 'Thursday' },
  { id: 5, label: 'Fri', fullLabel: 'Friday' },
  { id: 6, label: 'Sat', fullLabel: 'Saturday' },
];

const ACTIVITY_CATEGORIES = [
  { id: 'sleep', label: 'Sleep Routine', icon: Moon, color: 'primary' },
  { id: 'nutrition', label: 'Nutrition Check', icon: Utensils, color: 'secondary' },
  { id: 'exercise', label: 'Exercise Session', icon: Activity, color: 'accent' },
  { id: 'meditation', label: 'Meditation', icon: Timer, color: 'primary' },
  { id: 'hydration', label: 'Hydration Check', icon: Droplets, color: 'secondary' },
  { id: 'breathwork', label: 'Breathwork', icon: Wind, color: 'accent' },
  { id: 'reflection', label: 'Journaling', icon: BookHeart, color: 'primary' },
];

interface Routine {
  id: string;
  title: string;
  category: string;
  description: string | null;
  days_of_week: number[];
  time_of_day: string;
  reminder_enabled: boolean;
  is_active: boolean;
}

export const RoutineScheduler = () => {
  const { user } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'meditation',
    description: '',
    days_of_week: [] as number[],
    time_of_day: '09:00',
    reminder_enabled: true,
  });

  useEffect(() => {
    if (user?.id) {
      loadRoutines();
    }
  }, [user?.id]);

  const loadRoutines = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('time_of_day', { ascending: true });

      if (error) throw error;
      setRoutines(data || []);
    } catch (error: any) {
      console.error('Error loading routines:', error);
      toast.error('Failed to load routines');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayToggle = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId].sort((a, b) => a - b),
    }));
  };

  const handleCreateRoutine = async () => {
    if (!user?.id) {
      toast.error('Please sign in to create routines');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a routine name');
      return;
    }

    if (formData.days_of_week.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from('routines').insert({
        user_id: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description || null,
        days_of_week: formData.days_of_week,
        time_of_day: formData.time_of_day,
        reminder_enabled: formData.reminder_enabled,
      });

      if (error) throw error;

      toast.success('Routine created! 🎯');
      setIsDialogOpen(false);
      resetForm();
      loadRoutines();
    } catch (error: any) {
      console.error('Error creating routine:', error);
      toast.error(error.message || 'Failed to create routine');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    try {
      const { error } = await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('id', routineId);

      if (error) throw error;

      setRoutines(prev => prev.filter(r => r.id !== routineId));
      toast.success('Routine removed');
    } catch (error: any) {
      console.error('Error deleting routine:', error);
      toast.error('Failed to remove routine');
    }
  };

  const handleToggleReminder = async (routineId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('routines')
        .update({ reminder_enabled: enabled })
        .eq('id', routineId);

      if (error) throw error;

      setRoutines(prev =>
        prev.map(r =>
          r.id === routineId ? { ...r, reminder_enabled: enabled } : r
        )
      );
      toast.success(enabled ? 'Reminders enabled' : 'Reminders disabled');
    } catch (error: any) {
      console.error('Error toggling reminder:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'meditation',
      description: '',
      days_of_week: [],
      time_of_day: '09:00',
      reminder_enabled: true,
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return ACTIVITY_CATEGORIES.find(c => c.id === categoryId) || ACTIVITY_CATEGORIES[0];
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getScheduledDays = (days: number[]) => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Weekdays';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Weekends';
    return days.map(d => DAYS_OF_WEEK[d].label).join(', ');
  };

  if (isLoading) {
    return (
      <div className="glass-surface rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-surface rounded-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground">Routine Scheduler</h3>
              <p className="text-sm text-muted-foreground">Set regular wellness routines with reminders</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Routine
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-display">Create New Routine</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Routine Name</Label>
                  <Input
                    placeholder="e.g., Morning Meditation"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input
                    type="time"
                    value={formData.time_of_day}
                    onChange={(e) => setFormData(prev => ({ ...prev, time_of_day: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Days of Week</Label>
                  <div className="flex gap-1">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleDayToggle(day.id)}
                        className={`flex-1 py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                          formData.days_of_week.includes(day.id)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">Enable reminders</span>
                  </div>
                  <Switch
                    checked={formData.reminder_enabled}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({ ...prev, reminder_enabled: checked }))
                    }
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleCreateRoutine}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Routine'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="divide-y divide-border">
        <AnimatePresence>
          {routines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">No routines scheduled yet</p>
              <p className="text-sm text-muted-foreground/70">Create your first routine to build consistent habits</p>
            </motion.div>
          ) : (
            routines.map((routine) => {
              const category = getCategoryInfo(routine.category);
              const Icon = category.icon;
              const isExpanded = expandedRoutine === routine.id;

              return (
                <motion.div
                  key={routine.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => setExpandedRoutine(isExpanded ? null : routine.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${category.color}/10 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${category.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{routine.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(routine.time_of_day)}</span>
                          <span>•</span>
                          <span>{getScheduledDays(routine.days_of_week)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReminder(routine.id, !routine.reminder_enabled);
                          }}
                          className={`p-2 rounded-lg transition-colors ${
                            routine.reminder_enabled
                              ? 'text-primary hover:bg-primary/10'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {routine.reminder_enabled ? (
                            <Bell className="w-4 h-4" />
                          ) : (
                            <BellOff className="w-4 h-4" />
                          )}
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 pt-4 border-t border-border"
                      >
                        <div className="flex flex-wrap gap-2 mb-4">
                          {DAYS_OF_WEEK.map((day) => (
                            <span
                              key={day.id}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                routine.days_of_week.includes(day.id)
                                  ? 'bg-primary/20 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {day.fullLabel}
                            </span>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoutine(routine.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Routine
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
