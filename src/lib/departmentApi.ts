// 
import { api } from './Api';


// Or if you want to keep it separate, re-export all interfaces
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Manager {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface DepartmentStats {
  total_departments: number;
  active_departments: number;
  inactive_departments: number;
  departments_with_manager: number;
}

export interface PaginatedDepartments {
  data: Department[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface DepartmentFilters {
  search?: string;
  is_active?: boolean;
  sort_by?: 'name' | 'code';
  sort_order?: 'asc' | 'desc';
}

export type CreateDepartmentDTO = {
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  manager_id?: string;
};

export type UpdateDepartmentDTO = {
  name?: string;
  code?: string;
  description?: string;
  is_active?: boolean;
  manager_id?: string | null;
};

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Manager {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export interface DepartmentStats {
  total_departments: number;
  active_departments: number;
  inactive_departments: number;
  departments_with_manager: number;
}

export interface PaginatedDepartments {
  data: Department[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export interface DepartmentFilters {
  search?: string;
  is_active?: boolean;
  sort_by?: 'name' | 'code';
  sort_order?: 'asc' | 'desc';
}

export const departmentsApi = {
  // Get all departments
  async getAll(): Promise<Department[]> {
    try {
      const response = await api.get(`/departments`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  // Get paginated departments with filters
  async getPaginated(
    page: number = 1,
    limit: number = 10,
    filters?: DepartmentFilters
  ): Promise<PaginatedDepartments> {
    try {
      const params: any = { page, limit };
      
      if (filters?.search) params.search = filters.search;
      if (filters?.is_active !== undefined) params.is_active = filters.is_active;
      if (filters?.sort_by) params.sort_by = filters.sort_by;
      if (filters?.sort_order) params.sort_order = filters.sort_order;

      const response = await api.get(`/departments/paginated`, { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching paginated departments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  // Get department statistics
  async getStats(): Promise<DepartmentStats> {
    try {
      const response = await api.get(`/departments/stats`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching department stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch department statistics');
    }
  },

  // Get available managers
  async getManagers(): Promise<Manager[]> {
    try {
      const response = await api.get(`/departments/managers`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching managers:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch managers');
    }
  },

  // Get active departments only
  async getActive(): Promise<Department[]> {
    try {
      const response = await api.get(`$/departments/active`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active departments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active departments');
    }
  },

  // Create new department
  async create(department: Omit<Department, 'id'>): Promise<Department> {
    try {
      const response = await api.post(`/departments`, department);
      return response.data;
    } catch (error: any) {
      console.error('Error creating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to create department');
    }
  },

  // Update department
  async update(id: string, department: Partial<Department>): Promise<Department> {
    try {
      const response = await api.put(`/departments/${id}`, department);
      return response.data;
    } catch (error: any) {
      console.error('Error updating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to update department');
    }
  },

  // Delete department
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`$/departments/${id}`);
    } catch (error: any) {
      console.error('Error deleting department:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete department');
    }
  },

  // Assign manager to department
  async assignManager(departmentId: string, managerId: string): Promise<Department> {
    try {
      const response = await api.put(`$/departments/${departmentId}/manager`, { managerId });
      return response.data;
    } catch (error: any) {
      console.error('Error assigning manager:', error);
      throw new Error(error.response?.data?.message || 'Failed to assign manager');
    }
  },

  // Remove manager from department
  async removeManager(departmentId: string): Promise<Department> {
    try {
      const response = await api.delete(`$/departments/${departmentId}/manager`);
      return response.data;
    } catch (error: any) {
      console.error('Error removing manager:', error);
      throw new Error(error.response?.data?.message || 'Failed to remove manager');
    }
  },

  // Toggle department active status
  async toggleActive(departmentId: string): Promise<Department> {
    try {
      const response = await api.patch(`$/departments/${departmentId}/toggle-active`);
      return response.data;
    } catch (error: any) {
      console.error('Error toggling department status:', error);
      throw new Error(error.response?.data?.message || 'Failed to toggle department status');
    }
  },

  // Validate department code
  validateCode(code: string): boolean {
    const regex = /^[A-Z0-9]{2,20}$/;
    return regex.test(code);
  }
};


// // src/lib/departmentsApi.ts
// import axios from 'axios';
// import { api } from './Api';

// const  = import.meta.env.VITE_ || 'http://localhost:4000/api';

// export interface Department {
//   id: string;
//   name: string;
//   code?: string;
//   description?: string;
//   is_active: boolean;
//   created_at?: string;
//   updated_at?: string;
// }

// export const departmentsApi = {
//   // Get all departments
//   async getAll(): Promise<Department[]> {
//     try {
//       const response = await api.get(`$/departments`);
//       console.log(response)
//       return response.data;
//     } catch (error: any) {
//       console.error('Error fetching departments:', error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch departments');
//     }
//   },

//   // Get active departments only
//   async getActive(): Promise<Department[]> {
//     try {
//       const response = await api.get(`$/departments/active`);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error fetching active departments:', error);
//       throw new Error(error.response?.data?.message || 'Failed to fetch active departments');
//     }
//   },

//   // Create new department
//   async create(department: Omit<Department, 'id'>): Promise<Department> {
//     try {
//       const response = await axios.post(`$/departments`, department);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error creating department:', error);
//       throw new Error(error.response?.data?.message || 'Failed to create department');
//     }
//   },

//   // Update department
//   async update(id: string, department: Partial<Department>): Promise<Department> {
//     try {
//       const response = await axios.put(`$/departments/${id}`, department);
//       return response.data;
//     } catch (error: any) {
//       console.error('Error updating department:', error);
//       throw new Error(error.response?.data?.message || 'Failed to update department');
//     }
//   },

//   // Delete departmenta
//   async delete(id: string): Promise<void> {
//     try {
//       await axios.delete(`$/departments/${id}`);
//     } catch (error: any) {
//       console.error('Error deleting department:', error);
//       throw new Error(error.response?.data?.message || 'Failed to delete department');
//     }
//   }
// };