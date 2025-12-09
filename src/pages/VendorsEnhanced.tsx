// // src/components/VendorsEnhanced.tsx
// import React, { useEffect, useState } from 'react';
// import {
//   Plus,
//   Search,
//   Phone,
//   Mail,
//   MapPin,
//   X,
//   Edit2,
//   Trash2,
//   FileText,
//   Building2,
//   User,
//   CheckCircle,
// } from 'lucide-react';
// import PhoneInput from '../components/PhoneInput';
// import { validators, errorMessages } from '../utils/validators';
// import vendorApi from '../lib/vendorApi'; // getVendors, createVendor, updateVendor, deleteVendor
// import poTypeApi from '../lib/poTypeApi'; // getPOTypes

// /* ---------------------------
//    Types
// ----------------------------*/
// interface VendorFormData {
//   name: string;
//   category_name: string;
//   pan_number: string;
//   gst_number: string;
//   contact_person_name: string;
//   contact_person_phone: string;
//   contact_person_email: string;
//   office_street: string;
//   office_city: string;
//   office_state: string;
//   office_pincode: string;
//   office_country: string;
//   company_email: string;
//   company_phone: string;
//   manager_name: string;
//   manager_email: string;
//   manager_phone: string;
//   phone_country_code: string;
// }

// interface Vendor {
//   id: number | string;
//   name: string;
//   category_name: string;
//   pan_number?: string;
//   gst_number?: string;
//   contact_person_name?: string;
//   contact_person_phone?: string;
//   contact_person_email?: string;
//   office_street?: string;
//   office_city?: string;
//   office_state?: string;
//   office_pincode?: string;
//   office_country?: string;
//   company_email?: string;
//   company_phone?: string;
//   manager_name?: string;
//   manager_email?: string;
//   manager_phone?: string;
//   phone_country_code?: string;
// }

// interface Category {
//   id?: string;
//   name: string;
// }

// /* ---------------------------
//    Component
// ----------------------------*/
// export default function VendorsEnhanced(): JSX.Element {
//   const [vendors, setVendors] = useState<Vendor[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [poTypes, setPoTypes] = useState<Category[]>([]);
//   const [poTypesLoading, setPoTypesLoading] = useState<boolean>(false);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<number | string | null>(null);
//   const [errors, setErrors] = useState<any>({});
//   const [submitting, setSubmitting] = useState(false);

//   const [formData, setFormData] = useState<VendorFormData>({
//     name: '',
//     category_name: '',
//     pan_number: '',
//     gst_number: '',
//     contact_person_name: '',
//     contact_person_phone: '',
//     contact_person_email: '',
//     office_street: '',
//     office_city: '',
//     office_state: '',
//     office_pincode: '',
//     office_country: 'India',
//     company_email: '',
//     company_phone: '',
//     manager_name: '',
//     manager_email: '',
//     manager_phone: '',
//     phone_country_code: '+91',
//   });

//   useEffect(() => {
//     loadData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   async function loadData() {
//     setLoading(true);
//     try {
//       // fetch vendors and PO types in parallel
//       const [vendorsRes, poTypesRes] = await Promise.all([vendorApi.getVendors(), loadPOTypes()]);
//       setVendors(vendorsRes || []);
//       // derive categories from vendor records (fallback)
//       const unique = Array.from(new Set((vendorsRes || []).map((v: Vendor) => v.category_name || '').filter(Boolean)));
//       setCategories(unique.map((n) => ({ name: n })));
//       // poTypes state handled in loadPOTypes
//     } catch (err) {
//       console.error('Error loading data:', err);
//       setVendors([]);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function loadPOTypes() {
//     setPoTypesLoading(true);
//     try {
//       const data = await poTypeApi.getPOTypes();
//       const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
//       const mapped = list.map((t: any) => ({ name: t.name || t.type_name || String(t.id) }));
//       setPoTypes(mapped);
//       return list;
//     } catch (err) {
//       console.warn('loadPOTypes failed, fallback to empty', err);
//       setPoTypes([]);
//       return [];
//     } finally {
//       setPoTypesLoading(false);
//     }
//   }

//   /* ---------------------------
//      Validation
//   ----------------------------*/
//   const validateForm = (): boolean => {
//     const newErrors: any = {};

//     if (!formData.name.trim()) newErrors.name = errorMessages.required;
//     if (!formData.category_name || !formData.category_name.trim()) newErrors.category_name = errorMessages.required;

//     if (formData.pan_number && !validators.pan(formData.pan_number)) {
//       newErrors.pan_number = errorMessages.pan;
//     }

//     if (formData.gst_number && !validators.gst(formData.gst_number)) {
//       newErrors.gst_number = errorMessages.gst;
//     }

//     if (!formData.contact_person_name.trim()) {
//       newErrors.contact_person_name = errorMessages.required;
//     }

//     if (!formData.contact_person_phone) {
//       newErrors.contact_person_phone = errorMessages.required;
//     } else if (!validators.phone(formData.contact_person_phone)) {
//       newErrors.contact_person_phone = errorMessages.phone;
//     }

//     if (!formData.contact_person_email) {
//       newErrors.contact_person_email = errorMessages.required;
//     } else if (!validators.email(formData.contact_person_email)) {
//       newErrors.contact_person_email = errorMessages.email;
//     }

//     if (formData.company_email && !validators.email(formData.company_email)) {
//       newErrors.company_email = errorMessages.email;
//     }

//     if (formData.manager_email && !validators.email(formData.manager_email)) {
//       newErrors.manager_email = errorMessages.email;
//     }

//     if (formData.company_phone && !validators.phone(formData.company_phone)) {
//       newErrors.company_phone = errorMessages.phone;
//     }

//     if (formData.manager_phone && !validators.phone(formData.manager_phone)) {
//       newErrors.manager_phone = errorMessages.phone;
//     }

//     if (formData.office_pincode && !validators.pincode(formData.office_pincode)) {
//       newErrors.office_pincode = errorMessages.pincode;
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /* ---------------------------
//      Submit create / update via API
//   ----------------------------*/
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (submitting) return;
//     if (!validateForm()) return;

//     setSubmitting(true);
//     try {
//       if (editingId) {
//         await vendorApi.updateVendor(editingId, formData);
//       } else {
//         await vendorApi.createVendor(formData);
//       }

//       setShowModal(false);
//       resetForm();
//       await loadData();
//     } catch (error) {
//       console.error('Error saving vendor:', error);
//       alert('Error saving vendor — check console for details');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   /* ---------------------------
//      Edit / Delete
//   ----------------------------*/
//   const handleEdit = (vendor: Vendor) => {
//     setEditingId(vendor.id);
//     setFormData({
//       name: vendor.name || '',
//       category_name: vendor.category_name || '',
//       pan_number: vendor.pan_number || '',
//       gst_number: vendor.gst_number || '',
//       contact_person_name: vendor.contact_person_name || '',
//       contact_person_phone: vendor.contact_person_phone || '',
//       contact_person_email: vendor.contact_person_email || '',
//       office_street: vendor.office_street || '',
//       office_city: vendor.office_city || '',
//       office_state: vendor.office_state || '',
//       office_pincode: vendor.office_pincode || '',
//       office_country: vendor.office_country || 'India',
//       company_email: vendor.company_email || '',
//       company_phone: vendor.company_phone || '',
//       manager_name: vendor.manager_name || '',
//       manager_email: vendor.manager_email || '',
//       manager_phone: vendor.manager_phone || '',
//       phone_country_code: vendor.phone_country_code || '+91',
//     });
//     setShowModal(true);
//   };

//   const handleDelete = async (id: number | string) => {
//     if (!confirm('Are you sure you want to delete this vendor?')) return;
//     try {
//       await vendorApi.deleteVendor(id);
//       await loadData();
//     } catch (error) {
//       console.error('Error deleting vendor:', error);
//       alert('Error deleting vendor');
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       category_name: '',
//       pan_number: '',
//       gst_number: '',
//       contact_person_name: '',
//       contact_person_phone: '',
//       contact_person_email: '',
//       office_street: '',
//       office_city: '',
//       office_state: '',
//       office_pincode: '',
//       office_country: 'India',
//       company_email: '',
//       company_phone: '',
//       manager_name: '',
//       manager_email: '',
//       manager_phone: '',
//       phone_country_code: '+91',
//     });
//     setEditingId(null);
//     setErrors({});
//     setSubmitting(false);
//   };

//   /* ---------------------------
//      Filtered vendors for local search
//   ----------------------------*/
//   const filteredVendors = vendors.filter((vendor) =>
//     (vendor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (vendor.contact_person_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (vendor.pan_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (vendor.gst_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (vendor.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const getCategoryName = (category_name?: string) => {
//     return category_name || '';
//   };

//   /* ---------------------------
//      Category source: prefer PO Types, fallback to vendor-derived categories
//   ----------------------------*/
//   const categoryOptions = poTypes.length > 0 ? poTypes : categories;

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
//           <p className="text-gray-600 mt-1">Manage your vendor database</p>
//         </div>
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-5 h-5" />
//           Add Vendor
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search vendors by name, PAN, GST, contact person or category..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="text-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-gray-600 mt-4">Loading vendors...</p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {filteredVendors.map((vendor) => (
//             <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
//               <div className="flex justify-between items-start">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-3 mb-3">
//                     <div className="bg-blue-100 p-2 rounded-lg">
//                       <Building2 className="w-6 h-6 text-blue-600" />
//                     </div>
//                     <div>
//                       <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
//                       <p className="text-sm text-gray-600">{getCategoryName(vendor.category_name)}</p>
//                     </div>
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//                     {vendor.contact_person_name && (
//                       <div className="flex items-start gap-2">
//                         <User className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">Contact Person</p>
//                           <p className="text-sm font-medium text-gray-800">{vendor.contact_person_name}</p>
//                         </div>
//                       </div>
//                     )}

//                     {vendor.contact_person_phone && (
//                       <div className="flex items-start gap-2">
//                         <Phone className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">Phone</p>
//                           <p className="text-sm font-medium text-gray-800">
//                             {vendor.phone_country_code} {vendor.contact_person_phone}
//                           </p>
//                         </div>
//                       </div>
//                     )}

//                     {vendor.contact_person_email && (
//                       <div className="flex items-start gap-2">
//                         <Mail className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">Email</p>
//                           <p className="text-sm font-medium text-gray-800">{vendor.contact_person_email}</p>
//                         </div>
//                       </div>
//                     )}

//                     {vendor.pan_number && (
//                       <div className="flex items-start gap-2">
//                         <FileText className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">PAN</p>
//                           <p className="text-sm font-medium text-gray-800">{vendor.pan_number}</p>
//                         </div>
//                       </div>
//                     )}

//                     {vendor.gst_number && (
//                       <div className="flex items-start gap-2">
//                         <FileText className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">GST</p>
//                           <p className="text-sm font-medium text-gray-800">{vendor.gst_number}</p>
//                         </div>
//                       </div>
//                     )}

//                     {(vendor.office_city || vendor.office_state) && (
//                       <div className="flex items-start gap-2">
//                         <MapPin className="w-4 h-4 text-gray-400 mt-1" />
//                         <div>
//                           <p className="text-xs text-gray-500">Location</p>
//                           <p className="text-sm font-medium text-gray-800">
//                             {[vendor.office_city, vendor.office_state].filter(Boolean).join(', ')}
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex gap-2 ml-4">
//                   <button
//                     onClick={() => handleEdit(vendor)}
//                     className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                     title="Edit vendor"
//                   >
//                     <Edit2 className="w-5 h-5" />
//                   </button>
//                   <button
//                     onClick={() => handleDelete(vendor.id)}
//                     className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                     title="Delete vendor"
//                   >
//                     <Trash2 className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {filteredVendors.length === 0 && (
//             <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
//               <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <p className="text-gray-600 text-lg">No vendors found</p>
//               <p className="text-gray-500 text-sm mt-2">
//                 {searchTerm ? 'Try a different search term' : 'Click "Add Vendor" to create your first vendor'}
//               </p>
//             </div>
//           )}
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
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

//             <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//               <div className="space-y-6">
//                 {/* Basic Information */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Building2 className="w-5 h-5" />
//                     Basic Information
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Company Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.name}
//                         onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="ABC Construction Pvt Ltd"
//                         required
//                       />
//                       {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Category <span className="text-red-500">*</span>
//                       </label>

//                       <div className="flex gap-2">
//                         <select
//                           value={formData.category_name}
//                           onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
//                           className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category_name ? 'border-red-300' : 'border-gray-300'
//                             }`}
//                           required
//                         >
//                           <option value="">Select Category</option>
//                           {categoryOptions.map((cat) => (
//                             <option key={cat.name} value={cat.name}>
//                               {cat.name}
//                             </option>
//                           ))}
//                         </select>

//                         {/* Add button removed as requested */}
//                       </div>

//                       {errors.category_name && <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
//                       <input
//                         type="text"
//                         value={formData.pan_number}
//                         onChange={(e) =>
//                           setFormData({ ...formData, pan_number: validators.formatPAN(e.target.value) })
//                         }
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.pan_number ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="ABCDE1234F"
//                         maxLength={10}
//                       />
//                       {errors.pan_number && <p className="mt-1 text-sm text-red-600">{errors.pan_number}</p>}
//                       {formData.pan_number && validators.pan(formData.pan_number) && (
//                         <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
//                           <CheckCircle className="w-4 h-4" /> Valid PAN
//                         </p>
//                       )}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
//                       <input
//                         type="text"
//                         value={formData.gst_number}
//                         onChange={(e) =>
//                           setFormData({ ...formData, gst_number: validators.formatGST(e.target.value) })
//                         }
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.gst_number ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="22ABCDE1234F1Z5"
//                         maxLength={15}
//                       />
//                       {errors.gst_number && <p className="mt-1 text-sm text-red-600">{errors.gst_number}</p>}
//                       {formData.gst_number && validators.gst(formData.gst_number) && (
//                         <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
//                           <CheckCircle className="w-4 h-4" /> Valid GST
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact Person */}
//                 <div className="bg-blue-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5" />
//                     Contact Person Details
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">
//                         Full Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.contact_person_name}
//                         onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contact_person_name ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="John Doe"
//                         required
//                       />
//                       {errors.contact_person_name && (
//                         <p className="mt-1 text-sm text-red-600">{errors.contact_person_name}</p>
//                       )}
//                     </div>

//                     <div>
//                       <PhoneInput
//                         value={formData.contact_person_phone}
//                         countryCode={formData.phone_country_code}
//                         onChange={(phone) => setFormData({ ...formData, contact_person_phone: phone })}
//                         onCountryCodeChange={(code) => setFormData({ ...formData, phone_country_code: code })}
//                         label="Phone Number"
//                         required
//                         error={errors.contact_person_phone}
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
//                       <input
//                         type="email"
//                         value={formData.contact_person_email}
//                         onChange={(e) =>
//                           setFormData({ ...formData, contact_person_email: e.target.value.toLowerCase() })
//                         }
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contact_person_email ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="john@example.com"
//                         required
//                       />
//                       {errors.contact_person_email && (
//                         <p className="mt-1 text-sm text-red-600">{errors.contact_person_email}</p>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Office Address */}
//                 <div className="bg-green-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <MapPin className="w-5 h-5" />
//                     Office Address
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="md:col-span-2">
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
//                       <textarea
//                         value={formData.office_street}
//                         onChange={(e) => setFormData({ ...formData, office_street: e.target.value })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         rows={2}
//                         placeholder="Building No, Street Name, Area"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
//                       <input
//                         type="text"
//                         value={formData.office_city}
//                         onChange={(e) => setFormData({ ...formData, office_city: e.target.value })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Mumbai"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
//                       <input
//                         type="text"
//                         value={formData.office_state}
//                         onChange={(e) => setFormData({ ...formData, office_state: e.target.value })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Maharashtra"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
//                       <input
//                         type="text"
//                         value={formData.office_pincode}
//                         onChange={(e) =>
//                           setFormData({ ...formData, office_pincode: validators.formatPincode(e.target.value) })
//                         }
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.office_pincode ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="400001"
//                         maxLength={6}
//                       />
//                       {errors.office_pincode && <p className="mt-1 text-sm text-red-600">{errors.office_pincode}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
//                       <input
//                         type="text"
//                         value={formData.office_country}
//                         onChange={(e) => setFormData({ ...formData, office_country: e.target.value })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="India"
//                       />
//                     </div>
//                   </div>
//                 </div>

//                 {/* Company Contact */}
//                 <div className="bg-purple-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <Mail className="w-5 h-5" />
//                     Company Contact Details
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
//                       <input
//                         type="email"
//                         value={formData.company_email}
//                         onChange={(e) => setFormData({ ...formData, company_email: e.target.value.toLowerCase() })}
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company_email ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="info@company.com"
//                       />
//                       {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
//                       <input
//                         type="tel"
//                         value={formData.company_phone}
//                         onChange={(e) =>
//                           setFormData({ ...formData, company_phone: validators.formatPhone(e.target.value) })
//                         }
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company_phone ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="9876543210"
//                         maxLength={10}
//                       />
//                       {errors.company_phone && <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Manager Details */}
//                 <div className="bg-orange-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
//                     <User className="w-5 h-5" />
//                     Manager Details (Optional)
//                   </h3>
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
//                       <input
//                         type="text"
//                         value={formData.manager_name}
//                         onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
//                         className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         placeholder="Jane Smith"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Manager Email</label>
//                       <input
//                         type="email"
//                         value={formData.manager_email}
//                         onChange={(e) => setFormData({ ...formData, manager_email: e.target.value.toLowerCase() })}
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.manager_email ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="jane@company.com"
//                       />
//                       {errors.manager_email && <p className="mt-1 text-sm text-red-600">{errors.manager_email}</p>}
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Manager Phone</label>
//                       <input
//                         type="tel"
//                         value={formData.manager_phone}
//                         onChange={(e) => setFormData({ ...formData, manager_phone: validators.formatPhone(e.target.value) })}
//                         className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.manager_phone ? 'border-red-300' : 'border-gray-300'
//                           }`}
//                         placeholder="9876543210"
//                         maxLength={10}
//                       />
//                       {errors.manager_phone && <p className="mt-1 text-sm text-red-600">{errors.manager_phone}</p>}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex gap-3 mt-6 pt-6 border-t">
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
//                 >
//                   {submitting ? (editingId ? 'Updating...' : 'Creating...') : editingId ? 'Update Vendor' : 'Create Vendor'}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     resetForm();
//                   }}
//                   className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
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

// src/components/VendorsEnhanced.tsx
import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  X,
  Edit2,
  Trash2,
  FileText,
  Building2,
  User,
  CheckCircle,
} from 'lucide-react';
import PhoneInput from '../components/PhoneInput';
import { validators, errorMessages } from '../utils/validators';
import vendorApi from '../lib/vendorApi'; // getVendors, createVendor, updateVendor, deleteVendor
import poTypeApi from '../lib/poTypeApi'; // getPOTypes
import poApi from '../lib/poApi'; // getItems

/* ---------------------------
   Types
----------------------------*/
interface VendorFormData {
  name: string;
  category_name: string;
  pan_number: string;
  gst_number: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  office_street: string;
  office_city: string;
  office_state: string;
  office_pincode: string;
  office_country: string;
  company_email: string;
  company_phone: string;
  manager_name: string;
  manager_email: string;
  manager_phone: string;
  phone_country_code: string;
  // new optional field to save the selected material/service item id
  sub_item_id?: string;
}

interface Vendor {
  id: number | string;
  name: string;
  category_name: string;
  pan_number?: string;
  gst_number?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  contact_person_email?: string;
  office_street?: string;
  office_city?: string;
  office_state?: string;
  office_pincode?: string;
  office_country?: string;
  company_email?: string;
  company_phone?: string;
  manager_name?: string;
  manager_email?: string;
  manager_phone?: string;
  phone_country_code?: string;
  sub_item_id?: string;
}

interface Category {
  id?: string;
  name: string;
}

interface ItemOption {
  id: string;
  name: string;
  code?: string;
  hsn?: string;
  category?: string;
}

/* ---------------------------
   Component
----------------------------*/
export default function VendorsEnhanced(): JSX.Element {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [poTypes, setPoTypes] = useState<Category[]>([]);
  const [poTypesLoading, setPoTypesLoading] = useState<boolean>(false);
  const [materials, setMaterials] = useState<ItemOption[]>([]);
  const [services, setServices] = useState<ItemOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [errors, setErrors] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<VendorFormData>({
    name: '',
    category_name: '',
    pan_number: '',
    gst_number: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    office_street: '',
    office_city: '',
    office_state: '',
    office_pincode: '',
    office_country: 'India',
    company_email: '',
    company_phone: '',
    manager_name: '',
    manager_email: '',
    manager_phone: '',
    phone_country_code: '+91',
    sub_item_id: '',
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      // fetch vendors and PO types and items in parallel
      await Promise.all([vendorApi.getVendors().then((v) => setVendors(v || [])), loadPOTypes(), loadItems()]);
      // derive categories from vendor records (fallback)
      const unique = Array.from(new Set((vendors || []).map((v: Vendor) => v.category_name || '').filter(Boolean)));
      setCategories(unique.map((n) => ({ name: n })));
    } catch (err) {
      console.error('Error loading data:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadPOTypes() {
    setPoTypesLoading(true);
    try {
      const data = await poTypeApi.getPOTypes();
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      const mapped = list.map((t: any) => ({ name: t.name || t.type_name || String(t.id) }));
      setPoTypes(mapped);
      return list;
    } catch (err) {
      console.warn('loadPOTypes failed, fallback to empty', err);
      setPoTypes([]);
      return [];
    } finally {
      setPoTypesLoading(false);
    }
  }

  async function loadItems() {
    try {
      const data = await poApi.getItems();
      const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
      // normalize each item into ItemOption
      const normalized: ItemOption[] = arr.map((it: any) => ({
        id: String(it.id || it._id || it.item_id || it.key || ''),
        name: String(it.item_name || it.name || it.title || 'Unnamed'),
        code: it.item_code || it.code || '',
        hsn: it.hsn_code || it.hsn || '',
        category: (it.category || it.type || '').toString().toLowerCase(),
      }));
      setMaterials(normalized.filter((i) => (i.category || '').includes('material')));
      setServices(normalized.filter((i) => (i.category || '').includes('service') || (i.category || '').includes('services')));
    } catch (err) {
      console.warn('loadItems failed', err);
      setMaterials([]);
      setServices([]);
    }
  }

  /* ---------------------------
     Validation
  ----------------------------*/
  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = errorMessages.required;
    if (!formData.category_name || !formData.category_name.trim()) newErrors.category_name = errorMessages.required;

    if (formData.pan_number && !validators.pan(formData.pan_number)) {
      newErrors.pan_number = errorMessages.pan;
    }

    if (formData.gst_number && !validators.gst(formData.gst_number)) {
      newErrors.gst_number = errorMessages.gst;
    }

    if (!formData.contact_person_name.trim()) {
      newErrors.contact_person_name = errorMessages.required;
    }

    if (!formData.contact_person_phone) {
      newErrors.contact_person_phone = errorMessages.required;
    } else if (!validators.phone(formData.contact_person_phone)) {
      newErrors.contact_person_phone = errorMessages.phone;
    }

    if (!formData.contact_person_email) {
      newErrors.contact_person_email = errorMessages.required;
    } else if (!validators.email(formData.contact_person_email)) {
      newErrors.contact_person_email = errorMessages.email;
    }

    if (formData.company_email && !validators.email(formData.company_email)) {
      newErrors.company_email = errorMessages.email;
    }

    if (formData.manager_email && !validators.email(formData.manager_email)) {
      newErrors.manager_email = errorMessages.email;
    }

    if (formData.company_phone && !validators.phone(formData.company_phone)) {
      newErrors.company_phone = errorMessages.phone;
    }

    if (formData.manager_phone && !validators.phone(formData.manager_phone)) {
      newErrors.manager_phone = errorMessages.phone;
    }

    if (formData.office_pincode && !validators.pincode(formData.office_pincode)) {
      newErrors.office_pincode = errorMessages.pincode;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------------------
     Submit create / update via API
  ----------------------------*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
      };

      if (editingId) {
        await vendorApi.updateVendor(editingId, payload);
      } else {
        await vendorApi.createVendor(payload);
      }

      setShowModal(false);
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor — check console for details');
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------------------
     Edit / Delete
  ----------------------------*/
  const handleEdit = (vendor: Vendor) => {
    setEditingId(vendor.id);
    setFormData({
      name: vendor.name || '',
      category_name: vendor.category_name || '',
      pan_number: vendor.pan_number || '',
      gst_number: vendor.gst_number || '',
      contact_person_name: vendor.contact_person_name || '',
      contact_person_phone: vendor.contact_person_phone || '',
      contact_person_email: vendor.contact_person_email || '',
      office_street: vendor.office_street || '',
      office_city: vendor.office_city || '',
      office_state: vendor.office_state || '',
      office_pincode: vendor.office_pincode || '',
      office_country: vendor.office_country || 'India',
      company_email: vendor.company_email || '',
      company_phone: vendor.company_phone || '',
      manager_name: vendor.manager_name || '',
      manager_email: vendor.manager_email || '',
      manager_phone: vendor.manager_phone || '',
      phone_country_code: vendor.phone_country_code || '+91',
      sub_item_id: vendor.sub_item_id || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    try {
      await vendorApi.deleteVendor(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting vendor:', error);
      alert('Error deleting vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_name: '',
      pan_number: '',
      gst_number: '',
      contact_person_name: '',
      contact_person_phone: '',
      contact_person_email: '',
      office_street: '',
      office_city: '',
      office_state: '',
      office_pincode: '',
      office_country: 'India',
      company_email: '',
      company_phone: '',
      manager_name: '',
      manager_email: '',
      manager_phone: '',
      phone_country_code: '+91',
      sub_item_id: '',
    });
    setEditingId(null);
    setErrors({});
    setSubmitting(false);
  };

  /* ---------------------------
     Filtered vendors for local search
  ----------------------------*/
  const filteredVendors = vendors.filter((vendor) =>
    (vendor.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.contact_person_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.pan_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.gst_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryName = (category_name?: string) => {
    return category_name || '';
  };

  /* ---------------------------
     Category source: prefer PO Types, fallback to vendor-derived categories
  ----------------------------*/
  const categoryOptions = poTypes.length > 0 ? poTypes : categories;

  /* ---------------------------
     Helpers for conditional render
  ----------------------------*/
  const isCategoryMaterial = (cat?: string) => (cat || '').toLowerCase().includes('material');
  const isCategoryService = (cat?: string) => (cat || '').toLowerCase().includes('service');

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Vendors</h1>
          <p className="text-gray-600 mt-1">Manage your vendor database</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search vendors by name, PAN, GST, contact person or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading vendors...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{vendor.name}</h3>
                      <p className="text-sm text-gray-600">{getCategoryName(vendor.category_name)}</p>
                      {vendor.sub_item_id && (
                        <p className="text-xs text-gray-500 mt-1">Linked item ID: {vendor.sub_item_id}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {vendor.contact_person_name && (
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Contact Person</p>
                          <p className="text-sm font-medium text-gray-800">{vendor.contact_person_name}</p>
                        </div>
                      </div>
                    )}

                    {vendor.contact_person_phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-800">
                            {vendor.phone_country_code} {vendor.contact_person_phone}
                          </p>
                        </div>
                      </div>
                    )}

                    {vendor.contact_person_email && (
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-800">{vendor.contact_person_email}</p>
                        </div>
                      </div>
                    )}

                    {vendor.pan_number && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">PAN</p>
                          <p className="text-sm font-medium text-gray-800">{vendor.pan_number}</p>
                        </div>
                      </div>
                    )}

                    {vendor.gst_number && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">GST</p>
                          <p className="text-sm font-medium text-gray-800">{vendor.gst_number}</p>
                        </div>
                      </div>
                    )}

                    {(vendor.office_city || vendor.office_state) && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-800">
                            {[vendor.office_city, vendor.office_state].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(vendor)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit vendor"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(vendor.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete vendor"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredVendors.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No vendors found</p>
              <p className="text-gray-500 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Click "Add Vendor" to create your first vendor'}
              </p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="ABC Construction Pvt Ltd"
                        required
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>

                      <div className="flex gap-2">
                        <select
                          value={formData.category_name}
                          onChange={(e) => {
                            // reset sub_item_id when category changed
                            setFormData({ ...formData, category_name: e.target.value, sub_item_id: '' });
                          }}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category_name ? 'border-red-300' : 'border-gray-300'
                            }`}
                          required
                        >
                          <option value="">Select Category</option>
                          {categoryOptions.map((cat) => (
                            <option key={cat.name} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {errors.category_name && <p className="mt-1 text-sm text-red-600">{errors.category_name}</p>}
                    </div>

                    {/* New conditional sub-item field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Sub Item (based on Category)</label>

                      {isCategoryMaterial(formData.category_name) && (
                        <select
                          value={formData.sub_item_id || ''}
                          onChange={(e) => setFormData({ ...formData, sub_item_id: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Material</option>
                          {materials.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} {m.code ? `| ${m.code}` : ''} {m.hsn ? `| HSN: ${m.hsn}` : ''}
                            </option>
                          ))}
                        </select>
                      )}

                      {isCategoryService(formData.category_name) && (
                        <select
                          value={formData.sub_item_id || ''}
                          onChange={(e) => setFormData({ ...formData, sub_item_id: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Service</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} {s.code ? `| ${s.code}` : ''}
                            </option>
                          ))}
                        </select>
                      )}

                      {!isCategoryMaterial(formData.category_name) && !isCategoryService(formData.category_name) && (
                        <div className="text-xs text-gray-500">Select a Category with "Material" or "Service" to pick sub-items.</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={formData.pan_number}
                        onChange={(e) =>
                          setFormData({ ...formData, pan_number: validators.formatPAN(e.target.value) })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.pan_number ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="ABCDE1234F"
                        maxLength={10}
                      />
                      {errors.pan_number && <p className="mt-1 text-sm text-red-600">{errors.pan_number}</p>}
                      {formData.pan_number && validators.pan(formData.pan_number) && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Valid PAN
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                      <input
                        type="text"
                        value={formData.gst_number}
                        onChange={(e) =>
                          setFormData({ ...formData, gst_number: validators.formatGST(e.target.value) })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase ${errors.gst_number ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="22ABCDE1234F1Z5"
                        maxLength={15}
                      />
                      {errors.gst_number && <p className="mt-1 text-sm text-red-600">{errors.gst_number}</p>}
                      {formData.gst_number && validators.gst(formData.gst_number) && (
                        <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Valid GST
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Person Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.contact_person_name}
                        onChange={(e) => setFormData({ ...formData, contact_person_name: e.target.value })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contact_person_name ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="John Doe"
                        required
                      />
                      {errors.contact_person_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.contact_person_name}</p>
                      )}
                    </div>

                    <div>
                      <PhoneInput
                        value={formData.contact_person_phone}
                        countryCode={formData.phone_country_code}
                        onChange={(phone) => setFormData({ ...formData, contact_person_phone: phone })}
                        onCountryCodeChange={(code) => setFormData({ ...formData, phone_country_code: code })}
                        label="Phone Number"
                        required
                        error={errors.contact_person_phone}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        value={formData.contact_person_email}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_person_email: e.target.value.toLowerCase() })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.contact_person_email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="john@example.com"
                        required
                      />
                      {errors.contact_person_email && (
                        <p className="mt-1 text-sm text-red-600">{errors.contact_person_email}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Office Address */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Office Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      <textarea
                        value={formData.office_street}
                        onChange={(e) => setFormData({ ...formData, office_street: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Building No, Street Name, Area"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={formData.office_city}
                        onChange={(e) => setFormData({ ...formData, office_city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Mumbai"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.office_state}
                        onChange={(e) => setFormData({ ...formData, office_state: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Maharashtra"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={formData.office_pincode}
                        onChange={(e) =>
                          setFormData({ ...formData, office_pincode: validators.formatPincode(e.target.value) })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.office_pincode ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="400001"
                        maxLength={6}
                      />
                      {errors.office_pincode && <p className="mt-1 text-sm text-red-600">{errors.office_pincode}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      <input
                        type="text"
                        value={formData.office_country}
                        onChange={(e) => setFormData({ ...formData, office_country: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="India"
                      />
                    </div>
                  </div>
                </div>

                {/* Company Contact */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Company Contact Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                      <input
                        type="email"
                        value={formData.company_email}
                        onChange={(e) => setFormData({ ...formData, company_email: e.target.value.toLowerCase() })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company_email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="info@company.com"
                      />
                      {errors.company_email && <p className="mt-1 text-sm text-red-600">{errors.company_email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
                      <input
                        type="tel"
                        value={formData.company_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, company_phone: validators.formatPhone(e.target.value) })
                        }
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.company_phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.company_phone && <p className="mt-1 text-sm text-red-600">{errors.company_phone}</p>}
                    </div>
                  </div>
                </div>

                {/* Manager Details */}
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Manager Details (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager Name</label>
                      <input
                        type="text"
                        value={formData.manager_name}
                        onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Jane Smith"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager Email</label>
                      <input
                        type="email"
                        value={formData.manager_email}
                        onChange={(e) => setFormData({ ...formData, manager_email: e.target.value.toLowerCase() })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.manager_email ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="jane@company.com"
                      />
                      {errors.manager_email && <p className="mt-1 text-sm text-red-600">{errors.manager_email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Manager Phone</label>
                      <input
                        type="tel"
                        value={formData.manager_phone}
                        onChange={(e) => setFormData({ ...formData, manager_phone: validators.formatPhone(e.target.value) })}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.manager_phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                        placeholder="9876543210"
                        maxLength={10}
                      />
                      {errors.manager_phone && <p className="mt-1 text-sm text-red-600">{errors.manager_phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  {submitting ? (editingId ? 'Updating...' : 'Creating...') : editingId ? 'Update Vendor' : 'Create Vendor'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
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
