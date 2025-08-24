import { Home, DollarSign, Users, Layers, Coffee } from "lucide-react";

const menu = [
  { name: "Dashboard", icon: <Home size={18} /> },
  { name: "Finance", icon: <DollarSign size={18} /> },
  { name: "Org Structure", icon: <Layers size={18} /> },
  { name: "My Team", icon: <Users size={18} />, active: true },
  { name: "Water Cooler", icon: <Coffee size={18} /> },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r flex flex-col justify-between sticky top-0 h-screen">
      <div>
        <div className="px-4 py-6 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-black" />
          <div className="font-bold text-lg">HRMS</div>
        </div>
        <nav className="space-y-1">
          {menu.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer rounded-r-full
                ${item.active ? "bg-green-100 text-green-700 font-medium" : "hover:bg-gray-100"}
              `}
            >
              {item.icon} {item.name}
            </div>
          ))}
        </nav>
      </div>
      <div className="px-4 py-4 text-sm border-t">
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/40?img=5" alt="User" className="w-8 h-8 rounded-full" />
          <div>
            <div className="font-medium">Sandor Marai</div>
            <div className="text-gray-500">Content Manager</div>
          </div>
        </div>
        <button className="mt-3 text-gray-500 hover:text-gray-700 text-sm">Log Out</button>
      </div>
    </aside>
  );
}
