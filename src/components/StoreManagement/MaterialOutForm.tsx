// src/components/MaterialOutForm.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Package,
  User,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  Users,
  Plus,
  Trash2,
} from "lucide-react";

interface MaterialOutFormProps {
  setActiveFormTab: (show: string) => void;
  allInventory: any[];
  loadAllData: () => void;
}

interface Vendor {
  id: number;
  name: string;
  phone: string;
  type: "CONTRACTOR" | "SUBCONTRACTOR" | "SUPPLIER" | "OTHER";
}

interface MaterialItem {
  id: number;
  materialId: number;
  materialName: string;
  quantity: string;
  unit: string;
  currentStock: number;
  reorder_qty: number;
}

interface MaterialOutFormData {
  vendorId: number;
  vendorName: string;
  issuedTo: string;
  phoneNumber: string;
  deliveryLocation: string;
  issueDate: string;
  purpose: string;
  materials: MaterialItem[];
}

export default function MaterialOutForm({
  setActiveFormTab,
  allInventory,
  loadAllData,
}: MaterialOutFormProps) {
  const [loading, setLoading] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");

  // Vendors list with dropdown
  const [vendors] = useState<Vendor[]>([
    {
      id: 1,
      name: "John Doe (Contractor)",
      phone: "9876543210",
      type: "CONTRACTOR",
    },
    {
      id: 2,
      name: "ABC Construction",
      phone: "9876543211",
      type: "CONTRACTOR",
    },
    { id: 3, name: "XYZ Builders", phone: "9876543212", type: "SUBCONTRACTOR" },
    { id: 4, name: "PQR Suppliers", phone: "9876543213", type: "SUPPLIER" },
    {
      id: 5,
      name: "Site Supervisor - Building A",
      phone: "9876543214",
      type: "OTHER",
    },
    { id: 6, name: "Maintenance Team", phone: "9876543215", type: "OTHER" },
  ]);

  const [formData, setFormData] = useState<MaterialOutFormData>({
    vendorId: 0,
    vendorName: "",
    issuedTo: "",
    phoneNumber: "",
    deliveryLocation: "",
    issueDate: new Date().toISOString().split("T")[0],
    purpose: "",
    materials: [],
  });

  const selectedVendor = vendors.find(
    (vendor) => vendor.id === formData.vendorId
  );

  // When vendor is selected, auto-fill vendor name and phone
  const handleVendorChange = (vendorId: number) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setFormData((prev) => ({
        ...prev,
        vendorId: vendor.id,
        vendorName: vendor.name,
        phoneNumber: vendor.phone,
        issuedTo: vendor.name,
      }));
    }
  };

  const handleInputChange = (
    field: keyof MaterialOutFormData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add material to the list
  const addMaterial = (inventoryItem: any) => {
    // Check if material already exists in the list
    const existingIndex = formData.materials.findIndex(
      (item) => item.materialId === inventoryItem.id
    );

    if (existingIndex !== -1) {
      // If exists, update quantity
      const updatedMaterials = [...formData.materials];
      const currentQty =
        parseFloat(updatedMaterials[existingIndex].quantity) || 0;
      updatedMaterials[existingIndex].quantity = (currentQty + 1).toString();
      setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
    } else {
      // Add new material
      const newMaterial: MaterialItem = {
        id: Date.now() + Math.random(), // Temporary ID
        materialId: inventoryItem.id,
        materialName: inventoryItem.item_name || inventoryItem.name,
        quantity: "1",
        unit: inventoryItem.unit,
        currentStock: inventoryItem.quantity,
        reorder_qty: inventoryItem.reorder_qty,
      };

      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
      }));
    }

    setShowMaterialSelector(false);
    setMaterialSearch("");
  };

  // Update material quantity
  const updateMaterialQuantity = (id: number, quantity: string) => {
    const updatedMaterials = formData.materials.map((item) =>
      item.id === id ? { ...item, quantity } : item
    );
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  // Remove material from list
  const removeMaterial = (id: number) => {
    const updatedMaterials = formData.materials.filter(
      (item) => item.id !== id
    );
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  // Filter inventory items for selection
  const filteredInventory = allInventory.filter((item) => {
    const searchTerm = materialSearch.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(searchTerm) ||
      (item.description || "").toLowerCase().includes(searchTerm)
    );
  });

  // Check if all materials have valid quantities
  const validateMaterials = () => {
    for (const material of formData.materials) {
      if (!material.quantity || parseFloat(material.quantity) <= 0) {
        alert(`Please enter a valid quantity for ${material.materialName}`);
        return false;
      }

      const stockItem = allInventory.find(
        (item) => item.id === material.materialId
      );
      if (stockItem && parseFloat(material.quantity) > stockItem.quantity) {
        alert(
          `Insufficient stock for ${material.materialName}! Available: ${stockItem.quantity} ${stockItem.unit}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorId) {
      alert("Please select a vendor");
      return;
    }

    if (formData.materials.length === 0) {
      alert("Please add at least one material");
      return;
    }

    if (!formData.deliveryLocation) {
      alert("Please enter delivery location");
      return;
    }

    if (!validateMaterials()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API call
      const submissionData = {
        vendorId: formData.vendorId,
        vendorName: formData.vendorName,
        issuedTo: formData.issuedTo,
        phoneNumber: formData.phoneNumber,
        deliveryLocation: formData.deliveryLocation,
        issueDate: formData.issueDate,
        purpose: formData.purpose,
        materials: formData.materials.map((material) => ({
          materialId: material.materialId,
          materialName: material.materialName,
          quantity: parseFloat(material.quantity),
          unit: material.unit,
        })),
      };

      console.log("Material Out:", submissionData);

      // TODO: API call for material out
      // Example: await inventoryTransactionApi.materialOut(submissionData);

      alert("Materials issued successfully!");
      setActiveFormTab("");
      loadAllData();
    } catch (error) {
      console.error("Error issuing materials:", error);
      alert("Failed to issue materials");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vendorId: 0,
      vendorName: "",
      issuedTo: "",
      phoneNumber: "",
      deliveryLocation: "",
      issueDate: new Date().toISOString().split("T")[0],
      purpose: "",
      materials: [],
    });
    setMaterialSearch("");
  };

  // Calculate total materials count
  const totalItems = formData.materials.length;
  const totalQuantity = formData.materials.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Material Out - Issue Materials
            {totalItems > 0 && (
              <span className="ml-2 bg-white text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                {totalItems} item{totalItems !== 1 ? "s" : ""}
              </span>
            )}
          </h2>
          <button
            onClick={() => {
              setActiveFormTab("");
              resetForm();
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-3 px-6 py-3 h-[530px] overflow-y-scroll rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Selection */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue To (Vendor/Contractor){" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <select
                    value={formData.vendorId}
                    onChange={(e) =>
                      handleVendorChange(parseInt(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    required
                  >
                    <option value="0">Select Vendor/Contractor</option>
                    {vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name} ({vendor.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.issuedTo}
                    onChange={(e) =>
                      handleInputChange("issuedTo", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>
              </div>
            </div>

            {/* Phone & Purpose */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Purpose of issue"
                />
              </div>
            </div>

            {/* Delivery Location & Issue Date */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      handleInputChange("deliveryLocation", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter delivery location"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Vendor Info Display */}
            {selectedVendor && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">
                  Vendor Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vendor</p>
                    <p className="font-medium text-gray-800">
                      {selectedVendor.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">
                      {selectedVendor.type}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Materials Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Materials to Issue
                  {totalItems > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({totalItems} items, {totalQuantity} total units)
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Material
                </button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No materials added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Add Material" to select materials to issue
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.materials.map((material) => (
                    <div
                      key={material.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-4">
                          <label className="text-xs text-gray-600">
                            Material
                          </label>
                          <p className="font-medium text-gray-800">
                            {material.materialName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              Stock: {material.currentStock} {material.unit}
                            </span>
                            {material.currentStock <= material.reorder_qty && (
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Low Stock
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="col-span-3">
                          <label className="text-xs text-gray-600 mb-1 block">
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={material.quantity}
                              onChange={(e) =>
                                updateMaterialQuantity(
                                  material.id,
                                  e.target.value
                                )
                              }
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="0.01"
                              step="0.01"
                              required
                            />
                            <span className="text-sm text-gray-600">
                              {material.unit}
                            </span>
                          </div>
                          {parseFloat(material.quantity) >
                            material.currentStock && (
                            <p className="text-xs text-red-600 mt-1">
                              Exceeds available stock!
                            </p>
                          )}
                        </div>

                        <div className="col-span-3">
                          <label className="text-xs text-gray-600 mb-1 block">
                            After Issue
                          </label>
                          <p className="text-sm text-gray-700 font-medium">
                            {material.currentStock -
                              parseFloat(material.quantity || "0")}{" "}
                            {material.unit}
                          </p>
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeMaterial(material.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            {formData.materials.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-medium text-gray-700 mb-2">Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="font-semibold text-gray-800">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Quantity</p>
                    <p className="font-semibold text-gray-800">
                      {totalQuantity} units
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Recipient</p>
                    <p className="font-semibold text-gray-800">
                      {selectedVendor?.name || "Not selected"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Processing..." : "Issue Materials"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("");
                  resetForm();
                }}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Materials</h3>
              <button
                onClick={() => {
                  setShowMaterialSelector(false);
                  setMaterialSearch("");
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search materials by name..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="grid grid-cols-1 gap-3">
                {filteredInventory.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No materials found
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    const existingMaterial = formData.materials.find(
                      (m) => m.materialId === item.id
                    );
                    const isLowStock = item.quantity <= item.reorder_qty;

                    return (
                      <div
                        key={item.id}
                        onClick={() => addMaterial(item)}
                        className={`p-4 border rounded-lg cursor-pointer transition ${
                          existingMaterial
                            ? "bg-blue-50 border-blue-300"
                            : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-800">
                                {item.item_name || item.name}
                              </p>
                              {existingMaterial && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                  Added ({existingMaterial.quantity} {item.unit}
                                  )
                                </span>
                              )}
                              {isLowStock && (
                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Available: {item.quantity} {item.unit}
                            </p>
                            {item.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMaterial(item);
                              }}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
                            >
                              {existingMaterial ? "Add More" : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {formData.materials.length > 0 && (
                    <span>
                      {formData.materials.length} item
                      {formData.materials.length !== 1 ? "s" : ""} selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialSelector(false);
                    setMaterialSearch("");
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
