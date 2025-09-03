import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";

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
    totalAmount: 0,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [suppliers, setSuppliers] = useState([]);

  // Fetch Suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/supplier.php");
      const data = await res.json();
      setSuppliers(data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Row handlers
  const addRow = () => setRows([...rows, { accountCode: "", particulars: "", amount: "" }]);
  const removeRow = (index) => setRows(rows.filter((_, i) => i !== index));
  const handleRowChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(updated);

    const total = updated.reduce((sum, row) => sum + Number(row.amount || 0), 0);
    setForm({ ...form, totalAmount: total });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Client-side validation
    if (
      !form.entryDate ||
      !form.glDate ||
      !form.description ||
      !form.supporting ||
      !form.paymentCode ||
      !form.supplier ||
      rows.length === 0 ||
      rows.some(r => !r.accountCode || !r.amount)
    ) {
      setMessage("Please fill all required fields and add at least one account row.");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        trans_date: form.entryDate,
        gl_date: form.glDate,
        receive_desc: form.description,
        supporting: String(form.supporting),
        receive: form.paymentCode,
        supplierid: form.supplier,
        totalAmount: String(form.totalAmount), // Convert number to string
        accountID: rows.map(r => r.accountCode),
        amount2: rows.map(r => String(r.amount || 0)), // Convert amounts to strings
      };

      const res = await fetch("/api/pay_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (data.status === "success") {
        setMessage("Payment voucher submitted successfully!");
        // Reset form
        setForm({
          entryDate: "",
          invoiceNo: "",
          supporting: "",
          description: "update one",
          supplier: "",
          glDate: "",
          paymentCode: "",
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
    <div className="bg-white shadow-md rounded-2xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-700 bg-green-200 rounded-lg px-4 py-2">
        Payment Voucher
      </h2>

      <form onSubmit={handleSubmit}>
        {/* Top Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              Entry Date
            </label>
            <input
              type="date"
              value={form.entryDate}
              onChange={e => setForm({ ...form, entryDate: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              Invoice No
            </label>
            <input
              type="text"
              value={form.invoiceNo}
              onChange={e => setForm({ ...form, invoiceNo: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 bg-purple-200 py-2 px-4 rounded-lg">
              No. of Supporting
            </label>
            <input
              type="number"
              value={form.supporting}
              onChange={e => setForm({ ...form, supporting: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
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
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
        </div>

        {/* Supplier / GL Date / Payment Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
              Supplier
            </label>
            <select
              value={form.supplier}
              onChange={e => setForm({ ...form, supplier: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            >
              <option value="">Select Supplier</option>
              {suppliers.map(sup => (
                <option key={sup.SUPPLIER_ID} value={sup.SUPPLIER_ID}>
                  {sup.SUPPLIER_NAME}
                </option>
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
              onChange={e => setForm({ ...form, glDate: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 bg-orange-200 py-2 px-4 rounded-lg">
              Payment Code
            </label>
            <input
              type="text"
              value={form.paymentCode}
              onChange={e => setForm({ ...form, paymentCode: e.target.value })}
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
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
                <th className="px-4 py-2">Account Code</th>
                <th className="px-4 py-2">Particulars</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Delete</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.accountCode}
                      onChange={e => handleRowChange(index, "accountCode", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.particulars}
                      onChange={e => handleRowChange(index, "particulars", e.target.value)}
                      className="w-full border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.amount}
                      onChange={e => handleRowChange(index, "amount", e.target.value)}
                      className="w-24 border rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button type="button" onClick={() => removeRow(index)}>
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between mt-3">
            <button type="button" onClick={addRow} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg">
              <Plus className="w-4 h-4 inline-block" /> Add Row
            </button>
            <div className="font-semibold">Total: {form.totalAmount.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">
            {loading ? "Submitting..." : "Save Voucher"}
          </button>
        </div>

        {message && <p className="mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
};

export default PaymentVoucherForm;
