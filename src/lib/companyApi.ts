import { api } from "./Api";

export interface Company {
  active_branch_count: number;
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
  created_at?: string;
  updated_at?: string;
  branch_count?: number;
}

export interface OfficeLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  contact_email: string;
  contact_phone: string;
  company_id?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompanyFormData {
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
  is_active?: boolean;
}

export interface BranchFormData {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  latitude: number;
  longitude: number;
  geofence_radius_meters: number;
  contact_email: string;
  contact_phone: string;
  is_active?: boolean;
}

const companyApi = {
  // Get all companies (including inactive)
  async getCompanies(): Promise<Company[]> {
    try {
      const response = await api.get("/companies");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw error;
    }
  },

  // Get single company
  async getCompanyById(id: string): Promise<Company> {
    try {
      const response = await api.get(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching company:", error);
      throw error;
    }
  },

  // Create company
  async createCompany(data: CompanyFormData): Promise<Company> {
    try {
      const response = await api.post("/companies", data);
      return response.data;
    } catch (error) {
      console.error("Error creating company:", error);
      throw error;
    }
  },

  // Update company
  async updateCompany(
    id: string,
    data: Partial<CompanyFormData>,
  ): Promise<Company> {
    try {
      const response = await api.put(`/companies/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating company:", error);
      throw error;
    }
  },

  // Delete company (soft delete)
  async deleteCompany(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/companies/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting company:", error);
      throw error;
    }
  },

  // Get company locations (including inactive)
  async getCompanyLocations(companyId: string): Promise<OfficeLocation[]> {
    try {
      const response = await api.get(`/companies/${companyId}/locations`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching company locations:", error);
      throw error;
    }
  },

  // Get company locations (including inactive)
  async getCompanyLocationsById(branchId: string): Promise<OfficeLocation[]> {
    try {
      const response = await api.get(`/companies/office-location/${branchId}`);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching company locations:", error);
      throw error;
    }
  },

  // Create office location
  async createOfficeLocation(
    companyId: string,
    data: BranchFormData,
  ): Promise<OfficeLocation> {
    try {
      const response = await api.post(
        `/companies/${companyId}/locations`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error creating office location:", error);
      throw error;
    }
  },

  // Update office location
  async updateOfficeLocation(
    id: string,
    data: Partial<BranchFormData>,
  ): Promise<OfficeLocation> {
    try {
      const response = await api.put(`/companies/locations/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating office location:", error);
      throw error;
    }
  },

  // Delete office location
  async deleteOfficeLocation(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/companies/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting office location:", error);
      throw error;
    }
  },
};

export default companyApi;
