import { api, unwrap } from "./Api";
import { HrmsEmployee } from "./employeeApi";

export type Expense = {
    id: number;
    claim_number: string;
    employee_id: number;
    category: string;
    expense_date: string;
    merchant_vendor_name: string;
    description: string;
    amount: number;
    currency: string;
    receipt_path?: string;
    receipt_original_name?: string;
    receipt_file_type?: string;
    receipt_size?: number;
    status: 'pending_approval' | 'approved' | 'rejected';
    approver_id?: number;
    approver_name?: string;
    approval_date?: string;
    approval_notes?: string;
    rejection_reason?: string;
    created_at: string;
    updated_at: string;
    // Employee details will be merged from employee API
    employee?: HrmsEmployee;
};

export type ExpenseStats = {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    total_amount: number;
};

export const expenseApi = {
    /**
     * Submit expense claim with file upload
     * POST /expenses/submit
     */
    submitExpense: async (formData: FormData): Promise<{ id: number; claim_number: string }> => {
        try {
            console.log("Submitting expense with form data:", Object.fromEntries(formData));
            
            const response = await api.post("/expenses/submit", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log("Submit expense response:", response.data);
            return response.data.data;
        } catch (error: any) {
            console.error("Submit expense error details:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw error;
        }
    },

    /**
     * Get all expenses with filters
     * GET /expenses
     */
    getExpenses: async (filters?: {
        status?: string;
        category?: string;
        employee_id?: number;
        start_date?: string;
        end_date?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Expense[]; pagination: any }> => {
        try {
            const response = await api.get("/expenses", { params: filters });
            return response.data;
        } catch (error: any) {
            console.error("Get expenses error:", error.message);
            throw error;
        }
    },

    /**
     * Get expense by ID
     * GET /expenses/:id
     */
    getExpense: async (id: number | string): Promise<Expense> => {
        try {
            const response = await api.get(`/expenses/${id}`);
            return response.data.data;
        } catch (error: any) {
            console.error("Get expense error:", error.message);
            throw error;
        }
    },

    /**
     * Get expense statistics
     * GET /expenses/stats
     */
    getExpenseStats: async (): Promise<ExpenseStats> => {
        try {
            const response = await api.get("/expenses/stats");
            return response.data.data;
        } catch (error: any) {
            console.error("Get expense stats error:", error.message);
            throw error;
        }
    },

    /**
     * Get categories
     * GET /expenses/categories
     */
    getCategories: async (): Promise<string[]> => {
        try {
            const response = await api.get("/expenses/categories");
            return response.data.data;
        } catch (error: any) {
            console.error("Get categories error:", error.message);
            throw error;
        }
    },

    /**
     * Approve expense
     * POST /expenses/:id/approve
     */
    approveExpense: async (
        id: number | string,
        userData: { user_id: string; username: string; name: string; notes?: string }
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post(`/expenses/${id}/approve`, userData);
            return response.data;
        } catch (error: any) {
            console.error("Approve expense error:", error.message);
            throw error;
        }
    },

    /**
     * Reject expense
     * POST /expenses/:id/reject
     */
    rejectExpense: async (
        id: number | string,
        userData: { user_id: string; username: string; name: string; notes: string }
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post(`/expenses/${id}/reject`, userData);
            return response.data;
        } catch (error: any) {
            console.error("Reject expense error:", error.message);
            throw error;
        }
    },

    /**
     * Download receipt
     * GET /expenses/:id/download
     */
    downloadReceipt: async (id: number | string): Promise<Blob> => {
        try {
            const response = await api.get(`/expenses/${id}/download`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error: any) {
            console.error("Download receipt error:", error.message);
            throw error;
        }
    },

    /**
     * Delete expense
     * DELETE /expenses/:id
     */
    deleteExpense: async (id: number | string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.delete(`/expenses/${id}`);
            return response.data;
        } catch (error: any) {
            console.error("Delete expense error:", error.message);
            throw error;
        }
    }
};

export default expenseApi;