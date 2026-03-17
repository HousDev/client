// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { UsersApi, getToken as apiGetToken } from "../lib/Api";
import { SettingsApi } from "../lib/settingsApi"; // Add this import

type User = any;
type SystemSettings = any; // Add type for system settings

interface AuthContextValue {
  profile: User | null;
  can: any;
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
  updateProfileLocally: (patch: Partial<User>) => void;
  // ── NEW: System settings ──────────────────────────────────────────────
  systemSettings: SystemSettings | null;
  updateSystemSettingsLocally: (patch: Partial<SystemSettings>) => void;
  refreshSystemSettings: () => Promise<void>;
  updateAvatarLocally: (avatarUrl: string | null) => void; // ✅ ADD THIS
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("auth_token");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  // ── NEW: System settings state ────────────────────────────────────────
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(
    null,
  );

  useEffect(() => {
    async function init() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await UsersApi.me();
        setUser(data.user);
        setProfile(data.user);

        // ── NEW: Load system settings when user logs in ───────────────
        try {
          const sysData = await SettingsApi.getSystemSettings();
          setSystemSettings(sysData);
        } catch (sysErr) {
          console.error("Failed to load system settings:", sysErr);
        }
      } catch (err) {
        console.error("Auth init failed", err);
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
        setProfile(null);
        setSystemSettings(null); // Clear system settings on logout
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  const signIn = async (identifier: string, password: string) => {
    try {
      const { token: tkn, user: u } = await UsersApi.login(
        identifier,
        password,
      );
      setLoading(true);
      localStorage.setItem("auth_token", tkn);
      setToken(tkn);
      setUser(u);
      setProfile(u);

      // ── NEW: Load system settings after login ──────────────────────
      try {
        const sysData = await SettingsApi.getSystemSettings();
        setSystemSettings(sysData);
      } catch (sysErr) {
        console.error("Failed to load system settings after login:", sysErr);
      }

      setLoading(false);
    } catch (err) {
      throw err;
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setProfile(null);
    setSystemSettings(null); // Clear system settings
  };

  // const refreshUser = async () => {
  //   if (!apiGetToken()) return;
  //   const data = await UsersApi.me();
  //   setUser(data.user);
  //   setProfile(data.user);
  // };
  // src/contexts/AuthContext.tsx

  const refreshUser = async () => {
    if (!apiGetToken()) return;
    const data: any = await UsersApi.me();

    // ✅ Normalize profile_picture to full URL if it's just a path
    if (data.user?.profile_picture) {
      const pic = data.user.profile_picture;
      if (!pic.startsWith("http")) {
        const base = (
          import.meta.env.VITE_API_URL || "http://localhost:4000/api"
        ).replace("/api", "");
        data.user.profile_picture = `${base}${pic}`;
        data.user.avatar = data.user.profile_picture; // ✅ sync avatar too
      } else {
        data.user.avatar = pic; // ✅ sync avatar too
      }
    }

    setUser(data.user);
    setProfile(data.user);
  };

  // ── NEW: Refresh system settings ──────────────────────────────────────
  const refreshSystemSettings = async () => {
    if (!apiGetToken()) return;
    try {
      const sysData = await SettingsApi.getSystemSettings();
      document.title = sysData.site_name || "Vendor Management System"; // Update document title
      setSystemSettings(sysData);
    } catch (error) {
      console.error("Failed to refresh system settings:", error);
    }
  };

  const updateProfileLocally = (patch: Partial<User>) => {
    setUser((prev: any) => (prev ? { ...prev, ...patch } : prev));
    setProfile((prev: any) => (prev ? { ...prev, ...patch } : prev));
  };

  // ── NEW: Update system settings locally ───────────────────────────────
  const updateSystemSettingsLocally = (patch: Partial<SystemSettings>) => {
    setSystemSettings((prev: any) => (prev ? { ...prev, ...patch } : prev));
  };

  // Add this function inside AuthProvider:
  // ✅ FIXED VERSION
  const updateAvatarLocally = (avatarUrl: string | null) => {
    setUser((prev: any) =>
      prev
        ? {
            ...prev,
            avatar: avatarUrl,
            profile_picture: avatarUrl,
          }
        : prev,
    );

    setProfile((prev: any) =>
      prev
        ? {
            ...prev,
            avatar: avatarUrl,
            profile_picture: avatarUrl,
          }
        : prev,
    );
  };

  const can = (permission: string) => {
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      null;
    if (role === "admin") return true;
    const perms: Record<string, boolean> | null =
      (profile as any)?.permissions ?? null;
    if (perms && typeof perms === "object") return Boolean(perms[permission]);
    return false;
  };

  // Add it to the Provider value:

  return (
    <AuthContext.Provider
      value={{
        can,
        profile,
        user,
        token,
        loading,
        signIn,
        signOut,
        refreshUser,
        updateProfileLocally,
        // ── NEW: Expose system settings ──────────────────────────────
        systemSettings,
        updateSystemSettingsLocally,
        refreshSystemSettings,
        updateAvatarLocally, // ✅ ADD THIS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
