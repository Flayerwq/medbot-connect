import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Heart, LayoutDashboard, MessageSquare, FileText, CalendarDays, User, LogOut } from 'lucide-react';
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
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="gradient-violet p-1.5 rounded-lg">
            <Heart className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold gradient-text">MedWay</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === to
                ? 'bg-sidebar-accent text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full gradient-violet flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-sidebar-accent/50 w-full transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
