import React, { useState, useEffect, useRef } from "react";
import Gantt from "frappe-gantt";
import "frappe-gantt/dist/frappe-gantt.css";

const FAKE_GANTT_DATA = [
  { L_ID: "200", H_ID: "46", C_P_ID: "1", SCHEDULE_START_DATE: "2025-11-06", SCHEDULE_END_DATE: "2025-11-13" },
  { L_ID: "201", H_ID: "46", C_P_ID: "2", SCHEDULE_START_DATE: "2025-12-27", SCHEDULE_END_DATE: "2025-12-31" },
  { L_ID: "202", H_ID: "46", C_P_ID: "3", SCHEDULE_START_DATE: "2025-11-21", SCHEDULE_END_DATE: "2025-11-28" },
  { L_ID: "203", H_ID: "46", C_P_ID: "4", SCHEDULE_START_DATE: null, SCHEDULE_END_DATE: null },
  { L_ID: "204", H_ID: "46", C_P_ID: "5", SCHEDULE_START_DATE: "2025-12-07", SCHEDULE_END_DATE: "2025-12-18" },
  { L_ID: "205", H_ID: "46", C_P_ID: "6", SCHEDULE_START_DATE: "2025-11-30", SCHEDULE_END_DATE: "2025-12-06" },
  { L_ID: "206", H_ID: "46", C_P_ID: "7", SCHEDULE_START_DATE: "2025-11-07", SCHEDULE_END_DATE: "2025-11-13" },
  { L_ID: "207", H_ID: "46", C_P_ID: "8", SCHEDULE_START_DATE: "2025-12-30", SCHEDULE_END_DATE: "2025-12-31" },
  { L_ID: "208", H_ID: "46", C_P_ID: "9", SCHEDULE_START_DATE: "2025-11-13", SCHEDULE_END_DATE: "2025-11-26" },
  { L_ID: "209", H_ID: "46", C_P_ID: "10", SCHEDULE_START_DATE: "2025-11-15", SCHEDULE_END_DATE: "2025-11-18" },
  { L_ID: "210", H_ID: "46", C_P_ID: "11", SCHEDULE_START_DATE: "2025-11-26", SCHEDULE_END_DATE: "2025-12-08" },
  { L_ID: "211", H_ID: "46", C_P_ID: "12", SCHEDULE_START_DATE: "2025-12-09", SCHEDULE_END_DATE: "2025-12-10" },
  { L_ID: "212", H_ID: "46", C_P_ID: "13", SCHEDULE_START_DATE: "2025-12-22", SCHEDULE_END_DATE: "2025-12-25" },
  { L_ID: "213", H_ID: "46", C_P_ID: "14", SCHEDULE_START_DATE: "2025-12-27", SCHEDULE_END_DATE: "2025-12-31" },
  { L_ID: "214", H_ID: "46", C_P_ID: "15", SCHEDULE_START_DATE: "2025-12-10", SCHEDULE_END_DATE: "2025-12-21" },
  { L_ID: "215", H_ID: "46", C_P_ID: "16", SCHEDULE_START_DATE: "2025-12-06", SCHEDULE_END_DATE: "2025-12-08" },
  { L_ID: "216", H_ID: "46", C_P_ID: "17", SCHEDULE_START_DATE: "2025-11-30", SCHEDULE_END_DATE: "2025-12-03" },
  { L_ID: "217", H_ID: "46", C_P_ID: "18", SCHEDULE_START_DATE: "2025-11-05", SCHEDULE_END_DATE: "2025-11-19" },
  { L_ID: "218", H_ID: "46", C_P_ID: "19", SCHEDULE_START_DATE: "2025-11-01", SCHEDULE_END_DATE: "2025-11-05" },
  { L_ID: "219", H_ID: "46", C_P_ID: "20", SCHEDULE_START_DATE: "2025-11-08", SCHEDULE_END_DATE: "2025-11-17" },
  { L_ID: "220", H_ID: "46", C_P_ID: "21", SCHEDULE_START_DATE: "2025-11-15", SCHEDULE_END_DATE: "2025-11-30" },
  { L_ID: "221", H_ID: "46", C_P_ID: "22", SCHEDULE_START_DATE: "2025-12-13", SCHEDULE_END_DATE: "2025-12-18" },
  { L_ID: "222", H_ID: "46", C_P_ID: "23", SCHEDULE_START_DATE: "2025-11-25", SCHEDULE_END_DATE: "2025-12-05" },
  { L_ID: "223", H_ID: "46", C_P_ID: "24", SCHEDULE_START_DATE: "2025-11-23", SCHEDULE_END_DATE: "2025-12-07" },
  { L_ID: "224", H_ID: "46", C_P_ID: "25", SCHEDULE_START_DATE: "2025-11-10", SCHEDULE_END_DATE: "2025-11-19" },
  { L_ID: "225", H_ID: "46", C_P_ID: "1", SCHEDULE_START_DATE: "2025-12-06", SCHEDULE_END_DATE: "2025-12-07" },
  { L_ID: "226", H_ID: "46", C_P_ID: "2", SCHEDULE_START_DATE: "2025-12-27", SCHEDULE_END_DATE: "2025-12-29" },
  { L_ID: "227", H_ID: "46", C_P_ID: "3", SCHEDULE_START_DATE: "2025-12-31", SCHEDULE_END_DATE: "2025-12-31" },
  { L_ID: "228", H_ID: "46", C_P_ID: "4", SCHEDULE_START_DATE: "2025-11-18", SCHEDULE_END_DATE: "2025-12-02" },
  { L_ID: "229", H_ID: "46", C_P_ID: "5", SCHEDULE_START_DATE: "2025-12-16", SCHEDULE_END_DATE: "2025-12-22" },
  { L_ID: "230", H_ID: "46", C_P_ID: "6", SCHEDULE_START_DATE: "2025-11-12", SCHEDULE_END_DATE: "2025-11-21" },
  { L_ID: "250", H_ID: "46", C_P_ID: "1", SCHEDULE_START_DATE: "2025-11-28", SCHEDULE_END_DATE: "2025-11-29" },
  { L_ID: "275", H_ID: "46", C_P_ID: "1", SCHEDULE_START_DATE: "2025-12-25", SCHEDULE_END_DATE: "2025-12-31" },
  { L_ID: "300", H_ID: "46", C_P_ID: "1", SCHEDULE_START_DATE: "2025-11-02", SCHEDULE_END_DATE: "2025-11-16" }
];

const FAKE_CONTRACTORS = [
  { id: 1, name: "ABC Construction Ltd" },
  { id: 2, name: "BuildTech Solutions" },
  { id: 3, name: "Prime Contractors Inc" },
  { id: 4, name: "Elite Building Co" },
  { id: 5, name: "Metro Construction" },
  { id: 6, name: "Skyline Builders" },
  { id: 7, name: "Urban Development Corp" },
  { id: 8, name: "Global Construction Group" },
  { id: 9, name: "Apex Engineering" },
  { id: 10, name: "Titan Construction" },
  { id: 11, name: "Summit Builders" },
  { id: 12, name: "Precision Construction" },
  { id: 13, name: "Heritage Contractors" },
  { id: 14, name: "Pioneer Building Services" },
  { id: 15, name: "Modern Infrastructure Ltd" },
  { id: 16, name: "Crown Construction" },
  { id: 17, name: "Excellence Builders" },
  { id: 18, name: "Venture Construction Group" },
  { id: 19, name: "Paramount Contractors" },
  { id: 20, name: "Unity Construction" },
  { id: 21, name: "Landmark Builders" },
  { id: 22, name: "Zenith Construction" },
  { id: 23, name: "Foundation Engineering" },
  { id: 24, name: "Prestige Building Co" },
  { id: 25, name: "Everest Construction Ltd" }
];

const FrappeGanttDemo = () => {
  const ganttRef = useRef(null);
  const ganttInstance = useRef(null);
  const [allContractors] = useState(FAKE_CONTRACTORS);
  const [allTasks, setAllTasks] = useState([]);
  const [viewMode, setViewMode] = useState("Day");
  const [selectedContractor, setSelectedContractor] = useState("all");

  // Load gantt data from FAKE_GANTT_DATA
  useEffect(() => {
    const formattedTasks = FAKE_GANTT_DATA
      .filter((item) => item.SCHEDULE_START_DATE && item.SCHEDULE_END_DATE)
      .map((item) => ({
        id: `task-${item.L_ID}`,
        name: `Task ${item.L_ID}`,
        start: item.SCHEDULE_START_DATE,
        end: item.SCHEDULE_END_DATE,
        progress: Math.floor(Math.random() * 100),
        contractorId: Number(item.C_P_ID)
      }));
    setAllTasks(formattedTasks);
  }, []);

  // Initialize or update Frappe Gantt
  useEffect(() => {
    if (!ganttRef.current || allTasks.length === 0 || allContractors.length === 0) {
      return;
    }

    // Filter tasks by contractor
    let tasksToShow = allTasks;
    if (selectedContractor !== "all") {
      tasksToShow = allTasks.filter(
        (task) => task.contractorId === Number(selectedContractor)
      );
    }

    if (tasksToShow.length === 0) {
      ganttRef.current.innerHTML = '<div class="text-gray-500 text-center py-8">No tasks for selected contractor</div>';
      return;
    }

    // Add contractor name to task display
    const tasksWithContractor = tasksToShow.map((task) => {
      const contractor = allContractors.find((c) => c.id === task.contractorId);
      return {
        ...task,
        name: contractor ? `${task.name} - ${contractor.name}` : task.name
      };
    });

    // Clear existing gantt
    if (ganttInstance.current) {
      ganttRef.current.innerHTML = "";
    }

    // Create new gantt instance
    try {
      ganttInstance.current = new Gantt(ganttRef.current, tasksWithContractor, {
        view_mode: viewMode,
        bar_height: 40,
        bar_corner_radius: 4,
        arrow_curve: 5,
        padding: 18,
        date_format: "YYYY-MM-DD",
        language: "en",
        on_click: (task) => {
          const contractor = allContractors.find((c) => c.id === task.contractorId);
          console.log("Task clicked:", {
            task: task.name,
            contractor: contractor?.name,
            start: task.start,
            end: task.end,
            progress: task.progress
          });
        },
        on_date_change: (task, start, end) => {
          console.log("Task dates changed:", task.name, start, end);
          setAllTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? {
                    ...t,
                    start: start.toISOString().split("T")[0],
                    end: end.toISOString().split("T")[0]
                  }
                : t
            )
          );
        },
        on_progress_change: (task, progress) => {
          console.log("Progress changed:", task.name, progress);
          setAllTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress } : t))
          );
        }
      });
    } catch (error) {
      console.error("Error creating Gantt chart:", error);
    }
  }, [allTasks, allContractors, viewMode, selectedContractor]);

  const filteredTaskCount = selectedContractor === "all"
    ? allTasks.length
    : allTasks.filter((t) => t.contractorId === Number(selectedContractor)).length;

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Contractor Gantt Chart
        </h1>
        <p className="text-sm text-gray-600">
          Project Timeline - 25 Contractors & Multiple Tasks
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">View Mode:</label>
          <div className="flex gap-1">
            {["Quarter Day", "Half Day", "Day", "Week", "Month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  viewMode === mode
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 font-medium">Contractor:</label>
          <select
            value={selectedContractor}
            onChange={(e) => setSelectedContractor(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none max-w-xs"
          >
            <option value="all">All Contractors ({allContractors.length})</option>
            {allContractors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-lg p-4">
          {allTasks.length > 0 && allContractors.length > 0 ? (
            <div ref={ganttRef} className="gantt-container"></div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Loading contractors and schedule...
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total Tasks: {allTasks.length}</span>
          <span>Contractors: {allContractors.length}</span>
          <span>Showing: {filteredTaskCount} tasks</span>
        </div>
      </div>

      <style jsx>{`
        .gantt-container :global(.bar) {
          fill: #3b82f6;
        }
        .gantt-container :global(.bar-progress) {
          fill: #1d4ed8;
        }
        .gantt-container :global(.bar-label) {
          fill: white;
          font-size: 12px;
        }
        .gantt-container :global(.gantt .grid-row:hover) {
          background-color: #f9fafb;
        }
      `}</style>
    </div>
  );
};

export default FrappeGanttDemo;