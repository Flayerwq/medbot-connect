import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface DoctorProfile {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  email: string;
}

interface DoctorAuthContextType {
  user: User | null;
  session: Session | null;
  doctor: DoctorProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, specialization: string, experience: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DoctorAuthContext = createContext<DoctorAuthContextType | undefined>(undefined);

export function DoctorAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDoctorProfile = async (userId: string) => {
    const { data } = await supabase
      .from('doctors')
      .select('id, name, specialization, experience, email')
      .eq('user_id', userId)
      .maybeSingle();
    setDoctor(data as DoctorProfile | null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchDoctorProfile(session.user.id);
      } else {
        setDoctor(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchDoctorProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, specialization: string, experience: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'doctor' } },
    });
    if (authError) throw authError;

    if (authData.user) {
      const { error: insertError } = await supabase.from('doctors').insert({
        user_id: authData.user.id,
        name: fullName,
        specialization,
        experience,
        email,
      });
      if (insertError) throw insertError;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setDoctor(null);
  };

  return (
    <DoctorAuthContext.Provider value={{ user, session, doctor, loading, signUp, signIn, signOut }}>
      {children}
    </DoctorAuthContext.Provider>
  );
}

export function useDoctorAuth() {
  const context = useContext(DoctorAuthContext);
  if (!context) throw new Error('useDoctorAuth must be used within DoctorAuthProvider');
  return context;
}
