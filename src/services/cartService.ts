import userApi from "./userApi";

const CART_PATH = "/cart"; 

export const getMyCart = async () => {
  const res = await userApi.get(CART_PATH);
  return res.data;
};

export const addToCart = async (data: {
  product_id: string;
  quantity: number;
  variasi?: string;
}) => {
  const res = await userApi.post(`${CART_PATH}/add`, data);
  return res.data;
};

export const updateCartQuantity = async (id: string, quantity: number) => {
  const res = await userApi.put(`${CART_PATH}/update/${id}`, { quantity });
  return res.data;
};

export const removeFromCart = async (id: string) => {
  const res = await userApi.delete(`${CART_PATH}/remove/${id}`);
  return res.data;
};

export const clearCart = async () => {
  const res = await userApi.delete(`${CART_PATH}/clear`);
  return res.data;
};