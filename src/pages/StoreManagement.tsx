// src/components/PurchaseOrders.tsx
import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import InventoryTransaction from "../components/InventoryTransaction";
import UpdateInventoryForm from "../components/UpdateInventory";
import inventoryApi from "../lib/inventoryApi";
import inventoryTransactionApi from "../lib/inventoryTransactionApi";

type InventoryItem = {
  id: number;
  name: string;
  description: string;
  category: string;
  quantity: number;
  revorder_qty: number;
  unit: string;
  status: "IN STOCK" | "LOW STOCK" | "OUT OF STOCK";
  created_at?: string;
  updated_at?: string;
};

type InventoryTransaction = {
  previous_qty: number;
  id: number;
  inventory_item_id: number;
  transaction_qty: number;
  transaction_type: "CREDIT" | "DEBIT";
  remark: string;
  date: string;
  inventory?: {
    name: string;
    unit: string;
  };
  previous_quantity?: number;
  after_quantity?: number;
};

export default function StoreManagement() {
  const { user, profile } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>(
    []
  );
  const [filteredTransactions, setFilteredTransactions] = useState<
    InventoryTransaction[]
  >([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">(
    "management"
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);

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

  // --- Load Data ---
  const loadInventory = async () => {
    try {
      setLoading(true);
      const data: any = await inventoryApi.getInventory();
      setInventory(data);
      setFilteredInventory(data);
    } catch (error) {
      console.error("Error loading inventory:", error);
      alert("Failed to load inventory data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadTransactions = async () => {
    try {
      // You'll need to create this API function
      const data: any = await inventoryTransactionApi.getTransactions();

      setTransactions(data);
      setFilteredTransactions(data);
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Failed to load transaction data");
    }
  };

  const loadAllData = async () => {
    setRefreshing(true);
    await Promise.all([loadInventory(), loadTransactions()]);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // --- Search Filtering ---
  useEffect(() => {
    if (activeTab === "management") {
      const filtered = inventory.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredInventory(filtered);
    } else {
      const filtered = transactions.filter(
        (transaction) =>
          transaction.inventory?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.transaction_type
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.remark.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTransactions(filtered);
    }
  }, [searchTerm, inventory, transactions, activeTab]);

  // --- Handlers ---
  const handleEdit = (item: InventoryItem) => {
    setSelectedItem(item);
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
      loadInventory();
    } catch (error) {
      console.error("Error deleting inventory:", error);
      alert("Failed to delete inventory item");
    }
  };

  const handleRefresh = () => {
    loadAllData();
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
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // --- Loading State ---
  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Add Transaction
            </button>
          )}
        </div>
        {showCreateModal && (
          <InventoryTransaction
            setShowCreatePro={setShowCreateModal}
            allInventory={inventory}
            loadAllData={loadAllData}
          />
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
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
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "tracking" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Item Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Initial Qty.
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Trans. Qty.
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    After Qty.
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Trans. Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Remark
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {inventory.find(
                          (d) => d.id === transaction.inventory_item_id
                        )?.name || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">
                        Unit:{" "}
                        {inventory.find(
                          (d) => d.id === transaction.inventory_item_id
                        )?.unit || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {transaction.previous_qty ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {transaction.transaction_qty ?? "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {transaction.transaction_type.toLocaleLowerCase() ===
                        "CREDIT"
                          ? transaction.previous_qty +
                            transaction.transaction_qty
                          : transaction.previous_qty -
                            transaction.transaction_qty}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                          transaction.transaction_type
                        )}`}
                      >
                        {transaction.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {transaction.remark}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No Transactions Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try a different search term"
                    : "No inventory transactions available"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "management" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    ID
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Unit
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Quantity
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
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">
                        #{item.id.toString().padStart(4, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-800">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 max-w-xs truncate">
                        {item.description}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{item.unit}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {item.quantity}
                      </div>
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
                          onClick={() => handleEdit(item)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Edit"
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
                ))}
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
                    : 'Click "Add Item" to get started'}
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
