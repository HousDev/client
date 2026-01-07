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
  const [selectedProject, setSelectedProject] = useState();
  const [allProjectFloorsCommonAreas, setAllProjectFloorsCommonAreas] =
    useState([]);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState({
    id: "",
    name: "",
    category: "floor",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermForProjectDetails, setSearchTermForProjectDetails] =
    useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("project");
  const [viewProjectDetails, setViewProjectDetails] = useState(false);
  const [updateProjectDetails, setUpdateProjectDetails] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null); // show spinner per-item if desired
  const [filteredProjects, setFilteredProjects] = useState<any>([]);
  const [filteredProjectsDetails, setFilteredProjectsDetails] = useState<any>(
    []
  );

  const [allFloors, setAllFloors] = useState<any>([]);
  const [allCommonArea, setAllCommonArea] = useState<any>([]);

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
        setLoading(false);
        return;
      }
      setProjects([]);
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (id: number, isEdit = false) => {
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
        toast.error("Something went wrong.");
        return;
      }
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllProjectFloorCommonAreaDetails = async () => {
    const res: any = await ProjectDetailsApi.getAll();

    if (Array.isArray(res)) {
      const filteredFloors = res.filter((floor) => floor.category === "floor");
      setAllFloors(filteredFloors || []);

      const filteredCommonArea = res.filter(
        (floor) => floor.category === "common area"
      );
      setAllCommonArea(filteredCommonArea || []);
    }
    setAllProjectFloorsCommonAreas(res || []);
  };

  useEffect(() => {
    loadAllProjectFloorCommonAreaDetails();
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistProjectsSorted = (list: ProjectLocal[]) => {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    setProjects(list);
  };

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
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    // optimistic remove
    const prev = projects;
    persistProjectsSorted(projects.filter((p) => p.id !== id));
    try {
      await projectApi.deleteProject(id);
      toast.success("Project deleted successfully!");
    } catch (err) {
      console.error("deleteProject failed", err);
      toast.error("Failed deleting project. Restoring list.");
      persistProjectsSorted(prev);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const tempFilteredProjects = allProjectFloorsCommonAreas.filter(
      (projectDetails: any) => {
        if (!searchTermForProjectDetails) return true;
        const q = searchTermForProjectDetails.toLowerCase();
        return (
          (projectDetails.name || "").toLowerCase().includes(q) ||
          (projectDetails.category || "").toLowerCase().includes(q)
        );
      }
    );
    setFilteredProjectsDetails(tempFilteredProjects);
  }, [allProjectFloorsCommonAreas, searchTermForProjectDetails]);

  useEffect(() => {
    const tempFilteredProjects = projects.filter((project: any) => {
      if (!searchTerm) return true;
      const q = searchTerm.toLowerCase();
      return (
        (project.name || "").toLowerCase().includes(q) ||
        (project.location || "").toLowerCase().includes(q) ||
        (String(project.start_date) || "").includes(q) ||
        (project.end_date || "").toLowerCase().includes(q)
      );
    });

    setFilteredProjects(tempFilteredProjects);
  }, [projects, searchTerm]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      pending: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const deleteProjectDetails = async (id: number) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;
    try {
      const res: any = await ProjectDetailsApi.delete(id);
      if (res.status) {
        toast.success("Data Deleted.");
        loadAllProjectFloorCommonAreaDetails();
      } else {
        toast.error("Failed to Delete Data.");
      }
    } catch (error) {
      toast.error("Something went wrong try again.");
    }
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
                ? "text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-blue-50"
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
                ? "text-blue-600 border-b-2 sm:border-b-2 border-blue-600 bg-blue-50"
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Projects Master
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage all projects
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Add Project</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, location or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="overflow-hidden">
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="min-w-full border-collapse">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      Name
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      Location
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      Start Date
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      End Date
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      Status
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 border-b">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {filteredProjects.map((project: any) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-700 font-medium">
                        <button
                          onClick={() => {
                            loadProjectDetails(project.id);
                          }}
                          className="hover:underline text-left truncate max-w-[120px] sm:max-w-none"
                        >
                          {project.name}
                        </button>
                      </td>

                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-800 truncate max-w-[100px] sm:max-w-none">
                        {project.location}
                      </td>

                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 truncate">
                        {new Date(project.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 truncate">
                        {new Date(project.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            project.status
                          )}`}
                        >
                          {project.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                        <div className="flex items-center space-x-1 sm:space-x-2">
                          <button
                            onClick={() => {
                              loadProjectDetails(project.id);
                            }}
                            className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => loadProjectDetails(project.id, true)}
                            className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(project.id)}
                            className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 text-center mt-4 sm:mt-6">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchTerm
                  ? "Try a different search term"
                  : "Click 'Add Project' to create your first project"}
              </p>
            </div>
          )}

          {/* Modal */}
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
        </div>
      )}

      {activeTab === "projectDetails" && (
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Project Details Master
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage Project Details
              </p>
            </div>
            <button
              onClick={() => {
                setShowProjectDetailsForm(true);
              }}
              className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Add Project Details</span>
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="Search by name, location or description..."
                value={searchTermForProjectDetails}
                onChange={(e) => setSearchTermForProjectDetails(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProjectsDetails.map((project: any) => (
              <div
                key={project.id}
                className="hover:bg-gray-50 border border-slate-300 shadow-lg rounded-xl"
              >
                <div className="flex justify-between items-center">
                  <h1 className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-semibold truncate">
                    {project.name}
                  </h1>
                  <div className="px-4 sm:px-6 py-2 sm:py-3">
                    <button
                      onClick={() => {
                        setSelectedProjectDetails(project);
                        setUpdateProjectDetails(true);
                        setShowProjectDetailsForm(true);
                      }}
                      className="p-1.5 sm:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <button
                      onClick={() => deleteProjectDetails(project.id)}
                      className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-2 sm:py-3 text-sm text-gray-800 flex items-center">
                  <div
                    className={`mr-2 ${
                      project.category === "floor"
                        ? "bg-green-200"
                        : "bg-blue-200"
                    } p-1 rounded-lg`}
                  >
                    {project.category === "floor" ? (
                      <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-700" />
                    ) : (
                      <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
                    )}
                  </div>
                  <span className="text-xs sm:text-sm">
                    {" "}
                    {(project.category || "").toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12 text-center mt-4 sm:mt-6">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                {searchTerm
                  ? "Try a different search term"
                  : "Click 'Add Project' to create your first project"}
              </p>
            </div>
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
      )}
    </div>
  );
}
