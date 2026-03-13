import { api, unwrap } from "./Api";

/**
 * Get all WO bill
 */
async function getWoBills() {
  const res: any = await api.get("/wo-bill");
  return unwrap(res);
}

/**
 * Get WO bill by ID
 */
async function getWoBillById(id: number | string) {
  const res: any = await api.get(`/wo-bill/${id}`);
  return unwrap(res);
}

/**
 * Get bill by Work Order ID
 */
async function getBillsByWoId(woId: number | string) {
  const res: any = await api.get(`/wo-bill/work-order/${woId}`);
  return unwrap(res);
}

/**
 * Create WO bill
 */
async function createWoBill(payload: any) {
  const res: any = await api.post("/wo-bill", payload);
  return unwrap(res);
}

/**
 * Update WO bill
 */
async function updateWoBill(id: number | string, payload: any) {
  const res: any = await api.put(`/wo-bill/${id}`, payload);
  return unwrap(res);
}

/**
 * Update WO bill status
 */
async function updateWoBillStatus(id: number | string, payload: any) {
  const res: any = await api.put(`/wo-bill/bill-status/${id}`, payload);
  return unwrap(res);
}

/**
 * Delete WO bill
 */
async function deleteWoBill(id: number | string) {
  const res: any = await api.delete(`/wo-bill/${id}`);
  return unwrap(res);
}

const woBillsApi = {
  getWoBills,
  getWoBillById,
  getBillsByWoId,
  createWoBill,
  updateWoBill,
  deleteWoBill,
  updateWoBillStatus,
};

export default woBillsApi;
