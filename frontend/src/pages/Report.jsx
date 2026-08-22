import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Warning, Path, Drop, Lightbulb, Signpost as TrafficSign, Divide, Barricade, Question, Wrench, MapPin, Camera, PaperPlaneRight
} from "@phosphor-icons/react";

const CATEGORIES = [
  { id: "Pothole", icon: Warning },
  { id: "Damaged Road", icon: Path },
  { id: "Cracks", icon: Path },
  { id: "Waterlogging", icon: Drop },
  { id: "Drainage", icon: Drop },
  { id: "Streetlight", icon: Lightbulb },
  { id: "Sign", icon: TrafficSign },
  { id: "Divider", icon: Divide },
  { id: "Traffic Obstruction", icon: Barricade },
  { id: "Other", icon: Question },
];

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function Report() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [category, setCategory] = useState("Pothole");
  const [severity, setSeverity] = useState("HIGH");
  const [description, setDescription] = useState("");
  const [roadName, setRoadName] = useState("");
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const useLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setCoords({ lat: 28.4595, lng: 77.0266 }),
    );
  };

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    const r = new FileReader();
    r.onload = () => setPreview(r.result);
    r.readAsDataURL(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { nav("/login"); return; }
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/reports", {
        category, severity, description,
        latitude: coords.lat, longitude: coords.lng,
        road_name: roadName || null,
        photo_url: preview || null,
      });
      setResult(data);
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div className="asphalt-bg min-h-screen relative">
      <Navbar />
      <RainLayer count={30} />
      {category === "Pothole" && (
        <div className="absolute right-10 top-40 opacity-30 pointer-events-none">
          <div className="pothole" style={{ width: 180, height: 130 }} />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ REPORT</p>
        <h1 className="font-display font-black text-4xl md:text-6xl mt-2">Report a road problem</h1>
        <p className="text-zinc-400 mt-3 max-w-xl">Pick a category, add a photo & location. Our AI takes it from there.</p>

        <div className="grid lg:grid-cols-3 gap-3 mt-10">
          {CATEGORIES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              data-testid={`category-${id.toLowerCase().replace(/\s+/g, "-")}`}
              className={`p-5 rounded-2xl border text-left transition-all ${
                category === id
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-white/5 bg-[#111] hover:border-white/20"
              }`}
            >
              <Icon size={22} weight="duotone" className={category === id ? "text-amber-400" : "text-zinc-400"} />
              <div className={`font-display font-bold mt-2 ${category === id ? "text-amber-300" : "text-white"}`}>{id}</div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-10 grid lg:grid-cols-2 gap-6" data-testid="report-form">
          <div className="rounded-2xl bg-[#111] border border-white/5 p-6 space-y-4">
            <div>
              <label className="text-xs font-mono text-zinc-400">SEVERITY</label>
              <div className="mt-2 flex gap-2 flex-wrap">
                {SEVERITIES.map((s) => (
                  <button type="button" key={s} onClick={() => setSeverity(s)}
                    data-testid={`severity-${s.toLowerCase()}`}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono border ${
                      severity === s ? "border-amber-500 bg-amber-500/10 text-amber-300" : "border-white/10 text-zinc-400 hover:border-white/30"
                    }`}>{s}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400">ROAD / LANDMARK</label>
              <input value={roadName} onChange={(e) => setRoadName(e.target.value)}
                data-testid="report-road-input"
                placeholder="e.g. NH-48 near Cyber Hub"
                className="mt-2 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60" />
            </div>

            <div>
              <label className="text-xs font-mono text-zinc-400">DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                data-testid="report-desc-input"
                rows={3} placeholder="What did you see?"
                className="mt-2 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-3 focus:outline-none focus:border-amber-500/60" />
            </div>

            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-white/15 hover:border-amber-500/50 px-4 py-3 flex items-center gap-2 text-sm">
                <Camera size={18} /> {photo ? photo.name : "Upload Photo"}
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" data-testid="report-photo-input" />
              </label>
              <button type="button" onClick={useLocation} data-testid="report-location-btn"
                className="rounded-lg border border-white/15 hover:border-amber-500/50 px-4 py-3 flex items-center gap-2 text-sm">
                <MapPin size={18} /> {coords.lat ? "Located" : "Use Location"}
              </button>
            </div>

            {preview && <img src={preview} alt="preview" className="rounded-lg h-40 w-full object-cover border border-white/5" />}

            {err && <div className="text-sm text-red-400 flex gap-2"><Warning size={16} /> {err}</div>}
            {!user && <div className="text-xs text-zinc-500">You'll need to login to submit a report.</div>}

            <button type="submit" disabled={busy} data-testid="report-submit-btn"
              className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 flex items-center justify-center gap-2">
              {busy ? "Analyzing photo with AI..." : <>Submit Report <PaperPlaneRight size={16} weight="bold" /></>}
            </button>
          </div>

          <div>
            <AnimatePresence mode="wait">
              {result ? (
                <div>
                  <AiAssessmentCard data={result.ai_assessment} thumbnail={preview} />
                  <button
                    type="button"
                    onClick={() => nav(`/tracking/${result.id}`)}
                    data-testid="report-view-tracking"
                    className="mt-4 w-full py-3 rounded-lg border border-white/20 hover:bg-white/5"
                  >
                    View Complaint Tracking →
                  </button>
                </div>
              ) : (
                <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="rounded-2xl border border-white/5 bg-[#111] p-6 h-full flex flex-col items-center justify-center text-center">
                  <Wrench size={36} className="text-amber-400" weight="duotone" />
                  <div className="mt-4 font-display font-bold text-lg">AI assessment appears here</div>
                  <p className="text-sm text-zinc-500 mt-2 max-w-xs">Upload a photo and our vision layer (Claude Sonnet 5) scores severity, safety &amp; priority in real time.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}
