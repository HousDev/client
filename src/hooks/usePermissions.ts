import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface Permission {
  id: string;
  name: string;
  display_name: string;
  action: string;
}

export function usePermissions() {
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPermissions();
  }, [profile?.role_name]);

  const loadPermissions = async () => {
    try {
      setLoading(true);

      // 🔹 MOCK PERMISSIONS DATA
      const mockPermissionList: Permission[] = [
        { id: "1", name: "users_view", display_name: "View Users", action: "view" },
        { id: "2", name: "users_create", display_name: "Create Users", action: "create" },
        { id: "3", name: "users_edit", display_name: "Edit Users", action: "edit" },
        { id: "4", name: "users_delete", display_name: "Delete Users", action: "delete" },
      ];

      // If admin → allow all permissions
      if (profile?.role_name === "admin") {
        setPermissions(mockPermissionList);
      } else {
        // 🔹 Normal user gets limited permissions (example)
        setPermissions(mockPermissionList.filter((p) => p.action === "view"));
      }

    } catch (err) {
      console.error("Error loading permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (moduleName: string, action: string) => {
    if (profile?.role_name === "admin") return true;

    return permissions.some(
      (p) => p.name === `${moduleName}_${action}` || p.action === action
    );
  };

  return {
    permissions,
    loading,
    hasPermission,
    canView: (m: string) => hasPermission(m, "view"),
    canCreate: (m: string) => hasPermission(m, "create"),
    canEdit: (m: string) => hasPermission(m, "edit"),
    canDelete: (m: string) => hasPermission(m, "delete"),
    canExport: (m: string) => hasPermission(m, "export"),
    canPrint: (m: string) => hasPermission(m, "print"),
    isAdmin: profile?.role_name === "admin",
  };
}
