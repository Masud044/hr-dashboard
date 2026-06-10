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

const url = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const DashboardTimeline = () => {
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

  const colorMap = useRef({});
  const lastUpdatedRef = useRef(null);

  const distinctColors = [
    "#001BB7", "#4FB7B3", "#4DFFBE", "#78C841", "#A3B087",
    "#FCB53B", "#F5DEA3", "#7B542F", "#FF8040", "#E49BA6",
    "#DC0E0E", "#850E35", "#E83C91", "#9112BC", "#3C467B",
    "#000000", "#71C0BB", "#7C4585", "#174143", "#FFC400", "#FF0060",
  ];

  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment().subtract(3, "days").startOf("day").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment().add(20, "days").endOf("day").valueOf()
  );

  // ✅ Fetch Calendar
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await axios.get(`${url}/api/calendar`);
        if (res.data.success && Array.isArray(res.data.data)) {
          const holidayRecords = res.data.data.filter(
            (r) =>
              r.WORKING_STATUS === "WEEKEND" || r.WORKING_STATUS === "HOLIDAY"
          );
          const holidayDateSet = new Set(
            holidayRecords.map((r) => moment.utc(r.DAY).format("YYYY-MM-DD"))
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

  // ✅ Fetch Contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await axios.get(`${url}/api/contractor-type`);
        if (res.data.success && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((c, index) => {
            const id = Number(c.ID);
            if (!colorMap.current[id]) {
              colorMap.current[id] = distinctColors[index % distinctColors.length];
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

  // ✅ Fetch Project Header
  useEffect(() => {
    const fetchProjectHeader = async () => {
      try {
        const res = await axios.get(`${url}/api/schedule-header?hid=${H_ID}`);
        if (res.data.success) {
          const project = res.data.data;
          setProjectName(project.P_NAME || "");
        }
      } catch (error) {
        console.error("Project header load failed:", error);
      }
    };
    if (H_ID) fetchProjectHeader();
  }, [H_ID]);

  // ✅ Fetch Gantt Data
  const fetchGanttData = async () => {
    try {
      const res = await axios.get(`${url}/api/gantt`);
      if (res.data.success && Array.isArray(res.data.data)) {
        const filtered = res.data.data.filter(
          (i) => Number(i.H_ID) === Number(H_ID)
        );

        const formattedItems = filtered
          .filter((i) => i.SCHEDULE_START_DATE && i.SCHEDULE_END_DATE)
          .map((i) => {
            const contractorId = Number(i.C_P_ID);
            const color = colorMap.current[contractorId] || "#999";
            return {
              id: Number(i.L_ID),
              group: contractorId,
              contractorName: i.CONTRATOR_NAME,
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
          const earliestDate = moment(Math.min(...startDates)).startOf("day");
          const latestDate = moment(Math.max(...endDates)).endOf("day");
          setVisibleTimeStart(earliestDate.valueOf());
          setVisibleTimeEnd(latestDate.add(15, "days").valueOf());
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

  // ✅ Update item on server (move/resize)
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

  // ✅ Double-click to split — fixed race condition + ID conflict
  const handleItemDoubleClick = async (itemId, e, time) => {
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

    const contractorColor = colorMap.current[item.group];

    const firstHalf = {
      ...item,
      end_time: splitDate.clone().endOf("day").valueOf(),
      itemProps: {
        style: { ...item.itemProps.style, background: contractorColor },
      },
    };

    // ✅ Negative temp ID — never collides with a real DB integer ID
    const tempId = -Date.now();

    const secondHalf = {
      ...item,
      id: tempId,
      start_time: splitDate.clone().add(1, "day").startOf("day").valueOf(),
      end_time: item.end_time,
      itemProps: {
        style: { ...item.itemProps.style, background: contractorColor },
      },
    };

    // Optimistic UI update
    const applyUpdate = (prev) => {
      const rest = prev.filter((i) => i.id !== itemId);
      return [...rest, firstHalf, secondHalf];
    };
    setItems(applyUpdate);
    setAllItems(applyUpdate);

    toast.info("Splitting task...");

    try {
      // 1. Update first half (existing record)
      await axios.put(`${url}/api/gantt`, {
        L_ID: item.id,
        C_P_ID: firstHalf.group,
        SCHEDULE_START_DATE: moment(firstHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(firstHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 1)",
      });

      // 2. Create second half (new record)
      const res = await axios.post(`${url}/api/gantt`, {
        C_P_ID: secondHalf.group,
        SCHEDULE_START_DATE: moment(secondHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(secondHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 2)",
        CREATION_BY: 1,
        H_ID: H_ID,
      });

      if (res.data.success) {
        toast.success("Task split successfully");
        // ✅ Refresh only after BOTH calls succeed — no race condition
        await fetchGanttData();
      } else {
        toast.warn("Saved locally, but server did not confirm");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to split task on server");
      // ✅ Rollback optimistic update on failure
      setItems((prev) =>
        prev
          .filter((i) => i.id !== firstHalf.id && i.id !== tempId)
          .concat(item)
      );
      setAllItems((prev) =>
        prev
          .filter((i) => i.id !== firstHalf.id && i.id !== tempId)
          .concat(item)
      );
    }
  };

  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    setItems((prev) => {
      const i = prev.findIndex((item) => item.id === itemId);
      const item = prev[i];
      const duration = item.end_time - item.start_time;
      const updated = [...prev];
      const newItem = {
        ...item,
        start_time: dragTime,
        end_time: dragTime + duration,
        group: groups[newGroupOrder]?.id ?? item.group,
      };
      updated[i] = newItem;
      updateItemOnServer(newItem);
      return updated;
    });
  };

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

  // ✅ Filter by contractor
  useEffect(() => {
    if (selectedContractor === "all") {
      setGroups(allGroups);
      setItems(allItems);
    } else {
      const filteredGroups = allGroups.filter(
        (g) => g.id === Number(selectedContractor)
      );
      const filteredItems = allItems.filter(
        (i) => i.group === Number(selectedContractor)
      );
      setGroups(filteredGroups);
      setItems(filteredItems);
    }
  }, [selectedContractor, allGroups, allItems]);

  // ✅ Holiday column highlighting
  const verticalLineClassNamesForTime = (timeStart) => {
    const dateStr = moment(timeStart).format("YYYY-MM-DD");
    return holidayDates.has(dateStr) ? ["holiday"] : [];
  };

  const itemRenderer = ({ item, itemContext, getItemProps }) => (
    <TaskHoverCard
      item={item}
      itemContext={itemContext}
      getItemProps={getItemProps}
      groups={groups}
      holidayDates={holidayDates}
      projectName={projectName}
      contractorName={item.contractorName}
    />
  );

  return (
    <>
      <style>{`
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
      `}</style>

      <SectionContainer>
        {/* Filter Bar */}
        <div className="bg-white flex items-center justify-between">
          <div className="bg-white p-4">
            <h1 className="text-sm font-bold text-gray-800 mb-2">
              Dashboard Timeline
            </h1>
          </div>
          <div className="flex justify-end items-center gap-2">
            <button
              className="border-1 px-1 text-sm rounded-sm bg-purple-600 text-white"
              onClick={() => navigate("/dashboard/dashboard-schedule")}
            >
              Back
            </button>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Contractor:</label>
              <select
                value={selectedContractor}
                onChange={(e) => setSelectedContractor(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All Contractors</option>
                {allGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full bg-white rounded-lg shadow-lg">
            {groups.length > 0 ? (
              <Timeline
                groups={groups}
                items={items}
                visibleTimeStart={visibleTimeStart}
                visibleTimeEnd={visibleTimeEnd}
                onTimeChange={(start, end, updateScrollCanvas) => {
                  setVisibleTimeStart(start);
                  setVisibleTimeEnd(end);
                  updateScrollCanvas(start, end);
                }}
                onItemMove={handleItemMove}
                onItemResize={handleItemResize}
                onItemSelect={handleItemSelect}
                onItemDeselect={handleItemDeselect}
                onItemDoubleClick={handleItemDoubleClick}
                selected={selectedItems}
                canMove
                canResize="both"
                canChangeGroup
                lineHeight={40}
                itemHeightRatio={0.75}
                sidebarWidth={200}
                stackItems
                verticalLineClassNamesForTime={verticalLineClassNamesForTime}
                itemRenderer={itemRenderer}
                groupRenderer={({ group }) => (
                  <div style={{ fontSize: "10px", fontWeight: 600 }}>
                    {group.title}
                  </div>
                )}
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
              <div className="flex items-center justify-center h-full text-gray-500">
                Loading contractors and schedule...
              </div>
            )}
          </div>
        </div>
      </SectionContainer>
    </>
  );
};

export default DashboardTimeline;