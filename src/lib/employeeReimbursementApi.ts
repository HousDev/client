import { api, unwrap } from "./Api";

/* =====================================================
   Create Reimbursement
===================================================== */
async function createReimbursement(payload: {
  employee_id: number | string;
  category: string;
  amount: number | string;
  description?: string;
  doc?: string;
}) {
  const res: any = await api.post("/employee-reimbursement", payload);
  return unwrap(res);
}

/* =====================================================
   Update Reimbursement (Only if Pending)
===================================================== */
async function updateReimbursement(
  id: number | string,
  payload: {
    category: string;
    amount: number | string;
    description?: string;
    doc?: string;
  },
) {
  const res: any = await api.put(`/employee-reimbursement/${id}`, payload);
  return unwrap(res);
}

/* =====================================================
   Approve Reimbursement
===================================================== */
async function approveReimbursement(
  id: number | string,
  approved_by: number | string,
) {
  const res: any = await api.put(`/employee-reimbursement/${id}/approve`, {
    approved_by,
  });
  return unwrap(res);
}

/* =====================================================
   Reject Reimbursement
===================================================== */
async function rejectReimbursement(
  id: number | string,
  rejected_by: number | string,
) {
  const res: any = await api.put(`/employee-reimbursement/${id}/reject`, {
    rejected_by,
  });
  return unwrap(res);
}

/* =====================================================
   Mark as Paid
===================================================== */
async function markReimbursementAsPaid(id: number | string) {
  const res: any = await api.put(`/employee-reimbursement/${id}/paid`);
  return unwrap(res);
}

/* =====================================================
   Get Single Reimbursement
===================================================== */
async function getReimbursementById(id: number | string) {
  const res: any = await api.get(`/employee-reimbursement/${id}`);
  return unwrap(res);
}

/* =====================================================
   Get Employee Reimbursements
===================================================== */
async function getEmployeeReimbursements(employeeId: number | string) {
  const res: any = await api.get(
    `/employee-reimbursement/employee/${employeeId}`,
  );
  return unwrap(res);
}

/* =====================================================
   Get Approved Reimbursements (Payroll Use)
===================================================== */
async function getApprovedReimbursements() {
  const res: any = await api.get(`/employee-reimbursement/approved/list`);
  return unwrap(res);
}

/* =====================================================
   Delete Reimbursement (Only if Pending)
===================================================== */
async function deleteReimbursement(id: number | string) {
  const res: any = await api.delete(`/employee-reimbursement/${id}`);
  return unwrap(res);
}

const employeeReimbursementApi = {
  createReimbursement,
  updateReimbursement,
  approveReimbursement,
  rejectReimbursement,
  markReimbursementAsPaid,
  getReimbursementById,
  getEmployeeReimbursements,
  getApprovedReimbursements,
  deleteReimbursement,
};

export default employeeReimbursementApi;
