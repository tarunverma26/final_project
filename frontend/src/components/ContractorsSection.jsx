import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { api } from "@/lib/api";
import { HardHat, Star, ArrowRight, ShieldCheck, ClockCounterClockwise } from "@phosphor-icons/react";

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
    <section id="contractors" className="relative py-24 asphalt-bg overflow-hidden" data-testid="contractors-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ CONTRACTOR ACCOUNTABILITY" />
              <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
                Public performance & <span className="text-amber-400">agency audits.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-zinc-400 leading-relaxed">
                Hold construction firms accountable. View real repair histories, warranty obligations, and civic resolution
                efficiency metrics.
              </p>
            </div>

            <Link
              to="/contractors"
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              View all registered contractors <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={150} className="mt-10">
          <div className="grid md:grid-cols-3 gap-6">
            {contractors.slice(0, 3).map((c) => (
              <div
                key={c._id || c.name}
                className="rounded-2xl border border-white/10 bg-[#111114]/90 p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {c.authority || "PWD"}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-mono font-bold">
                      <Star size={13} weight="fill" /> {c.rating || "4.5"}
                    </div>
                  </div>

                  <h3 className={`${FONT_DISPLAY} text-lg md:text-xl text-white font-bold leading-snug`}>
                    {c.name}
                  </h3>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-zinc-500 font-mono text-[10px]">RESOLUTION RATE</div>
                      <div className="font-bold text-emerald-400 font-display text-lg mt-0.5">
                        {c.resolved_pct || 88}%
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <div className="text-zinc-500 font-mono text-[10px]">WARRANTY</div>
                      <div className="font-bold text-white font-display text-lg mt-0.5">
                        {c.warranty_months || 24} mos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>{c.active_projects || 3} active corridors</span>
                  <span className="text-amber-400/90 flex items-center gap-1">
                    <ShieldCheck size={13} /> Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
