import { Pencil, Trash2, FileText, FileUser } from "lucide-react";

import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../api/Api";

export default function DashboardVoucher() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/info_list.php");
      return res.data;
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 15;

  const voucherslist = Array.isArray(data?.vouchers) ? data.vouchers : [];

  // sort by ID desc
  voucherslist.sort((a, b) => Number(b.ID) - Number(a.ID));

  const totalPages = Math.ceil(voucherslist.length / vouchersPerPage);

  const startIndex = (currentPage - 1) * vouchersPerPage;
  const currentVouchers = voucherslist.slice(
    startIndex,
    startIndex + vouchersPerPage
  );

  return (
    <>
      <div className="">
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
                    <th className="px-4 py-2 border bg-blue-200">
                      VOUCHER TYPE
                    </th>
                    <th className="px-4 py-2 border bg-purple-200">
                      Voucher No
                    </th>
                    <th className="px-4 py-2 border bg-green-200">
                      Transaction Date
                    </th>

                    <th className="px-4 py-2 border bg-blue-200">
                      Description
                    </th>
                    <th className="px-4 py-2 border bg-purple-200">Entry By</th>

                    <th className="px-4 py-2 border bg-orange-200">Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVouchers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center py-4 text-gray-500"
                      >
                        No unposted vouchers found
                      </td>
                    </tr>
                  ) : (
                    currentVouchers.map((v, index) => (
                      <tr key={v.ID} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">
                          {v.VOUCHER_TYPE === "1"
                            ? "Receive"
                            : v.VOUCHER_TYPE === "2"
                            ? "Payment"
                            : v.VOUCHER_TYPE === "3"
                            ? "Journal"
                            : "Bank Transfer"}
                        </td>
                        <td className="px-4 py-2 border">{v.VOUCHERNO}</td>
                        <td className="px-4 py-2 border">{v.TRANS_DATE}</td>

                        <td className="px-4 py-2 border">{v.DESCRIPTION}</td>
                        <td className="px-4 py-2 border">{v.ENTRY_BY}</td>

                        <td className="px-4 py-2 border flex gap-2">
                             <button className="text-black">
                            <FileText size={16} />
                          </button>
                          <Link to={`/dashboard/journal-voucher/${v.ID}`}>
                            <button className="text-blue-600 cursor-pointer hover:text-blue-800">
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button className="text-green-400">
                            <FileUser size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {voucherslist.length > vouchersPerPage && (
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded bg-green-500 text-white ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-green-600"
                    }`}
                  >
                    Prev
                  </button>

                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded bg-green-500 text-white ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-green-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
