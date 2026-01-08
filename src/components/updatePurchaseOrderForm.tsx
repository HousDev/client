// src/components/PurchaseOrdersPro.tsx
import React, { useEffect, useState, useRef, SetStateAction } from "react";
import { Plus, X, Trash2, Package, Save } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import poApi from "../lib/poApi";
import poTypeApi from "../lib/poTypeApi";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";

/* --- types (same as yours) --- */
interface POItem {
  id: string;
  item_id: string;
  item_code: string;
  item_name: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;

  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;

  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
}

interface POFormData {
  poId: number;
  po_number: string;
  vendor_id: string;
  project_id: string;
  po_type_id: string;
  po_date: string;
  delivery_date: string;
  is_interstate: boolean;
  items: any[];
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  taxable_amount: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  total_gst_amount: number;
  grand_total: number;
  payment_terms_id: string;
  advance_amount: number;
  selected_terms_ids: string[];
  terms_and_conditions: string;
  notes: string;
}

type Option = { id: string; name: string } | string;

/* ------------------ SearchableSelect component (inline) ------------------ */
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

  // Normalize options to {id,name}
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt
  );

  const selected = normalized.find((o) => o.id === value) || null;

  const filtered = normalized.filter((o) =>
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
        className={`w-full flex items-center gap-2 px-3 py-2 border rounded-lg bg-white cursor-pointer ${
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
      <input type="hidden" value={value} />
    </div>
  );
}

/* ------------------ Main component ------------------ */

export default function UpdatePurchaseOrderForm({
  setShowEditModal,
  loadAllData,
  selectedPO,
}: {
  setShowEditModal: React.Dispatch<SetStateAction<boolean>>;
  loadAllData: () => void;
  selectedPO: any;
}): JSX.Element {
  console.log(selectedPO, "from update po");
  const { user } = useAuth();
  const [pos, setPOs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [poTypes, setPOTypes] = useState<any[]>([]);
  const [poTypesLoading, setPOTypesLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any[]>([]);
  const [terms, setTerms] = useState<any[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedPOS, setSelectedPOS] = useState<any>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [newTermsAndCondition, setNewTermsAndConditions] = useState("");

  // item selector internal search
  const [itemSelectorSearch, setItemSelectorSearch] = useState("");

  const [formData, setFormData] = useState<POFormData>(selectedPO);
  const [showTermsConditions, setShowTermsConditions] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPOTypes(formData.project_id || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.project_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPOs(),
        loadVendors(),
        loadProjects(),
        loadPOTypes(),
        loadItems(),
        loadTerms(),
        loadPaymentTerms(),
      ]);
    } catch (err) {
      console.error("loadData error", err);
    } finally {
      setLoading(false);
    }
  };

  const loadPOs = async () => {
    try {
      const data = await poApi.getPOs();
      console.log("from loadPOs", data);
      setPOs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPOs failed, fallback to empty", err);
      setPOs([]);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await poApi.getVendors(true);
      console.log(data, "update venders");
      setVendors(
        Array.isArray(data)
          ? data.filter((d: any) => d.category_name === "Material")
          : []
      );
    } catch (err) {
      console.warn("loadVendors failed, fallback to empty", err);
      setVendors([]);
    }
  };

  const loadProjects = async () => {
    try {
      const data: any = await poApi.getProjects();
      setProjects(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      console.warn("loadProjects failed, fallback to empty", err);
      setProjects([]);
    }
  };

  const loadPOTypes = async (projectId?: string) => {
    setPOTypesLoading(true);
    try {
      const data = await poTypeApi.getPOTypes();
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : [];
      setPOTypes(list);
    } catch (err) {
      console.warn("loadPOTypes failed, fallback to empty", err);
      setPOTypes([]);
    } finally {
      setPOTypesLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      const data = await poApi.getItems();
      if (Array.isArray(data)) {
        const updatedData = data.map((item) => ({
          ...item,
          id: String(item.id),
        }));
        console.log(updatedData, "from items api");
        const onlyMaterial = updatedData.filter(
          (d: any) => d.category === "material"
        );
        setItems(onlyMaterial);
      } else {
        setItems([]);
      }
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadItems failed, fallback to empty", err);
      setItems([]);
    }
  };

  const loadTerms = async () => {
    try {
      const data: any = await TermsConditionsApi.getByIdVendorTC(
        selectedPO.vendor_id
      );
      const tempTerms = formData.terms_and_conditions.split(",");
      tempTerms.forEach((d: any) => {
        const existing = data.some((i: any) => i.content.includes(d));
        if (!existing) {
          data.push({ content: d });
        }
      });
      console.log(tempTerms);
      console.log(data, "from create po from terms data");
      setTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadTerms failed, fallback to empty", err);
      setTerms([]);
    }
  };
  useEffect(() => {
    loadTerms();
  }, []);

  const loadPaymentTerms = async () => {
    try {
      const data = await poApi.getPaymentTerms();
      setPaymentTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPaymentTerms failed, fallback to empty", err);
      setPaymentTerms([]);
    }
  };

  // --- Items helpers (keep existing functions) ---
  const addItemFromMaster = (item: any) => {
    const existingIndex = formData.items.findIndex(
      (i) => Number(i.item_id) === item.id
    );

    let updatedItems: POItem[];

    if (existingIndex !== -1) {
      updatedItems = formData.items.map((i, index) => {
        if (index === existingIndex) {
          const newQty = Number(i.quantity || 0) + 1;
          const rate = Number(i.rate || 0);
          const amount = newQty * rate;

          return {
            ...i,
            quantity: newQty,
            amount,
          };
        }
        return i;
      });
    } else {
      const newItem: POItem = {
        id: crypto.randomUUID(),
        item_id: item.id,
        item_code: item.item_code || "",
        item_name: item.item_name || "",
        description: item.description || "",
        hsn_code: item.hsn_code || "",
        quantity: 1,
        unit: item.unit || "nos",
        rate: Number(item.standard_rate || 0),
        amount: Number(item.standard_rate || 0),

        cgst_rate: Number(item.cgst_rate) || 0,
        sgst_rate: Number(item.sgst_rate) || 0,
        igst_rate: Number(item.igst_rate) || 0,

        cgst_amount: 0,
        sgst_amount: 0,
        igst_amount: 0,
      };

      updatedItems = [...formData.items, newItem];
    }

    setFormData({ ...formData, items: updatedItems });

    calculateTotals(
      updatedItems,
      formData.discount_percentage,
      formData.is_interstate
    );

    setShowItemSelector(false);
  };
  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const qty = Number(newItems[index].quantity || 0);
      const rate = Number(newItems[index].rate || 0);
      newItems[index].amount = qty * rate;
    }

    setFormData({ ...formData, items: newItems });

    calculateTotals(
      newItems,
      formData.discount_percentage,
      formData.is_interstate
    );
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(
      newItems,
      formData.discount_percentage,
      formData.is_interstate
    );
  };

  const deletePOItems = async (poItemId: any, poMaterialTrackingId: any) => {
    // console.log("ids for delete", poItemId, poMaterialTrackingId);
    try {
      const response: any = await poApi.deletePurchaseOrderItem(
        poItemId,
        poMaterialTrackingId
      );

      await loadAllData();
      console.log("response after delete po item", response);
      if (response.status === "Completed") {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const calculateTotals = (
    itemsList: POItem[],
    discountPercentage: number,
    isInterstate: boolean
  ) => {
    let subtotal = 0;
    let discountAmount = 0;
    let taxableAmount = 0;

    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const updatedItems = itemsList.map((item) => {
      const amount = Number(item.amount || 0);
      subtotal += amount;

      const itemDiscount = (amount * (discountPercentage || 0)) / 100;
      const itemTaxable = amount - itemDiscount;

      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isInterstate) {
        igstAmount = (itemTaxable * item.igst_rate) / 100;
        totalIGST += igstAmount;
      } else {
        cgstAmount = (itemTaxable * item.cgst_rate) / 100;
        sgstAmount = (itemTaxable * item.sgst_rate) / 100;
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
      }

      return {
        ...item,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
      };
    });

    discountAmount = (subtotal * (discountPercentage || 0)) / 100;
    taxableAmount = subtotal - discountAmount;

    const totalGstAmount = totalCGST + totalSGST + totalIGST;
    const grandTotal = taxableAmount + totalGstAmount;

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
      subtotal,
      discount_amount: discountAmount,
      taxable_amount: taxableAmount,
      cgst_amount: totalCGST,
      sgst_amount: totalSGST,
      igst_amount: totalIGST,
      total_gst_amount: totalGstAmount,
      grand_total: grandTotal,
    }));
  };

  const handleDiscountChange = (percentage: number) => {
    setFormData({ ...formData, discount_percentage: percentage });
    calculateTotals(formData.items, percentage, formData.is_interstate);
  };

  const handleInterstateChange = (isInterstate: boolean) => {
    setFormData({ ...formData, is_interstate: isInterstate });
    calculateTotals(formData.items, formData.discount_percentage, isInterstate);
  };

  const toggleTerm = (termId: string) => {
    const currentTerms = [...formData.selected_terms_ids];
    const idx = currentTerms.indexOf(termId);
    if (idx > -1) currentTerms.splice(idx, 1);
    else currentTerms.push(termId);
    setFormData({ ...formData, selected_terms_ids: currentTerms });
  };

  const handlePaymentTermsChange = (paymentTermsId: string) => {
    const selectedPaymentTerms = paymentTerms.find(
      (pt) => pt.id === paymentTermsId
    );
    const advanceAmount =
      selectedPaymentTerms && formData.grand_total
        ? (formData.grand_total *
            (selectedPaymentTerms.advance_percentage || 0)) /
          100
        : 0;
    setFormData({
      ...formData,
      payment_terms_id: paymentTermsId,
      advance_amount: advanceAmount,
    });
  };

  // Helper: derive 'material' or 'service' from selected PO Type
  const getselectedPOSTypeCategory = (): string | null => {
    if (!formData.po_type_id) return null;
    const selected = poTypes.find((t: any) => t.id === formData.po_type_id);
    if (!selected) return null;
    // prefer explicit category field if API provides it
    if (selected.category) return String(selected.category).toLowerCase();
    const name = String(selected.name || selected.type || "").toLowerCase();
    if (name.includes("material")) return "material";
    if (name.includes("materials")) return "material";
    if (name.includes("service")) return "service";
    if (name.includes("services")) return "service";
    return null;
  };

  // When PO Type change -> clear items (to avoid mixing categories)
  const handlePOTypeChange = (poTypeId: string) => {
    setFormData((prev) => ({
      ...prev,
      po_type_id: poTypeId,
      items: [], // reset items when type changes
      subtotal: 0,
      discount_amount: 0,
      taxable_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_gst_amount: 0,
      grand_total: 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("form data after submiting form", formData);

    try {
      if (
        formData.vendor_id === "" ||
        formData.project_id === "" ||
        formData.po_type_id === "" ||
        formData.po_date === "" ||
        formData.delivery_date === ""
      ) {
        toast.error("Fill all required fields.");
        return;
      }
      if (formData.items.length === 0) {
        toast.error("Add Items.");
        return;
      }
      const payload = {
        po_number: formData.po_number,
        vendor_id: formData.vendor_id,
        project_id: formData.project_id,
        po_type_id: formData.po_type_id,
        po_date: formData.po_date,
        delivery_date: formData.delivery_date,
        is_interstate: formData.is_interstate,
        items: formData.items,
        subtotal: formData.subtotal,
        discount_percentage: formData.discount_percentage,
        discount_amount: formData.discount_amount,
        taxable_amount: formData.taxable_amount,
        cgst_amount: formData.cgst_amount,
        sgst_amount: formData.sgst_amount,
        igst_amount: formData.igst_amount,
        total_gst_amount: formData.total_gst_amount,
        grand_total: formData.grand_total,
        payment_terms_id: formData.payment_terms_id,
        advance_amount: formData.advance_amount,
        total_paid: 0,
        balance_amount: formData.grand_total,
        selected_terms_ids: [],
        terms_and_conditions: formData.terms_and_conditions,
        notes: formData.notes,
        status: "draft",
        material_status: "pending",
        payment_status: "pending",
        created_by: user?.id,
      };
      const response = await poApi.updatePO(formData?.poId, payload);
      toast.success("PO Updated Successfully.");
      await loadAllData();

      console.log(response);

      setShowEditModal(false);
      resetForm();
      loadPOs();
    } catch (err) {
      console.error("Error creating PO:", err);
      toast.error("Error update purchase order");
    }
  };

  const resetForm = () => {
    setFormData({
      poId: 0,
      po_number: "",
      vendor_id: "",
      project_id: "",
      po_type_id: "",
      po_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      is_interstate: false,
      items: [],
      subtotal: 0,
      discount_percentage: 0,
      discount_amount: 0,
      taxable_amount: 0,
      cgst_amount: 0,
      sgst_amount: 0,
      igst_amount: 0,
      total_gst_amount: 0,
      grand_total: 0,
      payment_terms_id: "",
      advance_amount: 0,
      selected_terms_ids: [],
      terms_and_conditions: "",
      notes: "",
    });
    setItemSelectorSearch("");
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  // --- item selector filtering by selected PO type category + search
  const selectedCategory = getselectedPOSTypeCategory(); // 'material' | 'service' | null
  const filteredItems = items
    .filter((it) => {
      // if category known, filter by it
      if (selectedCategory) {
        return String(it.category || "").toLowerCase() === selectedCategory;
      }
      return true;
    })
    .filter((it) => {
      const q = itemSelectorSearch.trim().toLowerCase();
      if (!q) return true;
      return (
        (it.item_name || "").toString().toLowerCase().includes(q) ||
        (it.item_code || "").toString().toLowerCase().includes(q) ||
        (it.hsn_code || "").toString().toLowerCase().includes(q) ||
        (it.description || "").toString().toLowerCase().includes(q)
      );
    });

  return (
    <div className="p-6">
      {/* Create Modal (with SearchableSelects) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center sticky top-0 rounded-t-2xl">
            <h2 className="text-2xl font-bold text-white">
              Update Purchase Order
            </h2>
            <button
              onClick={() => {
                console.log(false);
                setShowEditModal(false);
                resetForm();
              }}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Basic Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor <span className="text-red-500">*</span>
                  </label>

                  {/* SearchableSelect for Vendor */}
                  <SearchableSelect
                    options={vendors.map((v) => ({
                      id: v.id,
                      name: v.name || v.vendor_name || v.display || "",
                    }))}
                    value={formData.vendor_id}
                    onChange={(id) => {
                      const interState =
                        vendors.find((d) => d.id === id).office_state !==
                        "Maharashtra";
                      setFormData({
                        ...formData,
                        vendor_id: id,
                        is_interstate: interState,
                      });
                    }}
                    placeholder="Select Vendor"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>

                  {/* SearchableSelect for Project */}
                  <SearchableSelect
                    options={projects.map((p) => ({
                      id: p.id,
                      name: p.name || p.project_name || "",
                    }))}
                    value={formData.project_id}
                    onChange={(id) =>
                      setFormData({ ...formData, project_id: id })
                    }
                    placeholder="Select Project"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Type <span className="text-red-500">*</span>
                  </label>

                  {/* SearchableSelect for PO Type (disabled while loading) */}
                  <SearchableSelect
                    options={poTypes.map((t: any) => ({
                      id: t.id,
                      name: t.name,
                    }))}
                    value={formData.po_type_id}
                    onChange={(id) => handlePOTypeChange(id)}
                    placeholder={
                      poTypesLoading ? "Loading types..." : "Select Type"
                    }
                    required
                    disabled={poTypesLoading}
                  />
                </div>

                {/* the rest fields unchanged */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PO Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.po_date}
                    onChange={(e) => {
                      console.log(e.target.value, "date from PO Date");
                      setFormData({ ...formData, po_date: e.target.value });
                    }}
                    className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        delivery_date: e.target.value,
                      })
                    }
                    className="w-full px-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="interstate"
                    checked={formData.is_interstate}
                    onChange={(e) => handleInterstateChange(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="interstate"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Interstate Supply (IGST)
                  </label>
                </div> */}
              </div>
            </div>

            {/* Items section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Items</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowItemSelector(true);
                    setItemSelectorSearch("");
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add Item from Master
                </button>
              </div>

              {formData.items.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No items added yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click "Add Item from Master" to start
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                    >
                      <div className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-3">
                          <label className="text-xs text-gray-600">Item</label>
                          <p className="font-medium text-gray-800">
                            {item.item_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.item_code}
                          </p>
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-gray-600">HSN</label>
                          <p className="text-sm text-gray-700">
                            {item.hsn_code}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">Qty</label>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => {
                              if (
                                !/^\d*\.?\d*$/.test(e.target.value) ||
                                parseFloat(e.target.value) < 0
                              )
                                return;
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <label className="text-xs text-gray-600">Unit</label>
                          <p className="text-sm text-gray-700">{item.unit}</p>
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">Rate</label>
                          <input
                            type="text"
                            value={item.rate}
                            onChange={(e) => {
                              if (
                                !/^\d*\.?\d*$/.test(e.target.value) ||
                                Number(e.target.value) < 0
                              )
                                return;
                              handleItemChange(
                                index,
                                "rate",
                                parseFloat(e.target.value) || 0
                              );
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-xs text-gray-600">
                            Amount
                          </label>
                          <p className="font-medium text-gray-800">
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formData.is_interstate
                              ? `IGST: ${item.igst_rate}%`
                              : `CGST: ${item.cgst_rate}% + SGST: ${item.sgst_rate}%`}
                          </p>
                        </div>
                        <div className="col-span-1 flex justify-end pt-5">
                          <button
                            type="button"
                            onClick={async () => {
                              const result: any = await MySwal.fire({
                                title: "Delete Item?",
                                text: "This action cannot be undone",
                                icon: "warning",
                                showCancelButton: true,
                              });

                              if (!result.isConfirmed) return;
                              if (
                                result.isConfirmed &&
                                item.materialTrackingId
                              ) {
                                deletePOItems(item.id, item.materialTrackingId);
                                const items = formData.items.filter(
                                  (i: any) => i.id !== item.id
                                );
                                calculateTotals(
                                  items,
                                  formData.discount_percentage,
                                  formData.is_interstate
                                );
                              } else {
                                if (result.isConfirmed) {
                                  const items = formData.items.filter(
                                    (i: any) => i.id !== item.id
                                  );
                                  calculateTotals(
                                    items,
                                    formData.discount_percentage,
                                    formData.is_interstate
                                  );
                                }
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

            {/* calculation summary unchanged */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="col-span-2"></div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <div>Subtotal</div>
                  <div>{formatCurrency(formData.subtotal)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <div>Discount ({formData.discount_percentage}%)</div>
                  <div>{formatCurrency(formData.discount_amount)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <div>Taxable</div>
                  <div>{formatCurrency(formData.taxable_amount)}</div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <div>Total GST</div>
                  <div>{formatCurrency(formData.total_gst_amount)}</div>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-800 mt-3">
                  <div>Grand Total</div>
                  <div>{formatCurrency(formData.grand_total)}</div>
                </div>
              </div>
            </div>
            <div className="pb-6">
              <h1 className="font-semibold">Terms & Conditions</h1>
              <div className="py-3">
                <ul className="px-6">
                  {terms.map((d) => (
                    <li className="mb-3">
                      <button
                        onClick={() => {
                          if (
                            formData.terms_and_conditions.includes(d.content)
                          ) {
                            if (
                              formData.terms_and_conditions.includes(
                                d.content + ","
                              )
                            ) {
                              setFormData((prev) => ({
                                ...prev,
                                terms_and_conditions:
                                  prev.terms_and_conditions.replace(
                                    d.content + ",",
                                    ""
                                  ),
                              }));
                            } else {
                              setFormData((prev) => ({
                                ...prev,
                                terms_and_conditions:
                                  prev.terms_and_conditions.replace(
                                    d.content,
                                    ""
                                  ),
                              }));
                            }
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              terms_and_conditions: prev.terms_and_conditions
                                ? `${prev.terms_and_conditions}, ${d.content}`
                                : d.content,
                            }));
                          }
                        }}
                        className="flex items-center cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.terms_and_conditions.includes(
                            d.content
                          )}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mr-3 cursor-pointer"
                        />
                        <span className="text-justify">{d.content}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center ">
                <button
                  onClick={() => {
                    setShowTermsConditions(true);
                  }}
                  type="button"
                  className="ml-2 text-sm font-medium text-blue-700"
                >
                  Add Terms & Conditions
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <button
                onClick={handleSubmit}
                disabled={formData.items.length === 0}
                className="flex-1 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Update Purchase Order
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
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

      {/* Item selector (with category + search) */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">
                Select Item from Master
              </h3>
              <button
                onClick={() => {
                  setShowItemSelector(false);
                  setItemSelectorSearch("");
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b">
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <input
                    placeholder={
                      selectedCategory
                        ? `Search ${selectedCategory} items...`
                        : "Search all items..."
                    }
                    value={itemSelectorSearch}
                    onChange={(e) => setItemSelectorSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {selectedCategory ? (
                    <span>
                      Filtering by type:{" "}
                      <strong className="capitalize">{selectedCategory}</strong>
                    </span>
                  ) : (
                    <span>Showing all item types</span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              <div className="grid grid-cols-1 gap-3">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    No items found for the selected PO type / search
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => addItemFromMaster(item)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800">
                            {item.item_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.item_code}{" "}
                            {item.hsn_code ? `| HSN: ${item.hsn_code}` : ""}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {formatCurrency(item.standard_rate)}
                          </p>
                          <p className="text-xs text-gray-600">
                            per {item.unit}
                          </p>
                          {formData.is_interstate ? (
                            <p className="text-xs text-gray-500">
                              IGST: {item.igst_rate ?? 0}%
                            </p>
                          ) : (
                            <p className="text-xs text-gray-500">
                              CGST: {item.cgst_rate ?? 0}% SGST:{" "}
                              {item.sgst_rate ?? 0}%
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                          String(item.category).toLowerCase() === "material"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {String(item.category || "UNKNOWN").toUpperCase()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showTermsConditions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Add Terms & Conditions
              </h2>
              <button
                onClick={() => setShowTermsConditions(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="py-6">
              <ul className="px-6">
                {terms.map((d) => (
                  <li className="mb-3">
                    <button
                      onClick={() => {
                        if (formData.terms_and_conditions.includes(d.content)) {
                          if (
                            formData.terms_and_conditions.includes(
                              d.content + ","
                            )
                          ) {
                            setFormData((prev) => ({
                              ...prev,
                              terms_and_conditions:
                                prev.terms_and_conditions.replace(
                                  d.content + ",",
                                  ""
                                ),
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              terms_and_conditions:
                                prev.terms_and_conditions.replace(
                                  d.content,
                                  ""
                                ),
                            }));
                          }
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            terms_and_conditions: prev.terms_and_conditions
                              ? `${prev.terms_and_conditions}, ${d.content}`
                              : d.content,
                          }));
                        }
                      }}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.terms_and_conditions.includes(
                          d.content
                        )}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mr-3 cursor-pointer"
                      />
                      <span className="text-justify">{d.content}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 items-end mb-6 px-6">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Extra Terms & Conditions
                </label>
                <div>
                  <input
                    type="text"
                    value={newTermsAndCondition}
                    onChange={(e) => setNewTermsAndConditions(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTerms((prev) => [
                    ...prev,
                    { content: newTermsAndCondition },
                  ]);
                  setFormData((prev) => ({
                    ...prev,
                    terms_and_conditions: prev.terms_and_conditions
                      ? `${prev.terms_and_conditions}, ${newTermsAndCondition}`
                      : newTermsAndCondition,
                  }));
                  setNewTermsAndConditions("");
                }}
                disabled={newTermsAndCondition.length === 0}
                className="bg-blue-600 text-white px-4 py-3 h-fit w-fit  rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
