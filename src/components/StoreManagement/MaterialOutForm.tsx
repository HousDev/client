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
  Truck,
} from "lucide-react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import projectApi from "../../lib/projectApi";
import { toast } from "sonner";

interface MaterialOutFormProps {
  setActiveFormTab: (show: string) => void;
  allInventory: any[];
  loadAllData: () => void;
  setLoadTableData: any;
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
  receiver_name: string;
  receiver_phone: string;
  delivery_location: string;
  receiving_date: string;
  remark: string;
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
  setLoadTableData,
}: MaterialOutFormProps) {
  console.log("allInventory from material out", allInventory);
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
  const [allProjects, setAllProjects] = useState<any>([]);

  const [formData, setFormData] = useState<MaterialOutFormData>({
    receiver_name: "",
    receiver_phone: "",
    delivery_location: "",
    receiving_date: "",
    remark: "",
    vendorId: 0,
    vendorName: "",
    issuedTo: "",
    phoneNumber: "",
    deliveryLocation: "",
    issueDate: new Date().toISOString().split("T")[0],
    purpose: "",
    materials: [],
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjects();
      if (data.success) {
        setAllProjects(data.data);
        setLoading(false);
        return;
      }
      setAllProjects([]);
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadProjects();
  }, []);

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
        materialId: inventoryItem.item_id,
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
        toast.error(
          `Please enter a valid quantity for ${material.materialName}`
        );
        return false;
      }

      const stockItem = allInventory.find(
        (item) => item.id === material.materialId
      );
      if (stockItem && parseFloat(material.quantity) > stockItem.quantity) {
        toast.error(
          `Insufficient stock for ${material.materialName}! Available: ${stockItem.quantity} ${stockItem.unit}`
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiver_name || formData.receiver_name.length < 3) {
      toast.error("Please enter valid receiver name");
      return;
    }

    if (formData.receiver_phone.length !== 10) {
      toast.error("Please enter valid mobile number.");
      return;
    }

    if (!formData.delivery_location || formData.delivery_location.length < 3) {
      toast.error("Please enter valid delivery location");
      return;
    }
    if (!formData.receiving_date || formData.receiving_date.length === 0) {
      toast.error("Please select valid receiving date.");
      return;
    }
    if (formData.materials.length === 0) {
      toast.error("Add Material");
    }

    try {
      setLoading(true);

      // Prepare data for API call
      const submissionData = {
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        receiving_date: formData.receiving_date,
        delivery_location: formData.delivery_location,
        remark: formData.remark,
        materials: formData.materials.map((material) => ({
          materialId: material.materialId,
          materialName: material.materialName,
          quantity: parseFloat(material.quantity),
          unit: material.unit,
        })),
      };

      const result =
        inventoryTransactionApi.createTransactionOut(submissionData);
      setLoadTableData(result);
      loadAllData();
      toast.success("Materials issued successfully!");
      setActiveFormTab("");
    } catch (error) {
      console.error("Error issuing materials:", error);
      toast.error("Failed to issue materials");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      receiver_name: "",
      receiver_phone: "",
      delivery_location: "",
      receiving_date: "",
      remark: "",
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-[0.9rem] md:text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Material Out
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
        <div className="my-3 px-6 py-3 min-h-300 max-h-[530px] overflow-y-scroll rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Vendor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.receiver_name}
                    onChange={(e) => {
                      if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
                        toast.warning("Only alphabet allowed.");
                        return;
                      }
                      handleInputChange("receiver_name", e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.receiver_phone}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        toast.warning("Enter Valid Phone Number.");
                        return;
                      }
                      if (Number(e.target.value.length) <= 10) {
                        handleInputChange("receiver_phone", e.target.value);
                      } else {
                        toast.warning("Only 10 digit mobile number allowed.");
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <select
                    value={`${formData.delivery_location}`}
                    onChange={(e) =>
                      handleInputChange("delivery_location", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm outline-none"
                    required
                  >
                    <option value="">Delivery Location</option>
                    {allProjects.map((project: any) => (
                      <option key={project.id} value={project.loaction}>
                        {project.name}-{"("}
                        {project.location}
                        {")"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Phone & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.receiving_date}
                    onChange={(e) =>
                      handleInputChange("receiving_date", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={(e) => handleInputChange("remark", e.target.value)}
                  className="w-full px-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Purpose of issue"
                />
              </div>
            </div>

            {/* Materials Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Materials
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
                <div className="space-y-3 overflow-x-auto md:overflow-hidden">
                  {formData.materials.map((material) => (
                    <div
                      key={material.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-[600px] md:w-full"
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
                            In Stock <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={material.currentStock}
                              disabled
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
                            Quantity <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={material.quantity}
                              onChange={(e) => {
                                if (
                                  !/^\d*\.?\d*$/.test(e.target.value) ||
                                  Number(e.target.value) < 0
                                )
                                  return;
                                if (
                                  Number(e.target.value) >
                                  Number(material.currentStock)
                                ) {
                                  toast.warning(
                                    "Entered Quantity is larger than stock quantity."
                                  );
                                  return;
                                }
                                updateMaterialQuantity(
                                  material.id,
                                  e.target.value
                                );
                              }}
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Truck className="w-5 h-5" />
                {loading ? "Processing..." : "Material Out"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("");
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
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
                    const isLowStock =
                      item.quantity <= item.reorder_qty && item.quantity > 0;
                    const outOfStock = item.quantity === 0;
                    return (
                      <button
                        type="button"
                        disabled={item.quantity === 0}
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
                              {outOfStock && (
                                <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Out Of Stock
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
                      </button>
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
