import React, { useMemo } from "react";

/**
 * WeatherAtmosphere Component
 * 
 * Renders a subtle, high-performance daytime atmospheric layer:
 * - Bright Indian monsoon afternoon mood
 * - Soft sky gradient & warm sun glow
 * - Slowly drifting parallax cloud layers (low opacity, non-cartoon)
 * - Light diagonal rain streaks (wind-tilted, low opacity)
 * - Fully GPU accelerated, zero FPS penalty, pointer-events: none
 * - Respects prefers-reduced-motion
 */
export default function WeatherAtmosphere({
  rainCount = 35,
  showClouds = true,
  showSun = true,
  showSkyGradient = true,
  className = "",
}) {
  // Deterministic raindrops to prevent hydration mismatch and unnecessary re-renders
  const raindrops = useMemo(() => {
    return Array.from({ length: rainCount }).map((_, i) => ({
      id: i,
      left: `${(i * 2.85 + 1.2) % 100}%`,
      duration: `${1.1 + (i % 5) * 0.25}s`,
      delay: `${(i % 7) * 0.3}s`,
      opacity: 0.12 + (i % 4) * 0.05,
      height: `${35 + (i % 6) * 6}px`,
    }));
  }, [rainCount]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none z-0 select-none ${className}`}
      aria-hidden="true"
    >
      {/* 1. Subtle Sky Tint */}
      {showSkyGradient && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(235, 244, 255, 0.6) 0%, rgba(248, 250, 252, 0.3) 60%, rgba(248, 250, 252, 0) 100%)",
          }}
        />
      )}

      {/* 2. Soft Monsoon Sun Glow in top corner (Non-cartoon radial shimmer) */}
      {showSun && (
        <div
          className="absolute -top-16 right-4 sm:right-16 w-80 h-80 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(254, 240, 138, 0.25) 0%, rgba(249, 115, 22, 0.08) 35%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />
      )}

      {/* 3. Parallax Drifting Cloud Bands */}
      {showClouds && (
        <div className="absolute inset-0 overflow-hidden opacity-45">
          {/* Cloud Layer 1: High altitude, slow drift */}
          <div
            className="absolute top-4 -left-[20%] w-[140%] h-36 rw-cloud-drift-slow"
            style={{
              background:
                "radial-gradient(ellipse 45% 45% at 30% 40%, rgba(255,255,255,0.75) 0%, rgba(241,245,249,0.3) 50%, transparent 80%), radial-gradient(ellipse 55% 40% at 75% 35%, rgba(255,255,255,0.7) 0%, rgba(241,245,249,0.25) 55%, transparent 80%)",
              filter: "blur(18px)",
            }}
          />

          {/* Cloud Layer 2: Mid altitude, medium drift */}
          <div
            className="absolute top-16 -left-[30%] w-[160%] h-44 rw-cloud-drift-mid"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,255,255,0.65) 0%, rgba(226,232,240,0.2) 60%, transparent 85%), radial-gradient(ellipse 40% 40% at 20% 60%, rgba(255,255,255,0.5) 0%, transparent 75%)",
              filter: "blur(24px)",
            }}
          />
        </div>
      )}

      {/* 4. Realistic Monsoon Rain Streaks (slight diagonal wind tilt) */}
      <div className="absolute inset-0 overflow-hidden">
        {raindrops.map((d) => (
          <span
            key={d.id}
            className="rw-rain-streak"
            style={{
              left: d.left,
              height: d.height,
              opacity: d.opacity,
              animationDuration: d.duration,
              animationDelay: d.delay,
            }}
          />
        ))}
      </div>

      <style>{`
        /* Rain streak with diagonal wind tilt */
        .rw-rain-streak {
          position: absolute;
          top: -15%;
          width: 1px;
          background: linear-gradient(180deg, transparent, rgba(56, 114, 168, 0.45));
          transform: rotate(14deg);
          animation: rw-rain-fall linear infinite;
        }

        @keyframes rw-rain-fall {
          0% {
            transform: translateY(-50px) rotate(14deg);
          }
          100% {
            transform: translateY(115vh) rotate(14deg);
          }
        }

        /* Subtle parallax cloud drift */
        .rw-cloud-drift-slow {
          animation: rw-drift 110s linear infinite;
        }
        .rw-cloud-drift-mid {
          animation: rw-drift 80s linear infinite;
        }

        @keyframes rw-drift {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(6%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rw-rain-streak {
            animation: none;
            display: none;
          }
          .rw-cloud-drift-slow,
          .rw-cloud-drift-mid {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
