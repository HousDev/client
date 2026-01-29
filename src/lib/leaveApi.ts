import { api } from "./Api";

export type LeaveApplication = {
  id: number;
  application_number: string;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  total_days: number;
  reason: string;
  attachment_path?: string;
  attachment_name?: string;
  status: "pending" | "approved" | "rejected";
  approved_by?: number;
  approved_by_username?: string;
  approved_by_name?: string;
  approved_at?: string;
  rejected_by?: number;
  rejected_by_username?: string;
  rejected_by_name?: string;
  rejected_at?: string;
  rejection_reason?: string;
  applied_at: string;
  updated_at: string;
  is_half_day?: boolean; // Add this
  half_day_period?: 'morning' | 'afternoon'; // Add this
};

export type LeaveStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  onLeaveToday: number;
};

export const LeaveApi = {
  // Apply for leave
  applyLeave: async (formData: FormData): Promise<any> => {
    const response = await api.post("/leaves/apply", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get all leaves
  getLeaves: async (filters?: {
    employee_id?: number;
    status?: string;
    leave_type?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: LeaveApplication[]; pagination: any }> => {
    const response = await api.get("/leaves", { params: filters });
    return response.data;
  },

  // Get leave by ID
  getLeaveById: async (id: number): Promise<LeaveApplication> => {
    const response = await api.get(`/leaves/${id}`);
    return response.data.data;
  },

  // Get leave statistics
  getLeaveStats: async (): Promise<LeaveStats> => {
    const response = await api.get("/leaves/stats");
    return response.data.data;
  },

  // Approve leave - FIXED: Send string user_id
  approveLeave: async (
    id: number, 
    user_id: string, // Changed from number to string
    username?: string, 
    name?: string
  ): Promise<any> => {
    const response = await api.post(`/leaves/${id}/approve`, { 
      user_id: user_id, // Send as string
      username: username || user_id,
      name: name || 'Admin User'
    });
    return response.data;
  },

  // Reject leave - FIXED: Send string user_id
  rejectLeave: async (
    id: number,
    user_id: string, // Changed from number to string
    rejection_reason: string,
    username?: string,
    name?: string
  ): Promise<any> => {
    const response = await api.post(`/leaves/${id}/reject`, {
      user_id: user_id, // Send as string
      rejection_reason: rejection_reason,
      username: username || user_id,
      name: name || 'Admin User'
    });
    return response.data;
  },

  // Download attachment - FIXED: Use proper endpoint
  downloadAttachment: async (id: number): Promise<Blob> => {
    const response = await api.get(`/leaves/${id}/download`, {
      responseType: "blob",
      headers: {
        'Accept': 'application/octet-stream'
      }
    });
    return response.data;
  },

  // Delete leave
  deleteLeave: async (id: number): Promise<any> => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },
};