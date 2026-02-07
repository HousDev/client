// import { useState, useEffect } from 'react';
// import { Wallet, Plus, Search, Filter, Download, IndianRupee, TrendingUp } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import Modal from '../components/ui/Modal';
// import Select from '../components/ui/Select';
// import { formatters } from '../utils/formatters';
// import { HrmsEmployeesApi, HrmsEmployee } from '../lib/employeeApi'; // ✅ Employee API import

// interface PayrollEmployee {
//     id: string;
//     employee_code: string;
//     first_name: string;
//     last_name: string;
//     employee_status: string;
// }

// interface EmployeeSalary {
//     employee_id: string;
//     monthly_gross: number;
// }

// interface Payslip {
//     id: string;
//     employee_id: string;
//     period_month: string;
//     period_year: number;
//     gross_earnings: number;
//     total_deductions: number;
//     net_salary: number;
//     payment_status: string;
// }

// export default function Payroll() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [allEmployees, setAllEmployees] = useState<PayrollEmployee[]>([]);
//     const [salaries, setSalaries] = useState<Record<string, EmployeeSalary>>({});
//     const [payslips, setPayslips] = useState<Payslip[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [showProcessModal, setShowProcessModal] = useState(false);
//     const [selectedMonth, setSelectedMonth] = useState(() => {
//         const now = new Date();
//         return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
//     });
//     const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
//     const [processing, setProcessing] = useState(false);

//     // ✅ Fetch all employees on component mount
//     useEffect(() => {
//         fetchAllEmployees();
//     }, []);

//     // ✅ Fetch payroll data when month changes
//     useEffect(() => {
//         if (selectedMonth) {
//             fetchPayrollData();
//         }
//     }, [selectedMonth]);

//     // ✅ Function to fetch all employees
//     const fetchAllEmployees = async () => {
//         try {
//             console.log("Fetching all employees for dropdown...");
//             const employees = await HrmsEmployeesApi.getEmployees();

//             // Transform to PayrollEmployee format
//             const payrollEmployees: PayrollEmployee[] = employees.map(emp => ({
//                 id: emp.id.toString(),
//                 employee_code: emp.employee_code,
//                 first_name: emp.first_name,
//                 last_name: emp.last_name,
//                 employee_status: emp.employee_status
//             }));

//             console.log("Fetched employees:", payrollEmployees.length);
//             setAllEmployees(payrollEmployees);
//         } catch (error) {
//             console.error("Error fetching employees:", error);
//             // Fallback to empty array
//             setAllEmployees([]);
//         }
//     };

//     // ✅ Function to fetch payroll data
//     const fetchPayrollData = async () => {
//         setLoading(true);
//         try {
//             // Here you would call your payroll API
//             // For now, we'll use the employees data
//             console.log("Fetching payroll data for month:", selectedMonth);

//             // Mock data - replace with actual API call
//             const mockSalaries: Record<string, EmployeeSalary> = {};
//             const mockPayslips: Payslip[] = [];

//             // Create mock data for each employee
//             allEmployees.forEach(emp => {
//                 mockSalaries[emp.id] = {
//                     employee_id: emp.id,
//                     monthly_gross: Math.floor(Math.random() * 50000) + 30000
//                 };

//                 // Some employees have payslips
//                 if (Math.random() > 0.5) {
//                     mockPayslips.push({
//                         id: `payslip-${emp.id}`,
//                         employee_id: emp.id,
//                         period_month: selectedMonth.split('-')[1],
//                         period_year: parseInt(selectedMonth.split('-')[0]),
//                         gross_earnings: Math.floor(Math.random() * 50000) + 30000,
//                         total_deductions: Math.floor(Math.random() * 10000),
//                         net_salary: Math.floor(Math.random() * 45000) + 25000,
//                         payment_status: Math.random() > 0.3 ? 'paid' : 'pending'
//                     });
//                 }
//             });

//             setSalaries(mockSalaries);
//             setPayslips(mockPayslips);

//         } catch (error) {
//             console.error('Error fetching payroll data:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // ✅ Handle process payroll
//     const handleProcessPayroll = async () => {
//         if (selectedEmployees.length === 0) {
//             alert('Please select at least one employee');
//             return;
//         }

//         setProcessing(true);
//         try {
//             // Here you would call your payroll processing API
//             console.log('Processing payroll for:', {
//                 month: selectedMonth,
//                 employees: selectedEmployees
//             });

//             // Mock API call delay
//             await new Promise(resolve => setTimeout(resolve, 1500));

//             alert('Payroll processed successfully!');
//             setShowProcessModal(false);
//             setSelectedEmployees([]);
//             fetchPayrollData(); // Refresh data
//         } catch (error) {
//             console.error('Error processing payroll:', error);
//             alert('Failed to process payroll');
//         } finally {
//             setProcessing(false);
//         }
//     };

//     // ✅ Toggle employee selection
//     const toggleEmployeeSelection = (employeeId: string) => {
//         setSelectedEmployees(prev =>
//             prev.includes(employeeId)
//                 ? prev.filter(id => id !== employeeId)
//                 : [...prev, employeeId]
//         );
//     };

//     // ✅ Select all unprocessed employees
//     const selectAllEmployees = () => {
//         const unprocessedEmployees = allEmployees
//             .filter(emp => {
//                 const payslip = payslips.find(p => p.employee_id === emp.id);
//                 return !payslip || payslip.payment_status !== 'paid';
//             })
//             .map(emp => emp.id);
//         setSelectedEmployees(unprocessedEmployees);
//     };

//     // ✅ Prepare payroll records for table
//     const payrollRecords = allEmployees.map(emp => {
//         const salary = salaries[emp.id];
//         const payslip = payslips.find(p => p.employee_id === emp.id);

//         return {
//             id: emp.id,
//             employee: `${emp.first_name} ${emp.last_name}`,
//             code: emp.employee_code,
//             salary: salary?.monthly_gross || 0,
//             deductions: payslip?.total_deductions || 0,
//             net: payslip?.net_salary || (salary?.monthly_gross || 0) * 0.9,
//             status: payslip?.payment_status || 'pending',
//             payslipId: payslip?.id,
//         };
//     });

//     // ✅ Filter records for search
//     const filteredRecords = payrollRecords.filter(record => {
//         const matchesSearch = record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             record.code.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = !statusFilter || record.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     // ✅ Calculate totals
//     const totalSalary = payrollRecords.reduce((sum, record) => sum + record.salary, 0);
//     const totalNet = payrollRecords.reduce((sum, record) => sum + record.net, 0);
//     const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);
//     const processedCount = payrollRecords.filter(r => r.status === 'paid').length;

//     // ✅ Month options for dropdown
//     const monthOptions = [];
//     for (let i = 0; i < 12; i++) {
//         const date = new Date();
//         date.setMonth(date.getMonth() - i);
//         const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
//         const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//         monthOptions.push({ value, label });
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
                
//                 <Button onClick={() => setShowProcessModal(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Process Payroll
//                 </Button>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Total Payroll</p>
//                             <p className="text-3xl font-bold text-slate-900 mt-2">₹{(totalSalary / 1000).toFixed(0)}K</p>
//                             <p className="text-xs text-slate-500 mt-1">This month</p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <Wallet className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Net Payable</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">₹{(totalNet / 1000).toFixed(0)}K</p>
//                             <p className="text-xs text-slate-500 mt-1">After deductions</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <IndianRupee className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Deductions</p>
//                             <p className="text-3xl font-bold text-red-600 mt-2">₹{(totalDeductions / 1000).toFixed(0)}K</p>
//                             <p className="text-xs text-slate-500 mt-1">Tax + Other</p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <TrendingUp className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Processed</p>
//                             <p className="text-3xl font-bold text-purple-600 mt-2">{processedCount}</p>
//                             <p className="text-xs text-slate-500 mt-1">of {allEmployees.length} employees</p>
//                         </div>
//                         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                             <Wallet className="h-6 w-6 text-purple-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             {/* Payroll Table */}
//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <div className="flex items-center justify-between mb-4">
//                         <h2 className="text-xl font-semibold text-slate-900">Payroll Records</h2>
//                         <Select
//                             value={selectedMonth}
//                             onChange={(e) => setSelectedMonth(e.target.value)}
//                             options={monthOptions}
//                             className="w-64"
//                         />
//                     </div>
//                     <div className="flex items-center justify-between gap-4">
//                         <div className="flex-1 max-w-md">
                            
//                         </div>
//                         <div className="flex gap-2">
                           
//                             <Button variant="secondary">
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Export
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     {loading ? (
//                         <div className="flex items-center justify-center py-12">
//                             <div className="text-slate-500">Loading payroll data...</div>
//                         </div>
//                     ) : (
//                         <table className="w-full">
//                             <thead className="bg-slate-50 border-b border-slate-200">
//                                 <tr>
//                                     <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                     <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Gross Salary</th>
//                                     <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Deductions</th>
//                                     <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Net Salary</th>
//                                     <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                     <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-slate-200">
//                                 {filteredRecords.map((record) => (
//                                     <tr key={record.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-6 py-4">
//                                             <div>
//                                                 <p className="font-medium text-slate-900">{record.employee}</p>
//                                                 <p className="text-sm text-slate-600">{record.code}</p>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <span className="text-sm text-slate-900">{formatters.currency(record.salary)}</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <span className="text-sm text-red-600">{formatters.currency(record.deductions)}</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <span className="text-sm font-semibold text-green-600">{formatters.currency(record.net)}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <Badge variant={record.status === 'paid' ? 'success' : record.status === 'pending' ? 'warning' : 'default'}>
//                                                 {record.status}
//                                             </Badge>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 {record.payslipId && (
//                                                     <Button variant="secondary" size="sm">
//                                                         View Slip
//                                                     </Button>
//                                                 )}
//                                                 {record.status === 'pending' && (
//                                                     <Button size="sm" onClick={() => {
//                                                         setSelectedEmployees([record.id]);
//                                                         setShowProcessModal(true);
//                                                     }}>
//                                                         Process
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     )}
//                 </div>
//             </Card>

//             {/* Process Payroll Modal */}
//             <Modal
//                 isOpen={showProcessModal}
//                 onClose={() => setShowProcessModal(false)}
//                 title="Process Payroll"
//                 size="lg"
//                 footer={
//                     <>
//                         <Button variant="secondary" onClick={() => setShowProcessModal(false)}>
//                             Cancel
//                         </Button>
//                         <Button onClick={handleProcessPayroll} loading={processing}>
//                             Process {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
//                         </Button>
//                     </>
//                 }
//             >
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                             Select Month
//                         </label>
//                         <Select
//                             value={selectedMonth}
//                             onChange={(e) => setSelectedMonth(e.target.value)}
//                             options={monthOptions}
//                         />
//                     </div>

//                     <div>
//                         <div className="flex items-center justify-between mb-2">
//                             <label className="block text-sm font-medium text-slate-700">
//                                 Select Employees
//                             </label>
//                             <Button variant="ghost" size="sm" onClick={selectAllEmployees}>
//                                 Select All Unprocessed
//                             </Button>
//                         </div>
//                         <div className="border border-slate-300 rounded-lg max-h-96 overflow-y-auto">
//                             {allEmployees.map(emp => {
//                                 const payslip = payslips.find(p => p.employee_id === emp.id);
//                                 const isPaid = payslip?.payment_status === 'paid';
//                                 const isSelected = selectedEmployees.includes(emp.id);

//                                 return (
//                                     <label
//                                         key={emp.id}
//                                         className={`flex items-center gap-3 px-4 py-3 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${isPaid ? 'opacity-50 cursor-not-allowed' : ''
//                                             }`}
//                                     >
//                                         <input
//                                             type="checkbox"
//                                             checked={isSelected}
//                                             onChange={() => toggleEmployeeSelection(emp.id)}
//                                             disabled={isPaid}
//                                             className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500"
//                                         />
//                                         <div className="flex-1">
//                                             <p className="font-medium text-slate-900">{emp.first_name} {emp.last_name}</p>
//                                             <p className="text-sm text-slate-600">{emp.employee_code}</p>
//                                             <p className="text-xs text-slate-500">Status: {emp.employee_status}</p>
//                                         </div>
//                                         {isPaid && (
//                                             <Badge variant="success">Paid</Badge>
//                                         )}
//                                     </label>
//                                 );
//                             })}
//                         </div>
//                     </div>

//                     {selectedEmployees.length > 0 && (
//                         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//                             <p className="text-sm text-red-900">
//                                 <strong>{selectedEmployees.length}</strong> employee{selectedEmployees.length !== 1 ? 's' : ''} selected for payroll processing.
//                                 <br />
//                                 Payroll will be calculated based on attendance, leaves, and salary structure.
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </Modal>
//         </div>
//     );
// }


import { useState, useEffect } from 'react';
import { Wallet, Plus, Search, Filter, Download, IndianRupee, TrendingUp, CheckSquare, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';
import { formatters } from '../utils/formatters';
import { HrmsEmployeesApi, HrmsEmployee } from '../lib/employeeApi';

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
    
    // New states for bulk selection
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [searchEmployee, setSearchEmployee] = useState('');
    const [searchCode, setSearchCode] = useState('');

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
            setAllEmployees([]);
        }
    };

    // ✅ Function to fetch payroll data
    const fetchPayrollData = async () => {
        setLoading(true);
        try {
            console.log("Fetching payroll data for month:", selectedMonth);

            // Mock data
            const mockSalaries: Record<string, EmployeeSalary> = {};
            const mockPayslips: Payslip[] = [];

            allEmployees.forEach(emp => {
                mockSalaries[emp.id] = {
                    employee_id: emp.id,
                    monthly_gross: Math.floor(Math.random() * 50000) + 30000
                };

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
            console.log('Processing payroll for:', {
                month: selectedMonth,
                employees: selectedEmployees
            });

            await new Promise(resolve => setTimeout(resolve, 1500));

            alert('Payroll processed successfully!');
            setShowProcessModal(false);
            setSelectedEmployees([]);
            fetchPayrollData();
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

    // ✅ Bulk selection handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(filteredRecords.map((record) => record.id));
            setSelectedItems(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
        setSelectAll(newSelected.size === filteredRecords.length);
    };

    // ✅ Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setSearchEmployee('');
        setSearchCode('');
    };

    // ✅ Prepare payroll records for table
    const payrollRecords = allEmployees.map(emp => {
        const salary = salaries[emp.id];
        const payslip = payslips.find(p => p.employee_id === emp.id);

        return {
            id: emp.id,
            employee: `${emp.first_name} ${emp.last_name}`,
            code: emp.employee_code,
            status: emp.employee_status,
            salary: salary?.monthly_gross || 0,
            deductions: payslip?.total_deductions || 0,
            net: payslip?.net_salary || (salary?.monthly_gross || 0) * 0.9,
            paymentStatus: payslip?.payment_status || 'pending',
            payslipId: payslip?.id,
        };
    });

    // ✅ Filter records for search
    const filteredRecords = payrollRecords.filter(record => {
        const matchesSearch = searchTerm 
            ? record.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
              record.code.toLowerCase().includes(searchTerm.toLowerCase())
            : true;
        const matchesEmployee = searchEmployee
            ? record.employee.toLowerCase().includes(searchEmployee.toLowerCase())
            : true;
        const matchesCode = searchCode
            ? record.code.toLowerCase().includes(searchCode.toLowerCase())
            : true;
        const matchesStatus = !statusFilter || record.paymentStatus === statusFilter;
        return matchesSearch && matchesStatus && matchesEmployee && matchesCode;
    });

    // ✅ Calculate totals
    const totalSalary = payrollRecords.reduce((sum, record) => sum + record.salary, 0);
    const totalNet = payrollRecords.reduce((sum, record) => sum + record.net, 0);
    const totalDeductions = payrollRecords.reduce((sum, record) => sum + record.deductions, 0);
    const processedCount = payrollRecords.filter(r => r.paymentStatus === 'paid').length;

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
        <div className="space-y-5">
            {/* Header with Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-0 px-2 -mt-2 -mb-2">
                {/* Bulk Actions Bar */}
                {selectedItems.size > 0 && (
                    <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end w-full">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-1 rounded">
                                    <CheckSquare className="w-3 h-3 text-blue-600" />
                                </div>
                                <p className="font-medium text-xs text-gray-800">
                                    {selectedItems.size} selected
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        // Handle bulk action here
                                        console.log('Bulk action on:', Array.from(selectedItems));
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                                >
                                    Bulk Process
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Process Payroll Button */}
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={() => setShowProcessModal(true)} 
                        className="text-sm sticky top-20 z-10"
                    >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Process Payroll
                    </Button>
                </div>
            </div>

            {/* Statistics Cards - Sticky & Compact */}
            <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Total Payroll
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                                ₹{(totalSalary / 1000).toFixed(0)}K
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Net Payable
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                                ₹{(totalNet / 1000).toFixed(0)}K
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
                            <IndianRupee className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Deductions
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-red-600 mt-0.5">
                                ₹{(totalDeductions / 1000).toFixed(0)}K
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
                            <TrendingUp className="h-4 w-4 text-red-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Processed
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-purple-600 mt-0.5">
                                {processedCount}
                            </p>
                            <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                                of {allEmployees.length} employees
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-purple-100 rounded-md flex items-center justify-center">
                            <Wallet className="h-4 w-4 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Payroll Table */}
            <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:-mt-1">
                {/* Month Selector */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">Payroll Records</h2>
                        <Select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            options={monthOptions}
                            className="w-48 md:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                    <table className="w-full min-w-[1300px]">
                        <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                            {/* Header Row */}
                            <tr>
                                <th className="px-3 md:px-4 py-2 text-center w-16">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Select
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employee
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employee Code
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Gross Salary
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Deductions
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Net Salary
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </div>
                                </th>
                            </tr>

                            {/* Search Row */}
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {/* Select Column */}
                                <td className="px-3 md:px-4 py-1 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                    />
                                </td>

                                {/* Employee Search */}
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search employee..."
                                        value={searchEmployee}
                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>

                                {/* Employee Code Search */}
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search code..."
                                        value={searchCode}
                                        onChange={(e) => setSearchCode(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>

                                {/* Gross Salary - No filter */}
                                <td className="px-3 md:px-4 py-1"></td>

                                {/* Deductions - No filter */}
                                <td className="px-3 md:px-4 py-1"></td>

                                {/* Net Salary - No filter */}
                                <td className="px-3 md:px-4 py-1"></td>

                                {/* Status Search */}
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Status</option>
                                        <option value="paid">Paid</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </td>

                                {/* Actions Column - Clear Button */}
                                <td className="px-3 md:px-4 py-1 text-center">
                                    <button
                                        onClick={clearAllFilters}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                                        title="Clear All Filters"
                                    >
                                        <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                                        Clear
                                    </button>
                                </td>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                        <p className="text-gray-600 text-sm md:text-lg font-medium mt-3">Loading payroll data...</p>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                                        <Wallet className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 text-sm md:text-lg font-medium">No Payroll Records Found</p>
                                        <p className="text-gray-500 text-xs md:text-sm mt-2">
                                            {searchEmployee || statusFilter ? "Try a different search term" : "No payroll records available"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const isSelected = selectedItems.has(record.id);
                                    return (
                                        <tr key={record.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                                            <td className="px-3 md:px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectItem(record.id)}
                                                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                                />
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <div>
                                                    <p className="text-xs md:text-sm font-medium text-gray-800">{record.employee}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                                                        Status: {record.status}
                                                    </p>
                                                </div>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <span className="text-xs md:text-sm font-medium text-gray-800">{record.code}</span>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <span className="text-xs md:text-sm text-gray-700">{formatters.currency(record.salary)}</span>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <span className="text-xs md:text-sm text-red-600">{formatters.currency(record.deductions)}</span>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <span className="text-xs md:text-sm font-semibold text-green-600">{formatters.currency(record.net)}</span>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <Badge variant={record.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                                    {record.paymentStatus}
                                                </Badge>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {record.payslipId && (
                                                        <Button variant="secondary" size="sm" className="text-[10px] md:text-xs">
                                                            View Slip
                                                        </Button>
                                                    )}
                                                    {record.paymentStatus === 'pending' && (
                                                        <Button 
                                                            size="sm" 
                                                            className="text-[10px] md:text-xs"
                                                            onClick={() => {
                                                                setSelectedEmployees([record.id]);
                                                                setShowProcessModal(true);
                                                            }}
                                                        >
                                                            Process
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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