import api from "./api";

const API_URL = `${import.meta.env.VITE_API_BASE}/api/v1/orders`;

const getAdminAuthHeader = () => {
  const token = localStorage.getItem("token"); 
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const getAllOrders = async (params?: any) => {
  const res = await api.get(`${API_URL}/admin/all`, { 
    params,
    headers: getAdminAuthHeader(),
  });
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: string) => {
  const res = await api.patch(`${API_URL}/${orderId}/status`, { status }, {
    headers: getAdminAuthHeader(),
  });
  return res.data;
};

export const getOrderDetail = async (orderId: string) => {
  const res = await api.get(`${API_URL}/${orderId}`, {
    headers: getAdminAuthHeader(),
  });
  return res.data;
};