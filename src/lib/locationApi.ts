/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./Api";

export interface Location {
  id: string;
  country: string;
  state: string;
  city: string;
  pincode: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface LocationStats {
  total_locations: number;
  active_locations: number;
  inactive_locations: number;
  total_countries: number;
  total_states: number;
  total_cities: number;
}

export interface CreateLocationDTO {
  country: string;
  state: string;
  city: string;
  pincode: string;
  is_active?: boolean;
}

export interface UpdateLocationDTO {
  country?: string;
  state?: string;
  city?: string;
  pincode?: string;
  is_active?: boolean;
}

// Location API
export const locationApi = {
  /**
   * Get all locations
   * GET /api/locations
   */
  async getAll(): Promise<Location[]> {
    try {
      console.log("Fetching all locations from API...");
      const response = await api.get("/locations");
      console.log("API Response:", response.data);
      
      if (response.data && response.data.success) {
        // If data is in response.data.data
        if (response.data.data !== undefined) {
          const data = response.data.data;
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} locations in response.data.data`);
            return data;
          }
        }
        // If data is directly in response.data
        if (Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} locations in response.data`);
          return response.data;
        }
      }
      
      // Try test endpoint if main endpoint fails
      console.log("Trying test endpoint...");
      try {
        const testResponse = await api.get("/locations/test/all");
        console.log("Test endpoint response:", testResponse.data);
        
        if (testResponse.data && testResponse.data.success && testResponse.data.data) {
          const testData = testResponse.data.data;
          if (Array.isArray(testData)) {
            console.log(`Found ${testData.length} locations in test endpoint`);
            return testData;
          }
        }
      } catch (testError: any) {
        console.warn("Test endpoint failed:", testError);
      }
      
      console.warn("No locations found or unexpected response format");
      return [];
    } catch (error: any) {
      console.error("Error fetching locations:", error);
      
      // Try to get error details
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Response status:", error.response.status);
        
        // Check if it's a 404 (endpoint not found)
        if (error.response.status === 404) {
          throw new Error("Locations endpoint not found. Please check if backend routes are configured.");
        }
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch locations");
    }
  },

  /**
   * Get location by ID
   * GET /api/locations/:id
   */
  async getById(id: string): Promise<Location> {
    try {
      const response = await api.get(`/locations/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // If response format is different
      if (response.data && response.data.id) {
        return response.data;
      }
      
      throw new Error("Invalid response format");
    } catch (error: any) {
      console.error(`Error fetching location ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error("Location not found");
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch location");
    }
  },

  /**
   * Create location
   * POST /api/locations
   */
  async create(location: CreateLocationDTO): Promise<Location> {
    try {
      console.log("Creating location:", location);
      const response = await api.post("/locations", location);
      console.log("Create response:", response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // If response format is different
      if (response.data && response.data.id) {
        return response.data;
      }
      
      throw new Error("Invalid response format");
    } catch (error: any) {
      console.error("Error creating location:", error);
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errors = error.response.data.errors || error.response.data.error;
        if (Array.isArray(errors)) {
          throw new Error(errors.map((err: any) => err.msg || err.message).join(", "));
        }
        throw new Error(errors || "Validation failed");
      }
      
      // Handle duplicate error
      if (error.response?.status === 409) {
        throw new Error("A location with these details already exists");
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to create location");
    }
  },

  /**
   * Update location
   * PUT /api/locations/:id
   */
  async update(id: string, location: UpdateLocationDTO): Promise<Location> {
    try {
      const response = await api.put(`/locations/${id}`, location);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // If response format is different
      if (response.data && response.data.id) {
        return response.data;
      }
      
      throw new Error("Invalid response format");
    } catch (error: any) {
      console.error(`Error updating location ${id}:`, error);
      
      // Handle validation errors
      if (error.response?.status === 400) {
        const errors = error.response.data.errors || error.response.data.error;
        if (Array.isArray(errors)) {
          throw new Error(errors.map((err: any) => err.msg || err.message).join(", "));
        }
        throw new Error(errors || "Validation failed");
      }
      
      // Handle duplicate error
      if (error.response?.status === 409) {
        throw new Error("A location with these details already exists");
      }
      
      if (error.response?.status === 404) {
        throw new Error("Location not found");
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to update location");
    }
  },

  /**
   * Delete location
   * DELETE /api/locations/:id
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/locations/${id}`);
      
      if (response.data && response.data.success !== undefined) {
        return response.data;
      }
      
      return { success: true, message: "Location deleted successfully" };
    } catch (error: any) {
      console.error(`Error deleting location ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error("Location not found");
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to delete location");
    }
  },

  /**
   * Toggle active status
   * PATCH /api/locations/:id/toggle
   */
  async toggleActive(id: string): Promise<Location> {
    try {
      console.log(`Toggling active status for location ${id}`);
      const response = await api.patch(`/locations/${id}/toggle`);
      console.log("Toggle response:", response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // If response format is different
      if (response.data && response.data.id) {
        return response.data;
      }
      
      throw new Error("Invalid response format");
    } catch (error: any) {
      console.error(`Error toggling location ${id}:`, error);
      
      if (error.response?.status === 404) {
        throw new Error("Location not found");
      }
      
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to toggle location");
    }
  },

  /**
   * Get statistics
   * GET /api/locations/stats
   */
  async getStats(): Promise<LocationStats> {
    try {
      const response = await api.get("/locations/stats");
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Error fetching location stats:", error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch statistics");
    }
  },

  /**
   * Search locations
   * GET /api/locations/search?query=...
   */
  async search(query: string): Promise<Location[]> {
    try {
      const response = await api.get("/locations/search", { params: { query } });
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error searching locations:`, error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to search locations");
    }
  },

  /**
   * Get unique countries
   * GET /api/locations/countries
   */
  async getCountries(): Promise<string[]> {
    try {
      const response = await api.get("/locations/countries");
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching countries:", error);
      
      // Fallback: Extract unique countries from all locations
      try {
        const allLocations = await this.getAll();
        const countries = [...new Set(allLocations.map(loc => loc.country))].sort();
        return countries;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch countries");
      }
    }
  },

  /**
   * Get states by country
   * GET /api/locations/countries/:country/states
   */
  async getStatesByCountry(country: string): Promise<string[]> {
    try {
      const response = await api.get(`/locations/countries/${encodeURIComponent(country)}/states`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching states for ${country}:`, error);
      
      // Fallback: Extract unique states from all locations for this country
      try {
        const allLocations = await this.getAll();
        const states = [...new Set(
          allLocations
            .filter(loc => loc.country === country)
            .map(loc => loc.state)
        )].sort();
        return states;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch states");
      }
    }
  },

  /**
   * Get cities by state
   * GET /api/locations/states/:state/cities
   */
  async getCitiesByState(state: string): Promise<string[]> {
    try {
      const response = await api.get(`/locations/states/${encodeURIComponent(state)}/cities`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching cities for ${state}:`, error);
      
      // Fallback: Extract unique cities from all locations for this state
      try {
        const allLocations = await this.getAll();
        const cities = [...new Set(
          allLocations
            .filter(loc => loc.state === state)
            .map(loc => loc.city)
        )].sort();
        return cities;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch cities");
      }
    }
  },

  /**
   * Get pincodes by city
   * GET /api/locations/cities/:city/pincodes
   */
  async getPincodesByCity(city: string): Promise<string[]> {
    try {
      const response = await api.get(`/locations/cities/${encodeURIComponent(city)}/pincodes`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching pincodes for ${city}:`, error);
      
      // Fallback: Extract unique pincodes from all locations for this city
      try {
        const allLocations = await this.getAll();
        const pincodes = [...new Set(
          allLocations
            .filter(loc => loc.city === city)
            .map(loc => loc.pincode)
        )].sort();
        return pincodes;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch pincodes");
      }
    }
  },

  /**
   * Get locations by country
   * GET /api/locations/country/:country
   */
  async getByCountry(country: string): Promise<Location[]> {
    try {
      const response = await api.get(`/locations/country/${encodeURIComponent(country)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching locations for country ${country}:`, error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch locations");
    }
  },

  /**
   * Get locations by state
   * GET /api/locations/state/:state
   */
  async getByState(state: string): Promise<Location[]> {
    try {
      const response = await api.get(`/locations/state/${encodeURIComponent(state)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching locations for state ${state}:`, error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch locations");
    }
  },

  /**
   * Get locations by city
   * GET /api/locations/city/:city
   */
  async getByCity(city: string): Promise<Location[]> {
    try {
      const response = await api.get(`/locations/city/${encodeURIComponent(city)}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error fetching locations for city ${city}:`, error);
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Failed to fetch locations");
    }
  },

  /**
   * Test API connection
   * GET /api/locations/test/all
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.get("/locations/test/all");
      return {
        success: true,
        message: "API connection successful",
        data: response.data
      };
    } catch (error: any) {
      console.error("API connection test failed:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || "API connection failed"
      };
    }
  },

  /**
   * Bulk create locations (for initial data)
   */
  async bulkCreate(locations: CreateLocationDTO[]): Promise<Location[]> {
    try {
      const createdLocations: Location[] = [];
      
      for (const location of locations) {
        try {
          const created = await this.create(location);
          createdLocations.push(created);
        } catch (error) {
          console.error(`Failed to create location ${location.city}:`, error);
          // Continue with next location
        }
      }
      
      return createdLocations;
    } catch (error: any) {
      console.error("Error in bulk create:", error);
      throw new Error("Failed to bulk create locations");
    }
  },

  /**
   * Export locations to CSV/JSON
   */
  async export(format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const locations = await this.getAll();
      
      if (format === 'csv') {
        // Convert to CSV
        const headers = ['ID', 'Country', 'State', 'City', 'Pincode', 'Status', 'Created At'];
        const rows = locations.map(loc => [
          loc.id,
          loc.country,
          loc.state,
          loc.city,
          loc.pincode,
          loc.is_active ? 'Active' : 'Inactive',
          loc.created_at || ''
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        return csvContent;
      }
      
      // Default to JSON
      return locations;
    } catch (error: any) {
      console.error("Error exporting locations:", error);
      throw new Error("Failed to export locations");
    }
  }
};