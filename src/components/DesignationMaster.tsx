import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  Building,
  Shield,
  Award,
  RefreshCw,
  ChevronDown,
  Users,
  BarChart3,
  Check,
  FileText,
  Layers,
  User,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { departmentsApi } from "../lib/departmentApi";
import { getAllRoles } from "../lib/rolesApi";
import { designationApi } from "../lib/designationApi";
import type { Department } from "../lib/departmentApi";
import type { Role } from "../lib/rolesApi";
import type { Designation } from "../lib/designationApi";

const MySwal = withReactContent(Swal);

interface DesignationForm {
  name: string;
  department_id: string;
  role_id: string;
  hierarchy_level: number;
  is_active: boolean;
}

export default function DesignationMaster() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [departmentRoles, setDepartmentRoles] = useState<Role[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [form, setForm] = useState<DesignationForm>({
    name: "",
    department_id: "",
    role_id: "",
    hierarchy_level: 0,
    is_active: true
  });

  // Load initial data
  useEffect(() => {
    loadDesignations();
    loadDepartments();
    loadAllRoles();
  }, []);

  // Load roles when department changes
  useEffect(() => {
    if (form.department_id) {
      loadDepartmentRoles(form.department_id);
    } else {
      setDepartmentRoles([]);
      setForm(prev => ({ ...prev, role_id: "" }));
    }
  }, [form.department_id]);

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const designationsData = await designationApi.getAll();
      console.log("Designations loaded:", designationsData);
      
      if (Array.isArray(designationsData)) {
        setDesignations(designationsData);
        console.log(`✅ Loaded ${designationsData.length} designations`);
        
        const active = designationsData.filter(d => d.is_active).length;
        const inactive = designationsData.filter(d => !d.is_active).length;
        console.log(`Active: ${active}, Inactive: ${inactive}`);
      } else {
        console.warn("❌ Designations data is not an array:", designationsData);
        setDesignations([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to load designations:", error);
      toast.error(error.message || "Failed to load designations");
      setDesignations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const depts = await departmentsApi.getAll();
      setDepartments(Array.isArray(depts) ? depts : []);
    } catch (error: any) {
      console.error("Failed to load departments:", error);
      toast.error(error.message || "Failed to load departments");
      setDepartments([]);
    }
  };

  const loadAllRoles = async () => {
    try {
      const roles = await getAllRoles();
      setAllRoles(Array.isArray(roles) ? roles : []);
    } catch (error: any) {
      console.error("Failed to load roles:", error);
      toast.error(error.message || "Failed to load roles");
      setAllRoles([]);
    }
  };

  const loadDepartmentRoles = async (departmentId: string) => {
    try {
      const roles = await designationApi.getRolesByDepartment(departmentId);
      console.log("Department roles:", roles);
      setDepartmentRoles(Array.isArray(roles) ? roles : []);
    } catch (error: any) {
      console.error("Failed to load department roles:", error);
      toast.error(error.message || "Failed to load department roles");
      setDepartmentRoles([]);
    }
  };

  const openCreate = () => {
    setEditingDesignation(null);
    setForm({
      name: "",
      department_id: "",
      role_id: "",
      hierarchy_level: 0,
      is_active: true
    });
    setShowModal(true);
    setIsMobileMenuOpen(false);
  };

  const openEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    setForm({
      name: designation.name,
      department_id: designation.department_id,
      role_id: designation.role_id.toString(),
      hierarchy_level: designation.hierarchy_level,
      is_active: designation.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Designation name is required");
      return;
    }

    if (!form.department_id) {
      toast.error("Please select a department");
      return;
    }

    if (!form.role_id) {
      toast.error("Please select a role");
      return;
    }

    try {
      if (editingDesignation) {
        await designationApi.update(editingDesignation.id, {
          name: form.name,
          hierarchy_level: form.hierarchy_level,
          is_active: form.is_active
        });
        
        await MySwal.fire({
          title: "Success!",
          text: "Designation updated successfully",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
        
      } else {
        await designationApi.create({
          name: form.name,
          department_id: form.department_id,
          role_id: parseInt(form.role_id),
          hierarchy_level: form.hierarchy_level,
          is_active: form.is_active
        });
        
        await MySwal.fire({
          title: "Success!",
          text: "Designation created successfully",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
      }
      
      setShowModal(false);
      loadDesignations();
      
    } catch (error: any) {
      console.error("Failed to save designation:", error);
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to save designation";
      
      if (errorMessage.includes("role is not assigned")) {
        toast.error("Selected role is not available for this department. Please select a different role.");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  // ✅ FIXED: handleDelete now properly catches FK_CONSTRAINT_ERROR from backend
  const handleDelete = async (designation: Designation) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: `You are about to permanently delete "${designation.name}". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await designationApi.delete(designation.id);
        
        await MySwal.fire({
          title: "Deleted!",
          text: `"${designation.name}" has been permanently deleted.`,
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
        
        loadDesignations();
      } catch (error: any) {
        console.error("Failed to delete designation:", error);
        
        // ✅ Get error details from the API response
        const errorData = error.response?.data || {};
        const errorMessage = errorData.error || error.message || "Failed to delete designation";
        const errorCode = errorData.code || "";

        // ✅ Check for FK constraint error (from our new controller code)
        // Matches: FK_CONSTRAINT_ERROR code, or text keywords from MySQL error
        const isFKError =
          errorCode === "FK_CONSTRAINT_ERROR" ||
          errorMessage.includes("being used") ||
          errorMessage.includes("in use") ||
          errorMessage.includes("Cannot delete") ||
          errorMessage.includes("referenced") ||
          errorMessage.includes("foreign key");

        if (isFKError) {
          // Show option to deactivate instead
          const deactivateResult = await MySwal.fire({
            title: "Cannot Delete",
            text: `This designation is currently assigned to one or more employees and cannot be permanently deleted.\n\nWould you like to deactivate it instead?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, deactivate it",
            cancelButtonText: "Cancel",
            showCloseButton: true
          });

          if (deactivateResult.isConfirmed) {
            try {
              await designationApi.toggleActive(designation.id);
              toast.success(`"${designation.name}" has been deactivated successfully`);
              loadDesignations();
            } catch (toggleError: any) {
              console.error("Failed to deactivate:", toggleError);
              toast.error(toggleError.message || "Failed to deactivate designation");
            }
          }
        } else {
          // Other unexpected error
          await MySwal.fire({
            title: "Error!",
            text: errorMessage,
            icon: "error",
            confirmButtonColor: "#d33",
            confirmButtonText: "OK"
          });
        }
      }
    }
  };

  const handleToggleActive = async (designation: Designation, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!designation || !designation.id) {
      toast.error("Invalid designation data");
      return;
    }

    const action = designation.is_active ? "deactivate" : "activate";
    const actionText = designation.is_active ? "deactivated" : "activated";
    
    const result = await MySwal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to ${action} "${designation.name}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await designationApi.toggleActive(designation.id);
        toast.success(`Designation ${actionText} successfully`);
        loadDesignations();
        
      } catch (error: any) {
        console.error(`Failed to ${action} designation:`, error);
        
        await MySwal.fire({
          title: "Error!",
          text: error.message || `Failed to ${action} designation`,
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const filteredDesignations = useMemo(() => {
    if (!Array.isArray(designations)) return [];
    
    return designations.filter(designation => {
      if (activeFilter !== null && designation.is_active !== activeFilter) {
        return false;
      }
      
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          designation.name.toLowerCase().includes(searchTerm) ||
          (designation.department_name && designation.department_name.toLowerCase().includes(searchTerm)) ||
          (designation.role_name && designation.role_name.toLowerCase().includes(searchTerm))
        );
      }
      
      return true;
    });
  }, [designations, search, activeFilter]);

  const getHierarchyLevelLabel = (level: number) => {
    const levels = ["Entry", "Junior", "Mid", "Senior", "Lead", "Manager", "Director", "VP", "Executive", "C-Level"];
    return levels[level] || `Level ${level}`;
  };

  const activeCount = designations.filter(d => d.is_active).length;
  const inactiveCount = designations.filter(d => !d.is_active).length;

  return (
  <div className="sticky top-32 z-10 bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
  {/* Header Section - Sticky */}
  <div className="p-4 md:p-6 border-b border-gray-200">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div className="flex justify-between items-center md:block">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Designations Management</h2>
          <p className="text-xs md:text-sm text-gray-500">Create and manage job titles by department and role</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          aria-label="Toggle mobile menu"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Desktop Search and Add */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-64"
            placeholder="Search designations..."
          />
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Designation
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
              placeholder="Search designations..."
            />
          </div>
          <button
            onClick={openCreate}
            className="w-full bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" /> Add New Designation
          </button>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
            placeholder="Search designations..."
          />
        </div>
        <button
          onClick={openCreate}
          className="p-2.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
          aria-label="Add designation"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Filters */}
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Status:</span>
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          All <span className="text-xs bg-white/20 px-1 rounded">{designations.length}</span>
        </button>
        <button
          onClick={() => setActiveFilter(true)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Active <span className="text-xs bg-white/20 px-1 rounded">{activeCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter(false)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Inactive <span className="text-xs bg-white/20 px-1 rounded">{inactiveCount}</span>
        </button>
      </div>
      
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="md:hidden flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        More Filters
      </button>
    </div>

    {/* Mobile Filter Options */}
    {showMobileFilters && (
      <div className="md:hidden mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-center">
            Sort by Name
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-center">
            Sort by Level
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-center">
            HR Only
          </button>
          <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-center">
            Finance Only
          </button>
        </div>
      </div>
    )}

    {/* Results Summary */}
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredDesignations.length}</span> designation{filteredDesignations.length !== 1 ? 's' : ''}
        {activeFilter === true && ` (Active only)`}
        {activeFilter === false && ` (Inactive only)`}
      </p>
      <button
        onClick={loadDesignations}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  </div>

  {/* Scrollable Cards Section */}
  <div className="overflow-y-auto max-h-[calc(100vh-480px)] md:max-h-[calc(100vh-390px)] p-4 md:p-6">
    {/* Loading State */}
    {loading ? (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading designations...</p>
      </div>
    ) : (
      <>
        {/* Designations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDesignations.map((designation) => (
            <div
              key={designation.id}
              className={`p-4 border rounded-xl hover:shadow-sm transition-all duration-200 bg-white ${
                designation.is_active ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate" title={designation.name}>
                    {designation.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {getHierarchyLevelLabel(designation.hierarchy_level)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      designation.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {designation.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleActive(designation, e)}
                  className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    designation.is_active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {designation.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={designation.department_name || "N/A"}>
                    {designation.department_name || "No Department"} {designation.department_code && `(${designation.department_code})`}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={designation.role_name || "N/A"}>
                    {designation.role_name || "No Role"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(designation)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                >
                  <Edit2 className="w-3 h-3" /> <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(designation)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                >
                  <Trash2 className="w-3 h-3" /> <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDesignations.length === 0 && (
          <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <Award className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              {search ? "No matching designations found" : "No designations created yet"}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4 px-4">
              {search ? "Try a different search term" : 'Click "Add Designation" to create your first job title'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium mx-auto"
              >
                <Plus className="w-4 h-4" /> Create First Designation
              </button>
            )}
          </div>
        )}
      </>
    )}
  </div>

  {/* Add/Edit Modal */}
  {showModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">
                {editingDesignation ? "Edit Designation" : "Create New Designation"}
              </h3>
              <p className="text-xs text-white/90 hidden md:block">
                {editingDesignation
                  ? "Update designation details"
                  : "Add new job title for department and role"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-xl p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  placeholder="e.g., Senior Manager, Executive Assistant"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={form.department_id}
                  onChange={(e) => setForm({ ...form, department_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  required
                >
                  <option value="">Select Department</option>
                  {Array.isArray(departments) && departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  value={form.role_id}
                  onChange={(e) => setForm({ ...form, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  required
                  disabled={!form.department_id || departmentRoles.length === 0}
                >
                  <option value="">Select Role</option>
                  {departmentRoles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
                {!form.department_id && (
                  <p className="text-xs text-gray-500 mt-1">Select a department first</p>
                )}
                {form.department_id && departmentRoles.length === 0 && (
                  <p className="text-xs text-yellow-600 mt-1">Loading roles or no roles available for this department</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hierarchy Level
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={form.hierarchy_level}
                  onChange={(e) => setForm({ ...form, hierarchy_level: parseInt(e.target.value) })}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700 w-24">
                  {getHierarchyLevelLabel(form.hierarchy_level)} ({form.hierarchy_level})
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Designation
              </label>
            </div>
          </div>

          <div className="border-t pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium w-full sm:w-auto"
            >
              {editingDesignation ? "Update Designation" : "Create Designation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <style jsx>{`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    /* Custom range slider */
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #C62828;
      cursor: pointer;
    }
    input[type="range"]::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #C62828;
      cursor: pointer;
      border: none;
    }
  `}</style>
</div>
  );
}