// import { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, Building2, X, Search } from 'lucide-react';

// interface ProjectFormData {
//   name: string;
//   description: string;
//   location: string;
//   start_date: string;
//   end_date: string;
//   status: string;
//   is_active?: boolean;
// }

// type Project = ProjectFormData & { id: string };

// export default function ProjectsMaster() {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<ProjectFormData>({
//     name: '',
//     description: '',
//     location: '',
//     start_date: '',
//     end_date: '',
//     status: 'active',
//     is_active: true,
//   });

//   const STORAGE_KEY = 'mock_projects_v1';

//   const defaultProjects: Project[] = [
//     {
//       id: 'proj_1',
//       name: 'Tower A Construction',
//       description: 'Residential tower A — 24 floors, basements and podium.',
//       location: 'Mumbai, Maharashtra',
//       start_date: '2025-01-10',
//       end_date: '2026-12-31',
//       status: 'active',
//       is_active: true,
//     },
//     {
//       id: 'proj_2',
//       name: 'Commercial Plaza',
//       description: 'Retail and office complex near highway.',
//       location: 'Pune, Maharashtra',
//       start_date: '2024-07-01',
//       end_date: '2026-03-31',
//       status: 'on_hold',
//       is_active: true,
//     },
//     {
//       id: 'proj_3',
//       name: 'Warehouse Expansion',
//       description: '',
//       location: 'Navi Mumbai',
//       start_date: '',
//       end_date: '',
//       status: 'completed',
//       is_active: false,
//     },
//   ];

//   useEffect(() => {
//     loadProjects();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const loadProjects = () => {
//     setLoading(true);
//     setTimeout(() => {
//       try {
//         const raw = localStorage.getItem(STORAGE_KEY);
//         let parsed: Project[] = raw ? JSON.parse(raw) : [];
//         if (!raw || !Array.isArray(parsed) || parsed.length === 0) {
//           parsed = defaultProjects;
//           localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
//         }
//         // sort by name
//         parsed.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//         setProjects(parsed);
//       } catch (err) {
//         console.error('Error loading projects from storage:', err);
//         setProjects([]);
//       } finally {
//         setLoading(false);
//       }
//     }, 120);
//   };

//   const persistProjects = (newProjects: Project[]) => {
//     newProjects.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(newProjects));
//     setProjects(newProjects);
//   };

//   const resetForm = () => {
//     setFormData({
//       name: '',
//       description: '',
//       location: '',
//       start_date: '',
//       end_date: '',
//       status: 'active',
//       is_active: true,
//     });
//     setEditingId(null);
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formData.name.trim()) {
//       alert('Project name is required.');
//       return;
//     }

//     if (editingId) {
//       const updated = projects.map((p) =>
//         p.id === editingId ? { ...p, ...formData, name: formData.name.trim() } : p
//       );
//       persistProjects(updated);
//       alert('Project updated successfully!');
//     } else {
//       const id = `proj_${Date.now().toString(36)}`;
//       const newProject: Project = {
//         id,
//         name: formData.name.trim(),
//         description: formData.description || '',
//         location: formData.location || '',
//         start_date: formData.start_date || '',
//         end_date: formData.end_date || '',
//         status: formData.status || 'active',
//         is_active: formData.is_active ?? true,
//       };
//       persistProjects([newProject, ...projects]);
//       alert('Project created successfully!');
//     }

//     setShowModal(false);
//     resetForm();
//   };

//   const handleEdit = (project: Project) => {
//     setEditingId(project.id);
//     setFormData({
//       name: project.name,
//       description: project.description || '',
//       location: project.location || '',
//       start_date: project.start_date || '',
//       end_date: project.end_date || '',
//       status: project.status || 'active',
//       is_active: project.is_active ?? true,
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (id: string) => {
//     if (!confirm('Are you sure you want to delete this project?')) return;
//     const updated = projects.filter((p) => p.id !== id);
//     persistProjects(updated);
//     alert('Project deleted successfully!');
//   };

//   const toggleActive = (id: string, current?: boolean) => {
//     const updated = projects.map((p) => (p.id === id ? { ...p, is_active: !current } : p));
//     persistProjects(updated);
//   };

//   const filteredProjects = projects.filter((project) => {
//     if (!searchTerm) return true;
//     const q = searchTerm.toLowerCase();
//     return (
//       (project.name || '').toLowerCase().includes(q) ||
//       (project.location || '').toLowerCase().includes(q) ||
//       (project.description || '').toLowerCase().includes(q)
//     );
//   });

//   const getStatusColor = (status: string) => {
//     const colors: Record<string, string> = {
//       active: 'bg-green-100 text-green-700',
//       completed: 'bg-blue-100 text-blue-700',
//       on_hold: 'bg-yellow-100 text-yellow-700',
//       cancelled: 'bg-red-100 text-red-700',
//     };
//     return colors[status] || 'bg-gray-100 text-gray-700';
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading projects...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-800">Projects Master</h1>
//           <p className="text-gray-600 mt-1">Manage all projects (demo)</p>
//         </div>
//         <button
//           onClick={() => {
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
//         >
//           <Plus className="w-5 h-5" />
//           Add Project
//         </button>
//       </div>

//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//         <div className="relative">
//           <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search by name, location or description..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//           />
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredProjects.map((project) => (
//           <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
//             <div className="flex justify-between items-start mb-4">
//               <div className="flex items-center gap-3">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <Building2 className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-bold text-gray-800 text-lg">{project.name}</h3>
//                   <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(project.status)}`}>
//                     {project.status?.toUpperCase()}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <button onClick={() => handleEdit(project)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
//                   <Edit2 className="w-4 h-4" />
//                 </button>
//                 <button onClick={() => handleDelete(project.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
//                   <Trash2 className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             {project.description && <p className="text-sm text-gray-600 mb-3">{project.description}</p>}

//             {project.location && <p className="text-sm text-gray-700 mb-2"><span className="font-medium">Location:</span> {project.location}</p>}

//             {project.start_date && <p className="text-sm text-gray-700"><span className="font-medium">Start:</span> {new Date(project.start_date).toLocaleDateString()}</p>}
//             {project.end_date && <p className="text-sm text-gray-700"><span className="font-medium">End:</span> {new Date(project.end_date).toLocaleDateString()}</p>}

//             <div className="mt-4">
//               <button onClick={() => toggleActive(project.id, project.is_active)} className={`px-3 py-1 rounded-full text-xs font-medium ${project.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
//                 {project.is_active ? 'ACTIVE' : 'INACTIVE'}
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {filteredProjects.length === 0 && (
//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-6">
//           <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-lg font-semibold text-gray-800 mb-2">No projects found</h3>
//           <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Add Project" to create your first project'}</p>
//         </div>
//       )}

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit Project' : 'Add Project'}</h2>
//               <button onClick={() => { setShowModal(false); resetForm(); }} className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition">
//                 <X className="w-6 h-6" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
//               <div className="space-y-6 mb-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Project Name <span className="text-red-500">*</span></label>
//                   <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Tower A Construction" required />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
//                   <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Mumbai, Maharashtra" />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//                   <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" rows={3} placeholder="Project description..." />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
//                     <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
//                     <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
//                   <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
//                     <option value="active">Active</option>
//                     <option value="completed">Completed</option>
//                     <option value="on_hold">On Hold</option>
//                     <option value="cancelled">Cancelled</option>
//                   </select>
//                 </div>
//               </div>

//               <div className="flex gap-3 pt-6 border-t">
//                 <button type="submit" className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm">{editingId ? 'Update Project' : 'Add Project'}</button>
//                 <button type="button" onClick={() => { setShowModal(false); resetForm(); }} className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">Cancel</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// src/components/ProjectsMaster.tsx
import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Building2, X, Search } from "lucide-react";
import projectApi, { Project as ApiProject, ProjectFormData } from "../lib/projectApi";

interface ProjectFormDataLocal {
  name: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  status: string;
  is_active?: boolean;
}

type ProjectLocal = ProjectFormDataLocal & { id: string };

export default function ProjectsMaster() {
  const [projects, setProjects] = useState<ProjectLocal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false); // disable submit while saving
  const [deletingId, setDeletingId] = useState<string | null>(null); // show spinner per-item if desired

  const [formData, setFormData] = useState<ProjectFormDataLocal>({
    name: "",
    description: "",
    location: "",
    start_date: "",
    end_date: "",
    status: "active",
    is_active: true,
  });

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const data = await projectApi.getProjects();
      // ensure shape: map API results to local ProjectLocal
      const mapped = (data || []).map((p: ApiProject) => ({
        id: String(p.id),
        name: p.name || "",
        description: p.description || "",
        location: p.location || "",
        start_date: (p.start_date as string) || "",
        end_date: (p.end_date as string) || "",
        status: p.status || "active",
        is_active: typeof p.is_active === "boolean" ? p.is_active : Boolean(p.is_active),
      }));
      mapped.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      setProjects(mapped);
    } catch (err) {
      console.warn("loadProjects failed, using fallback demo data", err);
      setProjects(defaultProjects);
    } finally {
      setLoading(false);
    }
  };

  const persistProjectsSorted = (list: ProjectLocal[]) => {
    list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    setProjects(list);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      start_date: "",
      end_date: "",
      status: "active",
      is_active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Project name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload: ProjectFormData = {
        name: formData.name.trim(),
        description: formData.description || undefined,
        location: formData.location || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        status: formData.status || "active",
        is_active: formData.is_active,
      };

      if (editingId) {
        // optimistic update: update UI first
        const updatedList = projects.map((p) => (p.id === editingId ? { ...p, ...payload } : p));
        persistProjectsSorted(updatedList);
        try {
          const updated = await projectApi.updateProject(editingId, payload);
          // replace with authoritative response
          const replaced = projects.map((p) => (p.id === editingId ? { ...p, ...mapApiToLocal(updated) } : p));
          persistProjectsSorted(replaced);
          alert("Project updated successfully!");
        } catch (err) {
          console.error("updateProject failed", err);
          alert("Failed updating project. Reloading list.");
          await loadProjects();
        }
      } else {
        // create
        try {
          const created = await projectApi.createProject(payload);
          const local = mapApiToLocal(created);
          persistProjectsSorted([local, ...projects]);
          alert("Project created successfully!");
        } catch (err) {
          console.error("createProject failed", err);
          alert("Failed creating project.");
        }
      }

      setShowModal(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: ProjectLocal) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || "",
      location: project.location || "",
      start_date: project.start_date || "",
      end_date: project.end_date || "",
      status: project.status || "active",
      is_active: project.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    // optimistic remove
    const prev = projects;
    persistProjectsSorted(projects.filter((p) => p.id !== id));
    try {
      await projectApi.deleteProject(id);
      alert("Project deleted successfully!");
    } catch (err) {
      console.error("deleteProject failed", err);
      alert("Failed deleting project. Restoring list.");
      persistProjectsSorted(prev);
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (id: string, current?: boolean) => {
    // optimistic toggle
    const prev = projects;
    const updatedList = projects.map((p) => (p.id === id ? { ...p, is_active: !current } : p));
    persistProjectsSorted(updatedList);

    try {
      await projectApi.updateProject(id, { is_active: !current } as any);
    } catch (err) {
      console.error("toggleActive failed", err);
      alert("Failed updating status. Restoring.");
      persistProjectsSorted(prev);
    }
  };

  const mapApiToLocal = (p: ApiProject): ProjectLocal => ({
    id: String(p.id),
    name: p.name || "",
    description: p.description || "",
    location: p.location || "",
    start_date: (p.start_date as string) || "",
    end_date: (p.end_date as string) || "",
    status: p.status || "active",
    is_active: typeof p.is_active === "boolean" ? p.is_active : Boolean(p.is_active),
  });

  const filteredProjects = projects.filter((project) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (project.name || "").toLowerCase().includes(q) ||
      (project.location || "").toLowerCase().includes(q) ||
      (project.description || "").toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      completed: "bg-blue-100 text-blue-700",
      on_hold: "bg-yellow-100 text-yellow-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects Master</h1>
          <p className="text-gray-600 mt-1">Manage all projects</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, location or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{project.name}</h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(project.status)}`}>
                    {project.status?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(project)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Delete"
                  disabled={deletingId === project.id}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {project.description && <p className="text-sm text-gray-600 mb-3">{project.description}</p>}

            {project.location && (
              <p className="text-sm text-gray-700 mb-2">
                <span className="font-medium">Location:</span> {project.location}
              </p>
            )}

            {project.start_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Start:</span> {new Date(project.start_date).toLocaleDateString()}
              </p>
            )}
            {project.end_date && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">End:</span> {new Date(project.end_date).toLocaleDateString()}
              </p>
            )}

            <div className="mt-4">
              <button
                onClick={() => toggleActive(project.id, project.is_active)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${project.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
              >
                {project.is_active ? "ACTIVE" : "INACTIVE"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center mt-6">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No projects found</h3>
          <p className="text-gray-600">{searchTerm ? "Try a different search term" : "Click 'Add Project' to create your first project"}</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{editingId ? "Edit Project" : "Add Project"}</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Tower A Construction"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mumbai, Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Project description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50">
                  {saving ? (editingId ? "Updating..." : "Creating...") : editingId ? "Update Project" : "Add Project"}
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
