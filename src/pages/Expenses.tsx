import { useState, useEffect, SetStateAction } from 'react';
import { Receipt, Plus, Search, Filter, Download, CheckCircle, XCircle, Clock, FileText, Trash2, Calendar, Package, X } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import expenseApi, { Expense } from '../lib/expenseApi';
import { HrmsEmployeesApi } from '../lib/employeeApi';
import { formatters } from '../utils/formatters';
import SubmitExpenseModal from '../components/modals/SubmitExpenseModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Expenses() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        total: 0,
        rejected: 0,
        total_amount: 0,
    });
    const [employees, setEmployees] = useState<any[]>([]);
    const [employeeMap, setEmployeeMap] = useState<Map<number, any>>(new Map());

    // Column search states
    const [searchClaimNumber, setSearchClaimNumber] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchMerchant, setSearchMerchant] = useState('');
    const [searchDescription, setSearchDescription] = useState('');
    const [searchAmount, setSearchAmount] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [searchStatus, setSearchStatus] = useState('');

    // Date filter states
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [ignoreDate, setIgnoreDate] = useState(false);
    const [showFilterSidebar, setShowFilterSidebar] = useState(false);

    // Bulk delete
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Get current user from localStorage or context
    const getCurrentUser = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return {
            user_id: user.id || 'admin',
            username: user.username || 'admin',
            name: user.name || 'Admin User'
        };
    };

    // Get current employee (logged in user)
    const getCurrentEmployee = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.employee || null;
    };

    useEffect(() => {
        const loadAllData = async () => {
            await loadEmployees();
            await loadExpenses();
            await loadStats();
        };
        loadAllData();
    }, []);

    useEffect(() => {
        let filtered = expenses;

        // Column searches
        if (searchClaimNumber) {
            filtered = filtered.filter(expense => 
                expense.claim_number?.toLowerCase().includes(searchClaimNumber.toLowerCase())
            );
        }

        if (searchCategory) {
            filtered = filtered.filter(expense => 
                expense.category?.toLowerCase().includes(searchCategory.toLowerCase())
            );
        }

        if (searchMerchant) {
            filtered = filtered.filter(expense => 
                expense.merchant_vendor_name?.toLowerCase().includes(searchMerchant.toLowerCase())
            );
        }

        if (searchDescription) {
            filtered = filtered.filter(expense => 
                expense.description?.toLowerCase().includes(searchDescription.toLowerCase())
            );
        }

        if (searchAmount) {
            filtered = filtered.filter(expense => 
                expense.amount?.toString().includes(searchAmount)
            );
        }

        if (searchDate) {
            filtered = filtered.filter(expense => 
                expense.expense_date?.includes(searchDate)
            );
        }

        if (searchStatus) {
            filtered = filtered.filter(expense => 
                expense.status?.toLowerCase().includes(searchStatus.toLowerCase())
            );
        }

        // Date filters
        if (!ignoreDate) {
            if (startDate) {
                filtered = filtered.filter((expense: any) => {
                    const transactionDate = new Date(expense.expense_date);
                    return transactionDate >= startDate;
                });
            }

            if (endDate) {
                filtered = filtered.filter((expense: any) => {
                    const transactionDate = new Date(expense.expense_date);
                    const adjustedEndDate = new Date(endDate);
                    adjustedEndDate.setHours(23, 59, 59, 999);
                    return transactionDate <= adjustedEndDate;
                });
            }
        }

        setFilteredExpenses(filtered);
        setSelectAll(false);
        setSelectedItems(new Set());
    }, [expenses, searchClaimNumber, searchCategory, searchMerchant, searchDescription, searchAmount, searchDate, searchStatus, startDate, endDate, ignoreDate]);

    const loadEmployees = async () => {
        try {
            const data = await HrmsEmployeesApi.getEmployees();
            setEmployees(data);
            
            const map = new Map();
            data.forEach(emp => map.set(emp.id, emp));
            setEmployeeMap(map);
        } catch (error) {
            console.error('Error loading employees:', error);
        }
    };

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const result = await expenseApi.getExpenses();
            
            // Merge employee data with expenses
            const expensesWithEmployees = result.data.map(expense => ({
                ...expense,
                employee: employeeMap.get(expense.employee_id)
            }));
            
            setExpenses(expensesWithEmployees);
            setFilteredExpenses(expensesWithEmployees);
        } catch (error) {
            console.error('Error loading expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await expenseApi.getExpenseStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleApprove = async (id: number) => {
        if (!confirm('Are you sure you want to approve this expense?')) return;
        
        try {
            const userData = getCurrentUser();
            await expenseApi.approveExpense(id, { ...userData, notes: 'Expense approved' });
            loadExpenses();
            loadStats();
        } catch (error) {
            console.error('Error approving expense:', error);
            alert('Failed to approve expense');
        }
    };

    const handleRejectClick = (id: number) => {
        setSelectedExpenseId(id);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleRejectConfirm = async () => {
        if (!selectedExpenseId) return;
        
        if (!rejectReason.trim()) {
            alert('Please enter a reason for rejection');
            return;
        }
        
        if (!confirm('Are you sure you want to reject this expense?')) return;
        
        try {
            const userData = getCurrentUser();
            await expenseApi.rejectExpense(selectedExpenseId, { ...userData, notes: rejectReason });
            loadExpenses();
            loadStats();
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedExpenseId(null);
        } catch (error) {
            console.error('Error rejecting expense:', error);
            alert('Failed to reject expense');
        }
    };

    const handleViewReceipt = async (expense: Expense) => {
        if (!expense.receipt_path) {
            alert('No receipt attached to this expense');
            return;
        }

        try {
            const blob = await expenseApi.downloadReceipt(expense.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = expense.receipt_original_name || 'receipt';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Error downloading receipt:', error);
            alert('Failed to download receipt');
        }
    };

    // Bulk delete handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(filteredExpenses.map((expense: any) => expense.id));
            setSelectedItems(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleSelectItem = (id: number) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
        setSelectAll(newSelected.size === filteredExpenses.length);
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) {
            alert("Please select expenses to delete");
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedItems.size} expense(s)? This action cannot be undone.`)) {
            return;
        }

        try {
            await Promise.all(
                Array.from(selectedItems).map((id) => expenseApi.deleteExpense(id))
            );
            alert(`${selectedItems.size} expense(s) deleted successfully!`);
            setSelectedItems(new Set());
            setSelectAll(false);
            await loadExpenses();
            await loadStats();
        } catch (error) {
            console.error("Error deleting expenses:", error);
            alert("Failed to delete expenses");
        }
    };

    const resetFilters = () => {
        setSearchClaimNumber('');
        setSearchCategory('');
        setSearchMerchant('');
        setSearchDescription('');
        setSearchAmount('');
        setSearchDate('');
        setSearchStatus('');
        setStartDate(null);
        setEndDate(null);
        setIgnoreDate(false);
        setShowFilterSidebar(false);
    };

    const applyFilters = () => {
        setShowFilterSidebar(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-3 md:p-4 bg-gray-50 min-h-screen">
            {/* Delete Button (Appears when checkboxes are selected) */}
            {selectedItems.size > 0 && (
                <div className="mb-4">
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm p-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-lg">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">
                                        {selectedItems.size} expense{selectedItems.size > 1 ? 's' : ''} selected
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Click delete to remove selected items
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                                <Trash2 className="w-3 h-3" />
                                Delete ({selectedItems.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Expense Management</h1>
                    <p className="text-gray-600 text-sm mt-1">Track and manage employee expenses</p>
                </div>
                <Button onClick={() => setShowSubmitModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Expense
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm text-gray-600">Pending Approval</p>
                            <p className="text-xl md:text-3xl font-bold text-yellow-600 mt-1 md:mt-2">{stats.pending}</p>
                            <p className="text-xs text-gray-500">Awaiting review</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm text-gray-600">Approved</p>
                            <p className="text-xl md:text-3xl font-bold text-green-600 mt-1 md:mt-2">{stats.approved}</p>
                            <p className="text-xs text-gray-500">Total approved</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm text-gray-600">Total Amount</p>
                            <p className="text-xl md:text-3xl font-bold text-blue-600 mt-1 md:mt-2">{formatters.currency(stats.total_amount)}</p>
                            <p className="text-xs text-gray-500">This month</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Receipt className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4 md:p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs md:text-sm text-gray-600">Rejected</p>
                            <p className="text-xl md:text-3xl font-bold text-red-600 mt-1 md:mt-2">{stats.rejected}</p>
                            <p className="text-xs text-gray-500">This month</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-200 border-b border-gray-200">
                            <tr>
                                <th className="px-2 md:px-4 py-2 text-center w-10">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-3 h-3 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                                    />
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Claim No.
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employee
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Merchant/Vendor
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Description
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Amount
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </div>
                                </th>
                                <th className="px-2 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </div>
                                </th>
                            </tr>
                            
                            {/* Search Row */}
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <td className="px-2 md:px-4 py-1"></td>
                                
                                {/* Claim Number Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchClaimNumber}
                                        onChange={(e) => setSearchClaimNumber(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Employee Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchDescription}
                                        onChange={(e) => setSearchDescription(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Category Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Merchant/Vendor Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchMerchant}
                                        onChange={(e) => setSearchMerchant(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Description Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchDescription}
                                        onChange={(e) => setSearchDescription(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Amount Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchAmount}
                                        onChange={(e) => setSearchAmount(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Date Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <input
                                        type="date"
                                        value={searchDate}
                                        onChange={(e) => setSearchDate(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </td>
                                
                                {/* Status Column */}
                                <td className="px-2 md:px-4 py-1">
                                    <select
                                        value={searchStatus}
                                        onChange={(e) => setSearchStatus(e.target.value)}
                                        className="w-full px-2 py-1 text-[10px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent bg-white"
                                    >
                                        <option value="">All</option>
                                        <option value="pending_approval">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </td>
                                
                                {/* Actions Column - Filter icon */}
                                <td className="px-2 md:px-4 py-1 text-center">
                                    <button
                                        onClick={() => setShowFilterSidebar(true)}
                                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[10px] md:text-xs font-medium text-gray-700"
                                        title="Advanced Filters"
                                    >
                                        <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                                        Date Filters
                                    </button>
                                </td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredExpenses.map((expense) => {
                                const isSelected = selectedItems.has(expense.id);
                                const employeeName = expense.employee 
                                    ? `${expense.employee.first_name} ${expense.employee.last_name}`
                                    : `ID: ${expense.employee_id}`;

                                return (
                                    <tr
                                        key={expense.id}
                                        className={`hover:bg-gray-50 transition ${
                                            isSelected ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <td className="px-2 md:px-4 py-2 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectItem(expense.id)}
                                                className="w-3 h-3 md:w-4 md:h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="font-medium text-gray-800 text-xs md:text-sm truncate max-w-[120px]" title={expense.claim_number}>
                                                {expense.claim_number}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]" title={employeeName}>
                                                {employeeName}
                                            </div>
                                            {/* Show Employee ID below the name */}
                                            <div className="text-[10px] text-gray-500 mt-0.5">
                                                ID: {expense.employee_id}
                                            </div>
                                            {expense.employee?.designation && (
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {expense.employee.designation}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-800 text-xs md:text-sm truncate max-w-[100px]" title={expense.category}>
                                                {expense.category}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-800 text-xs md:text-sm truncate max-w-[120px]" title={expense.merchant_vendor_name}>
                                                {expense.merchant_vendor_name}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-600 text-xs md:text-sm truncate max-w-[150px]" title={expense.description}>
                                                {expense.description}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-800 text-xs md:text-sm font-semibold">
                                                ₹{formatters.currency(expense.amount)}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="text-gray-800 text-xs md:text-sm whitespace-nowrap">
                                                {formatters.date(expense.expense_date)}
                                            </div>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <Badge variant={
                                                expense.status === 'approved' ? 'success' :
                                                expense.status === 'rejected' ? 'error' : 'warning'
                                            } className="text-[10px]">
                                                {expense.status.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className="px-2 md:px-4 py-2">
                                            <div className="flex items-center gap-1">
                                                {expense.receipt_path && (
                                                    <button
                                                        onClick={() => handleViewReceipt(expense)}
                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
                                                        title="View Receipt"
                                                    >
                                                        <FileText className="w-3 h-3 md:w-4 md:h-4" />
                                                    </button>
                                                )}
                                                {expense.status === 'pending_approval' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(expense.id)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded transition"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectClick(expense.id)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-3 h-3 md:w-4 md:h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {filteredExpenses.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-4 py-8 text-center">
                                        <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 text-sm md:text-lg font-medium">No Expenses Found</p>
                                        <p className="text-gray-500 text-xs md:text-sm mt-1">
                                            {searchClaimNumber || searchMerchant || searchDescription
                                                ? "Try a different search term"
                                                : "No expense claims available"}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Filter Sidebar */}
            {showFilterSidebar && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                        onClick={() => setShowFilterSidebar(false)}
                    />

                    <div className={`
                        absolute inset-y-0 right-0
                        bg-white shadow-2xl flex flex-col
                        transition-transform duration-300 ease-out
                        ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}
                        w-[90vw] max-w-none
                        md:max-w-md md:w-full
                    `}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm md:text-xl font-bold text-white">
                                        Date Filters
                                    </h2>
                                    <p className="text-xs md:text-sm text-white/80">
                                        Select a date range to filter expenses
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 md:gap-3">
                                <button
                                    onClick={resetFilters}
                                    className="text-white text-xs md:text-sm hover:bg-white hover:bg-opacity-20 px-2 md:px-3 py-1 md:py-1.5 rounded transition font-medium"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => setShowFilterSidebar(false)}
                                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-1.5 transition"
                                >
                                    <X className="w-4 h-4 md:w-5 md:h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* From Date */}
                                    <div className="space-y-2">
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            From Date
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                selectsStart
                                                startDate={startDate}
                                                endDate={endDate}
                                                maxDate={endDate || new Date()}
                                                placeholderText="Select start date"
                                                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                dateFormat="dd/MM/yyyy"
                                                isClearable
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* To Date */}
                                    <div className="space-y-2">
                                        <label className="block text-xs md:text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-blue-600" />
                                            To Date
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date: SetStateAction<Date | null>) => setEndDate(date)}
                                                selectsEnd
                                                startDate={startDate}
                                                endDate={endDate}
                                                minDate={startDate || undefined}
                                                maxDate={new Date()}
                                                placeholderText="Select end date"
                                                className="w-full pl-9 md:pl-10 pr-3 md:pr-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                dateFormat="dd/MM/yyyy"
                                                isClearable
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                <Calendar className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Date Summary */}
                                {(startDate || endDate) && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-xs md:text-sm font-medium text-gray-800">
                                            Selected Range
                                        </p>
                                        <p className="text-[11px] md:text-xs text-gray-600">
                                            {startDate ? startDate.toLocaleDateString("en-GB") : "Any"} →{" "}
                                            {endDate ? endDate.toLocaleDateString("en-GB") : "Any"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Ignore Date */}
                            <div className="border-t pt-4">
                                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <input
                                        type="checkbox"
                                        checked={ignoreDate}
                                        onChange={(e) => {
                                            setIgnoreDate(e.target.checked);
                                            if (e.target.checked) {
                                                setStartDate(null);
                                                setEndDate(null);
                                            }
                                        }}
                                        className="w-4 h-4 md:w-5 md:h-5 text-blue-600"
                                    />
                                    <div>
                                        <p className="text-xs md:text-sm font-medium text-gray-700">
                                            Ignore Date Filters
                                        </p>
                                        <p className="text-[11px] md:text-xs text-gray-500">
                                            Show all data regardless of date
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3">
                            <button
                                onClick={resetFilters}
                                className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Expense Modal */}
            <SubmitExpenseModal
                isOpen={showSubmitModal}
                onClose={() => setShowSubmitModal(false)}
                onSuccess={() => {
                    loadExpenses();
                    loadStats();
                }}
            />

            {/* Reject Expense Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
                        onClick={() => {
                            setShowRejectModal(false);
                            setRejectReason('');
                            setSelectedExpenseId(null);
                        }}
                    />

                    <div className={`
                        absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        bg-white rounded-xl shadow-2xl flex flex-col
                        transition-all duration-300 ease-out
                        ${showRejectModal ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                        w-[90vw] max-w-md
                    `}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 rounded-t-xl flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <XCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-white">
                                        Reject Expense
                                    </h2>
                                    <p className="text-sm text-white/80">
                                        Please provide a reason for rejection
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedExpenseId(null);
                                }}
                                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                            <div className="space-y-4">
                                <p className="text-gray-700 text-sm">
                                    Please enter the reason for rejecting this expense claim. This will be recorded and visible to the employee.
                                </p>
                                
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Reason for Rejection *
                                    </label>
                                    <textarea
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        placeholder="Enter detailed reason for rejection..."
                                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all resize-none min-h-[120px]"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500">
                                        Required field. Minimum 10 characters.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t p-4 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedExpenseId(null);
                                }}
                                className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectConfirm}
                                disabled={!rejectReason.trim() || rejectReason.trim().length < 10}
                                className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2.5 text-sm rounded-lg hover:shadow-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 