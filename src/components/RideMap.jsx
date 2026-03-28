import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

export default function RideMap({ origin, destination }) {
  const [originPos, setOriginPos] = useState(null);
  const [destinationPos, setDestinationPos] = useState(null);

  useEffect(() => {
    const getCoordinates = async (place, setter) => {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        setter([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    };

    if (origin) getCoordinates(origin, setOriginPos);
    if (destination) getCoordinates(destination, setDestinationPos);
  }, [origin, destination]);

  if (!originPos || !destinationPos) {
    return (
      <div className="text-gray-400 text-center py-6">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={originPos}
      zoom={10}
      style={{ height: "400px", width: "100%" }}
      className="rounded-2xl overflow-hidden"
    >
      <TileLayer
        attribution='© OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={originPos}>
        <Popup>Origin: {origin}</Popup>
      </Marker>

      <Marker position={destinationPos}>
        <Popup>Destination: {destination}</Popup>
      </Marker>

      <Polyline positions={[originPos, destinationPos]} color="cyan" />
    </MapContainer>
  );
}