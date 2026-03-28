import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import "leaflet.heat";

export default function Heatmap() {

  const [points, setPoints] = useState([]);

  useEffect(() => {
    loadHeatmap();
  }, []);

  const loadHeatmap = async () => {

    const snapshot = await getDocs(collection(db, "rides"));

    const rides = snapshot.docs.map(doc => doc.data());

    const locationCount = {};

    rides.forEach((ride) => {

      const key = ride.origin;

      locationCount[key] = (locationCount[key] || 0) + 1;
    });

    /* 📍 Map locations (you can expand this) */
    const locationCoords = {
      "Chennai": [13.0827, 80.2707],
      "Tambaram": [12.9249, 80.1000],
      "VIT Chennai": [12.8406, 80.1533],
      "T Nagar": [13.0418, 80.2341]
    };

    const heatPoints = Object.keys(locationCount).map((loc) => {

      const coords = locationCoords[loc] || [13.0827, 80.2707];

      return [
        coords[0],
        coords[1],
        locationCount[loc] * 0.5
      ];
    });

    setPoints(heatPoints);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl text-cyan-400 mb-6">
        🔥 Demand Heatmap
      </h1>

      <MapContainer
        center={[13.0827, 80.2707]}
        zoom={11}
        style={{ height: "500px", width: "100%" }}
      >

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

      </MapContainer>

    </div>
  );
}