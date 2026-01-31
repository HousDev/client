// src/lib/requestMaterialApi.ts
import { api, unwrap } from "../lib/Api";

export type RequestMaterialItem = {
  itemId: number | string;
  required_quantity: number;
};

export type RequestMaterial = {
  id: number | string;
  request_no: string;
  userId: number | string;
  projectId: number | string;
  buildingId: number | string;
  floorId: number | string;
  flatId?: number | string | null;
  commonAreaId?: number | string | null;
  work: string;
  start_date: string;
  remark?: string;
  status: "draft" | "pending" | "approved";
  created_at: string;
  updated_at: string;
  materials: RequestMaterialItem[];
};

export const RequestMaterialApi = {
  // 1️⃣ Get all request materials
  getAll: async (): Promise<RequestMaterial[]> =>
    unwrap(api.get("/requestMaterial")),

  // 2️⃣ Create a new request material
  create: async (payload: Partial<RequestMaterial>): Promise<RequestMaterial> =>
    unwrap(api.post("/requestMaterial", payload)),
  
  createPOMaterialRequest: async (payload: Partial<RequestMaterial>): Promise<RequestMaterial> =>
    unwrap(api.post("/requestMaterial/po-request", payload)),

  // 3️⃣ Update status
  updateStatus: async (
    id: string | number,
    status: string,
    userId: string
  ): Promise<any> =>
    unwrap(
      api.put(`/requestMaterial/status/${id}`, { status, user_id: userId })
    ),

  //update request material items
  updateItems: async (payload: any): Promise<any> =>
    unwrap(api.put(`/requestMaterial/update-items`, payload)),
};

export default RequestMaterialApi;
