import React, { useState } from "react";
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
  Sparkle,
  ArrowRight,
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
    riskLevel: "Critical Risk",
    diagnosis: "Severe monsoon waterlogging with deep sub-base cavities along historic transit corridors.",
    compoundInsight: "Bad road + failed drainage = active flood-prone disaster stretch.",
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
    compoundInsight: "Industrial freight + cracked culverts = structural pavement breakdown.",
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
    riskLevel: "Moderate Risk",
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
];

export default function StressIndexSection() {
  const [selectedZoneId, setSelectedZoneId] = useState("zone-1");
  const current = INITIAL_ZONES.find((z) => z.id === selectedZoneId) || INITIAL_ZONES[0];

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-red-50 text-[#DC2626] border-red-200";
    if (score >= 60) return "bg-amber-50 text-[#D97706] border-amber-200";
    return "bg-emerald-50 text-[#16A34A] border-emerald-200";
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#DC2626";
    if (score >= 60) return "#F59E0B";
    return "#16A34A";
  };

  return (
    <section id="stress-index" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="stress-index-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ COMPOUND INFRASTRUCTURE METRICS" />
            <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
              Compound Resource <span className="text-[#0F766E]">Stress Index.</span>
            </h2>
            <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
              Potholes do not occur in isolation. Our algorithmic model layers road surface degradation with clogged drainage
              runs and broken streetlights to calculate compound vulnerability scores across municipal wards.
            </p>
          </div>
        </Reveal>

        {/* 2-Column Interface: Zone Selector + Detailed Diagnostic */}
        <Reveal delay={150} className="mt-12">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Zone List (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#64748B] px-1 mb-1 font-semibold uppercase tracking-wider">
                <span>VULNERABILITY RANKING</span>
                <span>COMPOUND SCORE</span>
              </div>

              {INITIAL_ZONES.map((zone) => {
                const isSelected = zone.id === selectedZoneId;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    data-testid={`stress-zone-${zone.id}`}
                    className={`rounded-2xl p-4 cursor-pointer transition-all duration-200 border flex items-center justify-between gap-4 ${
                      isSelected
                        ? "bg-white border-2 border-[#0F766E] shadow-md ring-4 ring-teal-50"
                        : "bg-white border-[#E2E8F0] hover:border-slate-300 shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#64748B]">
                        {zone.priorityRank}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#12304A]">
                            {zone.ward}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${getScoreBadge(
                              zone.score
                            )}`}
                          >
                            {zone.riskLevel}
                          </span>
                        </div>
                        <div className="text-xs text-[#64748B] line-clamp-1 mt-0.5">
                          {zone.name}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="font-display font-black text-2xl"
                        style={{ color: getScoreColor(zone.score) }}
                      >
                        {zone.score}
                      </div>
                      <div className="text-[10px] font-mono text-[#64748B]">INDEX</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Zone Deep Dive (7 cols on lg) */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-8 shadow-sm">
                
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#F1F5F9]">
                  <div>
                    <span className="text-xs font-mono text-[#0F766E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkle size={14} weight="fill" />
                      ALGORITHMIC DIAGNOSIS · {current.ward}
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl text-[#12304A] font-extrabold mt-1">
                      {current.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${getScoreBadge(
                        current.score
                      )}`}
                    >
                      Priority Rank {current.priorityRank}
                    </span>
                  </div>
                </div>

                {/* Score Big Indicator */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-teal-50/50 border border-teal-100">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center font-display font-black text-3xl shadow-xs"
                      style={{
                        backgroundColor: "#FFFFFF",
                        color: getScoreColor(current.score),
                        border: `2px solid ${getScoreColor(current.score)}`,
                      }}
                    >
                      {current.score}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#12304A]">
                        Compound Stress Index (/100)
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        Weighted combination of structural, hydraulic & transit risk
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-semibold text-[#0F766E] bg-white border border-teal-200 px-3 py-1.5 rounded-xl w-fit">
                    AI Automated Allocation
                  </div>
                </div>

                {/* Factor Contribution Breakdown */}
                <div className="mt-6 space-y-4">
                  <div className="text-xs font-mono text-[#64748B] uppercase tracking-wider font-semibold">
                    COMPONENT CONTRIBUTIONS
                  </div>

                  {/* Potholes */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <WarningCircle size={14} className="text-[#DC2626]" weight="fill" />
                        Pothole & Surface Ruptures
                      </span>
                      <span className="font-mono font-bold text-[#DC2626]">
                        {current.potholes} defects
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#DC2626] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, current.potholes * 2)}%` }}
                      />
                    </div>
                  </div>

                  {/* Drainage */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <Drop size={14} className="text-[#2563EB]" weight="fill" />
                        Clogged Stormwater Culverts
                      </span>
                      <span className="font-mono font-bold text-[#2563EB]">
                        {current.drainage} choke points
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, current.drainage * 2.5)}%` }}
                      />
                    </div>
                  </div>

                  {/* Streetlighting */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#0F172A] flex items-center gap-1.5">
                        <Lightbulb size={14} className="text-[#F59E0B]" weight="fill" />
                        Streetlight Inactive Spans
                      </span>
                      <span className="font-mono font-bold text-[#D97706]">
                        {current.lighting} dark spans
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, current.lighting * 4)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Compound Insight Callout */}
                <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-200/80 text-xs text-[#9A3412]">
                  <div className="font-semibold text-[#C2410C] flex items-center gap-1.5 mb-1 text-xs">
                    <ShieldWarning size={16} weight="fill" />
                    Compound Hazard Synergy Detected
                  </div>
                  {current.compoundInsight}
                </div>

                {/* Municipal Dispatch SLA Recommendation */}
                <div className="mt-5 pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[#64748B]">
                    Suggested Intervention:{" "}
                    <strong className="text-[#12304A]">Joint PWD Bitumen + MCD Drainage Clearing Crew</strong>
                  </div>
                  <span className="font-mono text-[#0F766E] font-semibold bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    SLA: 48h Mandatory
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
