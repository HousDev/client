/* eslint-disable @typescript-eslint/no-explicit-any */
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
//               s
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
  Square,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  Building,
  Plus,
  CreditCard,
  Package,
  Calculator,
  Truck,
  Box,
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
  const [paymentReminders, setPaymentReminders] = useState<PaymentReminder[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<String>("");

  // Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchPONumber, setSearchPONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchReference, setSearchReference] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [showPaymentProofModal, setShowPaymentProofModal] =
    useState<boolean>(false);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);

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

      const data = poPaymentsRes.map((d: any) => {
        const tempD = newPOData.find((poD: any) => poD.id === d.po_id);
        return {
          ...d,
          purchase_order: tempD,
        };
      });

      setPaymentHistorys(Array.isArray(data) ? data : []);
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
    const totalPaid =
      pos
        .filter(
          (p: any) =>
            p.payment_status === "completed" || p.payment_status === "partial",
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

    let selectedAmount = 0;
    if (selectedItems.size > 0) {
      if (activeTab === "payments") {
        selectedAmount = pos
          .filter((po) => selectedItems.has(po.id))
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
      if (statusFilter !== "all" && statusFilter !== po.payment_status) {
        return false;
      }

      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matches =
          po.po_number?.toLowerCase().includes(searchLower) ||
          po.vendors?.name?.toLowerCase().includes(searchLower) ||
          po.status?.toLowerCase().includes(searchLower) ||
          po.payment_status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (
        searchPONumber &&
        !po.po_number?.toLowerCase().includes(searchPONumber.toLowerCase())
      ) {
        return false;
      }

      if (
        searchVendor &&
        !po.vendors?.name?.toLowerCase().includes(searchVendor.toLowerCase())
      ) {
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
          payment.purchase_order?.po_number
            ?.toLowerCase()
            .includes(searchLower) ||
          payment.purchase_order?.vendors?.name
            ?.toLowerCase()
            .includes(searchLower) ||
          payment.payment_method?.toLowerCase().includes(searchLower) ||
          payment.status?.toLowerCase().includes(searchLower);
        if (!matches) return false;
      }

      if (
        paymentMethodFilter !== "all" &&
        paymentMethodFilter !== payment.payment_method
      ) {
        return false;
      }

      if (
        searchReference &&
        !payment.payment_reference_no
          ?.toLowerCase()
          .includes(searchReference.toLowerCase())
      ) {
        return false;
      }

      if (searchAmount && !String(payment.amount_paid).includes(searchAmount)) {
        return false;
      }

      if (
        searchDate &&
        payment.payment_date &&
        !payment.payment_date.includes(searchDate)
      ) {
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

      if (
        searchDate &&
        reminder.due_date &&
        !reminder.due_date.includes(searchDate)
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
      const allIds = new Set(filtered.map((po) => po.id));
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
    setSearchPONumber("");
    setSearchVendor("");
    setSearchAmount("");
    setSearchDate("");
    setSearchReference("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
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
  };

  const createPaymentReminder = async (payload: any) => {
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
    <div className="p-3 md:p-4 px-0 md:px-0 -mt-5 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-0">
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden">
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

      {/* Bulk Payment Button */}
      {selectedItems.size > 0 && activeTab === "payments" && (
        <div className="mb-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
            <button
              onClick={handleBulkPayment}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-md hover:shadow-lg text-sm whitespace-nowrap"
            >
              <IndianRupee className="w-4 h-4" />
              Pay Selected
            </button>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] lg:min-w-full">
              <thead className="bg-gray-200 border-b border-gray-200">
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
                        value={searchPONumber}
                        onChange={(e) => setSearchPONumber(e.target.value)}
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
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
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
                        value={searchAmount}
                        onChange={(e) => setSearchAmount(e.target.value)}
                        className="w-auto pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  {/* Paid Column - No search */}
                  <td className="px-2 md:px-4 py-1"></td>

                  {/* Balance Column - No search */}
                  <td className="px-2 md:px-4 py-1"></td>

                  {/* Status Search */}
                  <td className="px-2 md:px-4 py-1">
                    <div className="relative">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
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
                {filteredPOs.map((po) => {
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
                          {po.vendors?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="font-semibold text-gray-800 text-xs md:text-sm">
                          {formatCurrency(po.grand_total)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-green-600 font-medium text-xs md:text-sm">
                          {formatCurrency(po.total_paid || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <div className="text-red-600 font-bold text-xs md:text-sm">
                          {formatCurrency(po.balance_amount || 0)}
                        </div>
                      </td>
                      <td className="px-2 md:px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                            po.payment_status,
                          )}`}
                        >
                          {(po.payment_status || "pending").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-2 md:px-4 py-2">
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
                                    po_id: po.id,
                                    po_number: po.po_number,
                                    vendor: po.vendors?.name,
                                    total_amount: po.grand_total,
                                    total_paid: po.total_paid,
                                    balance_amount: po.balance_amount,
                                    due_date: po.due_date,
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
                        {searchPONumber ||
                        searchVendor ||
                        searchAmount ||
                        statusFilter !== "all"
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-200 border-b border-gray-200">
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
                      Proof
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
                        value={searchPONumber}
                        onChange={(e) => setSearchPONumber(e.target.value)}
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
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
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
                        value={searchAmount}
                        onChange={(e) => setSearchAmount(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
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
                        placeholder="Search..."
                        value={searchReference}
                        onChange={(e) => setSearchReference(e.target.value)}
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
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHistory.map((payment: any) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition">
                    <td className="px-2 md:px-4 py-2">
                      <div className="font-bold text-blue-600 text-xs md:text-sm">
                        {payment.purchase_order?.po_number || payment.po_id}
                      </div>
                    </td>
                    <td className="px-2 md:px-4 py-2">
                      <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]">
                        {payment.purchase_order?.vendors?.name || "-"}
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
                        className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-medium  cursor-pointer text-blue-600`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredHistory.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <FileClock className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm md:text-lg font-medium">
                        No payment history found
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        {searchPONumber ||
                        searchVendor ||
                        searchAmount ||
                        searchReference
                          ? "Try adjusting your search"
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
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-200 border-b border-gray-200">
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
                        value={searchPONumber}
                        onChange={(e) => setSearchPONumber(e.target.value)}
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
                        value={searchVendor}
                        onChange={(e) => setSearchVendor(e.target.value)}
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
                        value={searchAmount}
                        onChange={(e) => setSearchAmount(e.target.value)}
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
                        value={searchDate}
                        onChange={(e) => setSearchDate(e.target.value)}
                        className="w-full pl-7 pr-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </td>

                  <td className="px-2 md:px-4 py-1">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
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
                        {searchPONumber || searchVendor || searchAmount
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
                        checked={paymentMethodFilter === method.value}
                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
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
                      {selectedPO.vendors?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Total Amount
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-orange-600">
                      {formatCurrency(selectedPO.grand_total || 0)}
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
