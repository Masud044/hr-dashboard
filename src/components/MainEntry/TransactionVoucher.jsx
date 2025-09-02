import { useState } from "react";

const TransactionVoucher = () => {
  const [form, setForm] = useState({
    fromCode: "1020020000",
    toCode: "1020020000",
    amount: 5000,
    date: "2025-08-28",
    description: "",
  });

  const [transactions, setTransactions] = useState([]);

  const handleSave = () => {
    // Add transaction to the table
    setTransactions([
      ...transactions,
      {
        id: transactions.length + 1,
        voucherType: "Payment", // example type
        voucherNo: `VCH-${transactions.length + 1}`,
        transactionDate: form.date,
        description: form.description,
        entryBy: "Admin", // example
      },
    ]);
    // Reset description
    setForm({ ...form, description: "" });
  };
  const handleCancel = () => {
    // Reset the form to initial values
    // setForm({
    //   fromCode: "1020020000",
    //   toCode: "1020020000",
    //   amount: 5000,
    //   date: "2025-08-28",
    //   description: "",
    // });
    // setTransactions([]);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6 bg-orange-300 rounded-lg p-3">Transaction Voucher</h2>

      {/* Top Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-yellow-50 p-4 rounded-lg shadow-sm mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">From Code</label>
          <select
            value={form.fromCode}
            onChange={(e) => setForm({ ...form, fromCode: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          >
            <option value="1020020000">1020020000 (Cash in Hand)</option>
          </select>
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-sm font-medium">Available Balance:</span>
          <span className="mt-1 text-gray-700">10000</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Code</label>
          <select
            value={form.toCode}
            onChange={(e) => setForm({ ...form, toCode: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          >
            <option value="1020020000">1020020000 (Cash in Hand)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
        <div className="md:col-span-1">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 bg-blue-200 p-3 rounded-lg">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-green-400"
          rows={3}
        />
      </div>

      {/* Transaction Table */}
      <table className="w-full border-collapse rounded overflow-hidden shadow-sm mb-4">
        <thead className="bg-purple-200 text-black">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Voucher Type</th>
            <th className="px-4 py-2">Voucher No</th>
            <th className="px-4 py-2">Transaction Date</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Entry By</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No transactions yet
              </td>
            </tr>
          ) : (
            transactions.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.id}</td>
                <td className="px-4 py-2">{t.voucherType}</td>
                <td className="px-4 py-2">{t.voucherNo}</td>
                <td className="px-4 py-2">{t.transactionDate}</td>
                <td className="px-4 py-2">{t.description}</td>
                <td className="px-4 py-2">{t.entryBy}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          + Save page
        </button>
        <button
         type="button"
          onClick={handleCancel}
          className="flex items-center  gap-1 bg-orange-300 text-white px-4 py-2 rounded hover:bg-orange-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TransactionVoucher;
