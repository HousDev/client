// Dashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  FileText,
  Package,
  TrendingUp,
  ShoppingCart,
  CreditCard,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Zap,
  DollarSign,
  Building2,
  UserPlus,
  Truck,
  PieChart as PieChartIcon,
  BarChart3,
  IndianRupee,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";

// API Imports
import poApi from "../lib/poApi";
import vendorApi from "../lib/vendorApi";
import inventoryApi from "../lib/inventoryApi";
import RequestMaterialApi from "../lib/requestMaterialApi";
import projectApi from "../lib/projectApi";
import employeeApi from "../lib/employeeApi";
import serviceOrderApi from "../lib/serviceOrderApi";

// ==================== TYPES ====================
interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  totalPOs: number;
  approvedPOs: number;
  pendingPOs: number;
  totalPOValue: number;
  totalPaidAmount: number;
  pendingPaymentAmount: number;
  totalWorkOrders: number;
  activeWorkOrders: number;
  totalEmployees: number;
  activeEmployees: number;
  totalProjects: number;
  ongoingProjects: number;
  totalInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalMaterialRequests: number;
  approvedRequests: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

// ==================== API SERVICE LAYER ====================
class DashboardApiService {
  static async fetchAllData() {
    try {
      const [
        posRes,
        vendorsRes,
        inventoryRes,
        requestsRes,
        projectsRes,
        employeesRes,
        workOrdersRes,
      ]: any = await Promise.allSettled([
        poApi.getPOs(),
        vendorApi.getVendors(),
        inventoryApi.getInventory(),
        RequestMaterialApi.getAll(),
        projectApi.getProjects(),
        employeeApi.getEmployees(),
        serviceOrderApi.getAll(),
      ]);

      console.log(
        "pos",
        posRes,
        "vendor",
        vendorsRes,
        "inventory",
        inventoryRes,
        "reqquest",
        requestsRes,
        "project",
        projectsRes,
        "employee",
        employeesRes,
        "workd",
        workOrdersRes,
      );

      return {
        purchaseOrders: posRes.status === "fulfilled" ? posRes.value : [],
        vendors: vendorsRes.status === "fulfilled" ? vendorsRes.value : [],
        inventory:
          inventoryRes.status === "fulfilled" ? inventoryRes.value : [],
        materialRequests:
          requestsRes.status === "fulfilled" ? requestsRes.value : [],
        projects:
          projectsRes.status === "fulfilled" ? projectsRes.value.data : [],
        employees:
          employeesRes.status === "fulfilled" ? employeesRes.value : [],
        workOrders:
          workOrdersRes.status === "fulfilled" ? workOrdersRes.value : [],
      };
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      throw error;
    }
  }
}

// ==================== UTILITY FUNCTIONS ====================
const formatCurrency = (amount: number): string => {
  if (!amount || isNaN(amount)) return "₹0";
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
};

const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-700",
    pending_approval: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    authorize: "bg-blue-100 text-blue-700",
    authorised: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-purple-100 text-purple-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
  };
  return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

const getPaymentStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: "bg-red-100 text-red-700",
    partial: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    completed: "bg-green-100 text-green-700",
    success: "bg-green-100 text-green-700",
  };
  return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

// ==================== SUBCOMPONENTS ====================

// Loading Skeleton
const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 pb-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
      {[...Array(7)].map((_, i) => (
        <div
          key={i}
          className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-8 h-4 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-7 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
      <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="h-64 bg-gray-100 rounded"></div>
      </div>
    </div>
  </div>
);

// Summary Card Component
interface SummaryCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  trend?: "up" | "down";
  trendValue?: string;
  subtext?: string;
  onClick?: () => void;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  trendValue,
  subtext,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={`bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group ${onClick ? "cursor-pointer" : ""}`}
  >
    <div className="flex justify-between items-start mb-3">
      <div
        className={`${bgColor} ${color} p-2.5 rounded-lg group-hover:scale-110 transition-transform duration-200`}
      >
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}
        >
          <span>{trend === "up" ? "↑" : "↓"}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
    <p className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">
      {label}
    </p>
    <h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
    {subtext && <p className="text-xs text-gray-400 truncate">{subtext}</p>}
  </div>
);

// Chart Card Component
interface ChartCardProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  icon: Icon,
  children,
  action,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {action}
    </div>
    <div className="p-6">{children}</div>
  </div>
);

// Activity Table Component
interface ActivityTableProps {
  title: string;
  icon: React.ElementType;
  columns: string[];
  data: any[];
  renderRow: (item: any, index: number) => React.ReactNode;
  action?: React.ReactNode;
  onRowClick?: (item: any) => void;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
  title,
  icon: Icon,
  columns,
  data,
  renderRow,
  action,
  onRowClick,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>
      {action}
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item, idx) => (
            <tr
              key={idx}
              onClick={() => onRowClick?.(item)}
              className={`hover:bg-gray-50 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {renderRow(item, idx)}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-gray-400 text-sm"
              >
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Quick Action Button
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
  color: string;
}

const QuickActionButton: React.FC<QuickActionProps> = ({
  icon: Icon,
  label,
  description,
  onClick,
  color,
}) => (
  <button
    onClick={onClick}
    className="bg-white p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all text-left group"
  >
    <div
      className={`${color} p-2 rounded-lg w-fit mb-3 group-hover:scale-110 transition-transform`}
    >
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-sm font-semibold text-gray-800">{label}</p>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
  </button>
);

type DashboardProps = {
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const Dashboard = ({ setActiveTab }: DashboardProps) => {
  const { can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeVendors: 0,
    totalPOs: 0,
    approvedPOs: 0,
    pendingPOs: 0,
    totalPOValue: 0,
    totalPaidAmount: 0,
    pendingPaymentAmount: 0,
    totalWorkOrders: 0,
    activeWorkOrders: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalProjects: 0,
    ongoingProjects: 0,
    totalInventoryItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalMaterialRequests: 0,
    approvedRequests: 0,
  });

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [materialRequests, setMaterialRequests] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Chart Data States
  const [poVsPaymentData, setPoVsPaymentData] = useState<ChartDataPoint[]>([]);
  const [workOrderStatusData, setWorkOrderStatusData] = useState<any[]>([]);
  const [monthlyExpenseData, setMonthlyExpenseData] = useState<any[]>([]);

  // Fetch all dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data: any = await DashboardApiService.fetchAllData();

      // Process Purchase Orders
      const pos = data.purchaseOrders || [];
      setPurchaseOrders(pos.slice(0, 5));

      const totalPOValue = pos.reduce(
        (sum: number, po: any) => sum + (Number(po.grand_total) || 0),
        0,
      );
      const totalPaidAmount = pos.reduce(
        (sum: number, po: any) => sum + (po.total_paid || 0),
        0,
      );
      const pendingPaymentAmount = pos.reduce((sum: number, po: any) => {
        const balance = (po.grand_total || 0) - (po.total_paid || 0);
        return sum + (balance > 0 ? balance : 0);
      }, 0);

      // Process Vendors
      const vendors = data.vendors || [];
      const activeVendors = vendors.filter(
        (v: any) => v.is_active !== false,
      ).length;

      // Process Inventory
      const inventory = data.inventory || [];
      let lowStock = 0;
      let outOfStock = 0;
      inventory.forEach((item: any) => {
        const qty = item.quantity || item.quantity_available || 0;
        const minQty = item.reorder_qty || item.minimum_quantity || 1;
        if (qty === 0) outOfStock++;
        else if (qty < minQty) lowStock++;
      });

      // Process Material Requests
      const requests = data.materialRequests || [];
      const approvedRequests = requests.filter(
        (r: any) => r.status === "approved",
      ).length;

      // Process Projects
      const projects = data.projects || [];
      console.log(projects);
      const ongoingProjects = projects.filter((p: any) => {
        if (!p.end_date) return true;
        return new Date(p.end_date) > new Date();
      }).length;

      // Process Employees
      const employees = data.employees || [];
      const activeEmployees = employees.filter(
        (e: any) => e.status !== "inactive",
      ).length;

      // Process Work Orders
      const wos = data.workOrders || [];
      setWorkOrders(wos.slice(0, 5));
      const activeWorkOrders = wos.filter(
        (wo: any) => wo.status === "in_progress" || wo.status === "active",
      ).length;

      console.log(wos);

      // Update Stats
      setStats({
        totalVendors: vendors.length,
        activeVendors,
        totalPOs: pos.length,
        approvedPOs: pos.filter(
          (p: any) => p.status === "approved" || p.status === "authorize",
        ).length,
        pendingPOs: pos.filter(
          (p: any) =>
            p.status === "pending" ||
            p.status === "pending_approval" ||
            p.status === "draft",
        ).length,
        totalPOValue,
        totalPaidAmount,
        pendingPaymentAmount,
        totalWorkOrders: wos.length,
        activeWorkOrders,
        totalEmployees: employees.length,
        activeEmployees,
        totalProjects: projects.length,
        ongoingProjects,
        totalInventoryItems: inventory.length,
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        totalMaterialRequests: requests.length,
        approvedRequests,
      });

      // Process Payments for table (from PO payments)
      let allPayments: any[] = [];
      try {
        const poPaymentsRes: any = await import("../lib/poPaymentApi").then(
          (m) => m.default.getPaymentsHistory(),
        );
        allPayments = poPaymentsRes || [];
      } catch {
        // Generate mock payments from POs
        allPayments = pos.slice(0, 5).map((po: any, idx: number) => ({
          id: `pay_${idx}`,
          payment_number: `PAY/${new Date().getFullYear()}/${String(idx + 1).padStart(3, "0")}`,
          po_number: po.po_number,
          vendor_name: po.vendors?.name || po.vendor_name || "N/A",
          amount: po.total_paid || po.grand_total * 0.3,
          payment_date: new Date().toISOString().split("T")[0],
          status: po.payment_status === "paid" ? "completed" : "pending",
        }));
      }
      setPayments(allPayments.slice(0, 5));

      // Process Material Requests
      setMaterialRequests(requests.slice(0, 5));

      // Generate Chart Data
      generateChartData(pos, wos, allPayments);

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const generateChartData = (pos: any[], wos: any[], payments: any[]) => {
    // Monthly PO vs Payment data (last 6 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const poByMonth: any = months.map((month, idx) => ({
      name: month,
      purchaseOrders: pos.filter((po: any) => {
        const poDate = po.po_date ? new Date(po.po_date) : null;
        return poDate && poDate.getMonth() === idx;
      }).length,
      payments: payments.filter((p: any) => {
        const payDate = p.payment_date ? new Date(p.payment_date) : null;
        return payDate && payDate.getMonth() === idx;
      }).length,
    }));
    setPoVsPaymentData(poByMonth);

    // Work Order Status Distribution
    const statusCount: Record<string, number> = {};
    wos.forEach((wo: any) => {
      const status = wo.status || "pending";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });
    const statusColors: Record<string, string> = {
      in_progress: "#3b82f6",
      active: "#3b82f6",
      pending: "#f59e0b",
      authorize: "#3cb371",
      approved: "#ffa500",
      pending_approval: "#f59e0b",
      completed: "#10b981",
      on_hold: "#ef4444",
      draft: "#9ca3af",
    };
    setWorkOrderStatusData(
      Object.entries(statusCount).map(([name, value]) => ({
        name: name.replace("_", " ").toUpperCase(),
        value,
        color: statusColors[name] || "#6b7280",
      })),
    );

    // Monthly Expenses (from PO values)
    const monthlyExpenses = months.map((month, idx) => ({
      month,
      expenses: pos
        .filter((po: any) => {
          const poDate = po.po_date ? new Date(po.po_date) : null;
          return poDate && poDate.getMonth() === idx;
        })
        .reduce((sum: number, po: any) => sum + (po.grand_total || 0), 0),
    }));
    setMonthlyExpenseData(monthlyExpenses);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = () => {
    fetchDashboardData();
  };

  // Navigation handlers
  const navigateTo = (path: string) => {
    window.location.href = path;
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <div className="text-xs text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {can("view_pos") && (
          <SummaryCard
            label="Total POs"
            value={stats.totalPOs}
            icon={FileText}
            color="text-blue-600"
            bgColor="bg-blue-50"
            subtext={`${stats.approvedPOs} approved • ${stats.pendingPOs} pending`}
            onClick={() => setActiveTab("purchase-orders")}
          />
        )}

        {can("view_pos") && (
          <SummaryCard
            label="PO Value"
            value={formatCurrency(stats.totalPOValue)}
            icon={IndianRupee}
            color="text-green-600"
            bgColor="bg-green-50"
            subtext={`Paid: ${formatCurrency(stats.totalPaidAmount)}`}
          />
        )}

        {can("view_vendors") && (
          <SummaryCard
            label="Vendors"
            value={stats.totalVendors}
            icon={Building2}
            color="text-emerald-600"
            bgColor="bg-emerald-50"
            subtext={`${stats.activeVendors} active`}
            onClick={() => setActiveTab("vendors")}
          />
        )}
        {can("view_wo") && (
          <SummaryCard
            label="Work Orders"
            value={stats.totalWorkOrders}
            icon={Briefcase}
            color="text-purple-600"
            bgColor="bg-purple-50"
            subtext={`${stats.activeWorkOrders} in progress`}
            onClick={() => setActiveTab("service-orders")}
          />
        )}
        {can("view_employee") && (
          <SummaryCard
            label="Employees"
            value={stats.totalEmployees}
            icon={Users}
            color="text-cyan-600"
            bgColor="bg-cyan-50"
            subtext={`${stats.activeEmployees} active`}
            onClick={() => setActiveTab("employees")}
          />
        )}
        {can("view_projects") && (
          <SummaryCard
            label="Projects"
            value={stats.totalProjects}
            icon={Truck}
            color="text-orange-600"
            bgColor="bg-orange-50"
            subtext={`${stats.ongoingProjects} ongoing`}
            onClick={() => setActiveTab("projects")}
          />
        )}
        {can("view_material_requests") && (
          <SummaryCard
            label="Material Requests"
            value={`${stats.approvedRequests}/${stats.totalMaterialRequests}`}
            icon={Package}
            color="text-amber-600"
            bgColor="bg-amber-50"
            subtext={`${stats.lowStockItems} low stock items`}
            onClick={() => setActiveTab("material-requests")}
          />
        )}
      </div>

      {/* Charts Section */}
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - PO vs Payments */}
        {can("view_pos") && can("view_payments") && (
          <ChartCard title="Purchase Orders vs Payments" icon={BarChart3}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={poVsPaymentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                    ) => {
                      if (value === undefined) return ["0", name || ""];
                      return [value.toString(), name || ""];
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="purchaseOrders"
                    name="Purchase Orders"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="payments"
                    name="Payments"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Line Chart - Monthly Expenses */}
        {can("view_expenses") && (
          <ChartCard title="Monthly Expenses" icon={TrendingUp}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyExpenseData}>
                  <defs>
                    <linearGradient
                      id="expenseGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value: number) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                    ) => {
                      if (value === undefined)
                        return ["₹0", name || "Expenses"];
                      return [formatCurrency(value), name || "Expenses"];
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expenseGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}

        {/* Pie Chart - Work Order Status */}
        {can("view_wo") && (
          <ChartCard title="Work Order Status" icon={PieChartIcon}>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={workOrderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {workOrderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(
                      value: number | undefined,
                      name: string | undefined,
                    ) => {
                      if (value === undefined) return ["0", name || ""];
                      return [`${value}`, name || ""];
                    }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Purchase Orders */}
        {can("view_pos") && (
          <ActivityTable
            title="Latest Purchase Orders"
            icon={ShoppingCart}
            columns={["PO Number", "Vendor", "Amount", "Status", "Payment"]}
            data={purchaseOrders}
            renderRow={(po: any) => (
              <>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {po.po_number || `PO-${po.id}`}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(po.po_date || po.created_at)}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {po.vendors?.name || po.vendor_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                  {formatCurrency(po.grand_total)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}
                  >
                    {(po.status || "draft").toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.payment_status)}`}
                  >
                    {(po.payment_status || "pending").toUpperCase()}
                  </span>
                </td>
              </>
            )}
            action={
              <button
                onClick={() => setActiveTab("purchase-orders")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            }
            onRowClick={(po) => setActiveTab("purchase-orders")}
          />
        )}

        {/* Recent Payments */}
        {can("view_payments") && (
          <ActivityTable
            title="Recent Payments"
            icon={CreditCard}
            columns={["Payment No", "PO/Vendor", "Amount", "Date", "Status"]}
            data={payments}
            renderRow={(payment: any) => (
              <>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {payment.payment_number || `PAY-${payment.id}`}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-800">
                    {payment.po_number || "N/A"}
                  </p>
                  <p className="text-xs text-gray-400">{payment.vendor_name}</p>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-green-600">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatDate(payment.payment_date)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}
                  >
                    {(payment.status || "pending").toUpperCase()}
                  </span>
                </td>
              </>
            )}
            action={
              <button
                onClick={() => setActiveTab("payments")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            }
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Material Requests */}
        {can("view_material_requests") && (
          <ActivityTable
            title="Material Requests"
            icon={Package}
            columns={["Request No", "Requester", "Project", "Items", "Status"]}
            data={materialRequests}
            renderRow={(request: any) => (
              <>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {request.request_no || `MR-${request.id}`}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.user_name || request.created_by_name || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.project_name || request.projectId || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {request.materials?.length || request.items_count || 0}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}
                  >
                    {(request.status || "draft").toUpperCase()}
                  </span>
                </td>
              </>
            )}
            action={
              <button
                onClick={() => setActiveTab("material-requests")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            }
            onRowClick={() => setActiveTab(`material-requests`)}
          />
        )}

        {/* Work Orders */}
        {can("view_wo") && (
          <ActivityTable
            title="Active Work Orders"
            icon={Briefcase}
            columns={["WO Number", "Vendor", "Project", "Amount", "Status"]}
            data={workOrders}
            renderRow={(wo: any) => (
              <>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-800">
                    {wo.so_number || `WO-${wo.id}`}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {wo.vendors?.name || wo.vendor || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {wo.projects?.name || wo.project || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                  {formatCurrency(wo.grand_total)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(wo.status)}`}
                  >
                    {(wo.status || "draft").toUpperCase()}
                  </span>
                </td>
              </>
            )}
            action={
              <button
                onClick={() => setActiveTab("service-orders")}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </button>
            }
            onRowClick={() => setActiveTab(`service-orders`)}
          />
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {can("view_pos") && (
            <QuickActionButton
              icon={FileText}
              label="Purchase Order"
              description="purchase order management."
              onClick={() => setActiveTab("purchase-orders")}
              color="bg-blue-600"
            />
          )}

          {can("view_vendors") && (
            <QuickActionButton
              icon={Building2}
              label="Vendor"
              description="vendor management."
              onClick={() => setActiveTab("vendors")}
              color="bg-emerald-600"
            />
          )}

          {can("view_wo") && (
            <QuickActionButton
              icon={Briefcase}
              label="Work Order"
              description="work order management."
              onClick={() => setActiveTab("service-orders")}
              color="bg-purple-600"
            />
          )}

          {can("employees") && (
            <QuickActionButton
              icon={UserPlus}
              label="Employee"
              description="employee management."
              onClick={() => setActiveTab("employees")}
              color="bg-cyan-600"
            />
          )}
        </div>
      </div>

      {/* Inventory Alert Section */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-800">
                Inventory Alert
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.lowStockItems > 0 &&
                  `${stats.lowStockItems} items are running low on stock. `}
                {stats.outOfStockItems > 0 &&
                  `${stats.outOfStockItems} items are out of stock. `}
                <button
                  onClick={() => navigateTo("/store-management")}
                  className="font-medium underline hover:no-underline"
                >
                  Review inventory
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
