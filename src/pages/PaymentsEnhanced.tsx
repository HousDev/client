import { useState, useEffect } from "react";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Bell,
  IndianRupee,
  FileClock,
  Check,
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

  due_date: string; // ISO date (YYYY-MM-DD)

  status: ReminderStatus;

  seen_by: number | null;

  created_at: string; // ISO timestamp
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

type POReminder = {
  id: string;
  po_payment_id: string;
  reminder_date: string;
  reminder_type?: string;
  status?: string;
  po_payments?: POPayment;
};
type PaymentDataType = {
  id?: number | string | null;
  po_id: number | string | null;
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

export default function PaymentsEnhanced() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "payments" | "reminders" | "history"
  >("payments");
  const [pos, setPOs] = useState<PO[]>([]);
  const [payments, setPayments] = useState<PaymentDataType[]>([]);
  const [paymentHistorys, setPaymentHistorys] = useState<any>([]);
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(
    []
  );
  const [reminders, setReminders] = useState<POReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);

  const [paymentData, setPaymentData] = useState<PaymentDataType>({
    po_id: null,
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

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPaymentForReminder, setSelectedPaymentForReminder] =
    useState<POPayment | null>(null);

  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
  });

  const KEY_REMINDERS = "mock_po_payment_reminders_v1";

  useEffect(() => {
    // when payments/POs change, recalc stats
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, payments]);

  // permission helper: admin or profile.permissions object (if present)
  const can = (permission: string) => {
    if (profile?.role === "admin") return true;
    // support different profile shapes
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
      const poRes: any = await poApi.getPOs();
      const vendorRes: any = await vendorApi.getVendors();
      const newPOData = poRes.map((po: any) => ({
        ...po,
        vendors: vendorRes.find((v: any) => v.id === po.vendor_id),
      }));

      const poPaymentsRes: any = await poPaymentApi.getPayments();

      const data = poPaymentsRes.map((d: any) => {
        const tempD = newPOData.find((poD: any) => poD.id === d.po_id);
        return {
          ...d,
          purchase_order: tempD,
        };
      });

      setPaymentHistorys(Array.isArray(data) ? data : []);
      setPOs(newPOData);
      setLoading(false);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong.");
    }
  };
  const loadPaymentReminders = async () => {
    try {
      const PoPaymentRemindersApiRes =
        await PoPaymentRemindersApi.getReminders();

      console.log("this is payment reminder", PoPaymentRemindersApiRes);

      setPaymentReminders(
        Array.isArray(PoPaymentRemindersApiRes) ? PoPaymentRemindersApiRes : []
      );
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, failed to fetch payment reminders.");
    }
  };

  useEffect(() => {
    loadPaymentReminders();
    loadPOData();
  }, [activeTab]);

  const persistReminders = (newReminders: POReminder[]) => {
    localStorage.setItem(KEY_REMINDERS, JSON.stringify(newReminders));
    setReminders(newReminders);
  };

  const calculateStats = () => {
    console.log("pos", pos);
    const totalPaid =
      pos
        .filter(
          (p: any) =>
            p.payment_status === "completed" || p.payment_status === "partial"
        )
        .reduce((s: any, p: any) => s + (Number(p.total_paid) || 0), 0) || 0;
    console.log("object", totalPaid);

    const totalPending =
      pos
        .filter((po) => (Number(po.balance_amount) || 0) > 0)
        .reduce((s, po) => s + (Number(po.balance_amount) || 0), 0) || 0;

    const totalOverdue =
      pos
        .filter((po) => {
          const dueDate = po.validity_date || po.po_date;
          return (
            (Number(po.balance_amount) || 0) > 0 &&
            dueDate &&
            new Date(dueDate) < new Date()
          );
        })
        .reduce((s, po) => s + (Number(po.balance_amount) || 0), 0) || 0;

    setStats({ totalPaid, totalPending, totalOverdue: 0 });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  // --- Actions (mock localStorage) ---

  const openPaymentModal = (po: PO) => {
    setSelectedPO(po);
    setPaymentData({
      ...paymentData,
      amount_paid: String(po.balance_amount) || String(po.grand_total),
      payment_date: new Date().toISOString().split("T")[0],
      po_id: po.id,
    });
    setShowPaymentModal(true);
  };

  const createPaymentReminder = async (payload: any) => {
    try {
      const paymentReminderRes: any =
        await PoPaymentRemindersApi.createReminder(payload);
      if (paymentReminderRes.success) {
        loadPaymentReminders();
        toast.success("Payment Reminder Created.");
      } else {
        toast.success("Failed to Create Payment Reminder.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, failed to create payment reminder.");
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(paymentData);
    try {
      if (!selectedPO) return;

      if (!can("make_payments")) {
        toast.error("You do not have permission to make payments");
        return;
      }

      if (Number(paymentData.amount_paid) <= 0) {
        toast.error("Enter a valid amount");
        return;
      }
      if ((paymentData.payment_reference_no || "")?.length <= 0) {
        toast.error("Enter Valid Reference Number.");
        return;
      }
      if (!paymentData.payment_proof) {
        toast.error("Upload valid payment proof.");
        return;
      }

      // create payment record
      const newPayment: PaymentDataType = {
        po_id: paymentData.po_id,
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
      const res: any = await poPaymentApi.createPayment(newPayment);
      if (res.success) {
        loadPOData();
        toast.success("Payment recorded successfully.");
        setShowPaymentModal(false);
        setSelectedPO(null);
        setPaymentData({
          po_id: null,
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

        calculateStats();
      } else {
        toast.error("Failed to create payment record");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  const openReminderModal = (payment?: POPayment) => {
    setSelectedPaymentForReminder(payment ?? null);
    setReminderDate(new Date().toISOString().split("T")[0]);
    setShowReminderModal(true);
  };

  const handleCreateReminder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPaymentForReminder) {
      alert("Select a payment to create reminder for");
      return;
    }
    const newReminder: POReminder = {
      id: `r_${Date.now().toString(36)}`,
      po_payment_id: selectedPaymentForReminder.id || "",
      reminder_date: reminderDate,
      reminder_type: "email",
      status: "pending",
      po_payments: selectedPaymentForReminder,
    };
    const updated = [newReminder, ...reminders];
    persistReminders(updated);
    alert("Reminder created (demo).");
    setShowReminderModal(false);
    setSelectedPaymentForReminder(null);
  };

  const markReminderSent = (reminderId: string) => {
    const updated = reminders.map((r) =>
      r.id === reminderId ? { ...r, status: "sent" } : r
    );
    persistReminders(updated);
    alert("Reminder marked as sent (demo).");
  };

  const markReminderSeen = async (payload: any) => {
    try {
      const markReminderSeenRes = await PoPaymentRemindersApi.markAsSeen(
        payload
      );
      if (markReminderSeenRes.success) {
        loadPaymentReminders();
        toast.success("Reminder marked as seen.");
      } else {
        toast.error("Failed to mark reminder as seen.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, try again.");
    }
  };

  const markAllReminderSeen = async () => {
    try {
      const markAllReminderSeenRes = await PoPaymentRemindersApi.markAllAsSeen(
        user?.id
      );
      if (markAllReminderSeenRes.success) {
        loadPaymentReminders();
        toast.success("Marked all reminder as seen.");
      } else {
        toast.error("Failed to mark all reminder as seen.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong, try again.");
    }
  };

  // small helpers
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Payment Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage PO payments and reminders (demo)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalPaid)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalPending)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalOverdue)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-scroll sm:overflow-hidden">
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 px-6 py-4 font-medium transition  ${
              activeTab === "payments"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IndianRupee className="w-5 h-5" />
              <span>PO Payments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileClock className="w-5 h-5" />
              <span>Payment History</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "reminders"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Payment Reminders</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">
                Pending Payments
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      PO Number
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Paid
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Balance
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      PO Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pos.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">
                          {po.po_number}
                        </span>
                        <p className="text-xs text-gray-500">
                          {po.po_date
                            ? new Date(po.po_date).toLocaleDateString()
                            : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {po.vendors?.name}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {formatCurrency(po.grand_total)}
                      </td>
                      <td className="px-6 py-4 text-green-600 font-medium">
                        {formatCurrency(po.total_paid || 0)}
                      </td>
                      <td className="px-6 py-4 text-orange-600 font-bold">
                        {formatCurrency(po.balance_amount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            po.status
                          )}`}
                        >
                          {(po.status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            po.payment_status
                          )}`}
                        >
                          {(po.payment_status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {po.status === "draft" ||
                        po.payment_status === "completed" ? (
                          "--"
                        ) : (
                          <div className="flex gap-2">
                            {can("make_payments") && (
                              <button
                                onClick={() => openPaymentModal(po)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                              >
                                <IndianRupee className="w-4 h-4" />
                                Pay
                              </button>
                            )}
                            {can("make_payments") && (
                              <button
                                onClick={() =>
                                  createPaymentReminder({
                                    po_id: po.id,
                                    po_number: po.po_number,
                                    vendor: po.vendors?.name,
                                    total_amount: po.grand_total,
                                    total_paid: po.total_paid,
                                    balance_amount: po.balance_amount,
                                    due_date: po.due_date,
                                  })
                                }
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
                              >
                                <Bell className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Payment History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    PO Number
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Reference
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentHistorys.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {payment.purchase_order?.po_number || payment.po_id}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {payment.purchase_order?.vendors?.name || "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(payment.amount_paid || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {(payment.payment_method || "")
                        .replace("_", " ")
                        .toUpperCase() || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {payment.payment_reference_no || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          payment.status || ""
                        )}`}
                      >
                        {(payment.status || "pending").toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "reminders" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Payment Reminders
            </h2>
            {paymentReminders.find((d: any) => d.status === "unseen") && (
              <button
                onClick={() => {
                  markAllReminderSeen();
                }}
                className="flex px-3 py-1 justify-center items-center bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
              >
                <Check className="w-4 h-4" /> All Seen
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    PO Number
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Total Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Paid
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Balance Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Due Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Reminder Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paymentReminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {reminder.po_number || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {reminder.vendor || "-"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(reminder.total_amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(reminder.total_paid || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {formatCurrency(reminder.balance_amount || 0)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(reminder.due_date).toLocaleDateString() || "--"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(reminder.created_at).toLocaleDateString() ||
                        "--"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          reminder.status
                        )}`}
                      >
                        {(reminder.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {reminder.status === "unseen" && (
                          <button
                            onClick={() => {
                              markReminderSeen({
                                id: reminder.id,
                                seen_by: user?.id,
                              });
                            }}
                            className="flex px-3 py-1 justify-center items-center bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                          >
                            <Check className="w-4 h-4" /> Seen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <h2 className="text-2xl font-bold text-white">Record Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPO(null);
                  setPaymentData({
                    po_id: null,
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
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleMakePayment}>
              <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-3 h-[60vh] overflow-y-scroll">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">PO Number</p>
                  <p className="font-bold text-gray-800">
                    {selectedPO.po_number}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">Vendor</p>
                  <p className="font-medium text-gray-800">
                    {selectedPO.vendors?.name}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedPO.grand_total || 0)}
                  </p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 font-medium">
                    Balance Amount
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(selectedPO.balance_amount || 0)}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.payment_method || "PAYMENT"}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="PAYMENT">Payment</option>
                    <option value="REFUND">Refund</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={paymentData.amount_paid || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        amount_paid: Number(e.target.value) || "",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0.01"
                    max={selectedPO.balance_amount}
                    step="0.01"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="cash">Cash</option>
                    <option value="online">Online Payment</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Transaction reference"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paymentData.payment_date || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        payment_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentData.status || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        status: e.target.value,
                      })
                    }
                    className="outline-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="success">Success</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Payment Proof <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    id="payment_proof"
                    onChange={handleFileUpload}
                    className="w-full file:px-4 file:py-2 text-sm border file:rounded-l-lg file:border-none file:font-semibold  file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:mr-3 border-gray-300 rounded-lg focus:ring-2  focus:ring-blue-500 focus:border-transparent"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <input
                    type="text"
                    value={paymentData.remarks || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        remarks: e.target.value || "",
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    min="0.01"
                    max={selectedPO.balance_amount}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 sticky bottom-0 bg-white p-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <IndianRupee className="w-5 h-5" /> Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPO(null);
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create Reminder</h2>
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setSelectedPaymentForReminder(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateReminder();
              }}
              className="p-6"
            >
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">
                  Payment
                </label>
                <div className="font-medium text-gray-800">
                  {selectedPaymentForReminder
                    ? `${
                        selectedPaymentForReminder.purchase_orders?.po_number ||
                        selectedPaymentForReminder.po_id
                      } — ${formatCurrency(
                        selectedPaymentForReminder.amount || 0
                      )}`
                    : "Select a payment"}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Date
                </label>
                <input
                  type="date"
                  value={reminderDate}
                  onChange={(e) => setReminderDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Bell className="w-5 h-5" /> Create Reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReminderModal(false);
                    setSelectedPaymentForReminder(null);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
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
