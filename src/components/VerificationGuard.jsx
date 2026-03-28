import React from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VerificationGuard({ user, children }) {
  const navigate = useNavigate();

  // Check if user has completed mandatory fields
  const hasEmail = !!user?.email;
  const hasPhone = !!user?.phone;
  const hasCampus = !!user?.university;
  const hasLicense = !!user?.driving_license && user.driving_license.length > 0;

  const isVerified = hasEmail && hasPhone && hasCampus && hasLicense;

  const missingFields = [
    !hasEmail && "Email ID",
    !hasPhone && "Phone Number",
    !hasCampus && "Campus Name (VIT)",
    !hasLicense && "Driving License Number",
  ].filter(Boolean);

  if (isVerified) {
    return children;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex items-center justify-center p-6"
    >
      <Card className="max-w-md w-full bg-gray-900 border-2 border-red-500/50 shadow-2xl">
        <CardContent className="p-8">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center"
            style={{
              boxShadow: "0 0 40px rgba(239, 68, 68, 0.5)",
            }}
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-2xl font-bold text-white text-center mb-3">
            Verification Required
          </h2>
          <p className="text-gray-400 text-center mb-6">
            Complete your profile to access ride booking and ensure safety for all VIT students
          </p>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white font-semibold">Missing Information</span>
              </div>
              <ul className="space-y-2">
                {missingFields.map((field, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate(createPageUrl("Profile"))}
              className="w-full bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white"
            >
              Complete Verification
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate(createPageUrl("Home"))}
              variant="outline"
              className="w-full border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}