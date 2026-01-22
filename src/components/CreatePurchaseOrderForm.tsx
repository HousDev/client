/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PurchaseOrdersPro.tsx
import React, { useEffect, useState, useRef, SetStateAction } from "react";
import { Plus, X, Trash2, Package, Save, FileText, Info, Box, Building2, Calculator, Calendar, CreditCard, Tag, Truck, User, Search, ChevronDown, ClipboardCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import poApi from "../lib/poApi";
import poTypeApi from "../lib/poTypeApi";
import TermsConditionsApi from "../lib/termsConditionsApi";
import { toast } from "sonner";
import classifiedPaymentTerms from "../data/paymentTerms";

/* --- types (updated to include individual GST rates) --- */
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
  igst_rate: number; // Individual IGST rate
  cgst_rate: number; // Individual CGST rate
  sgst_rate: number; // Individual SGST rate
  gst_amount: number; // Total GST amount for the item
}

interface POFormData {
  po_number: string;
  vendor_id: string;
  project_id: string;
  po_type_id: string;
  po_date: string;
  delivery_date: string;
  due_date: string;
  is_interstate: boolean;
  items: POItem[];
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
type addTermType = { category: string; content: string; is_default: boolean };

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

export default function CreatePurchaseOrderForm({
  setShowCreatePro,
  loadAllData,
}: {
  setShowCreatePro: React.Dispatch<SetStateAction<boolean>>;
  loadAllData: () => void;
}): JSX.Element {
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
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [showTermsConditions, setShowTermsConditions] = useState(false);
  const [newTermsAndCondition, setNewTermsAndConditions] = useState("");
  const [showAddPaymentTerm, setShowAddPaymentTerm] = useState<Boolean>(false);
  const [selectedPaymentTermId, setSelectedPaymentTermId] = useState<any>("");
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<any>("");
  const [poPaymentTerms, setPoPaymentTerms] = useState<any[]>([]);
  const [showTermDropdown, setShowTermDropdown] = useState(false);

  const [selectedPaymentTermData, setSelectedPaymentTermData] =
    useState<any>("");

  const [showAddTerm, setShowAddTerm] = useState<boolean>(false);
  const [extraTerms, setExtraTerms] = useState<addTermType[]>([]);
  const [extraTermData, setExtraTermData] = useState<addTermType>({
    category: "",
    content: "",
    is_default: false,
  });

  // item selector internal search
  const [itemSelectorSearch, setItemSelectorSearch] = useState("");

  const [formData, setFormData] = useState<POFormData>({
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
    terms_and_conditions: "",
    notes: "",
  });

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
    } catch (err: any) {
      toast.error("loadProjects failed, fallback to empty", err);
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
      setItems(
        Array.isArray(data)
          ? data.filter((d: any) => d.category === "material")
          : [],
      );
    } catch (err) {
      console.warn("loadItems failed, fallback to empty", err);
      setItems([]);
    }
  };

  const loadTerms = async (id: any) => {
    try {
      let data: any = await TermsConditionsApi.getByIdVendorTC(id);
      data = data.filter((d: any) => d.is_active);
      console.log("terms response ", data);
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
          acc[key].isActive = false;

          return acc;
        }, {}),
      );
      console.log(result);

      setTerms(Array.isArray(result) ? result : []);
    } catch (err) {
      console.warn("loadTerms failed, fallback to empty", err);
      setTerms([]);
    }
  };

  const loadPaymentTerms = async () => {
    try {
      const data = await poApi.getPaymentTerms();
      setPaymentTerms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadPaymentTerms failed, fallback to empty", err);
      setPaymentTerms([]);
    }
  };

  // --- Items helpers (updated for individual GST rates) ---
  const addItemFromMaster = (item: any) => {
    const existingIndex = formData.items.findIndex(
      (i) => i.item_id === item.id,
    );

    let updatedItems: POItem[];

    if (existingIndex !== -1) {
      // 🔁 Item already exists → increase quantity
      updatedItems = formData.items.map((i, index) => {
        if (index === existingIndex) {
          const newQty = i.quantity + 1;
          const amount = newQty * i.rate;

          // Calculate GST based on interstate status
          let gstAmount = 0;
          if (formData.is_interstate) {
            gstAmount = (amount * (item.igst_rate || 0)) / 100;
          } else {
            gstAmount =
              (amount * ((item.cgst_rate || 0) + (item.sgst_rate || 0))) / 100;
          }

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
      // ➕ New item
      const newItem: POItem = {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2, 9),

        item_id: item.id,
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
        // Calculate initial GST amount based on interstate status
        gst_amount: formData.is_interstate
          ? ((item.standard_rate || 0) * (item.igst_rate || 0)) / 100
          : ((item.standard_rate || 0) *
              ((item.cgst_rate || 0) + (item.sgst_rate || 0))) /
            100,
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
    setItemSelectorSearch("");
  };

  const handleItemChange = (index: number, field: keyof POItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === "quantity" || field === "rate") {
      const item = newItems[index];
      const amount = item.quantity * item.rate;

      // Recalculate GST amount when quantity or rate changes
      let gstAmount = 0;
      if (formData.is_interstate) {
        gstAmount = (amount * (parseFloat(String(item.igst_rate)) || 0)) / 100;
      } else {
        gstAmount =
          (amount *
            ((parseFloat(String(item.cgst_rate)) || 0) +
              (parseFloat(String(item.sgst_rate)) || 0))) /
          100;
      }
      newItems[index].amount = amount;
      newItems[index].gst_amount = gstAmount;
    }

    setFormData({ ...formData, items: newItems });
    calculateTotals(
      newItems,
      formData.discount_percentage,
      formData.is_interstate,
    );
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(
      newItems,
      formData.discount_percentage,
      formData.is_interstate,
    );
  };

  const calculateTotals = (
    itemsList: POItem[],
    discountPercentage: number,
    isInterstate: boolean,
  ) => {
    const subtotal = itemsList.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const discountAmount = (subtotal * (discountPercentage || 0)) / 100;
    const taxableAmount = subtotal - discountAmount;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    // Calculate GST amounts for each item
    itemsList.forEach((item) => {
      // Apply discount proportionally to item amount
      const itemTaxableRatio = discountAmount > 0 ? item.amount / subtotal : 1;
      const itemDiscount = discountAmount * itemTaxableRatio;
      const itemTaxableAmount = item.amount - itemDiscount;

      if (isInterstate) {
        const itemIgstAmount =
          (itemTaxableAmount * (item.igst_rate || 0)) / 100;
        igstAmount += itemIgstAmount;
      } else {
        const itemCgstAmount =
          (itemTaxableAmount * (item.cgst_rate || 0)) / 100;
        const itemSgstAmount =
          (itemTaxableAmount * (item.sgst_rate || 0)) / 100;
        cgstAmount += itemCgstAmount;
        sgstAmount += itemSgstAmount;
      }
    });

    const totalGstAmount = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = taxableAmount + totalGstAmount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
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
    calculateTotals(formData.items, percentage, formData.is_interstate);
  };

  const handleInterstateChange = (isInterstate: boolean) => {
    // When interstate status changes, we need to recalculate GST for all items
    const updatedItems = formData.items.map((item) => {
      let gstAmount = 0;
      if (isInterstate) {
        gstAmount = (item.amount * (item.igst_rate || 0)) / 100;
      } else {
        gstAmount =
          (item.amount * ((item.cgst_rate || 0) + (item.sgst_rate || 0))) / 100;
      }
      return { ...item, gst_amount: gstAmount };
    });

    setFormData({
      ...formData,
      is_interstate: isInterstate,
      items: updatedItems,
    });
    calculateTotals(updatedItems, formData.discount_percentage, isInterstate);
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
      (pt) => pt.id === paymentTermsId,
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
  const getSelectedPOTypeCategory = (): string | null => {
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

  // server-side sequence with fallback
  const generatePONumber = async () => {
    try {
      const res: any = await poApi.nextSequence();
      if (res && res.po_number) {
        return res.po_number;
      }
    } catch (err) {
      console.warn(
        "generatePONumber remote failed, falling back to client seq",
        err,
      );
    }
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const seq = Math.floor(Math.random() * 9000) + 1;

    return `PO/${year}/${String(month).padStart(2, "0")}/${String(seq).padStart(
      4,
      "0",
    )}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const poNumber = await generatePONumber();

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

      terms.forEach((tc) => {
        tc.content.forEach((cont: any) => {
          if (cont.is_default) {
            selected_terms_idsData.push(cont.term_id);
          }
        });
      });
      extraTerms.forEach((tc: any) => {
        if (tc.is_default) {
          terms_and_conditionsData.push(tc);
        }
      });

      const payload = {
        po_number: poNumber,
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

      console.log(payload);

      const created: any = await poApi.createPO(payload);

      if (created && created.id && formData.items.length) {
        const trackingRecords = formData.items.map((item) => ({
          po_id: created.id,
          item_id: item.item_id,
          item_description: item.item_name,
          quantity_ordered: item.quantity,
          quantity_received: 0,
          quantity_pending: item.quantity,
          status: "pending",
        }));
        try {
          await poApi.createTracking(trackingRecords);
        } catch (err) {
          console.warn("tracking creation failed", err);
        }

        if (formData.advance_amount > 0) {
          try {
            await poApi.createPayment({
              po_id: created.id,
              payment_type: "advance",
              amount: formData.advance_amount,
              due_date: formData.po_date,
              status: "pending",
              created_by: user?.id,
            });
          } catch (err) {
            console.warn("advance payment creation failed", err);
          }
        }
      }

      toast.success("Purchase Order created successfully!");
      setShowCreatePro(false);
      resetForm();
      loadAllData();
    } catch (err) {
      console.error("Error creating PO:", err);
      toast.error("Error creating purchase order");
    }
  };

  const resetForm = () => {
    setFormData({
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
  const selectedCategory = getSelectedPOTypeCategory(); // 'material' | 'service' | null
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

  useEffect(() => {
    console.log(selectedPaymentTermData);
  }, [selectedPaymentTermData]);

  return (
    <div className="p-6">
      {/* Create Modal (with SearchableSelects) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
          {/* Header */}
<div className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
  px-6 py-4 flex justify-between items-center
  rounded-t-2xl border-b border-white/10
  backdrop-blur-md"
>
  <div className="flex items-center gap-3">
    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
      <Package className="w-5 h-5 text-white" />
    </div>

    <div>
      <h2 className="text-lg font-bold text-white leading-tight">
        Create Purchase Order
      </h2>
      <p className="text-xs text-white/80 mt-0.5">
        Manage and create purchase orders
      </p>
    </div>
  </div>

  <button
    onClick={() => {
      setShowCreatePro(false);
      setPoPaymentTerms([]);
      resetForm();
    }}
    className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
  >
    <X className="w-5 h-5" />
  </button>
</div>


         <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
  {/* Header Section */}
 

  {/* Basic Details - 3 Column Grid (UNCHANGED STRUCTURE) */}
  <div className="mb-6">
    <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Info className="w-4 h-4 text-blue-600" />
      Basic Information
    </h4>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Vendor Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <User className="w-3 h-3 text-blue-600" />
          <span>Vendor</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors">
            <User className="w-3.5 h-3.5" />
          </div>
          <SearchableSelect
            options={vendors.map((v) => ({
              id: v.id,
              name: v.name || v.vendor_name || v.display || "",
            }))}
            value={formData.vendor_id}
            onChange={(id) => {
              loadTerms(id);
              const interState =
                vendors.find((d) => d.id === id).office_state !== "Maharashtra";
              setFormData({
                ...formData,
                vendor_id: id,
                is_interstate: interState,
              });
            }}
            placeholder="Select Vendor"
            required
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all duration-200 hover:border-gray-400"
            dropdownClassName="text-sm"
          />
        </div>
      </div>

      {/* Project Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Building2 className="w-3 h-3 text-green-600" />
          <span>Project</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-600 transition-colors">
            <Building2 className="w-3.5 h-3.5" />
          </div>
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
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-600/20 outline-none transition-all duration-200 hover:border-gray-400"
            dropdownClassName="text-sm"
          />
        </div>
      </div>

      {/* PO Type Selection */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-purple-600" />
          <span>PO Type</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <SearchableSelect
            options={poTypes.map((t: any) => ({
              id: t.id,
              name: t.name,
            }))}
            value={formData.po_type_id}
            onChange={(id) => handlePOTypeChange(id)}
            placeholder={poTypesLoading ? "Loading types..." : "Select Type"}
            required
            disabled={poTypesLoading}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-200 hover:border-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            dropdownClassName="text-sm"
          />
        </div>
      </div>

      {/* PO Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-amber-600" />
          <span>PO Date</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <input
            type="date"
            value={formData.po_date}
            onChange={(e) =>
              setFormData({ ...formData, po_date: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
            required
          />
        </div>
      </div>

      {/* Delivery Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <Truck className="w-3 h-3 text-indigo-600" />
          <span>Delivery Date</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-600 transition-colors">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <input
            type="date"
            value={formData.delivery_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                delivery_date: e.target.value,
              })
            }
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all duration-200 hover:border-gray-400"
          />
        </div>
      </div>

      {/* Payment Due Date */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
          <CreditCard className="w-3 h-3 text-red-600" />
          <span>Payment Due Date</span>
          <span className="text-red-500">*</span>
        </label>
        <div className="relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-red-600 transition-colors">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) =>
              setFormData({
                ...formData,
                due_date: e.target.value,
              })
            }
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-red-600 focus:ring-2 focus:ring-red-600/20 outline-none transition-all duration-200 hover:border-gray-400"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Items Section - COMPACT */}
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-100 rounded-lg">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <h4 className="text-sm font-semibold text-gray-800">Items</h4>
        {formData.items.length > 0 && (
          <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
            {formData.items.length} items
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          if (formData.vendor_id === "") {
            toast.warning("Select Vendor First.");
            return;
          }
          setShowItemSelector(true);
          setItemSelectorSearch("");
        }}
        className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 text-sm font-medium flex items-center gap-2 group w-full sm:w-auto justify-center"
      >
        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
        Add Item from Master
      </button>
    </div>

    {formData.items.length === 0 ? (
      <div className="bg-gradient-to-b from-gray-50/50 to-white/50 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center group hover:border-blue-300 transition-all duration-300">
        <div className="p-3 bg-blue-50 rounded-xl inline-block mb-3">
          <Package className="w-8 h-8 text-blue-400" />
        </div>
        <p className="text-sm font-semibold text-gray-700 mb-1">
          No items added yet
        </p>
        <p className="text-xs text-gray-500">
          Click "Add Item from Master" to start
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
              {/* Item Details - 3 columns */}
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

              {/* Quantity - 2 columns */}
              <div className="col-span-3 md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">Qty</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.quantity}
                    onChange={(e) => {
                      if (
                        !/^\d*\.?\d*$/.test(e.target.value) ||
                        Number(e.target.value) < 0
                      )
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

              {/* Unit - 1 column */}
              <div className="col-span-2 md:col-span-1">
                <label className="text-xs text-gray-600 mb-1 block">Unit</label>
                <p className="text-sm text-gray-700">{item.unit}</p>
              </div>

              {/* Rate - 2 columns */}
              <div className="col-span-3 md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">Rate</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">₹</span>
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
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:border-green-600 focus:ring-1 focus:ring-green-600/20 outline-none transition-all duration-200 hover:border-gray-400 text-gray-800"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Amount - 1 column */}
              <div className="col-span-3 md:col-span-2">
                <label className="text-xs text-gray-600 mb-1 block">Amount</label>
                <div>
                  <p className="font-semibold text-sm text-gray-800">
                    {formatCurrency(item.amount)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formData.is_interstate ? (
                      <>IGST: {item.igst_rate}%</>
                    ) : (
                      <>
                        CGST: {item.cgst_rate}% | SGST: {item.sgst_rate}%
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Delete Button - 1 column */}
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

  {/* Rest of your form remains the same... */}
  {/* Calculation Summary */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
    <div className="col-span-2"></div>
    <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Subtotal</span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(formData.subtotal)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-600">
            Discount ({formData.discount_percentage}%)
          </span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(formData.discount_amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Taxable</span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(formData.taxable_amount)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600">Total GST</span>
          <span className="text-sm font-medium text-gray-800">
            {formatCurrency(formData.total_gst_amount)}
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-300">
          <span className="text-sm font-semibold text-gray-800">Grand Total</span>
          <span className="text-lg font-bold text-blue-700">
            {formatCurrency(formData.grand_total)}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Terms & Conditions */}
  <div className="pb-6">
    {poPaymentTerms.length > 0 && (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-green-100 rounded-lg">
            <CreditCard className="w-4 h-4 text-green-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-800">Payment Terms</h4>
        </div>
        <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300">
          <ul className="space-y-2">
            {poPaymentTerms.map((d, indx: number) => (
              <li key={indx} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                <p className="text-xs text-gray-700 flex-1">
                  {d.content
                    .replace("${percent}", d.percent)
                    .replace("${materialPercent}", d.materialPercent)
                    .replace("${days}", d.days)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )}

    {(extraTerms.length > 0 || terms.find((d) => d.content.find((dd: any) => dd.is_default))) && (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-amber-100 rounded-lg">
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <h4 className="text-sm font-semibold text-gray-800">Terms & Conditions</h4>
        </div>
        <div className="bg-gradient-to-b from-gray-50/30 to-white/30 p-4 rounded-xl border border-gray-300">
          <div className="space-y-4">
            {terms.map((d, indx: number) => {
              const extraTCData = extraTerms.filter(
                (ed: any) => ed.category === d.category && ed.is_default,
              ) || [];
              if (
                d.content.find((d: any) => d.is_default) ||
                extraTCData.length > 0
              ) {
                return (
                  <div key={indx} className="space-y-2">
                    <h5 className="text-xs font-semibold text-gray-700">
                      {d.category.charAt(0).toUpperCase() + d.category.slice(1)}
                    </h5>
                    <ul className="space-y-1.5 ml-3">
                      {d.content.map((term: any, idx: number) => (
                        term.is_default && (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 flex-shrink-0"></div>
                            <p className="text-xs text-gray-700 flex-1">{term.content}</p>
                          </li>
                        )
                      ))}
                      {extraTCData.map((etc: any) => (
                        etc.is_default && (
                          <li key={etc.content} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1 flex-shrink-0"></div>
                            <p className="text-xs text-gray-700 flex-1">{etc.content}</p>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    )}

    {/* Add Terms Buttons */}
    <div className="flex flex-wrap gap-2 pt-3">
      <button
        onClick={() => {
          if (formData.vendor_id) setShowAddPaymentTerm(true);
          else toast.warning("Select Vendor.");
        }}
        type="button"
        className="text-xs font-medium text-blue-700 hover:text-blue-800 px-3 py-2 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
      >
        <Plus className="w-3 h-3" />
        Add Payment Terms & Conditions
      </button>
      <button
        onClick={() => {
          if (formData.vendor_id) setShowTermsConditions(true);
          else toast.warning("Select Vendor.");
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
      Create Purchase Order
    </button>
    <button
      type="button"
      onClick={() => {
        setShowCreatePro(false);
        setPoPaymentTerms([]);
        resetForm();
      }}
      className="px-6 py-3 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700"
    >
      Cancel
    </button>
  </div>
</form>

{/* Custom scrollbar styles */}
<style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
`}</style>

{/* Custom scrollbar styles */}
<style >{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #3b82f6;
    border-radius: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
`}</style>
        </div>
      </div>

      {/* Item selector (with category + search) */}
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
            <h3 className="font-bold text-white text-sm md:text-base">Select Items</h3>
            <p className="text-xs text-gray-300/80 hidden md:block">Choose from inventory</p>
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
        {selectedCategory && (
          <div className="mt-2 text-xs text-[#5a5d5a]">
            Filtering by: <span className="font-medium capitalize text-[#b52124]">{selectedCategory}</span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="p-2 overflow-y-auto flex-grow">
        <div className="space-y-2">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-[#40423f]">
                No items found
              </p>
              <p className="text-xs text-[#5a5d5a] mt-1">
                {selectedCategory 
                  ? `No ${selectedCategory} items match your search`
                  : "Try a different search term"}
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const existingMaterial = formData.items.find(
                (i: any) => Number(i.item_id) === item.id
              );
              
              const isMaterial = String(item.category).toLowerCase() === "material";
              
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => addItemFromMaster(item)}
                  className={`w-full p-3 text-left border rounded-xl transition-all duration-200 ${
                    existingMaterial
                      ? "border-[#b52124]/30 bg-[#b52124]/5"
                      : "border-gray-300 hover:border-gray-400 hover:bg-gray-50/50"
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    {/* Left Side - Item Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                          isMaterial ? "bg-blue-100" : "bg-green-100"
                        }`}>
                          <Package className={`w-3.5 h-3.5 ${
                            isMaterial ? "text-blue-600" : "text-green-600"
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2">
                            <p className="font-medium text-sm text-[#40423f] truncate">
                              {item.item_name}
                            </p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isMaterial 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-green-100 text-green-700"
                            }`}>
                              {String(item.category || "UNKNOWN").toUpperCase()}
                            </span>
                          </div>
                          
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
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="text-xs text-[#5a5d5a]">
                              <span className="font-medium">Rate:</span> {formatCurrency(item.standard_rate)}
                            </div>
                            <div className="text-xs text-[#5a5d5a]">
                              <span className="font-medium">Unit:</span> {item.unit}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Action & Tax Info */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        existingMaterial
                          ? "bg-[#b52124] text-white"
                          : "bg-[#b52124]/10 text-[#b52124]"
                      }`}>
                        {existingMaterial ? "Add More" : "Add"}
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-[#5a5d5a]">
                          {formData.is_interstate ? (
                            <span className="font-medium">IGST: {item.igst_rate ?? 0}%</span>
                          ) : (
                            <>
                              <span className="font-medium">CGST: {item.cgst_rate ?? 0}%</span>
                              <span className="mx-1">•</span>
                              <span className="font-medium">SGST: {item.sgst_rate ?? 0}%</span>
                            </>
                          )}
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
      {/* {showTermsConditions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Add Terms & Conditions
              </h2>
              <div className="flex">
                <button
                  onClick={() => setShowAddTerm(true)}
                  className="text-white bg-green-600 hover:bg-green-700 rounded-lg px-3 font-semibold py-1 flex items-center mr-3 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
                <button
                  onClick={() => setShowTermsConditions(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="py-6 ">
              <ul className="px-6">
                {terms.map((d, indx: number) => {
                  const extraTCData =
                    extraTerms.filter(
                      (ed: any) => ed.category === d.category,
                    ) || [];
                  return (
                    <li className="mb-3" key={indx}>
                      <div>
                        <h1 className="font-semibold">
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

                              setExtraTerms((prev) =>
                                prev.map((tc) =>
                                  tc.category === d.category
                                    ? {
                                        ...tc,
                                        is_default: !d.isActive,
                                      }
                                    : tc,
                                ),
                              );
                            }}
                            checked={
                              d.isActive ||
                              d.content.filter((ftc: any) => ftc.is_default)
                                .length === d.content.length
                            }
                            className="w-4 h-4 accent-blue-600 cursor-pointer mr-1"
                          />{" "}
                          {d.category.charAt(0).toUpperCase() +
                            d.category.slice(1) || ""}
                        </h1>
                      </div>
                      <ul className=" ml-3">
                        {d.content.map((term: any, idx: number) => {
                          return (
                            <li key={idx}>
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
                                                ? {
                                                    ...i,
                                                    is_default: !i.is_default,
                                                  }
                                                : i,
                                            ),
                                          }
                                        : tc,
                                    ),
                                  );
                                }}
                                className="w-4 h-4 accent-blue-600 cursor-pointer mr-1"
                              />{" "}
                              {term.content}
                            </li>
                          );
                        })}
                        {extraTCData.map((etc: any) => {
                          return (
                            <li key={etc.content}>
                              <input
                                type="checkbox"
                                checked={etc.is_default}
                                onChange={() => {
                                  setExtraTerms((prev) =>
                                    prev.map((etci) =>
                                      etci.content === etc.content
                                        ? {
                                            ...etci,
                                            is_default: !etci.is_default, // ✅ TOGGLE
                                          }
                                        : etci,
                                    ),
                                  );
                                }}
                                className="w-4 h-4 accent-blue-600 cursor-pointer mr-1"
                              />{" "}
                              {etc.content}
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )} */}

      {showAddPaymentTerm && (
  <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm flex items-center justify-center z-[70] p-2 md:p-4">
    <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-300/30 overflow-hidden max-h-[95vh] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#1a1c1a] via-[#2a2c2a] to-[#3a3d3a] px-5 md:px-7 py-5 flex justify-between items-center border-b border-gray-700/20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#b52124] to-[#d43538] blur-lg opacity-40 rounded-full"></div>
            <div className="relative p-3 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-lg">
              <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-lg md:text-xl bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Add Payment Terms
            </h3>
            <p className="text-xs text-gray-300/70 mt-1 flex items-center gap-2">
              <span className="w-1 h-1 bg-gradient-to-r from-[#b52124] to-[#d43538] rounded-full"></span>
              Configure payment schedule and conditions
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setSelectedPaymentTerm("");
            setSelectedPaymentTermData("");
            setSelectedPaymentTermId("");
            setShowAddPaymentTerm(false);
          }}
          className="group relative p-2.5 hover:bg-gray-700/30 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:via-red-500/5 group-hover:to-red-500/0 rounded-xl transition-all duration-300"></div>
          <X className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="relative flex-grow overflow-y-auto">
        <div className="relative p-5 md:p-7 space-y-6">
          {/* Category Selection */}
          <div className="group">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-[#2a2c2a]">
                Payment Term Category
              </label>
              <span className="text-xs px-2.5 py-1 bg-gradient-to-r from-[#b52124]/10 to-[#d43538]/10 text-[#b52124] rounded-full font-medium">
                Required
              </span>
            </div>
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#b52124]/20 to-transparent rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <select
                value={selectedPaymentTermId}
                onChange={(e) => {
                  setSelectedPaymentTermData("");
                  setSelectedPaymentTermId(e.target.value);
                }}
                className="relative w-full px-4 py-3.5 text-sm border-2 border-gray-300/80 rounded-xl focus:border-[#b52124] focus:ring-4 focus:ring-[#b52124]/15 outline-none transition-all duration-300 hover:border-gray-400 bg-white/80 backdrop-blur-sm text-[#2a2c2a] font-medium appearance-none cursor-pointer"
                required
              >
                <option value={""} className="text-gray-400">Select Category</option>
                {classifiedPaymentTerms.map((d: any) => (
                  <option
                    key={d.category}
                    value={d.category}
                    className="py-2 hover:bg-[#b52124]/5 transition-colors"
                  >
                    {d.category.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Custom Payment Term Select */}
          {selectedPaymentTermId && (
            <div className="animate-fade-up">
              <label className="block text-sm font-semibold text-[#2a2c2a] mb-3">
                Select Payment Term
              </label>
              
              <div className="relative">
                {/* Selected Value Button */}
                <button
                  type="button"
                  className="group w-full text-left px-4 py-3.5 border-2 border-gray-300/80 rounded-xl bg-white/80 backdrop-blur-sm hover:border-gray-400 focus:ring-4 focus:ring-[#b52124]/15 focus:border-[#b52124] transition-all duration-300 flex items-center justify-between"
                  onClick={() => setShowTermDropdown((prev) => !prev)}
                >
                  <span className={`font-medium ${selectedPaymentTermData?.displayContent ? 'text-[#2a2c2a]' : 'text-gray-400'}`}>
                    {selectedPaymentTermData?.displayContent || "Choose payment term"}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedPaymentTermData?.displayContent && (
                      <div className="w-2 h-2 bg-gradient-to-r from-[#b52124] to-[#d43538] rounded-full animate-pulse"></div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${showTermDropdown ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Dropdown */}
                {showTermDropdown && (
                  <div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto bg-white/95 backdrop-blur-xl border border-gray-300/50 rounded-xl shadow-2xl shadow-gray-900/10 animate-scale-in">
                    <div className="p-2">
                      <div
                        onClick={() => {
                          setSelectedPaymentTermData("");
                          setShowTermDropdown(false);
                        }}
                        className="px-4 py-3 text-sm text-gray-600 hover:text-[#b52124] cursor-pointer hover:bg-gradient-to-r hover:from-[#b52124]/5 hover:to-transparent rounded-lg transition-all duration-200 flex items-center gap-3 group"
                      >
                        <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-[#b52124]"></div>
                        Select Payment Term
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-gray-300/50 to-transparent my-2"></div>
                      
                      {classifiedPaymentTerms
                        .find((d: any) => d.category === selectedPaymentTermId)
                        ?.details.filter(
                          (dtc: any) =>
                            !(
                              dtc.id === 1 &&
                              poPaymentTerms.some((dttc: any) => dttc.id === 1)
                            ) ||
                            !(
                              dtc.id === 2 &&
                              poPaymentTerms.some((dttc: any) => dttc.id === 2)
                            ),
                        )
                        .map((t: any, index: number) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setSelectedPaymentTermData(t);
                              setShowTermDropdown(false);
                            }}
                            className="px-4 py-3 text-sm text-[#2a2c2a] cursor-pointer hover:bg-gradient-to-r hover:from-[#b52124]/5 hover:to-transparent rounded-lg transition-all duration-200 group border-b border-gray-100 last:border-b-0 animate-fade-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium group-hover:text-[#b52124] transition-colors">
                                {t.displayContent}
                              </span>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#b52124] to-[#d43538]"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Form Sections with all original logic */}
          {selectedPaymentTermData.id === 1 && (
            <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white border border-blue-200/50 rounded-xl animate-fade-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h4 className="font-semibold text-blue-900">Advance Payment Configuration</h4>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white/50 rounded-lg border border-blue-100">
                <div className="relative">
                  <input
                    type="text"
                    value={selectedPaymentTermData.percent}
                    onChange={(e) => {
                      const totalPercent = poPaymentTerms.reduce(
                        (acc, term) => acc + Number(term.percent),
                        0,
                      );
                      if (totalPercent + Number(e.target.value) > 100) {
                        toast.error(
                          "You have already entered payment percent of " +
                            totalPercent +
                            "% You can not exceed 100%",
                        );
                        return;
                      }
                      setSelectedPaymentTermData((prev: any) => ({
                        ...prev,
                        percent: Number(e.target.value),
                      }));
                    }}
                    className="w-20 px-3 py-2 text-center border-2 border-blue-300 rounded-lg focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-bold text-blue-900 bg-white shadow-inner"
                  />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    %
                  </div>
                </div>
                <span className="text-blue-900 font-medium">
                  % advance payment payable after order confirmation.
                </span>
              </div>
            </div>
          )}

          {selectedPaymentTermData.id === 2 && (
            <div className="p-5 bg-gradient-to-br from-green-50/50 to-white border border-green-200/50 rounded-xl animate-fade-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-semibold text-green-900">Dispatch Payment Configuration</h4>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white/50 rounded-lg border border-green-100">
                <div className="relative">
                  <input
                    type="text"
                    value={selectedPaymentTermData.percent}
                    onChange={(e) => {
                      const totalPercent = poPaymentTerms.reduce(
                        (acc, term) => acc + Number(term.percent),
                        0,
                      );
                      if (totalPercent + Number(e.target.value) > 100) {
                        toast.error(
                          "You have already entered payment percent of " +
                            totalPercent +
                            "% You can not exceed 100%",
                        );
                        return;
                      }
                      setSelectedPaymentTermData((prev: any) => ({
                        ...prev,
                        percent: Number(e.target.value),
                      }));
                    }}
                    className="w-20 px-3 py-2 text-center border-2 border-green-300 rounded-lg focus:ring-4 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-green-900 bg-white shadow-inner"
                  />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                    %
                  </div>
                </div>
                <span className="text-green-900 font-medium">
                  % payment before dispatch of material.
                </span>
              </div>
            </div>
          )}

          {selectedPaymentTermData.id === 3 && (
            <div className="p-5 bg-gradient-to-br from-purple-50/50 to-white border border-purple-200/50 rounded-xl animate-fade-up">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-purple-900">Receiving Payment Configuration</h4>
              </div>
              
              <div className="space-y-4 p-4 bg-white/50 rounded-lg border border-purple-100">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedPaymentTermData.percent}
                      onChange={(e) => {
                        const totalPercent = poPaymentTerms.reduce(
                          (acc, term) => acc + Number(term.percent),
                          0,
                        );
                        if (totalPercent + Number(e.target.value) > 100) {
                          toast.error(
                            "You have already entered payment percent of " +
                              totalPercent +
                              "% You can not exceed 100%",
                          );
                          return;
                        }
                        setSelectedPaymentTermData((prev: any) => ({
                          ...prev,
                          percent: Number(e.target.value),
                        }));
                      }}
                      className="w-20 px-3 py-2 text-center border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-purple-900 bg-white shadow-inner"
                    />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      Payment %
                    </div>
                  </div>
                  <span className="text-purple-900 font-medium">
                    % payment after receiving
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedPaymentTermData.materialPercent}
                      onChange={(e) => {
                        const totalMaterialPercent = poPaymentTerms.reduce(
                          (acc, term) => acc + Number(term.materialPercent),
                          0,
                        );

                        if (
                          totalMaterialPercent + Number(e.target.value) >
                          100
                        ) {
                          toast.error(
                            "You have already entered material percent of " +
                              totalMaterialPercent +
                              "% You can not exceed 100%",
                          );
                          return;
                        }
                        setSelectedPaymentTermData((prev: any) => ({
                          ...prev,
                          materialPercent: Number(e.target.value),
                        }));
                      }}
                      className="w-20 px-3 py-2 text-center border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-purple-900 bg-white shadow-inner"
                    />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      Material %
                    </div>
                  </div>
                  <span className="text-purple-900 font-medium">
                    % material within
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      value={selectedPaymentTermData.days}
                      onChange={(e) =>
                        setSelectedPaymentTermData((prev: any) => ({
                          ...prev,
                          days: e.target.value,
                        }))
                      }
                      className="w-20 px-3 py-2 text-center border-2 border-purple-300 rounded-lg focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-bold text-purple-900 bg-white shadow-inner"
                    />
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap">
                      Days
                    </div>
                  </div>
                  <span className="text-purple-900 font-medium">days.</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - All original logic preserved */}
          <div className="pt-6 border-t border-gray-200/50">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                disabled={!selectedPaymentTermData}
                onClick={() => {
                  if (!selectedPaymentTermData) {
                    toast.error("Fill correct data.");
                    return;
                  }

                  const totalPercent = poPaymentTerms.reduce(
                    (acc, term) => acc + Number(term.percent),
                    0,
                  );
                  const totalMaterialPercent = poPaymentTerms.reduce(
                    (acc, term) => acc + Number(term.materialPercent),
                    0,
                  );

                  if (
                    totalMaterialPercent +
                      Number(selectedPaymentTermData.materialPercent) >
                    100
                  ) {
                    toast.error(
                      "You have already entered material percent of " +
                        totalMaterialPercent +
                        "% You can not exceed 100%",
                    );
                    return;
                  }
                  if (
                    totalPercent + Number(selectedPaymentTermData.percent) >
                    100
                  ) {
                    toast.error(
                      "You have already entered payment percent of " +
                        totalPercent +
                        "% You can not exceed 100%",
                    );
                    return;
                  }
                  console.log(poPaymentTerms);
                  let data = poPaymentTerms;
                  console.log("this is payment terms", data);
                  data.push(selectedPaymentTermData);
                  setPoPaymentTerms(data);
                  setSelectedPaymentTerm("");
                  setSelectedPaymentTermData("");
                  setSelectedPaymentTermId("");
                  setShowAddPaymentTerm(false);
                  setShowAddPaymentTerm(false);
                }}
                className={`relative group flex-1 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                  selectedPaymentTermData
                    ? 'bg-gradient-to-r from-[#b52124] via-[#c52c30] to-[#d43538] text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative flex items-center justify-center gap-3">
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                  <span>Add</span>
                </div>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setSelectedPaymentTerm("");
                  setSelectedPaymentTermData("");
                  setSelectedPaymentTermId("");
                  setShowAddPaymentTerm(false);
                }}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 hover:from-gray-300 hover:to-gray-400 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-gray-500/10 border border-gray-300/50"
              >
                Close
              </button>
            </div>
          </div>
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
            <h3 className="font-bold text-white text-sm md:text-base">Terms & Conditions</h3>
            <p className="text-xs text-gray-300/80 hidden md:block">Manage terms and conditions</p>
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
      
      <div className="p-4 overflow-y-auto flex-grow">
        <ul className="space-y-3">
          {terms.map((d, indx: number) => {
            const extraTCData = extraTerms.filter((ed: any) => ed.category === d.category) || [];
            
            return (
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
                            : tc
                        )
                      );

                      setExtraTerms((prev) =>
                        prev.map((tc) =>
                          tc.category === d.category
                            ? {
                                ...tc,
                                is_default: isActive,
                              }
                            : tc
                        )
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
                                        ? {
                                            ...i,
                                            is_default: !i.is_default,
                                          }
                                        : i
                                    ),
                                  }
                                : tc
                            )
                          );
                        }}
                        className="w-3.5 h-3.5 accent-[#b52124] cursor-pointer mt-0.5"
                      />
                      <span className="text-xs text-[#5a5d5a]">{term.content}</span>
                    </li>
                  ))}
                  
                  {extraTCData.map((etc: any) => (
                    <li key={etc.content} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={etc.is_default}
                        onChange={() => {
                          setExtraTerms((prev) =>
                            prev.map((etci) =>
                              etci.content === etc.content
                                ? {
                                    ...etci,
                                    is_default: !etci.is_default,
                                  }
                                : etci
                            )
                          );
                        }}
                        className="w-3.5 h-3.5 accent-[#b52124] cursor-pointer mt-0.5"
                      />
                      <span className="text-xs text-[#5a5d5a] italic">{etc.content}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
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
            <h3 className="font-bold text-white text-sm md:text-base">Add Term</h3>
            <p className="text-xs text-gray-300/80 hidden md:block">Add new terms & conditions</p>
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
              
              // Add to extraTerms
              setExtraTerms([
                ...extraTerms,
                { ...extraTermData, is_default: true },
              ]);
              
              // Reset form
              setExtraTermData({
                category: "",
                content: "",
                is_default: false,
              });
              
              // Close modal
              setShowAddTerm(false);
              toast.success("Term added successfully");
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
