
import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import PageTitle from "../RouteTitle";
import api from "../../api/Api";

export default function JournalVoucherList() {
 const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/GL_all_unposted.php");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading vouchers...</p>;
  if (error) return <p>Error loading vouchers</p>;

  const vouchers = data?.status === "success" ? data.data : [];


  return (
    <>
      {/* <Helmet>
        <title>Dashboard | Journal | HRMS</title>
      </Helmet> */}

      <div className="">
        {/* {showTitle && <PageTitle />} */}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Unposted Vouchers
          </h2>

          {isLoading && <p>Loading vouchers...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="px-4 py-2 border bg-blue-200">#</th>
                    <th className="px-4 py-2 border bg-purple-200">Voucher No</th>
                    <th className="px-4 py-2 border bg-green-200">Transaction Date</th>
                    <th className="px-4 py-2 border bg-orange-200">GL Date</th>
                    <th className="px-4 py-2 border bg-blue-200">Description</th>
                    <th className="px-4 py-2 border bg-purple-200">Debit</th>
                    <th className="px-4 py-2 border bg-purple-200">Credit</th>
                    <th className="px-4 py-2 border bg-orange-200">Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-gray-500">
                        No unposted vouchers found
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v, index) => (
                      <tr key={v.VOUCHERNO} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">{v.VOUCHERNO}</td>
                        <td className="px-4 py-2 border">{v.TRANS_DATE}</td>
                        <td className="px-4 py-2 border">{v.GL_ENTRY_DATE}</td>
                        <td className="px-4 py-2 border">{v.DESCRIPTION}</td>
                        <td className="px-4 py-2 border">{v.DEBIT}</td>
                        <td className="px-4 py-2 border">{v.CREDIT}</td>
                        <td className="px-4 py-2 border flex gap-2">
                          <Link to={`/dashboard/journal-voucher/${v.ID}`}>
                            <button className="text-blue-600 cursor-pointer hover:text-blue-800">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button className="text-red-600 hover:text-red-800">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
