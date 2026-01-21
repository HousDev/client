// src/lib/areaTasksApi.ts
import { api, unwrap } from "./Api";

export interface AreaTask {
  id?: string;
  project_id: number | null;
  building_id: number | null;
  floor_id: number | null;
  flat_id: number | null;
  common_area_id: number | null;
  assigned_engineer: number | null;
  start_date: string;
  expected_end_date: string;
  progress: number;
  status: string;
  is_active: boolean;
  created_by?: number | null;

  // Display fields (from joins)
  project_name?: string;
  building_name?: string;
  floor_name?: string;
  flat_name?: string;
  common_area_name?: string;
  assigned_engineer_name?: string;
  created_by_name?: string;
}

export const AreaTasksApi = {
  getAreaTasks: async (queryParams = ""): Promise<AreaTask[]> => {
    const url = queryParams ? `/area-tasks?${queryParams}` : "/area-tasks";
    return unwrap(api.get(url));
  },

  getAreaTask: async (id: string | number): Promise<AreaTask> =>
    unwrap(api.get(`/area-tasks/${id}`)),

  createAreaTask: async (payload: Partial<AreaTask>): Promise<AreaTask> =>
    unwrap(api.post("/area-tasks", payload)),

  updateAreaTask: async (
    id: string | number,
    payload: Partial<AreaTask>,
  ): Promise<AreaTask> => unwrap(api.put(`/area-tasks/${id}`, payload)),

  deleteAreaTask: async (id: string | number): Promise<any> =>
    unwrap(api.delete(`/area-tasks/${id}`)),

  toggleAreaTaskStatus: async (id: string | number): Promise<AreaTask> =>
    unwrap(api.patch(`/area-tasks/${id}/toggle-active`)),
};

export default AreaTasksApi;
