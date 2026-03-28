import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { auth } from "../firebase";

import { gameTheoryPricing } from "../analytics/gamePricing";
import { reinforcementPricing } from "../analytics/reinforcementPricing";

import {
  collection,
  addDoc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function PostRide() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [ride, setRide] = useState({
    driver_name: "",
    vehicle: "",
    origin: "",
    destination: "",
    departure_date: "",
    departure_time: "09:00",
    seats: 1,
    price: "",
    phone: "",
    women_only: false
  });

  const postRide = async () => {

    try {

      /* -------- VALIDATION -------- */

      if (!auth.currentUser) {
        alert("Please login first 🚨");
        return;
      }

      if (
        !ride.driver_name ||
        !ride.vehicle ||
        !ride.origin ||
        !ride.destination ||
        !ride.departure_date ||
        !ride.price ||
        !ride.phone
      ) {
        alert("Please fill all fields 🚨");
        return;
      }

      setLoading(true);

      const dateTime = new Date(
        `${ride.departure_date}T${ride.departure_time}`
      );

      /* -------- GAME THEORY PRICE -------- */

      const demandIndex = 1.5;

      const gamePrice = gameTheoryPricing({
        basePrice: Number(ride.price),
        demandIndex: demandIndex,
        totalSeats: Number(ride.seats)
      });

      /* -------- REINFORCEMENT LEARNING -------- */

      const strategyStats = {
        LOW: { reward: 500 },
        MEDIUM: { reward: 900 },
        HIGH: { reward: 300 }
      };

      const rlResult = reinforcementPricing({
        basePrice: gamePrice, // RL improves game theory output
        strategyStats
      });

      const finalPrice = rlResult.price;
      const strategyUsed = rlResult.strategy;

      console.log("Base Price:", ride.price);
      console.log("Game Price:", gamePrice);
      console.log("Final RL Price:", finalPrice);
      console.log("Strategy:", strategyUsed);

      /* -------- SAVE TO FIRESTORE -------- */

      await addDoc(collection(db, "rides"), {

        driver_name: ride.driver_name,
        vehicle: ride.vehicle,
        origin: ride.origin,
        destination: ride.destination,

        departure_time: Timestamp.fromDate(dateTime),

        available_seats: Number(ride.seats),
        total_seats: Number(ride.seats),

        price_per_seat: finalPrice, // 🔥 FINAL PRICE

        phone: ride.phone,
        women_only: ride.women_only,

        trust_score: Math.floor(Math.random() * 20) + 80,

        pricing_type: "game_theory + reinforcement_learning",
        pricing_strategy: strategyUsed,

        created_at: Timestamp.now(),
        created_by: auth.currentUser.uid,
        accepted_by: []

      });

      setLoading(false);

      alert(`Ride Posted 🚀 Final Price: ₹${finalPrice}`);

      navigate("/home");

    } catch (error) {

      console.error("FULL ERROR:", error);
      alert(error.message);

      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >

        <Card className="bg-gray-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl">

          <CardHeader>
            <CardTitle className="text-3xl text-cyan-400">
              🚗 Post a Ride
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">

            {/* DRIVER NAME */}
            <div>
              <Label className="text-cyan-400">Driver Name</Label>
              <Input
                placeholder="Your Name"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.driver_name}
                onChange={(e) =>
                  setRide({ ...ride, driver_name: e.target.value })
                }
              />
            </div>

            {/* VEHICLE */}
            <div>
              <Label className="text-cyan-400">Vehicle</Label>
              <Input
                placeholder="Swift / Activa / i20"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.vehicle}
                onChange={(e) =>
                  setRide({ ...ride, vehicle: e.target.value })
                }
              />
            </div>

            {/* FROM */}
            <div>
              <Label className="text-cyan-400">From</Label>
              <Input
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.origin}
                onChange={(e) =>
                  setRide({ ...ride, origin: e.target.value })
                }
              />
            </div>

            {/* TO */}
            <div>
              <Label className="text-cyan-400">To</Label>
              <Input
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.destination}
                onChange={(e) =>
                  setRide({ ...ride, destination: e.target.value })
                }
              />
            </div>

            {/* DATE */}
            <div>
              <Label className="text-cyan-400">Date</Label>
              <Input
                type="date"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.departure_date}
                onChange={(e) =>
                  setRide({ ...ride, departure_date: e.target.value })
                }
              />
            </div>

            {/* TIME */}
            <div>
              <Label className="text-cyan-400">Time</Label>
              <Input
                type="time"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.departure_time}
                onChange={(e) =>
                  setRide({ ...ride, departure_time: e.target.value })
                }
              />
            </div>

            {/* SEATS */}
            <div>
              <Label className="text-cyan-400">Seats</Label>
              <Input
                type="number"
                min="1"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.seats}
                onChange={(e) =>
                  setRide({ ...ride, seats: e.target.value })
                }
              />
            </div>

            {/* PRICE */}
            <div>
              <Label className="text-cyan-400">Base Price (₹)</Label>
              <Input
                type="number"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.price}
                onChange={(e) =>
                  setRide({ ...ride, price: e.target.value })
                }
              />
              <p className="text-xs text-yellow-400 mt-1">
                ⚡ Price optimized 
              </p>
            </div>

            {/* PHONE */}
            <div>
              <Label className="text-cyan-400">Mobile Number</Label>
              <Input
                type="tel"
                className="bg-black border border-cyan-500/40 text-white"
                value={ride.phone}
                onChange={(e) =>
                  setRide({ ...ride, phone: e.target.value })
                }
              />
            </div>

            {/* WOMEN ONLY */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={ride.women_only}
                onChange={(e) =>
                  setRide({ ...ride, women_only: e.target.checked })
                }
              />
              <Label className="text-pink-400 font-semibold">
                Women Only Ride 💜
              </Label>
            </div>

            <Button
              onClick={postRide}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white shadow-lg hover:scale-105 transition"
            >
              {loading ? "Posting..." : "🚀 Post Ride"}
            </Button>

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}