// src/components/ProjectsMaster.tsx
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Building2,
  Eye,
  FileText,
  Package,
  Building,
  Layers,
  DoorOpen,
  Filter,
  X,
  Home,
} from "lucide-react";
import projectApi from "../lib/projectApi";
import CreateProjects from "../components/projectForms/CreateProjects";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import ViewProjectDetails from "../components/projectForms/ViewProject";
import UpdateProject from "../components/projectForms/UpdateProject";
import ProjectDetailsForm from "../components/projectForms/ProjectDetailsForm";
import ProjectDetailsApi from "../lib/projectDetailsApi";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { enGB } from "date-fns/locale/en-GB";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

registerLocale("en-GB", enGB);

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
  const [allProjectFloorsCommonAreas, setAllProjectFloorsCommonAreas] =
    useState<any[]>([]);
  const { can } = useAuth();
  const [selectedProjectDetails, setSelectedProjectDetails] = useState({
    id: "",
    name: "",
    category: "floor",
  });
  const [loading, setLoading] = useState(true);

  // Column search states for projects
  const [searchFilters, setSearchFilters] = useState({
    name: "",
    location: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Column search states for project details
  const [searchDetailFilters, setSearchDetailFilters] = useState({
    name: "",
    category: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("project");
  const [viewProjectDetails, setViewProjectDetails] = useState(false);
  const [updateProjectDetails, setUpdateProjectDetails] = useState(false);

  // Checkbox states for bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectedDetailItems, setSelectedDetailItems] = useState<Set<string>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);
  const [selectAllDetails, setSelectAllDetails] = useState(false);

  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

  // Filter states
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [ignoreDate, setIgnoreDate] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<ProjectLocal[]>([]);
  const [filteredProjectsDetails, setFilteredProjectsDetails] = useState<any[]>(
    [],
  );

  const [allFloors, setAllFloors] = useState<any[]>([]);
  const [allFlats, setAllFlats] = useState<any[]>([]);
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
        const filteredFloors = res.filter(
          (floor) => floor.category === "floor",
        );
        setAllFloors(filteredFloors || []);

        const filteredFlats = res.filter((floor) => floor.category === "flat");
        console.log(filteredFlats);
        setAllFlats(filteredFlats);

        const filteredCommonArea = res.filter(
          (floor) => floor.category === "common area",
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

    // Apply search filters
    if (searchFilters.name) {
      filtered = filtered.filter((project) =>
        (project.name || "")
          .toLowerCase()
          .includes(searchFilters.name.toLowerCase()),
      );
    }

    if (searchFilters.location) {
      filtered = filtered.filter((project) =>
        (project.location || "")
          .toLowerCase()
          .includes(searchFilters.location.toLowerCase()),
      );
    }

    if (searchFilters.status) {
      filtered = filtered.filter((project) =>
        (project.status || "")
          .toLowerCase()
          .includes(searchFilters.status.toLowerCase()),
      );
    }

    if (searchFilters.startDate) {
      filtered = filtered.filter((project) =>
        new Date(project.start_date)
          .toLocaleDateString()
          .includes(searchFilters.startDate),
      );
    }

    if (searchFilters.endDate) {
      filtered = filtered.filter((project) =>
        new Date(project.end_date)
          .toLocaleDateString()
          .includes(searchFilters.endDate),
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

    setFilteredProjects(filtered);
  }, [projects, searchFilters, filterFromDate, filterToDate, ignoreDate]);

  useEffect(() => {
    let filtered = [...allProjectFloorsCommonAreas];

    // Apply search filters for project details
    if (searchDetailFilters.name) {
      filtered = filtered.filter((detail) =>
        (detail.name || "")
          .toLowerCase()
          .includes(searchDetailFilters.name.toLowerCase()),
      );
    }

    if (searchDetailFilters.category) {
      filtered = filtered.filter((detail) =>
        (detail.category || "")
          .toLowerCase()
          .includes(searchDetailFilters.category.toLowerCase()),
      );
    }

    setFilteredProjectsDetails(filtered);
  }, [allProjectFloorsCommonAreas, searchDetailFilters]);

  // Handlers for search filter changes
  const handleProjectSearchFilterChange = (
    column: keyof typeof searchFilters,
    value: string,
  ) => {
    setSearchFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const handleDetailSearchFilterChange = (
    column: keyof typeof searchDetailFilters,
    value: string,
  ) => {
    setSearchDetailFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  const clearAllProjectFilters = () => {
    setSearchFilters({
      name: "",
      location: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  const clearAllDetailFilters = () => {
    setSearchDetailFilters({
      name: "",
      category: "",
    });
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
        Array.from(selectedItems).map((id) => projectApi.deleteProject(id)),
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
        Array.from(selectedDetailItems).map((id) =>
          ProjectDetailsApi.delete(id),
        ),
      );
      toast.success(
        `${selectedDetailItems.size} item(s) deleted successfully!`,
      );
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
      const allIds = new Set(
        filteredProjectsDetails.map((detail) => detail.id),
      );
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
    // Clear any search date input in the table
    handleProjectSearchFilterChange("startDate", "");
    handleProjectSearchFilterChange("endDate", "");
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
    <div className="p-0">
      {/* Tabs Section - Matching PurchaseOrders style */}
      <div className=" sticky top-20 z-20 flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="w-full sm:flex-1">
          <div className="flex bg-white border border-gray-200 rounded-lg ">
            {can("view_projects") && (
              <button
                onClick={() => setActiveTab("project")}
                className={`flex-1 flex items-center justify-center gap-1.5
                px-2 py-2
                text-[11px] sm:text-sm
                font-medium transition
                ${
                  activeTab === "project"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Building className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Projects Master
              </button>
            )}
            {can("view_projects_details") && (
              <button
                onClick={() => setActiveTab("projectDetails")}
                className={`flex-1 flex items-center justify-center gap-1.5
                px-2 py-2
                text-[11px] sm:text-sm
                font-medium transition
                ${
                  activeTab === "projectDetails"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Project Details Master
              </button>
            )}
          </div>
        </div>

        {/* Create Button - Projects Tab */}
        {activeTab === "project" && can("create_project") && (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full sm:w-auto bg-[#C62828] text-white px-3 py-2 sm:px-5 sm:py-2 rounded-lg flex items-center justify-center gap-1.5 text-[11px] sm:text-sm shadow-sm hover:bg-[#A62222] transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add Project
          </button>
        )}

        {/* Create Button - Project Details Tab */}
        {activeTab === "projectDetails" && can("create_project_details") && (
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
            className="w-full sm:w-auto bg-[#C62828] text-white px-3 py-2 sm:px-5 sm:py-2 rounded-lg flex items-center justify-center gap-1.5 text-[11px] sm:text-sm shadow-sm hover:bg-[#A62222] transition whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Add Project Details
          </button>
        )}
      </div>

      {activeTab === "project" && (
        <div>
          {/* Header with Actions */}
          <div className="-mb-3 md:mb-2 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Left spacer */}
            <div />

            {/* Right side Delete Button */}
            {can("delete_project") && (
              <div className="flex justify-end">
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    className="
              flex items-center gap-1.5
             bg-red-600 hover:bg-red-700
                     text-white font-medium
              px-3 py-1.5
              text-xs sm:text-sm
              rounded-md
              transition-all
              shadow-sm
             "
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedItems.size})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Main Table */}
          <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:-mt-1 ">
            <div className="overflow-y-auto max-h-[calc(100vh-180px)] md:max-h-[calc(100vh-160px)]">
              <table className="w-full min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                  {/* Header Row */}
                  <tr>
                    <th className="px-3 md:px-4 py-2 text-center w-16">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Select
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Project Name
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Location
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
                        Status
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </div>
                    </th>
                  </tr>

                  {/* Search Row - Separate Row Below Headers */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* Select Column */}
                    <td className="px-3 md:px-4 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>

                    {/* Name Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={searchFilters.name}
                        onChange={(e) =>
                          handleProjectSearchFilterChange(
                            "name",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Location Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Search location..."
                        value={searchFilters.location}
                        onChange={(e) =>
                          handleProjectSearchFilterChange(
                            "location",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Start Date Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Search start date..."
                        value={searchFilters.startDate}
                        onChange={(e) =>
                          handleProjectSearchFilterChange(
                            "startDate",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* End Date Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Search end date..."
                        value={searchFilters.endDate}
                        onChange={(e) =>
                          handleProjectSearchFilterChange(
                            "endDate",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Status Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Search status..."
                        value={searchFilters.status}
                        onChange={(e) =>
                          handleProjectSearchFilterChange(
                            "status",
                            e.target.value,
                          )
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Actions Column - Clear Filter Button */}
                    {/* Actions Column - Clear Filter Button */}
                    <td className="px-3 md:px-4 py-1 text-center">
                      <button
                        onClick={() => setShowFilterSidebar(true)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                        title="Advanced Filters"
                      >
                        <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                        Filters
                      </button>
                    </td>
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
                        <td className="px-3 md:px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectItem(project.id)}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                          />
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <button
                            onClick={() => {
                              loadProjectDetails(project.id);
                            }}
                            className="font-bold hover:underline cursor-pointer text-blue-600 text-left text-xs md:text-sm"
                          >
                            {project.name}
                          </button>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm">
                            {project.location || "N/A"}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                            {new Date(project.start_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                            {new Date(project.end_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <span
                            className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                              project.status,
                            )}`}
                          >
                            {project.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 md:px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5 md:gap-2">
                            {can("view_projects") && (
                              <button
                                onClick={() => {
                                  loadProjectDetails(project.id);
                                }}
                                className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="View"
                              >
                                <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                            {can("update_project") && (
                              <button
                                onClick={() =>
                                  loadProjectDetails(project.id, true)
                                }
                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                            {can("delete_project") && (
                              <button
                                onClick={() => handleDelete(project.id)}
                                className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProjects.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm md:text-lg font-medium">
                    No projects found
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-2">
                    Click "Add Project" to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "projectDetails" && (
        <div>
          {/* Search Bar with Filters - Sticky */}
          <div className="sticky top-32 z-10 bg-white mb-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-2 md:p-4 border-b border-gray-200">
                {/* MOBILE: ONE LINE COMPACT */}
                <div className="flex md:hidden items-center gap-1.5">
                  {/* Name */}
                  <input
                    type="text"
                    placeholder="Name"
                    value={searchDetailFilters.name}
                    onChange={(e) =>
                      handleDetailSearchFilterChange("name", e.target.value)
                    }
                    className="flex-1 min-w-0 px-2 py-1 text-[10px]
                border border-gray-300 rounded-md
                focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Category */}
                  <input
                    type="text"
                    placeholder="Category"
                    value={searchDetailFilters.category}
                    onChange={(e) =>
                      handleDetailSearchFilterChange("category", e.target.value)
                    }
                    className="flex-1 min-w-0 px-2 py-1 text-[10px]
                border border-gray-300 rounded-md
                focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Clear */}
                  <button
                    onClick={clearAllDetailFilters}
                    className="shrink-0 px-2 py-1
                border border-gray-300 rounded-md
                text-[10px]"
                  >
                    Clear
                  </button>

                  {/* Delete (ALWAYS VISIBLE) */}
                  {selectedDetailItems.size > 0 && (
                    <button
                      onClick={handleBulkDeleteDetails}
                      className="shrink-0 px-2 py-1
                  bg-red-600 text-white rounded-md
                  text-[10px] whitespace-nowrap"
                    >
                      Del {selectedDetailItems.size}
                    </button>
                  )}
                </div>

                {/* DESKTOP / TABLET: GRID */}
                <div
                  className={`hidden md:grid gap-4 
              ${selectedDetailItems.size > 0 ? "md:grid-cols-4" : "md:grid-cols-3"}`}
                >
                  {/* Name */}
                  <div>
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Name
                    </div>
                    <input
                      type="text"
                      placeholder="Search name..."
                      value={searchDetailFilters.name}
                      onChange={(e) =>
                        handleDetailSearchFilterChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <div className="text-xs font-semibold text-gray-700 uppercase mb-1">
                      Category
                    </div>
                    <input
                      type="text"
                      placeholder="Search category..."
                      value={searchDetailFilters.category}
                      onChange={(e) =>
                        handleDetailSearchFilterChange(
                          "category",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Clear */}
                  <div className="flex items-end">
                    <button
                      onClick={clearAllDetailFilters}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs hover:bg-gray-50"
                    >
                      Clear Filters
                    </button>
                  </div>

                  {/* Bulk Delete */}
                  {selectedDetailItems.size > 0 && (
                    <div className="flex items-end">
                      {can("delete_project_details") && (
                        <button
                          onClick={handleBulkDeleteDetails}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-md text-xs hover:bg-red-700"
                        >
                          Delete ({selectedDetailItems.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Project Details Grid - Sticky Container with Scroll */}
          <div className="sticky top-44 md:top-48 z-10  rounded-xl ">
            <div className="overflow-y-auto max-h-[calc(100vh-280px)] md:max-h-[calc(100vh-260px)] p-3">
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProjectsDetails.map((project) => {
                  const isSelected = selectedDetailItems.has(project.id);
                  return (
                    <div
                      key={project.id}
                      className={`border rounded-xl shadow-sm hover:shadow-md transition ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-300 hover:border-gray-400"
                      }`}
                    >
                      {/* Card Header */}
                      <div className="rounded-xl flex justify-between items-center p-3 md:p-4 border-b bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectDetailItem(project.id)}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828] flex-shrink-0"
                          />
                          <h1
                            className="text-xs md:text-sm font-semibold truncate"
                            title={project.name}
                          >
                            {project.name}
                          </h1>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          {can("update_project_details") && (
                            <button
                              onClick={() => {
                                setSelectedProjectDetails(project);
                                setUpdateProjectDetails(true);
                                setShowProjectDetailsForm(true);
                              }}
                              className="p-1 md:p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition hover:scale-105 active:scale-95"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          )}
                          {can("delete_project_details") && (
                            <button
                              onClick={() => deleteProjectDetails(project.id)}
                              className="p-1 md:p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition hover:scale-105 active:scale-95"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 md:p-2 rounded-lg ${
                                project.category === "floor"
                                  ? "bg-green-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {project.category === "floor" ? (
                                <Layers className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-700" />
                              ) : project.category === "flat" ? (
                                <Home className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-700" />
                              ) : (
                                <DoorOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-700" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs md:text-sm font-medium text-gray-800">
                                {project.category === "floor"
                                  ? "Floor"
                                  : project.category === "flat"
                                    ? "Flat"
                                    : "Common Area"}
                              </span>
                              {/* Safe ID display */}
                              {project.id && (
                                <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">
                                  ID: {String(project.id).slice(0, 8)}
                                  {String(project.id).length > 8 ? "..." : ""}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Indicator */}
                          <div
                            className={`px-2 py-1 rounded-full text-[9px] md:text-xs font-medium ${
                              project.is_active !== false
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {project.is_active !== false
                              ? "Active"
                              : "Inactive"}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Empty State - Inside scroll container */}
              {filteredProjectsDetails.length === 0 && (
                <div className="bg-white rounded-xl p-6 md:p-8 text-center">
                  <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 text-sm md:text-base font-medium">
                    No project details found
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-2 mb-4">
                    {searchDetailFilters.name || searchDetailFilters.category
                      ? "Try a different search term or clear filters"
                      : "Click 'Add Project Details' to get started"}
                  </p>
                  {!searchDetailFilters.name &&
                    !searchDetailFilters.category && (
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
                        className="inline-flex items-center gap-2 bg-[#C62828] text-white px-4 py-2 rounded-lg hover:bg-red-500 transition text-sm font-medium shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add Project Details
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Filter Sidebar */}
      {showFilterSidebar && activeTab === "project" && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
            onClick={() => setShowFilterSidebar(false)}
          />

          {/* Sidebar */}
          <div
            className={`
        absolute inset-y-0 right-0
        bg-white shadow-2xl flex flex-col
        transition-transform duration-300 ease-out
        ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}

        /* MOBILE */
        w-[90vw] max-w-none

        /* DESKTOP */
        md:max-w-md md:w-full
      `}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-xl font-bold text-white">
                    Date Filters
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    Select a date range to filter projects
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-xs md:text-sm hover:bg-white hover:bg-opacity-20 px-2 md:px-3 py-1 md:py-1.5 rounded transition font-medium"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-1.5 transition"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* From Date */}
                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C62828]" />
                      From Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={
                          filterFromDate ? new Date(filterFromDate) : null
                        }
                        onChange={(date: Date | null) =>
                          setFilterFromDate(
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                        selectsStart
                        startDate={
                          filterFromDate ? new Date(filterFromDate) : null
                        }
                        endDate={filterToDate ? new Date(filterToDate) : null}
                        maxDate={
                          filterToDate ? new Date(filterToDate) : new Date()
                        }
                        placeholderText="Select start date"
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                        dateFormat="dd/MM/yyyy"
                        locale="en-GB"
                        isClearable
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* To Date */}
                  <div className="space-y-2">
                    <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C62828]" />
                      To Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={filterToDate ? new Date(filterToDate) : null}
                        onChange={(date: Date | null) =>
                          setFilterToDate(
                            date ? date.toISOString().split("T")[0] : "",
                          )
                        }
                        selectsEnd
                        startDate={
                          filterFromDate ? new Date(filterFromDate) : null
                        }
                        endDate={filterToDate ? new Date(filterToDate) : null}
                        minDate={
                          filterFromDate ? new Date(filterFromDate) : undefined
                        }
                        maxDate={new Date()}
                        placeholderText="Select end date"
                        className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
                        dateFormat="dd/MM/yyyy"
                        locale="en-GB"
                        isClearable
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Summary */}
                {(filterFromDate || filterToDate) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs md:text-sm font-medium text-gray-800">
                      Selected Range
                    </p>
                    <p className="text-[11px] md:text-xs text-gray-600">
                      {filterFromDate
                        ? new Date(filterFromDate).toLocaleDateString("en-GB")
                        : "Any"}{" "}
                      →{" "}
                      {filterToDate
                        ? new Date(filterToDate).toLocaleDateString("en-GB")
                        : "Any"}
                    </p>
                  </div>
                )}
              </div>

              {/* Ignore Date */}
              <div className="border-t pt-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={ignoreDate}
                    onChange={(e) => {
                      setIgnoreDate(e.target.checked);
                      if (e.target.checked) {
                        setFilterFromDate("");
                        setFilterToDate("");
                      }
                    }}
                    className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]"
                  />
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-700">
                      Ignore Date Filters
                    </p>
                    <p className="text-[11px] md:text-xs text-gray-500">
                      Show all data regardless of date
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-[#D32F2F] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <CreateProjects
          setShowModel={setShowModal}
          allFlats={allFlats}
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
          allFlats={allFlats}
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
