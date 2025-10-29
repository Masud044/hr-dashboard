import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "frappe-gantt/dist/frappe-gantt.css";
import Gantt from "frappe-gantt";
import api from "../../../api/Api";

const GanttChart = () => {
  const ganttRef = useRef(null);
  const [tasks, setTasks] = useState([]);
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

  const formatDate = (d) => {
    if (!d) return new Date().toISOString().slice(0, 10);
    const dateObj = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dateObj)) return new Date().toISOString().slice(0, 10);
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const loadTasks = async (h_id = null) => {
    try {
      const q = h_id ? `?h_id=${encodeURIComponent(h_id)}` : "";
      const res = await api.get(`./gantt_api.php${q}`);
      const data = res.data;

      if (!data.success) {
        toast.error("Failed to load schedule");
        return;
      }

      const rows = data.data;
      let minStart = null,
        maxEnd = null;

      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]; // Tailwind colors

      const mappedTasks = rows.map((r, idx) => {
        let start = r.SCHEDULE_START_DATE
          ? new Date(r.SCHEDULE_START_DATE)
          : new Date();
        let end = r.SCHEDULE_END_DATE ? new Date(r.SCHEDULE_END_DATE) : new Date(start);

        if (isNaN(start.getTime())) start = new Date();
        if (isNaN(end.getTime())) end = new Date(start);

        if (!minStart || start < minStart) minStart = start;
        if (!maxEnd || end > maxEnd) maxEnd = end;

        return {
          id: String(r.L_ID),
          name: r.DESCRIPTION || `Process ${r.L_ID}`,
          start: start.toISOString().slice(0, 10),
          end: end.toISOString().slice(0, 10),
          progress: 0,
          custom: { H_ID: r.H_ID, C_P_ID: r.C_P_ID },
          // Assign a color class dynamically
          custom_class: `process-${idx % colors.length}`,
        };
      });

      setPlanStart(minStart ? minStart.toISOString().slice(0, 10) : "—");
      setPlanEnd(maxEnd ? maxEnd.toISOString().slice(0, 10) : "—");
      setTasks(mappedTasks);

      drawGantt(mappedTasks);
    } catch (err) {
      console.error(err);
      toast.error("Network error loading schedule");
    }
  };

  const drawGantt = (data) => {
    const el = ganttRef.current;
    if (!el) return;
    el.innerHTML = "";
    if (!data || data.length === 0) return;

    new Gantt(el, data, {
      view_mode: "Day",
      date_format: "YYYY-MM-DD",
      popup_trigger: "click",
      on_date_change: (task, start, end) => {
        const s = formatDate(start);
        const e = formatDate(end);
        updateTaskDates(task.id, s, e);
      },
    });

    // Apply dynamic colors
    const bars = el.querySelectorAll(".bar");
    const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB"];
    bars.forEach((bar, i) => {
      const cls = data[i]?.custom_class;
      const idx = parseInt(cls?.split("-")[1] ?? 0, 10);
      bar.style.fill = colors[idx % colors.length];
    });
  };

  useEffect(() => {
    drawGantt(tasks);
  }, [tasks]);

  const updateTaskDates = async (L_ID, s, e) => {
    try {
      const payload = { L_ID: parseInt(L_ID, 10), SCHEDULE_START_DATE: s, SCHEDULE_END_DATE: e, UPDATED_BY: 1 };
      const res = await api.put("./gantt_api.php", payload);
      if (res.data.success) {
        toast.success("Task updated successfully");
        loadTasks(form.H_ID || 46);
      } else toast.error("Failed to update task");
    } catch (err) {
      console.error(err);
      toast.error("Error updating task");
    }
  };

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
        setForm({ H_ID: "", C_P_ID: "", DESCRIPTION: "", SCHEDULE_START_DATE: "", SCHEDULE_END_DATE: "", CREATION_BY: "" });
        loadTasks(payload.H_ID);
      } else toast.error("Insert failed");
    } catch (err) {
      console.error(err);
      toast.error("Error adding task");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete task " + id + "?")) return;
    try {
      const res = await api.delete("./gantt_api.php", { data: { L_ID: parseInt(id, 10) } });
      if (res.data.success) {
        toast.success("Task deleted");
        loadTasks(form.H_ID || 46);
      } else toast.error("Delete failed");
    } catch (err) {
      console.error(err);
      toast.error("Network error deleting task");
    }
  };

  useEffect(() => {
    loadTasks(46);
  }, []);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* <h2 className="text-2xl font-semibold mb-2">Project Schedule — Interactive Gantt</h2> */}
      <div className="flex flex-wrap gap-6 mb-4 text-gray-700">
        <p><span className="font-semibold">Project plan start:</span> {planStart}</p>
        <p><span className="font-semibold">Project plan end:</span> {planEnd}</p>
      </div>

      <form onSubmit={handleCreate} className="bg-white p-4 rounded-lg shadow-md flex flex-wrap gap-3 items-center mb-4">
        {[{ name: "H_ID", type: "number", placeholder: "H_ID (e.g. 46)", w: "w-28" },
          { name: "C_P_ID", type: "number", placeholder: "C_P_ID", w: "w-32" },
          { name: "DESCRIPTION", type: "text", placeholder: "Process name", w: "w-56" },
          { name: "SCHEDULE_START_DATE", type: "date", w: "w-40" },
          { name: "SCHEDULE_END_DATE", type: "date", w: "w-40" },
          { name: "CREATION_BY", type: "number", placeholder: "Your user id", w: "w-32" }
        ].map((f) => (
          <input key={f.name} type={f.type} name={f.name} value={form[f.name]} onChange={(e) => setForm({ ...form, [f.name]: e.target.value })} placeholder={f.placeholder} required={["SCHEDULE_START_DATE", "SCHEDULE_END_DATE"].includes(f.name)} className={`${f.w} border border-gray-300 rounded-md px-2 py-1`} />
        ))}
        <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700">Add task</button>
      </form>

      <div ref={ganttRef} className="bg-white p-4 rounded-lg shadow-lg mb-4 overflow-x-auto" style={{ minHeight: "300px" }}></div>

      <div className="bg-white rounded-lg shadow p-3">
        {tasks.map((t) => (
          <div key={t.id} className="flex justify-between border-b border-gray-100 py-2 items-center">
            <div><strong>{t.name}</strong> &nbsp; [{t.id}]<br />{t.start} → {t.end}</div>
            <button onClick={() => handleDelete(t.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
