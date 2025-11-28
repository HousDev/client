// // src/components/PurchaseOrdersPro.tsx
// import React, { useEffect, useState } from "react";
// import {
//   Plus,
//   FileText,
//   Calendar,
//   Search,
//   X,
//   Trash2,
//   Package,
// } from "lucide-react";
// import { useAuth } from "../contexts/AuthContext";
// import poApi from "../lib/poApi";

// interface POItem {
//   id: string;
//   item_id: string;
//   item_code: string;
//   item_name: string;
//   description: string;
//   hsn_code: string;
//   quantity: number;
//   unit: string;
//   rate: number;
//   amount: number;
//   gst_rate: number;
//   gst_amount: number;
// }

// interface POFormData {
//   po_number: string;
//   vendor_id: string;
//   project_id: string;
//   po_type_id: string;
//   po_date: string;
//   delivery_date: string;
//   is_interstate: boolean;
//   items: POItem[];
//   subtotal: number;
//   discount_percentage: number;
//   discount_amount: number;
//   taxable_amount: number;
//   cgst_amount: number;
//   sgst_amount: number;
//   igst_amount: number;
//   total_gst_amount: number;
//   grand_total: number;
//   payment_terms_id: string;
//   advance_amount: number;
//   selected_terms_ids: string[];
//   terms_and_conditions: string;
//   notes: string;
// }

// export default function PurchaseOrdersPro(): JSX.Element {
//   const { user } = useAuth();
//   const [pos, setPOs] = useState<any[]>([]);
//   const [vendors, setVendors] = useState<any[]>([]);
//   const [projects, setProjects] = useState<any[]>([]);
//   const [poTypes, setPOTypes] = useState<any[]>([]);
//   const [items, setItems] = useState<any[]>([]);
//   const [terms, setTerms] = useState<any[]>([]);
//   const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedPO, setSelectedPO] = useState<any>(null);
//   const [showItemSelector, setShowItemSelector] = useState(false);

//   const [formData, setFormData] = useState<POFormData>({
//     po_number: "",
//     vendor_id: "",
//     project_id: "",
//     po_type_id: "",
//     po_date: new Date().toISOString().split("T")[0],
//     delivery_date: "",
//     is_interstate: false,
//     items: [],
//     subtotal: 0,
//     discount_percentage: 0,
//     discount_amount: 0,
//     taxable_amount: 0,
//     cgst_amount: 0,
//     sgst_amount: 0,
//     igst_amount: 0,
//     total_gst_amount: 0,
//     grand_total: 0,
//     payment_terms_id: "",
//     advance_amount: 0,
//     selected_terms_ids: [],
//     terms_and_conditions: "",
//     notes: "",
//   });

//   // fallback mock data only used if backend fails
//   const defaultVendors = [
//     { id: "v_1", name: "Acme Supplies", office_state: "KA", is_active: true },
//     { id: "v_2", name: "Builder Co", office_state: "MH", is_active: true },
//   ];
//   const defaultProjects = [
//     { id: "p_1", name: "Site A" },
//     { id: "p_2", name: "Site B" },
//   ];
//   const defaultPOTypes = [
//     { id: "t_1", name: "Standard" },
//     { id: "t_2", name: "Urgent" },
//   ];
//   const defaultItems = [
//     {
//       id: "itm_1",
//       item_code: "CEM001",
//       item_name: "Cement Bag",
//       standard_rate: 350,
//       unit: "Bag",
//       gst_rate: 18,
//       hsn_code: "2523",
//       description: "Portland cement",
//       category: "material",
//     },
//     {
//       id: "itm_2",
//       item_code: "STL001",
//       item_name: "Steel Rod",
//       standard_rate: 5000,
//       unit: "Ton",
//       gst_rate: 18,
//       hsn_code: "7207",
//       description: "Fe500",
//       category: "material",
//     },
//   ];
//   const defaultTerms = [
//     { id: "term_1", title: "Payment on delivery", content: "Payment on delivery", is_active: true },
//   ];
//   const defaultPaymentTerms = [
//     { id: "pay_1", name: "Immediate", advance_percentage: 0 },
//     { id: "pay_2", name: "10% advance", advance_percentage: 10 },
//   ];

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadPOs(),
//         loadVendors(),
//         loadProjects(),
//         loadPOTypes(),
//         loadItems(),
//         loadTerms(),
//         loadPaymentTerms(),
//       ]);
//     } catch (err) {
//       console.error("loadData error", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadPOs = async () => {
//     try {
//       const data = await poApi.getPOs();
//       setPOs(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadPOs failed, fallback to empty", err);
//       setPOs([]);
//     }
//   };

//   const loadVendors = async () => {
//     try {
//       const data = await poApi.getVendors(true);
//       setVendors(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadVendors failed, fallback", err);
//       setVendors(defaultVendors);
//     }
//   };

//   const loadProjects = async () => {
//     try {
//       const data = await poApi.getProjects();
//       setProjects(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadProjects failed, fallback", err);
//       setProjects(defaultProjects);
//     }
//   };

//   const loadPOTypes = async () => {
//     try {
//       const data = await poApi.getPOTypes();
//       setPOTypes(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadPOTypes failed, fallback", err);
//       setPOTypes(defaultPOTypes);
//     }
//   };

//   const loadItems = async () => {
//     try {
//       const data = await poApi.getItems();
//       setItems(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadItems failed, fallback", err);
//       setItems(defaultItems);
//     }
//   };

//   const loadTerms = async () => {
//     try {
//       const data = await poApi.getTerms();
//       setTerms(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadTerms failed, fallback", err);
//       setTerms(defaultTerms);
//     }
//   };

//   const loadPaymentTerms = async () => {
//     try {
//       const data = await poApi.getPaymentTerms();
//       setPaymentTerms(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.warn("loadPaymentTerms failed, fallback", err);
//       setPaymentTerms(defaultPaymentTerms);
//     }
//   };

//   // --- Items helpers ---
//   const addItemFromMaster = (item: any) => {
//     const newItem: POItem = {
//       id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
//       item_id: item.id,
//       item_code: item.item_code || "",
//       item_name: item.item_name || "",
//       description: item.description || "",
//       hsn_code: item.hsn_code || "",
//       quantity: 1,
//       unit: item.unit || "",
//       rate: item.standard_rate || 0,
//       amount: item.standard_rate || 0,
//       gst_rate: item.gst_rate || 0,
//       gst_amount: 0,
//     };

//     const newItems = [...formData.items, newItem];
//     setFormData({ ...formData, items: newItems });
//     calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
//     setShowItemSelector(false);
//   };

//   const handleItemChange = (index: number, field: keyof POItem, value: any) => {
//     const newItems = [...formData.items];
//     newItems[index] = { ...newItems[index], [field]: value };

//     if (field === "quantity" || field === "rate") {
//       newItems[index].amount = newItems[index].quantity * newItems[index].rate;
//     }

//     setFormData({ ...formData, items: newItems });
//     calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
//   };

//   const removeItem = (index: number) => {
//     const newItems = formData.items.filter((_, i) => i !== index);
//     setFormData({ ...formData, items: newItems });
//     calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
//   };

//   const calculateTotals = (itemsList: POItem[], discountPercentage: number, isInterstate: boolean) => {
//     const subtotal = itemsList.reduce((sum, item) => sum + (item.amount || 0), 0);
//     const discountAmount = (subtotal * (discountPercentage || 0)) / 100;
//     const taxableAmount = subtotal - discountAmount;

//     let cgstAmount = 0;
//     let sgstAmount = 0;
//     let igstAmount = 0;

//     const newItems = itemsList.map((item) => {
//       const itemTaxable = item.amount - (item.amount * (discountPercentage || 0)) / 100;
//       const itemGst = (itemTaxable * (item.gst_rate || 0)) / 100;
//       const gstAmount = itemGst;
//       if (isInterstate) {
//         igstAmount += gstAmount;
//       } else {
//         cgstAmount += gstAmount / 2;
//         sgstAmount += gstAmount / 2;
//       }
//       return { ...item, gst_amount: gstAmount };
//     });

//     const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
//     const grandTotal = taxableAmount + totalGstAmount;

//     setFormData((prev) => ({
//       ...prev,
//       items: newItems,
//       subtotal,
//       discount_amount: discountAmount,
//       taxable_amount: taxableAmount,
//       cgst_amount: cgstAmount,
//       sgst_amount: sgstAmount,
//       igst_amount: igstAmount,
//       total_gst_amount: totalGstAmount,
//       grand_total: grandTotal,
//     }));
//   };

//   const handleDiscountChange = (percentage: number) => {
//     setFormData({ ...formData, discount_percentage: percentage });
//     calculateTotals(formData.items, percentage, formData.is_interstate);
//   };

//   const handleInterstateChange = (isInterstate: boolean) => {
//     setFormData({ ...formData, is_interstate: isInterstate });
//     calculateTotals(formData.items, formData.discount_percentage, isInterstate);
//   };

//   const toggleTerm = (termId: string) => {
//     const currentTerms = [...formData.selected_terms_ids];
//     const idx = currentTerms.indexOf(termId);
//     if (idx > -1) currentTerms.splice(idx, 1);
//     else currentTerms.push(termId);
//     setFormData({ ...formData, selected_terms_ids: currentTerms });
//   };

//   const handlePaymentTermsChange = (paymentTermsId: string) => {
//     const selectedPaymentTerms = paymentTerms.find((pt) => pt.id === paymentTermsId);
//     const advanceAmount =
//       selectedPaymentTerms && formData.grand_total
//         ? (formData.grand_total * (selectedPaymentTerms.advance_percentage || 0)) / 100
//         : 0;
//     setFormData({ ...formData, payment_terms_id: paymentTermsId, advance_amount: advanceAmount });
//   };

//   // server-side sequence with fallback
//   const generatePONumber = async () => {
//     try {
//       const res = await poApi.nextSequence();
//       if (res && res.po_number) return res.po_number;
//     } catch (err) {
//       console.warn("generatePONumber remote failed, falling back to client seq", err);
//     }
//     const now = new Date();
//     const year = now.getFullYear();
//     const month = now.getMonth() + 1;
//     const seq = Math.floor(Math.random() * 9000) + 1;
//     return `PO/${year}/${String(month).padStart(2, "0")}/${String(seq).padStart(4, "0")}`;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const poNumber = await generatePONumber();

//       const payload = {
//         po_number: poNumber,
//         vendor_id: formData.vendor_id,
//         project_id: formData.project_id,
//         po_type_id: formData.po_type_id,
//         po_date: formData.po_date,
//         delivery_date: formData.delivery_date,
//         is_interstate: formData.is_interstate,
//         items: formData.items,
//         subtotal: formData.subtotal,
//         discount_percentage: formData.discount_percentage,
//         discount_amount: formData.discount_amount,
//         cgst_amount: formData.cgst_amount,
//         sgst_amount: formData.sgst_amount,
//         igst_amount: formData.igst_amount,
//         total_gst_amount: formData.total_gst_amount,
//         grand_total: formData.grand_total,
//         payment_terms_id: formData.payment_terms_id,
//         advance_amount: formData.advance_amount,
//         total_paid: 0,
//         balance_amount: formData.grand_total,
//         selected_terms_ids: formData.selected_terms_ids,
//         terms_and_conditions: formData.terms_and_conditions,
//         notes: formData.notes,
//         status: "draft",
//         material_status: "pending",
//         payment_status: "pending",
//         created_by: user?.id, // backend should coerce if necessary
//       };

//       const created = await poApi.createPO(payload);

//       if (created && created.id && formData.items.length) {
//         const trackingRecords = formData.items.map((item) => ({
//           po_id: created.id,
//           item_id: item.item_id,
//           item_description: item.item_name,
//           quantity_ordered: item.quantity,
//           quantity_received: 0,
//           quantity_pending: item.quantity,
//           status: "pending",
//         }));
//         try {
//           await poApi.createTracking(trackingRecords);
//         } catch (err) {
//           console.warn("tracking creation failed", err);
//         }

//         if (formData.advance_amount > 0) {
//           try {
//             await poApi.createPayment({
//               po_id: created.id,
//               payment_type: "advance",
//               amount: formData.advance_amount,
//               due_date: formData.po_date,
//               status: "pending",
//               created_by: user?.id,
//             });
//           } catch (err) {
//             console.warn("advance payment creation failed", err);
//           }
//         }
//       }

//       alert("Purchase Order created successfully!");
//       setShowModal(false);
//       resetForm();
//       loadPOs();
//     } catch (err) {
//       console.error("Error creating PO:", err);
//       alert("Error creating purchase order");
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       po_number: "",
//       vendor_id: "",
//       project_id: "",
//       po_type_id: "",
//       po_date: new Date().toISOString().split("T")[0],
//       delivery_date: "",
//       is_interstate: false,
//       items: [],
//       subtotal: 0,
//       discount_percentage: 0,
//       discount_amount: 0,
//       taxable_amount: 0,
//       cgst_amount: 0,
//       sgst_amount: 0,
//       igst_amount: 0,
//       total_gst_amount: 0,
//       grand_total: 0,
//       payment_terms_id: "",
//       advance_amount: 0,
//       selected_terms_ids: [],
//       terms_and_conditions: "",
//       notes: "",
//     });
//   };

//   // Filtering (supports vendor_name flat or nested vendors object)
//   const filteredPOs = pos.filter((po) => {
//     const vendorName = (po.vendor_name || po.vendors?.name || "").toString().toLowerCase();
//     return (
//       (po.po_number || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
//       vendorName.includes(searchTerm.toLowerCase())
//     );
//   });

//   const getVendorDisplayName = (po: any) => {
//     return po.vendor_name || (po.vendors && po.vendors.name) || "—";
//   };

//   const getStatusColor = (status: string) => {
//     const styles: Record<string, string> = {
//       draft: "bg-gray-100 text-gray-700",
//       pending_approval: "bg-yellow-100 text-yellow-700",
//       approved: "bg-green-100 text-green-700",
//       rejected: "bg-red-100 text-red-700",
//       completed: "bg-blue-100 text-blue-700",
//     };
//     return styles[status] || "bg-gray-100 text-gray-700";
//   };

//   const getMaterialStatusColor = (status: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-gray-100 text-gray-700",
//       partial: "bg-yellow-100 text-yellow-700",
//       completed: "bg-green-100 text-green-700",
//     };
//     return styles[status] || "bg-gray-100 text-gray-700";
//   };

//   const getPaymentStatusColor = (status: string) => {
//     const styles: Record<string, string> = {
//       pending: "bg-orange-100 text-orange-700",
//       partial: "bg-yellow-100 text-yellow-700",
//       paid: "bg-green-100 text-green-700",
//     };
//     return styles[status] || "bg-gray-100 text-gray-700";
//   };

//   const formatCurrency = (amount: number) =>
//     new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading purchase orders...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Purchase Orders Pro</h1>
//           <p className="text-gray-600 mt-1">GST, Material Tracking, Payment Management</p>
//         </div>
//         <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
//           <Plus className="w-5 h-5" />
//           Create PO
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input type="text" placeholder="Search by PO number or vendor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Material</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredPOs.map((po) => (
//                 <tr key={po.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedPO(po)}>
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <FileText className="w-4 h-4 text-blue-600" />
//                       <span className="font-medium text-gray-800">{po.po_number}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">{getVendorDisplayName(po)}</td>
//                   <td className="px-6 py-4 text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Calendar className="w-4 h-4 text-gray-400" />
//                       {po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(po.grand_total)}</td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>{String(po.status).replace("_", " ").toUpperCase()}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMaterialStatusColor(po.material_status)}`}>{String(po.material_status).toUpperCase()}</span>
//                   </td>
//                   <td className="px-6 py-4">
//                     <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.payment_status)}`}>{String(po.payment_status).toUpperCase()}</span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredPOs.length === 0 && (
//           <div className="text-center py-12">
//             <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchase orders</h3>
//             <p className="text-gray-600">Click "Create PO" to create your first purchase order</p>
//           </div>
//         )}
//       </div>

//       {/* Create Modal (full form) */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
//               <h2 className="text-2xl font-bold text-white">Create Purchase Order</h2>
//               <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
//               {/* Basic Details */}
//               <div className="mb-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Vendor <span className="text-red-500">*</span></label>
//                     <select value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
//                       <option value="">Select Vendor</option>
//                       {vendors.map((vendor) => (
//                         <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
//                     <select value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
//                       <option value="">Select Project</option>
//                       {projects.map((project) => (
//                         <option key={project.id} value={project.id}>{project.name}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">PO Type <span className="text-red-500">*</span></label>
//                     <select value={formData.po_type_id} onChange={(e) => setFormData({ ...formData, po_type_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
//                       <option value="">Select Type</option>
//                       {poTypes.map((type) => (
//                         <option key={type.id} value={type.id}>{type.name}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">PO Date <span className="text-red-500">*</span></label>
//                     <input type="date" value={formData.po_date} onChange={(e) => setFormData({ ...formData, po_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
//                     <input type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
//                   </div>

//                   <div className="flex items-center pt-8">
//                     <input type="checkbox" id="interstate" checked={formData.is_interstate} onChange={(e) => handleInterstateChange(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
//                     <label htmlFor="interstate" className="ml-2 text-sm font-medium text-gray-700">Interstate Supply (IGST)</label>
//                   </div>
//                 </div>
//               </div>

//               {/* Items */}
//               <div className="mb-6">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-semibold text-gray-800">Items</h3>
//                   <button type="button" onClick={() => setShowItemSelector(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2">
//                     <Plus className="w-4 h-4" /> Add Item from Master
//                   </button>
//                 </div>

//                 {formData.items.length === 0 ? (
//                   <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                     <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                     <p className="text-gray-600">No items added yet</p>
//                     <p className="text-sm text-gray-500 mt-1">Click "Add Item from Master" to start</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-3">
//                     {formData.items.map((item, index) => (
//                       <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                         <div className="grid grid-cols-12 gap-3 items-start">
//                           <div className="col-span-3">
//                             <label className="text-xs text-gray-600">Item</label>
//                             <p className="font-medium text-gray-800">{item.item_name}</p>
//                             <p className="text-xs text-gray-500">{item.item_code}</p>
//                           </div>
//                           <div className="col-span-2">
//                             <label className="text-xs text-gray-600">HSN</label>
//                             <p className="text-sm text-gray-700">{item.hsn_code}</p>
//                           </div>
//                           <div className="col-span-1">
//                             <label className="text-xs text-gray-600">Qty</label>
//                             <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="0" step="0.01" />
//                           </div>
//                           <div className="col-span-1">
//                             <label className="text-xs text-gray-600">Unit</label>
//                             <p className="text-sm text-gray-700">{item.unit}</p>
//                           </div>
//                           <div className="col-span-2">
//                             <label className="text-xs text-gray-600">Rate</label>
//                             <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="0" step="0.01" />
//                           </div>
//                           <div className="col-span-2">
//                             <label className="text-xs text-gray-600">Amount</label>
//                             <p className="font-medium text-gray-800">{formatCurrency(item.amount)}</p>
//                             <p className="text-xs text-gray-500">GST: {item.gst_rate}%</p>
//                           </div>
//                           <div className="col-span-1 flex justify-end pt-5">
//                             <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
//                               <Trash2 className="w-4 h-4" />
//                             </button>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* calculation summary */}
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//                 <div className="col-span-2"></div>
//                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//                   <div className="flex justify-between text-sm text-gray-600"><div>Subtotal</div><div>{formatCurrency(formData.subtotal)}</div></div>
//                   <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Discount ({formData.discount_percentage}%)</div><div>{formatCurrency(formData.discount_amount)}</div></div>
//                   <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Taxable</div><div>{formatCurrency(formData.taxable_amount)}</div></div>
//                   <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Total GST</div><div>{formatCurrency(formData.total_gst_amount)}</div></div>
//                   <div className="flex justify-between text-lg font-semibold text-gray-800 mt-3"><div>Grand Total</div><div>{formatCurrency(formData.grand_total)}</div></div>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
//                 <button type="submit" disabled={formData.items.length === 0} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
//                   Create Purchase Order
//                 </button>
//                 <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Item selector */}
//       {showItemSelector && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
//               <h3 className="text-xl font-bold text-white">Select Item from Master</h3>
//               <button onClick={() => setShowItemSelector(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"><X className="w-5 h-5" /></button>
//             </div>
//             <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
//               <div className="grid grid-cols-1 gap-3">
//                 {items.map((item) => (
//                   <div key={item.id} onClick={() => addItemFromMaster(item)} className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <p className="font-medium text-gray-800">{item.item_name}</p>
//                         <p className="text-sm text-gray-600">{item.item_code} | HSN: {item.hsn_code}</p>
//                         <p className="text-xs text-gray-500 mt-1">{item.description}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="font-semibold text-blue-600">{formatCurrency(item.standard_rate)}</p>
//                         <p className="text-xs text-gray-600">per {item.unit}</p>
//                         <p className="text-xs text-gray-500">GST: {item.gst_rate}%</p>
//                       </div>
//                     </div>
//                     <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${item.category === "material" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
//                       {String(item.category).toUpperCase()}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/PurchaseOrdersPro.tsx
import React, { useEffect, useState } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Search,
  X,
  Trash2,
  Package,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import poApi from "../lib/poApi";
import poTypeApi from "../lib/poTypeApi";

interface POItem {
  id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  gst_rate: number;
  gst_amount: number;
}

interface POFormData {
  po_number: string;
  vendor_id: string;
  project_id: string;
  po_type_id: string;
  po_date: string;
  delivery_date: string;
  is_interstate: boolean;
  items: POItem[];
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst_amount: number;
  grand_total: number;
  payment_terms_id: string;
  advance_amount: number;
  selected_terms_ids: string[];
  terms_and_conditions: string;
  notes: string;
}

export default function PurchaseOrdersPro(): JSX.Element {
  const { user } = useAuth();
  const [pos, setPOs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [poTypes, setPOTypes] = useState<any[]>([]);
  const [poTypesLoading, setPOTypesLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const [formData, setFormData] = useState<POFormData>({
    po_number: "",
    vendor_id: "",
    project_id: "",
    po_type_id: "",
    po_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    is_interstate: false,
    items: [],
    subtotal: 0,
    discount_percentage: 0,
    discount_amount: 0,
    taxable_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    total_gst_amount: 0,
    grand_total: 0,
    payment_terms_id: "",
    advance_amount: 0,
    selected_terms_ids: [],
    terms_and_conditions: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // reload PO types when project selection changes (optional)
  useEffect(() => {
    loadPOTypes(formData.project_id || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.project_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPOs(),
        loadVendors(),
        loadProjects(),
        loadPOTypes(),
        loadItems(),
        loadTerms(),
        loadPaymentTerms(),
      ]);
    } catch (err) {
      console.error("loadData error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPOs = async () => {
    try {
      const data = await poApi.getPOs();
      setPOs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPOs failed, fallback to empty", err);
      setPOs([]);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await poApi.getVendors(true);
      setVendors(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadVendors failed, fallback to empty", err);
      setVendors([]);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await poApi.getProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadProjects failed, fallback to empty", err);
      setProjects([]);
    }
  };

  const loadPOTypes = async (projectId?: string) => {
    setPOTypesLoading(true);
    try {
      // If you later support project-scoped types, pass projectId to poTypeApi
      const data = await poTypeApi.getPOTypes();
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      setPOTypes(list);
    } catch (err) {
      console.warn("loadPOTypes failed, fallback to empty", err);
      setPOTypes([]);
    } finally {
      setPOTypesLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await poApi.getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadItems failed, fallback to empty", err);
      setItems([]);
    }
  };

  const loadTerms = async () => {
    try {
      const data = await poApi.getTerms();
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadTerms failed, fallback to empty", err);
      setTerms([]);
    }
  };

  const loadPaymentTerms = async () => {
    try {
      const data = await poApi.getPaymentTerms();
      setPaymentTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPaymentTerms failed, fallback to empty", err);
      setPaymentTerms([]);
    }
  };

  // --- Items helpers ---
  const addItemFromMaster = (item: any) => {
    const newItem: POItem = {
      id: (crypto as any).randomUUID ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2, 9),
      item_id: item.id,
      item_code: item.item_code || "",
      item_name: item.item_name || "",
      description: item.description || "",
      hsn_code: item.hsn_code || "",
      quantity: 1,
      unit: item.unit || "",
      rate: item.standard_rate || 0,
      amount: item.standard_rate || 0,
      gst_rate: item.gst_rate || 0,
      gst_amount: 0,
    };

    const newItems = [...formData.items, newItem];
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
    setShowItemSelector(false);
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      newItems[index].amount = newItems[index].quantity * newItems[index].rate;
    }

    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.discount_percentage, formData.is_interstate);
  };

  const calculateTotals = (itemsList: POItem[], discountPercentage: number, isInterstate: boolean) => {
    const subtotal = itemsList.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = (subtotal * (discountPercentage || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    const newItems = itemsList.map((item) => {
      const itemTaxable = item.amount - (item.amount * (discountPercentage || 0)) / 100;
      const itemGst = (itemTaxable * (item.gst_rate || 0)) / 100;
      const gstAmount = itemGst;
      if (isInterstate) {
        igstAmount += gstAmount;
      } else {
        cgstAmount += gstAmount / 2;
        sgstAmount += gstAmount / 2;
      }
      return { ...item, gst_amount: gstAmount };
    });

    const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = taxableAmount + totalGstAmount;

    setFormData((prev) => ({
      ...prev,
      items: newItems,
      subtotal,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      total_gst_amount: totalGstAmount,
      grand_total: grandTotal,
    }));
  };

  const handleDiscountChange = (percentage: number) => {
    setFormData({ ...formData, discount_percentage: percentage });
    calculateTotals(formData.items, percentage, formData.is_interstate);
  };

  const handleInterstateChange = (isInterstate: boolean) => {
    setFormData({ ...formData, is_interstate: isInterstate });
    calculateTotals(formData.items, formData.discount_percentage, isInterstate);
  };

  const toggleTerm = (termId: string) => {
    const currentTerms = [...formData.selected_terms_ids];
    const idx = currentTerms.indexOf(termId);
    if (idx > -1) currentTerms.splice(idx, 1);
    else currentTerms.push(termId);
    setFormData({ ...formData, selected_terms_ids: currentTerms });
  };

  const handlePaymentTermsChange = (paymentTermsId: string) => {
    const selectedPaymentTerms = paymentTerms.find((pt) => pt.id === paymentTermsId);
    const advanceAmount =
      selectedPaymentTerms && formData.grand_total
        ? (formData.grand_total * (selectedPaymentTerms.advance_percentage || 0)) / 100
        : 0;
    setFormData({ ...formData, payment_terms_id: paymentTermsId, advance_amount: advanceAmount });
  };

  // server-side sequence with fallback
  const generatePONumber = async () => {
    try {
      const res = await poApi.nextSequence();
      if (res && res.po_number) return res.po_number;
    } catch (err) {
      console.warn("generatePONumber remote failed, falling back to client seq", err);
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const seq = Math.floor(Math.random() * 9000) + 1;
    return `PO/${year}/${String(month).padStart(2, "0")}/${String(seq).padStart(4, "0")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const poNumber = await generatePONumber();

      const payload = {
        po_number: poNumber,
        vendor_id: formData.vendor_id,
        project_id: formData.project_id,
        po_type_id: formData.po_type_id,
        po_date: formData.po_date,
        delivery_date: formData.delivery_date,
        is_interstate: formData.is_interstate,
        items: formData.items,
        subtotal: formData.subtotal,
        discount_percentage: formData.discount_percentage,
        discount_amount: formData.discount_amount,
        cgst_amount: formData.cgst_amount,
        sgst_amount: formData.sgst_amount,
        igst_amount: formData.igst_amount,
        total_gst_amount: formData.total_gst_amount,
        grand_total: formData.grand_total,
        payment_terms_id: formData.payment_terms_id,
        advance_amount: formData.advance_amount,
        total_paid: 0,
        balance_amount: formData.grand_total,
        selected_terms_ids: formData.selected_terms_ids,
        terms_and_conditions: formData.terms_and_conditions,
        notes: formData.notes,
        status: "draft",
        material_status: "pending",
        payment_status: "pending",
        created_by: user?.id,
      };

      const created = await poApi.createPO(payload);

      if (created && created.id && formData.items.length) {
        const trackingRecords = formData.items.map((item) => ({
          po_id: created.id,
          item_id: item.item_id,
          item_description: item.item_name,
          quantity_ordered: item.quantity,
          quantity_received: 0,
          quantity_pending: item.quantity,
          status: "pending",
        }));
        try {
          await poApi.createTracking(trackingRecords);
        } catch (err) {
          console.warn("tracking creation failed", err);
        }

        if (formData.advance_amount > 0) {
          try {
            await poApi.createPayment({
              po_id: created.id,
              payment_type: "advance",
              amount: formData.advance_amount,
              due_date: formData.po_date,
              status: "pending",
              created_by: user?.id,
            });
          } catch (err) {
            console.warn("advance payment creation failed", err);
          }
        }
      }

      alert("Purchase Order created successfully!");
      setShowModal(false);
      resetForm();
      loadPOs();
    } catch (err) {
      console.error("Error creating PO:", err);
      alert("Error creating purchase order");
    }
  };

  const resetForm = () => {
    setFormData({
      po_number: "",
      vendor_id: "",
      project_id: "",
      po_type_id: "",
      po_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      is_interstate: false,
      items: [],
      subtotal: 0,
      discount_percentage: 0,
      discount_amount: 0,
      taxable_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_gst_amount: 0,
      grand_total: 0,
      payment_terms_id: "",
      advance_amount: 0,
      selected_terms_ids: [],
      terms_and_conditions: "",
      notes: "",
    });
  };

  // Filtering (supports vendor_name flat or nested vendors object)
  const filteredPOs = pos.filter((po) => {
    const vendorName = (po.vendor_name || po.vendors?.name || "").toString().toLowerCase();
    return (
      (po.po_number || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendorName.includes(searchTerm.toLowerCase())
    );
  });

  const getVendorDisplayName = (po: any) => {
    return po.vendor_name || (po.vendors && po.vendors.name) || "—";
  };

  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      pending_approval: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getMaterialStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gray-100 text-gray-700",
      partial: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-orange-100 text-orange-700",
      partial: "bg-yellow-100 text-yellow-700",
      paid: "bg-green-100 text-green-700",
    };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchase Orders Pro</h1>
          <p className="text-gray-600 mt-1">GST, Material Tracking, Payment Management</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
          <Plus className="w-5 h-5" />
          Create PO
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Search by PO number or vendor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">PO Number</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vendor</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Material</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedPO(po)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-800">{po.po_number}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{getVendorDisplayName(po)}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{formatCurrency(po.grand_total)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>{String(po.status).replace("_", " ").toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMaterialStatusColor(po.material_status)}`}>{String(po.material_status).toUpperCase()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(po.payment_status)}`}>{String(po.payment_status).toUpperCase()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPOs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No purchase orders</h3>
            <p className="text-gray-600">Click "Create PO" to create your first purchase order</p>
          </div>
        )}
      </div>

      {/* Create Modal (full form) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">Create Purchase Order</h2>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Basic Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor <span className="text-red-500">*</span></label>
                    <select value={formData.vendor_id} onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      <option value="">Select Vendor</option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project <span className="text-red-500">*</span></label>
                    <select value={formData.project_id} onChange={(e) => setFormData({ ...formData, project_id: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      <option value="">Select Project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Type <span className="text-red-500">*</span></label>
                    <select
                      value={formData.po_type_id}
                      onChange={(e) => setFormData({ ...formData, po_type_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={poTypesLoading}
                    >
                      <option value="">{poTypesLoading ? "Loading types..." : "Select Type"}</option>
                      {poTypes.map((type: any) => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">PO Date <span className="text-red-500">*</span></label>
                    <input type="date" value={formData.po_date} onChange={(e) => setFormData({ ...formData, po_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                    <input type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>

                  <div className="flex items-center pt-8">
                    <input type="checkbox" id="interstate" checked={formData.is_interstate} onChange={(e) => handleInterstateChange(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" />
                    <label htmlFor="interstate" className="ml-2 text-sm font-medium text-gray-700">Interstate Supply (IGST)</label>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                  <button type="button" onClick={() => setShowItemSelector(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Item from Master
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No items added yet</p>
                    <p className="text-sm text-gray-500 mt-1">Click "Add Item from Master" to start</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-12 gap-3 items-start">
                          <div className="col-span-3">
                            <label className="text-xs text-gray-600">Item</label>
                            <p className="font-medium text-gray-800">{item.item_name}</p>
                            <p className="text-xs text-gray-500">{item.item_code}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-600">HSN</label>
                            <p className="text-sm text-gray-700">{item.hsn_code}</p>
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs text-gray-600">Qty</label>
                            <input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="0" step="0.01" />
                          </div>
                          <div className="col-span-1">
                            <label className="text-xs text-gray-600">Unit</label>
                            <p className="text-sm text-gray-700">{item.unit}</p>
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-600">Rate</label>
                            <input type="number" value={item.rate} onChange={(e) => handleItemChange(index, "rate", parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-gray-300 rounded text-sm" min="0" step="0.01" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-xs text-gray-600">Amount</label>
                            <p className="font-medium text-gray-800">{formatCurrency(item.amount)}</p>
                            <p className="text-xs text-gray-500">GST: {item.gst_rate}%</p>
                          </div>
                          <div className="col-span-1 flex justify-end pt-5">
                            <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* calculation summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="col-span-2"></div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600"><div>Subtotal</div><div>{formatCurrency(formData.subtotal)}</div></div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Discount ({formData.discount_percentage}%)</div><div>{formatCurrency(formData.discount_amount)}</div></div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Taxable</div><div>{formatCurrency(formData.taxable_amount)}</div></div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2"><div>Total GST</div><div>{formatCurrency(formData.total_gst_amount)}</div></div>
                  <div className="flex justify-between text-lg font-semibold text-gray-800 mt-3"><div>Grand Total</div><div>{formatCurrency(formData.grand_total)}</div></div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
                <button type="submit" disabled={formData.items.length === 0} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  Create Purchase Order
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item selector */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Select Item from Master</h3>
              <button onClick={() => setShowItemSelector(false)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-1 gap-3">
                {items.map((item) => (
                  <div key={item.id} onClick={() => addItemFromMaster(item)} className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{item.item_name}</p>
                        <p className="text-sm text-gray-600">{item.item_code} | HSN: {item.hsn_code}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{formatCurrency(item.standard_rate)}</p>
                        <p className="text-xs text-gray-600">per {item.unit}</p>
                        <p className="text-xs text-gray-500">GST: {item.gst_rate}%</p>
                      </div>
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${item.category === "material" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>
                      {String(item.category).toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

