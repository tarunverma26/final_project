import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import { api } from "@/lib/api";
import { HardHat, Trophy, Star, Clock, CheckCircle, WarningOctagon } from "@phosphor-icons/react";

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

function trustColor(score) {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#84CC16";
  if (score >= 55) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}

function TrustGauge({ score = 0 }) {
  const dash = (score / 100) * RING_C;
  return (
    <div className="relative w-24 h-24 shrink-0" data-testid={`trust-gauge-${score}`}>
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={RING_R} fill="none" stroke="#27272A" strokeWidth="8" />
        <motion.circle
          cx="48" cy="48" r={RING_R} fill="none"
          stroke={trustColor(score)} strokeWidth="8" strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${RING_C}` }}
          animate={{ strokeDasharray: `${dash} ${RING_C}` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-display font-black text-2xl" style={{ color: trustColor(score) }}>{score}</div>
        <div className="text-[9px] font-mono tracking-widest text-zinc-500">TRUST</div>
      </div>
    </div>
  );
}

function Stars({ value }) {
  const num = typeof value === "number" && !isNaN(value) ? value : null;
  if (num == null) return <span className="text-zinc-500 italic text-xs">No ratings yet</span>;
  const full = Math.round(num);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} weight={i <= full ? "fill" : "regular"} className={i <= full ? "text-amber-400" : "text-zinc-600"} />
      ))}
      <span className="text-xs text-zinc-400 ml-1 font-mono">{num.toFixed(2)}</span>
    </div>
  );
}

export default function Contractors() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/contractors").then((r) => { setItems(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const leader = items[0];

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ CONTRACTORS</p>
        <h1 className="font-display font-black text-4xl md:text-6xl mt-2">
          Trust <span className="text-amber-400">Scorecards</span>
        </h1>
        <p className="text-zinc-400 mt-3 max-w-xl">
          Public accountability: every contractor scored on complaints, resolution speed and citizen ratings.
        </p>

        {leader && (
          <div className="mt-8 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-6 flex items-center gap-6" data-testid="contractor-leader">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
              <Trophy size={22} weight="fill" className="text-black" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono text-amber-400 tracking-widest">/ CURRENT LEADER</div>
              <div className="font-display font-black text-xl">{leader.name}</div>
              <div className="text-xs text-zinc-500">{leader.road} · {leader.region}</div>
            </div>
            <div className="text-right">
              <div className="font-display font-black text-4xl" style={{ color: trustColor(leader.trust_score) }}>
                {leader.trust_score}
              </div>
              <div className="text-[10px] tracking-widest text-zinc-500 font-mono">GRADE {leader.grade}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-[#111] border border-white/5 p-6 animate-pulse space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800 rounded w-1/3" />
                    <div className="h-6 bg-zinc-800 rounded w-3/4" />
                    <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-zinc-800/30 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid md:grid-cols-2 gap-4" data-testid="contractors-grid">
            {items.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl bg-[#111] border border-white/5 p-6 hover:border-amber-500/30 transition-colors"
                data-testid={`contractor-card-${c.id}`}
              >
                <div className="flex items-start gap-5">
                  <TrustGauge score={c.trust_score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <HardHat size={16} className="text-amber-400" weight="duotone" />
                      <span className="text-[10px] font-mono tracking-widest text-zinc-500">GRADE {c.grade}</span>
                    </div>
                    <div className="font-display font-bold text-lg mt-1 truncate">{c.name}</div>
                    <div className="text-xs text-zinc-500">{c.road} · {c.region}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{c.focus}</div>
                    <div className="mt-3">
                      <Stars value={c.avg_rating} />
                      <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                        {c.rating_count} citizen rating{c.rating_count === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/5 pt-4">
                  <Metric icon={WarningOctagon} label="Complaints" value={c.total_complaints} color="text-white" />
                  <Metric icon={CheckCircle} label="Resolved" value={`${c.resolution_rate_pct}%`} color="text-emerald-400" />
                  <Metric
                    icon={Clock}
                    label="Avg Speed"
                    value={c.avg_resolution_hours != null ? `${c.avg_resolution_hours}h` : "—"}
                    color="text-amber-400"
                  />
                </div>

                <div className="mt-4 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.trust_score}%` }}
                    transition={{ duration: 1 }}
                    className="h-full"
                    style={{ background: `linear-gradient(90deg, ${trustColor(c.trust_score)}, #F59E0B)` }}
                  />
                </div>

                <Link
                  to="/map"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-mono"
                >
                  View complaints on map →
                </Link>
              </motion.div>
            ))}
            {!items.length && (
              <div className="col-span-full text-sm text-zinc-500 italic text-center py-10">
                No contractors on file yet.
              </div>
            )}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-black/40 border border-white/5 p-5">
          <div className="text-[10px] tracking-widest text-amber-400 font-mono mb-2">/ HOW TRUST IS CALCULATED</div>
          <div className="grid md:grid-cols-4 gap-3 text-xs text-zinc-400">
            <div><span className="text-white font-semibold">Resolution rate (30 pts)</span> — how many complaints reach RESOLVED.</div>
            <div><span className="text-white font-semibold">Citizen rating (20 pts)</span> — average of 1–5 stars given after fixes.</div>
            <div><span className="text-white font-semibold">Speed (10 pts)</span> — median hours from submission to resolution.</div>
            <div><span className="text-white font-semibold">Base (40 pts)</span> — starting benefit-of-the-doubt.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-lg bg-black/40 border border-white/5 p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-zinc-500">
        <Icon size={10} weight="duotone" /> {label}
      </div>
      <div className={`mt-0.5 font-display font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
