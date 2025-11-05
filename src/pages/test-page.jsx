



import React, { useState, useEffect } from "react";
import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CursorMarker,
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from "react-calendar-timeline";
import moment from "moment";
import axios from "axios";
import "react-calendar-timeline/style.css";
import { FAKE_CONTRACTORS, FAKE_GANTT_DATA } from "../lib/constants/fake-data";

const ReactTimelineDemo = () => {
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]); // keep unfiltered copy
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]); // keep unfiltered copy
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedContractor, setSelectedContractor] = useState("all");

  // ✅ FIXED: Controlled timeline visibility
  const [visibleTimeStart, setVisibleTimeStart] = useState(
    moment().add(-15, "days").valueOf()
  );
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(
    moment().add(15, "days").valueOf()
  );

  //! ✅ Fetch contractors, don't remove
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const res = await axios.get(
          "http://103.172.44.99:8989/api_bwal/contractor_api.php"
        );

        console.log("response from contractor data", res.data.data);
        if (res.data.success && Array.isArray(res.data.data)) {
          const formatted = res.data.data.map((c) => ({
            id: Number(c.ID),
            title: c.NAME
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

  //! fake contractors, remove after completion
  // useEffect(() => {
  //   const formatted = FAKE_CONTRACTORS.map((c) => ({
  //     id: Number(c.ID),
  //     title: c.NAME
  //   }));
  //   setGroups(formatted);
  //   setAllGroups(formatted);
  // }, [])

  //! ✅ Fetch Gantt data, don't remove
  useEffect(() => {
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
              // title: `Task ${i.L_ID}`,
              start_time: moment(i.SCHEDULE_START_DATE),
              end_time: moment(i.SCHEDULE_END_DATE),
              canMove: true,
              canResize: "both",
              canChangeGroup: true,
              itemProps: {
                style: {
                  background: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px"
                }
              }
            }));

          setItems(formattedItems);
          setAllItems(formattedItems);
        }
      } catch (err) {
        console.error("Failed to load gantt data:", err);
      }
    };

    fetchGanttData();
  }, []);
  //! fake gantt data, remove after completion
  // useEffect(() => {

  //   const formattedItems = FAKE_GANTT_DATA
  //     .filter((i) => i.SCHEDULE_START_DATE && i.SCHEDULE_END_DATE)
  //     .map((i) => ({
  //       id: Number(i.L_ID),
  //       group: Number(i.C_P_ID),
  //       title: `Task ${i.L_ID}`,
  //       start_time: moment(i.SCHEDULE_START_DATE),
  //       end_time: moment(i.SCHEDULE_END_DATE),
  //       canMove: true,
  //       canResize: "both",
  //       canChangeGroup: true,
  //       itemProps: {
  //         style: {
  //           background: "#3b82f6",
  //           color: "white",
  //           border: "none",
  //           borderRadius: "4px"
  //         }
  //       }
  //     }));

  //   setItems(formattedItems);
  //   setAllItems(formattedItems);





  // }, []);

  // ✅ FIXED: Update timeline when date changes
  useEffect(() => {
    const newStart = moment(selectedDate).add(-15, "days").valueOf();
    const newEnd = moment(selectedDate).add(15, "days").valueOf();
    setVisibleTimeStart(newStart);
    setVisibleTimeEnd(newEnd);
  }, [selectedDate]);

  // ✅ Item interactions
  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    setItems((prev) => {
      const i = prev.findIndex((item) => item.id === itemId);
      const item = prev[i];
      const duration = item.end_time - item.start_time;
      const updated = [...prev];
      updated[i] = {
        ...item,
        start_time: dragTime,
        end_time: dragTime + duration,
        group: groups[newGroupOrder]?.id ?? item.group
      };
      return updated;
    });
  };

  const handleItemResize = (itemId, time, edge) => {
    setItems((prev) => {
      const i = prev.findIndex((item) => item.id === itemId);
      const item = prev[i];
      const updated = [...prev];
      updated[i] = {
        ...item,
        [edge === "left" ? "start_time" : "end_time"]: time
      };
      return updated;
    });
  };

  const handleItemSelect = (id) => setSelectedItems([id]);
  const handleItemDeselect = () => setSelectedItems([]);

  const handleCanvasClick = (groupId, time) => {
    const newItem = {
      id: items.length + 1000,
      group: groupId,
      title: `New Task ${items.length + 1}`,
      start_time: time,
      end_time: moment(time).add(1, "day"),
      canMove: true,
      canResize: "both",
      canChangeGroup: true,
      itemProps: {
        style: {
          background: "#6366f1",
          color: "white",
          border: "none",
          borderRadius: "4px"
        }
      }
    };
    setItems((prev) => [...prev, newItem]);
    setAllItems((prev) => [...prev, newItem]);
  };

  // ✅ Filter by contractor name
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

  return (
    <div className="w-full  flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Contractor Timeline
        </h1>
        <p className="text-sm text-gray-600">
          Loaded directly from contractor and Gantt APIs
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
          />
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
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-lg">
          {groups.length > 0 && items.length > 0 ? (
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
              onCanvasClick={handleCanvasClick}
              selected={selectedItems}
              canMove
              canResize="both"
              canChangeGroup
              lineHeight={60}
              itemHeightRatio={0.75}
              sidebarWidth={220}
              stackItems
              buffer={3}
            >
              <TimelineHeaders>
                <SidebarHeader>
                  {({ getRootProps }) => (
                    <div
                      {...getRootProps()}
                      className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold"
                    >
                      Contractors
                    </div>
                  )}
                </SidebarHeader>
                <DateHeader unit="primaryHeader" />
                <DateHeader />
              </TimelineHeaders>

              <TimelineMarkers>
                <TodayMarker>
                  {({ styles }) => (
                    <div
                      style={{
                        ...styles,
                        backgroundColor: "#ef4444",
                        width: "3px",
                        zIndex: 100
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
                        opacity: 0.5
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

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total Tasks: {items.length}</span>
          <span>Selected: {selectedItems.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ReactTimelineDemo;