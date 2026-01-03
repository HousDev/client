// src/lib/inventoryTransactionApi.ts
import { api, unwrap } from "./Api";

/**
 * Get all inventory transaction
 */
async function getTransactions() {
  const res = await api.get("/inventory-transaction");
  return unwrap(res);
}

async function getIssueMaterialTransactions() {
  const res = await api.get("/inventory-transaction/issueMaterialTransaction");
  return unwrap(res);
}

/**
 * Get transaction by ID
 */
async function getTransactionById(id: number | string) {
  const res = await api.get(`/inventory-transaction/${id}`);
  return unwrap(res);
}

/**
 * Create inventory transaction
 */
async function createTransaction(payload: any) {
  const res = await api.post("/inventory-transaction", payload);
  return unwrap(res);
}
async function createTransactionOut(payload: any) {
  const res = await api.post("/inventory-transaction/materialOut", payload);
  return unwrap(res);
}

async function createTransactionIssueMaterial(payload: any) {
  const res = await api.post("/inventory-transaction/issueMaterial", payload);
  return unwrap(res);
}

/**
 * Update inventory transaction
 */
async function updateTransaction(id: number | string, payload: any) {
  const res = await api.put(`/inventory-transaction/${id}`, payload);
  return unwrap(res);
}

/**
 * Delete inventory transaction
 */
async function deleteTransaction(id: number | string) {
  const res = await api.delete(`/inventory-transaction/${id}`);
  return unwrap(res);
}

/**
 * Get transaction by item ID
 */
async function getTransactionsByItemId(itemId: number | string) {
  const res = await api.get(`/inventory-transaction/item/${itemId}`);
  return unwrap(res);
}

const inventoryTransactionApi = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionsByItemId,
  createTransactionOut,
  createTransactionIssueMaterial,
  getIssueMaterialTransactions,
};

export default inventoryTransactionApi;
