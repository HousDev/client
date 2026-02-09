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
  Briefcase,
} from "lucide-react";
import ItemsApi from "../lib/itemsApi";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import { excelToItemsData } from "../utils/excelToItemsData";
import ServicesApi from "../lib/servicesApi";
import { excelToServicesData } from "../utils/excelToServicesData";

export type ServiceFormData = {
  service_code: string;
  service_name: string;

  category?: string; // optional if you want "service" or group
  service_category?: string;
  service_sub_category?: string;

  description?: string;

  unit: string; // job / hour / day / nos

  sac_code?: string;

  igst_rate: number;
  cgst_rate: number;
  sgst_rate: number;

  standard_rate: number;

  is_active?: boolean;
};

type Service = ServiceFormData & { id: string };

export default function ServiceMaster(): JSX.Element {
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
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

  // Bulk selection
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState<ServiceFormData>({
    service_code: "",
    service_name: "",
    unit: "job",
    sac_code: "",
    igst_rate: 18,
    cgst_rate: 9,
    sgst_rate: 9,
    standard_rate: 0,
    description: "",
  });

  // Load items from backend
  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    try {
      const res = await ServicesApi.getServices();

      const normalized: Service[] = (Array.isArray(res) ? res : []).map(
        (sv: any) => ({
          id: String(sv.id),

          service_code: sv.service_code ?? "",
          service_name: sv.service_name ?? "",

          category: sv.category ?? "service",
          service_category: sv.service_category ?? "",
          service_sub_category: sv.service_sub_category ?? "",

          description: sv.description ?? "",
          unit: sv.unit ?? "job",

          sac_code: sv.sac_code ?? "",

          igst_rate: Number(sv.igst_rate) || 0,
          cgst_rate: Number(sv.cgst_rate) || 0,
          sgst_rate: Number(sv.sgst_rate) || 0,

          standard_rate: Number(sv.standard_rate) || 0,

          is_active: sv.is_active === undefined ? true : Boolean(sv.is_active),
        }),
      );

      setItems(normalized);
    } catch (err) {
      console.error("Failed to load services from API:", err);
      toast.error("Could not load services from server.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setFormData({
      service_code: "",
      service_name: "",

      category: "service",
      service_category: "",
      service_sub_category: "",

      description: "",

      unit: "job", // default for services
      sac_code: "",

      igst_rate: 18,
      cgst_rate: 9,
      sgst_rate: 9,

      standard_rate: 0,

      is_active: true,
    });

    setEditingId(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_name.trim()) {
      toast.error("Please fill required fields (Service Name).");
      return;
    }

    try {
      // 🔹 Generate next service code (only for create)
      let nextServiceCode = formData.service_code;

      if (!editingId) {
        const tempData: any = await ServicesApi.getLastServiceCode();
        const lsc = tempData.lastServiceCode;

        const PREFIX = "SER";
        const MIN_DIGITS = 4;

        const lastCode = lsc ?? `${PREFIX}0`;
        const nextNumber = Number(lastCode.replace(PREFIX, "")) + 1;

        nextServiceCode = PREFIX + String(nextNumber).padStart(MIN_DIGITS, "0");
      }

      const payload: any = {
        service_code: nextServiceCode,
        service_name: formData.service_name.trim(),

        category: "service",
        service_category: formData.service_category,
        service_sub_category: formData.service_sub_category,

        description: formData.description,
        unit: formData.unit,

        sac_code: formData.sac_code,

        igst_rate: Number(formData.igst_rate) || 0,
        cgst_rate: Number(formData.cgst_rate) || 0,
        sgst_rate: Number(formData.sgst_rate) || 0,

        standard_rate: Number(formData.standard_rate) || 0,
        is_active: formData.is_active ? 1 : 0,
      };

      if (editingId) {
        // 🔹 UPDATE
        const numericId = Number(editingId);
        const updated: any = await ServicesApi.updateService(
          numericId,
          payload,
        );

        const normalized: Service = {
          id: String(updated.id ?? numericId),

          service_code: updated.service_code ?? payload.service_code,
          service_name: updated.service_name ?? payload.service_name,

          category: updated.category ?? "service",
          service_category:
            updated.service_category ?? payload.service_category,
          service_sub_category:
            updated.service_sub_category ?? payload.service_sub_category,

          description: updated.description ?? payload.description,
          unit: updated.unit ?? payload.unit,

          sac_code: updated.sac_code ?? payload.sac_code,

          igst_rate: Number(updated.igst_rate) || payload.igst_rate,
          cgst_rate: Number(updated.cgst_rate) || payload.cgst_rate,
          sgst_rate: Number(updated.sgst_rate) || payload.sgst_rate,

          standard_rate: Number(updated.standard_rate) || payload.standard_rate,

          is_active:
            updated.is_active === undefined
              ? Boolean(payload.is_active)
              : Boolean(updated.is_active),
        };

        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? normalized : it)),
        );

        toast.success("Service updated successfully!");
      } else {
        // 🔹 CREATE
        const created: any = await ServicesApi.createService(payload);

        const normalized: Service = {
          id: String(created.id ?? `srv_${Date.now().toString(36)}`),

          service_code: created.service_code ?? payload.service_code,
          service_name: created.service_name ?? payload.service_name,

          category: created.category ?? "service",
          service_category:
            created.service_category ?? payload.service_category,
          service_sub_category:
            created.service_sub_category ?? payload.service_sub_category,

          description: created.description ?? payload.description,
          unit: created.unit ?? payload.unit,

          sac_code: created.sac_code ?? payload.sac_code,

          igst_rate: Number(created.igst_rate) || payload.igst_rate,
          cgst_rate: Number(created.cgst_rate) || payload.cgst_rate,
          sgst_rate: Number(created.sgst_rate) || payload.sgst_rate,

          standard_rate: Number(created.standard_rate) || payload.standard_rate,

          is_active:
            created.is_active === undefined
              ? Boolean(payload.is_active)
              : Boolean(created.is_active),
        };

        setItems((prev) => [...prev, normalized]);
        toast.success("Service created successfully!");
      }

      setShowServiceModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Failed to save service.");
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service.id);

    setFormData({
      service_code: service.service_code,
      service_name: service.service_name,

      category: service.category ?? "service",
      service_category: service.service_category ?? "",
      service_sub_category: service.service_sub_category ?? "",

      description: service.description || "",

      unit: service.unit || "job",
      sac_code: service.sac_code || "",

      igst_rate: service.igst_rate || 0,
      cgst_rate: service.cgst_rate || 0,
      sgst_rate: service.sgst_rate || 0,

      standard_rate: service.standard_rate || 0,

      is_active: service.is_active ?? true,
    });

    setShowServiceModal(true);
  };

  const handleDelete = async (id: string) => {
    const result: any = await MySwal.fire({
      title: "Delete Service?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await ServicesApi.deleteService(Number(id));

      setItems((prev) => prev.filter((svc) => svc.id !== id));

      setSelectedItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });

      toast.success("Service deleted successfully!");
    } catch (err) {
      console.error("Delete service failed:", err);
      toast.error("Failed to delete service.");
    }
  };

  // Bulk delete items
  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one service to delete.");
      return;
    }

    const result: any = await MySwal.fire({
      title: `Delete ${selectedItems.size} Service${
        selectedItems.size > 1 ? "s" : ""
      }?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#C62828",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Delete ${selectedItems.size} Service${
        selectedItems.size > 1 ? "s" : ""
      }`,
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      let successCount = 0;
      let errorCount = 0;

      for (const serviceId of Array.from(selectedItems)) {
        try {
          await ServicesApi.deleteService(Number(serviceId));
          successCount++;
        } catch (error) {
          console.error(`Error deleting service ${serviceId}:`, error);
          errorCount++;
        }
      }

      // Update services list
      setItems((prev) => prev.filter((svc) => !selectedItems.has(svc.id)));
      setSelectedItems(new Set());
      setSelectAll(false);

      if (successCount > 0) {
        toast.success(
          `Successfully deleted ${successCount} service${
            successCount > 1 ? "s" : ""
          }.`,
        );
      }
      if (errorCount > 0) {
        toast.error(
          `Failed to delete ${errorCount} service${errorCount > 1 ? "s" : ""}.`,
        );
      }
    } catch (err) {
      console.error("Error in bulk delete services:", err);
      toast.error("Failed to delete services.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus?: boolean) => {
    try {
      await ServicesApi.toggleService(Number(id));

      setItems((prev) =>
        prev.map((svc) =>
          svc.id === id ? { ...svc, is_active: !currentStatus } : svc,
        ),
      );

      toast.success(`Service ${!currentStatus ? "activated" : "deactivated"}!`);
    } catch (err) {
      console.error("Toggle service failed:", err);
      toast.error("Failed to toggle service status.");
    }
  };

  // Handle item selection
  const handleSelectService = (id: string) => {
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
      const allIds = new Set(getCurrentPageServices().map((item) => item.id));
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

  const filteredItems = items.filter((service) => {
    const matchesServiceCode =
      !searchItemCode ||
      (service.service_code || "")
        .toLowerCase()
        .includes(searchItemCode.toLowerCase());

    const matchesServiceName =
      !searchItemName ||
      (service.service_name || "")
        .toLowerCase()
        .includes(searchItemName.toLowerCase());

    const matchesCategory =
      !searchCategory ||
      (service.service_category || "")
        .toLowerCase()
        .includes(searchCategory.toLowerCase());

    const matchesSAC =
      !searchHSN ||
      (service.sac_code || "").toLowerCase().includes(searchHSN.toLowerCase());

    const matchesUnit =
      !searchUnit ||
      (service.unit || "").toLowerCase().includes(searchUnit.toLowerCase());

    const matchesIGST =
      !searchIGST ||
      String(service.igst_rate ?? "")
        .toLowerCase()
        .includes(searchIGST.toLowerCase());

    const matchesCGST =
      !searchCGST ||
      String(service.cgst_rate ?? "")
        .toLowerCase()
        .includes(searchCGST.toLowerCase());

    const matchesSGST =
      !searchSGST ||
      String(service.sgst_rate ?? "")
        .toLowerCase()
        .includes(searchSGST.toLowerCase());

    const matchesRate =
      !searchRate || String(service.standard_rate ?? "").includes(searchRate);

    const matchesStatus =
      !searchStatus ||
      (service.is_active ? "active" : "inactive").includes(
        searchStatus.toLowerCase(),
      );

    return (
      matchesServiceCode &&
      matchesServiceName &&
      matchesCategory &&
      matchesSAC &&
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

  // Get current page services
  const getCurrentPageServices = () => {
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

  const handleServicesPerPageChange = (value: string) => {
    const newValue = parseInt(value, 10);

    if (!isNaN(newValue) && newValue > 0) {
      setItemsPerPage(newValue);
      setCurrentPage(1); // Reset to first page when changing page size
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
    const file = e.target.files?.[0];
    if (!file) return;
    const tempData: any = await ItemsApi.getLastItemCode();

    try {
      const excelData: any = await excelToServicesData(
        file,
        tempData.lastItemCode,
      );
      console.log("data", excelData);

      const res: any = await ItemsApi.addDataByImport(excelData);
      loadServices();
      console.log(res);
    } catch (err: any) {
      toast.error(err);
    }

    e.target.value = "";
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
    <div className="px-0 bg-gray-50 min-h-screen">
      {/* Header with Actions and Bulk Actions - Side by Side */}
      <div className="mt-0 mb-0 px-2 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
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
            <select
              name=""
              onChange={(e) => handleServicesPerPageChange(e.target.value)}
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
              setShowServiceModal(true);
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
            Add Service
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleImportClick}
              className="bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700 px-3 py-1.5 text-white font-semibold rounded-lg text-xs flex items-center gap-2 transition-all duration-200"
            >
              Import Excel
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <a
              href={`${import.meta.env.VITE_API_URL}/templates/items-import-template`}
              title="Download Template Data"
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Table - Responsive with Search Bars */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px]">
            <thead className="bg-gray-200 border-b border-gray-200">
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
              {getCurrentPageServices().map((item) => {
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
                        onChange={() => handleSelectService(item.id)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span className="font-medium text-gray-800 text-xs md:text-sm">
                        {item.service_code}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-800 text-xs md:text-sm">
                          {item.service_name}
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

              {getCurrentPageServices().length === 0 && (
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

      {/* Add/Edit Modal - Kept as is */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 px-5 py-3 flex justify-between items-center border-b border-green-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {editingId ? "Edit Service" : "Add Service"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId
                      ? "Update service details"
                      : "Create new service"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowServiceModal(false);
                  resetForm();
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Service Code */}
                  {editingId && (
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-800">
                        Service Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.service_code}
                        disabled
                        className="w-full px-3 py-2 text-sm border-2 rounded-xl bg-gray-100"
                      />
                    </div>
                  )}

                  {/* Service Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.service_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          service_name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl focus:border-green-600"
                      placeholder="Electrical Installation"
                      required
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl bg-white"
                    >
                      <option value="job">Job</option>
                      <option value="day">Day</option>
                      <option value="hour">Hour</option>
                      <option value="nos">Nos</option>
                    </select>
                  </div>

                  {/* Standard Rate */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Standard Rate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.standard_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          standard_rate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  {/* IGST */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      IGST (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.igst_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          igst_rate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* CGST */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      CGST (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.cgst_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cgst_rate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* SGST */}
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      SGST (%) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.sgst_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sgst_rate: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 rounded-xl min-h-[80px]"
                      placeholder="Enter service description"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg"
                >
                  {editingId ? "Update Service" : "Add Service"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowServiceModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2.5 border-2 rounded-xl text-gray-700"
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
