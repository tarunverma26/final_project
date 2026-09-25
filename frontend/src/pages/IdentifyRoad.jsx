import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import DarkMap from "@/components/DarkMap";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import AuthorityConfirmCard from "@/components/AuthorityConfirmCard";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  Crosshair, MapPin, Buildings, Warning, ArrowSquareOut,
  PencilSimple, CheckCircle, X, CircleNotch
} from "@phosphor-icons/react";

export default function IdentifyRoad() {
  const { user } = useAuth();
  const [loc, setLoc] = useState(null);
  const [info, setInfo] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [err, setErr] = useState("");

  // Road overlay edit modal states
  const [isEditing, setIsEditing] = useState(false);
  const [savingOverlay, setSavingOverlay] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editForm, setEditForm] = useState({
    road_name: "",
    road_number: "",
    authority: "",
    contractor: "",
    surface: "",
    maxspeed: "",
    lanes: "",
    construction_year: "",
    last_maintenance: "",
  });

  const lookup = async (lat, lng) => {
    setScanning(true);
    setErr("");
    setInfo(null);
    try {
      const { data } = await api.get("/roads/identify", { params: { lat, lng } });
      setTimeout(() => {
        setInfo(data);
        setScanning(false);
      }, 900);
    } catch (e) {
      setErr("Unable to identify road. Try dropping a pin again.");
      setScanning(false);
    }
  };

  const useGps = () => {
    if (!navigator.geolocation) {
      setErr("Geolocation is not supported by your browser. Please drop a pin on the map.");
      return;
    }

    setGettingLocation(true);
    setErr("");
    setInfo(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setGettingLocation(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLoc({ lat, lng });
        await lookup(lat, lng);
      },
      (error) => {
        setGettingLocation(false);
        let msg = "Could not acquire GPS position. Please drop a pin on the map.";
        if (error.code === 1) {
          msg = "Location permission denied. Please allow location access or click the map.";
        } else if (error.code === 2) {
          msg = "Position unavailable. Please click anywhere on the map to select your road.";
        } else if (error.code === 3) {
          msg = "Location request timed out. Please try again or drop a pin on the map.";
        }
        setErr(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const onMapPick = async ({ lat, lng }) => {
    setLoc({ lat, lng });
    await lookup(lat, lng);
  };

  const openEditModal = () => {
    if (!info) return;
    setEditForm({
      road_name: info.road_name || "",
      road_number: info.road_number || "",
      authority: info.authority || (user?.authority || ""),
      contractor: info.contractor || "",
      surface: info.surface || "",
      maxspeed: info.maxspeed || "",
      lanes: info.lanes || "",
      construction_year: info.construction_year || "",
      last_maintenance: info.last_maintenance || "",
    });
    setEditSuccess("");
    setIsEditing(true);
  };

  const saveOverlay = async (e) => {
    e.preventDefault();
    if (!info) return;
    setSavingOverlay(true);
    setErr("");
    try {
      const osmId = info.osm_id || info.segment_key || "unknown";
      const { data } = await api.put(`/roads/overlay/${osmId}`, editForm);
      setInfo((prev) => ({
        ...prev,
        ...data,
        has_overlay: true,
      }));
      setEditSuccess("Road profile overlay updated successfully!");
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess("");
      }, 1000);
    } catch (err) {
      setErr(err.response?.data?.detail || "Failed to update road overlay.");
    } finally {
      setSavingOverlay(false);
    }
  };

  // Admin authority check: Admin can only edit roads under their own authority
  const isAdmin = user && user.role === "admin";
  const canEditRoad =
    isAdmin &&
    (!user?.authority || !info?.authority || user.authority === info.authority);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white">
      <Navbar />
      <WeatherAtmosphere />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
          <p className="text-[11px] font-bold tracking-widest text-[#EA580C] uppercase font-mono">/ IDENTIFY ROAD</p>
        </div>
        <h1 className="font-display font-black text-4xl md:text-5xl tracking-tight text-[#12304A] mt-2">Which road are you on?</h1>
        <p className="text-[#64748B] text-base mt-2 max-w-xl">
          Use GPS or click anywhere on the map — we resolve the actual road name, authority, and infrastructure specifications in real time.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 mt-10">
          <div>
            <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6">
              <div className="flex items-center gap-3">
                <div
                  className={
                    gettingLocation || scanning
                      ? "w-4 h-4 rounded-full bg-[#F97316] animate-ping"
                      : loc
                      ? "w-4 h-4 bg-emerald-500 rounded-full ring-4 ring-emerald-100"
                      : "w-4 h-4 bg-orange-400/60 rounded-full ring-4 ring-orange-100"
                  }
                />
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#64748B] font-semibold">GPS COORDINATES</div>
                  <div className="font-mono text-[#12304A] font-semibold text-sm md:text-base mt-0.5" data-testid="identify-coords">
                    {gettingLocation ? (
                      <span className="text-[#EA580C] animate-pulse flex items-center gap-1.5">
                        <CircleNotch className="animate-spin" size={16} /> Acquiring live GPS fix...
                      </span>
                    ) : loc ? (
                      `${loc.lat.toFixed(5)}° N, ${loc.lng.toFixed(5)}° E`
                    ) : (
                      <span className="text-[#94A3B8] italic font-normal">No coordinates selected yet</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={useGps}
                disabled={gettingLocation || scanning}
                data-testid="identify-gps-btn"
                className="mt-6 w-full py-3.5 rounded-xl bg-[#F97316] text-white font-semibold hover:bg-[#EA580C] disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 transition"
              >
                {gettingLocation ? (
                  <>
                    <CircleNotch className="animate-spin" size={20} weight="bold" />
                    Getting your location...
                  </>
                ) : scanning ? (
                  <>
                    <CircleNotch className="animate-spin" size={20} weight="bold" />
                    Resolving road data...
                  </>
                ) : (
                  <>
                    <Crosshair size={20} weight="bold" />
                    Identify Road Using GPS
                  </>
                )}
              </button>
              <div className="mt-3 text-xs text-[#64748B] font-mono text-center">
                or click anywhere on the interactive map to drop a pin
              </div>
              {err && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2 font-medium">
                  <Warning size={16} className="text-red-500 flex-shrink-0" /> {err}
                </div>
              )}
            </div>

            {info && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6"
                data-testid="road-info-card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold tracking-widest text-[#EA580C]">/ ROAD PROFILE</span>
                    {info.has_overlay && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono font-semibold">
                        OFFICIAL OVERLAY
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#64748B] uppercase tracking-widest font-semibold">
                      {info.source || "openstreetmap"}
                    </span>
                    {canEditRoad && (
                      <button
                        onClick={openEditModal}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-200 text-[#EA580C] hover:bg-orange-100 text-xs font-mono font-semibold flex items-center gap-1.5 transition"
                      >
                        <PencilSimple size={13} />
                        Edit road info
                      </button>
                    )}
                  </div>
                </div>

                <div className="font-display font-black text-2xl mt-2 text-[#12304A]">
                  {info.road_name || <span className="italic text-[#94A3B8]">Unnamed segment</span>}
                </div>
                {info.display_name && (
                  <div className="text-xs text-[#64748B] mt-1">{info.display_name}</div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <Field icon={MapPin} label="Road Number / Ref" value={info.road_number} />
                  <Field icon={MapPin} label="District" value={info.district} />
                  <Field icon={MapPin} label="State" value={info.state} />
                  <Field icon={MapPin} label="Country" value={info.country} />
                  <Field icon={Warning} label="Condition" value={info.condition} accent />
                  <Field icon={Buildings} label="Authority" value={info.authority} />
                  <Field icon={Buildings} label="Contractor" value={info.contractor} />
                  <Field icon={Buildings} label="Surface" value={info.surface} />
                  <Field icon={Buildings} label="Max Speed" value={info.maxspeed} />
                  <Field icon={Buildings} label="Lanes" value={info.lanes} />
                  <Field icon={Buildings} label="Constructed" value={info.construction_year} />
                  <Field icon={Buildings} label="Last Maintenance" value={info.last_maintenance} />
                </div>

                {loc && (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}#map=18/${loc.lat}/${loc.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="identify-osm-link"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#EA580C] hover:text-[#C2410C] font-mono font-semibold"
                  >
                    Open on OpenStreetMap <ArrowSquareOut size={12} />
                  </a>
                )}
              </motion.div>
            )}

            {info && (
              <div className="mt-6">
                <AuthorityConfirmCard info={info} />
              </div>
            )}
          </div>

          <div>
            <DarkMap
              center={loc ? [loc.lat, loc.lng] : [28.4595, 77.0266]}
              zoom={15}
              onPick={onMapPick}
              pickedMarker={loc ? { lat: loc.lat, lng: loc.lng } : null}
              height={560}
            />
          </div>
        </div>
      </div>

      {/* Admin Road Profile Overlay Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#12304A]">Edit Road Profile Overlay</h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Authority overrides for OSM Way #{info?.osm_id || "current"}
                  </p>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-[#64748B] hover:text-[#12304A] p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {editSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle size={16} className="text-emerald-600" /> {editSuccess}
                </div>
              )}

              <form onSubmit={saveOverlay} className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Road Name</label>
                    <input
                      type="text"
                      value={editForm.road_name}
                      onChange={(e) => setEditForm({ ...editForm, road_name: e.target.value })}
                      placeholder="e.g. NH-48 Express Corridor"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Road Ref / Number</label>
                    <input
                      type="text"
                      value={editForm.road_number}
                      onChange={(e) => setEditForm({ ...editForm, road_number: e.target.value })}
                      placeholder="e.g. NH-48"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Governing Authority</label>
                    <input
                      type="text"
                      value={editForm.authority}
                      disabled={!!user?.authority}
                      onChange={(e) => setEditForm({ ...editForm, authority: e.target.value })}
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] disabled:bg-slate-100 disabled:opacity-75 focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Assigned Contractor</label>
                    <input
                      type="text"
                      value={editForm.contractor}
                      onChange={(e) => setEditForm({ ...editForm, contractor: e.target.value })}
                      placeholder="e.g. L&T Construction"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Surface Type</label>
                    <input
                      type="text"
                      value={editForm.surface}
                      onChange={(e) => setEditForm({ ...editForm, surface: e.target.value })}
                      placeholder="e.g. Asphalt"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Speed Limit</label>
                    <input
                      type="text"
                      value={editForm.maxspeed}
                      onChange={(e) => setEditForm({ ...editForm, maxspeed: e.target.value })}
                      placeholder="e.g. 90 km/h"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Lane Count</label>
                    <input
                      type="text"
                      value={editForm.lanes}
                      onChange={(e) => setEditForm({ ...editForm, lanes: e.target.value })}
                      placeholder="e.g. 6"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Construction Year</label>
                    <input
                      type="text"
                      value={editForm.construction_year}
                      onChange={(e) => setEditForm({ ...editForm, construction_year: e.target.value })}
                      placeholder="e.g. 2018"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#475569] font-medium">Last Maintenance</label>
                    <input
                      type="text"
                      value={editForm.last_maintenance}
                      onChange={(e) => setEditForm({ ...editForm, last_maintenance: e.target.value })}
                      placeholder="e.g. 2025-11"
                      className="mt-1 w-full bg-white border border-[#CBD5E1] rounded-xl p-2.5 text-xs text-[#0F172A] focus:border-[#F97316] outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl text-xs text-[#64748B] hover:text-[#12304A] font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingOverlay}
                    className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white font-semibold text-xs hover:bg-[#EA580C] disabled:opacity-60 flex items-center gap-1.5 shadow-sm transition"
                  >
                    {savingOverlay ? (
                      <>
                        <CircleNotch className="animate-spin" size={16} /> Saving Overlay...
                      </>
                    ) : (
                      "Save Road Overlay"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#64748B] font-mono font-medium">
        <Icon size={12} className="text-[#64748B]" /> {label}
      </div>
      <div className={`mt-1 text-sm font-medium ${accent ? "text-[#EA580C] font-semibold" : "text-[#12304A]"}`}>
        {value || <span className="italic text-[#94A3B8] font-normal">Data unavailable</span>}
      </div>
    </div>
  );
}
