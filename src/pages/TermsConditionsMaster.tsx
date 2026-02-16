// import { useState, useEffect, useRef } from "react";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   FileText,
//   X,
//   Search,
//   Star,
//   Filter,
//   ChevronDown,
//   Package,
//   ReceiptText,
//   CheckSquare,
// } from "lucide-react";
// import TermsConditionsApi from "../lib/termsConditionsApi";
// import { TermsCondition } from "../lib/termsConditionsApi";
// import vendorApi from "../lib/vendorApi";
// import SearchableSelect from "../components/SearchableSelect";
// import MySwal from "../utils/swal";

// const CATEGORY_OPTIONS = [
//   {
//     name: "Category",
//     values: [
//       { value: "general", name: "General" },
//       { value: "payment", name: "Payment" },
//       { value: "delivery", name: "Delivery" },
//       { value: "quality", name: "Quality" },
//       { value: "warranty", name: "Warranty" },
//       { value: "tax", name: "Tax" },
//       { value: "legal", name: "Legal" },
//       { value: "returns", name: "Returns" },
//     ],
//   },
//   {
//     name: "Status",
//     values: [
//       { value: true, name: "Active" },
//       { value: false, name: "Inactive" },
//     ],
//   },
// ];

// export default function TermsConditionsMaster() {
//   const [terms, setTerms] = useState<TermsCondition[]>([]);
//   const [allVendors, setAllVendors] = useState<any>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const [activeTab, setActiveTab] = useState<string>("vendor");
//   const [formData, setFormData] = useState<TermsCondition>({
//     id: 0,
//     vendor_id: 0,
//     content: "",
//     category: "general",
//     is_default: false,
//     is_active: true,
//     created_at: "",
//   });
//   const [showFilterOptions, setShowFilterOptions] = useState(false);
//   const [showSubFilterOption, setShowSubFilterOption] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState<any>("");
//   const [filteredTerms, setFilteredTerms] = useState<TermsCondition[] | []>([]);

//   const loadAllVendors = async () => {
//     try {
//       const vendorRes = await vendorApi.getVendors();
//       setAllVendors(vendorRes ?? []);
//       console.log(vendorRes, "all vendors");
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const loadTerms = async () => {
//     setLoading(true);
//     try {
//       const response = await TermsConditionsApi.getAllTC();
//       setTerms(response ?? []);
//     } catch (err) {
//       console.error("Error reading terms (demo):", err);
//       setTerms([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // --- Load & seed ---
//   useEffect(() => {
//     loadAllVendors();
//     loadTerms();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     let data;
//     if (activeTab === "common") {
//       data = terms.filter((tc) => !tc.vendor_id);
//     } else {
//       data = terms.filter((tc) => tc.vendor_id);
//     }
//     setFilteredTerms(data);
//   }, [activeTab, terms]);

//   // --- Helpers ---

//   // --- CRUD handlers (localStorage-backed) ---
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     // console.log(formData, "from form submit");
//     // validation
//     if (
//       (!formData.vendor_id ||
//         !formData.content.trim() ||
//         !formData.category.trim()) &&
//       activeTab === "vendor"
//     ) {
//       alert("Please fill required fields: vender, Content, Category");
//       return;
//     }
//     if (
//       !formData.content.trim() ||
//       (!formData.category.trim() && activeTab === "common")
//     ) {
//       alert("Please fill required fields: Content, Category");
//       return;
//     }
//     const payload = {
//       vendor_id: formData.vendor_id,
//       content: formData.content,
//       category: formData.category,
//       is_default: formData.is_default,
//       is_active: formData.is_active,
//     };

//     if (editingId) {
//       try {
//         const updateRes: any = await TermsConditionsApi.updateTC(
//           editingId,
//           payload
//         );
//         if (updateRes.status) {
//           loadTerms();
//           alert("Terms Updated Successfully!");
//         } else {
//           alert("Terms Updated Faild!");
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     } else {
//       try {
//         const createRes: any = await TermsConditionsApi.createTC(payload);
//         if (createRes.status) {
//           loadTerms();
//           alert("Terms Created Successfully!");
//         } else {
//           alert("Terms Created Faild!");
//         }
//       } catch (error) {
//         console.log(error);
//       }
//     }

//     // persist(next);
//     setShowModal(false);
//     resetForm();
//   };

//   const handleEdit = (term: TermsCondition) => {
//     setEditingId(term.id || null);
//     setFormData({
//       vendor_id: term.vendor_id,
//       content: term.content,
//       category: term.category,
//       is_default: !!term.is_default,
//       is_active: term.is_active ?? true,
//       created_at: term.created_at ?? "",
//       id: term.id,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       const result: any = await MySwal.fire({
//         title: "Delete Term?",
//         text: "This action cannot be undone",
//         icon: "warning",
//         showCancelButton: true,
//       });
//       if (!result.isConfirmed) return;
//       const deleteRes = await TermsConditionsApi.deleteTC(id);
//       if (deleteRes.status) {
//         loadTerms();
//         alert("Terms deleted successfully!");
//       } else {
//         alert("Terms deleted Faild!");
//       }
//       // const next = terms.filter((t) => t.id !== id);
//       // persist(next);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const toggleDefault = async (id: number, currentStatus: boolean) => {
//     try {
//       const updateIsDefaultRes = await TermsConditionsApi.updateIsDefaultTC(
//         id,
//         !currentStatus
//       );
//       if (updateIsDefaultRes.status) {
//         if (currentStatus) {
//           alert("Set to default.");
//         } else {
//           alert("Removed From Default");
//         }
//         loadTerms();
//       } else {
//         alert("Faild to update default.");
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       id: 0,
//       vendor_id: 0,
//       content: "",
//       category: "general",
//       is_default: false,
//       is_active: true,
//       created_at: "",
//     });
//     setEditingId(null);
//   };

//   const filterForSearch = () => {
//     const data = terms.filter((term) => {
//       const q = searchTerm.toLowerCase();
//       return (
//         term.content.toLowerCase().includes(q) ||
//         term.category.toLowerCase().includes(q)
//       );
//     });
//     let d;
//     if (activeTab === "vendor") {
//       d = data.filter((tc) => tc.vendor_id);
//     } else {
//       d = data.filter((tc) => !tc.vendor_id);
//     }
//     setFilteredTerms(d);
//   };
//   useEffect(() => {
//     filterForSearch();
//   }, [terms]);

//   const filterData = () => {
//     let data: any = [];
//     if (activeTab === "vendor") {
//       if (typeof selectedFilter === "string") {
//         data = terms.filter(
//           (d) => d.category === selectedFilter && d.vendor_id
//         );
//       } else if (typeof selectedFilter === "boolean") {
//         data = terms.filter(
//           (d) => d.is_active && selectedFilter && d.vendor_id
//         );
//       } else {
//         data = terms.filter((d) => d.vendor_id);
//       }
//     } else {
//       if (typeof selectedFilter === "string") {
//         data = terms.filter(
//           (d) => d.category === selectedFilter && !d.vendor_id
//         );
//       } else if (typeof selectedFilter === "boolean") {
//         data = terms.filter(
//           (d) => d.is_active && selectedFilter && !d.vendor_id
//         );
//       } else {
//         data = terms.filter((d) => !d.vendor_id);
//       }
//     }
//     setFilteredTerms(data);
//   };
//   useEffect(() => {
//     filterData();
//   }, [selectedFilter]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node)
//       ) {
//         setShowFilterOptions(false); // hide ul
//         setShowSubFilterOption("");
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const getCategoryColor = (category: string) => {
//     const colors: any = {
//       payment: "bg-green-100 text-green-700",
//       delivery: "bg-blue-100 text-blue-700",
//       quality: "bg-purple-100 text-purple-700",
//       warranty: "bg-orange-100 text-orange-700",
//       tax: "bg-red-100 text-red-700",
//       legal: "bg-gray-100 text-gray-700",
//       returns: "bg-yellow-100 text-yellow-700",
//       general: "bg-slate-100 text-slate-700",
//     };
//     return colors[category] || "bg-gray-100 text-gray-700";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading terms...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-3">
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
//         <div className="flex border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab("vendor")}
//             className={`flex-1 px-6 py-3 font-medium transition ${
//               activeTab === "vendor"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <ReceiptText className="w-5 h-5" />
//               <span>Vender Terms & Conditions</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("common")}
//             className={`flex-1 px-6 py-3 font-medium transition ${
//               activeTab === "common"
//                 ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <ReceiptText className="w-5 h-5" />
//               <span>Common Terms & Conditions</span>
//             </div>
//           </button>
//         </div>
//       </div>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">
//             {activeTab === "vendor"
//               ? "Vendor Terms & Conditions Master"
//               : "Common Terms & Conditions Master"}
//           </h1>
//           <p className="text-gray-600 mt-1">
//             Manage terms and conditions for POs
//           </p>
//         </div>
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-4 h-4" />
//           {activeTab === "vendor" ? "Add Vendor Terms" : "Add Common Terms"}
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative flex items-center">
//           <Search className="absolute left-4 top-3.4 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search by title, content, or category..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//           <div ref={dropdownRef} className="relative">
//             <button
//               onClick={() => {
//                 setShowFilterOptions((prev) => !prev);
//               }}
//             >
//               <Filter className="mx-3 cursor-pointer" />
//             </button>
//             {showFilterOptions && (
//               <ul className="absolute bg-white shadow-lg -left-24 top-7 border border-slate-300 rounded-lg">
//                 <li className="w-40 pl-3 py-2 cursor-pointer font-sm">
//                   <button
//                     onClick={() => {
//                       setSelectedFilter(null);
//                     }}
//                   >
//                     Show All
//                   </button>
//                 </li>
//                 {CATEGORY_OPTIONS.map((d) => (
//                   <li className="w-40 pl-3 py-2 cursor-pointer font-sm">
//                     <button
//                       onClick={() => {
//                         setShowSubFilterOption(
//                           showSubFilterOption.length > 0 ||
//                             showSubFilterOption === d.name
//                             ? ""
//                             : d.name
//                         );
//                       }}
//                       className="flex justify-between items-center w-full"
//                     >
//                       {d.name}
//                       <ChevronDown />
//                     </button>
//                     {showSubFilterOption === d.name && (
//                       <ul className=" h-40 overflow-y-scroll">
//                         {d.values.map((i) => (
//                           <li
//                             className="px-6 py-2 hover:bg-slate-100 cursor-pointer font-sm"
//                             onClick={() => {
//                               console.log(i.value);
//                               setSelectedFilter(i.value);
//                             }}
//                           >
//                             {i.name}
//                           </li>
//                         ))}
//                       </ul>
//                     )}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4">
//         <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
//           <table className="min-w-full border-collapse">
//             <thead className="bg-gray-50">
//               <tr>
//                 {activeTab === "vendor" && (
//                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
//                     Vendor
//                   </th>
//                 )}
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
//                   Content
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
//                   Category
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
//                   Active
//                 </th>
//                 <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
//                   Action
//                 </th>
//               </tr>
//             </thead>

//             <tbody className="divide-y divide-gray-200">
//               {filteredTerms.map((term) => (
//                 <tr key={term.id} className="hover:bg-gray-50">
//                   {activeTab === "vendor" && (
//                     <td className="px-6 py-4 text-sm text-gray-700">
//                       {allVendors.find((v: any) => v.id === term.vendor_id)
//                         ?.name || "-"}
//                     </td>
//                   )}

//                   <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate">
//                     {term.content}
//                   </td>

//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
//                         term.category
//                       )}`}
//                     >
//                       {term.category.toUpperCase()}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         term.is_active
//                           ? "bg-green-100 text-green-700"
//                           : "bg-gray-100 text-gray-600"
//                       }`}
//                     >
//                       {term.is_active ? "ACTIVE" : "INACTIVE"}
//                     </span>
//                   </td>

//                   <td className="px-6 py-4">
//                     <button
//                       onClick={() => toggleDefault(term.id, !!term.is_default)}
//                       className={`p-1 rounded-lg transition ${
//                         term.is_default
//                           ? "text-green-600 bg-green-100 hover:bg-green-50"
//                           : "text-gray-500 hover:bg-gray-100"
//                       }`}
//                       title={
//                         term.is_default
//                           ? "Remove from default"
//                           : "Set as default"
//                       }
//                     >
//                       <CheckSquare
//                         className={`w-4 h-4 ${
//                           term.is_default ? "text-green-700" : ""
//                         }`}
//                       />
//                     </button>

//                     <button
//                       onClick={() => handleEdit(term)}
//                       className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                       title="Edit"
//                     >
//                       <Edit2 className="w-4 h-4" />
//                     </button>

//                     <button
//                       onClick={() => handleDelete(term.id)}
//                       className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                       title="Delete"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {filteredTerms.length === 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
//           <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">
//             No terms found
//           </h3>
//           <p className="text-gray-600">
//             {searchTerm
//               ? "Try a different search term"
//               : 'Click "Add Terms" to create your first term'}
//           </p>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white flex items-center">
//                 <ReceiptText className="w-6 h-6 mr-3" />
//                 {editingId ? "Edit Terms" : "Add Terms"}
//               </h2>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   resetForm();
//                 }}
//                 className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
//               >
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleSubmit}
//               className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
//             >
//               {activeTab === "vendor" && (
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Vendor <span className="text-red-500">*</span>
//                   </label>
//                   <SearchableSelect
//                     options={allVendors.map((v: any) => ({
//                       id: v.id,
//                       name: v.name || v.vendor_name || v.display || "",
//                     }))}
//                     value={Number(formData.vendor_id)}
//                     onChange={(id) =>
//                       setFormData({ ...formData, vendor_id: Number(id) })
//                     }
//                     placeholder="Select Vendor"
//                     required
//                   />
//                 </div>
//               )}
//               <div className="space-y-6 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     value={formData.category}
//                     onChange={(e) =>
//                       setFormData({ ...formData, category: e.target.value })
//                     }
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     required
//                   >
//                     <option value="general">General</option>
//                     <option value="payment">Payment</option>
//                     <option value="delivery">Delivery</option>
//                     <option value="quality">Quality</option>
//                     <option value="warranty">Warranty</option>
//                     <option value="tax">Tax</option>
//                     <option value="legal">Legal</option>
//                     <option value="returns">Returns</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Terms & Condition <span className="text-red-500">*</span>
//                   </label>
//                   <textarea
//                     value={formData.content}
//                     onChange={(e) =>
//                       setFormData({ ...formData, content: e.target.value })
//                     }
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Enter the full terms & conditions text..."
//                     required
//                   />
//                 </div>

//                 <div className="flex items-center gap-6">
//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="is_active"
//                       checked={formData.is_active}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           is_active: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <label
//                       htmlFor="is_active"
//                       className="ml-2 text-sm font-medium text-gray-700"
//                     >
//                       Active
//                     </label>
//                   </div>

//                   <div className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id="is_default"
//                       checked={formData.is_default}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           is_default: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <label
//                       htmlFor="is_default"
//                       className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2"
//                     >
//                       <Star className="w-4 h-4 text-yellow-600" />
//                       Set as default (auto-include in POs)
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-6 border-t">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
//                 >
//                   {editingId ? "Update Terms" : "Add Terms"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// import { useState, useEffect, useRef } from "react";
// import {
//   Plus,
//   Edit2,
//   Trash2,
//   FileText,
//   X,
//   Search,
//   Star,
//   Filter,
//   ChevronDown,
//   Package,
//   ReceiptText,
//   CheckSquare,
//   Eye,
//   Square,
//   Loader2,
// } from "lucide-react";
// import TermsConditionsApi from "../lib/termsConditionsApi";
// import { TermsCondition } from "../lib/termsConditionsApi";
// import vendorApi from "../lib/vendorApi";
// import SearchableSelect from "../components/SearchableSelect";
// import MySwal from "../utils/swal";
// import { toast } from "sonner";

// const CATEGORY_OPTIONS = [
//   {
//     name: "Category",
//     values: [
//       { value: "general", name: "General" },
//       { value: "payment", name: "Payment" },
//       { value: "delivery", name: "Delivery" },
//       { value: "quality", name: "Quality" },
//       { value: "warranty", name: "Warranty" },
//       { value: "tax", name: "Tax" },
//       { value: "legal", name: "Legal" },
//       { value: "returns", name: "Returns" },
//     ],
//   },
//   {
//     name: "Status",
//     values: [
//       { value: true, name: "Active" },
//       { value: false, name: "Inactive" },
//     ],
//   },
// ];

// export default function TermsConditionsMaster() {
//   const [terms, setTerms] = useState<TermsCondition[]>([]);
//   const [allVendors, setAllVendors] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");

//   // Column search states
//   const [searchContent, setSearchContent] = useState("");
//   const [searchCategory, setSearchCategory] = useState("");
//   const [searchVendor, setSearchVendor] = useState("");

//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<number | null>(null);
//   const dropdownRef = useRef<HTMLDivElement | null>(null);
//   const [activeTab, setActiveTab] = useState<string>("vendor");
//   const [formData, setFormData] = useState<TermsCondition>({
//     id: 0,
//     vendor_id: 0,
//     content: "",
//     category: "general",
//     is_default: false,
//     is_active: true,
//     created_at: "",
//   });

//   // Checkbox states
//   const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
//   const [selectAll, setSelectAll] = useState(false);

//   // Filter states
//   const [showFilterOptions, setShowFilterOptions] = useState(false);
//   const [showSubFilterOption, setShowSubFilterOption] = useState("");
//   const [selectedFilter, setSelectedFilter] = useState<any>("");
//   const [filteredTerms, setFilteredTerms] = useState<TermsCondition[] | []>([]);
//   const [submitting, setSubmitting] = useState(false);

//   const loadAllVendors = async () => {
//     try {
//       const vendorRes = await vendorApi.getVendors();
//       setAllVendors(vendorRes ?? []);
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to load vendors");
//     }
//   };

//   const loadTerms = async () => {
//     setLoading(true);
//     try {
//       const response = await TermsConditionsApi.getAllTC();
//       setTerms(response ?? []);
//       setFilteredTerms(response ?? []);
//     } catch (err) {
//       console.error("Error loading terms:", err);
//       toast.error("Failed to load terms");
//       setTerms([]);
//       setFilteredTerms([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadAllVendors();
//     loadTerms();
//   }, []);

//   useEffect(() => {
//     let filtered = [...terms];

//     // Filter by tab
//     if (activeTab === "common") {
//       filtered = filtered.filter((tc) => !tc.vendor_id);
//     } else {
//       filtered = filtered.filter((tc) => tc.vendor_id);
//     }

//     // Column searches
//     if (searchContent) {
//       filtered = filtered.filter((term) =>
//         term.content.toLowerCase().includes(searchContent.toLowerCase())
//       );
//     }

//     if (searchCategory) {
//       filtered = filtered.filter((term) =>
//         term.category.toLowerCase().includes(searchCategory.toLowerCase())
//       );
//     }

//     if (searchVendor && activeTab === "vendor") {
//       filtered = filtered.filter((term) => {
//         const vendor = allVendors.find((v) => v.id === term.vendor_id);
//         return vendor?.name?.toLowerCase().includes(searchVendor.toLowerCase());
//       });
//     }

//     // Global search (backward compatibility)
//     if (searchTerm) {
//       const q = searchTerm.toLowerCase();
//       filtered = filtered.filter((term) =>
//         term.content.toLowerCase().includes(q) ||
//         term.category.toLowerCase().includes(q)
//       );
//     }

//     // Apply advanced filters
//     if (selectedFilter !== "") {
//       if (typeof selectedFilter === "string") {
//         filtered = filtered.filter((d) => d.category === selectedFilter);
//       } else if (typeof selectedFilter === "boolean") {
//         filtered = filtered.filter((d) => d.is_active === selectedFilter);
//       }
//     }

//     setFilteredTerms(filtered);
//     setSelectAll(false);
//     setSelectedItems(new Set());
//   }, [terms, activeTab, searchContent, searchCategory, searchVendor, searchTerm, selectedFilter, allVendors]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.content.trim() || !formData.category.trim()) {
//       toast.error("Please fill all required fields");
//       return;
//     }

//     if (activeTab === "vendor" && !formData.vendor_id) {
//       toast.error("Please select a vendor");
//       return;
//     }

//     const payload = {
//       vendor_id: formData.vendor_id,
//       content: formData.content,
//       category: formData.category,
//       is_default: formData.is_default,
//       is_active: formData.is_active,
//     };

//     try {
//       setSubmitting(true);
//       if (editingId) {
//         const updateRes: any = await TermsConditionsApi.updateTC(editingId, payload);
//         if (updateRes.status) {
//           await loadTerms();
//           toast.success("Terms updated successfully!");
//         } else {
//           toast.error("Failed to update terms");
//         }
//       } else {
//         const createRes: any = await TermsConditionsApi.createTC(payload);
//         if (createRes.status) {
//           await loadTerms();
//           toast.success("Terms created successfully!");
//         } else {
//           toast.error("Failed to create terms");
//         }
//       }
//       setShowModal(false);
//       resetForm();
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleEdit = (term: TermsCondition) => {
//     setEditingId(term.id || null);
//     setFormData({
//       vendor_id: term.vendor_id,
//       content: term.content,
//       category: term.category,
//       is_default: !!term.is_default,
//       is_active: term.is_active ?? true,
//       created_at: term.created_at ?? "",
//       id: term.id,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: number) => {
//     try {
//       const result: any = await MySwal.fire({
//         title: "Delete Term?",
//         text: "This action cannot be undone",
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonColor: "#C62828",
//         cancelButtonColor: "#6B7280",
//         confirmButtonText: "Delete",
//         cancelButtonText: "Cancel",
//       });

//       if (!result.isConfirmed) return;

//       const deleteRes = await TermsConditionsApi.deleteTC(id);
//       if (deleteRes.status) {
//         await loadTerms();
//         toast.success("Term deleted successfully!");
//       } else {
//         toast.error("Failed to delete term");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong");
//     }
//   };

//   const handleBulkDelete = async () => {
//     if (selectedItems.size === 0) {
//       toast.error("Please select terms to delete");
//       return;
//     }

//     const result: any = await MySwal.fire({
//       title: `Delete ${selectedItems.size} Term(s)?`,
//       text: "This action cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#C62828",
//       cancelButtonColor: "#6B7280",
//       confirmButtonText: `Delete (${selectedItems.size})`,
//       cancelButtonText: "Cancel",
//     });

//     if (!result.isConfirmed) return;

//     setSubmitting(true);
//     try {
//       await Promise.all(
//         Array.from(selectedItems).map((id) => TermsConditionsApi.deleteTC(id))
//       );
//       await loadTerms();
//       setSelectedItems(new Set());
//       setSelectAll(false);
//       toast.success(`${selectedItems.size} term(s) deleted successfully!`);
//     } catch (error) {
//       console.error("Error deleting terms:", error);
//       toast.error("Failed to delete terms");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const toggleDefault = async (id: number, currentStatus: boolean) => {
//     try {
//       const updateIsDefaultRes = await TermsConditionsApi.updateIsDefaultTC(
//         id,
//         !currentStatus
//       );
//       if (updateIsDefaultRes.status) {
//         await loadTerms();
//         toast.success(
//           currentStatus
//             ? "Removed from default"
//             : "Set as default"
//         );
//       } else {
//         toast.error("Failed to update default status");
//       }
//     } catch (error) {
//       console.log(error);
//       toast.error("Something went wrong");
//     }
//   };

//   // Checkbox handlers
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedItems(new Set());
//     } else {
//       const allIds = new Set(filteredTerms.map((term) => term.id));
//       setSelectedItems(allIds);
//     }
//     setSelectAll(!selectAll);
//   };

//   const handleSelectItem = (id: number) => {
//     const newSelected = new Set(selectedItems);
//     if (newSelected.has(id)) {
//       newSelected.delete(id);
//     } else {
//       newSelected.add(id);
//     }
//     setSelectedItems(newSelected);
//     setSelectAll(newSelected.size === filteredTerms.length);
//   };

//   const resetForm = () => {
//     setFormData({
//       id: 0,
//       vendor_id: 0,
//       content: "",
//       category: "general",
//       is_default: false,
//       is_active: true,
//       created_at: "",
//     });
//     setEditingId(null);
//   };

//   const resetFilters = () => {
//     setSelectedFilter("");
//     setSearchContent("");
//     setSearchCategory("");
//     setSearchVendor("");
//     setSearchTerm("");
//     setShowFilterOptions(false);
//   };

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (
//         dropdownRef.current &&
//         !dropdownRef.current.contains(e.target as Node)
//       ) {
//         setShowFilterOptions(false);
//         setShowSubFilterOption("");
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const getCategoryColor = (category: string) => {
//     const colors: any = {
//       payment: "bg-green-100 text-green-700",
//       delivery: "bg-blue-100 text-blue-700",
//       quality: "bg-purple-100 text-purple-700",
//       warranty: "bg-orange-100 text-orange-700",
//       tax: "bg-red-100 text-red-700",
//       legal: "bg-gray-100 text-gray-700",
//       returns: "bg-yellow-100 text-yellow-700",
//       general: "bg-slate-100 text-slate-700",
//     };
//     return colors[category] || "bg-gray-100 text-gray-700";
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading terms...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       {/* Header with Bulk Actions */}
//       <div className="mb-6">
//         <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] rounded-xl shadow-md p-5">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
//                 <FileText className="w-6 h-6 text-white" />
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold text-white">Terms & Conditions Master</h1>
//                 <p className="text-sm text-white/90 font-medium mt-0.5">
//                   Manage terms and conditions for POs
//                 </p>
//               </div>
//             </div>
//             <div className="flex flex-wrap items-center gap-2">
//               {selectedItems.size > 0 && (
//                 <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
//                   <button
//                     onClick={handleBulkDelete}
//                     disabled={submitting}
//                     className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {submitting ? (
//                       <Loader2 className="w-3 h-3 animate-spin" />
//                     ) : (
//                       <Trash2 className="w-3 h-3" />
//                     )}
//                     Delete ({selectedItems.size})
//                   </button>
//                   <div className="text-xs text-white font-medium px-2 py-1 bg-white/20 rounded-lg">
//                     {selectedItems.size} selected
//                   </div>
//                 </div>
//               )}
//               <button
//                 onClick={() => {
//                   resetForm();
//                   setShowModal(true);
//                 }}
//                 className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
//               >
//                 <Plus className="w-5 h-5" />
//                 Add Terms
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tab Navigation */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
//         <div className="flex flex-col sm:flex-row border-b border-gray-200">
//           <button
//             onClick={() => setActiveTab("vendor")}
//             className={`flex-1 px-6 py-3 font-medium transition ${
//               activeTab === "vendor"
//                 ? "text-red-600 border-b-2 border-red-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Vendor Terms & Conditions</span>
//             </div>
//           </button>
//           <button
//             onClick={() => setActiveTab("common")}
//             className={`flex-1 px-6 py-3 font-medium transition ${
//               activeTab === "common"
//                 ? "text-red-600 border-b-2 border-red-600 bg-blue-50"
//                 : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
//             }`}
//           >
//             <div className="flex items-center justify-center gap-2">
//               <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5" />
//               <span className="text-sm sm:text-base">Common Terms & Conditions</span>
//             </div>
//           </button>
//         </div>
//       </div>

//       {/* Main Table */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-200 border-b border-gray-200">
//               <tr>
//                 <th className="px-6 py-3 text-center w-16">
//                   <button
//                     onClick={handleSelectAll}
//                     className="p-1 hover:bg-gray-300 rounded transition-colors"
//                   >
//                     {selectAll ? (
//                       <CheckSquare className="w-5 h-5 text-blue-600" />
//                     ) : (
//                       <Square className="w-5 h-5 text-gray-500" />
//                     )}
//                   </button>
//                 </th>
//                 {activeTab === "vendor" && (
//                   <th className="px-6 py-3 text-left">
//                     <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                       Vendor
//                     </div>
//                     <input
//                       type="text"
//                       placeholder="Search vendor..."
//                       value={searchVendor}
//                       onChange={(e) => setSearchVendor(e.target.value)}
//                       className="w-full px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                     />
//                   </th>
//                 )}
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Content
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search content..."
//                     value={searchContent}
//                     onChange={(e) => setSearchContent(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
//                     Category
//                   </div>
//                   <input
//                     type="text"
//                     placeholder="Search category..."
//                     value={searchCategory}
//                     onChange={(e) => setSearchCategory(e.target.value)}
//                     className="w-full px-3 py-1.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                   />
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Status
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Default
//                   </div>
//                 </th>
//                 <th className="px-6 py-3 text-left">
//                   <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                     Actions
//                   </div>
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredTerms.map((term) => {
//                 const isSelected = selectedItems.has(term.id);
//                 const vendorName = activeTab === "vendor"
//                   ? allVendors.find((v) => v.id === term.vendor_id)?.name || "-"
//                   : "";

//                 return (
//                   <tr
//                     key={term.id}
//                     className={`hover:bg-gray-50 transition ${
//                       isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
//                     }`}
//                   >
//                     <td className="px-6 py-4 text-center">
//                       <button
//                         onClick={() => handleSelectItem(term.id)}
//                         className="p-1 hover:bg-gray-200 rounded transition-colors"
//                       >
//                         {isSelected ? (
//                           <CheckSquare className="w-5 h-5 text-blue-600" />
//                         ) : (
//                           <Square className="w-5 h-5 text-gray-400" />
//                         )}
//                       </button>
//                     </td>

//                     {activeTab === "vendor" && (
//                       <td className="px-6 py-4">
//                         <div className="text-gray-800 font-medium">
//                           {vendorName}
//                         </div>
//                       </td>
//                     )}

//                     <td className="px-6 py-4">
//                       <div className="max-w-xs">
//                         <div className="text-gray-800 line-clamp-2">
//                           {term.content}
//                         </div>
//                       </div>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
//                           term.category
//                         )}`}
//                       >
//                         {term.category.toUpperCase()}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <span
//                         className={`px-3 py-1 rounded-full text-xs font-medium ${
//                           term.is_active
//                             ? "bg-green-100 text-green-700"
//                             : "bg-gray-100 text-gray-600"
//                         }`}
//                       >
//                         {term.is_active ? "ACTIVE" : "INACTIVE"}
//                       </span>
//                     </td>

//                     <td className="px-6 py-4">
//                       <button
//                         onClick={() => toggleDefault(term.id, !!term.is_default)}
//                         className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
//                           term.is_default
//                             ? "text-green-600 bg-green-100 hover:bg-green-200"
//                             : "text-gray-500 hover:bg-gray-100"
//                         }`}
//                         title={term.is_default ? "Remove from default" : "Set as default"}
//                       >
//                         <CheckSquare
//                           className={`w-4 h-4 ${
//                             term.is_default ? "text-green-700" : ""
//                           }`}
//                         />
//                       </button>
//                     </td>

//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-2">
//                         <button
//                           onClick={() => handleEdit(term)}
//                           className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
//                           title="Edit"
//                         >
//                           <Edit2 className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(term.id)}
//                           className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>

//           {filteredTerms.length === 0 && (
//             <div className="text-center py-12">
//               <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-gray-800 mb-2">
//                 No Terms Found
//               </h3>
//               <p className="text-gray-600">
//                 {searchTerm || searchContent || searchCategory || searchVendor
//                   ? "Try a different search term"
//                   : "No terms available"}
//               </p>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
//           <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
//               <div className="flex items-center gap-2.5">
//                 <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
//                   <FileText className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-base font-bold text-white flex items-center gap-1.5">
//                     {editingId ? "Edit Terms" : "Add Terms"}
//                   </h2>
//                   <p className="text-xs text-white/90 font-medium mt-0.5">
//                     {editingId ? "Update terms details" : "Add new terms"}
//                   </p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   resetForm();
//                 }}
//                 className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             <form
//               onSubmit={handleSubmit}
//               className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
//             >
//               {activeTab === "vendor" && (
//                 <div className="mb-4 space-y-1">
//                   <label className="block text-xs font-semibold text-gray-800 mb-1">
//                     Vendor <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative group">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                       <Package className="w-3.5 h-3.5" />
//                     </div>
//                     <SearchableSelect
//                       options={allVendors.map((v: any) => ({
//                         id: v.id,
//                         name: v.name || v.vendor_name || v.display || "",
//                       }))}
//                       value={Number(formData.vendor_id)}
//                       onChange={(id) =>
//                         setFormData({ ...formData, vendor_id: Number(id) })
//                       }
//                       placeholder="Select Vendor"
//                       required
//                       className="pl-9"
//                     />
//                   </div>
//                 </div>
//               )}

//               <div className="space-y-4">
//                 <div className="space-y-1">
//                   <label className="block text-xs font-semibold text-gray-800 mb-1">
//                     Category <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative group">
//                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                       <FileText className="w-3.5 h-3.5" />
//                     </div>
//                     <select
//                       value={formData.category}
//                       onChange={(e) =>
//                         setFormData({ ...formData, category: e.target.value })
//                       }
//                       className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                       required
//                     >
//                       <option value="general">General</option>
//                       <option value="payment">Payment</option>
//                       <option value="delivery">Delivery</option>
//                       <option value="quality">Quality</option>
//                       <option value="warranty">Warranty</option>
//                       <option value="tax">Tax</option>
//                       <option value="legal">Legal</option>
//                       <option value="returns">Returns</option>
//                     </select>
//                   </div>
//                 </div>

//                 <div className="space-y-1">
//                   <label className="block text-xs font-semibold text-gray-800 mb-1">
//                     Terms & Condition <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative group">
//                     <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
//                       <FileText className="w-3.5 h-3.5" />
//                     </div>
//                     <textarea
//                       value={formData.content}
//                       onChange={(e) =>
//                         setFormData({ ...formData, content: e.target.value })
//                       }
//                       className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
//                       rows={3}
//                       placeholder="Enter the full terms & conditions text..."
//                       required
//                     />
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-6">
//                   <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all duration-200">
//                     <input
//                       type="checkbox"
//                       id="is_active"
//                       checked={formData.is_active}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           is_active: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium text-gray-700">
//                       Active
//                     </span>
//                   </label>

//                   <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all duration-200">
//                     <input
//                       type="checkbox"
//                       id="is_default"
//                       checked={formData.is_default}
//                       onChange={(e) =>
//                         setFormData({
//                           ...formData,
//                           is_default: e.target.checked,
//                         })
//                       }
//                       className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
//                       <Star className="w-4 h-4 text-yellow-500" />
//                       Set as default (auto-include in POs)
//                     </span>
//                   </label>
//                 </div>
//               </div>

//               {/* Modal Footer */}
//               <div className="border-t p-4 flex gap-3">
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
//                   {editingId ? "Update Terms" : "Add Terms"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FileText,
  X,
  Search,
  Star,
  Filter,
  ChevronDown,
  Package,
  ReceiptText,
  CheckSquare,
  Eye,
  Square,
  Loader2,
  XCircle,
} from "lucide-react";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { TermsCondition } from "../lib/termsConditionsApi";
import vendorApi from "../lib/vendorApi";
import SearchableSelect from "../components/SearchableSelect";
import MySwal from "../utils/swal";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  {
    name: "Category",
    values: [
      { value: "general", name: "General" },
      { value: "payment", name: "Payment" },
      { value: "delivery", name: "Delivery" },
      { value: "quality", name: "Quality" },
      { value: "warranty", name: "Warranty" },
      { value: "tax", name: "Tax" },
      { value: "legal", name: "Legal" },
      { value: "returns", name: "Returns" },
    ],
  },
  {
    name: "Status",
    values: [
      { value: true, name: "Active" },
      { value: false, name: "Inactive" },
    ],
  },
];

export default function TermsConditionsMaster() {
  const [terms, setTerms] = useState<TermsCondition[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Column search states
  const [searchContent, setSearchContent] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchVendor, setSearchVendor] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<string>("vendor");
  const [formData, setFormData] = useState<TermsCondition>({
    id: 0,
    vendor_id: 0,
    content: "",
    category: "general",
    is_default: false,
    is_active: true,
    created_at: "",
  });

  // Checkbox states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Filter states
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSubFilterOption, setShowSubFilterOption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<any>("");
  const [filteredTerms, setFilteredTerms] = useState<TermsCondition[] | []>([]);
  const [submitting, setSubmitting] = useState(false);

  const loadAllVendors = async () => {
    try {
      const vendorRes = await vendorApi.getVendors();
      setAllVendors(vendorRes ?? []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load vendors");
    }
  };

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await TermsConditionsApi.getAllTC();
      setTerms(response ?? []);
      setFilteredTerms(response ?? []);
    } catch (err) {
      console.error("Error loading terms:", err);
      toast.error("Failed to load terms");
      setTerms([]);
      setFilteredTerms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllVendors();
    loadTerms();
  }, []);

  useEffect(() => {
    let filtered = [...terms];

    // Filter by tab
    if (activeTab === "common") {
      filtered = filtered.filter((tc) => !tc.vendor_id);
    } else {
      filtered = filtered.filter((tc) => tc.vendor_id);
    }

    // Column searches
    if (searchContent) {
      filtered = filtered.filter((term) =>
        term.content.toLowerCase().includes(searchContent.toLowerCase()),
      );
    }

    if (searchCategory) {
      filtered = filtered.filter((term) =>
        term.category.toLowerCase().includes(searchCategory.toLowerCase()),
      );
    }

    if (searchVendor && activeTab === "vendor") {
      filtered = filtered.filter((term) => {
        const vendor = allVendors.find((v) => v.id === term.vendor_id);
        return vendor?.name?.toLowerCase().includes(searchVendor.toLowerCase());
      });
    }

    // Global search (backward compatibility)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (term) =>
          term.content.toLowerCase().includes(q) ||
          term.category.toLowerCase().includes(q),
      );
    }

    // Apply advanced filters
    if (selectedFilter !== "") {
      if (typeof selectedFilter === "string") {
        filtered = filtered.filter((d) => d.category === selectedFilter);
      } else if (typeof selectedFilter === "boolean") {
        filtered = filtered.filter((d) => d.is_active === selectedFilter);
      }
    }

    setFilteredTerms(filtered);
    setSelectAll(false);
    setSelectedItems(new Set());
  }, [
    terms,
    activeTab,
    searchContent,
    searchCategory,
    searchVendor,
    searchTerm,
    selectedFilter,
    allVendors,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim() || !formData.category.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    if (activeTab === "vendor" && !formData.vendor_id) {
      toast.error("Please select a vendor");
      return;
    }

    const payload = {
      vendor_id: formData.vendor_id,
      content: formData.content,
      category: formData.category,
      is_default: formData.is_default,
      is_active: formData.is_active,
    };

    try {
      setSubmitting(true);
      if (editingId) {
        const updateRes: any = await TermsConditionsApi.updateTC(
          editingId,
          payload,
        );
        if (updateRes.status) {
          await loadTerms();
          toast.success("Terms updated successfully!");
        } else {
          toast.error("Failed to update terms");
        }
      } else {
        const createRes: any = await TermsConditionsApi.createTC(payload);
        if (createRes.status) {
          await loadTerms();
          toast.success("Terms created successfully!");
        } else {
          toast.error("Failed to create terms");
        }
      }
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (term: TermsCondition) => {
    setEditingId(term.id || null);
    setFormData({
      vendor_id: term.vendor_id,
      content: term.content,
      category: term.category,
      is_default: !!term.is_default,
      is_active: term.is_active ?? true,
      created_at: term.created_at ?? "",
      id: term.id,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const result: any = await MySwal.fire({
        title: "Delete Term?",
        text: "This action cannot be undone",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#C62828",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      const deleteRes = await TermsConditionsApi.deleteTC(id);
      if (deleteRes.status) {
        await loadTerms();
        toast.success("Term deleted successfully!");
      } else {
        toast.error("Failed to delete term");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select terms to delete");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedItems.size} Term(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `Delete (${selectedItems.size})`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      await Promise.all(
        Array.from(selectedItems).map((id) => TermsConditionsApi.deleteTC(id)),
      );
      await loadTerms();
      setSelectedItems(new Set());
      setSelectAll(false);
      toast.success(`${selectedItems.size} term(s) deleted successfully!`);
    } catch (error) {
      console.error("Error deleting terms:", error);
      toast.error("Failed to delete terms");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDefault = async (id: number, currentStatus: boolean) => {
    try {
      const updateIsDefaultRes = await TermsConditionsApi.updateIsDefaultTC(
        id,
        !currentStatus,
      );
      if (updateIsDefaultRes.status) {
        await loadTerms();
        toast.success(
          currentStatus ? "Removed from default" : "Set as default",
        );
      } else {
        toast.error("Failed to update default status");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredTerms.map((term) => term.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredTerms.length);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      vendor_id: 0,
      content: "",
      category: "general",
      is_default: false,
      is_active: true,
      created_at: "",
    });
    setEditingId(null);
  };

  const resetFilters = () => {
    setSelectedFilter("");
    setSearchContent("");
    setSearchCategory("");
    setSearchVendor("");
    setSearchTerm("");
    setShowFilterOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowFilterOptions(false);
        setShowSubFilterOption("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: any = {
      payment: "bg-green-100 text-green-700",
      delivery: "bg-blue-100 text-blue-700",
      quality: "bg-purple-100 text-purple-700",
      warranty: "bg-orange-100 text-orange-700",
      tax: "bg-red-100 text-red-700",
      legal: "bg-gray-100 text-gray-700",
      returns: "bg-yellow-100 text-yellow-700",
      general: "bg-slate-100 text-slate-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 bg-gray-50 ">
      {/* Header with Actions and Bulk Actions - Side by Side */}
      {/* Tab Navigation */}
      <div className=" sticky top-44 z-10 flex flex-col gap-2 mb-4 mt-4 sm:flex-row sm:items-center sm:gap-4 mx-0 md:mx-0">
        {/* Tabs */}
        <div className="w-full sm:flex-1">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setActiveTab("vendor")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "vendor"
              ? "bg-red-50 text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <ReceiptText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Vendor Terms
            </button>

            <button
              onClick={() => setActiveTab("common")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "common"
              ? "bg-red-50 text-red-600 border-b-2 border-red-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <ReceiptText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Common Terms
            </button>
          </div>
        </div>

        {/* Add Terms Button */}
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="
      w-full sm:w-auto
      bg-[#C62828] text-white
      px-3 py-2
      sm:px-5 sm:py-2
      rounded-lg
      flex items-center justify-center gap-1.5
      text-[11px] sm:text-sm
      shadow-sm
      hover:bg-[#A62222]
      transition
      whitespace-nowrap
    "
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Add Terms
        </button>
      </div>
      {/* Bulk Actions Bar */}
      {selectedItems.size > 0 && (
        <div className="mx-2 md:mx-0 mb-2">
          <div
            className="
        flex items-center justify-between
        bg-red-50 border border-red-200
        rounded-lg
        px-3 py-2
        shadow-sm
      "
          >
            {/* Left: Selected Count */}
            <div className="flex items-center gap-2">
              <div className="bg-red-100 p-1.5 rounded-md">
                <Trash2 className="w-3.5 h-3.5 text-red-600" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-800">
                {selectedItems.size} selected
              </span>
            </div>

            {/* Right: Delete Button */}
            <button
              onClick={handleBulkDelete}
              disabled={submitting}
              className="
          flex items-center gap-1.5
          bg-red-600 text-white
          px-3 py-1.5
          rounded-md
          text-xs md:text-sm
          hover:bg-red-700
          transition
          disabled:opacity-50
        "
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className=" bg-white rounded-xl shadow-sm border border-gray-200  mx-0 md:mx-0">
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-260px)] ">
          <table className="w-full">
            <thead className=" sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-2 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                {activeTab === "vendor" && (
                  <th className="px-2 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vendor
                    </div>
                  </th>
                )}
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Content
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Default
                  </div>
                </th>
                <th className="px-2 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-2 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {activeTab === "vendor" && (
                  <td className="px-2 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Search vendor..."
                      value={searchVendor}
                      onChange={(e) => setSearchVendor(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>
                )}

                <td className="px-2 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search content..."
                    value={searchContent}
                    onChange={(e) => setSearchContent(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                <td className="px-2 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                <td className="px-2 md:px-4 py-1">
                  <select
                    value={
                      selectedFilter === true
                        ? "active"
                        : selectedFilter === false
                          ? "inactive"
                          : ""
                    }
                    onChange={(e) => {
                      if (e.target.value === "active") {
                        setSelectedFilter(true);
                      } else if (e.target.value === "inactive") {
                        setSelectedFilter(false);
                      } else {
                        setSelectedFilter("");
                      }
                    }}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </td>

                {/* Empty cell for Default column (no search) */}
                <td className="px-2 md:px-4 py-1"></td>

                {/* Actions - Clear Filter Button */}
                <td className="px-2 md:px-4 py-1 text-center">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear Filters"
                  >
                    <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTerms.map((term) => {
                const isSelected = selectedItems.has(term.id);
                const vendorName =
                  activeTab === "vendor"
                    ? allVendors.find((v) => v.id === term.vendor_id)?.name ||
                      "-"
                    : "";

                return (
                  <tr
                    key={term.id}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <td className="px-2 md:px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(term.id)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>

                    {activeTab === "vendor" && (
                      <td className="px-2 md:px-4 py-3">
                        <div className="text-gray-800 font-medium text-xs md:text-sm">
                          {vendorName}
                        </div>
                      </td>
                    )}

                    <td className="px-2 md:px-4 py-3">
                      <div className="max-w-xs">
                        <div className="text-gray-800 line-clamp-2 text-xs md:text-sm">
                          {term.content}
                        </div>
                      </div>
                    </td>

                    <td className="px-2 md:px-4 py-3">
                      <span
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getCategoryColor(
                          term.category,
                        )}`}
                      >
                        {term.category.toUpperCase()}
                      </span>
                    </td>

                    <td className="px-2 md:px-4 py-3">
                      <span
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          term.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {term.is_active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>

                    <td className="px-2 md:px-4 py-3">
                      <button
                        onClick={() =>
                          toggleDefault(term.id, !!term.is_default)
                        }
                        className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                          term.is_default
                            ? "text-green-600 bg-green-100 hover:bg-green-200"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                        title={
                          term.is_default
                            ? "Remove from default"
                            : "Set as default"
                        }
                      >
                        <CheckSquare
                          className={`w-4 h-4 ${
                            term.is_default ? "text-green-700" : ""
                          }`}
                        />
                      </button>
                    </td>

                    <td className="px-2 md:px-4 py-3">
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-1.5 md:p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="p-1.5 md:p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTerms.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Terms Found
              </h3>
              <p className="text-gray-600">
                {searchTerm ||
                searchContent ||
                searchCategory ||
                searchVendor ||
                selectedFilter
                  ? "Try a different search term"
                  : "No terms available"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? "Edit Terms" : "Add Terms"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? "Update terms details" : "Add new terms"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              {activeTab === "vendor" && (
                <div className="mb-4 space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Vendor <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                    <SearchableSelect
                      options={allVendors.map((v: any) => ({
                        id: v.id,
                        name: v.name || v.vendor_name || v.display || "",
                      }))}
                      value={Number(formData.vendor_id)}
                      onChange={(id) =>
                        setFormData({ ...formData, vendor_id: Number(id) })
                      }
                      placeholder="Select Vendor"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      required
                    >
                      <option value="general">General</option>
                      <option value="delivery">Delivery</option>
                      <option value="quality">Quality</option>
                      <option value="warranty">Warranty</option>
                      <option value="tax">Tax</option>
                      <option value="legal">Legal</option>
                      <option value="returns">Returns</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Terms & Condition <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      rows={3}
                      placeholder="Enter the full terms & conditions text..."
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Active
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-xl transition-all duration-200">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_default: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Set as default (auto-include in POs)
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {editingId ? "Update Terms" : "Add Terms"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
