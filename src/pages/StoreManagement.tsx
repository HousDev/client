/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/StoreManagement.tsx
// import { useState, useEffect, useMemo } from "react";
// import {
//   Plus,
//   Eye,
//   Edit2,
//   Trash2,
//   Search,
//   FileText,
//   Package,
//   Loader2,
//   RefreshCw,
//   AlertTriangle,
//   CheckCircle,
//   IndianRupee,
//   Bell,
//   PackagePlus,
//   PackageMinus,
//   UserCheck,
//   HandCoins,
//   Download,
//   Truck,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import InventoryTransaction from "../components/InventoryTransaction";
// import UpdateInventoryForm from "../components/UpdateInventory";
// import inventoryApi from "../lib/inventoryApi";
// import inventoryTransactionApi from "../lib/inventoryTransactionApi";
// import ItemsApi from "../lib/itemsApi";
// import MaterialInForm from "../components/StoreManagement/MaterialInForm";
// import MaterialOutForm from "../components/StoreManagement/MaterialOutForm";
// import poApi from "../lib/poApi";
// import vendorApi from "../lib/vendorApi";
// import ViewPOTransaction from "../components/StoreManagement/ViewPOTransaction";
// import NotificationsApi from "../lib/notificationApi";
// import IssueMaterial from "../components/StoreManagement/IssueMaterial";
// import MaterialInTransactions from "../components/materialTransactions/MaterialInTransactions";
// import MaterialOutTransactions from "../components/materialTransactions/MaterialOutTransactions";
// import MaterialIssueTransactions from "../components/materialTransactions/MaterialIssueTransactions";

// type InventoryItem = {
//   id: number;
//   item_id: string;
//   item_code: string;
//   name: string;
//   description: string;
//   category: string;
//   quantity: number;
//   reorder_qty: number;
//   unit: string;
//   status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
//   created_at?: string;
//   updated_at?: string;
//   // Added for better type safety
//   item_name?: string;
//   rate?: number;
//   location?: string;
// };

// type InventoryTransaction = {
//   id: number;
//   po_number: string;
//   vendor: string;
//   challan_number: string;
//   receiver_name: string;
//   receiver_phone: string;
//   receiving_date: string;
//   challan_image: string;
//   trasaction_type: "INWARD" | "OUTWARD";

//   previous_qty: number;
//   inventory_item_id: number;
//   transaction_qty: number;
//   remark: string;
//   date: string;
//   inventory?: {
//     name: string;
//     unit: string;
//   };
//   item_name: string;
//   previous_quantity?: number;
//   after_quantity?: number;
//   // Added for consistency
//   unit?: string;
// };

// type Item = {
//   id: string;
//   item_name: string;
//   unit: string;
//   standard_rate: number;
//   location: string;
//   // Add other item properties as needed
// };
// interface MaterialInpoTransaction {
//   po_id: string;
//   po_number: string;
//   challanNumber: string;
//   vendor: string;
//   vendor_id: number;
//   receivingDate: string;
//   receiverName: string;
//   receiverPhone: string;
//   deliveryLocation: string;
//   challan_image: File | null;
//   items: any;
// }

// export default function StoreManagement() {
//   const { user, profile } = useAuth();
//   const [inventory, setInventory] = useState<InventoryItem[]>([]);
//   const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
//   const [loadTableData, setLoadTableData] = useState<any>();
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeFormTab, setActiveFormTab] = useState<string>("");
//   const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
//     []
//   );
//   const [selectedPOTransaction, setSelectedPOTransaction] = useState<
//     any | null
//   >(null);
//   const [filteredTransactions, setFilteredTransactions] = useState<
//     InventoryTransaction[]
//   >([]);
//   const [activeTab, setActiveTab] = useState<"tracking" | "management">(
//     "management"
//   );
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [allItems, setAllItems] = useState<Item[]>([]);
//   const [itemsLoading, setItemsLoading] = useState(true);
//   const [inventoryLoading, setInventoryLoading] = useState(true);
//   const [transactionsLoading, setTransactionsLoading] = useState(true);
//   const [subTabs, setSubTabs] = useState("MaterialIn");
//   const [dataUpdated, setDataUpdated] = useState("");

//   // --- Permissions ---
//   const can = (permission: string) => {
//     const role =
//       (profile as any)?.role_name ??
//       (profile as any)?.role ??
//       (user as any)?.role ??
//       null;
//     if (role === "admin") return true;
//     const perms: Record<string, boolean> | null =
//       (profile as any)?.permissions ?? null;
//     if (perms && typeof perms === "object") {
//       return Boolean(perms[permission]);
//     }
//     return false;
//   };

//   // --- Helper to find item by ID ---
//   const findItemById = (itemId: string): Item | undefined => {
//     return allItems.find((item) => item.id === itemId);
//   };

//   // --- Helper to find inventory item by ID ---
//   const findInventoryItemById = (
//     inventoryItemId: number
//   ): InventoryItem | undefined => {
//     return inventory.find((item) => item.id === inventoryItemId);
//   };

//   // --- Load Items First (Prerequisite for Inventory) ---
//   const loadAllItems = async () => {
//     try {
//       setItemsLoading(true);
//       const data: Item[] = await ItemsApi.getItems();
//       setAllItems(data);
//       return data;
//     } catch (error) {
//       console.error("Error loading items:", error);
//       alert("Failed to load items data");
//       return [];
//     } finally {
//       setItemsLoading(false);
//     }
//   };

//   // --- Load Inventory (Depends on Items) ---
//   const loadInventory = async (items: Item[]) => {
//     try {
//       setInventoryLoading(true);
//       const data: any = await inventoryApi.getInventory();

//       // Map inventory data with item information
//       const inventoryData: InventoryItem[] = data.map((inventoryItem: any) => {
//         const item: any = items.find((i) => i.id === inventoryItem.item_id);
//         return {
//           ...inventoryItem,
//           item_name: item?.item_name || "Unknown",
//           item_code: item?.item_code || "MAT000",
//           unit: item?.unit || "N/A",
//           rate: item?.standard_rate || 0,
//           location: item?.location || "N/A",
//         };
//       });

//       setInventory(inventoryData);
//       return inventoryData;
//     } catch (error) {
//       console.error("Error loading inventory:", error);
//       alert("Failed to load inventory data");
//       return [];
//     } finally {
//       setInventoryLoading(false);
//     }
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

//   // --- Load Transactions ---
//   const loadTransactions = async () => {
//     try {
//       setTransactionsLoading(true);

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
//     } finally {
//       setTransactionsLoading(false);
//     }
//   };

//   // --- Load All Data with Proper Sequencing ---
//   const loadAllData = async () => {
//     setRefreshing(true);
//     try {
//       // 1. Load items first
//       const items = await loadAllItems();

//       // 2. Load inventory (depends on items)
//       const inventoryData = await loadInventory(items);

//       // 3. Load transactions (can run in parallel with inventory if no dependency)
//       await loadTransactions();

//       // Update filtered states
//       if (activeTab === "management") {
//         setFilteredInventory(inventoryData);
//       } else {
//         setFilteredTransactions(transactions);
//       }
//     } catch (error) {
//       console.error("Error loading all data:", error);
//       alert("Failed to load data");
//     } finally {
//       setRefreshing(false);
//       setLoading(false);
//     }
//   };

//   // Initial load
//   useEffect(() => {
//     loadAllData();
//   }, []);

//   // --- Search Filtering with useMemo for Performance ---
//   useEffect(() => {
//     const searchLower = searchTerm.toLowerCase();

//     if (activeTab === "management") {
//       const filtered = inventory.filter((item) => {
//         const itemName = item.item_name?.toLowerCase() || "";
//         const status = item.status.toLowerCase();

//         return itemName.includes(searchLower) || status.includes(searchLower);
//       });
//       setFilteredInventory(filtered);
//     } else {
//       const filtered = transactions.filter((transaction) => {
//         const itemName = transaction.vendor?.toLowerCase() || "";
//         const type = transaction.po_number.toLowerCase();
//         const remark = transaction.receiver_name.toLowerCase();

//         return (
//           itemName.includes(searchLower) ||
//           type.includes(searchLower) ||
//           remark.includes(searchLower)
//         );
//       });
//       setFilteredTransactions(filtered);
//     }
//   }, [searchTerm, inventory, transactions, activeTab]);

//   // --- Handlers ---
//   const handleEdit = (item: InventoryItem) => {
//     const data: any = {
//       id: item.id,
//       item_id: item.item_id,
//       name: item.item_name,
//       unit: item.unit,
//       rate: item.rate,
//       quantity: item.quantity,
//       reorder_qty: item.reorder_qty,
//       location: item.location,
//       status: item.status,
//       total_value: Number(item.rate) * Number(item.quantity),
//     };
//     console.log(data);
//     setSelectedItem(data);
//     setShowEditModal(true);
//   };

//   const handleDelete = async (id: number) => {
//     if (
//       !confirm(
//         "Are you sure you want to delete this inventory item? This action cannot be undone."
//       )
//     ) {
//       return;
//     }

//     try {
//       await inventoryApi.deleteInventory(id);
//       alert("Inventory item deleted successfully!");
//       // Reload only inventory, not everything
//       const items: any = allItems.length ? allItems : await ItemsApi.getItems();
//       await loadInventory(items);
//     } catch (error) {
//       console.error("Error deleting inventory:", error);
//       alert("Failed to delete inventory item");
//     }
//   };

//   // --- Helper Functions ---
//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       "IN STOCK": "bg-green-100 text-green-700",
//       "LOW STOCK": "bg-yellow-100 text-yellow-700",
//       "OUT OF STOCK": "bg-red-100 text-red-700",
//     };
//     return colors[status] || "bg-gray-100 text-gray-700";
//   };

//   const getTransactionTypeColor = (type: string) => {
//     const colors: Record<string, string> = {
//       CREDIT: "bg-green-100 text-green-700",
//       DEBIT: "bg-red-100 text-red-700",
//     };
//     return colors[type] || "bg-gray-100 text-gray-700";
//   };

//   const formatDate = (dateString: string) => {
//     try {
//       return new Date(dateString).toLocaleDateString("en-IN", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       });
//     } catch (error) {
//       return "Invalid Date";
//     }
//   };

//   // Calculate total value safely
//   const calculateTotalValue = (item: InventoryItem): number => {
//     const rate = item.rate || 0;
//     const quantity = item.quantity || 0;
//     return rate * quantity;
//   };

//   // Calculate after quantity safely
//   const reminder = async (item: any) => {
//     try {
//       const payload = {
//         title: `Inventory Reminder (${item.item_name})`,
//         description: `Inventory Reminder: In Stock ${
//           item.quantity + " " + item.unit
//         } of ${item.item_name}(${item.item_code}) status: ${item.status}`,
//         type: "reminder",
//       };
//       const result: any = await NotificationsApi.createNotification(payload);
//       if (result.success) {
//         alert("Reminder send successfully.");
//       } else {
//         alert("Failed to send reminder.");
//       }
//     } catch (error) {
//       alert("Something went wrong.");
//     }
//   };

//   // --- Loading State ---
//   if (loading && !refreshing) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading store management...</p>
//         </div>
//       </div>
//     );
//   }

//   // --- Render Main UI ---
//   return (
//     <div className="p-6">
//       <div className="flex flex-col md:flex-row justify-between items-center mb-6">
//         <div>
//           <h1 className="text-[1.2rem] md:text-3xl font-bold text-gray-800 ">
//             Store Management
//           </h1>
//           <p className="text-gray-600 mt-1 text-[0.8rem] md:text-[1rem]">
//             Manage and track inventory
//           </p>
//         </div>
//         <div className="flex items-center gap-3">
//           {can("create_inventory") && (
//             <div className="border-b border-gray-200 px-6 ">
//               <div className="flex space-x-4 text-[0.8rem] md:text-[1rem]">
//                 <button
//                   onClick={() => setActiveFormTab("in")}
//                   className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
//                     activeFormTab === "in"
//                       ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                       : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//                   }`}
//                 >
//                   <PackagePlus className="w-5 h-5" />
//
//                 </button>
//                 <button
//                   onClick={() => setActiveFormTab("out")}
//                   className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
//                     activeFormTab === "out"
//                       ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                       : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//                   }`}
//                 >
//                   <PackageMinus className="w-5 h-5" />
//                   Material Out
//                 </button>
//                 <button
//                   onClick={() => setActiveFormTab("issue")}
//                   className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
//                     activeFormTab === "issue"
//                       ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                       : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//                   }`}
//                 >
//                   <UserCheck className="w-5 h-5" />
//                   Issue Material
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//         {activeFormTab === "in" && (
//           <MaterialInForm
//             setLoadTableData={setLoadTableData}
//             setActiveFormTab={setActiveFormTab}
//             loadAllData={loadAllData}
//           />
//         )}
//         {activeFormTab === "out" && (
//           <MaterialOutForm
//             setLoadTableData={setLoadTableData}
//             setActiveFormTab={setActiveFormTab}
//             allInventory={filteredInventory}
//             loadAllData={loadAllData}
//           />
//         )}
//         {activeFormTab === "issue" && (
//           <IssueMaterial
//             setLoadTableData={setLoadTableData}
//             setActiveFormTab={setActiveFormTab}
//             allInventory={filteredInventory}
//             loadAllData={loadAllData}
//           />
//         )}
//       </div>

//       {/* Tabs */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="flex border-b border-gray-200 text-[0.8rem] md:text-[1rem]">
//           <button
//             onClick={() => setActiveTab("tracking")}
//             className={`flex-1 px-6 py-2 md:py-4 font-medium transition ${
//               activeTab === "tracking"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Package className="w-5 h-5" />
//               <span>Inventory Tracking</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("management")}
//             className={`flex-1 px-6 py-2 md:py-4 font-medium transition ${
//               activeTab === "management"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <FileText className="w-5 h-5" />
//               <span>Inventory Management</span>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Sub Tabs */}
//       {activeTab === "tracking" && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-2 mb-6 overflow-hidden">
//           <div className="flex border-b border-gray-200 text-[0.8rem] md:text-[1rem] flex-col md:flex-row">
//             <button
//               onClick={() => setSubTabs("MaterialIn")}
//               className={`flex-1 px-6 py-2 font-medium transition ${
//                 subTabs === "MaterialIn"
//                   ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                   : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//               }`}
//             >
//               <div className="flex items-center justify-center gap-2">
//                 <Download className="w-5 h-5" />
//                 <span>Material In Transactions</span>
//               </div>
//             </button>
//             <button
//               onClick={() => setSubTabs("MaterialOut")}
//               className={`flex-1 px-6 py-2 font-medium transition ${
//                 subTabs === "MaterialOut"
//                   ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                   : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//               } border-r border-l border-slate-200`}
//             >
//               <div className="flex items-center justify-center gap-2">
//                 <Truck className="w-5 h-5" />
//                 <span>Material Out Transactions</span>
//               </div>
//             </button>
//             <button
//               onClick={() => setSubTabs("MaterialIssue")}
//               className={`flex-1 px-6 py-2 font-medium transition ${
//                 subTabs === "MaterialIssue"
//                   ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                   : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//               }`}
//             >
//               <div className="flex items-center justify-center gap-2">
//                 <HandCoins className="w-5 h-5" />
//                 <span>Material Issue Transactions</span>
//               </div>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Search */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder={
//               activeTab === "tracking"
//                 ? "Search inventory transactions..."
//                 : "Search inventory items..."
//             }
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           {searchTerm && (
//             <button
//               onClick={() => setSearchTerm("")}
//               className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
//             >
//               ×
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Content based on active tab */}
//       {activeTab === "tracking" && subTabs === "MaterialIn" && (
//         <MaterialInTransactions loadTableData={loadTableData} />
//       )}
//       {/* Content based on active tab */}
//       {activeTab === "tracking" && subTabs === "MaterialOut" && (
//         <MaterialOutTransactions loadTableData={loadTableData} />
//       )}

//       {activeTab === "tracking" && subTabs === "MaterialIssue" && (
//         <MaterialIssueTransactions loadTableData={loadTableData} />
//       )}
//       {activeFormTab === "view" && (
//         <ViewPOTransaction
//           setActiveFormTab={setActiveFormTab}
//           viewPOTransaction={selectedPOTransaction}
//         />
//       )}

//       {activeTab === "management" && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Material Name
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Current Stock
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Unit Rate
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Stock Value
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Material Location
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Status
//                   </th>
//                   <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {filteredInventory.map((item) => {
//                   const totalValue = calculateTotalValue(item);

//                   return (
//                     <tr key={item.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4">
//                         <div className="font-medium text-gray-800">
//                           {item.item_name || "Unknown"}
//                           <p className="text-xs text-slate-400">
//                             {item.item_code}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="font-semibold text-gray-800">
//                           {item.quantity} {item.unit}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="text-sm text-gray-700 flex items-center">
//                           <IndianRupee
//                             size={14}
//                             className="text-green-600 mr-1"
//                           />
//                           {item.rate?.toLocaleString("en-IN") || "0"}
//                         </div>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span className="font-medium text-gray-700 flex items-center">
//                           <IndianRupee
//                             size={14}
//                             className="text-green-600 mr-1"
//                           />
//                           {totalValue.toLocaleString("en-IN")}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">
//                         {item.location || "N/A"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             item.status
//                           )}`}
//                         >
//                           {item.status}
//                         </span>
//                         {item.status === "LOW STOCK" && (
//                           <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
//                             <AlertTriangle className="w-3 h-3" />
//                             Reorder needed
//                           </div>
//                         )}
//                         {item.status === "OUT OF STOCK" && (
//                           <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
//                             <AlertTriangle className="w-3 h-3" />
//                             Out of stock
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => reminder(item)}
//                             className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
//                             title="Reminder"
//                           >
//                             <Bell className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleEdit(item)}
//                             className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
//                             title="Edit"
//                             disabled={!can("update_inventory")}
//                           >
//                             <Edit2 className="w-4 h-4" />
//                           </button>
//                           {can("delete_inventory") && (
//                             <button
//                               onClick={() => handleDelete(item.id)}
//                               className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                               title="Delete"
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>

//             {filteredInventory.length === 0 && (
//               <div className="text-center py-12">
//                 <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                 <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                   No Inventory Items Found
//                 </h3>
//                 <p className="text-gray-600">
//                   {searchTerm
//                     ? "Try a different search term"
//                     : 'Click "Add Transaction" to get started'}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Modals */}
//       {showEditModal && selectedItem && (
//         <UpdateInventoryForm
//           setShowEditModal={setShowEditModal}
//           selectedItem={selectedItem}
//           loadAllData={loadAllData}
//         />
//       )}
//     </div>
//   );
// }
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/StoreManagement.tsx

import { useState, useEffect, useMemo, SetStateAction } from "react";
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Search,
  FileText,
  Package,
  Loader2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  IndianRupee,
  Bell,
  PackagePlus,
  PackageMinus,
  UserCheck,
  HandCoins,
  Download,
  Truck,
  Filter,
  X,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import InventoryTransaction from "../components/InventoryTransaction";
import UpdateInventoryForm from "../components/UpdateInventory";
import inventoryApi from "../lib/inventoryApi";
import inventoryTransactionApi from "../lib/inventoryTransactionApi";
import ItemsApi from "../lib/itemsApi";
import MaterialInForm from "../components/StoreManagement/MaterialInForm";
import MaterialOutForm from "../components/StoreManagement/MaterialOutForm";
import poApi from "../lib/poApi";
import vendorApi from "../lib/vendorApi";
import ViewPOTransaction from "../components/StoreManagement/ViewPOTransaction";
import NotificationsApi from "../lib/notificationApi";
import IssueMaterial from "../components/StoreManagement/IssueMaterial";
import MaterialInTransactions from "../components/materialTransactions/MaterialInTransactions";
import MaterialOutTransactions from "../components/materialTransactions/MaterialOutTransactions";
import MaterialIssueTransactions from "../components/materialTransactions/MaterialIssueTransactions";
import { toast } from "sonner";

type InventoryItem = {
  id: number;
  item_id: string;
  item_code: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  reorder_qty: number;
  unit: string;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  created_at?: string;
  updated_at?: string;
  item_name?: string;
  rate?: number;
  location?: string;
};

type InventoryTransaction = {
  id: number;
  po_number: string;
  vendor: string;
  challan_number: string;
  receiver_name: string;
  receiver_phone: string;
  receiving_date: string;
  challan_image: string;
  trasaction_type: "INWARD" | "OUTWARD";
  previous_qty: number;
  inventory_item_id: number;
  transaction_qty: number;
  remark: string;
  date: string;
  inventory?: {
    name: string;
    unit: string;
  };
  item_name: string;
  previous_quantity?: number;
  after_quantity?: number;
  unit?: string;
};

type Item = {
  id: string;
  item_name: string;
  unit: string;
  standard_rate: number;
  location: string;
};

interface MaterialInpoTransaction {
  po_id: string;
  po_number: string;
  challanNumber: string;
  vendor: string;
  vendor_id: number;
  receivingDate: string;
  receiverName: string;
  receiverPhone: string;
  deliveryLocation: string;
  challan_image: File | null;
  items: any;
}

// ADD THIS INTERFACE
interface StoreManagementProps {
  activeFormTab?: string;
  setActiveFormTab?: React.Dispatch<SetStateAction<String>>;
}

export default function StoreManagement({
  activeFormTab = "",
  setActiveFormTab = () => {},
}: StoreManagementProps): JSX.Element {
  // ADD RETURN TYPE JSX.Element
  const { user, profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loadTableData, setLoadTableData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // REMOVE THIS LINE - it's now coming from props
  // const [activeFormTab, setActiveFormTab] = useState<string>("");

  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    [],
  );
  const [selectedPOTransaction, setSelectedPOTransaction] = useState<
    any | null
  >(null);
  const [filteredTransactions, setFilteredTransactions] = useState<
    InventoryTransaction[]
  >([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">(
    "management",
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [subTabs, setSubTabs] = useState("MaterialIn");
  const [dataUpdated, setDataUpdated] = useState("");

  // Filter sidebar states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Column search states
  const [searchName, setSearchName] = useState("");
  const [searchStock, setSearchStock] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchItemCode, setSearchItemCode] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [searchRate, setSearchRate] = useState("");
  const [searchStockValue, setSearchStockValue] = useState("");

  const [itemCategories, setItemCategories] = useState<string[]>([]);
  const [itemSubCategories, setItemSubCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [filterSubCategory, setFilterSubCategory] = useState(""); // ✅ ADD THIS
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // --- Permissions ---
  const can = (permission: string) => {
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      null;
    if (role === "admin") return true;
    const perms: Record<string, boolean> | null =
      (profile as any)?.permissions ?? null;
    if (perms && typeof perms === "object") {
      return Boolean(perms[permission]);
    }
    return false;
  };

  // --- Helper to find item by ID ---
  const findItemById = (itemId: string): Item | undefined => {
    return allItems.find((item) => item.id === itemId);
  };

  // --- Helper to find inventory item by ID ---
  const findInventoryItemById = (
    inventoryItemId: number,
  ): InventoryItem | undefined => {
    return inventory.find((item) => item.id === inventoryItemId);
  };

  // --- Load Items First (Prerequisite for Inventory) ---
  const loadAllItems = async () => {
    try {
      setItemsLoading(true);
      const data: any = await ItemsApi.getItems();
      setAllItems(data);
      return data;
    } catch (error) {
      console.error("Error loading items:", error);
      alert("Failed to load items data");
      return [];
    } finally {
      setItemsLoading(false);
    }
  };

  // --- Load Inventory (Depends on Items) ---
  const loadInventory = async (items: Item[]) => {
    try {
      setInventoryLoading(true);
      const data: any = await inventoryApi.getInventory();

      const inventoryData: InventoryItem[] = data.map((inventoryItem: any) => {
        const item: any = items.find((i) => i.id === inventoryItem.item_id);
        return {
          ...inventoryItem,
          item_name: item?.item_name || "Unknown",
          item_code: item?.item_code || "MAT000",
          unit: item?.unit || "N/A",
          rate: item?.standard_rate || 0,
          location: item?.location || "N/A",
        };
      });

      setInventory(inventoryData);
      return inventoryData;
    } catch (error) {
      console.error("Error loading inventory:", error);
      alert("Failed to load inventory data");
      return [];
    } finally {
      setInventoryLoading(false);
    }
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

  // --- Load Transactions ---
  const loadTransactions = async () => {
    try {
      setTransactionsLoading(true);
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
    } finally {
      setTransactionsLoading(false);
    }
  };

  // --- Load All Data with Proper Sequencing ---
  const loadAllData = async () => {
    setRefreshing(true);
    try {
      const items = await loadAllItems();
      const inventoryData = await loadInventory(items);
      await loadTransactions();
      await loadCategories(); // ✅ ADD THIS LINE

      if (activeTab === "management") {
        setFilteredInventory(inventoryData);
      } else {
        setFilteredTransactions(transactions);
      }
    } catch (error) {
      console.error("Error loading all data:", error);
      alert("Failed to load data");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);

      // Fetch categories
      const categories = await ItemsApi.getItemCategories();
      setItemCategories(categories);

      // Fetch all sub-categories initially
      const subCategories = await ItemsApi.getItemSubCategories();
      setItemSubCategories(subCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category);
    setFilterSubCategory(""); // Reset sub-category when category changes

    if (!category) {
      // If no category selected, show all sub-categories
      try {
        const subCategories = await ItemsApi.getItemSubCategories();
        setItemSubCategories(subCategories);
      } catch (error) {
        console.error("Error loading all sub-categories:", error);
      }
      return;
    }

    try {
      // Fetch items in selected category
      const itemsInCategory = await ItemsApi.getItemsByCategory(category);

      // Extract unique sub-categories from these items
      const uniqueSubCategories = Array.from(
        new Set(
          itemsInCategory.map((item) => item.item_sub_category).filter(Boolean),
        ),
      ) as string[];

      setItemSubCategories(uniqueSubCategories);
    } catch (error) {
      console.error(`Error loading sub-categories for ${category}:`, error);
    }
  };
  // Initial load
  useEffect(() => {
    loadAllData();
  }, []);

  // --- Search Filtering ---
  useEffect(() => {
    if (activeTab === "management") {
      let filtered = inventory;

      // Column searches
      if (searchName) {
        filtered = filtered.filter((item) =>
          (item.item_name?.toLowerCase() || "").includes(
            searchName.toLowerCase(),
          ),
        );
      }

      if (searchItemCode) {
        filtered = filtered.filter((item) =>
          (item.item_code?.toLowerCase() || "").includes(
            searchItemCode.toLowerCase(),
          ),
        );
      }

      if (searchStock) {
        filtered = filtered.filter((item) =>
          item.quantity.toString().includes(searchStock),
        );
      }

      if (searchCategory) {
        filtered = filtered.filter((item) =>
          (item.category?.toLowerCase() || "").includes(
            searchCategory.toLowerCase(),
          ),
        );
      }

      if (searchLocation) {
        filtered = filtered.filter((item) =>
          (item.location?.toLowerCase() || "").includes(
            searchLocation.toLowerCase(),
          ),
        );
      }

      if (searchStatus) {
        filtered = filtered.filter((item) =>
          item.status.toLowerCase().includes(searchStatus.toLowerCase()),
        );
      }

      if (searchUnit) {
        filtered = filtered.filter((item) =>
          (item.unit?.toLowerCase() || "").includes(searchUnit.toLowerCase()),
        );
      }

      if (searchRate) {
        filtered = filtered.filter((item) =>
          (item.rate?.toString() || "").includes(searchRate),
        );
      }

      if (searchStockValue) {
        filtered = filtered.filter((item) => {
          const totalValue = (item.rate || 0) * (item.quantity || 0);
          return totalValue.toString().includes(searchStockValue);
        });
      }

      // Sidebar filters
      console.log("before filtered", filtered);
      if (filterStatus) {
        filtered = filtered.filter((item) => item.status === filterStatus);
      }

      if (filterCategory) {
        filtered = filtered.filter(
          (item: any) => item.item_category === filterCategory,
        );

        console.log("filtered data", filtered);
      }
      if (filterSubCategory) {
        filtered = filtered.filter(
          (item: any) => item.item_sub_category === filterSubCategory,
        );

        console.log("filtered data after subcategory", filtered);
      }

      if (filterLocation) {
        filtered = filtered.filter((item) =>
          (item.location?.toLowerCase() || "").includes(
            filterLocation.toLowerCase(),
          ),
        );
      }

      setFilteredInventory(filtered);
    } else {
      const filtered = transactions.filter((transaction) => {
        const itemName = transaction.vendor?.toLowerCase() || "";
        const type = transaction.po_number.toLowerCase();
        const remark = transaction.receiver_name.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        return (
          itemName.includes(searchLower) ||
          type.includes(searchLower) ||
          remark.includes(searchLower)
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [
    searchName,
    searchItemCode,
    searchStock,
    searchCategory,
    searchLocation,
    searchStatus,
    searchUnit,
    searchRate,
    searchStockValue,
    filterStatus,
    filterCategory,
    filterSubCategory,
    filterLocation,
    searchTerm,
    inventory,
    transactions,
    activeTab,
  ]);

  // Calculate pagination data
  useEffect(() => {
    if (activeTab === "management") {
      const total = filteredInventory.length;
      const pages = Math.ceil(total / itemsPerPage);
      setTotalPages(pages > 0 ? pages : 1);

      // Reset to page 1 if current page exceeds total pages
      if (currentPage > pages && pages > 0) {
        setCurrentPage(1);
      }
    }
  }, [filteredInventory, itemsPerPage, currentPage, activeTab]);

  // Get current page items
  const getCurrentPageItems = () => {
    if (activeTab !== "management") return [];

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredInventory.slice(startIndex, endIndex);
  };

  // --- Checkbox handlers ---
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const currentPageItems = getCurrentPageItems();
      const allIds = new Set(currentPageItems.map((item) => item.id));
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

    const currentPageItems = getCurrentPageItems();
    setSelectAll(newSelected.size === currentPageItems.length);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue) && newValue > 0) {
      setItemsPerPage(newValue);
      setCurrentPage(1); // Reset to first page when changing items per page
    }
  };

  // --- Handlers ---
  const handleEdit = (item: InventoryItem) => {
    const data: any = {
      id: item.id,
      item_id: item.item_id,
      name: item.item_name,
      unit: item.unit,
      rate: item.rate,
      quantity: item.quantity,
      reorder_qty: item.reorder_qty,
      location: item.location,
      status: item.status,
      total_value: Number(item.rate) * Number(item.quantity),
    };
    setSelectedItem(data);
    setShowEditModal(true);
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this inventory item? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      await inventoryApi.deleteInventory(id);
      alert("Inventory item deleted successfully!");
      const items: any = allItems.length ? allItems : await ItemsApi.getItems();
      await loadInventory(items);
    } catch (error) {
      console.error("Error deleting inventory:", error);
      alert("Failed to delete inventory item");
    }
  };

  // --- Helper Functions ---
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "IN STOCK": "bg-green-100 text-green-700",
      "LOW STOCK": "bg-yellow-100 text-yellow-700",
      "OUT OF STOCK": "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const calculateTotalValue = (item: InventoryItem): number => {
    const rate = item.rate || 0;
    const quantity = item.quantity || 0;
    return rate * quantity;
  };

  const reminder = async (item: any) => {
    try {
      const payload = {
        title: `Inventory Reminder (${item.item_name})`,
        description: `Inventory Reminder: In Stock ${
          item.quantity + " " + item.unit
        } of ${item.item_name}(${item.item_code}) status: ${item.status}`,
        type: "reminder",
      };
      const result: any = await NotificationsApi.createNotification(payload);
      if (result.success) {
        toast.error("Reminder sent successfully.");
      } else {
        toast.error("Failed to send reminder.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterSubCategory(""); // ✅ ADD THIS

    setFilterLocation("");
    setSelectedCategory(""); // ✅ ADD THIS

    setSearchName("");
    setSearchItemCode("");
    setSearchStock("");
    setSearchCategory("");
    setSearchLocation("");
    setSearchStatus("");
    setSearchUnit("");
    setSearchRate("");
    setSearchStockValue("");
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  // Get unique categories and locations for filters
  const uniqueCategories = Array.from(
    new Set(inventory.map((item) => item.category).filter(Boolean)),
  );
  const uniqueLocations = Array.from(
    new Set(inventory.map((item) => item.location).filter(Boolean)),
  );

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 px-3">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading store management...</p>
        </div>
      </div>
    );
  }

  // --- Render Main UI ---
  return (
    <div className="p-0 px-0 sm:px-0 -mt-4 bg-gray-50 min-h-screen">
      {" "}
      {/* Material Forms */}
      {activeFormTab === "in" && (
        <MaterialInForm
          setLoadTableData={setLoadTableData}
          setActiveFormTab={setActiveFormTab}
          loadAllData={loadAllData}
        />
      )}
      {activeFormTab === "out" && (
        <MaterialOutForm
          setLoadTableData={setLoadTableData}
          setActiveFormTab={setActiveFormTab}
          allInventory={filteredInventory}
          loadAllData={loadAllData}
        />
      )}
      {activeFormTab === "issue" && (
        <IssueMaterial
          setLoadTableData={setLoadTableData}
          setActiveFormTab={setActiveFormTab}
          allInventory={filteredInventory}
          loadAllData={loadAllData}
        />
      )}
      {/* Main Tabs */}
      <div className=" sticky top-[120px] md:top-20 mt-12 md:mt-2 flex bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6 mx-0 md:mx-0">
        {" "}
        <button
          onClick={() => setActiveTab("tracking")}
          className={`flex-1 px-3 md:px-6 py-2 md:py-4 font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "tracking"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText
            className={`w-3 h-3 md:w-5 md:h-5 ${activeTab === "tracking" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs md:text-base">Inventory Tracking</span>
        </button>
        <button
          onClick={() => setActiveTab("management")}
          className={`flex-1 px-3 md:px-6 py-2 md:py-4 font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "management"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Package
            className={`w-3 h-3 md:w-5 md:h-5 ${activeTab === "management" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs sm:text-xs md:text-base">
            Inventory Management
          </span>
        </button>
      </div>
      {/* Sub Tabs for Tracking */}
      {activeTab === "tracking" && (
        <div className=" sticky top-[155px] md:top-36 z-10  flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4 md:mb-6 mx-4 md:mx-0">
          <button
            onClick={() => setSubTabs("MaterialIn")}
            className={`flex-1 px-2 md:px-4 py-2 font-medium transition-all duration-200
        flex items-center justify-center gap-1.5
        ${
          subTabs === "MaterialIn"
            ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
            : "text-gray-600 hover:bg-gray-50"
        }`}
          >
            <Download
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                subTabs === "MaterialIn" ? "text-emerald-600" : "text-gray-500"
              }`}
            />
            <span className="text-[11px] md:text-sm whitespace-nowrap">
              Material In
            </span>
          </button>

          <button
            onClick={() => setSubTabs("MaterialOut")}
            className={`flex-1 px-2 md:px-4 py-2 font-medium transition-all duration-200
        flex items-center justify-center gap-1.5
        ${
          subTabs === "MaterialOut"
            ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
            : "text-gray-600 hover:bg-gray-50"
        }`}
          >
            <Truck
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                subTabs === "MaterialOut" ? "text-blue-600" : "text-gray-500"
              }`}
            />
            <span className="text-[11px] md:text-sm whitespace-nowrap">
              Material Out
            </span>
          </button>

          <button
            onClick={() => setSubTabs("MaterialIssue")}
            className={`flex-1 px-2 md:px-4 py-2 font-medium transition-all duration-200
        flex items-center justify-center gap-1.5
        ${
          subTabs === "MaterialIssue"
            ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
            : "text-gray-600 hover:bg-gray-50"
        }`}
          >
            <HandCoins
              className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                subTabs === "MaterialIssue" ? "text-amber-600" : "text-gray-500"
              }`}
            />
            <span className="text-[11px] md:text-sm whitespace-nowrap">
              Material Issue
            </span>
          </button>
        </div>
      )}
      {/* Transaction Views */}
      {activeTab === "tracking" && subTabs === "MaterialIn" && (
        <MaterialInTransactions loadTableData={loadTableData} />
      )}
      {activeTab === "tracking" && subTabs === "MaterialOut" && (
        <MaterialOutTransactions loadTableData={loadTableData} />
      )}
      {activeTab === "tracking" && subTabs === "MaterialIssue" && (
        <MaterialIssueTransactions loadTableData={loadTableData} />
      )}
      {/* Management Table */}
      {activeTab === "management" && (
        <div className="   sticky top-40 z-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
    {/* Change 1: Updated container with max height */}
      <div className="overflow-y-auto max-h-[calc(100vh-310px)] md:max-h-[calc(100vh-250px)] ">
      <table className=" sticky top-48 z-10 w-full min-w-[1000px]">
        {/* Change 2: Added sticky to thead */}
        <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                {/* Column Headers */}
                <tr>
                  <th className="px-2 md:px-4 py-2 text-left w-72">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Material Details
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Current Stock
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Unit Rate
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock Value
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Location
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </div>
                  </th>
                  <th className="px-2 md:px-4 py-2 text-center">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </div>
                  </th>
                </tr>

                {/* Search Row */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* Material Details Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Search material name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Current Stock Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Search stock quantity..."
                      value={searchStock}
                      onChange={(e) => setSearchStock(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Unit Rate Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Search rate..."
                      value={searchRate}
                      onChange={(e) => setSearchRate(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Stock Value Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Search value..."
                      value={searchStockValue}
                      onChange={(e) => setSearchStockValue(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Location Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Status Column */}
                  <td className="px-2 md:px-4 py-0.5">
                    <input
                      type="text"
                      placeholder="Status..."
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </td>

                  {/* Actions Column */}
                  <td className="px-2 md:px-4 py-0.5 text-center">
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

              {/* Table Body */}
              <tbody className="divide-y divide-gray-200">
                {getCurrentPageItems().length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm md:text-lg font-medium">
                        No inventory items found
                      </p>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        Try adjusting your search or filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  getCurrentPageItems().map((item, index) => {
                    const totalValue = calculateTotalValue(item);
                    const isSelected = selectedItems.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        {/* Material Details Column */}
                        <td className="px-2 md:px-4 py-2 w-72 text-wrap">
                          <div className="flex items-start gap-1.5 md:gap-3 w-full">
                            <div className="bg-[#C62828] w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-white font-thin text-[10px] md:text-xs flex-shrink-0 mt-0.5">
                              {(item.item_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className="font-semibold text-gray-900 text-xs md:text-sm leading-tight break-words"
                                title={item.item_name || "Unknown"}
                              >
                                {item.item_name || "Unknown"}
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                                <span className="inline-block px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-[9px] md:text-xs font-medium">
                                  {item.item_code || "N/A"}
                                </span>
                                {item.category && (
                                  <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px] md:text-xs font-medium">
                                    {item.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Current Stock */}
                        <td className="px-2 md:px-4 py-2">
                          <div className="font-semibold text-gray-800 text-xs md:text-sm">
                            {item.quantity} {item.unit}
                          </div>
                          <div className="text-[10px] md:text-xs text-gray-500">
                            Reorder: {item.reorder_qty}
                          </div>
                        </td>

                        {/* Unit Rate */}
                        <td className="px-2 md:px-4 py-2">
                          <div className="text-xs text-gray-700 flex items-center">
                            <IndianRupee
                              size={10}
                              className="text-green-600 mr-0.5 flex-shrink-0"
                            />
                            <span className="truncate">
                              {item.rate?.toLocaleString("en-IN") || "0"}
                            </span>
                          </div>
                        </td>

                        {/* Stock Value */}
                        <td className="px-2 md:px-4 py-2">
                          <span className="font-medium text-gray-700 text-xs md:text-sm flex items-center">
                            <IndianRupee
                              size={10}
                              className="text-green-600 mr-0.5 flex-shrink-0"
                            />
                            <span className="truncate">
                              {totalValue.toLocaleString("en-IN")}
                            </span>
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-2 md:px-4 py-2 text-gray-700 text-xs md:text-sm">
                          <span
                            className="truncate block"
                            title={item.location || "N/A"}
                          >
                            {item.location || "N/A"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-2 md:px-4 py-2">
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              item.status,
                            )} truncate`}
                          >
                            {item.status}
                          </span>
                          {item.status === "LOW STOCK" && (
                            <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-yellow-600">
                              <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">Reorder needed</span>
                            </div>
                          )}
                          {item.status === "OUT OF STOCK" && (
                            <div className="mt-0.5 flex items-center gap-0.5 text-[10px] text-red-600">
                              <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
                              <span className="truncate">Out of stock</span>
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-2 md:px-4 py-2">
                          <div className="flex items-center justify-center gap-1 md:gap-2">
                            <button
                              onClick={() => reminder(item)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Send Reminder"
                            >
                              <Bell className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            </button>
                            {(can("update_inventory") ||
                              can("full_access")) && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-1 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredInventory.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-3 md:p-4">
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">

    {/* Items per page selector */}
    <div className="flex flex-wrap items-center gap-2 justify-between md:justify-start">
      <span className="text-xs md:text-sm text-gray-600">Show</span>

      <select
        onChange={(e) => handleItemsPerPageChange(e.target.value)}
        className="border border-slate-400 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm"
        value={itemsPerPage}
      >
        <option value={10}>10</option>
        <option value={25}>25</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>

      <span className="text-xs md:text-sm text-gray-600 whitespace-nowrap">
        items per page
      </span>
    </div>

    {/* Page info */}
    <div className="text-xs md:text-sm text-gray-700 text-center md:text-left">
      Showing{" "}
      <span className="font-semibold">
        {Math.min(
          (currentPage - 1) * itemsPerPage + 1,
          filteredInventory.length,
        )}
      </span>{" "}
      to{" "}
      <span className="font-semibold">
        {Math.min(
          currentPage * itemsPerPage,
          filteredInventory.length,
        )}
      </span>{" "}
      of{" "}
      <span className="font-semibold">
        {filteredInventory.length}
      </span>{" "}
      items
    </div>

    {/* Pagination buttons */}
    <div className="flex items-center justify-center md:justify-end gap-1 md:gap-2 flex-wrap">
      <button
        onClick={() => goToPage(1)}
        disabled={currentPage === 1}
        className={`p-1.5 md:p-2 rounded border ${
          currentPage === 1
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronsLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-1.5 md:p-2 rounded border ${
          currentPage === 1
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      <div className="flex items-center gap-1 flex-wrap justify-center">
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) pageNum = i + 1;
          else if (currentPage <= 3) pageNum = i + 1;
          else if (currentPage >= totalPages - 2)
            pageNum = totalPages - 4 + i;
          else pageNum = currentPage - 2 + i;

          return (
            <button
              key={pageNum}
              onClick={() => goToPage(pageNum)}
              className={`w-7 h-7 md:w-8 md:h-8 rounded border text-xs md:text-sm font-medium ${
                currentPage === pageNum
                  ? "bg-[#C62828] text-white border-[#C62828]"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-1.5 md:p-2 rounded border ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>

      <button
        onClick={() => goToPage(totalPages)}
        disabled={currentPage === totalPages}
        className={`p-1.5 md:p-2 rounded border ${
          currentPage === totalPages
            ? "border-gray-200 text-gray-400 cursor-not-allowed"
            : "border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronsRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
      </button>
    </div>

  </div>
</div>

          )}

          {/* Bulk Actions Bar */}
          {selectedItems.size > 0 && (
            <div className="border-t border-gray-200 bg-blue-50 p-2 md:p-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedItems.size === getCurrentPageItems().length
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                    />
                    <span className="text-xs md:text-sm text-gray-700 font-medium">
                      Select all on this page
                    </span>
                  </div>

                  <div className="text-xs md:text-sm text-gray-700 font-medium">
                    <span className="text-blue-700">{selectedItems.size}</span>{" "}
                    item(s) selected
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 md:gap-2">
                  <button
                    onClick={() => setSelectedItems(new Set())}
                    className="px-2 md:px-3 py-1 md:py-1.5 border border-gray-300 rounded hover:bg-gray-100 transition text-xs md:text-sm font-medium text-gray-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
              showFilterSidebar ? "opacity-100" : "opacity-0"
            }`}
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
        md:max-w-md md:w-96
      `}
          >
            {/* Header */}
            <div className="bg-[#C62828] px-4 py-3 flex justify-between items-center">
              <h2 className="text-sm md:text-lg font-bold text-white">
                Filters
              </h2>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-xs md:text-sm hover:bg-white hover:bg-opacity-20 px-2 md:px-3 py-1 md:py-1.5 rounded transition"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-1 md:focus:ring-2 focus:ring-[#C62828]"
                >
                  <option value="">All Statuses</option>
                  <option value="IN STOCK">In Stock</option>
                  <option value="LOW STOCK">Low Stock</option>
                  <option value="OUT OF STOCK">Out of Stock</option>
                </select>
              </div>

              {/* ✅ UPDATED: Category Filter with fetched categories */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Item Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => {
                    setFilterCategory(e.target.value);
                    handleCategoryChange(e.target.value); // ✅ Call category change handler
                  }}
                  className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-1 md:focus:ring-2 focus:ring-[#C62828]"
                  disabled={loadingCategories}
                >
                  <option value="">All Categories</option>
                  {loadingCategories ? (
                    <option value="" disabled>
                      Loading categories...
                    </option>
                  ) : itemCategories.length > 0 ? (
                    itemCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No categories available
                    </option>
                  )}
                </select>
              </div>

              {/* Sub-Category Filter - Disabled until category is selected */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Item Sub-Category
                </label>
                <select
                  value={filterSubCategory}
                  onChange={(e) => setFilterSubCategory(e.target.value)}
                  className={`w-full px-3 py-2 text-xs md:text-sm border rounded focus:ring-1 md:focus:ring-2 focus:ring-[#C62828] ${
                    !filterCategory
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300"
                  }`}
                  disabled={!filterCategory || loadingCategories}
                >
                  <option value="">All Sub-Categories</option>
                  {!filterCategory ? (
                    <option value="" disabled>
                      Select a category first
                    </option>
                  ) : loadingCategories ? (
                    <option value="" disabled>
                      Loading sub-categories...
                    </option>
                  ) : itemSubCategories.length > 0 ? (
                    itemSubCategories.map((subCategory) => (
                      <option key={subCategory} value={subCategory}>
                        {subCategory}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No sub-categories available for this category
                    </option>
                  )}
                </select>
                {!filterCategory && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a category first to see sub-categories
                  </p>
                )}
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded focus:ring-1 md:focus:ring-2 focus:ring-[#C62828]"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded hover:shadow-lg transition font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <UpdateInventoryForm
          setShowEditModal={setShowEditModal}
          selectedItem={selectedItem}
          loadAllData={loadAllData}
        />
      )}
      {/* View PO Transaction Modal */}
      {activeFormTab === "view" && (
        <ViewPOTransaction
          setActiveFormTab={setActiveFormTab}
          viewPOTransaction={selectedPOTransaction}
        />
      )}
    </div>
  );
}
