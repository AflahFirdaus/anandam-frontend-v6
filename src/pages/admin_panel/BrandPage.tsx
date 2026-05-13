import { useEffect, useState, useMemo } from "react";
import React from "react";
import Swal from "sweetalert2";

import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../../services/brandService";

import BrandModalForm from "../../components/brandModalForm";
import { getProducts } from "../../services/productService";
import { assignProductsToBrand, removeProductFromBrand } from "../../services/productBrandService";

import {
  TrashIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export default function BrandSection() {
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  
  // --- STATE BARU UNTUK SEARCH & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [brandName, setBrandName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- LOGIKA FILTERING & PAGINATION ---
  const filteredBrands = useMemo(() => {
    return brands.filter((b) =>
      b.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [brands, searchTerm]);

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  
  const currentItems = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return filteredBrands.slice(firstIndex, lastIndex);
  }, [filteredBrands, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE}${url}`;
  };

  const fetchBrands = async () => {
    const data = await getBrands();
    setBrands(data);
  };

  const fetchProducts = async () => {
    const res = await getProducts({ limit: 1000 });
    setProducts(res.data);
  };

  useEffect(() => {
    fetchBrands();
    fetchProducts();
  }, []);

  const openEditModal = (brand: any) => {
    setEditingBrand(brand);
    setBrandName(brand.name);
    setSelectedProducts(brand.products?.map((p: any) => p.id) || []);
    setIsEditOpen(true);
  };

  const handleToggleActive = async (brand: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    setBrands((prev) =>
      prev.map((b) =>
        b.id === brand.id ? { ...b, is_active: !b.is_active } : b
      )
    );

    try {
      await updateBrand(brand.id, { is_active: !brand.is_active });
    } catch (error) {
      console.error("Gagal update status brand", error);
      fetchBrands();
      Swal.fire("Error", "Gagal mengubah status brand", "error");
    }
  };

  const getPagination = () => {
      const pages = [];
      const maxVisible = 5; 

      if (totalPages <= maxVisible) {
          return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, currentPage + 2);

      if (start > 1) {
          pages.push(1);
          if (start > 2) pages.push("...");
      }

      for (let i = start; i <= end; i++) {
          pages.push(i);
      }

      if (end < totalPages) {
          if (end < totalPages - 1) pages.push("...");
          pages.push(totalPages);
      }

      return pages;
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        
        {/* SEARCH & ADD HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div className="relative w-full md:w-64">
                <input
                    type="text"
                    placeholder="Cari brand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>
            </div>

            <button
            onClick={() => setIsCreateOpen(true)}
            className="w-full md:w-auto px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition shadow-sm"
            >
            + Tambah Brand
            </button>
        </div>

        {/* TABLE */}
        <div className="border rounded-xl overflow-hidden">
            <table className="min-w-full text-xs table-fixed">
            <thead className="text-gray-600 bg-gray-50 border-b">
                <tr>
                <th className="px-3 py-3 w-[80px]">Logo</th>
                <th className="px-3 py-3 text-left uppercase font-bold tracking-wider">Nama</th>
                <th className="px-3 py-3 text-center uppercase font-bold tracking-wider">Jumlah Produk</th>
                <th className="px-3 py-3 text-center uppercase font-bold tracking-wider w-[100px]">Status</th>
                <th className="px-3 py-3 text-center uppercase font-bold tracking-wider">Aksi</th>
                </tr>
            </thead>

            <tbody className="divide-y">
                {currentItems.map((b) => (
                <React.Fragment key={b.id}>
                    <tr
                    className="bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => toggleExpand(b.id)}
                    >
                    <td className="px-3 py-3 text-center">
                        {b.image_url ? (
                        <img
                            src={getImageUrl(b.image_url)}
                            className="w-10 h-10 object-contain border rounded-md shadow-sm mx-auto hover:scale-110 transition"
                            onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(getImageUrl(b.image_url));
                            }}
                        />
                        ) : (
                        <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 rounded-md mx-auto">N/A</div>
                        )}
                    </td>
                    <td className="px-3 py-3 font-semibold text-gray-700">{b.name}</td>
                    <td className="px-3 py-3 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold">
                            {b.products?.length || 0} Produk
                        </span>
                    </td>
                    
                    <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={(e) => handleToggleActive(b, e)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                b.is_active ? 'bg-primary' : 'bg-gray-200'
                            }`}
                            role="switch"
                            aria-checked={b.is_active}
                        >
                            <span className="sr-only">Toggle active status</span>
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    b.is_active ? 'translate-x-4' : 'translate-x-0'
                                }`}
                            />
                        </button>
                    </td>

                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-center gap-3">
                        <button onClick={() => openEditModal(b)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" /> Ubah
                        </button>
                        <button 
                            onClick={async () => {
                                const confirm = await Swal.fire({
                                    title: "Hapus Brand?",
                                    text: b.name,
                                    icon: "warning",
                                    showCancelButton: true,
                                    confirmButtonColor: "#d33",
                                });
                                if (confirm.isConfirmed) {
                                    await deleteBrand(b.id);
                                    fetchBrands();
                                }
                            }}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                            <TrashIcon className="w-4 h-4" /> Hapus
                        </button>
                        </div>
                    </td>
                    </tr>

                    {/* CHILD PRODUCTS (COLLAPSIBLE) */}
                    {expandedIds.includes(b.id) && b.products?.map((p: any) => (
                        <tr key={p.id} className="bg-gray-50/50 border-t">
                            <td></td>
                            <td className="px-6 py-2 text-gray-500 italic">└ {p.name}</td>
                            <td className="text-center text-[10px] text-gray-400 uppercase tracking-tighter">item</td>
                            <td></td> {/* Kosongkan kolom status untuk baris produk */}
                            <td className="text-center">
                                <button 
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const confirm = await Swal.fire({ title: "Lepas dari brand?", text: p.name, icon: "question", showCancelButton: true });
                                        if (confirm.isConfirmed) {
                                            await removeProductFromBrand(p.id);
                                            fetchBrands();
                                        }
                                    }}
                                    className="text-red-400 hover:text-red-600 text-[10px]"
                                >
                                    Hapus
                                </button>
                            </td>
                        </tr>
                    ))}
                </React.Fragment>
                ))}
            </tbody>
            </table>
        </div>

        {/* FOOTER: ENTRIES & PAGINATION */}
        <div className="flex flex-col md:flex-row justify-between items-center mt-5 gap-4">
            <div className="text-sm text-gray-500">
                Show 
                <select 
                    value={itemsPerPage} 
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="mx-2 border rounded p-1 outline-none"
                >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                </select>
                entries
            </div>

            <div className="flex items-center gap-1 text-sm">
                {/* FIRST */}
                <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded disabled:opacity-30 transition-colors hover:text-primary"
                >
                    {"<<"}
                </button>

                {/* PREV */}
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 rounded disabled:opacity-30 transition-colors hover:text-primary"
                >
                    {"<"}
                </button>

                {/* PAGE NUMBERS */}
                {getPagination().map((item, index) => (
                    item === "..." ? (
                    <span key={index} className="px-2 text-gray-400">...</span>
                    ) : (
                    <button
                        key={index}
                        onClick={() => setCurrentPage(Number(item))}
                        className={`px-3 py-1 rounded transition-colors ${
                        currentPage === item
                            ? " text-primary"
                            : "hover:text-primary"
                        }`}
                    >
                        {item}
                    </button>
                    )
                ))}

                {/* NEXT */}
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 py-1 rounded disabled:opacity-30 transition-colors hover:text-primary"
                >
                    {">"}
                </button>

                {/* LAST */}
                <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-2 py-1 rounded disabled:opacity-30 transition-colors hover:text-primary"
                >
                    {">>"}
                </button>
            </div>
        </div>

        {/* MODAL CREATE */}
        {isCreateOpen && (
            <BrandModalForm
            title="Tambah Brand"
            brandName={brandName}
            setBrandName={setBrandName}
            products={products}
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            setImageFile={setImageFile}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={async () => {
                const res = await createBrand({
                name: brandName,
                image: imageFile,
                });

                await assignProductsToBrand(res.data.id, selectedProducts);

                fetchBrands();
                fetchProducts();

                setIsCreateOpen(false);
                setBrandName("");
                setSelectedProducts([]);
                setImageFile(null);
            }}
            />
        )}

        {/* MODAL EDIT */}
        {isEditOpen && (
            <BrandModalForm
                title="Edit Brand"
                brandName={brandName}
                setBrandName={setBrandName}
                products={products}
                selectedProducts={selectedProducts}
                setSelectedProducts={setSelectedProducts}
                setImageFile={setImageFile}
                onClose={() => setIsEditOpen(false)}
                onSubmit={async () => {
                    await updateBrand(editingBrand.id, {
                        name: brandName,
                        image: imageFile,
                    });

                    await assignProductsToBrand(editingBrand.id, selectedProducts);

                    await fetchBrands();
                    await fetchProducts(); 

                    setIsEditOpen(false);   
                }}
            />
        )}

        {/* IMAGE PREVIEW MODAL */}
        {previewImage && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
            onClick={() => setPreviewImage(null)}
        >
            <div
            className="relative"
            onClick={(e) => e.stopPropagation()}
            >
            <img
                src={previewImage}
                className="max-h-[80vh] max-w-[90vw] rounded-lg shadow-lg"
            />

            {/* CLOSE BUTTON */}
            <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 bg-white rounded-full px-2 py-1 text-xs shadow"
            >
                ✕
            </button>
            </div>
        </div>
        )}

    </div>
    
  );
}