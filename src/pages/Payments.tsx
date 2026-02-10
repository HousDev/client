import { useState, useEffect } from 'react';
import { CreditCard, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type Payment = {
  id: string;
  payment_number: string;
  amount: number;
  payment_date?: string;
  vendors?: { id?: string; name?: string };
  status?: 'pending' | 'paid' | 'verified' | 'overdue' | string;
  created_at?: string;
};

type PaymentTerm = {
  id: string;
  purchase_order_id?: string;
  stage_description?: string;
  amount: number;
  expected_date?: string;
  status?: 'due' | 'paid' | 'overdue' | 'not_due' | string;
  purchase_orders?: { vendors?: { name?: string }; po_number?: string };
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPaid: 0, totalPending: 0, totalOverdue: 0 });

  // localStorage keys
  const KEY_PAYMENTS = 'mock_payments_v1';
  const KEY_PAYMENT_TERMS = 'mock_payment_terms_v1';

  // default sample data
  const defaultPayments: Payment[] = [
    {
      id: 'pay_1',
      payment_number: 'P-1001',
      amount: 50000,
      payment_date: '2025-11-01',
      vendors: { id: 'v_1', name: 'Acme Supplies' },
      status: 'paid',
      created_at: new Date().toISOString(),
    },
    {
      id: 'pay_2',
      payment_number: 'P-1002',
      amount: 75000,
      payment_date: undefined,
      vendors: { id: 'v_2', name: 'Builder Co' },
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  const defaultPaymentTerms: PaymentTerm[] = [
    {
      id: 'term_1',
      purchase_order_id: 'po_1',
      stage_description: 'Advance - 30%',
      amount: 30000,
      expected_date: '2025-10-01',
      status: 'paid',
      purchase_orders: { vendors: { name: 'Acme Supplies' }, po_number: 'PO-1001' },
    },
    {
      id: 'term_2',
      purchase_order_id: 'po_2',
      stage_description: 'Final Payment',
      amount: 75000,
      expected_date: '2025-11-15',
      status: 'due',
      purchase_orders: { vendors: { name: 'Builder Co' }, po_number: 'PO-1002' },
    },
    {
      id: 'term_3',
      purchase_order_id: 'po_3',
      stage_description: 'Milestone 2',
      amount: 20000,
      expected_date: '2025-09-01',
      status: 'overdue',
      purchase_orders: { vendors: { name: 'Concrete Plus' }, po_number: 'PO-1003' },
    },
  ];

  useEffect(() => {
    loadPaymentData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPaymentData = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const rawPayments = localStorage.getItem(KEY_PAYMENTS);
        const rawTerms = localStorage.getItem(KEY_PAYMENT_TERMS);

        const ps: Payment[] = rawPayments ? JSON.parse(rawPayments) : defaultPayments;
        const terms: PaymentTerm[] = rawTerms ? JSON.parse(rawTerms) : defaultPaymentTerms;

        // normalize types
        const paymentsNormalized = ps.map((p) => ({ ...p }));
        const termsNormalized = terms.map((t) => ({ ...t }));

        setPayments(paymentsNormalized);
        setPaymentTerms(termsNormalized);

        computeStats(termsNormalized);
      } catch (err) {
        console.error('Error loading payments mock data:', err);
        setPayments([]);
        setPaymentTerms([]);
        setStats({ totalPaid: 0, totalPending: 0, totalOverdue: 0 });
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const persistPayments = (newPayments: Payment[]) => {
    localStorage.setItem(KEY_PAYMENTS, JSON.stringify(newPayments));
    setPayments(newPayments);
  };

  const persistPaymentTerms = (newTerms: PaymentTerm[]) => {
    localStorage.setItem(KEY_PAYMENT_TERMS, JSON.stringify(newTerms));
    setPaymentTerms(newTerms);
    computeStats(newTerms);
  };

  const computeStats = (terms: PaymentTerm[]) => {
    const paidTerms = terms.filter((t) => t.status === 'paid');
    const pendingTerms = terms.filter((t) => t.status === 'due' || t.status === 'not_due');
    const overdueTerms = terms.filter((t) => t.status === 'overdue');

    const totalPaid = paidTerms.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalPending = pendingTerms.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalOverdue = overdueTerms.reduce((sum, t) => sum + (t.amount || 0), 0);

    setStats({ totalPaid, totalPending, totalOverdue });
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

  const getStatusBadge = (status?: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      verified: 'bg-blue-100 text-blue-700',
      due: 'bg-orange-100 text-orange-700',
      overdue: 'bg-red-100 text-red-700',
      not_due: 'bg-gray-100 text-gray-700',
    };
    return (status && styles[status]) || 'bg-gray-100 text-gray-700';
  };

  // --- Actions (mock) ---
  const markPaymentAsPaid = (paymentId: string) => {
    const updated = payments.map((p) =>
      p.id === paymentId ? { ...p, status: 'paid', payment_date: new Date().toISOString() } : p
    );
    persistPayments(updated);
    toast.error('Payment marked as paid (mock).');
  };

  const verifyPayment = (paymentId: string) => {
    const updated = payments.map((p) => (p.id === paymentId ? { ...p, status: 'verified' } : p));
    persistPayments(updated);
    toast.error('Payment marked as verified (mock).');
  };

  const markTermAsPaid = (termId: string) => {
    const updated = paymentTerms.map((t) => (t.id === termId ? { ...t, status: 'paid' } : t));
    persistPaymentTerms(updated);
    toast.error('Payment term marked as paid (mock).');
  };

  const resetDemoData = () => {
    localStorage.removeItem(KEY_PAYMENTS);
    localStorage.removeItem(KEY_PAYMENT_TERMS);
    loadPaymentData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Payment Management</h1>
        <p className="text-gray-600 mt-1">Track all payments and payment terms</p>
      </div>

      <div className="flex gap-4">
        <button onClick={loadPaymentData} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Refresh
        </button>
        <button onClick={resetDemoData} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">
          Reset Demo Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="bg-orange-100 p-3 rounded-lg w-fit mb-4">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending</p>
          <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalPending)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Schedule</h2>
        <div className="space-y-3">
          {paymentTerms.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payment terms</p>
          ) : (
            paymentTerms.map((term) => (
              <div key={term.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-800">{term.stage_description}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(term.status)}`}>
                      {(term.status || 'not_due').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{term.purchase_orders?.vendors?.name || 'N/A'} • {term.purchase_orders?.po_number}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(term.amount)}</p>
                  {term.status !== 'paid' && (
                    <button
                      onClick={() => markTermAsPaid(term.id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Payments</h2>
        <div className="space-y-3">
          {payments.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No payments</p>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{payment.payment_number}</p>
                    <p className="text-sm text-gray-600">{payment.vendors?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <p className="text-lg font-bold text-gray-800">{formatCurrency(payment.amount)}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                      {(payment.status || 'pending').toUpperCase()}
                    </span>

                    {payment.status !== 'paid' && (
                      <button
                        onClick={() => markPaymentAsPaid(payment.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                      >
                        Mark Paid
                      </button>
                    )}

                    {payment.status === 'paid' && (
                      <button
                        onClick={() => verifyPayment(payment.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
