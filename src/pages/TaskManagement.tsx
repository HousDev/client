import { useState, useEffect } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  Clock,
  X,
  Trash2,
  Edit2,
  Printer,
  Share2,
  ChevronDown,
  Filter,
  Eye,
  Building,
  CheckSquare,
  FileText,
  MapPin,
  Phone,
  Save,
  UserRound,
  HardHat,
  Users,
  Home,
  Layers,
  FolderTree,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

// Backend API calls for Area Tasks
import AreaTasksApifrom from "../lib/areaTasksApi";

// Use only projectApi since it contains nested data
import projectApi from "../lib/projectApi";
import { api, UsersApi } from "../lib/Api";

interface AreaTaskFormData {
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

const defaultFormData: AreaTaskFormData = {
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
};

export default function AreaTasks() {
  const { user } = useAuth();
  const [areaTasks, setAreaTasks] = useState<AreaTaskFormData[]>([]);
  const [loading, setLoading] = useState(true);

  // Master data states
  const [projects, setProjects] = useState<ProjectData[]>([]);
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
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const [formData, setFormData] = useState<AreaTaskFormData>({
    ...defaultFormData,
    created_by: user?.id ?? null,
  });

  useEffect(() => {
    loadData();
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const projectRes: any = await projectApi.getProjects();
      console.log(projectRes, "this is data");
      setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
    } catch (error) {
      console.error("Error loading master data:", error);
    }
  };

  const loadProjectDetails = async (projectId: number) => {
    try {
      const project: any = await projectApi.getProjectById(projectId);
      console.log(project.data);
      setSelectedProject(project.data);
      setBuildings(project.data.buildings || []);
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
  }, []);

  const handleProjectChange = (projectId: string) => {
    if (!projectId) {
      setSelectedProject(null);
      setBuildings([]);
      setFloors([]);
      setFlats([]);
      setCommonAreas([]);
      setFormData({
        ...formData,
        project_id: null,
        building_id: null,
        floor_id: null,
        flat_id: null,
        common_area_id: null,
      });
      return;
    }

    loadProjectDetails(Number(projectId));
    setFormData({
      ...formData,
      project_id: projectId,
      building_id: null,
      floor_id: null,
      flat_id: null,
      common_area_id: null,
    });
  };

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
      const rows: any = await AreaTasksApifrom.getAreaTasks();
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
      }));

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
      alert(
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
      alert(err?.message || "Failed to save area task");
      console.error("handleSubmit error", err);
    }
  };

  const handleEdit = (task: AreaTaskFormData) => {
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
      loadProjectDetails(Number(task.project_id)).then(() => {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this area task?")) return;
    try {
      await AreaTasksApifrom.deleteAreaTask(id);
      await loadData();
    } catch (err) {
      alert("Delete failed");
      console.error("handleDelete error", err);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await AreaTasksApifrom.toggleAreaTaskStatus(id);
      await loadData();
    } catch (err) {
      alert("Failed to toggle status");
      console.error("handleToggleStatus error", err);
    }
  };

  const resetForm = () => {
    setFormData({
      ...defaultFormData,
      created_by: user?.id ?? null,
    });
    setEditingId(null);
    setSelectedProject(null);
    setBuildings([]);
    setFloors([]);
    setFlats([]);
    setCommonAreas([]);
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

  const getAreaDisplay = (task: AreaTaskFormData) => {
    if (task.flat_id) {
      return `Flat: ${task.flat_name || "N/A"}`;
    } else if (task.common_area_id) {
      return `Common Area: ${task.common_area_name || "N/A"}`;
    }
    return "N/A";
  };

  const getProjectNameById = (projectId: number | string | null) => {
    if (!projectId) return "N/A";
    const project = projects.find((p) => String(p.id) === String(projectId));
    return project?.name || "N/A";
  };

  const getBuildingNameById = (
    projectId: number | string | null,
    buildingId: number | string | null,
  ) => {
    if (!projectId || !buildingId) return "N/A";
    const project = projects.find((p) => String(p.id) === String(projectId));
    if (!project?.buildings) return "N/A";
    const building = project.buildings.find(
      (b) => String(b.id) === String(buildingId),
    );
    return building?.building_name || "N/A";
  };

  const getFloorNameById = (
    projectId: number | string | null,
    buildingId: number | string | null,
    floorId: number | string | null,
  ) => {
    if (!projectId || !buildingId || !floorId) return "N/A";
    const project = projects.find((p) => String(p.id) === String(projectId));
    if (!project?.buildings) return "N/A";
    const building = project.buildings.find(
      (b) => String(b.id) === String(buildingId),
    );
    if (!building?.floors) return "N/A";
    const floor = building.floors.find((f) => String(f.id) === String(floorId));
    return floor?.floor_name || "N/A";
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
    <div className="p-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Area Tasks</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#C62828] text-white px-6 py-3 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Area Task
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
              {areaTasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {task.project_name ||
                          getProjectNameById(task.project_id)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {task.building_name ||
                          getBuildingNameById(
                            task.project_id,
                            task.building_id,
                          )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Floor:{" "}
                        {task.floor_name ||
                          getFloorNameById(
                            task.project_id,
                            task.building_id,
                            task.floor_id,
                          )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getAreaDisplay(task)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <UserRound className="w-4 h-4 text-gray-400" />
                      <span>{task.assigned_engineer_name || "N/A"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        Start: {new Date(task.start_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        Expected:{" "}
                        {new Date(task.expected_end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {task.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(task.status)}`}
                    >
                      {task.status.replace("_", " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={getActiveBadge(task.is_active)}>
                      {task.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(task.id!)}
                        className={`p-2 rounded-lg transition ${
                          task.is_active
                            ? "text-orange-600 hover:bg-orange-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={task.is_active ? "Deactivate" : "Activate"}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id!)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
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
                  Reset All
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
              {/* Project Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <select
                  value={filters.project_id}
                  onChange={(e) =>
                    setFilters({ ...filters, project_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-[#C62828]" />
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={
                      formData.project_id !== null
                        ? String(formData.project_id)
                        : ""
                    }
                    onChange={(e) => {
                      handleProjectChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
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
                    disabled={!formData.project_id}
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
                    disabled={!formData.floor_id}
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
                    disabled={!formData.floor_id}
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
