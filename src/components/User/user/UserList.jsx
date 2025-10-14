import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";
import { useState } from "react";

export default function UserList({ showTitle = true }) {
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 15;

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await api.get("/user.php");
      const response = res.data;
      // Normalize structure
      if (Array.isArray(response.data)) return response.data;
      if (Array.isArray(response.records)) return response.records;
      if (Array.isArray(response)) return response;
      return [];
    },
  });
  console.log(users)

  const userList = Array.isArray(users) ? [...users] : [];
  console.log(userList)
  userList.sort((a, b) => Number(b.ID) - Number(a.ID));

  const totalPages = Math.ceil(userList.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const currentUsers = userList.slice(startIndex, startIndex + usersPerPage);

  if (isLoading) return <p>Loading Users...</p>;
  if (error) return <p className="text-red-600">Error loading users.</p>;

  return (
    <>
      <Helmet>
        <title>Dashboard | Users | HRMS</title>
      </Helmet>

      <div>
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Users
          </h2>

          {!isLoading && !error && (
            <div className="w-full">
              <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700 text-left">
                      <th className="px-4 py-2 border bg-blue-200">#</th>
                      <th className="px-4 py-2 border bg-purple-200">User Name</th>
                      <th className="px-4 py-2 border bg-green-200">Type</th>
                      <th className="px-4 py-2 border bg-orange-200">Email</th>
                      <th className="px-4 py-2 border bg-blue-200">Phone</th>
                      <th className="px-4 py-2 border bg-purple-200">Status</th>
                      <th className="px-4 py-2 border bg-orange-200">Modify</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4 text-gray-500">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      currentUsers.map((u, index) => (
                        <tr key={u.ID || index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 border">
                            {(currentPage - 1) * usersPerPage + index + 1}
                          </td>
                          <td className="px-4 py-2 border">{u.USER_NAME}</td>
                          <td className="px-4 py-2 border">{u.TYPE_NAME}</td>
                          <td className="px-4 py-2 border">{u.EMAIL}</td>
                          <td className="px-4 py-2 border">{u.PHONE}</td>
                          <td className="px-4 py-2 border">
                            {u.STATUS === "1" ? "Active" : "Inactive"}
                          </td>
                          <td className="px-4 py-2 border flex gap-2">
                            <Link to={`/dashboard/user/${u.ID}`}>
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

              {userList.length > usersPerPage && (
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
          )}
        </div>
      </div>
    </>
  );
}
