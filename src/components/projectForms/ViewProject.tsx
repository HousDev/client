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
    start_date: new Date(projectDetails.start_date).toLocaleDateString() || "",
    end_date: new Date(projectDetails.end_date).toLocaleDateString() || "",
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 overflow-y-auto">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl w-full max-w-4xl my-4 sm:my-6 md:my-8 border border-gray-200 max-h-[90vh] sm:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-lg sm:rounded-t-xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-white/10 rounded-md sm:rounded-lg">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white">
                View Project
              </h2>
              <p className="text-xs sm:text-sm text-blue-100">
                View Project Details
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedProject();
              setViewProjectDetails(false);
            }}
            className="text-white hover:bg-white/10 rounded-md sm:rounded-lg p-1.5 sm:p-2 transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="space-y-4 sm:space-y-6 animate-fadeIn pt-2 sm:pt-3 flex-1 overflow-y-auto">
          <div className="px-2 sm:px-3">
            <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
              <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Structure Summary
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
              <div className="text-center bg-blue-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600 flex items-center justify-center">
                  {calculateSummary().totalBuildings}{" "}
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Buildings</p>
              </div>
              <div className="text-center bg-purple-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-purple-600 flex items-center justify-center">
                  {calculateSummary().totalFloors}{" "}
                  <Layers className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Floors</p>
              </div>
              <div className="text-center bg-amber-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-amber-600 flex items-center justify-center">
                  {calculateSummary().totalFlats}{" "}
                  <Home className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Flats</p>
              </div>
              <div className="text-center bg-green-50 rounded-md sm:rounded-lg p-2 sm:p-3 md:p-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 flex items-center justify-center">
                  {calculateSummary().totalCommonAreas}{" "}
                  <DoorOpen className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 sm:ml-1" />
                </div>
                <p className="text-xs sm:text-sm text-gray-600">Common Areas</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-6 mx-2 sm:mx-3">
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* Project Overview */}
              <div className="">
                <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 pb-2 border-b border-gray-300 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Project Overview
                </h4>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Project Name
                    </p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {formData.name || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {formData.location || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Start Date
                    </p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {formData.start_date || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">End Date</p>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">
                      {formData.end_date || "Not set"}
                    </p>
                  </div>
                  <div className="xs:col-span-2">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Work Status
                    </p>
                    <p
                      className={`font-medium text-gray-800 ${getStatusColor(
                        formData.status
                      )} w-fit px-4 sm:px-6 py-1 mt-1 sm:mt-2 rounded-full text-xs sm:text-sm`}
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
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4"
                  >
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Building className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <div className="text-left">
                          <h5 className="font-medium text-gray-800 text-sm sm:text-base">
                            {building.building_name}
                          </h5>
                          <p className="text-xs sm:text-sm text-gray-500">
                            {building.floors.length} floors
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-row items-center justify-end gap-2 sm:gap-0">
                        <div className="">
                          <h1 className="text-xs sm:text-sm font-medium">
                            Work Status
                          </h1>
                          <p
                            className={`font-medium text-gray-800 ${getStatusColor(
                              building.status
                            )} w-fit px-3 sm:px-6 py-0.5 sm:py-1 rounded-full text-xs`}
                          >
                            {(building.status || "")
                              .replace("_", " ")
                              .toUpperCase()}
                          </p>
                        </div>
                        {building.floors.length > 0 && (
                          <div className="flex justify-center items-center ml-0 sm:ml-5">
                            {selectedBuilding === building.id ? (
                              <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                            ) : (
                              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedBuilding === building.id && (
                      <div className="ml-4 sm:ml-6 md:ml-8 space-y-2 sm:space-y-3">
                        {building.floors.map((floor: any, floorIndex: any) => (
                          <div
                            key={floorIndex}
                            className="border-l-2 border-blue-200 pl-2 sm:pl-3 md:pl-4 pt-1.5 sm:pt-2 pb-1.5 sm:pb-2"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                                <span className="font-medium text-gray-700 text-sm sm:text-base">
                                  {floor.floor_name}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-500 ml-5 sm:ml-0">
                                <span>
                                  ({floor.flats.length} flats,{" "}
                                  {floor.common_areas.length} common areas)
                                </span>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <span className="font-medium text-[11px] sm:text-xs text-gray-800">
                                    Work Status :
                                  </span>
                                  <span
                                    className={`font-medium text-gray-800 ${getStatusColor(
                                      floor.status
                                    )} w-fit px-3 sm:px-4 py-0.5 rounded-full text-[10px] sm:text-xs`}
                                  >
                                    {(floor.status || "")
                                      .replace("_", " ")
                                      .toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {floor.flats.map((flat: any, flatIndex: any) => (
                                <div
                                  key={flatIndex}
                                  className="flex justify-center items-center flex-col px-2 py-1.5 sm:px-3 sm:py-2 bg-blue-50 rounded-md sm:rounded-lg text-xs sm:text-sm border border-blue-100"
                                >
                                  <p className="font-medium text-blue-700 flex items-center">
                                    <span className="truncate max-w-[60px] sm:max-w-none">
                                      {flat.flat_name}
                                    </span>
                                    <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 flex-shrink-0" />
                                  </p>
                                  <p className="border-t mt-1 sm:mt-2 border-slate-500 font-medium text-[10px] sm:text-xs text-gray-800 px-3 sm:px-6 py-0.5">
                                    Work Status
                                  </p>
                                  <p
                                    className={`font-medium text-gray-800 ${getStatusColor(
                                      floor.status
                                    )} w-fit px-2 sm:px-4 py-0.5 rounded-full text-[10px] sm:text-xs`}
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
                                    className="flex justify-center items-center flex-col px-2 py-1 sm:px-3 sm:py-1 bg-green-50 rounded-md sm:rounded-lg text-xs sm:text-sm border border-green-100"
                                  >
                                    <p className="font-medium text-green-700 flex items-center">
                                      <span className="truncate max-w-[60px] sm:max-w-none">
                                        {commonArea.common_area_name}
                                      </span>
                                      <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5 sm:ml-1 flex-shrink-0" />
                                    </p>
                                    <p className="border-t mt-1 sm:mt-2 border-slate-500 font-medium text-[10px] sm:text-xs text-gray-800 px-3 sm:px-6 py-0.5">
                                      Work Status
                                    </p>
                                    <p
                                      className={`font-medium text-gray-800 ${getStatusColor(
                                        floor.status
                                      )} w-fit px-2 sm:px-4 py-0.5 rounded-full text-[10px] sm:text-xs`}
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
