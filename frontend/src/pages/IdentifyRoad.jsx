import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import DarkMap from "@/components/DarkMap";
import RainLayer from "@/components/RainLayer";
import { api } from "@/lib/api";
import { Crosshair, MapPin, Buildings, Warning } from "@phosphor-icons/react";

export default function IdentifyRoad() {
  const [loc, setLoc] = useState({ lat: 28.4595, lng: 77.0266 });
  const [info, setInfo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState("");

  const identify = async () => {
    setScanning(true); setErr("");
    let { lat, lng } = loc;
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => { lat = p.coords.latitude; lng = p.coords.longitude; setLoc({ lat, lng }); resolve(); },
          () => resolve(),
          { timeout: 4000 }
        );
      });
    }
    try {
      const { data } = await api.get("/roads/identify", { params: { lat, lng } });
      // dramatic scan delay
      setTimeout(() => { setInfo(data); setScanning(false); }, 1500);
    } catch (e) {
      setErr("Unable to identify road."); setScanning(false);
    }
  };

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={30} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ IDENTIFY</p>
        <h1 className="font-display font-black text-4xl md:text-6xl mt-2">Which road are you on?</h1>
        <p className="text-zinc-400 mt-3 max-w-xl">Use GPS to instantly pull road name, authority and current condition.</p>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div>
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className={scanning ? "gps-pulse" : "w-5 h-5 bg-amber-500 rounded-full"} />
                <div>
                  <div className="text-xs font-mono text-zinc-500">GPS COORDINATES</div>
                  <div className="font-mono text-amber-400">
                    {loc.lat.toFixed(4)}° N, {loc.lng.toFixed(4)}° E
                  </div>
                </div>
              </div>

              <button
                onClick={identify}
                disabled={scanning}
                data-testid="identify-gps-btn"
                className="mt-6 w-full py-4 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Crosshair size={20} weight="bold" />
                {scanning ? "Scanning..." : "Identify Road Using GPS"}
              </button>
              {err && <div className="mt-3 text-sm text-red-400 flex gap-2"><Warning size={16} /> {err}</div>}
            </div>

            {info && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl bg-[#111] border border-amber-500/30 p-6" data-testid="road-info-card">
                <div className="text-[11px] font-mono tracking-widest text-amber-400">/ ROAD PROFILE</div>
                <div className="font-display font-black text-2xl mt-1">{info.road_name}</div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Field icon={MapPin} label="Road Number" value={info.road_number} />
                  <Field icon={MapPin} label="District" value={info.district} />
                  <Field icon={MapPin} label="State" value={info.state} />
                  <Field icon={Warning} label="Condition" value={info.condition} accent />
                  <Field icon={Buildings} label="Authority" value={info.authority} />
                  <Field icon={Buildings} label="Contractor" value={info.contractor} />
                  <Field icon={Buildings} label="Constructed" value={info.construction_year} />
                  <Field icon={Buildings} label="Last Maintenance" value={info.last_maintenance} />
                  <Field icon={Buildings} label="Funding" value={info.funding_source} />
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <DarkMap
              center={[loc.lat, loc.lng]}
              zoom={13}
              markers={info ? [{ ...info, latitude: loc.lat, longitude: loc.lng, category: "Road", severity: "HIGH", status: "IDENTIFIED", road_name: info.road_name }] : []}
              height={520}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-lg bg-black/40 border border-white/5 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={12} /> {label}
      </div>
      <div className={`mt-1 text-sm font-medium ${accent ? "text-amber-400" : "text-white"}`}>
        {value || <span className="italic text-zinc-500">Data unavailable</span>}
      </div>
    </div>
  );
}
