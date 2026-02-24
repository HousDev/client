import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  XCircle,
  Edit,
  Eye,
  FileText,
  Package,
  X,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Use only projectApi since it contains nested data
import projectApi from "../../lib/projectApi";
import { UsersApi } from "../../lib/Api";
import { FaLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import AreaSubTasksApi from "../../lib/subTaskApi";
import React from "react";
import CreateTask from "./CreateTask";
import UpdateTask from "./UpdateTask";
import EngineerUdateTask from "./EngineerUpdateTask";
import { all } from "axios";

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
  console.log(selectedProjectId);
  const { user, can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any>();
  const [showPhotos, setShowPhotos] = useState(false);
  const [allTasks, setAllTasks] = useState<any>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  const [selectedTaskPhotos, setSelectedTaskPhotos] = useState([]);
  const [showUpdateModel, setShowUpdateModal] = useState<boolean>(false);
  const [showEngineerTaskUpdateModel, setShowEngineerTaskUpdateModal] =
    useState<boolean>(false);
  const [buildings, setBuildings] = useState<BuildingData[]>([]);
  const [floors, setFloors] = useState<FloorData[]>([]);
  const [flats, setFlats] = useState<FlatData[]>([]);
  const [commonAreas, setCommonAreas] = useState<CommonAreaData[]>([]);
  const [engineers, setEngineers] = useState<any[]>([]);
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    location: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [selectedImg, setSelectedImg] = useState("");

  // Search states for each column
  const [searchTask, setSearchTask] = useState("");
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchFloor, setSearchFloor] = useState("");
  const [searchFlatCommonArea, setSearchFlatCommonArea] = useState("");
  const [searchArea, setSearchArea] = useState("");
  const [searchTotalWork, setSearchTotalWork] = useState("");
  const [searchWorkDone, setSearchWorkDone] = useState("");
  const [searchEngineer, setSearchEngineer] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchPredictedDate, setSearchPredictedDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [expandTask, setExpandTask] = useState([]);

  const [showCreateTaskModal, setShowCreateTaskModal] =
    useState<boolean>(false);

  const loadProjectDetails = async () => {
    try {
      const project: any = await projectApi.getProjectById(selectedProjectId);

      setSelectedProject(project.data || []);
      setBuildings(
        Array.isArray(project.data.buildings) ? project.data.buildings : [],
      );
      setFloors(
        Array.isArray(project.data.buildings.floors)
          ? project.data.buildings.floors
          : [],
      );
      setFlats(
        Array.isArray(project.data.buildings.floors.flats)
          ? project.data.buildings.floors.flats
          : [],
      );
      setCommonAreas(
        Array.isArray(project.data.buildings.floors.common_areas)
          ? project.data.buildings.floors.common_areas
          : [],
      );
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

  const loadAllTask = async () => {
    try {
      const project: any = await projectApi.getProjectById(selectedProjectId);
      let taskRes: any;
      if (user.role === "admin") {
        taskRes =
          await AreaSubTasksApi.getSubTasksByProjectId(selectedProjectId);
      } else {
        taskRes = await AreaSubTasksApi.getSubTasksByEngineerId(
          user.id,
          selectedProjectId,
        );
      }
      const users = await UsersApi.list();
      const filteredUsers = users.filter((u: any) => u.role === "engineer");

      const projectData = project.data;
      const normalizedTasks = taskRes.map((t: any) => {
        const building = projectData?.buildings?.find(
          (b: any) => b.id === t.building_id,
        );

        const floor = building?.floors?.find((f: any) => f.id === t.floor_id);

        const flat = t.flat_id
          ? floor?.flats?.find((fl: any) => fl.id === t.flat_id)
          : null;

        const area = t.area_id
          ? flat?.areas.find((fl: any) => fl.id === t.area_id)
          : null;

        const common_area = t.common_area_id
          ? floor?.common_areas?.find((ca: any) => ca.id === t.common_area_id)
          : null;
        const engineer = filteredUsers.find(
          (fu: any) => fu.id === t.engineer_id,
        );

        return {
          ...t,
          project: projectData.name || "-",
          building: building?.building_name || "-",
          floor: floor?.floor_name || "-",
          flat: flat?.flat_name || "-",
          common_area: common_area?.common_area_name || "-",
          area: area?.name || "-",
          engineer: engineer?.full_name,
        };
      });

      const groupedTasks = Object.values(
        normalizedTasks.reduce((acc: any, curr: any) => {
          // Create task only once
          if (!acc[curr.id]) {
            acc[curr.id] = {
              id: curr.id,
              project_id: curr.project_id,
              project: curr.project,
              building_id: curr.building_id,
              building: curr.building,
              floor_id: curr.floor_id,
              floor: curr.floor,
              flat_id: curr.flat_id,
              flat: curr.flat,
              area_id: curr.area_id,
              area: curr.area,
              common_area_id: curr.common_area_id,
              common_area: curr.common_area,
              name: curr.name,
              engineer_id: curr.engineer_id,
              engineer: curr.engineer,
              start_date: curr.start_date,
              end_date: curr.end_date,
              predicted_date: curr.predicted_date,
              total_work: curr.total_work,
              work_done: curr.work_done,
              unit: curr.unit,
              progress: curr.progress,
              status: curr.status,
              created_at: curr.created_at,
              updated_at: curr.updated_at,
              logs: [], // 👈 logs array
            };
          }

          // Push log if exists
          if (curr.log_id !== null && curr.log_id !== undefined) {
            acc[curr.id].logs.push({
              log_id: curr.log_id,
              work_done: curr.log_work_done,
              work_unit: curr.log_work_unit,
              photos: curr.photos || [],
              issue: curr.issue,
              created_by: curr.log_created_by,
              created_at: curr.created_at,
            });
          }

          return acc;
        }, {}),
      );
      console.log(groupedTasks, "grouped");

      setAllTasks(groupedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Something went wrong while fetching Tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTask();
  }, []);

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
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-orange-100 text-orange-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const deleteTask = async (id: number) => {
    try {
      await AreaSubTasksApi.deleteSubTask(id);
      loadAllTask();
      toast.success("Task Deleted Successfully.");
    } catch (error) {
      toast.error("Something went wrong while deleting task.");
    }
  };

  const clearAllFilters = () => {
    setSearchTask("");
    setSearchBuilding("");
    setSearchFloor("");
    setSearchFlatCommonArea("");
    setSearchArea("");
    setSearchTotalWork("");
    setSearchWorkDone("");
    setSearchEngineer("");
    setSearchStartDate("");
    setSearchEndDate("");
    setSearchPredictedDate("");
    setSearchStatus("");
  };

  // Filter tasks based on search criteria
  const filteredTasks = allTasks.filter((task: any) => {
    return (
      (searchTask === "" ||
        (task.name || "").toLowerCase().includes(searchTask.toLowerCase())) &&
      (searchBuilding === "" ||
        (task.building || "")
          .toLowerCase()
          .includes(searchBuilding.toLowerCase())) &&
      (searchFloor === "" ||
        (task.floor || "").toLowerCase().includes(searchFloor.toLowerCase())) &&
      (searchFlatCommonArea === "" ||
        ((task.flat === "-" ? task.common_area : task.flat) || "")
          .toLowerCase()
          .includes(searchFlatCommonArea.toLowerCase())) &&
      (searchArea === "" ||
        (task.area || "").toLowerCase().includes(searchArea.toLowerCase())) &&
      (searchTotalWork === "" ||
        (task.total_work || "").toString().includes(searchTotalWork)) &&
      (searchWorkDone === "" ||
        (task.work_done || "").toString().includes(searchWorkDone)) &&
      (searchEngineer === "" ||
        (task.engineer || "")
          .toLowerCase()
          .includes(searchEngineer.toLowerCase())) &&
      (searchStartDate === "" ||
        (task.start_date || "").includes(searchStartDate)) &&
      (searchEndDate === "" || (task.end_date || "").includes(searchEndDate)) &&
      (searchPredictedDate === "" ||
        (task.predicted_date || "").includes(searchPredictedDate)) &&
      (searchStatus === "" ||
        (task.status || "").toLowerCase().includes(searchStatus.toLowerCase()))
    );
  });

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
      {/* Header with Actions - Made sticky */}
      <div className="sticky top-16 z-10 px-0  mt-0 border-b border-gray-200">
        <button
          className="flex items-center font-semibold mb-4"
          onClick={() => setSelectedProjectId(null)}
        >
          <FaLeftLong className="mr-3" />
          Back to Projects
        </button>

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Project Tasks</h1>
          {can("create_task") && (
            <button
              onClick={() => {
                setShowCreateTaskModal(true);
              }}
              className="bg-[#C62828] text-white px-3 py-2 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="mt-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto h-[calc(100vh-200px)]">
            <table className="w-full min-w-[1200px]">
              <thead className="sticky top-0 z-20 bg-gray-200 border-b border-gray-200">
                {/* Header Row */}
                <tr>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Task
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Building
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Floor
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Flat/Common Area
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Area
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total Work
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Work Done
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Assigned To
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Start Date
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      End Date
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Predicted End Date
                    </div>
                  </th>
                  {/* <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </div>
                  </th> */}
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </div>
                  </th>
                </tr>

                {/* Search Row - Sticky below header */}
                <tr className="sticky top-[40px] z-10 bg-gray-50 border-b border-gray-200">
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search task..."
                      value={searchTask}
                      onChange={(e) => setSearchTask(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search building..."
                      value={searchBuilding}
                      onChange={(e) => setSearchBuilding(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search floor..."
                      value={searchFloor}
                      onChange={(e) => setSearchFloor(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search flat/area..."
                      value={searchFlatCommonArea}
                      onChange={(e) => setSearchFlatCommonArea(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search area..."
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search total work..."
                      value={searchTotalWork}
                      onChange={(e) => setSearchTotalWork(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search work done..."
                      value={searchWorkDone}
                      onChange={(e) => setSearchWorkDone(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search engineer..."
                      value={searchEngineer}
                      onChange={(e) => setSearchEngineer(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search start date..."
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search end date..."
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  {/* <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search predicted..."
                      value={searchPredictedDate}
                      onChange={(e) => setSearchPredictedDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td> */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search status..."
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                  <td className="px-3 md:px-4 py-1 text-center">
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Clear Filters"
                    >
                      <XCircle className="w-3 h-3 mr-0.5" />
                      Clear
                    </button>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task: any) => {
                  return (
                    <React.Fragment>
                      <tr
                        onClick={() =>
                          setExpandTask(task.id === expandTask ? "" : task.id)
                        }
                        key={task.id}
                        className={`hover:bg-gray-50 transition`}
                      >
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              // loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {task.name}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              // loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {task.building}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              // loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {task.floor}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              // loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {task.flat === "-" ? task.common_area : task.flat}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              // loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {task.area || "-"}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm">
                            {task.total_work || "N/A"}{" "}
                            <span className="font-semibold">{task.unit}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm">
                            {task.work_done || "N/A"}{" "}
                            <span className="font-semibold">{task.unit}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm">
                            {task.engineer || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                            {new Date(task.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                            {new Date(task.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        {/* <td className="px-3 md:px-4 py-3">
                        <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                          {task.predicted_date
                            ? new Date(task.predicted_date).toLocaleDateString()
                            : "-"}
                        </div>
                      </td> */}
                        <td className="px-3 md:px-4 py-3">
                          <span
                            className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                              task.status.replace(" ", "_"),
                            )}`}
                          >
                            {task.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5 md:gap-2">
                            {can("update_task_progress") && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowEngineerTaskUpdateModal(true);
                                }}
                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                            {can("update_task") && (
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowUpdateModal(true);
                                }}
                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                            {can("delete_task") && (
                              <button
                                onClick={() => {
                                  deleteTask(task.id);
                                }}
                                className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {Number(expandTask) === Number(task.id) && (
                        <tr className="bg-gray-50">
                          <td colSpan={12} className="p-0">
                            <div className="px-4 py-3 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Task Progress Logs
                              </h4>

                              <div className="w-full overflow-x-auto rounded-lg border border-gray-200 bg-white">
                                <table className="w-full text-sm table-auto">
                                  {/* Header */}
                                  <thead className="bg-gray-100">
                                    <tr className="text-xs uppercase tracking-wider text-gray-600">
                                      <th className="px-4 py-2 text-left w-[280px]">
                                        Area
                                      </th>
                                      <th className="px-4 py-2 text-left w-[130px]">
                                        Total Work
                                      </th>
                                      <th className="px-4 py-2 text-left w-[130px]">
                                        Total Done
                                      </th>
                                      <th className="px-4 py-2 text-left w-[130px]">
                                        Work Done
                                      </th>
                                      <th className="px-4 py-2 text-left w-[160px]">
                                        Submitted By
                                      </th>
                                      <th className="px-4 py-2 text-left w-[160px]">
                                        Date
                                      </th>
                                      <th className="px-4 py-2 text-center w-[100px]">
                                        Action
                                      </th>
                                    </tr>
                                  </thead>

                                  {/* Body */}
                                  <tbody className="divide-y divide-gray-200">
                                    {task.logs.map((t: any, idx: number) => (
                                      <tr
                                        key={t.log_id || idx}
                                        className="hover:bg-gray-50 transition"
                                      >
                                        <td className="px-4 py-2">
                                          <div className="text-gray-800 text-sm break-words leading-5">
                                            {task.project}, {task.building},{" "}
                                            {task.floor},{" "}
                                            {task.flat !== "-"
                                              ? `${task.flat} ${task.area}`
                                              : ""}
                                            {task.common_area !== "-"
                                              ? ` ${task.common_area}`
                                              : ""}
                                          </div>
                                        </td>

                                        <td className="px-4 py-2 text-gray-700 font-medium">
                                          {task.total_work}{" "}
                                          <span className="font-semibold">
                                            {task.unit}
                                          </span>
                                        </td>

                                        <td className="px-4 py-2 text-gray-700">
                                          {task.work_done}{" "}
                                          <span className="font-semibold">
                                            {task.unit}
                                          </span>
                                        </td>

                                        <td className="px-4 py-2 font-medium text-green-600">
                                          {t.work_done}{" "}
                                          <span className="font-semibold">
                                            {task.unit}
                                          </span>
                                        </td>

                                        <td className="px-4 py-2 text-gray-700">
                                          {t.created_by}
                                        </td>
                                        <td className="px-4 py-2 text-gray-700">
                                          {new Date(
                                            t.created_at,
                                          ).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                          {can("view_task_photos") && (
                                            <button
                                              onClick={() => {
                                                setShowPhotos(true);
                                                setSelectedTaskPhotos(
                                                  t.photos || [],
                                                );
                                              }}
                                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition"
                                            >
                                              <Eye className="w-3 h-3" />
                                              View
                                            </button>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="text-center py-16 text-slate-700">
                No Data to Show
              </div>
            )}
          </div>
        </div>

        {showCreateTaskModal && (
          <CreateTask
            laodData={loadAllTask}
            projectId={selectedProjectId}
            allTasks={allTasks}
            setShowCreateTaskModal={setShowCreateTaskModal}
          />
        )}
        {showUpdateModel && (
          <UpdateTask
            taskData={selectedTask}
            setShowUpdateModal={setShowUpdateModal}
            laodData={loadAllTask}
          />
        )}
        {showEngineerTaskUpdateModel && (
          <EngineerUdateTask
            taskData={selectedTask}
            setShowUpdateModal={setShowEngineerTaskUpdateModal}
            laodData={loadAllTask}
          />
        )}

        {showPhotos && (
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
                      Task Photos
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5">
                      Task Photos for verification.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowPhotos(false);
                    setSelectedImg("");
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {selectedImg ? (
                <div className="p-4 md:p-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar relative">
                  <img
                    src={selectedImg}
                    alt="Nayash Group"
                    className="w-full h-[70vh] shadow-lg rounded-lg border border-slate-500"
                  />
                  <button
                    onClick={() => {
                      setSelectedImg("");
                    }}
                    className="p-6 bg-black opacity-60 rounded-full absolute top-0 right-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <div className="p-4 md:p-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar grid grid-cols-5">
                  {selectedTaskPhotos.map((p: any) => (
                    <div
                      onClick={() =>
                        setSelectedImg(`${import.meta.env.VITE_API_URL}${p}`)
                      }
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}${p}`}
                        alt="Nayash Group"
                        className="w-40 h-40 shadow-lg rounded-lg border border-slate-500"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
