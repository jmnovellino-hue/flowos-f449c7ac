import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Mail, 
  Calendar, 
  Percent,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  ArrowLeft
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logoDark from "@/assets/h2h-logo-dark.png";

interface BetaApplication {
  id: string;
  email: string;
  full_name: string;
  quiz_responses: Array<{
    questionId: number;
    question: string;
    category: string;
    score: number;
    selectedOption: string;
  }>;
  match_percentage: number;
  qualified: boolean;
  accessed_app: boolean;
  accessed_at: string | null;
  feedback_sent: boolean;
  feedback_sent_at: string | null;
  notes: string | null;
  created_at: string;
}

const BetaAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<BetaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'qualified' | 'not_qualified' | 'accessed'>('all');
  const [selectedApp, setSelectedApp] = useState<BetaApplication | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('beta_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion for quiz_responses
      const typedData = (data || []).map(app => ({
        ...app,
        quiz_responses: app.quiz_responses as BetaApplication['quiz_responses']
      }));
      
      setApplications(typedData);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const updateNotes = async (appId: string, newNotes: string) => {
    try {
      const { error } = await supabase
        .from('beta_applications')
        .update({ notes: newNotes })
        .eq('id', appId);

      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === appId ? { ...app, notes: newNotes } : app)
      );
      toast.success("Notes updated");
    } catch (error) {
      console.error('Error updating notes:', error);
      toast.error("Failed to update notes");
    }
  };

  const sendFeedbackEmail = async (app: BetaApplication) => {
    try {
      const { error } = await supabase.functions.invoke('beta-emails', {
        body: {
          type: 'feedback_request',
          email: app.email,
          name: app.full_name,
        },
      });

      if (error) throw error;

      // Mark as feedback sent
      await supabase
        .from('beta_applications')
        .update({ 
          feedback_sent: true, 
          feedback_sent_at: new Date().toISOString() 
        })
        .eq('id', app.id);
      
      setApplications(prev => 
        prev.map(a => a.id === app.id ? { 
          ...a, 
          feedback_sent: true, 
          feedback_sent_at: new Date().toISOString() 
        } : a)
      );
      
      toast.success(`Feedback request sent to ${app.email}`);
    } catch (error) {
      console.error('Error sending feedback email:', error);
      toast.error("Failed to send email");
    }
  };

  const markFeedbackSent = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('beta_applications')
        .update({ 
          feedback_sent: true, 
          feedback_sent_at: new Date().toISOString() 
        })
        .eq('id', appId);

      if (error) throw error;
      
      setApplications(prev => 
        prev.map(app => app.id === appId ? { 
          ...app, 
          feedback_sent: true, 
          feedback_sent_at: new Date().toISOString() 
        } : app)
      );
      toast.success("Marked as feedback sent");
    } catch (error) {
      console.error('Error marking feedback:', error);
      toast.error("Failed to update");
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Match %', 'Qualified', 'Accessed App', 'Feedback Sent', 'Applied At'];
    const rows = filteredApplications.map(app => [
      app.full_name,
      app.email,
      app.match_percentage,
      app.qualified ? 'Yes' : 'No',
      app.accessed_app ? 'Yes' : 'No',
      app.feedback_sent ? 'Yes' : 'No',
      new Date(app.created_at).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beta-applications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'qualified' && app.qualified) ||
      (filter === 'not_qualified' && !app.qualified) ||
      (filter === 'accessed' && app.accessed_app);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: applications.length,
    qualified: applications.filter(a => a.qualified).length,
    accessed: applications.filter(a => a.accessed_app).length,
    avgMatch: Math.round(applications.reduce((sum, a) => sum + a.match_percentage, 0) / applications.length) || 0
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access Required</h2>
          <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
          <Button onClick={() => window.location.href = '/'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.location.href = '/'}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={logoDark} alt="H2H" className="h-10 object-contain" />
            <h1 className="text-xl font-bold">Beta Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={fetchApplications}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Applications', value: stats.total, icon: Users, color: 'text-primary' },
            { label: 'Qualified', value: stats.qualified, icon: CheckCircle, color: 'text-green-500' },
            { label: 'Accessed App', value: stats.accessed, icon: Eye, color: 'text-secondary' },
            { label: 'Avg Match %', value: `${stats.avgMatch}%`, icon: Percent, color: 'text-primary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-surface rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'qualified', 'not_qualified', 'accessed'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(f)}
                className={filter === f ? 'h2h-gradient' : ''}
              >
                {f === 'all' ? 'All' : f === 'qualified' ? 'Qualified' : f === 'not_qualified' ? 'Not Qualified' : 'Accessed'}
              </Button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="glass-surface rounded-xl overflow-hidden">
          <ScrollArea className="h-[600px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-card border-b border-border">
                <tr className="text-left text-sm text-muted-foreground">
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Match</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Applied</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      Loading...
                    </td>
                  </tr>
                ) : filteredApplications.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No applications found
                    </td>
                  </tr>
                ) : (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{app.full_name}</p>
                          <p className="text-sm text-muted-foreground">{app.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={app.match_percentage >= 80 ? 'default' : 'secondary'}
                          className={app.match_percentage >= 80 ? 'bg-primary text-primary-foreground' : ''}
                        >
                          {app.match_percentage}%
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {app.qualified ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Qualified</Badge>
                          ) : (
                            <Badge variant="secondary">Not Qualified</Badge>
                          )}
                          {app.accessed_app && (
                            <Badge className="bg-secondary/20 text-secondary border-secondary/30">Accessed</Badge>
                          )}
                          {app.feedback_sent && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">Feedback Sent</Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedApp(app);
                              setNotes(app.notes || '');
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!app.feedback_sent && app.accessed_app && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => sendFeedbackEmail(app)}
                              title="Send feedback request email"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`mailto:${app.email}?subject=FlowOS Beta Feedback Request`)}
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedApp.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Match Percentage</p>
                  <p className="font-medium text-primary">{selectedApp.match_percentage}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied</p>
                  <p className="font-medium">{new Date(selectedApp.created_at).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Quiz Responses</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedApp.quiz_responses.map((response, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-lg text-sm">
                      <p className="font-medium mb-1">{response.question}</p>
                      <div className="flex justify-between text-muted-foreground">
                        <span>{response.selectedOption}</span>
                        <Badge variant="secondary">{response.score}/3</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Admin Notes</p>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this applicant..."
                  rows={3}
                />
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => updateNotes(selectedApp.id, notes)}
                >
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BetaAdmin;
