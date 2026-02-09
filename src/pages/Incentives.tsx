import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Award, TrendingUp, Users, DollarSign, Upload, X, CheckCircle, XCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface Incentive {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  employee_ctc: number;
  incentive_type: string;
  amount: number;
  month: string;
  year: number;
  description: string;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  approved_by?: string;
  approved_date?: string;
}

const mockEmployees = [
  { id: 'EMP001', name: 'Rajesh Kumar', code: 'EMP001', ctc: 800000 },
  { id: 'EMP002', name: 'Priya Sharma', code: 'EMP002', ctc: 650000 },
  { id: 'EMP003', name: 'Amit Patel', code: 'EMP003', ctc: 720000 },
  { id: 'EMP004', name: 'Sneha Verma', code: 'EMP004', ctc: 580000 },
];

const mockIncentives: Incentive[] = [
  {
    id: '1',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    employee_ctc: 800000,
    incentive_type: 'Performance Bonus',
    amount: 50000,
    month: 'January',
    year: 2024,
    description: 'Q4 2023 outstanding performance in sales targets',
    status: 'approved',
    created_at: '2024-01-05',
    approved_by: 'Manager',
    approved_date: '2024-01-10'
  },
  {
    id: '2',
    employee_id: 'EMP002',
    employee_name: 'Priya Sharma',
    employee_code: 'EMP002',
    employee_ctc: 650000,
    incentive_type: 'Project Completion',
    amount: 35000,
    month: 'January',
    year: 2024,
    description: 'Successful delivery of Project Phoenix',
    status: 'pending',
    created_at: '2024-01-15'
  },
  {
    id: '3',
    employee_id: 'EMP003',
    employee_name: 'Amit Patel',
    employee_code: 'EMP003',
    employee_ctc: 720000,
    incentive_type: 'Quarterly Incentive',
    amount: 40000,
    month: 'December',
    year: 2023,
    description: 'Q4 quarterly performance incentive',
    status: 'paid',
    created_at: '2023-12-28',
    approved_by: 'Manager',
    approved_date: '2024-01-02'
  },
  {
    id: '4',
    employee_id: 'EMP004',
    employee_name: 'Sneha Verma',
    employee_code: 'EMP004',
    employee_ctc: 580000,
    incentive_type: 'Referral Bonus',
    amount: 25000,
    month: 'January',
    year: 2024,
    description: 'Successful referral - 3 candidates hired',
    status: 'pending',
    created_at: '2024-01-20'
  }
];

export default function Incentives() {
  const [incentives, setIncentives] = useState<Incentive[]>(mockIncentives);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    incentive_type: 'Performance Bonus',
    amount: '',
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    description: ''
  });

  useEffect(() => {
    loadIncentives();
  }, []);

  const loadIncentives = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setIncentives(mockIncentives);
    } catch (error) {
      console.error('Error loading incentives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncentive = () => {
    const selectedEmployee = mockEmployees.find(e => e.id === formData.employee_id);
    if (!selectedEmployee || !formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please fill all required fields with valid values');
      return;
    }

    const newIncentive: Incentive = {
      id: `INC${Date.now()}`,
      employee_id: selectedEmployee.id,
      employee_name: selectedEmployee.name,
      employee_code: selectedEmployee.code,
      employee_ctc: selectedEmployee.ctc,
      incentive_type: formData.incentive_type,
      amount: parseFloat(formData.amount),
      month: formData.month,
      year: formData.year,
      description: formData.description,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    setIncentives([newIncentive, ...incentives]);
    setShowAddModal(false);
    setFormData({
      employee_id: '',
      incentive_type: 'Performance Bonus',
      amount: '',
      month: new Date().toLocaleString('default', { month: 'long' }),
      year: new Date().getFullYear(),
      description: ''
    });
  };

  const handleApprove = (id: string) => {
    setIncentives(incentives.map(inc =>
      inc.id === id
        ? { ...inc, status: 'approved', approved_by: 'Manager', approved_date: new Date().toISOString() }
        : inc
    ));
  };

  const handleReject = (id: string) => {
    if (confirm('Are you sure you want to reject this incentive?')) {
      setIncentives(incentives.filter(inc => inc.id !== id));
    }
  };

  const handlePay = (id: string) => {
    setIncentives(incentives.map(inc =>
      inc.id === id ? { ...inc, status: 'paid' } : inc
    ));
  };

  const handleViewDetails = (incentive: Incentive) => {
    setSelectedIncentive(incentive);
    setShowDetailsModal(true);
  };

  const stats = {
    totalIncentives: incentives.length,
    pending: incentives.filter(i => i.status === 'pending').length,
    approved: incentives.filter(i => i.status === 'approved').length,
    totalAmount: incentives.reduce((sum, i) => sum + i.amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'paid':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const filteredIncentives = incentives.filter(incentive => {
    const matchesSearch = incentive.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incentive.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || incentive.incentive_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Incentives & Bonuses</h1>
          <p className="text-slate-600 mt-1">Manage performance incentives and bonus payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Incentive
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Incentives</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalIncentives}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
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
              <Award className="h-6 w-6 text-green-600" />
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
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="performance">Performance Bonus</option>
                <option value="quarterly">Quarterly Incentive</option>
                <option value="annual">Annual Bonus</option>
                <option value="project">Project Completion</option>
                <option value="referral">Referral Bonus</option>
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
          <div className="p-6 text-center text-slate-600">Loading incentives...</div>
        ) : filteredIncentives.length === 0 ? (
          <div className="p-12 text-center">
            <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Incentives</h3>
            <p className="text-slate-600 mb-1">There are no incentives or bonuses to display.</p>
            <p className="text-sm text-slate-500">
              Click "Add Incentive" to create one.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Period</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIncentives.map((incentive) => (
                  <tr key={incentive.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{incentive.employee_name}</p>
                        <p className="text-xs text-slate-600">{incentive.employee_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{incentive.incentive_type}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-green-600">₹{incentive.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{incentive.month} {incentive.year}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{incentive.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(incentive.status)}>
                        {incentive.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {incentive.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(incentive.id)}>
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleReject(incentive.id)}>
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {incentive.status === 'approved' && (
                          <Button size="sm" onClick={() => handlePay(incentive.id)}>
                            Pay Now
                          </Button>
                        )}
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(incentive)}>
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
              <h2 className="text-lg font-semibold text-slate-900">Add Incentive</h2>
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
                      {emp.name} ({emp.code}) - CTC: ₹{emp.ctc.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Incentive Type *
                </label>
                <select
                  value={formData.incentive_type}
                  onChange={(e) => setFormData({ ...formData, incentive_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Performance Bonus">Performance Bonus</option>
                  <option value="Quarterly Incentive">Quarterly Incentive</option>
                  <option value="Annual Bonus">Annual Bonus</option>
                  <option value="Project Completion">Project Completion</option>
                  <option value="Referral Bonus">Referral Bonus</option>
                  <option value="Attendance Bonus">Attendance Bonus</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Month *
                  </label>
                  <select
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Year *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </div>
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
                  placeholder="Reason for incentive/bonus"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  The incentive will be created with pending status and require approval before payment.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIncentive}>
                Create Incentive
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedIncentive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Incentive Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee</p>
                  <p className="font-medium text-slate-900">{selectedIncentive.employee_name}</p>
                  <p className="text-xs text-slate-600">{selectedIncentive.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee CTC</p>
                  <p className="font-medium text-slate-900">₹{selectedIncentive.employee_ctc.toLocaleString()}</p>
                  <p className="text-xs text-slate-600">Annual</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Incentive Type</p>
                  <Badge variant="info">{selectedIncentive.incentive_type}</Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Period</p>
                  <p className="font-medium text-slate-900">{selectedIncentive.month} {selectedIncentive.year}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{selectedIncentive.amount.toLocaleString()}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Description</p>
                <p className="text-slate-900">{selectedIncentive.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge variant={getStatusColor(selectedIncentive.status)}>
                    {selectedIncentive.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Created Date</p>
                  <p className="text-slate-900">{new Date(selectedIncentive.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              {selectedIncentive.approved_by && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Approved By</p>
                      <p className="font-medium text-slate-900">{selectedIncentive.approved_by}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Approved Date</p>
                      <p className="text-slate-900">
                        {selectedIncentive.approved_date && new Date(selectedIncentive.approved_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
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

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Import Incentives from CSV</h2>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-900 font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-slate-600">CSV file up to 10MB</p>
                <input type="file" accept=".csv" className="hidden" />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm font-medium text-slate-900 mb-2">CSV Format Requirements:</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Column 1: Employee Code</li>
                  <li>• Column 2: Incentive Type</li>
                  <li>• Column 3: Amount</li>
                  <li>• Column 4: Month</li>
                  <li>• Column 5: Year</li>
                  <li>• Column 6: Description</li>
                </ul>
              </div>

              <Button variant="secondary" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Sample CSV Template
              </Button>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </Button>
              <Button>
                Upload & Import
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
