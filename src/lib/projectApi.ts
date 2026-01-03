// src/lib/projectApi.ts
import { api, unwrap } from "./Api"; // path correct for your structure

/* ----------------------------------------------
   Types
---------------------------------------------- */

export interface Project {
  id: string | number;
  name: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  is_active?: boolean;
}

export interface ProjectFormData {
  name: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  is_active?: boolean;
}

/* ----------------------------------------------
   API WRAPPER
---------------------------------------------- */

/** Get all projects */
export async function getProjects(): Promise<Project[]> {
  const res = await api.get("/projects");
  return unwrap(res);
}

/** Get project by id */
export async function getProjectById(id: string | number): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return unwrap(res);
}

/** Create project */
export async function createProject(payload: any): Promise<Project> {
  const res = await api.post("/projects", payload);
  return unwrap(res);
}

/** Update project */
export async function updateProject(
  id: string | number,
  payload: any
): Promise<Project> {
  const res = await api.put(`/projects/${id}`, payload);
  return unwrap(res);
}

/** Delete project */
export async function deleteProject(
  id: string | number
): Promise<{ message: string }> {
  const res = await api.delete(`/projects/${id}`);
  return unwrap(res);
}

/* ----------------------------------------------
   Group Export
---------------------------------------------- */
const projectApi = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
};

export default projectApi;
