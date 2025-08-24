import { Info } from "lucide-react";

export default function Reminder() {
  return (
    <div className="bg-white border rounded-xl px-4 py-3 flex items-start gap-3 text-sm shadow-sm">
      <div className="mt-0.5 text-blue-600">
        <Info size={18} />
      </div>
      <p className="text-gray-700">
        <span className="font-medium">Reminder:</span> Agatha C. has requested a check-in from you. Check before <span className="font-semibold">24th Aug</span>.
      </p>
    </div>
  );
}

