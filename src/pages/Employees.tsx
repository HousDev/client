

// components/Employees.tsx
import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  X,
  FileText,
  MoreHorizontal,
  FileEdit,
  FilePlus,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import AddEmployeeModal from "../components/modals/AddEmployeeModal";
import { exportToCSV } from "../utils/export";
import employeeAPI from "../lib/employeeApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import ViewEmployeeModal from "../components/modals/ViewEmployeeModal";
import EditEmployeeModal from "../components/modals/EditEmployeeModal";
import AddMoreDetailsModal from "../components/modals/AddMoreDetailsModal";
import { useNavigate } from "react-router-dom";

// Update the Employee interface
interface Employee {
  id: string;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  gender?: string;
  joining_date?: string;
  role: { name: string } | null;
  department: { name: string } | null;
  project?: { name: string } | null;
  office_location?: string;
  attendance_location?: string;
  employee_status: string;
  profile_picture?: string;
  
  // Personal Details
  blood_group?: string;
  date_of_birth?: string;
  marital_status?: string;
  emergency_contact?: string;
  nationality?: string;
  
  // Address Details
  current_address?: string;
  permanent_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  same_as_permanent?: boolean;
  
  // Identification
  aadhar_number?: string;
  pan_number?: string;
  
  // Educational Details
  highest_qualification?: string;
  university?: string;
  passing_year?: string;
  percentage?: string;
  
  // Employment Details
  employee_type?: string;
  branch?: string;
  probation_period?: string;
  work_mode?: string;
  job_title?: string;
  notice_period?: string;
  
  // System Details
  laptop_assigned?: string;
  system_login_id?: string;
  system_password?: string;
  office_email_id?: string;
  office_email_password?: string;
  
  // Bank Details
  bank_account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  upi_id?: string;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMoreDetailsModal, setShowAddMoreDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    newThisMonth: 0,
  });

  // Column search filters
  const [columnFilters, setColumnFilters] = useState({
    name: "",
    email: "",
    code: "",
    department: "",
    role: "",
    status: "",
  });

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  useEffect(() => {
    loadEmployees();
    loadStats();
  }, []);

  const loadEmployees = async () => {
    try {
      const data = await employeeAPI.getEmployees();
      console.log("emp data", data);
      setEmployees(
        data.map((emp: any) => ({
          id: emp.id,
          employee_code: emp.employee_code || `EMP${emp.id}`,
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          phone: emp.phone,
          designation: emp.designation,
          gender: emp.gender,
          joining_date: emp.joining_date,
          employee_status: emp.employee_status || "active",
          role: emp.role_name ? { name: emp.role_name } : null,
          department: emp.department_name
            ? { name: emp.department_name }
            : null,
          project: emp.project_name ? { name: emp.project_name } : null,
          office_location: emp.office_location,
          attendance_location: emp.attendence_location,
          profile_picture: emp.profile_picture || null,
          
          // Additional fields
          blood_group: emp.blood_group,
          date_of_birth: emp.date_of_birth,
          marital_status: emp.marital_status,
          emergency_contact: emp.emergency_contact,
          nationality: emp.nationality,
          current_address: emp.current_address,
          permanent_address: emp.permanent_address,
          city: emp.city,
          state: emp.state,
          pincode: emp.pincode,
          same_as_permanent: emp.same_as_permanent || false,
          aadhar_number: emp.aadhar_number,
          pan_number: emp.pan_number,
          highest_qualification: emp.highest_qualification,
          university: emp.university,
          passing_year: emp.passing_year,
          percentage: emp.percentage,
          employee_type: emp.employee_type,
          branch: emp.branch,
          probation_period: emp.probation_period,
          work_mode: emp.work_mode,
          job_title: emp.job_title,
          notice_period: emp.notice_period,
          laptop_assigned: emp.laptop_assigned,
          system_login_id: emp.system_login_id,
          system_password: emp.system_password,
          office_email_id: emp.office_email_id,
          office_email_password: emp.office_email_password,
          bank_account_number: emp.bank_account_number,
          bank_name: emp.bank_name,
          ifsc_code: emp.ifsc_code,
          upi_id: emp.upi_id,
        })),
      );
    } catch (error) {
      console.error("Error loading employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const deleteEmployee = async (id: number) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;
    try {
      const res: any = await employeeAPI.deleteEmployee(id);
      if (res.success) {
        toast.success("Employee Deleted Successfully.");
        loadEmployees();
      } else {
        toast.error("Failed to delete employee.");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong.");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select employees to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedItems.size} Employee(s)?`,
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
        Array.from(selectedItems).map((id) => employeeAPI.deleteEmployee(Number(id)))
      );
      toast.success(`${selectedItems.size} employee(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadEmployees();
    } catch (error) {
      console.error("Error deleting employees:", error);
      toast.error("Failed to delete employees");
    }
  };

  const loadStats = async () => {
    try {
      const employees = await employeeAPI.getEmployees();
      const total = employees.length;
      const active = employees.filter((emp: any) => emp.employee_status === 'active').length;
      const onLeave = employees.filter((emp: any) => emp.employee_status === 'on_leave').length;
      
      // Calculate new this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newThisMonth = employees.filter((emp: any) => {
        if (!emp.joining_date) return false;
        const joinDate = new Date(emp.joining_date);
        return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
      }).length;

      setStats({
        total,
        active,
        onLeave,
        newThisMonth,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Failed to load statistics");
    }
  };

  // Handle column filter changes
  const handleColumnFilterChange = (column: keyof typeof columnFilters, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  // Clear all column filters
  const clearAllFilters = () => {
    setColumnFilters({
      name: "",
      email: "",
      code: "",
      department: "",
      role: "",
      status: "",
    });
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredEmployees.map((emp) => emp.id));
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
    setSelectAll(newSelected.size === filteredEmployees.length);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string, label: string }> = {
      active: { variant: "success", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      on_leave: { variant: "warning", label: "On Leave" },
      terminated: { variant: "danger", label: "Terminated" },
    };

    const statusConfig = statusMap[status.toLowerCase()] || { variant: "secondary", label: status };
    return <Badge variant={statusConfig.variant as any}>{statusConfig.label}</Badge>;
  };

  // Check if employee has additional details
  const hasAdditionalDetails = (employee: Employee) => {
    return (
      employee.blood_group ||
      employee.date_of_birth ||
      employee.marital_status ||
      employee.emergency_contact ||
      employee.nationality ||
      employee.current_address ||
      employee.permanent_address ||
      employee.city ||
      employee.state ||
      employee.pincode ||
      employee.aadhar_number ||
      employee.pan_number ||
      employee.highest_qualification ||
      employee.university ||
      employee.passing_year ||
      employee.percentage ||
      employee.employee_type ||
      employee.branch ||
      employee.probation_period ||
      employee.work_mode ||
      employee.job_title ||
      employee.notice_period ||
      employee.laptop_assigned ||
      employee.system_login_id ||
      employee.system_password ||
      employee.office_email_id ||
      employee.office_email_password ||
      employee.bank_account_number ||
      employee.bank_name ||
      employee.ifsc_code ||
      employee.upi_id
    );
  };

  // Filter employees based on column filters
  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    
    // Check each column filter
    if (columnFilters.name && !fullName.includes(columnFilters.name.toLowerCase())) return false;
    if (columnFilters.email && !emp.email.toLowerCase().includes(columnFilters.email.toLowerCase())) return false;
    if (columnFilters.code && !emp.employee_code.toLowerCase().includes(columnFilters.code.toLowerCase())) return false;
    if (columnFilters.department && !emp.department?.name?.toLowerCase().includes(columnFilters.department.toLowerCase())) return false;
    if (columnFilters.role && !emp.role?.name?.toLowerCase().includes(columnFilters.role.toLowerCase())) return false;
    if (columnFilters.status && !emp.employee_status.toLowerCase().includes(columnFilters.status.toLowerCase())) return false;

    // Keep global search functionality
    if (searchTerm && 
        !fullName.includes(searchTerm.toLowerCase()) &&
        !emp.email.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !emp.employee_code.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end py-0 -mt-2 -mb-2">
        <Button onClick={() => setShowAddModal(true)} className="text-sm">
          <Plus className="h-4 w-4 mr-1.5" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Employees
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                {stats.total}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Active
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.active}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                On Leave
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                {stats.onLeave}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                New This Month
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.newThisMonth}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-end">
            {/* Global Search */}
            <div className="w-full md:w-auto">
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64"
                startIcon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 w-full md:w-auto">
              {/* Bulk Delete Button */}
              {selectedItems.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-medium px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedItems.size})
                </button>
              )}

              {/* Export Button */}
              <Button
                variant="secondary"
                className="text-sm h-9"
                onClick={() => {
                  const exportData = filteredEmployees.map((emp) => ({
                    Code: emp.employee_code,
                    "First Name": emp.first_name,
                    "Last Name": emp.last_name,
                    Email: emp.email,
                    Department: emp.department?.name || "N/A",
                    Role: emp.role?.name || "N/A",
                    Status: emp.employee_status,
                  }));
                  exportToCSV(exportData, "employees");
                }}
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              {/* Header Row */}
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide w-16">
                  <div className="text-center">Select</div>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Employee
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Department
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">
                  Actions
                </th>
              </tr>

              {/* Search Row - Separate Row Below Headers */}
              <tr className="bg-slate-50 border-b border-slate-200">
                {/* Select Column */}
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Name Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={columnFilters.name}
                    onChange={(e) => handleColumnFilterChange('name', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Code Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search code..."
                    value={columnFilters.code}
                    onChange={(e) => handleColumnFilterChange('code', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Email Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={columnFilters.email}
                    onChange={(e) => handleColumnFilterChange('email', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Department Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search dept..."
                    value={columnFilters.department}
                    onChange={(e) => handleColumnFilterChange('department', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Role Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search role..."
                    value={columnFilters.role}
                    onChange={(e) => handleColumnFilterChange('role', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Status Column Search */}
                <td className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={columnFilters.status}
                    onChange={(e) => handleColumnFilterChange('status', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Actions Column - Filter and Clear Buttons */}
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-xs font-medium text-gray-700"
                      title="Advanced Filters"
                    >
                      <Filter className="w-3 h-3 mr-1" />
                      Filters
                    </button>
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-xs font-medium text-gray-700"
                      title="Clear All Filters"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedItems.has(employee.id);
                const hasDetails = hasAdditionalDetails(employee);
                
                return (
                  <tr
                    key={employee.id}
                    className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(employee.id)}
                        className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 flex-shrink-0 border border-gray-200">
                          {employee.profile_picture ? (
                            <img 
                              src={`http://localhost:4000${employee.profile_picture}`} 
                              alt={`${employee.first_name} ${employee.last_name}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'w-full h-full flex items-center justify-center bg-blue-100';
                                  fallback.innerHTML = `<span class="text-xs font-medium text-blue-700">${employee.first_name.charAt(0)}${employee.last_name.charAt(0)}</span>`;
                                  parent.appendChild(fallback);
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100">
                              <span className="text-xs font-medium text-blue-700">
                                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {employee.first_name} {employee.last_name}
                          </p>
                          <p className="text-xs text-slate-600">{employee.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {employee.employee_code || "EMP" + employee.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-900">
                        {employee.email}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-900">
                        {employee.department?.name || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{employee.role?.name || "N/A"}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(employee.employee_status)}
                    </td>
                  <td className="px-4 py-3">
  <div className="flex items-center justify-end gap-1">
    <button
      onClick={() => navigate(`/employee/${employee.id}`)}
      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
      title="View Profile"
    >
      <Eye className="h-4 w-4 text-slate-600" />
    </button>
    <button
      onClick={() => {
        setSelectedEmployee(employee);
        setShowEditModal(true);
      }}
      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
      title="Edit Basic Info"
    >
      <Edit className="h-4 w-4 text-slate-600" />
    </button>
    <button
      onClick={() => {
        setSelectedEmployee(employee);
        setShowAddMoreDetailsModal(true);
      }}
      className="p-1.5 hover:bg-slate-100 rounded transition-colors group relative"
      title={hasDetails ? "Edit Additional Details" : "Add More Details"}
    >
      {/* Show different icons based on whether details exist */}
      {hasDetails ? (
        <>
          <FileEdit className="h-4 w-4 text-green-600" />
          {/* Tooltip for editing */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
            Edit Additional Details
          </div>
        </>
      ) : (
        <>
          <FilePlus className="h-4 w-4 text-blue-600" />
          {/* Tooltip for adding */}
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
            Add More Details
          </div>
        </>
      )}
    </button>
    <button
      onClick={() => deleteEmployee(Number(employee.id))}
      className="p-1.5 hover:bg-slate-100 rounded transition-colors"
      title="Delete"
    >
      <Trash2 className="h-4 w-4 text-red-600" />
    </button>
  </div>
</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-base font-medium">
                No employees found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm || Object.values(columnFilters).some(val => val) 
                  ? "Try a different search term or clear filters"
                  : "Click 'Add Employee' to get started"}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowFilterSidebar(false)}
          />
          
          <div className="absolute inset-y-0 right-0 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out translate-x-0 w-[90vw] md:max-w-md">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-xl font-bold text-white">
                    Employee Filters
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    Filter employees by status
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowFilterSidebar(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-1.5 transition"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Employee Status
                  </label>
                  <div className="space-y-2">
                    {['active', 'inactive', 'on_leave', 'terminated'].map((status) => (
                      <div key={status} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={columnFilters.status.toLowerCase().includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleColumnFilterChange('status', status);
                            } else {
                              handleColumnFilterChange('status', '');
                            }
                          }}
                          className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                        <span className="text-sm text-gray-700 capitalize">{status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by department..."
                    value={columnFilters.department}
                    onChange={(e) => handleColumnFilterChange('department', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by role..."
                    value={columnFilters.role}
                    onChange={(e) => handleColumnFilterChange('role', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setShowFilterSidebar(false);
                }}
                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterSidebar(false)}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-[#D32F2F] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <ViewEmployeeModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedEmployee(null);
          }}
          employee={selectedEmployee}
          onEditClick={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onAddDetailsClick={() => {
            setShowViewModal(false);
            setShowAddMoreDetailsModal(true);
          }}
        />
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEmployee(null);
          }}
          employeeId={selectedEmployee.id}
          onSuccess={() => {
            loadEmployees();
            loadStats();
          }}
        />
      )}

      {/* Add More Details Modal */}
      {showAddMoreDetailsModal && selectedEmployee && (
        <AddMoreDetailsModal
          isOpen={showAddMoreDetailsModal}
          onClose={() => {
            setShowAddMoreDetailsModal(false);
            setSelectedEmployee(null);
          }}
          employeeId={selectedEmployee.id}
          onSuccess={() => {
            loadEmployees();
            toast.success("Additional details updated successfully!");
          }}
        />
      )}

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadEmployees();
          loadStats();
        }}
      />
    </div>
  );
}