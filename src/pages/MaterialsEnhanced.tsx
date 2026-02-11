import { useState } from "react";
import { Package, FileText } from "lucide-react";
import POTracking from "../components/tracking/POTracking";
import SOTracking from "../components/tracking/SOTracking";

export default function MaterialsEnhanced() {
  const [activeTab, setActiveTab] = useState<string>("po");

  return (
    <div className="p-3 px-0 md:p-0 -mt-3.5 bg-gray-50 ">
      <div className=" sticky top-[120px] md:top-20 mt-12 md:mt-2 flex bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-6 mx-0 md:mx-0">
        {" "}
        <button
          onClick={() => setActiveTab("po")}
          className={`flex-1 px-3 md:px-6 py-2 font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "po"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText
            className={`w-3 h-3 md:w-5 md:h-5 ${activeTab === "tracking" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs md:text-base">PO Tracking</span>
        </button>
        <button
          onClick={() => setActiveTab("so")}
          className={`flex-1 px-3 md:px-6 py-2 font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "so"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Package
            className={`w-3 h-3 md:w-5 md:h-5 ${activeTab === "management" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs sm:text-xs md:text-base">SO Tracking</span>
        </button>
      </div>
      <div className="">
        {activeTab === "po" && <POTracking />}
        {activeTab === "so" && <SOTracking />}
      </div>
    </div>
  );
}
