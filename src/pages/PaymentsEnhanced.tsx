// import { useState, useEffect } from "react";
// import {
//   Clock,
//   AlertCircle,
//   CheckCircle,
//   X,
//   Bell,
//   IndianRupee,
//   FileClock,
//   Check,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "sonner";
// import poApi from "../lib/poApi";
// import vendorApi from "../lib/vendorApi";
// import poPaymentApi from "../lib/poPaymentApi";
// import PoPaymentRemindersApi from "../lib/paymentRemindersApi";

// type PO = {
//   id: string;
//   po_number: string;
//   vendors?: any;
//   po_date?: string;
//   due_date: string;
//   grand_total: number;
//   total_paid?: number;
//   balance_amount?: number;
//   payment_status?: string;
//   validity_date?: string;
//   status?: string;
// };

// type ReminderStatus = "seen" | "unseen";

// type PaymentReminder = {
//   id: number;
//   po_id: number;

//   po_number: string;
//   vendor: string;

//   total_amount: number;
//   total_paid: number;
//   balance_amount: number;

//   due_date: string; // ISO date (YYYY-MM-DD)

//   status: ReminderStatus;

//   seen_by: number | null;

//   created_at: string; // ISO timestamp
// };

// type POPayment = {
//   id: string | null;
//   po_id: string | null;
//   amount: number | null;
//   payment_method?: string | null;
//   reference_number?: string | null;
//   payment_date?: string | null;
//   status?: string | null;
//   created_by?: string | null;
//   purchase_orders?: PO | null;
// };

// type POReminder = {
//   id: string;
//   po_payment_id: string;
//   reminder_date: string;
//   reminder_type?: string;
//   status?: string;
//   po_payments?: POPayment;
// };
// type PaymentDataType = {
//   id?: number | string | null;
//   po_id: number | string | null;
//   transaction_type: string | null;
//   amount_paid: string | number | null;
//   payment_method: string | null;
//   payment_reference_no: string | null;
//   payment_proof: File | null;
//   payment_date: string | null;
//   status: string | null;
//   remarks: string | null;
//   purchase_order?: any;
//   created_by: string | null;
// };

// export default function PaymentsEnhanced() {
//   const { user, profile } = useAuth();
//   const [activeTab, setActiveTab] = useState<
//     "payments" | "reminders" | "history"
//   >("payments");
//   const [pos, setPOs] = useState<PO[]>([]);
//   const [payments, setPayments] = useState<PaymentDataType[]>([]);
//   const [paymentHistorys, setPaymentHistorys] = useState<any>([]);
//   const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(
//     []
//   );
//   const [reminders, setReminders] = useState<POReminder[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [selectedPO, setSelectedPO] = useState<PO | null>(null);

//   const [paymentData, setPaymentData] = useState<PaymentDataType>({
//     po_id: null,
//     transaction_type: "payment",
//     amount_paid: "",
//     payment_method: "bank_transfer",
//     payment_reference_no: "",
//     payment_proof: null,
//     payment_date: new Date().toISOString().split("T")[0],
//     status: "pending",
//     remarks: "",
//     created_by: user?.id,
//   });

//   const [showReminderModal, setShowReminderModal] = useState(false);
//   const [reminderDate, setReminderDate] = useState<string>(
//     new Date().toISOString().split("T")[0]
//   );
//   const [selectedPaymentForReminder, setSelectedPaymentForReminder] =
//     useState<POPayment | null>(null);

//   const [stats, setStats] = useState({
//     totalPaid: 0,
//     totalPending: 0,
//     totalOverdue: 0,
//   });

//   const KEY_REMINDERS = "mock_po_payment_reminders_v1";

//   useEffect(() => {
//     // when payments/POs change, recalc stats
//     calculateStats();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pos, payments]);

//   // permission helper: admin or profile.permissions object (if present)
//   const can = (permission: string) => {
//     if (profile?.role === "admin") return true;
//     // support different profile shapes
//     if (
//       (profile as any)?.permissions &&
//       typeof (profile as any).permissions === "object"
//     ) {
//       return Boolean((profile as any).permissions[permission]);
//     }
//     return false;
//   };

//   const loadPOData = async () => {
//     try {
//       const poRes: any = await poApi.getPOs();
//       const vendorRes: any = await vendorApi.getVendors();
//       const newPOData = poRes.map((po: any) => ({
//         ...po,
//         vendors: vendorRes.find((v: any) => v.id === po.vendor_id),
//       }));

//       const poPaymentsRes: any = await poPaymentApi.getPayments();

//       const data = poPaymentsRes.map((d: any) => {
//         const tempD = newPOData.find((poD: any) => poD.id === d.po_id);
//         return {
//           ...d,
//           purchase_order: tempD,
//         };
//       });

//       setPaymentHistorys(Array.isArray(data) ? data : []);
//       setPOs(newPOData);
//       setLoading(false);
//     } catch (err) {
//       console.log(err);
//       toast.error("Something went wrong.");
//     }
//   };
//   const loadPaymentReminders = async () => {
//     try {
//       const PoPaymentRemindersApiRes =
//         await PoPaymentRemindersApi.getReminders();

//       console.log("this is payment reminder", PoPaymentRemindersApiRes);

//       setPaymentReminders(
//         Array.isArray(PoPaymentRemindersApiRes) ? PoPaymentRemindersApiRes : []
//       );
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong, failed to fetch payment reminders.");
//     }
//   };

//   useEffect(() => {
//     loadPaymentReminders();
//     loadPOData();
//   }, [activeTab]);

//   const persistReminders = (newReminders: POReminder[]) => {
//     localStorage.setItem(KEY_REMINDERS, JSON.stringify(newReminders));
//     setReminders(newReminders);
//   };

//   const calculateStats = () => {
//     console.log("pos", pos);
//     const totalPaid =
//       pos
//         .filter(
//           (p: any) =>
//             p.payment_status === "completed" || p.payment_status === "partial"
//         )
//         .reduce((s: any, p: any) => s + (Number(p.total_paid) || 0), 0) || 0;
//     console.log("object", totalPaid);

//     const totalPending =
//       pos
//         .filter((po) => (Number(po.balance_amount) || 0) > 0)
//         .reduce((s, po) => s + (Number(po.balance_amount) || 0), 0) || 0;

//     const totalOverdue =
//       pos
//         .filter((po) => {
//           const dueDate = po.validity_date || po.po_date;
//           return (
//             (Number(po.balance_amount) || 0) > 0 &&
//             dueDate &&
//             new Date(dueDate) < new Date()
//           );
//         })
//         .reduce((s, po) => s + (Number(po.balance_amount) || 0), 0) || 0;

//     setStats({ totalPaid, totalPending, totalOverdue: 0 });
//   };

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount || 0);

//   // --- Actions (mock localStorage) ---

//   const openPaymentModal = (po: PO) => {
//     setSelectedPO(po);
//     setPaymentData({
//       ...paymentData,
//       amount_paid: String(po.balance_amount) || String(po.grand_total),
//       payment_date: new Date().toISOString().split("T")[0],
//       po_id: po.id,
//     });
//     setShowPaymentModal(true);
//   };

//   const createPaymentReminder = async (payload: any) => {
//     try {
//       const paymentReminderRes: any =
//         await PoPaymentRemindersApi.createReminder(payload);
//       if (paymentReminderRes.success) {
//         loadPaymentReminders();
//         toast.success("Payment Reminder Created.");
//       } else {
//         toast.success("Failed to Create Payment Reminder.");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong, failed to create payment reminder.");
//     }
//   };

//   const handleMakePayment = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(paymentData);
//     try {
//       if (!selectedPO) return;

//       if (!can("make_payments")) {
//         toast.error("You do not have permission to make payments");
//         return;
//       }

//       if (Number(paymentData.amount_paid) <= 0) {
//         toast.error("Enter a valid amount");
//         return;
//       }
//       if ((paymentData.payment_reference_no || "")?.length <= 0) {
//         toast.error("Enter Valid Reference Number.");
//         return;
//       }
//       if (!paymentData.payment_proof) {
//         toast.error("Upload valid payment proof.");
//         return;
//       }

//       // create payment record
//       const newPayment: PaymentDataType = {
//         po_id: paymentData.po_id,
//         transaction_type: paymentData.transaction_type?.toUpperCase() || "",
//         amount_paid: paymentData.amount_paid,
//         payment_method: paymentData.payment_method?.toUpperCase() || "",
//         payment_reference_no: paymentData.payment_reference_no,
//         payment_proof: paymentData.payment_proof,
//         payment_date: paymentData.payment_date,
//         status: paymentData.status?.toUpperCase() || "",
//         remarks: paymentData.remarks,
//         created_by: user?.id,
//       };
//       const res: any = await poPaymentApi.createPayment(newPayment);
//       if (res.success) {
//         loadPOData();
//         toast.success("Payment recorded successfully.");
//         setShowPaymentModal(false);
//         setSelectedPO(null);
//         setPaymentData({
//           po_id: null,
//           transaction_type: "payment",
//           amount_paid: "",
//           payment_method: "bank_transfer",
//           payment_reference_no: "",
//           payment_proof: null,
//           payment_date: new Date().toISOString().split("T")[0],
//           status: "pending",
//           remarks: "",
//           created_by: user?.id,
//         });

//         calculateStats();
//       } else {
//         toast.error("Failed to create payment record");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong.");
//     }
//   };

//   const openReminderModal = (payment?: POPayment) => {
//     setSelectedPaymentForReminder(payment ?? null);
//     setReminderDate(new Date().toISOString().split("T")[0]);
//     setShowReminderModal(true);
//   };

//   const handleCreateReminder = (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!selectedPaymentForReminder) {
//       alert("Select a payment to create reminder for");
//       return;
//     }
//     const newReminder: POReminder = {
//       id: `r_${Date.now().toString(36)}`,
//       po_payment_id: selectedPaymentForReminder.id || "",
//       reminder_date: reminderDate,
//       reminder_type: "email",
//       status: "pending",
//       po_payments: selectedPaymentForReminder,
//     };
//     const updated = [newReminder, ...reminders];
//     persistReminders(updated);
//     alert("Reminder created (demo).");
//     setShowReminderModal(false);
//     setSelectedPaymentForReminder(null);
//   };

//   const markReminderSent = (reminderId: string) => {
//     const updated = reminders.map((r) =>
//       r.id === reminderId ? { ...r, status: "sent" } : r
//     );
//     persistReminders(updated);
//     alert("Reminder marked as sent (demo).");
//   };

//   const markReminderSeen = async (payload: any) => {
//     try {
//       const markReminderSeenRes = await PoPaymentRemindersApi.markAsSeen(
//         payload
//       );
//       if (markReminderSeenRes.success) {
//         loadPaymentReminders();
//         toast.success("Reminder marked as seen.");
//       } else {
//         toast.error("Failed to mark reminder as seen.");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong, try again.");
//     }
//   };

//   const markAllReminderSeen = async () => {
//     try {
//       const markAllReminderSeenRes = await PoPaymentRemindersApi.markAllAsSeen(
//         user?.id
//       );
//       if (markAllReminderSeenRes.success) {
//         loadPaymentReminders();
//         toast.success("Marked all reminder as seen.");
//       } else {
//         toast.error("Failed to mark all reminder as seen.");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong, try again.");
//     }
//   };

//   // small helpers
//   const getStatusColor = (status?: string) => {
//     const colors: Record<string, string> = {
//       paid: "bg-green-100 text-green-700",
//       seen: "bg-green-100 text-green-700",
//       unseen: "bg-orange-100 text-orange-700",
//       SUCCESS: "bg-green-100 text-green-700",
//       authorize: "bg-green-100 text-green-700",
//       completed: "bg-green-100 text-green-700",
//       pending: "bg-yellow-100 text-yellow-700",
//       PENDING: "bg-yellow-100 text-yellow-700",
//       approved: "bg-yellow-100 text-yellow-700",
//       overdue: "bg-red-100 text-red-700",
//       FAILED: "bg-red-100 text-red-700",
//       CANCELLED: "bg-red-100 text-red-700",
//       partial: "bg-orange-100 text-orange-700",
//     };
//     return (status && colors[status]) || "bg-gray-100 text-gray-700";
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setPaymentData((prev) => ({ ...prev, payment_proof: file }));
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading payments...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">
//             Payment Management
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Manage PO payments and reminders (demo)
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
//             <CheckCircle className="w-6 h-6 text-green-600" />
//           </div>
//           <p className="text-gray-600 text-sm font-medium mb-1">Total Paid</p>
//           <p className="text-2xl font-bold text-green-600">
//             {formatCurrency(stats.totalPaid)}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
//             <Clock className="w-6 h-6 text-orange-600" />
//           </div>
//           <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
//           <p className="text-2xl font-bold text-orange-600">
//             {formatCurrency(stats.totalPending)}
//           </p>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//           <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
//             <AlertCircle className="w-6 h-6 text-red-600" />
//           </div>
//           <p className="text-gray-600 text-sm font-medium mb-1">Overdue</p>
//           <p className="text-2xl font-bold text-red-600">
//             {formatCurrency(stats.totalOverdue)}
//           </p>
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
//         <div className="flex border-b border-gray-200 overflow-x-scroll sm:overflow-hidden">
//           <button
//             onClick={() => setActiveTab("payments")}
//             className={`flex-1 px-6 py-4 font-medium transition  ${
//               activeTab === "payments"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <IndianRupee className="w-5 h-5" />
//               <span>PO Payments</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("history")}
//             className={`flex-1 px-6 py-4 font-medium transition ${
//               activeTab === "history"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <FileClock className="w-5 h-5" />
//               <span>Payment History</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("reminders")}
//             className={`flex-1 px-6 py-4 font-medium transition ${
//               activeTab === "reminders"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Bell className="w-5 h-5" />
//               <span>Payment Reminders</span>
//             </div>
//           </button>
//         </div>
//       </div>

//       {activeTab === "payments" && (
//         <div className="space-y-6">
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//             <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Pending Payments
//               </h2>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b border-gray-200">
//                   <tr>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       PO Number
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Vendor
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Total Amount
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Paid
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Balance
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       PO Status
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Status
//                     </th>
//                     <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {pos.map((po) => (
//                     <tr key={po.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4">
//                         <span className="font-medium text-blue-600">
//                           {po.po_number}
//                         </span>
//                         <p className="text-xs text-gray-500">
//                           {po.po_date
//                             ? new Date(po.po_date).toLocaleDateString()
//                             : ""}
//                         </p>
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">
//                         {po.vendors?.name}
//                       </td>
//                       <td className="px-6 py-4 font-semibold text-gray-800">
//                         {formatCurrency(po.grand_total)}
//                       </td>
//                       <td className="px-6 py-4 text-green-600 font-medium">
//                         {formatCurrency(po.total_paid || 0)}
//                       </td>
//                       <td className="px-6 py-4 text-orange-600 font-bold">
//                         {formatCurrency(po.balance_amount || 0)}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             po.status
//                           )}`}
//                         >
//                           {(po.status || "pending").toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             po.payment_status
//                           )}`}
//                         >
//                           {(po.payment_status || "pending").toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         {po.status === "draft" ||
//                         po.payment_status === "completed" ? (
//                           "--"
//                         ) : (
//                           <div className="flex gap-2">
//                             {can("make_payments") && (
//                               <button
//                                 onClick={() => openPaymentModal(po)}
//                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
//                               >
//                                 <IndianRupee className="w-4 h-4" />
//                                 Pay
//                               </button>
//                             )}
//                             {can("make_payments") && (
//                               <button
//                                 onClick={() =>
//                                   createPaymentReminder({
//                                     po_id: po.id,
//                                     po_number: po.po_number,
//                                     vendor: po.vendors?.name,
//                                     total_amount: po.grand_total,
//                                     total_paid: po.total_paid,
//                                     balance_amount: po.balance_amount,
//                                     due_date: po.due_date,
//                                   })
//                                 }
//                                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
//                               >
//                                 <Bell className="w-4 h-4" />
//                               </button>
//                             )}
//                           </div>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}

//       {activeTab === "history" && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Payment History
//             </h2>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     PO Number
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Vendor
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Amount
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Method
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Reference
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Date
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Status
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {paymentHistorys.map((payment: any) => (
//                   <tr key={payment.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4">
//                       <span className="font-medium text-blue-600">
//                         {payment.purchase_order?.po_number || payment.po_id}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {payment.purchase_order?.vendors?.name || "-"}
//                     </td>
//                     <td className="px-6 py-4 font-semibold text-green-600">
//                       {formatCurrency(payment.amount_paid || 0)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {(payment.payment_method || "")
//                         .replace("_", " ")
//                         .toUpperCase() || "-"}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {payment.payment_reference_no || "N/A"}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {payment.payment_date
//                         ? new Date(payment.payment_date).toLocaleDateString()
//                         : "-"}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                           payment.status || ""
//                         )}`}
//                       >
//                         {(payment.status || "pending").toUpperCase()}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {activeTab === "reminders" && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Payment Reminders
//             </h2>
//             {paymentReminders.find((d: any) => d.status === "unseen") && (
//               <button
//                 onClick={() => {
//                   markAllReminderSeen();
//                 }}
//                 className="flex px-3 py-1 justify-center items-center bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
//               >
//                 <Check className="w-4 h-4" /> All Seen
//               </button>
//             )}
//           </div>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     PO Number
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Vendor
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Total Amount
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Paid
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Balance Amount
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Due Date
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Reminder Date
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Status
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Action
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {paymentReminders.map((reminder) => (
//                   <tr key={reminder.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4">
//                       <span className="font-medium text-blue-600">
//                         {reminder.po_number || "-"}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {reminder.vendor || "-"}
//                     </td>
//                     <td className="px-6 py-4 font-semibold text-gray-800">
//                       {formatCurrency(reminder.total_amount || 0)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {formatCurrency(reminder.total_paid || 0)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {formatCurrency(reminder.balance_amount || 0)}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {new Date(reminder.due_date).toLocaleDateString() || "--"}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {new Date(reminder.created_at).toLocaleDateString() ||
//                         "--"}
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                           reminder.status
//                         )}`}
//                       >
//                         {(reminder.status || "pending").toUpperCase()}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex gap-2">
//                         {reminder.status === "unseen" && (
//                           <button
//                             onClick={() => {
//                               markReminderSeen({
//                                 id: reminder.id,
//                                 seen_by: user?.id,
//                               });
//                             }}
//                             className="flex px-3 py-1 justify-center items-center bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
//                           >
//                             <Check className="w-4 h-4" /> Seen
//                           </button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Payment Modal */}
//       {showPaymentModal && selectedPO && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
//               <h2 className="text-2xl font-bold text-white">Record Payment</h2>
//               <button
//                 onClick={() => {
//                   setShowPaymentModal(false);
//                   setSelectedPO(null);
//                   setPaymentData({
//                     po_id: null,
//                     transaction_type: "payment",
//                     amount_paid: "",
//                     payment_method: "bank_transfer",
//                     payment_reference_no: "",
//                     payment_proof: null,
//                     payment_date: new Date().toISOString().split("T")[0],
//                     status: "pending",
//                     remarks: "",
//                     created_by: user?.id,
//                   });
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleMakePayment}>
//               <div className="px-6 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-3 h-[60vh] overflow-y-scroll">
//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 font-medium">PO Number</p>
//                   <p className="font-bold text-gray-800">
//                     {selectedPO.po_number}
//                   </p>
//                 </div>

//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 font-medium">Vendor</p>
//                   <p className="font-medium text-gray-800">
//                     {selectedPO.vendors?.name}
//                   </p>
//                 </div>

//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 font-medium">
//                     Total Amount
//                   </p>
//                   <p className="text-2xl font-bold text-orange-600">
//                     {formatCurrency(selectedPO.grand_total || 0)}
//                   </p>
//                 </div>

//                 <div className="mb-4">
//                   <p className="text-sm text-gray-600 font-medium">
//                     Balance Amount
//                   </p>
//                   <p className="text-2xl font-bold text-orange-600">
//                     {formatCurrency(selectedPO.balance_amount || 0)}
//                   </p>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Transaction Type <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={paymentData.payment_method || "PAYMENT"}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         payment_method: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                   >
//                     <option value="PAYMENT">Payment</option>
//                     <option value="REFUND">Refund</option>
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Payment Amount <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={paymentData.amount_paid || ""}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         amount_paid: Number(e.target.value) || "",
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     min="0.01"
//                     max={selectedPO.balance_amount}
//                     step="0.01"
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Payment Method <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={paymentData.payment_method || "bank_transfer"}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         payment_method: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="bank_transfer">Bank Transfer</option>
//                     <option value="cheque">Cheque</option>
//                     <option value="cash">Cash</option>
//                     <option value="online">Online Payment</option>
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Reference Number <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={paymentData.payment_reference_no || ""}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         payment_reference_no: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     placeholder="Transaction reference"
//                   />
//                 </div>

//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Payment Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     value={paymentData.payment_date || ""}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         payment_date: e.target.value,
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Payment Status <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={paymentData.status || ""}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         status: e.target.value,
//                       })
//                     }
//                     className="outline-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="success">Success</option>
//                     <option value="failed">Failed</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Upload Payment Proof <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="file"
//                     required
//                     id="payment_proof"
//                     onChange={handleFileUpload}
//                     className="w-full file:px-4 file:py-2 text-sm border file:rounded-l-lg file:border-none file:font-semibold  file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:mr-3 border-gray-300 rounded-lg focus:ring-2  focus:ring-blue-500 focus:border-transparent"
//                     accept=".pdf,.jpg,.jpeg,.png"
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Remark
//                   </label>
//                   <input
//                     type="text"
//                     value={paymentData.remarks || ""}
//                     onChange={(e) =>
//                       setPaymentData({
//                         ...paymentData,
//                         remarks: e.target.value || "",
//                       })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
//                     min="0.01"
//                     max={selectedPO.balance_amount}
//                     step="0.01"
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 sticky bottom-0 bg-white p-3">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
//                 >
//                   <IndianRupee className="w-5 h-5" /> Record Payment
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowPaymentModal(false);
//                     setSelectedPO(null);
//                   }}
//                   className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Reminder Modal */}
//       {showReminderModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">Create Reminder</h2>
//               <button
//                 onClick={() => {
//                   setShowReminderModal(false);
//                   setSelectedPaymentForReminder(null);
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 handleCreateReminder();
//               }}
//               className="p-6"
//             >
//               <div className="mb-4">
//                 <label className="block text-sm text-gray-600 mb-2">
//                   Payment
//                 </label>
//                 <div className="font-medium text-gray-800">
//                   {selectedPaymentForReminder
//                     ? `${
//                         selectedPaymentForReminder.purchase_orders?.po_number ||
//                         selectedPaymentForReminder.po_id
//                       } — ${formatCurrency(
//                         selectedPaymentForReminder.amount || 0
//                       )}`
//                     : "Select a payment"}
//                 </div>
//               </div>

//               <div className="mb-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Reminder Date
//                 </label>
//                 <input
//                   type="date"
//                   value={reminderDate}
//                   onChange={(e) => setReminderDate(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"
//                 >
//                   <Bell className="w-5 h-5" /> Create Reminder
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowReminderModal(false);
//                     setSelectedPaymentForReminder(null);
//                   }}
//                   className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




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
  Loader2,
  Search,
  CheckSquare,
  Square,
  Filter,
  ChevronDown,
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

const STATUS_FILTERS = [
  { value: "all", name: "All Status" },
  { value: "pending", name: "Pending" },
  { value: "completed", name: "Completed" },
  { value: "partial", name: "Partial" },
  { value: "overdue", name: "Overdue" },
];

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
  const [submitting, setSubmitting] = useState(false);

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPONumber, setSearchPONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchReference, setSearchReference] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedPaymentForReminder, setSelectedPaymentForReminder] =
    useState<POPayment | null>(null);

  // Payment form data
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

  // Stats
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    selectedAmount: 0,
  });

  const KEY_REMINDERS = "mock_po_payment_reminders_v1";

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

      const data = poPaymentsRes.map((d: any) => {
        const tempD = newPOData.find((poD: any) => poD.id === d.po_id);
        return {
          ...d,
          purchase_order: tempD,
        };
      });

      setPaymentHistorys(Array.isArray(data) ? data : []);
      setPOs(newPOData);
      toast.success("Payment data loaded successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Failed to load payment data.");
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentReminders = async () => {
    try {
      const PoPaymentRemindersApiRes = await PoPaymentRemindersApi.getReminders();
      setPaymentReminders(
        Array.isArray(PoPaymentRemindersApiRes) ? PoPaymentRemindersApiRes : []
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
    const totalPaid =
      pos
        .filter(
          (p: any) =>
            p.payment_status === "completed" || p.payment_status === "partial"
        )
        .reduce((s: any, p: any) => s + (Number(p.total_paid) || 0), 0) || 0;

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

    // Calculate selected amount
    let selectedAmount = 0;
    if (selectedItems.size > 0) {
      if (activeTab === "payments") {
        selectedAmount = pos
          .filter(po => selectedItems.has(po.id))
          .reduce((sum, po) => sum + (Number(po.balance_amount) || 0), 0);
      }
    }

    setStats({ totalPaid, totalPending, totalOverdue, selectedAmount });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);

  // Search and filter functions
  const getFilteredPOs = () => {
    return pos.filter((po) => {
      // Status filter
      if (statusFilter !== "all" && statusFilter !== po.payment_status) {
        return false;
      }

      // Search filters
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          po.po_number?.toLowerCase().includes(searchLower) ||
          po.vendors?.name?.toLowerCase().includes(searchLower) ||
          po.status?.toLowerCase().includes(searchLower) ||
          po.payment_status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (searchPONumber && !po.po_number?.toLowerCase().includes(searchPONumber.toLowerCase())) {
        return false;
      }

      if (searchVendor && !po.vendors?.name?.toLowerCase().includes(searchVendor.toLowerCase())) {
        return false;
      }

      if (searchAmount && !String(po.grand_total).includes(searchAmount)) {
        return false;
      }

      if (searchDate && po.po_date && !po.po_date.includes(searchDate)) {
        return false;
      }

      return true;
    });
  };

  const getFilteredHistory = () => {
    return paymentHistorys.filter((payment: any) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          payment.purchase_order?.po_number?.toLowerCase().includes(searchLower) ||
          payment.purchase_order?.vendors?.name?.toLowerCase().includes(searchLower) ||
          payment.payment_method?.toLowerCase().includes(searchLower) ||
          payment.status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (searchReference && !payment.payment_reference_no?.toLowerCase().includes(searchReference.toLowerCase())) {
        return false;
      }

      if (searchAmount && !String(payment.amount_paid).includes(searchAmount)) {
        return false;
      }

      if (searchDate && payment.payment_date && !payment.payment_date.includes(searchDate)) {
        return false;
      }

      return true;
    });
  };

  const getFilteredReminders = () => {
    return paymentReminders.filter((reminder) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          reminder.po_number?.toLowerCase().includes(searchLower) ||
          reminder.vendor?.toLowerCase().includes(searchLower) ||
          reminder.status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (searchDate && reminder.due_date && !reminder.due_date.includes(searchDate)) {
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
      const allIds = new Set(filtered.map(po => po.id));
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
    
    // For demo purposes, show a toast
    toast.success(`Initiating bulk payment for ${selectedItems.size} POs - Total: ${formatCurrency(stats.selectedAmount)}`);
    
    // Clear selection
    setSelectedItems(new Set());
    setSelectAll(false);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSearchPONumber("");
    setSearchVendor("");
    setSearchAmount("");
    setSearchDate("");
    setSearchReference("");
    setStatusFilter("all");
    setShowFilters(false);
    toast.success("Filters reset");
  };

  // Payment actions
  const openPaymentModal = (po: PO) => {
    setSelectedPO(po);
    setPaymentData({
      ...paymentData,
      amount_paid: String(po.balance_amount) || String(po.grand_total),
      payment_date: new Date().toISOString().split("T")[0],
      po_id: po.id,
    });
    setShowPaymentModal(true);
    toast.info(`Processing payment for ${po.po_number}`);
  };

  const createPaymentReminder = async (payload: any) => {
    try {
      const paymentReminderRes = await PoPaymentRemindersApi.createReminder(payload);
      if (paymentReminderRes.success) {
        loadPaymentReminders();
        toast.success("Payment reminder created successfully!");
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
      
      setSubmitting(true);
      const res: any = await poPaymentApi.createPayment(newPayment);
      
      if (res.success) {
        loadPOData();
        toast.success("Payment recorded successfully!");
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
      const markReminderSeenRes = await PoPaymentRemindersApi.markAsSeen(payload);
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
      const markAllReminderSeenRes = await PoPaymentRemindersApi.markAllAsSeen(user?.id);
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
      toast.success("Payment proof uploaded");
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
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] rounded-xl shadow-md p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <IndianRupee className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">Payment Management</h1>
                <p className="text-xs md:text-sm text-white/90 font-medium mt-0.5">
                  Manage PO payments and reminders
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 md:p-6 hover:border-green-500 transition-all duration-200">
          <div className="bg-gradient-to-r from-green-100 to-green-50 p-2 md:p-3 rounded-xl w-fit mb-3 md:mb-4">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Total Paid</p>
          <p className="text-lg md:text-2xl font-bold text-green-600">
            {formatCurrency(stats.totalPaid)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 md:p-6 hover:border-orange-500 transition-all duration-200">
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 p-2 md:p-3 rounded-xl w-fit mb-3 md:mb-4">
            <Clock className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Pending</p>
          <p className="text-lg md:text-2xl font-bold text-orange-600">
            {formatCurrency(stats.totalPending)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 md:p-6 hover:border-red-500 transition-all duration-200">
          <div className="bg-gradient-to-r from-red-100 to-red-50 p-2 md:p-3 rounded-xl w-fit mb-3 md:mb-4">
            <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Overdue</p>
          <p className="text-lg md:text-2xl font-bold text-red-600">
            {formatCurrency(stats.totalOverdue)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 md:p-6 hover:border-blue-500 transition-all duration-200">
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-2 md:p-3 rounded-xl w-fit mb-3 md:mb-4">
            <CheckSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <p className="text-xs md:text-sm text-gray-600 font-medium mb-1">Selected Amount</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600">
            {formatCurrency(stats.selectedAmount)}
          </p>
          {selectedItems.size > 0 && (
            <p className="text-xs text-blue-600 mt-1">{selectedItems.size} item(s) selected</p>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white border-2 border-gray-200 text-gray-700 px-3 md:px-4 py-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center gap-2 font-medium shadow-sm text-xs md:text-sm"
              >
                <Filter className="w-3 h-3 md:w-4 md:h-4" />
                Filters
                {statusFilter !== "all" && (
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                    1
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </button>
              
              {showFilters && (
                <div className="absolute right-0 mt-2 w-48 md:w-56 bg-white shadow-xl border-2 border-gray-200 rounded-xl z-50">
                  <div className="p-3 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-gray-700 text-sm">Filters</h3>
                      <button
                        onClick={resetFilters}
                        className="text-xs text-blue-600 hover:text-blue-700"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-xs md:text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      >
                        {STATUS_FILTERS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={resetFilters}
                        className="w-full py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition"
                      >
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {selectedItems.size > 0 && activeTab === "payments" && (
              <button
                onClick={handleBulkPayment}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 md:px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg text-xs md:text-sm"
              >
                <IndianRupee className="w-3 h-3 md:w-4 md:h-4" />
                Pay Selected ({selectedItems.size})
              </button>
            )}
          </div>
        </div>

        {/* Column-specific search for payments tab */}
        {activeTab === "payments" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">PO Number</label>
              <input
                type="text"
                placeholder="Search PO..."
                value={searchPONumber}
                onChange={(e) => setSearchPONumber(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Vendor</label>
              <input
                type="text"
                placeholder="Search vendor..."
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Amount</label>
              <input
                type="text"
                placeholder="Search amount..."
                value={searchAmount}
                onChange={(e) => setSearchAmount(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Date</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium transition ${
              activeTab === "payments"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <IndianRupee className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">PO Payments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium transition ${
              activeTab === "history"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50 border-r border-gray-200"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileClock className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Payment History</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("reminders")}
            className={`flex-1 px-4 md:px-6 py-3 md:py-4 font-medium transition ${
              activeTab === "reminders"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Payment Reminders</span>
            </div>
          </button>
        </div>
      </div>

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-200 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Pending Payments ({filteredPOs.length})
              </h2>
              {selectedItems.size > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedItems.size} selected • {formatCurrency(stats.selectedAmount)}
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-center w-12">
                      <button
                        onClick={handleSelectAll}
                        className="p-1 hover:bg-gray-300 rounded transition-colors"
                      >
                        {selectAll ? (
                          <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                        )}
                      </button>
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      PO Number
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Total Amount
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Paid
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Balance
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      PO Status
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Payment Status
                    </th>
                    <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPOs.map((po) => {
                    const isSelected = selectedItems.has(po.id);
                    return (
                      <tr 
                        key={po.id} 
                        className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <td className="px-4 md:px-6 py-4 text-center">
                          <button
                            onClick={() => handleSelectItem(po.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span className="font-medium text-blue-600">
                            {po.po_number}
                          </span>
                          <p className="text-xs text-gray-500">
                            {po.po_date
                              ? new Date(po.po_date).toLocaleDateString()
                              : ""}
                          </p>
                        </td>
                        <td className="px-4 md:px-6 py-4 text-gray-700">
                          {po.vendors?.name}
                        </td>
                        <td className="px-4 md:px-6 py-4 font-semibold text-gray-800">
                          {formatCurrency(po.grand_total)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-green-600 font-medium">
                          {formatCurrency(po.total_paid || 0)}
                        </td>
                        <td className="px-4 md:px-6 py-4 text-orange-600 font-bold">
                          {formatCurrency(po.balance_amount || 0)}
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              po.status
                            )}`}
                          >
                            {(po.status || "pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          <span
                            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              po.payment_status
                            )}`}
                          >
                            {(po.payment_status || "pending").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-4">
                          {po.status === "draft" ||
                          po.payment_status === "completed" ? (
                            "--"
                          ) : (
                            <div className="flex flex-col sm:flex-row gap-2">
                              {can("make_payments") && (
                                <button
                                  onClick={() => openPaymentModal(po)}
                                  className="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-xs"
                                >
                                  <IndianRupee className="w-3 h-3" />
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
                                  className="p-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-xs"
                                >
                                  <Bell className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredPOs.length === 0 && (
                <div className="text-center py-12">
                  <IndianRupee className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No payments found
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== "all" ? "Try adjusting your search or filters" : "No pending payments available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-200 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Payment History ({filteredHistory.length})
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search reference..."
                  value={searchReference}
                  onChange={(e) => setSearchReference(e.target.value)}
                  className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                />
                <input
                  type="date"
                  placeholder="Search date..."
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    PO Number
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Method
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Reference
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {payment.purchase_order?.po_number || payment.po_id}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {payment.purchase_order?.vendors?.name || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 font-semibold text-green-600">
                      {formatCurrency(payment.amount_paid || 0)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {(payment.payment_method || "")
                        .replace("_", " ")
                        .toUpperCase() || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {payment.payment_reference_no || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
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
            {filteredHistory.length === 0 && (
              <div className="text-center py-12">
                <FileClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No payment history found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search" : "No payment history available"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reminders Tab */}
      {activeTab === "reminders" && (
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-200 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              Payment Reminders ({filteredReminders.length})
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
              />
              {paymentReminders.find((d: any) => d.status === "unseen") && (
                <button
                  onClick={markAllReminderSeen}
                  className="flex px-3 py-1.5 justify-center items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs sm:text-sm hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <Check className="w-3 h-3 md:w-4 md:h-4" /> Mark All Seen
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-200 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    PO Number
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Total Amount
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Paid
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Balance Amount
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Due Date
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Reminder Date
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-4 md:px-6 py-3 text-xs md:text-sm font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 md:px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {reminder.po_number || "-"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {reminder.vendor || "-"}
                    </td>
                    <td className="px-4 md:px-6 py-4 font-semibold text-gray-800">
                      {formatCurrency(reminder.total_amount || 0)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {formatCurrency(reminder.total_paid || 0)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {formatCurrency(reminder.balance_amount || 0)}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {new Date(reminder.due_date).toLocaleDateString() || "--"}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {new Date(reminder.created_at).toLocaleDateString() || "--"}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span
                        className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          reminder.status
                        )}`}
                      >
                        {(reminder.status || "pending").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex gap-2">
                        {reminder.status === "unseen" && (
                          <button
                            onClick={() => {
                              markReminderSeen({
                                id: reminder.id,
                                seen_by: user?.id,
                              });
                            }}
                            className="flex px-3 py-1.5 justify-center items-center bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl text-xs hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            <Check className="w-3 h-3" /> Seen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredReminders.length === 0 && (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No payment reminders found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? "Try adjusting your search" : "No payment reminders available"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
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
                  toast.info("Payment cancelled");
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 mb-1">PO Number</p>
                  <div className="p-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <p className="font-bold text-gray-800">{selectedPO.po_number}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Vendor</p>
                  <div className="p-2 bg-gray-50 border-2 border-gray-200 rounded-xl">
                    <p className="font-medium text-gray-800">{selectedPO.vendors?.name}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Total Amount</p>
                  <div className="p-2 bg-orange-50 border-2 border-orange-200 rounded-xl">
                    <p className="text-lg font-bold text-orange-600">{formatCurrency(selectedPO.grand_total || 0)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800 mb-1">Balance Amount</p>
                  <div className="p-2 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-lg font-bold text-red-600">{formatCurrency(selectedPO.balance_amount || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Payment Method <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <IndianRupee className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={paymentData.payment_method || "bank_transfer"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <IndianRupee className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={paymentData.amount_paid || ""}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            amount_paid: Number(e.target.value) || "",
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        min="0.01"
                        max={selectedPO.balance_amount}
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="date"
                        value={paymentData.payment_date || ""}
                        onChange={(e) =>
                          setPaymentData({
                            ...paymentData,
                            payment_date: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Reference Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileClock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={paymentData.payment_reference_no || ""}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payment_reference_no: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="Transaction reference"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Upload Payment Proof <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileClock className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="file"
                      required
                      id="payment_proof"
                      onChange={handleFileUpload}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 file:border-none file:bg-gradient-to-r file:from-[#C62828] file:to-red-600 file:text-white file:font-medium file:px-4 file:py-2 file:rounded-lg file:cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Status
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={paymentData.status || ""}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          status: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    >
                      <option value="pending">Pending</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Remarks
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileClock className="w-3.5 h-3.5" />
                    </div>
                    <textarea
                      value={paymentData.remarks || ""}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          remarks: e.target.value || "",
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      rows={2}
                      placeholder="Add any remarks..."
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IndianRupee className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  )}
                  {submitting ? "Processing..." : "Record Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPO(null);
                    toast.info("Payment cancelled");
                  }}
                  className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
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