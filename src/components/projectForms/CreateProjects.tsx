// src/components/ConstructionProjectWizardForm.tsx
import { useEffect, useRef, useState } from "react";
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
  Download,
} from "lucide-react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import { excelToProjectFormData } from "../../utils/excelToProjectFormData";

interface ProjectWizardFormProps {
  setShowModel: any;
  loadAllData: any;
  allFloors: any;
  allCommonArea: any;
}

interface Building {
  building_name: string;
  floors: Floor[];
}

interface Floor {
  floor_name: string;
  flats: Flat[];
  common_areas: CommonArea[];
}

interface Flat {
  flat_name: string;
  status?: string;
  workflow?: any[];
}

interface CommonArea {
  common_area_name: string;
  status?: string;
  workflow?: any[];
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

export default function ConstructionProjectWizardForm({
  setShowModel,
  loadAllData,
  allFloors,
  allCommonArea,
}: ProjectWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInputFeild, setShowInputField] = useState(false);
  const [showUpdateModalForItem, setShowModalForItem] = useState<string | null>(
    null
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

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    start_date: "",
    end_date: "",
    buildings: [] as Building[],
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const steps = [
    {
      number: 1,
      title: "Project Details",
      icon: <FileText className="w-5 h-5" />,
      description: "Basic project information",
    },
    {
      number: 2,
      title: "Buildings",
      icon: <Building2 className="w-5 h-5" />,
      description: "Add buildings to project",
    },
    {
      number: 3,
      title: "Floors",
      icon: <DoorOpen className="w-5 h-5" />,
      description: "Configure floors for each building",
    },
    {
      number: 4,
      title: "Units",
      icon: <LayoutGrid className="w-5 h-5" />,
      description: "Add flats and common areas",
    },
    {
      number: 5,
      title: "Review",
      icon: <Check className="w-5 h-5" />,
      description: "Review and submit",
    },
  ];

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData: any = await excelToProjectFormData(file);
      setFormData(formData); // ✅ pre-fill form
    } catch (err: any) {
      toast.error(err);
    }

    // allow same file re-upload
    e.target.value = "";
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
        formData.buildings.forEach((building, bIndex) => {
          if (!building.building_name.trim()) {
            newErrors[`building_${bIndex}_name`] = "Building name is required";
          }
        });
      }
    }

    if (step === 3) {
      formData.buildings.forEach((building, bIndex) => {
        if (building.floors.length === 0) {
          newErrors[`building_${bIndex}_floors`] =
            "At least one floor is required for this building";
        } else {
          building.floors.forEach((floor, fIndex) => {
            if (!floor.floor_name.trim()) {
              newErrors[`building_${bIndex}_floor_${fIndex}_name`] =
                "Floor name is required";
            }
          });
        }
      });
    }

    if (step === 4) {
      formData.buildings.forEach((building, bIndex) => {
        building.floors.forEach((floor, fIndex) => {
          const hasFlats = floor.flats.length >= 0;
          const hasCommonAreas = floor.common_areas.length >= 0;

          if (!hasFlats && !hasCommonAreas) {
            newErrors[`building_${bIndex}_floor_${fIndex}_units`] =
              "Add at least one flat or common area";
          } else {
            floor.flats.forEach((flat, flIndex) => {
              if (!flat.flat_name.trim()) {
                newErrors[
                  `building_${bIndex}_floor_${fIndex}_flat_${flIndex}_name`
                ] = "Flat name is required";
              }
            });
            floor.common_areas.forEach((commonArea, caIndex) => {
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
      const finalData = {
        ...formData,
        buildings: formData.buildings.map((building) => ({
          ...building,
          floors: building.floors.map((floor) => ({
            ...floor,
            flats: floor.flats.map((flat) => ({
              ...flat,
              status: flat.status || "pending",
              workflow: flat.workflow || defaultWorkflow,
            })),
            common_areas: floor.common_areas.map((commonArea) => ({
              ...commonArea,
              status: commonArea.status || "pending",
              workflow: commonArea.workflow || defaultWorkflow,
            })),
          })),
        })),
      };

      if (
        !finalData.name ||
        finalData.name.length < 3 ||
        !finalData.location ||
        finalData.location.length < 3 ||
        !finalData.start_date ||
        !finalData.end_date ||
        finalData.start_date.length === 0 ||
        finalData.end_date.length === 0
      ) {
        toast.warning("Please fill required fields.");
        return;
      }

      const projectRes: any = await projectApi.createProject(finalData);

      if (projectRes.success) {
        toast.success("Project Created Successfully.");
        loadAllData();
        setShowModel(false);
      } else {
        toast.error("Something went wrong try again.");
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Building Management
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
    const updatedBuildings = formData.buildings.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    // Remove the building floor count from state
    setBuildingFloorCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[index];
      return newCounts;
    });
  };

  // Handle building floor count input change
  const handleBuildingFloorCountChange = (
    buildingIndex: number,
    value: number
  ) => {
    setBuildingFloorCounts((prev) => ({
      ...prev,
      [buildingIndex]: Math.max(value),
    }));
  };

  // Handle floor flat count input change
  const handleFloorFlatCountChange = (
    buildingIndex: number,
    floorIndex: number,
    value: number
  ) => {
    const key = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({
      ...prev,
      [key]: Math.max(value),
    }));
  };

  // Add multiple flats to floor
  const addMultipleFlats = (
    buildingIndex: number,
    floorIndex: number,
    count: number
  ) => {
    if (count < 1) return;

    const updatedBuildings = [...formData.buildings];
    const floor = updatedBuildings[buildingIndex].floors[floorIndex];

    const floorName = floor.floor_name.toLowerCase().includes("ground")
      ? "G"
      : (floorIndex + 1).toString();

    // Add new flats
    floor.flats = [];
    for (let i = 1; i <= count; i++) {
      const flatNumber = i;
      const newFlat: Flat = {
        flat_name: `${floorName}${flatNumber.toString().padStart(2, "0")}`,
        status: "pending",
        workflow: defaultWorkflow,
      };
      floor.flats.push(newFlat);
    }

    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    // Clear the input for this floor
    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({ ...prev, [floorKey]: 1 }));
  };

  // Floor Management
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
    value: any
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
    ].floors.filter((_, i) => i !== floorIndex);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));

    // Remove floor flat count from state
    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[floorKey];
      return newCounts;
    });
  };

  // Flat Management
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
      workflow: defaultWorkflow,
    };
    updatedBuildings[buildingIndex].floors[floorIndex].flats.push(newFlat);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFlat = (
    buildingIndex: number,
    floorIndex: number,
    flatIndex: number,
    field: string,
    value: any
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
    flatIndex: number
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].flats = updatedBuildings[
      buildingIndex
    ].floors[floorIndex].flats.filter((_, i) => i !== flatIndex);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  // Common Area Management
  const addCommonArea = (buildingIndex: number, floorIndex: number) => {
    const updatedBuildings = [...formData.buildings];
    const floor = updatedBuildings[buildingIndex].floors[floorIndex];
    const commonAreaNumber = floor.common_areas.length + 1;
    const newCommonArea: CommonArea = {
      common_area_name: `Common Area ${commonAreaNumber}`,
      status: "pending",
      workflow: defaultWorkflow,
    };
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas.push(
      newCommonArea
    );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateCommonArea = (
    buildingIndex: number,
    floorIndex: number,
    caIndex: number,
    field: string,
    value: any
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
    caIndex: number
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[buildingIndex].floors[floorIndex].common_areas =
      updatedBuildings[buildingIndex].floors[floorIndex].common_areas.filter(
        (_, i) => i !== caIndex
      );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalBuildings = formData.buildings.length;
    const totalFloors = formData.buildings.reduce(
      (sum, building) => sum + building.floors.length,
      0
    );
    const totalFlats = formData.buildings.reduce(
      (sum, building) =>
        sum +
        building.floors.reduce(
          (floorSum, floor) => floorSum + floor.flats.length,
          0
        ),
      0
    );
    const totalCommonAreas = formData.buildings.reduce(
      (sum, building) =>
        sum +
        building.floors.reduce(
          (floorSum, floor) => floorSum + floor.common_areas.length,
          0
        ),
      0
    );

    return { totalBuildings, totalFloors, totalFlats, totalCommonAreas };
  };

  const updateBuildingDetails = (
    index: number,
    value: string,
    count: number
  ) => {
    const updatedBuildings = [...formData.buildings];
    updatedBuildings[index] = {
      ...updatedBuildings[index],
      ["building_name"]: value,
    };
    if (count < 1) return;

    const building = updatedBuildings[index];

    // Add new floors
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

    // Reset count for this building
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
    floorIndex: number
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

    // Add new flats
    floor.flats = [];
    for (let i = 1; i <= count; i++) {
      const flatNumber = i;
      const newFlat: Flat = {
        flat_name: `${floorName}${flatNumber.toString().padStart(2, "0")}`,
        status: "pending",
        workflow: defaultWorkflow,
      };
      floor.flats.push(newFlat);
    }

    // Clear the input for this floor
    const floorKey = `${buildingIndex}_${floorIndex}`;
    setFloorFlatCounts((prev) => ({ ...prev, [floorKey]: count }));
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const updateFlatDetails = (
    buildingIndex: number,
    floorIndex: number,
    flatIndex: number,
    value: string
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
    value: string
  ) => {
    console.log(buildingIndex, floorIndex, caIndex, value);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                New Construction Project
              </h2>
              <p className="text-sm text-blue-100">Create project</p>
            </div>
          </div>
          <button
            onClick={() => setShowModel(false)}
            className="text-white hover:bg-white/10 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <button
                onClick={() => {
                  const error = validateStep(index + 1);
                  console.log(errors);
                  if (!error) {
                    toast.warning("Please fill valid details.");
                    return;
                  }
                  setCurrentStep(index + 1);
                }}
                key={step.number}
                className="flex items-center"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${
                      currentStep > step.number
                        ? "bg-green-500 border-green-500 text-white"
                        : currentStep === step.number
                        ? "bg-blue-500 border-blue-500 text-white shadow-md"
                        : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`
                    text-xs font-medium mt-2 whitespace-nowrap
                    ${
                      currentStep >= step.number
                        ? "text-gray-800"
                        : "text-gray-400"
                    }
                  `}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                    w-16 h-0.5 mx-2 mt-5
                    ${
                      currentStep > step.number ? "bg-green-500" : "bg-gray-300"
                    }
                  `}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="min-h-300 max-h-[400px] overflow-y-auto">
          {/* Step 1: Project Details */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center px-6 py-2 bg-blue-300">
                <div className="flex items-center justify-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm mr-3">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className=" flex items-center w-fits">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Project Information
                    </h3>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    onClick={handleImportClick}
                    className="bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 px-6 py-1 text-white font-semibold rounded-lg"
                  >
                    Import Excel
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <a
                    href={`${
                      import.meta.env.VITE_API_URL
                    }/templates/project-import`}
                    title="Download Template Data"
                    className="p-2 rounded-lg bg-slate-200 mx-2"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 p-6">
                <div className="">
                  <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      errors.name ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Sunshine Residency, Green Valley Project"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.location ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="e.g., Sector 15, Gurgaon"
                  />
                  {errors.location && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.location}
                    </p>
                  )}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleInputChange("start_date", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.start_date ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    {errors.start_date && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        handleInputChange("end_date", e.target.value)
                      }
                      className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.end_date ? "border-red-300" : "border-gray-300"
                      }`}
                      min={formData.start_date}
                    />
                    {errors.end_date && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.end_date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Buildings */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn ">
              <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-green-100 to-green-50 py-2 px-6">
                <div className="flex items-center">
                  <div className="w-10 h-10  rounded-full flex items-center justify-center border-4 border-white shadow-sm mr-3">
                    <Building2 className="w-5 h-5 text-green-600 " />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 ">
                    Add Buildings
                  </h3>
                </div>
                <button
                  onClick={addBuilding}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 font-semibold rounded-lg"
                >
                  Add New Building
                </button>
              </div>

              {errors.buildings && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.buildings}
                  </p>
                </div>
              )}

              {formData.buildings.length !== 0 ? (
                <div className="grid grid-cols-3">
                  {formData.buildings.map((building, buildingIndex) => (
                    <div
                      key={buildingIndex}
                      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm m-3"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Building className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={building.building_name}
                              disabled
                              className={`w-full text-lg font-semibold bg-transparent border-b-2 focus:outline-none focus:border-blue-500 px-1 py-2 ${
                                errors[`building_${buildingIndex}_name`]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter building name"
                            />
                            {errors[`building_${buildingIndex}_name`] && (
                              <p className="text-sm text-red-600 mt-1">
                                {errors[`building_${buildingIndex}_name`]}
                              </p>
                            )}
                          </div>
                        </div>
                        {formData.buildings.length >= 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItem({
                                name: building.building_name,
                                count: buildingFloorCounts[buildingIndex],
                                buildingId: buildingIndex,
                                floorId: "",
                                flatId: "",
                                commonAreaId: "",
                              });
                              setShowModalForItem("building");
                            }}
                            className="p-2  text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                        {formData.buildings.length >= 1 && (
                          <button
                            type="button"
                            onClick={() => removeBuilding(buildingIndex)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="ml-12">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Layers className="w-4 h-4" />
                          Floors:{" "}
                          <span className="font-semibold">
                            {building.floors.length}
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col justify-center items-center py-6">
                  <div className="p-2 bg-green-100 rounded-lg mb-6">
                    <Building className="w-10 h-10 text-green-600" />
                  </div>
                  <h1 className="text-gray-500">
                    Add Buildings to this project
                  </h1>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Floors */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-gradient-to-r from-purple-100 to-purple-50 px-6 py-2">
                <div className="w-10 h-10  rounded-full flex items-center justify-center border-4 border-white shadow-sm mr-3">
                  <DoorOpen className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Configure Floors
                </h3>
              </div>

              {formData.buildings.map((building, buildingIndex) => (
                <div key={buildingIndex} className="mb-8">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-800">
                      {building.building_name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({building.floors.length} floors)
                    </span>
                    {errors[`building_${buildingIndex}_floors`] && (
                      <span className="text-sm text-red-600 ml-auto">
                        {errors[`building_${buildingIndex}_floors`]}
                      </span>
                    )}
                  </div>

                  <div className="ml-6 grid grid-cols-3">
                    {building.floors.map((floor, floorIndex) => (
                      <div
                        key={floorIndex}
                        className="bg-white border border-gray-200 rounded-lg p-4 m-3"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Layers className="w-4 h-4 text-purple-600" />
                            </div>
                            <input
                              type="text"
                              value={floor.floor_name}
                              onChange={(e) =>
                                updateFloor(
                                  buildingIndex,
                                  floorIndex,
                                  "floor_name",
                                  e.target.value
                                )
                              }
                              disabled
                              className={`w-4 flex-1 bg-transparent border-b focus:outline-none focus:border-blue-500 px-1 py-1 ${
                                errors[
                                  `building_${buildingIndex}_floor_${floorIndex}_name`
                                ]
                                  ? "border-red-300"
                                  : "border-gray-300"
                              }`}
                              placeholder="Enter floor name"
                            />
                          </div>
                          {formData.buildings.length >= 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedItem({
                                  name: floor.floor_name,
                                  count:
                                    floorFlatCounts[
                                      `${buildingIndex}_${floorIndex}`
                                    ],
                                  buildingId: buildingIndex,
                                  floorId: floorIndex,
                                  flatId: "",
                                  commonAreaId: "",
                                });
                                setShowModalForItem("floor");
                              }}
                              className="p-2  text-green-600 hover:bg-green-50 rounded-lg transition"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              removeFloor(buildingIndex, floorIndex)
                            }
                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {errors[
                          `building_${buildingIndex}_floor_${floorIndex}_name`
                        ] && (
                          <p className="text-sm text-red-600 mt-1 ml-10">
                            {
                              errors[
                                `building_${buildingIndex}_floor_${floorIndex}_name`
                              ]
                            }
                          </p>
                        )}

                        <div className="ml-10 text-sm text-gray-600">
                          <div className="flex gap-4">
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
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addFloor(buildingIndex)}
                    className="ml-6 mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <div className="p-1 bg-blue-100 rounded">
                      <Plus className="w-4 h-4" />
                    </div>
                    Add Single Floor to {building.building_name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Units (Flats & Common Areas) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center bg-gradient-to-r from-amber-100 to-amber-50 py-2 px-6 ">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm mr-3">
                  <LayoutGrid className="w-5 h-5 text-amber-600 " />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Add Flat Or Common Area
                </h3>
              </div>

              {formData.buildings.map((building, buildingIndex) => (
                <div key={buildingIndex} className="mb-8">
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Building className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-800">
                      {building.building_name}
                    </span>
                  </div>

                  {building.floors.map((floor, floorIndex) => (
                    <div key={floorIndex} className="ml-6 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Layers className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {floor.floor_name}
                        </span>
                        {errors[
                          `building_${buildingIndex}_floor_${floorIndex}_units`
                        ] && (
                          <span className="text-sm text-red-600 ml-auto">
                            {
                              errors[
                                `building_${buildingIndex}_floor_${floorIndex}_units`
                              ]
                            }
                          </span>
                        )}
                      </div>

                      <div className="ml-6 grid grid-cols-2 gap-6">
                        {/* Flats Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              <DoorOpen className="w-4 h-4" />
                              Flats ({floor.flats.length})
                            </h5>
                            <div className="flex items-center gap-2">
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
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    ] || 0
                                  )
                                }
                                className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Add Flats
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  addFlat(buildingIndex, floorIndex)
                                }
                                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" /> Single
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            {floor.flats.map((flat, flatIndex) => (
                              <div
                                key={flatIndex}
                                className="bg-white rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex flex-1">
                                    <div className="bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 mr-1 w-fit p-1">
                                      <Home className="w-4 h-4   " />
                                    </div>
                                    <input
                                      type="text"
                                      value={flat.flat_name}
                                      disabled
                                      className={`w-full bg-transparent border-b focus:outline-none focus:border-blue-500 px-1 py-1 text-sm ${
                                        errors[
                                          `building_${buildingIndex}_floor_${floorIndex}_flat_${flatIndex}_name`
                                        ]
                                          ? "border-red-300"
                                          : "border-gray-300"
                                      }`}
                                      placeholder="Flat name/number"
                                    />
                                  </div>
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
                                      className="p-1  text-green-600 hover:bg-green-50 rounded-lg transition"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeFlat(
                                        buildingIndex,
                                        floorIndex,
                                        flatIndex
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                {errors[
                                  `building_${buildingIndex}_floor_${floorIndex}_flat_${flatIndex}_name`
                                ] && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {
                                      errors[
                                        `building_${buildingIndex}_floor_${floorIndex}_flat_${flatIndex}_name`
                                      ]
                                    }
                                  </p>
                                )}
                              </div>
                            ))}
                            {floor.flats.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-4 col-span-3">
                                No flats added yet
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Common Areas Section */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-medium text-gray-700 flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Common Areas ({floor.common_areas.length})
                            </h5>
                            <button
                              type="button"
                              onClick={() =>
                                addCommonArea(buildingIndex, floorIndex)
                              }
                              className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 transition flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Area
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            {floor.common_areas.map((commonArea, caIndex) => (
                              <div
                                key={caIndex}
                                className="bg-white rounded-lg p-3 border border-gray-200"
                              >
                                <div className="flex justify-between items-center mb-3">
                                  <div className="flex flex-1 ">
                                    <div className="bg-green-50 hover:bg-green-100 rounded-lg text-green-600 mr-1 w-fit p-1">
                                      <DoorOpen className="w-5 h-5   " />
                                    </div>
                                    <input
                                      type="text"
                                      value={commonArea.common_area_name}
                                      disabled
                                      className={`w-full bg-transparent border-b focus:outline-none focus:border-blue-500 px-1 py-1 text-sm ${
                                        errors[
                                          `building_${buildingIndex}_floor_${floorIndex}_common_${caIndex}_name`
                                        ]
                                          ? "border-red-300"
                                          : "border-gray-300"
                                      }`}
                                      placeholder="Common area name"
                                    />
                                  </div>
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
                                        setShowModalForItem("common_area");
                                      }}
                                      className="p-1  text-green-600 hover:bg-green-50 rounded-lg transition"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeCommonArea(
                                        buildingIndex,
                                        floorIndex,
                                        caIndex
                                      )
                                    }
                                    className="ml-2 p-1 text-gray-400 hover:text-red-600 rounded"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                {errors[
                                  `building_${buildingIndex}_floor_${floorIndex}_common_${caIndex}_name`
                                ] && (
                                  <p className="text-xs text-red-600 mt-1">
                                    {
                                      errors[
                                        `building_${buildingIndex}_floor_${floorIndex}_common_${caIndex}_name`
                                      ]
                                    }
                                  </p>
                                )}
                              </div>
                            ))}
                            {floor.common_areas.length === 0 && (
                              <p className="text-sm text-gray-400 text-center py-4 col-span-3">
                                No common areas added yet
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Quick Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-600">
                      {calculateSummary().totalFlats}
                    </div>
                    <p className="text-xs text-gray-600">Total Flats</p>
                  </div>
                  <div className="text-center bg-white rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-600">
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
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center px-6 py-2 bg-gradient-to-r from-emerald-100 to-emerald-50  ">
                <div className="w-10 h-10 rounded-full flex items-center justify-center  border-4 border-white shadow-sm mr-3">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Review Project
                </h3>
              </div>
              <div className="px-3">
                <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Structure Summary
                </h4>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
                      {calculateSummary().totalBuildings}{" "}
                      <Building className="w-5 h-5 ml-1" />
                    </div>
                    <p className="text-sm text-gray-600">Buildings</p>
                  </div>
                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 flex items-center justify-center">
                      {calculateSummary().totalFloors}{" "}
                      <Layers className="w-5 h-5 ml-1" />
                    </div>
                    <p className="text-sm text-gray-600">Floors</p>
                  </div>
                  <div className="text-center bg-amber-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-amber-600 flex items-center justify-center">
                      {calculateSummary().totalFlats}{" "}
                      <Home className="w-5 h-5 ml-1" />
                    </div>
                    <p className="text-sm text-gray-600">Flats</p>
                  </div>
                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
                      {calculateSummary().totalCommonAreas}{" "}
                      <DoorOpen className="w-5 h-5 ml-1" />
                    </div>
                    <p className="text-sm text-gray-600">Common Areas</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 mx-3">
                <div className="space-y-8">
                  {/* Project Overview */}
                  <div className="">
                    <h4 className="font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Project Overview
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Project Name</p>
                        <p className="font-medium text-gray-800">
                          {formData.name || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-medium text-gray-800">
                          {formData.location || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-medium text-gray-800">
                          {formData.start_date || "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-medium text-gray-800">
                          {formData.end_date || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Structure Summary */}
                  <div>
                    {/* Detailed Structure */}
                    {formData.buildings.map((building, buildingIndex) => (
                      <div
                        key={buildingIndex}
                        className="bg-white border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <Building className="w-5 h-5 text-gray-500" />
                          <div>
                            <h5 className="font-medium text-gray-800">
                              {building.building_name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {building.floors.length} floors
                            </p>
                          </div>
                        </div>

                        <div className="ml-8 space-y-3">
                          {building.floors.map((floor, floorIndex) => (
                            <div
                              key={floorIndex}
                              className="border-l-2 border-blue-200 pl-4 pt-2 pb-2"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Layers className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-700">
                                  {floor.floor_name}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({floor.flats.length} flats,{" "}
                                  {floor.common_areas.length} common areas)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {floor.flats.map((flat, flatIndex) => (
                                  <div
                                    key={flatIndex}
                                    className="px-3 py-1 bg-blue-50 rounded-lg text-sm border border-blue-100"
                                  >
                                    <span className="font-medium text-blue-700 flex ">
                                      {flat.flat_name}{" "}
                                      <Home className="w-5 h-5 ml-1" />
                                    </span>
                                  </div>
                                ))}
                                {floor.common_areas.map(
                                  (commonArea, caIndex) => (
                                    <div
                                      key={caIndex}
                                      className="px-3 py-1 bg-green-50 rounded-lg text-sm border border-green-100"
                                    >
                                      <span className="font-medium text-green-700 flex">
                                        {commonArea.common_area_name}{" "}
                                        <DoorOpen className="w-5 h-5 ml-1" />
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-between items-center">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium flex items-center gap-2 text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}
            </div>

            <div className="text-sm text-gray-600">
              <span className="font-medium">Step {currentStep}</span> of{" "}
              {steps.length}
            </div>

            <div>
              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center gap-2 shadow-sm"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-8 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition font-medium flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  Create Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showUpdateModalForItem && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className={`bg-white rounded-xl shadow-xl ${
              showUpdateModalForItem === "flat" ||
              showUpdateModalForItem === "common_area"
                ? "w-[400px]"
                : "w-full"
            }  max-w-xl my-8 border border-gray-200`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  {showUpdateModalForItem === "building" && (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                  {showUpdateModalForItem === "floor" && (
                    <Layers className="w-6 h-6 text-white" />
                  )}
                  {showUpdateModalForItem === "flat" && (
                    <Home className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Update {showUpdateModalForItem === "building" && "Building"}
                    {showUpdateModalForItem === "floor" && "Floor"}
                    {showUpdateModalForItem === "flat" && "Flat"}
                  </h2>
                  <p className="text-sm text-blue-100">
                    Update {showUpdateModalForItem === "building" && "Building"}
                    {showUpdateModalForItem === "floor" && "Floor"}
                    {showUpdateModalForItem === "flat" && "Flat"} Details
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModalForItem(null);
                }}
                className="text-white hover:bg-white/10 rounded-lg p-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-3">
              {showUpdateModalForItem === "building" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Building Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedItem.name}
                      onChange={(e) => {
                        setSelectedItem((prev: any) => ({
                          ...prev,
                          name: e.target.value,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Wing - A"
                    />
                  </div>
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Number of Floors <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={selectedItem.count}
                      onChange={(e) => {
                        setSelectedItem((prev: any) => ({
                          ...prev,
                          count: e.target.value,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter Number of Floors"
                    />
                  </div>
                </div>
              )}
              {showUpdateModalForItem === "floor" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Select Floor Name <span className="text-red-500">*</span>
                    </label>
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
                      className="w-full pl-6 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
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
                  </div>
                  {showInputFeild && (
                    <div>
                      <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <Layers className="w-4 h-4" />
                        Floor Name <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="text"
                        value={selectedItem.name}
                        onChange={(e) => {
                          setSelectedItem((prev: any) => ({
                            ...prev,
                            name: e.target.value,
                          }));
                        }}
                        className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.location ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Floor - 1"
                      />
                    </div>
                  )}
                  <div>
                    <label className=" text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Home className="w-4 h-4" />
                      Number of Flats <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={selectedItem.count}
                      onChange={(e) => {
                        setSelectedItem((prev: any) => ({
                          ...prev,
                          count: e.target.value,
                        }));
                      }}
                      className={`w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.location ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Enter Number of Flats"
                    />
                  </div>
                </div>
              )}
              {(showUpdateModalForItem === "flat" ||
                showUpdateModalForItem === "common_area") && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      {showUpdateModalForItem === "flat" ? (
                        <Home className="w-4 h-4" />
                      ) : (
                        <DoorOpen className="w-4 h-4" />
                      )}
                      {showUpdateModalForItem === "flat" && "Flat"}{" "}
                      {showUpdateModalForItem === "common_area" &&
                        "Select Common Area"}{" "}
                      Name <span className="text-red-500">*</span>
                    </label>
                    {showUpdateModalForItem === "common_area" && (
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
                        className="w-full pl-6 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white outline-none"
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
                    )}
                    {(showInputFeild || showUpdateModalForItem === "flat") && (
                      <div
                        className={`${
                          showUpdateModalForItem === "common_area" && "mt-3"
                        }`}
                      >
                        {showInputFeild &&
                          showUpdateModalForItem === "common_area" && (
                            <label
                              htmlFor=""
                              className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                            >
                              Enter Common Area Name
                            </label>
                          )}
                        <input
                          type="text"
                          value={selectedItem.name}
                          onChange={(e) => {
                            setSelectedItem((prev: any) => ({
                              ...prev,
                              name: e.target.value,
                            }));
                          }}
                          className={` w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                            errors.location
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="Gym"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-10 mt-6 gap-3">
                <button
                  onClick={() => {
                    if (showUpdateModalForItem === "building") {
                      console.log(selectedItem);
                      updateBuildingDetails(
                        selectedItem.buildingId,
                        selectedItem.name,
                        selectedItem.count
                      );
                    }
                    if (showUpdateModalForItem === "floor") {
                      console.log(selectedItem);
                      updateFloorDetails(
                        selectedItem.name,
                        selectedItem.count,
                        selectedItem.buildingId,
                        selectedItem.floorId
                      );
                    }
                    if (showUpdateModalForItem === "flat") {
                      console.log(selectedItem);
                      updateFlatDetails(
                        selectedItem.buildingId,
                        selectedItem.floorId,
                        selectedItem.flatId,
                        selectedItem.name
                      );
                    }
                    if (showUpdateModalForItem === "common_area") {
                      console.log(selectedItem);
                      updateCommonAreaDetails(
                        selectedItem.buildingId,
                        selectedItem.floorId,
                        selectedItem.commonAreaId,
                        selectedItem.name
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
                  }}
                  className="col-span-7 text-center px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <Save className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setShowModalForItem(null);
                  }}
                  className="col-span-3  px-8 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition font-medium flex items-center justify-center gap-2 shadow-sm"
                >
                  <X className="w-5 h-5" /> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
