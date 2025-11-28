// src/lib/poTypeApi.ts
import { api, unwrap } from "./Api";

/* ----------------------------------------------
   Types
---------------------------------------------- */

export interface POType {
  id: number | string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface POTypeFormData {
  name: string;
  description?: string;
  is_active?: boolean;
}

/* ----------------------------------------------
   API FUNCTIONS
---------------------------------------------- */

/** Get all PO Types */
export async function getPOTypes(): Promise<POType[]> {
  const res = await api.get("/po_types");
  return unwrap(res);
}

/** Get PO Type by id */
export async function getPOTypeById(id: number | string): Promise<POType> {
  const res = await api.get(`/po_types/${id}`);
  return unwrap(res);
}

/** Create PO Type */
export async function createPOType(
  payload: POTypeFormData
): Promise<POType> {
  const res = await api.post("/po_types", payload);
  return unwrap(res);
}

/** Update PO Type */
export async function updatePOType(
  id: number | string,
  payload: POTypeFormData
): Promise<POType> {
  const res = await api.put(`/po_types/${id}`, payload);
  return unwrap(res);
}

/** Delete PO Type */
export async function deletePOType(
  id: number | string
): Promise<{ message: string }> {
  const res = await api.delete(`/po_types/${id}`);
  return unwrap(res);
}

/* ----------------------------------------------
   Default Export
---------------------------------------------- */
const poTypeApi = {
  getPOTypes,
  getPOTypeById,
  createPOType,
  updatePOType,
  deletePOType,
};

export default poTypeApi;
