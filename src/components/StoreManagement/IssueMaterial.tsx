// src/components/MaterialOutForm.tsx
import React, { useEffect, useState } from "react";
import {
  X,
  Package,
  User,
  Calendar,
  Phone,
  AlertCircle,
  Plus,
  Trash2,
  Building,
  FileText,
  Layers,
  Home,
  DoorOpen,
  MapPin,
} from "lucide-react";
import projectApi from "../../lib/projectApi";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import { toast } from "sonner";
import vendorApi from "../../lib/vendorApi";

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

export default function IssueMaterial({
  setActiveFormTab,
  allInventory,
  loadAllData,
  setLoadTableData,
}: MaterialOutFormProps) {
  const [loading, setLoading] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allServiceVendors, setAllServiceVendors] = useState<any>([]);

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

  const [formData, setFormData] = useState<any>({
    projectId: null,
    buildingId: null,
    floorId: null,
    flatId: null,
    commonAreaId: null,
    vendorId: null,
    receiverName: "",
    receiverNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    purpose: "",
    materials: [],
  });

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<any>(null);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  const [selectedFlat, setSelectedFlat] = useState<any>(null);
  const [selectedCommonArea, setSelectedCommonArea] = useState<any>(null);

  const selectedVendor = vendors.find(
    (vendor) => vendor.id === formData.vendorId
  );

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjects();
      if (data.success) {
        const tempProjects = data.data.filter(
          (project: any) => project.status !== "completed"
        );
        setAllProjects(tempProjects);
      } else {
        setAllProjects([]);
      }
    } catch (err) {
      console.warn("loadProjects failed", err);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAllServiceVendors = async () => {
    try {
      const vendorsRes = await vendorApi.getVendors();
      const filterVenders = vendorsRes.filter(
        (vendor) => vendor.category_name === "Service"
      );
      console.log(filterVenders);
      setAllServiceVendors(Array.isArray(filterVenders) ? filterVenders : []);
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    loadProjects();
    loadAllServiceVendors();
  }, []);

  // Load project details when project is selected
  const loadProjectDetails = async (projectId: number) => {
    try {
      const projectDetailsRes: any = await projectApi.getProjectById(projectId);
      if (projectDetailsRes.success) {
        const project = projectDetailsRes.data;
        setSelectedProject(project);

        // Reset all child selections
        setSelectedBuilding(null);
        setSelectedFloor(null);
        setSelectedFlat(null);
        setSelectedCommonArea(null);

        setFormData((prev: any) => ({
          ...prev,
          projectId,
          buildingId: null,
          floorId: null,
          flatId: null,
          commonAreaId: null,
        }));
      } else {
        toast.error("Failed to load project details.");
        setSelectedProject(null);
      }
    } catch (error) {
      toast.error("Something went wrong.");
      setSelectedProject(null);
    }
  };

  // Handle building selection
  const handleBuildingChange = (buildingId: number) => {
    const building = selectedProject?.buildings?.find(
      (b: any) => b.id === buildingId
    );
    if (building) {
      setSelectedBuilding(building);
      setSelectedFloor(null);
      setSelectedFlat(null);
      setSelectedCommonArea(null);

      setFormData((prev: any) => ({
        ...prev,
        buildingId,
        floorId: null,
        flatId: null,
        commonAreaId: null,
      }));
    }
  };

  // Handle floor selection
  const handleFloorChange = (floorId: number) => {
    const floor = selectedBuilding?.floors?.find((f: any) => f.id === floorId);
    if (floor) {
      setSelectedFloor(floor);
      setSelectedFlat(null);
      setSelectedCommonArea(null);

      setFormData((prev: any) => ({
        ...prev,
        floorId,
        flatId: null,
        commonAreaId: null,
      }));
    }
  };

  // Handle flat selection
  const handleFlatChange = (flatId: number) => {
    const flat = selectedFloor?.flats?.find((f: any) => f.id === flatId);
    if (flat) {
      setSelectedFlat(flat);
      setSelectedCommonArea(null);

      setFormData((prev: any) => ({
        ...prev,
        flatId,
        commonAreaId: null,
      }));
    }
  };

  // Handle common area selection
  const handleCommonAreaChange = (commonAreaId: number) => {
    const commonArea = selectedFloor?.common_areas?.find(
      (ca: any) => ca.id === commonAreaId
    );
    if (commonArea) {
      setSelectedCommonArea(commonArea);
      setSelectedFlat(null);

      setFormData((prev: any) => ({
        ...prev,
        commonAreaId,
        flatId: null,
      }));
    }
  };

  // Handle vendor selection
  const handleVendorChange = (vendorId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      vendorId,
    }));
  };

  // Handle input change
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // Add material to the list
  const addMaterial = (inventoryItem: any) => {
    const existingIndex = formData.materials.findIndex(
      (item: any) => item.materialId === inventoryItem.id
    );

    if (existingIndex !== -1) {
      const updatedMaterials = [...formData.materials];
      const currentQty =
        parseFloat(updatedMaterials[existingIndex].quantity) || 0;
      updatedMaterials[existingIndex].quantity = (currentQty + 1).toString();
      setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
    } else {
      const newMaterial: MaterialItem = {
        id: Date.now() + Math.random(),
        materialId: inventoryItem.id,
        materialName: inventoryItem.item_name || inventoryItem.name,
        quantity: "1",
        unit: inventoryItem.unit,
        currentStock: inventoryItem.quantity,
        reorder_qty: inventoryItem.reorder_qty,
      };

      setFormData((prev: any) => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
      }));
    }

    setShowMaterialSelector(false);
    setMaterialSearch("");
  };

  // Update material quantity
  const updateMaterialQuantity = (id: number, quantity: string) => {
    const updatedMaterials = formData.materials.map((item: any) =>
      item.id === id ? { ...item, quantity } : item
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  // Remove material from list
  const removeMaterial = (id: number) => {
    const updatedMaterials = formData.materials.filter(
      (item: any) => item.id !== id
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  // Filter inventory items for selection
  const filteredInventory = allInventory.filter((item) => {
    const searchTerm = materialSearch.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(searchTerm) ||
      (item.description || "").toLowerCase().includes(searchTerm)
    );
  });

  // Validate materials
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

  // Validate form
  const validateForm = () => {
    if (!formData.projectId) {
      toast.error("Please select a project");
      return false;
    }

    if (!formData.buildingId) {
      toast.error("Please select a building");
      return false;
    }

    if (!formData.floorId) {
      toast.error("Please select a floor");
      return false;
    }

    if (!formData.receiverName.trim()) {
      toast.error("Please enter receiver name");
      return false;
    }

    if (!formData.receiverNumber.trim()) {
      toast.error("Please enter receiver phone number");
      return false;
    }

    if (formData.materials.length === 0) {
      toast.error("Please add at least one material");
      return false;
    }

    if (!validateMaterials()) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Prepare data for API call
      const submissionData = {
        projectId: formData.projectId,
        buildingId: formData.buildingId,
        floorId: formData.floorId,
        flatId: formData.flatId,
        commonAreaId: formData.commonAreaId,
        vendorId: formData.vendorId,
        receiver_name: formData.receiverName,
        receiver_number: formData.receiverNumber,
        issue_date: formData.issueDate,
        purpose: formData.purpose,
        materials: formData.materials.map((material: any) => ({
          materialId: material.materialId,
          materialName: material.materialName,
          quantity: parseFloat(material.quantity),
          unit: material.unit,
        })),
      };

      console.log("Material Out:", submissionData);

      const response: any =
        await inventoryTransactionApi.createTransactionIssueMaterial(
          submissionData
        );

      if (response.success) {
        setLoadTableData(response);
        toast.success("Materials issued successfully!");
        resetForm();
        setActiveFormTab("");
        loadAllData();
      } else {
        toast.error(response.message || "Failed to issue materials");
      }
    } catch (error) {
      console.error("Error issuing materials:", error);
      toast.error("Failed to issue materials");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      projectId: null,
      buildingId: null,
      floorId: null,
      flatId: null,
      commonAreaId: null,
      vendorId: null,
      receiverName: "",
      receiverNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      purpose: "",
      materials: [],
    });
    setSelectedProject(null);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedFlat(null);
    setSelectedCommonArea(null);
    setMaterialSearch("");
  };

  // Calculate total materials count
  const totalItems = formData.materials.length;
  const totalQuantity = formData.materials.reduce(
    (sum: number, item: any) => sum + (parseFloat(item.quantity) || 0),
    0
  );
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-[0.9rem] md:text-xl font-bold text-white flex items-center gap-2 ">
            <Package className="w-5 h-5" />
            Issue Material to Flat/Area
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Project Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.projectId || ""}
                    onChange={(e: any) =>
                      loadProjectDetails(Number(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
                    required
                  >
                    <option value="">Select Project</option>
                    {allProjects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Building <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.buildingId || ""}
                    onChange={(e: any) =>
                      handleBuildingChange(Number(e.target.value))
                    }
                    disabled={!selectedProject}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Building</option>
                    {selectedProject?.buildings?.map((building: any) => (
                      <option key={building.id} value={building.id}>
                        {building.building_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.floorId || ""}
                    onChange={(e: any) =>
                      handleFloorChange(Number(e.target.value))
                    }
                    disabled={!selectedBuilding}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select Floor</option>
                    {selectedBuilding?.floors?.map((floor: any) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.floor_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Flat and Common Area Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Flat
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.flatId || ""}
                    onChange={(e: any) =>
                      handleFlatChange(Number(e.target.value))
                    }
                    disabled={
                      !selectedFloor ||
                      formData.commonAreaId ||
                      selectedFloor?.flats?.length === 0
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Flat</option>
                    {selectedFloor?.flats?.map((flat: any) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.flat_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Common Area
                </label>
                <div className="relative">
                  <DoorOpen className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.commonAreaId || ""}
                    onChange={(e: any) =>
                      handleCommonAreaChange(Number(e.target.value))
                    }
                    disabled={
                      !selectedFloor ||
                      formData.flatId ||
                      selectedFloor?.common_areas?.length === 0
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Common Area</option>
                    {selectedFloor?.common_areas?.map((commonArea: any) => (
                      <option key={commonArea.id} value={commonArea.id}>
                        {commonArea.common_area_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <select
                    value={formData.vendorId || ""}
                    onChange={(e: any) =>
                      handleVendorChange(Number(e.target.value))
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
                  >
                    <option value="">Select Vendor</option>
                    {allServiceVendors.map((vendor: any) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Receiver Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => {
                      if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
                        toast.warning("Only alphabet allowed.");
                        return;
                      }
                      handleInputChange("receiverName", e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Receiver Name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.receiverNumber}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        toast.warning("Enter Valid Phone Number.");
                        return;
                      }
                      if (e.target.value.length > 10) {
                        toast.warning("Mobile number must be 10 digit.");
                        return;
                      }
                      handleInputChange("receiverNumber", e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Phone Number"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Date and Purpose */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => handleInputChange("purpose", e.target.value)}
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
                  {formData.materials.map((material: any) => (
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
                                if (material.currentStock < e.target.value) {
                                  toast.warning(
                                    "Entered quantity is exceeding stock quantity."
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

                        <div className="col-span-3">
                          <label className="text-xs text-gray-600 mb-1 block">
                            In Stock
                          </label>
                          <p className="text-sm text-gray-700 font-medium">
                            {material.currentStock || "0"} {material.unit}
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

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Issue Material"}
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
                      (m: any) => m.materialId === item.id
                    );
                    const isLowStock = item.quantity <= item.reorder_qty;

                    return (
                      <button
                        key={item.id}
                        disabled={item.quantity === 0}
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
