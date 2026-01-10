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
import { ArchetypeAnalysisPage } from '@/components/dashboard/ArchetypeAnalysisPage';
import { ShadowReportPage } from '@/components/dashboard/ShadowReportPage';
import { initializeReminders } from '@/lib/notifications';
import { initializeContentNotifications } from '@/lib/contentNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useCommitments } from '@/hooks/useCommitments';
import { supabase } from '@/integrations/supabase/client';

type AppState = 'auth' | 'journey-intro' | 'assessment' | 'dashboard';

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { createCommitment, getActiveCommitments } = useCommitments();
  const [appState, setAppState] = useState<AppState>('auth');
  const [activeTab, setActiveTab] = useState('home');
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'Leader',
    archetype: 'The Hero',
    values: ['Integrity', 'Wisdom', 'Innovation'],
    tier: 'Architect',
    streak: 12,
  });

  // Initialize reminders and content notifications on app load
  useEffect(() => {
    initializeReminders();
    initializeContentNotifications();
  }, []);

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        // Check if user has a profile with archetype set
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.archetype) {
          // User has completed onboarding
          setUserProfile(prev => ({
            ...prev,
            name: profile.display_name || 'Leader',
            archetype: profile.archetype,
            values: profile.values || ['Integrity', 'Wisdom', 'Innovation'],
            tier: profile.tier || 'Explorer',
            streak: profile.streak || 0,
          }));
          setAppState('dashboard');
        } else {
          // User needs to complete onboarding
          setAppState('journey-intro');
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setAppState('journey-intro');
      } finally {
        setCheckingOnboarding(false);
      }
    };

    if (!authLoading && user) {
      checkOnboarding();
    } else if (!authLoading && !user) {
      setCheckingOnboarding(false);
    }
  }, [user, authLoading]);

  const handleAuthComplete = () => {
    // Auth state change will trigger the onboarding check
  };

  const handleJourneyBegin = () => {
    setAppState('assessment');
  };

  const handleAssessmentComplete = async (results: any) => {
    if (!user) return;

    try {
      // Update profile with assessment results
      await supabase
        .from('profiles')
        .update({
          archetype: results.archetype,
          values: results.values,
        })
        .eq('user_id', user.id);

      // Create commitment if provided
      if (results.iceberg.commitment && results.iceberg.deadline) {
        await createCommitment({
          behavior: results.iceberg.behavior,
          feeling: results.iceberg.feeling,
          belief: results.iceberg.belief,
          commitment: results.iceberg.commitment,
          deadline: results.iceberg.deadline,
          reminder_enabled: true,
        });
      }

      setUserProfile((prev) => ({
        ...prev,
        archetype: results.archetype,
        values: results.values,
      }));

      setAppState('dashboard');
    } catch (error) {
      console.error('Error saving assessment:', error);
      // Still proceed to dashboard
      setAppState('dashboard');
    }
  };

  const renderDashboardContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab userProfile={userProfile} onNavigateToProfile={() => setActiveTab('profile')} />;
      case 'codex':
        return <CodexTab />;
      case 'studio':
        return <StudioTab />;
      case 'lab':
        return <LabTab />;
      case 'architect':
        return <ArchitectTab userContext={userProfile} userId={user?.id} />;
      case 'profile':
        return <ProfileTab userProfile={userProfile} userId={user?.id} onNavigateToArchetype={() => setActiveTab('archetype-analysis')} onNavigateToShadow={() => setActiveTab('shadow-report')} />;
      case 'archetype-analysis':
        return <ArchetypeAnalysisPage userProfile={userProfile} onBack={() => setActiveTab('profile')} />;
      case 'shadow-report':
        return <ShadowReportPage userProfile={userProfile} onBack={() => setActiveTab('profile')} />;
      default:
        return <HomeTab userProfile={userProfile} onNavigateToProfile={() => setActiveTab('profile')} />;
    }
  };

  // Show loading while checking auth or onboarding
  if (authLoading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-emerald mx-auto mb-4 animate-pulse">
            <span className="text-primary-foreground text-xl">✦</span>
          </div>
          <p className="text-muted-foreground">Loading FlowOS...</p>
        </div>
      </div>
    );
  }

  // Render based on app state
  if (!user || appState === 'auth') {
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
