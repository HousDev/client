import { api, unwrap } from "./Api"; // adjust import path if needed

async function getPOs() {
  const res = await api.get("/purchase-orders");
  return unwrap(res);
}

async function getVendors(active?: boolean) {
  const res = await api.get("/vendors", {
    params: active ? { active: 1 } : undefined,
  });
  return unwrap(res);
}

async function getProjects() {
  const res = await api.get("/projects");
  return unwrap(res);
}

async function getPOTypes() {
  const res = await api.get("/po-types");
  return unwrap(res);
}

async function getItems() {
  const res = await api.get("/items");
  return unwrap(res);
}

async function getTerms() {
  const res = await api.get("/terms");
  return unwrap(res);
}

async function getPaymentTerms() {
  const res = await api.get("/payment-terms");
  return unwrap(res);
}

async function nextSequence() {
  const res = await api.get("/purchase-orders/next-sequence");
  return unwrap(res);
}

async function createPO(payload: any) {
  const res = await api.post("/purchase-orders", payload);
  return unwrap(res);
}

async function updatePO(id: Number, payload: any) {
  const res = await api.put(`/purchase-orders/${id}`, payload);
  return unwrap(res);
}

async function createTracking(records: any[]) {
  const res = await api.post("/po-material-tracking", { records });
  return unwrap(res);
}

async function createPayment(payload: any) {
  const res = await api.post("/po-payments", payload);
  return unwrap(res);
}

export async function updatePurchaseOrder(id: number | string, payload: any) {
  const res = await api.put(`/purchase-orders/${id}`, payload);
  return unwrap(res);
}

export async function deletePurchaseOrder(id: any) {
  const res = await api.delete(`/purchase-orders/${id}`);
  return unwrap(res);
}

export async function deletePurchaseOrderItem(
  POItemId: any,
  POMaterialTrackingId: any
) {
  const res = await api.delete(
    `/purchase-orders/poItem/${POItemId}/${POMaterialTrackingId}`
  );
  return unwrap(res);
}

export async function getPOsItems() {
  const res = await api.get(`/purchase-orders/purchaseOrderItems`);
  return unwrap(res);
}

export async function updatePurchaseOrderStatus(
  id: number | string,
  status: any
) {
  const res = await api.put(`/purchase-orders/updatePOStatus/${id}`, {
    status,
  });
  return unwrap(res);
}

export async function getPoPdf(id: number) {
  const res = await api.get(`/pdf/po/${id}`);
  return unwrap(res);
}

const poApi = {
  getPOs,
  getVendors,
  getProjects,
  getPOTypes,
  getItems,
  getTerms,
  getPaymentTerms,
  nextSequence,
  createPO,
  updatePO,
  createTracking,
  createPayment,
  updatePurchaseOrder,
  deletePurchaseOrder,
  deletePurchaseOrderItem,
  getPOsItems,
  updatePurchaseOrderStatus,
  getPoPdf,
};

export default poApi;
