
// import { useState, useEffect, useRef } from 'react';
// import { Plus, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Eye, X, FileText, Download, Search, Trash2, MoreVertical } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Badge from '../components/ui/Badge';
// import FinalizeEmployeeModal from '../components/modals/FinalizeEmployeeModal';


// interface PayrollRun {
//     id: string;
//     pay_month: string;
//     pay_year: number;
//     status: 'draft' | 'processing' | 'completed' | 'cancelled';
//     total_employees: number;
//     total_amount: number;
//     cycle_start_date: string;
//     cycle_end_date: string;
//     created_at: string;
//     employees: PayrollEmployee[];
// }

// interface PayrollEmployee {
//     id: string;
//     employee_code: string;
//     name: string;
//     department: string;
//     designation: string;
//     gross_salary: number;
//     deductions: number;
//     net_salary: number;
//     status: 'pending' | 'finalized' | 'paid';
// }

// const mockEmployees = [
//     { id: 'EMP001', code: 'EMP001', name: 'Rajesh Kumar', department: 'IT', designation: 'Senior Developer', monthly_salary: 80000 },
//     { id: 'EMP002', code: 'EMP002', name: 'Priya Sharma', department: 'Sales', designation: 'Sales Manager', monthly_salary: 65000 },
//     { id: 'EMP003', code: 'EMP003', name: 'Amit Patel', department: 'IT', designation: 'Project Manager', monthly_salary: 95000 },
//     { id: 'EMP004', code: 'EMP004', name: 'Sneha Verma', department: 'HR', designation: 'HR Manager', monthly_salary: 70000 },
//     { id: 'EMP005', code: 'EMP005', name: 'Vikram Singh', department: 'Finance', designation: 'Financial Analyst', monthly_salary: 72000 },
// ];

// const months = [
//     'January', 'February', 'March', 'April', 'May', 'June',
//     'July', 'August', 'September', 'October', 'November', 'December'
// ];

// const initialRuns: PayrollRun[] = [
//     {
//         id: 'PR001',
//         pay_month: 'January',
//         pay_year: 2024,
//         status: 'completed',
//         total_employees: 5,
//         total_amount: 345000,
//         cycle_start_date: '2024-01-01',
//         cycle_end_date: '2024-01-31',
//         created_at: '2024-01-25T10:00:00Z',
//         employees: mockEmployees.map(emp => ({
//             id: emp.id,
//             employee_code: emp.code,
//             name: emp.name,
//             department: emp.department,
//             designation: emp.designation,
//             gross_salary: emp.monthly_salary,
//             deductions: emp.monthly_salary * 0.15,
//             net_salary: emp.monthly_salary * 0.85,
//             status: 'paid' as const
//         }))
//     }
// ];

// export default function PayrollSummary() {
//     const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initialRuns);
//     const [loading, setLoading] = useState(false);
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showDetailsModal, setShowDetailsModal] = useState(false);
//     const [showFinalizeModal, setShowFinalizeModal] = useState(false);
//     const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
//     const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
//     const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
//     const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
//     const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    
//     // Search and filter states
//     const [searchQuery, setSearchQuery] = useState('');
//     const [statusFilter, setStatusFilter] = useState('');
//     const [monthFilter, setMonthFilter] = useState('');
//     const [yearFilter, setYearFilter] = useState('');
//     const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
//     const [selectAll, setSelectAll] = useState(false);
//     const [openMenuId, setOpenMenuId] = useState<string | null>(null);

//     useEffect(() => {
//         loadPayrollRuns();
//     }, []);

//     const loadPayrollRuns = async () => {
//         setLoading(true);
//         await new Promise(resolve => setTimeout(resolve, 500));
//         setLoading(false);
//     };

//     const getDaysInMonth = (month: number, year: number) => {
//         return new Date(year, month, 0).getDate();
//     };

//     const handleCreatePayroll = () => {
//         const month = months[selectedMonth - 1];

//         const existingRun = payrollRuns.find(
//             run => run.pay_month === month && run.pay_year === selectedYear
//         );

//         if (existingRun) {
//             alert(`A payroll run for ${month} ${selectedYear} already exists!`);
//             return;
//         }

//         if (selectedEmployees.length === 0) {
//             alert('Please select at least one employee');
//             return;
//         }

//         const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
//         const startDate = new Date(selectedYear, selectedMonth - 1, 1);
//         const endDate = new Date(selectedYear, selectedMonth - 1, daysInMonth);

//         const payrollEmployees: PayrollEmployee[] = selectedEmployees.map(empId => {
//             const emp = mockEmployees.find(e => e.id === empId)!;
//             const deductions = emp.monthly_salary * 0.15;
//             return {
//                 id: emp.id,
//                 employee_code: emp.code,
//                 name: emp.name,
//                 department: emp.department,
//                 designation: emp.designation,
//                 gross_salary: emp.monthly_salary,
//                 deductions: deductions,
//                 net_salary: emp.monthly_salary - deductions,
//                 status: 'pending'
//             };
//         });

//         const newRun: PayrollRun = {
//             id: `PR${Date.now()}`,
//             pay_month: month,
//             pay_year: selectedYear,
//             status: 'processing',
//             total_employees: payrollEmployees.length,
//             total_amount: payrollEmployees.reduce((sum, emp) => sum + emp.net_salary, 0),
//             cycle_start_date: startDate.toISOString(),
//             cycle_end_date: endDate.toISOString(),
//             created_at: new Date().toISOString(),
//             employees: payrollEmployees
//         };

//         setPayrollRuns([newRun, ...payrollRuns]);
//         setShowCreateModal(false);
//         setSelectedEmployees([]);
//         alert(`Payroll run created for ${month} ${selectedYear} successfully!`);
//     };

//     const handleViewDetails = (run: PayrollRun) => {
//         setSelectedRun(run);
//         setShowDetailsModal(true);
//     };

//     const handleFinalizeEmployee = (employee: PayrollEmployee) => {
//         setSelectedEmployee(employee);
//         setShowFinalizeModal(true);
//     };

//     const handleFinalizationComplete = () => {
//         if (!selectedRun || !selectedEmployee) return;

//         setPayrollRuns(runs =>
//             runs.map(run => {
//                 if (run.id === selectedRun.id) {
//                     return {
//                         ...run,
//                         employees: run.employees.map(emp =>
//                             emp.id === selectedEmployee.id ? { ...emp, status: 'finalized' as const } : emp
//                         )
//                     };
//                 }
//                 return run;
//             })
//         );

//         setShowFinalizeModal(false);
//         setSelectedEmployee(null);
//     };

//     const handleCompletePayroll = (runId: string) => {
//         setPayrollRuns(runs =>
//             runs.map(run => {
//                 if (run.id === runId) {
//                     return {
//                         ...run,
//                         status: 'completed' as const,
//                         employees: run.employees.map(emp => ({ ...emp, status: 'paid' as const }))
//                     };
//                 }
//                 return run;
//             })
//         );
//         setShowDetailsModal(false);
//         alert('Payroll run completed successfully!');
//     };

//     const toggleEmployeeSelection = (empId: string) => {
//         setSelectedEmployees(prev =>
//             prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
//         );
//     };

//     const selectAllEmployees = () => {
//         setSelectedEmployees(mockEmployees.map(emp => emp.id));
//     };

//     // Filter payroll runs
//     const filteredRuns = payrollRuns.filter(run => {
//         const matchesSearch = searchQuery === '' || 
//             run.pay_month.toLowerCase().includes(searchQuery.toLowerCase()) ||
//             run.id.toLowerCase().includes(searchQuery.toLowerCase());
        
//         const matchesStatus = !statusFilter || run.status === statusFilter;
//         const matchesMonth = !monthFilter || run.pay_month === monthFilter;
//         const matchesYear = !yearFilter || run.pay_year.toString() === yearFilter;
        
//         return matchesSearch && matchesStatus && matchesMonth && matchesYear;
//     });

//     // Checkbox handlers
//     const handleSelectAll = () => {
//         if (selectAll) {
//             setSelectedItems(new Set());
//         } else {
//             const allIds = new Set(filteredRuns.map(run => run.id));
//             setSelectedItems(allIds);
//         }
//         setSelectAll(!selectAll);
//     };

//     const handleSelectItem = (id: string) => {
//         const newSelected = new Set(selectedItems);
//         if (newSelected.has(id)) {
//             newSelected.delete(id);
//         } else {
//             newSelected.add(id);
//         }
//         setSelectedItems(newSelected);
//         setSelectAll(newSelected.size === filteredRuns.length);
//     };

//     const clearFilters = () => {
//         setSearchQuery('');
//         setStatusFilter('');
//         setMonthFilter('');
//         setYearFilter('');
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case 'completed':
//                 return 'success';
//             case 'processing':
//                 return 'info';
//             case 'draft':
//                 return 'warning';
//             case 'cancelled':
//                 return 'danger';
//             default:
//                 return 'secondary';
//         }
//     };

//     const getEmployeeStatusColor = (status: string) => {
//         switch (status) {
//             case 'paid':
//                 return 'success';
//             case 'finalized':
//                 return 'info';
//             case 'pending':
//                 return 'warning';
//             default:
//                 return 'secondary';
//         }
//     };

//     const stats = {
//         totalRuns: payrollRuns.length,
//         activeRuns: payrollRuns.filter(r => r.status === 'processing').length,
//         completedRuns: payrollRuns.filter(r => r.status === 'completed').length,
//         totalAmount: payrollRuns.reduce((sum, r) => sum + (r.total_amount || 0), 0)
//     };

//     // Close menu when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (openMenuId !== null) {
//                 const target = event.target as HTMLElement;
//                 if (!target.closest('.menu-container')) {
//                     setOpenMenuId(null);
//                 }
//             }
//         };

//         document.addEventListener('mousedown', handleClickOutside);
//         return () => document.removeEventListener('mousedown', handleClickOutside);
//     }, [openMenuId]);

//     return (
//         <div className="space-y-5">
//             {/* Header with Create Button - Sticky */}
//             <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
//                 <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
//                     {selectedItems.size > 0 && (
//                         <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
//                             <div className="flex items-center gap-2">
//                                 <div className="bg-blue-100 p-1 rounded">
//                                     <Calendar className="w-3 h-3 text-blue-600" />
//                                 </div>
//                                 <p className="font-medium text-xs text-gray-800">
//                                     {selectedItems.size} selected
//                                 </p>
//                             </div>

//                             <div className="flex items-center gap-1">
//                                 <button
//                                     onClick={() => {
//                                         // Handle bulk delete
//                                         setPayrollRuns(runs => runs.filter(run => !selectedItems.has(run.id)));
//                                         setSelectedItems(new Set());
//                                         setSelectAll(false);
//                                         alert(`${selectedItems.size} payroll run(s) deleted successfully!`);
//                                     }}
//                                     className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
//                                 >
//                                     <Trash2 className="w-3 h-3 inline mr-1" />
//                                     Delete
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//                 <Button 
//                     onClick={() => setShowCreateModal(true)} 
//                     className="text-sm sticky top-20 z-10"
//                 >
//                     <Plus className="h-4 w-4 mr-1.5" />
//                     Run New Payroll
//                 </Button>
//             </div>

//             {/* Statistics Cards - Sticky & Compact */}
//             <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
//                 <Card className="p-2 sm:p-3 md:p-3.5">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
//                                 Total Runs
//                             </p>
//                             <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
//                                 {stats.totalRuns}
//                             </p>
//                         </div>
//                         <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
//                             <Calendar className="h-4 w-4 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-2 sm:p-3 md:p-3.5">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
//                                 Active Runs
//                             </p>
//                             <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
//                                 {stats.activeRuns}
//                             </p>
//                         </div>
//                         <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
//                             <Clock className="h-4 w-4 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-2 sm:p-3 md:p-3.5">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
//                                 Completed
//                             </p>
//                             <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
//                                 {stats.completedRuns}
//                             </p>
//                         </div>
//                         <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
//                             <CheckCircle className="h-4 w-4 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-2 sm:p-3 md:p-3.5">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
//                                 Total Processed
//                             </p>
//                             <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
//                                 ₹{(stats.totalAmount / 100000).toFixed(1)}L
//                             </p>
//                         </div>
//                         <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-slate-100 rounded-md flex items-center justify-center">
//                             <DollarSign className="h-4 w-4 text-slate-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             {/* Main Table - Responsive with sticky header */}
//             <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                 <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
//                     <table className="w-full min-w-[800px]">
//                         <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
//                             {/* Header Row */}
//                             <tr>
//                                 <th className="px-3 md:px-4 py-2 text-center w-16">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Select
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Period
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Cycle Dates
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Employees
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Total Amount
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Status
//                                     </div>
//                                 </th>
//                                 <th className="px-3 md:px-4 py-2 text-left">
//                                     <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Actions
//                                     </div>
//                                 </th>
//                             </tr>

//                             {/* Search Row */}
//                             <tr className="bg-gray-50 border-b border-gray-200">
//                                 {/* Select Column */}
//                                 <td className="px-3 md:px-4 py-1 text-center">
//                                     <input
//                                         type="checkbox"
//                                         checked={selectAll}
//                                         onChange={handleSelectAll}
//                                         className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                                     />
//                                 </td>

//                                 {/* Period Search */}
//                                 <td className="px-3 md:px-4 py-1">
//                                     <input
//                                         type="text"
//                                         placeholder="Search period..."
//                                         value={searchQuery}
//                                         onChange={(e) => setSearchQuery(e.target.value)}
//                                         className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                                     />
//                                 </td>

//                                 {/* Month Filter */}
//                                 <td className="px-3 md:px-4 py-1">
//                                     <select
//                                         value={monthFilter}
//                                         onChange={(e) => setMonthFilter(e.target.value)}
//                                         className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="">All Months</option>
//                                         {months.map((month, index) => (
//                                             <option key={index} value={month}>
//                                                 {month}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>

//                                 {/* Year Filter */}
//                                 <td className="px-3 md:px-4 py-1">
//                                     <select
//                                         value={yearFilter}
//                                         onChange={(e) => setYearFilter(e.target.value)}
//                                         className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="">All Years</option>
//                                         {[2023, 2024, 2025, 2026, 2027].map((year) => (
//                                             <option key={year} value={year.toString()}>
//                                                 {year}
//                                             </option>
//                                         ))}
//                                     </select>
//                                 </td>

//                                 {/* Total Amount - Empty */}
//                                 <td className="px-3 md:px-4 py-1"></td>

//                                 {/* Status Filter */}
//                                 <td className="px-3 md:px-4 py-1">
//                                     <select
//                                         value={statusFilter}
//                                         onChange={(e) => setStatusFilter(e.target.value)}
//                                         className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
//                                     >
//                                         <option value="">All Status</option>
//                                         <option value="draft">Draft</option>
//                                         <option value="processing">Processing</option>
//                                         <option value="completed">Completed</option>
//                                         <option value="cancelled">Cancelled</option>
//                                     </select>
//                                 </td>

//                                 {/* Actions Column - Clear Button */}
//                                 <td className="px-3 md:px-4 py-1 text-center">
//                                     <button
//                                         onClick={clearFilters}
//                                         className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
//                                         title="Clear All Filters"
//                                     >
//                                         <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
//                                         Clear
//                                     </button>
//                                 </td>
//                             </tr>
//                         </thead>

//                         <tbody className="divide-y divide-gray-200">
//                             {loading ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-3 md:px-4 py-8 text-center">
//                                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                                         <p className="text-gray-600 text-sm mt-2">Loading payroll runs...</p>
//                                     </td>
//                                 </tr>
//                             ) : filteredRuns.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-3 md:px-4 py-8 text-center">
//                                         <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
//                                         <p className="text-gray-600 text-sm md:text-lg font-medium">No Payroll Runs Found</p>
//                                         <p className="text-gray-500 text-xs md:text-sm mt-2">
//                                             {searchQuery || statusFilter ? "Try a different search term" : "No payroll runs available"}
//                                         </p>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredRuns.map((run) => {
//                                     const isSelected = selectedItems.has(run.id);
//                                     return (
//                                         <tr key={run.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
//                                             <td className="px-3 md:px-4 py-3 text-center">
//                                                 <input
//                                                     type="checkbox"
//                                                     checked={isSelected}
//                                                     onChange={() => handleSelectItem(run.id)}
//                                                     className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
//                                                 />
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3">
//                                                 <p className="font-medium text-xs md:text-sm text-gray-900">
//                                                     {run.pay_month} {run.pay_year}
//                                                 </p>
//                                                 <p className="text-[10px] md:text-xs text-gray-500 mt-1">
//                                                     Created {new Date(run.created_at).toLocaleDateString()}
//                                                 </p>
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3">
//                                                 <p className="text-xs md:text-sm text-gray-600">
//                                                     {new Date(run.cycle_start_date).toLocaleDateString()} - {new Date(run.cycle_end_date).toLocaleDateString()}
//                                                 </p>
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3">
//                                                 <div className="flex items-center gap-2">
//                                                     <Users className="h-4 w-4 text-gray-400" />
//                                                     <span className="text-xs md:text-sm text-gray-900">{run.total_employees || 0}</span>
//                                                 </div>
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3">
//                                                 <p className="font-medium text-xs md:text-sm text-green-600">
//                                                     ₹{run.total_amount?.toLocaleString() || '0'}
//                                                 </p>
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3">
//                                                 <Badge variant={getStatusColor(run.status)} className="text-xs">
//                                                     {run.status}
//                                                 </Badge>
//                                             </td>
                                            
//                                             <td className="px-3 md:px-4 py-3 relative menu-container">
//                                                 <button
//                                                     onClick={() => setOpenMenuId(openMenuId === run.id ? null : run.id)}
//                                                     className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
//                                                 >
//                                                     <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
//                                                 </button>

//                                                 {openMenuId === run.id && (
//                                                     <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
//                                                         <ul className="py-1 text-sm text-gray-700">
//                                                             <li>
//                                                                 <button
//                                                                     onClick={() => {
//                                                                         handleViewDetails(run);
//                                                                         setOpenMenuId(null);
//                                                                     }}
//                                                                     className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
//                                                                 >
//                                                                     <Eye className="w-4 h-4" />
//                                                                     View Details
//                                                                 </button>
//                                                             </li>

//                                                             {run.status === 'completed' && (
//                                                                 <li>
//                                                                     <button
//                                                                         onClick={() => {
//                                                                             // Handle download report
//                                                                             alert('Download report functionality would be implemented here');
//                                                                             setOpenMenuId(null);
//                                                                         }}
//                                                                         className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
//                                                                     >
//                                                                         <FileText className="w-4 h-4" />
//                                                                         Download Report
//                                                                     </button>
//                                                                 </li>
//                                                             )}

//                                                             <hr className="my-1" />

//                                                             <li>
//                                                                 <button
//                                                                     onClick={() => {
//                                                                         // Handle delete
//                                                                         if (window.confirm(`Are you sure you want to delete payroll run ${run.id}?`)) {
//                                                                             setPayrollRuns(runs => runs.filter(r => r.id !== run.id));
//                                                                             alert(`Payroll run ${run.id} deleted successfully!`);
//                                                                         }
//                                                                         setOpenMenuId(null);
//                                                                     }}
//                                                                     className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
//                                                                 >
//                                                                     <Trash2 className="w-4 h-4" />
//                                                                     Delete
//                                                                 </button>
//                                                             </li>
//                                                         </ul>
//                                                     </div>
//                                                 )}
//                                             </td>
//                                         </tr>
//                                     );
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* ALL EXISTING MODALS REMAIN EXACTLY THE SAME AS BEFORE - NO LOGIC CHANGED */}
            
//             {/* Create Payroll Modal */}
//       {/* Create Payroll Modal */}
// {showCreateModal && (
//   <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
//     {/* Overlay */}
//     <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
    
//     {/* Modal */}
//     <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-lg border border-gray-200 overflow-hidden relative z-10">
//       {/* Header with Leave Form Theme */}
//       <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//             <Calendar className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-white flex items-center gap-2">
//               Create Payroll Run
//             </h2>
//             <p className="text-xs text-white/90 font-medium mt-0.5">
//               Generate payroll for selected employees
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowCreateModal(false)}
//           className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="p-6 max-h-[70vh] overflow-y-auto">
//         {/* Rest of your existing form content remains exactly the same */}
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Month
//               </label>
//               <select
//                 value={selectedMonth}
//                 onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
//                 className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//               >
//                 {months.map((month, index) => (
//                   <option key={index} value={index + 1}>
//                     {month}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-xs font-medium text-slate-700 mb-1">
//                 Year
//               </label>
//               <select
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//                 className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//               >
//                 {[2023, 2024, 2025, 2026, 2027].map((year) => (
//                   <option key={year} value={year}>
//                     {year}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-2">
//               <label className="block text-xs font-medium text-slate-700">
//                 Employees ({selectedEmployees.length} selected)
//               </label>
//               <button 
//                 onClick={selectAllEmployees}
//                 className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
//               >
//                 Select All
//               </button>
//             </div>
//             <div className="border border-slate-300 rounded-md max-h-48 overflow-y-auto">
//               {mockEmployees.map(emp => {
//                 const isSelected = selectedEmployees.includes(emp.id);
//                 return (
//                   <div
//                     key={emp.id}
//                     onClick={() => toggleEmployeeSelection(emp.id)}
//                     className={`flex items-center gap-2 px-3 py-2 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
//                       isSelected ? 'bg-blue-50 border-blue-200' : ''
//                     }`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={() => { }}
//                       className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                     />
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium text-slate-900 truncate">{emp.name}</p>
//                       <p className="text-[10px] text-slate-500 truncate">
//                         {emp.code} | {emp.designation}
//                       </p>
//                     </div>
//                     <div className="text-right whitespace-nowrap">
//                       <p className="text-xs font-medium text-slate-900">
//                         ₹{emp.monthly_salary.toLocaleString()}
//                       </p>
//                       <p className="text-[10px] text-slate-500">Monthly</p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
//             <p className="text-xs text-blue-700">
//               <span className="font-medium">Summary:</span> {months[selectedMonth - 1]} {selectedYear}
//               {selectedEmployees.length > 0 && (
//                 <>
//                   <br />
//                   <span className="font-medium">{selectedEmployees.length} employee(s)</span>
//                   <br />
//                   Total: ₹{mockEmployees
//                     .filter(e => selectedEmployees.includes(e.id))
//                     .reduce((sum, e) => sum + e.monthly_salary * 0.85, 0)
//                     .toLocaleString()}
//                 </>
//               )}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="border-t border-slate-200 p-4 flex gap-3">
//         <button
//           onClick={() => setShowCreateModal(false)}
//           className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
//         >
//           Cancel
//         </button>
//         <button
//           onClick={handleCreatePayroll}
//           className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//         >
//           <Plus className="w-5 h-5" />
//           Create Payroll
//         </button>
//       </div>
//     </div>
//   </div>
// )}
// {showDetailsModal && selectedRun && (
//   <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
//     {/* Overlay */}
//     <div 
//       className="fixed inset-0 bg-black/50 backdrop-blur-md" 
//       onClick={() => setShowDetailsModal(false)}
//     />
    
//     {/* Modal */}
//     <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-6xl border border-gray-200 overflow-hidden relative z-10">
//       {/* Header with Leave Form Theme */}
//       <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
//         <div className="flex items-center gap-3">
//           <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//             <FileText className="w-5 h-5 text-white" />
//           </div>
//           <div>
//             <h2 className="text-lg font-bold text-white flex items-center gap-2">
//               {selectedRun.pay_month} {selectedRun.pay_year} Payroll Details
//             </h2>
//             <p className="text-xs text-white/90 font-medium mt-0.5">
//               {new Date(selectedRun.cycle_start_date).toLocaleDateString()} -{" "}
//               {new Date(selectedRun.cycle_end_date).toLocaleDateString()}
//             </p>
//           </div>
//         </div>
//         <button
//           onClick={() => setShowDetailsModal(false)}
//           className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Content */}
//       <div className="p-6 max-h-[70vh] overflow-y-auto">
//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
//           <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-3">
//             <p className="text-[11px] text-blue-600 font-medium">Total Employees</p>
//             <p className="text-lg font-bold text-blue-900">
//               {selectedRun.total_employees}
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-3">
//             <p className="text-[11px] text-green-600 font-medium">Total Amount</p>
//             <p className="text-lg font-bold text-green-900">
//               ₹{selectedRun.total_amount.toLocaleString()}
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-3">
//             <p className="text-[11px] text-yellow-600 font-medium">Pending</p>
//             <p className="text-lg font-bold text-yellow-900">
//               {
//                 selectedRun.employees.filter(
//                   (e) => e.status === "pending"
//                 ).length
//               }
//             </p>
//           </div>

//           <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-3">
//             <p className="text-[11px] text-slate-600 font-medium">Status</p>
//             <Badge
//               variant={getStatusColor(selectedRun.status)}
//               className="mt-1 text-xs"
//             >
//               {selectedRun.status}
//             </Badge>
//           </div>
//         </div>

//         {/* Table */}
//         <div>
//           <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
//             <Users className="w-4 h-4 text-[#C62828]" />
//             Employee Salaries
//           </h3>

//           <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
//             <table className="w-full text-xs">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="text-left px-4 py-3 font-semibold">Employee</th>
//                   <th className="text-right px-4 py-3 font-semibold">Gross</th>
//                   <th className="text-right px-4 py-3 font-semibold">Ded</th>
//                   <th className="text-right px-4 py-3 font-semibold">Net</th>
//                   <th className="text-left px-4 py-3 font-semibold">Status</th>
//                   <th className="text-right px-4 py-3 font-semibold">Actions</th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-slate-100">
//                 {selectedRun.employees.map((emp) => (
//                   <tr key={emp.id} className="hover:bg-slate-50">
//                     <td className="px-4 py-3">
//                       <p className="font-medium text-slate-900 text-xs">
//                         {emp.name}
//                       </p>
//                       <p className="text-[10px] text-slate-600">
//                         {emp.employee_code} • {emp.designation}
//                       </p>
//                     </td>

//                     <td className="px-4 py-3 text-right">
//                       ₹{emp.gross_salary.toLocaleString()}
//                     </td>

//                     <td className="px-4 py-3 text-right text-red-600">
//                       -₹{emp.deductions.toLocaleString()}
//                     </td>

//                     <td className="px-4 py-3 text-right font-semibold text-green-600">
//                       ₹{emp.net_salary.toLocaleString()}
//                     </td>

//                     <td className="px-4 py-3">
//                       <Badge
//                         variant={getEmployeeStatusColor(emp.status)}
//                         className="text-[10px]"
//                       >
//                         {emp.status}
//                       </Badge>
//                     </td>

//                     <td className="px-4 py-3 text-right">
//                       {emp.status === "pending" &&
//                         selectedRun.status !== "completed" && (
//                           <button
//                             onClick={() => handleFinalizeEmployee(emp)}
//                             className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1 ml-auto"
//                           >
//                             <CheckCircle className="h-3 w-3" />
//                             Finalize
//                           </button>
//                         )}

//                       {emp.status === "paid" && (
//                         <button
//                           className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-1 ml-auto"
//                         >
//                           <FileText className="h-3 w-3" />
//                           Slip
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="border-t border-slate-200 p-4 flex gap-3">
//         {selectedRun.status === "processing" && (
//           <button
//             onClick={() => handleCompletePayroll(selectedRun.id)}
//             className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
//           >
//             <CheckCircle className="h-5 w-5" />
//             Complete Payroll
//           </button>
//         )}

//         {selectedRun.status === "completed" && (
//           <button className="flex-1 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-2">
//             <Download className="h-5 w-5" />
//             Download Report
//           </button>
//         )}

//         <button
//           onClick={() => setShowDetailsModal(false)}
//           className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   </div>
// )}


//             {/* Finalize Employee Modal */}
//             {showFinalizeModal && selectedEmployee && selectedRun && (
//                 <FinalizeEmployeeModal
//                     employee={selectedEmployee}
//                     payrollRun={selectedRun}
//                     onClose={() => {
//                         setShowFinalizeModal(false);
//                         setSelectedEmployee(null);
//                     }}
//                     onFinalize={handleFinalizationComplete}
//                 />
//             )}
//         </div>
//     );
// }
import { useState, useEffect, useRef } from 'react';
import { Plus, Calendar, DollarSign, Users, CheckCircle, Clock, AlertCircle, Eye, X, FileText, Download, Search, Trash2, MoreVertical } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import FinalizeEmployeeModal from '../components/modals/FinalizeEmployeeModal';
import HrmsEmployeesApi from '../lib/employeeApi';

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

interface HrmsEmployee {
    id: number;
    employee_code: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    department_id: string;
    department_name?: string;
    designation: string;
    salary?: string;
    employee_status: string;
    [key: string]: any;
}

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
        employees: []
    }
];

export default function PayrollSummary() {
    const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>(initialRuns);
    const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);
    const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<PayrollEmployee | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    
    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    useEffect(() => {
        loadPayrollRuns();
        loadEmployees();
    }, []);

    const loadPayrollRuns = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setLoading(false);
    };

    const loadEmployees = async () => {
        try {
            const response = await HrmsEmployeesApi.getEmployees();
            setEmployees(response);
        } catch (error) {
            console.error('Error loading employees:', error);
            setEmployees([]);
        }
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

        // Use real employees data from API
        const payrollEmployees: PayrollEmployee[] = selectedEmployees.map(empId => {
            const emp = employees.find(e => e.id.toString() === empId);
            if (!emp) return null;
            
            // Calculate salary - convert string to number if needed
            const grossSalary = emp.salary ? parseFloat(emp.salary) : 0;
            const deductions = grossSalary * 0.15;
            
            return {
                id: emp.id.toString(),
                employee_code: emp.employee_code,
                name: `${emp.first_name} ${emp.last_name}`,
                department: emp.department_name || emp.department_id || 'N/A',
                designation: emp.designation || 'N/A',
                gross_salary: grossSalary,
                deductions: deductions,
                net_salary: grossSalary - deductions,
                status: 'pending'
            };
        }).filter(Boolean) as PayrollEmployee[];

        if (payrollEmployees.length === 0) {
            alert('No valid employees selected');
            return;
        }

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
        setSelectedEmployees(employees.map(emp => emp.id.toString()));
    };

    // Filter payroll runs
    const filteredRuns = payrollRuns.filter(run => {
        const matchesSearch = searchQuery === '' || 
            run.pay_month.toLowerCase().includes(searchQuery.toLowerCase()) ||
            run.id.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesStatus = !statusFilter || run.status === statusFilter;
        const matchesMonth = !monthFilter || run.pay_month === monthFilter;
        const matchesYear = !yearFilter || run.pay_year.toString() === yearFilter;
        
        return matchesSearch && matchesStatus && matchesMonth && matchesYear;
    });

    // Checkbox handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(filteredRuns.map(run => run.id));
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
        setSelectAll(newSelected.size === filteredRuns.length);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('');
        setMonthFilter('');
        setYearFilter('');
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

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openMenuId !== null) {
                const target = event.target as HTMLElement;
                if (!target.closest('.menu-container')) {
                    setOpenMenuId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openMenuId]);

    return (
        <div className="space-y-5">
            {/* Header with Create Button - Sticky */}
            <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
                <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
                    {selectedItems.size > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-1 rounded">
                                    <Calendar className="w-3 h-3 text-blue-600" />
                                </div>
                                <p className="font-medium text-xs text-gray-800">
                                    {selectedItems.size} selected
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => {
                                        // Handle bulk delete
                                        setPayrollRuns(runs => runs.filter(run => !selectedItems.has(run.id)));
                                        setSelectedItems(new Set());
                                        setSelectAll(false);
                                        alert(`${selectedItems.size} payroll run(s) deleted successfully!`);
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                                >
                                    <Trash2 className="w-3 h-3 inline mr-1" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <Button 
                    onClick={() => setShowCreateModal(true)} 
                    className="text-sm sticky top-20 z-10"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Run New Payroll
                </Button>
            </div>

            {/* Statistics Cards - Sticky & Compact */}
            <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Total Runs
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                                {stats.totalRuns}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
                            <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Active Runs
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                                {stats.activeRuns}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Completed
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                                {stats.completedRuns}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Total Processed
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                                ₹{(stats.totalAmount / 100000).toFixed(1)}L
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-slate-100 rounded-md flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-slate-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table - Responsive with sticky header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
                    <table className="w-full min-w-[800px]">
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
                                        Period
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Cycle Dates
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employees
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Total Amount
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

                                {/* Period Search */}
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search period..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>

                                {/* Month Filter */}
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={monthFilter}
                                        onChange={(e) => setMonthFilter(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Months</option>
                                        {months.map((month, index) => (
                                            <option key={index} value={month}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Year Filter */}
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={yearFilter}
                                        onChange={(e) => setYearFilter(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Years</option>
                                        {[2023, 2024, 2025, 2026, 2027].map((year) => (
                                            <option key={year} value={year.toString()}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </td>

                                {/* Total Amount - Empty */}
                                <td className="px-3 md:px-4 py-1"></td>

                                {/* Status Filter */}
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">All Status</option>
                                        <option value="draft">Draft</option>
                                        <option value="processing">Processing</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>

                                {/* Actions Column - Clear Button */}
                                <td className="px-3 md:px-4 py-1 text-center">
                                    <button
                                        onClick={clearFilters}
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
                                    <td colSpan={7} className="px-3 md:px-4 py-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-gray-600 text-sm mt-2">Loading payroll runs...</p>
                                    </td>
                                </tr>
                            ) : filteredRuns.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-3 md:px-4 py-8 text-center">
                                        <Calendar className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 text-sm md:text-lg font-medium">No Payroll Runs Found</p>
                                        <p className="text-gray-500 text-xs md:text-sm mt-2">
                                            {searchQuery || statusFilter ? "Try a different search term" : "No payroll runs available"}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRuns.map((run) => {
                                    const isSelected = selectedItems.has(run.id);
                                    return (
                                        <tr key={run.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                                            <td className="px-3 md:px-4 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectItem(run.id)}
                                                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                                />
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <p className="font-medium text-xs md:text-sm text-gray-900">
                                                    {run.pay_month} {run.pay_year}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-gray-500 mt-1">
                                                    Created {new Date(run.created_at).toLocaleDateString()}
                                                </p>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <p className="text-xs md:text-sm text-gray-600">
                                                    {new Date(run.cycle_start_date).toLocaleDateString()} - {new Date(run.cycle_end_date).toLocaleDateString()}
                                                </p>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-400" />
                                                    <span className="text-xs md:text-sm text-gray-900">{run.total_employees || 0}</span>
                                                </div>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <p className="font-medium text-xs md:text-sm text-green-600">
                                                    ₹{run.total_amount?.toLocaleString() || '0'}
                                                </p>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3">
                                                <Badge variant={getStatusColor(run.status)} className="text-xs">
                                                    {run.status}
                                                </Badge>
                                            </td>
                                            
                                            <td className="px-3 md:px-4 py-3 relative menu-container">
                                                <button
                                                    onClick={() => setOpenMenuId(openMenuId === run.id ? null : run.id)}
                                                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                                                >
                                                    <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                                                </button>

                                                {openMenuId === run.id && (
                                                    <div className="absolute right-4 top-12  z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                                                        <ul className="py-1 text-sm text-gray-700">
                                                            <li>
                                                                <button
                                                                    onClick={() => {
                                                                        handleViewDetails(run);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                                                >
                                                                    <Eye className="w-4 h-4" />
                                                                    View Details
                                                                </button>
                                                            </li>

                                                            {run.status === 'completed' && (
                                                                <li>
                                                                    <button
                                                                        onClick={() => {
                                                                            // Handle download report
                                                                            alert('Download report functionality would be implemented here');
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                                                    >
                                                                        <FileText className="w-4 h-4" />
                                                                        Download Report
                                                                    </button>
                                                                </li>
                                                            )}

                                                            <hr className="my-1" />

                                                            <li>
                                                                <button
                                                                    onClick={() => {
                                                                        // Handle delete
                                                                        if (window.confirm(`Are you sure you want to delete payroll run ${run.id}?`)) {
                                                                            setPayrollRuns(runs => runs.filter(r => r.id !== run.id));
                                                                            alert(`Payroll run ${run.id} deleted successfully!`);
                                                                        }
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Payroll Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreateModal(false)} />
                    
                    {/* Modal */}
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-lg border border-gray-200 overflow-hidden relative z-10">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        Create Payroll Run
                                    </h2>
                                    <p className="text-xs text-white/90 font-medium mt-0.5">
                                        Generate payroll for selected employees
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Month
                                        </label>
                                        <select
                                            value={selectedMonth}
                                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                                        >
                                            {months.map((month, index) => (
                                                <option key={index} value={index + 1}>
                                                    {month}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-700 mb-1">
                                            Year
                                        </label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                            className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
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
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-medium text-slate-700">
                                            Employees ({selectedEmployees.length} selected)
                                        </label>
                                        <button 
                                            onClick={selectAllEmployees}
                                            className="text-xs px-2 py-1 border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                                        >
                                            Select All
                                        </button>
                                    </div>
                                    <div className="border border-slate-300 rounded-md max-h-48 overflow-y-auto">
                                        {employees.length === 0 ? (
                                            <div className="px-3 py-8 text-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                                <p className="text-xs text-gray-500">Loading employees...</p>
                                            </div>
                                        ) : (
                                            employees.map(emp => {
                                                const isSelected = selectedEmployees.includes(emp.id.toString());
                                                const grossSalary = emp.salary ? parseFloat(emp.salary) : 0;
                                                const deductions = grossSalary * 0.15;
                                                const netSalary = grossSalary - deductions;

                                                return (
                                                    <div
                                                        key={emp.id}
                                                        onClick={() => toggleEmployeeSelection(emp.id.toString())}
                                                        className={`flex items-center gap-2 px-3 py-2 border-b border-slate-200 last:border-b-0 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                            isSelected ? 'bg-blue-50 border-blue-200' : ''
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => { }}
                                                            className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                                                        />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                                {emp.first_name} {emp.last_name}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500 truncate">
                                                                {emp.employee_code} • {emp.designation || 'N/A'}
                                                            </p>
                                                        </div>
                                                        <div className="text-right whitespace-nowrap">
                                                            <p className="text-xs font-medium text-slate-900">
                                                                ₹{netSalary.toLocaleString()}
                                                            </p>
                                                            <p className="text-[10px] text-slate-500">Net Pay</p>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-medium">Summary:</span> {months[selectedMonth - 1]} {selectedYear}
                                        {selectedEmployees.length > 0 && (
                                            <>
                                                <br />
                                                <span className="font-medium">{selectedEmployees.length} employee(s)</span>
                                                <br />
                                                Total: ₹{
                                                    employees
                                                        .filter(e => selectedEmployees.includes(e.id.toString()))
                                                        .reduce((sum, emp) => {
                                                            const grossSalary = emp.salary ? parseFloat(emp.salary) : 0;
                                                            const deductions = grossSalary * 0.15;
                                                            return sum + (grossSalary - deductions);
                                                        }, 0)
                                                        .toLocaleString()
                                                }
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-4 flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreatePayroll}
                                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={selectedEmployees.length === 0}
                            >
                                <Plus className="w-5 h-5" />
                                Create Payroll
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Details Modal */}
            {showDetailsModal && selectedRun && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-md" onClick={() => setShowDetailsModal(false)} />
                    
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-6xl border border-gray-200 overflow-hidden relative z-10">
                        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        {selectedRun.pay_month} {selectedRun.pay_year} Payroll Details
                                    </h2>
                                    <p className="text-xs text-white/90 font-medium mt-0.5">
                                        {new Date(selectedRun.cycle_start_date).toLocaleDateString()} -{" "}
                                        {new Date(selectedRun.cycle_end_date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-3">
                                    <p className="text-[11px] text-blue-600 font-medium">Total Employees</p>
                                    <p className="text-lg font-bold text-blue-900">
                                        {selectedRun.total_employees}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-3">
                                    <p className="text-[11px] text-green-600 font-medium">Total Amount</p>
                                    <p className="text-lg font-bold text-green-900">
                                        ₹{selectedRun.total_amount.toLocaleString()}
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-3">
                                    <p className="text-[11px] text-yellow-600 font-medium">Pending</p>
                                    <p className="text-lg font-bold text-yellow-900">
                                        {
                                            selectedRun.employees.filter(
                                                (e) => e.status === "pending"
                                            ).length
                                        }
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl p-3">
                                    <p className="text-[11px] text-slate-600 font-medium">Status</p>
                                    <Badge
                                        variant={getStatusColor(selectedRun.status)}
                                        className="mt-1 text-xs"
                                    >
                                        {selectedRun.status}
                                    </Badge>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-slate-900 text-sm mb-4 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#C62828]" />
                                    Employee Salaries
                                </h3>

                                <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-xs">
                                        <thead className="bg-slate-50 border-b border-slate-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-semibold">Employee</th>
                                                <th className="text-right px-4 py-3 font-semibold">Gross</th>
                                                <th className="text-right px-4 py-3 font-semibold">Ded</th>
                                                <th className="text-right px-4 py-3 font-semibold">Net</th>
                                                <th className="text-left px-4 py-3 font-semibold">Status</th>
                                                <th className="text-right px-4 py-3 font-semibold">Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {selectedRun.employees.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3">
                                                        <p className="font-medium text-slate-900 text-xs">
                                                            {emp.name}
                                                        </p>
                                                        <p className="text-[10px] text-slate-600">
                                                            {emp.employee_code} • {emp.designation}
                                                        </p>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        ₹{emp.gross_salary.toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3 text-right text-red-600">
                                                        -₹{emp.deductions.toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                                                        ₹{emp.net_salary.toLocaleString()}
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <Badge
                                                            variant={getEmployeeStatusColor(emp.status)}
                                                            className="text-[10px]"
                                                        >
                                                            {emp.status}
                                                        </Badge>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        {emp.status === "pending" &&
                                                            selectedRun.status !== "completed" && (
                                                                <button
                                                                    onClick={() => handleFinalizeEmployee(emp)}
                                                                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1 ml-auto"
                                                                >
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    Finalize
                                                                </button>
                                                            )}

                                                        {emp.status === "paid" && (
                                                            <button
                                                                className="px-3 py-1.5 text-xs border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-1 ml-auto"
                                                            >
                                                                <FileText className="h-3 w-3" />
                                                                Slip
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 p-4 flex gap-3">
                            {selectedRun.status === "processing" && (
                                <button
                                    onClick={() => handleCompletePayroll(selectedRun.id)}
                                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="h-5 w-5" />
                                    Complete Payroll
                                </button>
                            )}

                            {selectedRun.status === "completed" && (
                                <button className="flex-1 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-2">
                                    <Download className="h-5 w-5" />
                                    Download Report
                                </button>
                            )}

                            <button
                                onClick={() => setShowDetailsModal(false)}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                            >
                                Close
                            </button>
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