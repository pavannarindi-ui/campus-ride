import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Clock, TrendingUp } from "lucide-react";
import L from "leaflet";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom neon marker icons
const createNeonIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid #fff;
        box-shadow: 0 0 20px ${color}, 0 0 40px ${color};
        transform: translate(-15px, -15px);
      "></div>
    `,
  });
};

function MapController({ origin, destination }) {
  const map = useMap();
  
  useEffect(() => {
    if (origin && destination) {
      const bounds = L.latLngBounds([origin, destination]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, origin, destination]);
  
  return null;
}

export default function RouteMap({ originCoords, destinationCoords, waypoints = [] }) {
  const [route, setRoute] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [trafficLevel, setTrafficLevel] = useState("moderate");
  const [userLocation, setUserLocation] = useState(null);

  // VIT Chennai campus coordinates
  const defaultCenter = [12.8406, 80.1534]; // VIT Chennai
  const origin = originCoords || { lat: 12.8406, lng: 80.1534 }; // VIT Chennai Main Gate
  const destination = destinationCoords || { lat: 12.8450, lng: 80.1580 }; // VIT Chennai Block

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log("Location access denied, using default location");
        }
      );
    }
  }, []);

  useEffect(() => {
    // Calculate route with real distance
    const calculateRoute = async () => {
      const points = [
        [origin.lat, origin.lng],
        ...waypoints.map(w => [w.coords?.lat || origin.lat, w.coords?.lng || origin.lng]),
        [destination.lat, destination.lng],
      ];
      setRoute(points);

      // Calculate real distance using Haversine formula
      const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Earth radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
          Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      };

      const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      
      // Simulate traffic based on time of day
      const hour = new Date().getHours();
      let traffic = "low";
      if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19)) {
        traffic = "heavy";
      } else if ((hour >= 7 && hour <= 11) || (hour >= 16 && hour <= 20)) {
        traffic = "moderate";
      }
      
      // Calculate duration based on distance and traffic
      const baseSpeed = 60; // km/h
      const trafficMultiplier = traffic === "heavy" ? 0.5 : traffic === "moderate" ? 0.7 : 1;
      const duration = Math.ceil((distance / (baseSpeed * trafficMultiplier)) * 60);
      
      setRouteInfo({
        distance: distance.toFixed(1),
        duration: duration,
        traffic: traffic,
      });
      
      setTrafficLevel(traffic);
    };

    calculateRoute();
  }, [origin, destination, waypoints]);

  const trafficColors = {
    low: "#06b6d4",
    moderate: "#f59e0b",
    heavy: "#ef4444",
  };

  return (
    <div className="space-y-4">
      {/* Map */}
      <Card className="overflow-hidden border-0 shadow-xl bg-gray-900">
        <CardContent className="p-0">
          <div className="h-96 relative">
            <MapContainer
              center={[origin.lat, origin.lng]}
              zoom={10}
              className="h-full w-full"
              zoomControl={true}
              style={{ background: '#000' }}
            >
              {/* Dark themed map tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              
              {/* Traffic overlay simulation */}
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0}
              />
              
              {/* User Location (if available) */}
              {userLocation && (
                <>
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={100}
                    pathOptions={{
                      fillColor: "#00ff00",
                      fillOpacity: 0.2,
                      color: "#00ff00",
                      weight: 2
                    }}
                  />
                  <Marker 
                    position={[userLocation.lat, userLocation.lng]}
                    icon={createNeonIcon("#00ff00")}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>Your Location</strong>
                        <br />
                        Current Position
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {/* Origin Marker */}
              <Marker 
                position={[origin.lat, origin.lng]}
                icon={createNeonIcon("#06b6d4")}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Pickup</strong>
                    <br />
                    Origin Location
                  </div>
                </Popup>
              </Marker>

              {/* Destination Marker */}
              <Marker 
                position={[destination.lat, destination.lng]}
                icon={createNeonIcon("#ec4899")}
              >
                <Popup>
                  <div className="text-sm">
                    <strong>Drop-off</strong>
                    <br />
                    Destination Location
                  </div>
                </Popup>
              </Marker>

              {/* Waypoint Markers */}
              {waypoints.map((wp, index) => (
                <Marker
                  key={index}
                  position={[wp.coords?.lat || origin.lat, wp.coords?.lng || origin.lng]}
                  icon={createNeonIcon("#8b5cf6")}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>Stop {index + 1}</strong>
                      <br />
                      {wp.location}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Route Line */}
              {route.length > 0 && (
                <Polyline
                  positions={route}
                  color={trafficColors[trafficLevel]}
                  weight={4}
                  opacity={0.8}
                  dashArray="10, 10"
                  className="animate-pulse"
                />
              )}

              <MapController origin={[origin.lat, origin.lng]} destination={[destination.lat, destination.lng]} />
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Route Info */}
      {routeInfo && (
        <Card className="border-0 shadow-xl bg-gray-900 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-cyan-400" />
                Optimized Route Analysis
              </div>
              <Badge className="bg-gradient-to-r from-cyan-500 to-pink-500 text-white">
                Real-time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-xl bg-gray-800 border border-cyan-500/30">
                <MapPin className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
                <div className="text-3xl font-bold text-white">{routeInfo.distance}km</div>
                <div className="text-xs text-gray-400 mt-1">Total Distance</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800 border border-pink-500/30">
                <Clock className="w-6 h-6 mx-auto mb-2 text-pink-400" />
                <div className="text-3xl font-bold text-white">{routeInfo.duration}m</div>
                <div className="text-xs text-gray-400 mt-1">ETA</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-gray-800 border border-purple-500/30">
                <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <Badge
                  className={`text-sm ${
                    trafficLevel === "low"
                      ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/50"
                      : trafficLevel === "moderate"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                      : "bg-red-500/20 text-red-400 border-red-500/50"
                  }`}
                >
                  {trafficLevel.toUpperCase()}
                </Badge>
                <div className="text-xs text-gray-400 mt-1">Traffic Status</div>
              </div>
            </div>

            {/* Vehicle Suggestions */}
            <div className="space-y-3">
              <h4 className="text-white font-semibold text-sm">Suggested Vehicles</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-cyan-500/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🚗</span>
                    <Badge className="bg-green-500/20 text-green-400 text-xs">Best</Badge>
                  </div>
                  <p className="text-white text-sm font-medium">Car (Sedan)</p>
                  <p className="text-gray-400 text-xs">₹{(routeInfo.distance * 8).toFixed(0)} • {routeInfo.duration}m</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-pink-500/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🚙</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-xs">Comfort</Badge>
                  </div>
                  <p className="text-white text-sm font-medium">SUV</p>
                  <p className="text-gray-400 text-xs">₹{(routeInfo.distance * 12).toFixed(0)} • {routeInfo.duration}m</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-purple-500/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🛺</span>
                    <Badge className="bg-amber-500/20 text-amber-400 text-xs">Budget</Badge>
                  </div>
                  <p className="text-white text-sm font-medium">Auto</p>
                  <p className="text-gray-400 text-xs">₹{(routeInfo.distance * 5).toFixed(0)} • {(routeInfo.duration * 1.2).toFixed(0)}m</p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 hover:border-green-500/50 transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🏍️</span>
                    <Badge className="bg-cyan-500/20 text-cyan-400 text-xs">Fast</Badge>
                  </div>
                  <p className="text-white text-sm font-medium">Bike</p>
                  <p className="text-gray-400 text-xs">₹{(routeInfo.distance * 3).toFixed(0)} • {(routeInfo.duration * 0.7).toFixed(0)}m</p>
                </div>
              </div>
            </div>

            {/* Traffic Alert */}
            {trafficLevel === "heavy" && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Heavy traffic detected. Consider leaving earlier or taking alternate route.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}