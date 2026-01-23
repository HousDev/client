// // src/components/InventoryTransaction.tsx
// import React, { useState, useEffect } from "react";
// import {
//   X,
//   Save,
//   Package,
//   Truck,
//   Download,
//   Calendar,
//   Phone,
//   MapPin,
//   FileText,
//   Upload,
//   CheckCircle,
//   AlertCircle,
// } from "lucide-react";

// interface InventoryTransactionProps {
//   setActiveFormTab: React.Dispatch<React.SetStateAction<string>>;
//   activeFormTab: string;
//   allInventory: any[];
//   loadAllData: () => void;
// }

// interface MaterialItem {
//   id: number;
//   name: string;
//   currentStock: number;
//   unit: string;
// }

// interface PurchaseOrder {
//   id: number;
//   poNumber: string;
//   vendor: string;
//   status: string;
//   items: Array<{
//     materialId: number;
//     materialName: string;
//     quantity: number;
//     unit: string;
//   }>;
// }

// interface MaterialOutForm {
//   materialId: number;
//   quantity: string;
//   issuedTo: string;
//   phoneNumber: string;
//   deliveryLocation: string;
//   issueDate: string;
// }

// interface MaterialInForm {
//   poNumber: string;
//   receiverName: string;
//   challanNumber: string;
//   vendor: string;
//   receivingDate: string;
//   receiverPhone: string;
//   deliveryLocation: string;
//   challanFile: File | null;
//   items: Array<{
//     materialId: number;
//     receivedQuantity: string;
//   }>;
// }

// export default function InventoryTransaction({
//   setActiveFormTab,
//   activeFormTab,
//   allInventory,
//   loadAllData,
// }: InventoryTransactionProps) {
//   const [loading, setLoading] = useState(false);

//   // Mock data - Replace with API calls
//   const [purchaseOrders] = useState<PurchaseOrder[]>([
//     {
//       id: 1,
//       poNumber: "PO-2024-001",
//       vendor: "ABC Suppliers",
//       status: "Pending",
//       items: [
//         {
//           materialId: 1,
//           materialName: "Cement OPC 53",
//           quantity: 100,
//           unit: "Bags",
//         },
//         {
//           materialId: 2,
//           materialName: "Steel TMT Bar",
//           quantity: 50,
//           unit: "Tonnes",
//         },
//       ],
//     },
//     {
//       id: 2,
//       poNumber: "PO-2024-002",
//       vendor: "XYZ Traders",
//       status: "Delivered",
//       items: [
//         {
//           materialId: 3,
//           materialName: "River Sand",
//           quantity: 200,
//           unit: "Cubic Meters",
//         },
//       ],
//     },
//   ]);

//   const [deliveryLocations] = useState([
//     "Main Site - Building A",
//     "Main Site - Building B",
//     "Warehouse - Sector 5",
//     "Site Office - North Wing",
//     "Storage Yard - East Block",
//   ]);

//   // Material Out Form
//   const [materialOutForm, setMaterialOutForm] = useState<MaterialOutForm>({
//     materialId: 0,
//     quantity: "",
//     issuedTo: "",
//     phoneNumber: "",
//     deliveryLocation: "",
//     issueDate: new Date().toISOString().split("T")[0],
//   });

//   // Material In Form
//   const [materialInForm, setMaterialInForm] = useState<MaterialInForm>({
//     poNumber: "",
//     challanNumber: "",
//     vendor: "",
//     receivingDate: new Date().toISOString().split("T")[0],
//     receiverPhone: "",
//     receiverName: "",
//     deliveryLocation: "",
//     challanFile: null,
//     items: [],
//   });

//   const resetForm = () => {
//     setMaterialOutForm({
//       materialId: 0,
//       quantity: "",
//       issuedTo: "",
//       phoneNumber: "",
//       deliveryLocation: "",
//       issueDate: new Date().toISOString().split("T")[0],
//     });
//     setMaterialInForm({
//       poNumber: "",
//       challanNumber: "",
//       vendor: "",
//       receivingDate: new Date().toISOString().split("T")[0],
//       receiverPhone: "",
//       receiverName: "",
//       deliveryLocation: "",
//       challanFile: null,
//       items: [],
//     });
//   };

//   // Get selected PO details
//   const selectedPO = purchaseOrders.find(
//     (po) => po.poNumber === materialInForm.poNumber
//   );

//   // Initialize items when PO is selected
//   useEffect(() => {
//     if (selectedPO) {
//       const updatedItems = selectedPO.items.map((item) => ({
//         materialId: item.materialId,
//         receivedQuantity: "",
//       }));
//       setMaterialInForm((prev) => ({
//         ...prev,
//         vendor: selectedPO.vendor,
//         items: updatedItems,
//       }));
//     } else {
//       setMaterialInForm((prev) => ({
//         ...prev,
//         vendor: "",
//         items: [],
//       }));
//     }
//   }, [selectedPO]);

//   // Handle Material Out input change
//   const handleMaterialOutChange = (
//     field: keyof MaterialOutForm,
//     value: string
//   ) => {
//     setMaterialOutForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // Handle Material In input change
//   const handleMaterialInChange = (
//     field: keyof MaterialInForm,
//     value: string
//   ) => {
//     setMaterialInForm((prev) => ({ ...prev, [field]: value }));
//   };

//   // Handle received quantity change for items
//   const handleItemQuantityChange = (materialId: number, value: string) => {
//     setMaterialInForm((prev) => ({
//       ...prev,
//       items: prev.items.map((item) =>
//         item.materialId === materialId
//           ? { ...item, receivedQuantity: value }
//           : item
//       ),
//     }));
//   };

//   // Handle file upload
//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setMaterialInForm((prev) => ({ ...prev, challanFile: file }));
//     }
//   };

//   // Get selected material details
//   const selectedMaterial = allInventory.find(
//     (item) => item.id === materialOutForm.materialId
//   );

//   // Submit Material Out
//   const handleMaterialOutSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!materialOutForm.materialId) {
//       alert("Please select a material");
//       return;
//     }

//     if (!materialOutForm.quantity || Number(materialOutForm.quantity) <= 0) {
//       alert("Please enter a valid quantity");
//       return;
//     }

//     if (!materialOutForm.issuedTo) {
//       alert("Please enter who the material is issued to");
//       return;
//     }

//     const material = allInventory.find(
//       (item) => item.id === materialOutForm.materialId
//     );
//     if (
//       material &&
//       Number(material.quantity) < Number(materialOutForm.quantity)
//     ) {
//       alert(
//         `Insufficient stock! Available: ${material.quantity} ${material.unit}`
//       );
//       return;
//     }

//     try {
//       setLoading(true);
//       // TODO: API call for material out
//       console.log("Material Out:", materialOutForm);
//       alert("Material issued successfully!");
//       setActiveFormTab("");
//       loadAllData();
//     } catch (error) {
//       console.error("Error issuing material:", error);
//       alert("Failed to issue material");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Submit Material In
//   const handleMaterialInSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!materialInForm.poNumber) {
//       alert("Please select a PO number");
//       return;
//     }

//     if (!materialInForm.challanNumber) {
//       alert("Please enter challan number");
//       return;
//     }

//     if (!materialInForm.deliveryLocation) {
//       alert("Please select delivery location");
//       return;
//     }

//     // Validate all items have received quantity
//     const invalidItems = materialInForm.items.filter(
//       (item) => !item.receivedQuantity || Number(item.receivedQuantity) <= 0
//     );

//     if (invalidItems.length > 0) {
//       alert("Please enter received quantity for all items");
//       return;
//     }

//     try {
//       setLoading(true);
//       // TODO: API call for material in
//       console.log("Material In:", materialInForm);
//       alert("Material received successfully!");
//       setActiveFormTab("");
//       loadAllData();
//     } catch (error) {
//       console.error("Error receiving material:", error);
//       alert("Failed to receive material");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Get current PO items
//   const getPOItem = (materialId: number) => {
//     return selectedPO?.items.find((item) => item.materialId === materialId);
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10 ">
//           <h2 className="text-xl font-bold text-white flex items-center gap-2">
//             <Truck className="w-5 h-5" />
//             Material{" "}
//             {activeFormTab.charAt(0).toUpperCase() + activeFormTab.slice(1)}
//           </h2>
//           <button
//             onClick={() => setActiveFormTab("")}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className=" my-3 px-6 py-3  h-[530px] overflow-y-scroll rounded-b-lg">
//           {/* Material In Form */}
//           {activeFormTab === "in" && (
//             <form onSubmit={handleMaterialInSubmit} className="space-y-6">
//               {/* PO Number & Vendor */}
//               <div className="grid grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     PO Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <select
//                       value={materialInForm.poNumber}
//                       onChange={(e) =>
//                         handleMaterialInChange("poNumber", e.target.value)
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                       required
//                     >
//                       <option value="">Select PO Number</option>
//                       {purchaseOrders.map((po) => (
//                         <option key={po.id} value={po.poNumber}>
//                           {po.poNumber} - {po.vendor} ({po.status})
//                         </option>
//                       ))}
//                     </select>
//                     <div className="absolute right-3 top-3.5 pointer-events-none">
//                       <svg
//                         className="w-5 h-5 text-gray-400"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M19 9l-7 7-7-7"
//                         />
//                       </svg>
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Vendor
//                   </label>
//                   <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
//                     <Truck className="w-4 h-4 text-gray-500" />
//                     <span className="text-gray-700">
//                       {materialInForm.vendor || "Select PO to auto-fill"}
//                     </span>
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Challan Number <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={materialInForm.challanNumber}
//                     onChange={(e) =>
//                       handleMaterialInChange("challanNumber", e.target.value)
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter challan number"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Challan Number & Receiving Date */}
//               <div className="grid grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Receiving Date
//                   </label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="date"
//                       value={materialInForm.receivingDate}
//                       onChange={(e) =>
//                         handleMaterialInChange("receivingDate", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Receiver Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={materialInForm.receiverName}
//                       onChange={(e) =>
//                         handleMaterialInChange("receiverName", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Receiver Name"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Receiver Phone
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="tel"
//                       value={materialInForm.receiverPhone}
//                       onChange={(e) =>
//                         handleMaterialInChange("receiverPhone", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter phone number"
//                     />
//                   </div>
//                 </div>
//               </div>
//               {/* Location */}
//               <div className="grid grid-cols-3 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Delivery Location <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={materialInForm.deliveryLocation}
//                       onChange={(e) =>
//                         handleMaterialInChange(
//                           "deliveryLocation",
//                           e.target.value
//                         )
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Location"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Items Table */}
//               {selectedPO && materialInForm.items.length > 0 && (
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
//                             Received Qty *
//                           </th>
//                           <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">
//                             Unit
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody className="divide-y divide-gray-200">
//                         {materialInForm.items.map((item) => {
//                           const poItem = getPOItem(item.materialId);
//                           return (
//                             <tr
//                               key={item.materialId}
//                               className="hover:bg-gray-50"
//                             >
//                               <td className="px-4 py-3">
//                                 <div className="font-medium text-gray-800">
//                                   {poItem?.materialName || "Unknown"}
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="text-gray-700">
//                                   {poItem?.quantity || 0}
//                                 </div>
//                               </td>
//                               <td className="px-4 py-3">
//                                 <input
//                                   type="number"
//                                   min="0"
//                                   max={poItem?.quantity}
//                                   value={item.receivedQuantity}
//                                   onChange={(e) =>
//                                     handleItemQuantityChange(
//                                       item.materialId,
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                   placeholder="0"
//                                   required
//                                 />
//                               </td>
//                               <td className="px-4 py-3">
//                                 <div className="text-gray-700">
//                                   {poItem?.unit || "N/A"}
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}

//               {/* File Upload */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Challan Receipt
//                 </label>
//                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-blue-400 transition-colors">
//                   <input
//                     type="file"
//                     id="challanFile"
//                     onChange={handleFileUpload}
//                     className="hidden"
//                     accept=".pdf,.jpg,.jpeg,.png"
//                   />
//                   <label htmlFor="challanFile" className="cursor-pointer">
//                     <div className="flex flex-col items-center gap-3">
//                       <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
//                         <Upload className="w-6 h-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-700">
//                           {materialInForm.challanFile
//                             ? materialInForm.challanFile.name
//                             : "Upload Challan Receipt"}
//                         </p>
//                         <p className="text-sm text-gray-500 mt-1">
//                           PDF, JPG, or PNG up to 5MB
//                         </p>
//                       </div>
//                     </div>
//                   </label>
//                   {materialInForm.challanFile && (
//                     <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
//                       <div className="flex items-center gap-3">
//                         <FileText className="w-5 h-5 text-green-600" />
//                         <div>
//                           <p className="font-medium text-green-800">
//                             {materialInForm.challanFile.name}
//                           </p>
//                           <p className="text-xs text-green-600">
//                             {(materialInForm.challanFile.size / 1024).toFixed(
//                               1
//                             )}{" "}
//                             KB
//                           </p>
//                         </div>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setMaterialInForm((prev) => ({
//                             ...prev,
//                             challanFile: null,
//                           }))
//                         }
//                         className="text-red-600 hover:text-red-800"
//                       >
//                         Remove
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="">
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   {loading ? "Processing..." : "Receive Material"}
//                 </button>
//               </div>
//             </form>
//           )}

//           {/* Material Out Form */}
//           {activeFormTab === "out" && (
//             <form
//               onSubmit={handleMaterialOutSubmit}
//               className="space-y-6 my-3 px-6 py-3"
//             >
//               <div className="grid grid-cols-2 gap-6">
//                 {/* Material Selection */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Material Name <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Package className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <select
//                       value={materialOutForm.materialId}
//                       onChange={(e) =>
//                         handleMaterialOutChange("materialId", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
//                       required
//                     >
//                       <option value="">Select Material</option>
//                       {allInventory.map((item) => (
//                         <option key={item.id} value={item.id}>
//                           {item.name || item.item_name} - Stock: {item.quantity}{" "}
//                           {item.unit}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Material Details Card */}
//                   {selectedMaterial && (
//                     <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                       <div className="grid grid-cols-2 gap-4">
//                         <div>
//                           <p className="text-sm text-gray-600">Current Stock</p>
//                           <p className="font-semibold text-gray-800">
//                             {selectedMaterial.quantity} {selectedMaterial.unit}
//                           </p>
//                         </div>
//                         <div>
//                           <p className="text-sm text-gray-600">
//                             Min. Stock Level
//                           </p>
//                           <p className="font-semibold text-gray-800">
//                             {selectedMaterial.reorder_qty}{" "}
//                             {selectedMaterial.unit}
//                           </p>
//                         </div>
//                       </div>
//                       {selectedMaterial.quantity <=
//                         selectedMaterial.reorder_qty && (
//                         <div className="mt-3 flex items-center gap-2 text-yellow-600 bg-yellow-50 p-2 rounded">
//                           <AlertCircle className="w-4 h-4" />
//                           <span className="text-sm font-medium">
//                             Low Stock Alert!
//                           </span>
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* Quantity */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Quantity <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={materialOutForm.quantity}
//                       onChange={(e) =>
//                         handleMaterialOutChange("quantity", e.target.value)
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder={`Enter quantity in ${
//                         selectedMaterial?.unit || "units"
//                       }`}
//                       required
//                     />
//                     {selectedMaterial && (
//                       <div className="absolute right-3 top-3 text-sm text-gray-500">
//                         {selectedMaterial.unit}
//                       </div>
//                     )}
//                   </div>
//                   {selectedMaterial && materialOutForm.quantity && (
//                     <div className="mt-2 text-sm text-gray-600">
//                       After issue:{" "}
//                       {selectedMaterial.quantity -
//                         Number(materialOutForm.quantity)}{" "}
//                       {selectedMaterial.unit}
//                     </div>
//                   )}
//                 </div>

//                 {/* Issued To & Phone */}

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Issued To <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={materialOutForm.issuedTo}
//                     onChange={(e) =>
//                       handleMaterialOutChange("issuedTo", e.target.value)
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter recipient name"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Phone Number
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="tel"
//                       value={materialOutForm.phoneNumber}
//                       onChange={(e) =>
//                         handleMaterialOutChange("phoneNumber", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter phone number"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Delivery Location & Issue Date */}
//               <div className="grid grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Delivery Location <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="text"
//                       value={materialOutForm.deliveryLocation}
//                       onChange={(e) =>
//                         handleMaterialOutChange(
//                           "deliveryLocation",
//                           e.target.value
//                         )
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="Enter delivery location"
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Issue Date
//                   </label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
//                     <input
//                       type="date"
//                       value={materialOutForm.issueDate}
//                       onChange={(e) =>
//                         handleMaterialOutChange("issueDate", e.target.value)
//                       }
//                       className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
//                 <button
//                   type="submit"
//                   disabled={materialOutForm.deliveryLocation === "0"}
//                   className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Create Purchase Order
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setActiveFormTab("");
//                     resetForm();
//                   }}
//                   className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


//22/1/26
// src/components/RolesMaster.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Plus, Edit2, Trash2, X, Shield } from "lucide-react";
import { toast } from "sonner";
import * as rolesApi from "../lib/rolesApi"; // Import API functions
import type { Role as RoleType } from "../lib/rolesApi"; // Import Role type

interface PermissionCategory {
    category: string;
    permissions: {
        key: string;
        label: string;
        description?: string;
    }[];
}

export default function RolesMaster() {
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleType | null>(null);
    const [form, setForm] = useState({
        name: "",
        description: "",
        is_active: true,
    });
    const [search, setSearch] = useState("");
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});

    const permissionCategories: PermissionCategory[] = [
        {
            category: "Dashboard",
            permissions: [
                { key: "view_dashboard", label: "View Dashboard", description: "Access to dashboard overview" },
            ],
        },
        {
            category: "Vendors",
            permissions: [
                { key: "view_vendors", label: "View Vendors", description: "View vendor list and details" },
                { key: "create_vendors", label: "Create Vendors", description: "Add new vendors" },
                { key: "edit_vendors", label: "Edit Vendors", description: "Modify vendor information" },
                { key: "delete_vendors", label: "Delete Vendors", description: "Remove vendors from system" },
            ],
        },
        {
            category: "Purchase Orders",
            permissions: [
                { key: "view_pos", label: "View POs", description: "View purchase orders" },
                { key: "create_pos", label: "Create POs", description: "Create new purchase orders" },
                { key: "edit_pos", label: "Edit POs", description: "Modify existing purchase orders" },
                { key: "delete_pos", label: "Delete POs", description: "Remove purchase orders" },
                { key: "approve_pos", label: "Approve POs", description: "Approve/reject purchase orders" },
            ],
        },
        {
            category: "Service Orders",
            permissions: [
                { key: "view_service_orders", label: "View Service Orders" },
                { key: "create_service_orders", label: "Create Service Orders" },
                { key: "edit_service_orders", label: "Edit Service Orders" },
            ],
        },
        {
            category: "Inventory & Materials",
            permissions: [
                { key: "view_inventory", label: "View Inventory" },
                { key: "create_inventory", label: "Create Inventory" },
                { key: "edit_inventory", label: "Edit Inventory" },
                { key: "delete_inventory", label: "Delete Inventory" },
                { key: "view_materials", label: "View Materials" },
                { key: "receive_materials", label: "Receive Materials" },
                { key: "view_materials_requests", label: "View Material Requests" },
                { key: "update_materials_requests", label: "Update Material Requests" },
            ],
        },
        {
            category: "Payments",
            permissions: [
                { key: "view_payments", label: "View Payments" },
                { key: "make_payments", label: "Make Payments" },
                { key: "verify_payments", label: "Verify Payments" },
            ],
        },
        {
            category: "Reports",
            permissions: [
                { key: "view_reports", label: "View Reports" },
                { key: "export_reports", label: "Export Reports" },
            ],
        },
        {
            category: "Administration",
            permissions: [
                { key: "manage_users", label: "Manage Users", description: "Create/edit/delete users" },
                { key: "manage_roles", label: "Manage Roles", description: "Create/edit/delete roles" },
                { key: "manage_permissions", label: "Manage Permissions", description: "Configure permissions" },
                { key: "manage_masters", label: "Manage Masters", description: "Manage master data" },
            ],
        },
        {
            category: "Notifications",
            permissions: [
                { key: "view_notifications", label: "View Notifications" },
            ],
        },
    ];

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        setLoading(true);
        try {
            const data = await rolesApi.getAllRoles();

            // FIX: Ensure data is always an array
            let rolesArray: RoleType[] = [];

            if (Array.isArray(data)) {
                rolesArray = data;
            } else if (data && typeof data === 'object') {
                // Handle different API response formats
                if (data.data && Array.isArray(data.data)) {
                    rolesArray = data.data;
                } else if (data.roles && Array.isArray(data.roles)) {
                    rolesArray = data.roles;
                } else if (data.items && Array.isArray(data.items)) {
                    rolesArray = data.items;
                } else if (data.results && Array.isArray(data.results)) {
                    rolesArray = data.results;
                } else {
                    // If it's an object but not in expected format, convert to array
                    rolesArray = Object.values(data).filter(item =>
                        item && typeof item === 'object' && 'id' in item
                    ) as RoleType[];
                }
            }

            console.log("Loaded roles:", rolesArray);
            setRoles(rolesArray);

        } catch (error: any) {
            console.error("Failed to load roles:", error);
            toast.error(error?.response?.data?.message || "Failed to load roles");
            setRoles([]); // CRITICAL: Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const openCreate = () => {
        setEditingRole(null);
        setForm({ name: "", description: "", is_active: true });
        setPermissions({});
        setShowModal(true);
    };

    const openEdit = (role: RoleType) => {
        setEditingRole(role);
        setForm({
            name: role.name,
            description: role.description || "",
            is_active: role.is_active,
        });
        setPermissions(role.permissions || {});
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            const payload = {
                ...form,
                permissions,
            };

            if (editingRole) {
                await rolesApi.updateRole(editingRole.id, payload);
                toast.success("Role updated successfully");
            } else {
                await rolesApi.createRole(payload);
                toast.success("Role created successfully");
            }

            setShowModal(false);
            loadRoles();
        } catch (error: any) {
            console.error("Failed to save role:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to save role"
            );
        }
    };

    const handleDelete = async (role: RoleType) => {
        if (!confirm(`Are you sure you want to delete the role "${role.name}"?`)) return;

        try {
            await rolesApi.deleteRole(role.id);
            toast.success("Role deleted successfully");
            loadRoles();
        } catch (error: any) {
            console.error("Failed to delete role:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to delete role"
            );
        }
    };

    const togglePermission = (key: string) => {
        setPermissions(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const toggleAllPermissions = (value: boolean) => {
        const allPermissions: Record<string, boolean> = {};
        permissionCategories.forEach(category => {
            category.permissions.forEach(perm => {
                allPermissions[perm.key] = value;
            });
        });
        setPermissions(allPermissions);
    };

    const handleToggleActive = async (roleId: string, currentStatus: boolean) => {
        try {
            await rolesApi.updateRole(roleId, { is_active: !currentStatus });
            toast.success(`Role ${currentStatus ? "deactivated" : "activated"} successfully`);
            loadRoles();
        } catch (error: any) {
            console.error("Failed to toggle role status:", error);
            toast.error(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                "Failed to update role status"
            );
        }
    };

    // FIXED: Safe filteredRoles calculation with useMemo
    const filteredRoles = useMemo(() => {
        // Safety check - ensure roles is always an array
        if (!Array.isArray(roles)) {
            console.warn("Roles is not an array, returning empty array", roles);
            return [];
        }

        return roles.filter(role => {
            if (!role || typeof role !== 'object') return false;

            const name = role.name || "";
            const description = role.description || "";
            const searchTerm = search.toLowerCase();

            return name.toLowerCase().includes(searchTerm) ||
                description.toLowerCase().includes(searchTerm);
        });
    }, [roles, search]);

    const getPermissionCount = (role: RoleType) => {
        if (!role.permissions) return 0;
        return Object.values(role.permissions).filter(Boolean).length;
    };

    return (
        <div className="px-0 bg-gray-50 min-h-screen p-2 sm:p-4 md:p-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6 px-0">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-0">
                        <div className="px-0">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-800 px-0">Roles Management</h2>
                            <p className="text-sm text-gray-500 mt-1 px-0">Define and manage user roles and permissions</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto px-0">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828] focus:border-transparent w-full sm:w-64 text-sm md:text-base"
                                placeholder="Search roles..."
                            />
                            <button
                                onClick={openCreate}
                                className="
                                    bg-gradient-to-r from-[#C62828] to-red-600 
                                    text-white 
                                    px-4 py-3 
                                    rounded-lg 
                                    flex items-center justify-center gap-2 
                                    hover:from-red-600 hover:to-red-700 
                                    transition-all duration-200 
                                    font-medium
                                    text-sm md:text-base
                                    w-full sm:w-auto
                                    px-0
                                "
                            >
                                <Plus className="w-4 h-4 md:w-5 md:h-5" /> 
                                <span>Add Role</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions (if needed) */}
            <div className="mb-4 sm:mb-6 px-0"></div>

            {/* Loading State */}
            {loading ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 text-center px-0">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C62828] mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading roles...</p>
                </div>
            ) : (
                <>
                    {/* Roles Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-0">
                        {filteredRoles.map((role) => (
                            <div
                                key={role.id}
                                className="
                                    p-4 
                                    border border-gray-200 
                                    rounded-xl 
                                    hover:border-gray-300 hover:shadow-sm 
                                    transition-all duration-200 
                                    bg-white
                                    px-0
                                "
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3 px-0">
                                    <div className="flex-1 px-0">
                                        <h3 className="font-semibold text-gray-800 text-base md:text-lg px-0">{role.name}</h3>
                                        {role.description && (
                                            <p className="text-sm text-gray-600 mt-1 px-0 line-clamp-2">{role.description}</p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => handleToggleActive(role.id, role.is_active)}
                                        className={`
                                            px-3 py-1.5 
                                            rounded 
                                            text-xs font-medium 
                                            ${role.is_active
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                            } 
                                            transition-colors
                                            w-full sm:w-auto
                                            px-0
                                        `}
                                    >
                                        {role.is_active ? "ACTIVE" : "INACTIVE"}
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mb-4 px-0">
                                    <Shield className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm text-gray-600 px-0">
                                        {getPermissionCount(role)} permissions
                                    </span>
                                </div>

                                <div className="text-xs text-gray-500 mb-4 px-0">
                                    <div className="flex items-center gap-1 px-0">
                                        <span>Created:</span>
                                        <span>{new Date(role.created_at || "").toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2 px-0">
                                    <button
                                        onClick={() => openEdit(role)}
                                        className="
                                            flex-1 
                                            bg-blue-50 text-blue-600 
                                            hover:bg-blue-100 
                                            px-3 py-2.5 
                                            rounded-lg 
                                            text-sm font-medium 
                                            transition-colors 
                                            flex items-center justify-center gap-2
                                            w-full sm:w-auto
                                            px-0
                                        "
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> 
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role)}
                                        className="
                                            flex-1 
                                            bg-red-50 text-red-600 
                                            hover:bg-red-100 
                                            px-3 py-2.5 
                                            rounded-lg 
                                            text-sm font-medium 
                                            transition-colors 
                                            flex items-center justify-center gap-2
                                            w-full sm:w-auto
                                            px-0
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        "
                                        disabled={role.name.toLowerCase() === "admin"}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> 
                                        <span>Delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredRoles.length === 0 && (
                        <div className="
                            text-center 
                            py-8 md:py-12 
                            border-2 border-dashed border-gray-200 
                            rounded-xl 
                            bg-gray-50
                            px-0
                        ">
                            <Shield className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-2 px-0">
                                {search ? "No matching roles found" : "No roles created yet"}
                            </h3>
                            <p className="text-gray-600 mb-4 px-0">
                                {search ? "Try a different search term" : 'Click "Add Role" to create your first role'}
                            </p>
                            {!search && (
                                <button
                                    onClick={openCreate}
                                    className="
                                        bg-gradient-to-r from-[#C62828] to-red-600 
                                        text-white 
                                        px-6 py-2.5 
                                        rounded-lg 
                                        flex items-center gap-2 
                                        hover:from-red-600 hover:to-red-700 
                                        transition-all duration-200 
                                        font-medium 
                                        mx-auto
                                        text-sm md:text-base
                                        px-0
                                    "
                                >
                                    <Plus className="w-4 h-4 md:w-5 md:h-5" /> 
                                    <span>Create First Role</span>
                                </button>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden mx-0">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 sm:px-5 py-3 flex justify-between items-center px-0">
                            <div className="flex items-center gap-2 px-0">
                                <div className="p-1.5 bg-white/20 rounded-xl">
                                    <Shield className="w-4 h-4 text-white" />
                                </div>
                                <div className="px-0">
                                    <h3 className="font-bold text-white text-base sm:text-lg px-0">
                                        {editingRole ? "Edit Role" : "Create New Role"}
                                    </h3>
                                    <p className="text-xs text-white/90 px-0">
                                        {editingRole ? "Update role details and permissions" : "Define new role and assign permissions"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="
                                    text-white 
                                    hover:bg-white/20 
                                    rounded-xl p-1.5 
                                    transition-colors
                                    px-0
                                "
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                            {/* Basic Information */}
                            <div className="mb-6 sm:mb-8">
                                <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 px-0">
                                    <span className="bg-gray-100 p-1.5 rounded-lg">
                                        <Shield className="w-4 h-4 text-gray-600" />
                                    </span>
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="px-0">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-0">
                                            Role Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className="
                                                w-full 
                                                px-3 sm:px-4 
                                                py-2.5 
                                                border border-gray-300 
                                                rounded-lg 
                                                focus:ring-2 focus:ring-[#C62828] focus:border-transparent 
                                                transition-all
                                                text-sm sm:text-base
                                                px-0
                                            "
                                            placeholder="e.g., Administrator, Manager"
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <div className="px-0">
                                        <label className="block text-sm font-medium text-gray-700 mb-2 px-0">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            className="
                                                w-full 
                                                px-3 sm:px-4 
                                                py-2.5 
                                                border border-gray-300 
                                                rounded-lg 
                                                focus:ring-2 focus:ring-[#C62828] focus:border-transparent 
                                                transition-all
                                                text-sm sm:text-base
                                                px-0
                                            "
                                            placeholder="Brief description of this role"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center mt-4 sm:mt-6 px-0">
                                    <div className="flex items-center mb-2 sm:mb-0 px-0">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={form.is_active}
                                            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                            className="w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828]"
                                        />
                                        <label htmlFor="is_active" className="ml-3 text-sm text-gray-700 font-medium px-0">
                                            Active Role
                                        </label>
                                    </div>
                                    <span className="text-xs text-gray-500 sm:ml-2 px-0">
                                        (Inactive roles cannot be assigned to users)
                                    </span>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div className="mb-6 sm:mb-8">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 px-0">
                                    <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2 px-0">
                                        <span className="bg-gray-100 p-1.5 rounded-lg">
                                            <Shield className="w-4 h-4 text-gray-600" />
                                        </span>
                                        Permissions
                                    </h4>
                                    <div className="flex gap-2 px-0">
                                        <button
                                            type="button"
                                            onClick={() => toggleAllPermissions(true)}
                                            className="
                                                px-3 sm:px-4 
                                                py-2 
                                                bg-green-50 text-green-600 
                                                text-sm 
                                                rounded-lg 
                                                hover:bg-green-100 
                                                transition-colors 
                                                font-medium
                                                w-full sm:w-auto
                                                px-0
                                            "
                                        >
                                            Select All
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => toggleAllPermissions(false)}
                                            className="
                                                px-3 sm:px-4 
                                                py-2 
                                                bg-gray-50 text-gray-600 
                                                text-sm 
                                                rounded-lg 
                                                hover:bg-gray-100 
                                                transition-colors 
                                                font-medium
                                                w-full sm:w-auto
                                                px-0
                                            "
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4 sm:space-y-6">
                                    {permissionCategories.map((category) => (
                                        <div 
                                            key={category.category} 
                                            className="
                                                border border-gray-200 
                                                rounded-xl 
                                                p-4 sm:p-5 
                                                bg-gray-50
                                                px-0
                                            "
                                        >
                                            <h5 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg px-0">{category.category}</h5>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {category.permissions.map((perm) => (
                                                    <label
                                                        key={perm.key}
                                                        className={`
                                                            flex items-start 
                                                            p-3 sm:p-4 
                                                            border rounded-lg 
                                                            cursor-pointer 
                                                            transition-all 
                                                            ${permissions[perm.key]
                                                                ? "border-[#C62828] bg-red-50"
                                                                : "border-gray-200 bg-white hover:bg-gray-50"
                                                            }
                                                            px-0
                                                        `}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!permissions[perm.key]}
                                                            onChange={() => togglePermission(perm.key)}
                                                            className="mt-1 w-5 h-5 text-[#C62828] rounded focus:ring-[#C62828]"
                                                        />
                                                        <div className="ml-3 sm:ml-4 px-0">
                                                            <div className="font-medium text-gray-800 text-sm sm:text-base px-0">{perm.label}</div>
                                                            {perm.description && (
                                                                <div className="text-xs sm:text-sm text-gray-500 mt-1.5 px-0">{perm.description}</div>
                                                            )}
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-xl px-0">
                                <h5 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base px-0">Permissions Summary</h5>
                                <p className="text-xs sm:text-sm text-blue-600 px-0">
                                    Selected {Object.values(permissions).filter(Boolean).length} out of {permissionCategories.reduce((total, cat) => total + cat.permissions.length, 0)} permissions
                                </p>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t pt-4 sm:pt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 px-0">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="
                                        px-6 sm:px-8 
                                        py-2.5 
                                        border border-gray-300 
                                        text-gray-700 
                                        rounded-lg 
                                        hover:bg-gray-50 
                                        transition-colors 
                                        font-medium
                                        text-sm sm:text-base
                                        w-full sm:w-auto
                                        px-0
                                    "
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="
                                        bg-gradient-to-r from-[#C62828] to-red-600 
                                        text-white 
                                        px-6 sm:px-8 
                                        py-2.5 
                                        rounded-lg 
                                        hover:from-red-600 hover:to-red-700 
                                        transition-all duration-200 
                                        font-medium 
                                        shadow-sm hover:shadow
                                        text-sm sm:text-base
                                        w-full sm:w-auto
                                        px-0
                                    "
                                >
                                    {editingRole ? "Update Role" : "Create Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// import React, { useState, SetStateAction, useRef, useEffect } from "react";
// import { X, Save, Package } from "lucide-react";
// import inventoryApi from "../lib/inventoryApi";
// import inventoryTransactionApi from "../lib/inventoryTransactionApi";

// /* ---------- Types ---------- */
// interface InventoryFormData {
//   inventory_item_id: number;
//   transaction_qty: number;
//   transaction_type: string;
//   remark: string;
//   previous_qty: number;
// }

// /* ------------------ SearchableSelect component (inline) ------------------ */
// function SearchableSelect({
//   options,
//   value,
//   onChange,
//   placeholder = "Select...",
//   required = false,
//   disabled = false,
//   id,
// }: {
//   options: any[];
//   value: string;
//   onChange: (id: string) => void;
//   placeholder?: string;
//   required?: boolean;
//   disabled?: boolean;
//   id?: string;
// }) {
//   console.log(options, "options");
//   const [open, setOpen] = useState(false);
//   const [filter, setFilter] = useState("");
//   const [highlight, setHighlight] = useState(0);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Normalize options to {id,name}
//   const normalized = options.map((opt) =>
//     typeof opt === "string" ? { id: opt, name: opt } : opt
//   );

//   const selected =
//     normalized.find((o) => Number(o.id) === Number(value)) || null;

//   const filtered = normalized.filter((o) =>
//     o.name.toLowerCase().includes(filter.toLowerCase())
//   );

//   useEffect(() => {
//     if (!open) setFilter("");
//     setHighlight(0);
//   }, [open]);

//   // close on outside click
//   useEffect(() => {
//     function onDocClick(e: MouseEvent) {
//       if (!containerRef.current) return;
//       if (!containerRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", onDocClick);
//     return () => document.removeEventListener("mousedown", onDocClick);
//   }, []);

//   const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       setHighlight((h) => Math.min(h + 1, filtered.length - 1));
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       setHighlight((h) => Math.max(h - 1, 0));
//     } else if (e.key === "Enter") {
//       e.preventDefault();
//       const opt = filtered[highlight];
//       if (opt) {
//         onChange(opt.id);
//         setOpen(false);
//       }
//     } else if (e.key === "Escape") {
//       setOpen(false);
//     }
//   };

//   return (
//     <div ref={containerRef} className="relative">
//       <div
//         className={`w-full flex items-center gap-2 px-3 py-3 border rounded-lg bg-white cursor-pointer ${
//           disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"
//         }`}
//         onClick={() => !disabled && setOpen((s) => !s)}
//         role="button"
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         id={id}
//       >
//         <div className="flex-1 text-left">
//           {selected ? (
//             <div className="text-sm text-gray-800">{selected.name}</div>
//           ) : (
//             <div className="text-sm text-gray-400">{placeholder}</div>
//           )}
//         </div>
//         <div>
//           <svg
//             className={`w-4 h-4 transform transition ${
//               open ? "rotate-180" : ""
//             }`}
//             viewBox="0 0 20 20"
//             fill="currentColor"
//           >
//             <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.396a.75.75 0 111.02 1.1l-4.185 3.833a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
//           </svg>
//         </div>
//       </div>

//       {/* dropdown */}
//       {open && (
//         <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
//           {/* search input */}
//           <div className="p-2">
//             <input
//               autoFocus
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               onKeyDown={onKeyDown}
//               placeholder="Search..."
//               className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//             />
//           </div>

//           <ul
//             role="listbox"
//             aria-labelledby={id}
//             className="max-h-60 overflow-y-auto divide-y divide-gray-100"
//           >
//             {filtered.length === 0 ? (
//               <li className="p-3 text-sm text-gray-500">No results</li>
//             ) : (
//               filtered.map((opt, idx) => (
//                 <li
//                   key={opt.id}
//                   role="option"
//                   aria-selected={opt.id === value}
//                   className={`px-3 py-2 cursor-pointer text-sm ${
//                     idx === highlight ? "bg-blue-50" : "hover:bg-gray-50"
//                   } ${
//                     opt.id === value
//                       ? "font-medium text-gray-800"
//                       : "text-gray-700"
//                   }`}
//                   onMouseEnter={() => setHighlight(idx)}
//                   onClick={() => {
//                     onChange(opt.id);
//                     setOpen(false);
//                   }}
//                 >
//                   {opt.name}
//                 </li>
//               ))
//             )}
//           </ul>
//         </div>
//       )}
//       {/* hidden input to keep form semantics if you want to submit native form */}
//       <input type="hidden" value={value} />
//     </div>
//   );
// }

// /* ---------- Component ---------- */
// export default function InventoryTransaction({
//   setShowCreatePro,
//   allInventory,
//   loadAllData,
// }: {
//   setShowCreatePro: React.Dispatch<SetStateAction<boolean>>;
//   loadAllData: () => void;
//   allInventory: any;
// }) {
//   const [formData, setFormData] = useState<InventoryFormData>({
//     inventory_item_id: 0,
//     transaction_qty: 0,
//     transaction_type: "",
//     remark: "",
//     previous_qty: 0,
//   });

//   const [InventoryItems, setInventoryItems] = useState<any>(allInventory);

//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log(formData, "this is inventory formdata");
//     if (
//       !formData.inventory_item_id ||
//       !formData.transaction_qty ||
//       !formData.transaction_type ||
//       !formData.remark
//     ) {
//       alert("Please fill all required fields");
//       return;
//     }

//     try {
//       setLoading(true);
//       const item = allInventory.find(
//         (d: any) => d.id === formData.inventory_item_id
//       );
//       const payload = { ...formData, previous_qty: item.quantity };
//       await inventoryTransactionApi.createTransaction(payload);
//       alert("Inventory item added successfully");
//       setShowCreatePro(false);
//       loadAllData();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
//           <h2 className="text-xl font-bold text-white flex items-center gap-2">
//             <Package className="w-5 h-5" />
//             Add Inventory Item
//           </h2>
//           <button
//             onClick={() => setShowCreatePro(false)}
//             className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="p-6 space-y-4">
//           <SearchableSelect
//             options={allInventory.map((v: any) => ({
//               id: v.id,
//               name: v.name || v.vendor_name || v.display || "",
//             }))}
//             value={String(formData.inventory_item_id)}
//             onChange={(id) =>
//               setFormData({
//                 ...formData,
//                 inventory_item_id: Number(id),
//               })
//             }
//             placeholder="Select Vendor"
//             required
//           />

//           <select
//             value={formData.transaction_type}
//             onChange={(e) =>
//               setFormData({ ...formData, transaction_type: e.target.value })
//             }
//             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             required
//           >
//             <option value="">Select Transaction Type</option>
//             <option value="INWARD">INWARD</option>
//             <option value="OUTWARD">OUTWARD</option>
//           </select>

//           {/* Item Name */}
//           <div>
//             <label className="block text-sm font-medium mb-1">
//               Transaction Qty <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="number"
//               value={formData.transaction_qty}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   transaction_qty: Number(e.target.value),
//                 })
//               }
//               className="w-full px-4 py-3 border rounded-lg"
//               required
//             />
//           </div>

//           {/* Category */}

//           {/* Description */}
//           <div>
//             <label className="block text-sm font-medium mb-1">Remark</label>
//             <textarea
//               value={formData.remark}
//               onChange={(e) =>
//                 setFormData({ ...formData, remark: e.target.value })
//               }
//               className="w-full px-4 py-3 border rounded-lg"
//               rows={3}
//             />
//           </div>

//           {/* Footer */}
//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
//             >
//               <Save className="w-4 h-4" />
//               Save Item
//             </button>
//             <button
//               type="button"
//               onClick={() => setShowCreatePro(false)}
//               className="px-6 py-3 border rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
