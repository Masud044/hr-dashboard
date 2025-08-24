const items = [
  { day: "03", mon: "Aug", title: "Review Meeting - DE Cluster", time: "12:30 PM", people: "12+ People" },
  { day: "24", mon: "Aug", title: "FLLP Review Board Meeting", time: "05:15 PM", people: "4 People" },
];

export default function Meetings() {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm">
      <h3 className="font-semibold mb-4">L&D Meetings</h3>
      <div className="space-y-3">
        {items.map((it, i) => (
          <div key={i} className="flex gap-4 items-center">
            <div className="bg-gray-100 px-3 py-2 rounded-lg text-center w-14">
              <div className="font-bold">{it.day}</div>
              <div className="text-xs text-gray-600">{it.mon}</div>
            </div>
            <div className="flex-1">
              <div className="font-medium">{it.title}</div>
              <div className="text-gray-500 text-sm">{it.time} · {it.people}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
