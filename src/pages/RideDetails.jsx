import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db, auth } from "../firebase";
import { predictCancellationRisk } from "../analytics/cancellationRL";

export default function RideDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [risk, setRisk] = useState(0);

  useEffect(() => {
    fetchRide();
  }, []);

  const fetchRide = async () => {

    const docRef = doc(db, "rides", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {

      const rideData = { id: docSnap.id, ...docSnap.data() };
      setRide(rideData);

      /* -------- CANCELLATION RISK -------- */

      const userData = {
        cancelled_rides: 2,
        total_rides: 10,
        trust_score: rideData.trust_score || 80
      };

      const riskScore = predictCancellationRisk(userData);
      setRisk(riskScore);
    }
  };

  const handleAccept = async () => {

    if (!auth.currentUser) return alert("Login first 🚨");

    if (ride.available_seats <= 0)
      return alert("No seats available");

    if (risk > 0.5) {
      alert("⚠ High cancellation risk user");
    }

    await updateDoc(doc(db, "rides", id), {
      accepted_by: arrayUnion(auth.currentUser.uid),
      available_seats: ride.available_seats - 1,
    });

    alert("Ride Accepted 🚀");
    fetchRide();
  };

  if (!ride) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        Loading...
      </div>
    );
  }

  /* -------- REGIONAL CALCULATIONS -------- */

  const savings = 300 - ride.price_per_seat;
  const carbonSaved = (ride.accepted_by?.length || 1) * 0.2;

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-8 text-cyan-400">
        🚗 Ride Details
      </h1>

      <div className="bg-gray-900 p-8 rounded-2xl border border-cyan-500/20 relative">

        {/* -------- TAGS -------- */}

        <div className="flex flex-wrap gap-2 mb-4">

          {ride.demand_index > 2 && (
            <span className="bg-yellow-500 px-2 py-1 text-xs rounded">
              🌍 High Demand
            </span>
          )}

          {ride.price_per_seat < 150 && (
            <span className="bg-green-500 px-2 py-1 text-xs rounded">
              💰 Budget Friendly
            </span>
          )}

          {ride.accepted_by?.length > 2 && (
            <span className="bg-green-400 px-2 py-1 text-xs rounded">
              🌱 Eco Friendly
            </span>
          )}

          {ride.women_only && (
            <span className="bg-pink-500 px-2 py-1 text-xs rounded">
              💜 Women Safe
            </span>
          )}

        </div>

        {/* ROUTE */}
        <h2 className="text-xl font-bold text-pink-400">
          {ride.origin} → {ride.destination}
        </h2>

        {/* DATE */}
        <p className="mt-3">
          📅 {ride?.departure_time?.seconds
            ? new Date(ride.departure_time.seconds * 1000).toLocaleString()
            : "N/A"}
        </p>

        {/* SEATS */}
        <p>👥 Seats Left: {ride.available_seats}</p>

        {/* PRICE */}
        <p className="text-emerald-400 font-bold mt-2">
          ₹{ride.price_per_seat}
        </p>

        {/* SAVINGS */}
        <p className="text-green-400 mt-2">
          💰 You save ₹{savings}
        </p>

        {/* CARBON */}
        <p className="text-green-300 text-xs mt-1">
          🌱 Saves {carbonSaved.toFixed(2)} kg CO₂
        </p>

        {/* RISK */}
        {risk > 0.5 && (
          <p className="text-red-400 font-semibold mt-2">
            ⚠ High Cancellation Risk
          </p>
        )}

        <hr className="my-6 border-gray-700" />

        {/* DRIVER */}
        <h3 className="text-cyan-400 font-semibold mb-2">
          👤 Driver Details
        </h3>

        <p>Name: {ride.driver_name}</p>
        <p>Vehicle: {ride.vehicle}</p>
        <p>Phone: {ride.phone}</p>

        <p className="text-cyan-400">
          Trust Score: {ride.trust_score || 85}%
        </p>

        <hr className="my-6 border-gray-700" />

        {/* MAP */}
        <h3 className="text-cyan-400 font-semibold mb-3">
          🗺 Route Map
        </h3>

        <iframe
          title="map"
          width="100%"
          height="300"
          className="rounded-xl"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=80.2,12.8,80.3,13.1&layer=mapnik&marker=13.0827,80.2707`}
        ></iframe>

        {/* BUTTONS */}
        <div className="flex gap-6 mt-8">

          <button
            onClick={handleAccept}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 py-3 rounded-xl font-semibold hover:scale-105 transition"
          >
            Accept Ride 🚀
          </button>

          <button
            onClick={() => navigate(`/chat/${ride.id}`)}
            className="flex-1 bg-purple-600 py-3 rounded-xl hover:bg-purple-700 transition"
          >
            Chat 💬
          </button>

        </div>

      </div>
    </div>
  );
}