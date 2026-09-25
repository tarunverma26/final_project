import React from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import Timeline from "./Timeline";
import AiAssessmentCard from "./AiAssessmentCard";

const POTHOLE_IMG =
  "https://images.unsplash.com/photo-1784548789954-655c9a9e1a64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxwb3Rob2xlJTIwcm9hZCUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzg3Mzk3ODgyfDA&ixlib=rb-4.1.0&q=85";

const DEMO_TIMELINE = [
  { step: "SUBMITTED", status: "completed", timestamp: new Date().toISOString() },
  { step: "UNDER_REVIEW", status: "completed", timestamp: new Date().toISOString() },
  { step: "FORWARDED", status: "completed", timestamp: new Date().toISOString() },
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
  recommendation: "Immediate patching required within 48 hours.",
  model: "claude-sonnet-5",
};

export default function TimelineSection() {
  return (
    <section id="timeline" className="relative py-24 asphalt-bg overflow-hidden" data-testid="timeline-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ TRANSPARENT ISSUE LIFECYCLE" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              9 steps. <span className="text-amber-400">Always in the open.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              From civic submission to verified resolution, you see every department hand your ticket passes through. No
              closed backrooms or silently dismissed complaints.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-12">
          <div className="grid lg:grid-cols-2 gap-10">
            <div>
              <h3 className={`${FONT_DISPLAY} text-xl md:text-2xl text-white font-bold mb-3`}>
                Automated AI Vision Audit
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 mb-6 leading-relaxed">
                Emergency vision models audit road damage, calculating structural depth and immediate safety hazards for
                contractors.
              </p>
              <AiAssessmentCard data={DEMO_AI} thumbnail={POTHOLE_IMG} />
            </div>

            <div>
              <h3 className={`${FONT_DISPLAY} text-xl md:text-2xl text-white font-bold mb-3`}>
                Public Verification Timeline
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 mb-6 leading-relaxed">
                Track live state transitions with officer stamps and geotagged repair proofs.
              </p>
              <div className="rounded-2xl bg-[#111114]/90 border border-white/10 p-6 shadow-xl">
                <Timeline steps={DEMO_TIMELINE} />
              </div>
            </div>
          </div>
        </Reveal>

        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
