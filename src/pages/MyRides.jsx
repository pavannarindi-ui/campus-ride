import React, { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  arrayRemove,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "../firebase";

export default function MyRides() {
  const [postedRides, setPostedRides] = useState([]);
  const [acceptedRides, setAcceptedRides] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(collection(db, "rides"), (snapshot) => {
      const ridesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const myPosted = ridesData.filter(
        (ride) => ride.created_by === auth.currentUser.uid
      );

      const myAccepted = ridesData.filter(
        (ride) =>
          Array.isArray(ride.accepted_by) &&
          ride.accepted_by.includes(auth.currentUser.uid)
      );

      setPostedRides(myPosted);
      setAcceptedRides(myAccepted);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return "";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  // 🔥 Cancel Posted Ride (Delete Ride)
  const handleCancelPostedRide = async (rideId) => {
    await deleteDoc(doc(db, "rides", rideId));
  };

  // 🔥 Cancel Accepted Ride (Remove from accepted_by)
  const handleCancelAcceptedRide = async (ride) => {
    const rideRef = doc(db, "rides", ride.id);

    await updateDoc(rideRef, {
      accepted_by: arrayRemove(auth.currentUser.uid),
      available_seats: ride.available_seats + 1,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl font-bold mb-10 bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
        🚗 My Rides
      </h1>

      {/* ================= POSTED RIDES ================= */}
      <h2 className="text-xl font-semibold mb-4 text-cyan-400">
        🎯 Rides Posted By Me
      </h2>

      {postedRides.length === 0 ? (
        <p className="text-gray-400 mb-8">No rides posted yet</p>
      ) : (
        postedRides.map((ride) => (
          <div key={ride.id} className="bg-gray-900 p-5 rounded-xl mb-4 border border-cyan-500/20">
            <p className="font-bold text-pink-400">
              {ride.origin} → {ride.destination}
            </p>
            <p>{formatDate(ride.departure_time)}</p>
            <p>Seats Left: {ride.available_seats}</p>

            <button
              onClick={() => handleCancelPostedRide(ride.id)}
              className="mt-3 px-4 py-2 bg-red-600 rounded-lg"
            >
              Cancel Ride ❌
            </button>
          </div>
        ))
      )}

      {/* ================= ACCEPTED RIDES ================= */}
      <h2 className="text-xl font-semibold mt-10 mb-4 text-pink-400">
        🎟 Rides Accepted By Me
      </h2>

      {acceptedRides.length === 0 ? (
        <p className="text-gray-400">No rides accepted yet</p>
      ) : (
        acceptedRides.map((ride) => (
          <div key={ride.id} className="bg-gray-900 p-5 rounded-xl mb-4 border border-pink-500/20">
            <p className="font-bold text-cyan-400">
              {ride.origin} → {ride.destination}
            </p>
            <p>{formatDate(ride.departure_time)}</p>

            <button
              onClick={() => handleCancelAcceptedRide(ride)}
              className="mt-3 px-4 py-2 bg-red-500 rounded-lg"
            >
              Cancel My Booking ❌
            </button>
          </div>
        ))
      )}
    </div>
  );
}