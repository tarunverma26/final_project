import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  House, Compass, Path, WarningOctagon, Cpu,
  ClockCounterClockwise, MapTrifold, ChartBar,
  ArrowRight, Sparkle, X, CaretUp, CaretDown
} from "@phosphor-icons/react";

const PROTOTYPE_STEPS = [
  { id: "landing", label: "1. Landing", path: "/", icon: House },
  { id: "identify", label: "2. Identify Road", path: "/identify", icon: Compass },
  { id: "profile", label: "3. Road Profile", path: "/road/NH-48", icon: Path },
  { id: "report", label: "4. Report Problem", path: "/report", icon: WarningOctagon },
  { id: "tracking", label: "5. Complaint Tracking", path: "/tracking/RW-10234", icon: ClockCounterClockwise },
  { id: "map", label: "6. Interactive Map", path: "/map", icon: MapTrifold },
  { id: "dashboard", label: "7. Dashboard", path: "/dashboard", icon: ChartBar },
];

export default function PrototypeJourneyBar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const currentIdx = PROTOTYPE_STEPS.findIndex((s) => {
    if (s.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(s.path.split("#")[0]);
  });

  const nextStep = currentIdx >= 0 && currentIdx < PROTOTYPE_STEPS.length - 1
    ? PROTOTYPE_STEPS[currentIdx + 1]
    : PROTOTYPE_STEPS[0];

  return (
    <div
      className="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
      data-testid="prototype-journey-navigator"
    >
      <div className="pointer-events-auto rounded-2xl bg-[#081120]/95 backdrop-blur-xl border border-white/15 p-2.5 shadow-2xl transition-all duration-300 max-w-4xl w-full">
        <div className="flex items-center justify-between gap-3 px-2 pb-1.5 border-b border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-slate-200 tracking-wider uppercase">
              CLICKABLE ROAD JOURNEY PROTOTYPE
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={nextStep.path}
              className="px-3 py-1 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-mono text-[11px] font-bold transition-all flex items-center gap-1.5 shadow-xs"
            >
              <span>Next: {nextStep.label.split(". ")[1]}</span>
              <ArrowRight size={13} weight="bold" />
            </Link>

            <button
              onClick={() => setCollapsed((v) => !v)}
              className="p-1 rounded-md text-slate-400 hover:text-white transition-colors"
              title={collapsed ? "Expand Prototype Navigator" : "Collapse"}
            >
              {collapsed ? <CaretUp size={16} /> : <CaretDown size={16} />}
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1 mt-2 overflow-x-auto py-1 scrollbar-none">
            {PROTOTYPE_STEPS.map((s, idx) => {
              const active = idx === currentIdx;
              const Icon = s.icon;
              return (
                <Link
                  key={s.id}
                  to={s.path}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    active
                      ? "bg-[#F97316] text-white shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon size={14} weight={active ? "bold" : "duotone"} />
                  <span>{s.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
