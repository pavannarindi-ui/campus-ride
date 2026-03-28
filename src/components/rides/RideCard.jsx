import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { 
  Clock, 
  Users, 
  Star, 
  Shield, 
  Snowflake, 
  Luggage,
  MapPin
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function RideCard({ ride }) {
  const vehicleIcons = {
    car: "🚗",
    suv: "🚙",
    auto: "🛺",
    bike: "🏍️"
  };

  return (
    <Link to={`${createPageUrl("RideDetails")}?id=${ride.id}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden cursor-pointer">
        <CardContent className="p-0">
          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-emerald-100">
                  <AvatarImage src={ride.driver_photo} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-cyan-500 text-white font-medium">
                    {ride.driver_name?.[0] || "D"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900">{ride.driver_name || "Driver"}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>4.8</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Verified</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600">₹{ride.price_per_seat}</div>
                <div className="text-xs text-slate-500">per seat</div>
              </div>
            </div>

            {/* Route */}
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="w-0.5 h-10 bg-gradient-to-b from-emerald-300 to-red-300" />
                  <div className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-100" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Pickup</p>
                    <p className="font-medium text-slate-900">{ride.origin}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Drop</p>
                    <p className="font-medium text-slate-900">{ride.destination}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className={`${
                ride.ride_type === 'intercity' 
                  ? 'bg-violet-100 text-violet-700' 
                  : ride.ride_type === 'squad'
                  ? 'bg-cyan-100 text-cyan-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {ride.ride_type === 'intercity' ? '🛣️ Intercity' : ride.ride_type === 'squad' ? '👥 Squad' : '🏙️ Local'}
              </Badge>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                {vehicleIcons[ride.vehicle_type]} {ride.vehicle_name || ride.vehicle_type}
              </Badge>
              {ride.women_only && (
                <Badge className="bg-pink-100 text-pink-700 border-pink-200">
                  👩 Women Only
                </Badge>
              )}
              {ride.ac_available && (
                <Badge variant="outline" className="border-cyan-200 text-cyan-600">
                  <Snowflake className="w-3 h-3 mr-1" /> AC
                </Badge>
              )}
              {ride.luggage_allowed && (
                <Badge variant="outline" className="border-amber-200 text-amber-600">
                  <Luggage className="w-3 h-3 mr-1" /> Luggage
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                {format(new Date(ride.departure_time), "MMM d, h:mm a")}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
              <Users className="w-4 h-4" />
              {ride.available_seats} seats left
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}