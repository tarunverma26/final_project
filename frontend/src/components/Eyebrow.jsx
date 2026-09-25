import React from "react";
import { FONT_MONO, C } from "@/theme";

export default function Eyebrow({ text, children, className = "" }) {
  const content = text || children;
  const label = typeof content === "string" ? content.toUpperCase() : content;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] tracking-widest ${FONT_MONO} mb-3 ${className}`}
      style={{
        backgroundColor: "rgba(245, 158, 11, 0.08)",
        border: "1px solid rgba(245, 158, 11, 0.25)",
        color: C.amber,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      <span>{label}</span>
    </div>
  );
}
