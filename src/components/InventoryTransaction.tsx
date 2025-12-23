import React, { useState, SetStateAction, useRef, useEffect } from "react";
import { X, Save, Package } from "lucide-react";
import inventoryApi from "../lib/inventoryApi";
import inventoryTransactionApi from "../lib/inventoryTransactionApi";

/* ---------- Types ---------- */
interface InventoryFormData {
  inventory_item_id: number;
  transaction_qty: number;
  transaction_type: string;
  remark: string;
  previous_qty: number;
}

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
  options: any[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
}) {
  console.log(options, "options");
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Normalize options to {id,name}
  const normalized = options.map((opt) =>
    typeof opt === "string" ? { id: opt, name: opt } : opt
  );

  const selected =
    normalized.find((o) => Number(o.id) === Number(value)) || null;

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
        className={`w-full flex items-center gap-2 px-3 py-3 border rounded-lg bg-white cursor-pointer ${
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

/* ---------- Component ---------- */
export default function InventoryTransaction({
  setShowCreatePro,
  allInventory,
  loadAllData,
}: {
  setShowCreatePro: React.Dispatch<SetStateAction<boolean>>;
  loadAllData: () => void;
  allInventory: any;
}) {
  const [formData, setFormData] = useState<InventoryFormData>({
    inventory_item_id: 0,
    transaction_qty: 0,
    transaction_type: "",
    remark: "",
    previous_qty: 0,
  });

  const [InventoryItems, setInventoryItems] = useState<any>(allInventory);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData, "this is inventory formdata");
    if (
      !formData.inventory_item_id ||
      !formData.transaction_qty ||
      !formData.transaction_type ||
      !formData.remark
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      const item = allInventory.find(
        (d: any) => d.id === formData.inventory_item_id
      );
      const payload = { ...formData, previous_qty: item.quantity };
      await inventoryTransactionApi.createTransaction(payload);
      alert("Inventory item added successfully");
      setShowCreatePro(false);
      loadAllData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Add Inventory Item
          </h2>
          <button
            onClick={() => setShowCreatePro(false)}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <SearchableSelect
            options={allInventory.map((v: any) => ({
              id: v.id,
              name: v.name || v.vendor_name || v.display || "",
            }))}
            value={String(formData.inventory_item_id)}
            onChange={(id) =>
              setFormData({
                ...formData,
                inventory_item_id: Number(id),
              })
            }
            placeholder="Select Vendor"
            required
          />

          <select
            value={formData.transaction_type}
            onChange={(e) =>
              setFormData({ ...formData, transaction_type: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select Transaction Type</option>
            <option value="CREDIT">CREDIT</option>
            <option value="DEBIT">DEBIT</option>
          </select>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Transaction Qty <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.transaction_qty}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  transaction_qty: Number(e.target.value),
                })
              }
              className="w-full px-4 py-3 border rounded-lg"
              required
            />
          </div>

          {/* Category */}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              value={formData.remark}
              onChange={(e) =>
                setFormData({ ...formData, remark: e.target.value })
              }
              className="w-full px-4 py-3 border rounded-lg"
              rows={3}
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Item
            </button>
            <button
              type="button"
              onClick={() => setShowCreatePro(false)}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
