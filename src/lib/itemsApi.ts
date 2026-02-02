// src/lib/itemsApi.ts
import { api, unwrap } from "../lib/Api";

export type Item = {
  id: number | string;
  item_code: string;
  item_name: string;
  category: string;
  item_category?: string;
  item_sub_category?: string;
  description?: string;
  unit: string;
  hsn_code?: string;
  gst_rate: number;
  standard_rate: number;
  is_active?: boolean;
  location?: string;
};

export const ItemsApi = {
  // ✅ GET ALL ITEMS
  getItems: async (): Promise<Item[]> => unwrap(api.get("/items")),

  // ✅ GET LAST ITEM CODE
  getLastItemCode: async (): Promise<Item[]> =>
    unwrap(api.get("/items/last-code")),

  // ✅ GET SINGLE ITEM
  getItem: async (id: string | number): Promise<Item> =>
    unwrap(api.get(`/items/${id}`)),

  // ✅ CREATE ITEM
  createItem: async (payload: Partial<Item>): Promise<Item> =>
    unwrap(api.post("/items", payload)),

  // ✅ UPDATE ITEM
  updateItem: async (
    id: string | number,
    payload: Partial<Item>,
  ): Promise<Item> => unwrap(api.put(`/items/${id}`, payload)),

  // ✅ DELETE ITEM
  deleteItem: async (id: string | number): Promise<any> =>
    unwrap(api.delete(`/items/${id}`)),

  // ✅ TOGGLE ACTIVE STATUS
  toggleItem: async (id: string | number): Promise<Item> =>
    unwrap(api.patch(`/items/${id}/toggle-active`)),

  // ✅ BULK IMPORT
  addDataByImport: async (payload: Partial<Item>): Promise<Item> =>
    unwrap(api.post("/items/bulk-import-items", payload)),

  // ✅ NEW: GET ALL ITEM CATEGORIES
  getItemCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get("/items/categories/categories");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  },

  // ✅ NEW: GET ALL ITEM SUB-CATEGORIES
  getItemSubCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get("/items/categories/sub-categories");
      return response.data || [];
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      return [];
    }
  },

  // ✅ NEW: GET ITEMS BY CATEGORY
  getItemsByCategory: async (category: string): Promise<Item[]> => {
    try {
      const response = await api.get(`/items/category/${category}`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching items for category ${category}:`, error);
      return [];
    }
  },
};

export default ItemsApi;