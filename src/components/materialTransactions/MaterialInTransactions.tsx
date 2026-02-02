// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Package, X } from "lucide-react";
// import { useEffect, useState } from "react";
// import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
// import poApi from "../../lib/poApi";
// import vendorApi from "../../lib/vendorApi";
// import ViewTransaction from "../StoreManagement/ViewTransaction";

// const MaterialInTransactions = (loadTableData: any) => {
//   const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
//   const [transactions, setTransactions] = useState<any>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTransaction, setSelectedTransaction] = useState<any>();
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [selectedChallan, setSelectedChallan] = useState("");
//   const [viewChallan, setViewChallan] = useState(false);
//   const [activeFormTab, setActiveFormTab] = useState<string>("");
//   const [selectedPOTransaction, setSelectedPOTransaction] = useState<
//     any | null
//   >(null);
//   const getTransactionTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       CREDIT: "bg-green-100 text-green-700",
//       DEBIT: "bg-red-100 text-red-700",
//     };
//     return colors[type] || "bg-gray-100 text-gray-700";
//   };
//   const loadAllPO = async () => {
//     try {
//       const poRes = await poApi.getPOs();
//       return Array.isArray(poRes) ? poRes : [];
//     } catch (error) {
//       console.log(error);
//       alert("Something wrong.");
//     }
//   };
//   const loadAllVendors = async () => {
//     try {
//       const vendorsRes = await vendorApi.getVendors();
//       console.log(vendorsRes);
//       return Array.isArray(vendorsRes) ? vendorsRes : [];
//     } catch (error) {
//       console.log(error);
//       alert("Something wrong.");
//     }
//   };
//   const loadTransactions = async () => {
//     try {
//       const allPOsData: any = await loadAllPO();
//       const allVendorsData: any = await loadAllVendors();

//       const res: any = await inventoryTransactionApi.getTransactions();
//       const transactions = Array.isArray(res?.data) ? res.data : [];

//       const enhancedTransactions = transactions.map((transaction: any) => {
//         const poData = allPOsData.find((i: any) => i.id === transaction.po_id);

//         const vendorData = allVendorsData.find(
//           (i: any) => i.id === transaction.vendor_id
//         );

//         return {
//           ...transaction,
//           po_number: poData?.po_number || "N/A",
//           vendor: vendorData?.name || "N/A",
//         };
//       });
//       console.log(enhancedTransactions, "from material in transactions");
//       setTransactions(enhancedTransactions);
//       return enhancedTransactions;
//     } catch (error) {
//       console.error("Error loading transactions:", error);
//       alert("Failed to load transaction data");
//       return [];
//     }
//   };

//   useEffect(() => {
//     loadTransactions();
//   }, [loadTableData]);

//   useEffect(() => {
//     const searchLower = searchTerm.toLowerCase();

//     const filtered = transactions.filter((transaction: any) => {
//       const itemName = transaction.vendor?.toLowerCase() || "";
//       const type = transaction.po_number.toLowerCase();
//       const remark = transaction.receiver_name.toLowerCase();

//       return (
//         itemName.includes(searchLower) ||
//         type.includes(searchLower) ||
//         remark.includes(searchLower)
//       );
//     });
//     console.log(filtered);
//     const tempData = filtered.filter(
//       (d: any) => d.trasaction_type === "INWARD"
//     );
//     setFilteredTransactions(tempData);
//   }, [searchTerm, transactions]);
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-100 border-b border-gray-200">
//             <tr>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 PO Number
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Vendor
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Challan No.
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Receiving Date
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Receiver Name
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Trans. Type
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 View Challan
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredTransactions.map((transaction: any) => {
//               return (
//                 <tr
//                   key={transaction.id}
//                   className="hover:bg-gray-50 transition"
//                 >
//                   <td className="px-6 py-4">
//                     <button
//                       onClick={() => {
//                         setSelectedTransaction(transaction);
//                         setIsOpen(true);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600"
//                     >
//                       {transaction.po_number || "N/A"}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.vendor || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="">
//                       {transaction.challan_number || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiving_date ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiver_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
//                         transaction.trasaction_type
//                       )}`}
//                     >
//                       {transaction.trasaction_type}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4">
//                     {transaction.challan_image ? (
//                       <button
//                         onClick={() => {
//                           setSelectedChallan(transaction.challan_image);
//                           setViewChallan(true);
//                         }}
//                         className="text-sm max-w-xs truncate font-bold cursor-pointer text-blue-600 hover:scale-102"
//                         title={"View Challan"}
//                       >
//                         View
//                       </button>
//                     ) : (
//                       "--"
//                     )}
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>

//         {filteredTransactions.length === 0 && (
//           <div className="text-center py-12">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               No Transactions Found
//             </h3>
//             <p className="text-gray-600">
//               {searchTerm
//                 ? "Try a different search term"
//                 : "No inventory transactions available"}
//             </p>
//           </div>
//         )}
//         {viewChallan && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//               <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//                 <h2 className="text-2xl font-bold text-white">
//                   View Challan Image
//                 </h2>
//                 <button
//                   onClick={() => {
//                     setViewChallan(false);
//                   }}
//                   className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>
//               <div className="overflow-y-scroll h-[500px]">
//                 <img
//                   src={`${
//                     import.meta.env.VITE_API_URL
//                   }/uploads/${selectedChallan}`}
//                   alt=""
//                 />
//               </div>
//               <div className="flex justify-end gap-3 p-6 border-t">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setViewChallan(false);
//                   }}
//                   className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//         {isOpen && (
//           <ViewTransaction
//             setIsOpen={setIsOpen}
//             transaction={selectedTransaction}
//             transactionType="MaterialIn"
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default MaterialInTransactions;

// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { Package, X, Search, Filter, Trash2 } from "lucide-react";
// import { useEffect, useState } from "react";
// import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
// import poApi from "../../lib/poApi";
// import vendorApi from "../../lib/vendorApi";
// import ViewTransaction from "../StoreManagement/ViewTransaction";

// const MaterialInTransactions = (loadTableData: any) => {
//   const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
//   const [transactions, setTransactions] = useState<any>([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedTransaction, setSelectedTransaction] = useState<any>();
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [selectedChallan, setSelectedChallan] = useState("");
//   const [viewChallan, setViewChallan] = useState(false);
//   const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);
//   const [showFilterSidebar, setShowFilterSidebar] = useState(false);

//   // Column search states
//   const [searchPONumber, setSearchPONumber] = useState("");
//   const [searchVendor, setSearchVendor] = useState("");
//   const [searchChallan, setSearchChallan] = useState("");
//   const [searchReceiver, setSearchReceiver] = useState("");

//   // Filter states
//   const [filterFromDate, setFilterFromDate] = useState("");
//   const [filterToDate, setFilterToDate] = useState("");
//   const [ignoreDate, setIgnoreDate] = useState(false);

//   const getTransactionTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       CREDIT: "bg-green-100 text-green-700",
//       DEBIT: "bg-red-100 text-red-700",
//     };
//     return colors[type] || "bg-gray-100 text-gray-700";
//   };

//   const loadAllPO = async () => {
//     try {
//       const poRes = await poApi.getPOs();
//       return Array.isArray(poRes) ? poRes : [];
//     } catch (error) {
//       console.log(error);
//       alert("Something wrong.");
//     }
//   };

//   const loadAllVendors = async () => {
//     try {
//       const vendorsRes = await vendorApi.getVendors();
//       console.log(vendorsRes);
//       return Array.isArray(vendorsRes) ? vendorsRes : [];
//     } catch (error) {
//       console.log(error);
//       alert("Something wrong.");
//     }
//   };

//   const loadTransactions = async () => {
//     try {
//       const allPOsData: any = await loadAllPO();
//       const allVendorsData: any = await loadAllVendors();

//       const res: any = await inventoryTransactionApi.getTransactions();
//       const transactions = Array.isArray(res?.data) ? res.data : [];

//       const enhancedTransactions = transactions.map((transaction: any) => {
//         const poData = allPOsData.find((i: any) => i.id === transaction.po_id);
//         const vendorData = allVendorsData.find(
//           (i: any) => i.id === transaction.vendor_id
//         );

//         return {
//           ...transaction,
//           po_number: poData?.po_number || "N/A",
//           vendor: vendorData?.name || "N/A",
//         };
//       });
//       console.log(enhancedTransactions, "from material in transactions");
//       setTransactions(enhancedTransactions);
//       return enhancedTransactions;
//     } catch (error) {
//       console.error("Error loading transactions:", error);
//       alert("Failed to load transaction data");
//       return [];
//     }
//   };

//   useEffect(() => {
//     loadTransactions();
//   }, [loadTableData]);

//   useEffect(() => {
//     let filtered = transactions.filter((d: any) => d.trasaction_type === "INWARD");

//     // Column searches
//     if (searchPONumber) {
//       filtered = filtered.filter((transaction: any) =>
//         (transaction.po_number || "").toLowerCase().includes(searchPONumber.toLowerCase())
//       );
//     }

//     if (searchVendor) {
//       filtered = filtered.filter((transaction: any) =>
//         (transaction.vendor || "").toLowerCase().includes(searchVendor.toLowerCase())
//       );
//     }

//     if (searchChallan) {
//       filtered = filtered.filter((transaction: any) =>
//         (transaction.challan_number || "").toLowerCase().includes(searchChallan.toLowerCase())
//       );
//     }

//     if (searchReceiver) {
//       filtered = filtered.filter((transaction: any) =>
//         (transaction.receiver_name || "").toLowerCase().includes(searchReceiver.toLowerCase())
//       );
//     }

//     // Date filters
//     if (!ignoreDate) {
//       if (filterFromDate) {
//         filtered = filtered.filter((transaction: any) => {
//           const transactionDate = new Date(transaction.receiving_date);
//           const fromDate = new Date(filterFromDate);
//           return transactionDate >= fromDate;
//         });
//       }

//       if (filterToDate) {
//         filtered = filtered.filter((transaction: any) => {
//           const transactionDate = new Date(transaction.receiving_date);
//           const toDate = new Date(filterToDate);
//           toDate.setHours(23, 59, 59, 999);
//           return transactionDate <= toDate;
//         });
//       }
//     }

//     setFilteredTransactions(filtered);
//   }, [searchPONumber, searchVendor, searchChallan, searchReceiver, filterFromDate, filterToDate, ignoreDate, transactions]);

//   // Checkbox handlers
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedItems(new Set());
//     } else {
//       const allIds = new Set(filteredTransactions.map((transaction: any) => transaction.id));
//       setSelectedItems(allIds);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleSelectItem = (id: number) => {
//     const newSelected = new Set(selectedItems);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedItems(newSelected);
//     setSelectAll(newSelected.size === filteredTransactions.length);
//   };

//   const handleBulkDelete = async () => {
//     if (selectedItems.size === 0) {
//       alert("Please select transactions to delete");
//       return;
//     }

//     if (!confirm(`Are you sure you want to delete ${selectedItems.size} transaction(s)? This action cannot be undone.`)) {
//       return;
//     }

//     try {
//       await Promise.all(
//         Array.from(selectedItems).map((id) => inventoryTransactionApi.deleteTransaction(id))
//       );
//       alert(`${selectedItems.size} transaction(s) deleted successfully!`);
//       setSelectedItems(new Set());
//       setSelectAll(false);
//       await loadTransactions();
//     } catch (error) {
//       console.error("Error deleting transactions:", error);
//       alert("Failed to delete transactions");
//     }
//   };

//   const resetFilters = () => {
//     setFilterFromDate("");
//     setFilterToDate("");
//     setIgnoreDate(false);
//   };

//   const applyFilters = () => {
//     setShowFilterSidebar(false);
//   };

//   return (
//     <div>
//       {/* Header with Actions */}
//       <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowFilterSidebar(true)}
//             className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm text-sm"
//           >
//             <Filter className="w-4 h-4" />
//             Filters
//           </button>
//           {selectedItems.size > 0 && (
//             <button
//               onClick={handleBulkDelete}
//               className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
//             >
//               <Trash2 className="w-5 h-5" />
//               Delete ({selectedItems.size})
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Main Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-200 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-center w-16">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAll}
//                     className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     PO Number
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search PO..."
//                     value={searchPONumber}
//                     onChange={(e) => setSearchPONumber(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Vendor
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search vendor..."
//                     value={searchVendor}
//                     onChange={(e) => setSearchVendor(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Challan No.
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search challan..."
//                     value={searchChallan}
//                     onChange={(e) => setSearchChallan(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Receiving Date
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Receiver Name
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search receiver..."
//                     value={searchReceiver}
//                     onChange={(e) => setSearchReceiver(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Trans. Type
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     View Challan
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredTransactions.map((transaction: any) => {
//                 const isSelected = selectedItems.has(transaction.id);
//                 return (
//                   <tr
//                     key={transaction.id}
//                     className={`hover:bg-gray-50 transition ${
//                       isSelected ? "bg-blue-50" : ""
//                     }`}
//                   >
//                     <td className="px-6 py-4 text-center">
//                       <input
//                         type="checkbox"
//                         checked={isSelected}
//                         onChange={() => handleSelectItem(transaction.id)}
//                         className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                       />
//                     </td>
//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => {
//                           setSelectedTransaction(transaction);
//                           setIsOpen(true);
//                         }}
//                         className="font-bold hover:underline cursor-pointer text-blue-600"
//                       >
//                         {transaction.po_number || "N/A"}
//                       </button>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-gray-800">
//                         {transaction.vendor || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="">
//                         {transaction.challan_number || "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-gray-800">
//                         {transaction.receiving_date ?? "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-gray-800">
//                         {transaction.receiver_name ?? "N/A"}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
//                           transaction.trasaction_type
//                         )}`}
//                       >
//                         {transaction.trasaction_type}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       {transaction.challan_image ? (
//                         <button
//                           onClick={() => {
//                             setSelectedChallan(transaction.challan_image);
//                             setViewChallan(true);
//                           }}
//                           className="text-sm max-w-xs truncate font-bold cursor-pointer text-blue-600 hover:scale-102"
//                           title={"View Challan"}
//                         >
//                           View
//                         </button>
//                       ) : (
//                         "--"
//                       )}
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {filteredTransactions.length === 0 && (
//             <div className="text-center py-12">
//               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                 No Transactions Found
//               </h3>
//               <p className="text-gray-600">
//                 {searchPONumber || searchVendor || searchChallan || searchReceiver
//                   ? "Try a different search term"
//                   : "No inventory transactions available"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Filter Sidebar */}
//       {showFilterSidebar && (
//         <div className="fixed inset-0 z-50 overflow-hidden">
//           <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterSidebar(false)}></div>
//           <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
//             <div className="bg-[#C62828] px-6 py-4 flex justify-between items-center">
//               <h2 className="text-xl font-bold text-white">Filters</h2>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={resetFilters}
//                   className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
//                 >
//                   Reset
//                 </button>
//                 <button
//                   onClick={() => setShowFilterSidebar(false)}
//                   className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-6">
//               <div className="border-t pt-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   From Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filterFromDate}
//                   onChange={(e) => setFilterFromDate(e.target.value)}
//                   disabled={ignoreDate}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   To Date
//                 </label>
//                 <input
//                   type="date"
//                   value={filterToDate}
//                   onChange={(e) => setFilterToDate(e.target.value)}
//                   disabled={ignoreDate}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
//                 />
//               </div>

//               <div className="flex items-center gap-2">
//                 <input
//                   type="checkbox"
//                   id="ignoreDate"
//                   checked={ignoreDate}
//                   onChange={(e) => {
//                     setIgnoreDate(e.target.checked);
//                     if (e.target.checked) {
//                       setFilterFromDate("");
//                       setFilterToDate("");
//                     }
//                   }}
//                   className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                 />
//                 <label htmlFor="ignoreDate" className="text-sm text-gray-700 cursor-pointer">
//                   Ignore Date
//                 </label>
//               </div>
//             </div>

//             <div className="border-t p-4 flex gap-3">
//               <button
//                 onClick={resetFilters}
//                 className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
//               >
//                 Reset
//               </button>
//               <button
//                 onClick={applyFilters}
//                 className="flex-1 bg-[#C62828] text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
//               >
//                 Apply
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Challan Modal */}
//       {viewChallan && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">
//                 View Challan Image
//               </h2>
//               <button
//                 onClick={() => {
//                   setViewChallan(false);
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>
//             <div className="overflow-y-scroll h-[500px]">
//               <img
//                 src={`${import.meta.env.VITE_API_URL}/uploads/${selectedChallan}`}
//                 alt=""
//               />
//             </div>
//             <div className="flex justify-end gap-3 p-6 border-t">
//               <button
//                 type="button"
//                 onClick={() => {
//                   setViewChallan(false);
//                 }}
//                 className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Transaction Modal */}
//       {isOpen && (
//         <ViewTransaction
//           setIsOpen={setIsOpen}
//           transaction={selectedTransaction}
//           transactionType="MaterialIn"
//         />
//       )}
//     </div>
//   );
// };

// export default MaterialInTransactions;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Package, X, Search, Filter, Trash2, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import "react-datepicker/dist/react-datepicker.css";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";

registerLocale("en-GB", enGB);

const MaterialInTransactions = (loadTableData: any) => {
  const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
  const [transactions, setTransactions] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedChallan, setSelectedChallan] = useState("");
  const [viewChallan, setViewChallan] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Column search states
  const [searchPONumber, setSearchPONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchChallan, setSearchChallan] = useState("");
  const [searchReceiver, setSearchReceiver] = useState("");
  const [searchTransType, setSearchTransType] = useState("");
  const [searchReceivingDate, setSearchReceivingDate] = useState("");

  // Date filter states with react-datepicker
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ignoreDate, setIgnoreDate] = useState(false);

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREDIT: "bg-green-100 text-green-700",
      DEBIT: "bg-red-100 text-red-700",
      INWARD: "bg-green-100 text-green-700",
      OUTWARD: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const loadAllPO = async () => {
    try {
      const poRes = await poApi.getPOs();
      return Array.isArray(poRes) ? poRes : [];
    } catch (error) {
      console.log(error);
      alert("Something wrong.");
    }
  };

  const loadAllVendors = async () => {
    try {
      const vendorsRes = await vendorApi.getVendors();
      console.log(vendorsRes);
      return Array.isArray(vendorsRes) ? vendorsRes : [];
    } catch (error) {
      console.log(error);
      alert("Something wrong.");
    }
  };

  const loadTransactions = async () => {
    try {
      const allPOsData: any = await loadAllPO();
      const allVendorsData: any = await loadAllVendors();

      const res: any = await inventoryTransactionApi.getTransactions();
      const transactions = Array.isArray(res?.data) ? res.data : [];

      const enhancedTransactions = transactions.map((transaction: any) => {
        const poData = allPOsData.find((i: any) => i.id === transaction.po_id);
        const vendorData = allVendorsData.find(
          (i: any) => i.id === transaction.vendor_id,
        );

        return {
          ...transaction,
          po_number: poData?.po_number || "N/A",
          vendor: vendorData?.name || "N/A",
        };
      });
      console.log(enhancedTransactions, "from material in transactions");
      setTransactions(enhancedTransactions);
      return enhancedTransactions;
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Failed to load transaction data");
      return [];
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTableData]);

  useEffect(() => {
    let filtered = transactions.filter(
      (d: any) => d.trasaction_type === "INWARD",
    );

    // Column searches
    if (searchPONumber) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.po_number || "")
          .toLowerCase()
          .includes(searchPONumber.toLowerCase()),
      );
    }

    if (searchVendor) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.vendor || "")
          .toLowerCase()
          .includes(searchVendor.toLowerCase()),
      );
    }

    if (searchChallan) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.challan_number || "")
          .toLowerCase()
          .includes(searchChallan.toLowerCase()),
      );
    }

    if (searchReceiver) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiver_name || "")
          .toLowerCase()
          .includes(searchReceiver.toLowerCase()),
      );
    }

    if (searchTransType) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.trasaction_type || "")
          .toLowerCase()
          .includes(searchTransType.toLowerCase()),
      );
    }

    if (searchReceivingDate) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiving_date || "").includes(searchReceivingDate),
      );
    }

    // Date filters with react-datepicker
    if (!ignoreDate) {
      if (startDate) {
        filtered = filtered.filter((transaction: any) => {
          const transactionDate = new Date(transaction.receiving_date);
          return transactionDate >= startDate;
        });
      }

      if (endDate) {
        filtered = filtered.filter((transaction: any) => {
          const transactionDate = new Date(transaction.receiving_date);
          const adjustedEndDate = new Date(endDate);
          adjustedEndDate.setHours(23, 59, 59, 999);
          return transactionDate <= adjustedEndDate;
        });
      }
    }

    setFilteredTransactions(filtered);
  }, [
    searchPONumber,
    searchVendor,
    searchChallan,
    searchReceiver,
    searchTransType,
    searchReceivingDate,
    startDate,
    endDate,
    ignoreDate,
    transactions,
  ]);

  // Checkbox handlers
 

  

 

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setIgnoreDate(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  return (
  <div className="p-3 md:p-4 bg-gray-50 min-h-screen">
  {/* Header with Actions */}
  <div className="-mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3"></div>

  {/* Main Table */}
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">
        <thead className="bg-gray-200 border-b border-gray-200">
          <tr>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                PO Number
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Vendor
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Challan No.
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Receiving Date
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Receiver Name
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trans. Type
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                View Challan
              </div>
            </th>
          </tr>

          {/* Search Row - Reduced Height */}
          <tr className="bg-gray-50 border-b border-gray-200">
            {/* PO Number Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search PO..."
                value={searchPONumber}
                onChange={(e) => setSearchPONumber(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Vendor Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search vendor..."
                value={searchVendor}
                onChange={(e) => setSearchVendor(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Challan No. Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search challan..."
                value={searchChallan}
                onChange={(e) => setSearchChallan(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Receiving Date Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search date..."
                value={searchReceivingDate}
                onChange={(e) => setSearchReceivingDate(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Receiver Name Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search receiver..."
                value={searchReceiver}
                onChange={(e) => setSearchReceiver(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Transaction Type Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search type..."
                value={searchTransType}
                onChange={(e) => setSearchTransType(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* View Challan Column - Filter icon */}
            <td className="px-2 md:px-4 py-1 text-center">
              <button
                onClick={() => setShowFilterSidebar(true)}
                className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[10px] md:text-xs font-medium text-gray-700"
                title="Advanced Filters"
              >
                <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                Filters
              </button>
            </td>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTransactions.map((transaction: any) => (
            <tr
              key={transaction.id}
              className="hover:bg-gray-50 transition"
            >
              <td className="px-2 md:px-4 py-2">
                <button
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setIsOpen(true);
                  }}
                  className="font-bold hover:underline cursor-pointer text-blue-600 text-xs md:text-sm truncate block max-w-[120px]"
                  title={transaction.po_number || "N/A"}
                >
                  {transaction.po_number || "N/A"}
                </button>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div
                  className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]"
                  title={transaction.vendor || "N/A"}
                >
                  {transaction.vendor || "N/A"}
                </div>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div
                  className="text-xs md:text-sm truncate max-w-[120px]"
                  title={transaction.challan_number || "N/A"}
                >
                  {transaction.challan_number || "N/A"}
                </div>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                  {transaction.receiving_date ?? "N/A"}
                </div>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div
                  className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]"
                  title={transaction.receiver_name ?? "N/A"}
                >
                  {transaction.receiver_name ?? "N/A"}
                </div>
              </td>
              <td className="px-2 md:px-4 py-2">
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getTransactionTypeColor(
                    transaction.trasaction_type,
                  )} truncate`}
                  title={transaction.trasaction_type}
                >
                  {transaction.trasaction_type}
                </span>
              </td>
              <td className="px-2 md:px-4 py-2">
                {transaction.challan_image ? (
                  <button
                    onClick={() => {
                      setSelectedChallan(transaction.challan_image);
                      setViewChallan(true);
                    }}
                    className="text-[10px] md:text-sm truncate font-bold cursor-pointer text-blue-600 hover:underline"
                    title="View Challan"
                  >
                    View
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs">--</span>
                )}
              </td>
            </tr>
          ))}

          {filteredTransactions.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center">
                <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm md:text-lg font-medium">
                  No Transactions Found
                </p>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                  {searchPONumber ||
                  searchVendor ||
                  searchChallan ||
                  searchReceiver
                    ? "Try a different search term"
                    : "No inventory transactions available"}
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Updated Filter Sidebar with react-datepicker */}
  {showFilterSidebar && (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={() => setShowFilterSidebar(false)}
      />

      {/* Sidebar */}
      <div
        className={`
          absolute inset-y-0 right-0
          bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-out
          ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}

          /* MOBILE */
          w-[90vw] max-w-none

          /* DESKTOP (unchanged) */
          md:max-w-md md:w-full
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm md:text-xl font-bold text-white">
                Date Filters
              </h2>
              <p className="text-xs md:text-sm text-white/80">
                Select a date range to filter transactions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={resetFilters}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  From Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={startDate}
                    onChange={(date: any) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={endDate || new Date()}
                    placeholderText="Select start date"
                    className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    dateFormat="dd/MM/yyyy"
                    locale="en-GB"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  To Date
                </label>
                <div className="relative">
                  <DatePicker
                    selected={endDate}
                    onChange={(date: any) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || undefined}
                    maxDate={new Date()}
                    placeholderText="Select end date"
                    className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    dateFormat="dd/MM/yyyy"
                    locale="en-GB"
                    isClearable
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Summary */}
            {(startDate || endDate) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs md:text-sm font-medium text-gray-800">
                  Selected Range
                </p>
                <p className="text-[11px] md:text-xs text-gray-600">
                  {startDate
                    ? startDate.toLocaleDateString("en-GB")
                    : "Any"}{" "}
                  → {endDate ? endDate.toLocaleDateString("en-GB") : "Any"}
                </p>
              </div>
            )}
          </div>

          {/* Ignore Date */}
          <div className="border-t pt-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={ignoreDate}
                onChange={(e) => {
                  setIgnoreDate(e.target.checked);
                  if (e.target.checked) {
                    setStartDate(null);
                    setEndDate(null);
                  }
                }}
                className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]"
              />
              <div>
                <p className="text-xs md:text-sm font-medium text-gray-700">
                  Ignore Date Filters
                </p>
                <p className="text-[11px] md:text-xs text-gray-500">
                  Show all data regardless of date
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
          <button
            onClick={resetFilters}
            className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Reset All
          </button>
          <button
            onClick={applyFilters}
            className="flex-1 bg-gradient-to-r from-[#C62828] to-[#D32F2F] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  )}

  {/* View Challan Modal */}
  {viewChallan && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
            px-6 py-4 flex justify-between items-center
            rounded-t-2xl border-b border-white/10
            backdrop-blur-md"
        >
          <h2 className="text-2xl font-bold text-white">
            View Challan Image
          </h2>
          <button
            onClick={() => {
              setViewChallan(false);
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-y-scroll h-[500px]">
          {selectedChallan.toLowerCase().endsWith(".pdf") ? (
            <iframe
              src={`${import.meta.env.VITE_API_URL}/uploads/${selectedChallan}`}
              title="Challan PDF"
              className="w-full h-full border rounded-lg"
            />
          ) : (
            <img
              src={`${import.meta.env.VITE_API_URL}/uploads/${selectedChallan}`}
              alt=""
              className="w-full h-full"
            />
          )}
        </div>
        <div className="flex justify-end gap-3 p-3 border-t">
          <button
            type="button"
            onClick={() => {
              setViewChallan(false);
            }}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )}

  {/* View Transaction Modal */}
  {isOpen && (
    <ViewTransaction
      setIsOpen={setIsOpen}
      transaction={selectedTransaction}
      transactionType="MaterialIn"
    />
  )}
</div>
  );
};

export default MaterialInTransactions;
