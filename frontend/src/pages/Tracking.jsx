import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import RainLayer from "@/components/RainLayer";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, ClipboardText, Star, CheckCircle } from "@phosphor-icons/react";

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

  const load = () => api.get(`/reports/${id}`).then((r) => {
    setReport(r.data); setRating(r.data.citizen_rating || 0);
  });
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
