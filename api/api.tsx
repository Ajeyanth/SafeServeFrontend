import axios from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  removeTokens,
} from '../utils/authStorage';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Use your actual dev server URL
});

/**
 * REQUEST INTERCEPTOR:
 * - Skips token for certain unauthenticated endpoints or GET /api/restaurants/*
 * - Otherwise attaches the access token from storage
 */
api.interceptors.request.use(
  async (config) => {
    // Hard-coded endpoints that do NOT need an access token
    const unauthenticatedEndpoints = [
      '/api/users/register/',
      '/api/restaurants/register-owner/',
      '/api/users/token/',       // <--- login
      '/api/users/token/refresh/' // <--- refresh
    ];

    const isExplicitlyUnauthenticated =
      unauthenticatedEndpoints.includes(config.url || '');

    // e.g. for read-only /api/restaurants/* calls
    const isPublicRestaurantGet =
      config.method?.toLowerCase() === 'get' &&
      config.url?.startsWith('/api/restaurants/');

    // If not an unauthenticated or public GET, attach access token
    if (!isExplicitlyUnauthenticated && !isPublicRestaurantGet) {
      const token = await getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * RESPONSE INTERCEPTOR:
 * - If a request fails with 401 and we haven't retried yet, attempt refresh
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we get a 401 unauthorized, and _retry is not set
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh
        const refresh = await getRefreshToken();
        if (!refresh) {
          throw new Error('No refresh token available');
        }

        // Call the refresh endpoint directly (full URL if needed)
        const refreshResponse = await axios.post(
          'http://127.0.0.1:8000/api/users/token/refresh/',
          { refresh }
        );

        // Store new tokens
        const { access, refresh: newRefresh } = refreshResponse.data;
        await storeTokens(access, newRefresh || refresh);

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, remove tokens and optionally redirect to login
        await removeTokens();
        // e.g. navigation.replace('Login'); if you have a global nav reference
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
