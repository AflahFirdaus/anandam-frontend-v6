// services/adminProductService.ts
import api from "./api";

const API_URL = `${import.meta.env.VITE_API_BASE}/api/v1/admin/products`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAdminProducts = async (params?: any) => {
  const res = await api.get(API_URL, {
    params,
    headers: getAuthHeader(),
  });
  return res.data;
};

export const createAdminProduct = async (data: any) => {
  const res = await api.post(API_URL, data, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const updateAdminProduct = async (id: string, data: any) => {
  const res = await api.put(`${API_URL}/${id}`, data, {
    headers: getAuthHeader(),
  });
  return res.data;
};

export const deleteAdminProduct = async (id: string) => {
  await api.delete(`${API_URL}/${id}`, {
    headers: getAuthHeader(),
  });
};

export const getAdminProductById = async (id: string) => {
  const res = await api.get(`/admin/products/${id}`);
  return res.data;
};

export const getTopViewedProducts = async (
  period: 'today' | 'week' | 'month' | 'custom' = 'week',
  options?: { from?: string; to?: string; limit?: number }
) => {
  const params = new URLSearchParams({ period });
  if (options?.limit) params.set('limit', String(options.limit));
  if (period === 'custom' && options?.from) params.set('from', options.from);
  if (period === 'custom' && options?.to) params.set('to', options.to);

  const res = await api.get(`/admin/products/analytics/top-viewed?${params}`);
  return res.data;
};

export const getProductStats = async (id: string) => {
  const res = await api.get(`/admin/products/analytics/${id}/stats`);
  return res.data;
};