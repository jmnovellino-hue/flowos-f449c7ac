import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CalendarCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Check for OAuth errors
      if (error) {
        setStatus('error');
        setErrorMessage(error === 'access_denied' 
          ? 'You denied access to Google Calendar.' 
          : `OAuth error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setErrorMessage('No authorization code received.');
        return;
      }

      // Verify state matches what we stored
      const storedState = localStorage.getItem('gcal_oauth_state');
      if (storedState && state !== storedState) {
        setStatus('error');
        setErrorMessage('Security verification failed. Please try again.');
        return;
      }
      localStorage.removeItem('gcal_oauth_state');

      try {
        // Exchange the code for tokens
        const redirectUri = `${window.location.origin}/calendar-callback`;
        
        const { data, error: exchangeError } = await supabase.functions.invoke('google-calendar-auth', {
          body: { 
            action: 'exchange_code', 
            code,
            redirectUri,
          },
        });

        if (exchangeError) throw exchangeError;

        if (data.error) {
          throw new Error(data.error);
        }

        setStatus('success');
        
        // Redirect back to dashboard after a short delay
        setTimeout(() => {
          navigate('/?tab=lab&calendar=open');
        }, 2000);

      } catch (err: any) {
        console.error('Calendar callback error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Failed to connect calendar.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Connecting Calendar...</h1>
              <p className="text-muted-foreground">
                Please wait while we complete the connection to your Google Calendar.
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Calendar Connected!</h1>
              <p className="text-muted-foreground">
                Your Google Calendar has been successfully connected. Redirecting you back...
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Connection Failed</h1>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Dashboard
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CalendarCallback;
