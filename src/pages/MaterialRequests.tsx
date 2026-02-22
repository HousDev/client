import { useState, useEffect } from "react";
import {
  Package,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Phone,
  Calendar,
  X,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import RequestMaterialApi from "../lib/requestMaterialApi";
import ViewRequestMaterial from "../components/materialRequest/ViewRequestMaterial";
import inventoryApi from "../lib/inventoryApi";

// Types
type RequestItem = {
  item_name: string;
  required_quantity: number;
  request_material_item_id: string;
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
  const [filteredRequests, setFilteredRequests] = useState<MaterialRequest[]>(
    [],
  );
  const [showViewRequestMaterial, setViewRequestMaterial] =
    useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest>();
  const [allInventory, setAllInventory] = useState<any>([]);

  // Checkbox states
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(
    new Set(),
  );
  const [selectAll, setSelectAll] = useState(false);

  // Column search states
  const [searchRequestNo, setSearchRequestNo] = useState("");
  const [searchRequester, setSearchRequester] = useState("");
  const [searchProject, setSearchProject] = useState("");
  const [searchWorkType, setSearchWorkType] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  // Add these with other search states at the top
  const [searchDate, setSearchDate] = useState("");
  const [searchItems, setSearchItems] = useState("");
  // Filter sidebar states
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [ignoreDate, setIgnoreDate] = useState(false);

  const loadMaterialRequests = async () => {
    setLoading(true);
    try {
      const response: any = await RequestMaterialApi.getAll();
      console.log(response);
      setRequests(response);
      loadAllInventory();
    } catch (error) {
      toast.error("Failed to load material requests");
      console.error("Error loading material requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllInventory = async () => {
    try {
      const response: any = await inventoryApi.getInventory();
      setAllInventory(response);
    } catch (error) {
      toast.error("Failed to load inventory");
      console.error("Error loading inventory:", error);
    }
  };

  useEffect(() => {
    loadMaterialRequests();
  }, []);

  // Apply filters and searches
  // Apply filters and searches
  useEffect(() => {
    let filtered = requests;

    // Column searches
    if (searchRequestNo) {
      filtered = filtered.filter((request) =>
        request.request_no
          .toLowerCase()
          .includes(searchRequestNo.toLowerCase()),
      );
    }

    if (searchRequester) {
      filtered = filtered.filter((request) =>
        request.user_name.toLowerCase().includes(searchRequester.toLowerCase()),
      );
    }

    if (searchProject) {
      filtered = filtered.filter((request) =>
        request.project_name
          .toLowerCase()
          .includes(searchProject.toLowerCase()),
      );
    }

    if (searchWorkType) {
      filtered = filtered.filter((request) =>
        request.work.toLowerCase().includes(searchWorkType.toLowerCase()),
      );
    }

    if (searchStatus) {
      filtered = filtered.filter((request) =>
        request.status.toLowerCase().includes(searchStatus.toLowerCase()),
      );
    }

    // Date search (formatted date)
    if (searchDate) {
      filtered = filtered.filter((request) =>
        formatDate(request.start_date)
          .toLowerCase()
          .includes(searchDate.toLowerCase()),
      );
    }

    // Items search (number of items or item names)
    if (searchItems) {
      filtered = filtered.filter(
        (request) =>
          getTotalItems(request.items).toString().includes(searchItems) ||
          request.items.some((item) =>
            item.item_name.toLowerCase().includes(searchItems.toLowerCase()),
          ),
      );
    }

    // Date filters (from-to range)
    // Date filters (from-to range)
    if (!ignoreDate) {
      if (filterFromDate) {
        filtered = filtered.filter((request) => {
          const requestDate = new Date(request.start_date);
          const fromDate = new Date(filterFromDate);

          // Reset times to compare only dates
          const requestDateOnly = new Date(
            requestDate.getFullYear(),
            requestDate.getMonth(),
            requestDate.getDate(),
          );
          const fromDateOnly = new Date(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate(),
          );

          return requestDateOnly >= fromDateOnly;
        });
      }

      if (filterToDate) {
        filtered = filtered.filter((request) => {
          const requestDate = new Date(request.start_date);
          const toDate = new Date(filterToDate);

          // Reset times to compare only dates
          const requestDateOnly = new Date(
            requestDate.getFullYear(),
            requestDate.getMonth(),
            requestDate.getDate(),
          );
          const toDateOnly = new Date(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate(),
          );

          return requestDateOnly <= toDateOnly;
        });
      }
    }

    setFilteredRequests(filtered);
    // Reset select all when filtered results change
    setSelectAll(false);
    setSelectedRequests(new Set());
  }, [
    searchRequestNo,
    searchRequester,
    searchProject,
    searchWorkType,
    searchStatus,
    searchDate,
    searchItems,
    filterFromDate,
    filterToDate,
    ignoreDate,
    requests,
  ]);
  // Checkbox handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequests(new Set());
    } else {
      const allRequestNos = new Set(
        filteredRequests.map((request) => request.request_no),
      );
      setSelectedRequests(allRequestNos);
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRequest = (requestNo: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(requestNo)) {
      newSelected.delete(requestNo);
    } else {
      newSelected.add(requestNo);
    }
    setSelectedRequests(newSelected);
    setSelectAll(newSelected.size === filteredRequests.length);
  };

  const handleBulkDelete = async () => {
    if (selectedRequests.size === 0) {
      toast.error("Please select requests to delete");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedRequests.size} request(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      // Note: You'll need to implement a bulk delete API endpoint
      // For now, we'll delete one by one
      // const deletePromises = Array.from(selectedRequests).map((requestNo) =>
      //   RequestMaterialApi.deleteRequest(requestNo),
      // );

      // await Promise.all(deletePromises);
      toast.success(
        `${selectedRequests.size} request(s) deleted successfully!`,
      );

      // Clear selection
      setSelectedRequests(new Set());
      setSelectAll(false);

      // Reload requests
      await loadMaterialRequests();
    } catch (error) {
      console.error("Error deleting requests:", error);
      toast.error("Failed to delete requests");
    }
  };

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

  const resetFilters = () => {
    setFilterFromDate("");
    setFilterToDate("");
    setIgnoreDate(false);
    setSearchRequestNo("");
    setSearchRequester("");
    setSearchProject("");
    setSearchWorkType("");
    setSearchStatus("");
    setSearchDate("");
    setSearchItems("");
    setShowFilterSidebar(false);
  };

  const applyFilters = () => {
    setShowFilterSidebar(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 px-3">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading material requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 px-0 md:px-0 md:p-4 -mt-5 bg-gray-50 ">
      {/* Delete Button (Appears when checkboxes are selected) */}
      {/* {selectedRequests.size > 0 && (
        <div className="mb-4">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl shadow-sm p-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {selectedRequests.size} request
                    {selectedRequests.size > 1 ? "s" : ""} selected
                  </p>
                  <p className="text-xs text-gray-600">
                    Click delete to remove selected items
                  </p>
                </div>
              </div>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-rose-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Trash2 className="w-3 h-3" />
                Delete ({selectedRequests.size})
              </button>
            </div>
          </div>
        </div>
      )} */}

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200  px-0 ">
        <div className="overflow-x-auto h-[calc(100vh-160px)]">
          <table className="w-full min-w-[800px]">
            <thead className="sticky top-0 z-10 rounded-xl bg-gray-200 border-b border-gray-200">
              <tr>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Request No
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Requester
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Work Type
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </span>
                    <button
                      onClick={() => setShowFilterSidebar(true)}
                      className="p-0.5 rounded hover:bg-gray-300 transition-colors ml-6"
                      title="Filter Status"
                    >
                      <Filter className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                  </div>
                </th>
              </tr>

              {/* Search Row */}
              <tr className="sticky top-[40px] z-10 bg-gray-50 border-b border-gray-200">
                {" "}
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchRequestNo}
                    onChange={(e) => setSearchRequestNo(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchRequester}
                    onChange={(e) => setSearchRequester(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchWorkType}
                    onChange={(e) => setSearchWorkType(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search date..."
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchItems}
                    onChange={(e) => setSearchItems(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request: any) => {
                const isSelected = selectedRequests.has(request.request_no);
                console.log("filtere", request);
                return (
                  <tr
                    key={request.request_no}
                    className={`hover:bg-gray-50 transition cursor-pointer ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                    onClick={(e) => {
                      // Click handler now works on entire row
                      const data = request.items.map((d: any) => {
                        const s = allInventory
                          .filter(
                            (ft: any) => ft.project_id === request.projectId,
                          )
                          .find(
                            (i: any) =>
                              i.item_id === d.request_material_item_id,
                          );
                        return {
                          ...d,
                          stock_status:
                            s?.quantity_after_approve >= d.required_quantity
                              ? "IN STOCK"
                              : s?.quantity_after_approve === 0 || !s
                                ? "OUT OF STOCK"
                                : "LOW STOCK",
                          stock_quantity: s ? s?.quantity_after_approve : 0,
                          approveQuantity: 0,
                        };
                      });
                      setSelectedRequest({ ...request, items: data });
                      setViewRequestMaterial(true);
                    }}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 text-blue-600 mr-1.5" />
                        <div className="min-w-0">
                          <span
                            className="font-medium text-blue-600 text-xs truncate block max-w-[120px]"
                            title={request.request_no}
                          >
                            {request.request_no}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="min-w-0">
                        <span
                          className="font-medium text-gray-800 text-xs truncate block max-w-[120px]"
                          title={request.user_name}
                        >
                          {request.user_name}
                        </span>
                        <span
                          className="text-[10px] text-gray-500 flex items-center mt-0.5 truncate"
                          title={request.user_phone}
                        >
                          <Phone className="w-2.5 h-2.5 mr-1" />
                          {request.user_phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="min-w-0">
                        <span
                          className="font-medium text-gray-800 text-xs truncate block max-w-[120px]"
                          title={request.project_name}
                        >
                          {request.project_name}
                        </span>
                        <div
                          className="text-[10px] text-gray-500 mt-0.5 truncate"
                          title={[request.building_name, request.floor_name]
                            .filter(Boolean)
                            .join(" • ")}
                        >
                          {[request.building_name, request.floor_name]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                        {(request.flat_name || request.common_area_name) && (
                          <div className="text-[10px] text-gray-400 mt-0.5 truncate">
                            {request.flat_name || request.common_area_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="font-medium text-gray-800 text-xs truncate block max-w-[120px]"
                        title={request.work}
                      >
                        {request.work}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 text-gray-400 mr-1.5" />
                        <span className="text-gray-700 text-xs whitespace-nowrap">
                          {formatDate(request.start_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800 text-xs whitespace-nowrap">
                        {getTotalItems(request.items)} items
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                          request.status,
                        )} truncate`}
                        title={request.status.toUpperCase()}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8 px-3">
              <Package className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-medium">
                No purchase orders found
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View - Table Layout (Not Cards) */}
      <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto h-[calc(100vh-160px)]">
          {" "}
          <table className="w-full min-w-[768px]">
            <thead className="sticky top-0 z-10 bg-gray-200 border-b border-gray-200">
              {" "}
              <tr>
                <th className="px-3 py-2 text-center w-6">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleSelectAll}
                      className="p-0.5 hover:bg-gray-300 rounded transition-colors"
                    >
                      {selectAll ? (
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                      ) : (
                        <div className="w-3 h-3 border border-gray-400 rounded" />
                      )}
                    </button>
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Request No
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Requester
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Project
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Work Type
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Items
                  </div>
                </th>
                <th className="px-3 py-2 text-left">
                  <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </div>
                </th>
              </tr>
              {/* Search Row */}
              <tr className="bg-gray-50 border-b border-gray-200">
                <td className="px-3 py-1.5"></td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchRequestNo}
                    onChange={(e) => setSearchRequestNo(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchRequester}
                    onChange={(e) => setSearchRequester(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchProject}
                    onChange={(e) => setSearchProject(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchWorkType}
                    onChange={(e) => setSearchWorkType(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search date..."
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchItems}
                    onChange={(e) => setSearchItems(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
                <td className="px-3 py-1.5">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchStatus}
                    onChange={(e) => setSearchStatus(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((request) => {
                const isSelected = selectedRequests.has(request.request_no);
                return (
                  <tr
                    key={request.request_no}
                    className={`hover:bg-gray-50 transition cursor-pointer ${
                      isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                    onClick={(e) => {
                      // Prevent selection when clicking on checkbox
                      if ((e.target as HTMLElement).tagName !== "INPUT") {
                        const data = request.items.map((d: any) => {
                          const s = allInventory.find(
                            (i: any) =>
                              i.item_id === d.request_material_item_id,
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
                      }
                    }}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRequest(request.request_no);
                          }}
                          className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          {isSelected ? (
                            <CheckCircle className="w-3 h-3 text-blue-600" />
                          ) : (
                            <div className="w-3 h-3 border border-gray-400 rounded" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <FileText className="w-3 h-3 text-blue-600 mr-1.5" />
                        <div className="min-w-0">
                          <span
                            className="font-medium text-blue-600 text-xs truncate block max-w-[80px]"
                            title={request.request_no}
                          >
                            {request.request_no}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="min-w-0">
                        <span
                          className="font-medium text-gray-800 text-xs truncate block max-w-[80px]"
                          title={request.user_name}
                        >
                          {request.user_name}
                        </span>
                        <span
                          className="text-[10px] text-gray-500 flex items-center mt-0.5 truncate"
                          title={request.user_phone}
                        >
                          <Phone className="w-2.5 h-2.5 mr-1" />
                          {request.user_phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="min-w-0">
                        <span
                          className="font-medium text-gray-800 text-xs truncate block max-w-[80px]"
                          title={request.project_name}
                        >
                          {request.project_name}
                        </span>
                        <div
                          className="text-[10px] text-gray-500 mt-0.5 truncate"
                          title={[request.building_name, request.floor_name]
                            .filter(Boolean)
                            .join(" • ")}
                        >
                          {[request.building_name, request.floor_name]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="font-medium text-gray-800 text-xs truncate block max-w-[60px]"
                        title={request.work}
                      >
                        {request.work}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 text-gray-400 mr-1.5" />
                        <span className="text-gray-700 text-xs whitespace-nowrap">
                          {formatDate(request.start_date)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-800 text-xs whitespace-nowrap">
                        {getTotalItems(request.items)} items
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(
                          request.status,
                        )} truncate`}
                        title={request.status.toUpperCase()}
                      >
                        {request.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 px-3">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 text-sm font-medium">
                No material requests found
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Try adjusting your search
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter Sidebar - Fixed position for mobile */}
      {/* Filter Sidebar */}
      {showFilterSidebar && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setShowFilterSidebar(false)}
          ></div>
          <div className="absolute inset-y-0 right-0 bg-white shadow-2xl flex flex-col w-full md:w-96">
            <div className="bg-red-600 px-4 py-3 flex justify-between items-center">
              <h2 className="text-lg font-bold text-white">Filters</h2>
              <div className="flex items-center gap-3">
                <button
                  onClick={resetFilters}
                  className="text-white text-sm hover:bg-white hover:bg-opacity-20 px-3 py-1.5 rounded transition"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowFilterSidebar(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-4">Date Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filterFromDate}
                      onChange={(e) => setFilterFromDate(e.target.value)}
                      disabled={ignoreDate}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filterToDate}
                      onChange={(e) => setFilterToDate(e.target.value)}
                      disabled={ignoreDate}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="ignoreDate"
                      checked={ignoreDate}
                      onChange={(e) => {
                        setIgnoreDate(e.target.checked);
                        if (e.target.checked) {
                          setFilterFromDate("");
                          setFilterToDate("");
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="ignoreDate"
                      className="text-sm text-gray-700 cursor-pointer"
                    >
                      Show all dates (ignore date filter)
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium text-gray-700 mb-4">
                  Quick Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={searchStatus}
                      onChange={(e) => setSearchStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t p-4 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterSidebar(false)}
                className="flex-1 bg-red-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-red-700 transition font-medium"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

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
