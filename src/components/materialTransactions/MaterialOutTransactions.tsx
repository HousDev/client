import { Eye, Package } from "lucide-react";
import { useEffect, useState } from "react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";

const MaterialOutTransactions = (loadTableData: any) => {
  const [filteredTransactions, setFilteredTransactions] = useState<any>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(
    null
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeFormTab, setActiveFormTab] = useState("");
  const [transactions, setTransactions] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState("");
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
      console.log(enhancedTransactions);
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
    console.log(filtered, "outward");
    const tempData = filtered.filter(
      (d: any) => d.trasaction_type === "OUTWARD"
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
                Contact Person
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Phone Number
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Delivery Location
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Issue Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Purpose
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Trans. Type
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Action
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
                      {transaction.receiver_name || "N/A"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiver_phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="">
                      {transaction.delivery_location || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiving_date ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.remark ?? "N/A"}
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
                    <button
                      onClick={() => {
                        setSelectedTransaction(transaction);
                        setIsOpen(true);
                      }}
                      className="text-sm max-w-xs truncate font-bold cursor-pointer text-blue-600 hover:scale-102"
                      title={transaction.remark}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
      </div>
      {isOpen && (
        <ViewTransaction
          setIsOpen={setIsOpen}
          transaction={selectedTransaction}
          transactionType="MaterialOut"
        />
      )}
    </div>
  );
};

export default MaterialOutTransactions;
