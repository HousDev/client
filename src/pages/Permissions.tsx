import { useState, useEffect } from "react";
import { Shield, Users, Key, Save, CheckCircle } from "lucide-react";
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

  // STATIC permission list
  const permissionsList = [
    { action: "full_access", label: "Full Access", module: "Full Access" },
    { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },
    { action: "view_vendors", label: "View Vendors", module: "Vendors" },
    { action: "create_vendors", label: "Create Vendors", module: "Vendors" },
    { action: "edit_vendors", label: "Edit Vendors", module: "Vendors" },
    { action: "delete_vendors", label: "Delete Vendors", module: "Vendors" },
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
    { action: "view_materials", label: "View Materials", module: "Materials" },
    {
      action: "receive_materials",
      label: "Receive Materials",
      module: "Materials",
    },
    { action: "view_payments", label: "View Payments", module: "Payments" },
    { action: "make_payments", label: "Make Payments", module: "Payments" },
    { action: "verify_payments", label: "Verify Payments", module: "Payments" },
    { action: "view_reports", label: "View Reports", module: "Reports" },
    { action: "export_reports", label: "Export Reports", module: "Reports" },
    { action: "manage_users", label: "Manage Users", module: "Users" },
    { action: "manage_roles", label: "Manage Roles", module: "Roles" },
    {
      action: "manage_permissions",
      label: "Manage Permissions",
      module: "Permissions",
    },
    {
      action: "create_notifications",
      label: "Create Notifications",
      module: "Notifications",
    },
    {
      action: "view_notifications",
      label: "View Notifications",
      module: "Notifications",
    },
    {
      action: "update_notifications",
      label: "Update Notifications",
      module: "Notifications",
    },
    {
      action: "delete_notifications",
      label: "Delete Notifications",
      module: "Notifications",
    },
  ];

  const loadUsers = async () => {
    try {
      const usersRes: any = await UsersApi.list();

      setSelectedUser(Array.isArray(usersRes) ? usersRes[0].id : {});
      setUserPermissions(
        Array.isArray(usersRes) ? usersRes[0].permissions : {},
      );
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      console.log("users", usersRes);
    } catch (error) {
      toast.error("Something went wrong while loading roles");
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const rolesRes: any = await rolesApi.getAllRoles();
      setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0].id : {});
      setRolePermissions(
        Array.isArray(rolesRes) ? rolesRes[0].permissions : {},
      );
      setRoles(Array.isArray(rolesRes) ? rolesRes : []);
      console.log("roles", rolesRes);
    } catch (error) {
      toast.error("Something went wrong while loading roles");
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

  const handleRolePermissionChange = (action: string, value: boolean) => {
    setRolePermissions((prev) => ({ ...prev, [action]: value }));
  };

  const handleUserPermissionChange = (action: string, value: boolean) => {
    setUserPermissions((prev) => ({ ...prev, [action]: value }));
  };

  const updateRolePermissions = async () => {
    try {
      console.log(rolePermissions, "dfasjdhfkh");
      const rolePermissionRes = await rolesApi.updateRolePermissions(
        selectedRole,
        rolePermissions,
      );
      if (rolePermissionRes.success) {
        loadRoles();
        toast.success("Role Permssions Updated Successfully.");
      }
      console.log(rolePermissionRes);
    } catch (error) {
      toast.error("Something went wrong while updating role permissions.");
    }
  };

  const saveUserPermissions = async () => {
    try {
      console.log("this is permissions for testing", userPermissions);
      const userPermissionsRes: any = await UsersApi.updateUserPermissions(
        selectedUser,
        userPermissions,
      );

      if (userPermissionsRes.success) {
        loadUsers();
        toast.success("User Permissions Updated Successfully.");
      }
    } catch (e) {
      toast.error("Something went wrong while updating user permissions.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Permissions</h1>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("role-permissions")}
            className={`flex-1 py-4 text-center ${activeTab === "role-permissions" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : ""}`}
          >
            <Shield className="w-5 h-5 inline-block mr-2" />
            Role Permissions
          </button>

          <button
            onClick={() => {
              setActiveTab("user-permissions");
              console.log(users[0].id, users[0]?.permissions);
              setSelectedUser(users[0].id);
              setUserPermissions(users[0]?.permissions || {});
            }}
            className={`flex-1 py-4 text-center ${activeTab === "user-permissions" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : ""}`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            User Permissions
          </button>
        </div>

        <div className="p-6">
          {/* ---------- ROLE PERMISSIONS TAB ---------- */}
          {activeTab === "role-permissions" && (
            <div className="space-y-6">
              <select
                value={selectedRole}
                onChange={(e) => {
                  const newRole = e.target.value;
                  setSelectedRole(newRole);
                  console.log(roles, newRole);
                  const r = roles.find((x: any) => x.id === Number(newRole));
                  console.log(r);
                  setRolePermissions(r?.permissions ?? {});
                }}
                className="border p-3 rounded-lg"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>

              {Object.entries(groupedPermissions).map(
                ([module, perms]: [any, any]) => (
                  <div key={module} className="border p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">{module}</h3>
                    <div className="grid grid-cols-3">
                      {perms.map((perm: any) => (
                        <label key={perm.action} className="block py-1">
                          <input
                            type="checkbox"
                            checked={!!rolePermissions[perm.action]}
                            onChange={(e) =>
                              handleRolePermissionChange(
                                perm.action,
                                e.target.checked,
                              )
                            }
                            className="mr-2"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}
              <button
                onClick={updateRolePermissions}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Save
              </button>
            </div>
          )}

          {/* ---------- USER PERMISSIONS TAB ---------- */}
          {activeTab === "user-permissions" && (
            <div className="space-y-6">
              <select
                value={selectedUser}
                onChange={(e) => {
                  const uid = e.target.value;
                  setSelectedUser(uid);
                  const u = users.find((x) => x.id === uid);
                  setUserPermissions(u?.permissions ?? {});
                  if (u?.role) {
                    setSelectedRole(u.role);
                    const r = roles.find(
                      (x) =>
                        x.name.toLowerCase() === (u.role ?? "").toLowerCase() ||
                        x.id === u.role,
                    );
                    setRolePermissions(r?.permissions ?? {});
                  }
                }}
                className="border p-3 rounded-lg"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} ({u.role ?? "No role"})
                  </option>
                ))}
              </select>

              {Object.entries(groupedPermissions).map(
                ([module, perms]: [any, any]) => (
                  <div key={module} className="border p-4 rounded-lg">
                    <h3 className="font-semibold mb-3">{module}</h3>
                    <div className="grid grid-cols-3">
                      {perms.map((perm: any) => (
                        <label key={perm.action} className="block py-1">
                          <input
                            type="checkbox"
                            checked={!!userPermissions[perm.action]}
                            onChange={(e) =>
                              handleUserPermissionChange(
                                perm.action,
                                e.target.checked,
                              )
                            }
                            className="mr-2"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ),
              )}

              <button
                onClick={saveUserPermissions}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
              >
                <Save className="w-5 h-5" /> Save
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
        <CheckCircle className="text-green-600 w-5 h-5" />
        <p className="text-green-800 text-sm">
          This is a static demo page. No real permission enforcement is applied.
          If an admin user exists in localStorage it was auto-selected.
        </p>
      </div>
    </div>
  );
}

