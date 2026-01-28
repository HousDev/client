import { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Clock, Ticket, User, Building, FileText, MessageSquare, ChevronDown, Upload, Image as ImageIcon, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { HrmsEmployeesApi } from '../../lib/employeeApi';
import ticketApi from '../../lib/ticketApi';

interface CreateTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    categories: string[];
}

interface FileWithPreview {
    file: File;
    preview: string;
    id: string;
}

export default function CreateTicketModal({ isOpen, onClose, onSuccess, categories }: CreateTicketModalProps) {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [uploadedFiles, setUploadedFiles] = useState<FileWithPreview[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: '',
        priority: 'medium',
    });

    const priorities = [
        { value: 'low', label: 'Low', description: 'Minor issue, no time pressure' },
        { value: 'medium', label: 'Medium', description: 'Normal priority issue' },
        { value: 'high', label: 'High', description: 'Important issue affecting work' },
        { value: 'critical', label: 'Critical', description: 'System outage or critical issue' },
    ];

    // Fetch employee data
    useEffect(() => {
        const fetchEmployeeData = async () => {
            if (!isOpen || !profile) return;
            
            try {
                const employees = await HrmsEmployeesApi.getEmployees();
                let foundEmployee: any = null;
                
                if (profile.employee_id) {
                    foundEmployee = employees.find(emp => emp.id === profile.employee_id);
                }
                
                if (!foundEmployee && profile.email) {
                    foundEmployee = employees.find(emp => 
                        emp.email.toLowerCase() === profile.email.toLowerCase()
                    );
                }
                
                if (!foundEmployee && profile.first_name && profile.last_name) {
                    const fullName = `${profile.first_name} ${profile.last_name}`.toLowerCase();
                    foundEmployee = employees.find(emp => {
                        const empFullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase().trim();
                        return empFullName.includes(fullName) || fullName.includes(empFullName);
                    });
                }
                
                if (foundEmployee) {
                    setEmployeeData(foundEmployee);
                } else {
                    toast.error('Could not find your employee record. Please contact HR.');
                    onClose();
                }
            } catch (error) {
                console.error('Error fetching employee data:', error);
                toast.error('Failed to load your employee information');
                onClose();
            }
        };

        if (isOpen) {
            fetchEmployeeData();
        } else {
            // Reset when modal closes
            setEmployeeData(null);
            setUploadedFiles([]);
            setFormData({
                subject: '',
                description: '',
                category: '',
                priority: 'medium',
            });
        }
    }, [isOpen, profile, onClose]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        Array.from(files).forEach(file => {
            // Check file type
            if (!validTypes.includes(file.type)) {
                toast.error(`${file.name}: Only images and PDF files are allowed`);
                return;
            }

            // Check file size
            if (file.size > maxSize) {
                toast.error(`${file.name}: File size must be less than 10MB`);
                return;
            }

            // Check total files limit
            if (uploadedFiles.length >= 10) {
                toast.error('Maximum 10 files allowed');
                return;
            }

            // Create preview for images
            const reader = new FileReader();
            reader.onload = (e) => {
                const newFile: FileWithPreview = {
                    file,
                    preview: file.type.startsWith('image/') ? e.target?.result as string : '',
                    id: Math.random().toString(36).substr(2, 9)
                };
                setUploadedFiles(prev => [...prev, newFile]);
            };
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                const newFile: FileWithPreview = {
                    file,
                    preview: '',
                    id: Math.random().toString(36).substr(2, 9)
                };
                setUploadedFiles(prev => [...prev, newFile]);
            }
        });

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.subject || !formData.description || !formData.category) {
            toast.error('Please fill all required fields');
            return;
        }

        if (!employeeData) {
            toast.error('Employee information not found');
            return;
        }

        setLoading(true);
        try {
            const ticketData = {
                employee_id: employeeData.id,
                employee_name: `${employeeData.first_name} ${employeeData.last_name}`,
                employee_department: employeeData.department_name || '',
                employee_designation: employeeData.designation || '',
                category: formData.category,
                subject: formData.subject,
                description: formData.description,
                priority: formData.priority
            };

            // Convert FileWithPreview to File array
            const files = uploadedFiles.map(f => f.file);
            
            const result = await ticketApi.submitTicket(ticketData, files);
            
            toast.success(`Ticket created successfully! Ticket Number: ${result.ticket_number}`);
            
            // Reset form
            setFormData({
                subject: '',
                description: '',
                category: '',
                priority: 'medium',
            });
            setUploadedFiles([]);

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error creating ticket:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-4 border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#4a5568] via-[#2d3748] to-[#1a202c] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Ticket className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Create Support Ticket
                            </h2>
                            <p className="text-xs text-white/90 font-medium mt-0.5">
                                Submit a new support request
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {/* Employee Info */}
                    {employeeData && (
                        <div className="mb-6 border border-blue-200 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <User className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-700">Logged-in Employee</p>
                                        <p className="text-xs text-blue-600">Ticket will be created under your name</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Full Name</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        {employeeData.first_name} {employeeData.last_name}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Employee ID</p>
                                    <p className="text-sm font-semibold text-gray-800">
                                        #{employeeData.employee_code || employeeData.id}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Designation</p>
                                    <p className="text-sm text-gray-700">{employeeData.designation || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-500">Department</p>
                                    <p className="text-sm text-gray-700">{employeeData.department_name || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Subject */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-[#4a5568]" />
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4a5568] transition-colors">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#4a5568] focus:ring-2 focus:ring-[#4a5568]/20 outline-none transition-all duration-200 hover:border-gray-300"
                                    placeholder="Brief summary of your issue..."
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Category & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-[#4a5568]" />
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4a5568] transition-colors">
                                        <Building className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#4a5568] focus:ring-2 focus:ring-[#4a5568]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="" className="text-gray-400">Select Category</option>
                                        {categories.map((category) => (
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

                            <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-[#4a5568]" />
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#4a5568] transition-colors">
                                        <AlertCircle className="w-4 h-4" />
                                    </div>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#4a5568] focus:ring-2 focus:ring-[#4a5568]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                                        required
                                        disabled={loading}
                                    >
                                        {priorities.map((priority) => (
                                            <option key={priority.value} value={priority.value}>
                                                {priority.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Priority Description */}
                        {formData.priority === 'critical' && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-700">
                                    <span className="font-semibold">🚨 Critical Priority:</span> System-wide issue affecting multiple users or production outage. Response within 15 minutes.
                                </p>
                            </div>
                        )}

                        {formData.priority === 'high' && (
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <p className="text-sm text-orange-700">
                                    <span className="font-semibold">⚠️ High Priority:</span> Issue affecting your work significantly. Response within 1 hour.
                                </p>
                            </div>
                        )}

                        {formData.priority === 'medium' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-700">
                                    <span className="font-semibold">📝 Medium Priority:</span> Normal support request. Response within 24 hours.
                                </p>
                            </div>
                        )}

                        {formData.priority === 'low' && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-700">
                                    <span className="font-semibold">📋 Low Priority:</span> Minor issue or general inquiry. Response within 48 hours.
                                </p>
                            </div>
                        )}

                        {/* File Upload Section */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-[#4a5568]" />
                                Attachments (Optional)
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-gray-400 transition-colors">
                                <div className="text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Upload className="w-8 h-8 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">
                                                Drop files here or click to upload
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Supports images (JPG, PNG, GIF, WebP) and PDF files
                                            </p>
                                            <p className="text-xs text-gray-500">Max 10 files, 10MB each</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="mt-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 text-sm font-medium"
                                            disabled={loading}
                                        >
                                            Select Files
                                        </button>
                                    </div>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Uploaded Files Preview */}
                        {uploadedFiles.length > 0 && (
                            <div className="border border-gray-200 rounded-xl p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-gray-600" />
                                        <p className="text-sm font-medium text-gray-700">
                                            Attached Files ({uploadedFiles.length})
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setUploadedFiles([])}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        disabled={loading}
                                    >
                                        Clear All
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {uploadedFiles.map((file) => (
                                        <div 
                                            key={file.id} 
                                            className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                {file.preview ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 flex-shrink-0">
                                                            <img 
                                                                src={file.preview} 
                                                                alt={file.file.name}
                                                                className="w-full h-full object-cover rounded"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-700 truncate" title={file.file.name}>
                                                                {file.file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.file.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                                            <FileText className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-medium text-gray-700 truncate" title={file.file.name}>
                                                                {file.file.name}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {(file.file.size / 1024).toFixed(1)} KB
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(file.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                    disabled={loading}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#4a5568]" />
                                Description <span className="text-red-500">*</span>
                            </label>
                            <div className="relative group">
                                <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#4a5568] transition-colors">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <textarea
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#4a5568] focus:ring-2 focus:ring-[#4a5568]/20 outline-none transition-all duration-200 resize-none"
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Please describe your issue in detail. Include steps to reproduce, error messages, screenshots, and any relevant information..."
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Tip: The more details you provide, the faster we can help you resolve the issue.
                            </p>
                        </div>

                        {/* Information Note */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                            <p className="text-sm text-blue-700">
                                <span className="font-semibold">📋 What to expect:</span> After submitting, you'll receive a ticket number. Our support team will review your ticket and respond based on the priority level. You can track the status in the Support section.
                            </p>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.subject || !formData.description || !formData.category}
                                className="flex-1 bg-gradient-to-r from-[#4a5568] to-[#2d3748] text-white px-6 py-3 rounded-xl hover:from-[#2d3748] hover:to-[#1a202c] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Creating...
                                    </div>
                                ) : (
                                    'Create Ticket'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}