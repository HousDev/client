// import React, { useEffect, useState } from "react";
// import { api, unwrap } from "../lib/Api";
// import poTypeApi from "../lib/poTypeApi"; // you already created this
// // import serviceTypeApi from '../lib/serviceTypeApi' // add when you create it
// import { Plus, Edit2, Trash2, X } from "lucide-react";

// type Props = {
//   tableName: string; // e.g. "po_types" or "service_types"
//   title?: string;
//   description?: string;
//   icon?: any;
// };

// type Row = {
//   id: string | number;
//   name: string;
//   description?: string | null;
//   is_active?: boolean;
//   [k: string]: any;
// };

// export default function GenericMaster({ tableName, title, description, icon: Icon }: Props) {
//   const [rows, setRows] = useState<Row[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing] = useState<Row | null>(null);
//   const [form, setForm] = useState({ name: "", description: "", is_active: true });
//   const [search, setSearch] = useState("");

//   // Map tableName to specific API wrapper if available
//   const apiMap: Record<string, any> = {
//     po_types: poTypeApi,
//     // service_types: serviceTypeApi, // add when created
//   };

//   const selectedApi = apiMap[tableName];

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [tableName]);

//   const load = async () => {
//     setLoading(true);
//     try {
//       let data: any;
//       if (selectedApi && typeof selectedApi.getPOTypes === "function" && tableName === "po_types") {
//         // poTypeApi uses getPOTypes()
//         data = await selectedApi.getPOTypes();
//       } else if (selectedApi && typeof selectedApi.getAll === "function") {
//         // generic wrapper convention if you add one
//         data = await selectedApi.getAll();
//       } else {
//         // fallback to generic endpoint: /api/<tableName>
//         const res = await api.get(`/${tableName}`);
//         data = unwrap(res);
//       }
//       setRows(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("GenericMaster load error", err);
//       setRows([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openCreate = () => {
//     setEditing(null);
//     setForm({ name: "", description: "", is_active: true });
//     setShowModal(true);
//   };

//   const openEdit = (r: Row) => {
//     setEditing(r);
//     setForm({
//       name: r.name || "",
//       description: r.description || "",
//       is_active: r.is_active ?? true,
//     });
//     setShowModal(true);
//   };

//   const doCreate = async (payload: any) => {
//     if (selectedApi && typeof selectedApi.createPOType === "function" && tableName === "po_types") {
//       // poTypeApi naming
//       return selectedApi.createPOType(payload);
//     } else if (selectedApi && typeof selectedApi.create === "function") {
//       return selectedApi.create(payload);
//     } else {
//       const res = await api.post(`/${tableName}`, payload);
//       return unwrap(res);
//     }
//   };

//   const doUpdate = async (id: string | number, payload: any) => {
//     if (selectedApi && typeof selectedApi.updatePOType === "function" && tableName === "po_types") {
//       return selectedApi.updatePOType(id, payload);
//     } else if (selectedApi && typeof selectedApi.update === "function") {
//       return selectedApi.update(id, payload);
//     } else {
//       const res = await api.put(`/${tableName}/${id}`, payload);
//       return unwrap(res);
//     }
//   };

//   const doDelete = async (id: string | number) => {
//     if (selectedApi && typeof selectedApi.deletePOType === "function" && tableName === "po_types") {
//       return selectedApi.deletePOType(id);
//     } else if (selectedApi && typeof selectedApi.delete === "function") {
//       return selectedApi.delete(id);
//     } else {
//       const res = await api.delete(`/${tableName}/${id}`);
//       return unwrap(res);
//     }
//   };

//   const handleSubmit = async (e?: React.FormEvent) => {
//     if (e) e.preventDefault();
//     if (!form.name || form.name.trim() === "") {
//       alert("Name is required");
//       return;
//     }
//     try {
//       if (editing) {
//         await doUpdate(editing.id, { ...form });
//         alert("Updated");
//       } else {
//         await doCreate({ ...form });
//         alert("Created");
//       }
//       setShowModal(false);
//       load();
//     } catch (err) {
//       console.error("GenericMaster save error", err);
//       alert("Error saving record");
//     }
//   };

//   const handleDelete = async (row: Row) => {
//     if (!confirm(`Delete "${row.name}"?`)) return;
//     try {
//       await doDelete(row.id);
//       load();
//       alert("Deleted");
//     } catch (err) {
//       console.error("GenericMaster delete error", err);
//       alert("Error deleting record");
//     }
//   };

//   const filtered = rows.filter((r) => {
//     if (!search) return true;
//     const q = search.toLowerCase();
//     return (r.name || "").toString().toLowerCase().includes(q) || (r.description || "").toString().toLowerCase().includes(q);
//   });

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
//       <div className="flex justify-between items-center mb-4">
//         <div>
//           <h2 className="text-xl font-semibold text-gray-800">{title || tableName.replace("_", " ").toUpperCase()}</h2>
//           {description && <p className="text-sm text-gray-500">{description}</p>}
//         </div>

//         <div className="flex items-center gap-3">
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="px-3 py-2 border border-gray-200 rounded-lg"
//             placeholder="Search..."
//           />
//           <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
//             <Plus className="w-4 h-4" /> Add
//           </button>
//         </div>
//       </div>

//       <div>
//         {loading ? (
//           <div className="text-center py-8 text-gray-500">Loading...</div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">No records found</div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//             {filtered.map((r) => (
//               <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center">
//                 <div>
//                   <div className="font-medium text-gray-800">{r.name}</div>
//                   {r.description && <div className="text-sm text-gray-500">{r.description}</div>}
//                 </div>
//                 <div className="flex gap-2">
//                   <button onClick={() => openEdit(r)} className="p-2 rounded hover:bg-gray-50" title="Edit">
//                     <Edit2 className="w-4 h-4 text-blue-600" />
//                   </button>
//                   <button onClick={() => handleDelete(r)} className="p-2 rounded hover:bg-gray-50" title="Delete">
//                     <Trash2 className="w-4 h-4 text-red-600" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">{editing ? "Edit" : "New"} {title || tableName}</h3>
//               <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-gray-100">
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
//                 <input
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   className="w-full px-3 py-2 border rounded"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                 <textarea
//                   value={form.description}
//                   onChange={(e) => setForm({ ...form, description: e.target.value })}
//                   className="w-full px-3 py-2 border rounded"
//                   rows={3}
//                 />
//               </div>

//               <div className="flex items-center gap-4">
//                 <label className="flex items-center gap-2 text-sm">
//                   <input
//                     type="checkbox"
//                     checked={!!form.is_active}
//                     onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
//                   />
//                   Active
//                 </label>

//                 <div className="ml-auto flex gap-2">
//                   <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
//                     Cancel
//                   </button>
//                   <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
//                     {editing ? "Update" : "Create"}
//                   </button>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/GenericMaster.tsx
import React, { useEffect, useState } from "react";
import { api, unwrap } from "../lib/Api";
import poTypeApi from "../lib/poTypeApi"; // existing
import serviceTypeApi from "../lib/serviceTypeApi"; // newly integrated
import { Plus, Edit2, Trash2, X } from "lucide-react";

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
      alert("Name is required");
      return;
    }
    try {
      if (editing) {
        await doUpdate(editing.id, { ...form });
        alert("Updated");
      } else {
        await doCreate({ ...form });
        alert("Created");
      }
      setShowModal(false);
      load();
    } catch (err) {
      console.error("GenericMaster save error", err);
      alert("Error saving record");
    }
  };

  const handleDelete = async (row: Row) => {
    if (!confirm(`Delete "${row.name}"?`)) return;
    try {
      await doDelete(row.id);
      load();
      alert("Deleted");
    } catch (err) {
      console.error("GenericMaster delete error", err);
      alert("Error deleting record");
    }
  };

  const filtered = rows.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.name || "").toString().toLowerCase().includes(q) || (r.description || "").toString().toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title || tableName.replace("_", " ").toUpperCase()}</h2>
          {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg"
            placeholder="Search..."
          />
          <button onClick={openCreate} className="bg-[#C62828] text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No records found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((r) => (
              <div key={r.id} className="p-3 border rounded-lg flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-800">{r.name}</div>
                  {r.description && <div className="text-sm text-gray-500">{r.description}</div>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(r)} className="p-2 rounded hover:bg-gray-50" title="Edit">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button onClick={() => handleDelete(r)} className="p-2 rounded hover:bg-gray-50" title="Delete">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{editing ? "Edit" : "New"} {title || tableName}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  Active
                </label>

                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-[#C62828] text-white rounded">
                    {editing ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

