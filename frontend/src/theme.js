/**
 * RoadWatch Design System Tokens
 * Shared design tokens for dark asphalt / high-visibility amber civic palette.
 */

export const C = {
  // Base Surfaces
  bg: "#0A0A0A",
  bgSubtle: "#111111",
  bgCard: "#141416",
  bgCardHover: "#1C1C1F",
  bgGlass: "rgba(14, 14, 16, 0.75)",
  
  // Borders
  border: "rgba(255, 255, 255, 0.08)",
  borderSubtle: "rgba(255, 255, 255, 0.04)",
  borderStrong: "rgba(255, 255, 255, 0.16)",

  // Typography
  text: "#F4F4F5",
  textMuted: "#A1A1AA",
  textDim: "#71717A",
  textInverse: "#0A0A0A",

  // Core Brand Colors (Amber / Highway Glow)
  amber: "#F59E0B",
  amberLight: "#FBBF24",
  amberDark: "#D97706",
  amberGlow: "rgba(245, 158, 11, 0.15)",
  amberBorder: "rgba(245, 158, 11, 0.35)",

  // Semantic Status Tokens
  green: "#10B981",
  greenLight: "#34D399",
  greenGlow: "rgba(16, 185, 129, 0.15)",
  greenBorder: "rgba(16, 185, 129, 0.35)",

  red: "#EF4444",
  redLight: "#F87171",
  redGlow: "rgba(239, 68, 68, 0.15)",
  redBorder: "rgba(239, 68, 68, 0.35)",

  blue: "#3B82F6",
  blueGlow: "rgba(59, 130, 246, 0.15)",

  // Asphalt Textures
  asphalt: "#0F0F12",
  asphaltLight: "#18181B",
  asphaltDark: "#060607",
};

// Font Typography Helpers
export const FONT_DISPLAY = "font-display font-black tracking-tight";
export const FONT_BODY = "font-sans";
export const FONT_MONO = "font-mono";

// Noise & Ambient Lighting Background
export const NOISE_BG =
  "radial-gradient(ellipse at 50% 0%, rgba(245, 158, 11, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(239, 68, 68, 0.03) 0%, transparent 50%), linear-gradient(180deg, #0A0A0A 0%, #111114 100%)";
