// import { useState, useEffect } from 'react';
// import { FileText, Download, Calendar, Users, Clock, Wallet, Receipt, UserPlus, Ticket } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Select from '../components/ui/Select';
// import { formatters } from '../utils/formatters';

// type ReportType = 'employees' | 'attendance' | 'leaves' | 'payroll' | 'expenses' | 'recruitment' | 'tickets';

// // Mock data for reports
// const mockEmployeesData = [
//     {
//         id: '1',
//         employee_code: 'EMP001',
//         first_name: 'John',
//         last_name: 'Doe',
//         departments: { name: 'IT' },
//         positions: { title: 'Senior Developer' },
//         email: 'john@example.com',
//         date_of_joining: '2023-01-15',
//     },
//     {
//         id: '2',
//         employee_code: 'EMP002',
//         first_name: 'Jane',
//         last_name: 'Smith',
//         departments: { name: 'HR' },
//         positions: { title: 'HR Manager' },
//         email: 'jane@example.com',
//         date_of_joining: '2022-03-20',
//     },
//     {
//         id: '3',
//         employee_code: 'EMP003',
//         first_name: 'Robert',
//         last_name: 'Johnson',
//         departments: { name: 'Finance' },
//         positions: { title: 'Accountant' },
//         email: 'robert@example.com',
//         date_of_joining: '2023-06-10',
//     },
//     {
//         id: '4',
//         employee_code: 'EMP004',
//         first_name: 'Sarah',
//         last_name: 'Williams',
//         departments: { name: 'IT' },
//         positions: { title: 'Frontend Developer' },
//         email: 'sarah@example.com',
//         date_of_joining: '2024-01-05',
//     },
//     {
//         id: '5',
//         employee_code: 'EMP005',
//         first_name: 'Michael',
//         last_name: 'Brown',
//         departments: { name: 'Sales' },
//         positions: { title: 'Sales Executive' },
//         email: 'michael@example.com',
//         date_of_joining: '2022-11-30',
//     },
// ];

// const mockAttendanceData = [
//     {
//         id: '1',
//         employees: { first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
//         date: '2024-01-15',
//         check_in_time: '09:00',
//         check_out_time: '18:00',
//         status: 'present',
//         working_hours: '8',
//     },
//     {
//         id: '2',
//         employees: { first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
//         date: '2024-01-15',
//         check_in_time: '09:15',
//         check_out_time: '17:45',
//         status: 'present',
//         working_hours: '7.5',
//     },
//     {
//         id: '3',
//         employees: { first_name: 'Robert', last_name: 'Johnson', employee_code: 'EMP003' },
//         date: '2024-01-15',
//         check_in_time: null,
//         check_out_time: null,
//         status: 'absent',
//         working_hours: '0',
//     },
//     {
//         id: '4',
//         employees: { first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP004' },
//         date: '2024-01-14',
//         check_in_time: '08:45',
//         check_out_time: '18:30',
//         status: 'present',
//         working_hours: '8.75',
//     },
//     {
//         id: '5',
//         employees: { first_name: 'Michael', last_name: 'Brown', employee_code: 'EMP005' },
//         date: '2024-01-14',
//         check_in_time: '09:30',
//         check_out_time: '19:00',
//         status: 'late',
//         working_hours: '8.5',
//     },
// ];

// const mockLeavesData = [
//     {
//         id: '1',
//         employees: { first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
//         leave_type: 'Casual Leave',
//         from_date: '2024-01-18',
//         to_date: '2024-01-19',
//         total_days: 2,
//         status: 'approved',
//         reason: 'Family function',
//     },
//     {
//         id: '2',
//         employees: { first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
//         leave_type: 'Sick Leave',
//         from_date: '2024-01-16',
//         to_date: '2024-01-16',
//         total_days: 1,
//         status: 'approved',
//         reason: 'Medical appointment',
//     },
//     {
//         id: '3',
//         employees: { first_name: 'Robert', last_name: 'Johnson', employee_code: 'EMP003' },
//         leave_type: 'Annual Leave',
//         from_date: '2024-01-22',
//         to_date: '2024-01-26',
//         total_days: 5,
//         status: 'pending',
//         reason: 'Vacation',
//     },
//     {
//         id: '4',
//         employees: { first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP004' },
//         leave_type: 'Maternity Leave',
//         from_date: '2024-02-01',
//         to_date: '2024-04-01',
//         total_days: 60,
//         status: 'approved',
//         reason: 'Maternity leave',
//     },
//     {
//         id: '5',
//         employees: { first_name: 'Michael', last_name: 'Brown', employee_code: 'EMP005' },
//         leave_type: 'Casual Leave',
//         from_date: '2024-01-12',
//         to_date: '2024-01-12',
//         total_days: 1,
//         status: 'rejected',
//         reason: 'Personal work',
//     },
// ];

// const mockPayrollData = [
//     {
//         id: '1',
//         employees: { first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
//         period_month: '2024-01-01',
//         gross_earnings: 75000,
//         total_deductions: 15000,
//         net_salary: 60000,
//         payment_status: 'paid',
//     },
//     {
//         id: '2',
//         employees: { first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
//         period_month: '2024-01-01',
//         gross_earnings: 85000,
//         total_deductions: 17000,
//         net_salary: 68000,
//         payment_status: 'paid',
//     },
//     {
//         id: '3',
//         employees: { first_name: 'Robert', last_name: 'Johnson', employee_code: 'EMP003' },
//         period_month: '2024-01-01',
//         gross_earnings: 65000,
//         total_deductions: 13000,
//         net_salary: 52000,
//         payment_status: 'pending',
//     },
//     {
//         id: '4',
//         employees: { first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP004' },
//         period_month: '2024-01-01',
//         gross_earnings: 95000,
//         total_deductions: 19000,
//         net_salary: 76000,
//         payment_status: 'paid',
//     },
//     {
//         id: '5',
//         employees: { first_name: 'Michael', last_name: 'Brown', employee_code: 'EMP005' },
//         period_month: '2024-01-01',
//         gross_earnings: 55000,
//         total_deductions: 11000,
//         net_salary: 44000,
//         payment_status: 'paid',
//     },
// ];

// const mockExpensesData = [
//     {
//         id: '1',
//         employees: { first_name: 'John', last_name: 'Doe', employee_code: 'EMP001' },
//         category: 'Travel',
//         description: 'Client meeting travel expenses',
//         amount: 5000,
//         submitted_date: '2024-01-15',
//         status: 'approved',
//     },
//     {
//         id: '2',
//         employees: { first_name: 'Jane', last_name: 'Smith', employee_code: 'EMP002' },
//         category: 'Meals',
//         description: 'Team lunch meeting',
//         amount: 2500,
//         submitted_date: '2024-01-14',
//         status: 'approved',
//     },
//     {
//         id: '3',
//         employees: { first_name: 'Robert', last_name: 'Johnson', employee_code: 'EMP003' },
//         category: 'Office Supplies',
//         description: 'Printer ink and paper',
//         amount: 1200,
//         submitted_date: '2024-01-13',
//         status: 'pending',
//     },
//     {
//         id: '4',
//         employees: { first_name: 'Sarah', last_name: 'Williams', employee_code: 'EMP004' },
//         category: 'Software',
//         description: 'Annual subscription for design tool',
//         amount: 15000,
//         submitted_date: '2024-01-12',
//         status: 'rejected',
//     },
//     {
//         id: '5',
//         employees: { first_name: 'Michael', last_name: 'Brown', employee_code: 'EMP005' },
//         category: 'Travel',
//         description: 'Conference travel and accommodation',
//         amount: 8000,
//         submitted_date: '2024-01-10',
//         status: 'approved',
//     },
// ];

// export default function Reports() {
//     const [selectedReport, setSelectedReport] = useState<ReportType>('employees');
//     const [dateRange, setDateRange] = useState('this-month');
//     const [employeesData, setEmployeesData] = useState<any[]>(mockEmployeesData);
//     const [attendanceData, setAttendanceData] = useState<any[]>(mockAttendanceData);
//     const [leavesData, setLeavesData] = useState<any[]>(mockLeavesData);
//     const [payrollData, setPayrollData] = useState<any[]>(mockPayrollData);
//     const [expensesData, setExpensesData] = useState<any[]>(mockExpensesData);
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         fetchReportData();
//     }, [selectedReport, dateRange]);

//     const fetchReportData = async () => {
//         setLoading(true);
//         try {
//             // Mock loading with timeout
//             await new Promise(resolve => setTimeout(resolve, 500));

//             // Filter data based on date range (simulated)
//             if (selectedReport === 'employees') {
//                 setEmployeesData(mockEmployeesData);
//             } else if (selectedReport === 'attendance') {
//                 setAttendanceData(mockAttendanceData);
//             } else if (selectedReport === 'leaves') {
//                 setLeavesData(mockLeavesData);
//             } else if (selectedReport === 'payroll') {
//                 setPayrollData(mockPayrollData);
//             } else if (selectedReport === 'expenses') {
//                 setExpensesData(mockExpensesData);
//             }
//         } catch (error) {
//             console.error('Error fetching report data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleExport = () => {
//         setLoading(true);
//         // Mock export with timeout
//         setTimeout(() => {
//             const reportName = reportTypes.find(t => t.value === selectedReport)?.label;
//             alert(`"${reportName}" exported to Excel successfully! The download will start shortly.`);
//             setLoading(false);
//         }, 1000);
//     };

//     const reportTypes = [
//         { value: 'employees', label: 'Employees Report', icon: Users, color: 'red' },
//         { value: 'attendance', label: 'Attendance Report', icon: Clock, color: 'green' },
//         { value: 'leaves', label: 'Leaves Report', icon: Calendar, color: 'yellow' },
//         { value: 'payroll', label: 'Payroll Report', icon: Wallet, color: 'purple' },
//         { value: 'expenses', label: 'Expenses Report', icon: Receipt, color: 'orange' },
//         { value: 'recruitment', label: 'Recruitment Report', icon: UserPlus, color: 'blue' },
//         { value: 'tickets', label: 'Tickets Report', icon: Ticket, color: 'pink' },
//     ];

//     const dateRangeOptions = [
//         { value: 'today', label: 'Today' },
//         { value: 'this-week', label: 'This Week' },
//         { value: 'this-month', label: 'This Month' },
//         { value: 'last-month', label: 'Last Month' },
//         { value: 'this-quarter', label: 'This Quarter' },
//         { value: 'this-year', label: 'This Year' },
//     ];

//     const renderEmployeesReport = () => (
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee Code</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Name</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Department</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Position</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Email</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Join Date</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                     {employeesData.map((emp) => (
//                         <tr key={emp.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-4 text-sm text-slate-900">{emp.employee_code}</td>
//                             <td className="px-6 py-4 text-sm font-medium text-slate-900">{emp.first_name} {emp.last_name}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{emp.departments?.name || 'N/A'}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{emp.positions?.title || 'N/A'}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(emp.date_of_joining)}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const renderAttendanceReport = () => (
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Working Hours</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                     {attendanceData.map((att) => (
//                         <tr key={att.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                                 {att.employees?.first_name} {att.employees?.last_name}
//                                 <div className="text-xs text-slate-500">{att.employees?.employee_code}</div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(att.date)}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{att.check_in_time || 'N/A'}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{att.check_out_time || 'N/A'}</td>
//                             <td className="px-6 py-4 text-sm">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${att.status === 'present' ? 'bg-green-100 text-green-700' :
//                                         att.status === 'absent' ? 'bg-red-100 text-red-700' :
//                                             'bg-yellow-100 text-yellow-700'
//                                     }`}>
//                                     {att.status}
//                                 </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{att.working_hours || '0'} hrs</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const renderLeavesReport = () => (
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Leave Type</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">From Date</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">To Date</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Days</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Reason</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                     {leavesData.map((leave) => (
//                         <tr key={leave.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                                 {leave.employees?.first_name} {leave.employees?.last_name}
//                                 <div className="text-xs text-slate-500">{leave.employees?.employee_code}</div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{leave.leave_type}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(leave.from_date)}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(leave.to_date)}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{leave.total_days}</td>
//                             <td className="px-6 py-4 text-sm">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
//                                         leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
//                                             'bg-yellow-100 text-yellow-700'
//                                     }`}>
//                                     {leave.status}
//                                 </span>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const renderPayrollReport = () => (
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Period</th>
//                         <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Gross Salary</th>
//                         <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Deductions</th>
//                         <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Net Salary</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                     {payrollData.map((payslip) => (
//                         <tr key={payslip.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                                 {payslip.employees?.first_name} {payslip.employees?.last_name}
//                                 <div className="text-xs text-slate-500">{payslip.employees?.employee_code}</div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">
//                                 {new Date(payslip.period_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right text-slate-900">
//                                 {formatters.currency(payslip.gross_earnings)}
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right text-red-600">
//                                 {formatters.currency(payslip.total_deductions)}
//                             </td>
//                             <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
//                                 {formatters.currency(payslip.net_salary)}
//                             </td>
//                             <td className="px-6 py-4 text-sm">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${payslip.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
//                                         'bg-yellow-100 text-yellow-700'
//                                     }`}>
//                                     {payslip.payment_status}
//                                 </span>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     const renderExpensesReport = () => (
//         <div className="overflow-x-auto">
//             <table className="w-full">
//                 <thead className="bg-slate-50 border-b border-slate-200">
//                     <tr>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
//                         <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Amount</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
//                         <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                     </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-200">
//                     {expensesData.map((expense) => (
//                         <tr key={expense.id} className="hover:bg-slate-50">
//                             <td className="px-6 py-4 text-sm font-medium text-slate-900">
//                                 {expense.employees?.first_name} {expense.employees?.last_name}
//                                 <div className="text-xs text-slate-500">{expense.employees?.employee_code}</div>
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{expense.category}</td>
//                             <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{expense.description}</td>
//                             <td className="px-6 py-4 text-sm text-right text-slate-900">
//                                 {formatters.currency(expense.amount)}
//                             </td>
//                             <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(expense.submitted_date)}</td>
//                             <td className="px-6 py-4 text-sm">
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'approved' ? 'bg-green-100 text-green-700' :
//                                         expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
//                                             'bg-yellow-100 text-yellow-700'
//                                     }`}>
//                                     {expense.status}
//                                 </span>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <Button onClick={handleExport} disabled={loading}>
//                     <Download className="h-4 w-4 mr-2" />
//                     {loading ? 'Exporting...' : 'Export to Excel'}
//                 </Button>
//             </div>

//             <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
//                 {reportTypes.map((type) => {
//                     const Icon = type.icon;
//                     const isSelected = selectedReport === type.value;
//                     return (
//                         <button
//                             key={type.value}
//                             onClick={() => setSelectedReport(type.value as ReportType)}
//                             className={`p-4 rounded-lg border-2 transition-all ${isSelected
//                                     ? `border-${type.color}-500 bg-${type.color}-50`
//                                     : 'border-slate-200 hover:border-slate-300 bg-white'
//                                 }`}
//                         >
//                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isSelected ? `bg-${type.color}-100` : 'bg-slate-100'
//                                 }`}>
//                                 <Icon className={`h-5 w-5 ${isSelected ? `text-${type.color}-600` : 'text-slate-600'}`} />
//                             </div>
//                             <p className={`text-xs font-medium ${isSelected ? `text-${type.color}-900` : 'text-slate-900'}`}>
//                                 {type.label.replace(' Report', '')}
//                             </p>
//                         </button>
//                     );
//                 })}
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <FileText className="h-6 w-6 text-red-600" />
//                             <div>
//                                 <h2 className="text-xl font-semibold text-slate-900">
//                                     {reportTypes.find(t => t.value === selectedReport)?.label}
//                                 </h2>
//                                 <p className="text-sm text-slate-600">Detailed data for selected module</p>
//                             </div>
//                         </div>
//                         <Select
//                             value={dateRange}
//                             onChange={(e) => setDateRange(e.target.value)}
//                             options={dateRangeOptions}
//                             className="w-48"
//                         />
//                     </div>
//                 </div>

//                 {loading ? (
//                     <div className="flex items-center justify-center py-12">
//                         <div className="text-slate-500">Loading report data...</div>
//                     </div>
//                 ) : (
//                     <div>
//                         {selectedReport === 'employees' && renderEmployeesReport()}
//                         {selectedReport === 'attendance' && renderAttendanceReport()}
//                         {selectedReport === 'leaves' && renderLeavesReport()}
//                         {selectedReport === 'payroll' && renderPayrollReport()}
//                         {selectedReport === 'expenses' && renderExpensesReport()}
//                         {(selectedReport === 'recruitment' || selectedReport === 'tickets') && (
//                             <div className="p-6 text-center">
//                                 <div className="inline-flex flex-col items-center justify-center max-w-sm">
//                                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//                                         {selectedReport === 'recruitment' ? (
//                                             <UserPlus className="h-8 w-8 text-blue-600" />
//                                         ) : (
//                                             <Ticket className="h-8 w-8 text-blue-600" />
//                                         )}
//                                     </div>
//                                     <h3 className="text-lg font-semibold text-slate-900 mb-2">
//                                         {selectedReport === 'recruitment' ? 'Recruitment Report' : 'Tickets Report'}
//                                     </h3>
//                                     <p className="text-slate-600">
//                                         This report is currently under development. It will be available in the next update.
//                                     </p>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </Card>
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Users, Clock, Wallet, Receipt, UserPlus, Ticket } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
// import { reportAPI } from '../api/report.api';
import { formatters } from '../utils/formatters';

type ReportType = 'employees' | 'attendance' | 'leaves' | 'payroll' | 'expenses' | 'recruitment' | 'tickets';

export default function Reports() {
    const [selectedReport, setSelectedReport] = useState<ReportType>('employees');
    const [dateRange, setDateRange] = useState('this-month');
    const [employeesData, setEmployeesData] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [leavesData, setLeavesData] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [expensesData, setExpensesData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReportData();
    }, [selectedReport, dateRange]);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const data = await reportAPI.getReport(selectedReport, dateRange);

            if (selectedReport === 'employees') {
                setEmployeesData(data || []);
            } else if (selectedReport === 'attendance') {
                setAttendanceData(data || []);
            } else if (selectedReport === 'leaves') {
                setLeavesData(data || []);
            } else if (selectedReport === 'payroll') {
                setPayrollData(data || []);
            } else if (selectedReport === 'expenses') {
                setExpensesData(data || []);
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
        } finally {
            setLoading(false);
        }
    };

    const reportTypes = [
        { value: 'employees', label: 'Employees Report', icon: Users, color: 'red' },
        { value: 'attendance', label: 'Attendance Report', icon: Clock, color: 'green' },
        { value: 'leaves', label: 'Leaves Report', icon: Calendar, color: 'yellow' },
        { value: 'payroll', label: 'Payroll Report', icon: Wallet, color: 'purple' },
        { value: 'expenses', label: 'Expenses Report', icon: Receipt, color: 'orange' },
        { value: 'recruitment', label: 'Recruitment Report', icon: UserPlus, color: 'blue' },
        { value: 'tickets', label: 'Tickets Report', icon: Ticket, color: 'pink' },
    ];

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'this-week', label: 'This Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'last-month', label: 'Last Month' },
        { value: 'this-quarter', label: 'This Quarter' },
        { value: 'this-year', label: 'This Year' },
    ];

    const renderEmployeesReport = () => (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee Code</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Name</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Department</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Position</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Join Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {employeesData.map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm text-slate-900">{emp.employee_code}</td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">{emp.first_name} {emp.last_name}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{emp.departments?.name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{emp.positions?.title || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{emp.email}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(emp.date_of_joining)}</td>
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Working Hours</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {attendanceData.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {att.employees?.first_name} {att.employees?.last_name}
                                <div className="text-xs text-slate-500">{att.employees?.employee_code}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(att.date)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{att.check_in_time || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{att.check_out_time || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${att.status === 'present' ? 'bg-green-100 text-green-700' :
                                        att.status === 'absent' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {att.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{att.working_hours || '0'} hrs</td>
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Leave Type</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">From Date</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">To Date</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Days</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Reason</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {leavesData.map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {leave.employees?.first_name} {leave.employees?.last_name}
                                <div className="text-xs text-slate-500">{leave.employees?.employee_code}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{leave.leave_type}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(leave.from_date)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(leave.to_date)}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">{leave.total_days}</td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {leave.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{leave.reason}</td>
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Period</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Gross Salary</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Deductions</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Net Salary</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {payrollData.map((payslip) => (
                        <tr key={payslip.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {payslip.employees?.first_name} {payslip.employees?.last_name}
                                <div className="text-xs text-slate-500">{payslip.employees?.employee_code}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {new Date(payslip.period_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${payslip.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
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
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Amount</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {expensesData.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                {expense.employees?.first_name} {expense.employees?.last_name}
                                <div className="text-xs text-slate-500">{expense.employees?.employee_code}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{expense.category}</td>
                            <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{expense.description}</td>
                            <td className="px-6 py-4 text-sm text-right text-slate-900">
                                {formatters.currency(expense.amount)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(expense.submitted_date)}</td>
                            <td className="px-6 py-4 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {expense.status}
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
                    <p className="text-slate-600 mt-1">Generate comprehensive reports for all modules</p>
                </div>
                <Button>
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
                            className={`p-4 rounded-lg border-2 transition-all ${isSelected
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${isSelected ? 'bg-red-100' : 'bg-slate-100'
                                }`}>
                                <Icon className={`h-5 w-5 ${isSelected ? 'text-red-600' : 'text-slate-600'}`} />
                            </div>
                            <p className={`text-xs font-medium ${isSelected ? 'text-red-900' : 'text-slate-900'}`}>
                                {type.label.replace(' Report', '')}
                            </p>
                        </button>
                    );
                })}
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-red-600" />
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">
                                    {reportTypes.find(t => t.value === selectedReport)?.label}
                                </h2>
                                <p className="text-sm text-slate-600">Detailed data for selected module</p>
                            </div>
                        </div>
                        <Select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            options={dateRangeOptions}
                            className="w-48"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-slate-500">Loading report data...</div>
                    </div>
                ) : (
                    <div>
                        {selectedReport === 'employees' && renderEmployeesReport()}
                        {selectedReport === 'attendance' && renderAttendanceReport()}
                        {selectedReport === 'leaves' && renderLeavesReport()}
                        {selectedReport === 'payroll' && renderPayrollReport()}
                        {selectedReport === 'expenses' && renderExpensesReport()}
                        {(selectedReport === 'recruitment' || selectedReport === 'tickets') && (
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
