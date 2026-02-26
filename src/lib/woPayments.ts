import { api, unwrap } from "./Api";

/**
 * Create WO Payment History
 * (Supports multipart/form-data if payment_proof exists)
 */
async function createWoPaymentHistory(payload: any) {
  const res: any = await api.post("/wo-payment-history", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Get all WO Payment History
 */
async function getWoPaymentHistory() {
  const res: any = await api.get("/wo-payment-history");
  return unwrap(res);
}

/**
 * Get WO Payment History By ID
 */
async function getWoPaymentHistoryById(id: number | string) {
  const res: any = await api.get(`/wo-payment-history/${id}`);
  return unwrap(res);
}

/**
 * Update WO Payment History
 */
async function updateWoPaymentHistory(id: number | string, payload: any) {
  const res: any = await api.put(`/wo-payment-history/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Delete WO Payment History
 */
async function deleteWoPaymentHistory(id: number | string) {
  const res: any = await api.delete(`/wo-payment-history/${id}`);
  return unwrap(res);
}

const woPaymentHistoryApi = {
  createWoPaymentHistory,
  getWoPaymentHistory,
  getWoPaymentHistoryById,
  updateWoPaymentHistory,
  deleteWoPaymentHistory,
};

export default woPaymentHistoryApi;
