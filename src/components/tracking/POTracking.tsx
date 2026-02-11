import React, { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import poApi from "../../lib/poApi";
import po_trackingApi from "../../lib/po_tracking";
import vendorApi from "../../lib/vendorApi";
import ItemsApi from "../../lib/itemsApi";
import projectApi from "../../lib/projectApi";

// Types

type POMaterial = {
  id: string;
  item_id?: string;
  item_name?: string;
  hsn_code?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: string;
  unit?: string;
  item?: any;
};

type POData = {
  id: string;
  po_number: string;
  vendor: {
    id: string;
    name: string;
  };
  project: string;
  amount: string;
  po_status: string;
  material_status: string;
  payment_status: string;
  balance_amount: string;
  po_date: string;
  vendor_id: string;
  purchase_order?: any;
  materials: POMaterial[];
  expanded: boolean;
  total_ordered: number;
  total_received: number;
  total_pending: number;
  overall_status: string;
};

export default function POTracking() {
  const [poData, setPoData] = useState<POData[]>([]);
  const [loading, setLoading] = useState(true);

  // Bulk selection
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Column search states
  const [searchPONumber, setSearchPONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchPOStatus, setSearchPOStatus] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
  const loadAllPOs = async () => {
    try {
      const posRes: any = await poApi.getPOs();
      const poMaterialTrackRes: any = await po_trackingApi.getTrackings();
      const vendorsRes: any = await vendorApi.getVendors();
      const itemsRes: any = await ItemsApi.getItems();
      const projectsData: any = await projectApi.getProjects();

      const poWithVendors = posRes.map((po: any) => {
        const vendorData = vendorsRes.find((v: any) => v.id === po.vendor_id);
        return { ...po, vendor: vendorData };
      });

      const idsSet = new Set(posRes.map((item: any) => item.id));
      const filteredPoMaterialTracking = poMaterialTrackRes.filter(
        (item: any) => idsSet.has(item.po_id),
      );

      // Group materials by PO
      const poMap = new Map<string, POData>();

      poWithVendors.forEach((po: any) => {
        const proData = Array.isArray(projectsData.data)
          ? projectsData.data
          : [];

        const project = proData.find(
          (project: any) => project.id === Number(po.project_id),
        );

        poMap.set(po.id, {
          id: po.id,
          po_number: po.po_number,
          vendor: po.vendor,
          project: project?.name || "--",
          amount: po.grand_total,
          po_status: po.status,
          material_status: po.material_status,
          payment_status: po.payment_status,
          balance_amount: po.balance_amount,
          po_date: new Date(po.created_at).toLocaleDateString(),
          vendor_id: po.vendor_id,
          purchase_order: po,
          materials: [],
          expanded: false,
          total_ordered: 0,
          total_received: 0,
          total_pending: 0,
          overall_status: "pending",
        });
      });

      filteredPoMaterialTracking.forEach((mt: any) => {
        const po = poMap.get(mt.po_id);
        if (po) {
          const itemData = itemsRes.find(
            (i: any) => i.id === Number(mt.item_id),
          );

          const material: POMaterial = {
            id: mt.id,
            item_id: mt.item_id,
            item_name: itemData?.item_name,
            hsn_code: itemData?.hsn_code,
            quantity_ordered: Number(mt.quantity_ordered || 0),
            quantity_received: Number(mt.quantity_received || 0),
            quantity_pending: Number(mt.quantity_pending || 0),
            status: mt.status || "pending",
            unit: itemData?.unit,
            item: itemData,
          };

          po.materials.push(material);

          // Update PO totals
          po.total_ordered += material.quantity_ordered;
          po.total_received += material.quantity_received;
          po.total_pending += material.quantity_pending;
        }
      });

      // Calculate overall status for each PO
      poMap.forEach((po) => {
        if (po.materials.length === 0) {
          po.overall_status = "pending";
        } else if (po.materials.every((m) => m.status === "completed")) {
          po.overall_status = "completed";
        } else if (
          po.materials.some(
            (m) => m.status === "partial" || m.status === "completed",
          )
        ) {
          po.overall_status = "partial";
        } else {
          po.overall_status = "pending";
        }
      });

      const poDataArray = Array.from(poMap.values());
      setPoData(poDataArray);
      setLoading(false);
      setSelectedPOs([]);
      setSelectAll(false);
    } catch (error) {
      toast.error("Something Went Wrong.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPOs();
  }, []);

  const togglePOExpand = (poId: string) => {
    setPoData((prev) =>
      prev.map((po) =>
        po.id === poId ? { ...po, expanded: !po.expanded } : po,
      ),
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

  const calculatePercentage = (received: number, ordered: number) => {
    return ordered > 0 ? Math.round((received * 100) / ordered) : 0;
  };

  // Handle PO selection
  const togglePOSelection = (poId: string) => {
    setSelectedPOs((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId],
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPOs([]);
    } else {
      setSelectedPOs(filteredPOs.map((po) => po.id));
    }
    setSelectAll(!selectAll);
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Filter function
  // Update the filter function
  const filteredPOs = poData.filter((po) => {
    const matchesPONumber =
      searchPONumber === "" ||
      (po.po_number || "").toLowerCase().includes(searchPONumber.toLowerCase());

    const matchesVendor =
      searchVendor === "" ||
      (po.vendor?.name || "")
        .toLowerCase()
        .includes(searchVendor.toLowerCase());

    const matchesProject =
      searchProject === "" ||
      (po.project || "").toLowerCase().includes(searchProject.toLowerCase());

    const matchesStatus =
      searchStatus === "" ||
      (po.overall_status || "")
        .toLowerCase()
        .includes(searchStatus.toLowerCase());

    // New filters
    const matchesAmount =
      searchAmount === "" ||
      formatCurrency(Number(po.amount))
        .toLowerCase()
        .includes(searchAmount.toLowerCase());

    const matchesPOStatus =
      searchPOStatus === "" ||
      (po.po_status || "").toLowerCase().includes(searchPOStatus.toLowerCase());

    const matchesPaymentStatus =
      searchPaymentStatus === "" ||
      (po.payment_status || "")
        .toLowerCase()
        .includes(searchPaymentStatus.toLowerCase());

    return (
      matchesPONumber &&
      matchesVendor &&
      matchesProject &&
      matchesStatus &&
      matchesAmount &&
      matchesPOStatus &&
      matchesPaymentStatus
    );
  });

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 px-0 md:p-0 -mt-3.5 bg-gray-50 ">
      {/* Summary Cards - Responsive */}
      <div className="sticky top-20 z-10  mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 mx-0">
        {/* Total POs */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Total PO</p>
            <p className="text-sm font-semibold text-gray-800">
              {poData.length}
            </p>
          </div>
          <Package className="w-5 h-5 text-blue-500/30" />
        </div>

        {/* Pending */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Pending</p>
            <p className="text-sm font-semibold text-gray-800">
              {poData.filter((po) => po.overall_status === "pending").length}
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-400/40" />
        </div>

        {/* Partial */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Partial</p>
            <p className="text-sm font-semibold text-yellow-600">
              {poData.filter((po) => po.overall_status === "partial").length}
            </p>
          </div>
          <Truck className="w-5 h-5 text-yellow-500/40" />
        </div>

        {/* Completed */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Completed</p>
            <p className="text-sm font-semibold text-green-600">
              {poData.filter((po) => po.overall_status === "completed").length}
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500/40" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-230px)] md:max-h-[calc(92vh-160px)] ">
          <table className=" w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {" "}
              {/* Header Row */}
              <tr>
                <th className="px-3 py-2 text-center w-6">
                  <div className="flex items-center justify-center">#</div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PO Number
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
                    PO Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Material Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </div>
                </th>
              </tr>
              {/* Search Row - Compact height */}
              {/* Search Row - Compact height */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search PO..."
                    value={searchPONumber}
                    onChange={(e) => setSearchPONumber(e.target.value)}
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
                    placeholder="Search PO status..."
                    value={searchPOStatus}
                    onChange={(e) => setSearchPOStatus(e.target.value)}
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
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">
                      No purchase orders found
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Try adjusting your search
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po, index) => {
                  const overallPercentage = calculatePercentage(
                    po.total_received,
                    po.total_ordered,
                  );
                  const isSelected = selectedPOs.includes(po.id);

                  return (
                    <React.Fragment key={po.id}>
                      {/* PO Summary Row */}
                      <tr
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => togglePOExpand(po.id)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              {po.expanded ? (
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
                              {po.po_number.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 text-xs truncate block max-w-[120px]">
                                {po.po_number}
                              </span>
                              <p className="text-[10px] text-gray-500 whitespace-nowrap">
                                {po.po_date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="text-gray-900 text-xs truncate block max-w-[120px]"
                              title={po.vendor?.name || "--"}
                            >
                              {po.vendor?.name || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="font-medium text-gray-900 text-xs truncate block max-w-[120px]"
                              title={po.project || "--"}
                            >
                              {po.project || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
                            {formatCurrency(Number(po.amount))}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              po.po_status,
                            )} whitespace-nowrap`}
                          >
                            {po.po_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-0.5 min-w-0">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                po.material_status,
                              )} truncate`}
                            >
                              {po.material_status?.toUpperCase() || "PENDING"}
                            </span>
                            {po.total_ordered > 0 && (
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
                                  po.payment_status,
                                )} truncate`}
                              >
                                {po.payment_status?.toUpperCase() || "PENDING"}
                              </span>

                              {Number(po.balance_amount) > 0 && (
                                <span
                                  className="text-[10px] text-gray-600 whitespace-nowrap"
                                  title={`Balance: ${formatCurrency(Number(po.balance_amount))}`}
                                >
                                  Bal:{" "}
                                  {formatCurrency(
                                    Number(po.balance_amount),
                                  ).replace("₹", "₹ ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      {po.expanded && po.materials.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="p-0">
                            <div className="px-3 py-2 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Items in PO {po.po_number}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full bg-white rounded-lg border border-gray-200 min-w-[600px]">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Item
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        HSN Code
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Ordered
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Received
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
                                    {po.materials.map((material, idx) => {
                                      const materialPercentage =
                                        calculatePercentage(
                                          material.quantity_received,
                                          material.quantity_ordered,
                                        );

                                      return (
                                        <tr
                                          key={material.id}
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
                                                material.item_name || "Unknown"
                                              }
                                            >
                                              {material.item_name || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              Unit: {material.unit || "N/A"}
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-gray-700 text-xs">
                                            {material.hsn_code || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                            {material.quantity_ordered}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-green-600 text-xs">
                                            {material.quantity_received}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-orange-600 text-xs">
                                            {material.quantity_pending > 0 ? (
                                              <span className="flex items-center gap-0.5">
                                                <AlertTriangle className="w-2.5 h-2.5" />
                                                {material.quantity_pending}
                                              </span>
                                            ) : (
                                              material.quantity_pending
                                            )}
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{
                                                  width: `${materialPercentage}%`,
                                                }}
                                              />
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                              {materialPercentage}%
                                            </p>
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                                material.status,
                                              )} whitespace-nowrap`}
                                            >
                                              {material.status?.toUpperCase() ||
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

                      {/* Show message if no materials */}
                      {po.expanded && po.materials.length === 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="p-0">
                            <div className="px-3 py-4 border-t border-gray-200 text-center">
                              <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-xs">
                                No materials found for this purchase order
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
