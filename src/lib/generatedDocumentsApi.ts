// lib/generatedDocumentsApi.ts
import { api } from "./Api";

export type GeneratedDocument = {
  id: number;
  employee_id: number;
  doc_type: string;
  html_content: string;
  created_at: string;
  updated_at: string;
  employee_name?: string;
  employee_code?: string;
  employee_email?: string;
  designation?: string;
};

export const GeneratedDocumentsApi = {
  // Save generated document - POST to /api/generated-document
  saveDocument: async (data: {
    employee_id: number;
    doc_type: string;
    html_content: string;
  }): Promise<{ success: boolean; message: string; data: { id: number } }> => {
    const response = await api.post("/generated-document", data);
    return response.data;
  },

  // Get all documents - GET from /api/generated-document
  getDocuments: async (filters?: {
    doc_type?: string;
    employee_id?: number;
  }): Promise<GeneratedDocument[]> => {
    const response = await api.get("/generated-document", { params: filters });
    return response.data.data;
  },

  // Get document by ID
  getDocumentById: async (id: number): Promise<GeneratedDocument> => {
    const response = await api.get(`/generated-document/${id}`);
    return response.data.data;
  },

  // Get documents by employee
  getDocumentsByEmployee: async (
    employeeId: number,
  ): Promise<GeneratedDocument[]> => {
    const response = await api.get(
      `/generated-document/employee/${employeeId}`,
    );
    return response.data.data;
  },

  // Get documents by type
  getDocumentsByType: async (docType: string): Promise<GeneratedDocument[]> => {
    const response = await api.get(`/generated-document/type/${docType}`);
    return response.data.data;
  },

  // Delete document
  deleteDocument: async (
    id: number,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/generated-document/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{
    total_documents: number;
    total_employees: number;
    today_generated: number;
    offer_letters: number;
    experience_letters: number;
    pay_slips: number;
  }> => {
    const response = await api.get("/generated-document/statistics");
    return response.data.data;
  },
};
