import React, { useState, useEffect } from "react";
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
import { useRef } from "react";
import randomColor from "randomcolor";
import { SectionContainer } from "../components/SectionContainer";
import api from "../api/Api";

const ReactTimelineDemo = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [holidays, setHolidays] = useState([]);

  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectedContractor, setSelectedContractor] = useState("all");

  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment().add(-15, "days").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment().add(15, "days").valueOf()
  );
  // ✅ Fetch Calendar (Holiday/Working day info)

  // ✅ Fetch Calendar - শুধু holidays state-এ রাখো, items-এ না

 useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.get("/calender_api.php");
        if (res.data.success && Array.isArray(res.data.records)) {
          const data = res.data.records
          // console.log(data.working_status)
            .filter((r) => r.working_status === "Holiday") // ✅ only holidays
            .map((r, index) => ({
                id: index + 1,
                // id: `holiday-${index}`,
              group: 1,
              title: r.holiday_description || "Holiday",
              start_time: moment(r.day).startOf("day"),
              end_time: moment(r.day).endOf("day"),
            //    canMove: false, // ✅ holiday move করা যাবে না
            // canResize: false,
            // canChangeGroup: false,
              itemProps: {
                style: {
                  background: "#dc2626",
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                  textAlign: "center",
                },
              },
            }));
       console.log("holiday", res.data.records.working_status)
       console.log(res)
          setHolidays(data);
           setItems(data);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
      }
    };

    fetchCalendar();
  }, []);
  console.log(holidays)
  
  


  // ✅ Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await axios.get(
          "http://103.172.44.99:8989/api_bwal/contractor_api.php"
        );
        if (res.data.success && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((c) => ({
            id: Number(c.ID),
            title: c.NAME,
          }));
          setGroups(formatted);
          setAllGroups(formatted);
        }
      } catch (err) {
        console.error("Failed to load contractors:", err);
      }
    };
    fetchContractors();
  }, []);

  // ✅ Fetch Gantt data
  // useEffect(() => {
  //   const fetchGanttData = async () => {
  //     try {
  //       const res = await axios.get("http://103.172.44.99:8989/api_bwal/gantt_api.php");
  //       if (res.data.success && Array.isArray(res.data.data)) {
  //         const formattedItems = res.data.data
  //           .filter((i) => i.SCHEDULE_START_DATE && i.SCHEDULE_END_DATE)
  //           .map((i) => ({
  //             id: Number(i.L_ID),
  //             group: Number(i.C_P_ID),
  //             // title: i.DESCRIPTION || `Task ${i.L_ID}`,
  //             start_time: moment(i.SCHEDULE_START_DATE),
  //             end_time: moment(i.SCHEDULE_END_DATE),
  //             canMove: true,
  //             canResize: "both",
  //             canChangeGroup: true,
  //             itemProps: {
  //               style: {
  //                 background: "#3b82f6",
  //                 color: "white",
  //                 border: "none",
  //                 borderRadius: "4px"
  //               }
  //             }
  //           }));

  //         setItems(formattedItems);
  //         setAllItems(formattedItems);
  //       }
  //     } catch (err) {
  //       console.error("Failed to load gantt data:", err);
  //     }
  //   };

  //    fetchGanttData();
  // }, []);

  // ✅ Fetch Gantt data (make it callable)
  const fetchGanttData = async () => {
    try {
      const res = await axios.get(
        "http://103.172.44.99:8989/api_bwal/gantt_api.php"
      );
      if (res.data.success && Array.isArray(res.data.data)) {
        const formattedItems = res.data.data
          .filter((i) => i.SCHEDULE_START_DATE && i.SCHEDULE_END_DATE)
          .map((i) => ({
            id: Number(i.L_ID),
            group: Number(i.C_P_ID),
            start_time: moment(i.SCHEDULE_START_DATE).startOf("day"),
            end_time: moment(i.SCHEDULE_END_DATE).endOf("day"),
            canMove: true,
            canResize: "both",
            canChangeGroup: true,
            itemProps: {
              style: {
                background: randomColor({ luminosity: "dark" }),
                color: "white",
                border: "none",
                borderRadius: "4px",
              },
            },
          }));

          setItems([...holidays, ...formattedItems]);
      setAllItems([...holidays, ...formattedItems]);

        // setItems(formattedItems);
        // setAllItems(formattedItems);
      }
    } catch (err) {
      console.error("Failed to load gantt data:", err);
    }
  };

  // ✅ Load once at mount
  useEffect(() => {
    fetchGanttData();
  }, []);

  // ✅ Update visible window when date changes
  useEffect(() => {
    const newStart = moment(selectedDate).add(-15, "days").valueOf();
    const newEnd = moment(selectedDate).add(15, "days").valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
  }, [selectedDate]);

  // Create a ref to avoid double toasts
  // add useRef at top

  // inside your component
  const lastUpdatedRef = useRef(null);

  const updateItemOnServer = async (item) => {
    const key = `${item.id}-${item.start_time}-${item.end_time}`;
    if (lastUpdatedRef.current === key) return; // 🧠 prevent duplicate
    lastUpdatedRef.current = key;

    try {
      await axios.put("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
        L_ID: item.id,
        C_P_ID: item.group,
        SCHEDULE_START_DATE: moment(item.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(item.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title,
      });

      toast.success("Task updated successfully");
    } catch (err) {
      toast.error("Failed to update task");
      console.error(" Failed to update item:", err);
    } finally {
      // Reset the protection key after a short delay
      setTimeout(() => {
        lastUpdatedRef.current = null;
      }, 500);
    }
  };

  // ✅ API: Update item position or resize
  // const updateItemOnServer = async (item) => {
  //   try {
  //     await axios.put("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
  //       L_ID: item.id,
  //       C_P_ID: item.group,
  //       SCHEDULE_START_DATE: moment(item.start_time).format("YYYY-MM-DD"),
  //       SCHEDULE_END_DATE: moment(item.end_time).format("YYYY-MM-DD"),
  //       DESCRIPTION: item.title
  //     });
  //     // console.log("✅ Updated on server:", item);
  //     // toast.success(" Updated on task",item);
  //     // console.log("✅ Updated on server:", item);
  //   } catch (err) {
  //     // toast.error("Failed to update on server", err);
  //     // console.error("❌ Failed to update item:", err);
  //   }
  // };

  // ✅ API: Add new item
  // const addItemToServer = async (newItem) => {
  //   try {
  //     const res = await axios.post("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
  //       C_P_ID: newItem.group,
  //       SCHEDULE_START_DATE: moment(newItem.start_time).format("YYYY-MM-DD"),
  //       SCHEDULE_END_DATE: moment(newItem.end_time).format("YYYY-MM-DD"),
  //       DESCRIPTION: newItem.title,
  //        CREATION_BY: 1, // optional if required by API
  //         H_ID: 46,
  //     });
  //     console.log("✅ Added new task:", res.data);
  //   } catch (err) {
  //     console.error("❌ Failed to add new task:", err);
  //   }
  // };

  const handleItemDoubleClick = async (itemId, e, time) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    // ✅ Split point (যেদিন তুমি double-click করবা)
    const splitDate = moment(time).startOf("day");

    // যদি splitDate শুরু বা শেষের বাইরে হয়, cancel করো
    if (
      splitDate.isSameOrBefore(moment(item.start_time)) ||
      splitDate.isSameOrAfter(moment(item.end_time))
    ) {
      toast.warn("Split date must be between start and end date");
      return;
    }

    // ✅ প্রথম অর্ধ: আগের item update হবে
    const firstHalf = {
      ...item,
      end_time: splitDate.clone().endOf("day").valueOf(),
      itemProps: {
        style: {
          ...item.itemProps.style,
          background: randomColor({ luminosity: "dark" }),
        },
      },
    };

    // ✅ দ্বিতীয় অর্ধ: নতুন item create হবে
    const secondHalf = {
      ...item,
      id: Date.now(), // temporary
      start_time: splitDate.clone().add(1, "day").startOf("day").valueOf(),
      end_time: item.end_time,
      itemProps: {
        style: {
          ...item.itemProps.style,
          background: randomColor({ luminosity: "dark" }),
        },
      },
    };

    // ✅ UI তে সাথে সাথে reflect করাও
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      return [...updated, firstHalf, secondHalf];
    });
    setAllItems((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      return [...updated, firstHalf, secondHalf];
    });

    toast.info("Splitting and saving...");

    try {
      // 1️⃣ আগের item update (first half)
      await axios.put("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
        L_ID: item.id,
        C_P_ID: firstHalf.group,
        SCHEDULE_START_DATE: moment(firstHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(firstHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 1)",
      });

      // 2️⃣ নতুন item create (second half)
      const res = await axios.post(
        "http://103.172.44.99:8989/api_bwal/gantt_api.php",
        {
          C_P_ID: secondHalf.group,
          SCHEDULE_START_DATE: moment(secondHalf.start_time).format(
            "YYYY-MM-DD"
          ),
          SCHEDULE_END_DATE: moment(secondHalf.end_time).format("YYYY-MM-DD"),
          DESCRIPTION: item.title || "Split Task (Part 2)",
          CREATION_BY: 1,
          H_ID: 46,
        }
      );

      if (res.data.success) {
        toast.success("Task successfully split and saved");
        await fetchGanttData();
      } else {
        toast.warn("Split updated locally, but backend didn’t confirm success");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to split task on server");
    }
  };

  // ✅ Move item
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
      // toast.success("✅ Task updated"); // 🔁 sync with backend
      return updated;
    });
  };

  // ✅ Resize item
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
      // toast.success("✅ Task updated"); // 🔁 sync with backend
      return updated;
    });
  };

  // ✅ Select / Deselect
  const handleItemSelect = (id) => setSelectedItems([id]);
  const handleItemDeselect = () => setSelectedItems([]);

  // ✅ Add new item by clicking on empty canvas
  // const handleCanvasClick = (groupId, time, e) => {
  //   const newItem = {
  //     id: Date.now(), // temporary ID
  //     group: groupId,
  //     title: `New Task`,
  //     start_time: moment(time),
  //     end_time: moment(time).add(1, "day"),
  //     canMove: true,
  //     canResize: "both",
  //     canChangeGroup: true,
  //     itemProps: {
  //       style: {
  //         background: "#6366f1",
  //         color: "white",
  //         border: "none",
  //         borderRadius: "4px"
  //       }
  //     }
  //   };
  //   setItems((prev) => [...prev, newItem]);
  //   setAllItems((prev) => [...prev, newItem]);
  //   addItemToServer(newItem); // 🆕 send to backend
  // };

  //  const handleCanvasClick = async (groupId, time, e) => {
  //   // If click is not on an actual group row, ignore
  //   if (!groupId) return;

  //   const newItem = {
  //     id: Date.now(), // temporary unique ID
  //     group: groupId,
  //     // title: "New Task",
  //     start_time: moment(time),
  //     end_time: moment(time).add(1, "day"),
  //     canMove: true,
  //     canResize: "both",
  //     canChangeGroup: true,
  //     itemProps: {
  //       style: {
  //         background: "#6366f1",
  //         color: "white",
  //         border: "none",
  //         borderRadius: "4px"
  //       }
  //     }
  //   };

  //   // ✅ Immediately show on UI
  //   setItems((prev) => [...prev, newItem]);
  //   setAllItems((prev) => [...prev, newItem]);

  //   // ✅ Then send to backend
  //   try {
  //     const res = await axios.post("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
  //       C_P_ID: newItem.group,
  //       SCHEDULE_START_DATE: moment(newItem.start_time).format("YYYY-MM-DD"),
  //       SCHEDULE_END_DATE: moment(newItem.end_time).format("YYYY-MM-DD"),
  //       DESCRIPTION: newItem.title,
  //       CREATION_BY: 1, // optional if required by API
  //       H_ID: 46,       // optional if required by API
  //     });

  //     if (res.data.success) {
  //       toast.success(" Task created successfully");
  //     } else {
  //       toast.warn("Task added locally, but API didn’t confirm success");
  //     }
  //   } catch (err) {
  //     toast.error("Failed to create task on server");
  //     console.error(err);
  //   }
  // };

  // const handleCanvasClick = async (groupId, time, e) => {
  //   if (!groupId) return;

  //   const newItem = {
  //     id: Date.now(), // temporary ID
  //     group: groupId,
  //     // title: "New Task",
  //     start_time: moment(time),
  //     end_time: moment(time).add(1, "day"),
  //     canMove: true,
  //     canResize: "both",
  //     canChangeGroup: true,
  //    itemProps: {
  //   style: {
  //     background: randomColor({ luminosity: "dark", seed: groupId }),
  //     color: "white",
  //     border: "none",
  //     borderRadius: "4px",
  //   },
  // },
  //   };

  //   // ✅ Show immediately
  //   setItems((prev) => [...prev, newItem]);
  //   setAllItems((prev) => [...prev, newItem]);

  //   // ✅ Save to backend
  //   try {
  //     const res = await axios.post("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
  //       C_P_ID: newItem.group,
  //       SCHEDULE_START_DATE: moment(newItem.start_time).format("YYYY-MM-DD"),
  //       SCHEDULE_END_DATE: moment(newItem.end_time).format("YYYY-MM-DD"),
  //       DESCRIPTION: newItem.title,
  //       CREATION_BY: 1,
  //       H_ID: 46,
  //     });

  //     if (res.data.success) {
  //       toast.success("Task created successfully");
  //       // 🧠 Auto refresh after create
  //       await fetchGanttData();
  //     } else {
  //       toast.warn("⚠️ Task added locally, but API didn’t confirm success");
  //     }
  //   } catch (err) {
  //     toast.error("❌ Failed to create task on server");
  //     console.error(err);
  //   }
  // };

  // ✅ Filter by contractor
  // useEffect(() => {
  //   if (selectedContractor === "all") {
  //     setGroups(allGroups);
  //     setItems(allItems);
  //   } else {
  //     const filteredGroups = allGroups.filter(
  //       (g) => g.id === Number(selectedContractor)
  //     );
  //     const filteredItems = allItems.filter(
  //       (i) => i.group === Number(selectedContractor)
  //     );
  //     setGroups(filteredGroups);
  //     setItems(filteredItems);
  //   }
  // }, [selectedContractor, allGroups, allItems]);

  // ✅ 3. Filter logic-এ holidays add করো
useEffect(() => {
  if (selectedContractor === "all") {
    setGroups(allGroups);
    setItems([...holidays, ...allItems.filter(i => !i.id.toString().startsWith('holiday'))]); // ✅
  } else {
    const filteredGroups = allGroups.filter(
      (g) => g.id === Number(selectedContractor)
    );
    const filteredItems = allItems.filter(
      (i) => i.group === Number(selectedContractor) && !i.id.toString().startsWith('holiday')
    );
    setGroups(filteredGroups);
    setItems([...holidays, ...filteredItems]); // ✅
  }
}, [selectedContractor, allGroups, allItems, holidays]);

// ✅ Highlight full vertical columns for holidays (from API)
/* Hide "Week" text inside timeline headers */


// useEffect(() => {
//   if (!holidays.length) return;

//   const timeline = document.querySelector(".react-calendar-timeline");
//   if (!timeline) return;

//   // Remove any previous holiday overlays
//   document.querySelectorAll(".holiday-column-overlay").forEach(el => el.remove());

//   const visibleDuration = visibleTimeEnd - visibleTimeStart;

//   holidays.forEach(holiday => {
//     const dayStart = moment(holiday.start_time).startOf("day").valueOf();
//     const dayEnd = moment(holiday.start_time).endOf("day").valueOf();

//     if (dayEnd < visibleTimeStart || dayStart > visibleTimeEnd) {
//       return; // not in visible window
//     }

//     const leftPercent = ((dayStart - visibleTimeStart) / visibleDuration) * 100;
//     const widthPercent = ((dayEnd - dayStart) / visibleDuration) * 100;

//     // Body overlay (all contractors rows)
//     const bodyOverlay = document.createElement("div");
//     bodyOverlay.className = "holiday-column-overlay";
//     bodyOverlay.style.cssText = `
//       position: absolute;
//       left: ${leftPercent}%;
//       width: ${widthPercent}%;
//       top: 0;
//       bottom: 0;
//       background: rgba(220, 38, 38, 0.15);
//       pointer-events: none;
//       z-index: 1;
//     `;
//     const verticalLines = timeline.querySelector(".rct-vertical-lines");
//     if (verticalLines) {
//       verticalLines.appendChild(bodyOverlay);
//     }

//     // Header overlay (date header)
//     const headerOverlay = document.createElement("div");
//     headerOverlay.className = "holiday-column-overlay";
//     headerOverlay.style.cssText = `
//       position: absolute;
//       left: ${leftPercent}%;
//       width: ${widthPercent}%;
//       top: 0;
//       height: 100%;
//       background: rgba(220, 38, 38, 0.25);
//       pointer-events: none;
//       z-index: 2;
//     `;
//     const headerRoot = timeline.querySelector(".rct-header-root");
//     if (headerRoot) {
//       headerRoot.appendChild(headerOverlay);
//     }

//     // Hide "Week" text inside that header cell if present
//     const headerCells = headerRoot.querySelectorAll(".rct-dateHeader");
//     headerCells.forEach(cell => {
//       if (cell.textContent.trim().toLowerCase() === "Week") {
//         cell.style.color = "transparent";
//       }
//     });
//   });

// }, [holidays, visibleTimeStart, visibleTimeEnd]);


  return (
    <>
    {/* <style>{`
    .holiday-column-overlay {
  transition: opacity 0.3s ease;
}

    
    `}</style> */}

    <style>{`
  .react-calendar-timeline .rct-header-root {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
  }

  /* Light red tint for entire holiday day columns */
  .react-calendar-timeline .rct-horizontal-lines .rct-hl-holiday {
    background-color: #960018;
  }

  // /* Date cell hover effect */
  // .react-calendar-timeline .rct-dateHeader:hover {
  //   background-color: #e0f2fe !important;
  // }
`}</style>

      {/* <style>{`
      .react-calendar-timeline .rct-header-root {
        position: sticky;
        top: 0;
        z-index: 100;
        background: red-700;
      }
    `}</style> */}
      <div className="  bg-gray-50">
        <SectionContainer planningBoard={true}>
          {/* Filter Bar */}
          <div className="bg-white  flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="bg-white p-4">
              <h1 className="text-sm font-bold text-gray-800 mb-2">
                Dashboard Timeline
              </h1>
            </div>

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

          {/* Timeline */}
          <div className="flex-1  overflow-hidden">
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
                  lineHeight={15}
                  itemHeightRatio={0.75}
                  sidebarWidth={200}
                  stackItems
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
                          className="flex items-center text-sm justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
                        >
                          Contractors
                        </div>
                      )}
                    </SidebarHeader>

                    {/* Month header */}
                    <DateHeader
                      unit="primaryHeader"
                      labelFormat="MMMM YYYY"
                      style={{
                        background: "#960018",
                        color: "#111827",
                        fontWeight: 600,
                        textAlign: "center",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    />

                    {/* Daily header with holiday marking */}
                    <DateHeader
                  unit="day"
                  labelFormat="DD"
                  style={{
                    background: "#fef2f2",
                    color: "#991b1b",
                    textAlign: "center",
                    fontSize: "11px",
                    borderLeft: "1px solid #fecaca",
                    borderRight: "1px solid #fecaca",
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
                            zIndex: 100,
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
      </div>
    </>
  );
};

export default ReactTimelineDemo;
