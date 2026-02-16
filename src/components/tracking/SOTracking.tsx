"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Briefcase,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import soApi from "../../lib/serviceOrderApi";
import vendorApi from "../../lib/vendorApi";
import ItemsApi from "../../lib/itemsApi";
import projectApi from "../../lib/projectApi";

/* ================= TYPES ================= */

type SOService = {
  id: string;
  service_id?: string;
  service_name?: string;
  sac_code?: string;
  quantity_ordered: number;
  quantity_completed: number;
  quantity_pending: number;
  status?: string;
  unit?: string;
};

type SOData = {
  id: string;
  so_number: string;
  vendor: {
    id: string;
    name: string;
  };
  project: string;
  amount: string;
  so_status: string;
  service_status: string;
  payment_status: string;
  balance_amount: string;
  so_date: string;
  vendor_id: string;
  services: SOService[];
  expanded: boolean;
  total_ordered: number;
  total_completed: number;
  total_pending: number;
  overall_status: string;
};

/* ================= COMPONENT ================= */

export default function SOTracking() {
  const [soData, setSoData] = useState<SOData[]>([]);
  const [loading, setLoading] = useState(true);

  // Column search states
  const [searchSONumber, setSearchSONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchSOStatus, setSearchSOStatus] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");

  /* ================= LOAD DATA ================= */

  const loadAllSOs = async () => {
    try {
      const sosRes: any = await soApi.getAll();
      const soTrackRes: any = await soApi.getTrackings();
      const vendorsRes: any = await vendorApi.getVendors();
      const itemsRes: any = await ItemsApi.getItems();
      const projectsData: any = await projectApi.getProjects();

      const idsSet = new Set(sosRes.map((item: any) => item.id));
      const filteredSoTracking = soTrackRes.filter((item: any) =>
        idsSet.has(item.so_id),
      );

      const soMap = new Map<string, SOData>();

      sosRes.forEach((so: any) => {
        const vendorData = vendorsRes.find((v: any) => v.id === so.vendor_id);
        const project = projectsData?.data?.find(
          (p: any) => p.id === Number(so.project_id),
        );

        soMap.set(so.id, {
          id: so.id,
          so_number: so.so_number,
          vendor: vendorData,
          project: project?.name || "--",
          amount: so.grand_total,
          so_status: so.status,
          service_status: so.service_status,
          payment_status: so.payment_status,
          balance_amount: so.balance_amount,
          so_date: new Date(so.created_at).toLocaleDateString(),
          vendor_id: so.vendor_id,
          services: [],
          expanded: false,
          total_ordered: 0,
          total_completed: 0,
          total_pending: 0,
          overall_status: "pending",
        });
      });

      filteredSoTracking.forEach((st: any) => {
        const so = soMap.get(st.so_id);
        if (!so) return;

        const serviceData = itemsRes.find(
          (i: any) => i.id === Number(st.service_id),
        );

        const service: SOService = {
          id: st.id,
          service_id: st.service_id,
          service_name: serviceData?.item_name,
          sac_code: serviceData?.hsn_code,
          quantity_ordered: Number(st.quantity_ordered || 0),
          quantity_completed: Number(st.quantity_completed || 0),
          quantity_pending: Number(st.quantity_pending || 0),
          status: st.status || "pending",
          unit: serviceData?.unit,
        };

        so.services.push(service);

        so.total_ordered += service.quantity_ordered;
        so.total_completed += service.quantity_completed;
        so.total_pending += service.quantity_pending;
      });

      // Overall status
      soMap.forEach((so) => {
        if (so.services.length === 0) {
          so.overall_status = "pending";
        } else if (so.services.every((s) => s.status === "completed")) {
          so.overall_status = "completed";
        } else if (
          so.services.some(
            (s) => s.status === "partial" || s.status === "completed",
          )
        ) {
          so.overall_status = "partial";
        } else {
          so.overall_status = "pending";
        }
      });

      setSoData(Array.from(soMap.values()));
      setLoading(false);
    } catch (err) {
      toast.error("Failed to load Work Orders");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSOs();
  }, []);

  /* ================= HELPERS ================= */

  const toggleExpand = (id: string) => {
    setSoData((prev) =>
      prev.map((so) => (so.id === id ? { ...so, expanded: !so.expanded } : so)),
    );
  };

  const getStatusColor = (status?: string) => {
    const styles: Record<string, string> = {
      pending: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      approved: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      authorize: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (status && styles[status]) || "bg-gray-100 text-gray-800";
  };

  const calculatePercentage = (completed: number, ordered: number) => {
    return ordered > 0 ? Math.round((completed * 100) / ordered) : 0;
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Filter function
  const filteredSOs = soData.filter((so) => {
    const matchesSONumber =
      searchSONumber === "" ||
      (so.so_number || "").toLowerCase().includes(searchSONumber.toLowerCase());

    const matchesVendor =
      searchVendor === "" ||
      (so.vendor?.name || "")
        .toLowerCase()
        .includes(searchVendor.toLowerCase());

    const matchesProject =
      searchProject === "" ||
      (so.project || "").toLowerCase().includes(searchProject.toLowerCase());

    const matchesStatus =
      searchStatus === "" ||
      (so.overall_status || "")
        .toLowerCase()
        .includes(searchStatus.toLowerCase());

    const matchesAmount =
      searchAmount === "" ||
      formatCurrency(Number(so.amount))
        .toLowerCase()
        .includes(searchAmount.toLowerCase());

    const matchesSOStatus =
      searchSOStatus === "" ||
      (so.so_status || "").toLowerCase().includes(searchSOStatus.toLowerCase());

    const matchesPaymentStatus =
      searchPaymentStatus === "" ||
      (so.payment_status || "")
        .toLowerCase()
        .includes(searchPaymentStatus.toLowerCase());

    return (
      matchesSONumber &&
      matchesVendor &&
      matchesProject &&
      matchesStatus &&
      matchesAmount &&
      matchesSOStatus &&
      matchesPaymentStatus
    );
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading Work Orders...</p>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="p-3 px-0 md:p-0 -mt-3.5 bg-gray-50">
      {/* Summary Cards - Responsive */}
      <div className="sticky top-20 z-10 mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 mx-0">
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Total WO</p>
            <p className="text-sm font-semibold text-gray-800">
              {soData.length}
            </p>
          </div>
          <Briefcase className="w-5 h-5 text-blue-500/30" />
        </div>

        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Pending</p>
            <p className="text-sm font-semibold text-gray-800">
              {soData.filter((so) => so.overall_status === "pending").length}
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-400/40" />
        </div>

        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Partial</p>
            <p className="text-sm font-semibold text-yellow-600">
              {soData.filter((so) => so.overall_status === "partial").length}
            </p>
          </div>
          <AlertTriangle className="w-5 h-5 text-yellow-500/40" />
        </div>

        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Completed</p>
            <p className="text-sm font-semibold text-green-600">
              {soData.filter((so) => so.overall_status === "completed").length}
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500/40" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-230px)] md:max-h-[calc(92vh-160px)]">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 py-2 text-center w-6">
                  <div className="flex items-center justify-center">#</div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO Number
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    WO Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Work Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </div>
                </th>
              </tr>
              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search WO..."
                    value={searchSONumber}
                    onChange={(e) => setSearchSONumber(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search vendor..."
                    value={searchVendor}
                    onChange={(e) => setSearchVendor(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search amount..."
                    value={searchAmount}
                    onChange={(e) => setSearchAmount(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search WO status..."
                    value={searchSOStatus}
                    onChange={(e) => setSearchSOStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search payment..."
                    value={searchPaymentStatus}
                    onChange={(e) => setSearchPaymentStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">
                      No service orders found
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Try adjusting your search
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSOs.map((so, index) => {
                  const overallPercentage = calculatePercentage(
                    so.total_completed,
                    so.total_ordered,
                  );

                  return (
                    <React.Fragment key={so.id}>
                      {/* SO Summary Row */}
                      <tr
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => toggleExpand(so.id)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              {so.expanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#C62828] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {so.so_number.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 text-xs truncate block max-w-[120px]">
                                {so.so_number}
                              </span>
                              <p className="text-[10px] text-gray-500 whitespace-nowrap">
                                {so.so_date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="text-gray-900 text-xs truncate block max-w-[120px]"
                              title={so.vendor?.name || "--"}
                            >
                              {so.vendor?.name || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="font-medium text-gray-900 text-xs truncate block max-w-[120px]"
                              title={so.project || "--"}
                            >
                              {so.project || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
                            {formatCurrency(Number(so.amount))}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              so.so_status,
                            )} whitespace-nowrap`}
                          >
                            {so.so_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-0.5 min-w-0">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                so.service_status,
                              )} truncate`}
                            >
                              {so.service_status?.toUpperCase() || "PENDING"}
                            </span>
                            {so.total_ordered > 0 && (
                              <div className="text-[10px] text-gray-600">
                                <div className="flex justify-between mb-0.5">
                                  <span>Progress</span>
                                  <span>{overallPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full"
                                    style={{ width: `${overallPercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                  so.payment_status,
                                )} truncate`}
                              >
                                {so.payment_status?.toUpperCase() || "PENDING"}
                              </span>
                              {Number(so.balance_amount) > 0 && (
                                <span
                                  className="text-[10px] text-gray-600 whitespace-nowrap"
                                  title={`Balance: ${formatCurrency(Number(so.balance_amount))}`}
                                >
                                  Bal:{" "}
                                  {formatCurrency(
                                    Number(so.balance_amount),
                                  ).replace("₹", "₹ ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      {so.expanded && so.services.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="p-0">
                            <div className="px-3 py-2 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Services in WO {so.so_number}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full bg-white rounded-lg border border-gray-200 min-w-[600px]">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Service
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        SAC Code
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Ordered
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Completed
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Pending
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Progress
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {so.services.map((service, idx) => {
                                      const servicePercentage =
                                        calculatePercentage(
                                          service.quantity_completed,
                                          service.quantity_ordered,
                                        );

                                      return (
                                        <tr
                                          key={service.id}
                                          className={`hover:bg-gray-50 ${
                                            idx % 2 === 0
                                              ? "bg-white"
                                              : "bg-gray-50/50"
                                          }`}
                                        >
                                          <td className="px-2 py-1.5">
                                            <div
                                              className="font-medium text-gray-800 text-xs truncate max-w-[150px]"
                                              title={
                                                service.service_name ||
                                                "Unknown"
                                              }
                                            >
                                              {service.service_name ||
                                                "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              Unit: {service.unit || "N/A"}
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-gray-700 text-xs">
                                            {service.sac_code || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                            {service.quantity_ordered}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-green-600 text-xs">
                                            {service.quantity_completed}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-orange-600 text-xs">
                                            {service.quantity_pending > 0 ? (
                                              <span className="flex items-center gap-0.5">
                                                <AlertTriangle className="w-2.5 h-2.5" />
                                                {service.quantity_pending}
                                              </span>
                                            ) : (
                                              service.quantity_pending
                                            )}
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{
                                                  width: `${servicePercentage}%`,
                                                }}
                                              />
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                              {servicePercentage}%
                                            </p>
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                                service.status,
                                              )} whitespace-nowrap`}
                                            >
                                              {service.status?.toUpperCase() ||
                                                "PENDING"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Show message if no services */}
                      {so.expanded && so.services.length === 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={8} className="p-0">
                            <div className="px-3 py-4 border-t border-gray-200 text-center">
                              <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-xs">
                                No services found for this service order
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
