import { useState, useEffect } from 'react';
import { Calendar, Plus, Search, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import ApplyLeaveModal from '../components/modals/ApplyLeaveModal';

interface LeaveRequest {
    id: string;
    employee: { first_name: string; last_name: string } | null;
    leave_type: { name: string } | null;
    from_date: string;
    to_date: string;
    total_days: number;
    status: string;
    reason: string;
}

// Mock leave data
const mockLeaves: LeaveRequest[] = [
    {
        id: '1',
        employee: { first_name: 'John', last_name: 'Doe' },
        leave_type: { name: 'Casual Leave' },
        from_date: '2024-01-20',
        to_date: '2024-01-22',
        total_days: 3,
        status: 'pending',
        reason: 'Family function',
    },
    {
        id: '2',
        employee: { first_name: 'Jane', last_name: 'Smith' },
        leave_type: { name: 'Sick Leave' },
        from_date: '2024-01-18',
        to_date: '2024-01-19',
        total_days: 2,
        status: 'approved',
        reason: 'Medical appointment',
    },
    {
        id: '3',
        employee: { first_name: 'Robert', last_name: 'Johnson' },
        leave_type: { name: 'Annual Leave' },
        from_date: '2024-01-25',
        to_date: '2024-01-30',
        total_days: 6,
        status: 'pending',
        reason: 'Vacation',
    },
    {
        id: '4',
        employee: { first_name: 'Sarah', last_name: 'Williams' },
        leave_type: { name: 'Maternity Leave' },
        from_date: '2024-02-01',
        to_date: '2024-04-01',
        total_days: 60,
        status: 'approved',
        reason: 'Maternity',
    },
    {
        id: '5',
        employee: { first_name: 'Michael', last_name: 'Brown' },
        leave_type: { name: 'Casual Leave' },
        from_date: '2024-01-15',
        to_date: '2024-01-16',
        total_days: 2,
        status: 'rejected',
        reason: 'Personal work',
    },
];

export default function Leaves() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [leaves, setLeaves] = useState<LeaveRequest[]>(mockLeaves);
    const [loading, setLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [stats, setStats] = useState({
        pending: 2,
        approved: 2,
        onLeave: 1,
        rejected: 1,
    });

    useEffect(() => {
        loadLeaves();
        loadStats();
    }, []);

    const loadLeaves = async () => {
        setLoading(true);
        try {
            // Mock loading with timeout
            await new Promise(resolve => setTimeout(resolve, 500));
            setLeaves(mockLeaves);
        } catch (error) {
            console.error('Error loading leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = () => {
        const pending = mockLeaves.filter(l => l.status === 'pending').length;
        const approved = mockLeaves.filter(l => l.status === 'approved').length;
        const rejected = mockLeaves.filter(l => l.status === 'rejected').length;

        // Mock logic for "on leave today"
        const today = new Date().toISOString().split('T')[0];
        const onLeave = mockLeaves.filter(l =>
            l.status === 'approved' &&
            l.from_date <= today &&
            l.to_date >= today
        ).length;

        setStats({
            pending,
            approved,
            onLeave,
            rejected,
        });
    };

    const handleApprove = async (id: string) => {
        try {
            // Mock approval with timeout
            await new Promise(resolve => setTimeout(resolve, 300));

            setLeaves(prev => prev.map(leave =>
                leave.id === id ? { ...leave, status: 'approved' } : leave
            ));

            loadStats();
            alert('Leave approved successfully');
        } catch (error) {
            console.error('Error approving leave:', error);
        }
    };

    const handleReject = async (id: string) => {
        try {
            // Mock rejection with timeout
            await new Promise(resolve => setTimeout(resolve, 300));

            setLeaves(prev => prev.map(leave =>
                leave.id === id ? { ...leave, status: 'rejected' } : leave
            ));

            loadStats();
            alert('Leave rejected');
        } catch (error) {
            console.error('Error rejecting leave:', error);
        }
    };

    const handleApplyLeave = (newLeave: any) => {
        const leaveWithId = {
            id: Date.now().toString(),
            employee: { first_name: 'You', last_name: '' },
            leave_type: { name: newLeave.leave_type || 'Casual Leave' },
            from_date: newLeave.from_date,
            to_date: newLeave.to_date,
            total_days: newLeave.total_days || 1,
            status: 'pending',
            reason: newLeave.reason,
        };

        setLeaves(prev => [leaveWithId, ...prev]);
        loadStats();
    };

    const filteredLeaves = leaves.filter((request) => {
        const name = request.employee
            ? `${request.employee.first_name} ${request.employee.last_name}`.toLowerCase()
            : '';
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = name.includes(searchLower);
        const matchesStatus = !statusFilter || request.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Button onClick={() => setShowApplyModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Apply Leave
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Pending Requests</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                            <p className="text-xs text-slate-500 mt-1">Awaiting approval</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Approved</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
                            <p className="text-xs text-slate-500 mt-1">Total approved</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">On Leave Today</p>
                            <p className="text-3xl font-bold text-blue-600 mt-2">{stats.onLeave}</p>
                            <p className="text-xs text-slate-500 mt-1">Currently away</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Rejected</p>
                            <p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                            <p className="text-xs text-slate-500 mt-1">This month</p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-6 border-b border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Leave Requests</h2>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-64 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <Input
                                    type="text"
                                    placeholder="Search employee..."
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
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Employee</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Leave Type</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">From</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">To</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Days</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Status</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLeaves.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        No leave requests found
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves.map((request) => (
                                    <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-900">
                                                    {request.employee?.first_name} {request.employee?.last_name}
                                                </p>
                                                <p className="text-sm text-slate-600">{request.reason}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{request.leave_type?.name || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{request.from_date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{request.to_date}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-slate-900">{request.total_days}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={
                                                request.status === 'approved' ? 'success' :
                                                    request.status === 'rejected' ? 'error' : 'warning'
                                            }>
                                                {request.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <Button variant="secondary" size="sm" onClick={() => handleApprove(request.id)}>
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button variant="secondary" size="sm" onClick={() => handleReject(request.id)}>
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <ApplyLeaveModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSuccess={(newLeave) => {
                    handleApplyLeave(newLeave);
                    setShowApplyModal(false);
                }}
            />
        </div>
    );
}