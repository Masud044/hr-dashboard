
import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";


import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";


export default function CashTransferList() {
 
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 15;
 const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/cash_all_unposted.php");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading vouchers...</p>;
  if (error) return <p>Error loading vouchers</p>;

    
   
     const vouchers = data?.status === "success" ? data.data : [];
     vouchers.sort((a, b) => Number(b.ID) - Number(a.ID));
     const totalPages = Math.ceil(vouchers.length / vouchersPerPage);
   
     const startIndex = (currentPage - 1) * vouchersPerPage;
     const currentVouchers = vouchers.slice(startIndex, startIndex + vouchersPerPage);
  console.log(vouchers)

  


  return (
    <>
      {/* <Helmet>
        <title>Dashboard | Journal | HRMS</title>
      </Helmet> */}

      <div className="">
        {/* {showTitle && <PageTitle />} */}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
           Cash Transfer List
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
                   
                  </tr>
                </thead>
                <tbody>
                  {currentVouchers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-gray-500">
                        Cash transfer List
                      </td>
                    </tr>
                  ) : (
                    currentVouchers.map((v, index) => (
                      <tr key={v.VOUCHERNO} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">{v.VOUCHERNO}</td>
                        <td className="px-4 py-2 border">{v.TRANS_DATE}</td>
                        <td className="px-4 py-2 border">{v.GL_ENTRY_DATE}</td>
                        <td className="px-4 py-2 border">{v.DESCRIPTION}</td>
                        <td className="px-4 py-2 border">{v.DEBIT}</td>
                        <td className="px-4 py-2 border">{v.CREDIT}</td>
                       
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
               {vouchers.length > vouchersPerPage && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded bg-green-500 text-white ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"
              }`}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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
