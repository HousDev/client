// /* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from "react";
// import { Shield, Users, Key, Save, CheckCircle } from "lucide-react";
// import { toast } from "sonner";
// import rolesApi from "../lib/rolesApi";
// import { UsersApi } from "../lib/Api";

// type Role = {
//   id: string;
//   name: string;
//   description?: string;
//   permissions?: Record<string, boolean>;
// };
// type User = {
//   id: string;
//   full_name: string;
//   email: string;
//   role?: string;
//   permissions?: Record<string, boolean>;
// };

// export default function Permissions() {
//   const [activeTab, setActiveTab] = useState<
//     "role-permissions" | "user-permissions"
//   >("role-permissions");
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [selectedRole, setSelectedRole] = useState<string>("");
//   const [selectedUser, setSelectedUser] = useState<string>("");
//   const [rolePermissions, setRolePermissions] = useState<
//     Record<string, boolean>
//   >({});
//   const [userPermissions, setUserPermissions] = useState<
//     Record<string, boolean>
//   >({});
//   const [loading, setLoading] = useState(true);

//   // STATIC permission list
//   const permissionsList = [
//     { action: "full_access", label: "Full Access", module: "Full Access" },
//     { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },
//     { action: "view_vendors", label: "View Vendors", module: "Vendors" },
//     { action: "create_vendors", label: "Create Vendors", module: "Vendors" },
//     { action: "edit_vendors", label: "Edit Vendors", module: "Vendors" },
//     { action: "delete_vendors", label: "Delete Vendors", module: "Vendors" },
//     {
//       action: "view_pos",
//       label: "View Purchase Orders",
//       module: "Purchase Orders",
//     },
//     {
//       action: "create_pos",
//       label: "Create Purchase Orders",
//       module: "Purchase Orders",
//     },
//     {
//       action: "edit_pos",
//       label: "Edit Purchase Orders",
//       module: "Purchase Orders",
//     },
//     {
//       action: "delete_pos",
//       label: "Delete Purchase Orders",
//       module: "Purchase Orders",
//     },
//     {
//       action: "approve_pos",
//       label: "Approve Purchase Orders",
//       module: "Purchase Orders",
//     },
//     { action: "view_materials", label: "View Materials", module: "Materials" },
//     {
//       action: "receive_materials",
//       label: "Receive Materials",
//       module: "Materials",
//     },
//     { action: "view_payments", label: "View Payments", module: "Payments" },
//     { action: "make_payments", label: "Make Payments", module: "Payments" },
//     { action: "verify_payments", label: "Verify Payments", module: "Payments" },
//     { action: "view_reports", label: "View Reports", module: "Reports" },
//     { action: "export_reports", label: "Export Reports", module: "Reports" },
//     { action: "manage_users", label: "Manage Users", module: "Users" },
//     { action: "manage_roles", label: "Manage Roles", module: "Roles" },
//     {
//       action: "manage_permissions",
//       label: "Manage Permissions",
//       module: "Permissions",
//     },
//     {
//       action: "create_notifications",
//       label: "Create Notifications",
//       module: "Notifications",
//     },
//     {
//       action: "view_notifications",
//       label: "View Notifications",
//       module: "Notifications",
//     },
//     {
//       action: "update_notifications",
//       label: "Update Notifications",
//       module: "Notifications",
//     },
//     {
//       action: "delete_notifications",
//       label: "Delete Notifications",
//       module: "Notifications",
//     },
//   ];

//   const loadUsers = async () => {
//     try {
//       const usersRes: any = await UsersApi.list();

//       setSelectedUser(Array.isArray(usersRes) ? usersRes[0].id : {});
//       setUserPermissions(
//         Array.isArray(usersRes) ? usersRes[0].permissions : {},
//       );
//       setUsers(Array.isArray(usersRes) ? usersRes : []);
//       console.log("users", usersRes);
//     } catch (error) {
//       toast.error("Something went wrong while loading roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadRoles = async () => {
//     try {
//       const rolesRes: any = await rolesApi.getAllRoles();
//       setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0].id : {});
//       setRolePermissions(
//         Array.isArray(rolesRes) ? rolesRes[0].permissions : {},
//       );
//       setRoles(Array.isArray(rolesRes) ? rolesRes : []);
//       console.log("roles", rolesRes);
//     } catch (error) {
//       toast.error("Something went wrong while loading roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRoles();
//     loadUsers();
//   }, []);

//   const groupedPermissions = permissionsList.reduce((acc: any, p) => {
//     if (!acc[p.module]) acc[p.module] = [];
//     acc[p.module].push(p);
//     return acc;
//   }, {});

//   const handleRolePermissionChange = (action: string, value: boolean) => {
//     setRolePermissions((prev) => ({ ...prev, [action]: value }));
//   };

//   const handleUserPermissionChange = (action: string, value: boolean) => {
//     setUserPermissions((prev) => ({ ...prev, [action]: value }));
//   };

//   const updateRolePermissions = async () => {
//     try {
//       console.log(rolePermissions, "dfasjdhfkh");
//       const rolePermissionRes = await rolesApi.updateRolePermissions(
//         selectedRole,
//         rolePermissions,
//       );
//       if (rolePermissionRes.success) {
//         loadRoles();
//         toast.success("Role Permssions Updated Successfully.");
//       }
//       console.log(rolePermissionRes);
//     } catch (error) {
//       toast.error("Something went wrong while updating role permissions.");
//     }
//   };

//   const saveUserPermissions = async () => {
//     try {
//       console.log("this is permissions for testing", userPermissions);
//       const userPermissionsRes: any = await UsersApi.updateUserPermissions(
//         selectedUser,
//         userPermissions,
//       );

//       if (userPermissionsRes.success) {
//         loadUsers();
//         toast.success("User Permissions Updated Successfully.");
//       }
//     } catch (e) {
//       toast.error("Something went wrong while updating user permissions.");
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
//             onClick={() => {
//               setActiveTab("user-permissions");
//               console.log(users[0].id, users[0]?.permissions);
//               setSelectedUser(users[0].id);
//               setUserPermissions(users[0]?.permissions || {});
//             }}
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
//                   console.log(roles, newRole);
//                   const r = roles.find((x: any) => x.id === Number(newRole));
//                   console.log(r);
//                   setRolePermissions(r?.permissions ?? {});
//                 }}
//                 className="border p-3 rounded-lg"
//               >
//                 {roles.map((r) => (
//                   <option key={r.id} value={r.id}>
//                     {r.name}
//                   </option>
//                 ))}
//               </select>

//               {Object.entries(groupedPermissions).map(
//                 ([module, perms]: [any, any]) => (
//                   <div key={module} className="border p-4 rounded-lg">
//                     <h3 className="font-semibold mb-3">{module}</h3>
//                     <div className="grid grid-cols-3">
//                       {perms.map((perm: any) => (
//                         <label key={perm.action} className="block py-1">
//                           <input
//                             type="checkbox"
//                             checked={!!rolePermissions[perm.action]}
//                             onChange={(e) =>
//                               handleRolePermissionChange(
//                                 perm.action,
//                                 e.target.checked,
//                               )
//                             }
//                             className="mr-2"
//                           />
//                           {perm.label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 ),
//               )}
//               <button
//                 onClick={updateRolePermissions}
//                 className="px-6 py-3 bg-blue-600 text-white rounded-lg flex items-center gap-2"
//               >
//                 <Save className="w-5 h-5" /> Save
//               </button>
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
//                   const u = users.find((x) => x.id === uid);
//                   setUserPermissions(u?.permissions ?? {});
//                   if (u?.role) {
//                     setSelectedRole(u.role);
//                     const r = roles.find(
//                       (x) =>
//                         x.name.toLowerCase() === (u.role ?? "").toLowerCase() ||
//                         x.id === u.role,
//                     );
//                     setRolePermissions(r?.permissions ?? {});
//                   }
//                 }}
//                 className="border p-3 rounded-lg"
//               >
//                 {users.map((u) => (
//                   <option key={u.id} value={u.id}>
//                     {u.full_name} ({u.role ?? "No role"})
//                   </option>
//                 ))}
//               </select>

//               {Object.entries(groupedPermissions).map(
//                 ([module, perms]: [any, any]) => (
//                   <div key={module} className="border p-4 rounded-lg">
//                     <h3 className="font-semibold mb-3">{module}</h3>
//                     <div className="grid grid-cols-3">
//                       {perms.map((perm: any) => (
//                         <label key={perm.action} className="block py-1">
//                           <input
//                             type="checkbox"
//                             checked={!!userPermissions[perm.action]}
//                             onChange={(e) =>
//                               handleUserPermissionChange(
//                                 perm.action,
//                                 e.target.checked,
//                               )
//                             }
//                             className="mr-2"
//                           />
//                           {perm.label}
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 ),
//               )}

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
//           This is a static demo page. No real permission enforcement is applied.
//           If an admin user exists in localStorage it was auto-selected.
//         </p>
//       </div>
//     </div>
//   );
// // }
// import { useState, useEffect } from "react";
// import { 
//   Shield, 
//   Users, 
//   Save, 
//   CheckCircle, 
//   CheckSquare,
//   Square
// } from "lucide-react";
// import { toast } from "sonner";
// import rolesApi from "../lib/rolesApi";
// import { UsersApi } from "../lib/Api";

// type Role = {
//   id: string;
//   name: string;
//   description?: string;
//   permissions?: Record<string, boolean>;
// };

// type User = {
//   id: string;
//   full_name: string;
//   email: string;
//   role?: string;
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

//   // COMPLETE PERMISSIONS LIST
//   const permissionsList = [
//     // Global
//     { action: "full_access", label: "Full Access", module: "Global" },
    
//     // Dashboard
//     { action: "view_dashboard", label: "View Dashboard", module: "Dashboard" },
    
//     // Vendors
//     { action: "view_vendors", label: "View Vendors", module: "Vendors" },
//     { action: "create_vendors", label: "Create Vendors", module: "Vendors" },
//     { action: "edit_vendors", label: "Edit Vendors", module: "Vendors" },
//     { action: "delete_vendors", label: "Delete Vendors", module: "Vendors" },
    


//     // Purchase Orders
//     { action: "view_pos", label: "View Purchase Orders", module: "Purchase Orders" },
//     { action: "create_pos", label: "Create Purchase Orders", module: "Purchase Orders" },
//     { action: "edit_pos", label: "Edit Purchase Orders", module: "Purchase Orders" },
//     { action: "delete_pos", label: "Delete Purchase Orders", module: "Purchase Orders" },
//     { action: "approve_pos", label: "Approve Purchase Orders", module: "Purchase Orders" },
//     { action: "reject_pos", label: "Reject Purchase Orders", module: "Purchase Orders" },
//     { action: "authorize_pos", label: "Authorize Purchase Orders", module: "Purchase Orders" },
//     { action: "reject_authorize_pos", label: "Reject Authorization", module: "Purchase Orders" },
//     { action: "download_pdf_pos", label: "Download PO PDF", module: "Purchase Orders" },
//     { action: "view_pdf_pos", label: "View PO PDF", module: "Purchase Orders" },
//     { action: "make_payment_pos", label: "Make Payment", module: "Purchase Orders" },
    
//     // Service Orders
//   { action: "view_service_orders", label: "View Service Orders", module: "Service Orders" },
//   { action: "create_service_orders", label: "Create Service Orders", module: "Service Orders" },
//   { action: "edit_service_orders", label: "Edit Service Orders", module: "Service Orders" },
//   { action: "delete_service_orders", label: "Delete Service Orders", module: "Service Orders" },
//     // Material Request
//     { action: "view_material_request", label: "View Material Request", module: "Material Request" },
//     { action: "create_material_request", label: "Create Material Request", module: "Material Request" },
//     { action: "edit_material_request", label: "Edit Material Request", module: "Material Request" },
//     { action: "delete_material_request", label: "Delete Material Request", module: "Material Request" },
//     { action: "approve_material_request", label: "Approve Material Request", module: "Material Request" },
//     { action: "reject_material_request", label: "Reject Material Request", module: "Material Request" },
    
//     // Store Management
//     { action: "view_inventory", label: "View Inventory", module: "Store Management" },
//     { action: "edit_inventory", label: "Edit Inventory", module: "Store Management" },
//     { action: "view_reminders", label: "View Reminders", module: "Store Management" },
//     { action: "view_challan", label: "View Challan", module: "Store Management" },
//     { action: "material_in", label: "Material In", module: "Store Management" },
//     { action: "material_out", label: "Material Out", module: "Store Management" },
//     { action: "material_issue", label: "Material Issue", module: "Store Management" },
    
//     // Materials
//     { action: "view_materials", label: "View Materials", module: "Materials" },
//     { action: "receive_materials", label: "Receive Materials", module: "Materials" },
    
//     // Payments
//     { action: "view_payments", label: "View Payments", module: "Payments" },
//     { action: "make_payments", label: "Make Payments", module: "Payments" },
//     { action: "verify_payments", label: "Verify Payments", module: "Payments" },
//     { action: "update_payment_status", label: "Update Payment Status", module: "Payments" },
    
//     // Projects
//     { action: "view_projects", label: "View Projects", module: "Projects" },
//     { action: "create_projects", label: "Create Projects", module: "Projects" },
//     { action: "edit_projects", label: "Edit Projects", module: "Projects" },
//     { action: "delete_projects", label: "Delete Projects", module: "Projects" },
    
//     // Task Management
//     { action: "view_tasks", label: "View Tasks", module: "Task Management" },
//     { action: "create_tasks", label: "Create Tasks", module: "Task Management" },
//     { action: "edit_tasks", label: "Update Tasks", module: "Task Management" },
//     { action: "delete_tasks", label: "Delete Tasks", module: "Task Management" },
//     { action: "assign_tasks", label: "Assign Tasks", module: "Task Management" }, // ✅ ADDED
    
//     // Master Data
//     { action: "view_master", label: "View Master", module: "Master Data" },
//     { action: "create_master", label: "Create Master", module: "Master Data" },
//     { action: "update_master", label: "Update Master", module: "Master Data" },
//     { action: "delete_master", label: "Delete Master", module: "Master Data" },
//     { action: "bulk_import_master", label: "Bulk Import", module: "Master Data" },
//     { action: "bulk_download_master", label: "Bulk Download", module: "Master Data" },
    
//     // HRMS
//     { action: "view_hrms", label: "View Employees", module: "HRMS" },
//     { action: "edit_hrms", label: "Manage Payroll", module: "HRMS" },
//     { action: "delete_hrms", label: "Delete HRMS", module: "HRMS" },
    
//     // Reports
//     { action: "view_reports", label: "View Reports", module: "Reports" },
//     { action: "export_reports", label: "Export Reports", module: "Reports" },
    
//     // Users
//     { action: "view_users", label: "Manage Users", module: "Users" },
//     { action: "create_users", label: "Create Users", module: "Users" },
//     { action: "edit_users", label: "Edit Users", module: "Users" },
//     { action: "delete_users", label: "Delete Users", module: "Users" },
    
//     // Roles
//     { action: "manage_roles", label: "Manage Roles", module: "Roles" },
    
//     // Permissions
//     { action: "manage_permissions", label: "Manage Permissions", module: "Permissions" },
    
//     // Notifications
//     { action: "create_notifications", label: "Create Notifications", module: "Notifications" },
//     { action: "view_notifications", label: "View Notifications", module: "Notifications" },
//     { action: "update_notifications", label: "Update Notifications", module: "Notifications" },
//     { action: "delete_notifications", label: "Delete Notifications", module: "Notifications" },
//   ];

//   const loadUsers = async () => {
//     try {
//       const usersRes: any = await UsersApi.list();
//       setSelectedUser(Array.isArray(usersRes) ? usersRes[0]?.id : "");
//       setUserPermissions(Array.isArray(usersRes) ? usersRes[0]?.permissions || {} : {});
//       setUsers(Array.isArray(usersRes) ? usersRes : []);
//     } catch (error) {
//       toast.error("Failed to load users");
//     }
//   };

//   const loadRoles = async () => {
//     try {
//       const rolesRes: any = await rolesApi.getAllRoles();
//       setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0]?.id : "");
//       setRolePermissions(Array.isArray(rolesRes) ? rolesRes[0]?.permissions || {} : {});
//       setRoles(Array.isArray(rolesRes) ? rolesRes : []);
//     } catch (error) {
//       toast.error("Failed to load roles");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadRoles();
//     loadUsers();
//   }, []);

//   const groupedPermissions = permissionsList.reduce((acc: any, p) => {
//     if (!acc[p.module]) acc[p.module] = [];
//     acc[p.module].push(p);
//     return acc;
//   }, {});

//   const handlePermissionChange = (action: string, value: boolean) => {
//     if (activeTab === "role-permissions") {
//       setRolePermissions((prev) => ({ ...prev, [action]: value }));
//     } else {
//       setUserPermissions((prev) => ({ ...prev, [action]: value }));
//     }
//   };

//   const handleSelectAll = () => {
//     const allPermissions = permissionsList.reduce((acc, perm) => {
//       acc[perm.action] = true;
//       return acc;
//     }, {} as Record<string, boolean>);
    
//     if (activeTab === "role-permissions") {
//       setRolePermissions(allPermissions);
//     } else {
//       setUserPermissions(allPermissions);
//     }
//   };

//   const handleDeselectAll = () => {
//     if (activeTab === "role-permissions") {
//       setRolePermissions({});
//     } else {
//       setUserPermissions({});
//     }
//   };

//   // ✅ Module-level Select All (Toggle)
//   const handleModuleSelectAll = (perms: any[]) => {
//     const currentPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;
//     const moduleAllChecked = perms.every(perm => currentPermissions[perm.action]);
    
//     const newPermissions = { ...currentPermissions };
//     perms.forEach(perm => {
//       newPermissions[perm.action] = !moduleAllChecked;
//     });
    
//     if (activeTab === "role-permissions") {
//       setRolePermissions(newPermissions);
//     } else {
//       setUserPermissions(newPermissions);
//     }
//   };

//   const updateRolePermissions = async () => {
//     try {
//       const rolePermissionRes = await rolesApi.updateRolePermissions(
//         selectedRole,
//         rolePermissions
//       );
//       if (rolePermissionRes.success) {
//         loadRoles();
//         toast.success("Role permissions updated successfully");
//       }
//     } catch (error) {
//       toast.error("Failed to update role permissions");
//     }
//   };

//   const saveUserPermissions = async () => {
//     try {
//       const userPermissionsRes: any = await UsersApi.updateUserPermissions(
//         selectedUser,
//         userPermissions
//       );
//       if (userPermissionsRes.success) {
//         loadUsers();
//         toast.success("User permissions updated successfully");
//       }
//     } catch (e) {
//       toast.error("Failed to update user permissions");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
//       </div>
//     );
//   }

//   const currentPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;

//   return (
//     <div className="space-y-4 p-4 bg-gray-50 min-h-screen">
//       {/* Compact Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-bold text-gray-800">Permissions Management</h1>
//           <p className="text-gray-600 text-xs mt-0.5">Manage role-based and user-specific permissions</p>
//         </div>
        
//         <div className="flex gap-2">
//           <button
//             onClick={handleSelectAll}
//             className="px-3 py-1.5 text-xs bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1.5"
//           >
//             <CheckSquare className="w-3.5 h-3.5" />
//             Select All
//           </button>
//           <button
//             onClick={handleDeselectAll}
//             className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
//           >
//             <Square className="w-3.5 h-3.5" />
//             Deselect All
//           </button>
//         </div>
//       </div>

//       {/* Compact Tabs */}
//       <div className="bg-white rounded-lg shadow-sm border">
//         <div className="flex border-b">
//           <button
//             onClick={() => setActiveTab("role-permissions")}
//             className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${activeTab === "role-permissions" 
//               ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" 
//               : "text-gray-600 hover:bg-gray-50"}`}
//           >
//             <Shield className="w-4 h-4 inline-block mr-1.5" />
//             Role Permissions
//           </button>

//           <button
//             onClick={() => {
//               setActiveTab("user-permissions");
//               if (users.length > 0) {
//                 setSelectedUser(users[0].id);
//                 setUserPermissions(users[0]?.permissions || {});
//               }
//             }}
//             className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${activeTab === "user-permissions" 
//               ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" 
//               : "text-gray-600 hover:bg-gray-50"}`}
//           >
//             <Users className="w-4 h-4 inline-block mr-1.5" />
//             User Permissions
//           </button>
//         </div>

//         <div className="p-4">
//           {/* Compact Selection */}
//           <div className="mb-4">
//             <label className="block text-xs font-medium text-gray-700 mb-1.5">
//               {activeTab === "role-permissions" ? "Select Role" : "Select User"}
//             </label>
//             <select
//               value={activeTab === "role-permissions" ? selectedRole : selectedUser}
//               onChange={(e) => {
//                 if (activeTab === "role-permissions") {
//                   const newRole = e.target.value;
//                   setSelectedRole(newRole);
//                   const r = roles.find((x: any) => x.id === Number(newRole));
//                   setRolePermissions(r?.permissions || {});
//                 } else {
//                   const uid = e.target.value;
//                   setSelectedUser(uid);
//                   const u = users.find((x) => x.id === uid);
//                   setUserPermissions(u?.permissions || {});
//                 }
//               }}
//               className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
//             >
//               {activeTab === "role-permissions"
//                 ? roles.map((r) => (
//                     <option key={r.id} value={r.id}>
//                       {r.name}
//                     </option>
//                   ))
//                 : users.map((u) => (
//                     <option key={u.id} value={u.id}>
//                       {u.full_name} ({u.role || "No role"})
//                     </option>
//                   ))}
//             </select>
//           </div>

//           {/* ✅ Updated: Module Cards with Select All Button */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//             {Object.entries(groupedPermissions).map(([module, perms]: [any, any]) => {
//               const currentPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;
//               const moduleAllChecked = perms.every((perm: any) => currentPermissions[perm.action]);
              
//               return (
//                 <div key={module} className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow">
//                   {/* ✅ Module Header with SELECT ALL Button */}
//                   <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2.5 border-b flex items-center justify-between">
//                     <div className="flex-1">
//                       <h3 className="font-semibold text-gray-800 text-sm">{module}</h3>
//                       <p className="text-xs text-gray-500 mt-0.5">{perms.length} {perms.length === 1 ? 'Action' : 'Actions'}</p>
//                     </div>
                    
//                     {/* ✅ SELECT ALL Button (like your image) */}
//                     <button
//                       onClick={() => handleModuleSelectAll(perms)}
//                       className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors uppercase tracking-wide"
//                     >
//                       {moduleAllChecked ? 'DESELECT ALL' : 'SELECT ALL'}
//                     </button>
//                   </div>
                  
//                   {/* Permissions List */}
//                   <div className="p-3">
//                     <div className="space-y-2">
//                       {perms.map((perm: any) => (
//                         <label
//                           key={perm.action}
//                           className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1.5 rounded transition-colors group"
//                         >
//                           <span className="text-sm text-gray-700 flex-1">{perm.label}</span>
//                           <input
//                             type="checkbox"
//                             checked={!!currentPermissions[perm.action]}
//                             onChange={(e) => handlePermissionChange(perm.action, e.target.checked)}
//                             className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 focus:ring-2 ml-2 cursor-pointer"
//                           />
//                         </label>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Compact Save Button */}
//           <div className="mt-4 pt-4 border-t flex items-center gap-3">
//             <button
//               onClick={activeTab === "role-permissions" ? updateRolePermissions : saveUserPermissions}
//               className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg flex items-center gap-2 hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
//             >
//               <Save className="w-4 h-4" />
//               Save Permissions
//             </button>
            
//             <div className="flex items-center gap-2 text-xs text-gray-600">
//               <CheckCircle className="w-4 h-4 text-blue-600" />
//               Changes take effect immediately
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
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
  const [activeTab, setActiveTab] = useState<"role-permissions" | "user-permissions">("role-permissions");
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [rolePermissions, setRolePermissions] = useState<Record<string, boolean>>({});
  const [userPermissions, setUserPermissions] = useState<Record<string, boolean>>({});
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
    { action: "view_pos", label: "View Purchase Orders", module: "Purchase Orders" },
    { action: "create_pos", label: "Create Purchase Orders", module: "Purchase Orders" },
    { action: "edit_pos", label: "Edit Purchase Orders", module: "Purchase Orders" },
    { action: "delete_pos", label: "Delete Purchase Orders", module: "Purchase Orders" },
    { action: "approve_pos", label: "Approve Purchase Orders", module: "Purchase Orders" },
    { action: "reject_pos", label: "Reject Purchase Orders", module: "Purchase Orders" },
    { action: "authorize_pos", label: "Authorize Purchase Orders", module: "Purchase Orders" },
    { action: "reject_authorize_pos", label: "Reject Authorization", module: "Purchase Orders" },
    { action: "download_pdf_pos", label: "Download PO PDF", module: "Purchase Orders" },
    { action: "view_pdf_pos", label: "View PO PDF", module: "Purchase Orders" },
    { action: "make_payment_pos", label: "Make Payment", module: "Purchase Orders" },
    
    // Service Orders
    { action: "view_service_orders", label: "View Service Orders", module: "Service Orders" },
    { action: "create_service_orders", label: "Create Service Orders", module: "Service Orders" },
    { action: "edit_service_orders", label: "Edit Service Orders", module: "Service Orders" },
    { action: "delete_service_orders", label: "Delete Service Orders", module: "Service Orders" },
    
    // Store Management
    { action: "view_inventory", label: "View Inventory", module: "Store Management" },
    { action: "create_inventory", label: "Create Inventory", module: "Store Management" },
    { action: "edit_inventory", label: "Edit Inventory", module: "Store Management" },
    { action: "delete_inventory", label: "Delete Inventory", module: "Store Management" },
    { action: "make_reminders", label: "Make Reminders", module: "Store Management" },
    { action: "view_challan", label: "View Challan", module: "Store Management" },
    { action: "material_in", label: "Material In", module: "Store Management" },
    { action: "material_out", label: "Material Out", module: "Store Management" },
    { action: "material_issue", label: "Material Issue", module: "Store Management" },
    
    // Material Tracking
    { action: "view_materials", label: "View Materials", module: "Material Tracking" },
    { action: "receive_materials", label: "Receive Materials", module: "Material Tracking" },
    
    // Material Requests
    { action: "view_material_requests", label: "View Material Requests", module: "Material Requests" },
    { action: "update_material_requests", label: "Update Material Requests", module: "Material Requests" },
    { action: "delete_material_requests", label: "Delete Material Requests", module: "Material Requests" },
    { action: "make_material_requests", label: "Make Material Requests", module: "Material Requests" },
    { action: "make_material_requests_for_po", label: "Make Material Requests for PO", module: "Material Requests" },

    // Payments
    { action: "view_payments", label: "View Payments", module: "Payments" },
    { action: "make_payments", label: "Make Payments", module: "Payments" },
    { action: "verify_payments", label: "Verify Payments", module: "Payments" },

    // Task Management
    { action: "view_tasks", label: "View Tasks", module: "Task Management" },
    { action: "create_task", label: "Create Task", module: "Task Management" },
    { action: "update_task", label: "Update Task", module: "Task Management" },
    { action: "delete_task", label: "Delete Task", module: "Task Management" },
    { action: "assign_task", label: "Assign Task", module: "Task Management" },
    
    // Projects
    { action: "view_projects", label: "View Projects", module: "Projects" },
    { action: "create_project", label: "Create Project", module: "Projects" },
    { action: "update_project", label: "Update Project", module: "Projects" },
    { action: "delete_project", label: "Delete Project", module: "Projects" },
    
    // HRMS
    { action: "view_hrms", label: "View HRMS", module: "HRMS" },
    { action: "create_hrms", label: "Create HRMS", module: "HRMS" },
    { action: "update_hrms", label: "Update HRMS", module: "HRMS" },
    { action: "delete_hrms", label: "Delete HRMS", module: "HRMS" },
    
    // Notifications
    { action: "view_notifications", label: "View Notifications", module: "Notifications" },
    { action: "create_notifications", label: "Create Notifications", module: "Notifications" },
    { action: "update_notifications", label: "Update Notifications", module: "Notifications" },
    { action: "delete_notifications", label: "Delete Notifications", module: "Notifications" },
    
    // Administration
    { action: "manage_users", label: "Manage Users", module: "Administration" },
    { action: "manage_roles", label: "Manage Roles", module: "Administration" },
    { action: "manage_permissions", label: "Manage Permissions", module: "Administration" },
    { action: "view_users_list", label: "View Users List", module: "Administration" },
    { action: "create_new_users", label: "Create New Users", module: "Administration" },
    { action: "edit_users", label: "Edit Users", module: "Administration" },
    { action: "delete_users", label: "Delete Users", module: "Administration" },
    
    // Reports
    { action: "view_reports", label: "View Reports", module: "Reports" },
    { action: "export_reports", label: "Export Reports", module: "Reports" },
  ];

  const loadUsers = async () => {
    try {
      const usersRes: any = await UsersApi.list();
      setSelectedUser(Array.isArray(usersRes) ? usersRes[0]?.id : "");
      setUserPermissions(Array.isArray(usersRes) ? usersRes[0]?.permissions || {} : {});
      setUsers(Array.isArray(usersRes) ? usersRes : []);
    } catch (error) {
      toast.error("Failed to load users");
    }
  };

  const loadRoles = async () => {
    try {
      const rolesRes: any = await rolesApi.getAllRoles();
      setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0]?.id : "");
      setRolePermissions(Array.isArray(rolesRes) ? rolesRes[0]?.permissions || {} : {});
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
    const currentPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;
    const moduleAllChecked = perms.every(perm => currentPermissions[perm.action]);
    
    const newPermissions = { ...currentPermissions };
    perms.forEach(perm => {
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
    
    permissionsList.forEach(perm => {
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
        rolePermissions
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
        userPermissions
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

  const currentPermissions = activeTab === "role-permissions" ? rolePermissions : userPermissions;

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
              value={activeTab === "role-permissions" ? selectedRole : selectedUser}
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
            className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors shadow-sm ${selectAllEnabled ? 'bg-[#C62828] text-white hover:bg-red-700' : 'bg-[#C62828] text-white hover:bg-red-700'}`}
          >
            {selectAllEnabled ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* ✅ Permissions Grid - Reduced gap from gap-6 to gap-4 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedPermissions).map(([module, perms]: [any, any]) => {
            const moduleAllChecked = perms.every((perm: any) => currentPermissions[perm.action]);
            const actionsCount = perms.length;
            
            return (
              <div
                key={module}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all"
              >
                {/* Module Header */}
                <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm">{module}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {actionsCount} {actionsCount === 1 ? 'Action' : 'Actions'}
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
                          <span className="text-sm text-gray-700">{perm.label}</span>
                          
                          {/* Checkbox on RIGHT */}
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handlePermissionChange(perm.action, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                              isChecked 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'border-gray-300 bg-white group-hover:border-blue-400'
                            }`}>
                              {isChecked && (
                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
          })}
        </div>

        {/* Save Button - Reduced margin */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={activeTab === "role-permissions" ? updateRolePermissions : saveUserPermissions}
            className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}