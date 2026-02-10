/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  DollarSign,
  X,
  Search,
  Trash2,
  IndianRupee,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function PurchaseOrdersEnhanced() {
  const { user, profile } = useAuth();
  const [userPermissions, setUserPermissions] = useState<any>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'tracking'>('list');
  const [pos, setPOs] = useState<any[]>([]);
  const [trackingData, setTrackingData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const STORAGE_POS = 'mock_purchase_orders_v1';
  const STORAGE_TRACK = 'mock_po_tracking_v1';
  const STORAGE_PERMS = 'mock_user_permissions_v1';

  // sample data
  const defaultPOs = [
    {
      id: 'po_1',
      po_number: 'PO-1001',
      po_date: '2025-03-10',
      vendors: { name: 'ABC Suppliers' },
      projects: { name: 'Tower A' },
      po_types: { name: 'Material' },
      grand_total: 125000,
      total_paid: 25000,
      balance_amount: 100000,
      payment_status: 'partial',
      status: 'pending',
      notes: 'Deliver between 10-15 days',
      created_at: new Date().toISOString(),
    },
    {
      id: 'po_2',
      po_number: 'PO-1002',
      po_date: '2025-02-05',
      vendors: { name: 'XYZ Traders' },
      projects: { name: 'Commercial Plaza' },
      po_types: { name: 'Service' },
      grand_total: 50000,
      total_paid: 0,
      balance_amount: 50000,
      payment_status: 'pending',
      status: 'draft',
      notes: '',
      created_at: new Date().toISOString(),
    },
  ];

  const defaultTracking = [
    {
      id: 't_1',
      po_id: 'po_1',
      item_id: 'MAT-001',
      item_description: 'Cement Grade 43',
      quantity_ordered: 100,
      quantity_received: 20,
      quantity_pending: 80,
      received_date: null,
      status: 'partial',
      purchase_orders: { po_number: 'PO-1001', vendors: { name: 'ABC Suppliers' } },
      created_at: new Date().toISOString(),
    },
    {
      id: 't_2',
      po_id: 'po_1',
      item_id: 'MAT-002',
      item_description: 'Steel Bars TMT',
      quantity_ordered: 50,
      quantity_received: 0,
      quantity_pending: 50,
      received_date: null,
      status: 'pending',
      purchase_orders: { po_number: 'PO-1001', vendors: { name: 'ABC Suppliers' } },
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    loadUserPermissions();
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, activeTab]);

  const loadUserPermissions = () => {
    // prefer profile.permissions if present, fallback to localStorage mock
    if (profile?.permissions) {
      setUserPermissions(profile.permissions);
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_PERMS);
      if (raw) setUserPermissions(JSON.parse(raw));
      else {
        // default demo permissions (non-admin)
        const demo = {
          view_pos: true,
          create_pos: true,
          edit_pos: true,
          approve_pos: true,
          make_payments: true,
          receive_materials: true,
          delete_pos: true,
        };
        localStorage.setItem(STORAGE_PERMS, JSON.stringify(demo));
        setUserPermissions(demo);
      }
    } catch (err) {
      console.error('Error loading permissions:', err);
      setUserPermissions(null);
    }
  };

  const can = (permission: string) => {
    if ((profile as any)?.role === 'admin') return true;
    return userPermissions?.[permission] === true;
  };

  const loadData = async () => {
    setLoading(true);
    // small delay to simulate loading
    setTimeout(() => {
      try {
        if (activeTab === 'list') {
          loadPOs();
        } else {
          loadTrackingData();
        }
      } finally {
        setLoading(false);
      }
    }, 120);
  };

  const loadPOs = () => {
    try {
      const raw = localStorage.getItem(STORAGE_POS);
      let parsed = raw ? JSON.parse(raw) : [];
      if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
        parsed = defaultPOs;
        localStorage.setItem(STORAGE_POS, JSON.stringify(parsed));
      }
      // sort desc by created_at
      parsed.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
      setPOs(parsed);
    } catch (err) {
      console.error('Error loading POs:', err);
      setPOs([]);
    }
  };

  const persistPOs = (newPOs: any[]) => {
    localStorage.setItem(STORAGE_POS, JSON.stringify(newPOs));
    setPOs(newPOs);
  };

  const loadTrackingData = () => {
    try {
      const raw = localStorage.getItem(STORAGE_TRACK);
      let parsed = raw ? JSON.parse(raw) : [];
      if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
        parsed = defaultTracking;
        localStorage.setItem(STORAGE_TRACK, JSON.stringify(parsed));
      }
      parsed.sort((a: any, b: any) => (b.created_at || '').localeCompare(a.created_at || ''));
      setTrackingData(parsed);
    } catch (err) {
      console.error('Error loading tracking:', err);
      setTrackingData([]);
    }
  };

  const persistTracking = (newTrack: any[]) => {
    localStorage.setItem(STORAGE_TRACK, JSON.stringify(newTrack));
    setTrackingData(newTrack);
  };

  const handleView = (po: any) => {
    setSelectedPO(po);
    setShowViewModal(true);
  };

  const handleDelete = (id: string) => {
    if (!can('delete_pos')) {
      toast.error('You do not have permission to delete POs');
      return;
    }
    if (!confirm('Are you sure you want to delete this PO?')) return;
    const updated = pos.filter((p) => p.id !== id);
    persistPOs(updated);
    toast.error('PO deleted successfully!');
  };

  const handleStatusUpdate = (id: string, status: string) => {
    if (!can('edit_pos')) {
      toast.error('You do not have permission to update PO status');
      return;
    }
    const updated = pos.map((p) => (p.id === id ? { ...p, status } : p));
    persistPOs(updated);
    toast.error('Status updated successfully!');
  };

  const handleApprove = (id: string) => {
    if (!can('approve_pos')) {
      toast.error('You do not have permission to approve POs');
      return;
    }
    const updated = pos.map((p) =>
      p.id === id ? { ...p, status: 'approved', approved_by: user?.id, approved_at: new Date().toISOString() } : p
    );
    persistPOs(updated);
    toast.error('PO approved successfully!');
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!can('make_payments')) {
      toast.error('You do not have permission to make payments');
      return;
    }
    if (!selectedPO) return;
    const newTotalPaid = (selectedPO.total_paid || 0) + paymentAmount;
    const newBalance = (selectedPO.grand_total || 0) - newTotalPaid;
    const updated = pos.map((p) =>
      p.id === selectedPO.id
        ? {
          ...p,
          total_paid: newTotalPaid,
          balance_amount: newBalance,
          payment_status: newBalance === 0 ? 'paid' : newTotalPaid > 0 ? 'partial' : 'pending',
        }
        : p
    );
    persistPOs(updated);
    toast.error('Payment recorded successfully!');
    setShowPaymentModal(false);
    setPaymentAmount(0);
    setSelectedPO(null);
  };

  const handleReceiveMaterial = (trackingId: string, quantityReceived: number) => {
    if (!can('receive_materials')) {
      toast.error('You do not have permission to receive materials');
      return;
    }
    const track = trackingData.find((t) => t.id === trackingId);
    if (!track) return;
    const newReceived = (track.quantity_received || 0) + quantityReceived;
    const newPending = (track.quantity_ordered || 0) - newReceived;
    const newStatus = newPending <= 0 ? 'completed' : newReceived > 0 ? 'partial' : 'pending';

    const updatedTrack = trackingData.map((t) =>
      t.id === trackingId
        ? { ...t, quantity_received: newReceived, quantity_pending: Math.max(newPending, 0), received_date: new Date().toISOString(), status: newStatus }
        : t
    );
    persistTracking(updatedTrack);

    // update parent PO material_status and percent (simple heuristic)
    const poId = track.po_id;
    const allForPO = updatedTrack.filter((t) => t.po_id === poId);
    const allCompleted = allForPO.every((t) => t.status === 'completed');
    const anyPartial = allForPO.some((t) => t.status === 'partial');
    const materialStatus = allCompleted ? 'completed' : anyPartial ? 'partial' : 'pending';

    const updatedPOs = pos.map((p) =>
      p.id === poId ? { ...p, material_status: materialStatus, material_received_percentage: Math.round((allForPO.filter((t) => t.status === 'completed').length / allForPO.length) * 100) } : p
    );
    persistPOs(updatedPOs);
    toast.error('Material received successfully!');
  };

  const filteredPOs = pos.filter(
    (po) =>
      (po.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.vendors?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (po.projects?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTracking = trackingData.filter(
    (t) =>
      (t.item_description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.purchase_orders?.po_number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: any = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage and track purchase orders (demo)</p>
        </div>
        {can('create_pos') && (
          <button
            onClick={() => (window.location.href = '#/purchase-orders-pro')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create PO
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'list'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Purchase Orders</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'tracking'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>Material Tracking</span>
            </div>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'list' ? 'Search POs...' : 'Search materials...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* List */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Project</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{po.po_number}</span>
                      <p className="text-xs text-gray-500">{po.po_date ? new Date(po.po_date).toLocaleDateString() : '-'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{po.vendors?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{po.projects?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{formatCurrency(po.grand_total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                        {po.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.payment_status)}`}>
                        {po.payment_status?.toUpperCase()}
                      </span>
                      {po.balance_amount > 0 && <p className="text-xs text-gray-600 mt-1">Bal: {formatCurrency(po.balance_amount)}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {can('view_pos') && (
                          <button onClick={() => handleView(po)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        {can('approve_pos') && po.status === 'pending' && (
                          <button onClick={() => handleApprove(po.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {can('make_payments') && po.balance_amount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setPaymentAmount(po.balance_amount);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Make Payment"
                          >
                            <IndianRupee className="w-4 h-4" />
                          </button>
                        )}
                        {can('delete_pos') && (
                          <button onClick={() => handleDelete(po.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPOs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchase orders found</h3>
              <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Create a PO to get started'}</p>
            </div>
          )}
        </div>
      )}

      {/* Tracking */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Item</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ordered</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Received</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pending</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Progress</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTracking.map((track) => {
                  const progress = (track.quantity_received / Math.max(track.quantity_ordered, 1)) * 100;
                  return (
                    <tr key={track.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">{track.purchase_orders?.po_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">{track.item_description}</p>
                        <p className="text-xs text-gray-500">{track.item_id}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{track.quantity_ordered}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{track.quantity_received}</td>
                      <td className="px-6 py-4 text-orange-600 font-medium">{track.quantity_pending}</td>
                      <td className="px-6 py-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${progress === 100 ? 'bg-green-600' : progress > 0 ? 'bg-yellow-600' : 'bg-red-600'}`} style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{Math.round(progress)}%</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${track.status === 'completed' ? 'bg-green-100 text-green-700' : track.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {track.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {can('receive_materials') && track.quantity_pending > 0 && (
                          <button
                            onClick={() => {
                              const qtyStr = prompt(`Receive quantity (Max: ${track.quantity_pending}):`, `${track.quantity_pending}`);
                              if (!qtyStr) return;
                              const qty = parseInt(qtyStr, 10);
                              if (isNaN(qty) || qty <= 0 || qty > track.quantity_pending) {
                                toast.error('Invalid quantity');
                                return;
                              }
                              handleReceiveMaterial(track.id, qty);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                          >
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredTracking.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No tracking data found</h3>
              <p className="text-gray-600">Material tracking will appear here once POs are created</p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Purchase Order Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">PO Number</p>
                  <p className="text-lg font-bold text-gray-800">{selectedPO.po_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedPO.status)}`}>{selectedPO.status?.toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vendor</p>
                  <p className="font-medium text-gray-800">{selectedPO.vendors?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Project</p>
                  <p className="font-medium text-gray-800">{selectedPO.projects?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">PO Date</p>
                  <p className="font-medium text-gray-800">{selectedPO.po_date ? new Date(selectedPO.po_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(selectedPO.grand_total)}</p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-800 mb-4">Payment Details</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xl font-bold text-blue-600">{formatCurrency(selectedPO.grand_total)}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(selectedPO.total_paid || 0)}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Balance</p>
                    <p className="text-xl font-bold text-orange-600">{formatCurrency(selectedPO.balance_amount || selectedPO.grand_total)}</p>
                  </div>
                </div>
              </div>

              {selectedPO.notes && (
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <p className="text-gray-700">{selectedPO.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Record Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePayment} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">PO Number</p>
                <p className="font-bold text-gray-800">{selectedPO.po_number}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Balance Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedPO.balance_amount)}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="0"
                  max={selectedPO.balance_amount}
                  step="0.01"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-medium">Record Payment</button>
                <button type="button" onClick={() => { setShowPaymentModal(false); setPaymentAmount(0); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
