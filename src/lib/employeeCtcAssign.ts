import { api, unwrap } from "./Api";

/* =====================================================
   Assign CTC Template to Employee
===================================================== */
async function assignTemplate(payload: {
  employee_id: number | string;
  template_id: number | string;
  ctc_amount: number | string;
  effective_from: string; // YYYY-MM-DD
}) {
  const res: any = await api.post("/employee-ctc-assign", payload);
  return unwrap(res);
}

/* =====================================================
   Update Assignment
===================================================== */
async function updateAssignment(
  id: number | string,
  payload: {
    template_id: number | string;
    ctc_amount: number | string;
    effective_from: string;
  },
) {
  const res: any = await api.put(`/employee-ctc-assign/${id}`, payload);
  return unwrap(res);
}

/* =====================================================
   Get Current CTC of Employee
===================================================== */
async function getCurrentCTC(employeeId: number | string) {
  const res: any = await api.get(`/employee-ctc-assign/employee/${employeeId}`);
  return unwrap(res);
}

/* =====================================================
   Get Full CTC History of Employee
===================================================== */
async function getCTCHistory(employeeId: number | string) {
  const res: any = await api.get(
    `/employee-ctc-assign/employee/${employeeId}/history`,
  );
  return unwrap(res);
}

/* =====================================================
   Delete Assignment
===================================================== */
async function deleteAssignment(id: number | string) {
  const res: any = await api.delete(`/employee-ctc-assign/${id}`);
  return unwrap(res);
}

const employeeCtcAssignApi = {
  assignTemplate,
  updateAssignment,
  getCurrentCTC,
  getCTCHistory,
  deleteAssignment,
};

export default employeeCtcAssignApi;
