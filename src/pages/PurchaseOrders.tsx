// src/components/PurchaseOrders.tsx
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
import { PDFViewer } from "@react-pdf/renderer";
import PurchaseOrderPDF from "../components/purchaseOrderPdf/PurchaseOrderPdf";
import SearchableSelect from "../components/SearchableSelect";
import { UsersApi } from "../lib/Api";
import { toast } from "sonner";
import MySwal from "../utils/swal";

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

export default function PurchaseOrders() {
  const { user, profile } = useAuth();
  const [pos, setPOs] = useState<PO[]>([]);
  const [showChallans, setShowChallans] = useState(false);
  const [trackingData, setTrackingData] = useState<Tracking[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [poTypes, setPOTypes] = useState<POType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPOs, setFilteredPOs] = useState<any>([]);
  const [filteredTracking, setFilteredTracking] = useState<any>([]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreatePro, setShowCreatePro] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [editingPO, setEditingPO] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [allStoreManagementEmployee, setAllStoreManagementEmployee] =
    useState<any>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [challanNumber, setChallanNumber] = useState("");
  const [challanImage, setChallanImage] = useState<File | null>(null);

  const [showApprovalButtons, setShowApprovalButtons] = useState<number | null>(
    null
  );
  const [allChallans, setAllChallans] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"tracking" | "management">(
    "management"
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
    console.log(res);
    setAllStoreManagementEmployee(res ?? []);
  };
  useEffect(() => {
    loadAllStoreManagementEmployee();
  }, []);

  // --- Util: load from localStorage or defaults ---

  const loadVendor = async () => {
    try {
      const response = await vendorApi.getVendors();
      console.log("Venders", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadProjects = async () => {
    try {
      const response: any = await projectApi.getProjects();
      console.log("Projects", response);
      return response.data;
    } catch (error) {
      console.log(error);
    }
  };
  const loadPO_Type = async () => {
    try {
      const response = await poTypeApi.getPOTypes();
      console.log("PO_Types", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadPOS = async () => {
    try {
      const response = await poApi.getPOs();
      console.log("POs", response);
      return response;
    } catch (error) {
      console.log(error);
    }
  };
  const loadTrackings = async () => {
    try {
      const response = await po_trackingApi.getTrackings();
      console.log("POs Trackings : ", response);
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
              (v) => v.id === poList.find((p) => p.id === t.po_id)?.vendor_id
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
      (d: any) => d.po_id === po.id
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
      (item: any) => item.id === selectedTrackingMaterial
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
        Number(trackingMaterialData.quantity_pending) - Number(materialQuantity)
      )
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
      (item: any) => item.po_id != id
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
          "Purchase order status updated to " + status.toLocaleUpperCase() + "."
        );
        setShowApprovalButtons(null);
        loadAllData();
      } else {
        toast.error(
          "Failed to update purchase order status." + status.toLocaleUpperCase()
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
        : p
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

  useEffect(() => {
    // console.log(" from use effect after updating pos");
    const posData = pos.filter(
      (po) =>
        po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.vendors?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPOs(posData);

    const trackData = trackingData.filter(
      (t) =>
        t.item_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.purchase_orders?.po_number
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        t.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTracking(trackData);
  }, [pos, trackingData, searchTerm]);

  const loadItems = async () => {
    try {
      const data = await ItemsApi.getItems();
      const updatedData = data.map((item) => ({
        ...item,
        id: String(item.id),
      }));
      setItems(updatedData);
      console.log(data, "from purchase orders items");
    } catch (error) {
      console.log(error);
    }
  };

  const loadAllPOsItems = async () => {
    try {
      const data: any = await poApi.getPOsItems();
      console.log(data, "all po items");
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
    };
    return (status && colors[status]) || "bg-gray-100 text-gray-700";
  };

  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage purchase orders and track materials
          </p>
        </div>
        {can("create_pos") && (
          <button
            onClick={() => setShowCreatePro(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create PO
          </button>
        )}
        {showCreatePro && (
          <CreatePurchaseOrderForm
            setShowCreatePro={setShowCreatePro}
            loadAllData={loadAllData}
          />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("tracking")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "tracking"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>PO Tracking</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("management")}
            className={`flex-1 px-6 py-4 font-medium transition ${
              activeTab === "management"
                ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5" />
              <span>PO Management</span>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={
              activeTab === "tracking"
                ? "Search materials or PO number..."
                : "Search POs..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {activeTab === "tracking" && (
        <div className="space-y-6">
          {/* PO Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Purchase Orders Overview
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      PO Number
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Vendor
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Project
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      PO Status
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Material
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPOs.map((po: any) => (
                    <tr key={po.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-medium text-blue-600">
                          {po.po_number}
                        </span>
                        <p className="text-xs text-gray-500">
                          {po.po_date
                            ? new Date(po.po_date).toLocaleDateString()
                            : ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {po.vendors?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {po.projects?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">
                          {formatCurrency(po.grand_total)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            po.status
                          )}`}
                        >
                          {po.status?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                            po.payment_status
                          )}`}
                        >
                          {po.payment_status?.toUpperCase() || "PENDING"}
                        </span>
                        {po.balance_amount! > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            Bal: {formatCurrency(po.balance_amount)}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(po)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Details"
                          >
                            <FileText className="w-4 h-4" />
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    PO Number
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Vendor
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Project
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPOs.map((po: any) => (
                  <tr key={po.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-medium text-blue-600">
                        {po.po_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {po.vendors?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {po.projects?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {po.po_types?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {po.po_date
                        ? new Date(po.po_date).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(po.grand_total)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          po.status
                        )}`}
                      >
                        {po.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 text-black hover:bg-blue-50 rounded-lg transition hidden"
                          title="View"
                        >
                          {/* <PDFDownloadLink
                            document={
                              <PurchaseOrderPDF selectedPO={selectedPO} />
                            }
                            fileName="purchase-order.pdf"
                          >
                            {({ loading }) =>
                              loading ? (
                                <Loader2 className="w-4 h-4" />
                              ) : (
                                <FileDown className="w-4 h-4" />
                              )
                            }
                          </PDFDownloadLink> */}
                        </button>
                        <button
                          onClick={() => {
                            handleView(po);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="View"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {can("edit_pos") && po.status === "draft" && (
                          <button
                            onClick={() => {
                              console.log("this is po data : ", po);
                              if (!allPurchaseOrderItems) {
                                toast.success("wait data is loading");
                                return;
                              }
                              const itemsList = allPurchaseOrderItems.filter(
                                (d: any) => d.po_id === po.id
                              );
                              console.log(itemsList, "form update button");
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
                                    materialTrackingId = filteredTracking[i].id; // ONLY ONE VALUE
                                    break;
                                  }
                                }

                                return {
                                  ...item,
                                  materialTrackingId: materialTrackingId,
                                };
                              });

                              const data = {
                                poId: po.id,
                                advance_amount: po.advance_amount,
                                cgst_amount: po.cgst_amount,
                                delivery_date: po.delivery_date.slice(0, 10),
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
                                terms_and_conditions:
                                  po.terms_and_conditions ?? "",
                                total_gst_amount: po.total_gst_amount ?? 0,
                                vendor_id: Number(po.vendor_id),
                              };
                              console.log(
                                data,
                                "after some op on data in edit button"
                              );
                              setSelectedPOForUpdate(data);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}

                        {can("delete_pos") && po.status === "draft" && (
                          <button
                            onClick={() => {
                              handleDelete(po.id);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {can("make_payments") &&
                          po.balance_amount! > 0 &&
                          po.status === "authorize" && (
                            <button
                              onClick={() => {
                                setSelectedPO(po);
                                setShowPaymentModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Make Payment"
                            >
                              <IndianRupee className="w-4 h-4" />
                            </button>
                          )}
                        <div className="relative">
                          {showApprovalButtons === po.id && (
                            <div className="absolute -top-16 space-x-3 bg-white flex right-2 shadow-xl px-6 py-3 rounded-md border border-slate-300">
                              {can("approve_pos") && po.status === "draft" && (
                                <button
                                  onClick={() =>
                                    updatePurchaseOrderStatus(po.id, "approved")
                                  }
                                  className="p-2 px-6 text-white bg-green-600  hover:bg-green-500 rounded-lg transition flex items-center"
                                  title="Approve"
                                >
                                  {/* <CheckCircle className="w-4 h-4" />  */}
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
                                        "authorize"
                                      );
                                    }}
                                    className="p-2 px-6 text-white bg-green-600  hover:bg-green-500 rounded-lg transition flex items-center"
                                    title="Make Payment"
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
                                        "rejected"
                                      )
                                    }
                                    className="p-2 px-6 text-white bg-red-600 hover:bg-red-500 rounded-lg transition flex items-center"
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
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                                title={`${
                                  (po.status === "approved" && "Authorize") ||
                                  (po.status === "draft" && "Approve")
                                }`}
                              >
                                <FileCheck2 className="w-4 h-4" />
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
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No purchase orders found
              </h3>
              <p className="text-gray-600">
                {searchTerm
                  ? "Try a different search term"
                  : 'Click "Create PO" to get started'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
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
                <PDFViewer width="100%" height="600" className="bg-white">
                  <PurchaseOrderPDF
                    selectedPO={
                      selectedPO ?? {
                        po_number: 0,
                        po_date: 0,
                        vendor_name: "",
                        vendor_address: ``,
                        vendor_gstn: "",
                        vendor_phone: "",
                        po_items: "",
                        po_terms_and_conditions: [],
                      }
                    }
                  />
                </PDFViewer>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">
                Record Payment — {selectedPO.po_number}
              </h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-600 hover:bg-gray-100 rounded p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full border px-3 py-2 rounded"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Balance: {formatCurrency(selectedPO.balance_amount)}
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 rounded border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
