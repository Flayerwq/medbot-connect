import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, LayoutDashboard, MessageSquare, FileText, CalendarDays, User, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/chatbot', icon: MessageSquare, label: 'AI Chatbot' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/appointments', icon: CalendarDays, label: 'Appointments' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppSidebar() {
  const { pathname } = useLocation();
  const { signOut, user } = useAuth();

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 pb-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="gradient-violet p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-105">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text tracking-tight">MedWay</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group relative',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary-foreground shadow-sm shadow-primary/5'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] transition-colors duration-200', active ? 'text-primary' : 'text-muted-foreground group-hover:text-sidebar-accent-foreground')} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="h-3.5 w-3.5 text-primary/60" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="h-9 w-9 rounded-xl gradient-violet flex items-center justify-center text-xs font-bold text-primary-foreground shadow-sm shadow-primary/20">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate leading-tight">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
