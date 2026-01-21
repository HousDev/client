import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  Search,
  Star,
  Filter,
  ChevronDown,
  Package,
  ReceiptText,
  CheckSquare,
  Eye,
  Square,
  Loader2,
  Calendar,
} from "lucide-react";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { TermsCondition } from "../lib/termsConditionsApi";
import vendorApi from "../lib/vendorApi";
import SearchableSelect from "../components/SearchableSelect";
import MySwal from "../utils/swal";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  {
    name: "Category",
    values: [
      { value: "general", name: "General" },
      { value: "payment", name: "Payment" },
      { value: "delivery", name: "Delivery" },
      { value: "quality", name: "Quality" },
      { value: "warranty", name: "Warranty" },
      { value: "tax", name: "Tax" },
      { value: "legal", name: "Legal" },
      { value: "returns", name: "Returns" },
    ],
  },
  {
    name: "Status",
    values: [
      { value: true, name: "Active" },
      { value: false, name: "Inactive" },
    ],
  },
];

export default function HRMS() {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("attendance");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-[70vh] overflow-hidden">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden fixed w-[80vw]">
        <div className="flex flex-col sm:flex-row border-b border-gray-200">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "attendance"
                ? "text-red-600 border-b-2 border-red-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Attendance</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("leave")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "leave"
                ? "text-red-600 border-b-2 border-red-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Leave Request</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("payroll")}
            className={`flex-1 px-6 py-3 font-medium transition ${
              activeTab === "payroll"
                ? "text-red-600 border-b-2 border-red-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Payroll Management</span>
            </div>
          </button>
        </div>
      </div>
      <div className="h-[70vh] flex items-center justify-center text-2xl font-semibold">
        Under Development
      </div>
    </div>
  );
}
