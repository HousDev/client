import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, Settings, Users, DollarSign, CheckCircle, Clock, Edit, Eye, X, Trash2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';

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
  status: 'draft' | 'pending_approval' | 'approved' | 'active';
  components: CTCComponent[];
}

interface CTCComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  percentage: number;
  annual_amount: number;
  monthly_amount: number;
  is_taxable: boolean;
}

interface CTCTemplate {
  id: string;
  name: string;
  description: string;
  template_type: 'standard' | 'custom';
  is_default: boolean;
  components: TemplateComponent[];
}

interface TemplateComponent {
  name: string;
  type: 'earning' | 'deduction';
  percentage: number;
  is_taxable: boolean;
}

const mockEmployees: Employee[] = [
  { id: 'EMP001', name: 'Rajesh Kumar', code: 'EMP001', job_title: 'Senior Developer', department: 'IT', branch: 'Mumbai', status: 'active' },
  { id: 'EMP002', name: 'Priya Sharma', code: 'EMP002', job_title: 'Sales Manager', department: 'Sales', branch: 'Delhi', status: 'active' },
  { id: 'EMP003', name: 'Amit Patel', code: 'EMP003', job_title: 'Project Manager', department: 'IT', branch: 'Bangalore', status: 'active' },
];

const initialTemplates: CTCTemplate[] = [
  {
    id: '1',
    name: 'IT Industry Standard',
    description: 'Standard CTC structure for IT professionals',
    template_type: 'standard',
    is_default: true,
    components: [
      { name: 'Basic Salary', type: 'earning', percentage: 40, is_taxable: true },
      { name: 'HRA', type: 'earning', percentage: 20, is_taxable: true },
      { name: 'Special Allowance', type: 'earning', percentage: 25, is_taxable: true },
      { name: 'PF Contribution', type: 'earning', percentage: 5, is_taxable: false },
      { name: 'Professional Tax', type: 'deduction', percentage: 2, is_taxable: false },
      { name: 'TDS', type: 'deduction', percentage: 8, is_taxable: false }
    ]
  },
  {
    id: '2',
    name: 'Sales Team Structure',
    description: 'Performance-based structure for sales team',
    template_type: 'standard',
    is_default: false,
    components: [
      { name: 'Basic Salary', type: 'earning', percentage: 35, is_taxable: true },
      { name: 'HRA', type: 'earning', percentage: 15, is_taxable: true },
      { name: 'Commission', type: 'earning', percentage: 30, is_taxable: true },
      { name: 'Travel Allowance', type: 'earning', percentage: 10, is_taxable: false },
      { name: 'Professional Tax', type: 'deduction', percentage: 2, is_taxable: false },
      { name: 'TDS', type: 'deduction', percentage: 8, is_taxable: false }
    ]
  },
  {
    id: '3',
    name: 'Senior Management',
    description: 'Executive compensation structure',
    template_type: 'standard',
    is_default: false,
    components: [
      { name: 'Basic Salary', type: 'earning', percentage: 45, is_taxable: true },
      { name: 'HRA', type: 'earning', percentage: 25, is_taxable: true },
      { name: 'Performance Bonus', type: 'earning', percentage: 15, is_taxable: true },
      { name: 'Car Allowance', type: 'earning', percentage: 5, is_taxable: false },
      { name: 'Professional Tax', type: 'deduction', percentage: 2, is_taxable: false },
      { name: 'TDS', type: 'deduction', percentage: 8, is_taxable: false }
    ]
  }
];

export default function CTCConfiguration() {
  const [configurations, setConfigurations] = useState<CTCConfig[]>([]);
  const [templates, setTemplates] = useState<CTCTemplate[]>(initialTemplates);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showViewTemplateModal, setShowViewTemplateModal] = useState(false);
  const [showEditTemplateModal, setShowEditTemplateModal] = useState(false);
  const [showViewConfigModal, setShowViewConfigModal] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState<CTCTemplate | null>(null);
  const [selectedConfig, setSelectedConfig] = useState<CTCConfig | null>(null);

  const [configForm, setConfigForm] = useState({
    employee_id: '',
    template_id: '',
    annual_ctc: '',
    effective_from: new Date().toISOString().split('T')[0]
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    template_type: 'custom' as 'standard' | 'custom',
    components: [] as TemplateComponent[]
  });

  const [newComponent, setNewComponent] = useState({
    name: '',
    type: 'earning' as 'earning' | 'deduction',
    percentage: '',
    is_taxable: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignCTC = () => {
    const employee = mockEmployees.find(e => e.id === configForm.employee_id);
    const template = templates.find(t => t.id === configForm.template_id);

    if (!employee || !template || !configForm.annual_ctc || parseFloat(configForm.annual_ctc) <= 0) {
      alert('Please fill all required fields');
      return;
    }

    const annualCTC = parseFloat(configForm.annual_ctc);
    const monthlyCTC = annualCTC / 12;

    const components: CTCComponent[] = template.components.map((comp, index) => ({
      id: `COMP${Date.now()}_${index}`,
      name: comp.name,
      type: comp.type,
      percentage: comp.percentage,
      annual_amount: (annualCTC * comp.percentage) / 100,
      monthly_amount: (monthlyCTC * comp.percentage) / 100,
      is_taxable: comp.is_taxable
    }));

    const newConfig: CTCConfig = {
      id: `CTC${Date.now()}`,
      employee,
      annual_ctc: annualCTC,
      monthly_ctc: monthlyCTC,
      template_name: template.name,
      effective_from: configForm.effective_from,
      status: 'active',
      components
    };

    setConfigurations([newConfig, ...configurations]);
    setShowConfigModal(false);
    setConfigForm({
      employee_id: '',
      template_id: '',
      annual_ctc: '',
      effective_from: new Date().toISOString().split('T')[0]
    });
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name || !templateForm.description || templateForm.components.length === 0) {
      alert('Please fill all required fields and add at least one component');
      return;
    }

    const totalPercentage = templateForm.components.reduce((sum, comp) => sum + comp.percentage, 0);
    if (totalPercentage !== 100) {
      alert(`Total percentage must be 100%. Current: ${totalPercentage}%`);
      return;
    }

    const newTemplate: CTCTemplate = {
      id: `TMPL${Date.now()}`,
      name: templateForm.name,
      description: templateForm.description,
      template_type: templateForm.template_type,
      is_default: false,
      components: templateForm.components
    };

    setTemplates([...templates, newTemplate]);
    setShowCreateTemplateModal(false);
    setTemplateForm({
      name: '',
      description: '',
      template_type: 'custom',
      components: []
    });
  };

  const handleAddComponent = () => {
    if (!newComponent.name || !newComponent.percentage || parseFloat(newComponent.percentage) <= 0) {
      alert('Please fill all component fields');
      return;
    }

    const component: TemplateComponent = {
      name: newComponent.name,
      type: newComponent.type,
      percentage: parseFloat(newComponent.percentage),
      is_taxable: newComponent.is_taxable
    };

    setTemplateForm({
      ...templateForm,
      components: [...templateForm.components, component]
    });

    setNewComponent({
      name: '',
      type: 'earning',
      percentage: '',
      is_taxable: true
    });
  };

  const handleRemoveComponent = (index: number) => {
    setTemplateForm({
      ...templateForm,
      components: templateForm.components.filter((_, i) => i !== index)
    });
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
      components: [...template.components]
    });
    setShowEditTemplateModal(true);
  };

  const handleUpdateTemplate = () => {
    if (!selectedTemplate) return;

    if (!templateForm.name || !templateForm.description || templateForm.components.length === 0) {
      alert('Please fill all required fields');
      return;
    }

    const totalPercentage = templateForm.components.reduce((sum, comp) => sum + comp.percentage, 0);
    if (totalPercentage !== 100) {
      alert(`Total percentage must be 100%. Current: ${totalPercentage}%`);
      return;
    }

    setTemplates(templates.map(t =>
      t.id === selectedTemplate.id
        ? { ...t, ...templateForm }
        : t
    ));

    setShowEditTemplateModal(false);
    setSelectedTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      template_type: 'custom',
      components: []
    });
  };

  const handleViewConfig = (config: CTCConfig) => {
    setSelectedConfig(config);
    setShowViewConfigModal(true);
  };

  const stats = {
    total: configurations.length,
    active: configurations.filter(c => c.status === 'active').length,
    pending: configurations.filter(c => c.status === 'pending_approval').length,
    draft: configurations.filter(c => c.status === 'draft').length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'approved':
        return 'info';
      case 'pending_approval':
        return 'warning';
      case 'draft':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.employee.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || config.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPercentage = templateForm.components.reduce((sum, comp) => sum + comp.percentage, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CTC Configuration</h1>
          <p className="text-slate-600 mt-1">Manage employee Cost to Company structures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowTemplateModal(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Manage Templates
          </Button>
          <Button onClick={() => setShowConfigModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Assign CTC
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Configurations</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Approval</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Templates</p>
              <p className="text-3xl font-bold text-slate-600 mt-2">{templates.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-slate-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by employee name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="approved">Approved</option>
                <option value="pending_approval">Pending Approval</option>
                <option value="draft">Draft</option>
              </select>
              <Button variant="secondary" className="text-sm h-9">
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-slate-600">Loading CTC configurations...</div>
        ) : filteredConfigurations.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No CTC Configurations</h3>
            <p className="text-slate-600 mb-4">Start by assigning CTC structures to employees.</p>
            <Button onClick={() => setShowConfigModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Assign CTC
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Template</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Annual CTC</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Monthly CTC</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Effective From</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-900 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConfigurations.map((config) => (
                  <tr key={config.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{config.employee.name}</p>
                        <p className="text-xs text-slate-600">{config.employee.code} • {config.employee.job_title}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="info">{config.template_name}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-slate-900">₹{config.annual_ctc.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-medium text-slate-900">₹{config.monthly_ctc.toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{new Date(config.effective_from).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusColor(config.status)}>
                        {config.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewConfig(config)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manage Templates Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Manage CTC Templates</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-semibold text-slate-900">Available Templates ({templates.length})</h3>
                <Button size="sm" onClick={() => {
                  setShowTemplateModal(false);
                  setShowCreateTemplateModal(true);
                }}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Template
                </Button>
              </div>

              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="p-4 hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-slate-900">{template.name}</h4>
                          {template.is_default && (
                            <Badge variant="success" className="text-xs">Default</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">{template.template_type}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{template.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{template.components.length} components</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => handleViewTemplate(template)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {!template.is_default && (
                          <Button size="sm" variant="secondary" onClick={() => handleEditTemplate(template)}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowTemplateModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Create New Template</h2>
              <button onClick={() => setShowCreateTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Template Name *</label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g., Marketing Team Structure"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Brief description of the template"
                />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Components ({templateForm.components.length})</h3>
                  <span className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: {totalPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 mb-3 items-end">
                  <div className="col-span-3">
                    <Input
                      placeholder="Component name"
                      value={newComponent.name}
                      onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={newComponent.type}
                      onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as 'earning' | 'deduction' })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="earning">Earning</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="%"
                      value={newComponent.percentage}
                      onChange={(e) => setNewComponent({ ...newComponent, percentage: e.target.value })}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={newComponent.is_taxable}
                        onChange={(e) => setNewComponent({ ...newComponent, is_taxable: e.target.checked })}
                        className="mr-2"
                      />
                      Taxable
                    </label>
                  </div>
                  <div className="col-span-3">
                    <Button size="sm" onClick={handleAddComponent} className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {templateForm.components.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {templateForm.components.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="font-medium text-slate-900 w-32">{comp.name}</span>
                          <Badge variant={comp.type === 'earning' ? 'success' : 'warning'} className="text-xs">
                            {comp.type}
                          </Badge>
                          <span className="text-sm text-slate-600">{comp.percentage}%</span>
                          <span className="text-xs text-slate-500">{comp.is_taxable ? 'Taxable' : 'Non-taxable'}</span>
                        </div>
                        <button
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

              {totalPercentage !== 100 && templateForm.components.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    Total percentage must equal 100%. Currently: {totalPercentage}%
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
              <Button variant="secondary" onClick={() => setShowCreateTemplateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>
                Create Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {showViewTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Template Details</h2>
              <button onClick={() => setShowViewTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">{selectedTemplate.name}</h3>
                  {selectedTemplate.is_default && (
                    <Badge variant="success">Default</Badge>
                  )}
                </div>
                <p className="text-slate-600">{selectedTemplate.description}</p>
                <p className="text-sm text-slate-500 mt-1">Type: {selectedTemplate.template_type}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Components Breakdown</h4>
                <div className="space-y-2">
                  {selectedTemplate.components.map((comp, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-slate-900">{comp.name}</span>
                        <Badge variant={comp.type === 'earning' ? 'success' : 'warning'}>
                          {comp.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-slate-700">{comp.percentage}%</span>
                        <span className="text-xs text-slate-500">{comp.is_taxable ? 'Taxable' : 'Non-taxable'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowViewTemplateModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {showEditTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Edit Template</h2>
              <button onClick={() => setShowEditTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Template Name *</label>
                <Input
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div className="border-t border-slate-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">Components</h3>
                  <span className={`text-sm font-medium ${totalPercentage === 100 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: {totalPercentage}%
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-2 mb-3 items-end">
                  <div className="col-span-3">
                    <Input
                      placeholder="Component name"
                      value={newComponent.name}
                      onChange={(e) => setNewComponent({ ...newComponent, name: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      value={newComponent.type}
                      onChange={(e) => setNewComponent({ ...newComponent, type: e.target.value as 'earning' | 'deduction' })}
                      className="w-full px-2 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="earning">Earning</option>
                      <option value="deduction">Deduction</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="%"
                      value={newComponent.percentage}
                      onChange={(e) => setNewComponent({ ...newComponent, percentage: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 flex items-center">
                    <label className="flex items-center text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={newComponent.is_taxable}
                        onChange={(e) => setNewComponent({ ...newComponent, is_taxable: e.target.checked })}
                        className="mr-2"
                      />
                      Taxable
                    </label>
                  </div>
                  <div className="col-span-3">
                    <Button size="sm" onClick={handleAddComponent} className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>

                {templateForm.components.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {templateForm.components.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-4 flex-1">
                          <span className="font-medium text-slate-900 w-32">{comp.name}</span>
                          <Badge variant={comp.type === 'earning' ? 'success' : 'warning'} className="text-xs">
                            {comp.type}
                          </Badge>
                          <span className="text-sm text-slate-600">{comp.percentage}%</span>
                          <span className="text-xs text-slate-500">{comp.is_taxable ? 'Taxable' : 'Non-taxable'}</span>
                        </div>
                        <button
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
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end bg-slate-50">
              <Button variant="secondary" onClick={() => setShowEditTemplateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTemplate}>
                Update Template
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign CTC Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Assign CTC to Employee</h2>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Employee *</label>
                <select
                  value={configForm.employee_id}
                  onChange={(e) => setConfigForm({ ...configForm, employee_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an employee...</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.code}) - {emp.job_title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select CTC Template *</label>
                <select
                  value={configForm.template_id}
                  onChange={(e) => setConfigForm({ ...configForm, template_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a template...</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>{template.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Annual CTC (₹) *</label>
                <Input
                  type="number"
                  placeholder="Enter annual CTC"
                  value={configForm.annual_ctc}
                  onChange={(e) => setConfigForm({ ...configForm, annual_ctc: e.target.value })}
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Effective From *</label>
                <Input
                  type="date"
                  value={configForm.effective_from}
                  onChange={(e) => setConfigForm({ ...configForm, effective_from: e.target.value })}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700">
                  The CTC will be automatically broken down into components based on the selected template.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowConfigModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignCTC}>
                Assign CTC
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Config Modal */}
      {showViewConfigModal && selectedConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-slate-200 p-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">CTC Configuration Details</h2>
              <button onClick={() => setShowViewConfigModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Employee</p>
                  <p className="font-medium text-slate-900">{selectedConfig.employee.name}</p>
                  <p className="text-xs text-slate-600">{selectedConfig.employee.code} • {selectedConfig.employee.job_title}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Template</p>
                  <Badge variant="info">{selectedConfig.template_name}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Annual CTC</p>
                  <p className="text-xl font-bold text-green-600">₹{selectedConfig.annual_ctc.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Monthly CTC</p>
                  <p className="text-xl font-bold text-blue-600">₹{selectedConfig.monthly_ctc.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <Badge variant={getStatusColor(selectedConfig.status)}>
                    {selectedConfig.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-600 mb-1">Effective From</p>
                <p className="font-medium text-slate-900">{new Date(selectedConfig.effective_from).toLocaleDateString()}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Component Breakdown</h4>
                <div className="space-y-2">
                  {selectedConfig.components.map((comp) => (
                    <div key={comp.id} className="p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-slate-900">{comp.name}</span>
                          <Badge variant={comp.type === 'earning' ? 'success' : 'warning'}>
                            {comp.type}
                          </Badge>
                        </div>
                        <span className="text-sm font-medium text-slate-600">{comp.percentage}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-600">Annual: </span>
                          <span className="font-medium text-slate-900">₹{comp.annual_amount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-600">Monthly: </span>
                          <span className="font-medium text-slate-900">₹{Math.round(comp.monthly_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 p-4 flex justify-end">
              <Button variant="secondary" onClick={() => setShowViewConfigModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
