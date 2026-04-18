import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  Users,
  Clock,
  Receipt,
  Ticket,
  MapPin,
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
import { useAuth } from "../contexts/AuthContext";

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
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  };
  const [fromAttendance, setFromAttendance] = useState(getCurrentMonth());
  const [toAttendance, setToAttendance] = useState(getCurrentMonth());
  const { can, user } = useAuth();

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
            await attendanceApi.getAttendanceByMonthRange(
              fromAttendance,
              toAttendance,
            );

          console.log("res of attendance : ", attendanceResponse);
          setReportData((prev) => ({
            ...prev,
            attendance: attendanceResponse?.data || [],
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

  useEffect(() => {
    fetchReportData();
  }, [fromAttendance, toAttendance]);
  const formatHours = (decimalHours: number | string) => {
    const value = parseFloat(decimalHours as string);

    if (isNaN(value)) return "0:00 hr";

    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);

    return `${hours}:${minutes.toString().padStart(2, "0")} hr`;
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
            "Employee Code",
            "From Month",
            "To Month",
            "Check In",
            "Check In Location",
            "Check Out",
            "Check Out Location",
            "Status",
            "Working Hours",
          ],
          ...reportData.attendance.map((att) => [
            att.user_name,
            att.employee_code,
            fromAttendance,
            toAttendance,
            att.punch_in_time || "N/A",
            att.punch_in_location || "N/A",
            att.punch_out_time || "N/A",
            att.punch_out_location || "N/A",
            att.status,
            formatHours(att.total_hours),
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

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const colWidths = worksheetData[0].map((_, colIndex) => {
      let maxLength = 0;
      worksheetData.forEach((row) => {
        const cellValue = row[colIndex]?.toString() || "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

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
    {
      value: "expenses",
      label: "Expenses Report",
      icon: Receipt,
      color: "orange",
    },
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

  // Improved table component with sticky header and scrollable body
  const TableWrapper = ({
    children,
    minHeight = "400px",
  }: {
    children: React.ReactNode;
    minHeight?: string;
  }) => (
    <div className="relative overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto" style={{ minHeight }}>
          {children}
        </div>
      </div>
    </div>
  );

  const renderEmployeesReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee Code
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Name
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Department
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Position
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Email
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Join Date
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
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
    </TableWrapper>
  );

  const renderAttendanceReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Check In
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Check Out
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Working Hours
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.attendance.map((att) => (
            <tr key={att.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {att?.user_name}
                <div className="text-xs text-slate-500">
                  {att.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(att.date)}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                <div className="text-sm">{att.punch_in_time || "N/A"}</div>
                {att.punch_in_location && (
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[200px]">
                      {att.punch_in_location}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-slate-600">
                <div className="text-sm">{att.punch_out_time || "N/A"}</div>
                {att.punch_out_location && (
                  <div className="flex items-center text-xs text-slate-500 mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[200px]">
                      {att.punch_out_location}
                    </span>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
                {att.total_hours || 0} hrs
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderLeavesReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Leave Type
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              From Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              To Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Days
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Status
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Reason
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.leaves.map((leave) => (
            <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
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
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                <div className="truncate">{leave.reason}</div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderPayrollReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Period
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Gross Salary
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Deductions
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Net Salary
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.payroll.map((payslip) => (
            <tr
              key={payslip.id}
              className="hover:bg-slate-50 transition-colors"
            >
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
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
    </TableWrapper>
  );

  const renderExpensesReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Category
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Description
            </th>
            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Amount
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {expense.employee_name}
                <div className="text-xs text-slate-500">
                  {expense.employees?.employee_code}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {expense.category}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                <div className="truncate">{expense.description}</div>
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
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
    </TableWrapper>
  );

  const renderTicketReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Ticket
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Employee
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Subject
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Category
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Priority
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Assigned To
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Date
            </th>
            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900 border-b border-slate-200">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {reportData.tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-slate-900">
                {ticket.ticket_number}
                <div className="text-xs text-slate-500">ID: {ticket.id}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-900">
                {ticket.employee_name}
                <div className="text-xs text-slate-500">
                  {ticket.employee_department} • {ticket.employee_designation}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                <div className="truncate">{ticket.subject}</div>
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {ticket.category}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
              <td className="px-6 py-4 text-sm text-slate-600">
                {ticket.assigned_to_name || "-"}
              </td>
              <td className="px-6 py-4 text-sm text-slate-600">
                {formatters.date(ticket.created_at)}
              </td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
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
    </TableWrapper>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className=" flex justify-between">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedReport === type.value;
            if (!can("view_employee") && type.value === "employees") return;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedReport(type.value as ReportType)}
                className={`px-2 rounded-lg border-2 transition-all ${
                  isSelected
                    ? "border-red-500 bg-red-50"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                } flex justify-center items-center`}
              >
                <div
                  className={` p-1 rounded-lg flex items-center justify-center mr-2 ${
                    isSelected ? "bg-red-100" : "bg-slate-100"
                  }`}
                >
                  <Icon
                    className={`h-4 w-4  ${isSelected ? "text-red-600" : "text-slate-600"}`}
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
        <Button onClick={exportToExcel} disabled={loading} className="text-sm">
          <Download className="h-3 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <Card className="flex-1 flex flex-col min-h-0">
        <div className="px-6 py-3 border-b border-slate-200 flex-shrink-0">
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
            {selectedReport === "attendance" ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="month"
                      value={fromAttendance}
                      onChange={(e) => setFromAttendance(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="From Date"
                    />
                  </div>
                  <span className="text-slate-500">to</span>
                  <div className="relative">
                    <input
                      type="month"
                      value={toAttendance}
                      min={fromAttendance}
                      onChange={(e) => setToAttendance(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="To Date"
                    />
                  </div>
                </div>
              </div>
            ) : selectedReport !== "employees" ? (
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                options={dateRangeOptions}
                className="w-20"
              />
            ) : null}
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-12 h-full">
              <div className="text-slate-500">Loading report data...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 h-full">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
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
        </div>
      </Card>
    </div>
  );
}
