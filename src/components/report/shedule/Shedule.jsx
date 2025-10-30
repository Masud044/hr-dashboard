import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import "frappe-gantt/dist/frappe-gantt.css";
import Gantt from "frappe-gantt";
import api from "../../../api/Api";

const Schedule = () => {
  const ganttRef = useRef(null);
  const [tasks, setTasks] = useState([]);
  const [workTypes, setWorkTypes] = useState([]);
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

  // const formatDate = (d) => {
  //   if (!d) return new Date().toISOString().slice(0, 10);
  //   const dateObj = typeof d === "string" ? new Date(d) : d;
  //   if (isNaN(dateObj)) return new Date().toISOString().slice(0, 10);
  //   const y = dateObj.getFullYear();
  //   const m = String(dateObj.getMonth() + 1).padStart(2, "0");
  //   const day = String(dateObj.getDate()).padStart(2, "0");
  //   return `${y}-${m}-${day}`;
  // };

  // ✅ Load all Work Types from contractor_api.php
  const loadWorkTypes = async () => {
    try {
      const res = await api.get("./contractor_api.php");
      if (res.data.success) {
        const list = res.data.data.map((c) => c.NAME);
        setWorkTypes(list);
      } else {
        toast.error("Failed to load work types");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching work types");
    }
  };

  // ✅ Load Gantt tasks
  const loadTasks = async (h_id = null) => {
  try {
    const q = h_id ? `?h_id=${encodeURIComponent(h_id)}` : "";
    const [taskRes, typeRes] = await Promise.all([
      api.get(`./gantt_api.php${q}`),
      api.get(`./contractor_api.php`)
    ]);

    if (!taskRes.data.success || !typeRes.data.success) {
      toast.error("Failed to load schedule or work types");
      return;
    }

    const rows = taskRes.data.data;
    const workTypes = typeRes.data.data.map((t) => t.WORK_TYPE || t.NAME);

    let minStart = null, maxEnd = null;
    const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB", "#8B5CF6"];

    const mappedTasks = rows.map((r, idx) => {
      const start = new Date(r.SCHEDULE_START_DATE);
      const end = new Date(r.SCHEDULE_END_DATE);
      if (!minStart || start < minStart) minStart = start;
      if (!maxEnd || end > maxEnd) maxEnd = end;

      return {
        id: String(r.L_ID),
        name: r.DESCRIPTION || "",
        start: start.toISOString().slice(0, 10),
        end: end.toISOString().slice(0, 10),
        progress: 0,
        workType: r.WORK_TYPE || r.CONTRACTOR_NAME || "Unassigned",
        colorIndex: idx % colors.length,
      };
    });

    setPlanStart(minStart?.toISOString().slice(0, 10) || "—");
    setPlanEnd(maxEnd?.toISOString().slice(0, 10) || "—");
    setTasks(mappedTasks);
    drawGantt(mappedTasks, workTypes);
  } catch (err) {
    console.error(err);
    toast.error("Network error loading schedule");
  }
};


const drawGantt = (data, workTypes = []) => {
  const el = ganttRef.current;
  if (!el) return;
  el.innerHTML = "";

  // Container setup
  const container = document.createElement("div");
  container.style.display = "grid";
  container.style.gridTemplateColumns = "180px 1fr";
  container.style.width = "100%";
  container.style.alignItems = "start";

  // Left column
  const leftCol = document.createElement("div");
  leftCol.style.display = "flex";
  leftCol.style.flexDirection = "column";
  leftCol.style.borderRight = "1px solid #e5e7eb";
  leftCol.style.background = "#f9fafb";

  const headerCell = document.createElement("div");
  headerCell.textContent = "WORK TYPE";
  headerCell.style.height = "40px";
  headerCell.style.display = "flex";
  headerCell.style.alignItems = "center";
  headerCell.style.justifyContent = "center";
  headerCell.style.fontWeight = "600";
  headerCell.style.borderBottom = "2px solid #d1d5db";
  leftCol.appendChild(headerCell);

  workTypes.forEach((w) => {
    const row = document.createElement("div");
    row.textContent = w;
    row.style.height = "40px";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.paddingLeft = "10px";
    row.style.fontWeight = "500";
    row.style.borderBottom = "1px solid #f1f1f1";
    leftCol.appendChild(row);
  });

  // Right column
  const rightCol = document.createElement("div");
  rightCol.style.position = "relative";
  rightCol.style.overflowX = "auto";

  const ganttWrapper = document.createElement("div");
  ganttWrapper.style.minWidth = "1200px"; // horizontal scroll
  rightCol.appendChild(ganttWrapper);

  container.appendChild(leftCol);
  container.appendChild(rightCol);
  el.appendChild(container);

  // Initialize Gantt with callbacks
   new Gantt(ganttWrapper, data, {
    view_mode: "Day",
    date_format: "YYYY-MM-DD",
    popup_trigger: "click",
    on_date_change: async (task, start, end) => {
      // horizontal drag or resize
      const t = data.find((d) => d.id === task.id);
      if (t) {
        t.start = start.toISOString().slice(0, 10);
        t.end = end.toISOString().slice(0, 10);
        // ✅ API update for persistence
        await api.put("./gantt_api.php", {
          L_ID: parseInt(t.id, 10),
          SCHEDULE_START_DATE: t.start,
          SCHEDULE_END_DATE: t.end,
          UPDATED_BY: 1,
        });
      }
    },
  });

  // Apply colors
  const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB", "#8B5CF6"];
  ganttWrapper.querySelectorAll(".bar").forEach((bar, i) => {
    const colorIdx = data[i]?.colorIndex ?? i;
    bar.style.fill = colors[colorIdx % colors.length];
  });

  // ===== Vertical row drag for workType only =====
  const wrappers = Array.from(ganttWrapper.querySelectorAll(".bar-wrapper"));
  let dragging = null;
  let startY = 0;

  wrappers.forEach((wrap) => {
    wrap.style.cursor = "grab";
    wrap.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      dragging = wrap;
      startY = e.clientY;
      wrap.style.opacity = "0.6";
      wrap.style.cursor = "grabbing";
    });
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    const moveY = e.clientY - startY;
    dragging.style.transform = `translateY(${moveY}px)`;
  });

 document.addEventListener("mouseup", async (e) => {
  if (!dragging) return;
  dragging.style.opacity = "1";
  dragging.style.cursor = "grab";
  dragging.style.transform = "";

  const barEl = dragging.querySelector(".bar");
  const taskId = barEl?.getAttribute("data-id");
  const draggedTask = data.find(t => t.id === taskId);
  if (!draggedTask) {
    dragging = null;
    return;
  }

  // Detect which row was dropped on
  const cursorY = e.clientY;
  const leftRows = Array.from(leftCol.querySelectorAll("div")).slice(1);
  let targetRowIndex = -1;
  for (let i = 0; i < leftRows.length; i++) {
    const rect = leftRows[i].getBoundingClientRect();
    if (cursorY >= rect.top && cursorY <= rect.bottom) {
      targetRowIndex = i;
      break;
    }
  }
  if (targetRowIndex === -1) {
    dragging = null;
    return;
  }

  const newWorkType = workTypes[targetRowIndex];
  if (!newWorkType || draggedTask.workType === newWorkType) {
    dragging = null;
    return;
  }

  // Find task currently in the target row
  const targetTask = data.find(t => t.workType === newWorkType);

  if (targetTask) {
    // 🔄 Swap both tasks' workTypes
    const oldWorkType = draggedTask.workType;
    draggedTask.workType = newWorkType;
    targetTask.workType = oldWorkType;

    await Promise.all([
      api.put("./gantt_api.php", {
        L_ID: parseInt(draggedTask.id, 10),
        WORK_TYPE: draggedTask.workType,
        UPDATED_BY: 1,
      }),
      api.put("./gantt_api.php", {
        L_ID: parseInt(targetTask.id, 10),
        WORK_TYPE: targetTask.workType,
        UPDATED_BY: 1,
      }),
    ]);
  } else {
    // 🟢 No task in target row → just move
    draggedTask.workType = newWorkType;
    await api.put("./gantt_api.php", {
      L_ID: parseInt(draggedTask.id, 10),
      WORK_TYPE: draggedTask.workType,
      UPDATED_BY: 1,
    });
  }

  // 🔹 Update Gantt visually
  // Move the dragged bar to new row, and swapped bar to old row
  const updatePositions = () => {
    const allWrappers = Array.from(ganttWrapper.querySelectorAll(".bar-wrapper"));
    allWrappers.forEach(wrapper => {
      const tId = wrapper.querySelector(".bar")?.getAttribute("data-id");
      const task = data.find(t => t.id === tId);
      if (task) {
        const rowIndex = workTypes.findIndex(w => w === task.workType);
        wrapper.style.top = `${rowIndex * 40 + 40}px`; // 40px row height
      }
    });
  };

  updatePositions();
  setTasks([...data]); // 🟢 trigger React redraw
  dragging = null;
});





};




  // const updateTaskDates = async (L_ID, s, e) => {
  //   try {
  //     const payload = {
  //       L_ID: parseInt(L_ID, 10),
  //       SCHEDULE_START_DATE: s,
  //       SCHEDULE_END_DATE: e,
  //       UPDATED_BY: 1,
  //     };
  //     const res = await api.put("./gantt_api.php", payload);
  //     if (res.data.success) {
  //       toast.success("Task updated successfully");
  //       loadTasks(form.H_ID || 46);
  //     } else toast.error("Failed to update task");
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error updating task");
  //   }
  // };

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
    loadTasks(46);
  }, []);

  useEffect(() => {
    if (tasks.length && workTypes.length) {
      drawGantt(tasks, workTypes);
    }
  }, [tasks, workTypes]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex flex-wrap gap-6 mb-4 text-gray-700">
        <p>
          <span className="font-semibold">Project plan start:</span> {planStart}
        </p>
        <p>
          <span className="font-semibold">Project plan end:</span> {planEnd}
        </p>
      </div>
     
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

      
          <div
        ref={ganttRef}
        className="bg-white p-4 rounded-lg shadow-lg mb-4 overflow-x-auto"
        style={{ minHeight: "300px" }}
       
      ></div>
     
     
      
    </div>
  );
};

export default Schedule;
