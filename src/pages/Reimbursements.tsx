import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  Upload,
  X,
  FileText,
  MoreVertical,
  Eye,
  Trash2,
  Calendar,
  ChevronDown,
  AlertCircle,
  ChevronRight,
  Users,
  IndianRupee,
  Building,
  Save,
  Mail,
  Phone,
  CreditCard,
  Percent,
  ChevronLeft,
  UserCheck,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import Swal from "sweetalert2";
import { toast } from "sonner";
import HrmsEmployeesApi, { HrmsEmployee } from "../lib/employeeApi"; // ✅ Import Employee API
import employeeReimbursementApi from "../lib/employeeReimbursementApi";

interface Reimbursement {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  employee_department: string;
  employee_email: string;
  employee_phone: string;
  category: string;
  amount: number;
  description: string;
  receipt_url?: string;
  request_date: string;
  status: "pending" | "approved" | "rejected" | "paid";
  approved_by?: string;
  approved_date?: string;
  payment_date?: string;
  rejection_reason?: string;
}

const mockReimbursements: Reimbursement[] = [
  {
    id: "1",
    employee_id: "EMP001",
    employee_name: "Rajesh Kumar",
    employee_code: "EMP001",
    employee_department: "Engineering",
    employee_email: "rajesh@example.com",
    employee_phone: "+91 9876543210",
    category: "Travel",
    amount: 8500,
    description: "Business trip to Mumbai - Flight tickets and local transport",
    receipt_url: "receipt_001.pdf",
    request_date: "2024-01-15",
    status: "pending",
  },
];

export default function Reimbursements() {
  const [reimbursements, setReimbursements] =
    useState<Reimbursement[]>(mockReimbursements);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: Employee states
  const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // Search states for each column
  const [searchEmployee, setSearchEmployee] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDescription, setSearchDescription] = useState("");
  const [searchRequestDate, setSearchRequestDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("all");

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] =
    useState<Reimbursement | null>(null);

  // More menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Rejection reason
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    employee_id: "",
    category: "Travel",
    amount: "",
    description: "",
    receipt: null as File | null,
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // ✅ NEW: Load employees from API
  const loadEmployees = async () => {
    setLoadingEmployees(true);
    try {
      console.log("🔄 Fetching employees from API...");
      const employeesData = await HrmsEmployeesApi.getEmployees();
      console.log("✅ Employees fetched:", employeesData);

      // Filter only active employees
      const activeEmployees = employeesData.filter(
        (emp: HrmsEmployee) => emp.employee_status === "active",
      );

      setEmployees(activeEmployees);
      console.log(`✅ Loaded ${activeEmployees.length} active employees`);

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
      setLoadingEmployees(false);
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

  // ✅ Load employees on mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadReimbursements = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReimbursements(mockReimbursements);
    } catch (error) {
      console.error("Error loading reimbursements:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ UPDATED: Handle add reimbursement with API employees
  const handleAddReimbursement = async () => {
    console.log("formdata of renbursment : ", formData);

    // try{
    //   const formDataObj = new FormData()
    //   formDataObj.append("employee_id",formData.employee_id)
    //   formDataObj.append("category",formData.category)
    //   formDataObj.append("amount",formData.amount)
    //   formDataObj.append("description",formData.description)
    //   formDataObj.append("doc",formData.receipt)

    //   const reimbursementRes:any =await employeeReimbursementApi.createReimbursement()
    // }catch(error:any){
    //   console.log(error)

    // }

    // Find employee from API data instead of mockEmployees
    const selectedEmployee = employees.find(
      (e) => e.id.toString() === formData.employee_id,
    );

    if (
      !selectedEmployee ||
      !formData.amount ||
      parseFloat(formData.amount) <= 0
    ) {
      toast.error("Please fill all required fields with valid values");
      return;
    }

    // Get employee full name and department
    const employeeName =
      `${selectedEmployee.first_name} ${selectedEmployee.last_name}`.trim();

    const newReimbursement: Reimbursement = {
      id: `REIMB${Date.now()}`,
      employee_id: selectedEmployee.id.toString(),
      employee_name: employeeName,
      employee_code: selectedEmployee.employee_code,
      employee_department: selectedEmployee.department_name || "N/A", // ✅ Use department_name from API
      employee_email: selectedEmployee.email,
      employee_phone: selectedEmployee.phone || "N/A",
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      receipt_url: formData.receipt ? formData.receipt.name : undefined,
      request_date: new Date().toISOString().split("T")[0],
      status: "pending",
    };

    setReimbursements([newReimbursement, ...reimbursements]);
    setShowAddModal(false);
    toast.success("Reimbursement request submitted successfully!");
    resetForm();
  };

  const handleApprove = (id: string) => {
    setReimbursements(
      reimbursements.map((reimb) =>
        reimb.id === id
          ? {
              ...reimb,
              status: "approved",
              approved_by: "Manager",
              approved_date: new Date().toISOString().split("T")[0],
            }
          : reimb,
      ),
    );
    toast.success("Reimbursement approved successfully!");
  };

  const handleRejectSubmit = () => {
    if (!selectedReimbursement || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    setReimbursements(
      reimbursements.map((reimb) =>
        reimb.id === selectedReimbursement.id
          ? { ...reimb, status: "rejected", rejection_reason: rejectionReason }
          : reimb,
      ),
    );
    setShowRejectModal(false);
    setRejectionReason("");
    setSelectedReimbursement(null);
    toast.success("Reimbursement rejected");
  };

  const handlePay = (id: string) => {
    setReimbursements(
      reimbursements.map((reimb) =>
        reimb.id === id
          ? {
              ...reimb,
              status: "paid",
              payment_date: new Date().toISOString().split("T")[0],
            }
          : reimb,
      ),
    );
    toast.success("Payment processed successfully!");
  };

  const handleViewDetails = (reimbursement: Reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setShowDetailsModal(true);
  };

  const handleReject = (reimbursement: Reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setShowRejectModal(true);
  };

  const handleDeleteReimbursement = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete this reimbursement?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setReimbursements(reimbursements.filter((reimb) => reimb.id !== id));
      toast.success("Reimbursement deleted successfully!");
    }
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredReimbursements.map((reimb) => reimb.id));
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
    setSelectAll(newSelected.size === filteredReimbursements.length);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select reimbursements to delete");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${selectedItems.size} reimbursement(s)? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      setReimbursements(
        reimbursements.filter((reimb) => !selectedItems.has(reimb.id)),
      );
      setSelectedItems(new Set());
      setSelectAll(false);
      toast.success(
        `${selectedItems.size} reimbursement(s) deleted successfully!`,
      );
    } catch (error) {
      console.error("Error deleting reimbursements:", error);
      toast.error("Failed to delete reimbursements");
    }
  };

  const clearAllFilters = () => {
    setSearchEmployee("");
    setSearchCategory("all");
    setSearchAmount("");
    setSearchDescription("");
    setSearchRequestDate("");
    setSearchStatus("all");
  };

  const filteredReimbursements = reimbursements.filter((reimbursement) => {
    const matchesEmployee = searchEmployee
      ? reimbursement.employee_name
          .toLowerCase()
          .includes(searchEmployee.toLowerCase()) ||
        reimbursement.employee_code
          .toLowerCase()
          .includes(searchEmployee.toLowerCase())
      : true;

    const matchesCategory =
      searchCategory === "all" || reimbursement.category === searchCategory;
    const matchesAmount = searchAmount
      ? reimbursement.amount.toString().includes(searchAmount)
      : true;

    const matchesDescription = searchDescription
      ? reimbursement.description
          .toLowerCase()
          .includes(searchDescription.toLowerCase())
      : true;

    const matchesRequestDate = searchRequestDate
      ? reimbursement.request_date.includes(searchRequestDate)
      : true;

    const matchesStatus =
      searchStatus === "all" || reimbursement.status === searchStatus;

    return (
      matchesEmployee &&
      matchesCategory &&
      matchesAmount &&
      matchesDescription &&
      matchesRequestDate &&
      matchesStatus
    );
  });

  const stats = {
    pending: reimbursements.filter((r) => r.status === "pending").length,
    approved: reimbursements.filter((r) => r.status === "approved").length,
    paid: reimbursements.filter((r) => r.status === "paid").length,
    totalAmount: reimbursements.reduce((sum, r) => sum + r.amount, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "danger";
      case "paid":
        return "info";
      default:
        return "secondary";
    }
  };

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

      setFormData((prev) => ({ ...prev, receipt: file }));
    }
  };

  // Clear file and preview
  const clearFile = () => {
    setFormData((prev) => ({ ...prev, receipt: null }));
    setFilePreview(null);
    const fileInput = document.getElementById("attachment") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      employee_id: "",
      category: "Travel",
      amount: "",
      description: "",
      receipt: null,
    });
    setFilePreview(null);
  };

  // Check if form is valid
  const isFormValid = () => {
    if (!formData.employee_id || !formData.amount || !formData.description) {
      return false;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      return false;
    }

    if (formData.description.length < 10) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-5">
      {/* Header with Stats Cards and Buttons */}
      {/* Header with Action Buttons - Export, Bulk Actions and Add button in one row */}
      {/* Header with Action Buttons - Export, Bulk Actions and Add button in one row */}
      <div className="sticky top-20 z-10 flex items-center justify-between py-0 px-2 -mt-2 -mb-2">
        {/* Left side - Can be empty or add page title if needed */}
        <div></div>

        {/* Right side - Export, Bulk Actions and Add button */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Export Button - Always visible */}
          <Button
            variant="secondary"
            onClick={() => {
              /* Export functionality */
            }}
            className="text-sm"
          >
            <Download className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {/* Bulk Actions - Only shown when items are selected */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
              {/* Mobile View */}
              <div className="flex items-center gap-2 sm:hidden">
                <div className="bg-blue-100 p-1 rounded">
                  <Receipt className="w-3 h-3 text-blue-600" />
                </div>
                <p className="font-medium text-xs text-gray-800">
                  {selectedItems.size}
                </p>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Del
                </button>
              </div>

              {/* Desktop View */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="bg-blue-100 p-1 rounded">
                  <Receipt className="w-3 h-3 text-blue-600" />
                </div>
                <p className="font-medium text-xs text-gray-800">
                  {selectedItems.size} selected
                </p>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* New Reimbursement Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            className="text-sm bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">New Reimbursement</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Separate row below */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600 mt-0.5">
                {stats.pending}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Approved
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 mt-0.5">
                {stats.approved}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Paid
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 mt-0.5">
                {stats.paid}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Amount
              </p>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
                ₹{(stats.totalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-slate-600" />
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
                    Category
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Request Date
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

                {/* Category Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="Travel">Travel</option>
                    <option value="Food & Meals">Food & Meals</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Internet & Mobile">Internet & Mobile</option>
                    <option value="Other">Other</option>
                  </select>
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

                {/* Description Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search description..."
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
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
                    <option value="paid">Paid</option>
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
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-gray-600">
                        Loading reimbursements...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredReimbursements.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <Receipt className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No Reimbursements Found
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchEmployee || searchCategory !== "all"
                        ? "Try a different search term"
                        : "No reimbursement requests available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReimbursements.map((reimbursement) => {
                  const isSelected = selectedItems.has(reimbursement.id);
                  return (
                    <tr
                      key={reimbursement.id}
                      className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(reimbursement.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">
                            {reimbursement.employee_name}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-600">
                            {reimbursement.employee_code}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <Building className="w-3 h-3 text-gray-400" />
                            <span className="text-[10px] md:text-xs text-gray-500">
                              {reimbursement.employee_department}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge variant="info">{reimbursement.category}</Badge>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-gray-800">
                          ₹{reimbursement.amount.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700 max-w-xs truncate">
                          {reimbursement.description}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {new Date(
                            reimbursement.request_date,
                          ).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge variant={getStatusColor(reimbursement.status)}>
                          {reimbursement.status}
                        </Badge>
                      </td>

                      {/* Actions Column - Only Three-dot menu */}
                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === reimbursement.id
                                ? null
                                : reimbursement.id,
                            )
                          }
                          className="p-1.5 hover:bg-gray-100 rounded transition ml-auto"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {openMenuId === reimbursement.id && (
                          <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li>
                                <button
                                  onClick={() => {
                                    handleViewDetails(reimbursement);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </li>

                              {/* Approve/Reject options only for pending status */}
                              {reimbursement.status === "pending" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() => {
                                        handleApprove(reimbursement.id);
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
                                        handleReject(reimbursement);
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

                              {/* Pay option only for approved status */}
                              {reimbursement.status === "approved" && (
                                <li>
                                  <button
                                    onClick={() => {
                                      handlePay(reimbursement.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                  >
                                    <IndianRupee className="w-4 h-4" />
                                    Pay Now
                                  </button>
                                </li>
                              )}

                              <hr className="my-1" />

                              <li>
                                <button
                                  onClick={() => {
                                    handleDeleteReimbursement(reimbursement.id);
                                    setOpenMenuId(null);
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Reimbursement Modal with matching theme */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => {
              setShowAddModal(false);
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
                    New Reimbursement Request
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Submit a new reimbursement request for approval
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
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
                  handleAddReimbursement();
                }}
                className="space-y-6"
              >
                {/* ✅ UPDATED: Employee Selection - Now from API */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C62828]" />
                    Select Employee <span className="text-red-500">*</span>
                  </label>

                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Users className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.employee_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employee_id: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      required
                      disabled={loadingEmployees}
                    >
                      <option value="" className="text-gray-400">
                        {loadingEmployees
                          ? "Loading employees..."
                          : "Select Employee"}
                      </option>
                      {employees.map((emp) => {
                        const fullName =
                          `${emp.first_name} ${emp.last_name}`.trim();
                        return (
                          <option
                            key={emp.id}
                            value={emp.id.toString()}
                            className="py-2"
                          >
                            {fullName} ({emp.employee_code}) -{" "}
                            {emp.department_name || "N/A"}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* ✅ Show loading or empty state */}
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
                </div>

                {/* Category & Amount Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#C62828]" />
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                        required
                      >
                        <option value="Travel">Travel</option>
                        <option value="Food & Meals">Food & Meals</option>
                        <option value="Accommodation">Accommodation</option>
                        <option value="Equipment">Equipment</option>
                        <option value="Internet & Mobile">
                          Internet & Mobile
                        </option>
                        <option value="Medical">Medical</option>
                        <option value="Fuel">Fuel</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-[#C62828]" />
                      Amount (₹) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <IndianRupee className="w-4 h-4" />
                      </div>
                      <input
                        type="number"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                        min="1"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter amount"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={4}
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 resize-none hover:border-gray-300"
                      placeholder="Describe the expense in detail. Include purpose, date, and other relevant information..."
                      required
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {formData.description.length}/500
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 10 characters required. Please be as detailed as
                    possible.
                  </p>
                </div>

                {/* Document Upload */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#C62828]" />
                    Upload Receipt (Optional)
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
                    {formData.receipt && (
                      <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3 border-b border-blue-200">
                          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            Receipt Preview
                          </h3>
                        </div>

                        <div className="p-4">
                          {/* File Details */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  File Name
                                </p>
                                <p className="text-sm font-medium text-gray-800 truncate">
                                  {formData.receipt.name}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs font-medium text-gray-500">
                                  File Size
                                </p>
                                <p className="text-sm text-gray-700">
                                  {(formData.receipt.size / 1024).toFixed(1)} KB
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
                    Upload supporting receipts like bills, invoices, or tickets.
                    Maximum file size: 5MB. Allowed formats: PDF, JPG, JPEG,
                    PNG.
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
                          Reimbursement requests require manager approval before
                          processing
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Please ensure all receipts are clear and legible
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Reimbursements are typically processed within 5-7
                          working days after approval
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Travel expenses require prior approval for amounts
                          above ₹10,000
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
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid() || loadingEmployees}
                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Submit Request
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

      {/* View Details Modal */}
      {showDetailsModal && selectedReimbursement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowDetailsModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Receipt className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Reimbursement Details
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Complete reimbursement request information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Employee Info */}
                <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <UserCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700">
                          Employee Information
                        </p>
                        <p className="text-xs text-green-600 mt-0.5">
                          Request submitted by employee
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Employee Name
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedReimbursement.employee_name}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Employee Code
                      </p>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedReimbursement.employee_code}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        Department
                      </p>
                      <p className="text-sm text-gray-700">
                        {selectedReimbursement.employee_department}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-700 truncate">
                        {selectedReimbursement.employee_email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reimbursement Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-[#C62828]" />
                      Category
                    </p>
                    <Badge variant="info">
                      {selectedReimbursement.category}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-[#C62828]" />
                      Amount
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{selectedReimbursement.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Description
                  </p>
                  <p className="text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedReimbursement.description}
                  </p>
                </div>

                {/* Status & Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Status
                    </p>
                    <Badge
                      variant={getStatusColor(selectedReimbursement.status)}
                    >
                      {selectedReimbursement.status}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">
                      Request Date
                    </p>
                    <p className="text-gray-900">
                      {new Date(
                        selectedReimbursement.request_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Receipt Section */}
                {selectedReimbursement.receipt_url && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C62828]" />
                      Receipt
                    </p>
                    <Button size="sm" variant="secondary">
                      <FileText className="h-4 w-4 mr-2" />
                      View Receipt ({selectedReimbursement.receipt_url})
                    </Button>
                  </div>
                )}

                {/* Approval Info */}
                {selectedReimbursement.approved_by && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Approved By
                        </p>
                        <p className="font-medium text-gray-900">
                          {selectedReimbursement.approved_by}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 mb-1">
                          Approved Date
                        </p>
                        <p className="text-gray-900">
                          {selectedReimbursement.approved_date &&
                            new Date(
                              selectedReimbursement.approved_date,
                            ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {selectedReimbursement.payment_date && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-800 mb-1">
                      Payment Processed
                    </p>
                    <p className="text-green-700">
                      Payment processed on{" "}
                      {new Date(
                        selectedReimbursement.payment_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Rejection Info */}
                {selectedReimbursement.status === "rejected" &&
                  selectedReimbursement.rejection_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm font-semibold text-red-800 mb-1">
                        Rejection Reason
                      </p>
                      <p className="text-red-700">
                        {selectedReimbursement.rejection_reason}
                      </p>
                    </div>
                  )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowRejectModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-md border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Reject Reimbursement
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Provide reason for rejection
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-red-800 mb-1">
                    Please note:
                  </p>
                  <p className="text-xs text-red-700">
                    Providing a clear reason helps the employee understand why
                    their reimbursement was rejected.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all duration-200 resize-none hover:border-gray-300"
                    rows={4}
                    placeholder="Enter detailed reason for rejecting this reimbursement request..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectionReason.trim()}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

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
                    Filter Reimbursements
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    Apply filters to find specific reimbursements
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
              <div className="space-y-4">
                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  >
                    <option value="all">All Categories</option>
                    <option value="Travel">Travel</option>
                    <option value="Food & Meals">Food & Meals</option>
                    <option value="Accommodation">Accommodation</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Internet & Mobile">Internet & Mobile</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Amount Range (₹)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    />
                    <input
                      type="date"
                      className="w-full px-2 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Department
                  </label>
                  <select className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all">
                    <option value="">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Sales">Sales</option>
                    <option value="Marketing">Marketing</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
              </div>

              {/* Filter Summary */}
              {(searchCategory !== "all" ||
                searchStatus !== "all" ||
                searchEmployee ||
                searchAmount) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    Active Filters
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {searchCategory !== "all" && (
                      <span className="text-[10px] md:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Category: {searchCategory}
                      </span>
                    )}
                    {searchStatus !== "all" && (
                      <span className="text-[10px] md:text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Status: {searchStatus}
                      </span>
                    )}
                    {searchEmployee && (
                      <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Employee: {searchEmployee}
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
