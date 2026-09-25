import React from "react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import {
  WarningOctagon,
  Camera,
  MapPin,
  Cpu,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HardHat,
  ArrowsClockwise,
  Eye,
} from "@phosphor-icons/react";

const PIPELINE_STEPS = [
  { label: "1. REPORT", sub: "Citizen photo & GPS", icon: Camera },
  { label: "2. AI ANALYSIS", sub: "Crater volume scan", icon: Cpu },
  { label: "3. PRIORITIZE", sub: "Safety risk rating", icon: WarningOctagon },
  { label: "4. AUTHORITY", sub: "NHAI / PWD / MCD", icon: ShieldCheck },
  { label: "5. CONTRACTOR", sub: "Work order dispatch", icon: HardHat },
  { label: "6. REPAIR", sub: "Bitumen resurfacing", icon: ArrowsClockwise },
  { label: "7. VERIFY", sub: "Dual-GPS & AI check", icon: Eye },
  { label: "8. RESOLVED", sub: "Transparent closure", icon: CheckCircle },
];

export default function ReportSection() {
  const steps = [
    {
      num: "01",
      icon: Camera,
      title: "Snap & Upload Photo",
      desc: "Take a quick photo of the road hazard. Our client automatically extracts embedded GPS EXIF telemetry with zero manual typing.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "AI Vision Assessment",
      desc: "Vision models evaluate depth, crater volume, and structural safety risk, calculating an automated urgency index.",
    },
    {
      num: "03",
      icon: MapPin,
      title: "Authority Auto-Routing",
      desc: "Tickets are dispatched immediately to NHAI, PWD, or MCD with boundary polygons and direct contractor accountability.",
    },
  ];

  return (
    <section id="report" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="report-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ CITIZEN REPORTING WORKFLOW" />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
              Report in seconds. <span className="text-[#F97316]">Verified by AI.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#64748B] leading-relaxed">
              Snap a picture from your phone. Our multi-agent inspection system verifies the road condition, categorizes the
              defect, and routes it directly to municipal contractors with open tracking.
            </p>
          </div>
        </Reveal>

        {/* 3 Core Workflow Cards */}
        <Reveal delay={150} className="mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 flex flex-col justify-between shadow-xs transition-all duration-200 hover:border-orange-200 hover:shadow-md hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center">
                        <Icon size={22} className="text-[#F97316]" weight="duotone" />
                      </div>
                      <span className="font-mono text-xs text-[#EA580C] font-bold bg-orange-50/80 px-2.5 py-1 rounded-md border border-orange-200/50">
                        PHASE {st.num}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-xl text-[#12304A]">
                      {st.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F5F9] text-xs font-mono text-[#0F766E] flex items-center gap-1.5 font-medium">
                    <CheckCircle size={14} weight="fill" className="text-[#16A34A]" />
                    <span>Real-time database sync</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* SIH End-to-End Transparency Pipeline (Section 12 & 20) */}
        <Reveal delay={200} className="mt-14">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[11px] font-mono text-[#EA580C] tracking-wider uppercase font-semibold">
                  END-TO-END SIH CIVIC PIPELINE
                </span>
                <h4 className="font-display font-bold text-lg md:text-xl text-[#12304A] mt-0.5">
                  How every road complaint gets resolved in the open
                </h4>
              </div>
              <span className="text-xs font-mono text-[#64748B] bg-slate-50 border border-[#E2E8F0] px-3 py-1.5 rounded-lg w-fit">
                Zero Dismissed Complaints
              </span>
            </div>

            {/* Responsive Pipeline Visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {PIPELINE_STEPS.map((p, idx) => {
                const StepIcon = p.icon;
                const isFinal = idx === PIPELINE_STEPS.length - 1;
                return (
                  <div
                    key={p.label}
                    className={`p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-between ${
                      isFinal
                        ? "bg-emerald-50/70 border-emerald-200"
                        : idx === 0
                        ? "bg-orange-50/70 border-orange-200"
                        : "bg-slate-50/70 border-[#E2E8F0]"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center mb-1.5 ${
                        isFinal
                          ? "bg-emerald-100 text-[#16A34A]"
                          : idx === 0
                          ? "bg-orange-100 text-[#F97316]"
                          : "bg-white text-[#12304A] border border-[#E2E8F0]"
                      }`}
                    >
                      <StepIcon size={15} weight="bold" />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-[#12304A]">
                      {p.label}
                    </div>
                    <div className="text-[9px] text-[#64748B] mt-0.5 line-clamp-1">
                      {p.sub}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Primary Action Button */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#F1F5F9]">
              <p className="text-sm text-[#64748B]">
                Notice road distress in your ward? File a geotagged complaint in under 30 seconds.
              </p>
              <Link
                to="/report"
                data-testid="report-cta-btn"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-all duration-150 inline-flex items-center justify-center gap-2 shadow-sm hover:shadow hover:-translate-y-0.5 cursor-pointer text-sm"
              >
                <WarningOctagon size={18} weight="bold" />
                <span>Report a Pothole Now</span>
                <ArrowRight size={14} weight="bold" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
