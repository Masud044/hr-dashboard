import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { Helmet } from "react-helmet";

export default function JournalVoucher() {
  const vouchers = [
    {
      id: 1,
      type: "Journal",
      number: "2023/001",
      date: "02 Jul, 25",
      description: "Test transaction",
      entryBy: "Admin",
    },
  ];

  return (
    <>
    <Helmet>
         <title>Dashboard | journal | HRMS</title>
      </Helmet>
    <div className="p-6 space-y-6">
    
    

      {/* Card - Table */}
      <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
          All Unposted Vouchers
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-4 py-2 border bg-blue-200">ID</th>
                <th className="px-4 py-2 border bg-purple-200">Voucher Type</th>
                <th className="px-4 py-2 border bg-green-200">Voucher No</th>
                <th className="px-4 py-2 border bg-orange-200">Transaction Date</th>
                <th className="px-4 py-2 border bg-blue-200">Description</th>
                <th className="px-4 py-2 border bg-purple-200">Entry by</th>
                <th className="px-4 py-2 border bg-orange-200">Modify</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{v.id}</td>
                  <td className="px-4 py-2 border">{v.type}</td>
                  <td className="px-4 py-2 border">{v.number}</td>
                  <td className="px-4 py-2 border">{v.date}</td>
                  <td className="px-4 py-2 border">{v.description}</td>
                  <td className="px-4 py-2 border">{v.entryBy}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div></>
    
  );
}
