// Content Notification Service for H2H FlowOS
// Manages notifications for podcasts, insights, advice, and affirmations

export type NotificationType = 
  | 'podcast'
  | 'content'
  | 'insight'
  | 'advice'
  | 'affirmation';

export interface ContentNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Daily affirmations pool
const affirmations = [
  "I lead with authenticity and purpose.",
  "My awareness creates transformation.",
  "I embrace growth through every challenge.",
  "My influence ripples through conscious action.",
  "I am the architect of my leadership journey.",
  "Today, I choose presence over perfection.",
  "My shadow teaches me what my light cannot.",
  "I lead others by first leading myself.",
  "Every decision aligns with my core values.",
  "I transform pressure into purpose.",
];

// Leadership insights pool
const insights = [
  { title: "The Hero's Paradox", body: "Your drive to achieve can become the very thing that blocks your team's growth. Today, practice asking instead of telling." },
  { title: "Shadow Integration", body: "What frustrates you most in others often reflects an unowned part of yourself. Use it as a mirror." },
  { title: "Values Alignment", body: "When a decision feels heavy, check if it conflicts with your core values. Misalignment creates inner resistance." },
  { title: "Presence Over Productivity", body: "Being fully present in one conversation beats being half-present in five. Quality of attention matters." },
  { title: "The Servant's Strength", body: "True service comes from overflow, not depletion. Fill your own cup first." },
];

// Leadership advice pool
const advicePool = [
  { title: "Before Your Next Meeting", body: "Take 3 deep breaths and set an intention. What quality do you want to embody in this interaction?" },
  { title: "End of Day Reflection", body: "Ask yourself: 'Did I lead from my archetype's strengths or its shadow today?'" },
  { title: "Conflict Navigation", body: "When tensions rise, get curious instead of defensive. Ask: 'What need is driving this behavior?'" },
  { title: "Decision Making", body: "For major decisions, consult your values first, data second. Values provide direction; data provides detail." },
  { title: "Energy Management", body: "Protect your peak energy hours for strategic thinking. Admin tasks can wait for your valleys." },
];

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Get notification preferences from localStorage
export const getNotificationPreferences = (): Record<NotificationType, boolean> => {
  const stored = localStorage.getItem('h2h_notification_preferences');
  return stored ? JSON.parse(stored) : {
    podcast: true,
    content: true,
    insight: true,
    advice: true,
    affirmation: true,
  };
};

// Save notification preferences
export const saveNotificationPreferences = (prefs: Record<NotificationType, boolean>): void => {
  localStorage.setItem('h2h_notification_preferences', JSON.stringify(prefs));
};

// Get all notifications from localStorage
export const getNotifications = (): ContentNotification[] => {
  const stored = localStorage.getItem('h2h_notifications');
  return stored ? JSON.parse(stored) : [];
};

// Save notifications
export const saveNotifications = (notifications: ContentNotification[]): void => {
  // Keep only last 50 notifications
  const trimmed = notifications.slice(-50);
  localStorage.setItem('h2h_notifications', JSON.stringify(trimmed));
};

// Mark notification as read
export const markAsRead = (notificationId: string): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
};

// Mark all as read
export const markAllAsRead = (): void => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
};

// Get unread count
export const getUnreadCount = (): number => {
  return getNotifications().filter(n => !n.read).length;
};

// Generate unique ID
const generateId = (): string => {
  return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Show browser notification
const showBrowserNotification = (title: string, body: string, icon?: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'h2h-content',
      requireInteraction: false,
    });
  }
};

// Add a new notification
export const addNotification = (
  type: NotificationType,
  title: string,
  body: string,
  actionUrl?: string
): ContentNotification => {
  const notification: ContentNotification = {
    id: generateId(),
    type,
    title,
    body,
    timestamp: new Date().toISOString(),
    read: false,
    actionUrl,
  };

  const notifications = getNotifications();
  notifications.push(notification);
  saveNotifications(notifications);

  // Show browser notification if enabled
  const prefs = getNotificationPreferences();
  if (prefs[type]) {
    showBrowserNotification(title, body);
  }

  return notification;
};

// Send daily affirmation
export const sendDailyAffirmation = (): void => {
  const lastAffirmation = localStorage.getItem('h2h_last_affirmation');
  const today = new Date().toDateString();

  if (lastAffirmation === today) return;

  const prefs = getNotificationPreferences();
  if (!prefs.affirmation) return;

  const affirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
  addNotification('affirmation', '✨ Daily Affirmation', affirmation);
  localStorage.setItem('h2h_last_affirmation', today);
};

// Send daily insight
export const sendDailyInsight = (): void => {
  const lastInsight = localStorage.getItem('h2h_last_insight');
  const today = new Date().toDateString();

  if (lastInsight === today) return;

  const prefs = getNotificationPreferences();
  if (!prefs.insight) return;

  const insight = insights[Math.floor(Math.random() * insights.length)];
  addNotification('insight', `💡 ${insight.title}`, insight.body);
  localStorage.setItem('h2h_last_insight', today);
};

// Send leadership advice
export const sendDailyAdvice = (): void => {
  const lastAdvice = localStorage.getItem('h2h_last_advice');
  const today = new Date().toDateString();

  if (lastAdvice === today) return;

  const prefs = getNotificationPreferences();
  if (!prefs.advice) return;

  const advice = advicePool[Math.floor(Math.random() * advicePool.length)];
  addNotification('advice', `🎯 ${advice.title}`, advice.body);
  localStorage.setItem('h2h_last_advice', today);
};

// Check for new podcast episodes (simulated - would connect to RSS in production)
export const checkNewPodcastEpisode = (): void => {
  const lastCheck = localStorage.getItem('h2h_last_podcast_check');
  const now = Date.now();

  // Only check once per day
  if (lastCheck && now - parseInt(lastCheck) < 24 * 60 * 60 * 1000) return;

  const prefs = getNotificationPreferences();
  if (!prefs.podcast) return;

  // Simulate new episode check - in production, this would fetch from RSS/API
  // For now, we'll show a notification weekly
  const lastNotified = localStorage.getItem('h2h_last_podcast_notification');
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  if (!lastNotified || parseInt(lastNotified) < weekAgo) {
    addNotification(
      'podcast',
      '🎙️ New H2H Podcast Episode',
      'A new episode of The H2H Experiment is now available. Tune in for fresh leadership insights!',
      'https://open.spotify.com/show/2ETfRLDqlvv2kfH6y8vs69'
    );
    localStorage.setItem('h2h_last_podcast_notification', now.toString());
  }

  localStorage.setItem('h2h_last_podcast_check', now.toString());
};

// Initialize all content notifications
export const initializeContentNotifications = async (): Promise<void> => {
  // Request permission first
  await requestNotificationPermission();

  // Send daily content
  sendDailyAffirmation();
  
  // Stagger other notifications throughout the day
  setTimeout(() => sendDailyInsight(), 2 * 60 * 60 * 1000); // 2 hours later
  setTimeout(() => sendDailyAdvice(), 4 * 60 * 60 * 1000); // 4 hours later

  // Check for new podcast
  checkNewPodcastEpisode();

  // Set up periodic checks (every 6 hours)
  setInterval(() => {
    checkNewPodcastEpisode();
  }, 6 * 60 * 60 * 1000);
};

// Get notification type icon
export const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'podcast': return '🎙️';
    case 'content': return '📚';
    case 'insight': return '💡';
    case 'advice': return '🎯';
    case 'affirmation': return '✨';
    default: return '🔔';
  }
};

// Get notification type label
export const getNotificationLabel = (type: NotificationType): string => {
  switch (type) {
    case 'podcast': return 'Podcast';
    case 'content': return 'New Content';
    case 'insight': return 'Insight';
    case 'advice': return 'Advice';
    case 'affirmation': return 'Affirmation';
    default: return 'Notification';
  }
};
