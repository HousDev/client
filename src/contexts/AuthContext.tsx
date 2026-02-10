/* eslint-disable @typescript-eslint/no-explicit-any */
  // import { createContext, useContext, useState, useEffect, ReactNode } from "react";

  // interface User {
  //   id: string;
  //   email: string;
  // }

  // interface UserProfile {
  //   id: string;
  //   email: string;
  //   full_name: string;
  //   role_name?: string;
  // }

  // interface AuthContextType {
  //   user: User | null;
  //   profile: UserProfile | null;
  //   loading: boolean;
  //   signIn: (email: string) => Promise<void>;
  //   signUp: (email: string, password: string, fullName: string) => Promise<void>;
  //   signOut: () => Promise<void>;
  // }

  // const AuthContext = createContext<AuthContextType | undefined>(undefined);

  // export function AuthProvider({ children }: { children: ReactNode }) {
  //   const [user, setUser] = useState<User | null>(null);
  //   const [profile, setProfile] = useState<UserProfile | null>(null);
  //   const [loading, setLoading] = useState(true);

  //   // Load auth from localStorage
  //   useEffect(() => {
  //     const storedUser = localStorage.getItem("user");
  //     const storedProfile = localStorage.getItem("profile");

  //     if (storedUser) setUser(JSON.parse(storedUser));
  //     if (storedProfile) setProfile(JSON.parse(storedProfile));

  //     setLoading(false);
  //   }, []);

  //   const saveAuth = (u: User, p: UserProfile) => {
  //     localStorage.setItem("user", JSON.stringify(u));
  //     localStorage.setItem("profile", JSON.stringify(p));
  //   };

  //   const clearAuth = () => {
  //     localStorage.removeItem("user");
  //     localStorage.removeItem("profile");
  //   };

  //   const signIn = async (email: string) => {
  //     // Mock example — in real app you’d check backend
  //     const mockUser = { id: "1", email };
  //     const mockProfile = {
  //       id: "1",
  //       email,
  //       full_name: "Demo User",
  //       role_name: "admin",
  //     };

  //     setUser(mockUser);
  //     setProfile(mockProfile);
  //     saveAuth(mockUser, mockProfile);
  //   };

  //   const signUp = async (email: string, password: string, fullName: string) => {
  //     // Mock signup — no backend
  //     const mockUser = { id: "1", email };
  //     const mockProfile = {
  //       id: "1",
  //       email,
  //       full_name: fullName,
  //       role_name: "admin",
  //     };

  //     setUser(mockUser);
  //     setProfile(mockProfile);
  //     saveAuth(mockUser, mockProfile);
  //   };

  //   const signOut = async () => {
  //     setUser(null);
  //     setProfile(null);
  //     clearAuth();
  //   };

  //   return (
  //     <AuthContext.Provider
  //       value={{ user, profile, loading, signIn, signUp, signOut }}
  //     >
  //       {children}
  //     </AuthContext.Provider>
  //   );
  // }

  // export function useAuth() {
  //   const ctx = useContext(AuthContext);
  //   if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  //   return ctx;
  // }




  // // src/contexts/AuthContext.tsx
  // import React, { createContext, useContext, useEffect, useState } from "react";
  // import { UsersApi, getToken as apiGetToken } from "../lib/Api";

  // type User = any; // you can import UserProfile type

  // interface AuthContextValue {
  //   profile: User | null;
  //   user: User | null;
  //   token: string | null;
  //   loading: boolean;
  //   signIn: (email: string, password: string) => Promise<void>;
  //   signOut: () => void;
  //   refreshUser: () => Promise<void>;
  // }

  // const AuthContext = createContext<AuthContextValue | undefined>(undefined);

  // export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  //   children,
  // }) => {
  //   const [user, setUser] = useState<User | null>(null);
  //   const [profile, setProfile] = useState<User | null>(null);
  //   const [token, setToken] = useState<string | null>(() => {
  //     try {
  //       return localStorage.getItem("auth_token");
  //     } catch {
  //       return null;
  //     }
  //   });
  //   const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     // if token exists, fetch /auth/me
  //     async function init() {
  //       if (!token) {
  //         setLoading(false);
  //         return;
  //       }
  //       try {
  //         const data = await UsersApi.me();
  //         setUser(data.user);
  //         setProfile(data.user);
  //       } catch (err) {
  //         console.error("Auth init failed", err);
  //         // invalid token -> clear
  //         localStorage.removeItem("auth_token");
  //         setToken(null);
  //         setUser(null);
  //         setProfile(null);
  //       } finally {
  //         setLoading(false);
  //       }
  //     }
  //     init();
  //   }, [token]);

  //   const signIn = async (email: string, password: string) => {
  //     try {
  //       const { token: tkn, user: u } = await UsersApi.login(email, password);
  //       setLoading(true);
  //       localStorage.setItem("auth_token", tkn);
  //       setToken(tkn);
  //       setUser(u);
  //       setProfile(u);
  //       setLoading(false);
  //     } catch (err) {
  //       throw err;
  //     }
  //   };

  //   const signOut = () => {
  //     localStorage.removeItem("auth_token");
  //     setToken(null);
  //     setUser(null);
  //     setProfile(null);
  //   };

  //   const refreshUser = async () => {
  //     if (!apiGetToken()) return;
  //     const data = await UsersApi.me();
  //     setUser(data.user);
  //     setProfile(data.user);
  //   };

  //   return (
  //     <AuthContext.Provider
  //       value={{ profile, user, token, loading, signIn, signOut, refreshUser }}
  //     >
  //       {children}
  //     </AuthContext.Provider>
  //   );
  // };

  // export function useAuth() {
  //   const ctx = useContext(AuthContext);
  //   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  //   return ctx;
  // }

/*----------------------3-2-26------------------*/

//   import React, { createContext, useContext, useEffect, useState } from "react";
// import { UsersApi, getToken as apiGetToken } from "../lib/Api";

// type User = any; // you can import UserProfile type

// interface AuthContextValue {
//   profile: User | null;
//   user: User | null;
//   token: string | null;
//   loading: boolean;
//   signIn: (identifier: string, password: string) => Promise<void>;
//   signOut: () => void;
//   refreshUser: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [profile, setProfile] = useState<User | null>(null);
//   const [token, setToken] = useState<string | null>(() => {
//     try {
//       return localStorage.getItem("auth_token");
//     } catch {
//       return null;
//     }
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     // if token exists, fetch /auth/me
//     async function init() {
//       if (!token) {
//         setLoading(false);
//         return;
//       }
//       try {
//         const data = await UsersApi.me();
//         setUser(data.user);
//         setProfile(data.user);
//       } catch (err) {
//         console.error("Auth init failed", err);
//         // invalid token -> clear
//         localStorage.removeItem("auth_token");
//         setToken(null);
//         setUser(null);
//         setProfile(null);
//       } finally {
//         setLoading(false);
//       }
//     }
//     init();
//   }, [token]);

//   const signIn = async (identifier: string, password: string) => {
//     try {
//       const { token: tkn, user: u } = await UsersApi.login(identifier, password);
//       setLoading(true);
//       localStorage.setItem("auth_token", tkn);
//       setToken(tkn);
//       setUser(u);
//       setProfile(u);
//       setLoading(false);
//     } catch (err) {
//       throw err;
//     }
//   };

//   const signOut = () => {
//     localStorage.removeItem("auth_token");
//     setToken(null);
//     setUser(null);
//     setProfile(null);
//   };

//   const refreshUser = async () => {
//     if (!apiGetToken()) return;
//     const data = await UsersApi.me();
//     setUser(data.user);
//     setProfile(data.user);
//   };

//   return (
//     <AuthContext.Provider
//       value={{ profile, user, token, loading, signIn, signOut, refreshUser }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
//   return ctx;
// }




// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { UsersApi, getToken as apiGetToken } from "../lib/Api";
import { SettingsApi } from "../lib/settingsApi"; // Add this import

type User = any;
type SystemSettings = any; // Add type for system settings

interface AuthContextValue {
  profile: User | null;
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
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);

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
      const { token: tkn, user: u } = await UsersApi.login(identifier, password);
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
  const data = await UsersApi.me();
  
  // ✅ Normalize profile_picture to full URL if it's just a path
  if (data.user?.profile_picture) {
    const pic = data.user.profile_picture;
    if (!pic.startsWith('http')) {
      const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api')
        .replace('/api', '');
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
      setSystemSettings(sysData);
    } catch (error) {
      console.error("Failed to refresh system settings:", error);
    }
  };

  const updateProfileLocally = (patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
    setProfile((prev: any) => (prev ? { ...prev, ...patch } : prev));
  };

  // ── NEW: Update system settings locally ───────────────────────────────
  const updateSystemSettingsLocally = (patch: Partial<SystemSettings>) => {
    setSystemSettings((prev) => (prev ? { ...prev, ...patch } : prev));
  };
 

// Add this function inside AuthProvider:
// ✅ FIXED VERSION
const updateAvatarLocally = (avatarUrl: string | null) => {
  console.log('🔄 Updating avatar locally:', avatarUrl); // Debug log
  
  setUser((prev) => prev ? { 
    ...prev, 
    avatar: avatarUrl, 
    profile_picture: avatarUrl 
  } : prev);
  
  setProfile((prev: any) => prev ? { 
    ...prev, 
    avatar: avatarUrl, 
    profile_picture: avatarUrl 
  } : prev);
};

// Add it to the Provider value:


  return (
    <AuthContext.Provider
      value={{
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