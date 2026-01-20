// src/lib/Api.ts
import axios, { AxiosInstance, AxiosError } from "axios";

/* ----- types ----- */
export type Permissions = {
  [key: string]: boolean;
};

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  department?: string;
  is_active: boolean;
  permissions: Permissions;
  password?: string;
  created_at?: string;
  updated_at?: string;
}

/* ----- base URL ----- */
// ✅ FIXED: Correct API base URL
const BASE = "http://localhost:4000/api";
// या production के लिए:
// const BASE = "https://your-domain.com/api";

/* ----- token helpers ----- */
export function getToken(): string | null {
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem("auth_token", token);
    else localStorage.removeItem("auth_token");
  } catch {
    // ignore
  }
}

/* ----- axios instance ----- */
export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* ----- request interceptor: attach token ----- */
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/* ----- response interceptor: central error handling ----- */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response) {
      // 401 Unauthorized handling
      if (error.response.status === 401) {
        setToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

/* ----- helper to unwrap axios response ----- */
export async function unwrap<T>(p: Promise<any>): Promise<T> {
  try {
    const { data } = await p;
    return data as T;
  } catch (err: any) {
    if (err?.response?.data) {
      throw err.response.data;
    }
    if (err?.message) throw new Error(err.message);
    throw err;
  }
}

/* ----- Users API ----- */
export const UsersApi = {
  // Get all users
  list: async (): Promise<UserProfile[]> => {
    try {
      const response = await api.get("/users");
      console.log("Users list API response:", response.data);
      
      // Handle different response formats
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.warn("Unexpected response format:", response.data);
        return [];
      }
    } catch (error: any) {
      console.error("UsersApi.list error:", error);
      throw error;
    }
  },

  // Get user by ID
  get: async (id: string): Promise<UserProfile> => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`UsersApi.get(${id}) error:`, error);
      throw error;
    }
  },

  // Create user
  create: async (payload: any): Promise<UserProfile> => {
    try {
      console.log("Creating user with payload:", payload);
      const response = await api.post("/users", payload);
      console.log("Create user response:", response.data);
      
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error: any) {
      console.error("UsersApi.create error:", error);
      throw error;
    }
  },

  // Update user
  update: async (id: string, payload: any): Promise<UserProfile> => {
    try {
      console.log(`Updating user ${id} with payload:`, payload);
      const response = await api.put(`/users/${id}`, payload);
      
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error: any) {
      console.error(`UsersApi.update(${id}) error:`, error);
      throw error;
    }
  },

  // Delete user
  remove: async (id: string): Promise<void> => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      console.error(`UsersApi.remove(${id}) error:`, error);
      throw error;
    }
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<UserProfile> => {
    try {
      const response = await api.put(`/users/${id}/toggle-active`);
      
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else {
        return response.data;
      }
    } catch (error: any) {
      console.error(`UsersApi.toggleActive(${id}) error:`, error);
      throw error;
    }
  },

  // Login
  login: async (
    email: string,
    password: string
  ): Promise<{ token: string; user: UserProfile }> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error: any) {
      console.error("UsersApi.login error:", error);
      throw error;
    }
  },

  // Get current user
  me: async (): Promise<{ user: UserProfile }> => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error: any) {
      console.error("UsersApi.me error:", error);
      throw error;
    }
  },
};

/* ----- Login helper ----- */
export async function loginAndStore(email: string, password: string) {
  try {
    const res = await UsersApi.login(email, password);
    if (res.token) setToken(res.token);
    return res;
  } catch (error: any) {
    console.error("loginAndStore error:", error);
    throw error;
  }
}

/* ----- Roles API ----- */
export const RolesApi = {
  // Get all roles
  getAll: async (): Promise<any[]> => {
    try {
      const response = await api.get("/roles");
      
      if (response.data.success !== undefined && response.data.data) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error("RolesApi.getAll error:", error);
      return [];
    }
  },

  // Get role by ID
  getById: async (id: string): Promise<any> => {
    try {
      const response = await api.get(`/roles/${id}`);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`RolesApi.getById(${id}) error:`, error);
      throw error;
    }
  },

  // Create role
  create: async (payload: any): Promise<any> => {
    try {
      const response = await api.post("/roles", payload);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error("RolesApi.create error:", error);
      throw error;
    }
  },

  // Update role
  update: async (id: string, payload: any): Promise<any> => {
    try {
      const response = await api.put(`/roles/${id}`, payload);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error(`RolesApi.update(${id}) error:`, error);
      throw error;
    }
  },

  // Delete role
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/roles/${id}`);
    } catch (error: any) {
      console.error(`RolesApi.delete(${id}) error:`, error);
      throw error;
    }
  },
};

// Default export
export default {
  api,
  unwrap,
  getToken,
  setToken,
  UsersApi,
  RolesApi,
  loginAndStore,
}; 