import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import WeatherAtmosphere from "./WeatherAtmosphere";
import Pothole from "./Pothole";
import Counter from "./Counter";
import { api } from "@/lib/api";
import {
  Radioactive as Radar,
  WarningOctagon,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Buildings,
  CheckCircle,
} from "@phosphor-icons/react";

export default function Hero() {
  const [stats, setStats] = useState({ total_problems: 2481, resolved_or_progress_pct: 73 });

  useEffect(() => {
    api
      .get("/stats/overview")
      .then((r) => setStats(r.data))
      .catch(() => {});
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[92vh] overflow-hidden bg-[#F8FAFC] pt-32 pb-20 flex flex-col justify-between"
      data-testid="hero-section"
    >
      {/* 1. Dynamic Weather Atmosphere (Monsoon Afternoon Mood) */}
      <WeatherAtmosphere rainCount={35} showClouds={true} showSun={true} />

      {/* 2. Extremely Subtle Civic Map Grid & Road Lines (Behind content, low opacity) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-30 z-0">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 900"
          fill="none"
        >
          {/* Subtle civic road corridors */}
          <path
            d="M-50 250 C 350 280, 600 120, 1500 180"
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeDasharray="8 6"
          />
          <path
            d="M-50 480 C 400 450, 800 620, 1500 520"
            stroke="#E2E8F0"
            strokeWidth="4"
          />
          <path
            d="M320 -50 C 380 400, 480 600, 520 950"
            stroke="#E2E8F0"
            strokeWidth="2"
          />
          <path
            d="M1020 -50 C 980 350, 1120 650, 1150 950"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeDasharray="6 4"
          />
          {/* Subtle civic coordinates / pin markers */}
          <circle cx="360" cy="270" r="4" fill="#0F766E" opacity="0.6" />
          <circle cx="750" cy="530" r="5" fill="#F97316" opacity="0.6" />
          <circle cx="1060" cy="210" r="4" fill="#16A34A" opacity="0.6" />
        </svg>
      </div>

      {/* 3. Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full my-auto">
        <Reveal>
          <div className="max-w-4xl">
            <Eyebrow text="/ LIVE · CIVIC INFRASTRUCTURE MONITOR" />
            <h1
              className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.04] text-[#12304A] tracking-tight"
              data-testid="hero-headline"
            >
              THE ROAD TELLS A STORY.
              <br />
              <span className="text-[#F97316]">WE MAKE IT VISIBLE.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[#64748B] max-w-2xl leading-relaxed font-normal">
              Identify roads. Report problems. Track repairs — end to end, in the open.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3.5">
              <Link
                to="/identify"
                data-testid="hero-identify-btn"
                className="px-6 py-3.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-all duration-150 inline-flex items-center gap-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                <Radar size={19} weight="bold" />
                <span>Identify My Road</span>
              </Link>
              <Link
                to="/report"
                data-testid="hero-report-btn"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-[#12304A] border border-[#CBD5E1] hover:border-[#F97316] font-semibold transition-all duration-150 inline-flex items-center gap-2.5 shadow-2xs hover:-translate-y-0.5"
              >
                <WarningOctagon size={19} weight="bold" className="text-[#F97316]" />
                <span>Report a Pothole</span>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* 4. Stats & Interactive Pothole Card Grid */}
        <Reveal delay={150} className="mt-16">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Stat Card 1: Total Problems */}
            <div
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
              data-testid="stat-total"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider text-[#64748B] font-mono uppercase font-semibold">
                  ROAD PROBLEMS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-[#DC2626] font-semibold border border-red-100">
                  NETWORK TELEMETRY
                </span>
              </div>
              <div className="font-display font-extrabold text-4xl text-[#12304A] mt-2">
                <Counter end={stats.total_problems} />
              </div>
              <div className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
                <span>Verified across municipal sectors</span>
              </div>
            </div>

            {/* Center: Daytime Interactive Pothole Sensor Visual */}
            <div className="flex flex-col items-center justify-center p-4">
              <Pothole size={210} label="Simulated Hazard Sensor — PWD Zone 2" />
              <span className="text-[11px] font-mono text-[#64748B] mt-2">
                Hover to trigger AI optical scan
              </span>
            </div>

            {/* Stat Card 3: Resolved / In Progress */}
            <div
              className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-shadow"
              data-testid="stat-progress"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] tracking-wider text-[#64748B] font-mono uppercase font-semibold">
                  RESOLVED / IN PROGRESS
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-[#16A34A] font-semibold border border-emerald-100">
                  SLA COMPLIANCE
                </span>
              </div>
              <div className="font-display font-extrabold text-4xl text-[#0F766E] mt-2">
                <Counter end={stats.resolved_or_progress_pct} suffix="%" />
              </div>
              <div className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
                <CheckCircle size={14} className="text-[#16A34A]" weight="fill" />
                <span>Active contractor accountability</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed divider */}
        <div className="rw-lane mt-16" />
      </div>
    </section>
  );
}
