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
} from "lucide-react";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { TermsCondition } from "../lib/termsConditionsApi";
import vendorApi from "../lib/vendorApi";

const STORAGE_KEY = "mock_terms_conditions_v1";
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

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  id,
}: {
  options: [];
  value: Number;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize options to {id,name}
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt
  );

  const selected = normalized.find((o) => Number(o.id) === value) || null;

  const filtered = normalized.filter((o: any) =>
    o.name.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    if (!open) setFilter("");
    setHighlight(0);
  }, [open]);

  // close on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[highlight];
      if (opt) {
        onChange(opt.id);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={`w-full flex items-center gap-2 px-3 py-3 border rounded-lg bg-white cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"
        }`}
        onClick={() => !disabled && setOpen((s) => !s)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        id={id}
      >
        <div className="flex-1 text-left">
          {selected ? (
            <div className="text-sm text-gray-800">{selected.name}</div>
          ) : (
            <div className="text-sm text-gray-400">{placeholder}</div>
          )}
        </div>
        <div>
          <svg
            className={`w-4 h-4 transform transition ${
              open ? "rotate-180" : ""
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.585l3.71-3.396a.75.75 0 111.02 1.1l-4.185 3.833a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
          </svg>
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
          {/* search input */}
          <div className="p-2">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-60 overflow-y-auto divide-y divide-gray-100"
          >
            {filtered.length === 0 ? (
              <li className="p-3 text-sm text-gray-500">No results</li>
            ) : (
              filtered.map((opt, idx) => (
                <li
                  key={opt.id}
                  role="option"
                  aria-selected={opt.id === value}
                  className={`px-3 py-2 cursor-pointer text-sm ${
                    idx === highlight ? "bg-blue-50" : "hover:bg-gray-50"
                  } ${
                    opt.id === value
                      ? "font-medium text-gray-800"
                      : "text-gray-700"
                  }`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => {
                    onChange(opt.id);
                    setOpen(false);
                  }}
                >
                  {opt.name}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
      {/* hidden input to keep form semantics if you want to submit native form */}
      <input type="hidden" value={String(value)} />
    </div>
  );
}

export default function TermsConditionsMaster() {
  const [terms, setTerms] = useState<TermsCondition[]>([]);
  const [allVendors, setAllVendors] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<TermsCondition>({
    id: 0,
    vendor_id: 0,
    title: "",
    content: "",
    category: "general",
    is_default: false,
    is_active: true,
    created_at: "",
  });
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [showSubFilterOption, setShowSubFilterOption] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<any>("");
  const [filteredTerms, setFilteredTerms] = useState<TermsCondition[] | []>([]);

  const seedIfEmpty = (): TermsCondition[] => {
    const sample: TermsCondition[] = [
      {
        id: 0,
        vendor_id: 0,
        title: "Payment Terms - 30 Days",
        content:
          "Payment due within 30 days from invoice date. Late payments may incur interest.",
        category: "payment",
        is_default: true,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 0,
        title: "Delivery Terms",
        vendor_id: 0,
        content:
          "Deliveries will be made to the project site during working hours. Any delays will be communicated.",
        category: "delivery",
        is_default: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 0,
        title: "Warranty",
        vendor_id: 0,
        content:
          "Supplier provides a 12 month warranty for supplied materials under normal usage.",
        category: "warranty",
        is_default: false,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    return sample;
  };
  const loadAllVendors = async () => {
    try {
      const vendorRes = await vendorApi.getVendors();
      setAllVendors(vendorRes ?? []);
      console.log(vendorRes, "all vendors");
    } catch (error) {
      console.log(error);
    }
  };

  const loadTerms = async () => {
    setLoading(true);
    try {
      const response = await TermsConditionsApi.getAllTC();
      setTerms(response ?? []);
      // console.log(response, "all responnse");

      // const raw = localStorage.getItem(STORAGE_KEY);
      // if (!raw) {
      //   const seeded = seedIfEmpty();
      //   setTerms(seeded);
      //   return;
      // }
      // const parsed: TermsCondition[] = JSON.parse(raw);
      // // sort alphabetically by title
      // parsed.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      // setTerms(parsed);
    } catch (err) {
      console.error("Error reading terms (demo):", err);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };
  // --- Load & seed ---
  useEffect(() => {
    loadAllVendors();
    loadTerms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (next: TermsCondition[]) => {
    try {
      // keep sorted by title for UI parity
      next.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setTerms(next);
    } catch (err) {
      console.error("Error saving terms (demo):", err);
    }
  };

  // --- Helpers ---

  // --- CRUD handlers (localStorage-backed) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // console.log(formData, "from form submit");
    // validation
    if (
      !formData.vendor_id ||
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.category.trim()
    ) {
      alert("Please fill required fields: Title, Content, Category");
      return;
    }
    const payload = {
      vendor_id: formData.vendor_id,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      is_default: formData.is_default,
      is_active: formData.is_active,
    };

    if (editingId) {
      try {
        const updateRes: any = await TermsConditionsApi.updateTC(
          editingId,
          payload
        );
        if (updateRes.status) {
          loadTerms();
          alert("Terms Updated Successfully!");
        } else {
          alert("Terms Updated Faild!");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const createRes: any = await TermsConditionsApi.createTC(payload);
        if (createRes.status) {
          loadTerms();
          alert("Terms Created Successfully!");
        } else {
          alert("Terms Created Faild!");
        }
      } catch (error) {
        console.log(error);
      }
    }

    // persist(next);
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (term: TermsCondition) => {
    setEditingId(term.id || null);
    setFormData({
      vendor_id: term.vendor_id,
      title: term.title,
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
      if (!confirm("Are you sure you want to delete this term?")) return;
      const deleteRes = await TermsConditionsApi.deleteTC(id);
      if (deleteRes.status) {
        loadTerms();
        alert("Terms deleted successfully!");
      } else {
        alert("Terms deleted Faild!");
      }
      // const next = terms.filter((t) => t.id !== id);
      // persist(next);
    } catch (error) {
      console.log(error);
    }
  };

  const toggleActive = (id: number, currentStatus: boolean) => {
    const next = terms.map((t) =>
      t.id === id ? { ...t, is_active: !currentStatus } : t
    );
    persist(next);
  };

  const toggleDefault = async (id: number, currentStatus: boolean) => {
    try {
      const updateIsDefaultRes = await TermsConditionsApi.updateIsDefaultTC(
        id,
        !currentStatus
      );
      if (updateIsDefaultRes.status) {
        if (currentStatus) {
          alert("Set to default.");
        } else {
          alert("Removed From Default");
        }
        loadTerms();
      } else {
        alert("Faild to update default.");
      }
    } catch (error) {
      console.log(error);
    }
    // if setting to true, unset others
    // let next = [...terms];
    // if (!currentStatus) {
    //   next = next.map((t) => ({ ...t, is_default: t.id === id }));
    // } else {
    //   // removing default -> just set this to false
    //   next = next.map((t) => (t.id === id ? { ...t, is_default: false } : t));
    // }
    // persist(next);
  };

  const resetForm = () => {
    setFormData({
      id: 0,
      vendor_id: 0,
      title: "",
      content: "",
      category: "general",
      is_default: false,
      is_active: true,
      created_at: "",
    });
    setEditingId(null);
  };

  // --- filters & UI helpers ---
  // let filteredTerms = terms.filter((term) => {
  //   const q = searchTerm.toLowerCase();
  //   return (
  //     term.title.toLowerCase().includes(q) ||
  //     term.content.toLowerCase().includes(q) ||
  //     term.category.toLowerCase().includes(q)
  //   );
  // });
  const filterForSearch = () => {
    const data = terms.filter((term) => {
      const q = searchTerm.toLowerCase();
      return (
        term.title.toLowerCase().includes(q) ||
        term.content.toLowerCase().includes(q) ||
        term.category.toLowerCase().includes(q)
      );
    });
    setFilteredTerms(data);
  };
  useEffect(() => {
    filterForSearch();
  }, [terms]);

  const filterData = () => {
    let data: any = [];
    if (typeof selectedFilter === "string") {
      data = terms.filter((d) => d.category === selectedFilter);
    } else if (typeof selectedFilter === "boolean") {
      data = terms.filter((d) => d.is_active && selectedFilter);
    } else {
      data = terms;
    }
    setFilteredTerms(data);
  };
  useEffect(() => {
    filterData();
  }, [selectedFilter]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowFilterOptions(false); // hide ul
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
    <div className="p-3">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Terms & Conditions Master
          </h1>
          <p className="text-gray-600 mt-1">
            Manage terms and conditions for POs (demo/local)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Terms
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-3.4 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by title, content, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => {
                setShowFilterOptions((prev) => !prev);
              }}
            >
              <Filter className="mx-3 cursor-pointer" />
            </button>
            {showFilterOptions && (
              <ul className="absolute bg-white shadow-lg -left-24 top-7 border border-slate-300 rounded-lg">
                <li className="w-40 pl-3 py-2 cursor-pointer font-sm">
                  <button
                    onClick={() => {
                      setSelectedFilter(null);
                    }}
                  >
                    Show All
                  </button>
                </li>
                {CATEGORY_OPTIONS.map((d) => (
                  <li className="w-40 pl-3 py-2 cursor-pointer font-sm">
                    <button
                      onClick={() => {
                        setShowSubFilterOption(
                          showSubFilterOption.length > 0 ||
                            showSubFilterOption === d.name
                            ? ""
                            : d.name
                        );
                      }}
                      className="flex justify-between items-center w-full"
                    >
                      {d.name}
                      <ChevronDown />
                    </button>
                    {showSubFilterOption === d.name && (
                      <ul className=" h-40 overflow-y-scroll">
                        {d.values.map((i) => (
                          <li
                            className="px-6 py-2 hover:bg-slate-100 cursor-pointer font-sm"
                            onClick={() => {
                              console.log(i.value);
                              setSelectedFilter(i.value);
                            }}
                          >
                            {i.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Active
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 border-b">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredTerms.map((term) => (
                <tr key={term.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {allVendors.find((v: any) => v.id === term.vendor_id)
                      ?.name || "-"}
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-800">
                    {term.title}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate">
                    {term.content}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                        term.category
                      )}`}
                    >
                      {term.category.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        term.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {term.is_active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDefault(term.id, !!term.is_default)}
                      className={`p-2 rounded-lg transition ${
                        term.is_default
                          ? "text-yellow-600 hover:bg-yellow-50"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                      title={
                        term.is_default
                          ? "Remove from default"
                          : "Set as default"
                      }
                    >
                      <Star
                        className={`w-4 h-4 ${
                          term.is_default ? "fill-yellow-600" : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleEdit(term)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(term.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTerms.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No terms found
          </h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try a different search term"
              : 'Click "Add Terms" to create your first term'}
          </p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? "Edit Terms" : "Add Terms"}
              </h2>
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

            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
            >
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor <span className="text-red-500">*</span>
                </label>
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
              <div className="space-y-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment Terms - 30 Days"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is_active"
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Active
                    </label>
                  </div>

                  <div className="flex items-center">
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
                    <label
                      htmlFor="is_default"
                      className="ml-2 text-sm font-medium text-gray-700 flex items-center gap-2"
                    >
                      <Star className="w-4 h-4 text-yellow-600" />
                      Set as default (auto-include in POs)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  {editingId ? "Update Terms" : "Add Terms"}
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
