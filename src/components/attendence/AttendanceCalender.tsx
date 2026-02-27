import { useMemo } from "react";

const AttendanceCalender = ({
  month,
  year,
}: {
  month: number; // 0-based (0 = Jan)
  year: number;
}) => {
  const today = new Date();

  const daysInMonth = useMemo(
    () => new Date(year, month + 1, 0).getDate(),
    [month, year],
  );

  const firstDayIndex = useMemo(
    () => new Date(year, month, 1).getDay(),
    [month, year],
  );

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Calendar Card */}
      <div className="bg-white/70 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-gradient-to-r from-white to-gray-50">
          <h2 className="text-2xl font-semibold tracking-tight text-gray-800">
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
            const isSunday = currentDate.getDay() === 0;

            const isToday =
              day === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <div
                key={day}
                className={`
                  relative h-16 flex items-center justify-center rounded-2xl
                  text-sm font-medium
                  transition-all duration-200 ease-in-out
                  cursor-pointer
                  ${
                    isToday
                      ? "bg-black text-white shadow-md scale-105"
                      : "bg-gray-50 hover:bg-white hover:shadow-md hover:-translate-y-1"
                  }
                  ${isSunday && !isToday ? "text-red-500" : "text-gray-700"}
                `}
              >
                {day}

                {/* Subtle Hover Glow */}
                {!isToday && (
                  <span className="absolute inset-0 rounded-2xl ring-0 hover:ring-2 hover:ring-blue-200 transition"></span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalender;
