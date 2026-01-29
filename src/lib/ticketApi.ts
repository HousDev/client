import { api } from "./Api";

export type TicketAttachment = {
    file_name: string;
    original_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    uploaded_at: string;
};

export type Ticket = {
    id: number;
    ticket_number: string;
    employee_id: number;
    employee_name: string;
    employee_department: string;
    employee_designation: string;
    category: string;
    subject: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    assigned_to_id: number | null;
    assigned_to_name: string | null;
    response_count: number;
    last_response_at: string | null;
    created_at: string;
    updated_at: string;
    resolved_at: string | null;
    attachments: TicketAttachment[];
    attachments_count: number;
};

export type TicketStats = {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
};

export type TicketResponse = {
    success: boolean;
    data: Ticket;
};

export type TicketsResponse = {
    success: boolean;
    data: Ticket[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
};

export const ticketApi = {
    /**
     * Submit ticket with attachments
     * POST /tickets/submit
     */
    submitTicket: async (ticketData: any, files: File[] = []): Promise<{ 
        id: number; 
        ticket_number: string; 
        attachments_count: number 
    }> => {
        try {
            const formData = new FormData();
            
            // Add ticket data
            Object.keys(ticketData).forEach(key => {
                formData.append(key, ticketData[key]);
            });
            
            // Add files
            files.forEach(file => {
                formData.append('attachments', file);
            });

            console.log('Submitting ticket with form data');
            const response = await api.post("/tickets/submit", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Ticket submission response:', response.data);
            return response.data.data;
        } catch (error: any) {
            console.error("Submit ticket error:", error);
            if (error.response) {
                console.error("Error response:", error.response.data);
            }
            throw error;
        }
    },

    /**
     * Get all tickets with filters
     * GET /tickets
     */
    getTickets: async (filters?: {
        status?: string;
        category?: string;
        employee_id?: number;
        priority?: string;
        assigned_to_id?: number;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<{ data: Ticket[]; pagination: any }> => {
        try {
            console.log('Fetching tickets with filters:', filters);
            const response = await api.get("/tickets", { params: filters });
            console.log('Tickets response:', response.data);
            return {
                data: response.data.data || [],
                pagination: response.data.pagination || { total: 0, page: 1, limit: 50, pages: 1 }
            };
        } catch (error: any) {
            console.error("Get tickets error:", error.message);
            if (error.response) {
                console.error("Error response:", error.response.data);
            }
            return {
                data: [],
                pagination: { total: 0, page: 1, limit: 50, pages: 1 }
            };
        }
    },

    /**
     * Get ticket by ID
     * GET /tickets/:id
     */
    getTicket: async (id: number | string): Promise<Ticket> => {
        try {
            console.log('Fetching ticket by ID:', id);
            const response = await api.get(`/tickets/${id}`);
            console.log('Ticket response:', response.data);
            
            // Ensure attachments is always an array
            const ticket = response.data.data;
            if (ticket) {
                ticket.attachments = ticket.attachments || [];
                ticket.attachments_count = ticket.attachments_count || 0;
            }
            
            return ticket;
        } catch (error: any) {
            console.error("Get ticket error:", error.message);
            if (error.response) {
                console.error("Error response:", error.response.data);
            }
            throw error;
        }
    },

    /**
     * Get ticket statistics
     * GET /tickets/stats
     */
    getTicketStats: async (employeeId?: number): Promise<TicketStats> => {
        try {
            const response = await api.get("/tickets/stats", { 
                params: employeeId ? { employee_id: employeeId } : {} 
            });
            return response.data.data || {
                total: 0,
                open: 0,
                in_progress: 0,
                resolved: 0,
                closed: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            };
        } catch (error: any) {
            console.error("Get ticket stats error:", error.message);
            return {
                total: 0,
                open: 0,
                in_progress: 0,
                resolved: 0,
                closed: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            };
        }
    },

    /**
     * Get categories
     * GET /tickets/categories
     */
    getCategories: async (): Promise<string[]> => {
        try {
            const response = await api.get("/tickets/categories");
            return response.data.data || [];
        } catch (error: any) {
            console.error("Get categories error:", error.message);
            return [];
        }
    },

    /**
     * Update ticket status
     * PUT /tickets/:id/status
     */
    updateTicketStatus: async (
        id: number | string,
        status: string,
        userData: { user_id: string; user_name: string }
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.put(`/tickets/${id}/status`, { 
                status, 
                ...userData 
            });
            return response.data;
        } catch (error: any) {
            console.error("Update ticket status error:", error.message);
            throw error;
        }
    },

    /**
     * Assign ticket
     * PUT /tickets/:id/assign
     */
    assignTicket: async (
        id: number | string,
        assignmentData: {
            assigned_to_id: number;
            assigned_to_name: string;
            assigned_by_id: number;
            assigned_by_name: string;
        }
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.put(`/tickets/${id}/assign`, assignmentData);
            return response.data;
        } catch (error: any) {
            console.error("Assign ticket error:", error.message);
            throw error;
        }
    },

    /**
     * Add response/comment
     * POST /tickets/:id/response
     */
    addResponse: async (id: number | string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.post(`/tickets/${id}/response`, {});
            return response.data;
        } catch (error: any) {
            console.error("Add response error:", error.message);
            throw error;
        }
    },

    /**
     * Delete ticket
     * DELETE /tickets/:id
     */
    deleteTicket: async (id: number | string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.delete(`/tickets/${id}`);
            return response.data;
        } catch (error: any) {
            console.error("Delete ticket error:", error.message);
            throw error;
        }
    },

    /**
     * Add attachments to ticket
     * POST /tickets/:id/attachments
     */
    addAttachments: async (
        id: number | string,
        files: File[]
    ): Promise<{ success: boolean; message: string; data: any }> => {
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });

            const response = await api.post(`/tickets/${id}/attachments`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error: any) {
            console.error("Add attachments error:", error.message);
            throw error;
        }
    },

    /**
     * Get ticket attachments
     * GET /tickets/:id/attachments
     */
    getAttachments: async (id: number | string): Promise<{ attachments: TicketAttachment[]; attachments_count: number }> => {
        try {
            const response = await api.get(`/tickets/${id}/attachments`);
            return {
                attachments: response.data.data?.attachments || [],
                attachments_count: response.data.data?.attachments_count || 0
            };
        } catch (error: any) {
            console.error("Get attachments error:", error.message);
            return {
                attachments: [],
                attachments_count: 0
            };
        }
    },

    /**
     * Remove attachment from ticket
     * DELETE /tickets/:id/attachments/:fileName
     */
    removeAttachment: async (
        id: number | string,
        fileName: string
    ): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await api.delete(`/tickets/${id}/attachments/${fileName}`);
            return response.data;
        } catch (error: any) {
            console.error("Remove attachment error:", error.message);
            throw error;
        }
    }
};

export default ticketApi;