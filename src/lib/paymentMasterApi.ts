// src/lib/paymentMastersApi.ts
import { api, unwrap } from "../lib/Api";

export type PaymentMaster = {
  id: number;
  event_trigger: string;
  percentPayment: string;
  firstText: string;
  materialPercent?: string | null;
  secondText?: string | null;
  gracePeriod?: string | null;
  thirdText?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export const PaymentMastersApi = {
  // Get all payment masters
  getActivePaymentMasters: async (): Promise<PaymentMaster[]> =>
    unwrap(api.get("/payment-master/activeTerms")),
  getPaymentMasters: async (): Promise<PaymentMaster[]> =>
    unwrap(api.get("/payment-master")),
  // Get single payment master by ID
  getPaymentMaster: async (id: number | string): Promise<PaymentMaster> =>
    unwrap(api.get(`/payment-master/${id}`)),

  // Create new payment master
  createPaymentMaster: async (
    payload: Omit<
      PaymentMaster,
      "id" | "is_active" | "created_at" | "updated_at"
    >,
  ): Promise<PaymentMaster> => unwrap(api.post("/payment-master", payload)),

  // Update payment master
  updatePaymentMaster: async (
    id: number | string,
    payload: Partial<PaymentMaster>,
  ): Promise<PaymentMaster> =>
    unwrap(api.put(`/payment-master/${id}`, payload)),

  // Toggle active / inactive
  toggleActive: async (id: number | string): Promise<any> =>
    unwrap(api.patch(`/payment-master/${id}/toggle-active`)),

  bulkDeletePaymentMasters: async (ids: any): Promise<any> =>
    unwrap(
      api.delete("/payment-master/bulk-delete", {
        data: { ids }, // ⚠️ axios requires body inside `data` for DELETE
      }),
    ),

  // Delete payment master
  deletePaymentMaster: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/payment-master/${id}`)),

  // 🔥 BULK toggle active / inactive
  bulkToggleActive: async (ids: any): Promise<any> =>
    unwrap(
      api.patch("/payment-master/bulk-toggle-active", {
        ids,
      }),
    ),

  // 🗑️ BULK delete payment masters
};

export default PaymentMastersApi;
