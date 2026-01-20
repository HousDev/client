// src/lib/departmentsApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export const departmentsApi = {
  // Get all departments
  async getAll(): Promise<Department[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching departments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch departments');
    }
  },

  // Get active departments only
  async getActive(): Promise<Department[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments/active`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching active departments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch active departments');
    }
  },

  // Create new department
  async create(department: Omit<Department, 'id'>): Promise<Department> {
    try {
      const response = await axios.post(`${API_BASE_URL}/departments`, department);
      return response.data;
    } catch (error: any) {
      console.error('Error creating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to create department');
    }
  },

  // Update department
  async update(id: string, department: Partial<Department>): Promise<Department> {
    try {
      const response = await axios.put(`${API_BASE_URL}/departments/${id}`, department);
      return response.data;
    } catch (error: any) {
      console.error('Error updating department:', error);
      throw new Error(error.response?.data?.message || 'Failed to update department');
    }
  },

  // Delete departmenta
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/departments/${id}`);
    } catch (error: any) {
      console.error('Error deleting department:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete department');
    }
  }
};