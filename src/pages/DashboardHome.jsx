import { useQuery } from "@tanstack/react-query";
import api from "../api/Api";
import DashboardVoucher from "../components/DashboardVoucher";

const DashboardHome = () => {
  // Fetch Expenses
  const { data: expenses = {} } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const res = await api.get("/dash_board_expense.php");
      return res.data.success ? res.data : {};
    },
  });

  // Fetch Income
 const { data: income = {} } = useQuery({
  queryKey: ["income"],
  queryFn: async () => {
    const res = await api.get("/dash_board_income.php");
    return res.data.success ? res.data : {};
  },
});
console.log(income)

  // Fetch Cash
  const { data: cash = {} } = useQuery({
    queryKey: ["cash"],
    queryFn: async () => {
      const res = await api.get("/dash_board_cash.php");
      return res.data.success ? res.data : {};
    },
  });
  console.log(cash)

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Money In */}
      <div className="space-y-6">
        <h1>Money In</h1>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold flex justify-between items-center">
            Invoices
            <span className="text-purple-600 text-sm cursor-pointer">Reminders settings</span>
          </h3>
          <div className="mt-4">
            <p className="text-2xl font-bold">${income.total_income || 0}</p>
            <a href="#" className="text-purple-600 text-sm">{income.invoiceCount || 0} invoices issued</a>
          </div>
          <div className="mt-2 text-gray-400">
            <p>${income.overdue || 0}</p>
            <p className="text-sm">{income.overdueCount || 0} invoices overdue</p>
          </div>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold">GST refund</h3>
          <p className="text-2xl font-bold mt-2">${income.gstRefund || 0}</p>
          <p className="text-sm text-gray-400">GST refund from ATO</p>
        </div>
      </div>

      {/* Money Out */}
      <div className="space-y-6">
        <h1>Money Out</h1>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold">Expenses</h3>
          <p className="text-2xl font-bold mt-2">${expenses.total_expense || 0}</p>
          <a href="#" className="text-purple-600 text-sm">{expenses.supplierOwing || 0} owing to suppliers</a>
        </div>
        <div className="bg-white shadow rounded p-4 flex flex-col items-center justify-center text-center">
          <div className="bg-purple-100 p-4 rounded mb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a5 5 0 00-10 0v2m-4 4h18M5 13v8h14v-8H5z" />
            </svg>
          </div>
          <p className="font-semibold">Payroll that keeps it simple</p>
          <p className="text-gray-400 text-sm mt-1">
            Store everything you need online and complete pay runs with just a few clicks. Easy, no fuss compliance.
          </p>
          <a href="#" className="text-purple-600 text-sm mt-2">+ Add your first employee</a>
        </div>
      </div>

      {/* Banking */}
      <div className="space-y-6">
        <h1>Banking</h1>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold">Bank accounts</h3>
          <p className="text-2xl font-bold mt-2">${cash.bankBalance || 0}</p>
          <p className="text-sm text-gray-400">In the bank</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold">Credit cards</h3>
          <p className="text-2xl font-bold mt-2"> ${cash.expense_summary?.reduce((sum, d) => sum + d.TOTAL_DEBIT, 0).toLocaleString()}</p>
          <p className="text-sm text-gray-400">In credit cards</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-gray-700 font-semibold">Transactions</h3>
          <p className="text-2xl font-bold mt-2">{cash.unallocatedTransactions || 0}</p>
          <p className="text-sm text-gray-400">Unallocated transactions</p>
        </div>
      </div>

      {/* Dashboard Voucher Component */}
      <div className="col-span-full mt-6">
        <DashboardVoucher />
      </div>
    </div>
  );
};

export default DashboardHome;
