// src/lib/areaSubTasksApi.ts
import { api, unwrap } from "../lib/Api";

/**
 * Sub Task Type
 */
export type AreaSubTask = {
  id: number;
  area_task_id: number;
  name: string;
  unit: "sqft" | "sqm" | "rmt" | "nos" | "cum";
  total_work: number;
  progress: number;
  status: "pending" | "in_progress" | "completed" | "delayed";
  created_at?: string;
  updated_at?: string;
};

export const AreaSubTasksApi = {
  /**
   * Get all sub-tasks
   * Optional filter by area_task_id
   * GET /api/area-sub-tasks?area_task_id=12
   */
  getSubTasks: async (
    area_task_id?: number | string,
  ): Promise<AreaSubTask[]> => {
    const query = area_task_id ? `?area_task_id=${area_task_id}` : "";
    return unwrap(api.get(`/area-sub-tasks${query}`));
  },

  /**
   * Get single sub-task by ID
   * GET /api/area-sub-tasks/:id
   */
  getSubTask: async (id: number | string): Promise<AreaSubTask> =>
    unwrap(api.get(`/area-sub-tasks/${id}`)),

  getSubTasksByProjectId: async (id: number | string): Promise<AreaSubTask> =>
    unwrap(api.get(`/area-sub-tasks/tasks/${id}`)),

  /**
   * Create new sub-task
   * POST /api/area-sub-tasks
   */
  createSubTask: async (payload: any): Promise<AreaSubTask> =>
    unwrap(api.post("/area-sub-tasks", payload)),

  /**
   * Update sub-task
   * PUT /api/area-sub-tasks/:id
   */
  updateSubTask: async (
    id: number | string,
    payload: Partial<AreaSubTask>,
  ): Promise<AreaSubTask> => unwrap(api.put(`/area-sub-tasks/${id}`, payload)),

  /**
   * Delete sub-task
   * DELETE /api/area-sub-tasks/:id
   */
  deleteSubTask: async (id: number | string): Promise<any> =>
    unwrap(api.delete(`/area-sub-tasks/${id}`)),

  /**
   * Recalculate progress manually
   * PUT /api/area-sub-tasks/:id/recalculate-progress
   */
  recalculateProgress: async (id: number | string): Promise<AreaSubTask> =>
    unwrap(api.put(`/area-sub-tasks/${id}/recalculate-progress`)),
};

export default AreaSubTasksApi;
