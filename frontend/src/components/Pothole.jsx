import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pothole({ size = 220, label = "Pothole Detected — Severity: High" }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size * 0.7 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid="hero-pothole"
    >
      <div className="pothole absolute inset-0 shadow-md">
        {hover && (
          <>
            <span className="ripple" />
            <span className="ripple" />
            <span className="ripple" />
          </>
        )}
      </div>
      <AnimatePresence>
        {hover && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-md text-xs font-mono font-medium text-[#12304A]"
          >
            <span className="text-[#F97316]">●</span>{" "}
            <span>{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
