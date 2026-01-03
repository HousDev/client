import { Eye, Package } from "lucide-react";
import { useEffect, useState } from "react";
import inventoryTransactionApi from "../../lib/inventoryTransactionApi";
import poApi from "../../lib/poApi";
import vendorApi from "../../lib/vendorApi";
import projectApi from "../../lib/projectApi";
import ViewTransaction from "../StoreManagement/ViewTransaction";

const MaterialIssueTransactions = (loadTableData: any) => {
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
  const loadAllProjects = async () => {
    try {
      const poRes = await projectApi.getProjects();
      console.log("all project details,", poRes);
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
      const projects: any = await loadAllProjects();
      const allVendorsData: any = await loadAllVendors();

      const res: any =
        await inventoryTransactionApi.getIssueMaterialTransactions();
      console.log(res, "this is issue material");

      const transactions = Array.isArray(res) ? res : [];

      console.log(transactions);
      setTransactions(transactions);
      return transactions;
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
      const itemName = transaction.project_name?.toLowerCase() || "";
      const type = transaction.vendor_name.toLowerCase();
      const remark = transaction.receiver_name.toLowerCase();

      return (
        itemName.includes(searchLower) ||
        type.includes(searchLower) ||
        remark.includes(searchLower)
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Project
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Building
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Floor
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Flat
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Common Area
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Vendor
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Receiver Name
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Receiver Number
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Issue Date
              </th>
              <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">
                Purpose
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
                      {transaction.project_name || "N/A"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.building_name || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="">{transaction.floor_name || "N/A"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.flat_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.common_area_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.vendor_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiver_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.receiver_name ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.issue_date ?? "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className=" text-gray-800">
                      {transaction.purpose ?? "N/A"}
                    </div>
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
        {isOpen && (
          <ViewTransaction
            setIsOpen={setIsOpen}
            transaction={selectedTransaction}
            transactionType={"issueMaterial"}
          />
        )}
      </div>
    </div>
  );
};

export default MaterialIssueTransactions;
