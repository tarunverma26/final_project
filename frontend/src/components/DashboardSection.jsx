import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { api } from "@/lib/api";
import { ChartBar, ArrowRight, Gauge, TrendUp, ShieldCheck, CheckCircle, Clock } from "@phosphor-icons/react";

export default function DashboardSection() {
  const [stats, setStats] = useState({
    total_problems: 2481,
    resolved_count: 1811,
    in_progress_count: 420,
    avg_resolution_days: 3.4,
  });

  useEffect(() => {
    api
      .get("/stats/overview")
      .then((res) => {
        if (res.data) {
          setStats((prev) => ({
            ...prev,
            total_problems: res.data.total_problems ?? prev.total_problems,
            resolved_count: res.data.resolved ?? res.data.resolved_count ?? prev.resolved_count,
            in_progress_count: res.data.in_progress ?? res.data.in_progress_count ?? prev.in_progress_count,
            avg_resolution_days: res.data.avg_resolution_days ?? prev.avg_resolution_days,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="dashboard" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="dashboard-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ CIVIC INTELLIGENCE DASHBOARD" />
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
                Real-time analytics for <span className="text-[#F97316]">citizens & officials.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
                Track complaint resolution velocity, contractor SLAs, and infrastructure budget utilization in the open.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-xs font-mono font-semibold text-[#F97316] hover:text-[#EA580C] flex items-center gap-1.5 self-start md:self-auto bg-orange-50 hover:bg-orange-100 px-3.5 py-2 rounded-xl border border-orange-200 transition-colors cursor-pointer"
            >
              <span>Open full analytics console</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </Reveal>

        {/* 4 Analytics Metrics Cards */}
        <Reveal delay={150} className="mt-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            
            {/* Card 1: Total Reported */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
              <div className="text-[11px] font-mono text-[#64748B] uppercase font-semibold">TOTAL REPORTED</div>
              <div className="font-display font-extrabold text-3xl md:text-4xl text-[#12304A] mt-2">
                {stats.total_problems}
              </div>
              <div className="text-xs text-[#64748B] mt-1.5 flex items-center gap-1">
                <span>Validated across network</span>
              </div>
            </div>

            {/* Card 2: Resolved */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
              <div className="text-[11px] font-mono text-[#64748B] uppercase font-semibold">RESOLVED DEFECTS</div>
              <div className="font-display font-extrabold text-3xl md:text-4xl text-[#16A34A] mt-2">
                {stats.resolved_count}
              </div>
              <div className="text-xs text-[#16A34A] mt-1.5 flex items-center gap-1 font-medium">
                <CheckCircle size={14} weight="fill" />
                <span>Double-GPS verified</span>
              </div>
            </div>

            {/* Card 3: In Active Progress */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
              <div className="text-[11px] font-mono text-[#64748B] uppercase font-semibold">UNDER REPAIR</div>
              <div className="font-display font-extrabold text-3xl md:text-4xl text-[#F59E0B] mt-2">
                {stats.in_progress_count}
              </div>
              <div className="text-xs text-amber-700 mt-1.5 flex items-center gap-1 font-medium">
                <Clock size={14} weight="bold" />
                <span>Crews actively deployed</span>
              </div>
            </div>

            {/* Card 4: Avg Resolution Velocity */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-2xs hover:shadow-sm transition-shadow">
              <div className="text-[11px] font-mono text-[#64748B] uppercase font-semibold">AVG RESOLUTION</div>
              <div className="font-display font-extrabold text-3xl md:text-4xl text-[#0F766E] mt-2">
                {stats.avg_resolution_days}d
              </div>
              <div className="text-xs text-[#0F766E] mt-1.5 flex items-center gap-1 font-medium">
                <TrendUp size={14} weight="bold" />
                <span>42% faster than 2025</span>
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
