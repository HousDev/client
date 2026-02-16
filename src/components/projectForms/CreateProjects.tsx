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
  ChevronDown,
  PlusCircle,
  RulerDimensionLine,
} from "lucide-react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import { excelToProjectFormData } from "../../utils/excelToProjectFormData";
import { BiArea, BiDownArrow, BiUpArrow } from "react-icons/bi";

interface ProjectWizardFormProps {
  setShowModel: any;
  loadAllData: any;
  allFloors: any;
  allFlats: any;
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
  areas: any[];
}

interface CommonArea {
  common_area_name: string;
  status?: string;
  workflow?: any[];
  area_size: any;
  unit: string;
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
  allFlats,
  allCommonArea,
}: ProjectWizardFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showInputFeild, setShowInputField] = useState(false);
  const [showUpdateModalForItem, setShowModalForItem] = useState<string | null>(
    null,
  );
  const [isAreaDropDownOpen, setIsAreaDropDownOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState<any>([]);

  const [showCommonAreaModal, setShowCommonAreaModal] = useState(false);

  const [updateAreaId, setUpdateAreaId] = useState<any>("");

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

  const [selectedArea, setSelectedArea] = useState<any>({
    id: "",
    name: "",
    area_type: "",
    area_size: "",
    buildingId: "",
    floorId: "",
    flatId: "",
    commonAreaId: "",
    unit: "sqft",
  });

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
      icon: <FileText className="w-4 h-4" />,
      description: "Basic project information",
    },
    {
      number: 2,
      title: "Buildings",
      icon: <Building2 className="w-4 h-4" />,
      description: "Add buildings to project",
    },
    {
      number: 3,
      title: "Floors",
      icon: <DoorOpen className="w-4 h-4" />,
      description: "Configure floors for each building",
    },
    {
      number: 4,
      title: "Units",
      icon: <LayoutGrid className="w-4 h-4" />,
      description: "Add flats and common areas",
    },
    {
      number: 5,
      title: "Review",
      icon: <Check className="w-4 h-4" />,
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
      setFormData(formData);
    } catch (err: any) {
      toast.error(err);
    }

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
      let hasError = false;
      let errMsg = "";
      const finalData = {
        ...formData,
        buildings: formData.buildings.map((building) => ({
          ...building,
          floors: building.floors.map((floor) => {
            if (floor.flats && floor.common_areas) {
              if (floor.flats.length === 0 && floor.common_areas.length === 0) {
                errMsg = "Add Flat or Common Area In Floor.";
                hasError = true;
                return;
              }
            } else {
              errMsg = "Add Flat or Common Area In Floor.";
              hasError = true;
              return;
            }
            return {
              ...floor,
              flats: floor.flats.map((flat) => {
                if (flat.areas) {
                  if (flat.areas.length === 0) {
                    errMsg = "Please Add Flat Areas.";
                    hasError = true;
                    return;
                  }
                } else {
                  errMsg = "Please Add Flat Areas.";
                  hasError = true;
                  return;
                }
                return {
                  ...flat,
                  status: flat.status || "pending",
                  areas: flat.areas || [],
                  workflow: flat.workflow || defaultWorkflow,
                };
              }),
              common_areas: floor.common_areas.map((commonArea) => ({
                ...commonArea,
                status: commonArea.status || "pending",
                workflow: commonArea.workflow || defaultWorkflow,
              })),
            };
          }),
        })),
      };
      if (hasError) {
        toast.error(errMsg);
        return;
      }
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

    setBuildingFloorCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[index];
      return newCounts;
    });
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
        workflow: defaultWorkflow,
        areas: [],
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
    ].floors.filter((_, i) => i !== floorIndex);
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
      workflow: defaultWorkflow,
      areas: [],
    };
    updatedBuildings[buildingIndex].floors[floorIndex].flats.push(newFlat);
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
    ].floors[floorIndex].flats.filter((_, i) => i !== flatIndex);
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const addCommonArea = () => {
    const updatedBuildings = [...formData.buildings];

    if (selectedAreas.length > 0) {
      updatedBuildings[selectedArea.buildingId].floors[
        selectedArea.floorId
      ].common_areas = [];
      selectedAreas.forEach((element: any) => {
        const newCommonArea: CommonArea = {
          common_area_name: element.name,
          status: "pending",
          workflow: defaultWorkflow,
          area_size:
            element.unit === "sqm"
              ? convertSqmToSqft(Number(element.area_size) ?? 0)
              : element.area_size,
          unit: "sqft",
        };

        updatedBuildings[selectedArea.buildingId].floors[
          selectedArea.floorId
        ].common_areas.push(newCommonArea);
      });
    }
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
        (_, i) => i !== caIndex,
      );
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const calculateSummary = () => {
    const totalBuildings = formData.buildings.length;
    const totalFloors = formData.buildings.reduce(
      (sum, building) => sum + building.floors.length,
      0,
    );
    const totalFlats = formData.buildings.reduce(
      (sum, building) =>
        sum +
        building.floors.reduce(
          (floorSum, floor) => floorSum + floor.flats.length,
          0,
        ),
      0,
    );
    const totalCommonAreas = formData.buildings.reduce(
      (sum, building) =>
        sum +
        building.floors.reduce(
          (floorSum, floor) => floorSum + floor.common_areas.length,
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
        workflow: defaultWorkflow,
        areas: [],
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
      area_size:
        selectedArea.unit === "sqft"
          ? selectedArea.area_size
          : convertSqmToSqft(Number(selectedArea.area_size)),
      unit: "sqft",
    };
    setFormData((prev) => ({ ...prev, buildings: updatedBuildings }));
  };

  const addAreas = (
    buildingIndex: number,
    floorIndex: number,
    areaIndex: number,
  ) => {
    console.log(selectedAreas);
    const buildings = structuredClone(formData.buildings); // 🔥 safest

    const floor = buildings[buildingIndex]?.floors[floorIndex];
    if (!floor) return;

    const flat = floor.flats?.[areaIndex];
    if (!flat) return;

    console.log("to single falt : ", selectedAreas);

    const data = selectedAreas.map((a: any) => ({
      ...a,
      unit: "sqft",
      area_size:
        a.unit === "sqft"
          ? a.area_size
          : convertSqmToSqft(Number(a.area_size) ?? 0),
    }));

    flat.areas = data;

    // Step 2️⃣ Single state update
    setFormData((prev) => ({
      ...prev,
      buildings,
    }));
    setSelectedAreas([]);
  };

  const addCommonAreaToAllFloors = () => {
    const buildings = structuredClone(formData.buildings);
    if (selectedAreas.length > 0) {
      selectedAreas.forEach((element: any) => {
        const newCommonArea = {
          common_area_name: element.name, // e.g. Lobby, Lift, Staircase
          area_size:
            element.unit === "sqft"
              ? element.area_size
              : convertSqmToSqft(Number(element.area_size)),
          unit: "sqft",
          status: "pending", // optional: keep empty if you decided NOT to break common area into areas
        };

        buildings.forEach((building) => {
          building.floors?.forEach((floor) => {
            const existingCommonAreas = floor.common_areas ?? [];

            const alreadyExists = existingCommonAreas.some(
              (ca) => ca.common_area_name === newCommonArea.common_area_name,
            );

            if (!alreadyExists) {
              floor.common_areas = [...existingCommonAreas, newCommonArea];
            }
          });
        });
      });
    }
    setFormData((prev) => ({
      ...prev,
      buildings,
    }));
  };

  const addAreaToAllFlats = () => {
    const buildings = structuredClone(formData.buildings);
    console.log("selected areas data : ", selectedAreas);
    const data = selectedAreas.map((a: any) => ({
      ...a,
      unit: "sqft",
      area_size:
        a.unit === "sqft"
          ? a.area_size
          : convertSqmToSqft(Number(a.area_size) ?? 0),
    }));
    buildings.forEach((building) => {
      building.floors?.forEach((floor) => {
        if (floor.flats[selectedArea.flatId]) {
          floor.flats[selectedArea.flatId].areas = data;
        }
      });
    });

    setFormData((prev) => ({
      ...prev,
      buildings,
    }));
  };

  const removeArea = (
    buildingIndex: number,
    floorIndex: number,
    areaIndex: number,
    areaItemIndex: number, // index of area inside areas[]
    area_type: string,
  ) => {
    console.log(buildingIndex, floorIndex, areaIndex, areaItemIndex, area_type);
    const buildings = structuredClone(formData.buildings);

    const floor = buildings[buildingIndex]?.floors[floorIndex];
    if (!floor) return;

    if (area_type === "flat") {
      const flat = floor.flats?.[areaIndex];
      if (!flat || !flat.areas) return;

      flat.areas = flat.areas.filter((_, i) => i !== areaItemIndex);
    }

    setFormData((prev) => ({
      ...prev,
      buildings,
    }));
  };

  const updateArea = () => {
    const buildings = structuredClone(formData.buildings);

    const floor =
      buildings[selectedArea.buildingId]?.floors[selectedArea.floorId];
    if (!floor) return;

    if (selectedArea.area_type === "flat") {
      const flat = floor.flats?.[selectedArea.flatId];
      if (!flat || !flat.areas?.[updateAreaId]) return;

      flat.areas[updateAreaId] = {
        ...flat.areas[updateAreaId],
        ...selectedArea,
        area_size:
          selectedArea.area_size !== undefined
            ? Number(selectedArea.area_size)
            : flat.areas[updateAreaId].area_size,
      };
    }

    setFormData((prev) => ({
      ...prev,
      buildings,
    }));
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  function convertSqmToSqft(value: number) {
    if (!value || isNaN(value)) return 0;
    return value * 10.7639;
  }

  return (
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
                New Construction Project
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Create new construction project
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModel(false)}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps - Compact */}
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
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                    <Home className="w-4 h-4 text-[#C62828]" />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Project Information
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleImportClick}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-all duration-200"
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
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </a>
                </div>
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
                        errors.start_date ? "border-red-300" : "border-gray-200"
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
                    Add Buildings
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
                  {formData.buildings.map((building, buildingIndex) => (
                    <div
                      key={buildingIndex}
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
                                  count: buildingFloorCounts[buildingIndex],
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
                  ))}
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
                  Configure Floors
                </h3>
              </div>

              {formData.buildings.map((building, buildingIndex) => (
                <div key={buildingIndex} className="mb-4">
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
                    {building.floors.map((floor, floorIndex) => (
                      <div
                        key={floorIndex}
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
                              onChange={(e) =>
                                updateFloor(
                                  buildingIndex,
                                  floorIndex,
                                  "floor_name",
                                  e.target.value,
                                )
                              }
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
                                      ],
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
                    ))}
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
              ))}
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
                  Add Flat Or Common Area
                </h3>
              </div>

              {formData.buildings.map((building, buildingIndex) => (
                <div key={buildingIndex} className="mb-4">
                  <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    <Building className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-800 text-sm">
                      {building.building_name}
                    </span>
                  </div>

                  {building.floors.map((floor, floorIndex) => (
                    <div key={floorIndex} className="ml-2 mb-3">
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
                        {((!floor.flats && !floor.common_areas) ||
                          (floor.flats.length === 0 &&
                            floor.common_areas.length === 0)) && (
                          <p className="text-xs text-red-600 pl-3">
                            Add Flat or Common Area.
                          </p>
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
                            {floor.flats.map((flat, flatIndex) => (
                              <div>
                                <div
                                  key={flatIndex}
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
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedAreas(flat.areas ?? []);
                                          setSelectedArea({
                                            id: "",
                                            name: "",
                                            area_type: "flat",
                                            area_size: "",
                                            buildingId: buildingIndex,
                                            floorId: floorIndex,
                                            flatId: flatIndex,
                                            commonAreaId: "",
                                            unit: "sqft",
                                          });
                                          setShowModalForItem("flatArea");
                                        }}
                                        className="p-0.5 text-blue-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                                      >
                                        <PlusCircle className="w-3 h-3" />
                                      </button>
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
                                  {flat.areas && (
                                    <div>
                                      {flat.areas.map(
                                        (a: any, areaItemIndexr: number) => (
                                          <div
                                            key={areaItemIndexr}
                                            className="flex justify-between py-2 px-3 m-1 border border-slate-400 rounded-lg"
                                          >
                                            <div>
                                              <h1 className="text-xs">
                                                {a.name}
                                              </h1>
                                              <h5 className="text-xs text-slate-600">
                                                {a.area_size + " "}
                                                {a.unit}
                                              </h5>
                                            </div>
                                            <div className="space-x-2 flex items-center">
                                              <button
                                                onClick={() => {
                                                  console.log("object");
                                                  removeArea(
                                                    buildingIndex,
                                                    floorIndex,
                                                    flatIndex,
                                                    areaItemIndexr,
                                                    a.area_type,
                                                  );
                                                }}
                                                className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                              >
                                                <X className="w-3 h-3" />
                                              </button>
                                            </div>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                  {(!flat.areas || flat.areas.length === 0) && (
                                    <div className="flex justify-between text-xs py-2 px-3 m-1 border border-slate-400 rounded-lg">
                                      No Flat Area Added.
                                    </div>
                                  )}
                                </div>
                                {(!flat.areas || flat.areas.length === 0) && (
                                  <p className="text-red-600 text-xs pl-3">
                                    Add Flat Areas
                                  </p>
                                )}
                              </div>
                            ))}
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
                              onClick={() => {
                                setShowCommonAreaModal(true);
                                setSelectedAreas(
                                  floor.common_areas.map((d: any) => ({
                                    ...d,
                                    name: d.common_area_name,
                                    area_size: d.area_size,
                                    unit: d.unit,
                                  })),
                                );
                                setSelectedArea((prev: any) => ({
                                  ...prev,
                                  buildingId: buildingIndex,
                                  floorId: floorIndex,
                                  unit: "sqft",
                                }));
                                // addCommonArea(buildingIndex, floorIndex);
                              }}
                              className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Add Area
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            {floor.common_areas.map((commonArea, caIndex) => (
                              <div
                                key={caIndex}
                                className="bg-white rounded p-1.5 border border-gray-200"
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-1 flex-col">
                                    <div className="flex">
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
                                    <h1 className="text-xs py-1 px-2 text-slate-600">
                                      {commonArea.area_size ?? 0}{" "}
                                      {commonArea.unit}
                                    </h1>
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

                                          setSelectedArea((prev: any) => ({
                                            ...prev,
                                            area_size: commonArea.area_size,
                                            unit:
                                              commonArea.unit ||
                                              selectedArea.unit,
                                          }));

                                          setShowModalForItem("common_area");
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
                            ))}
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
              ))}

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
                  Review Project
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
                    {formData.buildings.map((building, buildingIndex) => (
                      <div
                        key={buildingIndex}
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
                          {building.floors.map((floor, floorIndex) => (
                            <div
                              key={floorIndex}
                              className="border-l-2 border-blue-200 pl-2 py-1"
                            >
                              <div className="flex items-center gap-1 mb-0.5">
                                <Layers className="w-3 h-3 text-gray-400" />
                                <span className="font-medium text-gray-700 text-xs">
                                  {floor.floor_name}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">
                                  ({floor.flats.length} flats,{" "}
                                  {floor.common_areas.length} common areas)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 ml-4">
                                {floor.flats.map((flat, flatIndex) => (
                                  <div
                                    key={flatIndex}
                                    className="px-1.5 py-0.5 bg-blue-50 rounded text-xs border border-blue-100"
                                  >
                                    <span className="font-medium text-blue-700 flex items-center">
                                      {flat.flat_name}{" "}
                                      <Home className="w-2 h-2 ml-0.5" />
                                    </span>
                                  </div>
                                ))}
                                {floor.common_areas.map(
                                  (commonArea, caIndex) => (
                                    <div
                                      key={caIndex}
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
                  className="px-4 py-2 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center gap-2 shadow-sm text-sm"
                >
                  <Check className="w-3 h-3" />
                  Create Project
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                  {showUpdateModalForItem === "flatArea" && (
                    <BiArea className="w-5 h-5 text-white" />
                  )}
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
                    {showUpdateModalForItem === "flatArea" ? "Add" : "Update"}{" "}
                    {showUpdateModalForItem === "building" && "Building"}
                    {showUpdateModalForItem === "floor" && "Floor"}
                    {showUpdateModalForItem === "flat" && "Flat"}
                    {showUpdateModalForItem === "common_area" && "Common Area"}
                    {showUpdateModalForItem === "flatArea" && "Flat Area"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Update details
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedAreas([]);
                  setShowModalForItem(null);
                  updateAreaId("");
                }}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4">
              {showUpdateModalForItem === "flatArea" && (
                <div className="min-h-20 max-h-96 overflow-y-scroll">
                  <div className="space-y-1.5 sticky top-0 z-30 bg-white py-3 w-full z-50">
                    <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <BiArea className="w-3 h-3 text-[#C62828]" />
                      Select Flat Areas <span className="text-red-500">*</span>
                    </label>
                    <button
                      onClick={() => setIsAreaDropDownOpen(!isAreaDropDownOpen)}
                      className="text-sm flex w-full justify-between border border-slate-300 rounded-lg items-center px-3 py-2"
                    >
                      <h1 className="text-slate-600">Select Flat Areas</h1>
                      <div>
                        {isAreaDropDownOpen ? (
                          <BiUpArrow className="w-4 h-4" />
                        ) : (
                          <BiDownArrow className="w-4 h-4" />
                        )}
                      </div>
                    </button>
                    <div className="relative group z-50">
                      {isAreaDropDownOpen && (
                        <div className="z-50 bg-slate-100 rounded-lg w-full px-3 py-2 h-30 overflow-y-scroll">
                          {allFlats.map((d: any, indx: number) => {
                            return (
                              <div>
                                <input
                                  type="checkbox"
                                  checked={selectedAreas.some(
                                    (a: any) => a.id === d.id,
                                  )}
                                  className="w-4 h-4"
                                  key={indx}
                                  onChange={(e) => {
                                    console.log(selectedAreas);
                                    if (e.target.checked) {
                                      setSelectedAreas([
                                        ...selectedAreas,
                                        {
                                          id: d.id,
                                          name: d.name,
                                          area_size: "",
                                          unit: "sqft",
                                          area_type: "flat",
                                        },
                                      ]);
                                    } else {
                                      const data = selectedAreas.filter(
                                        (fit: any) => fit.id !== d.id,
                                      );

                                      setSelectedAreas(data);
                                    }
                                  }}
                                />{" "}
                                <span>{d.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="">
                    {selectedAreas.map((d: any, indx: number) => (
                      <div key={indx} className="grid grid-cols-2 mb-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            Area Name <span className="text-red-500">*</span>
                          </label>
                          <h1>{d.name}</h1>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            <RulerDimensionLine className="w-3 h-3 text-[#C62828]" />
                            Area Size <span className="text-red-500">*</span>
                          </label>
                          <div className="relative group flex border-2 border-gray-200 rounded-xl ">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                              <RulerDimensionLine className="w-3 h-3" />
                            </div>
                            <input
                              type="text"
                              value={d.area_size}
                              onChange={(e) => {
                                if (
                                  !/^\d*\.?\d*$/.test(e.target.value) ||
                                  Number(e.target.value) < 0
                                )
                                  return;
                                setSelectedAreas((prev: any) =>
                                  prev.map((sa: any) => {
                                    return sa.id === d.id
                                      ? { ...sa, area_size: e.target.value }
                                      : sa;
                                  }),
                                );
                              }}
                              className={`rounded-l-xl w-full pl-9 pr-4 py-2.5 text-sm   outline-none`}
                              placeholder="Size"
                            />
                            <select
                              value={d.unit}
                              onChange={(e) => {
                                setSelectedAreas((prev: any) =>
                                  prev.map((sa: any) => {
                                    return sa.id === d.id
                                      ? { ...sa, unit: e.target.value }
                                      : sa;
                                  }),
                                );
                              }}
                              className="rounded-r-xl w-full px-3 py-2.5 text-sm  focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none"
                              required
                            >
                              {["sqft", "sqm"].map((ca: any) => (
                                <option key={ca} value={ca}>
                                  {ca}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        "Select Common Area"}
                      Name <span className="text-red-500">*</span>
                    </label>
                    {showUpdateModalForItem === "common_area" && (
                      <div>
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
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                            <RulerDimensionLine className="w-3 h-3 text-[#C62828]" />
                            Area Size <span className="text-red-500">*</span>
                          </label>
                          <div className="relative group flex border-2 border-gray-200 rounded-xl ">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                              <RulerDimensionLine className="w-3 h-3" />
                            </div>
                            <input
                              type="text"
                              value={selectedArea.area_size}
                              onChange={(e) => {
                                if (
                                  !/^\d*\.?\d*$/.test(e.target.value) ||
                                  Number(e.target.value) < 0
                                )
                                  return;
                                setSelectedArea((prev: any) => ({
                                  ...prev,
                                  area_size: e.target.value,
                                }));
                              }}
                              className={`rounded-l-xl w-full pl-9 pr-4 py-2.5 text-sm   outline-none`}
                              placeholder="Size"
                            />
                            <select
                              value={selectedArea.unit}
                              onChange={(e) => {
                                setSelectedArea((prev: any) => ({
                                  ...prev,
                                  unit: e.target.value,
                                }));
                              }}
                              className="rounded-r-xl w-full px-3 py-2.5 text-sm  focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none"
                              required
                            >
                              {["sqft", "sqm"].map((ca: any) => (
                                <option key={ca} value={ca}>
                                  {ca}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <ChevronDown className="w-3 h-3 text-gray-400" />
                            </div>
                          </div>
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
              <div className="flex gap-3 mt-6 -z-50">
                <button
                  onClick={() => {
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

                    if (showUpdateModalForItem === "flatArea") {
                      console.log(updateAreaId);
                      if (updateAreaId || updateAreaId === 0) {
                        console.log("object this is confirmation");
                        updateArea();
                      } else {
                        addAreas(
                          selectedArea.buildingId,
                          selectedArea.floorId,
                          selectedArea.area_type === "flat"
                            ? selectedArea.flatId
                            : selectedArea.commonAreaId,
                        );
                      }
                    }
                    setUpdateAreaId("");
                    setSelectedArea({
                      id: "",
                      name: "",
                      area_type: "",
                      area_size: "",
                      buildingId: "",
                      floorId: "",
                      flatId: "",
                      commonAreaId: "",
                      unit: "sqft",
                    });

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
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Save
                </button>

                {showUpdateModalForItem === "flatArea" && (
                  <button
                    onClick={() => {
                      console.log("this is add all flat");
                      addAreaToAllFlats();
                      setSelectedArea({
                        id: "",
                        name: "",
                        area_type: "",
                        area_size: "",
                        buildingId: "",
                        floorId: "",
                        flatId: "",
                        commonAreaId: "",
                        unit: "sqft",
                      });
                      setShowModalForItem(null);
                    }}
                    className={`${updateAreaId === "" ? "" : "hidden"} flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0`}
                  >
                    Add to All Flat
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAreas([]);
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

      {showCommonAreaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div
            className={`bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-[450px] my-4 border border-gray-200`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center rounded-t-2xl border-b border-gray-700/30">
              <div className="flex items-center text-white ">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <DoorOpen className="w-5 h-5 text-white" />
                </div>
                <h1 className="ml-3">Add Common Area</h1>
              </div>
              <button
                onClick={() => {
                  setSelectedAreas([]);
                  setShowCommonAreaModal(false);
                }}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="min-h-20 max-h-96 overflow-y-scroll px-3">
              <div className="space-y-1.5 sticky top-0  bg-white py-3 w-full z-50">
                <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <BiArea className="w-3 h-3 text-[#C62828]" />
                  Select Common Areas <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={() => setIsAreaDropDownOpen(!isAreaDropDownOpen)}
                  className="text-sm flex w-full justify-between border border-slate-300 rounded-lg items-center px-3 py-2"
                >
                  <h1 className="text-slate-600">Select Common Areas</h1>
                  <div>
                    {isAreaDropDownOpen ? (
                      <BiUpArrow className="w-4 h-4" />
                    ) : (
                      <BiDownArrow className="w-4 h-4" />
                    )}
                  </div>
                </button>
                <div className="relative group z-50">
                  {isAreaDropDownOpen && (
                    <div className="z-50 bg-slate-100 rounded-lg w-full px-3 py-2 h-30 overflow-y-scroll">
                      {allCommonArea.map((d: any, indx: number) => {
                        console.log(allCommonArea, selectedAreas);
                        return (
                          <div>
                            <input
                              type="checkbox"
                              checked={selectedAreas.some(
                                (a: any) => a.name === d.name,
                              )}
                              className="w-4 h-4"
                              key={indx}
                              onChange={(e) => {
                                console.log(selectedAreas);
                                if (e.target.checked) {
                                  setSelectedAreas([
                                    ...selectedAreas,
                                    {
                                      id: d.id,
                                      name: d.name,
                                      area_size: "",
                                      unit: "sqft",
                                      area_type: "commonArea",
                                    },
                                  ]);
                                } else {
                                  const data = selectedAreas.filter(
                                    (fit: any) => fit.name !== d.name,
                                  );

                                  setSelectedAreas(data);
                                }
                              }}
                            />{" "}
                            <span>{d.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="">
                {selectedAreas.map((d: any, indx: number) => (
                  <div key={indx} className="grid grid-cols-2 mb-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        Area Name <span className="text-red-500">*</span>
                      </label>
                      <h1>{d.name}</h1>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <RulerDimensionLine className="w-3 h-3 text-[#C62828]" />
                        Area Size <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group flex border-2 border-gray-200 rounded-xl ">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                          <RulerDimensionLine className="w-3 h-3" />
                        </div>
                        <input
                          type="text"
                          value={d.area_size}
                          onChange={(e) => {
                            if (
                              !/^\d*\.?\d*$/.test(e.target.value) ||
                              Number(e.target.value) < 0
                            )
                              return;
                            setSelectedAreas((prev: any) =>
                              prev.map((sa: any) => {
                                return sa.name === d.name
                                  ? { ...sa, area_size: e.target.value }
                                  : sa;
                              }),
                            );
                          }}
                          className={`rounded-l-xl w-full pl-9 pr-4 py-2.5 text-sm   outline-none`}
                          placeholder="Size"
                        />
                        <select
                          value={d.unit}
                          onChange={(e) => {
                            setSelectedAreas((prev: any) =>
                              prev.map((sa: any) => {
                                return sa.name === d.name
                                  ? { ...sa, unit: e.target.value }
                                  : sa;
                              }),
                            );
                          }}
                          className="rounded-r-xl w-full px-3 py-2.5 text-sm  focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none"
                          required
                        >
                          {["sqft", "sqm"].map((ca: any) => (
                            <option key={ca} value={ca}>
                              {ca}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 py-3 px-3">
              <button
                onClick={() => {
                  addCommonArea();
                  setSelectedItem({
                    name: "",
                    count: "",
                    buildingId: "",
                    floorId: "",
                    flatId: "",
                    commonAreaId: "",
                  });
                  setSelectedArea({
                    id: "",
                    name: "",
                    area_type: "",
                    area_size: "",
                    buildingId: "",
                    floorId: "",
                    flatId: "",
                    commonAreaId: "",
                    unit: "sqft",
                  });
                  setShowCommonAreaModal(false);
                }}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Save
              </button>
              <button
                onClick={() => {
                  addCommonAreaToAllFloors();
                  setSelectedItem({
                    name: "",
                    count: "",
                    buildingId: "",
                    floorId: "",
                    flatId: "",
                    commonAreaId: "",
                  });
                  setSelectedArea({
                    id: "",
                    name: "",
                    area_type: "",
                    area_size: "",
                    buildingId: "",
                    floorId: "",
                    flatId: "",
                    commonAreaId: "",
                    unit: "sqft",
                  });
                  setShowCommonAreaModal(false);
                }}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Add to All Floor
              </button>
              <button
                onClick={() => {
                  setSelectedAreas([]);
                  setShowCommonAreaModal(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
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
    </div>
  );
}
