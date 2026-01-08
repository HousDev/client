import React, { SetStateAction } from "react";
import {
  X,
  Calendar,
  Package,
  UserRound,
  Phone,
  MapPin,
  Wrench,
  Building,
  Layers,
  Home,
  Truck,
  FileText,
  ChevronRight,
  Hash,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface TransactionData {
  transaction_id: number;
  po_number: string;
  challan_number: string;
  challan_image: string;
  vender_name: string;
  issue_date: string;
  trasaction_type: string;
  created_at: string;
  purpose: string;
  receiver_name: string;
  receiver_number: string;
  project_name: string;
  building_name: string;
  floor_name: string;
  delivery_location: string;
  remark: string;
  flat_name: string;
  common_area_name: string | null;
  vendor_name: string;
  receiving_date: string;
  receiver_phone: string;
  items: Array<{
    item_id: string;
    transaction_item_id: number;
    item_name: string;
    quantity_issued: number;
    initial_quantity: number;
  }>;
}

interface TransactionDetailsModalProps {
  transaction: TransactionData;
  setIsOpen: React.Dispatch<SetStateAction<boolean>>;
  transactionType: string;
}

export default function ViewTransaction({
  transaction,
  setIsOpen,
  transactionType,
}: TransactionDetailsModalProps) {
  // Calculate totals
  const totals = {
    issued: transaction.items.reduce(
      (sum, item) => sum + item.quantity_issued,
      0
    ),
    remaining: transaction.items.reduce(
      (sum, item) => sum + (item.initial_quantity - item.quantity_issued),
      0
    ),
  };

  // Get transaction type color - ALL using issueMaterial blue theme
  const getTransactionTypeColor = () => {
    // All transaction types use blue gradient
    return "bg-gradient-to-r from-blue-600 to-indigo-600";
  };

  // Get transaction type title
  const getTransactionTitle = () => {
    switch (transactionType) {
      case "issueMaterial":
        return "Material Issue";
      case "MaterialIn":
        return "Material In";
      case "MaterialOut":
        return "Material Out";
      default:
        return "Transaction";
    }
  };

  // Get section styling based on transaction type - ALL using issueMaterial blue theme
  const getSectionStyle = () => {
    // All transaction types use the same blue styling
    return {
      gradient: "from-blue-50 to-indigo-50",
      border: "border-blue-100",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      textColor: "text-blue-600",
      statGradient: "from-blue-50 to-indigo-50",
      statBorder: "border-blue-100",
      tableHeader: "from-blue-50 to-indigo-50/50",
      issuedColor: {
        bg: "bg-blue-100",
        text: "text-blue-600",
        icon: "text-blue-600",
      },
    };
  };

  const sectionStyle = getSectionStyle();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div
          className={`${getTransactionTypeColor()} px-6 py-4 relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Hash className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                  <span className="font-medium">{getTransactionTitle()}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>Transaction Details</span>
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Created on{" "}
                  {new Date(
                    transaction.created_at || transaction.issue_date
                  ).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200 hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-88px)]">
          {transactionType === "issueMaterial" && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
                    <Wrench className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Basic Information
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Transaction details and purpose
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Issue Date
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {new Date(transaction.issue_date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Purpose
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg capitalize">
                          {transaction.purpose}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">Vendor</div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.vendor_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Project
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.project_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Receiver
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Phone className="w-3 h-3" />
                          {transaction.receiver_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
                    <MapPin className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Location Details
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Material delivery location
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Building
                          className={`w-5 h-5 ${sectionStyle.iconColor}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Building</div>
                        <div className="font-medium text-gray-800">
                          {transaction.building_name}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Layers
                          className={`w-5 h-5 ${sectionStyle.iconColor}`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Floor</div>
                        <div className="font-medium text-gray-800">
                          {transaction.floor_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Home className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Flat</div>
                        <div className="font-medium text-gray-800">
                          {transaction.flat_name || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <div className="w-5 h-5 flex items-center justify-center text-gray-600">
                          CA
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-500">Common Area</div>
                        <div className="font-medium text-gray-800">
                          {transaction.common_area_name || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialIn" && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
                    <Package className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Receiving Information
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Material receipt details
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Receiving Date
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {new Date(
                            transaction.receiving_date
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Package className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          PO Number
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.po_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Truck className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">Vendor</div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.vender_name}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Delivery Location
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.delivery_location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Receiver
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Phone className="w-3 h-3" />
                          {transaction.receiver_phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Challan Number
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.challan_number}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialOut" && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
                    <Truck className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Dispatch Information
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Material dispatch details
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Receiving Date
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {new Date(
                            transaction.receiving_date
                          ).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Wrench className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Transaction Type
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.trasaction_type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FileText className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Remarks
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg capitalize">
                          {transaction.remark}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Delivery Location
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.delivery_location}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <UserRound className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-sm text-gray-500 mb-1">
                          Receiver
                        </div>
                        <div className="font-medium text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg">
                          {transaction.receiver_name}
                        </div>
                        <div className="text-gray-600 text-sm flex items-center gap-2 mt-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                          <Phone className="w-3 h-3" />
                          {transaction.receiver_phone}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 ${sectionStyle.iconBg} rounded-lg`}>
                  <Layers className={`w-5 h-5 ${sectionStyle.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Items Details
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Material quantities and stock information
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead
                  className={`bg-gradient-to-r ${sectionStyle.tableHeader}`}
                >
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <span>Item Name</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <span>Initial Stock</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-r border-gray-200">
                      <div className="flex items-center gap-2">
                        <span>
                          {transactionType === "MaterialIn"
                            ? "Received"
                            : "Issued"}
                        </span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>
                          {transactionType === "MaterialIn"
                            ? "Total Stock"
                            : "Remaining"}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transaction.items.map((item) => {
                    const remaining =
                      transactionType === "MaterialIn"
                        ? item.initial_quantity + item.quantity_issued
                        : item.initial_quantity - item.quantity_issued;

                    return (
                      <tr
                        key={item.transaction_item_id}
                        className="hover:bg-gray-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4 border-r border-gray-200">
                          <div className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {item.item_name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            ID: {item.item_id}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200">
                          <div className="text-gray-700 font-medium">
                            {item.initial_quantity}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-r border-gray-200">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${sectionStyle.iconBg}`}
                            >
                              {transactionType === "MaterialIn" ? (
                                <TrendingUp
                                  className={`w-4 h-4 ${sectionStyle.iconColor}`}
                                />
                              ) : (
                                <TrendingDown
                                  className={`w-4 h-4 ${sectionStyle.iconColor}`}
                                />
                              )}
                            </div>
                            <span
                              className={`font-bold ${sectionStyle.textColor}`}
                            >
                              {item.quantity_issued}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-1.5 rounded-lg ${
                                remaining >= 0 ? "bg-green-100" : "bg-red-100"
                              }`}
                            >
                              {remaining >= 0 ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </div>
                            <span
                              className={`font-bold ${
                                remaining >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {remaining}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-200/50 flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// import React, { SetStateAction } from "react";
// import {
//   X,
//   Calendar,
//   Package,
//   UserRound,
//   Phone,
//   MapPin,
//   Wrench,
//   Building,
//   Layers,
//   Home,
//   Truck,
//   FileText,
// } from "lucide-react";

// interface TransactionData {
//   transaction_id: number;
//   po_number: string;
//   challan_number: string;
//   challan_image: string;
//   vender_name: string;
//   issue_date: string;
//   trasaction_type: string;
//   created_at: string;
//   purpose: string;
//   receiver_name: string;
//   receiver_number: string;
//   project_name: string;
//   building_name: string;
//   floor_name: string;
//   delivery_location: string;
//   remark: string;
//   flat_name: string;
//   common_area_name: string | null;
//   vendor_name: string;
//   receiving_date: string;
//   receiver_phone: string;
//   items: Array<{
//     item_id: string;
//     transaction_item_id: number;
//     item_name: string;
//     quantity_issued: number;
//     initial_quantity: number;
//   }>;
// }

// interface TransactionDetailsModalProps {
//   transaction: TransactionData;
//   setIsOpen: React.Dispatch<SetStateAction<boolean>>;
//   transactionType: string;
// }

// export default function ViewTransaction({
//   transaction,
//   setIsOpen,
//   transactionType,
// }: TransactionDetailsModalProps) {
//   // Calculate totals
//   const totals = {
//     issued: transaction.items.reduce(
//       (sum, item) => sum + item.quantity_issued,
//       0
//     ),
//     remaining: transaction.items.reduce(
//       (sum, item) => sum + (item.initial_quantity - item.quantity_issued),
//       0
//     ),
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
//         {/* Header */}
//         <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
//           <div>
//             <h2 className="text-xl font-bold text-white">
//               Transaction #{transaction.transaction_id}
//             </h2>
//             <p className="text-blue-100 text-sm mt-1">
//               {transactionType === "issueMaterial" &&
//                 "Material Issue Transaction"}
//               {transactionType === "MaterialIn" && "Material In Transaction"}
//               {transactionType === "MaterialOut" && "Material Out Transaction"}
//             </p>
//           </div>
//           <button
//             onClick={() => setIsOpen(false)}
//             className="text-white hover:bg-blue-700 rounded-lg p-2 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//           {transactionType === "issueMaterial" && (
//             <div>
//               {/* Basic Information - Simple Grid */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Calendar className="w-4 h-4" />
//                         Issue Date
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {new Date(transaction.issue_date).toLocaleDateString()}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Wrench className="w-4 h-4" />
//                         Purpose
//                       </div>
//                       <div className="font-medium text-gray-800 capitalize">
//                         {transaction.purpose}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Truck className="w-4 h-4" />
//                         Vendor
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.vendor_name}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <MapPin className="w-4 h-4" />
//                         Project
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.project_name}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <UserRound className="w-4 h-4" />
//                         Receiver
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.receiver_name}
//                       </div>
//                       <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
//                         <Phone className="w-3 h-3" />
//                         {transaction.receiver_number}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Location Details */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
//                   Location Details
//                 </h3>
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="flex items-start gap-3">
//                     <Building className="w-5 h-5 text-gray-400 mt-1" />
//                     <div>
//                       <div className="text-sm text-gray-500">Building</div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.building_name}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Layers className="w-5 h-5 text-gray-400 mt-1" />
//                     <div>
//                       <div className="text-sm text-gray-500">Floor</div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.floor_name}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="flex items-start gap-3">
//                     <Home className="w-5 h-5 text-gray-400 mt-1" />
//                     <div>
//                       <div className="text-sm text-gray-500">Flat</div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.flat_name || "N/A"}
//                       </div>
//                     </div>
//                   </div>

//                   <div>
//                     <div className="text-sm text-gray-500 mb-1">
//                       Common Area
//                     </div>
//                     <div className="font-medium text-gray-800">
//                       {transaction.common_area_name || "N/A"}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {transactionType === "MaterialIn" && (
//             <div>
//               {/* Basic Information */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Calendar className="w-4 h-4" />
//                         Receiving Date
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {new Date(
//                           transaction.receiving_date
//                         ).toLocaleDateString()}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Package className="w-4 h-4" />
//                         PO Number
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.po_number}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Truck className="w-4 h-4" />
//                         Vendor
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.vender_name}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <FileText className="w-4 h-4" />
//                         Challan Number
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.challan_number}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <MapPin className="w-4 h-4" />
//                         Delivery Location
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.delivery_location}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <UserRound className="w-4 h-4" />
//                         Receiver
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.receiver_name}
//                       </div>
//                       <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
//                         <Phone className="w-3 h-3" />
//                         {transaction.receiver_phone}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <FileText className="w-4 h-4" />
//                         Transaction Type
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.trasaction_type}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Calendar className="w-4 h-4" />
//                         Created At
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {new Date(transaction.created_at).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {transactionType === "MaterialOut" && (
//             <div>
//               {/* Basic Information */}
//               <div className="mb-8">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
//                   Basic Information
//                 </h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Calendar className="w-4 h-4" />
//                         Receiving Date
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {new Date(
//                           transaction.receiving_date
//                         ).toLocaleDateString()}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Wrench className="w-4 h-4" />
//                         Transaction Type
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.trasaction_type}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <FileText className="w-4 h-4" />
//                         Remarks
//                       </div>
//                       <div className="font-medium text-gray-800 capitalize">
//                         {transaction.remark}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-3">
//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <MapPin className="w-4 h-4" />
//                         Delivery Location
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.delivery_location}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <UserRound className="w-4 h-4" />
//                         Receiver
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {transaction.receiver_name}
//                       </div>
//                       <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
//                         <Phone className="w-3 h-3" />
//                         {transaction.receiver_phone}
//                       </div>
//                     </div>

//                     <div>
//                       <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
//                         <Calendar className="w-4 h-4" />
//                         Created At
//                       </div>
//                       <div className="font-medium text-gray-800">
//                         {new Date(transaction.created_at).toLocaleDateString()}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Items Section */}
//           {transactionType !== "MaterialIn" ? (
//             <div className="mb-8">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Issued Items
//                 </h3>
//                 <div className="flex items-center gap-4 text-sm">
//                   <div className="text-gray-600">
//                     Total Issued:{" "}
//                     <span className="font-bold text-blue-600">
//                       {totals.issued}
//                     </span>
//                   </div>
//                   <div className="text-gray-600">
//                     Remaining:{" "}
//                     <span
//                       className={`font-bold ${
//                         totals.remaining > 0 ? "text-green-600" : "text-red-600"
//                       }`}
//                     >
//                       {totals.remaining}
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Item Name
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Initial Stock
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Issued
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
//                         Remaining
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {transaction.items.map((item) => {
//                       const remaining =
//                         item.initial_quantity - item.quantity_issued;

//                       return (
//                         <tr
//                           key={item.transaction_item_id}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="font-medium text-gray-800">
//                               {item.item_name}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="text-gray-700">
//                               {item.initial_quantity}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="text-blue-600 font-medium">
//                               {item.quantity_issued}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div
//                               className={`font-medium ${
//                                 remaining > 0
//                                   ? "text-green-600"
//                                   : "text-red-600"
//                               }`}
//                             >
//                               {remaining}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ) : (
//             <div className="mb-8">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Issued Items
//                 </h3>
//               </div>

//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Item Name
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Initial Stock
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
//                         Issued
//                       </th>
//                       <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
//                         Total Stock
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {transaction.items.map((item) => {
//                       const remaining =
//                         item.initial_quantity + item.quantity_issued;

//                       return (
//                         <tr
//                           key={item.transaction_item_id}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="font-medium text-gray-800">
//                               {item.item_name}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="text-gray-700">
//                               {item.initial_quantity}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3 border-r border-gray-200">
//                             <div className="text-blue-600 font-medium">
//                               {item.quantity_issued}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div
//                               className={`font-medium ${
//                                 remaining > 0
//                                   ? "text-green-600"
//                                   : "text-red-600"
//                               }`}
//                             >
//                               {remaining}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}

//           {/* Footer Actions */}
//           <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
//             {/* <button
//               onClick={() => window.print()}
//               className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
//             >
//               <Printer className="w-4 h-4" />
//               Print
//             </button> */}
//             <button
//               onClick={() => setIsOpen(false)}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
