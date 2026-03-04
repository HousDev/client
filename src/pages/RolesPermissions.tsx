import { useState, useEffect } from "react";
import { Shield, Users, Search } from "lucide-react";
import { toast } from "sonner";
import rolesApi from "../lib/rolesApi";
import { UsersApi } from "../lib/Api";
import HrmsEmployeesApi from "../lib/employeeApi";
import SearchableSelect from "../components/SearchableSelect";

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
  const [allEmployees, setAllEmployees] = useState<any>([]);
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
    {
      action: "hrms_dashboard",
      label: "HRMS Dashboard",
      module: "HRMS Dashboard",
    },

    // HRMS Employees
    {
      action: "view_employee",
      label: "View Employees",
      module: "HRMS Employees",
    },
    {
      action: "create_employee",
      label: "Create Employees",
      module: "HRMS Employees",
    },
    {
      action: "edit_employee",
      label: "Edit Employees",
      module: "HRMS Employees",
    },
    {
      action: "delete_employee",
      label: "Delete Employees",
      module: "HRMS Employees",
    },
    {
      action: "export_employee",
      label: "Export Employees",
      module: "HRMS Employees",
    },
    {
      action: "bulk_actions_employee",
      label: "Bulk Actions",
      module: "HRMS Employees",
    },

    // HRMS Attendance
    {
      action: "view_attendance",
      label: "View Attendance",
      module: "Attendance",
    },
    {
      action: "mark_attendance",
      label: "Mark Attendance",
      module: "Attendance",
    },
    {
      action: "export_attendance",
      label: "Export Attendance",
      module: "Attendance",
    },

    // HRMS leaves
    { action: "view_leaves", label: "View Leaves", module: "Leaves" },
    { action: "apply_leaves", label: "Apply Leaves", module: "Leaves" },
    { action: "delete_leaves", label: "Delete Leaves", module: "Leaves" },
    { action: "approve_leaves", label: "Approve Leaves", module: "Leaves" },
    { action: "reject_leaves", label: "Reject Leaves", module: "Leaves" },
    { action: "configure_leaves", label: "Configure Leaves", module: "Leaves" },
    {
      action: "view_all_balances_leaves",
      label: "View All Balances",
      module: "Leaves",
    },
    { action: "export_leaves", label: "Export Leaves", module: "Leaves" },

    // HRMS Payroll
    {
      action: "view_payroll_summary",
      label: "View Payroll Summary",
      module: "Payroll",
    },
    {
      action: "view_ctc_config",
      label: "View Payroll CTC Configuration",
      module: "Payroll",
    },
    {
      action: "view_advance",
      label: "View Advance",
      module: "Payroll",
    },
    {
      action: "view_incentive",
      label: "View Incentive",
      module: "Payroll",
    },
    {
      action: "view_reimbursements",
      label: "View Reimbursements",
      module: "Payroll",
    },
    {
      action: "view_tds",
      label: "View TDS",
      module: "Payroll",
    },
    {
      action: "view_payment_history",
      label: "View Payment History",
      module: "Payroll",
    },

    // HRMS Payroll Summary
    {
      action: "run_new_payroll",
      label: "Run Payment Payroll",
      module: "Payroll Summary",
    },
    {
      action: "view_created_payroll",
      label: "View Created Payroll",
      module: "Payroll Summary",
    },
    {
      action: "view_payroll_report",
      label: "View Payroll Report",
      module: "Payroll Summary",
    },

    // Payroll CTC Configuration
    {
      action: "assign_ctc",
      label: "Assign CTC",
      module: "Payroll CTC Configuration",
    },
    {
      action: "delete_assigned_ctc",
      label: "Delete Assign CTC",
      module: "Payroll CTC Configuration",
    },
    {
      action: "manage_ctc_template",
      label: "Manage CTC Template",
      module: "Payroll CTC Configuration",
    },
    {
      action: "ctc_config_bulk_action",
      label: "CTC Bulk Actions",
      module: "Payroll CTC Configuration",
    },
    {
      action: "create_ctc_template",
      label: "Create CTC Template",
      module: "Payroll CTC Configuration",
    },
    {
      action: "update_ctc_template",
      label: "Update CTC Template",
      module: "Payroll CTC Configuration",
    },
    {
      action: "view_ctc_template",
      label: "View CTC Template",
      module: "Payroll CTC Configuration",
    },
    {
      action: "delete_ctc_template",
      label: "Delete CTC Template",
      module: "Payroll CTC Configuration",
    },
    {
      action: "make_ctc_template_default",
      label: "Mark CTC Template Default",
      module: "Payroll CTC Configuration",
    },
    {
      action: "active_inactive_ctc_template",
      label: "Active Inactive CTC Tamplate",
      module: "Payroll CTC Configuration",
    },

    // Advance
    {
      action: "view_advance",
      label: "View Advance",
      module: "Payroll Advance",
    },
    {
      action: "create_advance_request",
      label: "Create Advance Request",
      module: "Payroll Advance",
    },
    {
      action: "approve_advance_request",
      label: "Approve Advance Request",
      module: "Payroll Advance",
    },
    {
      action: "reject_advance_request",
      label: "Reject Advance Request",
      module: "Payroll Advance",
    },
    {
      action: "disburse_advance",
      label: "Disburse Advance",
      module: "Payroll Advance",
    },
    {
      action: "delete_advance_request",
      label: "Delete Advance Request",
      module: "Payroll Advance",
    },

    // Incentive
    {
      action: "import_incentive_csv",
      label: "Import Incentive Data",
      module: "Payroll Incentive",
    },
    {
      action: "pay_incentive",
      label: "Pay Incentive",
      module: "Payroll Incentive",
    },
    {
      action: "create_incentive_request",
      label: "Create Incentive Request",
      module: "Payroll Incentive",
    },
    {
      action: "incentive_bulk_action",
      label: "Incentive Bulk Action",
      module: "Payroll Incentive",
    },
    {
      action: "approve_incentive_request",
      label: "Approve Incentive Request.",
      module: "Payroll Incentive",
    },
    {
      action: "reject_incentive_request",
      label: "Reject Incentive Request.",
      module: "Payroll Incentive",
    },
    {
      action: "delete_incentive_request",
      label: "Delete Incentive Request.",
      module: "Payroll Incentive",
    },

    // Reimbursement
    {
      action: "export_reimbursement_data",
      label: "Export Reimbursement Data.",
      module: "Payroll Reimbursement",
    },
    {
      action: "reimbursement_bulk_actions",
      label: "Reimbursement Bulk Actions.",
      module: "Payroll Reimbursement",
    },
    {
      action: "create_reimbursement_request",
      label: "Create Reimbursement Request.",
      module: "Payroll Reimbursement",
    },
    {
      action: "delete_reimbursement_request",
      label: "Delete Reimbursement Request.",
      module: "Payroll Reimbursement",
    },
    {
      action: "apprvoe_reimbursement_request",
      label: "Approve Reimbursement Request.",
      module: "Payroll Reimbursement",
    },
    {
      action: "reject_reimbursement_request",
      label: "Reject Reimbursement Request.",
      module: "Payroll Reimbursement",
    },
    {
      action: "disburse_reimbursement",
      label: "Disburse Reimbursement.",
      module: "Payroll Reimbursement",
    },

    // TDS
    {
      action: "generate_form16",
      label: "Generate Form 16.",
      module: "Payroll TDS",
    },
    {
      action: "export_tds_return",
      label: "Export TDS Return.",
      module: "Payroll TDS",
    },
    {
      action: "mark_filed_form16",
      label: "Mark Form 16 Filed.",
      module: "Payroll TDS",
    },
    {
      action: "mark_tds_deposited",
      label: "Mark TDS Deposited.",
      module: "Payroll TDS",
    },

    // Payment History
    {
      action: "export_payment_history",
      label: "Export Payment History Data.",
      module: "Payroll Payment History",
    },
    {
      action: "download_payment_receipt",
      label: "Download Payment Receipt.",
      module: "Payroll Payment History",
    },

    // Expenses
    { action: "view_expenses", label: "View Expenses", module: "Expenses" },
    { action: "submit_expenses", label: "Submit Expenses", module: "Expenses" },
    {
      action: "approve_expenses",
      label: "Approve Expenses",
      module: "Expenses",
    },
    { action: "reject_expenses", label: "Reject Expenses", module: "Expenses" },
    { action: "export_expenses", label: "Export Expenses", module: "Expenses" },

    // Recruitment
    {
      action: "view_recruitment",
      label: "View Recruitment",
      module: "Recruitment",
    },
    {
      action: "create_recruitment",
      label: "Create Recruitment",
      module: "Recruitment",
    },
    {
      action: "manage_recruitment",
      label: "Manage Recruitment",
      module: "Recruitment",
    },
    {
      action: "export_recruitment",
      label: "Export Recruitment",
      module: "Recruitment",
    },

    // tickets
    { action: "view_tickets", label: "View Tickets", module: "Tickets" },
    { action: "create_tickets", label: "Create Tickets", module: "Tickets" },
    { action: "assign_tickets", label: "Assign Tickets", module: "Tickets" },
    { action: "resolve_tickets", label: "Resolve Tickets", module: "Tickets" },
    {
      action: "escalate_tickets",
      label: "Escalate Tickets",
      module: "Tickets",
    },
    { action: "export_tickets", label: "Export Tickets", module: "Tickets" },

    // documents
    { action: "view_documents", label: "View Documents", module: "Documents" },
    {
      action: "generate_documents",
      label: "Generate Documents",
      module: "Documents",
    },
    {
      action: "approve_documents",
      label: "Approve Documents",
      module: "Documents",
    },
    {
      action: "export_documents",
      label: "Export Documents",
      module: "Documents",
    },

    // HRMS Reports
    {
      action: "view_hrms_reports",
      label: "View HRMS Reports",
      module: "HRMS Reports",
    },
    {
      action: "create_hrms_reports",
      label: "Create HRMS Reports",
      module: "HRMS Reports",
    },
    {
      action: "schedule_hrms_reports",
      label: "Schedule HRMS Reports",
      module: "HRMS Reports",
    },
    {
      action: "export_hrms_reports",
      label: "Export HRMS Reports",
      module: "HRMS Reports",
    },

    // HRMS Settings
    {
      action: "organization_hrms_settings",
      label: "Organization Settings",
      module: "HRMS Settings",
    },
    {
      action: "locations_hrms_settings",
      label: "Locations Settings",
      module: "HRMS Settings",
    },
    {
      action: "security_hrms_settings",
      label: "Security Settings",
      module: "HRMS Settings",
    },
    {
      action: "roles_hrms_settings",
      label: "Roles & Permissions Settings",
      module: "HRMS Settings",
    },
    {
      action: "integrations_hrms_settings",
      label: "Integrations Settings",
      module: "HRMS Settings",
    },

    // permissions

    {
      action: "hrms_permissions",
      label: "View HRMS Permissions",
      module: "Permissions",
    },
  ];

  const loadUsers = async () => {
    try {
      const usersRes: any = await UsersApi.list();
      const employeeRes: any = await HrmsEmployeesApi.getEmployees();
      console.log(
        "emp selected : ",
        Array.isArray(employeeRes) ? employeeRes[0]?.user_id : "",
      );

      setAllEmployees(Array.isArray(employeeRes) ? employeeRes : []);
      setUserPermissions(
        Array.isArray(usersRes) ? usersRes[0]?.permissions || {} : {},
      );
      setUsers(Array.isArray(usersRes) ? usersRes : []);
      setSelectedUser(
        Array.isArray(employeeRes) ? employeeRes[0]?.user_id : "",
      );
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
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "role-permissions"
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
                setSelectedUser(allEmployees[0].user_id);
                setUserPermissions(
                  users.find((uf: any) => uf.id === allEmployees[0].user_id)
                    ?.permissions || {},
                );
              }
            }}
            className={`flex-1 md:flex-none px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "user-permissions"
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
          <div className="w-1/2">
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
              TARGET {activeTab === "role-permissions" ? "ROLE" : "EMPLOYEE"}
            </label>
            <SearchableSelect
              options={
                activeTab === "role-permissions"
                  ? roles.map((r: any) => ({
                      id: r.id,
                      name: r.name || "",
                    }))
                  : allEmployees.map((e: any) => ({
                      id: e.user_id,
                      name:
                        e.first_name +
                          " " +
                          e.last_name +
                          " (" +
                          e.employee_code +
                          ")" || "",
                    }))
              }
              value={
                activeTab === "role-permissions" ? selectedRole : selectedUser
              }
              onChange={(id) => {
                if (activeTab === "role-permissions") {
                  const newRole = id;
                  setSelectedRole(newRole);
                  const r = roles.find((x: any) => x.id === Number(newRole));
                  setRolePermissions(r?.permissions || {});
                } else {
                  const uid = id;
                  console.log(uid);
                  console.log(users);
                  setSelectedUser(uid);
                  const u = users.find((x) => x.id === uid);
                  console.log(u);
                  setUserPermissions(u?.permissions || {});
                }
              }}
              placeholder={`Select ${activeTab === "role-permissions" ? "Role" : "Employee"}`}
              required
            />
            {/* <select
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
                : allEmployees.map((e: any) => (
                    <option key={e.id} value={e.user_id}>
                      {e.first_name +
                        " " +
                        e.last_name +
                        " " +
                        "(" +
                        e.employee_code +
                        ")"}
                    </option>
                  ))}
            </select> */}
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
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                                  isChecked
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
