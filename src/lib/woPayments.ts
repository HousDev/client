import { api, unwrap } from "./Api";

/**
 * Create WO payment
 * Uses multipart/form-data because of payment_proof upload
 */
async function createWoPayment(payload: any) {
  const res: any = await api.post("/wo_payments", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Get all WO payments (ADMIN)
 */
async function getWoPayments() {
  const res: any = await api.get("/wo_payments");
  return unwrap(res);
}

/**
 * Get all WO payments History (ADMIN)
 */
async function getWoPaymentsHistory() {
  const res: any = await api.get("/wo_payments/history");
  return unwrap(res);
}

/**
 * Update WO payment (ADMIN)
 * payment_proof is optional
 */
async function updateWoPayment(id: number | string, payload: any) {
  const res: any = await api.put(`/wo_payments/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Delete WO payment (ADMIN)
 */
async function deleteWoPayment(id: number | string) {
  const res: any = await api.delete(`/wo_payments/${id}`);
  return unwrap(res);
}

const woPaymentApi = {
  createWoPayment,
  getWoPayments,
  getWoPaymentsHistory,
  updateWoPayment,
  deleteWoPayment,
};

export default woPaymentApi;