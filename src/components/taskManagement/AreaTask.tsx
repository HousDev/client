// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Trash2,
//   Edit2,
// } from "lucide-react";
// import { useAuth } from "../../contexts/AuthContext";

// // Backend API calls for Area Tasks
// import AreaTasksApifrom from "../../lib/areaTasksApi";

// // Use only projectApi since it contains nested data
// import projectApi from "../../lib/projectApi";
// import { UsersApi } from "../../lib/Api";
// import { FaLeftLong } from "react-icons/fa6";
// import { toast } from "sonner";
// import AreaSubTasksApi from "../../lib/subTaskApi";
// import React from "react";
// import CreateTask from "./CreateTask";
// import UpdateTask from "./UpdateTask";

// interface AreaFormData {
//   id?: string;
//   project_id: number | string | null;
//   building_id: number | string | null;
//   floor_id: number | string | null;
//   flat_id: number | string | null;
//   common_area_id: number | string | null;
//   assigned_engineer: number | string | null;
//   start_date: string;
//   expected_end_date: string;
//   progress: number;
//   status: string;
//   is_active: boolean;
//   created_by?: string | null;

//   // Display fields (from joins)
//   project_name?: string;
//   building_name?: string;
//   floor_name?: string;
//   flat_name?: string;
//   common_area_name?: string;
//   assigned_engineer_name?: string;
//   created_by_name?: string;
//   expanded: boolean;
//   tasks: any;
// }

// interface ProjectData {
//   id: string | number;
//   name: string;
//   description?: string;
//   location?: string;
//   start_date?: string;
//   end_date?: string;
//   status: string;
//   is_active?: boolean;
//   buildings?: BuildingData[];
// }

// interface BuildingData {
//   id: string | number;
//   project_id: string | number;
//   building_name: string;
//   status: string;
//   progress_percentage: string;
//   floors?: FloorData[];
// }

// interface FloorData {
//   id: string | number;
//   building_id: string | number;
//   floor_name: string;
//   status: string;
//   progress_percentage: string;
//   flats?: FlatData[];
//   common_areas?: CommonAreaData[];
// }

// interface FlatData {
//   id: string | number;
//   floor_id: string | number;
//   flat_name: string;
//   status: string;
//   progress_percentage: string;
//   workflow?: any[];
// }

// interface CommonAreaData {
//   id: string | number;
//   floor_id: string | number;
//   common_area_name: string;
//   status: string;
//   progress_percentage: string;
//   workflow?: any[];
// }

// const defaultFormData: AreaFormData = {
//   project_id: null,
//   building_id: null,
//   floor_id: null,
//   flat_id: null,
//   common_area_id: null,
//   assigned_engineer: null,
//   start_date: new Date().toISOString().split("T")[0],
//   expected_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
//     .toISOString()
//     .split("T")[0],
//   progress: 0,
//   status: "pending",
//   is_active: true,
//   created_by: null,
//   tasks: [],
//   expanded: false,
// };

// interface SubTaskType {
//   id?: string | number | null;
//   area_task_id: string | number | null;
//   name: string | null;
//   unit: string | null;
//   start_date: string;
//   end_date: string;
//   total_work: string | null;
//   progress: string | null;
//   status: string | null;
// }

// export default function AreaTasks({
//   selectedProjectId,
//   setSelectedProjectId,
// }: {
//   selectedProjectId: number;
//   setSelectedProjectId: React.Dispatch<React.SetStateAction<number | null>>;
// }) {
//   const { user } = useAuth();
//   const [areaTasks, setAreaTasks] = useState<AreaFormData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedTask, setSelectedTask] = useState<any>();

//   const [allTasks, setAllTasks] = useState<any>([]);
//   const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
//     null,
//   );
//   const [showUpdateModel, setShowUpdateModal] = useState<boolean>(false);
//   const [buildings, setBuildings] = useState<BuildingData[]>([]);
//   const [floors, setFloors] = useState<FloorData[]>([]);
//   const [flats, setFlats] = useState<FlatData[]>([]);
//   const [commonAreas, setCommonAreas] = useState<CommonAreaData[]>([]);
//   const [engineers, setEngineers] = useState<any[]>([]);
//   const [searchFilters, setSearchFilters] = useState({
//     name: "",
//     location: "",
//     status: "",
//     startDate: "",
//     endDate: "",
//   });

//   // Modal states
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | number | null>(null);

//   // Filter states
//   const [showFilterSidebar, setShowFilterSidebar] = useState(false);
//   const [filters, setFilters] = useState({
//     project_id: "",
//     building_id: "",
//     floor_id: "",
//     flat_id: "",
//     common_area_id: "",
//     assigned_engineer: "",
//     status: "",
//     is_active: "",
//   });

//   const [showCreateTaskModal, setShowCreateTaskModal] =
//     useState<boolean>(false);

//   const loadProjectDetails = async () => {
//     try {
//       const project: any = await projectApi.getProjectById(selectedProjectId);
//       console.log("this is project details", project.data);
//       setSelectedProject(project.data || []);
//       setBuildings(
//         Array.isArray(project.data.buildings) ? project.data.buildings : [],
//       );
//       setFloors(
//         Array.isArray(project.data.buildings.floors)
//           ? project.data.buildings.floors
//           : [],
//       );
//       setFlats(
//         Array.isArray(project.data.buildings.floors.flats)
//           ? project.data.buildings.floors.flats
//           : [],
//       );
//       setCommonAreas(
//         Array.isArray(project.data.buildings.floors.common_areas)
//           ? project.data.buildings.floors.common_areas
//           : [],
//       );
//     } catch (error) {
//       console.error("Error loading project details:", error);
//       setSelectedProject(null);
//       setBuildings([]);
//       setFloors([]);
//       setFlats([]);
//       setCommonAreas([]);
//     }
//   };

//   useEffect(() => {
//     console.log("from use effect", selectedProject);
//   }, [selectedProject]);

//   const loadAllTask = async () => {
//     try {
//       const project: any = await projectApi.getProjectById(selectedProjectId);
//       const taskRes: any =
//         await AreaSubTasksApi.getSubTasksByProjectId(selectedProjectId);

//       const users = await UsersApi.list();
//       const filteredUsers = users.filter((u: any) => u.role === "engineer");

//       console.log(taskRes);
//       const projectData = project.data;

//       const normalizedTasks = taskRes.map((t: any) => {
//         const building = projectData?.buildings?.find(
//           (b: any) => b.id === t.building_id,
//         );

//         const floor = building?.floors?.find((f: any) => f.id === t.floor_id);

//         const flat = t.flat_id
//           ? floor?.flats?.find((fl: any) => fl.id === t.flat_id)
//           : null;

//         const area = t.area_id
//           ? flat?.areas.find((fl: any) => fl.id === t.area_id)
//           : null;

//         const common_area = t.common_area_id
//           ? floor?.common_areas?.find((ca: any) => ca.id === t.common_area_id)
//           : null;
//         const engineer = filteredUsers.find(
//           (fu: any) => fu.id === t.engineer_id,
//         );

//         return {
//           ...t,
//           building: building?.building_name || "-",
//           floor: floor?.floor_name || "-",
//           flat: flat?.flat_name || "-",
//           common_area: common_area?.common_area_name || "-",
//           area: area?.name || "-",
//           engineer: engineer?.full_name,
//         };
//       });

//       setAllTasks(normalizedTasks);
//     } catch (error) {
//       console.error("Error loading tasks:", error);
//       toast.error("Something went wrong while fetching Tasks.");
//     }
//   };

//   useEffect(() => {
//     loadAllTask();
//   }, []);

//   const loadEngineers = async () => {
//     try {
//       const data: any = await UsersApi.getByRole("user");

//       console.log("data", data);
//       setEngineers(data);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     loadEngineers();
//     loadProjectDetails();
//     loadData();
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       const rows: any =
//         await AreaTasksApifrom.getAreaTasksByProjectId(selectedProjectId);
//       const subTasksRes = await AreaSubTasksApi.getSubTasks();
//       console.log("sub task res", subTasksRes);
//       console.log(rows, "hellow");
//       // Sort by start date (newest first)
//       const data = rows.data;
//       data.sort(
//         (a: any, b: any) =>
//           new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
//       );
//       console.log(data);

//       const normalized = data.map((r: any) => ({
//         ...r,
//         id: String(r.id),
//         project_id: r.project_id || null,
//         building_id: r.building_id || null,
//         floor_id: r.floor_id || null,
//         flat_id: r.flat_id || null,
//         common_area_id: r.common_area_id || null,
//         assigned_engineer: r.assigned_engineer || null,
//         is_active: Boolean(r.is_active),
//         tasks: subTasksRes.filter(
//           (d: any) => Number(d.area_task_id) === Number(r.id),
//         ),
//         expanded: false,
//       }));
//       console.log(normalized);
//       setAreaTasks(normalized);
//     } catch (err) {
//       console.error("loadData error", err);
//       setAreaTasks([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       active: "bg-green-100 text-green-700",
//       completed: "bg-blue-100 text-blue-700",
//       pending: "bg-yellow-100 text-yellow-700",
//       cancelled: "bg-red-100 text-red-700",
//     };
//     return colors[status] || "bg-gray-100 text-gray-700";
//   };

//   const deleteTask = async (id: number) => {
//     try {
//       await AreaSubTasksApi.deleteSubTask(id);
//       loadAllTask();
//       toast.success("Task Deleted Successfully.");
//     } catch (error) {
//       toast.error("Something went wrong while deleting task.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading area tasks...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3">
//       {/* Header with Actions */}

//       <button
//         className="flex items-center font-semibold"
//         onClick={() => setSelectedProjectId(null)}
//       >
//         <FaLeftLong className="mr-3" />
//         Back to Projects
//       </button>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">Project Tasks</h1>
//         <button
//           onClick={() => {
//             setShowCreateTaskModal(true);
//           }}
//           className="bg-[#C62828] text-white px-3 py-2 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-4 h-4" />
//           Create Task
//         </button>
//       </div>

//       <div>
//         <table className="w-full min-w-[800px]">
//           <thead className="bg-gray-200 border-b border-gray-200">
//             {/* Header Row */}
//             <tr>
//               {/* <th className="px-3 md:px-4 py-2 text-center w-16">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Select
//                 </div>
//               </th> */}
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Task
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-center w-16">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Building
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-center w-16">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Floor
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-center w-16">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Flat/Common Area
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-center w-16">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Area
//                 </div>
//               </th>

//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Total Work
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Work Done
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Assigned To
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Start Date
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   End Date
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Predicted End Date
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Status
//                 </div>
//               </th>
//               <th className="px-3 md:px-4 py-2 text-left">
//                 <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                   Actions
//                 </div>
//               </th>
//             </tr>

//             {/* <tr className="bg-gray-50 border-b border-gray-200">
//               <td className="px-3 md:px-4 py-1 text-center">
//                 <input
//                   type="checkbox"
//                   checked={selectAll}
//                   onChange={handleSelectAll}
//                   className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                 />
//               </td>

//               <td className="px-3 md:px-4 py-1">
//                 <input
//                   type="text"
//                   placeholder="Search name..."
//                   value={searchFilters.name}
//                   onChange={(e) =>
//                     handleProjectSearchFilterChange("name", e.target.value)
//                   }
//                   className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </td>

//               <td className="px-3 md:px-4 py-1">
//                 <input
//                   type="text"
//                   placeholder="Search location..."
//                   value={searchFilters.location}
//                   onChange={(e) =>
//                     handleProjectSearchFilterChange("location", e.target.value)
//                   }
//                   className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </td>

//               <td className="px-3 md:px-4 py-1">
//                 <input
//                   type="text"
//                   placeholder="Search start date..."
//                   value={searchFilters.startDate}
//                   onChange={(e) =>
//                     handleProjectSearchFilterChange("startDate", e.target.value)
//                   }
//                   className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </td>

//               <td className="px-3 md:px-4 py-1">
//                 <input
//                   type="text"
//                   placeholder="Search end date..."
//                   value={searchFilters.endDate}
//                   onChange={(e) =>
//                     handleProjectSearchFilterChange("endDate", e.target.value)
//                   }
//                   className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </td>

//               <td className="px-3 md:px-4 py-1">
//                 <input
//                   type="text"
//                   placeholder="Search status..."
//                   value={searchFilters.status}
//                   onChange={(e) =>
//                     handleProjectSearchFilterChange("status", e.target.value)
//                   }
//                   className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </td>
//               <td className="px-3 md:px-4 py-1 text-center">
//                 <button
//                   onClick={() => setShowFilterSidebar(true)}
//                   className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
//                   title="Advanced Filters"
//                 >
//                   <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
//                   Filters
//                 </button>
//               </td>
//             </tr> */}
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {allTasks.map((task: any) => {
//               return (
//                 <tr key={task.id} className={`hover:bg-gray-50 transition `}>
//                   {/* <td className="px-3 md:px-4 py-3 text-center">
//                     <input
//                       type="checkbox"
//                       // onChange={() => handleSelectItem(project.id)}
//                       className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                     />
//                   </td> */}
//                   <td className="px-3 md:px-4 py-3">
//                     <button
//                       onClick={() => {
//                         // loadProjectDetails(project.id);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
//                     >
//                       {task.name}
//                     </button>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <button
//                       onClick={() => {
//                         // loadProjectDetails(project.id);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
//                     >
//                       {task.building}
//                     </button>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <button
//                       onClick={() => {
//                         // loadProjectDetails(project.id);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
//                     >
//                       {task.floor}
//                     </button>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <button
//                       onClick={() => {
//                         // loadProjectDetails(project.id);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
//                     >
//                       {task.flat === "-" ? task.common_area : task.flat}
//                     </button>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <button
//                       onClick={() => {
//                         // loadProjectDetails(project.id);
//                       }}
//                       className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
//                     >
//                       {task.area || "-"}
//                     </button>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm">
//                       {task.total_work || "N/A"}{" "}
//                       <span className="font-semibold">{task.unit}</span>
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm">
//                       {task.work_done || "N/A"}{" "}
//                       <span className="font-semibold">{task.unit}</span>
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm">
//                       {task.engineer || "N/A"}
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
//                       {new Date(task.start_date).toLocaleDateString()}
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
//                       {new Date(task.end_date).toLocaleDateString()}
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
//                       {task.predicted_date
//                         ? new Date(task.predicted_date).toLocaleDateString()
//                         : "-"}
//                     </div>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <span
//                       className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
//                         task.status,
//                       )}`}
//                     >
//                       {task.status.toUpperCase()}
//                     </span>
//                   </td>
//                   <td className="px-3 md:px-4 py-3">
//                     <div className="flex items-center justify-center gap-1.5 md:gap-2">
//                       <button
//                         onClick={() => {
//                           setSelectedTask(task);
//                           setShowUpdateModal(true);
//                         }}
//                         className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                         title="Edit"
//                       >
//                         <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                       </button>
//                       <button
//                         onClick={() => {
//                           deleteTask(task.id);
//                         }}
//                         className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//         {allTasks.length === 0 && (
//           <div className="text-center py-16 text-slate-700">
//             No Data to Show
//           </div>
//         )}

//         {showCreateTaskModal && (
//           <CreateTask
//             laodData={loadAllTask}
//             projectId={selectedProjectId}
//             setShowCreateTaskModal={setShowCreateTaskModal}
//           />
//         )}
//         {showUpdateModel && (
//           <UpdateTask
//             taskData={selectedTask}
//             setShowUpdateModal={setShowUpdateModal}
//             laodData={loadAllTask}
//           />
//         )}
//       </div>

//       <style>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 3px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #c62828;
//           border-radius: 3px;
//         }
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #b71c1c;
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(10px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// Backend API calls for Area Tasks
import AreaTasksApifrom from "../../lib/areaTasksApi";

// Use only projectApi since it contains nested data
import projectApi from "../../lib/projectApi";
import { UsersApi } from "../../lib/Api";
import { FaLeftLong } from "react-icons/fa6";
import { toast } from "sonner";
import AreaSubTasksApi from "../../lib/subTaskApi";
import React from "react";
import CreateTask from "./CreateTask";
import UpdateTask from "./UpdateTask";

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
  const [selectedTask, setSelectedTask] = useState<any>();

  const [allTasks, setAllTasks] = useState<any>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  const [showUpdateModel, setShowUpdateModal] = useState<boolean>(false);
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

  const [showCreateTaskModal, setShowCreateTaskModal] =
    useState<boolean>(false);

  const loadProjectDetails = async () => {
    try {
      const project: any = await projectApi.getProjectById(selectedProjectId);
      console.log("this is project details", project.data);
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
      const taskRes: any =
        await AreaSubTasksApi.getSubTasksByProjectId(selectedProjectId);

      const users = await UsersApi.list();
      const filteredUsers = users.filter((u: any) => u.role === "engineer");

      console.log(taskRes);
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
          building: building?.building_name || "-",
          floor: floor?.floor_name || "-",
          flat: flat?.flat_name || "-",
          common_area: common_area?.common_area_name || "-",
          area: area?.name || "-",
          engineer: engineer?.full_name,
        };
      });

      setAllTasks(normalizedTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Something went wrong while fetching Tasks.");
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
    loadData();
  }, []);

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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
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
        (task.building || "").toLowerCase().includes(searchBuilding.toLowerCase())) &&
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
        (task.engineer || "").toLowerCase().includes(searchEngineer.toLowerCase())) &&
      (searchStartDate === "" ||
        (task.start_date || "").includes(searchStartDate)) &&
      (searchEndDate === "" ||
        (task.end_date || "").includes(searchEndDate)) &&
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
          <button
            onClick={() => {
              setShowCreateTaskModal(true);
            }}
            className="bg-[#C62828] text-white px-3 py-2 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Task
          </button>
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
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </div>
                  </th>
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
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search predicted..."
                      value={searchPredictedDate}
                      onChange={(e) => setSearchPredictedDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
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
                    <tr key={task.id} className={`hover:bg-gray-50 transition`}>
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
                      <td className="px-3 md:px-4 py-3">
                        <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                          {task.predicted_date
                            ? new Date(task.predicted_date).toLocaleDateString()
                            : "-"}
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                            task.status,
                          )}`}
                        >
                          {task.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
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
                          <button
                            onClick={() => {
                              deleteTask(task.id);
                            }}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
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
      </div>
    </div>
  );
}