import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import RainLayer from "./RainLayer";
import Pothole from "./Pothole";
import Counter from "./Counter";
import { api } from "@/lib/api";
import { Radioactive as Radar, WarningOctagon, ArrowRight } from "@phosphor-icons/react";

const HERO_BG =
  "https://images.unsplash.com/photo-1566276423184-a8c13d2a88a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxkYXJrJTIwYXNwaGFsdCUyMHJvYWQlMjBuaWdodHxlbnwwfHx8fDE3ODczOTc4ODJ8MA&ixlib=rb-4.1.0&q=85";

export default function Hero() {
  const [stats, setStats] = useState({ total_problems: 2481, resolved_or_progress_pct: 73 });

  useEffect(() => {
    api.get("/stats/overview").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <section id="hero" className="relative min-h-[90vh] overflow-hidden asphalt-bg pt-32 pb-20" data-testid="hero-section">
      <div className="absolute inset-0 bg-cover bg-center opacity-40">
        <img src={HERO_BG} alt="dark asphalt road" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0A0A0A]" />
      <RainLayer count={50} />
      <div className="headlight" />
      <div className="road-lane" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="max-w-4xl">
            <Eyebrow text="/ LIVE · CIVIC INFRASTRUCTURE MONITOR" />
            <h1 className={`${FONT_DISPLAY} text-5xl md:text-7xl leading-[1.02] text-white`} data-testid="hero-headline">
              THE ROAD TELLS A STORY.
              <br />
              <span className="text-amber-400">WE MAKE IT VISIBLE.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-300 max-w-xl leading-relaxed">
              Identify roads. Report problems. Track repairs — end to end, in the open.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/identify"
                data-testid="hero-identify-btn"
                className="px-6 py-3 rounded-full bg-amber-500 text-black font-semibold hover:bg-amber-400 transition-colors inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Radar size={18} weight="bold" /> Identify My Road
              </Link>
              <Link
                to="/report"
                data-testid="hero-report-btn"
                className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium transition-colors inline-flex items-center gap-2"
              >
                <WarningOctagon size={18} weight="bold" /> Report a Pothole
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Stats strip */}
        <Reveal delay={150} className="mt-16">
          <div className="grid md:grid-cols-3 gap-6 items-end">
            <div className="glass rounded-2xl p-5 border border-white/10" data-testid="stat-total">
              <div className="text-[11px] tracking-widest text-zinc-500 font-mono">ROAD PROBLEMS</div>
              <div className="font-display font-black text-4xl mt-1 text-white">
                <Counter end={stats.total_problems} />
              </div>
              <div className="text-xs text-zinc-500 mt-1">Reported across the network</div>
            </div>

            <div className="flex justify-center">
              <Pothole size={200} />
            </div>

            <div className="glass rounded-2xl p-5 border border-white/10" data-testid="stat-progress">
              <div className="text-[11px] tracking-widest text-zinc-500 font-mono">RESOLVED / IN PROGRESS</div>
              <div className="font-display font-black text-4xl mt-1 text-amber-400">
                <Counter end={stats.resolved_or_progress_pct} suffix="%" />
              </div>
              <div className="text-xs text-zinc-500 mt-1">Active civic response</div>
            </div>
          </div>
        </Reveal>

        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
