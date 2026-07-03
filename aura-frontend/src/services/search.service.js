import axios from 'axios';
import config from '../constants/config';
import { getAuthHeaders } from '../features/auth/auth.service';

const apiClient = axios.create({
  //baseURL: config.apiPath,
  baseURL: 'http://172.19.111.45:3000',
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (req) => {
    const authHeaders = getAuthHeaders();
    req.headers = { ...req.headers, ...authHeaders };
    return req;
  },
  (error) => Promise.reject(error),
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