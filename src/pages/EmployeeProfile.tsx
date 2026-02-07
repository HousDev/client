

import { useState, useEffect } from "react";
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Building, MapPin,
  Calendar, Heart, Home, GraduationCap, CreditCard,
  Laptop, Edit, FileText, IdCard,
  Smartphone, Award, School, Clock, CheckCircle,
  XCircle, Download, Share2, Wallet, Lock,
  Star, Building2, Globe, ChevronRight, ExternalLink
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
  
  // Get base URL - keep /api in the path
  // eslint-disable-next-line prefer-const
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  
  // Simply append the image path to baseUrl
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

  // Parse allotted projects from JSON string/array
  const getAllottedProjects = () => {
    if (!employee?.allotted_project) return [];
    try {
      if (typeof employee.allotted_project === 'string') {
        const parsed = JSON.parse(employee.allotted_project);
        return Array.isArray(parsed) ? parsed : [];
      }
      return Array.isArray(employee.allotted_project) ? employee.allotted_project : [];
    } catch {
      return [];
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Star },
    { id: "personal", label: "Personal", icon: User },
    { id: "employment", label: "Employment", icon: Briefcase },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "system", label: "System", icon: Laptop },
    { id: "bank", label: "Bank", icon: CreditCard }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto border-4 border-[#C62828]/20 border-t-[#C62828] rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl shadow-lg border">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Employee Not Found</h2>
          <p className="text-gray-600 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={onBack} 
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C62828] text-white font-medium rounded-lg hover:bg-red-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  const profileImageUrl = getImageUrl(employee.profile_picture);
  const employeeInitials = `${employee.first_name?.charAt(0) || ''}${employee.last_name?.charAt(0) || ''}`;
  const allottedProjects = getAllottedProjects();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
     <div className="sticky top-16 z-50   ">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      <div className="flex items-center gap-3">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-[#C62828] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Employees</span>
        </button>
        <div className="h-6 w-px bg-gray-300" />
        <span className="text-sm text-gray-500">Profile</span>
      </div>
      
     
    </div>
  </div>
</div>


      {/* Main Content */}
      <div className="  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg border overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-[#40423f] to-[#5a5d5a]" />
          
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-20">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-2xl overflow-hidden">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-4xl font-bold">{employeeInitials}</span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h1>
                      <StatusBadge status={employee.employee_status || 'active'} />
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-lg text-gray-700 font-medium">{employee.designation || 'No designation'}</p>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm">
                          <IdCard className="w-3 h-3" />
                          {employee.employee_code || 'No ID'}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm">
                          <Building className="w-3 h-3" />
                          {employee.department_name || 'No department'}
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm">
                          <Clock className="w-3 h-3" />
                          {getTenure(employee.joining_date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 sm:w-40 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Profile
                    </button>
                    <button 
                      onClick={() => setShowAddDetailsModal(true)}
                      className="flex-1 sm:w-40 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C62828] text-white font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Add Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Mail, label: "Email", value: employee.email, color: "bg-blue-500" },
            { icon: Phone, label: "Phone", value: employee.phone, color: "bg-green-500" },
            { icon: Briefcase, label: "Role", value: employee.role_name, color: "bg-purple-500" },
            { icon: MapPin, label: "Company", value: employee.company_name, color: "bg-amber-500" }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${item.color} rounded-lg`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.value || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex overflow-x-auto px-4 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                      isActive 
                        ? 'border-[#C62828] text-[#C62828]' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#C62828]" />
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Email</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Phone</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Emergency Contact</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.emergency_contact || 'N/A'}</p>
                  </div>
                  {employee.emergency_contact_name && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Emergency Contact Name</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.emergency_contact_name}</p>
                    </div>
                  )}
                  {employee.emergency_contact_relationship && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Relationship</label>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{employee.emergency_contact_relationship}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Personal Details */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C62828]" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Gender</label>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{employee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Date of Birth</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.date_of_birth ? new Date(employee.date_of_birth).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Age</label>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.date_of_birth ? `${calculateAge(employee.date_of_birth)} years` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Blood Group</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.blood_group || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Marital Status</label>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{employee.marital_status || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Nationality</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.nationality || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Allotted Projects */}
              {allottedProjects.length > 0 && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#C62828]" />
                    Allotted Projects
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {allottedProjects.map((projectId: number) => (
                      <span key={projectId} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        Project #{projectId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Details */}
              {(employee.current_address || employee.permanent_address) && (
                <div className="bg-white rounded-xl border p-6 shadow-sm lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Home className="w-5 h-5 text-[#C62828]" />
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {employee.current_address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Address</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900">{employee.current_address}</p>
                          {(employee.city || employee.state || employee.pincode) && (
                            <p className="text-sm text-gray-600 mt-2">
                              {employee.city && `${employee.city}, `}
                              {employee.state && `${employee.state} `}
                              {employee.pincode && `- ${employee.pincode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {employee.permanent_address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Permanent Address</h4>
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900">{employee.permanent_address}</p>
                          {(employee.city || employee.state || employee.pincode) && !employee.same_as_permanent && (
                            <p className="text-sm text-gray-600 mt-2">
                              {employee.city && `${employee.city}, `}
                              {employee.state && `${employee.state} `}
                              {employee.pincode && `- ${employee.pincode}`}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "personal" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Identification Details */}
              {(employee.aadhar_number || employee.pan_number) && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-[#C62828]" />
                    Identification
                  </h3>
                  <div className="space-y-4">
                    {employee.aadhar_number && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <label className="text-xs text-blue-700 font-medium">Aadhar Number</label>
                        <p className="text-lg font-semibold text-blue-900">{employee.aadhar_number}</p>
                      </div>
                    )}
                    {employee.pan_number && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <label className="text-xs text-green-700 font-medium">PAN Number</label>
                        <p className="text-lg font-semibold text-green-900">{employee.pan_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Details */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#C62828]" />
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-500 font-medium">Email</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <label className="text-xs text-gray-500 font-medium">Phone</label>
                    <p className="text-sm font-semibold text-gray-900">{employee.phone}</p>
                  </div>
                  {employee.emergency_contact && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <label className="text-xs text-red-700 font-medium">Emergency Contact</label>
                      <p className="text-lg font-semibold text-red-900">{employee.emergency_contact}</p>
                      {employee.emergency_contact_name && (
                        <p className="text-sm text-red-700 mt-1">
                          {employee.emergency_contact_name} ({employee.emergency_contact_relationship})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "employment" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employment Details */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#C62828]" />
                  Employment Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Employee Type</label>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{employee.employee_type || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Work Mode</label>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{employee.work_mode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Probation Period</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.probation_period ? `${employee.probation_period} months` : 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Notice Period</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.notice_period ? `${employee.notice_period} days` : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="text-xs text-gray-500 font-medium">Joining Date</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                  
                  {employee.date_of_leaving && (
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Date of Leaving</label>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(employee.date_of_leaving).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Salary Details */}
              {employee.salary && (
                <div className="bg-white rounded-xl border p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#C62828]" />
                    Salary Details
                  </h3>
                  <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-medium opacity-90">Current Salary</p>
                        <p className="text-2xl font-bold">₹{employee.salary}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium opacity-90">Payment Type</p>
                        <p className="text-lg font-bold capitalize">{employee.salary_type || 'monthly'}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs opacity-80">Last updated on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "education" && (
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#C62828]" />
                Educational Qualifications
              </h3>
              
              {employee.highest_qualification || employee.university ? (
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                        <GraduationCap className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{employee.highest_qualification || 'Education'}</p>
                        <p className="text-sm font-medium opacity-90">{employee.university || ''}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {employee.highest_qualification && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="text-xs text-gray-500 font-medium">Highest Qualification</label>
                        <p className="text-sm font-semibold text-gray-900">{employee.highest_qualification}</p>
                      </div>
                    )}
                    {employee.university && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="text-xs text-gray-500 font-medium">University/College</label>
                        <p className="text-sm font-semibold text-gray-900">{employee.university}</p>
                      </div>
                    )}
                    {employee.passing_year && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="text-xs text-gray-500 font-medium">Passing Year</label>
                        <p className="text-sm font-semibold text-gray-900">{employee.passing_year}</p>
                      </div>
                    )}
                    {employee.percentage && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <label className="text-xs text-gray-500 font-medium">Percentage/CGPA</label>
                        <p className="text-sm font-semibold text-gray-900">{employee.percentage}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <School className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-4">No educational information added</p>
                  <button 
                    onClick={() => setShowAddDetailsModal(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C62828] text-white font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    <FileText className="w-4 h-4" />
                    Add Education Details
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Access */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-[#C62828]" />
                  System Access
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Laptop Assigned</p>
                      <p className={`text-sm font-semibold ${employee.laptop_assigned === 'yes' ? 'text-green-600' : 'text-gray-600'}`}>
                        {employee.laptop_assigned === 'yes' ? 'Yes ✓' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">System Login ID</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.system_login_id || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">System Password</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.system_password ? '••••••••' : 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Office Email ID</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.office_email_id || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">Office Email Password</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.office_email_password ? '••••••••' : 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C62828]" />
                  Security Status
                </h3>
                <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Account Status</span>
                      <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Login</span>
                      <span className="text-sm font-semibold">Today, 09:42 AM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Setup</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${employee.office_email_id ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                        {employee.office_email_id ? 'Configured' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-2.5 bg-white/20 text-white font-medium rounded-lg hover:bg-white/30 transition">
                    View Access Logs
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bank Details */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C62828]" />
                  Bank Account
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Bank Name</label>
                    <p className="text-lg font-semibold text-gray-900">{employee.bank_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Account Number</label>
                    <p className="text-lg font-semibold text-gray-900">
                      {employee.bank_account_number || 'Not set'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 font-medium">IFSC Code</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.ifsc_code || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 font-medium">UPI ID</label>
                      <p className="text-sm font-semibold text-gray-900">{employee.upi_id || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-white rounded-xl border p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Summary</h3>
                {employee.bank_name ? (
                  <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl text-white">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xl font-bold">{employee.bank_name}</p>
                        <p className="text-sm opacity-90">Primary Account</p>
                      </div>
                    </div>
                    
                    {employee.bank_account_number && (
                      <div className="bg-white/20 rounded-lg p-4">
                        <p className="text-xs font-medium uppercase mb-2 opacity-70">Account Number</p>
                        <p className="text-lg font-mono font-bold tracking-wider">
                          •••• •••• {employee.bank_account_number.slice(-4)}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-4">No bank details added</p>
                    <button 
                      onClick={() => setShowAddDetailsModal(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C62828] text-white font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      <FileText className="w-4 h-4" />
                      Add Bank Details
                    </button>
                  </div>
                )}
              </div>
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
          onSuccess={() => { loadEmployee(); toast.success("Profile updated successfully!"); }}
        />
      )}

      {showAddDetailsModal && (
        <AddMoreDetailsModal
          isOpen={showAddDetailsModal}
          onClose={() => { setShowAddDetailsModal(false); loadEmployee(); }}
          employeeId={employee.id}
          onSuccess={() => { loadEmployee(); toast.success("Details added successfully!"); }}
        />
      )}
    </div>
  );
}