import { useState, useEffect } from 'react';
import { Shield, Check, X, Edit2, Save, XCircle, Plus } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

interface Permission {
    [key: string]: boolean | { [key: string]: boolean };
}

interface RoleData {
    id: string;
    name: string;
    description: string;
    permissions: Record<string, any>;
    userCount: number;
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
    const [roles, setRoles] = useState<RoleData[]>([
        {
            id: '1',
            name: 'Super Admin',
            description: 'Complete access to all modules and settings',
            permissions: {},
            userCount: 1,
        },
        {
            id: '2',
            name: 'HR Manager',
            description: 'Access to employee, attendance, and leave management',
            permissions: {},
            userCount: 3,
        },
        {
            id: '3',
            name: 'Attendance Manager',
            description: 'Manage attendance tracking and reports',
            permissions: {},
            userCount: 2,
        },
        {
            id: '4',
            name: 'Accountant',
            description: 'Access to payroll, expenses, and financial reports',
            permissions: {},
            userCount: 2,
        },
        {
            id: '5',
            name: 'Employee',
            description: 'Basic access to personal information and leave requests',
            permissions: {},
            userCount: 150,
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [editingRole, setEditingRole] = useState<string | null>(null);
    const [editedPermissions, setEditedPermissions] = useState<Record<string, any>>({});
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newRole, setNewRole] = useState({
        name: '',
        description: '',
    });

    const loadRoles = () => {
        setLoading(true);
        // Mock loading with timeout
        setTimeout(() => {
            setLoading(false);
        }, 300);
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const startEdit = (role: RoleData) => {
        setEditingRole(role.id);
        setEditedPermissions({ ...role.permissions });
    };

    const cancelEdit = () => {
        setEditingRole(null);
        setEditedPermissions({});
    };

    const saveRole = async (roleId: string) => {
        setLoading(true);
        try {
            // Mock save with timeout
            await new Promise(resolve => setTimeout(resolve, 800));

            setRoles(prev => prev.map(role =>
                role.id === roleId
                    ? { ...role, permissions: { ...editedPermissions } }
                    : role
            ));

            alert(`Permissions updated successfully for ${roles.find(r => r.id === roleId)?.name}!`);
            setEditingRole(null);
            setEditedPermissions({});
        } catch (error: any) {
            console.error('Error updating role:', error);
            alert(error.message || 'Failed to update role');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = () => {
        if (!newRole.name.trim()) {
            alert('Please enter a role name');
            return;
        }

        setLoading(true);
        try {
            const newRoleData: RoleData = {
                id: Date.now().toString(),
                name: newRole.name,
                description: newRole.description || 'New role description',
                permissions: {},
                userCount: 0,
            };

            setRoles(prev => [...prev, newRoleData]);

            alert(`Role "${newRole.name}" created successfully!`);
            setNewRole({ name: '', description: '' });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating role:', error);
            alert('Failed to create role');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRole = (roleId: string) => {
        const role = roles.find(r => r.id === roleId);
        if (role?.userCount && role.userCount > 0) {
            alert(`Cannot delete role "${role.name}" because it is assigned to ${role.userCount} user(s). Please reassign users first.`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete role "${role?.name}"?`)) {
            setRoles(prev => prev.filter(r => r.id !== roleId));
            alert(`Role "${role?.name}" deleted successfully!`);
        }
    };

    const togglePermission = (module: string, permission: string, value: boolean) => {
        setEditedPermissions((prev) => ({
            ...prev,
            [module]: {
                ...prev[module],
                [permission]: value,
            },
        }));
    };

    const toggleAllPermissions = (module: string, value: boolean) => {
        const moduleData = MODULES.find(m => m.name === module);
        if (moduleData) {
            const allPerms: Record<string, boolean> = {};
            moduleData.permissions.forEach(perm => {
                allPerms[perm.key] = value;
            });

            setEditedPermissions((prev) => ({
                ...prev,
                [module]: allPerms,
            }));
        }
    };

    const getModulePermissions = (permissions: any, moduleName: string) => {
        if (!permissions) return {};
        const modulePerms = permissions[moduleName];
        if (!modulePerms) return {};
        if (typeof modulePerms === 'object') return modulePerms;
        return {};
    };

    const getRoleColor = (roleName: string) => {
        switch (roleName) {
            case 'Super Admin':
                return 'bg-red-50 border-red-200';
            case 'HR Manager':
                return 'bg-blue-50 border-blue-200';
            case 'Attendance Manager':
                return 'bg-green-50 border-green-200';
            case 'Accountant':
                return 'bg-amber-50 border-amber-200';
            case 'Employee':
                return 'bg-slate-50 border-slate-200';
            default:
                return 'bg-purple-50 border-purple-200';
        }
    };

    const getRoleIcon = (roleName: string) => {
        switch (roleName) {
            case 'Super Admin':
                return '👑';
            case 'HR Manager':
                return '👔';
            case 'Attendance Manager':
                return '📋';
            case 'Accountant':
                return '💰';
            case 'Employee':
                return '👤';
            default:
                return '👥';
        }
    };

    if (loading && !editingRole) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-600">Loading roles...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </Button>
                    <Shield className="h-8 w-8 text-blue-600" />
                </div>
            </div>

            <div className="space-y-4">
                {roles.map((role) => {
                    const isEditing = editingRole === role.id;
                    const displayPerms = isEditing ? editedPermissions : role.permissions;

                    return (
                        <Card key={role.id} className={`border-2 ${getRoleColor(role.name)} transition-all`}>
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{getRoleIcon(role.name)}</span>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-xl font-bold text-slate-900">{role.name}</h2>
                                                <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                    {role.userCount} users
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{role.description}</p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {isEditing ? 'Editing permissions...' : 'Click edit to modify permissions'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => saveRole(role.id)}
                                                    disabled={loading}
                                                    loading={loading}
                                                >
                                                    <Save className="h-4 w-4 mr-1" />
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="secondary" onClick={cancelEdit} disabled={loading}>
                                                    <XCircle className="h-4 w-4 mr-1" />
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => startEdit(role)}
                                                >
                                                    <Edit2 className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                {role.userCount === 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleDeleteRole(role.id)}
                                                        disabled={role.name === 'Super Admin'}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {MODULES.map((module) => {
                                        const modulePerms = getModulePermissions(displayPerms, module.name);
                                        const allChecked = module.permissions.every(perm => modulePerms[perm.key]);
                                        const anyChecked = module.permissions.some(perm => modulePerms[perm.key]);

                                        return (
                                            <div key={module.name} className="border border-slate-200 rounded-lg p-4 bg-white">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="font-semibold text-slate-900 text-sm">{module.label}</h3>
                                                    {isEditing && (
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={allChecked}
                                                                onChange={(e) => toggleAllPermissions(module.name, e.target.checked)}
                                                                className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-xs text-slate-600">All</span>
                                                        </label>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    {module.permissions.map((perm) => {
                                                        const isEnabled = modulePerms[perm.key];

                                                        return (
                                                            <label
                                                                key={perm.key}
                                                                className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors ${isEditing
                                                                        ? isEnabled
                                                                            ? 'bg-blue-50'
                                                                            : 'hover:bg-slate-50'
                                                                        : isEnabled
                                                                            ? 'bg-blue-50'
                                                                            : ''
                                                                    }`}
                                                            >
                                                                <div className="flex items-start gap-2 flex-1">
                                                                    {isEditing ? (
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={isEnabled || false}
                                                                            onChange={(e) =>
                                                                                togglePermission(module.name, perm.key, e.target.checked)
                                                                            }
                                                                            className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                                        />
                                                                    ) : isEnabled ? (
                                                                        <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                                                                    ) : (
                                                                        <X className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                                                                    )}
                                                                    <div className="flex-1">
                                                                        <span
                                                                            className={`text-sm block ${isEnabled ? 'text-slate-900 font-medium' : 'text-slate-500'
                                                                                }`}
                                                                        >
                                                                            {perm.label}
                                                                        </span>
                                                                        {perm.description && (
                                                                            <span className="text-xs text-slate-400 block mt-0.5">
                                                                                {perm.description}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <Card className="bg-blue-50 border-blue-200 p-6">
                <div className="flex gap-3">
                    <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900">Permission Management Guide</h3>
                        <ul className="text-sm text-blue-800 mt-2 space-y-1">
                            <li>• <span className="font-medium">Super Admin</span> has complete access to all modules</li>
                            <li>• Role permissions apply immediately to all users with that role</li>
                            <li>• Delete option only appears for roles with 0 assigned users</li>
                            <li>• Use "All" checkbox in edit mode to toggle all permissions for a module</li>
                            <li>• Permission descriptions help understand what each permission allows</li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Create Role Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Role"
                size="md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Role Name *
                        </label>
                        <Input
                            type="text"
                            value={newRole.name}
                            onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                            placeholder="e.g., Team Lead, Department Head"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            value={newRole.description}
                            onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                            placeholder="Describe the purpose and scope of this role..."
                        />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-xs text-yellow-700">
                            <span className="font-semibold">Note:</span> After creating the role, you can set permissions by editing it. New roles start with no permissions by default.
                        </p>
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            variant="secondary"
                            onClick={() => setShowCreateModal(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateRole}
                            disabled={!newRole.name.trim() || loading}
                            loading={loading}
                        >
                            Create Role
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}