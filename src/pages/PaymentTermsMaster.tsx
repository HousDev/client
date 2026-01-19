// import { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, CreditCard, X, Search } from 'lucide-react';

// interface PaymentTermFormData {
//   name: string;
//   days: number;
//   description: string;
//   advance_percentage: number;
//   is_active?: boolean;
// }

// type PaymentTerm = PaymentTermFormData & { id: string };

// export default function PaymentTermsMaster() {
//   const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<PaymentTermFormData>({
//     name: '',
//     days: 0,
//     description: '',
//     advance_percentage: 0,
//     is_active: true,
//   });

//   const KEY_TERMS = 'mock_payment_terms_master_v1';

//   const defaultTerms: PaymentTerm[] = [
//     {
//       id: 'pt_30',
//       name: '30 Days Credit',
//       days: 30,
//       description: 'Payment within 30 days from invoice date',
//       advance_percentage: 0,
//       is_active: true,
//     },
//     {
//       id: 'pt_50_adv',
//       name: '50% Advance',
//       days: 0,
//       description: '50% advance on order, balance on delivery',
//       advance_percentage: 50,
//       is_active: true,
//     },
//     {
//       id: 'pt_immediate',
//       name: 'Immediate',
//       days: 0,
//       description: 'Immediate payment on delivery',
//       advance_percentage: 0,
//       is_active: false,
//     },
//   ];

//   useEffect(() => {
//     loadPaymentTerms();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadPaymentTerms = () => {
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         const raw = localStorage.getItem(KEY_TERMS);
//         let parsed: PaymentTerm[] = raw ? JSON.parse(raw) : [];
//         if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
//           parsed = defaultTerms;
//           localStorage.setItem(KEY_TERMS, JSON.stringify(parsed));
//         }
//         parsed.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//         setPaymentTerms(parsed);
//       } catch (err) {
//         console.error('Error loading payment terms from storage:', err);
//         setPaymentTerms([]);
//       } finally {
//         setLoading(false);
//       }
//     }, 120);
//   };

//   const persistTerms = (terms: PaymentTerm[]) => {
//     localStorage.setItem(KEY_TERMS, JSON.stringify(terms));
//     terms.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//     setPaymentTerms(terms);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       days: 0,
//       description: '',
//       advance_percentage: 0,
//       is_active: true,
//     });
//     setEditingId(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // basic validation
//     if (!formData.name.trim()) {
//       alert('Please enter a name for the payment term.');
//       return;
//     }
//     if (formData.advance_percentage < 0 || formData.advance_percentage > 100) {
//       alert('Advance percentage must be between 0 and 100.');
//       return;
//     }

//     if (editingId) {
//       // update
//       const updated = paymentTerms.map((t) =>
//         t.id === editingId ? { ...t, ...formData, name: formData.name.trim() } : t
//       );
//       persistTerms(updated);
//       alert('Payment terms updated successfully!');
//     } else {
//       // create
//       const id = `pt_${Date.now().toString(36)}`;
//       const newTerm: PaymentTerm = {
//         id,
//         name: formData.name.trim(),
//         days: Number(formData.days || 0),
//         description: formData.description || '',
//         advance_percentage: Number(formData.advance_percentage || 0),
//         is_active: formData.is_active ?? true,
//       };
//       persistTerms([...paymentTerms, newTerm]);
//       alert('Payment terms created successfully!');
//     }

//     setShowModal(false);
//     resetForm();
//   };

//   const handleEdit = (term: PaymentTerm) => {
//     setEditingId(term.id);
//     setFormData({
//       name: term.name,
//       days: term.days,
//       description: term.description || '',
//       advance_percentage: term.advance_percentage,
//       is_active: term.is_active ?? true,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (id: string) => {
//     if (!confirm('Are you sure you want to delete this payment term?')) return;
//     const updated = paymentTerms.filter((t) => t.id !== id);
//     persistTerms(updated);
//     alert('Payment terms deleted successfully!');
//   };

//   const toggleActive = (id: string, currentStatus?: boolean) => {
//     const updated = paymentTerms.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t));
//     persistTerms(updated);
//   };

//   const filteredTerms = paymentTerms.filter((term) => {
//     if (!searchTerm) return true;
//     const q = searchTerm.toLowerCase();
//     return (
//       (term.name || '').toLowerCase().includes(q) ||
//       (term.description || '').toLowerCase().includes(q)
//     );
//   });

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading payment terms...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Payment Terms Master</h1>
//           <p className="text-gray-600 mt-1">Manage payment terms and conditions (demo)</p>
//         </div>
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-5 h-5" />
//           Add Payment Terms
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search by name or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50 border-b border-gray-200">
//               <tr>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Credit Days</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Advance %</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Description</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
//                 <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {filteredTerms.map((term) => (
//                 <tr key={term.id} className="hover:bg-gray-50 transition">
//                   <td className="px-6 py-4">
//                     <div className="flex items-center gap-2">
//                       <CreditCard className="w-4 h-4 text-blue-600" />
//                       <span className="font-medium text-gray-800">{term.name}</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">
//                     {term.days > 0 ? `${term.days} days` : 'Immediate'}
//                   </td>
//                   <td className="px-6 py-4">
//                     {term.advance_percentage > 0 ? (
//                       <span className="font-medium text-orange-600">{term.advance_percentage}%</span>
//                     ) : (
//                       <span className="text-gray-500">0%</span>
//                     )}
//                   </td>
//                   <td className="px-6 py-4 text-gray-700">{term.description || '-'}</td>
//                   <td className="px-6 py-4">
//                     <button
//                       onClick={() => toggleActive(term.id, term.is_active)}
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${term.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
//                         }`}
//                     >
//                       {term.is_active ? 'ACTIVE' : 'INACTIVE'}
//                     </button>
//                   </td>
//                   <td className="px-6 py-4">
//                     <div className="flex gap-2">
//                       <button
//                         onClick={() => handleEdit(term)}
//                         className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
//                         title="Edit"
//                       >
//                         <Edit2 className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(term.id)}
//                         className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                         title="Delete"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {filteredTerms.length === 0 && (
//           <div className="text-center py-12">
//             <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-lg font-semibold text-gray-800 mb-2">No payment terms found</h3>
//             <p className="text-gray-600">
//               {searchTerm
//                 ? 'Try a different search term'
//                 : 'Click "Add Payment Terms" to create your first payment term'}
//             </p>
//           </div>
//         )}
//       </div>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">
//                 {editingId ? 'Edit Payment Terms' : 'Add Payment Terms'}
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

//             <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//               <div className="space-y-6 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="30 Days Credit"
//                     required
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Credit Days</label>
//                     <input
//                       type="number"
//                       value={formData.days}
//                       onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 0 })}
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="30"
//                       min="0"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">0 = Immediate payment</p>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Advance Percentage</label>
//                     <input
//                       type="number"
//                       value={formData.advance_percentage}
//                       onChange={(e) =>
//                         setFormData({ ...formData, advance_percentage: parseFloat(e.target.value) || 0 })
//                       }
//                       className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="50"
//                       min="0"
//                       max="100"
//                       step="0.01"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">0-100%</p>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                   <textarea
//                     value={formData.description}
//                     onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                     className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     rows={3}
//                     placeholder="Payment within 30 days from invoice date"
//                   />
//                 </div>

//                 {formData.advance_percentage > 0 && (
//                   <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
//                     <p className="text-sm font-medium text-orange-800">
//                       Advance Payment Required: {formData.advance_percentage}%
//                     </p>
//                     <p className="text-xs text-orange-600 mt-1">This percentage will be auto-calculated from PO total</p>
//                   </div>
//                 )}
//               </div>

//               <div className="flex gap-3 pt-6 border-t">
//                 <button
//                   type="submit"
//                   className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
//                 >
//                   {editingId ? 'Update Payment Terms' : 'Add Payment Terms'}
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




import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CreditCard, X, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentTermFormData {
  name: string;
  days: number;
  description: string;
  advance_percentage: number;
  is_active?: boolean;
}

type PaymentTerm = PaymentTermFormData & { id: string };

export default function PaymentTermsMaster() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Search states for each column
  const [searchName, setSearchName] = useState('');
  const [searchDays, setSearchDays] = useState('');
  const [searchDescription, setSearchDescription] = useState('');
  
  // Bulk selection
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  
  const [formData, setFormData] = useState<PaymentTermFormData>({
    name: "",
    days: 0,
    description: "",
    advance_percentage: 0,
    is_active: true,
  });

  const KEY_TERMS = "mock_payment_terms_master_v1";

  const defaultTerms: PaymentTerm[] = [
    {
      id: "pt_30",
      name: "30 Days Credit",
      days: 30,
      description: "Payment within 30 days from invoice date",
      advance_percentage: 0,
      is_active: true,
    },
    {
      id: "pt_50_adv",
      name: "50% Advance",
      days: 0,
      description: "50% advance on order, balance on delivery",
      advance_percentage: 50,
      is_active: true,
    },
    {
      id: "pt_immediate",
      name: "Immediate",
      days: 0,
      description: "Immediate payment on delivery",
      advance_percentage: 0,
      is_active: false,
    },
  ];

  useEffect(() => {
    loadPaymentTerms();
  }, []);

  const loadPaymentTerms = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const raw = localStorage.getItem(KEY_TERMS);
        let parsed: PaymentTerm[] = raw ? JSON.parse(raw) : [];
        if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
          parsed = defaultTerms;
          localStorage.setItem(KEY_TERMS, JSON.stringify(parsed));
        }
        parsed.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setPaymentTerms(parsed);
        toast.success('Payment terms loaded successfully!');
      } catch (err) {
        console.error("Error loading payment terms from storage:", err);
        setPaymentTerms([]);
        toast.error('Failed to load payment terms.');
      } finally {
        setLoading(false);
      }
    }, 120);
  };

  const persistTerms = (terms: PaymentTerm[]) => {
    localStorage.setItem(KEY_TERMS, JSON.stringify(terms));
    terms.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    setPaymentTerms(terms);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      days: 0,
      description: "",
      advance_percentage: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a name for the payment term.');
      return;
    }
    if (formData.advance_percentage < 0 || formData.advance_percentage > 100) {
      toast.error('Advance percentage must be between 0 and 100.');
      return;
    }

    try {
      if (editingId) {
        const updated = paymentTerms.map((t) =>
          t.id === editingId ? { ...t, ...formData, name: formData.name.trim() } : t
        );
        persistTerms(updated);
        toast.success('Payment terms updated successfully!');
      } else {
        const id = `pt_${Date.now().toString(36)}`;
        const newTerm: PaymentTerm = {
          id,
          name: formData.name.trim(),
          days: Number(formData.days || 0),
          description: formData.description || '',
          advance_percentage: Number(formData.advance_percentage || 0),
          is_active: formData.is_active ?? true,
        };
        persistTerms([...paymentTerms, newTerm]);
        toast.success('Payment terms created successfully!');
      }

      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving payment term:', error);
      toast.error('Failed to save payment term.');
    }
  };

  const handleEdit = (term: PaymentTerm) => {
    setEditingId(term.id);
    setFormData({
      name: term.name,
      days: term.days,
      description: term.description || "",
      advance_percentage: term.advance_percentage,
      is_active: term.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment term?')) return;
    
    try {
      const updated = paymentTerms.filter((t) => t.id !== id);
      persistTerms(updated);
      // Remove from selected items if it was selected
      setSelectedTerms(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success('Payment terms deleted successfully!');
    } catch (error) {
      console.error('Error deleting payment term:', error);
      toast.error('Failed to delete payment term.');
    }
  };

  // Bulk delete terms
  const handleBulkDelete = () => {
    if (selectedTerms.size === 0) {
      toast.error('Please select at least one payment term to delete.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedTerms.size} payment term(s)?`)) return;

    setSubmitting(true);
    try {
      const updated = paymentTerms.filter((t) => !selectedTerms.has(t.id));
      persistTerms(updated);
      setSelectedTerms(new Set());
      setSelectAll(false);
      toast.success(`Successfully deleted ${selectedTerms.size} payment term(s)!`);
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast.error('Failed to delete payment terms.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = (id: string, currentStatus?: boolean) => {
    try {
      const updated = paymentTerms.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t));
      persistTerms(updated);
      toast.success(`Payment term ${!currentStatus ? "activated" : "deactivated"}!`);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Failed to toggle status.');
    }
  };

  // Bulk toggle active status
  const handleBulkToggleActive = (activate: boolean) => {
    if (selectedTerms.size === 0) {
      toast.error('Please select at least one payment term.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = paymentTerms.map((t) =>
        selectedTerms.has(t.id) ? { ...t, is_active: activate } : t
      );
      persistTerms(updated);
      toast.success(`${selectedTerms.size} payment term(s) ${activate ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error in bulk toggle:', error);
      toast.error('Failed to update payment terms.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle item selection
  const handleSelectTerm = (id: string) => {
    const newSelected = new Set(selectedTerms);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTerms(newSelected);
    setSelectAll(newSelected.size === filteredTerms.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTerms(new Set());
    } else {
      const allIds = new Set(filteredTerms.map(term => term.id));
      setSelectedTerms(allIds);
    }
    setSelectAll(!selectAll);
  };

  const filteredTerms = paymentTerms.filter((term) => {
    const matchesName = !searchName || 
      (term.name || '').toLowerCase().includes(searchName.toLowerCase());
    
    const matchesDays = !searchDays || 
      String(term.days || '').includes(searchDays);
    
    const matchesDescription = !searchDescription || 
      (term.description || '').toLowerCase().includes(searchDescription.toLowerCase());
    
    return matchesName && matchesDays && matchesDescription;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header with Bulk Actions */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] rounded-xl shadow-md p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Terms Master</h1>
                <p className="text-sm text-white/90 font-medium mt-0.5">
                  Manage payment terms and conditions
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedTerms.size > 0 && (
                <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
                  <button
                    onClick={() => handleBulkToggleActive(true)}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-3 py-1.5 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Activate ({selectedTerms.size})
                  </button>
                  <button
                    onClick={() => handleBulkToggleActive(false)}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white px-3 py-1.5 rounded-xl hover:from-yellow-700 hover:to-amber-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deactivate ({selectedTerms.size})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={submitting}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-3 py-1.5 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 text-xs font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Delete ({selectedTerms.size})
                  </button>
                  <div className="text-xs text-white font-medium px-2 py-1 bg-white/20 rounded-lg">
                    {selectedTerms.size} selected
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5" />
                Add Payment Terms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table with Search and Checkboxes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <button
                    onClick={handleSelectAll}
                    className="p-1 hover:bg-gray-300 rounded transition-colors"
                  >
                    {selectAll ? (
                      <CheckSquare className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Name
                  </div>
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Credit Days
                  </div>
                  <input
                    type="text"
                    placeholder="Search days..."
                    value={searchDays}
                    onChange={(e) => setSearchDays(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                    Description
                  </div>
                  <input
                    type="text"
                    placeholder="Search description..."
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-[#C62828] focus:border-transparent"
                  />
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Advance %
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-6 py-3 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTerms.map((term) => {
                const isSelected = selectedTerms.has(term.id);
                return (
                  <tr 
                    key={term.id} 
                    className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSelectTerm(term.id)}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800">{term.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {term.days > 0 ? `${term.days} days` : 'Immediate'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">{term.description || '-'}</td>
                    <td className="px-6 py-4">
                      {term.advance_percentage > 0 ? (
                        <span className="font-medium text-orange-600">{term.advance_percentage}%</span>
                      ) : (
                        <span className="text-gray-500">0%</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(term.id, term.is_active)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          term.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {term.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No payment terms found
            </h3>
            <p className="text-gray-600">
              {searchName || searchDays || searchDescription
                ? 'Try a different search term'
                : 'Click "Add Payment Terms" to create your first payment term'}
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? 'Edit Payment Terms' : 'Add Payment Terms'}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? 'Update payment terms details' : 'Add new payment terms'}
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

            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-3 mb-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="30 Days Credit"
                      required
                    />
                  </div>
                </div>

                {/* Credit Days & Advance Percentage */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Credit Days
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={formData.days}
                        onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="30"
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">0 = Immediate payment</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Advance Percentage
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={formData.advance_percentage}
                        onChange={(e) =>
                          setFormData({ ...formData, advance_percentage: parseFloat(e.target.value) || 0 })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="50"
                        min="0"
                        max="100"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">0-100%</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Description
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[80px] resize-vertical"
                      rows={2}
                      placeholder="Payment within 30 days from invoice date"
                    />
                  </div>
                </div>

                {formData.advance_percentage > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-orange-800">
                      Advance Payment Required: {formData.advance_percentage}%
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      This percentage will be auto-calculated from PO total
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {editingId ? 'Update Payment Terms' : 'Add Payment Terms'}
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

            {/* Custom scrollbar */}
            <style jsx>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}