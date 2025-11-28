import { useState, useEffect } from 'react';
import {
  CreditCard,
  Clock,
  AlertCircle,
  CheckCircle,
  Plus,
  X,
  Bell,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type PO = {
  id: string;
  po_number: string;
  vendors?: { id?: string; name?: string };
  po_date?: string;
  grand_total: number;
  total_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  validity_date?: string;
  status?: string;
};

type POPayment = {
  id: string;
  po_id: string;
  amount: number;
  payment_method?: string;
  reference_number?: string;
  payment_date?: string;
  status?: string;
  created_by?: string | null;
  purchase_orders?: PO;
};

type POReminder = {
  id: string;
  po_payment_id: string;
  reminder_date: string;
  reminder_type?: string;
  status?: string;
  po_payments?: POPayment;
};

export default function PaymentsEnhanced() {
  const { user, profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'payments' | 'reminders'>('payments');
  const [pos, setPOs] = useState<PO[]>([]);
  const [payments, setPayments] = useState<POPayment[]>([]);
  const [reminders, setReminders] = useState<POReminder[]>([]);
  const [loading, setLoading] = useState(true);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    payment_method: 'bank_transfer',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedPaymentForReminder, setSelectedPaymentForReminder] = useState<POPayment | null>(null);

  const [stats, setStats] = useState({ totalPaid: 0, totalPending: 0, totalOverdue: 0 });

  // localStorage keys
  const KEY_POS = 'mock_pos_v1';
  const KEY_PAYMENTS = 'mock_po_payments_v1';
  const KEY_REMINDERS = 'mock_po_payment_reminders_v1';

  // default sample data
  const defaultPOs: PO[] = [
    {
      id: 'po_1',
      po_number: 'PO-1001',
      vendors: { id: 'v_1', name: 'Acme Supplies' },
      po_date: '2025-10-01',
      grand_total: 150000,
      total_paid: 50000,
      balance_amount: 100000,
      payment_status: 'partial',
      validity_date: '2025-12-01',
      status: 'approved',
    },
    {
      id: 'po_2',
      po_number: 'PO-1002',
      vendors: { id: 'v_2', name: 'Builder Co' },
      po_date: '2025-09-15',
      grand_total: 80000,
      total_paid: 0,
      balance_amount: 80000,
      payment_status: 'pending',
      validity_date: '2025-11-01',
      status: 'approved',
    },
  ];

  const defaultPayments: POPayment[] = [
    {
      id: 'p_1',
      po_id: 'po_1',
      amount: 50000,
      payment_method: 'bank_transfer',
      reference_number: 'TXN001',
      payment_date: '2025-10-05',
      status: 'paid',
      created_by: 'system',
      purchase_orders: defaultPOs[0],
    },
  ];

  const defaultReminders: POReminder[] = [
    {
      id: 'r_1',
      po_payment_id: 'p_2',
      reminder_date: new Date().toISOString().split('T')[0],
      reminder_type: 'email',
      status: 'pending',
      po_payments: undefined,
    },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    // when payments/POs change, recalc stats
    calculateStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, payments]);

  // permission helper: admin or profile.permissions object (if present)
  const can = (permission: string) => {
    if (profile?.role === 'admin') return true;
    // support different profile shapes
    if ((profile as any)?.permissions && typeof (profile as any).permissions === 'object') {
      return Boolean((profile as any).permissions[permission]);
    }
    return false;
  };

  const loadData = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        // load or initialize POs
        const rawPos = localStorage.getItem(KEY_POS);
        const storedPos: PO[] = rawPos ? JSON.parse(rawPos) : defaultPOs;
        // ensure numeric fields
        const normalizedPos = storedPos.map((p) => ({
          ...p,
          grand_total: Number(p.grand_total || 0),
          total_paid: Number(p.total_paid || 0),
          balance_amount: Number(p.balance_amount || p.grand_total - (p.total_paid || 0)),
        }));

        // load or initialize payments
        const rawPayments = localStorage.getItem(KEY_PAYMENTS);
        const storedPayments: POPayment[] = rawPayments ? JSON.parse(rawPayments) : defaultPayments;

        // attach purchase_orders reference in payments where possible
        const paymentsWithPO = storedPayments.map((pay) => ({
          ...pay,
          purchase_orders: normalizedPos.find((p) => p.id === pay.po_id) ?? pay.purchase_orders,
        }));

        // load or initialize reminders
        const rawReminders = localStorage.getItem(KEY_REMINDERS);
        const storedReminders: POReminder[] = rawReminders ? JSON.parse(rawReminders) : defaultReminders;

        // attach po_payments to reminders when possible
        const remindersWithPayments = storedReminders.map((r) => ({
          ...r,
          po_payments: paymentsWithPO.find((p) => p.id === r.po_payment_id) ?? r.po_payments,
        }));

        setPOs(normalizedPos);
        setPayments(paymentsWithPO);
        setReminders(remindersWithPayments);
      } catch (err) {
        console.error('Error loading demo data:', err);
        setPOs([]);
        setPayments([]);
        setReminders([]);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const persistPOs = (newPOs: PO[]) => {
    localStorage.setItem(KEY_POS, JSON.stringify(newPOs));
    setPOs(newPOs);
  };

  const persistPayments = (newPayments: POPayment[]) => {
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(newPayments));
    setPayments(newPayments);
  };

  const persistReminders = (newReminders: POReminder[]) => {
    localStorage.setItem(KEY_REMINDERS, JSON.stringify(newReminders));
    setReminders(newReminders);
  };

  const calculateStats = () => {
    const totalPaid =
      payments.filter((p) => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0) || 0;
    const totalPending = pos.filter((po) => (po.balance_amount || 0) > 0).reduce((s, po) => s + (po.balance_amount || 0), 0) || 0;
    const totalOverdue =
      pos
        .filter((po) => {
          const dueDate = po.validity_date || po.po_date;
          return (po.balance_amount || 0) > 0 && dueDate && new Date(dueDate) < new Date();
        })
        .reduce((s, po) => s + (po.balance_amount || 0), 0) || 0;

    setStats({ totalPaid, totalPending, totalOverdue });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);

  // --- Actions (mock localStorage) ---

  const openPaymentModal = (po: PO) => {
    setSelectedPO(po);
    setPaymentData({
      ...paymentData,
      amount: po.balance_amount || po.grand_total,
      payment_date: new Date().toISOString().split('T')[0],
    });
    setShowPaymentModal(true);
  };

  const handleMakePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;
    if (!can('make_payments')) {
      alert('You do not have permission to make payments');
      return;
    }
    if (paymentData.amount <= 0) {
      alert('Enter a valid amount');
      return;
    }

    // create payment record
    const newPayment: POPayment = {
      id: `p_${Date.now().toString(36)}`,
      po_id: selectedPO.id,
      amount: Number(paymentData.amount),
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number || undefined,
      payment_date: paymentData.payment_date,
      status: 'paid',
      created_by: user?.id ?? null,
      purchase_orders: selectedPO,
    };

    const newPayments = [newPayment, ...payments];
    persistPayments(newPayments);

    // update PO totals
    const newTotalPaid = (selectedPO.total_paid || 0) + newPayment.amount;
    const newBalance = Math.max(0, (selectedPO.grand_total || 0) - newTotalPaid);
    const newStatus = newBalance === 0 ? 'paid' : newTotalPaid > 0 ? 'partial' : 'pending';

    const updatedPOs = pos.map((p) => (p.id === selectedPO.id ? { ...p, total_paid: newTotalPaid, balance_amount: newBalance, payment_status: newStatus } : p));
    persistPOs(updatedPOs);

    alert('Payment recorded successfully (demo).');
    setShowPaymentModal(false);
    setSelectedPO(null);
    setPaymentData({
      amount: 0,
      payment_method: 'bank_transfer',
      reference_number: '',
      payment_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    calculateStats();
  };

  const openReminderModal = (payment?: POPayment) => {
    setSelectedPaymentForReminder(payment ?? null);
    setReminderDate(new Date().toISOString().split('T')[0]);
    setShowReminderModal(true);
  };

  const handleCreateReminder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedPaymentForReminder) {
      alert('Select a payment to create reminder for');
      return;
    }
    const newReminder: POReminder = {
      id: `r_${Date.now().toString(36)}`,
      po_payment_id: selectedPaymentForReminder.id,
      reminder_date: reminderDate,
      reminder_type: 'email',
      status: 'pending',
      po_payments: selectedPaymentForReminder,
    };
    const updated = [newReminder, ...reminders];
    persistReminders(updated);
    alert('Reminder created (demo).');
    setShowReminderModal(false);
    setSelectedPaymentForReminder(null);
  };

  const markReminderSent = (reminderId: string) => {
    const updated = reminders.map((r) => (r.id === reminderId ? { ...r, status: 'sent' } : r));
    persistReminders(updated);
    alert('Reminder marked as sent (demo).');
  };

  // small helpers
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      partial: 'bg-orange-100 text-orange-700',
    };
    return (status && colors[status]) || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
          <p className="text-gray-600 mt-1">Manage PO payments and reminders (demo)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalPending)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'payments' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <DollarSign className="w-5 h-5" />
              <span>PO Payments</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 px-6 py-4 font-medium transition ${activeTab === 'reminders' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Bell className="w-5 h-5" />
              <span>Payment Reminders</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Pending Payments</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Total Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Paid</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Balance</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pos.filter((po) => (po.balance_amount || 0) > 0).map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">{po.po_number}</span>
                        <p className="text-xs text-gray-500">{po.po_date ? new Date(po.po_date).toLocaleDateString() : ''}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{po.vendors?.name}</td>
                      <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(po.grand_total)}</td>
                      <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(po.total_paid || 0)}</td>
                      <td className="px-6 py-4 text-orange-600 font-bold">{formatCurrency(po.balance_amount || 0)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.payment_status)}`}>
                          {(po.payment_status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {can('make_payments') && (
                            <button
                              onClick={() => openPaymentModal(po)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                            >
                              <DollarSign className="w-4 h-4" />
                              Pay
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Method</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Reference</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Reminder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">{payment.purchase_orders?.po_number || payment.po_id}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{payment.purchase_orders?.vendors?.name || '-'}</td>
                      <td className="px-6 py-4 font-semibold text-green-600">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-gray-700">{(payment.payment_method || '').replace('_', ' ').toUpperCase() || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{payment.reference_number || 'N/A'}</td>
                      <td className="px-6 py-4 text-gray-700">{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {(payment.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openReminderModal(payment)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition flex items-center gap-2"
                          >
                            <Bell className="w-4 h-4" />
                            Remind
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Payment Reminders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Due Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Reminder Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reminders.map((reminder) => (
                  <tr key={reminder.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">{reminder.po_payments?.purchase_orders?.po_number || '-'}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{reminder.po_payments?.purchase_orders?.vendors?.name || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{formatCurrency(reminder.po_payments?.amount || 0)}</td>
                    <td className="px-6 py-4 text-gray-700">{reminder.po_payments?.payment_date ? new Date(reminder.po_payments.payment_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{reminder.reminder_date ? new Date(reminder.reminder_date).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reminder.status)}`}>
                        {(reminder.status || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {reminder.status !== 'sent' && (
                          <button
                            onClick={() => markReminderSent(reminder.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                          >
                            Mark Sent
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Record Payment</h2>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPO(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleMakePayment} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">PO Number</p>
                <p className="font-bold text-gray-800">{selectedPO.po_number}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Vendor</p>
                <p className="font-medium text-gray-800">{selectedPO.vendors?.name}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Balance Amount</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(selectedPO.balance_amount || 0)}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: Number(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  min="0.01"
                  max={selectedPO.balance_amount}
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="cash">Cash</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reference Number</label>
                <input
                  type="text"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="Transaction reference"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5" /> Record Payment
                </button>
                <button type="button" onClick={() => { setShowPaymentModal(false); setSelectedPO(null); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create Reminder</h2>
              <button
                onClick={() => {
                  setShowReminderModal(false);
                  setSelectedPaymentForReminder(null);
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCreateReminder(); }} className="p-6">
              <div className="mb-4">
                <label className="block text-sm text-gray-600 mb-2">Payment</label>
                <div className="font-medium text-gray-800">{selectedPaymentForReminder ? `${selectedPaymentForReminder.purchase_orders?.po_number || selectedPaymentForReminder.po_id} — ${formatCurrency(selectedPaymentForReminder.amount)}` : 'Select a payment'}</div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Date</label>
                <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium"><Bell className="w-5 h-5" /> Create Reminder</button>
                <button type="button" onClick={() => { setShowReminderModal(false); setSelectedPaymentForReminder(null); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
