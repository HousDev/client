// // src/lib/serviceOrderApi.ts
// import { api, unwrap } from './Api';

// export interface ServiceOrderPayload {
//   id?: string;
//   so_number?: string;
//   vendor_id: string;
//   project_id: string;
//   service_type_id?: string;
//   service_name: string;
//   description?: string;
//   start_date: string;
//   end_date?: string;
//   duration_days?: number;
//   estimated_cost?: number;
//   actual_cost?: number;
//   status?: string;
//   priority?: string;
//   location?: string;
//   supervisor_name?: string;
//   supervisor_phone?: string;
//   notes?: string;
//   created_by?: string | null;
//   created_at?: string;
// }

// // ---------- Service Orders ----------
// export async function getServiceOrders(search?: string) {
//   const url = search ? `/service-orders?q=${encodeURIComponent(search)}` : `/service-orders`;
//   return unwrap(api.get(url));
// }

// export async function getServiceOrder(id: string) {
//   return unwrap(api.get(`/service-orders/${id}`));
// }

// export async function createServiceOrder(payload: ServiceOrderPayload) {
//   return unwrap(api.post(`/service-orders`, payload));
// }

// export async function updateServiceOrder(id: string, payload: ServiceOrderPayload) {
//   return unwrap(api.put(`/service-orders/${id}`, payload));
// }

// export async function deleteServiceOrder(id: string) {
//   return unwrap(api.delete(`/service-orders/${id}`));
// }

// export async function bulkUpdateStatus(ids: string[], status: string) {
//   return unwrap(api.post(`/service-orders/bulk/status`, { ids, status }));
// }

// export async function bulkDeleteServiceOrders(ids: string[]) {
//   return unwrap(api.post(`/service-orders/bulk/delete`, { ids }));
// }

// // ---------- Lookups (vendors/projects/serviceTypes) ----------
// /**
//  * Expected response shape:
//  * {
//  *   vendors: [{ id, name }, ...],
//  *   projects: [{ id, name }, ...],
//  *   serviceTypes: [{ id, name }, ...]
//  * }
//  *
//  * Backend endpoint: GET /api/lookups
//  * If you don't have this backend route yet, the frontend will fallback to seeded lookups.
//  */
// export async function getLookups() {
//   return unwrap(api.get('/lookups'));
// }



// src/lib/serviceOrderApi.ts
import { api, unwrap } from './Api';

export interface ServiceOrderPayload {
  id?: string;
  so_number?: string;
  vendor_id: string | number;
  project_id: string | number;
  service_type_id: string | number;
  building_id?: string | number | null;
  so_date: string;
  start_date: string;
  end_date?: string;
  
  // Financial fields
  sub_total: number;
  discount_percentage: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst_amount: number;
  grand_total: number;
  
  // Payment fields
  payment_terms?: string;
  terms_and_conditions?: string;
  advance_amount: number;
  total_paid: number;
  balance_amount: number;
  
  // Status fields
  status: 'draft' | 'approve' | 'authorize' | 'reject';
  service_status: 'pending' | 'partial' | 'completed';
  selected_terms_ids?: string;
  note?: string;
  
  created_by?: string | null;
  created_at?: string;
}

// ---------- Service Orders ----------
export async function getServiceOrders(search?: string) {
  const url = search ? `/service-orders?q=${encodeURIComponent(search)}` : `/service-orders`;
  return unwrap(api.get(url));
}

export async function getServiceOrder(id: string) {
  return unwrap(api.get(`/service-orders/${id}`));
}

export async function createServiceOrder(payload: ServiceOrderPayload) {
  return unwrap(api.post(`/service-orders`, payload));
}

export async function updateServiceOrder(id: string, payload: Partial<ServiceOrderPayload>) {
  return unwrap(api.put(`/service-orders/${id}`, payload));
}

export async function deleteServiceOrder(id: string) {
  return unwrap(api.delete(`/service-orders/${id}`));
}

export async function bulkUpdateStatus(ids: string[], status: string, field: string = 'status') {
  return unwrap(api.post(`/service-orders/bulk/status`, { ids, status, field }));
}

export async function bulkDeleteServiceOrders(ids: string[]) {
  return unwrap(api.post(`/service-orders/bulk/delete`, { ids }));
}