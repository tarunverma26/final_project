import React from "react";
import { Link } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { WarningOctagon, Camera, MapPin, Cpu, ArrowRight } from "@phosphor-icons/react";

export default function ReportSection() {
  const steps = [
    {
      num: "01",
      icon: Camera,
      title: "Snap & Upload Photo",
      desc: "Take a quick photo of the road hazard. Our client automatically extracts embedded GPS EXIF telemetry.",
    },
    {
      num: "02",
      icon: Cpu,
      title: "AI Vision Assessment",
      desc: "Vision models evaluate depth, crater volume, structural safety risk, and recommend urgent repair SLA.",
    },
    {
      num: "03",
      icon: MapPin,
      title: "Authority Auto-Routing",
      desc: "Tickets are dispatched immediately to NHAI, PWD, or MCD with jurisdiction boundary matching.",
    },
  ];

  return (
    <section id="report" className="relative py-24 asphalt-bg overflow-hidden" data-testid="report-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ CITIZEN REPORTING WORKFLOW" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              Report in seconds. <span className="text-amber-400">Verified by AI.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              Snap a picture from your phone. Our multi-agent inspection system verifies the road condition, categorizes the
              defect, and routes it directly to municipal contractors.
            </p>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.num}
                  className="rounded-2xl border border-white/10 bg-[#111114]/90 p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <Icon size={22} className="text-amber-400" weight="duotone" />
                      </div>
                      <span className="font-mono text-xs text-amber-400 font-bold">
                        STEP {st.num}
                      </span>
                    </div>
                    <h3 className={`${FONT_DISPLAY} text-lg md:text-xl text-white font-bold`}>
                      {st.title}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-3 border-t border-white/5">
                    <Link
                      to="/report"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-mono hover:text-amber-300"
                    >
                      File a report now <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
