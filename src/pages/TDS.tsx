// import { useState, useEffect } from 'react';
// import { Search, Filter, Download, FileText, DollarSign, Users, Calendar, X, Eye, CheckCircle } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';

// interface TDSRecord {
//   id: string;
//   employee_id: string;
//   employee_name: string;
//   employee_code: string;
//   pan_number: string;
//   financial_year: string;
//   quarter: string;
//   gross_salary: number;
//   taxable_income: number;
//   tds_deducted: number;
//   tds_deposited: number;
//   challan_number?: string;
//   deposit_date?: string;
//   status: 'pending' | 'deposited' | 'filed';
// }

// const mockRecords: TDSRecord[] = [
//   {
//     id: 'TDS001',
//     employee_id: 'EMP001',
//     employee_name: 'Rajesh Kumar',
//     employee_code: 'EMP001',
//     pan_number: 'ABCDE1234F',
//     financial_year: '2024-25',
//     quarter: 'Q3',
//     gross_salary: 240000,
//     taxable_income: 210000,
//     tds_deducted: 28000,
//     tds_deposited: 28000,
//     challan_number: 'CHL2024Q3001',
//     deposit_date: '2024-01-07',
//     status: 'filed'
//   },
//   {
//     id: 'TDS002',
//     employee_id: 'EMP002',
//     employee_name: 'Priya Sharma',
//     employee_code: 'EMP002',
//     pan_number: 'XYZPQ5678M',
//     financial_year: '2024-25',
//     quarter: 'Q3',
//     gross_salary: 195000,
//     taxable_income: 170000,
//     tds_deducted: 18000,
//     tds_deposited: 18000,
//     challan_number: 'CHL2024Q3002',
//     deposit_date: '2024-01-07',
//     status: 'deposited'
//   },
//   {
//     id: 'TDS003',
//     employee_id: 'EMP003',
//     employee_name: 'Amit Patel',
//     employee_code: 'EMP003',
//     pan_number: 'LMNOP9012K',
//     financial_year: '2024-25',
//     quarter: 'Q3',
//     gross_salary: 285000,
//     taxable_income: 250000,
//     tds_deducted: 38000,
//     tds_deposited: 0,
//     status: 'pending'
//   },
//   {
//     id: 'TDS004',
//     employee_id: 'EMP004',
//     employee_name: 'Sneha Verma',
//     employee_code: 'EMP004',
//     pan_number: 'QRSTU3456H',
//     financial_year: '2024-25',
//     quarter: 'Q3',
//     gross_salary: 210000,
//     taxable_income: 185000,
//     tds_deducted: 22000,
//     tds_deposited: 0,
//     status: 'pending'
//   },
//   {
//     id: 'TDS005',
//     employee_id: 'EMP005',
//     employee_name: 'Vikram Singh',
//     employee_code: 'EMP005',
//     pan_number: 'VWXYZ7890N',
//     financial_year: '2024-25',
//     quarter: 'Q3',
//     gross_salary: 216000,
//     taxable_income: 190000,
//     tds_deducted: 24000,
//     tds_deposited: 24000,
//     challan_number: 'CHL2024Q3003',
//     deposit_date: '2024-01-07',
//     status: 'filed'
//   },
//   {
//     id: 'TDS006',
//     employee_id: 'EMP001',
//     employee_name: 'Rajesh Kumar',
//     employee_code: 'EMP001',
//     pan_number: 'ABCDE1234F',
//     financial_year: '2024-25',
//     quarter: 'Q4',
//     gross_salary: 240000,
//     taxable_income: 210000,
//     tds_deducted: 29000,
//     tds_deposited: 0,
//     status: 'pending'
//   }
// ];

// export default function TDS() {
//   const [tdsRecords, setTdsRecords] = useState<TDSRecord[]>(mockRecords);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [quarterFilter, setQuarterFilter] = useState('all');
//   const [yearFilter, setYearFilter] = useState('2024-25');
//   const [statusFilter, setStatusFilter] = useState('all');

//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showDepositModal, setShowDepositModal] = useState(false);
//   const [selectedRecord, setSelectedRecord] = useState<TDSRecord | null>(null);

//   const [depositForm, setDepositForm] = useState({
//     challan_number: '',
//     deposit_date: new Date().toISOString().split('T')[0],
//     bank_name: '',
//     branch: ''
//   });

//   useEffect(() => {
//     loadTDSRecords();
//   }, []);

//   const loadTDSRecords = async () => {
//     setLoading(true);
//     await new Promise(resolve => setTimeout(resolve, 500));
//     setLoading(false);
//   };

//   const handleViewDetails = (record: TDSRecord) => {
//     setSelectedRecord(record);
//     setShowDetailsModal(true);
//   };

//   const handleMarkDeposited = (record: TDSRecord) => {
//     setSelectedRecord(record);
//     setDepositForm({
//       challan_number: '',
//       deposit_date: new Date().toISOString().split('T')[0],
//       bank_name: '',
//       branch: ''
//     });
//     setShowDepositModal(true);
//   };

//   const handleSubmitDeposit = () => {
//     if (!selectedRecord) return;

//     if (!depositForm.challan_number || !depositForm.deposit_date) {
//       alert('Please fill all required fields');
//       return;
//     }

//     setTdsRecords(records =>
//       records.map(r =>
//         r.id === selectedRecord.id
//           ? {
//               ...r,
//               status: 'deposited',
//               tds_deposited: r.tds_deducted,
//               challan_number: depositForm.challan_number,
//               deposit_date: depositForm.deposit_date
//             }
//           : r
//       )
//     );

//     setShowDepositModal(false);
//     setSelectedRecord(null);
//     alert('TDS deposit marked successfully!');
//   };

//   const handleMarkFiled = (recordId: string) => {
//     setTdsRecords(records =>
//       records.map(r =>
//         r.id === recordId ? { ...r, status: 'filed' } : r
//       )
//     );
//     alert('TDS return filed successfully!');
//   };

//   const handleGenerateForm16 = (record: TDSRecord) => {
//     alert(`Generating Form 16 for ${record.employee_name}...`);
//   };

//   const handleDownloadReturn = () => {
//     const quarter = quarterFilter === 'all' ? 'All_Quarters' : quarterFilter;
//     alert(`Downloading TDS return for FY ${yearFilter} ${quarter}...`);
//   };

//   const stats = {
//     totalEmployees: new Set(tdsRecords.filter(r => r.financial_year === yearFilter).map(r => r.employee_id)).size,
//     totalDeducted: tdsRecords.filter(r => r.financial_year === yearFilter).reduce((sum, r) => sum + r.tds_deducted, 0),
//     totalDeposited: tdsRecords.filter(r => r.financial_year === yearFilter).reduce((sum, r) => sum + r.tds_deposited, 0),
//     pendingDeposit: tdsRecords.filter(r => r.financial_year === yearFilter && r.status === 'pending').length
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'filed':
//         return 'success';
//       case 'deposited':
//         return 'info';
//       case 'pending':
//         return 'warning';
//       default:
//         return 'secondary';
//     }
//   };

//   const filteredRecords = tdsRecords.filter(record => {
//     const matchesSearch = record.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          record.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          record.pan_number.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesQuarter = quarterFilter === 'all' || record.quarter === quarterFilter;
//     const matchesYear = record.financial_year === yearFilter;
//     const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
//     return matchesSearch && matchesQuarter && matchesYear && matchesStatus;
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
        
//         <div className="flex gap-2">
//           <Button variant="secondary">
//             <FileText className="h-4 w-4 mr-2" />
//             Generate Form 16
//           </Button>
//           <Button onClick={handleDownloadReturn}>
//             <Download className="h-4 w-4 mr-2" />
//             Download TDS Return
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Total Employees</p>
//               <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalEmployees}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Users className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">TDS Deducted</p>
//               <p className="text-2xl font-bold text-yellow-600 mt-2">
//                 ₹{(stats.totalDeducted / 100000).toFixed(1)}L
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">TDS Deposited</p>
//               <p className="text-2xl font-bold text-green-600 mt-2">
//                 ₹{(stats.totalDeposited / 100000).toFixed(1)}L
//               </p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <DollarSign className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Pending Deposit</p>
//               <p className="text-3xl font-bold text-red-600 mt-2">{stats.pendingDeposit}</p>
//             </div>
//             <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
//               <Calendar className="h-6 w-6 text-red-600" />
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
//                   placeholder="Search by employee, code or PAN..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-9 text-sm h-9"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <select
//                 value={yearFilter}
//                 onChange={(e) => setYearFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="2025-26">FY 2025-26</option>
//                 <option value="2024-25">FY 2024-25</option>
//                 <option value="2023-24">FY 2023-24</option>
//               </select>
//               <select
//                 value={quarterFilter}
//                 onChange={(e) => setQuarterFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Quarters</option>
//                 <option value="Q1">Q1 (Apr-Jun)</option>
//                 <option value="Q2">Q2 (Jul-Sep)</option>
//                 <option value="Q3">Q3 (Oct-Dec)</option>
//                 <option value="Q4">Q4 (Jan-Mar)</option>
//               </select>
//               <select
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Status</option>
//                 <option value="pending">Pending</option>
//                 <option value="deposited">Deposited</option>
//                 <option value="filed">Filed</option>
//               </select>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-6 text-center text-slate-600">Loading TDS records...</div>
//         ) : filteredRecords.length === 0 ? (
//           <div className="p-12 text-center">
//             <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-slate-900 mb-2">No TDS Records</h3>
//             <p className="text-slate-600 mb-1">There are no TDS records for the selected period.</p>
//             <p className="text-sm text-slate-500">
//               TDS is automatically calculated during payroll processing.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">PAN</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Quarter</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Gross Salary</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Taxable Income</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">TDS Deducted</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filteredRecords.map((record) => (
//                   <tr key={record.id} className="hover:bg-slate-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="text-sm font-medium text-slate-900">{record.employee_name}</p>
//                         <p className="text-xs text-slate-600">{record.employee_code}</p>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
//                         {record.pan_number}
//                       </span>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant="info">{record.quarter}</Badge>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm text-slate-700">₹{record.gross_salary.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm text-slate-700">₹{record.taxable_income.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3 text-right">
//                       <p className="text-sm font-medium text-yellow-600">₹{record.tds_deducted.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant={getStatusColor(record.status)}>
//                         {record.status}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-2">
//                         <Button size="sm" variant="secondary" onClick={() => handleViewDetails(record)}>
//                           <Eye className="h-3 w-3 mr-1" />
//                           View
//                         </Button>
//                         {record.status === 'pending' && (
//                           <Button size="sm" onClick={() => handleMarkDeposited(record)}>
//                             Mark Deposited
//                           </Button>
//                         )}
//                         {record.status === 'deposited' && (
//                           <Button size="sm" variant="secondary" onClick={() => handleMarkFiled(record.id)}>
//                             <CheckCircle className="h-3 w-3 mr-1" />
//                             Mark Filed
//                           </Button>
//                         )}
//                         {record.status === 'filed' && (
//                           <Button size="sm" variant="secondary" onClick={() => handleGenerateForm16(record)}>
//                             <FileText className="h-3 w-3 mr-1" />
//                             Form 16
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

//       {/* View Details Modal */}
//       {showDetailsModal && selectedRecord && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">TDS Details</h2>
//               <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Employee</p>
//                   <p className="font-medium text-slate-900">{selectedRecord.employee_name}</p>
//                   <p className="text-xs text-slate-600">{selectedRecord.employee_code}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">PAN Number</p>
//                   <p className="font-mono text-sm font-medium text-slate-900">{selectedRecord.pan_number}</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Financial Year</p>
//                   <p className="font-medium text-slate-900">FY {selectedRecord.financial_year}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Quarter</p>
//                   <Badge variant="info">{selectedRecord.quarter}</Badge>
//                 </div>
//               </div>

//               <div className="border-t border-slate-200 pt-4">
//                 <h3 className="font-semibold text-slate-900 mb-3">Tax Calculation</h3>
//                 <div className="space-y-2">
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Gross Salary (Quarterly)</span>
//                     <span className="font-medium text-slate-900">₹{selectedRecord.gross_salary.toLocaleString()}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span className="text-slate-600">Taxable Income</span>
//                     <span className="font-medium text-slate-900">₹{selectedRecord.taxable_income.toLocaleString()}</span>
//                   </div>
//                   <div className="border-t border-slate-200 pt-2 mt-2">
//                     <div className="flex justify-between">
//                       <span className="font-semibold text-slate-900">TDS Deducted</span>
//                       <span className="font-bold text-yellow-600 text-lg">₹{selectedRecord.tds_deducted.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {selectedRecord.status !== 'pending' && (
//                 <div className="border-t border-slate-200 pt-4">
//                   <h3 className="font-semibold text-slate-900 mb-3">Deposit Information</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-slate-600 mb-1">Challan Number</p>
//                       <p className="font-mono text-sm font-medium text-slate-900">{selectedRecord.challan_number}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-slate-600 mb-1">Deposit Date</p>
//                       <p className="font-medium text-slate-900">
//                         {selectedRecord.deposit_date && new Date(selectedRecord.deposit_date).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="mt-3">
//                     <p className="text-sm text-slate-600 mb-1">TDS Deposited</p>
//                     <p className="font-bold text-green-600 text-lg">₹{selectedRecord.tds_deposited.toLocaleString()}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               {selectedRecord.status === 'filed' && (
//                 <Button variant="secondary" onClick={() => handleGenerateForm16(selectedRecord)}>
//                   <FileText className="h-4 w-4 mr-2" />
//                   Generate Form 16
//                 </Button>
//               )}
//               <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Mark Deposited Modal */}
//       {showDepositModal && selectedRecord && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Mark TDS as Deposited</h2>
//               <button onClick={() => setShowDepositModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
//                 <p className="text-sm text-blue-700">
//                   <strong>{selectedRecord.employee_name}</strong> - {selectedRecord.quarter} FY {selectedRecord.financial_year}
//                   <br />TDS Amount: <strong>₹{selectedRecord.tds_deducted.toLocaleString()}</strong>
//                 </p>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Challan Number *</label>
//                 <Input
//                   value={depositForm.challan_number}
//                   onChange={(e) => setDepositForm({ ...depositForm, challan_number: e.target.value })}
//                   placeholder="Enter challan number"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Deposit Date *</label>
//                 <Input
//                   type="date"
//                   value={depositForm.deposit_date}
//                   onChange={(e) => setDepositForm({ ...depositForm, deposit_date: e.target.value })}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Bank Name</label>
//                 <Input
//                   value={depositForm.bank_name}
//                   onChange={(e) => setDepositForm({ ...depositForm, bank_name: e.target.value })}
//                   placeholder="Enter bank name (optional)"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">Branch</label>
//                 <Input
//                   value={depositForm.branch}
//                   onChange={(e) => setDepositForm({ ...depositForm, branch: e.target.value })}
//                   placeholder="Enter branch name (optional)"
//                 />
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               <Button variant="secondary" onClick={() => setShowDepositModal(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleSubmitDeposit}>
//                 <CheckCircle className="h-4 w-4 mr-2" />
//                 Mark as Deposited
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, Download, FileText, DollarSign, Users, Calendar, X, Eye, CheckCircle, AlertCircle, ChevronDown } from 'lucide-react';
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
  
  // Search states
  const [searchEmployee, setSearchEmployee] = useState('');
  const [searchPAN, setSearchPAN] = useState('');
  const [searchAmount, setSearchAmount] = useState('');
  
  // Filter states
  const [quarterFilter, setQuarterFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('2024-25');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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

  const clearFilters = () => {
    setSearchEmployee('');
    setSearchPAN('');
    setSearchAmount('');
    setQuarterFilter('all');
    setYearFilter('2024-25');
    setStatusFilter('all');
  };

  const resetFilters = () => {
    clearFilters();
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
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
    const matchesEmployee = searchEmployee === '' ||
      record.employee_name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      record.employee_code.toLowerCase().includes(searchEmployee.toLowerCase());
    
    const matchesPAN = searchPAN === '' ||
      record.pan_number.toLowerCase().includes(searchPAN.toLowerCase());
    
    const matchesAmount = searchAmount === '' ||
      String(record.tds_deducted).includes(searchAmount);
    
    const matchesQuarter = quarterFilter === 'all' || record.quarter === quarterFilter;
    const matchesYear = record.financial_year === yearFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesEmployee && matchesPAN && matchesAmount && matchesQuarter && matchesYear && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header with Action Buttons - Sticky */}
      <div className="sticky top-20 z-20 px-2 py-2 -mt-2 -mb-2">
        {/* MOBILE VIEW */}
        <div className="flex lg:hidden items-center justify-end gap-1 flex-nowrap overflow-x-auto">
          <Button
            variant="secondary"
            onClick={handleDownloadReturn}
            className="text-[10px] px-2 py-1 h-7"
          >
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button
            variant="secondary"
            className="text-[10px] px-2 py-1 h-7"
          >
            <FileText className="h-3 w-3 mr-1" />
            Form 16
          </Button>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-end gap-3">
          <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
            <Button variant="secondary" className="text-sm w-full sm:w-auto">
              <FileText className="h-4 w-4 mr-1.5" />
              Generate Form 16
            </Button>
            <Button onClick={handleDownloadReturn} className="text-sm w-full sm:w-auto bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700">
              <Download className="h-4 w-4 mr-1.5" />
              Download TDS Return
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
                Total Employees
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.totalEmployees}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                TDS Deducted
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                ₹{(stats.totalDeducted / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                TDS Deposited
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                ₹{(stats.totalDeposited / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending Deposit
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-red-600 mt-0.5">
                {stats.pendingDeposit}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-red-100 rounded-md flex items-center justify-center">
              <Calendar className="h-4 w-4 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table - Responsive with sticky header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-260px)]">
          <table className="w-full min-w-[1200px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PAN
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Quarter
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Gross Salary
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Taxable Income
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-right">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    TDS Deducted
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

                {/* PAN Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search PAN..."
                    value={searchPAN}
                    onChange={(e) => setSearchPAN(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Quarter Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={quarterFilter}
                    onChange={(e) => setQuarterFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Quarters</option>
                    <option value="Q1">Q1</option>
                    <option value="Q2">Q2</option>
                    <option value="Q3">Q3</option>
                    <option value="Q4">Q4</option>
                  </select>
                </td>

                {/* Gross Salary - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Taxable Income - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* TDS Amount Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Amount..."
                    value={searchAmount}
                    onChange={(e) => setSearchAmount(e.target.value)}
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
                    <option value="pending">Pending</option>
                    <option value="deposited">Deposited</option>
                    <option value="filed">Filed</option>
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
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">Loading TDS records...</p>
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">No TDS Records</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchEmployee || searchPAN || searchAmount ? "Try a different search term" : "No TDS records available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 md:px-4 py-3">
                      <div>
                        <p className="text-xs md:text-sm font-medium text-gray-800">{record.employee_name}</p>
                        <p className="text-[10px] md:text-xs text-gray-500">{record.employee_code}</p>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span className="text-[10px] md:text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        {record.pan_number}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <Badge variant="info" className="text-xs">{record.quarter}</Badge>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right">
                      <p className="text-xs md:text-sm text-gray-700">₹{record.gross_salary.toLocaleString()}</p>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right">
                      <p className="text-xs md:text-sm text-gray-700">₹{record.taxable_income.toLocaleString()}</p>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-right">
                      <p className="text-xs md:text-sm font-medium text-yellow-600">₹{record.tds_deducted.toLocaleString()}</p>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <Badge variant={getStatusColor(record.status)} className="text-xs">
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="secondary" onClick={() => handleViewDetails(record)} className="text-[10px] md:text-xs px-2 py-1">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {record.status === 'pending' && (
                          <Button size="sm" onClick={() => handleMarkDeposited(record)} className="text-[10px] md:text-xs px-2 py-1">
                            Mark Deposited
                          </Button>
                        )}
                        {record.status === 'deposited' && (
                          <Button size="sm" variant="secondary" onClick={() => handleMarkFiled(record.id)} className="text-[10px] md:text-xs px-2 py-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark Filed
                          </Button>
                        )}
                        {record.status === 'filed' && (
                          <Button size="sm" variant="secondary" onClick={() => handleGenerateForm16(record)} className="text-[10px] md:text-xs px-2 py-1">
                            <FileText className="h-3 w-3 mr-1" />
                            Form 16
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filter Sidebar */}
    {showFilterSidebar && (
  <div className="fixed inset-0 z-[9999] overflow-hidden">
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
      onClick={() => setShowFilterSidebar(false)}
    />

    {/* Sidebar */}
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
              Filter TDS Records
            </h2>
            <p className="text-xs md:text-sm text-white/80">
              Apply filters to find specific records
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
              Financial Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="2025-26">FY 2025-26</option>
              <option value="2024-25">FY 2024-25</option>
              <option value="2023-24">FY 2023-24</option>
            </select>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-semibold text-gray-700 mb-2">
              Quarter
            </label>
            <select
              value={quarterFilter}
              onChange={(e) => setQuarterFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="all">All Quarters</option>
              <option value="Q1">Q1 (Apr-Jun)</option>
              <option value="Q2">Q2 (Jul-Sep)</option>
              <option value="Q3">Q3 (Oct-Dec)</option>
              <option value="Q4">Q4 (Jan-Mar)</option>
            </select>
          </div>

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
              <option value="pending">Pending</option>
              <option value="deposited">Deposited</option>
              <option value="filed">Filed</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        {(quarterFilter !== 'all' || statusFilter !== 'all' || yearFilter !== '2024-25') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs md:text-sm font-medium text-gray-800">
              Active Filters
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {yearFilter !== '2024-25' && (
                <span className="text-[10px] md:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Year: {yearFilter}
                </span>
              )}
              {quarterFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Quarter: {quarterFilter}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Status: {statusFilter}
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

      {/* View Details Modal */}
      {showDetailsModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowDetailsModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">TDS Details</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Complete TDS information
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

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
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

            {/* Footer */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowDepositModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-md border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Mark TDS as Deposited</h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Record deposit information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
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

            {/* Footer */}
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
