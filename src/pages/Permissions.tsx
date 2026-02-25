import { useState, useEffect } from "react";
import { Shield, Users, Search } from "lucide-react";
import { toast } from "sonner";
import rolesApi from "../lib/rolesApi";
import { UsersApi } from "../lib/Api";

type Role = {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, boolean>;
};

type User = {
  id: string;
  full_name: string;
  email: string;
  role?: string;
  permissions?: Record<string, boolean>;
};

export default function Permissions() {
  const [activeTab, setActiveTab] = useState<
    "role-permissions" | "user-permissions"
  >("role-permissions");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<
    Record<string, boolean>
  >({});
  const [userPermissions, setUserPermissions] = useState<
    Record<string, boolean>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectAllEnabled, setSelectAllEnabled] = useState(false);

  // COMPLETE PERMISSIONS LIST
  const permissionsList = [
    // Settings
    { action: "full_access", label: "Full Access", module: "Settings" },
    { action: "view_settings", label: "View Settings", module: "Settings" },
    { action: "edit_settings", label: "Edit Settings", module: "Settings" },

    // Dashboard
    { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },

    // Vendors
    { action: "view_vendors", label: "View Vendors", module: "Vendors" },
    { action: "create_vendors", label: "Create Vendors", module: "Vendors" },
    { action: "edit_vendors", label: "Edit Vendors", module: "Vendors" },
    { action: "delete_vendors", label: "Delete Vendors", module: "Vendors" },

    // Purchase Orders
    {
      action: "view_pos",
      label: "View Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "create_pos",
      label: "Create Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "edit_pos",
      label: "Edit Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "delete_pos",
      label: "Delete Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "approve_pos",
      label: "Approve Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "reject_pos",
      label: "Reject Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "authorize_pos",
      label: "Authorize Purchase Orders",
      module: "Purchase Orders",
    },
    {
      action: "reject_authorize_pos",
      label: "Reject Authorization",
      module: "Purchase Orders",
    },
    {
      action: "download_pdf_pos",
      label: "Download PO PDF",
      module: "Purchase Orders",
    },
    { action: "view_pdf_pos", label: "View PO PDF", module: "Purchase Orders" },
    {
      action: "make_payment_pos",
      label: "Make Payment",
      module: "Purchase Orders",
    },

    // Work Orders
    {
      action: "view_wo",
      label: "View Work Orders",
      module: "Work Orders",
    },
    {
      action: "create_wo",
      label: "Create Work Orders",
      module: "Work Orders",
    },
    {
      action: "edit_wo",
      label: "Edit Work Orders",
      module: "Work Orders",
    },
    {
      action: "delete_wo",
      label: "Delete Work Orders",
      module: "Work Orders",
    },
    {
      action: "approve_wo",
      label: "Approve Work Orders",
      module: "Work Orders",
    },
    {
      action: "reject_wo",
      label: "Reject Work Orders",
      module: "Work Orders",
    },
    {
      action: "authorize_wo",
      label: "Authorize Work Orders",
      module: "Work Orders",
    },
    {
      action: "reject_authorize_wo",
      label: "Reject Authorization",
      module: "Work Orders",
    },
    {
      action: "download_pdf_wo",
      label: "Download WO PDF",
      module: "Work Orders",
    },
    { action: "view_pdf_wo", label: "View WO PDF", module: "Work Orders" },
    {
      action: "make_payment_wo",
      label: "Make Payment",
      module: "Work Orders",
    },

    // Store Management
    {
      action: "view_inventory",
      label: "View Inventory",
      module: "Store Management",
    },
    {
      action: "edit_inventory",
      label: "Edit Inventory",
      module: "Store Management",
    },
    {
      action: "make_reminders",
      label: "Make Reminders",
      module: "Store Management",
    },
    {
      action: "view_challan",
      label: "View Challan",
      module: "Store Management",
    },
    { action: "material_in", label: "Material In", module: "Store Management" },
    {
      action: "material_out",
      label: "Material Out",
      module: "Store Management",
    },
    {
      action: "material_issue",
      label: "Material Issue",
      module: "Store Management",
    },

    // Material Tracking
    {
      action: "view_po_tracking",
      label: "View PO Tracking",
      module: "Tracking",
    },
    {
      action: "view_wo_tracking",
      label: "Receive WO Tracking",
      module: "Tracking",
    },

    // Material Requests
    {
      action: "view_material_requests",
      label: "View Material Requests",
      module: "Material Requests",
    },
    {
      action: "make_material_requests",
      label: "Make Material Requests",
      module: "Material Requests",
    },
    {
      action: "make_material_requests_for_po",
      label: "Make Material Requests for PO",
      module: "Material Requests",
    },
    {
      action: "approve_material_request",
      label: "Approve Material Request",
      module: "Material Requests",
    },
    {
      action: "reject_material_request",
      label: "Reject Material Request",
      module: "Material Requests",
    },

    // Payments
    { action: "view_payments", label: "View Payments", module: "Payments" },
    { action: "make_payments", label: "Make Payments", module: "Payments" },
    { action: "verify_payments", label: "Verify Payments", module: "Payments" },
    { action: "mark_seen", label: "Mark Seen", module: "Payments" },
    { action: "send_reminder", label: "Send Reminder", module: "Payments" },

    // Task Management
    { action: "view_task", label: "View Tasks", module: "Task Management" },
    { action: "create_task", label: "Create Task", module: "Task Management" },
    { action: "update_task", label: "Update Task", module: "Task Management" },
    {
      action: "update_task_progress",
      label: "Update Task Progress",
      module: "Task Management",
    },
    { action: "delete_task", label: "Delete Task", module: "Task Management" },
    {
      action: "view_task_photos",
      label: "View Task Photos",
      module: "Task Management",
    },

    // Projects
    { action: "view_projects", label: "View Projects", module: "Projects" },
    {
      action: "view_projects_details",
      label: "View Projects Details",
      module: "Projects",
    },
    { action: "create_project", label: "Create Project", module: "Projects" },
    {
      action: "create_project_details",
      label: "Create Project Details",
      module: "Projects",
    },
    { action: "update_project", label: "Update Project", module: "Projects" },
    {
      action: "update_project_details",
      label: "Update Project Details",
      module: "Projects",
    },
    { action: "delete_project", label: "Delete Project", module: "Projects" },
    {
      action: "delete_project_details",
      label: "Delete Project Details",
      module: "Projects",
    },

    // HRMS
    { action: "view_hrms", label: "View HRMS", module: "HRMS" },

    // Notifications
    {
      action: "view_notifications",
      label: "View Notifications",
      module: "Notifications",
    },

    // Reports
    { action: "view_reports", label: "View Reports", module: "Reports" },
    { action: "export_reports", label: "Export Reports", module: "Reports" },

    // Administration
    {
      action: "manage_master",
      label: "Manage Master",
      module: "Administration",
    },
    {
      action: "manage_settings",
      label: "Manage Settings",
      module: "Administration",
    },
    {
      action: "manage_permissions",
      label: "Manage Permissions",
      module: "Administration",
    },
    {
      action: "view_users_list",
      label: "View Users List",
      module: "Administration",
    },
    {
      action: "create_new_users",
      label: "Create New Users",
      module: "Administration",
    },
    { action: "edit_users", label: "Edit Users", module: "Administration" },
    { action: "delete_users", label: "Delete Users", module: "Administration" },
    {
      action: "export_users_data",
      label: "Export User Data",
      module: "Administration",
    },
    {
      action: "user_bulk_action",
      label: "User Bulk Actions",
      module: "Administration",
    },
  ];

  const loadUsers = async () => {
    try {
      const usersRes: any = await UsersApi.list();
      setSelectedUser(Array.isArray(usersRes) ? usersRes[0]?.id : "");
      setUserPermissions(
        Array.isArray(usersRes) ? usersRes[0]?.permissions || {} : {},
      );
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const loadRoles = async () => {
    try {
      const rolesRes: any = await rolesApi.getAllRoles();
      setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0]?.id : "");
      setRolePermissions(
        Array.isArray(rolesRes) ? rolesRes[0]?.permissions || {} : {},
      );
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
    } catch (error) {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const groupedPermissions = permissionsList.reduce((acc: any, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const handlePermissionChange = (action: string, value: boolean) => {
    if (activeTab === "role-permissions") {
      setRolePermissions((prev) => ({ ...prev, [action]: value }));
    } else {
      setUserPermissions((prev) => ({ ...prev, [action]: value }));
    }
  };

  const handleModuleSelectAll = (perms: any[]) => {
    const currentPermissions =
      activeTab === "role-permissions" ? rolePermissions : userPermissions;
    const moduleAllChecked = perms.every(
      (perm) => currentPermissions[perm.action],
    );

    const newPermissions = { ...currentPermissions };
    perms.forEach((perm) => {
      newPermissions[perm.action] = !moduleAllChecked;
    });

    if (activeTab === "role-permissions") {
      setRolePermissions(newPermissions);
    } else {
      setUserPermissions(newPermissions);
    }
  };

  const handleGlobalSelectAll = () => {
    const newSelectAllState = !selectAllEnabled;
    setSelectAllEnabled(newSelectAllState);

    const newPermissions: Record<string, boolean> = {};

    permissionsList.forEach((perm) => {
      newPermissions[perm.action] = newSelectAllState;
    });

    if (activeTab === "role-permissions") {
      setRolePermissions(newPermissions);
    } else {
      setUserPermissions(newPermissions);
    }
  };

  const updateRolePermissions = async () => {
    try {
      const rolePermissionRes = await rolesApi.updateRolePermissions(
        selectedRole,
        rolePermissions,
      );
      if (rolePermissionRes.success) {
        loadRoles();
        toast.success("Role permissions updated successfully");
      }
    } catch (error) {
      toast.error("Failed to update role permissions");
    }
  };

  const saveUserPermissions = async () => {
    try {
      const userPermissionsRes: any = await UsersApi.updateUserPermissions(
        selectedUser,
        userPermissions,
      );
      if (userPermissionsRes.success) {
        loadUsers();
        toast.success("User permissions updated successfully");
      }
    } catch (e) {
      toast.error("Failed to update user permissions");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );
  }

  const currentPermissions =
    activeTab === "role-permissions" ? rolePermissions : userPermissions;

  return (
    // ✅ REMOVED ALL PADDING - Changed from "p-4 md:p-6 lg:p-8" to NO padding classes
    <div className="min-h-screen px-0 mx-0 bg-gray-50">
      {/* Tabs - NO padding */}
      <div className="bg-white border-b">
        <div className="flex">
          <button
            onClick={() => setActiveTab("role-permissions")}
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "role-permissions"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Role Permissions
          </button>

          <button
            onClick={() => {
              setActiveTab("user-permissions");
              if (users.length > 0) {
                setSelectedUser(users[0].id);
                setUserPermissions(users[0]?.permissions || {});
              }
            }}
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "user-permissions"
                ? "text-blue-600 border-blue-600"
                : "text-gray-600 border-transparent hover:text-gray-900"
            }`}
          >
            <Users className="w-4 h-4 inline-block mr-2" />
            Direct User Overrides
          </button>
        </div>
      </div>

      {/* Content - Reduced padding from p-6 to p-4 */}
      <div className="bg-white shadow-sm p-4">
        {/* Role/User Selection with Global Select All Button - Reduced margin */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              TARGET ROLE
            </label>
            <select
              value={
                activeTab === "role-permissions" ? selectedRole : selectedUser
              }
              onChange={(e) => {
                if (activeTab === "role-permissions") {
                  const newRole = e.target.value;
                  setSelectedRole(newRole);
                  const r = roles.find((x: any) => x.id === Number(newRole));
                  setRolePermissions(r?.permissions || {});
                } else {
                  const uid = e.target.value;
                  setSelectedUser(uid);
                  const u = users.find((x) => x.id === uid);
                  setUserPermissions(u?.permissions || {});
                }
              }}
              className="w-full md:w-auto max-w-md border-2 border-blue-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {activeTab === "role-permissions"
                ? roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))
                : users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name}
                    </option>
                  ))}
            </select>
          </div>

          {/* Global Select All Button */}
          <button
            onClick={handleGlobalSelectAll}
            className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors shadow-sm ${selectAllEnabled ? "bg-[#C62828] text-white hover:bg-red-700" : "bg-[#C62828] text-white hover:bg-red-700"}`}
          >
            {selectAllEnabled ? "Deselect All" : "Select All"}
          </button>
        </div>

        {/* ✅ Permissions Grid - Reduced gap from gap-6 to gap-4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedPermissions).map(
            ([module, perms]: [any, any]) => {
              const moduleAllChecked = perms.every(
                (perm: any) => currentPermissions[perm.action],
              );
              const actionsCount = perms.length;

              return (
                <div
                  key={module}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all"
                >
                  {/* Module Header */}
                  <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {module}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {actionsCount}{" "}
                        {actionsCount === 1 ? "Action" : "Actions"}
                      </span>
                    </div>

                    {/* SELECT ALL with Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs font-semibold text-blue-600 uppercase">
                        SELECT ALL
                      </span>
                      <input
                        type="checkbox"
                        checked={moduleAllChecked}
                        onChange={() => handleModuleSelectAll(perms)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Permissions List */}
                  <div className="p-4 bg-gray-50">
                    <div className="space-y-0 divide-y divide-gray-100">
                      {perms.map((perm: any) => {
                        const isChecked = !!currentPermissions[perm.action];
                        return (
                          <label
                            key={perm.action}
                            className="flex items-center justify-between py-3 cursor-pointer hover:bg-white px-2 rounded transition-colors group"
                          >
                            <span className="text-sm text-gray-700">
                              {perm.label}
                            </span>

                            {/* Checkbox on RIGHT */}
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  handlePermissionChange(
                                    perm.action,
                                    e.target.checked,
                                  )
                                }
                                className="sr-only peer"
                              />
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                                  isChecked
                                    ? "bg-blue-600 border-blue-600"
                                    : "border-gray-300 bg-white group-hover:border-blue-400"
                                }`}
                              >
                                {isChecked && (
                                  <svg
                                    className="w-3.5 h-3.5 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* Save Button - Reduced margin */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={
              activeTab === "role-permissions"
                ? updateRolePermissions
                : saveUserPermissions
            }
            className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
