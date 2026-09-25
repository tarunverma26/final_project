import React from "react";

/**
 * GlobalStyle injects CSS keyframes, road lane dividers, and utilities.
 * Keeps animations pure CSS (no Framer Motion overhead).
 */
export default function GlobalStyle() {
  return (
    <style>{`
      /* Highway Dashed Amber Divider (.rw-lane) */
      .rw-lane {
        width: 100%;
        height: 2px;
        background: repeating-linear-gradient(
          90deg,
          #F59E0B 0,
          #F59E0B 16px,
          transparent 16px,
          transparent 32px
        );
        opacity: 0.35;
      }

      /* Subtle pulse & glow animations */
      @keyframes rw-pulse-glow {
        0%, 100% {
          box-shadow: 0 0 15px rgba(245, 158, 11, 0.25);
        }
        50% {
          box-shadow: 0 0 25px rgba(245, 158, 11, 0.55);
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
