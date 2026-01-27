// import React, { SetStateAction, useState } from "react";
// import { X, Save, Package, AlertTriangle } from "lucide-react";
// import inventoryApi from "../lib/inventoryApi";

// interface InventoryFormData {
//   id: number;
//   item_id: number;
//   name: string;
//   unit: string;
//   rate: string;
//   quantity: number;
//   reorder_qty: number;
//   location: string;
//   status: string;
//   total_value: number;
// }

// export default function UpdateInventoryForm({
//   setShowEditModal,
//   loadAllData,
//   selectedItem,
// }: {
//   setShowEditModal: React.Dispatch<SetStateAction<boolean>>;
//   loadAllData: () => void;
//   selectedItem: any;
// }) {
//   const [formData, setFormData] = useState<InventoryFormData>({
//     id: selectedItem.id,
//     item_id: selectedItem.item_id,
//     name: selectedItem.name || "",
//     unit: selectedItem.unit || "",
//     rate: selectedItem.rate || "",
//     quantity: selectedItem.quantity ?? 0,
//     reorder_qty: selectedItem.reorder_qty ?? 0,
//     location: selectedItem.location ?? "",
//     status: selectedItem.status ?? "",
//     total_value: selectedItem.total_value ?? "",
//   });

//   const [loading, setLoading] = useState(false);

//   // --- Helper Functions ---
//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       "IN STOCK": "bg-green-100 text-green-700",
//       "LOW STOCK": "bg-yellow-100 text-yellow-700",
//       "OUT OF STOCK": "bg-red-100 text-red-700",
//     };
//     return colors[status] || "bg-gray-100 text-gray-700";
//   };

//   /* ------------------ submit ------------------ */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       alert("Item name is required");
//       return;
//     }

//     if (!formData.unit.trim()) {
//       alert("Unit is required");
//       return;
//     }
//     if (!formData.location.trim()) {
//       alert("Location is required");
//       return;
//     }
//     if (Number(formData.reorder_qty) < 0) {
//       alert("Reorder quantity cannot be negative");
//       return;
//     }
//     if (Number(formData.rate) < 0) {
//       alert("Reorder quantity cannot be negative");
//       return;
//     }

//     try {
//       setLoading(true);

//       await inventoryApi.updateInventory(formData.id, formData);

//       alert("Inventory item updated successfully");
//       setShowEditModal(false);
//       loadAllData();
//     } catch (err) {
//       console.error("Update inventory failed:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   /* ------------------ UI ------------------ */
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
//           <h2 className="text-xl font-bold text-white flex items-center gap-2">
//             <Package className="w-5 h-5" />
//             Update Inventory Item
//           </h2>
//           <button
//             onClick={() => setShowEditModal(false)}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           {/* Item Name & Location */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Item Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData({ ...formData, name: e.target.value })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Cement OPC 53"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Location <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.location}
//                 onChange={(e) =>
//                   setFormData({ ...formData, location: e.target.value })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Bag / Kg / Nos"
//                 required
//               />
//             </div>
//           </div>

//           {/* Quantity & Reorder Qty */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Current Quantity
//               </label>
//               <input
//                 type="number"
//                 min={0}
//                 value={formData.quantity}
//                 disabled
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent "
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Minimum Quantity
//               </label>
//               <input
//                 type="text"
//                 min={0}
//                 value={formData.reorder_qty}
//                 onChange={(e) =>
//                   setFormData({
//                     ...formData,
//                     reorder_qty: Number(e.target.value),
//                   })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//           {/* Unit & Status */}
//           <div className="grid grid-cols-2 gap-4">
//             {/* Unit */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Unit <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.unit}
//                 onChange={(e) =>
//                   setFormData({ ...formData, unit: e.target.value })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Bag / Kg / Nos"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Status</label>
//               <span
//                 className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                   formData.status
//                 )}`}
//               >
//                 {formData.status}
//               </span>
//               {formData.status === "LOW STOCK" && (
//                 <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600">
//                   <AlertTriangle className="w-3 h-3" />
//                   Reorder needed
//                 </div>
//               )}
//               {formData.status === "OUT OF STOCK" && (
//                 <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
//                   <AlertTriangle className="w-3 h-3" />
//                   Out of stock
//                 </div>
//               )}
//             </div>
//           </div>
//           {/* Unit Rate & Total Rate */}
//           <div className="grid grid-cols-2 gap-4">
//             {/* Unit */}
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Unit Rate <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.rate}
//                 onChange={(e) =>
//                   setFormData({ ...formData, rate: e.target.value })
//                 }
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder="Bag / Kg / Nos"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Total Value
//               </label>
//               <input
//                 type="text"
//                 value={formData.total_value}
//                 disabled
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled"
//                 placeholder="Bag / Kg / Nos"
//                 required
//               />
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
//             >
//               <Save className="w-4 h-4" />
//               Update Item
//             </button>

//             <button
//               type="button"
//               onClick={() => setShowEditModal(false)}
//               className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { SetStateAction, useState } from "react";
import {
  X,
  Save,
  Package,
  AlertTriangle,
  Layers,
  Tag,
  Hash,
  MapPin,
  Building,
  FileText,
  Scale,
  IndianRupee,
} from "lucide-react";
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-4 border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Update Inventory Item
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Edit item details and quantities
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Item Name & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#C62828]" />
                  Item Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Cement OPC 53"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C62828]" />
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Warehouse A, Rack 3"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Reorder Qty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C62828]" />
                  Current Quantity
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Layers className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={formData.quantity}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C62828]" />
                  Minimum Quantity
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={formData.reorder_qty}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reorder_qty: Number(e.target.value),
                      })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Minimum stock level"
                  />
                </div>
              </div>
            </div>

            {/* Unit & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#C62828]" />
                  Unit <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Scale className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Bag / Kg / Nos"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Status
                </label>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-medium ${getStatusColor(
                      formData.status,
                    )} border border-transparent`}
                  >
                    {formData.status}
                  </span>
                  {formData.status === "LOW STOCK" && (
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <AlertTriangle className="w-3 h-3" />
                      Reorder needed
                    </div>
                  )}
                  {formData.status === "OUT OF STOCK" && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      Out of stock
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Unit Rate & Total Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-[#C62828]" />
                  Unit Rate <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#C62828]" />
                  Total Value
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.total_value}
                    disabled
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-800">
                    Update Item Information
                  </p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    Modify the item details as needed. Current quantity cannot
                    be changed directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Update Item
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Add custom styles for scrollbar */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c62828;
            border-radius: 3px;
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
