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
import Reports from "./pages/Reports";
import Masters from "./pages/Masters";
import Permissions from "./pages/Permissions";
import StoreManagement from "./pages/StoreManagement";
import { Buffer } from "buffer";
import { Toaster } from "sonner";
import MaterialRequests from "./pages/MaterialRequests";
import TaskManagement from "./pages/TaskManagement";
import HRMS from "./pages/HRMS";

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

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
      case "store-management":
        return <StoreManagement />;
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
      case "materials":
        return <MaterialsEnhanced />;
      case "material-requests":
        return <MaterialRequests />;
      case "payments":
        return <PaymentsEnhanced />;
      case "notifications":
        return <Notifications />;
      case "reports":
        return <Reports />;
      case "masters":
        return <Masters />;
      case "hrms":
        return <HRMS />;
      case "permissions":
        return <Permissions />;
      case "task-management":
        return <TaskManagement />;

      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
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
