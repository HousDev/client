/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/MaterialOutForm.tsx
import React, { SetStateAction, useEffect, useState, useRef } from "react";
import {
  X,
  Package,
  Calendar,
  Plus,
  Trash2,
  Building,
  FileText,
  Layers,
  Home,
  DoorOpen,
  Pickaxe,
  Search,
  ChevronDown,
  ClipboardList,
  CheckSquare,
} from "lucide-react";
import projectApi from "../../lib/projectApi";
import { toast } from "sonner";
import ItemsApi from "../../lib/itemsApi";
import { useAuth } from "../../contexts/AuthContext";
import RequestMaterialApi from "../../lib/requestMaterialApi";
import inventoryApi from "../../lib/inventoryApi";

interface MaterialOutFormProps {
  setShowRequestMaterial: React.Dispatch<SetStateAction<boolean>>;
}

interface MaterialItem {
  id: number;
  materialId: number;
  materialName: string;
  quantity: string;
  unit: string;
  currentStock: number;
  reorder_qty: number;
  itemId?: number;
  required_quantity?: number;
}

export default function RequestMaterial({
  setShowRequestMaterial,
}: MaterialOutFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allItems, setAllItems] = useState<any>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const defaultWork = [
    "RCC (Structure)",
    "Brickwork (Masonry)",
    "Door / Window Frame Fixing",
    "Electrical (Concealed)",
    "Plumbing (Concealed)",
    "Plaster",
    "Flooring / Tiling",
    "CP Fitting (Taps & Mixers)",
    "Electrical (Fixtures)",
    "Painting",
    "Final Cleaning & Handover",
  ];

  const [formData, setFormData] = useState<any>({
    projectId: null,
    buildingId: null,
    floorId: null,
    flatId: null,
    commonAreaId: null,
    work: null,
    start_date: new Date().toISOString().split("T")[0],
    remark: "",
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
        setShowRequestMaterial(false);
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
          (project: any) => project.status !== "completed",
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

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjectDetails = async (projectId: number) => {
    try {
      const projectDetailsRes: any = await projectApi.getProjectById(projectId);
      if (projectDetailsRes.success) {
        const project = projectDetailsRes.data;
        setSelectedProject(project);

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

  const handleBuildingChange = (buildingId: number) => {
    const building = selectedProject?.buildings?.find(
      (b: any) => b.id === buildingId,
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

  const handleCommonAreaChange = (commonAreaId: number) => {
    const commonArea = selectedFloor?.common_areas?.find(
      (ca: any) => ca.id === commonAreaId,
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

  const handleWorkChange = (work: string) => {
    setFormData((prev: any) => ({
      ...prev,
      work,
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addMaterial = (inventoryItem: any) => {
    const existingIndex = formData.materials.findIndex(
      (item: any) => item.materialId === inventoryItem.id,
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
        itemId: inventoryItem.id,
        required_quantity: 1,
      };

      setFormData((prev: any) => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
      }));
    }

    setShowMaterialSelector(false);
    setMaterialSearch("");
  };

  const updateMaterialQuantity = (id: number, quantity: string) => {
    const updatedMaterials = formData.materials.map((item: any) =>
      item.id === id
        ? {
            ...item,
            quantity,
            required_quantity: parseFloat(quantity) || 0,
          }
        : item,
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  const loadItems = async () => {
    try {
      const itemsRes: any = await ItemsApi.getItems();
      const allInventory: any = await inventoryApi.getInventory();
      const data = itemsRes
        .filter((f: any) => f.category === "material")
        .map((item: any) => {
          const inventoryItem = allInventory.find(
            (ii: any) => ii.item_id === item.id,
          );
          return { ...item, inventoryItem: inventoryItem };
        });
      console.log(data, "res");
      setAllItems(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Something went wrong while fetching items.");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const removeMaterial = (id: number) => {
    const updatedMaterials = formData.materials.filter(
      (item: any) => item.id !== id,
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  const filteredInventory = allItems.filter((item: any) => {
    const searchTerm = materialSearch.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(searchTerm) ||
      (item.description || "").toLowerCase().includes(searchTerm)
    );
  });

  const validateMaterials = () => {
    for (const material of formData.materials) {
      if (!material.quantity || parseFloat(material.quantity) <= 0) {
        toast.error(
          `Please enter a valid quantity for ${material.materialName}`,
        );
        return false;
      }

      const stockItem = allItems.find(
        (item: any) => item.id === material.materialId,
      );
      if (stockItem && parseFloat(material.quantity) > stockItem.quantity) {
        toast.error(
          `Insufficient stock for ${material.materialName}! Available: ${stockItem.quantity} ${stockItem.unit}`,
        );
        return false;
      }
    }
    return true;
  };

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

    if (!formData.work) {
      toast.error("Please select work type");
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

      const submissionData = {
        userId: user?.id,
        projectId: formData.projectId,
        buildingId: formData.buildingId,
        floorId: formData.floorId,
        flatId: formData.flatId,
        commonAreaId: formData.commonAreaId,
        work: formData.work,
        start_date: formData.start_date,
        remark: formData.remark,
        materials: formData.materials.map((material: any) => ({
          itemId: material.materialId,
          required_quantity: parseFloat(material.quantity),
        })),
      };

      const response: any = await RequestMaterialApi.create(submissionData);

      if (response.success) {
        toast.success("Material request created successfully!");
        resetForm();
        setShowRequestMaterial(false);
      } else {
        toast.error(response.message || "Failed to create material request");
      }
    } catch (error) {
      console.error("Error creating material request:", error);
      toast.error("Failed to create material request");
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
      work: null,
      start_date: new Date().toISOString().split("T")[0],
      remark: "",
      materials: [],
    });
    setSelectedProject(null);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setSelectedFlat(null);
    setSelectedCommonArea(null);
    setMaterialSearch("");
  };

  const totalItems = formData.materials.length;

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
                Request Material
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Request materials for project work
              </p>
            </div>
          </div>
          {totalItems > 0 && (
            <div className="absolute right-24 top-1/2 -translate-y-1/2 text-xs bg-white/20 px-2 py-1 rounded-full text-white font-medium">
              {totalItems} item{totalItems !== 1 ? "s" : ""}
            </div>
          )}
          <button
            onClick={() => {
              setShowRequestMaterial(false);
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
            {/* Project, Building, Floor - Compact Layout */}
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
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select Project
                    </option>
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
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select Building
                    </option>
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
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select Floor
                    </option>
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

            {/* Flat, Common Area, Work - Compact Layout */}
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
                    disabled={
                      !selectedFloor ||
                      formData.commonAreaId ||
                      selectedFloor?.flats?.length === 0
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">
                      Select Flat
                    </option>
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
                    disabled={
                      !selectedFloor ||
                      formData.flatId ||
                      selectedFloor?.common_areas?.length === 0
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="" className="text-gray-400">
                      Select Common Area
                    </option>
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
                  <Pickaxe className="w-4 h-4 text-[#C62828]" />
                  For Work <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Pickaxe className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.work || ""}
                    required
                    onChange={(e: any) => handleWorkChange(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                  >
                    <option value="" className="text-gray-400">
                      Select Work
                    </option>
                    {defaultWork.map((work: any) => (
                      <option key={work} value={work}>
                        {work}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Remark - Compact Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.start_date}
                    required
                    onChange={(e) =>
                      handleInputChange("start_date", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#C62828]" />
                  Remark
                </label>
                <input
                  type="text"
                  value={formData.remark}
                  onChange={(e) => handleInputChange("remark", e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  placeholder="Enter remark"
                />
              </div>
            </div>

            {/* Materials Section */}
            <div className="border-t pt-4 mt-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                    <Package className="w-4 h-4 text-[#C62828]" />
                  </div>
                  Materials
                  {totalItems > 0 && (
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                      {totalItems} item{totalItems !== 1 ? "s" : ""}
                    </span>
                  )}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Plus className="w-4 h-4" /> Add Material
                </button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                  <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm font-medium">
                    No materials added yet
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click "Add Material" to select materials to request
                  </p>
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-gradient-to-b from-gray-50 to-white shadow-sm">
                  <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200">
                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                      <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                        <Package className="w-4 h-4 text-[#C62828]" />
                      </div>
                      Selected Materials
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {formData.materials.map((material: any) => {
                      const inventory = allItems.find(
                        (d: any) => d.id === material.materialId,
                      )?.inventoryItem;
                      const isLowStock =
                        inventory?.quantity_after_approve <
                        material.reorder_qty;

                      return (
                        <div
                          key={material.id}
                          className="px-5 py-3 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                className={`p-1.5 rounded-lg ${isLowStock ? "bg-red-100" : "bg-green-100"}`}
                              >
                                <Package
                                  className={`w-4 h-4 ${isLowStock ? "text-red-600" : "text-green-600"}`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 text-xs text-wrap w-36">
                                  {material.materialName}
                                </div>
                                {/* <div className="flex items-center gap-3 mt-1">
                                  <div className="text-xs text-gray-600">
                                    Stock:{" "}
                                    <span
                                      className={`font-medium ${isLowStock ? "text-red-600" : "text-gray-700"}`}
                                    >
                                      {inventory?.quantity_after_approve || 0}{" "}
                                      {material.unit}
                                    </span>
                                  </div>
                                  {isLowStock && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                                      Low Stock
                                    </span>
                                  )}
                                </div> */}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <label className="text-xs text-gray-600 mb-1 block text-right">
                                  Required Qty{" "}
                                  <span className="text-red-500">*</span>
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
                                        material.currentStock < e.target.value
                                      ) {
                                        toast.warning(
                                          "Entered quantity is exceeding stock quantity.",
                                        );
                                        return;
                                      }
                                      updateMaterialQuantity(
                                        material.id,
                                        e.target.value,
                                      );
                                    }}
                                    className="w-24 px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                                    min="0.01"
                                    step="0.01"
                                    required
                                  />
                                  <span className="text-sm font-semibold whitespace-nowrap text-gray-700">
                                    {material.unit}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeMaterial(material.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Submit Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex gap-3">
            <button
              type="submit"
              onClick={handleSubmit}
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
                  <CheckSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Request Materials
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRequestMaterial(false);
                resetForm();
              }}
              className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Material Selector Modal */}
        {showMaterialSelector && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200">
              <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Select Materials
                </h3>
                <button
                  onClick={() => {
                    setShowMaterialSelector(false);
                    setMaterialSearch("");
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b">
                <div className="relative group">
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 group-focus-within:text-[#C62828]" />
                  <input
                    type="text"
                    placeholder="Search materials by name..."
                    value={materialSearch}
                    onChange={(e) => setMaterialSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="p-4 overflow-y-auto max-h-[calc(80vh-140px)] custom-scrollbar">
                <div className="space-y-3">
                  {filteredInventory.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No materials found
                    </div>
                  ) : (
                    filteredInventory.map((item: any) => {
                      const existingMaterial = formData.materials.find(
                        (m: any) => m.materialId === item.id,
                      );

                      return (
                        <button
                          key={item.id}
                          disabled={item.quantity === 0}
                          onClick={() => addMaterial(item)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition w-full text-left group ${
                            existingMaterial
                              ? "bg-blue-50 border-blue-300"
                              : "border-gray-200 hover:border-[#C62828] hover:bg-red-50/30"
                          } ${item.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div
                                className={`p-2 rounded-lg ${
                                  existingMaterial
                                    ? "bg-blue-100"
                                    : "bg-gray-100"
                                }`}
                              >
                                <Package
                                  className={`w-4 h-4 ${
                                    existingMaterial
                                      ? "text-blue-600"
                                      : "text-gray-600"
                                  }`}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 text-sm truncate">
                                  {item.item_name || item.name}
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs text-gray-600">
                                    HSN: {item.hsn_code || "N/A"}
                                  </span>
                                  {/* <span className="text-xs text-gray-600">
                                    Stock:{" "}
                                    {item.inventoryItem
                                      ?.quantity_after_approve || 0}{" "}
                                    {item.unit}
                                  </span> */}
                                </div>
                                {existingMaterial && (
                                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mt-1 inline-flex items-center gap-1">
                                    ✓ Added ({existingMaterial.quantity}{" "}
                                    {item.unit})
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMaterial(item);
                              }}
                              disabled={item.quantity === 0}
                              className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                existingMaterial
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "bg-[#C62828] hover:bg-red-700 text-white"
                              } ${item.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""} transform hover:-translate-y-0.5`}
                            >
                              {existingMaterial ? "Add More" : "Add"}
                            </button>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="text-sm text-gray-600">
                    {formData.materials.length > 0 ? (
                      <span className="font-medium">
                        {formData.materials.length} item
                        {formData.materials.length !== 1 ? "s" : ""} selected
                      </span>
                    ) : (
                      <span>No items selected</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMaterialSelector(false);
                      setMaterialSearch("");
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium text-sm w-full sm:w-auto shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom scrollbar styles */}
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
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
