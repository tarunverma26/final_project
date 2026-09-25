import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, ClipboardText, Star, CheckCircle, Warning } from "@phosphor-icons/react";

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">/ COMPLAINT TRACKING</p>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-1">Resolution Pipeline</h1>
        <div className="text-xs font-mono text-[#64748B] mt-1 font-medium" data-testid="tracking-id">TICKET ID: {id}</div>

        {!report ? (
          <div className="grid lg:grid-cols-2 gap-6 mt-10 animate-pulse">
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/4" />
              <div className="h-8 bg-slate-100 rounded w-2/3" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-40 bg-slate-50 rounded-xl mt-4" />
            </div>
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6 space-y-4">
              <div className="h-4 bg-slate-100 rounded w-1/3" />
              <div className="h-32 bg-slate-50 rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] font-mono text-xs font-semibold">
                <ClipboardText size={14} /> STATUS: {report.status}
              </div>
              <div className="font-display font-black text-2xl text-[#12304A] mt-3">{report.category} · {report.severity}</div>
              {report.road_name && (
                <div className="mt-1.5 text-sm text-[#64748B] flex gap-1.5 items-center font-medium">
                  <MapPin size={16} className="text-[#EA580C]" /> {report.road_name}
                </div>
              )}
              {report.description && <p className="mt-3 text-sm text-[#475569] leading-relaxed">{report.description}</p>}
              {report.photo_url && (
                <img src={report.photo_url} alt="report" className="mt-4 rounded-xl h-52 w-full object-cover border border-[#E2E8F0] shadow-sm" />
              )}

              <div className="mt-6 border-t border-[#E2E8F0] pt-6">
                <Timeline steps={report.timeline} />
              </div>

              {user?.role === "admin" && (
                <div className="mt-6 border-t border-[#E2E8F0] pt-4">
                  <button
                    onClick={advance}
                    disabled={busy}
                    data-testid="advance-btn"
                    className="w-full py-3 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] disabled:opacity-50 shadow-sm transition text-sm flex items-center justify-center gap-1.5"
                  >
                    {busy ? "Advancing stage..." : "Advance to next pipeline stage →"}
                  </button>
                  {advErr && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1" data-testid="advance-error">
                      <Warning size={14} /> {advErr}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <AiAssessmentCard data={report.ai_assessment} thumbnail={report.photo_url} />

              {canRate && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 shadow-sm"
                     data-testid="rate-widget">
                  <div className="flex items-center gap-2 text-emerald-700 font-mono text-xs font-semibold">
                    <CheckCircle size={16} weight="fill" className="text-emerald-600" /> ROAD RESTORATION COMPLETED
                  </div>
                  <div className="font-display font-bold text-lg text-[#12304A] mt-2">
                    {alreadyRated ? "Your Citizen Rating" : "Rate the Repair Quality"}
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    Your public rating directly impacts the contractor's trust score and future municipal contract eligibility.
                  </p>
                  <div className="mt-4 flex gap-1.5" onMouseLeave={() => setHoverStar(0)}>
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
                          className={`p-1 rounded-lg transition-transform ${!alreadyRated ? "hover:scale-110" : ""}`}
                        >
                          <Star
                            size={28}
                            weight={filled ? "fill" : "regular"}
                            className={filled ? "text-[#F59E0B]" : "text-slate-300"}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {rateErr && <div className="mt-2 text-xs text-red-600">{rateErr}</div>}
                  {alreadyRated && (
                    <div className="mt-3 text-xs font-mono font-medium text-emerald-800 bg-emerald-100/60 px-3 py-1.5 rounded-lg inline-block">
                      ✓ Rating recorded · Thank you for helping keep public infrastructure accountable.
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
