import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  BookOpen, 
  Headphones, 
  FlaskConical, 
  MessageCircle, 
  User,
  Menu,
  X,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import h2hLogo from '../../assets/h2h-logo-light.png';
import { H2HFooter } from './H2HFooter';
import { SubscriptionModal } from './SubscriptionModal';
interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userName?: string;
  avatarUrl?: string | null;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'codex', label: 'Codex', icon: BookOpen },
  { id: 'studio', label: 'Studio', icon: Headphones },
  { id: 'lab', label: 'Lab', icon: FlaskConical },
  { id: 'architect', label: 'Architect', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const DashboardLayout = ({ children, activeTab, onTabChange, userName = 'Leader', avatarUrl }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  return (
    <div className="min-h-screen bg-background neural-grid flex flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-64 flex-col bg-sidebar border-r border-sidebar-border z-50">
        {/* Logo and App Name */}
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={h2hLogo} alt="H2H" className="h-12 w-auto" />
            <div className="hidden lg:flex flex-col">
              <span className="text-lg font-display font-bold text-sidebar-foreground leading-tight">
                FlowOS
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                H2H Inner Lab
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                    activeTab === item.id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden lg:block font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Avatar & Tier Badge */}
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={() => onTabChange('profile')}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors mb-3"
          >
            <Avatar className="w-10 h-10 border border-primary/20">
              <AvatarImage src={avatarUrl || undefined} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:block text-left flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">View Profile</p>
            </div>
          </button>
          <div className="hidden lg:block glass-surface rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-xs font-medium text-secondary uppercase tracking-wider">
                Beta Access
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Full Oracle tier enabled
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full text-xs gap-2 border-secondary/50 text-secondary hover:bg-secondary/10"
              onClick={() => setShowSubscriptionModal(true)}
            >
              <Crown className="w-3 h-3" />
              View Plans
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src={h2hLogo} alt="H2H" className="h-10 w-auto" />
          <div className="flex flex-col">
            <span className="text-base font-display font-bold leading-tight">FlowOS</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">H2H Inner Lab</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-background/95 backdrop-blur-xl z-40 p-4"
        >
          <nav className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200',
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-muted'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="md:ml-20 lg:ml-64 flex-1 pt-16 md:pt-0 flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <div className="hidden md:block">
          <H2HFooter />
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-xl border-t border-border z-50">
        <div className="grid grid-cols-6 h-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 transition-colors',
                activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Subscription Modal */}
      <SubscriptionModal 
        open={showSubscriptionModal} 
        onOpenChange={setShowSubscriptionModal}
        currentTier="oracle"
      />
    </div>
  );
};
