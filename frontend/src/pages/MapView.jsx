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
  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ CIVIC MAP</p>
        <h1 className="font-display font-black text-4xl md:text-5xl mt-2">Every reported issue, live.</h1>
        <p className="text-zinc-400 mt-2 max-w-xl">Potholes, incidents, events & road conditions across your city.</p>
        <div className="mt-8">
          <DarkMap markers={markers} height={620} />
        </div>
        <div className="mt-4 text-xs text-zinc-500 font-mono">{markers.length} report(s) on map</div>
      </div>
    </div>
  );
}
