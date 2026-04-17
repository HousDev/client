import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  X,
  Loader2,
  XCircle,
  ReceiptText,
  Percent,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import PaymentMastersApi from "../lib/paymentMasterApi";

interface PaymentTermFormData {
  trigger: string;
  paymentPercent: string;
  firstText: string;
  gracePeriod: string;
  secondText: string;

  name: string;
  days: number;
  description: string;
  advance_percentage: number;
  is_active?: boolean;
}

type PaymentTerm = PaymentTermFormData & { id: string };

export default function PaymentTermsMaster() {
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search states for each column
  const [searchStatus, setSearchStatus] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [searchTermContent, setSearchTermContent] = useState("");

  const [enableGracePeriod, setEnableGracePeriod] = useState(false);

  // Bulk selection
  const [selectedTerms, setSelectedTerms] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const [formData, setFormData] = useState<PaymentTermFormData>({
    trigger: "",
    paymentPercent: "",
    firstText: "",
    secondText: "",
    gracePeriod: "",
    name: "",
    days: 0,
    description: "",
    advance_percentage: 0,
    is_active: true,
  });

  const loadPaymentTerms = async () => {
    try {
      const paymentTermsRes: any = await PaymentMastersApi.getPaymentMasters();
      console.log("this is payment terms : ", paymentTermsRes);

      setPaymentTerms(paymentTermsRes.data);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    loadPaymentTerms();
  }, []);

  const resetForm = () => {
    setFormData({
      trigger: "",
      paymentPercent: "",
      firstText: "",
      gracePeriod: "",
      secondText: "",
      name: "",
      days: 0,
      description: "",
      advance_percentage: 0,
      is_active: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.trigger.length === 0 ||
      formData.paymentPercent.length === 0 ||
      formData.firstText.length === 0
    ) {
      toast.error("Fill required fields.");
      return;
    }

    try {
      if (editingId) {
        const payload = {
          event_trigger: formData.trigger,
          percentPayment: formData.paymentPercent,
          firstText: formData.firstText,
          gracePeriod: formData.gracePeriod,
          secondText: formData.secondText,
        };

        const paymentMasterRes: any =
          await PaymentMastersApi.updatePaymentMaster(editingId, payload);

        if (paymentMasterRes.success) {
          toast.success(paymentMasterRes.message);
        }
      } else {
        const payload = {
          event_trigger: formData.trigger,
          percentPayment: formData.paymentPercent,
          firstText: formData.firstText,
          gracePeriod: formData.gracePeriod,
          secondText: formData.secondText,
        };

        const paymentMasterRes: any =
          await PaymentMastersApi.createPaymentMaster(payload);

        if (paymentMasterRes.success) {
          toast.success(paymentMasterRes.message);
        }
      }
      loadPaymentTerms();

      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error("Error : ", error.response.data.message);
    }
  };

  const handleEdit = (term: any) => {
    setEditingId(term.id);
    setFormData({
      trigger: term.event_trigger,
      paymentPercent: formatPercent(term.percentPayment),
      firstText: term.firstText,
      secondText: term.secondText,
      gracePeriod: term.gracePeriod,
      name: term.name,
      days: term.days,
      description: term.description || "",
      advance_percentage: term.advance_percentage,
      is_active: term.is_active ?? true,
    });
    setShowModal(true);
  };

  // Bulk delete terms
  const handleBulkDelete = async () => {
    try {
      const ids = Array.from(selectedTerms);
      const paymentTermRes =
        await PaymentMastersApi.bulkDeletePaymentMasters(ids);
      if (paymentTermRes.success) {
        loadPaymentTerms();
        toast.success(paymentTermRes.message);
      } else {
        toast.error(paymentTermRes.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const toggleActive = async (id: string) => {
    try {
      const paymentTermsRes = await PaymentMastersApi.toggleActive(id);
      if (paymentTermsRes.success) {
        toast.success(paymentTermsRes.message);
        loadPaymentTerms();
      } else {
        toast.success(paymentTermsRes.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  // Bulk toggle active status
  const handleBulkToggleActive = async () => {
    const ids = Array.from(selectedTerms);

    try {
      const paymentTermRes = await PaymentMastersApi.bulkToggleActive(ids);
      if (paymentTermRes.success) {
        toast.success(paymentTermRes.message);
        loadPaymentTerms();
      } else {
        toast.error(paymentTermRes.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  // Handle item selection
  const handleSelectTerm = (id: string) => {
    const newSelected = new Set(selectedTerms);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTerms(newSelected);
    setSelectAll(newSelected.size === filteredTerms.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTerms(new Set());
    } else {
      const allIds = new Set(filteredTerms.map((term) => term.id));
      setSelectedTerms(allIds);
    }
    setSelectAll(!selectAll);
  };

  const filteredTerms = paymentTerms.filter((term: any) => {
    const trigger =
      !searchTrigger ||
      (term.event_trigger || "")
        .toLowerCase()
        .includes(searchTrigger.toLowerCase());
    const concatinatedTerm = [
      term.percentPayment != null
        ? `${Number(term.percentPayment).toFixed(2)}`
        : "",

      term.firstText ?? "",

      term.materialPercent != null
        ? `${Number(term.materialPercent).toFixed(2)}`
        : "",

      term.secondText ?? "",

      term.gracePeriod != null ? (term.thirdText ?? "") : "",
    ]
      .filter(Boolean)
      .join(" ");

    const termContent =
      !searchTermContent ||
      (concatinatedTerm || "")
        .toLowerCase()
        .includes(searchTermContent.toLowerCase());

    // NEW: Status search
    const matchesStatus =
      !searchStatus ||
      (term.is_active ? "active" : "inactive") ===
        searchStatus.trim().toLowerCase();

    return trigger && termContent && matchesStatus;
  });

  const formatPercent = (value?: number | string) =>
    value != null ? Number(value).toFixed(2) : "";

  const deleteTerm = async (id: number) => {
    try {
      const paymentTermRes = await PaymentMastersApi.deletePaymentMaster(id);
      if (paymentTermRes.success) {
        toast.success(paymentTermRes.message);
        loadPaymentTerms();
      } else {
        toast.success(paymentTermRes.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment terms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 bg-gray-50 ">
      {/* Header with Bulk Actions and Add Button in one line */}
      <div className=" sticky top-16 z-10 mt-0 mb-0 px-2 py-1 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-1 md:gap-3">
        <div></div>

        <div className="flex items-center gap-1 md:gap-2 flex-nowrap md:flex-wrap w-full md:w-auto">
          {/* Bulk Actions */}
          {selectedTerms.size > 0 && (
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
                  {selectedTerms.size} selected
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => handleBulkToggleActive()}
                  disabled={submitting}
                  className="bg-green-600 text-white px-1.5 py-0.5 rounded text-[9px] md:text-xs disabled:opacity-50"
                >
                  Toggle Status
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

          {/* Add Payment Terms Button */}
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
            Add Payment Terms
          </button>
        </div>
      </div>

      {/* Main Table with Search Bars below header */}
      <div className="sticky top-56 z-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mx-0 md:mx-0">
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] md:max-h-[calc(100vh-260px)] ">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-12">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Trigger
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Term
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

              {/* Search Row - Below header */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search name..."
                    value={searchTrigger}
                    onChange={(e) => setSearchTrigger(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search days..."
                    value={searchTermContent}
                    onChange={(e) => setSearchTermContent(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                <td className="px-3 md:px-4 py-1">
                  {/* <input
                    type="text"
                    placeholder="Search description..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  /> */}
                  <select
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                  >
                    <option value={""}>Select Filter</option>
                    <option value={"active"}>Active</option>
                    <option value={"inactive"}>Inactive</option>
                  </select>
                </td>

                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={() => {
                      setSearchStatus(""); // ADD THIS
                      setSearchTrigger("");
                      setSearchTermContent("");
                    }}
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
              {filteredTerms.map((term: any) => {
                const isSelected = selectedTerms.has(term.id);
                console.log(term);
                const concatinatedTerm = [
                  term.percentPayment != null && term.percentPayment !== ""
                    ? `${formatPercent(term.percentPayment)}`
                    : "",

                  term.firstText ?? "",

                  term.gracePeriod != null &&
                  term.gracePeriod !== "" &&
                  term.gracePeriod !== null
                    ? term.gracePeriod
                    : "",
                  term.secondText ?? "",
                ]
                  .filter(
                    (item) =>
                      item !== "" && item !== null && item !== undefined,
                  )
                  .join(" ");

                return (
                  <tr
                    key={term.id}
                    className={`hover:bg-gray-50 transition ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-3 md:px-4 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectTerm(term.id)}
                        className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                      />
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-xs md:text-sm">
                          {term.event_trigger}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm">
                      {concatinatedTerm}
                    </td>

                    <td className="px-3 md:px-4 py-3">
                      <button
                        onClick={() => toggleActive(term.id)}
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                          term.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {term.is_active ? "ACTIVE" : "INACTIVE"}
                      </button>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => handleEdit(term)}
                          className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => deleteTerm(term.id)}
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

              {filteredTerms.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <CreditCard className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No Payment Terms Found
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-1">
                      {searchTermContent || searchTrigger || searchStatus
                        ? "Try a different search term"
                        : "No payment terms available"}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                    {editingId ? "Edit Payment Terms" : "Add Payment Terms"}
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {editingId
                      ? "Update payment terms details"
                      : "Add new payment terms"}
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

            <form onSubmit={handleSubmit} className="p-4">
              <div className=" mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Name */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Trigger <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <ReceiptText className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={formData.trigger}
                      onChange={(e) => {
                        setFormData({ ...formData, trigger: e.target.value });
                      }}
                      className="w-full px-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C62828]/30 text-xs"
                    >
                      <option value="">Select Trigger</option>
                      {[
                        "Order Confirmation",
                        "Before Delivery",
                        "On Delivery",
                        "After Delivery",
                      ].map((trigger) => (
                        <option key={trigger} value={trigger}>
                          {trigger}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Credit Days & Advance Percentage */}
                <div>
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Enter Payment Percent{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <Percent className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.paymentPercent}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentPercent: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800 mb-1">
                    Enter Term <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                      <ReceiptText className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={formData.firstText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          firstText: e.target.value,
                        })
                      }
                      className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      placeholder="% Advance Payment"
                    />
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-2 flex justify-start items-center w-fit ml-3">
                  <input
                    type="checkbox"
                    checked={enableGracePeriod}
                    onChange={(e) => {
                      setEnableGracePeriod(e.target.checked);
                      if (!e.target.checked) {
                        setFormData({
                          ...formData,
                          gracePeriod: "",
                          secondText: "",
                        });
                      }
                    }}
                    className="w-4 h-4 mr-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                  <span className="text-sm">Add grace period.</span>
                </div>

                {enableGracePeriod && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Grace Period
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <CalendarDays className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.gracePeriod}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gracePeriod: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="10"
                      />
                    </div>
                  </div>
                )}
                {enableGracePeriod && (
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Enter Term
                    </label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#C62828] transition-colors">
                        <ReceiptText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={formData.secondText}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondText: e.target.value,
                          })
                        }
                        className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                        placeholder="Days of grace period."
                      />
                    </div>
                  </div>
                )}

                {(formData.paymentPercent ||
                  formData.firstText ||
                  formData.secondText ||
                  formData.gracePeriod) && (
                  <div className="col-span-1 sm:col-span-2 border border-orange-600 px-3 py-2 rounded-lg">
                    <label className="block text-xs font-semibold text-gray-800 mb-1">
                      Preview of Term
                    </label>
                    <div className="relative group flex items-center">
                      <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                      <p className="text-gray-700 text-sm">
                        {formData.paymentPercent +
                          " " +
                          formData.firstText +
                          " " +
                          formData.gracePeriod +
                          " " +
                          formData.secondText}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  {editingId ? "Update Payment Terms" : "Add Payment Terms"}
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

            {/* Custom scrollbar */}
            <style>{`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
              }
              .animate-fadeIn {
                animation: fadeIn 0.3s ease-out;
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}
