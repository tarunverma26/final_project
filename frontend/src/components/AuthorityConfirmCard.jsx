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
      className="rounded-2xl border border-white/10 bg-[#0F0F0F] p-6"
      data-testid="authority-confirm-card"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <Users size={16} className="text-amber-400" weight="duotone" />
        </div>
        <div>
          <div className="text-[10px] tracking-widest text-amber-400 font-mono">/ ROAD OWNERSHIP LAYER</div>
          <div className="font-display font-bold text-base">Who actually owns this road?</div>
        </div>
        {communityLocked && (
          <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono">
            <Sparkle size={10} weight="fill" /> COMMUNITY-VERIFIED
          </span>
        )}
      </div>

      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">OSM inferred</div>
          <div className="mt-1 text-sm text-white flex items-center gap-1.5">
            <Buildings size={12} />
            {info.authority || <span className="italic text-zinc-500">Unknown</span>}
          </div>
        </div>
        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">Community says</div>
          <div className="mt-1 text-sm text-emerald-300 flex items-center gap-1.5">
            <Buildings size={12} />
            {stats?.community_authority || <span className="italic text-zinc-500">Not enough votes yet</span>}
          </div>
          <div className="text-[10px] text-zinc-600 mt-1 font-mono">
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
                <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                  <span className="truncate max-w-[70%]">{row.authority}</span>
                  <span>{row.count}</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!user ? (
        <div className="mt-4 text-xs text-zinc-500 border-t border-white/5 pt-4">
          <Link to="/login" className="text-amber-400 hover:underline">Sign in</Link>{" "}
          to help the city learn who owns this road.
        </div>
      ) : voted ? (
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-emerald-400 border-t border-white/5 pt-4">
          <CheckCircle size={14} weight="fill" /> Vote recorded — thanks for teaching ROADWATCH.
        </div>
      ) : (
        <div className="mt-4 border-t border-white/5 pt-4">
          <AnimatePresence mode="wait">
            {mode === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-xs text-zinc-400 mb-3">Is the inferred authority correct for this segment?</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!info.authority || busy}
                    onClick={confirmYes}
                    data-testid="authority-confirm-yes"
                    className="flex-1 py-2.5 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-400 disabled:opacity-40 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={16} weight="bold" /> Yes, correct
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setMode("dispute")}
                    data-testid="authority-confirm-no"
                    className="flex-1 py-2.5 rounded-lg border border-white/10 hover:border-red-400/50 text-white font-semibold flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={16} weight="bold" /> No, suggest
                  </button>
                </div>
                {err && <div className="mt-2 text-xs text-red-400">{err}</div>}
              </motion.div>
            )}
            {mode === "dispute" && (
              <motion.div key="dispute" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <label className="block text-xs text-zinc-400 mb-1 font-mono">Who really owns it?</label>
                <select
                  value={suggest}
                  onChange={(e) => setSuggest(e.target.value)}
                  data-testid="authority-suggest-select"
                  className="w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                >
                  {options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                {suggest === "Other" && (
                  <input
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    data-testid="authority-suggest-custom"
                    placeholder="Type the authority name…"
                    className="mt-2 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                  />
                )}
                {err && <div className="mt-2 text-xs text-red-400">{err}</div>}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={confirmNo}
                    data-testid="authority-submit-dispute"
                    className="flex-1 py-2.5 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-40"
                  >
                    {busy ? "Submitting..." : "Submit correction"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode("idle"); setErr(""); }}
                    className="py-2.5 px-4 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300"
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
