import React, { useEffect, useState } from "react";
import Timeline, { TimelineHeaders, DateHeader } from "react-calendar-timeline";
import "react-calendar-timeline/dist/style.css";
import { toast } from "react-toastify";
import api from "../../../api/Api";

const Shedule = () => {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [planStart, setPlanStart] = useState("—");
  const [planEnd, setPlanEnd] = useState("—");
  const [form, setForm] = useState({
    H_ID: "",
    C_P_ID: "",
    DESCRIPTION: "",
    SCHEDULE_START_DATE: "",
    SCHEDULE_END_DATE: "",
    CREATION_BY: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

useEffect(() => {
  const timer = setInterval(() => setCurrentTime(new Date()), 1000); // update every second
  return () => clearInterval(timer);
}, []);

  // ✅ Load Work Types from contractor_api.php
  const loadWorkTypes = async () => {
    try {
      const res = await api.get("./contractor_api.php");
      if (res.data.success) {
        const list = res.data.data.map((c, i) => ({
          id: i + 1,
          title: c.WORK_TYPE || c.NAME,
        }));
        setGroups(list);
      } else toast.error("Failed to load work types");
    } catch (err) {
      console.error(err);
      toast.error("Error fetching work types");
    }
  };

  // ✅ Load Tasks from gantt_api.php
  const loadTasks = async (h_id = null) => {
    try {
      const q = h_id ? `?h_id=${encodeURIComponent(h_id)}` : "";
      const taskRes = await api.get(`./gantt_api.php${q}`);

      if (!taskRes.data.success) {
        toast.error("Failed to load schedule");
        return;
      }

      const rows = taskRes.data.data;
      if (!rows.length) {
        setTasks([]);
        return;
      }

      // Find project start & end
      let minStart = new Date(rows[0].SCHEDULE_START_DATE);
      let maxEnd = new Date(rows[0].SCHEDULE_END_DATE);

      const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB", "#8B5CF6"];

      const mappedTasks = rows.map((r, idx) => {
        const start = new Date(r.SCHEDULE_START_DATE);
        const end = new Date(r.SCHEDULE_END_DATE);
        if (start < minStart) minStart = start;
        if (end > maxEnd) maxEnd = end;

        // ✅ Find matching work type ID
        const groupMatch = groups.find(
          (g) => g.title === (r.WORK_TYPE || "").trim()
        );

        return {
          id: r.L_ID || idx + 1,
          group: groupMatch ? groupMatch.id : 9999, // fallback if not matched
          title: r.DESCRIPTION,
          start_time: start,
          end_time: end,
          itemProps: {
            style: {
              background: colors[idx % colors.length],
              color: "#fff",
              borderRadius: "6px",
            },
          },
        };
      });

      setPlanStart(minStart.toISOString().slice(0, 10));
      setPlanEnd(maxEnd.toISOString().slice(0, 10));
      setTasks(mappedTasks);
    } catch (err) {
      console.error(err);
      toast.error("Network error loading tasks");
    }
  };

  // ✅ Create Task
  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      H_ID: parseInt(form.H_ID, 10),
      C_P_ID: parseInt(form.C_P_ID, 10),
      DESCRIPTION: form.DESCRIPTION,
      SCHEDULE_START_DATE: form.SCHEDULE_START_DATE,
      SCHEDULE_END_DATE: form.SCHEDULE_END_DATE,
      CREATION_BY: parseInt(form.CREATION_BY || 1, 10),
    };

    try {
      const res = await api.post("./gantt_api.php", payload);
      if (res.data.success) {
        toast.success("Task added");
        setForm({
          H_ID: "",
          C_P_ID: "",
          DESCRIPTION: "",
          SCHEDULE_START_DATE: "",
          SCHEDULE_END_DATE: "",
          CREATION_BY: "",
        });
        loadTasks(payload.H_ID);
      } else toast.error("Insert failed");
    } catch (err) {
      console.error(err);
      toast.error("Error adding task");
    }
  };

  useEffect(() => {
    loadWorkTypes();
  }, []);

  useEffect(() => {
    if (groups.length > 0) loadTasks(46); // load example project
  }, [groups]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header Info */}
      <div className="flex flex-wrap gap-6 mb-4 text-gray-700">
        <p>
          <span className="font-semibold">Project plan start:</span> {planStart}
        </p>
        <p>
          <span className="font-semibold">Project plan end:</span> {planEnd}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleCreate}
        className="bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-3 items-center mb-4"
      >
        {[
          { name: "H_ID", type: "number", placeholder: "H_ID (e.g. 46)", w: "w-28" },
          { name: "C_P_ID", type: "number", placeholder: "C_P_ID", w: "w-32" },
          { name: "DESCRIPTION", type: "text", placeholder: "Process name", w: "w-56" },
          { name: "SCHEDULE_START_DATE", type: "date", w: "w-40" },
          { name: "SCHEDULE_END_DATE", type: "date", w: "w-40" },
          { name: "CREATION_BY", type: "number", placeholder: "Your user id", w: "w-32" },
        ].map((f) => (
          <input
            key={f.name}
            type={f.type}
            name={f.name}
            value={form[f.name]}
            onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            placeholder={f.placeholder}
            required={["SCHEDULE_START_DATE", "SCHEDULE_END_DATE"].includes(f.name)}
            className={`${f.w} border border-gray-300 rounded-md px-2 py-1`}
          />
        ))}
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700"
        >
          Add task
        </button>
      </form>

      {/* ✅ Timeline */}
      <div className="bg-white p-4 rounded-lg shadow-lg">
        {groups.length && tasks.length ? (
         <Timeline
  groups={groups}
  items={tasks}
  defaultTimeStart={new Date(new Date().setDate(new Date().getDate() - 7))}
  defaultTimeEnd={new Date(new Date().setDate(new Date().getDate() + 14))}
  canMove
  canResize="both"
  lineHeight={45}
  itemHeightRatio={0.9}
  sidebarWidth={150}
  stackItems
>
  <TimelineHeaders className="sticky">
    <DateHeader unit="primaryHeader" />
    <DateHeader />
  </TimelineHeaders>

  {/* Add "Today" line */}
  <div
    style={{
      position: "absolute",
      top: 0,
      bottom: 0,
      left: `${((currentTime.getTime() - new Date(new Date().setDate(new Date().getDate() - 7)).getTime()) /
             (new Date(new Date().setDate(new Date().getDate() + 14)).getTime() -
              new Date(new Date().setDate(new Date().getDate() - 7)).getTime())) * 100}%`,
      width: "2px",
      backgroundColor: "red",
      zIndex: 10,
    }}
  />
</Timeline>

        ) : (
          <p className="text-center text-gray-500 py-10">Loading timeline...</p>
        )}
      </div>
    </div>
  );
};

export default Shedule;
