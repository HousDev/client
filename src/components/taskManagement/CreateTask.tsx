/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PurchaseOrdersPro.tsx
import { SetStateAction, useEffect, useState } from "react";
import {
  X,
  Package,
  FileText,
  Info,
  Building2,
  Calendar,
  CreditCard,
  Tag,
  Truck,
  User,
  Home,
  AreaChartIcon,
  Layers2,
  AreaChart,
  DoorOpen,
  Workflow,
  University,
  WorkflowIcon,
} from "lucide-react";
import projectApi from "../../lib/projectApi";
import { toast } from "sonner";
import { Layer } from "recharts";
import { BiTask } from "react-icons/bi";
import SearchableSelect from "../SearchableSelect";
import { UsersApi } from "../../lib/Api";
import AreaSubTasksApi from "../../lib/subTaskApi";

/* ------------------ Main component ------------------ */
interface CreateTaskPropTypes {
  projectId: number;
  setShowCreateTaskModal: React.Dispatch<SetStateAction<boolean>>;
  laodData: () => void;
}

interface FormDataType {
  area_id: number | string;
  buildingId: number | string;
  floorId: number | string;
  flatId: number | string;
  commonAreaId: number | string;
  engineer_id: number | string;
  task_id: number | string;
  name: string;
  unit: string;
  total_work: string;
  work_done: string;
  start_date: string;
  end_date: string;
}

export default function CreateTask({
  projectId,
  setShowCreateTaskModal,
  laodData,
}: CreateTaskPropTypes) {
  const [formData, setFormData] = useState<FormDataType>({
    area_id: "",
    buildingId: "",
    floorId: "",
    flatId: "",
    commonAreaId: "",
    engineer_id: "",
    task_id: "",
    name: "",
    unit: "sqft",
    total_work: "",
    work_done: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  const [buildings, setBuildings] = useState<any>([]);
  const [floors, setFloors] = useState<any>([]);
  const [flats, setFlats] = useState<any>([]);
  const [commonAreas, setCommonAreas] = useState<any>([]);
  const [areas, setAreas] = useState<any>([]);
  const [engineers, setEngineers] = useState<any>([]);
  const [works, setWorks] = useState<any>([]);

  const loadProjectDetails = async () => {
    try {
      const projectRes: any = await projectApi.getProjectById(projectId);
      console.log("data", projectRes);

      const projectData = projectRes.data;
      setBuildings(projectData?.buildings ?? []);
      setFloors(projectData?.buildings.floors ?? []);
      setFlats(projectData?.buildings?.floors?.flats ?? []);
      setCommonAreas(projectData?.buildings?.floors?.common_areas ?? []);
      setAreas(projectData?.buildings?.floors?.flats?.areas ?? []);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong while fetching project details.");
    }
  };

  const loadUsers = async () => {
    try {
      const data = await UsersApi.list();
      const filteredData = data.filter(
        (f: any) => f.role === "engineer" || f.role === "Engineer",
      );
      console.log("Engineers", filteredData);
      setEngineers(filteredData);
    } catch (error) {
      toast.error("Something went wrong while fetching engineers.");
    }
  };

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        project_id: projectId,
        building_id: formData.buildingId,
        floor_id: formData.floorId,
        flat_id: formData.flatId,
        common_area_id: formData.commonAreaId,
        area_id: formData.area_id ?? formData.commonAreaId,
        engineer_id: formData.engineer_id,
        name: formData.name,
        unit: formData.unit,
        total_work: formData.total_work,
        start_date: formData.start_date,
        end_date: formData.end_date,
      };
      console.log("Submit form", payload);
      const response: any = await AreaSubTasksApi.createSubTask(payload);
      console.log("task created : ", response);
      if (response.success) {
        laodData();
        setShowCreateTaskModal(false);
      }
    } catch (error) {
      toast.error("Something went wrong while creating task.");
    }
  };

  useEffect(() => {
    loadUsers();
    loadProjectDetails();
  }, []);

  return (
    <div className="p-6">
      {/* Create Modal (with SearchableSelects) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
  px-6 py-4 flex justify-between items-center
  rounded-t-2xl border-b border-white/10
  backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Create Task
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Create task for project
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCreateTaskModal(false);
              }}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={createTask}
            className="p-4 md:p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar"
          >
            {/* Header Section */}

            {/* Basic Details - 3 Column Grid (UNCHANGED STRUCTURE) */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Vendor Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3 h-3 text-blue-600" />
                    <span>Building</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={buildings.map((b: any) => ({
                        id: b.id,
                        name: b.building_name || "",
                      }))}
                      value={formData.buildingId}
                      onChange={(id) => {
                        setFormData({ ...formData, buildingId: id });
                        const data = buildings
                          .find((b: any) => b.id === id)
                          .floors.filter((d: any) => d.building_id === id);

                        setFloors(data);
                      }}
                      placeholder="Select Building"
                      required
                    />
                  </div>
                </div>

                {/* Project Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Layers2 className="w-3 h-3 text-green-600" />
                    <span>Floor</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-600 transition-colors">
                      <Layers2 className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={floors.map((floor: any) => ({
                        id: floor.id,
                        name: floor.floor_name,
                      }))}
                      value={formData.floorId}
                      onChange={(id) => {
                        setFormData({ ...formData, floorId: id });
                        const data = floors
                          .find((f: any) => f.id === id)
                          .flats.filter((flat: any) => flat.floor_id === id);
                        console.log(data);
                        const commonAreaData = floors
                          .find((f: any) => f.id === id)
                          .common_areas.filter(
                            (flat: any) => flat.floor_id === id,
                          );
                        console.log(commonAreaData);

                        setCommonAreas(commonAreaData);
                        setFlats(data);
                      }}
                      placeholder="Select Floor"
                      required
                      disabled={String(formData.buildingId).length === 0}
                    />
                  </div>
                </div>

                {/* PO Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Home className="w-3 h-3 text-purple-600" />
                    <span>Flat</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={flats.map((flat: any) => ({
                        id: flat.id,
                        name: flat.flat_name,
                      }))}
                      value={formData.flatId}
                      onChange={(id) => {
                        setFormData({ ...formData, flatId: id });
                        const data = flats
                          .find((f: any) => f.id === id)
                          .areas.filter((area: any) => area.area_id === id);
                        console.log("area", data);
                        setAreas(data);
                      }}
                      placeholder={"Select Flat"}
                      required
                      disabled={
                        String(formData.floorId).length === 0 ||
                        String(formData.commonAreaId).length !== 0
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <DoorOpen className="w-3 h-3 text-purple-600" />
                    <span>Common Area</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <DoorOpen className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={commonAreas.map((area: any) => ({
                        id: area.id,
                        name: area.common_area_name,
                      }))}
                      value={formData.commonAreaId}
                      onChange={(id) => {
                        const data = commonAreas.find(
                          (ca: any) => ca.id === id,
                        );
                        console.log("this is data", data);
                        setFormData({
                          ...formData,
                          commonAreaId: id,
                          total_work: data.common_area_size,
                          unit: data.common_area_size_unit,
                        });
                        setWorks(
                          Array.isArray(data.workflow)
                            ? data.workflow.filter(
                                (caw: any) => caw.status === "pending",
                              )
                            : [],
                        );
                      }}
                      placeholder={"Selected Common Areas"}
                      required
                      disabled={
                        String(formData.flatId).length !== 0 ||
                        String(formData.floorId).length === 0
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <AreaChart className="w-3 h-3 text-purple-600" />
                    <span>Flat Area</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <AreaChart className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={areas.map((a: any) => ({
                        id: a.id,
                        name: a.name,
                      }))}
                      value={formData.area_id}
                      onChange={(id) => {
                        const data = areas.find((a: any) => a.id === id);
                        console.log(data);
                        setFormData({
                          ...formData,
                          area_id: id,
                          total_work: data.area_size,
                          unit: data.unit,
                        });
                        console.log(data);
                        setWorks(
                          Array.isArray(data.area_workflow)
                            ? data.area_workflow.filter(
                                (aw: any) => aw.status === "pending",
                              )
                            : [],
                        );
                      }}
                      placeholder={"Select Flat Area"}
                      required
                      disabled={
                        String(formData.commonAreaId).length !== 0 ||
                        String(formData.flatId).length === 0
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <BiTask className="w-3 h-3 text-purple-600" />
                    <span>Task</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <BiTask className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={works.map((w: any) => ({
                        id: w.id,
                        name: w.name,
                      }))}
                      value={formData.task_id}
                      onChange={(id) => {
                        const data = works.find((w: any) => w.id === id);
                        setFormData({
                          ...formData,
                          name: data.name,
                          task_id: id,
                        });
                      }}
                      placeholder={"Select Task"}
                      required
                      disabled={
                        String(formData.area_id).length === 0 &&
                        String(formData.commonAreaId).length === 0
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Workflow className="w-3 h-3 text-amber-600" />
                    <span>Total Work</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                      <Workflow className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.total_work}
                      onChange={(e) =>
                        setFormData({ ...formData, total_work: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <WorkflowIcon className="w-3 h-3 text-amber-600" />
                    <span>Unit</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                      <WorkflowIcon className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={formData.unit}
                      onChange={(e) => {
                        setFormData({ ...formData, unit: e.target.value });
                      }}
                      className="rounded-xl w-full px-3 py-2.5 text-sm border border-slate-300  focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none appearance-none pl-10"
                      required
                    >
                      {["sqft", "sqm"].map((ca: any) => (
                        <option key={ca} value={ca}>
                          {ca}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3 h-3 text-purple-600" />
                    <span>Engineer</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={engineers.map((e: any) => ({
                        id: e.id,
                        name: e.full_name,
                      }))}
                      value={formData.engineer_id}
                      onChange={(id) => {
                        setFormData({ ...formData, engineer_id: id });
                      }}
                      placeholder={"Select Engineer"}
                      required
                      disabled={
                        (String(formData.area_id).length === 0 &&
                          String(formData.commonAreaId).length === 0) ||
                        String(formData.name).length === 0
                      }
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>Start Date</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-amber-600" />
                    <span>End Date</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rest of your form remains the same... */}
            {/* Calculation Summary */}

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-300 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 pb-4">
              <button
                type="submit"
                // disabled={formData.items.length === 0}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl hover:from-red-400 hover:to-red-800 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Create Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateTaskModal(false);
                }}
                className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>

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
              background: #3b82f6;
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #2563eb;
            }
          `}</style>

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
    background: #3b82f6;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
`}</style>
        </div>
      </div>

      {/* Item selector (with category + search) */}
    </div>
  );
}
