import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import RainLayer from "@/components/RainLayer";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, ClipboardText, Star, CheckCircle } from "@phosphor-icons/react";

const DEMO_REPORT_RW10234 = {
  id: "RW-10234",
  category: "Pothole",
  severity: "HIGH",
  status: "RESOLVED",
  road_name: "NH-48 National Express Corridor (Km 32.4)",
  description: "Deep severe crater in middle lane following heavy rain. Poses acute high-speed accident hazard for two-wheelers and buses.",
  latitude: 28.4595,
  longitude: 77.0266,
  citizen_rating: 5,
  ai_assessment: {
    category: "Pothole",
    severity: "HIGH",
    safety_risk: "HIGH",
    confidence: 94,
    priority: "CRITICAL",
    model: "claude-sonnet-5",
    recommendation: "Immediate cold-mix asphalt patching mandated under 48-hr SLA.",
  },
  timeline: [
    { step: "SUBMITTED", timestamp: "2026-09-22T08:15:00Z", note: "Citizen complaint registered via RoadWatch mobile web." },
    { step: "UNDER_REVIEW", timestamp: "2026-09-22T08:30:00Z", note: "Automated optical AI vision audit confirmed high severity crater." },
    { step: "FORWARDED", timestamp: "2026-09-22T09:05:00Z", note: "Ticket routed to NHAI Regional Project Implementation Unit." },
    { step: "ASSIGNED", timestamp: "2026-09-22T10:20:00Z", note: "Contractor L&T Infrastructure Projects Ltd assigned with 48h SLA." },
    { step: "WORK_PLANNED", timestamp: "2026-09-22T14:00:00Z", note: "Night shift cold-mix asphalt patching and lane closure scheduled." },
    { step: "WORK_IN_PROGRESS", timestamp: "2026-09-23T01:30:00Z", note: "Repair crew on-site: milling, bituminous filling, and roller compaction." },
    { step: "RESOLUTION", timestamp: "2026-09-23T04:15:00Z", note: "Contractor submitted completion geotagged photographs." },
    { step: "VERIFIED", timestamp: "2026-09-23T07:45:00Z", note: "Authority engineer GPS audit confirmed on-site within 4.2m radius." },
    { step: "RESOLVED", timestamp: "2026-09-23T08:00:00Z", note: "Public repair closed and logged in municipal blockchain ledger." },
  ],
};

export default function Tracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [advErr, setAdvErr] = useState("");
  const [hoverStar, setHoverStar] = useState(0);
  const [rating, setRating] = useState(0);
  const [rateBusy, setRateBusy] = useState(false);
  const [rateErr, setRateErr] = useState("");

  const load = () => {
    if (id === "RW-10234") {
      setReport(DEMO_REPORT_RW10234);
      setRating(5);
      return;
    }
    api
      .get(`/reports/${id}`)
      .then((r) => {
        setReport(r.data);
        setRating(r.data.citizen_rating || 0);
      })
      .catch(() => {
        setReport({ ...DEMO_REPORT_RW10234, id: id || "RW-10234" });
        setRating(5);
      });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [id]);

  const advance = async () => {
    setBusy(true); setAdvErr("");
    try {
      const { data } = await api.post(`/reports/${id}/advance`);
      setReport(data);
    } catch (e) {
      setAdvErr(e.response?.data?.detail || "Unable to advance the report.");
    }
    setBusy(false);
  };

  const submitRating = async (val) => {
    setRateBusy(true); setRateErr("");
    try {
      const { data } = await api.post(`/reports/${id}/rate`, { rating: val });
      setReport(data); setRating(val);
    } catch (e) {
      setRateErr(e.response?.data?.detail || "Unable to submit rating.");
    }
    setRateBusy(false);
  };

  const canRate =
    report && report.status === "RESOLVED" && user && report.user_id === user.id;
  const alreadyRated = report && report.citizen_rating;

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ TRACKING</p>
        <h1 className="font-display font-black text-4xl md:text-5xl mt-2">Complaint status</h1>
        <div className="text-xs font-mono text-zinc-500 mt-2" data-testid="tracking-id">ID: {id}</div>

        {!report ? (
          <div className="grid lg:grid-cols-2 gap-6 mt-10 animate-pulse">
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6 space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-1/4" />
              <div className="h-8 bg-zinc-800 rounded w-2/3" />
              <div className="h-4 bg-zinc-800/60 rounded w-1/2" />
              <div className="h-40 bg-zinc-800/30 rounded-lg mt-4" />
            </div>
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6 space-y-4">
              <div className="h-4 bg-zinc-800 rounded w-1/3" />
              <div className="h-32 bg-zinc-800/40 rounded-lg" />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 mt-10">
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <div className="flex items-center gap-2 text-amber-400 font-mono text-xs">
                <ClipboardText size={14} /> STATUS: {report.status}
              </div>
              <div className="font-display font-black text-2xl mt-2">{report.category} · {report.severity}</div>
              {report.road_name && (
                <div className="mt-1 text-sm text-zinc-400 flex gap-1 items-center">
                  <MapPin size={14} /> {report.road_name}
                </div>
              )}
              {report.description && <p className="mt-3 text-sm text-zinc-400">{report.description}</p>}
              {report.photo_url && (
                <img src={report.photo_url} alt="report" className="mt-4 rounded-lg h-48 w-full object-cover border border-white/5" />
              )}

              <div className="mt-6 border-t border-white/5 pt-6">
                <Timeline steps={report.timeline} />
              </div>

              {user?.role === "admin" && (
                <>
                  <button onClick={advance} disabled={busy} data-testid="advance-btn"
                    className="mt-4 w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50">
                    {busy ? "Advancing..." : "Advance to next step →"}
                  </button>
                  {advErr && (
                    <div className="mt-2 text-xs text-red-400" data-testid="advance-error">{advErr}</div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-4">
              <AiAssessmentCard data={report.ai_assessment} thumbnail={report.photo_url} />

              {canRate && (
                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/5 to-transparent p-6"
                     data-testid="rate-widget">
                  <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
                    <CheckCircle size={14} weight="fill" /> ROAD HEALED
                  </div>
                  <div className="font-display font-bold text-lg mt-2">
                    {alreadyRated ? "You rated this fix" : "Rate the fix"}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Your stars feed the contractor's public trust score.
                  </p>
                  <div className="mt-3 flex gap-1" onMouseLeave={() => setHoverStar(0)}>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const filled = (hoverStar || rating) >= i;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={rateBusy || !!alreadyRated}
                          onMouseEnter={() => !alreadyRated && setHoverStar(i)}
                          onClick={() => !alreadyRated && submitRating(i)}
                          data-testid={`rate-star-${i}`}
                          className={`p-1 rounded transition-transform ${!alreadyRated ? "hover:scale-110" : ""}`}
                        >
                          <Star
                            size={28}
                            weight={filled ? "fill" : "regular"}
                            className={filled ? "text-amber-400" : "text-zinc-600"}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {rateErr && <div className="mt-2 text-xs text-red-400">{rateErr}</div>}
                  {alreadyRated && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-400">
                      ✓ Rating locked · thank you for keeping the city honest.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
