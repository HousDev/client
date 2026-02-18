import { api, unwrap } from "./Api";

/**
 * Create CTC Template
 */
async function createTemplate(payload: any) {
  const res: any = await api.post("/ctc-template", payload);
  return unwrap(res);
}

/**
 * Get all CTC Templates
 */
async function getTemplates() {
  const res: any = await api.get("/ctc-template");
  return unwrap(res);
}

/**
 * Get single CTC Template
 */
async function getTemplate(id: number | string) {
  const res: any = await api.get(`/ctc-template/${id}`);
  return unwrap(res);
}

async function setDefault(id: number | string) {
  const res: any = await api.get(`/ctc-template/set-default/${id}`);
  return unwrap(res);
}
async function toggleActive(id: number | string) {
  const res: any = await api.get(`/ctc-template/set-active/${id}`);
  return unwrap(res);
}

/**
 * Update CTC Template
 */
async function updateTemplate(id: number | string, payload: any) {
  const res: any = await api.put(`/ctc-template/${id}`, payload);
  return unwrap(res);
}

/**
 * Delete CTC Template
 */
async function deleteTemplate(id: number | string) {
  const res: any = await api.delete(`/ctc-template/${id}`);
  return unwrap(res);
}

const ctcTemplateApi = {
  createTemplate,
  setDefault,
  getTemplates,
  getTemplate,
  updateTemplate,
  toggleActive,
  deleteTemplate,
};

export default ctcTemplateApi;
