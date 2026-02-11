import { api, unwrap } from "../lib/Api";

export type ServiceOrder = {
  id: number;
  so_number: string;
  vendor_id: number;
  project_id: number;
  service_type_id: number;
  building_id?: number | null;

  so_date?: string | null;
  delivery_date: string;

  sub_total: number;
  discount_percentage?: number;
  discount_amount?: number;
  taxable_amount?: number;

  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  total_gst_amount?: number;
  grand_total: number;

  payment_terms?: string | null;
  terms_and_conditions?: string | null;

  advance_amount?: number;
  total_paid?: number;
  balance_amount?: number;

  status: "draft" | "approve" | "authorize" | "reject";
  service_status: "pending" | "partial" | "completed";

  selected_terms_ids?: string | null;
  note?: string | null;

  created_by: string;

  created_at?: string;
  updated_at?: string;
};

const ServiceOrdersApi = {
  /**
   * GET all service orders
   */
  getAll: async (): Promise<ServiceOrder[]> =>
    unwrap(api.get("/service-orders")),

  /**
   * GET all service orders
   */
  getTrackings: async (): Promise<ServiceOrder[]> =>
    unwrap(api.get("/service-orders/service-order-tracking")),

  /**
   * GET service order by ID
   */
  getById: async (id: number | string): Promise<ServiceOrder> =>
    unwrap(api.get(`/service-orders/${id}`)),

  /**
   * GET service order by ID
   */
  getServiceOrderServicesById: async (
    id: number | string,
  ): Promise<ServiceOrder> =>
    unwrap(api.get(`/service-orders/service-order-services/${id}`)),

  /**
   * GET service orders by vendor
   */
  getByVendor: async (vendor_id: number | string): Promise<ServiceOrder[]> =>
    unwrap(api.get(`/service-orders/vendor/${vendor_id}`)),

  nextSequence: async (): Promise<{
    ok: boolean;
    id: number;
    so_number: string;
    last_number: number;
  }> => unwrap(api.get(`/service-orders/next`)),

  /**
   * CREATE service order
   */
  create: async (payload: Partial<any>): Promise<ServiceOrder> =>
    unwrap(api.post("/service-orders", payload)),

  /**
   * UPDATE service order
   */
  update: async (
    id: number | string,
    payload: Partial<any>,
  ): Promise<ServiceOrder> => unwrap(api.put(`/service-orders/${id}`, payload)),

  /**
   * UPDATE service order status
   */
  updateStatus: async (
    id: number | string,
    payload: { status: string; note: string },
  ): Promise<any> => unwrap(api.put(`/service-orders/status/${id}`, payload)),

  /**
   * DELETE service order
   */
  delete: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/service-orders/${id}`)),

  /**
   * DELETE service order services
   */
  deleteServiceOrderService: async (
    soId: number | string,
    serviceId: number | string,
  ): Promise<any> =>
    unwrap(
      api.delete(`/service-orders/serviceOrderService/${soId}/${serviceId}`),
    ),
};

export default ServiceOrdersApi;
