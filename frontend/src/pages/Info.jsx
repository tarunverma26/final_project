import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import RainLayer from "@/components/RainLayer";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar, MapTrifold, Clock, Plus, Trash, CheckCircle, Warning, Users, Sparkle, X
} from "@phosphor-icons/react";

export default function Info({ mode = "events" }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizer: "Municipal Authority",
    status: "UPCOMING",
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/events");
      setEvents(data);
    } catch {
      // Fallback if network offline
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mode === "events") {
      loadEvents();
    }
  }, [mode]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/events", form);
      setEvents((prev) => [...prev, data]);
      setShowModal(false);
      setForm({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        organizer: "Municipal Authority",
        status: "UPCOMING",
      });
    } catch (e) {
      setErr(formatApiErrorDetail(e.response?.data?.detail) || e.message);
    }
    setBusy(false);
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to remove this civic event?")) return;
    try {
      await api.delete(`/events/${id}`);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (e) {
      alert("Unable to delete event: " + (e.response?.data?.detail || e.message));
    }
  };

  const filteredEvents = events.filter((e) => {
    if (filter === "ALL") return true;
    return e.status === filter;
  });

  return (
    <div className="asphalt-bg min-h-screen">
      <Navbar />
      <RainLayer count={20} />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-[11px] tracking-widest text-amber-400 font-mono">
              / {mode === "events" ? "CIVIC CONSULTATIONS & DRIVES" : "ROAD CONTRACTORS"}
            </p>
            <h1 className="font-display font-black text-4xl md:text-5xl mt-2">
              {mode === "events" ? "Civic Events & Maintenance Drives" : "Road Contractors on File"}
            </h1>
            <p className="text-zinc-400 mt-2 max-w-xl">
              Public stakeholder consultations, monsoon patching drives, and infrastructure townhalls.
            </p>
          </div>

          {isAdmin && mode === "events" && (
            <button
              onClick={() => { setShowModal(true); setErr(""); }}
              data-testid="admin-create-event-btn"
              className="px-5 py-3 rounded-full bg-amber-500 text-black font-semibold hover:bg-amber-400 flex items-center gap-2 shadow-lg"
            >
              <Plus size={18} weight="bold" /> Schedule Event
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex gap-2">
          {["ALL", "UPCOMING", "ONGOING", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono border transition-colors ${
                filter === st
                  ? "border-amber-500 bg-amber-500/10 text-amber-300"
                  : "border-white/10 text-zinc-400 hover:border-white/25"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          {loading ? (
            // Skeleton Loaders
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-2xl bg-[#111] border border-white/5 p-6 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-zinc-800" />
                <div className="h-5 bg-zinc-800 rounded mt-4 w-3/4" />
                <div className="h-3 bg-zinc-800/60 rounded mt-2 w-1/2" />
                <div className="h-3 bg-zinc-800/40 rounded mt-4 w-1/3" />
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-zinc-500 italic bg-[#111] rounded-2xl border border-white/5">
              No civic events found under this status.
            </div>
          ) : (
            filteredEvents.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-[#111] border border-white/5 p-6 relative group hover:border-amber-500/30 transition-colors"
                data-testid={`event-card-${e.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <Calendar size={20} className="text-amber-400" weight="duotone" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                        e.status === "UPCOMING"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          : e.status === "COMPLETED"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                          : "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      }`}
                    >
                      {e.status}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="text-zinc-600 hover:text-red-400 p-1 transition-colors"
                        title="Delete Event"
                        data-testid={`delete-event-${e.id}`}
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="font-display font-bold text-xl mt-4 text-white">{e.title}</div>
                {e.description && (
                  <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{e.description}</p>
                )}

                <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <MapTrifold size={14} className="text-amber-400" />
                    <span>{e.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-400" />
                    <span className="font-mono text-zinc-300">
                      {e.date} {e.time ? `· ${e.time}` : ""}
                    </span>
                  </div>
                  {e.organizer && (
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-zinc-500" />
                      <span className="text-zinc-500">Organized by {e.organizer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Admin Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl glass p-6 relative border border-white/10"
              data-testid="create-event-modal"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="text-[10px] font-mono tracking-widest text-amber-400">/ ADMINISTRATION</div>
              <h2 className="font-display font-black text-2xl mt-1">Schedule Civic Event</h2>

              <form onSubmit={handleCreateEvent} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-mono text-zinc-400">EVENT TITLE *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => { setForm({ ...form, title: e.target.value }); if (err) setErr(""); }}
                    placeholder="e.g. NH-48 Public Consultation"
                    className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => { setForm({ ...form, description: e.target.value }); if (err) setErr(""); }}
                    placeholder="What is the objective of this drive/hearing?"
                    className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400">DATE *</label>
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => { setForm({ ...form, date: e.target.value }); if (err) setErr(""); }}
                      className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400">TIME</label>
                    <input
                      value={form.time}
                      onChange={(e) => { setForm({ ...form, time: e.target.value }); if (err) setErr(""); }}
                      placeholder="e.g. 10:30 AM"
                      className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-zinc-400">LOCATION / VENUE *</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => { setForm({ ...form, location: e.target.value }); if (err) setErr(""); }}
                    placeholder="e.g. Municipal Hall, Sector 14"
                    className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono text-zinc-400">ORGANIZER</label>
                    <input
                      value={form.organizer}
                      onChange={(e) => { setForm({ ...form, organizer: e.target.value }); if (err) setErr(""); }}
                      placeholder="e.g. State PWD"
                      className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-zinc-400">STATUS</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="mt-1 w-full rounded-lg bg-black/60 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-amber-500/60 text-zinc-300"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                {err && (
                  <div className="text-sm text-red-400 flex items-center gap-1.5">
                    <Warning size={16} /> {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
                >
                  {busy ? "Scheduling..." : "Publish Civic Event"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
