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
import { Link } from "react-router-dom";
import RainLayer from "@/components/RainLayer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#F2EFE9] relative">
      <GlobalStyle />
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* Citizen Reporting Flow */}
        <ReportSection />

        {/* 9-Stage Verification & AI Audit */}
        <TimelineSection />

        {/* Live Infrastructure Map */}
        <MapSection />

        {/* NEW FEATURE 1: Condition-Aware Route Health */}
        <RouteHealthSection />

        {/* NEW FEATURE 2: Compound Resource Stress Index */}
        <StressIndexSection />

        {/* NEW FEATURE 3: SMS / WhatsApp Accessibility Hotline */}
        <SmsReportingSection />

        {/* Municipal Events & Roadworks */}
        <EventsSection />

        {/* Contractor Accountability & Audits */}
        <ContractorsSection />

        {/* Public Intelligence Dashboard */}
        <DashboardSection />

        {/* Final Call to Action */}
        <section className="relative py-24 asphalt-bg overflow-hidden border-t border-white/5">
          <RainLayer count={25} />
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="font-display font-black text-4xl md:text-6xl text-white">
              The road remembers.
              <br />
              <span className="text-amber-400">Make sure the city does too.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-zinc-300 max-w-xl mx-auto">
              Join thousands of citizens documenting civic infrastructure in the open.
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Link
                to="/login"
                data-testid="cta-login-btn"
                className="px-8 py-3 rounded-full bg-amber-500 text-black font-semibold hover:bg-amber-400 transition shadow-lg shadow-amber-500/25"
              >
                Get Started
              </Link>
              <Link
                to="/map"
                data-testid="cta-map-btn"
                className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 text-white font-medium transition"
              >
                Explore the Map
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-xs text-zinc-500 border-t border-white/5 bg-[#070709]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-black text-sm text-white">
            ROAD<span className="text-amber-400">WATCH</span> · CIVIC BHARAT
          </div>
          <div>
            © {new Date().getFullYear()} ROADWATCH — Built for cities that repair themselves.
          </div>
          <div className="font-mono text-[11px] text-amber-400/80">
            TRANSPARENT CIVIC INFRASTRUCTURE
          </div>
        </div>
      </footer>
    </div>
  );
}
