import React, { useEffect, useState } from "react";
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
      .catch(() => {});
  }, []);

  const getAuthorityBadge = (auth) => {
    if (auth === "NHAI") return "bg-blue-50 text-[#2563EB] border-blue-200";
    if (auth === "MCD") return "bg-teal-50 text-[#0F766E] border-teal-200";
    return "bg-amber-50 text-[#D97706] border-amber-200";
  };

  const getStatusBadge = (st) => {
    if (st === "IN_PROGRESS") return "bg-amber-50 text-[#D97706] border-amber-200";
    return "bg-slate-100 text-[#12304A] border-slate-200";
  };

  return (
    <section id="events" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="events-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ PUBLIC ROADWORKS SCHEDULE" />
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
                Municipal events & <span className="text-[#F97316]">repair closures.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
                Stay informed on scheduled road paving, nocturnal culvert desilting, and emergency diversions planned across
                governing departments.
              </p>
            </div>

            <div className="text-xs font-mono text-[#64748B] flex items-center gap-1.5 self-start md:self-auto font-medium">
              <HardHat size={16} className="text-[#F97316]" weight="duotone" />
              <span>Coordinated across NHAI, PWD & MCD</span>
            </div>
          </div>
        </Reveal>

        {/* Events Grid */}
        <Reveal delay={150} className="mt-12">
          <div className="grid md:grid-cols-3 gap-6">
            {events.map((evt, idx) => {
              const evtKey = evt._id || evt.id || `event-${idx}`;
              const auth = evt.authority || (evt.organizer && evt.organizer.includes("NHAI") ? "NHAI" : (evt.organizer && evt.organizer.includes("MCD") ? "MCD" : "PWD"));
              const dateDisplay = evt.start_date
                ? `${new Date(evt.start_date).toLocaleDateString([], { month: "short", day: "numeric" })} – ${new Date(evt.end_date || evt.start_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
                : (evt.date ? `${new Date(evt.date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}` : "Scheduled Public Notice");
              const impactDisplay = evt.impact || (evt.time ? `Starts at ${evt.time}` : "Active Municipal Advisory");

              return (
                <div
                  key={evtKey}
                  data-testid={`event-card-${evtKey}`}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${getAuthorityBadge(
                          auth
                        )}`}
                      >
                        {auth} JURISDICTION
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${getStatusBadge(
                          evt.status || "SCHEDULED"
                        )}`}
                      >
                        {evt.status || "SCHEDULED"}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#12304A] mt-2 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="mt-2 text-xs md:text-sm text-[#64748B] leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#F1F5F9] space-y-2 text-xs text-[#64748B]">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#F97316] shrink-0" />
                      <span className="text-[#0F172A] font-medium line-clamp-1">{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-[#0F766E] shrink-0" />
                      <span className="font-mono text-[11px]">
                        {dateDisplay}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-[#D97706] shrink-0" />
                      <span className="text-amber-700 font-medium text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                        {impactDisplay}
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
