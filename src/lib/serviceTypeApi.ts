// src/lib/serviceTypeApi.ts
import { api, unwrap } from './Api';

export async function getAll(activeOnly = true) {
  const q = activeOnly ? '?active=1' : '';
  const res = await api.get(`/service-types${q}`);
  return unwrap(res);
}
export async function create(payload: any) { const r = await api.post('/service-types', payload); return unwrap(r); }
export async function update(id: any, payload: any) { const r = await api.put(`/service-types/${id}`, payload); return unwrap(r); }
export async function remove(id: any) { const r = await api.delete(`/service-types/${id}`); return unwrap(r); }

export default { getAll, create, update, remove };
