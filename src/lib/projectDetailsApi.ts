import { api, unwrap } from "../lib/Api";

export type ProjectDetail = {
  id: number;
  name: string;
  category: string;
  created_at?: string;
  updated_at?: string;
};

const ProjectDetailsApi = {
  getAll: async (): Promise<ProjectDetail[]> =>
    unwrap(api.get("/project-details")),

  getById: async (id: number | string): Promise<ProjectDetail> =>
    unwrap(api.get(`/project-details/${id}`)),

  create: async (payload: Partial<ProjectDetail>): Promise<ProjectDetail> =>
    unwrap(api.post("/project-details", payload)),

  update: async (
    id: number | string,
    payload: Partial<ProjectDetail>
  ): Promise<ProjectDetail> =>
    unwrap(api.put(`/project-details/${id}`, payload)),

  delete: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/project-details/${id}`)),
};

export default ProjectDetailsApi;
