import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useState } from "react";

export default function ProjectList({ showTitle = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const vouchersPerPage = 15;

  // ✅ Fetch safely
  const {
    data: customers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/project.php");

      // Handle multiple possible response formats
      const response = res.data;

      if (Array.isArray(response)) return response;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.records)) return response.data.records;

      // If not an array, return empty array
      return [];
    },
  });

  // ✅ Always use a new array to avoid mutating React Query cache
  const vouchers = Array.isArray(customers) ? [...customers] : [];

  // ✅ Sort safely (latest ID first)
  vouchers.sort(
    (a, b) => (Number(b.P_ID) || 0) - (Number(a.P_ID) || 0)
  );

  const totalPages = Math.ceil(vouchers.length / vouchersPerPage);
  const startIndex = (currentPage - 1) * vouchersPerPage;
  const currentVouchers = vouchers.slice(
    startIndex,
    startIndex + vouchersPerPage
  );

  // ✅ UI states
  if (isLoading) return <p>Loading Project...</p>;
  if (error) return <p className="text-red-600">Error loading customers.</p>;

  return (
    <>
      <Helmet>
        <title>Dashboard | Customer | HRMS</title>
      </Helmet>

      <div>
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Project
          </h2>

          {!isLoading && !error && (
            <div className="w-full">
              <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                {/* --- Desktop Table --- */}
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
                      <th className="px-4 py-2 border bg-blue-200">#</th>
                      <th className="px-4 py-2 border bg-purple-200">
                        Project Name
                      </th>
                      <th className="px-4 py-2 border bg-green-200">
                       Project Type
                      </th>
                      <th className="px-4 py-2 border bg-orange-200">Postcode</th>
                      <th className="px-4 py-2 border bg-blue-200">Address</th>
                      <th className="px-4 py-2 border bg-purple-200">Subwrb</th>
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
                          No Project found
                        </td>
                      </tr>
                    ) : (
                      currentVouchers.map((v, index) => (
                        <tr key={v.P_ID || index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">
                            {(currentPage - 1) * vouchersPerPage + index + 1}
                          </td>
                          <td className="px-4 py-2 border">{v.P_NAME}</td>
                          <td className="px-4 py-2 border">{v.P_TYPE}</td>
                          <td className="px-4 py-2 border">{v.POSTCODE}</td>
                          <td className="px-4 py-2 border">{v.P_ADDRESS}</td>
                          <td className="px-4 py-2 border">{v.SUBWRB}</td>
                          <td className="px-4 py-2 border flex gap-2">
                            <Link
                              to={`/dashboard/project-setting/${v.P_ID}`}
                            >
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

              {/* Pagination */}
              {vouchers.length > vouchersPerPage && (
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
