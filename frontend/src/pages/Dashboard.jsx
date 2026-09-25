import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
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
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={15} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-widest text-amber-400 font-mono">
              / {isAdmin ? "AUTHORITY CONTROL ROOM" : "CITIZEN DASHBOARD"}
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl mt-2">
              Welcome, {user?.name?.split(" ")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/events"
                data-testid="dashboard-manage-events"
                className="px-4 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium flex items-center gap-2 text-sm"
              >
                <Calendar size={16} /> Civic Events
              </Link>
            )}
            <Link to="/report" data-testid="dashboard-new-report" className="px-5 py-3 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400 flex items-center gap-2 text-sm">
              <Plus size={16} weight="bold" /> New Report
            </Link>
          </div>
        </div>

        <div className="mt-10 grid md:grid-cols-4 gap-4">
          <StatCard icon={WarningOctagon} label={isAdmin ? "Total Reports" : "Your Reports"} value={reports.length} accent />
          <StatCard icon={FireSimple} label={isAdmin ? "Critical" : "Critical (city)"} value={stats.critical} danger />
          <StatCard icon={HourglassMedium} label={isAdmin ? "In Progress" : "In Progress (city)"} value={stats.in_progress} />
          <StatCard icon={CheckCircle} label={isAdmin ? "Resolved" : "Resolved (city)"} value={stats.resolved} success />
        </div>

        <div className="mt-10 grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-[#111] border border-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-xl">
                {isAdmin ? "All Complaints" : "Your Reports"}
              </h2>
              <span className="text-xs font-mono text-zinc-500">{reports.length} entries</span>
            </div>
            <div className="divide-y divide-white/5">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="py-4 px-2 animate-pulse flex justify-between items-center">
                    <div className="space-y-2 w-2/3">
                      <div className="h-4 bg-zinc-800 rounded w-1/3" />
                      <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                    </div>
                    <div className="h-3 bg-zinc-800 rounded w-16" />
                  </div>
                ))
              ) : reports.length === 0 ? (
                <div className="text-sm text-zinc-500 italic py-8 text-center">No reports yet. Head over to Report to file one.</div>
              ) : null}
              {!loading && reports.map((r) => (
                <Link
                  key={r.id}
                  to={`/tracking/${r.id}`}
                  data-testid={`report-row-${r.id}`}
                  className="flex items-center justify-between py-3 hover:bg-white/5 px-2 rounded-lg transition-colors"
                >
                  <div>
                    <div className="font-medium">{r.category} <span className="text-zinc-500 text-xs">· {r.severity}</span></div>
                    <div className="text-xs text-zinc-500">{r.road_name || "Unknown road"} · by {r.user_name}</div>
                  </div>
                  <div className="text-xs font-mono text-amber-400">{r.status}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-[#111] border border-white/5 p-6">
            <h2 className="font-display font-bold text-xl mb-4">Live Map</h2>
            <DarkMap markers={geo} height={340} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, danger, success }) {
  const color = danger ? "text-red-400" : success ? "text-emerald-400" : accent ? "text-amber-400" : "text-white";
  return (
    <div className="rounded-2xl bg-[#111] border border-white/5 p-5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={12} weight="duotone" /> {label}
      </div>
      <div className={`font-display font-black text-3xl mt-1 ${color}`}>
        <Counter end={value || 0} />
      </div>
    </div>
  );
}
