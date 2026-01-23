import { useState } from "react";
import { 
  Save, Server, Database, Globe, Shield, Mail, Bell, Lock, Users, Wifi, Cpu, 
  MessageSquare, MessageCircle, RefreshCw, Cloud, Zap, Activity, Settings, 
  AlertTriangle, Smartphone, ShieldCheck
} from "lucide-react";

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [systemSettings, setSystemSettings] = useState({
    // General Settings
    systemName: "Nayash Group ERP",
    version: "2.0.1",
    maintenanceMode: false,
    timezone: "Asia/Kolkata",
    language: "en",

    // Database Settings
    dbBackupTime: "02:00",
    dbRetentionDays: 30,
    autoBackup: true,
    backupCompression: true,

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "",
    smtpPass: "",
    emailFrom: "noreply@nayashgroup.com",
    emailNotifications: true,

    // SMS Settings
    smsProvider: "twilio",
    smsApiKey: "",
    smsApiSecret: "",
    smsFromNumber: "",
    smsEnabled: true,
    smsBalance: 150,

    // WhatsApp Settings
    whatsappProvider: "twilio",
    whatsappApiKey: "",
    whatsappApiSecret: "",
    whatsappFromNumber: "+1234567890",
    whatsappEnabled: true,
    whatsappWebhookUrl: "",

    // Security Settings
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sslEnabled: true,
    forceHttps: true,
    twoFactorAuth: false,
    passwordPolicy: "medium",

    // System Performance
    sessionTimeout: 30,
    cacheEnabled: true,
    cacheDuration: 60,
    maxUploadSize: 10,
    compressionEnabled: true,

    // API Settings
    apiRateLimit: 100,
    apiTimeout: 30,
    apiKeyExpiry: 90,
    corsEnabled: true,

    // Logging Settings
    logLevel: "info",
    logRetention: 90,
    auditLogEnabled: true,
  });

  const tabs = [
    { id: "general", label: "General", icon: Settings, color: "text-blue-500", bgColor: "bg-blue-50" },
    { id: "database", label: "Database", icon: Database, color: "text-purple-500", bgColor: "bg-purple-50" },
    { id: "email", label: "Email", icon: Mail, color: "text-red-500", bgColor: "bg-red-50" },
    { id: "sms", label: "SMS", icon: MessageSquare, color: "text-green-500", bgColor: "bg-green-50" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-500", bgColor: "bg-emerald-50" },
    { id: "security", label: "Security", icon: ShieldCheck, color: "text-orange-500", bgColor: "bg-orange-50" },
    { id: "performance", label: "Performance", icon: Zap, color: "text-yellow-500", bgColor: "bg-yellow-50" },
    { id: "api", label: "API", icon: Server, color: "text-indigo-500", bgColor: "bg-indigo-50" },
    { id: "logging", label: "Logging", icon: Activity, color: "text-gray-500", bgColor: "bg-gray-50" },
  ];

  const handleChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    console.log("Saving system settings:", systemSettings);
    alert("✅ System Settings saved successfully!");
  };

  const testConnection = (type: string) => {
    alert(`Testing ${type} connection...`);
  };

  const backupDatabase = () => {
    alert("Starting database backup...");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">General System Settings</h3>
                <p className="text-gray-600">Configure basic system preferences</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                <Cloud className="w-4 h-4" />
                <span>Online</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    System Name
                  </label>
                  <input
                    type="text"
                    value={systemSettings.systemName}
                    onChange={(e) => handleChange("systemName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Enter system name"
                  />
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    System Version
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={systemSettings.version}
                      disabled
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">v{systemSettings.version}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Current system version (read-only)</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Timezone
                  </label>
                  <select
                    value={systemSettings.timezone}
                    onChange={(e) => handleChange("timezone", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                <div className={`p-5 rounded-xl border ${systemSettings.maintenanceMode ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'} shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">Maintenance Mode</p>
                      <p className="text-sm text-gray-600 mt-1">Take system offline for maintenance</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => handleChange("maintenanceMode", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  {systemSettings.maintenanceMode && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-lg">
                      <p className="text-sm text-red-800 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        System is in maintenance mode. Users will see a maintenance page.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Server className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Uptime</p>
                        <p className="text-sm text-green-600 font-semibold">99.9%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Active Users</p>
                        <p className="text-sm text-gray-700 font-semibold">48</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-5 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold">System Health</p>
                      <p className="text-sm opacity-90 mt-1">All systems operational</p>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Activity className="w-6 h-6" />
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Database Settings</h3>
                <p className="text-gray-600">Configure database backup and maintenance</p>
              </div>
              <button
                onClick={backupDatabase}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition"
              >
                <Database className="w-5 h-5" />
                Backup Now
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Backup Schedule
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Auto Backup</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.autoBackup}
                          onChange={(e) => handleChange("autoBackup", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-700">Time</span>
                      <input
                        type="time"
                        value={systemSettings.dbBackupTime}
                        onChange={(e) => handleChange("dbBackupTime", e.target.value)}
                        className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Backup Retention
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="365"
                      value={systemSettings.dbRetentionDays}
                      onChange={(e) => handleChange("dbRetentionDays", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-gray-900 min-w-[60px]">{systemSettings.dbRetentionDays} days</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Backups older than this will be automatically deleted</p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                  <h4 className="font-bold text-gray-900 mb-3">Backup Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Last Backup</span>
                      <span className="font-medium">2 hours ago</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Backup Size</span>
                      <span className="font-medium">1.2 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Available Storage</span>
                      <span className="font-medium text-green-600">48 GB free</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">Compression</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.backupCompression}
                        onChange={(e) => handleChange("backupCompression", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Enable compression to reduce backup size by up to 70%</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Email Configuration</h3>
                <p className="text-gray-600">Configure SMTP settings for email notifications</p>
              </div>
              <button
                onClick={() => testConnection("email")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 transition"
              >
                <Wifi className="w-5 h-5" />
                Test Connection
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={systemSettings.smtpHost}
                    onChange={(e) => handleChange("smtpHost", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">SMTP Credentials</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={systemSettings.smtpUser}
                      onChange={(e) => handleChange("smtpUser", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Username/Email"
                    />
                    <input
                      type="password"
                      value={systemSettings.smtpPass}
                      onChange={(e) => handleChange("smtpPass", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">SMTP Port</label>
                    <input
                      type="number"
                      value={systemSettings.smtpPort}
                      onChange={(e) => handleChange("smtpPort", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">From Email</label>
                    <input
                      type="email"
                      value={systemSettings.emailFrom}
                      onChange={(e) => handleChange("emailFrom", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-5 rounded-xl border border-red-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">Email Notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.emailNotifications}
                        onChange={(e) => handleChange("emailNotifications", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Enable email notifications for users</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "sms":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">SMS Configuration</h3>
                <p className="text-gray-600">Configure SMS gateway for notifications</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {systemSettings.smsBalance} credits
                </span>
                <button
                  onClick={() => testConnection("SMS")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition"
                >
                  <Smartphone className="w-5 h-5" />
                  Test SMS
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">SMS Provider</label>
                  <select
                    value={systemSettings.smsProvider}
                    onChange={(e) => handleChange("smsProvider", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="plivo">Plivo</option>
                    <option value="nexmo">Vonage (Nexmo)</option>
                    <option value="custom">Custom Gateway</option>
                  </select>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">API Credentials</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={systemSettings.smsApiKey}
                      onChange={(e) => handleChange("smsApiKey", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="API Key"
                    />
                    <input
                      type="password"
                      value={systemSettings.smsApiSecret}
                      onChange={(e) => handleChange("smsApiSecret", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="API Secret"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Sender Number</label>
                  <input
                    type="text"
                    value={systemSettings.smsFromNumber}
                    onChange={(e) => handleChange("smsFromNumber", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="+1234567890"
                  />
                  <p className="text-sm text-gray-500 mt-2">Must include country code</p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-xl border border-green-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-900">SMS Service</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.smsEnabled}
                        onChange={(e) => handleChange("smsEnabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600">Enable SMS notifications for users</p>
                  <div className="mt-3 p-3 bg-white/50 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">Remaining Credits: <span className="text-green-600">{systemSettings.smsBalance}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "whatsapp":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">WhatsApp Configuration</h3>
                <p className="text-gray-600">Configure WhatsApp Business API settings</p>
              </div>
              <button
                onClick={() => testConnection("WhatsApp")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2 transition"
              >
                <MessageCircle className="w-5 h-5" />
                Test Connection
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Provider</label>
                  <select
                    value={systemSettings.whatsappProvider}
                    onChange={(e) => handleChange("whatsappProvider", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="twilio">Twilio</option>
                    <option value="messagebird">MessageBird</option>
                    <option value="360dialog">360Dialog</option>
                    <option value="gupshup">Gupshup</option>
                  </select>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">API Credentials</label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={systemSettings.whatsappApiKey}
                      onChange={(e) => handleChange("whatsappApiKey", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Account SID / API Key"
                    />
                    <input
                      type="password"
                      value={systemSettings.whatsappApiSecret}
                      onChange={(e) => handleChange("whatsappApiSecret", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                      placeholder="Auth Token / API Secret"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Sender Number</label>
                  <input
                    type="text"
                    value={systemSettings.whatsappFromNumber}
                    onChange={(e) => handleChange("whatsappFromNumber", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="WhatsApp Business Number"
                  />
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    value={systemSettings.whatsappWebhookUrl}
                    onChange={(e) => handleChange("whatsappWebhookUrl", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="https://your-domain.com/webhook"
                  />
                  <p className="text-sm text-gray-500 mt-2">For receiving message status updates</p>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">WhatsApp Service</p>
                      <p className="text-sm text-gray-600">Enable WhatsApp messaging</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.whatsappEnabled}
                        onChange={(e) => handleChange("whatsappEnabled", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "security":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Security Settings</h3>
                <p className="text-gray-600">Configure system security and authentication</p>
              </div>
              <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                <ShieldCheck className="w-4 h-4 inline mr-1" />
                High Security
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Max Login Attempts
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={systemSettings.maxLoginAttempts}
                      onChange={(e) => handleChange("maxLoginAttempts", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-gray-900 min-w-[40px]">{systemSettings.maxLoginAttempts}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Lockout Duration
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={systemSettings.lockoutDuration}
                      onChange={(e) => handleChange("lockoutDuration", parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-gray-900 min-w-[60px]">{systemSettings.lockoutDuration} min</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Password Policy
                  </label>
                  <select
                    value={systemSettings.passwordPolicy}
                    onChange={(e) => handleChange("passwordPolicy", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  >
                    <option value="low">Low (6+ characters)</option>
                    <option value="medium">Medium (8+ chars, mixed case)</option>
                    <option value="high">High (12+ chars, mixed case + numbers + symbols)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-5 rounded-xl border border-orange-200">
                  <h4 className="font-bold text-gray-900 mb-4">Security Features</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Two-Factor Authentication</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.twoFactorAuth}
                          onChange={(e) => handleChange("twoFactorAuth", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">SSL/TLS</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.sslEnabled}
                          onChange={(e) => handleChange("sslEnabled", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Force HTTPS</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={systemSettings.forceHttps}
                          onChange={(e) => handleChange("forceHttps", e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-3">Recent Security Events</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Failed Login Attempts (24h)</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IP Blocks</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Security Scan</span>
                      <span className="font-medium text-green-600">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      // Add other cases for performance, api, logging similarly...

      default:
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Server className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {tabs.find(t => t.id === activeTab)?.label} Settings
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Configure system-wide {tabs.find(t => t.id === activeTab)?.label.toLowerCase()} settings and preferences.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">System Settings</h1>
            <p className="text-gray-600 mt-2">Configure and manage all system-wide settings</p>
          </div>
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Save className="w-5 h-5" />
            Save All Settings
          </button>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 overflow-hidden">
          {/* Horizontal Tabs */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-4">
            <div className="flex overflow-x-auto py-2 md:py-4">
              <div className="flex space-x-1 md:space-x-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 md:px-5 md:py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${isActive
                        ? `${tab.bgColor} ${tab.color} shadow-lg scale-[1.02]`
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? tab.color : 'text-gray-500'}`} />
                      <span className="font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-5 md:p-8">
            {renderContent()}

            {/* Action Buttons */}
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => alert("Reset to defaults?")}
                  className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Reset to Defaults
                </button>
                <button
                  onClick={() => alert("System restart required!")}
                  className="px-5 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Restart System
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-3 bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save & Apply Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">System Status</p>
                <p className="font-bold text-green-600">All Systems Operational</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Backup</p>
                <p className="font-bold text-gray-900">2 hours ago</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Security Level</p>
                <p className="font-bold text-gray-900">High</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}