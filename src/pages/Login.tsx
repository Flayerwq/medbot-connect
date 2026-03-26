import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[80px]" />
      </div>

      <div className="glass-card p-8 sm:p-10 w-full max-w-[420px] relative animate-slide-up">
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div className="gradient-violet p-2 rounded-xl shadow-md shadow-primary/20">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold gradient-text tracking-tight">MedWay</h1>
        </div>

        <h2 className="text-xl font-semibold text-foreground text-center mb-1.5">Welcome back</h2>
        <p className="text-muted-foreground text-center mb-8 text-sm">Sign in to your account</p>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-destructive/8 border border-destructive/15">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-muted/30 border-border rounded-xl h-11"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground/60" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-muted/30 border-border rounded-xl h-11"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="glow" className="w-full rounded-xl h-11" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium transition-colors">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
