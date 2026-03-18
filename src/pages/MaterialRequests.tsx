import { FileText, Package } from "lucide-react";
import { useState, useEffect } from "react";
import MaterialRequestsTab from "../components/materialRequest/tabs/MaterialRequestsTab";
import PurchaseOrderRequestsTab from "../components/materialRequest/tabs/PurchaseOrderRequestsTab";

export default function MaterialRequests() {
  const [activeTab, setActiveTab] = useState("material");

  return (
    <div className="p-4 px-0 md:px-0 md:p-4 -mt-5 bg-gray-50 ">
      {/* Tabs */}
      <div className=" w-full sm:flex-1 mb-3">
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("material")}
            className={`flex-1 flex items-center justify-center gap-1.5
                              px-2 py-2
                              text-[11px] sm:text-sm
                              font-medium transition
                ${
                  activeTab === "material"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Material Requests
          </button>

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
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Purchase Order Requests
          </button>
        </div>
      </div>
      <div>
        {activeTab === "material" && <MaterialRequestsTab />}
        {activeTab === "po" && <PurchaseOrderRequestsTab />}
      </div>
    </div>
  );
}
