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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import h2hLogo from '@/assets/h2h-logo-light.png';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'codex', label: 'Codex', icon: BookOpen },
  { id: 'studio', label: 'Studio', icon: Headphones },
  { id: 'lab', label: 'Lab', icon: FlaskConical },
  { id: 'architect', label: 'Architect', icon: MessageCircle },
  { id: 'profile', label: 'Profile', icon: User },
];

export const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background neural-grid">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 lg:w-64 flex-col bg-sidebar border-r border-sidebar-border z-50">
        {/* H2H Logo */}
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img src={h2hLogo} alt="H2H" className="h-8 w-auto" />
            <div className="hidden lg:flex flex-col">
              <span className="text-sm font-display font-semibold text-sidebar-foreground leading-tight">
                Inner Lab
              </span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                FlowOS
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

        {/* Tier Badge */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="hidden lg:block glass-surface rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary uppercase tracking-wider">
                H2H Member
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Inner Lab Access
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src={h2hLogo} alt="H2H" className="h-6 w-auto" />
          <div className="flex flex-col">
            <span className="text-sm font-display font-semibold leading-tight">Inner Lab</span>
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
      <main className="md:ml-20 lg:ml-64 min-h-screen pt-16 md:pt-0">
        {children}
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
    </div>
  );
};
