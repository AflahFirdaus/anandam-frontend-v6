import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../../services/adminCategoryService";
import Breadcrumb from "../../components/Breadcrumb";

export default function CategoriesDetailPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error("Gagal fetch kategori", err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE}${url}`;
  };

  const filteredCategories = categories.filter((cat) => cat.parent_id !== null);

  return (
    <>
      {/* ================= BREADCRUMB ================= */}
      <div className="w-full bg-white">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-3">

          <Breadcrumb
            items={[
              { label: "Home", path: "/" },
              { label: "Kategori" },
            ]}
          />

        </div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-8 lg:py-10">

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
          Semua Kategori
        </h1>

        {/* CATEGORY GRID */}
        <div
          className="
          grid
          grid-cols-2
          sm:grid-cols-3
          md:grid-cols-4
          lg:grid-cols-6
          gap-4
        "
        >
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center p-4"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl shimmer mb-3"></div>
                  <div className="w-16 h-3 rounded shimmer"></div>
                </div>
              ))

            : filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    const groupingName = cat.parent?.name || "Komponen Komputer"; 
                    navigate(`/product-categories?grouping=${groupingName}&category_ids=${cat.id}`);
                  }}
                  className="
                  flex flex-col items-center
                  p-3 md:p-5
                  cursor-pointer
                  transition
                  group
                  rounded-xl
                  hover:bg-gray-50
                  "
                >

                  {/* ICON */}
                  <div
                    className="
                    w-16 h-16
                    md:w-20 md:h-20
                    rounded-xl
                    overflow-hidden
                    bg-gray-100
                    flex items-center justify-center
                    mb-3
                  "
                  >
                    {cat.image_url ? (
                      <img
                        src={getImageUrl(cat.image_url)}
                        alt={cat.name}
                        className="
                        w-full h-full object-cover
                        transition-transform
                        duration-300
                        group-hover:scale-110
                        "
                      />
                    ) : (
                      <span className="text-lg md:text-xl font-semibold text-gray-500">
                        {cat.name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* NAME */}
                  <span
                    className="
                    text-xs md:text-sm
                    font-medium
                    text-gray-800
                    text-center
                    group-hover:text-primary
                    leading-tight
                    line-clamp-2
                  "
                  >
                    {cat.name}
                  </span>

                </div>
              ))}
        </div>

      </div>
    </>
  );
}