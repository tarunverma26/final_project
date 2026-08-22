import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import Pothole from "@/components/Pothole";
import Counter from "@/components/Counter";
import Timeline from "@/components/Timeline";
import AiAssessmentCard from "@/components/AiAssessmentCard";
import { api } from "@/lib/api";
import { Radioactive as Radar, MapPinLine, WarningOctagon, Cpu, Clock, MapTrifold, ChartBar, ArrowRight } from "@phosphor-icons/react";

const HERO_BG =
  "https://images.unsplash.com/photo-1566276423184-a8c13d2a88a1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAxODF8MHwxfHNlYXJjaHwyfHxkYXJrJTIwYXNwaGFsdCUyMHJvYWQlMjBuaWdodHxlbnwwfHx8fDE3ODczOTc4ODJ8MA&ixlib=rb-4.1.0&q=85";
const POTHOLE_IMG =
  "https://images.unsplash.com/photo-1784548789954-655c9a9e1a64?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxwb3Rob2xlJTIwcm9hZCUyMGNsb3NlJTIwdXB8ZW58MHx8fHwxNzg3Mzk3ODgyfDA&ixlib=rb-4.1.0&q=85";

const SCROLL_SECTIONS = [
  { icon: Radar, title: "Identify Road", desc: "Get precise road info via GPS." },
  { icon: MapPinLine, title: "Road Information", desc: "Authority, contractor, funding." },
  { icon: WarningOctagon, title: "Report Problem", desc: "Photo, category & location." },
  { icon: Cpu, title: "AI Analysis", desc: "Severity, safety risk, priority." },
  { icon: Clock, title: "Complaint Tracking", desc: "9-step live status timeline." },
  { icon: MapTrifold, title: "Interactive Map", desc: "See every reported issue nearby." },
  { icon: ChartBar, title: "Dashboard", desc: "Citizen, authority & admin views." },
];

const DEMO_TIMELINE = [
  { step: "SUBMITTED", status: "completed", timestamp: new Date().toISOString() },
  { step: "UNDER_REVIEW", status: "completed", timestamp: new Date().toISOString() },
  { step: "FORWARDED", status: "completed", timestamp: new Date().toISOString() },
  { step: "ASSIGNED", status: "pending" },
  { step: "WORK_PLANNED", status: "pending" },
  { step: "WORK_IN_PROGRESS", status: "pending" },
  { step: "RESOLUTION", status: "pending" },
  { step: "VERIFIED", status: "pending" },
  { step: "RESOLVED", status: "pending" },
];

const DEMO_AI = {
  category: "Pothole",
  severity: "HIGH",
  safety_risk: "HIGH",
  confidence: 94,
  priority: "CRITICAL",
  recommendation: "Immediate patching required within 48 hours.",
  model: "claude-sonnet-5",
};

export default function Landing() {
  const [stats, setStats] = useState({ total_problems: 2481, resolved_or_progress_pct: 73 });
  const ref = useRef(null);
  const { scrollYProgress } = useScroll();
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.1, 1.5]);
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  useEffect(() => {
    api.get("/stats/overview").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div ref={ref} className="relative">
      <Navbar />

      {/* ---------- HERO ---------- */}
      <section className="relative min-h-screen overflow-hidden asphalt-bg" data-testid="hero-section">
        <motion.div
          style={{ scale: bgScale, y: bgY }}
          className="absolute inset-0 bg-cover bg-center opacity-60"
        >
          <img src={HERO_BG} alt="dark asphalt road" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-[#0A0A0A]" />
        <RainLayer count={70} />
        <div className="headlight" />
        <div className="road-lane" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-widest text-amber-300 font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              LIVE · CIVIC INFRASTRUCTURE MONITOR
            </div>
            <h1 className="font-display font-black text-5xl md:text-7xl leading-[1.02] tracking-tight" data-testid="hero-headline">
              THE ROAD TELLS A STORY.
              <br />
              <span className="text-amber-400">WE MAKE IT VISIBLE.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-zinc-300 max-w-xl">
              Identify roads. Report problems. Track repairs — end to end, in the open.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/identify"
                data-testid="hero-identify-btn"
                className="px-6 py-3 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400 transition-colors inline-flex items-center gap-2"
              >
                <Radar size={18} weight="bold" /> Identify My Road
              </Link>
              <Link
                to="/report"
                data-testid="hero-report-btn"
                className="px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 text-white font-medium transition-colors inline-flex items-center gap-2"
              >
                <WarningOctagon size={18} weight="bold" /> Report a Pothole
              </Link>
            </div>
          </motion.div>

          {/* Floating stats + pothole */}
          <div className="mt-16 grid md:grid-cols-3 gap-6 items-end">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-5"
              data-testid="stat-total"
            >
              <div className="text-[11px] tracking-widest text-zinc-500 font-mono">ROAD PROBLEMS</div>
              <div className="font-display font-black text-4xl mt-1 text-white">
                <Counter end={stats.total_problems} />
              </div>
              <div className="text-xs text-zinc-500 mt-1">Reported across the network</div>
            </motion.div>

            <div className="flex justify-center">
              <Pothole size={240} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass rounded-2xl p-5"
              data-testid="stat-progress"
            >
              <div className="text-[11px] tracking-widest text-zinc-500 font-mono">RESOLVED / IN PROGRESS</div>
              <div className="font-display font-black text-4xl mt-1 text-amber-400">
                <Counter end={stats.resolved_or_progress_pct} suffix="%" />
              </div>
              <div className="text-xs text-zinc-500 mt-1">Active civic response</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- SCROLL SECTIONS PREVIEW ---------- */}
      <section className="relative py-24 asphalt-bg" data-testid="scroll-sections">
        <div className="road-lane opacity-20" />
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ HOW IT WORKS</p>
          <h2 className="font-display font-black text-4xl md:text-5xl mt-2 max-w-2xl">
            Everything a road needs, in one continuous journey.
          </h2>
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SCROLL_SECTIONS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-white/5 bg-[#111] p-6 hover:border-amber-500/40 hover:-translate-y-1 transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                  <Icon size={22} className="text-amber-400" weight="duotone" />
                </div>
                <div className="mt-4 font-display font-bold text-xl">{title}</div>
                <div className="text-sm text-zinc-400 mt-1">{desc}</div>
                <div className="mt-4 flex items-center gap-1 text-xs text-amber-400 font-mono">
                  STEP 0{i + 1} <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- LIVE PREVIEW: AI + TIMELINE ---------- */}
      <section className="relative py-24 bg-[#080808] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10">
          <div>
            <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ AI ASSESSMENT</p>
            <h2 className="font-display font-black text-4xl md:text-5xl mt-2">Every photo tells us something.</h2>
            <p className="text-zinc-400 mt-4 max-w-md">
              Claude Sonnet 5 vision scores severity, safety risk & priority — so the right people move first.
            </p>
            <AiAssessmentCard data={DEMO_AI} thumbnail={POTHOLE_IMG} />
          </div>
          <div>
            <p className="text-[11px] tracking-widest text-amber-400 font-mono">/ COMPLAINT TRACKING</p>
            <h2 className="font-display font-black text-4xl md:text-5xl mt-2">9 steps. Always in the open.</h2>
            <p className="text-zinc-400 mt-4 mb-8 max-w-md">
              From submission to verified resolution — you see every hand your report passes through.
            </p>
            <div className="rounded-2xl bg-[#111] border border-white/5 p-6">
              <Timeline steps={DEMO_TIMELINE} />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative py-24 asphalt-bg overflow-hidden border-t border-white/5">
        <RainLayer count={30} />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="font-display font-black text-4xl md:text-6xl">
            The road remembers.
            <br />
            <span className="text-amber-400">Make sure the city does too.</span>
          </h2>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              to="/login"
              data-testid="cta-login-btn"
              className="px-8 py-3 rounded-full bg-amber-500 text-black font-medium hover:bg-amber-400"
            >
              Get Started
            </Link>
            <Link
              to="/map"
              data-testid="cta-map-btn"
              className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/5"
            >
              Explore the Map
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center text-xs text-zinc-600 border-t border-white/5">
        © {new Date().getFullYear()} ROADWATCH · Built for cities that repair themselves.
      </footer>
    </div>
  );
}
