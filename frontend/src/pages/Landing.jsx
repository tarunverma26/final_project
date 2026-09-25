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
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { ArrowRight, MapTrifold, Sparkle } from "@phosphor-icons/react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative">
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
        <section className="relative py-24 bg-white overflow-hidden border-t border-[#E2E8F0]">
          <WeatherAtmosphere rainCount={25} showClouds={true} showSun={true} />
          
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-[#0F766E] bg-teal-50 border border-teal-200 font-semibold mb-4">
              <Sparkle size={14} weight="fill" />
              SMART INDIA HACKATHON · NATIONAL CIVIC DEPLOYMENT
            </div>

            <h2 className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-[#12304A] tracking-tight leading-tight">
              The road remembers.
              <br />
              <span className="text-[#F97316]">Make sure the city does too.</span>
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#64748B] max-w-xl mx-auto leading-relaxed">
              Join thousands of citizens documenting civic infrastructure in the open.
              Audit repairs, track municipal budgets, and navigate safer roads.
            </p>

            <div className="mt-9 flex flex-wrap justify-center items-center gap-3.5">
              <Link
                to="/login"
                data-testid="cta-login-btn"
                className="px-8 py-3.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] transition-all duration-150 shadow-sm hover:shadow hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer text-sm"
              >
                <span>Get Started Now</span>
                <ArrowRight size={16} weight="bold" />
              </Link>
              <Link
                to="/map"
                data-testid="cta-map-btn"
                className="px-8 py-3.5 rounded-xl bg-white border border-[#CBD5E1] hover:border-[#F97316] hover:bg-slate-50 text-[#12304A] font-semibold transition-all duration-150 shadow-2xs hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer text-sm"
              >
                <MapTrifold size={18} weight="duotone" className="text-[#0F766E]" />
                <span>Explore Live Map</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Clean Light Civic Footer */}
      <footer className="py-10 text-center text-xs text-[#64748B] border-t border-[#E2E8F0] bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-extrabold text-base tracking-tight text-[#12304A]">
            ROAD<span className="text-[#F97316]">WATCH</span> · CIVIC BHARAT
          </div>
          <div>
            © {new Date().getFullYear()} ROADWATCH — Built for cities that repair themselves.
          </div>
          <div className="font-mono text-xs font-semibold text-[#16A34A] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            <span>TRANSPARENT CIVIC INFRASTRUCTURE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
