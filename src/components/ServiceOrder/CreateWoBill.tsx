/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ServiceOrdersPro.tsx
import React, { useState, SetStateAction } from "react";
import {
  X,
  Package,
  Calendar,
  FileDigit,
  IndianRupee,
  Plus,
  File,
  Percent,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/Api";
import { toast } from "sonner";

type WoBillForm = {
  wo_id: number | string;
  bill_number: string;
  bill_amount: string;
  bill_balance: string;
  bill_retention: string;
  bill_date: string;
  bill_due_date: string;
  bill_proof: string;
  created_by: string;
};

export default function CreateWoBill({
  setShowWoBill,
  loadAllData,
  selectedWO,
}: {
  setShowWoBill: React.Dispatch<SetStateAction<boolean>>;
  loadAllData: () => void;
  selectedWO: any;
}): JSX.Element {
  const { user } = useAuth();

  const [formData, setFormData] = useState<WoBillForm>({
    wo_id: selectedWO.id,
    bill_number: "",
    bill_amount: "0",
    bill_balance: "0",
    bill_retention: "0",
    bill_date: new Date().toISOString().split("T")[0],
    bill_due_date: "",
    bill_proof: "",
    created_by: user.id,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      if (!formData.wo_id) {
        toast.error("Work order id required.");
      }
      if (!formData.bill_number) {
        toast.error("Bill number required.");
      }
      if (!formData.bill_retention) {
        toast.error("Retention required.");
      }
      if (!formData.bill_date) {
        toast.error("Bill date required.");
      }
      if (!formData.bill_due_date) {
        toast.error("Bill due date required.");
      }
      if (!formData.bill_proof) {
        toast.error("Bill proof required.");
      }
      e.preventDefault();
      const formDataObj = new FormData();

      // 🔹 Basic fields
      formDataObj.append("wo_id", String(formData.wo_id));
      formDataObj.append("bill_number", String(formData.bill_number));
      formDataObj.append("bill_amount", formData.bill_amount);
      formDataObj.append("bill_balance", formData.bill_amount);
      formDataObj.append("bill_retention", formData.bill_retention);
      formDataObj.append("bill_date", formData.bill_date);
      formDataObj.append("bill_due_date", formData.bill_due_date);
      formDataObj.append("created_by", formData.created_by);

      // 🔹 Challan image
      if (formData.bill_proof) {
        formDataObj.append("bill_proof", formData.bill_proof);
      }

      const response: any = await api.post("/wo-bill", formDataObj, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.message);
        loadAllData();
        setShowWoBill(false);
      } else {
        toast.error("Errors : ", response.data.message);
      }
    } catch (error: any) {
      toast.error("Error : ", error.response.data.message);
      console.log(error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      setFormData((prev: any) => ({ ...prev, bill_proof: file }));
    }
  };
  return (
    <div className="p-6">
      {/* Create Modal (with SearchableSelects) */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
          {/* Header */}
          <div
            className="bg-gradient-to-r from-[#4b4e4b] via-[#5a5d5a] to-[#6b6e6b]
  px-6 py-3 flex justify-between items-center
  rounded-t-2xl border-b border-white/10
  backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Package className="w-5 h-5 text-white" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Add WO Bill
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  Add work order bill.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWoBill(false);
                // resetForm();
              }}
              className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <FileDigit className="w-3 h-3 text-amber-600" />
                  <span>Bill Number</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                    <FileDigit className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.bill_number}
                    onChange={(e) => {
                      if (e.target.value.length > 30) return;
                      setFormData({ ...formData, bill_number: e.target.value });
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <IndianRupee className="w-3 h-3 text-amber-600" />
                  <span>Bill Amount</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                    <IndianRupee className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.bill_amount}
                    onChange={(e) => {
                      if (
                        !/^\d*\.?\d*$/.test(e.target.value) ||
                        Number(e.target.value) < 0
                      )
                        return;
                      setFormData({
                        ...formData,
                        bill_amount: e.target.value,
                      });
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Percent className="w-3 h-3 text-amber-600" />
                  <span>Bill Retention</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="text"
                    value={formData.bill_retention}
                    onChange={(e) => {
                      if (
                        !/^\d*\.?\d*$/.test(e.target.value) ||
                        Number(e.target.value) < 0
                      )
                        return;
                      if (Number(e.target.value) > 100) return;
                      setFormData({
                        ...formData,
                        bill_retention: e.target.value,
                      });
                    }}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>WO Bill Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={formData.bill_date}
                    max={formData.bill_due_date}
                    onChange={(e) =>
                      setFormData({ ...formData, bill_date: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-amber-600" />
                  <span>WO Bill Due Date</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-amber-600 transition-colors">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <input
                    type="date"
                    value={formData.bill_due_date}
                    min={formData.bill_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bill_due_date: e.target.value,
                      })
                    }
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-xl focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all duration-200 hover:border-gray-400"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className=" text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <File className="w-3 h-3 text-amber-600" />
                  <span>WO Bill Proof</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="file"
                    required
                    id="payment_proof"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-1 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none file:border-none file:bg-gradient-to-r file:from-[#C62828] file:to-red-600 file:text-white file:font-medium file:px-3 file:py-1 file:rounded-lg file:cursor-pointer"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2 col-span-1 sm:col-span-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#b52124] to-[#d43538] text-white px-4 py-2.5 rounded-xl hover:from-[#d43538] hover:to-[#b52124] transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> Add Bill
                </button>
                <button
                  type="button"
                  onClick={() => setShowWoBill(false)}
                  className="px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-[#40423f]"
                >
                  Close
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
