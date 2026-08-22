import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import { Calendar, HardHat, MapTrifold } from "@phosphor-icons/react";

const CONTRACTORS = [
  { name: "IRB Infrastructure Developers", road: "NH-48", rating: "B+", complaints: 42 },
  { name: "L&T Construction", road: "NH-16", rating: "A-", complaints: 18 },
  { name: "Ashoka Buildcon", road: "SH-32", rating: "B", complaints: 61 },
];
const EVENTS = [
  { title: "Public Consultation — NH-48 Widening", date: "Aug 22, 2026", loc: "Gurugram Municipal Office" },
  { title: "Monsoon Repair Drive", date: "Sep 05, 2026", loc: "Ward-14 Community Hall" },
];

export default function Info({ mode = "events" }) {
  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <p className="text-[11px] tracking-widest text-amber-400 font-mono">
          / {mode === "events" ? "CIVIC EVENTS" : "CONTRACTORS"}
        </p>
        <h1 className="font-display font-black text-4xl md:text-5xl mt-2">
          {mode === "events" ? "Civic events & drives" : "Road contractors on file"}
        </h1>

        <div className="mt-10 grid md:grid-cols-2 gap-4">
          {mode === "events"
            ? EVENTS.map((e) => (
                <div key={e.title} className="rounded-2xl bg-[#111] border border-white/5 p-6">
                  <Calendar size={22} className="text-amber-400" weight="duotone" />
                  <div className="font-display font-bold text-lg mt-3">{e.title}</div>
                  <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                    <MapTrifold size={12} /> {e.loc}
                  </div>
                  <div className="mt-3 text-sm text-amber-400 font-mono">{e.date}</div>
                </div>
              ))
            : CONTRACTORS.map((c) => (
                <div key={c.name} className="rounded-2xl bg-[#111] border border-white/5 p-6">
                  <HardHat size={22} className="text-amber-400" weight="duotone" />
                  <div className="font-display font-bold text-lg mt-3">{c.name}</div>
                  <div className="text-xs text-zinc-500 mt-1">Road: {c.road}</div>
                  <div className="mt-4 flex gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">Rating</div>
                      <div className="text-amber-400 font-bold">{c.rating}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500">Complaints</div>
                      <div className="text-white">{c.complaints}</div>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
