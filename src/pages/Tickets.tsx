import { useState, useEffect } from 'react';
import { Ticket, Plus, Filter, MessageSquare, Clock, User, UserCheck, AlertCircle, ChevronDown, Eye, Paperclip } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CreateTicketModal from '../components/modals/CreateTicketModal';
import ViewTicketModal from '../components/modals/ViewTicketModal';
import AssignTicketModal from '../components/modals/AssignTicketModal';
import ticketApi, { Ticket as TicketType, TicketStats } from '../lib/ticketApi';
import { HrmsEmployeesApi } from '../lib/employeeApi';
import { useAuth } from '../contexts/AuthContext';

export default function Tickets() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
    const [tickets, setTickets] = useState<TicketType[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
    const [stats, setStats] = useState<TicketStats>({
        total: 0,
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
    });
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<string[]>([]);
    const [admins, setAdmins] = useState<any[]>([]);
    
    // Column search states
    const [searchTicketNumber, setSearchTicketNumber] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchEmployee, setSearchEmployee] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [searchPriority, setSearchPriority] = useState('');
    const [searchAssignedTo, setSearchAssignedTo] = useState('');

    // Load data
    useEffect(() => {
        loadTickets();
        loadStats();
        loadCategories();
        loadAdmins();
    }, []);

    // Filter tickets
    useEffect(() => {
        let filtered = tickets;

        // Global search
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter((ticket) =>
                ticket.ticket_number.toLowerCase().includes(searchLower) ||
                ticket.subject.toLowerCase().includes(searchLower) ||
                ticket.employee_name.toLowerCase().includes(searchLower) ||
                (ticket.description?.toLowerCase() || '').includes(searchLower) ||
                ticket.category.toLowerCase().includes(searchLower)
            );
        }

        // Column searches
        if (searchTicketNumber) {
            filtered = filtered.filter((ticket) =>
                ticket.ticket_number.toLowerCase().includes(searchTicketNumber.toLowerCase())
            );
        }

        if (searchSubject) {
            filtered = filtered.filter((ticket) =>
                ticket.subject.toLowerCase().includes(searchSubject.toLowerCase())
            );
        }

        if (searchEmployee) {
            filtered = filtered.filter((ticket) =>
                ticket.employee_name.toLowerCase().includes(searchEmployee.toLowerCase())
            );
        }

        if (searchCategory) {
            filtered = filtered.filter((ticket) =>
                ticket.category.toLowerCase().includes(searchCategory.toLowerCase())
            );
        }

        if (searchStatus) {
            filtered = filtered.filter((ticket) =>
                ticket.status.toLowerCase().includes(searchStatus.toLowerCase())
            );
        }

        if (searchPriority) {
            filtered = filtered.filter((ticket) =>
                ticket.priority.toLowerCase().includes(searchPriority.toLowerCase())
            );
        }

        if (searchAssignedTo) {
            filtered = filtered.filter((ticket) =>
                (ticket.assigned_to_name?.toLowerCase() || '').includes(searchAssignedTo.toLowerCase())
            );
        }

        setFilteredTickets(filtered);
    }, [tickets, searchTerm, searchTicketNumber, searchSubject, searchEmployee, 
        searchCategory, searchStatus, searchPriority, searchAssignedTo]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const result = await ticketApi.getTickets();
            console.log('Loaded tickets:', result.data);
            setTickets(result.data || []);
            setFilteredTickets(result.data || []);
        } catch (error) {
            console.error('Error loading tickets:', error);
            setTickets([]);
            setFilteredTickets([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await ticketApi.getTicketStats();
            setStats(data);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await ticketApi.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadAdmins = async () => {
        try {
            const employees = await HrmsEmployeesApi.getEmployees();
            setAdmins(employees.slice(0, 5));
        } catch (error) {
            console.error('Error loading admins:', error);
        }
    };

    const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
        try {
            await ticketApi.updateTicketStatus(ticketId, newStatus, {
                user_id: user?.id || 'admin',
                user_name: user?.name || 'Admin'
            });
            loadTickets();
            loadStats();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update ticket status');
        }
    };

    const handleAssignTicket = (ticket: TicketType) => {
        setSelectedTicket(ticket);
        setShowAssignModal(true);
    };

    const handleAssign = async (assigneeId: number, assigneeName: string) => {
        if (!selectedTicket) return;
        
        try {
            await ticketApi.assignTicket(selectedTicket.id, {
                assigned_to_id: assigneeId,
                assigned_to_name: assigneeName,
                assigned_by_id: parseInt(user?.id || '0'),
                assigned_by_name: user?.name || 'Admin'
            });
            loadTickets();
            setShowAssignModal(false);
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error assigning ticket:', error);
            alert('Failed to assign ticket');
        }
    };

    const handleViewTicket = (ticket: TicketType) => {
        setSelectedTicket(ticket);
        setShowViewModal(true);
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

    const resetFilters = () => {
        setSearchTerm('');
        setSearchTicketNumber('');
        setSearchSubject('');
        setSearchEmployee('');
        setSearchCategory('');
        setSearchStatus('');
        setSearchPriority('');
        setSearchAssignedTo('');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-3 md:p-4 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-800">Support Tickets</h1>
                    <p className="text-gray-600 text-sm mt-1">Manage employee support requests</p>
                </div>
                <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-[#4a5568] to-[#2d3748] hover:from-[#2d3748] hover:to-[#1a202c]"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Open Tickets</p>
                            <p className="text-xl md:text-3xl font-bold text-blue-600 mt-1">{stats.open}</p>
                            <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">In Progress</p>
                            <p className="text-xl md:text-3xl font-bold text-yellow-600 mt-1">{stats.in_progress}</p>
                            <p className="text-xs text-gray-500 mt-1">Being resolved</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Resolved</p>
                            <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
                            <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-gray-600">Critical Priority</p>
                            <p className="text-xl md:text-3xl font-bold text-red-600 mt-1">{stats.critical}</p>
                            <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
                        </div>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tickets Table with Column Search */}
            <Card className="overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">All Tickets ({stats.total})</h2>
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 relative max-w-md">
                            <input
                                type="text"
                                placeholder="Search all tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4a5568] focus:border-transparent"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Filter className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                        <button
                            onClick={resetFilters}
                            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Ticket #
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Subject
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employee
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Priority
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Assigned To
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Attachments
                                    </div>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </div>
                                </th>
                            </tr>
                            
                            {/* Search Row */}
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTicketNumber}
                                        onChange={(e) => setSearchTicketNumber(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchSubject}
                                        onChange={(e) => setSearchSubject(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchEmployee}
                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchPriority}
                                        onChange={(e) => setSearchPriority(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchStatus}
                                        onChange={(e) => setSearchStatus(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchAssignedTo}
                                        onChange={(e) => setSearchAssignedTo(e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                <td className="px-4 py-2"></td>
                                <td className="px-4 py-2"></td>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="text-xs md:text-sm">
                                            <p className="font-mono text-blue-600 font-medium">{ticket.ticket_number}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MessageSquare className="h-3 w-3 text-gray-400" />
                                                <span className="text-xs text-gray-500">{ticket.response_count || 0} responses</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                                            {(ticket.description || '').substring(0, 50)}...
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{ticket.employee_name}</p>
                                                <p className="text-xs text-gray-500">{ticket.employee_designation || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-gray-900">{ticket.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                                            <Badge variant={
                                                ticket.priority === 'critical' ? 'error' :
                                                ticket.priority === 'high' ? 'warning' : 
                                                ticket.priority === 'medium' ? 'info' : 'secondary'
                                            } className="text-xs">
                                                {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></div>
                                            <Badge variant={
                                                ticket.status === 'resolved' ? 'success' :
                                                ticket.status === 'in_progress' ? 'warning' :
                                                ticket.status === 'closed' ? 'secondary' : 'info'
                                            } className="text-xs">
                                                {ticket.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ticket.assigned_to_name ? (
                                            <div className="flex items-center gap-2">
                                                <UserCheck className="h-4 w-4 text-green-600" />
                                                <span className="text-sm text-gray-900">{ticket.assigned_to_name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-500 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {ticket.attachments_count > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <Paperclip className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-700">{ticket.attachments_count}</span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleViewTicket(ticket)}
                                                className="text-xs flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View
                                            </Button>
                                            
                                            {ticket.status === 'open' && (
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => handleAssignTicket(ticket)}
                                                    className="text-xs"
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                            {ticket.status === 'in_progress' && (
                                                <Button 
                                                    variant="success" 
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                                    className="text-xs"
                                                >
                                                    Resolve
                                                </Button>
                                            )}
                                            {ticket.status === 'resolved' && (
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm"
                                                    onClick={() => handleStatusUpdate(ticket.id, 'closed')}
                                                    className="text-xs"
                                                >
                                                    Close
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-4 py-8 text-center">
                                        <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600">No tickets found</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {searchTerm || searchTicketNumber || searchSubject || searchEmployee
                                                ? "Try a different search term" 
                                                : "No support tickets have been created yet"}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Modals */}
            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    loadTickets();
                    loadStats();
                }}
                categories={categories}
            />

            <ViewTicketModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedTicket(null);
                }}
                ticket={selectedTicket}
            />

            <AssignTicketModal
                isOpen={showAssignModal}
                onClose={() => {
                    setShowAssignModal(false);
                    setSelectedTicket(null);
                }}
                onAssign={handleAssign}
                ticket={selectedTicket}
                admins={admins}
            />
        </div>
    );
}