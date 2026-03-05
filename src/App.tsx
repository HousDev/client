// // App.tsx - FINAL STABLE VERSION (No React Router)

// import { useState, useEffect } from "react";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import Layout from "./components/Layout";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import VendorsEnhanced from "./pages/VendorsEnhanced";
// import PurchaseOrders from "./pages/PurchaseOrders";
// import PurchaseOrdersPro from "./pages/PurchaseOrdersPro";
// import ServiceOrders from "./pages/ServiceOrders";
// import MaterialsEnhanced from "./pages/MaterialsEnhanced";
// import PaymentsEnhanced from "./pages/PaymentsEnhanced";
// import Notifications from "./pages/Notifications";
// import Reports from "./pages/Reports";
// import Masters from "./pages/Masters";
// import Permissions from "./pages/Permissions";
// import StoreManagement from "./pages/StoreManagement";
// import { Buffer } from "buffer";
// import { Toaster } from "sonner";
// import MaterialRequests from "./pages/MaterialRequests";
// import TaskManagement from "./pages/TaskManagement";
// import UsersManagement from "./components/users/UsersManagement";

// // HRMS
// import HrmsDashboard from "./pages/HrmsDashboard";
// import Employees from "./pages/Employees";
// import Recruitment from "./pages/Recruitment";
// import Attendance from "./pages/Attendance";
// import Leaves from "./pages/Leaves";
// import Payroll from "./pages/Payroll";
// import Expenses from "./pages/Expenses";
// import Tickets from "./pages/Tickets";
// import Documents from "./pages/Documents";
// import HrReports from "./pages/HrmsReports";
// import RolesPermissions from "./pages/RolesPermissions";

// // Settings
// import HrSettings from "./pages/HrmsSettings";
// import SystemSettings from "./pages/SystemSettings";
// import ProjectsMaster from "./pages/ProjectsMaster";
// import GeneralSettings from "./pages/settings/GeneralSettings";
// import IntegrationPage from "./pages/settings/IntegrationPage";

// // Employee Profile
// import EmployeeProfile from "./pages/EmployeeProfile";
// import CTCConfiguration from "./pages/CTCConfiguration";
// import Advance from "./pages/Advance";
// import Incentives from "./pages/Incentives";
// import Reimbursements from "./pages/Reimbursements";
// import TDS from "./pages/TDS";
// import PaymentHistory from "./pages/PaymentHistory";

// function AppContent() {
//   const { user, loading } = useAuth();
//   console.log("user details : ", user);
//   // ✅ Restore activeTab from localStorage
//   const [activeTab, setActiveTab] = useState(
//     localStorage.getItem("activeTab") || "dashboard",
//   );

//   const [activeFormTab, setActiveFormTab] = useState("");
//   const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
//     localStorage.getItem("selectedEmployeeId"),
//   );

//   // ✅ Sync activeTab with localStorage
//   useEffect(() => {
//     localStorage.setItem("activeTab", activeTab);
//   }, [activeTab]);

//   // ✅ Sync employee profile state
//   useEffect(() => {
//     if (selectedEmployeeId) {
//       localStorage.setItem("selectedEmployeeId", selectedEmployeeId);
//     } else {
//       localStorage.removeItem("selectedEmployeeId");
//     }
//   }, [selectedEmployeeId]);

//   const handleTabChange = (tab: string) => {
//     setActiveTab(tab);

//     if (tab !== "store-management") {
//       setActiveFormTab("");
//     }

//     if (tab !== "employee-profile") {
//       setSelectedEmployeeId(null);
//     }
//   };

//   const handleViewEmployeeProfile = (id: string) => {
//     setSelectedEmployeeId(id);
//     setActiveTab("employee-profile");
//   };

//   const handleBackFromProfile = () => {
//     setActiveTab("employees");
//     setSelectedEmployeeId(null);
//   };

//   if (loading) return null;

//   if (!user) return <Login />;

//   const renderContent = () => {
//     if (activeTab === "employee-profile" && selectedEmployeeId) {
//       return (
//         <EmployeeProfile
//           employeeId={selectedEmployeeId}
//           onBack={handleBackFromProfile}
//         />
//       );
//     }

//     switch (activeTab) {
//       case "dashboard":
//         return <Dashboard />;
//       case "vendors":
//         return <VendorsEnhanced />;
//       case "purchase-orders":
//         return <PurchaseOrders />;
//       case "purchase-orders-pro":
//         return <PurchaseOrdersPro />;
//       case "service-orders":
//         return <ServiceOrders />;
//       case "store-management":
//         return (
//           <StoreManagement
//             activeFormTab={activeFormTab}
//             setActiveFormTab={setActiveFormTab}
//           />
//         );
//       case "tracking":
//         return <MaterialsEnhanced />;
//       case "material-requests":
//         return <MaterialRequests />;
//       case "payments":
//         return <PaymentsEnhanced />;
//       case "task-management":
//         return <TaskManagement />;
//       case "projects":
//         return <ProjectsMaster />;
//       case "hrms-dashboard":
//         return <HrmsDashboard />;
//       case "employees":
//         return <Employees onViewProfile={handleViewEmployeeProfile} />;
//       case "recruitment":
//         return <Recruitment />;
//       case "attendance":
//         return <Attendance />;
//       case "leaves":
//         return <Leaves />;
//       case "payroll":
//         return <Payroll />;
//       case "ctc-configuration":
//         return <CTCConfiguration />;
//       case "advance":
//         return <Advance />;
//       case "incentives":
//         return <Incentives />;
//       case "reimbursements":
//         return <Reimbursements />;
//       case "tds":
//         return <TDS />;
//       case "payment-history":
//         return <PaymentHistory />;
//       case "expenses":
//         return <Expenses />;
//       case "tickets":
//         return <Tickets />;
//       case "documents":
//         return <Documents />;
//       case "hr-reports":
//         return <HrReports />;
//       case "roles-permissions":
//         return <RolesPermissions />;
//       case "hr-settings":
//         return <HrSettings />;
//       case "general-settings":
//         return <GeneralSettings />;
//       case "integration":
//         return <IntegrationPage />;
//       case "system-settings":
//         return <SystemSettings />;
//       case "notifications":
//         return <Notifications />;
//       case "reports":
//         return <Reports />;
//       case "masters":
//         return <Masters />;
//       case "users":
//         return <UsersManagement />;
//       case "permissions":
//         return <Permissions />;
//       default:
//         return <Dashboard />;
//     }
//   };

//   return (
//     <Layout
//       activeTab={activeTab}
//       onTabChange={handleTabChange}
//       activeFormTab={activeFormTab}
//       setActiveFormTab={setActiveFormTab}
//     >
//       {renderContent()}
//     </Layout>
//   );
// }

// declare global {
//   interface Window {
//     Buffer: typeof Buffer;
//   }
// }

// function App() {
//   if (!window.Buffer) {
//     window.Buffer = Buffer;
//   }

//   return (
//     <AuthProvider>
//       <Toaster position="top-right" richColors closeButton />
//       <AppContent />
//     </AuthProvider>
//   );
// }

// export default App;


import { useState, useEffect, lazy, Suspense } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { Buffer } from "buffer";
import { Toaster } from "sonner";
import { SettingsApi } from "./lib/settingsApi";

// Lazy loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const VendorsEnhanced = lazy(() => import("./pages/VendorsEnhanced"));
const PurchaseOrders = lazy(() => import("./pages/PurchaseOrders"));
const PurchaseOrdersPro = lazy(() => import("./pages/PurchaseOrdersPro"));
const ServiceOrders = lazy(() => import("./pages/ServiceOrders"));
const MaterialsEnhanced = lazy(() => import("./pages/MaterialsEnhanced"));
const PaymentsEnhanced = lazy(() => import("./pages/PaymentsEnhanced"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Reports = lazy(() => import("./pages/Reports"));
const Masters = lazy(() => import("./pages/Masters"));
const Permissions = lazy(() => import("./pages/Permissions"));
const StoreManagement = lazy(() => import("./pages/StoreManagement"));
const MaterialRequests = lazy(() => import("./pages/MaterialRequests"));
const TaskManagement = lazy(() => import("./pages/TaskManagement"));
const UsersManagement = lazy(() => import("./components/users/UsersManagement"));

// HRMS
const HrmsDashboard = lazy(() => import("./pages/HrmsDashboard"));
const Employees = lazy(() => import("./pages/Employees"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Leaves = lazy(() => import("./pages/Leaves"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Tickets = lazy(() => import("./pages/Tickets"));
const Documents = lazy(() => import("./pages/Documents"));
const HrReports = lazy(() => import("./pages/HrmsReports"));
const RolesPermissions = lazy(() => import("./pages/RolesPermissions"));

// Settings
const HrSettings = lazy(() => import("./pages/HrmsSettings"));
const SystemSettings = lazy(() => import("./pages/SystemSettings"));
const ProjectsMaster = lazy(() => import("./pages/ProjectsMaster"));
const GeneralSettings = lazy(() => import("./pages/settings/GeneralSettings"));
const IntegrationPage = lazy(() => import("./pages/settings/IntegrationPage"));

// Employee Profile
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const CTCConfiguration = lazy(() => import("./pages/CTCConfiguration"));
const Advance = lazy(() => import("./pages/Advance"));
const Incentives = lazy(() => import("./pages/Incentives"));
const Reimbursements = lazy(() => import("./pages/Reimbursements"));
const TDS = lazy(() => import("./pages/TDS"));
const PaymentHistory = lazy(() => import("./pages/PaymentHistory"));

function AppContent() {
  const { user, loading, refreshSystemSettings } = useAuth();

  useEffect(() => {
    refreshSystemSettings();
  }, []); // Placeholder for any future side effects on app load

  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "dashboard"
  );

  const [activeFormTab, setActiveFormTab] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    localStorage.getItem("selectedEmployeeId")
  );

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedEmployeeId) {
      localStorage.setItem("selectedEmployeeId", selectedEmployeeId);
    } else {
      localStorage.removeItem("selectedEmployeeId");
    }
  }, [selectedEmployeeId]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    if (tab !== "store-management") setActiveFormTab("");
    if (tab !== "employee-profile") setSelectedEmployeeId(null);
  };

  const handleViewEmployeeProfile = (id: string) => {
    setSelectedEmployeeId(id);
    setActiveTab("employee-profile");
  };

  const handleBackFromProfile = () => {
    setActiveTab("employees");
    setSelectedEmployeeId(null);
  };

  if (loading) return null;
  if (!user) return <Login />;

  const renderContent = () => {
    if (activeTab === "employee-profile" && selectedEmployeeId) {
      return (
        <EmployeeProfile
          employeeId={selectedEmployeeId}
          onBack={handleBackFromProfile}
        />
      );
    }

    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "vendors":
        return <VendorsEnhanced />;
      case "purchase-orders":
        return <PurchaseOrders />;
      case "purchase-orders-pro":
        return <PurchaseOrdersPro />;
      case "service-orders":
        return <ServiceOrders />;
      case "store-management":
        return (
          <StoreManagement
            activeFormTab={activeFormTab}
            setActiveFormTab={setActiveFormTab}
          />
        );
      case "tracking":
        return <MaterialsEnhanced />;
      case "material-requests":
        return <MaterialRequests />;
      case "payments":
        return <PaymentsEnhanced />;
      case "task-management":
        return <TaskManagement />;
      case "projects":
        return <ProjectsMaster />;
      case "hrms-dashboard":
        return <HrmsDashboard />;
      case "employees":
        return <Employees onViewProfile={handleViewEmployeeProfile} />;
      case "recruitment":
        return <Recruitment />;
      case "attendance":
        return <Attendance />;
      case "leaves":
        return <Leaves />;
      case "payroll":
        return <Payroll />;
      case "ctc-configuration":
        return <CTCConfiguration />;
      case "advance":
        return <Advance />;
      case "incentives":
        return <Incentives />;
      case "reimbursements":
        return <Reimbursements />;
      case "tds":
        return <TDS />;
      case "payment-history":
        return <PaymentHistory />;
      case "expenses":
        return <Expenses />;
      case "tickets":
        return <Tickets />;
      case "documents":
        return <Documents />;
      case "hr-reports":
        return <HrReports />;
      case "roles-permissions":
        return <RolesPermissions />;
      case "hr-settings":
        return <HrSettings />;
      case "general-settings":
        return <GeneralSettings />;
      case "integration":
        return <IntegrationPage />;
      case "system-settings":
        return <SystemSettings />;
      case "notifications":
        return <Notifications />;
      case "reports":
        return <Reports />;
      case "masters":
        return <Masters />;
      case "users":
        return <UsersManagement />;
      case "permissions":
        return <Permissions />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      activeFormTab={activeFormTab}
      setActiveFormTab={setActiveFormTab}
    >
      <Suspense fallback={<div style={{ padding: 20 }}>Loading...</div>}>
        {renderContent()}
      </Suspense>
    </Layout>
  );
}

declare global {
  interface Window {
    Buffer: typeof Buffer;
  }
}

function App() {
  if (!window.Buffer) {
    window.Buffer = Buffer;
  }
  

  return (
    <AuthProvider>
      <Toaster position="top-right" richColors closeButton />
      <AppContent />
    </AuthProvider>
  );
}

export default App;