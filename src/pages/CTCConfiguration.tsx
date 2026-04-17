import { useState } from "react";
import AssignCtc from "../components/ctcConfig/AssignCtc";
import CtcTemplate from "../components/ctcConfig/CtcTemplate";
import { FileText, Package } from "lucide-react";

export default function CTCConfiguration() {
  const [activeTab, setActiveTab] = useState("assign");
  return (
    <div className="space-y-5">
      <div className=" w-full sm:flex-1">
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setActiveTab("assign")}
            className={`flex-1 flex items-center justify-center gap-1.5
                px-2 py-2
                text-[11px] sm:text-sm
                font-medium transition
                ${
                  activeTab === "assign"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
          >
            <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Assign CTC
          </button>

          <button
            onClick={() => setActiveTab("template")}
            className={`flex-1 flex items-center justify-center gap-1.5
                px-2 py-2
                text-[11px] sm:text-sm
                font-medium transition
                ${
                  activeTab === "template"
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            CTC Template
          </button>
        </div>
      </div>
      {activeTab === "assign" && <AssignCtc />}
      {activeTab === "template" && <CtcTemplate />}
    </div>
  );
}
