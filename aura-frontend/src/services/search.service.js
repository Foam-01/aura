import axios from 'axios';
import config from '../constants/config'; 

const apiClient = axios.create({
  baseURL: config.apiPath, 
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token');
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => Promise.reject(error)
);

export const searchUserAcrossSystems = async (keyword) => {
  try {
    const response = await apiClient.get('/api/user/search', {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error('🔥 Frontend API Error:', error.response?.data || error.message);
    throw error;
  }
};

export const getAuditLogs = async () => {
  try {
    const response = await apiClient.get('/api/audit-logs');
    return response.data;
  } catch (error) {
    console.error('🔥 Fetch Audit Logs Error:', error.message);
    throw error;
  }
};