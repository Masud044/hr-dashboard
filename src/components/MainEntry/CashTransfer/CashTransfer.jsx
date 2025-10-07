import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Select from "react-select";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import api from "../../../api/Api";

import PageTitle from "../../RouteTitle";
import CashTransferList from "./CashTransferList";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const CashTransfer = () => {
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];

  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState({
    entryDate: today,
    receive_desc: "",
    toCode: "",
    fromCode: "",
    amount: "",
    receive: "",
    glDate: today,
    supporting: "",
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const res = await api.get("/case_flow_account_code.php");
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

  // ---------- MUTATION ----------
  const mutation = useMutation({
    mutationFn: async ({ payload }) => {
      const apiUrl = "/CashFlowAdd.php";
      const res = await api.post(apiUrl, payload);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status === "success") {
        setMessage("cash-transfer successfully!");
        setForm({
          entryDate: new Date().toISOString().split("T")[0],
          description: "",
          amount: "",
          toCode: "",
          fromCode: "",
          cash: "",
          supporting: "",
        });

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

  const handleSubmit = () => {
    setMessage("");

    // Required fields check
    if (
      !form.entryDate ||
      !form.amount ||
      !form.toCode ||
      !form.fromCode ||
      !form.glDate ||
      !form.description
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    const payload = {
      trans_date: form.entryDate,
      receive_desc: form.description || "Cash Transfer",
      fromCode: form.fromCode,
      toCode: form.toCode,
      amount: parseFloat(form.amount) || 0,
      receive: parseFloat(form.accountId) || 0,
      GL_ENTRY_DATE: form.glDate,
      supporting: form.supporting || "0",
    };
    mutation.mutate({ payload });
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
        useCORS: true, // allow cross-origin images
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
      pdf.save(`Cash_Voucher_${form.invoiceNo || "new"}.pdf`);
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

            {/* Supporting */}
            {/* <div className="grid grid-cols-3 opacity-60 py-2  px-3 items-center ">
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
            </div> */}
            <div className="grid grid-cols-3  px-3 opacity-60  items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                Amount
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="col-span-2 w-40 border rounded py-1   bg-white "
              />
            </div>
            {/* <div className="grid grid-cols-3  px-3 opacity-60  items-center py-3">
            <label className="font-medium block text-sm  text-foreground">
              Available balance
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="col-span-2 w-40 border rounded py-1   bg-white "
            />
          </div> */}
            <div className="grid grid-cols-3 opacity-60  px-3 items-center  py-1">
              <label className="font-medium block text-sm  text-foreground">
                From Code
              </label>
              <Select
                options={accounts}
                value={
                  accounts.find((acc) => acc.value === form.fromCode) || null
                }
                onChange={(selected) =>
                  setForm({
                    ...form,
                    fromCode: selected ? selected.value : "",
                  })
                }
                placeholder="Enter account..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px", // match other inputs
                    height: "40px",
                    fontSize: "0.875rem", // text-sm
                    borderRadius: "0.375rem", // same as input rounded
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "40px", // fix value container height
                    padding: "0 8px",
                  }),
                  input: (base) => ({
                    ...base,
                    margin: 0,
                    padding: 0,
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "40px", // arrow aligned
                  }),
                  singleValue: (base) => ({
                    ...base,
                    lineHeight: "40px", // center text vertically
                  }),
                }}
                className="col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 opacity-60   px-3 items-center py-3">
              <label className="font-medium block text-sm  text-foreground">
                To Code
              </label>
              <Select
                options={accounts}
                value={
                  accounts.find((acc) => acc.value === form.toCode) || null
                }
                onChange={(selected) =>
                  setForm({
                    ...form,
                    // accountId: selected ? selected.value : "",
                    toCode: selected ? selected.value : "",
                  })
                }
                placeholder="Enter account..."
                isClearable
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "40px", // match other inputs
                    height: "40px",
                    fontSize: "0.875rem", // text-sm
                    borderRadius: "0.375rem", // same as input rounded
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "40px", // fix value container height
                    padding: "0 8px",
                  }),
                  input: (base) => ({
                    ...base,
                    margin: 0,
                    padding: 0,
                  }),
                  indicatorsContainer: (base) => ({
                    ...base,
                    height: "40px", // arrow aligned
                  }),
                  singleValue: (base) => ({
                    ...base,
                    lineHeight: "40px", // center text vertically
                  }),
                }}
                className="col-span-2"
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

        {/* Printable PDF Section */}
        <div
          id="print-area"
          className="hidden print:block p-8 bg-white text-black"
        >
          <h1 className="text-xl font-bold text-center mb-2">Cash Transfer</h1>
          <div className="border p-3 mb-4 text-sm space-y-1">
            <p>
              <strong>Date:</strong> {form.entryDate}
            </p>
            <p>
              <strong>Amount:</strong> {form.amount}
            </p>
            <p>
              <strong>To Code:</strong> {form.toCode}
            </p>
            <p>
              <strong>From code:</strong> {form.fromCode}
            </p>
            <p>
              <strong>GL Date:</strong> {form.glDate}
            </p>

            <p>
              <strong>Description:</strong> {form.description}
            </p>
          </div>

          <p className="mt-6 text-xs text-center border-t pt-2">
            Prepared By ____________________ &nbsp;&nbsp;&nbsp; Authorized
            Signatory ____________________ &nbsp;&nbsp;&nbsp; Recipient
            Signature ____________________
          </p>
        </div>

        <div className="flex justify-between items-center gap-10 mb-4">
          <button
            type="button"
            onClick={handlePrint}
            className="bg-green-500 cursor-pointer text-white px-12 py-2 rounded-lg"
          >
            print
          </button>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-green-500 cursor-pointer text-white px-12 py-2 rounded-lg"
          >
            {mutation.isPending ? "Submitting..." : "Save"}
          </button>
        </div>
      </div>
      <CashTransferList></CashTransferList>

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
                <strong>Amount:</strong> {form.amount}
              </p>
              <p>
                <strong>To Code:</strong> {form.toCode}
              </p>
              <p>
                <strong>From code:</strong> {form.fromCode}
              </p>

              {/* <p>
                <strong>No. of Supporting:</strong> {form.supporting}
              </p> */}
              <p>
                <strong>Description:</strong> {form.description}
              </p>

              <p>
                <strong>GL Date:</strong> {form.glDate}
              </p>

              {/* <h3 className="font-semibold mt-2">Accounts:</h3>
              <ul className="list-disc pl-5">
                {rows.map((row, r) => (
                  <li key={r}>
                    {row.accountCode} - {row.particulars} - Debit: {row.debit},
                    Credit: {row.credit}
                  </li>
                ))}
              </ul> */}
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

export default CashTransfer;
