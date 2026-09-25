import React from "react";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import Timeline from "./Timeline";
import AiAssessmentCard from "./AiAssessmentCard";

const POTHOLE_IMG =
  "https://images.unsplash.com/photo-1784548789954-655c9a9e1a64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxwb3Rob2xlJTIwcm9hZCUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzg3Mzk3ODgyfDA&ixlib=rb-4.1.0&q=85";

const DEMO_TIMELINE = [
  { step: "SUBMITTED", status: "completed", timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
  { step: "UNDER_REVIEW", status: "completed", timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
  { step: "FORWARDED", status: "completed", timestamp: new Date(Date.now() - 3600000 * 6).toISOString() },
  { step: "ASSIGNED", status: "pending" },
  { step: "WORK_PLANNED", status: "pending" },
  { step: "WORK_IN_PROGRESS", status: "pending" },
  { step: "RESOLUTION", status: "pending" },
  { step: "VERIFIED", status: "pending" },
  { step: "RESOLVED", status: "pending" },
];

const DEMO_AI = {
  category: "Pothole",
  severity: "HIGH",
  safety_risk: "HIGH",
  confidence: 94,
  priority: "CRITICAL",
  recommendation: "Immediate bituminous patching required within 48-hour SLA.",
  model: "claude-sonnet-5",
};

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="timeline-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ TRANSPARENT ISSUE LIFECYCLE" />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
              9 verified steps. <span className="text-[#F97316]">Always in the open.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#64748B] leading-relaxed">
              From citizen submission to double-blind GPS & AI verification, see every department hand your ticket passes
              through. No closed backrooms, no bureaucratic dead-ends, no silently dismissed complaints.
            </p>
          </div>
        </Reveal>

        {/* 2-Column Grid: AI Vision Audit + Live 9-Stage Timeline */}
        <Reveal delay={150} className="mt-12">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            
            {/* Column 1: AI Vision Audit Card */}
            <div>
              <div className="mb-4">
                <span className="text-[11px] font-mono text-[#0F766E] uppercase font-bold tracking-wider">
                  AI VISION TELEMETRY
                </span>
                <h3 className="font-display font-bold text-2xl text-[#12304A] mt-0.5">
                  Automated Multi-Agent Vision Audit
                </h3>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Vision models audit road damage, calculating structural depth, surface area, and immediate safety hazards for
                  contractors.
                </p>
              </div>
              <AiAssessmentCard data={DEMO_AI} thumbnail={POTHOLE_IMG} />
            </div>

            {/* Column 2: 9-Stage Public Verification Timeline Card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-5 mb-6 border-b border-[#F1F5F9]">
                <div>
                  <span className="text-[11px] font-mono text-[#EA580C] uppercase font-bold tracking-wider">
                    CITIZEN AUDIT TRACKER
                  </span>
                  <h3 className="font-display font-bold text-xl text-[#12304A] mt-0.5">
                    Live Stage Progression
                  </h3>
                </div>
                <span className="text-xs font-mono font-semibold text-[#16A34A] bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                  Active Dispatch #RW-8492
                </span>
              </div>

              <Timeline steps={DEMO_TIMELINE} />
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
