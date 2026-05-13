import userApi from "./userApi"; 

const ORDER_PATH = "/orders";

// Checkout dari keranjang (banyak barang)
export const checkoutFromCart = async (cartIds: string[], notes?: string) => {
  const res = await userApi.post(`${ORDER_PATH}/checkout/cart`, {
    cart_ids: cartIds,
    notes,
  });
  return res.data;
};

// Beli langsung dari halaman detail produk (1 barang)
export const checkoutDirect = async (data: {
  product_id: string;
  quantity: number;
  variasi?: string;
  notes?: string;
}) => {
  const res = await userApi.post(`${ORDER_PATH}/checkout/direct`, data);
  return res.data;
};

export const getUserOrders = async () => {
  const response = await userApi.get("/orders/my-orders");
  return response.data;
};

export const checkoutPCBuilder = async (data: {
  items: { product_id: string; quantity: number }[];
  notes?: string;
}) => {
  const res = await userApi.post(`${ORDER_PATH}/checkout/builder`, data);
  return res.data;
};