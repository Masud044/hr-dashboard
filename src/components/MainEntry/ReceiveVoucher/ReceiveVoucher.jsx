import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../../../api/Api";

import PageTitle from "../../RouteTitle";
import ReceiveList from "./ReceiveList";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";



const ReceiveVoucher= () => {
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
    customer: "",
    glDate: today,
    paymentCode: "",
    accountId: "",
    particular: "",
    amount: "",
    totalAmount: 0,
  });

  // ---------- FETCH HELPERS ----------
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await api.get("/customer.php");
      return res.data.data || [];
    },
  });

  const { data: ReceiveCodes = [] } = useQuery({
    queryKey: ["ReceiveCodes"],
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
      const res = await api.get(`/receive_view.php?insertID=${voucherId}`);
      return res.data;
    },
    enabled: !!voucherId && accounts.length > 0,
  });
  console.log(voucherData);
useEffect(() => {
  if (voucherId && voucherData?.success && accounts.length > 0) {
    const master = voucherData.gl_master || {};
    const details = voucherData.gl_details || [];

    const mappedRows = details
    .filter((d) => d.CREDIT && Number(d.CREDIT) > 0)
    .map((d, i) => {
      const account = accounts.find((acc) => acc.value === d.CODE);
      return {
        id: d.ID || `${d.CODE}-${i}`,
        accountCode: d.CODE,
        particulars: d.ACCOUNT_NAME || (account ? account.label : ""),
        amount: parseFloat(d.DEBIT || d.CREDIT || 0),
        debitId: d.DEBIT ? d.ID : null,
        creditId: d.CREDIT ? d.ID : null,
      };
    });

    const total = mappedRows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

    // ✅ Only set mappedRows from GL details
    setRows(mappedRows);

    // Set form fields
    setForm({
      entryDate: master.TRANS_DATE
        ? new Date(master.TRANS_DATE).toISOString().split("T")[0]
        : today,
      glDate: master.GL_ENTRY_DATE
        ? new Date(master.GL_ENTRY_DATE).toISOString().split("T")[0]
        : today,
      invoiceNo: master.VOUCHERNO || "",
      supporting: master.SUPPORTING || "",
      description: master.DESCRIPTION || "",
     customer: master.CUSTOMER_ID ? String(master.CUSTOMER_ID) : "",
      ReceiveCode: master.CASHACCOUNT || "",
      accountId: "", // ✅ clear accountId
      particular: "", // ✅ clear particular
      amount: "", // ✅ clear amount
      totalAmount: total,
    });
  }
}, [voucherData, accounts, voucherId]);

  // ---------- MUTATION ----------
  const mutation = useMutation({
    mutationFn: async ({ isNew, payload }) => {
      const apiUrl = isNew ? "/addReceive.php" : "/ediRecive.php";
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
          customer: "",
          glDate: today,
          ReceiveCode: "",
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
    accountId: "", // ✅ clear after adding
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

  // ✅ New Voucher Validation
  if (
    isNew &&
    (!form.entryDate ||
      !form.glDate ||
      !form.description ||
      !form.ReceiveCode ||
      !form.customer ||
      rows.length === 0)
  ) {
    setMessage("Please fill all required fields and add at least one row.");
    return;
  }
  const invalidRow = rows.some(
    (row) =>
      !row.accountCode || !row.particulars
  );

  if (invalidRow) {
    setMessage("Each row must have Account Code, Particular filled.");
    return;
  }

  let payload = {};
  if (isNew) {
    // ✅ CREATE VOUCHER PAYLOAD
    payload = {
      trans_date: form.entryDate,
      gl_date: form.glDate,
      receive_desc: form.description,
      supporting: String(form.supporting),
      receive: form.ReceiveCode,
      customer_id: String(form.customer), 
      totalAmount: String(form.totalAmount),
      accountID: rows.map((r) => r.accountCode),
      amount2: rows.map((r) => String(r.amount || 0)),
    };
  } else {
    // ✅ UPDATE VOUCHER PAYLOAD
    payload = {
      trans_date: form.entryDate,
      gl_date: form.glDate,
      receive_desc: form.description,
      supporting: String(form.supporting),
      customer_id: String(form.customer), 
      tempdata: voucherId, // master id
      credit_id: rows.find((r) => r.creditId)?.creditId || form.creditId || "",

      totalAmount: Number(form.totalAmount),
      accountID: rows.map((r) => r.accountCode),
      DEBIT_ID: rows.map((r) => r.debitId || ""),
      amount2: rows.map((r) => Number(r.amount)),
    };
  }

  console.log("📤 Final Payload =>", payload);
  mutation.mutate({ isNew, payload });
};


// ---------- PRINT HANDLER ----------

const handlePrint = async () => {
  const printArea = document.getElementById("print-area");

  if (!printArea) {
    setMessage("Print area not found!");
    return;
  }

  try {
    // Temporarily show hidden print area
    printArea.style.display = "block";

    // Capture HTML to canvas
    const canvas = await html2canvas(printArea, {
      scale: 2,
      backgroundColor: "#fff", // fixes oklch color issues
      useCORS: true,           // allow cross-origin images
      logging: false,
      onclone: (clonedDoc) => {
        // Replace any oklch colors with safe hex
        clonedDoc.querySelectorAll("*").forEach((el) => {
          const style = window.getComputedStyle(el);
          if (style.color.startsWith("oklch")) el.style.color = "#000";
          if (style.backgroundColor.startsWith("oklch"))
            el.style.backgroundColor = "#fff";
        });
      },
    });

    const imgData = canvas.toDataURL("image/png", 1.0);

    // Create PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add extra pages if content exceeds one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // ✅ Automatically open PDF in a new tab
    const pdfBlob = pdf.output("blob");
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, "_blank");

    // ✅ Optionally trigger download
    pdf.save(`Receive_Voucher_${form.invoiceNo || "new"}.pdf`);
  } catch (err) {
    console.error(err);
    setMessage("Error generating PDF: " + err.message);
  } finally {
    // Hide print area again
    printArea.style.display = "none";
  }
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
                customer
              </label>
              <select
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
                className="col-span-2 w-full border rounded py-1 h-8  bg-white "
              >
                <option value="">Select customer</option>
                {customers.map((cus) => (
                  <option key={cus.CUSTOMER_ID} value={String(cus.CUSTOMER_ID)}>
                    {cus.CUSTOMER_NAME}
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
                Receive Code
              </label>
              <select
                value={form.ReceiveCode}
                onChange={(e) =>
                  setForm({ ...form, ReceiveCode: e.target.value })
                }
                className="col-span-2 w-full rounded py-1 border  bg-white "
              >
                <option value="">Select Receive</option>
                {ReceiveCodes.map((code) => (
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

         {/* Printable PDF Section */}
<div id="print-area"  className="hidden print:block p-8 bg-white text-black">
  <h1 className="text-xl font-bold text-center mb-2">RECEIVE VOUCHER</h1>
  <div className="border p-3 mb-4 text-sm space-y-1">
    <p><strong>Voucher No:</strong> {form.invoiceNo}</p>
    <p><strong>Date:</strong> {form.entryDate}</p>
   <p>
                <strong>Customer:</strong>{" "}
                {
                  customers.find((s) => s.CUSTOMER_ID === form.customer)
                    ?.CUSTOMER_NAME
                }
              </p>
    <p><strong>Description:</strong> {form.description}</p>
    <p><strong>Total Amount:</strong> {form.totalAmount.toFixed(2)}</p>
  </div>

  <table className="w-full border-collapse border text-sm">
    <thead>
      <tr className="bg-gray-100">
        <th className="border px-2 py-1 text-left">Account Code</th>
        <th className="border px-2 py-1 text-left">Particular</th>
        <th className="border px-2 py-1 text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          <td className="border px-2 py-1">{row.accountCode}</td>
          <td className="border px-2 py-1">{row.particulars}</td>
          <td className="border px-2 py-1 text-right">{row.amount.toFixed(2)}</td>
        </tr>
      ))}
      <tr className="font-semibold">
        <td colSpan={2} className="text-right border px-2 py-1">Total</td>
        <td className="border px-2 py-1 text-right">{form.totalAmount.toFixed(2)}</td>
      </tr>
    </tbody>
  </table>

  <p className="mt-6 text-xs text-center border-t pt-2">
    Prepared By ____________________ &nbsp;&nbsp;&nbsp;
    Authorized Signatory ____________________ &nbsp;&nbsp;&nbsp;
    Recipient Signature ____________________
  </p>
</div>

        <div className="flex flex-col md:flex-row justify-between gap-4">
          <button
            type="button"
            onClick={handlePrint}
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
    <ReceiveList></ReceiveList>


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
                <strong>customer:</strong>{" "}
                {
                  customers.find((s) => s.CUSTOMER_ID === form.customer)
                    ?.CUSTOMER_NAME
                }
              </p>
              <p>
                <strong>GL Date:</strong> {form.glDate}
              </p>
              <p>
                <strong>Receive Code:</strong> {form.ReceiveCode}
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

export default ReceiveVoucher;
