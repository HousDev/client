// // src/lib/poApi.ts
// import { api, unwrap } from "../lib/Api";

// /* ----------------------------------------------
//    Types
// ---------------------------------------------- */

// export interface POItem {
//   id?: string;
//   item_id: string;
//   item_code: string;
//   item_name: string;
//   description: string;
//   hsn_code: string;
//   quantity: number;
//   unit: string;
//   rate: number;
//   amount: number;
//   gst_rate: number;
//   gst_amount: number;
// }

// export interface PurchaseOrder {
//   id?: number | string;
//   po_number: string;
//   vendor_id: string;
//   project_id: string;
//   po_type_id: string;
//   po_date: string;
//   delivery_date?: string;

//   is_interstate: boolean;

//   items: POItem[];

//   subtotal: number;
//   discount_percentage: number;
//   discount_amount: number;

//   taxable_amount?: number;

//   cgst_amount: number;
//   sgst_amount: number;
//   igst_amount: number;

//   total_gst_amount: number;
//   grand_total: number;

//   payment_terms_id: string;
//   advance_amount: number;

//   selected_terms_ids: string[];
//   terms_and_conditions: string;
//   notes?: string;

//   status?: string;
//   material_status?: string;
//   payment_status?: string;

//   created_by?: string | number;
//   created_at?: string;
//   updated_at?: string;
// }

// export type POFormData = Omit<
//   PurchaseOrder,
//   "id" | "created_at" | "updated_at" | "status" | "material_status" | "payment_status"
// >;

// /* ----------------------------------------------
//    Purchase Order API
// ---------------------------------------------- */

// /** Get All Purchase Orders */
// export async function getPOs(q?: string): Promise<PurchaseOrder[]> {
//   const res = await api.get("/purchase-orders", { params: q ? { q } : undefined });
//   return unwrap(res);
// }

// /** Get Purchase Order by ID */
// export async function getPOById(id: number | string): Promise<PurchaseOrder> {
//   const res = await api.get(`/purchase-orders/${id}`);
//   return unwrap(res);
// }

// /** Create Purchase Order */
// export async function createPO(payload: POFormData): Promise<PurchaseOrder> {
//   const res = await api.post("/purchase-orders", payload);
//   return unwrap(res);
// }

// /** Update PO */
// export async function updatePO(id: number | string, payload: POFormData): Promise<PurchaseOrder> {
//   const res = await api.put(`/purchase-orders/${id}`, payload);
//   return unwrap(res);
// }

// /** Delete PO */
// export async function deletePO(id: number | string): Promise<{ message: string }> {
//   const res = await api.delete(`/purchase-orders/${id}`);
//   return unwrap(res);
// }

// /* ----------------------------------------------
//    PO Sequence
// ---------------------------------------------- */

// export async function nextSequence(): Promise<{ po_number: string }> {
//   const res = await api.post("/po-sequences/next", {});
//   return unwrap(res);
// }

// /* ----------------------------------------------
//    Tracking
// ---------------------------------------------- */

// export async function createTracking(records: any[]): Promise<any> {
//   const res = await api.post("/po-material-tracking", { records });
//   return unwrap(res);
// }

// /* ----------------------------------------------
//    Payments
// ---------------------------------------------- */

// export async function createPayment(payload: any): Promise<any> {
//   const res = await api.post("/po-payments", payload);
//   return unwrap(res);
// }

// /* ----------------------------------------------
//    Masters
// ---------------------------------------------- */

// export async function getVendors(active = true) {
//   const res = await api.get("/vendors", { params: active ? { active: 1 } : undefined });
//   return unwrap(res);
// }

// export async function getProjects() {
//   const res = await api.get("/projects");
//   return unwrap(res);
// }

// export async function getItems() {
//   const res = await api.get("/items");
//   return unwrap(res);
// }

// export async function getPOTypes() {
//   const res = await api.get("/po-types");
//   return unwrap(res);
// }

// export async function getTerms() {
//   const res = await api.get("/terms");
//   return unwrap(res);
// }

// export async function getPaymentTerms() {
//   const res = await api.get("/payment-terms");
//   return unwrap(res);
// }

// /* ----------------------------------------------
//    Default export
// ---------------------------------------------- */

// const poApi = {
//   getPOs,
//   getPOById,
//   createPO,
//   updatePO,
//   deletePO,

//   nextSequence,
//   createTracking,
//   createPayment,

//   getVendors,
//   getProjects,
//   getItems,
//   getPOTypes,
//   getTerms,
//   getPaymentTerms,
// };

// export default poApi;

// // src/lib/poApi.ts
// import { api } from "./Api"; // your existing axios instance

// /* PO API wrapper used by PurchaseOrdersPro */
// const poApi = {
//   // POs
//   async getPOs() {
//     const res = await api.get("/purchase-orders");
//     return res.data;
//   },

//   async createPO(payload: any) {
//     const res = await api.post("/purchase-orders", payload);
//     return res.data;
//   },

//   // tracking and payments
//   async createTracking(records: any[]) {
//     // expects body: { records } OR array depending on your backend; we send { records }
//     const res = await api.post("/po-material-tracking", { records });
//     return res.data;
//   },

//   async createPayment(payload: any) {
//     const res = await api.post("/po-payments", payload);
//     return res.data;
//   },

//   // supporting lists used in the PO form
//   async getVendors(active = false) {
//     const res = await api.get("/vendors", { params: active ? { active: 1 } : {} });
//     return res.data;
//   },

//   async getProjects() {
//     const res = await api.get("/projects");
//     return res.data;
//   },

//   async getPOTypes() {
//     const res = await api.get("/po-types");
//     return res.data;
//   },

//   async getItems() {
//     const res = await api.get("/items");
//     return res.data;
//   },

//   async getTerms() {
//     const res = await api.get("/terms");
//     return res.data;
//   },

//   async getPaymentTerms() {
//     const res = await api.get("/payment-terms");
//     return res.data;
//   },

//   // sequence generator (server)
//   async nextSequence() {
//     const res = await api.post("/po-sequences/next", {});
//     return res.data;
//   },
// };

// export default poApi;


// src/lib/poApi.ts
import { api, unwrap } from "./Api"; // adjust import path if needed

async function getPOs() {
  const res = await api.get("/purchase-orders");
  return unwrap(res);
}

async function getVendors(active?: boolean) {
  const res = await api.get("/vendors", { params: active ? { active: 1 } : undefined });
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

async function createTracking(records: any[]) {
  const res = await api.post("/po-material-tracking", { records });
  return unwrap(res);
}

async function createPayment(payload: any) {
  const res = await api.post("/po-payments", payload);
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
  createTracking,
  createPayment,
};

export default poApi;
