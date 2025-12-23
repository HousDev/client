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
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { UsersApi, getToken as apiGetToken } from "../lib/Api";

type User = any; // you can import UserProfile type

interface AuthContextValue {
  profile: User | null;
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
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

  useEffect(() => {
    // if token exists, fetch /auth/me
    async function init() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await UsersApi.me();
        setUser(data.user);
        setProfile(data.user);
      } catch (err) {
        console.error("Auth init failed", err);
        // invalid token -> clear
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [token]);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { token: tkn, user: u } = await UsersApi.login(email, password);
      localStorage.setItem("auth_token", tkn);
      setToken(tkn);
      setUser(u);
      setProfile(u);
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    if (!apiGetToken()) return;
    const data = await UsersApi.me();
    setUser(data.user);
    setProfile(data.user);
  };

  return (
    <AuthContext.Provider
      value={{ profile, user, token, loading, signIn, signOut, refreshUser }}
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
