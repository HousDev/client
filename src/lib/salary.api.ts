import api from '../lib/Api';

export const salaryAPI = {
  getCTCTemplates: async () => {
    const response = await api.get('/salary/templates');
    return response.data.templates;
  },

  getCTCTemplateById: async (templateId) => {
    const response = await api.get(`/salary/templates/${templateId}`);
    return response.data.template;
  },

  createCTCTemplate: async (templateData) => {
    const response = await api.post('/salary/templates', templateData);
    return response.data;
  },

  getAllEmployeesWithSalary: async () => {
    const response = await api.get('/salary/employees');
    return response.data.employees;
  },

  getEmployeeSalary: async (employeeId) => {
    const response = await api.get(`/salary/employees/${employeeId}`);
    return response.data;
  },

  assignSalaryToEmployee: async (salaryData) => {
    const response = await api.post('/salary/employees/assign', salaryData);
    return response.data;
  },

  calculateSalaryBreakdown: async (ctcTemplateId, annualCTC) => {
    const response = await api.post('/salary/calculate-breakdown', {
      ctcTemplateId,
      annualCTC
    });
    return response.data.breakdown;
  }
};
