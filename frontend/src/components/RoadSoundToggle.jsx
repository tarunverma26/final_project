import React, { useState, useRef, useEffect } from "react";
import { SpeakerSimpleHigh, SpeakerSimpleSlash } from "@phosphor-icons/react";

/**
 * RoadSoundToggle
 * 
 * In-browser synthesized ambient sound engine using Web Audio API:
 * - Soft falling rain on asphalt and distant highway road rumble
 * - Zero external audio dependencies / 100% offline & zero network latency
 * - Default muted as required by accessibility best practices
 */
export default function RoadSoundToggle({ className = "" }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const noiseSourceRef = useRef(null);

  const toggleSound = () => {
    if (isPlaying) {
      // Fade out
      if (gainNodeRef.current && audioCtxRef.current) {
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0.0001,
          audioCtxRef.current.currentTime + 0.3
        );
        setTimeout(() => {
          if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
            audioCtxRef.current.suspend();
          }
          setIsPlaying(false);
        }, 320);
      } else {
        setIsPlaying(false);
      }
    } else {
      // Start or resume audio
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!audioCtxRef.current) {
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;

          // Generate 2 seconds of pink/brownish filtered noise for rain & road hiss
          const bufferSize = ctx.sampleRate * 2;
          const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          let b0 = 0, b1 = 0, b2 = 0;
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.96 * b1 + white * 0.11;
            b2 = 0.86 * b2 + white * 0.25;
            output[i] = (b0 + b1 + b2) * 0.22;
          }

          const whiteNoise = ctx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;
          noiseSourceRef.current = whiteNoise;

          // Bandpass filter for wet asphalt sound
          const filter = ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.setValueAtTime(650, ctx.currentTime);

          // Subtle road rumble sub-oscillator
          const rumble = ctx.createOscillator();
          rumble.type = "sine";
          rumble.frequency.setValueAtTime(58, ctx.currentTime);
          const rumbleGain = ctx.createGain();
          rumbleGain.gain.setValueAtTime(0.015, ctx.currentTime);
          rumble.connect(rumbleGain);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          gainNodeRef.current = gain;

          whiteNoise.connect(filter);
          filter.connect(gain);
          rumbleGain.connect(gain);
          gain.connect(ctx.destination);

          whiteNoise.start(0);
          rumble.start(0);
        }

        if (audioCtxRef.current.state === "suspended") {
          audioCtxRef.current.resume();
        }

        gainNodeRef.current.gain.cancelScheduledValues(audioCtxRef.current.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(
          0.065, // gentle soothing volume
          audioCtxRef.current.currentTime + 0.4
        );
        setIsPlaying(true);
      } catch (err) {
        console.warn("Web Audio ambient error:", err);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        try {
          audioCtxRef.current.close();
        } catch (_) {}
      }
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      type="button"
      aria-label={isPlaying ? "Mute road atmosphere audio" : "Unmute road atmosphere audio"}
      title={isPlaying ? "Atmosphere Audio: ON (Rain & Highway Sound)" : "Atmosphere Audio: OFF (Click to unmute)"}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 cursor-pointer ${
        isPlaying
          ? "bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.35)]"
          : "bg-slate-900/80 text-slate-300 border border-slate-700/70 hover:border-slate-500 hover:text-white"
      } ${className}`}
      data-testid="road-sound-toggle"
    >
      {isPlaying ? (
        <>
          <SpeakerSimpleHigh size={15} weight="fill" className="text-amber-400 animate-pulse" />
          <span>ROAD AUDIO: ON</span>
        </>
      ) : (
        <>
          <SpeakerSimpleSlash size={15} weight="regular" className="text-slate-400" />
          <span>ROAD AUDIO: MUTED</span>
        </>
      )}
    </button>
  );
}
