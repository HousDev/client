import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Save,
  X,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Undo2,
  Redo2,
  Printer,
  Maximize2,
  Minimize2,
  Download,
  Upload,
  FileText,
} from "lucide-react";
import defaultLogo from "../../assets/images/Nayash Logo.png";
import { SettingsApi } from "../../lib/settingsApi";
import { toast } from "sonner";

// ###################################################################################
// SECTION: TYPE DEFINITIONS
// ###################################################################################

type Template = {
  id?: string | number;
  name?: string;
  description?: string;
  category?: string;
  content?: string;
  variables?: string[];
  status?: string;
  logo_url?: string;
  logo_file?: File;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
  created_by?: string | number;
  updated_by?: string | number;
  lastUsed?: string;
};

type Props = {
  template?: Template | null;
  onSave: (t: Template) => void;
  onClose: () => void;
};

type MappedVariable = {
  name: string;
  label: string;
  category: string;
  description?: string;
  defaultValue?: string;
};

type TemplateDef = { id: string; name: string; html: string };

// ###################################################################################
// SECTION: CONSTANTS AND CONFIGURATION
// ###################################################################################

const FONT_SIZES = [
  { label: "8 pt", sizeCmd: 1 },
  { label: "10 pt", sizeCmd: 2 },
  { label: "12 pt", sizeCmd: 3 },
  { label: "14 pt", sizeCmd: 4 },
  { label: "18 pt", sizeCmd: 5 },
  { label: "24 pt", sizeCmd: 6 },
  { label: "36 pt", sizeCmd: 7 },
];

const FONT_FAMILIES = [
  "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
  "Arial",
  "Times New Roman",
  "Georgia",
  "Verdana",
  "Tahoma",
  "Courier New",
  "Monaco",
  "Calibri",
  "Garamond",
];

const CATEGORIES = [
  "all",
  "buyer",
  "seller",
  "property",
  "leads",
  "account",
  "company",
  "common",
];

const A4_CSS = `<title>RESALE EXPERT</title><style>body{background:rgb(204,204,204);font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;line-height:1.3 !important;}#printDialog{width:230mm;height:100%;margin:0 auto;padding:0;font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;background:rgb(204,204,204);line-height:1.3 !important;}*{box-sizing:border-box;-moz-box-sizing:border-box;}.main-page{width:210mm;min-height:297mm;margin:10mm auto;background:white;box-shadow:0 0 0.5cm rgba(0,0,0,0.5);}.sub-page{margin-left:50px;margin-right:50px;font-size:13px;}@page{size:A4;margin:0;}@media print{html,body{width:210mm;height:297mm;}.main-page{margin:0;border:initial;border-radius:initial;width:initial;min-height:initial;box-shadow:initial;background:initial;page-break-after:always;}a:link{text-decoration:none !important;}a[href]:after{content:none !important;}}.left{float:left;} .right{float:right;}.companylogo{width:180px;height:60px;} .projectlogo{width:180px;height:60px;}.footerlogo{width:180px;height:60px;}hr.new1{border-top:1px solid;}.div-table{border:1px solid #000;border-collapse:collapse;font-size:11px;}.div-table-row{border:1px solid #000;border-collapse:collapse;}.div-table-col{border:1px solid #000;border-collapse:collapse;padding-left:5px;}table{font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;border-collapse:unset;}</style>`;
const LEGAL_CSS = `<title>RESALE EXPERT</title><style>body{background:rgb(204,204,204);font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;line-height:1.3 !important;}#printDialog{width:236mm;height:100%;margin:0 auto;padding:0;font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;background:rgb(204,204,204);line-height:1.3 !important;}*{box-sizing:border-box;-moz-box-sizing:border-box;}.main-page{width:216mm;min-height:356mm;margin:10mm auto;background:white;box-shadow:0 0 0.5cm rgba(0,0,0,0.5);}.sub-page{margin-left:50px;margin-right:50px;font-size:13px;}@page{size:Legal;margin:0;}@media print{html,body{width:216mm;height:356mm;}.main-page{margin:0;border:initial;border-radius:initial;width:initial;min-height:initial;box-shadow:initial;background:initial;page-break-after:always;}a:link{text-decoration:none !important;}a[href]:after{content:none !important;}}.left{float:left;} .right{float:right;}.companylogo{width:180px;height:60px;} .projectlogo{width:180px;height:60px;}.footerlogo{width:180px;height:60px;}hr.new1{border-top:1px solid;}.div-table{border:1px solid #000;border-collapse:collapse;font-size:11px;}.div-table-row{border:1px solid #000;border-collapse:collapse;}.div-table-col{border:1px solid #000;border-collapse:collapse;padding-left:5px;}table{font-size:13px;font-family:'Lucida Sans','Lucida Sans Regular','Lucida Grande','Lucida Sans Unicode',Geneva,Verdana,sans-serif !important;border-collapse:unset;}</style>`;

const TEMPLATES: TemplateDef[] = [
  {
    id: "blank-a4",
    name: "A4 • Blank Page",
    html: `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page" style="padding-top:24px;padding-bottom:24px;"><p style="color:#000000;margin:0 0 8px 0;">(Blank A4 page)</p><br></div></div></body></html>`,
  },
  {
    id: "Offer Letter",
    name: "Offer Letter",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Offer Letter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-height: 80px;
      margin-bottom: 10px;
    }
    .company-name {
      font-size: 22px;
      font-weight: bold;
    }
    .date {
      text-align: right;
      margin-bottom: 20px;
    }
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
    }
    .content p {
      margin-bottom: 15px;
    }
    .highlight {
      font-weight: bold;
    }
    .signature {
      margin-top: 40px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{company_logo}}" class="logo" />
      <div class="company-name">{{company_name}}</div>
      <div>{{company_address}}</div>
    </div>
    <div class="date">
      Date: {{current_date}}
    </div>
    <div class="title">Offer Letter</div>
    <div class="content">
      <p>To,</p>
      <p>
        <span class="highlight">{{employee_name}}</span><br/>
        {{employee_address}}
      </p>
      <p><strong>Subject:</strong> Offer of Employment for {{designation}}</p>
      <p>Dear {{employee_name}},</p>
      <p>
        We are pleased to offer you the position of 
        <span class="highlight">{{designation}}</span> at 
        <span class="highlight">{{company_name}}</span>.
      </p>
      <p>
        Your employment will commence from 
        <span class="highlight">{{joining_date}}</span>, and you will be based at 
        <span class="highlight">{{work_location}}</span>.
      </p>
      <p>
        Your annual Cost to Company (CTC) will be 
        <span class="highlight">{{salary}}</span>.
      </p>
      <p>
        You will be on probation for a period of 
        <span class="highlight">{{probation_period}}</span>.
      </p>
      <p>Best Regards,</p>
      <div class="signature">
        <strong>{{hr_name}}</strong><br/>
        {{hr_designation}}<br/>
        {{company_name}}
      </div>
    </div>
    <div class="footer">
      This is a system-generated document.
    </div>
  </div>
</body>
</html>`,
  },
  {
    id: "Pay Slip",
    name: "Pay Slip",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Payslip</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      color: #333;
      padding: 20px;
    }
    .container {
      max-width: 900px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      max-height: 70px;
    }
    .company-name {
      font-size: 20px;
      font-weight: bold;
    }
    .title {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
    }
    .info-table {
      width: 100%;
      margin-bottom: 20px;
      border-collapse: collapse;
    }
    .info-table td {
      padding: 6px 8px;
    }
    .salary-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .salary-table th,
    .salary-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .salary-table th {
      background-color: #f5f5f5;
    }
    .text-right {
      text-align: right;
    }
    .net-pay {
      margin-top: 20px;
      font-size: 16px;
      font-weight: bold;
      text-align: right;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      text-align: center;
      color: #777;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{company_logo}}" class="logo" />
      <div class="company-name">{{company_name}}</div>
      <div>{{company_address}}</div>
    </div>
    <div class="title">
      Salary Slip for {{salary_month}}
    </div>
    <table class="info-table">
      <tr><td><strong>Employee Name:</strong> {{employee_name}}</td><td><strong>Employee ID:</strong> {{employee_id}}</td></tr>
      <tr><td><strong>Designation:</strong> {{designation}}</td><td><strong>Department:</strong> {{department}}</td></tr>
      <tr><td><strong>Joining Date:</strong> {{joining_date}}</td><td><strong>Working Days:</strong> {{working_days}}</td></tr>
      <tr><td><strong>Present Days:</strong> {{present_days}}</td><td><strong>Leaves:</strong> {{leave_days}}</td></tr>
    </table>
    <table class="salary-table">
      <thead><tr><th>Earnings</th><th class="text-right">Amount (₹)</th><th>Deductions</th><th class="text-right">Amount (₹)</th></tr></thead>
      <tbody>
        <tr><td>Basic Salary</td><td class="text-right">{{basic_salary}}</td><td>PF</td><td class="text-right">{{pf}}</td></tr>
        <tr><td>HRA</td><td class="text-right">{{hra}}</td><td>Professional Tax</td><td class="text-right">{{pt}}</td></tr>
        <tr><td>Allowances</td><td class="text-right">{{allowances}}</td><td>Other Deductions</td><td class="text-right">{{other_deductions}}</td></tr>
        <tr><td><strong>Total Earnings</strong></td><td class="text-right"><strong>{{total_earnings}}</strong></td><td><strong>Total Deductions</strong></td><td class="text-right"><strong>{{total_deductions}}</strong></td></tr>
      </tbody>
    </table>
    <div class="net-pay">Net Salary: ₹ {{net_salary}}</div>
    <div class="footer">This is a system-generated payslip.</div>
  </div>
</body>
</html>`,
  },
  {
    id: "Experience Letter",
    name: "Experience Letter",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Experience Letter</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    .container {
      max-width: 800px;
      margin: auto;
      border: 1px solid #ddd;
      padding: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-height: 80px;
      margin-bottom: 10px;
    }
    .company-name {
      font-size: 22px;
      font-weight: bold;
    }
    .date {
      text-align: right;
      margin-bottom: 20px;
    }
    .title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
    }
    .content p {
      margin-bottom: 15px;
    }
    .signature {
      margin-top: 40px;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="{{company_logo}}" class="logo" />
      <div class="company-name">{{company_name}}</div>
      <div>{{company_address}}</div>
    </div>
    <div class="date">Date: {{current_date}}</div>
    <div class="title">Experience Letter</div>
    <div class="content">
      <p>To Whom It May Concern,</p>
      <p>
        This is to certify that <strong>{{employee_name}}</strong> was employed 
        with <strong>{{company_name}}</strong> as a 
        <strong>{{designation}}</strong> in the 
        <strong>{{department}}</strong> department.
      </p>
      <p>
        The employee worked with us from 
        <strong>{{joining_date}}</strong> to 
        <strong>{{last_working_date}}</strong>.
      </p>
      <p>We wish {{employee_name}} all the best for their future endeavors.</p>
      <p>Sincerely,</p>
      <div class="signature">
        <strong>{{hr_name}}</strong><br/>
        {{hr_designation}}<br/>
        {{company_name}}
      </div>
    </div>
    <div class="footer">This is a system-generated document.</div>
  </div>
</body>
</html>`,
  },
];

// Map category to template ID
const CATEGORY_TEMPLATE_MAP: Record<string, string> = {
  "Offer Letter": "Offer Letter",
  "Experience Letter": "Experience Letter",
  "Pay Slip": "Pay Slip",
};

// STATIC AVAILABLE VARIABLES
const STATIC_AVAILABLE_VARIABLES: MappedVariable[] = [
  {
    name: "manager_name",
    label: "Manager Name",
    category: "buyer",
    defaultValue: "Kamlesh Shaha",
  },
  {
    name: "last_working_date",
    label: "Last Working Date",
    category: "buyer",
    defaultValue: new Date().toLocaleDateString(),
  },
  {
    name: "notice_period",
    label: "Notice Period",
    category: "buyer",
    defaultValue: "1 Day",
  },
  {
    name: "employee_name",
    label: "Employee Name",
    category: "buyer",
    defaultValue: "Sachin Paithane",
  },
  {
    name: "employee_id",
    label: "Employee ID",
    category: "buyer",
    defaultValue: "EMP001",
  },
  {
    name: "salary_month",
    label: "Salary Month",
    category: "Employee",
    defaultValue: "April 2026",
  },
  {
    name: "employee_email",
    label: "Employee Email",
    category: "buyer",
    defaultValue: "sachin@example.com",
  },
  {
    name: "employee_phone",
    label: "Employee Phone",
    category: "buyer",
    defaultValue: "+91 9876543210",
  },
  {
    name: "employee_address",
    label: "Employee Address",
    category: "buyer",
    defaultValue: "Pune, Maharashtra, India",
  },
  {
    name: "designation",
    label: "Designation",
    category: "seller",
    defaultValue: "Software Engineer",
  },
  {
    name: "department",
    label: "Department",
    category: "seller",
    defaultValue: "IT Department",
  },
  {
    name: "joining_date",
    label: "Joining Date",
    category: "seller",
    defaultValue: "01 April 2026",
  },
  {
    name: "work_location",
    label: "Work Location",
    category: "seller",
    defaultValue: "Mumbai Office",
  },
  {
    name: "probation_period",
    label: "Probation Period",
    category: "seller",
    defaultValue: "6 Months",
  },
  {
    name: "salary",
    label: "Salary",
    category: "account",
    defaultValue: "₹6,00,000 per annum",
  },
  {
    name: "basic_salary",
    label: "Basic Salary",
    category: "account",
    defaultValue: "₹25,000",
  },
  { name: "hra", label: "HRA", category: "account", defaultValue: "₹10,000" },
  {
    name: "pf",
    label: "PF Deduction",
    category: "account",
    defaultValue: "₹1,800",
  },
  {
    name: "net_salary",
    label: "Net Salary",
    category: "account",
    defaultValue: "₹38,200",
  },
  {
    name: "company_name",
    label: "Company Name",
    category: "company",
    defaultValue: "ABC Pvt Ltd",
  },
  {
    name: "company_address",
    label: "Company Address",
    category: "company",
    defaultValue: "Mumbai, Maharashtra, India",
  },
  {
    name: "company_email",
    label: "Company Email",
    category: "company",
    defaultValue: "hr@abc.com",
  },
  {
    name: "company_phone",
    label: "Company Phone",
    category: "company",
    defaultValue: "+91 9123456789",
  },
  {
    name: "company_logo",
    label: "Company Logo",
    category: "company",
    defaultValue: defaultLogo,
  },
  {
    name: "document_number",
    label: "Document Number",
    category: "common",
    defaultValue: "DOC-2026-001",
  },
  {
    name: "issue_date",
    label: "Issue Date",
    category: "common",
    defaultValue: "06 April 2026",
  },
  {
    name: "current_date",
    label: "Current Date",
    category: "common",
    defaultValue: "06 April 2026",
  },
  {
    name: "working_days",
    label: "Working Days",
    category: "Employee",
    defaultValue: "30 Days",
  },
  {
    name: "leave_days",
    label: "Leave Days",
    category: "Employee",
    defaultValue: "0 Days",
  },
  {
    name: "pt",
    label: "Professional Tax",
    category: "Employee",
    defaultValue: "200",
  },
  {
    name: "other_deductions",
    label: "Other Deductions",
    category: "Employee",
    defaultValue: "500",
  },
  {
    name: "total_deductions",
    label: "Total Deductions",
    category: "Employee",
    defaultValue: "700",
  },
  {
    name: "allowances",
    label: "Allowances",
    category: "Employee",
    defaultValue: "200",
  },
  {
    name: "total_earnings",
    label: "Total Earnings",
    category: "Employee",
    defaultValue: "700",
  },
  {
    name: "present_days",
    label: "Present Days",
    category: "Employee",
    defaultValue: "22",
  },
  {
    name: "hr_name",
    label: "HR Name",
    category: "common",
    defaultValue: "Anita Sharma",
  },
  {
    name: "hr_designation",
    label: "HR Designation",
    category: "common",
    defaultValue: "HR Manager",
  },
];

// Helper functions
const hasA4Shell = (html: string) =>
  /class\s*=\s*["']main-page["']/.test(html) &&
  /class\s*=\s*["']sub-page["']/.test(html);
const wrapInBlankA4 = (innerHTML: string) =>
  `<!doctype html><html><head>${A4_CSS}</head><body id="printDialog"><div class="main-page"><div class="sub-page" style="padding-top:24px;padding-bottom:24px;">${innerHTML}</div></div></body></html>`;
const tidy = (s: string) => s.replace(/\s+$/g, "");

function injectIntoTemplate(templateHTML: string, inner: string) {
  const openTagMatch = templateHTML.match(
    /<div[^>]*class=["'][^"']*sub-page[^"']*["'][^>]*>/i,
  );
  if (!openTagMatch) return wrapInBlankA4(inner);
  const openTag = openTagMatch[0];
  const start = templateHTML.indexOf(openTag) + openTag.length;
  const end = templateHTML.indexOf("</div>", start);
  if (end === -1) return wrapInBlankA4(inner);
  return templateHTML.slice(0, start) + inner + templateHTML.slice(end);
}

function extractVariables(s: string): string[] {
  if (!s) return [];
  const matches = s.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  const names = matches.map((m) => m.slice(2, -2));
  return Array.from(new Set(names));
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result || ""));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function applyLogosToDocument(html: string, headerDataUrl?: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    if (headerDataUrl) {
      doc.querySelectorAll("img.companylogo").forEach((img) => {
        img.setAttribute("src", headerDataUrl);
        img.setAttribute("alt", img.getAttribute("alt") || "Company Logo");
      });
    }
    const hasDoctype = /^\s*<!doctype/i.test(html);
    const rebuilt = doc.documentElement.outerHTML;
    return (hasDoctype ? "<!doctype html>" : "") + rebuilt;
  } catch {
    return html;
  }
}

// ###################################################################################
// SECTION: MAIN COMPONENT
// ###################################################################################

const CreateTemplate = ({
  template,
  onSave,
  onClose,
}: {
  template?: Template;
  onSave: any;
  onClose: () => void;
}) => {
  // STATE
  const [variables, setVariables] = useState<string[]>([]);
  const [availableVariables] = useState<MappedVariable[]>(
    STATIC_AVAILABLE_VARIABLES,
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [templateData, setTemplateData] = useState({
    name: "",
    description: "",
    category: "Offer Letter",
    status: "draft",
  });

  const [content, setContent] = useState<string>("");
  const [previewContent, setPreviewContent] = useState<string>("");
  const [mode, setMode] = useState<"visual" | "source">("visual");
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<string>("blank-a4");
  const [headerLogo, setHeaderLogo] = useState<any>("");

  // REFS
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerLogoInputRef = useRef<HTMLInputElement>(null);
  const isCategoryChangeRef = useRef(false);
  const isProgrammaticUpdateRef = useRef(false);

  // Get current logo URL
  const getCurrentLogoUrl = useCallback(() => {
    if (headerLogo) return headerLogo;
    if (template?.logo_url) {
      if (
        template.logo_url.startsWith("http") ||
        template.logo_url.startsWith("data:")
      ) {
        return template.logo_url;
      }
      return `${import.meta.env.VITE_API_URL}/uploads/${template.logo_url}`;
    }
    return defaultLogo;
  }, [headerLogo, template?.logo_url]);

  // Generate preview content
  const generatePreviewContent = (rawContent: string) => {
    if (!rawContent) return "";

    const currentLogo = getCurrentLogoUrl();

    let result = rawContent;

    // ✅ Replace ONLY inside src attribute
    result = result.replace(
      /src=["']\{\{company_logo\}\}["']/g,
      `src="${currentLogo}"`,
    );

    return result;
  };

  // Load template by category
  const loadTemplateByCategory = useCallback(
    (category: string) => {
      const templateId = CATEGORY_TEMPLATE_MAP[category];
      if (templateId) {
        const t = TEMPLATES.find((x) => x.id === templateId);
        if (t) {
          setSelectedTemplateId(t.id);
          const withLogos = applyLogosToDocument(
            t.html,
            headerLogo || defaultLogo,
          );
          const tidiedContent = tidy(withLogos);
          setContent(tidiedContent);
          const preview = tidiedContent;
          setPreviewContent(preview);
          if (editorRef.current && mode === "visual") {
            isProgrammaticUpdateRef.current = true;
            editorRef.current.innerHTML = preview;
            setTimeout(() => {
              isProgrammaticUpdateRef.current = false;
            }, 100);
          }
        }
      }
    },
    [headerLogo, mode],
  );

  // Convert preview to content
  const convertPreviewToContent = useCallback(
    (previewHtml: string, originalContent: string) => {
      if (!previewHtml || !originalContent) return originalContent;
      const variableMatches =
        originalContent.match(/\{\{[a-zA-Z0-9_]+\}\}/g) || [];
      const uniqueVariables = Array.from(new Set(variableMatches));
      let result = previewHtml;
      uniqueVariables.forEach((variable) => {
        const varName = variable.slice(2, -2);
        const defaultValue =
          availableVariables.find((v) => v.name === varName)?.defaultValue ||
          "";
        if (defaultValue && varName !== "company_logo") {
          const escapedValue = defaultValue.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const regex = new RegExp(escapedValue, "g");
          result = result.replace(regex, variable);
        } else if (varName === "company_logo") {
          const logoRegex = /<img[^>]*class="[^"]*companylogo[^"]*"[^>]*>/gi;
          result = result.replace(logoRegex, variable);
        }
      });
      return result;
    },
    [availableVariables],
  );

  // Initialize template data
  useEffect(() => {
    setVariables(template?.variables || []);
    setTemplateData({
      name: template?.name || "",
      description: template?.description || "",
      category: template?.category || "Offer Letter",
      status: template?.status || "draft",
    });

    if (template?.logo_url) {
      const fullLogoUrl =
        template.logo_url.startsWith("http") ||
        template.logo_url.startsWith("data:")
          ? template.logo_url
          : `${import.meta.env.VITE_API_URL}/uploads/${template.logo_url}`;
      setHeaderLogo(fullLogoUrl);
    }

    let initialContent: string;
    if (template?.content) {
      initialContent = template.content;
      const matchingTemplate = TEMPLATES.find(
        (t) =>
          t.id !== "blank-a4" &&
          t.html.includes(initialContent.substring(0, 500)),
      );
      if (matchingTemplate) setSelectedTemplateId(matchingTemplate.id);
    } else {
      const defaultTemplate = TEMPLATES.find((t) => t.id === "Offer Letter");
      initialContent =
        defaultTemplate?.html ||
        TEMPLATES.find((t) => t.id === "blank-a4")!.html;
      setSelectedTemplateId("Offer Letter");
    }

    const tidiedContent = tidy(initialContent);
    setContent(tidiedContent);
    setPreviewContent(tidiedContent);
  }, [template]);

  // Watch for category changes
  useEffect(() => {
    if (!template?.id && isCategoryChangeRef.current) {
      loadTemplateByCategory(templateData.category);
      isCategoryChangeRef.current = false;
    }
  }, [templateData.category, loadTemplateByCategory, template?.id]);

  // Update preview when headerLogo changes
  useEffect(() => {
    if (content && !isProgrammaticUpdateRef.current) {
      const updatedPreview = content;
      setPreviewContent(updatedPreview);
      if (
        mode === "visual" &&
        editorRef.current &&
        editorRef.current.innerHTML !== updatedPreview
      ) {
        isProgrammaticUpdateRef.current = true;
        editorRef.current.innerHTML = updatedPreview;
        setTimeout(() => {
          isProgrammaticUpdateRef.current = false;
        }, 100);
      }
    }
  }, [headerLogo, content, mode]);

  // Sync visual editor
  useEffect(() => {
    if (
      mode === "visual" &&
      editorRef.current &&
      !isProgrammaticUpdateRef.current &&
      editorRef.current.innerHTML !== previewContent
    ) {
      isProgrammaticUpdateRef.current = true;
      editorRef.current.innerHTML = previewContent;
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false;
      }, 100);
    }
  }, [mode, previewContent]);

  const exec = useCallback(
    (command: string, value?: string) => {
      if (mode !== "visual") {
        setMode("visual");
        setTimeout(() => {
          editorRef.current?.focus();
          document.execCommand(command, false, value);
          if (editorRef.current) {
            const newPreviewHtml = editorRef.current.innerHTML;
            setPreviewContent(newPreviewHtml);
            // setContent(convertPreviewToContent(newPreviewHtml, content));
          }
        }, 100);
        return;
      }
      editorRef.current?.focus();
      document.execCommand(command, false, value);
      if (editorRef.current) {
        const newPreviewHtml = editorRef.current.innerHTML;
        setPreviewContent(newPreviewHtml);
        // setContent(convertPreviewToContent(newPreviewHtml, content));
      }
    },
    [mode, content, convertPreviewToContent],
  );

  const insertInRichEditor = (htmlToInsert: string) => {
    if (mode !== "visual") {
      setMode("visual");
      setTimeout(() => insertInRichEditor(htmlToInsert), 100);
      return;
    }
    if (!editorRef.current) return;
    editorRef.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlToInsert;
    const nodeToInsert = tempDiv.firstChild;
    const styleBreaker = document.createTextNode("\u200b");
    if (nodeToInsert) {
      range.insertNode(nodeToInsert);
      range.setStartAfter(nodeToInsert);
      range.setEndAfter(nodeToInsert);
      range.insertNode(styleBreaker);
      range.setStartAfter(styleBreaker);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    document.execCommand("foreColor", false, "#000000");
    const newPreviewHtml = editorRef.current.innerHTML;
    setPreviewContent(newPreviewHtml);
    // setContent(convertPreviewToContent(newPreviewHtml, content));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    setTemplateData({ ...templateData, category: newCategory });
    if (!template?.id) isCategoryChangeRef.current = true;
  };

  const handleVariableDropdown = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const variableName = e.target.value;
    if (!variableName) return;
    const variable = availableVariables.find((v) => v.name === variableName);
    const defaultValue = variable?.defaultValue || variableName;
    if (variableName === "company_logo") {
      const currentLogo = getCurrentLogoUrl();
      insertInRichEditor(
        `<img src="${currentLogo}" alt="Company Logo" class="companylogo" style="max-width: 180px; max-height: 60px; object-fit: contain;" />`,
      );
    } else {
      insertInRichEditor(defaultValue);
    }
    setVariables((prev) => Array.from(new Set([...prev, variableName])));
    e.target.selectedIndex = 0;
  };

  const applyTemplate = (id: string) => {
    const t = TEMPLATES.find((x) => x.id === id);
    if (!t) return;
    setSelectedTemplateId(id);
    const withLogos = applyLogosToDocument(t.html, headerLogo || defaultLogo);
    const tidiedContent = tidy(withLogos);
    setContent(tidiedContent);
    const preview = tidiedContent;
    setPreviewContent(preview);
    if (editorRef.current && mode === "visual") {
      isProgrammaticUpdateRef.current = true;
      editorRef.current.innerHTML = preview;
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false;
      }, 100);
    }
  };

  const insertTable = () => {
    const rows = parseInt(prompt("Enter number of rows", "3") || "3", 10);
    const cols = parseInt(prompt("Enter number of columns", "3") || "3", 10);
    if (isNaN(rows) || isNaN(cols) || rows < 1 || cols < 1) return;
    let tableHTML = `<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;"><tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHTML += `<tr>`;
      for (let c = 0; c < cols; c++) {
        tableHTML += `<td style="border: 1px solid #ccc; padding: 8px;">Cell<\/td>`;
      }
      tableHTML += `<\/tr>`;
    }
    tableHTML += `<\/tbody><\/table><br>`;
    insertInRichEditor(tableHTML);
  };

  const printDoc = () => {
    const finalHTML = hasA4Shell(previewContent)
      ? previewContent
      : wrapInBlankA4(previewContent);
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Could not open print window. Please disable your popup blocker.");
      return;
    }
    printWindow.document.write(finalHTML);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const exportHTML = () => {
    let finalDoc = content;
    if (!hasA4Shell(content)) {
      const selected = TEMPLATES.find((t) => t.id === selectedTemplateId);
      finalDoc = selected
        ? injectIntoTemplate(selected.html, content)
        : wrapInBlankA4(content);
      finalDoc = applyLogosToDocument(finalDoc, headerLogo || defaultLogo);
    } else {
      finalDoc = applyLogosToDocument(finalDoc, headerLogo || defaultLogo);
    }
    const filename = (templateData.name || "template") + ".html";
    const blob = new Blob([finalDoc], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSelectedTemplate = () => {
    const t = TEMPLATES.find((tt) => tt.id === selectedTemplateId);
    if (!t) return;
    const withLogos = applyLogosToDocument(t.html, headerLogo || defaultLogo);
    const safeName = t.name.replace(/[^\w]+/g, "-").toLowerCase() + ".html";
    const blob = new Blob([withLogos], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = safeName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importHTML = async (file: File) => {
    const text = await file.text();
    if (!text) return;
    let nextContent: string;
    if (hasA4Shell(text)) {
      nextContent = text;
    } else {
      const selected = TEMPLATES.find((t) => t.id === selectedTemplateId);
      nextContent = selected
        ? injectIntoTemplate(selected.html, text)
        : wrapInBlankA4(text);
    }
    nextContent = applyLogosToDocument(nextContent, headerLogo || defaultLogo);
    const tidiedContent = tidy(nextContent);
    setContent(tidiedContent);
    setPreviewContent(tidiedContent);
  };

  const usedVariables = useMemo(() => {
    const found = new Set<string>([
      ...extractVariables(templateData.description),
      ...extractVariables(content),
      ...variables,
    ]);
    return Array.from(found);
  }, [templateData.description, content, variables]);

  const handleSave = () => {
    if (!templateData.name.trim()) {
      alert("Please enter a template name.");
      return;
    }
    const currentContent = content;
    const allText = templateData.description + currentContent;
    const foundVariables = extractVariables(allText);
    const finalVariables = Array.from(
      new Set([...variables, ...foundVariables]),
    );

    // Determine logo URL to save (only filename, not full URL)
    let logoUrlToSave = template?.logo_url || undefined;
    if (headerLogo && headerLogo.startsWith("data:")) {
      logoUrlToSave = undefined;
    } else if (headerLogo && headerLogo.includes("/uploads/")) {
      logoUrlToSave = headerLogo.split("/uploads/")[1];
    }

    const templateToSave: any = {
      ...template,
      ...templateData,
      content: currentContent,
      variables: finalVariables,
      logo_file: logoFile,
      logo_url: logoUrlToSave,
      updated_at: new Date().toISOString(),
      id: template?.id || Date.now(),
    };

    onSave(templateToSave);
  };

  const onHeaderLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Logo file size should be less than 2MB");
      return;
    }
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid image file (JPEG, PNG, GIF, WEBP)");
      return;
    }
    setLogoFile(file);
    const dataUrl = await readFileAsDataURL(file);
    setHeaderLogo(dataUrl);
    e.target.value = "";
  };

  const removeLogo = () => {
    setHeaderLogo("");
    setLogoFile(null);
  };

  const groupedAvailable = useMemo(() => {
    if (!availableVariables.length) return {};
    return availableVariables.reduce(
      (acc, v) => {
        const category = v.category || "common";
        (acc[category] = acc[category] || []).push(v);
        return acc;
      },
      {} as Record<string, MappedVariable[]>,
    );
  }, [availableVariables]);

  const filteredVariables = useMemo(() => {
    if (selectedCategory === "all") return availableVariables;
    return availableVariables.filter((v) => v.category === selectedCategory);
  }, [availableVariables, selectedCategory]);

  const fetchLogo = async () => {
    try {
      const response = await SettingsApi.getSystemSettings();
      setHeaderLogo(response.logo);
      console.log("res logo : ", response);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  useEffect(() => {
    const preview = generatePreviewContent(content);
    setPreviewContent(preview);

    if (mode === "visual" && editorRef.current) {
      isProgrammaticUpdateRef.current = true;
      editorRef.current.innerHTML = preview;
      setTimeout(() => {
        isProgrammaticUpdateRef.current = false;
      }, 0);
    }
  }, [content, headerLogo, mode]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-lg shadow-xl w-full flex flex-col ${fullscreen ? "h-screen max-h-screen max-w-full rounded-none" : "max-w-6xl max-h-[95vh]"}`}
      >
        {/* HEADER */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {template ? "Edit Template" : "Create New Template"}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              {fullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
          {/* METADATA */}
          <fieldset className="border rounded-md p-3 pt-0 space-y-3">
            <legend className="text-xs font-medium text-gray-600 px-1">
              Template Details
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateData.name}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, name: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="e.g., Sales Agreement"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Status
                </label>
                <select
                  value={templateData.status}
                  onChange={(e) =>
                    setTemplateData({ ...templateData, status: e.target.value })
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={templateData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                >
                  <option value="Offer Letter">Offer Letter</option>
                  <option value="Experience Letter">Experience Letter</option>
                  <option value="Pay Slip">Pay Slip</option>
                </select>
                {!template?.id && (
                  <p className="text-[10px] text-gray-400 mt-1">
                    Changing category will load the corresponding template
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  ref={descriptionRef}
                  value={templateData.description}
                  onChange={(e) =>
                    setTemplateData({
                      ...templateData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm h-10 min-h-[40px] resize-y md:resize-none"
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-700">
                  Company Logo
                </label>
                <div className="flex items-center gap-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => headerLogoInputRef.current?.click()}
                    onKeyDown={(e) =>
                      (e.key === "Enter" || e.key === " ") &&
                      headerLogoInputRef.current?.click()
                    }
                    className="group flex-1 px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                  >
                    <div className="flex-1">
                      <div className="text-[11px] font-medium text-gray-800 group-hover:underline">
                        {headerLogo ? "Change Logo" : "Upload Logo"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        JPG, PNG, GIF (max 2MB)
                      </div>
                    </div>
                    <div className="w-12 h-10 rounded border border-gray-200 bg-white overflow-hidden flex items-center justify-center">
                      {headerLogo || template?.logo_url ? (
                        <img
                          src={getCurrentLogoUrl()}
                          alt="Logo preview"
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = defaultLogo;
                          }}
                        />
                      ) : (
                        <ImageIcon className="opacity-60" size={16} />
                      )}
                    </div>
                  </div>
                  {(headerLogo || template?.logo_url) && (
                    <button
                      onClick={removeLogo}
                      className="p-1 text-red-600 hover:text-red-800"
                      title="Remove logo"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
                <input
                  ref={headerLogoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={onHeaderLogoSelect}
                  className="hidden"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {headerLogo || template?.logo_url
                    ? "Custom logo uploaded."
                    : "No logo uploaded. Default logo will be used."}
                </p>
              </div>
            </div>
          </fieldset>

          {/* EDITOR */}
          <fieldset className="border rounded-md">
            <legend className="text-sm font-medium text-gray-600 px-2">
              Template Content
            </legend>
            <div className="rounded-lg">
              {/* TOOLBAR */}
              <div className="p-1 border-b border-gray-200 sticky top-[-15px] bg-gray-50 z-20 flex flex-wrap items-center gap-1 text-gray-700 shadow-sm">
                <select
                  className="px-2 py-1 text-xs border border-gray-300 rounded mr-2"
                  value={selectedTemplateId}
                  onChange={(e) => applyTemplate(e.target.value)}
                  title="Apply a Predefined Template"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={downloadSelectedTemplate}
                  title="Download selected template"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <FileText size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Import HTML"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Upload size={16} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,text/html"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) importHTML(file);
                    e.currentTarget.value = "";
                  }}
                />
                <button
                  onClick={exportHTML}
                  title="Export current editor content"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Download size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => exec("bold")}
                  title="Bold"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => exec("italic")}
                  title="Italic"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => exec("underline")}
                  title="Underline"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Underline size={16} />
                </button>
                <button
                  onClick={() => exec("strikeThrough")}
                  title="Strikethrough"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Strikethrough size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <select
                  onChange={(e) => exec("fontName", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  title="Font Family"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f.split(",")[0]}
                    </option>
                  ))}
                </select>
                <select
                  onChange={(e) => exec("fontSize", e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded"
                  defaultValue="3"
                  title="Font Size"
                >
                  {FONT_SIZES.map((s) => (
                    <option key={s.label} value={s.sizeCmd}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => exec("justifyLeft")}
                  title="Align Left"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <AlignLeft size={16} />
                </button>
                <button
                  onClick={() => exec("justifyCenter")}
                  title="Align Center"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <AlignCenter size={16} />
                </button>
                <button
                  onClick={() => exec("justifyRight")}
                  title="Align Right"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <AlignRight size={16} />
                </button>
                <button
                  onClick={() => exec("justifyFull")}
                  title="Justify"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <AlignJustify size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => exec("insertUnorderedList")}
                  title="Bulleted List"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => exec("insertOrderedList")}
                  title="Numbered List"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <ListOrdered size={16} />
                </button>
                <button
                  onClick={insertTable}
                  title="Insert Table"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <TableIcon size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => exec("undo")}
                  title="Undo"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={() => exec("redo")}
                  title="Redo"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Redo2 size={16} />
                </button>
                <button
                  onClick={printDoc}
                  title="Print"
                  className="p-2 rounded hover:bg-gray-200"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() =>
                    setMode((m) => (m === "visual" ? "source" : "visual"))
                  }
                  title="Toggle Source Code"
                  className={`p-2 rounded hover:bg-gray-200 ${mode === "source" ? "bg-blue-100 text-blue-700" : ""}`}
                >
                  <Code size={16} />
                </button>
                <select
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  value={selectedCategory}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                  title="Filter by category"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
                <select
                  onChange={handleVariableDropdown}
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                  aria-label="Insert a variable"
                  title="Insert variable into page"
                  disabled={availableVariables.length === 0}
                >
                  <option value="" disabled>
                    {availableVariables.length === 0
                      ? "Loading..."
                      : "Insert variable…"}
                  </option>
                  {selectedCategory === "all"
                    ? Object.entries(groupedAvailable)
                        .sort(([catA], [catB]) => catA.localeCompare(catB))
                        .map(([category, vars]) => (
                          <optgroup
                            key={category}
                            label={
                              category.charAt(0).toUpperCase() +
                              category.slice(1)
                            }
                          >
                            {vars.map((v) => (
                              <option key={v.name} value={v.name}>
                                {v.label}
                              </option>
                            ))}
                          </optgroup>
                        ))
                    : filteredVariables.map((v) => (
                        <option key={v.name} value={v.name}>
                          {v.label}
                        </option>
                      ))}
                </select>
                <select
                  className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                  title="Variables detected in this template"
                  value=""
                  onChange={() => {}}
                >
                  <option value="">
                    Used variables ({usedVariables.length})
                  </option>
                  {usedVariables.length === 0 ? (
                    <option value="" disabled>
                      None
                    </option>
                  ) : (
                    usedVariables.sort().map((v) => (
                      <option key={v} value={v} disabled>
                        {availableVariables.find((av) => av.name === v)
                          ?.label || v}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* EDITOR AREA */}
              <div className="overflow-hidden">
                {mode === "visual" ? (
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      if (isProgrammaticUpdateRef.current) return;

                      const rawHtml = e.currentTarget.innerHTML;

                      // ✅ Save RAW (with variables)
                      setContent(rawHtml);
                    }}
                    className="min-h-[400px] p-4 text-gray-900 focus:outline-none prose max-w-none"
                    style={{ whiteSpace: "normal" }}
                  />
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => {
                      const newContent = e.target.value;
                      setContent(newContent);
                      setPreviewContent(newContent);
                    }}
                    className="w-full min-h-[400px] p-4 font-mono text-sm bg-gray-800 text-green-300 rounded-b-lg focus:outline-none resize-none"
                    placeholder=""
                  />
                )}
              </div>
            </div>
          </fieldset>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-end gap-3 p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button
            onClick={handleSave}
            disabled={!templateData.name.trim()}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            <span>{template ? "Save Changes" : "Save Template"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateTemplate;
