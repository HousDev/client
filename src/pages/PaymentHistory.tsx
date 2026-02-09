// import { useState, useEffect } from 'react';
// import { Search, Filter, Download, DollarSign, Calendar, CheckCircle, Clock, X, Eye, FileText } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';

// interface Payment {
//   id: string;
//   employee_id: string;
//   employee_name: string;
//   employee_code: string;
//   payroll_run_id: string;
//   pay_month: string;
//   pay_year: number;
//   gross_amount: number;
//   deductions: number;
//   net_amount: number;
//   payment_method: 'bank_transfer' | 'upi' | 'cash' | 'cheque';
//   payment_date: string;
//   transaction_id?: string;
//   status: 'pending' | 'processing' | 'completed' | 'failed';
//   bank_name?: string;
//   account_number?: string;
// }

// const mockPayments: Payment[] = [
//   {
//     id: 'PAY001',
//     employee_id: 'EMP001',
//     employee_name: 'Rajesh Kumar',
//     employee_code: 'EMP001',
//     payroll_run_id: 'PR001',
//     pay_month: 'January',
//     pay_year: 2024,
//     gross_amount: 80000,
//     deductions: 14000,
//     net_amount: 66000,
//     payment_method: 'bank_transfer',
//     payment_date: '2024-01-31',
//     transaction_id: 'TXN20240131001',
//     status: 'completed',
//     bank_name: 'HDFC Bank',
//     account_number: '****5678'
//   },
//   {
//     id: 'PAY002',
//     employee_id: 'EMP002',
//     employee_name: 'Priya Sharma',
//     employee_code: 'EMP002',
//     payroll_run_id: 'PR001',
//     pay_month: 'January',
//     pay_year: 2024,
//     gross_amount: 65000,
//     deductions: 11500,
//     net_amount: 53500,
//     payment_method: 'upi',
//     payment_date: '2024-01-31',
//     transaction_id: 'UPI20240131002',
//     status: 'completed'
//   },
//   {
//     id: 'PAY003',
//     employee_id: 'EMP003',
//     employee_name: 'Amit Patel',
//     employee_code: 'EMP003',
//     payroll_run_id: 'PR002',
//     pay_month: 'February',
//     pay_year: 2024,
//     gross_amount: 72000,
//     deductions: 12800,
//     net_amount: 59200,
//     payment_method: 'bank_transfer',
//     payment_date: '2024-02-29',
//     transaction_id: 'TXN20240229001',
//     status: 'completed',
//     bank_name: 'ICICI Bank',
//     account_number: '****1234'
//   },
//   {
//     id: 'PAY004',
//     employee_id: 'EMP004',
//     employee_name: 'Sneha Verma',
//     employee_code: 'EMP004',
//     payroll_run_id: 'PR002',
//     pay_month: 'February',
//     pay_year: 2024,
//     gross_amount: 58000,
//     deductions: 10200,
//     net_amount: 47800,
//     payment_method: 'bank_transfer',
//     payment_date: '2024-02-29',
//     transaction_id: '',
//     status: 'processing',
//     bank_name: 'SBI',
//     account_number: '****9876'
//   },
//   {
//     id: 'PAY005',
//     employee_id: 'EMP001',
//     employee_name: 'Rajesh Kumar',
//     employee_code: 'EMP001',
//     payroll_run_id: 'PR003',
//     pay_month: 'December',
//     pay_year: 2023,
//     gross_amount: 80000,
//     deductions: 14000,
//     net_amount: 66000,
//     payment_method: 'bank_transfer',
//     payment_date: '2023-12-31',
//     transaction_id: 'TXN20231231001',
//     status: 'completed',
//     bank_name: 'HDFC Bank',
//     account_number: '****5678'
//   }
// ];

// export default function PaymentHistory() {
//   const [payments, setPayments] = useState<Payment[]>(mockPayments);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [methodFilter, setMethodFilter] = useState('all');

//   const [showDateRangeModal, setShowDateRangeModal] = useState(false);
//   const [showExportModal, setShowExportModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

//   const [dateRange, setDateRange] = useState({
//     start_date: '',
//     end_date: ''
//   });

//   const [tempDateRange, setTempDateRange] = useState({
//     start_date: '',
//     end_date: ''
//   });

//   const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

//   useEffect(() => {
//     loadPayments();
//   }, []);

//   const loadPayments = async () => {
//     setLoading(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       setPayments(mockPayments);
//     } catch (error) {
//       console.error('Error loading payments:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleApplyDateRange = () => {
//     setDateRange(tempDateRange);
//     setShowDateRangeModal(false);
//   };

//   const handleClearDateRange = () => {
//     setDateRange({ start_date: '', end_date: '' });
//     setTempDateRange({ start_date: '', end_date: '' });
//     setShowDateRangeModal(false);
//   };

//   const handleExport = () => {
//     alert(`Exporting payment report as ${exportFormat.toUpperCase()}...`);
//     setShowExportModal(false);
//   };

//   const handleViewDetails = (payment: Payment) => {
//     setSelectedPayment(payment);
//     setShowDetailsModal(true);
//   };

//   const handleDownloadReceipt = (payment: Payment) => {
//     alert(`Downloading payment receipt for ${payment.employee_name}...`);
//   };

//   const stats = {
//     totalPayments: payments.length,
//     completed: payments.filter(p => p.status === 'completed').length,
//     pending: payments.filter(p => p.status === 'pending').length,
//     totalAmount: payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.net_amount, 0)
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed':
//         return 'success';
//       case 'processing':
//         return 'info';
//       case 'pending':
//         return 'warning';
//       case 'failed':
//         return 'danger';
//       default:
//         return 'secondary';
//     }
//   };

//   const getMethodLabel = (method: string) => {
//     const labels: any = {
//       bank_transfer: 'Bank Transfer',
//       upi: 'UPI',
//       cash: 'Cash',
//       cheque: 'Cheque'
//     };
//     return labels[method] || method;
//   };

//   const filteredPayments = payments.filter(payment => {
//     const matchesSearch = payment.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          payment.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
//     const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;

//     let matchesDateRange = true;
//     if (dateRange.start_date && dateRange.end_date) {
//       const paymentDate = new Date(payment.payment_date);
//       const startDate = new Date(dateRange.start_date);
//       const endDate = new Date(dateRange.end_date);
//       matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
//     }

//     return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
       
//         <div className="flex gap-2">
//           <Button variant="secondary" onClick={() => {
//             setTempDateRange(dateRange);
//             setShowDateRangeModal(true);
//           }}>
//             <Calendar className="h-4 w-4 mr-2" />
//             {dateRange.start_date && dateRange.end_date ? 'Date Range Active' : 'Date Range'}
//           </Button>
//           <Button variant="secondary" onClick={() => setShowExportModal(true)}>
//             <Download className="h-4 w-4 mr-2" />
//             Export Report
//           </Button>
//         </div>
//       </div>

//       {dateRange.start_date && dateRange.end_date && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
//           <p className="text-sm text-blue-700">
//             Showing payments from {new Date(dateRange.start_date).toLocaleDateString()} to {new Date(dateRange.end_date).toLocaleDateString()}
//           </p>
//           <button onClick={handleClearDateRange} className="text-blue-700 hover:text-blue-900">
//             <X className="h-4 w-4" />
//           </button>
//         </div>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Total Payments</p>
//               <p className="text-3xl font-bold text-slate-900 mt-2">{filteredPayments.length}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Completed</p>
//               <p className="text-3xl font-bold text-green-600 mt-2">{stats.completed}</p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <CheckCircle className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Pending</p>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//             </div>
//             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <Clock className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Total Disbursed</p>
//               <p className="text-xl font-bold text-slate-900 mt-2">
//                 ₹{(stats.totalAmount / 100000).toFixed(1)}L
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-slate-600" />
//             </div>
//           </div>
//         </Card>
//       </div>

//       <Card>
//         <div className="p-4 border-b border-slate-200">
//           <div className="flex items-center justify-between gap-3">
//             <div className="flex-1 max-w-md">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                 <Input
//                   type="text"
//                   placeholder="Search by employee, code or transaction ID..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-9 text-sm h-9"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Status</option>
//                 <option value="completed">Completed</option>
//                 <option value="processing">Processing</option>
//                 <option value="pending">Pending</option>
//                 <option value="failed">Failed</option>
//               </select>
//               <select
//                 value={methodFilter}
//                 onChange={(e) => setMethodFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Methods</option>
//                 <option value="bank_transfer">Bank Transfer</option>
//                 <option value="upi">UPI</option>
//                 <option value="cash">Cash</option>
//                 <option value="cheque">Cheque</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-6 text-center text-slate-600">Loading payment history...</div>
//         ) : filteredPayments.length === 0 ? (
//           <div className="p-12 text-center">
//             <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-slate-900 mb-2">No Payment Records</h3>
//             <p className="text-slate-600 mb-1">There are no payment transactions matching your filters.</p>
//             <p className="text-sm text-slate-500">
//               Try adjusting your search criteria or date range.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Period</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Gross Amount</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Deductions</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Net Amount</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Method</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Payment Date</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filteredPayments.map((payment) => (
//                   <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="text-sm font-medium text-slate-900">{payment.employee_name}</p>
//                         <p className="text-xs text-slate-600">{payment.employee_code}</p>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="text-sm text-slate-700">{payment.pay_month} {payment.pay_year}</p>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm text-slate-700">₹{payment.gross_amount.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm text-red-600">-₹{payment.deductions.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm font-medium text-green-600">₹{payment.net_amount.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant="secondary">{getMethodLabel(payment.payment_method)}</Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="text-sm text-slate-700">{new Date(payment.payment_date).toLocaleDateString()}</p>
//                       {payment.transaction_id && (
//                         <p className="text-xs text-slate-500 font-mono">{payment.transaction_id}</p>
//                       )}
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant={getStatusColor(payment.status)}>
//                         {payment.status}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button size="sm" variant="secondary" onClick={() => handleViewDetails(payment)}>
//                           <Eye className="h-3 w-3 mr-1" />
//                           View
//                         </Button>
//                         {payment.status === 'completed' && (
//                           <Button size="sm" variant="secondary" onClick={() => handleDownloadReceipt(payment)}>
//                             <FileText className="h-3 w-3 mr-1" />
//                             Receipt
//                           </Button>
//                         )}
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {/* Date Range Modal */}
//       {showDateRangeModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Select Date Range</h2>
//               <button onClick={() => setShowDateRangeModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
//                 <Input
//                   type="date"
//                   value={tempDateRange.start_date}
//                   onChange={(e) => setTempDateRange({ ...tempDateRange, start_date: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
//                 <Input
//                   type="date"
//                   value={tempDateRange.end_date}
//                   onChange={(e) => setTempDateRange({ ...tempDateRange, end_date: e.target.value })}
//                   min={tempDateRange.start_date}
//                 />
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                 <p className="text-xs text-blue-700">
//                   Select a date range to filter payment records.
//                 </p>
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               <Button variant="secondary" onClick={handleClearDateRange}>
//                 Clear
//               </Button>
//               <Button onClick={handleApplyDateRange}>
//                 Apply Filter
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Export Report Modal */}
//       {showExportModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Export Payment Report</h2>
//               <button onClick={() => setShowExportModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-3">Select Export Format</label>
//                 <div className="space-y-2">
//                   <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
//                     <input
//                       type="radio"
//                       name="format"
//                       value="pdf"
//                       checked={exportFormat === 'pdf'}
//                       onChange={(e) => setExportFormat(e.target.value as 'pdf')}
//                       className="mr-3"
//                     />
//                     <div>
//                       <p className="font-medium text-slate-900">PDF Document</p>
//                       <p className="text-xs text-slate-600">Download as PDF file</p>
//                     </div>
//                   </label>

//                   <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
//                     <input
//                       type="radio"
//                       name="format"
//                       value="excel"
//                       checked={exportFormat === 'excel'}
//                       onChange={(e) => setExportFormat(e.target.value as 'excel')}
//                       className="mr-3"
//                     />
//                     <div>
//                       <p className="font-medium text-slate-900">Excel Spreadsheet</p>
//                       <p className="text-xs text-slate-600">Download as .xlsx file</p>
//                     </div>
//                   </label>

//                   <label className="flex items-center p-3 border border-slate-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50">
//                     <input
//                       type="radio"
//                       name="format"
//                       value="csv"
//                       checked={exportFormat === 'csv'}
//                       onChange={(e) => setExportFormat(e.target.value as 'csv')}
//                       className="mr-3"
//                     />
//                     <div>
//                       <p className="font-medium text-slate-900">CSV File</p>
//                       <p className="text-xs text-slate-600">Download as .csv file</p>
//                     </div>
//                   </label>
//                 </div>
//               </div>

//               <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
//                 <p className="text-xs text-slate-600">
//                   Export will include {filteredPayments.length} payment records matching your current filters.
//                 </p>
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               <Button variant="secondary" onClick={() => setShowExportModal(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleExport}>
//                 <Download className="h-4 w-4 mr-2" />
//                 Export
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* View Details Modal */}
//       {showDetailsModal && selectedPayment && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Payment Details</h2>
//               <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Employee</p>
//                   <p className="font-medium text-slate-900">{selectedPayment.employee_name}</p>
//                   <p className="text-xs text-slate-600">{selectedPayment.employee_code}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Payment Period</p>
//                   <p className="font-medium text-slate-900">{selectedPayment.pay_month} {selectedPayment.pay_year}</p>
//                 </div>
//               </div>

//               <div className="border-t border-slate-200 pt-4">
//                 <h3 className="font-semibold text-slate-900 mb-3">Payment Breakdown</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Gross Amount</span>
//                     <span className="font-medium text-slate-900">₹{selectedPayment.gross_amount.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Total Deductions</span>
//                     <span className="font-medium text-red-600">-₹{selectedPayment.deductions.toLocaleString()}</span>
//                   </div>
//                   <div className="border-t border-slate-200 pt-2 mt-2">
//                     <div className="flex justify-between">
//                       <span className="font-semibold text-slate-900">Net Amount</span>
//                       <span className="font-bold text-green-600 text-lg">₹{selectedPayment.net_amount.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t border-slate-200 pt-4">
//                 <h3 className="font-semibold text-slate-900 mb-3">Payment Information</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">Payment Method</p>
//                     <Badge variant="secondary">{getMethodLabel(selectedPayment.payment_method)}</Badge>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">Status</p>
//                     <Badge variant={getStatusColor(selectedPayment.status)}>
//                       {selectedPayment.status}
//                     </Badge>
//                   </div>
//                 </div>

//                 <div className="mt-4 grid grid-cols-2 gap-4">
//                   <div>
//                     <p className="text-sm text-slate-600 mb-1">Payment Date</p>
//                     <p className="font-medium text-slate-900">{new Date(selectedPayment.payment_date).toLocaleDateString()}</p>
//                   </div>
//                   {selectedPayment.transaction_id && (
//                     <div>
//                       <p className="text-sm text-slate-600 mb-1">Transaction ID</p>
//                       <p className="font-mono text-sm text-slate-900">{selectedPayment.transaction_id}</p>
//                     </div>
//                   )}
//                 </div>

//                 {selectedPayment.bank_name && (
//                   <div className="mt-4">
//                     <p className="text-sm text-slate-600 mb-1">Bank Details</p>
//                     <p className="font-medium text-slate-900">{selectedPayment.bank_name}</p>
//                     <p className="text-sm text-slate-600">Account: {selectedPayment.account_number}</p>
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               {selectedPayment.status === 'completed' && (
//                 <Button variant="secondary" onClick={() => handleDownloadReceipt(selectedPayment)}>
//                   <FileText className="h-4 w-4 mr-2" />
//                   Download Receipt
//                 </Button>
//               )}
//               <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import { Search, Filter, Download, DollarSign, Calendar, CheckCircle, Clock, X, Eye, FileText, MoreVertical, Trash2, Users, ChevronDown, AlertCircle } from 'lucide-react';
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
  
  // Search states for each column
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchTxnId, setSearchTxnId] = useState('');
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const [showDateRangeModal, setShowDateRangeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredPayments.map(p => p.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredPayments.length);
  };

  const clearFilters = () => {
    setSearchEmployee('');
    setSearchTxnId('');
    setStatusFilter('all');
    setMethodFilter('all');
    setMonthFilter('');
    setYearFilter('');
    setDateRange({ start_date: '', end_date: '' });
    setTempDateRange({ start_date: '', end_date: '' });
  };

  const resetFilters = () => {
    clearFilters();
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
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
    const matchesEmployee = searchEmployee === '' ||
      payment.employee_name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      payment.employee_code.toLowerCase().includes(searchEmployee.toLowerCase());
    
    const matchesTxnId = searchTxnId === '' ||
      payment.transaction_id?.toLowerCase().includes(searchTxnId.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.payment_method === methodFilter;
    const matchesMonth = monthFilter === '' || payment.pay_month === monthFilter;
    const matchesYear = yearFilter === '' || payment.pay_year.toString() === yearFilter;

    let matchesDateRange = true;
    if (dateRange.start_date && dateRange.end_date) {
      const paymentDate = new Date(payment.payment_date);
      const startDate = new Date(dateRange.start_date);
      const endDate = new Date(dateRange.end_date);
      matchesDateRange = paymentDate >= startDate && paymentDate <= endDate;
    }

    return matchesEmployee && matchesTxnId && matchesStatus && matchesMethod && matchesMonth && matchesYear && matchesDateRange;
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-5">
      {/* Header with Action Buttons - Sticky */}
      <div className="sticky top-20 z-20 px-2 py-2 -mt-2 -mb-2">
        {/* Single Row Layout - Mobile & Desktop */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Bulk Actions Card - Left Side */}
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1 rounded">
                  <DollarSign className="w-3 h-3 text-blue-600" />
                </div>
                <p className="font-medium text-xs text-gray-800">
                  {selectedItems.size} selected
                </p>
              </div>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${selectedItems.size} payment(s)?`)) {
                    setPayments(payments.filter(p => !selectedItems.has(p.id)));
                    setSelectedItems(new Set());
                    setSelectAll(false);
                  }
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
              >
                <Trash2 className="w-3 h-3 inline mr-1" />
                Delete
              </button>
            </div>
          )}

          {/* Action Buttons - Right Side */}
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              onClick={() => {
                setTempDateRange(dateRange);
                setShowDateRangeModal(true);
              }}
              className="text-xs px-2 sm:px-3 py-1.5 h-auto"
            >
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              <span className="hidden sm:inline">Date Range</span>
              <span className="sm:hidden">Date</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(true)}
              className="text-xs px-2 sm:px-3 py-1.5 h-auto bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Sticky & Compact */}
      <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Payments
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {filteredPayments.length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Completed
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.completed}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                {stats.pending}
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
                Total Disbursed
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                ₹{(stats.totalAmount / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-slate-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Date Range Info Banner */}
      {dateRange.start_date && dateRange.end_date && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <p className="text-xs sm:text-sm text-blue-700">
            Showing payments from {new Date(dateRange.start_date).toLocaleDateString()} to {new Date(dateRange.end_date).toLocaleDateString()}
          </p>
          <button onClick={handleClearDateRange} className="text-blue-700 hover:text-blue-900">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Table - Responsive with sticky header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-260px)]">
          <table className="w-full min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-16">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Period
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Gross Amount
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Deductions
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Net Amount
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Method
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Date
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Select Column */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Employee Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchEmployee}
                    onChange={(e) => setSearchEmployee(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Period - Month Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Months</option>
                    {months.map((month) => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </td>

                {/* Gross Amount - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Deductions - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Net Amount - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Method Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Methods</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </td>

                {/* Payment Date - Transaction ID Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Txn ID..."
                    value={searchTxnId}
                    onChange={(e) => setSearchTxnId(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Status Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </td>

                {/* Actions Column - Filter & Clear Buttons */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Advanced Filters"
                    >
                      <Filter className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                      Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Clear All Filters"
                    >
                      <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                      Clear
                    </button>
                  </div>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-3 md:px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading payments...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 md:px-4 py-8 text-center">
                    <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">No Payment Records Found</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchEmployee || searchTxnId || statusFilter !== 'all' || methodFilter !== 'all' || monthFilter !== '' || yearFilter !== '' ? "Try a different search term" : "No payments available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isSelected = selectedItems.has(payment.id);
                  return (
                    <tr key={payment.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(payment.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">{payment.employee_name}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">{payment.employee_code}</p>
                        </div>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {payment.pay_month} {payment.pay_year}
                        </p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3 text-right">
                        <p className="text-xs md:text-sm text-gray-700">₹{payment.gross_amount.toLocaleString()}</p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3 text-right">
                        <p className="text-xs md:text-sm text-red-600">-₹{payment.deductions.toLocaleString()}</p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3 text-right">
                        <p className="text-xs md:text-sm font-medium text-green-600">₹{payment.net_amount.toLocaleString()}</p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <Badge variant="secondary" className="text-xs">
                          {getMethodLabel(payment.payment_method)}
                        </Badge>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                        {payment.transaction_id && (
                          <p className="text-[10px] md:text-xs text-gray-500 font-mono truncate max-w-[120px]">
                            {payment.transaction_id}
                          </p>
                        )}
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <Badge variant={getStatusColor(payment.status)} className="text-xs">
                          {payment.status}
                        </Badge>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => handleViewDetails(payment)}
                            className="text-xs px-2 py-1"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === payment.id ? null : payment.id)}
                            className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                          >
                            <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                          </button>

                          {openMenuId === payment.id && (
                            <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <ul className="py-1 text-sm text-gray-700">
                                <li>
                                  <button
                                    onClick={() => {
                                      handleViewDetails(payment);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                  >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </button>
                                </li>

                                {payment.status === 'completed' && (
                                  <li>
                                    <button
                                      onClick={() => {
                                        handleDownloadReceipt(payment);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-600 text-left"
                                    >
                                      <FileText className="w-4 h-4" />
                                      Download Receipt
                                    </button>
                                  </li>
                                )}

                                <hr className="my-1" />

                                <li>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('Are you sure you want to delete this payment record?')) {
                                        setPayments(payments.filter(p => p.id !== payment.id));
                                        setOpenMenuId(null);
                                      }
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Sidebar */}
    {showFilterSidebar && (
  <div className="fixed inset-0 z-[9999] overflow-hidden">
    <div
      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={() => setShowFilterSidebar(false)}
    />

    <div
      className={`
        fixed top-0 right-0 bottom-0
        bg-white shadow-2xl flex flex-col
        transition-transform duration-300 ease-out
        ${showFilterSidebar ? "translate-x-0" : "translate-x-full"}
        w-[90vw] max-w-none
        md:max-w-md md:w-full
      `}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C62828] to-[#D32F2F] px-4 md:px-6 py-3 md:py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Filter className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm md:text-xl font-bold text-white">
              Filter Payments
            </h2>
            <p className="text-xs md:text-sm text-white/80">
              Apply filters to find specific payments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={resetFilters}
            className="text-white text-xs md:text-sm hover:bg-white hover:bg-opacity-20 px-2 md:px-3 py-1 md:py-1.5 rounded transition font-medium"
          >
            Reset
          </button>
          <button
            onClick={() => setShowFilterSidebar(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 md:p-1.5 transition"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="all">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="upi">UPI</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Month
            </label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="">All Months</option>
              {months.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          {/* Date Range Section */}
          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Custom Date Range
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={tempDateRange.start_date}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, start_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={tempDateRange.end_date}
                  onChange={(e) => setTempDateRange({ ...tempDateRange, end_date: e.target.value })}
                  min={tempDateRange.start_date}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDateRange(tempDateRange);
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-[#C62828] text-white rounded-lg hover:bg-red-700"
                >
                  Apply Range
                </button>
                {dateRange.start_date && dateRange.end_date && (
                  <button
                    onClick={handleClearDateRange}
                    className="flex-1 px-3 py-2 text-xs border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    Clear Range
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        {(statusFilter !== 'all' || methodFilter !== 'all' || monthFilter !== '' || yearFilter !== '' || (dateRange.start_date && dateRange.end_date)) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs md:text-sm font-medium text-gray-800">
              Active Filters
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {statusFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Status: {statusFilter}
                </span>
              )}
              {methodFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Method: {getMethodLabel(methodFilter)}
                </span>
              )}
              {monthFilter !== '' && (
                <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Month: {monthFilter}
                </span>
              )}
              {yearFilter !== '' && (
                <span className="text-[10px] md:text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Year: {yearFilter}
                </span>
              )}
              {dateRange.start_date && dateRange.end_date && (
                <span className="text-[10px] md:text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  Date Range: {new Date(dateRange.start_date).toLocaleDateString()} - {new Date(dateRange.end_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 md:p-4 flex gap-2 md:gap-3 flex-shrink-0">
        <button
          onClick={resetFilters}
          className="flex-1 px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          Reset All
        </button>
        <button
          onClick={applyFilters}
          className="flex-1 bg-gradient-to-r from-[#C62828] to-[#D32F2F] text-white px-3 md:px-4 py-2 text-xs md:text-sm rounded-lg hover:shadow-lg font-medium"
        >
          Apply Filters
        </button>
      </div>
    </div>
  </div>
)}

      {/* Date Range Modal */}
      {showDateRangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowDateRangeModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-md border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Select Date Range</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Filter payments by date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDateRangeModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-5 h-5" />
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
              <button
                onClick={handleClearDateRange}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Clear
              </button>
              <button
                onClick={handleApplyDateRange}
                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowExportModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-md border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Export Payment Report</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Choose export format
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Export Format</label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-[#C62828] hover:bg-red-50 transition-all">
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

                  <label className="flex items-center p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-[#C62828] hover:bg-red-50 transition-all">
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

                  <label className="flex items-center p-3 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-[#C62828] hover:bg-red-50 transition-all">
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
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowDetailsModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Payment Details</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Complete payment information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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
                <button
                  onClick={() => handleDownloadReceipt(selectedPayment)}
                  className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Download Receipt
                </button>
              )}
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}