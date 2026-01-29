// import { useState, useEffect } from 'react';
// import { Calendar, Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import ApplyLeaveModal from '../components/modals/ApplyLeaveModal';

// interface LeaveRequest {
//     id: string;
//     employee: { first_name: string; last_name: string } | null;
//     leave_type: { name: string } | null;
//     from_date: string;
//     to_date: string;
//     total_days: number;
//     status: string;
//     reason: string;
// }

// // Mock leave data
// const mockLeaves: LeaveRequest[] = [
//     {
//         id: '1',
//         employee: { first_name: 'John', last_name: 'Doe' },
//         leave_type: { name: 'Casual Leave' },
//         from_date: '2024-01-20',
//         to_date: '2024-01-22',
//         total_days: 3,
//         status: 'pending',
//         reason: 'Family function',
//     },
//     {
//         id: '2',
//         employee: { first_name: 'Jane', last_name: 'Smith' },
//         leave_type: { name: 'Sick Leave' },
//         from_date: '2024-01-18',
//         to_date: '2024-01-19',
//         total_days: 2,
//         status: 'approved',
//         reason: 'Medical appointment',
//     },
//     {
//         id: '3',
//         employee: { first_name: 'Robert', last_name: 'Johnson' },
//         leave_type: { name: 'Annual Leave' },
//         from_date: '2024-01-25',
//         to_date: '2024-01-30',
//         total_days: 6,
//         status: 'pending',
//         reason: 'Vacation',
//     },
//     {
//         id: '4',
//         employee: { first_name: 'Sarah', last_name: 'Williams' },
//         leave_type: { name: 'Maternity Leave' },
//         from_date: '2024-02-01',
//         to_date: '2024-04-01',
//         total_days: 60,
//         status: 'approved',
//         reason: 'Maternity',
//     },
//     {
//         id: '5',
//         employee: { first_name: 'Michael', last_name: 'Brown' },
//         leave_type: { name: 'Casual Leave' },
//         from_date: '2024-01-15',
//         to_date: '2024-01-16',
//         total_days: 2,
//         status: 'rejected',
//         reason: 'Personal work',
//     },
// ];

// export default function Leaves() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
//     const [loading, setLoading] = useState(false);
//     const [showApplyModal, setShowApplyModal] = useState(false);
//     const [stats, setStats] = useState({
//         pending: 2,
//         approved: 2,
//         onLeave: 1,
//         rejected: 1,
//     });

//     useEffect(() => {
//         loadLeaves();
//         loadStats();
//     }, []);

//     const loadLeaves = async () => {
//         setLoading(true);
//         try {
//             // Mock loading with timeout
//             await new Promise(resolve => setTimeout(resolve, 500));
//             setLeaves(mockLeaves);
//         } catch (error) {
//             console.error('Error loading leaves:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStats = () => {
//         const pending = mockLeaves.filter(l => l.status === 'pending').length;
//         const approved = mockLeaves.filter(l => l.status === 'approved').length;
//         const rejected = mockLeaves.filter(l => l.status === 'rejected').length;

//         // Mock logic for "on leave today"
//         const today = new Date().toISOString().split('T')[0];
//         const onLeave = mockLeaves.filter(l =>
//             l.status === 'approved' &&
//             l.from_date <= today &&
//             l.to_date >= today
//         ).length;

//         setStats({
//             pending,
//             approved,
//             onLeave,
//             rejected,
//         });
//     };

//     const handleApprove = async (id: string) => {
//         try {
//             // Mock approval with timeout
//             await new Promise(resolve => setTimeout(resolve, 300));

//             setLeaves(prev => prev.map(leave =>
//                 leave.id === id ? { ...leave, status: 'approved' } : leave
//             ));

//             loadStats();
//             alert('Leave approved successfully');
//         } catch (error) {
//             console.error('Error approving leave:', error);
//         }
//     };

//     const handleReject = async (id: string) => {
//         try {
//             // Mock rejection with timeout
//             await new Promise(resolve => setTimeout(resolve, 300));

//             setLeaves(prev => prev.map(leave =>
//                 leave.id === id ? { ...leave, status: 'rejected' } : leave
//             ));

//             loadStats();
//             alert('Leave rejected');
//         } catch (error) {
//             console.error('Error rejecting leave:', error);
//         }
//     };

//     const handleApplyLeave = (newLeave: any) => {
//         const leaveWithId = {
//             id: Date.now().toString(),
//             employee: { first_name: 'You', last_name: '' },
//             leave_type: { name: newLeave.leave_type || 'Casual Leave' },
//             from_date: newLeave.from_date,
//             to_date: newLeave.to_date,
//             total_days: newLeave.total_days || 1,
//             status: 'pending',
//             reason: newLeave.reason,
//         };

//         setLeaves(prev => [leaveWithId, ...prev]);
//         loadStats();
//     };

//     const filteredLeaves = leaves.filter((request) => {
//         const name = request.employee
//             ? `${request.employee.first_name} ${request.employee.last_name}`.toLowerCase()
//             : '';
//         const searchLower = searchTerm.toLowerCase();
//         const matchesSearch = name.includes(searchLower);
//         const matchesStatus = !statusFilter || request.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <Button onClick={() => setShowApplyModal(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Apply Leave
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Pending Requests</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//                             <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Approved</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
//                             <p className="text-xs text-slate-500 mt-1">Total approved</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <CheckCircle className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">On Leave Today</p>
//                             <p className="text-3xl font-bold text-blue-600 mt-2">{stats.onLeave}</p>
//                             <p className="text-xs text-slate-500 mt-1">Currently away</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Calendar className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Rejected</p>
//                             <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
//                             <p className="text-xs text-slate-500 mt-1">This month</p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <XCircle className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Leave Requests</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">
//                         <div className="flex-1 min-w-64 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search employee..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">All Status</option>
//                             <option value="pending">Pending</option>
//                             <option value="approved">Approved</option>
//                             <option value="rejected">Rejected</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Leave Type</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">From</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">To</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Days</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {filteredLeaves.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
//                                         No leave requests found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredLeaves.map((request) => (
//                                     <tr key={request.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-6 py-4">
//                                             <div>
//                                                 <p className="font-medium text-slate-900">
//                                                     {request.employee?.first_name} {request.employee?.last_name}
//                                                 </p>
//                                                 <p className="text-sm text-slate-600">{request.reason}</p>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{request.leave_type?.name || 'N/A'}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{request.from_date}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{request.to_date}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{request.total_days}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <Badge variant={
//                                                 request.status === 'approved' ? 'success' :
//                                                     request.status === 'rejected' ? 'error' : 'warning'
//                                             }>
//                                                 {request.status}
//                                             </Badge>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 {request.status === 'pending' && (
//                                                     <>
//                                                         <Button variant="secondary" size="sm" onClick={() => handleApprove(request.id)}>
//                                                             <CheckCircle className="h-4 w-4 mr-1" />
//                                                             Approve
//                                                         </Button>
//                                                         <Button variant="secondary" size="sm" onClick={() => handleReject(request.id)}>
//                                                             <XCircle className="h-4 w-4 mr-1" />
//                                                             Reject
//                                                         </Button>
//                                                     </>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <ApplyLeaveModal
//                 isOpen={showApplyModal}
//                 onClose={() => setShowApplyModal(false)}
//                 onSuccess={(newLeave) => {
//                     handleApplyLeave(newLeave);
//                     setShowApplyModal(false);
//                 }}
//             />
//         </div>
//     );
// }






import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, Plus, Search, Filter, CheckCircle, XCircle, Clock, 
  User, ChevronDown, FileText, Download, Eye, Trash2, Mail, Phone, Building 
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ApplyLeaveForm from '../components/modals/ApplyLeaveModal';
import ViewLeaveDetails from '../components/modals/ViewLeaveDetails';
import DatePicker from 'react-datepicker';
import { registerLocale } from "react-datepicker";
import { enGB } from 'date-fns/locale/en-GB';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'sonner';
import { api } from '../lib/Api';
import { useAuth } from '../contexts/AuthContext';
import HrmsEmployeesApi, { HrmsEmployee } from '../lib/employeeApi';
import { LeaveApi } from '../lib/leaveApi'; // Import LeaveApi

registerLocale('en-GB', enGB);

interface LeaveRequest {
  id: number;
  application_number: string;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  approved_by: number | null;
  approved_by_username: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  rejected_by: number | null;
  rejected_by_username: string | null;
  rejected_by_name: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  attachment_path: string | null;
  attachment_name: string | null;
  is_half_day?: boolean; // Add this
  half_day_period?: 'morning' | 'afternoon'; // Add this
}

interface EnhancedLeaveRequest extends LeaveRequest {
  is_half_day?: boolean; // Add this
  employee_name?: string;
  employee_email?: string;
  employee_phone?: string;
  employee_designation?: string;
  employee_department?: string;
}

interface LeaveStats {
  pending: number;
  approved: number;
  onLeave: number;
  rejected: number;
  total: number;
}

export default function Leaves() {
  const { user, profile } = useAuth();
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchLeaveType, setSearchLeaveType] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [searchFromDate, setSearchFromDate] = useState('');
  const [searchToDate, setSearchToDate] = useState('');
  const [searchAppNumber, setSearchAppNumber] = useState('');
  const [leaves, setLeaves] = useState<EnhancedLeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Map<number, HrmsEmployee>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<EnhancedLeaveRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [stats, setStats] = useState<LeaveStats>({
    pending: 0,
    approved: 0,
    onLeave: 0,
    rejected: 0,
    total: 0,
  });

  // Date filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ignoreDate, setIgnoreDate] = useState(false);

  // Load employees
  const loadEmployees = async () => {
    try {
      const employeesData = await HrmsEmployeesApi.getEmployees();
      setEmployees(employeesData);
      
      // Create employee map for quick lookup
      const map = new Map<number, HrmsEmployee>();
      employeesData.forEach(emp => {
        map.set(emp.id, emp);
      });
      setEmployeeMap(map);
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Failed to load employee data');
    }
  };

  // Load leaves data - FIXED: Using LeaveApi.getLeaves()
  const loadLeaves = async () => {
    setLoading(true);
    try {
      const response = await LeaveApi.getLeaves(); // Use LeaveApi instead of direct api.get
      if (response.data) {
        const leavesData: LeaveRequest[] = response.data;
        setAllLeaves(leavesData);
      }
    } catch (error: any) {
      console.error('Error loading leaves:', error);
      toast.error(error.response?.data?.message || 'Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  // Load statistics - FIXED: Using LeaveApi.getLeaveStats()
  const loadStats = async () => {
    try {
      const response = await LeaveApi.getLeaveStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Enhance leaves with employee data
   // Enhance leaves with employee data
  const enhanceLeavesWithEmployeeData = (leavesData: LeaveRequest[]): EnhancedLeaveRequest[] => {
    return leavesData.map(leave => {
      const employee = employeeMap.get(leave.employee_id);
      return {
        ...leave,
        is_half_day: leave.is_half_day || false, // Add this line
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
        employee_email: employee?.email || 'N/A',
        employee_phone: employee?.phone || 'N/A',
        employee_designation: employee?.designation || 'N/A',
        employee_department: employee?.department_name || 'N/A'
      };
    });
  };

  // Initial load
  useEffect(() => {
    loadEmployees();
    loadLeaves();
    loadStats();
  }, []);

  // Enhance leaves when employees are loaded
  useEffect(() => {
    if (employeeMap.size > 0 && allLeaves.length > 0) {
      const enhanced = enhanceLeavesWithEmployeeData(allLeaves);
      setLeaves(enhanced);
    }
  }, [employeeMap, allLeaves]);

// In Leaves.jsx - Update handleApprove function (around line 118)
// In Leaves.tsx - Update handleApprove and handleReject

// Handle approve leave - Send string user_id
const handleApprove = async (id: number) => {
  if (!confirm('Are you sure you want to approve this leave?')) return;

  try {
    // Get user ID as string from your auth context
    const userId = user?.id ? user.id.toString() : '1'; // Convert to string
    const userName = user?.username || user?.name || 'Admin';
    
    // Updated: Pass user data as strings
    const response = await LeaveApi.approveLeave(
      id, 
      userId, // String user ID
      user?.username || 'usr_admin_01',
      user?.name || 'Admin User'
    );
    
    if (response.success) {
      toast.success('Leave approved successfully');
      loadLeaves();
      loadStats();
    }
  } catch (error: any) {
    console.error('Error approving leave:', error);
    toast.error(error.response?.data?.message || 'Failed to approve leave');
  }
};

// Handle reject leave - Send string user_id
const handleReject = async (id: number) => {
  const reason = prompt('Please enter rejection reason:');
  if (!reason || reason.trim() === '') {
    toast.error('Rejection reason is required');
    return;
  }

  try {
    // Get user ID as string
    const userId = user?.id ? user.id.toString() : '1'; // Convert to string
    
    // Updated: Pass user data as strings
    const response = await LeaveApi.rejectLeave(
      id,
      userId, // String user ID
      reason,
      user?.username || 'usr_admin_01',
      user?.name || 'Admin User'
    );
    
    if (response.success) {
      toast.success('Leave rejected');
      loadLeaves();
      loadStats();
    }
  } catch (error: any) {
    console.error('Error rejecting leave:', error);
    toast.error(error.response?.data?.message || 'Failed to reject leave');
  }
};
  // Handle delete leave
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this leave? This action cannot be undone.')) return;

    try {
      const response = await api.delete(`/api/leaves/${id}`);
      
      if (response.data.success) {
        toast.success('Leave deleted successfully');
        loadLeaves();
        loadStats();
      }
    } catch (error: any) {
      console.error('Error deleting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to delete leave');
    }
  };

  // Handle download attachment
  const handleDownload = async (id: number, fileName?: string) => {
    try {
      const blob = await LeaveApi.downloadAttachment(id);
      
      let downloadName = fileName || 'leave_document.pdf';
      
      // Create blob and download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('File downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading file:', error);
      toast.error(error.response?.data?.message || 'Failed to download file');
    }
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    const matchesEmployee = searchEmployee 
      ? leave.employee_name?.toLowerCase().includes(searchEmployee.toLowerCase()) || false
      : true;

    const matchesLeaveType = searchLeaveType
      ? leave.leave_type.toLowerCase().includes(searchLeaveType.toLowerCase())
      : true;

    const matchesStatus = searchStatus
      ? leave.status === searchStatus
      : true;

    const matchesAppNumber = searchAppNumber
      ? leave.application_number.toLowerCase().includes(searchAppNumber.toLowerCase())
      : true;

    const matchesFromDate = searchFromDate
      ? leave.from_date.includes(searchFromDate)
      : true;

    const matchesToDate = searchToDate
      ? leave.to_date.includes(searchToDate)
      : true;

    // Date range filters
    let matchesDateRange = true;
    if (!ignoreDate) {
      if (startDate) {
        const leaveFromDate = new Date(leave.from_date);
        matchesDateRange = leaveFromDate >= startDate;
      }

      if (endDate && matchesDateRange) {
        const leaveToDate = new Date(leave.to_date);
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        matchesDateRange = leaveToDate <= adjustedEndDate;
      }
    }

    return matchesEmployee && matchesLeaveType && matchesStatus && 
           matchesAppNumber && matchesFromDate && matchesToDate && matchesDateRange;
  });

  const resetFilters = () => {
    setSearchEmployee('');
    setSearchLeaveType('');
    setSearchStatus('');
    setSearchFromDate('');
    setSearchToDate('');
    setSearchAppNumber('');
    setStartDate(null);
    setEndDate(null);
    setIgnoreDate(false);
    setShowFilterSidebar(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-600">
            Manage all employee leaves - {filteredLeaves.length} of {leaves.length} requests
          </p>
        </div>
        <Button onClick={() => setShowApplyForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Apply Leave
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
              <p className="text-xs text-gray-500 mt-1">Total approved</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">On Leave Today</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.onLeave}</p>
              <p className="text-xs text-gray-500 mt-1">Currently away</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-5 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">All Leave Requests</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-gray-50">
              {/* Main Header Row */}
                           {/* Main Header Row */}
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Application #
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Leave Type
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    From Date
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    To Date
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Days
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-4 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="bg-gray-100 border-b border-gray-200">
                {/* Application # Search */}
                <td className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search app #..."
                      value={searchAppNumber}
                      onChange={(e) => setSearchAppNumber(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </td>

                {/* Employee Search */}
                <td className="px-4 py-2">
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search employee..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </td>

                {/* Leave Type Search */}
                <td className="px-4 py-2">
                  <select
                    value={searchLeaveType}
                    onChange={(e) => setSearchLeaveType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="casual">Casual Leave</option>
                    <option value="sick">Sick Leave</option>
                    <option value="annual">Annual Leave</option>
                    <option value="maternity">Maternity Leave</option>
                    <option value="paternity">Paternity Leave</option>
                  </select>
                </td>

                {/* From Date Search */}
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={searchFromDate}
                    onChange={(e) => setSearchFromDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>

                {/* To Date Search */}
                <td className="px-4 py-2">
                  <input
                    type="date"
                    value={searchToDate}
                    onChange={(e) => setSearchToDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </td>

                {/* Days Search (empty) */}
                <td className="px-4 py-2"></td>

                {/* Status Search */}
                <td className="px-4 py-2">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                {/* Actions with Filter Button */}
                <td className="px-4 py-2">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition font-medium"
                      title="Advanced Filters"
                    >
                      <Filter className="w-3 h-3" />
                      Filters
                    </button>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">No Leave Requests Found</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {searchEmployee || searchStatus ? "Try a different search term" : "No leave applications available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setIsViewOpen(true);
                        }}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        {leave.application_number}
                      </button>
                    </td>
                    
                    {/* Employee Column */}
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{leave.employee_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{leave.employee_email}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{leave.employee_department}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{leave.leave_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{new Date(leave.from_date).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{new Date(leave.to_date).toLocaleDateString()}</span>
                    </td>
                    
                    {/* Days Column - Fixed to show 0.5 for half days */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-gray-900">
                        {leave.is_half_day ? '0.5' : leave.total_days}
                        {leave.is_half_day && (
                          <span className="text-xs text-gray-500 ml-1">(½ day)</span>
                        )}
                      </span>
                    </td>
                    
                    {/* Status Column - Fixed to show half day indicator */}
                    <td className="px-4 py-3">
                      <Badge variant={
                        leave.status === 'approved' ? 'success' :
                        leave.status === 'rejected' ? 'error' : 'warning'
                      }>
                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                       
                      </Badge>
                    </td>
                    
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsViewOpen(true);
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                        
                        {/* Attachment Download */}
                        {leave.attachment_path && (
                          <button
                            onClick={() => handleDownload(leave.id, leave.attachment_name || undefined)}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition flex items-center gap-1"
                            title="Download Attachment"
                          >
                            <Download className="w-3 h-3" />
                          </button>
                        )}
                        
                        {/* Approve/Reject */}
                        {leave.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(leave.id)}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition flex items-center gap-1"
                              title="Approve Leave"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(leave.id)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition flex items-center gap-1"
                              title="Reject Leave"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition flex items-center gap-1"
                          title="Delete Leave"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Filter Sidebar - Remaining same */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowFilterSidebar(false)}
          />
          
          <div
            className={`
              absolute inset-y-0 right-0
              bg-white shadow-2xl flex flex-col
              transition-transform duration-300 ease-out
              ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}
              w-[90vw] max-w-none md:max-w-md md:w-full
            `}
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
                  <p className="text-sm text-white/80">Filter leave applications</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Date Range */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Date Range</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      From Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        maxDate={endDate || new Date()}
                        placeholderText="Select start date"
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        dateFormat="dd/MM/yyyy"
                        locale="en-GB"
                        isClearable
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      To Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate || undefined}
                        maxDate={new Date()}
                        placeholderText="Select end date"
                        className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                        dateFormat="dd/MM/yyyy"
                        locale="en-GB"
                        isClearable
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Summary */}
                {(startDate || endDate) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-800">Selected Range</p>
                    <p className="text-xs text-gray-600">
                      {startDate ? startDate.toLocaleDateString("en-GB") : "Any"} →{" "}
                      {endDate ? endDate.toLocaleDateString("en-GB") : "Any"}
                    </p>
                  </div>
                )}

                {/* Ignore Date */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={ignoreDate}
                    onChange={(e) => {
                      setIgnoreDate(e.target.checked);
                      if (e.target.checked) {
                        setStartDate(null);
                        setEndDate(null);
                      }
                    }}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Ignore Date Filters</p>
                    <p className="text-xs text-gray-500">Show all data regardless of date</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Form Modal */}
      {showApplyForm && (
        <ApplyLeaveForm
          isOpen={showApplyForm}
          onClose={() => setShowApplyForm(false)}
          onSuccess={() => {
            loadLeaves();
            loadStats();
          }}
          employees={employees}
          user={profile}
        />
      )}

      {/* View Leave Details Modal */}
      {isViewOpen && selectedLeave && (
        <ViewLeaveDetails
          leave={selectedLeave}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedLeave(null);
          }}
          employees={employees}
        />
      )}
    </div>
  );
}