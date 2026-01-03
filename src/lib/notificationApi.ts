// src/lib/notificationsApi.ts
import { api, unwrap } from "../lib/Api";

export type Notification = {
  id: number;
  title: string;
  description: string;
  type: string; // info | warning | success | error (example)
  seen: boolean;
  created_at: string;
};

export const NotificationsApi = {
  // Get all notifications
  getNotifications: async (): Promise<Notification[]> =>
    unwrap(api.get("/notifications")),

  // Get single notification by ID
  getNotification: async (id: number | string): Promise<Notification> =>
    unwrap(api.get(`/notifications/${id}`)),

  // Create new notification
  createNotification: async (
    payload: Pick<Notification, "title" | "description" | "type">
  ): Promise<Notification> => unwrap(api.post("/notifications", payload)),

  // Mark notification as seen
  markAsSeen: async (id: number | string): Promise<any> =>
    unwrap(api.put(`/notifications/${id}/seen`)),

  //Mark all notifications as seen
  markAllAsSeen: async (): Promise<any> =>
    unwrap(api.put(`/notifications/mark-all-seen`)),

  // Delete notification
  deleteNotification: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/notifications/${id}`)),
};

export default NotificationsApi;
