// import { useState, useEffect } from "react";
// import { Shield, Users, Key, Save, CheckCircle } from "lucide-react";

// type Role = { id: string; name: string; description?: string; permissions?: Record<string, boolean> };
// type User = { id: string; full_name: string; email: string; role?: string; permissions?: Record<string, boolean> };

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

//     setTimeout(() => {
//       // load roles (static defaults)
//       setRoles(defaultRoles);

//       // try to get users from localStorage (various keys)
//       const storedUsers = loadUsersFromLocalStorage();
//       const useUsers = storedUsers ?? defaultUsers;
//       setUsers(useUsers);

//       // find an admin user (role === 'admin' case-insensitive)
//       const adminUser = useUsers.find(u => (u.role ?? "").toString().toLowerCase() === "admin")
//         ?? useUsers.find(u => (u.email ?? "").toString().toLowerCase().includes("admin"))
//         ?? useUsers[0];

//       if (adminUser) {
//         setSelectedUser(adminUser.id);
//         setUserPermissions(adminUser.permissions ?? {});
//         // if the adminUser's role exists in our roles, select it and set rolePermissions
//         const roleMatch = defaultRoles.find(r => r.name.toLowerCase() === (adminUser.role ?? "").toLowerCase()) ?? defaultRoles[0];
//         setSelectedRole(roleMatch.id);
//         setRolePermissions(roleMatch.permissions ?? {});
//       } else {
//         setSelectedUser(useUsers[0]?.id ?? "");
//         setSelectedRole(defaultRoles[0].id);
//         setRolePermissions(defaultRoles[0].permissions ?? {});
//       }

//       setLoading(false);
//     }, 300);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const handleRolePermissionChange = (action: string, value: boolean) => {
//     setRolePermissions(prev => ({ ...prev, [action]: value }));
//   };

//   const handleUserPermissionChange = (action: string, value: boolean) => {
//     setUserPermissions(prev => ({ ...prev, [action]: value }));
//   };

//   const saveUserPermissions = () => {
//     // Static demo: show alert and mirror into local state (no backend)
//     alert("Saved (static demo)");
//     // optionally persist to localStorage 'mock_users_v1' so next load remembers
//     try {
//       const updatedUsers = users.map(u => u.id === selectedUser ? { ...u, permissions: { ...(u.permissions || {}), ...userPermissions } } : u);
//       localStorage.setItem("mock_users_v1", JSON.stringify(updatedUsers));
//       setUsers(updatedUsers);
//     } catch (e) {
//       // ignore storage errors
//     }
//   };

//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Permissions</h1>

//       {/* Tabs */}
//       <div className="bg-white rounded-xl shadow-sm border">
//         <div className="flex border-b">
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
//                 </div>
//               ))}

//               <button
//                 onClick={saveUserPermissions}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
//               >
//                 <Save className="w-5 h-5" /> Save
//               </button>
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

import { useState, useEffect } from "react";
import { Shield, Users, Key, Save, CheckCircle, Search, Filter, ChevronDown, Menu, X, Eye, Edit, Trash } from "lucide-react";

type Role = { id: string; name: string; description?: string; permissions?: Record<string, boolean> };
type User = { id: string; full_name: string; email: string; role?: string; permissions?: Record<string, boolean> };

export default function Permissions() {
  const [activeTab, setActiveTab] = useState<"role-permissions" | "user-permissions">("role-permissions");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  // STATIC permission list
  const permissionsList = [
    { action: "view_dashboard", label: "View Dashboard", module: "Dashboard", icon: Eye },
    { action: "view_vendors", label: "View Vendors", module: "Vendors", icon: Eye },
    { action: "create_vendors", label: "Create Vendors", module: "Vendors", icon: Edit },
    { action: "edit_vendors", label: "Edit Vendors", module: "Vendors", icon: Edit },
    { action: "delete_vendors", label: "Delete Vendors", module: "Vendors", icon: Trash },
    { action: "view_pos", label: "View Purchase Orders", module: "Purchase Orders", icon: Eye },
    { action: "create_pos", label: "Create Purchase Orders", module: "Purchase Orders", icon: Edit },
    { action: "edit_pos", label: "Edit Purchase Orders", module: "Purchase Orders", icon: Edit },
    { action: "delete_pos", label: "Delete Purchase Orders", module: "Purchase Orders", icon: Trash },
    { action: "approve_pos", label: "Approve Purchase Orders", module: "Purchase Orders", icon: Shield },
    { action: "view_materials", label: "View Materials", module: "Materials", icon: Eye },
    { action: "receive_materials", label: "Receive Materials", module: "Materials", icon: Edit },
    { action: "view_payments", label: "View Payments", module: "Payments", icon: Eye },
    { action: "make_payments", label: "Make Payments", module: "Payments", icon: Edit },
    { action: "verify_payments", label: "Verify Payments", module: "Payments", icon: Shield },
    { action: "view_reports", label: "View Reports", module: "Reports", icon: Eye },
    { action: "export_reports", label: "Export Reports", module: "Reports", icon: Edit },
    { action: "manage_users", label: "Manage Users", module: "Users", icon: Users },
    { action: "manage_roles", label: "Manage Roles", module: "Roles", icon: Shield },
    { action: "manage_permissions", label: "Manage Permissions", module: "Permissions", icon: Key },
  ];

  const groupedPermissions = permissionsList.reduce((acc: any, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  // Default static roles
  const defaultRoles: Role[] = [
    { id: "admin", name: "admin", description: "Full Access", permissions: Object.fromEntries(permissionsList.map(p => [p.action, true])) },
    { id: "manager", name: "manager", description: "Manager Role", permissions: {} },
    { id: "staff", name: "staff", description: "Staff Role", permissions: {} }
  ];

  // Default static users
  const defaultUsers: User[] = [
    { id: "1", full_name: "Alice Admin", email: "alice@example.com", role: "admin", permissions: {} },
    { id: "2", full_name: "Bob Manager", email: "bob@example.com", role: "manager", permissions: {} },
    { id: "3", full_name: "Charlie Staff", email: "charlie@example.com", role: "staff", permissions: {} },
  ];

  // Try to read known localStorage keys to find your actual users (and pick admin if present)
  const loadUsersFromLocalStorage = (): User[] | null => {
    const keysToTry = ["users_master_data_v1", "mock_users_v1", "MOCK_USERS_KEY", "mock_users_v1"];
    for (const key of keysToTry) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // normalize items that might have different property names
          const normalized: User[] = parsed.map((p: any, idx: number) => ({
            id: p.id ?? p.user_id ?? String(idx + 1),
            full_name: p.full_name ?? p.name ?? p.fullName ?? p.username ?? `User ${idx + 1}`,
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
      const adminUser = useUsers.find(u => (u.role ?? "").toString().toLowerCase() === "admin")
        ?? useUsers.find(u => (u.email ?? "").toString().toLowerCase().includes("admin"))
        ?? useUsers[0];

      if (adminUser) {
        setSelectedUser(adminUser.id);
        setUserPermissions(adminUser.permissions ?? {});
        // if the adminUser's role exists in our roles, select it and set rolePermissions
        const roleMatch = defaultRoles.find(r => r.name.toLowerCase() === (adminUser.role ?? "").toLowerCase()) ?? defaultRoles[0];
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
    setRolePermissions(prev => ({ ...prev, [action]: value }));
  };

  const handleUserPermissionChange = (action: string, value: boolean) => {
    setUserPermissions(prev => ({ ...prev, [action]: value }));
  };

  const saveUserPermissions = () => {
    // Static demo: show alert and mirror into local state (no backend)
    alert("Saved (static demo)");
    // optionally persist to localStorage 'mock_users_v1' so next load remembers
    try {
      const updatedUsers = users.map(u => u.id === selectedUser ? { ...u, permissions: { ...(u.permissions || {}), ...userPermissions } } : u);
      localStorage.setItem("mock_users_v1", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (e) {
      // ignore storage errors
    }
  };

  // Filtered permissions based on search
  const filteredGroupedPermissions = Object.entries(groupedPermissions).reduce((acc: any, [module, perms]: [any, any]) => {
    if (searchTerm) {
      const filteredPerms = perms.filter((perm: any) => 
        perm.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        module.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredPerms.length > 0) {
        acc[module] = filteredPerms;
      }
    } else {
      acc[module] = perms;
    }
    return acc;
  }, {});

  // Toggle module expansion
  const toggleModule = (module: string) => {
    setExpandedModule(expandedModule === module ? null : module);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin h-8 w-8 border-b-2 border-[#C62828] rounded-full"></div>
      </div>
    );

  return (
    <div className="space-y-4 p-2 mt-0">
      

      {/* Tabs - Compact */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("role-permissions")}
            className={`flex-1 py-2 px-3 text-center flex items-center justify-center gap-1.5 text-xs ${activeTab === "role-permissions" 
              ? "bg-red-50 text-[#C62828] border-b-2 border-[#C62828] font-semibold" 
              : "hover:bg-gray-50 text-gray-600"}`}
          >
            <Shield className="w-3 h-3" />
            Role Permissions
          </button>

          <button
            onClick={() => setActiveTab("user-permissions")}
            className={`flex-1 py-2 px-3 text-center flex items-center justify-center gap-1.5 text-xs ${activeTab === "user-permissions" 
              ? "bg-red-50 text-[#C62828] border-b-2 border-[#C62828] font-semibold" 
              : "hover:bg-gray-50 text-gray-600"}`}
          >
            <Users className="w-3 h-3" />
            User Permissions
          </button>
        </div>

        <div className="p-3">
          {/* Selection Dropdowns - Compact */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            {activeTab === "role-permissions" ? (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    const newRole = e.target.value;
                    setSelectedRole(newRole);
                    const r = roles.find(x => x.id === newRole || x.name === newRole);
                    setRolePermissions(r?.permissions ?? {});
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#C62828] focus:border-transparent bg-white"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id} className="text-sm py-1">
                      {r.name} - {r.description}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => {
                    const uid = e.target.value;
                    setSelectedUser(uid);
                    const u = users.find(x => x.id === uid);
                    setUserPermissions(u?.permissions ?? {});
                    if (u?.role) {
                      setSelectedRole(u.role);
                      const r = roles.find(x => x.name.toLowerCase() === (u.role ?? "").toLowerCase() || x.id === u.role);
                      setRolePermissions(r?.permissions ?? {});
                    }
                  }}
                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#C62828] focus:border-transparent bg-white"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id} className="text-sm py-1">
                      {u.full_name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* COMPACT Permissions Grid */}
          <div className="space-y-3">
            {Object.entries(filteredGroupedPermissions).map(([module, perms]: [any, any]) => {
              const IconComponent = perms[0]?.icon || Shield;
              const selectedPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;
              const selectedCount = perms.filter((perm: any) => selectedPermissions[perm.action]).length;
              
              return (
                <div key={module} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {/* Module Header - Clickable to expand */}
                  <button
                    onClick={() => toggleModule(module)}
                    className="w-full p-2 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-red-50 rounded">
                        <IconComponent className="w-3 h-3 text-[#C62828]" />
                      </div>
                      <span className="text-sm font-medium text-gray-800">{module}</span>
                      <span className="text-xs text-gray-500">({perms.length})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${selectedCount === perms.length ? 'bg-green-100 text-green-700' : selectedCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                        {selectedCount}/{perms.length}
                      </span>
                      <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${expandedModule === module ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {/* Permissions List - Collapsible */}
                  {expandedModule === module && (
                    <div className="p-2 border-t border-gray-100">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
                        {perms.map((perm: any) => {
                          const PermIcon = perm.icon;
                          const isSelected = !!selectedPermissions[perm.action];
                          return (
                            <label 
                              key={perm.action} 
                              className={`flex items-center p-1.5 rounded-md border text-xs transition-all cursor-pointer min-w-0 ${isSelected 
                                ? "border-[#C62828] bg-red-50" 
                                : "border-gray-200 hover:bg-gray-50"}`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (activeTab === "role-permissions") {
                                    handleRolePermissionChange(perm.action, e.target.checked);
                                  } else {
                                    handleUserPermissionChange(perm.action, e.target.checked);
                                  }
                                }}
                                className="w-3 h-3 text-[#C62828] rounded focus:ring-1 focus:ring-[#C62828] flex-shrink-0"
                              />
                              <div className="ml-1.5 flex items-center gap-1.5 min-w-0">
                                <PermIcon className="w-2.5 h-2.5 text-gray-500 flex-shrink-0" />
                                <span className="font-medium text-gray-700 truncate">{perm.label}</span>
                              </div>
                              <div className={`ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-[#C62828]' : 'bg-gray-300'}`} />
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary Stats - Compact */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600">
                  {activeTab === "role-permissions" ? "Role" : "User"} Permissions
                </div>
                <div className="text-sm font-semibold text-[#C62828]">
                  {Object.values(activeTab === "role-permissions" ? rolePermissions : userPermissions).filter(Boolean).length} / {permissionsList.length}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-gray-600">Modules</div>
                <div className="text-sm font-semibold text-gray-800">
                  {Object.keys(filteredGroupedPermissions).length}
                </div>
              </div>

              {activeTab === "user-permissions" && (
                <button
                  onClick={saveUserPermissions}
                  className="px-3 py-1.5 bg-[#C62828] text-white text-xs rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Quick Actions - Compact */}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                const allPerms = Object.fromEntries(permissionsList.map(p => [p.action, true]));
                if (activeTab === "role-permissions") {
                  setRolePermissions(allPerms);
                } else {
                  setUserPermissions(allPerms);
                }
              }}
              className="p-2 text-xs bg-green-50 text-green-700 rounded-md border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3 h-3" />
              Select All
            </button>
            <button
              onClick={() => {
                if (activeTab === "role-permissions") {
                  setRolePermissions({});
                } else {
                  setUserPermissions({});
                }
              }}
              className="p-2 text-xs bg-gray-50 text-gray-700 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear All
            </button>
          </div>

          {/* Role-based reset for user permissions */}
          {activeTab === "user-permissions" && (
            <button
              onClick={() => {
                const u = users.find(x => x.id === selectedUser);
                if (u?.role) {
                  const r = roles.find(x => x.name.toLowerCase() === (u.role ?? "").toLowerCase() || x.id === u.role);
                  setUserPermissions(r?.permissions ?? {});
                }
              }}
              className="w-full mt-2 p-2 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Reset to Role Defaults
            </button>
          )}
        </div>
      </div>

      {/* Compact Info Banner */}
      <div className="p-2 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
        <CheckCircle className="text-green-600 w-3 h-3 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-green-800">
          Static demo. Changes saved to localStorage.
        </p>
      </div>

      {/* Mobile Stats */}
      <div className="lg:hidden bg-white rounded-lg shadow border border-gray-200 p-2">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-1">
            <div className="text-xs text-gray-500">Roles</div>
            <div className="text-sm font-semibold text-[#C62828]">{roles.length}</div>
          </div>
          <div className="text-center p-1">
            <div className="text-xs text-gray-500">Users</div>
            <div className="text-sm font-semibold text-blue-600">{users.length}</div>
          </div>
          <div className="text-center p-1">
            <div className="text-xs text-gray-500">Perms</div>
            <div className="text-sm font-semibold text-green-600">{permissionsList.length}</div>
          </div>
          <div className="text-center p-1">
            <div className="text-xs text-gray-500">Modules</div>
            <div className="text-sm font-semibold text-purple-600">{Object.keys(groupedPermissions).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}