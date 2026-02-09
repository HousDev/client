import * as XLSX from "xlsx";
import { toast } from "sonner";

/**
 * Public function
 */
export const excelToServicesData = async (
  file: File,
  last_service_code: string,
) => {
  try {
    validateFile(file);

    const rows = await readExcel(file);
    validateHeaders(rows);

    return buildServicesData(rows, last_service_code);
  } catch (err: any) {
    showErrors(err);
    throw err;
  }
};

/* -------------------------------- CONSTANTS -------------------------------- */

const REQUIRED_HEADERS = [
  "Service Name",
  "Category",
  "Sub Category",
  "Service Rate",
  "Unit",
  "SAC Code",
  "IGST",
  "CGST",
  "SGST",
];

/* -------------------------------- HELPERS -------------------------------- */

const validateFile = (file: File) => {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    throw ["Invalid file type. Please upload .xlsx or .xls"];
  }
};

const readExcel = (file: File): Promise<any[]> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target?.result, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!rows.length) reject(["Excel file is empty"]);
      resolve(rows);
    };

    reader.onerror = () => reject(["Failed to read Excel file"]);
    reader.readAsArrayBuffer(file);
  });

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

/* -------------------------------- MAIN BUILDER -------------------------------- */

const buildServicesData = (rows: any[], last_service_code: string) => {
  const errors: string[] = [];
  const services: any[] = [];
  let lsc = last_service_code;

  rows.forEach((row, index) => {
    const rowNo = index + 2;

    const serviceName = String(row["Service Name"]).trim();
    const category = String(row["Category"]).trim();
    const subCategory = String(row["Sub Category"]).trim();
    const unit = String(row["Unit"]).trim() || "nos";
    const sac = String(row["SAC Code"]).trim();

    if (!serviceName || !category || !sac) {
      errors.push(
        `Row ${rowNo}: Service Name, Category and SAC Code are required`,
      );
      return;
    }

    /* -------- Service Code -------- */
    const PREFIX = "SER";
    const MIN_DIGITS = 4;

    const lastCode = lsc ?? `${PREFIX}0000`;
    const nextNumber = Number(lastCode.replace(PREFIX, "")) + 1;

    const nextServiceCode =
      PREFIX + String(nextNumber).padStart(MIN_DIGITS, "0");

    lsc = nextServiceCode;

    /* -------- GST -------- */
    const igst = Number(row["IGST"]) || 0;
    const cgst = Number(row["CGST"]) || 0;
    const sgst = Number(row["SGST"]) || 0;

    services.push({
      service_code: nextServiceCode,
      service_name: serviceName,
      category: "service",
      description: serviceName,
      unit,
      igst_rate: igst,
      cgst_rate: cgst,
      sgst_rate: sgst,
      standard_rate: Number(row["Service Rate"]) || 0,
      service_category: category,
      service_sub_category: subCategory || null,
      is_active: 1,
    });
  });

  if (errors.length) throw errors;

  return services;
};

/* -------------------------------- TOAST -------------------------------- */

const showErrors = (errors: string[] | string) => {
  if (Array.isArray(errors)) {
    errors.forEach((err) => toast.error(err));
  } else {
    toast.error(errors);
  }
};
