import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  Timestamp
} from "firebase/firestore";
import { db } from "../firebase";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Squads() {
  const [squads, setSquads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newSquad, setNewSquad] = useState({
    destination: "",
    pickup_point: "",
    departure_date: "",
    departure_time: "10:00",
    estimated_cost: ""
  });

  // 🔥 FETCH SQUADS
  const fetchSquads = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "squads"));
    const squadData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setSquads(squadData);
    setLoading(false);
  };

  useEffect(() => {
    fetchSquads();
  }, []);

  // 🚀 CREATE SQUAD
  const createSquad = async () => {
    if (
      !newSquad.destination ||
      !newSquad.pickup_point ||
      !newSquad.departure_date ||
      !newSquad.estimated_cost
    ) {
      alert("Please fill all fields");
      return;
    }

    const dateTime = new Date(
      `${newSquad.departure_date}T${newSquad.departure_time}`
    );

    await addDoc(collection(db, "squads"), {
      destination: newSquad.destination,
      pickup_point: newSquad.pickup_point,
      departure_time: Timestamp.fromDate(dateTime),
      estimated_cost: Number(newSquad.estimated_cost),
      members: 1,
      created_at: Timestamp.now()
    });

    setNewSquad({
      destination: "",
      pickup_point: "",
      departure_date: "",
      departure_time: "10:00",
      estimated_cost: ""
    });

    fetchSquads();
  };

  // 👥 JOIN SQUAD
  const joinSquad = async (id, currentMembers) => {
    const squadRef = doc(db, "squads", id);
    await updateDoc(squadRef, {
      members: currentMembers + 1
    });
    fetchSquads();
  };

  return (
    <div className="min-h-screen bg-black px-6 py-10 text-white">

      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-8 text-cyan-400">
        🚕 Local Squads
      </h1>

      {/* CREATE SQUAD CARD */}
      <Card className="bg-gray-900/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl mb-12">
        <CardHeader>
          <CardTitle className="text-2xl text-white">
            🚀 Create Squad
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">

          <div>
            <Label className="text-cyan-400">Destination</Label>
            <Input
              placeholder="e.g. Marina Mall"
              className="bg-black border border-cyan-500/40 text-white"
              value={newSquad.destination}
              onChange={(e) =>
                setNewSquad({ ...newSquad, destination: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="text-cyan-400">Pickup Point</Label>
            <Input
              placeholder="Main Gate"
              className="bg-black border border-cyan-500/40 text-white"
              value={newSquad.pickup_point}
              onChange={(e) =>
                setNewSquad({ ...newSquad, pickup_point: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="text-cyan-400">Date</Label>
            <Input
              type="date"
              className="bg-black border border-cyan-500/40 text-white"
              value={newSquad.departure_date}
              onChange={(e) =>
                setNewSquad({ ...newSquad, departure_date: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="text-cyan-400">Time</Label>
            <Input
              type="time"
              className="bg-black border border-cyan-500/40 text-white"
              value={newSquad.departure_time}
              onChange={(e) =>
                setNewSquad({ ...newSquad, departure_time: e.target.value })
              }
            />
          </div>

          <div>
            <Label className="text-cyan-400">Total Cost (₹)</Label>
            <Input
              type="number"
              placeholder="200"
              className="bg-black border border-cyan-500/40 text-white"
              value={newSquad.estimated_cost}
              onChange={(e) =>
                setNewSquad({ ...newSquad, estimated_cost: e.target.value })
              }
            />
          </div>

          <Button
            onClick={createSquad}
            className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 text-white hover:scale-105 transition"
          >
            🚀 Create Squad
          </Button>

        </CardContent>
      </Card>

      {/* SQUADS LIST */}
      {loading ? (
        <p className="text-gray-400">Loading squads...</p>
      ) : squads.length === 0 ? (
        <p className="text-gray-400">No squads created yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {squads.map((squad) => (
            <motion.div
              key={squad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gray-900 border border-cyan-500/20 shadow-lg hover:shadow-xl transition">
                <CardContent className="p-6 space-y-3">

                  <h2 className="text-lg font-bold text-cyan-400">
                    🚗 {squad.destination}
                  </h2>

                  <p className="text-gray-300">
                    📍 From: {squad.pickup_point}
                  </p>

                  <p className="text-gray-300">
                    🕒 {squad.departure_time?.toDate().toLocaleString()}
                  </p>

                  <p className="text-emerald-400 font-semibold">
                    💰 ₹{squad.estimated_cost}
                  </p>

                  <p className="text-pink-400">
                    👥 Members: {squad.members}
                  </p>

                  <Button
                    onClick={() =>
                      joinSquad(squad.id, squad.members)
                    }
                    className="w-full bg-gradient-to-r from-pink-500 to-cyan-500"
                  >
                    Join Squad
                  </Button>

                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
