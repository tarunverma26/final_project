import React, { useState } from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import useCountUp from "@/hooks/useCountUp";
import {
  Path,
  ShieldCheck,
  WarningOctagon,
  Clock,
  Car,
  ArrowsClockwise,
  Truck,
  ArrowRight,
  Info,
  MapPin,
  MagnifyingGlass,
} from "@phosphor-icons/react";

/**
 * PLACEHOLDER ROUTING & HAZARD-SCORING ENGINE
 * Generates deterministic, plausible mock distance, ETA, hazard count, and road health scores
 * for any arbitrary From/To pair. In production, this integrates with a real routing engine
 * (e.g. OSRM, Valhalla) and spatial MongoDB 2dsphere hazard queries.
 */
function computeRouteComparison(from, to) {
  const fromClean = (from || "").trim();
  const toClean = (to || "").trim();
  const seed = `${fromClean.toLowerCase()}:::${toClean.toLowerCase()}`;
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  // Plausible distance in kilometers (8.4 km to 23.5 km)
  const baseKm = 8.5 + (abs % 130) / 10;
  const fastDist = `${baseKm.toFixed(1)} km`;
  const recDist = `${(baseKm + 2.3 + (abs % 12) / 10).toFixed(1)} km`;

  // Plausible travel times
  const fastEtaMin = 18 + (abs % 16);
  const recEtaMin = fastEtaMin + 3 + (abs % 4);

  // Hazard counts
  const fastHazards = 9 + (abs % 10);
  const fastCritical = 3 + (abs % 5);
  const recHazards = 1 + (abs % 3);

  // Health scores (0-100)
  const fastScore = Math.max(26, Math.min(46, 100 - (fastHazards * 4 + fastCritical * 5)));
  const recScore = Math.max(88, Math.min(96, 100 - recHazards * 3));

  return {
    fromName: fromClean,
    toName: toClean,
    fastest: {
      name: `${fromClean} via Direct Arterial`,
      badge: "FASTEST (TIME ONLY)",
      eta: `${fastEtaMin} min`,
      distance: fastDist,
      hazardsCount: fastHazards,
      criticalHazards: fastCritical,
      score: fastScore,
      description: `Direct arterial route traversing unpatched monsoon potholes and heavy commercial transit bottlenecks.`,
      fleetImpact: `High suspension fatigue, ₹${1450 + (abs % 800)} estimated repair cost per 100 trips.`,
    },
    recommended: {
      name: `${fromClean} via Resurfaced Corridor to ${toClean}`,
      badge: "RECOMMENDED BY ROADWATCH",
      eta: `${recEtaMin} min`,
      distance: recDist,
      hazardsCount: recHazards,
      criticalHazards: 0,
      score: recScore,
      description: `Recently resurfaced arterial bypass prioritizing reinforced asphalt and verified operational stormwater drainage.`,
      fleetImpact: `76% reduction in shock impacts, minimal tyre wear, zero unexpected downtime.`,
    },
  };
}

export default function RouteHealthSection() {
  const [selectedRoute, setSelectedRoute] = useState("recommended");

  // Form states with default pre-filled demo route
  const [fromInput, setFromInput] = useState("DLF Cyber City Phase II");
  const [toInput, setToInput] = useState("Subhash Chowk, Sohna Road");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);

  // Current calculated route comparison data
  const [comparison, setComparison] = useState(() =>
    computeRouteComparison("DLF Cyber City Phase II", "Subhash Chowk, Sohna Road")
  );

  const scoreFastest = useCountUp(comparison.fastest.score, 900);
  const scoreRecommended = useCountUp(comparison.recommended.score, 900);

  const handleCompare = (e) => {
    e.preventDefault();
    if (!fromInput.trim() || !toInput.trim()) {
      setErrorMessage("Please enter both origin and destination locations to calculate route health.");
      return;
    }

    setErrorMessage("");
    setIsCalculating(true);

    // Simulate fast recalculation pulse
    setTimeout(() => {
      const nextComparison = computeRouteComparison(fromInput, toInput);
      setComparison(nextComparison);
      setIsCalculating(false);
    }, 250);
  };

  const isFormValid = fromInput.trim().length > 0 && toInput.trim().length > 0;

  const routes = [
    {
      id: "fastest",
      type: "fastest",
      name: comparison.fastest.name,
      badge: comparison.fastest.badge,
      eta: comparison.fastest.eta,
      distance: comparison.fastest.distance,
      hazardsCount: comparison.fastest.hazardsCount,
      criticalHazards: comparison.fastest.criticalHazards,
      score: scoreFastest,
      scoreColor: C.red,
      borderStyle: "border-white/[0.08] bg-[#141416]/95 hover:border-white/[0.14]",
      description: comparison.fastest.description,
      fleetImpact: comparison.fastest.fleetImpact,
      highlights: [
        { label: "Critical Craters", value: `${comparison.fastest.criticalHazards} reported` },
        { label: "Waterlogging Pockets", value: "3 active" },
        { label: "Puncture Risk", value: "HIGH" },
      ],
    },
    {
      id: "recommended",
      type: "recommended",
      name: comparison.recommended.name,
      badge: `★ ${comparison.recommended.badge}`,
      eta: comparison.recommended.eta,
      distance: comparison.recommended.distance,
      hazardsCount: comparison.recommended.hazardsCount,
      criticalHazards: comparison.recommended.criticalHazards,
      score: scoreRecommended,
      scoreColor: C.amber,
      borderStyle: "border-[#E59518]/50 bg-[#181613]/95 shadow-[0_4px_20px_rgba(229,149,24,0.06)]",
      description: comparison.recommended.description,
      fleetImpact: comparison.recommended.fleetImpact,
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
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-[#F2EFE9] mt-1 leading-[1.08]`}>
              Fastest route vs. <span className="text-[#E59518]">Healthiest route.</span>
            </h2>
            <p className="mt-3 text-base md:text-lg text-[#A39E93] leading-relaxed">
              Standard navigation optimizes solely for travel time, routing vehicles directly across severe axle-breaking
              craters. RoadWatch maps real-time hazard reports to compute road condition health scores for safer transit.
            </p>
          </div>
        </Reveal>

        {/* TASK 2: Editable Location Inputs & Route Comparison Form */}
        <Reveal delay={100} className="mt-10">
          <form
            onSubmit={handleCompare}
            className="rounded-2xl p-4 md:p-5 border border-white/[0.08] bg-[#141416]/95 backdrop-blur-md shadow-lg"
            data-testid="route-search-form"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              
              {/* Origin Field */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3EA370] pointer-events-none">
                  <MapPin size={17} weight="fill" />
                </div>
                <input
                  type="text"
                  value={fromInput}
                  onChange={(e) => {
                    setFromInput(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Origin (e.g. DLF Cyber City)"
                  data-testid="route-input-from"
                  className="w-full bg-[#0E0E10] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F2EFE9] placeholder-[#78736A] focus:outline-none focus:border-[#E59518]/60 transition-colors"
                />
              </div>

              <div className="hidden md:flex items-center text-[#78736A]">
                <ArrowRight size={16} />
              </div>

              {/* Destination Field */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E59518] pointer-events-none">
                  <MapPin size={17} weight="fill" />
                </div>
                <input
                  type="text"
                  value={toInput}
                  onChange={(e) => {
                    setToInput(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="Destination (e.g. Subhash Chowk)"
                  data-testid="route-input-to"
                  className="w-full bg-[#0E0E10] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#F2EFE9] placeholder-[#78736A] focus:outline-none focus:border-[#E59518]/60 transition-colors"
                />
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={!isFormValid || isCalculating}
                data-testid="route-compare-btn"
                className={`px-5 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  isFormValid && !isCalculating
                    ? "bg-[#E59518] text-[#0E0E10] hover:bg-[#F0A632] cursor-pointer shadow-md shadow-[#E59518]/15"
                    : "bg-white/[0.06] text-[#78736A] border border-white/[0.04] cursor-not-allowed"
                }`}
              >
                <ArrowsClockwise size={16} className={isCalculating ? "animate-spin" : ""} />
                <span>{isCalculating ? "Calculating..." : "Compare Routes"}</span>
              </button>
            </div>

            {/* Validation Error Message */}
            {errorMessage && (
              <div className="mt-3 text-xs text-[#E5484D] font-mono flex items-center gap-1.5" data-testid="route-error-msg">
                <WarningOctagon size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick suggested corridors */}
            <div className="mt-3.5 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#78736A] font-mono text-[11px]">
                <span>POPULAR CORRIDORS:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFromInput("Sector 14 Civic Center");
                    setToInput("Udyog Vihar Phase IV");
                    setComparison(computeRouteComparison("Sector 14 Civic Center", "Udyog Vihar Phase IV"));
                    setErrorMessage("");
                  }}
                  className="text-[#A39E93] hover:text-[#E59518] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Sector 14 → Udyog Vihar
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => {
                    setFromInput("DLF Cyber City Phase II");
                    setToInput("Subhash Chowk, Sohna Road");
                    setComparison(computeRouteComparison("DLF Cyber City Phase II", "Subhash Chowk, Sohna Road"));
                    setErrorMessage("");
                  }}
                  className="text-[#A39E93] hover:text-[#E59518] underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Cyber City → Sohna Road
                </button>
              </div>

              <div className="text-[11px] text-[#78736A] font-mono">
                Real-time corridor telemetry active
              </div>
            </div>
          </form>
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
                    route.borderStyle
                  } ${isSelected ? "scale-[1.01]" : ""}`}
                >
                  {/* Top Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span
                        className={`text-[11px] font-mono px-3 py-1 rounded-full tracking-wider font-semibold ${
                          isRec
                            ? "bg-[#E59518] text-[#0E0E10] font-bold"
                            : "bg-white/[0.06] text-[#A39E93] border border-white/[0.08]"
                        }`}
                      >
                        {route.badge}
                      </span>
                      <span className="text-xs text-[#78736A] font-mono flex items-center gap-1">
                        <Path size={14} /> {route.distance}
                      </span>
                    </div>

                    <h3 className={`${FONT_DISPLAY} text-xl md:text-2xl text-[#F2EFE9] font-bold leading-snug`}>
                      {route.name}
                    </h3>
                    <p className="mt-2 text-xs md:text-sm text-[#A39E93] leading-relaxed">
                      {route.description}
                    </p>
                  </div>

                  {/* Core Metrics: ETA, Hazards, Health Score */}
                  <div className="mt-6 pt-6 border-t border-white/[0.06] grid grid-cols-3 gap-3">
                    
                    {/* ETA */}
                    <div className="p-3 rounded-xl bg-[#0E0E10]/80 border border-white/[0.05]">
                      <div className="flex items-center gap-1.5 text-[#78736A] text-[11px] font-mono">
                        <Clock size={13} className="text-[#A39E93]" /> ETA
                      </div>
                      <div className="font-display font-black text-2xl text-[#F2EFE9] mt-1">
                        {route.eta}
                      </div>
                      <div className="text-[10px] text-[#78736A] mt-0.5">
                        {isRec ? "+4m detour" : "Raw travel time"}
                      </div>
                    </div>

                    {/* Hazards Passed */}
                    <div className="p-3 rounded-xl bg-[#0E0E10]/80 border border-white/[0.05]">
                      <div className="flex items-center gap-1.5 text-[#78736A] text-[11px] font-mono">
                        <WarningOctagon
                          size={13}
                          className={isRec ? "text-[#3EA370]" : "text-[#E5484D]"}
                        />{" "}
                        Hazards
                      </div>
                      <div
                        className={`font-display font-black text-2xl mt-1 ${
                          isRec ? "text-[#3EA370]" : "text-[#E5484D]"
                        }`}
                      >
                        {route.hazardsCount}
                      </div>
                      <div className="text-[10px] text-[#78736A] mt-0.5">
                        {route.criticalHazards > 0 ? `${route.criticalHazards} severe craters` : "0 severe"}
                      </div>
                    </div>

                    {/* Health Score */}
                    <div
                      className="p-3 rounded-xl border relative overflow-hidden"
                      style={{
                        backgroundColor: isRec ? "rgba(229, 149, 24, 0.08)" : "rgba(229, 72, 77, 0.08)",
                        borderColor: isRec ? "rgba(229, 149, 24, 0.28)" : "rgba(229, 72, 77, 0.28)",
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-[#A39E93] text-[11px] font-mono">
                        <ShieldCheck
                          size={13}
                          className={isRec ? "text-[#E59518]" : "text-[#E5484D]"}
                        />{" "}
                        Health
                      </div>
                      <div
                        className="font-display font-black text-2xl mt-1 flex items-baseline gap-0.5"
                        style={{ color: route.scoreColor }}
                      >
                        <span>{route.score}</span>
                        <span className="text-xs text-[#78736A] font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-[#A39E93] mt-0.5 font-medium">
                        {isRec ? "Optimal Grade" : "Severe Stress"}
                      </div>
                    </div>
                  </div>

                  {/* Highlights checklist */}
                  <div className="mt-5 space-y-2 text-xs">
                    {route.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-[#A39E93] py-1 border-b border-white/[0.04] last:border-0">
                        <span>{h.label}:</span>
                        <span
                          className={`font-mono font-medium ${
                            isRec ? "text-[#E59518]" : "text-[#F87171]"
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
                        ? "bg-[#E59518]/10 text-[#F2EFE9] border border-[#E59518]/25"
                        : "bg-[#E5484D]/10 text-[#F87171] border border-[#E5484D]/25"
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

        {/* Visual Route Corridor Schematic */}
        <Reveal delay={300} className="mt-8">
          <div className="rounded-2xl border border-white/[0.08] bg-[#141416]/95 p-6 relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-[#E59518]" />
                <h4 className={`${FONT_DISPLAY} text-base md:text-lg text-[#F2EFE9] font-bold`}>
                  Live Corridor Telemetry Comparison
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#F87171]">
                  <span className="w-3 h-0.5 bg-[#E5484D] inline-block" /> Fastest ({comparison.fastest.hazardsCount} hazards)
                </span>
                <span className="flex items-center gap-1.5 text-[#E59518]">
                  <span className="w-3 h-0.5 bg-[#E59518] inline-block" /> Recommended ({comparison.recommended.hazardsCount} hazards)
                </span>
              </div>
            </div>

            {/* SVG Corridor Schematic */}
            <div className="w-full h-36 md:h-44 bg-[#0A0A0C] rounded-xl border border-white/[0.04] relative p-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 160" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="200" y2="160" stroke="rgba(255,255,255,0.02)" />
                <line x1="400" y1="0" x2="400" y2="160" stroke="rgba(255,255,255,0.02)" />
                <line x1="600" y1="0" x2="600" y2="160" stroke="rgba(255,255,255,0.02)" />

                {/* Fastest Route Path (Red, cuts directly through hazards) */}
                <path
                  d="M 50 80 C 220 50, 380 40, 520 70 C 620 90, 700 80, 750 80"
                  stroke="#E5484D"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.85"
                />

                {/* Recommended Route Path (Amber, smooth loop around hazards) */}
                <path
                  d="M 50 80 C 180 130, 360 135, 540 120 C 650 110, 700 85, 750 80"
                  stroke="#E59518"
                  strokeWidth="3.5"
                  className="rw-route-dash"
                />

                {/* Hazard Markers on Fastest Path */}
                <circle cx="210" cy="56" r="5" fill="#E5484D" />
                <circle cx="210" cy="56" r="9" stroke="#E5484D" strokeWidth="1.2" opacity="0.6" />
                <text x="210" y="42" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Pothole</text>

                <circle cx="340" cy="46" r="6" fill="#E5484D" />
                <circle cx="340" cy="46" r="10" stroke="#E5484D" strokeWidth="1.2" opacity="0.6" />
                <text x="340" y="30" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Waterlog</text>

                <circle cx="480" cy="62" r="5" fill="#E5484D" />
                <circle cx="480" cy="62" r="9" stroke="#E5484D" strokeWidth="1.2" opacity="0.6" />
                <text x="480" y="48" fill="#F87171" fontSize="10" textAnchor="middle" fontFamily="monospace">Crater</text>

                {/* Origin Marker */}
                <circle cx="50" cy="80" r="7" fill="#3EA370" />
                <circle cx="50" cy="80" r="12" stroke="#3EA370" strokeWidth="1.5" opacity="0.4" />
                <text x="50" y="110" fill="#5BAE85" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {comparison.fromName.slice(0, 16)}
                </text>

                {/* Destination Marker */}
                <circle cx="750" cy="80" r="7" fill="#E59518" />
                <circle cx="750" cy="80" r="12" stroke="#E59518" strokeWidth="1.5" opacity="0.4" />
                <text x="750" y="110" fill="#F0A632" fontSize="10" textAnchor="middle" fontWeight="bold">
                  {comparison.toName.slice(0, 16)}
                </text>
              </svg>
            </div>

            {/* Bottom fleet explanation quote as required by prompt */}
            <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm text-[#A39E93]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E59518]" />
                <p className="italic text-[#F2EFE9]/90">
                  "Delivery fleets can route around reported hazards, cutting vehicle damage and delay."
                </p>
              </div>
              <span className="font-mono text-[11px] text-[#E59518]/90">
                Avg. Fleet Savings: ₹14,200 / vehicle / quarter
              </span>
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
