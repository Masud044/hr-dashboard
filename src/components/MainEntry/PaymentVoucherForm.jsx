import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";

const PaymentVoucherForm = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    entryDate: "",
    invoiceNo: "",
    supporting: "",
    description: "",
    supplier: "",
    glDate: "",
    paymentCode: "",
    totalAmount: 0,
  });

  // Fetch API data on component mount
  useEffect(() => {
    fetch("/api/pay_api.php")
      .then((res) => res.json())
      .then((data) => {
        // Map API data to form state
        console.log(data)
        setForm({
          entryDate: data.trans_date,
          glDate: data.gl_date,
          supporting: data.supporting,
          description: data.receive_desc,
          supplier: data.supplierid,
          paymentCode: data.receive,
          totalAmount: Number(data.totalAmount),
        });

        // Map accounts from API
        const accounts = data.accountID.map((code, index) => ({
          accountCode: code,
          particulars: "", // you can fill if API has
          amount: Number(data.amount2[index] || 0),
        }));
        setRows(accounts);
      })
      .catch((err) => console.error("Error fetching API:", err));
  }, []);

  const addRow = () => setRows([...rows, { accountCode: "", particulars: "", amount: 0 }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);
  };

  const totalAmount = rows.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <>
      <Helmet>
        <title>Dashboard | Payment | HRMS</title>
      </Helmet>

      <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 bg-green-200 rounded-lg px-4 py-2">
          Payment Voucher
        </h2>

        {/* Form Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              Entry Date
            </label>
            <input
              type="date"
              value={form.entryDate}
              onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              Invoice No
            </label>
            <input
              type="text"
              value={form.invoiceNo}
              onChange={(e) => setForm({ ...form, invoiceNo: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              Supporting
            </label>
            <input
              type="number"
              value={form.supporting}
              onChange={(e) => setForm({ ...form, supporting: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 bg-blue-200 py-2 px-4 rounded-lg">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Supplier & GL Date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
              Supplier Name
            </label>
            <input
              type="text"
              value={form.supplier}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
              GL Date
            </label>
            <input
              type="date"
              value={form.glDate}
              onChange={(e) => setForm({ ...form, glDate: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
              Payment Code
            </label>
            <input
              type="text"
              value={form.paymentCode}
              className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              readOnly
            />
          </div>
        </div>

        {/* Accounts Table */}
        <h3 className="text-lg font-medium text-gray-700 mb-2 bg-green-200 py-2 px-4 rounded-lg">
          Accounts
        </h3>
        <table className="w-full rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 bg-green-100 text-left">Account Code</th>
              <th className="px-4 py-2 bg-purple-200 text-left">Particulars</th>
              <th className="px-4 py-2 bg-blue-200 text-right">Amount</th>
              <th className="px-4 py-2 bg-orange-200 text-center">Delete</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.accountCode}
                    onChange={(e) => handleRowChange(index, "accountCode", e.target.value)}
                    className="w-full border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2">
                  <input
                    type="text"
                    value={row.particulars}
                    onChange={(e) => handleRowChange(index, "particulars", e.target.value)}
                    className="w-full border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="px-4 py-2 text-right">
                  <input
                    type="number"
                    value={row.amount}
                    onChange={(e) => handleRowChange(index, "amount", e.target.value)}
                    className="w-24 border rounded-lg px-2 py-1 text-right"
                  />
                </td>
                <td className="px-4 py-2 text-center">
                  <button onClick={() => removeRow(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-between items-center mt-3">
          <button onClick={addRow} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
            <Plus className="w-4 h-4" /> Add Row
          </button>
          <div className="text-right font-semibold text-gray-700">Total: {totalAmount.toFixed(2)}</div>
        </div>
      </div>
    </>
  );
};

export default PaymentVoucherForm;
