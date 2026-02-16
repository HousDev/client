import { api, unwrap } from "../lib/Api";

/**
 * Reminder status type
 */
export type PoPaymentReminderStatus = "seen" | "unseen";

/**
 * PO Payment Reminder type
 */
export type PoPaymentReminder = {
  id: number;

  po_id: number;
  po_payment_id: number;
  po_number: string;
  vendor: string;

  total_amount: number;
  total_paid: number;
  balance_amount: number;

  due_date: string; // YYYY-MM-DD

  status: PoPaymentReminderStatus;

  seen_by: number | null;

  created_at: string;
};

export const PoPaymentRemindersApi = {
  /**
   * Get all payment reminders
   */
  getReminders: async (): Promise<PoPaymentReminder[]> =>
    unwrap(api.get("/po-payment-reminders")),

  /**
   * Get single reminder by ID
   */
  getReminder: async (id: number | string): Promise<PoPaymentReminder> =>
    unwrap(api.get(`/po-payment-reminders/${id}`)),

  /**
   * Create new payment reminder
   */
  createReminder: async (
    payload: Pick<
      PoPaymentReminder,
      | "po_id"
      | "po_payment_id"
      | "po_number"
      | "vendor"
      | "total_amount"
      | "total_paid"
      | "balance_amount"
      | "due_date"
    >,
  ): Promise<{ message: string; reminder: PoPaymentReminder }> =>
    unwrap(api.post("/po-payment-reminders", payload)),

  /**
   * Mark reminder as seen
   */
  markAsSeen: async (payload: any): Promise<any> =>
    unwrap(api.put(`/po-payment-reminders/${payload.id}/seen`, payload)),

  /**
   * Mark all reminders as seen
   */
  markAllAsSeen: async (user_id: number): Promise<any> =>
    unwrap(api.put("/po-payment-reminders/seen-all", { user_id })),

  /**
   * Delete reminder
   */
  deleteReminder: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/po-payment-reminders/${id}`)),
};

export default PoPaymentRemindersApi;
