import React, { useEffect, useRef } from "react";

/**
 * HeroAtmosphere
 * 
 * Recreates the dynamic "sun-shower" cinematic atmosphere in-browser:
 * - Breathing volumetric sun god-rays (8-12s subtle pulse)
 * - Canvas-based fine diagonal falling rain (smooth, GPU-friendly, responsive)
 * - Puddle ripple & reflection shimmer on wet tarmac
 * - Atmospheric depth / soft horizon bokeh
 * - Full prefers-reduced-motion support and viewport awareness
 */
export default function HeroAtmosphere() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Handle resize
    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Initialize fine raindrops
    const dropCount = Math.min(85, Math.floor(width / 16));
    const angle = 12 * (Math.PI / 180); // 12 degree wind slant
    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);

    const drops = Array.from({ length: dropCount }).map(() => ({
      x: Math.random() * (width + 200) - 100,
      y: Math.random() * height,
      length: 18 + Math.random() * 22, // fine streak length
      speed: 14 + Math.random() * 10,   // falling velocity
      opacity: 0.12 + Math.random() * 0.22, // subtle opacity
      width: 0.75 + Math.random() * 0.6,
    }));

    let lastTime = performance.now();

    const render = (time) => {
      // Throttle delta to prevent jumps on tab focus
      const delta = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];

        // Draw diagonal streak
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.length * sinAngle, d.y + d.length * cosAngle);
        ctx.strokeStyle = `rgba(230, 242, 255, ${d.opacity})`;
        ctx.lineWidth = d.width;
        ctx.lineCap = "round";
        ctx.stroke();

        // Advance position
        d.x += d.speed * sinAngle * delta;
        d.y += d.speed * cosAngle * delta;

        // Reset drop when exiting bounds
        if (d.y > height + 40 || d.x < -100 || d.x > width + 100) {
          d.y = -30 - Math.random() * 50;
          d.x = Math.random() * (width + 200) - 100;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-2" aria-hidden="true">
      {/* 1. Volumetric God-Rays / Sunbeam Shimmer (Centered on sun in upper sky) */}
      <div className="absolute inset-0 rw-godrays-layer pointer-events-none" />

      {/* 2. Soft Horizon Depth / Bokeh (Slight haze where the road vanishes in the distance) */}
      <div
        className="absolute pointer-events-none select-none hidden sm:block"
        style={{
          top: "42%",
          left: "32%",
          width: "38%",
          height: "24%",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.5) 0%, transparent 75%)",
        }}
      />

      {/* 3. Puddle Ripple & Water Surface Shimmer (Lower portion of road) */}
      <div className="absolute bottom-0 left-0 right-0 h-[46%] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 rw-puddle-shimmer" />
        <div className="absolute inset-x-0 bottom-4 h-32 rw-puddle-ripples opacity-40" />
      </div>

      {/* 4. Fine Falling Rain Canvas (GPU-accelerated, wind-tilted streaks) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,1) 100%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.2) 20%, rgba(0,0,0,0.85) 55%, rgba(0,0,0,1) 100%)",
        }}
      />

      <style>{`
        /* Step 2: Animated Volumetric God-Ray Pulses */
        .rw-godrays-layer {
          background: radial-gradient(
            circle at 46% 23%,
            rgba(255, 240, 190, 0.22) 0%,
            rgba(255, 220, 140, 0.12) 28%,
            rgba(249, 115, 22, 0.05) 50%,
            transparent 70%
          );
          animation: rw-sunbeam-pulse 9.5s ease-in-out infinite alternate;
          will-change: opacity, transform;
        }

        @keyframes rw-sunbeam-pulse {
          0% {
            opacity: 0.62;
            transform: scale(0.98);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.70;
            transform: scale(1.0);
          }
        }

        /* Step 4: Puddle Ripple / Shimmer effect on wet tarmac */
        .rw-puddle-shimmer {
          background: linear-gradient(
            110deg,
            transparent 15%,
            rgba(255, 245, 220, 0.07) 35%,
            rgba(255, 255, 255, 0.14) 50%,
            rgba(255, 245, 220, 0.07) 65%,
            transparent 85%
          );
          background-size: 200% 100%;
          animation: rw-water-shimmer 16s ease-in-out infinite alternate;
          mix-blend-mode: screen;
          will-change: background-position, opacity;
        }

        @keyframes rw-water-shimmer {
          0% {
            background-position: 0% 50%;
            opacity: 0.35;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.65;
          }
          100% {
            background-position: 0% 50%;
            opacity: 0.35;
          }
        }

        .rw-puddle-ripples {
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 8px,
            rgba(255, 255, 255, 0.04) 9px,
            transparent 10px
          );
          animation: rw-water-wave 7s ease-in-out infinite alternate;
          will-change: transform, opacity;
        }

        @keyframes rw-water-wave {
          0% {
            transform: translateY(0px) scaleY(1);
            opacity: 0.25;
          }
          50% {
            transform: translateY(-3px) scaleY(1.06);
            opacity: 0.45;
          }
          100% {
            transform: translateY(0px) scaleY(1);
            opacity: 0.25;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .rw-godrays-layer,
          .rw-puddle-shimmer,
          .rw-puddle-ripples {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
