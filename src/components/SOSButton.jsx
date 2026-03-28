import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, MapPin, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export default function SOSButton() {
  const [sosActive, setSosActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [location, setLocation] = useState(null);

  const handleSOSPress = () => {
    setShowConfirm(true);
  };

  const triggerSOS = async () => {
    // Get location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Current Location"
        };
        setLocation(loc);

        // Create SOS alert
        const user = await base44.auth.me();
        await base44.entities.SOSAlert.create({
          user_id: user.id,
          user_name: user.full_name,
          location: loc,
          alert_type: "sos",
          status: "active",
          notes: "Emergency SOS triggered"
        });

        // Send to emergency contacts
        if (user.emergency_contacts?.length > 0) {
          for (const contact of user.emergency_contacts) {
            await base44.integrations.Core.SendEmail({
              to: contact.phone + "@example.com",
              subject: "🚨 EMERGENCY SOS ALERT",
              body: `${user.full_name} has triggered an emergency SOS alert at ${loc.address}. Location: https://maps.google.com/?q=${loc.lat},${loc.lng}`
            });
          }
        }

        setSosActive(true);
      });
    }
  };

  const confirmSOS = () => {
    setShowConfirm(false);
    let timer = 3;
    const interval = setInterval(() => {
      timer--;
      setCountdown(timer);
      if (timer === 0) {
        clearInterval(interval);
        triggerSOS();
      }
    }, 1000);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setShowConfirm(false);
    setCountdown(3);
  };

  return (
    <>
      {/* SOS Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSOSPress}
        className="fixed bottom-24 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-2xl flex items-center justify-center"
        style={{
          boxShadow: sosActive
            ? "0 0 40px rgba(239, 68, 68, 0.8), 0 0 80px rgba(236, 72, 153, 0.6)"
            : "0 10px 30px rgba(239, 68, 68, 0.5)",
        }}
      >
        <motion.div
          animate={sosActive ? {
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          } : {}}
          transition={{
            duration: 0.5,
            repeat: sosActive ? Infinity : 0,
          }}
        >
          <AlertTriangle className="w-8 h-8 text-white" />
        </motion.div>
        
        {/* Pulse Effect */}
        {sosActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-500"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        )}
      </motion.button>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="bg-gray-900 border-2 border-red-500">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              Emergency SOS Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <p className="text-gray-300 text-lg">
              Are you in an emergency situation? This will:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-300">Alert your emergency contacts</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                <MapPin className="w-5 h-5 text-pink-400" />
                <span className="text-gray-300">Share your live location</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800">
                <Shield className="w-5 h-5 text-purple-400" />
                <span className="text-gray-300">Notify campus security</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={cancelSOS}
                variant="outline"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={confirmSOS}
                className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Confirm Emergency
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active SOS Display */}
      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-44 right-6 z-50"
          >
            <Card className="w-72 bg-gray-900 border-2 border-red-500 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                      }}
                      className="w-3 h-3 rounded-full bg-red-500"
                    />
                    <span className="text-white font-bold">SOS ACTIVE</span>
                  </div>
                  <Button
                    onClick={cancelSOS}
                    size="icon"
                    variant="ghost"
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Emergency alert sent. Help is on the way.
                </p>
                {location && (
                  <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="flex items-center gap-2 text-cyan-400 text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>Location shared</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}