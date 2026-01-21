// src/lib/Api.ts
import axios, { AxiosInstance, AxiosError } from "axios";

/* ----- types (copy your real ones) ----- */
export type Permissions = {
  view_vendors: boolean;
  edit_vendors: boolean;
  delete_vendors: boolean;
  view_pos: boolean;
  create_pos: boolean;
  edit_pos: boolean;
  delete_pos: boolean;
  approve_pos: boolean;
  view_service_orders: boolean;
  create_service_orders: boolean;
  edit_service_orders: boolean;
  view_materials: boolean;
  receive_materials: boolean;
  view_payments: boolean;
  make_payments: boolean;
  view_reports: boolean;
  manage_masters: boolean;
  manage_users: boolean;
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
}

/* ----- base URL ----- */
const BASE =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env &&
    (import.meta as any).env.VITE_API_URL) ||
  "https://nayashgroup.in/api"; // 🔴 yaha domain change kiya hai

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
/* EXPORT the instance so other modules can import { api } */
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
  (err) => Promise.reject(err),
);

/* ----- response interceptor: central error handling (optional) ----- */
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    if (error.response) {
      // example: 401 handling
      // if (error.response.status === 401) {
      //   setToken(null);
      //   window.location.href = "/login";
      // }
    }
    return Promise.reject(error);
  },
);

/* ----- helper to unwrap axios response or throw meaningful error ----- */
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

/* ----- exported API using axios (named export) ----- */
export const UsersApi = {
  list: async (): Promise<UserProfile[]> => {
    return unwrap<UserProfile[]>(api.get("/users"));
  },

  get: async (id: string): Promise<UserProfile> => {
    return unwrap<UserProfile>(api.get(`/users/${id}`));
  },
  getByRole: async (role: string): Promise<UserProfile> => {
    return unwrap<UserProfile>(api.get(`/users/role/${role}`));
  },

  create: async (payload: any): Promise<UserProfile> => {
    return unwrap<UserProfile>(api.post("/users", payload));
  },

  update: async (id: string, payload: any): Promise<UserProfile> => {
    return unwrap<UserProfile>(api.put(`/users/${id}`, payload));
  },

  remove: async (id: string) => {
    return unwrap<any>(api.delete(`/users/${id}`));
  },

  toggleActive: async (id: string): Promise<UserProfile> => {
    return unwrap<UserProfile>(api.patch(`/users/${id}/toggle-active`));
  },

  // auth
  login: async (
    email: string,
    password: string,
  ): Promise<{ token: string; user: UserProfile }> => {
    const { data } = await api.post("/auth/login", { email, password });
    return data as { token: string; user: UserProfile };
  },

  me: async (): Promise<{ user: UserProfile }> => {
    return unwrap<{ user: UserProfile }>(api.get("/auth/me"));
  },
};

/* ----- example helper: wrapper that logs in and stores token ----- */
export async function loginAndStore(email: string, password: string) {
  const res = await UsersApi.login(email, password);
  if (res.token) setToken(res.token);
  return res;
}

// // src/lib/Api.ts
// import axios, { AxiosInstance, AxiosError } from 'axios';

// /* ----- types (copy your real ones) ----- */
// export type Permissions = {
//   view_vendors: boolean;
//   edit_vendors: boolean;
//   delete_vendors: boolean;
//   view_pos: boolean;
//   create_pos: boolean;
//   edit_pos: boolean;
//   delete_pos: boolean;
//   approve_pos: boolean;
//   view_service_orders: boolean;
//   create_service_orders: boolean;
//   edit_service_orders: boolean;
//   view_materials: boolean;
//   receive_materials: boolean;
//   view_payments: boolean;
//   make_payments: boolean;
//   view_reports: boolean;
//   manage_masters: boolean;
//   manage_users: boolean;
// };

// export interface UserProfile {
//   id: string;
//   email: string;
//   full_name?: string;
//   phone?: string;
//   role: string;
//   department?: string;
//   is_active: boolean;
//   permissions: Permissions;
//   password?: string;
// }

// /* ----- base URL ----- */
// const BASE =
//   (typeof import.meta !== 'undefined' &&
//     (import.meta as any).env &&
//     (import.meta as any).env.VITE_API_URL) ||
//   'http://localhost:4000/api';

// /* ----- token helpers ----- */
// export function getToken(): string | null {
//   try {
//     return localStorage.getItem('auth_token');
//   } catch {
//     return null;
//   }
// }

// export function setToken(token: string | null) {
//   try {
//     if (token) localStorage.setItem('auth_token', token);
//     else localStorage.removeItem('auth_token');
//   } catch {
//     // ignore
//   }
// }

// /* ----- axios instance ----- */
// /* EXPORT the instance so other modules can import { api } */
// export const api: AxiosInstance = axios.create({
//   baseURL: BASE,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 15000,
// });

// /* ----- request interceptor: attach token ----- */
// api.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token && config.headers) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (err) => Promise.reject(err)
// );

// /* ----- response interceptor: central error handling (optional) ----- */
// api.interceptors.response.use(
//   (res) => res,
//   (error: AxiosError) => {
//     // central place to handle errors
//     if (error.response) {
//       // optional: handle 401 globally
//       // if (error.response.status === 401) { setToken(null); window.location.href = '/login' }
//     }
//     return Promise.reject(error);
//   }
// );

// /* ----- helper to unwrap axios response or throw meaningful error ----- */
// /* EXPORT unwrap so callers can use it */
// export async function unwrap<T>(p: Promise<any>): Promise<T> {
//   try {
//     const { data } = await p;
//     return data as T;
//   } catch (err: any) {
//     // convert AxiosError to useful message
//     if (err?.response?.data) {
//       // server error payload (JSON)
//       throw err.response.data;
//     }
//     if (err?.message) throw new Error(err.message);
//     throw err;
//   }
// }

// /* ----- exported API using axios (named export) ----- */
// export const UsersApi = {
//   list: async (): Promise<UserProfile[]> => {
//     return unwrap<UserProfile[]>(api.get('/users'));
//   },

//   get: async (id: string): Promise<UserProfile> => {
//     return unwrap<UserProfile>(api.get(`/users/${id}`));
//   },

//   create: async (payload: any): Promise<UserProfile> => {
//     return unwrap<UserProfile>(api.post('/users', payload));
//   },

//   update: async (id: string, payload: any): Promise<UserProfile> => {
//     return unwrap<UserProfile>(api.put(`/users/${id}`, payload));
//   },

//   remove: async (id: string) => {
//     return unwrap<any>(api.delete(`/users/${id}`));
//   },

//   toggleActive: async (id: string): Promise<UserProfile> => {
//     return unwrap<UserProfile>(api.patch(`/users/${id}/toggle-active`));
//   },

//   // auth
//   login: async (email: string, password: string): Promise<{ token: string; user: UserProfile }> => {
//     // login doesn't use interceptor token (no token yet)
//     const { data } = await api.post('/auth/login', { email, password });
//     return data as { token: string; user: UserProfile };
//   },

//   me: async (): Promise<{ user: UserProfile }> => {
//     return unwrap<{ user: UserProfile }>(api.get('/auth/me'));
//   },
// };

// /* ----- example helper: wrapper that logs in and stores token ----- */
// export async function loginAndStore(email: string, password: string) {
//   const res = await UsersApi.login(email, password);
//   if (res.token) setToken(res.token);
//   return res;
// }
