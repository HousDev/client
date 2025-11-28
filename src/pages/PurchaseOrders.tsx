// src/components/PurchaseOrders.tsx
import { useState, useEffect } from 'react';
import {
  Plus,
  Eye,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  FileText,
  Package,
  DollarSign,
  X,
  Save,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import PurchaseOrdersPro from './PurchaseOrdersPro';

type Vendor = { id: string; name: string; phone?: string; email?: string; is_active?: boolean };
type Project = { id: string; name: string; is_active?: boolean };
type POType = { id: string; name: string; is_active?: boolean };
type PO = {
  id: string;
  po_number: string;
  po_date?: string;
  validity_date?: string;
  vendor_id?: string;
  vendors?: Vendor | null;
  project_id?: string;
  projects?: Project | null;
  po_type_id?: string;
  po_types?: POType | null;
  status?: string;
  total_amount?: number;
  tax_amount?: number;
  grand_total?: number;
  total_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  material_status?: string;
  material_received_percentage?: number;
  notes?: string;
  is_interstate?: boolean;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  created_at?: string;
};
type Tracking = {
  id: string;
  po_id: string;
  item_id?: string;
  item_description?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: string;
  received_date?: string | null;
  created_at?: string;
  purchase_orders?: { po_number?: string; status?: string; vendors?: { name?: string } };
};

export default function PurchaseOrders() {
  const { user, profile } = useAuth();

  const [pos, setPOs] = useState<PO[]>([]);
  const [trackingData, setTrackingData] = useState<Tracking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [poTypes, setPOTypes] = useState<POType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreatePro, setShowCreatePro] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [activeTab, setActiveTab] = useState<'tracking' | 'management'>('management');

  // localStorage keys
  const KEY_VENDORS = 'mock_vendors_v1';
  const KEY_PROJECTS = 'mock_projects_v1';
  const KEY_PO_TYPES = 'mock_po_types_v1';
  const KEY_POS = 'mock_pos_v1';
  const KEY_TRACKING = 'mock_tracking_v1';

  // --- Default mock data ---
  const defaultVendors: Vendor[] = [
    { id: 'v_1', name: 'Acme Supplies', phone: '9999999999', email: 'acme@example.com', is_active: true },
    { id: 'v_2', name: 'Builder Co', phone: '8888888888', email: 'builder@example.com', is_active: true },
  ];

  const defaultProjects: Project[] = [
    { id: 'p_1', name: 'Site A', is_active: true },
    { id: 'p_2', name: 'Site B', is_active: true },
  ];

  const defaultPOTypes: POType[] = [
    { id: 't_1', name: 'Standard', is_active: true },
    { id: 't_2', name: 'Urgent', is_active: true },
  ];

  const defaultPOs: PO[] = [
    {
      id: 'po_1',
      po_number: 'PO-1001',
      po_date: new Date().toISOString(),
      vendor_id: 'v_1',
      vendors: defaultVendors[0],
      project_id: 'p_1',
      projects: defaultProjects[0],
      po_type_id: 't_1',
      po_types: defaultPOTypes[0],
      status: 'pending',
      total_amount: 50000,
      tax_amount: 9000,
      grand_total: 59000,
      total_paid: 0,
      balance_amount: 59000,
      payment_status: 'pending',
      material_status: 'pending',
      material_received_percentage: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 'po_2',
      po_number: 'PO-1002',
      po_date: new Date().toISOString(),
      vendor_id: 'v_2',
      vendors: defaultVendors[1],
      project_id: 'p_2',
      projects: defaultProjects[1],
      po_type_id: 't_2',
      po_types: defaultPOTypes[1],
      status: 'approved',
      total_amount: 120000,
      tax_amount: 21600,
      grand_total: 141600,
      total_paid: 50000,
      balance_amount: 91600,
      payment_status: 'partial',
      material_status: 'partial',
      material_received_percentage: 50,
      created_at: new Date().toISOString(),
    },
  ];

  const defaultTracking: Tracking[] = [
    {
      id: 'tr_1',
      po_id: 'po_1',
      item_id: 'itm_001',
      item_description: 'Cement Bags',
      quantity_ordered: 100,
      quantity_received: 0,
      quantity_pending: 100,
      status: 'pending',
      created_at: new Date().toISOString(),
      purchase_orders: { po_number: 'PO-1001', status: 'pending', vendors: { name: defaultVendors[0].name } },
    },
    {
      id: 'tr_2',
      po_id: 'po_2',
      item_id: 'itm_002',
      item_description: 'Steel Rods',
      quantity_ordered: 200,
      quantity_received: 100,
      quantity_pending: 100,
      status: 'partial',
      created_at: new Date().toISOString(),
      purchase_orders: { po_number: 'PO-1002', status: 'approved', vendors: { name: defaultVendors[1].name } },
    },
  ];

  // --- Util: load from localStorage or defaults ---
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const sv = localStorage.getItem(KEY_VENDORS);
      const sp = localStorage.getItem(KEY_PROJECTS);
      const st = localStorage.getItem(KEY_PO_TYPES);
      const spo = localStorage.getItem(KEY_POS);
      const strack = localStorage.getItem(KEY_TRACKING);

      const vs: Vendor[] = sv ? JSON.parse(sv) : defaultVendors;
      const ps: Project[] = sp ? JSON.parse(sp) : defaultProjects;
      const ts: POType[] = st ? JSON.parse(st) : defaultPOTypes;
      const poList: PO[] = spo ? JSON.parse(spo) : defaultPOs;
      const trackingList: Tracking[] = strack ? JSON.parse(strack) : defaultTracking;

      // link vendor/project/type objects into POs for convenience
      const poWithRelations = poList.map((p) => ({
        ...p,
        vendors: vs.find((v) => v.id === p.vendor_id) ?? p.vendors ?? null,
        projects: ps.find((pr) => pr.id === p.project_id) ?? p.projects ?? null,
        po_types: ts.find((t) => t.id === p.po_type_id) ?? p.po_types ?? null,
      }));

      // link purchase_orders into tracking items
      const trackingWithPO = trackingList.map((t) => ({
        ...t,
        purchase_orders: poWithRelations.find((p) => p.id === t.po_id)
          ? {
              po_number: poWithRelations.find((p) => p.id === t.po_id)!.po_number,
              status: poWithRelations.find((p) => p.id === t.po_id)!.status,
              vendors: { name: poWithRelations.find((p) => p.id === t.po_id)!.vendors?.name },
            }
          : t.purchase_orders,
      }));

      setVendors(vs);
      setProjects(ps);
      setPOTypes(ts);
      setPOs(poWithRelations);
      setTrackingData(trackingWithPO);

      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // --- Persist helpers ---
  const persistPOs = (newPOs: PO[]) => {
    // Save minimal representation (without nested objects) so load is consistent
    const toSave = newPOs.map((p) => ({
      ...p,
      vendors: undefined,
      projects: undefined,
      po_types: undefined,
    }));
    localStorage.setItem(KEY_POS, JSON.stringify(toSave));
    setPOs(newPOs);
  };

  const persistTracking = (newTracking: Tracking[]) => {
    localStorage.setItem(KEY_TRACKING, JSON.stringify(newTracking));
    setTrackingData(newTracking);
  };

  const persistMasters = (v: Vendor[], p: Project[], t: POType[]) => {
    localStorage.setItem(KEY_VENDORS, JSON.stringify(v));
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(p));
    localStorage.setItem(KEY_PO_TYPES, JSON.stringify(t));
    setVendors(v);
    setProjects(p);
    setPOTypes(t);
  };

  // --- Permissions: admin gets everything, others follow profile.permissions ---
  const can = (permission: string) => {
    // Try these fields for role - adapt if your backend uses different field names
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      null;

    // If admin — grant all access
    if (role === 'admin') return true;

    // fallback to permissions object if present on profile
    const perms: Record<string, boolean> | null = (profile as any)?.permissions ?? null;

    if (perms && typeof perms === 'object') {
      return Boolean(perms[permission]);
    }

    // Default: deny
    return false;
  };

  // --- Data operations (mocked) ---
  const loadPOs = async () => {
    setLoading(true);
    setTimeout(() => {
      const sv = localStorage.getItem(KEY_VENDORS);
      const sp = localStorage.getItem(KEY_PROJECTS);
      const st = localStorage.getItem(KEY_PO_TYPES);
      const spo = localStorage.getItem(KEY_POS);

      const vs: Vendor[] = sv ? JSON.parse(sv) : defaultVendors;
      const ps: Project[] = sp ? JSON.parse(sp) : defaultProjects;
      const ts: POType[] = st ? JSON.parse(st) : defaultPOTypes;
      const poList: PO[] = spo ? JSON.parse(spo) : defaultPOs;

      const poWithRelations = poList.map((p) => ({
        ...p,
        vendors: vs.find((v) => v.id === p.vendor_id) ?? p.vendors ?? null,
        projects: ps.find((pr) => pr.id === p.project_id) ?? p.projects ?? null,
        po_types: ts.find((t) => t.id === p.po_type_id) ?? p.po_types ?? null,
      }));

      setPOs(poWithRelations);
      setLoading(false);
    }, 200);
  };

  const loadTrackingData = async () => {
    setLoading(true);
    setTimeout(() => {
      const strack = localStorage.getItem(KEY_TRACKING);
      const spo = localStorage.getItem(KEY_POS);
      const poList: PO[] = spo ? JSON.parse(spo) : defaultPOs;
      const trackingList: Tracking[] = strack ? JSON.parse(strack) : defaultTracking;

      const trackingWithPO = trackingList.map((t) => ({
        ...t,
        purchase_orders: {
          po_number: poList.find((p) => p.id === t.po_id)?.po_number,
          status: poList.find((p) => p.id === t.po_id)?.status,
          vendors: { name: vendors.find((v) => v.id === poList.find((p) => p.id === t.po_id)?.vendor_id)?.name },
        },
      }));
      setTrackingData(trackingWithPO);
      setLoading(false);
    }, 200);
  };

  const loadMasterData = async () => {
    setLoading(true);
    setTimeout(() => {
      const sv = localStorage.getItem(KEY_VENDORS);
      const sp = localStorage.getItem(KEY_PROJECTS);
      const st = localStorage.getItem(KEY_PO_TYPES);

      const vs: Vendor[] = sv ? JSON.parse(sv) : defaultVendors;
      const ps: Project[] = sp ? JSON.parse(sp) : defaultProjects;
      const ts: POType[] = st ? JSON.parse(st) : defaultPOTypes;

      persistMasters(vs, ps, ts);
      setLoading(false);
    }, 150);
  };

  // --- Handlers ---
  const handleView = (po: PO) => {
    setSelectedPO(po);
    setShowViewModal(true);
  };

  const handleEdit = (po: PO) => {
    setEditingPO({
      ...po,
      po_date: po.po_date ? po.po_date.split('T')[0] : '',
      validity_date: po.validity_date ? po.validity_date.split('T')[0] : '',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPO) return;

    const updatedPOs = pos.map((p) =>
      p.id === editingPO.id
        ? {
            ...p,
            ...editingPO,
            vendors: vendors.find((v) => v.id === editingPO.vendor_id) ?? p.vendors,
            projects: projects.find((pr) => pr.id === editingPO.project_id) ?? p.projects,
            po_types: poTypes.find((t) => t.id === editingPO.po_type_id) ?? p.po_types,
          }
        : p
    );

    persistPOs(updatedPOs);

    setTimeout(() => {
      alert('PO updated successfully!');
      setShowEditModal(false);
      setEditingPO(null);
      loadPOs();
    }, 250);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PO? This action cannot be undone.')) return;

    const updated = pos.filter((p) => p.id !== id);
    persistPOs(updated);
    setTimeout(() => {
      alert('PO deleted successfully!');
      loadPOs();
    }, 200);
  };

  const handleApprove = async (id: string) => {
    const updated = pos.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'approved',
            approved_by: user?.id,
            approved_at: new Date().toISOString(),
          }
        : p
    );
    persistPOs(updated);
    setTimeout(() => {
      alert('PO approved successfully!');
      loadPOs();
    }, 200);
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    const updated = pos.map((p) =>
      p.id === id
        ? {
            ...p,
            status: 'rejected',
            rejected_by: user?.id,
            rejected_at: new Date().toISOString(),
            rejection_reason: reason,
          }
        : p
    );
    persistPOs(updated);
    setTimeout(() => {
      alert('PO rejected!');
      loadPOs();
    }, 200);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const newTotalPaid = (selectedPO.total_paid || 0) + paymentAmount;
    const newBalance = (selectedPO.grand_total || 0) - newTotalPaid;
    const paymentStatus = newBalance === 0 ? 'paid' : newTotalPaid > 0 ? 'partial' : 'pending';

    const updated = pos.map((p) =>
      p.id === selectedPO.id
        ? {
            ...p,
            total_paid: newTotalPaid,
            balance_amount: newBalance,
            payment_status: paymentStatus,
          }
        : p
    );

    persistPOs(updated);
    setTimeout(() => {
      alert('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setSelectedPO(null);
      loadPOs();
    }, 300);
  };

  const handleReceiveMaterial = async (trackingId: string) => {
    const tracking = trackingData.find((t) => t.id === trackingId);
    if (!tracking) return;

    const qtyStr = prompt(`Receive quantity (Max: ${tracking.quantity_pending}):`, '0');
    if (!qtyStr) return;
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty <= 0 || qty > tracking.quantity_pending) {
      alert('Invalid quantity');
      return;
    }

    const newTracking = trackingData.map((t) => {
      if (t.id !== trackingId) return t;
      const newReceived = t.quantity_received + qty;
      const newPending = t.quantity_ordered - newReceived;
      return {
        ...t,
        quantity_received: newReceived,
        quantity_pending: newPending,
        received_date: new Date().toISOString(),
        status: newPending === 0 ? 'completed' : newPending < t.quantity_ordered ? 'partial' : 'pending',
      } as Tracking;
    });

    persistTracking(newTracking);

    // recompute per-PO status/percentage
    const poIds = Array.from(new Set(newTracking.map((t) => t.po_id)));
    const updatedPOs = [...pos];
    poIds.forEach((poId) => {
      const items = newTracking.filter((t) => t.po_id === poId);
      const allCompleted = items.every((it) => it.status === 'completed');
      const anyPartial = items.some((it) => it.status === 'partial');
      const percent = items.length ? (items.filter((it) => it.status === 'completed').length / items.length) * 100 : 0;
      for (let i = 0; i < updatedPOs.length; i++) {
        if (updatedPOs[i].id === poId) {
          updatedPOs[i] = {
            ...updatedPOs[i],
            material_status: allCompleted ? 'completed' : anyPartial ? 'partial' : 'pending',
            material_received_percentage: percent,
          };
        }
      }
    });

    persistPOs(updatedPOs);

    setTimeout(() => {
      alert('Material received successfully!');
      loadTrackingData();
      loadPOs();
    }, 250);
  };

  // --- Filtering helpers ---
  const filteredPOs = pos.filter(
    (po) =>
      po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTracking = trackingData.filter(
    (t) =>
      t.item_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.purchase_orders?.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-700',
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (status && colors[status]) || 'bg-gray-100 text-gray-700';
  };

  const getPaymentStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-red-100 text-red-700',
      partial: 'bg-yellow-100 text-yellow-700',
      paid: 'bg-green-100 text-green-700',
    };
    return (status && colors[status]) || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  // --- UI states while loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  if (showCreatePro) {
    return (
      <div>
        <button
          onClick={() => {
            setShowCreatePro(false);
            loadPOs();
          }}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Purchase Orders
        </button>
        <PurchaseOrdersPro />
      </div>
    );
  }

  // --- Render main UI ---
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Manage purchase orders and track materials</p>
        </div>
        {can('create_pos') && (
          <button
            onClick={() => setShowCreatePro(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create PO
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'tracking'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>PO Tracking</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('management')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'management'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>PO Management</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={activeTab === 'tracking' ? 'Search materials or PO number...' : 'Search POs...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {activeTab === 'tracking' && (
        <div className="space-y-6">
          {/* PO Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Purchase Orders Overview</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Project</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Material</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPOs.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">{po.po_number}</span>
                        <p className="text-xs text-gray-500">{po.po_date ? new Date(po.po_date).toLocaleDateString() : ''}</p>
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
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${po.material_status === 'completed' ? 'bg-green-100 text-green-700' : po.material_status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {po.material_status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.payment_status)}`}>
                          {po.payment_status?.toUpperCase() || 'PENDING'}
                        </span>
                        {po.balance_amount! > 0 && <p className="text-xs text-gray-600 mt-1">Bal: {formatCurrency(po.balance_amount)}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => handleView(po)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Material Tracking */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Material Tracking</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Item Description</th>
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
                    const progress = (track.quantity_received / track.quantity_ordered) * 100;
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
                            <div
                              className={`h-2 rounded-full ${progress === 100 ? 'bg-green-600' : progress > 0 ? 'bg-yellow-600' : 'bg-red-600'}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{progress.toFixed(0)}%</p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${track.status === 'completed' ? 'bg-green-100 text-green-700' : track.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {track.status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {track.quantity_pending > 0 && (
                            <button onClick={() => handleReceiveMaterial(track.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm">
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
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No tracking data</h3>
                <p className="text-gray-600">Material tracking will appear here once POs are created</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'management' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Project</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{po.po_number}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{po.vendors?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{po.projects?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{po.po_types?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{po.po_date ? new Date(po.po_date).toLocaleDateString() : ''}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{formatCurrency(po.grand_total)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>{po.status?.toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleView(po)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        {can('edit_pos') && po.status !== 'approved' && (
                          <button onClick={() => handleEdit(po)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition" title="Edit">
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {can('approve_pos') && po.status === 'pending' && (
                          <button onClick={() => handleApprove(po.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {can('approve_pos') && po.status === 'pending' && (
                          <button onClick={() => handleReject(po.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Reject">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {can('make_payments') && po.balance_amount! > 0 && po.status === 'approved' && (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setShowPaymentModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Make Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {can('delete_pos') && po.status === 'draft' && (
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
              <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Create PO" to get started'}</p>
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
                  <p className="text-sm text-gray-600">Amount</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedPO.grand_total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit Purchase Order</h2>
              <button onClick={() => setShowEditModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                  <select
                    value={editingPO.vendor_id}
                    onChange={(e) => setEditingPO({ ...editingPO, vendor_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={editingPO.project_id}
                    onChange={(e) => setEditingPO({ ...editingPO, project_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-yellow-600 text-white py-3 px-6 rounded-lg hover:bg-yellow-700 transition">
                  <Save className="w-5 h-5 inline mr-2" />
                  Save Changes
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Record Payment — {selectedPO.po_number}</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-600 hover:bg-gray-100 rounded p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">Balance: {formatCurrency(selectedPO.balance_amount)}</p>
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded border">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
