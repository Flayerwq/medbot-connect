import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { LayoutDashboard, FileText, CalendarDays, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Report {
  id: string;
  title: string;
  created_at: string;
}

interface Appointment {
  id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  time_slot: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from('reports').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3).then(({ data }) => data && setReports(data));
    supabase.from('appointments').select('id, doctor_name, specialization, appointment_date, time_slot').eq('user_id', user.id).order('appointment_date', { ascending: true }).limit(3).then(({ data }) => data && setAppointments(data));
  }, [user]);

  const stats = [
    { icon: FileText, label: 'Reports', value: reports.length, to: '/reports', color: 'text-primary' },
    { icon: CalendarDays, label: 'Appointments', value: appointments.length, to: '/appointments', color: 'text-success' },
    { icon: MessageSquare, label: 'AI Chatbot', value: 'Active', to: '/chatbot', color: 'text-warning' },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-6xl fade-in">
      <div className="mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1.5 tracking-tight">
          Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || 'User'}</span>
        </h1>
        <p className="text-muted-foreground text-sm">Here's your health overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, to, color }) => (
          <Link key={label} to={to} className="glass-card-hover p-5 flex items-center gap-4 group">
            <div className={`p-3 rounded-xl bg-muted/80 ${color} transition-transform duration-200 group-hover:scale-110`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">Recent Reports</h2>
            <Link to="/reports" className="text-xs text-primary flex items-center gap-1 hover:underline transition-colors">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No reports yet. Upload your first medical report.</p>
          ) : (
            <div className="space-y-2.5">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/25 hover:bg-muted/40 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-foreground">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-xs text-primary flex items-center gap-1 hover:underline transition-colors">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-6 text-center">No upcoming appointments. Book one now.</p>
          ) : (
            <div className="space-y-2.5">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/25 hover:bg-muted/40 transition-colors duration-200">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Clock className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Dr. {a.doctor_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.specialization} · {new Date(a.appointment_date).toLocaleDateString()} · {a.time_slot}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
