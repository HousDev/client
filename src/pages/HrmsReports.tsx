import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  Wallet,
  Receipt,
  UserPlus,
  Ticket,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import { formatters } from "../utils/formatters";
import HrmsEmployeesApi from "../lib/employeeApi";
import attendanceApi from "../lib/attendanceApi";
import { LeaveApi } from "../lib/leaveApi";
import expenseApi from "../lib/expenseApi";
import * as XLSX from "xlsx";
import ticketApi from "../lib/ticketApi";

type ReportType =
  | "employees"
  | "attendance"
  | "leaves"
  | "payroll"
  | "expenses"
  | "recruitment"
  | "tickets";

interface ReportData {
  employees: any[];
  attendance: any[];
  leaves: any[];
  payroll: any[];
  expenses: any[];
  tickets: any[];
}

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("employees");
  const [dateRange, setDateRange] = useState("this-month");
  const [reportData, setReportData] = useState<ReportData>({
    employees: [],
    attendance: [],
    leaves: [],
    payroll: [],
    expenses: [],
    tickets: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange]);

  const getDateRangeParams = () => {
    const now = new Date();
    let startDate = "";
    let endDate = "";

    switch (dateRange) {
      case "today":
        startDate = now.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
        break;
      case "this-week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
        break;
      case "this-month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split("T")[0];
        endDate = now.toISOString().split("T")[0];
        break;
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = lastMonth.toISOString().split("T")[0];
        endDate = lastMonthEnd.toISOString().split("T")[0];
        break;
      case "this-quarter":
        const quarterStart = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1,
        );
        startDate = quarterStart.toISOString().split("T")[0];
        endDate = now.toISOString().split("T")[0];
        break;
      case "this-year":
        startDate = new Date(now.getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
        endDate = now.toISOString().split("T")[0];
        break;
    }
    return { startDate, endDate };
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRangeParams();

      switch (selectedReport) {
        case "employees":
          const employees = await HrmsEmployeesApi.getEmployees();
          setReportData((prev) => ({ ...prev, employees: employees || [] }));
          break;

        case "attendance":
          const attendanceResponse =
            await attendanceApi.getEmployeeAttendanceReport(
              "2026-01-01",
              "2026-03-31",
            );
          console.log("res of attendance : ", attendanceResponse);
          setReportData((prev) => ({
            ...prev,
            attendance: attendanceResponse?.data?.data || [],
          }));
          break;

        case "leaves":
          const leavesResponse = await LeaveApi.getLeaves({
            start_date: startDate,
            end_date: endDate,
            limit: 1000,
          });
          setReportData((prev) => ({
            ...prev,
            leaves: leavesResponse?.data || [],
          }));
          break;

        case "payroll":
          // Mock payroll data - replace with actual API when available
          const mockPayroll: any = [];
          setReportData((prev) => ({ ...prev, payroll: mockPayroll }));
          break;

        case "expenses":
          const expensesResponse = await expenseApi.getExpenses({
            start_date: startDate,
            end_date: endDate,
            limit: 1000,
          });
          setReportData((prev) => ({
            ...prev,
            expenses: expensesResponse?.data || [],
          }));
          break;

        case "tickets":
          const ticketsResponse = await ticketApi.getAllTickets({
            start_date: startDate,
            end_date: endDate,
            limit: 1000,
          });
          console.log("ticketsResponse", ticketsResponse);
          setReportData((prev) => ({
            ...prev,
            tickets: ticketsResponse?.data || [],
          }));
          break;

        default:
          break;
      }
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    let worksheetData: any[][] = [];
    let sheetName = "";

    switch (selectedReport) {
      case "employees":
        sheetName = "Employees Report";
        worksheetData = [
          [
            "Employee Code",
            "Name",
            "Department",
            "Position",
            "Email",
            "Join Date",
          ],
          ...reportData.employees.map((emp) => [
            emp.employee_code,
            `${emp.first_name} ${emp.last_name}`,
            emp.departments?.name || emp.department_name || "N/A",
            emp.positions?.title || emp.designation || "N/A",
            emp.email,
            formatters.date(emp.joining_date),
          ]),
        ];
        break;

      case "attendance":
        sheetName = "Attendance Report";
        worksheetData = [
          [
            "Employee",
            "Date",
            "Check In",
            "Check Out",
            "Status",
            "Working Hours",
          ],
          ...reportData.attendance.map((att) => [
            `${att.employees?.first_name || ""} ${att.employees?.last_name || ""}`,
            formatters.date(att.date),
            att.check_in_time || "N/A",
            att.check_out_time || "N/A",
            att.status,
            `${att.working_hours || 0} hrs`,
          ]),
        ];
        break;

      case "leaves":
        sheetName = "Leaves Report";
        worksheetData = [
          [
            "Employee",
            "Leave Type",
            "From Date",
            "To Date",
            "Days",
            "Status",
            "Reason",
          ],
          ...reportData.leaves.map((leave) => [
            `${leave.employees?.first_name || ""} ${leave.employees?.last_name || ""}`,
            leave.leave_type,
            formatters.date(leave.from_date),
            formatters.date(leave.to_date),
            leave.total_days,
            leave.status,
            leave.reason,
          ]),
        ];
        break;

      case "payroll":
        sheetName = "Payroll Report";
        worksheetData = [
          [
            "Employee",
            "Period",
            "Gross Salary",
            "Deductions",
            "Net Salary",
            "Status",
          ],
          ...reportData.payroll.map((payslip) => [
            `${payslip.employees?.first_name || ""} ${payslip.employees?.last_name || ""}`,
            new Date(payslip.period_month).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            }),
            formatters.currency(payslip.gross_earnings),
            formatters.currency(payslip.total_deductions),
            formatters.currency(payslip.net_salary),
            payslip.payment_status,
          ]),
        ];
        break;

      case "expenses":
        sheetName = "Expenses Report";
        worksheetData = [
          ["Employee", "Category", "Description", "Amount", "Date", "Status"],
          ...reportData.expenses.map((expense) => [
            `${expense.employees?.first_name || ""} ${expense.employees?.last_name || ""}`,
            expense.category,
            expense.description,
            formatters.currency(expense.amount),
            formatters.date(expense.expense_date || expense.submitted_date),
            expense.status,
          ]),
        ];
        break;

      case "tickets":
        sheetName = "Tickets Report";
        worksheetData = [
          [
            "Ticket",
            "Employee",
            "Subject",
            "Category",
            "Priority",
            "Assigned To",
            "Date",
            "Status",
          ],
          ...reportData.tickets.map((ticket) => [
            `${ticket.ticket_number || ""}`,
            ticket.employee_name,
            ticket.subject,
            ticket.category,
            ticket.priority,
            ticket.assigned_to_name,
            ticket.created_at,
            ticket.status,
          ]),
        ];
        break;

      default:
        return;
    }

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns (optional - sets approximate widths)
    const colWidths = worksheetData[0].map((_, colIndex) => {
      let maxLength = 0;
      worksheetData.forEach((row) => {
        const cellValue = row[colIndex]?.toString() || "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      return { wch: Math.min(maxLength + 2, 50) }; // Max width 50 characters
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate Excel file
    const fileName = `${selectedReport}_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const reportTypes = [
    {
      value: "employees",
      label: "Employees Report",
      icon: Users,
      color: "red",
    },
    {
      value: "attendance",
      label: "Attendance Report",
      icon: Clock,
      color: "green",
    },
    {
      value: "leaves",
      label: "Leaves Report",
      icon: Calendar,
      color: "yellow",
    },
    // {
    //   value: "payroll",
    //   label: "Payroll Report",
    //   icon: Wallet,
    //   color: "purple",
    // },
    {
      value: "expenses",
      label: "Expenses Report",
      icon: Receipt,
      color: "orange",
    },
    // {
    //   value: "recruitment",
    //   label: "Recruitment Report",
    //   icon: UserPlus,
    //   color: "blue",
    // },
    { value: "tickets", label: "Tickets Report", icon: Ticket, color: "pink" },
  ];

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "this-year", label: "This Year" },
  ];

  const renderEmployeesReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee Code
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Name
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Department
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Position
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Email
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Join Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm text-slate-900">
                {emp.employee_code}
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {emp.first_name} {emp.last_name}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {emp.departments?.name || emp.department_name || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {emp.positions?.title || emp.designation || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(emp.joining_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderAttendanceReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Check In
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Check Out
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Working Hours
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.attendance.map((att) => (
            <tr key={att.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {att.employees?.first_name} {att.employees?.last_name}
                <div className="text-xs text-slate-500">
                  {att.employees?.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(att.date)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {att.check_in_time || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {att.check_out_time || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    att.status === "present"
                      ? "bg-green-100 text-green-700"
                      : att.status === "absent"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {att.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {att.working_hours || 0} hrs
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLeavesReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Leave Type
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              From Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              To Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Days
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {leave.emp_name}
                <div className="text-xs text-slate-500">
                  {leave.employees?.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {leave.leave_type}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(leave.from_date)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(leave.to_date)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {leave.total_days}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    leave.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : leave.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {leave.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                {leave.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderPayrollReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Period
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">
              Gross Salary
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">
              Deductions
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">
              Net Salary
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.payroll.map((payslip) => (
            <tr key={payslip.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {payslip.employees?.first_name} {payslip.employees?.last_name}
                <div className="text-xs text-slate-500">
                  {payslip.employees?.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {new Date(payslip.period_month).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-sm text-right text-slate-900">
                {formatters.currency(payslip.gross_earnings)}
              </td>
              <td className="px-6 py-4 text-sm text-right text-red-600">
                {formatters.currency(payslip.total_deductions)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                {formatters.currency(payslip.net_salary)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payslip.payment_status === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {payslip.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderExpensesReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Category
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Description
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">
              Amount
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {expense.employee_name}
                <div className="text-xs text-slate-500">
                  {expense.employees?.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {expense.category}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                {expense.description}
              </td>
              <td className="px-6 py-4 text-sm text-right text-slate-900">
                {formatters.currency(expense.amount)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(
                  expense.expense_date || expense.submitted_date,
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    expense.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : expense.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {expense.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderTicketReport = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Ticket
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Subject
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Category
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Priority
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Assigned To
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
              Status
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {reportData.tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50">
              {/* Ticket Number */}
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {ticket.ticket_number}
                <div className="text-xs text-slate-500">ID: {ticket.id}</div>
              </td>

              {/* Employee */}
              <td className="px-6 py-4 text-sm text-slate-900">
                {ticket.employee_name}
                <div className="text-xs text-slate-500">
                  {ticket.employee_department} • {ticket.employee_designation}
                </div>
              </td>

              {/* Subject */}
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                {ticket.subject}
              </td>

              {/* Category */}
              <td className="px-6 py-4 text-sm text-slate-600">
                {ticket.category}
              </td>

              {/* Priority */}
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.priority === "high"
                      ? "bg-red-100 text-red-700"
                      : ticket.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {ticket.priority}
                </span>
              </td>

              {/* Assigned To */}
              <td className="px-6 py-4 text-sm text-slate-600">
                {ticket.assigned_to_name || "-"}
              </td>

              {/* Date */}
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(ticket.created_at)}
              </td>

              {/* Status */}
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    ticket.status === "resolved"
                      ? "bg-green-100 text-green-700"
                      : ticket.status === "closed"
                        ? "bg-gray-100 text-gray-700"
                        : ticket.status === "in_progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {ticket.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="text-slate-600 mt-1">
            Generate comprehensive reports for all modules
          </p>
        </div>
        <Button onClick={exportToExcel} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {reportTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedReport === type.value;
          return (
            <button
              key={type.value}
              onClick={() => setSelectedReport(type.value as ReportType)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-red-500 bg-red-50"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                  isSelected ? "bg-red-100" : "bg-slate-100"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isSelected ? "text-red-600" : "text-slate-600"}`}
                />
              </div>
              <p
                className={`text-xs font-medium ${isSelected ? "text-red-900" : "text-slate-900"}`}
              >
                {type.label.replace(" Report", "")}
              </p>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="px-6 py-3 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-red-600" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {reportTypes.find((t) => t.value === selectedReport)?.label}
                </h2>
                <p className="text-sm text-slate-600">
                  Detailed data for selected module
                </p>
              </div>
            </div>
            {selectedReport !== "employees" && (
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={dateRangeOptions}
                className="w-48"
              />
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-500">Loading report data...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : (
          <div>
            {selectedReport === "employees" && renderEmployeesReport()}
            {selectedReport === "attendance" && renderAttendanceReport()}
            {selectedReport === "leaves" && renderLeavesReport()}
            {selectedReport === "payroll" && renderPayrollReport()}
            {selectedReport === "expenses" && renderExpensesReport()}
            {selectedReport === "tickets" && renderTicketReport()}
            {selectedReport === "recruitment" && (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Report coming soon...</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
