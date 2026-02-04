// src/components/settings/GeneralSettings.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { SettingsApi } from "../../lib/settingsApi";
import { toast } from "sonner";
import {
  FaCamera,
  FaSave,
  FaUpload,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import { MdPhotoCamera } from "react-icons/md";
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  Mail,
  MessageSquare,
  Globe,
  Monitor,
  Smartphone as PhoneIcon,
  Palette as ColorPalette,
  Image as ImageIcon,
  Clock,
  Key,
  Shield as ShieldIcon,
  Zap,
  Moon,
  Sun,
  Eye,
  EyeOff,
  Globe as GlobeIcon,
  FileText,
  Lock,
} from "lucide-react";

// ─── INTERFACES ───────────────────────────────────────────────────────────
interface UserProfile {
  id: number | string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  department: string | null;
  designation: string | null;
  created_at: string;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
}

interface SecuritySettings {
  twoFactor: boolean;
  sessionTimeout: number;
  passwordExpiry: number;
  ipWhitelist: string[];
}

interface SystemSettings {
  theme: "light" | "dark" | "auto";
  primaryColor: string;
  logo: string | null;
  favicon: string | null;
  timezone: string;
  dateFormat: string;
  language: string;
}

// ═══════════════════════════════════════════════════════════════════════════
const GeneralSettings: React.FC = () => {
  const { user, profile, updateProfileLocally, updateSystemSettingsLocally, refreshSystemSettings } = useAuth();

  const [activeTab, setActiveTab] = useState<string>("profile");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // ── User Profile State ──────────────────────────────────────────────────
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 0,
    full_name: "",
    email: "",
    phone: "",
    role: "user",
    avatar: null,
    department: null,
    designation: null,
    created_at: new Date().toISOString(),
  });

  // ── Notification Preferences State ─────────────────────────────────────
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: true,
    whatsapp: false,
  });

  // ── Security Settings State (local – 2FA / session / IP) ────────────────
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactor: false,
    sessionTimeout: 60,
    passwordExpiry: 90,
    ipWhitelist: [],
  });

  // ── System Settings State (Admin only) ──────────────────────────────────
  const [system, setSystem] = useState<SystemSettings>({
    theme: "light",
    primaryColor: "#C62828",
    logo: null,
    favicon: null,
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    language: "en",
  });

  // ── Password Change State ───────────────────────────────────────────────
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ── IP Whitelist input ──────────────────────────────────────────────────
  const [newIp, setNewIp] = useState("");

  // ── Admin flag ──────────────────────────────────────────────────────────
  const isAdmin = user?.role === "admin" || profile?.role === "admin";

  // ═══ MOUNT – load everything from backend ═════════════════════════════════
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      // 1. Profile
      const profileData = await SettingsApi.getProfile();
      setUserProfile({
        id: profileData.id,
        full_name: profileData.full_name || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        role: profileData.role || "user",
        avatar: profileData.avatar || null,
        department: profileData.department || null,
        designation: profileData.designation || null,
        created_at: profileData.created_at || new Date().toISOString(),
      });

      // 2. Notification preferences
      const prefs = await SettingsApi.getNotificationPreferences();
      setNotifications(prefs);

      // 3. System settings (admin only)
      if (isAdmin) {
        const sys = await SettingsApi.getSystemSettings();
        setSystem(sys);
      }

      // 4. Security – still local (2FA / session / IP not yet in backend)
      const savedSecurity = localStorage.getItem("security_settings");
      if (savedSecurity) setSecurity(JSON.parse(savedSecurity));
    } catch (error) {
      console.error("Failed to load settings:", error);
      // Fallback: populate from auth context
      setUserProfile({
        id: user?.id || 0,
        full_name: user?.full_name || profile?.full_name || "",
        email: user?.email || profile?.email || "",
        phone: user?.phone || profile?.phone || "",
        role: user?.role || profile?.role || "user",
        avatar: user?.avatar || profile?.avatar || null,
        department: user?.department || profile?.department || null,
        designation: user?.designation || profile?.designation || null,
        created_at:
          user?.created_at || profile?.created_at || new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // ═══ PROFILE ══════════════════════════════════════════════════════════════
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await SettingsApi.updateProfile({
        full_name: userProfile.full_name,
      });
      updateProfileLocally({ full_name: updated.full_name });
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const result = await SettingsApi.uploadAvatar(file);
      setUserProfile((prev) => ({ ...prev, avatar: result.avatar }));
      updateProfileLocally({ avatar: result.avatar });
      toast.success("Profile picture updated");
    } catch (error: any) {
      toast.error("Failed to upload profile picture");
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await SettingsApi.removeAvatar();
      setUserProfile((prev) => ({ ...prev, avatar: null }));
      updateProfileLocally({ avatar: null });
      toast.success("Profile picture removed");
    } catch (error: any) {
      toast.error("Failed to remove profile picture");
    }
  };

  // ═══ NOTIFICATIONS ════════════════════════════════════════════════════════
  const handleSaveNotifications = async () => {
    try {
      await SettingsApi.updateNotificationPreferences(notifications);
      toast.success("Notification preferences saved");
    } catch (error: any) {
      toast.error("Failed to save preferences");
    }
  };

  // ═══ SECURITY – password change ═══════════════════════════════════════════
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      toast.error("New password and confirm password don't match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    if (!passwordData.current) {
      toast.error("Please enter your current password");
      return;
    }

    setSaving(true);
    try {
      await SettingsApi.changePassword({
        current_password: passwordData.current,
        new_password: passwordData.new,
      });
      toast.success("Password changed successfully");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  // ═══ SECURITY – local IP / 2FA / session (localStorage for now) ═══════════
  const handleSaveSecurity = () => {
    localStorage.setItem("security_settings", JSON.stringify(security));
    toast.success("Security settings saved");
  };

  const handleAddIp = () => {
    if (newIp && /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(newIp)) {
      setSecurity((prev) => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIp],
      }));
      setNewIp("");
    } else {
      toast.error("Invalid IP address");
    }
  };

  const handleRemoveIp = (ip: string) => {
    setSecurity((prev) => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter((i) => i !== ip),
    }));
  };

  // ═══ SYSTEM SETTINGS – Logo/Favicon uploads ═══════════════════════════════
 // In the handleLogoFileChange function in GeneralSettings.tsx
const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Logo must be under 5 MB");
    return;
  }
  if (!["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(file.type)) {
    toast.error("Only PNG, JPG or SVG allowed");
    return;
  }

  try {
    const result = await SettingsApi.uploadLogo(file);
    
    // ✅ Update local state FIRST with the response
    setSystem(result);
    
    // ✅ Update AuthContext so Layout sees the change
    updateSystemSettingsLocally(result);
    
    toast.success("Logo uploaded successfully");
    
    // Force re-render for immediate preview update
    setTimeout(() => {
      if (logoInputRef.current) logoInputRef.current.value = "";
    }, 100);
  } catch (error: any) {
    console.error("Logo upload error:", error);
    toast.error(error?.response?.data?.message || "Failed to upload logo");
  }
};

 const handleFaviconFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (file.size > 1 * 1024 * 1024) {
    toast.error("Favicon must be under 1 MB");
    return;
  }
  if (!["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/x-icon"].includes(file.type)) {
    toast.error("Only PNG, JPG, SVG or ICO allowed");
    return;
  }

  try {
    const result = await SettingsApi.uploadFavicon(file);
    
    // ✅ Update local state FIRST with the response
    setSystem(result);
    
    // ✅ Update AuthContext so Layout sees the change
    updateSystemSettingsLocally(result);
    
    toast.success("Favicon uploaded successfully");
    
    // Force re-render for immediate preview update
    setTimeout(() => {
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }, 100);
  } catch (error: any) {
    console.error("Favicon upload error:", error);
    toast.error(error?.response?.data?.message || "Failed to upload favicon");
  }
};

  const handleClearLogo = async () => {
    try {
      await SettingsApi.removeLogo();
      setSystem((prev) => ({ ...prev, logo: null }));
      updateSystemSettingsLocally({ logo: null });
      await refreshSystemSettings();
      toast.info("Logo removed");
    } catch {
      toast.error("Failed to remove logo");
    }
  };

  const handleClearFavicon = async () => {
    try {
      await SettingsApi.removeFavicon();
      setSystem((prev) => ({ ...prev, favicon: null }));
      updateSystemSettingsLocally({ favicon: null });
      await refreshSystemSettings();
      toast.info("Favicon removed");
    } catch {
      toast.error("Failed to remove favicon");
    }
  };

  const handleSaveSystem = async () => {
    try {
      const result = await SettingsApi.updateSystemSettings({
        theme: system.theme,
        primaryColor: system.primaryColor,
        timezone: system.timezone,
        dateFormat: system.dateFormat,
        language: system.language,
      });
      
      updateSystemSettingsLocally(result);
      await refreshSystemSettings();
      
      toast.success("System settings saved");
    } catch {
      toast.error("Failed to save system settings");
    }
  };

  // ═══ TABS ══════════════════════════════════════════════════════════════════
  const tabs = [
    { id: "profile", label: "Profile", icon: User, color: "text-blue-500" },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      color: "text-purple-500",
    },
    { id: "security", label: "Security", icon: Shield, color: "text-red-500" },
    ...(isAdmin
      ? [
          {
            id: "system",
            label: "System",
            icon: SettingsIcon,
            color: "text-green-500",
          },
        ]
      : []),
  ];

  // ═══ LOADING SCREEN ═══════════════════════════════════════════════════════
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828]"></div>
      </div>
    );
  }


  // ═══ RENDER ═══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* ── Header ── */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage your account preferences and system configuration
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  isAdmin
                    ? "bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border border-purple-200"
                    : "bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200"
                }`}
              >
                {isAdmin ? "Administrator" : "User"}
              </span>
              <div className="h-10 w-px bg-gray-200"></div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar Tabs ── */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-1">
              <div className="px-4 py-3 mb-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Settings
                </h3>
              </div>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-[#C62828] to-[#D84343] text-white shadow-lg"
                        : "text-gray-700 hover:bg-gray-50 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`p-2.5 rounded-lg ${
                        activeTab === tab.id
                          ? "bg-white/20"
                          : "bg-gray-100 group-hover:bg-gray-200"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          activeTab === tab.id ? "text-white" : tab.color
                        }`}
                      />
                    </div>
                    <span className="font-medium flex-1 text-left">
                      {tab.label}
                    </span>
                    {activeTab === tab.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Quick Stats Card ── */}
            <div className="mt-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <GlobeIcon className="w-5 h-5" />
                Account Overview
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-300">Role</span>
                  <span className="font-medium capitalize">
                    {userProfile.role}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-700">
                  <span className="text-gray-300">Member Since</span>
                  <span className="font-medium">
                    {new Date(userProfile.created_at).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        year: "numeric",
                      },
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Status</span>
                  <span className="flex items-center gap-1.5 text-green-400 font-medium">
                    <FaCheckCircle className="w-4 h-4" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
               MAIN CONTENT
              ════════════════════════════════════════════════════════════════ */}
          <div className="flex-1">
            {/* ══════ PROFILE TAB ══════ */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Header card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-40 h-40 rounded-full border-8 border-white shadow-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                        {userProfile.avatar ? (
                          <img
                            src={userProfile.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#C62828] to-[#8B0000]">
                            <span className="text-5xl font-bold text-white">
                              {userProfile.full_name?.charAt(0) || "U"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Camera button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute -bottom-2 -right-2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 border-2 border-gray-100"
                      >
                        <FaCamera className="w-5 h-5 text-gray-700" />
                      </button>

                      {/* Hidden file input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(file);
                          // reset so the same file can be re-selected
                          e.target.value = "";
                        }}
                      />
                    </div>

                    {/* Name + badges + Save button */}
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-2">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {userProfile.full_name || "User"}
                          </h2>
                          <p className="text-gray-600 mt-1">
                            {userProfile.email}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            <span className="px-4 py-1.5 bg-gradient-to-r from-[#C62828]/10 to-[#C62828]/5 text-[#C62828] rounded-full text-sm font-medium border border-[#C62828]/20">
                              {userProfile.role || "User"}
                            </span>
                            {userProfile.department && (
                              <span className="px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                                {userProfile.department}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Save + Remove avatar row */}
                        <div className="flex items-center gap-2">
                          {userProfile.avatar && (
                            <button
                              type="button"
                              onClick={handleRemoveAvatar}
                              className="px-4 py-2.5 border border-gray-300 text-gray-600 font-medium rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all flex items-center gap-2 whitespace-nowrap"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                              Remove Photo
                            </button>
                          )}
                          <button
                            onClick={handleProfileUpdate}
                            disabled={saving}
                            className="px-6 py-3 bg-gradient-to-r from-[#C62828] to-[#D84343] text-white font-medium rounded-xl hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                          >
                            {saving ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving…
                              </>
                            ) : (
                              <>
                                <FaSave className="w-4 h-4" />
                                Save Changes
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Two-column form ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-500" />
                      Personal Information
                    </h3>
                    <div className="space-y-5">
                      {/* Full Name – EDITABLE */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={userProfile.full_name}
                          onChange={(e) =>
                            setUserProfile((prev) => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition text-gray-900"
                          placeholder="Enter your full name"
                        />
                      </div>

                      {/* Email – READ-ONLY */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                          <Lock className="w-3.5 h-3.5 inline ml-1.5 text-gray-400" />
                        </label>
                        <input
                          type="email"
                          value={userProfile.email}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Email cannot be changed here. Contact admin.
                        </p>
                      </div>

                      {/* Phone – READ-ONLY */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                          <Lock className="w-3.5 h-3.5 inline ml-1.5 text-gray-400" />
                        </label>
                        <input
                          type="tel"
                          value={userProfile.phone}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Phone cannot be changed here. Contact admin.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Information – ALL READ-ONLY */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      Professional Information
                    </h3>
                    <div className="space-y-5">
                      {/* Department – READ-ONLY */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                          <Lock className="w-3.5 h-3.5 inline ml-1.5 text-gray-400" />
                        </label>
                        <input
                          type="text"
                          value={userProfile.department || ""}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                          placeholder="—"
                        />
                      </div>

                      {/* Designation – READ-ONLY */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Designation
                          <Lock className="w-3.5 h-3.5 inline ml-1.5 text-gray-400" />
                        </label>
                        <input
                          type="text"
                          value={"—"}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-500 bg-gray-50 cursor-not-allowed"
                          placeholder="—"
                        />
                      </div>

                      {/* Info notice */}
                      <div className="pt-4">
                        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <p className="font-medium text-gray-700 mb-1">
                            Profile Visibility
                          </p>
                          <p className="text-sm">
                            Department and designation are managed by your HR
                            administrator.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ NOTIFICATIONS TAB ══════ */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Notification Preferences
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Choose how you want to receive updates and alerts
                      </p>
                    </div>
                    <button
                      onClick={handleSaveNotifications}
                      className="px-6 py-3 bg-gradient-to-r from-[#C62828] to-[#D84343] text-white font-medium rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FaSave className="w-4 h-4" />
                      Save
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Channels */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Channels
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            key: "email",
                            label: "Email",
                            icon: Mail,
                            color: "bg-blue-100 text-blue-600",
                          },
                          {
                            key: "sms",
                            label: "SMS",
                            icon: MessageSquare,
                            color: "bg-green-100 text-green-600",
                          },
                          {
                            key: "whatsapp",
                            label: "WhatsApp",
                            icon: PhoneIcon,
                            color: "bg-green-100 text-green-600",
                          },
                          {
                            key: "push",
                            label: "Push",
                            icon: Bell,
                            color: "bg-purple-100 text-purple-600",
                          },
                        ].map((channel) => {
                          const Icon = channel.icon;
                          const isActive =
                            notifications[
                              channel.key as keyof NotificationPreferences
                            ];
                          return (
                            <div
                              key={channel.key}
                              className={`p-5 rounded-xl border-2 transition-all ${
                                isActive
                                  ? "border-[#C62828] bg-[#C62828]/5"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`p-3 rounded-lg ${channel.color}`}
                                  >
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      {channel.label}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                      Receive {channel.label.toLowerCase()}{" "}
                                      notifications
                                    </p>
                                  </div>
                                </div>
                                {/* Toggle */}
                                <button
                                  onClick={() =>
                                    setNotifications((prev) => ({
                                      ...prev,
                                      [channel.key]:
                                        !prev[
                                          channel.key as keyof NotificationPreferences
                                        ],
                                    }))
                                  }
                                  className={`w-12 h-6 rounded-full transition-all ${
                                    isActive ? "bg-[#C62828]" : "bg-gray-200"
                                  }`}
                                >
                                  <div
                                    className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                      isActive
                                        ? "translate-x-7"
                                        : "translate-x-1"
                                    }`}
                                  ></div>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div className="pt-6 border-t border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Notification Types
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          {
                            label: "Important Updates",
                            desc: "Critical system notifications",
                          },
                          {
                            label: "Daily Digest",
                            desc: "Daily summary of activities",
                          },
                          {
                            label: "Weekly Reports",
                            desc: "Weekly performance reports",
                          },
                          {
                            label: "Project Updates",
                            desc: "Project-related notifications",
                          },
                        ].map((type) => (
                          <div
                            key={type.label}
                            className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {type.label}
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                  {type.desc}
                                </p>
                              </div>
                              <div className="w-5 h-5 rounded border-2 border-gray-300"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SECURITY TAB ══════ */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <ShieldIcon className="w-6 h-6 text-red-500" />
                    Security Settings
                  </h2>

                  <div className="space-y-8">
                    {/* ── Change Password ── */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5" />
                        Change Password
                      </h3>
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-5"
                      >
                        {[
                          {
                            key: "current",
                            label: "Current Password",
                            value: passwordData.current,
                          },
                          {
                            key: "new",
                            label: "New Password",
                            value: passwordData.new,
                          },
                          {
                            key: "confirm",
                            label: "Confirm New Password",
                            value: passwordData.confirm,
                          },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                            </label>
                            <div className="relative">
                              <input
                                type={
                                  showPasswords[
                                    field.key as keyof typeof showPasswords
                                  ]
                                    ? "text"
                                    : "password"
                                }
                                value={field.value}
                                onChange={(e) =>
                                  setPasswordData((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }))
                                }
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition pr-12"
                                placeholder={`Enter ${field.label.toLowerCase()}`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowPasswords((prev) => ({
                                    ...prev,
                                    [field.key]:
                                      !prev[
                                        field.key as keyof typeof showPasswords
                                      ],
                                  }))
                                }
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPasswords[
                                  field.key as keyof typeof showPasswords
                                ] ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Info note */}
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-700">
                            <span className="font-semibold">Note:</span> We
                            first verify your current password before updating.
                            New password must be at least 8 characters.
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={saving}
                          className="w-full py-3.5 bg-gradient-to-r from-[#C62828] to-[#D84343] text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? "Updating Password…" : "Update Password"}
                        </button>
                      </form>
                    </div>

                    {/* ── Security Features (local) ── */}
                    <div className="space-y-5">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Security Features
                      </h3>

                      {/* 2FA */}
                      <div className="p-5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-purple-100 text-purple-600">
                              <Key className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Two-Factor Authentication
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Add an extra layer of security
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSecurity((prev) => ({
                                ...prev,
                                twoFactor: !prev.twoFactor,
                              }))
                            }
                            className={`w-12 h-6 rounded-full transition-all ${
                              security.twoFactor
                                ? "bg-[#C62828]"
                                : "bg-gray-200"
                            }`}
                          >
                            <div
                              className={`w-5 h-5 bg-white rounded-full transform transition-transform ${
                                security.twoFactor
                                  ? "translate-x-7"
                                  : "translate-x-1"
                              }`}
                            ></div>
                          </button>
                        </div>
                      </div>

                      {/* Session Timeout */}
                      <div className="p-5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                Session Timeout
                              </h4>
                              <p className="text-sm text-gray-500 mt-1">
                                Auto-logout after inactivity
                              </p>
                            </div>
                          </div>
                          <span className="text-lg font-bold text-gray-900">
                            {security.sessionTimeout} min
                          </span>
                        </div>
                        <input
                          type="range"
                          min="5"
                          max="240"
                          step="5"
                          value={security.sessionTimeout}
                          onChange={(e) =>
                            setSecurity((prev) => ({
                              ...prev,
                              sessionTimeout: parseInt(e.target.value),
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#C62828]"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>5 min</span>
                          <span>240 min</span>
                        </div>
                      </div>

                      {/* IP Whitelist */}
                      <div className="p-5 rounded-xl border border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 rounded-lg bg-green-100 text-green-600">
                            <Globe className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              IP Whitelist
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                              Restrict access to specific IPs
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            placeholder="e.g. 192.168.1.1"
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828] transition"
                          />
                          <button
                            type="button"
                            onClick={handleAddIp}
                            className="px-5 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition"
                          >
                            Add
                          </button>
                        </div>

                        {security.ipWhitelist.length > 0 ? (
                          <div className="space-y-2">
                            {security.ipWhitelist.map((ip) => (
                              <div
                                key={ip}
                                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg"
                              >
                                <span className="font-mono text-gray-800">
                                  {ip}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIp(ip)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                              <Globe className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500">
                              No IP addresses added yet
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save security (local) */}
                    <div className="pt-6 border-t border-gray-100">
                      <button
                        onClick={handleSaveSecurity}
                        className="px-8 py-3.5 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                      >
                        Save Security Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══════ SYSTEM TAB (Admin) ══════ */}
            {activeTab === "system" && isAdmin && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        System
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Configure system appearance and preferences
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSystem({
                            theme: "light",
                            primaryColor: "#C62828",
                            logo: null,
                            favicon: null,
                            timezone: "Asia/Kolkata",
                            dateFormat: "DD/MM/YYYY",
                            language: "en",
                          });
                          toast.success(
                            "Settings reset locally – click Save to persist",
                          );
                        }}
                        className="px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSaveSystem}
                        className="px-4 py-2 bg-[#C62828] text-white text-sm font-medium rounded-lg hover:bg-[#A62222] transition flex items-center gap-1.5"
                      >
                        <FaSave className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* ── Appearance ── */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        Appearance
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Theme */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Theme
                          </label>
                          <div className="flex gap-2">
                            {[
                              { value: "light", label: "Light", icon: Sun },
                              { value: "dark", label: "Dark", icon: Moon },
                              { value: "auto", label: "Auto", icon: Monitor },
                            ].map((theme) => {
                              const Icon = theme.icon;
                              return (
                                <button
                                  key={theme.value}
                                  onClick={() =>
                                    setSystem({
                                      ...system,
                                      theme: theme.value as any,
                                    })
                                  }
                                  className={`flex-1 p-3 rounded-lg border transition-all flex flex-col items-center ${
                                    system.theme === theme.value
                                      ? "border-[#C62828] bg-[#C62828]/5"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 mb-1.5 ${
                                      system.theme === theme.value
                                        ? "text-[#C62828]"
                                        : "text-gray-500"
                                    }`}
                                  />
                                  <span
                                    className={`text-xs font-medium ${
                                      system.theme === theme.value
                                        ? "text-[#C62828]"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {theme.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Primary Color */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Primary Color
                          </label>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <input
                                type="color"
                                value={system.primaryColor}
                                onChange={(e) =>
                                  setSystem({
                                    ...system,
                                    primaryColor: e.target.value,
                                  })
                                }
                                className="w-12 h-12 cursor-pointer rounded-lg border border-gray-300"
                              />
                              <div
                                className="absolute inset-0 rounded-lg border-2 border-white shadow-sm pointer-events-none"
                                style={{ backgroundColor: system.primaryColor }}
                              ></div>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Current color
                              </p>
                              <p className="text-sm font-mono text-gray-900">
                                {system.primaryColor}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Branding (Logo + Favicon) ── */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        Branding
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Logo */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Logo
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            {/* Preview */}
                            <div className="mb-4">
                              {system.logo ? (
                                <div className="space-y-3">
                                  <p className="text-xs text-gray-600 mb-2">
                                    Preview:
                                  </p>
                                 {/* Logo Preview in GeneralSettings.tsx */}
<div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
  {system.logo ? (
    <img
      src={`${system.logo}?t=${Date.now()}`}
      alt="Logo Preview"
      className="h-16 mx-auto object-contain"
      key={system.logo} // Add key to force re-render
      onError={(e) => {
        // Show fallback if image fails to load
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  ) : (
    <div className="text-center py-4">
      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
      <p className="text-sm text-gray-500">No logo selected</p>
    </div>
  )}
</div>

{/* Favicon Preview */}
{/* <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-center justify-center">
  <img
    src={system.favicon ? `${system.favicon}?t=${Date.now()}` : ""}
    alt="Favicon Preview"
    className="h-12 w-12 mx-auto object-contain"
    key={system.favicon} // Add key to force re-render
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
</div> */}
                                </div>
                              ) : (
                                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                  <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">
                                    No logo selected
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  ref={logoInputRef}
                                  type="file"
                                  className="hidden"
                                  accept="image/png, image/jpeg, image/svg+xml"
                                  onChange={handleLogoFileChange}
                                />
                                <button
                                  type="button"
                                  onClick={() => logoInputRef.current?.click()}
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#C62828] to-[#D84343] text-white text-sm font-medium rounded-lg hover:shadow-md transition flex items-center justify-center gap-2"
                                >
                                  <FaUpload className="w-3.5 h-3.5" />
                                  {system.logo ? "Change Logo" : "Upload Logo"}
                                </button>
                                {system.logo && (
                                  <button
                                    type="button"
                                    onClick={handleClearLogo}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                PNG, JPG or SVG (max 5 MB)
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Favicon */}
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">
                            Favicon
                          </label>
                          <div className="border border-gray-200 rounded-lg p-4">
                            {/* Preview */}
                            <div className="mb-4">
                              {system.favicon ? (
                                <div className="space-y-3">
                                  <p className="text-xs text-gray-600 mb-2">
                                    Preview (16×16):
                                  </p>
                                 <div className="border border-gray-100 rounded-lg p-3 bg-gray-50 flex items-center justify-center">
  <img
    src={system.favicon ? `${system.favicon}?t=${Date.now()}` : ""}
    alt="Favicon Preview"
    className="h-12 w-12 mx-auto object-contain"
    key={system.favicon} // Add key to force re-render
    onError={(e) => {
      (e.target as HTMLImageElement).style.display = 'none';
    }}
  />
</div>
                                </div>
                              ) : (
                                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                                  <MdPhotoCamera className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                  <p className="text-sm text-gray-500">
                                    No favicon selected
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Controls */}
                            <div className="space-y-3">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  ref={faviconInputRef}
                                  type="file"
                                  className="hidden"
                                  accept="image/png, image/jpeg, image/x-icon, image/svg+xml"
                                  onChange={handleFaviconFileChange}
                                />
                                <button
                                  type="button"
                                  onClick={() =>
                                    faviconInputRef.current?.click()
                                  }
                                  className="flex-1 px-3 py-2 bg-gradient-to-r from-[#C62828] to-[#D84343] text-white text-sm font-medium rounded-lg hover:shadow-md transition flex items-center justify-center gap-2"
                                >
                                  <FaUpload className="w-3.5 h-3.5" />
                                  {system.favicon
                                    ? "Change Favicon"
                                    : "Upload Favicon"}
                                </button>
                                {system.favicon && (
                                  <button
                                    type="button"
                                    onClick={handleClearFavicon}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                                  >
                                    Clear
                                  </button>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                PNG, JPG, ICO or SVG (max 1 MB)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── Preferences ── */}
                    <div className="space-y-4">
                      <h3 className="text-base font-semibold text-gray-900">
                        Preferences
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Timezone
                          </label>
                          <select
                            value={system.timezone}
                            onChange={(e) =>
                              setSystem({ ...system, timezone: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C62828] focus:border-[#C62828] transition"
                          >
                            <option value="Asia/Kolkata">IST (India)</option>
                            <option value="America/New_York">
                              EST (New York)
                            </option>
                            <option value="Europe/London">GMT (London)</option>
                            <option value="Asia/Dubai">GST (Dubai)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Date Format
                          </label>
                          <select
                            value={system.dateFormat}
                            onChange={(e) =>
                              setSystem({
                                ...system,
                                dateFormat: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C62828] focus:border-[#C62828] transition"
                          >
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Language
                          </label>
                          <select
                            value={system.language}
                            onChange={(e) =>
                              setSystem({ ...system, language: e.target.value })
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#C62828] focus:border-[#C62828] transition"
                          >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Note */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <p className="text-xs text-blue-700">
                          <span className="font-medium">Note:</span> Theme and
                          branding changes may require a page refresh to take
                          full effect.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
