//src/pages/ItemsMaster.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Package,
  X,
  Loader2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pickaxe,
  ChevronDown,
} from "lucide-react";
import ItemsApi from "../lib/itemsApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import { excelToItemsData } from "../utils/excelToItemsData";

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
  work_type: string;
}

type Item = ItemFormData & { id: string };

export default function ItemsMaster(): JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Search states for each column
  const [searchItemCode, setSearchItemCode] = useState("");
  const [searchItemName, setSearchItemName] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchHSN, setSearchHSN] = useState("");
  const [searchUnit, setSearchUnit] = useState("");
  const [searchIGST, setSearchIGST] = useState("");
  const [searchCGST, setSearchCGST] = useState("");
  const [searchSGST, setSearchSGST] = useState("");
  const [searchRate, setSearchRate] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [showImport, setShowImport] = useState(false);

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const defaultWork = [
    "RCC (Structure)",
    "Brickwork (Masonry)",
    "Door / Window Frame Fixing",
    "Electrical (Concealed)",
    "Plumbing (Concealed)",
    "Plaster",
    "Flooring / Tiling",
    "CP Fitting (Taps & Mixers)",
    "Electrical (Fixtures)",
    "Painting",
    "Final Cleaning & Handover",
  ];

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [itemCategories, setItemCategory] = useState([]);
  const [itemSubCategories, setItemSubCategory] = useState([]);
  const [excelFileData, setExcelFileData] = useState<any>([]);
  const [importLoading, setImportLoading] = useState(false);

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
    work_type: "",
  });

  // Load items from backend
  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const res = await ItemsApi.getItems();
      const materialCategories: any = [
        ...new Set(
          res
            .filter((item) => item.category === "material")
            .map((item) => item.item_category)
            .filter(Boolean),
        ),
      ];

      const materialSubCategories: any = [
        ...new Set(
          res
            .filter((item) => item.category === "material")
            .map((item) => item.item_sub_category)
            .filter(Boolean),
        ),
      ];
      materialCategories.push("Other");
      materialSubCategories.push("Other");

      setItemCategory(materialCategories || []);
      setItemSubCategory(materialSubCategories || []);

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
          work_type: "",
        }),
      );
      setItems(normalized);
    } catch (err) {
      console.error("Failed to load items from API:", err);
      toast.error("Could not load items from server.");
      setItems([]);
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
      work_type: "",
    });
    setEditingId(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.item_name.trim()) {
      toast.error("Please fill required fields (Item Code & Item Name).");
      return;
    }
    const tempData: any = await ItemsApi.getLastItemCode();
    const lic = tempData.lastItemCode;
    console.log(lic);
    const PREFIX = "MAT";
    const MIN_DIGITS = 4;

    const lastCode = lic ?? `${PREFIX}0`;

    const nextNumber = Number(lastCode.replace(PREFIX, "")) + 1;

    const nextItemCode = PREFIX + String(nextNumber).padStart(MIN_DIGITS, "0");
    console.log(nextItemCode);

    try {
      if (editingId) {
        const payload: any = {
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
          work_type: formData.work_type,
        };
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
          work_type: updated.work_type,
        };
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? normalized : it)),
        );
        toast.success("Item updated successfully!");
      } else {
        const payload: any = {
          item_code: nextItemCode,
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
          work_type: formData.work_type,
        };
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
          work_type: created.work_type,
        };
        setItems((prev) => [...prev, normalized]);
        toast.success("Item created successfully!");
      }

      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving item:", err);
      toast.error("Failed to save item.");
    }
  };

  const handleEdit = (item: Item) => {
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
      work_type: item.work_type,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await ItemsApi.deleteItem(Number(id));
      setItems((prev) => prev.filter((it) => it.id !== id));
      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      toast.success("Item deleted successfully!");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete item.");
    }
  };

  // Bulk delete items
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to delete.");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedItems.size} Item${selectedItems.size > 1 ? "s" : ""}?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Delete ${selectedItems.size} Item${selectedItems.size > 1 ? "s" : ""}`,
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const itemId of Array.from(selectedItems)) {
        try {
          await ItemsApi.deleteItem(Number(itemId));
          successCount++;
        } catch (error) {
          console.error(`Error deleting item ${itemId}:`, error);
          errorCount++;
        }
      }

      // Update items list
      setItems((prev) => prev.filter((item) => !selectedItems.has(item.id)));
      setSelectedItems(new Set());
      setSelectAll(false);

      if (successCount > 0) {
        toast.success(
          `Successfully deleted ${successCount} item${successCount > 1 ? "s" : ""}.`,
        );
      }
      if (errorCount > 0) {
        toast.error(
          `Failed to delete ${errorCount} item${errorCount > 1 ? "s" : ""}.`,
        );
      }
    } catch (err) {
      console.error("Error in bulk delete:", err);
      toast.error("Failed to delete items.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus?: boolean) => {
    try {
      await ItemsApi.toggleItem(Number(id));
      setItems((prev) =>
        prev.map((it) =>
          it.id === id ? { ...it, is_active: !currentStatus } : it,
        ),
      );
      toast.success(`Item ${!currentStatus ? "activated" : "deactivated"}!`);
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Failed to toggle status.");
    }
  };

  // Handle item selection
  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredItems.length);
  };

  // Handle select all for current page
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(getCurrentPageItems().map((item) => item.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  // Clear all search filters
  const clearAllFilters = () => {
    setSearchItemCode("");
    setSearchItemName("");
    setSearchCategory("");
    setSearchHSN("");
    setSearchUnit("");
    setSearchIGST("");
    setSearchCGST("");
    setSearchSGST("");
    setSearchRate("");
    setSearchStatus("");
  };

  const filteredItems = items.filter((item) => {
    const matchesItemCode =
      !searchItemCode ||
      (item.item_code || "")
        .toLowerCase()
        .includes(searchItemCode.toLowerCase());

    const matchesItemName =
      !searchItemName ||
      (item.item_name || "")
        .toLowerCase()
        .includes(searchItemName.toLowerCase());

    const matchesCategory =
      !searchCategory ||
      (item.category || "")
        .toLowerCase()
        .includes(searchCategory.toLowerCase());

    const matchesHSN =
      !searchHSN ||
      (item.hsn_code || "").toLowerCase().includes(searchHSN.toLowerCase());

    const matchesUnit =
      !searchUnit ||
      (item.unit || "").toLowerCase().includes(searchUnit.toLowerCase());

    const matchesIGST =
      !searchIGST ||
      (item.igst_rate || "").toLowerCase().includes(searchIGST.toLowerCase());

    const matchesCGST =
      !searchCGST ||
      (item.cgst_rate || "").toLowerCase().includes(searchCGST.toLowerCase());

    const matchesSGST =
      !searchSGST ||
      (item.sgst_rate || "").toLowerCase().includes(searchSGST.toLowerCase());

    const matchesRate =
      !searchRate || String(item.standard_rate || "").includes(searchRate);

    const matchesStatus =
      !searchStatus ||
      (item.is_active ? "active" : "inactive").includes(
        searchStatus.toLowerCase(),
      );

    return (
      matchesItemCode &&
      matchesItemName &&
      matchesCategory &&
      matchesHSN &&
      matchesUnit &&
      matchesIGST &&
      matchesCGST &&
      matchesSGST &&
      matchesRate &&
      matchesStatus
    );
  });

  // Calculate pagination data
  useEffect(() => {
    const total = filteredItems.length;
    const pages = Math.ceil(total / itemsPerPage);
    setTotalPages(pages > 0 ? pages : 1);

    // Reset to page 1 if current page exceeds total pages
    if (currentPage > pages && pages > 0) {
      setCurrentPage(1);
    }
  }, [filteredItems, itemsPerPage, currentPage]);

  // Get current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredItems.slice(startIndex, endIndex);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    console.log(value);
    const newValue = parseInt(value, 10);
    if (!isNaN(newValue) && newValue > 0) {
      setItemsPerPage(newValue);
      setCurrentPage(1); // Reset to first page when changing items per page
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportLoading(true);
    const file = e.target.files?.[0];
    if (!file) return;
    const tempData: any = await ItemsApi.getLastItemCode();

    try {
      const excelData: any = await excelToItemsData(
        file,
        tempData.lastItemCode,
      );
      console.log("data", excelData);
      setExcelFileData(Array.isArray(excelData) ? excelData : []);
    } catch (err: any) {
      toast.error(err);
    } finally {
      setImportLoading(false);
    }

    e.target.value = "";
  };

  const handleImportItemsSubmit = async () => {
    try {
      const res: any = await ItemsApi.addDataByImport(excelFileData);
      loadItems();
      setExcelFileData([]);
      setShowImport(false);

      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      console.log(res);
    } catch (error: any) {
      toast.error("Error : ", error.response.data.message);
    }
  };

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
    <div className="px-0 bg-gray-50 ">
      {/* Header with Actions and Bulk Actions - Side by Side */}
      <div className=" sticky top-36 z-10 mt-0 mb-0 px-2 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
        <div></div>

        <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
          {/* Bulk Actions */}
          {selectedItems.size > 0 && (
            <div
              className="
          flex items-center gap-0.5
          bg-gradient-to-r from-red-50 to-rose-50
          border border-red-200
          rounded-md
          shadow-sm
          px-1.5 py-0.5
          md:px-2 md:py-2
          whitespace-nowrap px-0
        "
            >
              {/* Selected Count */}
              <div className="flex items-center gap-0.5">
                <div className="bg-red-100 p-0.5 rounded">
                  <Trash2 className="w-2.5 h-2.5 md:w-3.5 md:h-3.5 text-red-600" />
                </div>
                <p className="font-medium text-[9px] md:text-xs text-gray-800">
                  {selectedItems.size} selected
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((item) =>
                        selectedItems.has(item.id)
                          ? { ...item, is_active: true }
                          : item,
                      ),
                    );
                    setSelectedItems(new Set());
                  }}
                  className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs"
                >
                  Activate
                </button>

                <button
                  onClick={() => {
                    setItems((prev) =>
                      prev.map((item) =>
                        selectedItems.has(item.id)
                          ? { ...item, is_active: false }
                          : item,
                      ),
                    );
                    setSelectedItems(new Set());
                  }}
                  className="bg-yellow-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs"
                >
                  Deactivate
                </button>

                <button
                  onClick={handleBulkDelete}
                  disabled={submitting}
                  className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Divider (desktop only) */}
          <div className="hidden md:block h-6 border-l border-gray-300 mx-1"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-gray-600">Show</span>
            {/* <input
              type="text"
              disabled
              min="1"
              max="100"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="w-16 px-2 py-1 text-xs md:text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#C62828] focus:border-transparent text-center"
            /> */}
            <select
              name=""
              onChange={(e) => handleItemsPerPageChange(e.target.value)}
              className="border border-slate-400 px-3 py-1 rounded-lg"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Add Item */}
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="
    flex items-center gap-1
    bg-gradient-to-r from-[#C62828] to-red-600
    text-white
    px-2.5 py-1
    md:px-4 md:py-2
    rounded-lg
    text-[10px] md:text-sm
    font-medium
    shadow-sm
    whitespace-nowrap
    ml-auto md:ml-0
  "
          >
            <Plus className="w-3 h-3 md:w-4 md:h-4" />
            Add Item
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowImport(true)}
              className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs text-white font-semibold rounded-lg flex items-center gap-1 md:gap-2 transition-all duration-200"
            >
              Import Excel{" "}
            </button>

            <a
              href={`${import.meta.env.VITE_API_URL}/templates/items-import-template`}
              title="Download Template Data"
              className="p-1.5 md:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <Download className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Table - Responsive with Search Bars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-300px)] ">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Code
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    HSN/SAC
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Unit
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    IGST(%)
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    CGST(%)
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    SGST(%)
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Rate
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </div>
                </th>
              </tr>

              {/* Search Row - Like MaterialInTransactions */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Item Code Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search code..."
                    value={searchItemCode}
                    onChange={(e) => setSearchItemCode(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Item Name Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchItemName}
                    onChange={(e) => setSearchItemName(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Category Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search category..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* HSN Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search HSN..."
                    value={searchHSN}
                    onChange={(e) => setSearchHSN(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Unit Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search unit..."
                    value={searchUnit}
                    onChange={(e) => setSearchUnit(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* IGST Rate Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search IGST..."
                    value={searchIGST}
                    onChange={(e) => setSearchIGST(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* CGST Rate Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search CGST..."
                    value={searchCGST}
                    onChange={(e) => setSearchCGST(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* SGST Rate Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search SGST..."
                    value={searchSGST}
                    onChange={(e) => setSearchSGST(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Rate Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search rate..."
                    value={searchRate}
                    onChange={(e) => setSearchRate(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Status Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search status..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Actions - Clear Filter Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear Filters"
                  >
                    <XCircle className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {getCurrentPageItems().map((item) => {
                const isSelected = selectedItems.has(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-gray-50 transition ${
                      isSelected ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-3 md:px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span className="font-medium text-gray-800 text-xs md:text-sm">
                        {item.item_code}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-xs md:text-sm">
                          {item.item_name}
                        </p>
                        {item.description && (
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          item.category === "material"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.category?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {item.hsn_code || "-"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {item.unit}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {item.igst_rate}%
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {item.cgst_rate}%
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {item.sgst_rate}%
                    </td>
                    <td className="px-3 md:px-4 py-3 font-medium text-gray-800 text-xs md:text-sm">
                      {formatCurrency(item.standard_rate)}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <button
                        onClick={() => toggleActive(item.id, item.is_active)}
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          item.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {item.is_active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {getCurrentPageItems().length === 0 && (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center">
                    <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No Items Found
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      {searchItemCode ||
                      searchItemName ||
                      searchCategory ||
                      searchHSN ||
                      searchUnit ||
                      searchIGST ||
                      searchCGST ||
                      searchSGST ||
                      searchRate ||
                      searchStatus
                        ? "Try a different search term"
                        : "No items available"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredItems.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-3 md:p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
              {/* Items per page selector */}

              {/* Page info */}
              <div className="text-xs md:text-sm text-gray-700">
                Showing{" "}
                <span className="font-semibold">
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredItems.length,
                  )}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * itemsPerPage, filteredItems.length)}
                </span>{" "}
                of <span className="font-semibold">{filteredItems.length}</span>{" "}
                items
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1 md:gap-2">
                <button
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className={`p-1.5 md:p-2 rounded border ${
                    currentPage === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="First page"
                >
                  <ChevronsLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>

                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1.5 md:p-2 rounded border ${
                    currentPage === 1
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-7 h-7 md:w-8 md:h-8 rounded border text-xs md:text-sm font-medium ${
                          currentPage === pageNum
                            ? "bg-[#C62828] text-white border-[#C62828]"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 md:p-2 rounded border ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>

                <button
                  onClick={() => goToPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`p-1.5 md:p-2 rounded border ${
                    currentPage === totalPages
                      ? "border-gray-200 text-gray-400 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Last page"
                >
                  <ChevronsRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* import excel preview */}
      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? "Edit Item" : "Add Item"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? "Update item details" : "Add new item"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowImport(false);
                  setExcelFileData([]);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {!importLoading ? (
              <div>
                {excelFileData.length === 0 ? (
                  <div
                    className="p-6 rounded-xl shadow-sm max-w-md mx-auto cursor-pointer"
                    onClick={handleImportClick}
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Import Items
                    </h3>

                    <p className="text-sm text-gray-500 mb-4">
                      Upload an Excel file (.xlsx / .xls) to bulk import
                      products.
                    </p>

                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-red-500 transition">
                      <button
                        className="
                 px-5 py-2.5 
                 text-sm  font-semibold 
                 rounded-lg 
                 flex items-center gap-2
                 
                 transition-all duration-200"
                      >
                        📥 Import Excel
                      </button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow border border-gray-200">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="min-w-full text-sm text-left">
                        {/* Header */}
                        <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
                          <tr>
                            <th className="px-4 py-3">Item Name</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Item Category</th>
                            <th className="px-4 py-3">Sub Category</th>
                            <th className="px-4 py-3 text-center">Unit</th>
                            <th className="px-4 py-3 text-right">Rate</th>
                            <th className="px-4 py-3 text-center">IGST %</th>
                            <th className="px-4 py-3 text-center">CGST %</th>
                            <th className="px-4 py-3 text-center">SGST %</th>
                            <th className="px-4 py-3 text-center">HSN</th>
                            <th className="px-4 py-3">Work Type</th>
                          </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-gray-100">
                          {excelFileData.map((item: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium max-w-[250px] truncate">
                                {item.item_name}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    item.category === "material"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-purple-100 text-purple-700"
                                  }`}
                                >
                                  {item.category}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                {item.item_category}
                              </td>
                              <td className="px-4 py-3">
                                {item.item_sub_category}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.unit}
                              </td>

                              <td className="px-4 py-3 text-right font-semibold">
                                ₹ {item.standard_rate}
                              </td>

                              <td className="px-4 py-3 text-center">
                                {item.igst}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.cgst}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.sgst}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.hsn}
                              </td>

                              <td className="px-4 py-3 max-w-[200px] truncate">
                                {item.work_type || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-96 flex justify-center items-center">
                Loading...
              </div>
            )}
            {/* Modal Footer */}
            <div className="border-t p-4 flex gap-3">
              <button
                onClick={handleImportItemsSubmit}
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Import Items
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowImport(false);
                  setExcelFileData([]);
                  resetForm();
                }}
                className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal - Kept as is */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? "Edit Item" : "Add Item"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId ? "Update item details" : "Add new item"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Item Code */}
                  {editingId && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-800 mb-1">
                        Item Code <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={formData.item_code}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              item_code: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                          placeholder="MAT001"
                          required
                          disabled={!!editingId}
                        />
                      </div>
                    </div>
                  )}

                  {/* Item Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.item_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            item_name: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Cement Grade 43"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.category}
                        onChange={(e) =>
                          setFormData({ ...formData, category: e.target.value })
                        }
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                      >
                        <option value="material">Material</option>
                        <option value="service">Service</option>
                      </select>
                    </div>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <select
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        className="w-full pl-9 pr-8 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
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
                  </div>

                  {/* HSN/SAC */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      HSN/SAC Code
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.hsn_code}
                        onChange={(e) =>
                          setFormData({ ...formData, hsn_code: e.target.value })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="2523"
                      />
                    </div>
                  </div>

                  {/* Standard Rate */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Standard Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={formData.standard_rate}
                        onChange={(e) => {
                          if (
                            !/^\d*\.?\d*$/.test(e.target.value) ||
                            Number(e.target.value) < 0
                          )
                            return;
                          setFormData({
                            ...formData,
                            standard_rate: parseFloat(e.target.value),
                          });
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* IGST Rate */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      IGST Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.igst_rate}
                        onChange={(e) => {
                          if (
                            !/^\d*\.?\d*$/.test(e.target.value) ||
                            Number(e.target.value) < 0
                          )
                            return;
                          setFormData({
                            ...formData,
                            igst_rate: e.target.value,
                          });
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* CGST Rate */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      CGST Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.cgst_rate}
                        onChange={(e) => {
                          if (
                            !/^\d*\.?\d*$/.test(e.target.value) ||
                            Number(e.target.value) < 0
                          )
                            return;
                          setFormData({
                            ...formData,
                            cgst_rate: e.target.value,
                          });
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* SGST Rate */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      SGST Rate (%) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.sgst_rate}
                        onChange={(e) => {
                          if (
                            !/^\d*\.?\d*$/.test(e.target.value) ||
                            Number(e.target.value) < 0
                          )
                            return;
                          setFormData({
                            ...formData,
                            sgst_rate: e.target.value,
                          });
                        }}
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {formData.category === "material" && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <Pickaxe className="w-4 h-4 text-[#C62828]" />
                        For Work <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                          <Pickaxe className="w-4 h-4" />
                        </div>
                        <select
                          value={formData.work_type || ""}
                          required
                          onChange={(e: any) =>
                            setFormData({
                              ...formData,
                              work_type: e.target.value,
                            })
                          }
                          className="w-full pl-10 pr-10 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 bg-white outline-none transition-all duration-200 appearance-none hover:border-gray-300"
                        >
                          <option value="" className="text-gray-400">
                            Select Work
                          </option>
                          {defaultWork.map((work: any) => (
                            <option key={work} value={work}>
                              {work}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Description
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-3 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <Package className="w-3.5 h-3.5" />
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 min-h-[80px] resize-vertical"
                        placeholder="Enter description"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {editingId ? "Update Item" : "Add Item"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 text-sm border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
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
