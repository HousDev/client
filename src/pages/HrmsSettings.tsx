import { useState, useEffect } from 'react';
import { Building2, MapPin, Shield, Save, Plus, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import CreateBranchModal from '../components/modals/CreateBranchModal';

interface OrgData {
    id?: string;
    name: string;
    contact_email: string;
    contact_phone: string;
    website: string;
    address: string;
}

interface Company {
    id: string;
    name: string;
    code: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    country: string;
    latitude: number;
    longitude: number;
    logo_url: string;
    is_active: boolean;
}

interface OfficeLocation {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number;
    longitude: number;
    geofence_radius_meters: number;
    is_active: boolean;
    company_id?: string;
}

interface SecuritySettings {
    id?: string;
    auto_punchout_enabled: boolean;
    auto_punchout_radius_km: number;
    auto_punchout_delay_minutes: number;
    geolocation_tracking_enabled: boolean;
    require_selfie_on_punch: boolean;
    location_validation_enabled: boolean;
}

// API helper functions
const api = {
    async getOrganizations() {
        const response = await fetch('/api/organizations', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },

    async saveOrganization(data: any) {
        const response = await fetch('/api/organizations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateOrganization(id: string, data: any) {
        const response = await fetch(`/api/organizations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async getCompanies() {
        const response = await fetch('/api/companies', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },

    async createCompany(data: any) {
        const response = await fetch('/api/companies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteCompany(id: string) {
        const response = await fetch(`/api/companies/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },

    async getCompanyLocations(companyId: string) {
        const response = await fetch(`/api/companies/${companyId}/locations`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },

    async getSecuritySettings() {
        const response = await fetch('/api/security-settings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        return response.json();
    },

    async saveSecuritySettings(data: any) {
        const response = await fetch('/api/security-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

export default function Settings() {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('companies');
    const [orgData, setOrgData] = useState<OrgData>({
        name: '',
        contact_email: '',
        contact_phone: '',
        website: '',
        address: '',
    });
    const [companies, setCompanies] = useState<Company[]>([]);
    const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
    const [newCompany, setNewCompany] = useState({
        name: '',
        code: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        latitude: 0,
        longitude: 0,
    });
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [companyOfficeLocations, setCompanyOfficeLocations] = useState<OfficeLocation[]>([]);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showBranchModal, setShowBranchModal] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
        auto_punchout_enabled: true,
        auto_punchout_radius_km: 1.0,
        auto_punchout_delay_minutes: 15,
        geolocation_tracking_enabled: true,
        require_selfie_on_punch: false,
        location_validation_enabled: true,
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadOrganization(),
                loadCompanies(),
                loadSecuritySettings(),
            ]);
        } finally {
            setLoading(false);
        }
    };

    const loadOrganization = async () => {
        try {
            const data = await api.getOrganizations();
            if (data && data.length > 0) {
                const org = data[0];
                setOrgData({
                    id: org.id,
                    name: org.name || '',
                    contact_email: org.contact_email || '',
                    contact_phone: org.contact_phone || '',
                    website: org.website || '',
                    address: org.address || '',
                });
            }
        } catch (error) {
            console.error('Error loading organization:', error);
        }
    };

    const loadCompanies = async () => {
        try {
            const data = await api.getCompanies();
            setCompanies(data || []);
        } catch (error) {
            console.error('Error loading companies:', error);
        }
    };

    const loadCompanyLocations = async (companyId: string) => {
        try {
            const data = await api.getCompanyLocations(companyId);
            setCompanyOfficeLocations(data || []);
        } catch (error) {
            console.error('Error loading company locations:', error);
        }
    };

    const loadSecuritySettings = async () => {
        try {
            const data = await api.getSecuritySettings();
            if (data) {
                setSecuritySettings(data);
            }
        } catch (error) {
            console.error('Error loading security settings:', error);
        }
    };

    const getLocation = async () => {
        setGeoError(null);
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation not supported');
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setNewCompany((prev) => ({
                        ...prev,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    }));
                },
                (error) => {
                    setGeoError(`Geolocation error: ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } catch (error: any) {
            setGeoError(error.message);
        }
    };

    const handleSaveOrganization = async () => {
        setLoading(true);
        try {
            if (orgData.id) {
                await api.updateOrganization(orgData.id, {
                    name: orgData.name,
                    contact_email: orgData.contact_email,
                    contact_phone: orgData.contact_phone,
                    website: orgData.website,
                    address: orgData.address,
                });
            } else {
                await api.saveOrganization({
                    name: orgData.name,
                    contact_email: orgData.contact_email,
                    contact_phone: orgData.contact_phone,
                    website: orgData.website,
                    address: orgData.address,
                    code: 'ORG001',
                });
            }

            alert('Organization saved successfully!');
            await loadOrganization();
        } catch (error: any) {
            alert(error.message || 'Failed to save organization');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompany = async () => {
        if (!newCompany.name || !newCompany.code) {
            alert('Company name and code are required');
            return;
        }

        setLoading(true);
        try {
            await api.createCompany({
                name: newCompany.name,
                code: newCompany.code,
                email: newCompany.email,
                phone: newCompany.phone,
                address: newCompany.address,
                city: newCompany.city,
                state: newCompany.state,
                country: newCompany.country,
                latitude: newCompany.latitude,
                longitude: newCompany.longitude,
                is_active: true,
            });

            alert('Company added successfully!');
            setShowNewCompanyModal(false);
            setNewCompany({
                name: '',
                code: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                state: '',
                country: '',
                latitude: 0,
                longitude: 0,
            });
            await loadCompanies();
        } catch (error: any) {
            alert(error.message || 'Failed to add company');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('Are you sure? This will delete all associated data.')) return;

        try {
            await api.deleteCompany(id);
            alert('Company deleted successfully!');
            await loadCompanies();
        } catch (error: any) {
            alert(error.message || 'Failed to delete company');
        }
    };

    const handleSaveSecuritySettings = async () => {
        setLoading(true);
        try {
            await api.saveSecuritySettings(securitySettings);
            alert('Security settings saved successfully!');
        } catch (error: any) {
            alert(error.message || 'Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-1">Manage organization and system configuration</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'companies' && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Company Management</h2>
                            <Button size="sm" onClick={() => setShowNewCompanyModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Company
                            </Button>
                        </div>

                        {companies.length === 0 ? (
                            <p className="text-slate-600 text-center py-8">No companies created yet</p>
                        ) : (
                            <div className="space-y-3">
                                {companies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:shadow-md transition-all cursor-pointer"
                                        onClick={() => {
                                            setSelectedCompany(company);
                                            loadCompanyLocations(company.id);
                                            setShowLocationModal(true);
                                        }}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <h3 className="font-semibold text-slate-900">{company.name}</h3>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {company.code}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-2">{company.address}</p>
                                            <div className="flex gap-4 text-xs text-slate-500">
                                                <span>{company.city}, {company.state}</span>
                                                <span>Lat: {company.latitude.toFixed(4)}</span>
                                                <span>Lon: {company.longitude.toFixed(4)}</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCompany(company.id);
                                            }}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    {selectedCompany && (
                        <Card className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-slate-900">
                                    {selectedCompany.name} - Office Locations
                                </h2>
                                <Button size="sm" onClick={() => setShowBranchModal(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Office
                                </Button>
                            </div>

                            {companyOfficeLocations.length === 0 ? (
                                <p className="text-slate-600 text-center py-8">No office locations</p>
                            ) : (
                                <div className="space-y-3">
                                    {companyOfficeLocations.map((location) => (
                                        <div
                                            key={location.id}
                                            className="flex items-start justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin className="h-4 w-4 text-green-600" />
                                                    <h3 className="font-semibold text-slate-900">{location.name}</h3>
                                                </div>
                                                <p className="text-sm text-slate-600 mb-2">{location.address}</p>
                                                <div className="flex gap-4 text-xs text-slate-500">
                                                    <span>Radius: {location.geofence_radius_meters}m</span>
                                                    <span>Lat: {location.latitude.toFixed(4)}</span>
                                                    <span>Lon: {location.longitude.toFixed(4)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            )}

            {activeTab === 'security' && (
                <Card className="p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Security Configuration</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900">Auto Punch-Out</p>
                                <p className="text-sm text-slate-600">Logout if outside office radius</p>
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
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        {securitySettings.auto_punchout_enabled && (
                            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Radius (km)</label>
                                    <Input
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
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Delay (min)</label>
                                    <Input
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
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900">Geolocation Tracking</p>
                                <p className="text-sm text-slate-600">Track employee location</p>
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
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900">Location Validation</p>
                                <p className="text-sm text-slate-600">Require punch within geofence</p>
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
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900">Selfie on Punch</p>
                                <p className="text-sm text-slate-600">Require photo verification</p>
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
                                <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>

                    <Button onClick={handleSaveSecuritySettings} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Security Settings
                    </Button>
                </Card>
            )}

            <Modal isOpen={showNewCompanyModal} onClose={() => setShowNewCompanyModal(false)} size="xl">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900">Add New Company</h2>
                </div>
                <div className="p-6 space-y-6">
                    {geoError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                            {geoError}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                            <Input
                                type="text"
                                value={newCompany.name}
                                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                                placeholder="Company name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Code</label>
                            <Input
                                type="text"
                                value={newCompany.code}
                                onChange={(e) => setNewCompany({ ...newCompany, code: e.target.value })}
                                placeholder="e.g., COMP001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <Input
                                type="email"
                                value={newCompany.email}
                                onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                                placeholder="company@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                            <Input
                                type="tel"
                                value={newCompany.phone}
                                onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">City</label>
                            <Input
                                type="text"
                                value={newCompany.city}
                                onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                                placeholder="City"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">State</label>
                            <Input
                                type="text"
                                value={newCompany.state}
                                onChange={(e) => setNewCompany({ ...newCompany, state: e.target.value })}
                                placeholder="State"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                            <Input
                                type="text"
                                value={newCompany.country}
                                onChange={(e) => setNewCompany({ ...newCompany, country: e.target.value })}
                                placeholder="Country"
                            />
                        </div>
                        <div></div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <Input
                                type="text"
                                value={newCompany.address}
                                onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                                placeholder="Full address"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h3 className="font-medium text-slate-900 mb-4">Geolocation</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Latitude</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    value={newCompany.latitude}
                                    onChange={(e) =>
                                        setNewCompany({ ...newCompany, latitude: parseFloat(e.target.value) })
                                    }
                                    placeholder="Latitude"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Longitude</label>
                                <Input
                                    type="number"
                                    step="0.00001"
                                    value={newCompany.longitude}
                                    onChange={(e) =>
                                        setNewCompany({ ...newCompany, longitude: parseFloat(e.target.value) })
                                    }
                                    placeholder="Longitude"
                                />
                            </div>
                        </div>
                        <Button variant="secondary" onClick={getLocation} className="w-full" size="sm">
                            Get Current Location
                        </Button>
                    </div>

                    <div className="flex gap-3 justify-end border-t border-slate-200 pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setShowNewCompanyModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleAddCompany} disabled={loading}>
                            {loading ? 'Adding...' : 'Add Company'}
                        </Button>
                    </div>
                </div>
            </Modal>

            {showBranchModal && selectedCompany && (
                <CreateBranchModal
                    onClose={() => setShowBranchModal(false)}
                    onSuccess={() => {
                        loadCompanyLocations(selectedCompany.id);
                        setShowBranchModal(false);
                    }}
                    companyId={selectedCompany.id}
                />
            )}
        </div>
    );
}