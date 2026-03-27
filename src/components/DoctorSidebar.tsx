import { LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/doctor/dashboard' },
];

export default function DoctorSidebar() {
  const { doctor, signOut } = useDoctorAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/doctor/login');
  };

  return (
    <aside className="w-64 border-r border-border bg-sidebar-background flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <h1 className="text-xl font-bold text-primary tracking-tight">MedWay</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Doctor Panel</p>
      </div>

      {doctor && (
        <div className="px-5 py-4 border-b border-border">
          <p className="text-sm font-medium text-foreground truncate">{doctor.name}</p>
          <p className="text-xs text-muted-foreground truncate">{doctor.specialization}</p>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              location.pathname === item.path
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
