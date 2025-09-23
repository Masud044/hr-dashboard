import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../../api/Api";

import PageTitle from "../RouteTitle";
import JournalVoucherList from "./JournalVoucherList";

const JournalVoucher = () => {
  const { voucherId } = useParams();
  const queryClient = useQueryClient();

  console.log(voucherId);
  const today = new Date().toISOString().split("T")[0];

  const [rows, setRows] = useState([
    {
      id: "dummy", // dummy row id
      accountCode: "",
      particulars: "",

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
  // const { data: suppliers = [] } = useQuery({
  //   queryKey: ["suppliers"],
  //   queryFn: async () => {
  //     const res = await api.get("/supplier.php");
  //     return res.data.data || [];
  //   },
  // });

  // const { data: PaymentCodes = [] } = useQuery({
  //   queryKey: ["paymentCodes"],
  //   queryFn: async () => {
  //     const res = await api.get("/receive_code.php");
  //     return res.data.success === 1 ? res.data.data || [] : [];
  //   },
  // });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await api.get("/gl_account_code.php");
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
      const res = await api.get(`/GL_VIEW.php?insertID=${voucherId}`);
      return res.data;
    },
    enabled: !!voucherId && accounts.length > 0,
  });

  useEffect(() => {
    if (voucherId && voucherData?.status === "success" && accounts.length > 0) {
      const master = voucherData.master || {};
      const details = voucherData.details || [];

      const mappedRows = details.map((d, i) => {
        const account = accounts.find((acc) => acc.value === d.code);
        return {
          id: d.id || `${d.code}-${i}`, // UI key
          detail_id: d.id,              // DB id
          accountCode: d.code,
          particulars: account ? account.label : "",
          debit: parseFloat(d.debit) || 0,
          credit: parseFloat(d.credit) || 0,
        };
      });

      const total = mappedRows.reduce(
        (sum, r) => sum + (parseFloat(r.debit || 0) + parseFloat(r.credit || 0)),
        0
      );

      setForm((prev) => ({
        ...prev,
        entryDate: master.TRANS_DATE
          ? new Date(master.TRANS_DATE).toISOString().split("T")[0]
          : today,
        glDate: master.GL_ENTRY_DATE
          ? new Date(master.GL_ENTRY_DATE).toISOString().split("T")[0]
          : today,
        invoiceNo: master.VOUCHERNO || "",
        supporting: master.SUPPORTING || "",
        description: master.DESCRIPTION || "",
        supplier: master.CUSTOMER_ID || "",
        paymentCode: master.CASHACCOUNT || "",
        totalAmount: total,
      }));

      setRows(mappedRows);
    }
  }, [voucherData, accounts, voucherId]);

  // ---------- MUTATION ----------
  const mutation = useMutation({
    mutationFn: async ({ isNew, payload }) => {
      const apiUrl = isNew ? "/gl_add.php" : "/gl_edit.php";
      const res = await api.post(apiUrl, payload);
      return res.data;
    },
    onSuccess: (data, variables) => {
      if (data.status === "success") {
        setMessage(
          variables.isNew
            ? "Journal-Voucher created successfully!"
            : "Journal-Voucher updated successfully!"
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
          totalAmount: 0,
        });
        setRows([]);
        queryClient.invalidateQueries(["unpostedVouchers"]);
      } else {
        setMessage(data.message || "Error processing voucher.");
      }
      setShowModal(false);
    },
    onError: () => {
      setMessage("Error submitting voucher. Please try again.");
      setShowModal(false);
    },
  });


  // ---------- HANDLERS ----------
  const addRow = () => {
    if (!form.accountId) return;
    const newRow = {
      id: Date.now(),
      detail_id: null,
      accountCode: form.accountId,
      particulars: form.particular,
      debit: 0,
      credit: 0,
    };
    let updatedRows;
    if (rows.length === 1 && rows[0].id === "dummy") {
      // replace dummy row with actual row
      updatedRows = [newRow];
    } else {
      // append normally
      updatedRows = [...rows, newRow];
    }

    

    setRows(updatedRows);
    // setRows([...rows, newRow]);
    setForm({ ...form, accountId: "", particular: "" });
  };
 
 
  
  
  // ---------- HANDLE CHANGE ----------
  const handleRowChange = (id, field, value) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === id
          ? {
              ...row,
              [field]: value,
              ...(field === "debit" && value
                ? { credit: "" } // if debit has value, clear credit
                : field === "credit" && value
                ? { debit: "" } // if credit has value, clear debit
                : {}),
            }
          : row
      )
    );
  };

  // ---------- CALCULATE TOTAL ----------
  const debitTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.debit) || 0),
    0
  );
  const creditTotal = rows.reduce(
    (sum, r) => sum + (parseFloat(r.credit) || 0),
    0
  );

  const handleSubmit = () => {
    setMessage("");
    const isNew = !voucherId;

    if (!form.entryDate || !form.glDate || !form.description || rows.length === 0) {
      setMessage("Please fill all required fields and add at least one row.");
      return;
    }
    if (debitTotal !== creditTotal) {
      setMessage("Debit and Credit totals must be equal before submission.");
      return;
    }

    const payload = isNew
      ? {
          trans_date: form.entryDate,
          GL_ENTRY_DATE: form.glDate,
          receive_desc: form.description,
          details: rows.map((r) => ({
            code: `${r.accountCode}##${r.particulars}`,
            debit: parseFloat(r.debit) || 0,
            credit: parseFloat(r.credit) || 0,
            description: r.particulars,
          })),
        }
      : {
          master_id: voucherId,
          trans_date: form.entryDate,
          gl_entry_date: form.glDate,
          receive_desc: form.description,
          supporting: String(form.supporting || "0"),
          details: rows.map((r) => ({
            detail_id: r.detail_id,
            debit: parseFloat(r.debit) || 0,
            credit: parseFloat(r.credit) || 0,
            code: r.accountCode,
            CDDESCRIPTION: r.particulars,
          })),
        };

    mutation.mutate({ isNew, payload });
};

  return (
    <div className="">
      {/* <h2 className="text-xl font-semibold text-gray-700 bg-green-200 rounded-lg px-4 mb-2 py-2">
        Payment Voucher
      </h2> */}
      <PageTitle></PageTitle>

      {/* Top Form */}
      <div className=" p-6 space-y-6 bg-white rounded-lg shadow-md">
        {message && (
          <p className="text-center text-red-600 font-medium mt-2 mb-2">
            {message}
          </p>
        )}

        {/* Save button aligned right */}

        <div className="md:flex justify-between gap-10  bg-white  rounded-lg">
          {/* bill system */}
          <div className=" bg-gray-200 border-black">
            <h1 className=" text-center py-10 px-12">this is bill</h1>
          </div>
          {/* suppliers */}
          {/* <div className=""> */}
          {/* <div className="grid grid-cols-3 opacity-60  px-3 items-center py-3">
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
            </div> */}
          {/* </div> */}
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
            {/* <div className="grid grid-cols-3 opacity-60  px-3 items-center ">
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
            </div> */}
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
                className="col-span-2 w-40 border rounded py-1   bg-white "
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
            {/* <div className="grid grid-cols-3 opacity-60   px-3 items-center ">
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
            </div> */}
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
          {/* <div className="grid grid-cols-3  px-3  items-center py-3">
            <label className="font-medium block text-sm  text-foreground">
              Amount
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="col-span-1 border w-full rounded py-1  bg-white "
            />
          </div> */}
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

        <table className="w-full table-fixed border-collapse opacity-80 rounded-lg overflow-x-auto">
          <thead>
            <tr>
              <th className="px-4 py-2 w-[20%] text-center font-medium text-sm text-foreground">
                Account Code
              </th>
              <th className="px-4 py-2 w-[35%] text-center font-medium text-sm text-foreground">
                Particulars
              </th>
              <th className="px-4 py-2 w-[10%] text-center font-medium text-sm text-foreground">
                Debit
              </th>
              <th className="px-4 py-2 w-[10%]  text-center font-medium text-sm text-foreground">
                credit
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border">
                <td className="border px-4 py-2">{row.accountCode}</td>
                <td className="border px-4 py-2">{row.particulars}</td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={row.debit || ""}
                    onChange={(e) => handleRowChange(row.id, "debit", e.target.value)}
                    disabled={row.credit > 0}
                    className="w-full border-none outline-none bg-transparent text-center"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={row.credit || ""}
                    onChange={(e) => handleRowChange(row.id, "credit", e.target.value)}
                    disabled={row.debit > 0}
                    className="w-full border-none outline-none bg-transparent text-center"
                  />
                </td>
              </tr>
            ))}

            {/* --- Summary Rows --- */}

            {rows.length > 0 && (
              <tr className="font-semibold">
                <td colSpan="2" className="text-right p-2">
                  Total
                </td>
                <td className="text-center p-2">{debitTotal.toFixed(2)}</td>
                <td className="text-center p-2">{creditTotal.toFixed(2)}</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end items-center gap-10 mb-4">
          {/* <button
            type="button"
           
            className="bg-green-500 cursor-pointer text-white px-12 py-2 rounded-lg"
          >
            print
          </button> */}
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
          <JournalVoucherList></JournalVoucherList>
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
                <strong>No. of Supporting:</strong> {form.supporting}
              </p>
              <p>
                <strong>Description:</strong> {form.description}
              </p>
              
              <p>
                <strong>GL Date:</strong> {form.glDate}
              </p>
              

              <h3 className="font-semibold mt-2">Accounts:</h3>
              <ul className="list-disc pl-5">
                {rows.map((row, r) => (
                  <li key={r}>
                    {row.accountCode} - {row.particulars} - Debit: {row.debit}, Credit: {row.credit}
                  </li>
                ))}
              </ul>

              {/* <p className="font-semibold mt-2">
                Total: {form.totalAmount.toFixed(2)}
              </p> */}
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

export default JournalVoucher;
