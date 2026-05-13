import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_BASE}/api/v1/categories`;

export const getCategories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createCategory = async (data: FormData) => {
  const res = await axios.post(API_URL, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateCategory = async (id: string, data: FormData) => {
  const res = await axios.patch(`${API_URL}/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const deleteCategory = async (id: string) => {
  await axios.delete(`${API_URL}/${id}`);
};