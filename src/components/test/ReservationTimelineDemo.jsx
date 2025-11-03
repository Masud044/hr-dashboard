/* eslint-disable react/react-in-jsx-scope */
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import moment from "moment";
import Timeline, {
  CustomMarker,
  DateHeader,
  SidebarHeader,
  TimelineHeaders,
  TodayMarker,
} from "react-calendar-timeline";
import "react-calendar-timeline/style.css";

// ----- HELPER FUNCTIONS -----
const getStatus = (reservation) => {
  if (!reservation.isApproved || reservation.isRejected) return "rejected";
  if (reservation.isCancelled) return "cancelled";
  if (reservation.isCarPickedUp && reservation.isCarDroppedOff) return "completed";
  if (reservation.isCarPickedUp && !reservation.isCarDroppedOff) return "ongoing";
  if (!reservation.isCarPickedUp && !reservation.isCarDroppedOff) return "upcoming";
  return "";
};

const formatReservations = (reservations) => {
  const items = [];
  const groups = [];
  const carMap = new Map();

  reservations.forEach((reservation) => {
    const carId = reservation.carId;
    const carName = reservation.carName;
    const status = getStatus(reservation);

    if (!carMap.has(carId)) {
      carMap.set(carId, true);
      groups.push({ id: carId, title: carName, height: 30 });
    }

    items.push({
      id: reservation.id,
      group: carId,
      title: status.toUpperCase(),
      start_time: moment(reservation.pickupDate).valueOf(),
      end_time: moment(reservation.dropoffDate).valueOf(),
      itemProps: {
        className: "rounded-md text-xs text-center",
      },
    });
  });

  return { groups, items };
};

// ----- DEMO COMPONENT -----
const ONE_DAY = 24 * 60 * 60 * 1000;

const ReservationTimelineDemo = () => {
  const today = dayjs().startOf("day");
  const defaultStartDate = today;
  const defaultEndDate = today.endOf("day");

  const [startDate, setStartDate] = useState(defaultStartDate.format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEndDate.format("YYYY-MM-DD"));
  const [minTime, setMinTime] = useState(defaultStartDate.valueOf());
  const [maxTime, setMaxTime] = useState(defaultEndDate.valueOf());
  const [visibleTimeStart, setVisibleTimeStart] = useState(today.startOf("day").valueOf());
  const [visibleTimeEnd, setVisibleTimeEnd] = useState(today.endOf("day").valueOf());
  const [showHourHeader, setShowHourHeader] = useState(true);
  const [selectedCarType, setSelectedCarType] = useState("");

  // ======== DEMO STATIC DATA ========
  const fakeCarTypes = [
    { categoryName: "SUV" },
    { categoryName: "Sedan" },
    { categoryName: "Truck" },
  ];

  const fakeReservations = [
    {
      id: 1,
      carId: 101,
      carName: "Toyota Corolla",
      isApproved: true,
      isRejected: false,
      isCancelled: false,
      isCarPickedUp: true,
      isCarDroppedOff: false,
      pickupDate: dayjs().subtract(3, "hour").toISOString(),
      dropoffDate: dayjs().add(3, "hour").toISOString(),
      carType: "Sedan",
    },
    {
      id: 2,
      carId: 102,
      carName: "Honda CR-V",
      isApproved: true,
      isRejected: false,
      isCancelled: false,
      isCarPickedUp: false,
      isCarDroppedOff: false,
      pickupDate: dayjs().add(2, "hour").toISOString(),
      dropoffDate: dayjs().add(5, "hour").toISOString(),
      carType: "SUV",
    },
    {
      id: 3,
      carId: 103,
      carName: "Ford F-150",
      isApproved: true,
      isRejected: false,
      isCancelled: true,
      isCarPickedUp: false,
      isCarDroppedOff: false,
      pickupDate: dayjs().subtract(1, "day").toISOString(),
      dropoffDate: dayjs().subtract(1, "day").add(5, "hour").toISOString(),
      carType: "Truck",
    },
  ];

  const [groups, setGroups] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      let filtered = fakeReservations;
      if (selectedCarType) {
        filtered = filtered.filter((r) => r.carType === selectedCarType);
      }
      const formatted = formatReservations(filtered);
      setGroups(formatted.groups);
      setReservations(formatted.items);
    }, 400);
  }, [selectedCarType, startDate, endDate]);

  const handleCarTypeChange = (e) => setSelectedCarType(e.target.value);
  const handleDateChange = (e) => {
    const newDate = dayjs(e.target.value);
    if (newDate.isValid()) {
      const newStart = newDate.startOf("day");
      const newEnd = newDate.endOf("day");
      setStartDate(newStart.format("YYYY-MM-DD"));
      setEndDate(newEnd.format("YYYY-MM-DD"));
      setMinTime(newStart.valueOf());
      setMaxTime(newEnd.valueOf());
      setVisibleTimeStart(newStart.valueOf());
      setVisibleTimeEnd(newEnd.valueOf());
      setShowHourHeader(true);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "!bg-blue-600";
      case "cancelled":
        return "!bg-red-600";
      case "ongoing":
        return "!bg-green-600";
      case "upcoming":
        return "!bg-yellow-400";
      case "rejected":
        return "!bg-gray-500";
      default:
        return "";
    }
  };

  return (
    <div className="p-8 bg-[#F2F2FA] h-[86vh] rounded-3xl">
      <div className="bg-white rounded-2xl shadow-md h-full">
        <div className="flex justify-between items-center pt-6 pb-4 px-6 border-b">
          {/* Date Input */}
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-gray-700">Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleDateChange}
              className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Car Type Filter */}
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-gray-700">Car Type:</label>
            <select
              value={selectedCarType}
              onChange={handleCarTypeChange}
              className="border rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Cars</option>
              {fakeCarTypes.map((type) => (
                <option key={type.categoryName} value={type.categoryName}>
                  {type.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!groups.length ? (
          <div className="p-6 bg-gray-50 text-center text-gray-500">
            Loading timeline...
          </div>
        ) : (
          <Timeline
            groups={groups}
            items={reservations}
            keys={{
              groupIdKey: "id",
              groupTitleKey: "title",
              itemIdKey: "id",
              itemTitleKey: "title",
              itemGroupKey: "group",
              itemTimeStartKey: "start_time",
              itemTimeEndKey: "end_time",
            }}
            itemRenderer={({ item, getItemProps }) => {
              const bg = getStatusColor(item.title);
              return (
                <div
                  {...getItemProps({
                    className: `text-white rounded !border-none text-center text-sm cursor-pointer ${bg}`,
                  })}
                  title={item.title}
                >
                  {item.title}
                </div>
              );
            }}
            groupRenderer={({ group }) => <div className="pl-8">{group.title}</div>}
            verticalLineClassNamesForTime={() => ["!border-l-2 !border-dashed !border-gray-300"]}
            minZoom={1000 * 60 * 60 * 12}
            maxZoom={10 * 1000 * 60 * 60 * 24}
            stackItems
            itemHeightRatio={0.6}
            sidebarWidth={150}
            visibleTimeStart={visibleTimeStart}
            visibleTimeEnd={visibleTimeEnd}
            onTimeChange={(start, end, update) => {
              const range = end - start;
              if (start < minTime) update(minTime, minTime + range);
              else if (end > maxTime) update(maxTime - range, maxTime);
              else update(start, end);
              setShowHourHeader(range <= 1.5 * ONE_DAY);
            }}
          >
            <TimelineHeaders className="text-black border-none" style={{ backgroundColor: "#ECECF0" }}>
              <SidebarHeader>
                {() => (
                  <div className="bg-[#ECECF0] font-semibold text-center border-r border-gray-300">
                    Cars
                  </div>
                )}
              </SidebarHeader>

              <DateHeader
                unit="day"
                intervalRenderer={({ getIntervalProps, intervalContext }) => (
                  <div
                    {...getIntervalProps()}
                    className="text-[#5D5DF6] mt-3 font-bold text-center flex items-center justify-center text-sm"
                  >
                    <span>{dayjs(intervalContext.interval.startTime.$d).format("DD/MM/YYYY")}</span>
                  </div>
                )}
              />

              {showHourHeader && (
                <DateHeader unit="hour" labelFormat="h A" />
              )}
            </TimelineHeaders>

            <TodayMarker />
            <CustomMarker date={dayjs().valueOf()}>
              {({ styles }) => (
                <div
                  style={{
                    ...styles,
                    backgroundColor: "green",
                    width: "2px",
                  }}
                />
              )}
            </CustomMarker>
          </Timeline>
        )}
      </div>
    </div>
  );
};

export default ReservationTimelineDemo;
