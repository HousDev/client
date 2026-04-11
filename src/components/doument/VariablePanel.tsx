import React, { useMemo, useState } from "react";
import {
  Variable as VariableIcon,
  Copy,
  Search,
  User,
  Building,
  CreditCard,
} from "lucide-react";

// ---- Types ----
export type MappedVariable = {
  name: string;
  label: string;
  category: string; // MUST match one of: buyer, seller, property, leads, account, company, common
  description: string;
};

type Props = {
  onVariableInsert?: (v: MappedVariable) => void;
  variables?: MappedVariable[]; // Optional: allow passing variables from parent
};

// ---- Fixed Category Meta ----
const CATEGORY_META: {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
}[] = [
  { id: "all", label: "All Variables", icon: VariableIcon },
  { id: "buyer", label: "Buyer Variables", icon: User },
  { id: "seller", label: "Seller Variables", icon: User },
  { id: "property", label: "Property Variables", icon: Building },
  { id: "leads", label: "Leads Variables", icon: User },
  { id: "account", label: "Account Variables", icon: CreditCard },
  { id: "company", label: "Company Variables", icon: Building },
  { id: "common", label: "Common Variables", icon: VariableIcon },
];

// ---- Static Variables Data ----
const DEFAULT_STATIC_VARIABLES: MappedVariable[] = [
  // Buyer Variables
  {
    name: "buyer_name",
    label: "Buyer Name",
    category: "buyer",
    description: "Full name of the buyer",
  },
  {
    name: "buyer_email",
    label: "Buyer Email",
    category: "buyer",
    description: "Email address of the buyer",
  },
  {
    name: "buyer_phone",
    label: "Buyer Phone",
    category: "buyer",
    description: "Phone number of the buyer",
  },
  {
    name: "buyer_address",
    label: "Buyer Address",
    category: "buyer",
    description: "Complete address of the buyer",
  },
  {
    name: "buyer_pan",
    label: "Buyer PAN",
    category: "buyer",
    description: "PAN card number of the buyer",
  },

  // Seller Variables
  {
    name: "seller_name",
    label: "Seller Name",
    category: "seller",
    description: "Full name of the seller",
  },
  {
    name: "seller_email",
    label: "Seller Email",
    category: "seller",
    description: "Email address of the seller",
  },
  {
    name: "seller_phone",
    label: "Seller Phone",
    category: "seller",
    description: "Phone number of the seller",
  },
  {
    name: "seller_address",
    label: "Seller Address",
    category: "seller",
    description: "Complete address of the seller",
  },
  {
    name: "seller_pan",
    label: "Seller PAN",
    category: "seller",
    description: "PAN card number of the seller",
  },

  // Property Variables
  {
    name: "property_address",
    label: "Property Address",
    category: "property",
    description: "Complete address of the property",
  },
  {
    name: "property_area",
    label: "Property Area",
    category: "property",
    description: "Total area of the property in sq ft",
  },
  {
    name: "property_type",
    label: "Property Type",
    category: "property",
    description: "Type of property (Residential/Commercial)",
  },
  {
    name: "property_value",
    label: "Property Value",
    category: "property",
    description: "Total value of the property",
  },
  {
    name: "property_age",
    label: "Property Age",
    category: "property",
    description: "Age of the property in years",
  },

  // Leads Variables
  {
    name: "lead_name",
    label: "Lead Name",
    category: "leads",
    description: "Name of the lead",
  },
  {
    name: "lead_email",
    label: "Lead Email",
    category: "leads",
    description: "Email address of the lead",
  },
  {
    name: "lead_phone",
    label: "Lead Phone",
    category: "leads",
    description: "Phone number of the lead",
  },
  {
    name: "lead_source",
    label: "Lead Source",
    category: "leads",
    description: "Source of the lead",
  },
  {
    name: "lead_status",
    label: "Lead Status",
    category: "leads",
    description: "Current status of the lead",
  },

  // Account Variables
  {
    name: "account_number",
    label: "Account Number",
    category: "account",
    description: "Bank account number",
  },
  {
    name: "account_holder",
    label: "Account Holder",
    category: "account",
    description: "Name of the account holder",
  },
  {
    name: "ifsc_code",
    label: "IFSC Code",
    category: "account",
    description: "Bank IFSC code",
  },
  {
    name: "bank_name",
    label: "Bank Name",
    category: "account",
    description: "Name of the bank",
  },
  {
    name: "branch_name",
    label: "Branch Name",
    category: "account",
    description: "Bank branch name",
  },

  // Company Variables
  {
    name: "company_name",
    label: "Company Name",
    category: "company",
    description: "Name of the company",
  },
  {
    name: "company_address",
    label: "Company Address",
    category: "company",
    description: "Company registered address",
  },
  {
    name: "company_gst",
    label: "Company GST",
    category: "company",
    description: "GST number of the company",
  },
  {
    name: "company_pan",
    label: "Company PAN",
    category: "company",
    description: "PAN number of the company",
  },
  {
    name: "company_email",
    label: "Company Email",
    category: "company",
    description: "Official company email",
  },

  // Common Variables
  {
    name: "current_date",
    label: "Current Date",
    category: "common",
    description: "Current system date",
  },
  {
    name: "current_time",
    label: "Current Time",
    category: "common",
    description: "Current system time",
  },
  {
    name: "document_number",
    label: "Document Number",
    category: "common",
    description: "Auto-generated document number",
  },
  {
    name: "reference_number",
    label: "Reference Number",
    category: "common",
    description: "Reference/transaction number",
  },
  {
    name: "authorized_signatory",
    label: "Authorized Signatory",
    category: "common",
    description: "Name of authorized signatory",
  },
];

// Helper to copy to clipboard
const copyToClipboard = (text: string, onSuccess?: () => void) => {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      onSuccess?.();
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
    });
};

const VariablePanel: React.FC<Props> = ({
  onVariableInsert,
  variables: externalVariables,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedVariable, setCopiedVariable] = useState<string | null>(null);

  // Use external variables if provided, otherwise use static data
  const variables = externalVariables || DEFAULT_STATIC_VARIABLES;

  // Derived categories (only those that exist in data, preserving fixed order)
  const dynamicCategories = useMemo(() => {
    const present = new Set(variables.map((v) => v.category));
    const fixedWithoutAll = CATEGORY_META.filter((c) => c.id !== "all");
    const ordered = fixedWithoutAll.filter((c) => present.has(c.id));
    return [
      { id: "all", label: "All Variables", icon: VariableIcon },
      ...ordered,
    ];
  }, [variables]);

  // Filtered list for UI
  const filteredVariables = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return variables.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(term) ||
        v.label.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "all" || v.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [variables, searchTerm, selectedCategory]);

  // Counts per category for badges on tabs
  const catCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of variables) {
      counts[v.category] = (counts[v.category] || 0) + 1;
    }
    counts["all"] = variables.length;
    return counts;
  }, [variables]);

  const handleVariableClick = (variable: MappedVariable) => {
    if (onVariableInsert) {
      onVariableInsert(variable);
    }
  };

  const handleCopy = (e: React.MouseEvent, variable: MappedVariable) => {
    e.stopPropagation();
    const variableText = `{{${variable.name}}}`;
    copyToClipboard(variableText, () => {
      setCopiedVariable(variable.name);
      setTimeout(() => setCopiedVariable(null), 2000);
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Variables Panel
        </h3>

        {/* Search */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {dynamicCategories.map((category) => {
            const Icon = category.icon;
            const active = selectedCategory === category.id;
            const count = catCounts[category.id] ?? 0;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                title={`${category.label} (${count})`}
              >
                <Icon size={14} />
                <span>{category.label}</span>
                <span
                  className={`ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-xs ${
                    active
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variables List */}
      <div className="p-4 max-h-40 overflow-y-auto ">
        <div className="grid grid-col-1 sm:grid-cols-2 gap-2">
          {filteredVariables.map((variable) => (
            <div
              key={variable.name}
              onClick={() => handleVariableClick(variable)}
              className="group relative p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-blue-600 group-hover:bg-blue-100">
                      {`{{${variable.name}}}`}
                    </code>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700 uppercase">
                      {variable.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {variable.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {variable.label}
                  </p>
                </div>
                <button
                  onClick={(e) => handleCopy(e, variable)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 hover:bg-gray-200 rounded"
                  title="Copy variable"
                >
                  {copiedVariable === variable.name ? (
                    <span className="text-xs text-green-600">Copied!</span>
                  ) : (
                    <Copy
                      className="text-gray-400 hover:text-blue-600"
                      size={14}
                    />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {filteredVariables.length === 0 && (
        <div className="p-8 text-center">
          <VariableIcon className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 text-sm">No variables found</p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VariablePanel;
