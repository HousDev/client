import { useState, useEffect } from 'react';
import { X, Plus, Trash2, MapPin } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AttendanceLocation {
  id: string;
  name: string;
  location_type: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  is_active: boolean;
}

interface ManageLocationsModalProps {
  branchId: string;
  branchName: string;
  onClose: () => void;
}

export default function ManageLocationsModal({ branchId, branchName, onClose }: ManageLocationsModalProps) {
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<AttendanceLocation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location_type: 'punch_point',
    latitude: 0,
    longitude: 0,
    geofence_radius_meters: 500,
  });

  useEffect(() => {
    loadLocations();
  }, [branchId]);

  const loadLocations = async () => {
    try {
      setLocations([]);
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const getLocation = async () => {
    setGeoError(null);
    setLoading(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported');
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
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } catch (error: any) {
      setGeoError(error.message);
      setLoading(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.latitude === 0 && formData.longitude === 0) {
        throw new Error('Please get location coordinates');
      }

      alert('Location management requires backend API integration');
      setFormData({
        name: '',
        location_type: 'punch_point',
        latitude: 0,
        longitude: 0,
        geofence_radius_meters: 500,
      });
      setShowForm(false);
      loadLocations();
    } catch (error: any) {
      console.error('Error adding location:', error);
      alert(error.message || 'Failed to add location');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this attendance location?')) return;

    try {
      alert('Location deletion requires backend API integration');
      loadLocations();
    } catch (error: any) {
      console.error('Error deleting location:', error);
      alert(error.message || 'Failed to delete location');
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Attendance Locations</h2>
            <p className="text-sm text-slate-600 mt-1">{branchName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {locations.length === 0 && !showForm && (
            <p className="text-center text-slate-600 py-8">No attendance locations created yet</p>
          )}

          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <h3 className="font-semibold text-slate-900">{location.name}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                      <p>Type: {location.location_type}</p>
                      <p>Radius: {location.geofence_radius_meters}m</p>
                      <p>Lat: {location.latitude.toFixed(4)}</p>
                      <p>Lon: {location.longitude.toFixed(4)}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <form onSubmit={handleAddLocation} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Main Gate, Reception"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Location Type</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.location_type}
                  onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                >
                  <option value="punch_point">Punch Point</option>
                  <option value="entrance">Entrance</option>
                  <option value="exit">Exit</option>
                  <option value="reception">Reception</option>
                </select>
              </div>

              {geoError && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{geoError}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="Latitude"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                  <Input
                    type="number"
                    step="0.00001"
                    placeholder="Longitude"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Geofence Radius (meters)</label>
                <Input
                  type="number"
                  min="50"
                  step="50"
                  value={formData.geofence_radius_meters}
                  onChange={(e) => setFormData({ ...formData, geofence_radius_meters: parseInt(e.target.value) })}
                />
              </div>

              <Button type="button" variant="secondary" onClick={getLocation} disabled={loading} className="w-full">
                <MapPin className="h-4 w-4 mr-2" />
                Get Current Location
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowForm(false)}
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding...' : 'Add Location'}
                </Button>
              </div>
            </form>
          )}

          {!showForm && (
            <Button onClick={() => setShowForm(true)} className="w-full" variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance Location
            </Button>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
