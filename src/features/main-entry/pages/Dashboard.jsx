import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";

import moment from "moment";

import { toast } from "react-toastify";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DashboardTable } from "../components/DashboardTable";
import api from "@/api/Api";
import { SectionContainer } from "@/components/SectionContainer";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { id } = useParams(); // H_ID

  useEffect(() => {
    window.scrollTo({
      top: 80,
      behavior: "smooth",
    });
  }, [id]);

  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔹 Form state (header only)
  const [formData, setFormData] = useState({
    H_ID: "",
    DESCRIPTION: "",
    PROJECT_START_PLAN: "",
    PROJECT_END_PLAN: "",
  });

  // 🔹 Fetch header data
  const { data } = useQuery({
    queryKey: ["schedule-header", id],
    queryFn: async () => {
      const res = await api.get(`/shedule_header.php?hid=${id}`);
      return res.data?.data || {};
    },
    enabled: !!id,
  });
  console.log(data);

  // 🔹 Populate form when data arrives
  useEffect(() => {
    if (!data) return;

    setFormData({
      H_ID: data.H_ID || "",
      DESCRIPTION: data.DESCRIPTION || "",
      PROJECT_START_PLAN: data.PROJECT_START_PLAN
        ? moment(data.PROJECT_START_PLAN, "DD-MMM-YY").format("YYYY-MM-DD")
        : "",
      PROJECT_END_PLAN: data.PROJECT_END_PLAN
        ? moment(data.PROJECT_END_PLAN, "DD-MMM-YY").format("YYYY-MM-DD")
        : "",
    });
  }, [data]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Mutation for updating header
  const mutation = useMutation({
    mutationFn: async (formData) => {
      const payload = {
        h_id: Number(formData.H_ID),
        description: formData.DESCRIPTION,
        project_start_plan: moment(formData.PROJECT_START_PLAN).format(
          "DD-MMM-YY"
        ),
        project_end_plan: moment(formData.PROJECT_END_PLAN).format("DD-MMM-YY"),
      };

      const res = await api.put("/shedule_header.php", payload);
      if (res.data?.success) return res.data;
      throw new Error(res.data?.message || "Update failed");
    },
    onSuccess: () => {
      toast.success("Header updated successfully!");
      queryClient.invalidateQueries(["schedules"]);
      queryClient.invalidateQueries(["schedule-header", id]);
    },
    onError: () => {
      toast.error("Failed to update header.");
    },
  });

  // 🔹 Submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.DESCRIPTION ||
      !formData.PROJECT_START_PLAN ||
      !formData.PROJECT_END_PLAN
    ) {
      toast.error("Please fill all fields.");

      return;
    }
    mutation.mutate(formData);
  };

  return (
    <SectionContainer>
      <div className="">
        <div className="p-6 bg-white shadow rounded-lg mt-8">
          <h2 className="font-semibold mb-6 text-sm text-gray-800 border-b pb-2">
            {isEditing ? "Edit Schedule Header" : "Add New Schedule Header"}
          </h2>

          {message.text && (
            <div
              className={`mb-4 p-3 rounded text-white ${
                message.type === "success" ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* DESCRIPTION */}
            <div className="flex flex-col gap-1">
              <Label className="text-gray-900 text-sm font-medium">
                Description
              </Label>
              <Textarea
                type="text"
                name="DESCRIPTION"
                value={formData.DESCRIPTION}
                onChange={handleChange}
                className="border border-gray-300 rounded bg-gray-50
                 px-4 py-3 
                 text-[15px]
                 w-2/3 
                 focus:outline-none focus:ring-2 focus:ring-green-400"
                style={{ height: "45px" }} // 👈 your custom height
              />
            </div>

            <div className="grid grid-cols-4 items-center  gap-4">
              {/* PROJECT START PLAN */}
              <div className="flex flex-col gap-1">
                <Label className="text-gray-900 text-sm font-medium">
                  Project Start Plan
                </Label>
                <Input
                  type="date"
                  name="PROJECT_START_PLAN"
                  value={formData.PROJECT_START_PLAN}
                  onChange={handleChange}
                  className="border border-gray-300 rounded  bg-gray-50
                 px-4 py-3 
                 text-[15px]
                 w-full
                 focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ height: "45px" }}
                />
              </div>

              {/* PROJECT END PLAN */}
              <div className="flex flex-col gap-1">
                <Label className="text-gray-900 text-sm font-medium">
                  Project End Plan
                </Label>
                <Input
                  type="date"
                  name="PROJECT_END_PLAN"
                  value={formData.PROJECT_END_PLAN}
                  onChange={handleChange}
                  className="border border-gray-300 rounded bg-gray-50
                 px-4 py-3 
                 text-[15px]
                 w-full
                 focus:outline-none focus:ring-2 focus:ring-green-400"
                  style={{ height: "45px" }}
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-4">
              {/* <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-green-600 text-white px-5 py-3 rounded 
                 flex items-center gap-2 
                 hover:bg-green-500 text-sm"
              >
                <Save size={16} />
                {mutation.isPending ? "Saving..." : "Save Header"}
              </button> */}

              {/* save button */}
              <Button  type="submit"
                disabled={mutation.isPending} >
                
                <Save size={16} />
                {mutation.isPending ? "Saving..." : "Save Header"}
              </Button>
            </div>
          </form>
        </div>

        {/* <ScheduleHeaderListTwo></ScheduleHeaderListTwo> */}
        <DashboardTable></DashboardTable>
      </div>
    </SectionContainer>
  );
};

export default Dashboard;
