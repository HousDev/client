// // src/components/MaterialInForm.tsx
// import React, { useState, useEffect } from "react";
// import {
//   X,
//   Save,
//   Package,
//   Truck,
//   Calendar,
//   Phone,
//   MapPin,
//   UserRound,
// } from "lucide-react";
// import poApi from "../../lib/poApi";
// import vendorApi from "../../lib/vendorApi";
// import po_trackingApi from "../../lib/po_tracking";
// import axios from "axios";
// import { api } from "../../lib/Api";
// import { toast } from "sonner";
// import projectApi from "../../lib/projectApi";

// interface MaterialInFormProps {
//   setActiveFormTab: (show: string) => void;
//   loadAllData: () => void;
//   setLoadTableData: any;
// }

// interface MaterialInFormData {
//   po_id: string;
//   po_number: string;
//   challanNumber: string;
//   vendor: string;
//   vendor_id: number;
//   receivingDate: string;
//   receiverName: string;
//   receiverPhone: string;
//   deliveryLocation: string;
//   challan_image: File | null;
//   items: any;
// }

// export default function MaterialInForm({
//   setActiveFormTab,
//   loadAllData,
//   setLoadTableData,
// }: MaterialInFormProps) {
//   const [loading, setLoading] = useState(false);
//   const [vendors, setVendors] = useState<any>([]);
//   const [allPOItems, setAllPOItems] = useState<any>([]);
//   const [purchaseOrders, setPurchaseOrder] = useState<any>([]);
//   const [poMaterialTracking, setPoMaterialTracking] = useState<any>([]);
//   const [allProjects, setAllProjects] = useState<any>([]);

//   const [formData, setFormData] = useState<MaterialInFormData>({
//     po_id: "",
//     po_number: "",
//     challanNumber: "",
//     vendor: "",
//     vendor_id: 0,
//     receivingDate: new Date().toISOString().split("T")[0],
//     receiverName: "",
//     receiverPhone: "",
//     deliveryLocation: "",
//     challan_image: null,
//     items: [],
//   });

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

//   const loadPO = async () => {
//     const vendorsData = await loadVendor();
//     const poRes: any = await poApi.getPOs();

//     const poItemsData: any = poRes.map((d: any) => {
//       const temp: any = vendorsData.find((v: any) => v.id === d.vendor_id);
//       return {
//         ...d,
//         vendor: temp.name,
//       };
//     });
//     const data = poItemsData.filter(
//       (d: any) => d.status === "authorize" && d.material_status !== "completed"
//     );
//     setPurchaseOrder(Array.isArray(data) ? data : []);
//   };

//   const loadVendor = async () => {
//     const vendorRes = await vendorApi.getVendors();
//     setVendors(Array.isArray(vendorRes) ? vendorRes : []);
//     return vendorRes;
//   };

//   const loadPOItems = async () => {
//     const poItemsRes: any = await poApi.getPOsItems();

//     setAllPOItems(Array.isArray(poItemsRes.data) ? poItemsRes.data : []);
//   };
//   const loadPOMaterialTracking = async () => {
//     const poMaterialTracking: any = await po_trackingApi.getTrackings();

//     setPoMaterialTracking(
//       Array.isArray(poMaterialTracking) ? poMaterialTracking : []
//     );
//   };

//   useEffect(() => {
//     loadProjects();
//     loadPOItems();
//     loadVendor();
//     loadPO();
//     loadPOMaterialTracking();
//   }, []);

//   const handleInputChange = (
//     field: keyof MaterialInFormData,
//     value: string
//   ) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleItemQuantityChange = (id: number, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       items: prev.items.map((item: any) =>
//         item.id === id ? { ...item, quantity_received: value } : item
//       ),
//     }));
//   };

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setFormData((prev) => ({ ...prev, challan_image: file }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       // 🔴 BASIC VALIDATION
//       if (
//         !formData.po_id ||
//         !formData.vendor_id ||
//         !formData.receivingDate ||
//         !formData.receiverName ||
//         !formData.receiverPhone ||
//         !formData.deliveryLocation
//       ) {
//         toast.error("All fields are required.");
//         return;
//       }
//       if (!(formData.receiverPhone.length === 10)) {
//         toast.error("Receiver Mobile Number Must be 10 digits.");
//         return;
//       }
//       if (formData.receiverName.length < 3) {
//         toast.error("Enter valid receiver name.");
//         return;
//       }

//       if (!formData.items || formData.items.length === 0) {
//         toast.error("At least one item is required.");
//         return;
//       }

//       for (const item of formData.items) {
//         if (item.quantity_received < 0) {
//           toast.error("Received quantity must be greater than 0.");
//           return;
//         }
//       }

//       const formDataObj = new FormData();

//       // 🔹 Basic fields
//       formDataObj.append("po_id", String(formData.po_id));
//       formDataObj.append("vendor_id", String(formData.vendor_id));
//       formDataObj.append("challan_number", formData.challanNumber);
//       formDataObj.append("receiving_date", formData.receivingDate);
//       formDataObj.append("receiver_name", formData.receiverName);
//       formDataObj.append("receiver_phone", formData.receiverPhone);
//       formDataObj.append("delivery_location", formData.deliveryLocation);

//       // 🔹 Challan image
//       if (formData.challan_image) {
//         formDataObj.append("challan_image", formData.challan_image);
//       }

//       // 🔹 Items
//       formDataObj.append(
//         "items",
//         JSON.stringify(
//           formData.items.map((item: any) => ({
//             id: item.item_id,
//             quantity_issued: Number(item.quantity_received),
//           }))
//         )
//       );

//       const response = await api.post("/inventory-transaction", formDataObj, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       setLoading(false);

//       if (response.status === 201) {
//         toast.success("Transaction created successfully.");
//         resetForm();
//         loadAllData();
//         setLoadTableData(response);
//         setActiveFormTab("");
//       } else {
//         toast.error("Failed to create transaction.");
//       }
//     } catch (error: any) {
//       console.error("Create transaction error:", error);
//       toast.error(error?.response?.data?.message || "Something went wrong");
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       po_id: "",
//       po_number: "",
//       challanNumber: "",
//       vendor: "",
//       vendor_id: 0,
//       receivingDate: new Date().toISOString().split("T")[0],
//       receiverName: "",
//       receiverPhone: "",
//       deliveryLocation: "",
//       challan_image: null,
//       items: [],
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
//           <h2 className="text-[0.9rem] md:text-xl font-bold text-white flex items-center gap-2">
//             <Truck className="w-5 h-5" />
//             Material In
//           </h2>
//           <button
//             onClick={() => {
//               setActiveFormTab("");
//               resetForm();
//             }}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="my-3 px-6 py-3 min-h-[300px] max-h-[530px] overflow-y-scroll rounded-b-lg">
//           <form onSubmit={handleSubmit} className="space-y-3">
//             {/* PO Number & Vendor */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   PO Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <select
//                     value={`${formData.po_number}`}
//                     onChange={(e) => {
//                       const purchaseOrdersData = purchaseOrders.find(
//                         (po: any) => po.po_number === e.target.value
//                       );
//                       const vendorData = vendors.find(
//                         (v: any) => v.id === purchaseOrdersData.vendor_id
//                       );

//                       handleInputChange("po_number", e.target.value);
//                       handleInputChange("po_id", purchaseOrdersData.id);
//                       handleInputChange("vendor_id", vendorData.id);
//                       handleInputChange("vendor", vendorData.name);

//                       const poItems = allPOItems.filter(
//                         (poItem: any) => poItem.po_id === purchaseOrdersData.id
//                       );

//                       const poItemsWithReceivedQuantity = poItems.map(
//                         (pi: any) => {
//                           const tracking = poMaterialTracking.find(
//                             (mt: any) =>
//                               String(mt.po_id) === String(pi.po_id) &&
//                               String(mt.item_id) === String(pi.item_id)
//                           );

//                           return {
//                             ...pi,
//                             issued_quantity: tracking
//                               ? Number(tracking.quantity_received)
//                               : 0,
//                             quantity_received: 0,
//                           };
//                         }
//                       );
//                       console.log(
//                         poItemsWithReceivedQuantity,
//                         "po items from select"
//                       );
//                       handleInputChange("items", poItemsWithReceivedQuantity);
//                     }}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm outline-none"
//                     required
//                   >
//                     <option value="">Select PO Number</option>
//                     {purchaseOrders.map((po: any) => (
//                       <option key={po.id} value={po.po_number}>
//                         {po.vendor}-{"("}
//                         {po.po_number}
//                         {")"}
//                       </option>
//                     ))}
//                   </select>
//                   <div className="absolute right-3 top-3.5 pointer-events-none">
//                     <svg
//                       className="w-5 h-5 text-gray-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 34 35"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                   </div>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Vendor <span className="text-red-500">*</span>
//                 </label>
//                 <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
//                   <Truck className="w-4 h-4 text-gray-500" />
//                   <span className="text-gray-700 text-sm">
//                     {formData.vendor || "Vendor"}
//                   </span>
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Challan Number
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.challanNumber}
//                   onChange={(e) =>
//                     handleInputChange("challanNumber", e.target.value)
//                   }
//                   className="w-full outline-none px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Enter challan number"
//                 />
//               </div>
//             </div>

//             {/* Receiving Date, Receiver Name & Phone */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Receiving Date <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                   <input
//                     type="date"
//                     value={formData.receivingDate}
//                     onChange={(e) =>
//                       handleInputChange("receivingDate", e.target.value)
//                     }
//                     className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Receiver Name <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <UserRound className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                   <input
//                     type="text"
//                     value={formData.receiverName}
//                     onChange={(e) => {
//                       if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
//                         toast.warning("Only alphabet allowed.");
//                         return;
//                       }
//                       handleInputChange("receiverName", e.target.value);
//                     }}
//                     className="w-full outline-none pl-10 pr-4 py-2 text-sm  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Receiver Name"
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Receiver Phone <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-3.5 w-3 h-3 text-gray-400" />
//                   <input
//                     type="tel"
//                     value={formData.receiverPhone}
//                     onChange={(e) => {
//                       if (!/^\d*$/.test(e.target.value)) {
//                         toast.warning("Enter Valid Phone Number.");
//                         return;
//                       }
//                       if (Number(e.target.value.length) <= 10) {
//                         handleInputChange("receiverPhone", e.target.value);
//                       } else {
//                         toast.warning("Only 10 digit mobile number allowed.");
//                       }
//                     }}
//                     className="w-full outline-none pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Delivery Location */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Delivery Location <span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                   <select
//                     value={`${formData.deliveryLocation}`}
//                     onChange={(e) =>
//                       handleInputChange("deliveryLocation", e.target.value)
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm outline-none"
//                     required
//                   >
//                     <option value="">Delivery Location</option>
//                     {allProjects.map((project: any) => (
//                       <option key={project.id} value={project.loaction}>
//                         {project.name}-{"("}
//                         {project.location}
//                         {")"}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               {/* File Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Challan Receipt
//                 </label>
//                 <input
//                   type="file"
//                   id="challan_image"
//                   onChange={handleFileUpload}
//                   className="w-full file:px-4 file:py-2 text-sm border file:rounded-l-lg file:border-none file:font-semibold  file:bg-blue-600 file:hover:bg-blue-700 file:text-white file:mr-3 border-gray-300 rounded-lg focus:ring-2  focus:ring-blue-500 focus:border-transparent"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                 />
//               </div>
//             </div>

//             {/* Items Table */}
//             {formData.items.length > 0 && (
//               <div className="border border-gray-200 rounded-lg overflow-hidden">
//                 <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
//                   <h3 className="font-medium text-gray-700 flex items-center gap-2">
//                     <Package className="w-4 h-4" />
//                     Items to Receive
//                   </h3>
//                 </div>
//                 <div className="overflow-x-auto">
//                   <table className="w-full">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                           Material
//                         </th>
//                         <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                           Ordered Qty
//                         </th>
//                         <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                           Total Issued Qty
//                         </th>
//                         <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                           Received Qty *
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-200">
//                       {formData.items.map((item: any) => {
//                         console.log(item.quantity, item.issued_quantity);
//                         return (
//                           <tr
//                             key={item.materialId}
//                             className="hover:bg-gray-50"
//                           >
//                             <td className="px-4 py-3">
//                               <div className="font-medium text-gray-800">
//                                 {item?.item_name || "Unknown"}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="text-gray-700">
//                                 {item?.quantity || 0} {item?.unit || "N/A"}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <div className="text-gray-700">
//                                 {item.issued_quantity} {item?.unit || "N/A"}
//                               </div>
//                             </td>
//                             <td className="px-4 py-3">
//                               <input
//                                 type="text"
//                                 min="0"
//                                 disabled={
//                                   parseFloat(item.quantity) ===
//                                   parseFloat(item.issued_quantity)
//                                 }
//                                 max={parseFloat(item?.quantity)}
//                                 value={
//                                   item.quantity_received === 0
//                                     ? ""
//                                     : item.quantity_received
//                                 }
//                                 onChange={(e) => {
//                                   if (
//                                     !/^\d*\.?\d*$/.test(e.target.value) ||
//                                     parseFloat(e.target.value) < 0
//                                   )
//                                     return;
//                                   const t =
//                                     parseFloat(item.quantity) -
//                                     parseFloat(item.issued_quantity);

//                                   if (t < parseFloat(e.target.value)) {
//                                     toast.error(
//                                       "Received Qty. is greater than pending Qty."
//                                     );
//                                     return;
//                                   }
//                                   handleItemQuantityChange(
//                                     item.id,
//                                     e.target.value
//                                   );
//                                 }}
//                                 className="w-32 outline-none px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="0"
//                                 required
//                               />
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white text-sm">
//               <button
//                 type="submit"
//                 className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
//               >
//                 <Save className="w-4 h-4 mr-2" />
//                 {loading ? "Processing..." : "Material In"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setActiveFormTab("");
//                   resetForm();
//                 }}
//                 className="px-6 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  Package,
  Truck,
  Calendar,
  Phone,
  MapPin,
  UserRound,
  FileText,
  Building,
  ChevronDown,
  Layers,
  CheckSquare,
  ClipboardList,
} from "lucide-react";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import po_trackingApi from "../../lib/po_tracking";
import axios from "axios";
import { api } from "../../lib/Api";
import { toast } from "sonner";
import projectApi from "../../lib/projectApi";

interface MaterialInFormProps {
  setActiveFormTab: (show: string) => void;
  loadAllData: () => void;
  setLoadTableData: any;
}

interface MaterialInFormData {
  po_id: string;
  po_number: string;
  challanNumber: string;
  vendor: string;
  vendor_id: number;
  receivingDate: string;
  receiverName: string;
  receiverPhone: string;
  deliveryLocation: string;
  challan_image: File | null;
  items: any;
}

export default function MaterialInForm({
  setActiveFormTab,
  loadAllData,
  setLoadTableData,
}: MaterialInFormProps) {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState<any>([]);
  const [allPOItems, setAllPOItems] = useState<any>([]);
  const [purchaseOrders, setPurchaseOrder] = useState<any>([]);
  const [poMaterialTracking, setPoMaterialTracking] = useState<any>([]);
  const [allProjects, setAllProjects] = useState<any>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<MaterialInFormData>({
    po_id: "",
    po_number: "",
    challanNumber: "",
    vendor: "",
    vendor_id: 0,
    receivingDate: new Date().toISOString().split("T")[0],
    receiverName: "",
    receiverPhone: "",
    deliveryLocation: "",
    challan_image: null,
    items: [],
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setActiveFormTab("");
        resetForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjects();
      if (data.success) {
        setAllProjects(data.data);
        setLoading(false);
        return;
      }
      setAllProjects([]);
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const loadPO = async () => {
    const vendorsData = await loadVendor();
    const poRes: any = await poApi.getPOs();

    const poItemsData: any = poRes.map((d: any) => {
      const temp: any = vendorsData.find((v: any) => v.id === d.vendor_id);
      return {
        ...d,
        vendor: temp.name,
      };
    });
    const data = poItemsData.filter(
      (d: any) => d.status === "authorize" && d.material_status !== "completed",
    );
    setPurchaseOrder(Array.isArray(data) ? data : []);
  };

  const loadVendor = async () => {
    const vendorRes = await vendorApi.getVendors();
    setVendors(Array.isArray(vendorRes) ? vendorRes : []);
    return vendorRes;
  };

  const loadPOItems = async () => {
    const poItemsRes: any = await poApi.getPOsItems();

    setAllPOItems(Array.isArray(poItemsRes.data) ? poItemsRes.data : []);
  };
  const loadPOMaterialTracking = async () => {
    const poMaterialTracking: any = await po_trackingApi.getTrackings();

    setPoMaterialTracking(
      Array.isArray(poMaterialTracking) ? poMaterialTracking : [],
    );
  };

  useEffect(() => {
    loadProjects();
    loadPOItems();
    loadVendor();
    loadPO();
    loadPOMaterialTracking();
  }, []);

  const handleInputChange = (
    field: keyof MaterialInFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemQuantityChange = (id: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item: any) =>
        item.id === id ? { ...item, quantity_received: value } : item,
      ),
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, challan_image: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // 🔴 BASIC VALIDATION
      if (
        !formData.po_id ||
        !formData.vendor_id ||
        !formData.receivingDate ||
        !formData.receiverName ||
        !formData.receiverPhone ||
        !formData.deliveryLocation
      ) {
        toast.error("All fields are required.");
        return;
      }
      if (!(formData.receiverPhone.length === 10)) {
        toast.error("Receiver Mobile Number Must be 10 digits.");
        return;
      }
      if (formData.receiverName.length < 3) {
        toast.error("Enter valid receiver name.");
        return;
      }

      if (!formData.items || formData.items.length === 0) {
        toast.error("At least one item is required.");
        return;
      }
      let statusOfQuantity = true;
      for (const item of formData.items) {
        if (item.quantity_received > 0) {
          statusOfQuantity = false;
        }
      }
      if (statusOfQuantity) {
        toast.error("All items have recieved quantity zero.");
        setLoading(false);
        return;
      }

      const formDataObj = new FormData();

      // 🔹 Basic fields
      formDataObj.append("po_id", String(formData.po_id));
      formDataObj.append("vendor_id", String(formData.vendor_id));
      formDataObj.append("challan_number", formData.challanNumber);
      formDataObj.append("receiving_date", formData.receivingDate);
      formDataObj.append("receiver_name", formData.receiverName);
      formDataObj.append("receiver_phone", formData.receiverPhone);
      formDataObj.append("delivery_location", formData.deliveryLocation);

      // 🔹 Challan image
      if (formData.challan_image) {
        formDataObj.append("challan_image", formData.challan_image);
      }

      // 🔹 Items
      formDataObj.append(
        "items",
        JSON.stringify(
          formData.items.map((item: any) => ({
            id: item.item_id,
            quantity_issued: Number(item.quantity_received),
          })),
        ),
      );

      const response = await api.post("/inventory-transaction", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setLoading(false);

      if (response.status === 201) {
        toast.success("Transaction created successfully.");
        resetForm();
        loadAllData();
        setLoadTableData(response);
        setActiveFormTab("");
      } else {
        toast.error("Failed to create transaction.");
      }
    } catch (error: any) {
      console.error("Create transaction error:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setFormData({
      po_id: "",
      po_number: "",
      challanNumber: "",
      vendor: "",
      vendor_id: 0,
      receivingDate: new Date().toISOString().split("T")[0],
      receiverName: "",
      receiverPhone: "",
      deliveryLocation: "",
      challan_image: null,
      items: [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div
        ref={formRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl my-4 border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
          {" "}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Material In Form
              </h2>
              <p className="text-xs text-white/90 font-medium mt-0.5">
                Record incoming materials from vendors
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFormTab("");
              resetForm();
            }}
            className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* PO Number & Vendor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#C62828]" />
                  PO Number <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <select
                    value={`${formData.po_number}`}
                    onChange={(e) => {
                      const purchaseOrdersData = purchaseOrders.find(
                        (po: any) => po.po_number === e.target.value,
                      );
                      const vendorData = vendors.find(
                        (v: any) => v.id === purchaseOrdersData.vendor_id,
                      );

                      handleInputChange("po_number", e.target.value);
                      handleInputChange("po_id", purchaseOrdersData.id);
                      handleInputChange("vendor_id", vendorData.id);
                      handleInputChange("vendor", vendorData.name);
                      console.log("this is all projects", allProjects);
                      const project = allProjects.find(
                        (p: any) =>
                          p.id === Number(purchaseOrdersData.project_id),
                      );
                      handleInputChange(
                        "deliveryLocation",
                        project.name + " " + project.location,
                      );

                      const poItems = allPOItems.filter(
                        (poItem: any) => poItem.po_id === purchaseOrdersData.id,
                      );

                      const poItemsWithReceivedQuantity = poItems.map(
                        (pi: any) => {
                          const tracking = poMaterialTracking.find(
                            (mt: any) =>
                              String(mt.po_id) === String(pi.po_id) &&
                              String(mt.item_id) === String(pi.item_id),
                          );

                          return {
                            ...pi,
                            issued_quantity: tracking
                              ? Number(tracking.quantity_received)
                              : 0,
                            quantity_received: 0,
                          };
                        },
                      );
                      handleInputChange("items", poItemsWithReceivedQuantity);
                    }}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                    required
                  >
                    <option value="" className="text-gray-400">
                      Select PO Number
                    </option>
                    {purchaseOrders.map((po: any) => (
                      <option key={po.id} value={po.po_number} className="py-2">
                        {po.vendor} - ({po.po_number})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#C62828]" />
                  Vendor <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3 px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white group hover:border-gray-300 transition-all duration-200">
                  <Truck className="w-4 h-4 text-gray-600 group-hover:text-[#C62828]" />
                  <span
                    className={`text-sm font-medium ${formData.vendor ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {formData.vendor || "Select PO to see vendor"}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Challan Number
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.challanNumber}
                    onChange={(e) =>
                      handleInputChange("challanNumber", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter challan number"
                  />
                </div>
              </div>
            </div>

            {/* Receiving Date, Receiver Name & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#C62828]" />
                  Receiving Date <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.receivingDate}
                    onChange={(e) =>
                      handleInputChange("receivingDate", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-[#C62828]" />
                  Receiver Name <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <UserRound className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => {
                      if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
                        return;
                      }
                      handleInputChange("receiverName", e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter receiver name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C62828]" />
                  Receiver Phone <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        return;
                      }
                      if (Number(e.target.value.length) <= 10) {
                        handleInputChange("receiverPhone", e.target.value);
                      } else {
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Location & File Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C62828]" />
                  Delivery Location <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.deliveryLocation}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    placeholder="Enter receiver name"
                    disabled
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  Challan Receipt
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-[#C62828] transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <input
                    type="file"
                    id="challan_image"
                    onChange={handleFileUpload}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:border-gray-300 focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 file:border-0 file:bg-transparent file:text-gray-600 file:text-sm file:font-medium file:cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
                {formData.challan_image && (
                  <p className="text-xs text-green-600 font-medium mt-1 animate-fadeIn">
                    ✓ File selected: {formData.challan_image.name}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            {formData.items.length > 0 && (
              <div className="border-2 border-gray-200 rounded-2xl overflow-hidden mt-6 bg-gradient-to-b from-gray-50 to-white shadow-sm">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 px-5 py-3 border-b border-gray-200">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <div className="p-1.5 bg-[#C62828]/10 rounded-lg">
                      <Layers className="w-4 h-4 text-[#C62828]" />
                    </div>
                    Items to Receive
                    <span className="ml-auto text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded-full">
                      {formData.items.length} items
                    </span>
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3 font-bold text-gray-700 text-sm">
                          Material
                        </th>
                        <th className="text-left px-5 py-3 font-bold text-gray-700 text-sm">
                          Ordered Qty
                        </th>
                        <th className="text-left px-5 py-3 font-bold text-gray-700 text-sm">
                          Total Issued Qty
                        </th>
                        <th className="text-left px-5 py-3 font-bold text-gray-700 text-sm">
                          Received Qty *
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {formData.items.map((item: any, index: number) => {
                        const isComplete =
                          parseFloat(item.quantity) ===
                          parseFloat(item.issued_quantity);
                        return (
                          <tr
                            key={item.materialId}
                            className={`hover:bg-gray-50/50 transition-colors ${
                              isComplete ? "bg-green-50/50" : ""
                            }`}
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-1.5 rounded-lg ${isComplete ? "bg-green-100" : "bg-blue-100"}`}
                                >
                                  <Package
                                    className={`w-4 h-4 ${isComplete ? "text-green-600" : "text-blue-600"}`}
                                  />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-800">
                                    {item?.item_name || "Unknown"}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Unit: {item?.unit || "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="text-gray-700 font-medium">
                                {item?.quantity || 0}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    parseFloat(item.issued_quantity) === 0
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-blue-100 text-blue-700"
                                  }`}
                                >
                                  {item.issued_quantity}
                                </div>
                                {isComplete && (
                                  <CheckSquare className="w-4 h-4 text-green-500" />
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  min="0"
                                  disabled={isComplete}
                                  max={parseFloat(item?.quantity)}
                                  value={
                                    item.quantity_received === 0
                                      ? ""
                                      : item.quantity_received
                                  }
                                  onChange={(e) => {
                                    if (
                                      !/^\d*\.?\d*$/.test(e.target.value) ||
                                      parseFloat(e.target.value) < 0
                                    )
                                      return;
                                    const t =
                                      parseFloat(item.quantity) -
                                      parseFloat(item.issued_quantity);

                                    if (t < parseFloat(e.target.value)) {
                                      toast.error(
                                        "Received Qty. is greater than pending Qty.",
                                      );
                                      return;
                                    }
                                    handleItemQuantityChange(
                                      item.id,
                                      e.target.value,
                                    );
                                  }}
                                  className={`w-28 px-4 py-2 text-sm border-2 rounded-xl focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 ${
                                    isComplete
                                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                                      : "border-gray-200 hover:border-gray-300 focus:border-[#C62828]"
                                  }`}
                                  placeholder="Enter Qty"
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-3 px-6 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Material In
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("");
                  resetForm();
                }}
                className="px-6 py-3 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Add some custom styles for scrollbar */}
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #c62828;
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #b71c1c;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
}
