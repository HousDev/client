import { useState, useEffect } from 'react';
import { Search, Filter, Download, DollarSign, Calendar, CheckCircle, Clock, X, Eye, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

interface Payment {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  payroll_run_id: string;
  pay_month: string;
  pay_year: number;
  gross_amount: number;
  deductions: number;
  net_amount: number;
  payment_method: 'bank_transfer' | 'upi' | 'cash' | 'cheque';
  payment_date: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  bank_name?: string;
  account_number?: string;
}

const mockPayments: Payment[] = [
  {
    id: 'PAY001',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    payroll_run_id: 'PR001',
    pay_month: 'January',
    pay_year: 2024,
    gross_amount: 80000,
    deductions: 14000,
    net_amount: 66000,
    payment_method: 'bank_transfer',
    payment_date: '2024-01-31',
    transaction_id: 'TXN20240131001',
    status: 'completed',
    bank_name: 'HDFC Bank',
    account_number: '****5678'
  },
  {
    id: 'PAY002',
    employee_id: 'EMP002',
    employee_name: 'Priya Sharma',
    employee_code: 'EMP002',
    payroll_run_id: 'PR001',
    pay_month: 'January',
    pay_year: 2024,
    gross_amount: 65000,
    deductions: 11500,
    net_amount: 53500,
    payment_method: 'upi',
    payment_date: '2024-01-31',
    transaction_id: 'UPI20240131002',
    status: 'completed'
  },
  {
    id: 'PAY003',
    employee_id: 'EMP003',
    employee_name: 'Amit Patel',
    employee_code: 'EMP003',
    payroll_run_id: 'PR002',
    pay_month: 'February',
    pay_year: 2024,
    gross_amount: 72000,
    deductions: 12800,
    net_amount: 59200,
    payment_method: 'bank_transfer',
    payment_date: '2024-02-29',
    transaction_id: 'TXN20240229001',
    status: 'completed',
    bank_name: 'ICICI Bank',
    account_number: '****1234'
  },
  {
    id: 'PAY004',
    employee_id: 'EMP004',
    employee_name: 'Sneha Verma',
    employee_code: 'EMP004',
    payroll_run_id: 'PR002',
    pay_month: 'February',
    pay_year: 2024,
    gross_amount: 58000,
    deductions: 10200,
    net_amount: 47800,
    payment_method: 'bank_transfer',
    payment_date: '2024-02-29',
    transaction_id: '',
    status: 'processing',
    bank_name: 'SBI',
    account_number: '****9876'
  },
  {
    id: 'PAY005',
    employee_id: 'EMP001',
    employee_name: 'Rajesh Kumar',
    employee_code: 'EMP001',
    payroll_run_id: 'PR003',
    pay_month: 'December',
    pay_year: 2023,
    gross_amount: 80000,
    deductions: 14000,
    net_amount: 66000,
    payment_method: 'bank_transfer',
    payment_date: '2023-12-31',
    transaction_id: 'TXN20231231001',
    status: 'completed',
    bank_name: 'HDFC Bank',
    account_number: '****5678'
  }
];

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [dateRange, setDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  const [tempDateRange, setTempDateRange] = useState({
    start_date: '',
    end_date: ''
  });

  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setPayments(mockPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDateRange = () => {
    setDateRange(tempDateRange);
    setShowDateRangeModal(false);
  };

  const handleClearDateRange = () => {
    setDateRange({ start_date: '', end_date: '' });
    setTempDateRange({ start_date: '', end_date: '' });
    setShowDateRangeModal(false);
  };

  const handleExport = () => {
    alert(`Exporting payment report as ${exportFormat.toUpperCase()}...`);
    setShowExportModal(false);
  };

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = (payment: Payment) => {
    alert(`Downloading payment receipt for ${payment.employee_name}...`);
  };

  const stats = {
    totalPayments: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.net_amount, 0)
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: any = {
      bank_transfer: 'Bank Transfer',
      upi: 'UPI',
      cash: 'Cash',
      cheque: 'Cheque'
    };
    return labels[method] || method;
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;

    let matchesDateRange = true;
    if (dateRange.start_date && dateRange.end_date) {
      const paymentDate = new Date(payment.payment_date);
      const startDate = new Date(dateRange.start_date);
      const endDate = new Date(dateRange.end_date);
      matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Payment History</h1>
          <p className="text-slate-600 mt-1">Track all salary payment transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => {
            setTempDateRange(dateRange);
            setShowDateRangeModal(true);
          }}>
            <Calendar className="h-4 w-4 mr-2" />
            {dateRange.start_date && dateRange.end_date ? 'Date Range Active' : 'Date Range'}
          </Button>
          <Button variant="secondary" onClick={() => setShowExportModal(true)}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {dateRange.start_date && dateRange.end_date && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <p className="text-sm text-blue-700">
            Showing payments from {new Date(dateRange.start_date).toLocaleDateString()} to {new Date(dateRange.end_date).toLocaleDateString()}
          </p>
          <button onClick={handleClearDateRange} className="text-blue-700 hover:text-blue-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Payments</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{filteredPayments.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

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
              <p className="text-sm text-slate-600">Total Disbursed</p>
              <p className="text-xl font-bold text-slate-900 mt-2">
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
                  placeholder="Search by employee, code or transaction ID..."
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
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading payment history...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payment Records</h3>
            <p className="text-slate-600 mb-1">There are no payment transactions matching your filters.</p>
            <p className="text-sm text-slate-500">
              Try adjusting your search criteria or date range.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Period</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Gross Amount</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Deductions</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Net Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Method</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Payment Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{payment.employee_name}</p>
                        <p className="text-xs text-slate-600">{payment.employee_code}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{payment.pay_month} {payment.pay_year}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-slate-700">₹{payment.gross_amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-red-600">-₹{payment.deductions.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-green-600">₹{payment.net_amount.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{getMethodLabel(payment.payment_method)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{new Date(payment.payment_date).toLocaleDateString()}</p>
                      {payment.transaction_id && (
                        <p className="text-xs text-slate-500 font-mono">{payment.transaction_id}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(payment)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {payment.status === 'completed' && (
                          <Button size="sm" variant="secondary" onClick={() => handleDownloadReceipt(payment)}>
                            <FileText className="h-3 w-3 mr-1" />
                            Receipt
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

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Select Date Range</h2>
              <button onClick={() => setShowDateRangeModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                <Input
                  type="date"
                  value={tempDateRange.start_date}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, start_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                <Input
                  type="date"
                  value={tempDateRange.end_date}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, end_date: e.target.value })}
                  min={tempDateRange.start_date}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  Select a date range to filter payment records.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={handleClearDateRange}>
                Clear
              </Button>
              <Button onClick={handleApplyDateRange}>
                Apply Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Export Payment Report</h2>
              <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Export Format</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value as 'pdf')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-slate-900">PDF Document</p>
                      <p className="text-xs text-slate-600">Download as PDF file</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value as 'excel')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-slate-900">Excel Spreadsheet</p>
                      <p className="text-xs text-slate-600">Download as .xlsx file</p>
                    </div>
                  </label>

                  <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value as 'csv')}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-slate-900">CSV File</p>
                      <p className="text-xs text-slate-600">Download as .csv file</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                <p className="text-xs text-slate-600">
                  Export will include {filteredPayments.length} payment records matching your current filters.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowExportModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
              <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee</p>
                  <p className="font-medium text-slate-900">{selectedPayment.employee_name}</p>
                  <p className="text-xs text-slate-600">{selectedPayment.employee_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Payment Period</p>
                  <p className="font-medium text-slate-900">{selectedPayment.pay_month} {selectedPayment.pay_year}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Payment Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gross Amount</span>
                    <span className="font-medium text-slate-900">₹{selectedPayment.gross_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Deductions</span>
                    <span className="font-medium text-red-600">-₹{selectedPayment.deductions.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-900">Net Amount</span>
                      <span className="font-bold text-green-600 text-lg">₹{selectedPayment.net_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-4">
                <h3 className="font-semibold text-slate-900 mb-3">Payment Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Payment Method</p>
                    <Badge variant="secondary">{getMethodLabel(selectedPayment.payment_method)}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <Badge variant={getStatusColor(selectedPayment.status)}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Payment Date</p>
                    <p className="font-medium text-slate-900">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
                  </div>
                  {selectedPayment.transaction_id && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Transaction ID</p>
                      <p className="font-mono text-sm text-slate-900">{selectedPayment.transaction_id}</p>
                    </div>
                  )}
                </div>

                {selectedPayment.bank_name && (
                  <div className="mt-4">
                    <p className="text-sm text-slate-600 mb-1">Bank Details</p>
                    <p className="font-medium text-slate-900">{selectedPayment.bank_name}</p>
                    <p className="text-sm text-slate-600">Account: {selectedPayment.account_number}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              {selectedPayment.status === 'completed' && (
                <Button variant="secondary" onClick={() => handleDownloadReceipt(selectedPayment)}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download Receipt
                </Button>
              )}
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
