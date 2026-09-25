import React from "react";

/**
 * GlobalStyle injects CSS keyframes, road lane dividers, and utilities
 * for the clean light mode civic design system.
 */
export default function GlobalStyle() {
  return (
    <style>{`
      /* Highway Dashed Amber/Slate Divider (.rw-lane) */
      .rw-lane {
        width: 100%;
        height: 1px;
        background: repeating-linear-gradient(
          90deg,
          rgba(249, 115, 22, 0.4) 0,
          rgba(249, 115, 22, 0.4) 16px,
          transparent 16px,
          transparent 32px
        );
        opacity: 0.6;
      }

      /* Subtle pulse & indicator glow for light mode */
      @keyframes rw-pulse-glow {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.2);
        }
        50% {
          box-shadow: 0 0 0 6px rgba(249, 115, 22, 0.15);
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

      @media (prefers-reduced-motion: reduce) {
        .rw-route-dash {
          animation: none;
        }
        .rw-glow-amber {
          animation: none;
        }
      }
    `}</style>
  );
}
