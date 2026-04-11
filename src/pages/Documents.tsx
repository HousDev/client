import { FileText, Package, Printer } from "lucide-react";
import { useState } from "react";
import DocumentDashboard from "../components/doument/DocumentDashboard";
import DocumentTemplateDashboard from "../components/doument/DocumentTemplateDashboard";

export default function Documents() {
  const [activeTab, setActiveTab] = useState("dashboard");
  return (
    <div className="">
      <div className=" sticky top-[120px] md:top-20 mt-12 md:mt-1  flex bg-white rounded-lg shadow-sm border border-gray-200 mb-4 md:mb-3 mx-0 md:mx-0">
        {" "}
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex-1 px-3 md:px-6 py-2   font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "dashboard"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FileText
            className={`w-3 h-3 md:w-4 md:h-4 ${activeTab === "dashboard" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs md:text-base">Documnet Dashboard</span>
        </button>
        <button
          onClick={() => setActiveTab("template")}
          className={`flex-1 px-3 md:px-6 py-2  font-medium transition-all duration-200 flex items-center justify-center gap-1.5 md:gap-3 ${
            activeTab === "template"
              ? "bg-[#C62828] text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Printer
            className={`w-3 h-3 md:w-4 md:h-4 ${activeTab === "template" ? "text-white" : "text-gray-500"}`}
          />
          <span className="text-xs sm:text-xs md:text-base">
            Document Templates
          </span>
        </button>
      </div>
      <div>
        {activeTab === "dashboard" && <DocumentDashboard />}
        {activeTab === "template" && <DocumentTemplateDashboard />}
      </div>
    </div>
  );
}
