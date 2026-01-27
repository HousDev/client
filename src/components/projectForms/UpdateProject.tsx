// src/components/ConstructionProjectUpdateForm.tsx
import { useState } from "react";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Building,
  MapPin,
  Calendar,
  Home,
  Layers,
  Users,
  FileText,
  Plus,
  DoorOpen,
  Building2,
  LayoutGrid,
  AlertCircle,
  Info,
  Edit2,
  Save,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";

interface ProjectUpdateFormProps {
  setUpdateProjectDetails: any;
  loadAllData: any;
  projectData: any;
  allCommonArea: any;
  allFloors: any;
}

interface Building {
  id?: number;
  building_name: string;
  floors: Floor[];
}

interface Floor {
  id?: number;
  floor_name: string;
  flats: Flat[];
  common_areas: CommonArea[];
}

interface Flat {
  id?: number;
  flat_name: string;
  status?: string;
  workflow?: any[];
}

interface CommonArea {
  id?: number;
  common_area_name: string;
  status?: string;
  workflow?: any[];
}

interface WorkflowModalData {
  type: "flat" | "common_area";
  buildingIndex: number;
  floorIndex: number;
  unitIndex: number;
  unitName: string;
  workflow: any[];
}

const defaultWorkflow = [
  { id: 1, name: "RCC (Structure)", weight: 25, status: "pending" },
  { id: 2, name: "Brickwork (Masonry)", weight: 15, status: "pending" },
  { id: 3, name: "Door / Window Frame Fixing", weight: 5, status: "pending" },
  { id: 4, name: "Plaster", weight: 10, status: "pending" },
  { id: 5, name: "Flooring / Tiling", weight: 15, status: "pending" },
  {
    id: 6,
    name: "Electrical (Concealed + Fixtures)",
    weight: 8,
    status: "pending",
  },
  {
    id: 7,
    name: "Plumbing (Concealed + Sanitary)",
    weight: 7,
    status: "pending",
  },
  { id: 8, name: "CP Fitting (Taps & Mixers)", weight: 3, status: "pending" },
  { id: 9, name: "Painting", weight: 10, status: "pending" },
  { id: 10, name: "Final Cleaning & Handover", weight: 2, status: "pending" },
];

export default function UpdateProject({
  setUpdateProjectDetails,
  loadAllData,
  projectData,
  allCommonArea,
  allFloors,
}: ProjectUpdateFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInputFeild, setShowInputField] = useState(false);
  const [showUpdateModalForItem, setShowModalForItem] = useState<string | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<any | null>({
    name: "",
    count: "",
    buildingId: "",
    floorId: "",
    flatId: "",
    commonAreaId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [buildingFloorCounts, setBuildingFloorCounts] = useState<{
    [key: number]: number;
  }>({});
  const [floorFlatCounts, setFloorFlatCounts] = useState<{
    [key: string]: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [workflowModalData, setWorkflowModalData] =
    useState<WorkflowModalData | null>(null);
  const [workflowStatuses, setWorkflowStatuses] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    id: projectData.id,
    name: projectData.name,
    location: projectData.location,
    start_date: projectData.start_date
      ? projectData.start_date.split("T")[0]
      : "",
    end_date: projectData.end_date ? projectData.end_date.split("T")[0] : "",
    buildings: projectData.buildings.map((building: any) => ({
      id: building.id,
      building_name: building.building_name,
      floors: building.floors.map((floor: any) => ({
        id: floor.id,
        floor_name: floor.floor_name,
        flats: floor.flats.map((flat: any) => ({
          id: flat.id,
          flat_name: flat.flat_name,
          status: flat.status,
          workflow: flat.workflow || [...defaultWorkflow],
        })),
        common_areas: floor.common_areas.map((commonArea: any) => ({
          id: commonArea.id,
          common_area_name: commonArea.common_area_name,
          status: commonArea.status,
          workflow: commonArea.workflow || [...defaultWorkflow],
        })),
      })),
    })),
  });

  const steps = [
    {
      number: 1,
      title: "Project Details",
      icon: <FileText className="w-4 h-4" />,
      description: "Update project information",
    },
    {
      number: 2,
      title: "Buildings",
      icon: <Building2 className="w-4 h-4" />,
      description: "Update building information",
    },
    {
      number: 3,
      title: "Floors",
      icon: <DoorOpen className="w-4 h-4" />,
      description: "Update floor information",
    },
    {
      number: 4,
      title: "Units",
      icon: <LayoutGrid className="w-4 h-4" />,
      description: "Update units and common areas",
    },
    {
      number: 5,
      title: "Review",
      icon: <Check className="w-4 h-4" />,
      description: "Review and update",
    },
  ];

  const openWorkflowModal = (
    type: "flat" | "common_area",
    buildingIndex: number,
    floorIndex: number,
    unitIndex: number,
    unitName: string,
  ) => {
    let workflow: any[] = [];

    if (type === "flat") {
      workflow =
        formData.buildings[buildingIndex].floors[floorIndex].flats[unitIndex]
          .workflow || [];
    } else {
      workflow =
        formData.buildings[buildingIndex].floors[floorIndex].common_areas[
          unitIndex
        ].workflow || [];
    }

    setWorkflowModalData({
      type,
      buildingIndex,
      floorIndex,
      unitIndex,
      unitName,
      workflow,
    });

    setWorkflowStatuses([
      ...workflow.map((item: any) => ({
        ...item,
        status: item.status || "pending",
      })),
    ]);

    setShowWorkflowModal(true);
  };

  const closeWorkflowModal = () => {
    setShowWorkflowModal(false);
    setWorkflowModalData(null);
    setWorkflowStatuses([]);
  };

  const updateWorkflowStatus = (index: number, status: string) => {
    const updatedStatuses = [...workflowStatuses];
    updatedStatuses[index] = {
      ...updatedStatuses[index],
      status,
    };
    setWorkflowStatuses(updatedStatuses);
  };

  const saveWorkflowStatuses = () => {
    if (!workflowModalData) return;

    const updatedBuildings = [...formData.buildings];

    if (workflowModalData.type === "flat") {
      updatedBuildings[workflowModalData.buildingIndex].floors[
        workflowModalData.floorIndex
      ].flats[workflowModalData.unitIndex].workflow = workflowStatuses;

      const completedTasks = workflowStatuses.filter(
        (task) => task.status === "completed",
      ).length;
      const totalTasks = workflowStatuses.length;
      const progressPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      let newStatus = "pending";
      if (progressPercentage === 100) {
        newStatus = "completed";
      } else if (progressPercentage > 0) {
        newStatus = "in_progress";
      }

      updatedBuildings[workflowModalData.buildingIndex].floors[
        workflowModalData.floorIndex
      ].flats[workflowModalData.unitIndex].status = newStatus;
    } else {
      updatedBuildings[workflowModalData.buildingIndex].floors[
        workflowModalData.floorIndex
      ].common_areas[workflowModalData.unitIndex].workflow = workflowStatuses;

      const completedTasks = workflowStatuses.filter(
        (task) => task.status === "completed",
      ).length;
      const totalTasks = workflowStatuses.length;
      const progressPercentage =
        totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      let newStatus = "pending";
      if (progressPercentage === 100) {
        newStatus = "completed";
      } else if (progressPercentage > 0) {
        newStatus = "in_progress";
      }

      updatedBuildings[workflowModalData.buildingIndex].floors[
        workflowModalData.floorIndex
      ].common_areas[workflowModalData.unitIndex].status = newStatus;
    }

    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
    toast.success("Workflow status updated successfully!");
    closeWorkflowModal();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "pending":
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Project name is required";
      if (!formData.location.trim())
        newErrors.location = "Location is required";
      if (!formData.start_date) newErrors.start_date = "Start date is required";
      if (!formData.end_date) newErrors.end_date = "End date is required";

      if (formData.start_date && formData.end_date) {
        const start = new Date(formData.start_date);
        const end = new Date(formData.end_date);
        if (end <= start) {
          newErrors.end_date = "End date must be after start date";
        }
      }
    }

    if (step === 2) {
      if (formData.buildings.length === 0) {
        newErrors.buildings = "At least one building is required";
      } else {
        formData.buildings.forEach((building: any, bIndex: number) => {
          if (!building.building_name.trim()) {
            newErrors[`building_${bIndex}_name`] = "Building name is required";
          }
        });
      }
    }

    if (step === 3) {
      formData.buildings.forEach((building: any, bIndex: number) => {
        if (building.floors.length === 0) {
          newErrors[`building_${bIndex}_floors`] =
            "At least one floor is required for this building";
        } else {
          building.floors.forEach((floor: any, fIndex: number) => {
            if (!floor.floor_name.trim()) {
              newErrors[`building_${bIndex}_floor_${fIndex}_name`] =
                "Floor name is required";
            }
          });
        }
      });
    }

    if (step === 4) {
      formData.buildings.forEach((building: any, bIndex: number) => {
        building.floors.forEach((floor: any, fIndex: number) => {
          const hasFlats = floor.flats.length >= 0;
          const hasCommonAreas = floor.common_areas.length >= 0;

          if (!hasFlats && !hasCommonAreas) {
            newErrors[`building_${bIndex}_floor_${fIndex}_units`] =
              "Add at least one flat or common area";
          } else {
            floor.flats.forEach((flat: any, flIndex: number) => {
              if (!flat.flat_name.trim()) {
                newErrors[
                  `building_${bIndex}_floor_${fIndex}_flat_${flIndex}_name`
                ] = "Flat name is required";
              }
            });
            floor.common_areas.forEach((commonArea: any, caIndex: number) => {
              if (!commonArea.common_area_name.trim()) {
                newErrors[
                  `building_${bIndex}_floor_${fIndex}_common_${caIndex}_name`
                ] = "Common area name is required";
              }
            });
          }
        });
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    } else {
      toast.warning("Please fill valid details.");
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleSubmit = async () => {
    if (validateStep(5)) {
      if (
        !formData.name ||
        formData.name.length < 3 ||
        !formData.location ||
        formData.location.length < 3 ||
        !formData.start_date ||
        !formData.end_date ||
        formData.start_date.length === 0 ||
        formData.end_date.length === 0
      ) {
        toast.warning("Please fill required fields.");
        return;
      }

      setLoading(true);
      try {
        const projectRes: any = await projectApi.updateProject(
          formData.id,
          formData,
        );

        if (projectRes.success) {
          toast.success("Project Updated Successfully.");
          loadAllData();
          setUpdateProjectDetails(false);
        } else {
          toast.error("Something went wrong. Please try again.");
        }
      } catch (error) {
        toast.error("Failed to update project.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addBuilding = () => {
    const newBuilding: Building = {
      building_name: `Building ${formData.buildings.length + 1}`,
      floors: [],
    };
    setFormData((prev) => ({
      ...prev,
      buildings: [...prev.buildings, newBuilding],
    }));
  };

  const updateBuilding = (index: number, field: string, value: any) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[index] = { ...updatedBuildings[index], [field]: value };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const removeBuilding = (index: number) => {
    const updatedBuildings = formData.buildings.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    setBuildingFloorCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[index];
      return newCounts;
    });
  };

  const handleBuildingFloorCountChange = (
    buildingIndex: number,
    value: number,
  ) => {
    setBuildingFloorCounts((prev) => ({
      ...prev,
      [buildingIndex]: Math.max(value),
    }));
  };

  const handleFloorFlatCountChange = (
    buildingIndex: number,
    floorIndex: number,
    value: number,
  ) => {
    const key = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({
      ...prev,
      [key]: Math.max(value),
    }));
  };

  const addMultipleFloors = (buildingIndex: number, count: number) => {
    if (count < 1) return;

    const updatedBuildings = [...formData.buildings];
    const building = updatedBuildings[buildingIndex];

    building.floors = [];

    for (let i = 1; i <= count; i++) {
      const floorNumber = i;
      const newFloor: Floor = {
        floor_name: floorNumber === 1 ? "Ground Floor" : `Floor ${floorNumber}`,
        flats: [],
        common_areas: [],
      };

      building.floors.push(newFloor);
    }

    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    setBuildingFloorCounts((prev) => ({
      ...prev,
      [buildingIndex]: 1,
    }));
  };

  const addMultipleFlats = (
    buildingIndex: number,
    floorIndex: number,
    count: number,
  ) => {
    if (count < 1) return;

    const updatedBuildings = [...formData.buildings];
    const floor = updatedBuildings[buildingIndex].floors[floorIndex];

    const floorName = floor.floor_name.toLowerCase().includes("ground")
      ? "G"
      : (floorIndex + 1).toString();

    floor.flats = [];

    for (let i = 1; i <= count; i++) {
      const flatNumber = i;
      const newFlat: Flat = {
        flat_name: `${floorName}${flatNumber.toString().padStart(2, "0")}`,
        status: "pending",
        workflow: [...defaultWorkflow],
      };
      floor.flats.push(newFlat);
    }

    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({ ...prev, [floorKey]: 1 }));
  };

  const addFloor = (buildingIndex: number) => {
    const updatedBuildings = [...formData.buildings];
    const floorNumber = updatedBuildings[buildingIndex].floors.length + 1;
    const newFloor: Floor = {
      floor_name: floorNumber === 1 ? "Ground Floor" : `Floor ${floorNumber}`,
      flats: [],
      common_areas: [],
    };
    updatedBuildings[buildingIndex].floors.push(newFloor);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFloor = (
    buildingIndex: number,
    floorIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const removeFloor = (buildingIndex: number, floorIndex: number) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors = updatedBuildings[
      buildingIndex
    ].floors.filter((_: any, i: number) => i !== floorIndex);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[floorKey];
      return newCounts;
    });
  };

  const addFlat = (buildingIndex: number, floorIndex: number) => {
    const updatedBuildings = [...formData.buildings];
    const floor = updatedBuildings[buildingIndex].floors[floorIndex];
    const flatNumber = floor.flats.length + 1;
    const floorName = floor.floor_name.toLowerCase().includes("ground")
      ? "G"
      : (floorIndex + 1).toString();
    const newFlat: Flat = {
      flat_name: `${floorName}${flatNumber.toString().padStart(2, "0")}`,
      status: "pending",
      workflow: [...defaultWorkflow],
    };
    updatedBuildings[buildingIndex].floors[floorIndex].flats.push(newFlat);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFlat = (
    buildingIndex: number,
    floorIndex: number,
    flatIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].flats[flatIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex].flats[flatIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const removeFlat = (
    buildingIndex: number,
    floorIndex: number,
    flatIndex: number,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].flats = updatedBuildings[
      buildingIndex
    ].floors[floorIndex].flats.filter((_: any, i: number) => i !== flatIndex);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const addCommonArea = (buildingIndex: number, floorIndex: number) => {
    const updatedBuildings = [...formData.buildings];
    const floor = updatedBuildings[buildingIndex].floors[floorIndex];
    const commonAreaNumber = floor.common_areas.length + 1;
    const newCommonArea: CommonArea = {
      common_area_name: `Common Area ${commonAreaNumber}`,
      status: "pending",
      workflow: [...defaultWorkflow],
    };
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas.push(
      newCommonArea,
    );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateCommonArea = (
    buildingIndex: number,
    floorIndex: number,
    caIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas[caIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex].common_areas[
        caIndex
      ],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const removeCommonArea = (
    buildingIndex: number,
    floorIndex: number,
    caIndex: number,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas =
      updatedBuildings[buildingIndex].floors[floorIndex].common_areas.filter(
        (_: any, i: number) => i !== caIndex,
      );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const calculateSummary = () => {
    const totalBuildings = formData.buildings.length;
    const totalFloors = formData.buildings.reduce(
      (sum: number, building: any) => sum + building.floors.length,
      0,
    );
    const totalFlats = formData.buildings.reduce(
      (sum: number, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: number, floor: any) => floorSum + floor.flats.length,
          0,
        ),
      0,
    );
    const totalCommonAreas = formData.buildings.reduce(
      (sum: number, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: number, floor: any) =>
            floorSum + floor.common_areas.length,
          0,
        ),
      0,
    );

    return { totalBuildings, totalFloors, totalFlats, totalCommonAreas };
  };

  const updateBuildingDetails = (
    index: number,
    value: string,
    count: number,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[index] = {
      ...updatedBuildings[index],
      ["building_name"]: value,
    };

    if (count < 1) return;

    const building = updatedBuildings[index];

    building.floors = [];
    for (let i = 1; i <= count; i++) {
      const floorNumber = i;
      const newFloor: Floor = {
        floor_name: floorNumber === 1 ? "Ground Floor" : `Floor ${floorNumber}`,
        flats: [],
        common_areas: [],
      };

      building.floors = [...building.floors, newFloor];
    }

    setBuildingFloorCounts((prev) => ({
      ...prev,
      [index]: count,
    }));

    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFloorDetails = (
    name: string,
    count: number,
    buildingIndex: number,
    floorIndex: number,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex],
      ["floor_name"]: name,
    };

    if (count < 0) return;

    const floor = updatedBuildings[buildingIndex].floors[floorIndex];

    const floorName = floor.floor_name.toLowerCase().includes("ground")
      ? "G"
      : (floorIndex + 1).toString();

    floor.flats = [];
    for (let i = 1; i <= count; i++) {
      const flatNumber = i;
      const newFlat: Flat = {
        flat_name: `${floorName}${flatNumber.toString().padStart(2, "0")}`,
        status: "pending",
        workflow: [...defaultWorkflow],
      };
      floor.flats.push(newFlat);
    }

    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({ ...prev, [floorKey]: count }));
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFlatDetails = (
    buildingIndex: number,
    floorIndex: number,
    flatIndex: number,
    value: string,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].flats[flatIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex].flats[flatIndex],
      ["flat_name"]: value,
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateCommonAreaDetails = (
    buildingIndex: number,
    floorIndex: number,
    caIndex: number,
    value: string,
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas[caIndex] = {
      ...updatedBuildings[buildingIndex].floors[floorIndex].common_areas[
        caIndex
      ],
      ["common_area_name"]: value,
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl my-4 border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  Update Construction Project
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Edit project details
                </p>
              </div>
            </div>
            <button
              onClick={() => setUpdateProjectDetails(false)}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-3 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-white">
            <div className="relative flex items-center justify-between max-w-4xl mx-auto">
              {/* Background Progress Line */}
              <div
                className="absolute top-4 sm:top-5 left-0 right-0 h-[2px] bg-gray-200 hidden sm:block"
                style={{
                  marginLeft: "calc(1.25rem + 0.5rem)",
                  marginRight: "calc(1.25rem + 0.5rem)",
                }}
              />

              {/* Active Progress Line */}
              <div
                className="absolute top-4 sm:top-5 left-0 h-[2px] bg-gradient-to-r from-[#C62828] to-green-500 transition-all duration-500 ease-out hidden sm:block"
                style={{
                  marginLeft: "calc(1.25rem + 0.5rem)",
                  width: `calc(${((currentStep - 1) / (steps.length - 1)) * 100}% - 2.5rem)`,
                }}
              />

              {steps.map((step, index) => (
                <button
                  onClick={() => {
                    if (!validateStep(index + 1)) {
                      toast.warning("Please fill valid details.");
                      return;
                    }
                    setCurrentStep(index + 1);
                  }}
                  key={step.number}
                  className="flex flex-col items-center relative z-10 group flex-1 sm:flex-initial"
                >
                  {/* Step Circle */}
                  <div
                    className={`
            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center
            transition-all duration-300 ease-out
            ${
              currentStep > step.number
                ? "bg-green-500 shadow-md sm:shadow-lg shadow-green-500/30"
                : currentStep === step.number
                  ? "bg-[#C62828] shadow-lg sm:shadow-xl shadow-red-500/40 scale-105 sm:scale-110 ring-2 sm:ring-4 ring-red-100"
                  : "bg-white border-2 border-gray-300 group-hover:border-gray-400 group-hover:shadow-md"
            }
          `}
                  >
                    {currentStep > step.number ? (
                      <Check
                        className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                        strokeWidth={3}
                      />
                    ) : (
                      <span
                        className={`
                text-xs sm:text-sm font-bold
                ${currentStep === step.number ? "text-white" : "text-gray-500"}
              `}
                      >
                        {step.icon}
                      </span>
                    )}
                  </div>

                  {/* Step Title */}
                  <span
                    className={`
            text-[10px] sm:text-xs font-medium mt-1.5 sm:mt-2 whitespace-nowrap
            transition-colors duration-200
            ${
              currentStep >= step.number
                ? "text-gray-900 font-semibold"
                : "text-gray-500"
            }
          `}
                  >
                    {step.title}
                  </span>

                  {/* Connector Line - Mobile Only */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
              absolute top-4 left-[60%] w-full h-[2px] sm:hidden
              transition-colors duration-300
              ${currentStep > step.number ? "bg-green-500" : "bg-gray-200"}
            `}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-4">
            {/* Step 1: Project Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="p-1.5 bg-[#C62828]/10 rounded-lg mr-2">
                    <Home className="w-4 h-4 text-[#C62828]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Update Project Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <FileText className="w-3 h-3 text-[#C62828]" />
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <FileText className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 transition ${
                          errors.name ? "border-red-300" : "border-gray-200"
                        }`}
                        placeholder="e.g., Sunshine Residency"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-[#C62828]" />
                      Location <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <MapPin className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) =>
                          handleInputChange("location", e.target.value)
                        }
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 ${
                          errors.location ? "border-red-300" : "border-gray-200"
                        }`}
                        placeholder="e.g., Sector 15, Gurgaon"
                      />
                    </div>
                    {errors.location && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.location}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[#C62828]" />
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Calendar className="w-3 h-3" />
                      </div>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) =>
                          handleInputChange("start_date", e.target.value)
                        }
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 ${
                          errors.start_date
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                      />
                    </div>
                    {errors.start_date && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-[#C62828]" />
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Calendar className="w-3 h-3" />
                      </div>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) =>
                          handleInputChange("end_date", e.target.value)
                        }
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 ${
                          errors.end_date ? "border-red-300" : "border-gray-200"
                        }`}
                        min={formData.start_date}
                      />
                    </div>
                    {errors.end_date && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Buildings */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                      <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      Update Buildings
                    </h3>
                  </div>
                  <button
                    onClick={addBuilding}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-all duration-200"
                  >
                    <Plus className="w-3 h-3" /> Add Building
                  </button>
                </div>

                {errors.buildings && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" /> {errors.buildings}
                    </p>
                  </div>
                )}

                {formData.buildings.length !== 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formData.buildings.map(
                      (building: any, buildingIndex: number) => (
                        <div
                          key={building.id || buildingIndex}
                          className="bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-all duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 flex-1">
                              <div className="p-1.5 bg-green-100 rounded-lg">
                                <Building className="w-4 h-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={building.building_name}
                                  disabled
                                  className={`w-full text-sm font-semibold bg-transparent border-b-2 focus:outline-none focus:border-[#C62828] px-1 py-1 ${
                                    errors[`building_${buildingIndex}_name`]
                                      ? "border-red-300"
                                      : "border-gray-300"
                                  }`}
                                  placeholder="Enter building name"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {formData.buildings.length >= 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedItem({
                                      name: building.building_name,
                                      count:
                                        buildingFloorCounts[buildingIndex] ||
                                        building.floors.length,
                                      buildingId: buildingIndex,
                                      floorId: "",
                                      flatId: "",
                                      commonAreaId: "",
                                    });
                                    setShowModalForItem("building");
                                  }}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              )}
                              {formData.buildings.length >= 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeBuilding(buildingIndex)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="ml-8 mt-2">
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                              <Layers className="w-3 h-3" />
                              Floors:{" "}
                              <span className="font-semibold">
                                {building.floors.length}
                              </span>
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col justify-center items-center py-8">
                    <div className="p-3 bg-gray-100 rounded-xl mb-4">
                      <Building className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 text-center">
                      Add buildings to this project
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Floors */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="p-1.5 bg-purple-100 rounded-lg mr-2">
                    <DoorOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Update Floors
                  </h3>
                </div>

                {formData.buildings.map(
                  (building: any, buildingIndex: number) => (
                    <div key={building.id || buildingIndex} className="mb-4">
                      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-gray-600" />
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {building.building_name}
                          </h4>
                          <span className="text-xs text-gray-500">
                            ({building.floors.length} floors)
                          </span>
                        </div>
                        {errors[`building_${buildingIndex}_floors`] && (
                          <span className="text-xs text-red-600">
                            {errors[`building_${buildingIndex}_floors`]}
                          </span>
                        )}
                      </div>

                      <div className="ml-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {building.floors.map(
                          (floor: any, floorIndex: number) => (
                            <div
                              key={floor.id || floorIndex}
                              className="bg-white border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-all duration-200"
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="p-1 bg-purple-100 rounded-lg">
                                    <Layers className="w-3 h-3 text-purple-600" />
                                  </div>
                                  <input
                                    type="text"
                                    value={floor.floor_name}
                                    disabled
                                    className={`w-full flex-1 bg-transparent border-b focus:outline-none focus:border-[#C62828] px-1 py-1 text-xs ${
                                      errors[
                                        `building_${buildingIndex}_floor_${floorIndex}_name`
                                      ]
                                        ? "border-red-300"
                                        : "border-gray-300"
                                    }`}
                                    placeholder="Enter floor name"
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  {formData.buildings.length >= 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedItem({
                                          name: floor.floor_name,
                                          count:
                                            floorFlatCounts[
                                              `${buildingIndex}_${floorIndex}`
                                            ] || floor.flats.length,
                                          buildingId: buildingIndex,
                                          floorId: floorIndex,
                                          flatId: "",
                                          commonAreaId: "",
                                        });
                                        setShowModalForItem("floor");
                                      }}
                                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeFloor(buildingIndex, floorIndex)
                                    }
                                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              {errors[
                                `building_${buildingIndex}_floor_${floorIndex}_name`
                              ] && (
                                <p className="text-xs text-red-600 mt-1 ml-8">
                                  {
                                    errors[
                                      `building_${buildingIndex}_floor_${floorIndex}_name`
                                    ]
                                  }
                                </p>
                              )}

                              <div className="ml-8 text-xs text-gray-600 mt-1">
                                <div className="flex gap-3">
                                  <span className="flex items-center gap-1">
                                    <DoorOpen className="w-3 h-3" />{" "}
                                    {floor.flats.length} flats
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />{" "}
                                    {floor.common_areas.length} common areas
                                  </span>
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => addFloor(buildingIndex)}
                        className="ml-2 mt-2 flex items-center gap-2 text-[#C62828] hover:text-red-700 font-medium text-xs"
                      >
                        <div className="p-1 bg-[#C62828]/10 rounded">
                          <Plus className="w-3 h-3" />
                        </div>
                        Add Floor to {building.building_name}
                      </button>
                    </div>
                  ),
                )}
              </div>
            )}

            {/* Step 4: Units (Flats & Common Areas) */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="p-1.5 bg-amber-100 rounded-lg mr-2">
                    <LayoutGrid className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Update Units
                  </h3>
                </div>

                {formData.buildings.map(
                  (building: any, buildingIndex: number) => (
                    <div key={building.id || buildingIndex} className="mb-4">
                      <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                        <Building className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-800 text-sm">
                          {building.building_name}
                        </span>
                      </div>

                      {building.floors.map((floor: any, floorIndex: number) => (
                        <div key={floor.id || floorIndex} className="ml-2 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-3 h-3 text-gray-500" />
                              <span className="font-medium text-gray-700 text-sm">
                                {floor.floor_name}
                              </span>
                            </div>
                            {errors[
                              `building_${buildingIndex}_floor_${floorIndex}_units`
                            ] && (
                              <span className="text-xs text-red-600">
                                {
                                  errors[
                                    `building_${buildingIndex}_floor_${floorIndex}_units`
                                  ]
                                }
                              </span>
                            )}
                          </div>

                          <div className="ml-2 grid grid-cols-1 lg:grid-cols-2 gap-3">
                            {/* Flats Section */}
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-700 text-xs flex items-center gap-1">
                                  <DoorOpen className="w-3 h-3" />
                                  Flats ({floor.flats.length})
                                </h5>
                                <div className="flex items-center gap-1">
                                  <input
                                    type="text"
                                    value={
                                      floorFlatCounts[
                                        `${buildingIndex}_${floorIndex}`
                                      ]
                                    }
                                    onChange={(e) =>
                                      handleFloorFlatCountChange(
                                        buildingIndex,
                                        floorIndex,
                                        parseInt(e.target.value) || 0,
                                      )
                                    }
                                    className="w-12 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#C62828]/20 focus:border-[#C62828]"
                                    placeholder="Count"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addMultipleFlats(
                                        buildingIndex,
                                        floorIndex,
                                        floorFlatCounts[
                                          `${buildingIndex}_${floorIndex}`
                                        ] || 0,
                                      )
                                    }
                                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 transition-all duration-200 flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Add
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      addFlat(buildingIndex, floorIndex)
                                    }
                                    className="text-xs bg-[#C62828] text-white px-2 py-1 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Single
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1">
                                {floor.flats.map(
                                  (flat: any, flatIndex: number) => (
                                    <div
                                      key={flat.id || flatIndex}
                                      className="bg-white rounded p-1.5 border border-gray-200"
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex flex-1 items-center">
                                          <div className="bg-blue-50 rounded-lg text-blue-600 mr-1 p-1">
                                            <Home className="w-3 h-3" />
                                          </div>
                                          <input
                                            type="text"
                                            value={flat.flat_name}
                                            disabled
                                            className={`w-full bg-transparent border-b focus:outline-none focus:border-[#C62828] px-1 py-0.5 text-xs ${
                                              errors[
                                                `building_${buildingIndex}_floor_${floorIndex}_flat_${flatIndex}_name`
                                              ]
                                                ? "border-red-300"
                                                : "border-gray-300"
                                            }`}
                                            placeholder="Flat name/number"
                                          />
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          {formData.buildings.length >= 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedItem({
                                                  name: flat.flat_name,
                                                  count: "",
                                                  buildingId: buildingIndex,
                                                  floorId: floorIndex,
                                                  flatId: flatIndex,
                                                  commonAreaId: "",
                                                });
                                                setShowModalForItem("flat");
                                              }}
                                              className="p-0.5 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeFlat(
                                                buildingIndex,
                                                floorIndex,
                                                flatIndex,
                                              )
                                            }
                                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                                {floor.flats.length === 0 && (
                                  <p className="text-xs text-gray-400 text-center py-2 col-span-2">
                                    No flats added yet
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Common Areas Section */}
                            <div className="bg-gray-50 rounded-lg p-2">
                              <div className="flex justify-between items-center mb-2">
                                <h5 className="font-medium text-gray-700 text-xs flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  Common Areas ({floor.common_areas.length})
                                </h5>
                                <button
                                  type="button"
                                  onClick={() =>
                                    addCommonArea(buildingIndex, floorIndex)
                                  }
                                  className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Add Area
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-1">
                                {floor.common_areas.map(
                                  (commonArea: any, caIndex: number) => (
                                    <div
                                      key={commonArea.id || caIndex}
                                      className="bg-white rounded p-1.5 border border-gray-200"
                                    >
                                      <div className="flex justify-between items-center">
                                        <div className="flex flex-1 items-center">
                                          <div className="bg-green-50 rounded-lg text-green-600 mr-1 p-1">
                                            <DoorOpen className="w-3 h-3" />
                                          </div>
                                          <input
                                            type="text"
                                            value={commonArea.common_area_name}
                                            disabled
                                            className={`w-full bg-transparent border-b focus:outline-none focus:border-[#C62828] px-1 py-0.5 text-xs ${
                                              errors[
                                                `building_${buildingIndex}_floor_${floorIndex}_common_${caIndex}_name`
                                              ]
                                                ? "border-red-300"
                                                : "border-gray-300"
                                            }`}
                                            placeholder="Common area name"
                                          />
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          {formData.buildings.length >= 1 && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedItem({
                                                  name: commonArea.common_area_name,
                                                  count: "",
                                                  buildingId: buildingIndex,
                                                  floorId: floorIndex,
                                                  flatId: "",
                                                  commonAreaId: caIndex,
                                                });
                                                setShowModalForItem(
                                                  "common_area",
                                                );
                                              }}
                                              className="p-0.5 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                            >
                                              <Edit2 className="w-3 h-3" />
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() =>
                                              removeCommonArea(
                                                buildingIndex,
                                                floorIndex,
                                                caIndex,
                                              )
                                            }
                                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ),
                                )}
                                {floor.common_areas.length === 0 && (
                                  <p className="text-xs text-gray-400 text-center py-2 col-span-2">
                                    No common areas added yet
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ),
                )}

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-gray-800 mb-2 text-sm flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Quick Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-blue-600">
                        {calculateSummary().totalFlats}
                      </div>
                      <p className="text-xs text-gray-600">Total Flats</p>
                    </div>
                    <div className="text-center bg-white rounded-lg p-2">
                      <div className="text-sm font-bold text-green-600">
                        {calculateSummary().totalCommonAreas}
                      </div>
                      <p className="text-xs text-gray-600">Common Areas</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="p-1.5 bg-emerald-100 rounded-lg mr-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Review Changes
                  </h3>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    Structure Summary
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                    <div className="text-center bg-blue-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-blue-600 flex items-center justify-center gap-1">
                        {calculateSummary().totalBuildings}{" "}
                        <Building className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-gray-600">Buildings</p>
                    </div>
                    <div className="text-center bg-purple-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-purple-600 flex items-center justify-center gap-1">
                        {calculateSummary().totalFloors}{" "}
                        <Layers className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-gray-600">Floors</p>
                    </div>
                    <div className="text-center bg-amber-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-amber-600 flex items-center justify-center gap-1">
                        {calculateSummary().totalFlats}{" "}
                        <Home className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-gray-600">Flats</p>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-2">
                      <div className="text-sm font-bold text-green-600 flex items-center justify-center gap-1">
                        {calculateSummary().totalCommonAreas}{" "}
                        <DoorOpen className="w-3 h-3" />
                      </div>
                      <p className="text-xs text-gray-600">Common Areas</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-3">
                  <div className="space-y-4">
                    {/* Project Overview */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Project Overview
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-600">Project Name</p>
                          <p className="font-medium text-gray-800 text-sm">
                            {formData.name || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="font-medium text-gray-800 text-sm">
                            {formData.location || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Start Date</p>
                          <p className="font-medium text-gray-800 text-sm">
                            {formData.start_date || "Not set"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">End Date</p>
                          <p className="font-medium text-gray-800 text-sm">
                            {formData.end_date || "Not set"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Structure */}
                    <div className="space-y-2">
                      {formData.buildings.map(
                        (building: any, buildingIndex: number) => (
                          <div
                            key={building.id || buildingIndex}
                            className="bg-white border border-gray-200 rounded-lg p-2"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Building className="w-3 h-3 text-gray-500" />
                              <div>
                                <h5 className="font-medium text-gray-800 text-sm">
                                  {building.building_name}
                                </h5>
                                <p className="text-xs text-gray-500">
                                  {building.floors.length} floors
                                </p>
                              </div>
                            </div>

                            <div className="ml-5 space-y-1">
                              {building.floors.map(
                                (floor: any, floorIndex: number) => (
                                  <div
                                    key={floor.id || floorIndex}
                                    className="border-l-2 border-blue-200 pl-2 py-1"
                                  >
                                    <div className="flex items-center gap-1 mb-0.5">
                                      <Layers className="w-3 h-3 text-gray-400" />
                                      <span className="font-medium text-gray-700 text-xs">
                                        {floor.floor_name}
                                      </span>
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({floor.flats.length} flats,{" "}
                                        {floor.common_areas.length} common
                                        areas)
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1 ml-4">
                                      {floor.flats.map(
                                        (flat: any, flatIndex: number) => (
                                          <div
                                            key={flat.id || flatIndex}
                                            className="px-1.5 py-0.5 bg-blue-50 rounded text-xs border border-blue-100"
                                          >
                                            <span className="font-medium text-blue-700 flex items-center">
                                              {flat.flat_name}{" "}
                                              <Home className="w-2 h-2 ml-0.5" />
                                            </span>
                                          </div>
                                        ),
                                      )}
                                      {floor.common_areas.map(
                                        (commonArea: any, caIndex: number) => (
                                          <div
                                            key={commonArea.id || caIndex}
                                            className="px-1.5 py-0.5 bg-green-50 rounded text-xs border border-green-100"
                                          >
                                            <span className="font-medium text-green-700 flex items-center">
                                              {commonArea.common_area_name}{" "}
                                              <DoorOpen className="w-2 h-2 ml-0.5" />
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex justify-between items-center">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Previous
                  </button>
                )}
              </div>

              <div className="text-xs text-gray-600">
                <span className="font-medium">Step {currentStep}</span> of{" "}
                {steps.length}
              </div>

              <div>
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-4 py-2 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm text-sm"
                  >
                    Continue
                    <ArrowRight className="w-3 h-3" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm disabled:opacity-70 text-sm"
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        Update Project
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Item Modal */}
      {showUpdateModalForItem && selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 ${
              showUpdateModalForItem === "flat" ||
              showUpdateModalForItem === "common_area"
                ? "w-full max-w-[400px]"
                : "w-full max-w-xl"
            } my-4 border border-gray-200`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center rounded-t-2xl border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  {showUpdateModalForItem === "building" && (
                    <Building2 className="w-5 h-5 text-white" />
                  )}
                  {showUpdateModalForItem === "floor" && (
                    <Layers className="w-5 h-5 text-white" />
                  )}
                  {showUpdateModalForItem === "flat" && (
                    <Home className="w-5 h-5 text-white" />
                  )}
                  {showUpdateModalForItem === "common_area" && (
                    <DoorOpen className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Update {showUpdateModalForItem === "building" && "Building"}
                    {showUpdateModalForItem === "floor" && "Floor"}
                    {showUpdateModalForItem === "flat" && "Flat"}
                    {showUpdateModalForItem === "common_area" && "Common Area"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Update details
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModalForItem(null);
                }}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              {showUpdateModalForItem === "building" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-[#C62828]" />
                      Building Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Layers className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={selectedItem.name}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20`}
                        placeholder="Wing - A"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-[#C62828]" />
                      Number of Floors <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Layers className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={selectedItem.count}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            count: e.target.value,
                          }));
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20`}
                        placeholder="Enter Number of Floors"
                      />
                    </div>
                  </div>
                </div>
              )}
              {showUpdateModalForItem === "floor" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Layers className="w-3 h-3 text-[#C62828]" />
                      Select Floor Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Layers className="w-3 h-3" />
                      </div>
                      <select
                        value={selectedItem.name}
                        onChange={(e) => {
                          if (e.target.value === "other") {
                            setShowInputField(true);
                            setSelectedItem((prev: any) => ({
                              ...prev,
                              name: "",
                            }));
                          } else {
                            setShowInputField(false);
                            setSelectedItem((prev: any) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }
                        }}
                        className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none"
                        required
                      >
                        <option value="0">Select Common Area Name</option>
                        {allFloors.map((ca: any) => (
                          <option key={ca.name} value={ca.name}>
                            {ca.name}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  {showInputFeild && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <Layers className="w-3 h-3 text-[#C62828]" />
                        Floor Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                          <Layers className="w-3 h-3" />
                        </div>
                        <input
                          type="text"
                          value={selectedItem.name}
                          onChange={(e) => {
                            setSelectedItem((prev: any) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }}
                          className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20`}
                          placeholder="Floor - 1"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-1.5 lg:col-span-2">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Home className="w-3 h-3 text-[#C62828]" />
                      Number of Flats <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Home className="w-3 h-3" />
                      </div>
                      <input
                        type="text"
                        value={selectedItem.count}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            count: e.target.value,
                          }));
                        }}
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20`}
                        placeholder="Enter Number of Flats"
                      />
                    </div>
                  </div>
                </div>
              )}
              {(showUpdateModalForItem === "flat" ||
                showUpdateModalForItem === "common_area") && (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      {showUpdateModalForItem === "flat" ? (
                        <Home className="w-3 h-3 text-[#C62828]" />
                      ) : (
                        <DoorOpen className="w-3 h-3 text-[#C62828]" />
                      )}
                      {showUpdateModalForItem === "flat" && "Flat"}{" "}
                      {showUpdateModalForItem === "common_area" &&
                        "Select Common Area"}{" "}
                      Name <span className="text-red-500">*</span>
                    </label>
                    {showUpdateModalForItem === "common_area" && (
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                          <DoorOpen className="w-3 h-3" />
                        </div>
                        <select
                          value={selectedItem.name}
                          onChange={(e) => {
                            if (e.target.value === "other") {
                              setShowInputField(true);
                              setSelectedItem((prev: any) => ({
                                ...prev,
                                name: "",
                              }));
                            } else {
                              setShowInputField(false);
                              setSelectedItem((prev: any) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            }
                          }}
                          className="w-full pl-9 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none"
                          required
                        >
                          <option value="0">Select Common Area Name</option>
                          {allCommonArea.map((ca: any) => (
                            <option key={ca.name} value={ca.name}>
                              {ca.name}
                            </option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    )}
                    {(showInputFeild || showUpdateModalForItem === "flat") && (
                      <div
                        className={`${
                          showUpdateModalForItem === "common_area" && "mt-3"
                        } space-y-1.5`}
                      >
                        {showInputFeild &&
                          showUpdateModalForItem === "common_area" && (
                            <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                              Enter Common Area Name
                            </label>
                          )}
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            {showUpdateModalForItem === "flat" ? (
                              <Home className="w-3 h-3" />
                            ) : (
                              <DoorOpen className="w-3 h-3" />
                            )}
                          </div>
                          <input
                            type="text"
                            value={selectedItem.name}
                            onChange={(e) => {
                              setSelectedItem((prev: any) => ({
                                ...prev,
                                name: e.target.value,
                              }));
                            }}
                            className={`w-full pl-9 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none`}
                            placeholder="Gym"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    if (selectedItem.name.length === 0) {
                      toast.warning("Fill Correct data.");
                      return;
                    }
                    if (showUpdateModalForItem === "building") {
                      updateBuildingDetails(
                        selectedItem.buildingId,
                        selectedItem.name,
                        selectedItem.count,
                      );
                    }
                    if (showUpdateModalForItem === "floor") {
                      updateFloorDetails(
                        selectedItem.name,
                        selectedItem.count,
                        selectedItem.buildingId,
                        selectedItem.floorId,
                      );
                    }
                    if (showUpdateModalForItem === "flat") {
                      updateFlatDetails(
                        selectedItem.buildingId,
                        selectedItem.floorId,
                        selectedItem.flatId,
                        selectedItem.name,
                      );
                    }
                    if (showUpdateModalForItem === "common_area") {
                      updateCommonAreaDetails(
                        selectedItem.buildingId,
                        selectedItem.floorId,
                        selectedItem.commonAreaId,
                        selectedItem.name,
                      );
                    }

                    setSelectedItem({
                      name: "",
                      count: "",
                      buildingId: "",
                      floorId: "",
                      flatId: "",
                      commonAreaId: "",
                    });
                    setShowModalForItem(null);
                    setShowInputField(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowModalForItem(null);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom scrollbar styles */}
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
    </>
  );
}
