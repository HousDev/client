import { useState, useEffect } from "react";
import { BarChart3, Download } from "lucide-react";

type PO = {
  id: string;
  po_number: string;
  status: "completed" | "pending_approval" | "draft" | string;
  grand_total: number;
  created_at: string;
};

type Payment = {
  id: string;
  payment_number: string;
  amount: number;
  payment_date: string;
};

type PaymentTerm = {
  id: string;
  status: "due" | "paid" | "overdue" | string;
  amount: number;
  expected_date?: string;
};

const STORAGE_KEY = "mock_reports_data_v1";

export default function Reports() {
  const [reportData, setReportData] = useState({
    totalPOs: 0,
    totalAmount: 0,
    completedPOs: 0,
    pendingPOs: 0,
    totalPayments: 0,
    overduePayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<{
    pos: PO[];
    payments: Payment[];
    terms: PaymentTerm[];
  } | null>(null);

  useEffect(() => {
    loadReportData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedData = () => {
    const pos: PO[] = [
      {
        id: "po1",
        po_number: "PO/2025/001",
        status: "completed",
        grand_total: 250000,
        created_at: "2025-01-05",
      },
      {
        id: "po2",
        po_number: "PO/2025/002",
        status: "pending_approval",
        grand_total: 125000,
        created_at: "2025-02-10",
      },
      {
        id: "po3",
        po_number: "PO/2025/003",
        status: "completed",
        grand_total: 520000,
        created_at: "2025-03-12",
      },
      {
        id: "po4",
        po_number: "PO/2025/004",
        status: "draft",
        grand_total: 80000,
        created_at: "2025-04-01",
      },
    ];

    const payments: Payment[] = [
      {
        id: "pay1",
        payment_number: "PAY/2025/001",
        amount: 150000,
        payment_date: "2025-02-01",
      },
      {
        id: "pay2",
        payment_number: "PAY/2025/002",
        amount: 50000,
        payment_date: "2025-03-05",
      },
      {
        id: "pay3",
        payment_number: "PAY/2025/003",
        amount: 20000,
        payment_date: "2025-06-01",
      },
    ];

    const terms: PaymentTerm[] = [
      { id: "t1", status: "paid", amount: 150000, expected_date: "2025-02-01" },
      { id: "t2", status: "due", amount: 50000, expected_date: "2025-06-20" },
      {
        id: "t3",
        status: "overdue",
        amount: 30000,
        expected_date: "2025-04-15",
      },
    ];

    const payload = { pos, payments, terms };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return payload;
  };

  const loadReportData = async () => {
    setLoading(true);
    try {
      const rawString = localStorage.getItem(STORAGE_KEY);
      const data = rawString ? JSON.parse(rawString) : seedData();
      setRaw(data);

      const posRes: PO[] = data.pos || [];
      const paymentsRes: Payment[] = data.payments || [];
      const termsRes: PaymentTerm[] = data.terms || [];

      const totalPOs = posRes.length;
      const completedPOs = posRes.filter(
        (p) => p.status === "completed"
      ).length;
      const pendingPOs = posRes.filter(
        (p) => p.status === "pending_approval"
      ).length;
      const totalAmount = posRes.reduce(
        (sum, p) => sum + (p.grand_total || 0),
        0
      );

      const totalPayments = paymentsRes.length;
      const overduePayments =
        termsRes
          .filter((t) => t.status === "overdue")
          .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      setReportData({
        totalPOs,
        totalAmount,
        completedPOs,
        pendingPOs,
        totalPayments,
        overduePayments,
      });
    } catch (error) {
      console.error("Error loading report data (demo):", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // CSV & JSON downloads for demo
  const downloadCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) {
      alert("No data to download");
      return;
    }
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(",")]
      .concat(
        rows.map((r) =>
          keys
            .map((k) => {
              const v = r[k] ?? "";
              // escape quotes
              return `"${String(v).replace(/"/g, '""')}"`;
            })
            .join(",")
        )
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (filename: string, data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadReport = (format: "pdf" | "excel") => {
    // Provide CSV/JSON for demo; keep PDF as placeholder
    if (!raw) {
      alert("No report data available");
      return;
    }
    if (format === "excel") {
      // export combined data as CSV for demo
      const rows = [
        { metric: "Total POs", value: reportData.totalPOs },
        { metric: "Total PO Value", value: reportData.totalAmount },
        { metric: "Completed POs", value: reportData.completedPOs },
        { metric: "Pending POs", value: reportData.pendingPOs },
        { metric: "Total Payments", value: reportData.totalPayments },
        { metric: "Overdue Payment Value", value: reportData.overduePayments },
      ];
      downloadCSV("report_summary.csv", rows);
      return;
    }
    if (format === "pdf") {
      // placeholder: produce JSON and notify user
      downloadJSON("report_data.json", raw);
      alert("PDF export not available in demo — exported JSON instead.");
      return;
    }
  };

  const resetDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    loadReportData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
       
        <div className="flex gap-3">
          <button
            onClick={() => downloadReport("pdf")}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => downloadReport("excel")}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Excel (CSV)
          </button>
          <button
            onClick={resetDemo}
            className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
            title="Reset demo data"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Purchase Orders
          </p>
          <p className="text-3xl font-bold text-blue-600">
            {reportData.totalPOs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total PO Value
          </p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(reportData.totalAmount)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            Completed POs
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {reportData.completedPOs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">Pending POs</p>
          <p className="text-3xl font-bold text-orange-600">
            {reportData.pendingPOs}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-teal-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            Total Payments
          </p>
          <p className="text-3xl font-bold text-teal-600">
            {reportData.totalPayments}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            Overdue Payment Value
          </p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(reportData.overduePayments)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Report Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Purchase Order Status
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Completed</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{
                      width: `${
                        reportData.totalPOs > 0
                          ? (reportData.completedPOs / reportData.totalPOs) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-800 w-12 text-right">
                  {reportData.totalPOs > 0
                    ? Math.round(
                        (reportData.completedPOs / reportData.totalPOs) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending</span>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full"
                    style={{
                      width: `${
                        reportData.totalPOs > 0
                          ? (reportData.pendingPOs / reportData.totalPOs) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <span className="font-medium text-gray-800 w-12 text-right">
                  {reportData.totalPOs > 0
                    ? Math.round(
                        (reportData.pendingPOs / reportData.totalPOs) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">
              Financial Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Total PO Amount</span>
                <span className="font-medium">
                  {formatCurrency(reportData.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between p-2 bg-red-50 rounded">
                <span className="text-gray-600">Overdue Payments</span>
                <span className="font-medium text-red-600">
                  {formatCurrency(reportData.overduePayments)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
