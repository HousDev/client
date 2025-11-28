// src/components/Layout.tsx
import { ReactNode, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { profile, user, signOut, loading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Menu (unchanged)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText },
    { id: 'service-orders', label: 'Service Orders', icon: Wrench },
    { id: 'materials', label: 'Material Tracking', icon: Package },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'masters', label: 'Masters', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Shield },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Derive display fields with safe fallbacks
  const displayName = useMemo(() => {
    // prefer profile.full_name, then user.full_name, then profile.email, then user.email
    return (
      (profile && (profile as any).full_name) ||
      (user && (user as any).full_name) ||
      (profile && (profile as any).email) ||
      (user && (user as any).email) ||
      'User'
    );
  }, [profile, user]);

  const displayRole = useMemo(() => {
    // prefer profile.role_name, profile.role, user.role
    return (
      (profile && ((profile as any).role_name || (profile as any).role)) ||
      (user && (user as any).role) ||
      'No role'
    );
  }, [profile, user]);

  const initials = useMemo(() => {
    const name = String(displayName || '').trim();
    if (!name || name === 'User') return 'U';
    // If name is an email, show first letter of local-part
    if (name.includes('@')) {
      return name.split('@')[0].charAt(0).toUpperCase();
    }
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [displayName]);

  // Optional avatar image: replace with user's avatar url when available.
  // For quick testing you can use the uploaded image file path:
  // "/mnt/data/915406a0-d838-4069-b99e-8f32f0364917.png"
  // If you don't want an image, set avatarUrl to null.
  const avatarUrl = (profile && (profile as any).avatar) || null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar for mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-800">Nayash Group</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* backdrop for mobile sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">Nayash Group</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
        </div>

        {/* Profile block */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
            {avatarUrl ? (
              // if an avatar url exists show the image
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // if image load fails, hide it (fallback to initials)
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">{initials}</span>
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* If auth is still initializing, show subtle loading */}
              {authLoading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20" />
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-800 truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 capitalize truncate">{displayRole}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto" aria-label="Main navigation">
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-left ${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
