import React, { useEffect, useState } from "react";
import { getProducts } from "../services/productService";

export default function BrandModalForm({
  title,
  brandName,
  setBrandName,
  selectedProducts,
  setSelectedProducts,
  setImageFile,
  onClose,
  onSubmit,
}: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchProducts = async (keyword = "") => {
    try {
      setLoading(true); 

      const res = await getProducts({
        search: keyword,
        no_limit: true,
      });

      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); 
    }
  };

  // initial load
  useEffect(() => {
    fetchProducts();
  }, []);

  // search (debounce simple)
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchProducts(search);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-[500px] bg-white p-6 rounded-xl">

        <h2 className="mb-4 text-lg font-semibold">{title}</h2>

        {/* NAME */}
        <input
          placeholder="Nama brand"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full px-3 py-2 mb-3 border rounded"
        />

        {/* IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setImageFile(e.target.files[0]);
            }
          }}
          className="mb-3"
        />

        {/* SEARCH */}
        <input
          placeholder="Cari produk..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 mb-2 border rounded"
        />

        {/* PRODUCT LIST */}
        <div className="max-h-60 overflow-y-auto border rounded p-2">
          {loading ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Loading produk...
            </p>
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              Produk tidak ditemukan
            </p>
          ) : (
            products
              .filter((p: any) => !p.brand)
              .map((p: any) => (
                <label key={p.id} className="flex gap-2 p-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProducts([...selectedProducts, p.id]);
                      } else {
                        setSelectedProducts(
                          selectedProducts.filter((id: string) => id !== p.id)
                        );
                      }
                    }}
                  />
                  {p.name}
                </label>
              ))
          )}
        </div>

        {/* ACTION */}
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose}>Batal</button>

          <button
            disabled={!brandName}
            onClick={onSubmit}
            className="px-4 py-2 text-white bg-green-600 rounded"
          >
            Simpan
          </button>
        </div>

      </div>
    </div>
  );
}