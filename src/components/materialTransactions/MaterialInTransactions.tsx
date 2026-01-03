import { Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";

const MaterialInTransactions = (loadTableData: any) => {
  const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
  const [transactions, setTransactions] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<any>();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedChallan, setSelectedChallan] = useState("");
  const [viewChallan, setViewChallan] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<string>("");
  const [selectedPOTransaction, setSelectedPOTransaction] = useState<
    any | null
  >(null);
  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      CREDIT: "bg-green-100 text-green-700",
      DEBIT: "bg-red-100 text-red-700",
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };
  const loadAllPO = async () => {
    try {
      const poRes = await poApi.getPOs();
      return Array.isArray(poRes) ? poRes : [];
    } catch (error) {
      console.log(error);
      alert("Something wrong.");
    }
  };
  const loadAllVendors = async () => {
    try {
      const vendorsRes = await vendorApi.getVendors();
      console.log(vendorsRes);
      return Array.isArray(vendorsRes) ? vendorsRes : [];
    } catch (error) {
      console.log(error);
      alert("Something wrong.");
    }
  };
  const loadTransactions = async () => {
    try {
      const allPOsData: any = await loadAllPO();
      const allVendorsData: any = await loadAllVendors();

      const res: any = await inventoryTransactionApi.getTransactions();
      const transactions = Array.isArray(res?.data) ? res.data : [];

      const enhancedTransactions = transactions.map((transaction: any) => {
        const poData = allPOsData.find((i: any) => i.id === transaction.po_id);

        const vendorData = allVendorsData.find(
          (i: any) => i.id === transaction.vendor_id
        );

        return {
          ...transaction,
          po_number: poData?.po_number || "N/A",
          vendor: vendorData?.name || "N/A",
        };
      });
      console.log(enhancedTransactions, "from material in transactions");
      setTransactions(enhancedTransactions);
      return enhancedTransactions;
    } catch (error) {
      console.error("Error loading transactions:", error);
      alert("Failed to load transaction data");
      return [];
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [loadTableData]);

  useEffect(() => {
    const searchLower = searchTerm.toLowerCase();

    const filtered = transactions.filter((transaction: any) => {
      const itemName = transaction.vendor?.toLowerCase() || "";
      const type = transaction.po_number.toLowerCase();
      const remark = transaction.receiver_name.toLowerCase();

      return (
        itemName.includes(searchLower) ||
        type.includes(searchLower) ||
        remark.includes(searchLower)
      );
    });
    console.log(filtered);
    const tempData = filtered.filter(
      (d: any) => d.trasaction_type === "INWARD"
    );
    setFilteredTransactions(tempData);
  }, [searchTerm, transactions]);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                PO Number
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Vendor
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Challan No.
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Receiving Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Receiver Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Trans. Type
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                View Challan
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTransactions.map((transaction: any) => {
              return (
                <tr
                  key={transaction.id}
                  className="hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsOpen(true);
                      }}
                      className="font-bold hover:underline cursor-pointer text-blue-600"
                    >
                      {transaction.po_number || "N/A"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.vendor || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="">
                      {transaction.challan_number || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiving_date ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiver_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(
                        transaction.trasaction_type
                      )}`}
                    >
                      {transaction.trasaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {transaction.challan_image ? (
                      <button
                        onClick={() => {
                          setSelectedChallan(transaction.challan_image);
                          setViewChallan(true);
                        }}
                        className="text-sm max-w-xs truncate font-bold cursor-pointer text-blue-600 hover:scale-102"
                        title={"View Challan"}
                      >
                        View
                      </button>
                    ) : (
                      "--"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Transactions Found
            </h3>
            <p className="text-gray-600">
              {searchTerm
                ? "Try a different search term"
                : "No inventory transactions available"}
            </p>
          </div>
        )}
        {viewChallan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">
                  View Challan Image
                </h2>
                <button
                  onClick={() => {
                    setViewChallan(false);
                  }}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="overflow-y-scroll h-[500px]">
                <img
                  src={`${
                    import.meta.env.VITE_API_URL
                  }/uploads/${selectedChallan}`}
                  alt=""
                />
              </div>
              <div className="flex justify-end gap-3 p-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setViewChallan(false);
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isOpen && (
          <ViewTransaction
            setIsOpen={setIsOpen}
            transaction={selectedTransaction}
            transactionType="MaterialIn"
          />
        )}
      </div>
    </div>
  );
};

export default MaterialInTransactions;
