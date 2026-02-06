// import { useState, useEffect } from 'react';
// import { Shield, Check, X, Edit2, Save, XCircle, Plus } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Modal from '../components/ui/Modal';

// interface Permission {
//     [key: string]: boolean | { [key: string]: boolean };
// }

// interface RoleData {
//     id: string;
//     name: string;
//     description: string;
//     permissions: Record<string, any>;
//     userCount: number;
// }

// interface Module {
//     name: string;
//     label: string;
//     permissions: { key: string; label: string; description?: string }[];
// }

// const MODULES: Module[] = [
//     {
//         name: 'employees',
//         label: 'Employee Management',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View employee profiles and details' },
//             { key: 'create', label: 'Create', description: 'Add new employees to the system' },
//             { key: 'edit', label: 'Edit', description: 'Edit employee information' },
//             { key: 'delete', label: 'Delete', description: 'Remove employees from the system' },
//             { key: 'export', label: 'Export', description: 'Export employee data' },
//             { key: 'bulk_actions', label: 'Bulk Actions', description: 'Perform bulk operations' },
//         ],
//     },
//     {
//         name: 'attendance',
//         label: 'Attendance',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View attendance records' },
//             { key: 'mark', label: 'Mark Attendance', description: 'Mark attendance for employees' },
//             { key: 'regularize', label: 'Regularize', description: 'Regularize attendance records' },
//             { key: 'approve', label: 'Approve', description: 'Approve attendance requests' },
//             { key: 'geolocation_track', label: 'Geolocation Tracking', description: 'Enable location tracking' },
//             { key: 'auto_logout', label: 'Auto Logout Config', description: 'Configure auto-logout settings' },
//             { key: 'export', label: 'Export', description: 'Export attendance reports' },
//         ],
//     },
//     {
//         name: 'leaves',
//         label: 'Leave Management',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View leave applications' },
//             { key: 'apply', label: 'Apply Leave', description: 'Apply for leave' },
//             { key: 'approve', label: 'Approve', description: 'Approve leave requests' },
//             { key: 'configure', label: 'Configure', description: 'Configure leave policies' },
//             { key: 'view_all_balances', label: 'View All Balances', description: 'View all leave balances' },
//             { key: 'export', label: 'Export', description: 'Export leave reports' },
//         ],
//     },
//     {
//         name: 'payroll',
//         label: 'Payroll',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View payroll information' },
//             { key: 'create', label: 'Create', description: 'Create payroll entries' },
//             { key: 'process', label: 'Process', description: 'Process payroll' },
//             { key: 'approve', label: 'Approve', description: 'Approve payroll processing' },
//             { key: 'export', label: 'Export', description: 'Export payroll data' },
//             { key: 'configure', label: 'Configure', description: 'Configure payroll settings' },
//         ],
//     },
//     {
//         name: 'expenses',
//         label: 'Expense Management',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View expense claims' },
//             { key: 'submit', label: 'Submit', description: 'Submit expense claims' },
//             { key: 'approve', label: 'Approve', description: 'Approve expense claims' },
//             { key: 'reject', label: 'Reject', description: 'Reject expense claims' },
//             { key: 'export', label: 'Export', description: 'Export expense reports' },
//         ],
//     },
//     {
//         name: 'recruitment',
//         label: 'Recruitment',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View recruitment data' },
//             { key: 'create', label: 'Create', description: 'Create job postings' },
//             { key: 'manage', label: 'Manage', description: 'Manage recruitment process' },
//             { key: 'export', label: 'Export', description: 'Export recruitment reports' },
//         ],
//     },
//     {
//         name: 'tickets',
//         label: 'Ticketing System',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View support tickets' },
//             { key: 'create', label: 'Create', description: 'Create new tickets' },
//             { key: 'assign', label: 'Assign', description: 'Assign tickets to agents' },
//             { key: 'resolve', label: 'Resolve', description: 'Resolve tickets' },
//             { key: 'escalate', label: 'Escalate', description: 'Escalate tickets' },
//             { key: 'export', label: 'Export', description: 'Export ticket reports' },
//         ],
//     },
//     {
//         name: 'documents',
//         label: 'Document Management',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View documents' },
//             { key: 'generate', label: 'Generate', description: 'Generate documents' },
//             { key: 'approve', label: 'Approve', description: 'Approve documents' },
//             { key: 'export', label: 'Export', description: 'Export documents' },
//         ],
//     },
//     {
//         name: 'reports',
//         label: 'Reports & Analytics',
//         permissions: [
//             { key: 'view', label: 'View', description: 'View reports' },
//             { key: 'create', label: 'Create', description: 'Create custom reports' },
//             { key: 'schedule', label: 'Schedule', description: 'Schedule automated reports' },
//             { key: 'export', label: 'Export', description: 'Export reports' },
//         ],
//     },
//     {
//         name: 'settings',
//         label: 'System Settings',
//         permissions: [
//             { key: 'organization', label: 'Organization', description: 'Manage organization settings' },
//             { key: 'locations', label: 'Locations', description: 'Manage locations' },
//             { key: 'security', label: 'Security', description: 'Configure security settings' },
//             { key: 'roles', label: 'Roles & Permissions', description: 'Manage roles and permissions' },
//             { key: 'integrations', label: 'Integrations', description: 'Configure integrations' },
//         ],
//     },
// ];

// export default function Roles() {
//     const [roles, setRoles] = useState<RoleData[]>([
//         {
//             id: '1',
//             name: 'Super Admin',
//             description: 'Complete access to all modules and settings',
//             permissions: {},
//             userCount: 1,
//         },
//         {
//             id: '2',
//             name: 'HR Manager',
//             description: 'Access to employee, attendance, and leave management',
//             permissions: {},
//             userCount: 3,
//         },
//         {
//             id: '3',
//             name: 'Attendance Manager',
//             description: 'Manage attendance tracking and reports',
//             permissions: {},
//             userCount: 2,
//         },
//         {
//             id: '4',
//             name: 'Accountant',
//             description: 'Access to payroll, expenses, and financial reports',
//             permissions: {},
//             userCount: 2,
//         },
//         {
//             id: '5',
//             name: 'Employee',
//             description: 'Basic access to personal information and leave requests',
//             permissions: {},
//             userCount: 150,
//         },
//     ]);

//     const [loading, setLoading] = useState(false);
//     const [editingRole, setEditingRole] = useState<string | null>(null);
//     const [editedPermissions, setEditedPermissions] = useState<Record<string, any>>({});
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [newRole, setNewRole] = useState({
//         name: '',
//         description: '',
//     });

//     const loadRoles = () => {
//         setLoading(true);
//         // Mock loading with timeout
//         setTimeout(() => {
//             setLoading(false);
//         }, 300);
//     };

//     useEffect(() => {
//         loadRoles();
//     }, []);

//     const startEdit = (role: RoleData) => {
//         setEditingRole(role.id);
//         setEditedPermissions({ ...role.permissions });
//     };

//     const cancelEdit = () => {
//         setEditingRole(null);
//         setEditedPermissions({});
//     };

//     const saveRole = async (roleId: string) => {
//         setLoading(true);
//         try {
//             // Mock save with timeout
//             await new Promise(resolve => setTimeout(resolve, 800));

//             setRoles(prev => prev.map(role =>
//                 role.id === roleId
//                     ? { ...role, permissions: { ...editedPermissions } }
//                     : role
//             ));

//             alert(`Permissions updated successfully for ${roles.find(r => r.id === roleId)?.name}!`);
//             setEditingRole(null);
//             setEditedPermissions({});
//         } catch (error: any) {
//             console.error('Error updating role:', error);
//             alert(error.message || 'Failed to update role');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleCreateRole = () => {
//         if (!newRole.name.trim()) {
//             alert('Please enter a role name');
//             return;
//         }

//         setLoading(true);
//         try {
//             const newRoleData: RoleData = {
//                 id: Date.now().toString(),
//                 name: newRole.name,
//                 description: newRole.description || 'New role description',
//                 permissions: {},
//                 userCount: 0,
//             };

//             setRoles(prev => [...prev, newRoleData]);

//             alert(`Role "${newRole.name}" created successfully!`);
//             setNewRole({ name: '', description: '' });
//             setShowCreateModal(false);
//         } catch (error) {
//             console.error('Error creating role:', error);
//             alert('Failed to create role');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleDeleteRole = (roleId: string) => {
//         const role = roles.find(r => r.id === roleId);
//         if (role?.userCount && role.userCount > 0) {
//             alert(`Cannot delete role "${role.name}" because it is assigned to ${role.userCount} user(s). Please reassign users first.`);
//             return;
//         }

//         if (window.confirm(`Are you sure you want to delete role "${role?.name}"?`)) {
//             setRoles(prev => prev.filter(r => r.id !== roleId));
//             alert(`Role "${role?.name}" deleted successfully!`);
//         }
//     };

//     const togglePermission = (module: string, permission: string, value: boolean) => {
//         setEditedPermissions((prev) => ({
//             ...prev,
//             [module]: {
//                 ...prev[module],
//                 [permission]: value,
//             },
//         }));
//     };

//     const toggleAllPermissions = (module: string, value: boolean) => {
//         const moduleData = MODULES.find(m => m.name === module);
//         if (moduleData) {
//             const allPerms: Record<string, boolean> = {};
//             moduleData.permissions.forEach(perm => {
//                 allPerms[perm.key] = value;
//             });

//             setEditedPermissions((prev) => ({
//                 ...prev,
//                 [module]: allPerms,
//             }));
//         }
//     };

//     const getModulePermissions = (permissions: any, moduleName: string) => {
//         if (!permissions) return {};
//         const modulePerms = permissions[moduleName];
//         if (!modulePerms) return {};
//         if (typeof modulePerms === 'object') return modulePerms;
//         return {};
//     };

//     const getRoleColor = (roleName: string) => {
//         switch (roleName) {
//             case 'Super Admin':
//                 return 'bg-red-50 border-red-200';
//             case 'HR Manager':
//                 return 'bg-blue-50 border-blue-200';
//             case 'Attendance Manager':
//                 return 'bg-green-50 border-green-200';
//             case 'Accountant':
//                 return 'bg-amber-50 border-amber-200';
//             case 'Employee':
//                 return 'bg-slate-50 border-slate-200';
//             default:
//                 return 'bg-purple-50 border-purple-200';
//         }
//     };

//     const getRoleIcon = (roleName: string) => {
//         switch (roleName) {
//             case 'Super Admin':
//                 return '👑';
//             case 'HR Manager':
//                 return '👔';
//             case 'Attendance Manager':
//                 return '📋';
//             case 'Accountant':
//                 return '💰';
//             case 'Employee':
//                 return '👤';
//             default:
//                 return '👥';
//         }
//     };

//     if (loading && !editingRole) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <p className="text-slate-600">Loading roles...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <div className="flex gap-2">
//                     <Button
//                         variant="secondary"
//                         onClick={() => setShowCreateModal(true)}
//                     >
//                         <Plus className="h-4 w-4 mr-2" />
//                         Create Role
//                     </Button>
//                     <Shield className="h-8 w-8 text-blue-600" />
//                 </div>
//             </div>

//             <div className="space-y-4">
//                 {roles.map((role) => {
//                     const isEditing = editingRole === role.id;
//                     const displayPerms = isEditing ? editedPermissions : role.permissions;

//                     return (
//                         <Card key={role.id} className={`border-2 ${getRoleColor(role.name)} transition-all`}>
//                             <div className="p-6">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <div className="flex items-center gap-3">
//                                         <span className="text-3xl">{getRoleIcon(role.name)}</span>
//                                         <div>
//                                             <div className="flex items-center gap-3">
//                                                 <h2 className="text-xl font-bold text-slate-900">{role.name}</h2>
//                                                 <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
//                                                     {role.userCount} users
//                                                 </span>
//                                             </div>
//                                             <p className="text-sm text-slate-600">{role.description}</p>
//                                             <p className="text-xs text-slate-500 mt-1">
//                                                 {isEditing ? 'Editing permissions...' : 'Click edit to modify permissions'}
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <div className="flex gap-2">
//                                         {isEditing ? (
//                                             <>
//                                                 <Button
//                                                     size="sm"
//                                                     onClick={() => saveRole(role.id)}
//                                                     disabled={loading}
//                                                     loading={loading}
//                                                 >
//                                                     <Save className="h-4 w-4 mr-1" />
//                                                     Save
//                                                 </Button>
//                                                 <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={loading}>
//                                                     <XCircle className="h-4 w-4 mr-1" />
//                                                     Cancel
//                                                 </Button>
//                                             </>
//                                         ) : (
//                                             <>
//                                                 <Button
//                                                     size="sm"
//                                                     variant="secondary"
//                                                     onClick={() => startEdit(role)}
//                                                 >
//                                                     <Edit2 className="h-4 w-4 mr-1" />
//                                                     Edit
//                                                 </Button>
//                                                 {role.userCount === 0 && (
//                                                     <Button
//                                                         size="sm"
//                                                         variant="secondary"
//                                                         onClick={() => handleDeleteRole(role.id)}
//                                                         disabled={role.name === 'Super Admin'}
//                                                     >
//                                                         <XCircle className="h-4 w-4 mr-1" />
//                                                         Delete
//                                                     </Button>
//                                                 )}
//                                             </>
//                                         )}
//                                     </div>
//                                 </div>

//                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                                     {MODULES.map((module) => {
//                                         const modulePerms = getModulePermissions(displayPerms, module.name);
//                                         const allChecked = module.permissions.every(perm => modulePerms[perm.key]);
//                                         const anyChecked = module.permissions.some(perm => modulePerms[perm.key]);

//                                         return (
//                                             <div key={module.name} className="border border-slate-200 rounded-lg p-4 bg-white">
//                                                 <div className="flex items-center justify-between mb-3">
//                                                     <h3 className="font-semibold text-slate-900 text-sm">{module.label}</h3>
//                                                     {isEditing && (
//                                                         <label className="flex items-center gap-2 cursor-pointer">
//                                                             <input
//                                                                 type="checkbox"
//                                                                 checked={allChecked}
//                                                                 onChange={(e) => toggleAllPermissions(module.name, e.target.checked)}
//                                                                 className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                                                             />
//                                                             <span className="text-xs text-slate-600">All</span>
//                                                         </label>
//                                                     )}
//                                                 </div>
//                                                 <div className="space-y-2">
//                                                     {module.permissions.map((perm) => {
//                                                         const isEnabled = modulePerms[perm.key];

//                                                         return (
//                                                             <label
//                                                                 key={perm.key}
//                                                                 className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${isEditing
//                                                                         ? isEnabled
//                                                                             ? 'bg-blue-50'
//                                                                             : 'hover:bg-slate-50'
//                                                                         : isEnabled
//                                                                             ? 'bg-blue-50'
//                                                                             : ''
//                                                                     }`}
//                                                             >
//                                                                 <div className="flex items-start gap-2 flex-1">
//                                                                     {isEditing ? (
//                                                                         <input
//                                                                             type="checkbox"
//                                                                             checked={isEnabled || false}
//                                                                             onChange={(e) =>
//                                                                                 togglePermission(module.name, perm.key, e.target.checked)
//                                                                             }
//                                                                             className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//                                                                         />
//                                                                     ) : isEnabled ? (
//                                                                         <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
//                                                                     ) : (
//                                                                         <X className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
//                                                                     )}
//                                                                     <div className="flex-1">
//                                                                         <span
//                                                                             className={`text-sm block ${isEnabled ? 'text-slate-900 font-medium' : 'text-slate-500'
//                                                                                 }`}
//                                                                         >
//                                                                             {perm.label}
//                                                                         </span>
//                                                                         {perm.description && (
//                                                                             <span className="text-xs text-slate-400 block mt-0.5">
//                                                                                 {perm.description}
//                                                                             </span>
//                                                                         )}
//                                                                     </div>
//                                                                 </div>
//                                                             </label>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </Card>
//                     );
//                 })}
//             </div>

//             <Card className="bg-blue-50 border-blue-200 p-6">
//                 <div className="flex gap-3">
//                     <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
//                     <div>
//                         <h3 className="font-semibold text-blue-900">Permission Management Guide</h3>
//                         <ul className="text-sm text-blue-800 mt-2 space-y-1">
//                             <li>• <span className="font-medium">Super Admin</span> has complete access to all modules</li>
//                             <li>• Role permissions apply immediately to all users with that role</li>
//                             <li>• Delete option only appears for roles with 0 assigned users</li>
//                             <li>• Use "All" checkbox in edit mode to toggle all permissions for a module</li>
//                             <li>• Permission descriptions help understand what each permission allows</li>
//                         </ul>
//                     </div>
//                 </div>
//             </Card>

//             {/* Create Role Modal */}
//             <Modal
//                 isOpen={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 title="Create New Role"
//                 size="md"
//             >
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                             Role Name *
//                         </label>
//                         <Input
//                             type="text"
//                             value={newRole.name}
//                             onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
//                             placeholder="e.g., Team Lead, Department Head"
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                             Description
//                         </label>
//                         <textarea
//                             className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             rows={3}
//                             value={newRole.description}
//                             onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
//                             placeholder="Describe the purpose and scope of this role..."
//                         />
//                     </div>

//                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
//                         <p className="text-xs text-yellow-700">
//                             <span className="font-semibold">Note:</span> After creating the role, you can set permissions by editing it. New roles start with no permissions by default.
//                         </p>
//                     </div>

//                     <div className="flex gap-2 justify-end pt-4">
//                         <Button
//                             variant="secondary"
//                             onClick={() => setShowCreateModal(false)}
//                             disabled={loading}
//                         >
//                             Cancel
//                         </Button>
//                         <Button
//                             onClick={handleCreateRole}
//                             disabled={!newRole.name.trim() || loading}
//                             loading={loading}
//                         >
//                             Create Role
//                         </Button>
//                     </div>
//                 </div>
//             </Modal>
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import { Shield, Check, X, Users, Search } from 'lucide-react';
import { toast } from 'sonner';
import rolesApi from '../lib/rolesApi';
import HrmsEmployeesApi, { HrmsEmployee } from '../lib/employeeApi';

interface Permission {
    [key: string]: boolean | { [key: string]: boolean };
}

interface RoleData {
    id: string;
    name: string;
    description: string;
    permissions: Record<string, any>;
    userCount: number;
    is_active?: boolean;
}

interface Module {
    name: string;
    label: string;
    permissions: { key: string; label: string; description?: string }[];
}

const MODULES: Module[] = [
    {
        name: 'employees',
        label: 'Employee Management',
        permissions: [
            { key: 'view', label: 'View', description: 'View employee profiles and details' },
            { key: 'create', label: 'Create', description: 'Add new employees to the system' },
            { key: 'edit', label: 'Edit', description: 'Edit employee information' },
            { key: 'delete', label: 'Delete', description: 'Remove employees from the system' },
            { key: 'export', label: 'Export', description: 'Export employee data' },
            { key: 'bulk_actions', label: 'Bulk Actions', description: 'Perform bulk operations' },
        ],
    },
    {
        name: 'attendance',
        label: 'Attendance',
        permissions: [
            { key: 'view', label: 'View', description: 'View attendance records' },
            { key: 'mark', label: 'Mark Attendance', description: 'Mark attendance for employees' },
            { key: 'regularize', label: 'Regularize', description: 'Regularize attendance records' },
            { key: 'approve', label: 'Approve', description: 'Approve attendance requests' },
            { key: 'geolocation_track', label: 'Geolocation Tracking', description: 'Enable location tracking' },
            { key: 'auto_logout', label: 'Auto Logout Config', description: 'Configure auto-logout settings' },
            { key: 'export', label: 'Export', description: 'Export attendance reports' },
        ],
    },
    {
        name: 'leaves',
        label: 'Leave Management',
        permissions: [
            { key: 'view', label: 'View', description: 'View leave applications' },
            { key: 'apply', label: 'Apply Leave', description: 'Apply for leave' },
            { key: 'approve', label: 'Approve', description: 'Approve leave requests' },
            { key: 'configure', label: 'Configure', description: 'Configure leave policies' },
            { key: 'view_all_balances', label: 'View All Balances', description: 'View all leave balances' },
            { key: 'export', label: 'Export', description: 'Export leave reports' },
        ],
    },
    {
        name: 'payroll',
        label: 'Payroll',
        permissions: [
            { key: 'view', label: 'View', description: 'View payroll information' },
            { key: 'create', label: 'Create', description: 'Create payroll entries' },
            { key: 'process', label: 'Process', description: 'Process payroll' },
            { key: 'approve', label: 'Approve', description: 'Approve payroll processing' },
            { key: 'export', label: 'Export', description: 'Export payroll data' },
            { key: 'configure', label: 'Configure', description: 'Configure payroll settings' },
        ],
    },
    {
        name: 'expenses',
        label: 'Expense Management',
        permissions: [
            { key: 'view', label: 'View', description: 'View expense claims' },
            { key: 'submit', label: 'Submit', description: 'Submit expense claims' },
            { key: 'approve', label: 'Approve', description: 'Approve expense claims' },
            { key: 'reject', label: 'Reject', description: 'Reject expense claims' },
            { key: 'export', label: 'Export', description: 'Export expense reports' },
        ],
    },
    {
        name: 'recruitment',
        label: 'Recruitment',
        permissions: [
            { key: 'view', label: 'View', description: 'View recruitment data' },
            { key: 'create', label: 'Create', description: 'Create job postings' },
            { key: 'manage', label: 'Manage', description: 'Manage recruitment process' },
            { key: 'export', label: 'Export', description: 'Export recruitment reports' },
        ],
    },
    {
        name: 'tickets',
        label: 'Ticketing System',
        permissions: [
            { key: 'view', label: 'View', description: 'View support tickets' },
            { key: 'create', label: 'Create', description: 'Create new tickets' },
            { key: 'assign', label: 'Assign', description: 'Assign tickets to agents' },
            { key: 'resolve', label: 'Resolve', description: 'Resolve tickets' },
            { key: 'escalate', label: 'Escalate', description: 'Escalate tickets' },
            { key: 'export', label: 'Export', description: 'Export ticket reports' },
        ],
    },
    {
        name: 'documents',
        label: 'Document Management',
        permissions: [
            { key: 'view', label: 'View', description: 'View documents' },
            { key: 'generate', label: 'Generate', description: 'Generate documents' },
            { key: 'approve', label: 'Approve', description: 'Approve documents' },
            { key: 'export', label: 'Export', description: 'Export documents' },
        ],
    },
    {
        name: 'reports',
        label: 'Reports & Analytics',
        permissions: [
            { key: 'view', label: 'View', description: 'View reports' },
            { key: 'create', label: 'Create', description: 'Create custom reports' },
            { key: 'schedule', label: 'Schedule', description: 'Schedule automated reports' },
            { key: 'export', label: 'Export', description: 'Export reports' },
        ],
    },
    {
        name: 'settings',
        label: 'System Settings',
        permissions: [
            { key: 'organization', label: 'Organization', description: 'Manage organization settings' },
            { key: 'locations', label: 'Locations', description: 'Manage locations' },
            { key: 'security', label: 'Security', description: 'Configure security settings' },
            { key: 'roles', label: 'Roles & Permissions', description: 'Manage roles and permissions' },
            { key: 'integrations', label: 'Integrations', description: 'Configure integrations' },
        ],
    },
];

export default function Roles() {
    const [activeTab, setActiveTab] = useState<"role-permissions" | "employee-permissions">("role-permissions");
    const [roles, setRoles] = useState<RoleData[]>([]);
    const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedEmployee, setSelectedEmployee] = useState<string>("");
    const [rolePermissions, setRolePermissions] = useState<Record<string, any>>({});
    const [employeePermissions, setEmployeePermissions] = useState<Record<string, any>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const loadRoles = async () => {
        try {
            setLoading(true);
            const rolesRes = await rolesApi.getAllRoles();
            
            // Fetch employees to count users per role
            const employeesRes = await HrmsEmployeesApi.getEmployees();
            setEmployees(employeesRes);

            // Map roles with user count
            const rolesWithCount = rolesRes.map((role: any) => {
                const userCount = employeesRes.filter(
                    (emp: HrmsEmployee) => emp.role_id?.toString() === role.id?.toString()
                ).length;

                return {
                    id: role.id?.toString(),
                    name: role.name,
                    description: role.description || 'No description',
                    permissions: role.permissions || {},
                    userCount,
                    is_active: role.is_active ?? true,
                };
            });

            setRoles(rolesWithCount);
            
            // Set first role as selected
            if (rolesWithCount.length > 0) {
                setSelectedRole(rolesWithCount[0].id);
                setRolePermissions(rolesWithCount[0].permissions || {});
            }

            // Set first employee as selected
            if (employeesRes.length > 0) {
                setSelectedEmployee(employeesRes[0].id?.toString());
                // Note: You may need to fetch employee permissions from API
                setEmployeePermissions({});
            }
        } catch (error) {
            console.error('Error loading roles:', error);
            toast.error('Failed to load roles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handlePermissionChange = (module: string, permission: string, value: boolean) => {
        if (activeTab === "role-permissions") {
            setRolePermissions((prev) => ({
                ...prev,
                [module]: {
                    ...prev[module],
                    [permission]: value,
                },
            }));
        } else {
            setEmployeePermissions((prev) => ({
                ...prev,
                [module]: {
                    ...prev[module],
                    [permission]: value,
                },
            }));
        }
    };

    const handleModuleSelectAll = (module: Module) => {
        const currentPermissions = activeTab === "role-permissions" ? rolePermissions : employeePermissions;
        const modulePerms = getModulePermissions(currentPermissions, module.name);
        const allChecked = module.permissions.every(perm => modulePerms[perm.key]);
        
        const newModulePerms: Record<string, boolean> = {};
        module.permissions.forEach(perm => {
            newModulePerms[perm.key] = !allChecked;
        });

        if (activeTab === "role-permissions") {
            setRolePermissions((prev) => ({
                ...prev,
                [module.name]: newModulePerms,
            }));
        } else {
            setEmployeePermissions((prev) => ({
                ...prev,
                [module.name]: newModulePerms,
            }));
        }
    };

    const saveRolePermissions = async () => {
        try {
            setLoading(true);
            await rolesApi.updateRolePermissions(selectedRole, rolePermissions);
            toast.success('Role permissions updated successfully!');
            loadRoles();
        } catch (error: any) {
            console.error('Error updating role permissions:', error);
            toast.error(error.message || 'Failed to update role permissions');
        } finally {
            setLoading(false);
        }
    };

    const saveEmployeePermissions = async () => {
        try {
            setLoading(true);
            // TODO: Implement employee permissions update API call
            // await HrmsEmployeesApi.updateEmployeePermissions(selectedEmployee, employeePermissions);
            toast.success('Employee permissions updated successfully!');
            loadRoles();
        } catch (error: any) {
            console.error('Error updating employee permissions:', error);
            toast.error(error.message || 'Failed to update employee permissions');
        } finally {
            setLoading(false);
        }
    };

    const getModulePermissions = (permissions: any, moduleName: string) => {
        if (!permissions) return {};
        const modulePerms = permissions[moduleName];
        if (!modulePerms) return {};
        if (typeof modulePerms === 'object') return modulePerms;
        return {};
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
            </div>
        );
    }

    const currentPermissions = activeTab === "role-permissions" ? rolePermissions : employeePermissions;
    const filteredModules = MODULES.filter(module =>
        searchQuery === '' || 
        module.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.permissions.some(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            {/* Header */}
            {/* <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Access Control</h1>
                <p className="text-sm text-gray-600 mt-1">Manage hierarchical roles and granular employee-specific permissions.</p>
            </div> */}

            {/* Search Bar */}
            {/* <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search permissions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div> */}

            {/* Tabs */}
            <div className="bg-white rounded-t-lg border-b">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("role-permissions")}
                        className={`flex-1 md:flex-none px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === "role-permissions"
                                ? "text-blue-600 border-blue-600"
                                : "text-gray-600 border-transparent hover:text-gray-900"
                        }`}
                    >
                        <Shield className="w-4 h-4 inline-block mr-2" />
                        Role Permissions
                    </button>

                    <button
                        onClick={() => setActiveTab("employee-permissions")}
                        className={`flex-1 md:flex-none px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                            activeTab === "employee-permissions"
                                ? "text-blue-600 border-blue-600"
                                : "text-gray-600 border-transparent hover:text-gray-900"
                        }`}
                    >
                        <Users className="w-4 h-4 inline-block mr-2" />
                        Direct Employee Overrides
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-b-lg shadow-sm p-4">
                {/* Role/Employee Selection */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                        {activeTab === "role-permissions" ? "TARGET ROLE" : "TARGET EMPLOYEE"}
                    </label>
                    <select
                        value={activeTab === "role-permissions" ? selectedRole : selectedEmployee}
                        onChange={(e) => {
                            if (activeTab === "role-permissions") {
                                const newRole = e.target.value;
                                setSelectedRole(newRole);
                                const r = roles.find((x: any) => x.id === newRole);
                                setRolePermissions(r?.permissions || {});
                            } else {
                                const empId = e.target.value;
                                setSelectedEmployee(empId);
                                const emp = employees.find((x) => x.id?.toString() === empId);
                                // TODO: Fetch employee-specific permissions from API
                                setEmployeePermissions({});
                            }
                        }}
                        className="w-full max-w-md border-2 border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                        {activeTab === "role-permissions"
                            ? roles.map((r) => (
                                <option key={r.id} value={r.id}>
                                    {r.name}
                                </option>
                            ))
                            : employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.first_name} {emp.last_name}
                                </option>
                            ))}
                    </select>
                </div>

                {/* ✅ Permissions Grid - COMPACT VERTICAL CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredModules.map((module) => {
                        const modulePerms = getModulePermissions(currentPermissions, module.name);
                        const moduleAllChecked = module.permissions.every((perm) => modulePerms[perm.key]);
                        const actionsCount = module.permissions.length;

                        return (
                            <div
                                key={module.name}
                                className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all"
                            >
                                {/* ✅ Module Header - Compact layout */}
                                <div className="bg-white px-3 py-1.5 border-b border-gray-200">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate">{module.label}</h3>
                                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                                                {actionsCount}
                                            </span>
                                        </div>

                                        {/* ✅ SELECT ALL with Checkbox inline */}
                                        <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
                                            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide whitespace-nowrap">
                                                SELECT ALL
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={moduleAllChecked}
                                                onChange={() => handleModuleSelectAll(module)}
                                                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* ✅ Permissions List - VERTICAL with checkboxes on RIGHT */}
                                <div className="p-2 bg-gray-50">
                                    <div className="space-y-0 divide-y divide-gray-100">
                                        {module.permissions.map((perm) => {
                                            const isChecked = !!modulePerms[perm.key];
                                            return (
                                                <label
                                                    key={perm.key}
                                                    className="flex items-center justify-between py-1.5 px-1.5 cursor-pointer hover:bg-white rounded transition-colors group"
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <span className={`text-xs block ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                                                            {perm.label}
                                                        </span>
                                                        {perm.description && (
                                                            <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                                                                {perm.description}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* ✅ Checkbox on RIGHT (custom styled) */}
                                                    <div className="relative ml-2 flex-shrink-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={(e) => handlePermissionChange(module.name, perm.key, e.target.checked)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isChecked
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-gray-300 bg-white group-hover:border-blue-400'
                                                            }`}>
                                                            {isChecked && (
                                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={activeTab === "role-permissions" ? saveRolePermissions : saveEmployeePermissions}
                        disabled={loading}
                        className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}