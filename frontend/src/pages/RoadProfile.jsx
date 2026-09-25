import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import DarkMap from "@/components/DarkMap";
import { api } from "@/lib/api";
import {
  Compass, MapPin, HardHat, Calendar, CurrencyInr,
  ShieldCheck, Warning, WarningOctagon, CheckCircle,
  Clock, ArrowRight, Buildings, Wrench, ChartLineUp,
  FileText, ShareNetwork
} from "@phosphor-icons/react";

const DEMO_ROAD_PROFILE = {
  road_name: "NH-48 National Express Corridor",
  road_number: "NH-48",
  road_type: "National Highway (Primary Arterial Corridor)",
  location: "Sector 14 Rajiv Chowk to Kherki Daula (Km 28.4 – Km 42.1)",
  district: "Gurugram",
  state: "Haryana",
  country: "India",
  authority: "NHAI",
  authority_full: "National Highways Authority of India",
  condition_score: 68,
  condition_status: "Fair — Surface Degradation Alert",
  pothole_density: "1.4 defects / km",
  lanes: "6-Lane Divided Carriageway + 2-Lane Service Roads",
  surface: "Stone Matrix Asphalt (SMA)",
  last_construction_year: 2023,
  last_maintenance: "October 2023 (Bituminous Overlay)",
  contractor: "L&T Infrastructure Projects Ltd",
  contractor_sla: "94% SLA Compliance",
  warranty_period: "36 Months (Active until Nov 2026)",
  budget_allocated: "₹48.20 Crore",
  budget_disbursed: "₹35.66 Crore (74%)",
  tender_ref: "TENDER-NHAI-2024-ND-99",
  audit_status: "CAG Compliance Verified",
  total_complaints: 360,
  resolved_complaints: 342,
  active_complaints: 18,
  active_breakdown: [
    { type: "Pothole", count: 12, severity: "HIGH" },
    { type: "Streetlight Outage", count: 4, severity: "MEDIUM" },
    { type: "Culvert Drainage", count: 2, severity: "HIGH" },
  ],
  upcoming_events: [
    {
      title: "Nocturnal Bituminous Milling & Resurfacing",
      date: "Oct 02 – Oct 08, 2026",
      impact: "Night Lane Diversions (10 PM – 5 AM)",
      status: "SCHEDULED",
    },
    {
      title: "Stormwater Drain Culvert Desilting",
      date: "Oct 12 – Oct 16, 2026",
      impact: "Service Lane Traffic Diversion",
      status: "PLANNED",
    },
  ],
};

function InfoField({ label, value, fallback = "Data unavailable" }) {
  const hasValue = value !== null && value !== undefined && value !== "";
  return (
    <div className="rounded-xl bg-black/40 border border-white/5 p-4 shadow-sm">
      <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-white">
        {hasValue ? (
          value
        ) : (
          <span className="text-xs font-mono font-medium text-zinc-500 italic bg-white/5 px-2 py-0.5 rounded">
            {fallback}
          </span>
        )}
      </div>
    </div>
  );
}

export default function RoadProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(DEMO_ROAD_PROFILE);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id && id !== "NH-48") {
      setLoading(true);
      api
        .get(`/roads/${id}`)
        .then((res) => {
          if (res.data) setProfile({ ...DEMO_ROAD_PROFILE, ...res.data });
        })
        .catch(() => {
          // Keep rich demo profile
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="min-h-screen asphalt-bg text-zinc-100 relative selection:bg-amber-500 selection:text-black">
      <Navbar />
      <RainLayer count={25} />
      <div className="road-lane opacity-20" />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-6">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/identify" className="hover:text-amber-400 transition-colors">Identify Road</Link>
          <span>/</span>
          <span className="text-amber-400 font-bold">{profile.road_number || "Profile"}</span>
        </div>

        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-white/10 glass bg-[#111114]/90 p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-amber-500/5 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold mb-3">
                <Buildings size={14} />
                <span>{profile.authority} JURISDICTION · PUBLIC CORRIDOR PROFILE</span>
              </div>
              <h1 className="font-display font-black text-3xl md:text-5xl text-white tracking-tight">
                {profile.road_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-zinc-400">
                <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg">
                  {profile.road_number}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={16} className="text-amber-400" />
                  {profile.location}, {profile.district} ({profile.state})
                </span>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/report?road=${encodeURIComponent(profile.road_name)}`}
                className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold transition-all inline-flex items-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <WarningOctagon size={18} weight="bold" />
                <span>Report Problem on this Road</span>
              </Link>
              <Link
                to="/map"
                className="px-5 py-3 rounded-xl glass hover:bg-white/10 text-white border border-white/20 font-semibold transition-all inline-flex items-center gap-2"
              >
                <Compass size={18} weight="bold" className="text-amber-400" />
                <span>View on Live Map</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3-Column Profile Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          
          {/* Column 1: Road Condition & Pavement Index */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                  PAVEMENT CONDITION INDEX (PCI)
                </span>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
                  AUDIT 2026
                </span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center shrink-0">
                  <span className="font-display font-black text-3xl text-amber-400">
                    {profile.condition_score}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">out of 100</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white leading-tight">
                    {profile.condition_status}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">
                    Defect density: <span className="font-mono text-white">{profile.pothole_density}</span>
                  </div>
                </div>
              </div>

              {/* PCI Gauge Progress Bar */}
              <div className="mt-5">
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-1000"
                    style={{ width: `${profile.condition_score}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1.5">
                  <span>0 Critical</span>
                  <span>50 Moderate</span>
                  <span>100 Pristine</span>
                </div>
              </div>
            </div>

            {/* Road Specifications Card */}
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-6 shadow-xl">
              <div className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400 mb-4 pb-2 border-b border-white/5">
                TECHNICAL CORRIDOR SPECS
              </div>
              <div className="space-y-3">
                <InfoField label="Carriageway Configuration" value={profile.lanes} />
                <InfoField label="Surface Material" value={profile.surface} />
                <InfoField label="Last Overhaul Year" value={profile.last_construction_year} />
                <InfoField label="Recent Bituminous Overlay" value={profile.last_maintenance} />
              </div>
            </div>
          </div>

          {/* Column 2: Contractor & SLA Accountability */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                  CONTRACTOR ACCOUNTABILITY
                </span>
                <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-semibold">
                  ACTIVE SLA
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <HardHat size={20} weight="duotone" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-white">
                    {profile.contractor}
                  </h3>
                  <div className="text-xs text-zinc-400 mt-0.5">Primary Maintenance Concessionaire</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-5">
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">SLA COMPLIANCE</div>
                  <div className="font-display font-bold text-lg text-emerald-400 mt-0.5">
                    {profile.contractor_sla}
                  </div>
                </div>
                <div className="rounded-xl bg-black/40 border border-white/5 p-3">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">DEFECT LIABILITY</div>
                  <div className="font-display font-bold text-sm text-white mt-1">
                    {profile.warranty_period}
                  </div>
                </div>
              </div>

              {/* Public Funding & Tender Record */}
              <div className="mt-5 pt-4 border-t border-white/5 space-y-3">
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase">
                  PUBLIC TENDER ALLOCATION
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Allocated Maintenance Budget:</span>
                  <span className="font-mono font-bold text-white">{profile.budget_allocated}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Disbursed Expenditure:</span>
                  <span className="font-mono font-bold text-amber-400">{profile.budget_disbursed}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Tender Reference ID:</span>
                  <span className="font-mono text-zinc-300">{profile.tender_ref}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono mt-1">
                  <ShieldCheck size={14} weight="fill" />
                  <span>{profile.audit_status}</span>
                </div>
              </div>
            </div>

            {/* Upcoming Maintenance Events */}
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-6 shadow-xl">
              <div className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400 mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
                <span>SCHEDULED ROADWORKS</span>
                <span className="text-[10px] font-mono text-zinc-500">MUNICIPAL ADVISORY</span>
              </div>
              <div className="space-y-3">
                {profile.upcoming_events.map((evt, i) => (
                  <div key={i} className="p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-xs text-white line-clamp-1">{evt.title}</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {evt.status}
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-1 mt-1">
                      <Calendar size={13} className="text-amber-400" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      <span>{evt.impact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Live Complaints Telemetry & Map Context */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-amber-400">
                  CITIZEN COMPLAINT TELEMETRY
                </span>
                <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-semibold">
                  LIVE
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-500">TOTAL</div>
                  <div className="font-display font-bold text-xl text-white mt-0.5">
                    {profile.total_complaints}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-500">RESOLVED</div>
                  <div className="font-display font-bold text-xl text-emerald-400 mt-0.5">
                    {profile.resolved_complaints}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-500">ACTIVE</div>
                  <div className="font-display font-bold text-xl text-red-400 mt-0.5">
                    {profile.active_complaints}
                  </div>
                </div>
              </div>

              {/* Active Issues Breakdown */}
              <div className="mt-5 space-y-2">
                <div className="text-xs font-mono text-zinc-400 mb-2">ACTIVE CORRIDOR ISSUES:</div>
                {profile.active_breakdown.map((issue, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-xs">
                    <span className="text-zinc-200 font-medium">{issue.type}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400">{issue.count} open</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                        {issue.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/map"
                className="mt-5 w-full py-2.5 rounded-xl border border-white/10 glass hover:bg-white/10 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>Inspect All Pin Markers on Map</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Dark Map Mini Preview */}
            <div className="rounded-2xl border border-white/10 glass bg-[#111114]/90 p-3 shadow-xl overflow-hidden">
              <div className="h-56 rounded-xl overflow-hidden relative">
                <DarkMap center={[28.4595, 77.0266]} zoom={14} markers={[]} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
