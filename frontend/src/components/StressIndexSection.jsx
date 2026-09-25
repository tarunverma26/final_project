import React, { useState } from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import {
  WarningCircle,
  Drop,
  Lightbulb,
  TrendUp,
  ShieldWarning,
  Funnel,
  Buildings,
  CheckCircle,
  Waves,
} from "@phosphor-icons/react";

const INITIAL_ZONES = [
  {
    id: "zone-1",
    ward: "Ward 14",
    name: "Old Delhi & Sadar Bazar Corridor",
    score: 88,
    potholes: 42,
    drainage: 31,
    lighting: 18,
    riskLevel: "High Risk",
    diagnosis: "Severe monsoon waterlogging with deep sub-base cavities along historic transit corridors.",
    compoundInsight: "Bad road + failed drainage = active flood-prone stretch.",
    priorityRank: "#01",
  },
  {
    id: "zone-2",
    ward: "Ward 22",
    name: "Sohna Road Industrial Belt",
    score: 78,
    potholes: 36,
    drainage: 24,
    lighting: 15,
    riskLevel: "High Risk",
    diagnosis: "Heavy freight axle-loads accelerating saturated bituminous layer collapse.",
    compoundInsight: "Industrial freight + cracked culverts = pavement breakdown.",
    priorityRank: "#02",
  },
  {
    id: "zone-3",
    ward: "Ward 09",
    name: "Sector 14 / Civic Center",
    score: 62,
    potholes: 21,
    drainage: 16,
    lighting: 12,
    riskLevel: "Medium Risk",
    diagnosis: "Runoff saturation at major roundabout junctions causing surface asphalt peeling.",
    compoundInsight: "Drainage overflow pooling into freshly formed potholes.",
    priorityRank: "#03",
  },
  {
    id: "zone-4",
    ward: "Ward 18",
    name: "Udyog Vihar Phase IV & V",
    score: 49,
    potholes: 15,
    drainage: 11,
    lighting: 9,
    riskLevel: "Medium Risk",
    diagnosis: "Commuter lane erosion with recurring nighttime visibility blind spots.",
    compoundInsight: "Streetlight outage + road potholes = dangerous night hazard.",
    priorityRank: "#04",
  },
  {
    id: "zone-5",
    ward: "Ward 06",
    name: "Golf Course Road Underpass Area",
    score: 31,
    potholes: 6,
    drainage: 4,
    lighting: 5,
    riskLevel: "Low Risk",
    diagnosis: "Localized wear, routine patch repairs holding well through dry periods.",
    compoundInsight: "Minor surface defects under regular municipal inspection.",
    priorityRank: "#05",
  },
  {
    id: "zone-6",
    ward: "Ward 02",
    name: "Cyber Hub & DLF Horizon Walkway",
    score: 16,
    potholes: 2,
    drainage: 1,
    lighting: 2,
    riskLevel: "Low Risk",
    diagnosis: "Optimal condition, engineered subsurface stormwater runoff channels.",
    compoundInsight: "Fully operational infrastructure, zero compounding alerts.",
    priorityRank: "#06",
  },
];

export default function StressIndexSection() {
  const [filter, setFilter] = useState("all");

  // Sorted high to low risk as strictly requested
  const sortedZones = [...INITIAL_ZONES].sort((a, b) => b.score - a.score);

  const filteredZones = sortedZones.filter((z) => {
    if (filter === "high") return z.score >= 70;
    if (filter === "medium") return z.score >= 40 && z.score < 70;
    if (filter === "low") return z.score < 40;
    return true;
  });

  const getRiskStyle = (score) => {
    if (score >= 70) {
      return {
        badgeColor: C.red,
        bgGlow: C.redGlow,
        border: "border-red-500/40",
        pillBg: "bg-red-500/10 text-red-400 border border-red-500/30",
        barColor: "bg-red-500",
        label: "CRITICAL RISK",
      };
    }
    if (score >= 40) {
      return {
        badgeColor: C.amber,
        bgGlow: C.amberGlow,
        border: "border-amber-500/40",
        pillBg: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
        barColor: "bg-amber-500",
        label: "ELEVATED RISK",
      };
    }
    return {
      badgeColor: C.green,
      bgGlow: C.greenGlow,
      border: "border-emerald-500/30",
      pillBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
      barColor: "bg-emerald-500",
      label: "LOW RISK",
    };
  };

  return (
    <section id="stress-index" className="relative py-24 asphalt-bg overflow-hidden" data-testid="stress-index-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ COMPOUND RESOURCE STRESS INDEX" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              Compound Resource <span className="text-amber-400">Stress Index.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              Potholes, drainage failures, and streetlight outages are tracked separately with no single view of how bad
              an area is. RoadWatch synthesizes cross-department data into a single 0–100 vulnerability score.
            </p>
          </div>
        </Reveal>

        {/* Short explanation quote as required by prompt */}
        <Reveal delay={100} className="mt-8">
          <div className="glass rounded-xl p-4 md:p-5 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Waves size={20} weight="bold" />
              </div>
              <p className="text-xs md:text-sm text-zinc-300 italic">
                "Combines multiple infrastructure signals to flag compounding risk (e.g. bad road + failed drainage = flood-prone stretch) that single-issue tracking misses."
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 self-end md:self-auto font-mono text-xs">
              <span className="text-zinc-500 text-[11px] mr-1 hidden sm:inline">FILTER:</span>
              {[
                { id: "all", label: "All Wards" },
                { id: "high", label: "High Risk (>70)" },
                { id: "medium", label: "Medium (40-69)" },
                { id: "low", label: "Low (<40)" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] transition-colors ${
                    filter === btn.id
                      ? "bg-amber-500 text-black font-semibold"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Grid of 4-6 City Zones/Wards (Responsive: 1 col on mobile, 2 col md, 3 col lg) */}
        <Reveal delay={200} className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredZones.map((zone) => {
              const risk = getRiskStyle(zone.score);
              const totalIssues = zone.potholes + zone.drainage + zone.lighting;

              // Proportions for visual breakdown bar
              const potholePct = Math.round((zone.potholes / totalIssues) * 100);
              const drainagePct = Math.round((zone.drainage / totalIssues) * 100);
              const lightingPct = 100 - potholePct - drainagePct;

              return (
                <div
                  key={zone.id}
                  data-testid={`stress-card-${zone.ward.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`rounded-2xl border bg-[#111114]/90 p-6 flex flex-col justify-between transition-all duration-300 hover:border-white/20 hover:-translate-y-1 ${risk.border}`}
                >
                  {/* Top Bar: Ward Name & Priority Rank */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
                          {zone.ward}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${risk.pillBg}`}>
                          {risk.label}
                        </span>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono">
                        PRIORITY {zone.priorityRank}
                      </span>
                    </div>

                    <h3 className={`${FONT_DISPLAY} text-lg md:text-xl text-white font-bold leading-snug`}>
                      {zone.name}
                    </h3>

                    {/* Composite Score Meter */}
                    <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-[11px] font-mono text-zinc-500">COMPOUND STRESS SCORE</div>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span
                            className="font-display font-black text-3xl md:text-4xl"
                            style={{ color: risk.badgeColor }}
                          >
                            {zone.score}
                          </span>
                          <span className="text-xs text-zinc-500">/100</span>
                        </div>
                      </div>

                      {/* Visual Circular Gauge / Status indicator */}
                      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold"
                        style={{
                          borderColor: risk.badgeColor,
                          backgroundColor: risk.bgGlow,
                          color: risk.badgeColor,
                        }}
                      >
                        {zone.score}
                      </div>
                    </div>
                  </div>

                  {/* 3 Contributing Issue Types Breakdown */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                      <span>CONTRIBUTING SIGNALS</span>
                      <span className="text-zinc-500">{totalIssues} total active</span>
                    </div>

                    {/* Proportional Compound Bar */}
                    <div className="h-2 rounded-full overflow-hidden flex bg-white/10 mb-3">
                      <div
                        style={{ width: `${potholePct}%` }}
                        className="bg-amber-400"
                        title={`Potholes: ${zone.potholes}`}
                      />
                      <div
                        style={{ width: `${drainagePct}%` }}
                        className="bg-blue-400"
                        title={`Drainage: ${zone.drainage}`}
                      />
                      <div
                        style={{ width: `${lightingPct}%` }}
                        className="bg-zinc-400"
                        title={`Lighting: ${zone.lighting}`}
                      />
                    </div>

                    {/* 3 Mini breakdown pills */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-mono">
                          <WarningCircle size={12} /> Road
                        </div>
                        <div className="font-bold text-white mt-0.5">{zone.potholes}</div>
                      </div>

                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-blue-400 font-mono">
                          <Drop size={12} /> Drain
                        </div>
                        <div className="font-bold text-white mt-0.5">{zone.drainage}</div>
                      </div>

                      <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400 font-mono">
                          <Lightbulb size={12} /> Light
                        </div>
                        <div className="font-bold text-white mt-0.5">{zone.lighting}</div>
                      </div>
                    </div>
                  </div>

                  {/* Compounding Risk Insight */}
                  <div className="mt-5 pt-4 border-t border-white/5">
                    <div className="text-[11px] text-zinc-500 font-mono mb-1">COMPOUNDING VULNERABILITY:</div>
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                      {zone.compoundInsight}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider as required */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
