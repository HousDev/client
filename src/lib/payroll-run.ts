import api from '../lib/Api';

export const payrollRunAPI = {
  createPayrollRun: async (month, year) => {
    const response = await api.post('/payroll-run/runs', { month, year });
    return response.data;
  },

  getPayrollRun: async (runId) => {
    const response = await api.get(`/payroll-run/runs/${runId}`);
    return response.data;
  },

  getAllPayrollRuns: async () => {
    const response = await api.get('/payroll-run/runs');
    return response.data.runs || [];
  },

  addEmployeesToPayrollRun: async (payrollRunId, employeeIds) => {
    const response = await api.post('/payroll-run/runs/add-employees', {
      payrollRunId,
      employeeIds
    });
    return response.data;
  },

  getAttendanceSummary: async (payrollItemId) => {
    const response = await api.get(`/payroll-run/items/${payrollItemId}/attendance`);
    return response.data;
  },

  updateAttendanceDay: async (summaryId, date, dayData) => {
    const response = await api.put('/payroll-run/attendance/update-day', {
      summaryId,
      date,
      ...dayData
    });
    return response.data;
  },

  calculatePayrollItemSalary: async (payrollItemId) => {
    const response = await api.post(`/payroll-run/items/${payrollItemId}/calculate`);
    return response.data;
  },

  finalizePayrollItem: async (payrollItemId) => {
    const response = await api.post(`/payroll-run/items/${payrollItemId}/finalize`);
    return response.data;
  },

  addPayrollAdjustment: async (adjustmentData) => {
    const response = await api.post('/payroll-run/items/adjustments', adjustmentData);
    return response.data;
  }
};
