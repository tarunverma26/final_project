import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import WeatherAtmosphere from "@/components/WeatherAtmosphere";
import { useAuth } from "@/context/AuthContext";
import { api, formatApiErrorDetail } from "@/lib/api";
import {
  ShieldCheck, Buildings, MapPin, CheckCircle, Warning,
  Camera, UploadSimple, ArrowClockwise, CircleNotch, X,
  Clock, Sparkle, Eye, CaretRight
} from "@phosphor-icons/react";

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0;
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function extractExifGps(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const view = new DataView(e.target.result);
        if (view.getUint16(0, false) !== 0xffd8) return resolve(null);
        let length = view.byteLength,
          offset = 2;
        while (offset < length) {
          const marker = view.getUint16(offset, false);
          offset += 2;
          if (marker === 0xffe1) {
            if (view.getUint32(offset + 2, false) === 0x45786966) {
              const tiffOffset = offset + 6;
              const littleEndian = view.getUint16(tiffOffset, false) === 0x4949;
              const ifdOffset = view.getUint32(tiffOffset + 4, littleEndian);
              const numEntries = view.getUint16(tiffOffset + ifdOffset, littleEndian);
              let gpsOffset = 0;
              for (let i = 0; i < numEntries; i++) {
                const entryOffset = tiffOffset + ifdOffset + 2 + i * 12;
                const tag = view.getUint16(entryOffset, littleEndian);
                if (tag === 0x8825) {
                  gpsOffset = view.getUint32(entryOffset + 8, littleEndian);
                  break;
                }
              }
              if (gpsOffset) {
                const numGpsEntries = view.getUint16(tiffOffset + gpsOffset, littleEndian);
                let latRef = "N",
                  lonRef = "E",
                  latVal = null,
                  lonVal = null;
                for (let i = 0; i < numGpsEntries; i++) {
                  const entryOffset = tiffOffset + gpsOffset + 2 + i * 12;
                  const tag = view.getUint16(entryOffset, littleEndian);
                  if (tag === 1) {
                    latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                  } else if (tag === 3) {
                    lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
                  } else if (tag === 2) {
                    const valOffset = view.getUint32(entryOffset + 8, littleEndian);
                    const deg =
                      view.getUint32(tiffOffset + valOffset, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 4, littleEndian);
                    const min =
                      view.getUint32(tiffOffset + valOffset + 8, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 12, littleEndian);
                    const sec =
                      view.getUint32(tiffOffset + valOffset + 16, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 20, littleEndian);
                    latVal = deg + min / 60 + sec / 3600;
                  } else if (tag === 4) {
                    const valOffset = view.getUint32(entryOffset + 8, littleEndian);
                    const deg =
                      view.getUint32(tiffOffset + valOffset, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 4, littleEndian);
                    const min =
                      view.getUint32(tiffOffset + valOffset + 8, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 12, littleEndian);
                    const sec =
                      view.getUint32(tiffOffset + valOffset + 16, littleEndian) /
                      view.getUint32(tiffOffset + valOffset + 20, littleEndian);
                    lonVal = deg + min / 60 + sec / 3600;
                  }
                }
                if (latVal !== null && lonVal !== null) {
                  if (latRef === "S") latVal = -latVal;
                  if (lonRef === "W") lonVal = -lonVal;
                  return resolve({ latitude: latVal, longitude: lonVal, source: "exif" });
                }
              }
            }
          }
          const step = view.getUint16(offset, false);
          if (step <= 0) break;
          offset += step;
        }
      } catch (err) {
        // Fallback gracefully
      }
      resolve(null);
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024));
  });
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  const [issues, setIssues] = useState([]);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Resolution verification modal state
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [resolutionPhoto, setResolutionPhoto] = useState(null);
  const [resolutionPreview, setResolutionPreview] = useState("");
  const [resolutionGeotag, setResolutionGeotag] = useState(null);
  const [geotagLoading, setGeotagLoading] = useState(false);
  const [geotagError, setGeotagError] = useState("");
  const [distanceMeters, setDistanceMeters] = useState(null);
  const [verifyingWithClaude, setVerifyingWithClaude] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [resolutionError, setResolutionError] = useState("");
  const [supervisorOverride, setSupervisorOverride] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadIssues = useCallback(async () => {
    setLoadingIssues(true);
    try {
      const { data } = await api.get("/reports");
      setIssues(data || []);
    } catch (err) {
      console.error("Failed to load authority issues:", err);
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      nav("/login");
      return;
    }
    if (user && user.role === "admin") {
      loadIssues();
    }
  }, [user, loading, nav, loadIssues]);

  const updateStatus = async (issueId, newStatus) => {
    try {
      const { data } = await api.patch(`/reports/${issueId}/status`, { status: newStatus });
      setIssues((prev) => prev.map((item) => (item.id === issueId ? data : item)));
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(data);
      }
      setSuccessToast(`Issue status updated to '${newStatus}'.`);
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      alert(formatApiErrorDetail(err.response?.data?.detail) || "Failed to update status.");
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResolutionPhoto(file);
    setResolutionPreview(URL.createObjectURL(file));
    setGeotagLoading(true);
    setGeotagError("");
    setResolutionGeotag(null);
    setDistanceMeters(null);

    // 1. Try extracting EXIF GPS first
    let geotag = await extractExifGps(file);

    // 2. If EXIF is absent or stripped by browser, capture live device geolocation
    if (!geotag) {
      if (navigator.geolocation) {
        try {
          await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                geotag = {
                  latitude: pos.coords.latitude,
                  longitude: pos.coords.longitude,
                  source: "browser_gps",
                };
                resolve();
              },
              () => resolve(),
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
          });
        } catch {
          // handled below
        }
      }
    }

    setGeotagLoading(false);

    if (geotag) {
      setResolutionGeotag(geotag);
      if (resolvingIssue?.latitude && resolvingIssue?.longitude) {
        const dist = getDistanceMeters(
          resolvingIssue.latitude,
          resolvingIssue.longitude,
          geotag.latitude,
          geotag.longitude
        );
        setDistanceMeters(dist);
      }
    } else {
      setGeotagError(
        "Could not detect geotag coordinates. Please ensure location services are enabled on your device."
      );
    }
  };

  const submitResolution = async (e) => {
    e.preventDefault();
    if (!resolutionPhoto) {
      setResolutionError("Please select a resolution proof photo.");
      return;
    }
    if (!resolutionGeotag) {
      setResolutionError("Geotag coordinates are required to verify on-site repair.");
      return;
    }

    setVerifyingWithClaude(true);
    setResolutionError("");
    setVerificationResult(null);

    try {
      // 1. Upload resolution photo
      const form = new FormData();
      form.append("file", resolutionPhoto);
      const uploadRes = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const resolvedPhotoUrl = uploadRes.data?.url;

      // 2. Submit resolution with geotag & Claude verification
      const payload = {
        photo_url: resolvedPhotoUrl,
        latitude: resolutionGeotag.latitude,
        longitude: resolutionGeotag.longitude,
        source: resolutionGeotag.source,
        supervisor_override: supervisorOverride,
      };

      const { data } = await api.post(`/reports/${resolvingIssue.id}/resolve`, payload);
      setIssues((prev) => prev.map((item) => (item.id === resolvingIssue.id ? data : item)));
      setVerificationResult(data.resolution?.claude_verification);
      setSuccessToast("Issue successfully verified and marked RESOLVED!");

      setTimeout(() => {
        setResolvingIssue(null);
        setResolutionPhoto(null);
        setResolutionPreview("");
        setResolutionGeotag(null);
        setVerificationResult(null);
        setSupervisorOverride(false);
        setSuccessToast("");
      }, 2500);
    } catch (err) {
      const errDetail = err.response?.data?.detail;
      if (typeof errDetail === "object" && errDetail?.error) {
        setResolutionError(errDetail.reasoning || errDetail.error);
        setVerificationResult({
          same_location: errDetail.same_location,
          issue_resolved: errDetail.issue_resolved,
          confidence: errDetail.confidence,
          reasoning: errDetail.reasoning,
        });
      } else {
        setResolutionError(formatApiErrorDetail(errDetail) || "Failed to resolve issue.");
      }
    } finally {
      setVerifyingWithClaude(false);
    }
  };

  const filteredIssues = issues.filter((item) => {
    if (filterStatus === "all") return true;
    const s = (item.status || "").toLowerCase();
    if (filterStatus === "reported") return s === "reported" || s === "submitted";
    if (filterStatus === "in_progress") return s === "in_progress" || s === "work_in_progress";
    if (filterStatus === "resolved") return s === "resolved";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative selection:bg-[#F97316] selection:text-white pb-20">
      <Navbar />
      <WeatherAtmosphere />

      <div className="max-w-7xl mx-auto px-6 pt-32 relative z-10">
        {/* Authority Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/80 mb-2">
              <ShieldCheck size={16} weight="bold" className="text-[#EA580C]" />
              <span className="text-[11px] font-mono tracking-widest text-[#EA580C] uppercase font-bold">
                / AUTHORITY CONTROL ROOM
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-5xl text-[#12304A] tracking-tight mt-1">
              {user?.authority ? `${user.authority} Operations Portal` : "Administration Console"}
            </h1>
            <p className="text-[#64748B] text-sm mt-1">
              Live complaint queue strictly routed to{" "}
              <span className="text-[#EA580C] font-semibold">{user?.authority || "All Jurisdictions"}</span>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadIssues}
              disabled={loadingIssues}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#CBD5E1] hover:bg-slate-50 text-xs font-mono font-medium text-[#12304A] flex items-center gap-2 shadow-xs transition"
            >
              <ArrowClockwise className={loadingIssues ? "animate-spin text-[#EA580C]" : ""} size={14} />
              Refresh Queue
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-mono font-semibold flex items-center gap-2 shadow-xs">
              <Buildings size={16} />
              <span>{user?.authority || "SUPERADMIN"}</span>
            </div>
          </div>
        </div>

        {/* Global Toast */}
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 shadow-xs font-medium"
          >
            <CheckCircle size={18} weight="bold" className="text-emerald-600" />
            <span>{successToast}</span>
          </motion.div>
        )}

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-2">
          {["all", "reported", "in_progress", "resolved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider transition ${
                filterStatus === tab
                  ? "bg-[#F97316] text-white font-semibold shadow-sm"
                  : "bg-white border border-[#CBD5E1] text-[#64748B] hover:text-[#12304A] hover:bg-slate-50 shadow-xs"
              }`}
            >
              {tab.replace("_", " ")} (
              {
                issues.filter((x) => {
                  if (tab === "all") return true;
                  const s = (x.status || "").toLowerCase();
                  if (tab === "reported") return s === "reported" || s === "submitted";
                  if (tab === "in_progress") return s === "in_progress" || s === "work_in_progress";
                  if (tab === "resolved") return s === "resolved";
                  return true;
                }).length
              }
              )
            </button>
          ))}
        </div>

        {/* Issue Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 space-y-4">
            {loadingIssues ? (
              <div className="p-12 text-center text-[#64748B] font-mono text-sm bg-white rounded-2xl border border-[#E2E8F0] shadow-sm">
                <CircleNotch size={24} className="animate-spin mx-auto mb-2 text-[#EA580C]" />
                Loading jurisdiction issues...
              </div>
            ) : filteredIssues.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white border border-[#E2E8F0] text-center text-[#64748B] font-mono text-sm shadow-sm">
                No complaints found in this status category.
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-5 rounded-2xl bg-white border transition cursor-pointer flex flex-col sm:flex-row gap-5 items-start shadow-sm ${
                    selectedIssue?.id === issue.id
                      ? "border-[#F97316] ring-2 ring-[#F97316]/20 bg-orange-50/20"
                      : "border-[#E2E8F0] hover:border-slate-300"
                  }`}
                >
                  <img
                    src={issue.photo_url || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400"}
                    alt={issue.category}
                    className="w-full sm:w-36 h-28 object-cover rounded-xl shrink-0 border border-[#E2E8F0]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-display font-black text-lg text-[#12304A]">
                        {issue.category}
                      </span>
                      <StatusBadge status={issue.status} />
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-50 text-red-700 border border-red-200 font-medium">
                        {issue.severity}
                      </span>
                    </div>

                    <div className="text-xs text-[#64748B] font-mono mt-1 flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-[#EA580C]" />
                      <span className="truncate">{issue.road_name || "Unassigned road segment"}</span>
                    </div>

                    <p className="text-xs text-[#475569] mt-2 line-clamp-2 leading-relaxed">
                      {issue.description || "Citizen reported road distress."}
                    </p>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E2E8F0] text-[11px] font-mono text-[#64748B]">
                      <span>Reported: {issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "Recent"}</span>
                      <span className="text-[#EA580C] font-semibold flex items-center gap-1">
                        View details <CaretRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Selected Issue Inspection Panel */}
          <div>
            {selectedIssue ? (
              <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-6 sticky top-28">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <span className="text-[11px] font-mono tracking-widest text-[#EA580C] uppercase font-bold">
                    / INSPECTION DETAIL
                  </span>
                  <StatusBadge status={selectedIssue.status} />
                </div>

                <div className="mt-4">
                  <img
                    src={selectedIssue.photo_url || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"}
                    alt={selectedIssue.category}
                    className="w-full h-44 object-cover rounded-xl border border-[#E2E8F0] shadow-xs"
                  />
                </div>

                <div className="mt-4">
                  <div className="font-display font-black text-xl text-[#12304A]">
                    {selectedIssue.category}
                  </div>
                  <div className="text-xs font-mono text-[#EA580C] font-medium mt-0.5">
                    {selectedIssue.road_name || "Unnamed segment"}
                  </div>
                  <p className="text-xs text-[#475569] mt-2 leading-relaxed">
                    {selectedIssue.description || "No citizen remarks provided."}
                  </p>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Jurisdiction:</span>
                    <span className="text-[#12304A] font-semibold">{selectedIssue.authority || "PWD"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Coordinates:</span>
                    <span className="text-[#EA580C] font-semibold">
                      {selectedIssue.latitude ? `${selectedIssue.latitude.toFixed(4)}, ${selectedIssue.longitude.toFixed(4)}` : "None"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Reporter:</span>
                    <span className="text-[#12304A] font-medium">{selectedIssue.user_name || "Citizen"}</span>
                  </div>
                </div>

                {/* Resolution Record (if resolved) */}
                {selectedIssue.resolution && (
                  <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                    <div className="text-xs font-mono text-emerald-800 font-bold flex items-center gap-1.5">
                      <Sparkle size={14} weight="fill" className="text-emerald-600" /> Verified Resolution Record
                    </div>
                    <img
                      src={selectedIssue.resolution.resolved_photo_url}
                      alt="Resolved proof"
                      className="mt-2 w-full h-32 object-cover rounded-lg border border-emerald-300"
                    />
                    <p className="text-[11px] text-[#475569] mt-2 leading-relaxed font-sans">
                      {selectedIssue.resolution.claude_verification?.reasoning}
                    </p>
                    <div className="mt-2 text-[10px] font-mono text-emerald-700 font-medium">
                      Audit confidence: {selectedIssue.resolution.claude_verification?.confidence}% · Dist: {selectedIssue.resolution.resolved_geotag?.distance_meters}m
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-2 pt-4 border-t border-[#E2E8F0]">
                  {selectedIssue.status !== "resolved" && (
                    <>
                      {selectedIssue.status !== "in_progress" && (
                        <button
                          onClick={() => updateStatus(selectedIssue.id, "in_progress")}
                          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-mono font-semibold text-[#12304A] flex items-center justify-center gap-2 transition"
                        >
                          <Clock size={16} /> Mark as In Progress
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setResolvingIssue(selectedIssue);
                          setResolutionPhoto(null);
                          setResolutionPreview("");
                          setResolutionGeotag(null);
                          setDistanceMeters(null);
                          setResolutionError("");
                          setVerificationResult(null);
                        }}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition shadow-md shadow-emerald-600/15"
                      >
                        <CheckCircle size={18} weight="bold" /> Verify & Resolve Issue
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white border border-[#E2E8F0] shadow-sm p-8 text-center text-[#64748B] font-mono text-xs">
                Select an issue from the queue to view full inspection details and perform verification.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resolution Verification Modal (Issue 4e) */}
      <AnimatePresence>
        {resolvingIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-[#E2E8F0] rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="font-display font-bold text-xl text-[#12304A] flex items-center gap-2">
                    <Sparkle className="text-[#0F766E]" size={20} weight="fill" />
                    AI Vision Resolution Audit
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Issue #{resolvingIssue.id.slice(0, 8)} · {resolvingIssue.road_name || "Road segment"}
                  </p>
                </div>
                <button
                  onClick={() => setResolvingIssue(null)}
                  className="text-[#64748B] hover:text-[#12304A] p-1 rounded-lg hover:bg-slate-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Side-by-side comparison banner */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-mono uppercase text-[#475569] font-medium">1. Original Citizen Photo</label>
                  <img
                    src={resolvingIssue.photo_url || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400"}
                    alt="Original"
                    className="mt-1 w-full h-36 object-cover rounded-xl border border-[#E2E8F0]"
                  />
                  <div className="mt-1 text-[11px] text-[#64748B] truncate">
                    {resolvingIssue.category} ({resolvingIssue.severity})
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-[#475569] font-medium">2. Resolution Photo Proof</label>
                  {resolutionPreview ? (
                    <img
                      src={resolutionPreview}
                      alt="Resolution"
                      className="mt-1 w-full h-36 object-cover rounded-xl border border-emerald-500/50"
                    />
                  ) : (
                    <label className="mt-1 w-full h-36 border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#F97316] transition bg-[#F8FAFC]">
                      <Camera size={28} className="text-[#64748B] mb-1" />
                      <span className="text-xs font-mono text-[#64748B]">Upload / Take Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                  {resolutionPreview && (
                    <label className="mt-1 inline-block text-[11px] text-[#EA580C] hover:underline cursor-pointer font-mono font-medium">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Geotag Distance Feedback */}
              <div className="mt-4 p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[#64748B]">Geotag Source:</span>
                  <span className="text-[#12304A] font-semibold">
                    {geotagLoading ? (
                      <span className="text-[#EA580C] animate-pulse">Acquiring GPS fix...</span>
                    ) : resolutionGeotag ? (
                      `${resolutionGeotag.source.toUpperCase()} (${resolutionGeotag.latitude.toFixed(5)}, ${resolutionGeotag.longitude.toFixed(5)})`
                    ) : (
                      "Waiting for photo upload..."
                    )}
                  </span>
                </div>

                {distanceMeters !== null && (
                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                    <span className="text-[#64748B]">Proximity to Issue:</span>
                    <span
                      className={`font-bold ${
                        distanceMeters <= 50 ? "text-emerald-700" : "text-red-600"
                      }`}
                    >
                      {distanceMeters.toFixed(1)} meters{" "}
                      {distanceMeters <= 50 ? "✓ (Within 50m limit)" : "✗ (Exceeds 50m limit)"}
                    </span>
                  </div>
                )}
              </div>

              {geotagError && (
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2 font-medium">
                  <Warning size={16} className="text-amber-600" /> {geotagError}
                </div>
              )}

              {/* Error / Audit Rejection Banner */}
              {resolutionError && (
                <div className="mt-3 p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 space-y-2">
                  <div className="font-bold flex items-center gap-1.5">
                    <Warning size={16} className="text-red-600" /> Audit Notice:
                  </div>
                  <p>{resolutionError}</p>
                  <label className="flex items-center gap-2 text-[#12304A] pt-2 cursor-pointer font-mono font-medium">
                    <input
                      type="checkbox"
                      checked={supervisorOverride}
                      onChange={(e) => setSupervisorOverride(e.target.checked)}
                      className="accent-[#F97316]"
                    />
                    <span>Apply supervisor emergency override to bypass verification</span>
                  </label>
                </div>
              )}

              {/* Verification Result Card */}
              {verificationResult && (
                <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle size={18} weight="fill" className="text-emerald-600" />
                    AI Vision Assessment
                  </div>
                  <p className="mt-2 text-[#475569] leading-relaxed font-sans">
                    {verificationResult.reasoning}
                  </p>
                  <div className="mt-2 flex gap-4 text-[11px] font-mono text-emerald-700 font-medium">
                    <span>Same Location: {verificationResult.same_location ? "YES ✓" : "NO ✗"}</span>
                    <span>Issue Resolved: {verificationResult.issue_resolved ? "YES ✓" : "NO ✗"}</span>
                    <span>Confidence: {verificationResult.confidence}%</span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="px-4 py-2.5 rounded-xl text-xs text-[#64748B] hover:text-[#12304A] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitResolution}
                  disabled={!resolutionPhoto || !resolutionGeotag || verifyingWithClaude}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 transition shadow-sm"
                >
                  {verifyingWithClaude ? (
                    <>
                      <CircleNotch className="animate-spin" size={16} />
                      Auditing with AI Vision...
                    </>
                  ) : (
                    <>
                      <Sparkle size={16} weight="fill" />
                      Verify & Mark Resolved
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  if (s === "resolved") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        RESOLVED
      </span>
    );
  }
  if (s === "in_progress" || s === "work_in_progress") {
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
        IN PROGRESS
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      REPORTED
    </span>
  );
}
