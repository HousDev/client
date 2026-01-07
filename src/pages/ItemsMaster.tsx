// src/pages/ItemsMaster.tsx
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Package, X, Search } from "lucide-react";
import ItemsApi from "../lib/itemsApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";

interface ItemFormData {
  item_code: string;
  item_name: string;
  category: string;
  description: string;
  unit: string;
  hsn_code: string;
  igst_rate: string;
  cgst_rate: string;
  sgst_rate: string;
  standard_rate: number;
  is_active?: boolean;
  location: string;
}

type Item = ItemFormData & { id: string };

export default function ItemsMaster(): JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<ItemFormData>({
    item_code: "",
    item_name: "",
    category: "material",
    description: "",
    unit: "nos",
    hsn_code: "",
    igst_rate: "18",
    cgst_rate: "9",
    sgst_rate: "9",
    standard_rate: 0,
    is_active: true,
    location: "",
  });

  // Load items from backend (no local defaults)
  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await ItemsApi.getItems();
      console.log(res);
      const normalized: Item[] = (Array.isArray(res) ? res : []).map(
        (it: any) => ({
          id: String(it.id),
          item_code: it.item_code ?? "",
          item_name: it.item_name ?? "",
          category: it.category ?? "material",
          description: it.description ?? "",
          unit: it.unit ?? "nos",
          hsn_code: it.hsn_code ?? "",
          igst_rate: it.igst_rate || "0",
          cgst_rate: it.cgst_rate || "0",
          sgst_rate: it.sgst_rate || "0",
          standard_rate: Number(it.standard_rate) || 0,
          is_active: it.is_active === undefined ? true : Boolean(it.is_active),
          location: it.location || "",
        })
      );
      setItems(normalized);
    } catch (err) {
      console.error("Failed to load items from API:", err);
      toast.error("Could not load items from server. Please check backend.");
      setItems([]); // explicitly empty list if backend fails
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      item_code: "",
      item_name: "",
      category: "material",
      description: "",
      unit: "nos",
      hsn_code: "",
      igst_rate: "18",
      cgst_rate: "9",
      sgst_rate: "9",
      standard_rate: 0,
      is_active: true,
      location: "",
    });
    setEditingId(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item_code.trim() || !formData.item_name.trim()) {
      toast.error("Please fill required fields (Item Code & Item Name).");
      return;
    }

    const payload: any = {
      item_code: formData.item_code.trim().toUpperCase(),
      item_name: formData.item_name.trim(),
      category: formData.category,
      description: formData.description,
      unit: formData.unit,
      hsn_code: formData.hsn_code,
      igst_rate: Number(formData.igst_rate) || 0,
      cgst_rate: Number(formData.cgst_rate) || 0,
      sgst_rate: Number(formData.sgst_rate) || 0,
      standard_rate: Number(formData.standard_rate) || 0,
      is_active: formData.is_active ? 1 : 0,
      location: formData.location || "",
    };

    try {
      if (editingId) {
        const numericId = Number(editingId);
        const updated: any = await ItemsApi.updateItem(numericId, payload);
        const normalized: Item = {
          id: String(updated.id ?? numericId),
          item_code: updated.item_code ?? payload.item_code,
          item_name: updated.item_name ?? payload.item_name,
          category: updated.category ?? payload.category,
          description: updated.description ?? payload.description,
          unit: updated.unit ?? payload.unit,
          hsn_code: updated.hsn_code ?? payload.hsn_code,
          igst_rate: Number(updated.igst_rate) || payload.igst_rate,
          cgst_rate: Number(updated.cgst_rate) || payload.cgst_rate,
          sgst_rate: Number(updated.sgst_rate) || payload.sgst_rate,
          standard_rate: Number(updated.standard_rate) || payload.standard_rate,
          is_active:
            updated.is_active === undefined
              ? Boolean(payload.is_active)
              : Boolean(updated.is_active),
          location: updated?.location || "",
        };
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? normalized : it))
        );
        toast.success("Item updated successfully!");
      } else {
        const created: any = await ItemsApi.createItem(payload);
        const normalized: Item = {
          id: String(created.id ?? `itm_${Date.now().toString(36)}`),
          item_code: created.item_code ?? payload.item_code,
          item_name: created.item_name ?? payload.item_name,
          category: created.category ?? payload.category,
          description: created.description ?? payload.description,
          unit: created.unit ?? payload.unit,
          hsn_code: created.hsn_code ?? payload.hsn_code,
          igst_rate: Number(created.igst_rate) || payload.igst_rate,
          cgst_rate: Number(created.cgst_rate) || payload.cgst_rate,
          sgst_rate: Number(created.sgst_rate) || payload.sgst_rate,
          standard_rate: Number(created.standard_rate) || payload.standard_rate,
          is_active:
            created.is_active === undefined
              ? Boolean(payload.is_active)
              : Boolean(created.is_active),
          location: created.location || "",
        };
        setItems((prev) => [...prev, normalized]);
        toast.success("Item created successfully!");
      }

      setShowModal(false);
      resetForm();
      loadItems();
    } catch (err) {
      console.error("Error saving item:", err);
      toast.error("Failed to save item. See console for details.");
    }
  };

  const handleEdit = (item: Item) => {
    console.log(item, "this is from edit");
    setEditingId(item.id);
    setFormData({
      item_code: item.item_code,
      item_name: item.item_name,
      category: item.category,
      description: item.description || "",
      unit: item.unit || "nos",
      hsn_code: item.hsn_code || "",
      igst_rate: item.igst_rate || "0",
      cgst_rate: item.cgst_rate || "0",
      sgst_rate: item.sgst_rate || "0",
      standard_rate: item.standard_rate || 0,
      is_active: item.is_active ?? true,
      location: item.location ?? "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });
    if (!result.isConfirmed) return;
    try {
      await ItemsApi.deleteItem(Number(id));
      setItems((prev) => prev.filter((it) => it.id !== id));
      toast.success("Item deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete item.");
    }
  };

  const toggleActive = async (id: string, currentStatus?: boolean) => {
    try {
      await ItemsApi.toggleItem(Number(id));
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, is_active: !currentStatus } : it
        )
      );
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Failed to toggle status.");
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (item.item_name || "").toLowerCase().includes(q) ||
      (item.item_code || "").toLowerCase().includes(q) ||
      (item.hsn_code || "").toLowerCase().includes(q)
    );
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Items Master</h1>
          <p className="text-gray-600 mt-1">
            Manage materials and services (backend)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, code, or HSN..."
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
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Code
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  HSN/SAC
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Unit
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  IGST(%)
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  CGST(%)
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  SGST(%)
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Standard Rate
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">
                      {item.item_code}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.item_name}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === "material"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {item.category?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {item.hsn_code || "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700">{item.unit}</td>
                  <td className="px-6 py-4 text-gray-700">{item.igst_rate}%</td>
                  <td className="px-6 py-4 text-gray-700">{item.cgst_rate}%</td>
                  <td className="px-6 py-4 text-gray-700">{item.sgst_rate}%</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {formatCurrency(item.standard_rate)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActive(item.id, item.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.is_active ? "ACTIVE" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No items found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try a different search term"
                : "No items available"}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? "Edit Item" : "Add Item"}
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

            <form onSubmit={handleSubmit} className=" max-h-[calc(90vh-80px)]">
              <div className="p-6 overflow-y-auto h-[60vh] grid grid-cols-1 md:grid-cols-3 gap-3  mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.item_code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        item_code: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MAT001"
                    required
                    disabled={!!editingId}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) =>
                      setFormData({ ...formData, item_name: e.target.value })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cement Grade 43"
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
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="material">Material</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="nos">Nos</option>
                    <option value="kg">Kg</option>
                    <option value="ltr">Ltr</option>
                    <option value="mt">MT</option>
                    <option value="sqft">Sq.Ft</option>
                    <option value="sqm">Sq.M</option>
                    <option value="job">Job</option>
                    <option value="day">Day</option>
                    <option value="hour">Hour</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HSN/SAC Code
                  </label>
                  <input
                    type="text"
                    value={formData.hsn_code}
                    onChange={(e) =>
                      setFormData({ ...formData, hsn_code: e.target.value })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2523"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Standard Rate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.standard_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        standard_rate: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="outline-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IGST Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.igst_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        igst_rate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CGST Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.cgst_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cgst_rate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SGST Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.sgst_rate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sgst_rate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                  />
                </div>

                {formData.category === "material" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      placeholder="Location"
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          location: e.target.value,
                        })
                      }
                      className="outline-none w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                )}

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="outline-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
                >
                  {editingId ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
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
