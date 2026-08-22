import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import RainLayer from "@/components/RainLayer";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { MapPin, ClipboardText } from "@phosphor-icons/react";

export default function Tracking() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [busy, setBusy] = useState(false);
  const [advErr, setAdvErr] = useState("");

  const load = () => api.get(`/reports/${id}`).then((r) => setReport(r.data));
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

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ TRACKING</p>
        <h1 className="font-display font-black text-4xl md:text-5xl mt-2">Complaint status</h1>
        <div className="text-xs font-mono text-zinc-500 mt-2" data-testid="tracking-id">ID: {id}</div>

        {!report ? (
          <div className="mt-10 text-zinc-500">Loading...</div>
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

            <div>
              <AiAssessmentCard data={report.ai_assessment} thumbnail={report.photo_url} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
