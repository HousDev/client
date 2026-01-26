import { X, Mail, Phone, MapPin, RefreshCw, Trash2, CheckCircle, Edit, XCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import Button from '../ui/Button';
import { OfficeLocation } from '../../lib/companyApi';
import { toast } from 'sonner';
import MySwal from "../../utils/swal";

interface ViewBranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  locations: OfficeLocation[];
  loading: boolean;
  onRefresh: () => void;
  onDeleteLocation: (locationId: string) => void;
  onAddBranch: () => void;
  onEditBranch: (location: OfficeLocation) => void;
  onToggleStatus: (locationId: string, currentStatus: boolean) => void;
}

export default function ViewBranchModal({
  isOpen,
  onClose,
  companyName,
  locations,
  loading,
  onRefresh,
  onDeleteLocation,
  onAddBranch,
  onEditBranch,
  onToggleStatus,
}: ViewBranchModalProps) {
  if (!isOpen) return null;

  const handleDelete = async (locationId: string, locationName: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Branch?",
      text: `Are you sure you want to delete "${locationName}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;
    
    onDeleteLocation(locationId);
  };

  const handleToggleStatus = async (locationId: string, currentStatus: boolean, locationName: string) => {
    const result: any = await MySwal.fire({
      title: `${currentStatus ? 'Deactivate' : 'Activate'} Branch?`,
      text: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} "${locationName}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: currentStatus ? "#f59e0b" : "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: currentStatus ? "Deactivate" : "Activate",
    });

    if (!result.isConfirmed) return;
    
    onToggleStatus(locationId, currentStatus);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 sm:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">{companyName} - Branches</h2>
                <p className="text-xs text-white/90 font-medium mt-0.5 hidden sm:block">
                  {locations.length} branch{locations.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="text-white hover:bg-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200 flex items-center gap-1"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-[#C62828]/20 border-t-[#C62828] rounded-full animate-spin mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base text-gray-600 font-medium">Loading branches...</p>
              </div>
            ) : locations.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                </div>
                <p className="text-base sm:text-lg font-semibold text-gray-700">No branches yet</p>
                <p className="text-sm text-gray-500 mt-1">Create the first branch for this company</p>
                <Button
                  onClick={onAddBranch}
                  className="mt-3 sm:mt-4 bg-gradient-to-r from-[#C62828] to-red-600"
                >
                  Create Branch
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className={`bg-white border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all ${
                        location.is_active 
                          ? 'border-green-200 hover:border-green-300' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            location.is_active ? 'bg-green-100' : 'bg-gray-100'
                          }`}>
                            {location.is_active ? (
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{location.name}</h3>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                location.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {location.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">ID: {String(location.id).substring(0, 8)}...</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {/* Status Toggle */}
                          <button
                            onClick={() => handleToggleStatus(String(location.id), location.is_active, location.name)}
                            className={`p-1.5 rounded-full ${
                              location.is_active 
                                ? 'bg-green-100 hover:bg-green-200 text-green-700' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                            }`}
                            title={location.is_active ? "Active - Click to deactivate" : "Inactive - Click to activate"}
                          >
                            {location.is_active ? (
                              <ToggleRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                              <ToggleLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                          </button>
                          
                          <button
                            onClick={() => onEditBranch(location)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Branch"
                          >
                            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(String(location.id), location.name)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 sm:space-y-2 text-sm">
                        <p className="text-gray-700">{location.address}</p>
                        {location.city || location.state || location.country ? (
                          <p className="text-gray-600">
                            {[location.city, location.state, location.country].filter(Boolean).join(', ')}
                          </p>
                        ) : null}
                        {location.contact_email && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {location.contact_email}
                          </p>
                        )}
                        {location.contact_phone && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {location.contact_phone}
                          </p>
                        )}
                        <div className="pt-1.5 sm:pt-2 border-t border-gray-100 text-xs text-gray-500">
                          <p>Geofence: {location.geofence_radius_meters}m radius</p>
                          <p>Coordinates: {Number(location.latitude)?.toFixed(6)}, {Number(location.longitude)?.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-3 sm:pt-4 border-t border-gray-200">
                  <Button
                    onClick={onAddBranch}
                    className="w-full bg-gradient-to-r from-[#C62828] to-red-600"
                  >
                    Add Another Branch
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}