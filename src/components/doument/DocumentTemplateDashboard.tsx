import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import Button from "../ui/Button";
import CreateTemplate from "./CreateTemplate";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DocumentTemplatesApi,
  DocumentTemplate,
} from "../../lib/DocumentTemplatesApi";
import { SettingsApi } from "../../lib/settingsApi";

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
};

const DocumentTemplateDashboard = () => {
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loading, setLoading] = useState(false);

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
      created_at: template.created_at,
      updated_at: template.updated_at,
      logo_url: template.logo_url ? template?.logo_url : undefined, // Include logo_url
    };
    setEditingTemplate(templateToEdit);
    setShowCreateTemplate(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        await DocumentTemplatesApi.deleteTemplate(id);
        toast.success("Template deleted successfully!");
        await fetchTemplates();
      } catch (error: any) {
        toast.error(
          "Error deleting template: " +
            (error.response?.data?.message || error.message),
        );
      }
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
                        src={template.logo_url}
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

                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      template.is_active === 1
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {template.is_active === 1 ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* 🔹 Details */}
                <div className="space-y-2 mb-4 text-xs">
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
                </div>

                {/* 🔹 Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => handleEdit(template)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    onClick={() => handleDelete(template.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
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
    </div>
  );
};

export default DocumentTemplateDashboard;
