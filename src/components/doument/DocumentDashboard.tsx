import { useState, useEffect } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import {
  FileText,
  Plus,
  Search,
  Download,
  Upload,
  Eye,
  X,
  Tag,
  User,
  Users,
  Building2,
  Check,
  Loader2,
  Trash2,
} from "lucide-react";
import Modal from "../../components/ui/Modal";
import {
  DocumentTemplatesApi,
  DocumentTemplate,
} from "../../lib/DocumentTemplatesApi";
import HrmsEmployeesApi, { HrmsEmployee } from "../../lib/employeeApi";
import {
  GeneratedDocumentsApi,
  GeneratedDocument,
} from "../../lib/generatedDocumentsApi";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";

const DocumentDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploading, setUploading] = useState(false);

  // Document templates state
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [generatedDocuments, setGeneratedDocuments] = useState<any[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Document generation states
  const [selectedDocumentType, setSelectedDocumentType] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchEmployee, setSearchEmployee] = useState("");
  const [employees, setEmployees] = useState<HrmsEmployee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

  // View document modal state
  const [viewDocument, setViewDocument] = useState<any>(null);

  // Fetch templates and saved documents on mount
  useEffect(() => {
    fetchTemplates();
    fetchEmployees();
    fetchSavedDocuments();
  }, []);

  const fetchTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const response = await DocumentTemplatesApi.getTemplates();
      const activeTemplates = response.filter(
        (t: DocumentTemplate) => t.is_active === 1,
      );
      console.log(response);
      setTemplates(activeTemplates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      const employeesData = await HrmsEmployeesApi.getEmployees();
      const activeEmployees = employeesData.filter(
        (emp: HrmsEmployee) => emp.employee_status === "active",
      );
      setEmployees(activeEmployees);
    } catch (error: any) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees");
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchSavedDocuments = async () => {
    console.log("Save produt");
    setLoadingDocuments(true);
    try {
      const savedDocs = await GeneratedDocumentsApi.getDocuments();
      const formattedDocs = savedDocs.map((doc: GeneratedDocument) => ({
        id: doc.id,
        name: `${doc.doc_type} - ${doc.employee_name}`,
        type: doc.doc_type,
        employee: doc.employee_name || "",
        employeeId: doc.employee_id,
        size: `${Math.round((doc.html_content?.length || 0) / 1024)} KB`,
        uploaded: new Date(doc.created_at).toISOString().split("T")[0],
        status: "active",
        content: doc.html_content,
      }));
      setGeneratedDocuments(formattedDocs);
    } catch (error: any) {
      console.error("Error loading saved documents:", error);
      // Don't show error toast for this, just log
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Get template by category
  const getTemplateByCategory = (category: string) => {
    return templates.find((t) => t.category === category);
  };

  // Helper function to safely get value with fallback
  const safeGet = (value: any, fallback: string = ""): string => {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
  };

  // Replace variables in template with employee data (returns HTML with actual values)
  const replaceVariables = (
    htmlContent: string,
    employee: HrmsEmployee,
    template: DocumentTemplate,
  ): string => {
    let result = htmlContent;

    // Get current date
    const currentDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Calculate salary components (only if salary exists)
    let annualSalary = 0;
    let monthlySalary = 0;
    let basicSalary = 0;
    let hra = 0;
    let allowances = 0;
    let pf = 0;
    let totalDeductions = 0;
    let totalEarnings = 0;
    let netSalary = 0;
    let formattedSalary = "";
    let salaryAnnual = "";
    let salaryMonthly = "";

    if (employee.salary && parseFloat(employee.salary.toString()) > 0) {
      annualSalary = parseFloat(employee.salary.toString());
      monthlySalary = annualSalary / 12;
      const salaryType = employee.salary_type || "yearly";

      if (salaryType === "yearly") {
        if (annualSalary >= 100000) {
          formattedSalary = `₹${(annualSalary / 100000).toFixed(2)} Lakhs per annum`;
        } else {
          formattedSalary = `₹${annualSalary.toLocaleString()} per annum`;
        }
      } else if (salaryType === "monthly") {
        formattedSalary = `₹${Math.round(monthlySalary).toLocaleString()} per month`;
      } else {
        formattedSalary = `₹${annualSalary.toLocaleString()}`;
      }
      salaryAnnual = `₹${annualSalary.toLocaleString()}`;
      salaryMonthly = `₹${Math.round(monthlySalary).toLocaleString()}`;

      basicSalary = monthlySalary * 0.4;
      hra = monthlySalary * 0.2;
      allowances = monthlySalary * 0.15;
      pf = monthlySalary * 0.12;
      totalDeductions = pf + 200 + 500;
      totalEarnings = basicSalary + hra + allowances;
      netSalary = totalEarnings - totalDeductions;
    }

    // Get logo URL
    const logoUrl = template.logo_url
      ? `${import.meta.env.VITE_API_URL}/uploads/${template.logo_url}`
      : "";

    // Common variables
    const commonVariables: Record<string, string> = {
      company_logo: logoUrl,
      company_name: "Nayash Group",
      company_address: "Mumbai, Maharashtra, India",
      current_date: currentDate,
      hr_name: "HR Department",
      hr_designation: "HR Manager",
    };

    // Employee variables
    const employeeVariables: Record<string, string> = {
      employee_name:
        `${safeGet(employee.first_name)} ${safeGet(employee.last_name)}`.trim(),
      employee_id: safeGet(
        employee.employee_code,
        `EMP${String(employee.id).padStart(4, "0")}`,
      ),
      employee_email: employee.email || "",
      employee_phone: employee.phone || "",
      employee_address:
        employee.current_address ||
        employee.permanent_address ||
        "Pune, Maharashtra, India",
      designation: employee.designation || "",
      department: employee.department_name || "IT Department",
      joining_date: employee.joining_date || "",
      work_location:
        employee.work_mode === "office"
          ? employee.city || "Mumbai Office"
          : "Remote",
      probation_period: employee.probation_period || "6 months",
      manager_name: "Kamlesh Shaha",
      last_working_date:
        employee.date_of_leaving ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      salary_month: new Date().toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };

    // Salary Details
    if (employee.salary && parseFloat(employee.salary.toString()) > 0) {
      employeeVariables.salary = formattedSalary;
      employeeVariables.salary_annual = salaryAnnual;
      employeeVariables.salary_monthly = salaryMonthly;
      employeeVariables.basic_salary = `₹${Math.round(basicSalary).toLocaleString()}`;
      employeeVariables.hra = `₹${Math.round(hra).toLocaleString()}`;
      employeeVariables.allowances = `₹${Math.round(allowances).toLocaleString()}`;
      employeeVariables.pf = `₹${Math.round(pf).toLocaleString()}`;
      employeeVariables.net_salary = `₹${Math.round(netSalary).toLocaleString()}`;
      employeeVariables.total_earnings = `₹${Math.round(totalEarnings).toLocaleString()}`;
      employeeVariables.total_deductions = `₹${Math.round(totalDeductions).toLocaleString()}`;
    }

    const allVariables = { ...commonVariables, ...employeeVariables };

    // Replace all {{variable}} with actual values
    Object.entries(allVariables).forEach(([key, value]) => {
      if (value && value !== "") {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        result = result.replace(regex, value);
      }
    });

    // Remove any remaining {{variable}} placeholders
    result = result.replace(/\{\{[a-zA-Z0-9_]+\}\}/g, "");

    return result;
  };

  // Generate and save document for single employee
  const generateAndSaveDocument = async (
    employee: HrmsEmployee,
    template: DocumentTemplate,
  ) => {
    // Replace variables to get HTML with actual values
    const htmlContent = replaceVariables(
      template.html_content,
      employee,
      template,
    );

    // Save to database
    const savedDoc = await GeneratedDocumentsApi.saveDocument({
      employee_id: employee.id,
      doc_type: template.category,
      html_content: htmlContent,
    });

    return {
      id: savedDoc.data.id,
      name: `${template.name} - ${employee.first_name} ${employee.last_name}`,
      type: template.category,
      employee: `${employee.first_name} ${employee.last_name}`,
      employeeId: employee.id,
      employeeCode: employee.employee_code,
      size: `${Math.round(htmlContent.length / 1024)} KB`,
      uploaded: new Date().toISOString().split("T")[0],
      status: "active",
      content: htmlContent,
    };
  };

  // Handle document generation
  const handleGenerate = async () => {
    if (!selectedDocumentType) {
      toast.error("Please select a document type");
      return;
    }
    if (selectedEmployees.length === 0) {
      toast.error("Please select at least one employee");
      return;
    }

    setGenerating(true);
    try {
      const template = getTemplateByCategory(selectedDocumentType);
      if (!template) {
        toast.error(`No active template found for "${selectedDocumentType}"`);
        return;
      }

      const newDocuments: any[] = [];
      for (const employeeName of selectedEmployees) {
        const employee = employees.find(
          (emp) => `${emp.first_name} ${emp.last_name}` === employeeName,
        );
        if (employee) {
          const doc = await generateAndSaveDocument(employee, template);
          newDocuments.push(doc);
        }
      }

      setGeneratedDocuments((prev) => [...newDocuments, ...prev]);
      toast.success(
        `Generated ${newDocuments.length} document(s) successfully!`,
      );

      // Reset form
      setSelectedDocumentType("");
      setSelectedEmployees([]);
      setSearchEmployee("");
      setShowGenerateModal(false);
    } catch (error: any) {
      console.error("Error generating documents:", error);
      toast.error(error.message || "Failed to generate documents");
    } finally {
      setGenerating(false);
    }
  };

  // Handle view document
  const handleViewDocument = (doc: any) => {
    setViewDocument(doc);
  };

  const closeViewModal = () => {
    setViewDocument(null);
  };

  // Handle download as PDF
  const handleDownloadDocument = async (doc: any) => {
    try {
      toast.loading("Generating PDF...");
      const filename = doc.name.replace(/[^\w]/g, "-");

      // Create a temporary element for PDF generation
      const element = document.createElement("div");
      element.innerHTML = doc.content;
      document.body.appendChild(element);

      const opt: any = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();
      document.body.removeChild(element);

      toast.dismiss();
      toast.success("PDF downloaded successfully!");
    } catch (error: any) {
      toast.dismiss();
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
    }
  };

  // Handle delete document
  const handleDeleteDocument = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await GeneratedDocumentsApi.deleteDocument(id);
        setGeneratedDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast.success("Document deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting document:", error);
        toast.error(error.message || "Failed to delete document");
      }
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (!uploadedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setUploading(true);
    try {
      // TODO: Implement file upload API call
      toast.success("Document uploaded successfully!");
      setShowUploadModal(false);
      setUploadedFile(null);
      setUploadedFileName("");
    } catch (error: any) {
      console.error("Error uploading document:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  // Get document types from templates
  console.log("template : ", templates);
  const documentTypesList = templates
    .filter((t) => t.is_active === 1)
    .map((t) => ({
      id: t.category,
      name: t.category,
      description: t.description || `Generate ${t.category}`,
    }));

  const filteredDocuments = generatedDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.employee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(generatedDocuments.map((d) => d.type))];

  const handleEmployeeToggle = (employeeName: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeName)
        ? prev.filter((name) => name !== employeeName)
        : [...prev, employeeName],
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === filteredEmployeesList.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(
        filteredEmployeesList.map(
          (emp) => `${emp.first_name} ${emp.last_name}`,
        ),
      );
    }
  };

  const filteredEmployeesList = employees.filter(
    (emp) =>
      `${emp.first_name} ${emp.last_name}`
        .toLowerCase()
        .includes(searchEmployee.toLowerCase()) ||
      emp.department_name
        ?.toLowerCase()
        .includes(searchEmployee.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchEmployee.toLowerCase()),
  );

  const getDocumentTypeName = (typeId: string) => {
    return documentTypesList.find((t) => t.id === typeId)?.name || typeId;
  };

  // Calculate stats from generated documents
  const totalDocuments = generatedDocuments.length;
  const totalEmployees = new Set(generatedDocuments.map((d) => d.employeeId))
    .size;
  const todayGenerated = generatedDocuments.filter(
    (d) => d.uploaded === new Date().toISOString().split("T")[0],
  ).length;
  const offerLetters = generatedDocuments.filter(
    (d) => d.type === "Offer Letter",
  ).length;
  const experienceLetters = generatedDocuments.filter(
    (d) => d.type === "Experience Letter",
  ).length;
  const paySlips = generatedDocuments.filter(
    (d) => d.type === "Pay Slip",
  ).length;

  return (
    <div className="space-y-3">
      <div className="space-y-2 top-36 sticky">
        <div className="flex items-center justify-end">
          <div className="flex gap-2">
            <Button
              className="py-2 text-sm"
              onClick={() => setShowGenerateModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Document
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {totalDocuments}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Generated documents
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Templates</p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {templates.filter((t) => t.is_active === 1).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Available templates
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Employees</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {
                    employees.filter((e) => e.employee_status === "active")
                      .length
                  }
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Available for documents
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Generated This Month</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {todayGenerated}
                </p>
                <p className="text-xs text-slate-500 mt-1">New documents</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <div className="p-3 border-b border-slate-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-64 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border border-gray-300 w-[30vw] py-1 rounded-lg outline-none focus:border-red-500"
                />
              </div>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-1 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-auto max-h-[280px] relative p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loadingDocuments ? (
              <div className="col-span-full flex flex-col items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading documents...
                </p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                No documents found. Generate documents using the "Generate
                Document" button.
              </div>
            ) : (
              filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="group bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition"
                >
                  {/* 🔹 Document Preview */}
                  <div className="h-40 overflow-hidden bg-slate-50 border-b">
                    <div className="scale-[0.65] origin-top-left w-[155%] h-[155%]">
                      <iframe
                        srcDoc={doc.content}
                        title="preview"
                        className="w-full h-full border-0"
                      />
                    </div>
                  </div>

                  {/* 🔹 Content */}
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm line-clamp-1">
                            {doc.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {doc.employee}
                          </p>
                        </div>
                      </div>

                      <Badge variant="success">{doc.status}</Badge>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Type</span>
                        <span className="font-medium text-slate-600">
                          {doc.type}
                        </span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Format</span>
                        <span className="font-medium text-slate-600">PDF</span>
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Generated</span>
                        <span className="font-medium text-slate-600">
                          {doc.uploaded}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Preview"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Download PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* View Document Modal */}
      {viewDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center rounded-t-2xl border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      {viewDocument.name}
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5">
                      Generated on {viewDocument.uploaded}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadDocument(viewDocument)}
                    className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closeViewModal}
                    className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[calc(100vh-180px)] overflow-y-auto bg-gray-100">
                <div
                  className="bg-white shadow-lg mx-auto p-8"
                  dangerouslySetInnerHTML={{ __html: viewDocument.content }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        size="md"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Upload Document
          </h2>
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={() => document.getElementById("fileInput")?.click()}
            >
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="font-medium text-slate-900">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-slate-600 mt-1">
                PDF, DOC, DOCX up to 10MB
              </p>
              <input
                id="fileInput"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setUploadedFile(e.target.files[0]);
                    setUploadedFileName(e.target.files[0].name);
                  }
                }}
              />
            </div>
            {uploadedFile && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-700">
                  Selected: {uploadedFileName}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                placeholder="Document title"
                value={uploadedFileName}
                onChange={(e) => setUploadedFileName(e.target.value)}
              />
              <select className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900">
                <option>Contract</option>
                <option>Payslip</option>
                <option>Form</option>
                <option>Tax</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={uploading}>
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Generate Document Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8">
            <div className="relative">
              <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-6 py-4 flex justify-between items-center rounded-t-2xl border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">
                      Generate Document
                    </h2>
                    <p className="text-xs text-white/80 mt-0.5">
                      Create new documents for employees
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    setSelectedDocumentType("");
                    setSelectedEmployees([]);
                    setSearchEmployee("");
                  }}
                  className="text-white hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                {/* Document Type Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span>Document Type</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-600 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={selectedDocumentType}
                      onChange={(e) => setSelectedDocumentType(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50"
                      disabled={loadingTemplates}
                    >
                      <option value="">Select document type</option>
                      {documentTypesList.map((docType) => (
                        <option key={docType.id} value={docType.id}>
                          {docType.name} - {docType.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Employee Selection Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span>Select Employees</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {filteredEmployeesList.length > 0 && (
                      <button
                        onClick={handleSelectAll}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      >
                        {selectedEmployees.length ===
                        filteredEmployeesList.length
                          ? "Deselect All"
                          : "Select All"}
                      </button>
                    )}
                  </div>

                  {selectedEmployees.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200/50">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-blue-700">
                          {selectedEmployees.length} employee(s) selected
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-600 transition-colors">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search employees by name, department, or email..."
                      value={searchEmployee}
                      onChange={(e) => setSearchEmployee(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all duration-200 hover:border-gray-400 bg-white/50"
                    />
                  </div>

                  <div className="border border-gray-300 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                    {loadingEmployees ? (
                      <div className="p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">
                          Loading employees...
                        </p>
                      </div>
                    ) : filteredEmployeesList.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="p-3 bg-gray-100 rounded-xl inline-block mb-3">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          No employees found
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Try a different search term
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {filteredEmployeesList.map((employee) => {
                          const fullName = `${employee.first_name} ${employee.last_name}`;
                          return (
                            <label
                              key={employee.id}
                              className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                                selectedEmployees.includes(fullName)
                                  ? "bg-blue-50/50 border-l-4 border-l-blue-500"
                                  : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(fullName)}
                                onChange={() => handleEmployeeToggle(fullName)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900">
                                  {fullName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {employee.department_name || "N/A"}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {employee.email}
                                  </span>
                                </div>
                              </div>
                              {selectedEmployees.includes(fullName) && (
                                <div className="p-1 bg-blue-100 rounded-lg">
                                  <Check className="w-3.5 h-3.5 text-blue-600" />
                                </div>
                              )}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {selectedEmployees.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-green-600" />
                      <span>Selected Employees</span>
                    </label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50/50 rounded-xl border border-gray-200">
                      {selectedEmployees.map((employee) => (
                        <span
                          key={employee}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 rounded-lg text-xs font-medium group hover:from-blue-200 hover:to-blue-100 transition-all duration-200"
                        >
                          {employee}
                          <button
                            onClick={() => handleEmployeeToggle(employee)}
                            className="hover:bg-blue-200 rounded-full p-0.5 transition-all duration-200"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white/95 backdrop-blur-sm -mx-6 px-6 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedDocumentType("");
                      setSelectedEmployees([]);
                      setSearchEmployee("");
                    }}
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50/50 hover:border-gray-400 transition-all duration-200 font-medium text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={
                      !selectedDocumentType ||
                      selectedEmployees.length === 0 ||
                      generating
                    }
                    className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                      !selectedDocumentType ||
                      selectedEmployees.length === 0 ||
                      generating
                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                        : "bg-gradient-to-r from-[#b52124] to-[#d43538] text-white hover:from-[#d43538] hover:to-[#b52124] shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                    }`}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Generate{" "}
                        {selectedDocumentType &&
                          `(${getDocumentTypeName(selectedDocumentType)})`}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #b52124;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d43538;
        }
      `}</style>
    </div>
  );
};

export default DocumentDashboard;
