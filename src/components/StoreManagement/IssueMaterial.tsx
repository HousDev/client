/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MaterialOutForm.tsx
import React, { useEffect, useState, useRef } from "react";
import {
  X,
  Save,
  Package,
  Calendar,
  Phone,
  User,
  Building,
  Layers,
  Home,
  DoorOpen,
  FileText,
  ClipboardList,
  ChevronDown,
  MapPin,
  Truck,
  Plus,
  Trash2,
  AlertCircle,
  CheckSquare,
} from "lucide-react";
import projectApi from "../../lib/projectApi";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import { toast } from "sonner";
import vendorApi from "../../lib/vendorApi";
import SearchableSelect from "../SearchableSelect";
import RequestMaterialApi from "../../lib/requestMaterialApi";

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
  const [allMaterialRequest, setAllMaterialRequest] = useState<any>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<any>({
    requestId: null,
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

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setActiveFormTab("");
        resetForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      const filterVendors = vendorsRes.filter(
        (vendor) => vendor.category_name === "Service"
      );
      setAllServiceVendors(Array.isArray(filterVendors) ? filterVendors : []);
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  const loadAllMaterialRequest = async () => {
    try {
      const materialRequestRes = await RequestMaterialApi.getAll();
      setAllMaterialRequest(
        Array.isArray(materialRequestRes) ? materialRequestRes : []
      );
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  useEffect(() => {
    loadProjects();
    loadAllServiceVendors();
    loadAllMaterialRequest();
  }, []);

  // Load project details when project is selected
  const loadProjectDetails = async (
    projectId: number,
    buildingId?: number,
    floorId?: number,
    flatId?: number,
    commonAreaId?: number
  ) => {
    try {
      const projectDetailsRes: any = await projectApi.getProjectById(projectId);
      if (projectDetailsRes.success) {
        const project = projectDetailsRes.data;
        setSelectedProject(project);

        const building = project?.buildings?.find(
          (b: any) => b.id === buildingId
        );
        setSelectedBuilding(building ? building : null);

        const floor = building?.floors?.find((f: any) => f.id === floorId);
        setSelectedFloor(floor ? floor : null);

        const flat = floor?.flats?.find((f: any) => f.id === flatId);
        setSelectedFlat(flat ? flat : null);

        const commonArea = floor?.common_areas?.find(
          (ca: any) => ca.id === commonAreaId
        );
        setSelectedCommonArea(commonArea ? commonArea : null);

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
    toast.success(`${inventoryItem.item_name || inventoryItem.name} added`);
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
    toast.info("Material removed");
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
        toast.error(`Please enter a valid quantity for ${material.materialName}`);
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
      requestId: null,
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        ref={formRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-4 border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Issue Material Form
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Issue materials to project locations
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFormTab("");
              resetForm();
            }}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Material Request */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#C62828]" />
                Material Request <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                  <FileText className="w-4 h-4" />
                </div>
                <SearchableSelect
                  options={allMaterialRequest.map((i: any) => ({
                    id: i.request_material_id,
                    name: `${i.user_name} (${i.request_no})` || "",
                  }))}
                  value={formData.requestId}
                  onChange={async (id) => {
                    const mr = allMaterialRequest.find(
                      (d: any) => d.request_material_id === id
                    );
                    const materials = [];
                    for (const i of mr.items) {
                      for (const inventoryItem of allInventory) {
                        if (i.request_material_item_id === inventoryItem.item_id) {
                          const data = {
                            id: Date.now() + Math.random(),
                            materialId: inventoryItem.id,
                            materialName: inventoryItem.item_name || inventoryItem.name,
                            quantity: i.approved_quantity,
                            unit: inventoryItem.unit,
                            currentStock: inventoryItem.quantity,
                            reorder_qty: inventoryItem.reorder_qty,
                          };
                          materials.push(data);
                        }
                      }
                    }
                    await loadProjectDetails(
                      mr.projectId,
                      mr.buildingId,
                      mr.floorId,
                      mr.flatId,
                      mr.commonAreaId
                    );

                    setFormData({
                      ...formData,
                      requestId: id,
                      projectId: mr.projectId,
                      buildingId: mr.buildingId,
                      floorId: mr.floorId,
                      flatId: mr.flatId,
                      commonAreaId: mr.commonAreaId,
                      receiverName: mr.user_name,
                      receiverNumber: mr.user_phone,
                      purpose: mr.work,
                      materials: materials,
                    });
                    toast.success("Material request loaded successfully!");
                  }}
                  placeholder="Select Material Request"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 hover:border-gray-300"
                />
              </div>
            </div>

            {/* Project, Building, Floor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Project <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.projectId || ""}
                    onChange={(e: any) =>
                      loadProjectDetails(Number(e.target.value))
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                  >
                    <option value="" className="text-gray-400">Select Project</option>
                    {allProjects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C62828]" />
                  Building <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Building className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.buildingId || ""}
                    onChange={(e: any) =>
                      handleBuildingChange(Number(e.target.value))
                    }
                    disabled={!selectedProject}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">Select Building</option>
                    {selectedProject?.buildings?.map((building: any) => (
                      <option key={building.id} value={building.id}>
                        {building.building_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C62828]" />
                  Floor <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.floorId || ""}
                    onChange={(e: any) =>
                      handleFloorChange(Number(e.target.value))
                    }
                    disabled={!selectedBuilding}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">Select Floor</option>
                    {selectedBuilding?.floors?.map((floor: any) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.floor_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Flat, Common Area, Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#C62828]" />
                  Flat
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Home className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.flatId || ""}
                    onChange={(e: any) =>
                      handleFlatChange(Number(e.target.value))
                    }
                    disabled={!selectedFloor || formData.commonAreaId}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">Select Flat</option>
                    {selectedFloor?.flats?.map((flat: any) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.flat_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <DoorOpen className="w-4 h-4 text-[#C62828]" />
                  Common Area
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.commonAreaId || ""}
                    onChange={(e: any) =>
                      handleCommonAreaChange(Number(e.target.value))
                    }
                    disabled={!selectedFloor || formData.flatId}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">Select Area</option>
                    {selectedFloor?.common_areas?.map((commonArea: any) => (
                      <option key={commonArea.id} value={commonArea.id}>
                        {commonArea.common_area_name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#C62828]" />
                  Vendor
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Truck className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.vendorId || ""}
                    onChange={(e: any) =>
                      handleVendorChange(Number(e.target.value))
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                  >
                    <option value="" className="text-gray-400">Select Vendor</option>
                    {allServiceVendors.map((vendor: any) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Receiver Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#C62828]" />
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <User className="w-4 h-4" />
                  </div>
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Receiver Name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C62828]" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
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
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Phone Number"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  Issue Date
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      handleInputChange("issueDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Purpose
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.purpose}
                    onChange={(e) => handleInputChange("purpose", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Purpose"
                  />
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50 to-white shadow-sm">
              <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                    <Package className="w-4 h-4 text-[#C62828]" />
                  </div>
                  Materials to Issue
                  <span className="ml-2 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                    {formData.materials.length} items
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-xs flex items-center gap-1.5 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Material
                </button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl m-4 bg-gray-50/50">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No materials added</p>
                  <p className="text-sm text-gray-500 mt-1">Click "Add Material" to select items</p>
                </div>
              ) : (
                <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                  {formData.materials.map((material: any) => {
                    const isLowStock = material.currentStock <= material.reorder_qty;
                    return (
                      <div
                        key={material.id}
                        className="bg-white p-3 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Package className="w-4 h-4 text-gray-600" />
                              <p className="font-semibold text-gray-800 truncate">
                                {material.materialName}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                                Stock: {material.currentStock} {material.unit}
                              </span>
                              {isLowStock && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" />
                                  Low Stock
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input
                                type="text"
                                value={material.quantity}
                                onChange={(e) => {
                                  if (
                                    !/^\d*\.?\d*$/.test(e.target.value) ||
                                    Number(e.target.value) < 0
                                  )
                                    return;
                                  if (material.currentStock < Number(e.target.value)) {
                                    toast.warning("Exceeds stock quantity.");
                                    return;
                                  }
                                  updateMaterialQuantity(material.id, e.target.value);
                                }}
                                className="w-24 px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
                                {material.unit}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMaterial(material.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Issue Material
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("");
                  resetForm();
                  toast.info("Form cancelled");
                }}
                className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Material Selector Modal */}
       {showMaterialSelector && (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-3 animate-fadeIn">
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-2xl shadow-gray-900/20 w-full max-w-md border border-gray-200 overflow-hidden">
      {/* Header - Updated Color Theme */}
      <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 py-3 flex justify-between items-center border-b border-gray-700/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Package className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Select Material</h3>
            <p className="text-xs text-white/90 font-medium mt-0.5">
              Choose materials from inventory
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowMaterialSelector(false);
            setMaterialSearch("");
          }}
          className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar - Compact */}
      <div className="p-3 border-b">
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
            <FileText className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search material..."
            value={materialSearch}
            onChange={(e) => setMaterialSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-400"
          />
        </div>
      </div>

      {/* Materials List - Compact */}
      <div className="p-3 max-h-80 overflow-y-auto">
        <div className="space-y-2">
          {filteredInventory.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 font-medium">No materials found</p>
              <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
            </div>
          ) : (
            filteredInventory.map((item) => {
              const existingMaterial = formData.materials.find(
                (m: any) => m.materialId === item.id
              );
              const isLowStock = item.quantity <= item.reorder_qty;
              const isOutOfStock = item.quantity === 0;
              
              return (
                <button
                  type="button"
                  disabled={isOutOfStock}
                  key={item.id}
                  onClick={() => {
                    addMaterial(item);
                  }}
                  className={`w-full p-3 text-left border rounded-lg transition-all duration-150 hover:shadow-sm ${
                    existingMaterial
                      ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  } ${isOutOfStock ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Package className={`w-3.5 h-3.5 ${
                          isOutOfStock ? "text-gray-400" : 
                          isLowStock ? "text-yellow-600" : "text-green-600"
                        }`} />
                        <div className="font-semibold text-gray-800 text-sm truncate">
                          {item.item_name || item.name}
                        </div>
                        {existingMaterial && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium whitespace-nowrap">
                            Added
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium whitespace-nowrap">
                          Stock: {item.quantity} {item.unit}
                        </span>
                        {isLowStock && !isOutOfStock && (
                          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium whitespace-nowrap">
                            Low Stock
                          </span>
                        )}
                        {isOutOfStock && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium whitespace-nowrap">
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      existingMaterial
                        ? "bg-green-600 text-white"
                        : isOutOfStock
                        ? "bg-gray-200 text-gray-600"
                        : "bg-[#C62828] text-white"
                    }`}>
                      {existingMaterial ? "Add More" : "Add"}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Footer - Compact */}
      <div className="p-3 border-t bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {formData.materials.length > 0 && (
              <span className="font-medium text-xs">
                {formData.materials.length} selected
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowMaterialSelector(false);
                setMaterialSearch("");
              }}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMaterialSelector(false);
                setMaterialSearch("");
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-xs font-medium shadow-sm hover:shadow"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Add some custom styles for scrollbar */}
        <style >{`
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