import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { api } from "@/lib/api";
import { HardHat, Star, ArrowRight, ShieldCheck, ClockCounterClockwise, CheckCircle } from "@phosphor-icons/react";

const DEMO_CONTRACTORS = [
  {
    _id: "c-1",
    name: "L&T Infrastructure Projects Ltd",
    authority: "NHAI",
    active_projects: 4,
    rating: 4.8,
    resolved_pct: 94,
    warranty_months: 36,
  },
  {
    _id: "c-2",
    name: "NCC Urban Civil Works",
    authority: "PWD",
    active_projects: 7,
    rating: 4.2,
    resolved_pct: 86,
    warranty_months: 24,
  },
  {
    _id: "c-3",
    name: "Apex Municipal Surface Systems",
    authority: "MCD",
    active_projects: 5,
    rating: 3.9,
    resolved_pct: 78,
    warranty_months: 18,
  },
];

export default function ContractorsSection() {
  const [contractors, setContractors] = useState(DEMO_CONTRACTORS);

  useEffect(() => {
    api
      .get("/contractors")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setContractors(res.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="contractors" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="contractors-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ CONTRACTOR ACCOUNTABILITY" />
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
                Audited by citizens. <span className="text-[#F97316]">Scored by data.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
                Tender execution performance, warranty guarantees, and SLA compliance ratings are published openly.
                Contractors with poor citizen scores face automated municipal audit flags.
              </p>
            </div>

            <Link
              to="/contractors"
              className="text-xs font-mono font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1.5 self-start md:self-auto bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors cursor-pointer"
            >
              <span>Explore all contractor scorecards</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </Reveal>

        {/* Contractor Scorecard Cards */}
        <Reveal delay={150} className="mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            {contractors.map((c, idx) => {
              const cardKey = c._id || c.id || `contractor-${idx}`;
              const ratingNum = typeof c.rating === "number" ? c.rating : (typeof c.avg_rating === "number" ? c.avg_rating : 4.5);
              const authorityBadge = c.authority || c.focus || "CIVIC";
              const activeCount = c.active_projects ?? c.in_progress ?? c.total_complaints ?? 4;
              const resRate = c.resolved_pct ?? c.resolution_rate_pct ?? 85;
              const warranty = c.warranty_months ?? 24;

              return (
                <div
                  key={cardKey}
                  data-testid={`contractor-card-${cardKey}`}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 md:p-7 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-mono font-bold text-[#64748B] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                        {authorityBadge} EMPANELLED
                      </span>
                      <div className="flex items-center gap-1 text-xs font-mono font-bold text-[#D97706] bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                        <Star size={13} weight="fill" className="text-[#F59E0B]" />
                        <span>{ratingNum.toFixed(1)} / 5.0</span>
                      </div>
                    </div>

                    <h3 className="font-display text-xl font-bold text-[#12304A] mt-2">
                      {c.name}
                    </h3>
                    <div className="text-xs text-[#64748B] mt-1">
                      {activeCount} active work packages under supervision
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="mt-6 pt-5 border-t border-[#F1F5F9] space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1.5 font-medium">
                        <span className="text-[#64748B]">SLA Resolution Rate</span>
                        <span className="font-mono font-bold text-[#16A34A]">{resRate}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-[#16A34A] rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, resRate))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 text-xs font-mono">
                      <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                        <ClockCounterClockwise size={14} className="text-[#0F766E]" />
                        Defect Liability:
                      </span>
                      <span className="font-bold text-[#12304A] bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-[#0F766E]">
                        {warranty} Months Warranty
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
