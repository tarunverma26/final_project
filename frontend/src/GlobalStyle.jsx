import React from "react";

/**
 * GlobalStyle injects CSS keyframes, road lane dividers, and utilities.
 * Keeps animations pure CSS with subtle, realistic glow values (not over-saturated orbs).
 */
export default function GlobalStyle() {
  return (
    <style>{`
      /* Highway Dashed Amber Divider (.rw-lane) */
      .rw-lane {
        width: 100%;
        height: 1px;
        background: repeating-linear-gradient(
          90deg,
          rgba(229, 149, 24, 0.35) 0,
          rgba(229, 149, 24, 0.35) 16px,
          transparent 16px,
          transparent 32px
        );
        opacity: 0.85;
      }

      /* Subtle pulse & indicator glow (restrained by 60% for realism) */
      @keyframes rw-pulse-glow {
        0%, 100% {
          box-shadow: 0 0 6px rgba(229, 149, 24, 0.15);
        }
        50% {
          box-shadow: 0 0 12px rgba(229, 149, 24, 0.28);
        }
      }

      .rw-glow-amber {
        animation: rw-pulse-glow 3s infinite ease-in-out;
      }

      @keyframes rw-dash-flow {
        to {
          stroke-dashoffset: -40;
        }
      }

      .rw-route-dash {
        stroke-dasharray: 8 6;
        animation: rw-dash-flow 1.5s linear infinite;
      }
    `}</style>
  );
}
