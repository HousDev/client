import { api, unwrap } from "./Api";

/**
 * Create PO payment
 * Uses multipart/form-data because of payment_proof upload
 */
async function createPayment(payload: any) {
  const res: any = await api.post("/po-payments", payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Get all PO payments (ADMIN)
 */
async function getPayments() {
  const res: any = await api.get("/po-payments");
  return unwrap(res);
}

/**
 * Get all PO payments History (ADMIN)
 */
async function getPaymentsHistory() {
  const res: any = await api.get("/po-payments/history");
  return unwrap(res);
}

/**
 * Update PO payment (ADMIN)
 * payment_proof is optional
 */
async function updatePayment(id: number | string, payload: any) {
  const res: any = await api.put(`/po-payments/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return unwrap(res);
}

/**
 * Delete PO payment (ADMIN)
 */
async function deletePayment(id: number | string) {
  const res: any = await api.delete(`/po-payments/${id}`);
  return unwrap(res);
}

const poPaymentApi = {
  createPayment,
  getPaymentsHistory,
  getPayments,
  updatePayment,
  deletePayment,
};

export default poPaymentApi;
