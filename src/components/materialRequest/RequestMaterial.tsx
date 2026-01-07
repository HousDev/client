// src/components/MaterialOutForm.tsx
import React, { SetStateAction, useEffect, useState } from "react";
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
} from "lucide-react";
import projectApi from "../../lib/projectApi";
import { toast } from "sonner";
import ItemsApi from "../../lib/itemsApi";
import { useAuth } from "../../contexts/AuthContext";
import RequestMaterialApi from "../../lib/requestMaterialApi";

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
  const [allInventory, setAllInventory] = useState<any>([]);

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
        : item
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  const loadItems = async () => {
    try {
      const itemsRes: any = await ItemsApi.getItems();
      setAllInventory(Array.isArray(itemsRes) ? itemsRes : []);
    } catch (error) {
      toast.error("Something went wrong while fetching items.");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const removeMaterial = (id: number) => {
    const updatedMaterials = formData.materials.filter(
      (item: any) => item.id !== id
    );
    setFormData((prev: any) => ({ ...prev, materials: updatedMaterials }));
  };

  const filteredInventory = allInventory.filter((item: any) => {
    const searchTerm = materialSearch.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(searchTerm) ||
      (item.description || "").toLowerCase().includes(searchTerm)
    );
  });

  const validateMaterials = () => {
    for (const material of formData.materials) {
      if (!material.quantity || parseFloat(material.quantity) <= 0) {
        alert(`Please enter a valid quantity for ${material.materialName}`);
        return false;
      }

      const stockItem = allInventory.find(
        (item: any) => item.id === material.materialId
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl my-2 sm:my-8 mx-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div className="w-full">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white ">
                Request Material
              </h2>
              {totalItems > 0 && (
                <div className="text-white/90 text-xs sm:text-sm truncate">
                  {totalItems} item{totalItems !== 1 ? "s" : ""} selected
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              setShowRequestMaterial(false);
              resetForm();
            }}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="  rounded-b-lg">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="h-[60vh] sm:h-[450px] overflow-y-auto p-3 sm:p-4 md:p-6">
              {/* Project Selection - Stack on mobile, grid on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
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
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
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
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                    For Work <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Pickaxe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <select
                      value={formData.work || ""}
                      required
                      onChange={(e: any) => handleWorkChange(e.target.value)}
                      className="w-full pl-10 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
                    >
                      <option value="">Select Work</option>
                      {defaultWork.map((work: any) => (
                        <option key={work} value={work}>
                          {work}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date and Remark - Stack on mobile, grid on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formData.start_date}
                      required
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remark
                  </label>
                  <input
                    type="text"
                    value={formData.remark}
                    onChange={(e) =>
                      handleInputChange("remark", e.target.value)
                    }
                    className="w-full px-4 py-2.5 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Remark"
                  />
                </div>
              </div>

              {/* Materials Section */}
              <div className="border-t pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    Materials
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMaterialSelector(true)}
                    className="bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4" /> Add Material
                  </button>
                </div>

                {formData.materials.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center">
                    <Package className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm sm:text-base">
                      No materials added yet
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      Click "Add Material" to select materials to request
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-x-auto">
                    <div className="w-full">
                      {formData.materials.map((material: any) => (
                        <div
                          key={material.id}
                          className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                            <div>
                              <label className="text-xs text-gray-600">
                                Material
                              </label>
                              <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                {material.materialName}
                              </p>
                            </div>

                            <div className="w-40 sm:w-full">
                              <label className="text-xs text-gray-600 mb-1 block">
                                Required Quantity{" "}
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
                                        "Entered quantity is exceeding stock quantity."
                                      );
                                      return;
                                    }
                                    updateMaterialQuantity(
                                      material.id,
                                      e.target.value
                                    );
                                  }}
                                  className="outline-none w-full sm:w-24 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                  min="0.01"
                                  step="0.01"
                                  required
                                />
                                <span className="text-sm font-semibold whitespace-nowrap">
                                  {material.unit}
                                </span>
                              </div>
                            </div>

                            <div className="flex">
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
                  </div>
                )}
              </div>
            </div>
            {/* Submit Button - Stack on mobile, row on desktop */}
            <div className="px-6 grid grid-cols-2 gap-2 py-3 sm:pt-6 border-t">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {loading ? "Processing..." : "Request"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowRequestMaterial(false);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden mx-2">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Select Materials
              </h3>
              <button
                onClick={() => {
                  setShowMaterialSelector(false);
                  setMaterialSearch("");
                }}
                className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="p-3 sm:p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search materials by name..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="space-y-3">
                {filteredInventory.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm sm:text-base">
                    No materials found
                  </div>
                ) : (
                  filteredInventory.map((item: any) => {
                    const existingMaterial = formData.materials.find(
                      (m: any) => m.materialId === item.id
                    );

                    return (
                      <button
                        key={item.id}
                        disabled={item.quantity === 0}
                        onClick={() => addMaterial(item)}
                        className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition w-full text-left ${
                          existingMaterial
                            ? "bg-blue-50 border-blue-300"
                            : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
                                {item.item_name || item.name}
                              </p>
                              {existingMaterial && (
                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded whitespace-nowrap">
                                  Added ({existingMaterial.quantity} {item.unit}
                                  )
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-start text-xs text-gray-500 mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-800 text-sm sm:text-base">
                                HSN
                              </p>
                            </div>
                            {item.hsn_code && (
                              <p className="text-start text-sm text-gray-500">
                                {item.hsn_code}
                              </p>
                            )}
                          </div>

                          <div className="sm:text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMaterial(item);
                              }}
                              className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium w-full sm:w-auto"
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

            <div className="p-3 sm:p-4 border-t bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
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
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base w-full sm:w-auto"
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
