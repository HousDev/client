// lib/api/integrationsApi.ts
import { api, unwrap } from "./Api";

/**
 * Get all integrations
 */
async function getIntegrations() {
  const res = await api.get("/integrations");
  return unwrap(res);
}

/**
 * Get integration by type
 */
async function getIntegrationByType(type: 'smtp' | 'sms' | 'whatsapp') {
  const res = await api.get(`/integrations/${type}`);
  return unwrap(res);
}

/**
 * Save/Update integration configuration
 */
async function saveIntegration(payload: {
  type: 'smtp' | 'sms' | 'whatsapp';
  enabled: boolean;
  config: any;
}) {
  const res = await api.post("/integrations", payload);
  return unwrap(res);
}

/**
 * Toggle integration ON/OFF
 */
async function toggleIntegration(type: 'smtp' | 'sms' | 'whatsapp', enabled: boolean) {
  const res = await api.patch(`/integrations/${type}/toggle`, { enabled });
  return unwrap(res);
}

/**
 * Delete integration
 */
async function deleteIntegration(type: 'smtp' | 'sms' | 'whatsapp') {
  const res = await api.delete(`/integrations/${type}`);
  return unwrap(res);
}

const integrationsApi = {
  getIntegrations,
  getIntegrationByType,
  saveIntegration,
  toggleIntegration,
  deleteIntegration,
};

export default integrationsApi;