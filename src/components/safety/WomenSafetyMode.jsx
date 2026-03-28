import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Moon, Users, Bell } from "lucide-react";

export default function WomenSafetyMode({ enabled, onToggle, features }) {
  return (
    <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-pink-900 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Women Safety Mode
          </CardTitle>
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-pink-600" />
                <p className="font-semibold text-gray-900">Female-Only Rides</p>
              </div>
              <p className="text-sm text-gray-600">
                Match only with verified female drivers and passengers
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Moon className="w-5 h-5 text-purple-600" />
                <p className="font-semibold text-gray-900">Night Ride Monitoring</p>
              </div>
              <p className="text-sm text-gray-600">
                Enhanced tracking and alerts for rides after 8 PM
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <p className="font-semibold text-gray-900">Trusted Driver Priority</p>
              </div>
              <p className="text-sm text-gray-600">
                Match with drivers having 95+ trust score
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <p className="font-semibold text-gray-900">Live Location Sharing</p>
              </div>
              <p className="text-sm text-gray-600">
                Auto-share location with emergency contacts
              </p>
            </div>
          </div>

          <div className="p-3 bg-pink-100 border border-pink-300 rounded-lg">
            <p className="text-sm text-pink-900 font-medium">
              🛡️ Your safety is our priority. All safety features are active.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}