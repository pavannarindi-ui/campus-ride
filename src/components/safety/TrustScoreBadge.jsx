import React from "react";
import { Shield, Star, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TrustScoreBadge({ score = 0, size = "default" }) {

  const getScoreColor = (score) => {
    if (score >= 90)
      return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };

    if (score >= 75)
      return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" };

    if (score >= 60)
      return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };

    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  };

  const getScoreIcon = (score) => {
    if (score >= 90) return <Shield className="w-4 h-4" />;
    if (score >= 75) return <Star className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Trusted";
    if (score >= 75) return "Verified";
    if (score >= 60) return "Good";
    return "New";
  };

  const colors = getScoreColor(score);
  const sizeClass = size === "large"
    ? "px-4 py-2 text-base"
    : "px-3 py-1 text-sm";

  return (
    <Badge
      className={`${colors.bg} ${colors.text} border ${colors.border} ${sizeClass} flex items-center gap-2 font-semibold`}
    >
      {getScoreIcon(score)}
      {getScoreLabel(score)} ({score})
    </Badge>
  );
}
