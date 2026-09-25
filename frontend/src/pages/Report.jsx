import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
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
    if (!f.type.startsWith("image/")) {
      setErr("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setErr("Image file size exceeds maximum limit of 10 MB.");
      return;
    }
    setErr("");
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
      let uploadedUrl = null;
      if (photo) {
        const formData = new FormData();
        formData.append("file", photo);
        const uploadRes = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploadedUrl = uploadRes.data?.url;
      }

      const { data } = await api.post("/reports", {
        category,
        severity,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        road_name: roadName || null,
        photo_url: uploadedUrl || null,
      });
      setResult(data);
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">/ REPORT ISSUE</p>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-2">Report a road problem</h1>
        <p className="text-[#64748B] text-base mt-2 max-w-xl">
          Pick a category, add a photo & location. Our computer vision and AI agent pipeline takes it from there.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-10">
          {CATEGORIES.map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              data-testid={`category-${id.toLowerCase().replace(/\s+/g, "-")}`}
              className={`p-4 rounded-2xl border text-left transition-all ${
                category === id
                  ? "border-[#F97316] bg-orange-50/70 shadow-sm ring-2 ring-[#F97316]/20"
                  : "border-[#E2E8F0] bg-white hover:border-slate-300 shadow-xs"
              }`}
            >
              <Icon size={22} weight="duotone" className={category === id ? "text-[#EA580C]" : "text-[#64748B]"} />
              <div className={`font-display font-bold mt-2 text-sm ${category === id ? "text-[#EA580C]" : "text-[#12304A]"}`}>{id}</div>
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-10 grid lg:grid-cols-2 gap-6" data-testid="report-form">
          <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6 space-y-5">
            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">SEVERITY LEVEL</label>
              <div className="mt-2 flex gap-2 flex-wrap">
                {SEVERITIES.map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSeverity(s)}
                    data-testid={`severity-${s.toLowerCase()}`}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium border transition ${
                      severity === s
                        ? "border-[#F97316] bg-orange-50 text-[#EA580C] shadow-xs"
                        : "border-[#CBD5E1] bg-white text-[#64748B] hover:border-slate-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">ROAD / LANDMARK IDENTIFIER</label>
              <input
                value={roadName}
                onChange={(e) => { setRoadName(e.target.value); if (err) setErr(""); }}
                data-testid="report-road-input"
                placeholder="e.g. NH-48 near Cyber Hub, Sector 24"
                className="mt-1.5 w-full rounded-xl bg-white border border-[#CBD5E1] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F97316] shadow-sm transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">OBSERVATION DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); if (err) setErr(""); }}
                data-testid="report-desc-input"
                rows={3}
                placeholder="What did you observe? (depth, traffic impact, weather context...)"
                className="mt-1.5 w-full rounded-xl bg-white border border-[#CBD5E1] px-4 py-3 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#F97316] shadow-sm transition"
              />
            </div>

            <div className="flex gap-3">
              <label className="flex-1 cursor-pointer rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] hover:bg-slate-100 hover:border-[#F97316] px-4 py-3 flex items-center justify-center gap-2 text-sm text-[#334155] font-medium transition shadow-xs">
                <Camera size={18} className="text-[#EA580C]" /> {photo ? photo.name : "Upload Photo"}
                <input type="file" accept="image/*" onChange={onPhoto} className="hidden" data-testid="report-photo-input" />
              </label>
              <button
                type="button"
                onClick={useLocation}
                data-testid="report-location-btn"
                className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-sm font-medium transition shadow-xs ${
                  coords.lat
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-[#CBD5E1] bg-[#F8FAFC] text-[#334155] hover:bg-slate-100 hover:border-[#F97316]"
                }`}
              >
                <MapPin size={18} className={coords.lat ? "text-emerald-600" : "text-[#EA580C]"} />
                {coords.lat ? "GPS Located" : "Use Location"}
              </button>
            </div>

            {preview && (
              <img src={preview} alt="preview" className="rounded-xl h-44 w-full object-cover border border-[#E2E8F0] shadow-sm" />
            )}

            {err && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
                <Warning size={16} className="text-red-500 flex-shrink-0" /> {err}
              </div>
            )}
            {!user && (
              <div className="text-xs text-[#64748B] bg-slate-50 border border-slate-200 rounded-lg p-2.5">
                Note: You will be redirected to log in before submitting this civic ticket.
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              data-testid="report-submit-btn"
              className="w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] disabled:opacity-50 flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 transition text-sm"
            >
              {busy ? "Analyzing with AI Vision Agent..." : <>Submit Official Report <PaperPlaneRight size={16} weight="bold" /></>}
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
                    className="mt-4 w-full py-3 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#12304A] font-semibold shadow-sm transition"
                  >
                    View Public Complaint Tracking →
                  </button>
                </div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm p-8 h-full min-h-[350px] flex flex-col items-center justify-center text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4">
                    <Wrench size={30} className="text-[#0F766E]" weight="duotone" />
                  </div>
                  <div className="font-display font-bold text-lg text-[#12304A]">AI Vision Telemetry</div>
                  <p className="text-sm text-[#64748B] mt-2 max-w-xs leading-relaxed">
                    Upload a photo and our multi-stage vision model calculates depth, severity, hazardous impact, and SLA response tier in real time.
                  </p>
                  <div className="mt-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-mono text-[#64748B]">
                    <span className="w-2 h-2 rounded-full bg-teal-500" /> SIH Automated Audit Ready
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </div>
    </div>
  );
}
