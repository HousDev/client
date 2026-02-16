import { useState, useEffect } from "react";
import {
  Plus,
  Settings,
  Users,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  X,
  Trash2,
  MoreVertical,
  Save,
  ChevronDown,
  AlertCircle,
  ChevronRight,
  FileText,
  IndianRupee,
  Calendar,
  Edit2,
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { toast } from "sonner";
import HrmsEmployeesApi, { HrmsEmployee } from "../lib/employeeApi";

interface Employee {
  id: string;
  name: string;
  code: string;
  job_title: string;
  department: string;
  branch: string;
  status: string;
}

interface CTCConfig {
  id: string;
  employee: Employee;
  annual_ctc: number;
  monthly_ctc: number;
  template_name: string;
  effective_from: string;
  status: "draft" | "pending_approval" | "approved" | "active";
  components: CTCComponent[];
}

interface CTCComponent {
  id: string;
  name: string;
  type: "earning" | "deduction";
  percentage: number;
  annual_amount: number;
  monthly_amount: number;
  is_taxable: boolean;
}

interface CTCTemplate {
  id: string;
  name: string;
  description: string;
  template_type: "standard" | "custom";
  is_default: boolean;
  components: TemplateComponent[];
}

interface TemplateComponent {
  name: string;
  type: "earning" | "deduction";
  percentage: number;
  is_taxable: boolean;
}

const initialTemplates: CTCTemplate[] = [
  {
    id: "1",
    name: "IT Industry Standard",
    description: "Standard CTC structure for IT professionals",
    template_type: "standard",
    is_default: true,
    components: [
      {
        name: "Basic Salary",
        type: "earning",
        percentage: 40,
        is_taxable: true,
      },
      { name: "HRA", type: "earning", percentage: 20, is_taxable: true },
      {
        name: "Special Allowance",
        type: "earning",
        percentage: 25,
        is_taxable: true,
      },
      {
        name: "PF Contribution",
        type: "earning",
        percentage: 5,
        is_taxable: false,
      },
      {
        name: "Professional Tax",
        type: "deduction",
        percentage: 2,
        is_taxable: false,
      },
      { name: "TDS", type: "deduction", percentage: 8, is_taxable: false },
    ],
  },
  {
    id: "2",
    name: "Sales Team Structure",
    description: "Performance-based structure for sales team",
    template_type: "standard",
    is_default: false,
    components: [
      {
        name: "Basic Salary",
        type: "earning",
        percentage: 35,
        is_taxable: true,
      },
      { name: "HRA", type: "earning", percentage: 15, is_taxable: true },
      { name: "Commission", type: "earning", percentage: 30, is_taxable: true },
      {
        name: "Travel Allowance",
        type: "earning",
        percentage: 10,
        is_taxable: false,
      },
      {
        name: "Professional Tax",
        type: "deduction",
        percentage: 2,
        is_taxable: false,
      },
      { name: "TDS", type: "deduction", percentage: 8, is_taxable: false },
    ],
  },
  {
    id: "3",
    name: "Senior Management",
    description: "Executive compensation structure",
    template_type: "standard",
    is_default: false,
    components: [
      {
        name: "Basic Salary",
        type: "earning",
        percentage: 45,
        is_taxable: true,
      },
      { name: "HRA", type: "earning", percentage: 25, is_taxable: true },
      {
        name: "Performance Bonus",
        type: "earning",
        percentage: 15,
        is_taxable: true,
      },
      {
        name: "Car Allowance",
        type: "earning",
        percentage: 5,
        is_taxable: false,
      },
      {
        name: "Professional Tax",
        type: "deduction",
        percentage: 2,
        is_taxable: false,
      },
      { name: "TDS", type: "deduction", percentage: 8, is_taxable: false },
    ],
  },
];

export default function CTCConfiguration() {
  const [configurations, setConfigurations] = useState<CTCConfig[]>([]);
  const [templates, setTemplates] = useState<CTCTemplate[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Employee state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);

  // Selection states
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showViewTemplateModal, setShowViewTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showViewConfigModal, setShowViewConfigModal] = useState(false);
  const [selectedCtcComponentIndex, setSelectedCtcComponentIndex] = useState<
    number | null
  >(null);

  const [selectedTemplate, setSelectedTemplate] = useState<CTCTemplate | null>(
    null,
  );
  const [selectedConfig, setSelectedConfig] = useState<CTCConfig | null>(null);

  const [configForm, setConfigForm] = useState({
    employee_id: "",
    template_id: "",
    annual_ctc: "",
    effective_from: new Date().toISOString().split("T")[0],
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    template_type: "custom" as "standard" | "custom",
    components: [] as TemplateComponent[],
  });

  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "earning" as "earning" | "deduction",
    percentage: "",
    is_taxable: true,
  });

  useEffect(() => {
    loadData();
    fetchEmployees();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenuId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest(".menu-container")) {
          setOpenMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees from API
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const response = await HrmsEmployeesApi.getEmployees();
      console.log("Fetched employees:", response);

      // Transform HrmsEmployee to Employee format
      const transformedEmployees: Employee[] = response.map(
        (emp: HrmsEmployee) => ({
          id: emp.id.toString(),
          name: `${emp.first_name} ${emp.last_name}`,
          code: emp.employee_code,
          job_title: emp.designation || emp.job_title || "N/A",
          department: emp.department_name || "N/A",
          branch: emp.branch || emp.office_location || "N/A",
          status: emp.employee_status || "active",
        }),
      );

      setEmployees(transformedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
      setEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  };

  const handleAssignCTC = () => {
    const employee = employees.find((e) => e.id === configForm.employee_id);
    const template = templates.find((t) => t.id === configForm.template_id);

    if (
      !employee ||
      !template ||
      !configForm.annual_ctc ||
      parseFloat(configForm.annual_ctc) <= 0
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const annualCTC = parseFloat(configForm.annual_ctc);
    const monthlyCTC = annualCTC / 12;

    const components: CTCComponent[] = template.components.map(
      (comp, index) => ({
        id: `COMP${Date.now()}_${index}`,
        name: comp.name,
        type: comp.type,
        percentage: comp.percentage,
        annual_amount: (annualCTC * comp.percentage) / 100,
        monthly_amount: (monthlyCTC * comp.percentage) / 100,
        is_taxable: comp.is_taxable,
      }),
    );

    const newConfig: CTCConfig = {
      id: `CTC${Date.now()}`,
      employee,
      annual_ctc: annualCTC,
      monthly_ctc: monthlyCTC,
      template_name: template.name,
      effective_from: configForm.effective_from,
      status: "active",
      components,
    };

    setConfigurations([newConfig, ...configurations]);
    setShowConfigModal(false);
    setConfigForm({
      employee_id: "",
      template_id: "",
      annual_ctc: "",
      effective_from: new Date().toISOString().split("T")[0],
    });
    toast.success("CTC assigned successfully!");
  };

  const handleCreateTemplate = () => {
    console.log("Create CTC Template", templateForm);
    // try {
    //   if (
    //     !templateForm.name ||
    //     !templateForm.description ||
    //     templateForm.components.length === 0
    //   ) {
    //     toast.error(
    //       "Please fill all required fields and add at least one component",
    //     );
    //     return;
    //   }

    //   const totalPercentage = templateForm.components.reduce(
    //     (sum, comp) => sum + comp.percentage,
    //     0,
    //   );
    //   if (totalPercentage !== 100) {
    //     toast.error(
    //       `Total percentage must be 100%. Current: ${totalPercentage}%`,
    //     );
    //     return;
    //   }

    //   const newTemplate: CTCTemplate = {
    //     id: `TMPL${Date.now()}`,
    //     name: templateForm.name,
    //     description: templateForm.description,
    //     template_type: templateForm.template_type,
    //     is_default: false,
    //     components: templateForm.components,
    //   };

    //   setTemplates([...templates, newTemplate]);
    //   setShowCreateTemplateModal(false);
    //   setTemplateForm({
    //     name: "",
    //     description: "",
    //     template_type: "custom",
    //     components: [],
    //   });
    //   toast.success("Template created successfully!");
    // } catch (error: any) {
    //   toast.error("Error : ", error.response.data.message);
    // }
  };

  const handleAddComponent = () => {
    const totalPercent = templateForm.components.reduce(
      (sum, t) => (t.type === "earning" ? (sum += Number(t.percentage)) : 0),
      0,
    );
    if (totalPercent >= 100 && newComponent.type === "earning") {
      toast.error(
        "You have already added earning " +
          totalPercent +
          "% you can not add more than 100%",
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
    if (selectedCtcComponentIndex) {
      const tempComp = templateForm.components;
      tempComp[selectedCtcComponentIndex] = {
        name: newComponent.name,
        type: newComponent.type,
        percentage: parseFloat(newComponent.percentage),
        is_taxable: newComponent.is_taxable,
      };
      setTemplateForm({
        ...templateForm,
        components: tempComp,
      });
    } else {
      const component: TemplateComponent = {
        name: newComponent.name,
        type: newComponent.type,
        percentage: parseFloat(newComponent.percentage),
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
      components: [...template.components],
    });
    setShowEditTemplateModal(true);
  };

  const handleUpdateTemplate = () => {
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
      (sum, comp) => sum + comp.percentage,
      0,
    );
    if (totalPercentage !== 100) {
      toast.error(
        `Total percentage must be 100%. Current: ${totalPercentage}%`,
      );
      return;
    }

    setTemplates(
      templates.map((t) =>
        t.id === selectedTemplate.id ? { ...t, ...templateForm } : t,
      ),
    );

    setShowEditTemplateModal(false);
    setSelectedTemplate(null);
    setTemplateForm({
      name: "",
      description: "",
      template_type: "custom",
      components: [],
    });
    toast.success("Template updated successfully!");
  };

  const handleViewConfig = (config: CTCConfig) => {
    setSelectedConfig(config);
    setShowViewConfigModal(true);
  };

  const handleDeleteConfig = (id: string) => {
    setConfigurations(configurations.filter((config) => config.id !== id));
    toast.success("CTC configuration deleted successfully!");
  };

  const handleBulkDelete = () => {
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setConfigurations(
            configurations.filter((config) => !selectedItems.has(config.id)),
          );
          setSelectedItems(new Set());
          setSelectAll(false);
          resolve(true);
        }, 500);
      }),
      {
        loading: `Deleting ${selectedItems.size} configuration(s)...`,
        success: `${selectedItems.size} configuration(s) deleted successfully`,
        error: "Failed to delete configurations",
      },
    );
  };

  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
    } else {
      const allIds = new Set(filteredConfigurations.map((config) => config.id));
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredConfigurations.length);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    toast.success("Filters cleared");
  };

  const stats = {
    total: configurations.length,
    active: configurations.filter((c) => c.status === "active").length,
    pending: configurations.filter((c) => c.status === "pending_approval")
      .length,
    draft: configurations.filter((c) => c.status === "draft").length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "approved":
        return "info";
      case "pending_approval":
        return "warning";
      case "draft":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const filteredConfigurations = configurations.filter((config) => {
    const matchesSearch =
      config.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.employee.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.template_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || config.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPercentage = templateForm.components.reduce(
    (sum, comp) => (comp.type === "earning" ? sum + comp.percentage : 0),
    0,
  );

  return (
    <div className="space-y-5">
      {/* Header with Action Buttons - Sticky */}
      <div className="flex items-center justify-end py-0 px-2 -mt-2 -mb-2">
        <div className="sticky top-44 z-10 flex flex-col md:flex-row gap-3 items-center justify-end">
          {selectedItems.size > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-1 rounded">
                  <IndianRupee className="w-3 h-3 text-blue-600" />
                </div>
                <p className="font-medium text-xs text-gray-800">
                  {selectedItems.size} selected
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium transition"
                >
                  <Trash2 className="w-3 h-3 inline mr-1" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowTemplateModal(true)}
            className="text-sm sticky top-20 z-10"
          >
            <Settings className="h-4 w-4 mr-1.5" />
            Manage Templates
          </Button>
          <Button
            onClick={() => setShowConfigModal(true)}
            className="text-sm sticky top-20 z-10 bg-gradient-to-r from-[#C62828] to-red-600 hover:from-red-600 hover:to-red-700"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Assign CTC
          </Button>
        </div>
      </div>

      {/* Statistics Cards - Sticky & Compact */}
      <div className="sticky top-20 z-10 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Total Configs
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-blue-600 mt-0.5">
                {stats.total}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-blue-100 rounded-md flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Active
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-green-600 mt-0.5">
                {stats.active}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-green-100 rounded-md flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Pending
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-yellow-600 mt-0.5">
                {stats.pending}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-yellow-100 rounded-md flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-2 sm:p-3 md:p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-xs text-slate-600 font-medium">
                Templates
              </p>
              <p className="text-lg sm:text-xl md:text-xl font-bold text-slate-900 mt-0.5">
                {templates.length}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-9 md:h-9 bg-slate-100 rounded-md flex items-center justify-center">
              <IndianRupee className="h-4 w-4 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Table - Responsive with sticky header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-y-auto max-h-[calc(100vh-295px)] md:max-h-[calc(100vh-280px)]">
          <table className="w-full min-w-[900px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {/* Header Row */}
              <tr>
                <th className="px-3 md:px-4 py-2 text-center w-16">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Select
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Template
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Annual CTC
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Monthly CTC
                  </div>
                </th>
                <th className="px-3 md:px-4 py-2 text-left">
                  <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Effective From
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

              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                {/* Select Column */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                  />
                </td>

                {/* Employee Search */}
                <td className="px-3 md:px-4 py-1">
                  <input
                    type="text"
                    placeholder="Search employee..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>

                {/* Template Column - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Annual CTC - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Monthly CTC - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Effective From - Empty */}
                <td className="px-3 md:px-4 py-1"></td>

                {/* Status Filter */}
                <td className="px-3 md:px-4 py-1">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="approved">Approved</option>
                    <option value="pending_approval">Pending</option>
                    <option value="draft">Draft</option>
                  </select>
                </td>

                {/* Actions Column - Clear Button */}
                <td className="px-3 md:px-4 py-1 text-center">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                    title="Clear All Filters"
                  >
                    <X className="w-2.5 h-2.5 md:w-3 md:h-3 mr-0.5" />
                    Clear
                  </button>
                </td>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 text-sm mt-2">
                      Loading CTC configurations...
                    </p>
                  </td>
                </tr>
              ) : filteredConfigurations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 md:px-4 py-8 text-center">
                    <IndianRupee className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm md:text-lg font-medium">
                      No CTC Configurations
                    </p>
                    <p className="text-gray-500 text-xs md:text-sm mt-2">
                      {searchTerm
                        ? "Try a different search term"
                        : "Start by assigning CTC structures"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredConfigurations.map((config) => {
                  const isSelected = selectedItems.has(config.id);
                  return (
                    <tr
                      key={config.id}
                      className={`hover:bg-gray-50 transition ${isSelected ? "bg-blue-50" : ""}`}
                    >
                      <td className="px-3 md:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(config.id)}
                          className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#C62828] border-gray-300 rounded focus:ring-[#C62828]"
                        />
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <div>
                          <p className="text-xs md:text-sm font-medium text-gray-800">
                            {config.employee.name}
                          </p>
                          <p className="text-[10px] md:text-xs text-gray-500">
                            {config.employee.code} • {config.employee.job_title}
                          </p>
                        </div>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge variant="info" className="text-xs">
                          {config.template_name}
                        </Badge>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-green-600">
                          ₹{config.annual_ctc.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm font-medium text-blue-600">
                          ₹{config.monthly_ctc.toLocaleString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <p className="text-xs md:text-sm text-gray-700">
                          {new Date(config.effective_from).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-3 md:px-4 py-3">
                        <Badge
                          variant={getStatusColor(config.status)}
                          className="text-xs"
                        >
                          {config.status.replace("_", " ")}
                        </Badge>
                      </td>

                      <td className="px-3 md:px-4 py-3 relative menu-container">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === config.id ? null : config.id,
                            )
                          }
                          className="p-1.5 md:p-2 hover:bg-gray-100 rounded transition"
                        >
                          <MoreVertical className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-600" />
                        </button>

                        {openMenuId === config.id && (
                          <div className="absolute right-4 bottom-10 z-50 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <ul className="py-1 text-sm text-gray-700">
                              <li>
                                <button
                                  onClick={() => {
                                    handleViewConfig(config);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-left"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                              </li>

                              <hr className="my-1" />

                              <li>
                                <button
                                  onClick={() => {
                                    handleDeleteConfig(config.id);
                                    setOpenMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL MODALS WITH NEW STYLING MATCHING LEAVE FORM */}

      {/* Manage Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowTemplateModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header with Leave Form Theme */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Manage CTC Templates
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Create and manage CTC templates for employees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Available Templates ({templates.length})
                  </h3>
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      setShowCreateTemplateModal(true);
                    }}
                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-md hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    New Template
                  </button>
                </div>

                <div className="space-y-3">
                  {templates.map((template) => (
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
                            {template.is_default && (
                              <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                                Default
                              </span>
                            )}
                            <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                              {template.template_type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">
                            {template.description}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {template.components.length} components
                          </p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleViewTemplate(template)}
                            className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                          >
                            <Eye className="h-3 w-3" />
                            View
                          </button>
                          {!template.is_default && (
                            <button
                              onClick={() => handleEditTemplate(template)}
                              className="px-2 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 transition-colors flex items-center gap-1"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowCreateTemplateModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Create CTC Template
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Define a new CTC structure template
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateTemplateModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateTemplate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className=" text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, name: e.target.value })
                    }
                    placeholder="e.g., Marketing Team Structure"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className=" text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of the template"
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    rows={2}
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Components ({templateForm.components.length})
                    </h3>
                    <span
                      className={`text-sm font-medium ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}
                    >
                      Total: {totalPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 mb-3 items-end">
                    <div className="col-span-4">
                      <input
                        placeholder="Component name"
                        value={newComponent.name}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={newComponent.type}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            type: e.target.value as "earning" | "deduction",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      >
                        <option value="earning">Earning</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="%"
                        value={newComponent.percentage}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            percentage: e.target.value,
                          })
                        }
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <label className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={newComponent.is_taxable}
                          onChange={(e) =>
                            setNewComponent({
                              ...newComponent,
                              is_taxable: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        Taxable
                      </label>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleAddComponent();
                          setSelectedCtcComponentIndex(null);
                        }}
                        className="w-full px-3 py-2 text-sm bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {templateForm.components.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {templateForm.components.map((comp, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium text-slate-900 w-32">
                              {comp.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${comp.type === "earning" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {comp.type}
                            </span>
                            <span className="text-sm text-slate-600">
                              {comp.percentage}%
                            </span>
                            <span className="text-xs text-slate-500">
                              {comp.is_taxable ? "Taxable" : "Non-taxable"}
                            </span>
                          </div>
                          <div className="space-x-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedCtcComponentIndex(index);
                                setNewComponent({
                                  name: comp.name,
                                  type: comp.type,
                                  percentage: String(comp.percentage),
                                  is_taxable: comp.is_taxable,
                                });
                              }}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveComponent(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {totalPercentage !== 100 &&
                  templateForm.components.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-sm text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Total percentage must equal 100%. Currently:{" "}
                        {totalPercentage}%
                      </p>
                    </div>
                  )}
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreateTemplateModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateTemplate}
                disabled={
                  templateForm.components.length === 0 ||
                  totalPercentage !== 100
                }
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Create Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {showViewTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowViewTemplateModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Template Details
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    View CTC template structure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
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
                            {comp.percentage}%
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

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowViewTemplateModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowEditTemplateModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Edit Template
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Update CTC template structure
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowEditTemplateModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleUpdateTemplate();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Template Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#C62828]" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    rows={2}
                  />
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">
                      Components
                    </h3>
                    <span
                      className={`text-sm font-medium ${totalPercentage === 100 ? "text-green-600" : "text-red-600"}`}
                    >
                      Total: {totalPercentage}%
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-2 mb-3 items-end">
                    <div className="col-span-4">
                      <input
                        placeholder="Component name"
                        value={newComponent.name}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                    <div className="col-span-2">
                      <select
                        value={newComponent.type}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            type: e.target.value as "earning" | "deduction",
                          })
                        }
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      >
                        <option value="earning">Earning</option>
                        <option value="deduction">Deduction</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        placeholder="%"
                        value={newComponent.percentage}
                        onChange={(e) =>
                          setNewComponent({
                            ...newComponent,
                            percentage: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                      />
                    </div>
                    <div className="col-span-2 flex items-center">
                      <label className="flex items-center text-sm text-gray-700">
                        <input
                          type="checkbox"
                          checked={newComponent.is_taxable}
                          onChange={(e) =>
                            setNewComponent({
                              ...newComponent,
                              is_taxable: e.target.checked,
                            })
                          }
                          className="mr-2"
                        />
                        Taxable
                      </label>
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddComponent}
                        className="w-full px-3 py-2 text-sm bg-gradient-to-r from-[#C62828] to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add
                      </button>
                    </div>
                  </div>

                  {templateForm.components.length > 0 && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {templateForm.components.map((comp, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <span className="text-sm font-medium text-slate-900 w-32">
                              {comp.name}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded ${comp.type === "earning" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                            >
                              {comp.type}
                            </span>
                            <span className="text-sm text-slate-600">
                              {comp.percentage}%
                            </span>
                            <span className="text-xs text-slate-500">
                              {comp.is_taxable ? "Taxable" : "Non-taxable"}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditTemplateModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTemplate}
                disabled={
                  templateForm.components.length === 0 ||
                  totalPercentage !== 100
                }
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Update Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign CTC Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowConfigModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Assign CTC to Employee
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    Configure salary structure for employees
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAssignCTC();
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C62828]" />
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Users className="w-4 h-4" />
                    </div>
                    <select
                      value={configForm.employee_id}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          employee_id: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                      disabled={employeesLoading}
                    >
                      <option value="">
                        {employeesLoading
                          ? "Loading employees..."
                          : "Choose an employee..."}
                      </option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.code}) - {emp.job_title}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {employees.length === 0 && !employeesLoading && (
                    <p className="text-xs text-red-600 mt-1">
                      No employees found. Please add employees first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#C62828]" />
                    Select CTC Template <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Settings className="w-4 h-4" />
                    </div>
                    <select
                      value={configForm.template_id}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          template_id: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300 appearance-none"
                    >
                      <option value="">Choose a template...</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#C62828]" />
                    Annual CTC (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      placeholder="Enter annual CTC"
                      value={configForm.annual_ctc}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          annual_ctc: e.target.value,
                        })
                      }
                      min="0"
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C62828]" />
                    Effective From <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={configForm.effective_from}
                      onChange={(e) =>
                        setConfigForm({
                          ...configForm,
                          effective_from: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none transition-all duration-200 hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Important Notes */}
                <div className="border-2 border-yellow-200 rounded-xl overflow-hidden bg-gradient-to-b from-yellow-50 to-white">
                  <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 px-4 py-3 border-b border-yellow-200">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <div className="p-1.5 bg-yellow-500/10 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                      </div>
                      Important Information
                    </h3>
                  </div>
                  <div className="p-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          The CTC will be automatically broken down into
                          components based on the selected template
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          Monthly CTC will be calculated as Annual CTC / 12
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          You can edit individual component amounts after
                          assignment
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignCTC}
                disabled={
                  !configForm.employee_id ||
                  !configForm.template_id ||
                  !configForm.annual_ctc ||
                  parseFloat(configForm.annual_ctc) <= 0 ||
                  employeesLoading
                }
                className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2.5 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Assign CTC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Config Modal */}
      {showViewConfigModal && selectedConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setShowViewConfigModal(false)}
          />

          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-3xl border border-gray-200 overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center border-b border-gray-700/30 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    CTC Configuration Details
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    View complete salary breakdown
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowViewConfigModal(false)}
                className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Employee</p>
                    <p className="font-medium text-slate-900">
                      {selectedConfig.employee.name}
                    </p>
                    <p className="text-xs text-slate-600">
                      {selectedConfig.employee.code} •{" "}
                      {selectedConfig.employee.job_title}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Template</p>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedConfig.template_name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Annual CTC</p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{selectedConfig.annual_ctc.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Monthly CTC</p>
                    <p className="text-xl font-bold text-blue-600">
                      ₹{selectedConfig.monthly_ctc.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Status</p>
                    <span
                      className={`text-sm px-2 py-1 rounded ${
                        selectedConfig.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedConfig.status === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : selectedConfig.status === "pending_approval"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {selectedConfig.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Effective From</p>
                  <p className="font-medium text-slate-900">
                    {new Date(
                      selectedConfig.effective_from,
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Component Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedConfig.components.map((comp) => (
                      <div key={comp.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
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
                          <span className="text-sm font-medium text-slate-600">
                            {comp.percentage}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Annual: </span>
                            <span className="font-medium text-slate-900">
                              ₹{comp.annual_amount.toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-600">Monthly: </span>
                            <span className="font-medium text-slate-900">
                              ₹
                              {Math.round(comp.monthly_amount).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 p-4 flex justify-end">
              <button
                onClick={() => setShowViewConfigModal(false)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700 hover:text-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
