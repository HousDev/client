// src/components/ConstructionProjectWizardForm.tsx
import { useState } from "react";
import {
  X,
  Building,
  Home,
  Layers,
  FileText,
  DoorOpen,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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

export default function ViewProject({
  setViewProjectDetails,
  projectDetails,
  setSelectedProject,
}: any) {
  const [formData, setFormData] = useState({
    name: projectDetails.name || "",
    location: projectDetails.location || "",
    start_date: projectDetails.start_date || "",
    end_date: projectDetails.end_date || "",
    status: projectDetails.status || "",
    buildings: projectDetails.buildings || [],
  });
  const [selectedBuilding, setSelectedBuilding] = useState<number | null>(null);

  // Calculate summary statistics
  const calculateSummary = () => {
    const totalBuildings = formData.buildings.length;
    const totalFloors = formData.buildings.reduce(
      (sum: any, building: any) => sum + building.floors.length,
      0
    );
    const totalFlats = formData.buildings.reduce(
      (sum: any, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: any, floor: any) => floorSum + floor.flats.length,
          0
        ),
      0
    );
    const totalCommonAreas = formData.buildings.reduce(
      (sum: any, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: any, floor: any) => floorSum + floor.common_areas.length,
          0
        ),
      0
    );

    return { totalBuildings, totalFloors, totalFlats, totalCommonAreas };
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
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
              <h2 className="text-xl font-bold text-white">View Project</h2>
              <p className="text-sm text-blue-100">View Project Details</p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedProject();
              setViewProjectDetails(false);
            }}
            className="text-white hover:bg-white/10 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 animate-fadeIn pt-3 min-h-[300px] max-h-[550px] overflow-y-scroll">
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
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 mx-3 ">
            <div className="space-y-8 ">
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
                  <div>
                    <p className="text-sm text-gray-600">Work Status</p>
                    <p
                      className={`font-medium text-gray-800 ${getStatusColor(
                        formData.status
                      )} w-fit px-6 py-1 mt-2 rounded-full`}
                    >
                      {(formData.status || "").replace("_", " ").toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structure Summary */}
              <div>
                {/* Detailed Structure */}
                {formData.buildings.map((building: any, buildingIndex: any) => (
                  <button
                    onClick={() => {
                      if (selectedBuilding === building.id) {
                        setSelectedBuilding(null);
                      } else {
                        setSelectedBuilding(building.id);
                      }
                    }}
                    key={buildingIndex}
                    className="w-full bg-white border border-gray-200 rounded-lg p-4 mb-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
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
                      <div className="flex">
                        <div>
                          <h1 className="text-sm font-medium">Work Status</h1>
                          <p
                            className={`font-medium text-xs text-gray-800 ${getStatusColor(
                              building.status
                            )} w-fit px-6 py-1  rounded-full`}
                          >
                            {(building.status || "")
                              .replace("_", " ")
                              .toUpperCase()}
                          </p>
                        </div>
                        {building.floors.length > 0 && (
                          <div className="flex justify-center items-center ml-5">
                            {selectedBuilding === building.id ? (
                              <ChevronUp />
                            ) : (
                              <ChevronDown />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedBuilding === building.id && (
                      <div className="ml-8 space-y-3">
                        {building.floors.map((floor: any, floorIndex: any) => (
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
                                {floor.common_areas.length} common areas){" "}
                                <span
                                  className={`ml-3 font-medium text-[12px] text-gray-800 w-fit px-6 py-1  rounded-full`}
                                >
                                  Work Status :
                                </span>
                                <span
                                  className={` font-medium text-[10px] text-gray-800 ${getStatusColor(
                                    floor.status
                                  )} w-fit px-6 py-1  rounded-full`}
                                >
                                  {(floor.status || "")
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {floor.flats.map((flat: any, flatIndex: any) => (
                                <div
                                  key={flatIndex}
                                  className="flex justify-center items-center flex-col px-3 py-2 bg-blue-50 rounded-lg text-sm border border-blue-100 "
                                >
                                  <p className="font-medium text-blue-700 flex ">
                                    {flat.flat_name}{" "}
                                    <Home className="w-5 h-5 ml-1" />
                                  </p>
                                  <p
                                    className={`border-t mt-2 border-slate-500 font-medium text-[12px] text-gray-800 w-fit px-6 py-1  `}
                                  >
                                    Work Status
                                  </p>
                                  <p
                                    className={` font-medium text-[10px] text-gray-800 ${getStatusColor(
                                      floor.status
                                    )} w-fit px-4 py-1  rounded-full`}
                                  >
                                    {(floor.status || "")
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </p>
                                </div>
                              ))}
                              {floor.common_areas.map(
                                (commonArea: any, caIndex: any) => (
                                  <div
                                    key={caIndex}
                                    className="flex justify-center items-center  flex-col px-3 py-1 bg-green-50 rounded-lg text-sm border border-green-100"
                                  >
                                    <p className="font-medium text-green-700 flex">
                                      {commonArea.common_area_name}{" "}
                                      <DoorOpen className="w-5 h-5 ml-1" />
                                    </p>
                                    <p
                                      className={`border-t mt-2 border-slate-500 font-medium text-[12px] text-gray-800 w-fit px-6 py-1  `}
                                    >
                                      Work Status
                                    </p>
                                    <p
                                      className={` font-medium text-[10px] text-gray-800 ${getStatusColor(
                                        floor.status
                                      )} w-fit px-4 py-1  rounded-full`}
                                    >
                                      {(floor.status || "")
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
