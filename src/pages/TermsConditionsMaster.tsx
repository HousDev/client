import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FileText, X, Search, Star } from 'lucide-react';

interface TermFormData {
  id?: string;
  title: string;
  content: string;
  category: string;
  is_default: boolean;
  is_active?: boolean;
  created_at?: string;
}

const STORAGE_KEY = 'mock_terms_conditions_v1';

export default function TermsConditionsMaster() {
  const [terms, setTerms] = useState<TermFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TermFormData>({
    title: '',
    content: '',
    category: 'general',
    is_default: false,
    is_active: true,
    created_at: '',
  });

  // --- Load & seed ---
  useEffect(() => {
    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedIfEmpty = (): TermFormData[] => {
    const sample: TermFormData[] = [
      {
        id: 't1',
        title: 'Payment Terms - 30 Days',
        content: 'Payment due within 30 days from invoice date. Late payments may incur interest.',
        category: 'payment',
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 't2',
        title: 'Delivery Terms',
        content: 'Deliveries will be made to the project site during working hours. Any delays will be communicated.',
        category: 'delivery',
        is_default: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 't3',
        title: 'Warranty',
        content: 'Supplier provides a 12 month warranty for supplied materials under normal usage.',
        category: 'warranty',
        is_default: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  };

  const loadTerms = () => {
    setLoading(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded = seedIfEmpty();
        setTerms(seeded);
        return;
      }
      const parsed: TermFormData[] = JSON.parse(raw);
      // sort alphabetically by title
      parsed.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      setTerms(parsed);
    } catch (err) {
      console.error('Error reading terms (demo):', err);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const persist = (next: TermFormData[]) => {
    try {
      // keep sorted by title for UI parity
      next.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setTerms(next);
    } catch (err) {
      console.error('Error saving terms (demo):', err);
    }
  };

  // --- Helpers ---
  const generateId = (prefix = 't') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

  // --- CRUD handlers (localStorage-backed) ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // validation
    if (!formData.title.trim() || !formData.content.trim() || !formData.category.trim()) {
      alert('Please fill required fields: Title, Content, Category');
      return;
    }

    let next = [...terms];

    if (formData.is_default) {
      // ensure only one default - unset others
      next = next.map((t) => ({ ...t, is_default: false }));
    }

    if (editingId) {
      const idx = next.findIndex((t) => t.id === editingId);
      if (idx !== -1) {
        next[idx] = {
          ...next[idx],
          ...formData,
          id: editingId,
        };
      } else {
        // fallback - push
        next.push({ ...formData, id: editingId });
      }
      alert('Terms updated successfully!');
    } else {
      const newTerm: TermFormData = {
        ...formData,
        id: generateId('t'),
        created_at: new Date().toISOString(),
        is_active: formData.is_active ?? true,
      };
      next.push(newTerm);
      alert('Terms created successfully!');
    }

    persist(next);
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (term: TermFormData) => {
    setEditingId(term.id || null);
    setFormData({
      title: term.title,
      content: term.content,
      category: term.category,
      is_default: !!term.is_default,
      is_active: term.is_active ?? true,
      created_at: term.created_at ?? '',
      id: term.id,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this term?')) return;
    const next = terms.filter((t) => t.id !== id);
    persist(next);
    alert('Terms deleted successfully!');
  };

  const toggleActive = (id: string, currentStatus: boolean) => {
    const next = terms.map((t) => (t.id === id ? { ...t, is_active: !currentStatus } : t));
    persist(next);
  };

  const toggleDefault = (id: string, currentStatus: boolean) => {
    // if setting to true, unset others
    let next = [...terms];
    if (!currentStatus) {
      next = next.map((t) => ({ ...t, is_default: t.id === id }));
    } else {
      // removing default -> just set this to false
      next = next.map((t) => (t.id === id ? { ...t, is_default: false } : t));
    }
    persist(next);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      category: 'general',
      is_default: false,
      is_active: true,
      created_at: '',
    });
    setEditingId(null);
  };

  // --- filters & UI helpers ---
  const filteredTerms = terms.filter((term) => {
    const q = searchTerm.toLowerCase();
    return (
      term.title.toLowerCase().includes(q) ||
      term.content.toLowerCase().includes(q) ||
      term.category.toLowerCase().includes(q)
    );
  });

  const getCategoryColor = (category: string) => {
    const colors: any = {
      payment: 'bg-green-100 text-green-700',
      delivery: 'bg-blue-100 text-blue-700',
      quality: 'bg-purple-100 text-purple-700',
      warranty: 'bg-orange-100 text-orange-700',
      tax: 'bg-red-100 text-red-700',
      legal: 'bg-gray-100 text-gray-700',
      returns: 'bg-yellow-100 text-yellow-700',
      general: 'bg-slate-100 text-slate-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Terms & Conditions Master</h1>
          <p className="text-gray-600 mt-1">Manage terms and conditions for POs (demo/local)</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Terms
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by title, content, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTerms.map((term) => (
          <div key={term.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{term.title}</h3>
                  {term.is_default && (
                    <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" />
                      DEFAULT
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(term.category)}`}>
                    {term.category.toUpperCase()}
                  </span>
                  <button
                    onClick={() => toggleActive(term.id || '', !!term.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${term.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {term.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{term.content}</p>
              </div>

              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleDefault(term.id || '', !!term.is_default)}
                  className={`p-2 rounded-lg transition ${term.is_default ? 'text-yellow-600 hover:bg-yellow-50' : 'text-gray-400 hover:bg-gray-50'}`}
                  title={term.is_default ? 'Remove from default' : 'Set as default'}
                >
                  <Star className={`w-5 h-5 ${term.is_default ? 'fill-yellow-600' : ''}`} />
                </button>

                <button onClick={() => handleEdit(term)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                  <Edit2 className="w-5 h-5" />
                </button>

                <button onClick={() => handleDelete(term.id || '')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No terms found</h3>
          <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Add Terms" to create your first term'}</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Terms' : 'Add Terms'}</h2>
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
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment Terms - 30 Days"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="general">General</option>
                    <option value="payment">Payment</option>
                    <option value="delivery">Delivery</option>
                    <option value="quality">Quality</option>
                    <option value="warranty">Warranty</option>
                    <option value="tax">Tax</option>
                    <option value="legal">Legal</option>
                    <option value="returns">Returns</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content <span className="text-red-500">*</span></label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={6}
                    placeholder="Enter the full terms and conditions text..."
                    required
                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">Active</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_default"
                      checked={formData.is_default}
                      onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_default" className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-600" />
                      Set as default (auto-include in POs)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">
                  {editingId ? 'Update Terms' : 'Add Terms'}
                </button>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
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
