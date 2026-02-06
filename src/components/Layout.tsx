// src/components/Layout.tsx
import { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import DefaultLogo from "../assets/images/Nayash Logo.png";
import {
  FaBell,
  FaTimes,
  FaSignOutAlt,
  FaCog,
  FaBars,
  FaConciergeBell,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import {
  MdRequestQuote,
  MdChecklist,
  MdSettings,
  MdClose,
  MdAccountCircle,
} from "react-icons/md";
import {
  Menu,
  ChevronRight,
  Clock,
  PackagePlus,
  PackageMinus,
  UserCheck,
  Home,
  FileText,
  BarChart3,
  Shield,
  Users,
  PackageSearch,
  ClipboardCheck,
  Handshake,
  FileCheck,
  Calculator,
  Layers,
  LayoutDashboard,
  Calendar,
  BarChart,
  UserPlus,
  Wallet,
  Receipt,
  Ticket,
  Building2,
  Settings,
  Mail,
  Zap,
  Package,
} from "lucide-react";
import NotificationsApi from "../lib/notificationApi";
import { toast } from "sonner";
import RequestMaterial from "./materialRequest/RequestMaterial";
import { BsPerson } from "react-icons/bs";

// ─── TYPES ────────────────────────────────────────────────────────────────
interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeFormTab?: string;
  setActiveFormTab?: (tab: string) => void;
}

interface NotificationType {
  id: number;
  title: string;
  description: string;
  type: string;
  seen: boolean;
  created_at: string;
}

// ─── SUBMENU DEFINITIONS ──────────────────────────────────────────────────
const hrmsSubmenuItems = [
  { id: "hrms-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "employees", label: "Employees", icon: Users },
  { id: "recruitment", label: "Recruitment", icon: UserPlus },
  { id: "attendance", label: "Attendance", icon: Clock },
  { id: "leaves", label: "Leaves", icon: Calendar },
  { id: "payroll", label: "Payroll", icon: Wallet },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "tickets", label: "Tickets", icon: Ticket },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "hr-reports", label: "HR Reports", icon: BarChart },
  { id: "roles-permissions", label: "Roles & Permissions", icon: Shield },
  { id: "hr-settings", label: "HR Settings", icon: MdSettings },
];

const settingsSubmenuItems = [
  { id: "general-settings", label: "General Settings", icon: Settings },
  { id: "integration", label: "Integration", icon: Zap },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function Layout({
  children,
  activeTab,
  onTabChange,
  activeFormTab = "",
  setActiveFormTab = () => {},
}: LayoutProps) {
  // ── Auth context ──────────────────────────────────────────────────────────
  const { 
    profile, 
    user, 
    signOut, 
    loading: authLoading,
    systemSettings // ✅ Get system settings from context
  } = useAuth();
  console.log(user)
  // ✅ Use logo/favicon from systemSettings, fallback to defaults
  const logoUrl = systemSettings?.logo || DefaultLogo;
  const faviconUrl = systemSettings?.favicon;
  const primaryColor = systemSettings?.primaryColor || "#C62828";

  // ── Local UI state ──────────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState<any>({});
  const [userMenus, setUserMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRequestMaterial, setShowRequestMaterial] = useState<boolean>(false);
  const [showMaterialActionsMenu, setShowMaterialActionsMenu] = useState<boolean>(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [localActiveFormTab, setLocalActiveFormTab] = useState<string>("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const materialActionsRef = useRef<HTMLDivElement>(null);



  // ✅ Update favicon dynamically when it changes
  useEffect(() => {
    if (faviconUrl) {
      // Update existing favicon or create new one
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
  }, [faviconUrl]);

  // ✅ Update primary color dynamically (optional - for theme)
  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-color', primaryColor);
    }
  }, [primaryColor]);

  // ── Derived values (re-computed whenever profile/user change) ────────────
  const isAdmin = useMemo(() => {
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      "";
    return role === "admin" || role === "Admin";
  }, [profile, user]);

  // ── Menu definitions ─────────────────────────────────────────────────────
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, headerIcon: Home, value: ["view_dashboard"], submenu: null },
    { id: "vendors", label: "Vendors", icon: Handshake, headerIcon: Handshake, value: ["view_vendors","create_vendors","edit_vendors","delete_vendors"], submenu: null },
    { id: "purchase-orders", label: "Purchase Orders", icon: FileText, headerIcon: FileCheck, value: ["view_pos","create_pos","edit_pos","delete_pos","approve_pos"], submenu: null },
    { id: "service-orders", label: "Service Orders", icon: Layers, headerIcon: Layers, value: ["edit_service_orders","create_service_orders","view_service_orders"], submenu: null },
    { id: "store-management", label: "Store Management", icon: Package, headerIcon: Package, value: ["edit_inventory","create_inventory","view_inventory","delete_inventory"], submenu: null },
    { id: "materials", label: "Material Tracking", icon: PackageSearch, headerIcon: PackageSearch, value: ["view_materials","receive_materials"], submenu: null },
    { id: "material-requests", label: "Material Requests", icon: ClipboardCheck, headerIcon: ClipboardCheck, value: ["view_materials_requests","update_materials_requests"], submenu: null },
    { id: "payments", label: "Payments", icon: Calculator, headerIcon: Calculator, value: ["view_payments","make_payments","verify_payments"], submenu: null },
    { id: "task-management", label: "Task Management", icon: MdChecklist, value: ["view_task","create_task","update_task","delete_task"], submenu: null },
    { id: "projects", label: "Projects", icon: Building2, value: ["view_project","create_project","update_project","delete_project"], submenu: null },
    { id: "hrms", label: "HRMS", icon: BsPerson, value: ["view_hrms","create_hrms","update_hrms","delete_hrms"], submenu: hrmsSubmenuItems },
    { id: "notifications", label: "Notifications", icon: FaConciergeBell, headerIcon: FaConciergeBell, value: ["view_notifications"], submenu: null },
    { id: "reports", label: "Reports", icon: BarChart3, headerIcon: BarChart3, value: ["view_reports","export_reports"], submenu: null },
    { id: "settings", label: "Settings", icon: FaCog, headerIcon: FaCog, value: ["view_settings","edit_settings","full_access"], submenu: settingsSubmenuItems },
    { id: "masters", label: "Masters", icon: Users, headerIcon: Users, value: ["manage_users","manage_roles"], submenu: null },
    { id: "users", label: "Users", icon: MdAccountCircle, value: ["manage_users"], submenu: null },
    { id: "permissions", label: "Permissions", icon: Shield, headerIcon: Shield, value: ["manage_permissions"], submenu: null },
  ];

  const currentActiveFormTab = activeFormTab !== undefined ? activeFormTab : localActiveFormTab;
  const currentSetActiveFormTab = setActiveFormTab || setLocalActiveFormTab;

  // ── Active menu label for the header ─────────────────────────────────────
  const activeMenuLabel = useMemo(() => {
    const hrmsSubItem = hrmsSubmenuItems.find((item) => item.id === activeTab);
    if (hrmsSubItem) return hrmsSubItem.label;
    const settingsSubItem = settingsSubmenuItems.find((item) => item.id === activeTab);
    if (settingsSubItem) return settingsSubItem.label;
    const activeItem = menuItems.find((item) => item.id === activeTab);
    return activeItem ? activeItem.label : "Dashboard";
  }, [activeTab]);

  // ── Sign out ─────────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try { await signOut(); } catch (error) { console.error("Error signing out:", error); }
  };

  // ── Display name ──────────────────────────────────────────────────────────
  const displayName = useMemo(() => {
    return (
      (profile && (profile as any).full_name) ||
      (user && (user as any).full_name) ||
      (profile && (profile as any).email) ||
      (user && (user as any).email) ||
      "User"
    );
  }, [profile, user]);

  // ── Permissions ──────────────────────────────────────────────────────────
  const contextAuth = useAuth();
  useEffect(() => {
    if (contextAuth.user?.permissions) {
      const result = Object.fromEntries(
        Object.entries(contextAuth.user.permissions).filter(([_, value]) => value === true)
      );
      setUserMenus(Object.keys(result) ?? []);
      setUserPermissions(contextAuth.user.permissions);
    }
  }, [contextAuth.user]);

  // ── Display role ─────────────────────────────────────────────────────────
  const displayRole = useMemo(() => {
    return (
      (profile && ((profile as any).role_name || (profile as any).role)) ||
      (user && (user as any).role) ||
      "No role"
    );
  }, [profile, user]);

  // ── Initials ──────────────────────────────────────────────────────────────
  const initials = useMemo(() => {
    const name = String(displayName || "").trim();
    if (!name || name === "User") return "U";
    if (name.includes("@")) return name.split("@")[0].charAt(0).toUpperCase();
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [displayName]);

  // ── Avatar URL ────────────────────────────────────────────────────────────
// ── Avatar URL ────────────────────────────────────────────────────────────
  const avatarUrl = useMemo(() => {
    const raw = (profile && (profile as any).avatar) || (user && (user as any).avatar) || (user && (user as any).profile_picture) || null;
    if (!raw) return null;
    // Already a full URL → use as-is
    if (raw.startsWith('http')) return raw;
    // Just a filename → build the full URL
    const base = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    return `${base}/uploads/avatars/${raw}`;
  }, [profile, user]);
  // ── Notifications ────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    try {
      const res: any = await NotificationsApi.getNotifications();
      setNotifications(res.data.filter((n: any) => n.seen === 0));
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  const markAllRead = async () => {
    try {
      const result = await NotificationsApi.markAllAsSeen();
      if (result.success) fetchNotifications();
      else toast.error("Failed to mark all notifications as seen.");
    } catch (err) { console.error("Error marking all as read:", err); }
  };

  useEffect(() => {
    setUnreadCount(notifications.filter((n: any) => !n.seen).length);
  }, [notifications]);

  // ── Relative time formatter ──────────────────────────────────────────────
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString("en-US", {
      month: "short", day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  // ── Close dropdowns on outside click ─────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setNotifOpen(false);
      if (materialActionsRef.current && !materialActionsRef.current.contains(event.target as Node)) setShowMaterialActionsMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Permission helper ────────────────────────────────────────────────────
  const can = (permission: string) => {
    const role = (profile as any)?.role_name ?? (profile as any)?.role ?? (user as any)?.role ?? null;
    if (role === "admin") return true;
    const perms: Record<string, boolean> | null = (profile as any)?.permissions ?? null;
    if (perms && typeof perms === "object") return Boolean(perms[permission]);
    return false;
  };

  // ── Store management quick-action helpers ────────────────────────────────
  const handleMaterialButtonClick = (formType: string) => {
    currentSetActiveFormTab(formType);
    setShowMaterialActionsMenu(false);
  };

  useEffect(() => {
    if (activeTab !== "store-management") {
      currentSetActiveFormTab("");
      setShowMaterialActionsMenu(false);
    }
  }, [activeTab, currentSetActiveFormTab]);

  // ── Menu click handlers ──────────────────────────────────────────────────
  const handleMenuItemClick = (item: any) => {
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else {
      onTabChange(item.id);
      setMobileSidebarOpen(false);
      setOpenSubmenu(null);
    }
  };

  const handleHRMSSubmenuClick = (subItemId: string) => {
    onTabChange(subItemId);
    setMobileSidebarOpen(false);
  };

  const handleSettingsSubmenuClick = (subItemId: string) => {
    onTabChange(subItemId);
    setMobileSidebarOpen(false);
  };

  // ── Filtered settings submenu ────────────────────────────────────────────
  const filteredSettingsSubmenuItems = useMemo(() => {
    return settingsSubmenuItems.filter((item) => {
      if (item.id === "general-settings") return true;
      return isAdmin;
    });
  }, [isAdmin]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-56" : "w-20"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#2D2D2D] border-r border-gray-700 flex flex-col shadow-lg`}
      >
        {/* ✅ Logo - Dynamic from system settings */}
        <div className={`h-20 border-b border-gray-700 flex items-center ${sidebarOpen ? "justify-start px-4" : "justify-center"} transition-all bg-[#2D2D2D]`}>
       {/* In Layout.tsx sidebar logo section */}
{sidebarOpen ? (
  // Just remove the style line completely
<img 
  src={logoUrl ? `${logoUrl}?t=${Date.now()}` : DefaultLogo} 
  alt="Company Logo" 
  className="h-16 w-auto object-contain" 
  key={logoUrl}
  onError={(e) => {
    (e.target as HTMLImageElement).src = DefaultLogo;
  }}
/>
) : (
  <img 
    src={logoUrl ? `${logoUrl}?t=${Date.now()}` : DefaultLogo} 
    alt="Logo" 
    className="h-10 w-10 object-contain" 
    // style={{ filter: "brightness(0) invert(1)" }}
    key={logoUrl} // Force re-render when URL changes
    onError={(e) => {
      (e.target as HTMLImageElement).src = DefaultLogo;
    }}
  />
)}
        </div>

        {/* Mobile Profile Section */}
        {/* {sidebarOpen && (
          <div className="p-4 border-b border-gray-700 lg:hidden">
            <div className="flex items-center justify-between gap-3 px-3 py-2 bg-[#3D3D3D] rounded-lg">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={`${import.meta.env.VITE_API_URL + user.profile_picture}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#C62828]" />
                ) : (
                  <div className="w-10 h-10 bg-[#C62828] rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm">{initials}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {authLoading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-600 rounded w-32 mb-1" />
                      <div className="h-3 bg-gray-600 rounded w-20" />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-400 capitalize truncate">{displayRole}</p>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => setMobileSidebarOpen(false)} className="p-1 hover:bg-gray-700 rounded-md">
                <MdClose className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        )} */}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {!sidebarOpen ? (
            /* Collapsed – icons only */
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const hasPermission = item.value.some((d) => userMenus.includes(d)) || userMenus.includes("full_access");
                if (!hasPermission) return null;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-all group relative
                      ${isActive ? "bg-[#C62828] text-white shadow-lg" : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"}`}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="absolute left-full ml-2 px-3 py-1.5 bg-[#2D2D2D] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 border border-gray-700">
                      {item.label}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Expanded – icons + labels */
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeTab === item.id ||
                  (item.id === "hrms" && item.submenu && item.submenu.some((sub: any) => sub.id === activeTab)) ||
                  (item.id === "settings" && item.submenu && item.submenu.some((sub: any) => sub.id === activeTab));
                const hasPermission = item.value.some((d) => userMenus.includes(d)) || userMenus.includes("full_access");
                if (!hasPermission) return null;

                return (
                  <div key={item.id} className="space-y-1">
                    <button
                      onClick={() => handleMenuItemClick(item)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                        ${isActive ? "bg-[#C62828] text-white shadow-lg" : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{item.label}</span>
                      </div>
                      {item.submenu && (
                        <div className="flex-shrink-0">
                          {openSubmenu === item.id ? <FaChevronDown className="w-4 h-4" /> : <FaChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                    </button>

                    {/* HRMS submenu */}
                    {item.id === "hrms" && item.submenu && openSubmenu === item.id && (
                      <div className="ml-8 pl-2 border-l border-gray-600 space-y-1">
                        {item.submenu.map((subItem: any) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleHRMSSubmenuClick(subItem.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                              ${activeTab === subItem.id ? "bg-[#C62828] text-white" : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"}`}
                          >
                            <subItem.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-xs truncate">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Settings submenu */}
                    {item.id === "settings" && item.submenu && openSubmenu === item.id && (
                      <div className="ml-8 pl-2 border-l border-gray-600 space-y-1">
                        {filteredSettingsSubmenuItems.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleSettingsSubmenuClick(subItem.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                              ${activeTab === subItem.id ? "bg-[#C62828] text-white" : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"}`}
                          >
                            <subItem.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-xs truncate">{subItem.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Mobile Sign-Out */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 lg:hidden">
            <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#C62828] hover:text-white rounded-lg transition">
              <FaSignOutAlt className="w-5 h-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* ── Main Content ── */}
      <div className={`transition-all duration-300 ease-in-out min-h-screen ${sidebarOpen ? "lg:ml-56" : "lg:ml-20"}`}>
        {/* ── Top Navigation Bar ── */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 h-full">
            <div className="flex items-center justify-between h-full">
              {/* Left */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition">
                  {sidebarOpen ? <Menu className="w-5 h-5 text-[#2D2D2D]" /> : <ChevronRight className="w-5 h-5 text-[#2D2D2D]" />}
                </button>
                <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition">
                  <FaBars className="w-5 h-5 text-[#2D2D2D]" />
                </button>
                <div className="flex items-center gap-2 sm:gap-3">
                  <h1 className="font-bold text-[#2D2D2D] text-lg leading-tight">{activeMenuLabel}</h1>
                </div>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Request Material – Desktop (not on store-management) */}
                {activeTab !== "store-management" && (
                  <button onClick={() => setShowRequestMaterial(true)} className="hidden sm:flex items-center px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] hover:shadow-lg transition text-sm font-medium whitespace-nowrap">
                    Request Material
                  </button>
                )}
                {/* Request Material – Desktop on store-management */}
                {activeTab === "store-management" && (
                  <button onClick={() => setShowRequestMaterial(true)} className="hidden lg:flex items-center px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] hover:shadow-lg transition text-sm font-medium whitespace-nowrap ml-4">
                    Request Material
                  </button>
                )}

                {/* Store Management quick actions – Desktop */}
                {activeTab === "store-management" && (can("create_inventory") || can("full_access")) && (
                  <div className="hidden lg:flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
                    <button onClick={() => handleMaterialButtonClick("in")} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentActiveFormTab === "in" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      <PackagePlus className="w-5 h-5" /> Material In
                    </button>
                    <button onClick={() => handleMaterialButtonClick("out")} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentActiveFormTab === "out" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      <PackageMinus className="w-5 h-5" /> Material Out
                    </button>
                    <button onClick={() => handleMaterialButtonClick("issue")} className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${currentActiveFormTab === "issue" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                      <UserCheck className="w-5 h-5" /> Issue Material
                    </button>
                  </div>
                )}

                {/* Request Material – Mobile (not on store-management) */}
                {activeTab !== "store-management" && (
                  <button onClick={() => setShowRequestMaterial(true)} className="sm:hidden p-2 rounded-lg bg-[#C62828] text-white hover:bg-[#A62222] transition" title="Request Material">
                    <MdRequestQuote className="w-5 h-5" />
                  </button>
                )}
                {/* Request Material – Mobile on store-management */}
                {activeTab === "store-management" && (
                  <button onClick={() => setShowRequestMaterial(true)} className="lg:hidden p-2 rounded-lg bg-[#C62828] text-white hover:bg-[#A62222] transition" title="Request Material">
                    <MdRequestQuote className="w-5 h-5" />
                  </button>
                )}

                {/* ── Notification Bell ── */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); setShowMaterialActionsMenu(false); }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition relative"
                  >
                    <FaBell className="w-5 h-5 text-[#2D2D2D]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C62828] text-white text-xs rounded-full flex items-center justify-center font-semibold border border-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <>
                      {/* Desktop dropdown */}
                      <div className="hidden lg:block absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b bg-[#2D2D2D]">
                          <h4 className="text-sm font-semibold text-white">Notifications</h4>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-300 bg-[#C62828] px-2 py-1 rounded-full">{unreadCount} new</span>
                            <button onClick={() => setNotifOpen(false)} className="p-1 hover:bg-[#3D3D3D] rounded"><FaTimes className="w-4 h-4 text-white" /></button>
                          </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 text-sm">No notifications yet</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!n.seen ? "bg-red-50/40" : ""}`}>
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#C62828] flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">{n.title.charAt(0)}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                                      {!n.seen && <span className="w-2 h-2 bg-[#C62828] rounded-full flex-shrink-0 mt-1"></span>}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.description}</p>
                                    <div className="flex items-center gap-1.5 mt-2">
                                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                                      <p className="text-xs text-gray-400">{formatDateTime(n.created_at)}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                            <button onClick={() => { markAllRead(); setNotifOpen(false); }} className="text-sm text-[#C62828] hover:text-[#A62222] font-medium">Mark all as read</button>
                            <button onClick={() => setNotifOpen(false)} className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-sm text-gray-700">Close</button>
                          </div>
                        )}
                      </div>

                      {/* Mobile notification panel */}
                      <div className={`lg:hidden fixed top-16 right-2 w-[88vw] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-300 ease-out ${notifOpen ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0 pointer-events-none"}`}>
                        <div className="flex items-center justify-between px-4 py-3 bg-[#2D2D2D] rounded-t-xl">
                          <h4 className="text-sm font-semibold text-white">Notifications</h4>
                          <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-[#3D3D3D]"><FaTimes className="w-4 h-4 text-white" /></button>
                        </div>
                        <div className="divide-y max-h-[60vh] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center">
                              <FaBell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500 text-sm">No notifications</p>
                            </div>
                          ) : (
                            notifications.map((n) => (
                              <div key={n.id} className={`px-3 py-3 hover:bg-gray-50 ${!n.seen ? "bg-red-50/40" : ""}`}>
                                <div className="flex gap-2">
                                  <div className="w-9 h-9 rounded-full bg-[#C62828] flex items-center justify-center text-white text-sm font-semibold">{n.title.charAt(0)}</div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{n.title}</p>
                                    <p className="text-xs text-gray-600 line-clamp-2">{n.description}</p>
                                    <p className="text-[11px] text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="px-3 py-2 border-t bg-gray-50 flex justify-between rounded-b-xl">
                            <button onClick={markAllRead} className="text-xs text-[#C62828] font-medium">Mark all read</button>
                            <button onClick={() => setNotifOpen(false)} className="text-xs text-gray-600">Close</button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* ── Profile Dropdown ── */}
               <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); setShowMaterialActionsMenu(false); }}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    {avatarUrl ? (
                      <img src={`${import.meta.env.VITE_API_URL + user.profile_picture}`} alt="avatar" className="w-9 h-9 rounded-full object-cover border-2 border-[#C62828]" />) : (
                      <div className="w-9 h-9 bg-[#C62828] rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">{initials}</span>
                      </div>
                    )}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold text-[#2D2D2D]">{displayName}</span>
                      <span className="text-xs text-gray-500">{displayRole}</span>
                    </div>
                  </button>

                  {profileOpen && (
                    <div className={`fixed lg:absolute top-16 lg:top-full right-2 lg:right-0 lg:mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 transform transition-all duration-300 ease-out ${profileOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0 pointer-events-none"}`}>
                      {/* Header */}
                      <div className="p-4 bg-[#2D2D2D] border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img src={`${import.meta.env.VITE_API_URL + user.profile_picture}`} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-[#C62828] shadow" />
                          ) : (
                            <div className="w-10 h-10 bg-[#C62828] rounded-full flex items-center justify-center shadow">
                              <span className="text-white font-semibold text-sm">{initials}</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{displayName}</p>
                            <p className="text-xs text-gray-300 truncate">{displayRole}</p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-2">
                        <button
                          onClick={() => { setProfileOpen(false); onTabChange("general-settings"); }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3 transition"
                        >
                          <FaCog className="w-4 h-4 text-gray-500" />
                          Settings
                        </button>
                        <button onClick={handleSignOut} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 hover:text-[#C62828] text-sm text-gray-700 flex items-center gap-3 transition">
                          <FaSignOutAlt className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="p-2 border-t bg-gray-50 text-right">
                        <button onClick={() => setProfileOpen(false)} className="text-sm text-gray-600 px-3 py-1.5 rounded hover:bg-gray-100">Close</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Actions Bar (store-management only) */}
          {activeTab === "store-management" && (can("create_inventory") || can("full_access")) && (
            <div className="lg:hidden bg-gray-50 border-t border-gray-200 px-4 py-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleMaterialButtonClick("in")} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${currentActiveFormTab === "in" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    <PackagePlus className="w-3.5 h-3.5" /><span>In</span>
                  </button>
                  <button onClick={() => handleMaterialButtonClick("out")} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${currentActiveFormTab === "out" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    <PackageMinus className="w-3.5 h-3.5" /><span>Out</span>
                  </button>
                  <button onClick={() => handleMaterialButtonClick("issue")} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${currentActiveFormTab === "issue" ? "bg-[#C62828] text-white shadow-sm" : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
                    <UserCheck className="w-3.5 h-3.5" /><span>Issue</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ── Page Content ── */}
        <main className="p-6">{children}</main>
      </div>

      {/* Request Material Modal */}
      {showRequestMaterial && <RequestMaterial setShowRequestMaterial={setShowRequestMaterial} />}
    </div>
  );
}