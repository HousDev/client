import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  Trash2,
  Mail,
  MoreVertical,
  X,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import ApplyLeaveForm from "../components/modals/ApplyLeaveModal";
import ViewLeaveDetails from "../components/modals/ViewLeaveDetails";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { api } from "../lib/Api";
import { useAuth } from "../contexts/AuthContext";
import HrmsEmployeesApi, { HrmsEmployee } from "../lib/employeeApi";
import { LeaveApi } from "../lib/leaveApi";
import Swal from "sweetalert2";

registerLocale("en-GB", enGB);

interface LeaveRequest {
  id: number;
  application_number: string;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
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
  is_half_day?: boolean;
  half_day_period?: "morning" | "afternoon";
}

interface EnhancedLeaveRequest extends LeaveRequest {
  is_half_day?: boolean;
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
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchLeaveType, setSearchLeaveType] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchFromDate, setSearchFromDate] = useState("");
  const [searchToDate, setSearchToDate] = useState("");
  const [searchAppNumber, setSearchAppNumber] = useState("");
  const [leaves, setLeaves] = useState<EnhancedLeaveRequest[]>([]);
  const [allLeaves, setAllLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
  const [employeeMap, setEmployeeMap] = useState<Map<number, HrmsEmployee>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedLeave, setSelectedLeave] =
    useState<EnhancedLeaveRequest | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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

      const map = new Map<number, HrmsEmployee>();
      employeesData.forEach((emp) => {
        map.set(emp.id, emp);
      });
      setEmployeeMap(map);
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employee data");
    }
  };

  // Load leaves data
  const loadLeaves = async () => {
    setLoading(true);
    if (user.role === "admin") {
      try {
        const response = await LeaveApi.getLeaves();
        console.log("fetch leaves : ", response);
        const leavesData: any = response.data;
        setAllLeaves(Array.isArray(leavesData) ? leavesData : []);
      } catch (error: any) {
        console.error("Error loading leaves:", error);
        toast.error(
          error.response?.data?.message || "Failed to load leave data",
        );
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const empData = await HrmsEmployeesApi.getEmployeeByEmail(user.email);
        console.log("emp data : ", empData);
        const response = await LeaveApi.getLeaves({ employee_id: empData.id });
        console.log("fetch leaves : ", response);
        const leavesData: any = response.data;
        setAllLeaves(Array.isArray(leavesData) ? leavesData : []);
      } catch (error: any) {
        console.error("Error loading leaves:", error);
        toast.error(
          error.response?.data?.message || "Failed to load leave data",
        );
      } finally {
        setLoading(false);
      }
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response: any = await LeaveApi.getLeaveStats();
      if (response) {
        setStats(response);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Enhance leaves with employee data
  const enhanceLeavesWithEmployeeData = (
    leavesData: LeaveRequest[],
  ): EnhancedLeaveRequest[] => {
    return leavesData.map((leave) => {
      const employee = employeeMap.get(leave.employee_id);
      return {
        ...leave,
        is_half_day: leave.is_half_day || false,
        employee_name: employee
          ? `${employee.first_name} ${employee.last_name}`
          : "Unknown Employee",
        employee_email: employee?.email || "N/A",
        employee_phone: employee?.phone || "N/A",
        employee_designation: employee?.designation || "N/A",
        employee_department: employee?.department_name || "N/A",
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
    } else {
      setLeaves([]);
    }
  }, [employeeMap, allLeaves]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".menu-container")) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredLeaves.map((leave) => leave.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredLeaves.length);
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select leaves to delete");
      return;
    }

    const result = await Swal.fire({
      title: `Delete ${selectedItems.size} Leave(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Delete (${selectedItems.size})`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => api.delete(`/leaves/${id}`)),
      );
      toast.success(`${selectedItems.size} leave(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadLeaves();
      await loadStats();
    } catch (error) {
      console.error("Error deleting leaves:", error);
      toast.error("Failed to delete leaves");
    }
  };

  // Handle approve leave
  const handleApprove = (id: number) => {
    setSelectedLeaveId(id);
    setShowApproveModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedLeaveId) return;

    try {
      const userId = user?.id ? user.id.toString() : "1";

      const response = await LeaveApi.approveLeave(
        selectedLeaveId,
        userId,
        user?.username || "usr_admin_01",
        user?.name || "Admin User",
      );

      if (response.success) {
        toast.success("Leave approved successfully");
        loadLeaves();
        loadStats();
      }
    } catch (error: any) {
      console.error("Error approving leave:", error);
      toast.error(error.response?.data?.message || "Failed to approve leave");
    } finally {
      setShowApproveModal(false);
      setSelectedLeaveId(null);
    }
  };

  // Handle reject leave
  const handleReject = (id: number) => {
    setSelectedLeaveId(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedLeaveId || !rejectionReason.trim()) {
      toast.error("Please enter rejection reason");
      return;
    }

    try {
      const userId = user?.id ? user.id.toString() : "1";

      const response = await LeaveApi.rejectLeave(
        selectedLeaveId,
        userId,
        rejectionReason,
        user?.username || "usr_admin_01",
        user?.name || "Admin User",
      );

      if (response.success) {
        toast.success("Leave rejected successfully");
        loadLeaves();
        loadStats();
      }
    } catch (error: any) {
      console.error("Error rejecting leave:", error);
      toast.error(error.response?.data?.message || "Failed to reject leave");
    } finally {
      setShowRejectModal(false);
      setSelectedLeaveId(null);
      setRejectionReason("");
    }
  };

  // Handle delete leave
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
      customClass: {
        popup: "rounded-2xl",
        confirmButton: "px-4 py-2 rounded-lg",
        cancelButton: "px-4 py-2 rounded-lg",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await api.delete(`/leaves/${id}`);
          console.log("delete response : ", response);
          if (response.data.success) {
            await Promise.all([loadLeaves(), loadStats()]);

            Swal.fire({
              title: "Deleted!",
              text: "Leave has been deleted.",
              icon: "success",
              confirmButtonColor: "#3085d6",
              customClass: {
                popup: "rounded-2xl",
                confirmButton: "px-4 py-2 rounded-lg",
              },
            });
          }
        } catch (error: any) {
          console.error("Error deleting leave:", error);
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Failed to delete leave",
            icon: "error",
            confirmButtonColor: "#3085d6",
            customClass: {
              popup: "rounded-2xl",
              confirmButton: "px-4 py-2 rounded-lg",
            },
          });
        }
      }
    });
  };

  // Handle download attachment
  const handleDownload = async (id: number, fileName?: string) => {
    try {
      const blob = await LeaveApi.downloadAttachment(id);

      let downloadName = fileName || "leave_document.pdf";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("File downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      toast.error(error.response?.data?.message || "Failed to download file");
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchEmployee("");
    setSearchLeaveType("");
    setSearchStatus("");
    setSearchFromDate("");
    setSearchToDate("");
    setSearchAppNumber("");
  };

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    const matchesEmployee = searchEmployee
      ? leave.employee_name
          ?.toLowerCase()
          .includes(searchEmployee.toLowerCase()) || false
      : true;

    const matchesLeaveType = searchLeaveType
      ? leave.leave_type.toLowerCase().includes(searchLeaveType.toLowerCase())
      : true;

    const matchesStatus = searchStatus ? leave.status === searchStatus : true;

    const matchesAppNumber = searchAppNumber
      ? leave.application_number
          .toLowerCase()
          .includes(searchAppNumber.toLowerCase())
      : true;

    const matchesFromDate = searchFromDate
      ? leave.from_date.includes(searchFromDate)
      : true;

    const matchesToDate = searchToDate
      ? leave.to_date.includes(searchToDate)
      : true;

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

    return (
      matchesEmployee &&
      matchesLeaveType &&
      matchesStatus &&
      matchesAppNumber &&
      matchesFromDate &&
      matchesToDate &&
      matchesDateRange
    );
  });

  const resetFilters = () => {
    setSearchEmployee("");
    setSearchLeaveType("");
    setSearchStatus("");
    setSearchFromDate("");
    setSearchToDate("");
    setSearchAppNumber("");
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
        <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1 rounded">
                  <Calendar className="w-3 h-3 text-blue-600" />
                </div>
                <p className="font-medium text-xs text-gray-800">
                  {selectedItems.size} selected
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
        {user.role !== "admin" && (
          <Button
            onClick={() => setShowApplyForm(true)}
            className="text-sm sticky top-20 z-10"
          >
            <Plus className=" h-4 w-4 mr-1.5" />
            Apply Leave
          </Button>
        )}
      </div>

      {/* Statistics Cards - Sticky & Compact */}
      <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                {stats.pending}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Approved
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.approved}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                On Leave
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.onLeave}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Rejected
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-red-600 mt-0.5">
                {stats.rejected}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Bulk Actions Bar */}

      {/* Main Table */}
      <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:-mt-1">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
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
                    Application #
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Leave Type
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    From Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    To Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Days
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
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

                {/* Application Number Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search app #..."
                    value={searchAppNumber}
                    onChange={(e) => setSearchAppNumber(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Employee Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Leave Type Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchLeaveType}
                    onChange={(e) => setSearchLeaveType(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="date"
                    value={searchFromDate}
                    onChange={(e) => setSearchFromDate(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* To Date Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="date"
                    value={searchToDate}
                    onChange={(e) => setSearchToDate(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Days Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Status Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </td>

                {/* Actions Column - Clear Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear All Filters"
                  >
                    <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                    <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No Leave Requests Found
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchEmployee || searchStatus
                        ? "Try a different search term"
                        : "No leave applications available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const isSelected = selectedItems.has(leave.id);
                  return (
                    <tr
                      key={leave.id}
                      className={`hover:bg-gray-50 transition ${isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(leave.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setIsViewOpen(true);
                          }}
                          className="text-xs md:text-sm font-medium text-blue-600 hover:underline"
                        >
                          {leave.application_number}
                        </button>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">
                            {leave.employee_name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {leave.employee_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm text-gray-700">
                          {leave.leave_type}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm text-gray-700">
                          {new Date(leave.from_date).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm text-gray-700">
                          {new Date(leave.to_date).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <span className="text-xs md:text-sm font-medium text-gray-800">
                          {leave.is_half_day ? "0.5" : leave.total_days}
                          {leave.is_half_day && (
                            <span className="text-[10px] md:text-xs text-gray-500 ml-1">
                              (½ day)
                            </span>
                          )}
                        </span>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge
                          variant={
                            leave.status === "approved"
                              ? "success"
                              : leave.status === "rejected"
                                ? "error"
                                : "warning"
                          }
                        >
                          {leave.status.charAt(0).toUpperCase() +
                            leave.status.slice(1)}
                        </Badge>
                      </td>

                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === leave.id ? null : leave.id,
                            )
                          }
                          className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                        </button>

                        {openMenuId === leave.id && (
                          <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li>
                                <button
                                  onClick={() => {
                                    setSelectedLeave(leave);
                                    setIsViewOpen(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View
                                </button>
                              </li>

                              {leave.attachment_path && (
                                <li>
                                  <button
                                    onClick={() => {
                                      handleDownload(
                                        leave.id,
                                        leave.attachment_name || undefined,
                                      );
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                  >
                                    <Download className="w-4 h-4" />
                                    Download
                                  </button>
                                </li>
                              )}

                              {leave.status === "pending" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() => {
                                        handleApprove(leave.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-green-600 text-left"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve
                                    </button>
                                  </li>

                                  <li>
                                    <button
                                      onClick={() => {
                                        handleReject(leave.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-orange-600 text-left"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </li>
                                </>
                              )}

                              <hr className="my-1" />

                              {!(
                                leave.status === "approved" ||
                                leave.status === "rejected"
                              ) && (
                                <li>
                                  <button
                                    onClick={() => {
                                      handleDelete(leave.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
          // user={profile}
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

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Approve Leave
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to approve this leave?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedLeaveId(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Yes, Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Reject Leave
                </h3>
                <p className="text-sm text-gray-600">
                  Please provide a reason for rejection:
                </p>
              </div>
            </div>

            <div className="mb-4">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedLeaveId(null);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
                className={`px-4 py-2 rounded-lg transition ${
                  rejectionReason.trim()
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-red-300 text-white cursor-not-allowed"
                }`}
              >
                Reject Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
