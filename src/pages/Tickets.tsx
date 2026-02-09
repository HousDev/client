// import { useState, useEffect } from 'react';
// import { Ticket, Plus, Filter, MessageSquare, Clock, User, UserCheck, AlertCircle, ChevronDown, Eye, Paperclip } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Badge from '../components/ui/Badge';
// import CreateTicketModal from '../components/modals/CreateTicketModal';
// import ViewTicketModal from '../components/modals/ViewTicketModal';
// import AssignTicketModal from '../components/modals/AssignTicketModal';
// import ticketApi, { Ticket as TicketType, TicketStats } from '../lib/ticketApi';
// import { HrmsEmployeesApi } from '../lib/employeeApi';
// import { useAuth } from '../contexts/AuthContext';

// export default function Tickets() {
//     const { user } = useAuth();
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [priorityFilter, setPriorityFilter] = useState<string>('');
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [showViewModal, setShowViewModal] = useState(false);
//     const [showAssignModal, setShowAssignModal] = useState(false);
//     const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
//     const [tickets, setTickets] = useState<TicketType[]>([]);
//     const [filteredTickets, setFilteredTickets] = useState<TicketType[]>([]);
//     const [stats, setStats] = useState<TicketStats>({
//         total: 0,
//         open: 0,
//         in_progress: 0,
//         resolved: 0,
//         closed: 0,
//         critical: 0,
//         high: 0,
//         medium: 0,
//         low: 0
//     });
//     const [loading, setLoading] = useState(true);
//     const [categories, setCategories] = useState<string[]>([]);
//     const [admins, setAdmins] = useState<any[]>([]);
    
//     // Column search states
//     const [searchTicketNumber, setSearchTicketNumber] = useState('');
//     const [searchSubject, setSearchSubject] = useState('');
//     const [searchEmployee, setSearchEmployee] = useState('');
//     const [searchCategory, setSearchCategory] = useState('');
//     const [searchStatus, setSearchStatus] = useState('');
//     const [searchPriority, setSearchPriority] = useState('');
//     const [searchAssignedTo, setSearchAssignedTo] = useState('');

//     // Load data
//     useEffect(() => {
//         loadTickets();
//         loadStats();
//         loadCategories();
//         loadAdmins();
//     }, []);

//     // Filter tickets
//     useEffect(() => {
//         let filtered = tickets;

//         // Global search
//         if (searchTerm) {
//             const searchLower = searchTerm.toLowerCase();
//             filtered = filtered.filter((ticket) =>
//                 ticket.ticket_number.toLowerCase().includes(searchLower) ||
//                 ticket.subject.toLowerCase().includes(searchLower) ||
//                 ticket.employee_name.toLowerCase().includes(searchLower) ||
//                 (ticket.description?.toLowerCase() || '').includes(searchLower) ||
//                 ticket.category.toLowerCase().includes(searchLower)
//             );
//         }

//         // Column searches
//         if (searchTicketNumber) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.ticket_number.toLowerCase().includes(searchTicketNumber.toLowerCase())
//             );
//         }

//         if (searchSubject) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.subject.toLowerCase().includes(searchSubject.toLowerCase())
//             );
//         }

//         if (searchEmployee) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.employee_name.toLowerCase().includes(searchEmployee.toLowerCase())
//             );
//         }

//         if (searchCategory) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.category.toLowerCase().includes(searchCategory.toLowerCase())
//             );
//         }

//         if (searchStatus) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.status.toLowerCase().includes(searchStatus.toLowerCase())
//             );
//         }

//         if (searchPriority) {
//             filtered = filtered.filter((ticket) =>
//                 ticket.priority.toLowerCase().includes(searchPriority.toLowerCase())
//             );
//         }

//         if (searchAssignedTo) {
//             filtered = filtered.filter((ticket) =>
//                 (ticket.assigned_to_name?.toLowerCase() || '').includes(searchAssignedTo.toLowerCase())
//             );
//         }

//         setFilteredTickets(filtered);
//     }, [tickets, searchTerm, searchTicketNumber, searchSubject, searchEmployee, 
//         searchCategory, searchStatus, searchPriority, searchAssignedTo]);

//     const loadTickets = async () => {
//         try {
//             setLoading(true);
//             const result = await ticketApi.getTickets();
//             console.log('Loaded tickets:', result.data);
//             setTickets(result.data || []);
//             setFilteredTickets(result.data || []);
//         } catch (error) {
//             console.error('Error loading tickets:', error);
//             setTickets([]);
//             setFilteredTickets([]);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const loadStats = async () => {
//         try {
//             const data = await ticketApi.getTicketStats();
//             setStats(data);
//         } catch (error) {
//             console.error('Error loading stats:', error);
//         }
//     };

//     const loadCategories = async () => {
//         try {
//             const data = await ticketApi.getCategories();
//             console.log("ct",data)
//             setCategories(data);
//         } catch (error) {
//             console.error('Error loading categories:', error);
//         }
//     };

//     const loadAdmins = async () => {
//         try {
//             const employees = await HrmsEmployeesApi.getEmployees();
//             setAdmins(employees.slice(0, 5));
//         } catch (error) {
//             console.error('Error loading admins:', error);
//         }
//     };

//     const handleStatusUpdate = async (ticketId: number, newStatus: string) => {
//         try {
//             await ticketApi.updateTicketStatus(ticketId, newStatus, {
//                 user_id: user?.id || 'admin',
//                 user_name: user?.name || 'Admin'
//             });
//             loadTickets();
//             loadStats();
//         } catch (error) {
//             console.error('Error updating status:', error);
//             alert('Failed to update ticket status');
//         }
//     };

//     const handleAssignTicket = (ticket: TicketType) => {
//         setSelectedTicket(ticket);
//         setShowAssignModal(true);
//     };

//     const handleAssign = async (assigneeId: number, assigneeName: string) => {
//         if (!selectedTicket) return;
        
//         try {
//             await ticketApi.assignTicket(selectedTicket.id, {
//                 assigned_to_id: assigneeId,
//                 assigned_to_name: assigneeName,
//                 assigned_by_id: parseInt(user?.id || '0'),
//                 assigned_by_name: user?.name || 'Admin'
//             });
//             loadTickets();
//             setShowAssignModal(false);
//             setSelectedTicket(null);
//         } catch (error) {
//             console.error('Error assigning ticket:', error);
//             alert('Failed to assign ticket');
//         }
//     };

//     const handleViewTicket = (ticket: TicketType) => {
//         setSelectedTicket(ticket);
//         setShowViewModal(true);
//     };

//     const getPriorityColor = (priority: string) => {
//         switch (priority) {
//             case 'critical': return 'bg-red-500';
//             case 'high': return 'bg-orange-500';
//             case 'medium': return 'bg-yellow-500';
//             case 'low': return 'bg-green-500';
//             default: return 'bg-gray-500';
//         }
//     };

//     const getStatusColor = (status: string) => {
//         switch (status) {
//             case 'open': return 'bg-blue-500';
//             case 'in_progress': return 'bg-yellow-500';
//             case 'resolved': return 'bg-green-500';
//             case 'closed': return 'bg-gray-500';
//             default: return 'bg-gray-500';
//         }
//     };

//     const resetFilters = () => {
//         setSearchTerm('');
//         setSearchTicketNumber('');
//         setSearchSubject('');
//         setSearchEmployee('');
//         setSearchCategory('');
//         setSearchStatus('');
//         setSearchPriority('');
//         setSearchAssignedTo('');
//     };

//     if (loading) {
//         return (
//             <div className="flex items-center justify-center h-64">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6 p-3 md:p-4 bg-gray-50 min-h-screen">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               
//                 <Button 
//                     onClick={() => setShowCreateModal(true)}
//                     className="bg-gradient-to-r from-[#4a5568] to-[#2d3748] hover:from-[#2d3748] hover:to-[#1a202c]"
//                 >
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Ticket
//                 </Button>
//             </div>

//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <Card className="p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-xs text-gray-600">Open Tickets</p>
//                             <p className="text-xl md:text-3xl font-bold text-blue-600 mt-1">{stats.open}</p>
//                             <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
//                         </div>
//                         <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Ticket className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-xs text-gray-600">In Progress</p>
//                             <p className="text-xl md:text-3xl font-bold text-yellow-600 mt-1">{stats.in_progress}</p>
//                             <p className="text-xs text-gray-500 mt-1">Being resolved</p>
//                         </div>
//                         <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-xs text-gray-600">Resolved</p>
//                             <p className="text-xl md:text-3xl font-bold text-green-600 mt-1">{stats.resolved}</p>
//                             <p className="text-xs text-gray-500 mt-1">Successfully resolved</p>
//                         </div>
//                         <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <Ticket className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-4">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-xs text-gray-600">Critical Priority</p>
//                             <p className="text-xl md:text-3xl font-bold text-red-600 mt-1">{stats.critical}</p>
//                             <p className="text-xs text-gray-500 mt-1">Require immediate attention</p>
//                         </div>
//                         <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
//                             <AlertCircle className="h-5 w-5 md:h-6 md:w-6 text-red-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             {/* Tickets Table with Column Search */}
//             <Card className="overflow-hidden">
                

//                 <div className="overflow-x-auto">
//                     <table className="w-full min-w-[1000px]">
//                         <thead className="bg-gray-100 border-b border-gray-200">
//                             <tr>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Ticket #
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Subject
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Employee
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Category
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Priority
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Status
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Assigned To
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Attachments
//                                     </div>
//                                 </th>
//                                 <th className="px-4 py-3 text-left">
//                                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Actions
//                                     </div>
//                                 </th>
//                             </tr>
                            
//                             {/* Search Row */}
//                             <tr className="bg-gray-50 border-b border-gray-200">
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchTicketNumber}
//                                         onChange={(e) => setSearchTicketNumber(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchSubject}
//                                         onChange={(e) => setSearchSubject(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchEmployee}
//                                         onChange={(e) => setSearchEmployee(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchCategory}
//                                         onChange={(e) => setSearchCategory(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchPriority}
//                                         onChange={(e) => setSearchPriority(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchStatus}
//                                         onChange={(e) => setSearchStatus(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2">
//                                     <input
//                                         type="text"
//                                         placeholder="Search..."
//                                         value={searchAssignedTo}
//                                         onChange={(e) => setSearchAssignedTo(e.target.value)}
//                                         className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
//                                     />
//                                 </td>
//                                 <td className="px-4 py-2"></td>
//                                 <td className="px-4 py-2"></td>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-200">
//                             {filteredTickets.map((ticket) => (
//                                 <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
//                                     <td className="px-4 py-3">
//                                         <div className="text-xs md:text-sm">
//                                             <p className="font-mono text-blue-600 font-medium">{ticket.ticket_number}</p>
//                                             <div className="flex items-center gap-1 mt-1">
//                                                 <MessageSquare className="h-3 w-3 text-gray-400" />
//                                                 <span className="text-xs text-gray-500">{ticket.response_count || 0} responses</span>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <p className="font-medium text-gray-900 text-sm">{ticket.subject}</p>
//                                         <p className="text-xs text-gray-500 truncate max-w-[200px]">
//                                             {(ticket.description || '').substring(0, 50)}...
//                                         </p>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-2">
//                                             <User className="h-4 w-4 text-gray-400" />
//                                             <div>
//                                                 <p className="text-sm font-medium text-gray-900">{ticket.employee_name}</p>
//                                                 <p className="text-xs text-gray-500">{ticket.employee_designation || 'N/A'}</p>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <span className="text-sm text-gray-900">{ticket.category}</span>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-2">
//                                             <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
//                                             <Badge variant={
//                                                 ticket.priority === 'critical' ? 'error' :
//                                                 ticket.priority === 'high' ? 'warning' : 
//                                                 ticket.priority === 'medium' ? 'info' : 'secondary'
//                                             } className="text-xs">
//                                                 {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
//                                             </Badge>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-2">
//                                             <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></div>
//                                             <Badge variant={
//                                                 ticket.status === 'resolved' ? 'success' :
//                                                 ticket.status === 'in_progress' ? 'warning' :
//                                                 ticket.status === 'closed' ? 'secondary' : 'info'
//                                             } className="text-xs">
//                                                 {ticket.status.replace('_', ' ')}
//                                             </Badge>
//                                         </div>
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         {ticket.assigned_to_name ? (
//                                             <div className="flex items-center gap-2">
//                                                 <UserCheck className="h-4 w-4 text-green-600" />
//                                                 <span className="text-sm text-gray-900">{ticket.assigned_to_name}</span>
//                                             </div>
//                                         ) : (
//                                             <span className="text-sm text-gray-500 italic">Unassigned</span>
//                                         )}
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         {ticket.attachments_count > 0 ? (
//                                             <div className="flex items-center gap-2">
//                                                 <Paperclip className="h-4 w-4 text-gray-500" />
//                                                 <span className="text-sm text-gray-700">{ticket.attachments_count}</span>
//                                             </div>
//                                         ) : (
//                                             <span className="text-sm text-gray-400">—</span>
//                                         )}
//                                     </td>
//                                     <td className="px-4 py-3">
//                                         <div className="flex items-center gap-2 flex-wrap">
//                                             <Button 
//                                                 variant="outline" 
//                                                 size="sm"
//                                                 onClick={() => handleViewTicket(ticket)}
//                                                 className="text-xs flex items-center gap-1"
//                                             >
//                                                 <Eye className="h-3 w-3" />
//                                                 View
//                                             </Button>
                                            
//                                             {ticket.status === 'open' && (
//                                                 <Button 
//                                                     variant="secondary" 
//                                                     size="sm"
//                                                     onClick={() => handleAssignTicket(ticket)}
//                                                     className="text-xs"
//                                                 >
//                                                     Assign
//                                                 </Button>
//                                             )}
//                                             {ticket.status === 'in_progress' && (
//                                                 <Button 
//                                                     variant="success" 
//                                                     size="sm"
//                                                     onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
//                                                     className="text-xs"
//                                                 >
//                                                     Resolve
//                                                 </Button>
//                                             )}
//                                             {ticket.status === 'resolved' && (
//                                                 <Button 
//                                                     variant="secondary" 
//                                                     size="sm"
//                                                     onClick={() => handleStatusUpdate(ticket.id, 'closed')}
//                                                     className="text-xs"
//                                                 >
//                                                     Close
//                                                 </Button>
//                                             )}
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
                            
//                             {filteredTickets.length === 0 && (
//                                 <tr>
//                                     <td colSpan={9} className="px-4 py-8 text-center">
//                                         <Ticket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
//                                         <p className="text-gray-600">No tickets found</p>
//                                         <p className="text-sm text-gray-500 mt-1">
//                                             {searchTerm || searchTicketNumber || searchSubject || searchEmployee
//                                                 ? "Try a different search term" 
//                                                 : "No support tickets have been created yet"}
//                                         </p>
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             {/* Modals */}
//             <CreateTicketModal
//                 isOpen={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 onSuccess={() => {
//                     loadTickets();
//                     loadStats();
//                 }}
//                 categories={categories}
//             />

//             <ViewTicketModal
//                 isOpen={showViewModal}
//                 onClose={() => {
//                     setShowViewModal(false);
//                     setSelectedTicket(null);
//                 }}
//                 ticket={selectedTicket}
//             />

//             <AssignTicketModal
//                 isOpen={showAssignModal}
//                 onClose={() => {
//                     setShowAssignModal(false);
//                     setSelectedTicket(null);
//                 }}
//                 onAssign={handleAssign}
//                 ticket={selectedTicket}
//                 admins={admins}
//             />
//         </div>
//     );
// }

import { useState, useEffect } from 'react';
import { Ticket, Plus, Filter, MessageSquare, Clock, User, UserCheck, AlertCircle, ChevronDown, Eye, Paperclip, Trash2, X, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import CreateTicketModal from '../components/modals/CreateTicketModal';
import ViewTicketModal from '../components/modals/ViewTicketModal';
import AssignTicketModal from '../components/modals/AssignTicketModal';
import ticketApi, { Ticket as TicketType, TicketStats } from '../lib/ticketApi';
import { HrmsEmployeesApi } from '../lib/employeeApi';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function Tickets() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
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
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    
    // Column search states
    const [searchTicketNumber, setSearchTicketNumber] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchEmployee, setSearchEmployee] = useState('');
    const [searchCategory, setSearchCategory] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const [searchPriority, setSearchPriority] = useState('');
    const [searchAssignedTo, setSearchAssignedTo] = useState('');

    // Bulk delete
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
    const [selectAll, setSelectAll] = useState(false);

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
        setSelectAll(false);
        setSelectedItems(new Set());
    }, [tickets, searchTerm, searchTicketNumber, searchSubject, searchEmployee, 
        searchCategory, searchStatus, searchPriority, searchAssignedTo]);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const result = await ticketApi.getTickets();
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
        const statusText = newStatus.replace('_', ' ');
        const result = await Swal.fire({
            title: `Mark as ${statusText}?`,
            text: `Are you sure you want to mark this ticket as ${statusText}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10B981',
            cancelButtonColor: '#6B7280',
            confirmButtonText: `Yes, mark as ${statusText}`,
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                confirmButton: 'mr-2',
                cancelButton: 'ml-2'
            }
        });

        if (result.isConfirmed) {
            try {
                await ticketApi.updateTicketStatus(ticketId, newStatus, {
                    user_id: user?.id || 'admin',
                    user_name: user?.name || 'Admin'
                });
                
                await Swal.fire({
                    title: 'Updated!',
                    text: `Ticket has been marked as ${statusText} successfully.`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                loadTickets();
                loadStats();
                setOpenMenuId(null);
            } catch (error) {
                console.error('Error updating status:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to update ticket status',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                });
            }
        }
    };

    const handleAssignTicket = (ticket: TicketType) => {
        setSelectedTicket(ticket);
        setShowAssignModal(true);
        setOpenMenuId(null);
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
            
            await Swal.fire({
                title: 'Assigned!',
                text: 'Ticket has been assigned successfully.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            loadTickets();
            setShowAssignModal(false);
            setSelectedTicket(null);
        } catch (error) {
            console.error('Error assigning ticket:', error);
            await Swal.fire({
                title: 'Error!',
                text: 'Failed to assign ticket',
                icon: 'error',
                confirmButtonColor: '#EF4444',
            });
        }
    };

    const handleViewTicket = (ticket: TicketType) => {
        setSelectedTicket(ticket);
        setShowViewModal(true);
        setOpenMenuId(null);
    };

    const handleDelete = async (id: number) => {
        const result = await Swal.fire({
            title: 'Delete Ticket',
            text: 'Are you sure you want to delete this ticket? This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                confirmButton: 'mr-2',
                cancelButton: 'ml-2'
            }
        });

        if (result.isConfirmed) {
            try {
                await ticketApi.deleteTicket(id);
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: 'The ticket has been deleted successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                loadTickets();
                loadStats();
                setOpenMenuId(null);
            } catch (error) {
                console.error('Error deleting ticket:', error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete ticket',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                });
            }
        }
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

    // Bulk delete handlers
    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedItems(new Set());
        } else {
            const allIds = new Set(filteredTickets.map((ticket: any) => ticket.id));
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
        setSelectAll(newSelected.size === filteredTickets.length);
    };

    const handleBulkDelete = async () => {
        if (selectedItems.size === 0) {
            await Swal.fire({
                title: 'No Selection',
                text: 'Please select tickets to delete',
                icon: 'info',
                confirmButtonColor: '#3B82F6',
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Delete Tickets',
            html: `
                <div class="text-left">
                    <p class="text-gray-600 mb-2">Are you sure you want to delete <strong>${selectedItems.size}</strong> ticket(s)?</p>
                    <p class="text-sm text-gray-500">This action cannot be undone.</p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, delete them!',
            cancelButtonText: 'Cancel',
            reverseButtons: true,
            customClass: {
                confirmButton: 'mr-2',
                cancelButton: 'ml-2'
            }
        });

        if (result.isConfirmed) {
            try {
                await Promise.all(
                    Array.from(selectedItems).map((id) => ticketApi.deleteTicket(id))
                );
                
                await Swal.fire({
                    title: 'Deleted!',
                    text: `${selectedItems.size} ticket(s) deleted successfully!`,
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                setSelectedItems(new Set());
                setSelectAll(false);
                await loadTickets();
                await loadStats();
            } catch (error) {
                console.error("Error deleting tickets:", error);
                await Swal.fire({
                    title: 'Error!',
                    text: 'Failed to delete tickets',
                    icon: 'error',
                    confirmButtonColor: '#EF4444',
                });
            }
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

    const clearAllFilters = () => {
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
        <div className="space-y-5">
            {/* Header with Bulk Actions */}
            <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
                <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
                    {selectedItems.size > 0 && (
                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 p-1 rounded">
                                    <Ticket className="w-3 h-3 text-blue-600" />
                                </div>
                                <p className="font-medium text-xs text-gray-800">
                                    {selectedItems.size} selected
                                </p>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={handleBulkDelete}
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
                    className="text-sm ml-2 bg-gradient-to-r from-[#4a5568] to-[#2d3748] hover:from-[#2d3748] hover:to-[#1a202c]"
                >
                    <Plus className="h-4 w-4 mr-1.5" />
                    Create Ticket
                </Button>
            </div>

            {/* Stats Cards - Sticky & Compact */}
            <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Open Tickets
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                                {stats.open}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                In Progress
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                                {stats.in_progress}
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
                                Resolved
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                                {stats.resolved}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-2 sm:p-3 md:p-3.5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                                Critical Priority
                            </p>
                            <p className="text-lg sm:text-xl md:text-xl font-bold text-red-600 mt-0.5">
                                {stats.critical}
                            </p>
                        </div>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Main Table */}
            <div className="sticky top-32 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden md:-mt-1">
                <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
                    <table className="w-full min-w-[1000px]">
                        <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
                            <tr>
                                <th className="px-3 md:px-4 py-2 text-center w-16">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Select
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Ticket #
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Subject
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Employee
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Category
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Priority
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Status
                                    </div>
                                </th>
                                <th className="px-3 md:px-4 py-2 text-left">
                                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Assigned To
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
                                <td className="px-3 md:px-4 py-1 text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#4a5568] border-gray-300 rounded focus:ring-[#4a5568]"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTicketNumber}
                                        onChange={(e) => setSearchTicketNumber(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchSubject}
                                        onChange={(e) => setSearchSubject(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchEmployee}
                                        onChange={(e) => setSearchEmployee(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchCategory}
                                        onChange={(e) => setSearchCategory(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={searchPriority}
                                        onChange={(e) => setSearchPriority(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent bg-white"
                                    >
                                        <option value="">All</option>
                                        <option value="critical">Critical</option>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <select
                                        value={searchStatus}
                                        onChange={(e) => setSearchStatus(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent bg-white"
                                    >
                                        <option value="">All</option>
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </td>
                                
                                <td className="px-3 md:px-4 py-1">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchAssignedTo}
                                        onChange={(e) => setSearchAssignedTo(e.target.value)}
                                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-[#4a5568] focus:border-transparent"
                                    />
                                </td>
                                
                                <td className="px-3 md:px-4 py-1 text-center">
                                    <button
                                        onClick={clearAllFilters}
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
                            {filteredTickets.map((ticket) => {
                                const isSelected = selectedItems.has(ticket.id);

                                return (
                                    <tr
                                        key={ticket.id}
                                        className={`hover:bg-gray-50 transition ${
                                            isSelected ? "bg-blue-50" : ""
                                        }`}
                                    >
                                        <td className="px-3 md:px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => handleSelectItem(ticket.id)}
                                                className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#4a5568] border-gray-300 rounded focus:ring-[#4a5568]"
                                            />
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="text-gray-800 text-xs md:text-sm">
                                                <p className="font-mono text-blue-600 font-medium">{ticket.ticket_number}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <MessageSquare className="h-3 w-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500">{ticket.response_count || 0} responses</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <p className="font-medium text-gray-800 text-xs md:text-sm">{ticket.subject}</p>
                                            <p className="text-gray-600 text-xs md:text-sm truncate max-w-[150px]">
                                                {(ticket.description || '').substring(0, 50)}...
                                            </p>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="text-gray-800 text-xs md:text-sm">
                                                <p className="font-medium">{ticket.employee_name}</p>
                                                <p className="text-xs text-gray-500">{ticket.employee_designation || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="text-gray-800 text-xs md:text-sm">
                                                {ticket.category}
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`}></div>
                                                <Badge variant={
                                                    ticket.priority === 'critical' ? 'error' :
                                                    ticket.priority === 'high' ? 'warning' : 
                                                    ticket.priority === 'medium' ? 'info' : 'secondary'
                                                } className="text-[10px]">
                                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></div>
                                                <Badge variant={
                                                    ticket.status === 'resolved' ? 'success' :
                                                    ticket.status === 'in_progress' ? 'warning' :
                                                    ticket.status === 'closed' ? 'secondary' : 'info'
                                                } className="text-[10px]">
                                                    {ticket.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-4 py-3">
                                            {ticket.assigned_to_name ? (
                                                <div className="flex items-center gap-2">
                                                    <UserCheck className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                                                    <span className="text-gray-800 text-xs md:text-sm">{ticket.assigned_to_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 text-xs md:text-sm italic">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="px-3 md:px-4 py-3 relative menu-container">
                                            <button
                                                onClick={() => setOpenMenuId(openMenuId === ticket.id ? null : ticket.id)}
                                                className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                                            >
                                                <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                                            </button>

                                            {openMenuId === ticket.id && (
                                                <div className="absolute right-4 top-10 z-50 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                                                    <ul className="py-1 text-sm text-gray-700">
                                                        <li>
                                                            <button
                                                                onClick={() => handleViewTicket(ticket)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                                View Details
                                                            </button>
                                                        </li>
                                                        
                                                        {ticket.attachments_count > 0 && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleViewTicket(ticket)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-blue-600 text-left"
                                                                >
                                                                    <Paperclip className="w-4 h-4" />
                                                                    View Attachments ({ticket.attachments_count})
                                                                </button>
                                                            </li>
                                                        )}
                                                        
                                                        {ticket.status === 'open' && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleAssignTicket(ticket)}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-purple-600 text-left"
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                    Assign Ticket
                                                                </button>
                                                            </li>
                                                        )}
                                                        
                                                        {ticket.status === 'open' && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-yellow-600 text-left"
                                                                >
                                                                    <Clock className="w-4 h-4" />
                                                                    Mark as In Progress
                                                                </button>
                                                            </li>
                                                        )}
                                                        
                                                        {ticket.status === 'in_progress' && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(ticket.id, 'resolved')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-green-600 text-left"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                    Mark as Resolved
                                                                </button>
                                                            </li>
                                                        )}
                                                        
                                                        {ticket.status === 'resolved' && (
                                                            <li>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(ticket.id, 'closed')}
                                                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-600 text-left"
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                    Mark as Closed
                                                                </button>
                                                            </li>
                                                        )}

                                                        <hr className="my-1" />

                                                        <li>
                                                            <button
                                                                onClick={() => handleDelete(ticket.id)}
                                                                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                                Delete Ticket
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            
                            {filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="px-3 md:px-4 py-8 text-center">
                                        <Ticket className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 text-sm md:text-lg font-medium">No Tickets Found</p>
                                        <p className="text-gray-500 text-xs md:text-sm mt-2">
                                            {searchTicketNumber || searchSubject || searchEmployee
                                                ? "Try a different search term"
                                                : "No support tickets have been created yet"}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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