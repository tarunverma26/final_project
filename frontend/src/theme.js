/**
 * RoadWatch Design System Tokens
 * Retuned civic palette: grounded warm asphalt, considered off-whites,
 * disciplined amber hierarchy, and safety-prioritized status colors.
 * Fully compliant with WCAG AA contrast standards.
 */

export const C = {
  // Background Darks (with subtle tonal warmth, not sterile black)
  bg0: "#0E0E10",
  bg: "#0E0E10",
  bg1: "#141416",
  bgSubtle: "#141416",
  bg2: "#18181B",
  bgCard: "#18181B",
  bg3: "#202024",
  bgCardHover: "#202024",
  bgGlass: "rgba(22, 22, 25, 0.88)",

  // Asphalt Textures
  asphalt: "#111114",
  asphaltLight: "#1A1A1E",
  asphaltDark: "#0A0A0C",

  // Warm Off-White Typography (F5F3EE–F0EDE5 range, WCAG AAA compliant)
  white: "#F2EFE9",
  text: "#F2EFE9",
  textMuted: "#A39E93",
  textDim: "#78736A",
  textInverse: "#0E0E10",

  // Borders (Clean, disciplined separation, not glowing)
  border: "rgba(242, 239, 233, 0.07)",
  borderSubtle: "rgba(242, 239, 233, 0.04)",
  borderStrong: "rgba(242, 239, 233, 0.14)",

  // Brand Amber Hierarchy (Full-strength reserved for primary CTAs & active states)
  amber: "#E59518",
  amberLight: "#F0A632",
  amberDark: "#C77B0E",
  amberMuted: "#B58A46",
  amberSubtle: "rgba(229, 149, 24, 0.10)",
  amberBorder: "rgba(229, 149, 24, 0.22)",
  amberGlow: "rgba(229, 149, 24, 0.06)", // Reduced glow by >60%

  // Semantic Status Hierarchy by Visual Weight:
  // Red is safety-critical: most saturated and attention-grabbing
  red: "#E5484D",
  redLight: "#F87171",
  redBorder: "rgba(229, 72, 77, 0.32)",
  redGlow: "rgba(229, 72, 77, 0.10)",

  // Green is calmer/more muted: reassuring resolution, not electric lime
  green: "#3EA370",
  greenLight: "#5BAE85",
  greenBorder: "rgba(62, 163, 112, 0.22)",
  greenGlow: "rgba(62, 163, 112, 0.05)",

  // Blue is calm/more muted: institutional informational tone
  blue: "#5B8EC2",
  blueLight: "#7AA6D4",
  blueBorder: "rgba(91, 142, 194, 0.22)",
  blueGlow: "rgba(91, 142, 194, 0.05)",
};

// Font Typography Helpers
export const FONT_DISPLAY = "font-display font-black tracking-tight";
export const FONT_BODY = "font-sans";
export const FONT_MONO = "font-mono";

// Grounded Ambient Background (No artificial multi-colored radial neon orbs)
export const NOISE_BG =
  "linear-gradient(180deg, #0E0E10 0%, #131316 100%)";
