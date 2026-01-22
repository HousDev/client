// src/components/DepartmentsMaster.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Building,
  Users,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  Manager,
  DepartmentStats,
  PaginatedDepartments,
  DepartmentFilters,
} from "../lib/departmentApi";
import MySwal from "../utils/swal";
import { departmentsApi as DepartmentApi } from "../lib/departmentApi";
import { toast } from "sonner";

export default function DepartmentsMaster() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [managersLoading, setManagersLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [stats, setStats] = useState<DepartmentStats | null>(null);
  const [form, setForm] = useState<CreateDepartmentDTO>({
    name: "",
    code: "",
    description: "",
    is_active: true,
  });
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "code">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepartments, setTotalDepartments] = useState(0);

  const itemsPerPage = 10;

  useEffect(() => {
    loadDepartments();
    loadStats();
    loadManagers();
  }, [currentPage, activeFilter, sortBy, sortOrder]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      // const filters: DepartmentFilters = {
      //     search: search.trim() || undefined,
      //     is_active: activeFilter !== null ? activeFilter : undefined,
      //     sort_by: sortBy,
      //     sort_order: sortOrder
      // };

      // const response: PaginatedDepartments = await DepartmentApi.getPaginated(
      //     currentPage,
      //     itemsPerPage,
      //     filters
      // );

      // // Debug logging
      // console.log("API Response:", response);
      // console.log("Response data:", response.data);

      // // Ensure all departments have required properties
      // const safeDepartments = (response.data || []).map(dept => ({
      //     id: dept?.id || '',
      //     name: dept?.name || 'Unnamed Department',
      //     code: dept?.code || 'N/A',
      //     description: dept?.description || '',
      //     manager_id: dept?.manager_id,
      //     manager_name: dept?.manager_name,
      //     manager_email: dept?.manager_email,
      //     is_active: dept?.is_active !== false,
      //     created_at: dept?.created_at,
      //     updated_at: dept?.updated_at
      // }));

      const departmentRes: any = await DepartmentApi.getAll();

      console.log(departmentRes.data, "asdfajsdhkj");
      setDepartments(departmentRes.data || []);
      // setTotalDepartments(response.total || 0);
      // setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      console.error("Failed to load departments:", error);
      toast.error(error.message || "Failed to load departments");
      setDepartments([]);
      setTotalDepartments(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const statsData = await DepartmentApi.getStats();
      setStats(statsData);
    } catch (error: any) {
      console.error("Failed to load statistics:", error);
      toast.error(error.message || "Failed to load statistics");
      setStats(null);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadManagers = async () => {
    setManagersLoading(true);
    try {
      const managersData = await DepartmentApi.getManagers();
      setManagers(managersData || []);
    } catch (error: any) {
      console.error("Failed to load managers:", error);
      toast.error(error.message || "Failed to load managers");
      setManagers([]);
    } finally {
      setManagersLoading(false);
    }
  };

  const openCreate = () => {
    setEditingDept(null);
    setForm({
      name: "",
      code: "",
      description: "",
      is_active: true,
    });
    setSelectedManager("");
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name: dept.name || "",
      code: dept.code || "",
      description: dept.description || "",
      is_active: dept.is_active !== false,
    });
    // setSelectedManager(dept.manager_id || "");
    setShowModal(true);
  };

  const openManagerModal = (dept: Department) => {
    setEditingDept(dept);
    // setSelectedManager(dept.manager_id || "");
    setShowManagerModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const name = form.name?.trim();
    const code = form.code?.trim();

    if (!name || name.length < 2 || name.length > 100) {
      toast.error("Department name must be between 2 and 100 characters");
      return;
    }

    if (!code || !DepartmentApi.validateCode(code)) {
      toast.error("Department code must be 2-20 alphanumeric characters");
      return;
    }

    try {
      if (editingDept?.id) {
        const updateData: UpdateDepartmentDTO = {
          name: form.name,
          code: form.code,
          description: form.description,
          is_active: form.is_active,
          manager_id: selectedManager || null,
        };

        const updatedDept = await DepartmentApi.update(
          editingDept.id,
          updateData,
        );
        toast.success("Department updated successfully");

        // Update local state with safe data
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === updatedDept.id
              ? {
                  ...updatedDept,
                  name: updatedDept?.name || "Unnamed Department",
                  code: updatedDept?.code || "N/A",
                }
              : dept,
          ),
        );
      } else {
        const createData: CreateDepartmentDTO = {
          name: form.name,
          code: form.code,
          description: form.description,
          is_active: form.is_active,
          manager_id: selectedManager || undefined,
        };

        const newDept = await DepartmentApi.create(createData);
        toast.success("Department created successfully");

        // Add to local state with safe data
        setDepartments((prev) => [
          {
            ...newDept,
            name: newDept?.name || "Unnamed Department",
            code: newDept?.code || "N/A",
          },
          ...prev,
        ]);
        setTotalDepartments((prev) => prev + 1);
      }
      loadDepartments();
      setShowModal(false);
      loadStats(); // Refresh statistics
    } catch (error: any) {
      console.error("Failed to save department:", error);
      toast.error(error.message || "Failed to save department");
    }
  };
  useEffect(() => {
    console.log(departments);
  }, [departments]);
  const handleAssignManager = async () => {
    if (!editingDept?.id) return;

    try {
      let updatedDept: Department;

      if (selectedManager) {
        updatedDept = await DepartmentApi.assignManager(
          editingDept.id,
          selectedManager,
        );
        toast.success("Manager assigned successfully");
      } else {
        updatedDept = await DepartmentApi.removeManager(editingDept.id);
        toast.success("Manager removed successfully");
      }

      // Update local state with safe data
      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === updatedDept.id
            ? {
                ...updatedDept,
                name: updatedDept?.name || dept.name,
                code: updatedDept?.code || dept.code,
              }
            : dept,
        ),
      );

      setShowManagerModal(false);
      loadStats(); // Refresh statistics
    } catch (error: any) {
      console.error("Failed to assign manager:", error);
      toast.error(error.message || "Failed to assign manager");
    }
  };

  const handleDelete = async (dept: Department) => {
    if (!dept?.id) return;

    const result: any = await MySwal.fire({
      title: "Delete Department?",
      text: `Are you sure you want to delete "${dept.name || "this department"}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;

    try {
      await DepartmentApi.delete(dept.id);

      toast.success("Department deleted successfully");

      // Remove from local state
      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
      setTotalDepartments((prev) => Math.max(0, prev - 1));
      loadStats(); // Refresh statistics
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      toast.error(error.message || "Failed to delete department");
    }
  };

  const handleToggleStatus = async (dept: Department) => {
    if (!dept?.id) return;

    try {
      const updatedDept = await DepartmentApi.toggleActive(dept.id);
      toast.success(
        `Department ${updatedDept.is_active ? "activated" : "deactivated"} successfully`,
      );

      // Update local state with safe data
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === updatedDept.id
            ? {
                ...updatedDept,
                name: updatedDept?.name || d.name,
                code: updatedDept?.code || d.code,
              }
            : d,
        ),
      );
      loadStats(); // Refresh statistics
    } catch (error: any) {
      console.error("Failed to toggle department status:", error);
      toast.error(error.message || "Failed to update department status");
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadDepartments();
  };

  const handleResetFilters = () => {
    setSearch("");
    setActiveFilter(null);
    setSortBy("name");
    setSortOrder("asc");
    setCurrentPage(1);
    loadDepartments(); // Reload after resetting filters
  };

  const handleSort = (column: "name" | "code") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Render department name safely
  const renderDepartmentName = (dept: Department) => {
    return dept?.name || "Unnamed Department";
  };

  // Render department code safely
  const renderDepartmentCode = (dept: Department) => {
    return dept?.code || "N/A";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Departments Management
          </h2>
          <p className="text-sm text-gray-500">
            Manage organizational departments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-64"
              placeholder="Search departments..."
            />
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Search
            </button>
          </div>
          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">
                    Total Departments
                  </p>
                  <p className="text-2xl font-bold text-blue-700">
                    {stats.total_departments || 0}
                  </p>
                </div>
                <Building className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active</p>
                  <p className="text-2xl font-bold text-green-700">
                    {stats.active_departments || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Inactive</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {stats.inactive_departments || 0}
                  </p>
                </div>
                <Filter className="w-8 h-8 text-gray-500" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">
                    With Manager
                  </p>
                  <p className="text-2xl font-bold text-purple-700">
                    {stats.departments_with_manager || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Status:</span>
          <button
            onClick={() => setActiveFilter(null)}
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter(true)}
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveFilter(false)}
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Inactive
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Showing {departments.length} of {totalDepartments} departments
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading departments...</p>
        </div>
      ) : (
        <>
          {/* Departments Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Department
                      {sortBy === "name" && (
                        <span className="text-[#C62828]">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort("code")}
                  >
                    <div className="flex items-center gap-1">
                      Code
                      {sortBy === "code" && (
                        <span className="text-[#C62828]">
                          {sortOrder === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                  {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Manager
                                    </th> */}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {departments.length > 0 ? (
                  departments.map((dept) => (
                    <tr
                      key={dept.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Building className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">
                              {dept.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {dept.description || "No description"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {renderDepartmentCode(dept)}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4">
                                                    {dept.manager_name ? (
                                                        <div className="text-sm">
                                                            <div className="font-medium text-gray-800">{dept.manager_name}</div>
                                                            {dept.manager_email && (
                                                                <div className="text-gray-500">{dept.manager_email}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 italic">No manager</span>
                                                    )}
                                                </td> */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleStatus(dept)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            dept.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                          title={dept.is_active ? "Deactivate" : "Activate"}
                        >
                          {dept.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {/* <button
                            onClick={() => openManagerModal(dept)}
                            className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Assign Manager"
                          >
                            <Users className="w-4 h-4" />
                          </button> */}
                          <button
                            onClick={() => openEdit(dept)}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(dept)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center">
                      <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No departments found
                      </h3>
                      <p className="text-gray-600">
                        {search || activeFilter !== null
                          ? "Try adjusting your filters"
                          : 'Click "Add Department" to create your first department'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && departments.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages} • Showing{" "}
                {departments.length} of {totalDepartments} departments
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-[#C62828] text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">
                    {editingDept ? "Edit Department" : "Create New Department"}
                  </h3>
                  <p className="text-xs text-white/90">
                    {editingDept
                      ? "Update department details"
                      : "Add new department to organization"}
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

            <form
              onSubmit={handleSubmit}
              className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Name *
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                      placeholder="e.g., Procurement, Finance"
                      required
                      minLength={2}
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      2-100 characters
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department Code *
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) =>
                        setForm({ ...form, code: e.target.value.toUpperCase() })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                      placeholder="e.g., PROC, FIN"
                      required
                      pattern="[A-Z0-9]{2,20}"
                      title="2-20 uppercase alphanumeric characters"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      2-20 alphanumeric characters (uppercase)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                    rows={3}
                    placeholder="Describe the department's purpose and responsibilities..."
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {form.description?.length || 0}/500 characters
                  </p>
                </div>

                {/* <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Assign Manager (Optional)
                                    </label>
                                    <select
                                        value={selectedManager}
                                        onChange={(e) => setSelectedManager(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                                    >
                                        <option value="">Select a manager...</option>
                                        {managers.map(manager => (
                                            <option key={manager.id} value={manager.id}>
                                                {manager.full_name || 'Unknown'} ({manager.email || 'No email'}) - {manager.role || 'Unknown'}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
                  />
                  <label
                    htmlFor="is_active"
                    className="ml-2 text-sm text-gray-700"
                  >
                    Active Department
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t pt-6 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                  {editingDept ? "Update Department" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showManagerModal && editingDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Assign Manager</h3>
                  <p className="text-xs text-white/90">
                    {renderDepartmentName(editingDept)} (
                    {renderDepartmentCode(editingDept)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManagerModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-1.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Manager
                </label>
                <select
                  value={selectedManager}
                  onChange={(e) => setSelectedManager(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">No manager (Unassign)</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.full_name || "Unknown"} (
                      {manager.email || "No email"}) -{" "}
                      {manager.role || "Unknown"}
                    </option>
                  ))}
                </select>
              </div>

              {managersLoading && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="border-t pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManagerModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignManager}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
                >
                  {selectedManager ? "Assign Manager" : "Remove Manager"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// // src/components/DepartmentsMaster.tsx
// import React, { useEffect, useState } from "react";
// import { Plus, Edit2, Trash2, X, Building, Users, RefreshCw, Filter } from "lucide-react";
// import {
//     Department,
//     CreateDepartmentDTO,
//     UpdateDepartmentDTO,
//     Manager,
//     DepartmentStats,
//     PaginatedDepartments,
//     DepartmentFilters,
// } from "../lib/departmentApi";
// import MySwal from "../utils/swal";

// import { departmentsApi as DepartmentApi } from "../lib/departmentApi";

// export default function DepartmentsMaster() {
//     const [departments, setDepartments] = useState<Department[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [statsLoading, setStatsLoading] = useState(false);
//     const [managersLoading, setManagersLoading] = useState(false);
//     const [showModal, setShowModal] = useState(false);
//     const [showManagerModal, setShowManagerModal] = useState(false);
//     const [editingDept, setEditingDept] = useState<Department | null>(null);
//     const [managers, setManagers] = useState<Manager[]>([]);
//     const [stats, setStats] = useState<DepartmentStats | null>(null);
//     const [form, setForm] = useState<CreateDepartmentDTO>({
//         name: "",
//         code: "",
//         description: "",
//         is_active: true,
//     });
//     const [selectedManager, setSelectedManager] = useState<string>("");
//     const [search, setSearch] = useState("");
//     const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
//     const [sortBy, setSortBy] = useState<'name' | 'code'>('name');
//     const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
//     const [currentPage, setCurrentPage] = useState(1);
//     const [totalPages, setTotalPages] = useState(1);
//     const [totalDepartments, setTotalDepartments] = useState(0);

//     const itemsPerPage = 10;

//     useEffect(() => {
//         loadDepartments();
//         loadStats();
//         loadManagers();
//     }, [currentPage, activeFilter, sortBy, sortOrder]);

//     const loadDepartments = async () => {
//         console.log("first")
//         setLoading(true);
//         try {

//             const departmentData: any = await DepartmentApi.getAll();
//             console.log("form ui", departmentData)
//             const filters: DepartmentFilters = {
//                 search: search.trim() || undefined,
//                 is_active: activeFilter !== null ? activeFilter : undefined,
//                 sort_by: sortBy,
//                 sort_order: sortOrder
//             };

//             const response: PaginatedDepartments = await DepartmentApi.getPaginated(
//                 currentPage,
//                 itemsPerPage,
//                 filters
//             );
//             console.log(response)

//             // Ensure all departments have required properties
//             const safeDepartments = (response.data || []).map(dept => ({
//                 id: dept?.id || '',
//                 name: dept?.name || 'Unnamed Department',
//                 code: dept?.code || 'N/A',
//                 description: dept?.description || '',
//                 manager_id: dept?.manager_id,
//                 manager_name: dept?.manager_name,
//                 manager_email: dept?.manager_email,
//                 is_active: dept?.is_active !== false,
//                 created_at: dept?.created_at,
//                 updated_at: dept?.updated_at
//             }));

//             setDepartments(departmentData.data);
//             setTotalDepartments(response.total || 0);
//             setTotalPages(response.totalPages || 1);
//         } catch (error: any) {
//             console.error("Failed to load departments:", error);
//             toast.error(error.message || "Failed to load departments");
//             setDepartments([]);
//             setTotalDepartments(0);
//             setTotalPages(1);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStats = async () => {
//         setStatsLoading(true);
//         try {
//             const statsData = await DepartmentApi.getStats();
//             setStats(statsData);
//         } catch (error: any) {
//             console.error("Failed to load statistics:", error);
//             toast.error(error.message || "Failed to load statistics");
//             setStats(null);
//         } finally {
//             setStatsLoading(false);
//         }
//     };

//     useEffect(() => {
//         console.log("dept", departments)
//     }, [departments])

//     const loadManagers = async () => {
//         setManagersLoading(true);
//         try {
//             const managersData = await DepartmentApi.getManagers();
//             setManagers(managersData || []);
//         } catch (error: any) {
//             console.error("Failed to load managers:", error);
//             toast.error(error.message || "Failed to load managers");
//             setManagers([]);
//         } finally {
//             setManagersLoading(false);
//         }
//     };

//     const openCreate = () => {
//         setEditingDept(null);
//         setForm({
//             name: "",
//             code: "",
//             description: "",
//             is_active: true,
//         });
//         setSelectedManager("");
//         setShowModal(true);
//     };

//     const openEdit = (dept: Department) => {
//         setEditingDept(dept);
//         setForm({
//             name: dept.name || "",
//             code: dept.code || "",
//             description: dept.description || "",
//             is_active: dept.is_active !== false,
//         });
//         setSelectedManager(dept.manager_id || "");
//         setShowModal(true);
//     };

//     const openManagerModal = (dept: Department) => {
//         setEditingDept(dept);
//         setSelectedManager(dept.manager_id || "");
//         setShowManagerModal(true);
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();

//         // Validate form data
//         const name = form.name?.trim();
//         const code = form.code?.trim();

//         if (!name || name.length < 2 || name.length > 100) {
//             toast.error("Department name must be between 2 and 100 characters");
//             return;
//         }

//         if (!code || !DepartmentApi.validateCode(code)) {
//             toast.error("Department code must be 2-20 alphanumeric characters");
//             return;
//         }

//         try {
//             if (editingDept?.id) {
//                 const updateData: UpdateDepartmentDTO = {
//                     name: form.name,
//                     code: form.code,
//                     description: form.description,
//                     is_active: form.is_active,
//                     manager_id: selectedManager || null
//                 };

//                 const updatedDept = await DepartmentApi.update(editingDept.id, updateData);
//                 toast.success("Department updated successfully");

//                 // Update local state with safe data
//                 setDepartments(prev => prev.map(dept =>
//                     dept.id === updatedDept.id ? {
//                         ...updatedDept,
//                         name: updatedDept?.name || 'Unnamed Department',
//                         code: updatedDept?.code || 'N/A'
//                     } : dept
//                 ));
//             } else {
//                 const createData: CreateDepartmentDTO = {
//                     name: form.name,
//                     code: form.code,
//                     description: form.description,
//                     is_active: form.is_active,
//                     manager_id: selectedManager || undefined
//                 };

//                 const newDept = await DepartmentApi.create(createData);
//                 toast.success("Department created successfully");

//                 // Add to local state with safe data
//                 setDepartments(prev => [{
//                     ...newDept,
//                     name: newDept?.name || 'Unnamed Department',
//                     code: newDept?.code || 'N/A'
//                 }, ...prev]);
//                 setTotalDepartments(prev => prev + 1);
//             }

//             setShowModal(false);
//             loadStats(); // Refresh statistics
//         } catch (error: any) {
//             console.error("Failed to save department:", error);
//             toast.error(error.message || "Failed to save department");
//         }
//     };

//     const handleAssignManager = async () => {
//         if (!editingDept?.id) return;

//         try {
//             let updatedDept: Department;

//             if (selectedManager) {
//                 updatedDept = await DepartmentApi.assignManager(editingDept.id, selectedManager);
//                 toast.success("Manager assigned successfully");
//             } else {
//                 updatedDept = await DepartmentApi.removeManager(editingDept.id);
//                 toast.success("Manager removed successfully");
//             }

//             // Update local state with safe data
//             setDepartments(prev => prev.map(dept =>
//                 dept.id === updatedDept.id ? {
//                     ...updatedDept,
//                     name: updatedDept?.name || dept.name,
//                     code: updatedDept?.code || dept.code
//                 } : dept
//             ));

//             setShowManagerModal(false);
//             loadStats(); // Refresh statistics
//         } catch (error: any) {
//             console.error("Failed to assign manager:", error);
//             toast.error(error.message || "Failed to assign manager");
//         }
//     };

//     const handleDelete = async (dept: Department) => {
//         if (!dept?.id) return;

//         const result: any = await MySwal.fire({
//             title: "Delete Department?",
//             text: `Are you sure you want to delete "${dept.name || 'this department'}"? This action cannot be undone.`,
//             icon: "warning",
//             showCancelButton: true,
//         });

//         if (!result.isConfirmed) return;

//         try {
//             await DepartmentApi.remove(dept.id);
//             toast.success("Department deleted successfully");

//             // Remove from local state
//             setDepartments(prev => prev.filter(d => d.id !== dept.id));
//             setTotalDepartments(prev => Math.max(0, prev - 1));
//             loadStats(); // Refresh statistics
//         } catch (error: any) {
//             console.error("Failed to delete department:", error);
//             toast.error(error.message || "Failed to delete department");
//         }
//     };

//     const handleToggleStatus = async (dept: Department) => {
//         if (!dept?.id) return;

//         try {
//             const updatedDept = await DepartmentApi.toggleActive(dept.id);
//             toast.success(`Department ${updatedDept.is_active ? 'activated' : 'deactivated'} successfully`);

//             // Update local state with safe data
//             setDepartments(prev => prev.map(d =>
//                 d.id === updatedDept.id ? {
//                     ...updatedDept,
//                     name: updatedDept?.name || d.name,
//                     code: updatedDept?.code || d.code
//                 } : d
//             ));
//             loadStats(); // Refresh statistics
//         } catch (error: any) {
//             console.error("Failed to toggle department status:", error);
//             toast.error(error.message || "Failed to update department status");
//         }
//     };

//     const handleSearch = () => {
//         setCurrentPage(1);
//         loadDepartments();
//     };

//     const handleResetFilters = () => {
//         setSearch("");
//         setActiveFilter(null);
//         setSortBy('name');
//         setSortOrder('asc');
//         setCurrentPage(1);
//     };

//     const handleSort = (column: 'name' | 'code') => {
//         if (sortBy === column) {
//             setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
//         } else {
//             setSortBy(column);
//             setSortOrder('asc');
//         }
//     };

//     // SAFE FILTER FUNCTION - FIXED THE ERROR
//     const filteredDepartments = departments.filter(dept => {
//         // Check if dept exists and has required properties
//         if (!dept) return false;
//         console.log("filtered")
//         const name = dept.name || '';
//         const code = dept.code || '';
//         const description = dept.description || '';

//         const searchTerm = search.toLowerCase();

//         return (
//             name.toLowerCase().includes(searchTerm) ||
//             code.toLowerCase().includes(searchTerm) ||
//             description.toLowerCase().includes(searchTerm)
//         );
//     });

//     const paginate = (pageNumber: number) => {
//         if (pageNumber > 0 && pageNumber <= totalPages) {
//             setCurrentPage(pageNumber);
//         }
//     };

//     // Render department name safely
//     const renderDepartmentName = (dept: Department) => {
//         return dept?.name || 'Unnamed Department';
//     };

//     // Render department code safely
//     const renderDepartmentCode = (dept: Department) => {
//         return dept?.code || 'N/A';
//     };

//     return (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//             {/* Header */}
//             <div className="flex justify-between items-center mb-6">
//                 <div>
//                     <h2 className="text-xl font-semibold text-gray-800">Departments Management</h2>
//                     <p className="text-sm text-gray-500">Manage organizational departments</p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <button
//                         onClick={handleResetFilters}
//                         className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors"
//                         title="Reset filters"
//                     >
//                         <RefreshCw className="w-4 h-4" />
//                         Reset
//                     </button>
//                     <input
//                         type="text"
//                         value={search}
//                         onChange={(e) => setSearch(e.target.value)}
//                         onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
//                         className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-64"
//                         placeholder="Search departments..."
//                     />
//                     <button
//                         onClick={openCreate}
//                         className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200"
//                     >
//                         <Plus className="w-4 h-4" /> Add Department
//                     </button>
//                 </div>
//             </div>

//             {/* Statistics Cards */}
//             {statsLoading ? (
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                     {[1, 2, 3, 4].map(i => (
//                         <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
//                             <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
//                             <div className="h-6 bg-gray-300 rounded w-1/4"></div>
//                         </div>
//                     ))}
//                 </div>
//             ) : stats && (
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                     <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-blue-600 font-medium">Total Departments</p>
//                                 <p className="text-2xl font-bold text-blue-700">{stats.total_departments || 0}</p>
//                             </div>
//                             <Building className="w-8 h-8 text-blue-500" />
//                         </div>
//                     </div>
//                     <div className="bg-green-50 border border-green-100 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-green-600 font-medium">Active</p>
//                                 <p className="text-2xl font-bold text-green-700">{stats.active_departments || 0}</p>
//                             </div>
//                             <Users className="w-8 h-8 text-green-500" />
//                         </div>
//                     </div>
//                     <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-gray-600 font-medium">Inactive</p>
//                                 <p className="text-2xl font-bold text-gray-700">{stats.inactive_departments || 0}</p>
//                             </div>
//                             <Filter className="w-8 h-8 text-gray-500" />
//                         </div>
//                     </div>
//                     <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm text-purple-600 font-medium">With Manager</p>
//                                 <p className="text-2xl font-bold text-purple-700">{stats.departments_with_manager || 0}</p>
//                             </div>
//                             <Users className="w-8 h-8 text-purple-500" />
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Filters */}
//             <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                     <span className="text-sm text-gray-600">Status:</span>
//                     <button
//                         onClick={() => setActiveFilter(null)}
//                         className={`px-3 py-1 rounded-full text-sm ${activeFilter === null ? 'bg-[#C62828] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                     >
//                         All
//                     </button>
//                     <button
//                         onClick={() => setActiveFilter(true)}
//                         className={`px-3 py-1 rounded-full text-sm ${activeFilter === true ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                     >
//                         Active
//                     </button>
//                     <button
//                         onClick={() => setActiveFilter(false)}
//                         className={`px-3 py-1 rounded-full text-sm ${activeFilter === false ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                     >
//                         Inactive
//                     </button>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                     Showing {departments.length} of {totalDepartments} departments
//                 </div>
//             </div>

//             {/* Loading State */}
//             {loading ? (
//                 <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
//                     <p className="text-gray-600">Loading departments...</p>
//                 </div>
//             ) : (
//                 <>
//                     {/* Departments Table */}
//                     <div className="overflow-x-auto rounded-lg border border-gray-200">
//                         <table className="w-full">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th
//                                         className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                                         onClick={() => handleSort('name')}
//                                     >
//                                         <div className="flex items-center gap-1">
//                                             Department
//                                             {sortBy === 'name' && (
//                                                 <span className="text-[#C62828]">
//                                                     {sortOrder === 'asc' ? '↑' : '↓'}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </th>
//                                     <th
//                                         className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                                         onClick={() => handleSort('code')}
//                                     >
//                                         <div className="flex items-center gap-1">
//                                             Code
//                                             {sortBy === 'code' && (
//                                                 <span className="text-[#C62828]">
//                                                     {sortOrder === 'asc' ? '↑' : '↓'}
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Manager
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Status
//                                     </th>
//                                     <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Actions
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-200">
//                                 {filteredDepartments.map((dept) => (
//                                     <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className="p-2 bg-blue-50 rounded-lg">
//                                                     <Building className="w-4 h-4 text-blue-600" />
//                                                 </div>
//                                                 <div>
//                                                     <div className="font-medium text-gray-800">
//                                                         {renderDepartmentName(dept)}
//                                                     </div>
//                                                     <div className="text-sm text-gray-500 truncate max-w-xs">
//                                                         {dept.description || "No description"}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                                                 {renderDepartmentCode(dept)}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             {dept.manager_name ? (
//                                                 <div className="text-sm">
//                                                     <div className="font-medium text-gray-800">{dept.manager_name}</div>
//                                                     {dept.manager_email && (
//                                                         <div className="text-gray-500">{dept.manager_email}</div>
//                                                     )}
//                                                 </div>
//                                             ) : (
//                                                 <span className="text-gray-400 italic">No manager</span>
//                                             )}
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <button
//                                                 onClick={() => handleToggleStatus(dept)}
//                                                 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${dept.is_active
//                                                     ? "bg-green-100 text-green-800 hover:bg-green-200"
//                                                     : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                                                     }`}
//                                                 title={dept.is_active ? "Deactivate" : "Activate"}
//                                             >
//                                                 {dept.is_active ? "Active" : "Inactive"}
//                                             </button>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex gap-2">
//                                                 <button
//                                                     onClick={() => openManagerModal(dept)}
//                                                     className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
//                                                     title="Assign Manager"
//                                                 >
//                                                     <Users className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => openEdit(dept)}
//                                                     className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
//                                                     title="Edit"
//                                                 >
//                                                     <Edit2 className="w-4 h-4" />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDelete(dept)}
//                                                     className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                                                     title="Delete"
//                                                 >
//                                                     <Trash2 className="w-4 h-4" />
//                                                 </button>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="flex items-center justify-between mt-6">
//                             <div className="text-sm text-gray-700">
//                                 Page {currentPage} of {totalPages}
//                             </div>
//                             <div className="flex gap-2">
//                                 <button
//                                     onClick={() => paginate(currentPage - 1)}
//                                     disabled={currentPage === 1}
//                                     className={`px-3 py-1 rounded-lg border ${currentPage === 1
//                                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                                         }`}
//                                 >
//                                     Previous
//                                 </button>

//                                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                                     let pageNum;
//                                     if (totalPages <= 5) {
//                                         pageNum = i + 1;
//                                     } else if (currentPage <= 3) {
//                                         pageNum = i + 1;
//                                     } else if (currentPage >= totalPages - 2) {
//                                         pageNum = totalPages - 4 + i;
//                                     } else {
//                                         pageNum = currentPage - 2 + i;
//                                     }

//                                     return (
//                                         <button
//                                             key={pageNum}
//                                             onClick={() => paginate(pageNum)}
//                                             className={`px-3 py-1 rounded-lg ${currentPage === pageNum
//                                                 ? 'bg-[#C62828] text-white'
//                                                 : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
//                                                 }`}
//                                         >
//                                             {pageNum}
//                                         </button>
//                                     );
//                                 })}

//                                 <button
//                                     onClick={() => paginate(currentPage + 1)}
//                                     disabled={currentPage === totalPages}
//                                     className={`px-3 py-1 rounded-lg border ${currentPage === totalPages
//                                         ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                                         : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
//                                         }`}
//                                 >
//                                     Next
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {/* Empty State */}
//                     {filteredDepartments.length === 0 && (
//                         <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl mt-6">
//                             <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                             <h3 className="text-lg font-semibold text-gray-800 mb-2">No departments found</h3>
//                             <p className="text-gray-600">
//                                 {search || activeFilter !== null ? "Try adjusting your filters" : 'Click "Add Department" to create your first department'}
//                             </p>
//                         </div>
//                     )}
//                 </>
//             )}

//             {/* Add/Edit Modal */}
//             {showModal && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center">
//                             <div className="flex items-center gap-2">
//                                 <div className="p-1.5 bg-white/20 rounded-xl">
//                                     <Building className="w-4 h-4 text-white" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-white">
//                                         {editingDept ? "Edit Department" : "Create New Department"}
//                                     </h3>
//                                     <p className="text-xs text-white/90">
//                                         {editingDept ? "Update department details" : "Add new department to organization"}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setShowModal(false)}
//                                 className="text-white hover:bg-white/20 rounded-xl p-1.5"
//                             >
//                                 <X className="w-4 h-4" />
//                             </button>
//                         </div>

//                         <form onSubmit={handleSubmit} className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
//                             <div className="space-y-4">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Department Name *
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={form.name}
//                                             onChange={(e) => setForm({ ...form, name: e.target.value })}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                                             placeholder="e.g., Procurement, Finance"
//                                             required
//                                             minLength={2}
//                                             maxLength={100}
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">2-100 characters</p>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                                             Department Code *
//                                         </label>
//                                         <input
//                                             type="text"
//                                             value={form.code}
//                                             onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
//                                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                                             placeholder="e.g., PROC, FIN"
//                                             required
//                                             pattern="[A-Z0-9]{2,20}"
//                                             title="2-20 uppercase alphanumeric characters"
//                                         />
//                                         <p className="text-xs text-gray-500 mt-1">2-20 alphanumeric characters (uppercase)</p>
//                                     </div>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Description
//                                     </label>
//                                     <textarea
//                                         value={form.description}
//                                         onChange={(e) => setForm({ ...form, description: e.target.value })}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                                         rows={3}
//                                         placeholder="Describe the department's purpose and responsibilities..."
//                                         maxLength={500}
//                                     />
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         {form.description?.length || 0}/500 characters
//                                     </p>
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                         Assign Manager (Optional)
//                                     </label>
//                                     <select
//                                         value={selectedManager}
//                                         onChange={(e) => setSelectedManager(e.target.value)}
//                                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                                     >
//                                         <option value="">Select a manager...</option>
//                                         {managers.map(manager => (
//                                             <option key={manager.id} value={manager.id}>
//                                                 {manager.full_name || 'Unknown'} ({manager.email || 'No email'}) - {manager.role || 'Unknown'}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </div>

//                                 <div className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id="is_active"
//                                         checked={form.is_active}
//                                         onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
//                                         className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
//                                     />
//                                     <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
//                                         Active Department
//                                     </label>
//                                 </div>
//                             </div>

//                             {/* Modal Footer */}
//                             <div className="border-t pt-6 mt-6 flex justify-end gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowModal(false)}
//                                     className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
//                                 >
//                                     {editingDept ? "Update Department" : "Create Department"}
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* Assign Manager Modal */}
//             {showManagerModal && editingDept && (
//                 <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
//                     <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
//                         {/* Modal Header */}
//                         <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 flex justify-between items-center">
//                             <div className="flex items-center gap-2">
//                                 <div className="p-1.5 bg-white/20 rounded-xl">
//                                     <Users className="w-4 h-4 text-white" />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-bold text-white">
//                                         Assign Manager
//                                     </h3>
//                                     <p className="text-xs text-white/90">
//                                         {renderDepartmentName(editingDept)} ({renderDepartmentCode(editingDept)})
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={() => setShowManagerModal(false)}
//                                 className="text-white hover:bg-white/20 rounded-xl p-1.5"
//                             >
//                                 <X className="w-4 h-4" />
//                             </button>
//                         </div>

//                         <div className="p-6">
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                                     Select Manager
//                                 </label>
//                                 <select
//                                     value={selectedManager}
//                                     onChange={(e) => setSelectedManager(e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                                 >
//                                     <option value="">No manager (Unassign)</option>
//                                     {managers.map(manager => (
//                                         <option key={manager.id} value={manager.id}>
//                                             {manager.full_name || 'Unknown'} ({manager.email || 'No email'}) - {manager.role || 'Unknown'}
//                                         </option>
//                                     ))}
//                                 </select>
//                             </div>

//                             {managersLoading && (
//                                 <div className="text-center py-2">
//                                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
//                                 </div>
//                             )}

//                             {/* Modal Footer */}
//                             <div className="border-t pt-6 flex justify-end gap-3">
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowManagerModal(false)}
//                                     className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     onClick={handleAssignManager}
//                                     className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium"
//                                 >
//                                     {selectedManager ? "Assign Manager" : "Remove Manager"}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }
