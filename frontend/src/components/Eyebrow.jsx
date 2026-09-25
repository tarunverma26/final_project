import React from "react";
import { FONT_MONO } from "@/theme";

export default function Eyebrow({ text, children, className = "" }) {
  const content = text || children;
  const label = typeof content === "string" ? content.toUpperCase() : content;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider ${FONT_MONO} mb-3.5 bg-orange-50 border border-orange-200/80 text-[#EA580C] shadow-xs ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
      <span>{label}</span>
    </div>
  );
}
