// pages/EmployeeProfilePage.tsx
import { useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import EmployeeProfile from "./EmployeeProfile";

export default function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("employees");
  
  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <EmployeeProfile />
    </Layout>
  );
}