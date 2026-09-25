import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WarningOctagon, Scan, ShieldWarning, Sparkle, Gauge } from "@phosphor-icons/react";

/**
 * Pothole Component
 * 
 * Interactive foreground hazard element:
 * - Damaged asphalt cavity with dark bitumen crater and gravel texture
 * - Reflective rainwater puddle with interactive cursor ripples
 * - Animated optical scanning line and telemetry brackets on hover
 * - High-tech civic inspection reveal HUD:
 *   - "Pothole detected"
 *   - "Severity: High"
 *   - Depth, volume, and road hazard audit telemetry
 */
export default function Pothole({
  size = 230,
  label = "Pothole detected",
  severity = "High",
  depth = "8.4 cm",
  volume = "0.12 m³",
}) {
  const [hovered, setHovered] = useState(false);
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (Math.random() > 0.65) {
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-4), { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 1000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center cursor-crosshair select-none group"
      style={{ width: size, height: size * 0.68 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setRipples([]);
      }}
      onMouseMove={handleMouseMove}
      data-testid="hero-interactive-pothole"
    >
      {/* 1. Broken Asphalt Rim / Surrounding Fractures */}
      <div
        className="absolute inset-0 rounded-[48%_52%_45%_55%/40%_48%_52%_60%] transition-transform duration-300 group-hover:scale-[1.03]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #080D15 0%, #151D2A 72%, #2A3649 100%)",
          boxShadow:
            "inset 0 6px 14px rgba(0, 0, 0, 0.9), 0 4px 18px rgba(0, 0, 0, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Asphalt cracks branching around cavity */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
          <path d="M12 40 Q25 48 32 44 T50 49" stroke="#000" strokeWidth="1.5" fill="none" />
          <path d="M85 35 Q70 45 62 48 T48 55" stroke="#000" strokeWidth="1.2" fill="none" />
          <path d="M45 88 Q48 75 52 68" stroke="#000" strokeWidth="1.5" fill="none" />
        </svg>
      </div>

      {/* 2. Rainwater Puddle with Mirror Sky Reflection */}
      <div
        className="absolute inset-3 rounded-[46%_54%_48%_52%/44%_50%_50%_56%] overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(30, 58, 88, 0.85) 0%, rgba(12, 22, 34, 0.92) 55%, rgba(6, 12, 20, 0.98) 100%)",
        }}
      >
        {/* Sky / sunlight shimmer reflection */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 35% 30%, rgba(254, 215, 170, 0.5) 0%, rgba(255, 255, 255, 0.2) 25%, transparent 65%)",
          }}
        />

        {/* Dynamic Water Ripples */}
        {ripples.map((r) => (
          <span
            key={r.id}
            className="absolute rounded-full border border-white/50 pointer-events-none animate-ping"
            style={{
              left: r.x - 14,
              top: r.y - 14,
              width: 28,
              height: 28,
              animationDuration: "1s",
            }}
          />
        ))}

        {/* Ambient continuous puddle ripple */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="w-16 h-8 rounded-full border border-teal-200/20 animate-pulse" />
        </div>
      </div>

      {/* 3. AI Optical Scanner Brackets (Active on Hover) */}
      <AnimatePresence>
        {hovered && (
          <>
            {/* Corner Targeting Brackets */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="absolute -inset-2 border-2 border-dashed border-[#F97316]/60 rounded-2xl pointer-events-none"
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-[#F97316]" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-[#F97316]" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-[#F97316]" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-[#F97316]" />
            </motion.div>

            {/* Vertical Optical Laser Scan Beam */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "100%" }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
              className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-[#F97316] to-transparent shadow-[0_0_8px_#F97316] pointer-events-none z-10"
            />
          </>
        )}
      </AnimatePresence>

      {/* 4. Revealing Civic Inspection Telemetry Card */}
      <AnimatePresence>
        {hovered ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: -size * 0.44, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-30 whitespace-nowrap rounded-xl bg-[#0B1524]/95 border border-[#F97316]/50 shadow-2xl p-3.5 backdrop-blur-md text-left"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{label.toUpperCase()}</span>
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                SEVERITY: {severity.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono text-slate-300">
              <div>
                <span className="text-slate-400">Est. Depth:</span>{" "}
                <span className="font-bold text-white">{depth}</span>
              </div>
              <div>
                <span className="text-slate-400">Volumetric:</span>{" "}
                <span className="font-bold text-white">{volume}</span>
              </div>
              <div>
                <span className="text-slate-400">SLA Priority:</span>{" "}
                <span className="font-bold text-amber-400">48-Hr Emergency</span>
              </div>
              <div>
                <span className="text-slate-400">Confidence:</span>{" "}
                <span className="font-bold text-emerald-400">96.4% Verified</span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-mono text-slate-300 bg-slate-900/80 px-2.5 py-0.5 rounded-full border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
            <span>Hover to scan hazard</span>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
