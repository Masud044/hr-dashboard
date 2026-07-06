// src\features\invoice\invoice-edit-page.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { useContractors, useInvoiceById, useProjects, useUpdateInvoice } from "./queries";

const initialState = {
  PROJECT_ID: "",
  AREA_TYPE: "",
  AMOUNT: "",
  PURCHASED_BY: "",
  CONTRACTOR_ID: "",
  MATERIAL_TYPE: "",
  MATERIAL_OTHER: "",
  PAYMENT_METHOD: "",
  PAYMENT_REF: "",
};

// const projectOptions = [
//   { label: "Project 101", value: "101" },
//   { label: "Project 202", value: "202" },
//   { label: "Project 303", value: "303" },
// ];

// const contractorOptions = [
//   { label: "Contractor A", value: "1" },
//   { label: "Contractor B", value: "2" },
//   { label: "Contractor C", value: "3" },
// ];

export function InvoiceEditPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const updateInvoice = useUpdateInvoice();
  const { data, isLoading } = useInvoiceById(id);
  const [form, setForm] = useState(initialState);
  const [receiptFile, setReceiptFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [receiptError, setReceiptError] = useState("");

  const { data: projects = [] } = useProjects();
const { data: contractors = [] } = useContractors();

const projectOptions = projects.map((p) => ({ label: p.P_NAME, value: String(p.P_ID) }));
const contractorOptions = contractors.map((c) => ({ label: c.CONTRATOR_NAME, value: String(c.CONTRATOR_ID) }));

  const isContractorPurchase = form.PURCHASED_BY === "CONTRACTOR";
  const invoiceDetail = data?.data || data || null;
  const existingReceiptFilename = invoiceDetail?.RECEIPT_FILENAME || invoiceDetail?.RECEIPT_FILE_NAME || null;

  useEffect(() => {
    if (invoiceDetail) {
      setForm({
        PROJECT_ID: invoiceDetail.PROJECT_ID || invoiceDetail.PROJECTID || invoiceDetail.PROJECT || "",
        AREA_TYPE: invoiceDetail.AREA_TYPE || "",
        AMOUNT: invoiceDetail.AMOUNT ?? "",
        PURCHASED_BY: invoiceDetail.PURCHASED_BY || "",
        CONTRACTOR_ID: invoiceDetail.CONTRACTOR_ID || "",
        MATERIAL_TYPE: invoiceDetail.MATERIAL_TYPE || "",
        MATERIAL_OTHER: invoiceDetail.MATERIAL_OTHER || "",
        PAYMENT_METHOD: invoiceDetail.PAYMENT_METHOD || "",
        PAYMENT_REF: invoiceDetail.PAYMENT_REF || "",
      });
    }
  }, [invoiceDetail]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.PROJECT_ID) nextErrors.PROJECT_ID = "Project is required.";
    if (!form.AREA_TYPE) nextErrors.AREA_TYPE = "Area type is required.";
    if (!form.AMOUNT) nextErrors.AMOUNT = "Amount is required.";
    if (!form.PURCHASED_BY) nextErrors.PURCHASED_BY = "Purchased by is required.";
    if (!form.PAYMENT_METHOD) nextErrors.PAYMENT_METHOD = "Payment method is required.";

    if (receiptFile) {
      const maxSize = 1024 * 1024;
      if (receiptFile.size > maxSize) {
        setReceiptError("Receipt file must be 1MB or smaller.");
      } else {
        setReceiptError("");
      }
    } else {
      setReceiptError("");
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0 && !receiptError;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setReceiptFile(null);
      setReceiptError("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setReceiptFile(null);
      setReceiptError("Only JPG, PNG, and PDF files are allowed.");
      return;
    }

    const maxSize = 1024 * 1024;
    if (file.size > maxSize) {
      setReceiptFile(null);
      setReceiptError("Receipt file must be 1MB or smaller.");
      return;
    }

    setReceiptFile(file);
    setReceiptError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value !== "") formData.append(key, value);
    });

    if (receiptFile) {
      formData.append("RECEIPT", receiptFile);
    }

    try {
      await updateInvoice.mutateAsync({ id, formData });
      toast.success("Invoice updated successfully.");
      navigate("/dashboard/invoices");
    } catch (error) {
      toast.error(error?.message || "Failed to update invoice.");
    }
  };

  const selectedProject = useMemo(
    () => projectOptions.find((option) => option.value === form.PROJECT_ID),
    [form.PROJECT_ID],
  );

  const selectedContractor = useMemo(
    () => contractorOptions.find((option) => option.value === form.CONTRACTOR_ID),
    [form.CONTRACTOR_ID],
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Button type="button" variant="outline" size="icon" onClick={() => navigate("/dashboard/invoices")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update invoice details and receipt.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading invoice...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Combobox
                items={projectOptions.map((option) => option.label)}
                value={selectedProject?.label || ""}
                onValueChange={(label) => {
                  const option = projectOptions.find((item) => item.label === label);
                  updateField("PROJECT_ID", option?.value || "");
                }}
              >
                <ComboboxInput placeholder="Select project" />
                <ComboboxContent>
                  <ComboboxEmpty>No projects found.</ComboboxEmpty>
                  <ComboboxList>
                    {(label) => (
                      <ComboboxItem key={label} value={label}>
                        {label}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              {errors.PROJECT_ID ? <p className="text-sm text-destructive">{errors.PROJECT_ID}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaType">Area Type</Label>
              <Input
                id="areaType"
                value={form.AREA_TYPE}
                onChange={(event) => updateField("AREA_TYPE", event.target.value)}
                className={errors.AREA_TYPE ? "border-destructive" : ""}
              />
              {errors.AREA_TYPE ? <p className="text-sm text-destructive">{errors.AREA_TYPE}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={form.AMOUNT}
                onChange={(event) => updateField("AMOUNT", event.target.value)}
                className={errors.AMOUNT ? "border-destructive" : ""}
              />
              {errors.AMOUNT ? <p className="text-sm text-destructive">{errors.AMOUNT}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasedBy">Purchased By</Label>
              {/* <Select value={form.PURCHASED_BY} onValueChange={(value) => updateField("PURCHASED_BY", value)}> */}
              <Select
  value={form.PURCHASED_BY}
  onValueChange={(value) => {
    updateField("PURCHASED_BY", value);
    if (value !== "CONTRACTOR") {
      updateField("CONTRACTOR_ID", "");
    }
  }}
>
                <SelectTrigger id="purchasedBy" className={errors.PURCHASED_BY ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select buyer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OWNER">Owner</SelectItem>
                  <SelectItem value="CONTRACTOR">Contractor</SelectItem>
                </SelectContent>
              </Select>
              {errors.PURCHASED_BY ? <p className="text-sm text-destructive">{errors.PURCHASED_BY}</p> : null}
            </div>

            {isContractorPurchase ? (
              <div className="space-y-2">
                <Label htmlFor="contractor">Contractor</Label>
                <Combobox
                  items={contractorOptions.map((option) => option.label)}
                  value={selectedContractor?.label || ""}
                  onValueChange={(label) => {
                    const option = contractorOptions.find((item) => item.label === label);
                    updateField("CONTRACTOR_ID", option?.value || "");
                  }}
                >
                  <ComboboxInput placeholder="Select contractor" />
                  <ComboboxContent>
                    <ComboboxEmpty>No contractors found.</ComboboxEmpty>
                    <ComboboxList>
                      {(label) => (
                        <ComboboxItem key={label} value={label}>
                          {label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="materialType">Material Type</Label>
              <Input
                id="materialType"
                value={form.MATERIAL_TYPE}
                onChange={(event) => updateField("MATERIAL_TYPE", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="materialOther">Material Other</Label>
              <Input
                id="materialOther"
                value={form.MATERIAL_OTHER}
                onChange={(event) => updateField("MATERIAL_OTHER", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={form.PAYMENT_METHOD} onValueChange={(value) => updateField("PAYMENT_METHOD", value)}>
                <SelectTrigger id="paymentMethod" className={errors.PAYMENT_METHOD ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="TRANSACTION">Transaction</SelectItem>
                </SelectContent>
              </Select>
              {errors.PAYMENT_METHOD ? <p className="text-sm text-destructive">{errors.PAYMENT_METHOD}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentRef">Payment Reference</Label>
              <Input
                id="paymentRef"
                value={form.PAYMENT_REF}
                onChange={(event) => updateField("PAYMENT_REF", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt</Label>
            {existingReceiptFilename ? (
              <div className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
                Existing receipt: {existingReceiptFilename}
              </div>
            ) : null}
            <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-background/40 p-4">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <Input id="receipt" type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleFileChange} className="border-0 p-0 shadow-none" />
            </div>
            {receiptError ? <p className="text-sm text-destructive">{receiptError}</p> : null}
            {receiptFile ? <p className="text-sm text-muted-foreground">Selected: {receiptFile.name}</p> : null}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/invoices")}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateInvoice.isPending}>
              {updateInvoice.isPending ? "Saving..." : "Update Invoice"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export default InvoiceEditPage;
