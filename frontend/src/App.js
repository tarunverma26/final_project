import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "sonner";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import IdentifyRoad from "@/pages/IdentifyRoad";
import Report from "@/pages/Report";
import Tracking from "@/pages/Tracking";
import MapView from "@/pages/MapView";
import Dashboard from "@/pages/Dashboard";
import Contractors from "@/pages/Contractors";
import Info from "@/pages/Info";
import RoadProfile from "@/pages/RoadProfile";
import PrototypeJourneyBar from "@/components/PrototypeJourneyBar";

import AdminRegister from "@/pages/AdminRegister";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#F8FAFC]" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminProtected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#F8FAFC]" />;
  if (!user || user.role !== "admin") return <Navigate to="/admin/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/register" element={<AdminRegister />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/identify" element={<IdentifyRoad />} />
      <Route path="/report" element={<Report />} />
      <Route path="/road/:id" element={<RoadProfile />} />
      <Route path="/road" element={<RoadProfile />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/events" element={<Info mode="events" />} />
      <Route path="/contractors" element={<Contractors />} />
      <Route path="/tracking/:id" element={<Tracking />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/admin/dashboard" element={<AdminProtected><AdminDashboard /></AdminProtected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster theme="dark" position="top-right" />
          <PrototypeJourneyBar />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
