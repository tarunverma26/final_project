import React, { useEffect, useState } from "react";
import { C, FONT_DISPLAY, FONT_MONO } from "@/theme";
import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import DarkMap from "./DarkMap";
import { api } from "@/lib/api";
import { MARKERS } from "@/constants/markers";
import { MapTrifold, Compass, ShieldWarning, CheckCircle, ArrowsClockwise } from "@phosphor-icons/react";

export { MARKERS };

export default function MapSection() {
  const [mapMarkers, setMapMarkers] = useState(MARKERS);
  const [loading, setLoading] = useState(false);

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
    <section id="map" className="relative py-24 asphalt-bg overflow-hidden" data-testid="map-section">
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <Eyebrow text="/ LIVE INFRASTRUCTURE MAP" />
              <h2 className={`${FONT_DISPLAY} text-4xl md:text-5xl text-white mt-1 leading-[1.08]`}>
                Real-time civic <span className="text-amber-400">hazard telemetry.</span>
              </h2>
              <p className="mt-3 text-base md:text-lg text-zinc-400 leading-relaxed">
                Explore every reported pothole, drainage obstruction, and lighting outage across the network.
                Updated live as citizen reports and contractor resolutions stream in.
              </p>
            </div>

            {/* Quick Stats Pill Strip */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
              <div className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                {criticalCount} Critical Hazards
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                {inProgressCount} Under Repair
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {resolvedCount} Resolved
              </div>
            </div>
          </div>
        </Reveal>

        {/* DarkMap Interactive Canvas */}
        <Reveal delay={150} className="mt-8">
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl relative">
            <DarkMap markers={mapMarkers} height={460} center={[28.465, 77.06]} zoom={13} />
          </div>
        </Reveal>

        {/* Section bottom dashed amber lane divider as required */}
        <div className="rw-lane mt-20" />
      </div>
    </section>
  );
}
