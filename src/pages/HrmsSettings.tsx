import { useState, useEffect } from 'react';
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
  Phone
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import CompanyFormModal from '../components/modals/CompanyFormModal';
import CreateBranchModal from '../components/modals/CreateBranchModal';
import ViewBranchModal from '../components/modals/ViewBranchModal';
import companyApi, { Company, OfficeLocation } from '../lib/companyApi';

interface SecuritySettings {
  auto_punchout_enabled: boolean;
  auto_punchout_radius_km: number;
  auto_punchout_delay_minutes: number;
  geolocation_tracking_enabled: boolean;
  require_selfie_on_punch: boolean;
  location_validation_enabled: boolean;
}

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [companyOfficeLocations, setCompanyOfficeLocations] = useState<OfficeLocation[]>([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showViewBranchModal, setShowViewBranchModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [editingBranch, setEditingBranch] = useState<OfficeLocation | null>(null);
const [showEditBranchModal, setShowEditBranchModal] = useState(false);

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    auto_punchout_enabled: true,
    auto_punchout_radius_km: 1.0,
    auto_punchout_delay_minutes: 15,
    geolocation_tracking_enabled: true,
    require_selfie_on_punch: false,
    location_validation_enabled: true,
  });
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
    } finally {
      setLoading(false);
    }
  };

  const loadCompanies = async () => {
    try {
      const data = await companyApi.getCompanies();
      // Load branch counts for each company
      const companiesWithCounts = await Promise.all(
        data.map(async (company) => {
          try {
            const locations = await companyApi.getCompanyLocations(String(company.id));
            return {
              ...company,
              branch_count: locations.length
            };
          } catch (error) {
            console.error(`Error loading locations for company ${company.id}:`, error);
            return {
              ...company,
              branch_count: 0
            };
          }
        })
      );
      setCompanies(companiesWithCounts);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const loadCompanyLocations = async (companyId: string) => {
    setLocationsLoading(true);
    try {
      const data = await companyApi.getCompanyLocations(companyId);
      setCompanyOfficeLocations(data);
      
      // Update branch count in companies list
      setCompanies(prev => prev.map(company => 
        String(company.id) === companyId 
          ? { ...company, branch_count: data.length }
          : company
      ));
    } catch (error) {
      console.error('Error loading company locations:', error);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      await companyApi.deleteCompany(id);
      await loadCompanies();
    } catch (error: any) {
      console.error('Error deleting company:', error);
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
    { id: 'companies', label: 'Companies', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
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
    if (!confirm('Are you sure you want to delete this office location?')) return;

    try {
      await companyApi.deleteOfficeLocation(locationId);
      if (selectedCompany) {
        await loadCompanyLocations(String(selectedCompany.id));
      }
    } catch (error: any) {
      console.error('Error deleting office location:', error);
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
                  ? 'border-[#C62828] text-[#C62828]'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'companies' && (
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
                    <h2 className="text-xl font-bold text-gray-900">Company Management</h2>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {companies.length} {companies.length === 1 ? 'company' : 'companies'} registered
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
                  <p className="text-gray-600 font-medium">Loading companies...</p>
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-semibold">No companies yet</p>
                  <p className="text-gray-500 text-sm mt-1">Create your first company to get started</p>
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
                              <h3 className="font-bold text-gray-900">{company.name}</h3>
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
                              onClick={() => handleDeleteCompany(String(company.id))}
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
                            <span className="text-gray-700 truncate">{company.address || 'No address'}</span>
                          </div>
                          {company.email && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-700">{company.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* Location Stats */}
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-600 font-medium">Branches:</span>
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                              {(company as any).branch_count || 0} {(company as any).branch_count === 1 ? 'branch' : 'branches'}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewOfficeLocations(company)}
                              className="flex-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              View Branches
                            </button>
                            <button
                              onClick={() => handleAddBranchFromCompanyCard(company)}
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

      {activeTab === 'security' && (
        <Card className="border-2 border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#C62828]/10 rounded-xl">
                <Shield className="w-6 h-6 text-[#C62828]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Security Configuration</h2>
                <p className="text-sm text-gray-600 mt-0.5">Configure system security settings</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Security settings content remains the same */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                <div>
                  <p className="font-semibold text-gray-900">Auto Punch-Out</p>
                  <p className="text-sm text-gray-600 mt-0.5">Logout if outside office radius</p>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Radius (km)</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={securitySettings.auto_punchout_radius_km}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          auto_punchout_radius_km: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">Delay (min)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={securitySettings.auto_punchout_delay_minutes}
                      onChange={(e) =>
                        setSecuritySettings({
                          ...securitySettings,
                          auto_punchout_delay_minutes: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                <div>
                  <p className="font-semibold text-gray-900">Geolocation Tracking</p>
                  <p className="text-sm text-gray-600 mt-0.5">Track employee location</p>
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
                <div>
                  <p className="font-semibold text-gray-900">Location Validation</p>
                  <p className="text-sm text-gray-600 mt-0.5">Require punch within geofence</p>
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

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all duration-200">
                <div>
                  <p className="font-semibold text-gray-900">Selfie on Punch</p>
                  <p className="text-sm text-gray-600 mt-0.5">Require photo verification</p>
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
            </div>

            <Button
              onClick={() => {
                console.log('Security settings saved:', securitySettings);
                alert('Security settings saved successfully!');
              }}
              className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Security Settings
            </Button>
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