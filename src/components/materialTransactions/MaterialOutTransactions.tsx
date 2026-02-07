/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Eye, Package } from "lucide-react";
// import { useEffect, useState } from "react";
// import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
// import poApi from "../../lib/poApi";
// import vendorApi from "../../lib/vendorApi";
// import ViewTransaction from "../StoreManagement/ViewTransaction";

// const MaterialOutTransactions = (loadTableData: any) => {
//   const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
//   const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
//     null
//   );
//   const [isOpen, setIsOpen] = useState<boolean>(false);
//   const [activeFormTab, setActiveFormTab] = useState("");
//   const [transactions, setTransactions] = useState<any>([]);
//   const [searchTerm, setSearchTerm] = useState("");
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
//       console.log(enhancedTransactions);
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
//     console.log(filtered, "outward");
//     const tempData = filtered.filter(
//       (d: any) => d.trasaction_type === "OUTWARD"
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
//                 Contact Person
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Phone Number
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Delivery Location
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Issue Date
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Purpose
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Trans. Type
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Action
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
//                       {transaction.receiver_name || "N/A"}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiver_phone || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="">
//                       {transaction.delivery_location || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiving_date ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.remark ?? "N/A"}
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
//                     <button
//                       onClick={() => {
//                         setSelectedTransaction(transaction);
//                         setIsOpen(true);
//                       }}
//                       className="text-sm max-w-xs truncate font-bold cursor-pointer text-blue-600 hover:scale-102"
//                       title={transaction.remark}
//                     >
//                       <Eye className="w-4 h-4" />
//                     </button>
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
//       </div>
//       {isOpen && (
//         <ViewTransaction
//           setIsOpen={setIsOpen}
//           transaction={selectedTransaction}
//           transactionType="MaterialOut"
//         />
//       )}
//     </div>
//   );
// };

// export default MaterialOutTransactions;

import { Eye, Package, Filter, Trash2, X, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import "react-datepicker/dist/react-datepicker.css";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";
import { toast } from "sonner";

registerLocale("en-GB", enGB);

const MaterialOutTransactions = (loadTableData: any) => {
  const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any>([]);

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Column search states
  const [searchContact, setSearchContact] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchPurpose, setSearchPurpose] = useState("");
  const [searchTransType, setSearchTransType] = useState("");

  // Date filter states
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [ignoreDate, setIgnoreDate] = useState(false);

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREDIT: "bg-green-100 text-green-700",
      DEBIT: "bg-red-100 text-red-700",
      OUTWARD: "bg-red-100 text-red-700",
      INWARD: "bg-green-100 text-green-700",
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
      (d: any) => d.trasaction_type === "OUTWARD",
    );

    // Column searches
    if (searchContact) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiver_name || "")
          .toLowerCase()
          .includes(searchContact.toLowerCase()),
      );
    }

    if (searchPhone) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiver_phone || "").includes(searchPhone),
      );
    }

    if (searchLocation) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.delivery_location || "")
          .toLowerCase()
          .includes(searchLocation.toLowerCase()),
      );
    }

    if (searchDate) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiving_date || "").includes(searchDate),
      );
    }

    if (searchPurpose) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.remark || "")
          .toLowerCase()
          .includes(searchPurpose.toLowerCase()),
      );
    }

    if (searchTransType) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.trasaction_type || "")
          .toLowerCase()
          .includes(searchTransType.toLowerCase()),
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
    searchContact,
    searchPhone,
    searchLocation,
    searchDate,
    searchPurpose,
    searchTransType,
    startDate,
    endDate,
    ignoreDate,
    transactions,
  ]);

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(
        filteredTransactions.map((transaction: any) => transaction.id),
      );
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredTransactions.length);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert("Please select transactions to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.size} transaction(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) =>
          inventoryTransactionApi.deleteTransaction(id),
        ),
      );
      alert(`${selectedItems.size} transaction(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadTransactions();
    } catch (error) {
      console.error("Error deleting transactions:", error);
      alert("Failed to delete transactions");
    }
  };

  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setIgnoreDate(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  return (
   <div className="  p-3 md:p-4 bg-gray-50 min-h-screen">
  {/* Header with Actions */}
  <div className="-mb-5 flex flex-col md:flex-row md:items-center justify-between gap-3"></div>

  {/* Main Table */}
  <div className=" sticky top-52 z-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
      <table className="sticky top-48 z-10 w-full min-w-[1000px]">
        <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
          <tr>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Contact Person
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Phone Number
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Delivery Location
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Issue Date
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Purpose
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Trans. Type
              </div>
            </th>
            <th className="px-2 md:px-4 py-2 text-left">
              <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Action
              </div>
            </th>
          </tr>

          {/* Search Row */}
          <tr className="bg-gray-50 border-b border-gray-200">
            {/* Contact Person Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search contact..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Phone Number Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search phone..."
                value={searchPhone}
                onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) {
                    toast.warning("Enter Valid Phone Number.");
                    return;
                  }
                  if (e.target.value.length > 10) {
                    toast.warning("Mobile number must be 10 digit.");
                    return;
                  }
                  setSearchPhone(e.target.value);
                }}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Delivery Location Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Issue Date Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search date..."
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
              />
            </td>

            {/* Purpose Column */}
            <td className="px-2 md:px-4 py-1">
              <input
                type="text"
                placeholder="Search purpose..."
                value={searchPurpose}
                onChange={(e) => setSearchPurpose(e.target.value)}
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

            {/* Action Column - Filter icon */}
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
                  title={transaction.receiver_name || "N/A"}
                >
                  {transaction.receiver_name || "N/A"}
                </button>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div
                  className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]"
                  title={transaction.receiver_phone || "N/A"}
                >
                  {transaction.receiver_phone || "N/A"}
                </div>
              </td>
              <td className="px-2 md:px-4 py-2">
                <div
                  className="text-xs md:text-sm truncate max-w-[120px]"
                  title={transaction.delivery_location || "N/A"}
                >
                  {transaction.delivery_location || "N/A"}
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
                  title={transaction.remark ?? "N/A"}
                >
                  {transaction.remark ?? "N/A"}
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
                <button
                  onClick={() => {
                    setSelectedTransaction(transaction);
                    setIsOpen(true);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
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
                  {searchContact ||
                  searchPhone ||
                  searchLocation ||
                  searchPurpose
                    ? "Try a different search term"
                    : "No material out transactions available"}
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
                    onChange={(date) => setStartDate(date)}
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
                    onChange={(date) => setEndDate(date)}
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

  {/* View Transaction Modal */}
  {isOpen && (
    <ViewTransaction
      setIsOpen={setIsOpen}
      transaction={selectedTransaction}
      transactionType="MaterialOut"
    />
  )}
</div>
  );
};

export default MaterialOutTransactions;
