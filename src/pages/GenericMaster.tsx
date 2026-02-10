// src/components/GenericMaster.tsx
import React, { useEffect, useState } from "react";
import { api, unwrap } from "../lib/Api";
import poTypeApi from "../lib/poTypeApi"; // existing
import serviceTypeApi from "../lib/serviceTypeApi"; // newly integrated
import { Plus, Edit2, Trash2, X, Search, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type Props = {
  tableName: string; // e.g. "po_types" or "service_types"
  title?: string;
  description?: string;
  icon?: any;
};

type Row = {
  id: string | number;
  name: string;
  description?: string | null;
  is_active?: boolean;
  [k: string]: any;
};

export default function GenericMaster({ tableName, title, description, icon: Icon }: Props) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState({ name: "", description: "", is_active: true });
  const [search, setSearch] = useState("");

  // Map tableName to specific API wrapper if available
  const apiMap: Record<string, any> = {
    po_types: poTypeApi,
    service_types: serviceTypeApi,
  };

  // Also support dash-style endpoint names if you ever pass 'service-types'
  const canonicalName = tableName.replace(/-/g, "_");
  const selectedApi = apiMap[canonicalName];

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableName]);

  const load = async () => {
    setLoading(true);
    try {
      let data: any;

      // PO Types have a custom naming in poTypeApi (getPOTypes)
      if (canonicalName === "po_types" && selectedApi && typeof selectedApi.getPOTypes === "function") {
        data = await selectedApi.getPOTypes();
      }
      // service_types -> serviceTypeApi.getAll
      else if (canonicalName === "service_types" && selectedApi && typeof selectedApi.getAll === "function") {
        data = await selectedApi.getAll(true);
      }
      // generic api wrapper convention if selectedApi exposes getAll
      else if (selectedApi && typeof selectedApi.getAll === "function") {
        data = await selectedApi.getAll();
      }
      // fallback to REST convention /api/<tableName> (use original tableName so backend path matches)
      else {
        const res = await api.get(`/${tableName}`);
        data = unwrap(res);
      }

      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("GenericMaster load error", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", is_active: true });
    setShowModal(true);
  };

  const openEdit = (r: Row) => {
    setEditing(r);
    setForm({
      name: r.name || "",
      description: r.description || "",
      is_active: r.is_active ?? true,
    });
    setShowModal(true);
  };

  // CREATE
  const doCreate = async (payload: any) => {
    // PO types use createPOType naming
    if (canonicalName === "po_types" && selectedApi && typeof selectedApi.createPOType === "function") {
      return selectedApi.createPOType(payload);
    }
    // service_types use serviceTypeApi.create
    if (canonicalName === "service_types" && selectedApi && typeof selectedApi.create === "function") {
      return selectedApi.create(payload);
    }
    // generic wrappers
    if (selectedApi && typeof selectedApi.create === "function") {
      return selectedApi.create(payload);
    }
    // fallback to REST POST /<tableName>
    const res = await api.post(`/${tableName}`, payload);
    return unwrap(res);
  };

  // UPDATE
  const doUpdate = async (id: string | number, payload: any) => {
    if (canonicalName === "po_types" && selectedApi && typeof selectedApi.updatePOType === "function") {
      return selectedApi.updatePOType(id, payload);
    }
    if (canonicalName === "service_types" && selectedApi && typeof selectedApi.update === "function") {
      return selectedApi.update(id, payload);
    }
    if (selectedApi && typeof selectedApi.update === "function") {
      return selectedApi.update(id, payload);
    }
    const res = await api.put(`/${tableName}/${id}`, payload);
    return unwrap(res);
  };

  // DELETE
  const doDelete = async (id: string | number) => {
    if (canonicalName === "po_types" && selectedApi && typeof selectedApi.deletePOType === "function") {
      return selectedApi.deletePOType(id);
    }
    if (canonicalName === "service_types" && selectedApi && typeof selectedApi.remove === "function") {
      return selectedApi.remove(id);
    }
    if (selectedApi && typeof selectedApi.delete === "function") {
      return selectedApi.delete(id);
    }
    const res = await api.delete(`/${tableName}/${id}`);
    return unwrap(res);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!form.name || form.name.trim() === "") {
      toast.error("Name is required");
      return;
    }
    try {
      if (editing) {
        await doUpdate(editing.id, { ...form });
        toast.error("Updated");
      } else {
        await doCreate({ ...form });
        toast.error("Created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      console.error("GenericMaster save error", err);
      toast.error("Error saving record");
    }
  };

  const handleDelete = async (row: Row) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await doDelete(row.id);
      load();
      toast.error("Deleted");
    } catch (err) {
      console.error("GenericMaster delete error", err);
      toast.error("Error deleting record");
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.name || "").toString().toLowerCase().includes(q) || (r.description || "").toString().toLowerCase().includes(q);
  });

  return (
    <div className="mt-4 sm:mt-5 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
      {/* UPDATED HEADER: Mobile in one line, desktop layout unchanged */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 sm:flex-row sm:justify-between sm:items-center">
        {/* Title - Left side (mobile and desktop) */}
        <div className="flex items-center gap-2 min-w-0 flex-shrink">
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#C62828] flex-shrink-0" />}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              {title || tableName.replace("_", " ").toUpperCase()}
            </h2>
            {description && (
              <p className="text-xs sm:text-sm text-gray-500 mt-1 hidden sm:block">{description}</p>
            )}
          </div>
        </div>

        {/* Desktop: Search + Add in one line */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-48 pl-10 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 transition"
              placeholder="Search..."
            />
          </div>
          
          <button 
            onClick={openCreate} 
            className="bg-gradient-to-r from-[#C62828] to-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add New</span>
          </button>
        </div>

        {/* Mobile: Only Add button in header */}
        <button 
          onClick={openCreate} 
          className="sm:hidden bg-gradient-to-r from-[#C62828] to-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:from-red-600 hover:to-red-700 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Add New</span>
        </button>
      </div>

      {/* Mobile Search Bar (below header) */}
      <div className="sm:hidden mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 transition"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-6 sm:p-8 text-center">
            <div className="p-3 bg-gray-100 rounded-full w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-600 mb-1">
              {search ? "No matching records found" : "No records found"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              {search ? "Try a different search term" : `Click "Add New" to create your first record`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-semibold text-sm sm:text-base text-gray-800 truncate" title={r.name}>
                        {r.name}
                      </div>
                      <div className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 ${
                        r.is_active !== false 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}>
                        {r.is_active !== false ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            Active
                          </>
                        ) : (
                          "Inactive"
                        )}
                      </div>
                    </div>
                    {r.description && (
                      <div className="text-xs sm:text-sm text-gray-500 line-clamp-2 mt-1" title={r.description}>
                        {r.description}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button 
                      onClick={() => openEdit(r)} 
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-blue-50 transition-colors border border-blue-100" 
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                    </button>
                    <button 
                      onClick={() => handleDelete(r)} 
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-red-50 transition-colors border border-red-100" 
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                {r.created_at && (
                  <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-100">
                    Created: {new Date(r.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal - UNCHANGED FROM ORIGINAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-3 md:p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xs sm:max-w-sm md:max-w-lg mx-2 sm:mx-4 border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 sm:px-5 md:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl backdrop-blur-sm">
                  {Icon ? (
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-white">
                    {editing ? "Edit" : "New"} {title || tableName.replace("_", " ")}
                  </h3>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editing ? "Update existing record" : "Create new record"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-white hover:bg-white/20 rounded-lg sm:rounded-xl p-1.5 sm:p-2 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Close"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                {/* Name Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 transition"
                    placeholder="Enter name"
                    required
                    autoFocus
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 transition resize-none"
                    placeholder="Enter description (optional)"
                    rows={3}
                  />
                </div>

                {/* Active Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={!!form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#C62828] border-gray-300 rounded focus:ring-2 focus:ring-[#C62828]/20 focus:border-[#C62828]"
                  />
                  <label htmlFor="is_active" className="text-xs sm:text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-[#C62828] to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-colors shadow-sm"
                  >
                    {editing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add custom scrollbar and animation styles */}
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
  );
}