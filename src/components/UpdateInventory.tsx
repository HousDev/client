import React, { SetStateAction, useState } from "react";
import { X, Save, Package, AlertTriangle } from "lucide-react";
import inventoryApi from "../lib/inventoryApi";

interface InventoryFormData {
  id: number;
  item_id: number;
  name: string;
  unit: string;
  rate: string;
  quantity: number;
  reorder_qty: number;
  location: string;
  status: string;
  total_value: number;
}

export default function UpdateInventoryForm({
  setShowEditModal,
  loadAllData,
  selectedItem,
}: {
  setShowEditModal: React.Dispatch<SetStateAction<boolean>>;
  loadAllData: () => void;
  selectedItem: any;
}) {
  const [formData, setFormData] = useState<InventoryFormData>({
    id: selectedItem.id,
    item_id: selectedItem.item_id,
    name: selectedItem.name || "",
    unit: selectedItem.unit || "",
    rate: selectedItem.rate || "",
    quantity: selectedItem.quantity ?? 0,
    reorder_qty: selectedItem.reorder_qty ?? 0,
    location: selectedItem.location ?? "",
    status: selectedItem.status ?? "",
    total_value: selectedItem.total_value ?? "",
  });

  const [loading, setLoading] = useState(false);

  // --- Helper Functions ---
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      "IN STOCK": "bg-green-100 text-green-700",
      "LOW STOCK": "bg-yellow-100 text-yellow-700",
      "OUT OF STOCK": "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  /* ------------------ submit ------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Item name is required");
      return;
    }

    if (!formData.unit.trim()) {
      alert("Unit is required");
      return;
    }
    if (!formData.location.trim()) {
      alert("Location is required");
      return;
    }
    if (Number(formData.reorder_qty) < 0) {
      alert("Reorder quantity cannot be negative");
      return;
    }
    if (Number(formData.rate) < 0) {
      alert("Reorder quantity cannot be negative");
      return;
    }

    try {
      setLoading(true);

      await inventoryApi.updateInventory(formData.id, formData);

      alert("Inventory item updated successfully");
      setShowEditModal(false);
      loadAllData();
    } catch (err) {
      console.error("Update inventory failed:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Update Inventory Item
          </h2>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Item Name & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cement OPC 53"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bag / Kg / Nos"
                required
              />
            </div>
          </div>

          {/* Quantity & Reorder Qty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Quantity
              </label>
              <input
                type="number"
                min={0}
                value={formData.quantity}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Quantity
              </label>
              <input
                type="text"
                min={0}
                value={formData.reorder_qty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorder_qty: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* Unit & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Unit */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bag / Kg / Nos"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  formData.status
                )}`}
              >
                {formData.status}
              </span>
              {formData.status === "LOW STOCK" && (
                <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
                  <AlertTriangle className="w-3 h-3" />
                  Reorder needed
                </div>
              )}
              {formData.status === "OUT OF STOCK" && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  Out of stock
                </div>
              )}
            </div>
          </div>
          {/* Unit Rate & Total Rate */}
          <div className="grid grid-cols-2 gap-4">
            {/* Unit */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Unit Rate <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.rate}
                onChange={(e) =>
                  setFormData({ ...formData, rate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bag / Kg / Nos"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Value
              </label>
              <input
                type="text"
                value={formData.total_value}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled"
                placeholder="Bag / Kg / Nos"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Item
            </button>

            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
