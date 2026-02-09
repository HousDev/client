/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PurchaseOrders.tsx
import axios from "axios";
import { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  XCircle,
  FileText,
  Package,
  X,
  Save,
  FileCheck2,
  Check,
  IndianRupee,
  FileDown,
  Loader2,
  Truck,
  Upload,
  User,
  Filter,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import vendorApi from "../lib/vendorApi";
import projectApi from "../lib/projectApi";
import poTypeApi from "../lib/poTypeApi";
import poApi from "../lib/poApi";
import po_trackingApi from "../lib/po_tracking";
import CreatePurchaseOrderForm from "../components/CreatePurchaseOrderForm";
import UpdatePurchaseOrderForm from "../components/updatePurchaseOrderForm";
import ItemsApi from "../lib/itemsApi";
import SearchableSelect from "../components/SearchableSelect";
import { UsersApi } from "../lib/Api";
import { toast } from "sonner";
import MySwal from "../utils/swal";
import TermsConditionsApi from "../lib/termsConditionsApi";
import poPaymentApi from "../lib/poPaymentApi";

type Vendor = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
};
type Project = { id: string; name: string; is_active?: boolean };
type POType = { id: string; name: string; is_active?: boolean };
export type PO = {
  id: string;
  po_number: string;
  po_date?: string;
  delivery_date: string;
  validity_date?: string;
  vendor_id?: string;
  vendors?: Vendor | null;
  project_id?: string;
  projects?: Project | null;
  po_type_id?: string;
  po_types?: POType | null;
  status?: string;
  total_amount?: number;
  tax_amount?: number;
  grand_total?: number;
  total_paid?: number;
  balance_amount?: number;
  payment_status?: string;
  material_status?: string;
  material_received_percentage?: number;
  notes?: string;
  is_interstate?: boolean;
  cgst_amount?: number;
  sgst_amount?: number;
  igst_amount?: number;
  created_at?: string;
};
type Tracking = {
  id: string;
  po_id: string;
  item_id?: string;
  item_description?: string;
  quantity_ordered: number;
  quantity_received: number;
  quantity_pending: number;
  status?: string;
  received_date?: string | null;
  created_at?: string;
  purchase_orders?: {
    po_number?: string;
    status?: string;
    vendors?: { name?: string };
  };
};

type PaymentDataType = {
  id?: number | string | null;
  po_id: number | string | null;
  transaction_type: string | null;
  amount_paid: string | number | null;
  payment_method: string | null;
  payment_reference_no: string | null;
  payment_proof: File | null;
  payment_date: string | null;
  status: string | null;
  remarks: string | null;
  purchase_order?: any;
  created_by: string | null;
};

export default function PurchaseOrders() {
  const { user, profile } = useAuth();
  const [pos, setPOs] = useState<PO[]>([]);
  const [showChallans, setShowChallans] = useState(false);
  const [trackingData, setTrackingData] = useState<Tracking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pdfUrl, setPdfUrl] = useState<any>("");
  const [poTypes, setPOTypes] = useState<POType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  // const [searchTerm, setSearchTerm] = useState("");
  const [filteredPOs, setFilteredPOs] = useState<any>([]);
  const [filteredTracking, setFilteredTracking] = useState<any>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showCreatePro, setShowCreatePro] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [allStoreManagementEmployee, setAllStoreManagementEmployee] =
    useState<any>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [paymentData, setPaymentData] = useState<PaymentDataType>({
    po_id: null,
    transaction_type: "payment",
    amount_paid: "",
    payment_method: "bank_transfer",
    payment_reference_no: "",
    payment_proof: null,
    payment_date: new Date().toISOString().split("T")[0],
    status: "pending",
    remarks: "",
    created_by: user?.id,
  });

  const [challanNumber, setChallanNumber] = useState("");
  const [challanImage, setChallanImage] = useState<File | null>(null);

  const [showApprovalButtons, setShowApprovalButtons] = useState<number | null>(
    null,
  );
  const [allChallans, setAllChallans] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">(
    "management",
  );
  const [showUpdateMaterialQuantity, setShowUpdateMaterialQuantity] =
    useState<boolean>(false);
  const [materialQuantity, setMaterialQuantity] = useState<number>(1);
  const [selectedTrackingMaterial, setSelectedTrackingMaterial] = useState<
    number | null
  >(null);

  const [selectedPOForUdate, setSelectedPOForUpdate] = useState<any>();
  const [allPurchaseOrderItems, setAllPurchaseOrderItems] = useState<any>([]);
  const [pdfLoading, setPdfLoading] = useState(false);

  const [items, setItems] = useState<any>([]);
  // Add these state variables near your other state declarations

  // Replace your useEffect that filters data with these new useEffect hooks
  // Add these state variables near your other state declarations
  const [searchFilters, setSearchFilters] = useState<{
    poNumber: string;
    vendor: string;
    project: string;
    amount: string;
    poStatus: string;
    material: string;
    payment: string;
    type: string;
    date: string;
  }>({
    poNumber: "",
    vendor: "",
    project: "",
    amount: "",
    poStatus: "",
    material: "",
    payment: "",
    type: "",
    date: "",
  });
  // Replace your useEffect that filters data with these new useEffect hooks
  // For tracking tab
  // useEffect(() => {
  //   const filtered = pos.filter((po) => {
  //     const matchesPoNumber = searchFilters.poNumber
  //       ? po.po_number
  //           ?.toLowerCase()
  //           .includes(searchFilters.poNumber.toLowerCase())
  //       : true;

  //     const matchesVendor = searchFilters.vendor
  //       ? po.vendors?.name
  //           ?.toLowerCase()
  //           .includes(searchFilters.vendor.toLowerCase())
  //       : true;

  //     const matchesProject = searchFilters.project
  //       ? po.projects?.name
  //           ?.toLowerCase()
  //           .includes(searchFilters.project.toLowerCase())
  //       : true;

  //     const matchesAmount = searchFilters.amount
  //       ? String(po.grand_total).includes(searchFilters.amount)
  //       : true;

  //     const matchesPoStatus = searchFilters.poStatus
  //       ? po.status
  //           ?.toLowerCase()
  //           .includes(searchFilters.poStatus.toLowerCase())
  //       : true;

  //     const matchesMaterial = searchFilters.material
  //       ? po.material_status
  //           ?.toLowerCase()
  //           .includes(searchFilters.material.toLowerCase())
  //       : true;

  //     const matchesPayment = searchFilters.payment
  //       ? po.payment_status
  //           ?.toLowerCase()
  //           .includes(searchFilters.payment.toLowerCase())
  //       : true;

  //     return (
  //       matchesPoNumber &&
  //       matchesVendor &&
  //       matchesProject &&
  //       matchesAmount &&
  //       matchesPoStatus &&
  //       matchesMaterial &&
  //       matchesPayment
  //     );
  //   });

  //   setFilteredPOs(filtered);
  // }, [pos, searchFilters]);

  // // For management tab
  // useEffect(() => {
  //   const filtered = pos.filter((po) => {
  //     const matchesPoNumber = searchFilters.poNumber
  //       ? po.po_number
  //           ?.toLowerCase()
  //           .includes(searchFilters.poNumber.toLowerCase())
  //       : true;

  //     const matchesVendor = searchFilters.vendor
  //       ? po.vendors?.name
  //           ?.toLowerCase()
  //           .includes(searchFilters.vendor.toLowerCase())
  //       : true;

  //     const matchesProject = searchFilters.project
  //       ? po.projects?.name
  //           ?.toLowerCase()
  //           .includes(searchFilters.project.toLowerCase())
  //       : true;

  //     const matchesType = searchFilters.type
  //       ? po.po_types?.name
  //           ?.toLowerCase()
  //           .includes(searchFilters.type.toLowerCase())
  //       : true;

  //     const matchesDate = searchFilters.date
  //       ? (po.po_date
  //           ? new Date(po.po_date).toLocaleDateString()
  //           : ""
  //         ).includes(searchFilters.date)
  //       : true;

  //     const matchesAmount = searchFilters.amount
  //       ? String(po.grand_total).includes(searchFilters.amount)
  //       : true;

  //     const matchesStatus = searchFilters.poStatus
  //       ? po.status
  //           ?.toLowerCase()
  //           .includes(searchFilters.poStatus.toLowerCase())
  //       : true;

  //     return (
  //       matchesPoNumber &&
  //       matchesVendor &&
  //       matchesProject &&
  //       matchesType &&
  //       matchesDate &&
  //       matchesAmount &&
  //       matchesStatus
  //     );
  //   });

  //   setFilteredPOs(filtered);
  // }, [pos, searchFilters]);


  // REPLACE BOTH useEffect hooks with this SINGLE one:
useEffect(() => {
  if (activeTab === "tracking") {
    // Tracking tab filters
    const filtered = pos.filter((po) => {
      const matchesPoNumber = searchFilters.poNumber
        ? po.po_number
            ?.toLowerCase()
            .includes(searchFilters.poNumber.toLowerCase())
        : true;

      const matchesVendor = searchFilters.vendor
        ? po.vendors?.name
            ?.toLowerCase()
            .includes(searchFilters.vendor.toLowerCase())
        : true;

      const matchesProject = searchFilters.project
        ? po.projects?.name
            ?.toLowerCase()
            .includes(searchFilters.project.toLowerCase())
        : true;

      const matchesAmount = searchFilters.amount
        ? String(po.grand_total).includes(searchFilters.amount)
        : true;

      const matchesPoStatus = searchFilters.poStatus
        ? po.status
            ?.toLowerCase()
            .includes(searchFilters.poStatus.toLowerCase())
        : true;

      const matchesMaterial = searchFilters.material
        ? po.material_status
            ?.toLowerCase()
            .includes(searchFilters.material.toLowerCase())
        : true;

      const matchesPayment = searchFilters.payment
        ? po.payment_status
            ?.toLowerCase()
            .includes(searchFilters.payment.toLowerCase())
        : true;

      return (
        matchesPoNumber &&
        matchesVendor &&
        matchesProject &&
        matchesAmount &&
        matchesPoStatus &&
        matchesMaterial &&
        matchesPayment
      );
    });

    setFilteredPOs(filtered);
  } else if (activeTab === "management") {
    // Management tab filters
    const filtered = pos.filter((po) => {
      const matchesPoNumber = searchFilters.poNumber
        ? po.po_number
            ?.toLowerCase()
            .includes(searchFilters.poNumber.toLowerCase())
        : true;

      const matchesVendor = searchFilters.vendor
        ? po.vendors?.name
            ?.toLowerCase()
            .includes(searchFilters.vendor.toLowerCase())
        : true;

      const matchesProject = searchFilters.project
        ? po.projects?.name
            ?.toLowerCase()
            .includes(searchFilters.project.toLowerCase())
        : true;

      const matchesType = searchFilters.type
        ? po.po_types?.name
            ?.toLowerCase()
            .includes(searchFilters.type.toLowerCase())
        : true;

      const matchesDate = searchFilters.date
        ? (po.po_date
            ? new Date(po.po_date).toLocaleDateString()
            : ""
          ).includes(searchFilters.date)
        : true;

      const matchesAmount = searchFilters.amount
        ? String(po.grand_total).includes(searchFilters.amount)
        : true;

      const matchesStatus = searchFilters.poStatus
        ? po.status
            ?.toLowerCase()
            .includes(searchFilters.poStatus.toLowerCase())
        : true;

      return (
        matchesPoNumber &&
        matchesVendor &&
        matchesProject &&
        matchesType &&
        matchesDate &&
        matchesAmount &&
        matchesStatus
      );
    });

    setFilteredPOs(filtered);
  }
}, [pos, searchFilters, activeTab]); // ✅ ADD activeTab to dependencies
  // Handler for search filter changes
  const handleSearchFilterChange = (
    column: keyof typeof searchFilters,
    value: string,
  ) => {
    setSearchFilters((prev) => ({
      ...prev,
      [column]: value,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchFilters({
      poNumber: "",
      vendor: "",
      project: "",
      amount: "",
      poStatus: "",
      material: "",
      payment: "",
      type: "",
      date: "",
    });
  };

  // localStorage keys
  const KEY_VENDORS = "mock_vendors_v1";
  const KEY_PROJECTS = "mock_projects_v1";
  const KEY_PO_TYPES = "mock_po_types_v1";
  const KEY_POS = "mock_pos_v1";
  const KEY_TRACKING = "mock_tracking_v1";

  // --- Default mock data ---
  const defaultVendors: Vendor[] = [
    {
      id: "v_1",
      name: "Acme Supplies",
      phone: "9999999999",
      email: "acme@example.com",
      is_active: true,
    },
    {
      id: "v_2",
      name: "Builder Co",
      phone: "8888888888",
      email: "builder@example.com",
      is_active: true,
    },
  ];

  const defaultProjects: Project[] = [
    { id: "p_1", name: "Site A", is_active: true },
    { id: "p_2", name: "Site B", is_active: true },
  ];

  const defaultPOTypes: POType[] = [
    { id: "t_1", name: "Standard", is_active: true },
    { id: "t_2", name: "Urgent", is_active: true },
  ];

  const defaultPOs: PO[] = [
    {
      id: "po_1",
      po_number: "PO-1001",
      po_date: new Date().toISOString(),
      vendor_id: "v_1",
      delivery_date: "2025-12-26",
      vendors: defaultVendors[0],
      project_id: "p_1",
      projects: defaultProjects[0],
      po_type_id: "t_1",
      po_types: defaultPOTypes[0],
      status: "pending",
      total_amount: 50000,
      tax_amount: 9000,
      grand_total: 59000,
      total_paid: 0,
      balance_amount: 59000,
      payment_status: "pending",
      material_status: "pending",
      material_received_percentage: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: "po_2",
      po_number: "PO-1002",
      po_date: new Date().toISOString(),
      vendor_id: "v_2",
      delivery_date: "2025-12-26",
      vendors: defaultVendors[1],
      project_id: "p_2",
      projects: defaultProjects[1],
      po_type_id: "t_2",
      po_types: defaultPOTypes[1],
      status: "approved",
      total_amount: 120000,
      tax_amount: 21600,
      grand_total: 141600,
      total_paid: 50000,
      balance_amount: 91600,
      payment_status: "partial",
      material_status: "partial",
      material_received_percentage: 50,
      created_at: new Date().toISOString(),
    },
  ];

  const defaultTracking: Tracking[] = [
    {
      id: "tr_1",
      po_id: "po_1",
      item_id: "itm_001",
      item_description: "Cement Bags",
      quantity_ordered: 100,
      quantity_received: 0,
      quantity_pending: 100,
      status: "pending",
      created_at: new Date().toISOString(),
      purchase_orders: {
        po_number: "PO-1001",
        status: "pending",
        vendors: { name: defaultVendors[0].name },
      },
    },
    {
      id: "tr_2",
      po_id: "po_2",
      item_id: "itm_002",
      item_description: "Steel Rods",
      quantity_ordered: 200,
      quantity_received: 100,
      quantity_pending: 100,
      status: "partial",
      created_at: new Date().toISOString(),
      purchase_orders: {
        po_number: "PO-1002",
        status: "approved",
        vendors: { name: defaultVendors[1].name },
      },
    },
  ];

  const loadAllStoreManagementEmployee = async () => {
    const res: any = await UsersApi.list();
    setAllStoreManagementEmployee(res ?? []);
  };
  useEffect(() => {
    loadAllStoreManagementEmployee();
  }, []);

  // --- Util: load from localStorage or defaults ---

  const loadVendor = async () => {
    try {
      const response = await vendorApi.getVendors();
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadProjects = async () => {
    try {
      const response: any = await projectApi.getProjects();
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const loadPO_Type = async () => {
    try {
      const response = await poTypeApi.getPOTypes();
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadPOS = async () => {
    try {
      const response = await poApi.getPOs();
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadTrackings = async () => {
    try {
      const response = await po_trackingApi.getTrackings();
      return response;
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllData = () => {
    loadAllPOsItems();
    let sv: any = [];
    let sp: any = [];
    let st: any = [];
    let spo: any = [];
    let strack: any = [];
    loadVendor().then((d) => {
      sv = d;
    });
    loadProjects().then((d) => {
      sp = d;
    });
    loadPO_Type().then((d) => {
      st = d;
    });
    loadPOS().then((d) => {
      spo = d;
    });
    loadTrackings().then((d) => {
      strack = d;
    });
    setLoading(true);
    const t = setTimeout(() => {
      const vs: Vendor[] = sv ? sv : defaultVendors;
      const ps: Project[] = sp ? sp : defaultProjects;
      const ts: POType[] = st ? st : defaultPOTypes;
      const poList: PO[] = spo ? spo : defaultPOs;
      const trackingList: Tracking[] = strack ? strack : defaultTracking;
      // console.log(poList, "po list data");
      // link vendor/project/type objects into POs for convenience
      const poWithRelations = poList.map((p) => ({
        ...p,
        vendors: vs.find((v) => v.id === p.vendor_id) ?? p.vendors ?? null,
        projects:
          ps.find((pr) => String(pr.id) === p.project_id) ?? p.projects ?? null,
        po_types:
          ts.find((t) => String(t.id) === p.po_type_id) ?? p.po_types ?? null,
      }));
      // console.log(poWithRelations, "resultssss");

      // link purchase_orders into tracking items
      const trackingWithPO = trackingList.map((t) => ({
        ...t,
        purchase_orders: poWithRelations.find((p) => p.id === t.po_id)
          ? {
              po_number: poWithRelations.find((p) => p.id === t.po_id)!
                .po_number,
              status: poWithRelations.find((p) => p.id === t.po_id)!.status,
              vendors: {
                name: poWithRelations.find((p) => p.id === t.po_id)!.vendors
                  ?.name,
              },
            }
          : t.purchase_orders,
      }));

      // console.log("venders results", vs);
      // console.log("projects results", ps);
      // console.log("Types results", ts);
      // console.log("PO with Relations results", poWithRelations);
      // console.log("tracking with po", trackingWithPO);

      setVendors(vs);
      setProjects(ps);
      setPOTypes(ts);
      setPOs(poWithRelations);
      setTrackingData(trackingWithPO);

      setLoading(false);
    }, 250);
    return () => clearTimeout(t);
  };

  useEffect(() => {
    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  // --- Persist helpers ---
  const persistPOs = (newPOs: PO[]) => {
    // Save minimal representation (without nested objects) so load is consistent
    const toSave = newPOs.map((p) => ({
      ...p,
      vendors: undefined,
      projects: undefined,
      po_types: undefined,
    }));
    localStorage.setItem(KEY_POS, JSON.stringify(toSave));
    setPOs(newPOs);
  };

  const persistTracking = (newTracking: Tracking[]) => {
    localStorage.setItem(KEY_TRACKING, JSON.stringify(newTracking));
    setTrackingData(newTracking);
  };

  const persistMasters = (v: Vendor[], p: Project[], t: POType[]) => {
    localStorage.setItem(KEY_VENDORS, JSON.stringify(v));
    localStorage.setItem(KEY_PROJECTS, JSON.stringify(p));
    localStorage.setItem(KEY_PO_TYPES, JSON.stringify(t));
    setVendors(v);
    setProjects(p);
    setPOTypes(t);
  };

  // --- Permissions: admin gets everything, others follow profile.permissions ---
  const can = (permission: string) => {
    // Try these fields for role - adapt if your backend uses different field names
    const role =
      (profile as any)?.role_name ??
      (profile as any)?.role ??
      (user as any)?.role ??
      null;

    // If admin — grant all access
    if (role === "admin") return true;

    // fallback to permissions object if present on profile
    const perms: Record<string, boolean> | null =
      (profile as any)?.permissions ?? null;

    if (perms && typeof perms === "object") {
      return Boolean(perms[permission]);
    }

    // Default: deny
    return false;
  };

  // --- Data operations (mocked) ---
  const loadPOs = async () => {
    setLoading(true);
    setTimeout(() => {
      const sv = localStorage.getItem(KEY_VENDORS);
      const sp = localStorage.getItem(KEY_PROJECTS);
      const st = localStorage.getItem(KEY_PO_TYPES);
      const spo = localStorage.getItem(KEY_POS);

      const vs: Vendor[] = sv ? JSON.parse(sv) : defaultVendors;
      const ps: Project[] = sp ? JSON.parse(sp) : defaultProjects;
      const ts: POType[] = st ? JSON.parse(st) : defaultPOTypes;
      const poList: PO[] = spo ? JSON.parse(spo) : defaultPOs;

      const poWithRelations = poList.map((p) => ({
        ...p,
        vendors: vs.find((v) => v.id === p.vendor_id) ?? p.vendors ?? null,
        projects: ps.find((pr) => pr.id === p.project_id) ?? p.projects ?? null,
        po_types: ts.find((t) => t.id === p.po_type_id) ?? p.po_types ?? null,
      }));

      setPOs(poWithRelations);
      setLoading(false);
    }, 200);
  };

  const loadTrackingData = async () => {
    setLoading(true);
    setTimeout(() => {
      const strack = localStorage.getItem(KEY_TRACKING);
      const spo = localStorage.getItem(KEY_POS);
      const poList: PO[] = spo ? JSON.parse(spo) : defaultPOs;
      const trackingList: Tracking[] = strack
        ? JSON.parse(strack)
        : defaultTracking;

      const trackingWithPO = trackingList.map((t) => ({
        ...t,
        purchase_orders: {
          po_number: poList.find((p) => p.id === t.po_id)?.po_number,
          status: poList.find((p) => p.id === t.po_id)?.status,
          vendors: {
            name: vendors.find(
              (v) => v.id === poList.find((p) => p.id === t.po_id)?.vendor_id,
            )?.name,
          },
        },
      }));
      setTrackingData(trackingWithPO);
      setLoading(false);
    }, 200);
  };

  const loadMasterData = async () => {
    setLoading(true);
    setTimeout(() => {
      const sv = localStorage.getItem(KEY_VENDORS);
      const sp = localStorage.getItem(KEY_PROJECTS);
      const st = localStorage.getItem(KEY_PO_TYPES);

      const vs: Vendor[] = sv ? JSON.parse(sv) : defaultVendors;
      const ps: Project[] = sp ? JSON.parse(sp) : defaultProjects;
      const ts: POType[] = st ? JSON.parse(st) : defaultPOTypes;

      persistMasters(vs, ps, ts);
      setLoading(false);
    }, 150);
  };

  // --- Handlers ---
  const handleView = async (po: any) => {
    // const blob = await pdf(<PurchaseOrderPDF />).toBlob();
    // window.open(URL.createObjectURL(blob));
    // console.log(po, "from pdf preview");
    if (!po) return;
    if (!allPurchaseOrderItems) {
      toast.success("wait data is loading");
      return;
    }

    const itemsList = allPurchaseOrderItems.filter(
      (d: any) => d.po_id === po.id,
    );

    const result = itemsList.map((item: any) => {
      let materialTrackingId = null;

      for (let i = 0; i < filteredTracking.length; i++) {
        if (
          String(filteredTracking[i].item_id) === String(item.item_id) &&
          String(filteredTracking[i].po_id) === String(item.po_id)
        ) {
          materialTrackingId = filteredTracking[i].id; // ONLY ONE VALUE
          break;
        }
      }

      return {
        ...item,
        materialTrackingId: materialTrackingId,
      };
    });

    const data: any = {
      po_number: po.po_number,
      po_date: po.po_date,
      vendor_name: po.vendor_name,
      vendor_address: `${po.vendors.name}, ${po.vendors.office_street}, ${po.vendors.office_city}, ${po.vendors.office_state}, ${po.vendors.office_country} - ${po.vendors.office_pincode}`,
      vendor_gstn: po.vendors.gst_number,
      vendor_phone: po.vendors.company_phone,
      po_items: result,
      po_terms_and_conditions: po.terms_and_conditions
        ? po.terms_and_conditions
            .replace(/,\s*$/, "") // remove trailing comma if exists
            .split(",") // split into array
            .map((t: any) => t.trim()) // clean spaces
            .filter(Boolean)
        : [],
    };
    // console.log(data, "data values from preview");
    setPdfLoading(true);
    setSelectedPO(data);
    setShowViewModal(true);

    // Small delay to ensure state is updated
    setTimeout(() => {
      setPdfLoading(false);
    }, 100);
  };

  const updateMaterialQuantity = async (e: React.FormEvent) => {
    e.preventDefault();

    const trackingMaterialData = filteredTracking.find(
      (item: any) => item.id === selectedTrackingMaterial,
    );

    if (
      materialQuantity < 1 ||
      materialQuantity > Number(trackingMaterialData.quantity_pending) ||
      !materialQuantity ||
      !challanNumber
    ) {
      toast.error("Invalid input.");
      return;
    }

    const formData = new FormData();
    formData.append("quantity_received", String(materialQuantity));
    formData.append(
      "quantity_pending",
      String(
        Number(trackingMaterialData.quantity_pending) -
          Number(materialQuantity),
      ),
    );
    formData.append("challan_number", challanNumber);
    formData.append("from_person", from);
    formData.append("to_person", to);

    if (challanImage) {
      formData.append("challan_image", challanImage);
    }

    await po_trackingApi.updateMaterialQty(selectedTrackingMaterial, formData);

    toast.success("Received Material Quantity Updated");
    setShowUpdateMaterialQuantity(false);
    loadAllData();
  };

  const handleDelete = async (id: any) => {
    const result: any = await MySwal.fire({
      title: "Delete Item?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
    });

    if (!result.isConfirmed) return;
    await poApi.deletePurchaseOrder(id);
    const filterdData = filteredPOs.filter((item: any) => item.id != id);
    const filterdTrackingData = filteredTracking.filter(
      (item: any) => item.po_id != id,
    );
    setFilteredPOs(filterdData);
    setFilteredTracking(filterdTrackingData);
    // const updated = pos.filter((p) => p.id !== id);
    // setPOs(updated);
    toast.success("PO deleted successfully!");
  };

  const updatePurchaseOrderStatus = async (id: string, status: string) => {
    try {
      const result: any = await MySwal.fire({
        title: status.charAt(0).toUpperCase() + status.slice(1),
        text: `Are you sure you want to ${
          status === "authorize"
            ? status
            : status === "approved"
              ? "approve"
              : "reject"
        } this purchase order`,
        icon: "warning",
        showCancelButton: true,
      });

      if (!result.isConfirmed) return;

      const approveRes: any = await poApi.updatePurchaseOrderStatus(id, status);
      if (approveRes.status) {
        toast.success(
          "Purchase order status updated to " +
            status.toLocaleUpperCase() +
            ".",
        );
        setShowApprovalButtons(null);
        loadAllData();
      } else {
        toast.error(
          "Failed to update purchase order status." +
            status.toLocaleUpperCase(),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const newTotalPaid = (selectedPO.total_paid || 0) + paymentAmount;
    const newBalance = (selectedPO.grand_total || 0) - newTotalPaid;
    const paymentStatus =
      newBalance === 0 ? "paid" : newTotalPaid > 0 ? "partial" : "pending";

    const updated = pos.map((p) =>
      p.id === selectedPO.id
        ? {
            ...p,
            total_paid: newTotalPaid,
            balance_amount: newBalance,
            payment_status: paymentStatus,
          }
        : p,
    );

    persistPOs(updated);
    setTimeout(() => {
      toast.success("Payment recorded successfully!");
      setShowPaymentModal(false);
      setPaymentAmount(0);
      setSelectedPO(null);
      loadPOs();
    }, 300);
  };

  // --- Filtering helpers ---

  // useEffect(() => {
  //   // console.log(" from use effect after updating pos");
  //   const posData = pos.filter(
  //     (po) =>
  //       po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       po.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       po.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       po.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  //   );
  //   setFilteredPOs(posData);

  //   const trackData = trackingData.filter(
  //     (t) =>
  //       t.item_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       t.purchase_orders?.po_number
  //         ?.toLowerCase()
  //         .includes(searchTerm.toLowerCase()) ||
  //       t.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  //   );
  //   setFilteredTracking(trackData);
  // }, [pos, trackingData, searchTerm]);

  const loadItems = async () => {
    try {
      const data = await ItemsApi.getItems();
      const updatedData = data.map((item) => ({
        ...item,
        id: String(item.id),
      }));
      setItems(updatedData);
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllPOsItems = async () => {
    try {
      const data: any = await poApi.getPOsItems();
      setAllPurchaseOrderItems(data.data);
      // console.log(data, "from purchase orders items");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-100 text-gray-700",
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-orange-100 text-orange-700",
      rejected: "bg-red-100 text-red-700",
      completed: "bg-blue-100 text-blue-700",
      cancelled: "bg-red-100 text-red-700",
      authorize: "bg-green-100 text-green-700",
    };
    return (status && colors[status]) || "bg-gray-100 text-gray-700";
  };

  const getPaymentStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      pending: "bg-red-100 text-red-700",
      partial: "bg-yellow-100 text-yellow-700",
      paid: "bg-green-100 text-green-700",
      completed: "bg-green-100 text-green-700",
    };
    return (status && colors[status]) || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  const viewPoPdf = async (id: number, type = "view") => {
    try {
      setPdfLoading(true);
      setShowViewModal(type === "view");
      const res = await axios.get(
        import.meta.env.VITE_API_URL + "/pdf/po/" + id,
        {
          responseType: "blob", // IMPORTANT: treat response as binary
        },
      );
      const fileURL = URL.createObjectURL(res.data);
      if (type === "view") {
        setPdfUrl(fileURL);
        setPdfLoading(false);
      } else {
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = `PO_${id}.pdf`; // filename
        document.body.appendChild(a);

        // 4️⃣ Trigger click to download
        a.click();
        setPdfLoading(false);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentData((prev) => ({ ...prev, payment_proof: file }));
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedPO) {
        toast.error("No PO selected");
        return;
      }

      if (!can("make_payments")) {
        toast.error("You don't have permission to make payments");
        return;
      }

      if (Number(paymentData.amount_paid) <= 0) {
        toast.error("Enter a valid amount");
        return;
      }

      if ((paymentData.payment_reference_no || "")?.length <= 0) {
        toast.error("Enter valid reference number");
        return;
      }

      if (!paymentData.payment_proof) {
        toast.error("Upload valid payment proof");
        return;
      }

      const newPayment: PaymentDataType = {
        po_id: paymentData.po_id,
        transaction_type: paymentData.transaction_type?.toUpperCase() || "",
        amount_paid: paymentData.amount_paid,
        payment_method: paymentData.payment_method?.toUpperCase() || "",
        payment_reference_no: paymentData.payment_reference_no,
        payment_proof: paymentData.payment_proof,
        payment_date: paymentData.payment_date,
        status: paymentData.status?.toUpperCase() || "",
        remarks: paymentData.remarks,
        created_by: user?.id,
      };

      setSubmitting(true);
      const res: any = await poPaymentApi.createPayment(newPayment);

      if (res.success) {
        loadAllData();
        toast.success("Payment recorded successfully!");
        setShowPaymentModal(false);
        setSelectedPO(null);
        setPaymentData({
          po_id: null,
          transaction_type: "payment",
          amount_paid: "",
          payment_method: "bank_transfer",
          payment_reference_no: "",
          payment_proof: null,
          payment_date: new Date().toISOString().split("T")[0],
          status: "pending",
          remarks: "",
          created_by: user?.id,
        });
      } else {
        toast.error("Failed to create payment record");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to process payment");
    } finally {
      setSubmitting(false);
    }
  };

  const openPaymentModal = (po: PO) => {
    setSelectedPO(po);
    setPaymentData({
      ...paymentData,
      amount_paid: String(po.balance_amount) || String(po.grand_total),
      payment_date: new Date().toISOString().split("T")[0],
      po_id: po.id,
    });
    setShowPaymentModal(true);
  };

  // --- UI states while loading ---
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading purchase orders...</p>
        </div>
      </div>
    );
  }

  // --- Render main UI ---
  return (
    <div className="p-1 -mt-2">
      <div className=" sticky top-20 z-20 flex flex-col gap-2 mb-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Tabs */}
        <div className=" w-full sm:flex-1">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab("tracking")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "tracking"
              ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              PO Tracking
            </button>

            <button
              onClick={() => setActiveTab("management")}
              className={`flex-1 flex items-center justify-center gap-1.5
          px-2 py-2
          text-[11px] sm:text-sm
          font-medium transition
          ${
            activeTab === "management"
              ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:bg-gray-50"
          }`}
            >
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              PO Management
            </button>
          </div>
        </div>

        {/* Create PO Button */}
        {can("create_pos") && (
          <button
            onClick={() => setShowCreatePro(true)}
            className="
        w-full sm:w-auto
        bg-[#C62828] text-white
        px-3 py-2
        sm:px-5 sm:py-2
        rounded-lg
        flex items-center justify-center gap-1.5
        text-[11px] sm:text-sm
        shadow-sm
        hover:bg-[#A62222]
        transition
        whitespace-nowrap
      "
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Create PO
          </button>
        )}
      </div>

      {showCreatePro && (
        <CreatePurchaseOrderForm
          setShowCreatePro={setShowCreatePro}
          loadAllData={loadAllData}
        />
      )}

      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* PO Overview */}
          <div className="     bg-white rounded-xl shadow-sm border border-gray-200 ">
      <div className="overflow-y-auto max-h-[calc(100vh-200px)] md:max-h-[calc(100vh-170px)] ">
    <table className="w-full min-w-[800px]">
<thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">                  {/* Header Row */}
                  <tr>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        PO Number
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Vendor
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Project
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Amount
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        PO Status
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Material
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Payment
                      </div>
                    </th>
                    <th className="px-3 md:px-4 py-2 text-left">
                      <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </div>
                    </th>
                  </tr>

                  {/* Search Row - Separate Row Below Headers */}
                  {/* Tracking Tab - Search Row */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {/* PO Number Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="PO Number..."
                        value={searchFilters.poNumber}
                        onChange={(e) =>
                          handleSearchFilterChange("poNumber", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Vendor Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Vendor..."
                        value={searchFilters.vendor}
                        onChange={(e) =>
                          handleSearchFilterChange("vendor", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Project Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Project..."
                        value={searchFilters.project}
                        onChange={(e) =>
                          handleSearchFilterChange("project", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Amount Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Amount..."
                        value={searchFilters.amount}
                        onChange={(e) =>
                          handleSearchFilterChange("amount", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* PO Status Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Status..."
                        value={searchFilters.poStatus}
                        onChange={(e) =>
                          handleSearchFilterChange("poStatus", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Material Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Material..."
                        value={searchFilters.material}
                        onChange={(e) =>
                          handleSearchFilterChange("material", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Payment Column Search */}
                    <td className="px-3 md:px-4 py-1">
                      <input
                        type="text"
                        placeholder="Payment..."
                        value={searchFilters.payment}
                        onChange={(e) =>
                          handleSearchFilterChange("payment", e.target.value)
                        }
                        className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      />
                    </td>

                    {/* Actions Column - Clear Filter Button */}
                    <td className="px-3 md:px-4 py-1 text-center">
                      <button
                        onClick={clearAllFilters}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                        title="Clear Filters"
                      >
                        <XCircle className="w-3 h-3 mr-0.5" />
                        Clear
                      </button>
                    </td>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPOs.map((po: any) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 md:px-4 py-3">
                        <span className="font-medium text-blue-600 text-xs md:text-sm">
                          {po.po_number}
                        </span>
                        <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                          {po.po_date
                            ? new Date(po.po_date).toLocaleDateString()
                            : ""}
                        </p>
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
                        {po.vendors?.name || "N/A"}
                      </td>
                      <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
                        {po.projects?.name || "N/A"}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span className="font-semibold text-gray-800 text-xs md:text-sm">
                          {formatCurrency(po.grand_total)}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                            po.status,
                          )}`}
                        >
                          {po.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${
                            po.material_status === "completed"
                              ? "bg-green-100 text-green-700"
                              : po.material_status === "partial"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {po.material_status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <span
                          className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getPaymentStatusColor(
                            po.payment_status,
                          )}`}
                        >
                          {po.payment_status?.toUpperCase() || "PENDING"}
                        </span>
                        {po.balance_amount! > 0 && (
                          <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
                            Bal: {formatCurrency(po.balance_amount)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 md:px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5 md:gap-2">
                          <button
                            onClick={() => handleView(po)}
                            className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "management" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-y-auto max-h-[calc(100vh-190px)] md:max-h-[calc(100vh-170px)] ">
         <table className="w-full min-w-[800px]">
<thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">                {/* Header Row */}
                <tr>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      PO Number
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Vendor
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Project
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </div>
                  </th>
                  <th className="px-3 md:px-4 py-2 text-left">
                    <div className="text-[10px] md:text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
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

                {/* Search Row - Separate Row Below Headers */}
                {/* Management Tab - Search Row */}
                <tr className="bg-gray-50 border-b border-gray-200">
                  {/* PO Number Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="PO Number..."
                      value={searchFilters.poNumber}
                      onChange={(e) =>
                        handleSearchFilterChange("poNumber", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Vendor Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Vendor..."
                      value={searchFilters.vendor}
                      onChange={(e) =>
                        handleSearchFilterChange("vendor", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Project Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Project..."
                      value={searchFilters.project}
                      onChange={(e) =>
                        handleSearchFilterChange("project", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Type Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Type..."
                      value={searchFilters.type}
                      onChange={(e) =>
                        handleSearchFilterChange("type", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Date Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Date..."
                      value={searchFilters.date}
                      onChange={(e) =>
                        handleSearchFilterChange("date", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Amount Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Amount..."
                      value={searchFilters.amount}
                      onChange={(e) =>
                        handleSearchFilterChange("amount", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Status Column Search */}
                  <td className="px-3 md:px-4 py-1">
                    <input
                      type="text"
                      placeholder="Status..."
                      value={searchFilters.poStatus}
                      onChange={(e) =>
                        handleSearchFilterChange("poStatus", e.target.value)
                      }
                      className="w-full px-2 py-1 text-[9px] md:text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                    />
                  </td>

                  {/* Actions Column - Clear Filter Button */}
                  <td className="px-3 md:px-4 py-1 text-center">
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center px-2 py-1 border border-gray-300 rounded hover:bg-gray-50 transition text-[9px] md:text-xs font-medium text-gray-700"
                      title="Clear Filters"
                    >
                      <XCircle className="w-3 h-3 mr-0.5" />
                      Clear
                    </button>
                  </td>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po: any) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 md:px-4 py-3">
                      <span className="font-medium text-blue-600 text-xs md:text-sm">
                        {po.po_number}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
                      {po.vendors?.name || "N/A"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[120px]">
                      {po.projects?.name || "N/A"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm truncate max-w-[80px]">
                      {po.po_types?.name || "N/A"}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-gray-700 text-xs md:text-sm whitespace-nowrap">
                      {po.po_date
                        ? new Date(po.po_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span className="font-semibold text-gray-800 text-xs md:text-sm">
                        {formatCurrency(po.grand_total)}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <span
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-medium ${getStatusColor(
                          po.status,
                        )}`}
                      >
                        {po.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 md:px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => {
                            viewPoPdf(po.id, "download");
                            setPdfUrl(po.id);
                          }}
                          disabled={pdfLoading}
                          className="p-1.5 md:p-2 text-black hover:bg-blue-50 rounded-lg transition"
                          title="Download PDF"
                        >
                          {pdfLoading && pdfUrl === po.id ? (
                            <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                          ) : (
                            <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            viewPoPdf(po.id);
                          }}
                          className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View PDF"
                        >
                          <FileText className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        </button>
                        {can("edit_pos") && po.status === "draft" && (
                          <button
                            onClick={async () => {
                              if (!allPurchaseOrderItems) {
                                toast.success("wait data is loading");
                                return;
                              }
                              const itemsList = allPurchaseOrderItems.filter(
                                (d: any) => d.po_id === po.id,
                              );
                              const result = itemsList.map((item: any) => {
                                let materialTrackingId = null;

                                for (
                                  let i = 0;
                                  i < filteredTracking.length;
                                  i++
                                ) {
                                  if (
                                    String(filteredTracking[i].item_id) ===
                                      String(item.item_id) &&
                                    String(filteredTracking[i].po_id) ===
                                      String(item.po_id)
                                  ) {
                                    materialTrackingId = filteredTracking[i].id;
                                    break;
                                  }
                                }

                                return {
                                  ...item,
                                  materialTrackingId: materialTrackingId,
                                };
                              });

                              const vendorTerms: any =
                                (await TermsConditionsApi.getByIdVendorTC(
                                  po.vendor_id,
                                )) || [];

                              const selected_terms_idsData = JSON.parse(
                                po.selected_terms_ids,
                              );

                              const terms_and_conditionsData =
                                JSON.parse(po.terms_and_conditions) || [];

                              const terms =
                                vendorTerms.filter((term: any) =>
                                  selected_terms_idsData.includes(term.id),
                                ) || [];

                              terms_and_conditionsData.forEach(
                                (element: any) => {
                                  terms.push(element);
                                },
                              );

                              const formatedTerms: any = Object.values(
                                terms.reduce((acc: any, item: any) => {
                                  const key = item.category;

                                  if (!acc[key]) {
                                    acc[key] = {
                                      id: item.id,
                                      vendor_id: item.vendor_id,
                                      category: item.category,
                                      content: [],
                                      is_active: item.is_active,
                                    };
                                  }
                                  acc[key].content.push({
                                    category: item.category,
                                    content: item.content,
                                    is_default: Boolean(true),
                                    term_id: item.id,
                                  });
                                  acc[key].isActive = false;

                                  return acc;
                                }, {}),
                              );

                              const data = {
                                poId: po.id,
                                advance_amount: po.advance_amount,
                                cgst_amount: po.cgst_amount,
                                delivery_date: po.delivery_date.slice(0, 10),
                                due_date: po.due_date,
                                discount_amount: po.discount_amount,
                                discount_percentage: po.discount_percentage,
                                grand_total: po.grand_total,
                                igst_amount: po.igst_amount,
                                is_interstate: Boolean(po.is_interstate),
                                items: result,
                                notes: po.notes ?? "",
                                payment_terms_id: po.payment_terms_id ?? "",
                                po_date: po.po_date.slice(0, 10) ?? "",
                                po_number: po.po_number ?? "",
                                po_type_id: Number(po.po_type_id),
                                project_id: Number(po.project_id),
                                selected_terms_ids: po.selected_terms_ids,
                                sgst_amount: po.sgst_amount ?? 0,
                                subtotal: po.subtotal ?? 0,
                                taxable_amount: po.taxable_amount ?? 0,
                                terms_and_conditions: formatedTerms ?? [],
                                total_gst_amount: po.total_gst_amount ?? 0,
                                vendor_id: Number(po.vendor_id),
                              };

                              setSelectedPOForUpdate(data);
                              setShowEditModal(true);
                            }}
                            className="p-1.5 md:p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        )}

                        {can("delete_pos") && po.status === "draft" && (
                          <button
                            onClick={() => {
                              handleDelete(po.id);
                            }}
                            className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          </button>
                        )}
                        {can("make_payments") &&
                          po.balance_amount! > 0 &&
                          po.status === "authorize" && (
                            <button
                              onClick={() => {
                                openPaymentModal(po);
                              }}
                              className="p-1.5 md:p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Make Payment"
                            >
                              <IndianRupee className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </button>
                          )}
                        <div className="relative">
                          {showApprovalButtons === po.id && (
<div className="absolute -top-16 right-2 z-50 space-x-3 bg-white flex shadow-xl px-6 py-3 rounded-md border border-slate-300">                              {can("approve_pos") && po.status === "draft" && (
                                <button
                                  onClick={() =>
                                    updatePurchaseOrderStatus(po.id, "approved")
                                  }
                                  className="p-2 px-6 text-white bg-green-600 hover:bg-green-500 rounded-lg transition flex items-center text-xs"
                                  title="Approve"
                                >
                                  <Check size={20} className="w-4 h-4 mr-2" />
                                  Approve
                                </button>
                              )}

                              {can("authorize_pos") &&
                                po.status === "approved" && (
                                  <button
                                    onClick={() => {
                                      updatePurchaseOrderStatus(
                                        po.id,
                                        "authorize",
                                      );
                                    }}
                                    className="p-2 px-6 text-white bg-green-600 hover:bg-green-500 rounded-lg transition flex items-center text-xs"
                                    title="Authorize"
                                  >
                                    <Check className="w-4 h-4" /> Authorize
                                  </button>
                                )}
                              {(can("approve_pos") || can("authorize_pos")) &&
                                (po.status === "draft" ||
                                  po.status === "approved") && (
                                  <button
                                    onClick={() =>
                                      updatePurchaseOrderStatus(
                                        po.id,
                                        "rejected",
                                      )
                                    }
                                    className="p-2 px-6 text-white bg-red-600 hover:bg-red-500 rounded-lg transition flex items-center text-xs"
                                    title="Reject"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" /> Reject
                                  </button>
                                )}
                            </div>
                          )}
                          {can("edit_pos") &&
                            po.status !== "authorize" &&
                            po.status !== "rejected" && (
                              <button
                                onClick={() => {
                                  if (showApprovalButtons === po.id) {
                                    setShowApprovalButtons(null);
                                  } else {
                                    setShowApprovalButtons(po.id);
                                  }
                                }}
                                className="p-1.5 md:p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                title={`${
                                  (po.status === "approved" && "Authorize") ||
                                  (po.status === "draft" && "Approve")
                                }`}
                              >
                                <FileCheck2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              </button>
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPOs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm md:text-lg font-medium">
                No purchase orders found
              </p>
              <p className="text-gray-500 text-xs md:text-sm mt-2">
                {'Click "Create PO" to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className=" bg-[#C62828] px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Purchase Order PDF Preveiw
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className=" overflow-y-auto max-h-[900px]">
              {pdfLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading PDF preview...</p>
                  </div>
                </div>
              ) : (
                <div>
                  {pdfUrl && (
                    <iframe
                      src={pdfUrl}
                      width="100%"
                      height="600"
                      style={{ border: "none" }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <UpdatePurchaseOrderForm
          setShowEditModal={setShowEditModal}
          selectedPO={selectedPOForUdate}
          loadAllData={loadAllData}
        />
      )}

      {showChallans && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
            <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">View Challans</h2>
              <button
                onClick={() => setShowChallans(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="h-[600px] overflow-y-scroll">
              {allChallans.map((d) => (
                <div>
                  <img
                    src={import.meta.env.VITE_API_URL + d}
                    className="mb-4"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showUpdateMaterialQuantity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="bg-gradient-to-r rounded-t-2xl from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Update Material Quantity
              </h2>
              <button
                onClick={() => setShowUpdateMaterialQuantity(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={updateMaterialQuantity} className="p-6">
              <div className=" mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <SearchableSelect
                    options={vendors.map((v: any) => ({
                      id: v.id,
                      name: v.name || v.vendor_name || v.display || "",
                    }))}
                    value={from}
                    onChange={(id) => {
                      setFrom(id);
                    }}
                    placeholder="Select Vendor"
                    required
                  />
                </div>
              </div>
              <div className=" mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <SearchableSelect
                    options={allStoreManagementEmployee.map((v: any) => ({
                      id: v.id,
                      name: v.full_name || v.vendor_name || v.display || "",
                    }))}
                    value={to}
                    onChange={(id) => {
                      setTo(id);
                    }}
                    placeholder="Select Vendor"
                    required
                  />
                </div>
              </div>
              <div className=" mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material Quantity Received
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={materialQuantity}
                    className="appearance-none w-full border px-3 py-2 rounded"
                    onChange={(e) =>
                      setMaterialQuantity(Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Challan Number
                </label>
                <input
                  type="text"
                  value={challanNumber}
                  onChange={(e) => setChallanNumber(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Enter challan number"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Challan Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setChallanImage(e.target.files[0]);
                    }
                  }}
                  className="w-full border file:px-3 file:py-2 rounded file:bg-blue-600 file:hover:bg-blue-700 file:border-none file:text-white"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={materialQuantity <= 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition"
                >
                  <Save className="w-5 h-5 inline mr-2" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowUpdateMaterialQuantity(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedPO && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-2xl shadow-gray-900/20 w-full max-w-2xl border border-gray-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#40423f] via-[#4a4c49] to-[#5a5d5a] px-5 py-3 flex justify-between items-center border-b border-gray-700/30">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <IndianRupee className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Record Payment
                  </h2>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    PO: {selectedPO?.po_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedPO(null);
                  setPaymentData({
                    po_id: null,
                    transaction_type: "payment",
                    amount_paid: "",
                    payment_method: "bank_transfer",
                    payment_reference_no: "",
                    payment_proof: null,
                    payment_date: new Date().toISOString().split("T")[0],
                    status: "pending",
                    remarks: "",
                    created_by: user?.id,
                  });
                }}
                className="text-white hover:bg-white/20 rounded-xl p-1.5 transition-all duration-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleMakePayment}
              className="p-4 max-h-[calc(90vh-80px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    PO Number
                  </p>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-bold text-gray-800">
                      {selectedPO?.po_number}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">Vendor</p>
                  <div className="p-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="font-medium text-gray-800">
                      {selectedPO?.vendors?.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Total Amount
                  </p>
                  <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-base font-bold text-orange-600">
                      {formatCurrency(selectedPO?.grand_total || 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-800">
                    Balance Amount
                  </p>
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-base font-bold text-red-600">
                      {formatCurrency(selectedPO?.balance_amount || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentData.payment_method || "bank_transfer"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payment_method: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="cash">Cash</option>
                      <option value="online">Online Payment</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={paymentData.payment_date || ""}
                      onChange={(e) => {
                        setPaymentData({
                          ...paymentData,
                          payment_date: e.target.value,
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={paymentData.amount_paid || ""}
                      onChange={(e) => {
                        if (
                          Number(e.target.value) >
                          Number(selectedPO?.balance_amount)
                        ) {
                          toast.warning(
                            "You can not enter amount greater than balance amount",
                          );
                          return;
                        }
                        setPaymentData({
                          ...paymentData,
                          amount_paid: Number(e.target.value) || "",
                        });
                      }}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      min="0.01"
                      max={selectedPO?.balance_amount}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Reference Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={paymentData.payment_reference_no || ""}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          payment_reference_no: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                      placeholder="Transaction reference"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Upload Payment Proof{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      required
                      id="payment_proof"
                      onChange={handleFileUpload}
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none file:border-none file:bg-gradient-to-r file:from-[#C62828] file:to-red-600 file:text-white file:font-medium file:px-3 file:py-1.5 file:rounded-lg file:cursor-pointer"
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-800">
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={paymentData.status || "pending"}
                      onChange={(e) =>
                        setPaymentData({
                          ...paymentData,
                          status: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="SUCCESS">Success</option>
                      <option value="FAILED">Failed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-800">
                    Remarks
                  </label>
                  <textarea
                    value={paymentData.remarks || ""}
                    onChange={(e) =>
                      setPaymentData({
                        ...paymentData,
                        remarks: e.target.value || "",
                      })
                    }
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-[#C62828] focus:ring-2 focus:ring-[#C62828]/20 outline-none"
                    rows={2}
                    placeholder="Add any remarks..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-3 flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-[#C62828] to-red-600 text-white py-2 px-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <IndianRupee className="w-4 h-4" />
                  )}
                  {submitting ? "Processing..." : "Record Payment"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPO(null);
                  }}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
