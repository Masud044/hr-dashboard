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
import randomColor from "randomcolor";
import { SectionContainer } from "../components/SectionContainer";
import api from "../api/Api";

const ReactTimelineDemo = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [holidayDates, setHolidayDates] = useState(new Set());

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

  const lastUpdatedRef = useRef(null);

  // ✅ Fetch Calendar (Holiday/Working day info)
  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const res = await api.get("/calender_api.php");
        if (res.data.success && Array.isArray(res.data.records)) {
          const holidayRecords = res.data.records.filter(
            (r) => r.working_status === "Holiday"
          );

          // Store holiday dates for column highlighting
          const holidayDateSet = new Set(
            holidayRecords.map((r) => moment(r.day).format("YYYY-MM-DD"))
          );
          setHolidayDates(holidayDateSet);

          console.log("Holiday dates:", Array.from(holidayDateSet));
          console.log("Total holidays:", holidayRecords.length);
        }
      } catch (err) {
        console.error("Failed to load calendar data:", err);
        toast.error("Failed to load calendar data");
      }
    };

    fetchCalendar();
  }, []);

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
        toast.error("Failed to load contractors");
      }
    };
    fetchContractors();
  }, []);

  // ✅ Fetch Gantt data
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

        setItems(formattedItems);
        setAllItems(formattedItems);
      }
    } catch (err) {
      console.error("Failed to load gantt data:", err);
      toast.error("Failed to load gantt data");
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

  const updateItemOnServer = async (item) => {
    const key = `${item.id}-${item.start_time}-${item.end_time}`;
    if (lastUpdatedRef.current === key) return;
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
      console.error("Failed to update item:", err);
    } finally {
      setTimeout(() => {
        lastUpdatedRef.current = null;
      }, 500);
    }
  };

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

    const secondHalf = {
      ...item,
      id: Date.now(),
      start_time: splitDate.clone().add(1, "day").startOf("day").valueOf(),
      end_time: item.end_time,
      itemProps: {
        style: {
          ...item.itemProps.style,
          background: randomColor({ luminosity: "dark" }),
        },
      },
    };

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
      await axios.put("http://103.172.44.99:8989/api_bwal/gantt_api.php", {
        L_ID: item.id,
        C_P_ID: firstHalf.group,
        SCHEDULE_START_DATE: moment(firstHalf.start_time).format("YYYY-MM-DD"),
        SCHEDULE_END_DATE: moment(firstHalf.end_time).format("YYYY-MM-DD"),
        DESCRIPTION: item.title || "Split Task (Part 1)",
      });

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
        toast.warn("Split updated locally, but backend didn't confirm success");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to split task on server");
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

  // ✅ Function to mark holiday columns - PROPER WAY
  const verticalLineClassNamesForTime = (timeStart, timeEnd) => {
    const currentTimeStart = moment(timeStart);
    const currentTimeEnd = moment(timeEnd);
    const dateStr = currentTimeStart.format('YYYY-MM-DD');

    // Check if this column is a holiday
    if (holidayDates.has(dateStr)) {
      return ['holiday'];
    }
    return [];
  };

  
 


useEffect(() => {
  if (!holidayDates.size) return;

  const applyHolidayHeaderStyles = () => {
    // সব দিন হেডার খুঁজে বের করো
    const headers = document.querySelectorAll('.rct-dateHeader[data-time]');
    headers.forEach((header) => {
      const timestamp = parseInt(header.getAttribute('data-time'), 10);
      if (!timestamp) return;
      const dateStr = moment(timestamp).format('YYYY-MM-DD');
      const isHoliday = holidayDates.has(dateStr);

      // পুরনো style remove করো
     if (isHoliday) {
        header.classList.add("holiday-header");
      } else {
        header.classList.remove("holiday-header");
      }
    });
  };

  // প্রথমবার কল করো
  applyHolidayHeaderStyles();

  // observe করো যাতে scroll/zoom করলে update হয়
  const root = document.querySelector('.rct-header-root');
  if (!root) return;

  const observer = new MutationObserver(() => {
    applyHolidayHeaderStyles();
  });
  observer.observe(root, { childList: true, subtree: true });

  return () => observer.disconnect();
}, [holidayDates, visibleTimeStart, visibleTimeEnd]);





  return (
    <>
      <style>{`
        .react-calendar-timeline .rct-header-root {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
        }

        /* DateHeader holiday highlight */
.rct-dateHeader.holiday-header {
  background-color: rgba(239, 68, 68, 0.25) !important; /* light red */
  color: #b91c1c !important;
  font-weight: 700 !important;
  border-left: 1px solid rgba(239, 68, 68, 0.3);
  border-right: 1px solid rgba(239, 68, 68, 0.3);
}



        /* Holiday column highlighting - Timeline Body */
        .rct-vl.holiday {
          background-color: rgba(220, 38, 38, 0.15) !important;
        }

        /* Date header hover effect */
        .react-calendar-timeline .rct-dateHeader:hover {
          opacity: 0.9;
          
        }

      

   .rct-dateHeader {
    background-color: unset !important;
  }


    
        // }
      `}</style>

      <div className="bg-gray-50">
        <SectionContainer planningBoard={true}>
          {/* Filter Bar */}
          <div className="bg-white flex items-center justify-between gap-4">
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
                  lineHeight={15}
                  itemHeightRatio={0.75}
                  sidebarWidth={200}
                  stackItems
                  verticalLineClassNamesForTime={verticalLineClassNamesForTime}
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

                    {/* Month header */}
                    <DateHeader
                      unit="primaryHeader"
                      labelFormat="MMMM YYYY"
                      style={{
                        background: "#750811ff",
                        color: "#ffffff",
                        fontWeight: 600,
                        textAlign: "center",
                        borderBottom: "1px solid #e5e7eb",
                       
                      }}
                    />

                    {/* Daily header */}
                    <DateHeader
                      unit="day"
                       labelFormat="DD ddd"
                      style={{
                         background: "#eef2f7ff",
                         color: "#404752ff",
                        textAlign: "center",
                        fontSize: "11px",
                        borderLeft: "1px solid #e5e7eb",
                        borderRight: "1px solid #e5e7eb",
                         marginTop: "2px",
                        marginBottom: "1px",
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
      </div>
    </>
  );
};

export default ReactTimelineDemo;