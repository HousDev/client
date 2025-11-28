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
  id?: string; // keep id as string for UI selection, backend uses numeric id
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

// ⚠️ Removed static service type seed — always load from master API
// const seedServiceTypes = () => [];

export default function ServiceOrders() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<SOFormData[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedSOs, setSelectedSOs] = useState<Set<string>>(new Set());

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

  // utilities
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

  // submit -> create or update via API
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
      setSelectedSOs((prev) => {
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

  // selection & bulk actions
  const handleSelectSO = (soId: string) => {
    const newSelected = new Set(selectedSOs);
    if (newSelected.has(soId)) newSelected.delete(soId);
    else newSelected.add(soId);
    setSelectedSOs(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSOs.size === filteredSOs.length && filteredSOs.length > 0) {
      setSelectedSOs(new Set());
    } else {
      setSelectedSOs(new Set(filteredSOs.map((so) => so.id!)));
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedSOs.size === 0) {
      alert('Please select at least one service order');
      return;
    }
    if (!confirm(`Are you sure you want to ${action} ${selectedSOs.size} service order(s)?`)) return;

    const ids = Array.from(selectedSOs);
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
      setSelectedSOs(new Set());
    } catch (err) {
      alert('Bulk action failed');
      console.error('handleBulkAction error', err);
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

  // filters / formatting
  const filteredSOs = serviceOrders.filter((so) =>
    (so.so_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (so.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    ((vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || '')).toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Service Orders</h1>
          <p className="text-gray-600 mt-1">Manage service work orders and maintenance</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Create Service Order
        </button>
      </div>

      {selectedSOs.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center justify-between">
          <span className="text-blue-800 font-medium">{selectedSOs.size} service order(s) selected</span>
          <div className="flex gap-2">
            <button onClick={() => handleBulkAction('start')} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Start Selected</button>
            <button onClick={() => handleBulkAction('complete')} className="bg-green-600 text-white px-4 py-2 rounded-lg">Complete Selected</button>
            <button onClick={() => handleBulkAction('cancel')} className="bg-orange-600 text-white px-4 py-2 rounded-lg">Cancel Selected</button>
            <button onClick={() => handleBulkAction('delete')} className="bg-red-600 text-white px-4 py-2 rounded-lg">Delete Selected</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by SO number, service name, or vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedSOs.size === filteredSOs.length && filteredSOs.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">SO Number</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Service Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Start Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Duration</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Cost</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Priority</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSOs.map((so) => (
                <tr key={so.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedSOs.has(so.id!)}
                      onChange={() => handleSelectSO(so.id!)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-800">{so.so_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{so.service_name}</p>
                      <p className="text-xs text-gray-500">{serviceTypes.find((s) => Number(s.id) === Number(so.service_type_id))?.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(so.start_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      {so.duration_days || 0} days
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{formatCurrency(so.estimated_cost || 0)}</p>
                      {so.actual_cost > 0 && <p className="text-xs text-gray-500">Actual: {formatCurrency(so.actual_cost)}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(so.priority)}`}>{(so.priority || '').toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(so.status)}`}>{(so.status || '').replace('_', ' ').toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(so)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handlePrint(so)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Print">
                        <Printer className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleShare(so)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition" title="Share">
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(so.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSOs.length === 0 && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No service orders found</h3>
            <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Create Service Order" to get started'}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Service Order' : 'Create Service Order'}</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Name <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.service_name} onChange={(e) => setFormData({ ...formData, service_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Type <span className="text-red-500">*</span></label>
                  <select value={formData.service_type_id !== null ? String(formData.service_type_id) : ''} onChange={(e) => setFormData({ ...formData, service_type_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" >
                    <option value="">Select Type</option>
                    {serviceTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor <span className="text-red-500">*</span></label>
                  <select value={formData.vendor_id !== null ? String(formData.vendor_id) : ''} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
                  <select value={formData.project_id !== null ? String(formData.project_id) : ''} onChange={(e) => setFormData({ ...formData, project_id: e.target.value ? Number(e.target.value) : null })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="">Select Project</option>
                    {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label>
                  <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost</label>
                  <input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" step="0.01" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Actual Cost</label>
                  <input type="number" value={formData.actual_cost} onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" min="0" step="0.01" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Name</label>
                  <input type="text" value={formData.supervisor_name} onChange={(e) => setFormData({ ...formData, supervisor_name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supervisor Phone</label>
                  <input type="tel" value={formData.supervisor_phone} onChange={(e) => setFormData({ ...formData, supervisor_phone: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" rows={2} />
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">{editingId ? 'Update Service Order' : 'Create Service Order'}</button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
