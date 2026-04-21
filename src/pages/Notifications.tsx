import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  CheckCheck,
  X,
  Filter,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import NotificationsApi from "../lib/notificationApi";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import socket from "../lib/socket";

interface NotificationType {
  id: number;
  title: string;
  description: string;
  type: string;
  seen: boolean;
  created_at: string;
}

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    NotificationType[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    critical: 0,
  });

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  useEffect(() => {
    filterNotifications();
    updateStats();
  }, [notifications, startDate, endDate, typeFilter, statusFilter, searchTerm]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result: any = await NotificationsApi.getNotifications();
      console.log("from notification component", result);
      setNotifications(result.data || []);
      setFilteredNotifications(result.data || []);
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifications([]);
      setFilteredNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(); // initial load

    socket.on("notifications_updated", () => {
      console.log("Socket: notifications updated");
      loadNotifications();
    });

    return () => {
      socket.off("notifications_updated");
    };
  }, []);

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Date filter
    if (startDate) {
      filtered = filtered.filter((notif) => {
        const notifDate = new Date(notif.created_at);
        return notifDate >= startDate;
      });
    }

    if (endDate) {
      filtered = filtered.filter((notif) => {
        const notifDate = new Date(notif.created_at);
        const adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        return notifDate <= adjustedEndDate;
      });
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((notif) => notif.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((notif) =>
        statusFilter === "read" ? notif.seen : !notif.seen,
      );
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (notif) =>
          notif.title.toLowerCase().includes(term) ||
          notif.description.toLowerCase().includes(term),
      );
    }

    setFilteredNotifications(filtered);
  };

  const updateStats = () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const stats = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.seen).length,
      today: notifications.filter((n) => {
        const notifDate = new Date(n.created_at);
        return notifDate >= todayStart;
      }).length,
      critical: notifications.filter(
        (n) => n.type === "payment_overdue" || n.type === "document_expiry",
      ).length,
    };

    setStats(stats);
  };

  const markAsRead = async (id: number) => {
    try {
      const marked = await NotificationsApi.markAsSeen(id);
      if (marked.success) {
        loadNotifications();
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const result = await NotificationsApi.markAllAsSeen();
      if (result.success) {
        loadNotifications();
      }
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const dismiss = async (id: number) => {
    try {
      const result = await NotificationsApi.deleteNotification(id);
      if (result.success) {
        loadNotifications();
      }
    } catch (err) {
      console.error("Error dismissing notification:", err);
    }
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setTypeFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    setShowFilter(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "po_delivery_due":
      case "service_due":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "payment_due":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "payment_overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "document_expiry":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "po_delivery_due":
        return "border-l-orange-500 bg-gradient-to-r from-orange-50/50 to-white";
      case "payment_due":
        return "border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white";
      case "payment_overdue":
        return "border-l-red-500 bg-gradient-to-r from-red-50/50 to-white";
      case "document_expiry":
        return "border-l-yellow-500 bg-gradient-to-r from-yellow-50/50 to-white";
      case "service_due":
        return "border-l-purple-500 bg-gradient-to-r from-purple-50/50 to-white";
      default:
        return "border-l-gray-500 bg-gradient-to-r from-gray-50/50 to-white";
    }
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-red-600 mx-auto mb-3" />
          <p className="text-gray-600 font-medium text-sm">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=" bg-gray-50">
      <div className="max-w-7xl mx-auto px-0">
        {/* Header with Search and Filters */}
        <div className="sticky top-20 z-10 p-2">
          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Filter Toggle Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition ${
                    showFilter
                      ? "bg-red-50 text-red-700 border-red-200"
                      : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {showFilter ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={loadNotifications}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={markAllRead}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Mark All Read</span>
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilter && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Date Range Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      From Date
                    </label>
                    <DatePicker
                      selected={startDate}
                      onChange={(date: any) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Select start date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      To Date
                    </label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: any) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined}
                      placeholderText="Select end date"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="po_delivery_due">PO Delivery Due</option>
                      <option value="payment_due">Payment Due</option>
                      <option value="payment_overdue">Payment Overdue</option>
                      <option value="document_expiry">Document Expiry</option>
                      <option value="service_due">Service Due</option>
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="sticky top-32 z-10 p-2">
          <div className="overflow-y-auto max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-210px)]">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-4">
                  <Bell className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {notifications.length === 0
                    ? "You're all caught up! Check back later for new updates."
                    : "No notifications match your filters. Try changing your search criteria."}
                </p>
                {(startDate ||
                  endDate ||
                  typeFilter !== "all" ||
                  statusFilter !== "all" ||
                  searchTerm) && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
                  >
                    <X className="w-4 h-4" />
                    Clear filters to see all notifications
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`relative border-4 border-gray-200 rounded-lg p-3 transition-all duration-200 ${
                      notif.seen
                        ? getTypeColor(notif.type)
                        : "border-l-red-500 bg-gradient-to-r from-red-50/50 to-white"
                    } ${notif.seen ? "opacity-80" : "shadow-sm"}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1 p-2 bg-white rounded-md shadow-xs">
                        {getTypeIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3
                              className={`font-semibold text-sm mb-1 ${notif.seen ? "text-gray-700" : "text-gray-900"}`}
                            >
                              {notif.title}
                              {!notif.seen && (
                                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                              )}
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed mb-2">
                              {notif.description}
                            </p>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex items-center gap-1">
                            {!notif.seen && (
                              <button
                                onClick={() => markAsRead(notif.id)}
                                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => dismiss(notif.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                              title="Dismiss"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${
                                notif.type === "payment_overdue"
                                  ? "bg-red-100 text-red-700"
                                  : notif.type === "document_expiry"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : notif.type === "payment_due"
                                      ? "bg-blue-100 text-blue-700"
                                      : notif.type === "po_delivery_due"
                                        ? "bg-orange-100 text-orange-700"
                                        : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {getTypeLabel(notif.type)}
                            </span>

                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                notif.seen
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {notif.seen ? "Read" : "Unread"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            <span>
                              {new Date(notif.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Active Filters Info */}
            {(startDate ||
              endDate ||
              typeFilter !== "all" ||
              statusFilter !== "all" ||
              searchTerm) &&
              filteredNotifications.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-blue-800">
                    <span className="font-medium">Active filters:</span>
                    {startDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs">
                        <Calendar className="w-3 h-3" />
                        From: {startDate.toLocaleDateString()}
                      </span>
                    )}
                    {endDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded text-xs">
                        <Calendar className="w-3 h-3" />
                        To: {endDate.toLocaleDateString()}
                      </span>
                    )}
                    {typeFilter !== "all" && (
                      <span className="px-2 py-1 bg-white rounded text-xs">
                        Type: {getTypeLabel(typeFilter)}
                      </span>
                    )}
                    {statusFilter !== "all" && (
                      <span className="px-2 py-1 bg-white rounded text-xs">
                        Status: {statusFilter === "read" ? "Read" : "Unread"}
                      </span>
                    )}
                    {searchTerm && (
                      <span className="px-2 py-1 bg-white rounded text-xs">
                        Search: "{searchTerm}"
                      </span>
                    )}
                    <button
                      onClick={clearFilters}
                      className="ml-auto flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
