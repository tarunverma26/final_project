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

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen asphalt-bg" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/identify" element={<IdentifyRoad />} />
      <Route path="/report" element={<Report />} />
      <Route path="/map" element={<MapView />} />
      <Route path="/events" element={<Info mode="events" />} />
      <Route path="/contractors" element={<Contractors />} />
      <Route path="/tracking/:id" element={<Protected><Tracking /></Protected>} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
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
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}
