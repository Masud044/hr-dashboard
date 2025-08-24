const reports = [
  { avatar: "https://i.pravatar.cc/40?img=1", name: "Harper Lee", tag: "Creative Lead - DE Cluster" },
  { avatar: "https://i.pravatar.cc/40?img=2", name: "Francis Degas", tag: "Front End Developer - GM Cluster" },
];

export default function Reports() {
  return (
    <div className="bg-white p-4 rounded-2xl border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Individual Reports &gt; <span className="text-blue-600">Toppers</span></h3>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <button className="w-6 h-6 rounded-full bg-gray-100 grid place-items-center">-</button>
          <button className="w-6 h-6 rounded-full bg-gray-100 grid place-items-center">+</button>
        </div>
      </div>
      <div className="space-y-3">
        {reports.map((r, i) => (
          <div key={i} className="flex items-center gap-4 border p-3 rounded-xl">
            <img src={r.avatar} alt={r.name} className="w-10 h-10 rounded-full" />
            <div className="flex-1">
              <div className="font-medium flex items-center gap-2">
                {r.name}
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">{r.tag}</span>
              </div>
              <div className="grid grid-cols-4 gap-3 mt-2 text-xs">
                <div className="rounded-lg bg-gray-50 p-2 border">
                  <div className="text-gray-500">Performance</div>
                  <div className="text-gray-900 font-semibold">08</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 border">
                  <div className="text-gray-500">Potential</div>
                  <div className="text-green-600">High</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 border">
                  <div className="text-gray-500">Feedback</div>
                  <div className="text-blue-600">Given</div>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 border">
                  <div className="text-gray-500">FLPP</div>
                  <div className="text-green-600 font-medium">Passed</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
