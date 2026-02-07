// src/components/RolesMaster.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Shield, Search, Menu, ChevronDown, Check, Filter } from "lucide-react";
import { toast } from "sonner";
import * as rolesApi from "../lib/rolesApi"; // Import API functions
import type { Role as RoleType } from "../lib/rolesApi"; // Import Role type

interface PermissionCategory {
    category: string;
    permissions: {
        key: string;
        label: string;
        description?: string;
    }[];
}

export default function RolesMaster() {
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleType | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        is_active: true,
    });
    const [search, setSearch] = useState("");
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const permissionCategories: PermissionCategory[] = [
        {
            category: "Dashboard",
            permissions: [
                { key: "view_dashboard", label: "View Dashboard", description: "Access to dashboard overview" },
            ],
        },
        {
            category: "Vendors",
            permissions: [
                { key: "view_vendors", label: "View Vendors", description: "View vendor list and details" },
                { key: "create_vendors", label: "Create Vendors", description: "Add new vendors" },
                { key: "edit_vendors", label: "Edit Vendors", description: "Modify vendor information" },
                { key: "delete_vendors", label: "Delete Vendors", description: "Remove vendors from system" },
            ],
        },
        {
            category: "Purchase Orders",
            permissions: [
                { key: "view_pos", label: "View POs", description: "View purchase orders" },
                { key: "create_pos", label: "Create POs", description: "Create new purchase orders" },
                { key: "edit_pos", label: "Edit POs", description: "Modify existing purchase orders" },
                { key: "delete_pos", label: "Delete POs", description: "Remove purchase orders" },
                { key: "approve_pos", label: "Approve POs", description: "Approve/reject purchase orders" },
            ],
        },
        {
            category: "Service Orders",
            permissions: [
                { key: "view_service_orders", label: "View Service Orders" },
                { key: "create_service_orders", label: "Create Service Orders" },
                { key: "edit_service_orders", label: "Edit Service Orders" },
            ],
        },
        {
            category: "Inventory & Materials",
            permissions: [
                { key: "view_inventory", label: "View Inventory" },
                { key: "create_inventory", label: "Create Inventory" },
                { key: "edit_inventory", label: "Edit Inventory" },
                { key: "delete_inventory", label: "Delete Inventory" },
                { key: "view_materials", label: "View Materials" },
                { key: "receive_materials", label: "Receive Materials" },
                { key: "view_materials_requests", label: "View Material Requests" },
                { key: "update_materials_requests", label: "Update Material Requests" },
            ],
        },
        {
            category: "Payments",
            permissions: [
                { key: "view_payments", label: "View Payments" },
                { key: "make_payments", label: "Make Payments" },
                { key: "verify_payments", label: "Verify Payments" },
            ],
        },
        {
            category: "Reports",
            permissions: [
                { key: "view_reports", label: "View Reports" },
                { key: "export_reports", label: "Export Reports" },
            ],
        },
        {
            category: "Administration",
            permissions: [
                { key: "manage_users", label: "Manage Users", description: "Create/edit/delete users" },
                { key: "manage_roles", label: "Manage Roles", description: "Create/edit/delete roles" },
                { key: "manage_permissions", label: "Manage Permissions", description: "Configure permissions" },
                { key: "manage_masters", label: "Manage Masters", description: "Manage master data" },
            ],
        },
        {
            category: "Notifications",
            permissions: [
                { key: "view_notifications", label: "View Notifications" },
            ],
        },
    ];

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await rolesApi.getAllRoles();

            // FIX: Ensure data is always an array
            let rolesArray: RoleType[] = [];

            if (Array.isArray(data)) {
                rolesArray = data;
            } else if (data && typeof data === 'object') {
                // Handle different API response formats
                if (data.data && Array.isArray(data.data)) {
                    rolesArray = data.data;
                } else if (data.roles && Array.isArray(data.roles)) {
                    rolesArray = data.roles;
                } else if (data.items && Array.isArray(data.items)) {
                    rolesArray = data.items;
                } else if (data.results && Array.isArray(data.results)) {
                    rolesArray = data.results;
                } else {
                    // If it's an object but not in expected format, convert to array
                    rolesArray = Object.values(data).filter(item =>
                        item && typeof item === 'object' && 'id' in item
                    ) as RoleType[];
                }
            }

            console.log("Loaded roles:", rolesArray);
            setRoles(rolesArray);

        } catch (error: any) {
            console.error("Failed to load roles:", error);
            toast.error(error?.response?.data?.message || "Failed to load roles");
            setRoles([]); // CRITICAL: Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingRole(null);
        setForm({ name: "", description: "", is_active: true });
        setPermissions({});
        setShowModal(true);
        setIsMobileMenuOpen(false);
    };

    const openEdit = (role: RoleType) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || "",
            is_active: role.is_active,
        });
        setPermissions(role.permissions || {});
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            const payload = {
                ...form,
                permissions,
            };

            if (editingRole) {
                await rolesApi.updateRole(editingRole.id, payload);
                toast.success("Role updated successfully");
            } else {
                await rolesApi.createRole(payload);
                toast.success("Role created successfully");
            }

            setShowModal(false);
            loadRoles();
        } catch (error: any) {
            console.error("Failed to save role:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to save role"
            );
        }
    };

    const handleDelete = async (role: RoleType) => {
        if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

        try {
            await rolesApi.deleteRole(role.id);
            toast.success("Role deleted successfully");
            loadRoles();
        } catch (error: any) {
            console.error("Failed to delete role:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to delete role"
            );
        }
    };

    const togglePermission = (key: string) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleAllPermissions = (value: boolean) => {
        const allPermissions: Record<string, boolean> = {};
        permissionCategories.forEach(category => {
            category.permissions.forEach(perm => {
                allPermissions[perm.key] = value;
            });
        });
        setPermissions(allPermissions);
    };

    const handleToggleActive = async (roleId: string, currentStatus: boolean) => {
        try {
            await rolesApi.updateRole(roleId, { is_active: !currentStatus });
            toast.success(`Role ${currentStatus ? "deactivated" : "activated"} successfully`);
            loadRoles();
        } catch (error: any) {
            console.error("Failed to toggle role status:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to update role status"
            );
        }
    };

    // FIXED: Safe filteredRoles calculation with useMemo
    const filteredRoles = useMemo(() => {
        // Safety check - ensure roles is always an array
        if (!Array.isArray(roles)) {
            console.warn("Roles is not an array, returning empty array", roles);
            return [];
        }

        return roles.filter(role => {
            if (!role || typeof role !== 'object') return false;

            const name = role.name || "";
            const description = role.description || "";
            const searchTerm = search.toLowerCase();

            return name.toLowerCase().includes(searchTerm) ||
                description.toLowerCase().includes(searchTerm);
        });
    }, [roles, search]);

    const getPermissionCount = (role: RoleType) => {
        if (!role.permissions) return 0;
        return Object.values(role.permissions).filter(Boolean).length;
    };

    return (
      <div className="sticky top-24 z-10 bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
    {/* Header Section - Sticky */}
    <div className="p-4 md:p-6 border-b border-gray-200">
        {/* Header - Responsive */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div className="flex justify-between items-center md:block">
                <div>
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800">Roles Management</h2>
                    <p className="text-xs md:text-sm text-gray-500">Define and manage user roles and permissions</p>
                </div>
                {/* Mobile menu button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                    aria-label="Toggle mobile menu"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Search and Add Role - Desktop */}
            <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-64"
                        placeholder="Search roles..."
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Role
                </button>
            </div>

            {/* Mobile Menu - Search and Add Role */}
            {isMobileMenuOpen && (
                <div className="md:hidden flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                            placeholder="Search roles..."
                        />
                    </div>
                    <button
                        onClick={openCreate}
                        className="w-full bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
                    >
                        <Plus className="w-5 h-5" /> Add New Role
                    </button>
                </div>
            )}

            {/* Mobile Search and Filter Bar - Always visible on mobile */}
            <div className="md:hidden flex items-center gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                        placeholder="Search roles..."
                    />
                </div>
                <button
                    onClick={openCreate}
                    className="p-2.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
                    aria-label="Add role"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredRoles.length}</span> role{filteredRoles.length !== 1 ? 's' : ''}
            </p>
            <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="md:hidden flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
                <Filter className="w-4 h-4" />
                Filter
            </button>
        </div>

        {/* Mobile Filter Options */}
        {showMobileFilters && (
            <div className="md:hidden mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm">
                        All Roles
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm">
                        Active Only
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm">
                        Inactive Only
                    </button>
                </div>
            </div>
        )}
    </div>

    {/* Scrollable Cards Section */}
    <div className="overflow-y-auto max-h-[calc(100vh-370px)] md:max-h-[calc(100vh-330px)] p-4 md:p-6">
        {/* Loading State */}
        {loading ? (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
                <p className="text-gray-600">Loading roles...</p>
            </div>
        ) : (
            <>
                {/* Roles Grid - Responsive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.map((role) => (
                        <div
                            key={role.id}
                            className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all duration-200 bg-white"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate" title={role.name}>
                                        {role.name}
                                    </h3>
                                    {role.description && (
                                        <p className="text-xs md:text-sm text-gray-600 mt-1 line-clamp-2" title={role.description}>
                                            {role.description}
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleToggleActive(role.id, role.is_active)}
                                    className={`px-2 py-1 md:px-3 md:py-1 rounded text-xs font-medium flex-shrink-0 ${role.is_active
                                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        } transition-colors`}
                                >
                                    {role.is_active ? "ACTIVE" : "INACTIVE"}
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                <span className="text-xs md:text-sm text-gray-600">
                                    {getPermissionCount(role)} permissions
                                </span>
                            </div>

                            <div className="text-xs text-gray-500 mb-4">
                                <div className="flex items-center gap-1">
                                    <span>Created:</span>
                                    <span>{new Date(role.created_at || "").toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEdit(role)}
                                    className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                                >
                                    <Edit2 className="w-3 h-3 md:w-3 md:h-3" /> <span>Edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(role)}
                                    className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                                    disabled={role.name.toLowerCase() === "admin"}
                                >
                                    <Trash2 className="w-3 h-3 md:w-3 md:h-3" /> <span>Delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredRoles.length === 0 && (
                    <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Shield className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                            {search ? "No matching roles found" : "No roles created yet"}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mb-4 px-4">
                            {search ? "Try a different search term" : 'Click "Add Role" to create your first role'}
                        </p>
                        {!search && (
                            <button
                                onClick={openCreate}
                                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium mx-auto"
                            >
                                <Plus className="w-4 h-4" /> Create First Role
                            </button>
                        )}
                    </div>
                )}
            </>
        )}
    </div>

    {/* Add/Edit Modal - Responsive */}
    {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-full md:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-hidden mx-2">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white/20 rounded-xl">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-base md:text-lg">
                                {editingRole ? "Edit Role" : "Create New Role"}
                            </h3>
                            <p className="text-xs text-white/90 hidden md:block">
                                {editingRole ? "Update role details and permissions" : "Define new role and assign permissions"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowModal(false)}
                        className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-colors"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(95vh-60px)] md:max-h-[calc(90vh-80px)] overflow-y-auto">
                    {/* Basic Information */}
                    <div className="mb-6 md:mb-8">
                        <h4 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                            <span className="bg-gray-100 p-1.5 rounded-lg">
                                <Shield className="w-4 h-4 text-gray-600" />
                            </span>
                            Basic Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role Name *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all text-base"
                                    placeholder="e.g., Administrator, Manager"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all text-base"
                                    placeholder="Brief description of this role"
                                />
                            </div>
                        </div>
                        <div className="flex items-start mt-4 md:mt-6">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828] mt-0.5"
                            />
                            <div className="ml-3">
                                <label htmlFor="is_active" className="text-sm text-gray-700 font-medium block">
                                    Active Role
                                </label>
                                <span className="text-xs text-gray-500 block mt-1">
                                    (Inactive roles cannot be assigned to users)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <div className="mb-6 md:mb-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 md:mb-6">
                            <h4 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <span className="bg-gray-100 p-1.5 rounded-lg">
                                    <Shield className="w-4 h-4 text-gray-600" />
                                </span>
                                Permissions
                            </h4>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => toggleAllPermissions(true)}
                                    className="px-3 py-1.5 md:px-4 md:py-2 bg-green-50 text-green-600 text-xs md:text-sm rounded-lg hover:bg-green-100 transition-colors font-medium"
                                >
                                    Select All
                                </button>
                                <button
                                    type="button"
                                    onClick={() => toggleAllPermissions(false)}
                                    className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 text-gray-600 text-xs md:text-sm rounded-lg hover:bg-gray-100 transition-colors font-medium"
                                >
                                    Clear All
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 md:space-y-6">
                            {permissionCategories.map((category) => (
                                <div key={category.category} className="border border-gray-200 rounded-xl p-3 md:p-5 bg-gray-50">
                                    <h5 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-lg">{category.category}</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                        {category.permissions.map((perm) => (
                                            <label
                                                key={perm.key}
                                                className={`flex items-start p-3 md:p-4 border rounded-lg cursor-pointer transition-all ${permissions[perm.key]
                                                    ? "border-[#C62828] bg-red-50"
                                                    : "border-gray-200 bg-white hover:bg-gray-50"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!permissions[perm.key]}
                                                    onChange={() => togglePermission(perm.key)}
                                                    className="mt-1 w-4 h-4 md:w-5 md:h-5 text-[#C62828] rounded focus:ring-[#C62828]"
                                                />
                                                <div className="ml-3 md:ml-4">
                                                    <div className="font-medium text-gray-800 text-sm md:text-base">{perm.label}</div>
                                                    {perm.description && (
                                                        <div className="text-xs md:text-sm text-gray-500 mt-1 md:mt-1.5">{perm.description}</div>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 md:mb-8 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <h5 className="font-semibold text-blue-800 mb-1 md:mb-2 text-sm md:text-base">Permissions Summary</h5>
                        <p className="text-xs md:text-sm text-blue-600">
                            Selected {Object.values(permissions).filter(Boolean).length} out of {permissionCategories.reduce((total, cat) => total + cat.permissions.length, 0)} permissions
                        </p>
                    </div>

                    {/* Modal Footer */}
                    <div className="border-t pt-4 md:pt-6 flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2.5 md:px-8 md:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm md:text-base order-2 sm:order-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2.5 md:px-8 md:py-2.5 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-sm hover:shadow text-sm md:text-base order-1 sm:order-2"
                        >
                            {editingRole ? "Update Role" : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}

    {/* Add CSS for animations */}
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
    `}</style>
</div>
    );
}