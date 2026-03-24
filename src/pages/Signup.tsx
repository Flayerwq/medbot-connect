import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="glass-card p-8 w-full max-w-md text-center animate-slide-up">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Check your email</h2>
          <p className="text-muted-foreground text-sm mb-4">We've sent a confirmation link to {email}</p>
          <Button variant="outline" onClick={() => navigate('/login')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="glass-card p-8 w-full max-w-md relative animate-slide-up">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="gradient-violet p-2 rounded-lg">
            <Heart className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">MedWay</h1>
        </div>

        <h2 className="text-xl font-semibold text-foreground text-center mb-2">Create account</h2>
        <p className="text-muted-foreground text-center mb-6 text-sm">Start your health journey</p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="name" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 bg-muted/50 border-border" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-muted/50 border-border" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-muted/50 border-border" required minLength={6} />
            </div>
          </div>

          <Button type="submit" variant="glow" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
