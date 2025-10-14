import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useState } from "react";

export default function AdminUserList({ showTitle = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 15;

  const { data, isLoading, error } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: async () => {
      const res = await api.get("/admin_user.php");
      // Ensure we always return an array
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data.data)) return res.data.data;
      return [];
    },
  });

  // ✅ Ensure `vouchers` is always an array
  const vouchers = Array.isArray(data) ? data : [];

  // ✅ Safely sort
  const sortedVouchers = [...vouchers].sort((a, b) => Number(b.ID) - Number(a.ID));

  const totalPages = Math.ceil(sortedVouchers.length / vouchersPerPage);
  const startIndex = (currentPage - 1) * vouchersPerPage;
  const currentVouchers = sortedVouchers.slice(startIndex, startIndex + vouchersPerPage);

  if (isLoading) return <p>Loading admin users...</p>;
  if (error) return <p>Error loading admin users</p>;

  return (
    <>
      <Helmet>
        <title>Dashboard | Admin Users | HRMS</title>
      </Helmet>

      <div>
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Admin Users
          </h2>

          <div className="w-full">
            <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-left">
                    <th className="px-4 py-2 border bg-blue-200">#</th>
                    <th className="px-4 py-2 border bg-purple-200">Address</th>
                    <th className="px-4 py-2 border bg-green-200">Position</th>
                    <th className="px-4 py-2 border w-10 bg-orange-200">Modify</th>
                  </tr>
                </thead>
                <tbody>
                  {currentVouchers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-gray-500">
                        No admin users found
                      </td>
                    </tr>
                  ) : (
                    currentVouchers.map((v, index) => (
                      <tr key={v.ID} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border">{index + 1}</td>
                        <td className="px-4 py-2 border">{v.ADDRESS}</td>
                        <td className="px-4 py-2 border">{v.POSITION}</td>
                        
                        <td className="px-4 py-2 border flex gap-2">
                          <Link to={`/dashboard/admin-user/${v.ID}`}>
                            <button className="text-blue-600 hover:text-blue-800">
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

            {sortedVouchers.length > vouchersPerPage && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
        </div>
      </div>
    </>
  );
}
