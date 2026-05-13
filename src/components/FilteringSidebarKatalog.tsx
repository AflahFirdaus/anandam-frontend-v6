import { useState, useEffect } from "react";
import type { Category } from "../types/category";
import { Search, ChevronDown, ChevronRight, Check } from "lucide-react";
import { getBrands } from "../services/brandService";

export interface Grouping {
  id: string;
  name: string;
  children?: Category[];
}

interface Props {
  groupings?: Grouping[];
  categories?: Category[]; // 🔥 Tambahan untuk ngecek nama kategori
  groupingParam?: string | null;
  categoryParam?: string | null;
  categoryIdsParam?: string | null; 

  searchCategory: string;
  setSearchCategory: (v: string) => void;

  selectedBrand: string[];
  setSelectedBrand: React.Dispatch<React.SetStateAction<string[]>>;
  searchBrand: string;
  setSearchBrand: (v: string) => void;
  brands: Brand[];

  // 🔥 Tambahan Props Filter Hardware
  availableSockets?: string[];
  availableRamTypes?: string[];
  selectedSockets?: string[];
  setSelectedSockets?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedRamTypes?: string[];
  setSelectedRamTypes?: React.Dispatch<React.SetStateAction<string[]>>;

  minPrice: number;
  maxPrice: number;
  setMinPrice: (v: number) => void;
  setMaxPrice: (v: number) => void;

  MIN: number;
  MAX: number;
  STEP: number;

  isPriceFiltered: boolean;

  resetProducts: () => void;

  setSearchParams: any;

  showCategory?: boolean;
}

interface Brand {
  id: string;
  name: string;
  image?: string;
}

export default function FilteringSidebarKatalog(props: Props) {
  const {
    groupings = [],
    categories = [],
    groupingParam,
    categoryParam,
    categoryIdsParam,
    searchCategory,
    setSearchCategory,
    selectedBrand,
    setSelectedBrand,
    searchBrand,
    setSearchBrand,
    brands,
    
    // Hardware Props
    availableSockets = [],
    availableRamTypes = [],
    selectedSockets = [],
    setSelectedSockets,
    selectedRamTypes = [],
    setSelectedRamTypes,

    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    MIN,
    MAX,
    STEP,
    isPriceFiltered,
    resetProducts,
    setSearchParams,
    showCategory = true,
  } = props;

  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Buka dropdown secara otomatis jika grouping param ada di URL
  useEffect(() => {
    if (groupingParam) {
      const activeGroup = groupings.find((g) => g.name === groupingParam);
      if (activeGroup && !expandedGroups.includes(activeGroup.id)) {
        setExpandedGroups((prev) => [...prev, activeGroup.id]);
      }
    }
  }, [groupingParam, groupings]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleCategoryClick = (groupName: string, catId: string) => {
    setSearchParams((prev: URLSearchParams) => {
      const newParams = new URLSearchParams(prev);

      // kalau klik kategori yang sama → skip (biar ga refetch useless)
      if (
        newParams.get("grouping") === groupName &&
        newParams.get("category_ids") === catId
      ) {
        return prev;
      }

      newParams.set("grouping", groupName);
      newParams.set("category_ids", catId);
      newParams.delete("category");

      return newParams;
    });
  };

  const handleGroupClick = (e: React.MouseEvent, groupName: string) => {
    e.stopPropagation();

    setSearchParams((prev: URLSearchParams) => {
      const newParams = new URLSearchParams(prev);

      if (
        newParams.get("grouping") === groupName &&
        !newParams.get("category_ids")
      ) {
        return prev;
      }

      newParams.set("grouping", groupName);
      newParams.delete("category_ids");
      newParams.delete("category");

      return newParams;
    });
  };

  const handleAllClick = () => {
    setSearchParams((prev: URLSearchParams) => {
      const newParams = new URLSearchParams(prev);

      if (
        !newParams.get("grouping") &&
        !newParams.get("category_ids") &&
        !newParams.get("category")
      ) {
        return prev;
      }

      newParams.delete("grouping");
      newParams.delete("category_ids");
      newParams.delete("category");

      return newParams;
    });
  };

  const formatRupiah = (value: number | string) => {
    if (!value) return "";
    return value
      .toString()
      .replace(/\D/g, "")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRupiah = (value: string) => {
    return Number(value.replace(/\./g, ""));
  };

  // 🔥 LOGIC DETEKSI KATEGORI HARDWARE UNTUK MENAMPILKAN FILTER
  const currentCategoryName = categories.find(c => c.id === categoryIdsParam)?.name || categoryParam || "";
  const currentContext = `${groupingParam || ""} ${currentCategoryName}`.toLowerCase();
  
  const showSocketFilter = /motherboard|mobo|cpu|processor/i.test(currentContext);
  const showRamFilter = /motherboard|mobo|ram|memory/i.test(currentContext);

  return (
    <div className="col-span-3 px-6 py-6 border border-gray-200 h-fit space-y-8 rounded-2xl bg-white shadow-sm">
      
      {/* ================= CATEGORY / GROUPING ================= */}
      {showCategory && (
        <div>
          <h2 className="mb-4 text-lg font-bold text-gray-800">Kategori</h2>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>

          <ul className="overflow-y-auto text-sm max-h-[320px] pr-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
            <li
              onClick={handleAllClick}
              className={`px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                !categoryParam && !groupingParam && !categoryIdsParam
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              }`}
            >
              Semua Kategori
            </li>

            {groupings.map((group) => {
              const searchLower = searchCategory.toLowerCase();
              const isGroupMatch = group.name.toLowerCase().includes(searchLower);
              const matchedChildren =
                group.children?.filter((cat) =>
                  cat.name.toLowerCase().includes(searchLower)
                ) || [];

              if (searchCategory && !isGroupMatch && matchedChildren.length === 0) {
                return null;
              }

              const displayChildren =
                searchCategory && !isGroupMatch ? matchedChildren : group.children || [];

              const isExpanded =
                expandedGroups.includes(group.id) ||
                (searchCategory && matchedChildren.length > 0);
              
              const isActiveGroup = groupingParam === group.name && !categoryIdsParam;

              return (
                <li key={group.id} className="flex flex-col mb-1">
                  <div
                    className="flex items-center justify-between w-full py-2 px-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 group"
                    onClick={() => toggleGroup(group.id)}
                  >
                    <span
                      onClick={(e) => handleGroupClick(e, group.name)}
                      className={`flex-1 ${
                        isActiveGroup
                          ? "text-primary font-bold"
                          : "text-gray-700 group-hover:text-primary"
                      }`}
                    >
                      {group.name}
                    </span>
                    <button className="text-gray-400 p-0.5 rounded-md hover:bg-gray-200 transition-colors">
                      <ChevronRight 
                        className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} 
                      />
                    </button>
                  </div>

                  {/* DROPDOWN CHILDREN */}
                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden pl-5 ml-4 border-l-2 border-gray-100 space-y-1">
                      <div className="pt-1 pb-2">
                        {displayChildren.map((cat) => {
                          const isActiveChild = categoryIdsParam === cat.id;
                          return (
                            <li
                              key={cat.id}
                              onClick={() => handleCategoryClick(group.name, cat.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 mt-1 cursor-pointer transition-colors rounded-lg ${
                                isActiveChild
                                  ? "bg-primary/5 text-primary font-semibold"
                                  : "text-gray-500 hover:bg-gray-50 hover:text-primary"
                              }`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                  isActiveChild ? "bg-primary" : "bg-transparent"
                                }`}
                              />
                              {cat.name}
                            </li>
                          );
                        })}
                      </div>
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ================= BRAND ================= */}
      <div>
        <h2 className="mb-4 text-lg font-bold text-gray-800">Brand</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari brand..."
            value={searchBrand}
            onChange={(e) => setSearchBrand(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        <ul className="overflow-y-auto max-h-[240px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
          {brands
          .filter((brand) =>
            brand.name.toLowerCase().includes(searchBrand.toLowerCase())
          )
          .map((brand) => {
            const checked = selectedBrand.includes(brand.id);

            return (
              <li
                key={brand.id}
                onClick={() => {
                  setSelectedBrand((prev) =>
                    prev.includes(brand.id)
                      ? prev.filter((id) => id !== brand.id)
                      : [...prev, brand.id]
                  );

                  resetProducts();
                }}
                className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
              >
                <div
                  className={`flex items-center justify-center w-4 h-4 border rounded ${
                    checked
                      ? "bg-primary border-primary"
                      : "border-gray-300 group-hover:border-primary"
                  }`}
                >
                  {checked && <Check className="w-3 h-3 text-white" />}
                </div>

                <span
                  className={`text-sm ${
                    checked ? "text-primary font-semibold" : "text-gray-600"
                  }`}
                >
                  {brand.name}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ================= FILTER SOCKET (DYNAMIC) ================= */}
      {showSocketFilter && availableSockets.length > 0 && setSelectedSockets && (
        <div className="animate-fadeIn">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Tipe Socket</h2>
          <ul className="overflow-y-auto max-h-[240px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
            {availableSockets.map((sock) => {
              const checked = selectedSockets.includes(sock);
              return (
                <li
                  key={sock}
                  onClick={() => {
                    setSelectedSockets((prev) =>
                      prev.includes(sock) ? prev.filter((s) => s !== sock) : [...prev, sock]
                    );
                    resetProducts();
                  }}
                  className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
                >
                  <div className={`flex items-center justify-center w-4 h-4 border rounded ${checked ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${checked ? "text-primary font-semibold" : "text-gray-600"}`}>
                    {sock}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ================= FILTER RAM TYPE (DYNAMIC) ================= */}
      {showRamFilter && availableRamTypes.length > 0 && setSelectedRamTypes && (
        <div className="animate-fadeIn">
          <h2 className="mb-4 text-lg font-bold text-gray-800">Tipe RAM</h2>
          <ul className="overflow-y-auto max-h-[240px] pr-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
            {availableRamTypes.map((ram) => {
              const checked = selectedRamTypes.includes(ram);
              return (
                <li
                  key={ram}
                  onClick={() => {
                    setSelectedRamTypes((prev) =>
                      prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
                    );
                    resetProducts();
                  }}
                  className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
                >
                  <div className={`flex items-center justify-center w-4 h-4 border rounded ${checked ? "bg-primary border-primary" : "border-gray-300 group-hover:border-primary"}`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${checked ? "text-primary font-semibold" : "text-gray-600"}`}>
                    {ram}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ================= PRICE RANGE ================= */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Harga</h2>
          {isPriceFiltered && (
            <button
              onClick={() => {
                setMinPrice(MIN);
                setMaxPrice(MAX);
                resetProducts();
              }}
              className="text-xs font-medium text-red-500 hover:text-red-600 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* SLIDER */}
        <div className="relative h-1.5 mb-6 bg-gray-200 rounded-full">
          <div
            className="absolute h-full bg-primary rounded-full"
            style={{
              left: `${(minPrice / MAX) * 100}%`,
              width: `${((maxPrice - minPrice) / MAX) * 100}%`,
            }}
          />
          
          {/* Input untuk Harga Minimal */}
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={minPrice}
            onChange={(e) => {
              const value = Math.min(Number(e.target.value), maxPrice - STEP);
              setMinPrice(value);
            }}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none 
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:outline [&::-webkit-slider-thumb]:outline-2 [&::-webkit-slider-thumb]:outline-primary
              active:[&::-webkit-slider-thumb]:scale-110

              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary 
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:outline [&::-moz-range-thumb]:outline-1 [&::-moz-range-thumb]:outline-primary"
          />

          {/* Input untuk Harga Maksimal */}
          <input
            type="range"
            min={MIN}
            max={MAX}
            step={STEP}
            value={maxPrice}
            onChange={(e) => {
              const value = Math.max(Number(e.target.value), minPrice + STEP);
              setMaxPrice(value);
            }}
            className="absolute inset-0 w-full appearance-none bg-transparent pointer-events-none 
              [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-white 
              [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
              [&::-webkit-slider-thumb]:outline [&::-webkit-slider-thumb]:outline-2 [&::-webkit-slider-thumb]:outline-primary
              active:[&::-webkit-slider-thumb]:scale-110

              [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 
              [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-primary 
              [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white 
              [&::-moz-range-thumb]:cursor-pointer
              [&::-moz-range-thumb]:outline [&::-moz-range-thumb]:outline-1 [&::-moz-range-thumb]:outline-primary"
          />
        </div>

        {/* INPUT MANUAL */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1 relative">
            <span className="absolute left-2 top-[22px] text-xs text-gray-500">Rp</span>
            <label className="mb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Minimal</label>
            <input
              type="text"
              value={minPrice === MIN ? "" : formatRupiah(minPrice)}
              placeholder="0"
              onChange={(e) => {
                const value = parseRupiah(e.target.value);
                if (value < maxPrice) setMinPrice(value);
              }}
              className="w-full pl-7 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <div className="w-2 h-[1px] bg-gray-300 mt-5"></div>
          <div className="flex flex-col flex-1 relative">
            <span className="absolute left-2 top-[22px] text-xs text-gray-500">Rp</span>
            <label className="mb-1 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Maksimal</label>
            <input
              type="text"
              value={formatRupiah(maxPrice)}
              onChange={(e) => {
                const value = parseRupiah(e.target.value);
                if (value > minPrice) setMaxPrice(value);
              }}
              className="w-full pl-7 pr-2 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}