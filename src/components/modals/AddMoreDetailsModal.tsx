// components/modals/AddMoreDetailsModal.tsx
import { useState, useEffect } from "react";
import { Save, X, Heart, Home, GraduationCap, Briefcase, Laptop, CreditCard } from "lucide-react";
import { toast } from "sonner";
import employeeAPI from "../../lib/employeeApi";

interface AddMoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  onSuccess: () => void;
}

export default function AddMoreDetailsModal({
  isOpen,
  onClose,
  employeeId,
  onSuccess,
}: AddMoreDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
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

  const loadEmployee = async () => {
    try {
      const data: any = await employeeAPI.getEmployee(employeeId);
      
      setFormData({
        blood_group: data.blood_group || "",
        date_of_birth: data.date_of_birth || "",
        marital_status: data.marital_status || "",
        emergency_contact: data.emergency_contact || "",
        nationality: data.nationality || "Indian",
        current_address: data.current_address || "",
        permanent_address: data.permanent_address || "",
        city: data.city || "",
        state: data.state || "",
        pincode: data.pincode || "",
        same_as_permanent: data.same_as_permanent || false,
        aadhar_number: data.aadhar_number || "",
        pan_number: data.pan_number || "",
        highest_qualification: data.highest_qualification || "",
        university: data.university || "",
        passing_year: data.passing_year || "",
        percentage: data.percentage || "",
        employee_type: data.employee_type || "permanent",
        branch: data.branch || "",
        probation_period: data.probation_period || "",
        work_mode: data.work_mode || "office",
        job_title: data.job_title || "",
        notice_period: data.notice_period || "30",
        laptop_assigned: data.laptop_assigned || "no",
        system_login_id: data.system_login_id || "",
        system_password: data.system_password || "",
        office_email_id: data.office_email_id || "",
        office_email_password: data.office_email_password || "",
        bank_account_number: data.bank_account_number || "",
        bank_name: data.bank_name || "",
        ifsc_code: data.ifsc_code || "",
        upi_id: data.upi_id || "",
      });
    } catch (err) {
      console.log(err);
      toast.error("Failed to load employee details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      setLoading(true);
      loadEmployee();
    }
  }, [isOpen, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataObj = new FormData();
      
      // Append all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value || value === false || value === 0) {
          formDataObj.append(key, value.toString());
        }
      });

      await employeeAPI.updateEmployee(employeeId, formDataObj);
      toast.success("Additional details saved successfully!");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error saving details:", error);
      toast.error(error.message || "Failed to save details");
    } finally {
      setSaving(false);
    }
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

  if (!isOpen) return null;

if (loading) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-xl shadow-2xl p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    </div>
  );
}

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Backdrop with blur */}
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    />
    
    {/* Modal Content */}
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-auto border border-gray-200 flex flex-col">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-3 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/20 rounded-lg">
            <Save className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Additional Details</h2>
            <p className="text-sm text-white/90">Add or edit employee details (Optional)</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded-lg p-1.5 transition"
        >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-6">
              
              {/* Personal Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Personal Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Blood Group */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Blood Group
                    </label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                    />
                    {formData.date_of_birth && (
                      <p className="text-xs text-gray-500 mt-1">
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="ABCDE1234F"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>

              {/* Address Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4 text-blue-500" />
                  Address Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {/* Current Address */}
                  <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Current Address
                    </label>
                    <textarea
                      value={formData.current_address}
                      onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Full current address"
                      rows={3}
                    />
                  </div>
                </div>
                
                {/* Checkbox for same as permanent address */}
                <div className="mb-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.same_as_permanent}
                      onChange={handleSameAsPermanentChange}
                      className="w-4 h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Current address same as permanent address
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Permanent Address */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Permanent Address
                    </label>
                    <textarea
                      value={formData.permanent_address}
                      onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Full permanent address"
                      rows={3}
                      disabled={formData.same_as_permanent}
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      disabled={formData.same_as_permanent}
                    />
                  </div>
                </div>
              </div>

              {/* Educational Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-green-500" />
                  Educational Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Highest Qualification */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Highest Qualification
                    </label>
                    <select
                      value={formData.highest_qualification}
                      onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      University/College
                    </label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="e.g. 85.5"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-500" />
                  Employment Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Employee Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Employee Type
                    </label>
                    <select
                      value={formData.employee_type}
                      onChange={(e) => setFormData({ ...formData, employee_type: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
                    >
                      <option value="15">15 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* System Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-yellow-500" />
                  System Details
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Laptop Assigned */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Laptop Assigned
                    </label>
                    <select
                      value={formData.laptop_assigned}
                      onChange={(e) => setFormData({ ...formData, laptop_assigned: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none bg-white"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="Email password"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="p-4 border border-gray-200 rounded-lg bg-white">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-500" />
                  Bank Details
                </h3>
                
                <div className="mb-6">
                  <h5 className="text-xs font-semibold text-gray-700 mb-3">Account Details</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Bank Name */}
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
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
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                        placeholder="IFSC code"
                      />
                    </div>
                  </div>
                </div>

                {/* UPI Details */}
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-3">UPI Details (Optional)</h5>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      UPI ID
                    </label>
                    <input
                      type="text"
                      value={formData.upi_id}
                      onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-1 focus:ring-[#C62828] outline-none"
                      placeholder="upi@bank"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="border-t p-4 bg-gray-50 flex gap-3 flex-shrink-0">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#C62828] text-white py-3 px-4 rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Details
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}