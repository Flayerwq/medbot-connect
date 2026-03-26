import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Stethoscope, Loader2, CheckCircle, Trash2 } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  available_slots: string[];
}

interface Appointment {
  id: string;
  doctor_name: string;
  specialization: string;
  appointment_date: string;
  time_slot: string;
  status: string;
}

export default function Appointments() {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from('doctors').select('*').then(({ data }) => data && setDoctors(data)),
      supabase.from('appointments').select('*').eq('user_id', user.id).order('appointment_date', { ascending: true }).then(({ data }) => data && setAppointments(data)),
    ]).then(() => setLoading(false));
  }, [user]);

  const bookAppointment = async (doctor: Doctor) => {
    const slot = selectedSlots[doctor.id];
    if (!slot || !user) return;
    setBooking(doctor.id);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await supabase.from('appointments').insert({
        user_id: user.id,
        doctor_id: doctor.id,
        doctor_name: doctor.name,
        specialization: doctor.specialization,
        appointment_date: tomorrow.toISOString().split('T')[0],
        time_slot: slot,
        status: 'booked',
      });

      const { data } = await supabase.from('appointments').select('*').eq('user_id', user.id).order('appointment_date', { ascending: true });
      if (data) setAppointments(data);
      setSelectedSlots((prev) => ({ ...prev, [doctor.id]: '' }));
    } catch (err) {
      console.error(err);
    } finally {
      setBooking(null);
    }
  };

  const cancelAppointment = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl fade-in">
      <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1.5 tracking-tight">Appointments</h1>
      <p className="text-muted-foreground text-sm mb-8">Book appointments with our doctors</p>

      <div className="mb-10">
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Stethoscope className="h-4 w-4 text-primary" />
          </div>
          Available Doctors
        </h2>
        {doctors.length === 0 ? (
          <p className="text-muted-foreground text-sm glass-card p-8 text-center">No doctors available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map((doc) => (
              <div key={doc.id} className="glass-card-hover p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="gradient-violet h-11 w-11 rounded-xl flex items-center justify-center shadow-sm shadow-primary/20">
                    <Stethoscope className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">Dr. {doc.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{doc.specialization}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {doc.available_slots?.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlots((prev) => ({ ...prev, [doc.id]: slot }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 ${
                        selectedSlots[doc.id] === slot
                          ? 'bg-primary/15 border-primary/50 text-primary shadow-sm shadow-primary/10'
                          : 'border-border text-muted-foreground hover:border-primary/25 hover:text-foreground'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
                <Button
                  variant="glow"
                  size="sm"
                  disabled={!selectedSlots[doc.id] || booking === doc.id}
                  onClick={() => bookAppointment(doc)}
                  className="w-full rounded-xl"
                >
                  {booking === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Book Appointment'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-semibold text-foreground mb-5 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-success/10">
            <CalendarDays className="h-4 w-4 text-success" />
          </div>
          Your Appointments
        </h2>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-sm glass-card p-8 text-center">No appointments booked yet.</p>
        ) : (
          <div className="space-y-2.5">
            {appointments.map((a) => (
              <div key={a.id} className="glass-card-hover p-4 flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-success/10">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Dr. {a.doctor_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{a.specialization}</span>
                    <span>·</span>
                    <CalendarDays className="h-3 w-3" /> {new Date(a.appointment_date).toLocaleDateString()}
                    <Clock className="h-3 w-3 ml-1" /> {a.time_slot}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-destructive/10" onClick={() => cancelAppointment(a.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
