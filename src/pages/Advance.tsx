/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  AlertCircle,
  X,
  MoreVertical,
  Trash2,
  Mail,
  Phone,
  Save,
  UserRound,
  Upload,
  ChevronDown,
  Hash,
  CheckSquare,
  Package,
  UserCheck,
  CreditCard,
  Calculator,
  Briefcase,
  TrendingDown,
  Percent,
  FileText,
  ChevronRight,
  Building,
  IndianRupee,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { toast } from "sonner";
import HrmsEmployeesApi, {
  HrmsEmployee as ApiHrmsEmployee,
} from "../lib/employeeApi";
import employeeAdvanceApi from "../lib/employeeAdvanceApi";
import { useAuth } from "../contexts/AuthContext";
import MySwal from "../utils/swal";

interface AdvanceRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  salary: number;
  employee_email: string;
  employee_phone: string;
  employee_department: string;
  employee_designation: string;
  amount: number;
  reason: string;
  request_date: string;
  installments: number;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "disbursed"
    | "recovering"
    | "recovered";
  approved_by?: string;
  disbursement_date?: string;
  total_recovered?: number;
  balance_amount?: number;
  monthly_deduction: number;
  remark?: string;
}

interface HrmsEmployee {
  id: number;
  first_name: string;
  last_name: string;
  employee_code: string;
  email: string;
  phone: string;
  department_name?: string;
  designation?: string;
  ctc?: number;
  salary?: string | number; // Monthly salary from API
  monthly_salary: number;
}
export default function Advance() {
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
  const [loading, setLoading] = useState(true);

  // Search states for each column
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchReason, setSearchReason] = useState("");
  const [searchInstallments, setSearchInstallments] = useState("");
  const [searchRequestDate, setSearchRequestDate] = useState("");
  const [searchBalance, setSearchBalance] = useState("");
  const [searchStatus, setSearchStatus] = useState("all");

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<AdvanceRequest | null>(
    null,
  );
  const { user } = useAuth();

  // More menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: "",
    amount: "",
    reason: "",
    installments: "3",
    required_date: new Date().toISOString().split("T")[0],
    remarks: "",
    attachment: null as File | null,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);

  const [approvalData, setApprovalData] = useState({
    action: "approve" as "approved" | "rejected",
    remarks: "",
  });

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAdvances();
    loadEmployees();
  }, []);

  const calculateEmpSalary = (salary: number, type: string) => {
    if (type === "daily") {
      return salary * 30;
    } else if (type === "yearly") {
      return salary / 12;
    } else {
      return salary;
    }
  };

  const loadEmployees = async () => {
    setLoadingEmployees(true); // ✅ Add this
    try {
      const employeesData = await HrmsEmployeesApi.getEmployees();

      // Filter only active employees and map to required format
      const activeEmployees = employeesData
        .filter((emp: any) => emp.employee_status === "active")
        .map((emp: any) => ({
          id: emp.id,
          first_name: emp.first_name,
          last_name: emp.last_name,
          employee_code: emp.employee_code,
          email: emp.email,
          phone: emp.phone || "N/A",
          department_name: emp.department_name || "N/A",
          designation: emp.designation || "N/A",
          ctc: parseFloat(emp.salary?.toString() || "0") * 12, // Annual CTC
          salary: calculateEmpSalary(Number(emp.salary), emp.salary_type),
          monthly_salary: calculateEmpSalary(
            Number(emp.salary),
            emp.salary_type,
          ), // Monthly salary
        }));

      setEmployees(activeEmployees);

      if (activeEmployees.length === 0) {
        toast.info("No active employees found");
      }
    } catch (error: any) {
      console.error("❌ Error loading employees:", error);
      toast.error(
        "Failed to load employees: " + (error.message || "Unknown error"),
      );
      setEmployees([]); // Set empty array on error
    } finally {
      setLoadingEmployees(false); // ✅ Add this
    }
  };
  const loadAdvances = async () => {
    setLoading(true);
    try {
      const mockData: AdvanceRequest[] = [
        {
          id: "1",
          employee_id: "emp1",
          employee_name: "Abhishek Patil",
          employee_code: "EMP001",
          salary: 1500000,
          employee_email: "abhishek@example.com",
          employee_phone: "+91 9876543210",
          employee_department: "Engineering",
          employee_designation: "Senior Developer",
          amount: 50000,
          reason: "Medical emergency for family treatment",
          request_date: "2026-01-15",
          installments: 3,
          status: "pending",
          balance_amount: 50000,
          monthly_deduction: 16667,
          remark: "Urgent medical requirement",
        },
        {
          id: "2",
          employee_id: "emp2",
          employee_name: "Guru Kandgavalkar",
          employee_code: "EMP002",
          salary: 1100000,
          employee_email: "guru@example.com",
          employee_phone: "+91 9876543211",
          employee_department: "Sales",
          employee_designation: "Sales Manager",
          amount: 30000,
          reason: "Personal loan for education",
          request_date: "2026-01-10",
          installments: 2,
          status: "approved",
          approved_by: "Admin User",
          balance_amount: 30000,
          monthly_deduction: 15000,
          remark: "Education fee payment",
        },
        {
          id: "3",
          employee_id: "emp3",
          employee_name: "Heena Bagwan",
          employee_code: "EMP003",
          salary: 1200000,
          employee_email: "heena@example.com",
          employee_phone: "+91 9876543212",
          employee_department: "HR",
          employee_designation: "HR Manager",
          amount: 25000,
          reason: "Home renovation and repairs",
          request_date: "2026-01-05",
          installments: 5,
          status: "recovering",
          approved_by: "Admin User",
          disbursement_date: "2026-01-08",
          total_recovered: 10000,
          balance_amount: 15000,
          monthly_deduction: 5000,
          remark: "Home maintenance work",
        },
      ];
      // API call would go here
      const res: any = await employeeAdvanceApi.getAllAdvance();
      console.log("res : ", res);
      // setAdvances(mockData);
      setAdvances(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error loading advances:", error);
      toast.error("Failed to load advance requests");
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending: advances.filter((a) => a.status === "pending").length,
    approved: advances.filter((a) => a.status === "approved").length,
    disbursed: advances.filter(
      (a) => a.status === "disbursed" || a.status === "recovering",
    ).length,
    recovered: advances.filter((a) => a.status === "recovered").length,
    totalAmount: advances.reduce((sum, a) => sum + Number(a.amount), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "recovering":
        return "processing";
      case "recovered":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const handleCreateAdvance = async () => {
    // Validation
    if (!formData.employee_id) {
      toast.error("Please select an employee");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid advance amount");
      return;
    }

    if (!formData.reason || formData.reason.length < 10) {
      toast.error("Please provide a detailed reason (minimum 10 characters)");
      return;
    }

    // Calculate maximum allowed advance (2x monthly salary)
    const selectedEmp = employees.find(
      (emp) => emp.id.toString() === formData.employee_id,
    );
    if (selectedEmp) {
      const maxAmount = selectedEmp.monthly_salary * 2;
      if (parseFloat(formData.amount) > maxAmount) {
        toast.error(
          `Maximum advance amount is ₹${maxAmount.toLocaleString()} (2x monthly salary)`,
        );
        return;
      }
    }

    try {
      console.log(formData);
      const formDataObj = new FormData();
      formDataObj.append("employee_id", formData.employee_id);
      formDataObj.append("advance_amount", formData.amount);
      formDataObj.append("reason_for_advance", formData.reason);
      formDataObj.append("installments", formData.installments);
      if (formData.required_date)
        formDataObj.append("required_by", formData.required_date);
      if (formData.remarks) formDataObj.append("remarks", formData.remarks);
      if (formData.attachment)
        formDataObj.append("attachment", formData.attachment);

      // API call would go here
      const res: any = await employeeAdvanceApi.createAdvance(formDataObj);

      if (res.success) {
        toast.success("Advance request created successfully!");

        // Close modal and reset form
        setShowCreateModal(false);
        resetForm();
      } else {
        toast.error("Faild to create advance.");
      }
      // Reload advances
      await loadAdvances();
    } catch (error) {
      console.error("Error creating advance:", error);
      toast.error("Failed to create advance request");
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedAdvance) return;

    try {
      // API call would go here
      let approveRes: any;
      if (approvalData.action === "approved") {
        approveRes = await employeeAdvanceApi.approveAdvance(
          selectedAdvance.id,
          user.id,
          approvalData.remarks,
        );
      } else {
        approveRes = await employeeAdvanceApi.rejectAdvance(
          selectedAdvance.id,
          user.id,
          approvalData.remarks,
        );
      }
      console.log(approvalData);
      setShowApprovalModal(false);
      setSelectedAdvance(null);
      setApprovalData({ action: "approved", remarks: "" });
      if (approveRes.success) {
        await loadAdvances();
        toast.success(approveRes.message);
      } else {
        toast.success(approveRes.message);
      }
    } catch (error: any) {
      console.error("Error processing approval:", error);
      toast.error(error.response.data.message);
    }
  };

  const handleDisburse = async (advance: AdvanceRequest) => {
    try {
      // API call would go here
      const disbursementRes: any = await employeeAdvanceApi.disburseAdvance(
        advance.id,
      );

      if (disbursementRes.success) {
        await loadAdvances();
        toast.success(disbursementRes.message);
      } else {
        toast.success(disbursementRes.message);
      }
    } catch (error: any) {
      console.error("Error disbursing advance:", error);
      toast.error(error.response.data.message);
    }
  };

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
      const allIds = new Set(filteredAdvances.map((advance) => advance.id));
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
    setSelectAll(newSelected.size === filteredAdvances.length);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select advances to delete");
      return;
    }

    // if (!confirm(`Delete ${selectedItems.size} advance(s)? This action cannot be undone.`)) {
    //   return;
    // }

    try {
      // API call would go here
      console.log("Deleting advances:", Array.from(selectedItems));
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadAdvances();
      toast.success(`${selectedItems.size} advance(s) deleted successfully!`);
    } catch (error) {
      console.error("Error deleting advances:", error);
      toast.error("Failed to delete advances");
    }
  };

  const clearAllFilters = () => {
    setSearchEmployee("");
    setSearchAmount("");
    setSearchReason("");
    setSearchInstallments("");
    setSearchRequestDate("");
    setSearchBalance("");
    setSearchStatus("all");
  };

  const filteredAdvances = advances.filter((advance) => {
    const matchesEmployee = searchEmployee
      ? advance.employee_name
          .toLowerCase()
          .includes(searchEmployee.toLowerCase()) ||
        advance.employee_code
          .toLowerCase()
          .includes(searchEmployee.toLowerCase())
      : true;

    const matchesAmount = searchAmount
      ? advance.amount.toString().includes(searchAmount)
      : true;

    const matchesReason = searchReason
      ? advance.reason.toLowerCase().includes(searchReason.toLowerCase())
      : true;

    const matchesInstallments = searchInstallments
      ? advance.installments.toString().includes(searchInstallments)
      : true;

    const matchesRequestDate = searchRequestDate
      ? advance.request_date.includes(searchRequestDate)
      : true;

    const matchesBalance = searchBalance
      ? advance.balance_amount?.toString().includes(searchBalance) || false
      : true;

    const matchesStatus =
      searchStatus === "all" || advance.status === searchStatus;

    return (
      matchesEmployee &&
      matchesAmount &&
      matchesReason &&
      matchesInstallments &&
      matchesRequestDate &&
      matchesBalance &&
      matchesStatus
    );
  });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = "";
        return;
      }

      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only PDF, JPEG, and PNG files are allowed");
        e.target.value = "";
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }

      setFormData((prev) => ({ ...prev, attachment: file }));
    }
  };

  // Clear file and preview
  const clearFile = () => {
    setFormData((prev) => ({ ...prev, attachment: null }));
    setFilePreview(null);
    const fileInput = document.getElementById("attachment") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_id: "",
      amount: "",
      reason: "",
      installments: "3",
      required_date: new Date().toISOString().split("T")[0],
      remarks: "",
      attachment: null,
    });
    setFilePreview(null);
  };

  // Calculate monthly deduction
  const calculateMonthlyDeduction = () => {
    if (!formData.amount || !formData.installments) return 0;
    return parseFloat(formData.amount) / parseInt(formData.installments);
  };

  // Get selected employee's monthly salary
  const getSelectedEmployee = () => {
    return employees.find((emp) => emp.id.toString() === formData.employee_id);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.employee_id || !formData.amount || !formData.reason) {
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return false;
    }

    if (formData.reason.length < 10) {
      return false;
    }

    return true;
  };

  const deleteAdvance = async (id: number | string) => {
    try {
      const result: any = await MySwal.fire({
        title: `Delete  Advance?`,
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C62828",
        cancelButtonColor: "#6B7280",
        confirmButtonText: `Delete`,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
      // Immediate deletion with toast
      const res: any = await employeeAdvanceApi.deleteAdvance(id);
      console.log(res);
      if (res.success) {
        await loadAdvances();
        toast.success(res.message);
        setOpenMenuId(null);
      } else {
        toast.error(res.message);
      } // You might want to update state or make API call here
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header with New Advance Button */}
      <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
        <div className="sticky top-20 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
          <Button onClick={() => setShowCreateModal(true)} className="text-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New Advance Request
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Sticky & Compact */}
      <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending Requests
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
                Disbursed
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.disbursed}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Amount
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                ₹{(stats.totalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-slate-100 rounded-md flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table */}
      <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:-mt-1">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
          <table className="w-full min-w-[1000px]">
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
                    Amount
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Installments
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Request Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Disbursement Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Balance
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
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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

                {/* Amount Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search amount..."
                    value={searchAmount}
                    onChange={(e) => setSearchAmount(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Reason Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search reason..."
                    value={searchReason}
                    onChange={(e) => setSearchReason(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Installments Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search installments..."
                    value={searchInstallments}
                    onChange={(e) => setSearchInstallments(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Request Date Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="date"
                    value={searchRequestDate}
                    onChange={(e) => setSearchRequestDate(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Balance Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search balance..."
                    value={searchBalance}
                    onChange={(e) => setSearchBalance(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Status Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="disbursed">Disbursed</option>
                    <option value="recovering">Recovering</option>
                    <option value="recovered">Recovered</option>
                  </select>
                </td>

                {/* Actions Column */}
                <td className="px-3 md:px-4 py-1">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Advanced Filter"
                    >
                      <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                      Filter
                    </button>
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Clear All Filters"
                    >
                      <X className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Loading advance requests...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                    <IndianRupee className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No Advance Requests Found
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchEmployee || searchStatus !== "all"
                        ? "Try a different search term"
                        : "No advance requests available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((advance) => {
                  const isSelected = selectedItems.has(advance.id);
                  return (
                    <tr
                      key={advance.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(advance.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">
                            {advance.employee_name}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-600">
                            {advance.employee_code}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {advance.employee_email}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-gray-800">
                          ₹{advance.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] md:text-xs text-green-600">
                          {advance.monthly_deduction.toLocaleString()}/month
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700 max-w-xs truncate">
                          {advance.reason}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge variant="secondary">
                          {advance.installments}x
                        </Badge>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {new Date(advance.request_date).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {advance.disbursement_date
                            ? new Date(
                                advance.disbursement_date,
                              ).toLocaleDateString()
                            : "--"}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        {advance.balance_amount !== undefined && (
                          <p className="text-xs md:text-sm font-medium text-orange-600">
                            ₹{advance.balance_amount.toLocaleString()}
                          </p>
                        )}
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge variant={getStatusColor(advance.status)}>
                          {advance.status}
                        </Badge>
                      </td>

                      {/* Actions Column - Only Three-dot menu */}
                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === advance.id ? null : advance.id,
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition ml-auto"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openMenuId === advance.id && (
                          <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li>
                                <button
                                  onClick={() => {
                                    console.log(advance);
                                    setSelectedAdvance(advance);
                                    setShowDetailsModal(true);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </li>

                              {/* Approve/Reject options only for pending status */}
                              {advance.status === "pending" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() => {
                                        setSelectedAdvance(advance);
                                        setApprovalData({
                                          action: "approved",
                                          remarks: "",
                                        });
                                        setShowApprovalModal(true);
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
                                        setSelectedAdvance(advance);
                                        setApprovalData({
                                          action: "rejected",
                                          remarks: "",
                                        });
                                        setShowApprovalModal(true);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-red-600 text-left"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </li>
                                </>
                              )}

                              {/* Disburse option only for approved status */}
                              {advance.status === "approved" && (
                                <li>
                                  <button
                                    onClick={() => {
                                      handleDisburse(advance);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                  >
                                    <IndianRupee className="w-4 h-4" />
                                    Disburse
                                  </button>
                                </li>
                              )}

                              {advance.status === "pending" && (
                                <hr className="my-1" />
                              )}

                              {advance.status === "pending" && (
                                <li>
                                  <button
                                    onClick={() => {
                                      deleteAdvance(advance.id);
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

      {/* Create Advance Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => {
              setShowCreateModal(false);
              resetForm();
            }}
          />

          <div
            ref={formRef}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl my-4 border border-gray-200 overflow-hidden relative z-10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Create Advance Request
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Request a salary advance for approved purposes
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateAdvance();
                }}
                className="space-y-6"
              >
                {/* Employee Selection */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <UserRound className="w-4 h-4 text-[#C62828]" />
                    Select Employee <span className="text-red-500">*</span>
                  </label>

                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <UserRound className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.employee_id}
                      onChange={(e) => {
                        const empId = e.target.value;
                        setFormData({ ...formData, employee_id: empId });
                      }}
                      className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      required
                      disabled={loadingEmployees} // ✅ Add this
                    >
                      <option value="" className="text-gray-400">
                        {loadingEmployees
                          ? "Loading employees..."
                          : "Select Employee"}{" "}
                        {/* ✅ Update this */}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id} className="py-2">
                          {emp.first_name} {emp.last_name} ({emp.employee_code})
                          - ₹{emp.monthly_salary.toLocaleString()}/month
                        </option>
                      ))}
                    </select>
                    {/* ✅ Add this after the select dropdown */}
                    {loadingEmployees && (
                      <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                        <div className="animate-spin h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Loading employees from database...
                      </p>
                    )}
                    {!loadingEmployees && employees.length === 0 && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        No active employees found. Please add employees first.
                      </p>
                    )}
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Employee Details Card */}
                  {formData.employee_id && getSelectedEmployee() && (
                    <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/50 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-700">
                              Selected Employee Details
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">
                              Advance eligibility calculated
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">
                            Monthly Salary
                          </p>
                          <p className="text-sm font-semibold text-gray-800">
                            ₹
                            {getSelectedEmployee()?.monthly_salary.toLocaleString()}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">
                            Max Advance (2x Salary)
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            ₹
                            {(
                              getSelectedEmployee()!.monthly_salary * 2
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amount & Installments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-[#C62828]" />
                      Advance Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => {
                          if (e.target.value.length !== 0) {
                            if (
                              getSelectedEmployee()!.monthly_salary * 2 <
                              Number(e.target.value)
                            )
                              return;
                            if (Number(e.target.value) <= 0) return;
                          }
                          setFormData({
                            ...formData,
                            amount: e.target.value,
                          });
                        }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                    {formData.amount && getSelectedEmployee() && (
                      <p className="text-xs text-gray-500">
                        Max allowed: ₹
                        {(
                          getSelectedEmployee()!.monthly_salary * 2
                        ).toLocaleString()}{" "}
                        (2x monthly salary)
                      </p>
                    )}
                  </div>

                  {/* Installments */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-[#C62828]" />
                      Number of Installments
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.installments}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            installments: e.target.value,
                          })
                        }
                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      >
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <option key={num} value={num} className="py-2">
                            {num} month{num > 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Monthly Deduction Calculation */}
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-[#C62828]" />
                      Monthly Deduction Summary
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <div className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xl font-bold text-blue-600">
                              ₹{calculateMonthlyDeduction().toLocaleString()}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5">
                              Monthly deduction for {formData.installments}{" "}
                              months
                            </p>
                          </div>
                          <div
                            className={`p-1.5 rounded-lg ${calculateMonthlyDeduction() > 0 ? "bg-green-100" : "bg-gray-100"}`}
                          >
                            <CheckSquare
                              className={`w-4 h-4 ${calculateMonthlyDeduction() > 0 ? "text-green-600" : "text-gray-400"}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Required Date */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C62828]" />
                    Required By <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={formData.required_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          required_date: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Reason for Advance <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 resize-none hover:border-gray-300"
                      placeholder="Please provide a detailed reason for your advance request. Include any relevant details that would help in the approval process..."
                      required
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {formData.reason.length}/500
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters required. Please be as detailed as
                    possible.
                  </p>
                </div>

                {/* Document Upload */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#C62828]" />
                    Supporting Document (Optional)
                  </label>

                  <div className="space-y-3">
                    {/* File Input */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <FileText className="w-4 h-4" />
                      </div>
                      <input
                        type="file"
                        id="attachment"
                        onChange={handleFileUpload}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium file:cursor-pointer"
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                    </div>

                    {/* Preview Section */}
                    {formData.attachment && (
                      <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3 border-b border-blue-200">
                          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            Document Preview
                          </h3>
                        </div>

                        <div className="p-4">
                          {/* Image Preview */}
                          {filePreview &&
                            formData.attachment.type.startsWith("image/") && (
                              <div className="mb-4">
                                <p className="text-xs font-medium text-gray-500 mb-2">
                                  Image Preview:
                                </p>
                                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                                  <img
                                    src={filePreview}
                                    alt="Document preview"
                                    className="max-h-64 max-w-full rounded"
                                  />
                                </div>
                              </div>
                            )}

                          {/* File Details */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  File Name
                                </p>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {formData.attachment.name}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  File Size
                                </p>
                                <p className="text-sm text-gray-700">
                                  {(formData.attachment.size / 1024).toFixed(1)}{" "}
                                  KB
                                </p>
                              </div>
                            </div>

                            {/* Remove Button */}
                            <div className="mt-4 flex justify-end">
                              <button
                                type="button"
                                onClick={clearFile}
                                className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                Remove File
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    Upload supporting documents like quotations, bills, or
                    medical certificates. Maximum file size: 5MB. Allowed
                    formats: PDF, JPG, JPEG, PNG.
                  </p>
                </div>

                {/* Important Notes */}
                <div className="border-2 border-yellow-200 rounded-xl overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-5 py-3 border-b border-yellow-200">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      </div>
                      Important Information & Guidelines
                    </h3>
                  </div>
                  <div className="p-5">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Maximum advance amount is 2 times monthly salary
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Recovery will start from the next month's salary
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Advance requests will be reviewed within 2-3 working
                          days
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Medical advances require supporting medical documents
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid()}
                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Create Advance Request
                  </button>
                </div>
              </form>
            </div>

            {/* Custom Scrollbar Styles */}
            <style>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #c62828;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #b71c1c;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAdvance && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={`${approvalData.action === "approved" ? "Approve" : "Reject"} Advance Request`}
          size="sm"
        >
          <div className="space-y-3">
            <div className="bg-slate-50 rounded p-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-slate-600">Employee</p>
                  <p className="font-medium text-slate-900">
                    {selectedAdvance.employee_name}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600">Amount</p>
                  <p className="font-medium text-slate-900">
                    ₹{selectedAdvance.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Remarks{" "}
                {approvalData.action === "rejected" && (
                  <span className="text-red-500">*</span>
                )}
              </label>
              <textarea
                value={approvalData.remarks}
                onChange={(e) =>
                  setApprovalData({ ...approvalData, remarks: e.target.value })
                }
                rows={2}
                placeholder={`Enter ${approvalData.action} remarks...`}
                className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowApprovalModal(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button
                variant={
                  approvalData.action === "approved" ? "success" : "danger"
                }
                onClick={handleApprovalAction}
                size="sm"
              >
                {approvalData.action === "approved" ? "Approve" : "Reject"}{" "}
                Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAdvance && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Advance Request Details"
          size="md"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-600">Employee</label>
                <p className="font-medium text-slate-900">
                  {selectedAdvance.employee_name}
                </p>
                <p className="text-slate-600 text-xs">
                  {selectedAdvance.employee_code}
                </p>
              </div>
              <div>
                <label className="text-slate-600">Monthly Salary</label>
                <p className="font-medium text-slate-900">
                  ₹{(selectedAdvance.salary / 12).toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-slate-600">Advance Amount</label>
                <p className="font-medium text-green-600">
                  ₹{selectedAdvance.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-slate-600">Status</label>
                <Badge variant={getStatusColor(selectedAdvance.status)}>
                  {selectedAdvance.status}
                </Badge>
              </div>
              <div>
                <label className="text-slate-600">Installments</label>
                <p className="font-medium text-slate-900">
                  {selectedAdvance.installments} months
                </p>
              </div>
              <div>
                <label className="text-slate-600">Monthly Deduction</label>
                <p className="font-medium text-slate-900">
                  ₹
                  {(
                    selectedAdvance.amount / selectedAdvance.installments
                  ).toLocaleString()}
                </p>
              </div>
              {selectedAdvance.total_recovered !== undefined && (
                <>
                  <div>
                    <label className="text-slate-600">Total Recovered</label>
                    <p className="font-medium text-blue-600">
                      ₹{selectedAdvance.total_recovered.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-slate-600">Balance</label>
                    <p className="font-medium text-orange-600">
                      ₹{selectedAdvance.balance_amount?.toLocaleString()}
                    </p>
                  </div>
                </>
              )}
              <div className="">
                <label className="text-slate-600">Reason</label>
                <p className="font-medium text-slate-900">
                  {selectedAdvance.reason}
                </p>
              </div>
              <div className="">
                <label className="text-slate-600">
                  {selectedAdvance.status === "pending" ||
                  selectedAdvance.status === "approved"
                    ? "Approve "
                    : "Rejection "}{" "}
                  Reason
                </label>
                <p className="font-medium text-slate-900">
                  {selectedAdvance.remark}
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t">
              <Button
                variant="secondary"
                onClick={() => setShowDetailsModal(false)}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Sidebar - Fixed to cover top */}
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
        fixed top-0 right-0 bottom-0
        bg-white shadow-2xl flex flex-col
        transition-transform duration-300 ease-out
        ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}
        w-[90vw] max-w-none
        md:max-w-md md:w-full
      `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-xl font-bold text-white">
                    Advance Filters
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    Filter advance requests by multiple criteria
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={clearAllFilters}
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
              {/* Employee Search */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-[#C62828]" />
                  Employee Name/Code
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Amount Range */}
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#C62828]" />
                  Amount Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full pl-3 pr-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-3 pr-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  Request Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="date"
                      value={searchRequestDate}
                      onChange={(e) => setSearchRequestDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="date"
                      value={searchRequestDate}
                      onChange={(e) => setSearchRequestDate(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Installments */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#C62828]" />
                  Installments
                </label>
                <select
                  value={searchInstallments}
                  onChange={(e) => setSearchInstallments(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all appearance-none"
                >
                  <option value="">All Installments</option>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} month{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C62828]" />
                  Department
                </label>
                <select className="w-full px-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all appearance-none">
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C62828]" />
                  Request Status
                </label>
                <select
                  value={searchStatus}
                  onChange={(e) => setSearchStatus(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all appearance-none"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="disbursed">Disbursed</option>
                  <option value="recovering">Recovering</option>
                  <option value="recovered">Recovered</option>
                </select>
              </div>

              {/* Balance Range */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#C62828]" />
                  Balance Amount (₹)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full pl-3 pr-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full pl-3 pr-3 py-2.5 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Reset All Checkbox */}
              <div className="border-t pt-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={
                      !searchEmployee &&
                      !searchAmount &&
                      !searchReason &&
                      !searchInstallments &&
                      !searchRequestDate &&
                      !searchBalance &&
                      searchStatus === "all"
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        clearAllFilters();
                      }
                    }}
                    className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-700">
                      Clear All Filters
                    </p>
                    <p className="text-[11px] md:text-xs text-gray-500">
                      Reset all filter criteria to show all data
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {(searchEmployee ||
                searchAmount ||
                searchReason ||
                searchInstallments ||
                searchRequestDate ||
                searchBalance ||
                searchStatus !== "all") && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    Active Filters
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {searchEmployee && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] md:text-xs rounded">
                        Employee: {searchEmployee}
                        <button
                          onClick={() => setSearchEmployee("")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {searchStatus !== "all" && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] md:text-xs rounded">
                        Status: {searchStatus}
                        <button
                          onClick={() => setSearchStatus("all")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {searchInstallments && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10px] md:text-xs rounded">
                        Installments: {searchInstallments}
                        <button
                          onClick={() => setSearchInstallments("")}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3 flex-shrink-0">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Reset All
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
    </div>
  );
}
