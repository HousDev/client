import { useState, useEffect, useRef } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Bell,
  IndianRupee,
  FileClock,
  Check,
  Loader2,
  Search,
  CheckSquare,
  Filter,
  ChevronDown,
  Eye,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import poApi from "../lib/poApi";
import vendorApi from "../lib/vendorApi";
import poPaymentApi from "../lib/poPaymentApi";
import PoPaymentRemindersApi from "../lib/paymentRemindersApi";

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

export default function PaymentsEnhanced() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "payments" | "reminders" | "history"
  >("payments");
  const [pos, setPOs] = useState<PO[]>([]);
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

  // Search states - Separate for each tab
  const [searchTerm, setSearchTerm] = useState("");

  // PO Payments tab search states
  const [poSearchPONumber, setPoSearchPONumber] = useState("");
  const [poSearchVendor, setPoSearchVendor] = useState("");
  const [poSearchAmount, setPoSearchAmount] = useState("");
  const [poSearchDate, setPoSearchDate] = useState("");
  const [poStatusFilter, setPoStatusFilter] = useState("all");

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

  const [showPaymentProofModal, setShowPaymentProofModal] =
    useState<boolean>(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);

  // Payment form data
  const [paymentData, setPaymentData] = useState<PaymentDataType>({
    po_id: null,
    po_payment_id: null,
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
  }, [pos, payments, selectedItems, activeTab]);

  const can = (permission: string) => {
    if (profile?.role === "admin") return true;
    if (
      (profile as any)?.permissions &&
      typeof (profile as any).permissions === "object"
    ) {
      return Boolean((profile as any).permissions[permission]);
    }
    return false;
  };

  const loadPOData = async () => {
    try {
      setLoading(true);
      const poRes: any = await poApi.getPOs();
      const vendorRes: any = await vendorApi.getVendors();
      const newPOData = poRes.map((po: any) => ({
        ...po,
        vendors: vendorRes.find((v: any) => v.id === po.vendor_id),
      }));

      const poPaymentsRes: any = await poPaymentApi.getPayments();
      const poPaymentHistoryRes: any = await poPaymentApi.getPaymentsHistory();
      console.log(poPaymentsRes);
      console.log(poPaymentHistoryRes);
      setPaymentHistorys(Array.isArray(poPaymentsRes) ? poPaymentsRes : []);
      setPaymentTransactionHistorys(
        Array.isArray(poPaymentHistoryRes) ? poPaymentHistoryRes : [],
      );

      setPOs(newPOData);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentReminders = async () => {
    try {
      const PoPaymentRemindersApiRes =
        await PoPaymentRemindersApi.getReminders();
      setPaymentReminders(
        Array.isArray(PoPaymentRemindersApiRes) ? PoPaymentRemindersApiRes : [],
      );
    } catch (error) {
      console.log(error);
      toast.error("Failed to load payment reminders.");
    }
  };

  useEffect(() => {
    loadPaymentReminders();
    loadPOData();
  }, [activeTab]);

  const calculateStats = () => {
    const parseDDMMYYYY = (dateStr: string) => {
      const [day, month, year] = dateStr.split("/").map(Number);
      return new Date(year, month - 1, day);
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0); // ✅ move outside reduce

    const totalPaid = paymentHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.amount_paid || 0),
      0,
    );

    const totalPending = paymentHistorys.reduce(
      (sum: number, po: any) => sum + Number(po.balance_amount || 0),
      0,
    );

    const totalOverdue = paymentHistorys.reduce((sum: number, po: any) => {
      if (!po.payment_due_date) return sum;

      const dueDate = parseDDMMYYYY(
        new Date(po.payment_due_date).toLocaleDateString(),
      );
      dueDate.setHours(0, 0, 0, 0);

      // ✅ Only overdue if date passed AND balance > 0
      if (dueDate < today && Number(po.balance_amount) > 0) {
        return sum + Number(po.balance_amount);
      }

      return sum;
    }, 0);

    let selectedAmount = 0;

    if (selectedItems.size > 0 && activeTab === "payments") {
      selectedAmount = paymentHistorys
        .filter((po: any) => selectedItems.has(po.id))
        .reduce(
          (sum: number, po: any) => sum + Number(po.balance_amount || 0),
          0,
        );
    }

    setStats({ totalPaid, totalPending, totalOverdue, selectedAmount });
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
    return paymentTransactionHistorys;
    // return paymentHistorys.filter((payment: any) => {
    //   const paymentMethod = (payment.payment_method || "").toLowerCase();
    //   const paymentStatus = (payment.status || "").toLowerCase();

    //   // General search term across multiple fields
    //   if (searchTerm) {
    //     const searchLower = searchTerm.toLowerCase();
    //     const matches =
    //       payment.purchase_order?.po_number
    //         ?.toLowerCase()
    //         .includes(searchLower) ||
    //       payment.purchase_order?.vendors?.name
    //         ?.toLowerCase()
    //         .includes(searchLower) ||
    //       paymentMethod.includes(searchLower) ||
    //       paymentStatus.includes(searchLower) ||
    //       payment.payment_reference_no?.toLowerCase().includes(searchLower);
    //     if (!matches) return false;
    //   }

    //   // PO Number specific search
    //   if (
    //     historySearchPONumber &&
    //     !payment.purchase_order?.po_number
    //       ?.toLowerCase()
    //       .includes(historySearchPONumber.toLowerCase())
    //   ) {
    //     return false;
    //   }

    //   // Vendor specific search
    //   if (
    //     historySearchVendor &&
    //     !payment.purchase_order?.vendors?.name
    //       ?.toLowerCase()
    //       .includes(historySearchVendor.toLowerCase())
    //   ) {
    //     return false;
    //   }

    //   // Amount specific search
    //   if (
    //     historySearchAmount &&
    //     !String(payment.amount_paid || 0).includes(historySearchAmount)
    //   ) {
    //     return false;
    //   }

    //   // Payment method filter
    //   if (historyPaymentMethodFilter !== "all") {
    //     const filterMethod = historyPaymentMethodFilter.toLowerCase();
    //     if (paymentMethod !== filterMethod) {
    //       return false;
    //     }
    //   }

    //   // Reference number search
    //   if (
    //     historySearchReference &&
    //     !payment.payment_reference_no
    //       ?.toLowerCase()
    //       .includes(historySearchReference.toLowerCase())
    //   ) {
    //     return false;
    //   }

    //   // Date search
    //   if (
    //     historySearchDate &&
    //     payment.payment_date &&
    //     !payment.payment_date.includes(historySearchDate)
    //   ) {
    //     return false;
    //   }

    //   // Status filter
    //   if (historyStatusFilter !== "all") {
    //     const filterStatus = historyStatusFilter.toLowerCase();
    //     if (paymentStatus !== filterStatus) {
    //       return false;
    //     }
    //   }

    //   return true;
    // });
  };

  const getFilteredReminders = () => {
    return paymentReminders.filter((reminder) => {
      // Status filter
      if (remindersStatusFilter !== "all") {
        const reminderStatus = (reminder.status || "").toLowerCase();
        const filterStatus = remindersStatusFilter.toLowerCase();
        if (reminderStatus !== filterStatus) {
          return false;
        }
      }

      // PO Number search
      if (
        remindersSearchPONumber &&
        !reminder.po_number
          ?.toLowerCase()
          .includes(remindersSearchPONumber.toLowerCase())
      ) {
        return false;
      }

      // Vendor search
      if (
        remindersSearchVendor &&
        !reminder.vendor
          ?.toLowerCase()
          .includes(remindersSearchVendor.toLowerCase())
      ) {
        return false;
      }

      // Amount search
      if (
        remindersSearchAmount &&
        !String(reminder.balance_amount || 0).includes(remindersSearchAmount)
      ) {
        return false;
      }

      // Date search
      if (
        remindersSearchDate &&
        reminder.due_date &&
        !reminder.due_date.includes(remindersSearchDate)
      ) {
        return false;
      }

      return true;
    });
  };

  // Selection handlers
  const handleSelectAll = () => {
    const filtered = getFilteredPOs();
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds: any = new Set(filtered.map((po: any) => po.id));
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

    const filtered = getFilteredPOs();
    setSelectAll(newSelected.size === filtered.length);
  };

  const handleBulkPayment = () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one PO for bulk payment");
      return;
    }

    toast.success(
      `Initiating bulk payment for ${selectedItems.size} POs - Total: ${formatCurrency(stats.selectedAmount)}`,
    );

    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const resetFilters = () => {
    setSearchTerm("");

    // Reset PO Payments tab filters
    setPoSearchPONumber("");
    setPoSearchVendor("");
    setPoSearchAmount("");
    setPoSearchDate("");
    setPoStatusFilter("all");

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
  const openPaymentModal = (po: any) => {
    console.log("ppo data ", po);
    setSelectedPO(po);
    setPaymentData({
      ...paymentData,
      amount_paid: String(po.balance_amount) || String(po.grand_total),
      payment_date: new Date().toISOString().split("T")[0],
      po_id: po.po_id,
      po_payment_id: po.id,
    });
    setShowPaymentModal(true);
  };

  const createPaymentReminder = async (payload: any) => {
    console.log("payload : ", payload);
    try {
      const paymentReminderRes: any =
        await PoPaymentRemindersApi.createReminder(payload);
      if (paymentReminderRes.success) {
        loadPaymentReminders();
        toast.success(" created successfully!");
      } else {
        toast.error("Failed to create payment reminder");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to create payment reminder");
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedPO) {
        toast.error("No PO selected");
        return;
      }

      if (!can("make_payments")) {
        toast.error("You don't have permission to make payments");
        return;
      }

      if (Number(paymentData.amount_paid) <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      if ((paymentData.payment_reference_no || "")?.length <= 0) {
        toast.error("Enter valid reference number");
        return;
      }

      if (!paymentData.payment_proof) {
        toast.error("Upload valid payment proof");
        return;
      }

      const newPayment: PaymentDataType = {
        po_id: paymentData.po_id,
        po_payment_id: paymentData.po_payment_id,
        transaction_type: paymentData.transaction_type?.toUpperCase() || "",
        amount_paid: paymentData.amount_paid,
        payment_method: paymentData.payment_method?.toUpperCase() || "",
        payment_reference_no: paymentData.payment_reference_no,
        payment_proof: paymentData.payment_proof,
        payment_date: paymentData.payment_date,
        status: paymentData.status?.toUpperCase() || "",
        remarks: paymentData.remarks,
        created_by: user?.id,
      };
      console.log("this is po", newPayment);
      setSubmitting(true);
      const res: any = await poPaymentApi.createPayment(newPayment);

      if (res.success) {
        loadPOData();
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        setSelectedPO(null);
        setPaymentData({
          po_id: null,
          po_payment_id: null,
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
      } else {
        toast.error("Failed to create payment record");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  const markReminderSeen = async (payload: any) => {
    try {
      const markReminderSeenRes =
        await PoPaymentRemindersApi.markAsSeen(payload);
      if (markReminderSeenRes.success) {
        loadPaymentReminders();
        toast.success("Reminder marked as seen!");
      } else {
        toast.error("Failed to mark reminder as seen");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reminder");
    }
  };

  const markAllReminderSeen = async () => {
    try {
      const markAllReminderSeenRes = await PoPaymentRemindersApi.markAllAsSeen(
        user?.id,
      );
      if (markAllReminderSeenRes.success) {
        loadPaymentReminders();
        toast.success("All reminders marked as seen!");
      } else {
        toast.error("Failed to mark all reminders as seen");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update reminders");
    }
  };

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      seen: "bg-green-100 text-green-700",
      unseen: "bg-orange-100 text-orange-700",
      SUCCESS: "bg-green-100 text-green-700",
      authorize: "bg-green-100 text-green-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      PENDING: "bg-yellow-100 text-yellow-700",
      approved: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
      FAILED: "bg-red-100 text-red-700",
      CANCELLED: "bg-red-100 text-red-700",
      partial: "bg-orange-100 text-orange-700",
    };
    return (status && colors[status]) || "bg-gray-100 text-gray-700";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData((prev) => ({ ...prev, payment_proof: file }));
    }
  };

  const filteredPOs = getFilteredPOs();
  const filteredHistory = getFilteredHistory();
  const filteredReminders = getFilteredReminders();

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
      <div className="sticky top-20 z-10 mb-0">
        {/* Compact Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4">
          {/* Total Paid */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2.5 sm:p-3 hover:border-green-500 transition-all duration-200 min-w-0">
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
                  Overdue
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
                  Selected
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

        {/* Tabs */}
        <div className="sticky top-[148px] md:top-[136px] z-20 bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="flex flex-row w-full overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab("payments")}
              className={`flex-1 min-w-[120px] px-3 py-2.5 font-medium transition ${
                activeTab === "payments"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                <IndianRupee className="w-4 h-4" />
                <span className="text-xs sm:text-sm">PO Payments</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`flex-1 min-w-[130px] px-3 py-2.5 font-medium transition ${
                activeTab === "history"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                <FileClock className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Payment History</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("reminders")}
              className={`flex-1 min-w-[150px] px-3 py-2.5 font-medium transition ${
                activeTab === "reminders"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                <Bell className="w-4 h-4" />
                <span className="text-xs sm:text-sm">Payment Reminders</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Payment Button - Fixed positioning */}
      {selectedItems.size > 0 && activeTab === "payments" && (
        <div className="sticky top-[250px] md:top-[250px] z-30 mb-2">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <CheckSquare className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">
                  {selectedItems.size} PO(s) selected • Total:{" "}
                  {formatCurrency(stats.selectedAmount)}
                </p>
                <p className="text-xs text-blue-600">Ready for bulk payment</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="overflow-y-auto max-h-[calc(100vh-340px)] md:max-h-[calc(100vh-280px)]">
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
                      PO NUMBER
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      VENDOR
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      TOTAL
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PAID
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      BALANCE
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Due Date
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ACTIONS
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
                        onChange={(e) => setPoSearchPONumber(e.target.value)}
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
                        onChange={(e) => setPoSearchVendor(e.target.value)}
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
                        onChange={(e) => setPoSearchAmount(e.target.value)}
                        className="w-auto pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  {/* Paid Column - No search */}
                  <td className="px-2 md:px-4 py-1"></td>

                  {/* Balance Column - No search */}
                  <td className="px-2 md:px-4 py-1"></td>

                  {/* Due Date Column - No search */}
                  <td className="px-2 md:px-4 py-1"></td>

                  {/* Status Search */}
                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <select
                        value={poStatusFilter}
                        onChange={(e) => setPoStatusFilter(e.target.value)}
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

                  {/* Actions Column - Filter button */}
                  <td className="px-2 md:px-4 py-1">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[10px] md:text-xs font-medium text-gray-700"
                        title="Advanced Filters"
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        Filters
                      </button>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po: any) => {
                  const isSelected = selectedItems.has(po.id);
                  return (
                    <tr
                      key={po.id}
                      className={`hover:bg-gray-50 transition ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-2 md:px-4 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(po.id)}
                          className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-bold text-blue-600 text-xs md:text-sm">
                          {po.po_number}
                        </div>
                        <div className="text-[10px] md:text-xs text-gray-500">
                          {po.po_date
                            ? new Date(po.po_date).toLocaleDateString()
                            : ""}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]">
                          {po?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-semibold text-gray-800 text-xs md:text-sm">
                          {formatCurrency(po.total_amount)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-green-600 font-medium text-xs md:text-sm">
                          {formatCurrency(po.amount_paid || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.balance_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-medium text-xs md:text-sm">
                          {new Date(po.payment_due_date).toLocaleDateString() ||
                            0}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                            (po.status || "").toLowerCase(),
                          )}`}
                        >
                          {(po.status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        {Number(po.balance_amount) !== 0 ? (
                          <div className="flex gap-1">
                            {can("make_payments") && (
                              <>
                                <button
                                  onClick={() => openPaymentModal(po)}
                                  className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200 flex items-center gap-1 text-[10px] md:text-xs"
                                  title="Make Payment"
                                >
                                  <IndianRupee className="w-3 h-3" />
                                  Pay
                                </button>
                                <button
                                  onClick={() =>
                                    createPaymentReminder({
                                      po_id: po.po_id,
                                      po_payment_id: po.id,
                                      po_number: po.po_number,
                                      vendor: po.name,
                                      total_amount: po.total_amount,
                                      total_paid: po.amount_paid,
                                      balance_amount: po.balance_amount,
                                      due_date: po.payment_due_date,
                                    })
                                  }
                                  className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
                                  title="Set Reminder"
                                >
                                  <Bell className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div>--</div>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredPOs.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <IndianRupee className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm md:text-lg font-medium">
                        No payments found
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        {poSearchPONumber ||
                        poSearchVendor ||
                        poSearchAmount ||
                        poStatusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "No pending payments available"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-298px)] md:max-h-[calc(100vh-270px)]">
            <table className="sticky top-0 z-10 w-full min-w-[800px]">
              <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PO NUMBER
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      VENDOR
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      AMOUNT
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      METHOD
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      REFERENCE
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DATE
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PROOF
                    </div>
                  </th>
                </tr>

                {/* Search Row */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Search className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="PO #..."
                        value={historySearchPONumber}
                        onChange={(e) =>
                          setHistorySearchPONumber(e.target.value)
                        }
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Vendor..."
                        value={historySearchVendor}
                        onChange={(e) => setHistorySearchVendor(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <IndianRupee className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Amount..."
                        value={historySearchAmount}
                        onChange={(e) => setHistorySearchAmount(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={historyPaymentMethodFilter}
                      onChange={(e) =>
                        setHistoryPaymentMethodFilter(e.target.value)
                      }
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Methods</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online</option>
                    </select>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <FileText className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Ref #..."
                        value={historySearchReference}
                        onChange={(e) =>
                          setHistorySearchReference(e.target.value)
                        }
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={historySearchDate}
                        onChange={(e) => setHistorySearchDate(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={historyStatusFilter}
                      onChange={(e) => setHistoryStatusFilter(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[10px] md:text-xs font-medium text-gray-700"
                        title="Advanced Filters"
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        Filters
                      </button>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 md:px-4 py-2">
                      <div className="font-bold text-blue-600 text-xs md:text-sm">
                        {payment?.po_number}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]">
                        {payment?.vendor || "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="font-semibold text-green-600 text-xs md:text-sm">
                        {formatCurrency(payment.amount_paid || 0)}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm">
                        {(payment.payment_method || "")
                          .replace("_", " ")
                          .toUpperCase() || "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm font-mono">
                        {payment.payment_reference_no || "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm">
                        {payment.payment_date
                          ? new Date(payment.payment_date).toLocaleDateString()
                          : "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(payment.status || "")}`}
                      >
                        {(payment.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <button
                        onClick={() => {
                          setShowPaymentProofModal(true);
                          setPaymentProofUrl(payment.payment_proof);
                        }}
                        className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium cursor-pointer text-blue-600 hover:bg-blue-50 transition`}
                        title="View Payment Proof"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center">
                      <FileClock className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm md:text-lg font-medium">
                        No payment history found
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        {historySearchPONumber ||
                        historySearchVendor ||
                        historySearchAmount ||
                        historySearchReference ||
                        historyPaymentMethodFilter !== "all" ||
                        historyStatusFilter !== "all"
                          ? "Try adjusting your search or filters"
                          : "No payment history available"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
                  <h2 className="text-2xl font-bold text-white">
                    Payment Proof
                  </h2>
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
                      src={`${import.meta.env.VITE_API_URL}/uploads/${paymentProofUrl}`}
                      title="Challan PDF"
                      className="w-full h-full border rounded-lg"
                    />
                  ) : (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/uploads/${paymentProofUrl}`}
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
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === "reminders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-270px)]">
            <table className="sticky top-0 z-10 w-full min-w-[1000px]">
              <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PO NUMBER
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      VENDOR
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      BALANCE
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DUE DATE
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      STATUS
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      ACTIONS
                    </div>
                  </th>
                </tr>

                {/* Search Row */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Search className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={remindersSearchPONumber}
                        onChange={(e) =>
                          setRemindersSearchPONumber(e.target.value)
                        }
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={remindersSearchVendor}
                        onChange={(e) =>
                          setRemindersSearchVendor(e.target.value)
                        }
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <IndianRupee className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search..."
                        value={remindersSearchAmount}
                        onChange={(e) =>
                          setRemindersSearchAmount(e.target.value)
                        }
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={remindersSearchDate}
                        onChange={(e) => setRemindersSearchDate(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={remindersStatusFilter}
                      onChange={(e) => setRemindersStatusFilter(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="unseen">Unseen</option>
                      <option value="seen">Seen</option>
                    </select>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <div className="flex gap-1">
                      {paymentReminders.find(
                        (d: any) => d.status === "unseen",
                      ) && (
                        <button
                          onClick={markAllReminderSeen}
                          className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[10px] md:text-xs font-medium text-gray-700"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Mark All Seen
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 md:px-4 py-2">
                      <div className="font-bold text-blue-600 text-xs md:text-sm">
                        {reminder.po_number || "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]">
                        {reminder.vendor || "-"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="font-semibold text-orange-600 text-xs md:text-sm">
                        {formatCurrency(reminder.balance_amount || 0)}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm">
                        {new Date(reminder.due_date).toLocaleDateString() ||
                          "--"}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(reminder.status)}`}
                      >
                        {(reminder.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      {reminder.status === "unseen" && (
                        <button
                          onClick={() => {
                            markReminderSeen({
                              id: reminder.id,
                              seen_by: user?.id,
                            });
                          }}
                          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200 flex items-center gap-1 text-[10px] md:text-xs"
                        >
                          <Check className="w-3 h-3" /> Seen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredReminders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <Bell className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm md:text-lg font-medium">
                        No payment reminders found
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        {remindersSearchPONumber ||
                        remindersSearchVendor ||
                        remindersSearchAmount
                          ? "Try adjusting your search"
                          : "No payment reminders available"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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

      {/* Payment Modal - Keep existing */}
      {showPaymentModal && selectedPO && (
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
                    Record Payment
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    PO: {selectedPO.po_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPO(null);
                  setPaymentData({
                    po_id: null,
                    po_payment_id: null,
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
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    PO Number
                  </p>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-bold text-gray-800">
                      {selectedPO.po_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">Vendor</p>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800">
                      {selectedPO?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Total Amount
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-orange-600">
                      {formatCurrency(selectedPO.total_amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Balance Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(selectedPO.balance_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={paymentData.payment_date || ""}
                      onChange={(e) => {
                        setPaymentData({
                          ...paymentData,
                          payment_date: e.target.value,
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
                      type="number"
                      value={paymentData.amount_paid || ""}
                      onChange={(e) => {
                        if (
                          Number(e.target.value) >
                          Number(selectedPO.balance_amount)
                        ) {
                          toast.warning(
                            "You can not enter amount greater than balance amount",
                          );
                          return;
                        }
                        setPaymentData({
                          ...paymentData,
                          amount_paid: Number(e.target.value) || "",
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      min="0.01"
                      max={selectedPO.balance_amount}
                      step="0.01"
                      required
                    />
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
                      Upload Payment Proof{" "}
                      <span className="text-red-500">*</span>
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
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentData.status || "pending"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
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
              <div className="border-t p-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IndianRupee className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : "Record Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPO(null);
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
