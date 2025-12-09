// src/components/UsersMaster.tsx
import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Users, X, Search, Shield, Eye, EyeOff } from 'lucide-react';
import { UsersApi } from '../lib/Api'; // adjust path if needed

// Keep your local type definitions (or import them from Api.ts if you exported them there)
interface Permissions {
  view_vendors: boolean;
  edit_vendors: boolean;
  delete_vendors: boolean;
  view_pos: boolean;
  create_pos: boolean;
  edit_pos: boolean;
  delete_pos: boolean;
  approve_pos: boolean;
  view_service_orders: boolean;
  create_service_orders: boolean;
  edit_service_orders: boolean;
  view_materials: boolean;
  receive_materials: boolean;
  view_payments: boolean;
  make_payments: boolean;
  view_reports: boolean;
  manage_masters: boolean;
  manage_users: boolean;
}

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  role: string;
  department?: string;
  is_active: boolean;
  permissions?: Partial<Permissions>;
  password?: string;
}

interface UserFormData {
  email: string;
  full_name: string;
  phone: string;
  role: string;
  department: string;
  password: string;
  is_active: boolean;
  permissions: Partial<Permissions>; // now partial: only keys present will be shown
}

// canonical full-permissions shape (used only to compute admin = all true)
const canonicalPermissionsKeys = [
  'view_vendors',
  'edit_vendors',
  'delete_vendors',
  'view_pos',
  'create_pos',
  'edit_pos',
  'delete_pos',
  'approve_pos',
  'view_service_orders',
  'create_service_orders',
  'edit_service_orders',
  'view_materials',
  'receive_materials',
  'view_payments',
  'make_payments',
  'view_reports',
  'manage_masters',
  'manage_users',
] as (keyof Permissions)[];

const defaultPermissions: Partial<Permissions> = {
  // keep empty by default — role will determine which keys are shown
};

export default function UsersMaster() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    phone: '',
    role: 'user',
    department: '',
    password: '',
    is_active: true,
    permissions: defaultPermissions,
  });

  const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      phone: '',
      role: 'user',
      department: '',
      password: '',
      is_active: true,
      permissions: defaultPermissions,
    });
    setEditingId(null);
    setShowPassword(false);
  };

  // Role -> permissions map (only include keys you want displayed for that role)
  // admin: all keys true
  const rolePermissionsMap: Record<string, Partial<Permissions>> = {
    admin: Object.fromEntries(canonicalPermissionsKeys.map((k) => [k, true])) as Partial<Permissions>,
    manager: {
      view_vendors: true,
      edit_vendors: true,
      view_pos: true,
      create_pos: true,
      edit_pos: true,
      approve_pos: true,
      view_service_orders: true,
      create_service_orders: true,
      edit_service_orders: true,
      view_materials: true,
      receive_materials: true,
      view_payments: true,
      view_reports: true,
      manage_masters: true,
    },
    purchaser: {
      view_vendors: true,
      view_pos: true,
      create_pos: true,
      edit_pos: true,
      view_service_orders: true,
      create_service_orders: true,
      view_materials: true,
      view_payments: true,
      view_reports: true,
    },
    store_keeper: {
      view_pos: true,
      view_service_orders: true,
      view_materials: true,
      receive_materials: true,
      view_reports: true,
    },
    user: {
      view_service_orders: true,
    },
  };

  // load users from API on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    UsersApi.list()
      .then((data) => {
        if (!mounted) return;
        // adapt shape if API returns created_at/updated_at etc.
        const normalized = (data || []).map((u: any) => ({
          id: u.id,
          email: u.email,
          full_name: u.full_name || '',
          phone: u.phone || '',
          role: u.role || 'user',
          department: u.department || '',
          is_active: u.is_active ?? true,
          permissions: (u.permissions as Partial<Permissions>) ?? undefined,
        })) as UserProfile[];

        // if API returned nothing, you may want to seed with an admin user — optional
        setUsers(normalized.length ? normalized : [
          {
            id: generateId(),
            email: 'admin@example.com',
            full_name: 'Administrator',
            role: 'admin',
            is_active: true,
            permissions: rolePermissionsMap.admin,
          },
        ]);
      })
      .catch((err) => {
        console.error('Failed to load users', err);
        alert('Failed to load users. See console for details.');
        // fallback seed
        setUsers([
          {
            id: generateId(),
            email: 'admin@example.com',
            full_name: 'Administrator',
            role: 'admin',
            is_active: true,
            permissions: rolePermissionsMap.admin,
          },
        ]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      alert('Email is required');
      return;
    }
    if (!editingId && formData.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        // build payload; send password only if provided
        const payload: any = {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          is_active: formData.is_active,
          permissions: formData.permissions, // only keys present will be persisted
        };
        if (formData.password) payload.password = formData.password;

        const updated = await UsersApi.update(editingId, payload);
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
        alert('User updated successfully!');
      } else {
        // create
        if (users.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())) {
          alert('A user with this email already exists.');
          setSubmitting(false);
          return;
        }
        const payload = {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          department: formData.department,
          password: formData.password,
          is_active: formData.is_active,
          permissions: formData.permissions,
        };
        const created = await UsersApi.create(payload);
        // normalize and append
        setUsers((prev) =>
          [...prev, { ...(created as any) }].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''))
        );
        alert('User created successfully!');
      }

      setShowModal(false);
      resetForm();
    } catch (err: any) {
      console.error('submit error', err);
      const message = err?.message || (err?.details && JSON.stringify(err.details)) || 'Operation failed';
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setEditingId(user.id);
    // If user has explicit permissions, use them; otherwise fall back to role permissions map
    const rolePerms = rolePermissionsMap[user.role] ?? {};
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'user',
      department: user.department || '',
      password: '',
      is_active: user.is_active !== false,
      permissions: user.permissions && Object.keys(user.permissions).length > 0 ? user.permissions : rolePerms,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await UsersApi.remove(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert('User deleted successfully!');
    } catch (err) {
      console.error('delete error', err);
      alert('Failed to delete user');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const updated = await UsersApi.toggleActive(id);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u)));
    } catch (err) {
      console.error('toggle error', err);
      alert('Failed to toggle status');
    }
  };

  // When role selected in the form, apply that role's permissions and show only those keys
  const handleRoleChange = (role: string) => {
    const perms = rolePermissionsMap[role] ?? {};
    setFormData({ ...formData, role, permissions: { ...perms } });
  };

  // Toggle a permission key that exists in the current formData.permissions
  const togglePermission = (key: keyof Permissions) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [key]: !formData.permissions?.[key],
      },
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-700',
      manager: 'bg-blue-100 text-blue-700',
      purchaser: 'bg-green-100 text-green-700',
      store_keeper: 'bg-purple-100 text-purple-700',
      user: 'bg-gray-100 text-gray-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage users and permissions</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Role</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-gray-800">{user.full_name || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {user.role?.toUpperCase() || 'USER'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{user.department || '-'}</td>
                  <td className="px-6 py-4 text-gray-700">{user.phone || '-'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(user.id, user.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
            <p className="text-gray-600">{searchTerm ? 'Try a different search term' : 'Click "Add User" to create your first user'}</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">{editingId ? 'Edit User' : 'Add User'}</h2>
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

            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                      disabled={!!editingId}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Procurement"
                    />
                  </div>

                  {!editingId && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Min 6 characters"
                          required={!editingId}
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {editingId && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Change Password (optional)</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                          placeholder="Leave blank to keep existing password"
                          minLength={0}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role <span className="text-red-500">*</span></label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="user">User</option>
                      <option value="store_keeper">Store Keeper</option>
                      <option value="purchaser">Purchaser</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-8">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                      Active User
                    </label>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permissions
                </h3>

                {/* Render only keys present in formData.permissions — that implements the "hide the rest" behavior */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.keys(formData.permissions || {}).length === 0 ? (
                    <div className="text-sm text-gray-500 col-span-3">No permissions to configure for this role.</div>
                  ) : (
                    Object.keys(formData.permissions || {}).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={!!(formData.permissions as any)[key]}
                          onChange={() => togglePermission(key as keyof Permissions)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update User' : 'Create User'}
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
