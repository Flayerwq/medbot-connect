import { useEffect, useState } from 'react';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  status: string;
  specialization: string;
  user_id: string;
  doctor_name: string;
}

export default function DoctorDashboard() {
  const { doctor } = useDoctorAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAppointments = async () => {
    if (!doctor) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('doctor_id', doctor.id)
      .order('appointment_date', { ascending: true });

    if (error) {
      toast({ title: 'Error loading appointments', description: error.message, variant: 'destructive' });
    } else {
      setAppointments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctor]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Appointment ${status}` });
      fetchAppointments();
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">Confirmed</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="bg-destructive/15 text-destructive border-destructive/30">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30">Pending</Badge>;
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'booked').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    rejected: appointments.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome, Dr. {doctor?.name}</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your patient appointments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: CalendarDays, color: 'text-primary' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-400' },
          { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-destructive' },
        ].map((s) => (
          <Card key={s.label} className="glass-card border-border/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-muted">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
            </div>
          ) : appointments.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No appointments yet</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Specialization</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.appointment_date}</TableCell>
                      <TableCell>{apt.time_slot}</TableCell>
                      <TableCell>{apt.specialization}</TableCell>
                      <TableCell>{statusBadge(apt.status)}</TableCell>
                      <TableCell className="text-right">
                        {apt.status === 'booked' && (
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10" onClick={() => updateStatus(apt.id, 'confirmed')}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> Accept
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => updateStatus(apt.id, 'rejected')}>
                              <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
