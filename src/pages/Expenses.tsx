// import { useState, useEffect } from 'react';
// import { Receipt, Plus, Search, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import { formatters } from '../utils/formatters';
// import SubmitExpenseModal from '../components/modals/SubmitExpenseModal';

// interface Expense {
//     id: string;
//     employee: { first_name: string; last_name: string } | null;
//     category: { name: string } | null;
//     amount: number;
//     date: string;
//     status: string;
//     description: string;
// }

// // Mock expense data
// const mockExpenses: Expense[] = [
//     {
//         id: '1',
//         employee: { first_name: 'John', last_name: 'Doe' },
//         category: { name: 'Travel' },
//         amount: 5000,
//         date: '2024-01-15',
//         status: 'pending_approval',
//         description: 'Client meeting travel expenses',
//     },
//     {
//         id: '2',
//         employee: { first_name: 'Jane', last_name: 'Smith' },
//         category: { name: 'Meals' },
//         amount: 2500,
//         date: '2024-01-14',
//         status: 'approved',
//         description: 'Team lunch meeting',
//     },
//     {
//         id: '3',
//         employee: { first_name: 'Robert', last_name: 'Johnson' },
//         category: { name: 'Office Supplies' },
//         amount: 1200,
//         date: '2024-01-13',
//         status: 'approved',
//         description: 'Printer ink and paper',
//     },
//     {
//         id: '4',
//         employee: { first_name: 'Sarah', last_name: 'Williams' },
//         category: { name: 'Software' },
//         amount: 15000,
//         date: '2024-01-12',
//         status: 'rejected',
//         description: 'Annual subscription for design tool',
//     },
//     {
//         id: '5',
//         employee: { first_name: 'Michael', last_name: 'Brown' },
//         category: { name: 'Travel' },
//         amount: 8000,
//         date: '2024-01-10',
//         status: 'pending_approval',
//         description: 'Conference travel and accommodation',
//     },
// ];

// export default function Expenses() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
//     const [loading, setLoading] = useState(false);
//     const [showSubmitModal, setShowSubmitModal] = useState(false);
//     const [stats, setStats] = useState({
//         pending: 0,
//         approved: 0,
//         total: 0,
//         rejected: 0,
//     });

//     useEffect(() => {
//         loadExpenses();
//         loadStats();
//     }, []);

//     const loadExpenses = async () => {
//         setLoading(true);
//         try {
//             // Mock loading with timeout
//             await new Promise(resolve => setTimeout(resolve, 500));
//             setExpenses(mockExpenses);
//         } catch (error) {
//             console.error('Error loading expenses:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStats = () => {
//         const pending = mockExpenses
//             .filter(e => e.status === 'pending_approval')
//             .reduce((sum, e) => sum + e.amount, 0);

//         const approved = mockExpenses
//             .filter(e => e.status === 'approved')
//             .reduce((sum, e) => sum + e.amount, 0);

//         const rejected = mockExpenses
//             .filter(e => e.status === 'rejected')
//             .reduce((sum, e) => sum + e.amount, 0);

//         const total = mockExpenses.length;

//         setStats({
//             pending,
//             approved,
//             total,
//             rejected,
//         });
//     };

//     const handleApprove = async (id: string) => {
//         try {
//             // Mock approval with timeout
//             await new Promise(resolve => setTimeout(resolve, 300));

//             setExpenses(prev => prev.map(expense =>
//                 expense.id === id ? { ...expense, status: 'approved' } : expense
//             ));

//             loadStats();
//             alert('Expense approved successfully');
//         } catch (error) {
//             console.error('Error approving expense:', error);
//         }
//     };

//     const handleReject = async (id: string) => {
//         try {
//             // Mock rejection with timeout
//             await new Promise(resolve => setTimeout(resolve, 300));

//             setExpenses(prev => prev.map(expense =>
//                 expense.id === id ? { ...expense, status: 'rejected' } : expense
//             ));

//             loadStats();
//             alert('Expense rejected');
//         } catch (error) {
//             console.error('Error rejecting expense:', error);
//         }
//     };

//     const handleSubmitExpense = (newExpense: any) => {
//         const expenseWithId = {
//             id: Date.now().toString(),
//             employee: { first_name: 'You', last_name: '' },
//             category: { name: newExpense.category || 'Other' },
//             amount: newExpense.amount || 0,
//             date: newExpense.date || new Date().toISOString().split('T')[0],
//             status: 'pending_approval',
//             description: newExpense.description || '',
//         };

//         setExpenses(prev => [expenseWithId, ...prev]);
//         loadStats();
//     };

//     const filteredExpenses = expenses.filter((expense) => {
//         const name = expense.employee
//             ? `${expense.employee.first_name} ${expense.employee.last_name}`.toLowerCase()
//             : '';
//         const description = expense.description.toLowerCase();
//         const searchLower = searchTerm.toLowerCase();
//         const matchesSearch = name.includes(searchLower) || description.includes(searchLower);
//         const matchesStatus = !statusFilter || expense.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <Button onClick={() => setShowSubmitModal(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Submit Expense
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Pending Approval</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">{formatters.currency(stats.pending)}</p>
//                             <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Approved This Month</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">{formatters.currency(stats.approved)}</p>
//                             <p className="text-xs text-slate-500 mt-1">Total approved</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <CheckCircle className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Total Submitted</p>
//                             <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
//                             <p className="text-xs text-slate-500 mt-1">This month</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Receipt className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Rejected</p>
//                             <p className="text-3xl font-bold text-red-600 mt-2">{formatters.currency(stats.rejected)}</p>
//                             <p className="text-xs text-slate-500 mt-1">This month</p>
//                         </div>
//                         <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <XCircle className="h-6 w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">Expense Claims</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">
//                         <div className="flex-1 min-w-64 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search employee or description..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <div className="flex gap-2">
//                             <select
//                                 value={statusFilter}
//                                 onChange={(e) => setStatusFilter(e.target.value)}
//                                 className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                                 <option value="">All Status</option>
//                                 <option value="pending_approval">Pending</option>
//                                 <option value="approved">Approved</option>
//                                 <option value="rejected">Rejected</option>
//                             </select>
//                             <Button
//                                 variant="secondary"
//                                 onClick={() => alert('Export functionality would download CSV in real app')}
//                             >
//                                 <Download className="h-4 w-4 mr-2" />
//                                 Export
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Description</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Amount</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Date</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {filteredExpenses.length === 0 ? (
//                                 <tr>
//                                     <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
//                                         No expenses found
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 filteredExpenses.map((expense) => (
//                                     <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
//                                         <td className="px-6 py-4">
//                                             <p className="font-medium text-slate-900">
//                                                 {expense.employee?.first_name} {expense.employee?.last_name}
//                                             </p>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{expense.category?.name || 'N/A'}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-600">{expense.description}</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <span className="text-sm font-semibold text-slate-900">{formatters.currency(expense.amount)}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="text-sm text-slate-900">{expense.date}</span>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <Badge variant={
//                                                 expense.status === 'approved' ? 'success' :
//                                                     expense.status === 'rejected' ? 'error' : 'warning'
//                                             }>
//                                                 {expense.status}
//                                             </Badge>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 {expense.status === 'pending_approval' && (
//                                                     <>
//                                                         <Button variant="secondary" size="sm" onClick={() => handleApprove(expense.id)}>
//                                                             <CheckCircle className="h-4 w-4 mr-1" />
//                                                             Approve
//                                                         </Button>
//                                                         <Button variant="secondary" size="sm" onClick={() => handleReject(expense.id)}>
//                                                             <XCircle className="h-4 w-4 mr-1" />
//                                                             Reject
//                                                         </Button>
//                                                     </>
//                                                 )}
//                                                 {expense.status !== 'pending_approval' && (
//                                                     <Button variant="secondary" size="sm" onClick={() => alert('Viewing expense details in real app')}>
//                                                         View
//                                                     </Button>
//                                                 )}
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <SubmitExpenseModal
//                 isOpen={showSubmitModal}
//                 onClose={() => setShowSubmitModal(false)}
//                 onSuccess={(newExpense) => {
//                     handleSubmitExpense(newExpense);
//                     setShowSubmitModal(false);
//                 }}
//             />
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import { Receipt, Plus, Search, Filter, Download, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
// import { expenseAPI } from '../api/expense.api';
import { formatters } from '../utils/formatters';
import SubmitExpenseModal from '../components/modals/SubmitExpenseModal';

interface Expense {
    id: string;
    employee: { first_name: string; last_name: string } | null;
    category: { name: string } | null;
    amount: number;
    date: string;
    status: string;
    description: string;
}

export default function Expenses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        total: 0,
        rejected: 0,
    });

    useEffect(() => {
        loadExpenses();
        loadStats();
    }, []);

    const loadExpenses = async () => {
        try {
            const data = await expenseAPI.getAll();
            setExpenses(data || []);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await expenseAPI.getStats();
            setStats({
                pending: data.pending || 0,
                approved: data.approved || 0,
                total: data.total || 0,
                rejected: data.rejected || 0,
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await expenseAPI.approve(id);
            loadExpenses();
            loadStats();
        } catch (error) {
            console.error('Error approving expense:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            await expenseAPI.reject(id);
            loadExpenses();
            loadStats();
        } catch (error) {
            console.error('Error rejecting expense:', error);
        }
    };

    const filteredExpenses = expenses.filter((expense) => {
        const name = expense.employee
            ? `${expense.employee.first_name} ${expense.employee.last_name}`.toLowerCase()
            : '';
        const description = expense.description.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = name.includes(searchLower) || description.includes(searchLower);
        const matchesStatus = !statusFilter || expense.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Expense Management</h1>
                    <p className="text-slate-600 mt-1">Track and manage employee expenses</p>
                </div>
                <Button onClick={() => setShowSubmitModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Expense
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Pending Approval</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{formatters.currency(stats.pending)}</p>
                            <p className="text-xs text-slate-500 mt-1">Awaiting review</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Approved This Month</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{formatters.currency(stats.approved)}</p>
                            <p className="text-xs text-slate-500 mt-1">Total approved</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Total Submitted</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.total}</p>
                            <p className="text-xs text-slate-500 mt-1">This month</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Rejected</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                            <p className="text-xs text-slate-500 mt-1">This month</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Expense Claims</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-64 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search employee or description..."
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
                                <option value="pending_approval">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                            <Button variant="secondary">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    </div>
                </div>

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
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredExpenses.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No expenses found
                                    </td>
                                </tr>
                            ) : (
                                filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-slate-900">
                                                {expense.employee?.first_name} {expense.employee?.last_name}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{expense.category?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-600">{expense.description}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-slate-900">{formatters.currency(expense.amount)}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{expense.date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                expense.status === 'approved' ? 'success' :
                                                    expense.status === 'rejected' ? 'error' : 'warning'
                                            }>
                                                {expense.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {expense.status === 'pending_approval' && (
                                                    <>
                                                        <Button variant="secondary" size="sm" onClick={() => handleApprove(expense.id)}>
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={() => handleReject(expense.id)}>
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {expense.status !== 'pending_approval' && (
                                                    <Button variant="secondary" size="sm">
                                                        View
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <SubmitExpenseModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onSuccess={() => {
                    loadExpenses();
                    loadStats();
                }}
            />
        </div>
    );
}
