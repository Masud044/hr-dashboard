import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../../../api/Api";

import PageTitle from "../../RouteTitle";
import PaymentVoucherList from "./PaymentVoucherList";

const PaymentVoucherForm = () => {
  const { voucherId } = useParams();
  const queryClient = useQueryClient();

  console.log(voucherId);
  const today = new Date().toISOString().split("T")[0];

  const [rows, setRows] = useState([
    {
      id: "dummy", // dummy row id
      accountCode: "",
      particulars: "",
      amount: 0,
      debitId: null,
      creditId: null,
    },
  ]);
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

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

  // ---------- FETCH HELPERS ----------
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await api.get("/supplier.php");
      return res.data.data || [];
    },
  });

  const { data: PaymentCodes = [] } = useQuery({
    queryKey: ["paymentCodes"],
    queryFn: async () => {
      const res = await api.get("/receive_code.php");
      return res.data.success === 1 ? res.data.data || [] : [];
    },
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await api.get("/account_code.php");
      if (res.data.success === 1) {
        return res.data.data.map((acc) => ({
          value: acc.ACCOUNT_ID,
          label: `${acc.ACCOUNT_ID} - ${acc.ACCOUNT_NAME}`,
          name: acc.ACCOUNT_NAME,
        }));
      }
      return [];
    },
  });
  // ---------- FETCH VOUCHER IF EDIT ----------
  const { data: voucherData } = useQuery({
    queryKey: ["voucher", voucherId],
    queryFn: async () => {
      const res = await api.get(`/pay_view.php?id=${voucherId}`);
      return res.data;
    },
    enabled: !!voucherId && accounts.length > 0,
  });
  console.log(voucherData);
  useEffect(() => {
    if (voucherId && voucherData?.status === "success" && accounts.length > 0) {
      const master = voucherData.master || {};
      const details = voucherData.details || [];

      // Filter out rows that should not appear in editable table
      const mappedRows = details
        .filter((d) => d.debit && Number(d.debit) > 0) // only include rows with debit > 0
        .map((d, i) => {
          const account = accounts.find((acc) => acc.value === d.code);
          return {
            id: d.id || `${d.code}-${i}`,
            accountCode: d.code,
            particulars: account ? account.label : "",
            amount: parseFloat(d.debit),
            debitId: d.id,
            creditId: null,
          };
        });

      const total = mappedRows.reduce(
        (sum, r) => sum + Number(r.amount || 0),
        0
      );

      setForm((prev) => ({
        ...prev,
        entryDate: master.TRANS_DATE
          ? new Date(master.TRANS_DATE).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        glDate: master.GL_ENTRY_DATE
          ? new Date(master.GL_ENTRY_DATE).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        invoiceNo: master.VOUCHERNO || "",
        supporting: master.SUPPORTING || "",
        description: master.DESCRIPTION || "",
        supplier: master.CUSTOMER_ID || "",
        paymentCode: master.CASHACCOUNT || "",
        accountId: "",
        particular: "",
        amount: "",
        totalAmount: total,
      }));

      setRows(mappedRows); // only rows with debit > 0
    }
  }, [voucherData, accounts, voucherId]);

  // ---------- MUTATION ----------
  const mutation = useMutation({
    mutationFn: async ({ isNew, payload }) => {
      const apiUrl = isNew ? "/pay_api.php" : "/bwal_update_gl.php";
      const res = await api.post(apiUrl, payload);
      console.log(res.data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.status === "success") {
        setMessage(
          variables.isNew
            ? "Voucher created successfully!"
            : "Voucher updated successfully!"
        );

        setForm({
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
        setRows([]);
        queryClient.invalidateQueries(["unpostedVouchers"]);
      } else {
        setMessage(data.message || "Error processing voucher.");
      }
    },
    onError: () => {
      setMessage("Error submitting voucher. Please try again.");
    },
    onSettled: () => {
      setShowModal(false);
    },
  });

  // ---------- HANDLERS ----------
  const addRow = () => {
    if (!form.accountId || !form.amount) return;
    const newRow = {
      id: Date.now(),
      accountCode: form.accountId,
      particulars: form.particular,
      amount: parseFloat(form.amount),
      debitId: null,
      creditId: null,
    };
    let updatedRows;
    if (rows.length === 1 && rows[0].id === "dummy") {
      // replace dummy row with actual row
      updatedRows = [newRow];
    } else {
      // append normally
      updatedRows = [...rows, newRow];
    }

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

  const removeRow = (id) => {
    const updatedRows = rows.filter((r) => r.id !== id);
    const total = updatedRows.reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );
    setRows(updatedRows);
    setForm({ ...form, totalAmount: total });
  };

  const handleSubmit = () => {
    setMessage("");
    const isNew = !voucherId;

    if (
      isNew &&
      (!form.entryDate ||
        !form.glDate ||
        // !form.description ||
        !form.supporting ||
        !form.paymentCode ||
        !form.supplier ||
        rows.length === 0)
    ) {
      setMessage("Please fill all required fields and add at least one row.");
      return;
    }

    let payload = {};
    if (isNew) {
      payload = {
        trans_date: form.entryDate,
        gl_date: form.glDate,
        receive_desc: form.description,
        supporting: String(form.supporting),
        receive: form.paymentCode,
        supplierid: form.supplier,
        user_id: "1",
        totalAmount: String(form.totalAmount),
        accountID: rows.map((r) => r.accountCode),
        amount2: rows.map((r) => String(r.amount || 0)),
      };
    } else {
      payload = {
        master_id: voucherId,
        voucherno: form.invoiceNo,
        trans_date: form.entryDate,
        gl_date: form.glDate,
        voucher_type: 2,
        entry_by: 1,
        description: form.description,
        reference_no: form.invoiceNo || "",
        supporting: Number(form.supporting) || 0,
        cashaccount: form.paymentCode || "",
        posted: 0,
        customer_id: form.supplier,
        auto_invoice: "",
        status_pay_recive: 0,
        unit_id: 0,
        details: rows.map((r) => ({
          code: r.accountCode,
          debit: r.debitId ? Number(r.amount) : 0,
          credit: r.creditId ? Number(r.amount) : 0,
          description: r.particulars,
        })),
      };
    }
    console.log(payload);
    mutation.mutate({ isNew, payload });
  };
  return (
    <div className="">
      <PageTitle></PageTitle>

      {/* Top Form */}
      <div className=" p-6 space-y-6 bg-white rounded-lg shadow-md">
        {message && (
          <p className="text-center text-red-600 font-medium mt-2 mb-2">
            {message}
          </p>
        )}

        {/* Save button aligned right */}

        <div className="grid grid-cols-1 md:grid-cols-[150px_1fr_1fr] gap-4  bg-white  rounded-lg">
          {/* bill system */}
          <div className=" bg-gray-200 border-black">
            <h1 className=" text-center py-10">this is bill</h1>
          </div>
          {/* suppliers */}
          <div className="">
            <div className="grid grid-cols-3 opacity-60  px-3 items-center py-3">
              <label className="font-medium block text-xs  text-foreground">
                Supplier
              </label>
              <select
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="col-span-2 w-full border rounded py-1 h-8  bg-white "
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.SUPPLIER_ID} value={sup.SUPPLIER_ID}>
                    {sup.SUPPLIER_NAME}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* all input payment field */}
          <div className="">
            {/* Entry Date */}
            <div className="grid grid-cols-3 opacity-60   px-3 items-center py-2">
              <label className="font-medium block text-sm  text-foreground">
                Entry Date
              </label>
              <input
                type="date"
                value={form.entryDate}
                onChange={(e) =>
                  setForm({ ...form, entryDate: e.target.value })
                }
                className="col-span-2 w-full border  rounded py-1   bg-white "
              />
            </div>
            {/* Invoice No */}
            <div className="grid grid-cols-3 opacity-60  px-3 items-center ">
              <label className="font-medium block text-sm  text-foreground">
                Invoice No
              </label>
              <input
                type="text"
                value={form.invoiceNo}
                onChange={(e) =>
                  setForm({ ...form, invoiceNo: e.target.value })
                }
                disabled={!voucherId}
                className="col-span-2 w-full border   rounded py-1  bg-white "
              />
            </div>
            {/* Supporting */}
            <div className="grid grid-cols-3 opacity-60 py-2  px-3 items-center ">
              <label className="font-medium block text-sm  text-foreground">
                No. of Supporting
              </label>
              <input
                type="number"
                value={form.supporting}
                onChange={(e) =>
                  setForm({ ...form, supporting: e.target.value })
                }
                className="border-collapse w-40 border rounded py-1   bg-white "
              />
            </div>
            <div className="grid grid-cols-3 opacity-60 py-2  px-3 items-center">
              <label className="font-medium block text-sm  text-foreground">
                GL Date
              </label>
              <input
                type="date"
                value={form.glDate}
                onChange={(e) => setForm({ ...form, glDate: e.target.value })}
                className="col-span-2 w-full border rounded py-1  bg-white "
              />
            </div>
            <div className="grid grid-cols-3 opacity-60   px-3 items-center ">
              <label className="font-medium block text-sm  text-foreground">
                Payment Code
              </label>
              <select
                value={form.paymentCode}
                onChange={(e) =>
                  setForm({ ...form, paymentCode: e.target.value })
                }
                className="col-span-2 w-full rounded py-1 border  bg-white "
              >
                <option value="">Select payment</option>
                {PaymentCodes.map((code) => (
                  <option key={code.ACCOUNT_ID} value={code.ACCOUNT_ID}>
                    {code.ACCOUNT_NAME}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 opacity-60   px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Total Amount
              </label>
              <input
                type="number"
                value={form.totalAmount.toFixed(2)}
                className="col-span-2 w-full border rounded py-1  bg-white "
              />
            </div>
          </div>
        </div>

        <div className="mt-4 mb-4 bg-white opacity-60">
          <label className="block text-sm font-medium text-gray-600 mb-2  py-2 px-4 rounded-lg">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full mt-1 border rounded-lg px-3 py-2"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr_2fr_1fr] opacity-60 gap-4 rounded-lg justify-center items-center ">
          <div className="grid grid-cols-3  px-3 items-center  py-1">
            <label className="font-medium block text-sm  text-foreground">
              Account ID
            </label>
            <Select
              options={accounts}
              className="col-span-2 border w-full rounded shadow-2xl"
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
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }),
              }}
            />
          </div>
          <div className="grid grid-cols-3   px-3 items-center py-3">
            <label className="font-medium block text-sm  text-foreground">
              Particular
            </label>
            <input
              type="text"
              value={form.particular}
              readOnly
              className="col-span-2 border w-full rounded py-1  bg-white"
            />
          </div>
          <div className="grid grid-cols-3  px-3  items-center py-3">
            <label className="font-medium block text-sm  text-foreground">
              Amount
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="col-span-1 border w-full rounded py-1  bg-white "
            />
          </div>
          <div className="px-4 py-2">
            <button
              type="button"
              onClick={addRow}
              className=" text-black cursor-pointer border px-3 py-1 rounded-lg flex items-center"
            >
              <span className="mr-1 font-extrabold">+</span>Add
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full border-collapse opacity-80 rounded-lg text-xs md:text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-2 md:px-4 py-2 text-center font-medium">
                  Account Code
                </th>
                <th className="px-2 md:px-4 py-2 text-center font-medium">
                  Particulars
                </th>
                <th className="px-2 md:px-4 py-2 text-center font-medium">
                  Amount
                </th>
                <th className="px-2 md:px-4 py-2 text-center font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border">
                  <td className="border px-2 md:px-4 py-2 break-words">
                    {row.accountCode}
                  </td>
                  <td className="border px-2 md:px-4 py-2 break-words">
                    {row.particulars}
                  </td>
                  <td className="border px-2 md:px-4 py-2 text-center">
                    {Number(row.amount).toFixed(2)}
                  </td>
                  <td className="border px-2 md:px-4 py-2 text-center">
                    <button type="button" onClick={() => removeRow(row.id)}>
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length > 0 && (
                <tr className="font-semibold">
                  <td colSpan="2" className="p-2 text-right text-gray-600">
                    Total
                  </td>
                  <td className="border p-2 text-center">
                    {form.totalAmount.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <button
            type="button"
            className="w-full md:w-auto bg-green-500 text-white px-6 py-2 rounded-lg"
          >
            print
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-green-500 cursor-pointer text-white px-12 py-2 rounded-lg"
          >
            {mutation.isPending
              ? "Submitting..."
              : voucherId
              ? "Update"
              : "Save"}
          </button>
        </div>
      </div>

       <PaymentVoucherList showTitle={false} /> 

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
                disabled={mutation.isPending}
                className="px-4 py-2 rounded-lg bg-green-500 text-white"
              >
                {mutation.isPending ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVoucherForm;
