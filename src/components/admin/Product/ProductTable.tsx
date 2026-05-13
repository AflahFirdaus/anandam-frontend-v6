import { useState, useRef, useEffect } from "react";
import ProductRow from "./ProductRow";
import api from "../../../services/api";
import Swal from "sweetalert2";
import { AlertCircle, Tag, Trash2, Filter, X, ChevronDown, ChevronRight } from "lucide-react";

interface ProductTableProps {
  products: any[];
  total: number;
  page: number;
  lastPage: number;
  limit: number;
  duplicateCount: number;
  showDuplicateOnly: boolean;
  onToggleDuplicateFilter: () => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onToggle: (id: string, field: "is_active" | "is_popular", currentValue: boolean) => void;
  onEdit: (product: any) => void;
  onImageClick: (url: string) => void;
  onSearch: (query: string) => void;
  onRefetch: () => void;
  noCategoryCount: number;
  showNoCategoryOnly: boolean;
  onToggleNoCategoryFilter: () => void;
  availableCategories?: any[];
  onFilterChange?: (filters: { category_ids: string[]; brand_ids: string[] }) => void;
}

export default function ProductTable({
  products,
  total,
  page,
  lastPage,
  limit,
  duplicateCount,
  showDuplicateOnly,
  onToggleDuplicateFilter,
  onPageChange,
  onLimitChange,
  onToggle,
  onEdit,
  onImageClick,
  onSearch,
  onRefetch,
  noCategoryCount,
  showNoCategoryOnly,
  onToggleNoCategoryFilter,
  availableCategories = [],
  onFilterChange,
}: ProductTableProps) {

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const filterRef = useRef<HTMLDivElement>(null);

  // ============================================================
  // BUILD DUPLICATE COLOR MAP
  // ============================================================
  const duplicateColorMap = new Map<string, { row: string; badge: string }>();

  if (showDuplicateOnly) {
    const groups: Record<string, any[]> = {};
    products.forEach((p) => {
      const key = p.duplicate_group || p.sku_seller;
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    Object.entries(groups).forEach(([sku, group]) => {
      if (group.length <= 1) return;

      const sorted = [...group].sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      );

      // 🔥 Set semua blok duplikat ke warna merah (bg-red-50)
      sorted.forEach((p) => duplicateColorMap.set(p.id, { 
        row: "bg-red-50 border-l-4 border-red-500", 
        badge: "bg-red-100 text-red-700" 
      }));
    });
  }

  // ============================================================
  // KATEGORI & BRAND
  // ============================================================
  const categoriesToGroup =
    availableCategories.length > 0
      ? availableCategories
      : Array.from(
          new Map(
            products.filter((p) => p.category).map((p) => [p.category.id, p.category])
          ).values()
        );

  const groupedCategories = categoriesToGroup.reduce((acc: any, cat: any) => {
    const groupName = cat.grouping?.name || "Kategori";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(cat);
    return acc;
  }, {});

  const brandsMap = new Map();
  products.forEach((p) => {
    if (p.brand) brandsMap.set(p.brand.id, p.brand.name);
  });
  const uniqueBrands = Array.from(brandsMap.entries()).map(([id, name]) => ({ id, name }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };
  const handleApplyFilter = () => {
    setIsFilterOpen(false);
    if (onFilterChange) onFilterChange({ category_ids: selectedCategories, brand_ids: selectedBrands });
  };
  const handleResetFilter = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setIsFilterOpen(false);
    if (onFilterChange) onFilterChange({ category_ids: [], brand_ids: [] });
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 3);
    let end = Math.min(lastPage, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  const handleSelectAll = () =>
    setSelectedIds(selectedIds.length === products.length ? [] : products.map((p) => p.id));

  const [isDeleting, setIsDeleting] = useState(false);

  const handleInlineUpdate = async (id: string, updates: any) => {
    try {
      await api.put(`/admin/products/${id}`, updates);
      onRefetch();
    } catch (error) {
      Swal.fire("Error", "Gagal memperbarui data", "error");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: "Hapus Produk Terpilih?",
      html: `<div style="font-size:14px">Anda akan menghapus <b>${selectedIds.length}</b> produk.<br/><br/><span style="color:#dc2626;font-weight:500">Data yang dihapus tidak bisa dikembalikan.</span></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });
    if (!result.isConfirmed) return;
    try {
      setIsDeleting(true);
      Swal.fire({ title: "Menghapus...", text: "Sedang menghapus produk", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
      await api.delete("/admin/products/bulk", { data: { ids: selectedIds } });
      setSelectedIds([]);
      Swal.fire("Berhasil", `${selectedIds.length} produk berhasil dihapus`, "success");
      onRefetch();
    } catch (error) {
      Swal.fire("Error", "Terjadi kesalahan saat menghapus produk", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // 🔥 Fungsi BAPAKNYA: Sapu bersih semua duplikat lama di halaman ini!
  const handleDeleteAllOldDuplicates = async () => {
    const groups: Record<string, any[]> = {};
    products.forEach((p) => {
      const key = p.duplicate_group || p.sku_seller;
      if (!key) return;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });

    const idsToDelete: string[] = [];
    Object.entries(groups).forEach(([sku, group]) => {
      if (group.length <= 1) return;
      
      const sorted = [...group].sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at).getTime() -
          new Date(a.updated_at || a.created_at).getTime()
      );
      
      // Ambil semua ID kecuali index 0 (yang paling baru/teratas)
      const oldIds = sorted.slice(1).map((p) => p.id);
      idsToDelete.push(...oldIds);
    });

    if (idsToDelete.length === 0) {
      Swal.fire("Info", "Tidak ada produk duplikat lama yang bisa dihapus.", "info");
      return;
    }

    const result = await Swal.fire({
      title: "Bersihkan Duplikat?",
      html: `<div style="font-size:14px">Akan menghapus <b>${idsToDelete.length}</b> versi produk lama.<br/>Sistem hanya akan menyimpan versi yang paling baru untuk setiap SKU.</div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Bersihkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
    });

    if (!result.isConfirmed) return;

    try {
      setIsDeleting(true);
      Swal.fire({ title: "Membersihkan...", text: "Sedang menghapus duplikat lama", allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
      await api.delete("/admin/products/bulk", { data: { ids: idsToDelete } });
      Swal.fire("Berhasil", `${idsToDelete.length} produk duplikat lama berhasil dibersihkan`, "success");
      onRefetch();
    } catch (err) {
      Swal.fire("Error", "Gagal menghapus duplikat", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="overflow-hidden bg-white border border-gray-200 shadow rounded-2xl">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b">
            <span className="text-sm text-red-700">{selectedIds.length} produk dipilih</span>
            <button onClick={handleBulkDelete} disabled={isDeleting} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50">
              <Trash2 size={16} /> Hapus
            </button>
          </div>
        )}

        <table className="min-w-[900px] text-xs table-auto">
          <thead className="bg-white">
            <tr className="border-b">
              <th colSpan={10} className="px-4 py-3 bg-white">
                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-2">
                    {/* BUTTON FILTER & BAPAKNYA HAPUS */}
                    {duplicateCount > 0 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={onToggleDuplicateFilter}
                          className={`group flex items-center gap-0 hover:gap-2 px-2 py-2 text-xs rounded-full transition-all duration-300 ${showDuplicateOnly ? "bg-red-600 text-white shadow-md" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                        >
                          <AlertCircle size={18} />
                          <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[200px]">
                            {duplicateCount} Duplicate Produk
                          </span>
                        </button>

                        {/* 🔥 Tombol Sapu Bersih muncul kalo filternya lagi aktif aja */}
                        {showDuplicateOnly && (
                          <button
                            onClick={handleDeleteAllOldDuplicates}
                            disabled={isDeleting}
                            title="Hapus semua versi lama dan sisakan yang terbaru"
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-sm disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Bersihkan Versi Lama
                          </button>
                        )}
                      </div>
                    )}

                    {noCategoryCount > 0 && (
                      <button
                        onClick={onToggleNoCategoryFilter}
                        className={`group flex items-center gap-0 hover:gap-2 px-2 py-2 text-xs rounded-full transition-all duration-300 ${showNoCategoryOnly ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                      >
                        <Tag size={18} />
                        <span className="max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[200px]">
                          {noCategoryCount} Belum Ada Kategori
                        </span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 relative" ref={filterRef}>
                    <input
                      type="text"
                      placeholder="Cari..."
                      className="w-40 sm:w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => onSearch(e.target.value)}
                    />
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`relative p-2 border rounded-lg transition-colors ${
                        selectedCategories.length > 0 || selectedBrands.length > 0
                          ? "bg-blue-50 border-blue-500 text-blue-600"
                          : "border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      }`}
                    >
                      <Filter size={18} />
                      {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>
                      )}
                    </button>

                    {isFilterOpen && (
                      <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 shadow-xl rounded-xl z-50 flex flex-col overflow-hidden">
                        <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                          <span className="font-semibold text-gray-800">Filter Produk</span>
                          <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={18} />
                          </button>
                        </div>
                        <div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-6">
                          <div>
                            {Object.keys(groupedCategories).length > 0 ? (
                              <div className="flex flex-col gap-3">
                                {Object.keys(groupedCategories).map((groupName) => {
                                  const isExpanded = expandedGroups[groupName] !== false;
                                  return (
                                    <div key={groupName} className="border border-gray-100 rounded-lg overflow-hidden">
                                      <button onClick={() => toggleGroup(groupName)} className="w-full flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">{groupName}</span>
                                        {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
                                      </button>
                                      {isExpanded && (
                                        <div className="p-2 flex flex-col gap-2 bg-white">
                                          {groupedCategories[groupName].map((cat: any) => (
                                            <label key={cat.id} className="flex items-center gap-2 cursor-pointer group ml-1">
                                              <input type="checkbox" checked={selectedCategories.includes(cat.id)} onChange={() => toggleCategory(cat.id)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                                              <span className="text-sm text-gray-600 group-hover:text-blue-600">{cat.name}</span>
                                            </label>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tidak ada kategori tersedia</span>
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-500 mb-3 block uppercase tracking-wider border-b pb-1">Brand</span>
                            {uniqueBrands.length > 0 ? (
                              <div className="flex flex-col gap-2 pl-1">
                                {uniqueBrands.map((brand) => (
                                  <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" checked={selectedBrands.includes(brand.id)} onChange={() => toggleBrand(brand.id)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" />
                                    <span className="text-sm text-gray-600 group-hover:text-blue-600 truncate">{brand.name}</span>
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">Tidak ada brand di halaman ini</span>
                            )}
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-100 bg-gray-50 flex gap-2">
                          <button onClick={handleResetFilter} className="flex-1 py-1.5 px-3 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">Reset</button>
                          <button onClick={handleApplyFilter} className="flex-1 py-1.5 px-3 text-xs font-semibold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">Terapkan</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </th>
            </tr>

            <tr className="border-b bg-gray-50">
              <th className="px-3 py-2 text-center sticky left-0 bg-white z-10 w-[40px] min-w-[40px]">
                <input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={handleSelectAll} />
              </th>
              <th className="px-3 py-2 text-left w-[60px] min-w-[60px]">Gambar</th>
              <th className="px-3 py-2 text-left w-[35%] min-w-[360px]">Nama</th>
              <th className="px-3 py-2 text-center w-[70px] min-w-[70px]">Stok</th>
              <th className="px-3 py-2 text-left w-[130px] min-w-[130px]">Harga Normal</th>
              <th className="px-3 py-2 text-left w-[110px] min-w-[110px]">Diskon</th>
              <th className="px-3 py-2 text-left w-[130px] min-w-[130px]">Harga Final</th>
              <th className="px-3 py-2 text-center w-[90px] min-w-[90px]">Aktif</th>
              <th className="px-3 py-2 text-center w-[90px] min-w-[90px]">Populer</th>
              <th className="px-3 py-2 text-center w-[90px] min-w-[90px]">Aksi</th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {products.length === 0 ? (
              <tr><td colSpan={10} className="px-4 py-4 text-center">Tidak ada produk</td></tr>
            ) : (
              products.map((product) => {
                const dupColor = duplicateColorMap.get(product.id);

                return (
                  <ProductRow
                    key={product.id}
                    onInlineUpdate={handleInlineUpdate}
                    product={product}
                    isSelected={selectedIds.includes(product.id)}
                    onSelect={handleSelect}
                    onToggle={onToggle}
                    onEdit={onEdit}
                    onImageClick={onImageClick}
                    duplicateRowClass={dupColor?.row}
                  />
                );
              })
            )}
          </tbody>

          <tfoot>
            <tr>
              <td colSpan={10} className="px-4 py-4 bg-white border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Show</span>
                    <select value={limit} onChange={(e) => onLimitChange(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded-md">
                      {[10, 30, 50, 100].map((num) => (<option key={num} value={num}>{num}</option>))}
                    </select>
                    <span>entries</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <button disabled={page === 1} onClick={() => onPageChange(1)} className="px-2 disabled:opacity-30">{"<<"}</button>
                    <button disabled={page === 1} onClick={() => onPageChange(page - 1)} className="px-2 disabled:opacity-30">{"<"}</button>
                    {getPageNumbers().map((num) => (
                      <button key={num} onClick={() => onPageChange(num)} className={`px-2 ${page === num ? "font-semibold text-blue-600" : "text-gray-600"}`}>{num}</button>
                    ))}
                    {lastPage > 5 && page + 2 < lastPage && <span className="px-2">...</span>}
                    <button disabled={page === lastPage} onClick={() => onPageChange(page + 1)} className="px-2 disabled:opacity-30">{">"}</button>
                    <button disabled={page === lastPage} onClick={() => onPageChange(lastPage)} className="px-2 disabled:opacity-30">{">>"}</button>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}