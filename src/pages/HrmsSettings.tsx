// import { useState } from 'react';
// import { Building2, Shield, Save, User, Bell, Palette, Globe, Moon } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';
// import { useAuth } from '../contexts/AuthContext';

// export default function Settings() {
//     const { user, logout } = useAuth();
//     const [loading, setLoading] = useState(false);
//     const [activeTab, setActiveTab] = useState('profile');
//     const [passwords, setPasswords] = useState({
//         currentPassword: '',
//         newPassword: '',
//         confirmPassword: '',
//     });

//     const [preferences, setPreferences] = useState({
//         language: 'en',
//         theme: 'light',
//         timezone: 'Asia/Kolkata',
//         emailNotifications: true,
//         pushNotifications: true,
//         twoFactorAuth: false,
//     });

//     const handleChangePassword = async () => {
//         if (!passwords.currentPassword) {
//             alert('Please enter your current password');
//             return;
//         }

//         if (passwords.newPassword !== passwords.confirmPassword) {
//             alert('New passwords do not match');
//             return;
//         }

//         if (passwords.newPassword.length < 6) {
//             alert('Password must be at least 6 characters');
//             return;
//         }

//         setLoading(true);
//         try {
//             // Mock password change with timeout
//             await new Promise(resolve => setTimeout(resolve, 1500));

//             console.log('Password change attempted:', {
//                 currentPassword: passwords.currentPassword ? '****' : '',
//                 newPassword: passwords.newPassword ? '****' : '',
//             });

//             alert('Password changed successfully!');
//             setPasswords({
//                 currentPassword: '',
//                 newPassword: '',
//                 confirmPassword: '',
//             });
//         } catch (error: any) {
//             console.error('Password change error:', error);
//             alert('Failed to change password. Please check your current password and try again.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleUpdatePreferences = () => {
//         setLoading(true);
//         // Mock update with timeout
//         setTimeout(() => {
//             console.log('Preferences updated:', preferences);
//             alert('Settings updated successfully!');
//             setLoading(false);
//         }, 800);
//     };

//     const handleLogoutAllSessions = () => {
//         if (window.confirm('Are you sure you want to log out from all other devices? You will be logged out from this device too.')) {
//             alert('Logged out from all sessions. You will be redirected to login page.');
//             logout();
//         }
//     };

//     const tabs = [
//         { id: 'profile', label: 'Profile', icon: User },
//         { id: 'company', label: 'Company', icon: Building2 },
//         { id: 'security', label: 'Security', icon: Shield },
//         { id: 'preferences', label: 'Preferences', icon: Palette },
//     ];

//     const languages = [
//         { value: 'en', label: 'English' },
//         { value: 'hi', label: 'हिंदी (Hindi)' },
//         { value: 'ta', label: 'தமிழ் (Tamil)' },
//         { value: 'te', label: 'తెలుగు (Telugu)' },
//         { value: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
//     ];

//     const themes = [
//         { value: 'light', label: 'Light', icon: <div className="w-4 h-4 bg-yellow-500 rounded-sm" /> },
//         { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
//         { value: 'system', label: 'System', icon: <Globe className="h-4 w-4" /> },
//     ];

//     const timezones = [
//         { value: 'Asia/Kolkata', label: 'IST - India Standard Time (Kolkata)' },
//         { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
//         { value: 'America/New_York', label: 'EST - Eastern Standard Time' },
//         { value: 'Europe/London', label: 'GMT - Greenwich Mean Time' },
//         { value: 'Asia/Dubai', label: 'GST - Gulf Standard Time' },
//     ];

//     return (
//         <div className="space-y-6">
//             <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
//                 {tabs.map((tab) => {
//                     const Icon = tab.icon;
//                     return (
//                         <button
//                             key={tab.id}
//                             onClick={() => setActiveTab(tab.id)}
//                             className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
//                                     ? 'border-blue-600 text-blue-600'
//                                     : 'border-transparent text-slate-600 hover:text-slate-900'
//                                 }`}
//                         >
//                             <Icon className="h-4 w-4" />
//                             {tab.label}
//                         </button>
//                     );
//                 })}
//             </div>

//             {activeTab === 'profile' && (
//                 <Card className="p-6 space-y-6">
//                     <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Employee Code</label>
//                             <Input value={user?.employee_code || 'EMP001'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
//                             <Input value={user?.email || 'admin@example.com'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
//                             <Input value={user?.first_name || 'John'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
//                             <Input value={user?.last_name || 'Doe'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
//                             <Input value={user?.role_name || 'Admin'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
//                             <Input value={user?.status || 'Active'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
//                             <Input value={user?.phone || '+91 98765 43210'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Join Date</label>
//                             <Input value={user?.date_of_joining || '2023-01-15'} disabled />
//                         </div>
//                     </div>

//                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//                         <p className="text-sm text-blue-700">
//                             <span className="font-semibold">Note:</span> Contact your administrator or HR department to update your profile information. Only administrators can modify user profiles for security reasons.
//                         </p>
//                     </div>
//                 </Card>
//             )}

//             {activeTab === 'company' && (
//                 <Card className="p-6 space-y-6">
//                     <h2 className="text-lg font-bold text-slate-900">Company Information</h2>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
//                             <Input value={user?.company_name || 'Your Company Pvt Ltd'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
//                             <Input value={user?.department_name || 'IT'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
//                             <Input value={user?.designation_name || 'Senior Developer'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Reporting Manager</label>
//                             <Input value={user?.reporting_manager || 'Jane Smith'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
//                             <Input value={user?.location || 'Bangalore, India'} disabled />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-slate-700 mb-2">Employee Type</label>
//                             <Input value={user?.employee_type || 'Full-time'} disabled />
//                         </div>
//                     </div>
//                 </Card>
//             )}

//             {activeTab === 'security' && (
//                 <Card className="p-6 space-y-6">
//                     <h2 className="text-lg font-bold text-slate-900">Security Settings</h2>

//                     <div className="space-y-6">
//                         <div>
//                             <h3 className="font-semibold text-slate-900 mb-4">Change Password</h3>
//                             <div className="space-y-4 max-w-md">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
//                                     <Input
//                                         type="password"
//                                         value={passwords.currentPassword}
//                                         onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
//                                         placeholder="Enter current password"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
//                                     <Input
//                                         type="password"
//                                         value={passwords.newPassword}
//                                         onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
//                                         placeholder="Enter new password (min 6 characters)"
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
//                                     <Input
//                                         type="password"
//                                         value={passwords.confirmPassword}
//                                         onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
//                                         placeholder="Confirm new password"
//                                     />
//                                 </div>

//                                 <Button onClick={handleChangePassword} disabled={loading || !passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword}>
//                                     <Save className="h-4 w-4 mr-2" />
//                                     {loading ? 'Changing...' : 'Change Password'}
//                                 </Button>
//                             </div>
//                         </div>

//                         <div className="border-t border-slate-200 pt-6">
//                             <h3 className="font-semibold text-slate-900 mb-4">Two-Factor Authentication</h3>
//                             <div className="flex items-center justify-between max-w-md">
//                                 <div>
//                                     <p className="text-sm text-slate-900">Two-Factor Authentication</p>
//                                     <p className="text-xs text-slate-600 mt-1">Add an extra layer of security to your account</p>
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <span className={`text-sm ${preferences.twoFactorAuth ? 'text-green-600' : 'text-slate-400'}`}>
//                                         {preferences.twoFactorAuth ? 'Enabled' : 'Disabled'}
//                                     </span>
//                                     <button
//                                         onClick={() => setPreferences({ ...preferences, twoFactorAuth: !preferences.twoFactorAuth })}
//                                         className={`w-12 h-6 rounded-full transition-colors ${preferences.twoFactorAuth ? 'bg-green-600' : 'bg-slate-300'
//                                             }`}
//                                     >
//                                         <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${preferences.twoFactorAuth ? 'translate-x-7' : 'translate-x-1'
//                                             }`} />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="border-t border-slate-200 pt-6">
//                             <h3 className="font-semibold text-slate-900 mb-4">Active Sessions</h3>
//                             <div className="space-y-3 max-w-md">
//                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                     <div>
//                                         <p className="text-sm font-medium text-slate-900">Current Session</p>
//                                         <p className="text-xs text-slate-600">This device • Just now</p>
//                                     </div>
//                                     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                     <div>
//                                         <p className="text-sm font-medium text-slate-900">Mobile Device</p>
//                                         <p className="text-xs text-slate-600">Chrome on Android • 2 hours ago</p>
//                                     </div>
//                                     <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
//                                 </div>
//                                 <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
//                                     <div>
//                                         <p className="text-sm font-medium text-slate-900">Office Computer</p>
//                                         <p className="text-xs text-slate-600">Firefox on Windows • Yesterday</p>
//                                     </div>
//                                     <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">Expired</span>
//                                 </div>
//                                 <Button
//                                     variant="secondary"
//                                     onClick={handleLogoutAllSessions}
//                                     className="w-full"
//                                 >
//                                     Log Out From All Other Devices
//                                 </Button>
//                             </div>
//                         </div>
//                     </div>
//                 </Card>
//             )}

//             {activeTab === 'preferences' && (
//                 <Card className="p-6 space-y-6">
//                     <h2 className="text-lg font-bold text-slate-900">Preferences</h2>

//                     <div className="space-y-6 max-w-2xl">
//                         <div>
//                             <h3 className="font-semibold text-slate-900 mb-4">Language & Region</h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
//                                     <Select
//                                         value={preferences.language}
//                                         onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
//                                         options={languages}
//                                     />
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
//                                     <Select
//                                         value={preferences.timezone}
//                                         onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
//                                         options={timezones}
//                                     />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="border-t border-slate-200 pt-6">
//                             <h3 className="font-semibold text-slate-900 mb-4">Appearance</h3>
//                             <div>
//                                 <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
//                                 <div className="flex gap-2">
//                                     {themes.map((theme) => (
//                                         <button
//                                             key={theme.value}
//                                             onClick={() => setPreferences({ ...preferences, theme: theme.value })}
//                                             className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${preferences.theme === theme.value
//                                                     ? 'border-blue-600 bg-blue-50 text-blue-700'
//                                                     : 'border-slate-300 text-slate-700 hover:bg-slate-50'
//                                                 }`}
//                                         >
//                                             {theme.icon}
//                                             <span>{theme.label}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="border-t border-slate-200 pt-6">
//                             <h3 className="font-semibold text-slate-900 mb-4">Notifications</h3>
//                             <div className="space-y-3">
//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <Bell className="h-4 w-4 text-slate-600" />
//                                         <div>
//                                             <p className="text-sm text-slate-900">Email Notifications</p>
//                                             <p className="text-xs text-slate-600">Receive notifications via email</p>
//                                         </div>
//                                     </div>
//                                     <button
//                                         onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
//                                         className={`w-12 h-6 rounded-full transition-colors ${preferences.emailNotifications ? 'bg-blue-600' : 'bg-slate-300'
//                                             }`}
//                                     >
//                                         <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${preferences.emailNotifications ? 'translate-x-7' : 'translate-x-1'
//                                             }`} />
//                                     </button>
//                                 </div>

//                                 <div className="flex items-center justify-between">
//                                     <div className="flex items-center gap-3">
//                                         <Bell className="h-4 w-4 text-slate-600" />
//                                         <div>
//                                             <p className="text-sm text-slate-900">Push Notifications</p>
//                                             <p className="text-xs text-slate-600">Receive push notifications in browser</p>
//                                         </div>
//                                     </div>
//                                     <button
//                                         onClick={() => setPreferences({ ...preferences, pushNotifications: !preferences.pushNotifications })}
//                                         className={`w-12 h-6 rounded-full transition-colors ${preferences.pushNotifications ? 'bg-blue-600' : 'bg-slate-300'
//                                             }`}
//                                     >
//                                         <div className={`bg-white w-4 h-4 rounded-full transform transition-transform ${preferences.pushNotifications ? 'translate-x-7' : 'translate-x-1'
//                                             }`} />
//                                     </button>
//                                 </div>
//                             </div>
//                         </div>

//                         <Button onClick={handleUpdatePreferences} disabled={loading} className="w-full">
//                             <Save className="h-4 w-4 mr-2" />
//                             {loading ? 'Saving...' : 'Save Preferences'}
//                         </Button>
//                     </div>
//                 </Card>
//             )}
//         </div>
//     );
// }

import { useState } from 'react';
import { Building2, Shield, Save, User } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
// import { authAPI } from '../api/auth.api';

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleChangePassword = async () => {
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('New passwords do not match');
            return;
        }

        if (passwords.newPassword.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authAPI.changePassword(passwords.currentPassword, passwords.newPassword);
            alert('Password changed successfully!');
            setPasswords({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error: any) {
            alert(error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'company', label: 'Company', icon: Building2 },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-600 mt-1">Manage your account and system configuration</p>
            </div>

            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${activeTab === tab.id
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'profile' && (
                <Card className="p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Employee Code</label>
                            <Input value={user?.employee_code || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <Input value={user?.email || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                            <Input value={user?.first_name || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                            <Input value={user?.last_name || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                            <Input value={user?.role_name || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                            <Input value={user?.status || ''} disabled />
                        </div>
                    </div>

                    <p className="text-sm text-slate-600">
                        Contact your administrator to update your profile information.
                    </p>
                </Card>
            )}

            {activeTab === 'company' && (
                <Card className="p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Company Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Company Name</label>
                            <Input value={user?.company_name || 'N/A'} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Department</label>
                            <Input value={user?.department_name || 'N/A'} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Designation</label>
                            <Input value={user?.designation_name || 'N/A'} disabled />
                        </div>
                    </div>
                </Card>
            )}

            {activeTab === 'security' && (
                <Card className="p-6 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900">Change Password</h2>

                    <div className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Current Password</label>
                            <Input
                                type="password"
                                value={passwords.currentPassword}
                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">New Password</label>
                            <Input
                                type="password"
                                value={passwords.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Confirm New Password</label>
                            <Input
                                type="password"
                                value={passwords.confirmPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <Button onClick={handleChangePassword} disabled={loading}>
                            <Save className="h-4 w-4 mr-2" />
                            {loading ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
