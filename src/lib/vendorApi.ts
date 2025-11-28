// src/lib/vendorApi.ts
import { api, unwrap } from "../lib/Api";

/* ----------------------------------------------
   Types
---------------------------------------------- */

export interface Vendor {
  id?: number | string;
  name: string;
  category_name: string; // merged category
  pan_number?: string | null;
  gst_number?: string | null;

  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;

  office_street?: string | null;
  office_city?: string | null;
  office_state?: string | null;
  office_pincode?: string | null;
  office_country?: string | null;

  company_email?: string | null;
  company_phone?: string | null;

  manager_name?: string | null;
  manager_email?: string | null;
  manager_phone?: string | null;

  phone_country_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type VendorFormData = Omit<Vendor, "id" | "created_at" | "updated_at">;

/* ----------------------------------------------
   Vendor API functions
---------------------------------------------- */

/** Get vendor list with optional search */
export async function getVendors(q?: string): Promise<Vendor[]> {
  const res = await api.get("/vendors", { params: q ? { q } : undefined });
  return unwrap(res);
}

/** Get single vendor by ID */
export async function getVendorById(id: number | string): Promise<Vendor> {
  const res = await api.get(`/vendors/${id}`);
  return unwrap(res);
}

/** Create a new vendor */
export async function createVendor(payload: VendorFormData): Promise<Vendor> {
  const res = await api.post("/vendors", payload);
  return unwrap(res);
}

/** Update vendor */
export async function updateVendor(id: number | string, payload: VendorFormData): Promise<Vendor> {
  const res = await api.put(`/vendors/${id}`, payload);
  return unwrap(res);
}

/** Delete vendor */
export async function deleteVendor(id: number | string): Promise<{ message: string }> {
  const res = await api.delete(`/vendors/${id}`);
  return unwrap(res);
}

/* ----------------------------------------------
   Default export (optional convenience)
---------------------------------------------- */
export const vendorApi = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
};

export default vendorApi;
