import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  X,
  Trash2,
  Edit2,
  Filter,
  Building,
  Save,
  UserRound,
  HardHat,
  Users,
  Home,
  Layers,
  Ruler,
  ChevronDown,
  TrendingUp,
  Pickaxe,
  Construction,
  Package,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Backend API calls for Area Tasks
import AreaTasksApifrom from "../../lib/areaTasksApi";

// Use only projectApi since it contains nested data
import projectApi from "../../lib/projectApi";
import { UsersApi } from "../../lib/Api";
import { FaLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import MySwal from "../../utils/swal";
import AreaSubTasksApi from "../../lib/subTaskApi";
import React from "react";

interface AreaFormData {
  id?: string;
  project_id: number | string | null;
  building_id: number | string | null;
  floor_id: number | string | null;
  flat_id: number | string | null;
  common_area_id: number | string | null;
  assigned_engineer: number | string | null;
  start_date: string;
  expected_end_date: string;
  progress: number;
  status: string;
  is_active: boolean;
  created_by?: string | null;

  // Display fields (from joins)
  project_name?: string;
  building_name?: string;
  floor_name?: string;
  flat_name?: string;
  common_area_name?: string;
  assigned_engineer_name?: string;
  created_by_name?: string;
  expanded: boolean;
  tasks: any;
}

interface ProjectData {
  id: string | number;
  name: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  is_active?: boolean;
  buildings?: BuildingData[];
}

interface BuildingData {
  id: string | number;
  project_id: string | number;
  building_name: string;
  status: string;
  progress_percentage: string;
  floors?: FloorData[];
}

interface FloorData {
  id: string | number;
  building_id: string | number;
  floor_name: string;
  status: string;
  progress_percentage: string;
  flats?: FlatData[];
  common_areas?: CommonAreaData[];
}

interface FlatData {
  id: string | number;
  floor_id: string | number;
  flat_name: string;
  status: string;
  progress_percentage: string;
  workflow?: any[];
}

interface CommonAreaData {
  id: string | number;
  floor_id: string | number;
  common_area_name: string;
  status: string;
  progress_percentage: string;
  workflow?: any[];
}

const defaultFormData: AreaFormData = {
  project_id: null,
  building_id: null,
  floor_id: null,
  flat_id: null,
  common_area_id: null,
  assigned_engineer: null,
  start_date: new Date().toISOString().split("T")[0],
  expected_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0],
  progress: 0,
  status: "pending",
  is_active: true,
  created_by: null,
  tasks: [],
  expanded: false,
};

interface SubTaskType {
  id?: string | number | null;
  area_task_id: string | number | null;
  name: string | null;
  unit: string | null;
  start_date: string;
  end_date: string;
  total_work: string | null;
  progress: string | null;
  status: string | null;
}

export default function AreaTasks({
  selectedProjectId,
  setSelectedProjectId,
}: {
  selectedProjectId: number;
  setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
}) {
  const { user } = useAuth();
  const [areaTasks, setAreaTasks] = useState<AreaFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [flats, setFlats] = useState<FlatData[]>([]);
  const [commonAreas, setCommonAreas] = useState<CommonAreaData[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);

  // Filter states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filters, setFilters] = useState({
    project_id: "",
    building_id: "",
    floor_id: "",
    flat_id: "",
    common_area_id: "",
    assigned_engineer: "",
    status: "",
    is_active: "",
  });

  const [formData, setFormData] = useState<AreaFormData>({
    ...defaultFormData,
    project_id: selectedProject?.id || "",
    created_by: user?.id ?? null,
  });

  const [taskFormData, setTaskFormData] = useState<SubTaskType>({
    area_task_id: null,
    name: "",
    unit: "",
    start_date: "",
    end_date: "",
    total_work: "",
    progress: "",
    status: "",
  });

  const [showTaskModal, setShowTaskModal] = useState<boolean>(false);

  const loadProjectDetails = async () => {
    try {
      const project: any = await projectApi.getProjectById(selectedProjectId);
      console.log("this is project details", project.data);
      setSelectedProject(project.data || []);
      setBuildings(
        Array.isArray(project.data.buildings) ? project.data.buildings : [],
      );
      setFloors([]);
      setFlats([]);
      setCommonAreas([]);
    } catch (error) {
      console.error("Error loading project details:", error);
      setSelectedProject(null);
      setBuildings([]);
      setFloors([]);
      setFlats([]);
      setCommonAreas([]);
    }
  };

  useEffect(() => {
    console.log("from use effect", selectedProject);
  }, [selectedProject]);

  const loadEngineers = async () => {
    try {
      const data: any = await UsersApi.getByRole("user");

      console.log("data", data);
      setEngineers(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadEngineers();
    loadProjectDetails();
    loadData();
  }, []);

  const handleBuildingChange = (buildingId: string) => {
    if (!buildingId || !selectedProject) {
      setFloors([]);
      setFlats([]);
      setCommonAreas([]);
      setFormData({
        ...formData,
        building_id: null,
        floor_id: null,
        flat_id: null,
        common_area_id: null,
      });
      return;
    }

    const building = selectedProject.buildings?.find(
      (b) => String(b.id) === buildingId,
    );
    if (building) {
      setFloors(building.floors || []);
      setFlats([]);
      setCommonAreas([]);
      setFormData({
        ...formData,
        building_id: buildingId,
        floor_id: null,
        flat_id: null,
        common_area_id: null,
      });
    }
  };

  const handleFloorChange = (floorId: string) => {
    if (!floorId || !selectedProject) {
      setFlats([]);
      setCommonAreas([]);
      setFormData({
        ...formData,
        floor_id: null,
        flat_id: null,
        common_area_id: null,
      });
      return;
    }

    const floor = floors.find((f) => String(f.id) === floorId);
    if (floor) {
      setFlats(floor.flats || []);
      setCommonAreas(floor.common_areas || []);
      setFormData({
        ...formData,
        floor_id: floorId,
        flat_id: null,
        common_area_id: null,
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const rows: any =
        await AreaTasksApifrom.getAreaTasksByProjectId(selectedProjectId);
      const subTasksRes = await AreaSubTasksApi.getSubTasks();
      console.log("sub task res", subTasksRes);
      console.log(rows, "hellow");
      // Sort by start date (newest first)
      const data = rows.data;
      data.sort(
        (a: any, b: any) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      );
      console.log(data);

      const normalized = data.map((r: any) => ({
        ...r,
        id: String(r.id),
        project_id: r.project_id || null,
        building_id: r.building_id || null,
        floor_id: r.floor_id || null,
        flat_id: r.flat_id || null,
        common_area_id: r.common_area_id || null,
        assigned_engineer: r.assigned_engineer || null,
        is_active: Boolean(r.is_active),
        tasks: subTasksRes.filter(
          (d: any) => Number(d.area_task_id) === Number(r.id),
        ),
        expanded: false,
      }));
      console.log(normalized);
      setAreaTasks(normalized);
    } catch (err) {
      console.error("loadData error", err);
      setAreaTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.project_id ||
      !formData.building_id ||
      !formData.floor_id ||
      !formData.assigned_engineer ||
      !formData.start_date ||
      !formData.expected_end_date
    ) {
      toast.error(
        "Please fill required fields: Project, Building, Floor, and Assigned Engineer",
      );
      return;
    }

    const taskData: any = {
      ...formData,
      project_id: Number(formData.project_id),
      building_id: Number(formData.building_id),
      floor_id: Number(formData.floor_id),
      flat_id: formData.flat_id ? Number(formData.flat_id) : null,
      common_area_id: formData.common_area_id
        ? Number(formData.common_area_id)
        : null,
      assigned_engineer: String(formData.assigned_engineer),
      progress: Number(formData.progress),
      is_active: formData.is_active ? 1 : 0,
      created_by: formData.created_by || user?.id,
    };

    // Remove display fields before sending to backend
    delete taskData.project_name;
    delete taskData.building_name;
    delete taskData.floor_name;
    delete taskData.flat_name;
    delete taskData.common_area_name;
    delete taskData.assigned_engineer_name;
    delete taskData.created_by_name;

    try {
      if (editingId) {
        await AreaTasksApifrom.updateAreaTask(editingId, taskData);
      } else {
        await AreaTasksApifrom.createAreaTask(taskData);
      }

      await loadData();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save area task");
      console.error("handleSubmit error", err);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(taskFormData, selectedAreaId);

    // Validate required fields
    if (
      !selectedAreaId ||
      !taskFormData.name ||
      !taskFormData.unit ||
      !taskFormData.total_work ||
      !taskFormData.start_date ||
      !taskFormData.end_date
    ) {
      toast.error(
        "Please fill required fields: Project, Building, Floor, and Assigned Engineer",
      );
      return;
    }

    const taskData: any = {
      ...taskFormData,
      area_task_id: selectedAreaId,
      status: "pending",
    };

    try {
      if (editingId) {
        await AreaSubTasksApi.updateSubTask(editingId, taskData);
      } else {
        await AreaSubTasksApi.createSubTask(taskData);
      }

      await loadData();
      resetForm();
      setShowTaskModal(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save area task");
      console.error("handleSubmit error", err);
    }
  };

  const handleEdit = (task: AreaFormData) => {
    setEditingId(task.id ?? null);
    setFormData({
      ...task,
      project_id: task.project_id || null,
      building_id: task.building_id || null,
      floor_id: task.floor_id || null,
      flat_id: task.flat_id || null,
      common_area_id: task.common_area_id || null,
      assigned_engineer: task.assigned_engineer || null,
      start_date: task.start_date.split("T")[0],
      expected_end_date: task.expected_end_date.split("T")[0],
      is_active: task.is_active ?? true,
    });

    // Load project details for editing
    if (task.project_id) {
      loadProjectDetails().then(() => {
        // After project loads, find and set the correct building
        if (task.building_id && selectedProject) {
          const building = selectedProject.buildings?.find(
            (b) => String(b.id) === String(task.building_id),
          );
          if (building) {
            setFloors(building.floors || []);

            // Find and set the correct floor
            if (task.floor_id) {
              const floor = building.floors?.find(
                (f) => String(f.id) === String(task.floor_id),
              );
              if (floor) {
                setFlats(floor.flats || []);
                setCommonAreas(floor.common_areas || []);
              }
            }
          }
        }
      });
    }

    setShowModal(true);
  };

  const handleTaskEdit = (task: SubTaskType) => {
    setEditingId(task.id || null);
    setTaskFormData({
      area_task_id: task.id || "",
      name: task.name || "",
      unit: task.unit || "",
      start_date: task.start_date || "",
      end_date: task.end_date || "",
      total_work: task.total_work || "",
      progress: task.progress || "",
      status: task.status || "",
    });

    setShowTaskModal(true);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;
    try {
      await AreaTasksApifrom.deleteAreaTask(id);
      await loadData();
    } catch (err) {
      toast.error("Delete failed");
      console.error("handleDelete error", err);
    }
  };

  const handleSubTaskDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;
    try {
      await AreaSubTasksApi.deleteSubTask(id);
      await loadData();
    } catch (err) {
      toast.error("Delete failed");
      console.error("handleDelete error", err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await AreaTasksApifrom.toggleAreaTaskStatus(id);
      await loadData();
    } catch (err) {
      toast.error("Failed to toggle status");
      console.error("handleToggleStatus error", err);
    }
  };

  const resetForm = () => {
    setFormData({
      ...defaultFormData,
      project_id: selectedProject?.id || "",
      created_by: user?.id ?? null,
    });
    setEditingId(null);
    setFloors([]);
    setFlats([]);
    setCommonAreas([]);
  };

  const resetTaskForm = () => {
    setTaskFormData({
      area_task_id: null,
      name: "",
      unit: "",
      start_date: "",
      end_date: "",
      total_work: "",
      progress: "",
      status: "",
    });
    setEditingId(null);
  };

  const resetFilters = () => {
    setFilters({
      project_id: "",
      building_id: "",
      floor_id: "",
      flat_id: "",
      common_area_id: "",
      assigned_engineer: "",
      status: "",
      is_active: "",
    });
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
    loadData();
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      on_hold: "bg-gray-100 text-gray-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getActiveBadge = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium"
      : "bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium";
  };

  const togglePOExpand = (poId: string) => {
    setAreaTasks((prev) =>
      prev.map((po) =>
        po.id === poId ? { ...po, expanded: !po.expanded } : po,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading area tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      {/* Header with Actions */}

      <button
        className="flex items-center font-semibold"
        onClick={() => setSelectedProjectId(null)}
      >
        <FaLeftLong className="mr-3" />
        Back to Projects
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Tasks Area</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#C62828] text-white px-6 py-3 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Area
        </button>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => setShowFilterSidebar(true)}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm text-sm"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          {Object.values(filters).some((value) => value !== "") && (
            <button
              onClick={() => {
                resetFilters();
                loadData();
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Building/Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Engineer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Start Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  End Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {areaTasks.map((area: any) => (
                <React.Fragment key={area.id}>
                  <tr key={area.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1 justify-center">
                        <button
                          onClick={() => togglePOExpand(area.id)}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          {area.expanded ? (
                            <ChevronDown className="w-3 h-3 text-gray-600" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800 text text-xs">
                          {area.project_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800 text-xs">
                          {area.building_name}
                        </p>
                        <p className="text-xs text-gray-500 ">
                          Floor: {area.floor_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {area.flat_name
                        ? area.flat_name
                        : area.common_area_name
                          ? area.common_area_name
                          : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-2">
                        <UserRound className="w-4 h-4 text-gray-400" />
                        <span>{area.assigned_engineer_name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Start:{" "}
                          {new Date(area.start_date).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 ">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Expected:{" "}
                          {new Date(
                            area.expected_end_date,
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${area.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">
                          {area.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(area.status)}`}
                      >
                        {area.status.replace("_", " ").toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <button
                        onClick={() => handleToggleStatus(area.id!)}
                        className={getActiveBadge(area.is_active)}
                      >
                        {area.is_active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="flex">
                        <button
                          onClick={() => {
                            setSelectedAreaId(Number(area?.id) || null);
                            resetTaskForm();
                            setShowTaskModal(true);
                          }}
                          className="p-1 bg-green-200 text-green-700 hover:bg-green-100 rounded-lg transition text-[0.8rem] flex items-center font-semibold px-2"
                          title="Add Task"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(area)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(area.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {area.expanded && area.tasks.length > 0 && (
                    <tr className="bg-gray-50 w-full">
                      <td colSpan={11} className="p-0 w-full">
                        <div className="px-3 py-2 border-t border-gray-200 w-full">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                            <Pickaxe className="w-3 h-3" />
                            Area Sub Tasks
                          </h4>
                          <div className="overflow-x-auto w-full">
                            <table className="w-full bg-white rounded-lg border border-gray-200">
                              <thead className="bg-gray-100 w-full">
                                <tr className="w-full">
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Area
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Task
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Total Work
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Work Done
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Start Date
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    End Date
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Predicted ED
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Progress
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Status
                                  </th>
                                  <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 w-full">
                                {area.tasks.map((task: any, idx: number) => {
                                  return (
                                    <tr
                                      key={task.id}
                                      className={`hover:bg-gray-50 ${
                                        idx % 2 === 0
                                          ? "bg-white"
                                          : "bg-gray-50/50"
                                      } w-full`}
                                    >
                                      <td className="px-2 py-1.5">
                                        <div
                                          className="font-medium text-gray-800 text-xs truncate max-w-[150px]"
                                          title={task.project_name || "Unknown"}
                                        >
                                          {`${area.project_name} ${area.building_name} ${area.floor_name} ${area.flat_name} ${area.common_area_name}` ||
                                            "Unknown"}
                                        </div>
                                        <div className="text-[10px] text-gray-500">
                                          Unit: {task.unit || "N/A"}
                                        </div>
                                      </td>
                                      <td className="px-2 py-1.5 text-gray-700 text-xs">
                                        {task.name || "-"}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                        {task.total_work} {task.unit || "N/A"}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                        {task.work_done} {task.unit || "N/A"}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium text-xs">
                                        {new Date(
                                          task.start_date,
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium  text-xs">
                                        {new Date(
                                          task.end_date,
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="px-2 py-1.5 font-medium  text-xs">
                                        {new Date(
                                          task.predicted_date,
                                        ).toLocaleDateString()}
                                      </td>
                                      <td className="px-2 py-1.5 flex items-center mt-2">
                                        <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                          <div
                                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                                            style={{
                                              width: `${task.progress}%`,
                                            }}
                                          />
                                        </div>
                                        <p className="text-[10px] text-gray-600 ml-3">
                                          {task.progress}%
                                        </p>
                                      </td>
                                      <td className="px-2 py-1.5">
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(
                                            task.status,
                                          )} whitespace-nowrap`}
                                        >
                                          {task.status?.toUpperCase() ||
                                            "PENDING"}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-xs">
                                        <div className="flex">
                                          <button
                                            onClick={() => {
                                              handleTaskEdit(task);
                                            }}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            title="Edit"
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>

                                          <button
                                            onClick={() =>
                                              handleSubTaskDelete(task.id!)
                                            }
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Show message if no materials */}
                  {area.expanded && area.tasks.length === 0 && (
                    <tr className="bg-gray-50">
                      <td colSpan={11} className="p-0">
                        <div className="px-3 py-4 border-t border-gray-200 text-center">
                          <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-xs">
                            No materials found for this purchase order
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>

          {areaTasks.length === 0 && (
            <div className="text-center py-12">
              <HardHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No area tasks found
              </h3>
              <p className="text-gray-600">
                {Object.values(filters).some((value) => value !== "")
                  ? "Try different filter criteria"
                  : 'Click "Create Area Task" to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
                >
                  Reset All yes
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Engineer Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Engineer
                </label>
                <select
                  value={filters.assigned_engineer}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      assigned_engineer: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Engineers</option>
                  {engineers.map((engineer) => (
                    <option key={engineer.id} value={engineer.id}>
                      {engineer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Status
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) =>
                    setFilters({ ...filters, is_active: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xl my-4 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <HardHat className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingId ? "Edit Area Task" : "Create Area Task"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? "Update task details" : "Add new area task"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Project */}
                <div className="space-y-1">
                  <label className=" text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#C62828]" />
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled
                    value={selectedProjectId}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    required
                  >
                    <option value="">Select Project</option>
                    <option value={selectedProjectId}>
                      {selectedProject?.name}
                    </option>
                  </select>
                </div>

                {/* Building */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#C62828]" />
                    Building <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      formData.building_id !== null
                        ? String(formData.building_id)
                        : ""
                    }
                    onChange={(e) => handleBuildingChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    required
                  >
                    <option value="">Select Building</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.building_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Floor */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#C62828]" />
                    Floor <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      formData.floor_id !== null
                        ? String(formData.floor_id)
                        : ""
                    }
                    onChange={(e) => handleFloorChange(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    required
                    disabled={!formData.building_id}
                  >
                    <option value="">Select Floor</option>
                    {floors.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.floor_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Flat */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-[#C62828]" />
                    Flat (Optional)
                  </label>
                  <select
                    value={
                      formData.flat_id !== null ? String(formData.flat_id) : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        flat_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    disabled={
                      !formData.floor_id || Boolean(formData.common_area_id)
                    }
                  >
                    <option value="">Select Flat (Optional)</option>
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.flat_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Common Area */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#C62828]" />
                    Common Area (Optional)
                  </label>
                  <select
                    value={
                      formData.common_area_id !== null
                        ? String(formData.common_area_id)
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        common_area_id: e.target.value
                          ? Number(e.target.value)
                          : null,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    disabled={!formData.floor_id || Boolean(formData.flat_id)}
                  >
                    <option value="">Select Common Area (Optional)</option>
                    {commonAreas.map((ca) => (
                      <option key={ca.id} value={ca.id}>
                        {ca.common_area_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assigned Engineer */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <UserRound className="w-3.5 h-3.5 text-[#C62828]" />
                    Assigned Engineer <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      formData.assigned_engineer !== null
                        ? String(formData.assigned_engineer)
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        assigned_engineer: String(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    required
                  >
                    <option value="">Select Engineer</option>
                    {engineers.map((eng) => (
                      <option key={eng.id} value={eng.id}>
                        {eng.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* Expected End Date */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                    Expected End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.expected_end_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_end_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Active
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingId ? "Update Area Task" : "Create Area Task"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* form for creating sub task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xl my-4 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingId ? "Edit Sub Task" : "Create Sub Task"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? "Update Sub Task Details" : "Add New Sub Task"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmitTask} className="space-y-3">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Pickaxe className="w-3.5 h-3.5 text-[#C62828]" />
                    Sub Task Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Pickaxe className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={taskFormData.name || ""}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          name: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      placeholder="Enter sub-task name"
                      required
                    />
                  </div>
                </div>

                {/* Unit */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-[#C62828]" />
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Ruler className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={taskFormData.unit || ""}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          unit: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all appearance-none"
                      required
                    >
                      <option value="">Select Unit</option>
                      <option value="sqm">Square Meter (sqm)</option>
                      <option value="m²">m²</option>
                      <option value="m³">m³</option>
                      <option value="kg">Kilogram (kg)</option>
                      <option value="ton">Tonne (ton)</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                      <option value="units">Units</option>
                      <option value="pcs">Pieces</option>
                      <option value="liters">Liters</option>
                      <option value="meters">Meters</option>
                      <option value="feet">Feet</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Total Work */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Construction className="w-3.5 h-3.5 text-[#C62828]" />
                    Total Work <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Construction className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={taskFormData.total_work || ""}
                      onChange={(e) =>
                        setTaskFormData({
                          ...taskFormData,
                          total_work: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                      placeholder="Enter total work"
                      required
                      min="0"
                      step="0.01"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      {taskFormData.unit}
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div className="space-y-1">
                  <label className=" text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={taskFormData.start_date}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* Expected End Date */}
                <div className="space-y-1">
                  <label className=" text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                    Expected End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={taskFormData.end_date}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                    required
                  />
                </div>

                {/* Progress (only for editing) */}
                {editingId && (
                  <div className="space-y-1">
                    <label className=" text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#C62828]" />
                      Progress
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={taskFormData.progress || ""}
                        onChange={(e) =>
                          setTaskFormData({
                            ...taskFormData,
                            progress: e.target.value || "",
                          })
                        }
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                        placeholder="Enter progress percentage"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        %
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className=" flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {editingId ? "Update Sub Task" : "Create Sub Task"}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Custom Scrollbar Styles */}
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
        </div>
      )}

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
