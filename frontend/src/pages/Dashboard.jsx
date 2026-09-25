import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import DarkMap from "@/components/DarkMap";
import Counter from "@/components/Counter";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { WarningOctagon, CheckCircle, HourglassMedium, FireSimple, Plus, Calendar } from "@phosphor-icons/react";

export default function Dashboard() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total_problems: 0, resolved: 0, in_progress: 0, critical: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/reports").then((r) => setReports(r.data)).catch(() => {}),
      api.get("/stats/overview").then((r) => setStats(r.data)).catch(() => {})
    ]).finally(() => setLoading(false));
  }, []);

  const isAdmin = user?.role === "admin";
  const geo = reports.filter((r) => r.latitude && r.longitude);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
              <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">
                / {isAdmin ? "AUTHORITY CONTROL ROOM" : "CITIZEN DASHBOARD"}
              </p>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-1">
              Welcome, {user?.name?.split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/events"
                data-testid="dashboard-manage-events"
                className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#12304A] font-semibold flex items-center gap-2 text-sm shadow-xs transition"
              >
                <Calendar size={16} className="text-[#EA580C]" /> Civic Events
              </Link>
            )}
            <Link
              to="/report"
              data-testid="dashboard-new-report"
              className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] flex items-center gap-2 text-sm shadow-md shadow-orange-500/15 transition"
            >
              <Plus size={16} weight="bold" /> New Report
            </Link>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={WarningOctagon} label={isAdmin ? "Total Reports" : "Your Reports"} value={reports.length} color="text-[#12304A]" />
          <StatCard icon={FireSimple} label={isAdmin ? "Critical" : "Critical (city)"} value={stats.critical} color="text-[#DC2626]" />
          <StatCard icon={HourglassMedium} label={isAdmin ? "In Progress" : "In Progress (city)"} value={stats.in_progress} color="text-[#EA580C]" />
          <StatCard icon={CheckCircle} label={isAdmin ? "Resolved" : "Resolved (city)"} value={stats.resolved} color="text-[#16A34A]" />
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E2E8F0]">
              <h2 className="font-display font-bold text-xl text-[#12304A]">
                {isAdmin ? "Active Complaint Queue" : "Your Filed Complaints"}
              </h2>
              <span className="text-xs font-mono font-medium text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-full">{reports.length} entries</span>
            </div>
            <div className="divide-y divide-[#E2E8F0]">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="py-4 px-2 animate-pulse flex justify-between items-center">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-slate-100 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                    <div className="h-4 bg-slate-100 rounded w-16" />
                  </div>
                ))
              ) : reports.length === 0 ? (
                <div className="text-sm text-[#64748B] italic py-10 text-center">
                  No complaints filed yet. Click "New Report" to register an issue.
                </div>
              ) : null}
              {!loading && reports.map((r) => (
                <Link
                  key={r.id}
                  to={`/tracking/${r.id}`}
                  data-testid={`report-row-${r.id}`}
                  className="flex items-center justify-between py-3.5 px-3 hover:bg-slate-50 rounded-xl transition group"
                >
                  <div>
                    <div className="font-semibold text-sm text-[#12304A] group-hover:text-[#EA580C] transition">
                      {r.category} <span className="text-[#64748B] font-normal text-xs">· {r.severity}</span>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      {r.road_name || "Unverified road segment"} · submitted by {r.user_name}
                    </div>
                  </div>
                  <div className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border ${
                    r.status === "RESOLVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : r.status === "CRITICAL"
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-orange-50 text-[#EA580C] border-orange-200"
                  }`}>
                    {r.status}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
            <h2 className="font-display font-bold text-xl text-[#12304A] mb-4">Live Incident Map</h2>
            <div className="rounded-xl overflow-hidden border border-[#E2E8F0]">
              <DarkMap markers={geo} height={340} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-medium">
        <Icon size={14} weight="duotone" className="text-[#64748B]" /> {label}
      </div>
      <div className={`font-display font-black text-3xl mt-1.5 ${color}`}>
        <Counter end={value || 0} />
      </div>
    </div>
  );
}
