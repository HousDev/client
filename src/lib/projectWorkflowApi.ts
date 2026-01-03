// src/lib/projectApi.ts
import { api, unwrap } from "./Api"; // path correct for your structure

/* ----------------------------------------------
   API WRAPPER
---------------------------------------------- */

/** Update project */
export async function updateProject(
  flatId: string | number,
  taskId: string | number,
  payload: any
) {
  const res = await api.put(`/flats/${flatId}/tasks/${taskId}`, payload);
  return unwrap(res);
}

/* ----------------------------------------------
   Group Export
---------------------------------------------- */
const projectWorkflowApi = {
  updateProject,
};

export default projectWorkflowApi;
