import { api, unwrap } from "./Api";

/* =====================================================
   Create Incentive
===================================================== */
async function createIncentive(payload: {
  employee_id: number | string;
  incentive_type: string;
  month: number | string;
  year: number | string;
  amount: number | string;
  description?: string;
  created_by: number | string;
}) {
  const res: any = await api.post("/employee-incentive", payload);
  return unwrap(res);
}

/* =====================================================
   Approve Incentive
===================================================== */
async function approveIncentive(
  id: number | string,
  approved_by: number | string,
) {
  const res: any = await api.put(`/employee-incentive/${id}/approve`, {
    approved_by,
  });
  return unwrap(res);
}

/* =====================================================
   Reject Incentive
===================================================== */
async function rejectIncentive(
  id: number | string,
  rejected_by: number | string,
) {
  const res: any = await api.put(`/employee-incentive/${id}/reject`, {
    rejected_by,
  });
  return unwrap(res);
}

/* =====================================================
   Mark Incentive as Paid
===================================================== */
async function markAsPaid(id: number | string) {
  const res: any = await api.put(`/employee-incentive/${id}/paid`);
  return unwrap(res);
}

/* =====================================================
   Get Single Incentive
===================================================== */
async function getIncentiveById(id: number | string) {
  const res: any = await api.get(`/employee-incentive/${id}`);
  return unwrap(res);
}

async function deleteIncentiveById(id: number | string) {
  const res: any = await api.delete(`/employee-incentive/${id}`);
  return unwrap(res);
}

/* =====================================================
   Get Employee Incentives
===================================================== */
async function getEmployeeIncentives(employeeId: number | string) {
  const res: any = await api.get(`/employee-incentive/employee/${employeeId}`);
  return unwrap(res);
}

/* =====================================================
   Get Incentives by Month & Year (Payroll)
===================================================== */
async function getIncentivesByMonthYear(
  month: number | string,
  year: number | string,
) {
  const res: any = await api.get(
    `/employee-incentive/month/${month}/year/${year}`,
  );
  return unwrap(res);
}
async function getAllIncentives() {
  const res: any = await api.get(`/employee-incentive/`);
  return unwrap(res);
}

const employeeIncentiveApi = {
  createIncentive,
  approveIncentive,
  deleteIncentiveById,
  rejectIncentive,
  markAsPaid,
  getAllIncentives,
  getIncentiveById,
  getEmployeeIncentives,
  getIncentivesByMonthYear,
};

export default employeeIncentiveApi;
