
// import React, { useState, useEffect } from "react";
// import {
//   Clock,
//   Calendar,
//   CheckCircle,
//   XCircle,
//   Search,
//   Filter,
//   Download,
//   Users,
//   TrendingUp,
//   AlertTriangle,
//   UserCheck,
//   X,
//   User,
// } from "lucide-react";
// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";
// import Input from "../components/ui/Input";
// import Badge from "../components/ui/Badge";
// import MarkAttendanceModal from "../components/attendence/MarkAttendanceModal";
// import attendanceApi from "../lib/attendanceApi";
// import { useAuth } from "../contexts/AuthContext";

// interface AttendanceRecord {
//   id: number;
//   user_id: number;
//   date: string;
//   punch_in_time: string;
//   punch_out_time: string | null;
//   total_hours: number | null;
//   status: string;
//   punch_in_location: string;
//   punch_out_location: string | null;
//   punch_in_selfie: string;
//   punch_out_selfie: string | null;
//   work_type: string;
//   project_id: number | null;
//   project_location: string | null;
//   user_name?: string;
//   employee_code?: string;
//   trackingHistory?: any;
// }

// interface AttendanceStats {
//   present: number;
//   absent: number;
//   late: number;
//   half_day: number;
//   leave: number;
//   total: number;
//   average_hours: number;
// }

// export default function Attendance() {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<string>("");
//   const [showMarkModal, setShowMarkModal] = useState(false);
//   const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
//   const [selectedAttendance, setSelectedAttendance] = useState<any>();
//   const [expandRow, setExpandRow] = useState<number | null>(null);
//   const [mapLoading, setMapLoading] = useState<boolean>(false);
//   const [showViewSelfieModal, setShowViewSelfieModal] =
//     useState<boolean>(false);
//   const [showViewLocationModal, setShowViewLocationModal] =
//     useState<boolean>(false);
//   const [selectedAttendanceImage, setSelectedAttendanceImage] =
//     useState<string>("");
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState<AttendanceStats>({
//     present: 0,
//     absent: 0,
//     late: 0,
//     half_day: 0,
//     leave: 0,
//     total: 0,
//     average_hours: 0,
//   });

//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//   const { user } = useAuth();

//   useEffect(() => {
//     loadAttendance();
//     loadStatistics();
//   }, []);

//   const getDateKey = (dateStr: string) =>
//     new Date(dateStr).toISOString().split("T")[0];

//   const formatAttendance = (data: any[]) => {
//     const grouped: Record<string, any[]> = {};

//     // 1️⃣ Group by date
//     data.forEach((record) => {
//       const dateKey = getDateKey(record.date);

//       if (!grouped[dateKey]) {
//         grouped[dateKey] = [];
//       }
//       grouped[dateKey].push(record);
//     });

//     // 2️⃣ Build final structure
//     return Object.values(grouped).map((records) => {
//       // sort by punch in time
//       const sortedByIn = [...records].sort(
//         (a, b) =>
//           new Date(a.punch_in_time).getTime() -
//           new Date(b.punch_in_time).getTime(),
//       );

//       const firstCheckIn = sortedByIn[0];

//       // find last punch out
//       const lastCheckOut = [...records]
//         .filter((r) => r.punch_out_time)
//         .sort(
//           (a, b) =>
//             new Date(b.punch_out_time).getTime() -
//             new Date(a.punch_out_time).getTime(),
//         )[0];
//       console.log("last check out : ", lastCheckOut);

//       return {
//         ...firstCheckIn, // 👈 first check-in FULL OBJECT
//         last_punch_out_time: lastCheckOut?.punch_out_time ?? null,
//         trackingHistory: records, // 👈 ALL DATA
//       };
//     });
//   };

//   useEffect(() => {
//     console.log("ats data", attendanceData);
//   }, [attendanceData]);

//   const loadAttendance = async () => {
//     setLoading(true);
//     try {
//       const response: any = await attendanceApi.getCurrentMonthAttendance(
//         user.id,
//       );
//       console.log("from load attendence", response);
//       const finalData = formatAttendance(response.data.data);
//       console.log(finalData);
//       if (response.data.success) {
//         setAttendanceData(Array.isArray(finalData) ? finalData : []);
//       }
//     } catch (error) {
//       console.error("Error loading attendance:", error);
//       setAttendanceData([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadStatistics = async () => {
//     try {
//       const today = new Date().toISOString().split("T")[0];
//       const response: any = await attendanceApi.getStatistics({
//         start_date: today,
//         end_date: today,
//       });

//       if (response.success && response.data) {
//         setStats({
//           present: response.data.present_today || 0,
//           absent: response.data.absent_today || 0,
//           late: response.data.late_today || 0,
//           half_day: response.data.half_day_today || 0,
//           leave: response.data.leave_today || 0,
//           total: response.data.total_employees || 0,
//           average_hours: response.data.avg_working_hours || 0,
//         });
//       }
//     } catch (error) {
//       console.error("Error loading statistics:", error);
//     }
//   };

//   const filteredData = attendanceData.filter((record) => {
//     const name = record.user_name?.toLowerCase() || "";
//     const code = record.employee_code?.toLowerCase() || "";
//     const searchLower = searchTerm.toLowerCase();

//     const matchesSearch =
//       name.includes(searchLower) || code.includes(searchLower);
//     const matchesStatus = !statusFilter || record.status === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

//   const formatTime = (timeString: string | null) => {
//     if (!timeString) return "-";
//     const date = new Date(timeString);
//     return date.toLocaleTimeString("en-US", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case "present":
//         return "success";
//       case "absent":
//         return "error";
//       case "late":
//         return "warning";
//       case "half_day":
//         return "warning";
//       case "leave":
//         return "info";
//       default:
//         return "default";
//     }
//   };

//   const exportToCSV = () => {
//     const headers = [
//       "Name",
//       "Employee Code",
//       "Check In",
//       "Check Out",
//       "Work Location",
//       "Project",
//       "Status",
//       "Work Hours",
//     ];
//     const csvContent = [
//       headers.join(","),
//       ...filteredData.map((record) =>
//         [
//           record.user_name || "-",
//           record.employee_code || "-",
//           formatTime(record.punch_in_time),
//           formatTime(record.punch_out_time),
//           record.work_type,
//           record.project_location || "-",
//           record.status,
//           record.total_hours ? `${record.total_hours}h` : "In Progress",
//         ].join(","),
//       ),
//     ].join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `attendance_${new Date().toISOString().split("T")[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="space-y-6  h-screen">
//       <div className="flex items-center justify-between">
        
//         <Button
//           onClick={() => setShowMarkModal(true)}
//           className="cursor-pointer"
//         >
//           <Clock className="h-4 w-4 mr-2" />
//           Mark Attendance
//         </Button>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Present Today</p>
//               <p className="text-3xl font-bold text-green-600 mt-2">
//                 {stats.present}
//               </p>
//               <p className="text-xs text-slate-500 mt-1">
//                 {stats.total > 0
//                   ? Math.round((stats.present / stats.total) * 100)
//                   : 0}
//                 % present
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <UserCheck className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Absent Today</p>
//               <p className="text-3xl font-bold text-red-600 mt-2">
//                 {stats.absent}
//               </p>
//               <p className="text-xs text-slate-500 mt-1">
//                 {stats.total > 0
//                   ? Math.round((stats.absent / stats.total) * 100)
//                   : 0}
//                 % absent
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//               <XCircle className="h-6 w-6 text-red-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Late Arrivals</p>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">
//                 {stats.late}
//               </p>
//               <p className="text-xs text-slate-500 mt-1">
//                 {stats.total > 0
//                   ? Math.round((stats.late / stats.total) * 100)
//                   : 0}
//                 % late
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <AlertTriangle className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Avg. Hours</p>
//               <p className="text-3xl font-bold text-blue-600 mt-2">
//                 {stats.average_hours.toFixed(1)}h
//               </p>
//               <p className="text-xs text-slate-500 mt-1">per employee</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <TrendingUp className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </Card>
//       </div>

//       <Card>
//         <div className="p-6 border-b border-slate-200">
//           <h2 className="text-xl font-semibold text-slate-900 mb-4">
//             Today's Attendance
//           </h2>
//           <div className="flex items-center justify-between gap-4 flex-wrap">
//             <div className="flex-1 min-w-80 max-w-md">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                 <Input
//                   type="text"
//                   placeholder="Search by name or employee code..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <div className="relative">
//                 <Button
//                   variant="secondary"
//                   onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//                 >
//                   <Filter className="h-4 w-4 mr-2" />
//                   {statusFilter ? `Status: ${statusFilter}` : "Filter"}
//                 </Button>
//                 {showFilterDropdown && (
//                   <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                     <button
//                       onClick={() => {
//                         setStatusFilter("");
//                         setShowFilterDropdown(false);
//                       }}
//                       className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
//                     >
//                       All Status
//                     </button>
//                     {["present", "absent", "late", "half_day", "leave"].map(
//                       (status) => (
//                         <button
//                           key={status}
//                           onClick={() => {
//                             setStatusFilter(status);
//                             setShowFilterDropdown(false);
//                           }}
//                           className={`w-full text-left px-4 py-2 text-sm ${
//                             statusFilter === status
//                               ? "bg-blue-50 text-blue-700"
//                               : "hover:bg-slate-50 text-slate-700"
//                           }`}
//                         >
//                           {status.charAt(0).toUpperCase() +
//                             status.slice(1).replace("_", " ")}
//                         </button>
//                       ),
//                     )}
//                   </div>
//                 )}
//               </div>
//               <Button variant="secondary" onClick={exportToCSV}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Export CSV
//               </Button>
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-slate-50 border-b border-slate-200">
//               <tr>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Employee
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Date
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Check In
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Check Out
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Attendance Location
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
//                   Status
//                 </th>
//                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">
//                   Work Hours
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-200">
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="px-6 py-8 text-center text-slate-600"
//                   >
//                     <div className="flex items-center justify-center">
//                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
//                       <span className="ml-3">
//                         Loading attendance records...
//                       </span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : filteredData.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={7}
//                     className="px-6 py-8 text-center text-slate-600"
//                   >
//                     No attendance records found for today
//                   </td>
//                 </tr>
//               ) : (
//                 filteredData.map((record: any) => (
//                   <React.Fragment key={record.id}>
//                     <tr
//                       className="hover:bg-slate-50 transition-colors"
//                       onClick={() => {
//                         setExpandRow(
//                           expandRow === record.id ? null : record.id,
//                         );
//                       }}
//                     >
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-medium text-slate-900 text-sm">
//                             {record.user_name || "Unknown"}
//                           </p>
//                           <p className="text-slate-600 text-xs">
//                             {record.employee_code || "-"}
//                           </p>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="font-medium text-slate-900 text-xs">
//                             {new Date(record.date).toLocaleDateString() ||
//                               "Unknown"}
//                           </p>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4">
//                         {record.punch_in_time ? (
//                           <div className="flex">
//                             <div className="mr-3">
//                               <button
//                                 onClick={() => {
//                                   setShowViewSelfieModal(true);
//                                   setSelectedAttendanceImage(
//                                     `${import.meta.env.VITE_API_URL}/uploads/${
//                                       record.punch_in_selfie
//                                     }`,
//                                   );
//                                   setSelectedAttendance({
//                                     ...record,
//                                     type: "in",
//                                   });
//                                 }}
//                                 className="text-blue-600 hover:text-blue-700 text-xs w-fit h-fit"
//                               >
//                                 <img
//                                   src={`${import.meta.env.VITE_API_URL}/uploads/${
//                                     record.punch_in_selfie
//                                   }`}
//                                   alt="view selfie"
//                                   className="w-12 h-12 rounded-full"
//                                 />
//                               </button>
//                             </div>
//                             <div>
//                               <p className="text-xs leading-2 text-slate-900 mb-1">
//                                 {formatTime(record.punch_in_time)}
//                               </p>
//                               <button
//                                 onClick={() => {
//                                   setShowViewLocationModal(true);
//                                   setMapLoading(true);
//                                   setSelectedAttendance({
//                                     ...record,
//                                     type: "in",
//                                   });
//                                 }}
//                                 className="text-blue-600 hover:text-blue-700 text-xs w-fit h-fit"
//                               >
//                                 View Location
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <p className="text-sm text-slate-600">-</p>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         {record.punch_out_time ? (
//                           <div className="flex">
//                             <div className="mr-3">
//                               <button
//                                 onClick={() => {
//                                   setShowViewSelfieModal(true);
//                                   setSelectedAttendanceImage(
//                                     `${import.meta.env.VITE_API_URL}/uploads/${
//                                       record.punch_out_selfie
//                                     }`,
//                                   );
//                                   setSelectedAttendance({
//                                     ...record,
//                                     type: "out",
//                                   });
//                                 }}
//                                 className="text-blue-600 hover:text-blue-700 text-xs"
//                               >
//                                 <img
//                                   src={`${import.meta.env.VITE_API_URL}/uploads/${
//                                     record.punch_out_selfie
//                                   }`}
//                                   alt="view selfie"
//                                   className="w-12 h-12 rounded-full"
//                                 />
//                               </button>
//                             </div>
//                             <div>
//                               <p className="text-sm text-slate-900 mb-1">
//                                 {formatTime(record.last_punch_out_time)}
//                               </p>
//                               <button
//                                 onClick={() => {
//                                   setShowViewLocationModal(true);
//                                   setMapLoading(true);
//                                   setSelectedAttendance({
//                                     ...record,
//                                     type: "out",
//                                   });
//                                 }}
//                                 className="text-blue-600 hover:text-blue-700 text-xs"
//                               >
//                                 View Location
//                               </button>
//                             </div>
//                           </div>
//                         ) : (
//                           <p className="text-sm text-slate-600">-</p>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div>
//                           <p className="text-sm text-slate-900">
//                             <span className="font-semibold">Punch In :</span>{" "}
//                             {record.punch_in_address || "-"}
//                           </p>
//                           <p className="text-sm text-slate-900">
//                             <span className="font-semibold">Punch Out :</span>{" "}
//                             {record.punch_out_address || "-"}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <Badge variant={getStatusBadgeVariant(record.status)}>
//                           {record.status.replace("_", " ").toUpperCase()}
//                         </Badge>
//                       </td>
//                       <td className="px-6 py-4 text-right">
//                         <span className="text-xs font-medium text-slate-900">
//                           {record.punch_out_time
//                             ? `${Number(record.total_hours)?.toFixed(1) || "0.0"}h`
//                             : "In Progress"}
//                         </span>
//                       </td>
//                     </tr>

//                     {/* Expanded details row for tracking history */}
//                     {record.trackingHistory &&
//                       record.trackingHistory.length > 0 &&
//                       expandRow === record.id && (
//                         <tr className="hover:bg-slate-50 transition-colors">
//                           <td colSpan={7} className="p-0">
//                             <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
//                               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                                 <User className="w-4 h-4" />
//                                 Tracking History for {record?.user_name} (
//                                 {record?.employee_code})
//                               </h4>
//                               <div className="overflow-x-auto">
//                                 <table className="w-full">
//                                   <thead className="bg-white border-b border-slate-200">
//                                     <tr>
//                                       <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
//                                         Date
//                                       </th>
//                                       <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
//                                         Check In
//                                       </th>
//                                       <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
//                                         Check Out
//                                       </th>
//                                       <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
//                                         Location
//                                       </th>
//                                       <th className="text-left px-4 py-2 text-xs font-medium text-slate-700">
//                                         Status
//                                       </th>
//                                       <th className="text-right px-4 py-2 text-xs font-medium text-slate-700">
//                                         Hours
//                                       </th>
//                                     </tr>
//                                   </thead>
//                                   <tbody className="divide-y divide-slate-100">
//                                     {record.trackingHistory.map(
//                                       (recordHistory: any) => (
//                                         <tr
//                                           key={recordHistory.id}
//                                           className="hover:bg-slate-50"
//                                         >
//                                           <td className="px-4 py-3">
//                                             <p className="text-xs text-slate-900">
//                                               {new Date(
//                                                 recordHistory.date,
//                                               ).toLocaleDateString()}
//                                             </p>
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             {recordHistory.punch_in_time ? (
//                                               <div className="flex items-start">
//                                                 {recordHistory.punch_in_selfie && (
//                                                   <button
//                                                     onClick={() => {
//                                                       setShowViewSelfieModal(
//                                                         true,
//                                                       );
//                                                       setSelectedAttendanceImage(
//                                                         `${import.meta.env.VITE_API_URL}/uploads/${
//                                                           recordHistory.punch_in_selfie
//                                                         }`,
//                                                       );
//                                                       setSelectedAttendance({
//                                                         ...recordHistory,
//                                                         type: "in",
//                                                       });
//                                                     }}
//                                                     className="mr-2"
//                                                   >
//                                                     <img
//                                                       src={`${import.meta.env.VITE_API_URL}/uploads/${
//                                                         recordHistory.punch_in_selfie
//                                                       }`}
//                                                       alt="in selfie"
//                                                       className="w-10 h-10 rounded-full"
//                                                     />
//                                                   </button>
//                                                 )}
//                                                 <div>
//                                                   <p className="text-xs text-slate-900">
//                                                     {formatTime(
//                                                       recordHistory.punch_in_time,
//                                                     )}
//                                                   </p>
//                                                   <button
//                                                     onClick={() => {
//                                                       setShowViewLocationModal(
//                                                         true,
//                                                       );
//                                                       setMapLoading(true);
//                                                       setSelectedAttendance({
//                                                         ...recordHistory,
//                                                         type: "in",
//                                                       });
//                                                     }}
//                                                     className="text-xs text-blue-600 hover:text-blue-700"
//                                                   >
//                                                     View Location
//                                                   </button>
//                                                 </div>
//                                               </div>
//                                             ) : (
//                                               <p className="text-xs text-slate-400">
//                                                 -
//                                               </p>
//                                             )}
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             {recordHistory.punch_out_time ? (
//                                               <div className="flex items-start">
//                                                 {recordHistory.punch_out_selfie && (
//                                                   <button
//                                                     onClick={() => {
//                                                       setShowViewSelfieModal(
//                                                         true,
//                                                       );
//                                                       setSelectedAttendanceImage(
//                                                         `${import.meta.env.VITE_API_URL}/uploads/${
//                                                           recordHistory.punch_out_selfie
//                                                         }`,
//                                                       );
//                                                       setSelectedAttendance({
//                                                         ...recordHistory,
//                                                         type: "out",
//                                                       });
//                                                     }}
//                                                     className="mr-2"
//                                                   >
//                                                     <img
//                                                       src={`${import.meta.env.VITE_API_URL}/uploads/${
//                                                         recordHistory.punch_out_selfie
//                                                       }`}
//                                                       alt="out selfie"
//                                                       className="w-10 h-10 rounded-full"
//                                                     />
//                                                   </button>
//                                                 )}
//                                                 <div>
//                                                   <p className="text-xs text-slate-900">
//                                                     {formatTime(
//                                                       recordHistory.punch_out_time,
//                                                     )}
//                                                   </p>
//                                                   <button
//                                                     onClick={() => {
//                                                       setShowViewLocationModal(
//                                                         true,
//                                                       );
//                                                       setMapLoading(true);
//                                                       setSelectedAttendance({
//                                                         ...recordHistory,
//                                                         type: "out",
//                                                       });
//                                                     }}
//                                                     className="text-xs text-blue-600 hover:text-blue-700"
//                                                   >
//                                                     View Location
//                                                   </button>
//                                                 </div>
//                                               </div>
//                                             ) : (
//                                               <p className="text-xs text-slate-400">
//                                                 -
//                                               </p>
//                                             )}
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             <div>
//                                               <p className="text-sm text-slate-900">
//                                                 <span className="font-semibold">
//                                                   Punch In :
//                                                 </span>{" "}
//                                                 {recordHistory.punch_in_address ||
//                                                   "-"}
//                                               </p>
//                                               <p className="text-sm text-slate-900">
//                                                 <span className="font-semibold">
//                                                   Punch Out :
//                                                 </span>{" "}
//                                                 {recordHistory.punch_out_address ||
//                                                   "-"}
//                                               </p>
//                                             </div>
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             <Badge
//                                               variant={getStatusBadgeVariant(
//                                                 recordHistory.status,
//                                               )}
//                                               className="text-xs"
//                                             >
//                                               {recordHistory.status
//                                                 .replace("_", " ")
//                                                 .toUpperCase()}
//                                             </Badge>
//                                           </td>
//                                           <td className="px-4 py-3 text-right">
//                                             <span className="text-xs font-medium text-slate-900">
//                                               {recordHistory.punch_out_time
//                                                 ? `${Number(recordHistory.total_hours)?.toFixed(1) || "0.0"}h`
//                                                 : "In Progress"}
//                                             </span>
//                                           </td>
//                                         </tr>
//                                       ),
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                   </React.Fragment>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </Card>

//       {showViewSelfieModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-2xl h-[40rem] overflow-hidden">
//             <div className=" bg-[#C62828] px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">
//                 {selectedAttendance?.type === "out" ? "Check Out" : "Check In"}{" "}
//                 Attendance Selfie
//               </h2>
//               <button
//                 onClick={() => setShowViewSelfieModal(false)}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <div className=" overflow-y-auto h-[40rem]">
//               {selectedAttendanceImage ? (
//                 <div className="flex items-center justify-center h-64">
//                   <img
//                     src={selectedAttendanceImage}
//                     alt="Attendance Image Not Available."
//                     className=""
//                   />
//                 </div>
//               ) : (
//                 <div>
//                   <div className="text-center">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                     <p className="text-gray-600">
//                       Attendance Image Not Available
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {showViewLocationModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[32rem] overflow-hidden flex flex-col">
//             {/* Header */}
//             <div className="bg-[#C62828] px-6 py-4 flex justify-between items-center">
//               <h2 className="text-xl font-semibold text-white">
//                 {selectedAttendance?.type === "out" ? "Check Out" : "Check In"}{" "}
//                 Attendance Location
//               </h2>
//               <button
//                 onClick={() => setShowViewLocationModal(false)}
//                 className="text-white hover:bg-white/20 rounded-lg p-2 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Body */}
//             <div className="flex-1 bg-gray-100">
//               {(selectedAttendance?.punch_in_latitude &&
//                 selectedAttendance?.punch_in_longitude) ||
//               (selectedAttendance?.punch_out_latitude &&
//                 selectedAttendance?.punch_out_longitude) ? (
//                 <div className="w-full h-full border-0">
//                   {mapLoading && (
//                     <div className="w-full h-full flex justify-center items-center">
//                       <p className="text-gray-600">Loading Map...</p>
//                     </div>
//                   )}
//                   <iframe
//                     className="w-full h-full border-0"
//                     loading="lazy"
//                     onLoad={() => setMapLoading(false)}
//                     referrerPolicy="no-referrer-when-downgrade"
//                     src={`https://www.google.com/maps?q=${selectedAttendance.punch_in_latitude},${selectedAttendance.punch_in_longitude}&z=16&output=embed`}
//                   />
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-full text-gray-500">
//                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
//                   <p className="text-sm">Location not available</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Modal - Yeh pehle ki tarah hi rahega */}
//       <MarkAttendanceModal
//         isOpen={showMarkModal}
//         onClose={() => setShowMarkModal(false)}
//         onSuccess={() => {
//           loadAttendance();
//           loadStatistics();
//           setShowMarkModal(false);
//         }}
//         userId={user.id}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  AlertTriangle,
  UserCheck,
  X,
  User,
  MoreVertical,
  Eye,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import MarkAttendanceModal from "../components/attendence/MarkAttendanceModal";
import attendanceApi from "../lib/attendanceApi";
import { useAuth } from "../contexts/AuthContext";

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
  half_day: number;
  leave: number;
  total: number;
  average_hours: number;
}

export default function Attendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [selectedAttendance, setSelectedAttendance] = useState<any>();
  const [expandRow, setExpandRow] = useState<number | null>(null);
  const [mapLoading, setMapLoading] = useState<boolean>(false);
  const [showViewSelfieModal, setShowViewSelfieModal] =
    useState<boolean>(false);
  const [showViewLocationModal, setShowViewLocationModal] =
    useState<boolean>(false);
  const [selectedAttendanceImage, setSelectedAttendanceImage] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats>({
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    leave: 0,
    total: 0,
    average_hours: 0,
  });

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    loadAttendance();
    loadStatistics();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.menu-container')) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

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
        ...firstCheckIn, // 👈 first check-in FULL OBJECT
        last_punch_out_time: lastCheckOut?.punch_out_time ?? null,
        trackingHistory: records, // 👈 ALL DATA
      };
    });
  };

  const loadAttendance = async () => {
    setLoading(true);
    try {
      const response: any = await attendanceApi.getCurrentMonthAttendance(
        user.id,
      );
      const finalData = formatAttendance(response.data.data);
      if (response.data.success) {
        setAttendanceData(Array.isArray(finalData) ? finalData : []);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response: any = await attendanceApi.getStatistics({
        start_date: today,
        end_date: today,
      });

      if (response.success && response.data) {
        setStats({
          present: response.data.present_today || 0,
          absent: response.data.absent_today || 0,
          late: response.data.late_today || 0,
          half_day: response.data.half_day_today || 0,
          leave: response.data.leave_today || 0,
          total: response.data.total_employees || 0,
          average_hours: response.data.avg_working_hours || 0,
        });
      }
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredData.map(record => record.id.toString()));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredData.length);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('');
  };

  const resetFilters = () => {
    clearFilters();
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  const filteredData = attendanceData.filter((record) => {
    const name = record.user_name?.toLowerCase() || "";
    const code = record.employee_code?.toLowerCase() || "";
    const searchLower = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(searchLower) || code.includes(searchLower);
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesDate = !dateFilter || record.date === dateFilter;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "-";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
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

  return (
    <div className="space-y-5 ">
      {/* Header with Action Buttons - Sticky */}
      <div className="sticky top-20 z-20 px-2 py-2 -mt-2 -mb-2">
        {/* MOBILE VIEW */}
        <div className="flex lg:hidden items-center justify-between gap-1 flex-nowrap overflow-x-auto">
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded px-2 py-1 whitespace-nowrap shrink-0">
              <div className="bg-blue-100 p-1 rounded">
                <UserCheck className="w-3 h-3 text-blue-600" />
              </div>
              <p className="font-medium text-[10px] text-gray-800">
                {selectedItems.size}
              </p>
              <button
                onClick={() => {
                  if (window.confirm(`Delete ${selectedItems.size} attendance record(s)?`)) {
                    setAttendanceData(attendanceData.filter(record => !selectedItems.has(record.id.toString())));
                    setSelectedItems(new Set());
                    setSelectAll(false);
                  }
                }}
                className="bg-red-600 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Del
              </button>
            </div>
          )}

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="secondary"
              onClick={exportToCSV}
              className="text-[10px] px-2 py-1 h-7"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            <Button
              onClick={() => setShowMarkModal(true)}
              className="text-[10px] px-2 py-1 h-7 bg-gradient-to-r from-[#C62828] to-red-600"
            >
              <Clock className="h-3 w-3 mr-1" />
              Mark
            </Button>
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {selectedItems.size > 0 && (
              <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1 rounded">
                    <UserCheck className="w-3 h-3 text-blue-600" />
                  </div>
                  <p className="font-medium text-xs text-gray-800">
                    {selectedItems.size} selected
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} attendance record(s)?`)) {
                      setAttendanceData(attendanceData.filter(record => !selectedItems.has(record.id.toString())));
                      setSelectedItems(new Set());
                      setSelectAll(false);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className=" sticky top-14 z-10 flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            {/* <Button
              variant="secondary"
              onClick={() => setShowFilterSidebar(true)}
              className="text-sm w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-1.5" />
              Filters
            </Button> */}
            <Button
              variant="secondary"
              onClick={exportToCSV}
              className="text-sm w-full sm:w-auto"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowMarkModal(true)}
              className="text-sm w-full sm:w-auto bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
            >
              <Clock className="h-4 w-4 mr-1.5" />
              Mark Attendance
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Sticky & Compact */}
      <div className="sticky top-32 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Present Today
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.present}
              </p>
              <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5">
                {stats.total > 0
                  ? Math.round((stats.present / stats.total) * 100)
                  : 0}
                % present
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Absent Today
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-red-600 mt-0.5">
                {stats.absent}
              </p>
              <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5">
                {stats.total > 0
                  ? Math.round((stats.absent / stats.total) * 100)
                  : 0}
                % absent
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Late Arrivals
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                {stats.late}
              </p>
              <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5">
                {stats.total > 0
                  ? Math.round((stats.late / stats.total) * 100)
                  : 0}
                % late
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Avg. Hours
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.average_hours.toFixed(1)}h
              </p>
              <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5">
                per employee
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table - Responsive with sticky header */}
      <div className="sticky top-44 z-10 bg-white rounded-xl shadow-sm border border-gray-200 ">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-260px)]">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-16">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check In
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check Out
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Work Hours
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Select Column */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Employee Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Date Filter */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Check In Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Check Out Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Location Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Status Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </td>

                {/* Work Hours Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Actions Column - Filter & Clear Buttons */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Advanced Filters"
                    >
                      <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                      Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Clear All Filters"
                    >
                      <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading attendance records...</p>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                    <UserCheck className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">No Attendance Records Found</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchTerm || statusFilter !== 'all' ? "Try a different search term" : "No attendance records available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredData.map((record: any) => {
                  const isSelected = selectedItems.has(record.id.toString());
                  return (
                    <React.Fragment key={record.id}>
                      <tr className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                        <td className="px-3 md:px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(record.id.toString())}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                          />
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          <div>
                            <p className="text-xs md:text-sm font-medium text-gray-800">{record.user_name || "Unknown"}</p>
                            <p className="text-[10px] md:text-xs text-gray-500">{record.employee_code || "-"}</p>
                          </div>
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          <p className="text-xs md:text-sm text-gray-700">
                            {new Date(record.date).toLocaleDateString() || "Unknown"}
                          </p>
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          {record.punch_in_time ? (
                            <div className="flex">
                              <div className="mr-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowViewSelfieModal(true);
                                    setSelectedAttendanceImage(
                                      `${import.meta.env.VITE_API_URL}/uploads/${record.punch_in_selfie}`,
                                    );
                                    setSelectedAttendance({...record, type: "in"});
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${record.punch_in_selfie}`}
                                    alt="view selfie"
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                                  />
                                </button>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-900 mb-1">
                                  {formatTime(record.punch_in_time)}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowViewLocationModal(true);
                                    setMapLoading(true);
                                    setSelectedAttendance({...record, type: "in"});
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  View Location
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs md:text-sm text-gray-400">-</p>
                          )}
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          {record.punch_out_time ? (
                            <div className="flex">
                              <div className="mr-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowViewSelfieModal(true);
                                    setSelectedAttendanceImage(
                                      `${import.meta.env.VITE_API_URL}/uploads/${record.punch_out_selfie}`,
                                    );
                                    setSelectedAttendance({...record, type: "out"});
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <img
                                    src={`${import.meta.env.VITE_API_URL}/uploads/${record.punch_out_selfie}`}
                                    alt="view selfie"
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-full"
                                  />
                                </button>
                              </div>
                              <div>
                                <p className="text-xs md:text-sm text-gray-900 mb-1">
                                  {formatTime(record.last_punch_out_time)}
                                </p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowViewLocationModal(true);
                                    setMapLoading(true);
                                    setSelectedAttendance({...record, type: "out"});
                                  }}
                                  className="text-xs text-blue-600 hover:text-blue-700"
                                >
                                  View Location
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs md:text-sm text-gray-400">-</p>
                          )}
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          <div>
                            <p className="text-xs md:text-sm text-gray-900">
                              <span className="font-semibold">In:</span> {record.punch_in_address || "-"}
                            </p>
                            <p className="text-xs md:text-sm text-gray-900">
                              <span className="font-semibold">Out:</span> {record.punch_out_address || "-"}
                            </p>
                          </div>
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          <Badge variant={getStatusBadgeVariant(record.status)} className="text-xs">
                            {getStatusLabel(record.status).toUpperCase()}
                          </Badge>
                        </td>
                        
                        <td className="px-3 md:px-4 py-3">
                          <span className="text-xs md:text-sm font-medium text-gray-900">
                            {record.punch_out_time
                              ? `${Number(record.total_hours)?.toFixed(1) || "0.0"}h`
                              : "In Progress"}
                          </span>
                        </td>
                        
                        <td className="px-3 md:px-4 py-3 relative menu-container">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandRow(expandRow === record.id ? null : record.id);
                              }}
                              className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition text-xs text-gray-600"
                            >
                              {expandRow === record.id ? "Hide Details" : "Show Details"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === record.id.toString() ? null : record.id.toString());
                              }}
                              className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                            >
                              <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                            </button>

                            {openMenuId === record.id.toString() && (
                              <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                                <ul className="py-1 text-sm text-gray-700">
                                  <li>
                                    <button
                                      onClick={() => {
                                        setShowViewSelfieModal(true);
                                        setSelectedAttendanceImage(
                                          `${import.meta.env.VITE_API_URL}/uploads/${record.punch_in_selfie}`,
                                        );
                                        setSelectedAttendance({...record, type: "in"});
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Selfie
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => {
                                        setShowViewLocationModal(true);
                                        setMapLoading(true);
                                        setSelectedAttendance({...record, type: "in"});
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View Location
                                    </button>
                                  </li>
                                  <hr className="my-1" />
                                  <li>
                                    <button
                                      onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this attendance record?')) {
                                          setAttendanceData(attendanceData.filter(r => r.id !== record.id));
                                          setOpenMenuId(null);
                                        }
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </li>
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded details row for tracking history */}
                      {record.trackingHistory &&
                        record.trackingHistory.length > 0 &&
                        expandRow === record.id && (
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td colSpan={9} className="p-0">
                              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  Tracking History for {record?.user_name} ({record?.employee_code})
                                </h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead className="bg-white border-b border-gray-200">
                                      <tr>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Date</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Check In</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Check Out</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Location</th>
                                        <th className="text-left px-4 py-2 text-xs font-medium text-gray-700">Status</th>
                                        <th className="text-right px-4 py-2 text-xs font-medium text-gray-700">Hours</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {record.trackingHistory.map((recordHistory: any) => (
                                        <tr key={recordHistory.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3">
                                            <p className="text-xs text-gray-900">
                                              {new Date(recordHistory.date).toLocaleDateString()}
                                            </p>
                                          </td>
                                          <td className="px-4 py-3">
                                            {recordHistory.punch_in_time ? (
                                              <div className="flex items-start">
                                                {recordHistory.punch_in_selfie && (
                                                  <button
                                                    onClick={() => {
                                                      setShowViewSelfieModal(true);
                                                      setSelectedAttendanceImage(
                                                        `${import.meta.env.VITE_API_URL}/uploads/${recordHistory.punch_in_selfie}`,
                                                      );
                                                      setSelectedAttendance({...recordHistory, type: "in"});
                                                    }}
                                                    className="mr-2"
                                                  >
                                                    <img
                                                      src={`${import.meta.env.VITE_API_URL}/uploads/${recordHistory.punch_in_selfie}`}
                                                      alt="in selfie"
                                                      className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                                                    />
                                                  </button>
                                                )}
                                                <div>
                                                  <p className="text-xs text-gray-900">
                                                    {formatTime(recordHistory.punch_in_time)}
                                                  </p>
                                                  <button
                                                    onClick={() => {
                                                      setShowViewLocationModal(true);
                                                      setMapLoading(true);
                                                      setSelectedAttendance({...recordHistory, type: "in"});
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                  >
                                                    View Location
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-400">-</p>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            {recordHistory.punch_out_time ? (
                                              <div className="flex items-start">
                                                {recordHistory.punch_out_selfie && (
                                                  <button
                                                    onClick={() => {
                                                      setShowViewSelfieModal(true);
                                                      setSelectedAttendanceImage(
                                                        `${import.meta.env.VITE_API_URL}/uploads/${recordHistory.punch_out_selfie}`,
                                                      );
                                                      setSelectedAttendance({...recordHistory, type: "out"});
                                                    }}
                                                    className="mr-2"
                                                  >
                                                    <img
                                                      src={`${import.meta.env.VITE_API_URL}/uploads/${recordHistory.punch_out_selfie}`}
                                                      alt="out selfie"
                                                      className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                                                    />
                                                  </button>
                                                )}
                                                <div>
                                                  <p className="text-xs text-gray-900">
                                                    {formatTime(recordHistory.punch_out_time)}
                                                  </p>
                                                  <button
                                                    onClick={() => {
                                                      setShowViewLocationModal(true);
                                                      setMapLoading(true);
                                                      setSelectedAttendance({...recordHistory, type: "out"});
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-700"
                                                  >
                                                    View Location
                                                  </button>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-xs text-gray-400">-</p>
                                            )}
                                          </td>
                                          <td className="px-4 py-3">
                                            <div>
                                              <p className="text-xs text-gray-900">
                                                <span className="font-semibold">In:</span> {recordHistory.punch_in_address || "-"}
                                              </p>
                                              <p className="text-xs text-gray-900">
                                                <span className="font-semibold">Out:</span> {recordHistory.punch_out_address || "-"}
                                              </p>
                                            </div>
                                          </td>
                                          <td className="px-4 py-3">
                                            <Badge variant={getStatusBadgeVariant(recordHistory.status)} className="text-xs">
                                              {getStatusLabel(recordHistory.status).toUpperCase()}
                                            </Badge>
                                          </td>
                                          <td className="px-4 py-3 text-right">
                                            <span className="text-xs font-medium text-gray-900">
                                              {recordHistory.punch_out_time
                                                ? `${Number(recordHistory.total_hours)?.toFixed(1) || "0.0"}h`
                                                : "In Progress"}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
  <div className="fixed inset-0 z-[9999] overflow-hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowFilterSidebar(false)}
          />

          {/* Sidebar */}
          <div
            className={`
fixed top-0 right-0 bottom-0              bg-white shadow-2xl flex flex-col
              transition-transform duration-300 ease-out
              ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}
              w-[90vw] max-w-none
              md:max-w-md md:w-full
            `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-xl font-bold text-white">
                    Filter Attendance
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    Apply filters to find specific records
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-xs md:text-sm hover:bg-white hover:bg-opacity-20 px-2 md:px-3 py-1 md:py-1.5 rounded transition font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-1.5 transition"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                    <option value="half_day">Half Day</option>
                    <option value="leave">Leave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Employee Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or code..."
                      className="w-full pl-10 pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Filter Summary */}
              {(statusFilter !== 'all' || dateFilter !== '' || searchTerm !== '') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    Active Filters
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {statusFilter !== 'all' && (
                      <span className="text-[10px] md:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Status: {getStatusLabel(statusFilter)}
                      </span>
                    )}
                    {dateFilter !== '' && (
                      <span className="text-[10px] md:text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Date: {new Date(dateFilter).toLocaleDateString()}
                      </span>
                    )}
                    {searchTerm !== '' && (
                      <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Search: {searchTerm}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-[#D32F2F] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selfie View Modal */}
      {showViewSelfieModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-2xl h-[40rem] overflow-hidden">
            <div className=" bg-[#C62828] px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {selectedAttendance?.type === "out" ? "Check Out" : "Check In"} Attendance Selfie
              </h2>
              <button
                onClick={() => setShowViewSelfieModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className=" overflow-y-auto h-[40rem]">
              {selectedAttendanceImage ? (
                <div className="flex items-center justify-center h-64">
                  <img
                    src={selectedAttendanceImage}
                    alt="Attendance Image Not Available."
                    className=""
                  />
                </div>
              ) : (
                <div>
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Attendance Image Not Available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location View Modal */}
      {showViewLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[32rem] overflow-hidden flex flex-col">
            <div className="bg-[#C62828] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">
                {selectedAttendance?.type === "out" ? "Check Out" : "Check In"} Attendance Location
              </h2>
              <button
                onClick={() => setShowViewLocationModal(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-gray-100">
              {(selectedAttendance?.punch_in_latitude && selectedAttendance?.punch_in_longitude) ||
              (selectedAttendance?.punch_out_latitude && selectedAttendance?.punch_out_longitude) ? (
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

      {/* Mark Attendance Modal */}
      <MarkAttendanceModal
        isOpen={showMarkModal}
        onClose={() => setShowMarkModal(false)}
        onSuccess={() => {
          loadAttendance();
          loadStatistics();
          setShowMarkModal(false);
        }}
        userId={user.id}
      />
    </div>
  );
}