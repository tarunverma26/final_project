import React from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ReportSection from "@/components/ReportSection";
import TimelineSection from "@/components/TimelineSection";
import MapSection from "@/components/MapSection";
import RouteHealthSection from "@/components/RouteHealthSection";
import StressIndexSection from "@/components/StressIndexSection";
import SmsReportingSection from "@/components/SmsReportingSection";
import EventsSection from "@/components/EventsSection";
import ContractorsSection from "@/components/ContractorsSection";
import DashboardSection from "@/components/DashboardSection";
import GlobalStyle from "@/GlobalStyle";

/**
 * RoadWatch Landing Page Assembly
 * Sections ordered strictly as specified:
 * Hero -> ReportSection -> TimelineSection -> MapSection ->
 * RouteHealthSection -> StressIndexSection -> SmsReportingSection ->
 * EventsSection -> ContractorsSection -> DashboardSection
 */
export default function App() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white relative">
      <GlobalStyle />
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Report Section */}
        <ReportSection />

        {/* Timeline & AI Verification */}
        <TimelineSection />

        {/* Live Infrastructure Map */}
        <MapSection />

        {/* FEATURE 1: Condition-Aware Route Health */}
        <RouteHealthSection />

        {/* FEATURE 2: Compound Resource Stress Index */}
        <StressIndexSection />

        {/* FEATURE 3: SMS / WhatsApp Accessibility Hotline */}
        <SmsReportingSection />

        {/* Municipal Events & Roadworks */}
        <EventsSection />

        {/* Contractor Accountability & Audits */}
        <ContractorsSection />

        {/* Public Intelligence Dashboard */}
        <DashboardSection />
      </main>

      <footer className="py-12 text-center text-xs text-zinc-500 border-t border-white/5 bg-[#070709]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-black text-sm text-white">
            ROAD<span className="text-amber-400">WATCH</span> · CIVIC BHARAT
          </div>
          <div className="text-zinc-500">
            © {new Date().getFullYear()} Open Public Infrastructure & Civic Accountability Network.
          </div>
          <div className="font-mono text-[11px] text-amber-400/80">
            STATUS: ALL MONITORS OPERATIONAL
          </div>
        </div>
      </footer>
    </div>
  );
}
