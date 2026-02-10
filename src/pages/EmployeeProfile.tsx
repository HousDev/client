import { useState, useEffect } from "react";
import {
  ArrowLeft, User, Mail, Phone, Briefcase, Building, MapPin,
  Calendar, Heart, Home, GraduationCap, CreditCard,
  Laptop, Edit, FileText, IdCard,
  Smartphone, Award, School, Clock, CheckCircle,
  XCircle, Download, Share2, Wallet, Lock,
  Star, Building2, Globe, ChevronRight, ExternalLink,
  Menu, X, MoreVertical, ChevronDown
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
  const [showMobileTabs, setShowMobileTabs] = useState(false);

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
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${bg} ${text}`}>
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

  const activeTabData = tabs.find(tab => tab.id === activeTab);

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
      {/* Mobile Header */}
      <div className="md:hidden sticky top-16 z-50 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-700 hover:text-[#C62828] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowEditModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900"
              >
                <Edit className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowMobileTabs(!showMobileTabs)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                {activeTabData && <activeTabData.icon className="w-4 h-4" />}
                <span className="text-sm font-medium capitalize">{activeTab}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showMobileTabs ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Mobile Tabs Dropdown */}
          {showMobileTabs && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg py-2 z-50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileTabs(false);
                    }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-[#C62828]/10 text-[#C62828]' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && <CheckCircle className="w-4 h-4 ml-auto text-[#C62828]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Header - UNCHANGED */}
      <div className="hidden md:block sticky top-16 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={onBack}
                className="flex items-center gap-1 md:gap-2 text-gray-700 hover:text-[#C62828] transition-colors p-1 md:p-0"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium hidden sm:inline">Employees</span>
                <span className="text-xs md:text-sm font-medium sm:hidden">Back</span>
              </button>
              <div className="h-4 md:h-6 w-px bg-gray-300 hidden md:block" />
              <span className="text-xs md:text-sm text-gray-500 hidden md:inline">Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        {/* Mobile Profile Header */}
        <div className="md:hidden bg-white rounded-xl shadow-lg border overflow-hidden mb-4">
          <div className="relative h-24 bg-gradient-to-r from-[#40423f] to-[#5a5d5a]" />
          
          <div className="px-4 pb-6">
            <div className="flex flex-col items-center -mt-12">
              {/* Avatar */}
              <div className="relative mb-4">
                <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-lg overflow-hidden">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-2xl font-bold">{employeeInitials}</span>
                  )}
                </div>
                <div className="absolute -bottom-1 right-2">
                  <StatusBadge status={employee.employee_status || 'active'} />
                </div>
              </div>

              {/* Name and Title */}
              <div className="text-center mb-4">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {employee.first_name} {employee.last_name}
                </h1>
                <p className="text-sm text-gray-600 font-medium">{employee.designation || 'No designation'}</p>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <IdCard className="w-3 h-3" />
                  {employee.employee_code || 'No ID'}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  <Building className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">
                    {employee.department_name || 'No dept'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  {getTenure(employee.joining_date)}
                </div>
              </div>

              {/* Add Details Button */}
              <button 
                onClick={() => setShowAddDetailsModal(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                <FileText className="w-4 h-4" />
                Add More Details
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Profile Header - UNCHANGED */}
        <div className="hidden md:block bg-white rounded-xl md:rounded-2xl shadow-lg border overflow-hidden mb-4 md:mb-6">
          <div className="relative h-24 md:h-40 bg-gradient-to-r from-[#40423f] to-[#5a5d5a]" />
          
          <div className="px-3 sm:px-4 md:px-6 pb-4 md:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-6 -mt-12 md:-mt-20">
              <div className="relative">
                <div className="relative w-24 h-24 md:w-40 md:h-40 rounded-full bg-gradient-to-r from-[#40423f] to-[#5a5d5a] flex items-center justify-center text-white border-4 border-white shadow-lg md:shadow-2xl overflow-hidden">
                  {profileImageUrl && !imageError ? (
                    <img
                      src={profileImageUrl}
                      alt={`${employee.first_name} ${employee.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <span className="text-2xl md:text-4xl font-bold">{employeeInitials}</span>
                  )}
                </div>
              </div>

              <div className="flex-1 mt-2 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 md:gap-4">
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </h1>
                      <StatusBadge status={employee.employee_status || 'active'} />
                    </div>
                    
                    <div className="space-y-1 md:space-y-2">
                      <p className="text-base md:text-lg lg:text-lg text-gray-700 font-medium">{employee.designation || 'No designation'}</p>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm">
                          <IdCard className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {employee.employee_code || 'No ID'}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs md:text-sm">
                          <Building className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          <span className="truncate max-w-[100px] md:max-w-none">
                            {employee.department_name || 'No dept'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 bg-green-100 text-green-700 rounded-full text-xs md:text-sm">
                          <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          {getTenure(employee.joining_date)}
                        </div>
                      </div>
                    </div>
                     <div className="hidden md:flex items-end gap-2">
              <button 
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => setShowAddDetailsModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Add Details</span>
              </button>
            </div>
                  </div>

                  <div className="flex flex-row sm:hidden gap-2 w-full mt-3">
                    <button 
                      onClick={() => setShowEditModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button 
                      onClick={() => setShowAddDetailsModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Contact Cards */}
        <div className="md:hidden grid grid-cols-2 gap-2 mb-4">
          <a 
            href={`mailto:${employee.email}`}
            className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:bg-blue-50 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{employee.email || 'N/A'}</p>
            </div>
          </a>
          
          <a 
            href={`tel:${employee.phone}`}
            className="bg-white rounded-lg border p-3 flex items-center gap-3 hover:bg-green-50 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm font-semibold text-gray-900 truncate">{employee.phone || 'N/A'}</p>
            </div>
          </a>
        </div>

        {/* Desktop Quick Stats - UNCHANGED */}
        <div className="hidden md:grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6">
          {[
            { icon: Mail, label: "Email", value: employee.email, color: "bg-blue-500" },
            { icon: Phone, label: "Phone", value: employee.phone, color: "bg-green-500" },
            { icon: Briefcase, label: "Role", value: employee.role_name, color: "bg-purple-500" },
            { icon: MapPin, label: "Company", value: employee.company_name, color: "bg-amber-500" }
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-lg md:rounded-xl border p-2 md:p-3 lg:p-4 shadow-sm">
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`p-1.5 md:p-2 lg:p-2.5 ${item.color} rounded-lg`}>
                  <item.icon className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] md:text-xs text-gray-500 font-medium truncate">{item.label}</p>
                  <p className="text-xs md:text-sm font-semibold text-gray-900 truncate">{item.value || 'N/A'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Tabs - UNCHANGED */}
        <div className="hidden md:block mb-6">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="flex overflow-x-auto px-4 py-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2 md:py-3 text-xs md:text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                      isActive 
                        ? 'border-[#C62828] text-[#C62828]' 
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Tab Content */}
        <div className="md:hidden">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {/* Personal Details */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C62828]" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Gender</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{employee.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Age</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.date_of_birth ? `${calculateAge(employee.date_of_birth)} years` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Blood Group</p>
                    <p className="text-sm font-semibold text-gray-900">{employee.blood_group || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Marital Status</p>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{employee.marital_status || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Employment */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#C62828]" />
                  Employment
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Department</p>
                    <p className="text-sm font-semibold text-gray-900">{employee.department_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Role</p>
                    <p className="text-sm font-semibold text-gray-900">{employee.role_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              {employee.current_address && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#C62828]" />
                    Current Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-900">{employee.current_address}</p>
                    {(employee.city || employee.state) && (
                      <p className="text-xs text-gray-600 mt-1">
                        {employee.city && `${employee.city}, `}
                        {employee.state}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "personal" && (
            <div className="space-y-4">
              {/* Identification */}
              {(employee.aadhar_number || employee.pan_number) && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <IdCard className="w-5 h-5 text-[#C62828]" />
                    Identification
                  </h3>
                  <div className="space-y-3">
                    {employee.aadhar_number && (
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-700 font-medium mb-1">Aadhar Number</p>
                        <p className="text-base font-semibold text-blue-900">{employee.aadhar_number}</p>
                      </div>
                    )}
                    {employee.pan_number && (
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-700 font-medium mb-1">PAN Number</p>
                        <p className="text-base font-semibold text-green-900">{employee.pan_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {employee.emergency_contact && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-[#C62828]" />
                    Emergency Contact
                  </h3>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-700 font-medium mb-1">Emergency Number</p>
                    <p className="text-base font-semibold text-red-900">{employee.emergency_contact}</p>
                    {employee.emergency_contact_name && (
                      <p className="text-xs text-red-700 mt-2">
                        {employee.emergency_contact_name} ({employee.emergency_contact_relationship})
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "employment" && (
            <div className="space-y-4">
              {/* Employment Details */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#C62828]" />
                  Employment Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Employee Type</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{employee.employee_type || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Work Mode</p>
                      <p className="text-sm font-semibold text-gray-900 capitalize">{employee.work_mode || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 mb-1">Joining Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary */}
              {employee.salary && (
                <div className="bg-white rounded-xl border p-4">
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-[#C62828]" />
                    Salary Details
                  </h3>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white">
                    <p className="text-sm font-medium opacity-90 mb-1">Current Salary</p>
                    <p className="text-2xl font-bold">₹{employee.salary}</p>
                    <p className="text-xs opacity-80 mt-2">{employee.salary_type || 'Monthly'}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "education" && (
            <div className="bg-white rounded-xl border p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#C62828]" />
                Education
              </h3>
              
              {employee.highest_qualification ? (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-lg font-bold">{employee.highest_qualification}</p>
                        <p className="text-xs font-medium opacity-90 truncate">{employee.university || ''}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {employee.passing_year && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Passing Year</p>
                        <p className="text-sm font-semibold text-gray-900">{employee.passing_year}</p>
                      </div>
                    )}
                    {employee.percentage && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500">Percentage</p>
                        <p className="text-sm font-semibold text-gray-900">{employee.percentage}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <School className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-4">No education details</p>
                  <button 
                    onClick={() => setShowAddDetailsModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                  >
                    <FileText className="w-4 h-4" />
                    Add Education
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "system" && (
            <div className="space-y-4">
              {/* System Access */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-[#C62828]" />
                  System Access
                </h3>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-700">Laptop Assigned</p>
                      <p className={`text-sm font-semibold ${employee.laptop_assigned === 'yes' ? 'text-green-600' : 'text-gray-600'}`}>
                        {employee.laptop_assigned === 'yes' ? 'Yes ✓' : 'No'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">System Login ID</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{employee.system_login_id || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Office Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{employee.office_email_id || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-[#C62828]" />
                  Security Status
                </h3>
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-4 text-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Account Status</span>
                      <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-xs font-bold">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Setup</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${employee.office_email_id ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                        {employee.office_email_id ? 'Configured' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bank" && (
            <div className="space-y-4">
              {/* Bank Details */}
              <div className="bg-white rounded-xl border p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#C62828]" />
                  Bank Details
                </h3>
                {employee.bank_name ? (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-4 text-white">
                      <p className="text-lg font-bold mb-2">{employee.bank_name}</p>
                      {employee.bank_account_number && (
                        <div className="bg-white/20 rounded-lg p-3">
                          <p className="text-xs font-medium uppercase mb-1 opacity-70">Account Number</p>
                          <p className="text-sm font-mono font-bold tracking-wider truncate">
                            •••• •••• {employee.bank_account_number.slice(-4)}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {employee.ifsc_code && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">IFSC Code</p>
                          <p className="text-sm font-semibold text-gray-900">{employee.ifsc_code}</p>
                        </div>
                      )}
                      {employee.upi_id && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">UPI ID</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">{employee.upi_id}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium mb-4">No bank details</p>
                    <button 
                      onClick={() => setShowAddDetailsModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
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

        {/* Desktop Tab Content - UNCHANGED */}
        <div className="hidden md:block space-y-4 md:space-y-6">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
              {/* Contact Information */}
              <div className="bg-white rounded-lg md:rounded-xl border p-3 md:p-4 lg:p-6 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]" />
                  Contact Information
                </h3>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium">Email</label>
                    <p className="text-sm font-semibold text-gray-900 break-words">{employee.email || 'N/A'}</p>
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
              <div className="bg-white rounded-lg md:rounded-xl border p-3 md:p-4 lg:p-6 shadow-sm">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]" />
                  Personal Details
                </h3>
                <div className="grid grid-cols-2 gap-2 md:gap-3 lg:gap-4">
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
                <div className="bg-white rounded-lg md:rounded-xl border p-3 md:p-4 lg:p-6 shadow-sm">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]" />
                    Allotted Projects
                  </h3>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {allottedProjects.map((projectId: number) => (
                      <span key={projectId} className="px-2 md:px-3 py-1 md:py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs md:text-sm font-medium">
                        Project #{projectId}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Address Details */}
              {(employee.current_address || employee.permanent_address) && (
                <div className="bg-white rounded-lg md:rounded-xl border p-3 md:p-4 lg:p-6 shadow-sm lg:col-span-2">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
                    <Home className="w-4 h-4 md:w-5 md:h-5 text-[#C62828]" />
                    Address Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 lg:gap-6">
                    {employee.current_address && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Current Address</h4>
                        <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900 break-words">{employee.current_address}</p>
                          {(employee.city || employee.state || employee.pincode) && (
                            <p className="text-sm text-gray-600 mt-1 md:mt-2 break-words">
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
                        <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900 break-words">{employee.permanent_address}</p>
                          {(employee.city || employee.state || employee.pincode) && !employee.same_as_permanent && (
                            <p className="text-sm text-gray-600 mt-1 md:mt-2 break-words">
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

          {/* Rest of the desktop tab content remains exactly the same */}
          {/* ... other desktop tab content ... */}
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