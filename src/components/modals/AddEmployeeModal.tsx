


// // components/modals/AddEmployeeModal.tsx
// import { useState, useEffect, useRef } from "react";
// import { Plus, X, Upload, User, Mail, Phone, Briefcase, Building, MapPin, Calendar, Users, ChevronDown, ChevronUp, Globe, Heart, CreditCard, Laptop, Shield, Clock, Book, Home, FileText, GraduationCap, Check } from "lucide-react";
// import { toast } from "sonner";
// import projectApi from "../../lib/projectApi";
// import rolesApi from "../../lib/rolesApi";
// import { departmentsApi } from "../../lib/departmentApi";
// import employeeAPI from "../../lib/employeeApi";

// interface AddEmployeeModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export default function AddEmployeeModal({
//   isOpen,
//   onClose,
//   onSuccess,
// }: AddEmployeeModalProps) {
//   const [loading, setLoading] = useState(false);
//   const [roles, setRoles] = useState<any[]>([]);
//   const [departments, setDepartments] = useState<any[]>([]);
//   const [projects, setProjects] = useState<any[]>([]);
//   const [profilePicture, setProfilePicture] = useState<File | null>(null);
//   const [previewUrl, setPreviewUrl] = useState<string | null>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);
  
//   // State for showing additional sections
//   const [showPersonalDetails, setShowPersonalDetails] = useState(false);
//   const [showAddressDetails, setShowAddressDetails] = useState(false);
//   const [showEducationalDetails, setShowEducationalDetails] = useState(false);
//   const [showEmploymentDetails, setShowEmploymentDetails] = useState(false);
//   const [showSystemDetails, setShowSystemDetails] = useState(false);
//   const [showBankDetails, setShowBankDetails] = useState(false);

//   const [formData, setFormData] = useState({
//     // Basic Details
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     role_id: "",
//     department_id: "",
//     designation: "",
//     joining_date: new Date().toISOString().split("T")[0],
//     gender: "male",
//     allotted_project: [] as number[],
//     office_location: "",
//     attendence_location: "",
    
//     // Personal Details
//     blood_group: "",
//     date_of_birth: "",
//     marital_status: "",
//     emergency_contact: "",
//     nationality: "Indian",
    
//     // Address Details
//     current_address: "",
//     permanent_address: "",
//     city: "",
//     state: "",
//     pincode: "",
//     same_as_permanent: false, // New checkbox
    
//     // Identification Details
//     aadhar_number: "",
//     pan_number: "",
    
//     // Educational Details
//     highest_qualification: "",
//     university: "",
//     passing_year: "",
//     percentage: "",
    
//     // Employment Details
//     employee_type: "permanent",
//     branch: "",
//     probation_period: "",
//     work_mode: "office", // New field
//     date_of_leaving: "",
//     job_title: "",
//     notice_period: "30",
    
//     // System Details
//     laptop_assigned: "no",
//     system_login_id: "",
//     system_password: "", // New field
//     office_email_id: "",
//     office_email_password: "", // New field
    
//     // Bank Details
//     bank_account_number: "",
//     bank_name: "",
//     ifsc_code: "",
//     upi_id: "",
//   });

//   const loadProjects = async () => {
//     try {
//       const data: any = await projectApi.getProjects();
//       console.log("Projects loaded:", data);
//       setProjects(data.data || []);
//     } catch (err) {
//       console.log(err);
//       toast.error("Failed to load projects");
//     }
//   };

//   const loadRoles = async () => {
//     try {
//       const data: any = await rolesApi.getAllRoles();
//       console.log("Roles loaded:", data);
//       setRoles(data.data || []);
//     } catch (err) {
//       console.log(err);
//       toast.error("Failed to load roles");
//     }
//   };
  
//   const loadDepartments = async () => {
//     try {
//       const data: any = await departmentsApi.getAll();
//       console.log("Departments loaded:", data);
//       setDepartments(data.data || []);
//     } catch (err) {
//       console.log(err);
//       toast.error("Failed to load departments");
//     }
//   };

//   useEffect(() => {
//     if (isOpen) {
//       console.log("Loading data for modal...");
//       loadProjects();
//       loadRoles();
//       loadDepartments();
//     }
//   }, [isOpen]);

//   // Calculate age from date of birth
//   const calculateAge = (dob: string) => {
//     if (!dob) return "";
//     const birthDate = new Date(dob);
//     const today = new Date();
//     let age = today.getFullYear() - birthDate.getFullYear();
//     const monthDiff = today.getMonth() - birthDate.getMonth();
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
//       age--;
//     }
//     return age;
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       if (file.size > 5 * 1024 * 1024) {
//         toast.error("File size must be less than 5MB");
//         return;
//       }

//       const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
//       if (!validTypes.includes(file.type)) {
//         toast.error("Only JPG, PNG, and WebP files are allowed");
//         return;
//       }

//       setProfilePicture(file);
//       const url = URL.createObjectURL(file);
//       setPreviewUrl(url);
//     }
//   };

//   const handleRemoveProfilePicture = () => {
//     if (previewUrl) {
//       URL.revokeObjectURL(previewUrl);
//     }
//     setProfilePicture(null);
//     setPreviewUrl(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formDataObj = new FormData();
      
//       // Append all form data
//       Object.entries(formData).forEach(([key, value]) => {
//         if (value || value === false || value === 0) {
//           if (Array.isArray(value)) {
//             formDataObj.append(key, JSON.stringify(value));
//           } else {
//             formDataObj.append(key, value.toString());
//           }
//         }
//       });

//       // Append profile picture if exists
//       if (profilePicture) {
//         formDataObj.append('profile_picture', profilePicture);
//       }

//       console.log("Submitting form data:", Object.fromEntries(formDataObj));
//       await employeeAPI.createEmployee(formDataObj);

//       toast.success("Employee added successfully!");
      
//       // Reset form
//       setFormData({
//         first_name: "",
//         last_name: "",
//         email: "",
//         phone: "",
//         role_id: "",
//         department_id: "",
//         designation: "",
//         joining_date: new Date().toISOString().split("T")[0],
//         gender: "male",
//         allotted_project: [] as number[],
//         office_location: "",
//         attendence_location: "",
//         blood_group: "",
//         date_of_birth: "",
//         marital_status: "",
//         emergency_contact: "",
//         nationality: "Indian",
//         current_address: "",
//         permanent_address: "",
//         city: "",
//         state: "",
//         pincode: "",
//         same_as_permanent: false,
//         aadhar_number: "",
//         pan_number: "",
//         highest_qualification: "",
//         university: "",
//         passing_year: "",
//         percentage: "",
//         employee_type: "permanent",
//         branch: "",
//         probation_period: "",
//         work_mode: "office",
//         date_of_leaving: "",
//         job_title: "",
//         notice_period: "30",
//         laptop_assigned: "no",
//         system_login_id: "",
//         system_password: "",
//         office_email_id: "",
//         office_email_password: "",
//         bank_account_number: "",
//         bank_name: "",
//         ifsc_code: "",
//         upi_id: "",
//       });

//       // Reset all sections
//       setShowPersonalDetails(false);
//       setShowAddressDetails(false);
//       setShowEducationalDetails(false);
//       setShowEmploymentDetails(false);
//       setShowSystemDetails(false);
//       setShowBankDetails(false);

//       if (previewUrl) {
//         URL.revokeObjectURL(previewUrl);
//       }
//       setProfilePicture(null);
//       setPreviewUrl(null);
      
//       onSuccess();
//       onClose();
//     } catch (error: any) {
//       console.error("Error adding employee:", error);
//       toast.error(error.message || "Failed to add employee");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/\D/g, '');
//     if (value.length > 10) {
//       toast.warning("Mobile number must be 10 digits");
//       return;
//     }
//     setFormData({ ...formData, phone: value });
//   };

//   const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/\D/g, '');
//     if (value.length > 10) {
//       toast.warning("Emergency contact must be 10 digits");
//       return;
//     }
//     setFormData({ ...formData, emergency_contact: value });
//   };

//   const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/\D/g, '').slice(0, 12);
//     setFormData({ ...formData, aadhar_number: value });
//   };

//   const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.toUpperCase().slice(0, 10);
//     setFormData({ ...formData, pan_number: value });
//   };

//   const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/\D/g, '').slice(0, 6);
//     setFormData({ ...formData, pincode: value });
//   };

//   const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value.replace(/[^0-9.]/g, '');
//     const numValue = parseFloat(value);
//     if (numValue > 100) {
//       toast.warning("Percentage cannot exceed 100");
//       return;
//     }
//     setFormData({ ...formData, percentage: value });
//   };

//   // Handle "Same as permanent address" checkbox
//   const handleSameAsPermanentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const checked = e.target.checked;
//     setFormData(prev => ({
//       ...prev,
//       same_as_permanent: checked,
//       current_address: checked ? prev.permanent_address : prev.current_address,
//       city: checked ? prev.city : prev.city,
//       state: checked ? prev.state : prev.state,
//       pincode: checked ? prev.pincode : prev.pincode
//     }));
//   };

//   // Update current address when permanent address changes if checkbox is checked
//   useEffect(() => {
//     if (formData.same_as_permanent) {
//       setFormData(prev => ({
//         ...prev,
//         current_address: prev.permanent_address
//       }));
//     }
//   }, [formData.permanent_address, formData.same_as_permanent]);

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-auto border border-gray-200 flex flex-col">
//         {/* Modal Header */}
//         <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-3 flex justify-between items-center flex-shrink-0">
//           <div className="flex items-center gap-3">
//             <div className="p-1.5 bg-white/20 rounded-lg">
//               <User className="w-5 h-5 text-white" />
//             </div>
//             <div>
//               <h2 className="text-lg font-bold text-white">Add New Employee</h2>
//               <p className="text-sm text-white/90">Fill in employee details</p>
//             </div>
//           </div>
//           <button
//             onClick={() => {
//               if (previewUrl) URL.revokeObjectURL(previewUrl);
//               onClose();
//             }}
//             className="text-white hover:bg-white/20 rounded-lg p-1.5 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="flex flex-col flex-1">
//           <div className="flex-1 overflow-y-auto p-4">
//             <div className="space-y-4">
              
//               {/* Profile Picture - Compact */}
//               <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
//                 <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow">
//                   {previewUrl ? (
//                     <img 
//                       src={previewUrl} 
//                       alt="Profile Preview" 
//                       className="w-full h-full object-cover"
//                     />
//                   ) : (
//                     <User className="w-10 h-10 text-gray-500" />
//                   )}
//                 </div>
//                 <div className="flex-1">
//                   <p className="text-sm font-semibold text-gray-700">Profile Picture</p>
//                   <p className="text-xs text-gray-500 mb-2">JPG, PNG, WebP (Max 5MB)</p>
//                   <div className="flex gap-3">
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       accept="image/jpeg,image/png,image/webp"
//                       className="hidden"
//                       id="profile-upload"
//                     />
//                     <label
//                       htmlFor="profile-upload"
//                       className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] transition text-sm font-medium flex items-center gap-2 cursor-pointer"
//                     >
//                       <Upload className="w-4 h-4" />
//                       {previewUrl ? "Change Photo" : "Upload Photo"}
//                     </label>
//                     {previewUrl && (
//                       <button
//                         type="button"
//                         onClick={handleRemoveProfilePicture}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
//                       >
//                         Remove
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Basic Details Grid - 3-4 columns */}
//               <div className="p-4 bg-white border rounded-lg">
//                 <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                   <User className="w-4 h-4 text-[#C62828]" />
//                   Basic Information
//                 </h3>
                
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  
//                   {/* First Name */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       First Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.first_name}
//                       onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="First name"
//                       required
//                     />
//                   </div>

//                   {/* Last Name */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Last Name <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.last_name}
//                       onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="Last name"
//                       required
//                     />
//                   </div>

//                   {/* Email */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Email <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="email@company.com"
//                       required
//                     />
//                   </div>

//                   {/* Mobile */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Mobile <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="tel"
//                       value={formData.phone}
//                       onChange={handleMobileChange}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="10-digit number"
//                       maxLength={10}
//                       required
//                     />
//                   </div>

//                   {/* Gender */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Gender <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={formData.gender}
//                       onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       required
//                     >
//                       <option value="male">Male</option>
//                       <option value="female">Female</option>
//                       <option value="other">Other</option>
//                     </select>
//                   </div>

//                   {/* Blood Group */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Blood Group
//                     </label>
//                     <select
//                       value={formData.blood_group}
//                       onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                     >
//                       <option value="">Select</option>
//                       <option value="A+">A+</option>
//                       <option value="A-">A-</option>
//                       <option value="B+">B+</option>
//                       <option value="B-">B-</option>
//                       <option value="O+">O+</option>
//                       <option value="O-">O-</option>
//                       <option value="AB+">AB+</option>
//                       <option value="AB-">AB-</option>
//                     </select>
//                   </div>

//                   {/* Role */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Role <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={formData.role_id}
//                       onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       required
//                     >
//                       <option value="">Select role</option>
//                       {roles.length > 0 ? (
//                         roles.map((role) => (
//                           <option key={role.id} value={role.id}>{role.name}</option>
//                         ))
//                       ) : (
//                         <option value="" disabled>Loading roles...</option>
//                       )}
//                     </select>
//                   </div>

//                   {/* Department */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Department <span className="text-red-500">*</span>
//                     </label>
//                     <select
//                       value={formData.department_id}
//                       onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       required
//                     >
//                       <option value="">Select department</option>
//                       {departments.length > 0 ? (
//                         departments.map((dept) => (
//                           <option key={dept.id} value={dept.id}>{dept.name}</option>
//                         ))
//                       ) : (
//                         <option value="" disabled>Loading departments...</option>
//                       )}
//                     </select>
//                   </div>

//                   {/* Designation */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Designation <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.designation}
//                       onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="e.g. Software Engineer"
//                       required
//                     />
//                   </div>

//                   {/* Date of Joining */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Joining Date <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="date"
//                       value={formData.joining_date}
//                       onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       required
//                     />
//                   </div>

//                   {/* Attendance Location */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Location <span className="text-red-500">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.attendence_location}
//                       onChange={(e) => setFormData({ ...formData, attendence_location: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="Attendance location"
//                       required
//                     />
//                   </div>

//                   {/* Office Location */}
//                   <div className="space-y-1">
//                     <label className="block text-xs font-semibold text-gray-700">
//                       Office Location
//                     </label>
//                     <input
//                       type="text"
//                       value={formData.office_location}
//                       onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
//                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       placeholder="Office address"
//                     />
//                   </div>

//                   {/* Allotted Project */}
// {/* Allotted Project */}
// <div className="space-y-1">
//   <label className="block text-xs font-semibold text-gray-700">
//     Allotted Project
//   </label>
//   <select
//     value={formData.allotted_project}
//     onChange={(e) => setFormData({ ...formData, allotted_project: e.target.value })}
//     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//   >
//     <option value="">Select project</option>
//     {projects.length > 0 ? (
//       projects.map((project) => (
//         <option key={project.id} value={project.id}>{project.name}</option>
//       ))
//     ) : (
//       <option value="" disabled>Loading projects...</option>
//     )}
//   </select>
// </div>
//                 </div>
//               </div>

//               {/* Additional Details Buttons - Horizontal */}
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
//                 {/* Personal Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowPersonalDetails(!showPersonalDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showPersonalDetails 
//                       ? 'bg-red-50 border-[#C62828] text-[#C62828]' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <Heart className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">Personal</span>
//                 </button>

//                 {/* Address Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowAddressDetails(!showAddressDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showAddressDetails 
//                       ? 'bg-blue-50 border-blue-500 text-blue-600' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <Home className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">Address</span>
//                 </button>

//                 {/* Educational Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowEducationalDetails(!showEducationalDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showEducationalDetails 
//                       ? 'bg-green-50 border-green-500 text-green-600' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <GraduationCap className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">Education</span>
//                 </button>

//                 {/* Employment Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowEmploymentDetails(!showEmploymentDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showEmploymentDetails 
//                       ? 'bg-purple-50 border-purple-500 text-purple-600' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <Briefcase className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">Employment</span>
//                 </button>

//                 {/* System Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowSystemDetails(!showSystemDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showSystemDetails 
//                       ? 'bg-yellow-50 border-yellow-500 text-yellow-600' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <Laptop className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">System</span>
//                 </button>

//                 {/* Bank Details */}
//                 <button
//                   type="button"
//                   onClick={() => setShowBankDetails(!showBankDetails)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
//                     showBankDetails 
//                       ? 'bg-indigo-50 border-indigo-500 text-indigo-600' 
//                       : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
//                   }`}
//                 >
//                   <CreditCard className="w-5 h-5 mb-2" />
//                   <span className="text-xs font-semibold">Bank</span>
//                 </button>
//               </div>

//               {/* Personal Details Section */}
//               {showPersonalDetails && (
//                 <div className="p-4 border-2 border-red-200 rounded-lg bg-red-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <Heart className="w-4 h-4 text-red-500" />
//                       Personal Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowPersonalDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {/* Date of Birth */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Date of Birth
//                       </label>
//                       <input
//                         type="date"
//                         value={formData.date_of_birth}
//                         onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                       />
//                       {formData.date_of_birth && (
//                         <p className="text-xs text-gray-500 mt-1">
//                           Age: {calculateAge(formData.date_of_birth)} years
//                         </p>
//                       )}
//                     </div>

//                     {/* Marital Status */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Marital Status
//                       </label>
//                       <select
//                         value={formData.marital_status}
//                         onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="">Select</option>
//                         <option value="single">Single</option>
//                         <option value="married">Married</option>
//                         <option value="divorced">Divorced</option>
//                         <option value="widowed">Widowed</option>
//                       </select>
//                     </div>

//                     {/* Emergency Contact */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Emergency Contact
//                       </label>
//                       <input
//                         type="tel"
//                         value={formData.emergency_contact}
//                         onChange={handleEmergencyContactChange}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="10-digit number"
//                         maxLength={10}
//                       />
//                     </div>

//                     {/* Nationality */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Nationality
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.nationality}
//                         onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="e.g. Indian"
//                       />
//                     </div>

//                     {/* Aadhar Number */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Aadhar Number
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.aadhar_number}
//                         onChange={handleAadharChange}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="12-digit Aadhar"
//                         maxLength={12}
//                       />
//                     </div>

//                     {/* PAN Number */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         PAN Number
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.pan_number}
//                         onChange={handlePANChange}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="ABCDE1234F"
//                         maxLength={10}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Address Details Section */}
//               {showAddressDetails && (
//                 <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <Home className="w-4 h-4 text-blue-500" />
//                       Address Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowAddressDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
//                     {/* Current Address */}
//                     <div className="space-y-1 sm:col-span-2 lg:col-span-3">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Current Address
//                       </label>
//                       <textarea
//                         value={formData.current_address}
//                         onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Full current address"
//                         rows={3}
//                       />
//                     </div>
//                   </div>
                  
//                   {/* Checkbox for same as permanent address */}
//                   <div className="mb-4">
//                     <label className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={formData.same_as_permanent}
//                         onChange={handleSameAsPermanentChange}
//                         className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                       />
//                       <span className="text-sm font-medium text-gray-700">
//                         Current address same as permanent address
//                       </span>
//                     </label>
//                   </div>

//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {/* Permanent Address */}
//                     <div className="space-y-1 sm:col-span-2">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Permanent Address
//                       </label>
//                       <textarea
//                         value={formData.permanent_address}
//                         onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Full permanent address"
//                         rows={3}
//                         disabled={formData.same_as_permanent}
//                       />
//                     </div>

//                     {/* City */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         City
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.city}
//                         onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="City"
//                         disabled={formData.same_as_permanent}
//                       />
//                     </div>

//                     {/* State */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         State
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.state}
//                         onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="State"
//                         disabled={formData.same_as_permanent}
//                       />
//                     </div>

//                     {/* Pincode */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Pincode
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.pincode}
//                         onChange={handlePincodeChange}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="6-digit pincode"
//                         maxLength={6}
//                         disabled={formData.same_as_permanent}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Educational Details Section */}
//               {showEducationalDetails && (
//                 <div className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <GraduationCap className="w-4 h-4 text-green-500" />
//                       Educational Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowEducationalDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {/* Highest Qualification */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Highest Qualification
//                       </label>
//                       <select
//                         value={formData.highest_qualification}
//                         onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="">Select</option>
//                         <option value="10th">10th</option>
//                         <option value="12th">12th</option>
//                         <option value="Diploma">Diploma</option>
//                         <option value="Bachelor's">Bachelor's Degree</option>
//                         <option value="Master's">Master's Degree</option>
//                         <option value="PhD">PhD</option>
//                         <option value="Other">Other</option>
//                       </select>
//                     </div>

//                     {/* University */}
//                     <div className="space-y-1 sm:col-span-2">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         University/College
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.university}
//                         onChange={(e) => setFormData({ ...formData, university: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="University/College name"
//                       />
//                     </div>

//                     {/* Passing Year */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Passing Year
//                       </label>
//                       <input
//                         type="number"
//                         value={formData.passing_year}
//                         onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="YYYY"
//                         min="1900"
//                         max={new Date().getFullYear()}
//                       />
//                     </div>

//                     {/* Percentage */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Percentage/CGPA
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.percentage}
//                         onChange={handlePercentageChange}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="e.g. 85.5"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Employment Details Section */}
//               {showEmploymentDetails && (
//                 <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <Briefcase className="w-4 h-4 text-purple-500" />
//                       Employment Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowEmploymentDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {/* Employee Type */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Employee Type
//                       </label>
//                       <select
//                         value={formData.employee_type}
//                         onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="permanent">Permanent</option>
//                         <option value="contract">Contract</option>
//                         <option value="intern">Intern</option>
//                         <option value="trainee">Trainee</option>
//                       </select>
//                     </div>

//                     {/* Branch */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Branch
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.branch}
//                         onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Branch name"
//                       />
//                     </div>

//                     {/* Work Mode */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Work Mode
//                       </label>
//                       <select
//                         value={formData.work_mode}
//                         onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="office">Office</option>
//                         <option value="remote">Remote</option>
//                         <option value="hybrid">Hybrid</option>
//                       </select>
//                     </div>

//                     {/* Probation Period */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Probation Period
//                       </label>
//                       <select
//                         value={formData.probation_period}
//                         onChange={(e) => setFormData({ ...formData, probation_period: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="">Select</option>
//                         <option value="3">3 months</option>
//                         <option value="6">6 months</option>
//                         <option value="12">12 months</option>
//                       </select>
//                     </div>

//                     {/* Job Title */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Job Title
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.job_title}
//                         onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="e.g. Senior Developer"
//                       />
//                     </div>

//                     {/* Notice Period */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Notice Period (days)
//                       </label>
//                       <select
//                         value={formData.notice_period}
//                         onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="15">15 days</option>
//                         <option value="30">30 days</option>
//                         <option value="60">60 days</option>
//                         <option value="90">90 days</option>
//                       </select>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* System Details Section */}
//               {showSystemDetails && (
//                 <div className="p-4 border-2 border-yellow-200 rounded-lg bg-yellow-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <Laptop className="w-4 h-4 text-yellow-500" />
//                       System Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowSystemDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                     {/* Laptop Assigned */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Laptop Assigned
//                       </label>
//                       <select
//                         value={formData.laptop_assigned}
//                         onChange={(e) => setFormData({ ...formData, laptop_assigned: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
//                       >
//                         <option value="yes">Yes</option>
//                         <option value="no">No</option>
//                       </select>
//                     </div>

//                     {/* System Login ID */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         System Login ID
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.system_login_id}
//                         onChange={(e) => setFormData({ ...formData, system_login_id: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Login ID"
//                       />
//                     </div>

//                     {/* System Password */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         System Password
//                       </label>
//                       <input
//                         type="password"
//                         value={formData.system_password}
//                         onChange={(e) => setFormData({ ...formData, system_password: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Password"
//                       />
//                     </div>

//                     {/* Office Email ID */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Office Email ID
//                       </label>
//                       <input
//                         type="email"
//                         value={formData.office_email_id}
//                         onChange={(e) => setFormData({ ...formData, office_email_id: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="office@company.com"
//                       />
//                     </div>

//                     {/* Office Email Password */}
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         Office Email Password
//                       </label>
//                       <input
//                         type="password"
//                         value={formData.office_email_password}
//                         onChange={(e) => setFormData({ ...formData, office_email_password: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="Email password"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Bank Details Section */}
//               {showBankDetails && (
//                 <div className="p-4 border-2 border-indigo-200 rounded-lg bg-indigo-50">
//                   <div className="flex items-center justify-between mb-4">
//                     <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
//                       <CreditCard className="w-4 h-4 text-indigo-500" />
//                       Bank Details
//                     </h4>
//                     <button
//                       type="button"
//                       onClick={() => setShowBankDetails(false)}
//                       className="text-gray-400 hover:text-gray-600"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>
                  
//                   {/* Account Details */}
//                   <div className="mb-6">
//                     <h5 className="text-xs font-semibold text-gray-700 mb-3">Account Details</h5>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                       {/* Bank Name */}
//                       <div className="space-y-1">
//                         <label className="block text-xs font-semibold text-gray-700">
//                           Bank Name
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.bank_name}
//                           onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
//                           className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                           placeholder="Bank name"
//                         />
//                       </div>

//                       {/* Account Number */}
//                       <div className="space-y-1">
//                         <label className="block text-xs font-semibold text-gray-700">
//                           Account Number
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.bank_account_number}
//                           onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
//                           className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                           placeholder="Account number"
//                         />
//                       </div>

//                       {/* IFSC Code */}
//                       <div className="space-y-1">
//                         <label className="block text-xs font-semibold text-gray-700">
//                           IFSC Code
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.ifsc_code}
//                           onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
//                           className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                           placeholder="IFSC code"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* UPI Details */}
//                   <div>
//                     <h5 className="text-xs font-semibold text-gray-700 mb-3">UPI Details (Optional)</h5>
//                     <div className="space-y-1">
//                       <label className="block text-xs font-semibold text-gray-700">
//                         UPI ID
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.upi_id}
//                         onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
//                         className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
//                         placeholder="upi@bank"
//                       />
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Modal Footer */}
//           <div className="border-t p-4 bg-gray-50 flex gap-3 flex-shrink-0">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
//             >
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                   Adding...
//                 </>
//               ) : (
//                 <>
//                   <Plus className="w-5 h-5" />
//                   Add Employee
//                 </>
//               )}
//             </button>
//             <button
//               type="button"
//               onClick={() => {
//                 if (previewUrl) URL.revokeObjectURL(previewUrl);
//                 onClose();
//               }}
//               className="px-6 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { Plus, X, Upload, User, Mail, Phone, Briefcase, Building, MapPin, Calendar, Users, ChevronDown, ChevronUp, Globe, Heart, CreditCard, Laptop, Shield, Clock, Book, Home, FileText, GraduationCap, Check } from "lucide-react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import rolesApi from "../../lib/rolesApi";
import { departmentsApi } from "../../lib/departmentApi";
import employeeAPI from "../../lib/employeeApi";
import companyApi, { Company, OfficeLocation } from "../../lib/companyApi";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddEmployeeModal({
  isOpen,
  onClose,
  onSuccess,
}: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [officeLocations, setOfficeLocations] = useState<OfficeLocation[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);
  
  // State for showing additional sections
  const [showPersonalDetails, setShowPersonalDetails] = useState(false);
  const [showAddressDetails, setShowAddressDetails] = useState(false);
  const [showEducationalDetails, setShowEducationalDetails] = useState(false);
  const [showEmploymentDetails, setShowEmploymentDetails] = useState(false);
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Details
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "",
    department_id: "",
    designation: "",
    joining_date: new Date().toISOString().split("T")[0],
    gender: "male",
    allotted_project: [] as number[],
    company_id: "",
    office_location_id: "",
    attendence_location: "",
    
    // Personal Details
    blood_group: "",
    date_of_birth: "",
    marital_status: "",
    emergency_contact: "",
    nationality: "Indian",
    
    // Address Details
    current_address: "",
    permanent_address: "",
    city: "",
    state: "",
    pincode: "",
    same_as_permanent: false,
    
    // Identification Details
    aadhar_number: "",
    pan_number: "",
    
    // Educational Details
    highest_qualification: "",
    university: "",
    passing_year: "",
    percentage: "",
    
    // Employment Details
    employee_type: "permanent",
    branch: "",
    probation_period: "",
    work_mode: "office",
    date_of_leaving: "",
    job_title: "",
    notice_period: "30",
    
    // System Details
    laptop_assigned: "no",
    system_login_id: "",
    system_password: "",
    office_email_id: "",
    office_email_password: "",
    
    // Bank Details
    bank_account_number: "",
    bank_name: "",
    ifsc_code: "",
    upi_id: "",
  });

  const loadProjects = async () => {
    try {
      const data: any = await projectApi.getProjects();
      console.log("Projects loaded:", data);
      setProjects(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load projects");
    }
  };

  const loadRoles = async () => {
    try {
      const data: any = await rolesApi.getAllRoles();
      console.log("Roles loaded:", data);
      setRoles(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load roles");
    }
  };
  
  const loadDepartments = async () => {
    try {
      const data: any = await departmentsApi.getAll();
      console.log("Departments loaded:", data);
      setDepartments(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load departments");
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyApi.getCompanies();
      console.log("Companies loaded:", data);
      // Filter only active companies
      const activeCompanies = data.filter((company: Company) => company.is_active);
      setCompanies(activeCompanies);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load companies");
    }
  };

  const loadOfficeLocations = async (companyId: string) => {
    try {
      const data = await companyApi.getCompanyLocations(companyId);
      console.log("Office locations loaded:", data);
      // Filter only active locations
      const activeLocations = data.filter((location: OfficeLocation) => location.is_active);
      setOfficeLocations(activeLocations);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load office locations");
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log("Loading data for modal...");
      loadProjects();
      loadRoles();
      loadDepartments();
      loadCompanies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.company_id) {
      loadOfficeLocations(formData.company_id);
      // Reset office location when company changes
      setFormData(prev => ({ ...prev, office_location_id: "" }));
    } else {
      setOfficeLocations([]);
    }
  }, [formData.company_id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP files are allowed");
        return;
      }

      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveProfilePicture = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleProjectToggle = (projectId: number) => {
    setFormData(prev => {
      const currentProjects = [...prev.allotted_project];
      const index = currentProjects.indexOf(projectId);
      
      if (index > -1) {
        // Remove project
        currentProjects.splice(index, 1);
      } else {
        // Add project
        currentProjects.push(projectId);
      }
      
      return { ...prev, allotted_project: currentProjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value || value === false || value === 0) {
          if (Array.isArray(value)) {
            formDataObj.append(key, JSON.stringify(value));
          } else {
            formDataObj.append(key, value.toString());
          }
        }
      });

      // Append profile picture if exists
      if (profilePicture) {
        formDataObj.append('profile_picture', profilePicture);
      }

      console.log("Submitting form data:", Object.fromEntries(formDataObj));
      await employeeAPI.createEmployee(formDataObj);

      toast.success("Employee added successfully!");
      
      // Reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role_id: "",
        department_id: "",
        designation: "",
        joining_date: new Date().toISOString().split("T")[0],
        gender: "male",
        allotted_project: [] as number[],
        company_id: "",
        office_location_id: "",
        attendence_location: "",
        blood_group: "",
        date_of_birth: "",
        marital_status: "",
        emergency_contact: "",
        nationality: "Indian",
        current_address: "",
        permanent_address: "",
        city: "",
        state: "",
        pincode: "",
        same_as_permanent: false,
        aadhar_number: "",
        pan_number: "",
        highest_qualification: "",
        university: "",
        passing_year: "",
        percentage: "",
        employee_type: "permanent",
        branch: "",
        probation_period: "",
        work_mode: "office",
        date_of_leaving: "",
        job_title: "",
        notice_period: "30",
        laptop_assigned: "no",
        system_login_id: "",
        system_password: "",
        office_email_id: "",
        office_email_password: "",
        bank_account_number: "",
        bank_name: "",
        ifsc_code: "",
        upi_id: "",
      });

      // Reset all sections
      setShowPersonalDetails(false);
      setShowAddressDetails(false);
      setShowEducationalDetails(false);
      setShowEmploymentDetails(false);
      setShowSystemDetails(false);
      setShowBankDetails(false);
      setIsProjectDropdownOpen(false);

      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setProfilePicture(null);
      setPreviewUrl(null);
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error adding employee:", error);
      toast.error(error.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      toast.warning("Mobile number must be 10 digits");
      return;
    }
    setFormData({ ...formData, phone: value });
  };

  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      toast.warning("Emergency contact must be 10 digits");
      return;
    }
    setFormData({ ...formData, emergency_contact: value });
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
    setFormData({ ...formData, aadhar_number: value });
  };

  const handlePANChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 10);
    setFormData({ ...formData, pan_number: value });
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setFormData({ ...formData, pincode: value });
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(value);
    if (numValue > 100) {
      toast.warning("Percentage cannot exceed 100");
      return;
    }
    setFormData({ ...formData, percentage: value });
  };

  // Handle "Same as permanent address" checkbox
  const handleSameAsPermanentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      same_as_permanent: checked,
      current_address: checked ? prev.permanent_address : prev.current_address,
      city: checked ? prev.city : prev.city,
      state: checked ? prev.state : prev.state,
      pincode: checked ? prev.pincode : prev.pincode
    }));
  };

  // Update current address when permanent address changes if checkbox is checked
  useEffect(() => {
    if (formData.same_as_permanent) {
      setFormData(prev => ({
        ...prev,
        current_address: prev.permanent_address
      }));
    }
  }, [formData.permanent_address, formData.same_as_permanent]);

  // Get selected projects for preview
  const getSelectedProjects = () => {
    return projects.filter(project => formData.allotted_project.includes(project.id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2">
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          onClose();
        }}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto border border-gray-200 flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 py-2 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Add New Employee</h2>
              <p className="text-xs text-white/90">Fill in employee details</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewUrl) URL.revokeObjectURL(previewUrl);
              onClose();
            }}
            className="text-white hover:bg-white/20 rounded p-1 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-3">
              
              {/* Profile Picture - Compact */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700">Profile Picture</p>
                  <p className="text-xs text-gray-500 mb-1">JPG, PNG, WebP (Max 5MB)</p>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      id="profile-upload"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="px-3 py-1.5 bg-[#C62828] text-white rounded hover:bg-[#A62222] transition text-xs font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      {previewUrl ? "Change Photo" : "Upload Photo"}
                    </label>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition text-xs font-medium"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Details Grid */}
              <div className="p-3 bg-white border rounded">
                <h3 className="text-xs font-semibold text-gray-800 mb-3 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#C62828]" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  
                  {/* First Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="First name"
                      required
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Last name"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="email@company.com"
                      required
                    />
                  </div>

                  {/* Mobile */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mobile <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handleMobileChange}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="10-digit number"
                      maxLength={10}
                      required
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                    >
                      <option value="">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Role */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                    >
                      <option value="">Select role</option>
                      {roles.length > 0 ? (
                        roles.map((role) => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>Loading roles...</option>
                      )}
                    </select>
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                    >
                      <option value="">Select department</option>
                      {departments.length > 0 ? (
                        departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>Loading departments...</option>
                      )}
                    </select>
                  </div>

                  {/* Company */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Company <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.company_id}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                    >
                      <option value="">Select company</option>
                      {companies.length > 0 ? (
                        companies.map((company) => (
                          <option key={company.id} value={company.id}>{company.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>Loading companies...</option>
                      )}
                    </select>
                  </div>

                  {/* Office Location */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Office Location <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.office_location_id}
                      onChange={(e) => setFormData({ ...formData, office_location_id: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      required
                      disabled={!formData.company_id}
                    >
                      <option value="">Select office location</option>
                      {officeLocations.length > 0 ? (
                        officeLocations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name} - {location.city}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          {formData.company_id ? "Loading locations..." : "Select company first"}
                        </option>
                      )}
                    </select>
                  </div>

                  {/* Designation */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="e.g. Software Engineer"
                      required
                    />
                  </div>

                  {/* Date of Joining */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Joining Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      required
                    />
                  </div>

                  {/* Attendance Location */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Attendance Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.attendence_location}
                      onChange={(e) => setFormData({ ...formData, attendence_location: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Attendance location"
                      required
                    />
                  </div>

                  {/* Allotted Project - Dropdown with Checkboxes and Side Preview */}
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Allotted Project
                    </label>
                    <div className="flex gap-2">
                      {/* Dropdown Section */}
                      <div className="relative flex-shrink-0" style={{ width: '200px' }} ref={projectDropdownRef}>
                        <button
                          type="button"
                          onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white text-left flex items-center justify-between"
                        >
                          <span className="text-gray-700 truncate">
                            {formData.allotted_project.length > 0 
                              ? `${formData.allotted_project.length} selected`
                              : 'Select projects'}
                          </span>
                          <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {isProjectDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto">
                            {projects.length > 0 ? (
                              projects.map((project) => (
                                <label
                                  key={project.id}
                                  className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.allotted_project.includes(project.id)}
                                    onChange={() => handleProjectToggle(project.id)}
                                    className="w-3 h-3 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                  />
                                  <span className="text-xs text-gray-700 truncate">{project.name}</span>
                                </label>
                              ))
                            ) : (
                              <div className="px-2 py-1.5 text-xs text-gray-500">Loading projects...</div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selected Projects Preview - Beside the Field */}
                      {formData.allotted_project.length > 0 && (
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap gap-1">
                            {getSelectedProjects().map((project) => (
                              <div
                                key={project.id}
                                className="flex items-center gap-1 bg-[#C62828] text-white px-1.5 py-0.5 rounded text-xs font-medium"
                              >
                                <span className="truncate max-w-[100px]">{project.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleProjectToggle(project.id)}
                                  className="hover:bg-red-700 rounded-full p-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Additional Details Buttons - Horizontal */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {/* Personal Details */}
                <button
                  type="button"
                  onClick={() => setShowPersonalDetails(!showPersonalDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showPersonalDetails 
                      ? 'bg-red-50 border-[#C62828] text-[#C62828]' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Heart className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Personal</span>
                </button>

                {/* Address Details */}
                <button
                  type="button"
                  onClick={() => setShowAddressDetails(!showAddressDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showAddressDetails 
                      ? 'bg-blue-50 border-blue-500 text-blue-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Home className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Address</span>
                </button>

                {/* Educational Details */}
                <button
                  type="button"
                  onClick={() => setShowEducationalDetails(!showEducationalDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showEducationalDetails 
                      ? 'bg-green-50 border-green-500 text-green-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Education</span>
                </button>

                {/* Employment Details */}
                <button
                  type="button"
                  onClick={() => setShowEmploymentDetails(!showEmploymentDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showEmploymentDetails 
                      ? 'bg-purple-50 border-purple-500 text-purple-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Briefcase className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Employment</span>
                </button>

                {/* System Details */}
                <button
                  type="button"
                  onClick={() => setShowSystemDetails(!showSystemDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showSystemDetails 
                      ? 'bg-yellow-50 border-yellow-500 text-yellow-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">System</span>
                </button>

                {/* Bank Details */}
                <button
                  type="button"
                  onClick={() => setShowBankDetails(!showBankDetails)}
                  className={`flex flex-col items-center justify-center p-2 rounded border transition-all ${
                    showBankDetails 
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4 mb-1" />
                  <span className="text-xs font-semibold">Bank</span>
                </button>
              </div>

              {/* Personal Details Section */}
              {showPersonalDetails && (
                <div className="p-3 border-2 border-red-200 rounded bg-red-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-red-500" />
                      Personal Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowPersonalDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      />
                      {formData.date_of_birth && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          Age: {calculateAge(formData.date_of_birth)} years
                        </p>
                      )}
                    </div>

                    {/* Marital Status */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Marital Status
                      </label>
                      <select
                        value={formData.marital_status}
                        onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                        <option value="divorced">Divorced</option>
                        <option value="widowed">Widowed</option>
                      </select>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact}
                        onChange={handleEmergencyContactChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="10-digit number"
                        maxLength={10}
                      />
                    </div>

                    {/* Nationality */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={formData.nationality}
                        onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="e.g. Indian"
                      />
                    </div>

                    {/* Aadhar Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Aadhar Number
                      </label>
                      <input
                        type="text"
                        value={formData.aadhar_number}
                        onChange={handleAadharChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="12-digit Aadhar"
                        maxLength={12}
                      />
                    </div>

                    {/* PAN Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        PAN Number
                      </label>
                      <input
                        type="text"
                        value={formData.pan_number}
                        onChange={handlePANChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Address Details Section */}
              {showAddressDetails && (
                <div className="p-3 border-2 border-blue-200 rounded bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <Home className="w-3 h-3 text-blue-500" />
                      Address Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddressDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="mb-3">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={formData.same_as_permanent}
                        onChange={handleSameAsPermanentChange}
                        className="w-3 h-3 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        Current address same as permanent address
                      </span>
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Current Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Current Address
                      </label>
                      <textarea
                        value={formData.current_address}
                        onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Full current address"
                        rows={2}
                      />
                    </div>

                    {/* Permanent Address */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Permanent Address
                      </label>
                      <textarea
                        value={formData.permanent_address}
                        onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Full permanent address"
                        rows={2}
                        disabled={formData.same_as_permanent}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                    {/* City */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="City"
                        disabled={formData.same_as_permanent}
                      />
                    </div>

                    {/* State */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        State
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="State"
                        disabled={formData.same_as_permanent}
                      />
                    </div>

                    {/* Pincode */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={handlePincodeChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="6-digit pincode"
                        maxLength={6}
                        disabled={formData.same_as_permanent}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Educational Details Section */}
              {showEducationalDetails && (
                <div className="p-3 border-2 border-green-200 rounded bg-green-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-green-500" />
                      Educational Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowEducationalDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Highest Qualification */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Highest Qualification
                      </label>
                      <select
                        value={formData.highest_qualification}
                        onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="10th">10th</option>
                        <option value="12th">12th</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Bachelor's">Bachelor's Degree</option>
                        <option value="Master's">Master's Degree</option>
                        <option value="PhD">PhD</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* University */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        University/College
                      </label>
                      <input
                        type="text"
                        value={formData.university}
                        onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="University/College name"
                      />
                    </div>

                    {/* Passing Year */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Passing Year
                      </label>
                      <input
                        type="number"
                        value={formData.passing_year}
                        onChange={(e) => setFormData({ ...formData, passing_year: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="YYYY"
                        min="1900"
                        max={new Date().getFullYear()}
                      />
                    </div>

                    {/* Percentage */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Percentage/CGPA
                      </label>
                      <input
                        type="text"
                        value={formData.percentage}
                        onChange={handlePercentageChange}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="e.g. 85.5"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Employment Details Section */}
              {showEmploymentDetails && (
                <div className="p-3 border-2 border-purple-200 rounded bg-purple-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-purple-500" />
                      Employment Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowEmploymentDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Employee Type */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Employee Type
                      </label>
                      <select
                        value={formData.employee_type}
                        onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="permanent">Permanent</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                        <option value="trainee">Trainee</option>
                      </select>
                    </div>

                    {/* Branch */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Branch
                      </label>
                      <input
                        type="text"
                        value={formData.branch}
                        onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Branch name"
                      />
                    </div>

                    {/* Work Mode */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Work Mode
                      </label>
                      <select
                        value={formData.work_mode}
                        onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="office">Office</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    {/* Probation Period */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Probation Period
                      </label>
                      <select
                        value={formData.probation_period}
                        onChange={(e) => setFormData({ ...formData, probation_period: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="">Select</option>
                        <option value="3">3 months</option>
                        <option value="6">6 months</option>
                        <option value="12">12 months</option>
                      </select>
                    </div>

                    {/* Job Title */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="e.g. Senior Developer"
                      />
                    </div>

                    {/* Notice Period */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Notice Period (days)
                      </label>
                      <select
                        value={formData.notice_period}
                        onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="15">15 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* System Details Section */}
              {showSystemDetails && (
                <div className="p-3 border-2 border-yellow-200 rounded bg-yellow-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-yellow-500" />
                      System Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowSystemDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* Laptop Assigned */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Laptop Assigned
                      </label>
                      <select
                        value={formData.laptop_assigned}
                        onChange={(e) => setFormData({ ...formData, laptop_assigned: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                      >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>

                    {/* System Login ID */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        System Login ID
                      </label>
                      <input
                        type="text"
                        value={formData.system_login_id}
                        onChange={(e) => setFormData({ ...formData, system_login_id: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Login ID"
                      />
                    </div>

                    {/* System Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        System Password
                      </label>
                      <input
                        type="password"
                        value={formData.system_password}
                        onChange={(e) => setFormData({ ...formData, system_password: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Password"
                      />
                    </div>

                    {/* Office Email ID */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Office Email ID
                      </label>
                      <input
                        type="email"
                        value={formData.office_email_id}
                        onChange={(e) => setFormData({ ...formData, office_email_id: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="office@company.com"
                      />
                    </div>

                    {/* Office Email Password */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Office Email Password
                      </label>
                      <input
                        type="password"
                        value={formData.office_email_password}
                        onChange={(e) => setFormData({ ...formData, office_email_password: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Email password"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Bank Details Section */}
              {showBankDetails && (
                <div className="p-3 border-2 border-indigo-200 rounded bg-indigo-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-800 flex items-center gap-1">
                      <CreditCard className="w-3 h-3 text-indigo-500" />
                      Bank Details
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowBankDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Bank Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Bank name"
                      />
                    </div>

                    {/* Account Number */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.bank_account_number}
                        onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="Account number"
                      />
                    </div>

                    {/* IFSC Code */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        value={formData.ifsc_code}
                        onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="IFSC code"
                      />
                    </div>

                    {/* UPI ID */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        UPI ID
                      </label>
                      <input
                        type="text"
                        value={formData.upi_id}
                        onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="upi@bank"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t p-3 bg-gray-50 flex gap-2 flex-shrink-0">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-3 rounded hover:from-red-600 hover:to-red-700 transition text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 shadow"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Employee
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                onClose();
              }}
              className="px-4 py-2 text-xs border border-gray-300 rounded hover:bg-gray-50 transition font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}