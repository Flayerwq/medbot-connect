import { Navigate, Outlet } from 'react-router-dom';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import DoctorSidebar from '@/components/DoctorSidebar';

export default function DoctorLayout() {
  const { user, doctor, loading } = useDoctorAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-9 w-9 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user || !doctor) return <Navigate to="/doctor/login" replace />;

  return (
    <div className="min-h-screen flex bg-background">
      <DoctorSidebar />
      <main className="flex-1 overflow-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  );
}
