import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, User, FileText, CheckCircle, XCircle, Clock, 
  Download, Mail, Phone, Building, Hash, AlertCircle, ChevronRight,
  Clock as TimeIcon, UserCheck, UserX, MessageSquare, Paperclip,
  Eye, FileIcon, Image as ImageIcon
} from 'lucide-react';
import { api } from '../../lib/Api';
import { toast } from 'sonner';
import { HrmsEmployee } from '../../lib/employeeApi';

interface ViewLeaveDetailsProps {
  leave: any;
  onClose: () => void;
  employees: HrmsEmployee[];
}

export default function ViewLeaveDetails({ leave, onClose, employees }: ViewLeaveDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [employeeDetails, setEmployeeDetails] = useState<HrmsEmployee | null>(null);
  const [approverDetails, setApproverDetails] = useState<any>(null);
  const [rejecterDetails, setRejecterDetails] = useState<any>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string; name: string } | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get base URL based on environment
  const getBaseUrl = () => {
    // Check if we're in development or production
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:4000';
    } else {
      return window.location.origin.includes('nayashgroup.in') 
        ? 'https://nayashgroup.in'
        : window.location.origin;
    }
  };

  // Build full URL for attachments
 // Build full URL for attachments - FIXED
const buildAttachmentUrl = (path: string) => {
  if (!path) return '';
  
  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  const baseUrl = getBaseUrl();
  
  // Remove any leading slashes
  const cleanPath = path.replace(/^\/+/, '');
  
  // ⭐ FIXED: Don't add /api, images are served from /uploads directly
  return `${baseUrl}/${cleanPath}`;
};

  // Load employee details
  useEffect(() => {
    if (leave && employees.length > 0) {
      const employee = employees.find(emp => emp.id === leave.employee_id);
      if (employee) {
        setEmployeeDetails(employee);
      }
    }
  }, [leave, employees]);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get file icon based on type
  const getFileIcon = (fileName: string, fileType?: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    } else if (fileType?.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <ImageIcon className="w-5 h-5 text-green-600" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    } else {
      return <FileIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  // Handle download - Fixed version
  const handleDownload = async () => {
    if (!leave.attachment_path) {
      toast.error('No attachment available');
      return;
    }

    setLoading(true);
    try {
      // First try to get the file via API
      const response = await api.get(`/leaves/${leave.id}/download`, {
        responseType: 'blob'
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      // Create blob from response
      const blob = new Blob([response.data], { 
        type: leave.attachment_type || response.headers['content-type'] || 'application/octet-stream' 
      });
      
      // Create download URL
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = leave.attachment_name || 'leave_document';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Ensure filename has proper extension
      const extension = filename.split('.').pop()?.toLowerCase();
      const fileType = leave.attachment_type || '';
      
      if (!extension || (fileType && !extension.match(/(pdf|jpg|jpeg|png|gif|doc|docx)$/i))) {
        if (fileType.includes('pdf')) {
          filename += '.pdf';
        } else if (fileType.includes('jpeg') || fileType.includes('jpg')) {
          filename += '.jpg';
        } else if (fileType.includes('png')) {
          filename += '.png';
        } else if (fileType.includes('gif')) {
          filename += '.gif';
        } else if (fileType.includes('msword') || fileType.includes('docx')) {
          filename += '.docx';
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        link.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('File downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading attachment:', error);
      
      // Fallback: Try direct URL access
      try {
        const downloadUrl = buildAttachmentUrl(leave.attachment_path);
        console.log('Trying fallback download URL:', downloadUrl);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.setAttribute('download', leave.attachment_name || 'document');
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          link.remove();
        }, 100);
        
        toast.info('Opening download in new tab...');
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        toast.error('Failed to download attachment. Please contact administrator.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle file preview
  const handlePreview = async () => {
    if (!leave.attachment_path) {
      toast.error('No attachment available for preview');
      return;
    }

    setLoading(true);
    try {
      // Determine file type
      const fileType = leave.attachment_type?.toLowerCase() || '';
      const fileName = leave.attachment_name?.toLowerCase() || '';
      const isImage = fileType.includes('image') || 
                     ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].some(ext => 
                       fileName.endsWith(ext) || fileType.includes(ext)
                     );
      const isPDF = fileType.includes('pdf') || fileName.endsWith('.pdf');

      if (isImage) {
        // For images, build the full URL
        const imageUrl = buildAttachmentUrl(leave.attachment_path);
        console.log('Image preview URL:', imageUrl);
        
        // Test if the image loads
        await new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = reject;
          img.src = imageUrl;
        });
        
        setPreviewFile({
          url: imageUrl,
          type: 'image',
          name: leave.attachment_name || 'Image'
        });
        setIsPreviewOpen(true);
        
      } else if (isPDF) {
        // For PDFs, try to get via API first
        try {
          const response = await api.get(`/leaves/${leave.id}/download`, {
            responseType: 'blob'
          });
          
          const blob = new Blob([response.data], { type: 'application/pdf' });
          const pdfUrl = URL.createObjectURL(blob);
          
          setPreviewFile({
            url: pdfUrl,
            type: 'pdf',
            name: leave.attachment_name || 'Document'
          });
          setIsPreviewOpen(true);
        } catch (pdfError) {
          // Fallback: try direct URL for PDF
          const pdfUrl = buildAttachmentUrl(leave.attachment_path);
          console.log('PDF fallback URL:', pdfUrl);
          
          setPreviewFile({
            url: pdfUrl,
            type: 'pdf',
            name: leave.attachment_name || 'Document'
          });
          setIsPreviewOpen(true);
        }
        
      } else {
        toast.info('Preview is only available for images and PDF files');
        // For other file types, just download
        handleDownload();
      }
    } catch (error) {
      console.error('Error preparing preview:', error);
      
      // Try alternative method for images
      if (leave.attachment_path) {
        const altUrl = buildAttachmentUrl(leave.attachment_path);
        console.log('Trying alternative URL:', altUrl);
        
        // Check if it might be an image by extension
        const ext = leave.attachment_name?.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
          setPreviewFile({
            url: altUrl,
            type: 'image',
            name: leave.attachment_name || 'Image'
          });
          setIsPreviewOpen(true);
        } else {
          toast.error('Unable to preview file. Please download instead.');
        }
      } else {
        toast.error('Unable to preview file. Please download instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Close preview and clean up URLs
  const closePreview = () => {
    if (previewFile?.url && previewFile.url.startsWith('blob:')) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    setIsPreviewOpen(false);
  };

  const getStatusConfig = () => {
    switch (leave.status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          color: 'bg-green-100 text-green-700',
          bgColor: 'bg-green-50 border-green-200',
          textColor: 'text-green-700'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-5 h-5 text-red-600" />,
          color: 'bg-red-100 text-red-700',
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-700'
        };
      default:
        return {
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          color: 'bg-yellow-100 text-yellow-700',
          bgColor: 'bg-yellow-50 border-yellow-200',
          textColor: 'text-yellow-700'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <>
      {/* Main Modal with backdrop blur */}
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
  {/* Backdrop - only opacity, no blur */}
  <div 
    className="fixed inset-0 bg-black/30 backdrop-blur-sm"
    onClick={onClose}
  />
  
  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden relative z-10">
          {/* Header - MaterialInForm Style */}
          <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Leave Application Details</h2>
                <p className="text-xs text-white/90 font-medium mt-0.5">
                  Application #{leave.application_number}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="space-y-6">
              {/* Status & Actions Header */}
              <div className="flex items-center justify-between">
                <div className={`px-4 py-2 rounded-lg font-medium ${statusConfig.color}`}>
                  <div className="flex items-center gap-2">
                    {statusConfig.icon}
                    <span>{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                  </div>
                </div>
                
                {/* Download Button */}
                {leave.attachment_path && (
                  <div className="flex gap-2">
                    <button
                      onClick={handlePreview}
                      disabled={loading}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                      Preview
                    </button>
                    <button
                      onClick={handleDownload}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Download
                    </button>
                  </div>
                )}
              </div>

              {/* Main Grid - 2 Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Employee Details */}
                <div className="space-y-4">
                  {/* Employee Card */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        Employee Information
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {/* Employee Name & ID */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Employee Name</p>
                          <p className="text-lg font-bold text-gray-800">
                            {employeeDetails ? `${employeeDetails.first_name} ${employeeDetails.last_name}` : 'Loading...'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-500">Employee ID</p>
                          <p className="text-sm font-mono font-bold text-gray-700">#{leave.employee_id}</p>
                        </div>
                      </div>

                      {/* Contact Details Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Email</span>
                          </div>
                          <p className="text-sm text-gray-800 truncate">
                            {employeeDetails?.email || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Phone</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            {employeeDetails?.phone || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Building className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Designation</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            {employeeDetails?.designation || 'N/A'}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Hash className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">Department</span>
                          </div>
                          <p className="text-sm text-gray-800">
                            {employeeDetails?.department_name || employeeDetails?.department_id || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave Details Card */}
                             {/* Leave Details Card */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                          <Calendar className="w-4 h-4 text-purple-600" />
                        </div>
                        Leave Details
                      </h3>
                    </div>
                    {/* Add half day display in the Leave Details Card */}
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">Leave Type</p>
                          <p className="text-sm font-medium text-gray-800">{leave.leave_type}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">Total Days</p>
                          <p className="text-xl font-bold text-blue-600">
                            {leave.is_half_day ? '0.5 day' : `${leave.total_days} days`}
                            {leave.is_half_day && (
                              <span className="ml-2 text-sm font-normal text-gray-600">
                                (Half Day)
                              </span>
                            )}
                          </p>
                        </div>
                        
                        {/* Add half day period if available */}
                        {leave.is_half_day && leave.half_day_period && (
                          <div className="space-y-1 col-span-2">
                            <p className="text-xs font-medium text-gray-500">Half Day Period</p>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <p className="text-sm font-medium text-gray-800 capitalize">
                                {leave.half_day_period}
                              </p>
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">From Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-800">{formatDate(leave.from_date)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-gray-500">To Date</p>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-sm font-medium text-gray-800">{formatDate(leave.to_date)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Applied At */}
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <TimeIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">Applied On</span>
                          </div>
                          <p className="text-sm text-gray-700">{formatDateTime(leave.applied_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Approval & Reason */}
                <div className="space-y-4">
                  {/* Approval/Rejection Status Card */}
                  {(leave.status === 'approved' || leave.status === 'rejected') && (
                    <div className={`border-2 ${statusConfig.bgColor} rounded-xl overflow-hidden`}>
                      <div className={`px-5 py-3 border-b ${statusConfig.bgColor}`}>
                        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                          <div className={`p-1.5 ${statusConfig.color.split(' ')[0]} rounded-lg`}>
                            {leave.status === 'approved' ? (
                              <UserCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          {leave.status === 'approved' ? 'Approval Details' : 'Rejection Details'}
                        </h3>
                      </div>
                      <div className="p-5 space-y-4">
                        {leave.status === 'approved' ? (
                          <>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500">Approved At</p>
                              <div className="flex items-center gap-2">
                                <TimeIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-800">
                                  {formatDateTime(leave.approved_at)}
                                </p>
                              </div>
                            </div>
                            
                            {leave.approved_by && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500">Approved By</p>
                                <p className="text-sm font-medium text-gray-800">
                                  User #{leave.approved_by}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500">Rejected At</p>
                              <div className="flex items-center gap-2">
                                <TimeIcon className="w-4 h-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-800">
                                  {formatDateTime(leave.rejected_at)}
                                </p>
                              </div>
                            </div>
                            
                            {leave.rejected_by && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500">Rejected By</p>
                                <p className="text-sm font-medium text-gray-800">
                                  User #{leave.rejected_by}
                                </p>
                              </div>
                            )}
                            
                            {leave.rejection_reason && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium text-gray-500">Rejection Reason</p>
                                <div className={`p-3 rounded-lg ${statusConfig.bgColor}`}>
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {leave.rejection_reason}
                                  </p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reason Card */}
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200">
                      <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <div className="p-1.5 bg-orange-500/10 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-orange-600" />
                        </div>
                        Reason for Leave
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {leave.reason}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Attachment Card (if exists) */}
                  {leave.attachment_path && (
                    <div className="border-2 border-blue-200 rounded-xl overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                      <div className="bg-gradient-to-r from-blue-100 to-blue-50 px-5 py-3 border-b border-blue-200">
                        <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                          <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Paperclip className="w-4 h-4 text-blue-600" />
                          </div>
                          Supporting Document
                        </h3>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              {getFileIcon(leave.attachment_name, leave.attachment_type)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 truncate max-w-[150px]">
                                {leave.attachment_name || 'Document'}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {leave.attachment_size ? `${(leave.attachment_size / 1024).toFixed(1)} KB` : 'Size unknown'}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {leave.attachment_type || 'Unknown type'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={handlePreview}
                              disabled={loading}
                              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                              title="Preview file"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              onClick={handleDownload}
                              disabled={loading}
                              className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                              title="Download file"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    Application #{leave.application_number} • Applied on {formatDate(leave.applied_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-xs font-medium">
                    Employee ID: {leave.employee_id}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
     {isPreviewOpen && previewFile && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    {/* Backdrop for preview */}
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      onClick={closePreview}
    />
    
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative z-10">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {previewFile.type === 'image' ? (
                    <ImageIcon className="w-5 h-5 text-white" />
                  ) : (
                    <FileText className="w-5 h-5 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Preview Document</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5 truncate max-w-[300px]">
                    {previewFile.name}
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    URL: {previewFile.url.substring(0, 50)}...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
                <button
                  onClick={closePreview}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="p-4 max-h-[70vh] overflow-auto flex items-center justify-center">
              {previewFile.type === 'image' ? (
                <div className="flex flex-col items-center">
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('Image failed to load:', previewFile.url);
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/600x400/cccccc/969696?text=Image+Not+Found';
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    If image doesn't load, please download the file
                  </p>
                </div>
              ) : previewFile.type === 'pdf' ? (
                <div className="w-full h-[65vh]">
                  <iframe
                    src={previewFile.url}
                    title={previewFile.name}
                    className="w-full h-full border-0 rounded-lg shadow-lg"
                    onError={(e) => {
                      console.error('PDF failed to load:', previewFile.url);
                      const iframe = e.target as HTMLIFrameElement;
                      iframe.srcdoc = `
                        <html>
                          <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
                            <h3 style="color: #666;">PDF Preview Unavailable</h3>
                            <p style="color: #999; margin-top: 10px;">Please download the file to view it</p>
                          </body>
                        </html>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[65vh] text-gray-500">
                  <FileIcon className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Preview not available</p>
                  <p className="text-sm mt-2">Please download the file to view its contents</p>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center">
              <p className="text-xs text-gray-500 truncate max-w-[300px]">
                Source: {previewFile.url}
              </p>
              <button
                onClick={closePreview}
                className="px-6 py-2 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 