// src/lib/termsConditionsApi.ts
import { api, unwrap } from "../lib/Api";

export type TermsCondition = {
  id: number;
  vendor_id: number;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
};

const TermsConditionsApi = {
  getAllTC: async (): Promise<TermsCondition[]> =>
    unwrap(api.get("/terms-conditions")),

  getByIdTC: async (id: number | string): Promise<TermsCondition> =>
    unwrap(api.get(`/terms-conditions/${id}`)),

  getByIdVendorTC: async (id: number | string): Promise<TermsCondition> =>
    unwrap(api.get(`/terms-conditions/vendor/${id}`)),

  createTC: async (payload: Partial<TermsCondition>): Promise<TermsCondition> =>
    unwrap(api.post("/terms-conditions", payload)),

  updateTC: async (
    id: number | string,
    payload: Partial<TermsCondition>
  ): Promise<TermsCondition> =>
    unwrap(api.put(`/terms-conditions/${id}`, payload)),

  updateIsDefaultTC: async (
    id: number | string,
    is_default: boolean
  ): Promise<any> =>
    unwrap(api.put(`/terms-conditions/setIsDefault/${id}`, { is_default })),

  deleteTC: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/terms-conditions/${id}`)),
};

export default TermsConditionsApi;
