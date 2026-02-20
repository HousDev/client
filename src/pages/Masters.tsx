import { useState } from "react";
import {
  Package,
  FileText,
  CreditCard,
  FileType,
  Wrench,
  Shield,
  Building,
  Award,
  MapPin,
} from "lucide-react";
import ItemsMaster from "./ItemsMaster";
import ServicesMaster from "./ServiceMaster";
import TermsConditionsMaster from "./TermsConditionsMaster";
import PaymentTermsMaster from "./PaymentTermsMaster";
import GenericMaster from "./GenericMaster";
import DepartmentsMaster from "../components/DepartmentsMaster";
import RolesMaster from "../components/RolesMaster";
import DesignationMaster from "../components/DesignationMaster";
import LocationMaster from "../components/LocationMaster"; // Import the new component

export default function Masters() {
  const [activeTab, setActiveTab] = useState("items");

  const tabs = [
    {
      id: "items",
      label: "Items Master",
      icon: Package,
      description: "Materials",
      component: ItemsMaster,
    },

    // {
    //   id: "service",
    //   label: "Service Master",
    //   icon: Package,
    //   description: "Services",
    //   component: ServicesMaster,
    // },

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
    {
      id: "designations",
      label: "Designations",
      icon: Award,
      description: "Job titles by department",
      component: DesignationMaster,
    },
    {
      id: "locations", // Add this tab
      label: "Locations",
      icon: MapPin,
      description: "Manage locations",
      component: LocationMaster,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className=" bg-gray-50">
      {/* Tab Navigation */}
      <div className="sticky top-20 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
          <div className="flex gap-1.5 p-2 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg
                    transition-all duration-200 flex-shrink-0
                    ${
                      isActive
                        ? "bg-[#C62828] shadow-lg shadow-red-500/30"
                        : "bg-white border border-gray-200 hover:border-[#C62828] hover:shadow-md"
                    }
                  `}
                >
                  <div
                    className={`
                      p-1.5 rounded-md transition-all duration-200
                      ${isActive ? "bg-white/20" : "bg-gray-100"}
                    `}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div className="text-left">
                    <h3
                      className={`font-semibold text-xs whitespace-nowrap ${
                        isActive ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </h3>
                    <p
                      className={`text-[10px] whitespace-nowrap ${
                        isActive ? "text-white/90" : "text-gray-600"
                      }`}
                    >
                      {tab.description}
                    </p>
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
        
        /* Custom scrollbar */
        .overflow-x-auto::-webkit-scrollbar {
          height: 2px;
        }
        .overflow-x-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb {
          background: #C62828;
          border-radius: 10px;
        }
        .overflow-x-auto::-webkit-scrollbar-thumb:hover {
          background: #A02020;
        }
      `}</style>
    </div>
  );
}
