import { useState, useEffect, useRef, SetStateAction } from "react";
import {
  Plus,
  Wrench,
  Calendar,
  X,
  Trash2,
  Edit2,
  Printer,
  Share2,
  FileText,
  Layers,
  MapPin,
  Phone,
  Save,
  Truck,
  UserRound,
  XCircle,
  Clock,
  CheckSquare,
  AlertCircle,
  Building,
  ChevronDown,
  DollarSign,
  Percent,
  Tag,
  Shield,
  FileCheck,
  Calculator,
  CreditCard,
  Package,
  Info,
  Box,
  Search,
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import {
  getServiceOrders,
  createServiceOrder,
  updateServiceOrder,
  deleteServiceOrder,
  bulkUpdateStatus,
  bulkDeleteServiceOrders,
} from "../lib/serviceOrderApi";

// dynamic master APIs
import projectApi from "../lib/projectApi";
import vendorApi from "../lib/vendorApi";
import serviceTypeApi from "../lib/serviceTypeApi";
import buildingApi from "../lib/areaTasksApi.ts";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  service_item_id: string;
  item_code: string;
  item_name: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  igst_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  gst_amount: number;
}

interface SOFormData {
  so_number: string;
  vendor_id: string;
  project_id: string;
  service_type_id: string;
  building_id: string;
  so_date: string;
  start_date: string;
  end_date: string;
  
  items: ServiceItem[];
  sub_total: number;
  discount_percentage: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst_amount: number;
  grand_total: number;
  
  payment_terms: string;
  terms_and_conditions: string;
  advance_amount: number;
  total_paid: number;
  balance_amount: number;
  
  status: 'draft' | 'approve' | 'authorize' | 'reject';
  service_status: 'pending' | 'partial' | 'completed';
  selected_terms_ids: string[];
  note: string;
  
  created_by?: string | null;
  created_at?: string;
}

interface ServiceMasterItem {
  id: string;
  item_code: string;
  item_name: string;
  description: string;
  hsn_code: string;
  unit: string;
  standard_rate: number;
  igst_rate: number;
  cgst_rate: number;
  sgst_rate: number;
  category: string;
}

type Option = { id: string; name: string } | string;

/* ------------------ SearchableSelect component ------------------ */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  required = false,
  disabled = false,
  id,
}: {
  options: Option[];
  value: string;
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

  const normalized = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt,
  );

  const selected = normalized.find((o) => o.id === value) || null;

  const filtered = normalized.filter((o) =>
    o.name.toLowerCase().includes(filter.toLowerCase()),
  );

  useEffect(() => {
    if (!open) setFilter("");
    setHighlight(0);
  }, [open]);

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
        className={`w-full flex items-center gap-2 px-3 py-2 ${disabled ? "border" : "border border-slate-400"} rounded-lg bg-white cursor-pointer ${
          disabled ? "opacity-90 cursor-not-allowed" : "hover:shadow-sm"
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

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
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
      <input type="hidden" value={value} />
    </div>
  );
}

export default function ServiceOrders() {
  const { user } = useAuth();
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceMasterItem[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [showAddTerm, setShowAddTerm] = useState(false);
  const [showPaymentTerms, setShowPaymentTerms] = useState(false);

  // Search filters
  const [searchSONumber, setSearchSONumber] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [searchServiceType, setSearchServiceType] = useState("");
  const [searchBuilding, setSearchBuilding] = useState("");
  const [searchStartDate, setSearchStartDate] = useState("");
  const [searchEndDate, setSearchEndDate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [searchServiceStatus, setSearchServiceStatus] = useState("");

  // Item selector search
  const [itemSelectorSearch, setItemSelectorSearch] = useState("");

  // Payment terms state
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [selectedPaymentTerms, setSelectedPaymentTerms] = useState<any[]>([]);

  const today = new Date().toISOString().split("T")[0]; // 👈 YAHI ISSUE FIX
  
  const [formData, setFormData] = useState<SOFormData>({
    so_number: "",
    vendor_id: "",
    project_id: "",
    service_type_id: "",
    building_id: "",
    so_date: new Date().toISOString().split("T")[0],
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
    
    items: [],
    sub_total: 0,
    discount_percentage: 0,
    discount_amount: 0,
    taxable_amount: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    total_gst_amount: 0,
    grand_total: 0,
    
    payment_terms: "",
    terms_and_conditions: "",
    advance_amount: 0,
    total_paid: 0,
    balance_amount: 0,
    
    status: 'draft',
    service_status: 'pending',
    selected_terms_ids: [],
    note: "",
    
    created_by: user?.id ?? null,
    created_at: new Date().toISOString(),
  });

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

 const loadData = async () => {
  setLoading(true);
  try {
    // Fetch all master data in parallel
    const [
      vendorsData,
      projectsData,
      serviceTypesData,
      serviceOrdersData,
    ] = await Promise.all([
      vendorApi.getVendors(),
      projectApi.getProjects(),
      serviceTypeApi.getAll(true),
      getServiceOrders(),
    ]);

    console.log("Vendors Data:", vendorsData);
    console.log("Projects Data:", projectsData);
    console.log("Service Types Data:", serviceTypesData);

    // Set vendors - handle response structure
    const vendorsList = Array.isArray(vendorsData) 
      ? vendorsData 
      : vendorsData?.data 
      ? vendorsData.data 
      : [];
    setVendors(vendorsList.filter((v: any) => v.category_name === "Service"));

    // Set projects - handle response structure
    const projectsList = Array.isArray(projectsData) 
      ? projectsData 
      : projectsData?.data 
      ? projectsData.data 
      : [];
    setProjects(projectsList);

    // Extract buildings from projects data
    const buildingsList: any[] = [];
    projectsList.forEach((project: any) => {
      if (project.buildings && Array.isArray(project.buildings)) {
        project.buildings.forEach((building: any) => {
          buildingsList.push({
            id: building.id,
            name: building.building_name || building.name || "N/A",
            project_id: project.id,
          });
        });
      }
    });
    setBuildings(buildingsList);

    // Set service types - handle response structure
    const serviceTypesList = Array.isArray(serviceTypesData) 
      ? serviceTypesData 
      : serviceTypesData?.data 
      ? serviceTypesData.data 
      : [];
    setServiceTypes(serviceTypesList);

    // Set service orders
    const rows: any[] = Array.isArray(serviceOrdersData) 
      ? serviceOrdersData 
      : serviceOrdersData?.data 
      ? serviceOrdersData.data 
      : [];
      
    rows.sort((a: any, b: any) => 
      (b.created_at || "").localeCompare(a.created_at || "")
    );
    
    const normalized = rows.map((r: any) => ({
      ...r,
      id: String(r.id),
      so_date: r.so_date ? r.so_date.split("T")[0] : "",
      start_date: r.start_date ? r.start_date.split("T")[0] : "",
      end_date: r.end_date ? r.end_date.split("T")[0] : "",
      items: r.items ? (typeof r.items === 'string' ? JSON.parse(r.items) : r.items) : [],
      selected_terms_ids: r.selected_terms_ids 
        ? (typeof r.selected_terms_ids === 'string' ? JSON.parse(r.selected_terms_ids) : r.selected_terms_ids)
        : [],
    }));
    
    setServiceOrders(normalized);

  } catch (err) {
    console.error("loadData error", err);
    toast.error("Failed to load data");
    setServiceOrders([]);
    setVendors([]);
    setProjects([]);
    setServiceTypes([]);
    setBuildings([]);
  } finally {
    setLoading(false);
  }
};

// Add this function to load project details when project is selected
const loadProjectBuildings = async (projectId: string) => {
  try {
    const projectRes: any = await projectApi.getProjectById(projectId);
    const projectData = projectRes.data;
    
    const buildingsList = Array.isArray(projectData?.buildings) 
      ? projectData.buildings.map((b: any) => ({
          id: b.id,
          name: b.building_name || b.name || "N/A",
        }))
      : [];
      
    setBuildings(buildingsList);
  } catch (error) {
    console.error("Error loading project buildings:", error);
    toast.error("Failed to load buildings for selected project");
    setBuildings([]);
  }
};

// Update the project selection in your form:
<SearchableSelect
  options={projects.map((p: any) => ({
    id: String(p.id),
    name: p.name || p.project_name || "N/A",
  }))}
  value={formData.project_id}
  onChange={(id) => {
    setFormData({ ...formData, project_id: id, building_id: "" }); // Reset building when project changes
    loadProjectBuildings(id); // Load buildings for selected project
  }}
  placeholder="Select Project"
  required
/>

  const loadTerms = async (vendorId: string) => {
    try {
      let data: any = await TermsConditionsApi.getByIdVendorTC(vendorId);
      data = data.filter((d: any) => d.is_active);
      const result = Object.values(
        data.reduce((acc: any, item: any) => {
          const key = item.category;
          if (!acc[key]) {
            acc[key] = {
              id: item.id,
              vendor_id: item.vendor_id,
              category: item.category,
              content: [],
              is_active: item.is_active,
            };
          }
          acc[key].content.push({
            content: item.content,
            is_default: Boolean(item.is_default),
            term_id: item.id,
          });
          const status = acc[key].content.find((c: any) => !c.is_default);
          acc[key].isActive = status ? false : true;
          return acc;
        }, {}),
      );
      setTerms(Array.isArray(result) ? result : []);
    } catch (err) {
      console.warn("loadTerms failed, fallback to empty", err);
      setTerms([]);
    }
  };

  const generateSONumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 9999)
      .toString()
      .padStart(4, "0");
    return `SO/${year}/${month}/${random}`;
  };

  // Add service item from master
  const addItemFromMaster = (item: ServiceMasterItem) => {
    const existingIndex = formData.items.findIndex(
      (i) => i.service_item_id === item.id,
    );

    let updatedItems: ServiceItem[];

    if (existingIndex !== -1) {
      updatedItems = formData.items.map((i, index) => {
        if (index === existingIndex) {
          const newQty = i.quantity + 1;
          const amount = newQty * i.rate;
          const gstAmount = (amount * ((item.cgst_rate || 0) + (item.sgst_rate || 0))) / 100;
          return {
            ...i,
            quantity: newQty,
            amount,
            gst_amount: gstAmount,
          };
        }
        return i;
      });
    } else {
      const newItem: ServiceItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2, 9),
        service_item_id: item.id,
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        description: item.description || "",
        hsn_code: item.hsn_code || "",
        quantity: 1,
        unit: item.unit || "",
        rate: item.standard_rate || 0,
        amount: item.standard_rate || 0,
        igst_rate: item.igst_rate || 0,
        cgst_rate: item.cgst_rate || 0,
        sgst_rate: item.sgst_rate || 0,
        gst_amount: ((item.standard_rate || 0) * ((item.cgst_rate || 0) + (item.sgst_rate || 0))) / 100,
      };

      updatedItems = [...formData.items, newItem];
    }

    setFormData({ ...formData, items: updatedItems });
    calculateTotals(updatedItems, formData.discount_percentage);
    setShowItemSelector(false);
    setItemSelectorSearch("");
  };

  const handleItemChange = (index: number, field: keyof ServiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const item = newItems[index];
      const amount = item.quantity * item.rate;
      const gstAmount = (amount * ((item.cgst_rate || 0) + (item.sgst_rate || 0))) / 100;
      newItems[index].amount = amount;
      newItems[index].gst_amount = gstAmount;
    }

    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.discount_percentage);
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems, formData.discount_percentage);
  };

  const calculateTotals = (itemsList: ServiceItem[], discountPercentage: number) => {
    const subTotal = itemsList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const discountAmount = (subTotal * (discountPercentage || 0)) / 100;
    const taxableAmount = subTotal - discountAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    itemsList.forEach((item) => {
      const itemTaxableRatio = discountAmount > 0 ? item.amount / subTotal : 1;
      const itemDiscount = discountAmount * itemTaxableRatio;
      const itemTaxableAmount = item.amount - itemDiscount;

      const itemCgstAmount = (itemTaxableAmount * (item.cgst_rate || 0)) / 100;
      const itemSgstAmount = (itemTaxableAmount * (item.sgst_rate || 0)) / 100;
      cgstAmount += itemCgstAmount;
      sgstAmount += itemSgstAmount;
    });

    const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = taxableAmount + totalGstAmount;

    setFormData((prev) => ({
      ...prev,
      sub_total: subTotal,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      total_gst_amount: totalGstAmount,
      grand_total: grandTotal,
    }));
  };

  const handleDiscountChange = (percentage: number) => {
    setFormData({ ...formData, discount_percentage: percentage });
    calculateTotals(formData.items, percentage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vendor_id || !formData.project_id || !formData.service_type_id) {
      toast.error("Please fill required fields: Vendor, Project, Service Type");
      return;
    }
    if (formData.items.length === 0) {
      toast.error("Add at least one service item");
      return;
    }

    const now = new Date().toISOString();
    const soEntry = {
      ...formData,
      so_number: formData.so_number || generateSONumber(),
      items: JSON.stringify(formData.items),
      selected_terms_ids: JSON.stringify(formData.selected_terms_ids),
      created_by: formData.created_by ?? user?.id ?? null,
      created_at: editingId ? (formData.created_at ?? now) : now,
    };

    try {
      if (editingId) {
        await updateServiceOrder(editingId, soEntry);
        toast.success("Service Order updated successfully!");
      } else {
        await createServiceOrder(soEntry);
        toast.success("Service Order created successfully!");
      }

      await loadData();
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save service order");
      console.error("handleSubmit error", err);
    }
  };

  const handleEdit = (so: any) => {
    setEditingId(so.id ?? null);
    setFormData({
      ...so,
      items: so.items || [],
      selected_terms_ids: so.selected_terms_ids ? JSON.parse(so.selected_terms_ids) : [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      so_number: "",
      vendor_id: "",
      project_id: "",
      service_type_id: "",
      building_id: "",
      so_date: new Date().toISOString().split("T")[0],
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      
      items: [],
      sub_total: 0,
      discount_percentage: 0,
      discount_amount: 0,
      taxable_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_gst_amount: 0,
      grand_total: 0,
      
      payment_terms: "",
      terms_and_conditions: "",
      advance_amount: 0,
      total_paid: 0,
      balance_amount: 0,
      
      status: 'draft',
      service_status: 'pending',
      selected_terms_ids: [],
      note: "",
      
      created_by: user?.id ?? null,
      created_at: new Date().toISOString(),
    });
    setEditingId(null);
    setSelectedPaymentTerms([]);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const map: any = {
      draft: "bg-gray-100 text-gray-700",
      approve: "bg-blue-100 text-blue-700",
      authorize: "bg-green-100 text-green-700",
      reject: "bg-red-100 text-red-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  const getServiceStatusBadge = (status: string) => {
    const map: any = {
      pending: "bg-yellow-100 text-yellow-700",
      partial: "bg-orange-100 text-orange-700",
      completed: "bg-green-100 text-green-700",
    };
    return map[status] || "bg-gray-100 text-gray-700";
  };

  // For demo - mock service items data
  // In real app, fetch from API
  const mockServiceItems: ServiceMasterItem[] = [
    {
      id: "1",
      item_code: "SRV001",
      item_name: "Electrical Maintenance",
      description: "Monthly electrical system maintenance",
      hsn_code: "9987",
      unit: "Hour",
      standard_rate: 500,
      igst_rate: 18,
      cgst_rate: 9,
      sgst_rate: 9,
      category: "service",
    },
    {
      id: "2",
      item_code: "SRV002",
      item_name: "HVAC Service",
      description: "HVAC system servicing",
      hsn_code: "9987",
      unit: "Hour",
      standard_rate: 800,
      igst_rate: 18,
      cgst_rate: 9,
      sgst_rate: 9,
      category: "service",
    },
    {
      id: "3",
      item_code: "SRV003",
      item_name: "Plumbing Repair",
      description: "Emergency plumbing repair",
      hsn_code: "9987",
      unit: "Hour",
      standard_rate: 600,
      igst_rate: 18,
      cgst_rate: 9,
      sgst_rate: 9,
      category: "service",
    },
  ];

  // Mock payment terms data
  const mockPaymentTerms = [
    { id: "1", name: "30% Advance, 70% on completion", advance_percentage: 30 },
    { id: "2", name: "50% Advance, 50% on completion", advance_percentage: 50 },
    { id: "3", name: "100% After completion", advance_percentage: 0 },
  ];

  // Add payment term to selected list
  const addPaymentTerm = (term: any) => {
    if (!selectedPaymentTerms.find(t => t.id === term.id)) {
      setSelectedPaymentTerms([...selectedPaymentTerms, term]);
      const advanceAmount = (formData.grand_total * (term.advance_percentage || 0)) / 100;
      setFormData(prev => ({
        ...prev,
        advance_amount: advanceAmount,
        payment_terms: prev.payment_terms ? `${prev.payment_terms}\n${term.name}` : term.name
      }));
    }
  };

  // Remove payment term
  const removePaymentTerm = (termId: string) => {
    setSelectedPaymentTerms(selectedPaymentTerms.filter(t => t.id !== termId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 px-3">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading service orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 px-0 md:px-0 -mt-4">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 px-0">
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#C62828] text-white px-2 md:px-6 py-2 md:py-3 rounded-lg hover:bg-red-500 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md text-sm md:text-base whitespace-nowrap transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Service Order
        </button>
      </div>

      {/* Main Table (unchanged from your code) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SO Number
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Vendor
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Service Type
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Dates
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Building
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Financials
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Service Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row - Separate Row Below Headers */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* SO Number Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="SO Number..."
                    value={searchSONumber}
                    onChange={(e) => setSearchSONumber(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Vendor Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Vendor..."
                    value={searchVendor}
                    onChange={(e) => setSearchVendor(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Project Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Project..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Service Type Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Service Type..."
                    value={searchServiceType}
                    onChange={(e) => setSearchServiceType(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Dates Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <div className="space-y-1">
                    <input
                      type="date"
                      placeholder="Start Date..."
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="date"
                      placeholder="End Date..."
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </td>

                {/* Building Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Building..."
                    value={searchBuilding}
                    onChange={(e) => setSearchBuilding(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Financials Column - No search */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Status Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="approve">Approve</option>
                    <option value="authorize">Authorize</option>
                    <option value="reject">Reject</option>
                  </select>
                </td>

                {/* Service Status Column Search */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={searchServiceStatus}
                    onChange={(e) => setSearchServiceStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Service Status</option>
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>

                {/* Actions Column - Clear Filter Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={() => {
                      setSearchSONumber("");
                      setSearchVendor("");
                      setSearchProject("");
                      setSearchServiceType("");
                      setSearchBuilding("");
                      setSearchStartDate("");
                      setSearchEndDate("");
                      setSearchStatus("");
                      setSearchServiceStatus("");
                    }}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear Filters"
                  >
                    <XCircle className="w-3 h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {serviceOrders.map((so) => (
                <tr key={so.id} className="hover:bg-gray-50 transition">
                  <td className="px-3 md:px-4 py-3">
                    <span className="font-medium text-blue-600 text-xs md:text-sm">
                      {so.so_number}
                    </span>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                      {so.so_date ? formatDate(so.so_date) : ""}
                    </p>
                  </td>
                  
                 <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
  {vendors.find((v) => Number(v.id) === Number(so.vendor_id))?.name || "N/A"}
</td>

<td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
  {projects.find((p) => Number(p.id) === Number(so.project_id))?.name || "N/A"}
</td>

<td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
  {serviceTypes.find((s) => Number(s.id) === Number(so.service_type_id))?.name || "N/A"}
</td>

<td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
  {buildings.find((b) => Number(b.id) === Number(so.building_id))?.name || "N/A"}
</td>
                  
                  <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>Start: {formatDate(so.start_date)}</span>
                      </div>
                      {so.end_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>End: {formatDate(so.end_date)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
                    {buildings.find((b) => Number(b.id) === Number(so.building_id))?.name || "N/A"}
                  </td>
                  
                  <td className="px-3 md:px-4 py-3">
                    <div className="space-y-1">
                      <div className="font-medium text-xs md:text-sm">
                        {formatCurrency(so.grand_total)}
                      </div>
                      <div className="text-[10px] md:text-xs text-gray-500">
                        Sub: {formatCurrency(so.sub_total)}
                      </div>
                      {so.discount_amount > 0 && (
                        <div className="text-[10px] md:text-xs text-green-600">
                          Disc: {formatCurrency(so.discount_amount)}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-3 md:px-4 py-3">
                    <span
                      className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusBadge(so.status)}`}
                    >
                      {so.status?.toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="px-3 md:px-4 py-3">
                    <span
                      className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getServiceStatusBadge(so.service_status)}`}
                    >
                      {so.service_status?.toUpperCase()}
                    </span>
                  </td>
                  
                  <td className="px-3 md:px-4 py-3">
                    <div className="flex items-center justify-center gap-1.5 md:gap-2">
                      <button
                        onClick={() => handleEdit(so)}
                        className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Print"
                      >
                        <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={() => {
                          const url = `${window.location.href}#so=${so.id}`;
                          navigator.clipboard.writeText(url);
                          toast.success("Link copied to clipboard");
                        }}
                        className="p-1.5 md:p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        title="Share"
                      >
                        <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("Are you sure you want to delete this service order?")) {
                            try {
                              await deleteServiceOrder(so.id!);
                              await loadData();
                              toast.success("Service order deleted");
                            } catch (err) {
                              toast.error("Delete failed");
                            }
                          }
                        }}
                        className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {serviceOrders.length === 0 && (
            <div className="text-center py-12 px-3">
              <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No service orders found
              </h3>
              <p className="text-gray-600 text-sm">
                Click "Create Service Order" to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal (Similar to PO Form) */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            {/* Header */}
            <div
              className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
  px-6 py-4 flex justify-between items-center
  rounded-t-2xl border-b border-white/10
  backdrop-blur-md"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Wrench className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-white leading-tight">
                    {editingId ? "Edit Service Order" : "Create Service Order"}
                  </h2>
                  <p className="text-xs text-white/80 mt-0.5">
                    Manage and create service orders
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-4 md:p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar"
            >
              {/* Basic Information */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Vendor */}
                 {/* Vendor */}
<div>
  <label className="block text-xs font-medium text-gray-700 mb-1.5">
    Vendor *
  </label>
  <SearchableSelect
    options={vendors.map((v) => ({
      id: String(v.id),
      name: v.name || v.vendor_name || "N/A",
    }))}
    value={formData.vendor_id}
    onChange={(id) => {
      setFormData({ ...formData, vendor_id: id });
      loadTerms(id);
    }}
    placeholder="Select Vendor"
    required
  />
</div>

                  {/* Project */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-green-600" />
                      <span>Project</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-600 transition-colors">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <SearchableSelect
                        options={projects.map((p) => ({
                          id: p.id,
                          name: p.name,
                        }))}
                        value={formData.project_id}
                        onChange={(id) => setFormData({ ...formData, project_id: id })}
                        placeholder="Select Project"
                        required
                      />
                    </div>
                  </div>

                  {/* Service Type */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-purple-600" />
                      <span>Service Type</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <SearchableSelect
                        options={serviceTypes.map((t: any) => ({
                          id: String(t.id),
                          name: t.name,
                        }))}
                        value={formData.service_type_id}
                        onChange={(id) => setFormData({ ...formData, service_type_id: id })}
                        placeholder="Select Service Type"
                        required
                      />
                    </div>
                  </div>

                  {/* Building */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-amber-600" />
                      <span>Building</span>
                    </label>
                    <div className="relative group">
                      <SearchableSelect
                        options={buildings.map((b) => ({
                          id: b.id,
                          name: b.name,
                        }))}
                        value={formData.building_id}
                        onChange={(id) => setFormData({ ...formData, building_id: id })}
                        placeholder="Select Building"
                      />
                    </div>
                  </div>
                  {/* SO Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>SO Date</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.so_date}
                      min={today}
                      onChange={(e) =>
                        setFormData({ ...formData, so_date: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl"
                      required
                    />
                  </div>
                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-blue-600" />
                      <span>Start Date</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      min={today}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          start_date: e.target.value,
                          end_date: "" // start date change hone par end date reset
                        })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-red-600" />
                      <span>End Date</span>
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      min={formData.start_date || today}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Service Items Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">Service Items</h4>
                    {formData.items.length > 0 && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {formData.items.length} items
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.vendor_id) {
                        toast.warning("Select Vendor First.");
                        return;
                      }
                      setShowItemSelector(true);
                      setItemSelectorSearch("");
                    }}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium flex items-center gap-2 group w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Add Service Item from Master
                  </button>
                </div>

                {formData.items.length === 0 ? (
                  <div className="bg-gradient-to-b from-gray-50/50 to-white/50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center group hover:border-blue-300 transition-all duration-300">
                    <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
                      <Package className="w-8 h-8 text-blue-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      No service items added yet
                    </p>
                    <p className="text-xs text-gray-500">
                      Click "Add Service Item from Master" to start
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200"
                      >
                        <div className="grid grid-cols-12 gap-3 items-center">
                          {/* Item Details */}
                          <div className="col-span-4 md:col-span-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                                <Box className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-gray-800 break-words">
                                  {item.item_name}
                                </p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="text-xs text-gray-500">
                                    Code: {item.item_code}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    | HSN: {item.hsn_code}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quantity */}
                          <div className="col-span-3 md:col-span-2">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Qty
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={item.quantity}
                                onChange={(e) => {
                                  if (!/^\d*\.?\d*$/.test(e.target.value) || Number(e.target.value) < 0)
                                    return;
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    parseFloat(e.target.value) || 0,
                                  );
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20 outline-none transition-all duration-200 hover:border-gray-400 text-gray-800"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>

                          {/* Unit */}
                          <div className="col-span-2 md:col-span-1">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Unit
                            </label>
                            <p className="text-sm text-gray-700">{item.unit}</p>
                          </div>

                          {/* Rate */}
                          <div className="col-span-3 md:col-span-2">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Rate
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">₹</span>
                              <input
                                type="text"
                                value={item.rate}
                                onChange={(e) => {
                                  if (!/^\d*\.?\d*$/.test(e.target.value) || Number(e.target.value) < 0)
                                    return;
                                  handleItemChange(
                                    index,
                                    "rate",
                                    parseFloat(e.target.value) || 0,
                                  );
                                }}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none transition-all duration-200 hover:border-gray-400 text-gray-800"
                                min="0"
                                step="0.01"
                              />
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="col-span-3 md:col-span-2">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Amount
                            </label>
                            <div>
                              <p className="font-semibold text-sm text-gray-800">
                                {formatCurrency(item.amount)}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                CGST: {item.cgst_rate}% | SGST: {item.sgst_rate}%
                              </p>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                              title="Remove"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment Terms Section */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-800">Payment Terms</h4>
                    {selectedPaymentTerms.length > 0 && (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                        {selectedPaymentTerms.length} terms
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPaymentTerms(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 text-sm font-medium flex items-center gap-2 group w-full sm:w-auto justify-center"
                  >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Add Payment Terms
                  </button>
                </div>

                {selectedPaymentTerms.length === 0 ? (
                  <div className="bg-gradient-to-b from-gray-50/50 to-white/50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center group hover:border-purple-300 transition-all duration-300">
                    <div className="p-3 bg-purple-50 rounded-xl inline-block mb-3">
                      <CreditCard className="w-8 h-8 text-purple-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      No payment terms added yet
                    </p>
                    <p className="text-xs text-gray-500">
                      Click "Add Payment Terms" to set payment conditions
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPaymentTerms.map((term, index) => (
                      <div
                        key={term.id}
                        className="bg-gradient-to-b from-purple-50/30 to-white/30 p-4 rounded-xl border border-purple-300 hover:border-purple-400 transition-all duration-200"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-sm text-gray-800">
                              {term.name}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              Advance: {term.advance_percentage}%
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removePaymentTerm(term.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-105"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Calculation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="col-span-2"></div>
                <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Subtotal</span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatCurrency(formData.sub_total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Total GST</span>
                      <span className="text-sm font-medium text-gray-800">
                        {formatCurrency(formData.total_gst_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                      <span className="text-sm font-semibold text-gray-800">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-blue-700">
                        {formatCurrency(formData.grand_total)}
                      </span>
                    </div>
                    {selectedPaymentTerms.length > 0 && (
                      <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-600">
                          Advance Amount
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(formData.advance_amount)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms & Conditions Section */}
              <div className="pb-6">
                {terms.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-amber-100 rounded-lg">
                        <FileText className="w-4 h-4 text-amber-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        Terms & Conditions
                      </h4>
                    </div>
                    <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300">
                      <div className="space-y-4">
                        {terms.map((d, indx: number) => (
                          <div key={indx} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                onChange={(e) => {
                                  setTerms((prev) =>
                                    prev.map((tc) =>
                                      tc.id === d.id
                                        ? {
                                            ...tc,
                                            isActive: !tc.isActive,
                                            content: tc.content.map((i: any) => ({
                                              ...i,
                                              is_default: !tc.isActive,
                                            })),
                                          }
                                        : tc,
                                    ),
                                  );
                                }}
                                checked={d.isActive || d.content.filter((ftc: any) => ftc.is_default).length === d.content.length}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                              <h5 className="text-xs font-semibold text-gray-700">
                                {d.category.charAt(0).toUpperCase() + d.category.slice(1)}
                              </h5>
                            </div>
                            <ul className="space-y-1.5 ml-6">
                              {d.content.map((term: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={term.is_default}
                                    onChange={() => {
                                      setTerms((prev) =>
                                        prev.map((tc) =>
                                          tc.id === d.id
                                            ? {
                                                ...tc,
                                                content: tc.content.map((i: any) =>
                                                  i.term_id === term.term_id
                                                    ? { ...i, is_default: !i.is_default }
                                                    : i,
                                                ),
                                              }
                                            : tc,
                                        ),
                                      );
                                    }}
                                    className="w-3.5 h-3.5 accent-blue-600 cursor-pointer mt-0.5"
                                  />
                                  <span className="text-xs text-gray-700">{term.content}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-3">
                  <button
                    onClick={() => {
                      if (formData.vendor_id) setShowTermsConditions(true);
                      else toast.warning("Select Vendor first.");
                    }}
                    type="button"
                    className="text-xs font-medium text-blue-700 hover:text-blue-800 px-3 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-3 h-3" />
                    Add Terms & Conditions
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-300 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 pb-4">
                <button
                  type="submit"
                  disabled={formData.items.length === 0}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl hover:from-red-400 hover:to-red-800 transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                >
                  <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {editingId ? "Update Service Order" : "Create Service Order"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service Item Selector Modal */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[60] p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-2xl border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Select Service Items
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Choose from service catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowItemSelector(false);
                  setItemSelectorSearch("");
                }}
                className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-gray-300">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a5d5a]">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search service items..."
                  value={itemSelectorSearch}
                  onChange={(e) => setItemSelectorSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f]"
                />
              </div>
            </div>

            {/* Items List */}
            <div className="p-2 overflow-y-auto flex-grow">
              <div className="space-y-2">
                {mockServiceItems.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-[#40423f]">
                      No service items found
                    </p>
                    <p className="text-xs text-[#5a5d5a] mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  mockServiceItems.map((item) => {
                    const existingItem = formData.items.find(
                      (i) => i.service_item_id === item.id,
                    );

                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => addItemFromMaster(item)}
                        className={`w-full p-3 text-left border rounded-xl transition-all duration-200 ${
                          existingItem
                            ? "border-[#b52124]/30 bg-[#b52124]/5"
                            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-2">
                              <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                                <Package className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2">
                                  <p className="font-medium text-sm text-[#40423f] truncate">
                                    {item.item_name}
                                  </p>
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                                    SERVICE
                                  </span>
                                </div>
                                <p className="text-xs text-[#5a5d5a] mt-1">
                                  {item.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs text-[#5a5d5a]">
                                    {item.item_code}
                                  </span>
                                  {item.hsn_code && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                      HSN: {item.hsn_code}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <div
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                                existingItem
                                  ? "bg-[#b52124] text-white"
                                  : "bg-[#b52124]/10 text-[#b52124]"
                              }`}
                            >
                              {existingItem ? "Add More" : "Add"}
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-[#40423f]">
                                {formatCurrency(item.standard_rate)}
                              </div>
                              <div className="text-xs text-[#5a5d5a]">
                                CGST: {item.cgst_rate}% | SGST: {item.sgst_rate}%
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-300 bg-gradient-to-r from-gray-50/50 to-transparent flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowItemSelector(false);
                  setItemSelectorSearch("");
                }}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Terms Modal */}
      {showPaymentTerms && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-2xl border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Payment Terms
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Select payment terms for service order
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaymentTerms(false)}
                className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-grow">
              <div className="space-y-3">
                {mockPaymentTerms.map((term) => {
                  const isSelected = selectedPaymentTerms.find(t => t.id === term.id);
                  return (
                    <button
                      type="button"
                      key={term.id}
                      onClick={() => addPaymentTerm(term)}
                      className={`w-full p-4 text-left border rounded-xl transition-all duration-200 ${
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-purple-100' : 'bg-gray-100'}`}>
                              <CreditCard className={`w-4 h-4 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                            </div>
                            <p className="font-medium text-sm text-gray-800">
                              {term.name}
                            </p>
                          </div>
                          <div className="mt-2 ml-7">
                            <p className="text-xs text-gray-600">
                              Advance: <span className="font-semibold">{term.advance_percentage}%</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {isSelected ? (
                            <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                              Selected
                            </div>
                          ) : (
                            <div className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                              Select
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-300 bg-gradient-to-r from-gray-50/50 to-transparent flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowPaymentTerms(false)}
                className="w-full px-4 py-2.5 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsConditions && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[70] p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-md border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <ClipboardCheck className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Terms & Conditions
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Manage terms and conditions
                  </p>
                </div>
              </div>
              <div className="flex">
                <button
                  onClick={() => setShowAddTerm(true)}
                  className="text-white bg-green-600 hover:bg-green-700 rounded-lg px-2 py-1 font-medium text-xs flex items-center mr-2"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add
                </button>
                <button
                  onClick={() => setShowTermsConditions(false)}
                  className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-scroll flex-grow min-h-32 max-h-96">
              <ul className="space-y-3">
                {terms.map((d, indx: number) => (
                  <li key={indx} className="border border-gray-300 rounded-xl p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="checkbox"
                        onChange={() => {
                          const isActive = !d.isActive;
                          setTerms((prev) =>
                            prev.map((tc) =>
                              tc.id === d.id
                                ? {
                                    ...tc,
                                    isActive: isActive,
                                    content: tc.content.map((i: any) => ({
                                      ...i,
                                      is_default: isActive,
                                    })),
                                  }
                                : tc,
                            ),
                          );
                        }}
                        checked={
                          d.isActive ||
                          d.content.filter((ftc: any) => ftc.is_default).length === d.content.length
                        }
                        className="w-4 h-4 accent-[#b52124] cursor-pointer mt-0.5"
                      />
                      <h4 className="font-semibold text-sm text-[#40423f]">
                        {d.category.charAt(0).toUpperCase() + d.category.slice(1) || ""}
                      </h4>
                    </div>

                    <ul className="ml-6 space-y-2">
                      {d.content.map((term: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={term.is_default}
                            onChange={() => {
                              setTerms((prev) =>
                                prev.map((tc) =>
                                  tc.id === d.id
                                    ? {
                                        ...tc,
                                        content: tc.content.map((i: any) =>
                                          i.term_id === term.term_id
                                            ? { ...i, is_default: !i.is_default }
                                            : i,
                                        ),
                                      }
                                    : tc,
                                ),
                              );
                            }}
                            className="w-3.5 h-3.5 accent-[#b52124] cursor-pointer mt-0.5"
                          />
                          <span className="text-xs text-[#5a5d5a]">{term.content}</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Add Term Modal */}
      {showAddTerm && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[80] p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-md border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Add Term
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Add new terms & conditions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddTerm(false)}
                className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  Category <span className="text-[#b52124]">*</span>
                </label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none bg-white/50"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="payment">Payment</option>
                  <option value="delivery">Delivery</option>
                  <option value="quality">Quality</option>
                  <option value="warranty">Warranty</option>
                  <option value="legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  Terms & Condition <span className="text-[#b52124]">*</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none bg-white/50"
                  rows={3}
                  placeholder="Enter the full terms & conditions text..."
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    toast.success("Term added successfully");
                    setShowAddTerm(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white px-4 py-2.5 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Add Term
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddTerm(false)}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-[#40423f]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}