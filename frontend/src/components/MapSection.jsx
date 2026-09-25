import React, { useEffect, useState } from "react";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import DarkMap from "./DarkMap";
import { api } from "@/lib/api";
import { MARKERS } from "@/constants/markers";
import { MapTrifold, Compass, ShieldWarning, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";

export { MARKERS };

export default function MapSection() {
  const [mapMarkers, setMapMarkers] = useState(MARKERS);

  useEffect(() => {
    // Attempt live fetch with fallback to default demo MARKERS
    api
      .get("/reports/public")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const liveWithCoords = res.data.filter((r) => r.latitude && r.longitude);
          if (liveWithCoords.length > 0) {
            setMapMarkers(liveWithCoords);
          }
        }
      })
      .catch(() => {
        // Retain default demo MARKERS
      });
  }, []);

  const criticalCount = mapMarkers.filter((m) => m.severity === "CRITICAL" || m.severity === "HIGH").length;
  const inProgressCount = mapMarkers.filter((m) => m.status && m.status !== "RESOLVED" && m.status !== "SUBMITTED").length;
  const resolvedCount = mapMarkers.filter((m) => m.status === "RESOLVED").length;

  return (
    <section id="map" className="relative py-24 bg-[#F8FAFC] overflow-hidden" data-testid="map-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ LIVE INFRASTRUCTURE MAP" />
              <h2 className="font-display font-extrabold text-4xl md:text-5xl text-[#12304A] mt-1 leading-[1.08]">
                Real-time civic <span className="text-[#F97316]">hazard telemetry.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-[#64748B] leading-relaxed">
                Explore every reported pothole, drainage obstruction, and lighting outage across the network.
                Updated live as citizen reports and contractor resolutions stream in.
              </p>
            </div>

            {/* Quick Stats Pill Strip */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <div className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-[#DC2626] font-semibold flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
                <span>{criticalCount} Critical Hazards</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-[#D97706] font-semibold flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span>{inProgressCount} Under Repair</span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] font-semibold flex items-center gap-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                <span>{resolvedCount} Resolved</span>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Live Interactive Map Box */}
        <Reveal delay={150} className="mt-10">
          <div className="rounded-2xl bg-white p-3 border border-[#E2E8F0] shadow-sm">
            <DarkMap markers={mapMarkers} height={460} />
          </div>
        </Reveal>

        {/* Section bottom dashed lane divider */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
