import { api, unwrap } from "./Api";

/**
 * Get all inventory items
 * Optional filters can be added later (category, status, lowStock, etc.)
 */
async function getInventory() {
  const res = await api.get("/inventory");
  return unwrap(res);
}

/**
 * Get inventory item by ID
 */
async function getInventoryById(id: number | string) {
  const res = await api.get(`/inventory/${id}`);
  return unwrap(res);
}

/**
 * Create inventory item
 */
async function createInventory(payload: any) {
  const res = await api.post("/inventory", payload);
  return unwrap(res);
}

/**
 * Update inventory item
 */
async function updateInventory(id: number | string, payload: any) {
  const res = await api.put(`/inventory/${id}`, payload);
  return unwrap(res);
}

/**
 * Delete inventory item
 */
async function deleteInventory(id: number | string) {
  const res = await api.delete(`/inventory/${id}`);
  return unwrap(res);
}

const inventoryApi = {
  getInventory,
  getInventoryById,
  createInventory,
  updateInventory,
  deleteInventory,
};

export default inventoryApi;
