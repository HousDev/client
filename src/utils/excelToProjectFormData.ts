import * as XLSX from "xlsx";
import { toast } from "sonner";

/**
 * Public function
 * Call this from your component
 */
export const excelToProjectFormData = async (file: File) => {
  try {
    validateFile(file);

    const rows = await readExcel(file);
    validateHeaders(rows);

    const formData = buildFormData(rows);
    return formData;
  } catch (err: any) {
    showErrors(err);
    throw err;
  }
};

/* -------------------------------- CONSTANTS -------------------------------- */

const REQUIRED_HEADERS = [
  "Project Name",
  "Location",
  "Start Date",
  "End Date",
  "Building Name",
  "Floor Name",
  "Unit Type",
  "Unit Name",
];

const VALID_UNIT_TYPES = ["FLAT", "COMMON_AREA"];

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
 * Build hierarchical formData with smart validation
 */
const buildFormData = (rows: any[]) => {
  const errors: string[] = [];
  const buildingMap = new Map<string, any>();
  const duplicateCheck = new Set<string>();

  const firstRow = rows[0];

  rows.forEach((row, index) => {
    const rowNo = index + 2;

    const buildingName = String(row["Building Name"]).trim();
    const floorName = String(row["Floor Name"]).trim();
    const unitType = String(row["Unit Type"]).trim().toUpperCase();
    const unitName = String(row["Unit Name"]).trim();

    /* -------- Required building & floor -------- */
    if (!buildingName || !floorName) {
      errors.push(`Row ${rowNo}: Building Name and Floor Name are required`);
      return;
    }

    /* -------- Create building -------- */
    if (!buildingMap.has(buildingName)) {
      buildingMap.set(buildingName, {
        building_name: buildingName,
        floors: new Map<string, any>(),
      });
    }

    const building = buildingMap.get(buildingName);

    /* -------- Create floor -------- */
    if (!building.floors.has(floorName)) {
      building.floors.set(floorName, {
        floor_name: floorName,
        flats: [],
        common_areas: [],
      });
    }

    const floor = building.floors.get(floorName);

    /* ------------------------------------------------------------------
       FLOOR-ONLY ROW (Parking / Terrace / Service Floor)
       Unit Type & Unit Name BOTH empty → VALID
    ------------------------------------------------------------------ */
    if (!unitType && !unitName) {
      return;
    }

    /* -------- Partial unit error -------- */
    if (unitType && !unitName) {
      errors.push(
        `Row ${rowNo}: Unit Name is required when Unit Type is provided`
      );
      return;
    }

    if (!unitType && unitName) {
      errors.push(
        `Row ${rowNo}: Unit Type is required when Unit Name is provided`
      );
      return;
    }

    /* -------- Unit type validation -------- */
    if (!VALID_UNIT_TYPES.includes(unitType)) {
      errors.push(
        `Row ${rowNo}: Invalid Unit Type "${unitType}". Allowed: FLAT, COMMON_AREA`
      );
      return;
    }

    /* -------- Duplicate unit check -------- */
    const duplicateKey = `${buildingName}|${floorName}|${unitType}|${unitName}`;
    if (duplicateCheck.has(duplicateKey)) {
      errors.push(
        `Row ${rowNo}: Duplicate ${unitType} "${unitName}" in same floor`
      );
      return;
    }
    duplicateCheck.add(duplicateKey);

    /* -------- Push unit -------- */
    if (unitType === "FLAT") {
      floor.flats.push({ flat_name: unitName });
    } else {
      floor.common_areas.push({ common_area_name: unitName });
    }
  });

  if (errors.length) throw errors;

  return {
    name: firstRow["Project Name"],
    location: firstRow["Location"],
    start_date: firstRow["Start Date"],
    end_date: firstRow["End Date"],
    buildings: Array.from(buildingMap.values()).map((b) => ({
      building_name: b.building_name,
      floors: Array.from(b.floors.values()),
    })),
  };
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
