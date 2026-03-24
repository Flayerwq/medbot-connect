import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-1">Profile</h1>
      <p className="text-muted-foreground text-sm mb-8">Your account information</p>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="gradient-violet h-16 w-16 rounded-full flex items-center justify-center glow-violet">
            <span className="text-2xl font-bold text-primary-foreground">
              {user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">{user?.user_metadata?.full_name || 'User'}</h2>
            <p className="text-sm text-muted-foreground">Patient</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <User className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="text-sm text-foreground">{user?.user_metadata?.full_name || 'Not set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <Calendar className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Member Since</p>
              <p className="text-sm text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
