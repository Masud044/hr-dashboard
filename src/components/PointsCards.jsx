import DonutChart from "./DonutChart";

export default function PointsCards() {
  const allotted = 24000;
  const gained = 4923;
  const given = 200;
  const available = allotted - (gained + given);

  const chartData = [
    { label: "Points Allotted", value: allotted, color: "#f59e0b" },
    { label: "Points Gained", value: gained, color: "#22c55e" },
    { label: "Points Given", value: given, color: "#ef4444" },
    { label: "Points Available", value: available, color: "#3b82f6" },
  ];

  return (
    <div className="bg-white rounded-2xl p-4 border">
      <h3 className="font-semibold mb-4">Points Budgeted</h3>
      <div className="flex items-center gap-4">
        <DonutChart data={chartData} size={120} thickness={18} />
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm flex-1">
          {chartData.map((d) => (
            <div key={d.label} className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.label}
              </span>
              <span className="font-semibold text-gray-900">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
