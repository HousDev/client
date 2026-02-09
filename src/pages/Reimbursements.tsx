import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Receipt, CheckCircle, Clock, XCircle, Upload, X, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface Reimbursement {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  category: string;
  amount: number;
  description: string;
  receipt_url?: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  approved_by?: string;
  approved_date?: string;
  payment_date?: string;
  rejection_reason?: string;
}

const mockEmployees = [
  { id: 'EMP001', name: 'Rajesh Kumar', code: 'EMP001' },
  { id: 'EMP002', name: 'Priya Sharma', code: 'EMP002' },
  { id: 'EMP003', name: 'Amit Patel', code: 'EMP003' },
  { id: 'EMP004', name: 'Sneha Verma', code: 'EMP004' },
];

const mockReimbursements: Reimbursement[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    category: 'Travel',
    amount: 8500,
    description: 'Business trip to Mumbai - Flight tickets and local transport',
    receipt_url: 'receipt_001.pdf',
    request_date: '2024-01-15',
    status: 'pending'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    employee_name: 'Priya Sharma',
    employee_code: 'EMP002',
    category: 'Food & Meals',
    amount: 2800,
    description: 'Client lunch meeting at Hotel Taj',
    receipt_url: 'receipt_002.pdf',
    request_date: '2024-01-18',
    status: 'approved',
    approved_by: 'Manager',
    approved_date: '2024-01-20'
  },
  {
    id: '3',
    employee_id: 'EMP003',
    employee_name: 'Amit Patel',
    employee_code: 'EMP003',
    category: 'Internet & Mobile',
    amount: 1200,
    description: 'Monthly internet and mobile expenses',
    receipt_url: 'receipt_003.pdf',
    request_date: '2024-01-10',
    status: 'paid',
    approved_by: 'Manager',
    approved_date: '2024-01-12',
    payment_date: '2024-01-22'
  },
  {
    id: '4',
    employee_id: 'EMP004',
    employee_name: 'Sneha Verma',
    employee_code: 'EMP004',
    category: 'Equipment',
    amount: 15000,
    description: 'Laptop accessories and external monitor',
    receipt_url: 'receipt_004.pdf',
    request_date: '2024-01-20',
    status: 'pending'
  }
];

export default function Reimbursements() {
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(mockReimbursements);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReimbursement, setSelectedReimbursement] = useState<Reimbursement | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [formData, setFormData] = useState({
    employee_id: '',
    category: 'Travel',
    amount: '',
    description: '',
    receipt: null as File | null
  });

  useEffect(() => {
    loadReimbursements();
  }, []);

  const loadReimbursements = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setReimbursements(mockReimbursements);
    } catch (error) {
      console.error('Error loading reimbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReimbursement = () => {
    const selectedEmployee = mockEmployees.find(e => e.id === formData.employee_id);
    if (!selectedEmployee || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please fill all required fields with valid values');
      return;
    }

    const newReimbursement: Reimbursement = {
      id: `REIMB${Date.now()}`,
      employee_id: selectedEmployee.id,
      employee_name: selectedEmployee.name,
      employee_code: selectedEmployee.code,
      category: formData.category,
      amount: parseFloat(formData.amount),
      description: formData.description,
      receipt_url: formData.receipt ? formData.receipt.name : undefined,
      request_date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setReimbursements([newReimbursement, ...reimbursements]);
    setShowAddModal(false);
    setFormData({
      employee_id: '',
      category: 'Travel',
      amount: '',
      description: '',
      receipt: null
    });
  };

  const handleApprove = (id: string) => {
    setReimbursements(reimbursements.map(reimb =>
      reimb.id === id
        ? { ...reimb, status: 'approved', approved_by: 'Manager', approved_date: new Date().toISOString().split('T')[0] }
        : reimb
    ));
  };

  const handleRejectSubmit = () => {
    if (!selectedReimbursement || !rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setReimbursements(reimbursements.map(reimb =>
      reimb.id === selectedReimbursement.id
        ? { ...reimb, status: 'rejected', rejection_reason: rejectionReason }
        : reimb
    ));
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedReimbursement(null);
  };

  const handlePay = (id: string) => {
    setReimbursements(reimbursements.map(reimb =>
      reimb.id === id
        ? { ...reimb, status: 'paid', payment_date: new Date().toISOString().split('T')[0] }
        : reimb
    ));
  };

  const handleViewDetails = (reimbursement: Reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setShowDetailsModal(true);
  };

  const handleReject = (reimbursement: Reimbursement) => {
    setSelectedReimbursement(reimbursement);
    setShowRejectModal(true);
  };

  const stats = {
    pending: reimbursements.filter(r => r.status === 'pending').length,
    approved: reimbursements.filter(r => r.status === 'approved').length,
    paid: reimbursements.filter(r => r.status === 'paid').length,
    totalAmount: reimbursements.reduce((sum, r) => sum + r.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'paid':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const filteredReimbursements = reimbursements.filter(reimbursement => {
    const matchesSearch = reimbursement.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reimbursement.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || reimbursement.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reimbursements</h1>
          <p className="text-slate-600 mt-1">Manage employee expense reimbursements</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Reimbursement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending</p>
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
              <p className="text-sm text-slate-600">Paid</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.paid}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Receipt className="h-6 w-6 text-blue-600" />
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
              <Receipt className="h-6 w-6 text-slate-600" />
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
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="travel">Travel</option>
                <option value="food">Food & Meals</option>
                <option value="accommodation">Accommodation</option>
                <option value="equipment">Equipment</option>
                <option value="internet">Internet & Mobile</option>
                <option value="other">Other</option>
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
          <div className="p-6 text-center text-slate-600">Loading reimbursements...</div>
        ) : filteredReimbursements.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reimbursements</h3>
            <p className="text-slate-600 mb-1">There are no reimbursement requests to display.</p>
            <p className="text-sm text-slate-500">
              Click "New Reimbursement" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Request Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReimbursements.map((reimbursement) => (
                  <tr key={reimbursement.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{reimbursement.employee_name}</p>
                        <p className="text-xs text-slate-600">{reimbursement.employee_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{reimbursement.category}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-900">₹{reimbursement.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{reimbursement.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{new Date(reimbursement.request_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(reimbursement.status)}>
                        {reimbursement.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {reimbursement.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(reimbursement.id)}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(reimbursement)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {reimbursement.status === 'approved' && (
                          <Button size="sm" onClick={() => handlePay(reimbursement.id)}>
                            Pay Now
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(reimbursement)}>
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

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">New Reimbursement Request</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Employee *
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an employee</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Travel">Travel</option>
                  <option value="Food & Meals">Food & Meals</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Internet & Mobile">Internet & Mobile</option>
                  <option value="Medical">Medical</option>
                  <option value="Fuel">Fuel</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Amount (₹) *
                </label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the expense"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Upload Receipt
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-1">Click to upload receipt</p>
                  <p className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB</p>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFormData({ ...formData, receipt: e.target.files?.[0] || null })}
                    className="hidden"
                  />
                </div>
                {formData.receipt && (
                  <p className="text-sm text-green-600 mt-2">
                    <FileText className="h-4 w-4 inline mr-1" />
                    {formData.receipt.name}
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  The reimbursement request will require approval before payment processing.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddReimbursement}>
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedReimbursement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Reimbursement Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee</p>
                  <p className="font-medium text-slate-900">{selectedReimbursement.employee_name}</p>
                  <p className="text-xs text-slate-600">{selectedReimbursement.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Category</p>
                  <Badge variant="info">{selectedReimbursement.category}</Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{selectedReimbursement.amount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Description</p>
                <p className="text-slate-900">{selectedReimbursement.description}</p>
              </div>

              {selectedReimbursement.receipt_url && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Receipt</p>
                  <Button size="sm" variant="secondary">
                    <FileText className="h-4 w-4 mr-2" />
                    View Receipt ({selectedReimbursement.receipt_url})
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge variant={getStatusColor(selectedReimbursement.status)}>
                    {selectedReimbursement.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Request Date</p>
                  <p className="text-slate-900">{new Date(selectedReimbursement.request_date).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedReimbursement.approved_by && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Approved By</p>
                      <p className="font-medium text-slate-900">{selectedReimbursement.approved_by}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Approved Date</p>
                      <p className="text-slate-900">
                        {selectedReimbursement.approved_date && new Date(selectedReimbursement.approved_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedReimbursement.payment_date && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-700">
                    Payment processed on {new Date(selectedReimbursement.payment_date).toLocaleDateString()}
                  </p>
                </div>
              )}

              {selectedReimbursement.status === 'rejected' && selectedReimbursement.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-900 mb-1">Rejection Reason:</p>
                  <p className="text-sm text-red-700">{selectedReimbursement.rejection_reason}</p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Reject Reimbursement</h2>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-700">
                  Please provide a reason for rejecting this reimbursement request.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Enter reason for rejection..."
                />
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRejectSubmit}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
