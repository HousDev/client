import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VendorsEnhanced from "./pages/VendorsEnhanced";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseOrdersPro from "./pages/PurchaseOrdersPro";
import ServiceOrders from "./pages/ServiceOrders";
import MaterialsEnhanced from "./pages/MaterialsEnhanced";
import PaymentsEnhanced from "./pages/PaymentsEnhanced";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports"; // General Reports
import Masters from "./pages/Masters";
import Permissions from "./pages/Permissions";
import StoreManagement from "./pages/StoreManagement";
import { Buffer } from "buffer";
import { Toaster } from "sonner";
import MaterialRequests from "./pages/MaterialRequests";
import TaskManagement from "./pages/TaskManagement";
import UsersManagement from "./components/users/UsersManagement";

// HRMS Pages Import
import HrmsDashboard from "./pages/HrmsDashboard";
import Employees from "./pages/Employees";
import Recruitment from "./pages/Recruitment";
import Attendance from "./pages/Attendance";
import Leaves from "./pages/Leaves";
import Payroll from "./pages/Payroll";
import Expenses from "./pages/Expenses";
import Tickets from "./pages/Tickets";
import Documents from "./pages/Documents";
import HrReports from "./pages/HrmsReports"; // HR-specific Reports
import RolesPermissions from "./pages/RolesPermissions";

// Settings Pages Import
import HrSettings from "./pages/HrmsSettings";
import SystemSettings from "./pages/SystemSettings"; // System-wide Settings

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeFormTab, setActiveFormTab] = useState("");

  // Reset activeFormTab when switching tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "store-management") {
      setActiveFormTab("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-6"></div>
          <p className="text-blue-200 text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
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
      case "materials":
        return <MaterialsEnhanced />;
      case "material-requests":
        return <MaterialRequests />;
      case "payments":
        return <PaymentsEnhanced />;
      case "task-management":
        return <TaskManagement />;

      // HRMS Submenu Pages
      case "hrms-dashboard":
        return <HrmsDashboard />;
      case "employees":
        return <Employees />;
      case "recruitment":
        return <Recruitment />;
      case "attendance":
        return <Attendance />;
      case "leaves":
        return <Leaves />;
      case "payroll":
        return <Payroll />;
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

      // Main sidebar Pages
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
      {renderContent()}
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