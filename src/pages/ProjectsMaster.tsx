// // src/components/ProjectsMaster.tsx
// import { useState, useEffect } from "react";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   Building2,
//   Eye,
//   Search,
//   FileText,
//   Package,
//   Building,
//   Layers,
//   DoorOpen,
// } from "lucide-react";
// import projectApi from "../lib/projectApi";
// import CreateProjects from "../components/projectForms/CreateProjects";
// import { toast } from "sonner";
// import MySwal from "../utils/swal";
// import ViewProjectDetails from "../components/projectForms/ViewProject";
// import UpdateProject from "../components/projectForms/UpdateProject";
// import ProjectDetailsForm from "../components/projectForms/ProjectDetailsForm";
// import ProjectDetailsApi from "../lib/projectDetailsApi";

// interface ProjectFormDataLocal {
//   name: string;
//   description: string;
//   location: string;
//   start_date: string;
//   end_date: string;
//   status: string;
//   is_active?: boolean;
// }

// type ProjectLocal = ProjectFormDataLocal & { id: string };

// export default function ProjectsMaster() {
//   const [projects, setProjects] = useState<ProjectLocal[]>([]);
//   const [selectedProject, setSelectedProject] = useState();
//   const [allProjectFloorsCommonAreas, setAllProjectFloorsCommonAreas] =
//     useState([]);
//   const [selectedProjectDetails, setSelectedProjectDetails] = useState({
//     id: "",
//     name: "",
//     category: "floor",
//   });
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermForProjectDetails, setSearchTermForProjectDetails] =
//     useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [activeTab, setActiveTab] = useState<string>("project");
//   const [viewProjectDetails, setViewProjectDetails] = useState(false);
//   const [updateProjectDetails, setUpdateProjectDetails] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [deletingId, setDeletingId] = useState<string | null>(null); // show spinner per-item if desired
//   const [filteredProjects, setFilteredProjects] = useState<any>([]);
//   const [filteredProjectsDetails, setFilteredProjectsDetails] = useState<any>(
//     []
//   );

//   const [allFloors, setAllFloors] = useState<any>([]);
//   const [allCommonArea, setAllCommonArea] = useState<any>([]);

//   const [showProjectDetailsForm, setShowProjectDetailsForm] = useState(false);
//   const [formData, setFormData] = useState<ProjectFormDataLocal>({
//     name: "",
//     description: "",
//     location: "",
//     start_date: "",
//     end_date: "",
//     status: "active",
//     is_active: true,
//   });

//   const loadProjects = async () => {
//     setLoading(true);
//     try {
//       const data: any = await projectApi.getProjects();
//       if (data.success) {
//         setProjects(data.data);
//         setLoading(false);
//         return;
//       }
//       setProjects([]);
//     } catch (err) {
//       console.warn("loadProjects failed, using fallback demo data", err);
//       setProjects([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadProjectDetails = async (id: number, isEdit = false) => {
//     setLoading(true);
//     try {
//       const data: any = await projectApi.getProjectById(id);
//       if (data.success && !isEdit) {
//         setSelectedProject(data.data);
//         setViewProjectDetails(true);
//         setLoading(false);
//         return;
//       } else if (data.success && isEdit) {
//         setSelectedProject(data.data);
//         setUpdateProjectDetails(true);
//         setLoading(false);
//         return;
//       } else {
//         toast.error("Something went wrong.");
//         return;
//       }
//     } catch (err) {
//       console.warn("loadProjects failed, using fallback demo data", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadAllProjectFloorCommonAreaDetails = async () => {
//     const res: any = await ProjectDetailsApi.getAll();

//     if (Array.isArray(res)) {
//       const filteredFloors = res.filter((floor) => floor.category === "floor");
//       setAllFloors(filteredFloors || []);

//       const filteredCommonArea = res.filter(
//         (floor) => floor.category === "common area"
//       );
//       setAllCommonArea(filteredCommonArea || []);
//     }
//     setAllProjectFloorsCommonAreas(res || []);
//   };

//   useEffect(() => {
//     loadAllProjectFloorCommonAreaDetails();
//     loadProjects();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const persistProjectsSorted = (list: ProjectLocal[]) => {
//     list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
//     setProjects(list);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       description: "",
//       location: "",
//       start_date: "",
//       end_date: "",
//       status: "active",
//       is_active: true,
//     });
//     setEditingId(null);
//   };

//   const handleDelete = async (id: string) => {
//     const result: any = await MySwal.fire({
//       title: "Delete Item?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//     });

//     if (!result.isConfirmed) return;

//     setDeletingId(id);
//     // optimistic remove
//     const prev = projects;
//     persistProjectsSorted(projects.filter((p) => p.id !== id));
//     try {
//       await projectApi.deleteProject(id);
//       toast.success("Project deleted successfully!");
//     } catch (err) {
//       console.error("deleteProject failed", err);
//       toast.error("Failed deleting project. Restoring list.");
//       persistProjectsSorted(prev);
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   useEffect(() => {
//     const tempFilteredProjects = allProjectFloorsCommonAreas.filter(
//       (projectDetails: any) => {
//         if (!searchTermForProjectDetails) return true;
//         const q = searchTermForProjectDetails.toLowerCase();
//         return (
//           (projectDetails.name || "").toLowerCase().includes(q) ||
//           (projectDetails.category || "").toLowerCase().includes(q)
//         );
//       }
//     );
//     setFilteredProjectsDetails(tempFilteredProjects);
//   }, [allProjectFloorsCommonAreas, searchTermForProjectDetails]);

//   useEffect(() => {
//     const tempFilteredProjects = projects.filter((project: any) => {
//       if (!searchTerm) return true;
//       const q = searchTerm.toLowerCase();
//       return (
//         (project.name || "").toLowerCase().includes(q) ||
//         (project.location || "").toLowerCase().includes(q) ||
//         (String(project.start_date) || "").includes(q) ||
//         (project.end_date || "").toLowerCase().includes(q)
//       );
//     });

//     setFilteredProjects(tempFilteredProjects);
//   }, [projects, searchTerm]);

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       active: "bg-green-100 text-green-700",
//       completed: "bg-blue-100 text-blue-700",
//       pending: "bg-yellow-100 text-yellow-700",
//       cancelled: "bg-red-100 text-red-700",
//     };
//     return colors[status] || "bg-gray-100 text-gray-700";
//   };

//   const deleteProjectDetails = async (id: number) => {
//     const result: any = await MySwal.fire({
//       title: "Delete Item?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//     });

//     if (!result.isConfirmed) return;
//     try {
//       const res: any = await ProjectDetailsApi.delete(id);
//       if (res.status) {
//         toast.success("Data Deleted.");
//         loadAllProjectFloorCommonAreaDetails();
//       } else {
//         toast.error("Failed to Delete Data.");
//       }
//     } catch (error) {
//       toast.error("Something went wrong try again.");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading projects...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-1 sm:p-4 md:p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
//         <div className="flex flex-col sm:flex-row border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab("project")}
//             className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition ${
//               activeTab === "project"
//                 ? "text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <Building className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Projects Master</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("projectDetails")}
//             className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition ${
//               activeTab === "projectDetails"
//                 ? "text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">
//                 Project Details Master
//               </span>
//             </div>
//           </button>
//         </div>
//       </div>

//       {activeTab === "project" && (
//         <div>
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
//             <div>
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
//                 Projects Master
//               </h1>
//               <p className="text-gray-600 mt-1 text-sm sm:text-base">
//                 Manage all projects
//               </p>
//             </div>
//             <button
//               onClick={() => {
//                 resetForm();
//                 setShowModal(true);
//               }}
//               className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
//             >
//               <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Add Project</span>
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
//             <div className="relative">
//               <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by name, location or description..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
//               />
//             </div>
//           </div>

//           <div className="overflow-hidden">
//             <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
//               <table className="min-w-full border-collapse">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       Name
//                     </th>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       Location
//                     </th>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       Start Date
//                     </th>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       End Date
//                     </th>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       Status
//                     </th>
//                     <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
//                       Action
//                     </th>
//                   </tr>
//                 </thead>

//                 <tbody className="divide-y divide-gray-200">
//                   {filteredProjects.map((project: any) => (
//                     <tr key={project.id} className="hover:bg-gray-50">
//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-700 font-medium">
//                         <button
//                           onClick={() => {
//                             loadProjectDetails(project.id);
//                           }}
//                           className="hover:underline text-left truncate max-w-[120px] sm:max-w-none"
//                         >
//                           {project.name}
//                         </button>
//                       </td>

//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-800 truncate max-w-[100px] sm:max-w-none">
//                         {project.location}
//                       </td>

//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 truncate">
//                         {new Date(project.start_date).toLocaleDateString()}
//                       </td>
//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 truncate">
//                         {new Date(project.end_date).toLocaleDateString()}
//                       </td>
//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             project.status
//                           )}`}
//                         >
//                           {project.status.toUpperCase()}
//                         </span>
//                       </td>

//                       <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
//                         <div className="flex items-center space-x-1 sm:space-x-2">
//                           <button
//                             onClick={() => {
//                               loadProjectDetails(project.id);
//                             }}
//                             className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button>
//                           <button
//                             onClick={() => loadProjectDetails(project.id, true)}
//                             className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button>

//                           <button
//                             onClick={() => handleDelete(project.id)}
//                             className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {filteredProjects.length === 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 text-center mt-4 sm:mt-6">
//               <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
//                 No projects found
//               </h3>
//               <p className="text-gray-600 text-sm sm:text-base">
//                 {searchTerm
//                   ? "Try a different search term"
//                   : "Click 'Add Project' to create your first project"}
//               </p>
//             </div>
//           )}

//           {/* Modal */}
//           {showModal && (
//             <CreateProjects
//               setShowModel={setShowModal}
//               allFloors={allFloors}
//               allCommonArea={allCommonArea}
//               loadAllData={loadProjects}
//             />
//           )}
//           {viewProjectDetails && selectedProject && (
//             <ViewProjectDetails
//               projectDetails={selectedProject}
//               setViewProjectDetails={setViewProjectDetails}
//               setSelectedProject={setSelectedProject}
//             />
//           )}
//           {updateProjectDetails && selectedProject && (
//             <UpdateProject
//               setUpdateProjectDetails={setUpdateProjectDetails}
//               loadAllData={loadProjects}
//               projectData={selectedProject}
//               allCommonArea={allCommonArea}
//               allFloors={allFloors}
//             />
//           )}
//         </div>
//       )}

//       {activeTab === "projectDetails" && (
//         <div>
//           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
//             <div>
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
//                 Project Details Master
//               </h1>
//               <p className="text-gray-600 mt-1 text-sm sm:text-base">
//                 Manage Project Details
//               </p>
//             </div>
//             <button
//               onClick={() => {
//                 setShowProjectDetailsForm(true);
//               }}
//               className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
//             >
//               <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Add Project Details</span>
//             </button>
//           </div>

//           <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
//             <div className="relative">
//               <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by name, location or description..."
//                 value={searchTermForProjectDetails}
//                 onChange={(e) => setSearchTermForProjectDetails(e.target.value)}
//                 className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//             {filteredProjectsDetails.map((project: any) => (
//               <div
//                 key={project.id}
//                 className="hover:bg-gray-50 border border-slate-300 shadow-lg rounded-xl"
//               >
//                 <div className="flex justify-between items-center">
//                   <h1 className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold truncate">
//                     {project.name}
//                   </h1>
//                   <div className="px-4 sm:px-6 py-2 sm:py-3">
//                     <button
//                       onClick={() => {
//                         setSelectedProjectDetails(project);
//                         setUpdateProjectDetails(true);
//                         setShowProjectDetailsForm(true);
//                       }}
//                       className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                       title="Edit"
//                     >
//                       <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     </button>

//                     <button
//                       onClick={() => deleteProjectDetails(project.id)}
//                       className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
//                     </button>
//                   </div>
//                 </div>
//                 <div className="px-4 sm:px-6 py-2 sm:py-3 text-sm text-gray-800 flex items-center">
//                   <div
//                     className={`mr-2 ${
//                       project.category === "floor"
//                         ? "bg-green-200"
//                         : "bg-blue-200"
//                     } p-1 rounded-lg`}
//                   >
//                     {project.category === "floor" ? (
//                       <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
//                     ) : (
//                       <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
//                     )}
//                   </div>
//                   <span className="text-xs sm:text-sm">
//                     {" "}
//                     {(project.category || "").toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {filteredProjects.length === 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 text-center mt-4 sm:mt-6">
//               <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
//               <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
//                 No projects found
//               </h3>
//               <p className="text-gray-600 text-sm sm:text-base">
//                 {searchTerm
//                   ? "Try a different search term"
//                   : "Click 'Add Project' to create your first project"}
//               </p>
//             </div>
//           )}
//           {showProjectDetailsForm && (
//             <ProjectDetailsForm
//               setShowModel={setShowProjectDetailsForm}
//               title={
//                 updateProjectDetails
//                   ? "Update Project Details"
//                   : "Add Project Details"
//               }
//               initialData={selectedProjectDetails}
//               isEdit={updateProjectDetails}
//               loadAllData={loadAllProjectFloorCommonAreaDetails}
//               setUpdateProjectDetails={setUpdateProjectDetails}
//               setSelectedProjectDetails={setSelectedProjectDetails}
//             />
//           )}
//         </div>
//       )}
//     </div>
//   );
// }



// src/components/ProjectsMaster.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Eye,
  Search,
  FileText,
  Package,
  Building,
  Layers,
  DoorOpen,
  Filter,
  X,
} from "lucide-react";
import projectApi from "../lib/projectApi";
import CreateProjects from "../components/projectForms/CreateProjects";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import ViewProjectDetails from "../components/projectForms/ViewProject";
import UpdateProject from "../components/projectForms/UpdateProject";
import ProjectDetailsForm from "../components/projectForms/ProjectDetailsForm";
import ProjectDetailsApi from "../lib/projectDetailsApi";

interface ProjectFormDataLocal {
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active?: boolean;
}

type ProjectLocal = ProjectFormDataLocal & { id: string };

export default function ProjectsMaster() {
  const [projects, setProjects] = useState<ProjectLocal[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>();
  const [allProjectFloorsCommonAreas, setAllProjectFloorsCommonAreas] = useState<any[]>([]);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState({
    id: "",
    name: "",
    category: "floor",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermForProjectDetails, setSearchTermForProjectDetails] = useState("");
  
  // Column search states for projects
  const [searchName, setSearchName] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  
  // Column search states for project details
  const [searchDetailsName, setSearchDetailsName] = useState("");
  const [searchDetailsCategory, setSearchDetailsCategory] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("project");
  const [viewProjectDetails, setViewProjectDetails] = useState(false);
  const [updateProjectDetails, setUpdateProjectDetails] = useState(false);
  
  // Checkbox states for bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedDetailItems, setSelectedDetailItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllDetails, setSelectAllDetails] = useState(false);
  
  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Filter states
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [ignoreDate, setIgnoreDate] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<ProjectLocal[]>([]);
  const [filteredProjectsDetails, setFilteredProjectsDetails] = useState<any[]>([]);

  const [allFloors, setAllFloors] = useState<any[]>([]);
  const [allCommonArea, setAllCommonArea] = useState<any[]>([]);

  const [showProjectDetailsForm, setShowProjectDetailsForm] = useState(false);
  const [formData, setFormData] = useState<ProjectFormDataLocal>({
    name: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    status: "active",
    is_active: true,
  });

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjects();
      if (data.success) {
        setProjects(data.data);
        setFilteredProjects(data.data);
        setLoading(false);
        return;
      }
      setProjects([]);
      setFilteredProjects([]);
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
      toast.error("Failed to load projects");
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (id: string, isEdit = false) => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjectById(id);
      if (data.success && !isEdit) {
        setSelectedProject(data.data);
        setViewProjectDetails(true);
        setLoading(false);
        return;
      } else if (data.success && isEdit) {
        setSelectedProject(data.data);
        setUpdateProjectDetails(true);
        setLoading(false);
        return;
      } else {
        toast.error("Failed to load project details");
        return;
      }
    } catch (err) {
      console.warn("loadProjects failed", err);
      toast.error("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  const loadAllProjectFloorCommonAreaDetails = async () => {
    try {
      const res: any = await ProjectDetailsApi.getAll();
      if (Array.isArray(res)) {
        const filteredFloors = res.filter((floor) => floor.category === "floor");
        setAllFloors(filteredFloors || []);

        const filteredCommonArea = res.filter(
          (floor) => floor.category === "common area"
        );
        setAllCommonArea(filteredCommonArea || []);
        
        setAllProjectFloorsCommonAreas(res || []);
        setFilteredProjectsDetails(res || []);
      }
    } catch (err) {
      console.warn("Failed to load project details", err);
      toast.error("Failed to load project details");
    }
  };

  useEffect(() => {
    loadAllProjectFloorCommonAreaDetails();
    loadProjects();
  }, []);

  useEffect(() => {
    let filtered = [...projects];

    // Column searches for projects
    if (searchName) {
      filtered = filtered.filter((project) =>
        (project.name || "").toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchLocation) {
      filtered = filtered.filter((project) =>
        (project.location || "").toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    if (searchStatus) {
      filtered = filtered.filter((project) =>
        (project.status || "").toLowerCase().includes(searchStatus.toLowerCase())
      );
    }

    // Date filters
    if (!ignoreDate) {
      if (filterFromDate) {
        filtered = filtered.filter((project) => {
          const projectDate = new Date(project.start_date);
          const fromDate = new Date(filterFromDate);
          return projectDate >= fromDate;
        });
      }

      if (filterToDate) {
        filtered = filtered.filter((project) => {
          const projectDate = new Date(project.start_date);
          const toDate = new Date(filterToDate);
          toDate.setHours(23, 59, 59, 999);
          return projectDate <= toDate;
        });
      }
    }

    // Global search (for backward compatibility)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((project) =>
        (project.name || "").toLowerCase().includes(q) ||
        (project.location || "").toLowerCase().includes(q) ||
        (project.description || "").toLowerCase().includes(q)
      );
    }

    setFilteredProjects(filtered);
  }, [projects, searchName, searchLocation, searchStatus, filterFromDate, filterToDate, ignoreDate, searchTerm]);

  useEffect(() => {
    let filtered = [...allProjectFloorsCommonAreas];

    // Column searches for project details
    if (searchDetailsName) {
      filtered = filtered.filter((detail) =>
        (detail.name || "").toLowerCase().includes(searchDetailsName.toLowerCase())
      );
    }

    if (searchDetailsCategory) {
      filtered = filtered.filter((detail) =>
        (detail.category || "").toLowerCase().includes(searchDetailsCategory.toLowerCase())
      );
    }

    // Global search (for backward compatibility)
    if (searchTermForProjectDetails) {
      const q = searchTermForProjectDetails.toLowerCase();
      filtered = filtered.filter((detail) =>
        (detail.name || "").toLowerCase().includes(q) ||
        (detail.category || "").toLowerCase().includes(q)
      );
    }

    setFilteredProjectsDetails(filtered);
  }, [allProjectFloorsCommonAreas, searchDetailsName, searchDetailsCategory, searchTermForProjectDetails]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      status: "active",
      is_active: true,
    });
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Project?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await projectApi.deleteProject(id);
      toast.success("Project deleted successfully!");
      await loadProjects();
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    } catch (err) {
      console.error("deleteProject failed", err);
      toast.error("Failed to delete project");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select projects to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedItems.size} Project(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Delete (${selectedItems.size})`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => projectApi.deleteProject(id))
      );
      toast.success(`${selectedItems.size} project(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadProjects();
    } catch (error) {
      console.error("Error deleting projects:", error);
      toast.error("Failed to delete projects");
    }
  };

  const deleteProjectDetails = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;
    
    try {
      const res: any = await ProjectDetailsApi.delete(id);
      if (res.status) {
        toast.success("Project detail deleted successfully!");
        loadAllProjectFloorCommonAreaDetails();
        setSelectedDetailItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      } else {
        toast.error("Failed to delete project detail");
      }
    } catch (error) {
      console.error("Error deleting project detail:", error);
      toast.error("Something went wrong, please try again.");
    }
  };

  const handleBulkDeleteDetails = async () => {
    if (selectedDetailItems.size === 0) {
      toast.error("Please select items to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedDetailItems.size} Item(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Delete (${selectedDetailItems.size})`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        Array.from(selectedDetailItems).map((id) => ProjectDetailsApi.delete(id))
      );
      toast.success(`${selectedDetailItems.size} item(s) deleted successfully!`);
      setSelectedDetailItems(new Set());
      setSelectAllDetails(false);
      await loadAllProjectFloorCommonAreaDetails();
    } catch (error) {
      console.error("Error deleting items:", error);
      toast.error("Failed to delete items");
    }
  };

  // Checkbox handlers for projects
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredProjects.map((project) => project.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredProjects.length);
  };

  // Checkbox handlers for project details
  const handleSelectAllDetails = () => {
    if (selectAllDetails) {
      setSelectedDetailItems(new Set());
    } else {
      const allIds = new Set(filteredProjectsDetails.map((detail) => detail.id));
      setSelectedDetailItems(allIds);
    }
    setSelectAllDetails(!selectAllDetails);
  };

  const handleSelectDetailItem = (id: string) => {
    const newSelected = new Set(selectedDetailItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDetailItems(newSelected);
    setSelectAllDetails(newSelected.size === filteredProjectsDetails.length);
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

  const resetFilters = () => {
    setFilterFromDate("");
    setFilterToDate("");
    setIgnoreDate(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 sm:p-4 md:p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 sm:mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          <button
            onClick={() => setActiveTab("project")}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition ${
              activeTab === "project"
                ? "text-red-600 border-b-2 sm:border-b-2 border-red-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Projects Master</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("projectDetails")}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition ${
              activeTab === "projectDetails"
                ? "text-red-600 border-b-2 sm:border-b-2 border-red-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">
                Project Details Master
              </span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === "project" && (
        <div>
          {/* Header with Actions */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Projects Master
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage all projects
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilterSidebar(true)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2 font-medium shadow-sm text-sm"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              {selectedItems.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete ({selectedItems.size})
                </button>
              )}
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-[#C62828] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-500 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Add Project</span>
              </button>
            </div>
          </div>

          {/* Main Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-200 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-center w-16">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Project Name
                      </div>
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Location
                      </div>
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Start Date
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        End Date
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                        Status
                      </div>
                      <input
                        type="text"
                        placeholder="Search status..."
                        value={searchStatus}
                        onChange={(e) => setSearchStatus(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project) => {
                    const isSelected = selectedItems.has(project.id);
                    return (
                      <tr
                        key={project.id}
                        className={`hover:bg-gray-50 transition ${
                          isSelected ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(project.id)}
                            className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left"
                          >
                            {project.name}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800">
                            {project.location || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800">
                            {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-800">
                            {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {project.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                loadProjectDetails(project.id);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => loadProjectDetails(project.id, true)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
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

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    No Projects Found
                  </h3>
                  <p className="text-gray-600">
                    {searchName || searchLocation || searchStatus || searchTerm
                      ? "Try a different search term"
                      : "No projects available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "projectDetails" && (
        <div>
          {/* Header with Actions */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Project Details Master
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage Project Details
              </p>
            </div>
            <div className="flex gap-3">
              {selectedDetailItems.size > 0 && (
                <button
                  onClick={handleBulkDeleteDetails}
                  className="bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 font-medium shadow-sm"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete ({selectedDetailItems.size})
                </button>
              )}
              <button
                onClick={() => {
                  setShowProjectDetailsForm(true);
                  setUpdateProjectDetails(false);
                  setSelectedProjectDetails({
                    id: "",
                    name: "",
                    category: "floor",
                  });
                }}
                className="bg-[#C62828] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-red-500 transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-sm sm:text-base">Add Project Details</span>
              </button>
            </div>
          </div>

          {/* Project Details Grid/Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-4">
            <div className="p-4 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Name
                  </div>
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchDetailsName}
                    onChange={(e) => setSearchDetailsName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Category
                  </div>
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={searchDetailsCategory}
                    onChange={(e) => setSearchDetailsCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProjectsDetails.map((project) => {
              const isSelected = selectedDetailItems.has(project.id);
              return (
                <div
                  key={project.id}
                  className={`border rounded-xl shadow-sm hover:shadow-md transition ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-slate-300"
                  }`}
                >
                  <div className="flex justify-between items-center p-4 border-b">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectDetailItem(project.id)}
                        className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                      <h1 className="text-sm font-semibold truncate">
                        {project.name}
                      </h1>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedProjectDetails(project);
                          setUpdateProjectDetails(true);
                          setShowProjectDetailsForm(true);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteProjectDetails(project.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg ${
                          project.category === "floor"
                            ? "bg-green-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {project.category === "floor" ? (
                          <Layers className="w-4 h-4 text-green-700" />
                        ) : (
                          <DoorOpen className="w-4 h-4 text-blue-700" />
                        )}
                      </div>
                      <span className="text-xs font-medium">
                        {project.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProjectsDetails.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center mt-6">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Project Details Found
              </h3>
              <p className="text-gray-600">
                {searchDetailsName || searchDetailsCategory || searchTermForProjectDetails
                  ? "Try a different search term"
                  : "No project details available"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Filter Sidebar */}
      {showFilterSidebar && activeTab === "project" && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterSidebar(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
                >
                  Reset
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
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ignoreDate"
                  checked={ignoreDate}
                  onChange={(e) => {
                    setIgnoreDate(e.target.checked);
                    if (e.target.checked) {
                      setFilterFromDate("");
                      setFilterToDate("");
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ignoreDate" className="text-sm text-gray-700 cursor-pointer">
                  Ignore Date
                </label>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <CreateProjects
          setShowModel={setShowModal}
          allFloors={allFloors}
          allCommonArea={allCommonArea}
          loadAllData={loadProjects}
        />
      )}
      {viewProjectDetails && selectedProject && (
        <ViewProjectDetails
          projectDetails={selectedProject}
          setViewProjectDetails={setViewProjectDetails}
          setSelectedProject={setSelectedProject}
        />
      )}
      {updateProjectDetails && selectedProject && (
        <UpdateProject
          setUpdateProjectDetails={setUpdateProjectDetails}
          loadAllData={loadProjects}
          projectData={selectedProject}
          allCommonArea={allCommonArea}
          allFloors={allFloors}
        />
      )}
      {showProjectDetailsForm && (
        <ProjectDetailsForm
          setShowModel={setShowProjectDetailsForm}
          title={
            updateProjectDetails
              ? "Update Project Details"
              : "Add Project Details"
          }
          initialData={selectedProjectDetails}
          isEdit={updateProjectDetails}
          loadAllData={loadAllProjectFloorCommonAreaDetails}
          setUpdateProjectDetails={setUpdateProjectDetails}
          setSelectedProjectDetails={setSelectedProjectDetails}
        />
      )}
    </div>
  );
}