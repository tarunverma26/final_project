import React, { useEffect, useState } from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import { api } from "@/lib/api";
import { Calendar, Clock, MapPin, HardHat, ShieldCheck, ArrowRight } from "@phosphor-icons/react";

const DEMO_EVENTS = [
  {
    _id: "evt-01",
    title: "NH-48 Corridor Bituminous Resurfacing",
    description: "Nighttime milling and high-durability asphalt resurfacing between Rajiv Chowk and Kherki Daula toll plaza.",
    start_date: "2026-10-02T22:00:00Z",
    end_date: "2026-10-08T06:00:00Z",
    location: "NH-48 Express Corridor (Km 31 to Km 37)",
    authority: "NHAI",
    status: "SCHEDULED",
    impact: "Night lane diversion (10 PM – 5 AM)",
  },
  {
    _id: "evt-02",
    title: "Pre-Monsoon Stormwater Drain Desilting",
    description: "Deep channel dredging and culvert clearing along major arterial junctions to prevent waterlogging bottlenecks.",
    start_date: "2026-10-05T08:00:00Z",
    end_date: "2026-10-12T18:00:00Z",
    location: "Sardar Patel Marg & Old Delhi Wards",
    authority: "MCD",
    status: "IN_PROGRESS",
    impact: "Slow moving service lane traffic",
  },
  {
    _id: "evt-03",
    title: "Sector 14 Arterial Junction LED Retrofit",
    description: "Replacement of failed high-pressure sodium lamps with connected smart solar-hybrid LED poles.",
    start_date: "2026-10-10T09:00:00Z",
    end_date: "2026-10-15T17:00:00Z",
    location: "Sector 14 / Civic Center Ring",
    authority: "PWD",
    status: "SCHEDULED",
    impact: "Zero road blockage",
  },
];

export default function EventsSection() {
  const [events, setEvents] = useState(DEMO_EVENTS);

  useEffect(() => {
    api
      .get("/events")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setEvents(res.data);
        }
      })
      .catch(() => {
        // Retain default demo events
      });
  }, []);

  return (
    <section id="events" className="relative py-24 asphalt-bg overflow-hidden" data-testid="events-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow text="/ CIVIC EVENTS & ROADWORKS" />
            <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
              Scheduled roadworks & <span className="text-amber-400">civic events.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-400 leading-relaxed">
              Stay ahead of planned lane resurfacing, drain desilting operations, and public utility upgrades announced
              directly by authorized departments.
            </p>
          </div>
        </Reveal>

        {/* Events Cards Grid */}
        <Reveal delay={150} className="mt-10">
          <div className="grid md:grid-cols-3 gap-6">
            {events.slice(0, 3).map((evt) => (
              <div
                key={evt._id || evt.title}
                data-testid={`event-card-${(evt.title || "").toLowerCase().replace(/\s+/g, "-")}`}
                className="rounded-2xl border border-white/10 bg-[#111114]/90 p-6 flex flex-col justify-between transition-all duration-300 hover:border-amber-500/40 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                      {evt.authority || "PWD"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {evt.status || "PLANNED"}
                    </span>
                  </div>

                  <h3 className={`${FONT_DISPLAY} text-lg md:text-xl text-white font-bold leading-snug`}>
                    {evt.title}
                  </h3>

                  <p className="mt-2 text-xs md:text-sm text-zinc-400 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 space-y-2 text-xs text-zinc-400 font-mono">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin size={14} className="text-amber-400 shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Calendar size={14} className="text-zinc-500 shrink-0" />
                    <span>
                      {evt.start_date ? new Date(evt.start_date).toLocaleDateString() : "Upcoming"}
                    </span>
                  </div>
                  {evt.impact && (
                    <div className="text-[11px] text-amber-400/90 pt-1">
                      ⚠️ {evt.impact}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider as required */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
