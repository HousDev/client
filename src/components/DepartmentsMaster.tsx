// // src/components/DepartmentsMaster.tsx
// import React, { useEffect, useState } from "react";
// import { getAllRoles } from "../lib/rolesApi";
// import type { Role } from "../lib/rolesApi";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   X,
//   Building,
//   Users,
//   RefreshCw,
//   Filter,
//   Search,
//   Menu,
//   ChevronLeft,
//   ChevronRight,
//   Shield,
// } from "lucide-react";
// import {
//   Department,
//   CreateDepartmentDTO,
//   UpdateDepartmentDTO,
//   Manager,
//   DepartmentStats,
//   PaginatedDepartments,
//   DepartmentFilters,
// } from "../lib/departmentApi";
// import MySwal from "../utils/swal";
// import { departmentsApi as DepartmentApi } from "../lib/departmentApi";
// import { toast } from "sonner";

// export default function DepartmentsMaster() {
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [statsLoading, setStatsLoading] = useState(false);
//   const [managersLoading, setManagersLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showManagerModal, setShowManagerModal] = useState(false);
//   const [editingDept, setEditingDept] = useState<Department | null>(null);
//   const [managers, setManagers] = useState<Manager[]>([]);
//   const [stats, setStats] = useState<DepartmentStats | null>(null);
//   const [form, setForm] = useState<CreateDepartmentDTO>({
//     name: "",
//     code: "",
//     description: "",
//     is_active: true,
//   });
//   const [selectedManager, setSelectedManager] = useState<string>("");
//   const [search, setSearch] = useState("");
//   const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
//   const [sortBy, setSortBy] = useState<"name" | "code">("name");
//   const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);
//   const [totalDepartments, setTotalDepartments] = useState(0);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);
// const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
// const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
// const [rolesLoading, setRolesLoading] = useState(false);

//   const itemsPerPage = 10;

//   useEffect(() => {
//     loadDepartments();
//     loadStats();
//     loadManagers();
//   }, [currentPage, activeFilter, sortBy, sortOrder]);

//   const loadDepartments = async () => {
//     setLoading(true);
//     try {
//       const departmentRes: any = await DepartmentApi.getAll();
//       console.log(departmentRes.data, "asdfajsdhkj");
//       setDepartments(departmentRes.data || []);
//     } catch (error: any) {
//       console.error("Failed to load departments:", error);
//       toast.error(error.message || "Failed to load departments");
//       setDepartments([]);
//       setTotalDepartments(0);
//       setTotalPages(1);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//   loadAvailableRoles();
// }, []);

// const loadAvailableRoles = async () => {
//   setRolesLoading(true);
//   try {
//     const roles = await getAllRoles();
//     setAvailableRoles(roles);
//   } catch (error: any) {
//     console.error("Failed to load roles:", error);
//     toast.error(error.message || "Failed to load roles");
//   } finally {
//     setRolesLoading(false);
//   }
// };

//   const loadStats = async () => {
//     setStatsLoading(true);
//     try {
//       const statsData = await DepartmentApi.getStats();
//       setStats(statsData);
//     } catch (error: any) {
//       console.error("Failed to load statistics:", error);
//       toast.error(error.message || "Failed to load statistics");
//       setStats(null);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   const loadManagers = async () => {
//     setManagersLoading(true);
//     try {
//       const managersData = await DepartmentApi.getManagers();
//       setManagers(managersData || []);
//     } catch (error: any) {
//       console.error("Failed to load managers:", error);
//       toast.error(error.message || "Failed to load managers");
//       setManagers([]);
//     } finally {
//       setManagersLoading(false);
//     }
//   };

//  const openCreate = () => {
//   setEditingDept(null);
//   setForm({
//     name: "",
//     code: "",
//     description: "",
//     is_active: true,
//   });
//   setSelectedRoleIds([]);
//   setSelectedManager("");
//   setShowModal(true);
// };


//   const openEdit = (dept: Department) => {
//   setEditingDept(dept);
//   setForm({
//     name: dept.name || "",
//     code: dept.code || "",
//     description: dept.description || "",
//     is_active: dept.is_active !== false,
//   });
//   setSelectedRoleIds(dept.role_ids || []);
//   setShowModal(true);
// };
//   const openManagerModal = (dept: Department) => {
//     setEditingDept(dept);
//     setShowManagerModal(true);
//   };

//  // Update handleSubmit to include role_ids
// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   const name = form.name?.trim();
//   const code = form.code?.trim();

//   if (!name || name.length < 2 || name.length > 100) {
//     toast.error("Department name must be between 2 and 100 characters");
//     return;
//   }

//   if (!code || !DepartmentApi.validateCode(code)) {
//     toast.error("Department code must be 2-20 alphanumeric characters");
//     return;
//   }

//   try {
//     const payload = {
//       ...form,
//       role_ids: selectedRoleIds.map(id => parseInt(id))
//     };

//     if (editingDept?.id) {
//       const updatedDept = await DepartmentApi.update(editingDept.id, payload);
//       toast.success("Department updated successfully");
      
//       setDepartments((prev) =>
//         prev.map((dept) =>
//           dept.id === updatedDept.id ? updatedDept : dept
//         )
//       );
//     } else {
//       const newDept = await DepartmentApi.create(payload);
//       toast.success("Department created successfully");
      
//       setDepartments((prev) => [newDept, ...prev]);
//       setTotalDepartments((prev) => prev + 1);
//     }
    
//     setShowModal(false);
//     loadStats();
//   } catch (error: any) {
//     console.error("Failed to save department:", error);
//     toast.error(error.message || "Failed to save department");
//   }
// };
  
//   useEffect(() => {
//     console.log(departments);
//   }, [departments]);

//   const handleAssignManager = async () => {
//     if (!editingDept?.id) return;

//     try {
//       let updatedDept: Department;

//       if (selectedManager) {
//         updatedDept = await DepartmentApi.assignManager(
//           editingDept.id,
//           selectedManager,
//         );
//         toast.success("Manager assigned successfully");
//       } else {
//         updatedDept = await DepartmentApi.removeManager(editingDept.id);
//         toast.success("Manager removed successfully");
//       }

//       setDepartments((prev) =>
//         prev.map((dept) =>
//           dept.id === updatedDept.id
//             ? {
//                 ...updatedDept,
//                 name: updatedDept?.name || dept.name,
//                 code: updatedDept?.code || dept.code,
//               }
//             : dept,
//         ),
//       );

//       setShowManagerModal(false);
//       loadStats();
//     } catch (error: any) {
//       console.error("Failed to assign manager:", error);
//       toast.error(error.message || "Failed to assign manager");
//     }
//   };

//   const handleDelete = async (dept: Department) => {
//     if (!dept?.id) return;

//     const result: any = await MySwal.fire({
//       title: "Delete Department?",
//       text: `Are you sure you want to delete "${dept.name || "this department"}"? This action cannot be undone.`,
//       icon: "warning",
//       showCancelButton: true,
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await DepartmentApi.delete(dept.id);
//       toast.success("Department deleted successfully");

//       setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
//       setTotalDepartments((prev) => Math.max(0, prev - 1));
//       loadStats();
//     } catch (error: any) {
//       console.error("Failed to delete department:", error);
//       toast.error(error.message || "Failed to delete department");
//     }
//   };

//   const handleToggleStatus = async (dept: Department) => {
//     if (!dept?.id) return;

//     try {
//       const updatedDept = await DepartmentApi.toggleActive(dept.id);
//       toast.success(
//         `Department ${updatedDept.is_active ? "activated" : "deactivated"} successfully`,
//       );

//       setDepartments((prev) =>
//         prev.map((d) =>
//           d.id === updatedDept.id
//             ? {
//                 ...updatedDept,
//                 name: updatedDept?.name || d.name,
//                 code: updatedDept?.code || d.code,
//               }
//             : d,
//         ),
//       );
//       loadStats();
//     } catch (error: any) {
//       console.error("Failed to toggle department status:", error);
//       toast.error(error.message || "Failed to update department status");
//     }
//   };

//   const handleSearch = () => {
//     setCurrentPage(1);
//     loadDepartments();
//   };

//   const handleResetFilters = () => {
//     setSearch("");
//     setActiveFilter(null);
//     setSortBy("name");
//     setSortOrder("asc");
//     setCurrentPage(1);
//     loadDepartments();
//   };

//   const handleSort = (column: "name" | "code") => {
//     if (sortBy === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortBy(column);
//       setSortOrder("asc");
//     }
//     setCurrentPage(1);
//   };

//   const paginate = (pageNumber: number) => {
//     if (pageNumber > 0 && pageNumber <= totalPages) {
//       setCurrentPage(pageNumber);
//     }
//   };

//   const renderDepartmentName = (dept: Department) => {
//     return dept?.name || "Unnamed Department";
//   };

//   const renderDepartmentCode = (dept: Department) => {
//     return dept?.code || "N/A";
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-4 md:p-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
//         <div>
//           <h2 className="text-lg md:text-xl font-semibold text-gray-800">
//             Departments Management
//           </h2>
//           <p className="text-xs md:text-sm text-gray-500">
//             Manage organizational departments
//           </p>
//         </div>

//         <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
//           <button
//             onClick={handleResetFilters}
//             className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors order-2 md:order-1"
//             title="Reset filters"
//           >
//             <RefreshCw className="w-4 h-4" />
//             <span className="hidden md:inline">Reset</span>
//           </button>
          
//           <div className="flex items-center gap-2 order-1 md:order-2">
//             <div className="relative flex-1">
//               <input
//                 type="text"
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 onKeyPress={(e) => e.key === "Enter" && handleSearch()}
//                 className="w-full px-3 py-2 pl-9 md:pl-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                 placeholder="Search departments..."
//               />
//               <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 md:hidden" />
//             </div>
//             <button
//               onClick={handleSearch}
//               className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hidden md:block"
//             >
//               Search
//             </button>
//             <button
//               onClick={() => setShowMobileFilters(!showMobileFilters)}
//               className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 md:hidden"
//             >
//               <Filter className="w-4 h-4" />
//             </button>
//           </div>
          
//           <button
//             onClick={openCreate}
//             className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 order-3"
//           >
//             <Plus className="w-4 h-4" />
//             <span className="text-sm md:text-base">Add Department</span>
//           </button>
//         </div>
//       </div>

//       {/* Mobile Filters Panel */}
//       {showMobileFilters && (
//         <div className="md:hidden mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="font-medium text-gray-700">Filters</h3>
//             <button
//               onClick={() => setShowMobileFilters(false)}
//               className="text-gray-500"
//             >
//               <X className="w-4 h-4" />
//             </button>
//           </div>
//           <div className="space-y-3">
//             <div>
//               <span className="text-sm text-gray-600 mb-2 block">Status:</span>
//               <div className="flex flex-wrap gap-2">
//                 <button
//                   onClick={() => setActiveFilter(null)}
//                   className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 >
//                   All
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter(true)}
//                   className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 >
//                   Active
//                 </button>
//                 <button
//                   onClick={() => setActiveFilter(false)}
//                   className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//                 >
//                   Inactive
//                 </button>
//               </div>
//             </div>
//             <button
//               onClick={handleSearch}
//               className="w-full px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-red-700"
//             >
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Statistics Cards */}
//       {statsLoading ? (
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
//           {[1, 2, 3, 4].map((i) => (
//             <div key={i} className="bg-gray-100 rounded-lg p-3 md:p-4 animate-pulse">
//               <div className="h-3 md:h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
//               <div className="h-5 md:h-6 bg-gray-300 rounded w-1/4"></div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         stats && (
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
//             <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs md:text-sm text-blue-600 font-medium">
//                     Total Departments
//                   </p>
//                   <p className="text-lg md:text-2xl font-bold text-blue-700">
//                     {stats.total_departments || 0}
//                   </p>
//                 </div>
//                 <Building className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
//               </div>
//             </div>
//             <div className="bg-green-50 border border-green-100 rounded-lg p-3 md:p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs md:text-sm text-green-600 font-medium">Active</p>
//                   <p className="text-lg md:text-2xl font-bold text-green-700">
//                     {stats.active_departments || 0}
//                   </p>
//                 </div>
//                 <Users className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
//               </div>
//             </div>
//             <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 md:p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs md:text-sm text-gray-600 font-medium">Inactive</p>
//                   <p className="text-lg md:text-2xl font-bold text-gray-700">
//                     {stats.inactive_departments || 0}
//                   </p>
//                 </div>
//                 <Filter className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
//               </div>
//             </div>
//             <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 md:p-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-xs md:text-sm text-purple-600 font-medium">
//                     With Manager
//                   </p>
//                   <p className="text-lg md:text-2xl font-bold text-purple-700">
//                     {stats.departments_with_manager || 0}
//                   </p>
//                 </div>
//                 <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
//               </div>
//             </div>
//           </div>
//         )
//       )}

//       {/* Filters - Desktop */}
//       <div className="hidden md:flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
//         <div className="flex items-center gap-2">
//           <span className="text-sm text-gray-600">Status:</span>
//           <button
//             onClick={() => setActiveFilter(null)}
//             className={`px-3 py-1 rounded-full text-sm ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//           >
//             All
//           </button>
//           <button
//             onClick={() => setActiveFilter(true)}
//             className={`px-3 py-1 rounded-full text-sm ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//           >
//             Active
//           </button>
//           <button
//             onClick={() => setActiveFilter(false)}
//             className={`px-3 py-1 rounded-full text-sm ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
//           >
//             Inactive
//           </button>
//         </div>
//         <div className="text-sm text-gray-500">
//           Showing {departments.length} of {totalDepartments} departments
//         </div>
//       </div>

//       {/* Loading State */}
//       {loading ? (
//         <div className="text-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading departments...</p>
//         </div>
//       ) : (
//         <>
//           {/* Departments Table */}
//           <div className="overflow-x-auto rounded-lg border border-gray-200">
//             <table className="w-full min-w-[640px]">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th
//                     className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleSort("name")}
//                   >
//                     <div className="flex items-center gap-1">
//                       Department
//                       {sortBy === "name" && (
//                         <span className="text-[#C62828]">
//                           {sortOrder === "asc" ? "↑" : "↓"}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th
//                     className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleSort("code")}
//                   >
//                     <div className="flex items-center gap-1">
//                       Code
//                       {sortBy === "code" && (
//                         <span className="text-[#C62828]">
//                           {sortOrder === "asc" ? "↑" : "↓"}
//                         </span>
//                       )}
//                     </div>
//                   </th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Status
//                   </th>
//                   <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-200">
//                 {departments.length > 0 ? (
//                   departments.map((dept) => (
//                     <tr
//                       key={dept.id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex items-center gap-3">
//                           <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
//                             <Building className="w-4 h-4 text-blue-600" />
//                           </div>
//                           <div className="min-w-0">
//                             <div className="font-medium text-gray-800 truncate">
//                               {dept.name}
//                             </div>
//                             <div className="text-xs md:text-sm text-gray-500 truncate max-w-[200px] md:max-w-xs">
//                               {dept.description || "No description"}
//                             </div>
//                           </div>
//                         </div>
//                       </td>
//                       {
//   showModal && (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
//       <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2">
//         {/* Modal Header */}
//         <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
//           <div className="flex items-center gap-2">
//             <div className="p-1.5 bg-white/20 rounded-xl">
//               <Building className="w-4 h-4 text-white" />
//             </div>
//             <div>
//               <h3 className="font-bold text-white text-sm md:text-base">
//                 {editingDept ? "Edit Department" : "Create New Department"}
//               </h3>
//               <p className="text-xs text-white/90 hidden md:block">
//                 {editingDept
//                   ? "Update department details and roles"
//                   : "Add new department with assigned roles"}
//               </p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowModal(false)}
//             className="text-white hover:bg-white/20 rounded-xl p-1.5"
//           >
//             <X className="w-4 h-4" />
//           </button>
//         </div>

//         <form
//           onSubmit={handleSubmit}
//           className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto"
//         >
//           <div className="space-y-4">
//             {/* Basic Info Fields (same as before) */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Department Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.name}
//                   onChange={(e) =>
//                     setForm({ ...form, name: e.target.value })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   placeholder="e.g., Procurement, Finance"
//                   required
//                   minLength={2}
//                   maxLength={100}
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   2-100 characters
//                 </p>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Department Code *
//                 </label>
//                 <input
//                   type="text"
//                   value={form.code}
//                   onChange={(e) =>
//                     setForm({ ...form, code: e.target.value.toUpperCase() })
//                   }
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   placeholder="e.g., PROC, FIN"
//                   required
//                   pattern="[A-Z0-9]{2,20}"
//                   title="2-20 uppercase alphanumeric characters"
//                 />
//                 <p className="text-xs text-gray-500 mt-1">
//                   2-20 alphanumeric characters (uppercase)
//                 </p>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Description
//               </label>
//               <textarea
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm({ ...form, description: e.target.value })
//                 }
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                 rows={3}
//                 placeholder="Describe the department's purpose and responsibilities..."
//                 maxLength={500}
//               />
//               <p className="text-xs text-gray-500 mt-1">
//                 {form.description?.length || 0}/500 characters
//               </p>
//             </div>

//             {/* ✅ NEW: Role Selection */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Assign Roles *
//               </label>
//               <p className="text-xs text-gray-500 mb-3">
//                 Select which roles belong to this department
//               </p>
              
//               {rolesLoading ? (
//                 <div className="flex items-center justify-center p-4">
//                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C62828]"></div>
//                   <span className="ml-2 text-sm text-gray-600">Loading roles...</span>
//                 </div>
//               ) : availableRoles.length === 0 ? (
//                 <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
//                   <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
//                   <p className="text-sm text-gray-600">No roles available. Create roles first.</p>
//                 </div>
//               ) : (
//                 <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                     {availableRoles.map((role) => (
//                       <label
//                         key={role.id}
//                         className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
//                       >
//                         <input
//                           type="checkbox"
//                           checked={selectedRoleIds.includes(role.id.toString())}
//                           onChange={(e) => {
//                             if (e.target.checked) {
//                               setSelectedRoleIds([...selectedRoleIds, role.id.toString()]);
//                             } else {
//                               setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id.toString()));
//                             }
//                           }}
//                           className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
//                         />
//                         <div className="ml-2">
//                           <span className="text-sm font-medium text-gray-800">{role.name}</span>
//                           {role.description && (
//                             <p className="text-xs text-gray-500 truncate">{role.description}</p>
//                           )}
//                         </div>
//                       </label>
//                     ))}
//                   </div>
//                 </div>
//               )}
              
//               {selectedRoleIds.length > 0 && (
//                 <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
//                   <p className="text-xs text-blue-600">
//                     <span className="font-semibold">{selectedRoleIds.length}</span> role(s) selected
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="flex items-center">
//               <input
//                 type="checkbox"
//                 id="is_active"
//                 checked={form.is_active}
//                 onChange={(e) =>
//                   setForm({ ...form, is_active: e.target.checked })
//                 }
//                 className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
//               />
//               <label
//                 htmlFor="is_active"
//                 className="ml-2 text-sm text-gray-700"
//               >
//                 Active Department
//               </label>
//             </div>
//           </div>

//           {/* Modal Footer */}
//           <div className="border-t pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => setShowModal(false)}
//               className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium w-full sm:w-auto"
//             >
//               {editingDept ? "Update Department" : "Create Department"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }
//                       <td className="px-4 md:px-6 py-4">
//                         <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//                           {renderDepartmentCode(dept)}
//                         </span>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <button
//                           onClick={() => handleToggleStatus(dept)}
//                           className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                             dept.is_active
//                               ? "bg-green-100 text-green-800 hover:bg-green-200"
//                               : "bg-gray-100 text-gray-800 hover:bg-gray-200"
//                           }`}
//                           title={dept.is_active ? "Deactivate" : "Activate"}
//                         >
//                           {dept.is_active ? "Active" : "Inactive"}
//                         </button>
//                       </td>
//                       <td className="px-4 md:px-6 py-4">
//                         <div className="flex gap-1 md:gap-2">
//                           <button
//                             onClick={() => openEdit(dept)}
//                             className="p-1.5 md:p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
//                             title="Edit"
//                           >
//                             <Edit2 className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(dept)}
//                             className="p-1.5 md:p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan={4} className="px-6 py-8 text-center">
//                       <Building className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
//                       <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
//                         No departments found
//                       </h3>
//                       <p className="text-sm text-gray-600">
//                         {search || activeFilter !== null
//                           ? "Try adjusting your filters"
//                           : 'Click "Add Department" to create your first department'}
//                       </p>
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && departments.length > 0 && (
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
//               <div className="text-sm text-gray-700 text-center md:text-left">
//                 Page {currentPage} of {totalPages} • Showing{" "}
//                 {departments.length} of {totalDepartments} departments
//               </div>
//               <div className="flex items-center justify-center gap-1 md:gap-2">
//                 <button
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className={`p-2 md:px-3 md:py-1 rounded-lg border ${
//                     currentPage === 1
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
//                   }`}
//                   aria-label="Previous page"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </button>

//                 <div className="flex gap-1">
//                   {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
//                     let pageNum;
//                     if (totalPages <= 3) {
//                       pageNum = i + 1;
//                     } else if (currentPage <= 2) {
//                       pageNum = i + 1;
//                     } else if (currentPage >= totalPages - 1) {
//                       pageNum = totalPages - 2 + i;
//                     } else {
//                       pageNum = currentPage - 1 + i;
//                     }

//                     return (
//                       <button
//                         key={pageNum}
//                         onClick={() => paginate(pageNum)}
//                         className={`px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-sm ${
//                           currentPage === pageNum
//                             ? "bg-[#C62828] text-white"
//                             : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 <button
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className={`p-2 md:px-3 md:py-1 rounded-lg border ${
//                     currentPage === totalPages
//                       ? "bg-gray-100 text-gray-400 cursor-not-allowed"
//                       : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
//                   }`}
//                   aria-label="Next page"
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
//           <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-white/20 rounded-xl">
//                   <Building className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-white text-sm md:text-base">
//                     {editingDept ? "Edit Department" : "Create New Department"}
//                   </h3>
//                   <p className="text-xs text-white/90 hidden md:block">
//                     {editingDept
//                       ? "Update department details"
//                       : "Add new department to organization"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="text-white hover:bg-white/20 rounded-xl p-1.5"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleSubmit}
//               className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto"
//             >
//               <div className="space-y-4">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Department Name *
//                     </label>
//                     <input
//                       type="text"
//                       value={form.name}
//                       onChange={(e) =>
//                         setForm({ ...form, name: e.target.value })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                       placeholder="e.g., Procurement, Finance"
//                       required
//                       minLength={2}
//                       maxLength={100}
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       2-100 characters
//                     </p>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Department Code *
//                     </label>
//                     <input
//                       type="text"
//                       value={form.code}
//                       onChange={(e) =>
//                         setForm({ ...form, code: e.target.value.toUpperCase() })
//                       }
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                       placeholder="e.g., PROC, FIN"
//                       required
//                       pattern="[A-Z0-9]{2,20}"
//                       title="2-20 uppercase alphanumeric characters"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       2-20 alphanumeric characters (uppercase)
//                     </p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Description
//                   </label>
//                   <textarea
//                     value={form.description}
//                     onChange={(e) =>
//                       setForm({ ...form, description: e.target.value })
//                     }
//                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                     rows={3}
//                     placeholder="Describe the department's purpose and responsibilities..."
//                     maxLength={500}
//                   />
//                   <p className="text-xs text-gray-500 mt-1">
//                     {form.description?.length || 0}/500 characters
//                   </p>
//                 </div>

//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_active"
//                     checked={form.is_active}
//                     onChange={(e) =>
//                       setForm({ ...form, is_active: e.target.checked })
//                     }
//                     className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
//                   />
//                   <label
//                     htmlFor="is_active"
//                     className="ml-2 text-sm text-gray-700"
//                   >
//                     Active Department
//                   </label>
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="border-t pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium w-full sm:w-auto"
//                 >
//                   {editingDept ? "Update Department" : "Create Department"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Assign Manager Modal */}
//       {showManagerModal && editingDept && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
//           <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md mx-2">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 md:px-5 py-3 flex justify-between items-center">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-white/20 rounded-xl">
//                   <Users className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-white text-sm md:text-base">Assign Manager</h3>
//                   <p className="text-xs text-white/90 hidden md:block">
//                     {renderDepartmentName(editingDept)} (
//                     {renderDepartmentCode(editingDept)})
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setShowManagerModal(false)}
//                 className="text-white hover:bg-white/20 rounded-xl p-1.5"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <div className="p-4 md:p-6">
//               <div className="mb-4">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Manager
//                 </label>
//                 <select
//                   value={selectedManager}
//                   onChange={(e) => setSelectedManager(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                 >
//                   <option value="">No manager (Unassign)</option>
//                   {managers.map((manager) => (
//                     <option key={manager.id} value={manager.id}>
//                       {manager.full_name || "Unknown"} (
//                       {manager.email || "No email"}) -{" "}
//                       {manager.role || "Unknown"}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {managersLoading && (
//                 <div className="text-center py-2">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
//                 </div>
//               )}

//               {/* Modal Footer */}
//               <div className="border-t pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
//                 <button
//                   type="button"
//                   onClick={() => setShowManagerModal(false)}
//                   className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAssignManager}
//                   className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 md:px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium w-full sm:w-auto"
//                 >
//                   {selectedManager ? "Assign Manager" : "Remove Manager"}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




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
  Search,
  Menu,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  Manager,
  DepartmentStats,
  departmentsApi as DepartmentApi,
} from "../lib/departmentApi";
import MySwal from "../utils/swal";
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
  const [availableRoles, setAvailableRoles] = useState<any[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    loadDepartments();
    loadStats();
    loadManagers();
    loadAvailableRoles();
  }, [currentPage, activeFilter, sortBy, sortOrder]);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      const departments = await DepartmentApi.getAll();
      setDepartments(departments || []);
      setTotalDepartments(departments.length || 0);
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

  const loadAvailableRoles = async () => {
    setRolesLoading(true);
    try {
      const roles = await DepartmentApi.getAvailableRoles();
      // Ensure it's an array
      if (Array.isArray(roles)) {
        setAvailableRoles(roles);
      } else {
        console.warn("Roles API did not return an array:", roles);
        setAvailableRoles([]);
      }
    } catch (error: any) {
      console.error("Failed to load roles:", error);
      toast.error(error.message || "Failed to load roles");
      setAvailableRoles([]);
    } finally {
      setRolesLoading(false);
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
    setSelectedRoleIds([]);
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
    // Convert role_ids to numbers if they exist
    if (dept.role_ids && Array.isArray(dept.role_ids)) {
      setSelectedRoleIds(dept.role_ids.map(id => Number(id)));
    } else {
      setSelectedRoleIds([]);
    }
    setShowModal(true);
  };

  const openManagerModal = (dept: Department) => {
    setEditingDept(dept);
    setShowManagerModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const payload = {
        ...form,
        role_ids: selectedRoleIds.filter(id => !isNaN(id) && id > 0)
      };

      if (editingDept?.id) {
        const updatedDept = await DepartmentApi.update(editingDept.id, payload);
        toast.success("Department updated successfully");
        
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === updatedDept.id ? updatedDept : dept
          )
        );
      } else {
        const newDept = await DepartmentApi.create(payload);
        toast.success("Department created successfully");
        
        setDepartments((prev) => [newDept, ...prev]);
        setTotalDepartments((prev) => prev + 1);
      }
      
      setShowModal(false);
      loadStats();
    } catch (error: any) {
      console.error("Failed to save department:", error);
      toast.error(error.message || "Failed to save department");
    }
  };

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

      setDepartments((prev) =>
        prev.map((dept) =>
          dept.id === updatedDept.id ? updatedDept : dept
        )
      );

      setShowManagerModal(false);
      loadStats();
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

      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
      setTotalDepartments((prev) => Math.max(0, prev - 1));
      loadStats();
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

      setDepartments((prev) =>
        prev.map((d) =>
          d.id === updatedDept.id ? updatedDept : d
        )
      );
      loadStats();
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
    loadDepartments();
  };

  const handleSort = (column: "name" | "code") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderDepartmentName = (dept: Department) => {
    return dept?.name || "Unnamed Department";
  };

  const renderDepartmentCode = (dept: Department) => {
    return dept?.code || "N/A";
  };

  // Filter departments based on search and active filter
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = !search || 
      dept.name?.toLowerCase().includes(search.toLowerCase()) ||
      dept.code?.toLowerCase().includes(search.toLowerCase()) ||
      dept.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesActiveFilter = activeFilter === null || dept.is_active === activeFilter;
    
    return matchesSearch && matchesActiveFilter;
  });

  return (
    <div className="sticky top-28 z-10 bg-white rounded-xl shadow-sm border border-gray-200 mt-4 p-4 md:p-6">
                                  <div className="overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-260px)] ">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Departments Management
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            Manage organizational departments
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleResetFilters}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors order-2 md:order-1"
            title="Reset filters"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">Reset</span>
          </button>
          
          <div className="flex items-center gap-2 order-1 md:order-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full px-3 py-2 pl-9 md:pl-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                placeholder="Search departments..."
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 md:hidden" />
            </div>
            <button
              onClick={handleSearch}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hidden md:block"
            >
              Search
            </button>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 md:hidden"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 order-3"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm md:text-base">Add Department</span>
          </button>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className="md:hidden mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-600 mb-2 block">Status:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter(null)}
                  className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveFilter(true)}
                  className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter(false)}
                  className={`px-3 py-1.5 rounded-full text-sm ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                >
                  Inactive
                </button>
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="w-full px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-red-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">

          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 md:p-4 animate-pulse">
              <div className="h-3 md:h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-5 md:h-6 bg-gray-300 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-blue-600 font-medium">
                    Total Departments
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-blue-700">
                    {stats.total_departments || 0}
                  </p>
                </div>
                <Building className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-green-600 font-medium">Active</p>
                  <p className="text-lg md:text-2xl font-bold text-green-700">
                    {stats.active_departments || 0}
                  </p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Inactive</p>
                  <p className="text-lg md:text-2xl font-bold text-gray-700">
                    {stats.inactive_departments || 0}
                  </p>
                </div>
                <Filter className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-purple-600 font-medium">
                    With Manager
                  </p>
                  <p className="text-lg md:text-2xl font-bold text-purple-700">
                    {stats.departments_with_manager || 0}
                  </p>
                </div>
                <Users className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )
      )}

      {/* Filters - Desktop */}
      <div className="hidden md:flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
          Showing {filteredDepartments.length} of {totalDepartments} departments
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
     <div className=" rounded-lg border border-gray-200">
      
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDepartments.length > 0 ? (
              filteredDepartments.map((dept) => (
                <tr
                  key={dept.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 md:p-2 bg-blue-50 rounded-lg">
                        <Building className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {dept.name}
                        </div>
                        <div className="text-xs md:text-sm text-gray-500 truncate max-w-[200px] md:max-w-xs">
                          {dept.description || "No description"}
                        </div>
                        {dept.role_names && dept.role_names.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dept.role_names.map((role, index) => (
                              <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {role}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {renderDepartmentCode(dept)}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
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
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex gap-1 md:gap-2">
                      <button
                        onClick={() => openEdit(dept)}
                        className="p-1.5 md:p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept)}
                        className="p-1.5 md:p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
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
                <td colSpan={4} className="px-6 py-8 text-center">
                  <Building className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                    No departments found
                  </h3>
                  <p className="text-sm text-gray-600">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-700 text-center md:text-left">
                Page {currentPage} of {totalPages} • Showing{" "}
                {filteredDepartments.length} of {totalDepartments} departments
              </div>
              <div className="flex items-center justify-center gap-1 md:gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 md:px-3 md:py-1 rounded-lg border ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage <= 2) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 1) {
                      pageNum = totalPages - 2 + i;
                    } else {
                      pageNum = currentPage - 1 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`px-2.5 py-1 md:px-3 md:py-1 rounded-lg text-sm ${
                          currentPage === pageNum
                            ? "bg-[#C62828] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 md:px-3 md:py-1 rounded-lg border ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Building className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    {editingDept ? "Edit Department" : "Create New Department"}
                  </h3>
                  <p className="text-xs text-white/90 hidden md:block">
                    {editingDept
                      ? "Update department details and roles"
                      : "Add new department with assigned roles"}
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
              className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto"
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

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Roles
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Select which roles belong to this department
                  </p>
                  
                  {rolesLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C62828]"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading roles...</span>
                    </div>
                  ) : !Array.isArray(availableRoles) || availableRoles.length === 0 ? (
                    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-center">
                      <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">No roles available. Create roles first.</p>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableRoles.map((role) => (
                          <label
                            key={role.id}
                            className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedRoleIds.includes(Number(role.id))}
                              onChange={(e) => {
                                const roleId = Number(role.id);
                                if (e.target.checked) {
                                  setSelectedRoleIds([...selectedRoleIds, roleId]);
                                } else {
                                  setSelectedRoleIds(selectedRoleIds.filter(id => id !== roleId));
                                }
                              }}
                              className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
                            />
                            <div className="ml-2">
                              <span className="text-sm font-medium text-gray-800">{role.name}</span>
                              {role.description && (
                                <p className="text-xs text-gray-500 truncate">{role.description}</p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedRoleIds.length > 0 && (
                    <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded">
                      <p className="text-xs text-blue-600">
                        <span className="font-semibold">{selectedRoleIds.length}</span> role(s) selected
                      </p>
                    </div>
                  )}
                </div>

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
                  {editingDept ? "Update Department" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Manager Modal */}
      {showManagerModal && editingDept && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-md mx-2">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 md:px-5 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-xl">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">Assign Manager</h3>
                  <p className="text-xs text-white/90 hidden md:block">
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

            <div className="p-4 md:p-6">
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
                  {Array.isArray(managers) && managers.map((manager) => (
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
              <div className="border-t pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManagerModal(false)}
                  className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignManager}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 md:px-6 py-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-medium w-full sm:w-auto"
                >
                  {selectedManager ? "Assign Manager" : "Remove Manager"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}


