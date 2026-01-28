/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Calendar, FileText, UserRound, Upload, AlertCircle, 
  ChevronDown, Phone, Mail, Building, Hash, CheckSquare, 
  Clock, Package, MapPin, User, ChevronRight, UserCheck, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../lib/Api';
import { toast } from 'sonner';
import { HrmsEmployee } from '../../lib/employeeApi';
import { useAuth } from '../../contexts/AuthContext';

interface ApplyLeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employees: HrmsEmployee[];
}

export default function ApplyLeaveForm({ isOpen, onClose, onSuccess, employees }: ApplyLeaveFormProps) {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<HrmsEmployee | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: '',
    from_date: '',
    to_date: '',
    reason: '',
    attachment: null as File | null,
    is_half_day: false,
  });

  const formRef = useRef<HTMLDivElement>(null);

  const leaveTypes = [
    'Casual Leave',
    'Sick Leave',
    'Annual Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Privilege Leave',
    'Compensatory Leave',
    'Study Leave',
    'Bereavement Leave',
    'Marriage Leave',
  ];

  // Calculate days including weekends
  const calculateDays = () => {
    if (!formData.from_date) return 0;
    
    if (formData.is_half_day) {
      return 0.5;
    }
    
    if (!formData.to_date) return 0;
    
    const from = new Date(formData.from_date);
    const to = new Date(formData.to_date);
    
    // Calculate total days including both dates
    const timeDiff = to.getTime() - from.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return daysDiff > 0 ? daysDiff : 0;
  };

  // Auto-select logged in user's employee record
  useEffect(() => {
    if (isOpen && employees.length > 0 && profile) {
      console.log('Auto-selecting employee for:', profile);
      
      // Priority 1: Match by employee_id from profile
      if (profile.employee_id) {
        const employee = employees.find(emp => emp.id === profile.employee_id);
        if (employee) {
          setSelectedEmployee(employee);
          setFormData(prev => ({ 
            ...prev, 
            employee_id: employee.id.toString() 
          }));
          return;
        }
      }
      
      // Priority 2: Match by email
      if (profile.email) {
        const employee = employees.find(emp => 
          emp.email.toLowerCase() === profile.email.toLowerCase()
        );
        if (employee) {
          setSelectedEmployee(employee);
          setFormData(prev => ({ 
            ...prev, 
            employee_id: employee.id.toString() 
          }));
          return;
        }
      }
      
      // Priority 3: Match by name (fallback)
      if (profile.first_name && profile.last_name) {
        const employee = employees.find(emp => 
          emp.first_name.toLowerCase().includes(profile.first_name.toLowerCase()) ||
          emp.last_name.toLowerCase().includes(profile.last_name.toLowerCase())
        );
        if (employee) {
          setSelectedEmployee(employee);
          setFormData(prev => ({ 
            ...prev, 
            employee_id: employee.id.toString() 
          }));
          return;
        }
      }
      
      // If no match found, show error
      toast.error('Could not find your employee record. Please contact HR.');
      onClose();
    }
  }, [isOpen, employees, profile, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Update to_date when from_date changes and half day is selected
  useEffect(() => {
    if (formData.is_half_day && formData.from_date) {
      setFormData(prev => ({
        ...prev,
        to_date: prev.from_date
      }));
    }
  }, [formData.is_half_day, formData.from_date]);

  // Handle file upload with preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        e.target.value = '';
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, JPEG, and PNG files are allowed');
        e.target.value = '';
        return;
      }

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }

      setFormData(prev => ({ ...prev, attachment: file }));
    }
  };

  // Clear file and preview
  const clearFile = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
    setFilePreview(null);
    // Reset file input
    const fileInput = document.getElementById('attachment') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employee_id) {
      toast.error('Please select an employee');
      return;
    }

    if (!formData.leave_type) {
      toast.error('Please select leave type');
      return;
    }

    if (!formData.from_date) {
      toast.error('Please select leave date');
      return;
    }

    // Handle half day logic
    if (formData.is_half_day) {
      // For half day, ensure to_date is same as from_date
      if (!formData.to_date) {
        setFormData(prev => ({ ...prev, to_date: prev.from_date }));
      }
    } else {
      // For full day, validate to_date
      if (!formData.to_date) {
        toast.error('Please select to date');
        return;
      }
      
      if (new Date(formData.from_date) > new Date(formData.to_date)) {
        toast.error('From date cannot be after to date');
        return;
      }
    }

    // Check if from date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = new Date(formData.from_date);
    if (fromDate < today) {
      toast.error('From date cannot be in the past');
      return;
    }

    if (!formData.reason.trim()) {
      toast.error('Please provide a reason for leave');
      return;
    }

    if (formData.reason.length < 10) {
      toast.error('Please provide a more detailed reason (minimum 10 characters)');
      return;
    }

    const totalDays = calculateDays();
    
    // Validation for half days
    if (formData.is_half_day) {
      if (totalDays !== 0.5) {
        toast.error('Half day leave calculation error');
        return;
      }
    } else {
      // Only validate date range for full days
      if (totalDays <= 0) {
        toast.error('Invalid date range');
        return;
      }

      // Check if leave is more than 30 days (only for full days)
      if (totalDays > 30) {
        toast.error('Leave cannot exceed 30 days. Please contact HR for longer leaves.');
        return;
      }
    }

    setLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('employee_id', formData.employee_id);
      formDataObj.append('leave_type', formData.leave_type);
      formDataObj.append('from_date', formData.from_date);
      formDataObj.append('to_date', formData.to_date);
      formDataObj.append('reason', formData.reason);
      formDataObj.append('total_days', totalDays.toString());
      formDataObj.append('is_half_day', formData.is_half_day.toString());
      
      if (formData.attachment) {
        formDataObj.append('attachment', formData.attachment);
      }

      const response = await api.post('/leaves/apply', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Leave application submitted successfully!');
        toast.info('Your leave application is now pending approval.');
        onSuccess();
        onClose();
        resetForm();
      }
    } catch (error: any) {
      console.error('Error submitting leave:', error);
      toast.error(error.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      leave_type: '',
      from_date: '',
      to_date: '',
      reason: '',
      attachment: null,
      is_half_day: false,
    });
    setSelectedEmployee(null);
    setFilePreview(null);
  };

  // Check if form is valid for submission
  const isFormValid = () => {
    if (!formData.employee_id || !formData.leave_type || !formData.from_date) {
      return false;
    }

    if (!formData.is_half_day && !formData.to_date) {
      return false;
    }

    if (!formData.reason || formData.reason.length < 10) {
      return false;
    }

    const totalDays = calculateDays();
    if (totalDays <= 0) {
      return false;
    }

    if (!formData.is_half_day && totalDays > 30) {
      return false;
    }

    return true;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div 
        ref={formRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl my-4 border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Apply for Leave
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Submit a new leave application
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AUTO-SELECTED EMPLOYEE SECTION - NO DROPDOWN */}
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
                      {selectedEmployee ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}` : 'Loading...'}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Employee ID</p>
                    <p className="text-sm font-semibold text-gray-800">#{selectedEmployee?.employee_code || selectedEmployee?.id}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Designation</p>
                    <p className="text-sm text-gray-700">{selectedEmployee?.designation || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Department</p>
                    <p className="text-sm text-gray-700">{selectedEmployee?.department_name || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Email</p>
                    <p className="text-sm text-gray-700 truncate">{selectedEmployee?.email || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-500">Phone</p>
                    <p className="text-sm text-gray-700">{selectedEmployee?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                {/* Hidden input for form submission */}
                <input
                  type="hidden"
                  name="employee_id"
                  value={selectedEmployee?.id || ''}
                />
              </div>
            </div>

            {/* Leave Type & Dates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Leave Type */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Leave Type <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Package className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                    required
                  >
                    <option value="" className="text-gray-400">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type} value={type} className="py-2">{type}</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* From Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  From Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.from_date}
                    onChange={(e) => {
                      const newFromDate = e.target.value;
                      setFormData(prev => ({ 
                        ...prev, 
                        from_date: newFromDate,
                        // If half day is checked, update to_date as well
                        ...(prev.is_half_day ? { to_date: newFromDate } : {})
                      }));
                    }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    required
                  />
                </div>
              </div>

              {/* To Date */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  To Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.to_date}
                    onChange={(e) => {
                      if (!formData.is_half_day) {
                        setFormData({ ...formData, to_date: e.target.value });
                      }
                    }}
                    min={formData.from_date || new Date().toISOString().split('T')[0]}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm border-2 rounded-xl focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 ${
                      formData.is_half_day 
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
                        : 'border-gray-200 hover:border-gray-300 focus:border-[#C62828]'
                    }`}
                    required={!formData.is_half_day}
                    disabled={formData.is_half_day || !formData.from_date}
                  />
                  {formData.is_half_day && (
                    <div className="absolute right-10 top-1/2 -translate-y-1/2">
                      <div className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Auto
                      </div>
                    </div>
                  )}
                </div>
                {formData.is_half_day && (
                  <p className="text-xs text-blue-600 mt-1">
                    To date automatically set to {formData.from_date || 'selected date'} for half day leave
                  </p>
                )}
              </div>

              {/* Half Day Checkbox */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.is_half_day}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          setFormData(prev => ({ 
                            ...prev, 
                            is_half_day: isChecked,
                            // If half day is checked, set to_date same as from_date
                            ...(isChecked && prev.from_date ? { to_date: prev.from_date } : { to_date: '' })
                          }));
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C62828]"></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-800 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C62828]" />
                      Half Day Leave
                      {formData.is_half_day && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                          0.5 Day
                        </span>
                      )}
                    </span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 ml-14">
                  {formData.is_half_day 
                    ? "Half day leave selected (0.5 day). To date will be auto-set same as from date."
                    : "Check this if you're only taking half day leave"
                  }
                </p>
              </div>

              {/* Days Calculation */}
              {(formData.from_date && (formData.to_date || formData.is_half_day)) ? (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#C62828]" />
                    Total Leave Days
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl bg-gradient-to-r from-blue-50 to-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-blue-600">
                            {calculateDays()} {formData.is_half_day ? 'day' : `day${calculateDays() !== 1 ? 's' : ''}`}
                          </span>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formData.is_half_day ? 'Half day (0.5 day) leave' : 'Including both start and end dates'}
                          </p>
                        </div>
                        <div className={`p-1.5 rounded-lg ${calculateDays() > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <CheckSquare className={`w-4 h-4 ${calculateDays() > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                      </div>
                      {formData.is_half_day && (
                        <div className="mt-2 flex items-center gap-2 text-blue-600 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>Half day leave selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Date Range Summary */}
            {(formData.from_date && (formData.to_date || formData.is_half_day)) ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        {formData.is_half_day ? 'Half Day Leave' : 'Leave Period Summary'}
                      </p>
                      <p className="text-xs text-blue-600">
                        {formData.is_half_day 
                          ? `Half day on ${new Date(formData.from_date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}`
                          : `From ${new Date(formData.from_date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })} to ${new Date(formData.to_date).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-blue-600">Total Duration</p>
                    <p className="text-lg font-bold text-blue-700">
                      {calculateDays()} {formData.is_half_day ? 'day' : `day${calculateDays() !== 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                {!formData.is_half_day && calculateDays() > 30 && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    <span>Leave exceeds 30 days. Please contact HR for approval.</span>
                  </div>
                )}
                {formData.is_half_day && (
                  <div className="mt-2 flex items-center gap-2 text-blue-600 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Half day leave: Morning or Afternoon (to be confirmed)</span>
                  </div>
                )}
              </div>
            ) : null}

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#C62828]" />
                Reason for Leave <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 resize-none hover:border-gray-300"
                  placeholder="Please provide a detailed reason for your leave application. Include any relevant details that would help in the approval process..."
                  required
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                  {formData.reason.length}/500
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters required. Please be as detailed as possible.
              </p>
            </div>

            {/* ENHANCED FILE UPLOAD WITH PREVIEW */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#C62828]" />
                Supporting Document (Optional)
              </label>
              
              <div className="space-y-3">
                {/* File Input */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="file"
                    id="attachment"
                    onChange={handleFileUpload}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium file:cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                
                {/* Enhanced Preview Section */}
                {formData.attachment && (
                  <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                    <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-3 border-b border-blue-200">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        Document Preview
                      </h3>
                    </div>
                    
                    <div className="p-4">
                      {/* Image Preview */}
                      {filePreview && formData.attachment.type.startsWith('image/') && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-gray-500 mb-2">Image Preview:</p>
                          <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center p-4">
                            <img 
                              src={filePreview} 
                              alt="Document preview"
                              className="max-h-64 max-w-full rounded"
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* PDF Preview */}
                      {formData.attachment.type === 'application/pdf' && (
                        <div className="mb-4 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 p-6 flex flex-col items-center justify-center">
                          <FileText className="w-16 h-16 text-red-500 mb-3" />
                          <p className="text-sm font-medium text-gray-800">PDF Document</p>
                          <p className="text-xs text-gray-600 mt-1">Preview not available in browser</p>
                        </div>
                      )}
                      
                      {/* File Details */}
                      <div className="border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500">File Name</p>
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {formData.attachment.name}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500">File Size</p>
                            <p className="text-sm text-gray-700">
                              {(formData.attachment.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500">File Type</p>
                            <p className="text-sm text-gray-700">
                              {formData.attachment.type.split('/')[1].toUpperCase()}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-xs font-medium text-gray-500">Upload Status</p>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <p className="text-xs text-green-600 font-medium">Ready to upload</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Button */}
                        <div className="mt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={clearFile}
                            className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            Remove File
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Upload supporting documents like medical certificates, travel tickets, or invitation letters.
                Maximum file size: 5MB. Allowed formats: PDF, JPG, JPEG, PNG.
              </p>
            </div>

            {/* Important Notes */}
            <div className="border-2 border-yellow-200 rounded-xl overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
              <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-5 py-3 border-b border-yellow-200">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-yellow-600" />
                  </div>
                  Important Information & Guidelines
                </h3>
              </div>
              <div className="p-5">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Leave applications will be reviewed by HR/Manager within 2-3 working days
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      For leaves longer than 7 days, please apply at least 2 weeks in advance
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Medical leaves require a valid medical certificate for approval
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      You will be notified via email once your leave is approved/rejected
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  resetForm();
                }}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Submit Leave Application
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Custom Scrollbar Styles */}
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