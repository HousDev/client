import { useEffect, useMemo, useState } from "react";
import ViewTodayAttendanceModal from "./ViewTodayAttendanceModal";
interface AttendanceRecord {
  id: number;
  user_id: number;
  date: string;
  punch_in_time: string;
  punch_out_time: string | null;
  total_hours: number | null;
  status: string;
  punch_in_location: string;
  punch_out_location: string | null;
  punch_in_selfie: string;
  punch_out_selfie: string | null;
  work_type: string;
  project_id: number | null;
  project_location: string | null;
  user_name?: string;
  employee_code?: string;
  trackingHistory?: any;
}
const AttendanceCalender = ({
  month,
  year,
  attendanceData,
  leavesData,
  loadAttendance,
  selectedEmployee,
}: {
  month: number; // 0-based (0 = Jan)
  year: number;
  attendanceData: any;
  leavesData: any;
  loadAttendance: any;
  selectedEmployee: any;
}) => {
  const [daysInMonth, setDaysInMonth] = useState<number>(0);
  const today = new Date();
  const [dayAttendanceData, setDayAttendanceData] =
    useState<AttendanceRecord>();

  const calculateDays = () => new Date(year, month + 1, 0).getDate();
  useEffect(() => {
    setDaysInMonth(calculateDays());
  }, [month, year]);

  const firstDayIndex = useMemo(
    () => new Date(year, month, 1).getDay(),
    [month, year],
  );

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function isPaidLeave(checkDate: string) {
    if (!leavesData || leavesData.length === 0) return false;

    const targetDate = new Date(checkDate);
    targetDate.setHours(0, 0, 0, 0);

    return leavesData.some((leave: any) => {
      if (leave.status !== "approved") return false;

      const fromDate = new Date(leave.from_date);
      const toDate = new Date(leave.to_date);

      // Normalize dates
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(0, 0, 0, 0);

      return (
        targetDate >= fromDate &&
        targetDate <= toDate &&
        leave.leave_type === "Paid Leave"
      );
    });
  }

  return (
    <div className="w-full max-w-5xl mx-auto mb-6">
      {/* Calendar Card */}
      <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-2 sm:py-4 border-b bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-md sm:text-xl font-semibold tracking-tight text-gray-800">
            {new Date(year, month).toLocaleString("default", {
              month: "long",
            })}{" "}
            {year}
          </h2>
        </div>

        {/* Weekday Header */}
        <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 px-4 pt-4">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 p-4 pb-6">
          {/* Empty Spaces */}
          {Array.from({ length: firstDayIndex }).map((_, index) => (
            <div key={`empty-${index}`} />
          ))}

          {/* Date Boxes */}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const currentDate = new Date(year, month, day);

            const isSunday = selectedEmployee
              ? JSON.parse(selectedEmployee.week_off_days).includes(
                  currentDate.getDay(),
                )
              : false;

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();
            const formattedMonth = String(month + 1).padStart(2, "0");
            const formattedDay = String(day).padStart(2, "0");

            const checkDate = `${year}-${formattedMonth}-${formattedDay}`;

            const isPL = isPaidLeave(checkDate);
            let isLate = false;
            const record = attendanceData.find(
              (d: any) =>
                d.date.slice(8, 10) ===
                (String(day).length === 1 ? "0" + String(day) : String(day)),
            );
            if (record) {
              isLate =
                new Date(record.punch_in_time) >
                new Date(
                  `${record.date}T${selectedEmployee.emp_punch_in_time}`,
                );
            }

            return (
              <div
                key={day}
                onClick={() => {
                  const formattedMonth = String(Number(month) + 1).padStart(
                    2,
                    "0",
                  );
                  const formattedDay = String(day).padStart(2, "0");

                  const date = `${year}-${formattedMonth}-${formattedDay}`;

                  const data = attendanceData.find((a: any) => a.date === date);

                  if (data && Array.isArray(data.trackingHistory)) {
                    const sortedTracking = [...data.trackingHistory].sort(
                      (a: any, b: any) =>
                        new Date(b.punch_in_time).getTime() -
                        new Date(a.punch_in_time).getTime(),
                    );

                    setDayAttendanceData({
                      ...data,
                      trackingHistory: sortedTracking,
                    });
                  } else {
                    setDayAttendanceData(data);
                  }
                }}
                className={` relative h-8 sm:h-16 flex items-center justify-center rounded-2xl
                  text-sm font-medium
                  transition-all duration-200 ease-in-out
                  cursor-pointer
                  
                   
                  
                  ${
                    isSunday
                      ? attendanceData.find(
                          (d: any) =>
                            d.date.slice(8, 10) ===
                            (String(day).length === 1
                              ? "0" + String(day)
                              : String(day)),
                        )
                        ? "text-green-600 bg-green-100"
                        : "text-gray-600 bg-gray-100"
                      : attendanceData.find(
                            (d: any) =>
                              d.date.slice(8, 10) ===
                              (String(day).length === 1
                                ? "0" + String(day)
                                : String(day)),
                          )
                        ? "text-green-600 bg-green-100"
                        : isPL
                          ? "text-violet-600 bg-violet-100"
                          : "text-red-600 bg-red-100"
                  }
                  flex-col leading-[0.6rem] items-center justify-center
                `}
              >
                <p className="text-[0.6rem] sm:text-sm">{day}</p>
                <p className="text-[0.6rem] sm:text-sm">{isLate && "Late"}</p>
                {/* Subtle Hover Glow */}
                {!isToday && (
                  <span className="absolute inset-0 rounded-2xl ring-0 hover:ring-2 hover:ring-blue-200 transition"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {dayAttendanceData && (
        <ViewTodayAttendanceModal
          loadAttendance={loadAttendance}
          dayData={dayAttendanceData}
          setDayData={setDayAttendanceData}
        />
      )}
    </div>
  );
};

export default AttendanceCalender;
