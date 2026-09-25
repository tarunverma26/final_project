import { motion } from "framer-motion";
import { Cpu, Warning, Shield, ChartLineUp, CheckCircle, Sparkle } from "@phosphor-icons/react";

export default function AiAssessmentCard({ data, thumbnail }) {
  if (!data) return null;
  const rows = [
    { label: "Category", value: data.category, icon: Warning, badgeColor: "bg-slate-100 text-[#12304A]" },
    { label: "Severity", value: data.severity, icon: Warning, badgeColor: "bg-red-50 text-[#DC2626]" },
    { label: "Safety Risk", value: data.safety_risk || "HIGH", icon: Shield, badgeColor: "bg-amber-50 text-[#D97706]" },
    { label: "Priority", value: data.priority || "CRITICAL", icon: ChartLineUp, badgeColor: "bg-red-50 text-[#DC2626]" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm"
      data-testid="ai-assessment-card"
    >
      {/* Header with Teal Intelligence Badge */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0F766E]">
            <Cpu size={17} weight="duotone" />
          </div>
          <span className="font-mono text-xs font-bold tracking-wider text-[#0F766E]">
            SMART INTELLIGENCE AUDIT
          </span>
        </div>
        {data.model && (
          <span className="font-mono text-[10px] tracking-wider text-[#64748B] uppercase bg-slate-50 border border-[#E2E8F0] px-2 py-0.5 rounded">
            model: {data.model}
          </span>
        )}
      </div>

      {thumbnail && (
        <div className="relative rounded-xl overflow-hidden mb-5 h-44 bg-slate-100 border border-[#E2E8F0]">
          <img src={thumbnail} alt="optical damage scan" className="w-full h-full object-cover" />
          <div className="scan-line" />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/90 text-[#0F766E] border border-teal-200 shadow-xs">
            OPTICAL FEED
          </div>
        </div>
      )}

      {/* Structured Metric Grid */}
      <div className="grid grid-cols-2 gap-3">
        {rows.map(({ label, value, icon: Icon, badgeColor }) => (
          <div key={label} className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
              <Icon size={13} className="text-[#64748B]" />
              {label}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-md text-xs font-bold font-mono ${badgeColor}`}>
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Confidence & AI Score */}
      <div className="mt-5 p-3.5 rounded-xl bg-teal-50/50 border border-teal-100">
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="font-semibold text-[#0F766E] uppercase tracking-wider flex items-center gap-1">
            <Sparkle size={13} weight="fill" />
            AI Confidence Score
          </span>
          <span className="font-bold text-[#0F766E]">{data.confidence || 94}%</span>
        </div>
        <div className="h-2 rounded-full bg-teal-100 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${data.confidence || 94}%` }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="h-full bg-[#0F766E] rounded-full"
          />
        </div>
      </div>

      {/* Recommendation SLA */}
      <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex items-start gap-2">
        <span className="text-xs text-[#12304A] font-semibold shrink-0">Action:</span>
        <p className="text-xs text-[#0F172A] font-medium leading-relaxed">
          {data.recommendation || "Immediate bitumen resurfacing mandated within 48-hour SLA."}
        </p>
      </div>

      <div className="mt-2 text-[10px] text-[#64748B] italic">
        * Vision telemetry automatically logged into the public civic registry.
      </div>
    </motion.div>
  );
}
