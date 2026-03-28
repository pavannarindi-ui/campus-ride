import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addDoc,
  collection,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "../firebase";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RequestRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [requestData, setRequestData] = useState({
    pickup: "",
    destination: "",
    date: "",
    time: "",
    seats_needed: 1,
    max_price: "",
    notes: "",
    phone: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Please login first 🚨");
      return;
    }

    if (
      !requestData.pickup ||
      !requestData.destination ||
      !requestData.date ||
      !requestData.time ||
      !requestData.phone
    ) {
      alert("Please fill all required fields ⚠️");
      return;
    }

    setLoading(true);

    try {
      // ✅ Proper Firebase Timestamp
      const departureDateTime = new Date(
        `${requestData.date}T${requestData.time}`
      );

      const departureTimestamp = Timestamp.fromDate(departureDateTime);

      // ✅ Save Ride Request
      const docRef = await addDoc(collection(db, "rideRequests"), {
        pickup: requestData.pickup,
        destination: requestData.destination,
        departure_time: departureTimestamp,
        seats_needed: Number(requestData.seats_needed),
        max_price: Number(requestData.max_price),
        notes: requestData.notes,
        phone: requestData.phone,
        status: "open",
        created_by: auth.currentUser.uid,
        created_at: serverTimestamp(),
      });

      // ✅ Create Notification (Real-time popup system)
      await addDoc(collection(db, "notifications"), {
        type: "ride_request",
        message: `🚗 New ride request from ${requestData.pickup} to ${requestData.destination}`,
        request_id: docRef.id,
        created_at: serverTimestamp(),
        read: false,
      });

      alert("🚀 Ride request submitted successfully!");

      // ✅ Reset Form
      setRequestData({
        pickup: "",
        destination: "",
        date: "",
        time: "",
        seats_needed: 1,
        max_price: "",
        notes: "",
        phone: "",
      });

      navigate("/home");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to submit request");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center px-4 py-10">
      <Card className="w-full max-w-3xl bg-gray-900 border border-cyan-500/30 shadow-2xl">
        <CardHeader>
          <CardTitle className="text-3xl bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
            🚗 Request a Ride
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">

            <Field
              label="Pickup Location"
              value={requestData.pickup}
              onChange={(v) => setRequestData({ ...requestData, pickup: v })}
            />

            <Field
              label="Destination"
              value={requestData.destination}
              onChange={(v) => setRequestData({ ...requestData, destination: v })}
            />

            <Field
              label="Date"
              type="date"
              value={requestData.date}
              onChange={(v) => setRequestData({ ...requestData, date: v })}
            />

            <Field
              label="Time"
              type="time"
              value={requestData.time}
              onChange={(v) => setRequestData({ ...requestData, time: v })}
            />

            <Field
              label="Seats Needed"
              type="number"
              value={requestData.seats_needed}
              onChange={(v) => setRequestData({ ...requestData, seats_needed: v })}
            />

            <Field
              label="Max Price (₹)"
              type="number"
              value={requestData.max_price}
              onChange={(v) => setRequestData({ ...requestData, max_price: v })}
            />

            <Field
              label="Mobile Number 📱"
              placeholder="+91XXXXXXXXXX"
              value={requestData.phone}
              onChange={(v) => setRequestData({ ...requestData, phone: v })}
            />

            <Field
              label="Notes"
              value={requestData.notes}
              onChange={(v) => setRequestData({ ...requestData, notes: v })}
            />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:scale-105 transition text-white"
            >
              {loading ? "Submitting..." : "🚀 Submit Request"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <Label className="text-cyan-400">{label}</Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-black border border-cyan-500/40 text-white focus:ring-2 focus:ring-cyan-500"
        required
      />
    </div>
  );
}
