import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery} from "@tanstack/react-query";
import api from "../../../api/Api";
import { useState } from "react";

export default function ContractionProcessList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
 

  // ✅ Fetch contraction process list
  const {
    data: processes = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["contraction_process"],
    queryFn: async () => {
      const res = await api.get("/construction_process.php");
      const response = res.data;

      if (Array.isArray(response)) return response;
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.records)) return response.records;
      return [];
    },
  });

  

  const totalPages = Math.ceil(processes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = processes.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) return <p>Loading data...</p>;
  if (error) return <p className="text-red-600">Error loading data.</p>;

  return (
    <>
      <Helmet>
        <title>Dashboard | Contraction Process</title>
      </Helmet>

      <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
          All Contraction Processes
        </h2>

        <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-4 py-2 border bg-blue-200">#</th>
                <th className="px-4 py-2 border bg-purple-200">Process ID</th>
                <th className="px-4 py-2 border bg-green-200">Sub Contract ID</th>
                <th className="px-4 py-2 border bg-orange-200">Dependent ID</th>
                <th className="px-4 py-2 border bg-blue-200">Sort ID</th>
                <th className="px-4 py-2 border bg-purple-200">Cost</th>
                <th className="px-4 py-2 border bg-orange-200">Created By</th>
                <th className="px-4 py-2 border bg-red-200">Modify</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr key={item.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-2 border">{item.PROCESS_ID}</td>
                    <td className="px-4 py-2 border">{item.SUB_CONTRACT_ID}</td>
                    <td className="px-4 py-2 border">{item.DEPENDENT_ID}</td>
                    <td className="px-4 py-2 border">{item.SORT_ID}</td>
                    <td className="px-4 py-2 border">{item.COST}</td>
                    <td className="px-4 py-2 border">{item.CREATION_BY}</td>
                    <td className="px-4 py-2 border flex gap-2">
                      <Link
                        to={`/dashboard/contraction-process/${item.ID}`}
                      >
                        <button className="text-blue-600 hover:text-blue-800">
                          <Pencil size={16} />
                        </button>
                      </Link>
                      <button
                        
                        className="text-red-600 hover:text-red-800"
                      >
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
        {processes.length > itemsPerPage && (
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
    </>
  );
}
