/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Layout.tsx
// import { ReactNode, useState, useMemo, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import Logo from "../assets/images/Nayash Logo.png";

// import {
//   FaBell,
//   FaBars,
//   FaSignOutAlt,
//   FaCog,
//   FaTimes,
// } from "react-icons/fa";
// import { MdBusiness } from "react-icons/md";

// import NotificationsApi from "../lib/notificationApi";
// import { toast } from "sonner";
// import RequestMaterial from "./materialRequest/RequestMaterial";
// import { MdDashboard, MdLocalShipping, MdDescription, MdConstruction, MdWarehouse, MdInventory2, MdRequestQuote, MdPayment, MdNotifications, MdAssessment, MdSettings, MdSecurity } from "react-icons/md";

// interface LayoutProps {
//   children: ReactNode;
//   activeTab: string;
//   onTabChange: (tab: string) => void;
// }
// interface NotificationType {
//   id: number;
//   title: string;
//   description: string;
//   type: string;
//   seen: boolean;
//   created_at: string;
// }

// export default function Layout({
//   children,
//   activeTab,
//   onTabChange,
// }: LayoutProps) {
//   const { profile, user, signOut, loading: authLoading } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [notifOpen, setNotifOpen] = useState(false);
//   const [userPermissions, setUserPermissions] = useState();
//   const [userMenus, setUserMenus] = useState<string[] | []>([]);
//   const [notifications, setNotifications] = useState<NotificationType[]>([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [showRequestMaterial, setShowRequestMaterial] =
//     useState<boolean>(false);

//   const menuItems = [
//   {
//     id: "dashboard",
//     label: "Dashboard",
//     icon: MdDashboard,
//     value: ["view_dashboard"],
//   },
//   {
//     id: "vendors",
//     label: "Vendors",
//     icon: MdLocalShipping,
//     value: [
//       "view_vendors",
//       "create_vendors",
//       "edit_vendors",
//       "delete_vendors",
//     ],
//   },
//   {
//     id: "purchase-orders",
//     label: "Purchase Orders",
//     icon: MdDescription,
//     value: [
//       "view_pos",
//       "create_pos",
//       "edit_pos",
//       "delete_pos",
//       "approve_pos",
//     ],
//   },
//   {
//     id: "service-orders",
//     label: "Service Orders",
//     icon: MdConstruction,
//     value: [
//       "edit_service_orders",
//       "create_service_orders",
//       "view_service_orders",
//     ],
//   },
//   {
//     id: "store-management",
//     label: "Store Management",
//     icon: MdWarehouse,
//     value: [
//       "edit_inventory",
//       "create_inventory",
//       "view_inventory",
//       "delete_inventory",
//     ],
//   },
//   {
//     id: "materials",
//     label: "Material Tracking",
//     icon: MdInventory2,
//     value: ["view_materials", "receive_materials"],
//   },
//   {
//     id: "material-requests",
//     label: "Material Requests",
//     icon: MdRequestQuote,
//     value: ["view_materials_requests", "update_materials_requests"],
//   },
//   {
//     id: "payments",
//     label: "Payments",
//     icon: MdPayment,
//     value: ["view_payments", "make_payments", "verify_payments"],
//   },
//   {
//     id: "notifications",
//     label: "Notifications",
//     icon: MdNotifications,
//     value: ["view_notifications"],
//   },
//   {
//     id: "reports",
//     label: "Reports",
//     icon: MdAssessment,
//     value: ["view_reports", "export_reports"],
//   },
//   {
//     id: "masters",
//     label: "Masters",
//     icon: MdSettings,
//     value: ["manage_users", "manage_roles"],
//   },
//   {
//     id: "permissions",
//     label: "Permissions",
//     icon: MdSecurity,
//     value: ["manage_permissions"],
//   },
// ];

//   const handleSignOut = async () => {
//     try {
//       await signOut();
//     } catch (error) {
//       console.error("Error signing out:", error);
//     }
//   };

//   const displayName = useMemo(() => {
//     return (
//       (profile && (profile as any).full_name) ||
//       (user && (user as any).full_name) ||
//       (profile && (profile as any).email) ||
//       (user && (user as any).email) ||
//       "User"
//     );
//   }, [profile, user]);

//   const contextAuth = useAuth();

//   useEffect(() => {
//     const result = Object.fromEntries(
//       Object.entries(contextAuth.user.permissions).filter(
//         ([_, value]) => value === true
//       )
//     );
//     const data = Object.keys(result) ?? [];
//     setUserMenus(data);
//     setUserPermissions(contextAuth.user.permissions);
//   }, []);

//   const displayRole = useMemo(() => {
//     return (
//       (profile && ((profile as any).role_name || (profile as any).role)) ||
//       (user && (user as any).role) ||
//       "No role"
//     );
//   }, [profile, user]);

//   const initials = useMemo(() => {
//     const name = String(displayName || "").trim();
//     if (!name || name === "User") return "U";
//     if (name.includes("@")) {
//       return name.split("@")[0].charAt(0).toUpperCase();
//     }
//     const parts = name.split(" ").filter(Boolean);
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
//   }, [displayName]);

//   const avatarUrl = (profile && (profile as any).avatar) || null;

//   const fetchNotifications = async () => {
//     try {
//       const res: any = await NotificationsApi.getNotifications();
//       const filteredNotifications = res.data.filter((n: any) => n.seen === 0);
//       setNotifications(filteredNotifications);
//     } catch (error) {
//       console.error("Failed to load notifications", error);
//     }
//   };
//   // demo notifications; replace with real data later
//   useEffect(() => {
//     // function to fetch notifications

//     // initial load
//     fetchNotifications();

//     // refresh every 1 minute
//     const intervalId = setInterval(() => {
//       fetchNotifications();
//     }, 60 * 1000); // 1 minute

//     // cleanup on unmount
//     return () => {
//       clearInterval(intervalId);
//     };
//   }, []);

//   const markAllRead = async () => {
//     try {
//       const result = await NotificationsApi.markAllAsSeen();
//       if (result.success) {
//         fetchNotifications();
//       } else {
//         toast.error("Failed mark all notifications as seen.");
//       }
//     } catch (err) {
//       console.error("Error marking all as read (demo):", err);
//     }
//   };

//   useEffect(() => {
//     const count = notifications.filter((n: any) => !n.seen).length;
//     setUnreadCount(count);
//   }, [notifications]);

//   // helper classes for animation (used in the panel)
//   const panelEnter = "opacity-100 translate-y-0 scale-100";
//   const panelExit = "opacity-0 -translate-y-2 scale-95";

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile top bar */}
//       <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <img src={Logo} className="w-26 h-10 text-blue-600" />
//         </div>

//         <div className="flex items-center gap-2">
//           <div className="relative">
//             <button
//               onClick={() => setShowRequestMaterial(true)}
//               className="text-xs flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               aria-label="Open notifications"
//             >
//               Request
//             </button>
//           </div>

//           <button
//             onClick={() => setNotifOpen(true)}
//             className="p-2 rounded-lg hover:bg-gray-100 relative"
//             aria-label="Notifications"
//           >
// <FaBell className="w-6 h-6 text-gray-600" />
//             {unreadCount > 0 && (
//               <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full">
//                 {unreadCount}
//               </span>
//             )}
//           </button>

//           <button
//             onClick={() => setSidebarOpen(!sidebarOpen)}
//             className="p-2 hover:bg-gray-100 rounded-lg transition"
//             aria-label="Toggle menu"
//           >
// <FaBars className="w-6 h-6" />
//           </button>
//         </div>
//       </div>

//       {/* Desktop top bar */}
//       <div className="hidden lg:flex fixed top-0 left-0 right-0 items-center justify-between bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50 px-6 h-16">
//         <div className="flex items-center gap-3">
//           <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-sm">
// <MdBusiness className="w-6 h-6 text-white" />
//           </div>
//           <div>
//             <h1 className="font-bold text-gray-800 text-lg">Nayash Group</h1>
//             <p className="text-xs text-gray-500">Management System</p>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           {/* Request Material Button */}
//           <div className="relative">
//             <button
//               onClick={() => setShowRequestMaterial(true)}
//               className="flex items-center px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//               aria-label="Open notifications"
//             >
//               Request
//             </button>
//           </div>

//           {/* Notification bell */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setNotifOpen((s) => !s);
//                 setProfileOpen(false);
//               }}
//               className="p-2 rounded-md hover:bg-gray-100 transition transform active:scale-95"
//               aria-label="Open notifications"
//             >
// <FaBell className="w-5 h-5 text-gray-700" />
//             </button>
//             {unreadCount > 0 && (
//               <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold leading-none text-white bg-red-500 rounded-full transform translate-x-1/2 -translate-y-1/2">
//                 {unreadCount}
//               </span>
//             )}
//           </div>

//           {/* Profile area */}
//           <div className="relative">
//             <button
//               onClick={() => {
//                 setProfileOpen((s) => !s);
//                 setNotifOpen(false);
//               }}
//               className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 transition transform active:scale-95"
//               aria-label="Open profile"
//             >
//               {avatarUrl ? (
//                 <img
//                   src={avatarUrl}
//                   alt="avatar"
//                   className="w-9 h-9 rounded-full object-cover border"
//                 />
//               ) : (
//                 <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border">
//                   <span className="text-blue-700 font-semibold">
//                     {initials}
//                   </span>
//                 </div>
//               )}
//               <div className="hidden md:flex flex-col items-start">
//                 <span className="text-sm font-medium text-gray-800">
//                   {displayName}
//                 </span>
//                 <span className="text-xs text-gray-500 truncate">
//                   {displayRole}
//                 </span>
//               </div>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Sidebar mobile backdrop */}
//       <div
//         className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${
//           sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
//         }`}
//         onClick={() => setSidebarOpen(false)}
//       />

//       {/* Sidebar */}
//       <aside
//         className={`fixed top-0 left-0 h-full w-52 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${
//           sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//         }`}
//         aria-label="Sidebar"
//       >
//         <div className="p-6 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <img src={Logo} className="h-20" />
//           </div>
//         </div>

//         {/* small profile in sidebar for mobile only */}
//         <div className="p-4 border-b border-gray-200 lg:hidden">
//           <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
//             {avatarUrl ? (
//               <img
//                 src={avatarUrl}
//                 alt="avatar"
//                 className="w-10 h-10 rounded-full object-cover"
//               />
//             ) : (
//               <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
//                 <span className="text-blue-600 font-semibold text-sm">
//                   {initials}
//                 </span>
//               </div>
//             )}

//             <div className="flex-1 min-w-0">
//               {authLoading ? (
//                 <div className="animate-pulse">
//                   <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
//                   <div className="h-3 bg-gray-200 rounded w-20" />
//                 </div>
//               ) : (
//                 <>
//                   <p className="text-sm font-medium text-gray-800 truncate">
//                     {displayName}
//                   </p>
//                   <p className="text-xs text-gray-500 capitalize truncate">
//                     {displayRole}
//                   </p>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//         <div className="h-[68vh] lg:h-[80vh] overflow-y-scroll scrollbar-thin ">
//           {/* navigation */}
//           <nav
//             className="p-4 space-y-1 flex-1 overflow-y-auto"
//             aria-label="Main navigation"
//           >
//             {menuItems.map((item) => {
//               const Icon = item.icon;
//               const isActive = activeTab === item.id;

//               return (
//                 <button
//                   key={item.id}
//                   onClick={() => {
//                     onTabChange(item.id);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${
//                     isActive
//                       ? "bg-blue-50 text-blue-600"
//                       : "text-gray-700 hover:bg-gray-50"
//                   } ${
//                     item.value.some((d) =>
//                       (userMenus as string[]).includes(d)
//                     ) || (userMenus as string[]).includes("full_access")
//                       ? "block"
//                       : "hidden"
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="font-medium text-sm">{item.label}</span>
//                 </button>
//               );
//             })}
//           </nav>

//           {/* mobile sign out */}
//           <div className="p-4 border-t border-gray-200 lg:hidden">
//             <button
//               onClick={handleSignOut}
//               className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
//             >
// <FaSignOutAlt className="w-5 h-5" />
//               <span className="font-medium text-sm">Sign Out</span>
//             </button>
//           </div>
//         </div>
//       </aside>

//       {/* main content */}
//       <main className="lg:ml-52 pt-16 lg:pt-16">
//         <div>{children}</div>
//       </main>

//       {/* ---------------- Notifications panel: TOP aligned (drop-down style) ---------------- */}
//       {notifOpen && (
//         <>
//           {/* backdrop to close when clicking outside (light transparent so topbar is still readable) */}
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setNotifOpen(false)}
//             aria-hidden
//           />

//           {/* Panel: desktop small dropdown, mobile full top-sheet */}
//           <div
//             className={`fixed z-50 top-16 right-6 lg:right-36 w-[18rem] sm:w-96
//               bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden
//               transform transition-all duration-200 ease-out ${
//                 notifOpen ? panelEnter : panelExit
//               }`}
//             style={{ willChange: "transform, opacity" }}
//             role="dialog"
//             aria-label="Notifications"
//           >
//             {/* caret / arrow for desktop */}
//             <div className="hidden lg:block absolute -top-2 right-6 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-200 z-10" />

//             <div className="flex items-center justify-between px-4 py-3 border-b">
//               <h4 className="text-sm font-semibold text-gray-800">
//                 Notifications
//               </h4>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs text-gray-500">
//                   {unreadCount} unread
//                 </span>
//                 <button
//                   onClick={() => setNotifOpen(false)}
//                   className="p-1 rounded hover:bg-gray-100"
//                 >
// <FaTimes className="w-4 h-4 text-gray-600" />
//                 </button>
//               </div>
//             </div>

//             <div className="max-h-72 overflow-y-auto p-3 space-y-3">
//               {notifications.length === 0 ? (
//                 <div className="text-sm text-gray-500">
//                   No notifications yet
//                 </div>
//               ) : (
//                 notifications.map((n) => (
//                   <div
//                     key={n.id}
//                     className={`flex items-center gap-3 p-3 rounded-lg ${
//                       n.seen
//                         ? "bg-white"
//                         : "bg-blue-50/60 border border-blue-100"
//                     }`}
//                   >
//                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-50 border flex items-center justify-center text-sm text-blue-600 font-semibold shadow-sm">
//                       {String(n.title).charAt(0)}
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between">
//                         <p className="text-sm font-medium text-gray-800">
//                           {n.title}
//                         </p>
//                       </div>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {n.description}
//                       </p>
//                       <p className="text-xs text-gray-400 mt-2">
//                         {new Date(n.created_at).toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>

//             <div className="px-3 py-2 border-t flex items-center justify-between bg-gradient-to-b from-white/40 to-white/30">
//               <button
//                 className="text-sm text-blue-600 hover:underline"
//                 onClick={() => {
//                   markAllRead();
//                   setNotifOpen(false);
//                 }}
//               >
//                 Mark all as read
//               </button>

//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setNotifOpen(false)}
//                   className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-sm text-gray-700"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* ---------------- Profile panel: TOP aligned (drop-down style) ---------------- */}
//       {profileOpen && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setProfileOpen(false)}
//             aria-hidden
//           />

//           <div
//             className={`fixed z-50 top-16 right-6 w-72 sm:w-80 bg-white/97 backdrop-blur-sm border border-gray-200 rounded-lg shadow-xl overflow-hidden
//               transform transition-all duration-200 ease-out ${
//                 profileOpen ? panelEnter : panelExit
//               }`}
//             style={{ willChange: "transform, opacity" }}
//             role="dialog"
//             aria-label="Profile menu"
//           >
//             <div className="hidden lg:block absolute -top-2 right-8 w-4 h-4 rotate-45 bg-white border-l border-t border-gray-200 z-10" />

//             <div className="p-4">
//               <div className="flex items-center gap-3">
//                 {avatarUrl ? (
//                   <img
//                     src={avatarUrl}
//                     alt="avatar"
//                     className="w-12 h-12 rounded-full object-cover border"
//                   />
//                 ) : (
//                   <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border">
//                     <span className="text-blue-700 font-semibold">
//                       {initials}
//                     </span>
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm font-semibold text-gray-800">
//                     {displayName}
//                   </p>
//                   <p className="text-xs text-gray-500">{displayRole}</p>
//                 </div>
//               </div>

//               <div className="mt-4 grid gap-2">
//                 <button
//                   onClick={() => {
//                     setProfileOpen(false);
//                   }}
//                   className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
//                 >
// <FaCog className="w-4 h-4 text-gray-500" />
//                   Settings
//                 </button>

//                 <button
//                   onClick={handleSignOut}
//                   className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 hover:text-red-600 text-sm text-gray-700 flex items-center gap-2"
//                 >
// <FaSignOutAlt className="w-4 h-4" />
//                   Sign out
//                 </button>
//               </div>
//             </div>

//             <div className="p-2 border-t text-right">
//               <button
//                 onClick={() => setProfileOpen(false)}
//                 className="text-sm text-gray-600 px-2 py-1 rounded hover:bg-gray-50"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//       {showRequestMaterial && (
//         <RequestMaterial setShowRequestMaterial={setShowRequestMaterial} />
//       )}
//     </div>
//   );
// }
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useState, useMemo, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import Logo from "../assets/images/Nayash Logo.png";
import { FaBell, FaTimes, FaSignOutAlt, FaCog } from "react-icons/fa";
import {
  MdBusiness,
  MdDashboard,
  MdLocalShipping,
  MdDescription,
  MdConstruction,
  MdWarehouse,
  MdInventory2,
  MdRequestQuote,
  MdPayment,
  MdNotifications,
  MdChecklist,
  MdAssessment,
  MdSettings,
  MdSecurity,
} from "react-icons/md";
import { Menu, ChevronRight, Clock } from "lucide-react";
import { MdBusiness, MdDashboard, MdLocalShipping, MdDescription, MdConstruction, MdWarehouse, MdInventory2, MdRequestQuote, MdPayment, MdNotifications, MdAssessment, MdSettings, MdSecurity, MdAccountCircle } from "react-icons/md";
import { Menu, ChevronRight, Clock, PackagePlus, PackageMinus, UserCheck } from "lucide-react";
import NotificationsApi from "../lib/notificationApi";
import { toast } from "sonner";
import RequestMaterial from "./materialRequest/RequestMaterial";
import { BsPerson } from "react-icons/bs";

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

export default function Layout({
  children,
  activeTab,
  onTabChange,
export default function Layout({ 
  children, 
  activeTab, 
  onTabChange,
  activeFormTab = "",
  setActiveFormTab = () => {},
}: LayoutProps) {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userPermissions, setUserPermissions] = useState();
  const [userMenus, setUserMenus] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showRequestMaterial, setShowRequestMaterial] =
    useState<boolean>(false);
  const [showRequestMaterial, setShowRequestMaterial] = useState<boolean>(false);
  
  // Local state for forms if not provided via props
  const [localActiveFormTab, setLocalActiveFormTab] = useState<string>("");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      value: ["view_dashboard"],
    },
    {
      id: "vendors",
      label: "Vendors",
      icon: MdLocalShipping,
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
      icon: MdDescription,
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
      icon: MdConstruction,
      value: [
        "edit_service_orders",
        "create_service_orders",
        "view_service_orders",
      ],
    },
    {
      id: "store-management",
      label: "Store Management",
      icon: MdWarehouse,
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
      icon: MdInventory2,
      value: ["view_materials", "receive_materials"],
    },
    {
      id: "material-requests",
      label: "Material Requests",
      icon: MdRequestQuote,
      value: ["view_materials_requests", "update_materials_requests"],
    },
    {
      id: "payments",
      label: "Payments",
      icon: MdPayment,
      value: ["view_payments", "make_payments", "verify_payments"],
    },
    {
      id: "task-management",
      label: "Task Management",
      icon: MdChecklist,
      value: ["view_task", "create_task", "update_task", "delete_task"],
    },
    {
      id: "hrms",
      label: "HRMS",
      icon: BsPerson,
      value: ["view_hrms", "create_hrms", "update_hrms", "delete_hrms"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: MdNotifications,
      value: ["view_notifications"],
    },
    {
      id: "reports",
      label: "Reports",
      icon: MdAssessment,
      value: ["view_reports", "export_reports"],
    },

    {
      id: "masters",
      label: "Masters",
      icon: MdSettings,
      value: ["manage_users", "manage_roles"],
    },
    {
      id: "users",
      label: "Users",
      icon: MdAccountCircle,
      value: ["manage_users"],
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: MdSecurity,
      value: ["manage_permissions"],
    },
  ];

  // Determine which activeFormTab to use
  const currentActiveFormTab = activeFormTab !== undefined ? activeFormTab : localActiveFormTab;
  const currentSetActiveFormTab = setActiveFormTab || setLocalActiveFormTab;

  // Get current active menu label for header
  const activeMenuLabel = useMemo(() => {
    const activeItem = menuItems.find((item) => item.id === activeTab);
    return activeItem ? activeItem.label : "Dashboard";
  }, [activeTab]);

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
        ([_, value]) => value === true,
      ),
    );
    const data = Object.keys(result) ?? [];
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

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res: any = await NotificationsApi.getNotifications();
      const filteredNotifications = res.data.filter((n: any) => n.seen === 0);
      setNotifications(filteredNotifications);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  useEffect(() => {
    // Initial load
    fetchNotifications();

    // Refresh every 1 minute
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const markAllRead = async () => {
    try {
      const result = await NotificationsApi.markAllAsSeen();
      if (result.success) {
        fetchNotifications();
      } else {
        toast.error("Failed to mark all notifications as seen.");
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  useEffect(() => {
    const count = notifications.filter((n: any) => !n.seen).length;
    setUnreadCount(count);
  }, [notifications]);

  // Format date/time with relative time
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check permission function
  const can = (permission: string) => {
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      null;
    if (role === "admin") return true;
    const perms: Record<string, boolean> | null =
      (profile as any)?.permissions ?? null;
    if (perms && typeof perms === "object") {
      return Boolean(perms[permission]);
    }
    return false;
  };

  // Handle material form button click
  const handleMaterialButtonClick = (formType: string) => {
    currentSetActiveFormTab(formType);
  };

  // Reset form tab when changing tabs
  useEffect(() => {
    if (activeTab !== "store-management") {
      currentSetActiveFormTab("");
    }
  }, [activeTab, currentSetActiveFormTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-56" : "w-20"}
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-[#2D2D2D] border-r border-gray-700 flex flex-col shadow-lg`}
      >
        {/* Logo Section */}
        <div
          className={`h-20 border-b border-gray-700 flex items-center ${sidebarOpen ? "justify-start px-4" : "justify-center"} transition-all bg-[#2D2D2D]`}
        >
        <div className={`h-20 border-b border-gray-700 flex items-center ${sidebarOpen ? 'justify-start px-4' : 'justify-center'} transition-all bg-[#2D2D2D]`}>
          {sidebarOpen ? (
            <img
              src={Logo}
              alt="Nayash Group"
              className="h-16 w-auto object-contain brightness-0 invert"
              style={{ filter: "brightness(0) invert(1)" }}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : (
            <img
              src={Logo}
              alt="N"
              className="h-10 w-10 object-contain brightness-0 invert"
              style={{ filter: "brightness(0) invert(1)" }}
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          )}
        </div>

        {/* Mobile Profile Section */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700 lg:hidden">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#3D3D3D] rounded-lg">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#C62828]"
                />
              ) : (
                <div className="w-10 h-10 bg-[#C62828] rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">
                    {initials}
                  </span>
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
                    <p className="text-sm font-semibold text-white truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize truncate">
                      {displayRole}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
          {!sidebarOpen ? (
            // Collapsed View - Only Icons
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const hasPermission =
                  item.value.some((d) => userMenus.includes(d)) ||
                  userMenus.includes("full_access");
                const hasPermission = item.value.some((d) => userMenus.includes(d)) || userMenus.includes("full_access");

                if (!hasPermission) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setSidebarOpen(true);
                    }}
                    className={`w-full flex items-center justify-center p-3 rounded-lg transition-all group relative
                      ${
                        isActive
                          ? "bg-[#C62828] text-white shadow-lg"
                          : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"
                      ${isActive
                        ? 'bg-[#C62828] text-white shadow-lg'
                        : 'text-gray-400 hover:bg-[#3D3D3D] hover:text-white'
                      }`}
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
            // Expanded View
            <div className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                const hasPermission =
                  item.value.some((d) => userMenus.includes(d)) ||
                  userMenus.includes("full_access");
                const hasPermission = item.value.some((d) => userMenus.includes(d)) || userMenus.includes("full_access");

                if (!hasPermission) return null;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-[#C62828] text-white shadow-lg"
                          : "text-gray-400 hover:bg-[#3D3D3D] hover:text-white"
                      ${isActive
                        ? 'bg-[#C62828] text-white shadow-lg'
                        : 'text-gray-400 hover:bg-[#3D3D3D] hover:text-white'
                      }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm truncate">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </nav>

        {/* Sign Out Button (Mobile Only) */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-700 lg:hidden">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-[#C62828] hover:text-white rounded-lg transition"
            >
              <FaSignOutAlt className="w-5 h-5" />
              <span className="font-medium text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ease-in-out min-h-screen ${sidebarOpen ? "lg:ml-56" : "lg:ml-20"}`}
      >
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 h-full">
            <div className="flex items-center justify-between h-full">
              {/* Left Side */}
              <div className="flex items-center space-x-3">
                {/* Desktop Sidebar Toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  {sidebarOpen ? (
                    <Menu className="w-5 h-5 text-[#2D2D2D]" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-[#2D2D2D]" />
                  )}
                </button>

                {/* Mobile Sidebar Toggle */}
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <Menu className="w-5 h-5 text-[#2D2D2D]" />
                </button>

                {/* Dynamic Page Title */}
                <div className="flex items-center gap-3">
                  <div className="bg-[#C62828] p-2 rounded-lg shadow-sm">
                    <MdBusiness className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-bold text-[#2D2D2D] text-lg leading-tight">
                      {activeMenuLabel}
                    </h1>
                    <p className="text-xs text-gray-500">
                      Nayash Group Management
                    </p>
                  </div>
                </div>

                {/* Store Management Buttons - Only show when activeTab is "store-management" */}
                {activeTab === "store-management" && can("create_inventory") && (
                  <div className="hidden md:flex items-center gap-2 ml-4 border-l border-gray-300 pl-4">
                    <button
                      onClick={() => handleMaterialButtonClick("in")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        currentActiveFormTab === "in"
                          ? "bg-[#C62828] text-white shadow-sm"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <PackagePlus className="w-5 h-5" />
                      Material In
                    </button>
                    <button
                      onClick={() => handleMaterialButtonClick("out")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        currentActiveFormTab === "out"
                          ? "bg-[#C62828] text-white shadow-sm"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <PackageMinus className="w-5 h-5" />
                      Material Out
                    </button>
                    <button
                      onClick={() => handleMaterialButtonClick("issue")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        currentActiveFormTab === "issue"
                          ? "bg-[#C62828] text-white shadow-sm"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <UserCheck className="w-5 h-5" />
                      Issue Material
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-3">
                {/* Request Material Button */}
                <button
                  onClick={() => setShowRequestMaterial(true)}
                  className="hidden sm:flex items-center px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] hover:shadow-lg transition text-sm font-medium"
                >
                  Request Material
                </button>

                {/* Notification Bell */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => {
                      setNotifOpen(!notifOpen);
                      setProfileOpen(false);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition relative"
                  >
                    <FaBell className="w-5 h-5 text-[#2D2D2D]" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C62828] text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-[#2D2D2D]">
                        <h4 className="text-sm font-semibold text-white">
                          Notifications
                        </h4>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-300 bg-[#C62828] px-2 py-1 rounded-full">
                            {unreadCount} new
                          </span>
                          <button
                            onClick={() => setNotifOpen(false)}
                            className="p-1 hover:bg-[#3D3D3D] rounded"
                          >
                            <FaTimes className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">
                              No notifications yet
                            </p>
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${!n.seen ? "bg-red-50/40" : ""
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#C62828] flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                                  {n.title.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="text-sm font-semibold text-gray-900">
                                      {n.title}
                                    </p>
                                    {!n.seen && (
                                      <span className="w-2 h-2 bg-[#C62828] rounded-full flex-shrink-0 mt-1"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {n.description}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                                    <p className="text-xs text-gray-400">
                                      {formatDateTime(n.created_at)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
                        <button
                          onClick={() => {
                            markAllRead();
                            setNotifOpen(false);
                          }}
                          className="text-sm text-[#C62828] hover:text-[#A62222] font-medium"
                        >
                          Mark all as read
                        </button>
                        <button
                          onClick={() => setNotifOpen(false)}
                          className="px-3 py-1.5 rounded-md bg-white border border-gray-300 hover:bg-gray-100 text-sm text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => {
                      setProfileOpen(!profileOpen);
                      setNotifOpen(false);
                    }}
                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition"
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border-2 border-[#C62828]"
                      />
                    ) : (
                      <div className="w-9 h-9 bg-[#C62828] rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-white font-semibold text-sm">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-semibold text-[#2D2D2D]">
                        {displayName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {displayRole}
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                      <div className="p-4 bg-[#2D2D2D] border-b border-gray-700">
                        <div className="flex items-center gap-3">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="avatar"
                              className="w-12 h-12 rounded-full object-cover border-2 border-[#C62828] shadow"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-[#C62828] rounded-full flex items-center justify-center shadow">
                              <span className="text-white font-semibold">
                                {initials}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {displayName}
                            </p>
                            <p className="text-xs text-gray-300">
                              {displayRole}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <button className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 text-sm text-gray-700 flex items-center gap-3 transition">
                          <FaCog className="w-4 h-4 text-gray-500" />
                          Settings
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 hover:text-[#C62828] text-sm text-gray-700 flex items-center gap-3 transition"
                        >
                          <FaSignOutAlt className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>

                      <div className="p-2 border-t bg-gray-50 text-right">
                        <button
                          onClick={() => setProfileOpen(false)}
                          className="text-sm text-gray-600 px-3 py-1.5 rounded hover:bg-gray-100"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">{children}</main>
        {/* Main Content Area with Forms */}
        <main className="p-6">
          {/* Render Material Forms when in Store Management tab */}
          {/* {activeTab === "store-management" && (
            <>
              {currentActiveFormTab === "in" && (
                <MaterialInForm
                  setLoadTableData={() => {}} // You need to pass proper function from parent
                  setActiveFormTab={currentSetActiveFormTab}
                  loadAllData={() => {}} // You need to pass proper function from parent
                />
              )}
              {currentActiveFormTab === "out" && (
                <MaterialOutForm
                  setLoadTableData={() => {}}
                  setActiveFormTab={currentSetActiveFormTab}
                  allInventory={[]} // You need to pass inventory data from parent
                  loadAllData={() => {}}
                />
              )}
              {currentActiveFormTab === "issue" && (
                <IssueMaterial
                  setLoadTableData={() => {}}
                  setActiveFormTab={currentSetActiveFormTab}
                  allInventory={[]} // You need to pass inventory data from parent
                  loadAllData={() => {}}
                />
              )}
            </>
          )} */}
          
          {/* Render children (StoreManagement component) */}
          {children}
        </main>
      </div>

      {/* Request Material Modal */}
      {showRequestMaterial && (
        <RequestMaterial setShowRequestMaterial={setShowRequestMaterial} />
      )}
    </div>
  );
}
