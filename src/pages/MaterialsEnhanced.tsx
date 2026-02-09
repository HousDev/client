/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState, useEffect } from "react";
// import {
//   Package,
//   Calendar,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Truck,
//   FileText,
//   X,
//   Save,
//   UserRound,
//   Phone,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "sonner";
// import poApi from "../lib/poApi";
// import po_trackingApi from "../lib/po_tracking";
// import vendorApi from "../lib/vendorApi";
// import ItemsApi from "../lib/itemsApi";
// import { api } from "../lib/Api";
// import projectApi from "../lib/projectApi";

// // Types
// type PORef = {
//   id: string;
//   po_number?: string;
//   vendors?: { name?: string };
//   projects?: { name?: string };
// };

// type Material = {
//   id: string;
//   po_id: string;
//   item_id?: string;
//   item_description?: string;
//   quantity_ordered: number;
//   quantity_received: number;
//   quantity_pending: number;
//   status?: "pending" | "partial" | "completed" | "cancelled";
//   received_date?: string | null;
//   received_by?: string | null;
//   notes?: string | null;
//   created_at?: string;
//   purchase_orders?: PORef;
// };

// type POMaterial = {
//   id: string;
//   item_id?: string;
//   item_name?: string;
//   hsn_code?: string;
//   quantity_ordered: number;
//   quantity_received: number;
//   quantity_pending: number;
//   status?: string;
//   unit?: string;
//   item?: any;
// };

// type POData = {
//   id: string;
//   po_number: string;
//   vendor: {
//     id: string;
//     name: string;
//   };
//   project: string;
//   amount: string;
//   po_status: string;
//   material_status: string;
//   payment_status: string;
//   balance_amount: string;
//   po_date: string;
//   vendor_id: string;
//   purchase_order?: any;
//   materials: POMaterial[];
//   expanded: boolean;
//   total_ordered: number;
//   total_received: number;
//   total_pending: number;
//   overall_status: string;
// };

// export default function MaterialsEnhanced() {
//   const { user } = useAuth();
//   const [poData, setPoData] = useState<POData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
//   const [showReceiveModal, setShowReceiveModal] = useState(false);
//   const [receiveQuantity, setReceiveQuantity] = useState<number>(0);
//   const [receiveNotes, setReceiveNotes] = useState<string>("");
//   const [showModel, setShowModel] = useState<boolean>(false);
//   const [allProjects, setAllProjects] = useState<any>([]);

//   const loadAllPOs = async () => {
//     try {
//       const posRes: any = await poApi.getPOs();
//       const poMaterialTrackRes: any = await po_trackingApi.getTrackings();
//       const vendorsRes: any = await vendorApi.getVendors();
//       const itemsRes: any = await ItemsApi.getItems();
//       const projectsData: any = await projectApi.getProjects();
//       if (projectsData.success) {
//         setAllProjects(
//           Array.isArray(projectsData.data) ? projectsData.data : []
//         );
//       }
//       const poWithVendors = posRes.map((po: any) => {
//         const vendorData = vendorsRes.find((v: any) => v.id === po.vendor_id);
//         return { ...po, vendor: vendorData };
//       });

//       const idsSet = new Set(posRes.map((item: any) => item.id));
//       const filteredPoMaterialTracking = poMaterialTrackRes.filter(
//         (item: any) => idsSet.has(item.po_id)
//       );

//       // Group materials by PO
//       const poMap = new Map<string, POData>();

//       poWithVendors.forEach((po: any) => {
//         const proData = Array.isArray(projectsData.data)
//           ? projectsData.data
//           : [];

//         const project = proData.find(
//           (project: any) => project.id === Number(po.project_id)
//         );
//         console.log(po);

//         poMap.set(po.id, {
//           id: po.id,
//           po_number: po.po_number,
//           vendor: po.vendor,
//           project: project.name,
//           amount: po.grand_total,
//           po_status: po.status,
//           material_status: po.material_status,
//           payment_status: po.payment_status,
//           balance_amount: po.balance_amount,
//           po_date: new Date(po.created_at).toLocaleDateString(),
//           vendor_id: po.vendor_id,
//           purchase_order: po,
//           materials: [],
//           expanded: false,
//           total_ordered: 0,
//           total_received: 0,
//           total_pending: 0,
//           overall_status: "pending",
//         });
//       });

//       filteredPoMaterialTracking.forEach((mt: any) => {
//         const po = poMap.get(mt.po_id);
//         if (po) {
//           const itemData = itemsRes.find(
//             (i: any) => i.id === Number(mt.item_id)
//           );

//           const material: POMaterial = {
//             id: mt.id,
//             item_id: mt.item_id,
//             item_name: itemData?.item_name,
//             hsn_code: itemData?.hsn_code,
//             quantity_ordered: Number(mt.quantity_ordered || 0),
//             quantity_received: Number(mt.quantity_received || 0),
//             quantity_pending: Number(mt.quantity_pending || 0),
//             status: mt.status || "pending",
//             unit: itemData?.unit,
//             item: itemData,
//           };

//           po.materials.push(material);

//           // Update PO totals
//           po.total_ordered += material.quantity_ordered;
//           po.total_received += material.quantity_received;
//           po.total_pending += material.quantity_pending;
//         }
//       });

//       // Calculate overall status for each PO
//       poMap.forEach((po) => {
//         if (po.materials.length === 0) {
//           po.overall_status = "pending";
//         } else if (po.materials.every((m) => m.status === "completed")) {
//           po.overall_status = "completed";
//         } else if (
//           po.materials.some(
//             (m) => m.status === "partial" || m.status === "completed"
//           )
//         ) {
//           po.overall_status = "partial";
//         } else {
//           po.overall_status = "pending";
//         }
//       });

//       const poDataArray = Array.from(poMap.values());
//       setPoData(poDataArray);
//       setLoading(false);
//     } catch (error) {
//       toast.error("Something Went Wrong.");
//       setLoading(false);
//     }
//   };

//   const loadProjects = async () => {
//     try {
//       const data: any = await projectApi.getProjects();
//       if (data.success) {
//         setAllProjects(data.data);
//         return;
//       }
//       setAllProjects([]);
//     } catch (err) {
//       console.warn("loadProjects failed", err);
//       setAllProjects([]);
//     }
//   };

//   useEffect(() => {
//     loadAllPOs();
//     loadProjects();
//   }, []);

//   const togglePOExpand = (poId: string) => {
//     setPoData((prev) =>
//       prev.map((po) =>
//         po.id === poId ? { ...po, expanded: !po.expanded } : po
//       )
//     );
//   };

//   const expandAllPOs = () => {
//     setPoData((prev) => prev.map((po) => ({ ...po, expanded: true })));
//   };

//   const collapseAllPOs = () => {
//     setPoData((prev) => prev.map((po) => ({ ...po, expanded: false })));
//   };

//   const getStatusColor = (status?: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-red-100 text-red-700",
//       partial: "bg-yellow-100 text-yellow-700",
//       approved: "bg-orange-100 text-orange-700",
//       completed: "bg-green-100 text-green-700",
//       authorize: "bg-green-100 text-green-700",
//       cancelled: "bg-red-100 text-red-700",
//     };
//     return (status && styles[status]) || "bg-gray-100 text-gray-700";
//   };

//   const getStatusIcon = (status?: string) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle className="w-5 h-5 text-green-600" />;
//       case "partial":
//         return <Clock className="w-5 h-5 text-yellow-600" />;
//       case "pending":
//         return <AlertCircle className="w-5 h-5 text-gray-600" />;
//       default:
//         return <Package className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const calculatePercentage = (received: number, ordered: number) => {
//     return ordered > 0 ? Math.round((received * 100) / ordered) : 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!selectedMaterial) return;

//     try {
//       // Your existing validation and submission logic
//       // ... (keep your existing handleSubmit code)
//     } catch (error: any) {
//       console.error("Create transaction error:", error);
//       toast.error(error?.response?.data?.message || "Something went wrong");
//     }
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedMaterial((prev: any) => ({ ...prev, challan_image: file }));
//     }
//   };

//   const handleReceiveMaterial = (po: POData, material: POMaterial) => {
//     setSelectedMaterial({
//       ...material,
//       purchase_order: po.purchase_order,
//     });
//     setShowModel(true);
//   };
//   const formatCurrency = (amount?: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount || 0);
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading materials...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Material Tracking</h1>
//         <p className="text-gray-600 mt-1">
//           Track material receipts and deliveries
//         </p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total POs</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {poData.length}
//               </p>
//             </div>
//             <Package className="w-12 h-12 text-blue-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Pending POs</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {poData.filter((po) => po.overall_status === "pending").length}
//               </p>
//             </div>
//             <Clock className="w-12 h-12 text-gray-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Partial POs</p>
//               <p className="text-3xl font-bold text-yellow-600">
//                 {poData.filter((po) => po.overall_status === "partial").length}
//               </p>
//             </div>
//             <Truck className="w-12 h-12 text-yellow-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Completed POs</p>
//               <p className="text-3xl font-bold text-green-600">
//                 {
//                   poData.filter((po) => po.overall_status === "completed")
//                     .length
//                 }
//               </p>
//             </div>
//             <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
//           </div>
//         </div>
//       </div>

//       {/* POs List with Accordion */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 w-12">
//                   {/* Expand/collapse column */}
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   PO Number
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Vendor
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Project
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Amount
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   PO Status
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Material
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Payment
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {poData.map((po) => {
//                 const overallPercentage = calculatePercentage(
//                   po.total_received,
//                   po.total_ordered
//                 );

//                 return (
//                   <>
//                     {/* PO Summary Row */}
//                     <tr
//                       key={po.id}
//                       className="hover:bg-gray-50 transition bg-blue-50/30 cursor-pointer"
//                       onClick={() => togglePOExpand(po.id)}
//                     >
//                       <td className="px-6 py-4">
//                         <button className="p-1 hover:bg-gray-200 rounded">
//                           {po.expanded ? (
//                             <ChevronDown className="w-5 h-5 text-gray-600" />
//                           ) : (
//                             <ChevronRight className="w-5 h-5 text-gray-600" />
//                           )}
//                         </button>
//                       </td>
//                       <td className="px-6 py-4 flex">
//                         <div className="flex items-center mr-3">
//                           <FileText className="w-5 h-5 text-blue-600 hover:text-blue-700" />
//                         </div>
//                         <div>
//                           <span className="font-medium text-blue-600">
//                             {po.po_number}
//                           </span>
//                           <p className="text-xs text-gray-500">
//                             {po.po_date
//                               ? new Date(po.po_date).toLocaleDateString()
//                               : ""}
//                           </p>
//                         </div>
//                       </td>
//                       <td className="px-6 py-4 text-gray-700">
//                         {po.vendor?.name || "--"}
//                       </td>
//                       <td className="px-6 py-4 font-medium text-gray-800">
//                         {po.project || "--"}
//                       </td>
//                       <td className="px-6 py-4 font-medium text-gray-800">
//                         {po.amount || "--"}
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             po.po_status
//                           )}`}
//                         >
//                           {po.po_status?.toUpperCase()}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             po.material_status
//                           )}`}
//                         >
//                           {po.material_status?.toUpperCase() || "PENDING"}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4">
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             po.payment_status
//                           )}`}
//                         >
//                           {po.payment_status?.toUpperCase() || "PENDING"}
//                         </span>
//                         {Number(po.balance_amount)! > 0 && (
//                           <p className="text-xs text-gray-600 mt-1">
//                             Bal: {formatCurrency(Number(po.balance_amount))}
//                           </p>
//                         )}
//                       </td>
//                     </tr>

//                     {/* Expanded Items Row */}
//                     {po.expanded && po.materials.length > 0 && (
//                       <tr className="bg-gray-50">
//                         <td colSpan={10} className="p-0">
//                           <div className="px-6 py-4 border-t border-gray-200">
//                             <h4 className="text-sm font-semibold text-gray-700 mb-3">
//                               Items in PO {po.po_number}
//                             </h4>
//                             <div className="overflow-x-auto">
//                               <table className="w-full bg-white rounded-lg border border-gray-200">
//                                 <thead className="bg-gray-100">
//                                   <tr>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Item
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       HSN Code
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Ordered
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Received
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Pending
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Progress
//                                     </th>
//                                     <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                       Status
//                                     </th>
//                                   </tr>
//                                 </thead>
//                                 <tbody className="divide-y divide-gray-200">
//                                   {po.materials.map((material) => {
//                                     const materialPercentage =
//                                       calculatePercentage(
//                                         material.quantity_received,
//                                         material.quantity_ordered
//                                       );

//                                     return (
//                                       <tr
//                                         key={material.id}
//                                         className="hover:bg-gray-50"
//                                       >
//                                         <td className="px-4 py-3">
//                                           <div className="font-medium text-gray-800">
//                                             {material.item_name || "Unknown"}
//                                           </div>
//                                           <div className="text-xs text-gray-500">
//                                             Unit: {material.unit || "N/A"}
//                                           </div>
//                                         </td>
//                                         <td className="px-4 py-3 text-gray-700">
//                                           {material.hsn_code || "-"}
//                                         </td>
//                                         <td className="px-4 py-3 font-medium text-gray-800">
//                                           {material.quantity_ordered}
//                                         </td>
//                                         <td className="px-4 py-3 font-medium text-green-600">
//                                           {material.quantity_received}
//                                         </td>
//                                         <td className="px-4 py-3 font-medium text-orange-600">
//                                           {material.quantity_pending}
//                                         </td>
//                                         <td className="px-4 py-3">
//                                           <div className="w-full bg-gray-200 rounded-full h-2">
//                                             <div
//                                               className="bg-blue-600 h-2 rounded-full transition-all"
//                                               style={{
//                                                 width: `${materialPercentage}%`,
//                                               }}
//                                             />
//                                           </div>
//                                           <p className="text-xs text-gray-600 mt-1">
//                                             {materialPercentage}%
//                                           </p>
//                                         </td>
//                                         <td className="px-4 py-3">
//                                           <span
//                                             className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                                               material.status
//                                             )}`}
//                                           >
//                                             {material.status?.toUpperCase() ||
//                                               "PENDING"}
//                                           </span>
//                                         </td>
//                                       </tr>
//                                     );
//                                   })}
//                                 </tbody>
//                               </table>
//                             </div>
//                           </div>
//                         </td>
//                       </tr>
//                     )}

//                     {/* Show message if no materials */}
//                     {po.expanded && po.materials.length === 0 && (
//                       <tr className="bg-gray-50">
//                         <td colSpan={10} className="p-0">
//                           <div className="px-6 py-8 border-t border-gray-200 text-center">
//                             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                             <p className="text-gray-600">
//                               No materials found for this purchase order
//                             </p>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </>
//                 );
//               })}
//             </tbody>
//           </table>

//           {poData.length === 0 && (
//             <div className="text-center py-12">
//               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                 No purchase orders to track
//               </h3>
//               <p className="text-gray-600">
//                 Authorized purchase orders will appear here
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// import { useState, useEffect } from "react";
// import {
//   Package,
//   Calendar,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Truck,
//   FileText,
//   X,
//   Save,
//   UserRound,
//   Phone,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "sonner";
// import poApi from "../lib/poApi";
// import po_trackingApi from "../lib/po_tracking";
// import vendorApi from "../lib/vendorApi";
// import ItemsApi from "../lib/itemsApi";
// import { api } from "../lib/Api";
// import projectApi from "../lib/projectApi";

// type PORef = {
//   id: string;
//   po_number?: string;
//   vendors?: { name?: string };
//   projects?: { name?: string };
// };
// type Material = {
//   id: string;
//   po_id: string;
//   item_id?: string;
//   item_description?: string;
//   quantity_ordered: number;
//   quantity_received: number;
//   quantity_pending: number;
//   status?: "pending" | "partial" | "completed" | "cancelled";
//   received_date?: string | null;
//   received_by?: string | null;
//   notes?: string | null;
//   created_at?: string;
//   purchase_orders?: PORef;
// };

// export default function MaterialsEnhanced() {
//   const { user } = useAuth();
//   const [materials, setMaterials] = useState<any>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedMaterial, setSelectedMaterial] = useState<anyl>(null);
//   const [showReceiveModal, setShowReceiveModal] = useState(false);
//   const [receiveQuantity, setReceiveQuantity] = useState<number>(0);
//   const [receiveNotes, setReceiveNotes] = useState<string>("");
//   const [showModel, setShowModel] = useState<boolean>(false);
//   const [allProjects, setAllProjects] = useState<any>([]);

//   // localStorage key
//   const KEY_MATERIALS = "mock_po_materials_v1";
//   const KEY_POS = "mock_pos_minimal_v1";

//   // default demo data (used when nothing in storage)
//   const defaultPOs: PORef[] = [
//     {
//       id: "po_1",
//       po_number: "PO-1001",
//       vendors: { name: "Acme Supplies" },
//       projects: { name: "Site A" },
//     },
//     {
//       id: "po_2",
//       po_number: "PO-1002",
//       vendors: { name: "Builder Co" },
//       projects: { name: "Site B" },
//     },
//   ];

//   const defaultMaterials: Material[] = [
//     {
//       id: "m_1",
//       po_id: "po_1",
//       item_id: "itm_001",
//       item_description: "Cement Bags",
//       quantity_ordered: 100,
//       quantity_received: 0,
//       quantity_pending: 100,
//       status: "pending",
//       received_date: null,
//       created_at: new Date().toISOString(),
//       purchase_orders: defaultPOs[0],
//     },
//     {
//       id: "m_2",
//       po_id: "po_2",
//       item_id: "itm_002",
//       item_description: "Steel Rods",
//       quantity_ordered: 200,
//       quantity_received: 100,
//       quantity_pending: 100,
//       status: "partial",
//       received_date: null,
//       created_at: new Date().toISOString(),
//       purchase_orders: defaultPOs[1],
//     },
//   ];

//   const loadAllPOs = async () => {
//     try {
//       const posRes: any = await poApi.getPOs();
//       const poMaterialTrackRes: any = await po_trackingApi.getTrackings();
//       const vendorsRes: any = await vendorApi.getVendors();
//       const itemsRes: any = await ItemsApi.getItems();

//       const filterPosRes = posRes.filter((p: any) => p.status === "authorize");

//       const poWithVendors = filterPosRes.map((po: any) => {
//         const vendorData = vendorsRes.find((v: any) => v.id === po.vendor_id);
//         return { ...po, vendor: vendorData };
//       });

//       const idsSet = new Set(filterPosRes.map((item: any) => item.id));
//       console.log(idsSet);
//       const filteredPoMaterialTracking = poMaterialTrackRes.filter(
//         (item: any) => idsSet.has(item.po_id)
//       );

//       const poMaterialTrackWithItemsAndPO = filteredPoMaterialTracking.map(
//         (mt: any) => {
//           const poData = poWithVendors.find((p: any) => p.id === mt.po_id);
//           const itemData = itemsRes.find(
//             (i: any) => i.id === Number(mt.item_id)
//           );
//           return { ...mt, purchase_order: poData, item: itemData };
//         }
//       );
//       console.log(poMaterialTrackWithItemsAndPO, "final result");
//       setMaterials(
//         Array.isArray(poMaterialTrackWithItemsAndPO)
//           ? poMaterialTrackWithItemsAndPO
//           : []
//       );
//       setLoading(false);
//     } catch (error) {
//       toast.error("Something Went Wrong.");
//     }
//   };
//   const loadProjects = async () => {
//     setLoading(true);
//     try {
//       const data: any = await projectApi.getProjects();
//       if (data.success) {
//         setAllProjects(data.data);
//         setLoading(false);
//         return;
//       }
//       setAllProjects([]);
//     } catch (err) {
//       console.warn("loadProjects failed, using fallback demo data", err);
//       setAllProjects([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAllPOs();
//     loadProjects();
//     // loadMaterials();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadMaterials = () => {
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         const raw = localStorage.getItem(KEY_MATERIALS);
//         const rawPOs = localStorage.getItem(KEY_POS);
//         const pos: PORef[] = rawPOs ? JSON.parse(rawPOs) : defaultPOs;

//         let mats: Material[] = raw ? JSON.parse(raw) : [];
//         if (!raw || !Array.isArray(mats) || mats.length === 0) {
//           mats = defaultMaterials;
//           localStorage.setItem(KEY_MATERIALS, JSON.stringify(mats));
//           localStorage.setItem(KEY_POS, JSON.stringify(pos));
//         }

//         // Attach current PO refs where possible (in case user edited POs separately)
//         mats = mats.map((m) => ({
//           ...m,
//           purchase_orders: pos.find((p) => p.id === m.po_id) ??
//             m.purchase_orders ?? { id: m.po_id, po_number: "N/A" },
//         }));

//         // ensure numeric fields
//         mats = mats.map((m) => ({
//           ...m,
//           quantity_ordered: Number(m.quantity_ordered || 0),
//           quantity_received: Number(m.quantity_received || 0),
//           quantity_pending:
//             m.quantity_pending !== undefined
//               ? Number(m.quantity_pending)
//               : Number(m.quantity_ordered - (m.quantity_received || 0)),
//         }));

//         setMaterials(mats);
//       } catch (err) {
//         console.error("Error loading materials from localStorage:", err);
//         setMaterials([]);
//       } finally {
//         setLoading(false);
//       }
//     }, 200);
//   };

//   const persistMaterials = (newMaterials: Material[]) => {
//     localStorage.setItem(KEY_MATERIALS, JSON.stringify(newMaterials));
//     // keep newest first by created_at
//     newMaterials.sort((a, b) =>
//       (b.created_at || "").localeCompare(a.created_at || "")
//     );
//     setMaterials(newMaterials);
//   };

//   const handleReceive = async () => {
//     if (!selectedMaterial) return;
//     if (receiveQuantity <= 0) {
//       alert("Enter a valid quantity to receive.");
//       return;
//     }
//     if (
//       receiveQuantity >
//       (selectedMaterial.quantity_pending || selectedMaterial.quantity_ordered)
//     ) {
//       alert("Receive quantity cannot exceed pending quantity.");
//       return;
//     }

//     // simulate async update
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         const newMaterials = materials.map((m: any) => {
//           if (m.id !== selectedMaterial.id) return m;
//           const newReceived = (m.quantity_received || 0) + receiveQuantity;
//           const newPending = Math.max(
//             0,
//             (m.quantity_ordered || 0) - newReceived
//           );
//           const newStatus: Material["status"] =
//             newPending === 0
//               ? "completed"
//               : newReceived > 0
//               ? "partial"
//               : "pending";
//           return {
//             ...m,
//             quantity_received: newReceived,
//             quantity_pending: newPending,
//             status: newStatus,
//             received_date: new Date().toISOString(),
//             received_by: user?.id ?? null,
//             notes: receiveNotes || m.notes || null,
//           };
//         });

//         // persist
//         persistMaterials(newMaterials);

//         // After updating individual material(s), recompute per-PO summary if needed.
//         // For demo, we won't persist a separate purchase_orders table; we just show alerts.
//         // But we still compute status for each PO (not saved elsewhere here).
//         // If you have a PO storage, you can update it similarly.

//         alert("Material received successfully!");
//         setShowReceiveModal(false);
//         setSelectedMaterial(null);
//         setReceiveQuantity(0);
//         setReceiveNotes("");
//       } catch (err) {
//         console.error("Error receiving material (mock):", err);
//         alert("Error receiving material");
//       } finally {
//         setLoading(false);
//       }
//     }, 300);
//   };

//   const getStatusColor = (status?: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-gray-100 text-gray-700",
//       partial: "bg-yellow-100 text-yellow-700",
//       completed: "bg-green-100 text-green-700",
//       cancelled: "bg-red-100 text-red-700",
//     };
//     return (status && styles[status]) || "bg-gray-100 text-gray-700";
//   };

//   const getStatusIcon = (status?: string) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle className="w-5 h-5 text-green-600" />;
//       case "partial":
//         return <Clock className="w-5 h-5 text-yellow-600" />;
//       case "pending":
//         return <AlertCircle className="w-5 h-5 text-gray-600" />;
//       default:
//         return <Package className="w-5 h-5 text-gray-600" />;
//     }
//   };

//   const calculatePercentage = (received: number, ordered: number) => {
//     return ordered > 0 ? Math.round((received * 100) / ordered) : 0;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(selectedMaterial, "selectedMeterial");
//     try {
//       // 🔴 BASIC VALIDATION
//       if (
//         !selectedMaterial.receivingDate ||
//         !selectedMaterial.receiverName ||
//         !selectedMaterial.receiverPhone ||
//         !selectedMaterial.deliveryLocation
//       ) {
//         toast.error("All fields are required.");
//         return;
//       }
//       if (!(selectedMaterial.receiverPhone.length === 10)) {
//         toast.error("Receiver Mobile Number Must be 10 digits.");
//         return;
//       }
//       if (selectedMaterial.receiverName.length < 3) {
//         toast.error("Enter valid receiver name.");
//         return;
//       }

//       if (!selectedMaterial.item) {
//         toast.error("At least one item is required.");
//         return;
//       }

//       if (selectedMaterial.issuedQuantity <= 0) {
//         toast.error("Received quantity must be greater than 0.");
//         return;
//       }

//       const selectedMaterialObj = new FormData();

//       // 🔹 Basic fields
//       selectedMaterialObj.append(
//         "po_id",
//         String(selectedMaterial.purchase_order.id)
//       );
//       selectedMaterialObj.append(
//         "vendor_id",
//         String(selectedMaterial.purchase_order.vendor.id)
//       );
//       selectedMaterialObj.append(
//         "challan_number",
//         selectedMaterial.challanNumber
//       );
//       selectedMaterialObj.append(
//         "receiving_date",
//         selectedMaterial.receivingDate
//       );
//       selectedMaterialObj.append(
//         "receiver_name",
//         selectedMaterial.receiverName
//       );
//       selectedMaterialObj.append(
//         "receiver_phone",
//         selectedMaterial.receiverPhone
//       );
//       selectedMaterialObj.append(
//         "delivery_location",
//         selectedMaterial.deliveryLocation
//       );

//       // 🔹 Challan image
//       if (selectedMaterial.challan_image) {
//         selectedMaterialObj.append(
//           "challan_image",
//           selectedMaterial.challan_image
//         );
//       }
//       const items = [
//         {
//           id: selectedMaterial.item.id,
//           quantity_issued: selectedMaterial.issuedQuantity,
//         },
//       ];

//       // 🔹 Items
//       selectedMaterialObj.append(
//         "items",
//         JSON.stringify(
//           items.map((item: any) => ({
//             id: item.id,
//             quantity_issued: Number(item.quantity_issued),
//           }))
//         )
//       );

//       const response = await api.post(
//         "/inventory-transaction",
//         selectedMaterialObj,
//         {
//           headers: { "Content-Type": "multipart/form-data" },
//         }
//       );

//       if (response.status === 201) {
//         toast.success("Transaction created successfully.");
//         setSelectedMaterial(null);
//         loadAllPOs();
//         setShowModel(false);
//       } else {
//         toast.error("Failed to create transaction.");
//       }
//     } catch (error: any) {
//       console.error("Create transaction error:", error);

//       toast.error(error?.response?.data?.message || "Something went wrong");
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading materials...</p>
//         </div>
//       </div>
//     );
//   }

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setSelectedMaterial((prev: any) => ({ ...prev, challan_image: file }));
//     }
//   };
//   return (
//     <div className="p-6">
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold text-gray-800">Material Tracking</h1>
//         <p className="text-gray-600 mt-1">
//           Track material receipts and deliveries
//         </p>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total Items</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {materials.length}
//               </p>
//             </div>
//             <Package className="w-12 h-12 text-blue-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Pending</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {materials.filter((m: any) => m.status === "pending").length}
//               </p>
//             </div>
//             <Clock className="w-12 h-12 text-gray-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Partial</p>
//               <p className="text-3xl font-bold text-yellow-600">
//                 {
//                   materials.filter(
//                     (m: any) =>
//                       Number(m.quantity_pending) !== 0 &&
//                       Number(m.quantity_received) !== 0
//                   ).length
//                 }
//               </p>
//             </div>
//             <Truck className="w-12 h-12 text-yellow-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Completed</p>
//               <p className="text-3xl font-bold text-green-600">
//                 {materials.filter((m: any) => m.status === "completed").length}
//               </p>
//             </div>
//             <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
//           </div>
//         </div>
//       </div>

//       {/* Materials List */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   PO Number
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Item
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Vendor
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Ordered
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Received
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Pending
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Progress
//                 </th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
//                   Status
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {materials.map((material: any) => {
//                 const percentage = calculatePercentage(
//                   material.quantity_received || 0,
//                   material.quantity_ordered || 0
//                 );
//                 return (
//                   <tr key={material.id} className="hover:bg-gray-50 transition">
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <FileText className="w-4 h-4 text-blue-600" />
//                         <span className="font-medium text-gray-800">
//                           {material.purchase_order?.po_number || material.po_id}
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <p className="font-medium text-gray-800">
//                         {material.item.item_name}
//                       </p>
//                       <p className="text-sm text-gray-500">
//                         HSN Code : {material.item.hsn_code}
//                       </p>
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">
//                       {material.purchase_order?.vendor?.name || "-"}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-gray-800">
//                       {material.quantity_ordered}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-green-600">
//                       {material.quantity_received || 0}
//                     </td>
//                     <td className="px-6 py-4 font-medium text-orange-600">
//                       {material.quantity_pending || material.quantity_ordered}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div
//                           className="bg-blue-600 h-2 rounded-full transition-all"
//                           style={{ width: `${percentage}%` }}
//                         />
//                       </div>
//                       <p className="text-xs text-gray-600 mt-1">
//                         {percentage}%
//                       </p>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         {getStatusIcon(material.status)}
//                         <span
//                           className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                             material.status
//                           )}`}
//                         >
//                           {material.status?.toUpperCase() || "PENDING"}
//                         </span>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {materials.length === 0 && (
//           <div className="text-center py-12">
//             <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">
//               No materials to track
//             </h3>
//             <p className="text-gray-600">
//               Materials from purchase orders will appear here
//             </p>
//           </div>
//         )}
//       </div>

//       {showModel && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
//               <h2 className="text-xl font-bold text-white flex items-center gap-2">
//                 <Truck className="w-5 h-5" />
//                 Material In
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowModel(false);
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             {/* Content */}
//             <div className="my-3 px-6 py-3 min-h-[300px] max-h-[530px] overflow-y-scroll rounded-b-lg">
//               <form onSubmit={handleSubmit} className="space-y-3">
//                 {/* PO Number & Vendor */}
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       PO Number <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <input
//                         type="text"
//                         disabled
//                         value={selectedMaterial.purchase_order.po_number}
//                         className="w-full outline-none px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter challan number"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Vendor <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
//                       <Truck className="w-4 h-4 text-gray-500" />
//                       <span className="text-gray-700 text-sm">
//                         {selectedMaterial.purchase_order.vendor.name ||
//                           "Vendor"}
//                       </span>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Challan Number
//                     </label>
//                     <input
//                       type="text"
//                       onChange={(e) => {
//                         setSelectedMaterial((prev: any) => ({
//                           ...prev,
//                           challanNumber: e.target.value,
//                         }));
//                       }}
//                       className="w-full outline-none px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter challan number"
//                     />
//                   </div>
//                 </div>

//                 {/* Receiving Date, Receiver Name & Phone */}
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Receiving Date <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <Calendar className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                       <input
//                         type="date"
//                         onChange={(e) =>
//                           setSelectedMaterial((prev: any) => ({
//                             ...prev,
//                             ["receivingDate"]: e.target.value,
//                           }))
//                         }
//                         className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Receiver Name <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <UserRound className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                       <input
//                         type="text"
//                         value={selectedMaterial.receiverName}
//                         onChange={(e) => {
//                           setSelectedMaterial((prev: any) => ({
//                             ...prev,
//                             receiverName: e.target.value,
//                           }));
//                         }}
//                         className="w-full outline-none pl-10 pr-4 py-2 text-sm  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Receiver Name"
//                         required
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Receiver Phone <span className="text-red-500">*</span>
//                     </label>
//                     <div className="relative">
//                       <Phone className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                       <input
//                         type="tel"
//                         value={selectedMaterial.receiverPhone}
//                         onChange={(e) => {
//                           if (!/^\d*$/.test(e.target.value)) {
//                             toast.warning("Enter Valid Phone Number.");
//                             return;
//                           }
//                           if (Number(e.target.value.length) <= 10) {
//                             setSelectedMaterial((prev: any) => ({
//                               ...prev,
//                               receiverPhone: e.target.value,
//                             }));
//                           } else {
//                             toast.warning(
//                               "Only 10 digit mobile number allowed."
//                             );
//                           }
//                         }}
//                         className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Enter phone number"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Delivery Location */}
//                 <div className="grid grid-cols-3 gap-3">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Delivery Location <span className="text-red-500">*</span>
//                     </label>

//                     <div className="relative">
//                       <select
//                         value={selectedMaterial.deliveryLocation}
//                         onChange={(e) =>
//                           setSelectedMaterial((prev: any) => ({
//                             ...prev,
//                             deliveryLocation: e.target.value,
//                           }))
//                         }
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm outline-none"
//                         required
//                       >
//                         <option value="">Delivery Location</option>
//                         {allProjects.map((project: any) => (
//                           <option key={project.id} value={project.loaction}>
//                             {project.name}-{"("}
//                             {project.location}
//                             {")"}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                   {/* File Upload */}
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       Challan Receipt
//                     </label>
//                     <input
//                       type="file"
//                       id="challan_image"
//                       onChange={handleFileUpload}
//                       className="w-full file:px-4 file:py-2 text-sm border file:rounded-l-lg file:border-none file:font-semibold  file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:mr-3 border-gray-300 rounded-lg focus:ring-2  focus:ring-blue-500 focus:border-transparent"
//                       accept=".pdf,.jpg,.jpeg,.png"
//                     />
//                   </div>
//                 </div>

//                 <div className="border border-gray-200 rounded-lg overflow-hidden">
//                   <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//                     <h3 className="font-medium text-gray-700 flex items-center gap-2">
//                       <Package className="w-4 h-4" />
//                       Items to Receive
//                     </h3>
//                   </div>
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                             Material
//                           </th>
//                           <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                             Ordered Qty
//                           </th>
//                           <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                             Total Issued Qty
//                           </th>
//                           <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                             Received Qty *
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         <tr
//                           key={selectedMaterial.item.id}
//                           className="hover:bg-gray-50"
//                         >
//                           <td className="px-4 py-3">
//                             <div className="font-medium text-gray-800">
//                               {selectedMaterial.item?.item_name || "Unknown"}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="text-gray-700">
//                               {selectedMaterial.quantity_ordered || 0}{" "}
//                               {selectedMaterial.item?.unit || "N/A"}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <div className="text-gray-700">
//                               {selectedMaterial.quantity_received}{" "}
//                               {selectedMaterial.item?.unit || "N/A"}
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">
//                             <input
//                               type="text"
//                               min="0"
//                               max={Number(selectedMaterial.quantity_pending)}
//                               value={selectedMaterial.issuedQuantity}
//                               onChange={(e) => {
//                                 if (
//                                   !/^\d*\.?\d*$/.test(e.target.value) ||
//                                   Number(e.target.value) < 0
//                                 ) {
//                                   toast.warning("only number");
//                                   return 0;
//                                 } else {
//                                   const t =
//                                     Number(selectedMaterial.quantity_ordered) -
//                                     Number(selectedMaterial.quantity_received);

//                                   if (t < Number(e.target.value)) {
//                                     toast.error(
//                                       "Received Qty. is greater than pending Qty."
//                                     );
//                                     return;
//                                   }
//                                   setSelectedMaterial((prev: any) => ({
//                                     ...prev,
//                                     issuedQuantity: e.target.value,
//                                   }));
//                                 }
//                               }}
//                               className="w-32 outline-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               placeholder="0"
//                               required
//                             />
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 {/* Submit Button */}
//                 <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white text-sm">
//                   <button
//                     type="submit"
//                     className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//                   >
//                     <Save className="w-4 h-4 mr-2" />
//                     {loading ? "Processing..." : "Material In"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setShowModel(false);
//                     }}
//                     className="px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                   >
//                     Cancel
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import {
//   Package,
//   Calendar,
//   CheckCircle,
//   AlertCircle,
//   Clock,
//   Truck,
//   FileText,
//   ChevronDown,
//   ChevronRight,
//   Trash2,
//   AlertTriangle,
//   Loader2,
//   CheckSquare,
//   Square,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import { toast } from "sonner";
// import poApi from "../lib/poApi";
// import po_trackingApi from "../lib/po_tracking";
// import vendorApi from "../lib/vendorApi";
// import ItemsApi from "../lib/itemsApi";
// import projectApi from "../lib/projectApi";

// // Types
// type PORef = {
//   id: string;
//   po_number?: string;
//   vendors?: { name?: string };
//   projects?: { name?: string };
// };

// type Material = {
//   id: string;
//   po_id: string;
//   item_id?: string;
//   item_description?: string;
//   quantity_ordered: number;
//   quantity_received: number;
//   quantity_pending: number;
//   status?: "pending" | "partial" | "completed" | "cancelled";
//   received_date?: string | null;
//   received_by?: string | null;
//   notes?: string | null;
//   created_at?: string;
//   purchase_orders?: PORef;
// };

// type POMaterial = {
//   id: string;
//   item_id?: string;
//   item_name?: string;
//   hsn_code?: string;
//   quantity_ordered: number;
//   quantity_received: number;
//   quantity_pending: number;
//   status?: string;
//   unit?: string;
//   item?: any;
// };

// type POData = {
//   id: string;
//   po_number: string;
//   vendor: {
//     id: string;
//     name: string;
//   };
//   project: string;
//   amount: string;
//   po_status: string;
//   material_status: string;
//   payment_status: string;
//   balance_amount: string;
//   po_date: string;
//   vendor_id: string;
//   purchase_order?: any;
//   materials: POMaterial[];
//   expanded: boolean;
//   total_ordered: number;
//   total_received: number;
//   total_pending: number;
//   overall_status: string;
// };

// export default function MaterialsEnhanced() {
//   const { user } = useAuth();
//   const [poData, setPoData] = useState<POData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);

//   // Bulk selection
//   const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
//   const [selectAll, setSelectAll] = useState(false);

//   // Column search states
//   const [searchPONumber, setSearchPONumber] = useState("");
//   const [searchVendor, setSearchVendor] = useState("");
//   const [searchProject, setSearchProject] = useState("");
//   const [searchStatus, setSearchStatus] = useState("");

//   const loadAllPOs = async () => {
//     try {
//       const posRes: any = await poApi.getPOs();
//       const poMaterialTrackRes: any = await po_trackingApi.getTrackings();
//       const vendorsRes: any = await vendorApi.getVendors();
//       const itemsRes: any = await ItemsApi.getItems();
//       const projectsData: any = await projectApi.getProjects();

//       const poWithVendors = posRes.map((po: any) => {
//         const vendorData = vendorsRes.find((v: any) => v.id === po.vendor_id);
//         return { ...po, vendor: vendorData };
//       });

//       const idsSet = new Set(posRes.map((item: any) => item.id));
//       const filteredPoMaterialTracking = poMaterialTrackRes.filter(
//         (item: any) => idsSet.has(item.po_id)
//       );

//       // Group materials by PO
//       const poMap = new Map<string, POData>();

//       poWithVendors.forEach((po: any) => {
//         const proData = Array.isArray(projectsData.data)
//           ? projectsData.data
//           : [];

//         const project = proData.find(
//           (project: any) => project.id === Number(po.project_id)
//         );

//         poMap.set(po.id, {
//           id: po.id,
//           po_number: po.po_number,
//           vendor: po.vendor,
//           project: project?.name || "--",
//           amount: po.grand_total,
//           po_status: po.status,
//           material_status: po.material_status,
//           payment_status: po.payment_status,
//           balance_amount: po.balance_amount,
//           po_date: new Date(po.created_at).toLocaleDateString(),
//           vendor_id: po.vendor_id,
//           purchase_order: po,
//           materials: [],
//           expanded: false,
//           total_ordered: 0,
//           total_received: 0,
//           total_pending: 0,
//           overall_status: "pending",
//         });
//       });

//       filteredPoMaterialTracking.forEach((mt: any) => {
//         const po = poMap.get(mt.po_id);
//         if (po) {
//           const itemData = itemsRes.find(
//             (i: any) => i.id === Number(mt.item_id)
//           );

//           const material: POMaterial = {
//             id: mt.id,
//             item_id: mt.item_id,
//             item_name: itemData?.item_name,
//             hsn_code: itemData?.hsn_code,
//             quantity_ordered: Number(mt.quantity_ordered || 0),
//             quantity_received: Number(mt.quantity_received || 0),
//             quantity_pending: Number(mt.quantity_pending || 0),
//             status: mt.status || "pending",
//             unit: itemData?.unit,
//             item: itemData,
//           };

//           po.materials.push(material);

//           // Update PO totals
//           po.total_ordered += material.quantity_ordered;
//           po.total_received += material.quantity_received;
//           po.total_pending += material.quantity_pending;
//         }
//       });

//       // Calculate overall status for each PO
//       poMap.forEach((po) => {
//         if (po.materials.length === 0) {
//           po.overall_status = "pending";
//         } else if (po.materials.every((m) => m.status === "completed")) {
//           po.overall_status = "completed";
//         } else if (
//           po.materials.some(
//             (m) => m.status === "partial" || m.status === "completed"
//           )
//         ) {
//           po.overall_status = "partial";
//         } else {
//           po.overall_status = "pending";
//         }
//       });

//       const poDataArray = Array.from(poMap.values());
//       setPoData(poDataArray);
//       setLoading(false);
//       setSelectedPOs([]);
//       setSelectAll(false);
//     } catch (error) {
//       toast.error("Something Went Wrong.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAllPOs();
//   }, []);

//   const togglePOExpand = (poId: string) => {
//     setPoData((prev) =>
//       prev.map((po) =>
//         po.id === poId ? { ...po, expanded: !po.expanded } : po
//       )
//     );
//   };

//   const getStatusColor = (status?: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-red-100 text-red-800",
//       partial: "bg-yellow-100 text-yellow-800",
//       approved: "bg-orange-100 text-orange-800",
//       completed: "bg-green-100 text-green-800",
//       authorize: "bg-green-100 text-green-800",
//       cancelled: "bg-red-100 text-red-800",
//     };
//     return (status && styles[status]) || "bg-gray-100 text-gray-800";
//   };

//   const calculatePercentage = (received: number, ordered: number) => {
//     return ordered > 0 ? Math.round((received * 100) / ordered) : 0;
//   };

//   // Handle PO selection
//   const togglePOSelection = (poId: string) => {
//     setSelectedPOs(prev =>
//       prev.includes(poId)
//         ? prev.filter(id => id !== poId)
//         : [...prev, poId]
//     );
//   };

//   // Handle select all
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedPOs([]);
//     } else {
//       setSelectedPOs(filteredPOs.map(po => po.id));
//     }
//     setSelectAll(!selectAll);
//   };

//   // Filter function
//   const filteredPOs = poData.filter((po) => {
//     const matchesPONumber = searchPONumber === "" ||
//       (po.po_number || "").toLowerCase().includes(searchPONumber.toLowerCase());

//     const matchesVendor = searchVendor === "" ||
//       (po.vendor?.name || "").toLowerCase().includes(searchVendor.toLowerCase());

//     const matchesProject = searchProject === "" ||
//       (po.project || "").toLowerCase().includes(searchProject.toLowerCase());

//     const matchesStatus = searchStatus === "" ||
//       (po.overall_status || "").toLowerCase().includes(searchStatus.toLowerCase());

//     return matchesPONumber && matchesVendor && matchesProject && matchesStatus;
//   });

//   // Bulk delete POs
//   const handleBulkDelete = async () => {
//     if (selectedPOs.length === 0) {
//       toast.error("Please select at least one PO to delete.");
//       return;
//     }

//     if (!window.confirm(`Are you sure you want to delete ${selectedPOs.length} purchase order(s)?\n\nThis action cannot be undone and will permanently delete the selected POs.`)) {
//       return;
//     }

//     try {
//       setSubmitting(true);
//       let successCount = 0;
//       let errorCount = 0;

//       for (const poId of selectedPOs) {
//         try {
//           const response = await poApi.deletePO(poId);
//           if (response) {
//             successCount++;
//           } else {
//             errorCount++;
//           }
//         } catch (error) {
//           errorCount++;
//           console.error(`Error deleting PO ${poId}:`, error);
//         }
//       }

//       if (successCount > 0) {
//         toast.success(`Successfully deleted ${successCount} purchase order(s).`);
//       }
//       if (errorCount > 0) {
//         toast.error(`Failed to delete ${errorCount} purchase order(s).`);
//       }

//       loadAllPOs(); // Refresh the list
//       setSelectedPOs([]);
//       setSelectAll(false);
//     } catch (error) {
//       console.error("Error in bulk delete:", error);
//       toast.error("Failed to delete purchase orders.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const formatCurrency = (amount?: number) => {
//     return new Intl.NumberFormat("en-IN", {
//       style: "currency",
//       currency: "INR",
//     }).format(amount || 0);
//   };

//   if (loading) {
//     return (
//       <div className="p-6 bg-gray-50 min-h-screen">
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-gray-600 mt-4">Loading materials...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-0 bg-gray-50 min-h-screen">
//       {/* Header - Simple */}

//       {/* Delete Button (Appears when checkboxes are selected) */}
//       {selectedPOs.length > 0 && (
//         <div className="mb-6">
//           <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm p-4">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="bg-red-100 p-2 rounded-lg">
//                   <Trash2 className="w-5 h-5 text-red-600" />
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-800">
//                     {selectedPOs.length} purchase order{selectedPOs.length > 1 ? 's' : ''} selected
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Click delete to remove selected items
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={handleBulkDelete}
//                 disabled={submitting}
//                 className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {submitting ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Deleting...
//                   </>
//                 ) : (
//                   <>
//                     <Trash2 className="w-4 h-4" />
//                     Delete ({selectedPOs.length})
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Summary Cards */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6">
//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Total POs</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {poData.length}
//               </p>
//             </div>
//             <Package className="w-12 h-12 text-blue-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Pending POs</p>
//               <p className="text-3xl font-bold text-gray-800">
//                 {poData.filter((po) => po.overall_status === "pending").length}
//               </p>
//             </div>
//             <Clock className="w-12 h-12 text-gray-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Partial POs</p>
//               <p className="text-3xl font-bold text-yellow-600">
//                 {poData.filter((po) => po.overall_status === "partial").length}
//               </p>
//             </div>
//             <Truck className="w-12 h-12 text-yellow-500 opacity-20" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600 mb-1">Completed POs</p>
//               <p className="text-3xl font-bold text-green-600">
//                 {
//                   poData.filter((po) => po.overall_status === "completed")
//                     .length
//                 }
//               </p>
//             </div>
//             <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-200 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-left w-12">
//                   <div className="flex items-center">
//                     <button
//                       onClick={handleSelectAll}
//                       className="p-1 hover:bg-gray-300 rounded transition-colors"
//                     >
//                       {selectAll ? (
//                         <CheckSquare className="w-5 h-5 text-blue-600" />
//                       ) : (
//                         <Square className="w-5 h-5 text-gray-500" />
//                       )}
//                     </button>
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     PO Number
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search PO..."
//                     value={searchPONumber}
//                     onChange={(e) => setSearchPONumber(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Vendor
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search vendor..."
//                     value={searchVendor}
//                     onChange={(e) => setSearchVendor(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Project
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search project..."
//                     value={searchProject}
//                     onChange={(e) => setSearchProject(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Amount
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     PO Status
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Material Status
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search status..."
//                     value={searchStatus}
//                     onChange={(e) => setSearchStatus(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Payment Status
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredPOs.length === 0 ? (
//                 <tr>
//                   <td colSpan={8} className="px-6 py-12 text-center">
//                     <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                     <p className="text-gray-600 text-lg font-medium">No purchase orders found</p>
//                     <p className="text-gray-500 text-sm mt-2">
//                       Try adjusting your search
//                     </p>
//                   </td>
//                 </tr>
//               ) : (
//                 filteredPOs.map((po, index) => {
//                   const overallPercentage = calculatePercentage(
//                     po.total_received,
//                     po.total_ordered
//                   );
//                   const isSelected = selectedPOs.includes(po.id);

//                   return (
//                     <>
//                       {/* PO Summary Row */}
//                       <tr
//                         key={po.id}
//                         className={`hover:bg-gray-50 transition ${
//                           index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//                         } ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
//                       >
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => togglePOSelection(po.id)}
//                               className="p-1 hover:bg-gray-200 rounded transition-colors"
//                             >
//                               {isSelected ? (
//                                 <CheckSquare className="w-5 h-5 text-blue-600" />
//                               ) : (
//                                 <Square className="w-5 h-5 text-gray-400" />
//                               )}
//                             </button>
//                             <button
//                               onClick={() => togglePOExpand(po.id)}
//                               className="p-1 hover:bg-gray-200 rounded transition-colors"
//                             >
//                               {po.expanded ? (
//                                 <ChevronDown className="w-5 h-5 text-gray-600" />
//                               ) : (
//                                 <ChevronRight className="w-5 h-5 text-gray-600" />
//                               )}
//                             </button>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-3">
//                             <div className="bg-[#C62828] w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm">
//                               {po.po_number.charAt(0)}
//                             </div>
//                             <div>
//                               <span className="font-semibold text-gray-900">
//                                 {po.po_number}
//                               </span>
//                               <p className="text-xs text-gray-500">
//                                 {po.po_date}
//                               </p>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="flex items-center gap-2">
//                             <span className="text-gray-900">{po.vendor?.name || "--"}</span>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 font-medium text-gray-900">
//                           {po.project || "--"}
//                         </td>
//                         <td className="px-6 py-4 font-bold text-gray-900">
//                           {formatCurrency(Number(po.amount))}
//                         </td>
//                         <td className="px-6 py-4">
//                           <span
//                             className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                               po.po_status
//                             )}`}
//                           >
//                             {po.po_status?.toUpperCase()}
//                           </span>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <span
//                               className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                                 po.material_status
//                               )}`}
//                             >
//                               {po.material_status?.toUpperCase() || "PENDING"}
//                             </span>
//                             {po.total_ordered > 0 && (
//                               <div className="text-xs text-gray-600">
//                                 <div className="flex justify-between mb-1">
//                                   <span>Progress</span>
//                                   <span>{overallPercentage}%</span>
//                                 </div>
//                                 <div className="w-full bg-gray-200 rounded-full h-1">
//                                   <div
//                                     className="bg-blue-600 h-1 rounded-full"
//                                     style={{ width: `${overallPercentage}%` }}
//                                   />
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-6 py-4">
//                           <div className="space-y-1">
//                             <span
//                               className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                                 po.payment_status
//                               )}`}
//                             >
//                               {po.payment_status?.toUpperCase() || "PENDING"}
//                             </span>
//                             {Number(po.balance_amount) > 0 && (
//                               <p className="text-xs text-gray-600">
//                                 Balance: {formatCurrency(Number(po.balance_amount))}
//                               </p>
//                             )}
//                           </div>
//                         </td>
//                       </tr>

//                       {/* Expanded Items Row */}
//                       {po.expanded && po.materials.length > 0 && (
//                         <tr className="bg-gray-50">
//                           <td colSpan={10} className="p-0">
//                             <div className="px-6 py-4 border-t border-gray-200">
//                               <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
//                                 <FileText className="w-4 h-4" />
//                                 Items in PO {po.po_number}
//                               </h4>
//                               <div className="overflow-x-auto">
//                                 <table className="w-full bg-white rounded-lg border border-gray-200">
//                                   <thead className="bg-gray-100">
//                                     <tr>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Item
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         HSN Code
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Ordered
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Received
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Pending
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Progress
//                                       </th>
//                                       <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                                         Status
//                                       </th>
//                                     </tr>
//                                   </thead>
//                                   <tbody className="divide-y divide-gray-200">
//                                     {po.materials.map((material, idx) => {
//                                       const materialPercentage =
//                                         calculatePercentage(
//                                           material.quantity_received,
//                                           material.quantity_ordered
//                                         );

//                                       return (
//                                         <tr
//                                           key={material.id}
//                                           className={`hover:bg-gray-50 ${
//                                             idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
//                                           }`}
//                                         >
//                                           <td className="px-4 py-3">
//                                             <div className="font-medium text-gray-800">
//                                               {material.item_name || "Unknown"}
//                                             </div>
//                                             <div className="text-xs text-gray-500">
//                                               Unit: {material.unit || "N/A"}
//                                             </div>
//                                           </td>
//                                           <td className="px-4 py-3 text-gray-700">
//                                             {material.hsn_code || "-"}
//                                           </td>
//                                           <td className="px-4 py-3 font-medium text-gray-800">
//                                             {material.quantity_ordered}
//                                           </td>
//                                           <td className="px-4 py-3 font-medium text-green-600">
//                                             {material.quantity_received}
//                                           </td>
//                                           <td className="px-4 py-3 font-medium text-orange-600">
//                                             {material.quantity_pending > 0 ? (
//                                               <span className="flex items-center gap-1">
//                                                 <AlertTriangle className="w-3 h-3" />
//                                                 {material.quantity_pending}
//                                               </span>
//                                             ) : (
//                                               material.quantity_pending
//                                             )}
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             <div className="w-full bg-gray-200 rounded-full h-2">
//                                               <div
//                                                 className="bg-blue-600 h-2 rounded-full transition-all"
//                                                 style={{
//                                                   width: `${materialPercentage}%`,
//                                                 }}
//                                               />
//                                             </div>
//                                             <p className="text-xs text-gray-600 mt-1">
//                                               {materialPercentage}%
//                                             </p>
//                                           </td>
//                                           <td className="px-4 py-3">
//                                             <span
//                                               className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
//                                                 material.status
//                                               )}`}
//                                             >
//                                               {material.status?.toUpperCase() ||
//                                                 "PENDING"}
//                                             </span>
//                                           </td>
//                                         </tr>
//                                       );
//                                     })}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </div>
//                           </td>
//                         </tr>
//                       )}

//                       {/* Show message if no materials */}
//                       {po.expanded && po.materials.length === 0 && (
//                         <tr className="bg-gray-50">
//                           <td colSpan={10} className="p-0">
//                             <div className="px-6 py-8 border-t border-gray-200 text-center">
//                               <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//                               <p className="text-gray-600">
//                                 No materials found for this purchase order
//                               </p>
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Truck,
  FileText,
  ChevronDown,
  ChevronRight,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import poApi from "../lib/poApi";
import po_trackingApi from "../lib/po_tracking";
import vendorApi from "../lib/vendorApi";
import ItemsApi from "../lib/itemsApi";
import projectApi from "../lib/projectApi";

// Types
type PORef = {
  id: string;
  po_number?: string;
  vendors?: { name?: string };
  projects?: { name?: string };
};

type Material = {
  id: string;
  po_id: string;
  item_id?: string;
  item_description?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: "pending" | "partial" | "completed" | "cancelled";
  received_date?: string | null;
  received_by?: string | null;
  notes?: string | null;
  created_at?: string;
  purchase_orders?: PORef;
};

type POMaterial = {
  id: string;
  item_id?: string;
  item_name?: string;
  hsn_code?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: string;
  unit?: string;
  item?: any;
};

type POData = {
  id: string;
  po_number: string;
  vendor: {
    id: string;
    name: string;
  };
  project: string;
  amount: string;
  po_status: string;
  material_status: string;
  payment_status: string;
  balance_amount: string;
  po_date: string;
  vendor_id: string;
  purchase_order?: any;
  materials: POMaterial[];
  expanded: boolean;
  total_ordered: number;
  total_received: number;
  total_pending: number;
  overall_status: string;
};

export default function MaterialsEnhanced() {
  const [poData, setPoData] = useState<POData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Bulk selection
  const [selectedPOs, setSelectedPOs] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Column search states
  const [searchPONumber, setSearchPONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchAmount, setSearchAmount] = useState("");
  const [searchPOStatus, setSearchPOStatus] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
  const loadAllPOs = async () => {
    try {
      const posRes: any = await poApi.getPOs();
      const poMaterialTrackRes: any = await po_trackingApi.getTrackings();
      const vendorsRes: any = await vendorApi.getVendors();
      const itemsRes: any = await ItemsApi.getItems();
      const projectsData: any = await projectApi.getProjects();

      const poWithVendors = posRes.map((po: any) => {
        const vendorData = vendorsRes.find((v: any) => v.id === po.vendor_id);
        return { ...po, vendor: vendorData };
      });

      const idsSet = new Set(posRes.map((item: any) => item.id));
      const filteredPoMaterialTracking = poMaterialTrackRes.filter(
        (item: any) => idsSet.has(item.po_id),
      );

      // Group materials by PO
      const poMap = new Map<string, POData>();

      poWithVendors.forEach((po: any) => {
        const proData = Array.isArray(projectsData.data)
          ? projectsData.data
          : [];

        const project = proData.find(
          (project: any) => project.id === Number(po.project_id),
        );

        poMap.set(po.id, {
          id: po.id,
          po_number: po.po_number,
          vendor: po.vendor,
          project: project?.name || "--",
          amount: po.grand_total,
          po_status: po.status,
          material_status: po.material_status,
          payment_status: po.payment_status,
          balance_amount: po.balance_amount,
          po_date: new Date(po.created_at).toLocaleDateString(),
          vendor_id: po.vendor_id,
          purchase_order: po,
          materials: [],
          expanded: false,
          total_ordered: 0,
          total_received: 0,
          total_pending: 0,
          overall_status: "pending",
        });
      });

      filteredPoMaterialTracking.forEach((mt: any) => {
        const po = poMap.get(mt.po_id);
        if (po) {
          const itemData = itemsRes.find(
            (i: any) => i.id === Number(mt.item_id),
          );

          const material: POMaterial = {
            id: mt.id,
            item_id: mt.item_id,
            item_name: itemData?.item_name,
            hsn_code: itemData?.hsn_code,
            quantity_ordered: Number(mt.quantity_ordered || 0),
            quantity_received: Number(mt.quantity_received || 0),
            quantity_pending: Number(mt.quantity_pending || 0),
            status: mt.status || "pending",
            unit: itemData?.unit,
            item: itemData,
          };

          po.materials.push(material);

          // Update PO totals
          po.total_ordered += material.quantity_ordered;
          po.total_received += material.quantity_received;
          po.total_pending += material.quantity_pending;
        }
      });

      // Calculate overall status for each PO
      poMap.forEach((po) => {
        if (po.materials.length === 0) {
          po.overall_status = "pending";
        } else if (po.materials.every((m) => m.status === "completed")) {
          po.overall_status = "completed";
        } else if (
          po.materials.some(
            (m) => m.status === "partial" || m.status === "completed",
          )
        ) {
          po.overall_status = "partial";
        } else {
          po.overall_status = "pending";
        }
      });

      const poDataArray = Array.from(poMap.values());
      setPoData(poDataArray);
      setLoading(false);
      setSelectedPOs([]);
      setSelectAll(false);
    } catch (error) {
      toast.error("Something Went Wrong.");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllPOs();
  }, []);

  const togglePOExpand = (poId: string) => {
    setPoData((prev) =>
      prev.map((po) =>
        po.id === poId ? { ...po, expanded: !po.expanded } : po,
      ),
    );
  };

  const getStatusColor = (status?: string) => {
    const styles: Record<string, string> = {
      pending: "bg-red-100 text-red-800",
      partial: "bg-yellow-100 text-yellow-800",
      approved: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      authorize: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (status && styles[status]) || "bg-gray-100 text-gray-800";
  };

  const calculatePercentage = (received: number, ordered: number) => {
    return ordered > 0 ? Math.round((received * 100) / ordered) : 0;
  };

  // Handle PO selection
  const togglePOSelection = (poId: string) => {
    setSelectedPOs((prev) =>
      prev.includes(poId) ? prev.filter((id) => id !== poId) : [...prev, poId],
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedPOs([]);
    } else {
      setSelectedPOs(filteredPOs.map((po) => po.id));
    }
    setSelectAll(!selectAll);
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Filter function
  // Update the filter function
  const filteredPOs = poData.filter((po) => {
    const matchesPONumber =
      searchPONumber === "" ||
      (po.po_number || "").toLowerCase().includes(searchPONumber.toLowerCase());

    const matchesVendor =
      searchVendor === "" ||
      (po.vendor?.name || "")
        .toLowerCase()
        .includes(searchVendor.toLowerCase());

    const matchesProject =
      searchProject === "" ||
      (po.project || "").toLowerCase().includes(searchProject.toLowerCase());

    const matchesStatus =
      searchStatus === "" ||
      (po.overall_status || "")
        .toLowerCase()
        .includes(searchStatus.toLowerCase());

    // New filters
    const matchesAmount =
      searchAmount === "" ||
      formatCurrency(Number(po.amount))
        .toLowerCase()
        .includes(searchAmount.toLowerCase());

    const matchesPOStatus =
      searchPOStatus === "" ||
      (po.po_status || "").toLowerCase().includes(searchPOStatus.toLowerCase());

    const matchesPaymentStatus =
      searchPaymentStatus === "" ||
      (po.payment_status || "")
        .toLowerCase()
        .includes(searchPaymentStatus.toLowerCase());

    return (
      matchesPONumber &&
      matchesVendor &&
      matchesProject &&
      matchesStatus &&
      matchesAmount &&
      matchesPOStatus &&
      matchesPaymentStatus
    );
  });

  // Bulk delete POs
  const handleBulkDelete = async () => {
    if (selectedPOs.length === 0) {
      toast.error("Please select at least one PO to delete.");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedPOs.length} purchase order(s)?\n\nThis action cannot be undone and will permanently delete the selected POs.`,
      )
    ) {
      return;
    }

    try {
      setSubmitting(true);
      let successCount = 0;
      let errorCount = 0;

      for (const poId of selectedPOs) {
        try {
          const response = await poApi.deletePO(poId);
          if (response) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error deleting PO ${poId}:`, error);
        }
      }

      if (successCount > 0) {
        toast.success(
          `Successfully deleted ${successCount} purchase order(s).`,
        );
      }
      if (errorCount > 0) {
        toast.error(`Failed to delete ${errorCount} purchase order(s).`);
      }

      loadAllPOs(); // Refresh the list
      setSelectedPOs([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Failed to delete purchase orders.");
    } finally {
      setSubmitting(false);
    }
  };

  

  if (loading) {
    return (
      <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 px-0 md:p-0 -mt-3.5 bg-gray-50 ">
      {/* Delete Button (Appears when checkboxes are selected) */}
      {selectedPOs.length > 0 && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm p-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {selectedPOs.length} purchase order
                    {selectedPOs.length > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-gray-600">
                    Click delete to remove selected items
                  </p>
                </div>
              </div>
              <button
                onClick={handleBulkDelete}
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    Delete ({selectedPOs.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards - Responsive */}
      <div className="sticky top-20 z-10  mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 mb-2 mx-0">
        {/* Total POs */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Total PO</p>
            <p className="text-sm font-semibold text-gray-800">
              {poData.length}
            </p>
          </div>
          <Package className="w-5 h-5 text-blue-500/30" />
        </div>

        {/* Pending */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Pending</p>
            <p className="text-sm font-semibold text-gray-800">
              {poData.filter((po) => po.overall_status === "pending").length}
            </p>
          </div>
          <Clock className="w-5 h-5 text-gray-400/40" />
        </div>

        {/* Partial */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Partial</p>
            <p className="text-sm font-semibold text-yellow-600">
              {poData.filter((po) => po.overall_status === "partial").length}
            </p>
          </div>
          <Truck className="w-5 h-5 text-yellow-500/40" />
        </div>

        {/* Completed */}
        <div className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-gray-500 leading-none">Completed</p>
            <p className="text-sm font-semibold text-green-600">
              {poData.filter((po) => po.overall_status === "completed").length}
            </p>
          </div>
          <CheckCircle className="w-5 h-5 text-green-500/40" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl px-0 shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-y-auto max-h-[calc(100vh-230px)] md:max-h-[calc(100vh-160px)] ">
          <table className=" w-full min-w-[800px]">
<thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">                {/* Header Row */}
              <tr>
                <th className="px-3 py-2 text-center w-6">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleSelectAll}
                      className="p-0.5 hover:bg-gray-300 rounded transition-colors"
                    >
                      {selectAll ? (
                        <CheckSquare className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />
                      ) : (
                        <Square className="w-3 h-3 md:w-4 md:h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PO Number
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    PO Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Material Status
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Status
                  </div>
                </th>
              </tr>

              {/* Search Row - Compact height */}
              {/* Search Row - Compact height */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search PO..."
                    value={searchPONumber}
                    onChange={(e) => setSearchPONumber(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search vendor..."
                    value={searchVendor}
                    onChange={(e) => setSearchVendor(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search project..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search amount..."
                    value={searchAmount}
                    onChange={(e) => setSearchAmount(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search PO status..."
                    value={searchPOStatus}
                    onChange={(e) => setSearchPOStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search payment..."
                    value={searchPaymentStatus}
                    onChange={(e) => setSearchPaymentStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPOs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm font-medium">
                      No purchase orders found
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Try adjusting your search
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPOs.map((po, index) => {
                  const overallPercentage = calculatePercentage(
                    po.total_received,
                    po.total_ordered,
                  );
                  const isSelected = selectedPOs.includes(po.id);

                  return (
                    <React.Fragment key={po.id}>
                      {/* PO Summary Row */}
                      <tr
                        className={`hover:bg-gray-50 transition ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        } ${isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
                      >
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-1 justify-center">
                            <button
                              onClick={() => togglePOSelection(po.id)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Square className="w-3 h-3 text-gray-400" />
                              )}
                            </button>
                            <button
                              onClick={() => togglePOExpand(po.id)}
                              className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                            >
                              {po.expanded ? (
                                <ChevronDown className="w-3 h-3 text-gray-600" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-gray-600" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <div className="bg-[#C62828] w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {po.po_number.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-gray-900 text-xs truncate block max-w-[120px]">
                                {po.po_number}
                              </span>
                              <p className="text-[10px] text-gray-500 whitespace-nowrap">
                                {po.po_date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="text-gray-900 text-xs truncate block max-w-[120px]"
                              title={po.vendor?.name || "--"}
                            >
                              {po.vendor?.name || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="min-w-0">
                            <span
                              className="font-medium text-gray-900 text-xs truncate block max-w-[120px]"
                              title={po.project || "--"}
                            >
                              {po.project || "--"}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="font-bold text-gray-900 text-xs whitespace-nowrap">
                            {formatCurrency(Number(po.amount))}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                              po.po_status,
                            )} whitespace-nowrap`}
                          >
                            {po.po_status?.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-0.5 min-w-0">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                po.material_status,
                              )} truncate`}
                            >
                              {po.material_status?.toUpperCase() || "PENDING"}
                            </span>
                            {po.total_ordered > 0 && (
                              <div className="text-[10px] text-gray-600">
                                <div className="flex justify-between mb-0.5">
                                  <span>Progress</span>
                                  <span>{overallPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                  <div
                                    className="bg-blue-600 h-1 rounded-full"
                                    style={{ width: `${overallPercentage}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-col items-center gap-0.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                  po.payment_status,
                                )} truncate`}
                              >
                                {po.payment_status?.toUpperCase() || "PENDING"}
                              </span>

                              {Number(po.balance_amount) > 0 && (
                                <span
                                  className="text-[10px] text-gray-600 whitespace-nowrap"
                                  title={`Balance: ${formatCurrency(Number(po.balance_amount))}`}
                                >
                                  Bal:{" "}
                                  {formatCurrency(
                                    Number(po.balance_amount),
                                  ).replace("₹", "₹ ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Items Row */}
                      {po.expanded && po.materials.length > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="p-0">
                            <div className="px-3 py-2 border-t border-gray-200">
                              <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                Items in PO {po.po_number}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="w-full bg-white rounded-lg border border-gray-200 min-w-[600px]">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Item
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        HSN Code
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Ordered
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Received
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Pending
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Progress
                                      </th>
                                      <th className="text-left px-2 py-1.5 text-[10px] md:text-xs font-medium text-gray-700">
                                        Status
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {po.materials.map((material, idx) => {
                                      const materialPercentage =
                                        calculatePercentage(
                                          material.quantity_received,
                                          material.quantity_ordered,
                                        );

                                      return (
                                        <tr
                                          key={material.id}
                                          className={`hover:bg-gray-50 ${
                                            idx % 2 === 0
                                              ? "bg-white"
                                              : "bg-gray-50/50"
                                          }`}
                                        >
                                          <td className="px-2 py-1.5">
                                            <div
                                              className="font-medium text-gray-800 text-xs truncate max-w-[150px]"
                                              title={
                                                material.item_name || "Unknown"
                                              }
                                            >
                                              {material.item_name || "Unknown"}
                                            </div>
                                            <div className="text-[10px] text-gray-500">
                                              Unit: {material.unit || "N/A"}
                                            </div>
                                          </td>
                                          <td className="px-2 py-1.5 text-gray-700 text-xs">
                                            {material.hsn_code || "-"}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-gray-800 text-xs">
                                            {material.quantity_ordered}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-green-600 text-xs">
                                            {material.quantity_received}
                                          </td>
                                          <td className="px-2 py-1.5 font-medium text-orange-600 text-xs">
                                            {material.quantity_pending > 0 ? (
                                              <span className="flex items-center gap-0.5">
                                                <AlertTriangle className="w-2.5 h-2.5" />
                                                {material.quantity_pending}
                                              </span>
                                            ) : (
                                              material.quantity_pending
                                            )}
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                              <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                                style={{
                                                  width: `${materialPercentage}%`,
                                                }}
                                              />
                                            </div>
                                            <p className="text-[10px] text-gray-600 mt-0.5">
                                              {materialPercentage}%
                                            </p>
                                          </td>
                                          <td className="px-2 py-1.5">
                                            <span
                                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                                                material.status,
                                              )} whitespace-nowrap`}
                                            >
                                              {material.status?.toUpperCase() ||
                                                "PENDING"}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {/* Show message if no materials */}
                      {po.expanded && po.materials.length === 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={10} className="p-0">
                            <div className="px-3 py-4 border-t border-gray-200 text-center">
                              <Package className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-600 text-xs">
                                No materials found for this purchase order
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
