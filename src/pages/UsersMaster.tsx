// // src/components/UsersMaster.tsx
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   Users,
//   X,
//   Shield,
//   Eye,
//   EyeOff,
//   CheckSquare,
//   Square,
//   Loader2,
// } from "lucide-react";
// import { UsersApi } from "../lib/Api"; // adjust path if needed
// import { getAllRoles } from "../lib/rolesApi";
// import { toast } from "sonner";
// import MySwal from "../utils/swal";

// // Types
// interface Permissions {
//   [key: string]: boolean;
// }

// interface UserProfile {
//   id: string;
//   email: string;
//   full_name?: string;
//   phone?: string;
//   role: string;
//   department?: string;
//   is_active: boolean;
//   permissions?: Permissions;
// }

// interface UserFormData {
//   email: string;
//   full_name: string;
//   phone: string;
//   role: string;
//   department: string;
//   password: string;
//   is_active: boolean;
//   permissions: Permissions;
// }

// interface Role {
//   id: string;
//   name: string;
//   description?: string;
//   permissions: Permissions;
//   is_active: boolean;
// }

// export default function UsersMaster() {
//   const [users, setUsers] = useState<UserProfile[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [allRoles, setAllRoles] = useState<Role[]>([]);

//   // Search states
//   const [searchName, setSearchName] = useState('');
//   const [searchEmail, setSearchEmail] = useState('');
//   const [searchDepartment, setSearchDepartment] = useState('');

//   // Bulk selection
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   const [formData, setFormData] = useState<UserFormData>({
//     email: "",
//     full_name: "",
//     phone: "",
//     role: "USER",
//     department: "",
//     password: "",
//     is_active: true,
//     permissions: {},
//   });

//   // Load users and roles
//   useEffect(() => {
//     let mounted = true;
//     setLoading(true);

//     console.log("Loading users and roles...");

//     const loadData = async () => {
//       try {
//         // Load users
//         const usersData = await UsersApi.list();
//         console.log("Users data:", usersData);

//         if (!mounted) return;

//         const normalized = usersData.map((u: any) => ({
//           id: u.id || u._id,
//           email: u.email || "",
//           full_name: u.full_name || u.name || "",
//           phone: u.phone || "",
//           role: u.role?.toUpperCase() || "USER",
//           department: u.department || "",
//           is_active: u.is_active !== false,
//           permissions: u.permissions || {},
//         })) as UserProfile[];

//         setUsers(normalized);

//         // Load roles with better error handling
//         try {
//           const rolesData = await getAllRoles();
//           console.log("Roles data type:", typeof rolesData);
//           console.log("Roles data is array?", Array.isArray(rolesData));
//           console.log("Roles data:", rolesData);

//           if (mounted) {
//             // Ensure rolesData is always an array
//             let rolesArray: Role[] = [];

//             if (Array.isArray(rolesData)) {
//               rolesArray = rolesData;
//             } else if (rolesData && typeof rolesData === 'object' && Array.isArray(rolesData.data)) {
//               // Handle case where API returns { data: [...], status: 200 }
//               console.log("Extracting roles from data property");
//               rolesArray = rolesData.data;
//             } else if (rolesData && typeof rolesData === 'object') {
//               // Convert object values to array if needed
//               console.log("Converting object to array");
//               const tempArray = Object.values(rolesData);
//               if (Array.isArray(tempArray)) {
//                 rolesArray = tempArray;
//               }
//             }

//             // Normalize role names to uppercase for consistency
//             const normalizedRoles = rolesArray.map(role => ({
//               ...role,
//               name: role.name.toUpperCase()
//             }));

//             console.log("Normalized roles:", normalizedRoles);
//             setAllRoles(normalizedRoles);
//           }
//         } catch (rolesErr: any) {
//           console.error("Failed to load roles:", rolesErr);
//           if (mounted) {
//             toast.error("Failed to load roles: " + (rolesErr.message || "Unknown error"));
//             setAllRoles([]);
//           }
//         }

//       } catch (err: any) {
//         console.error("Failed to load users:", err);
//         toast.error("Failed to load users: " + (err.message || "Unknown error"));
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };

//     loadData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     console.log("Submitting form data:", formData);

//     // Validation
//     if (!formData.email.trim()) {
//       toast.error("Email is required");
//       return;
//     }

//     if (!editingId && (!formData.password || formData.password.length < 6)) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     if (!formData.full_name || formData.full_name.trim().length < 2) {
//       toast.error("Full name must be at least 2 characters");
//       return;
//     }

//     if (!formData.phone || formData.phone.length !== 10) {
//       toast.error("Phone number must be 10 digits");
//       return;
//     }

//     if (!formData.department || formData.department.trim().length < 2) {
//       toast.error("Department must be at least 2 characters");
//       return;
//     }

//     if (!formData.role) {
//       toast.error("Please select a role");
//       return;
//     }

//     setSubmitting(true);

//     try {
//       // Prepare payload
//       const payload: any = {
//         email: formData.email.trim(),
//         full_name: formData.full_name.trim(),
//         phone: formData.phone,
//         role: formData.role.toUpperCase(),
//         department: formData.department.trim(),
//         is_active: formData.is_active,
//         permissions: formData.permissions || {}
//       };

//       // Add password only if provided
//       if (formData.password && formData.password.length > 0) {
//         payload.password = formData.password;
//       }

//       console.log("Sending payload:", payload);

//       let result: UserProfile;

//       if (editingId) {
//         // Update user
//         result = await UsersApi.update(editingId, payload);
//         console.log("Update result:", result);

//         setUsers((prev) =>
//           prev.map((u) => (u.id === editingId ? { ...u, ...result } : u))
//         );
//         toast.success("User updated successfully!");
//       } else {
//         // Check for duplicate email
//         if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
//           toast.error("A user with this email already exists");
//           setSubmitting(false);
//           return;
//         }

//         // Create user
//         result = await UsersApi.create(payload);
//         console.log("Create result:", result);

//         setUsers((prev) => [...prev, result]);
//         toast.success("User created successfully!");
//       }

//       setShowModal(false);
//       resetForm();
//     } catch (err: any) {
//       console.error("Submit error:", err);
//       toast.error(err?.message || "Operation failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       email: "",
//       full_name: "",
//       phone: "",
//       role: "USER",
//       department: "",
//       password: "",
//       is_active: true,
//       permissions: {},
//     });
//     setEditingId(null);
//     setShowPassword(false);
//   };

//   const handleEdit = (user: UserProfile) => {
//     console.log("Editing user:", user);
//     setEditingId(user.id);

//     setFormData({
//       email: user.email,
//       full_name: user.full_name || "",
//       phone: user.phone || "",
//       role: user.role?.toUpperCase() || "USER",
//       department: user.department || "",
//       password: "",
//       is_active: user.is_active !== false,
//       permissions: user.permissions || {},
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: string) => {
//     const result: any = await MySwal.fire({
//       title: "Delete User?",
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       await UsersApi.remove(id);
//       setUsers((prev) => prev.filter((u) => u.id !== id));
//       toast.success("User deleted successfully!");
//     } catch (err) {
//       console.error("Delete error:", err);
//       toast.error("Failed to delete user");
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedUsers.size === 0) {
//       toast.error("Please select at least one user to delete");
//       return;
//     }

//     const result: any = await MySwal.fire({
//       title: "Delete Users?",
//       text: `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//     });

//     if (!result.isConfirmed) return;

//     setSubmitting(true);
//     try {
//       for (const id of Array.from(selectedUsers)) {
//         await UsersApi.remove(id);
//       }

//       setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
//       setSelectedUsers(new Set());
//       setSelectAll(false);
//       toast.success(`Successfully deleted ${selectedUsers.size} user(s)!`);
//     } catch (err) {
//       console.error("Bulk delete error:", err);
//       toast.error("Failed to delete users");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const toggleActive = async (id: string, currentStatus: boolean) => {
//     try {
//       await UsersApi.toggleActive(id);
//       setUsers((prev) =>
//         prev.map((u) =>
//           u.id === id ? { ...u, is_active: !currentStatus } : u
//         )
//       );
//       toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
//     } catch (err) {
//       console.error("Toggle error:", err);
//       toast.error("Failed to update status");
//     }
//   };

//   const handleBulkToggleActive = async (activate: boolean) => {
//     if (selectedUsers.size === 0) {
//       toast.error("Please select at least one user");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // Update local state first
//       setUsers((prev) =>
//         prev.map((u) =>
//           selectedUsers.has(u.id) ? { ...u, is_active: activate } : u
//         )
//       );

//       // Update on server
//       for (const id of Array.from(selectedUsers)) {
//         const user = users.find(u => u.id === id);
//         if (user && user.is_active !== activate) {
//           await UsersApi.toggleActive(id);
//         }
//       }

//       toast.success(`${selectedUsers.size} user(s) ${activate ? 'activated' : 'deactivated'} successfully!`);
//     } catch (err) {
//       console.error("Bulk toggle error:", err);
//       toast.error("Failed to update users status");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleRoleChange = (role: string) => {
//     console.log("Role changed to:", role);
//     setFormData({
//       ...formData,
//       role: role // Simple assignment, no .toUpperCase() needed
//     });
//   };

//   const togglePermission = (key: string) => {
//     setFormData({
//       ...formData,
//       permissions: {
//         ...formData.permissions,
//         [key]: !formData.permissions?.[key],
//       },
//     });
//   };

//   const handleSelectUser = (id: string) => {
//     const newSelected = new Set(selectedUsers);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedUsers(newSelected);
//     setSelectAll(newSelected.size === filteredUsers.length);
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedUsers(new Set());
//     } else {
//       const allIds = new Set(filteredUsers.map(user => user.id));
//       setSelectedUsers(allIds);
//     }
//     setSelectAll(!selectAll);
//   };

//   const filteredUsers = useMemo(() => {
//     return users.filter((user) => {
//       const matchesName = !searchName ||
//         (user.full_name || '').toLowerCase().includes(searchName.toLowerCase());

//       const matchesEmail = !searchEmail ||
//         (user.email || '').toLowerCase().includes(searchEmail.toLowerCase());

//       const matchesDepartment = !searchDepartment ||
//         (user.department || '').toLowerCase().includes(searchDepartment.toLowerCase());

//       return matchesName && matchesEmail && matchesDepartment;
//     });
//   }, [users, searchName, searchEmail, searchDepartment]);

//   const getRoleColor = (role: string) => {
//     const colors: Record<string, string> = {
//       ADMIN: "bg-red-100 text-red-700",
//       MANAGER: "bg-blue-100 text-blue-700",
//       PURCHASER: "bg-green-100 text-green-700",
//       STORE_KEEPER: "bg-purple-100 text-purple-700",
//       USER: "bg-gray-100 text-gray-700",
//     };
//     return colors[role.toUpperCase()] || "bg-gray-100 text-gray-700";
//   };

//   // Get safe roles array for rendering
//   const safeRoles = Array.isArray(allRoles) ? allRoles : [];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading users...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header with Bulk Actions */}
//       <div className="mb-6">
//         <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] rounded-xl shadow-md p-5">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//                 <Users className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Users Management</h1>
//                 <p className="text-sm text-white/90 font-medium mt-0.5">
//                   Manage users and permissions ({users.length} users)
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-wrap items-center gap-2">
//               {selectedUsers.size > 0 && (
//                 <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
//                   <button
//                     onClick={() => handleBulkToggleActive(true)}
//                     disabled={submitting}
//                     className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Activate ({selectedUsers.size})
//                   </button>
//                   <button
//                     onClick={() => handleBulkToggleActive(false)}
//                     disabled={submitting}
//                     className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-3 py-1.5 rounded-xl hover:from-yellow-700 hover:to-amber-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     Deactivate ({selectedUsers.size})
//                   </button>
//                   <button
//                     onClick={handleBulkDelete}
//                     disabled={submitting}
//                     className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {submitting ? (
//                       <Loader2 className="w-3 h-3 animate-spin" />
//                     ) : (
//                       <Trash2 className="w-3 h-3" />
//                     )}
//                     Delete ({selectedUsers.size})
//                   </button>
//                   <div className="text-xs text-white font-medium px-2 py-1 bg-white/20 rounded-lg">
//                     {selectedUsers.size} selected
//                   </div>
//                 </div>
//               )}
//               <button
//                 onClick={() => {
//                   resetForm();
//                   setShowModal(true);
//                 }}
//                 className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
//               >
//                 <Plus className="w-5 h-5" />
//                 Add User
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table with Search and Checkboxes */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-200 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left w-12">
//                   <button
//                     onClick={handleSelectAll}
//                     className="p-1 hover:bg-gray-300 rounded transition-colors"
//                     disabled={users.length === 0}
//                   >
//                     {selectAll && users.length > 0 ? (
//                       <CheckSquare className="w-5 h-5 text-blue-600" />
//                     ) : (
//                       <Square className="w-5 h-5 text-gray-500" />
//                     )}
//                   </button>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Name
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search name..."
//                     value={searchName}
//                     onChange={(e) => setSearchName(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Email
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search email..."
//                     value={searchEmail}
//                     onChange={(e) => setSearchEmail(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Role
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Department
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search department..."
//                     value={searchDepartment}
//                     onChange={(e) => setSearchDepartment(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Phone
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Status
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Actions
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => {
//                   const isSelected = selectedUsers.has(user.id);
//                   return (
//                     <tr
//                       key={user.id}
//                       className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
//                     >
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => handleSelectUser(user.id)}
//                           className="p-1 hover:bg-gray-200 rounded transition-colors"
//                         >
//                           {isSelected ? (
//                             <CheckSquare className="w-5 h-5 text-blue-600" />
//                           ) : (
//                             <Square className="w-5 h-5 text-gray-400" />
//                           )}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex items-center gap-2">
//                           <Users className="w-4 h-4 text-blue-600" />
//                           <span className="font-medium text-gray-800">
//                             {user.full_name || "N/A"}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">{user.email}</td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(
//                             user.role
//                           )}`}
//                         >
//                           {user.role?.toUpperCase() || "USER"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">
//                         {user.department || "-"}
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">
//                         {user.phone || "-"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <button
//                           onClick={() => toggleActive(user.id, user.is_active)}
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active
//                             ? "bg-green-100 text-green-700"
//                             : "bg-gray-100 text-gray-700"
//                             }`}
//                         >
//                           {user.is_active ? "ACTIVE" : "INACTIVE"}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4">
//                         <div className="flex gap-2">
//                           <button
//                             onClick={() => handleEdit(user)}
//                             className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
//                             title="Edit"
//                           >
//                             <Edit2 className="w-4 h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(user.id)}
//                             className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="px-6 py-12 text-center">
//                     <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                     <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                       {users.length === 0 ? "No users found" : "No matching users found"}
//                     </h3>
//                     <p className="text-gray-600">
//                       {searchName || searchEmail || searchDepartment
//                         ? "Try a different search term"
//                         : 'Click "Add User" to create your first user'}
//                     </p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Add/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
//           <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl border border-gray-200 overflow-hidden max-h-[90vh]">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
//               <div className="flex items-center gap-2.5">
//                 <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
//                   <Users className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-base font-bold text-white flex items-center gap-1.5">
//                     {editingId ? "Edit User" : "Add User"}
//                   </h2>
//                   <p className="text-xs text-white/90 font-medium mt-0.5">
//                     {editingId ? "Update user details" : "Add new user"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   resetForm();
//                 }}
//                 className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto">
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <Users className="w-5 h-5" />
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Full Name <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <input
//                         type="text"
//                         value={formData.full_name}
//                         onChange={(e) =>
//                           setFormData({ ...formData, full_name: e.target.value })
//                         }
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                         placeholder="John Doe"
//                         required
//                         minLength={2}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Email <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <input
//                         type="email"
//                         value={formData.email}
//                         onChange={(e) =>
//                           setFormData({ ...formData, email: e.target.value })
//                         }
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                         placeholder="john@example.com"
//                         required
//                         disabled={!!editingId}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Phone <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <input
//                         type="tel"
//                         value={formData.phone}
//                         required
//                         onChange={(e) => {
//                           const value = e.target.value.replace(/\D/g, '').slice(0, 10);
//                           setFormData({ ...formData, phone: value });
//                         }}
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                         placeholder="9876543210"
//                         maxLength={10}
//                       />
//                       <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
//                         {formData.phone.length}/10
//                       </span>
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Department <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <input
//                         type="text"
//                         required
//                         value={formData.department}
//                         onChange={(e) =>
//                           setFormData({ ...formData, department: e.target.value })
//                         }
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                         placeholder="Procurement"
//                         minLength={2}
//                       />
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       {editingId ? "Change Password (optional)" : "Password *"}
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <input
//                         type={showPassword ? "text" : "password"}
//                         value={formData.password}
//                         onChange={(e) =>
//                           setFormData({
//                             ...formData,
//                             password: e.target.value,
//                           })
//                         }
//                         className="w-full pl-9 pr-12 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                         placeholder={editingId ? "Leave blank to keep current" : "Min 6 characters"}
//                         required={!editingId}
//                         minLength={editingId ? 0 : 6}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                       >
//                         {showPassword ? (
//                           <EyeOff className="w-4 h-4" />
//                         ) : (
//                           <Eye className="w-4 h-4" />
//                         )}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Role <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Users className="w-3.5 h-3.5" />
//                       </div>
//                       <select
//                         value={formData.role}
//                         onChange={(e) => handleRoleChange(e.target.value)}
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
//                         required
//                       >
//                         <option value="">Select a role</option>
//                         {safeRoles.length > 0 ? (
//                           safeRoles.map((role) => (
//                             <option key={role.id} value={role.name}>
//                               {role.name} {role.description ? `(${role.description})` : ''}
//                             </option>
//                           ))
//                         ) : (
//                           <>
//                             <option value="ADMIN">ADMIN</option>
//                             <option value="MANAGER">MANAGER</option>
//                             <option value="USER">USER</option>
//                           </>
//                         )}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="flex items-center pt-6">
//                     <input
//                       type="checkbox"
//                       id="is_active"
//                       checked={formData.is_active}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           is_active: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <label
//                       htmlFor="is_active"
//                       className="ml-2 text-sm font-medium text-gray-700"
//                     >
//                       Active User
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="border-t p-4 flex gap-3 sticky bottom-0 bg-white">
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {submitting ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Saving...
//                     </>
//                   ) : editingId ? (
//                     "Update User"
//                   ) : (
//                     <>
//                       <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                       Create User
//                     </>
//                   )}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// src/components/UsersMaster.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  Shield,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Loader2,
  Building,
  Search,
  Filter,
  XCircle,
} from "lucide-react";
import { UsersApi } from "../lib/Api";
import { getAllRoles } from "../lib/rolesApi";
import { departmentsApi, Department } from "../lib/departmentApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";

// Types
interface Permissions {
  [key: string]: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  department?: string;
  department_id?: string;
  is_active: boolean;
  permissions?: Permissions;
}

interface UserFormData {
  email: string;
  full_name: string;
  phone: string;
  role: string;
  department: string;
  department_id?: string;
  password: string;
  is_active: boolean;
  permissions: Permissions;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permissions;
  is_active: boolean;
}

export default function UsersMaster() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchStatus, setSearchStatus] = useState('');

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    full_name: "",
    phone: "",
    role: "USER",
    department: "",
    department_id: "",
    password: "",
    is_active: true,
    permissions: {},
  });

  // Load users, roles, and departments
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const loadData = async () => {
      try {
        // Load users
        const usersData = await UsersApi.list();

        if (!mounted) return;

        const normalized = usersData.map((u: any) => ({
          id: u.id || u._id,
          email: u.email || "",
          full_name: u.full_name || u.name || "",
          phone: u.phone || "",
          role: u.role?.toUpperCase() || "USER",
          department: u.department || "",
          department_id: u.department_id || "",
          is_active: u.is_active !== false,
          permissions: u.permissions || {},
        })) as UserProfile[];

        setUsers(normalized);

        // Load roles
        try {
          const rolesData = await getAllRoles();
          if (mounted) {
            let rolesArray: Role[] = [];
            if (Array.isArray(rolesData)) {
              rolesArray = rolesData;
            } else if (rolesData && typeof rolesData === 'object' && Array.isArray(rolesData.data)) {
              rolesArray = rolesData.data;
            } else if (rolesData && typeof rolesData === 'object') {
              const tempArray = Object.values(rolesData);
              if (Array.isArray(tempArray)) {
                rolesArray = tempArray;
              }
            }
            const normalizedRoles = rolesArray.map(role => ({
              ...role,
              name: role.name.toUpperCase()
            }));
            setAllRoles(normalizedRoles);
          }
        } catch (rolesErr: any) {
          console.error("Failed to load roles:", rolesErr);
          if (mounted) {
            toast.error("Failed to load roles: " + (rolesErr.message || "Unknown error"));
            setAllRoles([]);
          }
        }

        // Load departments
        try {
          setLoadingDepartments(true);
          const departmentsData: any = await departmentsApi.getAll();

          if (mounted) {
            setDepartments(departmentsData.data || []);
          }
        } catch (deptErr: any) {
          console.error("Failed to load departments:", deptErr);
          if (mounted) {
            toast.error("Failed to load departments: " + (deptErr.message || "Unknown error"));
            setDepartments([]);
          }
        } finally {
          if (mounted) {
            setLoadingDepartments(false);
          }
        }

      } catch (err: any) {
        console.error("Failed to load users:", err);
        toast.error("Failed to load users: " + (err.message || "Unknown error"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!editingId && (!formData.password || formData.password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.full_name || formData.full_name.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }

    if (!formData.department) {
      toast.error("Please select a department");
      return;
    }

    if (!formData.role) {
      toast.error("Please select a role");
      return;
    }

    setSubmitting(true);

    try {
      // Prepare payload
      const payload: any = {
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone,
        role: formData.role.toUpperCase(),
        department: formData.department,
        department_id: formData.department_id,
        is_active: formData.is_active,
        permissions: formData.permissions || {}
      };

      // Add password only if provided
      if (formData.password && formData.password.length > 0) {
        payload.password = formData.password;
      }

      let result: UserProfile;

      if (editingId) {
        // Update user
        result = await UsersApi.update(editingId, payload);
        setUsers((prev) =>
          prev.map((u) => (u.id === editingId ? { ...u, ...result } : u))
        );
        toast.success("User updated successfully!");
      } else {
        // Check for duplicate email
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          toast.error("A user with this email already exists");
          setSubmitting(false);
          return;
        }

        // Create user
        result = await UsersApi.create(payload);
        setUsers((prev) => [...prev, result]);
        toast.success("User created successfully!");
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(err?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      full_name: "",
      phone: "",
      role: "USER",
      department: "",
      department_id: "",
      password: "",
      is_active: true,
      permissions: {},
    });
    setEditingId(null);
    setShowPassword(false);
  };

  const handleEdit = (user: UserProfile) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      full_name: user.full_name || "",
      phone: user.phone || "",
      role: user.role?.toUpperCase() || "USER",
      department: user.department || "",
      department_id: user.department_id || "",
      password: "",
      is_active: user.is_active !== false,
      permissions: user.permissions || {},
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete User?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    try {
      await UsersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete user");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: "Delete Users?",
      text: `Are you sure you want to delete ${selectedUsers.size} user(s)? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      for (const id of Array.from(selectedUsers)) {
        await UsersApi.remove(id);
      }

      setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.id)));
      setSelectedUsers(new Set());
      setSelectAll(false);
      toast.success(`Successfully deleted ${selectedUsers.size} user(s)!`);
    } catch (err) {
      console.error("Bulk delete error:", err);
      toast.error("Failed to delete users");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await UsersApi.toggleActive(id);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, is_active: !currentStatus } : u
        )
      );
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error("Toggle error:", err);
      toast.error("Failed to update status");
    }
  };

  const handleBulkToggleActive = async (activate: boolean) => {
    if (selectedUsers.size === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setSubmitting(true);
    try {
      // Update local state first
      setUsers((prev) =>
        prev.map((u) =>
          selectedUsers.has(u.id) ? { ...u, is_active: activate } : u
        )
      );

      // Update on server
      for (const id of Array.from(selectedUsers)) {
        const user = users.find(u => u.id === id);
        if (user && user.is_active !== activate) {
          await UsersApi.toggleActive(id);
        }
      }

      toast.success(`${selectedUsers.size} user(s) ${activate ? 'activated' : 'deactivated'} successfully!`);
    } catch (err) {
      console.error("Bulk toggle error:", err);
      toast.error("Failed to update users status");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = (role: string) => {
    setFormData({
      ...formData,
      role: role
    });
  };

  const handleDepartmentChange = (departmentName: string) => {
    const selectedDept = departments.find(dept => dept.name === departmentName);
    setFormData({
      ...formData,
      department: departmentName,
      department_id: selectedDept?.id || ""
    });
  };

  const handleSelectUser = (id: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedUsers(newSelected);
    setSelectAll(newSelected.size === filteredUsers.length);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedUsers(new Set());
    } else {
      const allIds = new Set(filteredUsers.map(user => user.id));
      setSelectedUsers(allIds);
    }
    setSelectAll(!selectAll);
  };

  const clearAllFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchDepartment('');
    setSearchRole('');
    setSearchPhone('');
    setSearchStatus('');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesName = !searchName ||
        (user.full_name || '').toLowerCase().includes(searchName.toLowerCase());

      const matchesEmail = !searchEmail ||
        (user.email || '').toLowerCase().includes(searchEmail.toLowerCase());

      const matchesDepartment = !searchDepartment ||
        (user.department || '').toLowerCase().includes(searchDepartment.toLowerCase());

      const matchesRole = !searchRole ||
        (user.role || '').toLowerCase().includes(searchRole.toLowerCase());

      const matchesPhone = !searchPhone ||
        (user.phone || '').includes(searchPhone);

      const matchesStatus = !searchStatus ||
        (user.is_active ? "active" : "inactive").includes(searchStatus.toLowerCase());

      return matchesName && matchesEmail && matchesDepartment && 
             matchesRole && matchesPhone && matchesStatus;
    });
  }, [users, searchName, searchEmail, searchDepartment, searchRole, searchPhone, searchStatus]);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700",
      MANAGER: "bg-blue-100 text-blue-700",
      PURCHASER: "bg-green-100 text-green-700",
      STORE_KEEPER: "bg-purple-100 text-purple-700",
      USER: "bg-gray-100 text-gray-700",
    };
    return colors[role.toUpperCase()] || "bg-gray-100 text-gray-700";
  };

  const activeDepartments = useMemo(() => {
    return departments.filter(dept => dept.is_active);
  }, [departments]);

  const safeRoles = Array.isArray(allRoles) ? allRoles : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
<div className="p-4 md:p-6 -mt-9 md:-mt-12 px-0 md:px-0 bg-gray-50 min-h-screen">
      {/* Header with Actions - Side by Side like ItemsMaster */}
      <div className="mt-0 mb-1 px-0 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
        <div></div>

        <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
          {/* Bulk Actions */}
          {selectedUsers.size > 0 && (
            <div className="flex items-center gap-0.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-md shadow-sm px-1.5 py-0.5 md:px-2 md:py-2 whitespace-nowrap px-0">
              {/* Selected Count */}
              <div className="flex items-center gap-0.5">
                <div className="bg-red-100 p-0.5 rounded">
                  <Trash2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600" />
                </div>
                <p className="font-medium text-[9px] md:text-xs text-gray-800">
                  {selectedUsers.size} selected
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={submitting}
                  className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={submitting}
                  className="bg-yellow-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={submitting}
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Divider (desktop only) */}
          <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

          {/* Add User Button */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium shadow-sm whitespace-nowrap ml-auto md:ml-0"
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      {/* <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="w-4 h-4" />
          {showMobileFilters ? "Hide Filters" : "Show Filters"}
          <div className="ml-auto flex items-center gap-1">
            {searchName || searchEmail || searchDepartment || searchRole || searchPhone || searchStatus ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-red-600">Filters Active</span>
              </div>
            ) : null}
          </div>
        </button>
      </div> */}

      {/* Mobile Filters Panel */}
      {/* {showMobileFilters && (
        <div className="md:hidden mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-700">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input
                type="text"
                placeholder="Search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <input
                type="text"
                placeholder="Search email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
              <input
                type="text"
                placeholder="Search department..."
                value={searchDepartment}
                onChange={(e) => setSearchDepartment(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select
                value={searchStatus}
                onChange={(e) => setSearchStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
              >
                Clear Filters
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Main Table - Responsive with Search Bars like ItemsMaster */}
      <div className="bg-white rounded-xl  px-0 shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Role
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Department
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Phone
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
              
              {/* Search Row - Like ItemsMaster */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>
                
                {/* Name Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Email Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Role Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search role..."
                    value={searchRole}
                    onChange={(e) => setSearchRole(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Department Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search department..."
                    value={searchDepartment}
                    onChange={(e) => setSearchDepartment(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Phone Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search phone..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Status Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Actions - Clear Filter Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear Filters"
                  >
                    <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelected = selectedUsers.has(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 transition ${
                        isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-800 text-xs md:text-sm">
                            {user.full_name || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">{user.email}</td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {user.role?.toUpperCase() || "USER"}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                        {user.department || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                        {user.phone || "-"}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <button
                          onClick={() => toggleActive(user.id, user.is_active)}
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {user.is_active ? "ACTIVE" : "INACTIVE"}
                        </button>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      {users.length === 0 ? "No users found" : "No matching users found"}
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      {searchName || searchEmail || searchDepartment || searchRole || searchPhone || searchStatus
                        ? "Try a different search term"
                        : 'Click "Add User" to create your first user'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal - Made Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl border border-gray-200 overflow-hidden max-h-[90vh] mx-2">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2 md:gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-1 md:gap-1.5">
                    {editingId ? "Edit User" : "Add User"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5 hidden md:block">
                    {editingId ? "Update user details" : "Add new user"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
              <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 md:w-5 md:h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({ ...formData, full_name: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="John Doe"
                        required
                        minLength={2}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="john@example.com"
                        required
                        disabled={!!editingId}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={formData.phone}
                        required
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setFormData({ ...formData, phone: value });
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                        {formData.phone.length}/10
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.department}
                        onChange={(e) => handleDepartmentChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                        required
                        disabled={loadingDepartments}
                      >
                        <option value="">Select Department</option>
                        {loadingDepartments ? (
                          <option value="" disabled>
                            Loading departments...
                          </option>
                        ) : activeDepartments.length > 0 ? (
                          activeDepartments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                              {dept.code ? ` (${dept.code})` : ''}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No departments available
                          </option>
                        )}
                      </select>
                      {loadingDepartments && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500 hidden md:block">
                        {activeDepartments.length} department(s) available
                      </span>
                      {formData.department_id && (
                        <span className="text-xs text-green-600">
                          ✓ Department selected
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      {editingId ? "Change Password (optional)" : "Password *"}
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-12 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder={editingId ? "Leave blank to keep current" : "Min 6 characters"}
                        required={!editingId}
                        minLength={editingId ? 0 : 6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Shield className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                        required
                      >
                        <option value="">Select a role</option>
                        {safeRoles.length > 0 ? (
                          safeRoles.map((role) => (
                            <option key={role.id} value={role.name}>
                              {role.name} {role.description ? `(${role.description})` : ''}
                            </option>
                          ))
                        ) : (
                          <>
                            <option value="ADMIN">ADMIN</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="USER">USER</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center pt-4 md:pt-6">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Active User
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingId ? (
                    "Update User"
                  ) : (
                    <>
                      <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Create User
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 md:px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}