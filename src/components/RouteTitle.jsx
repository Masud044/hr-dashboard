import { useLocation, matchPath } from "react-router-dom";

const pageTitles = [
  { path: "/dashboard", label:"Main Entry▸Home" },
  { path: "/dashboard/payment-voucher", label: "Main Entry▸payment-voucher" },
  { path: "dashboard/payment-voucher/:voucherId", label:"Main Entry▸payment-voucher▸voucherID" },
  { path: "/dashboard/journal-voucher", label: "Main Entry▸journal-voucher"},
  { path: "/dashboard/receive-voucher", label:"Main Entry▸receive-voucher" },
  { path: "/dashboard/account-voucher", label: "Main Entry▸account-voucher" },
  { path: "/dashboard/cash-voucher", label: "Main Entry▸cash-voucher" },
];

export default function PageTitle() {
  const { pathname } = useLocation();

  // Find the best matching route
  const match = pageTitles.find((p) => matchPath({ path: p.path, end: true }, pathname));
  const title = match ? match.label : "";

  return (
    <div className=" px-4 py-2 mb-4">
      <h1 className="text-sm font-semibold text-gray-700">{title}</h1>
    </div>
  );
}
