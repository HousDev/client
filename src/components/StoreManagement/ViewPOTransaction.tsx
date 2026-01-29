// src/components/MaterialInForm.tsx
import React, { useState, useEffect, SetStateAction } from "react";
import {
  X,
  Save,
  Package,
  Truck,
  Calendar,
  Phone,
  MapPin,
  UserRound,
} from "lucide-react";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import po_trackingApi from "../../lib/po_tracking";

interface MaterialInpoTransaction {
  po_id: string;
  po_number: string;
  challanNumber: string;
  vendor: string;
  vendor_id: number;
  receivingDate: string;
  receiverName: string;
  receiverPhone: string;
  deliveryLocation: string;
  challan_image: File | null;
  items: any;
}

export default function ViewPOTransaction({
  viewPOTransaction,
  setActiveFormTab,
}: {
  viewPOTransaction: any;
  setActiveFormTab: React.Dispatch<SetStateAction<String>>;
}) {
  console.log(viewPOTransaction);
  const [vendors, setVendors] = useState<any>([]);
  const [allPOItems, setAllPOItems] = useState<any>([]);
  const [purchaseOrders, setPurchaseOrder] = useState<any>([]);
  const [poMaterialTracking, setPoMaterialTracking] = useState<any>([]);
  const [showChallans, setShowChallans] = useState(false);

  const [poTransaction, setPoTransaction] = useState<MaterialInpoTransaction>({
    po_id: viewPOTransaction.po_id,
    po_number: viewPOTransaction.po_number,
    challanNumber: viewPOTransaction.challan_number,
    vendor: viewPOTransaction.vendor,
    vendor_id: viewPOTransaction.vendor_id,
    receivingDate: new Date(viewPOTransaction.receiving_date)
      .toISOString()
      .split("T")[0],
    receiverName: viewPOTransaction.receiver_name,
    receiverPhone: viewPOTransaction.receiver_phone,
    deliveryLocation: viewPOTransaction.delivery_location,
    challan_image: viewPOTransaction.challan_image,
    items: [],
  });

  const loadPO = async () => {
    const poRes = await poApi.getPOs();
    setPurchaseOrder(Array.isArray(poRes) ? poRes : []);
  };

  const loadVendor = async () => {
    const vendorRes = await vendorApi.getVendors();
    setVendors(Array.isArray(vendorRes) ? vendorRes : []);
  };

  const loadPOItems = async () => {
    const poItemsRes: any = await poApi.getPOsItems();

    setAllPOItems(Array.isArray(poItemsRes.data) ? poItemsRes.data : []);
  };
  const loadPOMaterialTracking = async () => {
    const poMaterialTracking: any = await po_trackingApi.getTrackings();

    setPoMaterialTracking(
      Array.isArray(poMaterialTracking) ? poMaterialTracking : [],
    );
  };

  useEffect(() => {
    loadPO();
    loadVendor();
    loadPOItems();
    loadPOMaterialTracking();
  }, []);

  const handleInputChange = (
    field: keyof MaterialInpoTransaction,
    value: string,
  ) => {
    setPoTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemQuantityChange = (id: number, value: string) => {
    setPoTransaction((prev) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.id === id ? { ...item, quantity_received: value } : item,
      ),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPoTransaction((prev) => ({ ...prev, challan_image: file }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5" />
            PO Transaction Details
          </h2>
          <button
            onClick={() => {
              setActiveFormTab("");
            }}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="my-3 px-6 py-3 min-h-[300px] max-h-[530px] overflow-y-scroll rounded-b-lg">
          <form className="space-y-3">
            {/* PO Number & Vendor */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PO Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={poTransaction.po_number}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm outline-none"
                    required
                  >
                    <option value="">Select PO Number</option>
                    {purchaseOrders.map((po: any) => (
                      <option key={po.id} value={po.po_number}>
                        {po.po_number}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 34 35"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor
                </label>
                <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <Truck className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 text-sm">
                    {poTransaction.vendor || "Vendor"}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challan Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={poTransaction.challanNumber}
                  onChange={(e) =>
                    handleInputChange("challanNumber", e.target.value)
                  }
                  className="w-full outline-none px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter challan number"
                  required
                />
              </div>
            </div>

            {/* Receiving Date, Receiver Name & Phone */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiving Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
                  <input
                    type="date"
                    value={poTransaction.receivingDate}
                    onChange={(e) =>
                      handleInputChange("receivingDate", e.target.value)
                    }
                    className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserRound className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    value={poTransaction.receiverName}
                    onChange={(e) =>
                      handleInputChange("receiverName", e.target.value)
                    }
                    className="w-full outline-none pl-10 pr-4 py-2 text-sm  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Receiver Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
                  <input
                    type="tel"
                    value={poTransaction.receiverPhone}
                    onChange={(e) =>
                      handleInputChange("receiverPhone", e.target.value)
                    }
                    className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Location <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
                  <input
                    type="text"
                    value={poTransaction.deliveryLocation}
                    onChange={(e) =>
                      handleInputChange("deliveryLocation", e.target.value)
                    }
                    className="outline-none w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Location"
                    required
                  />
                </div>
              </div>
              {/* File Upload */}
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowChallans(true)}
                  className="mt-7 block text-sm font-bold  ml-6 mb-2 bg-blue-600 px-6 py-2 rounded-lg text-white hover:bg-blue-700"
                >
                  View Challan Receipt
                </button>
              </div>
            </div>

            {/* Items Table */}
            {poTransaction.items.length > 0 && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Items to Receive
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                          Material
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                          Ordered Qty
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                          Total Issued Qty
                        </th>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
                          Received Qty *
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {poTransaction.items.map((item: any) => {
                        return (
                          <tr
                            key={item.materialId}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">
                                {item?.item_name || "Unknown"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700">
                                {item?.quantity || 0} {item?.unit || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-700">
                                {item.issued_quantity} {item?.unit || "N/A"}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min="0"
                                max={Number(item?.quantity)}
                                value={item.quantity_received}
                                onChange={(e) => {
                                  const t =
                                    Number(item.quantity) -
                                    Number(item.issued_quantity);

                                  if (t < Number(e.target.value)) {
                                    alert(
                                      "Received Qty. is greater than pending Qty.",
                                    );
                                    return;
                                  }
                                  handleItemQuantityChange(
                                    item.id,
                                    e.target.value,
                                  );
                                }}
                                className="w-32 outline-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0"
                                required
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      {showChallans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">View Challans</h2>
              <button
                onClick={() => setShowChallans(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-[600px] overflow-y-scroll">
              <img
                src={
                  import.meta.env.VITE_API_URL +
                  "/uploads/" +
                  poTransaction.challan_image
                }
                className="mb-4"
              />
              {import.meta.env.VITE_API_URL +
                "/uploads/" +
                poTransaction.challan_image}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
