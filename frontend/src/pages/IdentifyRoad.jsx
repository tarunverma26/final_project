import { useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import DarkMap from "@/components/DarkMap";
import RainLayer from "@/components/RainLayer";
import AuthorityConfirmCard from "@/components/AuthorityConfirmCard";
import { api } from "@/lib/api";
import { Crosshair, MapPin, Buildings, Warning, ArrowSquareOut } from "@phosphor-icons/react";

export default function IdentifyRoad() {
  const [loc, setLoc] = useState({ lat: 28.4595, lng: 77.0266 });
  const [info, setInfo] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState("");

  const lookup = async (lat, lng) => {
    setScanning(true); setErr(""); setInfo(null);
    try {
      const { data } = await api.get("/roads/identify", { params: { lat, lng } });
      setTimeout(() => { setInfo(data); setScanning(false); }, 1200);
    } catch (e) {
      setErr("Unable to identify road. Try again."); setScanning(false);
    }
  };

  const useGps = async () => {
    let { lat, lng } = loc;
    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (p) => { lat = p.coords.latitude; lng = p.coords.longitude; setLoc({ lat, lng }); resolve(); },
          () => resolve(),
          { timeout: 5000, enableHighAccuracy: true }
        );
      });
    }
    await lookup(lat, lng);
  };

  const onMapPick = async ({ lat, lng }) => {
    setLoc({ lat, lng });
    await lookup(lat, lng);
  };

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={30} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ IDENTIFY</p>
        <h1 className="font-display font-black text-4xl md:text-6xl mt-2">Which road are you on?</h1>
        <p className="text-zinc-400 mt-3 max-w-xl">
          Use GPS or click anywhere on the map — we resolve the actual road name, authority and OSM tags in real time.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div>
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center gap-3">
                <div className={scanning ? "gps-pulse" : "w-5 h-5 bg-amber-500 rounded-full"} />
                <div>
                  <div className="text-xs font-mono text-zinc-500">GPS COORDINATES</div>
                  <div className="font-mono text-amber-400" data-testid="identify-coords">
                    {loc.lat.toFixed(5)}° N, {loc.lng.toFixed(5)}° E
                  </div>
                </div>
              </div>

              <button
                onClick={useGps}
                disabled={scanning}
                data-testid="identify-gps-btn"
                className="mt-6 w-full py-4 rounded-xl bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Crosshair size={20} weight="bold" />
                {scanning ? "Resolving road..." : "Identify Road Using GPS"}
              </button>
              <div className="mt-3 text-xs text-zinc-500 font-mono text-center">
                or click the map to drop a pin
              </div>
              {err && <div className="mt-3 text-sm text-red-400 flex gap-2"><Warning size={16} /> {err}</div>}
            </div>

            {info && (
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl bg-[#111] border border-amber-500/30 p-6" data-testid="road-info-card">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono tracking-widest text-amber-400">/ ROAD PROFILE</div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    source: {info.source || "openstreetmap"}
                  </span>
                </div>
                <div className="font-display font-black text-2xl mt-1">
                  {info.road_name || <span className="italic text-zinc-500">Unnamed segment</span>}
                </div>
                {info.display_name && (
                  <div className="text-xs text-zinc-500 mt-1">{info.display_name}</div>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Field icon={MapPin} label="Road Number / Ref" value={info.road_number} />
                  <Field icon={MapPin} label="District" value={info.district} />
                  <Field icon={MapPin} label="State" value={info.state} />
                  <Field icon={MapPin} label="Country" value={info.country} />
                  <Field icon={Warning} label="Condition" value={info.condition} accent />
                  <Field icon={Buildings} label="Authority" value={info.authority} />
                  <Field icon={Buildings} label="Contractor" value={info.contractor} />
                  <Field icon={Buildings} label="Surface" value={info.surface} />
                  <Field icon={Buildings} label="Max Speed" value={info.maxspeed} />
                  <Field icon={Buildings} label="Lanes" value={info.lanes} />
                  <Field icon={Buildings} label="Constructed" value={info.construction_year} />
                  <Field icon={Buildings} label="Last Maintenance" value={info.last_maintenance} />
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=18/${loc.lat}/${loc.lng}`}
                  target="_blank" rel="noreferrer"
                  data-testid="identify-osm-link"
                  className="mt-5 inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-mono"
                >
                  Open on OpenStreetMap <ArrowSquareOut size={12} />
                </a>
              </motion.div>
            )}

            {info && <div className="mt-6"><AuthorityConfirmCard info={info} /></div>}
          </div>

          <div>
            <DarkMap
              center={[loc.lat, loc.lng]}
              zoom={15}
              onPick={onMapPick}
              pickedMarker={{ lat: loc.lat, lng: loc.lng }}
              height={560}
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
