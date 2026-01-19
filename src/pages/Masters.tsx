// import { useState } from "react";
// import {
//   Package,
//   FileText,
//   CreditCard,
//   Building2,
//   FileType,
//   Wrench,
//   Tag,
//   Percent,
//   Users,
// } from "lucide-react";
// import ItemsMaster from "./ItemsMaster";
// import TermsConditionsMaster from "./TermsConditionsMaster";
// import PaymentTermsMaster from "./PaymentTermsMaster";
// import ProjectsMaster from "./ProjectsMaster";
// import UsersMaster from "./UsersMaster";
// import GenericMaster from "./GenericMaster";

// export default function Masters() {
//   const [activeTab, setActiveTab] = useState("items");

//   const tabs = [
//     {
//       id: "items",
//       label: "Items Master",
//       icon: Package,
//       description: "Materials & Services",
//       component: ItemsMaster,
//     },
//     {
//       id: "projects",
//       label: "Projects",
//       icon: Building2,
//       description: "Manage projects",
//       component: ProjectsMaster,
//     },
//     {
//       id: "po_types",
//       label: "PO Types",
//       icon: FileType,
//       description: "Purchase Order types",
//       component: () => (
//         <GenericMaster
//           tableName="po_types"
//           title="PO Types"
//           description="Manage purchase order types"
//           icon={FileType}
//         />
//       ),
//     },
//     {
//       id: "service_types",
//       label: "Service Types",
//       icon: Wrench,
//       description: "Service categories",
//       component: () => (
//         <GenericMaster
//           tableName="service_types"
//           title="Service Types"
//           description="Manage service types"
//           icon={Wrench}
//         />
//       ),
//     },
//     {
//       id: "terms",
//       label: "Terms & Conditions",
//       icon: FileText,
//       description: "T&C for POs",
//       component: TermsConditionsMaster,
//     },
//     {
//       id: "payment_terms",
//       label: "Payment Terms",
//       icon: CreditCard,
//       description: "Payment conditions",
//       component: PaymentTermsMaster,
//     },
//     {
//       id: "users",
//       label: "Users",
//       icon: Users,
//       description: "User management",
//       component: UsersMaster,
//     },
//   ];

//   const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

//   return (
//     <div className="p-6">
     

//       {/* Tab Navigation */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             return (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`p-4 text-left transition hover:bg-gray-50 ${
//                   activeTab === tab.id
//                     ? "bg-blue-50 border-b-4 md:border-b-0 md:border-t-4 border-blue-600"
//                     : ""
//                 }`}
//               >
//                 <div className="flex flex-col items-center text-center gap-2">
//                   <div
//                     className={`p-3 rounded-lg ${
//                       activeTab === tab.id ? "bg-blue-100" : "bg-gray-100"
//                     }`}
//                   >
//                     <Icon
//                       className={`w-6 h-6 ${
//                         activeTab === tab.id ? "text-blue-600" : "text-gray-600"
//                       }`}
//                     />
//                   </div>
//                   <div>
//                     <h3
//                       className={`font-semibold text-sm ${
//                         activeTab === tab.id ? "text-blue-600" : "text-gray-800"
//                       }`}
//                     >
//                       {tab.label}
//                     </h3>
//                     <p className="text-xs text-gray-600 mt-1">
//                       {tab.description}
//                     </p>
//                   </div>
//                 </div>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Active Component */}
//       <div>{ActiveComponent && <ActiveComponent />}</div>
//     </div>
//   );
// }



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
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] rounded-xl shadow-md p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Masters</h1>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  Manage all master data and configurations
                </p>
              </div>
            </div>
            <div className="text-sm text-white/80 bg-white/10 px-3 py-1.5 rounded-lg">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                  isActive
                    ? "bg-gradient-to-b from-blue-50/80 to-white border-l-4 md:border-l-0 md:border-t-4 border-[#C62828]"
                    : ""
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
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

      {/* Active Component */}
      <div className="animate-fadeIn">
        {ActiveComponent && <ActiveComponent />}
      </div>

      {/* Add fadeIn animation */}
      <style >{`
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
