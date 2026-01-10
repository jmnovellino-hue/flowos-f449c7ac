import { useState, useEffect } from 'react';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { JourneyIntro } from '@/components/onboarding/JourneyIntro';
import { AssessmentFlow } from '@/components/onboarding/AssessmentFlow';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { HomeTab } from '@/components/dashboard/HomeTab';
import { CodexTab } from '@/components/dashboard/CodexTab';
import { StudioTab } from '@/components/dashboard/StudioTab';
import { LabTab } from '@/components/dashboard/LabTab';
import { ArchitectTab } from '@/components/dashboard/ArchitectTab';
import { ProfileTab } from '@/components/dashboard/ProfileTab';
import { initializeReminders } from '@/lib/notifications';

type AppState = 'auth' | 'journey-intro' | 'assessment' | 'dashboard';

const Index = () => {
  const [appState, setAppState] = useState<AppState>('auth');
  const [activeTab, setActiveTab] = useState('home');
  const [userProfile, setUserProfile] = useState({
    name: 'Leader',
    archetype: 'The Hero',
    values: ['Integrity', 'Wisdom', 'Innovation'],
    tier: 'Architect',
    streak: 12,
    iceberg: {
      behavior: 'I constantly check emails during meetings',
      feeling: 'A spike of anxiety that I am missing critical info',
      belief: 'My value as a leader depends on being the most responsive person in the room',
      commitment: '',
      deadline: '',
    },
  });

  // Initialize commitment reminders on app load
  useEffect(() => {
    initializeReminders();
  }, []);

  const handleAuthComplete = () => {
    setAppState('journey-intro');
  };

  const handleJourneyBegin = () => {
    setAppState('assessment');
  };

  const handleAssessmentComplete = (results: any) => {
    setUserProfile((prev) => ({
      ...prev,
      archetype: results.archetype,
      values: results.values,
      iceberg: results.iceberg,
    }));
    setAppState('dashboard');
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userProfile={userProfile} />;
      case 'codex':
        return <CodexTab />;
      case 'studio':
        return <StudioTab />;
      case 'lab':
        return <LabTab />;
      case 'architect':
        return <ArchitectTab />;
      case 'profile':
        return <ProfileTab userProfile={userProfile} />;
      default:
        return <HomeTab userProfile={userProfile} />;
    }
  };

  // Render based on app state
  if (appState === 'auth') {
    return <AuthScreen onComplete={handleAuthComplete} />;
  }

  if (appState === 'journey-intro') {
    return <JourneyIntro onBegin={handleJourneyBegin} />;
  }

  if (appState === 'assessment') {
    return <AssessmentFlow onComplete={handleAssessmentComplete} />;
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderDashboardContent()}
    </DashboardLayout>
  );
};

export default Index;
