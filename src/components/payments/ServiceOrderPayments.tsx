import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Bell,
  IndianRupee,
  Search,
  CheckSquare,
  ChevronDown,
  User,
  FileText,
  ChevronUp,
  Eye,
  FileCheck2,
  XCircle,
  Check,
  CircleX,
  Loader2,
  Percent,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "sonner";
import vendorApi from "../../lib/vendorApi";
import ServiceOrdersApi from "../../lib/serviceOrderApi";
import woPaymentHistoryApi from "../../lib/woPayments";
import { BiDownArrow, BiUpArrow } from "react-icons/bi";

type PO = {
  id: string;
  po_number: string;
  vendors?: any;
  po_date?: string;
  due_date: string;
  grand_total: number;
  total_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  validity_date?: string;
  status?: string;
};

type ReminderStatus = "seen" | "unseen";

type PaymentReminder = {
  id: number;
  po_id: number;
  po_number: string;
  vendor: string;
  total_amount: number;
  total_paid: number;
  balance_amount: number;
  due_date: string;
  status: ReminderStatus;
  seen_by: number | null;
  created_at: string;
};

type POPayment = {
  id: string | null;
  po_id: string | null;
  amount: number | null;
  payment_method?: string | null;
  reference_number?: string | null;
  payment_date?: string | null;
  status?: string | null;
  created_by?: string | null;
  purchase_orders?: PO | null;
};

type PaymentDataType = {
  id?: number | string | null;
  po_id: number | string | null;
  po_payment_id: number | string | null;
  transaction_type: string | null;
  amount_paid: string | number | null;
  payment_method: string | null;
  payment_reference_no: string | null;
  payment_proof: File | null;
  payment_date: string | null;
  status: string | null;
  remarks: string | null;
  purchase_order?: any;
  created_by: string | null;
};

const STATUS_FILTERS = [
  { value: "all", name: "All Status" },
  { value: "pending", name: "Pending" },
  { value: "completed", name: "Completed" },
  { value: "partial", name: "Partial" },
  { value: "overdue", name: "Overdue" },
  { value: "success", name: "Success" },
];

const PAYMENT_METHODS = [
  { value: "all", name: "All Methods" },
  { value: "bank_transfer", name: "Bank Transfer" },
  { value: "cheque", name: "Cheque" },
  { value: "cash", name: "Cash" },
  { value: "online", name: "Online" },
];

export default function ServiceOrderPayments() {
  const { user, can } = useAuth();

  const [wos, setWOs] = useState<PO[]>([]);
  const [payments, setPayments] = useState<PaymentDataType[]>([]);
  const [paymentHistorys, setPaymentHistorys] = useState<any>([]);
  const [paymentTransactionHistorys, setPaymentTransactionHistorys] =
    useState<any>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(
    [],
  );
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<String>("");
  const [expandPO, setExpandPO] = useState("");

  const [showWoBillModal, setShowWoBillModal] = useState(false);
  const [paymentStatusData, setPaymentStatusData] = useState({
    id: "",
    status: "",
    rejectionReason: "",
    approved_amount_paid: "",
  });
  const [selectedPaymentData, setSelectedPayemntData] = useState({
    id: "",
    transaction_type: "",
    amount_paid: "",
    retention_percent: "",
    payment_method: "",
    payment_date: "",
    payment_due_date: "",
    payment_proof: "",
    payment_reference_no: "",
    status: "",
    remarks: "",
    //bill details
    approved_amount_paid: "",
    bill_amount: "",
    bill_balance: "",
    bill_created_by: "",
    bill_date: "",
    bill_due_date: "",
    bill_id: "",
    bill_number: "",
    bill_proof: "",
    bill_retention: "",
    bill_status: "",
  });

  const [showPaymentRejectionModal, setShowPaymentRejectionModal] =
    useState(false);

  const [showPaymentApprovalModal, setShowPaymentApprovalModal] =
    useState(false);

  // Search states - Separate for each tab
  const [searchTerm, setSearchTerm] = useState("");

  // PO Payments tab search states
  const [poSearchPONumber, setWOsearchPONumber] = useState("");
  const [poSearchVendor, setWOsearchVendor] = useState("");
  const [poSearchAmount, setWOsearchAmount] = useState("");
  const [poSearchDate, setWOsearchDate] = useState("");
  const [poStatusFilter, setWOstatusFilter] = useState("all");

  // History tab search states
  const [historySearchPONumber, setHistorySearchPONumber] = useState("");
  const [historySearchVendor, setHistorySearchVendor] = useState("");
  const [historySearchAmount, setHistorySearchAmount] = useState("");
  const [historySearchDate, setHistorySearchDate] = useState("");
  const [historySearchReference, setHistorySearchReference] = useState("");
  const [historyPaymentMethodFilter, setHistoryPaymentMethodFilter] =
    useState("all");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");

  // Reminders tab search states
  const [remindersSearchPONumber, setRemindersSearchPONumber] = useState("");
  const [remindersSearchVendor, setRemindersSearchVendor] = useState("");
  const [remindersSearchAmount, setRemindersSearchAmount] = useState("");
  const [remindersSearchDate, setRemindersSearchDate] = useState("");
  const [remindersStatusFilter, setRemindersStatusFilter] = useState("all");
  const [showVendorServiceOrders, setShowVendorServiceOrders] = useState<any>(
    [],
  );

  const [showPaymentProofModal, setShowPaymentProofModal] =
    useState<boolean>(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [allVendors, setAllVendors] = useState<any>([]);
  const [selectWorkOrder, setSelectWorkOrder] = useState("");

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  const [adjustWithAdvance, setAdjustWithAdvance] = useState<boolean>(false);

  // Payment form data
  const [paymentData, setPaymentData] = useState<any>({
    po_id: null,
    po_payment_id: null,
    adjust_with_advance: false,
    advance_amount: "",
    retention_percentage: "",
    vendorId: "",
    transaction_type: "payment",
    amount_paid: "",
    payment_method: "bank_transfer",
    payment_reference_no: "",
    payment_proof: null,
    payment_date: new Date().toISOString().split("T")[0],
    status: "pending",
    remarks: "",
    created_by: user?.id,
  });

  // Stats
  const [stats, setStats] = useState({
    totalWoAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    selectedAmount: 0,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersRef.current &&
        !filtersRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    calculateStats();
  }, [wos, payments, selectedItems]);

  function groupByWoId(data: any[]) {
    const grouped = data.reduce((acc: any, item: any) => {
      const key = item.wo_id;

      if (!acc[key]) {
        acc[key] = {
          po_number: item.po_number,
          wo_date: item.po_date,
          vendor: item.vendor,
          wo_advance_amount: item.wo_advance_amount,
          wo_balance_amount: item.wo_balance_amount,
          wo_grand_total: item.wo_grand_total,
          wo_id: item.wo_id,
          wo_retention_amount: item.wo_retention_amount,
          wo_total_paid: item.wo_total_paid,
          wo_payment_status: item.wo_payment_status,
          transactions: [],
        };
      }

      acc[key].transactions.push({
        id: item.id,
        transaction_type: item.transaction_type,
        amount_paid: item.amount_paid,
        retention_percent: item.retention_percent,
        payment_method: item.payment_method,
        payment_date: item.payment_date,
        payment_due_date: item.payment_due_date,
        payment_proof: item.payment_proof,
        payment_reference_no: item.payment_reference_no,
        status: item.status,
        remarks: item.remarks,
        //bill details
        approved_amount_paid: item.approved_amount_paid,
        bill_amount: item.bill_amount,
        bill_balance: item.bill_balance,
        bill_created_by: item.bill_created_by,
        bill_date: item.bill_date,
        bill_due_date: item.bill_due_date,
        bill_id: item.bill_id,
        bill_number: item.bill_number,
        bill_proof: item.bill_proof,
        bill_retention: item.bill_retention,
        bill_status: item.bill_status,
      });

      return acc;
    }, {});

    return Object.values(grouped).sort((a: any, b: any) => b.wo_id - a.wo_id);
  }

  const loadPOData = async () => {
    try {
      setLoading(true);
      const woRes: any = await ServiceOrdersApi.getAll();
      const vendorRes: any = await vendorApi.getVendors();
      const filteredVendors = vendorRes.filter(
        (v: any) => v.category_name === "Service",
      );
      const filteredWos = woRes.filter(
        (wo: any) =>
          wo.payment_status !== "completed" &&
          Number(wo.balance_amount) > 0 &&
          wo.status === "authorize",
      );

      const poPaymentHistoryRes: any =
        await woPaymentHistoryApi.getWoPaymentHistory();
      console.log("History : ", poPaymentHistoryRes);
      const gruopedData = groupByWoId(poPaymentHistoryRes.data);

      console.log("History Grouped : ", gruopedData);
      setPaymentTransactionHistorys(
        Array.isArray(gruopedData) ? gruopedData : [],
      );
      setAllVendors(Array.isArray(filteredVendors) ? filteredVendors : []);

      setWOs(Array.isArray(filteredWos) ? filteredWos : []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPOData();
  }, []);

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // ✅ move outside reduce

    const totalPaid = paymentTransactionHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.wo_total_paid || 0),
      0,
    );

    const totalPending = paymentTransactionHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.wo_balance_amount || 0),
      0,
    );

    const totalAdvance = paymentTransactionHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.wo_advance_amount || 0),
      0,
    );

    const totalRetention = paymentTransactionHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.wo_retention_amount || 0),
      0,
    );

    const woTotal = paymentTransactionHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.wo_grand_total || 0),
      0,
    );

    setStats({
      totalWoAmount: woTotal,
      totalPaid: totalPaid,
      totalPending: totalPending,
      totalOverdue: totalAdvance,
      selectedAmount: totalRetention,
    });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  // Search and filter functions - Updated to use tab-specific states
  const getFilteredPOs = () => {
    // return paymentHistorys;
    return paymentHistorys.filter((po: any) => {
      if (
        poStatusFilter !== "all" &&
        poStatusFilter.toLowerCase() !== po.status.toLowerCase()
      ) {
        return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          po.po_number?.toLowerCase().includes(searchLower) ||
          po?.name?.toLowerCase().includes(searchLower) ||
          po.status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (
        poSearchPONumber &&
        !po.po_number?.toLowerCase().includes(poSearchPONumber.toLowerCase())
      ) {
        return false;
      }

      if (
        poSearchVendor &&
        !po?.name?.toLowerCase().includes(poSearchVendor.toLowerCase())
      ) {
        return false;
      }

      if (poSearchAmount && !String(po.total_amount).includes(poSearchAmount)) {
        return false;
      }

      if (poSearchDate && po.po_date && !po.po_date.includes(poSearchDate)) {
        return false;
      }

      return true;
    });
  };

  const getFilteredHistory = () => {
    // return paymentTransactionHistorys;
    return paymentTransactionHistorys.filter((payment: any) => {
      const paymentStatus = (payment.wo_payment_status || "").toLowerCase();

      // General search term across multiple fields
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          payment.purchase_order?.po_number
            ?.toLowerCase()
            .includes(searchLower) ||
          payment.purchase_order?.vendors?.name
            ?.toLowerCase()
            .includes(searchLower) ||
          paymentStatus.includes(searchLower) ||
          payment.payment_reference_no?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      // PO Number specific search
      if (
        historySearchPONumber &&
        !payment.purchase_order?.po_number
          ?.toLowerCase()
          .includes(historySearchPONumber.toLowerCase())
      ) {
        return false;
      }

      // Vendor specific search
      if (
        historySearchVendor &&
        !payment.purchase_order?.vendors?.name
          ?.toLowerCase()
          .includes(historySearchVendor.toLowerCase())
      ) {
        return false;
      }

      // Amount specific search
      if (
        historySearchAmount &&
        !String(payment.amount_paid || 0).includes(historySearchAmount)
      ) {
        return false;
      }

      // Reference number search
      if (
        historySearchReference &&
        !payment.payment_reference_no
          ?.toLowerCase()
          .includes(historySearchReference.toLowerCase())
      ) {
        return false;
      }

      // Date search
      if (
        historySearchDate &&
        payment.payment_date &&
        !payment.payment_date.includes(historySearchDate)
      ) {
        return false;
      }

      // Status filter
      if (historyStatusFilter !== "all") {
        const filterStatus = historyStatusFilter.toLowerCase();
        if (paymentStatus !== filterStatus) {
          return false;
        }
      }

      return true;
    });
  };

  useEffect(() => {
    getFilteredHistory();
  }, [searchTerm]);

  const resetFilters = () => {
    setSearchTerm("");

    // Reset PO Payments tab filters
    setWOsearchPONumber("");
    setWOsearchVendor("");
    setWOsearchAmount("");
    setWOsearchDate("");
    setWOstatusFilter("all");

    // Reset History tab filters
    setHistorySearchPONumber("");
    setHistorySearchVendor("");
    setHistorySearchAmount("");
    setHistorySearchDate("");
    setHistorySearchReference("");
    setHistoryPaymentMethodFilter("all");
    setHistoryStatusFilter("all");

    // Reset Reminders tab filters
    setRemindersSearchPONumber("");
    setRemindersSearchVendor("");
    setRemindersSearchAmount("");
    setRemindersSearchDate("");
    setRemindersStatusFilter("all");

    setStatusFilter("all");
    setShowFilters(false);
    toast.success("Filters reset");
  };

  // Payment actions

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      seen: "bg-green-100 text-green-700",
      PAYMENT: "bg-green-100 text-green-700",
      ADVANCE: "bg-yellow-100 text-yellow-700",
      unseen: "bg-orange-100 text-orange-700",
      SUCCESS: "bg-green-100 text-green-700",
      authorize: "bg-green-100 text-green-700",
      completed: "bg-green-100 text-green-700",
      COMPLETED: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      approved: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
      FAILED: "bg-red-100 text-red-700",
      CANCELLED: "bg-red-100 text-red-700",
      REJECTED: "bg-red-100 text-red-700",
      rejected: "bg-red-100 text-red-700",
      partial: "bg-orange-100 text-orange-700",
      PARTIAL: "bg-orange-100 text-orange-700",
    };
    return (status && colors[status]) || "bg-gray-100 text-gray-700";
  };

  const handleSelectAll = () => {
    const filtered = getFilteredPOs();
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds: any = new Set(filtered.map((po: any) => po.po_id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const filteredPOs = getFilteredPOs();

  const approveWoBillStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id: paymentStatusData.id,
        status: "pending",
        rejectionReason: "",
        approved_amount_paid: selectedPaymentData.approved_amount_paid,
        amount_paid: selectedPaymentData.amount_paid,
        wo_id: selectedPaymentData.bill_id,
      };
      console.log(payload);
      const paymentRes: any = await woPaymentHistoryApi.updateWoPaymentStatus(
        paymentStatusData.id,
        payload,
      );

      if (paymentRes.success) {
        loadPOData();
        setShowPaymentApprovalModal(false);

        setPaymentStatusData({
          id: "",
          status: "",
          rejectionReason: "",
          approved_amount_paid: "",
        });

        setSelectedPayemntData({
          id: "",
          transaction_type: "",
          amount_paid: "",
          retention_percent: "",
          payment_method: "",
          payment_date: "",
          payment_due_date: "",
          payment_proof: "",
          payment_reference_no: "",
          status: "",
          remarks: "",
          //bill details
          approved_amount_paid: "",
          bill_amount: "",
          bill_balance: "",
          bill_created_by: "",
          bill_date: "",
          bill_due_date: "",
          bill_id: "",
          bill_number: "",
          bill_proof: "",
          bill_retention: "",
          bill_status: "",
        });
        toast.success(paymentRes.message);
      } else {
        toast.error(paymentRes.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Error", error.response.data.messge);
    }
  };
  const rejectWoBillStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        status: "rejected",
        rejectionReason: paymentStatusData.rejectionReason,
        approved_amount_paid: selectedPaymentData.approved_amount_paid,
        wo_id: selectedPaymentData.bill_id,
      };
      const paymentRes: any = await woPaymentHistoryApi.updateWoPaymentStatus(
        paymentStatusData.id,
        payload,
      );

      console.log("bill res : ", paymentRes);
      if (paymentRes.success) {
        loadPOData();
        setShowPaymentApprovalModal(false);
        setShowPaymentRejectionModal(false);

        setPaymentStatusData({
          id: "",
          status: "",
          rejectionReason: "",
          approved_amount_paid: "",
        });

        setSelectedPayemntData({
          id: "",
          transaction_type: "",
          amount_paid: "",
          retention_percent: "",
          payment_method: "",
          payment_date: "",
          payment_due_date: "",
          payment_proof: "",
          payment_reference_no: "",
          status: "",
          remarks: "",
          //bill details
          approved_amount_paid: "",
          bill_amount: "",
          bill_balance: "",
          bill_created_by: "",
          bill_date: "",
          bill_due_date: "",
          bill_id: "",
          bill_number: "",
          bill_proof: "",
          bill_retention: "",
          bill_status: "",
        });
        toast.success(paymentRes.message);
      } else {
        toast.error(paymentRes.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error("Error", error.response.data.messge);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData((prev: any) => ({ ...prev, payment_proof: file }));
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (
        Number(paymentData.wo_balance_amount) -
          Number(paymentData.approved_amount_paid) <=
          Number(paymentData.wo_advance_amount) &&
        Number(paymentData.wo_advance_amount) !== 0 &&
        Number(paymentData.advance_amount) !== Number(paymentData.approved_amount_paid)
      ) {
        toast.error("Adjust payment with advance advance correctly.");  
        return;
      }

      // toast.success("success");

      // return;
      console.log("payment data : ", paymentData);
      const payload = {
        ...paymentData,
        advance_amount: paymentData.advance_amount ?? 0,
        status: "success",
      };

      const paymentRes: any = await woPaymentHistoryApi.updateWoPaymentHistory(
        paymentData.id,
        payload,
      );
      if (paymentRes.success) {
        loadPOData();
        toast.success(paymentRes.message);
        setShowPaymentRequestModal(false);
        setPaymentData({
          po_id: null,
          po_payment_id: null,
          adjust_with_advance: false,
          advance_amount: "",
          retention_percentage: "",
          vendorId: "",
          transaction_type: "payment",
          amount_paid: "",
          payment_method: "bank_transfer",
          payment_reference_no: "",
          payment_proof: null,
          payment_date: new Date().toISOString().split("T")[0],
          status: "success",
          remarks: "",
          created_by: user?.id,
        });
      } else {
        toast.error(paymentRes.message);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 px-0 md:px-0 -mt-5 bg-gray-50 ">
      {/* Header */}
      <div className="sticky top-36 z-10 mb-0">
        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 md:gap-3 mb-8 ">
          {/* Total Paid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-green-500 transition-all duration-200  min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Total WO Amount
                </p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 mt-1 break-all leading-tight">
                  {formatCurrency(stats.totalWoAmount)}
                </p>
              </div>
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-green-500 transition-all duration-200  min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Total Paid
                </p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-green-600 mt-1 break-all leading-tight">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-orange-500 transition-all duration-200 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Pending
                </p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-orange-600 mt-1 break-all leading-tight">
                  {formatCurrency(stats.totalPending)}
                </p>
              </div>
              <div className="bg-orange-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-red-500 transition-all duration-200 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Advance
                </p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-red-600 mt-1 break-all leading-tight">
                  {formatCurrency(stats.totalOverdue)}
                </p>
              </div>
              <div className="bg-red-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </div>

          {/* Selected */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-blue-500 transition-all duration-200 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] sm:text-xs text-gray-600 font-medium">
                  Retention
                </p>
                <p className="text-sm sm:text-base md:text-lg font-bold text-blue-600 mt-1 break-all leading-tight">
                  {formatCurrency(stats.selectedAmount)}
                </p>
                {selectedItems.size > 0 && (
                  <p className="text-[11px] text-blue-600 mt-0.5">
                    {selectedItems.size} item(s)
                  </p>
                )}
              </div>
              <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg shrink-0">
                <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-y-auto max-h-[calc(100vh-340px)] md:max-h-[calc(93vh-280px)]">
          <table className="sticky top-0 z-10 w-full min-w-[820px] lg:min-w-full">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-2 md:px-4 py-2 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO NUMBER
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    VENDOR
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO TOTAL AMOUNT
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO TOTAL PAID
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO TOTAL BALANCE
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO TOTAL ADVANCE
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO TOTAL RETENTION
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO PAYMENT STATUS
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-2 md:px-4 py-1"></td>

                {/* PO Number Search */}
                <td className="px-2 md:px-4 py-1">
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <Search className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={poSearchPONumber}
                      // onChange={(e) => setPoSearchPONumber(e.target.value)}
                      className="w-auto pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </td>

                {/* Vendor Search */}
                <td className="px-2 md:px-4 py-1">
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={poSearchVendor}
                      // onChange={(e) => setPoSearchVendor(e.target.value)}
                      className="w-auto pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </td>

                {/* Total Search */}
                <td className="px-2 md:px-4 py-1">
                  <div className="relative">
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                      <IndianRupee className="w-3 h-3 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={poSearchAmount}
                      // onChange={(e) => setPoSearchAmount(e.target.value)}
                      className="w-auto pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </td>

                {/* Paid Column - No search */}
                <td className="px-2 md:px-4 py-1"></td>

                {/* Balance Column - No search */}
                {/* <td className="px-2 md:px-4 py-1"></td> */}

                {/* Due Date Column - No search */}
                <td className="px-2 md:px-4 py-1"></td>
                <td className="px-2 md:px-4 py-1"></td>
                <td className="px-2 md:px-4 py-1"></td>

                {/* Status Search */}
                <td className="px-2 md:px-4 py-1">
                  <div className="relative">
                    <select
                      value={poStatusFilter}
                      // onChange={(e) => setPoStatusFilter(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="partial">Partial</option>
                      <option value="overdue">Overdue</option>
                    </select>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentTransactionHistorys.map((po: any) => {
                const isSelected = selectedItems.has(po.wo_id);
                return (
                  <React.Fragment>
                    <tr
                      key={po.po_id}
                      onClick={() => {
                        setSelectWorkOrder(
                          selectWorkOrder === ""
                            ? po.wo_id
                            : selectWorkOrder === po.wo_id
                              ? ""
                              : po.wo_id,
                        );
                      }}
                      className={`hover:bg-gray-50 transition ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-2 md:px-4 py-2 text-center flex space-x-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          // onChange={() => handleSelectItem(po.po_id)}
                          className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        {selectWorkOrder === po.wo_id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-bold text-blue-600 text-xs md:text-sm">
                          {po.po_number}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-500">
                          {po.wo_date
                            ? new Date(po.wo_date).toLocaleDateString()
                            : ""}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]">
                          {po?.vendor || "N/A"}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-semibold text-gray-800 text-xs md:text-sm">
                          {formatCurrency(po.wo_grand_total)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-green-600 font-medium text-xs md:text-sm">
                          {formatCurrency(po.wo_total_paid || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.wo_balance_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.wo_advance_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.wo_retention_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                            (po.wo_payment_status || "").toLowerCase(),
                          )}`}
                        >
                          {(po.wo_payment_status || "pendings").toUpperCase()}
                        </span>
                      </td>
                    </tr>
                    {Number(selectWorkOrder) === Number(po.wo_id) && (
                      <tr className="bg-gray-50">
                        <td colSpan={10} className="p-0">
                          <div className="px-3 py-2 border-t border-gray-200">
                            <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Work Order Payment Transactions {po.po_number}
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full bg-white rounded-lg border border-gray-200 min-w-[600px]">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      WO NUMBER
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      TRANSACTION TYPE
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      BILL NUMBER
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      DATE
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      AMOUNT
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      RETENTION %
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      METHOD
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      REFERENCE
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      STATUS
                                    </th>
                                    <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                      ACTIONS
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {po.transactions.map(
                                    (transaction: any, idx: number) => {
                                      return (
                                        <tr
                                          key={transaction.id}
                                          className={`hover:bg-gray-50 ${
                                            idx % 2 === 0
                                              ? "bg-white"
                                              : "bg-gray-50/50"
                                          }`}
                                        >
                                          <td className="px-2 py-1.5">
                                            <div
                                              className="font-medium text-gray-800 text-xs truncate max-w-[150px]"
                                              title={po.po_number || "Unknown"}
                                            >
                                              {po.po_number || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              WO Date: {po.wo_date || "N/A"}
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 font-medium  text-xs">
                                            {transaction.transaction_type}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium  text-xs">
                                            {transaction.bill_number || "--"}
                                          </td>
                                          <td className="px-2 py-1.5 text-gray-700 text-xs">
                                            {new Date(
                                              transaction.payment_date || "",
                                            ).toLocaleDateString() || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-green-600 text-xs">
                                            {transaction.approved_amount_paid}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-red-600 text-xs">
                                            {transaction.retention_percent ||
                                              "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-red-600 text-xs">
                                            {transaction.payment_method || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-red-600 text-xs">
                                            {transaction.payment_reference_no ||
                                              "-"}
                                          </td>

                                          <td className="px-2 py-1.5">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                                transaction.status,
                                              )} whitespace-nowrap`}
                                            >
                                              {transaction.status?.toUpperCase() ||
                                                "PENDING"}
                                            </span>
                                          </td>
                                          <td className="px-2 md:px-4 py-2">
                                            {can("verify_payments") &&
                                              transaction.payment_proof && (
                                                <button
                                                  onClick={() => {
                                                    setShowPaymentProofModal(
                                                      true,
                                                    );
                                                    setPaymentProofUrl(
                                                      transaction.payment_proof,
                                                    );
                                                  }}
                                                  className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium cursor-pointer text-blue-600 hover:bg-blue-50 transition`}
                                                  title="View Payment Proof"
                                                >
                                                  <Eye className="w-4 h-4" />
                                                </button>
                                              )}

                                            {can("verify_payments") &&
                                              transaction.status ===
                                                "PENDING" && (
                                                <button
                                                  onClick={() => {
                                                    setShowPaymentRequestModal(
                                                      true,
                                                    );
                                                    console.log(po);
                                                    console.log(transaction);
                                                    const retentionAmount =
                                                      (Number(
                                                        transaction.approved_amount_paid,
                                                      ) *
                                                        Number(
                                                          transaction.bill_retention,
                                                        )) /
                                                      100;
                                                    console.log(
                                                      "retention Amount : ",
                                                      retentionAmount,
                                                    );
                                                    setPaymentData({
                                                      ...transaction,
                                                      vendor: po.vendor,
                                                      so_number: po.po_number,
                                                      retention_amount:
                                                        retentionAmount,
                                                      payment_method:
                                                        "bank_transfer",
                                                      paid_on: new Date()
                                                        .toISOString()
                                                        .split("T")[0],
                                                      wo_advance_amount:
                                                        po.wo_advance_amount,
                                                      wo_balance_amount:
                                                        po.wo_balance_amount,
                                                      advance_amount: "0",
                                                    });
                                                  }}
                                                  className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium cursor-pointer text-green-600 hover:bg-green-50 transition`}
                                                  title="View Payment Proof"
                                                >
                                                  <IndianRupee className="w-4 h-4" />
                                                </button>
                                              )}

                                            {/* {transaction.status === "DRAFT" && (
                                              <button
                                                onClick={() => {
                                                  setPaymentStatusData({
                                                    id: transaction.id,
                                                    status: "pending",
                                                    rejectionReason: "",
                                                    approved_amount_paid: "",
                                                  });
                                                  setSelectedPayemntData(
                                                    transaction,
                                                  );
                                                  setShowPaymentApprovalModal(
                                                    true,
                                                  );
                                                }}
                                                className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium cursor-pointer text-green-600 hover:bg-green-50 transition`}
                                                title="View Payment Proof"
                                              >
                                                <FileCheck2 className="w-4 h-4" />
                                              </button>
                                            )} */}
                                          </td>
                                        </tr>
                                      );
                                    },
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showPaymentRequestModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-lg border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Pay Payment Request
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Pay payment request for the bill.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentRequestModal(false);
                  setPaymentData({
                    po_id: null,
                    po_payment_id: null,
                    adjust_with_advance: false,
                    advance_amount: "",
                    retention_percentage: "",
                    vendorId: "",
                    transaction_type: "payment",
                    amount_paid: "",
                    payment_method: "bank_transfer",
                    payment_reference_no: "",
                    payment_proof: null,
                    payment_date: new Date().toISOString().split("T")[0],
                    status: "pending",
                    remarks: "",
                    created_by: user?.id,
                  });
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleMakePayment}
              className="pt-4 pl-4 pb-4 max-h-[calc(90vh-80px)] "
            >
              <div className="overflow-y-scroll max-h-[calc(80vh-80px)] grid grid-cols-1 md:grid-cols-2 gap-3 pr-4 scrollbar-thin">
                <div className="space-y-1 col-span-1 md:col-span-2 hidden">
                  <p className="text-xs font-semibold text-gray-800">
                    Transaction Type
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-yellow-600">
                      {paymentData?.transaction_type || "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Bill Number
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-yellow-600">
                      {paymentData?.bill_number || "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">Vendor</p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-yellow-600">
                      {paymentData?.vendor || "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Work Order
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-yellow-600">
                      {paymentData?.so_number || "--"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Total Bill Amount
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-orange-600">
                      {formatCurrency(paymentData?.bill_amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Bill Balance Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(paymentData?.bill_balance || 0)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Bill Paid Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(paymentData?.bill_paid || 0)}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Retention Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600 flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {paymentData?.retention_amount || 0}
                    </p>
                  </div>
                  <p className="text-slate-600 text-xs">
                    Retention amount is {paymentData.bill_retention}% of{" "}
                    {paymentData.approved_amount_paid}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Work Order Total Advance Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600 flex items-center">
                      <IndianRupee className="w-4 h-4" />
                      {paymentData?.wo_advance_amount || 0}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Created On <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.payment_date.split("T")[0] || ""}
                    readOnly
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Payment Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.payment_due_date || ""}
                    readOnly
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.paid_on || ""}
                    onChange={(e) => {
                      setPaymentData({
                        ...paymentData,
                        paid_on: e.target.value,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.approved_amount_paid || ""}
                    onChange={(e) => {
                      if (!/^\d*\.?\d*$/.test(e.target.value)) return;

                      if (
                        Number(e.target.value) >
                          Number(paymentData.amount_paid) ||
                        (Number(e.target.value) >
                          Number(paymentData.wo_advance_amount) &&
                          Number(paymentData.wo_advance_amount) !== 0)
                      ) {
                        return;
                      }
                      console.log(
                        "payment data from input fields : ",
                        paymentData,
                      );
                      const retentionAmount =
                        (Number(e.target.value) *
                          Number(paymentData.bill_retention)) /
                        100;
                      setPaymentData({
                        ...paymentData,
                        approved_amount_paid: e.target.value,
                        retention_amount: retentionAmount,
                      });
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    required
                  />
                </div>

                {Number(paymentData.wo_advance_amount) !== 0 && (
                  <div className="space-y-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={adjustWithAdvance}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPaymentData({
                            ...paymentData,
                            advance_amount: "0",
                          });
                        }
                        setAdjustWithAdvance(!adjustWithAdvance);
                      }}
                      className="w-4 h-4 accent-[#b52124] cursor-pointer mt-0.5 mr-2"
                    />
                    <label className="block text-xs font-semibold text-gray-800">
                      Adjust with advance
                    </label>
                  </div>
                )}

                {adjustWithAdvance && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Amount To Adjust in Advance{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentData.advance_amount || ""}
                      onChange={(e) => {
                        if (
                          !/^\d*\.?\d*$/.test(e.target.value) ||
                          Number(e.target.value) >
                          Number(paymentData.wo_advance_amount) 
                        ) {
                          return;
                        }
                        setPaymentData({
                          ...paymentData,
                          advance_amount: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.payment_method || "bank_transfer"}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Reference Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.payment_reference_no || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_reference_no: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    placeholder="Transaction reference"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Upload Payment Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    id="payment_proof"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none file:border-none file:bg-gradient-to-r file:from-[#C62828] file:to-red-600 file:text-white file:font-medium file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2 mb-3">
                  <label className="block text-xs font-semibold text-gray-800">
                    Remarks
                  </label>
                  <textarea
                    value={paymentData.remarks || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        remarks: e.target.value || "",
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    rows={2}
                    placeholder="Add any remarks..."
                  />
                </div>
              </div>
              {/* Modal Footer */}
              <div className="border-t  py-3 px-3 flex gap-2 col-span-2 sticky bottom-0 bg-white justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className=" bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IndianRupee className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : "Pay"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentRequestModal(false);
                    setPaymentData({
                      po_id: null,
                      po_payment_id: null,
                      adjust_with_advance: false,
                      advance_amount: "",
                      retention_percentage: "",
                      vendorId: "",
                      transaction_type: "payment",
                      amount_paid: "",
                      payment_method: "bank_transfer",
                      payment_reference_no: "",
                      payment_proof: null,
                      payment_date: new Date().toISOString().split("T")[0],
                      status: "pending",
                      remarks: "",
                      created_by: user?.id,
                    });
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPaymentProofModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
                  px-6 py-4 flex justify-between items-center
                  rounded-t-2xl border-b border-white/10
                  backdrop-blur-md"
            >
              <h2 className="text-2xl font-bold text-white">Payment Proof</h2>
              <button
                onClick={() => {
                  setShowPaymentProofModal(false);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-scroll h-[500px]">
              {paymentProofUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${import.meta.env.VITE_API_URL}${paymentProofUrl}`}
                  title="Challan PDF"
                  className="w-full h-full border rounded-lg"
                />
              ) : (
                <img
                  src={`${import.meta.env.VITE_API_URL}${paymentProofUrl}`}
                  alt=""
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="flex justify-end gap-3 p-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentProofModal(false);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filters Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilters(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="bg-red-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="space-y-2">
                  {STATUS_FILTERS.map((filter) => (
                    <label
                      key={filter.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={filter.value}
                        checked={statusFilter === filter.value}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {filter.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="method"
                        value={method.value}
                        checked={historyPaymentMethodFilter === method.value}
                        onChange={(e) =>
                          setHistoryPaymentMethodFilter(e.target.value)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {method.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {showPaymentApprovalModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Approve WO Payment
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Approve Work Order Payment
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentApprovalModal(false);
                  setPaymentStatusData({
                    id: "",
                    status: "",
                    rejectionReason: "",
                    approved_amount_paid: "",
                  });
                  setSelectedPayemntData({
                    id: "",
                    transaction_type: "",
                    amount_paid: "",
                    retention_percent: "",
                    payment_method: "",
                    payment_date: "",
                    payment_due_date: "",
                    payment_proof: "",
                    payment_reference_no: "",
                    status: "",
                    remarks: "",
                    //bill details
                    approved_amount_paid: "",
                    bill_amount: "",
                    bill_balance: "",
                    bill_created_by: "",
                    bill_date: "",
                    bill_due_date: "",
                    bill_id: "",
                    bill_number: "",
                    bill_proof: "",
                    bill_retention: "",
                    bill_status: "",
                  });
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={approveWoBillStatus}
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="bg-white shadow-lg p-3 mb-3 border">
                <div className="flex justify-between ">
                  <h1 className="text-sm font-semibold text-slate-600 mb-3">
                    Bill Details
                  </h1>
                  <button
                    type="button"
                    onClick={() => {
                      setShowWoBillModal(true);
                      setPaymentProofUrl(selectedPaymentData.bill_proof);
                    }}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 text-white py-1 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    View Bill
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Bill Number
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.bill_number || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none  bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Bill Total Amount
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.bill_amount || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Bill Total Balalnce
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.bill_balance || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Bill Total Paid Amount
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={
                        Number(selectedPaymentData.bill_amount) -
                        Number(selectedPaymentData.bill_balance)
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Bill Retention %
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.bill_retention}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Date
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.bill_date}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-lg p-3 ">
                <div className="flex justify-between">
                  <h1 className="text-sm font-semibold text-slate-600 mb-3">
                    Payment Details
                  </h1>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Date
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={
                        selectedPaymentData.payment_date
                          ? new Date(selectedPaymentData.payment_date)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Due Date
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.payment_due_date || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Retention Amount
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={
                        (Number(selectedPaymentData.approved_amount_paid) *
                          Number(selectedPaymentData.bill_retention)) /
                        100
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Amount To Pay
                    </label>
                    <input
                      type=" text"
                      readOnly
                      value={selectedPaymentData.amount_paid || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none bg-slate-100"
                      placeholder="Add any remarks..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Approve Amount To Pay
                    </label>
                    <input
                      type=" text"
                      onChange={(e) => {
                        const value = e.target.value;

                        // allow only numbers + decimal
                        if (!/^\d*\.?\d*$/.test(value)) return;

                        // allow empty
                        if (
                          value !== "" &&
                          Number(value) >
                            Number(selectedPaymentData.amount_paid)
                        ) {
                          return;
                        }

                        setSelectedPayemntData({
                          ...selectedPaymentData,
                          approved_amount_paid: e.target.value,
                        });
                      }}
                      value={selectedPaymentData.approved_amount_paid || ""}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      placeholder="Add any remarks..."
                    />
                  </div>
                </div>
              </div>

              <div className="border-t p-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentRejectionModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <CircleX className="w-4 h-4" /> Reject Payment
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#28c640] to-green-600 text-white py-2 px-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <CircleX className="w-4 h-4" /> Approve Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentApprovalModal(false);
                    setPaymentStatusData({
                      id: "",
                      status: "",
                      rejectionReason: "",
                      approved_amount_paid: "",
                    });
                    setSelectedPayemntData({
                      id: "",
                      transaction_type: "",
                      amount_paid: "",
                      retention_percent: "",
                      payment_method: "",
                      payment_date: "",
                      payment_due_date: "",
                      payment_proof: "",
                      payment_reference_no: "",
                      status: "",
                      remarks: "",
                      //bill details
                      approved_amount_paid: "",
                      bill_amount: "",
                      bill_balance: "",
                      bill_created_by: "",
                      bill_date: "",
                      bill_due_date: "",
                      bill_id: "",
                      bill_number: "",
                      bill_proof: "",
                      bill_retention: "",
                      bill_status: "",
                    });
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      {showWoBillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
                              px-6 py-4 flex justify-between items-center
                              rounded-t-2xl border-b border-white/10
                              backdrop-blur-md"
            >
              <h2 className="text-2xl font-bold text-white">
                Work Worder Bill
              </h2>
              <button
                onClick={() => {
                  setShowWoBillModal(false);
                  setPaymentProofUrl("");
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="overflow-y-scroll h-[500px]">
              {paymentProofUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={`${import.meta.env.VITE_API_URL}${paymentProofUrl}`}
                  title="Challan PDF"
                  className="w-full h-full border rounded-lg"
                />
              ) : (
                <img
                  src={`${import.meta.env.VITE_API_URL}${paymentProofUrl}`}
                  alt=""
                  className="w-full h-full"
                />
              )}
            </div>
            <div className="flex justify-end gap-3 p-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowWoBillModal(false);
                  setPaymentProofUrl("");
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentRejectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Reject WO Payment
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Reject Work Order Payment
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentRejectionModal(false);
                  setPaymentStatusData({
                    id: "",
                    status: "",
                    rejectionReason: "",
                    approved_amount_paid: "",
                  });
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={rejectWoBillStatus}
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-800">
                  Work Order Payment Rejection Reason
                </label>
                <textarea
                  value={paymentStatusData.rejectionReason || ""}
                  onChange={(e) =>
                    setPaymentStatusData({
                      ...paymentStatusData,
                      rejectionReason: e.target.value || "",
                    })
                  }
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  rows={2}
                  placeholder="Add any remarks..."
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t p-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <CircleX className="w-4 h-4" /> Reject Work Order Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentRejectionModal(false);
                    setPaymentStatusData({
                      id: "",
                      status: "",
                      rejectionReason: "",
                      approved_amount_paid: "",
                    });
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
