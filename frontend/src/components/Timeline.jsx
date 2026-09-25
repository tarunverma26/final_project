import { CheckCircle, Circle } from "@phosphor-icons/react";

const LABELS = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  FORWARDED: "Forwarded",
  ASSIGNED: "Assigned",
  WORK_PLANNED: "Work Planned",
  WORK_IN_PROGRESS: "Work In Progress",
  RESOLUTION: "Resolution",
  VERIFIED: "Verified",
  RESOLVED: "Resolved",
};

export default function Timeline({ steps = [] }) {
  return (
    <ol className="relative" data-testid="complaint-timeline">
      {steps.map((s, i) => {
        const done = s.status === "completed";
        return (
          <li
            key={s.step}
            className="flex gap-4 pb-6 relative"
            data-testid={`timeline-step-${s.step}`}
            data-status={s.status}
          >
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  done ? "bg-amber-500 border-amber-400 text-black" : "bg-black border-zinc-700 text-zinc-500"
                }`}
              >
                {done ? <CheckCircle size={18} weight="fill" /> : <Circle size={12} weight="fill" />}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-0.5 flex-1 mt-1 ${done ? "bg-amber-500/50" : "bg-zinc-800"}`} style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pt-1">
              <div className={`font-display font-semibold text-sm ${done ? "text-white" : "text-zinc-500"}`}>
                {LABELS[s.step] || s.step}
              </div>
              {s.timestamp && (
                <div className="text-xs text-zinc-500 font-mono mt-0.5">
                  {new Date(s.timestamp).toLocaleString()}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
