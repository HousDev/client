// src/components/InventoryTransaction.tsx
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Package,
  Truck,
  Download,
  Calendar,
  Phone,
  MapPin,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface InventoryTransactionProps {
  setActiveFormTab: React.Dispatch<React.SetStateAction<string>>;
  activeFormTab: string;
  allInventory: any[];
  loadAllData: () => void;
}

interface MaterialItem {
  id: number;
  name: string;
  currentStock: number;
  unit: string;
}

interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendor: string;
  status: string;
  items: Array<{
    materialId: number;
    materialName: string;
    quantity: number;
    unit: string;
  }>;
}

interface MaterialOutForm {
  materialId: number;
  quantity: string;
  issuedTo: string;
  phoneNumber: string;
  deliveryLocation: string;
  issueDate: string;
}

interface MaterialInForm {
  poNumber: string;
  receiverName: string;
  challanNumber: string;
  vendor: string;
  receivingDate: string;
  receiverPhone: string;
  deliveryLocation: string;
  challanFile: File | null;
  items: Array<{
    materialId: number;
    receivedQuantity: string;
  }>;
}

export default function InventoryTransaction({
  setActiveFormTab,
  activeFormTab,
  allInventory,
  loadAllData,
}: InventoryTransactionProps) {
  const [loading, setLoading] = useState(false);

  // Mock data - Replace with API calls
  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      poNumber: "PO-2024-001",
      vendor: "ABC Suppliers",
      status: "Pending",
      items: [
        {
          materialId: 1,
          materialName: "Cement OPC 53",
          quantity: 100,
          unit: "Bags",
        },
        {
          materialId: 2,
          materialName: "Steel TMT Bar",
          quantity: 50,
          unit: "Tonnes",
        },
      ],
    },
    {
      id: 2,
      poNumber: "PO-2024-002",
      vendor: "XYZ Traders",
      status: "Delivered",
      items: [
        {
          materialId: 3,
          materialName: "River Sand",
          quantity: 200,
          unit: "Cubic Meters",
        },
      ],
    },
  ]);

  const [deliveryLocations] = useState([
    "Main Site - Building A",
    "Main Site - Building B",
    "Warehouse - Sector 5",
    "Site Office - North Wing",
    "Storage Yard - East Block",
  ]);

  // Material Out Form
  const [materialOutForm, setMaterialOutForm] = useState<MaterialOutForm>({
    materialId: 0,
    quantity: "",
    issuedTo: "",
    phoneNumber: "",
    deliveryLocation: "",
    issueDate: new Date().toISOString().split("T")[0],
  });

  // Material In Form
  const [materialInForm, setMaterialInForm] = useState<MaterialInForm>({
    poNumber: "",
    challanNumber: "",
    vendor: "",
    receivingDate: new Date().toISOString().split("T")[0],
    receiverPhone: "",
    receiverName: "",
    deliveryLocation: "",
    challanFile: null,
    items: [],
  });

  const resetForm = () => {
    setMaterialOutForm({
      materialId: 0,
      quantity: "",
      issuedTo: "",
      phoneNumber: "",
      deliveryLocation: "",
      issueDate: new Date().toISOString().split("T")[0],
    });
    setMaterialInForm({
      poNumber: "",
      challanNumber: "",
      vendor: "",
      receivingDate: new Date().toISOString().split("T")[0],
      receiverPhone: "",
      receiverName: "",
      deliveryLocation: "",
      challanFile: null,
      items: [],
    });
  };

  // Get selected PO details
  const selectedPO = purchaseOrders.find(
    (po) => po.poNumber === materialInForm.poNumber,
  );

  // Initialize items when PO is selected
  useEffect(() => {
    if (selectedPO) {
      const updatedItems = selectedPO.items.map((item) => ({
        materialId: item.materialId,
        receivedQuantity: "",
      }));
      setMaterialInForm((prev) => ({
        ...prev,
        vendor: selectedPO.vendor,
        items: updatedItems,
      }));
    } else {
      setMaterialInForm((prev) => ({
        ...prev,
        vendor: "",
        items: [],
      }));
    }
  }, [selectedPO]);

  // Handle Material Out input change
  const handleMaterialOutChange = (
    field: keyof MaterialOutForm,
    value: string,
  ) => {
    setMaterialOutForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle Material In input change
  const handleMaterialInChange = (
    field: keyof MaterialInForm,
    value: string,
  ) => {
    setMaterialInForm((prev) => ({ ...prev, [field]: value }));
  };

  // Handle received quantity change for items
  const handleItemQuantityChange = (materialId: number, value: string) => {
    setMaterialInForm((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.materialId === materialId
          ? { ...item, receivedQuantity: value }
          : item,
      ),
    }));
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMaterialInForm((prev) => ({ ...prev, challanFile: file }));
    }
  };

  // Get selected material details
  const selectedMaterial = allInventory.find(
    (item) => item.id === materialOutForm.materialId,
  );

  // Submit Material Out
  const handleMaterialOutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialOutForm.materialId) {
      alert("Please select a material");
      return;
    }

    if (!materialOutForm.quantity || Number(materialOutForm.quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!materialOutForm.issuedTo) {
      alert("Please enter who the material is issued to");
      return;
    }

    const material = allInventory.find(
      (item) => item.id === materialOutForm.materialId,
    );
    if (
      material &&
      Number(material.quantity) < Number(materialOutForm.quantity)
    ) {
      alert(
        `Insufficient stock! Available: ${material.quantity} ${material.unit}`,
      );
      return;
    }

    try {
      setLoading(true);
      // TODO: API call for material out
      console.log("Material Out:", materialOutForm);
      alert("Material issued successfully!");
      setActiveFormTab("");
      loadAllData();
    } catch (error) {
      console.error("Error issuing material:", error);
      alert("Failed to issue material");
    } finally {
      setLoading(false);
    }
  };

  // Submit Material In
  const handleMaterialInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!materialInForm.poNumber) {
      alert("Please select a PO number");
      return;
    }

    if (!materialInForm.challanNumber) {
      alert("Please enter challan number");
      return;
    }

    if (!materialInForm.deliveryLocation) {
      alert("Please select delivery location");
      return;
    }

    // Validate all items have received quantity
    const invalidItems = materialInForm.items.filter(
      (item) => !item.receivedQuantity || Number(item.receivedQuantity) <= 0,
    );

    if (invalidItems.length > 0) {
      alert("Please enter received quantity for all items");
      return;
    }

    try {
      setLoading(true);
      // TODO: API call for material in
      console.log("Material In:", materialInForm);
      alert("Material received successfully!");
      setActiveFormTab("");
      loadAllData();
    } catch (error) {
      console.error("Error receiving material:", error);
      alert("Failed to receive material");
    } finally {
      setLoading(false);
    }
  };

  // Get current PO items
  const getPOItem = (materialId: number) => {
    return selectedPO?.items.find((item) => item.materialId === materialId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10 ">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Material{" "}
            {activeFormTab.charAt(0).toUpperCase() + activeFormTab.slice(1)}
          </h2>
          <button
            onClick={() => setActiveFormTab("")}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className=" my-3 px-6 py-3  h-[530px] overflow-y-scroll rounded-b-lg">
          {/* Material In Form */}
          {activeFormTab === "in" && (
            <form onSubmit={handleMaterialInSubmit} className="space-y-6">
              {/* PO Number & Vendor */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={materialInForm.poNumber}
                      onChange={(e) =>
                        handleMaterialInChange("poNumber", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select PO Number</option>
                      {purchaseOrders.map((po) => (
                        <option key={po.id} value={po.poNumber}>
                          {po.poNumber} - {po.vendor} ({po.status})
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-3.5 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor
                  </label>
                  <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {materialInForm.vendor || "Select PO to auto-fill"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Challan Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialInForm.challanNumber}
                    onChange={(e) =>
                      handleMaterialInChange("challanNumber", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter challan number"
                    required
                  />
                </div>
              </div>

              {/* Challan Number & Receiving Date */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiving Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={materialInForm.receivingDate}
                      onChange={(e) =>
                        handleMaterialInChange("receivingDate", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiver Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={materialInForm.receiverName}
                      onChange={(e) =>
                        handleMaterialInChange("receiverName", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Receiver Name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receiver Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={materialInForm.receiverPhone}
                      onChange={(e) => {
                        if (!/^\d*$/.test(e.target.value)) {
                          toast.warning("Enter Valid Phone Number.");
                          return;
                        }
                        if (e.target.value.length > 10) {
                          toast.warning("Mobile number must be 10 digit.");
                          return;
                        }
                        handleMaterialInChange("receiverPhone", e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </div>
              {/* Location */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Location <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={materialInForm.deliveryLocation}
                      onChange={(e) =>
                        handleMaterialInChange(
                          "deliveryLocation",
                          e.target.value,
                        )
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Location"
                    />
                  </div>
                </div>
              </div>

              {/* Items Table */}
              {selectedPO && materialInForm.items.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-700 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Items to Receive
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Material
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Ordered Qty
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Received Qty *
                          </th>
                          <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {materialInForm.items.map((item) => {
                          const poItem = getPOItem(item.materialId);
                          return (
                            <tr
                              key={item.materialId}
                              className="hover:bg-gray-50"
                            >
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-800">
                                  {poItem?.materialName || "Unknown"}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-700">
                                  {poItem?.quantity || 0}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  min="0"
                                  max={poItem?.quantity}
                                  value={item.receivedQuantity}
                                  onChange={(e) =>
                                    handleItemQuantityChange(
                                      item.materialId,
                                      e.target.value,
                                    )
                                  }
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="0"
                                  required
                                />
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-gray-700">
                                  {poItem?.unit || "N/A"}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challan Receipt
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    id="challanFile"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="challanFile" className="cursor-pointer">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">
                          {materialInForm.challanFile
                            ? materialInForm.challanFile.name
                            : "Upload Challan Receipt"}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          PDF, JPG, or PNG up to 5MB
                        </p>
                      </div>
                    </div>
                  </label>
                  {materialInForm.challanFile && (
                    <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-green-800">
                            {materialInForm.challanFile.name}
                          </p>
                          <p className="text-xs text-green-600">
                            {(materialInForm.challanFile.size / 1024).toFixed(
                              1,
                            )}{" "}
                            KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setMaterialInForm((prev) => ({
                            ...prev,
                            challanFile: null,
                          }))
                        }
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {loading ? "Processing..." : "Receive Material"}
                </button>
              </div>
            </form>
          )}

          {/* Material Out Form */}
          {activeFormTab === "out" && (
            <form
              onSubmit={handleMaterialOutSubmit}
              className="space-y-6 my-3 px-6 py-3"
            >
              <div className="grid grid-cols-2 gap-6">
                {/* Material Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <select
                      value={materialOutForm.materialId}
                      onChange={(e) =>
                        handleMaterialOutChange("materialId", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                      required
                    >
                      <option value="">Select Material</option>
                      {allInventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name || item.item_name} - Stock: {item.quantity}{" "}
                          {item.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Material Details Card */}
                  {selectedMaterial && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Current Stock</p>
                          <p className="font-semibold text-gray-800">
                            {selectedMaterial.quantity} {selectedMaterial.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Min. Stock Level
                          </p>
                          <p className="font-semibold text-gray-800">
                            {selectedMaterial.reorder_qty}{" "}
                            {selectedMaterial.unit}
                          </p>
                        </div>
                      </div>
                      {selectedMaterial.quantity <=
                        selectedMaterial.reorder_qty && (
                        <div className="mt-3 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Low Stock Alert!
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={materialOutForm.quantity}
                      onChange={(e) =>
                        handleMaterialOutChange("quantity", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Enter quantity in ${
                        selectedMaterial?.unit || "units"
                      }`}
                      required
                    />
                    {selectedMaterial && (
                      <div className="absolute right-3 top-3 text-sm text-gray-500">
                        {selectedMaterial.unit}
                      </div>
                    )}
                  </div>
                  {selectedMaterial && materialOutForm.quantity && (
                    <div className="mt-2 text-sm text-gray-600">
                      After issue:{" "}
                      {selectedMaterial.quantity -
                        Number(materialOutForm.quantity)}{" "}
                      {selectedMaterial.unit}
                    </div>
                  )}
                </div>

                {/* Issued To & Phone */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issued To <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={materialOutForm.issuedTo}
                    onChange={(e) =>
                      handleMaterialOutChange("issuedTo", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter recipient name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={materialOutForm.phoneNumber}
                      onChange={(e) => {
                        if (!/^\d*$/.test(e.target.value)) {
                          toast.warning("Enter Valid Phone Number.");
                          return;
                        }
                        if (e.target.value.length > 10) {
                          toast.warning("Mobile number must be 10 digit.");
                          return;
                        }
                        handleMaterialOutChange("phoneNumber", e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
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
                      value={materialOutForm.deliveryLocation}
                      onChange={(e) =>
                        handleMaterialOutChange(
                          "deliveryLocation",
                          e.target.value,
                        )
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
                      value={materialOutForm.issueDate}
                      onChange={(e) =>
                        handleMaterialOutChange("issueDate", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={materialOutForm.deliveryLocation === "0"}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Purchase Order
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
          )}
        </div>
      </div>
    </div>
  );
}

// import React, { useState, SetStateAction, useRef, useEffect } from "react";
// import { X, Save, Package } from "lucide-react";
// import inventoryApi from "../lib/inventoryApi";
// import inventoryTransactionApi from "../lib/inventoryTransactionApi";

// /* ---------- Types ---------- */
// interface InventoryFormData {
//   inventory_item_id: number;
//   transaction_qty: number;
//   transaction_type: string;
//   remark: string;
//   previous_qty: number;
// }

// /* ------------------ SearchableSelect component (inline) ------------------ */
// function SearchableSelect({
//   options,
//   value,
//   onChange,
//   placeholder = "Select...",
//   required = false,
//   disabled = false,
//   id,
// }: {
//   options: any[];
//   value: string;
//   onChange: (id: string) => void;
//   placeholder?: string;
//   required?: boolean;
//   disabled?: boolean;
//   id?: string;
// }) {
//   console.log(options, "options");
//   const [open, setOpen] = useState(false);
//   const [filter, setFilter] = useState("");
//   const [highlight, setHighlight] = useState(0);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Normalize options to {id,name}
//   const normalized = options.map((opt) =>
//     typeof opt === "string" ? { id: opt, name: opt } : opt
//   );

//   const selected =
//     normalized.find((o) => Number(o.id) === Number(value)) || null;

//   const filtered = normalized.filter((o) =>
//     o.name.toLowerCase().includes(filter.toLowerCase())
//   );

//   useEffect(() => {
//     if (!open) setFilter("");
//     setHighlight(0);
//   }, [open]);

//   // close on outside click
//   useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (!containerRef.current) return;
//       if (!containerRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, []);

//   const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlight((h) => Math.min(h + 1, filtered.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlight((h) => Math.max(h - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       const opt = filtered[highlight];
//       if (opt) {
//         onChange(opt.id);
//         setOpen(false);
//       }
//     } else if (e.key === "Escape") {
//       setOpen(false);
//     }
//   };

//   return (
//     <div ref={containerRef} className="relative">
//       <div
//         className={`w-full flex items-center gap-2 px-3 py-3 border rounded-lg bg-white cursor-pointer ${
//           disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"
//         }`}
//         onClick={() => !disabled && setOpen((s) => !s)}
//         role="button"
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         id={id}
//       >
//         <div className="flex-1 text-left">
//           {selected ? (
//             <div className="text-sm text-gray-800">{selected.name}</div>
//           ) : (
//             <div className="text-sm text-gray-400">{placeholder}</div>
//           )}
//         </div>
//         <div>
//           <svg
//             className={`w-4 h-4 transform transition ${
//               open ? "rotate-180" : ""
//             }`}
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.396a.75.75 0 111.02 1.1l-4.185 3.833a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
//           </svg>
//         </div>
//       </div>

//       {/* dropdown */}
//       {open && (
//         <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//           {/* search input */}
//           <div className="p-2">
//             <input
//               autoFocus
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               onKeyDown={onKeyDown}
//               placeholder="Search..."
//               className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//             />
//           </div>

//           <ul
//             role="listbox"
//             aria-labelledby={id}
//             className="max-h-60 overflow-y-auto divide-y divide-gray-100"
//           >
//             {filtered.length === 0 ? (
//               <li className="p-3 text-sm text-gray-500">No results</li>
//             ) : (
//               filtered.map((opt, idx) => (
//                 <li
//                   key={opt.id}
//                   role="option"
//                   aria-selected={opt.id === value}
//                   className={`px-3 py-2 cursor-pointer text-sm ${
//                     idx === highlight ? "bg-blue-50" : "hover:bg-gray-50"
//                   } ${
//                     opt.id === value
//                       ? "font-medium text-gray-800"
//                       : "text-gray-700"
//                   }`}
//                   onMouseEnter={() => setHighlight(idx)}
//                   onClick={() => {
//                     onChange(opt.id);
//                     setOpen(false);
//                   }}
//                 >
//                   {opt.name}
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//       )}
//       {/* hidden input to keep form semantics if you want to submit native form */}
//       <input type="hidden" value={value} />
//     </div>
//   );
// }

// /* ---------- Component ---------- */
// export default function InventoryTransaction({
//   setShowCreatePro,
//   allInventory,
//   loadAllData,
// }: {
//   setShowCreatePro: React.Dispatch<SetStateAction<boolean>>;
//   loadAllData: () => void;
//   allInventory: any;
// }) {
//   const [formData, setFormData] = useState<InventoryFormData>({
//     inventory_item_id: 0,
//     transaction_qty: 0,
//     transaction_type: "",
//     remark: "",
//     previous_qty: 0,
//   });

//   const [InventoryItems, setInventoryItems] = useState<any>(allInventory);

//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(formData, "this is inventory formdata");
//     if (
//       !formData.inventory_item_id ||
//       !formData.transaction_qty ||
//       !formData.transaction_type ||
//       !formData.remark
//     ) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const item = allInventory.find(
//         (d: any) => d.id === formData.inventory_item_id
//       );
//       const payload = { ...formData, previous_qty: item.quantity };
//       await inventoryTransactionApi.createTransaction(payload);
//       alert("Inventory item added successfully");
//       setShowCreatePro(false);
//       loadAllData();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
//           <h2 className="text-xl font-bold text-white flex items-center gap-2">
//             <Package className="w-5 h-5" />
//             Add Inventory Item
//           </h2>
//           <button
//             onClick={() => setShowCreatePro(false)}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <SearchableSelect
//             options={allInventory.map((v: any) => ({
//               id: v.id,
//               name: v.name || v.vendor_name || v.display || "",
//             }))}
//             value={String(formData.inventory_item_id)}
//             onChange={(id) =>
//               setFormData({
//                 ...formData,
//                 inventory_item_id: Number(id),
//               })
//             }
//             placeholder="Select Vendor"
//             required
//           />

//           <select
//             value={formData.transaction_type}
//             onChange={(e) =>
//               setFormData({ ...formData, transaction_type: e.target.value })
//             }
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           >
//             <option value="">Select Transaction Type</option>
//             <option value="INWARD">INWARD</option>
//             <option value="OUTWARD">OUTWARD</option>
//           </select>

//           {/* Item Name */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Transaction Qty <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number"
//               value={formData.transaction_qty}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   transaction_qty: Number(e.target.value),
//                 })
//               }
//               className="w-full px-4 py-3 border rounded-lg"
//               required
//             />
//           </div>

//           {/* Category */}

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Remark</label>
//             <textarea
//               value={formData.remark}
//               onChange={(e) =>
//                 setFormData({ ...formData, remark: e.target.value })
//               }
//               className="w-full px-4 py-3 border rounded-lg"
//               rows={3}
//             />
//           </div>

//           {/* Footer */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
//             >
//               <Save className="w-4 h-4" />
//               Save Item
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowCreatePro(false)}
//               className="px-6 py-3 border rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
