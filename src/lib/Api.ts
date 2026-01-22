import axios, { AxiosInstance, AxiosError } from "axios";

/* ---------------- types ---------------- */

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

/* ---------------- BASE URL AUTO SWITCH ---------------- */

let BASE = "";

// local dev auto detect
if (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
) {
  BASE = "http://localhost:4000/api";
} else {
  BASE = "https://nayashgroup.in/api";
}

/* ---------------- token helpers ---------------- */

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
  } catch {}
}

/* ---------------- axios instance ---------------- */

export const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/* ---------------- interceptors ---------------- */

// attach token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err),
);

// handle 401
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response) {
      if (error.response.status === 401) {
        setToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

/* ---------------- unwrap helper ---------------- */

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

/* ---------------- Users API ---------------- */

export const UsersApi = {
  list: async (): Promise<UserProfile[]> => {
    const response = await api.get("/users");
    if (response.data.success && response.data.data) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  get: async (id: string): Promise<UserProfile> =>
    unwrap(api.get(`/users/${id}`)),

  getByRole: async (role: string): Promise<UserProfile> =>
    unwrap(api.get(`/users/role/${role}`)),

  create: async (payload: any): Promise<UserProfile> =>
    unwrap(api.post("/users", payload)),

  update: async (id: string, payload: any): Promise<UserProfile> =>
    unwrap(api.put(`/users/${id}`, payload)),

  remove: async (id: string): Promise<void> =>
    unwrap(api.delete(`/users/${id}`)),

  toggleActive: async (id: string): Promise<UserProfile> =>
    unwrap(api.put(`/users/${id}/toggle-active`)),

  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: UserProfile }> =>
    unwrap(api.post("/auth/login", { email, password })),

  me: async (): Promise<{ user: UserProfile }> => unwrap(api.get("/auth/me")),
};

export async function loginAndStore(email: string, password: string) {
  const res = await UsersApi.login(email, password);
  if (res.token) setToken(res.token);
  return res;
}

/* ---------------- Roles API ---------------- */

export const RolesApi = {
  getAll: async (): Promise<any[]> => {
    const response = await api.get("/roles");
    if (response.data.success && response.data.data) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    return [];
  },

  getById: async (id: string): Promise<any> => unwrap(api.get(`/roles/${id}`)),

  create: async (payload: any): Promise<any> =>
    unwrap(api.post("/roles", payload)),

  update: async (id: string, payload: any): Promise<any> =>
    unwrap(api.put(`/roles/${id}`, payload)),

  delete: async (id: string): Promise<void> =>
    unwrap(api.delete(`/roles/${id}`)),
};

/* ---------------- default export ---------------- */

export default {
  api,
  unwrap,
  getToken,
  setToken,
  UsersApi,
  RolesApi,
  loginAndStore,
};
