import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CheckCircle, AlertCircle, Shield } from "lucide-react";

export default function OTPVerification({ 
  open, 
  onClose, 
  rideId, 
  bookingId, 
  type = "start", 
  onSuccess 
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (otp.length !== 4) {
      setError("Please enter 4-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const otpRecords = await base44.entities.RideOTP.filter({ 
        ride_id: rideId, 
        booking_id: bookingId 
      });

      if (otpRecords.length === 0) {
        setError("No OTP found for this ride");
        setLoading(false);
        return;
      }

      const otpRecord = otpRecords[0];
      const expectedOTP = type === "start" ? otpRecord.start_otp : otpRecord.end_otp;

      if (otp === expectedOTP) {
        // Update OTP verification status
        await base44.entities.RideOTP.update(otpRecord.id, {
          [type === "start" ? "start_verified" : "end_verified"]: true,
          [type === "start" ? "start_time" : "end_time"]: new Date().toISOString()
        });

        // Update ride status if end OTP
        if (type === "end") {
          await base44.entities.Ride.update(rideId, { status: "completed" });
        }

        onSuccess?.();
        onClose();
      } else {
        setError("Invalid OTP. Please try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-cyan-500/30">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-cyan-400" />
            {type === "start" ? "Start Ride" : "Complete Ride"} - OTP Verification
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {type === "start" 
              ? "Enter the 4-digit OTP shown on passenger's device to start the ride"
              : "Enter the 4-digit OTP to mark this ride as completed"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label className="text-white">Enter OTP</Label>
            <Input
              type="text"
              maxLength={4}
              placeholder="0000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="bg-gray-800 border-gray-700 text-white text-center text-2xl tracking-widest mt-2"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-cyan-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              OTP verification prevents fake trips and ensures accountability
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-white border-gray-700">
            Cancel
          </Button>
          <Button 
            onClick={handleVerify}
            disabled={loading || otp.length !== 4}
            className="bg-gradient-to-r from-cyan-500 to-pink-500"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}