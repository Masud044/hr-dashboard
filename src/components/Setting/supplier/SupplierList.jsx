import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useState } from "react";
// import { useState } from "react";

export default function SupplierList({ showTitle = true }) {

    const [currentPage, setCurrentPage] = useState(1);
   const vouchersPerPage = 15;

  const { data = [], isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/supplier_info.php");
      return res.data;
    },
  });
  
  const vouchers = data
 console.log(vouchers)

// ✅ Sort vouchers by ID (or date, whichever is unique/newest)
 vouchers.sort((a, b) => Number(b.ID) - Number(a.ID));

  const totalPages = Math.ceil(vouchers.length / vouchersPerPage);

   const startIndex = (currentPage - 1) * vouchersPerPage;
  const currentVouchers = vouchers.slice(startIndex, startIndex + vouchersPerPage);

  if (isLoading) return <p>Loading vouchers...</p>;
  
  if (error) return <p>Error loading vouchers</p>;

  

  return (
    <>
      <Helmet>
        <title>Dashboard | Journal | HRMS</title>
      </Helmet>

      <div className="">
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All supplier
          </h2>

          {isLoading && <p>Loading supplier...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && (
            <div className="w-full">
  <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
    {/* --- Desktop Table --- */}
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 text-gray-700 text-left">
          <th className="px-4 py-2 border bg-blue-200">#</th>
          <th className="px-4 py-2 border bg-purple-200">Supplier Name</th>
          <th className="px-4 py-2 border bg-green-200">Entry Date</th>
          <th className="px-4 py-2 border bg-orange-200">Email</th>
          <th className="px-4 py-2 border bg-blue-200">Contact Person</th>
          <th className="px-4 py-2 border bg-purple-200">Phone</th>
          <th className="px-4 py-2 border bg-orange-200">Modify</th>
        </tr>
      </thead>
      <tbody>
       {currentVouchers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No supplier found
                  </td>
                </tr>
              ) : (
                 currentVouchers.map((v, index) => (
                  <tr key={v.SUPPLIER_ID} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">{ index + 1}</td>
                    <td className="px-4 py-2 border">{v.SUPPLIER_NAME}</td>
                    <td className="px-4 py-2 border">{v.ENTRY_DATE}</td>
                    <td className="px-4 py-2 border">{v.EMAIL}</td>
                    <td className="px-4 py-2 border">{v.CONTACT_PERSON}</td>
                    <td className="px-4 py-2 border">{v.PHONE}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link to={`/dashboard/supplier-setting-voucher/${v.SUPPLIER_ID}`}>
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
