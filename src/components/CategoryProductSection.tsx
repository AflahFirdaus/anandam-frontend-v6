import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";

export default function CategoryProductSection({
  title,
  titleClass,
  products,
  loading,
  categorySlug,
}: {
  title?: string
  titleClass?: string
  products?: any[]
  loading?: boolean
  categorySlug?: string
}) {

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const firstCard = container.querySelector(".product-item") as HTMLElement;
    if (!firstCard) return;

    const gap = 16;
    const cardWidth = firstCard.offsetWidth + gap;

    container.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const navigate = useNavigate();

  return (
      <section
        className="
        w-full
        py-6 md:py-10
        bg-white
        border-y border-gray-200
        mt-4
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">

          <div className="flex items-center justify-between mb-4">

            {/* TITLE */}
            {title && (
              <h2
                className={`
                text-xl md:text-3xl lg:text-4xl
                font-semibold font-cocogoose
                bg-gray-800 bg-clip-text text-transparent
                ${titleClass || ""}
                `}
              >
                {title}
              </h2>
            )}

            {categorySlug && (
              <button
                onClick={() => navigate(`/parent-categories/${categorySlug}`)}
                className="flex items-center text-sm sm:text-base md:text-lg font-semibold text-blue-700 hover:text-blue-900 transition group"
              >
                Lihat Semua
                <ChevronRight
                  size={18}
                  className="ml-1 transition-transform group-hover:translate-x-1"
                />
              </button>
            )}

          </div>

          <div className="relative">

            {/* BUTTON LEFT */}
            <button
              onClick={() => scroll("left")}
              className="
              hidden md:flex
              absolute -left-5
              top-[45%]
              -translate-y-1/2
              z-[100]
              p-2 md:p-3
              bg-white/90 backdrop-blur
              shadow-lg rounded-full
              hover:bg-white transition
              "
            >
              <ChevronLeft size={20} />
            </button>

            {/* BUTTON RIGHT */}
            <button
              onClick={() => scroll("right")}
              className="
              hidden md:flex
              absolute -right-5
              top-[45%]
              -translate-y-1/2
              z-[100]
              p-2 md:p-3
              bg-white/90 backdrop-blur
              shadow-lg rounded-full
              hover:bg-white transition
              "
            >
              <ChevronRight size={20} />
            </button>

            <div
              ref={scrollRef}
              className="
              flex gap-6
              overflow-x-auto scrollbar-hide
              scroll-smooth snap-x snap-mandatory
              py-4
              pl-2 md:pl-0
              "
            >
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="
                      product-item
                      flex-shrink-0
                      snap-start

                      w-[150px]
                      sm:w-[180px]
                      md:w-[210px]
                      lg:w-[230px]
                      xl:w-[233px]
                      "
                    >
                      <ProductCardSkeleton />
                    </div>
                  ))
                : products?.map((product) => (
                    <div
                      key={product.id}
                      className="
                      product-item
                      flex-shrink-0
                      snap-start

                      w-[47%]
                      sm:w-[180px]
                      md:w-[210px]
                      lg:w-[230px]
                      xl:w-[236px]
                      "
                    >
                      <ProductCard product={product} />
                    </div>
                  ))}
            </div>
          </div>

        </div>
    </section>
  );
}