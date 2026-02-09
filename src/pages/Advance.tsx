import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, DollarSign, Calendar, CheckCircle, Clock, XCircle, Eye, AlertCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';

interface AdvanceRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  employee_ctc: number;
  amount: number;
  reason: string;
  request_date: string;
  installments: number;
  status: 'pending' | 'approved' | 'rejected' | 'disbursed' | 'recovering' | 'recovered';
  approved_by?: string;
  approved_date?: string;
  disbursement_date?: string;
  total_recovered?: number;
  balance_amount?: number;
}

export default function Advance() {
  const [advances, setAdvances] = useState<AdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<AdvanceRequest | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    employee_id: '',
    amount: '',
    reason: '',
    installments: '3',
    required_date: ''
  });

  const [approvalData, setApprovalData] = useState({
    action: 'approve' as 'approve' | 'reject',
    remarks: ''
  });

  useEffect(() => {
    loadAdvances();
  }, []);

  const loadAdvances = async () => {
    setLoading(true);
    try {
      // API call would go here
      // For now, using mock data
      const mockData: AdvanceRequest[] = [
        {
          id: '1',
          employee_id: 'emp1',
          employee_name: 'Abhishek Patil',
          employee_code: 'EMP001',
          employee_ctc: 1500000,
          amount: 50000,
          reason: 'Medical emergency',
          request_date: '2026-01-15',
          installments: 3,
          status: 'pending',
          balance_amount: 50000
        },
        {
          id: '2',
          employee_id: 'emp2',
          employee_name: 'Guru Kandgavalkar',
          employee_code: 'EMP002',
          employee_ctc: 1100000,
          amount: 30000,
          reason: 'Personal loan',
          request_date: '2026-01-10',
          installments: 2,
          status: 'approved',
          approved_date: '2026-01-12',
          balance_amount: 30000
        },
        {
          id: '3',
          employee_id: 'emp3',
          employee_name: 'Heena Bagwan',
          employee_code: 'EMP003',
          employee_ctc: 1200000,
          amount: 25000,
          reason: 'Home renovation',
          request_date: '2026-01-05',
          installments: 5,
          status: 'recovering',
          disbursement_date: '2026-01-08',
          total_recovered: 10000,
          balance_amount: 15000
        }
      ];
      setAdvances(mockData);
    } catch (error) {
      console.error('Error loading advances:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending: advances.filter(a => a.status === 'pending').length,
    approved: advances.filter(a => a.status === 'approved').length,
    disbursed: advances.filter(a => a.status === 'disbursed' || a.status === 'recovering').length,
    totalAmount: advances.reduce((sum, a) => sum + a.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'disbursed':
      case 'recovering':
        return 'info';
      case 'recovered':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const handleCreateAdvance = async () => {
    // Validate form
    if (!formData.employee_id || !formData.amount || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }

    try {
      // API call would go here
      console.log('Creating advance:', formData);

      // Close modal and reset form
      setShowCreateModal(false);
      setFormData({
        employee_id: '',
        amount: '',
        reason: '',
        installments: '3',
        required_date: ''
      });

      // Reload advances
      await loadAdvances();
      alert('Advance request created successfully!');
    } catch (error) {
      console.error('Error creating advance:', error);
      alert('Failed to create advance request');
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedAdvance) return;

    try {
      // API call would go here
      console.log(`${approvalData.action} advance:`, selectedAdvance.id, approvalData.remarks);

      setShowApprovalModal(false);
      setSelectedAdvance(null);
      setApprovalData({ action: 'approve', remarks: '' });

      await loadAdvances();
      alert(`Advance ${approvalData.action}d successfully!`);
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Failed to process request');
    }
  };

  const handleDisburse = async (advance: AdvanceRequest) => {
    if (!confirm(`Disburse ₹${advance.amount.toLocaleString()} to ${advance.employee_name}?`)) {
      return;
    }

    try {
      // API call would go here
      console.log('Disbursing advance:', advance.id);
      await loadAdvances();
      alert('Advance disbursed successfully!');
    } catch (error) {
      console.error('Error disbursing advance:', error);
      alert('Failed to disburse advance');
    }
  };

  const filteredAdvances = advances.filter(advance => {
    const matchesSearch = advance.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         advance.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || advance.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Salary Advance</h1>
          <p className="text-slate-600 mt-1">Manage employee salary advance requests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Advance Request
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Requests</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
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
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Disbursed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.disbursed}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Amount</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₹{(stats.totalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by employee name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="disbursed">Disbursed</option>
                <option value="recovering">Recovering</option>
                <option value="recovered">Recovered</option>
              </select>
              <Button variant="secondary" className="text-sm h-9">
                <Filter className="h-4 w-4 mr-1.5" />
                Filter
              </Button>
              <Button variant="secondary" className="text-sm h-9">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading advance requests...</div>
        ) : filteredAdvances.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Advance Requests</h3>
            <p className="text-slate-600 mb-4">There are no salary advance requests to display.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Request
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Reason</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Installments</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Request Date</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Balance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdvances.map((advance) => (
                  <tr key={advance.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{advance.employee_name}</p>
                        <p className="text-xs text-slate-600">{advance.employee_code}</p>
                        <p className="text-xs text-blue-600">₹{(advance.employee_ctc / 12).toLocaleString()}/month</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-slate-900">₹{advance.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700 max-w-xs truncate">{advance.reason}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="secondary">{advance.installments}x</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{new Date(advance.request_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {advance.balance_amount !== undefined && (
                        <p className="text-sm font-medium text-orange-600">₹{advance.balance_amount.toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(advance.status)}>
                        {advance.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {advance.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => {
                                setSelectedAdvance(advance);
                                setApprovalData({ action: 'approve', remarks: '' });
                                setShowApprovalModal(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => {
                                setSelectedAdvance(advance);
                                setApprovalData({ action: 'reject', remarks: '' });
                                setShowApprovalModal(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {advance.status === 'approved' && (
                          <Button
                            size="sm"
                            onClick={() => handleDisburse(advance)}
                          >
                            Disburse
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedAdvance(advance);
                            setShowDetailsModal(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Create Advance Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Advance Request"
          size="lg"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose an employee...</option>
                <option value="emp1">Abhishek Patil (EMP001) - ₹1,25,000/month</option>
                <option value="emp2">Guru Kandgavalkar (EMP002) - ₹91,667/month</option>
                <option value="emp3">Heena Bagwan (EMP003) - ₹1,00,000/month</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Advance Amount (₹) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="Enter amount"
              />
              <p className="text-xs text-slate-500 mt-1">Maximum: 2x monthly salary</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
                placeholder="Describe the reason for advance..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Installments
                </label>
                <select
                  value={formData.installments}
                  onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1">1 Month</option>
                  <option value="2">2 Months</option>
                  <option value="3">3 Months</option>
                  <option value="4">4 Months</option>
                  <option value="5">5 Months</option>
                  <option value="6">6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Required By
                </label>
                <Input
                  type="date"
                  value={formData.required_date}
                  onChange={(e) => setFormData({ ...formData, required_date: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <AlertCircle className="h-3 w-3 inline mr-1" />
                Recovery will start from the next month's salary. Monthly deduction: ₹{formData.amount && formData.installments ? (parseFloat(formData.amount) / parseInt(formData.installments)).toLocaleString() : '0'}
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAdvance}>
                Create Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAdvance && (
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={`${approvalData.action === 'approve' ? 'Approve' : 'Reject'} Advance Request`}
        >
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-600">Employee</p>
                  <p className="font-medium text-slate-900">{selectedAdvance.employee_name}</p>
                </div>
                <div>
                  <p className="text-slate-600">Amount</p>
                  <p className="font-medium text-slate-900">₹{selectedAdvance.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-600">Installments</p>
                  <p className="font-medium text-slate-900">{selectedAdvance.installments} months</p>
                </div>
                <div>
                  <p className="text-slate-600">Monthly Deduction</p>
                  <p className="font-medium text-slate-900">₹{(selectedAdvance.amount / selectedAdvance.installments).toLocaleString()}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-600">Reason</p>
                  <p className="font-medium text-slate-900">{selectedAdvance.reason}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Remarks {approvalData.action === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={approvalData.remarks}
                onChange={(e) => setApprovalData({ ...approvalData, remarks: e.target.value })}
                rows={3}
                placeholder={`Enter ${approvalData.action} remarks...`}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button
                variant={approvalData.action === 'approve' ? 'success' : 'danger'}
                onClick={handleApprovalAction}
              >
                {approvalData.action === 'approve' ? 'Approve' : 'Reject'} Request
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedAdvance && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          title="Advance Request Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-600">Employee</label>
                <p className="font-medium text-slate-900">{selectedAdvance.employee_name}</p>
                <p className="text-xs text-slate-600">{selectedAdvance.employee_code}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Monthly CTC</label>
                <p className="font-medium text-slate-900">₹{(selectedAdvance.employee_ctc / 12).toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Advance Amount</label>
                <p className="font-medium text-green-600">₹{selectedAdvance.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Status</label>
                <Badge variant={getStatusColor(selectedAdvance.status)}>{selectedAdvance.status}</Badge>
              </div>
              <div>
                <label className="text-sm text-slate-600">Installments</label>
                <p className="font-medium text-slate-900">{selectedAdvance.installments} months</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Monthly Deduction</label>
                <p className="font-medium text-slate-900">₹{(selectedAdvance.amount / selectedAdvance.installments).toLocaleString()}</p>
              </div>
              {selectedAdvance.total_recovered !== undefined && (
                <>
                  <div>
                    <label className="text-sm text-slate-600">Total Recovered</label>
                    <p className="font-medium text-blue-600">₹{selectedAdvance.total_recovered.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-600">Balance Amount</label>
                    <p className="font-medium text-orange-600">₹{selectedAdvance.balance_amount?.toLocaleString()}</p>
                  </div>
                </>
              )}
              <div className="col-span-2">
                <label className="text-sm text-slate-600">Reason</label>
                <p className="font-medium text-slate-900">{selectedAdvance.reason}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Request Date</label>
                <p className="font-medium text-slate-900">{new Date(selectedAdvance.request_date).toLocaleDateString()}</p>
              </div>
              {selectedAdvance.approved_date && (
                <div>
                  <label className="text-sm text-slate-600">Approved Date</label>
                  <p className="font-medium text-slate-900">{new Date(selectedAdvance.approved_date).toLocaleDateString()}</p>
                </div>
              )}
              {selectedAdvance.disbursement_date && (
                <div>
                  <label className="text-sm text-slate-600">Disbursement Date</label>
                  <p className="font-medium text-slate-900">{new Date(selectedAdvance.disbursement_date).toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
