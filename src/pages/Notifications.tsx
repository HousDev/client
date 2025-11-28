import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Notification {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const STORAGE_KEY = 'mock_notifications_v1';

  // sample notifications for demo/first-run
  const sampleNotifications: Notification[] = [
    {
      id: 'n_1',
      user_id: user?.id,
      type: 'po_delivery_due',
      title: 'PO Delivery Due Today',
      message: 'Materials for PO-1001 are due for delivery today.',
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      id: 'n_2',
      user_id: user?.id,
      type: 'payment_due',
      title: 'Payment Due in 3 days',
      message: 'Payment for PO-1002 is due in 3 days. Please schedule payment.',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'n_3',
      user_id: user?.id,
      type: 'payment_overdue',
      title: 'Overdue Payment',
      message: 'Payment for PO-0999 is overdue. Follow up with vendor.',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
  ];

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const loadNotifications = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let parsed: Notification[] = raw ? JSON.parse(raw) : [];

      // If none present, seed sample notifications (scoped to user if available)
      if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
        const seeded = sampleNotifications.map((n, i) => ({
          ...n,
          id: `n_seed_${i + 1}`,
          user_id: user?.id ?? n.user_id,
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
        parsed = seeded;
      }

      // If user is present, filter to that user; otherwise show all (demo mode)
      const result = user?.id ? parsed.filter((n) => !n.user_id || n.user_id === user.id) : parsed;
      // sort newest first
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setNotifications(result);
    } catch (err) {
      console.error('Error loading notifications (demo):', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const persistAll = (next: Notification[]) => {
    try {
      // Merge with existing storage while preserving other users' notifications
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: Notification[] = raw ? JSON.parse(raw) : [];
      // build map of ids to replace/create only those for current user (or all if no user)
      const nextMap = new Map(next.map((n) => [n.id, n]));
      const merged = existing.map((e) => (nextMap.has(e.id) ? nextMap.get(e.id)! : e));
      // add any new ids from next that didn't exist
      next.forEach((n) => {
        if (!merged.find((m) => m.id === n.id)) merged.push(n);
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      // update current view
      setNotifications(next.sort((a, b) => b.created_at.localeCompare(a.created_at)));
    } catch (err) {
      console.error('Error persisting notifications:', err);
    }
  };

  const markAsRead = (id: string) => {
    try {
      const next = notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
      persistAll(next);
    } catch (err) {
      console.error('Error marking notification as read (demo):', err);
    }
  };

  const markAllRead = () => {
    try {
      const next = notifications.map((n) => ({ ...n, is_read: true }));
      persistAll(next);
    } catch (err) {
      console.error('Error marking all as read (demo):', err);
    }
  };

  const dismiss = (id: string) => {
    if (!confirm('Dismiss this notification?')) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: Notification[] = raw ? JSON.parse(raw) : [];
      const filtered = existing.filter((n) => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setNotifications((cur) => cur.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error dismissing notification (demo):', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'po_delivery_due':
      case 'service_due':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'payment_due':
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case 'payment_overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'document_expiry':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'po_delivery_due':
        return 'bg-orange-50 border-orange-200';
      case 'payment_due':
        return 'bg-blue-50 border-blue-200';
      case 'payment_overdue':
        return 'bg-red-50 border-red-200';
      case 'document_expiry':
        return 'bg-yellow-50 border-yellow-200';
      case 'service_due':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">Stay updated with important alerts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadNotifications}
            className="px-3 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50"
            title="Refresh"
          >
            Refresh
          </button>
          <button
            onClick={markAllRead}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700"
            title="Mark all read"
          >
            Mark all read
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={`border rounded-xl p-4 ${getTypeColor(notif.type)} ${notif.is_read ? 'opacity-75' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getTypeIcon(notif.type)}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{notif.title}</h3>
                  <p className="text-gray-700 text-sm mt-1">{notif.message}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(notif.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition"
                      title="Mark as read"
                    >
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <button
                    onClick={() => dismiss(notif.id)}
                    className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition"
                    title="Dismiss"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
