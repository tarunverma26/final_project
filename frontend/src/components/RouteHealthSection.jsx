import React, { useState } from "react";
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
  Sparkle,
} from "@phosphor-icons/react";

/**
 * CONDITION-AWARE ROUTING & HAZARD-SCORING ENGINE
 * Generates deterministic, plausible mock distance, ETA, hazard count, and road health scores
 * for any arbitrary From/To pair. In production, this integrates with real spatial telemetry.
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

  const baseKm = 8.5 + (abs % 130) / 10;
  const fastDist = `${baseKm.toFixed(1)} km`;
  const recDist = `${(baseKm + 2.3 + (abs % 12) / 10).toFixed(1)} km`;

  const fastEtaMin = 18 + (abs % 16);
  const recEtaMin = fastEtaMin + 3 + (abs % 4);

  const fastHazards = 9 + (abs % 10);
  const fastCritical = 3 + (abs % 5);
  const recHazards = 1 + (abs % 3);

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
      scoreColor: "#DC2626",
      borderStyle: "border-[#E2E8F0] bg-white hover:border-slate-300 shadow-sm",
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
      scoreColor: "#16A34A",
      borderStyle: "border-2 border-emerald-500/80 bg-white shadow-md ring-4 ring-emerald-50/60",
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
    <section id="route-health" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="route-health-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ CONDITION-AWARE NAVIGATION" />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
              Fastest route vs. <span className="text-[#F97316]">Healthiest route.</span>
            </h2>
            <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
              Standard navigation optimizes solely for travel time, routing vehicles directly across severe axle-breaking
              craters. RoadWatch maps real-time hazard reports to compute road condition health scores for safer transit.
            </p>
          </div>
        </Reveal>

        {/* Editable Location Inputs & Route Comparison Form */}
        <Reveal delay={100} className="mt-10">
          <form
            onSubmit={handleCompare}
            className="rounded-2xl p-5 md:p-6 border border-[#E2E8F0] bg-white shadow-sm"
            data-testid="route-search-form"
          >
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
              
              {/* Origin Field */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#16A34A] pointer-events-none">
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-colors font-medium"
                />
              </div>

              <div className="hidden md:flex items-center text-[#94A3B8]">
                <ArrowRight size={16} />
              </div>

              {/* Destination Field */}
              <div className="flex-1 relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F97316] pointer-events-none">
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
                  className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#F97316] focus:bg-white focus:ring-1 focus:ring-[#F97316] transition-colors font-medium"
                />
              </div>

              {/* Compare Button */}
              <button
                type="submit"
                disabled={!isFormValid || isCalculating}
                data-testid="route-compare-btn"
                className="px-6 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-xs hover:shadow cursor-pointer shrink-0"
              >
                <ArrowsClockwise size={16} className={isCalculating ? "animate-spin" : ""} />
                <span>{isCalculating ? "Calculating..." : "Compare Routes"}</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 text-xs text-[#DC2626] font-mono flex items-center gap-1.5" data-testid="route-error-msg">
                <Info size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Quick Suggestion Corridor Pills */}
            <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] flex items-center gap-2 overflow-x-auto text-xs text-[#64748B]">
              <span className="font-mono text-[11px] shrink-0 font-semibold uppercase tracking-wider text-[#94A3B8]">
                Suggested:
              </span>
              <button
                type="button"
                onClick={() => {
                  setFromInput("Sector 14 Civic Center");
                  setToInput("Udyog Vihar Phase IV");
                  setComparison(computeRouteComparison("Sector 14 Civic Center", "Udyog Vihar Phase IV"));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#12304A] font-medium text-[11px] transition-colors shrink-0 cursor-pointer"
              >
                Sector 14 → Udyog Vihar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFromInput("DLF Cyber City Phase II");
                  setToInput("Subhash Chowk, Sohna Road");
                  setComparison(computeRouteComparison("DLF Cyber City Phase II", "Subhash Chowk, Sohna Road"));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#12304A] font-medium text-[11px] transition-colors shrink-0 cursor-pointer"
              >
                Cyber City → Sohna Road
              </button>
              <button
                type="button"
                onClick={() => {
                  setFromInput("IFFCO Chowk Metro");
                  setToInput("Golf Course Ext Corridor");
                  setComparison(computeRouteComparison("IFFCO Chowk Metro", "Golf Course Ext Corridor"));
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#12304A] font-medium text-[11px] transition-colors shrink-0 cursor-pointer"
              >
                IFFCO Chowk → Golf Course Ext
              </button>
            </div>
          </form>
        </Reveal>

        {/* Comparison Cards: Fastest vs Recommended */}
        <Reveal delay={200} className="mt-8">
          <div className="grid lg:grid-cols-2 gap-6 items-stretch">
            {routes.map((route) => {
              const isRec = route.type === "recommended";
              const isSelected = selectedRoute === route.id;

              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route.id)}
                  data-testid={`route-card-${route.id}`}
                  className={`rounded-2xl p-6 md:p-8 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    route.borderStyle
                  }`}
                >
                  <div>
                    {/* Header Badge & Dist */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[11px] font-mono font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                          isRec
                            ? "bg-emerald-100 text-[#16A34A] border border-emerald-300"
                            : "bg-red-50 text-[#DC2626] border border-red-200"
                        }`}
                      >
                        {route.badge}
                      </span>
                      <span className="font-mono text-xs text-[#64748B] flex items-center gap-1 font-medium">
                        <Path size={14} /> {route.distance}
                      </span>
                    </div>

                    <h3 className="font-display text-xl md:text-2xl text-[#12304A] font-bold leading-tight">
                      {route.name}
                    </h3>

                    <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                      {route.description}
                    </p>
                  </div>

                  {/* Metrics Bar */}
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9] grid grid-cols-3 gap-3 text-center">
                    {/* ETA */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                      <div className="flex items-center justify-center gap-1.5 text-[#64748B] text-[11px] font-mono">
                        <Clock size={13} /> ETA
                      </div>
                      <div className="font-display font-extrabold text-2xl text-[#12304A] mt-1">
                        {route.eta}
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        {isRec ? "+3 min detour" : "Direct line"}
                      </div>
                    </div>

                    {/* Hazards Passed */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0]">
                      <div className="flex items-center justify-center gap-1.5 text-[#64748B] text-[11px] font-mono">
                        <WarningOctagon
                          size={13}
                          className={isRec ? "text-[#16A34A]" : "text-[#DC2626]"}
                        />
                        Hazards
                      </div>
                      <div
                        className={`font-display font-extrabold text-2xl mt-1 ${
                          isRec ? "text-[#16A34A]" : "text-[#DC2626]"
                        }`}
                      >
                        {route.hazardsCount}
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5">
                        {route.criticalHazards > 0 ? `${route.criticalHazards} severe craters` : "0 severe"}
                      </div>
                    </div>

                    {/* Health Score */}
                    <div
                      className="p-3 rounded-xl border relative overflow-hidden"
                      style={{
                        backgroundColor: isRec ? "rgba(22, 163, 74, 0.08)" : "rgba(220, 38, 38, 0.06)",
                        borderColor: isRec ? "rgba(22, 163, 74, 0.25)" : "rgba(220, 38, 38, 0.2)",
                      }}
                    >
                      <div className="flex items-center justify-center gap-1.5 text-[#64748B] text-[11px] font-mono font-semibold">
                        <ShieldCheck
                          size={13}
                          className={isRec ? "text-[#16A34A]" : "text-[#DC2626]"}
                        />
                        Health Score
                      </div>
                      <div
                        className="font-display font-extrabold text-2xl mt-1 flex items-baseline justify-center gap-0.5"
                        style={{ color: route.scoreColor }}
                      >
                        <span>{route.score}</span>
                        <span className="text-xs text-[#64748B] font-normal">/100</span>
                      </div>
                      <div className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                        {isRec ? "Optimal Grade" : "Severe Stress"}
                      </div>
                    </div>
                  </div>

                  {/* Highlights checklist */}
                  <div className="mt-5 space-y-2 text-xs">
                    {route.highlights.map((h, i) => (
                      <div key={i} className="flex items-center justify-between text-[#64748B] py-1 border-b border-[#F1F5F9] last:border-0">
                        <span>{h.label}:</span>
                        <span
                          className={`font-mono font-bold ${
                            isRec ? "text-[#16A34A]" : "text-[#DC2626]"
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
                        ? "bg-emerald-50 text-[#166534] border border-emerald-200"
                        : "bg-red-50 text-[#991B1B] border border-red-200"
                    }`}
                  >
                    <Truck size={18} className="shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold">Fleet Economic Impact:</strong>
                      <span className="opacity-95">{route.fleetImpact}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Visual Route Corridor Schematic */}
        <Reveal delay={300} className="mt-8">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Car size={18} className="text-[#0F766E]" />
                <h4 className="font-display text-base md:text-lg text-[#12304A] font-bold">
                  Live Corridor Telemetry Comparison
                </h4>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono font-medium">
                <span className="flex items-center gap-1.5 text-[#DC2626]">
                  <span className="w-3 h-0.5 bg-[#DC2626] inline-block" /> Fastest ({comparison.fastest.hazardsCount} hazards)
                </span>
                <span className="flex items-center gap-1.5 text-[#16A34A]">
                  <span className="w-3 h-0.5 bg-[#16A34A] inline-block" /> Recommended ({comparison.recommended.hazardsCount} hazards)
                </span>
              </div>
            </div>

            {/* SVG Corridor Schematic */}
            <div className="w-full h-36 md:h-44 bg-slate-50 rounded-xl border border-[#E2E8F0] relative p-4 flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 160" fill="none" preserveAspectRatio="none">
                <line x1="0" y1="80" x2="800" y2="80" stroke="#E2E8F0" strokeDasharray="4 4" />
                <line x1="200" y1="0" x2="200" y2="160" stroke="#F1F5F9" />
                <line x1="400" y1="0" x2="400" y2="160" stroke="#F1F5F9" />
                <line x1="600" y1="0" x2="600" y2="160" stroke="#F1F5F9" />

                {/* Fastest Route Path (Red, cuts directly through hazards) */}
                <path
                  d="M 50 80 C 220 50, 380 40, 520 70 C 620 90, 700 80, 750 80"
                  stroke="#DC2626"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                  opacity="0.85"
                />

                {/* Recommended Route Path (Emerald, smooth loop around hazards) */}
                <path
                  d="M 50 80 C 180 130, 360 135, 540 120 C 650 110, 700 85, 750 80"
                  stroke="#16A34A"
                  strokeWidth="3.5"
                  className="rw-route-dash"
                />

                {/* Hazard Markers on Fastest Path */}
                <circle cx="230" cy="53" r="5" fill="#DC2626" />
                <circle cx="340" cy="43" r="6" fill="#DC2626" />
                <circle cx="480" cy="62" r="5" fill="#DC2626" />
                <circle cx="640" cy="88" r="4" fill="#DC2626" />

                {/* Origin and Destination Pin Nodes */}
                <circle cx="50" cy="80" r="9" fill="#12304A" />
                <circle cx="50" cy="80" r="4" fill="#FFFFFF" />
                <text x="50" y="62" fill="#12304A" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  FROM
                </text>

                <circle cx="750" cy="80" r="9" fill="#16A34A" />
                <circle cx="750" cy="80" r="4" fill="#FFFFFF" />
                <text x="750" y="62" fill="#16A34A" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                  DESTINATION
                </text>
              </svg>
            </div>

            <p className="mt-3 text-xs text-[#64748B] font-mono text-center">
              Delivery fleets can route around reported hazards, cutting vehicle breakdown damage and transit delays.
            </p>
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
