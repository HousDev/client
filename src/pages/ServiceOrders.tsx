/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from 'react';
// import {
//   Plus,
//   Wrench,
//   Calendar,
//   Clock,
//   X,
//   Trash2,
//   Edit2,
//   Printer,
//   Share2,
//   Search,
// } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import {
//   getServiceOrders,
//   createServiceOrder,
//   updateServiceOrder,
//   deleteServiceOrder,
//   bulkUpdateStatus,
//   bulkDeleteServiceOrders,
// } from '../lib/serviceOrderApi';

// // dynamic master APIs
// import projectApi from '../lib/projectApi';
// import vendorApi from '../lib/vendorApi';
// import serviceTypeApi from '../lib/serviceTypeApi';

// interface SOFormData {
//   id?: string; // keep id as string for UI selection, backend uses numeric id
//   so_number: string;
//   vendor_id: number | string | null;
//   project_id: number | string | null;
//   service_type_id: number | string | null;
//   service_name: string;
//   description: string;
//   start_date: string;
//   end_date: string;
//   duration_days: number;
//   estimated_cost: number;
//   actual_cost: number;
//   status: string;
//   priority: string;
//   location: string;
//   supervisor_name: string;
//   supervisor_phone: string;
//   notes: string;
//   created_by?: string | null;
//   created_at?: string;
// }

// // ⚠️ Removed static service type seed — always load from master API
// // const seedServiceTypes = () => [];

// export default function ServiceOrders() {
//   const { user } = useAuth();
//   const [serviceOrders, setServiceOrders] = useState<SOFormData[]>([]);
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [projects, setProjects] = useState<any[]>([]);
//   const [serviceTypes, setServiceTypes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [selectedSOs, setSelectedSOs] = useState<Set<string>>(new Set());

//   const [formData, setFormData] = useState<SOFormData>({
//     so_number: '',
//     vendor_id: null,
//     project_id: null,
//     service_type_id: null,
//     service_name: '',
//     description: '',
//     start_date: new Date().toISOString().split('T')[0],
//     end_date: '',
//     duration_days: 0,
//     estimated_cost: 0,
//     actual_cost: 0,
//     status: 'scheduled',
//     priority: 'medium',
//     location: '',
//     supervisor_name: '',
//     supervisor_phone: '',
//     notes: '',
//     created_by: user?.id ?? null,
//     created_at: new Date().toISOString(),
//   });

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       // fetch masters in parallel
//       try {
//         const [vendorRows, projectRows] = await Promise.all([
//           vendorApi.getVendors(),
//           projectApi.getProjects(),
//         ]);
//         setVendors(vendorRows.map((v: any) => ({ id: v.id, name: v.name })));
//         setProjects(projectRows.map((p: any) => ({ id: p.id, name: p.name })));
//       } catch (masterErr) {
//         console.warn('Failed to load vendors/projects from master APIs, falling back to empty lists', masterErr);
//         setVendors([]);
//         setProjects([]);
//       }

//       // get service types from master serviceTypeApi
//       try {
//         const types = await serviceTypeApi.getAll(true);
//         if (Array.isArray(types) && types.length > 0) setServiceTypes(types);
//         else setServiceTypes(seedServiceTypes());
//       } catch (stypeErr) {
//         console.warn('serviceTypeApi.getAll failed, using seeded service types', stypeErr);
//         setServiceTypes(seedServiceTypes());
//       }

//       // fetch service orders
//       const rows: any[] = await getServiceOrders();
//       rows.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));

//       const normalized = rows.map((r: any) => ({
//         ...r,
//         id: String(r.id),
//         vendor_id: r.vendor_id !== undefined && r.vendor_id !== null ? r.vendor_id : null,
//         project_id: r.project_id !== undefined && r.project_id !== null ? r.project_id : null,
//         service_type_id: r.service_type_id !== undefined && r.service_type_id !== null ? r.service_type_id : null,
//       }));

//       setServiceOrders(normalized);
//     } catch (err) {
//       console.error('loadData error', err);
//       setServiceOrders([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // utilities
//   const generateSONumber = () => {
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = String(now.getMonth() + 1).padStart(2, '0');
//     const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
//     return `SO/${year}/${month}/${random}`;
//   };
//   const calculateDuration = (startDate: string, endDate: string) => {
//     if (!startDate || !endDate) return 0;
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end.getTime() - start.getTime());
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   // submit -> create or update via API
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.service_name || formData.vendor_id === null || formData.project_id === null) {
//       alert('Please fill required fields: Service Name, Vendor, Project');
//       return;
//     }

//     const now = new Date().toISOString();
//     const soEntry: SOFormData = {
//       ...formData,
//       so_number: formData.so_number || generateSONumber(),
//       duration_days: calculateDuration(formData.start_date, formData.end_date),
//       created_by: formData.created_by ?? user?.id ?? null,
//       created_at: editingId ? formData.created_at ?? now : now,
//     };

//     try {
//       if (editingId) {
//         const payloadToUpdate: any = { ...soEntry };
//         if (payloadToUpdate.vendor_id !== null && payloadToUpdate.vendor_id !== undefined) {
//           payloadToUpdate.vendor_id = Number(payloadToUpdate.vendor_id);
//         }
//         if (payloadToUpdate.project_id !== null && payloadToUpdate.project_id !== undefined) {
//           payloadToUpdate.project_id = Number(payloadToUpdate.project_id);
//         }
//         if (payloadToUpdate.service_type_id !== null && payloadToUpdate.service_type_id !== undefined && payloadToUpdate.service_type_id !== '') {
//           payloadToUpdate.service_type_id = Number(payloadToUpdate.service_type_id);
//         } else {
//           payloadToUpdate.service_type_id = null;
//         }
//         await updateServiceOrder(editingId, payloadToUpdate);
//       } else {
//         const payloadToCreate: any = { ...soEntry };
//         if (payloadToCreate.id) delete payloadToCreate.id;

//         payloadToCreate.vendor_id = Number(payloadToCreate.vendor_id);
//         payloadToCreate.project_id = Number(payloadToCreate.project_id);
//         payloadToCreate.service_type_id = payloadToCreate.service_type_id ? Number(payloadToCreate.service_type_id) : null;

//         if (!Number.isFinite(payloadToCreate.vendor_id) || !Number.isFinite(payloadToCreate.project_id)) {
//           alert('Vendor and Project must be valid numeric IDs.');
//           return;
//         }

//         await createServiceOrder(payloadToCreate);
//       }

//       await loadData();
//       setShowModal(false);
//       resetForm();
//     } catch (err: any) {
//       alert(err?.message || 'Failed to save service order');
//       console.error('handleSubmit error', err);
//     }
//   };

//   const handleEdit = (so: SOFormData) => {
//     setEditingId(so.id ?? null);
//     setFormData({
//       ...so,
//       vendor_id: so.vendor_id === null || so.vendor_id === undefined ? null : Number(so.vendor_id),
//       project_id: so.project_id === null || so.project_id === undefined ? null : Number(so.project_id),
//       service_type_id: so.service_type_id === null || so.service_type_id === undefined ? null : (so.service_type_id === '' ? null : Number(so.service_type_id)),
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this service order?')) return;
//     try {
//       await deleteServiceOrder(id);
//       await loadData();
//       setSelectedSOs((prev) => {
//         const n = new Set(prev);
//         n.delete(id);
//         return n;
//       });
//     } catch (err) {
//       alert('Delete failed');
//       console.error('handleDelete error', err);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       so_number: '',
//       vendor_id: null,
//       project_id: null,
//       service_type_id: null,
//       service_name: '',
//       description: '',
//       start_date: new Date().toISOString().split('T')[0],
//       end_date: '',
//       duration_days: 0,
//       estimated_cost: 0,
//       actual_cost: 0,
//       status: 'scheduled',
//       priority: 'medium',
//       location: '',
//       supervisor_name: '',
//       supervisor_phone: '',
//       notes: '',
//       created_by: user?.id ?? null,
//       created_at: new Date().toISOString(),
//     });
//     setEditingId(null);
//   };

//   // selection & bulk actions
//   const handleSelectSO = (soId: string) => {
//     const newSelected = new Set(selectedSOs);
//     if (newSelected.has(soId)) newSelected.delete(soId);
//     else newSelected.add(soId);
//     setSelectedSOs(newSelected);
//   };

//   const handleSelectAll = () => {
//     if (selectedSOs.size === filteredSOs.length && filteredSOs.length > 0) {
//       setSelectedSOs(new Set());
//     } else {
//       setSelectedSOs(new Set(filteredSOs.map((so) => so.id!)));
//     }
//   };

//   const handleBulkAction = async (action: string) => {
//     if (selectedSOs.size === 0) {
//       alert('Please select at least one service order');
//       return;
//     }
//     if (!confirm(`Are you sure you want to ${action} ${selectedSOs.size} service order(s)?`)) return;

//     const ids = Array.from(selectedSOs);
//     try {
//       if (action === 'delete') {
//         await bulkDeleteServiceOrders(ids);
//       } else {
//         let status = 'scheduled';
//         if (action === 'start') status = 'in_progress';
//         if (action === 'complete') status = 'completed';
//         if (action === 'cancel') status = 'cancelled';
//         await bulkUpdateStatus(ids, status);
//       }
//       await loadData();
//       setSelectedSOs(new Set());
//     } catch (err) {
//       alert('Bulk action failed');
//       console.error('handleBulkAction error', err);
//     }
//   };

//   const handlePrint = (_so: SOFormData) => window.print();

//   const handleShare = async (so: SOFormData) => {
//     const url = `${window.location.href}#so=${so.id}`;
//     const shareData = {
//       title: `Service Order - ${so.so_number}`,
//       text: `${so.so_number} — ${so.service_name}`,
//       url,
//     };
//     if (navigator.share) {
//       try {
//         await navigator.share(shareData);
//       } catch {
//         /* ignore */
//       }
//     } else {
//       await navigator.clipboard.writeText(url);
//       alert('Link copied to clipboard');
//     }
//   };

//   // filters / formatting
//   const filteredSOs = serviceOrders.filter((so) =>
//     (so.so_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (so.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     ((vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || '')).toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getStatusBadge = (status: string) => {
//     const map: any = {
//       scheduled: 'bg-blue-100 text-blue-700',
//       in_progress: 'bg-yellow-100 text-yellow-700',
//       completed: 'bg-green-100 text-green-700',
//       cancelled: 'bg-red-100 text-red-700',
//       on_hold: 'bg-gray-100 text-gray-700',
//     };
//     return map[status] || 'bg-gray-100 text-gray-700';
//   };

//   const getPriorityBadge = (priority: string) => {
//     const map: any = {
//       low: 'bg-green-100 text-green-700',
//       medium: 'bg-yellow-100 text-yellow-700',
//       high: 'bg-orange-100 text-orange-700',
//       urgent: 'bg-red-100 text-red-700',
//     };
//     return map[priority] || 'bg-gray-100 text-gray-700';
//   };

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading service orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
        
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-5 h-5" />
//           Create Service Order
//         </button>
//       </div>

//       {selectedSOs.size > 0 && (
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
//           <span className="text-blue-800 font-medium">{selectedSOs.size} service order(s) selected</span>
//           <div className="flex gap-2">
//             <button onClick={() => handleBulkAction('start')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Start Selected</button>
//             <button onClick={() => handleBulkAction('complete')} className="bg-green-600 text-white px-4 py-2 rounded-lg">Complete Selected</button>
//             <button onClick={() => handleBulkAction('cancel')} className="bg-orange-600 text-white px-4 py-2 rounded-lg">Cancel Selected</button>
//             <button onClick={() => handleBulkAction('delete')} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete Selected</button>
//           </div>
//         </div>
//       )}

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search by SO number, service name, or vendor..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-4 text-left">
//                   <input
//                     type="checkbox"
//                     checked={selectedSOs.size === filteredSOs.length && filteredSOs.length > 0}
//                     onChange={handleSelectAll}
//                     className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                   />
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">SO Number</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Service Name</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Start Date</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Duration</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Cost</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Priority</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredSOs.map((so) => (
//                 <tr key={so.id} className="hover:bg-gray-50 transition">
//                   <td className="px-6 py-4">
//                     <input
//                       type="checkbox"
//                       checked={selectedSOs.has(so.id!)}
//                       onChange={() => handleSelectSO(so.id!)}
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <Wrench className="w-4 h-4 text-blue-600" />
//                       <span className="font-medium text-gray-800">{so.so_number}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div>
//                       <p className="font-medium text-gray-800">{so.service_name}</p>
//                       <p className="text-xs text-gray-500">{serviceTypes.find((s) => Number(s.id) === Number(so.service_type_id))?.name}</p>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">{vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || 'N/A'}</td>
//                   <td className="px-6 py-4 text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       {new Date(so.start_date).toLocaleDateString()}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-gray-400" />
//                       {so.duration_days || 0} days
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="text-sm">
//                       <p className="font-medium text-gray-800">{formatCurrency(so.estimated_cost || 0)}</p>
//                       {so.actual_cost > 0 && <p className="text-xs text-gray-500">Actual: {formatCurrency(so.actual_cost)}</p>}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(so.priority)}`}>{(so.priority || '').toUpperCase()}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(so.status)}`}>{(so.status || '').replace('_', ' ').toUpperCase()}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button onClick={() => handleEdit(so)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button onClick={() => handlePrint(so)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Print">
//                         <Printer className="w-4 h-4" />
//                       </button>
//                       <button onClick={() => handleShare(so)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Share">
//                         <Share2 className="w-4 h-4" />
//                       </button>
//                       <button onClick={() => handleDelete(so.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredSOs.length === 0 && (
//           <div className="text-center py-12">
//             <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">No service orders found</h3>
//             <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Create Service Order" to get started'}</p>
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Service Order' : 'Create Service Order'}</h2>
//               <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Service Name <span className="text-red-500">*</span></label>
//                   <input type="text" value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Service Type <span className="text-red-500">*</span></label>
//                   <select value={formData.service_type_id !== null ? String(formData.service_type_id) : ''} onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" >
//                     <option value="">Select Type</option>
//                     {serviceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Vendor <span className="text-red-500">*</span></label>
//                   <select value={formData.vendor_id !== null ? String(formData.vendor_id) : ''} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
//                     <option value="">Select Vendor</option>
//                     {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
//                   <select value={formData.project_id !== null ? String(formData.project_id) : ''} onChange={(e) => setFormData({ ...formData, project_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
//                     <option value="">Select Project</option>
//                     {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
//                   <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                   <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label>
//                   <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                     <option value="urgent">Urgent</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                   <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
//                     <option value="scheduled">Scheduled</option>
//                     <option value="in_progress">In Progress</option>
//                     <option value="completed">Completed</option>
//                     <option value="cancelled">Cancelled</option>
//                     <option value="on_hold">On Hold</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
//                   <input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" step="0.01" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost</label>
//                   <input type="number" value={formData.actual_cost} onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" step="0.01" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
//                   <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
//                   <input type="text" value={formData.supervisor_name} onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Phone</label>
//                   <input type="tel" value={formData.supervisor_phone} onChange={(e) => setFormData({ ...formData, supervisor_phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                   <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
//                 </div>

//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//                   <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-6 border-t">
//                 <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">{editingId ? 'Update Service Order' : 'Create Service Order'}</button>
//                 <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


import { useState, useEffect } from 'react';
import {
  Plus,
  Wrench,
  Calendar,
  Clock,
  X,
  Trash2,
  Edit2,
  Printer,
  Share2,
  Search,
  Filter,
  Eye,
  Package,
  AlertCircle,
  Building,
  CheckSquare,
  ChevronDown,
  FileText,
  Layers,
  MapPin,
  Phone,
  Save,
  Truck,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getServiceOrders,
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  bulkUpdateStatus,
  bulkDeleteServiceOrders,
} from '../lib/serviceOrderApi';

// dynamic master APIs
import projectApi from '../lib/projectApi';
import vendorApi from '../lib/vendorApi';
import serviceTypeApi from '../lib/serviceTypeApi';

interface SOFormData {
  id?: string;
  so_number: string;
  vendor_id: number | string | null;
  project_id: number | string | null;
  service_type_id: number | string | null;
  service_name: string;
  description: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  estimated_cost: number;
  actual_cost: number;
  status: string;
  priority: string;
  location: string;
  supervisor_name: string;
  supervisor_phone: string;
  notes: string;
  created_by?: string | null;
  created_at?: string;
}

const seedServiceTypes = () => [];

export default function ServiceOrders() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<SOFormData[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  // Filter sidebar state
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  
  // Column search states
  const [searchSONumber, setSearchSONumber] = useState('');
  const [searchServiceName, setSearchServiceName] = useState('');
  const [searchVendor, setSearchVendor] = useState('');
  const [searchProject, setSearchProject] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  
  // Filter states
  const [filterFromDate, setFilterFromDate] = useState('');
  const [filterToDate, setFilterToDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [ignoreDate, setIgnoreDate] = useState(false);

  const [formData, setFormData] = useState<SOFormData>({
    so_number: '',
    vendor_id: null,
    project_id: null,
    service_type_id: null,
    service_name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    duration_days: 0,
    estimated_cost: 0,
    actual_cost: 0,
    status: 'scheduled',
    priority: 'medium',
    location: '',
    supervisor_name: '',
    supervisor_phone: '',
    notes: '',
    created_by: user?.id ?? null,
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // fetch masters in parallel
      try {
        const [vendorRows, projectRows] = await Promise.all([
          vendorApi.getVendors(),
          projectApi.getProjects(),
        ]);
        setVendors(vendorRows.map((v: any) => ({ id: v.id, name: v.name })));
        setProjects(projectRows.map((p: any) => ({ id: p.id, name: p.name })));
      } catch (masterErr) {
        console.warn('Failed to load vendors/projects from master APIs, falling back to empty lists', masterErr);
        setVendors([]);
        setProjects([]);
      }

      // get service types from master serviceTypeApi
      try {
        const types = await serviceTypeApi.getAll(true);
        if (Array.isArray(types) && types.length > 0) setServiceTypes(types);
        else setServiceTypes(seedServiceTypes());
      } catch (stypeErr) {
        console.warn('serviceTypeApi.getAll failed, using seeded service types', stypeErr);
        setServiceTypes(seedServiceTypes());
      }

      // fetch service orders
      const rows: any[] = await getServiceOrders();
      rows.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));

      const normalized = rows.map((r: any) => ({
        ...r,
        id: String(r.id),
        vendor_id: r.vendor_id !== undefined && r.vendor_id !== null ? r.vendor_id : null,
        project_id: r.project_id !== undefined && r.project_id !== null ? r.project_id : null,
        service_type_id: r.service_type_id !== undefined && r.service_type_id !== null ? r.service_type_id : null,
      }));

      setServiceOrders(normalized);
    } catch (err) {
      console.error('loadData error', err);
      setServiceOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSONumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return `SO/${year}/${month}/${random}`;
  };

  const calculateDuration = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.service_name || formData.vendor_id === null || formData.project_id === null) {
      alert('Please fill required fields: Service Name, Vendor, Project');
      return;
    }

    const now = new Date().toISOString();
    const soEntry: SOFormData = {
      ...formData,
      so_number: formData.so_number || generateSONumber(),
      duration_days: calculateDuration(formData.start_date, formData.end_date),
      created_by: formData.created_by ?? user?.id ?? null,
      created_at: editingId ? formData.created_at ?? now : now,
    };

    try {
      if (editingId) {
        const payloadToUpdate: any = { ...soEntry };
        if (payloadToUpdate.vendor_id !== null && payloadToUpdate.vendor_id !== undefined) {
          payloadToUpdate.vendor_id = Number(payloadToUpdate.vendor_id);
        }
        if (payloadToUpdate.project_id !== null && payloadToUpdate.project_id !== undefined) {
          payloadToUpdate.project_id = Number(payloadToUpdate.project_id);
        }
        if (payloadToUpdate.service_type_id !== null && payloadToUpdate.service_type_id !== undefined && payloadToUpdate.service_type_id !== '') {
          payloadToUpdate.service_type_id = Number(payloadToUpdate.service_type_id);
        } else {
          payloadToUpdate.service_type_id = null;
        }
        await updateServiceOrder(editingId, payloadToUpdate);
      } else {
        const payloadToCreate: any = { ...soEntry };
        if (payloadToCreate.id) delete payloadToCreate.id;

        payloadToCreate.vendor_id = Number(payloadToCreate.vendor_id);
        payloadToCreate.project_id = Number(payloadToCreate.project_id);
        payloadToCreate.service_type_id = payloadToCreate.service_type_id ? Number(payloadToCreate.service_type_id) : null;

        if (!Number.isFinite(payloadToCreate.vendor_id) || !Number.isFinite(payloadToCreate.project_id)) {
          alert('Vendor and Project must be valid numeric IDs.');
          return;
        }

        await createServiceOrder(payloadToCreate);
      }

      await loadData();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      alert(err?.message || 'Failed to save service order');
      console.error('handleSubmit error', err);
    }
  };

  const handleEdit = (so: SOFormData) => {
    setEditingId(so.id ?? null);
    setFormData({
      ...so,
      vendor_id: so.vendor_id === null || so.vendor_id === undefined ? null : Number(so.vendor_id),
      project_id: so.project_id === null || so.project_id === undefined ? null : Number(so.project_id),
      service_type_id: so.service_type_id === null || so.service_type_id === undefined ? null : (so.service_type_id === '' ? null : Number(so.service_type_id)),
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service order?')) return;
    try {
      await deleteServiceOrder(id);
      await loadData();
      setSelectedItems((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
    } catch (err) {
      alert('Delete failed');
      console.error('handleDelete error', err);
    }
  };

  const resetForm = () => {
    setFormData({
      so_number: '',
      vendor_id: null,
      project_id: null,
      service_type_id: null,
      service_name: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      duration_days: 0,
      estimated_cost: 0,
      actual_cost: 0,
      status: 'scheduled',
      priority: 'medium',
      location: '',
      supervisor_name: '',
      supervisor_phone: '',
      notes: '',
      created_by: user?.id ?? null,
      created_at: new Date().toISOString(),
    });
    setEditingId(null);
  };

  // Filter and search logic
  const filteredSOs = serviceOrders.filter((so) => {
    // Column searches
    if (searchSONumber && !so.so_number?.toLowerCase().includes(searchSONumber.toLowerCase())) {
      return false;
    }
    if (searchServiceName && !so.service_name?.toLowerCase().includes(searchServiceName.toLowerCase())) {
      return false;
    }
    if (searchVendor) {
      const vendorName = vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || '';
      if (!vendorName.toLowerCase().includes(searchVendor.toLowerCase())) {
        return false;
      }
    }
    if (searchProject) {
      const projectName = projects.find((p) => Number(p.id) === Number(so.project_id))?.name || '';
      if (!projectName.toLowerCase().includes(searchProject.toLowerCase())) {
        return false;
      }
    }
    if (searchLocation && !so.location?.toLowerCase().includes(searchLocation.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filterStatus && so.status !== filterStatus) {
      return false;
    }

    // Priority filter
    if (filterPriority && so.priority !== filterPriority) {
      return false;
    }

    // Date filters
    if (!ignoreDate) {
      if (filterFromDate) {
        const transactionDate = new Date(so.start_date);
        const fromDate = new Date(filterFromDate);
        if (transactionDate < fromDate) {
          return false;
        }
      }

      if (filterToDate) {
        const transactionDate = new Date(so.start_date);
        const toDate = new Date(filterToDate);
        toDate.setHours(23, 59, 59, 999);
        if (transactionDate > toDate) {
          return false;
        }
      }
    }

    return true;
  });

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredSOs.map((so) => so.id!).filter(Boolean));
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
    setSelectAll(newSelected.size === filteredSOs.length);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedItems.size === 0) {
      alert('Please select at least one service order');
      return;
    }
    if (!confirm(`Are you sure you want to ${action} ${selectedItems.size} service order(s)?`)) return;

    const ids = Array.from(selectedItems);
    try {
      if (action === 'delete') {
        await bulkDeleteServiceOrders(ids);
      } else {
        let status = 'scheduled';
        if (action === 'start') status = 'in_progress';
        if (action === 'complete') status = 'completed';
        if (action === 'cancel') status = 'cancelled';
        await bulkUpdateStatus(ids, status);
      }
      await loadData();
      setSelectedItems(new Set());
      setSelectAll(false);
    } catch (err) {
      alert('Bulk action failed');
      console.error('handleBulkAction error', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      alert('Please select service orders to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} service order(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      await bulkDeleteServiceOrders(Array.from(selectedItems));
      alert(`${selectedItems.size} service order(s) deleted successfully!`);
      setSelectedItems(new Set());
      setSelectAll(false);
      await loadData();
    } catch (error) {
      console.error('Error deleting service orders:', error);
      alert('Failed to delete service orders');
    }
  };

  const handlePrint = (_so: SOFormData) => window.print();

  const handleShare = async (so: SOFormData) => {
    const url = `${window.location.href}#so=${so.id}`;
    const shareData = {
      title: `Service Order - ${so.so_number}`,
      text: `${so.so_number} — ${so.service_name}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* ignore */
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard');
    }
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      scheduled: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
      on_hold: 'bg-gray-100 text-gray-700',
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const getPriorityBadge = (priority: string) => {
    const map: any = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    return map[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0);

  const resetFilters = () => {
    setSearchSONumber('');
    setSearchServiceName('');
    setSearchVendor('');
    setSearchProject('');
    setSearchLocation('');
    setFilterFromDate('');
    setFilterToDate('');
    setFilterStatus('');
    setFilterPriority('');
    setIgnoreDate(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 px-3">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 px-3 md:px-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center mb-6 px-3">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#C62828] text-white px-4 md:px-6 py-2 md:py-3 rounded-lg hover:bg-red-500 transition flex items-center gap-2 shadow-sm text-sm md:text-base whitespace-nowrap"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Service Order
        </button>
      </div>

      {/* Bulk Actions Bar */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 px-3">
        <div className="flex gap-2 md:gap-3 flex-wrap">
          {selectedItems.size > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction('start')}
                className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition text-sm"
              >
                Start Selected
              </button>
              <button
                onClick={() => handleBulkAction('complete')}
                className="bg-green-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-green-700 transition text-sm"
              >
                Complete Selected
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="bg-orange-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-orange-700 transition text-sm"
              >
                Cancel Selected
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1 md:gap-2 text-sm"
              >
                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                Delete ({selectedItems.size})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-3">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 text-center w-14">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SO Number
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Service Name
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Start Date
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Priority
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-4 md:px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
              
              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-4 md:px-6 py-3"></td>
                <td className="px-4 md:px-6 py-3">
                  <input
                    type="text"
                    placeholder="Search SO..."
                    value={searchSONumber}
                    onChange={(e) => setSearchSONumber(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 md:px-6 py-3">
                  <input
                    type="text"
                    placeholder="Search service..."
                    value={searchServiceName}
                    onChange={(e) => setSearchServiceName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 md:px-6 py-3">
                  <input
                    type="text"
                    placeholder="Search vendor..."
                    value={searchVendor}
                    onChange={(e) => setSearchVendor(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 md:px-6 py-3">
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 md:px-6 py-3"></td>
                <td className="px-4 md:px-6 py-3">
                  <input
                    type="text"
                    placeholder="Search location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-4 md:px-6 py-3"></td>
                <td className="px-4 md:px-6 py-3"></td>
                <td className="px-4 md:px-6 py-3">
                  <button
                    onClick={() => setShowFilterSidebar(true)}
                    className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition"
                    title="Advanced Filters"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-gray-200">
              {filteredSOs.map((so) => {
                const isSelected = selectedItems.has(so.id!);
                return (
                  <tr
                    key={so.id}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <td className="px-4 md:px-6 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(so.id!)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{so.so_number}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{so.service_name}</p>
                        <p className="text-xs text-gray-500">
                          {serviceTypes.find((s) => Number(s.id) === Number(so.service_type_id))?.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || 'N/A'}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {projects.find((p) => Number(p.id) === Number(so.project_id))?.name || 'N/A'}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(so.start_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-gray-700">
                      {so.location || 'N/A'}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(so.priority)}`}>
                        {(so.priority || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(so.status)}`}>
                        {(so.status || '').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex gap-1 md:gap-2">
                        <button
                          onClick={() => handleEdit(so)}
                          className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(so)}
                          className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Print"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShare(so)}
                          className="p-1.5 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                          title="Share"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(so.id!)}
                          className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSOs.length === 0 && (
            <div className="text-center py-12 px-3">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No service orders found</h3>
              <p className="text-gray-600">
                {searchSONumber || searchServiceName || searchVendor || searchProject || searchLocation || filterStatus || filterPriority
                  ? 'Try different search or filter criteria'
                  : 'Click "Create Service Order" to get started'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowFilterSidebar(false)}></div>
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col">
            <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
                >
                  Reset All
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1.5 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date
                </label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date
                </label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  disabled={ignoreDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ignoreDate"
                  checked={ignoreDate}
                  onChange={(e) => {
                    setIgnoreDate(e.target.checked);
                    if (e.target.checked) {
                      setFilterFromDate('');
                      setFilterToDate('');
                    }
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="ignoreDate" className="text-sm text-gray-700 cursor-pointer">
                  Ignore Date Filter
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Reset All
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:shadow-lg transition font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xl my-4 border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? 'Edit Service Order' : 'Create Service Order'}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? 'Update service order details' : 'Add new service order'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Compact Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Service Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C62828]" />
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.service_name}
                        onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                        placeholder="Enter service name"
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#C62828]" />
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.service_type_id !== null ? String(formData.service_type_id) : ''}
                        onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      >
                        <option value="" className="text-gray-400">Select Type</option>
                        {serviceTypes.map((t) => (
                          <option key={t.id} value={t.id} className="py-1">{t.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Vendor */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C62828]" />
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.vendor_id !== null ? String(formData.vendor_id) : ''}
                        onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                        required
                      >
                        <option value="" className="text-gray-400">Select Vendor</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id} className="py-1">{v.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#C62828]" />
                      Project <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.project_id !== null ? String(formData.project_id) : ''}
                        onChange={(e) => setFormData({ ...formData, project_id: e.target.value ? Number(e.target.value) : null })}
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                        required
                      >
                        <option value="" className="text-gray-400">Select Project</option>
                        {projects.map((p) => (
                          <option key={p.id} value={p.id} className="py-1">{p.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* End Date */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                      End Date
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-[#C62828]" />
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                        required
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <CheckSquare className="w-3.5 h-3.5 text-[#C62828]" />
                      Status
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C62828]" />
                      Estimated Cost
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={formData.estimated_cost}
                        onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Actual Cost */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#C62828]" />
                      Actual Cost
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={formData.actual_cost}
                        onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C62828]" />
                      Location
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>

                  {/* Supervisor Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <UserRound className="w-3.5 h-3.5 text-[#C62828]" />
                      Supervisor Name
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <UserRound className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.supervisor_name}
                        onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter name"
                      />
                    </div>
                  </div>

                  {/* Supervisor Phone */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#C62828]" />
                      Supervisor Phone
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={formData.supervisor_phone}
                        onChange={(e) => setFormData({ ...formData, supervisor_phone: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C62828]" />
                    Description
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[80px] resize-vertical"
                      placeholder="Enter description"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#C62828]" />
                    Notes
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[60px] resize-vertical"
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        {editingId ? 'Update Service Order' : 'Create Service Order'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Add some custom styles for scrollbar */}
            <style >{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #c62828;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #b71c1c;
              }
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}