import api from "./api";

const API_URL = `${import.meta.env.VITE_API_BASE}/api/v1/product-images`;

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const createProductImages = async (data: {
  product_id: string;
  image_urls: string[];
}) => {
  const res = await api.post(API_URL, data, {
    headers: getAuthHeader(),
  });

  return res.data;
};

export const updateProductImages = async (
  id: string,
  formData: FormData
) => {
  const res = await api.patch(
    `${API_URL}/${id}`,
    formData,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

export const deleteProductImage = async (id: string) => {
  const res = await api.delete(`/admin/products/image/${id}`, {
    headers: getAuthHeader(),
  });

  return res.data;
};

export const uploadProductImage = async (
  formData: FormData
) => {
  const res = await api.post(
    API_URL,
    formData,
    {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};