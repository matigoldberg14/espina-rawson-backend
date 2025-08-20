import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    } else if (error.response?.data?.error?.message) {
      toast.error(error.response.data.error.message);
    } else if (error.message) {
      toast.error(error.message);
    } else {
      toast.error('Error inesperado. Por favor, intente nuevamente.');
    }
    return Promise.reject(error);
  }
);

// API Services
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  logout: () => api.post('/auth/logout'),

  me: () => api.get('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

export const contentService = {
  getAll: () => api.get('/content'),

  getBySection: (section: string) => api.get(`/content/section/${section}`),

  getById: (id: string) => api.get(`/content/${id}`),

  create: (data: any) => api.post('/content', data),

  update: (id: string, data: any) => api.put(`/content/${id}`, data),

  delete: (id: string) => api.delete(`/content/${id}`),

  bulkUpdate: (contents: any[]) =>
    api.post('/content/bulk-update', { contents }),
};

export const auctionService = {
  getAll: (params?: any) => api.get('/auctions', { params }),

  getFeatured: () => api.get('/auctions/featured'),

  getById: (id: string) => api.get(`/auctions/${id}`),

  create: (data: any) => api.post('/auctions', data),

  update: (id: string, data: any) => api.put(`/auctions/${id}`, data),

  delete: (id: string) => api.delete(`/auctions/${id}`),

  uploadImages: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    return api.post(`/auctions/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (auctionId: string, imageId: string) =>
    api.delete(`/auctions/${auctionId}/images/${imageId}`),

  setPrimaryImage: (auctionId: string, imageId: string) =>
    api.put(`/auctions/${auctionId}/images/${imageId}/primary`),

  updateFeatured: (auctionIds: string[]) =>
    api.put('/auctions/featured/update', { auctionIds }),

  updateStatus: (id: string, status: string) =>
    api.put(`/auctions/${id}/status`, { status }),
};

export const practiceAreaService = {
  getAll: () => api.get('/practice-areas'),

  getById: (id: string) => api.get(`/practice-areas/${id}`),

  create: (data: any) => api.post('/practice-areas', data),

  update: (id: string, data: any) => api.put(`/practice-areas/${id}`, data),

  delete: (id: string) => api.delete(`/practice-areas/${id}`),

  reorder: (areas: { id: string }[]) =>
    api.post('/practice-areas/reorder', { areas }),
};

export const settingsService = {
  getAll: () => api.get('/settings'),

  getByKey: (key: string) => api.get(`/settings/${key}`),

  update: (key: string, value: any, description?: string) =>
    api.put(`/settings/${key}`, { value, description }),

  bulkUpdate: (settings: any[]) =>
    api.post('/settings/bulk-update', { settings }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),

  getRecentActivity: () => api.get('/dashboard/activity'),

  getUpcomingAuctions: () => api.get('/dashboard/auctions/upcoming'),
};
