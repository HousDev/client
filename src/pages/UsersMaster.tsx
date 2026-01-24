        {/* Search Row - Like ItemsMaster */}
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <td className="px-3 md:px-4 py-1 text-center">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAll}
//                     className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                   />
//                 </td>
                
//                 {/* Name Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search name..."
//                     value={searchName}
//                     onChange={(e) => setSearchName(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Email Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search email..."
//                     value={searchEmail}
//                     onChange={(e) => setSearchEmail(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Role Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search role..."
//                     value={searchRole}
//                     onChange={(e) => setSearchRole(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Department Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search department..."
//                     value={searchDepartment}
//                     onChange={(e) => setSearchDepartment(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Phone Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search phone..."
//                     value={searchPhone}
//                     onChange={(e) => setSearchPhone(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Status Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search status..."
//                     value={searchStatus}
//                     onChange={(e) => setSearchStatus(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Actions - Clear Filter Button */}
//                 <td className="px-3 md:px-4 py-1 text-center">
//                   <button
//                     onClick={clearAllFilters}
//                     className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
//                     title="Clear Filters"
//                   >
//                     <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
//                     Clear
//                   </button>
//                 </td>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => {
//                   const isSelected = selectedUsers.has(user.id);
//                   return (
//                     <tr
//                       key={user.id}
//                       className={`hover:bg-gray-50 transition ${
//                         isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
//                       }`}
//                     >
//                       <td className="px-3 md:px-4 py-3 text-center">
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => handleSelectUser(user.id)}
//                           className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                         />
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <div className="flex items-center gap-2">
//                           <Users className="w-4 h-4 text-blue-600" />
//                           <span className="font-medium text-gray-800 text-xs md:text-sm">
//                             {user.full_name || "N/A"}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">{user.email}</td>
//                       <td className="px-3 md:px-4 py-3">
//                         <span
//                           className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getRoleColor(
//                             user.role
//                           )}`}
//                         >
//                           {user.role?.toUpperCase() || "USER"}
//                         </span>
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
//                         {user.department || "-"}
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
//                         {user.phone || "-"}
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <button
//                           onClick={() => toggleActive(user.id, user.is_active)}
//                           className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
//                             user.is_active
//                               ? "bg-green-100 text-green-700"
//                               : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {user.is_active ? "ACTIVE" : "INACTIVE"}
//                         </button>
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <div className="flex items-center justify-center gap-1.5 md:gap-2">
//                           <button
//                             onClick={() => handleEdit(user)}
//                             className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(user.id)}
//                             className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="px-4 py-8 text-center">
//                     <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-600 text-sm md:text-lg font-medium">
//                       {users.length === 0 ? "No users found" : "No matching users found"}
//                     </p>
//                     <p className="text-gray-500 text-xs md:text-sm mt-1">
//                       {searchName || searchEmail || searchDepartment || searchRole || searchPhone || searchStatus
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

//       {/* Add/Edit Modal - Made Responsive */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
//           <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl border border-gray-200 overflow-hidden max-h-[90vh] mx-2">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
//               <div className="flex items-center gap-2 md:gap-2.5">
//                 <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
//                   <Users className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-1 md:gap-1.5">
//                     {editingId ? "Edit User" : "Add User"}
//                   </h2>
//                   <p className="text-xs text-white/90 font-medium mt-0.5 hidden md:block">
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

//             <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
//               <div className="mb-4 md:mb-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
//                   <Users className="w-4 h-4 md:w-5 md:h-5" />
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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
//                         <Building className="w-3.5 h-3.5" />
//                       </div>
//                       <select
//                         value={formData.department}
//                         onChange={(e) => handleDepartmentChange(e.target.value)}
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
//                         required
//                         disabled={loadingDepartments}
//                       >
//                         <option value="">Select Department</option>
//                         {loadingDepartments ? (
//                           <option value="" disabled>
//                             Loading departments...
//                           </option>
//                         ) : activeDepartments.length > 0 ? (
//                           activeDepartments.map((dept) => (
//                             <option key={dept.id} value={dept.name}>
//                               {dept.name}
//                               {dept.code ? ` (${dept.code})` : ''}
//                             </option>
//                           ))
//                         ) : (
//                           <option value="" disabled>
//                             No departments available
//                           </option>
//                         )}
//                       </select>
//                       {loadingDepartments && (
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                           <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-xs text-gray-500 hidden md:block">
//                         {activeDepartments.length} department(s) available
//                       </span>
//                       {formData.department_id && (
//                         <span className="text-xs text-green-600">
//                           ✓ Department selected
//                         </span>
//                       )}
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
//                         <Shield className="w-3.5 h-3.5" />
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

//                   <div className="flex items-center pt-4 md:pt-6">
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
//               <div className="border-t p-4 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 bg-white">
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
//                   className="px-4 md:px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
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

// // src/components/UsersMaster.tsx - COMPLETE FIXED CODE
// import React, { useEffect, useState, useMemo, useRef } from "react";
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
//   Building,
//   Search,
//   Filter,
//   XCircle,
// } from "lucide-react";
// import { Camera, Upload, User as UserIcon } from "lucide-react";

// import { UsersApi } from "../lib/Api";
// import { getAllRoles } from "../lib/rolesApi";
// import { departmentsApi, Department } from "../lib/departmentApi";
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
//   department_id?: string;
//   is_active: boolean;
//   profile_picture?: string;
//   permissions?: Permissions;
// }

// interface UserFormData {
//   email: string;
//   full_name: string;
//   phone: string;
//   role: string;
//   department: string;
//   department_id?: string;
//   password: string;
//   is_active: boolean;
//   profile_picture?: string;
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
//   const [departments, setDepartments] = useState<Department[]>([]);
//   const [loadingDepartments, setLoadingDepartments] = useState(false);

//   // Search states
//   const [searchName, setSearchName] = useState('');
//   const [searchEmail, setSearchEmail] = useState('');
//   const [searchDepartment, setSearchDepartment] = useState('');
//   const [searchRole, setSearchRole] = useState('');
//   const [searchPhone, setSearchPhone] = useState('');
//   const [searchStatus, setSearchStatus] = useState('');

//   // Bulk selection
//   const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);
//   const [showMobileFilters, setShowMobileFilters] = useState(false);

//   // Profile picture states
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string>("");
//   const [uploadingProfile, setUploadingProfile] = useState(false);
  
//   // Ref to track if we need to refresh users
//   const shouldRefreshRef = useRef(false);

//   const [formData, setFormData] = useState<UserFormData>({
//     email: "",
//     full_name: "",
//     phone: "",
//     role: "USER",
//     department: "",
//     department_id: "",
//     password: "",
//     is_active: true,
//     profile_picture: "",
//     permissions: {},
//   });

//   // Function to load users
//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const usersData = await UsersApi.list();
//       const normalized = usersData.map((u: any) => ({
//         id: u.id || u._id,
//         email: u.email || "",
//         full_name: u.full_name || u.name || "",
//         phone: u.phone || "",
//         role: u.role?.toUpperCase() || "USER",
//         department: u.department || "",
//         department_id: u.department_id || "",
//         is_active: u.is_active !== false,
//         profile_picture: u.profile_picture || "",
//         permissions: u.permissions || {},
//       })) as UserProfile[];
//       setUsers(normalized);
//     } catch (err: any) {
//       console.error("Failed to load users:", err);
//       toast.error("Failed to load users: " + (err.message || "Unknown error"));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load users, roles, and departments
//   useEffect(() => {
//     let mounted = true;

//     const loadData = async () => {
//       try {
//         // Load users
//         await loadUsers();

//         if (!mounted) return;

//         // Load roles
//         try {
//           const rolesData = await getAllRoles();
//           if (mounted) {
//             let rolesArray: Role[] = [];
//             if (Array.isArray(rolesData)) {
//               rolesArray = rolesData;
//             } else if (rolesData && typeof rolesData === 'object' && Array.isArray(rolesData.data)) {
//               rolesArray = rolesData.data;
//             } else if (rolesData && typeof rolesData === 'object') {
//               const tempArray = Object.values(rolesData);
//               if (Array.isArray(tempArray)) {
//                 rolesArray = tempArray;
//               }
//             }
//             const normalizedRoles = rolesArray.map(role => ({
//               ...role,
//               name: role.name.toUpperCase()
//             }));
//             setAllRoles(normalizedRoles);
//           }
//         } catch (rolesErr: any) {
//           console.error("Failed to load roles:", rolesErr);
//           if (mounted) {
//             toast.error("Failed to load roles: " + (rolesErr.message || "Unknown error"));
//             setAllRoles([]);
//           }
//         }

//         // Load departments
//         try {
//           setLoadingDepartments(true);
//           const departmentsData: any = await departmentsApi.getAll();

//           if (mounted) {
//             setDepartments(departmentsData.data || []);
//           }
//         } catch (deptErr: any) {
//           console.error("Failed to load departments:", deptErr);
//           if (mounted) {
//             toast.error("Failed to load departments: " + (deptErr.message || "Unknown error"));
//             setDepartments([]);
//           }
//         } finally {
//           if (mounted) {
//             setLoadingDepartments(false);
//           }
//         }

//       } catch (err: any) {
//         console.error("Failed to load data:", err);
//       }
//     };

//     loadData();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // Effect to refresh users when modal closes and we need to refresh
//   useEffect(() => {
//     if (!showModal && shouldRefreshRef.current) {
//       shouldRefreshRef.current = false;
//       loadUsers();
//     }
//   }, [showModal]);

//   // Add file upload handler
//   const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       // Validate file type
//       const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
//       if (!validTypes.includes(file.type)) {
//         toast.error("Please select a valid image file (JPEG, PNG, WebP)");
//         return;
//       }

//       // Validate file size (5MB)
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("Image size should be less than 5MB");
//         return;
//       }

//       setSelectedFile(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

// // FIXED: Upload profile picture function
// const uploadProfilePicture = async (userId: string): Promise<string | null> => {
//   if (!selectedFile) {
//     console.log("No file selected for upload");
//     return null;
//   }

//   if (!userId) {
//     toast.error("No user selected");
//     return null;
//   }

//   setUploadingProfile(true);
//   try {
//     console.log("Uploading profile picture for user ID:", userId);
//     console.log("Selected file details:", {
//       name: selectedFile.name,
//       type: selectedFile.type,
//       size: selectedFile.size,
//       lastModified: selectedFile.lastModified
//     });

//     // Create FormData
//     const formDataToSend = new FormData();
//     formDataToSend.append("profile_picture", selectedFile);
    
//     // Debug: Log FormData contents
  

//     // Use the UsersApi method for consistency
//     const response = await UsersApi.uploadProfilePicture(userId, selectedFile);
    
//     console.log("Upload API response:", response);
    
//     if (response.success && response.data && response.data.profile_picture) {
//       toast.success("Profile picture uploaded successfully");
//       console.log("Server returned profile picture URL:", response.data.profile_picture);
//       return response.data.profile_picture;
//     } else {
//       console.error("Upload failed - response structure:", response);
//       toast.error(response.error || "Failed to upload profile picture");
//       return null;
//     }
//   } catch (error: any) {
//     console.error("Upload error:", error);
//     console.error("Error details:", {
//       message: error.message,
//       stack: error.stack,
//       response: error.response?.data
//     });
    
//     // Try direct fetch as fallback
//     try {
//       console.log("Trying direct fetch as fallback...");
      
//       const formDataFallback = new FormData();
//       formDataFallback.append("profile_picture", selectedFile);
      
//       const fetchResponse = await fetch(`http://localhost:4000/api/users/${userId}/profile-picture`, {
//         method: "PATCH",
//         body: formDataFallback,
//         // Don't set Content-Type header - browser will set it with boundary
//       });
      
//       console.log("Fetch response status:", fetchResponse.status);
//       console.log("Fetch response headers:", Object.fromEntries(fetchResponse.headers.entries()));
      
//       const result = await fetchResponse.json();
//       console.log("Fetch response data:", result);
      
//       if (fetchResponse.ok && result.success && result.data?.profile_picture) {
//         toast.success("Profile picture uploaded (fallback method)");
//         return result.data.profile_picture;
//       } else {
//         throw new Error(result.error || `Upload failed with status ${fetchResponse.status}`);
//       }
//     } catch (fallbackError: any) {
//       console.error("Fallback upload failed:", fallbackError);
//       toast.error("Profile picture upload failed: " + (fallbackError.message || "Unknown error"));
//       return null;
//     }
//   } finally {
//     setUploadingProfile(false);
//   }
// };


//  const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   // Validation
//   if (!formData.email.trim()) {
//     toast.error("Email is required");
//     return;
//   }

//   if (!editingId && (!formData.password || formData.password.length < 6)) {
//     toast.error("Password must be at least 6 characters");
//     return;
//   }

//   if (!formData.full_name || formData.full_name.trim().length < 2) {
//     toast.error("Full name must be at least 2 characters");
//     return;
//   }

//   if (!formData.phone || formData.phone.length !== 10) {
//     toast.error("Phone number must be 10 digits");
//     return;
//   }

//   if (!formData.department) {
//     toast.error("Please select a department");
//     return;
//   }

//   if (!formData.role) {
//     toast.error("Please select a role");
//     return;
//   }

//   setSubmitting(true);

//   try {
//     // Prepare payload
//     const payload: any = {
//       email: formData.email.trim(),
//       full_name: formData.full_name.trim(),
//       phone: formData.phone,
//       role: formData.role.toUpperCase(),
//       department: formData.department,
//       department_id: formData.department_id,
//       is_active: formData.is_active,
//       permissions: formData.permissions || {}
//     };

//     // Add password only if provided
//     if (formData.password && formData.password.length > 0) {
//       payload.password = formData.password;
//     }

//     if (editingId) {
//       // UPDATE EXISTING USER
//       console.log("Updating existing user ID:", editingId);
      
//       // Update user data
//       const response = await UsersApi.update(editingId, payload);
//       console.log("Update response:", response);
      
//       let result: UserProfile;
      
//       // Extract user data from response
//       if (response.success && response.data) {
//         result = response.data;
//       } else if (response.id) {
//         // If response is the user object directly
//         result = response;
//       } else {
//         throw new Error("Invalid response format");
//       }
      
//       console.log("User data extracted:", result);
      
//       // Upload profile picture if selected
//       if (selectedFile) {
//         console.log("Uploading profile picture for existing user...");
//         const profilePicUrl = await uploadProfilePicture(editingId);
//         if (profilePicUrl) {
//           console.log("Profile picture uploaded:", profilePicUrl);
//           // Update the user object with new profile picture
//           result = { ...result, profile_picture: profilePicUrl };
          
//           // Fetch the updated user from server
//           try {
//             const updatedResponse = await UsersApi.getById(editingId);
//             if (updatedResponse.success && updatedResponse.data) {
//               result = updatedResponse.data;
//             }
//           } catch (fetchError) {
//             console.error("Error fetching updated user:", fetchError);
//             result.profile_picture = profilePicUrl;
//           }
//         }
//       }
      
//       // Update state
//       setUsers((prev) =>
//         prev.map((u) => (u.id === editingId ? { ...u, ...result } : u))
//       );
//       toast.success("User updated successfully!");
//     } else {
//       // CREATE NEW USER
//       // Check for duplicate email
//       if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
//         toast.error("A user with this email already exists");
//         setSubmitting(false);
//         return;
//       }

//       console.log("Creating new user with payload:", payload);
      
//       // Create user first
//       const response = await UsersApi.create(payload);
//       console.log("Create response:", response);
      
//       // Extract user data from response
//       let newUser: UserProfile;
//       let userId: string;
      
//       if (response.success && response.data) {
//         // Response format: { success: true, data: { ...userData }, message: '...' }
//         newUser = response.data;
//         userId = newUser.id || newUser._id;
//         console.log("User extracted from response.data:", newUser);
//         console.log("User ID:", userId);
//       } else if (response.id || response._id) {
//         // Response format: { id: '...', email: '...', ... }
//         newUser = response;
//         userId = response.id || response._id;
//         console.log("User is the response itself:", newUser);
//       } else {
//         console.error("Invalid response format:", response);
//         throw new Error("Invalid response format from server");
//       }
      
//       if (!userId) {
//         console.error("No user ID found in response:", response);
//         throw new Error("User ID not found in response");
//       }
      
//       let finalUser = newUser;
      
//       // Upload profile picture if selected
//       if (selectedFile && userId) {
//         console.log("Uploading profile picture for new user ID:", userId);
//         console.log("Selected file:", selectedFile.name, selectedFile.type, selectedFile.size);
        
//         const profilePicUrl = await uploadProfilePicture(userId);
        
//         if (profilePicUrl) {
//           console.log("Profile picture uploaded successfully:", profilePicUrl);
          
//           // Update user object with profile picture
//           finalUser = {
//             ...newUser,
//             profile_picture: profilePicUrl
//           };
          
//           // Fetch updated user from server
//           try {
//             const updatedResponse = await UsersApi.getById(userId);
//             console.log("Updated user response:", updatedResponse);
            
//             if (updatedResponse.success && updatedResponse.data) {
//               finalUser = updatedResponse.data;
//             } else if (updatedResponse.id) {
//               finalUser = updatedResponse;
//             }
//             console.log("Final user after fetch:", finalUser);
//           } catch (fetchError) {
//             console.error("Error fetching updated user:", fetchError);
//             finalUser.profile_picture = profilePicUrl;
//           }
//         }
//       }
      
//       // Clean up blob URL
//       if (previewUrl && previewUrl.startsWith('blob:')) {
//         console.log("Revoking blob URL:", previewUrl);
//         URL.revokeObjectURL(previewUrl);
//       }
      
//       // Add new user to state
//       console.log("Adding user to state:", finalUser);
      
//       // FIX: Make sure we have a valid ID for the user
//       if (!finalUser.id) {
//         finalUser = { ...finalUser, id: userId };
//       }
      
//       setUsers((prev) => [...prev, finalUser]);
//       toast.success("User created successfully!");
      
//       // Set flag to refresh users from server
//       shouldRefreshRef.current = true;
//     }

//     setShowModal(false);
//     resetForm();
//   } catch (err: any) {
//     console.error("Submit error:", err);
    
//     if (err.response) {
//       console.error("Error response:", err.response);
//       console.error("Error data:", err.response?.data);
//     }
    
//     toast.error(err?.message || "Operation failed");
//   } finally {
//     setSubmitting(false);
//   }
// };
//   // Update resetForm function
//   const resetForm = () => {
//     // Cleanup blob URL to prevent memory leaks
//     if (previewUrl && previewUrl.startsWith('blob:')) {
//       URL.revokeObjectURL(previewUrl);
//     }
    
//     setFormData({
//       email: "",
//       full_name: "",
//       phone: "",
//       role: "USER",
//       department: "",
//       department_id: "",
//       password: "",
//       is_active: true,
//       profile_picture: "",
//       permissions: {},
//     });
//     setEditingId(null);
//     setShowPassword(false);
//     setSelectedFile(null);
//     setPreviewUrl("");
//   };

//   const handleEdit = (user: UserProfile) => {
//     setEditingId(user.id);
//     setFormData({
//       email: user.email,
//       full_name: user.full_name || "",
//       phone: user.phone || "",
//       role: user.role?.toUpperCase() || "USER",
//       department: user.department || "",
//       department_id: user.department_id || "",
//       password: "",
//       is_active: user.is_active !== false,
//       profile_picture: user.profile_picture || "",
//       permissions: user.permissions || {},
//     });
    
//     // Clean up old preview URL if it exists
//     if (previewUrl && previewUrl.startsWith('blob:')) {
//       URL.revokeObjectURL(previewUrl);
//     }
    
//     // Set preview URL - use actual server URL, not blob
//     if (user.profile_picture && !user.profile_picture.startsWith('blob:')) {
//       // Convert to full URL if needed
//       const fullUrl = getProfilePictureUrl(user.profile_picture);
//       setPreviewUrl(fullUrl);
//     } else {
//       setPreviewUrl("");
//     }
    
//     setSelectedFile(null);
//     setShowModal(true);
//   };

//   // Helper function to get correct profile picture URL
//   // Helper function to get correct profile picture URL
// const getProfilePictureUrl = (profilePicture: string | undefined) => {
//   if (!profilePicture) {
//     return "";
//   }
  
//   // If it's a blob URL, we should NOT display it in the table
//   // This means the profile picture hasn't been properly saved to server
//   if (profilePicture.startsWith('blob:')) {
//     console.warn("Found blob URL in user data:", profilePicture);
//     return ""; // Return empty to show default icon
//   }
  
//   // If it's already a full URL, return as is
//   if (profilePicture.includes('http')) {
//     return profilePicture;
//   }
  
//   // If it starts with /uploads/, prepend the backend URL
//   if (profilePicture.startsWith('/uploads/')) {
//     return `http://localhost:4000${profilePicture}`;
//   }
  
//   // Otherwise, assume it's a filename and construct the full URL
//   return `http://localhost:4000/uploads/${profilePicture}`;
// };

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
//     setFormData({
//       ...formData,
//       role: role
//     });
//   };

//   const handleDepartmentChange = (departmentName: string) => {
//     const selectedDept = departments.find(dept => dept.name === departmentName);
//     setFormData({
//       ...formData,
//       department: departmentName,
//       department_id: selectedDept?.id || ""
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

//   const clearAllFilters = () => {
//     setSearchName('');
//     setSearchEmail('');
//     setSearchDepartment('');
//     setSearchRole('');
//     setSearchPhone('');
//     setSearchStatus('');
//   };

//   const filteredUsers = useMemo(() => {
//     return users.filter((user) => {
//       const matchesName = !searchName ||
//         (user.full_name || '').toLowerCase().includes(searchName.toLowerCase());

//       const matchesEmail = !searchEmail ||
//         (user.email || '').toLowerCase().includes(searchEmail.toLowerCase());

//       const matchesDepartment = !searchDepartment ||
//         (user.department || '').toLowerCase().includes(searchDepartment.toLowerCase());

//       const matchesRole = !searchRole ||
//         (user.role || '').toLowerCase().includes(searchRole.toLowerCase());

//       const matchesPhone = !searchPhone ||
//         (user.phone || '').includes(searchPhone);

//       const matchesStatus = !searchStatus ||
//         (user.is_active ? "active" : "inactive").includes(searchStatus.toLowerCase());

//       return matchesName && matchesEmail && matchesDepartment && 
//              matchesRole && matchesPhone && matchesStatus;
//     });
//   }, [users, searchName, searchEmail, searchDepartment, searchRole, searchPhone, searchStatus]);

//   // FIXED: getRoleColor function with null check
//   const getRoleColor = (role: string) => {
//     // Add null/undefined check
//     if (!role) {
//       return "bg-gray-100 text-gray-700";
//     }
    
//     const colors: Record<string, string> = {
//       ADMIN: "bg-red-100 text-red-700",
//       MANAGER: "bg-blue-100 text-blue-700",
//       PURCHASER: "bg-green-100 text-green-700",
//       STORE_KEEPER: "bg-purple-100 text-purple-700",
//       USER: "bg-gray-100 text-gray-700",
//     };
    
//     const upperRole = role.toUpperCase();
//     return colors[upperRole] || "bg-gray-100 text-gray-700";
//   };

//   const activeDepartments = useMemo(() => {
//     return departments.filter(dept => dept.is_active);
//   }, [departments]);

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
//     <div className="p-4 md:p-6 -mt-9 md:-mt-12 px-0 md:px-0 bg-gray-50 min-h-screen">
//       {/* Header with Actions - Side by Side like ItemsMaster */}
//       <div className="mt-0 mb-1 px-0 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
//         <div></div>

//         <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
//           {/* Bulk Actions */}
//           {selectedUsers.size > 0 && (
//             <div className="flex items-center gap-0.5 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-md shadow-sm px-1.5 py-0.5 md:px-2 md:py-2 whitespace-nowrap px-0">
//               {/* Selected Count */}
//               <div className="flex items-center gap-0.5">
//                 <div className="bg-red-100 p-0.5 rounded">
//                   <Trash2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600" />
//                 </div>
//                 <p className="font-medium text-[9px] md:text-xs text-gray-800">
//                   {selectedUsers.size} selected
//                 </p>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-0.5">
//                 <button
//                   onClick={() => handleBulkToggleActive(true)}
//                   disabled={submitting}
//                   className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
//                 >
//                   Activate
//                 </button>
//                 <button
//                   onClick={() => handleBulkToggleActive(false)}
//                   disabled={submitting}
//                   className="bg-yellow-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
//                 >
//                   Deactivate
//                 </button>
//                 <button
//                   onClick={handleBulkDelete}
//                   disabled={submitting}
//                   className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
//                 >
//                   {submitting ? (
//                     <Loader2 className="w-2.5 h-2.5 animate-spin" />
//                   ) : (
//                     "Delete"
//                   )}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Divider (desktop only) */}
//           <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

//           {/* Add User Button */}
//           <button
//             onClick={() => {
//               resetForm();
//               setShowModal(true);
//             }}
//             className="flex items-center gap-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white px-2.5 py-1 md:px-4 md:py-2 rounded-lg text-[10px] md:text-sm font-medium shadow-sm whitespace-nowrap ml-auto md:ml-0"
//           >
//             <Plus className="w-3 h-3 md:w-4 md:h-4" />
//             Add User
//           </button>
//         </div>
//       </div>

//       {/* Main Table - Responsive with Search Bars like ItemsMaster */}
//       <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1200px]">
//             <thead className="bg-gray-200 border-b border-gray-200">
//               {/* Header Row */}
//               <tr>
//                 <th className="px-3 md:px-4 py-2 text-center w-12">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Select
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Name
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Email
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Role
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Department
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Phone
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Status
//                   </div>
//                 </th>
//                 <th className="px-3 md:px-4 py-2 text-left">
//                   <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Actions
//                   </div>
//                 </th>
//               </tr>
              
//               {/* Search Row - Like ItemsMaster */}
//               <tr className="bg-gray-50 border-b border-gray-200">
//                 <td className="px-3 md:px-4 py-1 text-center">
//                   <input
//                     type="checkbox"
//                     checked={selectAll}
//                     onChange={handleSelectAll}
//                     className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                   />
//                 </td>
                
//                 {/* Name Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search name..."
//                     value={searchName}
//                     onChange={(e) => setSearchName(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Email Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search email..."
//                     value={searchEmail}
//                     onChange={(e) => setSearchEmail(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Role Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search role..."
//                     value={searchRole}
//                     onChange={(e) => setSearchRole(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Department Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search department..."
//                     value={searchDepartment}
//                     onChange={(e) => setSearchDepartment(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Phone Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search phone..."
//                     value={searchPhone}
//                     onChange={(e) => setSearchPhone(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Status Search */}
//                 <td className="px-3 md:px-4 py-1">
//                   <input
//                     type="text"
//                     placeholder="Search status..."
//                     value={searchStatus}
//                     onChange={(e) => setSearchStatus(e.target.value)}
//                     className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </td>
                
//                 {/* Actions - Clear Filter Button */}
//                 <td className="px-3 md:px-4 py-1 text-center">
//                   <button
//                     onClick={clearAllFilters}
//                     className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
//                     title="Clear Filters"
//                   >
//                     <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
//                     Clear
//                   </button>
//                 </td>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredUsers.length > 0 ? (
//                 filteredUsers.map((user) => {
//                   const isSelected = selectedUsers.has(user.id);
//                   return (
//                     <tr
//                       key={user.id}
//                       className={`hover:bg-gray-50 transition ${
//                         isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
//                       }`}
//                     >
//                       <td className="px-3 md:px-4 py-3 text-center">
//                         <input
//                           type="checkbox"
//                           checked={isSelected}
//                           onChange={() => handleSelectUser(user.id)}
//                           className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                         />
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <div className="flex items-center gap-3">
//                           <div className="relative">
//                             {user.profile_picture ? (
//                               <img
//                                 src={getProfilePictureUrl(user.profile_picture)}
//                                 alt={user.full_name}
//                                 className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow"
//                                 onError={(e) => {
//                                   // If image fails to load, hide it and show default icon
//                                   e.currentTarget.style.display = 'none';
//                                   const parent = e.currentTarget.parentElement;
//                                   if (parent) {
//                                     const defaultIcon = parent.querySelector('.default-icon');
//                                     if (defaultIcon) {
//                                       (defaultIcon as HTMLElement).style.display = 'flex';
//                                     }
//                                   }
//                                 }}
//                               />
//                             ) : (
//                               <div className="default-icon w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
//                                 <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
//                               </div>
//                             )}
//                             <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${
//                               user.is_active ? 'bg-green-500' : 'bg-gray-400'
//                             }`}></div>
//                           </div>
//                           <div>
//                             <span className="font-medium text-gray-800 text-xs md:text-sm block">
//                               {user.full_name || "N/A"}
//                             </span>
//                             <span className="text-xs text-gray-500 hidden md:block">
//                               {user.email}
//                             </span>
//                           </div>
//                         </div>
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">{user.email}</td>
//                       <td className="px-3 md:px-4 py-3">
//                         <span
//                           className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getRoleColor(
//                             user.role || "USER"  // Added fallback here
//                           )}`}
//                         >
//                           {user.role?.toUpperCase() || "USER"}
//                         </span>
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
//                         {user.department || "-"}
//                       </td>
//                       <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
//                         {user.phone || "-"}
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <button
//                           onClick={() => toggleActive(user.id, user.is_active)}
//                           className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
//                             user.is_active
//                               ? "bg-green-100 text-green-700"
//                               : "bg-gray-100 text-gray-700"
//                           }`}
//                         >
//                           {user.is_active ? "ACTIVE" : "INACTIVE"}
//                         </button>
//                       </td>
//                       <td className="px-3 md:px-4 py-3">
//                         <div className="flex items-center justify-center gap-1.5 md:gap-2">
//                           <button
//                             onClick={() => handleEdit(user)}
//                             className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                           </button>
//                           <button
//                             onClick={() => handleDelete(user.id)}
//                             className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Delete"
//                           >
//                             <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               ) : (
//                 <tr>
//                   <td colSpan={8} className="px-4 py-8 text-center">
//                     <Users className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
//                     <p className="text-gray-600 text-sm md:text-lg font-medium">
//                       {users.length === 0 ? "No users found" : "No matching users found"}
//                     </p>
//                     <p className="text-gray-500 text-xs md:text-sm mt-1">
//                       {searchName || searchEmail || searchDepartment || searchRole || searchPhone || searchStatus
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

//       {/* Add/Edit Modal - Made Responsive */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
//           <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl md:rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl border border-gray-200 overflow-hidden max-h-[90vh] mx-2">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
//               <div className="flex items-center gap-2 md:gap-2.5">
//                 <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
//                   <Users className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-1 md:gap-1.5">
//                     {editingId ? "Edit User" : "Add User"}
//                   </h2>
//                   <p className="text-xs text-white/90 font-medium mt-0.5 hidden md:block">
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

//             <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
//               <div className="mb-4 md:mb-6">
//                 <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
//                   <Users className="w-4 h-4 md:w-5 md:h-5" />
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
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

//                   <div className="col-span-1 md:col-span-2 space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Profile Picture
//                     </label>
//                     <div className="flex flex-col md:flex-row items-center gap-4">
//                       <div className="relative">
//                         {previewUrl || formData.profile_picture ? (
//                           <div className="relative group">
//                             <img
//                               src={previewUrl || formData.profile_picture}
//                               alt="Profile preview"
//                               className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
//                               onError={(e) => {
//                                 // If image fails to load, show default icon
//                                 e.currentTarget.style.display = 'none';
//                                 const parent = e.currentTarget.parentElement;
//                                 if (parent) {
//                                   const defaultDiv = parent.querySelector('.default-profile-icon');
//                                   if (defaultDiv) {
//                                     (defaultDiv as HTMLElement).style.display = 'flex';
//                                   }
//                                 }
//                               }}
//                             />
//                             <div className="default-profile-icon absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center rounded-full" style={{ display: 'none' }}>
//                               <UserIcon className="w-12 h-12 text-gray-500" />
//                             </div>
//                             <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
//                               <Camera className="w-6 h-6 text-white" />
//                             </div>
//                           </div>
//                         ) : (
//                           <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
//                             <UserIcon className="w-12 h-12 text-gray-500" />
//                           </div>
//                         )}
//                       </div>
                      
//                       <div className="flex-1 space-y-2">
//                         <input
//                           type="file"
//                           id="profile_picture"
//                           accept="image/jpeg,image/png,image/jpg,image/webp"
//                           onChange={handleFileSelect}
//                           className="hidden"
//                         />
                        
//                         <div className="flex flex-col sm:flex-row gap-2">
//                           <label
//                             htmlFor="profile_picture"
//                             className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm cursor-pointer flex items-center justify-center gap-2"
//                           >
//                             <Upload className="w-4 h-4" />
//                             Choose Image
//                           </label>
//                         </div>
                        
//                         <div className="text-xs text-gray-500">
//                           <p>• Max file size: 5MB</p>
//                           <p>• Supported formats: JPEG, PNG, WebP</p>
//                           <p>• Image will be uploaded automatically when you save the user</p>
//                         </div>
                        
//                         {selectedFile && (
//                           <div className="text-xs text-green-600 font-medium">
//                             Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-800 mb-1">
//                       Department <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative group">
//                       <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                         <Building className="w-3.5 h-3.5" />
//                       </div>
//                       <select
//                         value={formData.department}
//                         onChange={(e) => handleDepartmentChange(e.target.value)}
//                         className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
//                         required
//                         disabled={loadingDepartments}
//                       >
//                         <option value="">Select Department</option>
//                         {loadingDepartments ? (
//                           <option value="" disabled>
//                             Loading departments...
//                           </option>
//                         ) : activeDepartments.length > 0 ? (
//                           activeDepartments.map((dept) => (
//                             <option key={dept.id} value={dept.name}>
//                               {dept.name}
//                               {dept.code ? ` (${dept.code})` : ''}
//                             </option>
//                           ))
//                         ) : (
//                           <option value="" disabled>
//                             No departments available
//                           </option>
//                         )}
//                       </select>
//                       {loadingDepartments && (
//                         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//                           <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
//                         </div>
//                       )}
//                     </div>
//                     <div className="flex items-center justify-between mt-1">
//                       <span className="text-xs text-gray-500 hidden md:block">
//                         {activeDepartments.length} department(s) available
//                       </span>
//                       {formData.department_id && (
//                         <span className="text-xs text-green-600">
//                           ✓ Department selected
//                         </span>
//                       )}
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
//                         <Shield className="w-3.5 h-3.5" />
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

//                   <div className="flex items-center pt-4 md:pt-6">
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
//               <div className="border-t p-4 flex flex-col-reverse sm:flex-row gap-3 sticky bottom-0 bg-white">
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
//                   className="px-4 md:px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
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




// src/components/UsersMaster.tsx - COMPLETE UPDATED CODE WITH EMPLOYEE CHECKBOX
import React, { useEffect, useState, useMemo, useRef } from "react";
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
  Briefcase,
  Calendar,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { Camera, Upload } from "lucide-react";

import { UsersApi } from "../lib/Api";
import { getAllRoles } from "../lib/rolesApi";
import { departmentsApi, Department } from "../lib/departmentApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import projectApi from "../lib/projectApi";
import HrmsEmployeesApi from "../lib/employeeApi";

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
  profile_picture?: string;
  permissions?: Permissions;
}

interface Project {
  id: string;
  name: string;
  code?: string;
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
  profile_picture?: string;
  permissions: Permissions;
  // New fields for employee
  is_employee: boolean;
  designation: string;
  joining_date: string;
  gender: string;
  allotted_project: string;
  office_location: string;
  attendance_location: string;
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

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

  // Profile picture states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingProfile, setUploadingProfile] = useState(false);
  
  // Ref to track if we need to refresh users
  const shouldRefreshRef = useRef(false);

  const [formData, setFormData] = useState<UserFormData>({
    email: "",
    full_name: "",
    phone: "",
    role: "USER",
    department: "",
    department_id: "",
    password: "",
    is_active: true,
    profile_picture: "",
    permissions: {},
    // Initialize new fields
    is_employee: false,
    designation: "",
    joining_date: "",
    gender: "male",
    allotted_project: "",
    office_location: "",
    attendance_location: "",
  });

  // Function to load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await UsersApi.list();
      const normalized = usersData.map((u: any) => ({
        id: u.id || u._id,
        email: u.email || "",
        full_name: u.full_name || u.name || "",
        phone: u.phone || "",
        role: u.role?.toUpperCase() || "USER",
        department: u.department || "",
        department_id: u.department_id || "",
        is_active: u.is_active !== false,
        profile_picture: u.profile_picture || "",
        permissions: u.permissions || {},
      })) as UserProfile[];
      setUsers(normalized);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Function to load projects
  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const projectsData = await projectApi.getProjects();
      setProjects(projectsData.data || []);
    } catch (err: any) {
      console.error("Failed to load projects:", err);
      toast.error("Failed to load projects: " + (err.message || "Unknown error"));
    } finally {
      setLoadingProjects(false);
    }
  };

  // Load users, roles, departments, and projects
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        // Load users
        await loadUsers();

        if (!mounted) return;

        // Load projects
        await loadProjects();

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
        console.error("Failed to load data:", err);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  // Effect to refresh users when modal closes and we need to refresh
  useEffect(() => {
    if (!showModal && shouldRefreshRef.current) {
      shouldRefreshRef.current = false;
      loadUsers();
    }
  }, [showModal]);

  // Add file upload handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, WebP)");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Upload profile picture function
  const uploadProfilePicture = async (userId: string): Promise<string | null> => {
    if (!selectedFile) {
      console.log("No file selected for upload");
      return null;
    }

    if (!userId) {
      toast.error("No user selected");
      return null;
    }

    setUploadingProfile(true);
    try {
      console.log("Uploading profile picture for user ID:", userId);
      console.log("Selected file details:", {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        lastModified: selectedFile.lastModified
      });

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("profile_picture", selectedFile);
      
      // Use the UsersApi method for consistency
      const response = await UsersApi.uploadProfilePicture(userId, selectedFile);
      
      console.log("Upload API response:", response);
      
      if (response.success && response.data && response.data.profile_picture) {
        toast.success("Profile picture uploaded successfully");
        console.log("Server returned profile picture URL:", response.data.profile_picture);
        return response.data.profile_picture;
      } else {
        console.error("Upload failed - response structure:", response);
        toast.error(response.error || "Failed to upload profile picture");
        return null;
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      // Try direct fetch as fallback
      try {
        console.log("Trying direct fetch as fallback...");
        
        const formDataFallback = new FormData();
        formDataFallback.append("profile_picture", selectedFile);
        
        const fetchResponse = await fetch(`http://localhost:4000/api/users/${userId}/profile-picture`, {
          method: "PATCH",
          body: formDataFallback,
        });
        
        console.log("Fetch response status:", fetchResponse.status);
        console.log("Fetch response headers:", Object.fromEntries(fetchResponse.headers.entries()));
        
        const result = await fetchResponse.json();
        console.log("Fetch response data:", result);
        
        if (fetchResponse.ok && result.success && result.data?.profile_picture) {
          toast.success("Profile picture uploaded (fallback method)");
          return result.data.profile_picture;
        } else {
          throw new Error(result.error || `Upload failed with status ${fetchResponse.status}`);
        }
      } catch (fallbackError: any) {
        console.error("Fallback upload failed:", fallbackError);
        toast.error("Profile picture upload failed: " + (fallbackError.message || "Unknown error"));
        return null;
      }
    } finally {
      setUploadingProfile(false);
    }
  };

  // Function to create employee record
 // In UsersMaster.tsx, update the createEmployeeRecord function:

// Function to create employee record
// In UsersMaster.tsx, update the createEmployeeRecord function:
// Replace the createEmployeeRecord function in UsersMaster.tsx with this fixed version:

const createEmployeeRecord = async (userData: any, userId: string, profilePictureUrl: string | null) => {
  try {
    // Extract first and last name from full_name
    const nameParts = (userData.full_name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Validate name parts
    if (!firstName) {
      throw new Error("First name is required");
    }
    
    // Get department_id from formData (already set when department is selected)
    const departmentId = formData.department_id;
    
    // Get role_id from selected role name
    const selectedRole = allRoles.find(role => role.name.toUpperCase() === userData.role.toUpperCase());
    const roleId = selectedRole?.id || '';
    
    console.log("Creating employee record with:", {
      firstName,
      lastName,
      email: userData.email,
      departmentId,
      department_name: userData.department,
      roleId,
      role_name: userData.role,
      designation: userData.designation,
      joining_date: userData.joining_date,
      allotted_project: userData.allotted_project,
    });
    
    // Validate required fields BEFORE sending
    if (!departmentId) {
      throw new Error("Department ID is required. Please select a department.");
    }
    
    if (!roleId) {
      throw new Error("Role ID is required. Please select a role.");
    }
    
    if (!userData.designation) {
      throw new Error("Designation is required for employees");
    }
    
    if (!userData.joining_date) {
      throw new Error("Date of joining is required for employees");
    }
    
    if (!userData.attendance_location) {
      throw new Error("Attendance location is required for employees");
    }
    
    // Prepare employee data
    const employeeData = {
      first_name: firstName,
      last_name: lastName || '',
      email: userData.email,
      phone: userData.phone || '',
      role_id: roleId,
      department_id: departmentId,
      designation: userData.designation,
      joining_date: userData.joining_date,
      gender: userData.gender || 'male',
      allotted_project: userData.allotted_project || null,
      office_location: userData.office_location || '',
      attendence_location: userData.attendance_location,
      employee_status: userData.is_active ? 'active' : 'inactive',
      profile_picture: profilePictureUrl || '',
      user_id: userId
    };
    
    console.log("Final employee data being sent:", JSON.stringify(employeeData, null, 2));
    
    // Call the create-from-user endpoint
    const response = await HrmsEmployeesApi.createFromUser(employeeData);
    console.log("Employee created successfully:", response);
    
    return response;
  } catch (error: any) {
    console.error("Failed to create employee record:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // Provide more helpful error message
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

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

    // Validate employee fields if is_employee is true
    if (formData.is_employee) {
      if (!formData.designation.trim()) {
        toast.error("Designation is required for employees");
        return;
      }
      if (!formData.joining_date) {
        toast.error("Date of joining is required for employees");
        return;
      }
      if (!formData.gender) {
        toast.error("Gender is required for employees");
        return;
      }
      if (!formData.attendance_location.trim()) {
        toast.error("Attendance location is required for employees");
        return;
      }
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

      if (editingId) {
        // UPDATE EXISTING USER
        console.log("Updating existing user ID:", editingId);
        
        // Update user data
        const response = await UsersApi.update(editingId, payload);
        console.log("Update response:", response);
        
        let result: UserProfile;
        
        // Extract user data from response
        if (response.success && response.data) {
          result = response.data;
        } else if (response.id) {
          result = response;
        } else {
          throw new Error("Invalid response format");
        }
        
        console.log("User data extracted:", result);
        
        // Upload profile picture if selected
        if (selectedFile) {
          console.log("Uploading profile picture for existing user...");
          const profilePicUrl = await uploadProfilePicture(editingId);
          if (profilePicUrl) {
            console.log("Profile picture uploaded:", profilePicUrl);
            // Update the user object with new profile picture
            result = { ...result, profile_picture: profilePicUrl };
            
            // Fetch the updated user from server
            try {
              const updatedResponse = await UsersApi.getById(editingId);
              if (updatedResponse.success && updatedResponse.data) {
                result = updatedResponse.data;
              }
            } catch (fetchError) {
              console.error("Error fetching updated user:", fetchError);
              result.profile_picture = profilePicUrl;
            }
          }
        }
        
        // Update state
        setUsers((prev) =>
          prev.map((u) => (u.id === editingId ? { ...u, ...result } : u))
        );
        toast.success("User updated successfully!");
      } else {
        // CREATE NEW USER
        // Check for duplicate email
        if (users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
          toast.error("A user with this email already exists");
          setSubmitting(false);
          return;
        }

        console.log("Creating new user with payload:", payload);
        
        // Create user first
        const response = await UsersApi.create(payload);
        console.log("Create response:", response);
        
        // Extract user data from response
        let newUser: UserProfile;
        let userId: string;
        
        if (response.success && response.data) {
          // Response format: { success: true, data: { ...userData }, message: '...' }
          newUser = response.data;
          userId = newUser.id || newUser._id;
          console.log("User extracted from response.data:", newUser);
          console.log("User ID:", userId);
        } else if (response.id || response._id) {
          // Response format: { id: '...', email: '...', ... }
          newUser = response;
          userId = response.id || response._id;
          console.log("User is the response itself:", newUser);
        } else {
          console.error("Invalid response format:", response);
          throw new Error("Invalid response format from server");
        }
        
        if (!userId) {
          console.error("No user ID found in response:", response);
          throw new Error("User ID not found in response");
        }
        
        let finalUser = newUser;
        let profilePicUrl: string | null = null;
        
        // Upload profile picture if selected
        if (selectedFile && userId) {
          console.log("Uploading profile picture for new user ID:", userId);
          console.log("Selected file:", selectedFile.name, selectedFile.type, selectedFile.size);
          
          profilePicUrl = await uploadProfilePicture(userId);
          
          if (profilePicUrl) {
            console.log("Profile picture uploaded successfully:", profilePicUrl);
            
            // Update user object with profile picture
            finalUser = {
              ...newUser,
              profile_picture: profilePicUrl
            };
            
            // Fetch updated user from server
            try {
              const updatedResponse = await UsersApi.getById(userId);
              console.log("Updated user response:", updatedResponse);
              
              if (updatedResponse.success && updatedResponse.data) {
                finalUser = updatedResponse.data;
              } else if (updatedResponse.id) {
                finalUser = updatedResponse;
              }
              console.log("Final user after fetch:", finalUser);
            } catch (fetchError) {
              console.error("Error fetching updated user:", fetchError);
              finalUser.profile_picture = profilePicUrl;
            }
          }
        }
        
        // Create employee record if is_employee is checked
        if (formData.is_employee && userId) {
          try {
            await createEmployeeRecord(formData, userId, profilePicUrl);
            toast.success("Employee record created successfully!");
          } catch (empError: any) {
            console.error("Failed to create employee record:", empError);
            // Don't fail the whole operation if employee creation fails
            toast.warning("User created but employee record creation failed: " + (empError.message || "Unknown error"));
          }
        }
        
        // Clean up blob URL
        if (previewUrl && previewUrl.startsWith('blob:')) {
          console.log("Revoking blob URL:", previewUrl);
          URL.revokeObjectURL(previewUrl);
        }
        
        // Add new user to state
        console.log("Adding user to state:", finalUser);
        
        // FIX: Make sure we have a valid ID for the user
        if (!finalUser.id) {
          finalUser = { ...finalUser, id: userId };
        }
        
        setUsers((prev) => [...prev, finalUser]);
        toast.success("User created successfully!");
        
        // Set flag to refresh users from server
        shouldRefreshRef.current = true;
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error("Submit error:", err);
      
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error data:", err.response?.data);
      }
      
      toast.error(err?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Update resetForm function
  const resetForm = () => {
    // Cleanup blob URL to prevent memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setFormData({
      email: "",
      full_name: "",
      phone: "",
      role: "USER",
      department: "",
      department_id: "",
      password: "",
      is_active: true,
      profile_picture: "",
      permissions: {},
      is_employee: false,
      designation: "",
      joining_date: "",
      gender: "male",
      allotted_project: "",
      office_location: "",
      attendance_location: "",
    });
    setEditingId(null);
    setShowPassword(false);
    setSelectedFile(null);
    setPreviewUrl("");
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
      profile_picture: user.profile_picture || "",
      permissions: user.permissions || {},
      // Reset employee fields when editing (user might not be employee)
      is_employee: false,
      designation: "",
      joining_date: "",
      gender: "male",
      allotted_project: "",
      office_location: "",
      attendance_location: "",
    });
    
    // Clean up old preview URL if it exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Set preview URL - use actual server URL, not blob
    if (user.profile_picture && !user.profile_picture.startsWith('blob:')) {
      // Convert to full URL if needed
      const fullUrl = getProfilePictureUrl(user.profile_picture);
      setPreviewUrl(fullUrl);
    } else {
      setPreviewUrl("");
    }
    
    setSelectedFile(null);
    setShowModal(true);
  };

  // Helper function to get correct profile picture URL
  const getProfilePictureUrl = (profilePicture: string | undefined) => {
    if (!profilePicture) {
      return "";
    }
    
    // If it's a blob URL, we should NOT display it in the table
    // This means the profile picture hasn't been properly saved to server
    if (profilePicture.startsWith('blob:')) {
      console.warn("Found blob URL in user data:", profilePicture);
      return ""; // Return empty to show default icon
    }
    
    // If it's already a full URL, return as is
    if (profilePicture.includes('http')) {
      return profilePicture;
    }
    
    // If it starts with /uploads/, prepend the backend URL
    if (profilePicture.startsWith('/uploads/')) {
      return `http://localhost:4000${profilePicture}`;
    }
    
    // Otherwise, assume it's a filename and construct the full URL
    return `http://localhost:4000/uploads/${profilePicture}`;
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

  // FIXED: getRoleColor function with null check
  const getRoleColor = (role: string) => {
    // Add null/undefined check
    if (!role) {
      return "bg-gray-100 text-gray-700";
    }
    
    const colors: Record<string, string> = {
      ADMIN: "bg-red-100 text-red-700",
      MANAGER: "bg-blue-100 text-blue-700",
      PURCHASER: "bg-green-100 text-green-700",
      STORE_KEEPER: "bg-purple-100 text-purple-700",
      USER: "bg-gray-100 text-gray-700",
    };
    
    const upperRole = role.toUpperCase();
    return colors[upperRole] || "bg-gray-100 text-gray-700";
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

      {/* Main Table - Responsive with Search Bars like ItemsMaster */}
      <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
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
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            {user.profile_picture ? (
                              <img
                                src={getProfilePictureUrl(user.profile_picture)}
                                alt={user.full_name}
                                className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-white shadow"
                                onError={(e) => {
                                  // If image fails to load, hide it and show default icon
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    const defaultIcon = parent.querySelector('.default-icon');
                                    if (defaultIcon) {
                                      (defaultIcon as HTMLElement).style.display = 'flex';
                                    }
                                  }
                                }}
                              />
                            ) : (
                              <div className="default-icon w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                              </div>
                            )}
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 border-white ${
                              user.is_active ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-800 text-xs md:text-sm block">
                              {user.full_name || "N/A"}
                            </span>
                            <span className="text-xs text-gray-500 hidden md:block">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">{user.email}</td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getRoleColor(
                            user.role || "USER"  // Added fallback here
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
                    {editingId ? "" : "Add User"}
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

                  <div className="col-span-1 md:col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Profile Picture
                    </label>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                      <div className="relative">
                        {previewUrl || formData.profile_picture ? (
                          <div className="relative group">
                            <img
                              src={previewUrl || formData.profile_picture}
                              alt="Profile preview"
                              className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-lg"
                              onError={(e) => {
                                // If image fails to load, show default icon
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const defaultDiv = parent.querySelector('.default-profile-icon');
                                  if (defaultDiv) {
                                    (defaultDiv as HTMLElement).style.display = 'flex';
                                  }
                                }
                              }}
                            />
                            <div className="default-profile-icon absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center rounded-full" style={{ display: 'none' }}>
                              <UserIcon className="w-12 h-12 text-gray-500" />
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Camera className="w-6 h-6 text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-4 border-white shadow-lg flex items-center justify-center">
                            <UserIcon className="w-12 h-12 text-gray-500" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <input
                          type="file"
                          id="profile_picture"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <label
                            htmlFor="profile_picture"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium text-sm cursor-pointer flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Choose Image
                          </label>
                        </div>
                        
                        <div className="text-xs text-gray-500">
                          <p>• Max file size: 5MB</p>
                          <p>• Supported formats: JPEG, PNG, WebP</p>
                          <p>• Image will be uploaded automatically when you save the user</p>
                        </div>
                        
                        {selectedFile && (
                          <div className="text-xs text-green-600 font-medium">
                            Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                          </div>
                        )}
                      </div>
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

                  {/* Is Employee Checkbox - Only show for new users */}
                  {!editingId && (
                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          id="is_employee"
                          checked={formData.is_employee}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              is_employee: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="is_employee"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          This user is an employee (will also create employee record)
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Employee Fields - Conditionally Rendered */}
                  {formData.is_employee && (
                    <>
                      <div className="col-span-1 md:col-span-2 mt-2 mb-2">
                        <h4 className="text-sm font-semibold text-gray-700 border-l-4 border-blue-500 pl-2 py-1">
                          Employee Information
                        </h4>
                      </div>

                      {/* Designation */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Designation <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={formData.designation}
                            onChange={(e) =>
                              setFormData({ ...formData, designation: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                            placeholder="e.g., Software Engineer"
                            required={formData.is_employee}
                          />
                        </div>
                      </div>

                      {/* Date of Joining */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Date of Joining <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <Calendar className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="date"
                            value={formData.joining_date}
                            onChange={(e) =>
                              setFormData({ ...formData, joining_date: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                            required={formData.is_employee}
                          />
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <UserIcon className="w-3.5 h-3.5" />
                          </div>
                          <select
                            value={formData.gender}
                            onChange={(e) =>
                              setFormData({ ...formData, gender: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                            required={formData.is_employee}
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Allotted Project */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Allotted Project
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <Briefcase className="w-3.5 h-3.5" />
                          </div>
                          <select
                            value={formData.allotted_project}
                            onChange={(e) =>
                              setFormData({ ...formData, allotted_project: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                            disabled={loadingProjects}
                          >
                            <option value="">Select Project</option>
                            {loadingProjects ? (
                              <option value="" disabled>
                                Loading projects...
                              </option>
                            ) : projects.length > 0 ? (
                              projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                  {project.name}
                                  {project.code ? ` (${project.code})` : ''}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>
                                No projects available
                              </option>
                            )}
                          </select>
                          {loadingProjects && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Office Location */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Office Location
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={formData.office_location}
                            onChange={(e) =>
                              setFormData({ ...formData, office_location: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                            placeholder="e.g., Head Office"
                          />
                        </div>
                      </div>

                      {/* Attendance Location */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-800 mb-1">
                          Attendance Location <span className="text-red-500">*</span>
                        </label>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <input
                            type="text"
                            value={formData.attendance_location}
                            onChange={(e) =>
                              setFormData({ ...formData, attendance_location: e.target.value })
                            }
                            className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                            placeholder="e.g., Building A, Floor 3"
                            required={formData.is_employee}
                          />
                        </div>
                      </div>
                    </>
                  )}

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






