import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;

export const setTokens = (accessToken: string | null, refreshToken: string | null) => {
  currentAccessToken = accessToken;
  currentRefreshToken = refreshToken;
};

type LogoutCallback = () => void;
let onLogoutCallback: LogoutCallback | null = null;
export const setLogoutCallback = (cb: LogoutCallback) => {
  onLogoutCallback = cb;
};

type RefreshCallback = (accessToken: string, refreshToken: string) => void;
let onTokensRefreshedCallback: RefreshCallback | null = null;
export const setRefreshCallback = (cb: RefreshCallback) => {
  onTokensRefreshedCallback = cb;
};

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (currentAccessToken) {
      config.headers.Authorization = `Bearer ${currentAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (!currentRefreshToken) {
        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(error);
      }

      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
        const { data } = await axios.post(`${apiBaseUrl}/auth/refresh`, {
          refresh_token: currentRefreshToken,
        });

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token || currentRefreshToken;

        setTokens(newAccessToken, newRefreshToken);
        if (onTokensRefreshedCallback) {
          onTokensRefreshedCallback(newAccessToken, newRefreshToken);
        }

        api.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
        originalRequest.headers.Authorization = 'Bearer ' + newAccessToken;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (err) {
        processQueue(err as Error, null);
        setTokens(null, null);
        if (onLogoutCallback) onLogoutCallback();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
