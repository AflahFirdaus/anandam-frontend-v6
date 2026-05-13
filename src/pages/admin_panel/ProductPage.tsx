import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAdminProducts,
  updateAdminProduct,
  createAdminProduct,
  getAdminProductById,
} from "../../services/adminProductService";

import { 
  updateProductImages,
  uploadProductImage,
} from "../../services/adminProductImageService";

import {
  getCategories,
} from "../../services/adminCategoryService";

import ProductTable from "../../components/admin/Product/ProductTable";
import ProductWizard from "../../components/admin/Product/ProductWizard";

export default function AdminProductPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [showDuplicateOnly, setShowDuplicateOnly] = useState(false);
  const [duplicateTotal, setDuplicateTotal] = useState(0);
  const [showNoCategoryOnly, setShowNoCategoryOnly] = useState(false);
  const [noCategoryTotal, setNoCategoryTotal] = useState(0);
  const noCategoryCount = noCategoryTotal;
  const duplicateCount = duplicateTotal;
  const [filterCategoryIds, setFilterCategoryIds] = useState<string[]>([]);
  const [filterBrandIds, setFilterBrandIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts(page, search, showDuplicateOnly, showNoCategoryOnly, filterCategoryIds, filterBrandIds);
  }, [page, limit, search, showDuplicateOnly, showNoCategoryOnly, filterCategoryIds, filterBrandIds]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const result = await getCategories();
      if (Array.isArray(result)) setCategories(result);
      else if (Array.isArray(result?.data)) setCategories(result.data);
      else setCategories([]);
    } catch (err) {
      console.error("Gagal fetch kategori", err);
      setCategories([]);
    }
  };

  const fetchProducts = async (
    currentPage: number,
    searchQuery = search,
    onlyDuplicate = showDuplicateOnly,
    onlyNoCategory = showNoCategoryOnly,
    catIds = filterCategoryIds,
    bndIds = filterBrandIds
  ) => {
    try {
      const result = await getAdminProducts({
        page: currentPage,
        limit,
        search: searchQuery,
        only_duplicate: onlyDuplicate,
        only_no_category: onlyNoCategory,
        category_ids: catIds.length > 0 ? catIds.join(",") : undefined,
        brand: bndIds.length > 0 ? bndIds.join(",") : undefined,
      });
      setProducts(result.data);
      setTotal(result.total);
      setLastPage(result.last_page);
      setDuplicateTotal(result.duplicateTotal);
      setNoCategoryTotal(result.noCategoryTotal);
    } catch (err) {
      console.error("Gagal fetch product", err);
    }
  };

  const handleToggle = async (
    id: string,
    field: "is_active" | "is_popular",
    currentValue: boolean
  ) => {
    try {
      await updateAdminProduct(id, { [field]: !currentValue });
      fetchProducts(page, search, showDuplicateOnly, showNoCategoryOnly, filterCategoryIds, filterBrandIds);
    } catch (err) {
      console.error("Gagal update product", err);
    }
  };

  return (
    <div className="p-6 text-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-bold text-black">Total Product: {total}</p>
        <button
          onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Buat Produk
        </button>
      </div>

      {/* TABEL */}
      <ProductTable
        products={products}
        total={total}
        page={page}
        lastPage={lastPage}
        limit={limit}
        duplicateCount={duplicateCount}
        showDuplicateOnly={showDuplicateOnly}
        onToggleDuplicateFilter={() => { setPage(1); setShowDuplicateOnly(prev => !prev); }}
        noCategoryCount={noCategoryCount}
        showNoCategoryOnly={showNoCategoryOnly}
        onToggleNoCategoryFilter={() => { setPage(1); setShowNoCategoryOnly(prev => !prev); }}
        onPageChange={setPage}
        onLimitChange={(newLimit) => { setLimit(newLimit); setPage(1); }}
        onToggle={handleToggle}
        onEdit={async (product) => {
          try {
            const detail = await getAdminProductById(product.id);
            setSelectedProduct(detail);
            setIsModalOpen(true);
          } catch (err) {
            console.error("Gagal fetch detail product", err);
          }
        }}
        onImageClick={setSelectedImage}
        onSearch={(query) => { setSearch(query); setPage(1); }}
        onRefetch={() => fetchProducts(page, search, showDuplicateOnly, showNoCategoryOnly, filterCategoryIds, filterBrandIds)}
        availableCategories={categories}
        onFilterChange={(filters) => {
          setFilterCategoryIds(filters.category_ids);
          setFilterBrandIds(filters.brand_ids);
          setPage(1);
        }}
      />

      {isModalOpen && (
        <ProductWizard
          mode={selectedProduct ? "edit" : "create"}
          categories={categories}
          initialData={selectedProduct}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              const { images, variants, has_variants, variant_type_name, ...productData } = data;

              // =========================
              // 1. SIMPAN DATA TEXT DULU
              // =========================
              let res;
              if (!selectedProduct) {
                // CREATE MODE
                res = await createAdminProduct({
                  ...productData,
                  variant_type_name,
                  has_variants,
                  variants: has_variants
                    ? variants.map((v: any) => ({
                        variant_name: v.variant_name,
                        price_normal: Number(v.price_normal) || 0,
                        price_discount: Number(v.price_discount) || 0,
                        stock: Number(v.stock) || 0,
                        sku_seller: v.sku_seller || null,
                      }))
                    : undefined,
                });
              } else {
                // EDIT MODE
                const updatePayload = {
                  ...productData,
                  variant_type_name,
                  has_variants,
                  variants: has_variants
                    ? variants.map((v: any) => ({
                        id: v.id || undefined,
                        variant_name: v.variant_name,
                        price_normal: Number(v.price_normal) || 0,
                        price_discount: Number(v.price_discount) || 0,
                        stock: Number(v.stock) || 0,
                        sku_seller: v.sku_seller || null,
                      }))
                    : undefined,
                  // Kirim sort order untuk image produk utama (non-variasi)
                  images: !has_variants ? images.map((img: any, idx: number) => ({ id: img.id, sort_order: idx })) : undefined
                };
                res = await updateAdminProduct(selectedProduct.id, updatePayload);
              }

              // =========================
              // 2. LOGIC UPLOAD GAMBAR
              // =========================
              // Ambil data produk yang barusan disimpan (buat dapet ID-ID nya)
              const savedProduct = res.product || res.data || res; 
              const productId = savedProduct.id;
              const savedVariants = savedProduct.variants || [];

              console.log("Product ID saved:", productId);
              console.log("Variants saved from DB:", savedVariants);

              if (!has_variants) {
                // --- FLOW PRODUK TANPA VARIASI ---
                for (const img of images || []) {
                  if (img.file) {
                    const formData = new FormData();
                    formData.append("file", img.file);
                    formData.append("product_id", productId);
                    
                    if (img.id) {
                      await updateProductImages(img.id, formData);
                    } else {
                      await uploadProductImage(formData);
                    }
                  }
                }
              } else {
                // --- FLOW PRODUK DENGAN VARIASI ---
                for (let i = 0; i < variants.length; i++) {
                  const variantImages = variants[i].images || [];
                  
                  // Cari ID variasi yang cocok di database (berdasarkan index atau ID)
                  // Kita pakai index sebagai fallback jika ini produk baru
                  const targetVariant = variants[i].id 
                      ? savedVariants.find((sv: any) => sv.id === variants[i].id)
                      : savedVariants[i];

                  if (!targetVariant?.id) {
                      console.warn(`Gagal nemuin ID variasi buat index ke-${i}, gambar variasi ini mungkin gagal simpen.`);
                  }

                  for (const img of variantImages) {
                    if (img.file) {
                      const formData = new FormData();
                      formData.append("file", img.file);
                      formData.append("product_id", productId);
                      if (targetVariant?.id) formData.append("variant_id", targetVariant.id);

                      if (img.id) {
                        await updateProductImages(img.id, formData);
                      } else {
                        await uploadProductImage(formData);
                      }
                    }
                  }
                }
              }

              Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Produk dan gambar berhasil disimpan', confirmButtonColor: '#2563EB' });
              setIsModalOpen(false);
              fetchProducts(page, search, showDuplicateOnly, showNoCategoryOnly, filterCategoryIds, filterBrandIds);

            } catch (err) {
              console.error("CRITICAL ERROR SAAT SIMPAN:", err);
              Swal.fire({ icon: 'error', title: 'Gagal Simpan', text: 'Cek console log untuk detail error!', confirmButtonColor: '#EF4444' });
            }
          }}
        />
      )}

      {products.length === 0 && <p className="mt-4">Tidak ada produk</p>}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedImage(null)} className="absolute text-2xl text-black top-2 right-2">✕</button>
            <img src={selectedImage} alt="Preview" className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg" />
          </div>
        </div>
      )}

    </div>
  );
}