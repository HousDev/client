/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  Filter,
  MapPin,
  Globe,
  Navigation,
  Building,
  Hash,
  RefreshCw,
  Check,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { locationApi } from "../lib/locationApi";
import type { Location } from "../lib/locationApi";

const MySwal = withReactContent(Swal);

interface LocationForm {
  country: string;
  state: string;
  city: string;
  pincode: string;
  is_active: boolean;
}

export default function LocationMaster() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<boolean | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]);
  const [uniqueStates, setUniqueStates] = useState<string[]>([]);
  const [uniqueCities, setUniqueCities] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  
  const [form, setForm] = useState<LocationForm>({
    country: "",
    state: "",
    city: "",
    pincode: "",
    is_active: true
  });

  // Load initial data
  useEffect(() => {
    loadLocations();
    loadUniqueCountries();
  }, []);

  // Load states when country changes
  useEffect(() => {
    if (selectedCountry) {
      loadStatesByCountry(selectedCountry);
    } else {
      setUniqueStates([]);
      setSelectedState("");
    }
  }, [selectedCountry]);

  // Load cities when state changes
  useEffect(() => {
    if (selectedState) {
      loadCitiesByState(selectedState);
    } else {
      setUniqueCities([]);
      setSelectedCity("");
    }
  }, [selectedState]);

  // Load countries for dropdown
  useEffect(() => {
    if (form.country) {
      loadStatesByCountryForForm(form.country);
    }
  }, [form.country]);

  // Load states for form dropdown
  useEffect(() => {
    if (form.state) {
      loadCitiesByStateForForm(form.state);
    }
  }, [form.state]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      const locationsData = await locationApi.getAll();
      console.log("Locations loaded:", locationsData);
      
      if (Array.isArray(locationsData)) {
        setLocations(locationsData);
        console.log(`✅ Loaded ${locationsData.length} locations`);
      } else {
        console.warn("❌ Locations data is not an array:", locationsData);
        setLocations([]);
      }
    } catch (error: any) {
      console.error("❌ Failed to load locations:", error);
      toast.error(error.message || "Failed to load locations");
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUniqueCountries = async () => {
    try {
      const countries = await locationApi.getCountries();
      setUniqueCountries(Array.isArray(countries) ? countries : []);
    } catch (error: any) {
      console.error("Failed to load countries:", error);
      setUniqueCountries([]);
    }
  };

  const loadStatesByCountry = async (country: string) => {
    try {
      const states = await locationApi.getStatesByCountry(country);
      setUniqueStates(Array.isArray(states) ? states : []);
    } catch (error: any) {
      console.error(`Failed to load states for ${country}:`, error);
      setUniqueStates([]);
    }
  };

  const loadCitiesByState = async (state: string) => {
    try {
      const cities = await locationApi.getCitiesByState(state);
      setUniqueCities(Array.isArray(cities) ? cities : []);
    } catch (error: any) {
      console.error(`Failed to load cities for ${state}:`, error);
      setUniqueCities([]);
    }
  };

  const loadStatesByCountryForForm = async (country: string) => {
    try {
      const states = await locationApi.getStatesByCountry(country);
      // Don't set to state, just return or use if needed
    } catch (error) {
      console.error(`Failed to load states for form ${country}:`, error);
    }
  };

  const loadCitiesByStateForForm = async (state: string) => {
    try {
      const cities = await locationApi.getCitiesByState(state);
      // Don't set to state, just return or use if needed
    } catch (error) {
      console.error(`Failed to load cities for form ${state}:`, error);
    }
  };

  const openCreate = () => {
    setEditingLocation(null);
    setForm({
      country: "",
      state: "",
      city: "",
      pincode: "",
      is_active: true
    });
    setShowModal(true);
    setIsMobileMenuOpen(false);
  };

  const openEdit = (location: Location) => {
    setEditingLocation(location);
    setForm({
      country: location.country,
      state: location.state,
      city: location.city,
      pincode: location.pincode,
      is_active: location.is_active
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.country.trim()) {
      toast.error("Country is required");
      return;
    }
    if (!form.state.trim()) {
      toast.error("State is required");
      return;
    }
    if (!form.city.trim()) {
      toast.error("City is required");
      return;
    }
    if (!form.pincode.trim()) {
      toast.error("Pincode is required");
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        await locationApi.update(editingLocation.id, {
          country: form.country,
          state: form.state,
          city: form.city,
          pincode: form.pincode,
          is_active: form.is_active
        });
        
        await MySwal.fire({
          title: "Success!",
          text: "Location updated successfully",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
        
      } else {
        // Create new location
        await locationApi.create({
          country: form.country,
          state: form.state,
          city: form.city,
          pincode: form.pincode,
          is_active: form.is_active
        });
        
        await MySwal.fire({
          title: "Success!",
          text: "Location created successfully",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
      }
      
      setShowModal(false);
      loadLocations();
      loadUniqueCountries();
      
    } catch (error: any) {
      console.error("Failed to save location:", error);
      
      const errorMessage = error.response?.data?.error || error.message || "Failed to save location";
      
      if (errorMessage.includes("already exists")) {
        toast.error("A location with these details already exists");
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDelete = async (location: Location) => {
    const result = await MySwal.fire({
      title: "Are you sure?",
      text: `You are about to delete "${location.city}, ${location.state}, ${location.country} (${location.pincode})". This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await locationApi.delete(location.id);
        
        await MySwal.fire({
          title: "Deleted!",
          text: "Location has been deleted.",
          icon: "success",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK"
        });
        
        loadLocations();
        loadUniqueCountries();
      } catch (error: any) {
        console.error("Failed to delete location:", error);
        
        await MySwal.fire({
          title: "Error!",
          text: error.message || "Failed to delete location",
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const handleToggleActive = async (location: Location, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!location || !location.id) {
      toast.error("Invalid location data");
      return;
    }

    const action = location.is_active ? "deactivate" : "activate";
    const actionText = location.is_active ? "deactivated" : "activated";
    
    const result = await MySwal.fire({
      title: `Confirm ${action}`,
      text: `Are you sure you want to ${action} "${location.city}, ${location.state}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: `Yes, ${action} it!`,
      cancelButtonText: "Cancel"
    });

    if (result.isConfirmed) {
      try {
        await locationApi.toggleActive(location.id);
        
        toast.success(`Location ${actionText} successfully`);
        loadLocations();
        
      } catch (error: any) {
        console.error(`Failed to ${action} location:`, error);
        
        await MySwal.fire({
          title: "Error!",
          text: error.message || `Failed to ${action} location`,
          icon: "error",
          confirmButtonColor: "#d33",
          confirmButtonText: "OK"
        });
      }
    }
  };

  const filteredLocations = useMemo(() => {
    if (!Array.isArray(locations)) return [];
    
    return locations.filter(location => {
      // Apply active filter
      if (activeFilter !== null && location.is_active !== activeFilter) {
        return false;
      }
      
      // Apply country filter
      if (selectedCountry && location.country !== selectedCountry) {
        return false;
      }
      
      // Apply state filter
      if (selectedState && location.state !== selectedState) {
        return false;
      }
      
      // Apply city filter
      if (selectedCity && location.city !== selectedCity) {
        return false;
      }
      
      // Apply search filter
      if (search) {
        const searchTerm = search.toLowerCase();
        return (
          location.country.toLowerCase().includes(searchTerm) ||
          location.state.toLowerCase().includes(searchTerm) ||
          location.city.toLowerCase().includes(searchTerm) ||
          location.pincode.toLowerCase().includes(searchTerm)
        );
      }
      
      return true;
    });
  }, [locations, search, activeFilter, selectedCountry, selectedState, selectedCity]);

  // Count active/inactive locations
  const activeCount = locations.filter(l => l.is_active).length;
  const inactiveCount = locations.filter(l => !l.is_active).length;

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedState("");
    setSelectedCity("");
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity("");
  };

  const handleFormCountryChange = (value: string) => {
    setForm({ ...form, country: value, state: "", city: "" });
  };

  const handleFormStateChange = (value: string) => {
    setForm({ ...form, state: value, city: "" });
  };

  return (
  <div className="sticky top-24 z-10 bg-white rounded-xl shadow-sm border border-gray-200 mt-4">
  {/* Header Section - Sticky */}
  <div className="p-4 md:p-6 border-b border-gray-200">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
      <div className="flex justify-between items-center md:block">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Location Management</h2>
          <p className="text-xs md:text-sm text-gray-500">Manage countries, states, cities, and pincodes</p>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          aria-label="Toggle mobile menu"
        >
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Desktop Search and Add */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-64"
            placeholder="Search locations..."
          />
        </div>
        <button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden flex flex-col gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
              placeholder="Search locations..."
            />
          </div>
          <button
            onClick={openCreate}
            className="w-full bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium"
          >
            <Plus className="w-5 h-5" /> Add New Location
          </button>
        </div>
      )}

      {/* Mobile Search Bar */}
      <div className="md:hidden flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
            placeholder="Search locations..."
          />
        </div>
        <button
          onClick={openCreate}
          className="p-2.5 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200"
          aria-label="Add location"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Filters */}
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Status:</span>
        <button
          onClick={() => setActiveFilter(null)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === null ? "bg-[#C62828] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          All <span className="text-xs bg-white/20 px-1 rounded">{locations.length}</span>
        </button>
        <button
          onClick={() => setActiveFilter(true)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === true ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Active <span className="text-xs bg-white/20 px-1 rounded">{activeCount}</span>
        </button>
        <button
          onClick={() => setActiveFilter(false)}
          className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${activeFilter === false ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
        >
          Inactive <span className="text-xs bg-white/20 px-1 rounded">{inactiveCount}</span>
        </button>
      </div>

      {/* Country Filter */}
      <select
        value={selectedCountry}
        onChange={(e) => handleCountryChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
      >
        <option value="">All Countries</option>
        {uniqueCountries.map(country => (
          <option key={country} value={country}>{country}</option>
        ))}
      </select>

      {/* State Filter */}
      <select
        value={selectedState}
        onChange={(e) => handleStateChange(e.target.value)}
        disabled={!selectedCountry}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
      >
        <option value="">All States</option>
        {uniqueStates.map(state => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>

      {/* City Filter */}
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        disabled={!selectedState}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
      >
        <option value="">All Cities</option>
        {uniqueCities.map(city => (
          <option key={city} value={city}>{city}</option>
        ))}
      </select>
      
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="md:hidden flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Filter className="w-4 h-4" />
        More Filters
      </button>
    </div>

    {/* Mobile Filter Options */}
    {showMobileFilters && (
      <div className="md:hidden mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              disabled={!selectedCountry}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={!selectedState}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )}

    {/* Results Summary */}
    <div className="flex justify-between items-center">
      <p className="text-sm text-gray-600">
        Showing <span className="font-semibold">{filteredLocations.length}</span> location{filteredLocations.length !== 1 ? 's' : ''}
        {selectedCountry && ` in ${selectedCountry}`}
        {selectedState && `, ${selectedState}`}
        {selectedCity && `, ${selectedCity}`}
        {activeFilter === true && ` (Active only)`}
        {activeFilter === false && ` (Inactive only)`}
      </p>
      <button
        onClick={loadLocations}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <RefreshCw className="w-4 h-4" /> Refresh
      </button>
    </div>
  </div>

  {/* Scrollable Cards Section */}
  <div className="overflow-y-auto max-h-[calc(100vh-520px)] md:max-h-[calc(100vh-390px)] p-4 md:p-6">
    {/* Loading State */}
    {loading ? (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
        <p className="text-gray-600">Loading locations...</p>
      </div>
    ) : (
      <>
        {/* Locations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLocations.map((location) => (
            <div
              key={location.id}
              className={`p-4 border rounded-xl hover:shadow-sm transition-all duration-200 bg-white ${
                location.is_active ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-2">
                  <h3 className="font-semibold text-gray-800 text-base md:text-lg truncate" title={`${location.city}, ${location.state}`}>
                    {location.city}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">{location.state}, {location.country}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      location.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}>
                      {location.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      <Hash className="w-3 h-3 mr-1" /> {location.pincode}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleToggleActive(location, e)}
                  className={`px-3 py-1 rounded text-xs font-medium flex-shrink-0 ${
                    location.is_active
                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                      : "bg-green-50 text-green-600 hover:bg-green-100"
                  }`}
                >
                  {location.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={location.country}>
                    {location.country}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Navigation className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={location.state}>
                    {location.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={location.city}>
                    {location.city}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(location)}
                  className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                >
                  <Edit2 className="w-3 h-3" /> <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(location)}
                  className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 md:px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors flex items-center justify-center gap-1 md:gap-2"
                >
                  <Trash2 className="w-3 h-3" /> <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredLocations.length === 0 && (
          <div className="text-center py-8 md:py-12 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <MapPin className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
              {search ? "No matching locations found" : "No locations created yet"}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 mb-4 px-4">
              {search ? "Try a different search term or clear filters" : 'Click "Add Location" to create your first location'}
            </p>
            {!search && (
              <button
                onClick={openCreate}
                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 md:px-6 md:py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium mx-auto"
              >
                <Plus className="w-4 h-4" /> Create First Location
              </button>
            )}
          </div>
        )}
      </>
    )}
  </div>

  {/* Add/Edit Modal */}
  {showModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-2">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm md:text-base">
                {editingLocation ? "Edit Location" : "Create New Location"}
              </h3>
              <p className="text-xs text-white/90 hidden md:block">
                {editingLocation
                  ? "Update location details"
                  : "Add new country, state, city, and pincode"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-white hover:bg-white/20 rounded-xl p-1.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => handleFormCountryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  placeholder="e.g., India, USA, UK"
                  required
                  list="countries-list"
                />
                <datalist id="countries-list">
                  {uniqueCountries.map(country => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleFormStateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  placeholder="e.g., Maharashtra, California"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  placeholder="e.g., Mumbai, Pune, London"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode/ZIP Code *
                </label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  placeholder="e.g., 400001, 90001"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="w-4 h-4 text-[#C62828] rounded focus:ring-[#C62828]"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Location
              </label>
            </div>
          </div>

          <div className="border-t pt-6 mt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 md:px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 md:px-6 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium w-full sm:w-auto"
            >
              {editingLocation ? "Update Location" : "Create Location"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}

  <style jsx>{`
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fade-in 0.2s ease-out;
    }
  `}</style>
</div>
  );
}