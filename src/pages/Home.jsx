import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedBackground from "../components/AnimatedBackground";

<AnimatedBackground />

import {
  Car,
  Clock,
  Users,
  Search,
  Plus,
  Sparkles,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

export default function Home() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const ridesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setRides(ridesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rides:", error);
      setLoading(false);
    }
  };

  const formatDateTime = (departure_time) => {
    if (!departure_time) return { date: "Date not set", time: "" };

    let rideDate;

    if (departure_time.seconds) {
      rideDate = new Date(departure_time.seconds * 1000);
    } else {
      rideDate = new Date(departure_time);
    }

    if (isNaN(rideDate)) {
      return { date: "Invalid Date", time: "" };
    }

    return {
      date: rideDate.toLocaleDateString(),
      time: rideDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="relative min-h-screen text-white overflow-hidden">

      {/* 🌌 Animated Background */}
      <AnimatedBackground />

      {/* ================= HERO SECTION ================= */}
      <section className="relative py-20 text-center z-10">

        <Badge className="mb-4 bg-cyan-500/20 text-cyan-400 border-cyan-500/50">
          <Sparkles className="w-3 h-3 mr-1" />
          Campus Ride Sharing 🚗
        </Badge>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Share Rides{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.7)]">
            Save Together
          </span>
        </h1>

        <p className="text-gray-400 mb-10">
          Safe, affordable, and eco-friendly campus transportation.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">

          <Link to="/findrides">
            <button className="px-8 py-4 rounded-xl 
              bg-gradient-to-r from-cyan-500 to-pink-500 
              text-white font-semibold text-lg
              shadow-[0_0_25px_rgba(6,182,212,0.4)]
              hover:shadow-[0_0_40px_rgba(236,72,153,0.7)]
              hover:scale-105 transition-all duration-300">
              <Search className="w-5 h-5 inline mr-2" />
              Find a Ride
            </button>
          </Link>

          <Link to="/postride">
            <button className="px-8 py-4 rounded-xl 
              bg-gradient-to-r from-cyan-500 to-pink-500 
              text-white font-semibold text-lg
              shadow-[0_0_25px_rgba(6,182,212,0.4)]
              hover:shadow-[0_0_40px_rgba(236,72,153,0.7)]
              hover:scale-105 transition-all duration-300">
              <Plus className="w-5 h-5 inline mr-2" />
              Offer a Ride
            </button>
          </Link>

          <Link to="/myrides">
            <button className="px-8 py-4 rounded-xl 
              bg-gradient-to-r from-cyan-500 to-pink-500 
              text-white font-semibold text-lg
              shadow-[0_0_25px_rgba(6,182,212,0.4)]
              hover:shadow-[0_0_40px_rgba(236,72,153,0.7)]
              hover:scale-105 transition-all duration-300">
              🚗 My Rides
            </button>
          </Link>

        </div>
      </section>

      {/* ================= AVAILABLE RIDES ================= */}
      <section className="relative max-w-7xl mx-auto px-4 py-16 z-10">

        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold">Available Rides 🚀</h2>
            <p className="text-gray-400">Recently posted rides</p>
          </div>

          <Link to="/findrides">
            <Button variant="ghost" className="text-cyan-400">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

          {loading ? (
            <p className="text-gray-400">Loading rides...</p>
          ) : rides.length > 0 ? (
            rides.slice(0, 6).map((ride, index) => {
              const { date, time } = formatDateTime(ride.departure_time);

              return (
                <motion.div
                  key={ride.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-cyan-500/20 
                    shadow-[0_0_40px_rgba(6,182,212,0.2)]
                    hover:shadow-[0_0_60px_rgba(236,72,153,0.4)]
                    transition-all duration-500 hover:-translate-y-3 hover:scale-105">

                    <CardContent className="p-6">

                      <h3 className="text-lg font-bold mb-4">
                        🚗{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                          {ride.origin}
                        </span>{" "}
                        
                        <span className="bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent ml-1">
                          {ride.destination}
                        </span>
                      </h3>

                      <div className="space-y-3 text-gray-400 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {date} {time && `• ${time}`}
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {ride.available_seats} seats
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xl font-bold text-emerald-400">
                          ₹{ride.price_per_seat}
                        </span>

                        <Link to="/findrides">
                          <Button className="bg-gradient-to-r from-cyan-500 to-pink-500">
                            🚀 Book
                          </Button>
                        </Link>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12 text-gray-400">
              <Car className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No rides available at the moment</p>
            </div>
          )}

        </div>
      </section>

      {/* 🚨 SOS BUTTON */}
      <button
        onClick={() => alert("🚨 SOS Alert Triggered! Stay Calm.")}
        className="fixed bottom-6 right-6 z-50 
                   bg-red-600 hover:bg-red-700 
                   text-white font-bold 
                   w-16 h-16 rounded-full 
                   shadow-lg shadow-red-500/40
                   hover:scale-110 transition-all duration-300"
      >
        🚨
      </button>

    </div>
  );
}