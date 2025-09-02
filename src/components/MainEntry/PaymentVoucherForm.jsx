import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet";

const PaymentVoucherForm = () => {
  const [rows, setRows] = useState([{ accountCode: "", particulars: "", amount: "" }]);
  const [form, setForm] = useState({
    entryDate: "",
    invoiceNo: "",
    supporting: "",
    description: "",
    supplier: "",
    glDate: "",
    paymentCode: "",
    availableBalance: 0,
    totalAmount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [paymentCodes, setPaymentCodes] = useState([]);

  // Strict-mode safe side effect: fetch suppliers/payment codes from API
  useEffect(() => {
    // Example: fetching suppliers from API (replace URL with your real endpoint if needed)
    const fetchSuppliers = async () => {
      try {
        const res = await fetch("/api/supplier.php");
        const data = await res.json();
        console.log(data)
        setSuppliers(data.suppliers || []);
        setPaymentCodes(data.paymentCodes || []);
      } catch (error) {
        console.error("Error fetching suppliers/payment codes:", error);
      }
    };

    fetchSuppliers();
  }, []); // runs once after first render → safe in strict mode

  const addRow = () => {
    setRows([...rows, { accountCode: "", particulars: "", amount: "" }]);
  };

  const removeRow = (index) => {
    const updated = [...rows];
    updated.splice(index, 1);
    setRows(updated);
  };

  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);

    // Update totalAmount dynamically
    const total = updated.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    setForm({ ...form, totalAmount: total });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const payload = { ...form, accounts: rows };

      const response = await fetch("/api/pay_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log(data)

      if (data.success) {
        setMessage("Payment voucher submitted successfully!");
        setForm({
          entryDate: "",
          invoiceNo: "",
          supporting: "",
          description: "",
          supplier: "",
          glDate: "",
          paymentCode: "",
          availableBalance: 0,
          totalAmount: 0,
        });
        setRows([{ accountCode: "", particulars: "", amount: "" }]);
      } else {
        setMessage(data.message || "Failed to submit voucher");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error submitting voucher. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* <Helmet>
        <title>Dashboard | Payment | HRMS</title>
      </Helmet> */}
      <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-700 bg-green-200 rounded-lg px-4 py-2">
          Payment Voucher
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Top form section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
                Entry Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(e) => setForm({ ...form, entryDate: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
                required
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
                No. of Supporting
              </label>
              <input
                type="number"
                value={form.supporting}
                onChange={(e) => setForm({ ...form, supporting: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              />
            </div>
          </div>

          {/* Description */}
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

          {/* Supplier, GL Date, Payment Code */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
                Supplier Name
              </label>
              <select
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
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
              <select
                value={form.paymentCode}
                onChange={(e) => setForm({ ...form, paymentCode: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
              >
                <option value="">Select Code</option>
                {paymentCodes.map((code, idx) => (
                  <option key={idx} value={code}>{code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2 bg-green-200 py-2 px-4 rounded-lg">
              Accounts
            </h3>
            <table className="w-full rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left bg-green-100">Account Code</th>
                  <th className="px-4 py-2 text-left bg-purple-200">Particulars</th>
                  <th className="px-4 py-2 text-right bg-blue-200">Payment Amount</th>
                  <th className="px-4 py-2 text-center bg-orange-200">Delete</th>
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
                      <button type="button" onClick={() => removeRow(index)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-3">
              <button type="button" onClick={addRow} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200">
                <Plus className="w-4 h-4" /> Add Row
              </button>
              <div className="text-right font-semibold text-gray-700">Total: {form.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3 mt-4">
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 shadow">
              {loading ? "Submitting..." : "Save Voucher"}
            </button>
          </div>

          {message && <p className="mt-2 text-center text-gray-700">{message}</p>}
        </form>
      </div>
    </>
  );
};

export default PaymentVoucherForm;
