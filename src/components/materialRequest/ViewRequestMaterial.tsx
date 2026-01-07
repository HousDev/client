// src/components/MaterialOutForm.tsx
import React, { SetStateAction, useEffect, useState } from "react";
import {
  X,
  Package,
  Calendar,
  User,
  Phone,
  Building,
  Layers,
  Home,
  DoorOpen,
  Pickaxe,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MaterialOutFormProps {
  setViewRequestMaterial: React.Dispatch<SetStateAction<boolean>>;
  requestData?: any;
}

export default function ViewRequestMaterial({
  setViewRequestMaterial,
  requestData,
}: MaterialOutFormProps) {
  console.log(requestData);
  const materialRequest = requestData || {
    request_material_id: 2,
    request_no: "RM/2026/0002",
    user_name: "Sachin Paithane",
    user_phone: "1234567890",
    project_name: "SAI Construction Project",
    building_name: "Building 1",
    floor_name: "Ground Floor",
    flat_name: null,
    common_area_name: null,
    work: "Plastering Work",
    start_date: "2026-01-10",
    remark:
      "Urgent requirement for finishing work. Need materials by tomorrow morning for the scheduled plastering work.",
    status: "pending",
    items: [
      {
        request_material_item_id: 3,
        item_name: "Cement",
        required_quantity: 50,
        unit: "bags",
      },
      {
        request_material_item_id: 4,
        item_name: "Steel Rods",
        required_quantity: 100,
        unit: "pieces",
      },
      {
        request_material_item_id: 5,
        item_name: "Sand",
        required_quantity: 200,
        unit: "cubic feet",
      },
      {
        request_material_item_id: 6,
        item_name: "Bricks",
        required_quantity: 500,
        unit: "pieces",
      },
    ],
  };

  const [isMobile, setIsMobile] = useState(false);

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
        return "bg-yellow-50 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-50 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-50 text-red-800 border-red-200";
      case "processing":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "completed":
        return "bg-purple-50 text-purple-800 border-purple-200";
      default:
        return "bg-gray-50 text-gray-800 border-gray-200";
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

  const getTotalQuantity = () => {
    return materialRequest.items.reduce(
      (sum: number, item: any) => sum + (item.required_quantity || 0),
      0
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl my-4 sm:my-8 mx-2">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-t-xl sm:rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg">
              <Package className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="max-w-[calc(100%-60px)]">
              <h2 className="text-base sm:text-xl font-bold text-white truncate">
                Material Request Details
              </h2>
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-blue-100 text-xs sm:text-sm truncate">
                  {materialRequest.request_no}
                </span>
                <ChevronRight className="w-3 h-3 text-blue-200" />
                <span className="text-blue-200 text-xs sm:text-sm truncate">
                  {materialRequest.project_name}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setViewRequestMaterial(false)}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition active:scale-95"
            aria-label="Close"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4 md:p-6 max-h-[calc(70vh-120px)] sm:max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Status Badge & Quick Info */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {getStatusIcon(materialRequest.status)}
                <span
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                    materialRequest.status
                  )}`}
                >
                  {materialRequest.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Request Information - Mobile Stacked, Desktop Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Left Column - Requester & Project Info */}
            <div className="space-y-4 sm:space-y-4">
              {/* Requester Info Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    Requester Information
                  </h3>
                </div>
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 text-xs sm:text-sm w-24 sm:w-32 mb-1 sm:mb-0">
                      Name:
                    </span>
                    <span className="font-medium text-sm sm:text-base truncate">
                      {materialRequest.user_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 text-xs sm:text-sm w-24 sm:w-32 mb-1 sm:mb-0">
                      Phone:
                    </span>
                    <span className="font-medium text-sm sm:text-base flex items-center gap-1">
                      <Phone className="w-3 h-3 text-gray-500" />
                      {materialRequest.user_phone}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 text-xs sm:text-sm w-24 sm:w-32 mb-1 sm:mb-0">
                      Request Date:
                    </span>
                    <span className="font-medium text-sm sm:text-base flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      {formatDate(materialRequest.start_date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Project Information Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-green-50 p-2 rounded-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    Project Information
                  </h3>
                </div>
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 text-xs sm:text-sm w-24 sm:w-32 mb-1 sm:mb-0">
                      Project:
                    </span>
                    <span className="font-medium text-sm sm:text-base truncate">
                      {materialRequest.project_name}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <span className="text-gray-600 text-xs sm:text-sm w-24 sm:w-32 mb-1 sm:mb-0">
                      Work Type:
                    </span>
                    <span className="font-medium text-sm sm:text-base flex items-center gap-1">
                      <Pickaxe className="w-3 h-3 text-gray-500" />
                      <span className="truncate">{materialRequest.work}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Location & Remarks */}
            <div className="space-y-4 sm:space-y-4">
              {/* Location Details Card */}
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-purple-50 p-2 rounded-lg">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    Location Details
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-1.5 rounded">
                      <Building className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Building</p>
                      <p className="font-medium text-sm sm:text-base truncate">
                        {materialRequest.building_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-1.5 rounded">
                      <Layers className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">Floor</p>
                      <p className="font-medium text-sm sm:text-base truncate">
                        {materialRequest.floor_name}
                      </p>
                    </div>
                  </div>
                  {materialRequest.flat_name ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-1.5 rounded">
                        <Home className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Flat</p>
                        <p className="font-medium text-sm sm:text-base truncate">
                          {materialRequest.flat_name}
                        </p>
                      </div>
                    </div>
                  ) : materialRequest.common_area_name ? (
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-50 p-1.5 rounded">
                        <DoorOpen className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500">Common Area</p>
                        <p className="font-medium text-sm sm:text-base truncate">
                          {materialRequest.common_area_name}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Remarks Card */}
              {materialRequest.remark && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-amber-100 p-1.5 rounded-lg">
                      <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 text-amber-700" />
                    </div>
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                      Remarks
                    </h3>
                  </div>
                  <div className="max-h-20 sm:max-h-24 overflow-y-auto pr-2">
                    <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
                      {materialRequest.remark}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Materials List */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Requested Materials
              </h3>
            </div>

            {/* Mobile View - Card List */}
            {isMobile ? (
              <div className="space-y-3">
                {materialRequest.items.map((item: any, index: number) => (
                  <div
                    key={item.request_material_item_id || index}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-blue-50 w-6 h-6 rounded flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-medium text-sm text-gray-800 truncate">
                          {item.item_name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        Required Quantity:
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-base font-bold text-blue-600">
                          {item.required_quantity}
                        </span>
                        <span className="text-xs text-gray-500">
                          {item.unit || "units"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop View - Table */
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                          Item Name
                        </th>

                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                          Required Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">
                          Stock Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {materialRequest.items.map((item: any, index: number) => (
                        <tr
                          key={item.request_material_item_id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800 text-sm">
                              {index + 1}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                              <span className="font-medium text-sm sm:text-base truncate max-w-[200px]">
                                {item.item_name}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <div className="font-bold text-blue-600 text-sm sm:text-base">
                              {item.required_quantity}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs sm:text-sm text-gray-600">
                              {item.unit || "units"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`font-mono text-xs sm:text-sm rounded-lg ${
                                item.status === "IN STOCK"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              } px-2 py-1 rounded inline-block font-medium`}
                            >
                              {item.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {materialRequest.items.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 text-sm sm:text-base">
                  No materials requested
                </p>
                <p className="text-gray-500 text-xs sm:text-sm mt-1">
                  This request doesn't contain any material items
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 sm:pt-6 border-t px-6 py-3  ">
          <button
            onClick={() => {
              // Add any action you want here (e.g., approve request)
              toast.success("Request approved successfully!");
            }}
            className=" bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 px-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Approve
          </button>
          <button
            onClick={() => {
              // Add reject action here
              toast.error("Request rejected!");
            }}
            className="flex-1 border border-red-300 text-red-600 py-2  px-6 rounded-xl hover:bg-red-50 transition-all font-medium text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Reject
          </button>
          <button
            onClick={() => setViewRequestMaterial(false)}
            className="flex-1 border border-gray-300 text-gray-700 py-2  px-6 rounded-xl hover:bg-gray-50 transition-all font-medium text-sm sm:text-base shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
