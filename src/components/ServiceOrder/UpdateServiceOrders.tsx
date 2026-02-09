/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ServiceOrdersPro.tsx
import React, { useEffect, useState, useRef, SetStateAction } from "react";
import {
  Plus,
  X,
  Trash2,
  Package,
  Save,
  Layers,
  ClipboardCheck,
  Calendar,
  User,
  Search,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import poApi from "../../lib/poApi";
import poTypeApi from "../../lib/poTypeApi";
import TermsConditionsApi from "../../lib/termsConditionsApi";
import { toast } from "sonner";
import MySwal from "../../utils/swal";

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
  due_date: string;
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
  terms_and_conditions: any[];
  notes: string;
}
type addTermType = { category: string; content: string; is_default: boolean };
type Option = { id: string; name: string } | string;

/* ------------------ SearchableSelect component (inline) ------------------ */
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
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
        className={`w-full flex items-center gap-2 px-3 py-2 ${disabled ? "border" : "border border-slate-400"} border-gray-300 rounded-xl bg-white/50 cursor-pointer text-sm ${
          disabled
            ? "opacity-90 cursor-not-allowed"
            : "hover:shadow-sm hover:border-gray-400"
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
            <div className="text-sm text-gray-500">{placeholder}</div>
          )}
        </div>
        <div>
          <svg
            className={`w-4 h-4 transform transition text-[#5a5d5a] ${
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
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-xl shadow-lg">
          {/* search input */}
          <div className="p-2">
            <input
              autoFocus
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none text-sm"
            />
          </div>

          <ul
            role="listbox"
            aria-labelledby={id}
            className="max-h-60 overflow-y-auto divide-y divide-gray-200"
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
                    idx === highlight ? "bg-[#b52124]/10" : "hover:bg-gray-50"
                  } ${
                    opt.id === value
                      ? "font-medium text-[#40423f]"
                      : "text-[#5a5d5a]"
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

export default function UpdateServiceOrderForm({
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
  const [paymentTerms, setPaymentTerms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showItemSelector, setShowItemSelector] = useState(false);

  const [showAddTerm, setShowAddTerm] = useState<boolean>(false);
  const [extraTermData, setExtraTermData] = useState<addTermType>({
    category: "",
    content: "",
    is_default: false,
  });

  // item selector internal search
  const [itemSelectorSearch, setItemSelectorSearch] = useState("");

  const [formData, setFormData] = useState<POFormData>(selectedPO);
  const [showTermsConditions, setShowTermsConditions] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadPOTypes();
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
        // loadPaymentTerms(),
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
      setPOs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPOs failed, fallback to empty", err);
      setPOs([]);
    }
  };

  const loadVendors = async () => {
    try {
      const data = await poApi.getVendors(true);
      setVendors(
        Array.isArray(data)
          ? data.filter((d: any) => d.category_name === "Material")
          : [],
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

  const loadPOTypes = async () => {
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
        const onlyMaterial = updatedData.filter(
          (d: any) => d.category === "material",
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
        selectedPO.vendor_id,
      );

      if (!Array.isArray(data)) return;

      setFormData((prev: any) => {
        // clone existing terms safely
        const terms = structuredClone(prev.terms_and_conditions || []);

        data.forEach((element) => {
          let exists = false;

          // check duplicate
          terms.forEach((group: any) => {
            group.content.forEach((item: any) => {
              if (item.content === element.content) {
                exists = true;
              }
            });
          });

          if (!exists) {
            const group = terms.find(
              (g: any) => g.category === element.category,
            );

            if (group) {
              group.content.push({
                content: element.content,
                is_default: false,
                term_id: element.id,
              });
            } else {
              terms.push({
                category: element.category,
                content: [
                  {
                    content: element.content,
                    is_default: false,
                    term_id: element.id,
                  },
                ],
              });
            }
          }
        });
        return {
          ...prev,
          terms_and_conditions: terms,
        };
      });
    } catch (err) {
      console.warn("loadTerms failed", err);
    }
  };

  useEffect(() => {
    console.log(formData);
  }, [formData]);

  useEffect(() => {
    loadTerms();
  }, []);

  // const loadPaymentTerms = async () => {
  //   try {
  //     const data = await poApi.getPaymentTerms();
  //     setPaymentTerms(Array.isArray(data) ? data : []);
  //   } catch (err) {
  //     console.warn("loadPaymentTerms failed, fallback to empty", err);
  //     setPaymentTerms([]);
  //   }
  // };

  // --- Items helpers (keep existing functions) ---
  const addItemFromMaster = (item: any) => {
    const existingIndex = formData.items.findIndex(
      (i) => Number(i.item_id) === item.id,
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
      formData.is_interstate,
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
      formData.is_interstate,
    );
  };

  const deletePOItems = async (poItemId: any, poMaterialTrackingId: any) => {
    // console.log("ids for delete", poItemId, poMaterialTrackingId);
    try {
      const response: any = await poApi.deletePurchaseOrderItem(
        poItemId,
        poMaterialTrackingId,
      );

      await loadAllData();
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
    isInterstate: boolean,
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

    try {
      if (
        formData.vendor_id === "" ||
        formData.project_id === "" ||
        formData.po_type_id === "" ||
        formData.po_date === "" ||
        formData.delivery_date === "" ||
        formData.due_date === ""
      ) {
        toast.error("Fill all required fields.");
        return;
      }
      if (formData.items.length === 0) {
        toast.error("Add Items.");
        return;
      }

      const selected_terms_idsData: any = [];
      const terms_and_conditionsData: any = [];

      formData.terms_and_conditions.forEach((element: any) => {
        element.content.forEach((elem: any) => {
          if (elem.is_default && elem.term_id) {
            selected_terms_idsData.push(elem.term_id);
          } else if (elem.is_default) {
            terms_and_conditionsData.push(elem);
          }
        });
      });

      if (
        selected_terms_idsData.length === 0 ||
        terms_and_conditionsData.length === 0
      ) {
        toast.error("Select Terms & Conditions For Service Order.");
        return;
      }

      const payload = {
        po_number: formData.po_number,
        vendor_id: formData.vendor_id,
        project_id: formData.project_id,
        po_type_id: formData.po_type_id,
        po_date: formData.po_date,
        delivery_date: formData.delivery_date,
        due_date: formData.due_date,
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
        selected_terms_ids: JSON.stringify(selected_terms_idsData),
        terms_and_conditions: JSON.stringify(terms_and_conditionsData),
        notes: formData.notes,
        status: "draft",
        material_status: "pending",
        payment_status: "pending",
        created_by: user?.id,
      };

      const updatePORes: any = await poApi.updatePO(selectedPO.poId, payload);
      console.log(updatePORes);
      if (updatePORes.success) toast.success("PO Updated Successfully.");
      else toast.error("Faild to update PO.");
      await loadAllData();

      setShowEditModal(false);
      resetForm();
      loadPOs();
    } catch (err) {
      console.error("Error creating PO:", err);
      toast.error("Error update service order");
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
      due_date: "",
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
      terms_and_conditions: [],
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
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-50 p-2 md:p-4">
      {/* Create Modal (with SearchableSelects) */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-3xl my-4 border border-gray-300/50 overflow-hidden max-h-[95vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/10 via-transparent to-gray-900/10"></div>
          <div className="absolute -right-10 top-0 bottom-0 w-40 bg-gradient-to-l from-[#b52124]/20 to-transparent -skew-x-12"></div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-gray-400/30">
              <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-lg md:text-xl font-bold text-white">
                  Update Service Order
                </h2>
              </div>
              <p className="text-xs text-gray-300/80 font-medium mt-1 hidden md:flex items-center gap-1">
                Modify service order details and items
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowEditModal(false);
              resetForm();
            }}
            className="text-gray-200 hover:bg-gray-700/40 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95 relative z-10"
          >
            <X className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        <form
          className="p-4 md:p-6 overflow-y-auto flex-grow"
          onSubmit={handleSubmit}
        >
          {/* Basic Details */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[#40423f] mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#b52124]" />
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  Vendor <span className="text-[#b52124]">*</span>
                </label>
                <SearchableSelect
                  options={vendors.map((v) => ({
                    id: v.id,
                    name: v.name || v.vendor_name || v.display || "",
                  }))}
                  value={formData.vendor_id}
                  onChange={(id) => {
                    const interState =
                      vendors.find((d) => d.id === id).office_state !==
                      "MAHARASHTRA";
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

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  Project <span className="text-[#b52124]">*</span>
                </label>
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

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  PO Type <span className="text-[#b52124]">*</span>
                </label>
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
                  disabled={true}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#b52124]" />
                  PO Date <span className="text-[#b52124]">*</span>
                </label>
                <input
                  type="date"
                  value={formData.po_date}
                  onChange={(e) => {
                    setFormData({ ...formData, po_date: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none text-sm bg-white/50"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#b52124]" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none text-sm bg-white/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#40423f] mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#b52124]" />
                  Payment Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      due_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none text-sm bg-white/50"
                />
              </div>
            </div>
          </div>

          {/* Items section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-[#40423f] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#b52124]" />
                Items
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowItemSelector(true);
                  setItemSelectorSearch("");
                }}
                className="bg-gradient-to-r from-[#b52124] to-[#d43538] text-white px-3 py-2 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-xs font-medium flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            {formData.items.length === 0 ? (
              <div className="bg-gradient-to-b from-gray-50/50 to-white/50 border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center group hover:border-[#b52124]/30 transition-all duration-300">
                <div className="p-2 bg-[#b52124]/5 rounded-2xl inline-block mb-2">
                  <Package className="w-8 h-8 text-[#b52124]/60" />
                </div>
                <p className="text-xs font-semibold text-[#40423f] mb-1">
                  No items added yet
                </p>
                <p className="text-xs text-[#5a5d5a]">
                  Click "Add Item" to select materials
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-b from-gray-50/30 to-white/30 p-3 rounded-xl border border-gray-300 hover:border-gray-400 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm text-[#40423f]">
                          {item.item_name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-[#5a5d5a] rounded-full">
                            Code: {item.item_code}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-gray-100 text-[#5a5d5a] rounded-full">
                            HSN: {item.hsn_code}
                          </span>
                        </div>
                      </div>
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
                          if (result.isConfirmed && item.materialTrackingId) {
                            deletePOItems(item.id, item.materialTrackingId);
                            const items = formData.items.filter(
                              (i: any) => i.id !== item.id,
                            );
                            calculateTotals(
                              items,
                              formData.discount_percentage,
                              formData.is_interstate,
                            );
                          } else {
                            if (result.isConfirmed) {
                              const items = formData.items.filter(
                                (i: any) => i.id !== item.id,
                              );
                              calculateTotals(
                                items,
                                formData.discount_percentage,
                                formData.is_interstate,
                              );
                            }
                          }
                        }}
                        className="p-1.5 text-[#b52124] hover:bg-[#b52124]/10 rounded-xl transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div>
                        <label className="text-xs text-[#5a5d5a]">Qty</label>
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
                              parseFloat(e.target.value) || 0,
                            );
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#b52124] focus:ring-1 focus:ring-[#b52124]/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#5a5d5a]">Unit</label>
                        <div className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg bg-gray-50 text-[#40423f]">
                          {item.unit}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-[#5a5d5a]">Rate</label>
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
                              parseFloat(e.target.value) || 0,
                            );
                          }}
                          className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:border-[#b52124] focus:ring-1 focus:ring-[#b52124]/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-[#5a5d5a]">Amount</label>
                        <div className="px-2 py-1.5 text-xs font-medium border border-gray-300 rounded-lg bg-gray-50 text-[#40423f]">
                          {formatCurrency(item.amount)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-xs text-[#5a5d5a]">
                      {formData.is_interstate
                        ? `IGST: ${item.igst_rate}%`
                        : `CGST: ${item.cgst_rate}% | SGST: ${item.sgst_rate}%`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* calculation summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            <div className="col-span-2"></div>
            <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-3 rounded-xl border border-gray-300">
              <div className="flex justify-between text-xs text-[#5a5d5a] mb-1">
                <div>Subtotal</div>
                <div>{formatCurrency(formData.subtotal)}</div>
              </div>
              <div className="flex justify-between text-xs text-[#5a5d5a] mb-1">
                <div>Discount ({formData.discount_percentage}%)</div>
                <div>{formatCurrency(formData.discount_amount)}</div>
              </div>
              <div className="flex justify-between text-xs text-[#5a5d5a] mb-1">
                <div>Taxable</div>
                <div>{formatCurrency(formData.taxable_amount)}</div>
              </div>
              <div className="flex justify-between text-xs text-[#5a5d5a] mb-2">
                <div>Total GST</div>
                <div>{formatCurrency(formData.total_gst_amount)}</div>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-sm font-semibold text-[#40423f]">
                  <div>Grand Total</div>
                  <div>{formatCurrency(formData.grand_total)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div>
              {formData.terms_and_conditions.length > 0 && (
                <h3 className="text-base font-semibold text-[#40423f] mb-2 flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-[#b52124]" />
                  Terms & Conditions
                </h3>
              )}
              <div className="py-2">
                <ul className="px-4 list-decimal text-xs text-[#5a5d5a]">
                  {formData.terms_and_conditions.map((d, indx: number) => {
                    const displayTerms = d.content.filter((dtc: any) =>
                      Boolean(dtc.is_default),
                    );
                    if (displayTerms.length > 0) {
                      return (
                        <li className="mb-2" key={indx}>
                          <div>
                            {d.content.find((tcD: any) => tcD.is_default) && (
                              <h4 className="font-semibold text-sm text-[#40423f] mb-1">
                                {d.category.charAt(0).toUpperCase() +
                                  d.category.slice(1) || ""}
                              </h4>
                            )}
                          </div>
                          <ul className="ml-3 list-disc">
                            {displayTerms.map((term: any, idx: number) => {
                              return (
                                <li key={idx} className="mb-1">
                                  {term.content}
                                </li>
                              );
                            })}
                          </ul>
                        </li>
                      );
                    } else {
                      return null;
                    }
                  })}
                </ul>
              </div>
            </div>
            <button
              onClick={() => {
                setShowTermsConditions(true);
              }}
              type="button"
              className="text-xs font-medium text-[#b52124] hover:text-[#d43538] transition-colors"
            >
              + Add Terms & Conditions
            </button>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-300 sticky bottom-0 bg-gradient-to-b from-white to-gray-50/50">
            <button
              type="submit"
              disabled={formData.items.length === 0}
              className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white py-2.5 px-4 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 font-medium text-sm shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Service Order
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-[#40423f] hover:text-[#2a2c2a]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Item selector (with category + search) */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-md flex items-center justify-center z-[60] p-2 md:p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/30 w-full max-w-md border border-gray-300/50 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-4 md:px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Package className="w-4 h-4 md:w-5 md:h-5 text-gray-100" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm md:text-base">
                    Select Item
                  </h3>
                  <p className="text-xs text-gray-300/80 hidden md:block">
                    Choose from available items
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
                  placeholder={
                    selectedCategory
                      ? `Search ${selectedCategory} items...`
                      : "Search all items..."
                  }
                  value={itemSelectorSearch}
                  onChange={(e) => setItemSelectorSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-[#b52124] focus:ring-2 focus:ring-[#b52124]/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50 text-[#40423f]"
                />
              </div>
            </div>

            {/* Item List */}
            <div className="p-2 overflow-y-auto flex-grow">
              <div className="space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="p-6 text-center">
                    <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-[#40423f]">
                      No items found
                    </p>
                    <p className="text-xs text-[#5a5d5a] mt-1">
                      Try a different search term
                    </p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => addItemFromMaster(item)}
                      className="w-full p-3 text-left border border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50/50 transition-all duration-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="text-left flex-1">
                          <div className="font-medium text-sm text-[#40423f] mb-1">
                            {item.item_name}
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs text-[#5a5d5a]">
                              Code: {item.item_code}
                            </span>
                            {item.hsn_code && (
                              <span className="text-xs text-[#5a5d5a]">
                                HSN: {item.hsn_code}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-sm text-[#b52124]">
                            {formatCurrency(item.standard_rate)}
                          </p>
                          <span className="text-xs px-2 py-1 bg-[#b52124]/10 text-[#b52124] rounded-lg">
                            Add
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
            <div className="p-4 overflow-y-auto flex-grow min-h-32 max-h-96">
              <ul className="space-y-3 ">
                {formData.terms_and_conditions.map((d, indx: number) => (
                  <li
                    key={indx}
                    className="border border-gray-300 rounded-xl p-3"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="checkbox"
                        onChange={() => {
                          setFormData((prev) => ({
                            ...prev,
                            terms_and_conditions: prev.terms_and_conditions.map(
                              (tc) =>
                                tc.category === d.category
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
                          }));
                        }}
                        checked={
                          d.isActive ||
                          d.content.filter((ftc: any) => ftc.is_default)
                            .length === d.content.length
                        }
                        className="w-4 h-4 accent-[#b52124] cursor-pointer mt-0.5"
                      />
                      <h4 className="font-semibold text-sm text-[#40423f]">
                        {d.category.charAt(0).toUpperCase() +
                          d.category.slice(1) || ""}
                      </h4>
                    </div>
                    <ul className="ml-6 space-y-1">
                      {d.content.map((term: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={term.is_default}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                terms_and_conditions:
                                  prev.terms_and_conditions.map((tc) =>
                                    tc.category === d.category
                                      ? {
                                          ...tc,
                                          content: tc.content.map((i: any) =>
                                            i.content === term.content
                                              ? {
                                                  ...i,
                                                  is_default: !i.is_default,
                                                }
                                              : i,
                                          ),
                                        }
                                      : tc,
                                  ),
                              }));
                            }}
                            className="w-3.5 h-3.5 accent-[#b52124] cursor-pointer mt-0.5"
                          />
                          <span className="text-xs text-[#5a5d5a]">
                            {term.content}
                          </span>
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
                  value={extraTermData.category}
                  onChange={(e) =>
                    setExtraTermData({
                      ...extraTermData,
                      category: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#b52124]/20 focus:border-[#b52124] outline-none bg-white/50"
                  required
                >
                  <option value="">Select Category</option>
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
                <label className="block text-xs font-medium text-[#40423f] mb-1">
                  Terms & Condition <span className="text-[#b52124]">*</span>
                </label>
                <textarea
                  value={extraTermData.content}
                  onChange={(e) => {
                    setExtraTermData({
                      ...extraTermData,
                      content: e.target.value,
                    });
                  }}
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
                    if (
                      extraTermData.category.length === 0 ||
                      extraTermData.content.length === 0
                    ) {
                      toast.error("All input fields required.");
                      return;
                    }
                    console.log("T&C", formData.terms_and_conditions);

                    const correntTerms = formData.terms_and_conditions;
                    const categoryIndex = correntTerms.findIndex(
                      (t: any) => t.category === extraTermData.category,
                    );

                    if (categoryIndex !== -1) {
                      // Category exists → add term
                      correntTerms[categoryIndex].content.push({
                        category: extraTermData.category,
                        content: extraTermData.content,
                        is_default: true,
                      });
                    } else {
                      // Category does not exist → create it
                      correntTerms.push({
                        category: extraTermData.category,
                        content: [
                          {
                            category: extraTermData.category,
                            content: extraTermData.content,
                            is_default: true,
                          },
                        ],
                      });
                    }

                    setFormData({
                      ...formData,
                      terms_and_conditions: correntTerms,
                    });

                    // setFormData((prev) => ({
                    //   ...prev,
                    //   terms_and_conditions: prev.terms_and_conditions.map(
                    //     (tc: any) => {
                    //       if (tc.category === extraTermData.category) {
                    //         return {
                    //           ...tc,
                    //           content: [
                    //             ...tc.content,
                    //             {
                    //               category: extraTermData.category,
                    //               content: extraTermData.content,
                    //               is_default: true,
                    //             },
                    //           ],
                    //         };
                    //       } else {
                    //         return tc;
                    //       }
                    //     },
                    //   ),
                    // }));
                    setExtraTermData({
                      category: "",
                      content: "",
                      is_default: false,
                    });
                    setShowAddTerm(false);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white px-4 py-2.5 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Add
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
