import { useState, useEffect } from "react";
import {
  FileText,
  Download,
  Calendar,
  ShoppingCart,
  Wallet,
  Receipt,
  Package,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Truck,
  Building2,
  FileCheck,
  CreditCard,
} from "lucide-react";
import * as XLSX from "xlsx";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

// API Service functions (to be implemented with your axios instance)
import api from "../lib/Api";
import poApi from "../lib/poApi";
import poPaymentApi from "../lib/poPaymentApi";
import inventoryApi from "../lib/inventoryApi";
import ServiceOrdersApi from "../lib/serviceOrderApi";
import vendorApi from "../lib/vendorApi";
import projectApi from "../lib/projectApi";
import Button from "../components/ui/Button";

type ReportType =
  | "purchase-orders"
  | "po-payments"
  | "inventory"
  | "service-orders"
  | "so-payments"
  | "vendor-report"
  | "project-report";

interface PurchaseOrder {
  id: string;
  po_number: string;
  vendor_id: number;
  vendor_name?: string;
  po_date: string;
  delivery_date: string;
  grand_total: number;
  status: string;
  payment_status: string;
  material_status: string;
  created_at: string;
}

interface POPayment {
  id: string;
  po_id: number;
  po_number?: string;
  vendor?: string;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  status: string;
  transaction_type: string;
}

interface InventoryItem {
  id: string;
  item_code: string;
  item_name: string;
  item_category: string;
  quantity: number;
  reorder_qty: number;
  unit: string;
  standard_rate: number;
  location: string;
  status?: string;
}

interface ServiceOrder {
  id: string;
  so_number: string;
  vendor_id: number;
  vendor?: string;
  project_id: number;
  project?: string;
  so_date: string;
  delivery_date: string;
  grand_total: number;
  status: string;
  payment_status: string;
  service_status: string;
}

interface Vendor {
  id: string;
  name: string;
  contact_person_name: string;
  company_email: string;
  company_phone: string;
  category_name: string;
  total_orders?: number;
  total_amount?: number;
}

interface Project {
  id: string;
  name: string;
  location: string;
  start_date: string;
  end_date: string;
  buildingCount?: any;
  status: string;
}

interface ReportData {
  purchaseOrders: PurchaseOrder[];
  poPayments: POPayment[];
  inventory: InventoryItem[];
  serviceOrders: ServiceOrder[];
  vendors: Vendor[];
  projects: Project[];
}

export default function Reports() {
  const { can } = useAuth();
  const [selectedReport, setSelectedReport] =
    useState<ReportType>("purchase-orders");
  const [dateRange, setDateRange] = useState("this-month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportData>({
    purchaseOrders: [],
    poPayments: [],
    inventory: [],
    serviceOrders: [],
    vendors: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalPOs: 0,
    totalPOValue: 0,
    pendingPOs: 0,
    completedPOs: 0,
    totalPayments: 0,
    totalPaymentAmount: 0,
    lowStockItems: 0,
    totalInventoryValue: 0,
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedReport, dateRange, customStartDate, customEndDate]);

  const getDateRangeParams = () => {
    const now = new Date();
    let startDate = "";
    let endDate = format(now, "yyyy-MM-dd");

    switch (dateRange) {
      case "today":
        startDate = format(now, "yyyy-MM-dd");
        break;
      case "this-week":
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = format(startOfWeek, "yyyy-MM-dd");
        break;
      case "this-month":
        startDate = format(
          new Date(now.getFullYear(), now.getMonth(), 1),
          "yyyy-MM-dd",
        );
        break;
      case "last-month":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        startDate = format(lastMonth, "yyyy-MM-dd");
        endDate = format(lastMonthEnd, "yyyy-MM-dd");
        break;
      case "this-quarter":
        const quarterStart = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1,
        );
        startDate = format(quarterStart, "yyyy-MM-dd");
        break;
      case "this-year":
        startDate = format(new Date(now.getFullYear(), 0, 1), "yyyy-MM-dd");
        break;
      case "custom":
        startDate = customStartDate;
        endDate = customEndDate;
        break;
    }
    return { startDate, endDate };
  };

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { startDate, endDate } = getDateRangeParams();

      switch (selectedReport) {
        case "purchase-orders":
          const poResponse: any = await poApi.getPOs();
          let pos = poResponse || [];

          // Filter by date range if not custom (since API might not support date filtering)
          if (dateRange !== "custom" && startDate && endDate) {
            pos = pos.filter((po: PurchaseOrder) => {
              const poDate =
                po.po_date?.split("T")[0] || po.created_at?.split("T")[0];
              return poDate >= startDate && poDate <= endDate;
            });
          }

          setReportData((prev) => ({ ...prev, purchaseOrders: pos }));

          // Calculate summary stats
          const totalValue = pos.reduce(
            (sum: number, po: PurchaseOrder) => sum + (po.grand_total || 0),
            0,
          );
          setSummaryStats({
            totalPOs: pos.length,
            totalPOValue: totalValue,
            pendingPOs: pos.filter(
              (p: PurchaseOrder) =>
                p.status === "pending_approval" || p.status === "draft",
            ).length,
            completedPOs: pos.filter(
              (p: PurchaseOrder) =>
                p.status === "completed" || p.status === "authorize",
            ).length,
            totalPayments: 0,
            totalPaymentAmount: 0,
            lowStockItems: 0,
            totalInventoryValue: 0,
          });
          break;

        case "po-payments":
          const paymentResponse: any = await poPaymentApi.getPayments();
          console.log(paymentResponse);
          let payments = paymentResponse || [];
          if (Array.isArray(paymentResponse)) {
            const po: any = await poApi.getPOs();
            const vendorsRes: any = await vendorApi.getVendors();

            payments = payments.map((p: any) => {
              const tempPo = po.find(
                (pd: any) => Number(pd.id) === Number(p.po_id),
              );
              const tempVendor = vendorsRes.find(
                (v: any) => Number(v.id) === Number(tempPo.vendor_id),
              );
              return {
                ...p,
                payment_date: p.created_at.split("T")[0],
                vendor: p.name,
              };
            });
          }
          setReportData((prev) => ({ ...prev, poPayments: payments }));

          const totalPaid = payments.reduce(
            (sum: number, p: POPayment) => sum + (Number(p.amount_paid) || 0),
            0,
          );
          setSummaryStats((prev) => ({
            ...prev,
            totalPayments: payments.length,
            totalPaymentAmount: totalPaid,
          }));
          break;

        case "inventory":
          const inventoryResponse: any = await inventoryApi.getInventory();
          const inventory = inventoryResponse || [];
          setReportData((prev) => ({ ...prev, inventory }));

          const lowStock = inventory.filter(
            (i: InventoryItem) => i.quantity <= (i.reorder_qty || 0),
          );
          const inventoryValue = inventory.reduce(
            (sum: number, i: InventoryItem) =>
              sum + i.quantity * (i.standard_rate || 0),
            0,
          );
          setSummaryStats((prev) => ({
            ...prev,
            lowStockItems: lowStock.length,
            totalInventoryValue: inventoryValue,
          }));
          break;

        case "service-orders":
          const soResponse: any = await ServiceOrdersApi.getAll();
          let sos = soResponse || [];

          if (dateRange !== "custom" && startDate && endDate) {
            sos = sos.filter((so: ServiceOrder) => {
              const soDate = so.so_date?.split("T")[0];
              return soDate >= startDate && soDate <= endDate;
            });
          }

          setReportData((prev) => ({ ...prev, serviceOrders: sos }));

          const soTotalValue = sos.reduce(
            (sum: number, so: ServiceOrder) =>
              sum + (Number(so.grand_total) || 0),
            0,
          );
          setSummaryStats({
            ...summaryStats,
            totalPOs: sos.length,
            totalPOValue: soTotalValue,
            pendingPOs: sos.filter(
              (s: ServiceOrder) =>
                s.status === "pending_approval" || s.status === "draft",
            ).length,
            completedPOs: sos.filter(
              (s: ServiceOrder) =>
                s.status === "completed" || s.status === "authorize",
            ).length,
          });
          break;

        case "vendor-report":
          const vendorsResponse: any = await vendorApi.getVendors();
          const vendors = vendorsResponse || [];
          console.log(vendors);

          const [posRess, soRes]: any = await Promise.all([
            poApi.getPOs(),
            ServiceOrdersApi.getAll(),
          ]);
          const vendorsWithStats = await Promise.all(
            vendors.map(async (vendor: Vendor) => {
              try {
                return {
                  ...vendor,
                  total_orders:
                    posRess.filter(
                      (po: any) => Number(po.vendor_id) === Number(vendor.id),
                    ).length +
                    soRes.filter(
                      (so: any) => Number(so.vendor_id) === Number(vendor.id),
                    ).length,
                  total_amount:
                    posRess.reduce(
                      (sum: number, crr: any) =>
                        Number(sum) +
                        (Number(crr.vendor_id) === Number(vendor.id)
                          ? Number(crr.grand_total)
                          : 0),
                      0,
                    ) +
                    soRes.reduce(
                      (sum: number, crr: any) =>
                        Number(sum) +
                        (Number(crr.vendor_id) === Number(vendor.id)
                          ? Number(crr.grand_total)
                          : 0),
                      0,
                    ),
                };
              } catch {
                return { ...vendor, total_orders: 0, total_amount: 0 };
              }
            }),
          );

          setReportData((prev) => ({ ...prev, vendors: vendorsWithStats }));
          break;

        case "project-report":
          const projectsResponse: any = await projectApi.getProjects();
          const projects = projectsResponse.data || [];
          console.log(projects);
          setReportData((prev) => ({ ...prev, projects }));
          break;
      }
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setError(err.message || "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd MMM yyyy");
  };

  const exportToExcel = () => {
    let worksheetData: any[][] = [];
    let sheetName = "";

    switch (selectedReport) {
      case "purchase-orders":
        sheetName = "Purchase Orders Report";
        worksheetData = [
          [
            "PO Number",
            "Vendor",
            "PO Date",
            "Delivery Date",
            "Grand Total",
            "Status",
            "Payment Status",
            "Material Status",
          ],
          ...reportData.purchaseOrders.map((po) => [
            po.po_number,
            po.vendor_name || "N/A",
            formatDate(po.po_date),
            formatDate(po.delivery_date),
            po.grand_total,
            po.status,
            po.payment_status,
            po.material_status,
          ]),
        ];
        break;

      case "po-payments":
        sheetName = "PO Payments Report";
        worksheetData = [
          [
            "PO Number",
            "Vendor",
            "Amount Paid",
            "Payment Date",
            "Payment Method",
            "Status",
          ],
          ...reportData.poPayments.map((payment) => [
            payment.po_number || "N/A",
            payment.vendor || "N/A",
            payment.amount_paid,
            formatDate(payment.payment_date),
            payment.payment_method,
            payment.status,
          ]),
        ];
        break;

      case "inventory":
        sheetName = "Inventory Report";
        worksheetData = [
          [
            "Item Code",
            "Item Name",
            "Category",
            "Quantity",
            "Reorder Qty",
            "Unit",
            "Rate",
            "Location",
            "Status",
          ],
          ...reportData.inventory.map((item) => [
            item.item_code,
            item.item_name,
            item.item_category,
            item.quantity,
            item.reorder_qty,
            item.unit,
            item.standard_rate,
            item.location,
            item.quantity <= (item.reorder_qty || 0) ? "Low Stock" : "In Stock",
          ]),
        ];
        break;

      case "service-orders":
        sheetName = "Service Orders Report";
        worksheetData = [
          [
            "SO Number",
            "Vendor",
            "Project",
            "SO Date",
            "Delivery Date",
            "Grand Total",
            "Status",
            "Payment Status",
          ],
          ...reportData.serviceOrders.map((so) => [
            so.so_number,
            so.vendor || "N/A",
            so.project || "N/A",
            formatDate(so.so_date),
            formatDate(so.delivery_date),
            so.grand_total,
            so.status,
            so.payment_status,
          ]),
        ];
        break;

      case "vendor-report":
        sheetName = "Vendors Report";
        worksheetData = [
          [
            "Vendor Name",
            "Company",
            "Email",
            "Phone",
            "Total Orders",
            "Total Amount",
          ],
          ...reportData.vendors.map((vendor) => [
            vendor.name,
            vendor.contact_person_name,
            vendor.company_email,
            vendor.company_phone,
            vendor.total_orders || 0,
            vendor.total_amount || 0,
          ]),
        ];
        break;

      case "project-report":
        sheetName = "Projects Report";
        worksheetData = [
          [
            "Project Name",
            "Location",
            "Start Date",
            "End Date",
            "Buildings",
            "Status",
          ],
          ...reportData.projects.map((project) => [
            project.name,
            project.location,
            formatDate(project.start_date),
            formatDate(project.end_date),
            project.buildingCount || 0,
            project.status,
          ]),
        ];
        break;

      default:
        return;
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const colWidths = worksheetData[0].map((_, colIndex) => {
      let maxLength = 0;
      worksheetData.forEach((row) => {
        const cellValue = row[colIndex]?.toString() || "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      return { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const fileName = `${selectedReport}_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const reportTypes = [
    {
      value: "purchase-orders",
      label: "Purchase Orders",
      icon: ShoppingCart,
      color: "blue",
    },
    {
      value: "po-payments",
      label: "PO Payments",
      icon: CreditCard,
      color: "green",
    },
    { value: "inventory", label: "Inventory", icon: Package, color: "orange" },
    {
      value: "service-orders",
      label: "Service Orders",
      icon: FileCheck,
      color: "purple",
    },
    {
      value: "vendor-report",
      label: "Vendors",
      icon: Building2,
      color: "teal",
    },
    {
      value: "project-report",
      label: "Projects",
      icon: Truck,
      color: "indigo",
    },
  ];

  const dateRangeOptions = [
    { value: "today", label: "Today" },
    { value: "this-week", label: "This Week" },
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "this-quarter", label: "This Quarter" },
    { value: "this-year", label: "This Year" },
    { value: "custom", label: "Custom Range" },
  ];

  // Summary Cards Component
  const SummaryCards = () => {
    const cards = [];

    if (
      selectedReport === "purchase-orders" ||
      selectedReport === "service-orders"
    ) {
      cards.push(
        {
          title: "Total Orders",
          value: summaryStats.totalPOs,
          icon: ShoppingCart,
          color: "blue",
        },
        {
          title: "Total Value",
          value: formatCurrency(summaryStats.totalPOValue),
          icon: DollarSign,
          color: "green",
        },
        {
          title: "Completed",
          value: summaryStats.completedPOs,
          icon: CheckCircle,
          color: "green",
        },
        {
          title: "Pending",
          value: summaryStats.pendingPOs,
          icon: Clock,
          color: "orange",
        },
      );
    } else if (selectedReport === "po-payments") {
      cards.push(
        {
          title: "Total Payments",
          value: summaryStats.totalPayments,
          icon: Receipt,
          color: "blue",
        },
        {
          title: "Total Amount",
          value: formatCurrency(summaryStats.totalPaymentAmount),
          icon: Wallet,
          color: "green",
        },
      );
    } else if (selectedReport === "inventory") {
      cards.push(
        {
          title: "Total Items",
          value: reportData.inventory.length,
          icon: Package,
          color: "blue",
        },
        {
          title: "Inventory Value",
          value: formatCurrency(summaryStats.totalInventoryValue),
          icon: DollarSign,
          color: "green",
        },
        {
          title: "Low Stock Items",
          value: summaryStats.lowStockItems,
          icon: AlertCircle,
          color: "red",
        },
      );
    } else if (selectedReport === "vendor-report") {
      cards.push({
        title: "Total Vendors",
        value: reportData.vendors.length,
        icon: Building2,
        color: "blue",
      });
    } else if (selectedReport === "project-report") {
      cards.push({
        title: "Total Projects",
        value: reportData.projects.length,
        icon: Truck,
        color: "blue",
      });
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`w-5 h-5 text-${card.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Table Wrapper Component
  const TableWrapper = ({
    children,
    minHeight = "400px",
  }: {
    children: React.ReactNode;
    minHeight?: string;
  }) => (
    <div className="relative overflow-hidden">
      <div className="overflow-x-auto">
        <div className="max-h-[500px] overflow-y-auto" style={{ minHeight }}>
          {children}
        </div>
      </div>
    </div>
  );

  // Status Badge Component
  const StatusBadge = ({ status }: { status: string }) => {
    const getStyles = () => {
      switch (status?.toLowerCase()) {
        case "completed":
        case "authorize":
        case "success":
        case "paid":
          return "bg-green-100 text-green-700";
        case "pending_approval":
        case "pending":
        case "partial":
          return "bg-yellow-100 text-yellow-700";
        case "draft":
          return "bg-gray-100 text-gray-700";
        case "rejected":
        case "failed":
        case "overdue":
          return "bg-red-100 text-red-700";
        default:
          return "bg-gray-100 text-gray-700";
      }
    };

    const getLabel = () => {
      switch (status?.toLowerCase()) {
        case "pending_approval":
          return "Pending Approval";
        case "authorize":
          return "Authorized";
        default:
          return status?.charAt(0).toUpperCase() + status?.slice(1) || "N/A";
      }
    };

    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStyles()}`}
      >
        {getLabel()}
      </span>
    );
  };

  const renderPurchaseOrdersReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              PO Number
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Vendor
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              PO Date
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Delivery Date
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Grand Total
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Status
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Payment Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.purchaseOrders.map((po) => (
            <tr key={po.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {po.po_number}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {po.vendor_name || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(po.po_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(po.delivery_date)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                {formatCurrency(po.grand_total)}
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={po.status} />
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={po.payment_status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderPOPaymentsReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              PO Number
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Vendor
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Amount Paid
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Payment Date
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Payment Method
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.poPayments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {payment.po_number || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {payment.vendor || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                {formatCurrency(payment.amount_paid)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(payment.payment_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {payment.payment_method || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={payment.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderInventoryReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Item Code
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Item Name
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Category
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Quantity
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Reorder Qty
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Rate
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Location
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.inventory.map((item) => {
            const isLowStock = item.quantity <= (item.reorder_qty || 0);
            return (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.item_code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.item_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.item_category || "--"}
                </td>
                <td
                  className={`px-6 py-4 text-sm text-right ${isLowStock ? "text-red-600 font-medium" : "text-gray-900"}`}
                >
                  {item.quantity} {item.unit}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-600">
                  {item.reorder_qty} {item.unit}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {formatCurrency(item.standard_rate)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.location || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm">
                  {isLowStock ? (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      In Stock
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderServiceOrdersReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              SO Number
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Vendor
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Project
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              SO Date
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Delivery Date
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Grand Total
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.serviceOrders.map((so) => (
            <tr key={so.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {so.so_number}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {so.vendor || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {so.project || "N/A"}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(so.so_date)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {formatDate(so.delivery_date)}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">
                {formatCurrency(so.grand_total)}
              </td>
              <td className="px-6 py-4 text-sm">
                <StatusBadge status={so.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderVendorsReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Vendor Name
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Category
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Company
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Email
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Phone
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Total Orders
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Total Amount
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {vendor.contact_person_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {vendor.category_name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{vendor.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {vendor.company_email}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {vendor.company_phone}
              </td>
              <td className="px-6 py-4 text-sm text-right text-gray-900">
                {vendor.total_orders || 0}
              </td>
              <td className="px-6 py-4 text-sm text-right font-medium text-green-600">
                {formatCurrency(vendor.total_amount || 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  );

  const renderProjectsReport = () => (
    <TableWrapper>
      <table className="w-full">
        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Project Name
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Location
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Start Date
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              End Date
            </th>
            <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">
              Buildings
            </th>
            <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {reportData.projects.map((project) => {
            const isCompleted =
              project.end_date && new Date(project.end_date) < new Date();
            return (
              <tr
                key={project.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {project.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {project.location}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(project.start_date)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatDate(project.end_date)}
                </td>
                <td className="px-6 py-4 text-sm text-right text-gray-900">
                  {project.buildingCount || 0}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge status={(project.status || "").toUpperCase()} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableWrapper>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col px-6">
      {/* Header with Report Type Selection and Export */}
      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedReport === type.value;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedReport(type.value as ReportType)}
                className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                />
                <span
                  className={`text-sm font-medium ${isSelected ? "text-blue-900" : "text-gray-900"}`}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          {can("export_reports") && (
            <Button
              onClick={exportToExcel}
              disabled={loading}
              className="text-sm"
            >
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Main Report Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {reportTypes.find((t) => t.value === selectedReport)?.label}{" "}
                Report
              </h2>
              <p className="text-sm text-gray-500">
                Detailed data for{" "}
                {reportTypes
                  .find((t) => t.value === selectedReport)
                  ?.label.toLowerCase()}
              </p>
            </div>
          </div>
          <div>
            {/* Date Range Filter */}
            {(selectedReport === "purchase-orders" ||
              selectedReport === "service-orders" ||
              selectedReport === "po-payments") && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-1">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Date Range:
                    </span>
                  </div>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {dateRangeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {dateRange === "custom" && (
                    <div className="flex items-center gap-3">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Start Date"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="End Date"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden min-h-0">
          {error ? (
            <div className="flex items-center justify-center py-12 h-full">
              <div className="text-red-500 text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                <p>Error: {error}</p>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {selectedReport === "purchase-orders" &&
                renderPurchaseOrdersReport()}
              {selectedReport === "po-payments" && renderPOPaymentsReport()}
              {selectedReport === "inventory" && renderInventoryReport()}
              {selectedReport === "service-orders" &&
                renderServiceOrdersReport()}
              {selectedReport === "vendor-report" && renderVendorsReport()}
              {selectedReport === "project-report" && renderProjectsReport()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
