// src/lib/itemsApi.ts
import { api, unwrap } from "../lib/Api"; // FIXED — named imports ONLY

export type Item = {
  id: number | string;
  item_code: string;
  item_name: string;
  category: string;
  description?: string;
  unit: string;
  hsn_code?: string;
  gst_rate: number;
  standard_rate: number;
  is_active?: boolean;
};

export const ItemsApi = {
  getItems: async (): Promise<Item[]> => unwrap(api.get("/items")),

  getLastItemCode: async (): Promise<Item[]> =>
    unwrap(api.get("/items/last-code")),

  getItem: async (id: string | number): Promise<Item> =>
    unwrap(api.get(`/items/${id}`)),

  createItem: async (payload: Partial<Item>): Promise<Item> =>
    unwrap(api.post("/items", payload)),

  updateItem: async (
    id: string | number,
    payload: Partial<Item>,
  ): Promise<Item> => unwrap(api.put(`/items/${id}`, payload)),

  deleteItem: async (id: string | number): Promise<any> =>
    unwrap(api.delete(`/items/${id}`)),

  toggleItem: async (id: string | number): Promise<Item> =>
    unwrap(api.patch(`/items/${id}/toggle-active`)),

  addDataByImport: async (payload: Partial<Item>): Promise<Item> =>
    unwrap(api.post("/items/bulk-import-items", payload)),
};

export default ItemsApi;
