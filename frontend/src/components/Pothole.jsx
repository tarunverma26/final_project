import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Pothole({ size = 220, label = "Pothole Detected — Severity: High" }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="relative"
      style={{ width: size, height: size * 0.7 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      data-testid="hero-pothole"
    >
      <div className="pothole absolute inset-0">
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
            className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-2 rounded-full glass text-xs tracking-wide"
          >
            <span className="text-amber-400">●</span>{" "}
            <span className="font-mono">{label}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
