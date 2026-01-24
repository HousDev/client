import { useState, useEffect } from "react";
import { Plus, Search, Phone, Mail, MapPin, X } from "lucide-react";
import { toast } from "sonner";

const VENDORS_KEY = "vendors_local_v1";
const CATEGORIES_KEY = "vendor_categories_local_v1";

export default function Vendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    contact_person: "",
    email: "",
    phone: "",
    alternate_phone: "",
    gst_number: "",
    pan_number: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    past_work_history: "",
  });

  // --- LocalStorage helpers ---
  const loadLocal = (key: string) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  };

  const saveLocal = (key: string, value: any[]) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // --- Load vendors + categories ---
  useEffect(() => {
    const cats = loadLocal(CATEGORIES_KEY);
    if (cats.length === 0) {
      const seed = [
        { id: "1", name: "Civil" },
        { id: "2", name: "Electrical" },
        { id: "3", name: "Plumbing" },
      ];
      saveLocal(CATEGORIES_KEY, seed);
      setCategories(seed);
    } else {
      setCategories(cats);
    }

    const vends = loadLocal(VENDORS_KEY);
    setVendors(vends);

    setLoading(false);
  }, []);

  // --- Add Vendor ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVendor = {
      id: Date.now().toString(),
      ...formData,
      vendor_categories: {
        name: categories.find((c) => c.id === formData.category_id)?.name || "",
      },
    };

    const updated = [newVendor, ...vendors];
    setVendors(updated);
    saveLocal(VENDORS_KEY, updated);

    // Reset form
    setFormData({
      name: "",
      category_id: "",
      contact_person: "",
      email: "",
      phone: "",
      alternate_phone: "",
      gst_number: "",
      pan_number: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      bank_name: "",
      account_number: "",
      ifsc_code: "",
      past_work_history: "",
    });

    setShowModal(false);
  };

  const filteredVendors = vendors.filter(
    (vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.phone.includes(searchTerm),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Vendor Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all your vendors locally</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none text-gray-700"
          />
        </div>
      </div>

      {/* VENDOR LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition"
          >
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              {vendor.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {vendor.vendor_categories?.name || "N/A"}
            </p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{vendor.phone}</span>
              </div>

              {vendor.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{vendor.email}</span>
                </div>
              )}

              {vendor.city && vendor.state && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {vendor.city}, {vendor.state}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Add New Vendor
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* NAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vendor Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* CATEGORY */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData({ ...formData, category_id: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* PHONE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      if (!/^\d*$/.test(e.target.value)) {
                        toast.warning("Enter Valid Phone Number.");
                        return;
                      }
                      if (e.target.value.length > 10) {
                        toast.warning("Mobile number must be 10 digit.");
                        return;
                      }
                      setFormData({ ...formData, phone: e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
