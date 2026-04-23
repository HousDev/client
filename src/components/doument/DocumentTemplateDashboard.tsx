import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  EllipsisVertical,
  Eye,
  CircleCheck,
  CircleX,
  IndianRupee,
  X,
} from "lucide-react";
import Button from "../ui/Button";
import CreateTemplate from "./CreateTemplate";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DocumentTemplatesApi,
  DocumentTemplate,
} from "../../lib/DocumentTemplatesApi";
import { SettingsApi } from "../../lib/settingsApi";
import MySwal from "../../utils/swal";
import { MdEditDocument } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

type Template = {
  id?: string | number;
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  variables?: string[];
  status?: string;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
  created_by?: string | number;
  updated_by?: string | number;
  lastUsed?: string;
  logo_url?: string; // Add logo_url field
  logo_file?: File; // For new uploads
  rejection_reason: string;
};

const DocumentTemplateDashboard = () => {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [showMenus, setShowMenus] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectionModule, setShowRejectionModule] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const { user } = useAuth();
  // Fetch templates on component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const templateRes = await DocumentTemplatesApi.getTemplates();
      setTemplates(templateRes);
      console.log("Templates fetched:", templateRes);
    } catch (error: any) {
      toast.error(
        "Error fetching templates: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData: Template) => {
    try {
      console.log("from save", templateData);
      // Convert to FormData for API
      const formData = new FormData();
      formData.append("name", templateData.name || "");
      formData.append("category", templateData.category || "");
      formData.append("description", templateData.description || "");
      formData.append("html_content", templateData.content || "");
      formData.append(
        "variables",
        JSON.stringify(templateData.variables || []),
      );
      formData.append(
        "is_active",
        templateData.status === "active" ? "1" : "0",
      );

      // Handle logo - if there's a new file, upload it
      if (templateData.logo_url) {
        formData.append("logo_url", templateData.logo_url);
      }

      // If editing, include the ID
      if (editingTemplate?.id) {
        await DocumentTemplatesApi.updateTemplate(
          Number(editingTemplate.id),
          formData,
        );
        toast.success("Template updated successfully!");
      } else {
        // Creating new template
        await DocumentTemplatesApi.createTemplate(formData);
        toast.success("Template created successfully!");
      }

      // Refresh the template list
      await fetchTemplates();

      // Close the modal and reset editing state
      setShowCreateTemplate(false);
      setEditingTemplate(null);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast.error(
        "Error saving template: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleEdit = (template: DocumentTemplate) => {
    // Convert DocumentTemplate to Template format expected by CreateTemplate
    const templateToEdit: Template = {
      id: template.id,
      name: template.name,
      description: template.description,
      category: template.category,
      content: template.html_content,
      variables: template.variables,
      status: template.is_active === 1 ? "active" : "inactive",
      rejection_reason: template.rejection_reason || "",
      created_at: template.created_at,
      updated_at: template.updated_at,
      logo_url: template.logo_url ? template?.logo_url : undefined, // Include logo_url
    };
    setEditingTemplate(templateToEdit);
    setShowCreateTemplate(true);
  };

  const handleDelete = async (id: number) => {
    try {
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
      await DocumentTemplatesApi.deleteTemplate(id);
      toast.success("Template deleted successfully!");
      await fetchTemplates();
    } catch (error: any) {
      toast.error(
        "Error deleting template: " +
          (error.response?.data?.message || error.message),
      );
    }
  };

  const handleCloseModal = () => {
    setShowCreateTemplate(false);
    setEditingTemplate(null);
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setShowCreateTemplate(true);
  };

  const fetchLogo = async () => {
    try {
      await SettingsApi.getSystemSettings();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const rejectTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (rejectionReason.length === 0) {
        toast.error("Enter valid rejection reason.");
        return;
      }
      const payload = {
        approved_by: user.id,
        approved_at: new Date().toLocaleDateString(),
        rejection_reason: rejectionReason,
      };
      const rejectionRes = await DocumentTemplatesApi.rejectDocumentTemplate(
        selectedTemplate.id,
        payload,
      );
      console.log("rejectionRes : ", rejectionRes);
      if (rejectionRes.success) {
        toast.success("Document template rejected.");
        fetchTemplates();
        setShowRejectionModule(false);
        setRejectionReason("");
      } else {
        toast.error("Document template rejection failed.");
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const approveDocumentTemplate = async (id: number) => {
    setSubmitting(true);
    try {
      const payload = {
        approved_by: user.id,
        approved_at: new Date().toLocaleDateString(),
      };
      const approvalRes: any = await DocumentTemplatesApi.approveTemplate(
        id,
        payload,
      );

      console.log("rejectionRes : ", approvalRes);
      if (approvalRes.success) {
        fetchTemplates();
        toast.success("Document template approved.");
      } else {
        toast.error("Document template approval failed.");
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  const activeInactiveTemplate = async (
    id: number,
    is_active: string | number,
  ) => {
    setSubmitting(true);
    try {
      const approvalRes: any =
        await DocumentTemplatesApi.activeInactiveTemplate(id, {
          is_active,
        });

      console.log("rejectionRes : ", approvalRes);
      if (approvalRes.success) {
        fetchTemplates();
        toast.success("Document template approved.");
      } else {
        toast.error("Document template approval failed.");
      }
    } catch (error: any) {
      console.log(error.response.data.message);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Document Templates</h1>
        <Button className="py-2 text-sm" onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No templates found. Click "Create Template" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                {/* 🔹 Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {template.logo_url ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL}/uploads/${template.logo_url}`}
                        alt={template.name}
                        className="h-10 w-10 object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon size={18} className="text-gray-400" />
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">
                        {template.name}
                      </p>
                      {template.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 max-w-[180px]">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    {template.status === "approved" && (
                      <button
                        onClick={() => {
                          activeInactiveTemplate(
                            template.id,
                            template.is_active,
                          );
                        }}
                        className={`px-2 py-1 text-xs rounded-full ${
                          template.is_active === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.is_active === 1 ? "Active" : "Inactive"}
                      </button>
                    )}
                    <div className=" right-0">
                      <button
                        onClick={() =>
                          setShowMenus(
                            template.id === showMenus ? null : template.id,
                          )
                        }
                        className="px-1 py-1 hover:bg-gray-200 rounded-lg "
                      >
                        <EllipsisVertical className="w-4 h-4 cursor-pointer" />
                      </button>

                      {showMenus === template.id && (
                        <div className="relative h-0 w-0">
                          <div className="absolute bg-white border brder-gray-300 rounded-lg shadow-lg w-[12vw] right-0">
                            <ul className="">
                              <li className="w-full">
                                <button
                                  onClick={() => {
                                    handleEdit(template);
                                    setShowMenus(null);
                                  }}
                                  className=" text-xs w-full text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center px-2 py-1"
                                  title="Edit"
                                >
                                  <Edit size={18} className="mr-2" /> Edit
                                  Template
                                </button>
                              </li>
                              <li className="w-full">
                                <button
                                  onClick={() => {
                                    handleDelete(template.id);
                                    setShowMenus(null);
                                  }}
                                  className="text-xs w-full text-red-600 hover:bg-red-50 rounded-lg transition flex items-center px-2 py-1"
                                  title="Delete"
                                >
                                  <Trash2 size={18} className="mr-2" /> Delete
                                  Template
                                </button>
                              </li>
                              {template.status === "pending" && (
                                <li className="w-full">
                                  <button
                                    onClick={() => {
                                      approveDocumentTemplate(template.id);
                                      setShowMenus(null);
                                    }}
                                    className="text-xs w-full text-green-600 hover:bg-green-50 rounded-lg transition flex items-center px-2 py-1"
                                    title="Delete"
                                  >
                                    <CircleCheck size={18} className="mr-2" />{" "}
                                    Approve Template
                                  </button>
                                </li>
                              )}
                              {template.status === "pending" && (
                                <li className="w-full">
                                  <button
                                    onClick={() => {
                                      setSelectedTemplate(template);
                                      setShowMenus(null);
                                      setShowRejectionModule(true);
                                    }}
                                    className="text-xs w-full text-orange-600 hover:bg-orange-50 rounded-lg transition flex items-center px-2 py-1"
                                    title="Delete"
                                  >
                                    <CircleX size={18} className="mr-2" />{" "}
                                    Reject Template
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 🔹 Details */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category</span>
                    <span className="font-medium text-gray-700">
                      {template.category}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Variables</span>
                    <span className="font-medium text-gray-700">
                      {template.variables?.length || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="font-medium text-gray-700">
                      {new Date(template.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {template.status === "rejected" && (
                    <div className="text-red-600">
                      <span>Rejection Reason : </span>
                      <span>{template.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal - Single instance */}
      {showCreateTemplate && (
        <CreateTemplate
          template={editingTemplate || undefined}
          onSave={handleSaveTemplate}
          onClose={handleCloseModal}
        />
      )}
      {showRejectionModule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <MdEditDocument className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Reject Document Template
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    {selectedTemplate?.name} - {selectedTemplate?.category}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowRejectionModule(false);
                  setSelectedTemplate(null);
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={rejectTemplate}
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-gray-800">
                  Document Template Rejection Reason
                </label>
                <textarea
                  value={rejectionReason || ""}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                  rows={2}
                  placeholder="Add any remarks..."
                />
              </div>

              {/* Modal Footer */}
              <div className="border-t p-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <CircleX className="w-4 h-4" /> Reject Document Template
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectionModule(false);
                    setRejectionReason("");
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
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
};

export default DocumentTemplateDashboard;
