/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "./Api";

export interface Designation {
  id: string;
  name: string;
  department_id: string;
  role_id: number;
  hierarchy_level: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  
  // Joined fields (from API)
  department_name?: string;
  department_code?: string;
  role_name?: string;
  created_by_name?: string;
  updated_by_name?: string;
}

export interface DesignationStats {
  total_designations: number;
  active_designations: number;
  inactive_designations: number;
  unique_department_roles: number;
}

export interface CreateDesignationDTO {
  name: string;
  department_id: string;
  role_id: number;
  hierarchy_level?: number;
  is_active?: boolean;
}

export interface UpdateDesignationDTO {
  name?: string;
  hierarchy_level?: number;
  is_active?: boolean;
}

export interface DepartmentWithRoles {
  id: string;
  name: string;
  code: string;
  description?: string;
  role_ids?: number[];
  role_names?: string[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Designation API - Fixed to show all designations
export const designationApi = {
  /**
   * Get all designations with department and role info
   * GET /designations
   */
  async getAll(): Promise<Designation[]> {
    try {
      console.log("Fetching all designations from API...");
      const response = await api.get("/designations");
      console.log("API Response:", response.data);
      
      if (response.data && response.data.success) {
        // If data is in response.data.data
        if (response.data.data !== undefined) {
          const data = response.data.data;
          if (Array.isArray(data)) {
            console.log(`Found ${data.length} designations in response.data.data`);
            return data;
          }
        }
        // If data is directly in response.data
        if (Array.isArray(response.data)) {
          console.log(`Found ${response.data.length} designations in response.data`);
          return response.data;
        }
      }
      
      // Try test endpoint if main endpoint fails
      console.log("Trying test endpoint...");
      const testResponse = await api.get("/designations/test/all");
      console.log("Test endpoint response:", testResponse.data);
      
      if (testResponse.data && testResponse.data.success && testResponse.data.data) {
        const testData = testResponse.data.data;
        if (Array.isArray(testData)) {
          console.log(`Found ${testData.length} designations in test endpoint`);
          return testData;
        }
      }
      
      console.warn("No designations found or unexpected response format");
      return [];
    } catch (error: any) {
      console.error("Error fetching designations:", error);
      
      // Try to get error details
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      throw new Error(error.response?.data?.message || "Failed to fetch designations");
    }
  },

  /**
   * Get designation by ID
   * GET /designations/:id
   */
  async getById(id: string): Promise<Designation> {
    try {
      const response = await api.get(`/designations/${id}`);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching designation ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to fetch designation");
    }
  },

  /**
   * Create designation
   * POST /designations
   */
  async create(designation: CreateDesignationDTO): Promise<Designation> {
    try {
      console.log("Creating designation:", designation);
      const response = await api.post("/designations", designation);
      console.log("Create response:", response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error("Error creating designation:", error);
      throw new Error(error.response?.data?.message || "Failed to create designation");
    }
  },

  /**
   * Update designation
   * PUT /designations/:id
   */
  async update(id: string, designation: UpdateDesignationDTO): Promise<Designation> {
    try {
      const response = await api.put(`/designations/${id}`, designation);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error(`Error updating designation ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to update designation");
    }
  },

  /**
   * Delete designation
   * DELETE /designations/:id
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/designations/${id}`);
      
      if (response.data && response.data.success !== undefined) {
        return response.data;
      }
      return { success: true, message: "Designation deleted successfully" };
    } catch (error: any) {
      console.error(`Error deleting designation ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to delete designation");
    }
  },

  /**
   * Toggle active status
   * PATCH /designations/:id/toggle
   */
  async toggleActive(id: string): Promise<Designation> {
    try {
      console.log(`Toggling active status for designation ${id}`);
      const response = await api.patch(`/designations/${id}/toggle`);
      console.log("Toggle response:", response.data);
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error(`Error toggling designation ${id}:`, error);
      throw new Error(error.response?.data?.message || "Failed to toggle designation");
    }
  },

  /**
   * Get statistics
   * GET /designations/stats
   */
  async getStats(): Promise<DesignationStats> {
    try {
      const response = await api.get("/designations/stats");
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error: any) {
      console.error("Error fetching designation stats:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch statistics");
    }
  },

  /**
   * Search designations
   * GET /designations/search?query=...
   */
  async search(query: string): Promise<Designation[]> {
    try {
      const response = await api.get("/designations/search", { params: { query } });
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error(`Error searching designations:`, error);
      throw new Error(error.response?.data?.message || "Failed to search designations");
    }
  },

  /**
   * Get designations by department and role
   * GET /designations/department/:departmentId/role/:roleId
   */
  async getByDepartmentRole(departmentId: string, roleId: number): Promise<Designation[]> {
    try {
      const response = await api.get(`/designations/department/${departmentId}/role/${roleId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching designations by dept/role:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch designations");
    }
  },

  /**
   * Get designations by department
   * GET /designations/department/:departmentId
   */
  async getByDepartment(departmentId: string): Promise<Designation[]> {
    try {
      const response = await api.get(`/designations/department/${departmentId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching designations by department:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch designations");
    }
  },

  /**
   * Get designations by role
   * GET /designations/role/:roleId
   */
  async getByRole(roleId: number): Promise<Designation[]> {
    try {
      const response = await api.get(`/designations/role/${roleId}`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching designations by role:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch designations");
    }
  },

  /**
   * Get available departments
   * GET /designations/available-departments
   */
  async getAvailableDepartments(): Promise<DepartmentWithRoles[]> {
    try {
      const response = await api.get("/designations/available-departments");
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching departments:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch departments");
    }
  },

  /**
   * Get roles by department
   * GET /designations/department/:departmentId/roles
   */
  async getRolesByDepartment(departmentId: string): Promise<Role[]> {
    try {
      const response = await api.get(`/designations/department/${departmentId}/roles`);
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching roles by department:", error);
      throw new Error(error.response?.data?.message || "Failed to fetch roles");
    }
  },

  /**
   * Get available roles
   * GET /designations/available-roles
   */
  async getAvailableRoles(): Promise<Role[]> {
    try {
      const response = await api.get("/designations/available-roles");
      
      if (response.data && response.data.success && response.data.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error("Error fetching available roles:", error);
      
      try {
        const fallbackResponse = await api.get("/roles");
        
        if (fallbackResponse.data && fallbackResponse.data.success && fallbackResponse.data.data) {
          return Array.isArray(fallbackResponse.data.data) ? fallbackResponse.data.data : [];
        }
        return Array.isArray(fallbackResponse.data) ? fallbackResponse.data : [];
      } catch {
        throw new Error("Failed to fetch roles");
      }
    }
  },
};