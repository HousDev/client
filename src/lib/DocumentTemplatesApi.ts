import { api } from "./Api";

// ============================================
// TYPES
// ============================================
export type DocumentTemplate = {
  id: number;
  name: string;
  category: string;
  description?: string;
  html_content: string;
  variables: any[];
  logo_url?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  status: string;
  rejection_reason: string;
};

// ============================================
// API
// ============================================
export const DocumentTemplatesApi = {
  createTemplate: async (formData: FormData): Promise<any> => {
    const response = await api.post("/document-templates", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  getTemplates: async (): Promise<DocumentTemplate[]> => {
    const response = await api.get("/document-templates");
    return response.data.data;
  },

  getTemplateById: async (id: number): Promise<DocumentTemplate> => {
    const response = await api.get(`/document-templates/${id}`);
    return response.data.data;
  },

  approveTemplate: async (
    id: number,
    payload: any,
  ): Promise<DocumentTemplate> => {
    const response = await api.put(
      `/document-templates/approve/${id}`,
      payload,
    );
    return response.data;
  },

  activeInactiveTemplate: async (
    id: number,
    payload: any,
  ): Promise<DocumentTemplate> => {
    const response = await api.put(
      `/document-templates/active-inactive/${id}`,
      payload,
    );
    return response.data;
  },

  updateTemplate: async (id: number, formData: FormData): Promise<any> => {
    const response = await api.put(`/document-templates/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  rejectDocumentTemplate: async (id: string | number, payload: any) => {
    const response = await api.put(`/document-templates/reject/${id}`, payload);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<any> => {
    const response = await api.delete(`/document-templates/${id}`);
    return response.data;
  },
};
