import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CursorMarker,
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
} from "react-calendar-timeline";
import moment from "moment";
import axios from "axios";
import "react-calendar-timeline/style.css";

import { useParams, useNavigate } from "react-router-dom";
import { SectionContainer } from "@/components/SectionContainer";
import TaskHoverCard from "../components/DashboardTooltip";
import { ProjectNotesSheet } from "./project-note-sheet";

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

// ── Dark-mode CSS overrides for react-calendar-timeline ──────────────────────
// These are injected as a <style> tag and scoped to .dark so they only apply
// when the dark theme class is present on an ancestor (html / body).
const TIMELINE_DARK_STYLES = `
  /* ── Canvas / body ─────────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-outer,
  .dark .react-calendar-timeline .rct-scroll {
    background-color: #1e1e2e;
  }

  /* ── Sidebar ────────────────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-sidebar {
    background-color: #1e1e2e;
    border-right: 1px solid #3a3a5c;
  }
  .dark .react-calendar-timeline .rct-sidebar .rct-sidebar-row {
    border-bottom: 1px solid #2e2e44;
    color: #d1d5db;
  }
  .dark .react-calendar-timeline .rct-sidebar .rct-sidebar-row.rct-sidebar-row-odd {
    background-color: #252535;
  }
  .dark .react-calendar-timeline .rct-sidebar .rct-sidebar-row.rct-sidebar-row-even {
    background-color: #1e1e2e;
  }

  /* ── Header root (sticky bar) ───────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-header-root {
    background: #12121e !important;
    border-bottom: 1px solid #3a3a5c;
  }

  /* ── Date header cells ──────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-dateHeader {
    background-color: rgba(220, 38, 38, 0.12) !important;
    color: #f9a8d4 !important;
    border-left: 1px solid #3a3a5c;
    border-bottom: 1px solid #3a3a5c;
  }
  .dark .react-calendar-timeline .rct-dateHeader-primary {
    background-color: #1a0a0a !important;
    color: #fca5a5 !important;
    border-bottom: 1px solid #5c2020;
  }

  /* ── Horizontal grid lines (row separators) ─────────────────────────────── */
  .dark .react-calendar-timeline .rct-horizontal-lines .rct-hl-odd {
    background-color: #252535;
    border-bottom: 1px solid #2e2e44;
  }
  .dark .react-calendar-timeline .rct-horizontal-lines .rct-hl-even {
    background-color: #1e1e2e;
    border-bottom: 1px solid #2e2e44;
  }

  /* ── Vertical grid lines ────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-vertical-lines .rct-vl {
    border-left: 1px solid #2e2e44;
  }
  .dark .react-calendar-timeline .rct-vertical-lines .rct-vl.rct-day-6,
  .dark .react-calendar-timeline .rct-vertical-lines .rct-vl.rct-day-0 {
    background-color: rgba(220, 38, 38, 0.08);
  }

  /* ── Holiday columns ────────────────────────────────────────────────────── */
  .dark .rct-vl.holiday {
    background-color: rgba(220, 38, 38, 0.20) !important;
  }

  /* ── Items ──────────────────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-item {
    border-color: rgba(255,255,255,0.15) !important;
    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
  }
  .dark .react-calendar-timeline .rct-item:hover {
    filter: brightness(1.15);
  }
  .dark .react-calendar-timeline .rct-item.selected {
    outline: 2px solid #a78bfa;
  }

  /* ── Item resize handles ────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-item .rct-item-handler {
    background-color: rgba(255,255,255,0.25);
  }

  /* ── Cursor & Today markers ─────────────────────────────────────────────── */
  /* (colours set inline; nothing to override) */

  /* ── Scrollbar (WebKit) ─────────────────────────────────────────────────── */
  .dark .react-calendar-timeline .rct-scroll::-webkit-scrollbar {
    height: 6px;
  }
  .dark .react-calendar-timeline .rct-scroll::-webkit-scrollbar-track {
    background: #1e1e2e;
  }
  .dark .react-calendar-timeline .rct-scroll::-webkit-scrollbar-thumb {
    background: #3a3a5c;
    border-radius: 3px;
  }
`;

// ── Light-mode overrides (resets for when dark is NOT active) ────────────────
// react-calendar-timeline ships with its own defaults; these keep our custom
// header colours intact in light mode without fighting the dark overrides.
const TIMELINE_LIGHT_STYLES = `
  .react-calendar-timeline .rct-header-root {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
  }
  .rct-vl.holiday {
    background-color: rgba(220, 38, 38, 0.15) !important;
  }
  .react-calendar-timeline .rct-dateHeader {
    background-color: rgba(220, 38, 38, 0.15) !important;
    opacity: 0.9;
  }
`;

const DashboardTimelineTwo = () => {
  const navigate = useNavigate();
  const { H_ID } = useParams();

  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [holidayDates, setHolidayDates] = useState(new Set());
  const [selectedContractor, setSelectedContractor] = useState("all");
  const [projectName, setProjectName] = useState("");
  const [projectStartPlan, setProjectStartPlan] = useState(null);
  const [projectEndPlan, setProjectEndPlan] = useState(null);
  const [pId, setPId] = useState(null);

  const [notesInitialMode, setNotesInitialMode] = useState("list"); // "list" | "add"
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesDefaultCtId, setNotesDefaultCtId] = useState(null);

  const [splitConfirm, setSplitConfirm] = useState(null);

  const [visibleTimeStart, setVisibleTimeStart] = useState(null);
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(null);

  const minTimeRef = useRef(null);
  const maxTimeRef = useRef(null);
  const colorMap = useRef({});
  const lastUpdatedRef = useRef(null);

  const distinctColors = [
    "#001BB7",
    "#4FB7B3",
    "#4DFFBE",
    "#78C841",
    "#A3B087",
    "#FCB53B",
    "#F5DEA3",
    "#7B542F",
    "#FF8040",
    "#E49BA6",
    "#DC0E0E",
    "#850E35",
    "#E83C91",
    "#9112BC",
    "#3C467B",
    "#000000",
    "#71C0BB",
    "#7C4585",
    "#174143",
    "#FFC400",
    "#FF0060",
  ];

  const openNotes = (contractorTypeId = null, initialMode = "list") => {
    setNotesDefaultCtId(contractorTypeId);
    setNotesInitialMode(initialMode);
    setNotesOpen(true);
  };

  // ── Fetch Calendar ───────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await axios.get(`${url}/api/calendar`);
        if (res.data.success && Array.isArray(res.data.data)) {
          const holidayRecords = res.data.data.filter(
            (r) =>
              r.WORKING_STATUS === "WEEKEND" || r.WORKING_STATUS === "HOLIDAY",
          );
          const holidayDateSet = new Set(
            holidayRecords.map((r) => moment.utc(r.DAY).format("YYYY-MM-DD")),
          );
          setHolidayDates(holidayDateSet);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
        toast.error("Failed to load calendar data");
      }
    };
    fetchCalendar();
  }, []);

  // ── Fetch Contractor Types → groups ──────────────────────────────────────
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await axios.get(`${url}/api/contractor-type`);
        if (res.data.success && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((c, index) => {
            const id = Number(c.ID);
            if (!colorMap.current[id]) {
              colorMap.current[id] =
                distinctColors[index % distinctColors.length];
            }
            return { id, title: c.NAME };
          });
          setGroups(formatted);
          setAllGroups(formatted);
        }
      } catch (err) {
        console.error("Failed to load contractors:", err);
        toast.error("Failed to load contractors");
      }
    };
    fetchContractors();
  }, []);

  // ── Fetch Gantt Data ─────────────────────────────────────────────────────
  const fetchGanttData = async () => {
    try {
      const res = await axios.get(`${url}/api/gantt`);

      if (res.data.success && Array.isArray(res.data.data)) {
        const filtered = res.data.data.filter(
          (i) => Number(i.H_ID) === Number(H_ID),
        );

        const formattedItems = filtered
          .filter((i) => i.SCHEDULE_START_DATE && i.SCHEDULE_END_DATE)
          .map((i) => {
            const contractorId = Number(i.C_P_ID);
            const color = colorMap.current[contractorId] || "#999";

            return {
              id: Number(i.L_ID),
              group: contractorId,
              contractorName: i.CONTRATOR_NAME || "",
              start_time: moment(i.SCHEDULE_START_DATE).valueOf(),
              end_time: moment(i.SCHEDULE_END_DATE).endOf("day").valueOf(),
              canMove: true,
              canResize: "both",
              canChangeGroup: true,
              itemProps: {
                style: {
                  background: color,
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                },
              },
            };
          });

        if (formattedItems.length > 0) {
          const startDates = formattedItems.map((i) => i.start_time);
          const endDates = formattedItems.map((i) => i.end_time);
          const earliest = moment(Math.min(...startDates)).startOf("day");
          const latest = moment(Math.max(...endDates)).endOf("day");

          minTimeRef.current = earliest.valueOf();

          setVisibleTimeStart(earliest.valueOf());
          setVisibleTimeEnd(latest.add(15, "days").valueOf());
        }

        setAllItems(formattedItems);
        setItems(formattedItems);
      }
    } catch (err) {
      console.error("GANTT LOAD ERROR", err);
      toast.error("Failed to load gantt data");
    }
  };

  useEffect(() => {
    if (H_ID) fetchGanttData();
  }, [H_ID]);

  // ── Fetch Project Info ───────────────────────────────────────────────────
  const fetchProjectInfo = async () => {
    try {
      const res = await axios.get(`${url}/api/shedule`);

      let schedules = [];
      if (res.data?.data && Array.isArray(res.data.data)) {
        schedules = res.data.data;
      } else if (Array.isArray(res.data)) {
        schedules = res.data;
      }

      const schedule = schedules.find((s) => Number(s.H_ID) === Number(H_ID));
      if (schedule) {
        setProjectName(schedule.P_NAME);
        setPId(schedule.P_ID ?? null);

        setProjectStartPlan(
          schedule.PROJECT_START_PLAN
            ? moment(schedule.PROJECT_START_PLAN).format("DD MMM YYYY")
            : null,
        );
        setProjectEndPlan(
          schedule.PROJECT_END_PLAN
            ? moment(schedule.PROJECT_END_PLAN).format("DD MMM YYYY")
            : null,
        );

        if (schedule.PROJECT_END_PLAN) {
          maxTimeRef.current = moment(schedule.PROJECT_END_PLAN)
            .endOf("day")
            .valueOf();
        } else {
          maxTimeRef.current = null;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (H_ID) fetchProjectInfo();
  }, [H_ID]);

  // ── Update on server ─────────────────────────────────────────────────────
  const updateItemOnServer = async (item) => {
    const key = `${item.id}-${item.start_time}-${item.end_time}`;
    if (lastUpdatedRef.current === key) return;
    lastUpdatedRef.current = key;
    try {
      await axios.put(`${url}/api/gantt`, {
        L_ID: item.id,
        C_P_ID: item.group,
        SCHEDULE_START_DATE: moment(item.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(item.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title,
      });
      toast.success("Task updated successfully");
    } catch (err) {
      toast.error("Failed to update task");
      console.error("Failed to update item:", err);
    } finally {
      setTimeout(() => {
        lastUpdatedRef.current = null;
      }, 500);
    }
  };

  // ── Double click → split confirm modal ───────────────────────────────────
  const handleItemDoubleClick = (itemId, e, time) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const splitDate = moment(time).startOf("day");

    if (
      splitDate.isSameOrBefore(moment(item.start_time)) ||
      splitDate.isSameOrAfter(moment(item.end_time))
    ) {
      toast.warn("Split date must be between start and end date");
      return;
    }

    setSplitConfirm({ itemId, time });
  };

  const confirmSplit = async () => {
    if (!splitConfirm) return;
    const { itemId, time } = splitConfirm;
    setSplitConfirm(null);

    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const splitDate = moment(time).startOf("day");
    const contractorColor = colorMap.current[item.group];

    const firstHalf = {
      ...item,
      end_time: splitDate.clone().endOf("day").valueOf(),
      itemProps: {
        style: { ...item.itemProps.style, background: contractorColor },
      },
    };

    const secondHalf = {
      ...item,
      id: Date.now(),
      start_time: splitDate.clone().add(1, "day").startOf("day").valueOf(),
      end_time: item.end_time,
      itemProps: {
        style: { ...item.itemProps.style, background: contractorColor },
      },
    };

    setItems((prev) => [
      ...prev.filter((i) => i.id !== itemId),
      firstHalf,
      secondHalf,
    ]);
    setAllItems((prev) => [
      ...prev.filter((i) => i.id !== itemId),
      firstHalf,
      secondHalf,
    ]);

    toast.info("Splitting and saving...");

    try {
      await axios.put(`${url}/api/gantt`, {
        L_ID: item.id,
        C_P_ID: firstHalf.group,
        SCHEDULE_START_DATE: moment(firstHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(firstHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 1)",
      });

      const res = await axios.post(`${url}/api/gantt`, {
        C_P_ID: secondHalf.group,
        SCHEDULE_START_DATE: moment(secondHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(secondHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 2)",
        CREATION_BY: 1,
        H_ID: H_ID,
      });

      if (res.data.success) {
        toast.success("Task successfully split and saved");
        await fetchGanttData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to split task on server");
    }
  };

  // ── Move & Resize ────────────────────────────────────────────────────────
  // const handleItemMove = (itemId, dragTime, newGroupOrder) => {
  //   setItems((prev) => {
  //     const i        = prev.findIndex((item) => item.id === itemId);
  //     const item     = prev[i];
  //     const duration = item.end_time - item.start_time;
  //     const updated  = [...prev];
  //     const newItem  = {
  //       ...item,
  //       start_time: dragTime,
  //       end_time:   dragTime + duration,
  //       group:      groups[newGroupOrder]?.id ?? item.group,
  //     };
  //     updated[i] = newItem;
  //     updateItemOnServer(newItem);
  //     return updated;
  //   });
  // };

  const handleItemResize = (itemId, time, edge) => {
    setItems((prev) => {
      const i = prev.findIndex((item) => item.id === itemId);
      const item = prev[i];
      const updated = [...prev];
      const newItem = {
        ...item,
        [edge === "left" ? "start_time" : "end_time"]: time,
      };
      updated[i] = newItem;
      updateItemOnServer(newItem);
      return updated;
    });
  };

  const handleItemSelect = (id) => setSelectedItems([id]);
  const handleItemDeselect = () => setSelectedItems([]);

  // ── onTimeChange ─────────────────────────────────────────────────────────
  const handleTimeChange = (start, end, updateScrollCanvas) => {
    const minTime = minTimeRef.current;
    const maxTime = maxTimeRef.current;
    const duration = end - start;

    let clampedStart = start;
    let clampedEnd = end;

    if (minTime && clampedStart < minTime) {
      clampedStart = minTime;
      clampedEnd = clampedStart + duration;
    }

    if (maxTime && clampedEnd > maxTime) {
      clampedEnd = maxTime;
      clampedStart = clampedEnd - duration;
      if (minTime && clampedStart < minTime) {
        clampedStart = minTime;
      }
    }

    setVisibleTimeStart(clampedStart);
    setVisibleTimeEnd(clampedEnd);
    updateScrollCanvas(clampedStart, clampedEnd);
  };

  // ── Filter by contractor ─────────────────────────────────────────────────
  useEffect(() => {
    if (selectedContractor === "all") {
      setGroups(allGroups);
      setItems(allItems);
    } else {
      setGroups(allGroups.filter((g) => g.id === Number(selectedContractor)));
      setItems(allItems.filter((i) => i.group === Number(selectedContractor)));
    }
  }, [selectedContractor, allGroups, allItems]);

  // ── Holiday column highlight ─────────────────────────────────────────────
  const verticalLineClassNamesForTime = (timeStart) => {
    const dateStr = moment(timeStart).format("YYYY-MM-DD");
    return holidayDates.has(dateStr) ? ["holiday"] : [];
  };

  // ── Item renderer ────────────────────────────────────────────────────────
  const itemRenderer = ({ item, itemContext, getItemProps }) => (
    <TaskHoverCard
      item={item}
      itemContext={itemContext}
      getItemProps={getItemProps}
      groups={groups}
      holidayDates={holidayDates}
      contractorName={item.contractorName}
    />
  );

  // ── Group (contractor row) renderer — with note icon ─────────────────────
  const groupRenderer = ({ group }) => (
    <div className="flex items-center justify-between pr-2 w-full h-full">
      <span
        style={{ fontSize: "10px", fontWeight: 600 }}
        className="truncate flex-1"
      >
        {group.title}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          openNotes(group.id);
        }}
        title={`Notes for ${group.title}`}
        className="flex-shrink-0 ml-1 p-0.5 rounded text-gray-300 hover:text-white hover:bg-white/20 transition-colors"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </button>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* Inject both light and dark timeline styles */}
      <style>{TIMELINE_LIGHT_STYLES}</style>
      <style>{TIMELINE_DARK_STYLES}</style>

      <SectionContainer>
        {/* ── Filter Bar ── */}
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border bg-card px-6 py-3">

  {/* Left Side */}
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">

    {/* Title */}
    <h1 className="font-display text-base font-bold text-foreground tracking-tight pr-4">
      Dashboard Timeline
    </h1>

    <div className="hidden sm:block w-px h-8 bg-border mx-3" />

    {/* Project Name */}
    <div className="sm:px-4 flex items-center gap-2">
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground leading-tight">Project:</span>
        <span className="text-sm font-bold text-foreground leading-tight">{projectName}</span>
      </div>
    </div>

    {/* Plan Dates */}
    {(projectStartPlan || projectEndPlan) && (
      <>
        {projectStartPlan && (
          <>
            <div className="hidden sm:block w-px h-8 bg-border mx-3" />
            <div className="sm:px-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-blue-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-tight">Project Start:</span>
                <span className="text-sm font-bold text-foreground leading-tight">{projectStartPlan}</span>
              </div>
            </div>
          </>
        )}
        {projectEndPlan && (
          <>
            <div className="hidden sm:block w-px h-8 bg-border mx-3" />
            <div className="sm:px-4 flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-red-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground leading-tight">Project End:</span>
                <span className="text-sm font-bold text-foreground leading-tight">{projectEndPlan}</span>
              </div>
            </div>
          </>
        )}
      </>
    )}
  </div>

  {/* Right Side */}
  <div className="flex items-center gap-2">

    {/* All Contractors select */}
    <select
      value={selectedContractor}
      onChange={(e) => setSelectedContractor(e.target.value)}
      className="cursor-pointer rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground outline-none transition-colors hover:border-primary focus:border-primary focus:ring-[3px] focus:ring-primary/10"
    >
      <option value="all">All Contractors</option>
      {allGroups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.title}
        </option>
      ))}
    </select>

    {/* Back */}
    <button
      onClick={() => navigate("/dashboard/dashboard-schedule")}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      Back
    </button>

    {/* Notes */}
    <button
      onClick={() => openNotes(null)}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-primary transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Notes
    </button>

    {/* Add Note — primary */}
    <button
      onClick={() => openNotes(null, "add")}
      className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Add Note
    </button>

  </div>
</div>

        {/* ── Timeline ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white dark:bg-[#1e1e2e] rounded-lg shadow-lg">
            {groups.length > 0 && visibleTimeStart ? (
              <Timeline
                groups={groups}
                items={items}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onTimeChange={handleTimeChange}
                // onItemMove={handleItemMove}
                onItemResize={handleItemResize}
                onItemSelect={handleItemSelect}
                onItemDeselect={handleItemDeselect}
                onItemDoubleClick={handleItemDoubleClick}
                selected={selectedItems}
                canMove
                canResize="both"
                canChangeGroup={false}
                lineHeight={34}
                itemHeightRatio={0.75}
                sidebarWidth={200}
                stackItems
                verticalLineClassNamesForTime={verticalLineClassNamesForTime}
                itemRenderer={itemRenderer}
                groupRenderer={groupRenderer}
              >
                <TimelineHeaders>
                  <SidebarHeader>
                    {({ getRootProps }) => (
                      <div
                        {...getRootProps()}
                        className="flex items-center text-sm justify-center bg-gradient-to-r from-red-900 to-purple-700 text-white font-semibold"
                      >
                        Contractors
                      </div>
                    )}
                  </SidebarHeader>

                  <DateHeader
                    unit="primaryHeader"
                    labelFormat="MMMM YYYY"
                    style={{
                      background: "#541212",
                      color: "#ffffff",
                      fontWeight: 600,
                      textAlign: "center",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  />

                  <DateHeader
                    unit="day"
                    labelFormat="DD dd"
                    style={{
                      background: "#750811ff",
                      color: "#ffffff",
                      textAlign: "center",
                      fontSize: "11px",
                      borderLeft: "1px solid #e5e7eb",
                      borderRight: "1px solid #e5e7eb",
                      opacity: 0.9,
                    }}
                  />
                </TimelineHeaders>

                <TimelineMarkers>
                  <TodayMarker>
                    {({ styles }) => (
                      <div
                        style={{
                          ...styles,
                          backgroundColor: "#ef4444",
                          width: "3px",
                        }}
                      />
                    )}
                  </TodayMarker>
                  <CursorMarker>
                    {({ styles }) => (
                      <div
                        style={{
                          ...styles,
                          backgroundColor: "#3b82f6",
                          width: "2px",
                          opacity: 0.5,
                        }}
                      />
                    )}
                  </CursorMarker>
                </TimelineMarkers>
              </Timeline>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                Loading contractors and schedule...
              </div>
            )}
          </div>
        </div>

        {/* ── Split Confirm Modal ──────────────────────────────────────────── */}
        {splitConfirm &&
          (() => {
            const item = items.find((i) => i.id === splitConfirm.itemId);
            const splitDate = moment(splitConfirm.time).startOf("day");
            const part1Start = item
              ? moment(item.start_time).format("MMM D")
              : "";
            const part1End = splitDate.format("MMM D");
            const part2Start = splitDate.clone().add(1, "day").format("MMM D");
            const part2End = item ? moment(item.end_time).format("MMM D") : "";

            return (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  zIndex: 9999,
                  background: "rgba(0,0,0,0.55)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setSplitConfirm(null)}
              >
                <div
                  className="bg-white dark:bg-gray-800"
                  style={{
                    borderRadius: 10,
                    padding: "14px 16px",
                    width: 280,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.28)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <p
                    className="text-gray-900 dark:text-gray-100"
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      margin: "0 0 10px",
                    }}
                  >
                    Split this task?
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 12,
                    }}
                  >
                    <div
                      className="dark:bg-red-950/40 dark:border-red-900/50"
                      style={{
                        flex: 1,
                        background: "#fdf2f2",
                        border: "0.5px solid #f5c6c6",
                        borderRadius: 6,
                        padding: "7px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "#750811",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 3,
                        }}
                      >
                        Part 1
                      </div>
                      <div
                        className="text-gray-900 dark:text-gray-100"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {part1Start} – {part1End}
                      </div>
                    </div>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>✂️</span>
                    <div
                      className="dark:bg-indigo-950/40 dark:border-indigo-900/50"
                      style={{
                        flex: 1,
                        background: "#f2f4fd",
                        border: "0.5px solid #c6cef5",
                        borderRadius: 6,
                        padding: "7px 10px",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 9,
                          fontWeight: 600,
                          color: "#3C467B",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          marginBottom: 3,
                        }}
                      >
                        Part 2
                      </div>
                      <div
                        className="text-gray-900 dark:text-gray-100"
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {part2Start} – {part2End}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => setSplitConfirm(null)}
                      className="text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 6,
                        fontSize: 12,
                        border: "0.5px solid",
                        cursor: "pointer",
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmSplit}
                      style={{
                        flex: 1,
                        padding: "6px 0",
                        borderRadius: 6,
                        fontSize: 12,
                        border: "none",
                        background: "#750811",
                        color: "#fff",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Yes, split
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
      </SectionContainer>

      {/* ── Project Notes Sheet ──────────────────────────────────────────── */}
      <ProjectNotesSheet
        isOpen={notesOpen}
        onClose={() => setNotesOpen(false)}
        pId={pId}
        contractors={allGroups}
        defaultContractorTypeId={notesDefaultCtId}
        initialMode={notesInitialMode}
      />
    </>
  );
};

export default DashboardTimelineTwo;
