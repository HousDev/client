import { api } from "./Api";

export interface SecuritySettings {
  id?: number;
  auto_punchout_enabled: boolean;
  auto_punchout_radius_km: number;
  auto_punchout_delay_minutes: number;
  geolocation_tracking_enabled: boolean;
  require_selfie_on_punch: boolean;
  location_validation_enabled: boolean;
  punch_in_radius_meters: number;
  punch_out_radius_meters: number;
  allow_remote_punch: boolean;
  max_punch_distance_meters: number;
  enable_face_recognition: boolean;
  require_live_selfie: boolean;
  max_punch_in_time: string;
  min_punch_out_time: string;
  allow_weekend_punch: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PunchValidationRequest {
  employee_id: number;
  latitude: number;
  longitude: number;
  punch_type?: 'punch_in' | 'punch_out';
  office_location_id?: number;
}

export interface PunchValidationResponse {
  valid: boolean;
  distance: number;
  required_radius: number;
  office_location: {
    latitude: number;
    longitude: number;
  };
  message: string;
}

const securityApi = {
  // Get security settings
  async getSecuritySettings(): Promise<SecuritySettings> {
    try {
      const response = await api.get("/security-settings");
      return response.data;
    } catch (error) {
      console.error("Error fetching security settings:", error);
      throw error;
    }
  },

  // Update security settings
  async updateSecuritySettings(data: Partial<SecuritySettings>): Promise<{success: boolean; message: string; data: SecuritySettings}> {
    try {
      const response = await api.put("/security-settings", data);
      return response.data;
    } catch (error) {
      console.error("Error updating security settings:", error);
      throw error;
    }
  },

  // Reset security settings to defaults
  async resetSecuritySettings(): Promise<{success: boolean; message: string; data: SecuritySettings}> {
    try {
      const response = await api.post("/security-settings/reset");
      return response.data;
    } catch (error) {
      console.error("Error resetting security settings:", error);
      throw error;
    }
  },

  // Validate punch location
  async validatePunchLocation(data: PunchValidationRequest): Promise<PunchValidationResponse> {
    try {
      const response = await api.post("/security-settings/validate-punch", data);
      return response.data;
    } catch (error) {
      console.error("Error validating punch location:", error);
      throw error;
    }
  },

  // Get punch radius settings for display
  async getPunchRadiusSettings(): Promise<{
    punch_in_radius_meters: number;
    punch_out_radius_meters: number;
    max_punch_distance_meters: number;
  }> {
    try {
      const settings = await this.getSecuritySettings();
      return {
        punch_in_radius_meters: settings.punch_in_radius_meters,
        punch_out_radius_meters: settings.punch_out_radius_meters,
        max_punch_distance_meters: settings.max_punch_distance_meters
      };
    } catch (error) {
      console.error("Error getting punch radius settings:", error);
      throw error;
    }
  }
};

export default securityApi;