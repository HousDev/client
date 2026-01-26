import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Target,
} from "lucide-react";
import Input from "../ui/Input";
import { toast } from "sonner";
import companyApi, { Company, CompanyFormData } from "../../lib/companyApi";

interface CompanyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  company?: Company | null;
  mode?: "create" | "edit";
}

const CompanyFormModal: React.FC<CompanyFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  company,
  mode = "create",
}) => {
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const initialCompanyData: CompanyFormData = {
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    latitude: 0,
    longitude: 0,
  };

  const [companyData, setCompanyData] = useState<CompanyFormData>(initialCompanyData);

  useEffect(() => {
    if (company && mode === "edit") {
      setCompanyData({
        name: company.name || "",
        code: company.code || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        city: company.city || "",
        state: company.state || "",
        country: company.country || "",
        latitude: company.latitude || 0,
        longitude: company.longitude || 0,
      });
    } else {
      resetForm();
    }
  }, [company, mode]);

  const resetForm = () => {
    setCompanyData(initialCompanyData);
    setGeoError(null);
  };

  const getCurrentLocation = () => {
    setGeoError(null);
    setGeoLoading(true);

    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser");
      setGeoLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCompanyData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGeoLoading(false);
        toast.success("Location captured successfully");
      },
      (error) => {
        const errorMessages: { [key: number]: string } = {
          1: "Permission denied. Please allow location access",
          2: "Position unavailable. Please try again",
          3: "Request timeout. Please check your connection",
        };
        setGeoError(errorMessages[error.code] || "Failed to get location");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const validateCompanyForm = (): boolean => {
    if (!companyData.name.trim()) {
      toast.error("Company name is required");
      return false;
    }
    if (!companyData.code.trim()) {
      toast.error("Company code is required");
      return false;
    }
    if (companyData.email && !/\S+@\S+\.\S+/.test(companyData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (companyData.phone && companyData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCompanyForm()) return;

    setLoading(true);
    try {
      if (mode === "edit" && company?.id) {
        // Update existing company
        await companyApi.updateCompany(company.id, companyData);
        toast.success("Company updated successfully!");
      } else {
        // Create new company
        await companyApi.createCompany(companyData);
        toast.success("Company created successfully!");
      }
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error("Error saving company:", error);
      toast.error(error.response?.data?.message || "Failed to save company");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {mode === "edit" ? "Edit Company" : "Add New Company"}
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  {mode === "edit" ? "Update company details" : "Create new company profile"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            {/* Company Details Section */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Company Details
                </h3>
                
                {/* Company Name & Code */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#C62828]" />
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <Input
                        type="text"
                        value={companyData.name}
                        onChange={(e) =>
                          setCompanyData({ ...companyData, name: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter company name"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#C62828]" />
                      Company Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <FileText className="w-4 h-4" />
                      </div>
                      <Input
                        type="text"
                        value={companyData.code}
                        onChange={(e) =>
                          setCompanyData({ ...companyData, code: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="e.g., COMP001"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#C62828]" />
                      Email
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        type="email"
                        value={companyData.email}
                        onChange={(e) =>
                          setCompanyData({ ...companyData, email: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="company@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#C62828]" />
                      Phone
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Phone className="w-4 h-4" />
                      </div>
                      <Input
                        type="tel"
                        value={companyData.phone}
                        onChange={(e) => {
                          if (!/^\d*$/.test(e.target.value)) {
                            toast.warning("Only numbers allowed");
                            return;
                          }
                          if (e.target.value.length <= 10) {
                            setCompanyData({
                              ...companyData,
                              phone: e.target.value,
                            });
                          }
                        }}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="10-digit phone number"
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1.5 mb-4">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C62828]" />
                    Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <textarea
                      value={companyData.address}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, address: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[80px] resize-none"
                      placeholder="Full company address"
                    />
                  </div>
                </div>

                {/* City, State, Country */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      City
                    </label>
                    <Input
                      type="text"
                      value={companyData.city}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, city: e.target.value })
                      }
                      className="w-full py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      State
                    </label>
                    <Input
                      type="text"
                      value={companyData.state}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, state: e.target.value })
                      }
                      className="w-full py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="State"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">
                      Country
                    </label>
                    <Input
                      type="text"
                      value={companyData.country}
                      onChange={(e) =>
                        setCompanyData({ ...companyData, country: e.target.value })
                      }
                      className="w-full py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="Country"
                    />
                  </div>
                </div>

                {/* Company Geolocation */}
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                        <Target className="w-4 h-4 text-[#C62828]" />
                      </div>
                      <h3 className="font-semibold text-gray-800">Company Location</h3>
                    </div>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={geoLoading}
                      className="px-4 py-2 text-sm bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-gray-700 flex items-center gap-2 disabled:opacity-50"
                    >
                      {geoLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-400/30 border-t-gray-600 rounded-full animate-spin" />
                          Getting...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4" />
                          Get Location
                        </>
                      )}
                    </button>
                  </div>

                  {geoError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg mb-4">
                      {geoError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Latitude
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={companyData.latitude}
                        onChange={(e) =>
                          setCompanyData({
                            ...companyData,
                            latitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-700">
                        Longitude
                      </label>
                      <Input
                        type="number"
                        step="0.000001"
                        value={companyData.longitude}
                        onChange={(e) =>
                          setCompanyData({
                            ...companyData,
                            longitude: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === "edit" ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    {mode === "edit" ? "Update Company" : "Create Company"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyFormModal;