import { useState, useEffect } from "react";
import { X, MapPin, Save, CheckCircle, XCircle } from "lucide-react";
import Input from "../ui/Input";
import { toast } from "sonner";
import companyApi, { BranchFormData } from "../../lib/companyApi";

interface CreateBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  companyId?: string;
  branch?: any;
  mode?: "create" | "edit";
}

export default function CreateBranchModal({
  isOpen,
  onClose,
  onSuccess,
  companyId,
  branch,
  mode = "create",
}: CreateBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formData, setFormData] = useState<
    BranchFormData & { is_active: boolean }
  >({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    latitude: 0,
    longitude: 0,
    geofence_radius_meters: 1000,
    contact_email: "",
    contact_phone: "",
    is_active: true,
  });

  // Initialize form data if editing - useEffect का use करें
  useEffect(() => {
    if (branch && mode === "edit") {
      setFormData({
        name: branch.name || "",
        address: branch.address || "",
        city: branch.city || "",
        state: branch.state || "",
        country: branch.country || "",
        pincode: branch.pincode || "",
        latitude: branch.latitude || 0,
        longitude: branch.longitude || 0,
        geofence_radius_meters: branch.geofence_radius_meters || 1000,
        contact_email: branch.contact_email || "",
        contact_phone: branch.contact_phone || "",
        is_active: branch.is_active !== false,
      });
    } else {
      setFormData({
        name: "",
        address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        latitude: 0,
        longitude: 0,
        geofence_radius_meters: 1000,
        contact_email: "",
        contact_phone: "",
        is_active: true,
      });
    }
  }, [branch, mode]);

  const getLocation = async () => {
    setGeoError(null);
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setLoading(false);
          toast.success("Location captured successfully");
        },
        (error) => {
          const errorMessages: { [key: number]: string } = {
            1: "Permission denied. Please allow location access",
            2: "Position unavailable. Please try again",
            3: "Request timeout. Please check your connection",
          };
          setGeoError(errorMessages[error.code] || "Failed to get location");
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } catch (error: any) {
      setGeoError(error.message);
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("Branch name is required");
      return false;
    }
    if (!formData.address.trim()) {
      toast.error("Address is required");
      return false;
    }
    if (formData.latitude === 0 && formData.longitude === 0) {
      toast.error("Please get location coordinates");
      return false;
    }
    if (
      formData.contact_email &&
      !/\S+@\S+\.\S+/.test(formData.contact_email)
    ) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (formData.contact_phone && formData.contact_phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!companyId && mode === "create") {
      toast.error("Company ID is required to create a branch");
      return;
    }

    setLoading(true);

    try {
      if (mode === "edit" && branch?.id) {
        // Update existing branch
        await companyApi.updateOfficeLocation(branch.id, formData);
        toast.success("Branch updated successfully!");
      } else if (mode === "create" && companyId) {
        // Create new branch
        await companyApi.createOfficeLocation(companyId, formData);
        toast.success("Branch created successfully!");
      }

      onSuccess();
      resetForm();
    } catch (error: any) {
      console.error("Error saving branch:", error);
      toast.error(error.response?.data?.message || "Failed to save branch");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      latitude: 0,
      longitude: 0,
      geofence_radius_meters: 1000,
      contact_email: "",
      contact_phone: "",
      is_active: true,
    });
    setGeoError(null);
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
          <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {mode === "edit" ? "Edit Branch" : "Create New Branch"}
                </h2>
                <p className="text-xs text-white/90 font-medium mt-0.5 hidden sm:block">
                  {mode === "edit"
                    ? "Update branch details"
                    : "Add a new branch for your company"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto"
          >
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Branch Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Mumbai Office"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Contact Email
                  </label>
                  <Input
                    type="email"
                    placeholder="Email"
                    value={formData.contact_email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contact_email: e.target.value,
                      })
                    }
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    placeholder="Phone"
                    value={formData.contact_phone}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        return;
                      }
                      if (e.target.value.length <= 10) {
                        setFormData({
                          ...formData,
                          contact_phone: e.target.value,
                        });
                      }
                    }}
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Pincode
                  </label>
                  <Input
                    type="text"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        return;
                      }

                      setFormData({ ...formData, pincode: e.target.value });
                    }}
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[70px] sm:min-h-[80px] resize-none"
                  placeholder="Full branch address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    City
                  </label>
                  <Input
                    type="text"
                    placeholder="City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    State
                  </label>
                  <Input
                    type="text"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Country
                  </label>
                  <Input
                    type="text"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              {/* Status Toggle - Checkbox Style */}
              <div className="flex items-center p-3 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl">
                <div className="flex items-center h-5">
                  <input
                    id="branch-status"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#C62828] bg-gray-100 border-gray-300 rounded focus:ring-[#C62828] focus:ring-2"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="branch-status"
                    className="font-medium text-gray-900"
                  >
                    Active Branch
                  </label>
                  <p className="text-gray-500">
                    {formData.is_active
                      ? "This branch is currently active and visible"
                      : "This branch is currently inactive and hidden"}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 sm:pt-6">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[#C62828]" />
                  Location Coordinates
                </h3>

                {geoError && (
                  <div className="p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-3 sm:mb-4">
                    {geoError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Latitude *
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="Latitude"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          latitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">
                      Longitude *
                    </label>
                    <Input
                      type="number"
                      step="0.000001"
                      placeholder="Longitude"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          longitude: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full py-2 sm:py-2.5 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={getLocation}
                  disabled={loading}
                  className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-gray-100 to-gray-50 border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  {loading ? "Getting Location..." : "Get Current Location"}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm border-2 border-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 sm:px-6 py-2.5 sm:py-3 text-sm bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {mode === "edit" ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>
                      {mode === "edit" ? "Update Branch" : "Create Branch"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
