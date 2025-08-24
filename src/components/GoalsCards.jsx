import { Users, Target, FileWarning, Clock } from "lucide-react";

const stats = [
  { label: "Team Members", value: 23, bg: "bg-purple-100", iconColor: "text-purple-600", icon: <Users size={18} /> },
  { label: "Total Goals", value: 14, bg: "bg-green-100", iconColor: "text-green-600", icon: <Target size={18} /> },
  { label: "Unaligned", value: 12, bg: "bg-orange-100", iconColor: "text-orange-600", icon: <FileWarning size={18} /> },
  { label: "Pending", value: 9, bg: "bg-blue-100", iconColor: "text-blue-600", icon: <Clock size={18} /> },
];

export default function GoalsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => (
        <div
          key={idx}
          className={`${item.bg} rounded-2xl p-4`}
        >
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg bg-white/70 ${item.iconColor}`}>{item.icon}</div>
            <span className="w-6 h-6 rounded-full bg-white/70 grid place-items-center text-xs text-gray-600">i</span>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">{item.label}</div>
            <div className="text-2xl font-bold">{item.value}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
