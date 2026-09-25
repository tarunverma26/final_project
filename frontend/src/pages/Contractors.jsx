import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { api } from "@/lib/api";
import { HardHat, Trophy, Star, Clock, CheckCircle, WarningOctagon } from "@phosphor-icons/react";

const RING_R = 40;
const RING_C = 2 * Math.PI * RING_R;

function trustColor(score) {
  if (score >= 85) return "#16A34A";
  if (score >= 70) return "#65A30D";
  if (score >= 55) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}

function TrustGauge({ score = 0 }) {
  const dash = (score / 100) * RING_C;
  return (
    <div className="relative w-24 h-24 shrink-0" data-testid={`trust-gauge-${score}`}>
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={RING_R} fill="none" stroke="#E2E8F0" strokeWidth="8" />
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
        <div className="text-[9px] font-mono tracking-widest text-[#64748B] font-bold">TRUST</div>
      </div>
    </div>
  );
}

function Stars({ value }) {
  if (value == null) return <span className="text-[#94A3B8] italic text-xs">No ratings yet</span>;
  const full = Math.round(value);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={14} weight={i <= full ? "fill" : "regular"} className={i <= full ? "text-[#F59E0B]" : "text-slate-300"} />
      ))}
      <span className="text-xs text-[#64748B] ml-1 font-mono font-medium">{value.toFixed(2)}</span>
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">/ CONTRACTORS</p>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-2">
          Trust <span className="text-[#EA580C]">Scorecards</span>
        </h1>
        <p className="text-[#64748B] text-base mt-2 max-w-xl">
          Public accountability in civic infrastructure: every contractor scored on complaints, resolution speed, SLA compliance, and citizen ratings.
        </p>

        {leader && (
          <div className="mt-8 rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50/70 via-white to-amber-50/40 p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm" data-testid="contractor-leader">
            <div className="w-12 h-12 rounded-xl bg-[#F97316] flex items-center justify-center shadow-sm">
              <Trophy size={24} weight="fill" className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono text-[#EA580C] font-bold tracking-widest">/ CURRENT TOP PERFORMER</div>
              <div className="font-display font-black text-xl text-[#12304A] mt-0.5">{leader.name}</div>
              <div className="text-xs text-[#64748B] font-medium">{leader.road} · {leader.region}</div>
            </div>
            <div className="text-left md:text-right">
              <div className="font-display font-black text-4xl" style={{ color: trustColor(leader.trust_score) }}>
                {leader.trust_score}
              </div>
              <div className="text-[10px] tracking-widest text-[#64748B] font-mono font-bold">GRADE {leader.grade}</div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-white border border-[#E2E8F0] p-6 animate-pulse space-y-4 shadow-sm">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-6 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-10 bg-slate-50 rounded mt-4" />
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
                className="rounded-2xl bg-white border border-[#E2E8F0] p-6 hover:border-orange-300 hover:shadow-md transition shadow-sm"
                data-testid={`contractor-card-${c.id}`}
              >
                <div className="flex items-start gap-5">
                  <TrustGauge score={c.trust_score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <HardHat size={16} className="text-[#EA580C]" weight="duotone" />
                      <span className="text-[10px] font-mono tracking-widest text-[#64748B] font-bold">GRADE {c.grade}</span>
                    </div>
                    <div className="font-display font-bold text-lg text-[#12304A] mt-1 truncate">{c.name}</div>
                    <div className="text-xs text-[#64748B]">{c.road} · {c.region}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">{c.focus}</div>
                    <div className="mt-3">
                      <Stars value={c.avg_rating} />
                      <div className="text-[10px] text-[#64748B] font-mono mt-0.5">
                        {c.rating_count} citizen rating{c.rating_count === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 border-t border-[#E2E8F0] pt-4">
                  <Metric icon={WarningOctagon} label="Complaints" value={c.total_complaints} color="text-[#12304A]" />
                  <Metric icon={CheckCircle} label="Resolved" value={`${c.resolution_rate_pct}%`} color="text-emerald-600" />
                  <Metric
                    icon={Clock}
                    label="Avg Speed"
                    value={c.avg_resolution_hours != null ? `${c.avg_resolution_hours}h` : "—"}
                    color="text-[#EA580C]"
                  />
                </div>

                <div className="mt-4 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${c.trust_score}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${trustColor(c.trust_score)}, #F59E0B)` }}
                  />
                </div>

                <Link
                  to="/map"
                  className="mt-4 inline-flex items-center gap-1 text-xs text-[#EA580C] hover:text-[#C2410C] font-mono font-semibold"
                >
                  View complaints on map →
                </Link>
              </motion.div>
            ))}
            {!items.length && (
              <div className="col-span-full text-sm text-[#64748B] italic text-center py-10">
                No contractors on file yet.
              </div>
            )}
          </div>
        )}

        <div className="mt-10 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
          <div className="text-[10px] tracking-widest text-[#EA580C] font-mono font-bold mb-3">/ HOW TRUST SCORE IS CALCULATED</div>
          <div className="grid md:grid-cols-4 gap-4 text-xs text-[#64748B]">
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <span className="text-[#12304A] font-semibold block mb-1">Resolution rate (30 pts)</span>
              Percentage of complaints progressing to RESOLVED status.
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <span className="text-[#12304A] font-semibold block mb-1">Citizen rating (20 pts)</span>
              Average of 1–5 stars submitted after verified repair completion.
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <span className="text-[#12304A] font-semibold block mb-1">Resolution speed (10 pts)</span>
              Median turnaround hours from submission to on-site closure.
            </div>
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-xl">
              <span className="text-[#12304A] font-semibold block mb-1">Baseline index (40 pts)</span>
              Initial accredited baseline trust benchmark.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-2.5">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-medium">
        <Icon size={12} weight="duotone" className="text-[#64748B]" /> {label}
      </div>
      <div className={`mt-0.5 font-display font-bold text-lg ${color}`}>{value}</div>
    </div>
  );
}
