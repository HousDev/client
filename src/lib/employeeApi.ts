// // src/lib/hrmsEmployeesApi.ts
// import { api, unwrap } from "../lib/Api";

// /**
//  * Employee Type
//  */
// export type HrmsEmployee = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;

//   role_id: number;
//   department_id: string;
//   designation: string;

//   joining_date: string;
//   gender: string;

//   allotted_project: number;

//   office_location?: string | null;
//   attendence_location: string;

//   created_at?: string;
//   updated_at?: string;
// };

// export const HrmsEmployeesApi = {
//   /**
//    * Get all employees
//    * GET /api/hrms-employees
//    */
//   getEmployees: async (): Promise<HrmsEmployee[]> =>
//     unwrap(api.get("/employees")),

//   /**
//    * Get single employee by ID
//    * GET /api/hrms-employees/:id
//    */
//   getEmployee: async (id: number | string): Promise<HrmsEmployee> =>
//     unwrap(api.get(`/employees/${id}`)),

//   /**
//    * Get employee by email
//    * GET /api/hrms-employees/email/:email
//    */
//   getEmployeeByEmail: async (email: string): Promise<HrmsEmployee> =>
//     unwrap(api.get(`/employees/email/${email}`)),

//   /**
//    * Create employee
//    * POST /api/hrms-employees
//    */
//   createEmployee: async (
//     payload: Partial<HrmsEmployee>,
//   ): Promise<HrmsEmployee> => unwrap(api.post("/employees", payload)),

//   /**
//    * Update employee
//    * PUT /api/hrms-employees/:id
//    */
//   updateEmployee: async (
//     id: number | string,
//     payload: Partial<HrmsEmployee>,
//   ): Promise<HrmsEmployee> => unwrap(api.put(`/employees/${id}`, payload)),

//   /**
//    * Delete employee
//    * DELETE /api/hrms-employees/:id
//    */
//   deleteEmployee: async (id: number | string): Promise<{ message: string }> =>
//     unwrap(api.delete(`/employees/${id}`)),
// };

// export default HrmsEmployeesApi;


// src/lib/employeeApi.ts - UPDATE WITH NEW METHOD
import { api, unwrap } from "./Api";

/**
 * Employee Type with profile picture
 */
export type HrmsEmployee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_picture?: string;
  role_id: number;
  department_id: string;
  designation: string;
  joining_date: string;
  gender: string;
  allotted_project: number;
  office_location?: string | null;
  attendence_location: string;
  employee_status: string;
  user_id?: string; // Add user_id for linking (optional)
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
   * Create employee with file upload
   * POST /api/hrms-employees
   */
  createEmployee: async (
    formData: FormData
  ): Promise<HrmsEmployee> => 
    unwrap(api.post("/employees", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })),

  /**
   * NEW: Create employee from user data (simplified version)
   * POST /api/employees/create-from-user
   */
 // In src/lib/employeeApi.ts, update the createFromUser method:

/**
 * NEW: Create employee from user data (simplified version)
 * POST /api/employees/create-from-user
 */
// In src/lib/employeeApi.ts, update the createFromUser method:
createFromUser: async (
  employeeData: any
): Promise<HrmsEmployee> => {
  try {
    console.log("Sending employee data to create-from-user:", employeeData);
    
    const response = await api.post("/employees/create-from-user", employeeData);
    console.log("Create from user response:", response.data);
    
    // Handle the response structure from your backend
    if (response.data.success && response.data.data) {
      return response.data.data;
    } else if (response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error: any) {
    console.error("Create from user error details:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    throw error;
  }
},

  /**
   * Update employee with file upload
   * PUT /api/hrms-employees/:id
   */
  updateEmployee: async (
    id: number | string,
    formData: FormData
  ): Promise<HrmsEmployee> => 
    unwrap(api.put(`/employees/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })),

  /**
   * Delete employee
   * DELETE /api/hrms-employees/:id
   */
  deleteEmployee: async (id: number | string): Promise<{ message: string }> =>
    unwrap(api.delete(`/employees/${id}`)),
};

export default HrmsEmployeesApi;