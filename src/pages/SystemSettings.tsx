import { useState } from "react";
import { Save, Server, Database, Globe, Shield, Mail, Bell, Lock, Users, Wifi, Cpu } from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [systemSettings, setSystemSettings] = useState({
    // General Settings
    systemName: "Nayash Group ERP",
    version: "2.0.1",
    maintenanceMode: false,

    // Database Settings
    dbBackupTime: "02:00",
    dbRetentionDays: 30,
    autoBackup: true,

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    emailFrom: "noreply@nayashgroup.com",

    // Security Settings
    maxLoginAttempts: 5,
    lockoutDuration: 15, // minutes
    sslEnabled: true,
    forceHttps: true,

    // System Performance
    sessionTimeout: 30, // minutes
    cacheEnabled: true,
    cacheDuration: 60, // minutes

    // API Settings
    apiRateLimit: 100,
    apiTimeout: 30, // seconds

    // Logging Settings
    logLevel: "info", // error, warn, info, debug
    logRetention: 90, // days
  });

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "database", label: "Database", icon: Database },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
    { id: "performance", label: "Performance", icon: Cpu },
    { id: "api", label: "API", icon: Server },
    { id: "logging", label: "Logging", icon: Bell },
  ];

  const handleChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // Save system settings logic here
    console.log("Saving system settings:", systemSettings);
    alert("System Settings saved successfully!");
  };

  const testConnection = () => {
    alert("Testing connection...");
    // Add actual connection test logic here
  };

  const backupDatabase = () => {
    alert("Starting database backup...");
    // Add actual backup logic here
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">General System Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={systemSettings.systemName}
                    onChange={(e) => handleChange("systemName", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Version
                  </label>
                  <input
                    type="text"
                    value={systemSettings.version}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">Current system version</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Maintenance Mode</p>
                    <p className="text-sm text-gray-600">Take system offline for maintenance</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.maintenanceMode}
                      onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                  </label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">System Status</p>
                      <p className="text-sm text-green-600">All systems operational</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "database":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Time
                  </label>
                  <input
                    type="time"
                    value={systemSettings.dbBackupTime}
                    onChange={(e) => handleChange("dbBackupTime", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                  <p className="text-sm text-gray-500 mt-1">Daily backup schedule</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Retention
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={systemSettings.dbRetentionDays}
                      onChange={(e) => handleChange("dbRetentionDays", parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                    />
                    <span className="text-gray-600">days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Auto Backup</p>
                    <p className="text-sm text-gray-600">Automatically backup database</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.autoBackup}
                      onChange={(e) => handleChange("autoBackup", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                  </label>
                </div>

                <button
                  onClick={backupDatabase}
                  className="w-full px-4 py-3 bg-blue-100 text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-200 flex items-center justify-center gap-2"
                >
                  <Database className="w-5 h-5" />
                  Backup Database Now
                </button>
              </div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={systemSettings.smtpHost}
                    onChange={(e) => handleChange("smtpHost", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={systemSettings.smtpPort}
                    onChange={(e) => handleChange("smtpPort", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Username
                  </label>
                  <input
                    type="text"
                    value={systemSettings.smtpUser}
                    onChange={(e) => handleChange("smtpUser", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Password
                  </label>
                  <input
                    type="password"
                    value={systemSettings.smtpPass}
                    onChange={(e) => handleChange("smtpPass", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Email Address
                </label>
                <input
                  type="email"
                  value={systemSettings.emailFrom}
                  onChange={(e) => handleChange("emailFrom", e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <button
                onClick={testConnection}
                className="px-4 py-2 bg-green-100 text-green-700 border border-green-300 rounded-lg hover:bg-green-200 flex items-center gap-2"
              >
                <Wifi className="w-5 h-5" />
                Test Connection
              </button>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={systemSettings.maxLoginAttempts}
                    onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lockout Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={systemSettings.lockoutDuration}
                      onChange={(e) => handleChange("lockoutDuration", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                    />
                    <span className="text-gray-600">minutes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">SSL Enabled</p>
                    <p className="text-sm text-gray-600">Use secure connections</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.sslEnabled}
                      onChange={(e) => handleChange("sslEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Force HTTPS</p>
                    <p className="text-sm text-gray-600">Redirect all HTTP to HTTPS</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.forceHttps}
                      onChange={(e) => handleChange("forceHttps", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case "performance":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={systemSettings.sessionTimeout}
                      onChange={(e) => handleChange("sessionTimeout", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                    />
                    <span className="text-gray-600">minutes</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cache Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={systemSettings.cacheDuration}
                      onChange={(e) => handleChange("cacheDuration", parseInt(e.target.value))}
                      className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                    />
                    <span className="text-gray-600">minutes</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Cache Enabled</p>
                    <p className="text-sm text-gray-600">Enable system caching</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.cacheEnabled}
                      onChange={(e) => handleChange("cacheEnabled", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#C62828]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                  </label>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Adjust these settings based on your server capacity and user load.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "api":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Rate Limit
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={systemSettings.apiRateLimit}
                    onChange={(e) => handleChange("apiRateLimit", parseInt(e.target.value))}
                    className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                  <span className="text-gray-600">requests per minute</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Timeout
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={systemSettings.apiTimeout}
                    onChange={(e) => handleChange("apiTimeout", parseInt(e.target.value))}
                    className="w-24 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  />
                  <span className="text-gray-600">seconds</span>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Changing API settings may affect third-party integrations.
                </p>
              </div>
            </div>
          </div>
        );

      case "logging":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logging Settings</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log Level
                  </label>
                  <select
                    value={systemSettings.logLevel}
                    onChange={(e) => handleChange("logLevel", e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                  >
                    <option value="error">Error</option>
                    <option value="warn">Warning</option>
                    <option value="info">Info</option>
                    <option value="debug">Debug</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Log Retention
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={systemSettings.logRetention}
                      onChange={(e) => handleChange("logRetention", parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C62828]"
                    />
                    <span className="text-gray-600">days</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Log Stats</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Log Files</span>
                    <span className="font-medium">48</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Log Size</span>
                    <span className="font-medium">2.4 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Cleanup</span>
                    <span className="font-medium">2 days ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Configure system-wide {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-600">Configure system-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[#C62828] text-white px-4 py-2 rounded-lg hover:bg-[#A62222] flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save System Settings
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 border-b lg:border-b-0 lg:border-r">
            <div className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === tab.id
                        ? "bg-[#C62828] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <div className="p-6">
              {renderContent()}

              <div className="mt-8 pt-6 border-t">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => alert("System restart required!")}
                    className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200"
                  >
                    Restart System
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#C62828] text-white rounded-lg hover:bg-[#A62222] flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save All Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}