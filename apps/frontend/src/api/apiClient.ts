import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { env } from '../config/env';
import { ApiResponse } from '@smartslot/shared';

export type { ApiResponse };

/**
 * Singleton API client with secure token handling.
 * 
 * Security features (per PROMPT_AUDIT):
 * - No localStorage token storage (XSS prevention)
 * - In-memory token only
 * - Automatic refresh on 401
 * - Fail-fast env config
 */

// In-memory token storage (NOT localStorage - per prompt_43)
let accessToken: string | null = null;

/** Set access token (called by AuthContext after login/refresh) */
export function setAccessToken(token: string | null): void {
    accessToken = token;
}

/** Get current access token (for debugging/testing only) */
export function getAccessToken(): string | null {
    return accessToken;
}

const apiClient = axios.create({
    baseURL: env.VITE_API_URL,  // No fallback - fail-fast
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,  // Required for HttpOnly cookie refresh
});

// Request interceptor - inject in-memory token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle 401 with refresh (per prompt_15)
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
    refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Only handle 401s that aren't from refresh endpoint itself
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh')
        ) {
            if (isRefreshing) {
                // Wait for ongoing refresh
                return new Promise((resolve) => {
                    subscribeTokenRefresh((token: string) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt silent refresh
                const { data } = await apiClient.post('/auth/refresh');

                // Backend returns user + accessToken in data.data (per our update)
                const newToken = data.data?.accessToken;

                if (newToken) {
                    setAccessToken(newToken);
                    onTokenRefreshed(newToken);

                    // Re-attach token to original request
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    return apiClient(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - redirect to login with expired flag
                accessToken = null;
                if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                    window.location.href = '/login?expired=true';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
