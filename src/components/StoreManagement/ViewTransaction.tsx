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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              Transaction #{transaction.transaction_id}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {transactionType === "issueMaterial" &&
                "Material Issue Transaction"}
              {transactionType === "MaterialIn" && "Material In Transaction"}
              {transactionType === "MaterialOut" && "Material Out Transaction"}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-blue-700 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {transactionType === "issueMaterial" && (
            <div>
              {/* Basic Information - Simple Grid */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        Issue Date
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(transaction.issue_date).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Wrench className="w-4 h-4" />
                        Purpose
                      </div>
                      <div className="font-medium text-gray-800 capitalize">
                        {transaction.purpose}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Truck className="w-4 h-4" />
                        Vendor
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.vendor_name}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        Project
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.project_name}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <UserRound className="w-4 h-4" />
                        Receiver
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.receiver_name}
                      </div>
                      <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {transaction.receiver_number}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Location Details
                </h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Building</div>
                      <div className="font-medium text-gray-800">
                        {transaction.building_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Layers className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Floor</div>
                      <div className="font-medium text-gray-800">
                        {transaction.floor_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <div className="text-sm text-gray-500">Flat</div>
                      <div className="font-medium text-gray-800">
                        {transaction.flat_name || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-500 mb-1">
                      Common Area
                    </div>
                    <div className="font-medium text-gray-800">
                      {transaction.common_area_name || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialIn" && (
            <div>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        Receiving Date
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(
                          transaction.receiving_date
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Package className="w-4 h-4" />
                        PO Number
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.po_number}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Truck className="w-4 h-4" />
                        Vendor
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.vender_name}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <FileText className="w-4 h-4" />
                        Challan Number
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.challan_number}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        Delivery Location
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.delivery_location}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <UserRound className="w-4 h-4" />
                        Receiver
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.receiver_name}
                      </div>
                      <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {transaction.receiver_phone}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <FileText className="w-4 h-4" />
                        Transaction Type
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.trasaction_type}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        Created At
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {transactionType === "MaterialOut" && (
            <div>
              {/* Basic Information */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        Receiving Date
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(
                          transaction.receiving_date
                        ).toLocaleDateString()}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Wrench className="w-4 h-4" />
                        Transaction Type
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.trasaction_type}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <FileText className="w-4 h-4" />
                        Remarks
                      </div>
                      <div className="font-medium text-gray-800 capitalize">
                        {transaction.remark}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <MapPin className="w-4 h-4" />
                        Delivery Location
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.delivery_location}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <UserRound className="w-4 h-4" />
                        Receiver
                      </div>
                      <div className="font-medium text-gray-800">
                        {transaction.receiver_name}
                      </div>
                      <div className="text-gray-600 text-sm flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        {transaction.receiver_phone}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        Created At
                      </div>
                      <div className="font-medium text-gray-800">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Items Section */}
          {transactionType !== "MaterialIn" ? (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Issued Items
                </h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-gray-600">
                    Total Issued:{" "}
                    <span className="font-bold text-blue-600">
                      {totals.issued}
                    </span>
                  </div>
                  <div className="text-gray-600">
                    Remaining:{" "}
                    <span
                      className={`font-bold ${
                        totals.remaining > 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {totals.remaining}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Initial Stock
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Issued
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transaction.items.map((item) => {
                      const remaining =
                        item.initial_quantity - item.quantity_issued;

                      return (
                        <tr
                          key={item.transaction_item_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="font-medium text-gray-800">
                              {item.item_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="text-gray-700">
                              {item.initial_quantity}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="text-blue-600 font-medium">
                              {item.quantity_issued}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`font-medium ${
                                remaining > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {remaining}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Issued Items
                </h3>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Item Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Initial Stock
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-r border-gray-200">
                        Issued
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        Total Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {transaction.items.map((item) => {
                      const remaining =
                        item.initial_quantity + item.quantity_issued;

                      return (
                        <tr
                          key={item.transaction_item_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="font-medium text-gray-800">
                              {item.item_name}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="text-gray-700">
                              {item.initial_quantity}
                            </div>
                          </td>
                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="text-blue-600 font-medium">
                              {item.quantity_issued}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div
                              className={`font-medium ${
                                remaining > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {remaining}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-6 border-t border-gray-200 flex justify-end gap-3">
            {/* <button
              onClick={() => window.print()}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button> */}
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
