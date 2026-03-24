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
    <div className="p-6 lg:p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Welcome back, <span className="gradient-text">{user?.user_metadata?.full_name || 'User'}</span>
        </h1>
        <p className="text-muted-foreground text-sm">Here's your health overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, to, color }) => (
          <Link key={label} to={to} className="glass-card-hover p-5 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-muted ${color}`}>
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
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Reports</h2>
            <Link to="/reports" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {reports.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No reports yet. Upload your first medical report.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
            <Link to="/appointments" className="text-sm text-primary flex items-center gap-1 hover:underline">View all <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-sm py-4">No upcoming appointments. Book one now.</p>
          ) : (
            <div className="space-y-3">
              {appointments.map((a) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <Clock className="h-4 w-4 text-success" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Dr. {a.doctor_name}</p>
                    <p className="text-xs text-muted-foreground">{a.specialization} · {new Date(a.appointment_date).toLocaleDateString()} · {a.time_slot}</p>
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
