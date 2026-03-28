import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

export default function FreeRideMap({ originName, destinationName }) {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  useEffect(() => {
    if (!originName || !destinationName) return;

    const geocode = async (place, setLocation) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          place
        )}`
      );
      const data = await response.json();
      if (data.length > 0) {
        setLocation([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    };

    geocode(originName, setOrigin);
    geocode(destinationName, setDestination);
  }, [originName, destinationName]);

  if (!origin) return <div className="text-white">Loading Map...</div>;

  return (
    <div className="rounded-xl overflow-hidden border border-cyan-500/20 shadow-xl">
      <MapContainer
        center={origin}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="© OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {origin && (
          <Marker position={origin}>
            <Popup>📍 {originName}</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination}>
            <Popup>🏁 {destinationName}</Popup>
          </Marker>
        )}

        {origin && destination && (
          <Polyline
            positions={[origin, destination]}
            pathOptions={{ color: "#00f5ff", weight: 4 }}
          />
        )}
      </MapContainer>
    </div>
  );
}