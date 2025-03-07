import axios from 'axios';
import { getToken } from '../utils/authStorage';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // Replace with your backend URL
});

api.interceptors.request.use(async (config) => {
  // Endpoints that do not require authentication
  const unauthenticatedEndpoints = ['/users/register/', '/restaurants/register-owner/'];

  // Check if the current request is to an unauthenticated endpoint
  if (!unauthenticatedEndpoints.includes(config.url || '')) {
    const token = await getToken(); // Get the token from AsyncStorage
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`; // Add Authorization header
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error); // Handle request errors
});

export default api;
