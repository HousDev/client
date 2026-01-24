import { useState } from "react";
import { X, MapPin } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { toast } from "sonner";

interface CreateBranchModalProps {
  onClose: () => void;
  onSuccess: () => void;
  companyId?: string;
}

export default function CreateBranchModal({
  onClose,
  onSuccess,
  companyId,
}: CreateBranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
  });

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
        },
        (error) => {
          setGeoError(`Geolocation error: ${error.message}`);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } catch (error: any) {
      setGeoError(error.message);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.latitude === 0 && formData.longitude === 0) {
        throw new Error("Please get location coordinates");
      }

      alert("Branch creation requires backend API integration");
      onSuccess();
    } catch (error: any) {
      console.error("Error creating branch:", error);
      alert(error.message || "Failed to create branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">
            Create New Branch
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Branch Name *
              </label>
              <Input
                type="text"
                placeholder="e.g., Mumbai Office"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                City
              </label>
              <Input
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                State
              </label>
              <Input
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Country
              </label>
              <Input
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Address *
              </label>
              <Input
                type="text"
                placeholder="Full address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pincode
              </label>
              <Input
                type="text"
                placeholder="Pincode"
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Email
              </label>
              <Input
                type="email"
                placeholder="Email"
                value={formData.contact_email}
                onChange={(e) =>
                  setFormData({ ...formData, contact_email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Phone
              </label>
              <Input
                type="tel"
                placeholder="Phone"
                value={formData.contact_phone}
                onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) {
                    toast.warning("Enter Valid Phone Number.");
                    return;
                  }
                  if (e.target.value.length > 10) {
                    toast.warning("Mobile number must be 10 digit.");
                    return;
                  }
                  setFormData({ ...formData, contact_phone: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Coordinates
            </h3>

            {geoError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
                {geoError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      latitude: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="0.00001"
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      longitude: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Geofence Radius (meters)
                </label>
                <Input
                  type="number"
                  min="100"
                  step="100"
                  value={formData.geofence_radius_meters}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      geofence_radius_meters: parseInt(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={getLocation}
              disabled={loading}
              className="mt-4 w-full"
            >
              <MapPin className="h-4 w-4 mr-2" />
              {loading ? "Getting Location..." : "Get Current Location"}
            </Button>
          </div>

          <div className="flex gap-3 justify-end border-t border-slate-200 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Branch"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
