import api from "./api";

const BASE = "/brands";

// GET ALL
export const getBrands = async () => {
  const res = await api.get(BASE);
  return res.data;
};

export const getActiveBrands = async () => {
  const res = await api.get(`${BASE}?is_active=true`);
  return res.data;
};

// GET BY ID
export const getBrandById = async (id: string) => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
};

// CREATE
export const createBrand = async (data: {
  name: string;
  image?: File | null;
  product_ids?: string[]; 
}) => {
  const formData = new FormData();

  formData.append("name", data.name);

  if (data.image) {
    formData.append("image", data.image);
  }

  if (data.product_ids) {
    data.product_ids.forEach((id) => {
      formData.append("product_ids[]", id);
    });
  }

  return api.post(BASE, formData);
};

// UPDATE
export const updateBrand = async (
  id: string,
  data: {
    name?: string;
    image?: File | null;
  is_active?: boolean;
  }
) => {
  const formData = new FormData();

  if (data.name) formData.append("name", data.name);
  if (data.image) formData.append("image", data.image);

  if (data.is_active !== undefined) {
    formData.append("is_active", String(data.is_active)); 
  }

  return api.put(`${BASE}/${id}`, formData);
};

// DELETE
export const deleteBrand = async (id: string) => {
  return api.delete(`${BASE}/${id}`);
};