// Notification utility for commitment reminders

export interface IcebergCommitment {
  id: string;
  behavior: string;
  feeling: string;
  belief: string;
  commitment: string;
  deadline: string;
  createdAt: string;
  reminderEnabled: boolean;
}

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

// Save commitment to localStorage
export const saveCommitment = (commitment: IcebergCommitment): void => {
  const commitments = getCommitments();
  const existingIndex = commitments.findIndex(c => c.id === commitment.id);
  
  if (existingIndex >= 0) {
    commitments[existingIndex] = commitment;
  } else {
    commitments.push(commitment);
  }
  
  localStorage.setItem('iceberg_commitments', JSON.stringify(commitments));
};

// Get all commitments from localStorage
export const getCommitments = (): IcebergCommitment[] => {
  const stored = localStorage.getItem('iceberg_commitments');
  return stored ? JSON.parse(stored) : [];
};

// Get active commitments (not past deadline)
export const getActiveCommitments = (): IcebergCommitment[] => {
  const commitments = getCommitments();
  const now = new Date();
  return commitments.filter(c => new Date(c.deadline) >= now && c.reminderEnabled);
};

// Show a notification
export const showNotification = (title: string, body: string, icon?: string): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'iceberg-reminder',
      requireInteraction: false,
    });
  }
};

// Check and show reminders for active commitments
export const checkAndShowReminders = (): void => {
  const activeCommitments = getActiveCommitments();
  const lastReminderDate = localStorage.getItem('last_reminder_date');
  const today = new Date().toDateString();

  // Only show one reminder per day
  if (lastReminderDate === today) {
    return;
  }

  activeCommitments.forEach(commitment => {
    const deadline = new Date(commitment.deadline);
    const now = new Date();
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let message = '';
    if (daysRemaining === 0) {
      message = `Today is the deadline for your commitment: "${commitment.commitment.slice(0, 50)}..."`;
    } else if (daysRemaining === 1) {
      message = `Tomorrow is your deadline! "${commitment.commitment.slice(0, 50)}..."`;
    } else if (daysRemaining <= 7) {
      message = `${daysRemaining} days left: "${commitment.commitment.slice(0, 50)}..."`;
    } else {
      message = `Remember your commitment: "${commitment.commitment.slice(0, 40)}..."`;
    }

    showNotification('🧊 Iceberg Commitment Reminder', message);
  });

  if (activeCommitments.length > 0) {
    localStorage.setItem('last_reminder_date', today);
  }
};

// Initialize reminder checker (call this on app load)
export const initializeReminders = (): void => {
  // Check immediately on load
  checkAndShowReminders();

  // Check every hour while app is open
  setInterval(checkAndShowReminders, 60 * 60 * 1000);
};

// Generate a unique ID
export const generateCommitmentId = (): string => {
  return `commitment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Format date for display
export const formatDeadline = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Past deadline';
  } else if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays <= 7) {
    return `${diffDays} days left`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
};
