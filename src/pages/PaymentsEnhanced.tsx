import { Package, Pickaxe } from "lucide-react";
import { useState } from "react";
import PurchaseOrderPayments from "../components/payments/PurchaseOrderPayments";
import ServiceOrderPayments from "../components/payments/ServiceOrderPayments";

const PaymentsEnhanced = () => {
  const [activeTab, setActiveTab] = useState("po");

  return (
    <div>
      <div className=" sticky top-20 z-20 flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Tabs */}
        <div className=" w-full sm:flex-1">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("po")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "po"
              ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Purchase Order Payments
            </button>

            <button
              onClick={() => setActiveTab("wo")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "wo"
              ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <Pickaxe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Work Order Payments
            </button>
          </div>
        </div>
      </div>
      {/* main body */}
      <div>
        {activeTab === "po" && <PurchaseOrderPayments />}
        {activeTab === "wo" && <ServiceOrderPayments />}
      </div>
    </div>
  );
};

export default PaymentsEnhanced;
