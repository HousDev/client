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
} from "lucide-react";
import ItemsMaster from "./ItemsMaster";
import TermsConditionsMaster from "./TermsConditionsMaster";
import PaymentTermsMaster from "./PaymentTermsMaster";
import ProjectsMaster from "./ProjectsMaster";
import UsersMaster from "./UsersMaster";
import GenericMaster from "./GenericMaster";

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
      id: "users",
      label: "Users",
      icon: Users,
      description: "User management",
      component: UsersMaster,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Masters Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all master data for the system
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 text-left transition hover:bg-gray-50 ${
                  activeTab === tab.id
                    ? "bg-blue-50 border-b-4 md:border-b-0 md:border-t-4 border-blue-600"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div
                    className={`p-3 rounded-lg ${
                      activeTab === tab.id ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <h3
                      className={`font-semibold text-sm ${
                        activeTab === tab.id ? "text-blue-600" : "text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
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
      <div>{ActiveComponent && <ActiveComponent />}</div>
    </div>
  );
}
