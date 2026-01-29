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
import { Plus, Edit2, Trash2, CreditCard, X, Search, CheckSquare, Square, Loader2, XCircle } from 'lucide-react';
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
  const [searchAdvance, setSearchAdvance] = useState('');
const [searchStatus, setSearchStatus] = useState('');

  
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
       
      } catch (err) {
        console.error("Error loading payment terms from storage:", err);
        setPaymentTerms([]);
     
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
  
  // NEW: Advance % search
  const matchesAdvance = !searchAdvance || 
    String(term.advance_percentage || '').includes(searchAdvance);
  
  // NEW: Status search
  const matchesStatus = !searchStatus || 
    (term.is_active ? "active" : "inactive").includes(searchStatus.toLowerCase());
  
  return matchesName && matchesDays && matchesDescription && matchesAdvance && matchesStatus;
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
    <div className="px-0 bg-gray-50 min-h-screen">
      {/* Header with Bulk Actions and Add Button in one line */}
      <div className="mt-0 mb-0 px-2 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
        <div></div>
        
        <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
          {/* Bulk Actions */}
          {selectedTerms.size > 0 && (
            <div className="
              flex items-center gap-0.5
              bg-gradient-to-r from-red-50 to-rose-50
              border border-red-200
              rounded-md
              shadow-sm
              px-1.5 py-0.5
              md:px-2 md:py-2
              whitespace-nowrap px-0
            ">
              {/* Selected Count */}
              <div className="flex items-center gap-0.5">
                <div className="bg-red-100 p-0.5 rounded">
                  <Trash2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600" />
                </div>
                <p className="font-medium text-[9px] md:text-xs text-gray-800">
                  {selectedTerms.size} selected
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={submitting}
                  className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Activate
                </button>
                <button
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={submitting}
                  className="bg-yellow-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Deactivate
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={submitting}
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Divider (desktop only) */}
          <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

          {/* Add Payment Terms Button */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="
              flex items-center gap-1
              bg-gradient-to-r from-[#C62828] to-red-600
              text-white
              px-2.5 py-1
              md:px-4 md:py-2
              rounded-lg
              text-[10px] md:text-sm
              font-medium
              shadow-sm
              whitespace-nowrap
              ml-auto md:ml-0
            "
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            Add Payment Terms 
          </button>
        </div>
      </div>

      {/* Main Table with Search Bars below header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Credit Days
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Description
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Advance %
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>
              
              {/* Search Row - Below header */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>
                
                {/* Name Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Days Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search days..."
                    value={searchDays}
                    onChange={(e) => setSearchDays(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Description Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search description..."
                    value={searchDescription}
                    onChange={(e) => setSearchDescription(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                
                {/* Advance % Search */}
               {/* Advance % Search - FIXED */}
<td className="px-3 md:px-4 py-1">
  <input
    type="text"
    placeholder="Search advance %..."
    value={searchAdvance}  // CHANGE THIS
    onChange={(e) => setSearchAdvance(e.target.value)}  // ADD THIS
    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
  />
</td>
                
                {/* Status Search */}
                {/* Status Search - FIXED */}
<td className="px-3 md:px-4 py-1">
  <input
    type="text"
    placeholder="Search status..."
    value={searchStatus}  // CHANGE THIS
    onChange={(e) => setSearchStatus(e.target.value)}  // ADD THIS
    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
  />
</td>
                
                {/* Actions - Clear Filter Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
  onClick={() => {
    setSearchName('');
    setSearchDays('');
    setSearchDescription('');
    setSearchAdvance('');  // ADD THIS
    setSearchStatus('');   // ADD THIS
  }}
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
                const isSelected = selectedTerms.has(term.id);
                return (
                  <tr 
                    key={term.id} 
                    className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-3 md:px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTerm(term.id)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-gray-800 text-xs md:text-sm">{term.name}</span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {term.days > 0 ? `${term.days} days` : 'Immediate'}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">{term.description || '-'}</td>
                    <td className="px-3 md:px-4 py-3">
                      {term.advance_percentage > 0 ? (
                        <span className="font-medium text-orange-600 text-xs md:text-sm">{term.advance_percentage}%</span>
                      ) : (
                        <span className="text-gray-500 text-xs md:text-sm">0%</span>
                      )}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <button
                        onClick={() => toggleActive(term.id, term.is_active)}
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          term.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {term.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </button>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(term.id)}
                          className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredTerms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">No Payment Terms Found</p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
  {searchName || searchDays || searchDescription || searchAdvance || searchStatus
    ? "Try a different search term"
    : "No payment terms available"}
</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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