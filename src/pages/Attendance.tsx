// import { useState, useEffect } from 'react';
// import { Clock, Calendar, CheckCircle, XCircle, Search, Filter, Download } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import MarkAttendanceModal from '../components/modals/MarkAttendanceModal';
// import { attendanceAPI } from '../lib/attendanceApi';

// interface AttendanceRecord {
//     id: string;
//     employee_id: string;
//     date: string;
//     punch_in_time: string | null;
//     punch_out_time: string | null;
//     punch_in_latitude: number | null;
//     punch_in_longitude: number | null;
//     punch_out_latitude: number | null;
//     punch_out_longitude: number | null;
//     status: string | null;
//     office_location?: string;
//     project_location?: string;
//     assigned_office_location_id?: string;
//     auto_punchout_triggered?: boolean;
//     employee?: {
//         first_name: string;
//         last_name: string;
//         employee_code: string;
//     };
// }

// export default function Attendance() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [showMarkModal, setShowMarkModal] = useState(false);
//     const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [showFilterDropdown, setShowFilterDropdown] = useState(false);

//     useEffect(() => {
//         loadAttendance();
//     }, []);

//     const loadAttendance = async () => {
//         setLoading(true);
//         try {
//             const today = new Date().toISOString().split('T')[0];
//             const data = await attendanceAPI.getAll({ date: today });
//             setAttendanceData(data || []);
//         } catch (error) {
//             console.error('Error loading attendance:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const filteredData = attendanceData.filter((record) => {
//         const name = record.employee
//             ? `${record.employee.first_name} ${record.employee.last_name}`.toLowerCase()
//             : '';
//         const code = record.employee?.employee_code?.toLowerCase() || '';
//         const searchLower = searchTerm.toLowerCase();

//         const matchesSearch = name.includes(searchLower) || code.includes(searchLower);
//         const matchesStatus = !statusFilter || record.status === statusFilter;

//         return matchesSearch && matchesStatus;
//     });

//     const stats = {
//         present: attendanceData.filter((r) => r.status === 'present').length,
//         absent: attendanceData.filter((r) => r.status === 'absent').length,
//         late: attendanceData.filter((r) => r.status === 'late').length,
//         total: attendanceData.length,
//     };

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
//                     <p className="text-slate-600 mt-1">Track employee attendance and work hours</p>
//                 </div>
//                 <Button onClick={() => setShowMarkModal(true)}>
//                     <Clock className="h-4 w-4 mr-2" />
//                     Mark Attendance
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Present Today</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
//                             <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% present</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <CheckCircle className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Absent Today</p>
//                             <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
//                             <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent</p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <XCircle className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Late Arrivals</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.late}</p>
//                             <p className="text-xs text-slate-500 mt-1">{stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% late</p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Total Employees</p>
//                             <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
//                             <p className="text-xs text-slate-500 mt-1">today's records</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Calendar className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Today's Attendance</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">18.6055756
//                         <div className="flex-1 min-w-80 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search by name or employee code..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <div className="relative">
//                                 <Button variant="secondary" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
//                                     <Filter className="h-4 w-4 mr-2" />
//                                     {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
//                                 </Button>
//                                 {showFilterDropdown && (
//                                     <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                                         <button
//                                             onClick={() => {
//                                                 setStatusFilter('');
//                                                 setShowFilterDropdown(false);
//                                             }}
//                                             className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
//                                         >
//                                             All
//                                         </button>
//                                         {['present', 'absent', 'late', 'half_day'].map((status) => (
//                                             <button
//                                                 key={status}
//                                                 onClick={() => {
//                                                     setStatusFilter(status);
//                                                     setShowFilterDropdown(false);
//                                                 }}
//                                                 className={`w-full text-left px-4 py-2 text-sm ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
//                                                     }`}
//                                             >
//                                                 {status.charAt(0).toUpperCase() + status.slice(1)}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                             <Button variant="secondary">
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Export
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Work Location</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Project</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Work Hours</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
//                                         Loading attendance records...
//                                     </td>
//                                 </tr>
//                             ) : filteredData.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
//                                         No records found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredData.map((record) => {
//                                     const checkinTime = record.punch_in_time
//                                         ? new Date(record.punch_in_time).toLocaleTimeString('en-US', {
//                                             hour: '2-digit',
//                                             minute: '2-digit',
//                                         })
//                                         : '-';
//                                     const checkoutTime = record.punch_out_time
//                                         ? new Date(record.punch_out_time).toLocaleTimeString('en-US', {
//                                             hour: '2-digit',
//                                             minute: '2-digit',
//                                         })
//                                         : '-';

//                                     return (
//                                         <tr key={record.id} className="hover:bg-slate-50 transition-colors">
//                                             <td className="px-6 py-4">
//                                                 <div>
//                                                     <p className="font-medium text-slate-900">
//                                                         {record.employee
//                                                             ? `${record.employee.first_name} ${record.employee.last_name}`
//                                                             : '-'}
//                                                     </p>
//                                                     <p className="text-sm text-slate-600">
//                                                         {record.employee?.employee_code || '-'}
//                                                     </p>
//                                                 </div>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-slate-900">{checkinTime}</span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-slate-900">{checkoutTime}</span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-sm text-slate-900">
//                                                     {record.office_location || '-'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
//                                                     {record.project_location || '-'}
//                                                 </span>
//                                             </td>
//                                             <td className="px-6 py-4">
//                                                 <Badge
//                                                     variant={
//                                                         record.status === 'present'
//                                                             ? 'success'
//                                                             : record.status === 'late'
//                                                                 ? 'warning'
//                                                                 : 'error'
//                                                     }
//                                                 >
//                                                     {record.status || 'unknown'}
//                                                 </Badge>
//                                                 {record.auto_punchout_triggered && (
//                                                     <p className="text-xs text-orange-600 mt-1">Auto punch-out</p>
//                                                 )}
//                                             </td>
//                                             <td className="px-6 py-4 text-right">
//                                                 <span className="text-sm text-slate-900">
//                                                     {!record.punch_out_time ? 'In Progress' : 'Completed'}
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <MarkAttendanceModal
//                 isOpen={showMarkModal}
//                 onClose={() => setShowMarkModal(false)}
//                 onSuccess={() => {
//                     setShowMarkModal(false);
//                 }}
//             />
//         </div>
//     );
// }

// import { useState, useEffect } from 'react';
// import {
//     Clock,
//     Calendar,
//     CheckCircle,
//     XCircle,
//     Search,
//     Filter,
//     Download,
//     Users,
//     TrendingUp,
//     AlertTriangle,
//     UserCheck
// } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import MarkAttendanceModal from '../components/attendence/MarkAttendanceModal';
// import attendanceApi from '../lib/attendanceApi';

// interface AttendanceRecord {
//     id: number;
//     user_id: number;
//     date: string;
//     punch_in_time: string;
//     punch_out_time: string | null;
//     total_hours: number | null;
//     status: string;
//     punch_in_location: string;
//     punch_out_location: string | null;
//     punch_in_selfie: string;
//     punch_out_selfie: string | null;
//     work_type: string;
//     project_id: number | null;
//     project_location: string | null;
//     user_name?: string;
//     employee_code?: string;
// }

// interface AttendanceStats {
//     present: number;
//     absent: number;
//     late: number;
//     half_day: number;
//     leave: number;
//     total: number;
//     average_hours: number;
// }

// export default function Attendance() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [showMarkModal, setShowMarkModal] = useState(false);
//     const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [stats, setStats] = useState<AttendanceStats>({
//         present: 0,
//         absent: 0,
//         late: 0,
//         half_day: 0,
//         leave: 0,
//         total: 0,
//         average_hours: 0
//     });
//     const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//     const [currentUserId, setCurrentUserId] = useState<number>(1); // Get from auth context

//     useEffect(() => {
//         loadAttendance();
//         loadStatistics();
//     }, []);

//     const loadAttendance = async () => {
//         setLoading(true);
//         try {
//             const response: any = await attendanceApi.getAllTodayAttendence();
//             console.log("from load attendence", response)
//             if (response.success) {
//                 setAttendanceData(response.data || []);
//             }
//         } catch (error) {
//             console.error('Error loading attendance:', error);
//             // Fallback to mock data for demo
//             setAttendanceData([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStatistics = async () => {
//         try {
//             const today = new Date().toISOString().split('T')[0];
//             const response = await attendanceApi.getStatistics({
//                 start_date: today,
//                 end_date: today
//             });

//             if (response.success && response.data) {
//                 setStats({
//                     present: response.data.present_today || 0,
//                     absent: response.data.absent_today || 0,
//                     late: response.data.late_today || 0,
//                     half_day: response.data.half_day_today || 0,
//                     leave: response.data.leave_today || 0,
//                     total: response.data.total_employees || 0,
//                     average_hours: response.data.avg_working_hours || 0
//                 });
//             }
//         } catch (error) {
//             console.error('Error loading statistics:', error);
//         }
//     };

//     const filteredData = attendanceData.filter((record) => {
//         const name = record.user_name?.toLowerCase() || '';
//         const code = record.employee_code?.toLowerCase() || '';
//         const searchLower = searchTerm.toLowerCase();

//         const matchesSearch = name.includes(searchLower) || code.includes(searchLower);
//         const matchesStatus = !statusFilter || record.status === statusFilter;

//         return matchesSearch && matchesStatus;
//     });

//     const formatTime = (timeString: string | null) => {
//         if (!timeString) return '-';
//         const date = new Date(timeString);
//         return date.toLocaleTimeString('en-US', {
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//     };

//     const getStatusBadgeVariant = (status: string) => {
//         switch (status) {
//             case 'present': return 'success';
//             case 'absent': return 'error';
//             case 'late': return 'warning';
//             case 'half_day': return 'warning';
//             case 'leave': return 'info';
//             default: return 'default';
//         }
//     };

//     const getWorkTypeColor = (workType: string) => {
//         switch (workType) {
//             case 'office': return 'bg-blue-100 text-blue-800';
//             case 'wfh': return 'bg-green-100 text-green-800';
//             case 'client_site': return 'bg-purple-100 text-purple-800';
//             case 'field_work': return 'bg-orange-100 text-orange-800';
//             default: return 'bg-slate-100 text-slate-800';
//         }
//     };

//     const exportToCSV = () => {
//         const headers = ['Name', 'Employee Code', 'Check In', 'Check Out', 'Work Location', 'Project', 'Status', 'Work Hours'];
//         const csvContent = [
//             headers.join(','),
//             ...filteredData.map(record => [
//                 record.user_name || '-',
//                 record.employee_code || '-',
//                 formatTime(record.punch_in_time),
//                 formatTime(record.punch_out_time),
//                 record.work_type,
//                 record.project_location || '-',
//                 record.status,
//                 record.total_hours ? `${record.total_hours}h` : 'In Progress'
//             ].join(','))
//         ].join('\n');

//         const blob = new Blob([csvContent], { type: 'text/csv' });
//         const url = window.URL.createObjectURL(blob);
//         const a = document.createElement('a');
//         a.href = url;
//         a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
//         a.click();
//         window.URL.revokeObjectURL(url);
//     };

//     return (
//         <div className="space-y-6 overflow-y-scroll h-screen">
//             <div className="flex items-center justify-between">
//                 <div>
//                     <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
//                     <p className="text-slate-600 mt-1">Track employee attendance and work hours</p>
//                 </div>
//                 <Button onClick={() => { console.log("first"); setShowMarkModal(!showMarkModal) }} className='cursor-pointer'>
//                     <Clock className="h-4 w-4 mr-2" />
//                     Mark Attendance
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Present Today</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                                 {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% present
//                             </p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <UserCheck className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Absent Today</p>
//                             <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                                 {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent
//                             </p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <XCircle className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Late Arrivals</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.late}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                                 {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% late
//                             </p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <AlertTriangle className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Avg. Hours</p>
//                             <p className="text-3xl font-bold text-blue-600 mt-2">{stats.average_hours.toFixed(1)}h</p>
//                             <p className="text-xs text-slate-500 mt-1">per employee</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <TrendingUp className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Today's Attendance</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">
//                         <div className="flex-1 min-w-80 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search by name or employee code..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <div className="relative">
//                                 <Button variant="secondary" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
//                                     <Filter className="h-4 w-4 mr-2" />
//                                     {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
//                                 </Button>
//                                 {showFilterDropdown && (
//                                     <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
//                                         <button
//                                             onClick={() => {
//                                                 setStatusFilter('');
//                                                 setShowFilterDropdown(false);
//                                             }}
//                                             className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
//                                         >
//                                             All Status
//                                         </button>
//                                         {['present', 'absent', 'late', 'half_day', 'leave'].map((status) => (
//                                             <button
//                                                 key={status}
//                                                 onClick={() => {
//                                                     setStatusFilter(status);
//                                                     setShowFilterDropdown(false);
//                                                 }}
//                                                 className={`w-full text-left px-4 py-2 text-sm ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
//                                                     }`}
//                                             >
//                                                 {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                             <Button variant="secondary" onClick={exportToCSV}>
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Export CSV
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Work Location</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Project</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Work Hours</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
//                                         <div className="flex items-center justify-center">
//                                             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
//                                             <span className="ml-3">Loading attendance records...</span>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ) : filteredData.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
//                                             No attendance records found for today
//                                     </td>
//                                 </tr>
//                             ) : (
//                                         filteredData.map((record) => (
//                                             <tr key={record.id} className="hover:bg-slate-50 transition-colors">
//                                                 <td className="px-6 py-4">
//                                                     <div>
//                                                         <p className="font-medium text-slate-900">
//                                                             {record.user_name || 'Unknown'}
//                                                         </p>
//                                                         <p className="text-sm text-slate-600">
//                                                             {record.employee_code || '-'}
//                                                         </p>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div>
//                                                         <span className="text-sm text-slate-900">{formatTime(record.punch_in_time)}</span>
//                                                         <p className="text-xs text-slate-500 mt-1">{record.punch_in_location}</p>
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <div>
//                                                         <span className="text-sm text-slate-900">{formatTime(record.punch_out_time)}</span>
//                                                         {record.punch_out_location && (
//                                                             <p className="text-xs text-slate-500 mt-1">{record.punch_out_location}</p>
//                                                         )}
//                                                     </div>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <span className={`text-xs px-2 py-1 rounded ${getWorkTypeColor(record.work_type)}`}>
//                                                         {record.work_type.replace('_', ' ').toUpperCase()}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <span className="text-sm text-slate-900">
//                                                         {record.project_location || '-'}
//                                                     </span>
//                                                 </td>
//                                                 <td className="px-6 py-4">
//                                                     <Badge variant={getStatusBadgeVariant(record.status)}>
//                                                         {record.status.replace('_', ' ').toUpperCase()}
//                                                     </Badge>
//                                                 </td>
//                                                 <td className="px-6 py-4 text-right">
//                                                     <span className="text-sm font-medium text-slate-900">
//                                                         {record.punch_out_time
//                                                             ? `${Number(record.total_hours)?.toFixed(1) || '0.0'}h`
//                                                             : 'In Progress'
//                                                         }
//                                                     </span>
//                                                 </td>
//                                             </tr>
//                                         ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <div className=''>
//                 {showMarkModal && <MarkAttendanceModal
//                     isOpen={showMarkModal}
//                     onClose={() => setShowMarkModal(false)}
//                     onSuccess={() => {
//                         loadAttendance();
//                         loadStatistics();
//                         setShowMarkModal(false);
//                     }}
//                     userId={currentUserId}
//                 />}
//             </div>
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
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
    UserCheck
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import MarkAttendanceModal from '../components/attendence/MarkAttendanceModal';
import attendanceApi from '../lib/attendanceApi';

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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showMarkModal, setShowMarkModal] = useState(false);
    const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<AttendanceStats>({
        present: 0,
        absent: 0,
        late: 0,
        half_day: 0,
        leave: 0,
        total: 0,
        average_hours: 0
    });
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<number>(1);

    useEffect(() => {
        loadAttendance();
        loadStatistics();
    }, []);

    const loadAttendance = async () => {
        setLoading(true);
        try {
            const response: any = await attendanceApi.getAllTodayAttendence();
            console.log("from load attendence", response)
            if (response.success) {
                setAttendanceData(response.data || []);
            }
        } catch (error) {
            console.error('Error loading attendance:', error);
            setAttendanceData([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStatistics = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await attendanceApi.getStatistics({
                start_date: today,
                end_date: today
            });

            if (response.success && response.data) {
                setStats({
                    present: response.data.present_today || 0,
                    absent: response.data.absent_today || 0,
                    late: response.data.late_today || 0,
                    half_day: response.data.half_day_today || 0,
                    leave: response.data.leave_today || 0,
                    total: response.data.total_employees || 0,
                    average_hours: response.data.avg_working_hours || 0
                });
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    };

    const filteredData = attendanceData.filter((record) => {
        const name = record.user_name?.toLowerCase() || '';
        const code = record.employee_code?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch = name.includes(searchLower) || code.includes(searchLower);
        const matchesStatus = !statusFilter || record.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatTime = (timeString: string | null) => {
        if (!timeString) return '-';
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'present': return 'success';
            case 'absent': return 'error';
            case 'late': return 'warning';
            case 'half_day': return 'warning';
            case 'leave': return 'info';
            default: return 'default';
        }
    };

    const getWorkTypeColor = (workType: string) => {
        switch (workType) {
            case 'office': return 'bg-blue-100 text-blue-800';
            case 'wfh': return 'bg-green-100 text-green-800';
            case 'client_site': return 'bg-purple-100 text-purple-800';
            case 'field_work': return 'bg-orange-100 text-orange-800';
            default: return 'bg-slate-100 text-slate-800';
        }
    };

    const exportToCSV = () => {
        const headers = ['Name', 'Employee Code', 'Check In', 'Check Out', 'Work Location', 'Project', 'Status', 'Work Hours'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(record => [
                record.user_name || '-',
                record.employee_code || '-',
                formatTime(record.punch_in_time),
                formatTime(record.punch_out_time),
                record.work_type,
                record.project_location || '-',
                record.status,
                record.total_hours ? `${record.total_hours}h` : 'In Progress'
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 overflow-y-scroll h-screen">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Attendance</h1>
                    <p className="text-slate-600 mt-1">Track employee attendance and work hours</p>
                </div>
                <Button
                    onClick={() => setShowMarkModal(true)}
                    className='cursor-pointer'
                >
                    <Clock className="h-4 w-4 mr-2" />
                    Mark Attendance
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Present Today</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}% present
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Absent Today</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{stats.absent}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}% absent
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Late Arrivals</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.late}</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {stats.total > 0 ? Math.round((stats.late / stats.total) * 100) : 0}% late
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Avg. Hours</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.average_hours.toFixed(1)}h</p>
                            <p className="text-xs text-slate-500 mt-1">per employee</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Today's Attendance</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-80 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or employee code..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {statusFilter ? `Status: ${statusFilter}` : 'Filter'}
                                </Button>
                                {showFilterDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-10">
                                        <button
                                            onClick={() => {
                                                setStatusFilter('');
                                                setShowFilterDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-sm"
                                        >
                                            All Status
                                        </button>
                                        {['present', 'absent', 'late', 'half_day', 'leave'].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => {
                                                    setStatusFilter(status);
                                                    setShowFilterDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm ${statusFilter === status ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <Button variant="secondary" onClick={exportToCSV}>
                                <Download className="h-4 w-4 mr-2" />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Work Location</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Project</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Work Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                                            <span className="ml-3">Loading attendance records...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-600">
                                        No attendance records found for today
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {record.user_name || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {record.employee_code || '-'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="text-sm text-slate-900">{formatTime(record.punch_in_time)}</span>
                                                <p className="text-xs text-slate-500 mt-1">{record.punch_in_location}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <span className="text-sm text-slate-900">{formatTime(record.punch_out_time)}</span>
                                                {record.punch_out_location && (
                                                    <p className="text-xs text-slate-500 mt-1">{record.punch_out_location}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs px-2 py-1 rounded ${getWorkTypeColor(record.work_type)}`}>
                                                {record.work_type.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">
                                                {record.project_location || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusBadgeVariant(record.status)}>
                                                {record.status.replace('_', ' ').toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-medium text-slate-900">
                                                {record.punch_out_time
                                                    ? `${Number(record.total_hours)?.toFixed(1) || '0.0'}h`
                                                    : 'In Progress'
                                                }
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modal - Yeh pehle ki tarah hi rahega */}
            <MarkAttendanceModal
                isOpen={showMarkModal}
                onClose={() => setShowMarkModal(false)}
                onSuccess={() => {
                    loadAttendance();
                    loadStatistics();
                    setShowMarkModal(false);
                }}
                userId={currentUserId}
            />
        </div>
    );
}