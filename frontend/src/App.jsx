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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative">
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

      <footer className="py-10 text-center text-xs text-[#64748B] border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-extrabold text-base text-[#12304A]">
            ROAD<span className="text-[#F97316]">WATCH</span> · CIVIC BHARAT
          </div>
          <div>
            © {new Date().getFullYear()} Open Public Infrastructure & Civic Accountability Network.
          </div>
          <div className="font-mono text-xs font-semibold text-[#16A34A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>STATUS: ALL MONITORS OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
