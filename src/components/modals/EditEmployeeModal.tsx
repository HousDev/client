import { useState, useEffect, useRef } from "react";
import { X, Upload, User, Mail, Phone, Briefcase, Building, MapPin, Calendar, Users, Save } from "lucide-react";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";
import rolesApi from "../../lib/rolesApi";
import { departmentsApi } from "../../lib/departmentApi";
import employeeAPI from "../../lib/employeeApi";

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess: () => void;
}

export default function EditEmployeeModal({
  isOpen,
  onClose,
  employeeId,
  onSuccess,
}: EditEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role_id: "",
    department_id: "",
    designation: "",
    joining_date: "",
    gender: "male",
    allotted_project: "",
    office_location: "",
    attendence_location: "",
  });

  const loadEmployee = async () => {
    try {
      const data: any = await employeeAPI.getEmployee(employeeId);
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        role_id: data.role_id?.toString() || "",
        department_id: data.department_id?.toString() || "",
        designation: data.designation || "",
        joining_date: data.joining_date ? new Date(data.joining_date).toISOString().split("T")[0] : "",
        gender: data.gender || "male",
        allotted_project: data.allotted_project?.toString() || "",
        office_location: data.office_location || "",
        attendence_location: data.attendence_location || "",
      });
      
      if (data.profile_picture) {
        setExistingImage(data.profile_picture);
      }
    } catch (err) {
      console.log(err);
      toast.error("Failed to load employee data");
    }
  };

  const loadProjects = async () => {
    try {
      const data: any = await projectApi.getProjects();
      setProjects(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load projects");
    }
  };

  const loadRoles = async () => {
    try {
      const data: any = await rolesApi.getAllRoles();
      setRoles(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load roles");
    }
  };
  
  const loadDepartments = async () => {
    try {
      const data: any = await departmentsApi.getAll();
      setDepartments(data.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load departments");
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEmployee();
      loadProjects();
      loadRoles();
      loadDepartments();
    }
  }, [isOpen, employeeId]);

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
    setExistingImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataObj = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value) {
          formDataObj.append(key, value.toString());
        }
      });

      if (profilePicture) {
        formDataObj.append('profile_picture', profilePicture);
      }

      await employeeAPI.updateEmployee(employeeId, formDataObj);

      toast.success("Employee updated successfully!");
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error updating employee:", error);
      toast.error(error.message || "Failed to update employee");
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

  if (!isOpen) return null;

  const displayImage = previewUrl || (existingImage ? `${import.meta.env.VITE_API_URL || 'http://localhost:4000'}${existingImage}` : null);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl border border-gray-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Edit Employee</h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">Update employee details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-5">
              
              {/* Profile Picture Section */}
              <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-[#C62828] transition-all duration-200 bg-gray-50/50">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mx-auto mb-3 overflow-hidden border-4 border-white shadow-lg">
                    {displayImage ? (
                      <img 
                        src={displayImage} 
                        alt="Profile Preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-gray-500" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {displayImage ? "Profile Picture" : "Upload Profile Picture"}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">JPG, PNG or WebP (Max 5MB)</p>
                  <div className="flex gap-2 justify-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      id="profile-upload-edit"
                    />
                    <label
                      htmlFor="profile-upload-edit"
                      className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] transition-all duration-200 font-medium text-sm flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      {displayImage ? "Change" : "Upload"}
                    </label>
                    {displayImage && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* First Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#C62828]" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#C62828]" />
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#C62828]" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="email@company.com"
                    required
                  />
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#C62828]" />
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handleMobileChange}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#C62828]" />
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                    required
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#C62828]" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#C62828]" />
                    Designation <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="e.g. Software Engineer"
                    required
                  />
                </div>

                {/* Date of Joining */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                    Date of Joining <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#C62828]" />
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Allotted Project */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#C62828]" />
                    Allotted Project
                  </label>
                  <select
                    value={formData.allotted_project}
                    onChange={(e) => setFormData({ ...formData, allotted_project: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>

                {/* Office Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                    Office Location
                  </label>
                  <input
                    type="text"
                    value={formData.office_location}
                    onChange={(e) => setFormData({ ...formData, office_location: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="e.g. Mumbai Office"
                  />
                </div>

                {/* Attendance Location */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                    Attendance Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.attendence_location}
                    onChange={(e) => setFormData({ ...formData, attendence_location: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 bg-white"
                    placeholder="e.g. Head Office, Branch A"
                    required
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t p-5 flex gap-3 bg-gray-50/50">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {loading ? "Updating..." : "Update Employee"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}