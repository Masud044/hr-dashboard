import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

export function DialogDemo({ open, setOpen, contractors = [], onSave }) {
  const [form, setForm] = useState({
    H_ID: "",
    C_P_ID: "",
    DESCRIPTION: "",
    SCHEDULE_START_DATE: "",
    SCHEDULE_END_DATE: "",
    CREATION_BY: 1,
  });

  useEffect(() => {
    if (open) {
      setForm({
        H_ID: "",
        C_P_ID: "",
        DESCRIPTION: "",
        SCHEDULE_START_DATE: "",
        SCHEDULE_END_DATE: "",
        CREATION_BY: 1,
      });
    }
  }, [open]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // ✅ Validation
    if (!form.C_P_ID || !form.SCHEDULE_START_DATE || !form.SCHEDULE_END_DATE) {
      toast.warning("Please fill all required fields");
      return;
    }
    
    console.log("Submitting form:", form); // ✅ Debug
    onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[400px] z-[104]">
        {/* <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
        </DialogHeader> */}

        <div className="grid gap-2">
          <div className="flex gap-4">
             <div className="grid gap-1">
            <Label htmlFor="H_ID">H_ID</Label>
            <Input 
              id="H_ID" 
              name="H_ID" 
              value={form.H_ID} 
              onChange={handleChange} 
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="C_P_ID">Contractor *</Label>
            <select
              id="C_P_ID"
              name="C_P_ID"
              value={form.C_P_ID}
              onChange={handleChange}
              className="border border-gray-300 rounded px-2 py-1.5"
              required
            >
              <option value="">Select Contractor</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          </div>
         

          <div className="flex gap-2">
            <div className="grid gap-1 flex-1">
              <Label htmlFor="SCHEDULE_START_DATE">Start Date *</Label>
              <Input
                type="date"
                id="SCHEDULE_START_DATE"
                name="SCHEDULE_START_DATE"
                value={form.SCHEDULE_START_DATE}
                onChange={handleChange}
                required
              />
            </div>
            <div className="grid gap-1 flex-1">
              <Label htmlFor="SCHEDULE_END_DATE">End Date *</Label>
              <Input
                type="date"
                id="SCHEDULE_END_DATE"
                name="SCHEDULE_END_DATE"
                value={form.SCHEDULE_END_DATE}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="DESCRIPTION">Description</Label>
            <Input
              id="DESCRIPTION"
              name="DESCRIPTION"
              value={form.DESCRIPTION}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
          <Button 
            type="button" 
            onClick={handleSubmit}
            className="bg-purple-800 hover:bg-purple-900"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}