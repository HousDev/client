import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  AlertCircle,
  Edit,
  Edit2,
  Eye,
  FileText,
  Plus,
  Save,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import ctcTemplateApi from "../../lib/ctcTemplateApi";

interface CTCTemplate {
  id: string;
  name: string;
  description: string;
  template_type: "standard" | "custom";
  is_default: boolean;
  is_active: boolean;
  components: TemplateComponent[];
}

interface TemplateComponent {
  name: string;
  type: "earning" | "deduction";
  value: number;
  is_taxable: boolean;
}

const CtcTemplate = () => {
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<CTCTemplate[]>([]);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CTCTemplate | null>(
    null,
  );
  const [selectedCtcComponentIndex, setSelectedCtcComponentIndex] = useState<
    number | null
  >(null);
  const [showViewTemplateModal, setShowViewTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "earning" as "earning" | "deduction",
    percentage: "",
    is_taxable: true,
  });

  const { can } = useAuth();

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    template_type: "custom" as "standard" | "custom",
    is_default: false,
    components: [] as TemplateComponent[],
  });

  const handleViewTemplate = (template: CTCTemplate) => {
    setSelectedTemplate(template);
    setShowViewTemplateModal(true);
  };

  const handleEditTemplate = (template: CTCTemplate) => {
    setSelectedTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      template_type: template.template_type,
      is_default: template.is_default,
      components: [...template.components],
    });
    setShowEditTemplateModal(true);
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      const templateRes: any = await ctcTemplateApi.deleteTemplate(id);
      if (templateRes.success) {
        toast.success(templateRes.message);
        loadData();
      } else {
        toast.error(templateRes.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;

    if (
      !templateForm.name ||
      !templateForm.description ||
      templateForm.components.length === 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const totalPercentage = templateForm.components.reduce(
      (sum, comp) => sum + comp.value,
      0,
    );
    if (totalPercentage !== 100) {
      toast.error(
        `Total percentage must be 100%. Current: ${totalPercentage}%`,
      );
      return;
    }

    try {
      // Call API to update template
      const updateRes: any = await ctcTemplateApi.updateTemplate(
        Number(selectedTemplate.id),
        templateForm,
      );

      if (updateRes.success) {
        toast.success(updateRes.message || "Template updated successfully!");
        loadData(); // Reload data to get latest
        setShowEditTemplateModal(false);
        setSelectedTemplate(null);
        setTemplateForm({
          name: "",
          description: "",
          is_default: false,
          template_type: "custom",
          components: [],
        });
      } else {
        toast.error(updateRes.message || "Failed to update template");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const ctcTemplatesRes: any = await ctcTemplateApi.getTemplates();
      console.log("component", ctcTemplatesRes.data);
      setTemplates(ctcTemplatesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddComponent = () => {
    const totalPercent = templateForm.components.reduce(
      (sum, t) => sum + Number(t.value),
      0,
    );
    if (totalPercent >= 100) {
      toast.error(
        "You have already added " +
          totalPercent +
          "% you cannot add more than 100%",
      );
      return;
    }

    if (
      !newComponent.name ||
      !newComponent.percentage ||
      parseFloat(newComponent.percentage) <= 0
    ) {
      toast.error("Please fill all component fields");
      return;
    }

    if (selectedCtcComponentIndex !== null && selectedCtcComponentIndex >= 0) {
      const tempComp = [...templateForm.components];
      tempComp[selectedCtcComponentIndex] = {
        name: newComponent.name,
        type: newComponent.type,
        value: parseFloat(newComponent.percentage),
        is_taxable: newComponent.is_taxable,
      };
      setTemplateForm({
        ...templateForm,
        components: tempComp,
      });
      setSelectedCtcComponentIndex(null);
    } else {
      const component: TemplateComponent = {
        name: newComponent.name,
        type: newComponent.type,
        value: parseFloat(newComponent.percentage),
        is_taxable: newComponent.is_taxable,
      };

      setTemplateForm({
        ...templateForm,
        components: [...templateForm.components, component],
      });
    }

    setNewComponent({
      name: "",
      type: "earning",
      percentage: "",
      is_taxable: true,
    });
    toast.success("Component added");
  };

  const handleRemoveComponent = (index: number) => {
    setTemplateForm({
      ...templateForm,
      components: templateForm.components.filter((_, i) => i !== index),
    });
    toast.success("Component removed");
  };

  const handleCreateTemplate = async () => {
    try {
      if (
        !templateForm.name ||
        !templateForm.description ||
        templateForm.components.length === 0
      ) {
        toast.error(
          "Please fill all required fields and add at least one component",
        );
        return;
      }

      const totalPercentage = templateForm.components.reduce(
        (sum, comp) => sum + Number(comp.value),
        0,
      );
      if (totalPercentage !== 100) {
        toast.error(
          `Total percentage must be 100%. Current: ${totalPercentage}%`,
        );
        return;
      }

      const newTemplate = {
        name: templateForm.name,
        description: templateForm.description,
        template_type: templateForm.template_type,
        components: templateForm.components,
      };

      const ctcTemplateRes: any =
        await ctcTemplateApi.createTemplate(newTemplate);
      if (ctcTemplateRes.success) {
        toast.success(
          ctcTemplateRes.message || "Template created successfully!",
        );
        loadData();
        setShowCreateTemplateModal(false);
        setTemplateForm({
          name: "",
          description: "",
          is_default: false,
          template_type: "custom",
          components: [],
        });
        setNewComponent({
          name: "",
          type: "earning",
          percentage: "",
          is_taxable: true,
        });
      } else {
        toast.error("Error: " + ctcTemplateRes.message);
      }
    } catch (error: any) {
      toast.error("Error: " + (error.response?.data?.message || error.message));
    }
  };

  // Calculate total percentage (only for display, don't show toast here)
  const totalPercentage = templateForm.components.reduce(
    (sum, comp) => sum + Number(comp.value),
    0,
  );

  return (
    <div className="px-6">
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          {can("create_ctc_template") && (
            <button
              onClick={() => {
                setShowCreateTemplateModal(true);
              }}
              className="px-3 py-2 text-sm bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              New Template
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <div className=" grid grid-cols-1 sm:grid-cols-3 gap-2">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No templates found. Click "New Template" to create one.
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {template.name}
                        </h4>
                        {template.is_default ? (
                          <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        ) : (
                          <span></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mb-2">
                        {template.description}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {template.components?.length || 0} components
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between w-full">
                    <div className="flex justify-between gap-1 ml-2 w-full">
                      <div className="flex justify-center items-center gap-3">
                        {can("active_inactive_ctc_template") && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              onChange={async () => {
                                try {
                                  const res: any =
                                    await ctcTemplateApi.toggleActive(
                                      template.id,
                                    );
                                  if (res.success) {
                                    toast.success(res.message);
                                    loadData();
                                  } else {
                                    toast.error(res.message);
                                  }
                                } catch (error: any) {
                                  toast.error(
                                    error.response?.data?.message ||
                                      error.message,
                                  );
                                }
                              }}
                              checked={template.is_active}
                              className="text-red-600 mr-1"
                            />
                            <span className="text-xs font-semibold">
                              Is Active
                            </span>
                          </div>
                        )}
                        {can("make_ctc_template_default") && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={template.is_default}
                              onChange={async () => {
                                try {
                                  const res: any =
                                    await ctcTemplateApi.setDefault(
                                      template.id,
                                    );
                                  if (res.success) {
                                    toast.success(res.message);
                                    loadData();
                                  } else {
                                    toast.error(res.message);
                                  }
                                } catch (error: any) {
                                  toast.error(
                                    error.response?.data?.message ||
                                      error.message,
                                  );
                                }
                              }}
                              className="text-red-600 mr-1"
                            />
                            <span className="text-xs font-semibold">
                              Is Default
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {can("view_ctc_template") && (
                          <button
                            onClick={() => handleViewTemplate(template)}
                            className="px-2 py-1 text-blue-600 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                        )}
                        {!template.is_default && can("update_ctc_template") && (
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="px-2 py-1 text-green-600 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )}
                        {can("delete_ctc_template") && (
                          <button
                            onClick={() =>
                              handleDeleteTemplate(Number(template.id))
                            }
                            className="px-2 py-1 text-red-600 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* View Template Modal */}
      {showViewTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowViewTemplateModal(false)}
          />
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    Template Details
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    View CTC template structure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedTemplate.name}
                    </h3>
                    {selectedTemplate.is_default && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600">
                    {selectedTemplate.description}
                  </p>
                  <p className="text-sm text-slate-500 mt-2">
                    Type: {selectedTemplate.template_type}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Components Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedTemplate.components.map((comp, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-900">
                            {comp.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${comp.type === "earning" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                          >
                            {comp.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium text-slate-700">
                            {comp.value}%
                          </span>
                          <span className="text-xs text-slate-500">
                            {comp.is_taxable ? "Taxable" : "Non-taxable"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && selectedTemplate && (
        // ... your existing edit modal JSX (keep as is)
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Your existing edit modal content */}
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        // ... your existing create modal JSX (keep as is)
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Your existing create modal content */}
        </div>
      )}
    </div>
  );
};

export default CtcTemplate;
