import { useState, useEffect } from 'react';
import { Package, Calendar, CheckCircle, AlertCircle, Clock, Truck, FileText, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type PORef = { id: string; po_number?: string; vendors?: { name?: string }; projects?: { name?: string } };
type Material = {
  id: string;
  po_id: string;
  item_id?: string;
  item_description?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: 'pending' | 'partial' | 'completed' | 'cancelled';
  received_date?: string | null;
  received_by?: string | null;
  notes?: string | null;
  created_at?: string;
  purchase_orders?: PORef;
};

export default function MaterialsEnhanced() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receiveQuantity, setReceiveQuantity] = useState<number>(0);
  const [receiveNotes, setReceiveNotes] = useState<string>('');

  // localStorage key
  const KEY_MATERIALS = 'mock_po_materials_v1';
  const KEY_POS = 'mock_pos_minimal_v1';

  // default demo data (used when nothing in storage)
  const defaultPOs: PORef[] = [
    { id: 'po_1', po_number: 'PO-1001', vendors: { name: 'Acme Supplies' }, projects: { name: 'Site A' } },
    { id: 'po_2', po_number: 'PO-1002', vendors: { name: 'Builder Co' }, projects: { name: 'Site B' } },
  ];

  const defaultMaterials: Material[] = [
    {
      id: 'm_1',
      po_id: 'po_1',
      item_id: 'itm_001',
      item_description: 'Cement Bags',
      quantity_ordered: 100,
      quantity_received: 0,
      quantity_pending: 100,
      status: 'pending',
      received_date: null,
      created_at: new Date().toISOString(),
      purchase_orders: defaultPOs[0],
    },
    {
      id: 'm_2',
      po_id: 'po_2',
      item_id: 'itm_002',
      item_description: 'Steel Rods',
      quantity_ordered: 200,
      quantity_received: 100,
      quantity_pending: 100,
      status: 'partial',
      received_date: null,
      created_at: new Date().toISOString(),
      purchase_orders: defaultPOs[1],
    },
  ];

  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMaterials = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(KEY_MATERIALS);
        const rawPOs = localStorage.getItem(KEY_POS);
        const pos: PORef[] = rawPOs ? JSON.parse(rawPOs) : defaultPOs;

        let mats: Material[] = raw ? JSON.parse(raw) : [];
        if (!raw || !Array.isArray(mats) || mats.length === 0) {
          mats = defaultMaterials;
          localStorage.setItem(KEY_MATERIALS, JSON.stringify(mats));
          localStorage.setItem(KEY_POS, JSON.stringify(pos));
        }

        // Attach current PO refs where possible (in case user edited POs separately)
        mats = mats.map((m) => ({
          ...m,
          purchase_orders: pos.find((p) => p.id === m.po_id) ?? m.purchase_orders ?? { id: m.po_id, po_number: 'N/A' },
        }));

        // ensure numeric fields
        mats = mats.map((m) => ({
          ...m,
          quantity_ordered: Number(m.quantity_ordered || 0),
          quantity_received: Number(m.quantity_received || 0),
          quantity_pending:
            m.quantity_pending !== undefined ? Number(m.quantity_pending) : Number(m.quantity_ordered - (m.quantity_received || 0)),
        }));

        setMaterials(mats);
      } catch (err) {
        console.error('Error loading materials from localStorage:', err);
        setMaterials([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const persistMaterials = (newMaterials: Material[]) => {
    localStorage.setItem(KEY_MATERIALS, JSON.stringify(newMaterials));
    // keep newest first by created_at
    newMaterials.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    setMaterials(newMaterials);
  };

  const handleReceive = async () => {
    if (!selectedMaterial) return;
    if (receiveQuantity <= 0) {
      alert('Enter a valid quantity to receive.');
      return;
    }
    if (receiveQuantity > (selectedMaterial.quantity_pending || selectedMaterial.quantity_ordered)) {
      alert('Receive quantity cannot exceed pending quantity.');
      return;
    }

    // simulate async update
    setLoading(true);
    setTimeout(() => {
      try {
        const newMaterials = materials.map((m) => {
          if (m.id !== selectedMaterial.id) return m;
          const newReceived = (m.quantity_received || 0) + receiveQuantity;
          const newPending = Math.max(0, (m.quantity_ordered || 0) - newReceived);
          const newStatus: Material['status'] = newPending === 0 ? 'completed' : newReceived > 0 ? 'partial' : 'pending';
          return {
            ...m,
            quantity_received: newReceived,
            quantity_pending: newPending,
            status: newStatus,
            received_date: new Date().toISOString(),
            received_by: user?.id ?? null,
            notes: receiveNotes || m.notes || null,
          };
        });

        // persist
        persistMaterials(newMaterials);

        // After updating individual material(s), recompute per-PO summary if needed.
        // For demo, we won't persist a separate purchase_orders table; we just show alerts.
        // But we still compute status for each PO (not saved elsewhere here).
        // If you have a PO storage, you can update it similarly.

        alert('Material received successfully!');
        setShowReceiveModal(false);
        setSelectedMaterial(null);
        setReceiveQuantity(0);
        setReceiveNotes('');
      } catch (err) {
        console.error('Error receiving material (mock):', err);
        alert('Error receiving material');
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const getStatusColor = (status?: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-gray-100 text-gray-700',
      partial: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return (status && styles[status]) || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'partial':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const calculatePercentage = (received: number, ordered: number) => {
    return ordered > 0 ? Math.round((received / ordered) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Material Tracking</h1>
        <p className="text-gray-600 mt-1">Track material receipts and deliveries</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Items</p>
              <p className="text-3xl font-bold text-gray-800">{materials.length}</p>
            </div>
            <Package className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending</p>
              <p className="text-3xl font-bold text-gray-800">{materials.filter((m) => m.status === 'pending').length}</p>
            </div>
            <Clock className="w-12 h-12 text-gray-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Partial</p>
              <p className="text-3xl font-bold text-yellow-600">{materials.filter((m) => m.status === 'partial').length}</p>
            </div>
            <Truck className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{materials.filter((m) => m.status === 'completed').length}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Item</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ordered</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Received</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pending</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Progress</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {materials.map((material) => {
                const percentage = calculatePercentage(material.quantity_received || 0, material.quantity_ordered || 0);
                return (
                  <tr key={material.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{material.purchase_orders?.po_number || material.po_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{material.item_description}</p>
                      <p className="text-sm text-gray-500">{material.item_id}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{material.purchase_orders?.vendors?.name || '-'}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{material.quantity_ordered}</td>
                    <td className="px-6 py-4 font-medium text-green-600">{material.quantity_received || 0}</td>
                    <td className="px-6 py-4 font-medium text-orange-600">{material.quantity_pending || material.quantity_ordered}</td>
                    <td className="px-6 py-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{percentage}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(material.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(material.status)}`}>
                          {material.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {material.status !== 'completed' && material.status !== 'cancelled' && (
                        <button
                          onClick={() => {
                            setSelectedMaterial(material);
                            setShowReceiveModal(true);
                            setReceiveQuantity(material.quantity_pending || material.quantity_ordered);
                            setReceiveNotes('');
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
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

        {materials.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No materials to track</h3>
            <p className="text-gray-600">Materials from purchase orders will appear here</p>
          </div>
        )}
      </div>

      {/* Receive Material Modal */}
      {showReceiveModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-xl font-bold text-white">Receive Material</h3>
              <button
                onClick={() => {
                  setShowReceiveModal(false);
                  setSelectedMaterial(null);
                  setReceiveQuantity(0);
                  setReceiveNotes('');
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">PO Number</p>
                <p className="font-medium text-gray-800">{selectedMaterial.purchase_orders?.po_number || selectedMaterial.po_id}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Item</p>
                <p className="font-medium text-gray-800">{selectedMaterial.item_description}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">Ordered</p>
                  <p className="text-xl font-bold text-blue-700">{selectedMaterial.quantity_ordered}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">Received</p>
                  <p className="text-xl font-bold text-green-700">{selectedMaterial.quantity_received || 0}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-xs text-orange-600 mb-1">Pending</p>
                  <p className="text-xl font-bold text-orange-700">{selectedMaterial.quantity_pending || selectedMaterial.quantity_ordered}</p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Receiving <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={receiveQuantity}
                  onChange={(e) => setReceiveQuantity(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  min="0"
                  max={selectedMaterial.quantity_pending || selectedMaterial.quantity_ordered}
                  step="1"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={receiveNotes}
                  onChange={(e) => setReceiveNotes(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Any notes about this receipt..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleReceive}
                  disabled={
                    receiveQuantity <= 0 ||
                    receiveQuantity > (selectedMaterial.quantity_pending || selectedMaterial.quantity_ordered)
                  }
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Receipt
                </button>
                <button
                  onClick={() => {
                    setShowReceiveModal(false);
                    setSelectedMaterial(null);
                    setReceiveQuantity(0);
                    setReceiveNotes('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
