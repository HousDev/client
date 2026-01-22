import { useEffect, useState } from 'react';
import { Users, Clock, Calendar, Wallet, Receipt, UserPlus, Ticket, TrendingUp, Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
// import { reportAPI } from '../api/report.api';
import { formatters } from '../utils/formatters';

type Module = 'overview' | 'employees' | 'recruitment' | 'attendance' | 'leaves' | 'payroll' | 'expenses' | 'tickets';

export default function Dashboard() {
    const [selectedModule, setSelectedModule] = useState<Module>('overview');
    const [dateFilter, setDateFilter] = useState('this-month');
    const [loading, setLoading] = useState(true);

    const [overviewStats, setOverviewStats] = useState({
        totalEmployees: 0,
        activeEmployees: 0,
        todayAttendance: 0,
        pendingLeaves: 0,
        openTickets: 0,
        pendingExpenses: 0,
        thisMonthPayroll: 0,
        activeRecruitments: 0,
    });

    const [employeesData, setEmployeesData] = useState<any[]>([]);
    const [recruitmentData, setRecruitmentData] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [leavesData, setLeavesData] = useState<any[]>([]);
    const [payrollData, setPayrollData] = useState<any[]>([]);
    const [expensesData, setExpensesData] = useState<any[]>([]);
    const [ticketsData, setTicketsData] = useState<any[]>([]);

    useEffect(() => {
        loadDashboardData();
    }, [selectedModule, dateFilter]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            if (selectedModule === 'overview') {
                const stats = await reportAPI.getDashboardStats();
                setOverviewStats(stats);
            } else {
                setEmployeesData([]);
                setRecruitmentData([]);
                setAttendanceData([]);
                setLeavesData([]);
                setPayrollData([]);
                setExpensesData([]);
                setTicketsData([]);
            }
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const modules = [
        { value: 'overview', label: 'Overview', icon: TrendingUp, color: 'red' },
        { value: 'employees', label: 'Employees', icon: Users, color: 'blue' },
        { value: 'recruitment', label: 'Recruitment', icon: UserPlus, color: 'green' },
        { value: 'attendance', label: 'Attendance', icon: Clock, color: 'purple' },
        { value: 'leaves', label: 'Leaves', icon: Calendar, color: 'yellow' },
        { value: 'payroll', label: 'Payroll', icon: Wallet, color: 'orange' },
        { value: 'expenses', label: 'Expenses', icon: Receipt, color: 'pink' },
        { value: 'tickets', label: 'Tickets', icon: Ticket, color: 'indigo' },
    ];

    const dateFilterOptions = [
        { value: 'today', label: 'Today' },
        { value: 'this-week', label: 'This Week' },
        { value: 'this-month', label: 'This Month' },
        { value: 'last-month', label: 'Last Month' },
        { value: 'this-year', label: 'This Year' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        options={dateFilterOptions}
                        className="w-40"
                    />
                    <Button variant="secondary">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {modules.map((module) => {
                    const Icon = module.icon;
                    const isSelected = selectedModule === module.value;
                    return (
                        <button
                            key={module.value}
                            onClick={() => setSelectedModule(module.value as Module)}
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
                                {module.label}
                            </p>
                        </button>
                    );
                })}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-slate-500">Loading dashboard data...</div>
                </div>
            ) : (
                <>
                    {selectedModule === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Total Employees</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-2">{overviewStats.totalEmployees}</p>
                                        <p className="text-xs text-slate-500 mt-1">Active: {overviewStats.activeEmployees}</p>
                                    </div>
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <Users className="h-6 w-6 text-red-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Today's Attendance</p>
                                        <p className="text-3xl font-bold text-green-600 mt-2">{overviewStats.todayAttendance}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {overviewStats.activeEmployees > 0
                                                ? `${Math.round((overviewStats.todayAttendance / overviewStats.activeEmployees) * 100)}% present`
                                                : '0% present'}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending Leaves</p>
                                        <p className="text-3xl font-bold text-yellow-600 mt-2">{overviewStats.pendingLeaves}</p>
                                        <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
                                    </div>
                                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                        <Calendar className="h-6 w-6 text-yellow-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Open Tickets</p>
                                        <p className="text-3xl font-bold text-purple-600 mt-2">{overviewStats.openTickets}</p>
                                        <p className="text-xs text-slate-500 mt-1">Needs attention</p>
                                    </div>
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Ticket className="h-6 w-6 text-purple-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Pending Expenses</p>
                                        <p className="text-3xl font-bold text-orange-600 mt-2">{overviewStats.pendingExpenses}</p>
                                        <p className="text-xs text-slate-500 mt-1">For approval</p>
                                    </div>
                                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Receipt className="h-6 w-6 text-orange-600" />
                                    </div>
                                </div>
                            </Card>

                            <Card className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-600">Active Recruitments</p>
                                        <p className="text-3xl font-bold text-blue-600 mt-2">{overviewStats.activeRecruitments}</p>
                                        <p className="text-xs text-slate-500 mt-1">Job postings</p>
                                    </div>
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <UserPlus className="h-6 w-6 text-blue-600" />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {selectedModule === 'employees' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Employees Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent 20 active employees</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Code</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Name</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Department</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Position</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Email</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
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
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant="success">Active</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'recruitment' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Recruitment Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent job postings and applications</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Job Title</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Department</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Location</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Posted Date</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {recruitmentData.map((job) => (
                                            <tr key={job.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">{job.job_title}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{job.departments?.name || 'N/A'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{job.location}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{formatters.date(job.posted_date)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant={job.status === 'active' ? 'success' : 'default'}>{job.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'attendance' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Attendance Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent attendance records</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check In</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Check Out</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
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
                                                    <Badge variant={att.status === 'present' ? 'success' : 'danger'}>{att.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'leaves' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Leaves Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent leave applications</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Leave Type</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">From</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">To</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Days</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
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
                                                    <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'danger' : 'warning'}>
                                                        {leave.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'payroll' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Payroll Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent payslips and salary information</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Period</th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Gross</th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Deductions</th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Net</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {payrollData.map((pay) => (
                                            <tr key={pay.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {pay.employees?.first_name} {pay.employees?.last_name}
                                                    <div className="text-xs text-slate-500">{pay.employees?.employee_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(pay.period_month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-right text-slate-900">{formatters.currency(pay.gross_earnings)}</td>
                                                <td className="px-6 py-4 text-sm text-right text-red-600">{formatters.currency(pay.total_deductions)}</td>
                                                <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">{formatters.currency(pay.net_salary)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant={pay.payment_status === 'paid' ? 'success' : 'warning'}>{pay.payment_status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'expenses' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Expenses Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent expense reimbursements</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
                                            <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Amount</th>
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
                                                <td className="px-6 py-4 text-sm text-right text-slate-900">{formatters.currency(expense.amount)}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant={expense.status === 'approved' ? 'success' : expense.status === 'rejected' ? 'danger' : 'warning'}>
                                                        {expense.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {selectedModule === 'tickets' && (
                        <Card>
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-semibold text-slate-900">Tickets Data</h2>
                                <p className="text-sm text-slate-600 mt-1">Recent support tickets</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Subject</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Priority</th>
                                            <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {ticketsData.map((ticket) => (
                                            <tr key={ticket.id} className="hover:bg-slate-50">
                                                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                    {ticket.employees?.first_name} {ticket.employees?.last_name}
                                                    <div className="text-xs text-slate-500">{ticket.employees?.employee_code}</div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{ticket.category}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{ticket.subject}</td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant={ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'info'}>
                                                        {ticket.priority}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <Badge variant={ticket.status === 'closed' ? 'success' : 'warning'}>{ticket.status}</Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
}
