import { useState, useEffect } from "react";
import {
  Building2,
  MapPin,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Settings as SettingsIcon,
  Clock,
  Camera,
  Map,
  Smartphone,
  Wifi,
  Calendar,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import CompanyFormModal from "../components/modals/CompanyFormModal";
import CreateBranchModal from "../components/modals/CreateBranchModal";
import ViewBranchModal from "../components/modals/ViewBranchModal";
import companyApi, { Company, OfficeLocation } from "../lib/companyApi";
import securityApi, { SecuritySettings } from "../lib/securityApi";
import { toast } from "sonner";

interface SecuritySettingsState extends SecuritySettings {
  id?: number;
  auto_punchout_enabled: boolean;
  auto_punchout_radius_km: number;
  auto_punchout_delay_minutes: number;
  geolocation_tracking_enabled: boolean;
  require_selfie_on_punch: boolean;
  location_validation_enabled: boolean;
  punch_in_radius_meters: number;
  punch_out_radius_meters: number;
  allow_remote_punch: boolean;
  max_punch_distance_meters: number;
  enable_face_recognition: boolean;
  require_live_selfie: boolean;
  max_punch_in_time: string;
  min_punch_out_time: string;
  allow_weekend_punch: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("companies");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyOfficeLocations, setCompanyOfficeLocations] = useState<
    OfficeLocation[]
  >([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showViewBranchModal, setShowViewBranchModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState<OfficeLocation | null>(
    null,
  );
  const [showEditBranchModal, setShowEditBranchModal] = useState(false);

  // Security settings state
  const [securitySettings, setSecuritySettings] =
    useState<SecuritySettingsState>({
      auto_punchout_enabled: true,
      auto_punchout_radius_km: 1.0,
      auto_punchout_delay_minutes: 15,
      geolocation_tracking_enabled: true,
      require_selfie_on_punch: false,
      location_validation_enabled: true,
      punch_in_radius_meters: 200,
      punch_out_radius_meters: 200,
      allow_remote_punch: false,
      max_punch_distance_meters: 500,
      enable_face_recognition: false,
      require_live_selfie: false,
      max_punch_in_time: "10:30:00",
      min_punch_out_time: "18:00:00",
      allow_weekend_punch: false,
    });

  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityResetLoading, setSecurityResetLoading] = useState(false);

  const handleEditBranch = (branch: OfficeLocation) => {
    setEditingBranch(branch);
    setShowEditBranchModal(true);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await loadCompanies();
      await loadSecuritySettings(); // Load security settings
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyApi.getCompanies();
      const companiesWithCounts = await Promise.all(
        data.map(async (company) => {
          try {
            const locations = await companyApi.getCompanyLocations(
              String(company.id),
            );
            return {
              ...company,
              branch_count: locations.length, // Total branches
              active_branch_count: locations.filter((loc) => loc.is_active)
                .length, // Active branches
            };
          } catch (error) {
            console.error(
              `Error loading locations for company ${company.id}:`,
              error,
            );
            return {
              ...company,
              branch_count: 0,
              active_branch_count: 0,
            };
          }
        }),
      );
      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const loadSecuritySettings = async () => {
    setSecurityLoading(true);
    try {
      const settings = await securityApi.getSecuritySettings();
      setSecuritySettings(settings);
    } catch (error) {
      console.error("Error loading security settings:", error);
      // Keep default settings if API fails
    } finally {
      setSecurityLoading(false);
    }
  };

  const loadCompanyLocations = async (companyId: string) => {
    setLocationsLoading(true);
    try {
      const data = await companyApi.getCompanyLocations(companyId);
      setCompanyOfficeLocations(data);

      // Calculate total branches (active + inactive)
      const totalBranches = data.length;
      const activeBranches = data.filter((branch) => branch.is_active).length;

      setCompanies((prev) =>
        prev.map((company) =>
          String(company.id) === companyId
            ? {
                ...company,
                branch_count: totalBranches, // Show total count, not just active
                active_branch_count: activeBranches, // Optional: track active separately
              }
            : company,
        ),
      );
    } catch (error) {
      console.error("Error loading company locations:", error);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      await companyApi.deleteCompany(id);
      await loadCompanies();
    } catch (error: any) {
      console.error("Error deleting company:", error);
    }
  };

  const handleCompanySuccess = () => {
    loadCompanies();
    setShowCompanyForm(false);
    setEditingCompany(null);
  };

  const handleBranchSuccess = () => {
    if (selectedCompany) {
      loadCompanyLocations(String(selectedCompany.id));
    }
    setShowBranchModal(false);
  };

  const tabs = [
    { id: "companies", label: "Companies", icon: Building2 },
    { id: "security", label: "Security", icon: Shield },
  ];

  const handleAddBranchFromCompanyCard = (company: Company) => {
    setSelectedCompany(company);
    setShowBranchModal(true);
  };

  const handleViewOfficeLocations = async (company: Company) => {
    setSelectedCompany(company);
    await loadCompanyLocations(String(company.id));
    setShowViewBranchModal(true);
  };

  const handleDeleteOfficeLocation = async (locationId: string) => {
    if (!confirm("Are you sure you want to delete this office location?"))
      return;

    try {
      // This will now be a HARD DELETE
      await companyApi.deleteOfficeLocation(locationId);

      // Update local state - remove the deleted branch from the list
      setCompanyOfficeLocations((prev) =>
        prev.filter((loc) => String(loc.id) !== locationId),
      );

      // Update companies list - decrease total count by 1
      if (selectedCompany) {
        setCompanies((prev) =>
          prev.map((company) =>
            String(company.id) === String(selectedCompany.id)
              ? {
                  ...company,
                  branch_count: (company.branch_count || 0) - 1,
                  active_branch_count: company.active_branch_count
                    ? Math.max(0, company.active_branch_count - 1)
                    : 0,
                }
              : company,
          ),
        );
      }

      toast.success("Branch permanently deleted");
    } catch (error: any) {
      console.error("Error deleting office location:", error);
      toast.error(error.response?.data?.message || "Failed to delete branch");
    }
  };

  const handleRefreshLocations = async () => {
    if (selectedCompany) {
      await loadCompanyLocations(String(selectedCompany.id));
    }
  };

  const handleAddBranchFromViewModal = () => {
    setShowViewBranchModal(false);
    setShowBranchModal(true);
  };

  // Security Settings Handlers
  const handleSaveSecuritySettings = async () => {
    setSecuritySaving(true);
    try {
      const result = await securityApi.updateSecuritySettings(securitySettings);

      if (result.success) {
        // Update local state with the response
        setSecuritySettings(result.data);
        alert("Security settings saved successfully!");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error saving security settings:", error);
      alert(`Failed to save security settings: ${error.message}`);
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleResetSecuritySettings = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all security settings to defaults?",
      )
    ) {
      return;
    }

    setSecurityResetLoading(true);
    try {
      const result = await securityApi.resetSecuritySettings();

      if (result.success) {
        setSecuritySettings(result.data);
        alert("Security settings have been reset to defaults!");
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error resetting security settings:", error);
      alert(`Failed to reset security settings: ${error.message}`);
    } finally {
      setSecurityResetLoading(false);
    }
  };
  const handleToggleStatus = async (
    locationId: string,
    currentStatus: boolean,
  ) => {
    try {
      // Find the branch from the current locations
      const branch = companyOfficeLocations.find(
        (loc) => String(loc.id) === locationId,
      );
      if (!branch) {
        toast.error("Branch not found");
        return;
      }

      // Prepare update data
      const updateData = {
        ...branch,
        is_active: !currentStatus,
      };

      // Update via API
      await companyApi.updateOfficeLocation(locationId, updateData);

      // Update local state - just toggle the is_active status
      setCompanyOfficeLocations((prev) =>
        prev.map((loc) =>
          String(loc.id) === locationId
            ? { ...loc, is_active: !currentStatus }
            : loc,
        ),
      );

      // Update companies list - adjust active count but keep total count same
      if (selectedCompany) {
        const newActiveStatus = !currentStatus;

        setCompanies((prev) =>
          prev.map((company) =>
            String(company.id) === String(selectedCompany.id)
              ? {
                  ...company,
                  active_branch_count: newActiveStatus
                    ? (company.active_branch_count || 0) + 1
                    : Math.max(0, (company.active_branch_count || 0) - 1),
                }
              : company,
          ),
        );
      }
    } catch (error: any) {
      console.error("Error toggling branch status:", error);
      throw error;
    }
  };

  const handleRefreshSecuritySettings = async () => {
    await loadSecuritySettings();
    alert("Security settings refreshed!");
  };

  // Format time for display
  const formatTimeForInput = (timeString: string) => {
    return timeString.substring(0, 5); // Get HH:MM format
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold flex items-center gap-3 border-b-2 transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-[#C62828] text-[#C62828]"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "companies" && (
        <div className="space-y-6">
          {/* Company Management Card */}
          <Card className=" rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 ">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#C62828]/10 rounded-xl">
                    <Building2 className="w-6 h-6 text-[#C62828]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Company Management
                    </h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {companies.length}{" "}
                      {companies.length === 1 ? "company" : "companies"}{" "}
                      registered
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={loadData}
                    variant="secondary"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                  </Button>
                  <Button
                    onClick={() => {
                      setEditingCompany(null);
                      setShowCompanyForm(true);
                    }}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Company
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-12 h-12 border-4 border-[#C62828]/20 border-t-[#C62828] rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-600 font-medium">
                    Loading companies...
                  </p>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-semibold">
                    No companies yet
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Create your first company to get started
                  </p>
                  <Button
                    onClick={() => setShowCompanyForm(true)}
                    className="mt-4 bg-gradient-to-r from-[#C62828] to-red-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Company
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {companies.map((company) => (
                    <div
                      key={company.id}
                      className="group bg-white border-2 border-gray-200 rounded-xl hover:border-[#C62828]/30 hover:shadow-lg transition-all duration-200 p-4 hover:-translate-y-1"
                    >
                      <div className="space-y-3">
                        {/* Company Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-[#C62828]/10 transition-colors">
                              <Building2 className="w-5 h-5 text-gray-700 group-hover:text-[#C62828]" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">
                                {company.name}
                              </h3>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                {company.code}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingCompany(company);
                                setShowCompanyForm(true);
                              }}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteCompany(String(company.id))
                              }
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Company Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700 truncate">
                              {company.address || "No address"}
                            </span>
                          </div>
                          {company.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {company.email}
                              </span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">
                                {company.phone}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Location Stats */}
                        {/* Location Stats */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">
                              Branches:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                {(company as any).active_branch_count || 0}{" "}
                                Active
                              </span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">
                                {((company as any).branch_count || 0) -
                                  ((company as any).active_branch_count ||
                                    0)}{" "}
                                Inactive
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewOfficeLocations(company)}
                              className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View All Branches
                            </button>
                            <button
                              onClick={() =>
                                handleAddBranchFromCompanyCard(company)
                              }
                              className="flex-1 text-sm bg-gradient-to-r from-[#C62828]/10 to-red-600/10 hover:from-[#C62828]/20 hover:to-red-600/20 border border-[#C62828]/30 text-[#C62828] font-medium py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-4 h-4" />
                              Add Branch
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "security" && (
        <Card className="border-2 border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#C62828]/10 rounded-xl">
                  <Shield className="w-6 h-6 text-[#C62828]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Security Configuration
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Configure system security and attendance settings
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleRefreshSecuritySettings}
                  variant="secondary"
                  className="flex items-center gap-2"
                  disabled={securityLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${securityLoading ? "animate-spin" : ""}`}
                  />
                  {securityLoading ? "Loading..." : "Refresh"}
                </Button>
                <Button
                  onClick={handleResetSecuritySettings}
                  variant="secondary"
                  className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={securityResetLoading}
                >
                  <SettingsIcon className="h-4 w-4" />
                  {securityResetLoading ? "Resetting..." : "Reset Defaults"}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {securityLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-[#C62828]/20 border-t-[#C62828] rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 font-medium">
                  Loading security settings...
                </p>
              </div>
            ) : (
              <>
                {/* Location & Punch Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Map className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Location Validation
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Require employees to be within office radius to punch
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.location_validation_enabled}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            location_validation_enabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  {securitySettings.location_validation_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Punch-In Radius (meters)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="5000"
                          step="10"
                          value={securitySettings.punch_in_radius_meters}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              punch_in_radius_meters:
                                parseInt(e.target.value) || 200,
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Distance allowed for punch-in
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Punch-Out Radius (meters)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="5000"
                          step="10"
                          value={securitySettings.punch_out_radius_meters}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              punch_out_radius_meters:
                                parseInt(e.target.value) || 200,
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Distance allowed for punch-out
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Max Distance (meters)
                        </label>
                        <input
                          type="number"
                          min="100"
                          max="10000"
                          step="50"
                          value={securitySettings.max_punch_distance_meters}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              max_punch_distance_meters:
                                parseInt(e.target.value) || 500,
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum punch distance allowed
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Wifi className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Allow Remote Punch
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Allow employees to punch from outside office
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.allow_remote_punch}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            allow_remote_punch: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>

                {/* Auto Punch-Out Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Smartphone className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Auto Punch-Out
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Automatically logout if outside office radius
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.auto_punchout_enabled}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            auto_punchout_enabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  {securitySettings.auto_punchout_enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Auto Punch-Out Radius (km)
                        </label>
                        <input
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          value={securitySettings.auto_punchout_radius_km}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              auto_punchout_radius_km:
                                parseFloat(e.target.value) || 1.0,
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Delay (minutes)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={securitySettings.auto_punchout_delay_minutes}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              auto_punchout_delay_minutes:
                                parseInt(e.target.value) || 15,
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Geolocation & Tracking Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Geolocation Tracking
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Track employee location during work hours
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.geolocation_tracking_enabled}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            geolocation_tracking_enabled: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-100 rounded-lg">
                        <Camera className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Selfie on Punch
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Require photo verification for punches
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.require_selfie_on_punch}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            require_selfie_on_punch: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>

                  {securitySettings.require_selfie_on_punch && (
                    <div className="p-4 bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Live Selfie Verification
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            Require live photo capture (not from gallery)
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={securitySettings.require_live_selfie}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                require_live_selfie: e.target.checked,
                              })
                            }
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Face Recognition
                          </p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            Enable AI-based face matching
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={securitySettings.enable_face_recognition}
                            onChange={(e) =>
                              setSecuritySettings({
                                ...securitySettings,
                                enable_face_recognition: e.target.checked,
                              })
                            }
                          />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Time Restrictions */}
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Time Restrictions
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Set allowed punch-in/out times
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Max Punch-In Time
                        </label>
                        <input
                          type="time"
                          value={formatTimeForInput(
                            securitySettings.max_punch_in_time,
                          )}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              max_punch_in_time: e.target.value + ":00",
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Latest time to punch-in
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Min Punch-Out Time
                        </label>
                        <input
                          type="time"
                          value={formatTimeForInput(
                            securitySettings.min_punch_out_time,
                          )}
                          onChange={(e) =>
                            setSecuritySettings({
                              ...securitySettings,
                              min_punch_out_time: e.target.value + ":00",
                            })
                          }
                          className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Earliest time to punch-out
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-teal-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Allow Weekend Punch
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Allow employees to punch on weekends
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={securitySettings.allow_weekend_punch}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            allow_weekend_punch: e.target.checked,
                          })
                        }
                      />
                      <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#C62828] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSaveSecuritySettings}
                    disabled={securitySaving}
                    className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[180px]"
                  >
                    {securitySaving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Save Security Settings
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Company Form Modal */}
      {showCompanyForm && (
        <CompanyFormModal
          isOpen={showCompanyForm}
          onClose={() => {
            setShowCompanyForm(false);
            setEditingCompany(null);
          }}
          onSuccess={handleCompanySuccess}
          company={editingCompany}
          mode={editingCompany ? "edit" : "create"}
        />
      )}

      {/* Create Branch Modal */}
      {showBranchModal && selectedCompany && (
        <CreateBranchModal
          isOpen={showBranchModal}
          onClose={() => {
            setShowBranchModal(false);
          }}
          onSuccess={handleBranchSuccess}
          companyId={String(selectedCompany.id)}
        />
      )}

      {/* View Branch Modal */}
      {showViewBranchModal && selectedCompany && (
        <ViewBranchModal
          isOpen={showViewBranchModal}
          onClose={() => setShowViewBranchModal(false)}
          companyName={selectedCompany.name}
          locations={companyOfficeLocations}
          loading={locationsLoading}
          onRefresh={handleRefreshLocations}
          onDeleteLocation={handleDeleteOfficeLocation}
          onAddBranch={handleAddBranchFromViewModal}
          onEditBranch={handleEditBranch}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {showEditBranchModal && editingBranch && selectedCompany && (
        <CreateBranchModal
          isOpen={showEditBranchModal}
          onClose={() => {
            setShowEditBranchModal(false);
            setEditingBranch(null);
          }}
          onSuccess={() => {
            if (selectedCompany) {
              loadCompanyLocations(String(selectedCompany.id));
            }
            setShowEditBranchModal(false);
            setEditingBranch(null);
          }}
          companyId={String(selectedCompany.id)}
          branch={editingBranch}
          mode="edit"
        />
      )}
    </div>
  );
}
