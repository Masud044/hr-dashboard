import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";

import { useState } from "react";
import api from "../../../api/Api";

export default function ContratorList({ showTitle = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ✅ Fetch Contractor List
  const {
    data: contrators = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contrators"],
    queryFn: async () => {
      const res = await api.get("/contrator.php"); // <-- Use correct API endpoint
      const response = res.data;

      // Handle different possible response shapes safely
      if (Array.isArray(response)) return response;
      if (Array.isArray(response.data)) return response.data;
      return [];
    },
  });

  // ✅ Safe sorting
  const sortedContrators = Array.isArray(contrators)
    ? [...contrators].sort(
        (a, b) => (Number(b.CONTRATOR_ID) || 0) - (Number(a.CONTRATOR_ID) || 0)
      )
    : [];

  // ✅ Pagination logic
  const totalPages = Math.ceil(sortedContrators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = sortedContrators.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ✅ UI states
  if (isLoading) return <p>Loading contrator data...</p>;
  if (error) return <p className="text-red-600">Error loading contrators.</p>;

  return (
    <>
      <Helmet>
        <title>Dashboard | Contrator | HRMS</title>
      </Helmet>

      <div>
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Contrators
          </h2>

          {/* ✅ Table */}
          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="px-4 py-2 border bg-blue-200">#</th>
                  <th className="px-4 py-2 border bg-purple-200">
                    Contrator Name
                  </th>
                  <th className="px-4 py-2 border bg-green-200">Entry Date</th>
                  <th className="px-4 py-2 border bg-orange-200">Email</th>
                  <th className="px-4 py-2 border bg-blue-200">Address</th>
                  <th className="px-4 py-2 border bg-purple-200">Mobile</th>
                  <th className="px-4 py-2 border bg-orange-200">Modify</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-500">
                      No contrators found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((v, index) => (
                    <tr
                      key={v.CONTRATOR_ID || index}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-2 border">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 border">{v.CONTRATOR_NAME}</td>
                      <td className="px-4 py-2 border">{v.ENTRY_DATE}</td>
                      <td className="px-4 py-2 border">{v.EMAIL}</td>
                      <td className="px-4 py-2 border">{v.ADDRESS}</td>
                      <td className="px-4 py-2 border">{v.MOBILE}</td>
                      <td className="px-4 py-2 border flex gap-2">
                        <Link
                          to={`/dashboard/contrator-setting/${v.CONTRATOR_ID}`}
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

          {/* ✅ Pagination */}
          {sortedContrators.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
      </div>
    </>
  );
}
