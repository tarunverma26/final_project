import React from "react";
import { FONT_MONO, C } from "@/theme";

export default function Eyebrow({ text, children, className = "" }) {
  const content = text || children;
  const label = typeof content === "string" ? content.toUpperCase() : content;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest ${FONT_MONO} mb-3 ${className}`}
      style={{
        backgroundColor: "rgba(229, 149, 24, 0.06)",
        border: "1px solid rgba(229, 149, 24, 0.18)",
        color: C.amberMuted || "#B58A46",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#E59518] animate-pulse" />
      <span>{label}</span>
    </div>
  );
}
