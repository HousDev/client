// import React, { SetStateAction } from "react";
// import {
//   X,
//   Calendar,
//   Package,
//   UserRound,
//   Phone,
//   MapPin,
//   Wrench,
//   Building,
//   Layers,
//   Home,
//   Truck,
//   FileText,
//   ChevronRight,
//   Hash,
//   AlertCircle,
//   CheckCircle,
//   TrendingUp,
//   TrendingDown,
// } from "lucide-react";

// interface TransactionData {
//   transaction_id: number;
//   po_number: string;
//   challan_number: string;
//   challan_image: string;
//   vender_name: string;
//   issue_date: string;
//   trasaction_type: string;
//   created_at: string;
//   purpose: string;
//   receiver_name: string;
//   receiver_number: string;
//   project_name: string;
//   building_name: string;
//   floor_name: string;
//   delivery_location: string;
//   remark: string;
//   flat_name: string;
//   common_area_name: string | null;
//   vendor_name: string;
//   receiving_date: string;
//   receiver_phone: string;
//   items: Array<{
//     item_id: string;
//     transaction_item_id: number;
//     item_name: string;
//     quantity_issued: number;
//     initial_quantity: number;
//   }>;
// }

// interface TransactionDetailsModalProps {
//   transaction: TransactionData;
//   setIsOpen: React.Dispatch<SetStateAction<boolean>>;
//   transactionType: string;
// }

// export default function ViewTransaction({
//   transaction,
//   setIsOpen,
//   transactionType,
// }: TransactionDetailsModalProps) {
//   // Calculate totals
//   const totals = {
//     issued: transaction.items.reduce(
//       (sum, item) => sum + item.quantity_issued,
//       0
//     ),
//     remaining: transaction.items.reduce(
//       (sum, item) => sum + (item.initial_quantity - item.quantity_issued),
//       0
//     ),
//   };

//   // Get transaction type color - ALL using issueMaterial blue theme
//   const getTransactionTypeColor = () => {
//     // All transaction types use blue gradient
//     return "bg-gradient-to-r from-blue-600 to-indigo-600";
//   };

//   // Get transaction type title
//   const getTransactionTitle = () => {
//     switch (transactionType) {
//       case "issueMaterial":
//         return "Material Issue";
//       case "MaterialIn":
//         return "Material In";
//       case "MaterialOut":
//         return "Material Out";
//       default:
//         return "Transaction";
//     }
//   };

//   // Get section styling based on transaction type - ALL using issueMaterial blue theme
//   const getSectionStyle = () => {
//     // All transaction types use the same blue styling
//     return {
//       gradient: "from-blue-50 to-indigo-50",
//       border: "border-blue-100",
//       iconBg: "bg-blue-100",
//       iconColor: "text-blue-600",
//       textColor: "text-blue-600",
//       statGradient: "from-blue-50 to-indigo-50",
//       statBorder: "border-blue-100",
//       tableHeader: "from-blue-50 to-indigo-50/50",
//       issuedColor: {
//         bg: "bg-blue-100",
//         text: "text-blue-600",
//         icon: "text-blue-600",
//       },
//     };
//   };

//   const sectionStyle = getSectionStyle();

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200/50">
//         {/* Header */}
//         <div
//           className={`${getTransactionTypeColor()} px-6 py-4 relative overflow-hidden`}
//         >
//           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
//           <div className="relative z-10 flex justify-between items-center">
//             <div className="flex items-center gap-4">
//               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//                 <Hash className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
//                   <span className="font-medium">{getTransactionTitle()}</span>
//                   <ChevronRight className="w-3 h-3" />
//                   <span>Transaction Details</span>
//                 </div>
//                 <p className="text-white/80 text-sm mt-1">
//                   Created on{" "}
//                   {new Date(
//                     transaction.created_at || transaction.issue_date
//                   ).toLocaleDateString("en-US", {
//                     weekday: "long",
//                     year: "numeric",
//                     month: "long",
//                     day: "numeric",
//                   })}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
//           {transactionType === "issueMaterial" && (
//             <div className="space-y-6">
//               {/* Basic Information */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
//                     <Wrench className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       Basic Information
//                     </h3>
//                     <p className="text-gray-500 text-sm">
//                       Transaction details and purpose
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Issue Date
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {new Date(transaction.issue_date).toLocaleDateString(
//                             "en-US",
//                             {
//                               weekday: "short",
//                               year: "numeric",
//                               month: "short",
//                               day: "numeric",
//                             }
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Wrench className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Purpose
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg capitalize">
//                           {transaction.purpose}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Truck className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">Vendor</div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.vendor_name}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Project
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.project_name}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Receiver
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.receiver_name}
//                         </div>
//                         <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
//                           <Phone className="w-3 h-3" />
//                           {transaction.receiver_number}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Location Details */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
//                     <MapPin className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       Location Details
//                     </h3>
//                     <p className="text-gray-500 text-sm">
//                       Material delivery location
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-5">
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <div className="p-2 bg-white rounded-lg shadow-sm">
//                         <Building
//                           className={`w-5 h-5 ${sectionStyle.iconColor}`}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500">Building</div>
//                         <div className="font-medium text-gray-800">
//                           {transaction.building_name}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <div className="p-2 bg-white rounded-lg shadow-sm">
//                         <Layers
//                           className={`w-5 h-5 ${sectionStyle.iconColor}`}
//                         />
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500">Floor</div>
//                         <div className="font-medium text-gray-800">
//                           {transaction.floor_name}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-5">
//                     <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <div className="p-2 bg-white rounded-lg shadow-sm">
//                         <Home className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500">Flat</div>
//                         <div className="font-medium text-gray-800">
//                           {transaction.flat_name || "N/A"}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
//                       <div className="p-2 bg-white rounded-lg shadow-sm">
//                         <div className="w-5 h-5 flex items-center justify-center text-gray-600">
//                           CA
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500">Common Area</div>
//                         <div className="font-medium text-gray-800">
//                           {transaction.common_area_name || "N/A"}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {transactionType === "MaterialIn" && (
//             <div className="space-y-6">
//               {/* Basic Information */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
//                     <Package className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       Receiving Information
//                     </h3>
//                     <p className="text-gray-500 text-sm">
//                       Material receipt details
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Receiving Date
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {new Date(
//                             transaction.receiving_date
//                           ).toLocaleDateString("en-US", {
//                             weekday: "short",
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           PO Number
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.po_number}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Truck className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">Vendor</div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.vender_name}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Delivery Location
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.delivery_location}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Receiver
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.receiver_name}
//                         </div>
//                         <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
//                           <Phone className="w-3 h-3" />
//                           {transaction.receiver_phone}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Challan Number
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.challan_number}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {transactionType === "MaterialOut" && (
//             <div className="space-y-6">
//               {/* Basic Information */}
//               <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
//                     <Truck className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                   </div>
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       Dispatch Information
//                     </h3>
//                     <p className="text-gray-500 text-sm">
//                       Material dispatch details
//                     </p>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Receiving Date
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {new Date(
//                             transaction.receiving_date
//                           ).toLocaleDateString("en-US", {
//                             weekday: "short",
//                             year: "numeric",
//                             month: "short",
//                             day: "numeric",
//                           })}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <Wrench className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Transaction Type
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.trasaction_type}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Remarks
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg capitalize">
//                           {transaction.remark}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-5">
//                     <div className="flex items-start gap-3">
//                       <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Delivery Location
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.delivery_location}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                       <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
//                       <div className="flex-1">
//                         <div className="text-sm text-gray-500 mb-1">
//                           Receiver
//                         </div>
//                         <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
//                           {transaction.receiver_name}
//                         </div>
//                         <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
//                           <Phone className="w-3 h-3" />
//                           {transaction.receiver_phone}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Items Section */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
//                   <Layers className={`w-5 h-5 ${sectionStyle.iconColor}`} />
//                 </div>
//                 <div>
//                   <h3 className="text-lg font-semibold text-gray-800">
//                     Items Details
//                   </h3>
//                   <p className="text-gray-500 text-sm">
//                     Material quantities and stock information
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="border border-gray-200 rounded-xl overflow-hidden">
//               <table className="w-full">
//                 <thead
//                   className={`bg-gradient-to-r ${sectionStyle.tableHeader}`}
//                 >
//                   <tr>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
//                       <div className="flex items-center gap-2">
//                         <span>Item Name</span>
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
//                       <div className="flex items-center gap-2">
//                         <span>Initial Stock</span>
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
//                       <div className="flex items-center gap-2">
//                         <span>
//                           {transactionType === "MaterialIn"
//                             ? "Received"
//                             : "Issued"}
//                         </span>
//                       </div>
//                     </th>
//                     <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
//                       <div className="flex items-center gap-2">
//                         <span>
//                           {transactionType === "MaterialIn"
//                             ? "Total Stock"
//                             : "Remaining"}
//                         </span>
//                       </div>
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-100">
//                   {transaction.items.map((item) => {
//                     const remaining =
//                       transactionType === "MaterialIn"
//                         ? item.initial_quantity + item.quantity_issued
//                         : item.initial_quantity - item.quantity_issued;

//                     return (
//                       <tr
//                         key={item.transaction_item_id}
//                         className="hover:bg-gray-50/50 transition-colors group"
//                       >
//                         <td className="px-6 py-4 border-r border-gray-200">
//                           <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
//                             {item.item_name}
//                           </div>
//                           <div className="text-xs text-gray-500 mt-1">
//                             ID: {item.item_id}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 border-r border-gray-200">
//                           <div className="text-gray-700 font-medium">
//                             {item.initial_quantity}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 border-r border-gray-200">
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`p-1.5 rounded-lg ${sectionStyle.iconBg}`}
//                             >
//                               {transactionType === "MaterialIn" ? (
//                                 <TrendingUp
//                                   className={`w-4 h-4 ${sectionStyle.iconColor}`}
//                                 />
//                               ) : (
//                                 <TrendingDown
//                                   className={`w-4 h-4 ${sectionStyle.iconColor}`}
//                                 />
//                               )}
//                             </div>
//                             <span
//                               className={`font-bold ${sectionStyle.textColor}`}
//                             >
//                               {item.quantity_issued}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <div
//                               className={`p-1.5 rounded-lg ${
//                                 remaining >= 0 ? "bg-green-100" : "bg-red-100"
//                               }`}
//                             >
//                               {remaining >= 0 ? (
//                                 <CheckCircle className="w-4 h-4 text-green-600" />
//                               ) : (
//                                 <AlertCircle className="w-4 h-4 text-red-600" />
//                               )}
//                             </div>
//                             <span
//                               className={`font-bold ${
//                                 remaining >= 0
//                                   ? "text-green-600"
//                                   : "text-red-600"
//                               }`}
//                             >
//                               {remaining}
//                             </span>
//                           </div>
//                         </td>
//                       </tr>
//                     );
//                   })}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* Footer Actions */}
//           <div className="pt-6 border-t border-gray-200/50 flex justify-end gap-3">
//             <button
//               onClick={() => setIsOpen(false)}
//               className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
//             >
//               Close Detai
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { SetStateAction } from "react";
import {
  X,
  Calendar,
  Package,
  UserRound,
  Phone,
  MapPin,
  Wrench,
  Building,
  Layers,
  Home,
  Truck,
  FileText,
  ChevronRight,
  Hash,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface TransactionData {
  transaction_id: number;
  po_number: string;
  challan_number: string;
  challan_image: string;
  vender_name: string;
  issue_date: string;
  trasaction_type: string;
  created_at: string;
  purpose: string;
  receiver_name: string;
  receiver_number: string;
  project_name: string;
  building_name: string;
  floor_name: string;
  delivery_location: string;
  remark: string;
  flat_name: string;
  common_area_name: string | null;
  vendor_name: string;
  receiving_date: string;
  receiver_phone: string;
  items: Array<{
    item_id: string;
    transaction_item_id: number;
    item_name: string;
    quantity_issued: number;
    initial_quantity: number;
  }>;
}

interface TransactionDetailsModalProps {
  transaction: TransactionData;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  transactionType: string;
}

export default function ViewTransaction({
  transaction,
  setIsOpen,
  transactionType,
}: TransactionDetailsModalProps) {
  // Calculate totals - ALL LOGIC KEPT INTACT
  const totals = {
    issued: transaction.items.reduce(
      (sum, item) => sum + item.quantity_issued,
      0
    ),
    remaining: transaction.items.reduce(
      (sum, item) => sum + (item.initial_quantity - item.quantity_issued),
      0
    ),
  };

  // Get transaction type color - ALL LOGIC KEPT INTACT
  const getTransactionTypeColor = () => {
    // Changed to dark gray gradient theme
    return "bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a]";
  };

  // Get transaction type title - ALL LOGIC KEPT INTACT
  const getTransactionTitle = () => {
    switch (transactionType) {
      case "issueMaterial":
        return "Material Issue";
      case "MaterialIn":
        return "Material In";
      case "MaterialOut":
        return "Material Out";
      default:
        return "Transaction";
    }
  };

  // Get section styling based on transaction type - ALL LOGIC KEPT INTACT
  const getSectionStyle = () => {
    // Changed to red accent color theme to match your MaterialInForm
    return {
      gradient: "from-red-50 to-red-50/30",
      border: "border-red-100",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      textColor: "text-red-600",
      statGradient: "from-red-50 to-red-50/30",
      statBorder: "border-red-100",
      tableHeader: "from-red-50 to-red-50/30",
      issuedColor: {
        bg: "bg-red-100",
        text: "text-red-600",
        icon: "text-red-600",
      },
    };
  };

  const sectionStyle = getSectionStyle();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl shadow-gray-900/20 w-full max-w-xs sm:max-w-sm md:max-w-lg lg:max-w-3xl my-2 sm:my-3 md:my-4 border border-gray-200 overflow-hidden">
        {/* Header - Updated with dark gray theme */}
        <div
          className={`${getTransactionTypeColor()} px-3 sm:px-4 md:px-5 py-2 sm:py-3 flex justify-between items-center border-b border-gray-700/30`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1">
                <span>{getTransactionTitle()}</span>
                <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/80" />
                <span className="text-white/90">Details</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-white/80 mt-0.5">
                {new Date(
                  transaction.created_at || transaction.issue_date
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 rounded-lg p-1 sm:p-1.5 transition-all duration-200"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 max-h-[60vh] sm:max-h-[65vh] md:max-h-[70vh] overflow-y-auto custom-scrollbar">
          {transactionType === "issueMaterial" && (
            <div className="space-y-3 sm:space-y-4">
              {/* Basic Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className={`p-1.5 ${sectionStyle.iconBg} rounded-md`}>
                    <Wrench className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                      Basic Information
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Transaction details</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Issue Date
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {new Date(transaction.issue_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Purpose
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md capitalize">
                          {transaction.purpose}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Vendor</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.vendor_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Project
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.project_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <UserRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Receiver
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-[10px] sm:text-xs flex items-center gap-1.5 mt-1.5 bg-red-50 px-2 py-1.5 rounded-md">
                          <Phone className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
                          {transaction.receiver_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className={`p-1.5 ${sectionStyle.iconBg} rounded-md`}>
                    <MapPin className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                      Location Details
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Delivery location</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="p-1 sm:p-1.5 bg-white rounded shadow-xs">
                        <Building className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500">Building</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800">
                          {transaction.building_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="p-1 sm:p-1.5 bg-white rounded shadow-xs">
                        <Layers className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500">Floor</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800">
                          {transaction.floor_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="p-1 sm:p-1.5 bg-white rounded shadow-xs">
                        <Home className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500">Flat</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800">
                          {transaction.flat_name || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-md">
                      <div className="p-1 sm:p-1.5 bg-white rounded shadow-xs">
                        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex items-center justify-center text-gray-600 text-[10px] sm:text-xs font-medium">
                          CA
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500">Common Area</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800">
                          {transaction.common_area_name || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialIn" && (
            <div className="space-y-3 sm:space-y-4">
              {/* Receiving Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className={`p-1.5 ${sectionStyle.iconBg} rounded-md`}>
                    <Package className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                      Receiving Information
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Material receipt</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Receiving Date
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {new Date(transaction.receiving_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          PO Number
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.po_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">Vendor</div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.vender_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Delivery Location
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.delivery_location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <UserRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Receiver
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-[10px] sm:text-xs flex items-center gap-1.5 mt-1.5 bg-red-50 px-2 py-1.5 rounded-md">
                          <Phone className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
                          {transaction.receiver_phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Challan Number
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.challan_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialOut" && (
            <div className="space-y-3 sm:space-y-4">
              {/* Dispatch Information */}
              <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className={`p-1.5 ${sectionStyle.iconBg} rounded-md`}>
                    <Truck className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                      Dispatch Information
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500">Material dispatch</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Receiving Date
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {new Date(transaction.receiving_date).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Transaction Type
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.trasaction_type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Remarks
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md capitalize">
                          {transaction.remark}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Delivery Location
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.delivery_location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <UserRound className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                          Receiver
                        </div>
                        <div className="text-xs sm:text-sm font-medium text-gray-800 bg-gray-50 px-2 py-1.5 rounded-md">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-[10px] sm:text-xs flex items-center gap-1.5 mt-1.5 bg-red-50 px-2 py-1.5 rounded-md">
                          <Phone className="w-2.5 h-2.5 sm:w-2.5 sm:h-2.5" />
                          {transaction.receiver_phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 shadow-xs mt-3 sm:mt-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 ${sectionStyle.iconBg} rounded-md`}>
                  <Layers className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${sectionStyle.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">
                    Items Details
                  </h3>
                  <p className="text-[10px] sm:text-xs text-gray-500">Material quantities</p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs sm:text-sm">
                <thead className={`bg-gradient-to-r ${sectionStyle.tableHeader}`}>
                  <tr>
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span>Item Name</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span>Initial Stock</span>
                      </div>
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span>
                          {transactionType === "MaterialIn"
                            ? "Received"
                            : "Issued"}
                        </span>
                      </div>
                    </th>
                    <th className="px-3 py-2 sm:px-4 sm:py-2.5 text-left text-[10px] sm:text-xs font-semibold text-gray-700">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        <span>
                          {transactionType === "MaterialIn"
                            ? "Total Stock"
                            : "Remaining"}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transaction.items.map((item) => {
                    const remaining =
                      transactionType === "MaterialIn"
                        ? item.initial_quantity + item.quantity_issued
                        : item.initial_quantity - item.quantity_issued;

                    return (
                      <tr
                        key={item.transaction_item_id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-3 py-2 sm:px-4 sm:py-2.5 border-r border-gray-200">
                          <div className="font-medium text-gray-800 text-xs">
                            {item.item_name}
                          </div>
                          <div className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5">
                            ID: {item.item_id}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-2.5 border-r border-gray-200">
                          <div className="text-gray-700 text-xs font-medium">
                            {item.initial_quantity}
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-2.5 border-r border-gray-200">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className={`p-1 ${sectionStyle.iconBg} rounded`}>
                              {transactionType === "MaterialIn" ? (
                                <TrendingUp className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${sectionStyle.iconColor}`} />
                              ) : (
                                <TrendingDown className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${sectionStyle.iconColor}`} />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${sectionStyle.textColor}`}>
                              {item.quantity_issued}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 sm:px-4 sm:py-2.5">
                          <div className="flex items-center gap-1 sm:gap-1.5">
                            <div className={`p-1 rounded ${remaining >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                              {remaining >= 0 ? (
                                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                              ) : (
                                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-600" />
                              )}
                            </div>
                            <span className={`text-xs font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                              {remaining}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 sm:pt-4 border-t border-gray-200/50 flex justify-end gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-[#C62828] to-red-600 text-white text-xs sm:text-sm rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-xs hover:shadow-sm"
            >
              Close Details
            </button>
          </div>
        </div>

        {/* Add custom styles for scrollbar */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c62828;
            border-radius: 2px;
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
  );
}