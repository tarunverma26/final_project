import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import DarkMap from "@/components/DarkMap";
import RainLayer from "@/components/RainLayer";
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
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ CIVIC MAP</p>
        <h1 className="font-display font-black text-4xl md:text-5xl mt-2">Every reported issue, live.</h1>
        <p className="text-zinc-400 mt-2 max-w-xl">
          Watch the city heal itself — resolved potholes ripple in green.
        </p>

        <div className="mt-6 flex flex-wrap gap-3 items-center" data-testid="map-legend">
          <LegendDot cls="critical" label={`Open · ${open}`} color="text-red-300" />
          <LegendDot cls="in-progress" label={`In Progress · ${inProgress}`} color="text-amber-300" />
          <LegendDot cls="resolved" label={`Resolved · ${resolvedCount}`} color="text-emerald-300" />
        </div>

        <div className="mt-6">
          <DarkMap markers={markers} height={620} />
        </div>
        <div className="mt-4 text-xs text-zinc-500 font-mono">{markers.length} report(s) on map</div>
      </div>
    </div>
  );
}

function LegendDot({ cls, label, color }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-mono ${color}`}>
      <span className="relative inline-flex" style={{ width: 14, height: 14 }}>
        <span className={`roadwatch-marker ${cls}`} style={{ width: 14, height: 14, borderWidth: 2 }} />
      </span>
      {label}
    </div>
  );
}
