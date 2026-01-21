// src/lib/rolesApi.ts
import { api, unwrap } from "./Api";

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Get all roles
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get('/roles');
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get single role by ID
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await api.get(`/roles/${id}`);
    return unwrap(response);
  } catch (error) {
    console.error(`Error fetching role ${id}:`, error);
    throw error;
  }
};

// Create new role
export const createRole = async (roleData: {
  name: string;
  description?: string;
  permissions: Record<string, boolean>;
  is_active?: boolean;
}): Promise<Role> => {
  try {
    const response = await api.post('/roles', roleData);
    return unwrap(response);
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

// Update role
export const updateRole = async (id: string, roleData: {
  name?: string;
  description?: string;
  permissions?: Record<string, boolean>;
  is_active?: boolean;
}): Promise<Role> => {
  try {
    const response = await api.put(`/roles/${id}`, roleData);
    return unwrap(response);
  } catch (error) {
    console.error(`Error updating role ${id}:`, error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (id: string): Promise<void> => {
  try {
    await api.delete(`/roles/${id}`);
  } catch (error) {
    console.error(`Error deleting role ${id}:`, error);
    throw error;
  }
};

// Get role permissions
export const getRolePermissions = async (roleId: string): Promise<Record<string, boolean>> => {
  try {
    const response = await api.get(`/roles/${roleId}/permissions`);
    return unwrap(response);
  } catch (error) {
    console.error(`Error fetching permissions for role ${roleId}:`, error);
    throw error;
  }
};

// Update role permissions
export const updateRolePermissions = async (
  roleId: string,
  permissions: Record<string, boolean>
): Promise<Record<string, boolean>> => {
  try {
    const response = await api.put(`/roles/${roleId}/permissions`, { permissions });
    return unwrap(response);
  } catch (error) {
    console.error(`Error updating permissions for role ${roleId}:`, error);
    throw error;
  }
};

// Get all permissions list
export const getAllPermissions = async (): Promise<string[]> => {
  try {
    const response = await api.get('/permissions');
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching permissions list:', error);
    throw error;
  }
};

// Check if role exists
export const roleExists = async (roleName: string): Promise<boolean> => {
  try {
    const roles = await getAllRoles();
    return roles.some(role => role.name.toLowerCase() === roleName.toLowerCase());
  } catch (error) {
    console.error('Error checking role existence:', error);
    throw error;
  }
};

// Toggle role active status
export const toggleRoleActive = async (id: string): Promise<Role> => {
  try {
    const role = await getRoleById(id);
    const response = await api.put(`/roles/${id}`, {
      is_active: !role.is_active
    });
    return unwrap(response);
  } catch (error) {
    console.error(`Error toggling role ${id}:`, error);
    throw error;
  }
};

// Get roles by status
export const getRolesByStatus = async (isActive: boolean): Promise<Role[]> => {
  try {
    const response = await api.get('/roles', {
      params: { is_active: isActive }
    });
    return unwrap(response);
  } catch (error) {
    console.error(`Error fetching ${isActive ? 'active' : 'inactive'} roles:`, error);
    throw error;
  }
};

// Get roles with pagination
export const getRolesPaginated = async (
  page: number = 1,
  limit: number = 10,
  filters?: any
): Promise<{
  data: Role[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}> => {
  try {
    const params = {
      page,
      limit,
      ...filters
    };
    const response = await api.get('/roles/paginated', { params });
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching paginated roles:', error);
    throw error;
  }
};

// Duplicate role
export const duplicateRole = async (id: string, newName: string): Promise<Role> => {
  try {
    const role = await getRoleById(id);
    const roleData = {
      name: newName,
      description: role.description ? `${role.description} (Copy)` : 'Copy',
      permissions: { ...role.permissions },
      is_active: role.is_active
    };
    return await createRole(roleData);
  } catch (error) {
    console.error(`Error duplicating role ${id}:`, error);
    throw error;
  }
};

// Search roles
export const searchRoles = async (query: string): Promise<Role[]> => {
  try {
    const response = await api.get('/roles/search', {
      params: { q: query }
    });
    return unwrap(response);
  } catch (error) {
    console.error(`Error searching roles with query "${query}":`, error);
    throw error;
  }
};

// Get role statistics
export const getRoleStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
}> => {
  try {
    const response = await api.get('/roles/stats');
    return unwrap(response);
  } catch (error) {
    console.error('Error fetching role statistics:', error);
    throw error;
  }
};

export default {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  updateRolePermissions,
  getAllPermissions,
  roleExists,
  toggleRoleActive,
  getRolesByStatus,
  getRolesPaginated,
  duplicateRole,
  searchRoles,
  getRoleStats,
};