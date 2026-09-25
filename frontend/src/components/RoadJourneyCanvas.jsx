import React, { useEffect, useRef, useState, useCallback } from "react";
import RoadSoundToggle from "./RoadSoundToggle";

/**
 * RoadJourneyCanvas
 * 
 * Cinematic Living Road Animation System:
 * - Real damaged asphalt road with perspective extending into the distance
 * - Multiple potholes with rainwater puddles & interactive ripple physics
 * - Branching asphalt cracks, asphalt repair patches, and faded lane markings
 * - Dynamic forward motion (subtle continuous crawl + accelerated scroll delta)
 * - Moving headlights & vehicle silhouettes in the distance
 * - Streetlight glows and ambient lighting changes (rural -> highway -> urban city streets)
 * - Small roadside milestone signboards passing by on the road shoulder
 * - City skyline silhouettes with glowing windows at horizon
 * - Floating atmospheric dust & fine rain droplets
 * - Click interactive ripples on puddles & asphalt
 * - Sound toggle for ambient rain & road sounds
 * - 60FPS GPU canvas rendering with prefers-reduced-motion support
 */
export default function RoadJourneyCanvas({ className = "" }) {
  const canvasRef = useRef(null);
  const [currentMilestone, setCurrentMilestone] = useState("NH-48 KM 28 · SECTOR 14 ENTRY");
  const [roadZone, setRoadZone] = useState("NATIONAL HIGHWAY");
  const interactiveRipplesRef = useRef([]);

  const handleCanvasClick = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    interactiveRipplesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: 65,
      alpha: 0.9,
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Road travel forward progression offset
    let roadOffset = 0;
    let targetSpeed = 0.6; // baseline subtle crawl
    let currentSpeed = 0.6;
    let lastScrollY = window.scrollY;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const delta = Math.abs(scrollY - lastScrollY);
      lastScrollY = scrollY;
      // Scroll moves camera forward along the road
      roadOffset += delta * 0.45;
      targetSpeed = Math.min(4.5, 0.6 + delta * 0.12);

      // Milestone signage detection & zone transition based on scroll position
      if (scrollY < 700) {
        setCurrentMilestone("NH-48 KM 28 · ARTERIAL CORRIDOR");
        setRoadZone("EXPRESS HIGHWAY");
      } else if (scrollY < 1800) {
        setCurrentMilestone("WARD 14 · CITIZEN REPORTING ZONE");
        setRoadZone("URBAN COLLECTOR");
      } else if (scrollY < 3000) {
        setCurrentMilestone("KM 34.2 · HIGH DEFECT DENSITY AREA");
        setRoadZone("STRESS CORRIDOR");
      } else if (scrollY < 4200) {
        setCurrentMilestone("NHAI / PWD AUDIT VERIFICATION POINT");
        setRoadZone("AUDIT JUNCTION");
      } else {
        setCurrentMilestone("MUNICIPAL TERMINUS · REPAIR COMPLETE");
        setRoadZone("CIVIC TERMINUS");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Road Potholes & Puddle entities on the road plane (normalized z-depth 0.0 to 1.0)
    const potholes = [
      { xNorm: -0.22, z: 0.28, radiusX: 52, radiusY: 26, rippleTimer: 0, severity: "HIGH" },
      { xNorm: 0.18, z: 0.52, radiusX: 38, radiusY: 19, rippleTimer: 1.5, severity: "MEDIUM" },
      { xNorm: -0.12, z: 0.74, radiusX: 64, radiusY: 31, rippleTimer: 2.8, severity: "CRITICAL" },
      { xNorm: 0.28, z: 0.88, radiusX: 44, radiusY: 22, rippleTimer: 0.8, severity: "HIGH" },
    ];

    // Branching road cracks
    const cracks = [
      { xNorm: -0.05, z: 0.35, length: 110, angle: 0.4 },
      { xNorm: 0.25, z: 0.62, length: 85, angle: -0.3 },
      { xNorm: -0.28, z: 0.82, length: 130, angle: 0.6 },
      { xNorm: 0.12, z: 0.18, length: 70, angle: -0.2 },
    ];

    // Distant Vehicles / Headlights in the opposite lane
    const oncomingVehicles = [
      { xNorm: 0.14, z: 0.15, speed: 0.0018, color: "rgba(255, 245, 210, 0.9)" },
      { xNorm: 0.22, z: 0.55, speed: 0.0015, color: "rgba(255, 230, 180, 0.85)" },
      { xNorm: -0.26, z: 0.78, speed: 0.0012, color: "rgba(255, 220, 160, 0.8)" },
    ];

    // Small milestone signboards passing by on the roadside shoulder
    const roadsideMilestones = [
      { z: 0.18, line1: "NH 48", line2: "KM 28", color: "#EAB308", side: "left" },
      { z: 0.52, line1: "WARD", line2: "14", color: "#10B981", side: "right" },
      { z: 0.82, line1: "NH 48", line2: "KM 34", color: "#EAB308", side: "left" },
    ];

    // Distant city buildings along horizon
    const cityBuildings = Array.from({ length: 24 }).map((_, i) => ({
      xNorm: (i / 24) * 1.2 - 0.1,
      widthNorm: 0.03 + Math.random() * 0.035,
      heightNorm: 0.03 + Math.random() * 0.07,
      windowRows: 3 + Math.floor(Math.random() * 5),
    }));

    // Atmospheric floating dust / mist particles
    const dustCount = 45;
    const dustParticles = Array.from({ length: dustCount }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      opacity: 0.15 + Math.random() * 0.35,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0.2 + Math.random() * 0.5,
    }));

    let lastTime = performance.now();

    const loop = (time) => {
      const dt = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;

      // Smooth camera acceleration
      currentSpeed += (targetSpeed - currentSpeed) * 0.08;
      targetSpeed += (0.6 - targetSpeed) * 0.04;
      roadOffset += currentSpeed * dt * 0.015;

      ctx.clearRect(0, 0, width, height);

      const vpX = width * 0.5; // Vanishing point X (horizon center)
      const vpY = height * 0.38; // Vanishing point Y (horizon level)
      const roadBottomLeft = width * 0.06;
      const roadBottomRight = width * 0.94;
      const roadTopWidth = width * 0.12;

      // 1. Sky & Distant Horizon Ambience (Night-Monsoon Charcoal Atmosphere)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, vpY + 50);
      skyGrad.addColorStop(0, "#050B14");
      skyGrad.addColorStop(0.7, "#091220");
      skyGrad.addColorStop(1, "#101B2E");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, vpY + 40);

      // Distant city skyline silhouettes
      ctx.save();
      ctx.fillStyle = "#0A121F";
      cityBuildings.forEach((b) => {
        const bx = b.xNorm * width;
        const bw = b.widthNorm * width;
        const bh = b.heightNorm * height;
        const by = vpY - bh;
        ctx.fillRect(bx, by, bw, bh);

        // Warm distant windows
        ctx.fillStyle = "rgba(254, 215, 170, 0.2)";
        for (let r = 0; r < b.windowRows; r++) {
          ctx.fillRect(bx + bw * 0.25, by + 4 + r * 6, bw * 0.2, 3);
          ctx.fillRect(bx + bw * 0.6, by + 4 + r * 6, bw * 0.2, 3);
        }
        ctx.fillStyle = "#0A121F";
      });
      ctx.restore();

      // Distant streetlight horizon glow
      ctx.save();
      const horizonGlow = ctx.createRadialGradient(vpX, vpY, 10, vpX, vpY, width * 0.45);
      horizonGlow.addColorStop(0, "rgba(254, 215, 170, 0.18)");
      horizonGlow.addColorStop(0.5, "rgba(249, 115, 22, 0.06)");
      horizonGlow.addColorStop(1, "transparent");
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, vpY - 60, width, 120);
      ctx.restore();

      // 2. Roadside Soil & Shoulder Dirt
      ctx.fillStyle = "#080E17";
      ctx.fillRect(0, vpY, width, height - vpY);

      // 3. Perspective Dark Asphalt Road Surface
      ctx.beginPath();
      ctx.moveTo(vpX - roadTopWidth * 0.5, vpY);
      ctx.lineTo(vpX + roadTopWidth * 0.5, vpY);
      ctx.lineTo(roadBottomRight, height);
      ctx.lineTo(roadBottomLeft, height);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, vpY, 0, height);
      roadGrad.addColorStop(0, "#121A26");
      roadGrad.addColorStop(0.5, "#0C131D");
      roadGrad.addColorStop(1, "#070C14");
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // Road asphalt grain & wet reflection sheen
      ctx.save();
      ctx.clip(); // Clip to road boundaries

      // Wet surface specular horizon reflection
      const wetSheen = ctx.createLinearGradient(vpX, vpY, vpX, height);
      wetSheen.addColorStop(0, "rgba(255, 240, 200, 0.08)");
      wetSheen.addColorStop(0.4, "rgba(230, 240, 255, 0.04)");
      wetSheen.addColorStop(1, "rgba(255, 255, 255, 0.02)");
      ctx.fillStyle = wetSheen;
      ctx.fillRect(0, vpY, width, height - vpY);

      // 4. Asphalt Repair Patches (Irregular rectangular darker bitumen overlays)
      const patchZ1 = ((0.42 + roadOffset * 0.1) % 1.0);
      const patchZ2 = ((0.78 + roadOffset * 0.1) % 1.0);
      [patchZ1, patchZ2].forEach((pz, i) => {
        const patchY = vpY + Math.pow(pz, 1.8) * (height - vpY);
        const patchScale = 0.2 + pz * 1.4;
        const patchW = 120 * patchScale;
        const patchH = 45 * patchScale;
        const patchX = vpX + (i === 0 ? -90 : 80) * patchScale;

        ctx.fillStyle = "rgba(4, 7, 12, 0.8)";
        ctx.beginPath();
        ctx.roundRect(patchX - patchW * 0.5, patchY - patchH * 0.5, patchW, patchH, 6 * patchScale);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. Road Cracks in Asphalt
      cracks.forEach((c) => {
        const cz = ((c.z + roadOffset * 0.1) % 1.0);
        const cY = vpY + Math.pow(cz, 1.8) * (height - vpY);
        const cScale = 0.2 + cz * 1.5;
        const cX = vpX + c.xNorm * width * cz * 1.1;

        ctx.save();
        ctx.strokeStyle = "rgba(4, 7, 12, 0.9)";
        ctx.lineWidth = Math.max(1, 2.5 * cScale);
        ctx.beginPath();
        ctx.moveTo(cX, cY);
        ctx.lineTo(cX + 20 * cScale, cY + 12 * cScale);
        ctx.lineTo(cX + 42 * cScale, cY + 16 * cScale);
        ctx.lineTo(cX + 65 * cScale, cY + 32 * cScale);
        ctx.stroke();
        ctx.restore();
      });

      // 6. Faded Lane Markings (Moving dashed center stripes)
      const stripeCount = 14;
      for (let s = 0; s < stripeCount; s++) {
        // Perspective distribution from 0.0 to 1.0 with seamless wraparound
        const sProgress = ((s / stripeCount + roadOffset * 0.3) % 1.0);
        const z = Math.pow(sProgress, 2.1); // exponential perspective compression
        const y = vpY + z * (height - vpY);
        const scale = 0.15 + z * 1.25;
        const stripeH = 34 * scale;
        const stripeW = 8 * scale;

        // Faded yellow center dashed line
        ctx.fillStyle = `rgba(245, 158, 11, ${0.15 + z * 0.65})`;
        ctx.fillRect(vpX - stripeW * 0.5, y, stripeW, stripeH);

        // White outer boundary lines
        const leftEdgeX = vpX - (roadTopWidth * 0.5 + (vpX - roadBottomLeft - roadTopWidth * 0.5) * z);
        const rightEdgeX = vpX + (roadTopWidth * 0.5 + (roadBottomRight - vpX - roadTopWidth * 0.5) * z);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + z * 0.5})`;
        ctx.fillRect(leftEdgeX, y, 4 * scale, stripeH * 1.4);
        ctx.fillRect(rightEdgeX, y, 4 * scale, stripeH * 1.4);
      }

      // 7. Potholes with Rainwater Reflections and Expanding Ripples
      potholes.forEach((p) => {
        p.rippleTimer += 0.03 * dt;
        const pz = ((p.z + roadOffset * 0.12) % 1.0);
        const pY = vpY + Math.pow(pz, 1.9) * (height - vpY);
        const pScale = 0.25 + pz * 1.4;
        const pX = vpX + p.xNorm * width * (0.3 + pz * 0.85);

        const rX = p.radiusX * pScale;
        const rY = p.radiusY * pScale;

        // Pothole dark cavity
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(pX, pY, rX, rY, 0, 0, Math.PI * 2);
        const cavityGrad = ctx.createRadialGradient(pX, pY, 2, pX, pY, rX);
        cavityGrad.addColorStop(0, "#03060A");
        cavityGrad.addColorStop(0.7, "#060A10");
        cavityGrad.addColorStop(1, "#121A26");
        ctx.fillStyle = cavityGrad;
        ctx.fill();

        // Jagged cavity rim / asphalt fracture ring
        ctx.strokeStyle = "rgba(30, 41, 59, 0.85)";
        ctx.lineWidth = Math.max(1, 2 * pScale);
        ctx.stroke();

        // Rainwater surface puddle reflection
        ctx.beginPath();
        ctx.ellipse(pX, pY + 2 * pScale, rX * 0.82, rY * 0.82, 0, 0, Math.PI * 2);
        const waterGrad = ctx.createLinearGradient(pX, pY - rY, pX, pY + rY);
        waterGrad.addColorStop(0, "rgba(254, 215, 170, 0.22)");
        waterGrad.addColorStop(0.5, "rgba(56, 114, 168, 0.18)");
        waterGrad.addColorStop(1, "rgba(10, 20, 32, 0.6)");
        ctx.fillStyle = waterGrad;
        ctx.fill();

        // Expanding concentric ripples
        for (let r = 0; r < 3; r++) {
          const rPhase = (p.rippleTimer + r * 0.33) % 1.0;
          const ripRadiusX = rX * 0.2 + rPhase * rX * 0.65;
          const ripRadiusY = rY * 0.2 + rPhase * rY * 0.65;
          const ripAlpha = (1 - rPhase) * 0.35 * pz;

          ctx.beginPath();
          ctx.ellipse(pX, pY + 2 * pScale, ripRadiusX, ripRadiusY, 0, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 255, 255, ${ripAlpha})`;
          ctx.lineWidth = 1.2 * pScale;
          ctx.stroke();
        }

        ctx.restore();
      });

      // 8. Oncoming Vehicle Headlights in Distance
      oncomingVehicles.forEach((v) => {
        v.z -= v.speed * dt;
        if (v.z <= 0.05) v.z = 0.95;

        const vY = vpY + Math.pow(v.z, 2.3) * (height - vpY);
        const vScale = 0.12 + v.z * 0.85;
        const vX = vpX + v.xNorm * width * (0.2 + v.z * 0.7);

        // Headlight glow cones
        ctx.save();
        const beamW = 28 * vScale;
        const beamH = 85 * vScale;
        const beamGrad = ctx.createRadialGradient(vX, vY, 1, vX, vY, beamH);
        beamGrad.addColorStop(0, v.color);
        beamGrad.addColorStop(0.3, "rgba(254, 240, 138, 0.18)");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.ellipse(vX - 6 * vScale, vY, beamW, beamH, -0.05, 0, Math.PI * 2);
        ctx.ellipse(vX + 6 * vScale, vY, beamW, beamH, 0.05, 0, Math.PI * 2);
        ctx.fill();

        // Headlight core bulbs
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(vX - 6 * vScale, vY, Math.max(1, 2.5 * vScale), 0, Math.PI * 2);
        ctx.arc(vX + 6 * vScale, vY, Math.max(1, 2.5 * vScale), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore(); // Restore road clip

      // 9. Roadside Milestone Stones Passing By on the Shoulder
      roadsideMilestones.forEach((m) => {
        const mz = ((m.z + roadOffset * 0.075) % 1.0);
        if (mz < 0.08 || mz > 0.92) return;

        const mY = vpY + Math.pow(mz, 2.0) * (height - vpY);
        const mScale = 0.25 + mz * 1.5;
        const leftEdgeAtZ = vpX - (roadTopWidth * 0.5 + (vpX - roadBottomLeft - roadTopWidth * 0.5) * mz);
        const rightEdgeAtZ = vpX + (roadTopWidth * 0.5 + (roadBottomRight - vpX - roadTopWidth * 0.5) * mz);

        const mX = m.side === "left"
          ? leftEdgeAtZ - 32 * mScale
          : rightEdgeAtZ + 32 * mScale;

        const stoneW = 26 * mScale;
        const stoneH = 38 * mScale;

        ctx.save();
        // Drop shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.beginPath();
        ctx.ellipse(mX, mY + stoneH * 0.45, stoneW * 0.6, 6 * mScale, 0, 0, Math.PI * 2);
        ctx.fill();

        // White concrete milestone body
        ctx.fillStyle = "#E2E8F0";
        ctx.beginPath();
        ctx.roundRect(mX - stoneW * 0.5, mY - stoneH * 0.5, stoneW, stoneH, [
          12 * mScale,
          12 * mScale,
          2 * mScale,
          2 * mScale,
        ]);
        ctx.fill();

        // Colored top dome (Yellow for NH, Green for State)
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.roundRect(mX - stoneW * 0.5, mY - stoneH * 0.5, stoneW, stoneH * 0.42, [
          12 * mScale,
          12 * mScale,
          0,
          0,
        ]);
        ctx.fill();

        // Milestone text lettering
        if (mz > 0.3) {
          ctx.fillStyle = "#0F172A";
          ctx.font = `bold ${Math.max(7, Math.floor(7 * mScale))}px monospace`;
          ctx.textAlign = "center";
          ctx.fillText(m.line1, mX, mY - stoneH * 0.15);

          ctx.fillStyle = "#1E293B";
          ctx.font = `bold ${Math.max(8, Math.floor(9 * mScale))}px monospace`;
          ctx.fillText(m.line2, mX, mY + stoneH * 0.28);
        }
        ctx.restore();
      });

      // 10. Interactive Canvas Ripples (From user clicks)
      const ripples = interactiveRipplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 1.8 * dt;
        r.alpha -= 0.02 * dt;
        if (r.alpha <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.55, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, r.alpha)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      // 11. Floating Dust & Atmospheric Moisture Particles
      dustParticles.forEach((dp) => {
        dp.x += dp.vx * dt;
        dp.y += dp.vy * dt;
        if (dp.y > height) {
          dp.y = vpY + Math.random() * 20;
          dp.x = Math.random() * width;
        }
        ctx.beginPath();
        ctx.arc(dp.x, dp.y, dp.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 245, 255, ${dp.opacity})`;
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Real-time Hardware Accelerated Canvas Road Engine with click-to-ripple support */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block pointer-events-auto cursor-crosshair"
      />

      {/* Floating Milestone HUD Overlay Indicator & Sound Engine */}
      <div className="absolute top-20 right-6 hidden md:flex items-center gap-3 pointer-events-auto z-20">
        <RoadSoundToggle />

        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/85 border border-slate-700/60 backdrop-blur-md shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
          <div className="flex flex-col">
            <span className="font-mono text-[9px] font-bold tracking-widest text-[#F97316] uppercase">
              ZONE: {roadZone}
            </span>
            <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-200 uppercase">
              {currentMilestone}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle vignette gradient overlays to keep foreground content readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5, 11, 20, 0.45) 0%, rgba(7, 14, 25, 0.3) 40%, rgba(7, 14, 25, 0.65) 85%, rgba(5, 11, 20, 0.9) 100%)",
        }}
      />
    </div>
  );
}
