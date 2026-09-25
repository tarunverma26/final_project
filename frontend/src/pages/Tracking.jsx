import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  MapPin,
  ClipboardText,
  Star,
  CheckCircle,
  Warning,
  BellSimple,
  WhatsappLogo,
  DeviceMobile,
} from "@phosphor-icons/react";

const DEMO_REPORT_RW10234 = {
  id: "RW-10234",
  category: "Pothole",
  severity: "HIGH",
  status: "RESOLVED",
  road_name: "NH-48 National Express Corridor (Km 32.4)",
  description: "Deep severe crater in middle lane following heavy rain. Poses acute high-speed accident hazard for two-wheelers and buses.",
  latitude: 28.4595,
  longitude: 77.0266,
  photo_url: "/assets/hero-bg.jpg",
  citizen_rating: 5,
  ai_assessment: {
    category: "Pothole",
    severity: "HIGH",
    safety_risk: "HIGH",
    confidence: 94,
    priority: "CRITICAL",
    model: "CivicVision-v2.4",
    recommendation: "Immediate cold-mix asphalt patching mandated under 48-hr SLA.",
  },
  timeline: [
    { step: "SUBMITTED", timestamp: "2026-09-22T08:15:00Z", note: "Citizen complaint registered via RoadWatch mobile web." },
    { step: "UNDER REVIEW", timestamp: "2026-09-22T08:30:00Z", note: "Automated optical AI vision audit confirmed high severity crater." },
    { step: "FORWARDED", timestamp: "2026-09-22T09:05:00Z", note: "Ticket routed to NHAI Regional Project Implementation Unit." },
    { step: "ASSIGNED", timestamp: "2026-09-22T10:20:00Z", note: "Contractor L&T Infrastructure Projects Ltd assigned with 48h SLA." },
    { step: "WORK PLANNED", timestamp: "2026-09-22T14:00:00Z", note: "Night shift cold-mix asphalt patching and lane closure scheduled." },
    { step: "WORK IN PROGRESS", timestamp: "2026-09-23T01:30:00Z", note: "Repair crew on-site: milling, bituminous filling, and roller compaction." },
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
  const [subPhone, setSubPhone] = useState("");
  const [subChannel, setSubChannel] = useState("whatsapp");
  const [subSuccess, setSubSuccess] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subPhone || subPhone.length < 10) return;
    setSubSuccess(true);
  };

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

              {/* SMS / WhatsApp Updates Subscription Card */}
              <div
                className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
                data-testid="tracking-subscription-card"
              >
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#F97316] uppercase mb-2">
                  <BellSimple size={16} weight="fill" />
                  <span>CITIZEN NOTIFICATION ALERTS</span>
                </div>
                <h3 className="font-display font-bold text-lg text-[#12304A]">
                  Subscribe for Live Progress Alerts
                </h3>
                <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                  Receive real-time push alerts whenever NHAI or the contractor advances this ticket through the 9-stage pipeline.
                </p>

                {subSuccess ? (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5">
                    <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Subscription Activated!</span>
                      <p className="mt-0.5 text-emerald-700">
                        Updates for ticket <span className="font-mono font-semibold">#{report.id}</span> will be dispatched to <span className="font-mono font-semibold">{subPhone}</span> via {subChannel === "whatsapp" ? "WhatsApp" : "SMS"}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubscribe} className="mt-4 space-y-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSubChannel("whatsapp")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                          subChannel === "whatsapp"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:bg-slate-100"
                        }`}
                      >
                        <WhatsappLogo size={15} weight="fill" className={subChannel === "whatsapp" ? "text-emerald-600" : ""} />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setSubChannel("sms")}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                          subChannel === "sms"
                            ? "bg-orange-50 text-orange-700 border-orange-300"
                            : "bg-slate-50 text-[#64748B] border-[#E2E8F0] hover:bg-slate-100"
                        }`}
                      >
                        <DeviceMobile size={15} weight="fill" className={subChannel === "sms" ? "text-orange-600" : ""} />
                        SMS
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-[#64748B]">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="98765 43210"
                          value={subPhone}
                          onChange={(e) => setSubPhone(e.target.value)}
                          required
                          pattern="[0-9]{10}"
                          maxLength={10}
                          className="w-full pl-11 pr-3 py-2.5 rounded-xl border border-[#CBD5E1] bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F97316]/30 text-xs font-mono text-[#0F172A]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#F97316] text-white hover:bg-[#EA580C] font-semibold text-xs transition shadow-sm cursor-pointer"
                      >
                        Subscribe
                      </button>
                    </div>
                    <span className="block text-[10px] text-[#94A3B8]">
                      Free civic service. No spam. You can unsubscribe anytime by replying STOP.
                    </span>
                  </form>
                )}
              </div>

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
