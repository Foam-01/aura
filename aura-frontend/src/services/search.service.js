import axios from 'axios';
import config from '../constants/config'; 

const apiClient = axios.create({
  baseURL: config.apiPath, 
  timeout: 10000,
});

export const searchUserAcrossSystems = async (keyword) => {
  try {
    const response = await apiClient.get('/search/test', {
      params: { keyword },
      
    });
    return response.data;
  } catch (error) {
    console.error('🔥 Frontend API Error:', error.message);
    throw error;
  }
};