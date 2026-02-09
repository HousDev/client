// src/lib/servicesApi.ts
import { api, unwrap } from "../lib/Api";

/* ---------------- types ---------------- */

export type Service = {
  id: number | string;
  service_code: string;
  service_name: string;
  category: string; // default: "service"
  service_category?: string;
  service_sub_category?: string;
  description?: string;
  unit: string;
  igst_rate?: number;
  cgst_rate?: number;
  sgst_rate?: number;
  standard_rate: number;
  is_active?: boolean;
};

/* ---------------- api ---------------- */

export const ServicesApi = {
  // ✅ GET ALL SERVICES
  getServices: async (): Promise<Service[]> => unwrap(api.get("/services")),

  // ✅ GET LAST SERVICE CODE
  getLastServiceCode: async (): Promise<{ lastServiceCode: string }> =>
    unwrap(api.get("/services/last-code")),

  // ✅ GET SINGLE SERVICE
  getService: async (id: string | number): Promise<Service> =>
    unwrap(api.get(`/services/${id}`)),

  // ✅ CREATE SERVICE
  createService: async (payload: Partial<Service>): Promise<Service> =>
    unwrap(api.post("/services", payload)),

  // ✅ UPDATE SERVICE
  updateService: async (
    id: string | number,
    payload: Partial<Service>,
  ): Promise<Service> => unwrap(api.put(`/services/${id}`, payload)),

  // ✅ DELETE SERVICE
  deleteService: async (id: string | number): Promise<any> =>
    unwrap(api.delete(`/services/${id}`)),

  // ✅ TOGGLE ACTIVE STATUS
  toggleService: async (id: string | number): Promise<Service> =>
    unwrap(api.patch(`/services/${id}/toggle-active`)),

  // ✅ BULK IMPORT SERVICES
  addDataByImport: async (payload: Partial<Service>[]): Promise<any> =>
    unwrap(api.post("/services/bulk-import-services", payload)),

  // ✅ GET ALL SERVICE CATEGORIES
  getServiceCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get("/services/categories/categories");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching service categories:", error);
      return [];
    }
  },

  // ✅ GET ALL SERVICE SUB-CATEGORIES
  getServiceSubCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get("/services/categories/sub-categories");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching service sub-categories:", error);
      return [];
    }
  },

  // ✅ GET SERVICES BY CATEGORY
  getServicesByCategory: async (category: string): Promise<Service[]> => {
    try {
      const response = await api.get(`/services/category/${category}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching services for category ${category}:`, error);
      return [];
    }
  },

  // ✅ GET SERVICES BY SUB-CATEGORY
  getServicesBySubCategory: async (subCategory: string): Promise<Service[]> => {
    try {
      const response = await api.get(`/services/sub-category/${subCategory}`);
      return response.data || [];
    } catch (error) {
      console.error(
        `Error fetching services for sub-category ${subCategory}:`,
        error,
      );
      return [];
    }
  },
};

export default ServicesApi;
