// // src/components/MaterialOutForm.tsx
// import React, { useState, useEffect } from "react";
// import {
//   X,
//   Save,
//   Package,
//   User,
//   Calendar,
//   Phone,
//   MapPin,
//   AlertCircle,
//   Users,
//   Plus,
//   Trash2,
//   Truck,
// } from "lucide-react";
// import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
// import projectApi from "../../lib/projectApi";
// import { toast } from "sonner";

// interface MaterialOutFormProps {
//   setActiveFormTab: (show: string) => void;
//   allInventory: any[];
//   loadAllData: () => void;
//   setLoadTableData: any;
// }

// interface Vendor {
//   id: number;
//   name: string;
//   phone: string;
//   type: "CONTRACTOR" | "SUBCONTRACTOR" | "SUPPLIER" | "OTHER";
// }

// interface MaterialItem {
//   id: number;
//   materialId: number;
//   materialName: string;
//   quantity: string;
//   unit: string;
//   currentStock: number;
//   reorder_qty: number;
// }

// interface MaterialOutFormData {
//   receiver_name: string;
//   receiver_phone: string;
//   delivery_location: string;
//   receiving_date: string;
//   remark: string;
//   vendorId: number;
//   vendorName: string;
//   issuedTo: string;
//   phoneNumber: string;
//   deliveryLocation: string;
//   issueDate: string;
//   purpose: string;
//   materials: MaterialItem[];
// }

// export default function MaterialOutForm({
//   setActiveFormTab,
//   allInventory,
//   loadAllData,
//   setLoadTableData,
// }: MaterialOutFormProps) {
//   console.log("allInventory from material out", allInventory);
//   const [loading, setLoading] = useState(false);
//   const [showMaterialSelector, setShowMaterialSelector] = useState(false);
//   const [materialSearch, setMaterialSearch] = useState("");

//   // Vendors list with dropdown
//   const [vendors] = useState<Vendor[]>([
//     {
//       id: 1,
//       name: "John Doe (Contractor)",
//       phone: "9876543210",
//       type: "CONTRACTOR",
//     },
//     {
//       id: 2,
//       name: "ABC Construction",
//       phone: "9876543211",
//       type: "CONTRACTOR",
//     },
//     { id: 3, name: "XYZ Builders", phone: "9876543212", type: "SUBCONTRACTOR" },
//     { id: 4, name: "PQR Suppliers", phone: "9876543213", type: "SUPPLIER" },
//     {
//       id: 5,
//       name: "Site Supervisor - Building A",
//       phone: "9876543214",
//       type: "OTHER",
//     },
//     { id: 6, name: "Maintenance Team", phone: "9876543215", type: "OTHER" },
//   ]);
//   const [allProjects, setAllProjects] = useState<any>([]);

//   const [formData, setFormData] = useState<MaterialOutFormData>({
//     receiver_name: "",
//     receiver_phone: "",
//     delivery_location: "",
//     receiving_date: "",
//     remark: "",
//     vendorId: 0,
//     vendorName: "",
//     issuedTo: "",
//     phoneNumber: "",
//     deliveryLocation: "",
//     issueDate: new Date().toISOString().split("T")[0],
//     purpose: "",
//     materials: [],
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
//   useEffect(() => {
//     loadProjects();
//   }, []);

//   const handleInputChange = (
//     field: keyof MaterialOutFormData,
//     value: string | number
//   ) => {
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   // Add material to the list
//   const addMaterial = (inventoryItem: any) => {
//     // Check if material already exists in the list
//     const existingIndex = formData.materials.findIndex(
//       (item) => item.materialId === inventoryItem.id
//     );

//     if (existingIndex !== -1) {
//       // If exists, update quantity
//       const updatedMaterials = [...formData.materials];
//       const currentQty =
//         parseFloat(updatedMaterials[existingIndex].quantity) || 0;
//       updatedMaterials[existingIndex].quantity = (currentQty + 1).toString();
//       setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
//     } else {
//       // Add new material
//       const newMaterial: MaterialItem = {
//         id: Date.now() + Math.random(), // Temporary ID
//         materialId: inventoryItem.item_id,
//         materialName: inventoryItem.item_name || inventoryItem.name,
//         quantity: "1",
//         unit: inventoryItem.unit,
//         currentStock: inventoryItem.quantity,
//         reorder_qty: inventoryItem.reorder_qty,
//       };

//       setFormData((prev) => ({
//         ...prev,
//         materials: [...prev.materials, newMaterial],
//       }));
//     }

//     setShowMaterialSelector(false);
//     setMaterialSearch("");
//   };

//   // Update material quantity
//   const updateMaterialQuantity = (id: number, quantity: string) => {
//     const updatedMaterials = formData.materials.map((item) =>
//       item.id === id ? { ...item, quantity } : item
//     );
//     setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
//   };

//   // Remove material from list
//   const removeMaterial = (id: number) => {
//     const updatedMaterials = formData.materials.filter(
//       (item) => item.id !== id
//     );
//     setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
//   };

//   // Filter inventory items for selection
//   const filteredInventory = allInventory.filter((item) => {
//     const searchTerm = materialSearch.toLowerCase();
//     return (
//       (item.item_name || "").toLowerCase().includes(searchTerm) ||
//       (item.description || "").toLowerCase().includes(searchTerm)
//     );
//   });

//   // Check if all materials have valid quantities
//   const validateMaterials = () => {
//     for (const material of formData.materials) {
//       if (!material.quantity || parseFloat(material.quantity) <= 0) {
//         toast.error(
//           `Please enter a valid quantity for ${material.materialName}`
//         );
//         return false;
//       }

//       const stockItem = allInventory.find(
//         (item) => item.id === material.materialId
//       );
//       if (stockItem && parseFloat(material.quantity) > stockItem.quantity) {
//         toast.error(
//           `Insufficient stock for ${material.materialName}! Available: ${stockItem.quantity} ${stockItem.unit}`
//         );
//         return false;
//       }
//     }
//     return true;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!formData.receiver_name || formData.receiver_name.length < 3) {
//       toast.error("Please enter valid receiver name");
//       return;
//     }

//     if (formData.receiver_phone.length !== 10) {
//       toast.error("Please enter valid mobile number.");
//       return;
//     }

//     if (!formData.delivery_location || formData.delivery_location.length < 3) {
//       toast.error("Please enter valid delivery location");
//       return;
//     }
//     if (!formData.receiving_date || formData.receiving_date.length === 0) {
//       toast.error("Please select valid receiving date.");
//       return;
//     }
//     if (formData.materials.length === 0) {
//       toast.error("Add Material");
//     }

//     try {
//       setLoading(true);

//       // Prepare data for API call
//       const submissionData = {
//         receiver_name: formData.receiver_name,
//         receiver_phone: formData.receiver_phone,
//         receiving_date: formData.receiving_date,
//         delivery_location: formData.delivery_location,
//         remark: formData.remark,
//         materials: formData.materials.map((material) => ({
//           materialId: material.materialId,
//           materialName: material.materialName,
//           quantity: parseFloat(material.quantity),
//           unit: material.unit,
//         })),
//       };

//       const result =
//         inventoryTransactionApi.createTransactionOut(submissionData);
//       setLoadTableData(result);
//       loadAllData();
//       toast.success("Materials issued successfully!");
//       setActiveFormTab("");
//     } catch (error) {
//       console.error("Error issuing materials:", error);
//       toast.error("Failed to issue materials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       receiver_name: "",
//       receiver_phone: "",
//       delivery_location: "",
//       receiving_date: "",
//       remark: "",
//       vendorId: 0,
//       vendorName: "",
//       issuedTo: "",
//       phoneNumber: "",
//       deliveryLocation: "",
//       issueDate: new Date().toISOString().split("T")[0],
//       purpose: "",
//       materials: [],
//     });
//     setMaterialSearch("");
//   };

//   // Calculate total materials count
//   const totalItems = formData.materials.length;
//   const totalQuantity = formData.materials.reduce(
//     (sum, item) => sum + (parseFloat(item.quantity) || 0),
//     0
//   );

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
//           <h2 className="text-[0.9rem] md:text-xl font-bold text-white flex items-center gap-2">
//             <Package className="w-5 h-5" />
//             Material Out
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
//         <div className="my-3 px-6 py-3 min-h-300 max-h-[530px] overflow-y-scroll rounded-b-lg">
//           <form onSubmit={handleSubmit} className="space-y-3">
//             {/* Vendor Selection */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Contact Person <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                   <input
//                     type="text"
//                     value={formData.receiver_name}
//                     onChange={(e) => {
//                       if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
//                         toast.warning("Only alphabet allowed.");
//                         return;
//                       }
//                       handleInputChange("receiver_name", e.target.value);
//                     }}
//                     className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Contact person name"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                   <input
//                     type="tel"
//                     value={formData.receiver_phone}
//                     onChange={(e) => {
//                       if (!/^\d*$/.test(e.target.value)) {
//                         toast.warning("Enter Valid Phone Number.");
//                         return;
//                       }
//                       if (Number(e.target.value.length) <= 10) {
//                         handleInputChange("receiver_phone", e.target.value);
//                       } else {
//                         toast.warning("Only 10 digit mobile number allowed.");
//                       }
//                     }}
//                     className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter phone number"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Delivery Location <span className="text-red-500">*</span>
//                 </label>

//                 <div className="relative">
//                   <select
//                     value={`${formData.delivery_location}`}
//                     onChange={(e) =>
//                       handleInputChange("delivery_location", e.target.value)
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
//             </div>

//             {/* Phone & Purpose */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Issue Date <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
//                   <input
//                     type="date"
//                     value={formData.receiving_date}
//                     onChange={(e) =>
//                       handleInputChange("receiving_date", e.target.value)
//                     }
//                     className="w-full pl-10 pr-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Purpose
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.remark}
//                   onChange={(e) => handleInputChange("remark", e.target.value)}
//                   className="w-full px-4 py-2 text-sm outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   placeholder="Purpose of issue"
//                 />
//               </div>
//             </div>

//             {/* Materials Section */}
//             <div className="border-t pt-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold text-gray-800">
//                   Materials
//                 </h3>
//                 <button
//                   type="button"
//                   onClick={() => setShowMaterialSelector(true)}
//                   className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
//                 >
//                   <Plus className="w-4 h-4" /> Add Material
//                 </button>
//               </div>

//               {formData.materials.length === 0 ? (
//                 <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
//                   <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                   <p className="text-gray-600">No materials added yet</p>
//                   <p className="text-sm text-gray-500 mt-1">
//                     Click "Add Material" to select materials to issue
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-3 overflow-x-auto md:overflow-hidden">
//                   {formData.materials.map((material) => (
//                     <div
//                       key={material.id}
//                       className="bg-gray-50 p-4 rounded-lg border border-gray-200 w-[600px] md:w-full"
//                     >
//                       <div className="grid grid-cols-12 gap-3 items-center">
//                         <div className="col-span-4">
//                           <label className="text-xs text-gray-600">
//                             Material
//                           </label>
//                           <p className="font-medium text-gray-800">
//                             {material.materialName}
//                           </p>
//                           <div className="flex items-center gap-2 mt-1">
//                             <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
//                               Stock: {material.currentStock} {material.unit}
//                             </span>
//                             {material.currentStock <= material.reorder_qty && (
//                               <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
//                                 <AlertCircle className="w-3 h-3" />
//                                 Low Stock
//                               </span>
//                             )}
//                           </div>
//                         </div>
//                         <div className="col-span-3">
//                           <label className="text-xs text-gray-600 mb-1 block">
//                             In Stock <span className="text-red-500">*</span>
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="number"
//                               value={material.currentStock}
//                               disabled
//                               className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               min="0.01"
//                               step="0.01"
//                               required
//                             />
//                             <span className="text-sm text-gray-600">
//                               {material.unit}
//                             </span>
//                           </div>
//                           {parseFloat(material.quantity) >
//                             material.currentStock && (
//                             <p className="text-xs text-red-600 mt-1">
//                               Exceeds available stock!
//                             </p>
//                           )}
//                         </div>

//                         <div className="col-span-3">
//                           <label className="text-xs text-gray-600 mb-1 block">
//                             Quantity <span className="text-red-500">*</span>
//                           </label>
//                           <div className="flex items-center gap-2">
//                             <input
//                               type="text"
//                               value={material.quantity}
//                               onChange={(e) => {
//                                 if (
//                                   !/^\d*\.?\d*$/.test(e.target.value) ||
//                                   Number(e.target.value) < 0
//                                 )
//                                   return;
//                                 if (
//                                   Number(e.target.value) >
//                                   Number(material.currentStock)
//                                 ) {
//                                   toast.warning(
//                                     "Entered Quantity is larger than stock quantity."
//                                   );
//                                   return;
//                                 }
//                                 updateMaterialQuantity(
//                                   material.id,
//                                   e.target.value
//                                 );
//                               }}
//                               className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                               min="0.01"
//                               step="0.01"
//                               required
//                             />
//                             <span className="text-sm text-gray-600">
//                               {material.unit}
//                             </span>
//                           </div>
//                           {parseFloat(material.quantity) >
//                             material.currentStock && (
//                             <p className="text-xs text-red-600 mt-1">
//                               Exceeds available stock!
//                             </p>
//                           )}
//                         </div>

//                         <div className="col-span-2 flex justify-end">
//                           <button
//                             type="button"
//                             onClick={() => removeMaterial(material.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Remove"
//                           >
//                             <Trash2 className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Submit Button */}
//             <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
//               <button
//                 type="submit"
//                 disabled={loading || formData.materials.length === 0}
//                 className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
//               >
//                 <Truck className="w-5 h-5" />
//                 {loading ? "Processing..." : "Material Out"}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => {
//                   setActiveFormTab("");
//                   resetForm();
//                 }}
//                 className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//               >
//                 Cancel
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Material Selector Modal */}
//       {showMaterialSelector && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
//               <h3 className="text-xl font-bold text-white">Select Materials</h3>
//               <button
//                 onClick={() => {
//                   setShowMaterialSelector(false);
//                   setMaterialSearch("");
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <div className="p-4 border-b">
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search materials by name..."
//                   value={materialSearch}
//                   onChange={(e) => setMaterialSearch(e.target.value)}
//                   className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
//               <div className="grid grid-cols-1 gap-3">
//                 {filteredInventory.length === 0 ? (
//                   <div className="p-6 text-center text-gray-500">
//                     No materials found
//                   </div>
//                 ) : (
//                   filteredInventory.map((item) => {
//                     const existingMaterial = formData.materials.find(
//                       (m) => m.materialId === item.id
//                     );
//                     const isLowStock =
//                       item.quantity <= item.reorder_qty && item.quantity > 0;
//                     const outOfStock = item.quantity === 0;
//                     return (
//                       <button
//                         type="button"
//                         disabled={item.quantity === 0}
//                         key={item.id}
//                         onClick={() => addMaterial(item)}
//                         className={`p-4 border rounded-lg cursor-pointer transition ${
//                           existingMaterial
//                             ? "bg-blue-50 border-blue-300"
//                             : "border-gray-200 hover:bg-blue-50 hover:border-blue-300"
//                         }`}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <p className="font-medium text-gray-800">
//                                 {item.item_name || item.name}
//                               </p>
//                               {existingMaterial && (
//                                 <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
//                                   Added ({existingMaterial.quantity} {item.unit}
//                                   )
//                                 </span>
//                               )}
//                               {isLowStock && (
//                                 <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded flex items-center gap-1">
//                                   <AlertCircle className="w-3 h-3" />
//                                   Low Stock
//                                 </span>
//                               )}
//                               {outOfStock && (
//                                 <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
//                                   <AlertCircle className="w-3 h-3" />
//                                   Out Of Stock
//                                 </span>
//                               )}
//                             </div>
//                             <p className="text-sm text-gray-600 mt-1">
//                               Available: {item.quantity} {item.unit}
//                             </p>
//                             {item.description && (
//                               <p className="text-xs text-gray-500 mt-1">
//                                 {item.description}
//                               </p>
//                             )}
//                           </div>
//                           <div className="text-right">
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 addMaterial(item);
//                               }}
//                               className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
//                             >
//                               {existingMaterial ? "Add More" : "Add"}
//                             </button>
//                           </div>
//                         </div>
//                       </button>
//                     );
//                   })
//                 )}
//               </div>
//             </div>

//             <div className="p-4 border-t bg-gray-50">
//               <div className="flex justify-between items-center">
//                 <div className="text-sm text-gray-600">
//                   {formData.materials.length > 0 && (
//                     <span>
//                       {formData.materials.length} item
//                       {formData.materials.length !== 1 ? "s" : ""} selected
//                     </span>
//                   )}
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowMaterialSelector(false);
//                     setMaterialSearch("");
//                   }}
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//                 >
//                   Done
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/MaterialOutForm.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  User,
  Calendar,
  Phone,
  MapPin,
  AlertCircle,
  Plus,
  Trash2,
  Truck,
  ChevronDown,
  ClipboardCheck,
  Layers,
  Search,
  Box,
} from "lucide-react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import projectApi from "../../lib/projectApi";
import { toast } from "sonner";

interface MaterialOutFormProps {
  setActiveFormTab: (show: string) => void;
  allInventory: any[];
  loadAllData: () => void;
  setLoadTableData: any;
}

interface MaterialItem {
  id: number;
  materialId: number;
  materialName: string;
  quantity: string;
  unit: string;
  currentStock: number;
  reorder_qty: number;
}

interface MaterialOutFormData {
  receiver_name: string;
  receiver_phone: string;
  delivery_location: string;
  receiving_date: string;
  remark: string;
  vendorId: number;
  vendorName: string;
  issuedTo: string;
  phoneNumber: string;
  deliveryLocation: string;
  issueDate: string;
  purpose: string;
  materials: MaterialItem[];
}

export default function MaterialOutForm({
  setActiveFormTab,
  allInventory,
  loadAllData,
  setLoadTableData,
}: MaterialOutFormProps) {
  const [loading, setLoading] = useState(false);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [materialSearch, setMaterialSearch] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  const [allProjects, setAllProjects] = useState<any>([]);

  const [formData, setFormData] = useState<MaterialOutFormData>({
    receiver_name: "",
    receiver_phone: "",
    delivery_location: "",
    receiving_date: new Date().toISOString().split("T")[0],
    remark: "",
    vendorId: 0,
    vendorName: "",
    issuedTo: "",
    phoneNumber: "",
    deliveryLocation: "",
    issueDate: new Date().toISOString().split("T")[0],
    purpose: "",
    materials: [],
  });

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showMaterialSelector &&
        selectorRef.current &&
        !selectorRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest(
          '[data-material-selector="true"]',
        )
      ) {
        setShowMaterialSelector(false);
        setMaterialSearch("");
      }
      if (
        !showMaterialSelector &&
        formRef.current &&
        !formRef.current.contains(event.target as Node)
      ) {
        setActiveFormTab("");
        resetForm();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMaterialSelector, setActiveFormTab]);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data: any = await projectApi.getProjects();
      if (data.success) {
        setAllProjects(data.data);
        return;
      }
      setAllProjects([]);
    } catch (err) {
      console.warn("loadProjects failed", err);
      setAllProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleInputChange = (
    field: keyof MaterialOutFormData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Add material to the list
  const addMaterial = (inventoryItem: any) => {
    // Use the correct ID property
    const materialId = inventoryItem.item_id;

    // Check if material already exists in the list
    const existingIndex = formData.materials.findIndex(
      (item) => item.materialId === materialId,
    );

    if (existingIndex !== -1) {
      // If exists, update quantity
      const updatedMaterials = [...formData.materials];
      const currentQty =
        parseFloat(updatedMaterials[existingIndex].quantity) || 0;
      updatedMaterials[existingIndex].quantity = (currentQty + 1).toString();
      setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
      toast.success(
        `Increased quantity for ${inventoryItem.item_name || inventoryItem.name}`,
      );
    } else {
      // Add new material
      const newMaterial: MaterialItem = {
        id: Date.now() + Math.random(),
        materialId: materialId,
        materialName: inventoryItem.item_name || inventoryItem.name,
        quantity: "1",
        unit: inventoryItem.unit,
        currentStock: inventoryItem.quantity,
        reorder_qty: inventoryItem.reorder_qty,
      };

      setFormData((prev) => ({
        ...prev,
        materials: [...prev.materials, newMaterial],
      }));
      toast.success(
        `Added ${inventoryItem.item_name || inventoryItem.name} to list`,
      );
    }

    setShowMaterialSelector(false);
    setMaterialSearch("");
  };

  // Update material quantity
  const updateMaterialQuantity = (id: number, quantity: string) => {
    const updatedMaterials = formData.materials.map((item) =>
      item.id === id ? { ...item, quantity } : item,
    );
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
  };

  // Remove material from list
  const removeMaterial = (id: number) => {
    const material = formData.materials.find((item) => item.id === id);
    const updatedMaterials = formData.materials.filter(
      (item) => item.id !== id,
    );
    setFormData((prev) => ({ ...prev, materials: updatedMaterials }));
    if (material) {
      toast.info(`Removed ${material.materialName} from list`);
    }
  };

  // Filter inventory items for selection
  const filteredInventory = allInventory.filter((item) => {
    if (!item) return false;
    const searchTerm = materialSearch.toLowerCase();
    const itemName = (item.item_name || item.name || "").toLowerCase();
    const description = (item.description || "").toLowerCase();
    return itemName.includes(searchTerm) || description.includes(searchTerm);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.receiver_name || formData.receiver_name.length < 3) {
      toast.error("Please enter valid receiver name", {
        description: "Receiver name must be at least 3 characters long",
      });
      return;
    }

    if (formData.receiver_phone.length !== 10) {
      toast.error("Please enter valid mobile number", {
        description: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    if (!formData.delivery_location || formData.delivery_location.length < 3) {
      toast.error("Please enter valid delivery location", {
        description: "Select a valid delivery location from the list",
      });
      return;
    }

    if (!formData.receiving_date || formData.receiving_date.length === 0) {
      toast.error("Please select valid receiving date", {
        description: "Select a valid date",
      });
      return;
    }

    if (formData.materials.length === 0) {
      toast.error("Add at least one material", {
        description: "Please add materials to issue",
      });
      return;
    }

    // Validate materials
    for (const material of formData.materials) {
      if (!material.quantity || parseFloat(material.quantity) <= 0) {
        toast.error(
          `Please enter a valid quantity for ${material.materialName}`,
          {
            description: "Quantity must be greater than 0",
          },
        );
        return;
      }

      const stockItem = allInventory.find(
        (item) => (item.id || item.item_id) === material.materialId,
      );
      if (stockItem && parseFloat(material.quantity) > stockItem.quantity) {
        toast.error(`Insufficient stock for ${material.materialName}!`, {
          description: `Available: ${stockItem.quantity} ${stockItem.unit}`,
        });
        return;
      }
    }

    try {
      setLoading(true);

      // Prepare data for API call
      const submissionData = {
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        receiving_date: formData.receiving_date,
        delivery_location: formData.delivery_location,
        remark: formData.remark,
        materials: formData.materials.map((material) => ({
          materialId: material.materialId,
          materialName: material.materialName,
          quantity: parseFloat(material.quantity),
          unit: material.unit,
        })),
      };

      const result =
        await inventoryTransactionApi.createTransactionOut(submissionData);

      toast.success("Materials issued successfully!", {
        description: `${formData.materials.length} materials issued to ${formData.receiver_name}`,
      });

      setLoadTableData(result);
      loadAllData();
      resetForm();
      setActiveFormTab("");
    } catch (error: any) {
      console.error("Error issuing materials:", error);
      toast.error("Failed to issue materials", {
        description: error?.message || "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      receiver_name: "",
      receiver_phone: "",
      delivery_location: "",
      receiving_date: new Date().toISOString().split("T")[0],
      remark: "",
      vendorId: 0,
      vendorName: "",
      issuedTo: "",
      phoneNumber: "",
      deliveryLocation: "",
      issueDate: new Date().toISOString().split("T")[0],
      purpose: "",
      materials: [],
    });
    setMaterialSearch("");
  };

  // Calculate total materials count
  const totalQuantity = formData.materials.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0,
  );

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      <div
        ref={formRef}
        className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-2xl my-4 border border-gray-300/50 overflow-hidden max-h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 via-transparent to-gray-900/10"></div>
          <div className="absolute -right-10 top-0 bottom-0 w-40 bg-gradient-to-l from-[#b52124]/20 to-transparent -skew-x-12"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-gray-400/30">
              <Truck className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Material Out
                </h2>
              </div>
              <p className="text-xs text-gray-300/80 font-medium mt-1 hidden md:flex items-center gap-1">
                Monitor materials issued for site work and project usage.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveFormTab("");
              resetForm();
            }}
            className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95 relative z-10"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-grow">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Contact Person, Phone & Delivery Location */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#40423f] mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#b52124]" />
                  <span className="text-[#40423f]">Contact Person</span>
                  <span className="text-[#b52124]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a] group-focus-within:text-[#b52124] transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.receiver_name}
                    onChange={(e) => {
                      if (!/^[A-Za-z\s]*$/.test(e.target.value)) {
                        toast.warning("Only alphabet allowed.", {
                          description: "Please use letters only",
                        });
                        return;
                      }
                      handleInputChange("receiver_name", e.target.value);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f] placeholder-gray-500"
                    placeholder="Contact person name"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#40423f] mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#b52124]" />
                  <span className="text-[#40423f]">Phone Number</span>
                  <span className="text-[#b52124]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a] group-focus-within:text-[#b52124] transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={formData.receiver_phone}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        toast.warning("Enter Valid Phone Number.", {
                          description: "Please use numbers only",
                        });
                        return;
                      }
                      if (Number(e.target.value.length) <= 10) {
                        handleInputChange("receiver_phone", e.target.value);
                      } else {
                        toast.warning("Only 10 digit mobile number allowed.", {
                          description: "Please enter exactly 10 digits",
                        });
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f] placeholder-gray-500"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#40423f] mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#b52124]" />
                  <span className="text-[#40423f]">Delivery Location</span>
                  <span className="text-[#b52124]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a] group-focus-within:text-[#b52124] transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={`${formData.delivery_location}`}
                    onChange={(e) =>
                      handleInputChange("delivery_location", e.target.value)
                    }
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 bg-white/50 outline-none transition-all duration-200 appearance-none hover:border-gray-400 text-[#40423f]"
                    required
                  >
                    <option value="" className="text-gray-500">
                      Select delivery location
                    </option>
                    {allProjects.map((project: any) => (
                      <option
                        key={project.id}
                        value={project.location || project.loaction}
                        className="py-2 text-[#40423f]"
                      >
                        {project.name} - ({project.location})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Issue Date & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#40423f] mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#b52124]" />
                  <span className="text-[#40423f]">Issue Date</span>
                  <span className="text-[#b52124]">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a] group-focus-within:text-[#b52124] transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    type="date"
                    value={formData.receiving_date}
                    onChange={(e) =>
                      handleInputChange("receiving_date", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[#40423f] mb-1 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#b52124]" />
                  <span className="text-[#40423f]">Purpose</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a] group-focus-within:text-[#b52124] transition-colors">
                    <ClipboardCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.remark}
                    onChange={(e) =>
                      handleInputChange("remark", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f] placeholder-gray-500"
                    placeholder="Purpose of issue"
                  />
                </div>
              </div>
            </div>

            {/* Materials Section */}
            <div className="border-t border-gray-300 pt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#b52124]/10 rounded-lg">
                    <Layers className="w-4 h-4 text-[#b52124]" />
                  </div>
                  <h3 className="font-bold text-sm text-[#40423f]">
                    Materials to Issue
                  </h3>
                  {formData.materials.length > 0 && (
                    <span className="ml-2 text-xs font-medium text-[#40423f] bg-gray-100 px-2 py-1 rounded-full">
                      {formData.materials.length} items • {totalQuantity} total
                      qty
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowMaterialSelector(true)}
                  data-material-selector="true"
                  className="bg-gradient-to-r from-[#b52124] to-[#d43538] text-white px-4 py-2.5 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium flex items-center gap-2 group w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Add Material
                </button>
              </div>

              {formData.materials.length === 0 ? (
                <div className="bg-gradient-to-b from-gray-50/50 to-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center group hover:border-[#b52124]/30 transition-all duration-300">
                  <div className="p-4 bg-[#b52124]/5 rounded-2xl inline-block mb-4">
                    <Package className="w-10 h-10 md:w-12 md:h-12 text-[#b52124]/60" />
                  </div>
                  <p className="text-sm font-semibold text-[#40423f] mb-1">
                    No materials added yet
                  </p>
                  <p className="text-xs text-[#5a5d5a]">
                    Click "Add Material" to select materials to issue
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.materials.map((material) => {
                    const isLowStock =
                      material.currentStock <= material.reorder_qty;
                    return (
                      <div
                        key={material.id}
                        className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-2xl border border-gray-300 hover:border-gray-400 transition-all duration-200"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <div
                                className={`p-2 rounded-lg ${isLowStock ? "bg-amber-100" : "bg-[#b52124]/10"}`}
                              >
                                <Box
                                  className={`w-4 h-4 ${isLowStock ? "text-amber-600" : "text-[#b52124]"}`}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm text-[#40423f] break-words">
                                  {material.materialName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-[#5a5d5a] rounded-full font-medium">
                                    Stock: {material.currentStock}{" "}
                                    {material.unit}
                                  </span>
                                  {isLowStock && (
                                    <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Low Stock
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeMaterial(material.id)}
                              className="p-1.5 text-[#b52124] hover:bg-[#b52124]/10 rounded-xl transition-all duration-200 hover:scale-105 flex-shrink-0 ml-2"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <label className="text-xs text-[#5a5d5a] font-medium flex items-center gap-1">
                                <span>In Stock</span>
                                <span className="text-[#b52124]">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl bg-gray-50 text-[#40423f]">
                                  {material.currentStock}
                                </div>
                                <span className="text-sm text-[#5a5d5a] font-medium whitespace-nowrap">
                                  {material.unit}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-xs text-[#5a5d5a] font-medium flex items-center gap-1">
                                <span>Quantity to Issue</span>
                                <span className="text-[#b52124]">*</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={material.quantity}
                                  onChange={(e) => {
                                    if (
                                      !/^\d*\.?\d*$/.test(e.target.value) ||
                                      Number(e.target.value) < 0
                                    )
                                      return;
                                    if (
                                      Number(e.target.value) >
                                      Number(material.currentStock)
                                    ) {
                                      toast.warning(
                                        "Entered quantity exceeds available stock",
                                        {
                                          description: `Available: ${material.currentStock} ${material.unit}`,
                                        },
                                      );
                                      return;
                                    }
                                    updateMaterialQuantity(
                                      material.id,
                                      e.target.value,
                                    );
                                  }}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 text-[#40423f]"
                                  placeholder="Enter quantity"
                                  required
                                />
                                <span className="text-sm text-[#5a5d5a] font-medium whitespace-nowrap">
                                  {material.unit}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-300">
              <button
                type="submit"
                disabled={loading || formData.materials.length === 0}
                className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white py-3 px-6 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Material Out
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("");
                  resetForm();
                }}
                className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-[#40423f] hover:text-[#2a2c2a]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Material Selector Modal */}
      {showMaterialSelector && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[60] p-2 md:p-4">
          <div
            ref={selectorRef}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-md border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Select Material
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Choose from available inventory
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowMaterialSelector(false);
                  setMaterialSearch("");
                }}
                className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-300">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search material..."
                  value={materialSearch}
                  onChange={(e) => setMaterialSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f]"
                />
              </div>
            </div>

            {/* Material List */}
            <div className="p-2 overflow-y-auto flex-grow">
              <div className="space-y-2">
                {filteredInventory.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-[#40423f]">
                      No materials found
                    </p>
                    <p className="text-xs text-[#5a5d5a] mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  filteredInventory.map((item) => {
                    if (!item) return null;
                    const existingMaterial = formData.materials.find(
                      (m) => m.materialId === (item.id || item.item_id),
                    );
                    const isLowStock =
                      item.quantity <= item.reorder_qty && item.quantity > 0;
                    const outOfStock = item.quantity === 0;

                    return (
                      <button
                        type="button"
                        disabled={item.quantity === 0}
                        key={item.id || item.item_id}
                        onClick={() => addMaterial(item)}
                        data-material-selector="true"
                        className={`w-full p-3 md:p-4 text-left border rounded-2xl transition-all duration-200 ${
                          existingMaterial
                            ? "bg-[#b52124]/5 border-[#b52124]/30"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                        } ${item.quantity === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="text-left flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className={`p-1.5 rounded-lg ${isLowStock ? "bg-amber-100" : "bg-[#b52124]/10"} flex-shrink-0`}
                              >
                                <Box
                                  className={`w-3 h-3 ${isLowStock ? "text-amber-600" : "text-[#b52124]"}`}
                                />
                              </div>
                              <div className="font-medium text-sm text-[#40423f] truncate">
                                {item.item_name || item.name}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs text-[#5a5d5a]">
                                Stock: {item.quantity} {item.unit}
                              </span>
                              {isLowStock && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                                  Low Stock
                                </span>
                              )}
                              {outOfStock && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span
                              className={`px-2 md:px-3 py-1.5 rounded-lg text-xs font-medium ${
                                existingMaterial
                                  ? "bg-[#b52124] text-white"
                                  : "bg-[#b52124]/10 text-[#b52124]"
                              }`}
                            >
                              {existingMaterial ? "Add More" : "Add"}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-300 bg-gradient-to-r from-gray-50/50 to-transparent flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-xs text-[#5a5d5a]">
                  {formData.materials.length > 0 && (
                    <span className="font-medium">
                      {formData.materials.length} material(s) selected
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowMaterialSelector(false);
                    setMaterialSearch("");
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #b52124;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d43538;
        }
      `}</style>
    </div>
  );
}
