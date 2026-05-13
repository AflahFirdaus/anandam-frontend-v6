import { useEffect, useState } from "react";
import { getActiveBrands } from "../services/brandService";
import { useNavigate } from "react-router-dom";

const getInitial = (brand: string) => {
  return brand
    .split(" ")
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export function OfficialBrandSection() {
  const navigate = useNavigate(); 
  const [brands, setBrands] = useState<any[]>([]);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await getActiveBrands(); 
        setBrands(data);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };

    fetchBrands();
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="w-full bg-white mt-4 py-6 border-y border-gray-200">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-0">
        
        {/* HEADER */}
        <div className="mb-8">
            <div className="inline-block border-l-4 border-primary pl-4 py-1">
            <h2 className="text-2xl md:text-3xl font-bold text-black">
              Official Brand
            </h2>
          </div>
        </div>

        {/* GRID CONTAINER */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {brands.map((brand) => {
            const imagePath = brand.image_url;
            const hasError = imageError[brand.id];

            return (
              <div
                key={brand.id}
                onClick={() => navigate(`/product-katalog?brand=${brand.id}`)}
                className="
                  brand-card h-[80px] sm:h-[100px] lg:h-[110px] flex items-center justify-center 
                  bg-white transition-all duration-300
                  cursor-pointer select-none p-2 group
                "
              >
                {imagePath && !hasError ? (
                  <img
                    src={
                      imagePath.startsWith("http")
                        ? imagePath
                        : `${import.meta.env.VITE_API_BASE}${imagePath}`
                    }
                    alt={brand.name}
                    draggable={false}
                    // Ukuran gambar disesuaikan sedikit agar pas untuk 8 kolom
                    className="h-10 sm:h-14 lg:h-16 max-w-[85%] object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={() =>
                      setImageError(prev => ({
                        ...prev,
                        [brand.id]: true
                      }))
                    }
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-700 group-hover:scale-110 transition-transform duration-300">
                    <div className="text-sm md:text-lg font-bold">
                      {getInitial(brand.name)}
                    </div>
                    <div className="text-[9px] md:text-[10px] opacity-70 text-center px-1 line-clamp-1 max-w-full">
                      {brand.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}