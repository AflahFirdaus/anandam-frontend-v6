import api from "./api";

// assign banyak product ke brand
export const assignProductsToBrand = async (
  brandId: string,
  product_ids: string[]
) => {
  return api.patch(`/brands/${brandId}/assign-products`, {
    product_ids,
  });
};

// remove brand dari product
export const removeProductFromBrand = async (productId: string) => {
  return api.patch(`/admin/products/${productId}/remove-brand`);
};