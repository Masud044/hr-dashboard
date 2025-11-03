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

  // Load all Work Types from contractor_api.php
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

  // Load Gantt tasks
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
      // Ensure workTypes includes all unique work types from tasks and from the API
      const apiWorkTypes = typeRes.data.data.map((t) => t.NAME);

      let minStart = null, maxEnd = null;
      const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB", "#8B5CF6"];

      const mappedTasks = rows
        // Filter out tasks without valid dates to prevent '1969' dates from messing up the chart
        .filter(r => r.SCHEDULE_START_DATE && r.SCHEDULE_END_DATE) 
        .map((r, idx) => {
          const start = new Date(r.SCHEDULE_START_DATE);
          const end = new Date(r.SCHEDULE_END_DATE);
          
          if (isNaN(start) || isNaN(end)) return null; // Skip invalid dates

          if (!minStart || start < minStart) minStart = start;
          if (!maxEnd || end > maxEnd) maxEnd = end;

          const taskWorkType = r.WORK_TYPE || r.CONTRACTOR_NAME || apiWorkTypes[idx % apiWorkTypes.length] || "Unassigned";

          return {
            id: String(r.L_ID),
            name: r.DESCRIPTION ,
            start: start.toISOString().slice(0, 10),
            end: end.toISOString().slice(0, 10),
            progress: 0,
            workType: taskWorkType, // Work type is crucial for vertical positioning
            colorIndex: idx % colors.length,
          };
        }).filter(t => t !== null);
      
      const allWorkTypes = [...new Set([...apiWorkTypes, ...mappedTasks.map(t => t.workType)])];
      setWorkTypes(allWorkTypes);

      setPlanStart(minStart?.toISOString().slice(0, 10) || "—");
      setPlanEnd(maxEnd?.toISOString().slice(0, 10) || "—");
      setTasks(mappedTasks);
      // NOTE: drawGantt will be called by the useEffect hook
      // drawGantt(mappedTasks, allWorkTypes); 
    } catch (err) {
      console.error(err);
      toast.error("Network error loading schedule");
    }
  };


  const drawGantt = (data, workTypes = []) => {
    const el = ganttRef.current;
    if (!el) return;
    el.innerHTML = "";

    // 1. Group tasks by workType for correct vertical index
    const groupedTasks = workTypes.reduce((acc, type) => {
        acc[type] = data.filter(t => t.workType === type);
        return acc;
    }, {});

    // 2. Create a new, ordered array of tasks based on workType
    let reorderedData = [];
    workTypes.forEach(type => {
        reorderedData = reorderedData.concat(groupedTasks[type] || []);
    });

    // 3. Container setup for the two-column layout
    const container = document.createElement("div");
    container.style.display = "grid";
    container.style.gridTemplateColumns = "180px 1fr";
    container.style.width = "100%";
    container.style.alignItems = "start";

    // Left column (Work Types)
    const leftCol = document.createElement("div");
    leftCol.className = "gantt-work-type-col"; // Add class for styling/selection
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

    // This array holds the DOM elements for the rows
    const workTypeRows = [];
    workTypes.forEach((w) => {
      const row = document.createElement("div");
      row.textContent = w;
      row.dataset.workType = w; // Set data attribute for lookup
      row.style.height = "40px";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.paddingLeft = "10px";
      row.style.fontWeight = "500";
      row.style.borderBottom = "1px solid #f1f1f1";
      workTypeRows.push(row);
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

    // Initialize Gantt with the *reordered* data
     new Gantt(ganttWrapper, reorderedData, {
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
          // No need for loadTasks here, as the position is correct within the row
          // and we only need to redraw if the workType changes.
        }
      },
      // You can also add on_progress_change if needed
    });

    // Apply colors and vertical positioning
    const colors = ["#16A34A", "#111827", "#F59E0B", "#2563EB", "#8B5CF6"];
    ganttWrapper.querySelectorAll(".bar").forEach((barEl, i) => {
      const task = reorderedData[i];
      if (task) {
        const colorIdx = task.colorIndex;
        barEl.style.fill = colors[colorIdx % colors.length];

        // 4. Manual vertical positioning (Crucial for multiple bars per row)
        const rowIndex = workTypes.findIndex(w => w === task.workType);
        if (rowIndex !== -1) {
            // Find the corresponding bar-wrapper
            const wrapper = barEl.closest(".bar-wrapper");
            if (wrapper) {
                // Each row is 40px high. Header is 40px.
                // Row 0 starts at 40px, Row 1 starts at 80px, etc.
                const newY = rowIndex * 40 + 40; 
                wrapper.style.transform = `translateY(${newY}px)`;
            }
        }
      }
    });

    // ===== Vertical row drag for workType only (REVISED) =====
    const wrappers = Array.from(ganttWrapper.querySelectorAll(".bar-wrapper"));
    let dragging = null;
    let startY = 0;

    wrappers.forEach((wrap) => {
      wrap.style.cursor = "grab";
      wrap.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        // Check if the original bar move/resize functionality is *not* active
        if (e.target.closest('.handle') || e.target.classList.contains('bar')) return;

        dragging = wrap;
        startY = e.clientY;
        wrap.style.opacity = "0.6";
        wrap.style.cursor = "grabbing";
        wrap.style.zIndex = 10; // Bring to front while dragging
      });
    });

    document.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const moveY = e.clientY - startY;
      // Apply transform only for vertical movement
      const originalTransform = dragging.style.transform || "translateY(0px)";
      // Get the current Y position from the style (e.g., "translateY(80px)")
      const currentY = parseFloat(originalTransform.match(/translateY\(([\d.]+)px\)/)?.[1] || 0);
      dragging.style.transform = `translateY(${currentY + moveY}px)`;
      startY = e.clientY; // Update startY for continuous movement
    });

    document.addEventListener("mouseup", async (e) => {
      if (!dragging) return;
      dragging.style.opacity = "1";
      dragging.style.cursor = "grab";
      dragging.style.zIndex = 1;
      
      // Reset temporary transformation from mousemove
      dragging.style.transform = ""; 

      const barEl = dragging.querySelector(".bar");
      const taskId = barEl?.getAttribute("data-id");
      const draggedTask = data.find(t => t.id === taskId);
      if (!draggedTask) {
        dragging = null;
        return;
      }

      const cursorY = e.clientY;
      // Use the cached workTypeRows elements
      const targetWorkTypeEl = workTypeRows.find(row => {
          const rect = row.getBoundingClientRect();
          // Check if cursor Y is within the row's vertical bounds
          return cursorY >= rect.top && cursorY <= rect.bottom;
      });
      
      const newWorkType = targetWorkTypeEl ? targetWorkTypeEl.dataset.workType : draggedTask.workType;

      if (draggedTask.workType !== newWorkType) {
          // No need to 'swap' tasks, just update the dragged task's workType
          // and rely on a full redraw/re-render to place it correctly.

          draggedTask.workType = newWorkType;
          
          // API update for the change
          const updateRes = await api.put("./gantt_api.php", { 
              L_ID: parseInt(draggedTask.id, 10), 
              WORK_TYPE: draggedTask.workType, 
              UPDATED_BY: 1 
          });

          if (updateRes.data.success) {
              toast.success(`Task ${draggedTask.id} moved to ${newWorkType}`);
              // 5. CRITICAL: Re-run loadTasks to get the latest data and trigger re-drawGantt
              loadTasks(form.H_ID || 46); 
          } else {
              toast.error("Failed to update work type on server.");
          }
      } else {
          // If dropped on the same row, just ensure its position is fixed
          // The useEffect handles the initial positioning on redraw
      }

      dragging = null;
    });
  };


  const handleCreate = async (e) => {
    // Existing logic for creating a task...
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
          ...form, // Keep H_ID/C_P_ID for easier continuous entry
          DESCRIPTION: "",
          SCHEDULE_START_DATE: "",
          SCHEDULE_END_DATE: "",
          // CREATION_BY: "", // Optionally keep the user ID
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

  // Existing JSX return structure...
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