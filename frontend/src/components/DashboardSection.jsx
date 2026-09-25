import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { api } from "@/lib/api";
import { ChartBar, ArrowRight, Gauge, TrendUp, ShieldCheck } from "@phosphor-icons/react";

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
        if (res.data) setStats((prev) => ({ ...prev, ...res.data }));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="dashboard" className="relative py-24 asphalt-bg overflow-hidden" data-testid="dashboard-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ CIVIC INTELLIGENCE DASHBOARD" />
              <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
                Real-time analytics for <span className="text-amber-400">citizens & officials.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-zinc-400 leading-relaxed">
                Track complaint resolution velocity, contractor SLAs, and infrastructure budget utilization in the open.
              </p>
            </div>

            <Link
              to="/dashboard"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              Open full analytics console <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#111114]/90 p-5">
              <div className="text-[11px] font-mono text-zinc-500">TOTAL REPORTED</div>
              <div className={`${FONT_DISPLAY} text-3xl md:text-4xl text-white mt-1`}>
                {stats.total_problems}
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Validated across network</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111114]/90 p-5">
              <div className="text-[11px] font-mono text-zinc-500">RESOLVED REPAIRS</div>
              <div className={`${FONT_DISPLAY} text-3xl md:text-4xl text-emerald-400 mt-1`}>
                {stats.resolved_count || 1811}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Geotag & AI verified</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111114]/90 p-5">
              <div className="text-[11px] font-mono text-zinc-500">UNDER REPAIR</div>
              <div className={`${FONT_DISPLAY} text-3xl md:text-4xl text-amber-400 mt-1`}>
                {stats.in_progress_count || 420}
              </div>
              <div className="text-[10px] text-amber-400/80 mt-1">Crews currently deployed</div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111114]/90 p-5">
              <div className="text-[11px] font-mono text-zinc-500">AVG RESOLUTION SLA</div>
              <div className={`${FONT_DISPLAY} text-3xl md:text-4xl text-white mt-1`}>
                {stats.avg_resolution_days || 3.4}d
              </div>
              <div className="text-[10px] text-zinc-500 mt-1">Down from 18.2d in 2025</div>
            </div>
          </div>
        </Reveal>

        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
