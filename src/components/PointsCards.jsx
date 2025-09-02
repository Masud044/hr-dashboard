import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Points Allotted", value: 24000, color: "#60A5FA" }, // blue
  { name: "Points Gained", value: 4923, color: "#F97316" },   // orange
  { name: "Points Given", value: 200, color: "#A78BFA" },     // purple
  { name: "Points Available", value: 18877, color: "#34D399" }, // green
];

const PointsCards = () => {
  return (
    <div className="max-w-sm md:max-w-lg bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Points Budgeted</h2>

      {/* Responsive Layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start">
        {/* Chart */}
        <div className="w-40 h-40 md:w-48 md:h-48">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Labels */}
        <div className="mt-6 md:mt-0 md:ml-6 space-y-3 text-sm w-full">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span>{item.name}:</span>
              <span className="font-semibold ml-1">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PointsCards;
