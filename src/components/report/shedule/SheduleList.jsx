import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useState } from "react";

export default function SheduleList({ showTitle = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Fetch schedules
  const {
    data: schedules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const res = await api.get("/shedule.php");
      const response = res.data;

      if (Array.isArray(response)) return response;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.data?.records)) return response.data.records;

      return [];
    },
  });

  // ✅ Sort newest first
  const sortedSchedules = Array.isArray(schedules)
    ? [...schedules].sort((a, b) => Number(b.H_ID) - Number(a.H_ID))
    : [];

  // Pagination
  const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageData = sortedSchedules.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading)
    return <p className="text-center mt-6 text-gray-500">Loading schedules...</p>;

  if (error)
    return (
      <p className="text-center mt-6 text-red-600">
        Failed to load schedules.
      </p>
    );

  return (
    <>
      <Helmet>
        <title>Dashboard | Schedule List</title>
      </Helmet>

      <div>
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Schedules
          </h2>

          <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-left">
                  <th className="px-4 py-2 border bg-blue-100">#</th>
                  <th className="px-4 py-2 border bg-green-100">Project ID</th>
                  <th className="px-4 py-2 border bg-yellow-100">Description</th>
                  <th className="px-4 py-2 border bg-blue-100">Created By</th>
                  <th className="px-4 py-2 border bg-purple-100">Updated By</th>
                  <th className="px-4 py-2 border bg-orange-100">Created Date</th>
                  <th className="px-4 py-2 border bg-pink-100">Updated Date</th>
                  <th className="px-4 py-2 border bg-blue-200 text-center">Modify</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No schedule found
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item, index) => (
                    <tr key={item.H_ID} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-4 py-2 border">{item.P_ID}</td>
                      <td className="px-4 py-2 border">{item.DESCRIPTION}</td>
                      <td className="px-4 py-2 border">{item.CREATION_BY}</td>
                      <td className="px-4 py-2 border">{item.UPDATED_BY}</td>
                      <td className="px-4 py-2 border">{item.CREATION_DATE}</td>
                      <td className="px-4 py-2 border">{item.UPDATED_DATE}</td>
                      <td className="px-4 py-2 border flex justify-center gap-2">
                        <Link to={`/dashboard/shedule/${item.H_ID}`}>
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

          {/* Pagination */}
          {sortedSchedules.length > itemsPerPage && (
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
    </>
  );
}
