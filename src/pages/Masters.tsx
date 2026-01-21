// src/pages/Masters.tsx में changes
import { useState } from "react";
import {
  Package,
  FileText,
  CreditCard,
  Building2,
  FileType,
  Wrench,
  Tag,
  Percent,
  Users,
  Shield,
  Building,
} from "lucide-react";
import ItemsMaster from "./ItemsMaster";
import TermsConditionsMaster from "./TermsConditionsMaster";
import PaymentTermsMaster from "./PaymentTermsMaster";
import ProjectsMaster from "./ProjectsMaster";

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
      id: "projects",
      label: "Projects",
      icon: Building2,
      description: "Manage projects",
      component: ProjectsMaster,
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
      component: RolesMaster, // New
    },
    {
      id: "departments",
      label: "Departments",
      icon: Building,
      description: "Department management",
      component: DepartmentsMaster, // New
    }
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Tab Navigation - Updated grid-cols for more tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 text-left transition-all duration-200 hover:bg-gray-50 ${isActive
                    ? "bg-gradient-to-b from-blue-50/80 to-white border-l-4 md:border-l-0 md:border-t-4 border-[#C62828]"
                    : ""
                  }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-200 ${isActive
                        ? "bg-gradient-to-r from-[#C62828] to-red-600 shadow-md"
                        : "bg-gradient-to-r from-gray-100 to-gray-50"
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-all duration-200 ${isActive ? "text-white" : "text-gray-600"
                        }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm transition-colors ${isActive ? "text-[#C62828]" : "text-gray-800"
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

      {/* Active Component */}
      <div className="animate-fadeIn">
        {ActiveComponent && <ActiveComponent />}
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