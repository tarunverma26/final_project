import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";

const potholeIcon = new L.DivIcon({
  className: "",
  html: '<div class="roadwatch-marker"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
const criticalIcon = new L.DivIcon({
  className: "",
  html: '<div class="roadwatch-marker critical"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

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
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {onPick && <ClickHandler onPick={onPick} />}
        {pickedMarker && (
          <Marker position={[pickedMarker.lat, pickedMarker.lng]} icon={criticalIcon}>
            <Popup>Picked location</Popup>
          </Marker>
        )}
        {markers.map((m, i) => (
          <Marker
            key={m.id || i}
            position={[m.latitude, m.longitude]}
            icon={m.severity === "CRITICAL" || m.severity === "HIGH" ? criticalIcon : potholeIcon}
          >
            <Popup>
              <div style={{ fontFamily: "'IBM Plex Sans'", minWidth: 180 }}>
                <div style={{ fontWeight: 700, color: "#F59E0B" }}>{m.category}</div>
                <div style={{ fontSize: 12 }}>{m.road_name || "Unknown road"}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                  Severity: {m.severity} · Status: {m.status}
                </div>
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
