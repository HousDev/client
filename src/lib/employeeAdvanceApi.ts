import { api, unwrap } from "./Api";

/**
 * Create Advance Request
 */
async function createAdvance(payload: any) {
  const res: any = await api.post("/employee-advance", payload);
  return unwrap(res);
}

/**
 * Approve Advance
 */
async function approveAdvance(
  id: number | string,
  approved_by: number | string,
) {
  const res: any = await api.put(`/employee-advance/${id}/approve`, {
    approved_by,
  });
  return unwrap(res);
}

/**
 * Reject Advance
 */
async function rejectAdvance(
  id: number | string,
  rejected_by: number | string,
) {
  const res: any = await api.put(`/employee-advance/${id}/reject`, {
    rejected_by,
  });
  return unwrap(res);
}

/**
 * Mark Advance as Disbursed
 */
async function disburseAdvance(id: number | string) {
  const res: any = await api.put(`/employee-advance/${id}/disburse`);
  return unwrap(res);
}

/**
 * Close Advance
 */
async function closeAdvance(id: number | string) {
  const res: any = await api.put(`/employee-advance/${id}/close`);
  return unwrap(res);
}

/**
 * Get Single Advance
 */
async function getAdvance(id: number | string) {
  const res: any = await api.get(`/employee-advance/${id}`);
  return unwrap(res);
}

/**
 * Get All Advances of Employee
 */
async function getEmployeeAdvances(employeeId: number | string) {
  const res: any = await api.get(`/employee-advance/employee/${employeeId}`);
  return unwrap(res);
}

const employeeAdvanceApi = {
  createAdvance,
  approveAdvance,
  rejectAdvance,
  disburseAdvance,
  closeAdvance,
  getAdvance,
  getEmployeeAdvances,
};

export default employeeAdvanceApi;
