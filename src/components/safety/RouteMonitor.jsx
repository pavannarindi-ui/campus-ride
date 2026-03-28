import React, { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Navigation, Shield, Phone } from "lucide-react";

export default function RouteMonitor({ rideId, expectedRoute }) {
  const [deviations, setDeviations] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [monitoring, setMonitoring] = useState(true);

  useEffect(() => {
    if (!monitoring || !rideId) return;

    const checkRouteDeviation = async (position) => {
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ lat: latitude, lng: longitude });

      // Simulate deviation detection (in production, use proper route matching)
      const deviationRecords = await base44.entities.RouteDeviation.filter({ 
        ride_id: rideId,
        status: "detected"
      });
      setDeviations(deviationRecords);
    };

    const watchId = navigator.geolocation.watchPosition(
      checkRouteDeviation,
      (error) => console.log("Location error:", error),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [rideId, monitoring]);

  const handleAlert = async (deviation) => {
    await base44.entities.RouteDeviation.update(deviation.id, {
      status: "escalated",
      alert_sent: true
    });
    
    alert("Campus security has been notified about route deviation!");
  };

  if (deviations.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Route On Track</p>
              <p className="text-sm text-green-700">No deviations detected</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-red-50 border-red-300">
      <CardHeader>
        <CardTitle className="text-red-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6" />
          Route Deviation Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {deviations.map((deviation) => (
          <div key={deviation.id} className="p-3 bg-white rounded-lg border border-red-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Badge className="bg-red-600 text-white mb-1">
                  {deviation.severity.toUpperCase()}
                </Badge>
                <p className="text-sm font-semibold text-gray-900">
                  {deviation.deviation_type.replace("_", " ").toUpperCase()}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Deviation: {deviation.distance_deviation?.toFixed(2)} km
                </p>
              </div>
              {!deviation.alert_sent && (
                <Button 
                  size="sm" 
                  className="bg-red-600"
                  onClick={() => handleAlert(deviation)}
                >
                  Alert Security
                </Button>
              )}
            </div>
            {deviation.alert_sent && (
              <div className="flex items-center gap-2 text-xs text-red-700 mt-2">
                <Phone className="w-3 h-3" />
                Campus security notified
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}