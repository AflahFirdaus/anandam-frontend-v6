// services/productService.ts
import api from "./api";

const API_URL = `${import.meta.env.VITE_API_BASE}/api/v1/products`;

export const getProducts = async (params?: any) => {
  const res = await api.get(API_URL, { params });
  return res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`${API_URL}/${id}`);
  return res.data;
};

export const getProductsByCategory = async (categoryName: string) => {
  const response = await api.get("/products", {
    params: {
      category: categoryName,
      is_active: true,  
      limit: 30,         
    },
  });

  return response.data.data; 
};

export const getProductRecommendations = async (id: string) => {
  const res = await api.get(
    `${import.meta.env.VITE_API_BASE}/api/v1/products/${id}/recommendations`
  );
  return res.data;
};

export const getCompatibility = async (params?: {
  processor_id?: string;
  motherboard_id?: string;
  ram_id?: string;
}) => {
  const res = await api.get(
    `${import.meta.env.VITE_API_BASE}/api/v1/products/compatibility`,
    { params }
  );
  return res.data;
};