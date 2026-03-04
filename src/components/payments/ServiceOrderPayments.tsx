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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<String>("");
  const [expandPO, setExpandPO] = useState("");

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
        payment_proof: item.payment_proof,
        payment_reference_no: item.payment_reference_no,
        status: item.status,
        remarks: item.remarks,
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
                          {formatCurrency(po.wo_balance_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.wo_balance_amount || 0)}
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
                              Purchase Order Payment Transactions {po.po_number}
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
                                      PROOF
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
                                              PO Date: {po.wo_date || "N/A"}
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 font-medium  text-xs">
                                            {transaction.transaction_type}
                                          </td>
                                          <td className="px-2 py-1.5 text-gray-700 text-xs">
                                            {new Date(
                                              transaction.payment_date || "",
                                            ).toLocaleDateString() || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-green-600 text-xs">
                                            {transaction.amount_paid}
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
                                            {can("verify_payments") && (
                                              <button
                                                onClick={() => {
                                                  console.log(
                                                    transaction.payment_proof,
                                                  );
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
    </div>
  );
}
