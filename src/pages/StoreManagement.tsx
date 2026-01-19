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
//                   Material In
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
import { useState, useEffect, useMemo } from "react";
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

export default function StoreManagement() {
  const { user, profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loadTableData, setLoadTableData] = useState<any>();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFormTab, setActiveFormTab] = useState<string>("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([]);
  const [selectedPOTransaction, setSelectedPOTransaction] = useState<any | null>(null);
  const [filteredTransactions, setFilteredTransactions] = useState<InventoryTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">("management");
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

  // Checkbox selection states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

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
    inventoryItemId: number
  ): InventoryItem | undefined => {
    return inventory.find((item) => item.id === inventoryItemId);
  };

  // --- Load Items First (Prerequisite for Inventory) ---
  const loadAllItems = async () => {
    try {
      setItemsLoading(true);
      const data: Item[] = await ItemsApi.getItems();
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
          (i: any) => i.id === transaction.vendor_id
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
          (item.item_name?.toLowerCase() || "").includes(searchName.toLowerCase())
        );
      }

      if (searchStock) {
        filtered = filtered.filter((item) =>
          item.quantity.toString().includes(searchStock)
        );
      }

      if (searchLocation) {
        filtered = filtered.filter((item) =>
          (item.location?.toLowerCase() || "").includes(searchLocation.toLowerCase())
        );
      }

      if (searchStatus) {
        filtered = filtered.filter((item) =>
          item.status.toLowerCase().includes(searchStatus.toLowerCase())
        );
      }

      // Sidebar filters
      if (filterStatus) {
        filtered = filtered.filter((item) => item.status === filterStatus);
      }

      if (filterCategory) {
        filtered = filtered.filter((item) => item.category === filterCategory);
      }

      if (filterLocation) {
        filtered = filtered.filter((item) =>
          (item.location?.toLowerCase() || "").includes(filterLocation.toLowerCase())
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
    searchStock,
    searchLocation,
    searchStatus,
    filterStatus,
    filterCategory,
    filterLocation,
    searchTerm,
    inventory,
    transactions,
    activeTab,
  ]);

  // --- Checkbox handlers ---
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredInventory.map((item) => item.id));
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
    setSelectAll(newSelected.size === filteredInventory.length);
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
        "Are you sure you want to delete this inventory item? This action cannot be undone."
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

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert("Please select items to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedItems.size} item(s)? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => inventoryApi.deleteInventory(id))
      );
      alert(`${selectedItems.size} item(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      const items: any = allItems.length ? allItems : await ItemsApi.getItems();
      await loadInventory(items);
    } catch (error) {
      console.error("Error deleting items:", error);
      alert("Failed to delete items");
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

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Invalid Date";
    }
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
        alert("Reminder sent successfully.");
      } else {
        alert("Failed to send reminder.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }
  };

  const resetFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setFilterLocation("");
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  // Get unique categories and locations for filters
  const uniqueCategories = Array.from(
    new Set(inventory.map((item) => item.category).filter(Boolean))
  );
  const uniqueLocations = Array.from(
    new Set(inventory.map((item) => item.location).filter(Boolean))
  );

  // --- Loading State ---
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading store management...</p>
        </div>
      </div>
    );
  }

  // --- Render Main UI ---
  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            
           
          </div>
          <div className="flex gap-3">
            {/* {activeTab === "management" && (
              <>
                <button
                  onClick={() => setShowFilterSidebar(true)}
                  className="bg-white border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
                {selectedItems.size > 0 && can("delete_inventory") && (
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete ({selectedItems.size})
                  </button>
                )}
                
              </>
            )} */}
            {can("create_inventory") && (
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFormTab("in")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeFormTab === "in"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <PackagePlus className="w-5 h-5" />
                  Material In
                </button>
                <button
                  onClick={() => setActiveFormTab("out")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeFormTab === "out"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <PackageMinus className="w-5 h-5" />
                  Material Out
                </button>
                <button
                  onClick={() => setActiveFormTab("issue")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    activeFormTab === "issue"
                      ? "bg-[#C62828] text-white shadow-sm"
                      : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  Issue Material
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

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

   {/* Main Tabs - Minimal Design */}
<div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
  <button
    onClick={() => setActiveTab("tracking")}
    className={`flex-1 px-6 py-4 font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
      activeTab === "tracking"
        ? "bg-[#C62828] text-white"
        : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    <FileText className={`w-5 h-5 ${activeTab === "tracking" ? "text-white" : "text-gray-500"}`} />
    <span>Inventory Tracking</span>
  </button>
  
  <button
    onClick={() => setActiveTab("management")}
    className={`flex-1 px-6 py-4 font-medium transition-all duration-200 flex items-center justify-center gap-3 ${
      activeTab === "management"
        ? "bg-[#C62828] text-white"
        : "text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Package className={`w-5 h-5 ${activeTab === "management" ? "text-white" : "text-gray-500"}`} />
    <span>Inventory Management</span>
  </button>
</div>

{/* Sub Tabs for Tracking - Minimal Design */}
{activeTab === "tracking" && (
  <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
    <button
      onClick={() => setSubTabs("MaterialIn")}
      className={`flex-1 px-4 py-3 font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
        subTabs === "MaterialIn"
          ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Download className={`w-5 h-5 ${subTabs === "MaterialIn" ? "text-emerald-600" : "text-gray-500"}`} />
      <span className="text-sm">Material In Transaction</span>
    </button>
    
    <button
      onClick={() => setSubTabs("MaterialOut")}
      className={`flex-1 px-4 py-3 font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
        subTabs === "MaterialOut"
          ? "bg-blue-50 text-blue-700 border-b-2 border-blue-500"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Truck className={`w-5 h-5 ${subTabs === "MaterialOut" ? "text-blue-600" : "text-gray-500"}`} />
      <span className="text-sm">Material Out Transaction</span>
    </button>
    
    <button
      onClick={() => setSubTabs("MaterialIssue")}
      className={`flex-1 px-4 py-3 font-medium transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
        subTabs === "MaterialIssue"
          ? "bg-amber-50 text-amber-700 border-b-2 border-amber-500"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
      <HandCoins className={`w-5 h-5 ${subTabs === "MaterialIssue" ? "text-amber-600" : "text-gray-500"}`} />
      <span className="text-sm">Material Issue Transaction</span>
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
                      Material Name
                    </div>
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={searchName}
                      onChange={(e) => setSearchName(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Current Stock
                    </div>
                    <input
                      type="text"
                      placeholder="Search stock..."
                      value={searchStock}
                      onChange={(e) => setSearchStock(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Unit Rate
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Stock Value
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Location
                    </div>
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </th>
                  <th className="px-6 py-3 text-left">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Status
                    </div>
                    <input
                      type="text"
                      placeholder="Search status..."
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                    />
                  </th>
                  <th className="px-6 py-3 text-center">
                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-lg font-medium">No inventory items found</p>
                      <p className="text-gray-500 text-sm mt-2">
                        Try adjusting your search or filters
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item, index) => {
                    const totalValue = calculateTotalValue(item);
                    const isSelected = selectedItems.has(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(item.id)}
                            className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-[#C62828] w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {(item.item_name || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {item.item_name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">{item.item_code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-800">
                            {item.quantity} {item.unit}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 flex items-center">
                            <IndianRupee size={14} className="text-green-600 mr-1" />
                            {item.rate?.toLocaleString("en-IN") || "0"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-700 flex items-center">
                            <IndianRupee size={14} className="text-green-600 mr-1" />
                            {totalValue.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{item.location || "N/A"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </span>
                          {item.status === "LOW STOCK" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
                              <AlertTriangle className="w-3 h-3" />
                              Reorder needed
                            </div>
                          )}
                          {item.status === "OUT OF STOCK" && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              Out of stock
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => reminder(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Send Reminder"
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            {can("update_inventory") && (
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                            {can("delete_inventory") && (
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                            {activeTab === "management" && (
              <>
                <button
                  onClick={() => setShowFilterSidebar(true)}
                  className=""
                >
                  <Filter className="w-5 h-5" />
                  
                </button>
                {selectedItems.size > 0 && can("delete_inventory") && (
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
                  >
                    <Trash2 className="w-5 h-5" />
                    Delete ({selectedItems.size})
                  </button>
                )}
              </>
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
        </div>
      )}

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            {/* Sidebar Header */}
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

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="IN STOCK">In Stock</option>
                  <option value="LOW STOCK">Low Stock</option>
                  <option value="OUT OF STOCK">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
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

            {/* Sidebar Footer */}
            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-[#B71C1C] text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
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