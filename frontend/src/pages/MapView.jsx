import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DarkMap from "@/components/DarkMap";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { api } from "@/lib/api";

export default function MapView() {
  const [markers, setMarkers] = useState([]);
  useEffect(() => {
    api.get("/reports/public").then((r) => {
      setMarkers(r.data.filter((x) => x.latitude && x.longitude));
    }).catch(() => {});
  }, []);
  const resolvedCount = markers.filter((m) => m.status === "RESOLVED").length;
  const inProgress = markers.filter((m) => ["UNDER_REVIEW","FORWARDED","ASSIGNED","WORK_PLANNED","WORK_IN_PROGRESS","RESOLUTION","VERIFIED"].includes(m.status)).length;
  const open = markers.length - resolvedCount - inProgress;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">/ CIVIC MAP</p>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-2">Every reported issue, live.</h1>
        <p className="text-[#64748B] text-base mt-2 max-w-xl">
          Watch Indian roads heal in the open — real-time community reports, contractor dispatches, and verification telemetry.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 items-center" data-testid="map-legend">
          <LegendDot cls="critical" label={`Open · ${open}`} color="text-red-700 bg-red-50 border-red-200" />
          <LegendDot cls="in-progress" label={`In Progress · ${inProgress}`} color="text-amber-800 bg-amber-50 border-amber-200" />
          <LegendDot cls="resolved" label={`Resolved · ${resolvedCount}`} color="text-emerald-800 bg-emerald-50 border-emerald-200" />
        </div>

        <div className="mt-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-2 overflow-hidden">
          <DarkMap markers={markers} height={620} />
        </div>
        <div className="mt-4 text-xs text-[#64748B] font-mono font-medium">{markers.length} report(s) active across network</div>
      </div>
    </div>
  );
}

function LegendDot({ cls, label, color }) {
  return (
    <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono font-semibold shadow-xs ${color}`}>
      <span className="relative inline-flex" style={{ width: 14, height: 14 }}>
        <span className={`roadwatch-marker ${cls}`} style={{ width: 14, height: 14, borderWidth: 2 }} />
      </span>
      {label}
    </div>
  );
}
