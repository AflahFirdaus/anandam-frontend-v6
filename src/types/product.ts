import type { Category } from "./category";

export interface ProductVariant {
  id: string;
  variant_name: string;
  price_normal: number;
  price_discount: number;
  stock: number;
  sku_seller: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  thumbnail_url: string;
  variant_id?: string | null; 
}

export interface Product {
  id: string;
  product_id: string;
  sku_id: string | null;
  name: string;
  description: string | null;
  brand_id: string | null;

  price_normal: number;
  price_discount: number | null;
  final_price: number;
  stock: number;
  sku_seller: string | null;

  warranty: string | null;
  url_tiktok: string | null;
  url_tokped: string | null;

  is_active: boolean;
  is_popular: boolean;

  created_at: string;
  updated_at: string;

  category: Category;
  grouping?: {
    id: string;
    name: string;
  };
  images: ProductImage[];
  thumbnail_url: string;

  specifications: string[];
  
  variant_type_name?: string | null; 
  variants: ProductVariant[]; 
  
  brand: {
    id: string;
    name: string;
    image_url?: string;
    created_at?: string;
    updated_at?: string;
  } | null;

  socket_type?: string | null;
  ram_type?: string | null;
}