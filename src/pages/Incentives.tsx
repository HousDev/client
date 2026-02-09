// import { useState, useEffect } from 'react';
// import { Plus, Search, Filter, Download, Award, TrendingUp, Users, DollarSign, Upload, X, CheckCircle, XCircle } from 'lucide-react';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Badge from '../components/ui/Badge';

// interface Incentive {
//   id: string;
//   employee_id: string;
//   employee_name: string;
//   employee_code: string;
//   employee_ctc: number;
//   incentive_type: string;
//   amount: number;
//   month: string;
//   year: number;
//   description: string;
//   status: 'pending' | 'approved' | 'paid';
//   created_at: string;
//   approved_by?: string;
//   approved_date?: string;
// }

// const mockEmployees = [
//   { id: 'EMP001', name: 'Rajesh Kumar', code: 'EMP001', ctc: 800000 },
//   { id: 'EMP002', name: 'Priya Sharma', code: 'EMP002', ctc: 650000 },
//   { id: 'EMP003', name: 'Amit Patel', code: 'EMP003', ctc: 720000 },
//   { id: 'EMP004', name: 'Sneha Verma', code: 'EMP004', ctc: 580000 },
// ];

// const mockIncentives: Incentive[] = [
//   {
//     id: '1',
//     employee_id: 'EMP001',
//     employee_name: 'Rajesh Kumar',
//     employee_code: 'EMP001',
//     employee_ctc: 800000,
//     incentive_type: 'Performance Bonus',
//     amount: 50000,
//     month: 'January',
//     year: 2024,
//     description: 'Q4 2023 outstanding performance in sales targets',
//     status: 'approved',
//     created_at: '2024-01-05',
//     approved_by: 'Manager',
//     approved_date: '2024-01-10'
//   },
//   {
//     id: '2',
//     employee_id: 'EMP002',
//     employee_name: 'Priya Sharma',
//     employee_code: 'EMP002',
//     employee_ctc: 650000,
//     incentive_type: 'Project Completion',
//     amount: 35000,
//     month: 'January',
//     year: 2024,
//     description: 'Successful delivery of Project Phoenix',
//     status: 'pending',
//     created_at: '2024-01-15'
//   },
//   {
//     id: '3',
//     employee_id: 'EMP003',
//     employee_name: 'Amit Patel',
//     employee_code: 'EMP003',
//     employee_ctc: 720000,
//     incentive_type: 'Quarterly Incentive',
//     amount: 40000,
//     month: 'December',
//     year: 2023,
//     description: 'Q4 quarterly performance incentive',
//     status: 'paid',
//     created_at: '2023-12-28',
//     approved_by: 'Manager',
//     approved_date: '2024-01-02'
//   },
//   {
//     id: '4',
//     employee_id: 'EMP004',
//     employee_name: 'Sneha Verma',
//     employee_code: 'EMP004',
//     employee_ctc: 580000,
//     incentive_type: 'Referral Bonus',
//     amount: 25000,
//     month: 'January',
//     year: 2024,
//     description: 'Successful referral - 3 candidates hired',
//     status: 'pending',
//     created_at: '2024-01-20'
//   }
// ];

// export default function Incentives() {
//   const [incentives, setIncentives] = useState<Incentive[]>(mockIncentives);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [typeFilter, setTypeFilter] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showDetailsModal, setShowDetailsModal] = useState(false);
//   const [showImportModal, setShowImportModal] = useState(false);
//   const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);

//   const [formData, setFormData] = useState({
//     employee_id: '',
//     incentive_type: 'Performance Bonus',
//     amount: '',
//     month: new Date().toLocaleString('default', { month: 'long' }),
//     year: new Date().getFullYear(),
//     description: ''
//   });

//   useEffect(() => {
//     loadIncentives();
//   }, []);

//   const loadIncentives = async () => {
//     setLoading(true);
//     try {
//       await new Promise(resolve => setTimeout(resolve, 500));
//       setIncentives(mockIncentives);
//     } catch (error) {
//       console.error('Error loading incentives:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddIncentive = () => {
//     const selectedEmployee = mockEmployees.find(e => e.id === formData.employee_id);
//     if (!selectedEmployee || !formData.amount || parseFloat(formData.amount) <= 0) {
//       alert('Please fill all required fields with valid values');
//       return;
//     }

//     const newIncentive: Incentive = {
//       id: `INC${Date.now()}`,
//       employee_id: selectedEmployee.id,
//       employee_name: selectedEmployee.name,
//       employee_code: selectedEmployee.code,
//       employee_ctc: selectedEmployee.ctc,
//       incentive_type: formData.incentive_type,
//       amount: parseFloat(formData.amount),
//       month: formData.month,
//       year: formData.year,
//       description: formData.description,
//       status: 'pending',
//       created_at: new Date().toISOString()
//     };

//     setIncentives([newIncentive, ...incentives]);
//     setShowAddModal(false);
//     setFormData({
//       employee_id: '',
//       incentive_type: 'Performance Bonus',
//       amount: '',
//       month: new Date().toLocaleString('default', { month: 'long' }),
//       year: new Date().getFullYear(),
//       description: ''
//     });
//   };

//   const handleApprove = (id: string) => {
//     setIncentives(incentives.map(inc =>
//       inc.id === id
//         ? { ...inc, status: 'approved', approved_by: 'Manager', approved_date: new Date().toISOString() }
//         : inc
//     ));
//   };

//   const handleReject = (id: string) => {
//     if (confirm('Are you sure you want to reject this incentive?')) {
//       setIncentives(incentives.filter(inc => inc.id !== id));
//     }
//   };

//   const handlePay = (id: string) => {
//     setIncentives(incentives.map(inc =>
//       inc.id === id ? { ...inc, status: 'paid' } : inc
//     ));
//   };

//   const handleViewDetails = (incentive: Incentive) => {
//     setSelectedIncentive(incentive);
//     setShowDetailsModal(true);
//   };

//   const stats = {
//     totalIncentives: incentives.length,
//     pending: incentives.filter(i => i.status === 'pending').length,
//     approved: incentives.filter(i => i.status === 'approved').length,
//     totalAmount: incentives.reduce((sum, i) => sum + i.amount, 0)
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return 'success';
//       case 'pending':
//         return 'warning';
//       case 'paid':
//         return 'info';
//       default:
//         return 'secondary';
//     }
//   };

//   const filteredIncentives = incentives.filter(incentive => {
//     const matchesSearch = incentive.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          incentive.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = typeFilter === 'all' || incentive.incentive_type === typeFilter;
//     return matchesSearch && matchesType;
//   });

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
        
//         <div className="flex gap-2">
//           <Button variant="secondary" onClick={() => setShowImportModal(true)}>
//             <Upload className="h-4 w-4 mr-2" />
//             Import CSV
//           </Button>
//           <Button onClick={() => setShowAddModal(true)}>
//             <Plus className="h-4 w-4 mr-2" />
//             Add Incentive
//           </Button>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Total Incentives</p>
//               <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalIncentives}</p>
//             </div>
//             <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//               <Award className="h-6 w-6 text-blue-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Pending Approval</p>
//               <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
//             </div>
//             <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
//               <TrendingUp className="h-6 w-6 text-yellow-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Approved</p>
//               <p className="text-3xl font-bold text-green-600 mt-2">{stats.approved}</p>
//             </div>
//             <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
//               <Award className="h-6 w-6 text-green-600" />
//             </div>
//           </div>
//         </Card>

//         <Card className="p-6">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-slate-600">Total Amount</p>
//               <p className="text-2xl font-bold text-slate-900 mt-2">
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
//                   placeholder="Search by employee name or code..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-9 text-sm h-9"
//                 />
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <select
//                 value={typeFilter}
//                 onChange={(e) => setTypeFilter(e.target.value)}
//                 className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="all">All Types</option>
//                 <option value="performance">Performance Bonus</option>
//                 <option value="quarterly">Quarterly Incentive</option>
//                 <option value="annual">Annual Bonus</option>
//                 <option value="project">Project Completion</option>
//                 <option value="referral">Referral Bonus</option>
//               </select>
//               <Button variant="secondary" className="text-sm h-9">
//                 <Filter className="h-4 w-4 mr-1.5" />
//                 Filter
//               </Button>
//               <Button variant="secondary" className="text-sm h-9">
//                 <Download className="h-4 w-4 mr-1.5" />
//                 Export
//               </Button>
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="p-6 text-center text-slate-600">Loading incentives...</div>
//         ) : filteredIncentives.length === 0 ? (
//           <div className="p-12 text-center">
//             <Award className="h-12 w-12 text-slate-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-slate-900 mb-2">No Incentives</h3>
//             <p className="text-slate-600 mb-1">There are no incentives or bonuses to display.</p>
//             <p className="text-sm text-slate-500">
//               Click "Add Incentive" to create one.
//             </p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-slate-50 border-b border-slate-200">
//                 <tr>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Type</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Amount</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Period</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Description</th>
//                   <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
//                   <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-100">
//                 {filteredIncentives.map((incentive) => (
//                   <tr key={incentive.id} className="hover:bg-slate-50 transition-colors">
//                     <td className="px-4 py-3">
//                       <div>
//                         <p className="text-sm font-medium text-slate-900">{incentive.employee_name}</p>
//                         <p className="text-xs text-slate-600">{incentive.employee_code}</p>
//                       </div>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant="info">{incentive.incentive_type}</Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="text-sm font-medium text-green-600">₹{incentive.amount.toLocaleString()}</p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="text-sm text-slate-700">{incentive.month} {incentive.year}</p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <p className="text-sm text-slate-700">{incentive.description}</p>
//                     </td>
//                     <td className="px-4 py-3">
//                       <Badge variant={getStatusColor(incentive.status)}>
//                         {incentive.status}
//                       </Badge>
//                     </td>
//                     <td className="px-4 py-3">
//                       <div className="flex items-center justify-end gap-2">
//                         {incentive.status === 'pending' && (
//                           <>
//                             <Button size="sm" onClick={() => handleApprove(incentive.id)}>
//                               <CheckCircle className="h-3.5 w-3.5 mr-1" />
//                               Approve
//                             </Button>
//                             <Button size="sm" variant="danger" onClick={() => handleReject(incentive.id)}>
//                               <XCircle className="h-3.5 w-3.5 mr-1" />
//                               Reject
//                             </Button>
//                           </>
//                         )}
//                         {incentive.status === 'approved' && (
//                           <Button size="sm" onClick={() => handlePay(incentive.id)}>
//                             Pay Now
//                           </Button>
//                         )}
//                         <Button size="sm" variant="secondary" onClick={() => handleViewDetails(incentive)}>
//                           View
//                         </Button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {showAddModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
//               <h2 className="text-lg font-semibold text-slate-900">Add Incentive</h2>
//               <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Select Employee *
//                 </label>
//                 <select
//                   value={formData.employee_id}
//                   onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="">Choose an employee</option>
//                   {mockEmployees.map(emp => (
//                     <option key={emp.id} value={emp.id}>
//                       {emp.name} ({emp.code}) - CTC: ₹{emp.ctc.toLocaleString()}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Incentive Type *
//                 </label>
//                 <select
//                   value={formData.incentive_type}
//                   onChange={(e) => setFormData({ ...formData, incentive_type: e.target.value })}
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 >
//                   <option value="Performance Bonus">Performance Bonus</option>
//                   <option value="Quarterly Incentive">Quarterly Incentive</option>
//                   <option value="Annual Bonus">Annual Bonus</option>
//                   <option value="Project Completion">Project Completion</option>
//                   <option value="Referral Bonus">Referral Bonus</option>
//                   <option value="Attendance Bonus">Attendance Bonus</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Month *
//                   </label>
//                   <select
//                     value={formData.month}
//                     onChange={(e) => setFormData({ ...formData, month: e.target.value })}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
//                       <option key={month} value={month}>{month}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Year *
//                   </label>
//                   <select
//                     value={formData.year}
//                     onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="2024">2024</option>
//                     <option value="2025">2025</option>
//                   </select>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Amount (₹) *
//                 </label>
//                 <Input
//                   type="number"
//                   value={formData.amount}
//                   onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                   placeholder="Enter amount"
//                   min="0"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Description *
//                 </label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   rows={3}
//                   placeholder="Reason for incentive/bonus"
//                 />
//               </div>

//               <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
//                 <p className="text-xs text-blue-700">
//                   The incentive will be created with pending status and require approval before payment.
//                 </p>
//               </div>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
//               <Button variant="secondary" onClick={() => setShowAddModal(false)}>
//                 Cancel
//               </Button>
//               <Button onClick={handleAddIncentive}>
//                 Create Incentive
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showDetailsModal && selectedIncentive && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Incentive Details</h2>
//               <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Employee</p>
//                   <p className="font-medium text-slate-900">{selectedIncentive.employee_name}</p>
//                   <p className="text-xs text-slate-600">{selectedIncentive.employee_code}</p>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Employee CTC</p>
//                   <p className="font-medium text-slate-900">₹{selectedIncentive.employee_ctc.toLocaleString()}</p>
//                   <p className="text-xs text-slate-600">Annual</p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Incentive Type</p>
//                   <Badge variant="info">{selectedIncentive.incentive_type}</Badge>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Period</p>
//                   <p className="font-medium text-slate-900">{selectedIncentive.month} {selectedIncentive.year}</p>
//                 </div>
//               </div>

//               <div>
//                 <p className="text-sm text-slate-600 mb-1">Amount</p>
//                 <p className="text-2xl font-bold text-green-600">₹{selectedIncentive.amount.toLocaleString()}</p>
//               </div>

//               <div>
//                 <p className="text-sm text-slate-600 mb-1">Description</p>
//                 <p className="text-slate-900">{selectedIncentive.description}</p>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Status</p>
//                   <Badge variant={getStatusColor(selectedIncentive.status)}>
//                     {selectedIncentive.status}
//                   </Badge>
//                 </div>
//                 <div>
//                   <p className="text-sm text-slate-600 mb-1">Created Date</p>
//                   <p className="text-slate-900">{new Date(selectedIncentive.created_at).toLocaleDateString()}</p>
//                 </div>
//               </div>

//               {selectedIncentive.approved_by && (
//                 <div className="border-t border-slate-200 pt-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <p className="text-sm text-slate-600 mb-1">Approved By</p>
//                       <p className="font-medium text-slate-900">{selectedIncentive.approved_by}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm text-slate-600 mb-1">Approved Date</p>
//                       <p className="text-slate-900">
//                         {selectedIncentive.approved_date && new Date(selectedIncentive.approved_date).toLocaleDateString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
//                 Close
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {showImportModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
//             <div className="border-b border-slate-200 p-6 flex items-center justify-between">
//               <h2 className="text-lg font-semibold text-slate-900">Import Incentives from CSV</h2>
//               <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <div className="p-6 space-y-4">
//               <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
//                 <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
//                 <p className="text-slate-900 font-medium mb-1">Click to upload or drag and drop</p>
//                 <p className="text-sm text-slate-600">CSV file up to 10MB</p>
//                 <input type="file" accept=".csv" className="hidden" />
//               </div>

//               <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
//                 <p className="text-sm font-medium text-slate-900 mb-2">CSV Format Requirements:</p>
//                 <ul className="text-xs text-slate-600 space-y-1">
//                   <li>• Column 1: Employee Code</li>
//                   <li>• Column 2: Incentive Type</li>
//                   <li>• Column 3: Amount</li>
//                   <li>• Column 4: Month</li>
//                   <li>• Column 5: Year</li>
//                   <li>• Column 6: Description</li>
//                 </ul>
//               </div>

//               <Button variant="secondary" className="w-full">
//                 <Download className="h-4 w-4 mr-2" />
//                 Download Sample CSV Template
//               </Button>
//             </div>

//             <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
//               <Button variant="secondary" onClick={() => setShowImportModal(false)}>
//                 Cancel
//               </Button>
//               <Button>
//                 Upload & Import
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Award, TrendingUp, Users, DollarSign, Upload, X, CheckCircle, XCircle, MoreVertical, Eye, Trash2, Calendar, ChevronDown, AlertCircle, ChevronRight, FileText, Settings, Save } from 'lucide-react';
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
  },
   {
    id: '5',
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
    id: '6',
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
    id: '7',
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
    id: '8',
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedIncentive, setSelectedIncentive] = useState<Incentive | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);

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

  const handleDeleteIncentive = (id: string) => {
    if (window.confirm('Are you sure you want to delete this incentive?')) {
      setIncentives(incentives.filter(inc => inc.id !== id));
    }
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredIncentives.map(inc => inc.id));
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
    setSelectAll(newSelected.size === filteredIncentives.length);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setMonthFilter('');
    setYearFilter('');
  };

  const resetFilters = () => {
    clearFilters();
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
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
    const matchesSearch = searchTerm === '' || 
      incentive.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incentive.employee_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || incentive.incentive_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || incentive.status === statusFilter;
    const matchesMonth = monthFilter === '' || incentive.month === monthFilter;
    const matchesYear = yearFilter === '' || incentive.year.toString() === yearFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesMonth && matchesYear;
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-5">
      {/* Header with Action Buttons - Sticky */}
     <div className="sticky top-20 z-20  px-2 py-2 -mt-2 -mb-2">

  {/* MOBILE VIEW */}
  <div className="flex lg:hidden items-center justify-between gap-1 flex-nowrap overflow-x-auto">

    {selectedItems.size > 0 && (
      <div className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded px-2 py-1 whitespace-nowrap shrink-0">
        <div className="bg-blue-100 p-1 rounded">
          <Award className="w-3 h-3 text-blue-600" />
        </div>

        <p className="font-medium text-[10px] text-gray-800">
          {selectedItems.size}
        </p>

        <button
          onClick={() => {
            if (window.confirm(`Delete ${selectedItems.size} incentive(s)?`)) {
              setIncentives(incentives.filter(inc => !selectedItems.has(inc.id)));
              setSelectedItems(new Set());
              setSelectAll(false);
            }
          }}
          className="bg-red-600 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Del
        </button>
      </div>
    )}

    <div className="flex items-center gap-1 shrink-0">
      <Button
        variant="secondary"
        onClick={() => setShowImportModal(true)}
        className="text-[10px] px-2 py-1 h-7"
      >
        <Upload className="h-3 w-3 mr-1" />
        Import
      </Button>

      <Button
        onClick={() => setShowAddModal(true)}
        className="text-[10px] px-2 py-1 h-7 bg-gradient-to-r from-[#C62828] to-red-600"
      >
        <Plus className="h-3 w-3 mr-1" />
        Add
      </Button>
    </div>
  </div>

  {/* DESKTOP VIEW — SAME AS YOUR ORIGINAL */}
  <div className="hidden lg:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">

    <div className="flex flex-wrap items-center gap-2">
      {selectedItems.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2 w-full sm:w-auto">

          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1 rounded">
              <Award className="w-3 h-3 text-blue-600" />
            </div>
            <p className="font-medium text-xs text-gray-800">
              {selectedItems.size} selected
            </p>
          </div>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete ${selectedItems.size} incentive(s)?`)) {
                setIncentives(incentives.filter(inc => !selectedItems.has(inc.id)));
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
    </div>

    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
      <Button
        variant="secondary"
        onClick={() => setShowImportModal(true)}
        className="text-sm w-full sm:w-auto"
      >
        <Upload className="h-4 w-4 mr-1.5" />
        Import CSV
      </Button>

      <Button
        onClick={() => setShowAddModal(true)}
        className="text-sm w-full sm:w-auto bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
      >
        <Plus className="h-4 w-4 mr-1.5" />
        Add Incentive
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
                Total Incentives
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.totalIncentives}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Award className="h-4 w-4 text-blue-600" />
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
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Approved
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.approved}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <Award className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Amount
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

      {/* Main Table - Responsive with sticky header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-260px)]">
          <table className="w-full min-w-[1000px]">
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
                    Type
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Period
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Type Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="Performance Bonus">Performance Bonus</option>
                    <option value="Quarterly Incentive">Quarterly Incentive</option>
                    <option value="Project Completion">Project Completion</option>
                    <option value="Referral Bonus">Referral Bonus</option>
                  </select>
                </td>

                {/* Amount Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Month Filter */}
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

                {/* Description Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Status Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>

                {/* Actions Column - Clear Button */}
               {/* Actions Column - Filter & Clear Buttons */}
<td className="px-3 md:px-4 py-1 text-center">
  <div className="flex items-center justify-center gap-1">
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
                    <p className="text-gray-600 text-sm mt-2">Loading incentives...</p>
                  </td>
                </tr>
              ) : filteredIncentives.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <Award className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">No Incentives Found</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchTerm || typeFilter !== 'all' ? "Try a different search term" : "No incentives available"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredIncentives.map((incentive) => {
                  const isSelected = selectedItems.has(incentive.id);
                  return (
                    <tr key={incentive.id} className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}>
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(incentive.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">{incentive.employee_name}</p>
                          <p className="text-[10px] md:text-xs text-gray-500">{incentive.employee_code}</p>
                        </div>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <Badge variant="info" className="text-xs">
                          {incentive.incentive_type}
                        </Badge>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-green-600">
                          ₹{incentive.amount.toLocaleString()}
                        </p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {incentive.month} {incentive.year}
                        </p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700 truncate max-w-[200px]">
                          {incentive.description}
                        </p>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3">
                        <Badge variant={getStatusColor(incentive.status)} className="text-xs">
                          {incentive.status}
                        </Badge>
                      </td>
                      
                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === incentive.id ? null : incentive.id)}
                          className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                        </button>

                        {openMenuId === incentive.id && (
                          <div className="absolute right-4 top-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li>
                                <button
                                  onClick={() => {
                                    handleViewDetails(incentive);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </li>

                              {incentive.status === 'pending' && (
                                <>
                                  <li>
                                    <button
                                      onClick={() => {
                                        handleApprove(incentive.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-green-50 text-green-600 text-left"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                      Approve
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => {
                                        handleReject(incentive.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                    >
                                      <XCircle className="w-4 h-4" />
                                      Reject
                                    </button>
                                  </li>
                                </>
                              )}

                              {incentive.status === 'approved' && (
                                <li>
                                  <button
                                    onClick={() => {
                                      handlePay(incentive.id);
                                      setOpenMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-blue-50 text-blue-600 text-left"
                                  >
                                    <DollarSign className="w-4 h-4" />
                                    Pay Now
                                  </button>
                                </li>
                              )}

                              <hr className="my-1" />

                              <li>
                                <button
                                  onClick={() => {
                                    handleDeleteIncentive(incentive.id);
                                    setOpenMenuId(null);
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
              Filter Incentives
            </h2>
            <p className="text-xs md:text-sm text-white/80">
              Apply filters to find specific incentives
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
              Incentive Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 md:px-4 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value="Performance Bonus">Performance Bonus</option>
              <option value="Quarterly Incentive">Quarterly Incentive</option>
              <option value="Project Completion">Project Completion</option>
              <option value="Referral Bonus">Referral Bonus</option>
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
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
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
        </div>

        {/* Filter Summary */}
        {(typeFilter !== 'all' || statusFilter !== 'all' || monthFilter !== '' || yearFilter !== '') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs md:text-sm font-medium text-gray-800">
              Active Filters
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {typeFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Type: {typeFilter}
                </span>
              )}
              {statusFilter !== 'all' && (
                <span className="text-[10px] md:text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  Status: {statusFilter}
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

      {/* ALL MODALS WITH NEW STYLING */}

      {/* Add Incentive Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Add Incentive
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Create a new incentive for an employee
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form onSubmit={(e) => { e.preventDefault(); handleAddIncentive(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C62828]" />
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.employee_id}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                    >
                      <option value="">Choose an employee...</option>
                      {mockEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.code}) - CTC: ₹{emp.ctc.toLocaleString()}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#C62828]" />
                    Incentive Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Award className="w-4 h-4" />
                    </div>
                    <select
                      value={formData.incentive_type}
                      onChange={(e) => setFormData({ ...formData, incentive_type: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                    >
                      <option value="Performance Bonus">Performance Bonus</option>
                      <option value="Quarterly Incentive">Quarterly Incentive</option>
                      <option value="Annual Bonus">Annual Bonus</option>
                      <option value="Project Completion">Project Completion</option>
                      <option value="Referral Bonus">Referral Bonus</option>
                      <option value="Attendance Bonus">Attendance Bonus</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C62828]" />
                      Month <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.month}
                        onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                      >
                        {months.map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#C62828]" />
                      Year <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <select
                        value={formData.year}
                        onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                      >
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#C62828]" />
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="Enter amount"
                      min="0"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      rows={3}
                      placeholder="Reason for incentive/bonus"
                    />
                  </div>
                </div>

                {/* Important Notes */}
                <div className="border-2 border-yellow-200 rounded-xl overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      </div>
                      Important Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          The incentive will be created with pending status and require approval before payment
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Approved incentives can be marked as paid once payment is processed
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          You can edit incentive details before approval
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddIncentive}
                disabled={!formData.employee_id || !formData.amount || parseFloat(formData.amount) <= 0 || !formData.description}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Create Incentive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedIncentive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowDetailsModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Incentive Details
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    View complete incentive information
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
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
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex justify-end">
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

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="fixed inset-0 bg-black/60" onClick={() => setShowImportModal(false)} />
          
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Import Incentives from CSV
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Upload a CSV file to import incentives
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-900 font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-slate-600">CSV file up to 10MB</p>
                  <input type="file" accept=".csv" className="hidden" />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
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

                <button className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900 flex items-center justify-center gap-2">
                  <Download className="w-5 h-5" />
                  Download Sample CSV Template
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload & Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}