import { useState, useEffect } from "react";
import { Shield, Users, Key, Save, CheckCircle } from "lucide-react";

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
  ];

  const groupedPermissions = permissionsList.reduce((acc: any, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  // Default static roles
  const defaultRoles: Role[] = [
    {
      id: "admin",
      name: "admin",
      description: "Full Access",
      permissions: Object.fromEntries(
        permissionsList.map((p) => [p.action, true]),
      ),
    },
    {
      id: "manager",
      name: "manager",
      description: "Manager Role",
      permissions: {},
    },
    { id: "staff", name: "staff", description: "Staff Role", permissions: {} },
  ];

  // Default static users
  const defaultUsers: User[] = [
    {
      id: "1",
      full_name: "Alice Admin",
      email: "alice@example.com",
      role: "admin",
      permissions: {},
    },
    {
      id: "2",
      full_name: "Bob Manager",
      email: "bob@example.com",
      role: "manager",
      permissions: {},
    },
    {
      id: "3",
      full_name: "Charlie Staff",
      email: "charlie@example.com",
      role: "staff",
      permissions: {},
    },
  ];

  // Try to read known localStorage keys to find your actual users (and pick admin if present)
  const loadUsersFromLocalStorage = (): User[] | null => {
    const keysToTry = [
      "users_master_data_v1",
      "mock_users_v1",
      "MOCK_USERS_KEY",
      "mock_users_v1",
    ];
    for (const key of keysToTry) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // normalize items that might have different property names
          const normalized: User[] = parsed.map((p: any, idx: number) => ({
            id: p.id ?? p.user_id ?? String(idx + 1),
            full_name:
              p.full_name ??
              p.name ??
              p.fullName ??
              p.username ??
              `User ${idx + 1}`,
            email: p.email ?? p.username ?? "",
            role: p.role ?? p.role_name ?? p.roleName ?? undefined,
            permissions: p.permissions ?? {},
          }));
          return normalized;
        }
      } catch (e) {
        // ignore parse errors and continue to next key
      }
    }
    return null;
  };

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      // load roles (static defaults)
      setRoles(defaultRoles);

      // try to get users from localStorage (various keys)
      const storedUsers = loadUsersFromLocalStorage();
      const useUsers = storedUsers ?? defaultUsers;
      setUsers(useUsers);

      // find an admin user (role === 'admin' case-insensitive)
      const adminUser =
        useUsers.find(
          (u) => (u.role ?? "").toString().toLowerCase() === "admin",
        ) ??
        useUsers.find((u) =>
          (u.email ?? "").toString().toLowerCase().includes("admin"),
        ) ??
        useUsers[0];

      if (adminUser) {
        setSelectedUser(adminUser.id);
        setUserPermissions(adminUser.permissions ?? {});
        // if the adminUser's role exists in our roles, select it and set rolePermissions
        const roleMatch =
          defaultRoles.find(
            (r) =>
              r.name.toLowerCase() === (adminUser.role ?? "").toLowerCase(),
          ) ?? defaultRoles[0];
        setSelectedRole(roleMatch.id);
        setRolePermissions(roleMatch.permissions ?? {});
      } else {
        setSelectedUser(useUsers[0]?.id ?? "");
        setSelectedRole(defaultRoles[0].id);
        setRolePermissions(defaultRoles[0].permissions ?? {});
      }

      setLoading(false);
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRolePermissionChange = (action: string, value: boolean) => {
    setRolePermissions((prev) => ({ ...prev, [action]: value }));
  };

  const handleUserPermissionChange = (action: string, value: boolean) => {
    setUserPermissions((prev) => ({ ...prev, [action]: value }));
  };

  const saveUserPermissions = () => {
    // Static demo: show alert and mirror into local state (no backend)
    alert("Saved (static demo)");
    // optionally persist to localStorage 'mock_users_v1' so next load remembers
    try {
      const updatedUsers = users.map((u) =>
        u.id === selectedUser
          ? {
              ...u,
              permissions: { ...(u.permissions || {}), ...userPermissions },
            }
          : u,
      );
      localStorage.setItem("mock_users_v1", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (e) {
      // ignore storage errors
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
            onClick={() => setActiveTab("user-permissions")}
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
                  const r = roles.find(
                    (x) => x.id === newRole || x.name === newRole,
                  );
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
                ),
              )}
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

// src/pages/Permissions.tsx
// import React, { useEffect, useState } from "react";
// import {
//   Shield,
//   Users,
//   Key,
//   Save,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { api, unwrap, UsersApi } from "../lib/Api";

// type Role = {
//   id: string;
//   name: string;
//   description?: string;
//   permissions?: Record<string, boolean>;
// };
// type User = {
//   id: string;
//   full_name?: string;
//   email?: string;
//   role?: string | number;
//   permissions?: Record<string, boolean>;
// };

// export default function Permissions() {
//   const [activeTab, setActiveTab] = useState<"role-permissions" | "user-permissions">("role-permissions");
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [selectedUser, setSelectedUser] = useState<string>("");
//   const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
//   const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
//   const [loading, setLoading] = useState(true);

//   // STATIC permission list
//   const permissionsList = [
//     { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },
//     { action: "view_vendors", label: "View Vendors", module: "Vendors" },
//     { action: "create_vendors", label: "Create Vendors", module: "Vendors" },
//     { action: "edit_vendors", label: "Edit Vendors", module: "Vendors" },
//     { action: "delete_vendors", label: "Delete Vendors", module: "Vendors" },
//     { action: "view_pos", label: "View Purchase Orders", module: "Purchase Orders" },
//     { action: "create_pos", label: "Create Purchase Orders", module: "Purchase Orders" },
//     { action: "edit_pos", label: "Edit Purchase Orders", module: "Purchase Orders" },
//     { action: "delete_pos", label: "Delete Purchase Orders", module: "Purchase Orders" },
//     { action: "approve_pos", label: "Approve Purchase Orders", module: "Purchase Orders" },
//     { action: "view_materials", label: "View Materials", module: "Materials" },
//     { action: "receive_materials", label: "Receive Materials", module: "Materials" },
//     { action: "view_payments", label: "View Payments", module: "Payments" },
//     { action: "make_payments", label: "Make Payments", module: "Payments" },
//     { action: "verify_payments", label: "Verify Payments", module: "Payments" },
//     { action: "view_reports", label: "View Reports", module: "Reports" },
//     { action: "export_reports", label: "Export Reports", module: "Reports" },
//     { action: "manage_users", label: "Manage Users", module: "Users" },
//     { action: "manage_roles", label: "Manage Roles", module: "Roles" },
//     { action: "manage_permissions", label: "Manage Permissions", module: "Permissions" },
//   ];

//   const groupedPermissions = permissionsList.reduce((acc: any, p) => {
//     if (!acc[p.module]) acc[p.module] = [];
//     acc[p.module].push(p);
//     return acc;
//   }, {});

//   // Default static roles
//   const defaultRoles: Role[] = [
//     { id: "admin", name: "admin", description: "Full Access", permissions: Object.fromEntries(permissionsList.map(p => [p.action, true])) },
//     { id: "manager", name: "manager", description: "Manager Role", permissions: {} },
//     { id: "staff", name: "staff", description: "Staff Role", permissions: {} }
//   ];

//   // Default static users
//   const defaultUsers: User[] = [
//     { id: "1", full_name: "Alice Admin", email: "alice@example.com", role: "admin", permissions: {} },
//     { id: "2", full_name: "Bob Manager", email: "bob@example.com", role: "manager", permissions: {} },
//     { id: "3", full_name: "Charlie Staff", email: "charlie@example.com", role: "staff", permissions: {} },
//   ];

//   // Try to read known localStorage keys to find your actual users (and pick admin if present)
//   const loadUsersFromLocalStorage = (): User[] | null => {
//     const keysToTry = ["users_master_data_v1", "mock_users_v1", "MOCK_USERS_KEY", "mock_users_v1"];
//     for (const key of keysToTry) {
//       try {
//         const raw = localStorage.getItem(key);
//         if (!raw) continue;
//         const parsed = JSON.parse(raw);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           // normalize items that might have different property names
//           const normalized: User[] = parsed.map((p: any, idx: number) => ({
//             id: p.id ?? p.user_id ?? String(idx + 1),
//             full_name: p.full_name ?? p.name ?? p.fullName ?? p.username ?? `User ${idx + 1}`,
//             email: p.email ?? p.username ?? "",
//             role: p.role ?? p.role_name ?? p.roleName ?? undefined,
//             permissions: p.permissions ?? {},
//           }));
//           return normalized;
//         }
//       } catch (e) {
//         // ignore parse errors and continue to next key
//       }
//     }
//     return null;
//   };

//   useEffect(() => {
//     setLoading(true);

//         // try common shapes (priority)
//         if (Array.isArray(raw?.data)) rolesArray = raw.data;
//         else if (Array.isArray(raw?.data?.roles)) rolesArray = raw.data.roles;
//         else if (Array.isArray(raw?.data?.data)) rolesArray = raw.data.data;
//         else if (Array.isArray(raw)) rolesArray = raw;
//         // else if (Array.isArray(raw?.roles)) rolesArray = raw.roles; //updated by sachin paithane commented this line
//         else if (raw?.data && typeof raw.data === "object") {
//           // find first array in data
//           const firstArr = Object.values(raw.data).find((v) =>
//             Array.isArray(v),
//           );
//           if (Array.isArray(firstArr)) rolesArray = firstArr as any[];
//         }
//       } else {
//         setSelectedUser(useUsers[0]?.id ?? "");
//         setSelectedRole(defaultRoles[0].id);
//         setRolePermissions(defaultRoles[0].permissions ?? {});
//       }

//       setLoading(false);
//     }
//   }

//   // load role permissions: prefer /roles/:id/permissions, else read from roles[] normalized
//   async function loadRolePermissions(roleId: string) {
//     try {
//       const res = await api
//         .get(`/roles/${encodeURIComponent(roleId)}/permissions`)
//         .catch(() => null);
//       if (res && res.data && typeof res.data.permissions === "object") {
//         const normalized: Record<string, boolean> = {};
//         Object.keys(res.data.permissions).forEach(
//           (k) => (normalized[k] = !!res.data.permissions[k]),
//         );
//         setRolePermissions(normalized);
//         return;
//       }

//       const r = roles.find((x) => String(x.id) === String(roleId));
//       if (r && r.permissions && typeof r.permissions === "object") {
//         const normalized: Record<string, boolean> = {};
//         Object.keys(r.permissions).forEach(
//           (k) => (normalized[k] = !!(r.permissions as any)[k]),
//         );
//         setRolePermissions(normalized);
//         return;
//       }

//       setRolePermissions({});
//     } catch (err) {
//       console.error("loadRolePermissions error:", err);
//       setRolePermissions({});
//     }
//   }

//   async function handleRolePermissionChange(action: string, granted: boolean) {
//     if (!selectedRole) return;
//     setRolePermissions((prev) => ({ ...prev, [action]: granted }));
//     setSavingRole(true);
//     try {
//       const payload = {
//         permissions: { ...(rolePermissions || {}), [action]: granted },
//       };
//       console.log(payload, "from handlechagne");
//       await unwrap(
//         api.put(
//           `/roles/${encodeURIComponent(selectedRole)}/permissions`,
//           payload,
//         ),
//       );
//     } catch (err) {
//       console.error("Failed saving role permission:", err);
//       alert("Failed to save role permission — reloading server value.");
//       await loadRolePermissions(selectedRole);
//     } finally {
//       setSavingRole(false);
//     }
//   }

//   // load user permissions (try /users/:id/permissions, fallback to users[].permissions, fallback to role)
//   async function loadUserPermissions(userId: string) {
//     try {
//       const res = await api
//         .get(`/users/${encodeURIComponent(userId)}/permissions`)
//         .catch(() => null);
//       if (res && res.data && typeof res.data.permissions === "object") {
//         const normalized: Record<string, boolean> = {};
//         Object.keys(res.data.permissions).forEach(
//           (k) => (normalized[k] = !!res.data.permissions[k]),
//         );
//         setUserPermissions(normalized);
//         return;
//       }

//       const u = users.find((x) => String(x.id) === String(userId));
//       if (u && u.permissions && typeof u.permissions === "object") {
//         const normalized: Record<string, boolean> = {};
//         Object.keys(u.permissions).forEach(
//           (k) => (normalized[k] = !!(u.permissions as any)[k]),
//         );
//         setUserPermissions(normalized);
//         return;
//       }

//       if (u && u.role) {
//         const roleObj = roles.find(
//           (r) =>
//             String(r.id) === String(u.role) ||
//             String(r.name).toLowerCase() === String(u.role).toLowerCase(),
//         );
//         if (roleObj && roleObj.permissions) {
//           const normalized: Record<string, boolean> = {};
//           Object.keys(roleObj.permissions).forEach(
//             (k) => (normalized[k] = !!(roleObj.permissions as any)[k]),
//           );
//           setUserPermissions(normalized);
//           return;
//         }
//       }

//   const handleUserPermissionChange = (action: string, value: boolean) => {
//     setUserPermissions(prev => ({ ...prev, [action]: value }));
//   };

//   const saveUserPermissions = () => {
//     // Static demo: show alert and mirror into local state (no backend)
//     alert("Saved (static demo)");
//     // optionally persist to localStorage 'mock_users_v1' so next load remembers
//     try {
//       const payload = { permissions: userPermissions };
//       await unwrap(
//         api.put(
//           `/users/${encodeURIComponent(selectedUser)}/permissions`,
//           payload,
//         ),
//       );
//       setUsers((prev) =>
//         prev.map((u) =>
//           String(u.id) === String(selectedUser)
//             ? { ...u, permissions: userPermissions }
//             : u,
//         ),
//       );
//       alert("User permissions saved successfully!");
//     } catch (err) {
//       console.error("saveUserPermissions error:", err);
//       alert("Failed to save user permissions.");
//       await loadUserPermissions(selectedUser);
//     } finally {
//       setSavingUser(false);
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
//       </div>
//     );

//   return (
//     <div className="space-y-6 p-6">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="flex border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab("role-permissions")}
//             className={`flex-1 py-4 text-center ${activeTab === "role-permissions" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : ""}`}
//           >
//             <Shield className="w-5 h-5 inline-block mr-2" />
//             Role Permissions
//           </button>

//           <button
//             onClick={() => setActiveTab("user-permissions")}
//             className={`flex-1 py-4 text-center ${activeTab === "user-permissions" ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : ""}`}
//           >
//             <Users className="w-5 h-5 inline-block mr-2" />
//             User Permissions
//           </button>
//         </div>

//         <div className="p-6">
//           {/* ---------- ROLE PERMISSIONS TAB ---------- */}
//           {activeTab === "role-permissions" && (
//             <div className="space-y-6">
//               <select
//                 value={selectedRole}
//                 onChange={(e) => {
//                   const newRole = e.target.value;
//                   setSelectedRole(newRole);
//                   const r = roles.find(x => x.id === newRole || x.name === newRole);
//                   setRolePermissions(r?.permissions ?? {});
//                 }}
//                 className="border p-3 rounded-lg"
//               >
//                 {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
//               </select>

//               {Object.entries(groupedPermissions).map(([module, perms]:[any,any]) => (
//                 <div key={module} className="border p-4 rounded-lg">
//                   <h3 className="font-semibold mb-3">{module}</h3>
//                   {perms.map((perm: any) => (
//                     <label key={perm.action} className="block py-1">
//                       <input
//                         type="checkbox"
//                         checked={!!rolePermissions[perm.action]}
//                         onChange={(e) => handleRolePermissionChange(perm.action, e.target.checked)}
//                         className="mr-2"
//                       />
//                       {perm.label}
//                     </label>
//                   ))}
//                 </select>
//               </div>

//               <div className="space-y-6">
//                 {Object.entries(groupedPermissions).map(
//                   ([module, perms]: [string, any]) => (
//                     <div
//                       key={module}
//                       className="border border-gray-200 rounded-lg p-4"
//                     >
//                       <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                         <Key className="w-5 h-5 text-blue-600" />
//                         {module}
//                       </h3>
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                         {perms.map((perm: any) => (
//                           <label
//                             key={perm.action}
//                             className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={rolePermissions[perm.action] === true}
//                               onChange={(e) =>
//                                 handleRolePermissionChange(
//                                   perm.action,
//                                   e.target.checked,
//                                 )
//                               }
//                               className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                             />
//                             <span className="text-sm font-medium text-gray-700">
//                               {perm.label}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>
//                   ),
//                 )}
//               </div>

//               {savingRole && (
//                 <div className="text-sm text-gray-500">
//                   Saving role changes...
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* ---------- USER PERMISSIONS TAB ---------- */}
//           {activeTab === "user-permissions" && (
//             <div className="space-y-6">
//               <select
//                 value={selectedUser}
//                 onChange={(e) => {
//                   const uid = e.target.value;
//                   setSelectedUser(uid);
//                   const u = users.find(x => x.id === uid);
//                   setUserPermissions(u?.permissions ?? {});
//                   if (u?.role) {
//                     setSelectedRole(u.role);
//                     const r = roles.find(x => x.name.toLowerCase() === (u.role ?? "").toLowerCase() || x.id === u.role);
//                     setRolePermissions(r?.permissions ?? {});
//                   }
//                 }}
//                 className="border p-3 rounded-lg"
//               >
//                 {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.role ?? "No role"})</option>)}
//               </select>

//               {Object.entries(groupedPermissions).map(([module, perms]:[any,any]) => (
//                 <div key={module} className="border p-4 rounded-lg">
//                   <h3 className="font-semibold mb-3">{module}</h3>
//                   {perms.map((perm: any) => (
//                     <label key={perm.action} className="block py-1">
//                       <input
//                         type="checkbox"
//                         checked={!!userPermissions[perm.action]}
//                         onChange={(e) => handleUserPermissionChange(perm.action, e.target.checked)}
//                         className="mr-2"
//                       />
//                       {perm.label}
//                     </label>
//                   ))}
//                 </select>
//               </div>

//               {selectedUser && (
//                 <>
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                     <p className="text-sm text-blue-800">
//                       <strong>Note:</strong> User-specific permissions override
//                       role permissions.
//                     </p>
//                   </div>

//                   <div className="space-y-6">
//                     {Object.entries(groupedPermissions).map(
//                       ([module, perms]: [string, any]) => (
//                         <div
//                           key={module}
//                           className="border border-gray-200 rounded-lg p-4"
//                         >
//                           <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                             <Key className="w-5 h-5 text-blue-600" />
//                             {module}
//                           </h3>
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                             {perms.map((perm: any) => (
//                               <label
//                                 key={perm.action}
//                                 className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition"
//                               >
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     userPermissions[perm.action] === true
//                                   }
//                                   onChange={(e) =>
//                                     setUserPermissions({
//                                       ...userPermissions,
//                                       [perm.action]: e.target.checked,
//                                     })
//                                   }
//                                   className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                                 />
//                                 <span className="text-sm font-medium text-gray-700">
//                                   {perm.label}
//                                 </span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       ),
//                     )}
//                   </div>

//                   <div className="flex gap-3 pt-6 border-t">
//                     <button
//                       onClick={saveUserPermissions}
//                       className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2 shadow-sm"
//                     >
//                       <Save className="w-5 h-5" />
//                       {savingUser ? "Saving..." : "Save User Permissions"}
//                     </button>
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
//         <CheckCircle className="text-green-600 w-5 h-5" />
//         <p className="text-green-800 text-sm">
//           This is a static demo page. No real permission enforcement is applied. If an admin user exists in localStorage it was auto-selected.
//         </p>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from 'react';
// import { Shield, Check, X, Edit2, Save, XCircle } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';

// interface Permission {
//   [key: string]: boolean | { [key: string]: boolean };
// }

// interface RoleData {
//   id: string;
//   name: string;
//   permissions: Record<string, any>;
// }

// interface Module {
//   name: string;
//   label: string;
//   permissions: { key: string; label: string }[];
// }

// const MODULES: Module[] = [
//   {
//     name: 'employees',
//     label: 'Employee Management',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'create', label: 'Create' },
//       { key: 'edit', label: 'Edit' },
//       { key: 'delete', label: 'Delete' },
//       { key: 'export', label: 'Export' },
//       { key: 'bulk_actions', label: 'Bulk Actions' },
//     ],
//   },
//   {
//     name: 'attendance',
//     label: 'Attendance',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'mark', label: 'Mark Attendance' },
//       { key: 'regularize', label: 'Regularize' },
//       { key: 'approve', label: 'Approve' },
//       { key: 'geolocation_track', label: 'Geolocation Tracking' },
//       { key: 'auto_logout', label: 'Auto Logout Config' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'leaves',
//     label: 'Leave Management',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'apply', label: 'Apply Leave' },
//       { key: 'approve', label: 'Approve' },
//       { key: 'configure', label: 'Configure' },
//       { key: 'view_all_balances', label: 'View All Balances' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'payroll',
//     label: 'Payroll',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'create', label: 'Create' },
//       { key: 'process', label: 'Process' },
//       { key: 'approve', label: 'Approve' },
//       { key: 'export', label: 'Export' },
//       { key: 'configure', label: 'Configure' },
//     ],
//   },
//   {
//     name: 'expenses',
//     label: 'Expense Management',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'submit', label: 'Submit' },
//       { key: 'approve', label: 'Approve' },
//       { key: 'reject', label: 'Reject' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'recruitment',
//     label: 'Recruitment',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'create', label: 'Create' },
//       { key: 'manage', label: 'Manage' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'tickets',
//     label: 'Ticketing System',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'create', label: 'Create' },
//       { key: 'assign', label: 'Assign' },
//       { key: 'resolve', label: 'Resolve' },
//       { key: 'escalate', label: 'Escalate' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'documents',
//     label: 'Document Management',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'generate', label: 'Generate' },
//       { key: 'approve', label: 'Approve' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'reports',
//     label: 'Reports & Analytics',
//     permissions: [
//       { key: 'view', label: 'View' },
//       { key: 'create', label: 'Create' },
//       { key: 'schedule', label: 'Schedule' },
//       { key: 'export', label: 'Export' },
//     ],
//   },
//   {
//     name: 'settings',
//     label: 'System Settings',
//     permissions: [
//       { key: 'organization', label: 'Organization' },
//       { key: 'locations', label: 'Locations' },
//       { key: 'security', label: 'Security' },
//       { key: 'roles', label: 'Roles & Permissions' },
//       { key: 'integrations', label: 'Integrations' },
//     ],
//   },
// ];

// export default function Roles() {
//   const [roles, setRoles] = useState<RoleData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [editingRole, setEditingRole] = useState<string | null>(null);
//   const [editedPermissions, setEditedPermissions] = useState<Record<string, any>>({});

//   useEffect(() => {
//     loadRoles();
//   }, []);

//   const loadRoles = async () => {
//     setLoading(true);
//     try {
//       const defaultRoles: RoleData[] = [
//         {
//           id: '1',
//           name: 'Admin',
//           permissions: {}
//         },
//         {
//           id: '2',
//           name: 'HR Manager',
//           permissions: {}
//         },
//         {
//           id: '3',
//           name: 'Attendance Manager',
//           permissions: {}
//         },
//         {
//           id: '4',
//           name: 'Accountant',
//           permissions: {}
//         },
//         {
//           id: '5',
//           name: 'Employee',
//           permissions: {}
//         },
//       ];
//       setRoles(defaultRoles);
//     } catch (error) {
//       console.error('Error loading roles:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startEdit = (role: RoleData) => {
//     setEditingRole(role.id);
//     setEditedPermissions({ ...role.permissions });
//   };

//   const cancelEdit = () => {
//     setEditingRole(null);
//     setEditedPermissions({});
//   };

//   const saveRole = async (roleId: string) => {
//     try {
//       alert('Role permissions updated successfully!');
//       setEditingRole(null);
//       loadRoles();
//     } catch (error: any) {
//       console.error('Error updating role:', error);
//       alert(error.message || 'Failed to update role');
//     }
//   };

//   const togglePermission = (module: string, permission: string, value: boolean) => {
//     setEditedPermissions((prev) => ({
//       ...prev,
//       [module]: {
//         ...prev[module],
//         [permission]: value,
//       },
//     }));
//   };

//   const getModulePermissions = (permissions: any, moduleName: string) => {
//     if (!permissions) return {};
//     const modulePerms = permissions[moduleName];
//     if (!modulePerms) {
//       const module = MODULES.find(m => m.name === moduleName);
//       if (module) {
//         const defaultPerms: Record<string, boolean> = {};
//         module.permissions.forEach(perm => {
//           defaultPerms[perm.key] = true;
//         });
//         return defaultPerms;
//       }
//       return {};
//     }
//     if (typeof modulePerms === 'object') return modulePerms;
//     return {};
//   };

//   const getRoleColor = (roleName: string) => {
//     switch (roleName) {
//       case 'Admin':
//         return 'bg-red-50 border-red-200';
//       case 'HR Manager':
//         return 'bg-blue-50 border-blue-200';
//       case 'Attendance Manager':
//         return 'bg-green-50 border-green-200';
//       case 'Accountant':
//         return 'bg-amber-50 border-amber-200';
//       case 'Employee':
//         return 'bg-slate-50 border-slate-200';
//       default:
//         return 'bg-slate-50 border-slate-200';
//     }
//   };

//   const getRoleIcon = (roleName: string) => {
//     switch (roleName) {
//       case 'Admin':
//         return '👑';
//       case 'HR Manager':
//         return '👔';
//       case 'Attendance Manager':
//         return '📋';
//       case 'Accountant':
//         return '💰';
//       case 'Employee':
//         return '👤';
//       default:
//         return '👥';
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <p className="text-slate-600">Loading roles...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
//           <p className="text-slate-600 mt-1">Manage HRMS module access and permissions</p>
//         </div>
//         <Shield className="h-8 w-8 text-blue-600" />
//       </div>

//       <div className="space-y-4">
//         {roles.map((role) => {
//           const isEditing = editingRole === role.id;
//           const displayPerms = isEditing ? editedPermissions : role.permissions;

//           return (
//             <Card key={role.id} className={`border-2 ${getRoleColor(role.name)} transition-all`}>
//               <div className="p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="flex items-center gap-3">
//                     <span className="text-3xl">{getRoleIcon(role.name)}</span>
//                     <div>
//                       <h2 className="text-xl font-bold text-slate-900">{role.name}</h2>
//                       <p className="text-sm text-slate-600">
//                         {isEditing ? 'Editing permissions...' : 'Click edit to modify permissions'}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     {isEditing ? (
//                       <>
//                         <Button
//                           size="sm"
//                           onClick={() => saveRole(role.id)}
//                           disabled={loading}
//                         >
//                           <Save className="h-4 w-4 mr-1" />
//                           Save
//                         </Button>
//                         <Button size="sm" variant="secondary" onClick={cancelEdit}>
//                           <XCircle className="h-4 w-4 mr-1" />
//                           Cancel
//                         </Button>
//                       </>
//                     ) : (
//                       <Button
//                         size="sm"
//                         variant="secondary"
//                         onClick={() => startEdit(role)}
//                       >
//                         <Edit2 className="h-4 w-4 mr-1" />
//                         Edit
//                       </Button>
//                     )}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                   {MODULES.map((module) => {
//                     const modulePerms = getModulePermissions(displayPerms, module.name);

//                     return (
//                       <div key={module.name} className="border border-slate-200 rounded-lg p-4">
//                         <h3 className="font-semibold text-slate-900 mb-3 text-sm">{module.label}</h3>
//                         <div className="space-y-2">
//                           {module.permissions.map((perm) => {
//                             const isEnabled = modulePerms[perm.key];

//                             return (
//                               <label
//                                 key={perm.key}
//                                 className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${isEditing
//                                     ? isEnabled
//                                       ? 'bg-blue-50'
//                                       : 'hover:bg-slate-50'
//                                     : isEnabled
//                                       ? 'bg-blue-50'
//                                       : ''
//                                   }`}
//                               >
//                                 {isEditing ? (
//                                   <input
//                                     type="checkbox"
//                                     checked={isEnabled || false}
//                                     onChange={(e) =>
//                                       togglePermission(module.name, perm.key, e.target.checked)
//                                     }
//                                     className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                                   />
//                                 ) : isEnabled ? (
//                                   <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
//                                 ) : (
//                                   <X className="h-4 w-4 text-slate-400 flex-shrink-0" />
//                                 )}
//                                 <span
//                                   className={`text-sm ${isEnabled ? 'text-slate-900 font-medium' : 'text-slate-500'
//                                     }`}
//                                 >
//                                   {perm.label}
//                                 </span>
//                               </label>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             </Card>
//           );
//         })}
//       </div>

//       <Card className="bg-blue-50 border-blue-200 p-6">
//         <div className="flex gap-3">
//           <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <div>
//             <h3 className="font-semibold text-blue-900">Permission Management</h3>
//             <p className="text-sm text-blue-800 mt-1">
//               Role permissions control module access for all users assigned to that role. Use the Edit button to modify permissions for each role. Changes apply immediately to all users with that role.
//             </p>
//           </div>
//         </div>
//       </Card>
//     </div>
//   );
// }
