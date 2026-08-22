import { motion } from "framer-motion";
import { Cpu, Warning, Shield, ChartLineUp } from "@phosphor-icons/react";

export default function AiAssessmentCard({ data, thumbnail }) {
  if (!data) return null;
  const rows = [
    { label: "Category", value: data.category, icon: Warning },
    { label: "Severity", value: data.severity, icon: Warning, accent: true },
    { label: "Safety Risk", value: data.safety_risk, icon: Shield, accent: data.safety_risk === "HIGH" },
    { label: "Priority", value: data.priority, icon: ChartLineUp, accent: data.priority === "CRITICAL" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] p-6"
      data-testid="ai-assessment-card"
    >
      <div className="flex items-center gap-2 mb-4">
        <Cpu size={20} className="text-amber-400" weight="duotone" />
        <span className="font-mono text-xs tracking-widest text-amber-400">
          ROADWATCH · AI ASSESSMENT
        </span>
        {data.model && (
          <span className="ml-auto font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            model: {data.model}
          </span>
        )}
      </div>

      {thumbnail && (
        <div className="relative rounded-lg overflow-hidden mb-4 h-40 bg-zinc-900">
          <img src={thumbnail} alt="scan" className="w-full h-full object-cover opacity-80" />
          <div className="scan-line" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {rows.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-lg bg-black/40 border border-white/5 p-3">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500">
              <Icon size={12} />
              {label}
            </div>
            <div className={`font-display font-bold text-lg mt-1 ${accent ? "text-amber-400" : "text-white"}`}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">
          <span>Confidence</span>
          <span className="font-mono text-amber-400">{data.confidence}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-500 to-red-500"
          />
        </div>
      </div>

      <p className="mt-4 text-xs text-zinc-400 font-mono border-t border-white/5 pt-3">
        &gt; {data.recommendation}
      </p>
      <div className="mt-2 text-[10px] text-zinc-400 italic">
        * {data.model
              ? `Real-time vision analysis by ${data.model} — not a human inspection.`
              : "Simulated AI assessment (photo not provided)."}
      </div>
    </motion.div>
  );
}
