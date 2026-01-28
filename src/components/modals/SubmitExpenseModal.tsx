import React, { useState, useEffect, useRef } from "react";
import {
    X,
    Save,
    Calendar,
    Building,
    FileText,
    ChevronDown,
    UserRound,
    CreditCard,
    DollarSign,
    Receipt,
    Tag,
    UserCheck,
    Mail,
    Phone,
    Hash,
    Briefcase
} from "lucide-react";
import { toast } from "sonner";
import expenseApi from "../../lib/expenseApi";
import { HrmsEmployeesApi, HrmsEmployee } from "../../lib/employeeApi";
import { useAuth } from "../../contexts/AuthContext";

interface SubmitExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ExpenseFormData {
    employee_id: string;
    category: string;
    expense_date: string;
    merchant_vendor_name: string;
    description: string;
    amount: string;
    receipt: File | null;
}

export default function SubmitExpenseModal({ isOpen, onClose, onSuccess }: SubmitExpenseModalProps) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [fetchingEmployee, setFetchingEmployee] = useState(false);
    const [employeeData, setEmployeeData] = useState<HrmsEmployee | null>(null);
    const formRef = useRef<HTMLDivElement>(null);
    
    const [formData, setFormData] = useState<ExpenseFormData>({
        employee_id: '',
        category: '',
        expense_date: new Date().toISOString().split('T')[0],
        merchant_vendor_name: '',
        description: '',
        amount: '',
        receipt: null
    });

    const expenseCategories = [
        'Travel',
        'Meals',
        'Accommodation',
        'Office Supplies',
        'Software/Subscriptions',
        'Training/Conference',
        'Transportation',
        'Entertainment',
        'Communication',
        'Others'
    ];

    // Fetch employee data based on logged-in user - SIMILAR TO LEAVE FORM
    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!isOpen) return;
            
            setFetchingEmployee(true);
            try {
                console.log('Fetching employee for profile:', profile);
                
                // Get all employees
                const employees = await HrmsEmployeesApi.getEmployees();
                console.log('All employees:', employees);
                
                let foundEmployee: HrmsEmployee | null = null;
                
                // Priority 1: Match by employee_id from profile
                if (profile?.employee_id) {
                    foundEmployee = employees.find(emp => emp.id === profile.employee_id) || null;
                    console.log('Search by employee_id:', profile.employee_id, foundEmployee);
                }
                
                // Priority 2: Match by email
                if (!foundEmployee && profile?.email) {
                    foundEmployee = employees.find(emp => 
                        emp.email.toLowerCase() === profile.email.toLowerCase()
                    ) || null;
                    console.log('Search by email:', profile.email, foundEmployee);
                }
                
                // Priority 3: Match by name (fallback)
                if (!foundEmployee && profile?.first_name && profile?.last_name) {
                    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
                    foundEmployee = employees.find(emp => {
                        const empFullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().trim();
                        return empFullName.includes(fullName) || fullName.includes(empFullName);
                    }) || null;
                    console.log('Search by name:', fullName, foundEmployee);
                }
                
                if (foundEmployee) {
                    setEmployeeData(foundEmployee);
                    setFormData(prev => ({ 
                        ...prev, 
                        employee_id: foundEmployee.id.toString() 
                    }));
                } else {
                    console.error('No employee found for profile:', profile);
                    toast.error('Could not find your employee record. Please contact HR.');
                    onClose();
                }
            } catch (error: any) {
                console.error('Error fetching employee data:', error);
                toast.error('Failed to load your employee information');
                onClose();
            } finally {
                setFetchingEmployee(false);
            }
        };

        if (isOpen) {
            fetchEmployeeData();
        } else {
            // Reset when modal closes
            setEmployeeData(null);
            setFormData({
                employee_id: '',
                category: '',
                expense_date: new Date().toISOString().split('T')[0],
                merchant_vendor_name: '',
                description: '',
                amount: '',
                receipt: null
            });
        }
    }, [isOpen, profile, onClose]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (formRef.current && !formRef.current.contains(event.target as Node)) {
                if (!loading) {
                    resetForm();
                    onClose();
                }
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, loading]);

    const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("File size must be less than 5MB");
                e.target.value = '';
                return;
            }
            setFormData((prev) => ({ ...prev, receipt: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.category || !formData.expense_date || 
            !formData.merchant_vendor_name || !formData.description || !formData.amount) {
            toast.error("Please fill all required fields");
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        if (amount > 1000000) { // 1 million limit
            toast.error("Amount cannot exceed ₹10,00,000");
            return;
        }

        // Date validation
        const expenseDate = new Date(formData.expense_date);
        if (expenseDate > new Date()) {
            toast.error("Expense date cannot be in the future");
            return;
        }

        // Check if date is too old (optional)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        if (expenseDate < oneYearAgo) {
            toast.error("Expense date cannot be older than 1 year");
            return;
        }

        setLoading(true);
        try {
            const formDataObj = new FormData();
            formDataObj.append('employee_id', formData.employee_id);
            formDataObj.append('category', formData.category);
            formDataObj.append('expense_date', formData.expense_date);
            formDataObj.append('merchant_vendor_name', formData.merchant_vendor_name);
            formDataObj.append('description', formData.description);
            formDataObj.append('amount', formData.amount);
            
            if (formData.receipt) {
                formDataObj.append('receipt', formData.receipt);
            }

            const result = await expenseApi.submitExpense(formDataObj);
            
            toast.success(`Expense claim submitted successfully! Claim Number: ${result.claim_number}`);

            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error submitting expense:', error);
            const errorMessage = error.response?.data?.message || 'Failed to submit expense claim';
            
            // Handle duplicate entry error
            if (errorMessage.includes('Duplicate entry') && errorMessage.includes('claim_number')) {
                toast.error("A duplicate expense claim was detected. Please try again or contact support.");
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            employee_id: employeeData?.id.toString() || '',
            category: '',
            expense_date: new Date().toISOString().split('T')[0],
            merchant_vendor_name: '',
            description: '',
            amount: '',
            receipt: null
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div 
                ref={formRef}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-4 border border-gray-200 overflow-hidden"
            >
                {/* Header - Updated to match Material In Form */}
                <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Submit Expense Claim
                            </h2>
                            <p className="text-xs text-white/90 font-medium mt-0.5">
                                Submit new expense for approval
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (!loading) {
                                resetForm();
                                onClose();
                            }
                        }}
                        disabled={loading}
                        className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {fetchingEmployee ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 border-4 border-[#C62828]/30 border-t-[#C62828] rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600 font-medium">Loading your employee information...</p>
                            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your details</p>
                        </div>
                    ) : employeeData ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Employee Info (Display only) - Enhanced like Leave Form */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <UserRound className="w-4 h-4 text-[#C62828]" />
                                    Employee <span className="text-red-500">*</span>
                                </label>
                                
                                {/* Auto-filled employee info */}
                                <div className="border-2 border-green-200 rounded-xl p-4 bg-green-50/50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <UserCheck className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-green-700">Logged-in Employee</p>
                                                <p className="text-xs text-green-600 mt-0.5">Auto-selected based on your login</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">Full Name</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {employeeData.first_name} {employeeData.last_name}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">Employee ID</p>
                                            <p className="text-sm font-semibold text-gray-800">
                                                {employeeData.employee_code ? `#${employeeData.employee_code}` : `#${employeeData.id}`}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">Designation</p>
                                            <p className="text-sm text-gray-700">{employeeData.designation || 'N/A'}</p>
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-gray-500">Department</p>
                                            <p className="text-sm text-gray-700">{employeeData.department_name || 'N/A'}</p>
                                        </div>
                                        
                                        {employeeData.email && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500">Email</p>
                                                <p className="text-sm text-gray-700 truncate flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-gray-500" />
                                                    {employeeData.email}
                                                </p>
                                            </div>
                                        )}
                                        
                                        {employeeData.phone && (
                                            <div className="space-y-1">
                                                <p className="text-xs font-medium text-gray-500">Phone</p>
                                                <p className="text-sm text-gray-700 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-500" />
                                                    {employeeData.phone}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Hidden input for form submission */}
                                    <input
                                        type="hidden"
                                        name="employee_id"
                                        value={employeeData.id.toString()}
                                    />
                                </div>
                            </div>

                            {/* Category and Date */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-[#C62828]" />
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                                            <Tag className="w-4 h-4" />
                                        </div>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => handleInputChange("category", e.target.value)}
                                            className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                                            required
                                            disabled={loading}
                                        >
                                            <option value="" className="text-gray-400">Select Category</option>
                                            {expenseCategories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#C62828]" />
                                        Expense Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="date"
                                            value={formData.expense_date}
                                            onChange={(e) => handleInputChange("expense_date", e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                                            max={new Date().toISOString().split('T')[0]}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Merchant/Vendor and Amount */}
                           {/* Merchant/Vendor and Amount */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Building className="w-4 h-4 text-[#C62828]" />
            Merchant/Vendor <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                <Building className="w-4 h-4" />
            </div>
            <input
                type="text"
                value={formData.merchant_vendor_name}
                onChange={(e) => handleInputChange("merchant_vendor_name", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                placeholder="Enter merchant or vendor name"
                required
                disabled={loading}
            />
        </div>
    </div>

    <div className="space-y-1.5">
        <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <span className="text-lg font-bold text-[#C62828]">₹</span>
            Amount (₹) <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                <span className="text-lg font-bold">₹</span>
            </div>
            <input
                type="number"
                step="0.01"
                min="1"
                max="1000000"
                value={formData.amount}
                onChange={(e) => handleInputChange("amount", e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                placeholder="0.00"
                required
                disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <span className="text-sm font-medium">₹</span>
            </div>
        </div>
    </div>
</div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-[#C62828]" />
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Enter expense description (purpose, details, etc.)"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Receipt Upload */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-[#C62828]" />
                                    Receipt (Optional - Max 5MB)
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-[#C62828] transition-colors">
                                        <Receipt className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="file"
                                        id="receipt"
                                        onChange={handleFileUpload}
                                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium file:cursor-pointer"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        disabled={loading}
                                    />
                                </div>
                                {formData.receipt && (
                                    <div className="flex items-center gap-2 mt-1 animate-fadeIn">
                                        <div className="p-1.5 bg-green-100 rounded-lg">
                                            <FileText className="w-4 h-4 text-green-600" />
                                        </div>
                                        <p className="text-xs text-green-600 font-medium">
                                            File selected: {formData.receipt.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Important Note */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-2">
                                <p className="text-xs text-yellow-700">
                                    <span className="font-semibold">Important:</span> Please attach supporting documents (receipts/invoices) for verification. Claims without supporting documents may be rejected. Maximum file size: 5MB.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Submit Expense
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        onClose();
                                    }}
                                    disabled={loading}
                                    className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <UserRound className="w-6 h-6 text-red-600" />
                            </div>
                            <p className="text-gray-600 font-medium">Unable to load employee information</p>
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                Please ensure you have a valid employee profile or contact HR
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-4 px-4 py-2 text-sm border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>

                {/* Add some custom styles for scrollbar */}
                <style >{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 6px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-track {
                        background: #f1f1f1;
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #c62828;
                        border-radius: 3px;
                    }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #b71c1c;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out;
                    }
                `}</style>
            </div>
        </div>
    );
}