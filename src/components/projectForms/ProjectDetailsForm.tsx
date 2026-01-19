// src/components/ProjectDetailsForm.tsx
import { SetStateAction, useState } from "react";
import { X, FileText, Layers, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import ProjectDetailsApi from "../../lib/projectDetailsApi";

interface ProjectDetailsFormProps {
  setShowModel: (show: boolean) => void;
  initialData?: { id: string; name: string; category: string };
  title?: string;
  isEdit?: boolean;
  setUpdateProjectDetails: React.Dispatch<SetStateAction<boolean>>;
  setSelectedProjectDetails: React.Dispatch<
    SetStateAction<{ id: string; name: string; category: string }>
  >;
  loadAllData: () => void;
}

export default function ProjectDetailsForm({
  setShowModel,
  initialData = { id: "", name: "", category: "floor" },
  title = "Add Details",
  isEdit = false,
  loadAllData,
  setUpdateProjectDetails,
  setSelectedProjectDetails,
}: ProjectDetailsFormProps) {
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    category: string;
  }>({
    id: "",
    name: initialData.name,
    category: initialData.category,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: "floor", label: "Floor" },
    {
      value: "common area",
      label: "Common Area",
    },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try {
      if (validateForm()) {
        let res: any;
        const payload: { name: string; category: string } = {
          name: formData.name,
          category: formData.category,
        };
        if (isEdit) {
          res = await ProjectDetailsApi.update(initialData.id, payload);
        } else {
          res = await ProjectDetailsApi.create(payload);
        }
        if (res.status) {
          if (isEdit) {
            toast.success("Updated Successfully.");
          } else {
            toast.success("Created Successfully.");
          }
          loadAllData();
          setShowModel(false);
          setUpdateProjectDetails(false);
          setSelectedProjectDetails({
            id: "",
            name: "",
            category: "floor",
          });
        } else {
          if (isEdit) {
            toast.success("Failed to Updated.");
          } else {
            toast.success("Failed to Created.");
          }
        }
      } else {
        toast.warning("Please fill valid details.");
      }
    } catch (error: any) {
      toast.success(error.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md my-8 border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedProjectDetails({
                id: "",
                name: "",
                category: "floor",
              });
              setShowModel(false);
              setUpdateProjectDetails(false);
            }}
            className="text-white hover:bg-white/10 rounded-lg p-2 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Category Dropdown */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.category}
                </p>
              )}
            </div>

            {/* Name Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., Ground Floor, Swimming Pool, Wing A"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowModel(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-8 py-2.5 bg-[#C62828] text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-medium flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" />
              Save Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
