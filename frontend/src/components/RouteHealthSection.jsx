import React, { useState } from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import useCountUp from "@/hooks/useCountUp";
import { MARKERS } from "@/constants/markers";
import {
  Path,
  Lightning,
  ShieldCheck,
  WarningOctagon,
  Clock,
  Car,
  ArrowsClockwise,
  CheckCircle,
  Truck,
  ArrowRight,
  Info,
} from "@phosphor-icons/react";

export default function RouteHealthSection() {
  const [selectedRoute, setSelectedRoute] = useState("recommended");

  // Derive dynamic hazard stats from MARKERS
  const fastestHazards = MARKERS.filter((m) => m.route_proximity === "fastest");
  const recommendedHazards = MARKERS.filter((m) => m.route_proximity === "recommended");

  // Mock computed health score (0-100) based on hazard impact
  const fastestHazardCount = 14; // includes sub-meter road bumps & clusters
  const recommendedHazardCount = 2; // only 2 minor issues

  // Animated health scores
  const scoreFastest = useCountUp(38, 1200);
  const scoreRecommended = useCountUp(92, 1200);

  const routes = [
    {
      id: "fastest",
      type: "fastest",
      name: "NH-48 via Cyber Corridor & IFFCO Chowk",
      badge: "FASTEST (TIME ONLY)",
      eta: "22 min",
      distance: "12.4 km",
      hazardsCount: fastestHazardCount,
      criticalHazards: 5,
      score: scoreFastest,
      scoreColor: C.red,
      scoreGlow: C.redGlow,
      borderStyle: "border-white/10 hover:border-red-500/40",
      description: "Direct highway path traversing unpatched monsoon potholes and waterlogged service flyovers.",
      fleetImpact: "High suspension fatigue, ₹1,850 avg. maintenance cost per 100 trips.",
      highlights: [
        { label: "Critical Craters", value: "5 reported" },
        { label: "Waterlogging Pockets", value: "3 active" },
        { label: "Puncture Risk", value: "HIGH" },
      ],
    },
    {
      id: "recommended",
      type: "recommended",
      name: "Golf Course Ext. & Southern Peripheral Bypass",
      badge: "★ RECOMMENDED BY ROADWATCH",
      eta: "26 min",
      distance: "15.1 km",
      hazardsCount: recommendedHazardCount,
      criticalHazards: 0,
      score: scoreRecommended,
      scoreColor: C.amber,
      scoreGlow: C.amberGlow,
      borderStyle: "border-amber-500 ring-1 ring-amber-500/40 bg-gradient-to-b from-[#181510] to-[#121214]",
      description: "Recently resurfaced arterial corridor with zero severe cavities and active stormwater drainage.",
      fleetImpact: "78% shock reduction, zero breakdown incidents, fleet tyre longevity +24%.",
      highlights: [
        { label: "Critical Craters", value: "0 reported" },
        { label: "Waterlogging Pockets", value: "None" },
        { label: "Puncture Risk", value: "MINIMAL" },
      ],
    },
  ];

  return (
    <section id="route-health" className="relative py-24 asphalt-bg overflow-hidden" data-testid="route-health-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ CONDITION-AWARE NAVIGATION" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              Fastest route vs. <span className="text-amber-400">Healthiest route.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              Standard navigation optimizes solely for travel time, routing vehicles directly across severe axle-breaking
              craters. RoadWatch maps real-time hazard reports to compute road condition health scores for safer transit.
            </p>
          </div>
        </Reveal>

        {/* Demo Waypoint Banner */}
        <Reveal delay={100} className="mt-10">
          <div className="glass rounded-xl p-4 border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="flex items-center gap-2 text-zinc-300">
                <span className="text-zinc-500 font-mono">FROM:</span>
                <strong className="text-white">DLF Cyber City Phase II</strong>
                <ArrowRight size={14} className="text-amber-400" />
                <span className="text-zinc-500 font-mono">TO:</span>
                <strong className="text-white">Subhash Chowk, Sohna Road</strong>
              </div>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Info size={14} className="text-amber-400" />
              Real-time corridor telemetry active
            </div>
          </div>
        </Reveal>

        {/* Side-by-Side Comparison Cards */}
        <Reveal delay={200} className="mt-8">
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {routes.map((route) => {
              const isRec = route.type === "recommended";
              const isSelected = selectedRoute === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  data-testid={`route-card-${route.id}`}
                  className={`rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-300 relative flex flex-col justify-between border ${
                    isRec
                      ? "border-amber-500/80 bg-[#16130D]/90 shadow-[0_10px_35px_rgba(245,158,11,0.12)]"
                      : "border-white/10 bg-[#111114]/90 hover:border-white/20"
                  } ${isSelected ? "scale-[1.01]" : ""}`}
                >
                  {/* Top Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`text-[11px] font-mono px-3 py-1 rounded-full tracking-wider font-semibold ${
                          isRec
                            ? "bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20"
                            : "bg-white/10 text-zinc-300 border border-white/10"
                        }`}
                      >
                        {route.badge}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                        <Path size={14} /> {route.distance}
                      </span>
                    </div>

                    <h3 className={`${FONT_DISPLAY} text-xl md:text-2xl text-white font-bold leading-snug`}>
                      {route.name}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed">
                      {route.description}
                    </p>
                  </div>

                  {/* Core Metrics: ETA, Hazards, Health Score */}
                  <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-3 gap-3">
                    
                    {/* ETA */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
                        <Clock size={13} className="text-zinc-400" /> ETA
                      </div>
                      <div className="font-display font-black text-2xl text-white mt-1">
                        {route.eta}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {isRec ? "+4m detour" : "Raw travel time"}
                      </div>
                    </div>

                    {/* Hazards Passed */}
                    <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] font-mono">
                        <WarningOctagon
                          size={13}
                          className={isRec ? "text-emerald-400" : "text-red-400"}
                        />{" "}
                        Hazards
                      </div>
                      <div
                        className={`font-display font-black text-2xl mt-1 ${
                          isRec ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {route.hazardsCount}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {route.criticalHazards > 0 ? `${route.criticalHazards} severe craters` : "0 severe"}
                      </div>
                    </div>

                    {/* Health Score */}
                    <div
                      className="p-3 rounded-xl border relative overflow-hidden"
                      style={{
                        backgroundColor: isRec ? "rgba(245, 158, 11, 0.08)" : "rgba(239, 68, 68, 0.08)",
                        borderColor: isRec ? "rgba(245, 158, 11, 0.3)" : "rgba(239, 68, 68, 0.3)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px] font-mono">
                        <ShieldCheck
                          size={13}
                          className={isRec ? "text-amber-400" : "text-red-400"}
                        />{" "}
                        Health
                      </div>
                      <div
                        className="font-display font-black text-2xl mt-1 flex items-baseline gap-0.5"
                        style={{ color: route.scoreColor }}
                      >
                        <span>{route.score}</span>
                        <span className="text-xs text-zinc-500 font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                        {isRec ? "Optimal Grade" : "Severe Stress"}
                      </div>
                    </div>
                  </div>

                  {/* Highlights checklist */}
                  <div className="mt-5 space-y-2 text-xs">
                    {route.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-zinc-300 py-1 border-b border-white/5 last:border-0">
                        <span className="text-zinc-400">{h.label}:</span>
                        <span
                          className={`font-mono font-medium ${
                            isRec ? "text-amber-300" : "text-red-300"
                          }`}
                        >
                          {h.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Impact callout */}
                  <div
                    className={`mt-6 p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                      isRec
                        ? "bg-amber-500/10 text-amber-200 border border-amber-500/25"
                        : "bg-red-500/10 text-red-300 border border-red-500/25"
                    }`}
                  >
                    <Truck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Fleet Economic Impact:</strong>
                      <span className="opacity-90">{route.fleetImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Visual Route Corridor Map Preview */}
        <Reveal delay={300} className="mt-8">
          <div className="rounded-2xl border border-white/10 bg-[#0E0E11] p-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-amber-400" />
                <h4 className={`${FONT_DISPLAY} text-base md:text-lg text-white font-bold`}>
                  Live Corridor Telemetry Comparison
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-red-400">
                  <span className="w-3 h-0.5 bg-red-500 inline-block" /> Fastest (14 hazards)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400 inline-block" /> Recommended (2 hazards)
                </span>
              </div>
            </div>

            {/* SVG Corridor Schematic */}
            <div className="w-full h-36 md:h-44 bg-[#070709] rounded-xl border border-white/5 relative p-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 160" fill="none" preserveAspectRatio="none">
                {/* Grid guidelines */}
                <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="200" y2="160" stroke="rgba(255,255,255,0.03)" />
                <line x1="400" y1="0" x2="400" y2="160" stroke="rgba(255,255,255,0.03)" />
                <line x1="600" y1="0" x2="600" y2="160" stroke="rgba(255,255,255,0.03)" />

                {/* Fastest Route Path (Red, cuts directly through crater clusters) */}
                <path
                  d="M 50 80 C 220 50, 380 40, 520 70 C 620 90, 700 80, 750 80"
                  stroke="#EF4444"
                  strokeWidth="3.5"
                  strokeDasharray="6 6"
                  opacity="0.85"
                />

                {/* Recommended Route Path (Amber, smooth loop around hazards) */}
                <path
                  d="M 50 80 C 180 130, 360 135, 540 120 C 650 110, 700 85, 750 80"
                  stroke="#F59E0B"
                  strokeWidth="4"
                  className="rw-route-dash"
                  filter="drop-shadow(0 0 6px rgba(245,158,11,0.6))"
                />

                {/* Hazard Markers on Fastest Path */}
                <circle cx="210" cy="56" r="6" fill="#EF4444" />
                <circle cx="210" cy="56" r="10" stroke="#EF4444" strokeWidth="1.5" opacity="0.6" />
                <text x="210" y="42" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Pothole</text>

                <circle cx="340" cy="46" r="7" fill="#EF4444" />
                <circle cx="340" cy="46" r="12" stroke="#EF4444" strokeWidth="1.5" opacity="0.6" />
                <text x="340" y="30" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Waterlog</text>

                <circle cx="480" cy="62" r="6" fill="#EF4444" />
                <circle cx="480" cy="62" r="10" stroke="#EF4444" strokeWidth="1.5" opacity="0.6" />
                <text x="480" y="48" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Crater</text>

                {/* Origin Marker */}
                <circle cx="50" cy="80" r="8" fill="#10B981" />
                <circle cx="50" cy="80" r="14" stroke="#10B981" strokeWidth="2" opacity="0.4" />
                <text x="50" y="110" fill="#34D399" fontSize="11" textAnchor="middle" fontWeight="bold">Cyber City</text>

                {/* Destination Marker */}
                <circle cx="750" cy="80" r="8" fill="#F59E0B" />
                <circle cx="750" cy="80" r="14" stroke="#F59E0B" strokeWidth="2" opacity="0.4" />
                <text x="750" y="110" fill="#FDE68A" fontSize="11" textAnchor="middle" fontWeight="bold">Sohna Rd</text>
              </svg>
            </div>

            {/* Bottom fleet explanation quote as required by prompt */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm text-zinc-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <p className="italic text-zinc-300">
                  "Delivery fleets can route around reported hazards, cutting vehicle damage and delay."
                </p>
              </div>
              <span className="font-mono text-[11px] text-amber-400/90">
                Avg. Fleet Savings: ₹14,200 / vehicle / quarter
              </span>
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider as required */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
