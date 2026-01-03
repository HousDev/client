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
  // Added for better type safety
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
  // Added for consistency
  unit?: string;
};

type Item = {
  id: string;
  item_name: string;
  unit: string;
  standard_rate: number;
  location: string;
  // Add other item properties as needed
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
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [selectedPOTransaction, setSelectedPOTransaction] = useState<
    any | null
  >(null);
  const [filteredTransactions, setFilteredTransactions] = useState<
    InventoryTransaction[]
  >([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">(
    "management"
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

      // Map inventory data with item information
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
      console.log(vendorsRes);
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
      console.log(enhancedTransactions);
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
      // 1. Load items first
      const items = await loadAllItems();

      // 2. Load inventory (depends on items)
      const inventoryData = await loadInventory(items);

      // 3. Load transactions (can run in parallel with inventory if no dependency)
      await loadTransactions();

      // Update filtered states
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

  // --- Search Filtering with useMemo for Performance ---
  useEffect(() => {
    const searchLower = searchTerm.toLowerCase();

    if (activeTab === "management") {
      const filtered = inventory.filter((item) => {
        const itemName = item.item_name?.toLowerCase() || "";
        const status = item.status.toLowerCase();

        return itemName.includes(searchLower) || status.includes(searchLower);
      });
      setFilteredInventory(filtered);
    } else {
      const filtered = transactions.filter((transaction) => {
        const itemName = transaction.vendor?.toLowerCase() || "";
        const type = transaction.po_number.toLowerCase();
        const remark = transaction.receiver_name.toLowerCase();

        return (
          itemName.includes(searchLower) ||
          type.includes(searchLower) ||
          remark.includes(searchLower)
        );
      });
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, inventory, transactions, activeTab]);

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
    console.log(data);
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
      // Reload only inventory, not everything
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

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREDIT: "bg-green-100 text-green-700",
      DEBIT: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
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

  // Calculate total value safely
  const calculateTotalValue = (item: InventoryItem): number => {
    const rate = item.rate || 0;
    const quantity = item.quantity || 0;
    return rate * quantity;
  };

  // Calculate after quantity safely
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
        alert("Reminder send successfully.");
      } else {
        alert("Failed to send reminder.");
      }
    } catch (error) {
      alert("Something went wrong.");
    }
  };

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Store Management</h1>
          <p className="text-gray-600 mt-1">Manage and track inventory</p>
        </div>
        <div className="flex items-center gap-3">
          {can("create_inventory") && (
            <div className="border-b border-gray-200 px-6 ">
              <div className="flex space-x-4">
                <button
                  onClick={() => setActiveFormTab("in")}
                  className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
                    activeFormTab === "in"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <PackagePlus className="w-5 h-5" />
                  Material In
                </button>
                <button
                  onClick={() => setActiveFormTab("out")}
                  className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
                    activeFormTab === "out"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <PackageMinus className="w-5 h-5" />
                  Material Out
                </button>
                <button
                  onClick={() => setActiveFormTab("issue")}
                  className={`flex items-center gap-2 px-4 py-3 font-medium rounded-t-lg transition-all ${
                    activeFormTab === "issue"
                      ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <UserCheck className="w-5 h-5" />
                  Issue Material
                </button>
              </div>
            </div>
          )}
        </div>
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
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "tracking"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>Inventory Tracking</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("management")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "management"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Inventory Management</span>
            </div>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      {activeTab === "tracking" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-2 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSubTabs("MaterialIn")}
              className={`flex-1 px-6 py-2 font-medium transition ${
                subTabs === "MaterialIn"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                <span>Material In Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setSubTabs("MaterialOut")}
              className={`flex-1 px-6 py-2 font-medium transition ${
                subTabs === "MaterialOut"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              } border-r border-l border-slate-200`}
            >
              <div className="flex items-center justify-center gap-2">
                <Truck className="w-5 h-5" />
                <span>Material Out Transactions</span>
              </div>
            </button>
            <button
              onClick={() => setSubTabs("MaterialIssue")}
              className={`flex-1 px-6 py-2 font-medium transition ${
                subTabs === "MaterialIssue"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <HandCoins className="w-5 h-5" />
                <span>Material Issue Transactions</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              activeTab === "tracking"
                ? "Search inventory transactions..."
                : "Search inventory items..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "tracking" && subTabs === "MaterialIn" && (
        <MaterialInTransactions loadTableData={loadTableData} />
      )}
      {/* Content based on active tab */}
      {activeTab === "tracking" && subTabs === "MaterialOut" && (
        <MaterialOutTransactions loadTableData={loadTableData} />
      )}

      {activeTab === "tracking" && subTabs === "MaterialIssue" && (
        <MaterialIssueTransactions loadTableData={loadTableData} />
      )}
      {activeFormTab === "view" && (
        <ViewPOTransaction
          setActiveFormTab={setActiveFormTab}
          viewPOTransaction={selectedPOTransaction}
        />
      )}

      {activeTab === "management" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Material Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Current Stock
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Unit Rate
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Stock Value
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Material Location
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
                {filteredInventory.map((item) => {
                  const totalValue = calculateTotalValue(item);

                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">
                          {item.item_name || "Unknown"}
                          <p className="text-xs text-slate-400">
                            {item.item_code}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          {item.quantity} {item.unit}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 flex items-center">
                          <IndianRupee
                            size={14}
                            className="text-green-600 mr-1"
                          />
                          {item.rate?.toLocaleString("en-IN") || "0"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-700 flex items-center">
                          <IndianRupee
                            size={14}
                            className="text-green-600 mr-1"
                          />
                          {totalValue.toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {item.location || "N/A"}
                      </td>
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => reminder(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Reminder"
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="Edit"
                            disabled={!can("update_inventory")}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {can("delete_inventory") && (
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredInventory.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Inventory Items Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try a different search term"
                    : 'Click "Add Transaction" to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showEditModal && selectedItem && (
        <UpdateInventoryForm
          setShowEditModal={setShowEditModal}
          selectedItem={selectedItem}
          loadAllData={loadAllData}
        />
      )}
    </div>
  );
}
