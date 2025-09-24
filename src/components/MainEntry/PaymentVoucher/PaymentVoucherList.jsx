import { Pencil, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";
import PageTitle from "../../RouteTitle";
import api from "../../../api/Api";

export default function PaymentVoucherList({ showTitle = true }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["unpostedVouchers"],
    queryFn: async () => {
      const res = await api.get("/pay_all_unposted.php");
      return res.data;
    },
  });

  if (isLoading) return <p>Loading vouchers...</p>;
  if (error) return <p>Error loading vouchers</p>;

  const vouchers = data?.status === "success" ? data.data : [];

  return (
    <>
      <Helmet>
        <title>Dashboard | Journal | HRMS</title>
      </Helmet>

      <div className="">
        {showTitle && <PageTitle />}
        <div className="bg-white shadow-md rounded-2xl p-6 border mt-4 border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 bg-blue-200 py-2 px-4 rounded-lg">
            All Unposted Vouchers
          </h2>

          {isLoading && <p>Loading vouchers...</p>}
          {error && <p className="text-red-600">{error}</p>}

          {!isLoading && !error && (
            <div className="w-full">
  <div className="hidden md:block overflow-x-auto rounded-lg shadow-sm border border-gray-200">
    {/* --- Desktop Table --- */}
    <table className="w-full border-collapse text-sm">
      <thead>
        <tr className="bg-gray-100 text-gray-700 text-left">
          <th className="px-4 py-2 border bg-blue-200">#</th>
          <th className="px-4 py-2 border bg-purple-200">Voucher No</th>
          <th className="px-4 py-2 border bg-green-200">Transaction Date</th>
          <th className="px-4 py-2 border bg-orange-200">GL Date</th>
          <th className="px-4 py-2 border bg-blue-200">Description</th>
          <th className="px-4 py-2 border bg-purple-200">Credit</th>
          <th className="px-4 py-2 border bg-orange-200">Modify</th>
        </tr>
      </thead>
      <tbody>
        {vouchers.map((v, index) => (
          <tr key={v.VOUCHERNO} className="hover:bg-gray-50">
            <td className="px-4 py-2 border">{index + 1}</td>
            <td className="px-4 py-2 border">{v.VOUCHERNO}</td>
            <td className="px-4 py-2 border">{v.TRANS_DATE}</td>
            <td className="px-4 py-2 border">{v.GL_ENTRY_DATE}</td>
            <td className="px-4 py-2 border">{v.DESCRIPTION}</td>
            <td className="px-4 py-2 border">{v.CREDIT}</td>
            <td className="px-4 py-2 border flex gap-2">
              <Link to={`/dashboard/payment-voucher/${v.ID}`}>
                <button className="text-blue-600 hover:text-blue-800">
                  <Pencil size={16} />
                </button>
              </Link>
              <button className="text-red-600 hover:text-red-800">
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* --- Mobile Card Layout --- */}
  <div className="md:hidden space-y-4">
    {vouchers.map((v, index) => (
      <div key={v.VOUCHERNO} className="border rounded-lg p-4 shadow-sm bg-white">
        <p className="text-sm">
          <span className="font-semibold">#:</span> {index + 1}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Voucher No:</span> {v.VOUCHERNO}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Transaction Date:</span> {v.TRANS_DATE}
        </p>
        <p className="text-sm">
          <span className="font-semibold">GL Date:</span> {v.GL_ENTRY_DATE}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Description:</span> {v.DESCRIPTION}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Credit:</span> {v.CREDIT}
        </p>
        <div className="flex gap-3 mt-2">
          <Link to={`/dashboard/payment-voucher/${v.ID}`}>
            <button className="text-blue-600 hover:text-blue-800">
              <Pencil size={18} />
            </button>
          </Link>
          <button className="text-red-600 hover:text-red-800">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

          )}
        </div>
      </div>
    </>
  );
}
