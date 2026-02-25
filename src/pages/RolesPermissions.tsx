import { useState, useEffect } from "react";
import { Shield, Users, Search } from "lucide-react";
import { toast } from "sonner";
import rolesApi from "../lib/rolesApi";
import { UsersApi } from "../lib/Api";

type Role = {
    id: string;
    name: string;
    description?: string;
    permissions?: Record<string, boolean>;
};

type User = {
    id: string;
    full_name: string;
    email: string;
    role?: string;
    permissions?: Record<string, boolean>;
};

export default function Permissions() {
    const [activeTab, setActiveTab] = useState<
        "role-permissions" | "user-permissions"
    >("role-permissions");
    const [roles, setRoles] = useState<Role[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [rolePermissions, setRolePermissions] = useState<
        Record<string, boolean>
    >({});
    const [userPermissions, setUserPermissions] = useState<
        Record<string, boolean>
    >({});
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectAllEnabled, setSelectAllEnabled] = useState(false);

    // COMPLETE PERMISSIONS LIST
    const permissionsList = [
        // HRMS Dashboard
        { action: "hrms_dashboard", label: "HRMS Dashboard", module: "HRMS Dashboard" },

        // HRMS Employees        
        { action: "view_employee", label: "View Employees", module: "HRMS Employees" },
        { action: "create_employee", label: "Create Employees", module: "HRMS Employees" },
        { action: "edit_employee", label: "Edit Employees", module: "HRMS Employees" },
        { action: "delete_employee", label: "Delete Employees", module: "HRMS Employees" },
        { action: "export_employee", label: "Export Employees", module: "HRMS Employees" },
        { action: "bulk_actions_employee", label: "Bulk Actions", module: "HRMS Employees" },

        // HRMS Attendance
        { action: "view_attendance", label: "View Attendance", module: "Attendance" },
        { action: "mark_attendance", label: "Mark Attendance", module: "Attendance" },
        { action: "export_attendance", label: "Export Attendance", module: "Attendance" },

        // HRMS leaves        
        { action: "view_leaves", label: "View Leaves", module: "Leaves" },
        { action: "apply_leaves", label: "Apply Leaves", module: "Leaves" },
        { action: "approve_leaves", label: "Approve Leaves", module: "Leaves" },
        { action: "configure_leaves", label: "Configure Leaves", module: "Leaves" },
        { action: "view_all_balances_leaves", label: "View All Balances", module: "Leaves" },
        { action: "export_leaves", label: "Export Leaves", module: "Leaves" },
        

        // HRMS Payroll
        { action: "view_payroll", label: "View Payroll", module: "Payroll" },
        { action: "create_payroll", label: "Create Payroll", module: "Payroll" },
        { action: "process_payroll", label: "Process Payroll", module: "Payroll" },
        { action: "approve_payroll", label: "Approve Payroll", module: "Payroll" },
        { action: "export_payroll", label: "Export Payroll", module: "Payroll" },
        { action: "configure_ctc", label: "Configure CTC", module: "Payroll" },
        { action: "advance", label: "Advance", module: "Payroll" },
        { action: "incentives", label: "Incentives", module: "Payroll" },
        { action: "reimbursements", label: "Reimbursements", module: "Payroll" },
        { action: "tds", label: "TDS", module: "Payroll" },
        { action: "hrms_payment_history", label: "Payment History", module: "Payroll" },


        // Expenses        
        { action: "view_expenses", label: "View Expenses", module: "Expenses" },
        { action: "submit_expenses", label: "Submit Expenses", module: "Expenses" },
        { action: "approve_expenses", label: "Approve Expenses", module: "Expenses" },
        { action: "reject_expenses", label: "Reject Expenses", module: "Expenses" },
        { action: "export_expenses", label: "Export Expenses", module: "Expenses" },
            
       

        // Recruitment
        { action: "view_recruitment", label: "View Recruitment", module: "Recruitment" },
        { action: "create_recruitment", label: "Create Recruitment", module: "Recruitment" },   
        { action: "manage_recruitment", label: "Manage Recruitment", module: "Recruitment" },
        { action: "export_recruitment", label: "Export Recruitment", module: "Recruitment" },
        
        

        // tickets
        { action: "view_tickets", label: "View Tickets", module: "Tickets" },
        { action: "create_tickets", label: "Create Tickets", module: "Tickets" },
        { action: "assign_tickets", label: "Assign Tickets", module: "Tickets" },
        { action: "resolve_tickets", label: "Resolve Tickets", module: "Tickets" },
        { action: "escalate_tickets", label: "Escalate Tickets", module: "Tickets" },   
        { action: "export_tickets", label: "Export Tickets", module: "Tickets" },

        

        // documents
        { action: "view_documents", label: "View Documents", module: "Documents" },
        { action: "generate_documents", label: "Generate Documents", module: "Documents" },
        { action: "approve_documents", label: "Approve Documents", module: "Documents" },
        { action: "export_documents", label: "Export Documents", module: "Documents" }, 
        
        // HRMS Reports
        { action: "view_hrms_reports", label: "View HRMS Reports", module: "HRMS Reports" },
        { action: "create_hrms_reports", label: "Create HRMS Reports", module: "HRMS Reports" },
        { action: "schedule_hrms_reports", label: "Schedule HRMS Reports", module: "HRMS Reports" },
        { action: "export_hrms_reports", label: "Export HRMS Reports", module: "HRMS Reports" },

        

        // HRMS Settings
        { action: "organization_hrms_settings", label: "Organization Settings", module: "HRMS Settings" },
        { action: "locations_hrms_settings", label: "Locations Settings", module: "HRMS Settings" },
        { action: "security_hrms_settings", label: "Security Settings", module: "HRMS Settings" },
        { action: "roles_hrms_settings", label: "Roles & Permissions Settings", module: "HRMS Settings" },
        { action: "integrations_hrms_settings", label: "Integrations Settings", module: "HRMS Settings" },
        

        // permissions

        { action: "hrms_permissions", label: "View HRMS Permissions", module: "Permissions" },

        
    ];

    const loadUsers = async () => {
        try {
            const usersRes: any = await UsersApi.list();
            setSelectedUser(Array.isArray(usersRes) ? usersRes[0]?.id : "");
            setUserPermissions(
                Array.isArray(usersRes) ? usersRes[0]?.permissions || {} : {},
            );
            setUsers(Array.isArray(usersRes) ? usersRes : []);
        } catch (error) {
            toast.error("Failed to load users");
        }
    };

    const loadRoles = async () => {
        try {
            const rolesRes: any = await rolesApi.getAllRoles();
            setSelectedRole(Array.isArray(rolesRes) ? rolesRes[0]?.id : "");
            setRolePermissions(
                Array.isArray(rolesRes) ? rolesRes[0]?.permissions || {} : {},
            );
            setRoles(Array.isArray(rolesRes) ? rolesRes : []);
        } catch (error) {
            toast.error("Failed to load roles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
        loadUsers();
    }, []);

    const groupedPermissions = permissionsList.reduce((acc: any, p) => {
        if (!acc[p.module]) acc[p.module] = [];
        acc[p.module].push(p);
        return acc;
    }, {});

    const handlePermissionChange = (action: string, value: boolean) => {
        if (activeTab === "role-permissions") {
            setRolePermissions((prev) => ({ ...prev, [action]: value }));
        } else {
            setUserPermissions((prev) => ({ ...prev, [action]: value }));
        }
    };

    const handleModuleSelectAll = (perms: any[]) => {
        const currentPermissions =
            activeTab === "role-permissions" ? rolePermissions : userPermissions;
        const moduleAllChecked = perms.every(
            (perm) => currentPermissions[perm.action],
        );

        const newPermissions = { ...currentPermissions };
        perms.forEach((perm) => {
            newPermissions[perm.action] = !moduleAllChecked;
        });

        if (activeTab === "role-permissions") {
            setRolePermissions(newPermissions);
        } else {
            setUserPermissions(newPermissions);
        }
    };

    const handleGlobalSelectAll = () => {
        const newSelectAllState = !selectAllEnabled;
        setSelectAllEnabled(newSelectAllState);

        const newPermissions: Record<string, boolean> = {};

        permissionsList.forEach((perm) => {
            newPermissions[perm.action] = newSelectAllState;
        });

        if (activeTab === "role-permissions") {
            setRolePermissions(newPermissions);
        } else {
            setUserPermissions(newPermissions);
        }
    };

    const updateRolePermissions = async () => {
        try {
            const rolePermissionRes = await rolesApi.updateRolePermissions(
                selectedRole,
                rolePermissions,
            );
            if (rolePermissionRes.success) {
                loadRoles();
                toast.success("Role permissions updated successfully");
            }
        } catch (error) {
            toast.error("Failed to update role permissions");
        }
    };

    const saveUserPermissions = async () => {
        try {
            const userPermissionsRes: any = await UsersApi.updateUserPermissions(
                selectedUser,
                userPermissions,
            );
            if (userPermissionsRes.success) {
                loadUsers();
                toast.success("User permissions updated successfully");
            }
        } catch (e) {
            toast.error("Failed to update user permissions");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
            </div>
        );
    }

    const currentPermissions =
        activeTab === "role-permissions" ? rolePermissions : userPermissions;

    return (
        // ✅ REMOVED ALL PADDING - Changed from "p-4 md:p-6 lg:p-8" to NO padding classes
        <div className="min-h-screen px-0 mx-0 bg-gray-50">
            {/* Tabs - NO padding */}
            <div className="bg-white border-b">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("role-permissions")}
                        className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "role-permissions"
                                ? "text-blue-600 border-blue-600"
                                : "text-gray-600 border-transparent hover:text-gray-900"
                            }`}
                    >
                        <Shield className="w-4 h-4 inline-block mr-2" />
                        Role Permissions
                    </button>

                    <button
                        onClick={() => {
                            setActiveTab("user-permissions");
                            if (users.length > 0) {
                                setSelectedUser(users[0].id);
                                setUserPermissions(users[0]?.permissions || {});
                            }
                        }}
                        className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === "user-permissions"
                                ? "text-blue-600 border-blue-600"
                                : "text-gray-600 border-transparent hover:text-gray-900"
                            }`}
                    >
                        <Users className="w-4 h-4 inline-block mr-2" />
                        Direct User Overrides
                    </button>
                </div>
            </div>

            {/* Content - Reduced padding from p-6 to p-4 */}
            <div className="bg-white shadow-sm p-4">
                {/* Role/User Selection with Global Select All Button - Reduced margin */}
                <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                            TARGET ROLE
                        </label>
                        <select
                            value={
                                activeTab === "role-permissions" ? selectedRole : selectedUser
                            }
                            onChange={(e) => {
                                if (activeTab === "role-permissions") {
                                    const newRole = e.target.value;
                                    setSelectedRole(newRole);
                                    const r = roles.find((x: any) => x.id === Number(newRole));
                                    setRolePermissions(r?.permissions || {});
                                } else {
                                    const uid = e.target.value;
                                    setSelectedUser(uid);
                                    const u = users.find((x) => x.id === uid);
                                    setUserPermissions(u?.permissions || {});
                                }
                            }}
                            className="w-full md:w-auto max-w-md border-2 border-blue-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            {activeTab === "role-permissions"
                                ? roles.map((r) => (
                                    <option key={r.id} value={r.id}>
                                        {r.name}
                                    </option>
                                ))
                                : users.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Global Select All Button */}
                    <button
                        onClick={handleGlobalSelectAll}
                        className={`px-6 py-3 text-sm font-semibold rounded-lg transition-colors shadow-sm ${selectAllEnabled ? "bg-[#C62828] text-white hover:bg-red-700" : "bg-[#C62828] text-white hover:bg-red-700"}`}
                    >
                        {selectAllEnabled ? "Deselect All" : "Select All"}
                    </button>
                </div>

                {/* ✅ Permissions Grid - Reduced gap from gap-6 to gap-4 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(groupedPermissions).map(
                        ([module, perms]: [any, any]) => {
                            const moduleAllChecked = perms.every(
                                (perm: any) => currentPermissions[perm.action],
                            );
                            const actionsCount = perms.length;

                            return (
                                <div
                                    key={module}
                                    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all"
                                >
                                    {/* Module Header */}
                                    <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {module}
                                            </h3>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {actionsCount}{" "}
                                                {actionsCount === 1 ? "Action" : "Actions"}
                                            </span>
                                        </div>

                                        {/* SELECT ALL with Checkbox */}
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <span className="text-xs font-semibold text-blue-600 uppercase">
                                                SELECT ALL
                                            </span>
                                            <input
                                                type="checkbox"
                                                checked={moduleAllChecked}
                                                onChange={() => handleModuleSelectAll(perms)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                            />
                                        </label>
                                    </div>

                                    {/* Permissions List */}
                                    <div className="p-4 bg-gray-50">
                                        <div className="space-y-0 divide-y divide-gray-100">
                                            {perms.map((perm: any) => {
                                                const isChecked = !!currentPermissions[perm.action];
                                                return (
                                                    <label
                                                        key={perm.action}
                                                        className="flex items-center justify-between py-3 cursor-pointer hover:bg-white px-2 rounded transition-colors group"
                                                    >
                                                        <span className="text-sm text-gray-700">
                                                            {perm.label}
                                                        </span>

                                                        {/* Checkbox on RIGHT */}
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={(e) =>
                                                                    handlePermissionChange(
                                                                        perm.action,
                                                                        e.target.checked,
                                                                    )
                                                                }
                                                                className="sr-only peer"
                                                            />
                                                            <div
                                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isChecked
                                                                        ? "bg-blue-600 border-blue-600"
                                                                        : "border-gray-300 bg-white group-hover:border-blue-400"
                                                                    }`}
                                                            >
                                                                {isChecked && (
                                                                    <svg
                                                                        className="w-3.5 h-3.5 text-white"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            strokeLinecap="round"
                                                                            strokeLinejoin="round"
                                                                            strokeWidth={3}
                                                                            d="M5 13l4 4L19 7"
                                                                        />
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
                        },
                    )}
                </div>

                {/* Save Button - Reduced margin */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                        onClick={
                            activeTab === "role-permissions"
                                ? updateRolePermissions
                                : saveUserPermissions
                        }
                        className="px-8 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}


// import { useState, useEffect } from 'react';
// import { Shield, Users } from 'lucide-react';
// import { toast } from 'sonner';
// import rolesApi from '../lib/rolesApi';
// import HrmsEmployeesApi, { HrmsEmployee } from '../lib/employeeApi';



// interface RoleData {
//     id: string;
//     name: string;
//     description: string;
//     permissions: Record<string, any>;
//     userCount: number;
//     is_active?: boolean;
// }

// interface Module {
//     name: string;
//     label: string;
//     permissions: { key: string; label: string; description?: string }[];
// }

// const MODULES: Module[] = [{
//     name: 'hrmsdashboard',
//     label: 'HRMS Dashboard',
//     permissions: [
//         { key: 'hrms_dashboard', label: 'Dashboard', description: 'Manage HRMS dashboard' }
//     ],
// },
//     {
//         name: 'employees',
//         label: 'Employee Management',
//         permissions: [
//             { key: 'view_employee', label: 'View', description: 'View employee profiles and details' },
//             { key: 'create_employee', label: 'Create', description: 'Add new employees to the system' },
//             { key: 'edit_employee', label: 'Edit', description: 'Edit employee information' },
//             { key: 'delete_employee', label: 'Delete', description: 'Remove employees from the system' },
//             { key: 'export_employee', label: 'Export', description: 'Export employee data' },
//             { key: 'bulk_actions_employee', label: 'Bulk Actions', description: 'Perform bulk operations' },
//         ],
//     },
//     {
//         name: 'attendance',
//         label: 'Attendance',
//         permissions: [
//             { key: 'view_attendance', label: 'View', description: 'View attendance records' },
//             { key: 'mark_attendance', label: 'Mark Attendance', description: 'Mark attendance for employees' },
//             { key: 'regularize_attendance', label: 'Regularize', description: 'Regularize attendance records' },
//             { key: 'approve_attendance', label: 'Approve', description: 'Approve attendance requests' },
//             { key: 'geolocation_track_attendance', label: 'Geolocation Tracking', description: 'Enable location tracking' },
//             { key: 'auto_logout_attendance', label: 'Auto Logout Config', description: 'Configure auto-logout settings' },
//             { key: 'export', label: 'Export', description: 'Export attendance reports' },
//         ],
//     },
//     {
//         name: 'leaves',
//         label: 'Leave Management',
//         permissions: [
//             { key: 'view_leaves', label: 'View', description: 'View leave applications' },
//             { key: 'apply_leaves', label: 'Apply Leave', description: 'Apply for leave' },
//             { key: 'approve_leaves', label: 'Approve', description: 'Approve leave requests' },
//             { key: 'configure_leaves', label: 'Configure', description: 'Configure leave policies' },
//             { key: 'view_all_balances_leaves', label: 'View All Balances', description: 'View all leave balances' },
//             { key: 'export_leaves', label: 'Export', description: 'Export leave reports' },
//         ],
//     },
//     {
//         name: 'payroll',
//         label: 'Payroll',
//         permissions: [
//             { key: 'view_payroll', label: 'View', description: 'View payroll information' },
//             { key: 'create_payroll', label: 'Create', description: 'Create payroll entries' },
//             { key: 'process_payroll', label: 'Process', description: 'Process payroll' },
//             { key: 'approve_payroll', label: 'Approve', description: 'Approve payroll processing' },
//             { key: 'export_payroll', label: 'Export', description: 'Export payroll data' },
//             { key: 'configure_payroll', label: 'Configure', description: 'Configure payroll settings' },
//         ],
//     },
//     {
//         name: 'expenses',
//         label: 'Expense Management',
//         permissions: [
//             { key: 'view_expenses', label: 'View', description: 'View expense claims' },
//             { key: 'submit_expenses', label: 'Submit', description: 'Submit expense claims' },
//             { key: 'approve_expenses', label: 'Approve', description: 'Approve expense claims' },
//             { key: 'reject_expenses', label: 'Reject', description: 'Reject expense claims' },
//             { key: 'export_expenses', label: 'Export', description: 'Export expense reports' },
//         ],
//     },
//     {
//         name: 'recruitment',
//         label: 'Recruitment',
//         permissions: [
//             { key: 'view_recruitment', label: 'View', description: 'View recruitment data' },
//             { key: 'create_recruitment', label: 'Create', description: 'Create job postings' },
//             { key: 'manage_recruitment', label: 'Manage', description: 'Manage recruitment process' },
//             { key: 'export_recruitment', label: 'Export', description: 'Export recruitment reports' },
//         ],
//     },
//     {
//         name: 'tickets',
//         label: 'Ticketing System',
//         permissions: [
//             { key: 'view_tickets', label: 'View', description: 'View support tickets' },
//             { key: 'create_tickets', label: 'Create', description: 'Create new tickets' },
//             { key: 'assign_tickets', label: 'Assign', description: 'Assign tickets to agents' },
//             { key: 'resolve_tickets', label: 'Resolve', description: 'Resolve tickets' },
//             { key: 'escalate_tickets', label: 'Escalate', description: 'Escalate tickets' },
//             { key: 'export_tickets', label: 'Export', description: 'Export ticket reports' },
//         ],
//     },
//     {
//         name: 'documents',
//         label: 'Document Management',
//         permissions: [
//             { key: 'view_documents', label: 'View', description: 'View documents' },
//             { key: 'generate_documents', label: 'Generate', description: 'Generate documents' },
//             { key: 'approve_documents', label: 'Approve', description: 'Approve documents' },
//             { key: 'export_documents', label: 'Export', description: 'Export documents' },
//         ],
//     },
//     {
//         name: 'reports',
//         label: 'Reports & Analytics',
//         permissions: [
//             { key: 'view_hrms_reports', label: 'View', description: 'View reports' },
//             { key: 'create_hrms_reports', label: 'Create', description: 'Create custom reports' },
//             { key: 'schedule_hrms_reports', label: 'Schedule', description: 'Schedule automated reports' },
//             { key: 'export_hrms_reports', label: 'Export', description: 'Export reports' },
//         ],
//     },
//     {
//         name: 'settings',
//         label: 'System Settings',
//         permissions: [
//             { key: 'organization_hrms_settings', label: 'Organization', description: 'Manage organization settings' },
//             { key: 'locations_hrms_settings', label: 'Locations', description: 'Manage locations' },
//             { key: 'security_hrms_settings', label: 'Security', description: 'Configure security settings' },
//             { key: 'roles_hrms_settings', label: 'Roles & Permissions', description: 'Manage roles and permissions' },
//             { key: 'integrations_hrms_settings', label: 'Integrations', description: 'Configure integrations' },
//         ],
//     },
//     {
//         name: 'permsissions',
//         label: 'HRMS Permissions',
//         permissions: [
//             { key: 'hrms_permissions', label: 'Permissions', description: 'Manage HRMS permissions' }
//         ],
//     },

// ];

// export default function Roles() {
//     const [activeTab, setActiveTab] = useState<"role-permissions" | "employee-permissions">("role-permissions");
//     const [roles, setRoles] = useState<RoleData[]>([]);
//     const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [selectedRole, setSelectedRole] = useState<string>("");
//     const [selectedEmployee, setSelectedEmployee] = useState<string>("");
//     const [rolePermissions, setRolePermissions] = useState<Record<string, any>>({});
//     const [employeePermissions, setEmployeePermissions] = useState<Record<string, any>>({});
//     const [searchQuery, setSearchQuery] = useState('');

//     const loadRoles = async () => {
//         try {
//             setLoading(true);
//             const rolesRes = await rolesApi.getAllRoles();
            
//             // Fetch employees to count users per role
//             const employeesRes = await HrmsEmployeesApi.getEmployees();
//             setEmployees(employeesRes);

//             // Map roles with user count
//             const rolesWithCount = rolesRes.map((role: any) => {
//                 const userCount = employeesRes.filter(
//                     (emp: HrmsEmployee) => emp.role_id?.toString() === role.id?.toString()
//                 ).length;

//                 return {
//                     id: role.id?.toString(),
//                     name: role.name,
//                     description: role.description || 'No description',
//                     permissions: role.permissions || {},
//                     userCount,
//                     is_active: role.is_active ?? true,
//                 };
//             });

//             setRoles(rolesWithCount);
            
//             // Set first role as selected
//             if (rolesWithCount.length > 0) {
//                 setSelectedRole(rolesWithCount[0].id);
//                 setRolePermissions(rolesWithCount[0].permissions || {});
//             }

//             // Set first employee as selected
//             if (employeesRes.length > 0) {
//                 setSelectedEmployee(employeesRes[0].id?.toString());
//                 // Note: You may need to fetch employee permissions from API
//                 setEmployeePermissions({});
//             }
//         } catch (error) {
//             console.error('Error loading roles:', error);
//             toast.error('Failed to load roles');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         loadRoles();
//     }, []);

//     const handlePermissionChange = (module: string, permission: string, value: boolean) => {
//         if (activeTab === "role-permissions") {
//             setRolePermissions((prev) => ({
//                 ...prev,
//                 [module]: {
//                     ...prev[module],
//                     [permission]: value,
//                 },
//             }));
//         } else {
//             setEmployeePermissions((prev) => ({
//                 ...prev,
//                 [module]: {
//                     ...prev[module],
//                     [permission]: value,
//                 },
//             }));
//         }
//     };

//     const handleModuleSelectAll = (module: Module) => {
//         const currentPermissions = activeTab === "role-permissions" ? rolePermissions : employeePermissions;
//         const modulePerms = getModulePermissions(currentPermissions, module.name);
//         const allChecked = module.permissions.every(perm => modulePerms[perm.key]);
        
//         const newModulePerms: Record<string, boolean> = {};
//         module.permissions.forEach(perm => {
//             newModulePerms[perm.key] = !allChecked;
//         });

//         if (activeTab === "role-permissions") {
//             setRolePermissions((prev) => ({
//                 ...prev,
//                 [module.name]: newModulePerms,
//             }));
//         } else {
//             setEmployeePermissions((prev) => ({
//                 ...prev,
//                 [module.name]: newModulePerms,
//             }));
//         }
//     };

//     const saveRolePermissions = async () => {
//         try {
//             setLoading(true);
//             await rolesApi.updateRolePermissions(selectedRole, rolePermissions);
//             toast.success('Role permissions updated successfully!');
//             loadRoles();
//         } catch (error: any) {
//             console.error('Error updating role permissions:', error);
//             toast.error(error.message || 'Failed to update role permissions');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const saveEmployeePermissions = async () => {
//         try {
//             setLoading(true);
//             // TODO: Implement employee permissions update API call
//             // await HrmsEmployeesApi.updateEmployeePermissions(selectedEmployee, employeePermissions);
//             toast.success('Employee permissions updated successfully!');
//             loadRoles();
//         } catch (error: any) {
//             console.error('Error updating employee permissions:', error);
//             toast.error(error.message || 'Failed to update employee permissions');
//         } finally {
//             setLoading(false);
//         }
//     };

//     const getModulePermissions = (permissions: any, moduleName: string) => {
//         if (!permissions) return {};
//         const modulePerms = permissions[moduleName];
//         if (!modulePerms) return {};
//         if (typeof modulePerms === 'object') return modulePerms;
//         return {};
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-96">
//                 <div className="animate-spin h-12 w-12 border-b-2 border-blue-500 rounded-full"></div>
//             </div>
//         );
//     }

//     const currentPermissions = activeTab === "role-permissions" ? rolePermissions : employeePermissions;
//     const filteredModules = MODULES.filter(module =>
//         searchQuery === '' || 
//         module.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         module.permissions.some(p => p.label.toLowerCase().includes(searchQuery.toLowerCase()))
//     );

//     return (
//         <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
//             {/* Header */}
//             {/* <div className="mb-6">
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Access Control</h1>
//                 <p className="text-sm text-gray-600 mt-1">Manage hierarchical roles and granular employee-specific permissions.</p>
//             </div> */}

//             {/* Search Bar */}
//             {/* <div className="mb-6">
//                 <div className="relative max-w-md">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                         type="text"
//                         placeholder="Search permissions..."
//                         value={searchQuery}
//                         onChange={(e) => setSearchQuery(e.target.value)}
//                         className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                 </div>
//             </div> */}

//             {/* Tabs */}
//             <div className="bg-white rounded-t-lg border-b">
//                 <div className="flex">
//                     <button
//                         onClick={() => setActiveTab("role-permissions")}
//                         className={`flex-1 md:flex-none px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
//                             activeTab === "role-permissions"
//                                 ? "text-blue-600 border-blue-600"
//                                 : "text-gray-600 border-transparent hover:text-gray-900"
//                         }`}
//                     >
//                         <Shield className="w-4 h-4 inline-block mr-2" />
//                         Role Permissions
//                     </button>

//                     <button
//                         onClick={() => setActiveTab("employee-permissions")}
//                         className={`flex-1 md:flex-none px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
//                             activeTab === "employee-permissions"
//                                 ? "text-blue-600 border-blue-600"
//                                 : "text-gray-600 border-transparent hover:text-gray-900"
//                         }`}
//                     >
//                         <Users className="w-4 h-4 inline-block mr-2" />
//                         Direct Employee Overrides
//                     </button>
//                 </div>
//             </div>

//             {/* Content */}
//             <div className="bg-white rounded-b-lg shadow-sm p-4">
//                 {/* Role/Employee Selection */}
//                 <div className="mb-6">
//                     <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
//                         {activeTab === "role-permissions" ? "TARGET ROLE" : "TARGET EMPLOYEE"}
//                     </label>
//                     <select
//                         value={activeTab === "role-permissions" ? selectedRole : selectedEmployee}
//                         onChange={(e) => {
//                             if (activeTab === "role-permissions") {
//                                 const newRole = e.target.value;
//                                 setSelectedRole(newRole);
//                                 const r = roles.find((x: any) => x.id === newRole);
//                                 setRolePermissions(r?.permissions || {});
//                             } else {
//                                 const empId = e.target.value;
//                                 setSelectedEmployee(empId);
//                                 const emp = employees.find((x) => x.id?.toString() === empId);
//                                 // TODO: Fetch employee-specific permissions from API
//                                 setEmployeePermissions({});
//                             }
//                         }}
//                         className="w-full max-w-md border-2 border-blue-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
//                     >
//                         {activeTab === "role-permissions"
//                             ? roles.map((r) => (
//                                 <option key={r.id} value={r.id}>
//                                     {r.name}
//                                 </option>
//                             ))
//                             : employees.map((emp) => (
//                                 <option key={emp.id} value={emp.id}>
//                                     {emp.first_name} {emp.last_name}
//                                 </option>
//                             ))}
//                     </select>
//                 </div>

//                 {/* ✅ Permissions Grid - COMPACT VERTICAL CARDS */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                     {filteredModules.map((module) => {
//                         const modulePerms = getModulePermissions(currentPermissions, module.name);
//                         const moduleAllChecked = module.permissions.every((perm) => modulePerms[perm.key]);
//                         const actionsCount = module.permissions.length;

//                         return (
//                             <div
//                                 key={module.name}
//                                 className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition-all"
//                             >
//                                 {/* ✅ Module Header - Compact layout */}
//                                 <div className="bg-white px-3 py-1.5 border-b border-gray-200">
//                                     <div className="flex items-center justify-between gap-2">
//                                         <div className="flex items-center gap-1.5 flex-1 min-w-0">
//                                             <h3 className="font-semibold text-gray-900 text-xs leading-tight truncate">{module.label}</h3>
//                                             <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
//                                                 {actionsCount}
//                                             </span>
//                                         </div>

//                                         {/* ✅ SELECT ALL with Checkbox inline */}
//                                         <label className="flex items-center gap-1.5 cursor-pointer flex-shrink-0">
//                                             <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide whitespace-nowrap">
//                                                 SELECT ALL
//                                             </span>
//                                             <input
//                                                 type="checkbox"
//                                                 checked={moduleAllChecked}
//                                                 onChange={() => handleModuleSelectAll(module)}
//                                                 className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
//                                             />
//                                         </label>
//                                     </div>
//                                 </div>

//                                 {/* ✅ Permissions List - VERTICAL with checkboxes on RIGHT */}
//                                 <div className="p-2 bg-gray-50">
//                                     <div className="space-y-0 divide-y divide-gray-100">
//                                         {module.permissions.map((perm) => {
//                                             const isChecked = !!modulePerms[perm.key];
//                                             return (
//                                                 <label
//                                                     key={perm.key}
//                                                     className="flex items-center justify-between py-1.5 px-1.5 cursor-pointer hover:bg-white rounded transition-colors group"
//                                                 >
//                                                     <div className="flex-1 min-w-0">
//                                                         <span className={`text-xs block ${isChecked ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
//                                                             {perm.label}
//                                                         </span>
//                                                         {perm.description && (
//                                                             <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
//                                                                 {perm.description}
//                                                             </span>
//                                                         )}
//                                                     </div>

//                                                     {/* ✅ Checkbox on RIGHT (custom styled) */}
//                                                     <div className="relative ml-2 flex-shrink-0">
//                                                         <input
//                                                             type="checkbox"
//                                                             checked={isChecked}
//                                                             onChange={(e) => handlePermissionChange(module.name, perm.key, e.target.checked)}
//                                                             className="sr-only peer"
//                                                         />
//                                                         <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${isChecked
//                                                             ? 'bg-blue-600 border-blue-600'
//                                                             : 'border-gray-300 bg-white group-hover:border-blue-400'
//                                                             }`}>
//                                                             {isChecked && (
//                                                                 <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                                                                 </svg>
//                                                             )}
//                                                         </div>
//                                                     </div>
//                                                 </label>
//                                             );
//                                         })}
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>

//                 {/* Save Button */}
//                 <div className="mt-6 pt-4 border-t border-gray-200">
//                     <button
//                         onClick={activeTab === "role-permissions" ? saveRolePermissions : saveEmployeePermissions}
//                         disabled={loading}
//                         className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {loading ? 'Saving...' : 'Save Changes'}
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }