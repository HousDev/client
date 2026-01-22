// import { useState } from 'react';
// import { Ticket, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';
// import CreateTicketModal from '../components/modals/CreateTicketModal';

// export default function Tickets() {
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState<string>('');
//     const [showCreateModal, setShowCreateModal] = useState(false);

//     const tickets = [
//         { id: 1, title: 'Payroll Query - Missing Allowance', employee: 'John Doe', category: 'Payroll', priority: 'high', status: 'open', created: '2026-01-04', responses: 2 },
//         { id: 2, title: 'Leave Balance Inquiry', employee: 'Sarah Johnson', category: 'Leave', priority: 'medium', status: 'in_progress', created: '2026-01-03', responses: 5 },
//         { id: 3, title: 'Laptop Not Working', employee: 'Michael Chen', category: 'IT Support', priority: 'high', status: 'open', created: '2026-01-03', responses: 1 },
//         { id: 4, title: 'Update Personal Information', employee: 'Emma Williams', category: 'HR Query', priority: 'low', status: 'resolved', created: '2026-01-02', responses: 3 },
//     ];

//     const filteredTickets = tickets.filter((ticket) => {
//         const searchLower = searchTerm.toLowerCase();
//         const matchesSearch =
//             ticket.title.toLowerCase().includes(searchLower) ||
//             ticket.employee.toLowerCase().includes(searchLower);
//         const matchesStatus = !statusFilter || ticket.status === statusFilter;
//         return matchesSearch && matchesStatus;
//     });

//     return (
//         <div className="space-y-6">
//             <div className="flex items-center justify-between">
//                 <Button onClick={() => setShowCreateModal(true)}>
//                     <Plus className="h-4 w-4 mr-2" />
//                     Create Ticket
//                 </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Open Tickets</p>
//                             <p className="text-3xl font-bold text-blue-600 mt-2">2</p>
//                             <p className="text-xs text-slate-500 mt-1">Awaiting response</p>
//                         </div>
//                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <Ticket className="h-6 w-6 text-blue-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">In Progress</p>
//                             <p className="text-3xl font-bold text-yellow-600 mt-2">1</p>
//                             <p className="text-xs text-slate-500 mt-1">Being resolved</p>
//                         </div>
//                         <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-6 w-6 text-yellow-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Resolved Today</p>
//                             <p className="text-3xl font-bold text-green-600 mt-2">1</p>
//                             <p className="text-xs text-slate-500 mt-1">This week: 5</p>
//                         </div>
//                         <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//                             <Ticket className="h-6 w-6 text-green-600" />
//                         </div>
//                     </div>
//                 </Card>

//                 <Card className="p-6">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-slate-600">Avg Response Time</p>
//                             <p className="text-3xl font-bold text-purple-600 mt-2">2h</p>
//                             <p className="text-xs text-slate-500 mt-1">15min this week</p>
//                         </div>
//                         <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
//                             <Clock className="h-6 w-6 text-purple-600" />
//                         </div>
//                     </div>
//                 </Card>
//             </div>

//             <Card>
//                 <div className="p-6 border-b border-slate-200">
//                     <h2 className="text-xl font-semibold text-slate-900 mb-4">All Tickets</h2>
//                     <div className="flex items-center justify-between gap-4 flex-wrap">
//                         <div className="flex-1 min-w-64 max-w-md">
//                             <div className="relative">
//                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
//                                 <Input
//                                     type="text"
//                                     placeholder="Search tickets or employee..."
//                                     value={searchTerm}
//                                     onChange={(e) => setSearchTerm(e.target.value)}
//                                     className="pl-10"
//                                 />
//                             </div>
//                         </div>
//                         <select
//                             value={statusFilter}
//                             onChange={(e) => setStatusFilter(e.target.value)}
//                             className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                         >
//                             <option value="">All Status</option>
//                             <option value="open">Open</option>
//                             <option value="in_progress">In Progress</option>
//                             <option value="resolved">Resolved</option>
//                         </select>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full">
//                         <thead className="bg-slate-50 border-b border-slate-200">
//                             <tr>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Ticket</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Priority</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
//                                 <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Created</th>
//                                 <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {filteredTickets.map((ticket) => (
//                                 <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
//                                     <td className="px-6 py-4">
//                                         <div>
//                                             <p className="font-medium text-slate-900">{ticket.title}</p>
//                                             <div className="flex items-center gap-1 mt-1">
//                                                 <MessageSquare className="h-3 w-3 text-slate-400" />
//                                                 <span className="text-xs text-slate-500">{ticket.responses} responses</span>
//                                             </div>
//                                         </div>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm text-slate-900">{ticket.employee}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm text-slate-900">{ticket.category}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <Badge variant={
//                                             ticket.priority === 'high' ? 'error' :
//                                                 ticket.priority === 'medium' ? 'warning' : 'secondary'
//                                         }>
//                                             {ticket.priority}
//                                         </Badge>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <Badge variant={
//                                             ticket.status === 'resolved' ? 'success' :
//                                                 ticket.status === 'in_progress' ? 'warning' : 'info'
//                                         }>
//                                             {ticket.status}
//                                         </Badge>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <span className="text-sm text-slate-900">{ticket.created}</span>
//                                     </td>
//                                     <td className="px-6 py-4">
//                                         <div className="flex items-center justify-end gap-2">
//                                             <Button variant="secondary" size="sm">
//                                                 View
//                                             </Button>
//                                         </div>
//                                     </td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             </Card>

//             <CreateTicketModal
//                 isOpen={showCreateModal}
//                 onClose={() => setShowCreateModal(false)}
//                 onSuccess={() => {
//                     setShowCreateModal(false);
//                 }}
//             />
//         </div>
//     );
// }

import { useState } from 'react';
import { Ticket, Plus, Search, Filter, MessageSquare, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import CreateTicketModal from '../components/modals/CreateTicketModal';

export default function Tickets() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const tickets = [
        { id: 1, title: 'Payroll Query - Missing Allowance', employee: 'John Doe', category: 'Payroll', priority: 'high', status: 'open', created: '2026-01-04', responses: 2 },
        { id: 2, title: 'Leave Balance Inquiry', employee: 'Sarah Johnson', category: 'Leave', priority: 'medium', status: 'in_progress', created: '2026-01-03', responses: 5 },
        { id: 3, title: 'Laptop Not Working', employee: 'Michael Chen', category: 'IT Support', priority: 'high', status: 'open', created: '2026-01-03', responses: 1 },
        { id: 4, title: 'Update Personal Information', employee: 'Emma Williams', category: 'HR Query', priority: 'low', status: 'resolved', created: '2026-01-02', responses: 3 },
    ];

    const filteredTickets = tickets.filter((ticket) => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            ticket.title.toLowerCase().includes(searchLower) ||
            ticket.employee.toLowerCase().includes(searchLower);
        const matchesStatus = !statusFilter || ticket.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Support Tickets</h1>
                    <p className="text-slate-600 mt-1">Manage employee support requests</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Ticket
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Open Tickets</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">2</p>
                            <p className="text-xs text-slate-500 mt-1">Awaiting response</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">In Progress</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">1</p>
                            <p className="text-xs text-slate-500 mt-1">Being resolved</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Resolved Today</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">1</p>
                            <p className="text-xs text-slate-500 mt-1">This week: 5</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Ticket className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Avg Response Time</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">2h</p>
                            <p className="text-xs text-slate-500 mt-1">15min this week</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">All Tickets</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-64 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search tickets or employee..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Ticket</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Category</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Priority</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Created</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-slate-900">{ticket.title}</p>
                                            <div className="flex items-center gap-1 mt-1">
                                                <MessageSquare className="h-3 w-3 text-slate-400" />
                                                <span className="text-xs text-slate-500">{ticket.responses} responses</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-900">{ticket.employee}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-900">{ticket.category}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={
                                            ticket.priority === 'high' ? 'error' :
                                                ticket.priority === 'medium' ? 'warning' : 'secondary'
                                        }>
                                            {ticket.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={
                                            ticket.status === 'resolved' ? 'success' :
                                                ticket.status === 'in_progress' ? 'warning' : 'info'
                                        }>
                                            {ticket.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-900">{ticket.created}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="secondary" size="sm">
                                                View
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <CreateTicketModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                }}
            />
        </div>
    );
}
