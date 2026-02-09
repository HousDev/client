import { useState, useEffect } from 'react';
import { Plus, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Eye, X, FileText, Download } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FinalizeEmployeeModal from '../components/modals/FinalizeEmployeeModal';

interface PayrollRun {
    id: string;
    pay_month: string;
    pay_year: number;
    status: 'draft' | 'processing' | 'completed' | 'cancelled';
    total_employees: number;
    total_amount: number;
    cycle_start_date: string;
    cycle_end_date: string;
    created_at: string;
    employees: PayrollEmployee[];
}

interface PayrollEmployee {
    id: string;
    employee_code: string;
    name: string;
    department: string;
    designation: string;
    gross_salary: number;
    deductions: number;
    net_salary: number;
    status: 'pending' | 'finalized' | 'paid';
}

const mockEmployees = [
    { id: 'EMP001', code: 'EMP001', name: 'Rajesh Kumar', department: 'IT', designation: 'Senior Developer', monthly_salary: 80000 },
    { id: 'EMP002', code: 'EMP002', name: 'Priya Sharma', department: 'Sales', designation: 'Sales Manager', monthly_salary: 65000 },
    { id: 'EMP003', code: 'EMP003', name: 'Amit Patel', department: 'IT', designation: 'Project Manager', monthly_salary: 95000 },
    { id: 'EMP004', code: 'EMP004', name: 'Sneha Verma', department: 'HR', designation: 'HR Manager', monthly_salary: 70000 },
    { id: 'EMP005', code: 'EMP005', name: 'Vikram Singh', department: 'Finance', designation: 'Financial Analyst', monthly_salary: 72000 },
];

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const initialRuns: PayrollRun[] = [
    {
        id: 'PR001',
        pay_month: 'January',
        pay_year: 2024,
        status: 'completed',
        total_employees: 5,
        total_amount: 345000,
        cycle_start_date: '2024-01-01',
        cycle_end_date: '2024-01-31',
        created_at: '2024-01-25T10:00:00Z',
        employees: mockEmployees.map(emp => ({
            id: emp.id,
            employee_code: emp.code,
            name: emp.name,
            department: emp.department,
            designation: emp.designation,
            gross_salary: emp.monthly_salary,
            deductions: emp.monthly_salary * 0.15,
            net_salary: emp.monthly_salary * 0.85,
            status: 'paid' as const
        }))
    }
];

export default function PayrollSummary() {
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initialRuns);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

    useEffect(() => {
        loadPayrollRuns();
    }, []);

    const loadPayrollRuns = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
    };

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month, 0).getDate();
    };

    const handleCreatePayroll = () => {
        const month = months[selectedMonth - 1];

        const existingRun = payrollRuns.find(
            run => run.pay_month === month && run.pay_year === selectedYear
        );

        if (existingRun) {
            alert(`A payroll run for ${month} ${selectedYear} already exists!`);
            return;
        }

        if (selectedEmployees.length === 0) {
            alert('Please select at least one employee');
            return;
        }

        const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
        const startDate = new Date(selectedYear, selectedMonth - 1, 1);
        const endDate = new Date(selectedYear, selectedMonth - 1, daysInMonth);

        const payrollEmployees: PayrollEmployee[] = selectedEmployees.map(empId => {
            const emp = mockEmployees.find(e => e.id === empId)!;
            const deductions = emp.monthly_salary * 0.15;
            return {
                id: emp.id,
                employee_code: emp.code,
                name: emp.name,
                department: emp.department,
                designation: emp.designation,
                gross_salary: emp.monthly_salary,
                deductions: deductions,
                net_salary: emp.monthly_salary - deductions,
                status: 'pending'
            };
        });

        const newRun: PayrollRun = {
            id: `PR${Date.now()}`,
            pay_month: month,
            pay_year: selectedYear,
            status: 'processing',
            total_employees: payrollEmployees.length,
            total_amount: payrollEmployees.reduce((sum, emp) => sum + emp.net_salary, 0),
            cycle_start_date: startDate.toISOString(),
            cycle_end_date: endDate.toISOString(),
            created_at: new Date().toISOString(),
            employees: payrollEmployees
        };

        setPayrollRuns([newRun, ...payrollRuns]);
        setShowCreateModal(false);
        setSelectedEmployees([]);
        alert(`Payroll run created for ${month} ${selectedYear} successfully!`);
    };

    const handleViewDetails = (run: PayrollRun) => {
        setSelectedRun(run);
        setShowDetailsModal(true);
    };

    const handleFinalizeEmployee = (employee: PayrollEmployee) => {
        setSelectedEmployee(employee);
        setShowFinalizeModal(true);
    };

    const handleFinalizationComplete = () => {
        if (!selectedRun || !selectedEmployee) return;

        setPayrollRuns(runs =>
            runs.map(run => {
                if (run.id === selectedRun.id) {
                    return {
                        ...run,
                        employees: run.employees.map(emp =>
                            emp.id === selectedEmployee.id ? { ...emp, status: 'finalized' as const } : emp
                        )
                    };
                }
                return run;
            })
        );

        setShowFinalizeModal(false);
        setSelectedEmployee(null);
    };

    const handleCompletePayroll = (runId: string) => {
        setPayrollRuns(runs =>
            runs.map(run => {
                if (run.id === runId) {
                    return {
                        ...run,
                        status: 'completed' as const,
                        employees: run.employees.map(emp => ({ ...emp, status: 'paid' as const }))
                    };
                }
                return run;
            })
        );
        setShowDetailsModal(false);
        alert('Payroll run completed successfully!');
    };

    const toggleEmployeeSelection = (empId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
        );
    };

    const selectAllEmployees = () => {
        setSelectedEmployees(mockEmployees.map(emp => emp.id));
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'info';
            case 'draft':
                return 'warning';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getEmployeeStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'finalized':
                return 'info';
            case 'pending':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    const stats = {
        totalRuns: payrollRuns.length,
        activeRuns: payrollRuns.filter(r => r.status === 'processing').length,
        completedRuns: payrollRuns.filter(r => r.status === 'completed').length,
        totalAmount: payrollRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0)
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
                    <p className="text-slate-600 mt-1">Manage monthly payroll runs and salary processing</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Run New Payroll
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Payroll Runs</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalRuns}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Active Runs</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.activeRuns}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Completed Runs</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.completedRuns}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Processed</p>
                            <p className="text-2xl font-bold text-slate-900 mt-2">
                                ₹{(stats.totalAmount / 100000).toFixed(1)}L
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="h-6 w-6 text-slate-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900">Payroll Runs</h2>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-slate-600">Loading payroll runs...</div>
                ) : payrollRuns.length === 0 ? (
                    <div className="p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payroll Runs Yet</h3>
                        <p className="text-slate-600 mb-1">Get started by creating your first payroll run.</p>
                        <p className="text-sm text-slate-500 mb-4">
                            Click the "Run New Payroll" button above to begin processing salaries.
                        </p>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Payroll Run
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Period</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Cycle Dates</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employees</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Total Amount</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {payrollRuns.map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {run.pay_month} {run.pay_year}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                Created {new Date(run.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">
                                                {new Date(run.cycle_start_date).toLocaleDateString()} - {new Date(run.cycle_end_date).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-slate-400" />
                                                <span className="text-sm text-slate-900">{run.total_employees || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="font-medium text-green-600">
                                                ₹{run.total_amount?.toLocaleString() || '0'}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={getStatusColor(run.status)}>
                                                {run.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleViewDetails(run)}
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                                {run.status === 'completed' && (
                                                    <Button size="sm" variant="secondary">
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Report
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create Payroll Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-lg font-semibold text-slate-900">Create New Payroll Run</h2>
                            <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select Month
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {months.map((month, index) => (
                                            <option key={index} value={index + 1}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Select Year
                                    </label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {[2023, 2024, 2025, 2026, 2027].map((year) => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-slate-700">
                                        Select Employees ({selectedEmployees.length} selected)
                                    </label>
                                    <Button size="sm" variant="secondary" onClick={selectAllEmployees}>
                                        Select All
                                    </Button>
                                </div>
                                <div className="border border-slate-300 rounded-lg max-h-80 overflow-y-auto">
                                    {mockEmployees.map(emp => {
                                        const isSelected = selectedEmployees.includes(emp.id);
                                        return (
                                            <div
                                                key={emp.id}
                                                onClick={() => toggleEmployeeSelection(emp.id)}
                                                className={`flex items-center gap-3 px-4 py-3 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : ''
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => { }}
                                                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900">{emp.name}</p>
                                                    <p className="text-xs text-slate-500">
                                                        {emp.code} | {emp.designation} | {emp.department}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-slate-900">
                                                        ₹{emp.monthly_salary.toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-slate-500">Monthly</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-700">
                                    This will create a new payroll run for {months[selectedMonth - 1]} {selectedYear}.
                                    {selectedEmployees.length > 0 && (
                                        <span className="font-medium">
                                            <br />{selectedEmployees.length} employee(s) will be included with a total amount of ₹
                                            {mockEmployees
                                                .filter(e => selectedEmployees.includes(e.id))
                                                .reduce((sum, e) => sum + e.monthly_salary * 0.85, 0)
                                                .toLocaleString()}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
                            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreatePayroll}>
                                Create Payroll Run
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showDetailsModal && selectedRun && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                    {selectedRun.pay_month} {selectedRun.pay_year} Payroll
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                    {new Date(selectedRun.cycle_start_date).toLocaleDateString()} - {new Date(selectedRun.cycle_end_date).toLocaleDateString()}
                                </p>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-blue-600 mb-1">Total Employees</p>
                                    <p className="text-2xl font-bold text-blue-900">{selectedRun.total_employees}</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-green-600 mb-1">Total Amount</p>
                                    <p className="text-2xl font-bold text-green-900">₹{selectedRun.total_amount.toLocaleString()}</p>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-600 mb-1">Pending</p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        {selectedRun.employees.filter(e => e.status === 'pending').length}
                                    </p>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                    <p className="text-sm text-slate-600 mb-1">Status</p>
                                    <Badge variant={getStatusColor(selectedRun.status)} className="mt-1">
                                        {selectedRun.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 mb-3">Employee Salaries</h3>
                                <div className="border border-slate-200 rounded-lg overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900">Employee</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900">Gross</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900">Deductions</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900">Net Salary</th>
                                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900">Status</th>
                                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {selectedRun.employees.map(emp => (
                                                <tr key={emp.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-900 text-sm">{emp.name}</p>
                                                        <p className="text-xs text-slate-600">{emp.employee_code} • {emp.designation}</p>
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-slate-700">
                                                        ₹{emp.gross_salary.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm text-red-600">
                                                        -₹{emp.deductions.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-sm font-semibold text-green-600">
                                                        ₹{emp.net_salary.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <Badge variant={getEmployeeStatusColor(emp.status)} className="text-xs">
                                                            {emp.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        {emp.status === 'pending' && selectedRun.status !== 'completed' && (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                onClick={() => handleFinalizeEmployee(emp)}
                                                            >
                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                Finalize
                                                            </Button>
                                                        )}
                                                        {emp.status === 'paid' && (
                                                            <Button size="sm" variant="secondary">
                                                                <FileText className="h-3 w-3 mr-1" />
                                                                Slip
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
                            {selectedRun.status === 'processing' && (
                                <Button onClick={() => handleCompletePayroll(selectedRun.id)}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Complete Payroll
                                </Button>
                            )}
                            {selectedRun.status === 'completed' && (
                                <Button variant="secondary">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Report
                                </Button>
                            )}
                            <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Finalize Employee Modal */}
            {showFinalizeModal && selectedEmployee && selectedRun && (
                <FinalizeEmployeeModal
                    employee={selectedEmployee}
                    payrollRun={selectedRun}
                    onClose={() => {
                        setShowFinalizeModal(false);
                        setSelectedEmployee(null);
                    }}
                    onFinalize={handleFinalizationComplete}
                />
            )}
        </div>
    );
}
