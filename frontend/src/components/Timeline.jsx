import { CheckCircle, Circle, Clock } from "@phosphor-icons/react";

const LABELS = {
  SUBMITTED: "Submitted & GPS Telemetry Verified",
  UNDER_REVIEW: "AI Vision & Depth Audit Passed",
  FORWARDED: "Forwarded to Jurisdiction Division",
  ASSIGNED: "Contractor SLA Assigned",
  WORK_PLANNED: "Work Planned & Bitumen Scheduled",
  WORK_IN_PROGRESS: "Work In Progress on Ground",
  RESOLUTION: "Resolution Filed by Crew",
  VERIFIED: "Dual-GPS & AI Verification Audit",
  RESOLVED: "Resolved & Closed in Public Registry",
};

export default function Timeline({ steps = [] }) {
  return (
    <ol className="relative" data-testid="complaint-timeline">
      {steps.map((s, i) => {
        const done = s.status === "completed";
        const isCurrent = !done && (i === 0 || steps[i - 1]?.status === "completed");

        return (
          <li
            key={s.step}
            className="flex gap-4 pb-6 relative"
            data-testid={`timeline-step-${s.step}`}
            data-status={s.status}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                  done
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                    : isCurrent
                    ? "bg-orange-50 border-[#F97316] text-[#F97316] animate-pulse"
                    : "bg-slate-100 border-[#E2E8F0] text-[#94A3B8]"
                }`}
              >
                {done ? (
                  <CheckCircle size={18} weight="fill" />
                ) : isCurrent ? (
                  <Clock size={16} weight="bold" />
                ) : (
                  <Circle size={10} weight="fill" />
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 flex-1 mt-1 ${
                    done ? "bg-emerald-300" : "bg-[#E2E8F0]"
                  }`}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pt-0.5">
              <div
                className={`font-display font-semibold text-sm ${
                  done
                    ? "text-[#12304A]"
                    : isCurrent
                    ? "text-[#EA580C] font-bold"
                    : "text-[#94A3B8]"
                }`}
              >
                {LABELS[s.step] || s.step}
              </div>
              {s.timestamp && (
                <div className="text-xs text-[#64748B] font-mono mt-0.5">
                  {new Date(s.timestamp).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
