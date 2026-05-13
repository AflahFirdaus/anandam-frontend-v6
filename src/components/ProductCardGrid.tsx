import ProductCard from "./ProductCard";
import type { Product } from "../types/product";

interface Props {
  products: Product[];
  layout?: "grid" | "list";
  aos?: boolean;
}

export default function ProductCardGrid({
  products,
  layout = "grid",
  aos = false,
}: Props) {
  return (
    <div
      className={
        layout === "grid"
          ? "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
          : "flex flex-col gap-4"
      }
    >
      {products.map((product, index) => (
        <div
          key={product.id}
          {...(aos && {
            "data-aos": "fade-up",
            "data-aos-delay": index * 50,
          })}
        >
          <ProductCard
            product={product}
            layout={layout}
          />
        </div>
      ))}
    </div>
  );
}