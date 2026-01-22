// src/pages/Masters.tsx
import { useState } from "react";
import {
  Package,
  FileText,
  CreditCard,
  FileType,
  Wrench,
  Shield,
  Building,
} from "lucide-react";
import ItemsMaster from "./ItemsMaster";
import TermsConditionsMaster from "./TermsConditionsMaster";
import PaymentTermsMaster from "./PaymentTermsMaster";
import GenericMaster from "./GenericMaster";
import DepartmentsMaster from "../components/DepartmentsMaster";
import RolesMaster from "../components/RolesMaster";

export default function Masters() {
  const [activeTab, setActiveTab] = useState("items");

  const tabs = [
    {
      id: "items",
      label: "Items Master",
      icon: Package,
      description: "Materials & Services",
      component: ItemsMaster,
    },
    {
      id: "po_types",
      label: "PO Types",
      icon: FileType,
      description: "Purchase Order types",
      component: () => (
        <GenericMaster
          tableName="po_types"
          title="PO Types"
          description="Manage purchase order types"
          icon={FileType}
        />
      ),
    },
    {
      id: "service_types",
      label: "Service Types",
      icon: Wrench,
      description: "Service categories",
      component: () => (
        <GenericMaster
          tableName="service_types"
          title="Service Types"
          description="Manage service types"
          icon={Wrench}
        />
      ),
    },
    {
      id: "terms",
      label: "Terms & Conditions",
      icon: FileText,
      description: "T&C for POs",
      component: TermsConditionsMaster,
    },
    {
      id: "payment_terms",
      label: "Payment Terms",
      icon: CreditCard,
      description: "Payment conditions",
      component: PaymentTermsMaster,
    },
    {
      id: "roles",
      label: "Roles",
      icon: Shield,
      description: "Role management",
      component: RolesMaster,
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building,
      description: "Department management",
      component: DepartmentsMaster,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50 p-0">
      {/* Tab Navigation - Horizontal scroll on mobile, grid on desktop */}
      <div className="bg-white border-b border-gray-200">
        <div className="overflow-x-auto">
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-9 min-w-max md:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 w-48 md:w-auto p-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                    isActive
                      ? "bg-gradient-to-b from-blue-50/80 to-white border-b-4 md:border-b-0 md:border-l-4 border-[#C62828]"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-3 md:flex-col md:items-center md:text-center md:gap-2">
                    <div
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-[#C62828] to-red-600 shadow-md"
                          : "bg-gradient-to-r from-gray-100 to-gray-50"
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 transition-all duration-200 ${
                          isActive ? "text-white" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3
                        className={`font-semibold text-sm transition-colors ${
                          isActive ? "text-[#C62828]" : "text-gray-800"
                        }`}
                      >
                        {tab.label}
                      </h3>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Component */}
      <div className="p-0">
        <div className="animate-fadeIn">
          {ActiveComponent && <ActiveComponent />}
        </div>
      </div>

      {/* Add fadeIn animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
