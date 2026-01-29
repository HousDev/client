import { useState } from 'react';
import { X, UserCheck, Search } from 'lucide-react';
import { Ticket } from '../../lib/ticketApi';

interface AssignTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssign: (assigneeId: number, assigneeName: string) => void;
    ticket: Ticket | null;
    admins: any[];
}

export default function AssignTicketModal({ isOpen, onClose, onAssign, ticket, admins }: AssignTicketModalProps) {
    const [selectedAdmin, setSelectedAdmin] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAdmins = admins.filter(admin =>
        admin.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAssign = () => {
        if (!selectedAdmin) return;
        
        const admin = admins.find(a => a.id === selectedAdmin);
        if (admin) {
            onAssign(admin.id, `${admin.first_name} ${admin.last_name}`);
        }
    };

    if (!isOpen || !ticket) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <UserCheck className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Assign Ticket</h2>
                            <p className="text-xs text-white/90 mt-0.5">Assign to support staff</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/20 rounded-lg p-2 transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Ticket Info */}
                    <div className="mb-6 border border-purple-200 rounded-xl p-4 bg-purple-50">
                        <p className="text-sm font-medium text-purple-700 mb-2">Ticket Details</p>
                        <p className="text-sm font-semibold text-gray-800">{ticket.subject}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {ticket.ticket_number}
                            </span>
                            <span className="text-xs text-gray-500">
                                From: {ticket.employee_name}
                            </span>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search admins..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Admins List */}
                    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredAdmins.length === 0 ? (
                            <div className="text-center py-8">
                                <UserCheck className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">No admins found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredAdmins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className={`p-4 cursor-pointer transition ${
                                            selectedAdmin === admin.id
                                                ? 'bg-purple-50 border-l-4 border-purple-500'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() => setSelectedAdmin(admin.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                selectedAdmin === admin.id
                                                    ? 'bg-purple-100 text-purple-600'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                <UserCheck className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {admin.first_name} {admin.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500">{admin.email}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {admin.designation || 'Admin'}
                                                </p>
                                            </div>
                                            {selectedAdmin === admin.id && (
                                                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                                                    <div className="w-2 h-2 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleAssign}
                            disabled={!selectedAdmin}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Assign Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}