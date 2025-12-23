// src/components/Layout.tsx
import { ReactNode, useState, useMemo, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/images/Nayash Logo.png";

import {
  Building2,
  LayoutDashboard,
  Users,
  FileText,
  Wrench,
  Package,
  CreditCard,
  Bell,
  BarChart3,
  Settings,
  Warehouse,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({
  children,
  activeTab,
  onTabChange,
}: LayoutProps) {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState();
  const [userMenus, setUserMenus] = useState<string[] | []>([]);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      value: ["view_dashboard"],
    },
    {
      id: "vendors",
      label: "Vendors",
      icon: Users,
      value: [
        "view_vendors",
        "create_vendors",
        "edit_vendors",
        "delete_vendors",
      ],
    },
    {
      id: "purchase-orders",
      label: "Purchase Orders",
      icon: FileText,
      value: [
        "view_pos",
        "create_pos",
        "edit_pos",
        "delete_pos",
        "approve_pos",
      ],
    },
    {
      id: "service-orders",
      label: "Service Orders",
      icon: Wrench,
      value: [
        "edit_service_orders",
        "create_service_orders",
        "view_service_orders",
      ],
    },
    {
      id: "store-management",
      label: "Store Management",
      icon: Warehouse,
      value: [
        "edit_inventory",
        "create_inventory",
        "view_inventory",
        "delete_inventory",
      ],
    },
    {
      id: "materials",
      label: "Material Tracking",
      icon: Package,
      value: ["view_materials", "receive_materials"],
    },
    {
      id: "payments",
      label: "Payments",
      icon: CreditCard,
      value: ["view_payments", "make_payments", "verify_payments"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      value: [],
    },
    {
      id: "reports",
      label: "Reports",
      icon: BarChart3,
      value: ["view_reports", "export_reports"],
    },
    {
      id: "masters",
      label: "Masters",
      icon: Settings,
      value: ["manage_users", "manage_roles"],
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: Shield,
      value: ["manage_permissions"],
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const displayName = useMemo(() => {
    return (
      (profile && (profile as any).full_name) ||
      (user && (user as any).full_name) ||
      (profile && (profile as any).email) ||
      (user && (user as any).email) ||
      "User"
    );
  }, [profile, user]);

  const contextAuth = useAuth();

  useEffect(() => {
    const result = Object.fromEntries(
      Object.entries(contextAuth.user.permissions).filter(
        ([_, value]) => value === true
      )
    );
    const data = Object.keys(result) ?? [];
    console.log(data, "user permissions menus");
    setUserMenus(data);
    setUserPermissions(contextAuth.user.permissions);
  }, []);

  const displayRole = useMemo(() => {
    return (
      (profile && ((profile as any).role_name || (profile as any).role)) ||
      (user && (user as any).role) ||
      "No role"
    );
  }, [profile, user]);

  const initials = useMemo(() => {
    const name = String(displayName || "").trim();
    if (!name || name === "User") return "U";
    if (name.includes("@")) {
      return name.split("@")[0].charAt(0).toUpperCase();
    }
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [displayName]);

  const avatarUrl = (profile && (profile as any).avatar) || null;

  // demo notifications; replace with real data later
  const notifications = [
    { id: 1, title: "New vendor added", time: "2m ago", unread: true },
    { id: 2, title: "PO #123 approved", time: "1h ago", unread: true },
    { id: 3, title: "Payment overdue", time: "2d ago", unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  // helper classes for animation (used in the panel)
  const panelEnter = "opacity-100 translate-y-0 scale-100";
  const panelExit = "opacity-0 -translate-y-2 scale-95";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-800">Nayash Group</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNotifOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 relative"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:flex fixed top-0 left-0 right-0 items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 px-6 h-16">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-800 text-lg">Nayash Group</h1>
            <p className="text-xs text-gray-500">Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen((s) => !s);
                setProfileOpen(false);
              }}
              className="p-2 rounded-md hover:bg-gray-100 transition transform active:scale-95"
              aria-label="Open notifications"
            >
              <Bell className="w-5 h-5 text-gray-700" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Profile area */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen((s) => !s);
                setNotifOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition transform active:scale-95"
              aria-label="Open profile"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-9 h-9 rounded-full object-cover border"
                />
              ) : (
                <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border">
                  <span className="text-blue-700 font-semibold">
                    {initials}
                  </span>
                </div>
              )}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium text-gray-800">
                  {displayName}
                </span>
                <span className="text-xs text-gray-500 truncate">
                  {displayRole}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        aria-label="Sidebar"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src={Logo} className="h-20" />
          </div>
        </div>

        {/* small profile in sidebar for mobile only */}
        <div className="p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">
                  {initials}
                </span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {authLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize truncate">
                    {displayRole}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* navigation */}
        <nav
          className="p-4 space-y-1 flex-1 overflow-y-auto"
          aria-label="Main navigation"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                } ${
                  item.value.some((d) => (userMenus as string[]).includes(d)) ||
                  (userMenus as string[]).includes("full_access")
                    ? "block"
                    : "hidden"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* mobile sign out */}
        <div className="p-4 border-t border-gray-200 lg:hidden">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* main content */}
      <main className="lg:ml-64 pt-16 lg:pt-16">
        <div className="p-6">{children}</div>
      </main>

      {/* ---------------- Notifications panel: TOP aligned (drop-down style) ---------------- */}
      {notifOpen && (
        <>
          {/* backdrop to close when clicking outside (light transparent so topbar is still readable) */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setNotifOpen(false)}
            aria-hidden
          />

          {/* Panel: desktop small dropdown, mobile full top-sheet */}
          <div
            className={`fixed z-50 top-16 right-6 lg:right-36 w-[18rem] sm:w-96
              bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden
              transform transition-all duration-200 ease-out ${
                notifOpen ? panelEnter : panelExit
              }`}
            style={{ willChange: "transform, opacity" }}
            role="dialog"
            aria-label="Notifications"
          >
            {/* caret / arrow for desktop */}
            <div className="hidden lg:block absolute -top-2 right-6 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-200 z-10" />

            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h4 className="text-sm font-semibold text-gray-800">
                Notifications
              </h4>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {unreadCount} unread
                </span>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-3 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-lg ${
                      n.unread
                        ? "bg-blue-50/60 border border-blue-100"
                        : "bg-white"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border flex items-center justify-center text-sm text-blue-600 font-semibold shadow-sm">
                      {String(n.title).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800">
                          {n.title}
                        </p>
                        <span className="text-xs text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Short description or details here. Add more info to show
                        context.
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="px-3 py-2 border-t flex items-center justify-between bg-gradient-to-b from-white/40 to-white/30">
              <button
                className="text-sm text-blue-600 hover:underline"
                onClick={() => {
                  // TODO: implement "mark all read"
                  console.log("Mark all as read (implement)");
                  setNotifOpen(false);
                }}
              >
                Mark all as read
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotifOpen(false)}
                  className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ---------------- Profile panel: TOP aligned (drop-down style) ---------------- */}
      {profileOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setProfileOpen(false)}
            aria-hidden
          />

          <div
            className={`fixed z-50 top-16 right-6 w-72 sm:w-80 bg-white/97 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden
              transform transition-all duration-200 ease-out ${
                profileOpen ? panelEnter : panelExit
              }`}
            style={{ willChange: "transform, opacity" }}
            role="dialog"
            aria-label="Profile menu"
          >
            <div className="hidden lg:block absolute -top-2 right-8 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-200 z-10" />

            <div className="p-4">
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border">
                    <span className="text-blue-700 font-semibold">
                      {initials}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500">{displayRole}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                <button
                  onClick={() => {
                    console.log("Go to settings");
                    setProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 text-sm text-gray-700 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </div>

            <div className="p-2 border-t text-right">
              <button
                onClick={() => setProfileOpen(false)}
                className="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
