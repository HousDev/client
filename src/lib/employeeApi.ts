/* eslint-disable @typescript-eslint/no-explicit-any */
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

// // src/lib/employeeApi.ts - UPDATE WITH NEW METHOD
// import { api, unwrap } from "./Api";

// /**
//  * Employee Type with profile picture
//  */
// export type HrmsEmployee = {
//   id: number;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone: string;
//   profile_picture?: string;
//   role_id: number;
//   department_id: string;
//   designation: string;
//   joining_date: string;
//   gender: string;
//   allotted_project: number;
//   office_location?: string | null;
//   attendence_location: string;
//   employee_status: string;
//   user_id?: string; // Add user_id for linking (optional)
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
//    * Create employee with file upload
//    * POST /api/hrms-employees
//    */
//   createEmployee: async (
//     formData: FormData
//   ): Promise<HrmsEmployee> =>
//     unwrap(api.post("/employees", formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     })),

//   /**
//    * NEW: Create employee from user data (simplified version)
//    * POST /api/employees/create-from-user
//    */
//  // In src/lib/employeeApi.ts, update the createFromUser method:

// /**
//  * NEW: Create employee from user data (simplified version)
//  * POST /api/employees/create-from-user
//  */
// // In src/lib/employeeApi.ts, update the createFromUser method:
// createFromUser: async (
//   employeeData: any
// ): Promise<HrmsEmployee> => {
//   try {
//     console.log("Sending employee data to create-from-user:", employeeData);

//     const response = await api.post("/employees/create-from-user", employeeData);
//     console.log("Create from user response:", response.data);

//     // Handle the response structure from your backend
//     if (response.data.success && response.data.data) {
//       return response.data.data;
//     } else if (response.data) {
//       return response.data;
//     } else {
//       throw new Error("Invalid response format");
//     }
//   } catch (error: any) {
//     console.error("Create from user error details:", {
//       message: error.message,
//       status: error.response?.status,
//       data: error.response?.data,
//       config: error.config
//     });
//     throw error;
//   }
// },

//   /**
//    * Update employee with file upload
//    * PUT /api/hrms-employees/:id
//    */
//   updateEmployee: async (
//     id: number | string,
//     formData: FormData
//   ): Promise<HrmsEmployee> =>
//     unwrap(api.put(`/employees/${id}`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data'
//       }
//     })),

//   /**
//    * Delete employee
//    * DELETE /api/hrms-employees/:id
//    */
//   deleteEmployee: async (id: number | string): Promise<{ message: string }> =>
//     unwrap(api.delete(`/employees/${id}`)),
// };

// export default HrmsEmployeesApi;

// src/lib/employeeApi.ts
import { api, unwrap } from "./Api";

/**
 * Comprehensive Employee Type with all fields
 */
export type HrmsEmployee = {
  success: any;
  message: string;
  id: number;
  employee_code: string;

  // Basic Details
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
  allotted_project: number | null;
  office_location?: string | null;
  attendence_location: string;
  employee_status: string;

  // Personal Details
  blood_group?: string;
  date_of_birth?: string;
  marital_status?: string;
  emergency_contact?: string;
  nationality?: string;

  // Address Details
  current_address?: string;
  permanent_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  same_as_permanent?: boolean;

  // Identification Details
  aadhar_number?: string;
  pan_number?: string;

  // Educational Details
  highest_qualification?: string;
  university?: string;
  passing_year?: string;
  percentage?: string;

  // Employment Details
  employee_type?: string;
  branch?: string;
  probation_period?: string;
  work_mode?: string;
  date_of_leaving?: string;
  job_title?: string;
  notice_period?: string;
  salary?: string; // or number if you prefer
  salary_type?: string; // "monthly" or "yearly"

  // System Details
  laptop_assigned?: string;
  system_login_id?: string;
  system_password?: string;
  office_email_id?: string;
  office_email_password?: string;

  // Bank Details
  bank_account_number?: string;
  bank_name?: string;
  ifsc_code?: string;
  upi_id?: string;

  // Joins (from backend queries)
  role_name?: string;
  department_name?: string;
  project_name?: string;

  // Timestamps
  user_id?: string;
  created_at?: string;
  updated_at?: string;
};

export const HrmsEmployeesApi = {
  /**
   * Get all employees
   * GET /employees
   */
  getEmployees: async (): Promise<HrmsEmployee[]> =>
    unwrap(api.get("/employees")),

  /**
   * Get single employee by ID
   * GET /employees/:id
   */
  getEmployee: async (id: number | string): Promise<HrmsEmployee> =>
    unwrap(api.get(`/employees/${id}`)),

  /**
   * Get employee by email
   * GET /employees/email/:email
   */
  getEmployeeByEmail: async (email: string): Promise<HrmsEmployee> =>
    unwrap(api.get(`/employees/email/${email}`)),

  /**
   * Create employee with file upload and comprehensive data
   * POST /employees
   */
  createEmployee: async (formData: FormData): Promise<HrmsEmployee> => {
    try {
      console.log(
        "Creating employee with form data:",
        Object.fromEntries(formData),
      );

      const response = await api.post("/employees", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Create employee response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Create employee error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      if (
        error.response?.data?.message?.toLowerCase().includes("phone") ||
        error.response?.data?.errors?.phone
      ) {
        throw new Error("Phone number already exists");
      }
      throw error;
    }
  },

  /**
   * Create employee from user data (simplified version)
   * POST /employees/create-from-user
   */
  createFromUser: async (employeeData: any): Promise<HrmsEmployee> => {
    try {
      console.log("Sending employee data to create-from-user:", employeeData);

      const response = await api.post(
        "/employees/create-from-user",
        employeeData,
      );
      console.log("Create from user response:", response.data);

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
        config: error.config,
      });
      throw error;
    }
  },

  /**
   * Update employee with file upload and comprehensive data
   * PUT /employees/:id
   */
  updateEmployee: async (
    id: number | string,
    formData: FormData,
  ): Promise<HrmsEmployee> => {
    try {
      console.log(
        `Updating employee ${id} with form data:`,
        Object.fromEntries(formData),
      );

      const response = await api.put(`/employees/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update employee response:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Update employee error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      if (
        error.response?.data?.message?.toLowerCase().includes("phone") ||
        error.response?.data?.errors?.phone
      ) {
        throw new Error("Phone number already exists");
      }
      throw error;
    }
  },

  /**
   * Update only additional details (for AddMoreDetailsModal)
   * PATCH /employees/:id/additional-details
   */
  updateAdditionalDetails: async (
    id: number | string,
    payload: Partial<HrmsEmployee>,
  ): Promise<{ success: boolean; message: string; data: HrmsEmployee }> => {
    try {
      console.log(`Updating additional details for employee ${id}:`, payload);

      const response = await api.patch(
        `/employees/${id}/additional-details`,
        payload,
      );
      console.log("Update additional details response:", response.data);

      return response.data;
    } catch (error: any) {
      console.error("Update additional details error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  /**
   * Update employee status
   * PATCH /employees/:id/status
   */
  // In employeeApi.ts
  updateEmployeeStatus: async (
    id: number | string,
    status: string,
  ): Promise<HrmsEmployee> => {
    try {
      console.log(`Updating status for employee ${id} to:`, status);

      // ✅ Send 'employee_status' as parameter name, not 'status'
      const response = await api.patch(`/employees/${id}/status`, {
        employee_status: status,
      });
      return response.data;
    } catch (error: any) {
      console.error("Update employee status error:", error.message);
      throw error;
    }
  },

  /**
   * Delete employee
   * DELETE /employees/:id
   */
  deleteEmployee: async (
    id: number | string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.delete(`/employees/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Delete employee error:", error.message);
      throw error;
    }
  },

  /**
   * Bulk delete employees
   * POST /employees/bulk-delete
   */
  bulkDeleteEmployees: async (
    ids: number[],
  ): Promise<{ success: boolean; message: string; deletedCount: number }> => {
    try {
      console.log("Bulk deleting employees:", ids);

      const response = await api.post("/employees/bulk-delete", { ids });
      return response.data;
    } catch (error: any) {
      console.error("Bulk delete error:", error.message);
      throw error;
    }
  },

  /**
   * Search employees with filters
   * GET /employees/search
   */
  searchEmployees: async (filters: {
    search?: string;
    department?: string;
    role?: string;
    status?: string;
    employee_type?: string;
    gender?: string;
  }): Promise<HrmsEmployee[]> => {
    try {
      console.log("Searching employees with filters:", filters);

      const response = await api.get("/employees/search", { params: filters });
      return response.data;
    } catch (error: any) {
      console.error("Search employees error:", error.message);
      throw error;
    }
  },

  /**
   * Export employees to CSV
   * GET /employees/export
   */
  exportEmployees: async (filters?: {
    department?: string;
    role?: string;
    status?: string;
  }): Promise<Blob> => {
    try {
      console.log("Exporting employees with filters:", filters);

      const response = await api.get("/employees/export", {
        params: filters,
        responseType: "blob",
      });

      return response.data;
    } catch (error: any) {
      console.error("Export employees error:", error.message);
      throw error;
    }
  },

  /**
   * Get employee statistics
   * GET /employees/stats
   */
  getEmployeeStats: async (): Promise<{
    total: number;
    active: number;
    onLeave: number;
    newThisMonth: number;
    byDepartment: Record<string, number>;
    byGender: Record<string, number>;
    byEmployeeType: Record<string, number>;
  }> => {
    try {
      const response = await api.get("/employees/stats");
      return response.data;
    } catch (error: any) {
      console.error("Get employee stats error:", error.message);
      throw error;
    }
  },
};

export default HrmsEmployeesApi;
