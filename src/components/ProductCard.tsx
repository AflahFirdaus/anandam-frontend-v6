import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa6";
import type { Product } from "../types/product";
import { slugify } from "../utils/slugify";

interface Props {
  product: Product;
  layout?: "grid" | "list";
  from?: "landing" | "katalog" | "categories";
  category?: string;
}

const WHATSAPP_NUMBER = "6281228134747";

const ProductCard: React.FC<Props> = ({
  product,
  layout = "grid",
  from,
  category
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  // 🔥 LOGIC BARU: Ambil data dari variant pertama (index 0)
  const variant = product.variants?.[0] || {};
  
  // Gunakan data dari variant, jika tidak ada baru fallback ke data root (untuk compatibility data lama)
  const stock = Number(variant.stock ?? product.stock ?? 0);
  const normal = Number(variant.price_normal ?? product.price_normal ?? 0);
  const discountValue = Number(variant.price_discount ?? product.price_discount ?? 0);
  const skuSeller = variant.sku_seller ?? product.sku_seller;

  const isOutOfStock = stock === 0;
  const hasDiscount = discountValue > 0;

  const productSlug = `${slugify(product.name)}--${product.id}`;
  const productLink = `${window.location.origin}/products/${productSlug}`;
  const message = `Hai, saya ingin bertanya mengenai produk berikut:\n\nNama Produk: ${product.name}\nLink Produk: ${productLink}\n\nTerima kasih.`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const discountPercent = hasDiscount
    ? ((discountValue / normal) * 100).toFixed(0) 
    : "0";

  const finalPrice = hasDiscount ? normal - discountValue : normal;

  const thumb = product.images?.[0]?.thumbnail_url;
  const original = product.images?.[0]?.image_url;

  const imagePath =
    thumb?.startsWith("/uploads")
      ? thumb
      : original?.startsWith("/uploads")
      ? original
      : null;

  const imageSrc = imagePath
    ? imagePath.startsWith("http")
      ? imagePath
      : `${import.meta.env.VITE_API_BASE}${imagePath}`
    : "/icon-anandam.svg";

  const metaItems: {
    label: string;
    onClick: () => void;
  }[] = [];

  if (product.brand?.id && product.brand?.name) {
    metaItems.push({
      label: product.brand.name,
      onClick: () => navigate(`/products?brand=${product.brand!.id}`),
    });
  }

  if (product.category?.grouping?.name) {
    metaItems.push({
      label: product.category.grouping.name,
      onClick: () =>
        navigate(`/product-grouping?grouping=${encodeURIComponent(product.category!.grouping!.name)}`),
    });
  }

  if (product.category?.name) {
    metaItems.push({
      label: product.category.name,
      onClick: () =>
        navigate(`/product-categories?category=${encodeURIComponent(product.category!.name)}`),
    });
  }

  return (
    <div
      onClick={() =>
        navigate(`/products/${productSlug}`, {
          state: { from, category: product.category?.name },
        })
      }
      className={`
        relative
        rounded-lg
        bg-white
        border border-gray-200
        cursor-pointer
        transition-all duration-300
        hover:shadow-md
        ${layout === "grid" ? "flex flex-col" : "flex flex-row gap-4 p-3 items-start"}
      `}
    >
      {/* IMAGE CONTAINER */}
      <div
        className={`
          relative overflow-hidden bg-white
          ${layout === "grid" ? "w-full aspect-square rounded-t-lg" : "w-24 h-24 md:w-28 md:h-28 rounded-lg flex-shrink-0"}
        `}
      >
        {hasDiscount && !isOutOfStock && (
          <div className="absolute top-2 right-2 z-10 bg-red-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-1 rounded-md shadow-sm tracking-wider uppercase">
            {discountPercent}% OFF
          </div>
        )}

        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-gray-200" />}
        <img
          src={imageSrc}
          alt={product.name}
          onLoad={() => setImageLoaded(true)}
          draggable={false}
          className={`
            w-full h-full object-cover
            transition-all duration-300 ease-in-out
            ${imageLoaded ? "opacity-100" : "opacity-0"}
            ${!isOutOfStock ? "hover:scale-110" : ""}
            ${isOutOfStock ? "opacity-40 grayscale" : ""}
          `}
          onError={(e) => {
            const filename = product.images?.[0]?.thumbnail_url?.split("/").pop();
            if (filename && !e.currentTarget.src.includes("original")) {
              e.currentTarget.src = `${import.meta.env.VITE_API_BASE}/uploads/products/original/${filename}`;
              return;
            }
            e.currentTarget.src = "/icon-anandam.svg";
            setImageLoaded(true);
          }}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-gray-500/40 flex items-center justify-center">
             <span className="bg-black/60 text-white text-[10px] px-2 py-1 rounded">Habis</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        className={`
          flex
          ${layout === "grid" ? "flex-col justify-between p-2 sm:p-3 flex-1" : "flex flex-col flex-1 justify-between"}
        `}
      >
        <div className="flex flex-col gap-1 flex-1">
          <div className="text-[11px] text-gray-500 leading-tight flex items-center overflow-hidden whitespace-nowrap">
            {metaItems.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span className="mx-1 text-gray-400 flex-shrink-0">|</span>}
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onClick();
                  }}
                  className={`hover:text-primary cursor-pointer transition ${index === metaItems.length - 1 ? "truncate min-w-0 flex-1" : "flex-shrink-0"}`}
                >
                  {item.label}
                </span>
              </React.Fragment>
            ))}
          </div>

          <h3
            className={`font-semibold leading-snug hover:text-primary mb-1 ${
              layout === "grid"
                ? "text-[12px] sm:text-xs md:text-sm line-clamp-2 min-h-[32px] sm:min-h-[35px]"
                : "text-[14px] md:text-lg line-clamp-2"
            }`}
          >
            {product.name}
          </h3>

          {layout === "list" && skuSeller && (
            <span className="text-sm text-gray-500">{skuSeller}</span>
          )}
        </div>

        {/* PRICE WRAPPER */}
        <div className={layout === "grid" ? "mt-auto pt-1 flex items-end justify-between" : "flex items-center justify-between mt-2"}>
          <div className="flex flex-col">
            {hasDiscount ? (
              <div className="flex items-center gap-2 h-[18px]">
                <span className="text-[11px] md:text-xs text-gray-400 line-through">
                  Rp {normal.toLocaleString()}
                </span>
              </div>
            ) : layout === "grid" ? (
              <div className="h-[18px]" />
            ) : null}

            <p className={`font-bold text-primary ${layout === "grid" ? "text-[14px] sm:text-base md:text-lg" : "text-sm md:text-base"}`}>
              Rp {finalPrice.toLocaleString()}
            </p>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-green-500 hover:bg-green-600 text-white p-[6px] sm:p-2 rounded-md transition flex items-center justify-center shadow-sm"
          >
            <FaWhatsapp className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;