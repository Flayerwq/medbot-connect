import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { DoctorAuthProvider } from "@/hooks/useDoctorAuth";
import AppLayout from "@/components/AppLayout";
import DoctorLayout from "@/components/DoctorLayout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Chatbot from "@/pages/Chatbot";
import Reports from "@/pages/Reports";
import Appointments from "@/pages/Appointments";
import Profile from "@/pages/Profile";
import DoctorLogin from "@/pages/doctor/DoctorLogin";
import DoctorSignup from "@/pages/doctor/DoctorSignup";
import DoctorDashboard from "@/pages/doctor/DoctorDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <DoctorAuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/doctor/signup" element={<DoctorSignup />} />
              <Route element={<DoctorLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DoctorAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
