import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { calculateDistance } from "../analytics/safetyUtils";

export default function Safety() {

  const [contacts, setContacts] = useState(["", ""]);
  const [tracking, setTracking] = useState(false);

  let watchId = null;

  /* -------- SAVE CONTACTS -------- */
  const saveContacts = async () => {

    if (!auth.currentUser) return alert("Login first");

    await updateDoc(doc(db, "users", auth.currentUser.uid), {
      emergency_contacts: contacts
    });

    alert("Contacts Saved ✅");
  };

  /* -------- START LIVE TRACKING -------- */
  const startTracking = () => {

    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setTracking(true);

    watchId = navigator.geolocation.watchPosition(async (pos) => {

      const { latitude, longitude } = pos.coords;

      console.log("Live Location:", latitude, longitude);

      /* SAVE TO FIREBASE */
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        live_location: { latitude, longitude }
      });

      /* -------- ROUTE DEVIATION CHECK -------- */

      const expected = {
        lat: 13.0827,  // example Chennai
        lng: 80.2707
      };

      const distance = calculateDistance(
        latitude,
        longitude,
        expected.lat,
        expected.lng
      );

      if (distance > 2) {
        alert("🚨 Route deviation detected!");
      }

    });
  };

  /* -------- STOP TRACKING -------- */
  const stopTracking = () => {
    navigator.geolocation.clearWatch(watchId);
    setTracking(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold text-cyan-400 mb-6">
        🛡 Safety Center
      </h1>

      {/* CONTACTS */}
      <div className="bg-gray-900 p-6 rounded-xl mb-6">

        <h2 className="text-xl mb-4">Trusted Contacts</h2>

        <input
          placeholder="Contact 1"
          className="w-full p-2 mb-3 bg-gray-800 rounded"
          value={contacts[0]}
          onChange={(e) =>
            setContacts([e.target.value, contacts[1]])
          }
        />

        <input
          placeholder="Contact 2"
          className="w-full p-2 mb-3 bg-gray-800 rounded"
          value={contacts[1]}
          onChange={(e) =>
            setContacts([contacts[0], e.target.value])
          }
        />

        <button
          onClick={saveContacts}
          className="bg-green-500 px-4 py-2 rounded"
        >
          Save Contacts
        </button>

      </div>

      {/* LIVE TRACKING */}
      <div className="bg-gray-900 p-6 rounded-xl">

        <h2 className="text-xl mb-4">Live Location Sharing</h2>

        {!tracking ? (
          <button
            onClick={startTracking}
            className="bg-cyan-500 px-4 py-2 rounded"
          >
            Start Tracking 📍
          </button>
        ) : (
          <button
            onClick={stopTracking}
            className="bg-red-500 px-4 py-2 rounded"
          >
            Stop Tracking ❌
          </button>
        )}

      </div>

    </div>
  );
}