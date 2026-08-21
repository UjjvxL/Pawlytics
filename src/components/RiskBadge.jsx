import { RISK_LEVELS, CONFIDENCE_LEVELS } from "@/lib/riskEngine";
import { AlertTriangle, HelpCircle } from "lucide-react";

export default function RiskBadge({ level, size = "md", showIcon = true }) {
  const config = RISK_LEVELS[level] || RISK_LEVELS.unknown;
  
  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5 font-semibold",
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.badge} ${config.border} ${sizes[size]}`}>
      {showIcon && level === "unknown" && <HelpCircle className="w-3 h-3" />}
      {showIcon && (level === "high" || level === "very_high") && <AlertTriangle className="w-3 h-3" />}
      {config.label}
    </span>
  );
}

export function ConfidenceBadge({ confidence, size = "md" }) {
  const config = CONFIDENCE_LEVELS[confidence] || CONFIDENCE_LEVELS.insufficient;
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  
  return (
    <span className={`inline-flex items-center gap-1 text-gray-600 ${sizes[size]}`}>
      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  );
}