import * as XLSX from "xlsx";
import { toast } from "sonner";

/**
 * Public function
 * Call this from your component
 */
export const excelToItemsData = async (file: File, last_item_code: string) => {
  try {
    validateFile(file);

    const rows = await readExcel(file);
    validateHeaders(rows);

    const items = buildItemsData(rows, last_item_code);
    return items;
  } catch (err: any) {
    showErrors(err);
    throw err;
  }
};

/* -------------------------------- CONSTANTS -------------------------------- */

const REQUIRED_HEADERS = [
  "Product Type",
  "Category",
  "Sub Category",
  "Product Name",
  "Unit",
  "HSN/SAC Code",
  "Purchase Rate",
  "IGST",
  "CGST",
  "SGST",
  "Location",
];

/* -------------------------------- HELPERS -------------------------------- */

/**
 * File validation
 */
const validateFile = (file: File) => {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    throw ["Invalid file type. Please upload an Excel file (.xlsx / .xls)"];
  }
};

/**
 * Read Excel file
 */
const readExcel = (file: File): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) {
        reject(["Excel file is empty"]);
      }

      resolve(rows);
    };

    reader.onerror = () => reject(["Failed to read Excel file"]);
    reader.readAsArrayBuffer(file);
  });

/**
 * Header validation
 */
const validateHeaders = (rows: any[]) => {
  const headers = Object.keys(rows[0]);
  const errors: string[] = [];

  REQUIRED_HEADERS.forEach((h) => {
    if (!headers.includes(h)) {
      errors.push(`Missing required column: ${h}`);
    }
  });

  if (errors.length) throw errors;
};

/**
 * Build items data as per DB rules
 */
const buildItemsData = (rows: any[], last_item_code: string) => {
  const errors: string[] = [];
  const duplicateCheck = new Set<string>();
  const items: any[] = [];
  let lic = last_item_code;

  rows.forEach((row, index) => {
    const rowNo = index + 2;

    const productName = String(row["Product Name"]).trim();
    const productType = String(row["Product Type"]).trim();
    const category = String(row["Category"]).trim();
    const subCategory = String(row["Sub Category"]).trim();
    const unit = String(row["Unit"]).trim();
    const hsn = String(row["HSN/SAC Code"]).trim();
    const location = String(row["Location"]).trim() ?? "";

    if (!productName || !productType || !category || !unit || !hsn) {
      errors.push(
        `Row ${rowNo}: Product Name, Product Type, Category, Unit and HSN/SAC are required`,
      );
      return;
    }

    /* -------- Duplicate item_code check -------- */

    const PREFIX = "MAT";
    const MIN_DIGITS = 4;

    const lastCode = lic ?? `${PREFIX}0`;

    const nextNumber = Number(lastCode.replace(PREFIX, "")) + 1;

    const nextItemCode = PREFIX + String(nextNumber).padStart(MIN_DIGITS, "0");
    lic = nextItemCode;
    console.log(nextItemCode);
    const itemCode = nextItemCode;

    duplicateCheck.add(itemCode);

    /* -------- GST defaults -------- */
    const igst = Number(row["IGST"]) || 18;
    const cgst = Number(row["CGST"]) || 9;
    const sgst = Number(row["SGST"]) || 9;

    items.push({
      item_code: itemCode,
      item_name: productName,
      category: productType,
      item_category: category,
      item_sub_category: subCategory || null,
      description: productName,
      unit,
      hsn_code: hsn,
      igst_rate: igst,
      cgst_rate: cgst,
      sgst_rate: sgst,
      standard_rate: Number(row["Purchase Rate"]) || 0,
      is_active: 1,
      location: location ?? "",
    });
  });

  if (errors.length) throw errors;

  return items;
};

/**
 * Toast error handler
 */
const showErrors = (errors: string[] | string) => {
  if (Array.isArray(errors)) {
    errors.forEach((err) => toast.error(err));
  } else {
    toast.error(errors);
  }
};
