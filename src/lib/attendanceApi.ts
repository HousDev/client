import { api } from "./Api";

// Convert base64 to File with error handling
export function dataURLtoFile(dataurl: string, filename: string): File {
  // Check if dataurl is valid
  if (!dataurl || typeof dataurl !== 'string') {
    throw new Error('Invalid data URL');
  }

  // Check if it's a valid data URL format
  if (!dataurl.includes(',')) {
    throw new Error('Invalid data URL format');
  }

  const arr = dataurl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  
  if (!mimeMatch) {
    throw new Error('Invalid MIME type in data URL');
  }

  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new File([u8arr], filename, { type: mime });
}

const attendanceApi = {
  // Punch In with error handling
  async punchIn(data: {
    user_id: number;
    latitude: number;
    longitude: number;
    work_type?: 'office' | 'wfh' | 'client_site' | 'field_work';
    project_id?: number;
    project_location?: string;
    selfie: string; // base64 string
  }) {
    try {
      const formData = new FormData();
      
      // Add data fields
      formData.append('user_id', data.user_id.toString());
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      formData.append('work_type', data.work_type || 'office');
      
      if (data.project_id) {
        formData.append('project_id', data.project_id.toString());
      }
      
      if (data.project_location) {
        formData.append('project_location', data.project_location);
      }
      
      // Convert base64 to File and append
      const selfieFile = dataURLtoFile(data.selfie, 'selfie.jpg');
      formData.append('selfie', selfieFile);

      const response = await api.post('/attendance/punch-in', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error: any) {
      console.error('Punch In API error:', error);
      throw error;
    }
  },

  // Punch Out with error handling
  async punchOut(data: {
    user_id: number;
    latitude: number;
    longitude: number;
    selfie: string; // base64 string
  }) {
    try {
      const formData = new FormData();
      
      formData.append('user_id', data.user_id.toString());
      formData.append('latitude', data.latitude.toString());
      formData.append('longitude', data.longitude.toString());
      
      const selfieFile = dataURLtoFile(data.selfie, 'selfie.jpg');
      formData.append('selfie', selfieFile);

      const response = await api.post('/attendance/punch-out', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error: any) {
      console.error('Punch Out API error:', error);
      throw error;
    }
  },

  // Get today's status
  async getTodayStatus(user_id: number) {
    try {
      const response = await api.get(`/attendance/today/${user_id}`);
      return response;
    } catch (error: any) {
      console.error('Get Today Status API error:', error);
      throw error;
    }
  },

  // Get history
  async getHistory(
    user_id: number,
    params?: {
      start_date?: string;
      end_date?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const response = await api.get(`/attendance/history/${user_id}`, { params });
      return response;
    } catch (error: any) {
      console.error('Get History API error:', error);
      throw error;
    }
  },

  // Get all attendance for today (simplified)
  async getAllToday() {
    try {
      // Using statistics as a fallback
      const response = await api.get('/attendance/statistics');
      return {
        success: true,
        data: [], // Empty array for now
        statistics: response.data
      };
    } catch (error: any) {
      console.error('Get All Today API error:', error);a
      // Return mock data for testing
      return {
        success: true,
        data: [],
        message: 'Using mock data for testing'
      };
    }
  },

  async getAllTodayAttendence() {
    try {
      // Using statistics as a fallback
      const response = await api.get('/attendance/today');
      return response.data
    } catch (error: any) {
      console.error('Get All Today API error:', error);
      // Return mock data for testing
      return {
        success: true,
        data: [],
        message: 'Using mock data for testing'
      };
    }
  },

  // Check attendance
  async checkAttendance(user_id: number) {
    try {
      const response = await api.get(`/attendance/check/${user_id}`);
      return response;
    } catch (error: any) {
      console.error('Check Attendance API error:', error);
      throw error;
    }
  },

  // Get statistics
  async getStatistics(params?: {
    start_date?: string;
    end_date?: string;
  }) {
    try {
      const response = await api.get('/attendance/statistics', { params });
      return response;
    } catch (error: any) {
      console.error('Get Statistics API error:', error);
      // Return mock data for testing
      return {
        success: true,
        data: {
          total_employees: 0,
          present_today: 0,
          currently_present: 0,
          avg_working_hours: 0
        }
      };
    }
  }
};

export default attendanceApi;