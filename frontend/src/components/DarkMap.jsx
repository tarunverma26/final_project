import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

const IN_PROGRESS_STATUSES = new Set([
  "UNDER_REVIEW", "FORWARDED", "ASSIGNED",
  "WORK_PLANNED", "WORK_IN_PROGRESS", "RESOLUTION", "VERIFIED",
]);

function makeIcon(cls) {
  return new L.DivIcon({
    className: "",
    html: `<div class="roadwatch-marker ${cls}"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

const iconResolved = makeIcon("resolved");
const iconInProgress = makeIcon("in-progress");
const iconCritical = makeIcon("critical");
const iconDefault = makeIcon("");

function pickIcon(m) {
  if (m.status === "RESOLVED") return iconResolved;
  if (IN_PROGRESS_STATUSES.has(m.status)) return iconInProgress;
  if (m.severity === "CRITICAL" || m.severity === "HIGH") return iconCritical;
  return iconDefault;
}

function ClickHandler({ onPick }) {
  useMapEvents({ click(e) { if (onPick) onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return null;
}

export default function DarkMap({
  center = [28.4595, 77.0266],
  zoom = 12,
  markers = [],
  height = 440,
  onPick = null,
  pickedMarker = null,
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-[#E2E8F0] shadow-sm bg-white relative"
      style={{ height }}
      data-testid="dark-map"
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", background: "#F8FAFC" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onPick && <ClickHandler onPick={onPick} />}
        {pickedMarker && (
          <Marker position={[pickedMarker.lat, pickedMarker.lng]} icon={iconCritical}>
            <Popup>
              <div className="font-sans text-xs p-1">
                <strong className="text-[#12304A]">Selected GPS Point</strong>
              </div>
            </Popup>
          </Marker>
        )}
        {markers.map((m, i) => (
          <Marker key={m.id || i} position={[m.latitude, m.longitude]} icon={pickIcon(m)}>
            <Popup>
              <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minWidth: 200, padding: "2px" }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: m.status === "RESOLVED" ? "#16A34A" : "#12304A",
                    }}
                  >
                    {m.category}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontFamily: "monospace",
                      padding: "2px 6px",
                      borderRadius: 4,
                      backgroundColor:
                        m.severity === "CRITICAL"
                          ? "#FEE2E2"
                          : m.status === "RESOLVED"
                          ? "#DCFCE7"
                          : "#FEF3C7",
                      color:
                        m.severity === "CRITICAL"
                          ? "#DC2626"
                          : m.status === "RESOLVED"
                          ? "#16A34A"
                          : "#D97706",
                      fontWeight: 600,
                    }}
                  >
                    {m.status === "RESOLVED" ? "RESOLVED" : m.severity}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>
                  {m.road_name || "Municipal Corridor"}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", borderTop: "1px solid #E2E8F0", paddingTop: 4 }}>
                  Authority: <strong style={{ color: "#12304A" }}>{m.authority || "PWD Gurugram"}</strong>
                </div>
                {m.status === "RESOLVED" && (
                  <div style={{ fontSize: 11, color: "#16A34A", marginTop: 4, fontWeight: 600 }}>
                    ✓ Verified & Healed by Authority
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {onPick && (
        <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#CBD5E1] shadow-md text-xs font-mono font-medium text-[#12304A] pointer-events-none">
          📍 Tip: Click anywhere on the road map to drop a pin
        </div>
      )}
    </div>
  );
}
