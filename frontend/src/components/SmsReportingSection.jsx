import React from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import {
  ChatText,
  WhatsappLogo,
  DeviceMobile,
  Cpu,
  MapTrifold,
  CheckCircle,
  PaperPlaneRight,
  ShieldCheck,
  Broadcast,
  ArrowRight,
} from "@phosphor-icons/react";

export default function SmsReportingSection() {
  const steps = [
    {
      step: "01",
      icon: ChatText,
      title: "Text / WhatsApp",
      desc: "Citizen sends a simple text description and landmark in Hindi or English to +91 98712 34567 or shortcode 56161.",
      detail: "No app download, login, or mobile internet required.",
    },
    {
      step: "02",
      icon: Cpu,
      title: "Auto-Parsed into a Report",
      desc: "Fast NLP parses road name, landmark, and hazard severity, assigning an official tracking ID with jurisdiction routing.",
      detail: "Extracts location, assigns PWD/NHAI/MCD department in seconds.",
    },
    {
      step: "03",
      icon: MapTrifold,
      title: "Appears on Map & Timeline",
      desc: "Instantly logs into the open civic database, entering the 9-stage verification timeline with SMS status updates.",
      detail: "Citizen receives SMS updates as crews inspect & resolve.",
    },
  ];

  return (
    <section id="sms-reporting" className="relative py-24 asphalt-bg overflow-hidden" data-testid="sms-reporting-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ OFFLINE & ACCESSIBILITY HOTLINE" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              Civic reporting for <span className="text-amber-400">every citizen.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              Not everyone has a high-end smartphone or unlimited data plan. RoadWatch operates an automated 24/7 SMS and
              WhatsApp hotline that empowers daily commuters, auto drivers, and senior citizens to log road hazards in seconds.
            </p>
          </div>
        </Reveal>

        {/* Interactive Phone Mockup Card + Twilio integration showcase */}
        <Reveal delay={150} className="mt-12">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Phone Mockup (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[36px] bg-[#0E0E12] border-4 border-zinc-700/80 shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
                
                {/* Smartphone Top Notch & Status Bar */}
                <div className="bg-[#16161B] px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/5">
                  <span className="font-semibold text-white">09:41</span>
                  <div className="w-20 h-4 bg-black rounded-full" />
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-semibold">5G</span>
                    <span className="w-4 h-2 rounded-sm border border-zinc-400 inline-block bg-emerald-400" />
                  </div>
                </div>

                {/* Chat App Header */}
                <div className="bg-[#121217] px-4 py-3 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <WhatsappLogo size={20} weight="fill" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">RoadWatch Hotline</span>
                        <ShieldCheck size={14} className="text-amber-400" weight="fill" />
                      </div>
                      <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        +91 98712 34567 · Official Bot
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono bg-white/5 px-2 py-0.5 rounded">
                    TOLL FREE
                  </span>
                </div>

                {/* Chat Message Stream */}
                <div className="p-4 space-y-3.5 bg-[#09090C] min-h-[360px] flex flex-col justify-end text-xs">
                  
                  {/* Date badge */}
                  <div className="text-center">
                    <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-2.5 py-0.5 rounded-full">
                      TODAY
                    </span>
                  </div>

                  {/* Outgoing Message (Citizen) */}
                  <div className="flex flex-col items-end">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-500 text-black p-3 shadow-md font-medium leading-relaxed">
                      Big deep pothole on MG Road near IFFCO Chowk metro pillar 142. Two scooters slipped this morning. Water is filling up inside.
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-1 font-mono">09:38 AM · Sent via SMS</span>
                  </div>

                  {/* Incoming Bot Auto-Reply */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-[#181820] border border-amber-500/30 text-zinc-200 p-3 shadow-md leading-relaxed">
                      <div className="font-bold text-amber-400 flex items-center gap-1 text-[11px] mb-1">
                        <CheckCircle size={14} weight="fill" /> REPORT FILED: #RW-8492
                      </div>
                      <div className="text-[11px] space-y-0.5 text-zinc-300 font-mono">
                        <div>📍 MG Road, Metro Pillar 142</div>
                        <div>⚠️ Hazard: Critical Pothole & Slip Risk</div>
                        <div>🏛️ Routed: PWD Gurugram (Zone 2)</div>
                      </div>
                      <p className="mt-2 text-[10px] text-zinc-400 pt-1.5 border-t border-white/10">
                        Track status at <strong className="text-amber-300">roadwatch.in/t/RW-8492</strong> or reply <code className="text-white">STATUS</code>.
                      </p>
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-1 font-mono">09:38 AM · Automated Dispatch</span>
                  </div>

                  {/* User follows up with STATUS */}
                  <div className="flex flex-col items-end">
                    <div className="rounded-xl rounded-tr-sm bg-amber-500 text-black px-3 py-1.5 font-bold font-mono">
                      STATUS
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-0.5 font-mono">10:15 AM</span>
                  </div>

                  {/* Bot update reply */}
                  <div className="flex flex-col items-start">
                    <div className="max-w-[88%] rounded-xl rounded-tl-sm bg-[#181820] border border-white/10 text-zinc-200 p-2.5 text-[11px]">
                      <span className="text-emerald-400 font-semibold">🚜 Work Scheduled:</span> Crew assigned under Eng. R. Sharma (PWD). Expected patch repair within 48 hours.
                    </div>
                    <span className="text-[9px] text-zinc-500 mt-0.5 font-mono">10:15 AM</span>
                  </div>
                </div>

                {/* Mockup Bottom Message Bar */}
                <div className="bg-[#121217] p-2.5 border-t border-white/10 flex items-center gap-2">
                  <div className="flex-1 bg-white/5 rounded-full px-3 py-1.5 text-[11px] text-zinc-500">
                    Type a message or location...
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-black">
                    <PaperPlaneRight size={13} weight="bold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Impact Details (7 cols on lg) */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="glass rounded-2xl p-6 md:p-8 border border-white/10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 mb-4">
                  <Broadcast size={14} className="animate-pulse" />
                  TWO-WAY MULTI-CHANNEL TELEPHONY
                </div>

                <h3 className={`${FONT_DISPLAY} text-2xl md:text-3xl text-white font-bold leading-tight`}>
                  Zero app required. Just text the road problem.
                </h3>

                <p className="mt-4 text-sm md:text-base text-zinc-300 leading-relaxed">
                  Citizens on basic feature phones or intermittent 2G coverage can send an SMS or WhatsApp voice note.
                  The RoadWatch NLP pipeline parses landmarks, cross-references municipal boundary maps, and issues an
                  immediate confirmation with live ticket tracking.
                </p>

                {/* Twilio & WhatsApp callout as explicitly required */}
                <div className="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                  <DeviceMobile size={22} className="text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs md:text-sm text-zinc-200">
                    <strong className="text-amber-300 block font-semibold mb-0.5">
                      Enterprise Communication Infrastructure
                    </strong>
                    "Powered by Twilio / WhatsApp Business API — reaches citizens without smartphones or data plans."
                  </div>
                </div>

                {/* Key stats row */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-white/10 text-center">
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="font-display font-black text-2xl text-amber-400">48%</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Reports via SMS/Chat</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                    <div className="font-display font-black text-2xl text-white">&lt; 3 sec</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Automated Ticket ID</div>
                  </div>
                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                    <div className="font-display font-black text-2xl text-emerald-400">100%</div>
                    <div className="text-[11px] text-zinc-400 font-mono mt-0.5">Open Database Sync</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* 3-Step Visual below using existing STEP / number pattern */}
        <Reveal delay={250} className="mt-12">
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map(({ step, icon: Icon, title, desc, detail }) => (
              <div
                key={step}
                data-testid={`sms-step-${step}`}
                className="rounded-2xl border border-white/10 bg-[#111114]/90 p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <Icon size={22} className="text-amber-400" weight="duotone" />
                    </div>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      STEP {step}
                    </span>
                  </div>

                  <h4 className={`${FONT_DISPLAY} text-lg md:text-xl text-white font-bold`}>
                    {title}
                  </h4>

                  <p className="mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed">
                    {desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 text-[11px] text-zinc-500 font-mono flex items-center gap-1.5">
                  <ArrowRight size={12} className="text-amber-400" /> {detail}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider as required */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
