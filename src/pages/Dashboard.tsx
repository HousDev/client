// import { useState, useEffect } from "react";
// import { Users, FileText, Package, CreditCard, TrendingUp } from "lucide-react";

// type Vendor = { id: string; name: string; is_active?: boolean };
// type PO = {
//   id: string;
//   po_number: string;
//   status?: "draft" | "pending" | "approved" | "rejected" | "completed" | string;
//   material_status?: string;
// };
// type Payment = {
//   id: string;
//   po_id?: string;
//   amount?: number;
//   due_date?: string;
//   status?: "pending" | "paid" | "overdue" | string;
// };

// export default function Dashboard() {
//   const [stats, setStats] = useState({
//     totalVendors: 0,
//     activePOs: 0,
//     pendingDeliveries: 0,
//     overduePayments: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   // localStorage keys (so other demo screens can write to same keys)
//   const KEY_VENDORS = "mock_vendors_v1";
//   const KEY_POS = "mock_pos_v1";
//   const KEY_PAYMENTS = "mock_payments_v1";

//   // default mock data used when localStorage is empty
//   const defaultVendors: Vendor[] = [
//     { id: "v_1", name: "Acme Supplies", is_active: true },
//     { id: "v_2", name: "Builder Co", is_active: true },
//     { id: "v_3", name: "Concrete Plus", is_active: false },
//   ];

//   const defaultPOs: PO[] = [
//     {
//       id: "po_1",
//       po_number: "PO-1001",
//       status: "approved",
//       material_status: "partial",
//     },
//     {
//       id: "po_2",
//       po_number: "PO-1002",
//       status: "pending",
//       material_status: "pending",
//     },
//     {
//       id: "po_3",
//       po_number: "PO-1003",
//       status: "approved",
//       material_status: "completed",
//     },
//   ];

//   const defaultPayments: Payment[] = [
//     {
//       id: "pay_1",
//       po_id: "po_1",
//       amount: 50000,
//       due_date: "2025-11-01",
//       status: "paid",
//     },
//     {
//       id: "pay_2",
//       po_id: "po_2",
//       amount: 75000,
//       due_date: "2025-10-01",
//       status: "overdue",
//     },
//   ];

//   useEffect(() => {
//     loadDashboardData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadDashboardData = async () => {
//     setLoading(true);

//     // simulate async fetch
//     setTimeout(() => {
//       try {
//         const rawVendors = localStorage.getItem(KEY_VENDORS);
//         const rawPOs = localStorage.getItem(KEY_POS);
//         const rawPayments = localStorage.getItem(KEY_PAYMENTS);

//         const vendors: Vendor[] = rawVendors
//           ? JSON.parse(rawVendors)
//           : defaultVendors;
//         const pos: PO[] = rawPOs ? JSON.parse(rawPOs) : defaultPOs;
//         const payments: Payment[] = rawPayments
//           ? JSON.parse(rawPayments)
//           : defaultPayments;

//         // compute stats
//         const totalVendors = vendors.length;
//         const activePOs = pos.filter((p) => p.status === "approved").length;
//         // pending deliveries = POs with material_status not 'completed' (you can adapt logic)
//         const pendingDeliveries = pos.filter(
//           (p) => p.material_status !== "completed"
//         ).length;
//         const overduePayments = payments.filter(
//           (p) => p.status === "overdue"
//         ).length;

//         setStats({
//           totalVendors,
//           activePOs,
//           pendingDeliveries,
//           overduePayments,
//         });
//       } catch (err) {
//         console.error("Error loading dashboard mock data:", err);
//         setStats({
//           totalVendors: 0,
//           activePOs: 0,
//           pendingDeliveries: 0,
//           overduePayments: 0,
//         });
//       } finally {
//         setLoading(false);
//       }
//     }, 250);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   const statCards = [
//     {
//       label: "Total Vendors",
//       value: stats.totalVendors,
//       icon: Users,
//       color: "bg-blue-500",
//     },
//     {
//       label: "Active POs",
//       value: stats.activePOs,
//       icon: FileText,
//       color: "bg-green-500",
//     },
//     {
//       label: "Pending Deliveries",
//       value: stats.pendingDeliveries,
//       icon: Package,
//       color: "bg-orange-500",
//     },
//     {
//       label: "Overdue Payments",
//       value: stats.overduePayments,
//       icon: CreditCard,
//       color: "bg-red-500",
//     },
//   ];

//   return (
//     <div className="space-y-6 p-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
//         <p className="text-gray-600 mt-1">
//           Welcome to your Real Estate Management System
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         {statCards.map((card) => {
//           const Icon = card.icon;
//           return (
//             <div
//               key={card.label}
//               className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
//             >
//               <div className={`${card.color} p-3 rounded-lg w-fit mb-4`}>
//                 <Icon className="w-6 h-6 text-white" />
//               </div>
//               <p className="text-gray-600 text-sm font-medium mb-1">
//                 {card.label}
//               </p>
//               <p className="text-3xl font-bold text-gray-800">{card.value}</p>
//             </div>
//           );
//         })}
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="text-lg font-semibold text-gray-800">
//             System Overview
//           </h2>
//           <TrendingUp className="w-5 h-5 text-green-600" />
//         </div>
//         <div className="space-y-4">
//           <p className="text-gray-600 text-sm">
//             This is a frontend-only demo. Data is read from localStorage when
//             available, otherwise sample data is shown. Use other demo screens
//             (Vendors / POs / Payments) to populate localStorage and see these
//             numbers update.
//           </p>

//           <div className="flex gap-3 pt-2">
//             <button
//               onClick={loadDashboardData}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//             >
//               Refresh
//             </button>
//             <button
//               onClick={() => {
//                 // clear demo data and reload defaults
//                 localStorage.removeItem(KEY_VENDORS);
//                 localStorage.removeItem(KEY_POS);
//                 localStorage.removeItem(KEY_PAYMENTS);
//                 loadDashboardData();
//               }}
//               className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
//             >
//               Reset Data
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from 'react';
import {
  Users,
  FileText,
  Package,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Box,
  Layout,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Briefcase,
  ChevronRight,
  Layers,
  BarChart3,
  CalendarDays,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
//import { DashboardStats, Task, Milestone, Risk } from '../types';

// Mock Data for Charts
const costVarianceData = [
  { name: 'W1', budget: 4000, actual: 4400, cpi: 0.91 },
  { name: 'W2', budget: 3000, actual: 3200, cpi: 0.94 },
  { name: 'W3', budget: 2000, actual: 1800, cpi: 1.11 },
  { name: 'W4', budget: 2780, actual: 3908, cpi: 0.71 },
  { name: 'W5', budget: 1890, actual: 4800, cpi: 0.39 },
  { name: 'W6', budget: 2390, actual: 3800, cpi: 0.63 },
];

const projectStatusData = [
  { name: 'Planning', value: 15, color: '#94a3b8' },
  { name: 'In Progress', value: 45, color: '#3b82f6' },
  { name: 'On Hold', value: 10, color: '#f59e0b' },
  { name: 'Completed', value: 30, color: '#10b981' },
];

const scheduleComplianceData = [
  { name: 'Mon', planned: 20, actual: 18 },
  { name: 'Tue', planned: 40, actual: 42 },
  { name: 'Wed', planned: 60, actual: 55 },
  { name: 'Thu', planned: 80, actual: 85 },
  { name: 'Fri', planned: 100, actual: 98 },
];

const materialStatusData = [
  { name: 'Steel', stock: 120, min: 50 },
  { name: 'Cement', stock: 85, min: 100 },
  { name: 'Bricks', stock: 200, min: 80 },
  { name: 'Timber', stock: 45, min: 40 },
];

const poChangeData = [
  { month: 'Jan', changes: 5 },
  { month: 'Feb', changes: 8 },
  { month: 'Mar', changes: 3 },
  { month: 'Apr', changes: 12 },
  { month: 'May', changes: 6 },
];

const categoryCostData = [
  { name: 'Civil', value: 450000 },
  { name: 'Electrical', value: 120000 },
  { name: 'Plumbing', value: 85000 },
  { name: 'Interior', value: 240000 },
];

const teamAllocation = [
  { team: 'Team Alpha', members: 12, utilization: 85 },
  { team: 'Team Beta', members: 8, utilization: 92 },
  { team: 'Structural', members: 15, utilization: 70 },
  { team: 'Finishing', members: 20, utilization: 45 },
];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({
        totalVendors: 142,
        totalPOs: 865,
        totalMaterialRequests: { requested: 1240, approved: 1050 },
        totalStocks: 4520,
        totalBudgets: 12500000,
        activeProjects: 12
      });
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64 md:h-full">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-[#d32f2f]"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total POs', value: stats.totalPOs, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Vendors', value: stats.totalVendors, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Mat Requests', value: `${stats.totalMaterialRequests.approved}/${stats.totalMaterialRequests.requested}`, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Stocks', value: stats.totalStocks.toLocaleString(), icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Budgets', value: `$${(stats.totalBudgets / 1000000).toFixed(1)}M`, icon: TrendingUp, color: 'text-[#d32f2f]', bg: 'bg-red-50' },
  ];

  const milestones: Milestone[] = [
    { id: 'm1', title: 'Foundation Completion', date: '2025-04-15', priority: 'High' },
    { id: 'm2', title: 'Structural Slabs L3', date: '2025-05-10', priority: 'Medium' },
    { id: 'm3', title: 'Electrical Rough-in', date: '2025-05-25', priority: 'Low' },
  ];

  const risks: Risk[] = [
    { id: 'r1', issue: 'Cement Shortage', impact: 'High', description: 'Supply chain disruption from regional strike.' },
    { id: 'r2', issue: 'Weather Delay', impact: 'Medium', description: 'Heavy monsoon predicted for next week.' },
  ];

  const tasks: Task[] = [
    { id: 't1', name: 'Excavation Phase 2', startDate: '2025-03-01', endDate: '2025-03-20', resource: 'Alpha Team', progress: 100, status: 'Completed' },
    { id: 't2', name: 'Reinforcement Steel Binding', startDate: '2025-03-21', endDate: '2025-04-05', resource: 'Beta Team', progress: 45, status: 'In Progress' },
    { id: 't3', name: 'Concrete Pouring L1', startDate: '2025-04-06', endDate: '2025-04-12', resource: 'Structural', progress: 0, status: 'Delayed' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-3">
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider mb-0.5">{card.label}</p>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* 2. Main Analytics Row: Project Status Donut & Cost Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Project Status</h3>
            <Layers className="w-4 h-4 text-gray-400" />
          </div>
          <div className="h-[250px] md:h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 text-center pointer-events-none">
              <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Active</p>
              <p className="text-xl md:text-2xl font-black text-gray-800 leading-tight">{stats.activeProjects}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide">Cost & CPI Analysis</h3>
            <BarChart3 className="w-4 h-4 text-[#d32f2f]" />
          </div>
          <div className="h-[250px] md:h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costVarianceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
                <Line type="monotone" dataKey="budget" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Budget" />
                <Line type="monotone" dataKey="actual" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Actual" />
                <Line type="monotone" dataKey="cpi" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="CPI" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Secondary Metrics: Budget vs Actual & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">Budget vs Actual</h3>
          <div className="h-[220px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costVarianceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Bar dataKey="budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Budgeted" />
                <Bar dataKey="actual" fill="#d32f2f" radius={[4, 4, 0, 0]} name="Actual" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide mb-6">Schedule Compliance</h3>
          <div className="h-[220px] md:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scheduleComplianceData}>
                <defs>
                  <linearGradient id="colorPlanned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip />
                <Area type="monotone" dataKey="planned" stroke="#3b82f6" fillOpacity={1} fill="url(#colorPlanned)" name="Planned %" />
                <Area type="monotone" dataKey="actual" stroke="#10b981" fillOpacity={0} name="Actual %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Project Drill-Down Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#d32f2f]" />
              Drill-Down: <span className="text-[#d32f2f] truncate">Park Plaza</span>
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 font-medium">Detailed task and resource tracking.</p>
          </div>
          <select className="w-full sm:w-auto text-xs font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-red-500 bg-white">
            <option>Park Plaza - L1</option>
            <option>Green Valley - Ph 2</option>
            <option>Sky Tower</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-gray-50 text-[9px] md:text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              <tr>
                <th className="px-6 py-3">Task Name</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Team</th>
                <th className="px-6 py-3">Progress</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs md:text-sm font-bold text-gray-800">{task.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] text-gray-500 font-medium">
                      <CalendarDays className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{task.startDate.slice(5)} - {task.endDate.slice(5)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold truncate">
                      <UserPlus className="w-3 h-3 text-[#d32f2f] flex-shrink-0" /> {task.resource}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#d32f2f] h-full" style={{ width: `${task.progress}%` }}></div>
                    </div>
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-400 mt-1 block">{task.progress}%</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] md:text-[9px] font-bold uppercase whitespace-nowrap ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                      {task.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Team Allocation & Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Cost Breakdown</h3>
          <div className="space-y-4">
            {categoryCostData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#d32f2f]"></div>
                  <span className="text-[11px] font-semibold text-gray-600">{item.name}</span>
                </div>
                <span className="text-[11px] font-bold text-gray-800">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Utilization */}
        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xs md:text-sm font-bold text-gray-800 uppercase tracking-wide mb-4">Team Utilization</h3>
          <div className="space-y-4">
            {teamAllocation.map((team, i) => (
              <div key={i}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-700 truncate">{team.team}</span>
                  <span className="text-[10px] font-black text-[#d32f2f]">{team.utilization}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                  <div className={`h-full ${team.utilization > 90 ? 'bg-rose-500' : 'bg-[#d32f2f]'}`} style={{ width: `${team.utilization}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Risks */}
        <div className="bg-rose-50 p-4 md:p-5 rounded-2xl border border-rose-100 shadow-sm">
          <h3 className="text-xs md:text-sm font-bold text-rose-800 uppercase tracking-wide mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Risk Alerts
          </h3>
          <div className="space-y-3">
            {risks.map(r => (
              <div key={r.id} className="bg-white/80 p-3 rounded-lg border border-rose-100">
                <div className="flex justify-between mb-1">
                  <p className="text-[10px] font-bold text-rose-900">{r.issue}</p>
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-tighter">Impact: {r.impact}</span>
                </div>
                <p className="text-[9px] text-rose-700 font-medium leading-tight">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Footer Layout Responsive */}
      <div className="bg-[#1a1a1a] p-6 md:p-10 rounded-2xl md:rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#d32f2f]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between text-center md:text-left">
          <div className="max-w-xl">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="w-8 h-8 border-2 border-[#d32f2f] flex items-center justify-center">
                <span className="text-[#d32f2f] font-black tracking-widest text-base">N</span>
              </div>
              <h2 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase">Nayash Center</h2>
            </div>
            <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-6">
              Empowering enterprise visibility. Our unified ERP ensures no project details are missed in the process.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3 md:w-4 md:h-4 text-[#d32f2f]" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-[#d32f2f]" />
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">Live Sync</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-[32px] md:text-[40px] font-black text-[#d32f2f] mb-0 tracking-tighter leading-none">98%</div>
            <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mt-1">Compliance</div>
            <button className="mt-4 flex items-center gap-2 px-5 md:px-6 py-2 bg-[#d32f2f] text-white rounded-full text-[10px] md:text-xs font-bold hover:bg-[#b71c1c] transition-all">
              Reports <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;