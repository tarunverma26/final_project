import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Buildings, CheckCircle, XCircle, Users, Sparkle } from "@phosphor-icons/react";

const FALLBACK_OPTIONS = [
  "National Highways Authority of India (NHAI)",
  "State Public Works Department",
  "Zilla Parishad / District Administration",
  "Municipal Corporation / Local Body",
  "Border Roads Organisation (BRO)",
  "Cantonment Board",
  "Toll Concessionaire (Private)",
  "Private / Corporate Road",
  "Other",
];

export default function AuthorityConfirmCard({ info }) {
  const { user } = useAuth();
  const [options, setOptions] = useState(FALLBACK_OPTIONS);
  const [mode, setMode] = useState("idle"); // idle | dispute
  const [suggest, setSuggest] = useState(FALLBACK_OPTIONS[0]);
  const [customText, setCustomText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    api.get("/roads/authority-options").then((r) => setOptions(r.data.options || FALLBACK_OPTIONS)).catch(() => {});
    setStats({
      community_authority: info?.community_authority,
      total_confirmations: info?.community_confirmations || 0,
      disputes: info?.community_disputes || 0,
      tally: info?.community_tally || [],
    });
    setVoted(false); setMode("idle"); setErr("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.segment_key]);

  if (!info) return null;

  const post = async (payload) => {
    setBusy(true); setErr("");
    try {
      const { data } = await api.post("/roads/confirm-authority", payload);
      setStats({
        community_authority: data.community_authority,
        total_confirmations: data.total_confirmations,
        disputes: data.disputes,
        tally: data.tally,
      });
      setVoted(true); setMode("idle");
    } catch (e) {
      setErr(e.response?.data?.detail || "Unable to submit vote.");
    }
    setBusy(false);
  };

  const confirmYes = () =>
    post({
      road_name: info.road_name, road_number: info.road_number,
      latitude: info.latitude, longitude: info.longitude,
      inferred_authority: info.authority,
      is_correct: true,
    });

  const confirmNo = () => {
    const authority = suggest === "Other" ? customText.trim() : suggest;
    if (!authority) { setErr("Please pick or enter an authority."); return; }
    post({
      road_name: info.road_name, road_number: info.road_number,
      latitude: info.latitude, longitude: info.longitude,
      inferred_authority: info.authority,
      is_correct: false,
      suggested_authority: authority,
    });
  };

  const communityLocked = info.authority_source === "community";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
      data-testid="authority-confirm-card"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center">
          <Users size={16} className="text-[#EA580C]" weight="duotone" />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-[#EA580C] font-mono font-bold">/ ROAD OWNERSHIP LAYER</div>
          <div className="font-display font-bold text-base text-[#12304A]">Who actually owns this road?</div>
        </div>
        {communityLocked && (
          <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-semibold">
            <Sparkle size={10} weight="fill" /> COMMUNITY-VERIFIED
          </span>
        )}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">OSM inferred</div>
          <div className="mt-1 text-sm text-[#12304A] font-medium flex items-center gap-1.5">
            <Buildings size={14} className="text-[#64748B]" />
            {info.authority || <span className="italic text-[#94A3B8]">Unknown</span>}
          </div>
        </div>
        <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
          <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-mono">Community says</div>
          <div className="mt-1 text-sm text-emerald-700 font-semibold flex items-center gap-1.5">
            <Buildings size={14} className="text-emerald-600" />
            {stats?.community_authority || <span className="italic text-[#94A3B8] font-normal">Not enough votes yet</span>}
          </div>
          <div className="text-[10px] text-[#64748B] mt-1 font-mono">
            {stats?.total_confirmations || 0} confirmations · {stats?.disputes || 0} disputes
          </div>
        </div>
      </div>

      {stats?.tally?.length > 1 && (
        <div className="mt-3 space-y-1.5" data-testid="authority-tally">
          {stats.tally.map((row) => {
            const max = stats.tally[0]?.count || 1;
            const pct = Math.round((row.count / max) * 100);
            return (
              <div key={row.authority}>
                <div className="flex justify-between text-[10px] font-mono text-[#64748B]">
                  <span className="truncate max-w-[70%]">{row.authority}</span>
                  <span className="font-semibold text-[#12304A]">{row.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!user ? (
        <div className="mt-4 text-xs text-[#64748B] border-t border-[#E2E8F0] pt-4">
          <Link to="/login" className="text-[#EA580C] font-semibold hover:underline">Sign in</Link>{" "}
          to help the city learn who owns this road.
        </div>
      ) : voted ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono font-medium text-emerald-700 border-t border-[#E2E8F0] pt-4">
          <CheckCircle size={15} weight="fill" className="text-emerald-600" /> Vote recorded — thanks for teaching ROADWATCH.
        </div>
      ) : (
        <div className="mt-4 border-t border-[#E2E8F0] pt-4">
          <AnimatePresence mode="wait">
            {mode === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-xs text-[#475569] mb-3">Is the inferred authority correct for this segment?</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!info.authority || busy}
                    onClick={confirmYes}
                    data-testid="authority-confirm-yes"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <CheckCircle size={16} weight="bold" /> Yes, correct
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setMode("dispute")}
                    data-testid="authority-confirm-no"
                    className="flex-1 py-2.5 rounded-xl border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#12304A] font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <XCircle size={16} weight="bold" className="text-red-500" /> No, suggest
                  </button>
                </div>
                {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
              </motion.div>
            )}
            {mode === "dispute" && (
              <motion.div key="dispute" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <label className="block text-xs text-[#475569] mb-1 font-mono font-medium">Who really owns it?</label>
                <select
                  value={suggest}
                  onChange={(e) => setSuggest(e.target.value)}
                  data-testid="authority-suggest-select"
                  className="w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                >
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {suggest === "Other" && (
                  <input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    data-testid="authority-suggest-custom"
                    placeholder="Type the authority name…"
                    className="mt-2 w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                  >
                  </input>
                )}
                {err && <div className="mt-2 text-xs text-red-600">{err}</div>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirmNo}
                    data-testid="authority-submit-dispute"
                    className="flex-1 py-2.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] disabled:opacity-40 shadow-sm transition"
                  >
                    {busy ? "Submitting..." : "Submit correction"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("idle"); setErr(""); }}
                    className="py-2.5 px-4 rounded-xl border border-[#CBD5E1] hover:bg-slate-50 text-[#475569] font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
