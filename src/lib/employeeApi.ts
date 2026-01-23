// src/lib/hrmsEmployeesApi.ts
import { api, unwrap } from "../lib/Api";

/**
 * Employee Type
 */
export type HrmsEmployee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  role_id: number;
  department_id: string;
  designation: string;

  joining_date: string;
  gender: string;

  allotted_project: number;

  office_location?: string | null;
  attendence_location: string;

  created_at?: string;
  updated_at?: string;
};

export const HrmsEmployeesApi = {
  /**
   * Get all employees
   * GET /api/hrms-employees
   */
  getEmployees: async (): Promise<HrmsEmployee[]> =>
    unwrap(api.get("/employees")),

  /**
   * Get single employee by ID
   * GET /api/hrms-employees/:id
   */
  getEmployee: async (id: number | string): Promise<HrmsEmployee> =>
    unwrap(api.get(`/employees/${id}`)),

  /**
   * Get employee by email
   * GET /api/hrms-employees/email/:email
   */
  getEmployeeByEmail: async (email: string): Promise<HrmsEmployee> =>
    unwrap(api.get(`/employees/email/${email}`)),

  /**
   * Create employee
   * POST /api/hrms-employees
   */
  createEmployee: async (
    payload: Partial<HrmsEmployee>,
  ): Promise<HrmsEmployee> => unwrap(api.post("/employees", payload)),

  /**
   * Update employee
   * PUT /api/hrms-employees/:id
   */
  updateEmployee: async (
    id: number | string,
    payload: Partial<HrmsEmployee>,
  ): Promise<HrmsEmployee> => unwrap(api.put(`/employees/${id}`, payload)),

  /**
   * Delete employee
   * DELETE /api/hrms-employees/:id
   */
  deleteEmployee: async (id: number | string): Promise<{ message: string }> =>
    unwrap(api.delete(`/employees/${id}`)),
};

export default HrmsEmployeesApi;
