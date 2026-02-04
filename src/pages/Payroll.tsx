import { useState, useEffect } from 'react';
import { Wallet, Plus, Search, Filter, Download, IndianRupee, TrendingUp } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { formatters } from '../utils/formatters';
import { HrmsEmployeesApi, HrmsEmployee } from '../lib/employeeApi'; // ✅ Employee API import

interface PayrollEmployee {
    id: string;
    employee_code: string;
    first_name: string;
    last_name: string;
    employee_status: string;
}

interface EmployeeSalary {
    employee_id: string;
    monthly_gross: number;
}

interface Payslip {
    id: string;
    employee_id: string;
    period_month: string;
    period_year: number;
    gross_earnings: number;
    total_deductions: number;
    net_salary: number;
    payment_status: string;
}

export default function Payroll() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [allEmployees, setAllEmployees] = useState<PayrollEmployee[]>([]);
    const [salaries, setSalaries] = useState<Record<string, EmployeeSalary>>({});
    const [payslips, setPayslips] = useState<Payslip[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProcessModal, setShowProcessModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);

    // ✅ Fetch all employees on component mount
    useEffect(() => {
        fetchAllEmployees();
    }, []);

    // ✅ Fetch payroll data when month changes
    useEffect(() => {
        if (selectedMonth) {
            fetchPayrollData();
        }
    }, [selectedMonth]);

    // ✅ Function to fetch all employees
    const fetchAllEmployees = async () => {
        try {
            console.log("Fetching all employees for dropdown...");
            const employees = await HrmsEmployeesApi.getEmployees();

            // Transform to PayrollEmployee format
            const payrollEmployees: PayrollEmployee[] = employees.map(emp => ({
                id: emp.id.toString(),
                employee_code: emp.employee_code,
                first_name: emp.first_name,
                last_name: emp.last_name,
                employee_status: emp.employee_status
            }));

            console.log("Fetched employees:", payrollEmployees.length);
            setAllEmployees(payrollEmployees);
        } catch (error) {
            console.error("Error fetching employees:", error);
            // Fallback to empty array
            setAllEmployees([]);
        }
    };

    // ✅ Function to fetch payroll data
    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            // Here you would call your payroll API
            // For now, we'll use the employees data
            console.log("Fetching payroll data for month:", selectedMonth);

            // Mock data - replace with actual API call
            const mockSalaries: Record<string, EmployeeSalary> = {};
            const mockPayslips: Payslip[] = [];

            // Create mock data for each employee
            allEmployees.forEach(emp => {
                mockSalaries[emp.id] = {
                    employee_id: emp.id,
                    monthly_gross: Math.floor(Math.random() * 50000) + 30000
                };

                // Some employees have payslips
                if (Math.random() > 0.5) {
                    mockPayslips.push({
                        id: `payslip-${emp.id}`,
                        employee_id: emp.id,
                        period_month: selectedMonth.split('-')[1],
                        period_year: parseInt(selectedMonth.split('-')[0]),
                        gross_earnings: Math.floor(Math.random() * 50000) + 30000,
                        total_deductions: Math.floor(Math.random() * 10000),
                        net_salary: Math.floor(Math.random() * 45000) + 25000,
                        payment_status: Math.random() > 0.3 ? 'paid' : 'pending'
                    });
                }
            });

            setSalaries(mockSalaries);
            setPayslips(mockPayslips);

        } catch (error) {
            console.error('Error fetching payroll data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Handle process payroll
    const handleProcessPayroll = async () => {
        if (selectedEmployees.length === 0) {
            alert('Please select at least one employee');
            return;
        }

        setProcessing(true);
        try {
            // Here you would call your payroll processing API
            console.log('Processing payroll for:', {
                month: selectedMonth,
                employees: selectedEmployees
            });

            // Mock API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            alert('Payroll processed successfully!');
            setShowProcessModal(false);
            setSelectedEmployees([]);
            fetchPayrollData(); // Refresh data
        } catch (error) {
            console.error('Error processing payroll:', error);
            alert('Failed to process payroll');
        } finally {
            setProcessing(false);
        }
    };

    // ✅ Toggle employee selection
    const toggleEmployeeSelection = (employeeId: string) => {
        setSelectedEmployees(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        );
    };

    // ✅ Select all unprocessed employees
    const selectAllEmployees = () => {
        const unprocessedEmployees = allEmployees
            .filter(emp => {
                const payslip = payslips.find(p => p.employee_id === emp.id);
                return !payslip || payslip.payment_status !== 'paid';
            })
            .map(emp => emp.id);
        setSelectedEmployees(unprocessedEmployees);
    };

    // ✅ Prepare payroll records for table
    const payrollRecords = allEmployees.map(emp => {
        const salary = salaries[emp.id];
        const payslip = payslips.find(p => p.employee_id === emp.id);

        return {
            id: emp.id,
            employee: `${emp.first_name} ${emp.last_name}`,
            code: emp.employee_code,
            salary: salary?.monthly_gross || 0,
            deductions: payslip?.total_deductions || 0,
            net: payslip?.net_salary || (salary?.monthly_gross || 0) * 0.9,
            status: payslip?.payment_status || 'pending',
            payslipId: payslip?.id,
        };
    });

    // ✅ Filter records for search
    const filteredRecords = payrollRecords.filter(record => {
        const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = !statusFilter || record.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // ✅ Calculate totals
    const totalSalary = payrollRecords.reduce((sum, record) => sum + record.salary, 0);
    const totalNet = payrollRecords.reduce((sum, record) => sum + record.net, 0);
    const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);
    const processedCount = payrollRecords.filter(r => r.status === 'paid').length;

    // ✅ Month options for dropdown
    const monthOptions = [];
    for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        monthOptions.push({ value, label });
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Payroll Management</h1>
                    <p className="text-slate-600 mt-1">Manage employee salaries and payments</p>
                </div>
                <Button onClick={() => setShowProcessModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Process Payroll
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Payroll</p>
                            <p className="text-3xl font-bold text-slate-900 mt-2">₹{(totalSalary / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-500 mt-1">This month</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Net Payable</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">₹{(totalNet / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-500 mt-1">After deductions</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <IndianRupee className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Deductions</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">₹{(totalDeductions / 1000).toFixed(0)}K</p>
                            <p className="text-xs text-slate-500 mt-1">Tax + Other</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Processed</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{processedCount}</p>
                            <p className="text-xs text-slate-500 mt-1">of {allEmployees.length} employees</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payroll Table */}
            <Card>
                <div className="p-6 border-b border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">Payroll Records</h2>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={monthOptions}
                            className="w-64"
                        />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search employees..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                            <Button variant="secondary">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-slate-500">Loading payroll data...</div>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Gross Salary</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Deductions</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Net Salary</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                    <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">{record.employee}</p>
                                                <p className="text-sm text-slate-600">{record.code}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-slate-900">{formatters.currency(record.salary)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-red-600">{formatters.currency(record.deductions)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-green-600">{formatters.currency(record.net)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={record.status === 'paid' ? 'success' : record.status === 'pending' ? 'warning' : 'default'}>
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {record.payslipId && (
                                                    <Button variant="secondary" size="sm">
                                                        View Slip
                                                    </Button>
                                                )}
                                                {record.status === 'pending' && (
                                                    <Button size="sm" onClick={() => {
                                                        setSelectedEmployees([record.id]);
                                                        setShowProcessModal(true);
                                                    }}>
                                                        Process
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </Card>

            {/* Process Payroll Modal */}
            <Modal
                isOpen={showProcessModal}
                onClose={() => setShowProcessModal(false)}
                title="Process Payroll"
                size="lg"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleProcessPayroll} loading={processing}>
                            Process {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Select Month
                        </label>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={monthOptions}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-slate-700">
                                Select Employees
                            </label>
                            <Button variant="ghost" size="sm" onClick={selectAllEmployees}>
                                Select All Unprocessed
                            </Button>
                        </div>
                        <div className="border border-slate-300 rounded-lg max-h-96 overflow-y-auto">
                            {allEmployees.map(emp => {
                                const payslip = payslips.find(p => p.employee_id === emp.id);
                                const isPaid = payslip?.payment_status === 'paid';
                                const isSelected = selectedEmployees.includes(emp.id);

                                return (
                                    <label
                                        key={emp.id}
                                        className={`flex items-center gap-3 px-4 py-3 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${isPaid ? 'opacity-50 cursor-not-allowed' : ''
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleEmployeeSelection(emp.id)}
                                            disabled={isPaid}
                                            className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</p>
                                            <p className="text-sm text-slate-600">{emp.employee_code}</p>
                                            <p className="text-xs text-slate-500">Status: {emp.employee_status}</p>
                                        </div>
                                        {isPaid && (
                                            <Badge variant="success">Paid</Badge>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {selectedEmployees.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-red-900">
                                <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''} selected for payroll processing.
                                <br />
                                Payroll will be calculated based on attendance, leaves, and salary structure.
                            </p>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
}