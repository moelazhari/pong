import axios, { AxiosError } from 'axios';

const isServer = typeof window === 'undefined';

const baseURL = isServer
  ? process.env.BACKEND_URL || 'http://backend:8000' // Server environment e.g. middleware, API routes
  : process.env.NEXT_PUBLIC_BACKEND_HOST || 'http://localhost:8000'; 

const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

// if (!error.response) {
//       error.response = {
//         data: {
//           message: 'Server is down. Please try again later.',
//         },
//         status: 503,
//         statusText: 'Service Unavailable',
//         headers: {},
//         config: error.config,
//       };
//     }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(
        `${baseURL}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      processQueue(null);
      isRefreshing = false;

      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;

      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }

      return Promise.reject(refreshError);
    }
  }
);

export default axiosInstance;