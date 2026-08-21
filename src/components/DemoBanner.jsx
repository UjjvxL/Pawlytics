import { FlaskConical } from "lucide-react";

export default function DemoBanner() {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-sm text-amber-800">
      <FlaskConical className="w-4 h-4 flex-shrink-0" />
      <span className="font-medium">Demo / Pilot Data</span>
      <span className="text-amber-700">— Synthetic data for SIH 2026 demonstration. Not real government records.</span>
    </div>
  );
}