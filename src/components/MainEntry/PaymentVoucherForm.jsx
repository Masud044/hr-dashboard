import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

const PaymentVoucherForm = () => {
  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [paymentCodes, setPaymentCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // modal state
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    entryDate: today,
    invoiceNo: "",
    supporting: "",
    description: "",
    supplier: "",
    glDate: today,
    paymentCode: "",
    accountId: "",
    particular: "",
    amount: "",
    totalAmount: 0,
  });

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await fetch("/api/supplier.php");
      const data = await res.json();
      setSuppliers(data.data || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };
  // Fetch payment codes
  const fetchPaymentCodes = async () => {
    try {
      const res = await fetch("/api/receive_code.php"); // proxy or full URL if no proxy
      const data = await res.json();
      if (data.success === 1) {
        setPaymentCodes(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching payment codes:", error);
    }
  };

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/account_code.php");
      const data = await res.json();
      if (data.success === 1) {
        const formatted = data.data.map((acc) => ({
          value: acc.ACCOUNT_ID,
          label: `${acc.ACCOUNT_ID}- ${acc.ACCOUNT_NAME}`,
          name: acc.ACCOUNT_NAME,
        }));
        setAccounts(formatted);
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    fetchAccounts();
    fetchPaymentCodes();
  }, []);

  // Add account row
  const addRow = () => {
    if (!form.accountId || !form.amount) return;

    const newRow = {
      accountCode: form.accountId,
      particulars: form.particular,
      amount: parseFloat(form.amount),
    };

    const updatedRows = [...rows, newRow];
    const total = updatedRows.reduce((sum, r) => sum + Number(r.amount), 0);

    setRows(updatedRows);
    setForm({
      ...form,
      accountId: "",
      particular: "",
      amount: "",
      totalAmount: total,
    });
  };

  // Remove row
  const removeRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const total = updatedRows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );
    setRows(updatedRows);
    setForm({ ...form, totalAmount: total });
  };

  // Submit API request
  const handleSubmit = async () => {
    setMessage("");
    setLoading(true);
    const mergedRows = rows.reduce((acc, row) => {
      const existing = acc.find((r) => r.accountCode === row.accountCode);
      if (existing) {
        existing.amount += row.amount; // sum duplicates
      } else {
        acc.push({ ...row });
      }
      return acc;
    }, []);

    // Validation
    if (
      !form.entryDate ||
      !form.glDate ||
      !form.description ||
      !form.supporting ||
      !form.paymentCode ||
      !form.supplier ||
      rows.length === 0 ||
      rows.some((r) => !r.accountCode || !r.amount)
    ) {
      setMessage(
        "Please fill all required fields and add at least one account row."
      );
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
        totalAmount: String(form.totalAmount),
        accountID: mergedRows.map((r) => r.accountCode),
        amount2: mergedRows.map((r) => String(r.amount || 0)),
      };

      const res = await fetch("/api/pay_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.status === "success") {
        setMessage("Payment voucher submitted successfully!");
        // Reset form
        setForm({
          entryDate: "",
          invoiceNo: "",
          supporting: "",
          description: "",
          supplier: "",
          glDate: "",
          paymentCode: "",
          totalAmount: 0,
        });
        setRows([]);
      } else {
        setMessage(data.message || "Failed to submit voucher");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error submitting voucher. Please try again.");
    } finally {
      setLoading(false);
      setShowModal(false); // close modal after submission
    }
  };

  return (
    <div className="">
      <h2 className="text-xl font-semibold text-gray-700 bg-green-200 rounded-lg px-4 mb-2 py-2">
        Payment Voucher
      </h2>

      <form>
        {/* Top Form */}
        <div className=" p-6 space-y-6 bg-white rounded-lg">
          {message && (
            <p className="text-center text-red-600 font-medium mt-4">
              {message}
            </p>
          )}

          {/* Save button aligned right */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg"
            >
              {loading ? "Submitting..." : "Save Voucher"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 bg-blue-200 rounded-lg">
            {/* Entry Date */}
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Entry Date
              </label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(e) =>
                  setForm({ ...form, entryDate: e.target.value })
                }
                className="col-span-2 w-full  rounded py-1   bg-white focus-visible:outline-blue-500"
              />
            </div>

            {/* Invoice No */}
            <div className="grid grid-cols-3 px-3 items-center py-3 ">
              <label className="font-medium block text-sm  text-foreground">
                Invoice No
              </label>
              <input
                type="text"
                value={form.invoiceNo}
                onChange={(e) =>
                  setForm({ ...form, invoiceNo: e.target.value })
                }
                className="col-span-2 w-full  rounded py-1  bg-white focus-visible:outline-blue-500"
              />
            </div>

            {/* Supporting */}
            <div className="grid grid-cols-3 px-3 items-center py-3 ">
              <label className="font-medium block text-sm  text-foreground">
                No. of Supporting
              </label>
              <input
                type="number"
                value={form.supporting}
                onChange={(e) =>
                  setForm({ ...form, supporting: e.target.value })
                }
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 bg-amber-200 rounded-lg">
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Supplier
              </label>
              <select
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.SUPPLIER_ID} value={sup.SUPPLIER_ID}>
                    {sup.SUPPLIER_NAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                GL Date
              </label>
              <input
                type="date"
                value={form.glDate}
                onChange={(e) => setForm({ ...form, glDate: e.target.value })}
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              />
            </div>
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground"></label>
              <select
                value={form.paymentCode}
                onChange={(e) =>
                  setForm({ ...form, paymentCode: e.target.value })
                }
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              >
                <option value="">Select payment</option>
                {paymentCodes.map((code) => (
                  <option key={code.ACCOUNT_ID} value={code.ACCOUNT_ID}>
                    {code.ACCOUNT_NAME}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 mb-4 bg-white">
            <label className="block text-sm font-medium text-gray-600 mb-2 bg-blue-200 py-2 px-4 rounded-lg">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-lg bg-purple-200">
            <div className="grid grid-cols-3  px-3 items-center py-1">
              <label className="font-medium block text-sm  text-foreground">
                Account ID
              </label>
              <Select
                options={accounts}
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
                value={
                  accounts.find((acc) => acc.value === form.accountId) || null
                }
                onChange={(selected) =>
                  setForm({
                    ...form,
                    accountId: selected ? selected.value : "",
                    particular: selected ? selected.name : "",
                  })
                }
                placeholder="Enter account..."
                isClearable
                isSearchable
              />
            </div>
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Particular
              </label>
              <input
                type="text"
                value={form.particular}
                readOnly
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              />
            </div>
            <div className="grid grid-cols-3  px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Amount
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="col-span-2 w-full rounded py-1  bg-white focus-visible:outline-blue-500"
              />
            </div>
          </div>

          <table className="w-full rounded-lg overflow-hidden">
            <thead className="bg-green-200">
              <tr>
                <th className="px-4 py-2 text-left">
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-purple-500 text-white px-3 py-1 rounded-lg flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1 font-extrabold" />
                  </button>
                </th>
                <th className="px-4 py-2 font-medium  text-sm  text-foreground">
                  Account Code
                </th>
                <th className="px-4 py-2 font-medium  text-sm  text-foreground">
                  Particulars
                </th>
                <th className="px-4 py-2 font-medium  text-sm  text-foreground">
                  Amount
                </th>
                <th className="px-4 py-2 font-medium  text-sm  text-foreground">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="bg-orange-200">
                  {/* empty cell under the +Add column */}
                  <td className="px-4 py-2"></td>

                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.accountCode}
                      readOnly
                      className="w-full bg-white rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={row.particulars}
                      readOnly
                      className="w-full bg-white rounded-lg px-2 py-1"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      value={row.amount}
                      readOnly
                      className="w-full bg-white px-2 py-1 rounded-lg"
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

          <div className="font-semibold flex justify-end mt-2">
            Total: {form.totalAmount.toFixed(2)}
          </div>
        </div>
      </form>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0  bg-black flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 md:w-1/2 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Confirm Voucher Submission
            </h2>

            <div className="space-y-2">
              <p>
                <strong>Entry Date:</strong> {form.entryDate}
              </p>
              <p>
                <strong>Invoice No:</strong> {form.invoiceNo}
              </p>
              <p>
                <strong>No. of Supporting:</strong> {form.supporting}
              </p>
              <p>
                <strong>Description:</strong> {form.description}
              </p>
              <p>
                <strong>Supplier:</strong>{" "}
                {
                  suppliers.find((s) => s.SUPPLIER_ID === form.supplier)
                    ?.SUPPLIER_NAME
                }
              </p>
              <p>
                <strong>GL Date:</strong> {form.glDate}
              </p>
              <p>
                <strong>Payment Code:</strong> {form.paymentCode}
              </p>

              <h3 className="font-semibold mt-2">Accounts:</h3>
              <ul className="list-disc pl-5">
                {rows.map((row, index) => (
                  <li key={index}>
                    {row.accountCode} - {row.particulars} - {row.amount}
                  </li>
                ))}
              </ul>

              <p className="font-semibold mt-2">
                Total: {form.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="flex justify-end mt-4 space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-green-500 text-white disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVoucherForm;
