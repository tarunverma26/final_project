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
    iconSize: [18, 18],
    iconAnchor: [9, 9],
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
  height = 420,
  onPick = null,
  pickedMarker = null,
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative"
      style={{ height }}
      data-testid="dark-map"
    >
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {onPick && <ClickHandler onPick={onPick} />}
        {pickedMarker &&
          typeof pickedMarker.lat === "number" &&
          typeof pickedMarker.lng === "number" &&
          !isNaN(pickedMarker.lat) &&
          !isNaN(pickedMarker.lng) && (
            <Marker position={[pickedMarker.lat, pickedMarker.lng]} icon={iconCritical}>
              <Popup>Picked location</Popup>
            </Marker>
          )}
        {(markers || [])
          .filter(
            (m) =>
              m &&
              typeof m.latitude === "number" &&
              typeof m.longitude === "number" &&
              !isNaN(m.latitude) &&
              !isNaN(m.longitude)
          )
          .map((m, i) => (
          <Marker key={m.id || i} position={[m.latitude, m.longitude]} icon={pickIcon(m)}>
            <Popup>
              <div style={{ fontFamily: "'IBM Plex Sans'", minWidth: 180 }}>
                <div style={{ fontWeight: 700, color: m.status === "RESOLVED" ? "#10B981" : "#F59E0B" }}>
                  {m.category}
                </div>
                <div style={{ fontSize: 12 }}>{m.road_name || "Unknown road"}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  Severity: {m.severity} · Status: {m.status}
                </div>
                {m.status === "RESOLVED" && (
                  <div style={{ fontSize: 10, color: "#10B981", marginTop: 4, fontWeight: 600 }}>
                    ✓ Healed by the city
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {onPick && (
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full glass text-[11px] font-mono text-amber-300 pointer-events-none">
          Tip: click the map to drop a pin
        </div>
      )}
    </div>
  );
}
