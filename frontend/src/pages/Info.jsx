import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { api, formatApiErrorDetail } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar, MapTrifold, Clock, Plus, Trash, Users, X, Warning
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
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
              <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">
                / {mode === "events" ? "CIVIC CONSULTATIONS & DRIVES" : "ROAD CONTRACTORS"}
              </p>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-[#12304A] tracking-tight mt-1">
              {mode === "events" ? "Civic Events & Maintenance Drives" : "Road Contractors on File"}
            </h1>
            <p className="text-[#64748B] text-base mt-2 max-w-xl">
              Public stakeholder consultations, monsoon patching drives, and civic infrastructure townhalls.
            </p>
          </div>

          {isAdmin && mode === "events" && (
            <button
              onClick={() => { setShowModal(true); setErr(""); }}
              data-testid="admin-create-event-btn"
              className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] flex items-center gap-2 shadow-md shadow-orange-500/15 transition text-sm"
            >
              <Plus size={18} weight="bold" /> Schedule Civic Event
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="mt-8 flex gap-2">
          {["ALL", "UPCOMING", "ONGOING", "COMPLETED"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium border transition-colors ${
                filter === st
                  ? "border-[#F97316] bg-orange-50 text-[#EA580C] shadow-xs"
                  : "border-[#CBD5E1] bg-white text-[#64748B] hover:border-slate-400"
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
              <div key={i} className="rounded-2xl bg-white border border-[#E2E8F0] p-6 animate-pulse shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-slate-100" />
                <div className="h-5 bg-slate-100 rounded mt-4 w-3/4" />
                <div className="h-3 bg-slate-100 rounded mt-2 w-1/2" />
                <div className="h-3 bg-slate-100 rounded mt-4 w-1/3" />
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full py-16 text-center text-[#64748B] italic bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
              No civic events found under this status.
            </div>
          ) : (
            filteredEvents.map((e) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white border border-[#E2E8F0] p-6 relative group hover:border-orange-300 hover:shadow-md transition shadow-sm"
                data-testid={`event-card-${e.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
                    <Calendar size={20} className="text-[#EA580C]" weight="duotone" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full border font-semibold ${
                        e.status === "UPCOMING"
                          ? "bg-orange-50 border-orange-200 text-[#EA580C]"
                          : e.status === "COMPLETED"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}
                    >
                      {e.status}
                    </span>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(e.id)}
                        className="text-[#94A3B8] hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition"
                        title="Delete Event"
                        data-testid={`delete-event-${e.id}`}
                      >
                        <Trash size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="font-display font-bold text-xl mt-4 text-[#12304A]">{e.title}</div>
                {e.description && (
                  <p className="text-sm text-[#475569] mt-2 leading-relaxed">{e.description}</p>
                )}

                <div className="mt-4 pt-4 border-t border-[#E2E8F0] space-y-2 text-xs text-[#64748B]">
                  <div className="flex items-center gap-2 font-medium">
                    <MapTrifold size={16} className="text-[#EA580C]" />
                    <span>{e.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#EA580C]" />
                    <span className="font-mono text-[#12304A] font-semibold">
                      {e.date} {e.time ? `· ${e.time}` : ""}
                    </span>
                  </div>
                  {e.organizer && (
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-[#64748B]" />
                      <span>Organized by {e.organizer}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white p-6 relative border border-[#E2E8F0] shadow-2xl"
              data-testid="create-event-modal"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-[#64748B] hover:text-[#12304A] p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>

              <div className="text-[10px] font-mono tracking-widest text-[#EA580C] font-bold">/ ADMINISTRATION</div>
              <h2 className="font-display font-black text-2xl text-[#12304A] mt-1">Schedule Civic Event</h2>

              <form onSubmit={handleCreateEvent} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-mono uppercase text-[#475569] font-medium">EVENT TITLE *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => { setForm({ ...form, title: e.target.value }); if (err) setErr(""); }}
                    placeholder="e.g. NH-48 Public Consultation"
                    className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#475569] font-medium">DESCRIPTION</label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => { setForm({ ...form, description: e.target.value }); if (err) setErr(""); }}
                    placeholder="What is the objective of this drive/hearing?"
                    className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-4 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#475569] font-medium">DATE *</label>
                    <input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) => { setForm({ ...form, date: e.target.value }); if (err) setErr(""); }}
                      className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-[#475569] font-medium">TIME</label>
                    <input
                      value={form.time}
                      onChange={(e) => { setForm({ ...form, time: e.target.value }); if (err) setErr(""); }}
                      placeholder="e.g. 10:30 AM"
                      className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono uppercase text-[#475569] font-medium">LOCATION / VENUE *</label>
                  <input
                    required
                    value={form.location}
                    onChange={(e) => { setForm({ ...form, location: e.target.value }); if (err) setErr(""); }}
                    placeholder="e.g. Municipal Hall, Sector 14"
                    className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-4 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-mono uppercase text-[#475569] font-medium">ORGANIZER</label>
                    <input
                      value={form.organizer}
                      onChange={(e) => { setForm({ ...form, organizer: e.target.value }); if (err) setErr(""); }}
                      placeholder="e.g. State PWD"
                      className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase text-[#475569] font-medium">STATUS</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="mt-1 w-full rounded-xl bg-white border border-[#CBD5E1] px-3 py-2 text-sm text-[#0F172A] focus:outline-none focus:border-[#F97316] shadow-sm"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="ONGOING">ONGOING</option>
                      <option value="COMPLETED">COMPLETED</option>
                    </select>
                  </div>
                </div>

                {err && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
                    <Warning size={16} className="text-red-500" /> {err}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={busy}
                  className="w-full py-3 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] disabled:opacity-50 mt-4 flex items-center justify-center gap-2 shadow-sm transition text-sm"
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
