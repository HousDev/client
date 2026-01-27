/* eslint-disable @typescript-eslint/no-explicit-any */
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
  console.log("this is project details", projectDetails);
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
      0,
    );
    const totalFlats = formData.buildings.reduce(
      (sum: any, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: any, floor: any) => floorSum + floor.flats.length,
          0,
        ),
      0,
    );
    const totalCommonAreas = formData.buildings.reduce(
      (sum: any, building: any) =>
        sum +
        building.floors.reduce(
          (floorSum: any, floor: any) => floorSum + floor.common_areas.length,
          0,
        ),
      0,
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

  const summary = calculateSummary();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-2 border border-gray-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 py-3 flex justify-between items-center border-b border-gray-700/30 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                View Project Details
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                {formData.name || "Project Overview"}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedProject();
              setViewProjectDetails(false);
            }}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-base font-bold text-blue-700 flex items-center justify-center gap-1">
                {summary.totalBuildings}
                <Building className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                Buildings
              </p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-base font-bold text-purple-700 flex items-center justify-center gap-1">
                {summary.totalFloors}
                <Layers className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                Floors
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-base font-bold text-amber-700 flex items-center justify-center gap-1">
                {summary.totalFlats}
                <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                Flats
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-sm sm:text-base font-bold text-green-700 flex items-center justify-center gap-1">
                {summary.totalCommonAreas}
                <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5">
                Common Areas
              </p>
            </div>
          </div>

          {/* Project Overview */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <h4 className="font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-gray-600" />
              Project Overview
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Project Name</p>
                <p className="font-medium text-gray-800 truncate">
                  {formData.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium text-gray-800 truncate">
                  {formData.location || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Start Date</p>
                <p className="font-medium text-gray-800">
                  {formData.start_date || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500">End Date</p>
                <p className="font-medium text-gray-800">
                  {formData.end_date || "—"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${getStatusColor(formData.status)}`}
                >
                  {(formData.status || "").replace("_", " ").toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Building Structure */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-gray-600" />
              Building Structure
            </h4>
            {formData.buildings.length === 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm border border-gray-200 rounded-lg">
                No buildings added yet
              </div>
            ) : (
              formData.buildings.map((building: any, buildingIndex: any) => (
                <div
                  key={buildingIndex}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => {
                      if (selectedBuilding === building.id) {
                        setSelectedBuilding(null);
                      } else {
                        setSelectedBuilding(building.id);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 px-3 py-2 flex justify-between items-center transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 rounded">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <h5 className="font-medium text-gray-800 text-sm">
                          {building.building_name}
                        </h5>
                        <p className="text-xs text-gray-500">
                          {building.floors.length} floor
                          {building.floors.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(building.status)}`}
                      >
                        {(building.status || "")
                          .replace("_", " ")
                          .toUpperCase()}
                      </span>
                      {building.floors.length > 0 && (
                        <div className="text-gray-400">
                          {selectedBuilding === building.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>

                  {selectedBuilding === building.id &&
                    building.floors.length > 0 && (
                      <div className="border-t border-gray-200 bg-gray-50/50 p-2 space-y-2">
                        {building.floors.map((floor: any, floorIndex: any) => (
                          <div
                            key={floorIndex}
                            className="bg-white border border-gray-200 rounded-md p-2"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-3.5 h-3.5 text-gray-500" />
                                <span className="font-medium text-gray-800 text-sm">
                                  {floor.floor_name}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(floor.status)}`}
                              >
                                {(floor.status || "")
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {/* Flats */}
                              {floor.flats.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <Home className="w-3 h-3 text-blue-500" />
                                    <span>Flats ({floor.flats.length})</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {floor.flats.map(
                                      (flat: any, flatIndex: any) => (
                                        <div
                                          key={flatIndex}
                                          className="px-2 py-1 bg-blue-50 border border-blue-100 rounded text-xs font-medium text-blue-700"
                                        >
                                          <p>{flat.flat_name}</p>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Common Areas */}
                              {floor.common_areas.length > 0 && (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <DoorOpen className="w-3 h-3 text-green-500" />
                                    <span>
                                      Common Areas ({floor.common_areas.length})
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {floor.common_areas
                                      .slice(0, 3)
                                      .map((commonArea: any, caIndex: any) => (
                                        <div
                                          key={caIndex}
                                          className="px-2 py-1 bg-green-50 border border-green-100 rounded text-xs font-medium text-green-700"
                                        >
                                          {commonArea.common_area_name}
                                        </div>
                                      ))}
                                    {floor.common_areas.length > 3 && (
                                      <div className="px-2 py-1 bg-green-100 border border-green-200 rounded text-xs font-medium text-green-800">
                                        +{floor.common_areas.length - 3} more
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
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
