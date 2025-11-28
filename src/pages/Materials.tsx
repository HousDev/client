import { useState, useEffect } from 'react';
import { Package, AlertTriangle } from 'lucide-react';

interface DeliveryRow {
  id: string;
  po_number: string;
  item_name: string;
  vendor_name: string;
  ordered_quantity: number;
  delivered_quantity: number;
  pending_quantity: number;
  delivery_status: 'complete' | 'partial' | 'delayed' | 'pending' | string;
  delivery_date?: string;
  created_at?: string;
}

const STORAGE_KEY = 'mock_material_deliveries_v1';

export default function Materials() {
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeliveries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedIfEmpty = (): DeliveryRow[] => {
    const sample: DeliveryRow[] = [
      {
        id: 'd1',
        po_number: 'PO/2025/001',
        item_name: 'Cement Grade 43',
        vendor_name: 'Acme Cement Co.',
        ordered_quantity: 100,
        delivered_quantity: 100,
        pending_quantity: 0,
        delivery_status: 'complete',
        delivery_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
      {
        id: 'd2',
        po_number: 'PO/2025/002',
        item_name: 'Rebar TMT 12mm',
        vendor_name: 'SteelWorks Ltd.',
        ordered_quantity: 50,
        delivered_quantity: 20,
        pending_quantity: 30,
        delivery_status: 'partial',
        delivery_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
      {
        id: 'd3',
        po_number: 'PO/2025/003',
        item_name: 'Plywood 18mm',
        vendor_name: 'WoodSupply Pvt Ltd',
        ordered_quantity: 200,
        delivered_quantity: 0,
        pending_quantity: 200,
        delivery_status: 'delayed',
        delivery_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  };

  const loadDeliveries = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = seedIfEmpty();
        setDeliveries(seeded);
        setLoading(false);
        return;
      }
      const parsed: DeliveryRow[] = JSON.parse(raw);
      // sort by delivery_date desc if present, otherwise created_at
      parsed.sort((a, b) => {
        const aDate = a.delivery_date || a.created_at || '';
        const bDate = b.delivery_date || b.created_at || '';
        return bDate.localeCompare(aDate);
      });
      setDeliveries(parsed);
    } catch (err) {
      console.error('Error reading deliveries (demo):', err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const persist = (next: DeliveryRow[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setDeliveries(next);
    } catch (err) {
      console.error('Error saving deliveries (demo):', err);
    }
  };

  // helper to get status classes (keeps original mapping)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete':
        return 'bg-green-100 text-green-700';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700';
      case 'delayed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Optional: small helper to add a sample delivery (useful in a demo toolbar)
  const addSampleDelivery = () => {
    const id = `d_${Math.random().toString(36).slice(2, 9)}`;
    const newRow: DeliveryRow = {
      id,
      po_number: `PO/2025/${Math.floor(Math.random() * 900 + 100)}`,
      item_name: 'Sample Item',
      vendor_name: 'Demo Vendor',
      ordered_quantity: 10,
      delivered_quantity: 0,
      pending_quantity: 10,
      delivery_status: 'pending',
      delivery_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
    };
    const next = [newRow, ...deliveries];
    persist(next);
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Material Tracking</h1>
        <p className="text-gray-600 mt-1">Track all material deliveries and inventory</p>
      </div>

      {/* demo-only control (optional) */}
      <div className="flex gap-2">
        <button
          onClick={addSampleDelivery}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
        >
          Add Sample Delivery
        </button>
        <button
          onClick={() => {
            localStorage.removeItem(STORAGE_KEY);
            loadDeliveries();
          }}
          className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
        >
          Reset Demo Data
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Material</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ordered</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Delivered</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Pending</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-800">{delivery.po_number}</td>
                  <td className="px-6 py-4 text-gray-700">{delivery.item_name}</td>
                  <td className="px-6 py-4 text-gray-700">{delivery.vendor_name}</td>
                  <td className="px-6 py-4 text-gray-700">{delivery.ordered_quantity}</td>
                  <td className="px-6 py-4 text-gray-700">{delivery.delivered_quantity}</td>
                  <td className="px-6 py-4 text-gray-700">
                    {delivery.pending_quantity > 0 ? (
                      <span className="flex items-center gap-2 text-orange-600 font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        {delivery.pending_quantity}
                      </span>
                    ) : (
                      '0'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.delivery_status)}`}>
                      {delivery.delivery_status?.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deliveries.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No materials tracked</h3>
          </div>
        )}
      </div>
    </div>
  );
}
