import { api, unwrap } from "./Api";

/**
 * Get all WO bills
 */
async function getWoBills() {
  const res: any = await api.get("/wo-bills");
  return unwrap(res);
}

/**
 * Get WO bill by ID
 */
async function getWoBillById(id: number | string) {
  const res: any = await api.get(`/wo-bills/${id}`);
  return unwrap(res);
}

/**
 * Get bills by Work Order ID
 */
async function getBillsByWoId(woId: number | string) {
  const res: any = await api.get(`/wo-bills/work-order/${woId}`);
  return unwrap(res);
}

/**
 * Create WO bill
 */
async function createWoBill(payload: any) {
  const res: any = await api.post("/wo-bills", payload);
  return unwrap(res);
}

/**
 * Update WO bill
 */
async function updateWoBill(id: number | string, payload: any) {
  const res: any = await api.put(`/wo-bills/${id}`, payload);
  return unwrap(res);
}

/**
 * Delete WO bill
 */
async function deleteWoBill(id: number | string) {
  const res: any = await api.delete(`/wo-bills/${id}`);
  return unwrap(res);
}

const woBillsApi = {
  getWoBills,
  getWoBillById,
  getBillsByWoId,
  createWoBill,
  updateWoBill,
  deleteWoBill,
};

export default woBillsApi;
