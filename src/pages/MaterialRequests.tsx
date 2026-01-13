import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  ChevronDown,
  ChevronRight,
  Search,
  User,
  Phone,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import RequestMaterialApi from "../lib/requestMaterialApi";
import ViewRequestMaterial from "../components/materialRequest/ViewRequestMaterial";
import inventoryApi from "../lib/inventoryApi";

// Types
type RequestItem = {
  item_name: string;
  required_quantity: number;
};

type MaterialRequest = {
  request_no: string;
  user_name: string;
  user_phone: string;
  project_name: string;
  building_name: string;
  floor_name: string;
  flat_name: string | null;
  common_area_name: string | null;
  work: string;
  start_date: string;
  remark: string;
  status: string;
  items: RequestItem[];
  expanded?: boolean;
};

export default function MaterialRequests() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showViewRequestMaterial, setViewRequestMaterial] =
    useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest>();
  const [filteredRequests, setFilteredRequests] = useState<MaterialRequest[]>(
    []
  );

  const [allInventory, setAllInventory] = useState<any>([]);
  const loadMaterialRequests = async () => {
    setLoading(true);
    try {
      const response: any = await RequestMaterialApi.getAll();

      setRequests(response);
      setFilteredRequests(response);
      loadAllInventory();
    } catch (error) {
      toast.error("Failed to load material requests");
      console.error("Error loading material requests:", error);
    } finally {
      setLoading(false);
    }
  };
  const loadAllInventory = async () => {
    setLoading(true);
    try {
      const response: any = await inventoryApi.getInventory();

      setAllInventory(response);
    } catch (error) {
      toast.error("Failed to load material requests");
      console.error("Error loading material requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Simulate API call
    loadAllInventory();
    loadMaterialRequests();
  }, []);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRequests(requests);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = requests.filter(
      (request) =>
        request.request_no.toLowerCase().includes(searchLower) ||
        request.user_name.toLowerCase().includes(searchLower) ||
        request.project_name.toLowerCase().includes(searchLower) ||
        request.building_name.toLowerCase().includes(searchLower) ||
        request.work.toLowerCase().includes(searchLower) ||
        request.items.some((item) =>
          item.item_name.toLowerCase().includes(searchLower)
        )
    );

    setFilteredRequests(filtered);
  }, [searchTerm, requests]);

  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      processing: "bg-blue-100 text-blue-700",
      completed: "bg-purple-100 text-purple-700",
    };
    return styles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "processing":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalItems = (items: RequestItem[]) => {
    return items.length;
  };

  const getTotalQuantity = (items: RequestItem[]) => {
    return items.reduce((sum, item) => sum + item.required_quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading material requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          Material Requests
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Manage and track material requests from site teams
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search by request no, user, project, building, work, or item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="md:hidden space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.request_no}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              const data = request.items.map((d: any) => {
                const s =
                  allInventory.find(
                    (i: any) => i.item_id === d.request_material_item_id
                  )?.quantity >= d.required_quantity;

                return {
                  ...d,
                  status: s ? "IN STOCK" : "OUT OF STOCK",
                };
              });
              setSelectedRequest({ ...request, items: data });
              setViewRequestMaterial(true);
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-600 text-sm">
                  {request.request_no}
                </span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium text-gray-800 text-sm block truncate">
                    {request.user_name}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1 truncate">
                    <Phone className="w-3 h-3" />
                    {request.user_phone}
                  </span>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium text-gray-800 truncate">
                  {request.project_name}
                </div>
                <div className="text-xs text-gray-500 mt-1 truncate">
                  {[request.building_name, request.floor_name]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
                {(request.flat_name || request.common_area_name) && (
                  <div className="text-xs text-gray-400 mt-0.5 truncate">
                    {request.flat_name || request.common_area_name}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 text-xs">
                    {formatDate(request.start_date)}
                  </span>
                </div>
                <div className="text-gray-700 font-medium text-xs">
                  {getTotalItems(request.items)} items
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="font-medium text-gray-800 text-sm truncate">
                  {request.work}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredRequests.length === 0 && (
          <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              {searchTerm
                ? "No matching requests found"
                : "No material requests"}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm
                ? "Try a different search term"
                : "Material requests will appear here"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[768px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Request No
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Requester
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Project & Location
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Work Type
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Items
                </th>
                <th className="text-left px-4 lg:px-6 py-3 text-xs lg:text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <tr
                  key={request.request_no}
                  className="hover:bg-gray-50 transition bg-blue-50/30 cursor-pointer"
                  onClick={() => {
                    const data = request.items.map((d: any) => {
                      const s = allInventory.find(
                        (i: any) => i.item_id === d.request_material_item_id
                      );
                      return {
                        ...d,
                        stock_status:
                          s?.quantity_after_approve >= d.required_quantity
                            ? "IN STOCK"
                            : s?.quantity_after_approve === 0
                            ? "OUT OF STOCK"
                            : "LOW STOCK",
                        stock_quantity: s?.quantity_after_approve,
                        approveQuantity: 0,
                      };
                    });
                    setSelectedRequest({ ...request, items: data });
                    setViewRequestMaterial(true);
                  }}
                >
                  <td className="px-4 lg:px-6 py-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 mr-2 lg:mr-3" />
                      <div>
                        <span className="font-medium text-blue-600 block text-sm lg:text-base">
                          {request.request_no}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <div>
                        <span className="font-medium text-gray-800 block text-sm lg:text-base">
                          {request.user_name}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center mt-0.5 lg:mt-1">
                          <Phone className="w-3 h-3 mr-1" />
                          {request.user_phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <div className="font-medium text-gray-800 text-sm lg:text-base">
                      {request.project_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 lg:mt-1">
                      {[request.building_name, request.floor_name]
                        .filter(Boolean)
                        .join(" • ")}
                    </div>
                    {(request.flat_name || request.common_area_name) && (
                      <div className="text-xs text-gray-400 mt-0.5">
                        {request.flat_name || request.common_area_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <span className="font-medium text-gray-800 text-sm lg:text-base">
                      {request.work}
                    </span>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-700 text-sm lg:text-base">
                        {formatDate(request.start_date)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <div className="font-medium text-gray-800 text-sm lg:text-base">
                      {getTotalItems(request.items)} items
                    </div>
                  </td>
                  <td className="px-4 lg:px-6 py-3">
                    <span
                      className={`px-2 lg:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 lg:py-12">
              <Package className="w-10 h-10 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-1 lg:mb-2">
                {searchTerm
                  ? "No matching requests found"
                  : "No material requests"}
              </h3>
              <p className="text-gray-600 text-sm lg:text-base">
                {searchTerm
                  ? "Try a different search term"
                  : "Material requests will appear here"}
              </p>
            </div>
          )}
        </div>
      </div>

      {showViewRequestMaterial && selectedRequest && (
        <ViewRequestMaterial
          setViewRequestMaterial={setViewRequestMaterial}
          requestData={selectedRequest}
          loadMaterialRequests={loadMaterialRequests}
        />
      )}
    </div>
  );
}
