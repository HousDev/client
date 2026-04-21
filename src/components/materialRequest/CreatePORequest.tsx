// src/components/MaterialOutForm.tsx
import React, { SetStateAction, useEffect, useState, useRef } from "react";
import {
  X,
  Package,
  Calendar,
  User,
  Phone,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import RequestMaterialApi from "../../lib/requestMaterialApi";
import { useAuth } from "../../contexts/AuthContext";

interface MaterialOutFormProps {
  setViewRequestMaterial: React.Dispatch<SetStateAction<boolean>>;
  requestData?: any;
  loadMaterialRequests: any;
}

export default function CreatePORequest({
  setViewRequestMaterial,
  requestData,
  loadMaterialRequests,
}: MaterialOutFormProps) {
  console.log("req data for view", requestData);
  const { user, can } = useAuth();
  const [materialRequest, setMaterialRequest] = useState<any>(requestData);
  const modalRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quantityError, setQuantityError] = useState("");
  const [materialRequestStatusData, setMaterialRequestStatusData] = useState({
    id: "",
    status: "",
    rejectionReason: "",
  });
  const [
    showMaterialRequestRejectionModal,
    setShowMaterialRequestRejectionModal,
  ] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "partial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "low stock":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "in stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "out of stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600" />;
      case "processing":
        return <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />;
      case "pending":
        return (
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
        );
      case "rejected":
        return <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-600" />;
      default:
        return <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const rejectRequestMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestMaterialRes = await RequestMaterialApi.updateStatus(
        materialRequestStatusData.id,
        materialRequestStatusData.status,
        materialRequestStatusData.rejectionReason,
        user.id,
      );

      if (requestMaterialRes.success) {
        loadMaterialRequests();
        toast.success("Material Request Status Updated.");
        setViewRequestMaterial(false);
      } else {
        toast.error("Failed To Update Material Request Status.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  const approveQuantity = async () => {
    try {
      const payload = {
        materialRequestId: materialRequest.request_material_id,
        items: materialRequest.items,
        userId: user.id,
      };
      // console.log(payload);
      let s = true;
      for (const item of payload.items) {
        if (item.approveQuantity > 0) {
          s = false;
        }
      }
      if (s) {
        toast.warning("Add approve quantity.");
        return;
      }
      const approvedQuantityRes: any =
        await RequestMaterialApi.updateItems(payload);
      console.log(approvedQuantityRes);

      if (approvedQuantityRes.success) {
        loadMaterialRequests();
        setViewRequestMaterial(false);
        toast.success("Material Request Updated.");
      } else {
        toast.error("Failed to update Material Request.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const i = materialRequest.items.filter(
        (item: any) =>
          item.stock_status === "OUT OF STOCK" ||
          item.stock_status === "LOW STOCK",
      );

      const items = i.map((material: any) => ({
        itemId: material.request_material_item_id,
        required_quantity: Number(material.required_quantity),
        approved_quantity: material.approved_quantity,
      }));

      console.log(items);
      const total = items.reduce(
        (sum: number, elem: any) => (sum += Number(elem.quantity)),
        0,
      );

      if (total === 0) {
        toast.error("Please Enter Valid Quantity.");
      }

      const submissionData = {
        userId: user?.id,
        projectId: materialRequest.projectId,
        buildingId: materialRequest.buildingId,
        floorId: materialRequest.floorId,
        flatId: materialRequest.flatId,
        commonAreaId: materialRequest.commonAreaId,
        work: materialRequest.work,
        start_date: materialRequest.start_date,
        remark: materialRequest.remark,
        materials: items,
        previous_request_id: requestData.request_material_id,
      };
      console.log(submissionData);

      const response: any =
        await RequestMaterialApi.createPOMaterialRequest(submissionData);

      if (response.success) {
        loadMaterialRequests();
        toast.success("Material request created successfully!");
      } else {
        toast.error(response.message || "Failed to create material request");
      }
    } catch (error: any) {
      console.error(
        "Error creating material request:",
        error.response.data.message,
      );
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (!quantityError) return;

    const timer = setTimeout(() => {
      setQuantityError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [quantityError]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div
        ref={modalRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl lg:max-w-3xl my-2 sm:my-4 mx-2 border border-gray-300/50"
      >
        {/* Header with updated color theme */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex justify-between items-center rounded-t-lg sm:rounded-t-xl relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 via-transparent to-gray-900/10"></div>
          <div className="absolute -right-10 top-0 bottom-0 w-40 bg-gradient-to-l from-[#b52124]/20 to-transparent -skew-x-12"></div>

          <div className="flex items-center gap-2 sm:gap-3 relative z-10">
            <div className="p-1 sm:p-1.5 bg-white/10 backdrop-blur-sm rounded-md">
              <Package className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-100" />
            </div>
            <div className="">
              <h2 className="text-xs sm:text-sm lg:text-base font-bold text-white">
                Create Purchase Order Request.
              </h2>
              <div className="flex items-center gap-1">
                <span className="text-gray-300/90 text-[10px] sm:text-xs truncate">
                  {materialRequest.request_no}
                </span>
                <ChevronRight className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-gray-300/70" />
                <span className="text-gray-300/80 text-[10px] sm:text-xs truncate">
                  {materialRequest.project_name}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setViewRequestMaterial(false)}
            className="text-gray-200 hover:bg-gray-700/40 rounded-lg p-1 sm:p-1.5 transition-all duration-200 hover:scale-105 active:scale-95 relative z-10"
            aria-label="Close"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Content - Reduced height with responsive sizing */}
        <div className="p-2 sm:p-3 lg:p-4 max-h-[calc(60vh-80px)] sm:max-h-[calc(65vh-100px)] lg:max-h-[calc(70vh-120px)] overflow-y-auto custom-scrollbar">
          {/* Status Badge & Quick Info */}
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {getStatusIcon(materialRequest.status)}
                <span
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${getStatusColor(
                    materialRequest.status,
                  )}`}
                >
                  {materialRequest.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Request Information - Responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
            {/* Requester Info Card */}
            <div className="bg-white border border-gray-300 rounded-lg p-2.5 sm:p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="bg-[#b52124]/10 p-1 rounded">
                  <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#b52124]" />
                </div>
                <h3 className="font-semibold text-[#40423f] text-xs sm:text-sm">
                  Requester Information
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col xs:flex-row xs:items-center">
                  <span className="text-gray-600 text-[10px] sm:text-xs w-16 xs:w-20 sm:w-24 mb-0.5 xs:mb-0">
                    Name:
                  </span>
                  <span className="font-medium text-xs sm:text-sm truncate">
                    {materialRequest.user_name}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center">
                  <span className="text-gray-600 text-[10px] sm:text-xs w-16 xs:w-20 sm:w-24 mb-0.5 xs:mb-0">
                    Phone:
                  </span>
                  <span className="font-medium text-xs sm:text-sm flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                    {materialRequest.user_phone}
                  </span>
                </div>
                <div className="flex flex-col xs:flex-row xs:items-center">
                  <span className="text-gray-600 text-[10px] sm:text-xs w-16 xs:w-20 sm:w-24 mb-0.5 xs:mb-0">
                    Date:
                  </span>
                  <span className="font-medium text-xs sm:text-sm flex items-center gap-1">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                    {formatDate(materialRequest.start_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Project Information Card */}
            <div className="bg-white border border-gray-300 rounded-lg p-2.5 sm:p-3 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <div className="bg-[#b52124]/10 p-1 rounded">
                  <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#b52124]" />
                </div>
                <h3 className="font-semibold text-[#40423f] text-xs sm:text-sm">
                  Project Information
                </h3>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex flex-col xs:flex-row xs:items-center">
                  <span className="text-gray-600 text-[10px] sm:text-xs w-16 xs:w-20 sm:w-24 mb-0.5 xs:mb-0">
                    Project:
                  </span>
                  <span className="font-medium text-xs sm:text-sm truncate">
                    {materialRequest.project_name}
                  </span>
                </div>
              </div>
            </div>

            {materialRequest.remark && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-amber-100 p-1 rounded">
                    <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-700" />
                  </div>
                  <h3 className="font-semibold text-[#40423f] text-xs sm:text-sm">
                    Remarks
                  </h3>
                </div>
                <div className="max-h-16 sm:max-h-20 overflow-y-auto pr-1">
                  <p className="text-gray-700 text-[10px] sm:text-xs leading-relaxed">
                    {materialRequest.remark}
                  </p>
                </div>
              </div>
            )}
            {materialRequest.rejection_reason && (
              <div className="bg-gradient-to-r from-red-50 to-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-red-100 p-1 rounded">
                    <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-700" />
                  </div>
                  <h3 className="font-semibold text-[#40423f] text-xs sm:text-sm">
                    Rejection Reason
                  </h3>
                </div>
                <div className="max-h-16 sm:max-h-20 overflow-y-auto pr-1">
                  <p className="text-gray-700 text-[10px] sm:text-xs leading-relaxed">
                    {materialRequest.rejection_reason}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Materials List */}
          <div className="mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-semibold text-[#40423f] flex items-center gap-1.5">
                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-[#b52124]" />
                Requested Materials
              </h3>
            </div>

            {/* Mobile View - Card List */}
            {isMobile ? (
              <div className="space-y-2">
                {materialRequest.items.map((item: any, index: number) => (
                  <div
                    key={item.request_material_item_id || index}
                    className="bg-white border border-gray-300 rounded-lg p-2.5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="bg-[#b52124]/10 w-5 h-5 rounded flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#b52124]">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-xs text-[#40423f] truncate flex-1">
                          {item.item_name}
                        </span>
                        <span
                          className={`text-[10px] rounded px-1.5 py-0.5 ${
                            item.stock_status === "IN STOCK"
                              ? "bg-green-100 text-green-600"
                              : item.stock_status === "OUT OF STOCK"
                                ? "bg-red-100 text-red-600"
                                : "bg-orange-100 text-orange-600"
                          }`}
                        >
                          {item.stock_status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                      <div>
                        <div className="text-gray-600 mb-0.5">Required:</div>
                        <div className="flex items-center gap-0.5">
                          <span className="font-bold text-[#b52124]">
                            {item.required_quantity}
                          </span>
                          <span className="text-gray-500">
                            {"Unit : " + item.unit || "units"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-0.5">Stock:</div>
                        <div className="flex items-center gap-0.5">
                          <span className="font-bold text-[#40423f]">
                            {item.stock_quantity}
                          </span>
                          <span className="text-gray-500">
                            {item.unit || "units"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-0.5">Approved:</div>
                        <div className="flex items-center gap-0.5">
                          <span className="font-bold text-green-600">
                            {item.approved_quantity}
                          </span>
                          <span className="text-gray-500">
                            {item.unit || "units"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600 mb-0.5">Approve:</div>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.approveQuantity ?? ""}
                          disabled={
                            materialRequest.status !== "pending" ||
                            materialRequest.request_type === "po" ||
                            item.stock_quantity === 0
                          }
                          placeholder="Qty"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "") {
                              setMaterialRequest((prev: any) => ({
                                ...prev,
                                items: prev.items.map((i: any) =>
                                  i.request_material_item_id ===
                                  item.request_material_item_id
                                    ? { ...i, approveQuantity: "" }
                                    : i,
                                ),
                              }));
                              return;
                            }
                            if (!/^\d*\.?\d*$/.test(value)) return;
                            const numericValue = Number(value);
                            if (!Number.isNaN(numericValue)) {
                              if (numericValue > item.required_quantity) {
                                setQuantityError(
                                  "Entered value greater than required quantity.",
                                );
                                return;
                              } else if (
                                numericValue > Number(item.stock_quantity)
                              ) {
                                setQuantityError(
                                  "Entered value greater than stock quantity.",
                                );
                                return;
                              }
                            }
                            setMaterialRequest((prev: any) => ({
                              ...prev,
                              items: prev.items.map((i: any) =>
                                i.request_material_item_id ===
                                item.request_material_item_id
                                  ? { ...i, approveQuantity: value }
                                  : i,
                              ),
                            }));
                          }}
                          className="text-xs font-medium outline-none border border-gray-400 focus:border-[#b52124] w-12 sm:w-16 py-0.5 px-1.5 rounded"
                        />
                        {quantityError && (
                          <p className="text-red-500 text-[0.6rem] mt-1">
                            {quantityError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop View - Table */
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-[10px] sm:text-xs font-medium text-[#40423f]">
                          #
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-[10px] sm:text-xs font-medium text-[#40423f]">
                          Item Name
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-[10px] sm:text-xs font-medium text-[#40423f]">
                          Stock
                        </th>
                        <th className="px-2 sm:px-3 py-1.5 text-left text-[10px] sm:text-xs font-medium text-[#40423f]">
                          Required
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materialRequest.items.map((item: any, index: number) => (
                        <tr
                          key={item.request_material_item_id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-2 sm:px-3 py-1.5">
                            <div className="font-medium text-[#40423f] text-xs">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-1.5">
                            <div className="flex items-center gap-1">
                              <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500" />
                              <span className="font-medium text-xs truncate max-w-[120px] sm:max-w-[150px]">
                                {item.item_name}
                              </span>
                            </div>
                            <div className="text-[10px] text-gray-500 mt-0.5">
                              {"Unit : " + item.unit || "units"}
                            </div>
                          </td>
                          <td className="px-2 sm:px-3 py-1.5">
                            <div className="font-bold text-[#40423f] text-xs sm:text-sm">
                              {item.stock_quantity}
                            </div>
                          </td>
                          {materialRequest.request_type === "material" && (
                            <td className="px-2 sm:px-3 py-1.5">
                              <input
                                type="text"
                                inputMode="decimal"
                                value={item.required_quantity ?? ""}
                                disabled={
                                  materialRequest.status === "pending" &&
                                  item.stock_quantity !== 0
                                }
                                placeholder="Qty"
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (value === "") {
                                    setMaterialRequest((prev: any) => ({
                                      ...prev,
                                      items: prev.items.map((i: any) =>
                                        i.request_material_item_id ===
                                        item.request_material_item_id
                                          ? { ...i, required_quantity: "" }
                                          : i,
                                      ),
                                    }));
                                    return;
                                  }

                                  if (!/^\d*\.?\d*$/.test(value)) return;

                                  setMaterialRequest((prev: any) => ({
                                    ...prev,
                                    items: prev.items.map((i: any) =>
                                      i.request_material_item_id ===
                                      item.request_material_item_id
                                        ? { ...i, required_quantity: value }
                                        : i,
                                    ),
                                  }));
                                }}
                                className="text-xs font-medium outline-none border border-gray-400 focus:border-[#b52124] w-12 sm:w-16 py-0.5 px-1.5 rounded"
                              />
                              {quantityError && (
                                <p className="text-red-500 text-[0.6rem] mt-1">
                                  {quantityError}
                                </p>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {materialRequest.items.length === 0 && (
              <div className="text-center py-4 sm:py-6">
                <div className="bg-gray-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
                <p className="text-gray-600 text-xs sm:text-sm">
                  No materials requested
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {(requestData.status === "pending" ||
          requestData.status === "partial") && (
          <div className="flex flex-col xs:flex-row justify-between gap-2 pt-3 px-3 sm:px-4 border-t border-gray-300/50 pb-3">
            {requestData.items?.some(
              (i: any) =>
                i.stock_status === "OUT OF STOCK" ||
                i.stock_status === "LOW STOCK",
            ) &&
              !requestData.previous_request_id && (
                <div className="w-full">
                  {can("make_material_requests_for_po") && (
                    <button
                      onClick={handleSubmit}
                      className="w-full flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white py-1.5 px-4 rounded-lg hover:from-[#d43538] hover:to-[#b52124] transition-all font-medium text-xs sm:text-sm shadow-sm active:scale-[0.98]"
                    >
                      Create PO Request
                    </button>
                  )}
                </div>
              )}
          </div>
        )}

        {/* Custom scrollbar styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #b52124;
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d43538;
          }
        `}</style>
      </div>
    </div>
  );
}
