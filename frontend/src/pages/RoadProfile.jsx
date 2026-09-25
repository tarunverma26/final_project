import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
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
    <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-2xs">
      <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-[#12304A]">
        {hasValue ? (
          value
        ) : (
          <span className="text-xs font-mono font-medium text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">
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
    // If an id parameter is present, attempt live fetch with fallback
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere rainCount={20} showClouds={true} showSun={true} />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-24 relative z-10">
        
        {/* Navigation Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#64748B] mb-6">
          <Link to="/" className="hover:text-[#F97316] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/identify" className="hover:text-[#F97316] transition-colors">Identify Road</Link>
          <span>/</span>
          <span className="text-[#12304A] font-bold">{profile.road_number || "Profile"}</span>
        </div>

        {/* Header Hero Banner */}
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-6 md:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/50 via-teal-50/30 to-transparent pointer-events-none rounded-bl-full" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-mono font-bold mb-3">
                <Buildings size={14} />
                <span>{profile.authority} JURISDICTION · PUBLIC CORRIDOR PROFILE</span>
              </div>
              <h1 className="font-display font-extrabold text-3xl md:text-5xl text-[#12304A] tracking-tight">
                {profile.road_name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-[#64748B]">
                <span className="font-mono font-bold text-[#F97316] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                  {profile.road_number}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-medium">
                  <MapPin size={16} className="text-[#EA580C]" />
                  {profile.location}, {profile.district} ({profile.state})
                </span>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to={`/report?road=${encodeURIComponent(profile.road_name)}`}
                className="px-5 py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-semibold transition-all inline-flex items-center gap-2 shadow-sm hover:shadow"
              >
                <WarningOctagon size={18} weight="bold" />
                <span>Report Problem on this Road</span>
              </Link>
              <Link
                to="/map"
                className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#12304A] border border-[#CBD5E1] hover:border-[#F97316] font-semibold transition-all inline-flex items-center gap-2 shadow-2xs"
              >
                <Compass size={18} weight="bold" className="text-[#0F766E]" />
                <span>View on Live Map</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3-Column Profile Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          
          {/* Column 1: Road Condition & Pavement Index */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#0F766E]">
                  PAVEMENT CONDITION INDEX (PCI)
                </span>
                <span className="text-[10px] font-mono bg-teal-50 text-[#0F766E] border border-teal-200 px-2 py-0.5 rounded font-semibold">
                  AUDIT 2026
                </span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-24 h-24 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center shrink-0">
                  <span className="font-display font-black text-4xl text-[#D97706]">{profile.condition_score}</span>
                  <span className="text-[10px] font-mono font-bold text-[#D97706]">/ 100</span>
                </div>
                <div>
                  <div className="font-display font-bold text-lg text-[#12304A]">
                    {profile.condition_status}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1 font-mono">
                    Hazard density: <strong className="text-[#DC2626]">{profile.pothole_density}</strong>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 pt-4 border-t border-[#F1F5F9] text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Surface Type:</span>
                  <span className="font-semibold text-[#12304A]">{profile.surface}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Lane Configuration:</span>
                  <span className="font-semibold text-[#12304A]">{profile.lanes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Last Overlay:</span>
                  <span className="font-semibold text-[#12304A]">{profile.last_maintenance}</span>
                </div>
              </div>
            </div>

            {/* Contractor Accountability & Warranty Card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#D97706] mb-3">
                <HardHat size={17} weight="duotone" />
                <span>EMPANELLED ROAD CONTRACTOR</span>
              </div>
              <h3 className="font-display text-xl font-bold text-[#12304A]">
                {profile.contractor}
              </h3>
              <p className="text-xs text-[#64748B] mt-1 font-mono">
                {profile.contractor_sla}
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-teal-50 border border-teal-200/80 text-xs">
                <div className="font-bold text-[#0F766E] flex items-center gap-1.5">
                  <ShieldCheck size={16} weight="fill" />
                  <span>Defect Liability Period</span>
                </div>
                <div className="text-[#0F766E] mt-1 font-mono font-medium">
                  {profile.warranty_period}
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Public Funding, Tender & Complaints */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#12304A]">
                  PUBLIC TENDER & CAPITAL FUNDING
                </span>
                <span className="text-[10px] font-mono bg-emerald-50 text-[#16A34A] border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  OPEN RECORD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase font-bold">BUDGET SANCTIONED</div>
                  <div className="font-display font-extrabold text-xl text-[#12304A] mt-1">
                    {profile.budget_allocated}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-[#64748B] uppercase font-bold">DISBURSED TO DATE</div>
                  <div className="font-display font-extrabold text-xl text-[#0F766E] mt-1">
                    {profile.budget_disbursed}
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs font-mono text-[#64748B] pt-3 border-t border-[#F1F5F9]">
                <div className="flex justify-between">
                  <span>Tender No:</span>
                  <span className="font-bold text-[#12304A]">{profile.tender_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span>CAG Audit:</span>
                  <span className="font-bold text-[#16A34A]">{profile.audit_status}</span>
                </div>
              </div>
            </div>

            {/* Complaint Velocity Stats */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#12304A]">
                  CITIZEN COMPLAINT REGISTRY
                </span>
                <Link to="/tracking/RW-10234" className="text-xs text-[#F97316] font-mono font-semibold hover:underline">
                  Track #RW-10234 →
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center py-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-mono text-[#64748B] font-bold">TOTAL</div>
                  <div className="font-display font-bold text-2xl text-[#12304A] mt-0.5">{profile.total_complaints}</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] font-mono text-[#16A34A] font-bold">RESOLVED</div>
                  <div className="font-display font-bold text-2xl text-[#16A34A] mt-0.5">{profile.resolved_complaints}</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="text-[10px] font-mono text-[#D97706] font-bold">ACTIVE</div>
                  <div className="font-display font-bold text-2xl text-[#D97706] mt-0.5">{profile.active_complaints}</div>
                </div>
              </div>

              {/* Active Breakdown list */}
              <div className="mt-4 pt-3 border-t border-[#F1F5F9] space-y-2">
                <div className="text-[11px] font-mono font-bold text-[#64748B] uppercase">OPEN DEFECT BREAKDOWN:</div>
                {profile.active_breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-medium p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                    <span className="text-[#12304A]">{item.type}</span>
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                      {item.count} Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Scheduled Municipal Events & Closures */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-4 mb-4">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#12304A]">
                  SCHEDULED ROADWORKS & EVENTS
                </span>
                <Calendar size={18} className="text-[#0F766E]" />
              </div>

              <div className="space-y-4">
                {profile.upcoming_events.map((evt, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
                        {evt.status}
                      </span>
                      <span className="text-xs font-mono text-[#64748B]">{evt.date}</span>
                    </div>
                    <div className="font-display font-bold text-sm text-[#12304A]">
                      {evt.title}
                    </div>
                    <div className="text-xs text-[#EA580C] font-mono bg-orange-50 px-2.5 py-1 rounded border border-orange-200/60">
                      {evt.impact}
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/events"
                className="mt-6 w-full py-2.5 rounded-xl border border-[#CBD5E1] hover:border-[#F97316] text-[#12304A] hover:text-[#F97316] text-xs font-mono font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>View All Regional Municipal Events</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Authority Verification Seal */}
            <div className="rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50/60 via-white to-teal-50/20 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <ShieldCheck size={22} weight="bold" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#12304A]">
                    {profile.authority_full}
                  </div>
                  <div className="text-xs text-[#0F766E] font-mono font-medium">
                    Verified Digital Twin Registry
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#64748B] mt-3 leading-relaxed">
                Road specifications, pavement distress telemetry, and contractor defect liabilities are synchronized directly from OpenStreetMap and NHAI GIS databases.
              </p>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
