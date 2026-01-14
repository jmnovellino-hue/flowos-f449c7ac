import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Sparkles,
  ChevronRight,
  X,
  Link2,
  Unlink,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Loader2,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface CalendarEvent {
  google_event_id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  location: string | null;
  attendees: any[];
  impact_rating: number | null;
  pre_meeting_insight: string | null;
  post_meeting_reflection: string | null;
}

interface CalendarSyncProps {
  isOpen: boolean;
  onClose: () => void;
}

const IMPACT_RATINGS = [
  { value: -3, label: 'Very Draining', icon: ThumbsDown, color: 'text-destructive' },
  { value: -2, label: 'Draining', icon: ThumbsDown, color: 'text-destructive/70' },
  { value: -1, label: 'Slightly Draining', icon: Minus, color: 'text-muted-foreground' },
  { value: 0, label: 'Neutral', icon: Minus, color: 'text-muted-foreground' },
  { value: 1, label: 'Slightly Energizing', icon: ThumbsUp, color: 'text-primary/70' },
  { value: 2, label: 'Energizing', icon: ThumbsUp, color: 'text-primary' },
  { value: 3, label: 'Very Energizing', icon: ThumbsUp, color: 'text-secondary' },
];

export const CalendarSync = ({ isOpen, onClose }: CalendarSyncProps) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [reflection, setReflection] = useState('');
  const [showReflectionInput, setShowReflectionInput] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      checkConnection();
    }
  }, [isOpen, user]);

  const checkConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-sync', {
        body: { action: 'fetch_events' },
      });

      if (error) throw error;

      if (data.needsAuth) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Error checking calendar connection:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // Get the OAuth URL from our backend
      const redirectUri = `${window.location.origin}/calendar-callback`;
      
      const { data, error } = await supabase.functions.invoke('google-calendar-auth', {
        body: { action: 'get_auth_url', redirectUri },
      });

      if (error) throw error;

      if (data.error) {
        // OAuth not configured - show helpful message
        toast.error(data.message || 'Google Calendar OAuth is not configured');
        return;
      }

      if (data.authUrl) {
        // Store state for verification
        localStorage.setItem('gcal_oauth_state', data.state);
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Error starting OAuth:', error);
      toast.error('Failed to start Google Calendar connection');
    }
  };

  const handleDisconnect = async () => {
    try {
      await supabase.functions.invoke('calendar-sync', {
        body: { action: 'disconnect' },
      });
      setIsConnected(false);
      setEvents([]);
      toast.success('Calendar disconnected');
    } catch (error) {
      toast.error('Failed to disconnect calendar');
    }
  };

  const handleRateEvent = async (eventId: string, rating: number) => {
    try {
      await supabase.functions.invoke('calendar-sync', {
        body: { action: 'rate_event', eventId, impactRating: rating },
      });
      
      setEvents(events.map(e => 
        e.google_event_id === eventId ? { ...e, impact_rating: rating } : e
      ));
      
      if (selectedEvent?.google_event_id === eventId) {
        setSelectedEvent({ ...selectedEvent, impact_rating: rating });
      }
      
      toast.success('Event rated!');
    } catch (error) {
      toast.error('Failed to rate event');
    }
  };

  const handleGetInsight = async (event: CalendarEvent, type: 'pre' | 'post') => {
    setIsGeneratingInsight(true);
    try {
      const { data, error } = await supabase.functions.invoke('calendar-insights', {
        body: { event, type },
      });

      if (error) throw error;

      if (data.insight) {
        setEvents(events.map(e => 
          e.google_event_id === event.google_event_id 
            ? { ...e, pre_meeting_insight: type === 'pre' ? data.insight : e.pre_meeting_insight }
            : e
        ));
        
        if (selectedEvent?.google_event_id === event.google_event_id) {
          setSelectedEvent({ 
            ...selectedEvent, 
            pre_meeting_insight: type === 'pre' ? data.insight : selectedEvent.pre_meeting_insight 
          });
        }
        
        toast.success('Insight generated!');
      }
    } catch (error: any) {
      if (error.message?.includes('429')) {
        toast.error('Rate limited. Please try again later.');
      } else {
        toast.error('Failed to generate insight');
      }
    } finally {
      setIsGeneratingInsight(false);
    }
  };

  const handleSaveReflection = async () => {
    if (!selectedEvent || !reflection.trim()) return;

    try {
      await supabase.functions.invoke('calendar-sync', {
        body: { 
          action: 'add_reflection', 
          eventId: selectedEvent.google_event_id, 
          reflection 
        },
      });

      setEvents(events.map(e => 
        e.google_event_id === selectedEvent.google_event_id 
          ? { ...e, post_meeting_reflection: reflection }
          : e
      ));
      
      setSelectedEvent({ ...selectedEvent, post_meeting_reflection: reflection });
      setShowReflectionInput(false);
      setReflection('');
      toast.success('Reflection saved!');
    } catch (error) {
      toast.error('Failed to save reflection');
    }
  };

  const formatEventTime = (startTime: string) => {
    const date = parseISO(startTime);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'EEE, MMM d at h:mm a');
  };

  const getImpactColor = (rating: number | null) => {
    if (rating === null) return 'bg-muted';
    if (rating > 0) return 'bg-primary/20 border-primary/50';
    if (rating < 0) return 'bg-destructive/20 border-destructive/50';
    return 'bg-muted';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] bg-background/95 backdrop-blur-xl overflow-auto"
        >
          <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <CalendarDays className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground">Calendar Sync</h1>
                  <p className="text-sm text-muted-foreground">Prepare for and reflect on your events</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConnected && (
                  <Button variant="outline" size="sm" onClick={handleDisconnect}>
                    <Unlink className="w-4 h-4 mr-2" />
                    Disconnect
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : !isConnected ? (
              /* Connection Screen */
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass-surface rounded-2xl p-8 text-center max-w-md mx-auto"
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-display font-semibold mb-3">Connect Your Calendar</h2>
                <p className="text-muted-foreground mb-6">
                  Sync your Google Calendar to get proactive insights before meetings and reflection prompts afterward.
                </p>
                <Button onClick={handleConnect} className="gap-2">
                  <Link2 className="w-4 h-4" />
                  Connect Google Calendar
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Configure OAuth in your backend settings to enable calendar sync.
                </p>
              </motion.div>
            ) : (
              /* Events View */
              <div className="grid gap-6 md:grid-cols-2">
                {/* Event List */}
                <div className="space-y-4">
                  <h2 className="font-medium text-lg flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    Upcoming Events
                  </h2>
                  
                  {events.length === 0 ? (
                    <div className="glass-surface rounded-xl p-6 text-center">
                      <p className="text-muted-foreground">No upcoming events in the next 7 days</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <motion.button
                          key={event.google_event_id}
                          onClick={() => setSelectedEvent(event)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            selectedEvent?.google_event_id === event.google_event_id
                              ? 'bg-primary/10 border-primary/50'
                              : `${getImpactColor(event.impact_rating)} hover:bg-muted/50`
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{event.title}</h3>
                              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatEventTime(event.start_time)}
                              </p>
                              {event.location && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                  <MapPin className="w-3 h-3" />
                                  {event.location}
                                </p>
                              )}
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                          </div>
                          
                          {event.impact_rating !== null && (
                            <div className="mt-2 flex items-center gap-1">
                              {IMPACT_RATINGS.find(r => r.value === event.impact_rating) && (
                                <span className={`text-xs ${IMPACT_RATINGS.find(r => r.value === event.impact_rating)?.color}`}>
                                  {IMPACT_RATINGS.find(r => r.value === event.impact_rating)?.label}
                                </span>
                              )}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Event Detail */}
                <div>
                  <AnimatePresence mode="wait">
                    {selectedEvent ? (
                      <motion.div
                        key={selectedEvent.google_event_id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-surface rounded-xl p-6 sticky top-6"
                      >
                        <h2 className="text-xl font-display font-semibold mb-2">{selectedEvent.title}</h2>
                        <p className="text-sm text-muted-foreground mb-4">
                          {formatEventTime(selectedEvent.start_time)}
                        </p>

                        {selectedEvent.description && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {selectedEvent.description}
                          </p>
                        )}

                        {selectedEvent.attendees?.length > 0 && (
                          <div className="flex items-center gap-2 mb-4">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {selectedEvent.attendees.length} attendee(s)
                            </span>
                          </div>
                        )}

                        {/* Impact Rating */}
                        <div className="mb-6">
                          <label className="text-sm font-medium mb-3 block">How do you anticipate this event?</label>
                          <div className="flex flex-wrap gap-2">
                            {IMPACT_RATINGS.map((rating) => (
                              <button
                                key={rating.value}
                                onClick={() => handleRateEvent(selectedEvent.google_event_id, rating.value)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                  selectedEvent.impact_rating === rating.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80'
                                }`}
                              >
                                {rating.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Pre-meeting Insight */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-secondary" />
                              Pre-Meeting Insight
                            </label>
                            {!selectedEvent.pre_meeting_insight && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGetInsight(selectedEvent, 'pre')}
                                disabled={isGeneratingInsight}
                              >
                                {isGeneratingInsight ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Generate
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                          {selectedEvent.pre_meeting_insight ? (
                            <p className="text-sm bg-secondary/10 rounded-lg p-3 border border-secondary/20">
                              {selectedEvent.pre_meeting_insight}
                            </p>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Get AI-powered preparation insights for this event
                            </p>
                          )}
                        </div>

                        {/* Post-meeting Reflection */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                              <MessageSquare className="w-4 h-4 text-primary" />
                              Post-Meeting Reflection
                            </label>
                            {!showReflectionInput && !selectedEvent.post_meeting_reflection && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowReflectionInput(true)}
                              >
                                Add Reflection
                              </Button>
                            )}
                          </div>
                          {selectedEvent.post_meeting_reflection ? (
                            <p className="text-sm bg-primary/10 rounded-lg p-3 border border-primary/20">
                              {selectedEvent.post_meeting_reflection}
                            </p>
                          ) : showReflectionInput ? (
                            <div className="space-y-2">
                              <Textarea
                                value={reflection}
                                onChange={(e) => setReflection(e.target.value)}
                                placeholder="How did the event go? What did you learn?"
                                className="min-h-[100px]"
                              />
                              <div className="flex gap-2">
                                <Button size="sm" onClick={handleSaveReflection}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowReflectionInput(false)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground italic">
                              Add a reflection after the event
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="glass-surface rounded-xl p-8 text-center"
                      >
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Select an event to view details and get insights</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
