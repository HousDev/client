import { useState, useEffect } from 'react';
import { X, User, Calendar, Clock, MessageSquare, Paperclip, Download, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { Ticket, ticketApi } from '../../lib/ticketApi';

interface ViewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    ticket: Ticket | null;
}

export default function ViewTicketModal({ isOpen, onClose, ticket }: ViewTicketModalProps) {
    const [loading, setLoading] = useState(false);
    const [fullTicket, setFullTicket] = useState<Ticket | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    useEffect(() => {
        if (isOpen && ticket) {
            loadFullTicket(ticket.id);
        }
    }, [isOpen, ticket]);

    const loadFullTicket = async (id: number) => {
        try {
            setLoading(true);
            const data = await ticketApi.getTicket(id);
            setFullTicket(data);
        } catch (error) {
            console.error('Error loading ticket:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'bg-red-500';
            case 'high': return 'bg-orange-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-500';
            case 'in_progress': return 'bg-yellow-500';
            case 'resolved': return 'bg-green-500';
            case 'closed': return 'bg-gray-500';
            default: return 'bg-gray-500';
        }
    };

    const downloadFile = (filePath: string, fileName: string) => {
        const fullUrl = `${import.meta.env.VITE_API_URL}/${filePath}`;
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen || !ticket) return null;

    return (
        <>
            {/* Main Modal */}
<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
  {/* Backdrop */}
  <div 
    className="fixed inset-0 bg-black/60 backdrop-blur-md"
    onClick={onClose}
  />
  
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-4xl my-4 border border-gray-200 overflow-hidden max-h-[90vh] flex flex-col relative z-10">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#4a5568] via-[#2d3748] to-[#1a202c] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <Eye className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    Ticket Details
                                </h2>
                                <p className="text-xs text-white/90 font-medium mt-0.5">
                                    {ticket.ticket_number}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : fullTicket ? (
                            <div className="space-y-6">
                                {/* Ticket Header Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-800">{fullTicket.subject}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{fullTicket.category}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <div className={`w-3 h-3 rounded-full ${getPriorityColor(fullTicket.priority)}`}></div>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {fullTicket.priority.charAt(0).toUpperCase() + fullTicket.priority.slice(1)} Priority
                                            </span>
                                            <div className={`w-3 h-3 rounded-full ${getStatusColor(fullTicket.status)}`}></div>
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {fullTicket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>Created: {formatDate(fullTicket.created_at)}</span>
                                        </div>
                                        {fullTicket.resolved_at && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>Resolved: {formatDate(fullTicket.resolved_at)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Employee Info */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Employee Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="text-sm font-medium text-gray-800">{fullTicket.employee_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Employee ID</p>
                                            <p className="text-sm font-medium text-gray-800">#{fullTicket.employee_id}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Department</p>
                                            <p className="text-sm text-gray-700">{fullTicket.employee_department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Designation</p>
                                            <p className="text-sm text-gray-700">{fullTicket.employee_designation || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Assigned To */}
                                {fullTicket.assigned_to_name && (
                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Assigned To</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{fullTicket.assigned_to_name}</p>
                                                <p className="text-xs text-gray-600">Assigned Agent</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" />
                                        Description
                                    </h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{fullTicket.description}</p>
                                </div>

                                {/* Attachments */}
                                {fullTicket.attachments && fullTicket.attachments.length > 0 && (
                                    <div className="border border-gray-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                                <Paperclip className="w-4 h-4" />
                                                Attachments ({fullTicket.attachments_count})
                                            </h4>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {fullTicket.attachments.map((attachment, index) => {
                                                const isImage = attachment.file_type?.startsWith('image/');
                                                const fileUrl = `${import.meta.env.VITE_API_URL}/${attachment.file_path}`;
                                                
                                                return (
                                                    <div 
                                                        key={index} 
                                                        className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {isImage ? (
                                                                <div className="w-16 h-16 flex-shrink-0">
                                                                    <img 
                                                                        src={fileUrl}
                                                                        alt={attachment.original_name}
                                                                        className="w-full h-full object-cover rounded cursor-pointer"
                                                                        onClick={() => {
                                                                            setSelectedImage(fileUrl);
                                                                            setShowImageModal(true);
                                                                        }}
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                                                                    <FileText className="w-8 h-8 text-gray-600" />
                                                                </div>
                                                            )}
                                                            
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 truncate" title={attachment.original_name}>
                                                                    {attachment.original_name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(attachment.file_size / 1024).toFixed(1)} KB
                                                                </p>
                                                                <div className="flex gap-2 mt-2">
                                                                    {isImage && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedImage(fileUrl);
                                                                                setShowImageModal(true);
                                                                            }}
                                                                            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                                                                        >
                                                                            <Eye className="w-3 h-3" />
                                                                            View
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => downloadFile(attachment.file_path, attachment.original_name)}
                                                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1"
                                                                    >
                                                                        <Download className="w-3 h-3" />
                                                                        Download
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Ticket Info */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Ticket Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Response Count</p>
                                            <p className="text-sm font-medium text-gray-800">{fullTicket.response_count} responses</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Last Updated</p>
                                            <p className="text-sm text-gray-700">{formatDate(fullTicket.updated_at)}</p>
                                        </div>
                                        {fullTicket.last_response_at && (
                                            <div>
                                                <p className="text-xs text-gray-500">Last Response</p>
                                                <p className="text-sm text-gray-700">{formatDate(fullTicket.last_response_at)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-600">Unable to load ticket details</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Preview Modal */}
           {showImageModal && selectedImage && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
    {/* Backdrop for image preview */}
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-md"
      onClick={() => {
        setShowImageModal(false);
        setSelectedImage(null);
      }}
    />
    
    <div className="relative w-full max-w-4xl max-h-[90vh] relative z-10">
                        <div className="absolute top-4 right-4 z-10">
                            <button
                                onClick={() => {
                                    setShowImageModal(false);
                                    setSelectedImage(null);
                                }}
                                className="bg-white/20 backdrop-blur-sm text-white rounded-full p-2 hover:bg-white/30 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="bg-black rounded-xl overflow-hidden">
                            <img 
                                src={selectedImage} 
                                alt="Preview" 
                                className="w-full h-auto max-h-[80vh] object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}