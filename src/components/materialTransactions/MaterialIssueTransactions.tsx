/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Eye, Package } from "lucide-react";
// import { useEffect, useState } from "react";
// import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
// import poApi from "../../lib/poApi";
// import vendorApi from "../../lib/vendorApi";
// import projectApi from "../../lib/projectApi";
// import ViewTransaction from "../StoreManagement/ViewTransaction";

// const MaterialIssueTransactions = (loadTableData: any) => {
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
//   const loadAllProjects = async () => {
//     try {
//       const poRes = await projectApi.getProjects();
//       console.log("all project details,", poRes);
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
//       const projects: any = await loadAllProjects();
//       const allVendorsData: any = await loadAllVendors();

//       const res: any =
//         await inventoryTransactionApi.getIssueMaterialTransactions();
//       console.log(res, "this is issue material");

//       const transactions = Array.isArray(res) ? res : [];

//       console.log(transactions);
//       setTransactions(transactions);
//       return transactions;
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
//       const itemName = transaction.project_name?.toLowerCase() || "";
//       const type = transaction.vendor_name.toLowerCase();
//       const remark = transaction.receiver_name.toLowerCase();

//       return (
//         itemName.includes(searchLower) ||
//         type.includes(searchLower) ||
//         remark.includes(searchLower)
//       );
//     });
//     setFilteredTransactions(filtered);
//   }, [searchTerm, transactions]);
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-100 border-b border-gray-200">
//             <tr>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Project
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Building
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Floor
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Flat
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Common Area
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Vendor
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Receiver Name
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Receiver Number
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Issue Date
//               </th>
//               <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                 Purpose
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
//                       {transaction.project_name || "N/A"}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.building_name || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="">{transaction.floor_name || "N/A"}</div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.flat_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.common_area_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.vendor_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiver_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.receiver_name ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.issue_date ?? "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className=" text-gray-800">
//                       {transaction.purpose ?? "N/A"}
//                     </div>
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
//         {isOpen && (
//           <ViewTransaction
//             setIsOpen={setIsOpen}
//             transaction={selectedTransaction}
//             transactionType={"issueMaterial"}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default MaterialIssueTransactions;

import { Eye, Package, Filter, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import projectApi from "../../lib/projectApi";
import vendorApi from "../../lib/vendorApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";

const MaterialIssueTransactions = (loadTableData: any) => {
  const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<any>([]);
  
  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Column search states
  const [searchProject, setSearchProject] = useState("");
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchReceiver, setSearchReceiver] = useState("");
  const [searchPurpose, setSearchPurpose] = useState("");
  
  // Filter states
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [ignoreDate, setIgnoreDate] = useState(false);

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREDIT: "bg-green-100 text-green-700",
      DEBIT: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const loadAllProjects = async () => {
    try {
      const poRes = await projectApi.getProjects();
      console.log("all project details,", poRes);
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
      const projects: any = await loadAllProjects();
      const allVendorsData: any = await loadAllVendors();

      const res: any =
        await inventoryTransactionApi.getIssueMaterialTransactions();
      console.log(res, "this is issue material");

      const transactions = Array.isArray(res) ? res : [];

      console.log(transactions);
      setTransactions(transactions);
      return transactions;
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
    let filtered = transactions;

    // Column searches
    if (searchProject) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.project_name || "").toLowerCase().includes(searchProject.toLowerCase())
      );
    }

    if (searchBuilding) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.building_name || "").toLowerCase().includes(searchBuilding.toLowerCase())
      );
    }

    if (searchVendor) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.vendor_name || "").toLowerCase().includes(searchVendor.toLowerCase())
      );
    }

    if (searchReceiver) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.receiver_name || "").toLowerCase().includes(searchReceiver.toLowerCase())
      );
    }

    if (searchPurpose) {
      filtered = filtered.filter((transaction: any) =>
        (transaction.purpose || "").toLowerCase().includes(searchPurpose.toLowerCase())
      );
    }

    // Date filters
    if (!ignoreDate) {
      if (filterFromDate) {
        filtered = filtered.filter((transaction: any) => {
          const transactionDate = new Date(transaction.issue_date);
          const fromDate = new Date(filterFromDate);
          return transactionDate >= fromDate;
        });
      }

      if (filterToDate) {
        filtered = filtered.filter((transaction: any) => {
          const transactionDate = new Date(transaction.issue_date);
          const toDate = new Date(filterToDate);
          toDate.setHours(23, 59, 59, 999);
          return transactionDate <= toDate;
        });
      }
    }

    setFilteredTransactions(filtered);
  }, [searchProject, searchBuilding, searchVendor, searchReceiver, searchPurpose, filterFromDate, filterToDate, ignoreDate, transactions]);

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredTransactions.map((transaction: any) => transaction.id));
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

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} transaction(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => inventoryTransactionApi.getIssueMaterialTransactions(id))
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
    setFilterFromDate("");
    setFilterToDate("");
    setIgnoreDate(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  return (
    <div>
      {/* Header with Actions */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilterSidebar(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {selectedItems.size > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
            >
              <Trash2 className="w-5 h-5" />
              Delete ({selectedItems.size})
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-center w-16">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Project
                  </div>
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Building
                  </div>
                  <input
                    type="text"
                    placeholder="Search building..."
                    value={searchBuilding}
                    onChange={(e) => setSearchBuilding(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Floor
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Flat
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Common Area
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Vendor
                  </div>
                  <input
                    type="text"
                    placeholder="Search vendor..."
                    value={searchVendor}
                    onChange={(e) => setSearchVendor(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Receiver Name
                  </div>
                  <input
                    type="text"
                    placeholder="Search receiver..."
                    value={searchReceiver}
                    onChange={(e) => setSearchReceiver(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Issue Date
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Purpose
                  </div>
                  <input
                    type="text"
                    placeholder="Search purpose..."
                    value={searchPurpose}
                    onChange={(e) => setSearchPurpose(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction: any) => {
                const isSelected = selectedItems.has(transaction.id);
                return (
                  <tr
                    key={transaction.id}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(transaction.id)}
                        className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsOpen(true);
                        }}
                        className="font-bold hover:underline cursor-pointer text-blue-600"
                      >
                        {transaction.project_name || "N/A"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.building_name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="">{transaction.floor_name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.flat_name ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.common_area_name ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.vendor_name ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.receiver_name ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.issue_date ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">
                        {transaction.purpose ?? "N/A"}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Transactions Found
              </h3>
              <p className="text-gray-600">
                {searchProject || searchBuilding || searchVendor || searchReceiver || searchPurpose
                  ? "Try a different search term"
                  : "No inventory transactions available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterSidebar(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="bg-[#C62828] px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ignoreDate"
                  checked={ignoreDate}
                  onChange={(e) => {
                    setIgnoreDate(e.target.checked);
                    if (e.target.checked) {
                      setFilterFromDate("");
                      setFilterToDate("");
                    }
                  }}
                  className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                />
                <label htmlFor="ignoreDate" className="text-sm text-gray-700 cursor-pointer">
                  Ignore Date
                </label>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-[#C62828] text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
              >
                Apply
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
          transactionType={"issueMaterial"}
        />
      )}
    </div>
  );
};

export default MaterialIssueTransactions;