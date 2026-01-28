// // // pages/EmployeeProfile.tsx - FIXED VERSION (No useNavigate)
// // import { useState, useEffect } from "react";
// // import {
// //   ArrowLeft, User, Mail, Phone, Briefcase, Building, MapPin,
// //   Calendar, Heart, Home, GraduationCap, CreditCard,
// //   Laptop, Edit, Download, FileText, Globe,
// //   Smartphone, Award, School, Clock, CheckCircle,
// //   XCircle, ChevronRight, ExternalLink, MoreVertical,
// //   Printer, Share2, IdCard, Building2, Wallet, Lock, AtSign
// // } from "lucide-react";
// // import { toast } from "sonner";
// // import employeeAPI from "../lib/employeeApi";
// // import EditEmployeeModal from "../components/modals/EditEmployeeModal";
// // import AddMoreDetailsModal from "../components/modals/AddMoreDetailsModal";

// // interface EmployeeProfileProps {
// //   employeeId: string;
// //   onBack?: () => void;
// // }

// // export default function EmployeeProfile({ employeeId, onBack }: EmployeeProfileProps) {
// //   const [employee, setEmployee] = useState<any>(null);
// //   const [loading, setLoading] = useState(true);
// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [showEditModal, setShowEditModal] = useState(false);
// //   const [showAddDetailsModal, setShowAddDetailsModal] = useState(false);

// //   const loadEmployee = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await employeeAPI.getEmployee(Number(employeeId));
// //       setEmployee(data);
// //     } catch (error) {
// //       console.error("Error loading employee:", error);
// //       toast.error("Failed to load employee data");
// //       // Call onBack if provided
// //       if (onBack) {
// //         onBack();
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (employeeId) {
// //       loadEmployee();
// //     }
// //   }, [employeeId]);

// //   const calculateAge = (dob: string) => {
// //     if (!dob) return "";
// //     const birthDate = new Date(dob);
// //     const today = new Date();
// //     let age = today.getFullYear() - birthDate.getFullYear();
// //     const monthDiff = today.getMonth() - birthDate.getMonth();
// //     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
// //       age--;
// //     }
// //     return age;
// //   };

// //   const getTenure = (joiningDate: string) => {
// //     if (!joiningDate) return "0 years";
// //     const joinDate = new Date(joiningDate);
// //     const today = new Date();
// //     let years = today.getFullYear() - joinDate.getFullYear();
// //     let months = today.getMonth() - joinDate.getMonth();

// //     if (months < 0) {
// //       years--;
// //       months += 12;
// //     }

// //     return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
// //   };

// //   const StatusBadge = ({ status }: { status: string }) => {
// //     const config: Record<string, { bg: string; text: string; icon: any }> = {
// //       active: { bg: "bg-gradient-to-r from-emerald-500 to-emerald-600", text: "text-white", icon: CheckCircle },
// //       inactive: { bg: "bg-gradient-to-r from-gray-400 to-gray-500", text: "text-white", icon: XCircle },
// //       on_leave: { bg: "bg-gradient-to-r from-amber-500 to-amber-600", text: "text-white", icon: Clock },
// //       terminated: { bg: "bg-gradient-to-r from-red-500 to-red-600", text: "text-white", icon: XCircle }
// //     };
// //     const { bg, text, icon: Icon } = config[status] || config.inactive;

// //     return (
// //       <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${bg} ${text} shadow-sm`}>
// //         <Icon className="w-3 h-3" />
// //         {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
// //       </span>
// //     );
// //   };

// //   const DetailCard = ({ icon: Icon, title, value, color = "blue" }: any) => {
// //     const colors: Record<string, string> = {
// //       blue: "from-blue-500 to-blue-600",
// //       red: "from-red-500 to-red-600",
// //       green: "from-green-500 to-green-600",
// //       purple: "from-purple-500 to-purple-600",
// //       orange: "from-orange-500 to-orange-600",
// //       indigo: "from-indigo-500 to-indigo-600",
// //       pink: "from-pink-500 to-pink-600",
// //       yellow: "from-amber-500 to-amber-600"
// //     };

// //     return (
// //       <div className="group bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-transparent">
// //         <div className="flex items-start gap-3">
// //           <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color]} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
// //             <Icon className="w-5 h-5 text-white" />
// //           </div>
// //           <div className="flex-1 min-w-0">
// //             <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{title}</p>
// //             <p className="text-sm font-semibold text-gray-900 truncate">{value || "N/A"}</p>
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const Section = ({ title, icon: Icon, children, className = "" }: any) => (
// //     <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 ${className}`}>
// //       <div className="flex items-center gap-2 mb-6">
// //         <div className="p-2 bg-gray-50 rounded-lg">
// //           <Icon className="w-5 h-5 text-gray-700" />
// //         </div>
// //         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //       </div>
// //       {children}
// //     </div>
// //   );

// //   const InfoRow = ({ label, value, icon: Icon }: any) => {
// //     if (!value || value === "N/A" || value === "") return null;
// //     return (
// //       <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0 group">
// //         {Icon && (
// //           <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
// //             <Icon className="w-4 h-4 text-gray-500" />
// //           </div>
// //         )}
// //         <div className="flex-1 min-w-0">
// //           <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
// //           <p className="text-sm text-gray-900 font-medium">{value}</p>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const tabs = [
// //     { id: "overview", label: "Overview", icon: User, color: "from-blue-500 to-blue-600" },
// //     { id: "personal", label: "Personal", icon: Heart, color: "from-red-500 to-red-600" },
// //     { id: "employment", label: "Employment", icon: Briefcase, color: "from-purple-500 to-purple-600" },
// //     { id: "education", label: "Education", icon: GraduationCap, color: "from-green-500 to-green-600" },
// //     { id: "bank", label: "Bank", icon: CreditCard, color: "from-indigo-500 to-indigo-600" },
// //     { id: "system", label: "System", icon: Laptop, color: "from-amber-500 to-amber-600" }
// //   ];

// //   if (loading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="relative">
// //             <div className="w-16 h-16 border-4 border-blue-100 rounded-full"></div>
// //             <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
// //           </div>
// //           <p className="mt-4 text-gray-600 font-medium">Loading profile...</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   if (!employee) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4">
// //         <div className="text-center max-w-md">
// //           <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
// //             <User className="w-10 h-10 text-gray-400" />
// //           </div>
// //           <h2 className="text-2xl font-bold text-gray-800 mb-3">Employee Not Found</h2>
// //           <p className="text-gray-500 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
// //           <button
// //             onClick={onBack}
// //             className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
// //           >
// //             <ArrowLeft className="w-4 h-4" />
// //             Back to Employees
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
// //       {/* Fixed Header */}
// //       <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
// //           <div className="flex items-center justify-between">
// //             <div className="flex items-center gap-4">
// //               <button
// //                 onClick={onBack}
// //                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
// //               >
// //                 <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
// //                   <ArrowLeft className="w-4 h-4" />
// //                 </div>
// //                 <span className="font-medium">Employees</span>
// //               </button>
// //               <div className="h-4 w-px bg-gray-200"></div>
// //               <span className="text-sm font-medium text-gray-500">Profile</span>
// //             </div>

// //             <div className="flex items-center gap-2">
// //               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
// //                 <Printer className="w-4 h-4" />
// //               </button>
// //               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
// //                 <Share2 className="w-4 h-4" />
// //               </button>
// //               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
// //                 <MoreVertical className="w-4 h-4" />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
// //         {/* Profile Header */}
// //         <div className="mb-8">
// //           <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
// //             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

// //             <div className="relative z-10">
// //               <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
// //                 {/* Profile Picture Section */}
// //                 <div className="relative">
// //                   <div className="relative">
// //                     <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-2xl border-4 border-white/20 overflow-hidden">
// //                       {employee.profile_picture ? (
// //                         <img
// //                           src={
// //                             employee.profile_picture.startsWith('http')
// //                               ? employee.profile_picture
// //                               : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${employee.profile_picture}`
// //                           }
// //                           alt={`${employee.first_name} ${employee.last_name}`}
// //                           className="w-full h-full object-cover"
// //                           onError={(e) => {
// //                             // If image fails to load, show initials
// //                             e.currentTarget.style.display = 'none';
// //                             const parent = e.currentTarget.parentElement;
// //                             if (parent) {
// //                               parent.innerHTML = `
// //                                 <span class="text-3xl font-bold">
// //                                   ${employee.first_name?.charAt(0)}${employee.last_name?.charAt(0)}
// //                                 </span>
// //                               `;
// //                             }
// //                           }}
// //                         />
// //                       ) : (
// //                         <span className="text-3xl font-bold">
// //                           {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
// //                         </span>
// //                       )}
// //                     </div>
// //                     <div className="absolute -bottom-2 -right-2">
// //                       <StatusBadge status={employee.employee_status || 'active'} />
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Profile Info */}
// //                 <div className="flex-1 text-white">
// //                   <div className="flex flex-wrap items-center gap-3 mb-2">
// //                     <h1 className="text-3xl font-bold">
// //                       {employee.first_name} {employee.last_name}
// //                     </h1>
// //                   </div>

// //                   <p className="text-xl text-gray-300 mb-6">{employee.designation || 'N/A'}</p>

// //                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
// //                     <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
// //                       <p className="text-xs text-gray-300 mb-1">Employee ID</p>
// //                       <p className="font-semibold text-lg">{employee.employee_code || 'N/A'}</p>
// //                     </div>

// //                     <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
// //                       <p className="text-xs text-gray-300 mb-1">Department</p>
// //                       <p className="font-semibold text-lg">{employee.department_name || 'N/A'}</p>
// //                     </div>

// //                     <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
// //                       <p className="text-xs text-gray-300 mb-1">Tenure</p>
// //                       <p className="font-semibold text-lg">{getTenure(employee.joining_date)}</p>
// //                     </div>

// //                     <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
// //                       <p className="text-xs text-gray-300 mb-1">Role</p>
// //                       <p className="font-semibold text-lg">{employee.role_name || 'N/A'}</p>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Action Buttons */}
// //                 <div className="flex flex-col gap-3">
// //                   <button
// //                     onClick={() => setShowEditModal(true)}
// //                     className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
// //                   >
// //                     <Edit className="w-4 h-4" />
// //                     Edit Profile
// //                   </button>
// //                   <button
// //                     onClick={() => setShowAddDetailsModal(true)}
// //                     className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] font-medium"
// //                   >
// //                     <FileText className="w-4 h-4" />
// //                     Add Details
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Tab Navigation */}
// //         <div className="mb-8">
// //           <div className="flex gap-1 overflow-x-auto pb-2">
// //             {tabs.map((tab) => {
// //               const Icon = tab.icon;
// //               const isActive = activeTab === tab.id;
// //               return (
// //                 <button
// //                   key={tab.id}
// //                   onClick={() => setActiveTab(tab.id)}
// //                   className={`group flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${isActive
// //                       ? 'bg-white text-gray-900 shadow-lg border border-gray-100'
// //                       : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
// //                     }`}
// //                 >
// //                   <div className={`p-2 rounded-lg ${isActive ? `bg-gradient-to-br ${tab.color}` : 'bg-gray-100 group-hover:bg-gray-200'}`}>
// //                     <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
// //                   </div>
// //                   {tab.label}
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* Tab Content */}
// //         <div className="mb-12">
// //           {activeTab === "overview" && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
// //               <Section title="Contact Information" icon={Mail}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Email" value={employee.email} icon={Mail} />
// //                   <InfoRow label="Phone" value={employee.phone} icon={Phone} />
// //                   <InfoRow label="Emergency Contact" value={employee.emergency_contact} icon={Smartphone} />
// //                   <InfoRow label="Office Location" value={employee.office_location} icon={Building} />
// //                   <InfoRow label="Attendance Location" value={employee.attendence_location} icon={MapPin} />
// //                 </div>
// //               </Section>

// //               <Section title="Personal Details" icon={User}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
// //                   <InfoRow label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : null} icon={Calendar} />
// //                   {employee.date_of_birth && <InfoRow label="Age" value={`${calculateAge(employee.date_of_birth)} years`} />}
// //                   <InfoRow label="Blood Group" value={employee.blood_group} icon={Heart} />
// //                   <InfoRow label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
// //                   <InfoRow label="Nationality" value={employee.nationality} icon={Globe} />
// //                 </div>
// //               </Section>

// //               <Section title="Employment" icon={Briefcase}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Employee Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} />
// //                   <InfoRow label="Work Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} />
// //                   <InfoRow label="Branch" value={employee.branch} icon={Building} />
// //                   <InfoRow label="Job Title" value={employee.job_title} />
// //                   <InfoRow label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
// //                   <InfoRow label="Notice Period" value={employee.notice_period ? `${employee.notice_period} days` : null} icon={Clock} />
// //                 </div>
// //               </Section>

// //               {(employee.current_address || employee.permanent_address) && (
// //                 <Section title="Address" icon={Home} className="lg:col-span-2 xl:col-span-3">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     {employee.current_address && (
// //                       <div className="bg-gray-50 rounded-xl p-5">
// //                         <div className="flex items-center gap-2 mb-3">
// //                           <div className="p-2 bg-blue-100 rounded-lg">
// //                             <MapPin className="w-4 h-4 text-blue-600" />
// //                           </div>
// //                           <p className="text-sm font-semibold text-gray-900">Current Address</p>
// //                         </div>
// //                         <p className="text-gray-600 leading-relaxed">{employee.current_address}</p>
// //                       </div>
// //                     )}
// //                     {employee.permanent_address && (
// //                       <div className="bg-gray-50 rounded-xl p-5">
// //                         <div className="flex items-center gap-2 mb-3">
// //                           <div className="p-2 bg-green-100 rounded-lg">
// //                             <Home className="w-4 h-4 text-green-600" />
// //                           </div>
// //                           <p className="text-sm font-semibold text-gray-900">Permanent Address</p>
// //                         </div>
// //                         <p className="text-gray-600 leading-relaxed">{employee.permanent_address}</p>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </Section>
// //               )}
// //             </div>
// //           )}

// //           {activeTab === "personal" && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <Section title="Basic Information" icon={User}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Full Name" value={`${employee.first_name} ${employee.last_name}`} />
// //                   <InfoRow label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
// //                   <InfoRow label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
// //                   {employee.date_of_birth && <InfoRow label="Age" value={`${calculateAge(employee.date_of_birth)} years`} />}
// //                   <InfoRow label="Blood Group" value={employee.blood_group} icon={Heart} />
// //                   <InfoRow label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
// //                   <InfoRow label="Nationality" value={employee.nationality} icon={Globe} />
// //                 </div>
// //               </Section>

// //               <Section title="Contact Details" icon={Phone}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Email Address" value={employee.email} icon={Mail} />
// //                   <InfoRow label="Phone Number" value={employee.phone} icon={Phone} />
// //                   <InfoRow label="Emergency Contact" value={employee.emergency_contact} icon={Smartphone} />
// //                 </div>
// //               </Section>

// //               {(employee.aadhar_number || employee.pan_number) && (
// //                 <Section title="Identification" icon={IdCard} className="lg:col-span-2">
// //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                     {employee.aadhar_number && (
// //                       <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5">
// //                         <div className="flex items-center gap-3 mb-4">
// //                           <div className="p-3 bg-white rounded-lg shadow-sm">
// //                             <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded"></div>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm font-semibold text-gray-900">Aadhar Number</p>
// //                             <p className="text-lg font-bold text-gray-900 mt-1">{employee.aadhar_number}</p>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}
// //                     {employee.pan_number && (
// //                       <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5">
// //                         <div className="flex items-center gap-3 mb-4">
// //                           <div className="p-3 bg-white rounded-lg shadow-sm">
// //                             <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded"></div>
// //                           </div>
// //                           <div>
// //                             <p className="text-sm font-semibold text-gray-900">PAN Number</p>
// //                             <p className="text-lg font-bold text-gray-900 mt-1">{employee.pan_number}</p>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     )}
// //                   </div>
// //                 </Section>
// //               )}
// //             </div>
// //           )}

// //           {activeTab === "employment" && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <Section title="Employment Details" icon={Briefcase}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Employee Code" value={employee.employee_code} />
// //                   <InfoRow label="Designation" value={employee.designation} />
// //                   <InfoRow label="Job Title" value={employee.job_title} />
// //                   <InfoRow label="Department" value={employee.department_name} icon={Building} />
// //                   <InfoRow label="Role" value={employee.role_name} />
// //                   <InfoRow label="Employee Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} />
// //                   <InfoRow label="Work Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} />
// //                 </div>
// //               </Section>

// //               <Section title="Important Dates" icon={Calendar}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
// //                   <InfoRow label="Date of Leaving" value={employee.date_of_leaving ? new Date(employee.date_of_leaving).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
// //                   <InfoRow label="Probation Period" value={employee.probation_period ? `${employee.probation_period} months` : null} />
// //                   <InfoRow label="Notice Period" value={employee.notice_period ? `${employee.notice_period} days` : null} icon={Clock} />
// //                 </div>
// //               </Section>

// //               <Section title="Office Details" icon={Building2} className="lg:col-span-2">
// //                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //                   <DetailCard icon={Building2} title="Branch" value={employee.branch} color="blue" />
// //                   <DetailCard icon={MapPin} title="Office Location" value={employee.office_location} color="green" />
// //                   <DetailCard icon={MapPin} title="Attendance Location" value={employee.attendence_location} color="purple" />
// //                 </div>
// //               </Section>
// //             </div>
// //           )}

// //           {activeTab === "education" && (
// //             <div className="grid grid-cols-1 gap-6">
// //               <Section title="Educational Background" icon={GraduationCap}>
// //                 {employee.highest_qualification || employee.university ? (
// //                   <div className="flex flex-col md:flex-row gap-8 items-center">
// //                     <div className="md:w-1/3">
// //                       <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-center">
// //                         <GraduationCap className="w-12 h-12 text-white mx-auto mb-4" />
// //                         <p className="text-xl font-bold text-white mb-2">{employee.highest_qualification || 'Education'}</p>
// //                         <p className="text-green-100">{employee.passing_year || 'Year'}</p>
// //                       </div>
// //                     </div>
// //                     <div className="md:w-2/3">
// //                       <div className="space-y-4">
// //                         <InfoRow label="Highest Qualification" value={employee.highest_qualification} icon={Award} />
// //                         <InfoRow label="University/College" value={employee.university} icon={School} />
// //                         <InfoRow label="Passing Year" value={employee.passing_year} icon={Calendar} />
// //                         <InfoRow label="Percentage/CGPA" value={employee.percentage ? `${employee.percentage}%` : null} />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 ) : (
// //                   <div className="text-center py-12">
// //                     <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
// //                       <School className="w-8 h-8 text-gray-400" />
// //                     </div>
// //                     <p className="text-gray-500">No educational information available</p>
// //                     <button
// //                       onClick={() => setShowAddDetailsModal(true)}
// //                       className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
// //                     >
// //                       Add educational details
// //                     </button>
// //                   </div>
// //                 )}
// //               </Section>
// //             </div>
// //           )}

// //           {activeTab === "bank" && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <Section title="Bank Account Details" icon={CreditCard}>
// //                 <div className="space-y-1">
// //                   <InfoRow label="Bank Name" value={employee.bank_name} />
// //                   <InfoRow label="Account Number" value={employee.bank_account_number} />
// //                   <InfoRow label="IFSC Code" value={employee.ifsc_code} />
// //                   <InfoRow label="UPI ID" value={employee.upi_id} />
// //                 </div>
// //               </Section>

// //               {employee.bank_name && (
// //                 <Section title="Bank Summary" icon={Wallet}>
// //                   <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
// //                     <div className="flex items-center gap-4 mb-4">
// //                       <div className="p-3 bg-white rounded-xl shadow-sm">
// //                         <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg"></div>
// //                       </div>
// //                       <div>
// //                         <p className="text-lg font-bold text-gray-900">{employee.bank_name}</p>
// //                         <p className="text-sm text-gray-600">Account Holder</p>
// //                       </div>
// //                     </div>
// //                     {employee.bank_account_number && (
// //                       <p className="text-sm font-mono text-gray-700 bg-white/50 p-3 rounded-lg">
// //                         Account: •••• {employee.bank_account_number.slice(-4)}
// //                       </p>
// //                     )}
// //                   </div>
// //                 </Section>
// //               )}
// //             </div>
// //           )}

// //           {activeTab === "system" && (
// //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //               <Section title="System Access" icon={Laptop}>
// //                 <div className="space-y-4">
// //                   <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
// //                     <div className="flex items-center gap-3">
// //                       <div className="p-2 bg-amber-100 rounded-lg">
// //                         <Laptop className="w-4 h-4 text-amber-600" />
// //                       </div>
// //                       <span className="font-medium text-gray-900">Laptop Assigned</span>
// //                     </div>
// //                     <span className={`px-3 py-1 rounded-full text-sm font-medium ${employee.laptop_assigned === 'yes'
// //                         ? 'bg-emerald-100 text-emerald-700'
// //                         : 'bg-gray-100 text-gray-700'
// //                       }`}>
// //                       {employee.laptop_assigned === 'yes' ? 'Yes' : 'No'}
// //                     </span>
// //                   </div>

// //                   <InfoRow label="System Login ID" value={employee.system_login_id} />
// //                   <InfoRow label="System Password" value={employee.system_password ? '••••••••' : null} />
// //                   <InfoRow label="Office Email ID" value={employee.office_email_id} icon={Mail} />
// //                   <InfoRow label="Email Password" value={employee.office_email_password ? '••••••••' : null} />
// //                 </div>
// //               </Section>

// //               <Section title="Access Summary" icon={Lock}>
// //                 <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6">
// //                   <div className="flex items-center gap-4 mb-6">
// //                     <div className="p-4 bg-white rounded-xl shadow-sm">
// //                       <Lock className="w-6 h-6 text-amber-600" />
// //                     </div>
// //                     <div>
// //                       <p className="text-lg font-bold text-gray-900">System Credentials</p>
// //                       <p className="text-sm text-gray-600">Access details and permissions</p>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-3">
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-sm text-gray-600">Login Status</span>
// //                       <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">Active</span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-sm text-gray-600">Last Login</span>
// //                       <span className="text-sm font-medium text-gray-900">Today, 09:42 AM</span>
// //                     </div>
// //                     <div className="flex items-center justify-between">
// //                       <span className="text-sm text-gray-600">Email Access</span>
// //                       <span className="text-sm font-medium text-gray-900">{employee.office_email_id ? 'Configured' : 'Not Set'}</span>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </Section>
// //             </div>
// //           )}
// //         </div>
// //       </div>

// //       {/* Edit Modals */}
// //       {showEditModal && (
// //         <EditEmployeeModal
// //           isOpen={showEditModal}
// //           onClose={() => {
// //             setShowEditModal(false);
// //             loadEmployee();
// //           }}
// //           employeeId={employee.id}
// //           onSuccess={() => {
// //             loadEmployee();
// //             toast.success("Employee updated successfully!");
// //           }}
// //         />
// //       )}

// //       {showAddDetailsModal && (
// //         <AddMoreDetailsModal
// //           isOpen={showAddDetailsModal}
// //           onClose={() => {
// //             setShowAddDetailsModal(false);
// //             loadEmployee();
// //           }}
// //           employeeId={employee.id}
// //           onSuccess={() => {
// //             loadEmployee();
// //             toast.success("Additional details updated successfully!");
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // }


// // pages/EmployeeProfile.tsx - Modern Minimal Redesign
// import { useState, useEffect } from "react";
// import {
//   ArrowLeft, User, Mail, Phone, Briefcase, Building, MapPin,
//   Calendar, Heart, Home, GraduationCap, CreditCard,
//   Laptop, Edit, Download, FileText, Globe,
//   Smartphone, Award, School, Clock, CheckCircle,
//   XCircle, ChevronRight, ExternalLink, MoreVertical,
//   Printer, Share2, IdCard, Building2, Wallet, Lock, AtSign
// } from "lucide-react";
// import { toast } from "sonner";
// import employeeAPI from "../lib/employeeApi";
// import EditEmployeeModal from "../components/modals/EditEmployeeModal";
// import AddMoreDetailsModal from "../components/modals/AddMoreDetailsModal";

// interface EmployeeProfileProps {
//   employeeId: string;
//   onBack?: () => void;
// }

// export default function EmployeeProfile({ employeeId, onBack }: EmployeeProfileProps) {
//   const [employee, setEmployee] = useState<any>(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState("overview");
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showAddDetailsModal, setShowAddDetailsModal] = useState(false);

//   const loadEmployee = async () => {
//     try {
//       setLoading(true);
//       const data = await employeeAPI.getEmployee(Number(employeeId));
//       setEmployee(data);
//     } catch (error) {
//       console.error("Error loading employee:", error);
//       toast.error("Failed to load employee data");
//       if (onBack) {
//         onBack();
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (employeeId) {
//       loadEmployee();
//     }
//   }, [employeeId]);

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

//   const getTenure = (joiningDate: string) => {
//     if (!joiningDate) return "0 years";
//     const joinDate = new Date(joiningDate);
//     const today = new Date();
//     let years = today.getFullYear() - joinDate.getFullYear();
//     let months = today.getMonth() - joinDate.getMonth();

//     if (months < 0) {
//       years--;
//       months += 12;
//     }

//     return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
//   };

//   const StatusBadge = ({ status }: { status: string }) => {
//     const config: Record<string, { bg: string; text: string; icon: any }> = {
//       active: { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", icon: CheckCircle },
//       inactive: { bg: "bg-gray-50 border-gray-200", text: "text-gray-700", icon: XCircle },
//       on_leave: { bg: "bg-amber-50 border-amber-200", text: "text-amber-700", icon: Clock },
//       terminated: { bg: "bg-red-50 border-red-200", text: "text-red-700", icon: XCircle }
//     };
//     const { bg, text, icon: Icon } = config[status] || config.inactive;

//     return (
//       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium ${bg} ${text} border`}>
//         <Icon className="w-3 h-3" />
//         {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
//       </span>
//     );
//   };

//   const DetailCard = ({ icon: Icon, title, value, color = "gray" }: any) => {
//     const colors: Record<string, string> = {
//       gray: "bg-gray-50 text-gray-600",
//       red: "bg-red-50 text-red-600",
//       green: "bg-green-50 text-green-600",
//       blue: "bg-blue-50 text-blue-600",
//       yellow: "bg-amber-50 text-amber-600"
//     };

//     return (
//       <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
//         <div className="flex items-start gap-3">
//           <div className={`p-2 rounded-lg ${colors[color]}`}>
//             <Icon className="w-4 h-4" />
//           </div>
//           <div className="flex-1 min-w-0">
//             <p className="text-xs text-gray-500 mb-0.5">{title}</p>
//             <p className="text-sm font-medium text-gray-900 truncate">{value || "N/A"}</p>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const Section = ({ title, icon: Icon, children, className = "" }: any) => (
//     <div className={`bg-white border border-gray-200 rounded-lg p-5 ${className}`}>
//       <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
//         <Icon className="w-4 h-4 text-gray-700" />
//         <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
//       </div>
//       {children}
//     </div>
//   );

//   const InfoRow = ({ label, value, icon: Icon }: any) => {
//     if (!value || value === "N/A" || value === "") return null;
//     return (
//       <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
//         {Icon && (
//           <div className="p-1.5 bg-gray-50 rounded">
//             <Icon className="w-3.5 h-3.5 text-gray-500" />
//           </div>
//         )}
//         <div className="flex-1 min-w-0">
//           <p className="text-xs text-gray-500 mb-0.5">{label}</p>
//           <p className="text-sm text-gray-900">{value}</p>
//         </div>
//       </div>
//     );
//   };

//   const tabs = [
//     { id: "overview", label: "Overview", icon: User },
//     { id: "personal", label: "Personal", icon: Heart },
//     { id: "employment", label: "Employment", icon: Briefcase },
//     { id: "education", label: "Education", icon: GraduationCap },
//     { id: "bank", label: "Bank", icon: CreditCard },
//     { id: "system", label: "System", icon: Laptop }
//   ];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="relative w-12 h-12 mx-auto">
//             <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
//             <div className="absolute top-0 left-0 w-12 h-12 border-3 border-[#C63F47] border-t-transparent rounded-full animate-spin"></div>
//           </div>
//           <p className="mt-3 text-sm text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!employee) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="text-center max-w-md">
//           <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
//             <User className="w-8 h-8 text-gray-400" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
//           <p className="text-sm text-gray-500 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
//           <button
//             onClick={onBack}
//             className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C63F47] text-white text-sm rounded-lg hover:bg-[#B23840] transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" />
//             Back to Employees
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-6 py-3">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={onBack}
//                 className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 <span className="text-sm font-medium">Employees</span>
//               </button>
//               <div className="h-4 w-px bg-gray-200"></div>
//               <span className="text-sm text-gray-500">Profile</span>
//             </div>

//             <div className="flex items-center gap-2">
//               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
//                 <Printer className="w-4 h-4" />
//               </button>
//               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
//                 <Share2 className="w-4 h-4" />
//               </button>
//               <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
//                 <MoreVertical className="w-4 h-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-6 py-6">
//         {/* Profile Header */}
//         <div className="mb-6">
//           <div className="bg-white border border-gray-200 rounded-lg p-6">
//             <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
//               {/* Profile Picture */}
//               <div className="relative">
//                 <div className="relative">
//                   <div className="w-24 h-24 rounded-lg bg-[#C63F47] flex items-center justify-center text-white border border-gray-200 overflow-hidden">
//                     {employee.profile_picture ? (
//                       <img
//                         src={
//                           employee.profile_picture.startsWith('http')
//                             ? employee.profile_picture
//                             : `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${employee.profile_picture}`
//                         }
//                         alt={`${employee.first_name} ${employee.last_name}`}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.currentTarget.style.display = 'none';
//                           const parent = e.currentTarget.parentElement;
//                           if (parent) {
//                             parent.innerHTML = `
//                               <span class="text-2xl font-semibold">
//                                 ${employee.first_name?.charAt(0)}${employee.last_name?.charAt(0)}
//                               </span>
//                             `;
//                           }
//                         }}
//                       />
//                     ) : (
//                       <span className="text-2xl font-semibold">
//                         {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
//                       </span>
//                     )}
//                   </div>
//                   <div className="absolute -bottom-1 -right-1">
//                     <StatusBadge status={employee.employee_status || 'active'} />
//                   </div>
//                 </div>
//               </div>

//               {/* Profile Info */}
//               <div className="flex-1">
//                 <div className="flex flex-wrap items-center gap-3 mb-1">
//                   <h1 className="text-2xl font-semibold text-gray-900">
//                     {employee.first_name} {employee.last_name}
//                   </h1>
//                 </div>

//                 <p className="text-base text-gray-600 mb-4">{employee.designation || 'N/A'}</p>

//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//                   <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//                     <p className="text-xs text-gray-500 mb-0.5">Employee ID</p>
//                     <p className="text-sm font-medium text-gray-900">{employee.employee_code || 'N/A'}</p>
//                   </div>

//                   <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//                     <p className="text-xs text-gray-500 mb-0.5">Department</p>
//                     <p className="text-sm font-medium text-gray-900">{employee.department_name || 'N/A'}</p>
//                   </div>

//                   <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//                     <p className="text-xs text-gray-500 mb-0.5">Tenure</p>
//                     <p className="text-sm font-medium text-gray-900">{getTenure(employee.joining_date)}</p>
//                   </div>

//                   <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
//                     <p className="text-xs text-gray-500 mb-0.5">Role</p>
//                     <p className="text-sm font-medium text-gray-900">{employee.role_name || 'N/A'}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Action Buttons */}
//               <div className="flex flex-col gap-2">
//                 <button
//                   onClick={() => setShowEditModal(true)}
//                   className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   <Edit className="w-4 h-4" />
//                   Edit Profile
//                 </button>
//                 <button
//                   onClick={() => setShowAddDetailsModal(true)}
//                   className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C63F47] text-white text-sm rounded-lg hover:bg-[#B23840] transition-colors"
//                 >
//                   <FileText className="w-4 h-4" />
//                   Add Details
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tab Navigation */}
//         <div className="mb-6">
//           <div className="flex gap-2 overflow-x-auto pb-1">
//             {tabs.map((tab) => {
//               const Icon = tab.icon;
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
//                     isActive
//                       ? 'bg-[#C63F47] text-white'
//                       : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
//                   }`}
//                 >
//                   <Icon className="w-4 h-4" />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Tab Content */}
//         <div className="mb-6">
//           {activeTab === "overview" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//               <Section title="Contact Information" icon={Mail}>
//                 <div className="space-y-0">
//                   <InfoRow label="Email" value={employee.email} icon={Mail} />
//                   <InfoRow label="Phone" value={employee.phone} icon={Phone} />
//                   <InfoRow label="Emergency Contact" value={employee.emergency_contact} icon={Smartphone} />
//                   <InfoRow label="Office Location" value={employee.office_location} icon={Building} />
//                   <InfoRow label="Attendance Location" value={employee.attendence_location} icon={MapPin} />
//                 </div>
//               </Section>

//               <Section title="Personal Details" icon={User}>
//                 <div className="space-y-0">
//                   <InfoRow label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
//                   <InfoRow label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : null} icon={Calendar} />
//                   {employee.date_of_birth && <InfoRow label="Age" value={`${calculateAge(employee.date_of_birth)} years`} />}
//                   <InfoRow label="Blood Group" value={employee.blood_group} icon={Heart} />
//                   <InfoRow label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
//                   <InfoRow label="Nationality" value={employee.nationality} icon={Globe} />
//                 </div>
//               </Section>

//               <Section title="Employment" icon={Briefcase}>
//                 <div className="space-y-0">
//                   <InfoRow label="Employee Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} />
//                   <InfoRow label="Work Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} />
//                   <InfoRow label="Branch" value={employee.branch} icon={Building} />
//                   <InfoRow label="Job Title" value={employee.job_title} />
//                   <InfoRow label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
//                   <InfoRow label="Notice Period" value={employee.notice_period ? `${employee.notice_period} days` : null} icon={Clock} />
//                 </div>
//               </Section>

//               {(employee.current_address || employee.permanent_address) && (
//                 <Section title="Address" icon={Home} className="lg:col-span-2 xl:col-span-3">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {employee.current_address && (
//                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <MapPin className="w-4 h-4 text-gray-600" />
//                           <p className="text-xs font-semibold text-gray-900">Current Address</p>
//                         </div>
//                         <p className="text-sm text-gray-600 leading-relaxed">{employee.current_address}</p>
//                       </div>
//                     )}
//                     {employee.permanent_address && (
//                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <Home className="w-4 h-4 text-gray-600" />
//                           <p className="text-xs font-semibold text-gray-900">Permanent Address</p>
//                         </div>
//                         <p className="text-sm text-gray-600 leading-relaxed">{employee.permanent_address}</p>
//                       </div>
//                     )}
//                   </div>
//                 </Section>
//               )}
//             </div>
//           )}

//           {activeTab === "personal" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               <Section title="Basic Information" icon={User}>
//                 <div className="space-y-0">
//                   <InfoRow label="Full Name" value={`${employee.first_name} ${employee.last_name}`} />
//                   <InfoRow label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} />
//                   <InfoRow label="Date of Birth" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
//                   {employee.date_of_birth && <InfoRow label="Age" value={`${calculateAge(employee.date_of_birth)} years`} />}
//                   <InfoRow label="Blood Group" value={employee.blood_group} icon={Heart} />
//                   <InfoRow label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} />
//                   <InfoRow label="Nationality" value={employee.nationality} icon={Globe} />
//                 </div>
//               </Section>

//               <Section title="Contact Details" icon={Phone}>
//                 <div className="space-y-0">
//                   <InfoRow label="Email Address" value={employee.email} icon={Mail} />
//                   <InfoRow label="Phone Number" value={employee.phone} icon={Phone} />
//                   <InfoRow label="Emergency Contact" value={employee.emergency_contact} icon={Smartphone} />
//                 </div>
//               </Section>

//               {(employee.aadhar_number || employee.pan_number) && (
//                 <Section title="Identification" icon={IdCard} className="lg:col-span-2">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {employee.aadhar_number && (
//                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <IdCard className="w-4 h-4 text-gray-600" />
//                           <p className="text-xs font-semibold text-gray-900">Aadhar Number</p>
//                         </div>
//                         <p className="text-sm font-mono text-gray-900">{employee.aadhar_number}</p>
//                       </div>
//                     )}
//                     {employee.pan_number && (
//                       <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
//                         <div className="flex items-center gap-2 mb-2">
//                           <CreditCard className="w-4 h-4 text-gray-600" />
//                           <p className="text-xs font-semibold text-gray-900">PAN Number</p>
//                         </div>
//                         <p className="text-sm font-mono text-gray-900">{employee.pan_number}</p>
//                       </div>
//                     )}
//                   </div>
//                 </Section>
//               )}
//             </div>
//           )}

//           {activeTab === "employment" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               <Section title="Employment Details" icon={Briefcase}>
//                 <div className="space-y-0">
//                   <InfoRow label="Employee Code" value={employee.employee_code} />
//                   <InfoRow label="Designation" value={employee.designation} />
//                   <InfoRow label="Job Title" value={employee.job_title} />
//                   <InfoRow label="Department" value={employee.department_name} icon={Building} />
//                   <InfoRow label="Role" value={employee.role_name} />
//                   <InfoRow label="Employee Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} />
//                   <InfoRow label="Work Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} />
//                 </div>
//               </Section>

//               <Section title="Important Dates" icon={Calendar}>
//                 <div className="space-y-0">
//                   <InfoRow label="Joining Date" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
//                   <InfoRow label="Date of Leaving" value={employee.date_of_leaving ? new Date(employee.date_of_leaving).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} icon={Calendar} />
//                   <InfoRow label="Probation Period" value={employee.probation_period ? `${employee.probation_period} months` : null} />
//                   <InfoRow label="Notice Period" value={employee.notice_period ? `${employee.notice_period} days` : null} icon={Clock} />
//                 </div>
//               </Section>

//               <Section title="Office Details" icon={Building2} className="lg:col-span-2">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <DetailCard icon={Building2} title="Branch" value={employee.branch} color="gray" />
//                   <DetailCard icon={MapPin} title="Office Location" value={employee.office_location} color="green" />
//                   <DetailCard icon={MapPin} title="Attendance Location" value={employee.attendence_location} color="blue" />
//                 </div>
//               </Section>
//             </div>
//           )}

//           {activeTab === "education" && (
//             <div className="grid grid-cols-1 gap-4">
//               <Section title="Educational Background" icon={GraduationCap}>
//                 {employee.highest_qualification || employee.university ? (
//                   <div className="flex flex-col md:flex-row gap-6 items-start">
//                     <div className="md:w-1/3">
//                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
//                         <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                           <GraduationCap className="w-6 h-6 text-gray-600" />
//                         </div>
//                         <p className="text-base font-semibold text-gray-900 mb-1">{employee.highest_qualification || 'Education'}</p>
//                         <p className="text-sm text-gray-500">{employee.passing_year || 'Year'}</p>
//                       </div>
//                     </div>
//                     <div className="md:w-2/3">
//                       <div className="space-y-0">
//                         <InfoRow label="Highest Qualification" value={employee.highest_qualification} icon={Award} />
//                         <InfoRow label="University/College" value={employee.university} icon={School} />
//                         <InfoRow label="Passing Year" value={employee.passing_year} icon={Calendar} />
//                         <InfoRow label="Percentage/CGPA" value={employee.percentage ? `${employee.percentage}%` : null} />
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center py-8">
//                     <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                       <School className="w-6 h-6 text-gray-400" />
//                     </div>
//                     <p className="text-sm text-gray-500 mb-3">No educational information available</p>
//                     <button
//                       onClick={() => setShowAddDetailsModal(true)}
//                       className="text-sm text-[#C63F47] hover:text-[#B23840] font-medium"
//                     >
//                       Add educational details
//                     </button>
//                   </div>
//                 )}
//               </Section>
//             </div>
//           )}

//           {activeTab === "bank" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               <Section title="Bank Account Details" icon={CreditCard}>
//                 <div className="space-y-0">
//                   <InfoRow label="Bank Name" value={employee.bank_name} />
//                   <InfoRow label="Account Number" value={employee.bank_account_number} />
//                   <InfoRow label="IFSC Code" value={employee.ifsc_code} />
//                   <InfoRow label="UPI ID" value={employee.upi_id} />
//                 </div>
//               </Section>

//               {employee.bank_name && (
//                 <Section title="Bank Summary" icon={Wallet}>
//                   <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
//                     <div className="flex items-center gap-3 mb-4">
//                       <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
//                         <Wallet className="w-5 h-5 text-gray-600" />
//                       </div>
//                       <div>
//                         <p className="text-base font-semibold text-gray-900">{employee.bank_name}</p>
//                         <p className="text-xs text-gray-500">Account Holder</p>
//                       </div>
//                     </div>
//                     {employee.bank_account_number && (
//                       <p className="text-sm font-mono text-gray-700 bg-white border border-gray-100 p-2.5 rounded">
//                         Account: •••• {employee.bank_account_number.slice(-4)}
//                       </p>
//                     )}
//                   </div>
//                 </Section>
//               )}
//             </div>
//           )}

//           {activeTab === "system" && (
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//               <Section title="System Access" icon={Laptop}>
//                 <div className="space-y-3">
//                   <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg">
//                     <div className="flex items-center gap-2">
//                       <Laptop className="w-4 h-4 text-gray-600" />
//                       <span className="text-sm font-medium text-gray-900">Laptop Assigned</span>
//                     </div>
//                     <span className={`px-2.5 py-1 rounded text-xs font-medium ${
//                       employee.laptop_assigned === 'yes'
//                         ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
//                         : 'bg-gray-100 text-gray-700 border border-gray-200'
//                     }`}>
//                       {employee.laptop_assigned === 'yes' ? 'Yes' : 'No'}
//                     </span>
//                   </div>

//                   <div className="space-y-0">
//                     <InfoRow label="System Login ID" value={employee.system_login_id} />
//                     <InfoRow label="System Password" value={employee.system_password ? '••••••••' : null} />
//                     <InfoRow label="Office Email ID" value={employee.office_email_id} icon={Mail} />
//                     <InfoRow label="Email Password" value={employee.office_email_password ? '••••••••' : null} />
//                   </div>
//                 </div>
//               </Section>

//               <Section title="Access Summary" icon={Lock}>
//                 <div className="bg-gray-50 border border-gray-100 rounded-lg p-5">
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
//                       <Lock className="w-5 h-5 text-gray-600" />
//                     </div>
//                     <div>
//                       <p className="text-base font-semibold text-gray-900">System Credentials</p>
//                       <p className="text-xs text-gray-500">Access details and permissions</p>
//                     </div>
//                   </div>

//                   <div className="space-y-2.5">
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Login Status</span>
//                       <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-medium">Active</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Last Login</span>
//                       <span className="text-sm font-medium text-gray-900">Today, 09:42 AM</span>
//                     </div>
//                     <div className="flex items-center justify-between">
//                       <span className="text-sm text-gray-600">Email Access</span>
//                       <span className="text-sm font-medium text-gray-900">{employee.office_email_id ? 'Configured' : 'Not Set'}</span>
//                     </div>
//                   </div>
//                 </div>
//               </Section>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Edit Modals */}
//       {showEditModal && (
//         <EditEmployeeModal
//           isOpen={showEditModal}
//           onClose={() => {
//             setShowEditModal(false);
//             loadEmployee();
//           }}
//           employeeId={employee.id}
//           onSuccess={() => {
//             loadEmployee();
//             toast.success("Employee updated successfully!");
//           }}
//         />
//       )}

//       {showAddDetailsModal && (
//         <AddMoreDetailsModal
//           isOpen={showAddDetailsModal}
//           onClose={() => {
//             setShowAddDetailsModal(false);
//             loadEmployee();
//           }}
//           employeeId={employee.id}
//           onSuccess={() => {
//             loadEmployee();
//             toast.success("Additional details updated successfully!");
//           }}
//         />
//       )}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Building, MapPin,
  Calendar, Heart, Home, GraduationCap, CreditCard,
  Laptop, Edit, FileText, Globe,
  Smartphone, Award, School, Clock, CheckCircle,
  XCircle, MoreVertical, Download, Share2, IdCard, 
  Building2, Wallet, Lock, Star, Sparkles,
  Eye, Search, Filter
} from "lucide-react";
import { toast } from "sonner";
import employeeAPI from "../lib/employeeApi";
import EditEmployeeModal from "../components/modals/EditEmployeeModal";
import AddMoreDetailsModal from "../components/modals/AddMoreDetailsModal";

interface EmployeeProfileProps {
  employeeId: string;
  onBack?: () => void;
}

export default function EmployeeProfile({ employeeId, onBack }: EmployeeProfileProps) {
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddDetailsModal, setShowAddDetailsModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeAPI.getEmployee(Number(employeeId));
      setEmployee(data);
      setImageError(false);
    } catch (error) {
      console.error("Error loading employee:", error);
      toast.error("Failed to load employee data");
      if (onBack) onBack();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employeeId) loadEmployee();
  }, [employeeId]);

const getImageUrl = (imagePath?: string) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http')) return imagePath;
  
  // Get base URL and remove /api suffix for image paths
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  
  // Remove /api from the end since images are served from root
  baseUrl = baseUrl.replace(/\/api\/?$/, '');
  
  if (imagePath.startsWith('uploads/') || imagePath.startsWith('/uploads/')) {
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;
  }
  return `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
}; 

  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getTenure = (joiningDate: string) => {
    if (!joiningDate) return "0y 0m";
    const joinDate = new Date(joiningDate);
    const today = new Date();
    let years = today.getFullYear() - joinDate.getFullYear();
    let months = today.getMonth() - joinDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
      active: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle },
      inactive: { bg: "bg-gray-100", text: "text-gray-600", icon: XCircle },
      on_leave: { bg: "bg-amber-100", text: "text-amber-700", icon: Clock },
      terminated: { bg: "bg-red-100", text: "text-red-700", icon: XCircle }
    };
    const { bg, text, icon: Icon } = config[status] || config.inactive;
    return (
      <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const GlassCard = ({ children, className = "" }: any) => (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {children}
    </div>
  );

  const StatsCard = ({ icon: Icon, label, value, gradient }: any) => (
    <GlassCard>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${gradient}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
            <p className="text-base font-semibold text-gray-900 truncate">{value || 'N/A'}</p>
          </div>
        </div>
      </div>
    </GlassCard>
  );

  const InfoItem = ({ icon: Icon, label, value, gradient }: any) => {
    if (!value || value === "N/A") return null;
    return (
      <div className="p-3 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${gradient}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className="text-sm font-semibold text-gray-900">{value}</p>
          </div>
        </div>
      </div>
    );
  };

  const Section = ({ title, icon: Icon, children, className = "" }: any) => (
    <GlassCard className={className}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="p-2 rounded-lg bg-gradient-to-r from-[#40423f] to-[#4a4c49]">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h3>
        <div className="flex-1" />
      </div>
      <div className="p-5">{children}</div>
    </GlassCard>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: Star },
    { id: "personal", label: "Personal", icon: Heart },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "bank", label: "Bank", icon: CreditCard },
    { id: "system", label: "System", icon: Laptop }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="w-16 h-16 border-4 border-[#40423f]/20 border-t-[#40423f] rounded-full animate-spin" />
          </div>
          <p className="text-base font-medium text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Employee Not Found</h2>
          <p className="text-sm text-gray-600 mb-6">The profile you're looking for doesn't exist.</p>
          <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#40423f] to-[#4a4c49] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </button>
        </GlassCard>
      </div>
    );
  }

  const profileImageUrl = getImageUrl(employee.profile_picture);
  const employeeInitials = `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white text-black shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={onBack} className="flex items-center gap-2 text-black hover:text-red-600 transition-colors">
              <div className="p-2 rounded-lg bg-white/10">
                <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Back to Employees</span>
            </button>
            <div className="flex items-center gap-2">
              {[Download, Share2, MoreVertical].map((Icon, i) => (
                <button key={i} className="p-2 rounded-lg bg-white/10 text-black hover:bg-white/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Profile Header */}
        <GlassCard className="mb-6">
          <div className="relative h-32 bg-blue-200 rounded-t-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-4 right-4">
              <StatusBadge status={employee.employee_status || 'active'} />
            </div>
          </div>
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-lg overflow-hidden">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-3xl font-semibold">{employeeInitials}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 mb-2">
                      {employee.first_name} {employee.last_name}
                    </h1>
                    <p className="text-base font-medium text-gray-600 mb-3">{employee.designation || 'N/A'}</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: IdCard, text: employee.employee_code, bg: "bg-blue-500" },
                        { icon: Building, text: employee.department_name, bg: "bg-purple-500" },
                        { icon: Clock, text: getTenure(employee.joining_date), bg: "bg-green-500" }
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-1.5 ${item.bg} text-white rounded-full text-xs font-medium`}>
                          <item.icon className="w-3 h-3" />
                          {item.text || 'N/A'}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button onClick={() => setShowEditModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button onClick={() => setShowAddDetailsModal(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                      <FileText className="w-4 h-4" />
                      Add Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard icon={Mail} label="Email" value={employee.email} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
          <StatsCard icon={Phone} label="Phone" value={employee.phone} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
          <StatsCard icon={Briefcase} label="Role" value={employee.role_name} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
          <StatsCard icon={MapPin} label="Location" value={employee.office_location} gradient="bg-gradient-to-r from-orange-500 to-red-500" />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <GlassCard>
            <div className="p-2">
              <div className="flex overflow-x-auto scrollbar-hide gap-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#40423f] to-[#5a5d5a] text-white shadow-sm' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Content */}
        <div>
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Contact Information" icon={Mail}>
                <div className="grid gap-3">
                  <InfoItem icon={Mail} label="Email" value={employee.email} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <InfoItem icon={Phone} label="Phone" value={employee.phone} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <InfoItem icon={Smartphone} label="Emergency" value={employee.emergency_contact} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                  <InfoItem icon={Building} label="Office" value={employee.office_location} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
                  <InfoItem icon={MapPin} label="Attendance" value={employee.attendence_location} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                </div>
              </Section>

              <Section title="Personal Details" icon={User}>
                <div className="grid gap-3">
                  <InfoItem icon={User} label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} gradient="bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <InfoItem icon={Calendar} label="Birth Date" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null} gradient="bg-gradient-to-r from-pink-500 to-rose-500" />
                  {employee.date_of_birth && <InfoItem icon={Heart} label="Age" value={`${calculateAge(employee.date_of_birth)} years`} gradient="bg-gradient-to-r from-red-500 to-pink-500" />}
                  <InfoItem icon={Heart} label="Blood Group" value={employee.blood_group} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                  <InfoItem icon={Heart} label="Marital Status" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} gradient="bg-gradient-to-r from-pink-500 to-fuchsia-500" />
                  <InfoItem icon={Globe} label="Nationality" value={employee.nationality} gradient="bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
              </Section>

              <Section title="Employment" icon={Briefcase} className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <InfoItem icon={Briefcase} label="Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} gradient="bg-gradient-to-r from-purple-500 to-indigo-500" />
                  <InfoItem icon={Laptop} label="Work Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <InfoItem icon={Building} label="Branch" value={employee.branch} gradient="bg-gradient-to-r from-green-500 to-teal-500" />
                  <InfoItem icon={Briefcase} label="Job Title" value={employee.job_title} gradient="bg-gradient-to-r from-indigo-500 to-violet-500" />
                  <InfoItem icon={Calendar} label="Joined" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null} gradient="bg-gradient-to-r from-pink-500 to-rose-500" />
                  <InfoItem icon={Clock} label="Notice" value={employee.notice_period ? `${employee.notice_period} days` : null} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                </div>
              </Section>

              {(employee.current_address || employee.permanent_address) && (
                <Section title="Addresses" icon={Home} className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.current_address && (
                      <div className="p-5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-semibold uppercase">Current Address</p>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">{employee.current_address}</p>
                      </div>
                    )}
                    {employee.permanent_address && (
                      <div className="p-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Home className="w-4 h-4" />
                          </div>
                          <p className="text-sm font-semibold uppercase">Permanent Address</p>
                        </div>
                        <p className="text-sm leading-relaxed opacity-90">{employee.permanent_address}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}

          {activeTab === "personal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Basic Info" icon={User}>
                <div className="grid gap-3">
                  <InfoItem icon={User} label="Name" value={`${employee.first_name} ${employee.last_name}`} gradient="bg-gradient-to-r from-blue-500 to-indigo-500" />
                  <InfoItem icon={User} label="Gender" value={employee.gender?.charAt(0).toUpperCase() + employee.gender?.slice(1)} gradient="bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <InfoItem icon={Calendar} label="DOB" value={employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : null} gradient="bg-gradient-to-r from-pink-500 to-rose-500" />
                  {employee.date_of_birth && <InfoItem icon={Heart} label="Age" value={`${calculateAge(employee.date_of_birth)} years`} gradient="bg-gradient-to-r from-red-500 to-pink-500" />}
                  <InfoItem icon={Heart} label="Blood" value={employee.blood_group} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                  <InfoItem icon={Heart} label="Marital" value={employee.marital_status?.charAt(0).toUpperCase() + employee.marital_status?.slice(1)} gradient="bg-gradient-to-r from-pink-500 to-fuchsia-500" />
                  <InfoItem icon={Globe} label="Nationality" value={employee.nationality} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                </div>
              </Section>

              <Section title="Contact" icon={Phone}>
                <div className="grid gap-3">
                  <InfoItem icon={Mail} label="Email" value={employee.email} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <InfoItem icon={Phone} label="Phone" value={employee.phone} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <InfoItem icon={Smartphone} label="Emergency" value={employee.emergency_contact} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                </div>
              </Section>

              {(employee.aadhar_number || employee.pan_number) && (
                <Section title="Documents" icon={IdCard} className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.aadhar_number && (
                      <div className="p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg"><IdCard className="w-4 h-4" /></div>
                          <p className="text-sm font-semibold uppercase">Aadhar</p>
                        </div>
                        <p className="text-lg font-medium">{employee.aadhar_number}</p>
                      </div>
                    )}
                    {employee.pan_number && (
                      <div className="p-5 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-white/20 rounded-lg"><CreditCard className="w-4 h-4" /></div>
                          <p className="text-sm font-semibold uppercase">PAN</p>
                        </div>
                        <p className="text-lg font-medium">{employee.pan_number}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}

          {activeTab === "employment" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Details" icon={Briefcase}>
                <div className="grid gap-3">
                  <InfoItem icon={IdCard} label="Code" value={employee.employee_code} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <InfoItem icon={Briefcase} label="Designation" value={employee.designation} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
                  <InfoItem icon={Briefcase} label="Job Title" value={employee.job_title} gradient="bg-gradient-to-r from-indigo-500 to-violet-500" />
                  <InfoItem icon={Building} label="Department" value={employee.department_name} gradient="bg-gradient-to-r from-green-500 to-teal-500" />
                  <InfoItem icon={User} label="Role" value={employee.role_name} gradient="bg-gradient-to-r from-pink-500 to-rose-500" />
                  <InfoItem icon={Briefcase} label="Type" value={employee.employee_type?.charAt(0).toUpperCase() + employee.employee_type?.slice(1)} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                  <InfoItem icon={Laptop} label="Mode" value={employee.work_mode?.charAt(0).toUpperCase() + employee.work_mode?.slice(1)} gradient="bg-gradient-to-r from-blue-500 to-indigo-500" />
                </div>
              </Section>

              <Section title="Dates" icon={Calendar}>
                <div className="grid gap-3">
                  <InfoItem icon={Calendar} label="Joined" value={employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : null} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <InfoItem icon={Calendar} label="Leaving" value={employee.date_of_leaving ? new Date(employee.date_of_leaving).toLocaleDateString() : null} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                  <InfoItem icon={Clock} label="Probation" value={employee.probation_period ? `${employee.probation_period} months` : null} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                  <InfoItem icon={Clock} label="Notice" value={employee.notice_period ? `${employee.notice_period} days` : null} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                </div>
              </Section>

              <Section title="Office" icon={Building2} className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InfoItem icon={Building2} label="Branch" value={employee.branch} gradient="bg-gradient-to-r from-purple-500 to-indigo-500" />
                  <InfoItem icon={MapPin} label="Office" value={employee.office_location} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <InfoItem icon={MapPin} label="Attendance" value={employee.attendence_location} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                </div>
              </Section>
            </div>
          )}

          {activeTab === "education" && (
            <Section title="Education" icon={GraduationCap}>
              {employee.highest_qualification || employee.university ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-sm text-center text-white">
                      <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-8 h-8" />
                      </div>
                      <p className="text-lg font-semibold mb-2">{employee.highest_qualification || 'Education'}</p>
                      <p className="text-sm font-medium opacity-80">{employee.passing_year || 'Year'}</p>
                    </div>
                  </div>
                  <div className="md:w-2/3 grid gap-3">
                    <InfoItem icon={Award} label="Qualification" value={employee.highest_qualification} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
                    <InfoItem icon={School} label="University" value={employee.university} gradient="bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <InfoItem icon={Calendar} label="Year" value={employee.passing_year} gradient="bg-gradient-to-r from-pink-500 to-rose-500" />
                    <InfoItem icon={Award} label="Score" value={employee.percentage ? `${employee.percentage}%` : null} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <School className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-600 mb-4">No education data</p>
                  <button onClick={() => setShowAddDetailsModal(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#40423f] to-[#5a5d5a] text-white text-sm font-medium rounded-lg hover:shadow-md transition-all">
                    <FileText className="w-4 h-4" />
                    Add Details
                  </button>
                </div>
              )}
            </Section>
          )}

          {activeTab === "bank" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Bank Details" icon={CreditCard}>
                <div className="grid gap-3">
                  <InfoItem icon={Building2} label="Bank" value={employee.bank_name} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                  <InfoItem icon={CreditCard} label="Account" value={employee.bank_account_number} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                  <InfoItem icon={Building} label="IFSC" value={employee.ifsc_code} gradient="bg-gradient-to-r from-purple-500 to-pink-500" />
                  <InfoItem icon={Wallet} label="UPI" value={employee.upi_id} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                </div>
              </Section>

              {employee.bank_name && (
                <Section title="Summary" icon={Wallet}>
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold">{employee.bank_name}</p>
                        <p className="text-sm font-medium opacity-80">Primary Account</p>
                      </div>
                    </div>
                    {employee.bank_account_number && (
                      <div className="bg-white/20 rounded-lg p-4">
                        <p className="text-xs font-medium uppercase mb-2 opacity-70">Account</p>
                        <p className="text-lg font-medium">•••• •••• {employee.bank_account_number.slice(-4)}</p>
                      </div>
                    )}
                  </div>
                </Section>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section title="Access" icon={Laptop}>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg"><Laptop className="w-4 h-4" /></div>
                      <span className="text-sm font-medium uppercase">Laptop</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${employee.laptop_assigned === 'yes' ? 'bg-green-400 text-green-900' : 'bg-gray-300 text-gray-700'}`}>
                      {employee.laptop_assigned === 'yes' ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <InfoItem icon={User} label="Login" value={employee.system_login_id} gradient="bg-gradient-to-r from-blue-500 to-cyan-500" />
                    <InfoItem icon={Lock} label="Password" value={employee.system_password ? '••••••••' : null} gradient="bg-gradient-to-r from-red-500 to-rose-500" />
                    <InfoItem icon={Mail} label="Email" value={employee.office_email_id} gradient="bg-gradient-to-r from-green-500 to-emerald-500" />
                    <InfoItem icon={Lock} label="Email Pass" value={employee.office_email_password ? '••••••••' : null} gradient="bg-gradient-to-r from-orange-500 to-amber-500" />
                  </div>
                </div>
              </Section>

              <Section title="Summary" icon={Lock}>
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Credentials</p>
                      <p className="text-sm font-medium opacity-80">Access Details</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: 'Status', value: <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-medium">Active</span> },
                      { label: 'Last Login', value: 'Today, 09:42 AM' },
                      { label: 'Email', value: employee.office_email_id ? 'Configured' : 'Not Set' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/20 rounded-lg">
                        <span className="text-sm font-medium">{item.label}</span>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => { setShowEditModal(false); loadEmployee(); }}
          employeeId={employee.id}
          onSuccess={() => { loadEmployee(); toast.success("Updated!"); }}
        />
      )}

      {showAddDetailsModal && (
        <AddMoreDetailsModal
          isOpen={showAddDetailsModal}
          onClose={() => { setShowAddDetailsModal(false); loadEmployee(); }}
          employeeId={employee.id}
          onSuccess={() => { loadEmployee(); toast.success("Details added!"); }}
        />
      )}
    </div>
  );
}
