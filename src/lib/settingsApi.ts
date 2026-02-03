// src/lib/settingsApi.ts
import { api } from "./Api";

// ─── TYPES ────────────────────────────────────────────────────────────────
export type UserProfileData = {
  id: string | number;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  department: string | null;
  designation: string | null;
  created_at: string;
};

export type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
};

export type SystemSettingsData = {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  logo: string | null;
  favicon: string | null;
  timezone: string;
  dateFormat: string;
  language: string;
};

// ─── API OBJECT ───────────────────────────────────────────────────────────
export const SettingsApi = {
  // ── Profile ─────────────────────────────────────────────────────────────
  getProfile: async (): Promise<UserProfileData> => {
    const res = await api.get("/settings/profile");
    return res.data.data;
  },

  updateProfile: async (data: { full_name: string }): Promise<UserProfileData> => {
    const res = await api.put("/settings/profile", data);
    return res.data.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatar: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await api.post("/settings/profile/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;                 // { avatar: "http://…/uploads/xxx.jpg" }
  },

  removeAvatar: async (): Promise<{ avatar: null }> => {
    const res = await api.delete("/settings/profile/avatar");
    return res.data.data;
  },

  // ── Notifications ───────────────────────────────────────────────────────
  getNotificationPreferences: async (): Promise<NotificationPreferences> => {
    const res = await api.get("/settings/notifications");
    return res.data.data;
  },

  updateNotificationPreferences: async (
    prefs: NotificationPreferences
  ): Promise<NotificationPreferences> => {
    const res = await api.put("/settings/notifications", prefs);
    return res.data.data;
  },

  // ── Password ────────────────────────────────────────────────────────────
  changePassword: async (payload: {
    current_password: string;
    new_password: string;
  }): Promise<{ message: string }> => {
    const res = await api.post("/settings/password/change", payload);
    return res.data;                      // { success: true, message: "…" }
  },

  // ── System (admin) ──────────────────────────────────────────────────────
  getSystemSettings: async (): Promise<SystemSettingsData> => {
    const res = await api.get("/settings/system");
    return res.data.data;
  },

  updateSystemSettings: async (
    settings: Partial<SystemSettingsData>
  ): Promise<SystemSettingsData> => {
    const res = await api.put("/settings/system", settings);
    return res.data.data;
  },

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append("logo", file);

    const response = await api.post("/settings/system/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Return the full settings object from response.data
    return response.data.data;
  },

  removeLogo: async (): Promise<{ logo: null }> => {
    const res = await api.delete("/settings/system/logo");
    return res.data.data;
  },

  uploadFavicon: async (file: File): Promise<{ favicon: string }> => {
    const formData = new FormData();
    formData.append("favicon", file);
    const res = await api.post("/settings/system/favicon", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data;
  },

  removeFavicon: async (): Promise<{ favicon: null }> => {
    const res = await api.delete("/settings/system/favicon");
    return res.data.data;
  },
};