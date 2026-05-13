import { LayoutGrid, LayoutList, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import FilteringSidebar from "./FilteringSidebar";

interface Props {
  layout: "grid" | "list";
  setLayout: (v: "grid" | "list") => void;

  sort: string;
  setSort: (v: string) => void;

  totalProducts: number;
  page: number;

  onOpenFilter?: () => void;
}

export default function HeaderProduct({
  layout,
  setLayout,
  sort,
  setSort,
  totalProducts,
  page,
  onOpenFilter,
}: Props) {

  const [openSort, setOpenSort] = useState(false);

  return (
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

      <div className="text-xs text-gray-500 lg:text-sm">
        Menampilkan 1 - {Math.min(page * 20, totalProducts)} barang dari total{" "}
        {totalProducts}
      </div>

      <div className="flex items-center justify-between">

        {/* LEFT : FILTER */}
        {onOpenFilter && (
          <button
            onClick={onOpenFilter}
            className="
            flex items-center gap-2
            px-3 py-2
            text-xs
            border
            rounded-lg
            bg-white
            hover:bg-gray-50
            lg:hidden
            "
          >
            <SlidersHorizontal className="w-4 h-4 lg:w-[18px] lg:h-[18px]" />
            Filter
          </button>
        )}

        {/* RIGHT : SORT + LAYOUT */}
        <div className="flex items-center gap-2 lg:gap-3 ml-auto">

          {/* SORT */}
          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-gray-600 lg:block">
              Urutkan:
            </span>

            <div className="relative">
              <button
                onClick={() => setOpenSort(!openSort)}
                className="
                flex items-center justify-between
                w-36 lg:w-44
                px-4 py-2
                text-xs md:text-sm
                border
                rounded-lg
                bg-white
                hover:bg-gray-50
                "
              >
                <span>
                  {sort === "price_desc" && "Harga Tertinggi"}
                  {sort === "price_asc" && "Harga Terendah"}
                  {sort === "popular" && "Paling Populer"}
                  {(sort === "newest" || !sort) && "Terbaru"}
                </span>

                <span className="text-gray-400">▾</span>
              </button>

              {openSort && (
                <div className="
                absolute
                right-0
                top-full
                mt-1
                w-44
                bg-white
                border
                rounded-lg
                shadow-md
                overflow-hidden
                z-10
                ">
                  <div
                    onClick={() => { setSort("price_desc"); setOpenSort(false); }}
                    className="px-4 py-2 text-xs md:text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Harga Tertinggi
                  </div>

                  <div
                    onClick={() => { setSort("price_asc"); setOpenSort(false); }}
                    className="px-4 py-2 text-xs md:text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Harga Terendah
                  </div>

                  <div
                    onClick={() => { setSort("popular"); setOpenSort(false); }}
                    className="px-4 py-2 text-xs md:text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Paling Populer
                  </div>

                  <div
                    onClick={() => { setSort("newest"); setOpenSort(false); }}
                    className="px-4 py-2 text-xs md:text-sm hover:bg-gray-100 cursor-pointer"
                  >
                    Terbaru
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* LAYOUT BUTTON */}
          <button
            onClick={() => setLayout(layout === "grid" ? "list" : "grid")}
            className="p-2 border rounded-lg hover:bg-gray-100"
          >
            {layout === "grid"
              ? <LayoutList size={20} />
              : <LayoutGrid size={20} />
            }
          </button>

        </div>

      </div>
    </div>
  );
}