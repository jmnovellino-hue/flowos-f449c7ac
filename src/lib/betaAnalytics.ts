import { supabase } from "@/integrations/supabase/client";

// Generate a session ID for tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('beta_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem('beta_session_id', sessionId);
  }
  return sessionId;
};

export type BetaEventType = 
  | 'page_view'
  | 'quiz_started'
  | 'quiz_question_answered'
  | 'quiz_completed'
  | 'qualified'
  | 'not_qualified'
  | 'info_submitted'
  | 'launch_page_viewed'
  | 'app_accessed'
  | 'specs_downloaded'
  | 'specs_viewed';

interface EventData {
  questionNumber?: number;
  matchPercentage?: number;
  email?: string;
  [key: string]: any;
}

export const trackBetaEvent = async (
  eventType: BetaEventType,
  eventData?: EventData
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    await supabase.from('beta_analytics').insert({
      event_type: eventType,
      event_data: eventData || {},
      session_id: sessionId,
      user_email: eventData?.email || null,
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the user experience
    console.error('Analytics tracking error:', error);
  }
};

// Utility function to calculate conversion metrics
export interface ConversionMetrics {
  totalPageViews: number;
  quizStarts: number;
  quizCompletions: number;
  qualified: number;
  notQualified: number;
  appAccesses: number;
  startToCompleteRate: number;
  qualificationRate: number;
  accessRate: number;
}

export const calculateConversionMetrics = (
  events: Array<{ event_type: string; created_at: string }>
): ConversionMetrics => {
  const counts = events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pageViews = counts['page_view'] || 0;
  const quizStarts = counts['quiz_started'] || 0;
  const quizCompletions = counts['quiz_completed'] || 0;
  const qualified = counts['qualified'] || 0;
  const notQualified = counts['not_qualified'] || 0;
  const appAccesses = counts['app_accessed'] || 0;

  return {
    totalPageViews: pageViews,
    quizStarts,
    quizCompletions,
    qualified,
    notQualified,
    appAccesses,
    startToCompleteRate: quizStarts > 0 ? Math.round((quizCompletions / quizStarts) * 100) : 0,
    qualificationRate: quizCompletions > 0 ? Math.round((qualified / quizCompletions) * 100) : 0,
    accessRate: qualified > 0 ? Math.round((appAccesses / qualified) * 100) : 0,
  };
};
