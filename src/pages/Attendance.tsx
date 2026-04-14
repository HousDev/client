import React, { useState, useEffect } from "react";
import {
  Clock,
  XCircle,
  Search,
  Filter,
  Download,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  X,
  User,
  Clock1,
  IndianRupee,
  CalendarX,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import MarkAttendanceModal from "../components/attendence/MarkAttendanceModal";
import attendanceApi from "../lib/attendanceApi";
import { useAuth } from "../contexts/AuthContext";
import HrmsEmployeesApi from "../lib/employeeApi";
import AttendanceCalender from "../components/attendence/AttendanceCalender";
import { BiLeftArrow, BiLeftArrowAlt } from "react-icons/bi";
import ViewTodayAttendanceModal from "../components/attendence/ViewTodayAttendanceModal";
import { toast } from "sonner";
import SearchableSelect from "../components/SearchableSelect";
import { LeaveApi } from "../lib/leaveApi";

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

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  paid_leaves: number;
  week_off: number;
  half_day: number;
  leave: number;
  total: number;
  average_hours: number;
}

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("todays");
  const [selectedDateForAttendance, setSelectedDateAttendance] =
    useState<string>("");
  const [employeeDetails, setEmployeeDetails] = useState({
    joining_date: "",
    id: "",
  });

  const [selecteDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 7),
  );

  const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);

  const [selectedUser, setSelectedUser] = useState<any>("");
  const [allEmployees, setAllEmployees] = useState<any>([]);

  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<any>();
  const [expandRow, setExpandRow] = useState<number | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);

  const [showViewLocationModal, setShowViewLocationModal] =
    useState<boolean>(false);

  const [selectedAttendanceImage, setSelectedAttendanceImage] =
    useState<string>("");

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    paid_leaves: 0,
    week_off: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    total: 0,
    average_hours: 0,
  });

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { user, can } = useAuth();

  const getDateKey = (dateStr: string) =>
    new Date(dateStr).toISOString().split("T")[0];

  const formatAttendance = (data: any[]) => {
    const grouped: Record<string, any[]> = {};

    // 1️⃣ Group by date
    data.forEach((record) => {
      const dateKey = getDateKey(record.date);

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });

    // 2️⃣ Build final structure
    return Object.values(grouped).map((records) => {
      // sort by punch in time
      const sortedByIn = [...records].sort(
        (a, b) =>
          new Date(a.punch_in_time).getTime() -
          new Date(b.punch_in_time).getTime(),
      );

      const firstCheckIn = sortedByIn[0];

      // find last punch out
      const lastCheckOut = [...records]
        .filter((r) => r.punch_out_time)
        .sort(
          (a, b) =>
            new Date(b.punch_out_time).getTime() -
            new Date(a.punch_out_time).getTime(),
        )[0];

      return {
        ...firstCheckIn,
        last_punch_out_time: lastCheckOut?.punch_out_time ?? null,
        trackingHistory: records,
      };
    });
  };

  const formatAttendanceForAdmin = (data: any[]) => {
    const grouped: Record<string, any[]> = {};

    // 1️⃣ Group by user_id (changed from date)
    data.forEach((record) => {
      const userKey = record.user_id; // 👈 changed here

      if (!grouped[userKey]) {
        grouped[userKey] = [];
      }
      grouped[userKey].push(record);
    });

    // 2️⃣ Build final structure (UNCHANGED)
    return Object.values(grouped).map((records) => {
      // sort by punch in time
      const sortedByIn = [...records].sort(
        (a, b) =>
          new Date(a.punch_in_time).getTime() -
          new Date(b.punch_in_time).getTime(),
      );

      const firstCheckIn = sortedByIn[0];

      // find last punch out
      const lastCheckOut = [...records]
        .filter((r) => r.punch_out_time)
        .sort(
          (a, b) =>
            new Date(b.punch_out_time).getTime() -
            new Date(a.punch_out_time).getTime(),
        )[0];

      return {
        ...firstCheckIn, // same as before
        last_punch_out_time: lastCheckOut?.punch_out_time ?? null,
        trackingHistory: records, // same as before
      };
    });
  };

  const isUserLate = (punchInISO: string, punch_in_time: string) => {
    const punchIn = new Date(punchInISO);

    // Extract hours, minutes, seconds from DB time
    const [hours, minutes, seconds] = punch_in_time.split(":").map(Number);

    // Create expected punch-in time (same day as punchIn)
    const expectedTime = new Date(punchIn);
    expectedTime.setHours(hours, minutes, seconds || 0, 0);

    return punchIn > expectedTime;
  };

  function getSundayStats(attendanceData: any[]) {
    let month: number;
    let year: number;

    // 👉 If attendance exists → take from data
    if (attendanceData && attendanceData.length > 0) {
      const firstValidRecord = attendanceData.find((r) => r?.date);

      if (firstValidRecord) {
        const dateObj = new Date(firstValidRecord.date);
        month = dateObj.getMonth(); // 0-based
        year = dateObj.getFullYear();
      } else {
        const now = new Date();
        month = now.getMonth();
        year = now.getFullYear();
      }
    } else {
      // 👉 If no attendance → use current month/year
      const now = new Date();
      month = now.getMonth();
      year = now.getFullYear();
    }

    let totalSundays = 0;
    let workedSundays = 0;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // ✅ Count total Sundays
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      if (date.getDay() === 0) {
        totalSundays++;
      }
    }

    // ✅ Count worked Sundays (only if data exists)
    if (attendanceData && attendanceData.length > 0) {
      attendanceData.forEach((record) => {
        if (!record?.date) return;

        const date = new Date(record.date);
        const isSunday = date.getDay() === 0;

        const worked = record.punch_in_time && record.status === "present";

        if (isSunday && worked) {
          workedSundays++;
        }
      });
    }

    return {
      totalSundays,
      workedSundays,
    };
  }

  const loadAttendance = async () => {
    setLoading(true);
    const empRes: any = await HrmsEmployeesApi.getEmployees();
    setAllEmployees(Array.isArray(empRes) ? empRes : []);

    if (user.role === "admin") {
      try {
        const response: any = await attendanceApi.getAllToday();
        console.log("attendance : ", response);
        const getLeavesResponse: any = await LeaveApi.getCurrentMonthLeaves(
          selectedUser.user_id ?? empRes[0].user_id,
          selecteDate || new Date().toISOString().slice(0, 7),
        );

        const finalData = formatAttendanceForAdmin(response.data);
        let totalWorkingHours = 0;
        let presentDays = 0;
        let lateUsers = 0;

        if (response.success) {
          for (let i = 0; i < finalData.length; i++) {
            ++presentDays;
            let totalHours = 0;

            for (let j = 0; j < finalData[i].trackingHistory.length; j++) {
              totalHours += Number(finalData[i].trackingHistory[j].total_hours);
            }
            finalData[i].total_hours = totalHours.toFixed(2);
            totalWorkingHours += Number(totalHours.toFixed(2));
            const emp = empRes.find(
              (e: any) => Number(e.id) === Number(finalData[i].user_id),
            );
            if (isUserLate(finalData[i].punch_in_time, emp.emp_punch_in_time)) {
              lateUsers += 1;
            }
          }
          let sundayStats = {
            totalSundays: 0,
            workedSundays: 0,
          };

          if (Array.isArray(finalData)) sundayStats = getSundayStats(finalData);

          const [year, month] = selecteDate.split("-").map(Number);
          const totalDaysInMonth = new Date(year, month, 0).getDate();

          const today = new Date();
          const isCurrentMonth =
            year === today.getFullYear() && month === today.getMonth() + 1;
          const daysToConsider = isCurrentMonth
            ? today.getDate()
            : totalDaysInMonth;

          const totalHalfDayLeaves = Array.isArray(getLeavesResponse)
            ? getLeavesResponse.reduce(
                (sum, crr) => (Boolean(crr.is_half_day) ? sum + 1 : sum + 0),
                0,
              )
            : 0;

          const totalPaidLeaves = Array.isArray(getLeavesResponse)
            ? getLeavesResponse.reduce(
                (sum, crr) =>
                  crr.leave_type === "Paid Leave" ? sum + 1 : sum + 0,
                0,
              )
            : 0;

          setStats({
            ...stats,
            average_hours: Number(totalWorkingHours) / Number(presentDays),
            present: Number(presentDays),
            absent: Number(daysToConsider) - Number(presentDays),
            late: lateUsers,
            half_day: totalHalfDayLeaves ?? 0,
            paid_leaves: totalPaidLeaves ?? 0,
            week_off:
              Number(sundayStats.totalSundays) -
              Number(sundayStats.workedSundays),
          });

          setEmployeeLeaves(
            Array.isArray(getLeavesResponse) ? getLeavesResponse : [],
          );
          setAttendanceData(Array.isArray(finalData) ? finalData : []);
          const loginEmployee = Array.isArray(empRes) ? empRes[0] : [];
          setEmployeeDetails(loginEmployee ?? { joining_date: "", id: "" });
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const response: any = await attendanceApi.getCurrentMonthAttendance(
          user.id,
          selecteDate || new Date().toISOString().slice(0, 7),
        );

        const getLeavesResponse: any = await LeaveApi.getCurrentMonthLeaves(
          user.id,
          selecteDate || new Date().toISOString().slice(0, 7),
        );

        const finalData = formatAttendance(response.data.data);
        let totalWorkingHours = 0;
        let presentDays = 0;
        let lateUsers = 0;

        for (let i = 0; i < finalData.length; i++) {
          let totalHours = 0;
          ++presentDays;
          for (let j = 0; j < finalData[i].trackingHistory.length; j++) {
            totalHours += Number(finalData[i].trackingHistory[j].total_hours);
          }
          finalData[i].total_hours = totalHours.toFixed(2);
          totalWorkingHours += Number(totalHours.toFixed(2));
          const emp = empRes.find(
            (e: any) => Number(e.id) === Number(finalData[i].user_id),
          );
          if (isUserLate(finalData[i].punch_in_time, emp.emp_punch_in_time)) {
            lateUsers += 1;
          }
        }

        let sundayStats = {
          totalSundays: 0,
          workedSundays: 0,
        };

        if (Array.isArray(finalData)) sundayStats = getSundayStats(finalData);

        const [year, month] = selecteDate.split("-").map(Number);
        const totalDaysInMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        const isCurrentMonth =
          year === today.getFullYear() && month === today.getMonth() + 1;
        const daysToConsider = isCurrentMonth
          ? today.getDate()
          : totalDaysInMonth;

        const totalHalfDayLeaves = Array.isArray(getLeavesResponse)
          ? getLeavesResponse.reduce(
              (sum, crr) => (Boolean(crr.is_half_day) ? sum + 1 : sum + 0),
              0,
            )
          : 0;

        const totalPaidLeaves = Array.isArray(getLeavesResponse)
          ? getLeavesResponse.reduce(
              (sum, crr) =>
                crr.leave_type === "Paid Leave" ? sum + 1 : sum + 0,
              0,
            )
          : 0;

        setStats({
          ...stats,
          average_hours: Number(totalWorkingHours) / Number(presentDays),
          present: Number(presentDays),
          absent: Number(daysToConsider) - Number(presentDays),
          late: lateUsers,
          half_day: totalHalfDayLeaves ?? 0,
          paid_leaves: totalPaidLeaves ?? 0,
          week_off:
            Number(sundayStats.totalSundays) -
            Number(sundayStats.workedSundays),
        });

        if (response.data.success) {
          setEmployeeLeaves(
            Array.isArray(getLeavesResponse) ? getLeavesResponse : [],
          );
          setAttendanceData(Array.isArray(finalData) ? finalData : []);
          const loginEmployee = empRes.find((e: any) => e.user_id === user.id);
          setEmployeeDetails(loginEmployee);
        }
      } catch (error) {
        console.error("Error loading attendance:", error);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selecteDate, selectedUser]);

  useEffect(() => {
    loadAttendance();
  }, []);
  const filteredData = attendanceData.filter((record) => {
    const name = record.user_name?.toLowerCase() || "";
    const code = record.employee_code?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(searchLower) || code.includes(searchLower);
    const matchesStatus = !statusFilter || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatTime = (timeString: string | null) => {
    console.log(timeString);
    if (!timeString) return "-";
    const time = timeString.split("T")[1];
    return time;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "present":
        return "success";
      case "absent":
        return "error";
      case "late":
        return "warning";
      case "half_day":
        return "warning";
      case "leave":
        return "info";
      default:
        return "default";
    }
  };

  const exportToCSV = () => {
    const headers = [
      "Name",
      "Employee Code",
      "Check In",
      "Check Out",
      "Work Location",
      "Project",
      "Status",
      "Work Hours",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredData.map((record) =>
        [
          record.user_name || "-",
          record.employee_code || "-",
          formatTime(record.punch_in_time),
          formatTime(record.punch_out_time),
          record.work_type,
          record.project_location || "-",
          record.status,
          record.total_hours ? `${record.total_hours}h` : "In Progress",
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatDecimalToHourMinute = (decimalHours: number | string): string => {
    const value = Number(decimalHours);

    if (isNaN(value)) return "0:00h";

    const totalMinutes = Math.round(value * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}h`;
  };

  return (
    <div className="space-y-3  h-screen">
      <div className="flex justify-between items-center">
        {selectedDateForAttendance && (
          <button
            onClick={() => {
              setSelectedDateAttendance("");
            }}
            className="flex items-center font-medium"
          >
            <BiLeftArrowAlt className="w-4 h-4" /> Back To Attendance Calender
          </button>
        )}
        {!(user.role === "admin") && (
          <div className="flex items-center justify-end">
            {can("mark_attendance") && (
              <Button
                onClick={() => setShowMarkModal(true)}
                className="cursor-pointer text-xs sm:text-sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                <span className="hidden sm:block">Mark&nbsp;</span>
                <span> Attendance</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {
        <div className="grid grid-cols-2 lg:grid-cols-7 gap-2 sm:gap-3">
          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Present Days
                </p>
                <div className="text-xl sm:text-3xl font-bold text-green-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.present}</span>
                  <div className=" w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className=" h-4  w-4 text-green-600" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.present / stats.total) * 100)
                    : 0}
                  % present
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">Absent Days</p>
                <p className="text-xl sm:text-3xl font-bold text-red-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.absent}</span>
                  <span className="w-8  h-8  bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-4   w-4  text-red-600" />
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.absent / stats.total) * 100)
                    : 0}
                  % absent
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">Half Days</p>
                <p className="text-xl sm:text-3xl font-bold text-yellow-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.half_day}</span>
                  <span className="w-8  h-8  bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock1 className="h-4   w-4  text-yellow-600" />
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.half_day / stats.total) * 100)
                    : 0}
                  % Half Days
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Paid Leaves Days
                </p>
                <p className="text-xl sm:text-3xl font-bold text-violet-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.paid_leaves}</span>
                  <span className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                    <IndianRupee className="h-4   w-4  text-violet-600" />
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.paid_leaves / stats.total) * 100)
                    : 0}
                  % Paid Leaves Days
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Week Off Days
                </p>
                <p className="text-xl sm:text-3xl font-bold text-gray-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.week_off}</span>
                  <span className="w-8  h-8  bg-gray-100 rounded-lg flex items-center justify-center">
                    <CalendarX className="h-4 sm:h-6  w-4 sm:w-6 text-gray-600" />
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.week_off / stats.total) * 100)
                    : 0}
                  % Week Off Days
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Late Arrivals Days
                </p>
                <p className="text-xl sm:text-3xl font-bold text-orange-600 mt-2 flex items-center">
                  <span className="mr-3">{stats.late}</span>
                  <span className="w-8  h-8  bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 sm:h-6  w-4 sm:w-6 text-orange-600" />
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.total > 0
                    ? Math.round((stats.late / stats.total) * 100)
                    : 0}
                  % late
                </p>
              </div>
            </div>
          </Card>

          <Card className="px-6 py-3 sm:p-4 flex  items-center h-fit sm:h-fit sm:block">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-slate-600">Avg. Hours</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-600 mt-2 flex items-center">
                  <span className="mr-3">
                    {formatDecimalToHourMinute(
                      Number(stats.average_hours).toFixed(2),
                    )}
                  </span>
                  <span className="w-8  h-8  bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4   w-4  text-blue-600" />
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-1">per employee</p>
              </div>
            </div>
          </Card>
        </div>
      }

      <div className="sm:px-6 py-3 border-b border-slate-200">
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
          {selectedDateForAttendance ? "Attendance" : "Attendance Calendar"}
        </h2>

        <div className="space-x-3 my-2">
          <button
            onClick={() => setActiveTab("todays")}
            className={`bg-slate-200 px-3 py-1 text-sm rounded-full font-medium ${activeTab === "todays" ? "bg-blue-200 border border-blue-600" : ""}`}
          >
            Today's Attendance
          </button>
          <button
            onClick={() => setActiveTab("employee")}
            className={`bg-slate-200 px-3 py-1 text-sm rounded-full font-medium ${activeTab === "employee" ? "bg-blue-300 border border-blue-600" : ""}`}
          >
            Employee Attendance
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-wrap">
          {activeTab === "employee" && (
            <div className="flex flex-col sm:flex-row">
              <div className="flex ">
                {selectedDateForAttendance && (
                  <div className="relative">
                    <Search className="absolute sm:left-3 top-1/2 sm:-translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search by name or employee code..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                <input
                  type="month"
                  value={selecteDate}
                  min={
                    selectedUser?.joining_date
                      ? selectedUser?.joining_date.slice(0, 7)
                      : employeeDetails?.joining_date.slice(0, 7)
                  }
                  max={new Date().toISOString().slice(0, 7)}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                  }}
                  className=" sm:mx-3 appearance-none bg-white/60 border border-gray-200 rounded-2xl px-5 py-1 sm:py-2  text-gray-800
                font-medium shadow-sm transition-all duration-300 focus:outline-none focus:ring-2  focus:ring-black/80  focus:border-black hover:shadow-md hover:border-gray-300 text-xs sm:text-sm w-1/2 sm:w-fit
                "
                />
              </div>
              {allEmployees && user.role === "admin" && (
                <div className="w-[70vw] sm:w-[20vw] mt-3 sm:mt-0">
                  <SearchableSelect
                    options={allEmployees.map((v: any) => ({
                      id: v.id,
                      name:
                        v.first_name +
                          " " +
                          v.last_name +
                          " ( " +
                          v.employee_code +
                          " ) " || "",
                    }))}
                    value={selectedUser.id || employeeDetails.id}
                    onChange={(id) => {
                      const emp = allEmployees.find(
                        (e: any) => Number(e.id) === Number(id),
                      );
                      setSelectedUser(emp);
                      setSelectedDate(new Date().toISOString().slice(0, 7));
                    }}
                    placeholder="Select Vendor"
                    required
                  />
                </div>
              )}
            </div>
          )}

          {selectedDateForAttendance && (
            <div className="flex gap-2">
              <div className="relative">
                <Button
                  variant="secondary"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter ? `Status: ${statusFilter}` : "Filter"}
                </Button>

                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        setStatusFilter("");
                        setShowFilterDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
                    >
                      All Status
                    </button>
                    {["present", "absent", "late", "half_day", "leave"].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setStatusFilter(status);
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm ${
                            statusFilter === status
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          {status.charAt(0).toUpperCase() +
                            status.slice(1).replace("_", " ")}
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>

              {can("export_attendance") && (
                <Button variant="secondary" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {activeTab === "todays" ? (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Employee
                </th>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Date
                </th>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Check In
                </th>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Check Out
                </th>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Attendance Location
                </th>
                <th className="text-left px-6 py-2 text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="text-right px-6 py-2 text-sm font-semibold text-slate-900">
                  Work Hours
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-600"
                  >
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      <span className="ml-3">
                        Loading attendance records...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-slate-600"
                  >
                    No attendance records found for today
                  </td>
                </tr>
              ) : (
                filteredData.map((record: any) => (
                  <React.Fragment key={record.id}>
                    <tr
                      className="hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setExpandRow(
                          expandRow === record.id ? null : record.id,
                        );
                      }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {record.user_name || "Unknown"}
                          </p>
                          <p className="text-slate-600 text-xs">
                            {record.employee_code || "-"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 text-xs">
                            {new Date(record.date).toLocaleDateString() ||
                              "Unknown"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {record.punch_in_time ? (
                          <div className="flex">
                            <div className="mr-3">
                              <button
                                onClick={() => {
                                  setSelectedAttendanceImage(
                                    `${import.meta.env.VITE_API_URL}/uploads/${
                                      record.punch_in_selfie
                                    }`,
                                  );
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs w-fit h-fit"
                              >
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/uploads/${
                                    record.punch_in_selfie
                                  }`}
                                  alt="view selfie"
                                  className="w-12 h-12 rounded-full"
                                />
                              </button>
                            </div>
                            <div>
                              <p className="text-xs leading-2 text-slate-900 mb-1">
                                {formatTime(record.punch_in_time)}
                              </p>
                              <button
                                onClick={() => {
                                  setShowViewLocationModal(true);
                                  setMapLoading(true);
                                  setSelectedAttendance({
                                    ...record,
                                    type: "in",
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs w-fit h-fit"
                              >
                                View Location
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.punch_out_time ? (
                          <div className="flex">
                            <div className="mr-3">
                              <button
                                // onClick={() => {
                                //   setShowViewSelfieModal(true);
                                //   setSelectedAttendanceImage(
                                //     `${import.meta.env.VITE_API_URL}/uploads/${
                                //       record.punch_out_selfie
                                //     }`,
                                //   );
                                //   setSelectedAttendance({
                                //     ...record,
                                //     type: "out",
                                //   });
                                // }}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                <img
                                  src={`${import.meta.env.VITE_API_URL}/uploads/${
                                    record.punch_out_selfie
                                  }`}
                                  alt="view selfie"
                                  className="w-12 h-12 rounded-full"
                                />
                              </button>
                            </div>
                            <div>
                              <p className="text-sm text-slate-900 mb-1">
                                {formatTime(record.last_punch_out_time)}
                              </p>
                              <button
                                onClick={() => {
                                  setShowViewLocationModal(true);
                                  setMapLoading(true);
                                  setSelectedAttendance({
                                    ...record,
                                    type: "out",
                                  });
                                }}
                                className="text-blue-600 hover:text-blue-700 text-xs"
                              >
                                View Location
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-slate-900">
                            <span className="font-semibold">Punch In :</span>{" "}
                            {record.punch_in_address || "-"}
                          </p>
                          <p className="text-sm text-slate-900">
                            <span className="font-semibold">Punch Out :</span>{" "}
                            {record.punch_out_address || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {record.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs font-medium text-slate-900">
                          {record.punch_out_time
                            ? `${formatDecimalToHourMinute(Number(record.total_hours)?.toFixed(2)) || "0.0h"}`
                            : "In Progress"}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded details row for tracking history */}
                    {record.trackingHistory &&
                      record.trackingHistory.length > 0 &&
                      expandRow === record.id && (
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td colSpan={7} className="p-0">
                            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Tracking History for {record?.user_name} (
                                {record?.employee_code})
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-white border-b border-slate-200">
                                    <tr>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
                                        Date
                                      </th>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
                                        Check In
                                      </th>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
                                        Check Out
                                      </th>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
                                        Location
                                      </th>
                                      <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
                                        Status
                                      </th>
                                      <th className="text-right px-4 py-2 text-xs font-medium text-slate-700">
                                        Hours
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {record.trackingHistory.map(
                                      (recordHistory: any) => (
                                        <tr
                                          key={recordHistory.id}
                                          className="hover:bg-slate-50"
                                        >
                                          <td className="px-4 py-3">
                                            <p className="text-xs text-slate-900">
                                              {new Date(
                                                recordHistory.date,
                                              ).toLocaleDateString()}
                                            </p>
                                          </td>
                                          <td className="px-4 py-3">
                                            {recordHistory.punch_in_time ? (
                                              <div className="flex items-start">
                                                {recordHistory.punch_in_selfie && (
                                                  <button
                                                    // onClick={() => {
                                                    //   setShowViewSelfieModal(
                                                    //     true,
                                                    //   );
                                                    //   setSelectedAttendanceImage(
                                                    //     `${import.meta.env.VITE_API_URL}/uploads/${
                                                    //       recordHistory.punch_in_selfie
                                                    //     }`,
                                                    //   );
                                                    //   setSelectedAttendance({
                                                    //     ...recordHistory,
                                                    //     type: "in",
                                                    //   });
                                                    // }}
                                                    className="mr-2"
                                                  >
                                                    <img
                                                      src={`${import.meta.env.VITE_API_URL}/uploads/${
                                                        recordHistory.punch_in_selfie
                                                      }`}
                                                      alt="in selfie"
                                                      className="w-10 h-10 rounded-full"
                                                    />
                                                  </button>
                                                )}
                                                <div>
                                                  <p className="text-xs text-slate-900">
                                                    {formatTime(
                                                      recordHistory.punch_in_time,
                                                    )}
                                                  </p>
                                                  <button
                                                    onClick={() => {
                                                      setShowViewLocationModal(
                                                        true,
                                                      );
                                                      setMapLoading(true);
                                                      setSelectedAttendance({
                                                        ...recordHistory,
                                                        type: "in",
                                                      });
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                  >
                                                    View Location
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-slate-400">
                                                -
                                              </p>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            {recordHistory.punch_out_time ? (
                                              <div className="flex items-start">
                                                {recordHistory.punch_out_selfie && (
                                                  <button
                                                    // onClick={() => {
                                                    //   setShowViewSelfieModal(
                                                    //     true,
                                                    //   );
                                                    //   setSelectedAttendanceImage(
                                                    //     `${import.meta.env.VITE_API_URL}/uploads/${
                                                    //       recordHistory.punch_out_selfie
                                                    //     }`,
                                                    //   );
                                                    //   setSelectedAttendance({
                                                    //     ...recordHistory,
                                                    //     type: "out",
                                                    //   });
                                                    // }}
                                                    className="mr-2"
                                                  >
                                                    <img
                                                      src={`${import.meta.env.VITE_API_URL}/uploads/${
                                                        recordHistory.punch_out_selfie
                                                      }`}
                                                      alt="out selfie"
                                                      className="w-10 h-10 rounded-full"
                                                    />
                                                  </button>
                                                )}
                                                <div>
                                                  <p className="text-xs text-slate-900">
                                                    {formatTime(
                                                      recordHistory.punch_out_time,
                                                    )}
                                                  </p>
                                                  <button
                                                    onClick={() => {
                                                      setShowViewLocationModal(
                                                        true,
                                                      );
                                                      setMapLoading(true);
                                                      setSelectedAttendance({
                                                        ...recordHistory,
                                                        type: "out",
                                                      });
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                  >
                                                    View Location
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-slate-400">
                                                -
                                              </p>
                                            )}
                                          </td>
                                          <td className="px-4 py-3 w-[30vw]">
                                            <div>
                                              <p className="text-sm text-slate-900">
                                                <span className="font-semibold">
                                                  Punch In :
                                                </span>{" "}
                                                <span className="text-xs">
                                                  {recordHistory.punch_in_location ||
                                                    "-"}
                                                </span>
                                              </p>
                                              <p className="text-sm text-slate-900">
                                                <span className="font-semibold">
                                                  Punch Out :
                                                </span>{" "}
                                                {recordHistory.punch_out_location ||
                                                  "-"}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <Badge
                                              variant={getStatusBadgeVariant(
                                                recordHistory.status,
                                              )}
                                              className="text-xs"
                                            >
                                              {recordHistory.status
                                                .replace("_", " ")
                                                .toUpperCase()}
                                            </Badge>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span className="text-xs font-medium text-slate-900">
                                              {recordHistory.punch_out_time
                                                ? `${formatDecimalToHourMinute(Number(recordHistory.total_hours)?.toFixed(2)) || "0.0h"}`
                                                : "In Progress"}
                                            </span>
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        ) : (
          <div>
            {attendanceData && allEmployees && activeTab === "employee" && (
              <AttendanceCalender
                month={Number(selecteDate.slice(5)) - 1}
                year={Number(selecteDate.slice(0, 4))}
                attendanceData={attendanceData}
                loadAttendance={loadAttendance}
                leavesData={employeeLeaves}
                selectedEmployee={
                  typeof selectedUser === "string"
                    ? allEmployees[0]
                    : selectedUser
                }
              />
            )}
          </div>
        )}
      </div>

      {showViewLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[32rem] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-[#C62828] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {selectedAttendance?.type === "out" ? "Check Out" : "Check In"}{" "}
                Attendance Location
              </h2>
              <button
                onClick={() => setShowViewLocationModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 bg-gray-100">
              {(selectedAttendance?.punch_in_latitude &&
                selectedAttendance?.punch_in_longitude) ||
              (selectedAttendance?.punch_out_latitude &&
                selectedAttendance?.punch_out_longitude) ? (
                <div className="w-full h-full border-0">
                  {mapLoading && (
                    <div className="w-full h-full flex justify-center items-center">
                      <p className="text-gray-600">Loading Map...</p>
                    </div>
                  )}
                  <iframe
                    className="w-full h-full border-0"
                    loading="lazy"
                    onLoad={() => setMapLoading(false)}
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${selectedAttendance.punch_in_latitude},${selectedAttendance.punch_in_longitude}&z=16&output=embed`}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
                  <p className="text-sm">Location not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal - Yeh pehle ki tarah hi rahega */}
      <MarkAttendanceModal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        onSuccess={() => {
          loadAttendance();
          setShowMarkModal(false);
        }}
        userId={user.id}
      />
    </div>
  );
}
