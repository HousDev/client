import { useState, useEffect } from 'react';
import { Users, FileText, Package, CreditCard, TrendingUp } from 'lucide-react';

type Vendor = { id: string; name: string; is_active?: boolean };
type PO = { id: string; po_number: string; status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'completed' | string; material_status?: string };
type Payment = { id: string; po_id?: string; amount?: number; due_date?: string; status?: 'pending' | 'paid' | 'overdue' | string };

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVendors: 0,
    activePOs: 0,
    pendingDeliveries: 0,
    overduePayments: 0,
  });
  const [loading, setLoading] = useState(true);

  // localStorage keys (so other demo screens can write to same keys)
  const KEY_VENDORS = 'mock_vendors_v1';
  const KEY_POS = 'mock_pos_v1';
  const KEY_PAYMENTS = 'mock_payments_v1';

  // default mock data used when localStorage is empty
  const defaultVendors: Vendor[] = [
    { id: 'v_1', name: 'Acme Supplies', is_active: true },
    { id: 'v_2', name: 'Builder Co', is_active: true },
    { id: 'v_3', name: 'Concrete Plus', is_active: false },
  ];

  const defaultPOs: PO[] = [
    { id: 'po_1', po_number: 'PO-1001', status: 'approved', material_status: 'partial' },
    { id: 'po_2', po_number: 'PO-1002', status: 'pending', material_status: 'pending' },
    { id: 'po_3', po_number: 'PO-1003', status: 'approved', material_status: 'completed' },
  ];

  const defaultPayments: Payment[] = [
    { id: 'pay_1', po_id: 'po_1', amount: 50000, due_date: '2025-11-01', status: 'paid' },
    { id: 'pay_2', po_id: 'po_2', amount: 75000, due_date: '2025-10-01', status: 'overdue' },
  ];

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    // simulate async fetch
    setTimeout(() => {
      try {
        const rawVendors = localStorage.getItem(KEY_VENDORS);
        const rawPOs = localStorage.getItem(KEY_POS);
        const rawPayments = localStorage.getItem(KEY_PAYMENTS);

        const vendors: Vendor[] = rawVendors ? JSON.parse(rawVendors) : defaultVendors;
        const pos: PO[] = rawPOs ? JSON.parse(rawPOs) : defaultPOs;
        const payments: Payment[] = rawPayments ? JSON.parse(rawPayments) : defaultPayments;

        // compute stats
        const totalVendors = vendors.length;
        const activePOs = pos.filter((p) => p.status === 'approved').length;
        // pending deliveries = POs with material_status not 'completed' (you can adapt logic)
        const pendingDeliveries = pos.filter((p) => p.material_status !== 'completed').length;
        const overduePayments = payments.filter((p) => p.status === 'overdue').length;

        setStats({ totalVendors, activePOs, pendingDeliveries, overduePayments });
      } catch (err) {
        console.error('Error loading dashboard mock data:', err);
        setStats({ totalVendors: 0, activePOs: 0, pendingDeliveries: 0, overduePayments: 0 });
      } finally {
        setLoading(false);
      }
    }, 250);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Vendors', value: stats.totalVendors, icon: Users, color: 'bg-blue-500' },
    { label: 'Active POs', value: stats.activePOs, icon: FileText, color: 'bg-green-500' },
    { label: 'Pending Deliveries', value: stats.pendingDeliveries, icon: Package, color: 'bg-orange-500' },
    { label: 'Overdue Payments', value: stats.overduePayments, icon: CreditCard, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Real Estate Management System (demo)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
              <div className={`${card.color} p-3 rounded-lg w-fit mb-4`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">System Overview</h2>
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            This is a frontend-only demo. Data is read from localStorage when available, otherwise sample data is shown.
            Use other demo screens (Vendors / POs / Payments) to populate localStorage and see these numbers update.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Refresh
            </button>
            <button
              onClick={() => {
                // clear demo data and reload defaults
                localStorage.removeItem(KEY_VENDORS);
                localStorage.removeItem(KEY_POS);
                localStorage.removeItem(KEY_PAYMENTS);
                loadDashboardData();
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
