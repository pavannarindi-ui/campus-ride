import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MessageCircle, ArrowLeft } from "lucide-react";

/* 🔥 ANALYTICS IMPORTS */
import { calculateWaitTime } from "../analytics/queueingModel";
import { calculateRideScore } from "../analytics/rideScoring";
import { selectBestRide } from "../analytics/rideMatchingRL";
import { personalizeRides } from "../analytics/personalizedRL";
import { predictCancellationRisk } from "../analytics/cancellationRL";
import { assignBestRide } from "../analytics/assignmentModel";

export default function FindRides() {

  const [rides, setRides] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {

    try {

      const q = query(
        collection(db, "rides"),
        orderBy("departure_time", "desc")
      );

      const snapshot = await getDocs(q);

      let ridesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      /* -------- STEP 1: SCORING -------- */
      ridesData = ridesData.map((ride) => ({
        ...ride,
        ride_score: calculateRideScore(ride),
      }));

      /* -------- STEP 2: RISK -------- */
      ridesData = ridesData.map((ride) => {

        const userData = {
          cancelled_rides: 2,
          total_rides: 10,
          trust_score: ride.trust_score || 80
        };

        return {
          ...ride,
          cancellation_risk: predictCancellationRisk(userData)
        };
      });

      /* -------- STEP 3: RL MATCHING -------- */
      const sortedRides = selectBestRide(ridesData);

      /* -------- STEP 4: USER PREF -------- */
      let userPref = { cheap: 0.3, fast: 0.3, trust: 0.4 };

      if (auth.currentUser) {
        const userRef = doc(db, "userPreferences", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          userPref = userSnap.data();
        }
      }

      /* -------- STEP 5: PERSONALIZATION -------- */
      const personalized = personalizeRides(sortedRides, userPref);

      /* -------- STEP 6: ASSIGNMENT MODEL 🔥 -------- */
      const assigned = assignBestRide(personalized, userPref);

      setRides(assigned);

      /* -------- STEP 7: QUEUEING MODEL 🔥 -------- */
      const arrivalRate = assigned.length;
      const serviceRate = assigned.length + 3;

      const queue = calculateWaitTime(arrivalRate, serviceRate);
      setQueueInfo(queue);

    } catch (error) {
      console.error("Error fetching rides:", error);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp?.seconds) return "N/A";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-white p-10">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-cyan-400 hover:text-pink-400 transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-4 
        bg-gradient-to-r from-cyan-400 to-pink-500 
        bg-clip-text text-transparent">
        🔍 Find Rides
      </h1>

      {/* 🔥 QUEUEING INFO */}
      {queueInfo && (
        <p className="text-yellow-400 mb-8">
          ⏱ Estimated Wait Time: {queueInfo.waitTime} mins ({queueInfo.status})
        </p>
      )}

      {/* GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">

        {rides.map((ride, index) => (

          <motion.div
            key={ride.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="relative group"
          >

            {/* 🔥 BEST ASSIGNED */}
            {index === 0 && (
              <div className="absolute top-2 right-2 bg-green-500 text-xs px-3 py-1 rounded-full">
                🎯 Best Assigned
              </div>
            )}

            {ride?.ride_score > 80 && (
              <div className="absolute top-2 left-2 bg-cyan-500 text-xs px-3 py-1 rounded-full">
                🔥 Recommended
              </div>
            )}

            {ride?.available_seats < (ride?.total_seats || 4) / 2 && (
              <div className="absolute bottom-2 left-2 bg-yellow-500 text-xs px-3 py-1 rounded-full">
                ⚡ Fast Filling
              </div>
            )}

            {ride?.cancellation_risk > 0.6 && (
              <div className="absolute bottom-2 right-2 bg-red-500 text-xs px-3 py-1 rounded-full">
                ⚠ Risky
              </div>
            )}

            {/* CARD */}
            <div
              onClick={() => navigate(`/ride/${ride.id}`)}
              className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 hover:scale-[1.02] transition cursor-pointer"
            >

              {/* ROUTE */}
              <h3 className="text-lg font-bold text-cyan-300">
                🚗 {ride.origin} → {ride.destination}
              </h3>

              {/* DATE */}
              <p className="mt-2 text-gray-300 text-sm">
                📅 {formatDateTime(ride.departure_time)}
              </p>

              {/* SEATS */}
              <p className="text-gray-300 text-sm">
                👥 {ride.available_seats} seats
              </p>

              {/* PRICE */}
              <p className="mt-3 text-xl font-bold text-green-400">
                ₹{ride.price_per_seat}
              </p>

              {/* SCORE */}
              <p className="text-xs text-cyan-300">
                Score: {ride.ride_score?.toFixed(2)}
              </p>

              {/* SAFETY */}
              {ride?.cancellation_risk > 0.6 ? (
                <p className="text-red-400 text-xs">⚠ Risky</p>
              ) : (
                <p className="text-green-400 text-xs">✔ Safe</p>
              )}

              {/* BUTTONS */}
              <div className="flex gap-3 mt-4" onClick={(e) => e.stopPropagation()}>

                <button
                  onClick={() => navigate(`/ride/${ride.id}`)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 py-2 rounded"
                >
                  View →
                </button>

                <button
                  onClick={() => navigate(`/chat/${ride.id}`)}
                  className="px-4 bg-purple-600 rounded"
                >
                  <MessageCircle size={18} />
                </button>

              </div>

            </div>

          </motion.div>
        ))}

      </div>
    </div>
  );
}