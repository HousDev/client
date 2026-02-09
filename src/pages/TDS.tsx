import { useState, useEffect } from 'react';
import { Search, Filter, Download, FileText, DollarSign, Users, Calendar, X, Eye, CheckCircle } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface TDSRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  pan_number: string;
  financial_year: string;
  quarter: string;
  gross_salary: number;
  taxable_income: number;
  tds_deducted: number;
  tds_deposited: number;
  challan_number?: string;
  deposit_date?: string;
  status: 'pending' | 'deposited' | 'filed';
}

const mockRecords: TDSRecord[] = [
  {
    id: 'TDS001',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    pan_number: 'ABCDE1234F',
    financial_year: '2024-25',
    quarter: 'Q3',
    gross_salary: 240000,
    taxable_income: 210000,
    tds_deducted: 28000,
    tds_deposited: 28000,
    challan_number: 'CHL2024Q3001',
    deposit_date: '2024-01-07',
    status: 'filed'
  },
  {
    id: 'TDS002',
    employee_id: 'EMP002',
    employee_name: 'Priya Sharma',
    employee_code: 'EMP002',
    pan_number: 'XYZPQ5678M',
    financial_year: '2024-25',
    quarter: 'Q3',
    gross_salary: 195000,
    taxable_income: 170000,
    tds_deducted: 18000,
    tds_deposited: 18000,
    challan_number: 'CHL2024Q3002',
    deposit_date: '2024-01-07',
    status: 'deposited'
  },
  {
    id: 'TDS003',
    employee_id: 'EMP003',
    employee_name: 'Amit Patel',
    employee_code: 'EMP003',
    pan_number: 'LMNOP9012K',
    financial_year: '2024-25',
    quarter: 'Q3',
    gross_salary: 285000,
    taxable_income: 250000,
    tds_deducted: 38000,
    tds_deposited: 0,
    status: 'pending'
  },
  {
    id: 'TDS004',
    employee_id: 'EMP004',
    employee_name: 'Sneha Verma',
    employee_code: 'EMP004',
    pan_number: 'QRSTU3456H',
    financial_year: '2024-25',
    quarter: 'Q3',
    gross_salary: 210000,
    taxable_income: 185000,
    tds_deducted: 22000,
    tds_deposited: 0,
    status: 'pending'
  },
  {
    id: 'TDS005',
    employee_id: 'EMP005',
    employee_name: 'Vikram Singh',
    employee_code: 'EMP005',
    pan_number: 'VWXYZ7890N',
    financial_year: '2024-25',
    quarter: 'Q3',
    gross_salary: 216000,
    taxable_income: 190000,
    tds_deducted: 24000,
    tds_deposited: 24000,
    challan_number: 'CHL2024Q3003',
    deposit_date: '2024-01-07',
    status: 'filed'
  },
  {
    id: 'TDS006',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    pan_number: 'ABCDE1234F',
    financial_year: '2024-25',
    quarter: 'Q4',
    gross_salary: 240000,
    taxable_income: 210000,
    tds_deducted: 29000,
    tds_deposited: 0,
    status: 'pending'
  }
];

export default function TDS() {
  const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>(mockRecords);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2024-25');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TDSRecord | null>(null);

  const [depositForm, setDepositForm] = useState({
    challan_number: '',
    deposit_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    branch: ''
  });

  useEffect(() => {
    loadTDSRecords();
  }, []);

  const loadTDSRecords = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  const handleViewDetails = (record: TDSRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleMarkDeposited = (record: TDSRecord) => {
    setSelectedRecord(record);
    setDepositForm({
      challan_number: '',
      deposit_date: new Date().toISOString().split('T')[0],
      bank_name: '',
      branch: ''
    });
    setShowDepositModal(true);
  };

  const handleSubmitDeposit = () => {
    if (!selectedRecord) return;

    if (!depositForm.challan_number || !depositForm.deposit_date) {
      alert('Please fill all required fields');
      return;
    }

    setTdsRecords(records =>
      records.map(r =>
        r.id === selectedRecord.id
          ? {
              ...r,
              status: 'deposited',
              tds_deposited: r.tds_deducted,
              challan_number: depositForm.challan_number,
              deposit_date: depositForm.deposit_date
            }
          : r
      )
    );

    setShowDepositModal(false);
    setSelectedRecord(null);
    alert('TDS deposit marked successfully!');
  };

  const handleMarkFiled = (recordId: string) => {
    setTdsRecords(records =>
      records.map(r =>
        r.id === recordId ? { ...r, status: 'filed' } : r
      )
    );
    alert('TDS return filed successfully!');
  };

  const handleGenerateForm16 = (record: TDSRecord) => {
    alert(`Generating Form 16 for ${record.employee_name}...`);
  };

  const handleDownloadReturn = () => {
    const quarter = quarterFilter === 'all' ? 'All_Quarters' : quarterFilter;
    alert(`Downloading TDS return for FY ${yearFilter} ${quarter}...`);
  };

  const stats = {
    totalEmployees: new Set(tdsRecords.filter(r => r.financial_year === yearFilter).map(r => r.employee_id)).size,
    totalDeducted: tdsRecords.filter(r => r.financial_year === yearFilter).reduce((sum, r) => sum + r.tds_deducted, 0),
    totalDeposited: tdsRecords.filter(r => r.financial_year === yearFilter).reduce((sum, r) => sum + r.tds_deposited, 0),
    pendingDeposit: tdsRecords.filter(r => r.financial_year === yearFilter && r.status === 'pending').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'filed':
        return 'success';
      case 'deposited':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const filteredRecords = tdsRecords.filter(record => {
    const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.pan_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesQuarter = quarterFilter === 'all' || record.quarter === quarterFilter;
    const matchesYear = record.financial_year === yearFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesQuarter && matchesYear && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">TDS Management</h1>
          <p className="text-slate-600 mt-1">Track and manage Tax Deducted at Source</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <FileText className="h-4 w-4 mr-2" />
            Generate Form 16
          </Button>
          <Button onClick={handleDownloadReturn}>
            <Download className="h-4 w-4 mr-2" />
            Download TDS Return
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalEmployees}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">TDS Deducted</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                ₹{(stats.totalDeducted / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">TDS Deposited</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                ₹{(stats.totalDeposited / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Deposit</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.pendingDeposit}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-red-600" />
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
                  placeholder="Search by employee, code or PAN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2025-26">FY 2025-26</option>
                <option value="2024-25">FY 2024-25</option>
                <option value="2023-24">FY 2023-24</option>
              </select>
              <select
                value={quarterFilter}
                onChange={(e) => setQuarterFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Quarters</option>
                <option value="Q1">Q1 (Apr-Jun)</option>
                <option value="Q2">Q2 (Jul-Sep)</option>
                <option value="Q3">Q3 (Oct-Dec)</option>
                <option value="Q4">Q4 (Jan-Mar)</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="deposited">Deposited</option>
                <option value="filed">Filed</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading TDS records...</div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No TDS Records</h3>
            <p className="text-slate-600 mb-1">There are no TDS records for the selected period.</p>
            <p className="text-sm text-slate-500">
              TDS is automatically calculated during payroll processing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">PAN</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Quarter</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Gross Salary</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Taxable Income</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">TDS Deducted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{record.employee_name}</p>
                        <p className="text-xs text-slate-600">{record.employee_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        {record.pan_number}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{record.quarter}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-slate-700">₹{record.gross_salary.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-slate-700">₹{record.taxable_income.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-yellow-600">₹{record.tds_deducted.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(record.status)}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(record)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {record.status === 'pending' && (
                          <Button size="sm" onClick={() => handleMarkDeposited(record)}>
                            Mark Deposited
                          </Button>
                        )}
                        {record.status === 'deposited' && (
                          <Button size="sm" variant="secondary" onClick={() => handleMarkFiled(record.id)}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Filed
                          </Button>
                        )}
                        {record.status === 'filed' && (
                          <Button size="sm" variant="secondary" onClick={() => handleGenerateForm16(record)}>
                            <FileText className="h-3 w-3 mr-1" />
                            Form 16
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">TDS Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee</p>
                  <p className="font-medium text-slate-900">{selectedRecord.employee_name}</p>
                  <p className="text-xs text-slate-600">{selectedRecord.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">PAN Number</p>
                  <p className="font-mono text-sm font-medium text-slate-900">{selectedRecord.pan_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Financial Year</p>
                  <p className="font-medium text-slate-900">FY {selectedRecord.financial_year}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Quarter</p>
                  <Badge variant="info">{selectedRecord.quarter}</Badge>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Tax Calculation</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Salary (Quarterly)</span>
                    <span className="font-medium text-slate-900">₹{selectedRecord.gross_salary.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Taxable Income</span>
                    <span className="font-medium text-slate-900">₹{selectedRecord.taxable_income.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">TDS Deducted</span>
                      <span className="font-bold text-yellow-600 text-lg">₹{selectedRecord.tds_deducted.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRecord.status !== 'pending' && (
                <div className="border-t border-slate-200 pt-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Deposit Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Challan Number</p>
                      <p className="font-mono text-sm font-medium text-slate-900">{selectedRecord.challan_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Deposit Date</p>
                      <p className="font-medium text-slate-900">
                        {selectedRecord.deposit_date && new Date(selectedRecord.deposit_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-slate-600 mb-1">TDS Deposited</p>
                    <p className="font-bold text-green-600 text-lg">₹{selectedRecord.tds_deposited.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              {selectedRecord.status === 'filed' && (
                <Button variant="secondary" onClick={() => handleGenerateForm16(selectedRecord)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Form 16
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Deposited Modal */}
      {showDepositModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Mark TDS as Deposited</h2>
              <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-700">
                  <strong>{selectedRecord.employee_name}</strong> - {selectedRecord.quarter} FY {selectedRecord.financial_year}
                  <br />TDS Amount: <strong>₹{selectedRecord.tds_deducted.toLocaleString()}</strong>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Challan Number *</label>
                <Input
                  value={depositForm.challan_number}
                  onChange={(e) => setDepositForm({ ...depositForm, challan_number: e.target.value })}
                  placeholder="Enter challan number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Date *</label>
                <Input
                  type="date"
                  value={depositForm.deposit_date}
                  onChange={(e) => setDepositForm({ ...depositForm, deposit_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
                <Input
                  value={depositForm.bank_name}
                  onChange={(e) => setDepositForm({ ...depositForm, bank_name: e.target.value })}
                  placeholder="Enter bank name (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
                <Input
                  value={depositForm.branch}
                  onChange={(e) => setDepositForm({ ...depositForm, branch: e.target.value })}
                  placeholder="Enter branch name (optional)"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDepositModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitDeposit}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Deposited
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
