import { useEffect, useState } from "react";
import {
  getCategories,
  deleteCategory,
  updateCategory,
  createCategory,
} from "../../services/adminCategoryService";

import { ArrowTopRightOnSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import GroupingSection from "../../components/admin/GroupingSection";

export default function CategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [total,setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");

  const [nameError, setNameError] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const [formImage, setFormImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE}${url}`;
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormName(cat.name ?? "");
    setFormCode(cat.code ?? "");

    setPreviewImage(cat.image_url ? getImageUrl(cat.image_url) : null);
    setFormImage(null);

    setNameError(false);
    setCodeError(false);
    setIsEditOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormImage(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  useEffect(() => {
  const isEditing = !!editingCategory;

  const safeName = (formName ?? "").toLowerCase();
  const safeCode = (formCode ?? "").toLowerCase();

  const duplicateName = categories.some(
    (c) =>
      (c.name ?? "").toLowerCase() === safeName &&
      (!isEditing || String(c.id) !== String(editingCategory?.id))
  );

  const duplicateCode = categories.some(
    (c) =>
      (c.code ?? "").toLowerCase() === safeCode &&
      (!isEditing || String(c.id) !== String(editingCategory?.id))
  );

  setNameError(duplicateName);
  setCodeError(duplicateCode);
}, [formName, formCode, categories, editingCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [search, categories]);

  useEffect(() => {
    setLastPage(Math.ceil(filtered.length / limit));
    if (page > Math.ceil(filtered.length / limit)) {
      setPage(1);
    }
  }, [filtered, limit]);

  const handleSave = async () => {
    try {
      if (nameError || codeError) return;

      const formData = new FormData();

      formData.append("name", formName);
      formData.append("code", formCode);

      if (formImage) {
        formData.append("image", formImage);
      }

      console.log("UPDATE:", editingCategory.id);

      await updateCategory(editingCategory.id, formData);

      setIsEditOpen(false);
      fetchCategories();
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      console.log("FORM DATA", formName, formCode, formImage);
    }
  };

  const fetchCategories = async () => {
    const data = await getCategories();
    setCategories(data);
    setTotal(data.length);
    setFiltered(data);
    setLastPage(Math.ceil(data.length / limit));
  };

  const handleSearch = (value: string) => {
    const keyword = value.toLowerCase();

    const filteredData = categories.filter((cat) =>
      (cat.name ?? "").toLowerCase().includes(keyword) ||
      (cat.code ?? "").toLowerCase().includes(keyword)
    );

    setFiltered(filteredData);
    setPage(1);
    setLastPage(Math.ceil(filteredData.length / limit));
  };

  const getPaginatedData = () => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  };

  const handleDelete = async (category: any) => {
    if (category.total_products > 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak bisa dihapus",
        text: `Kategori "${category.name}" masih memiliki ${category.total_products} produk.`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Hapus kategori?",
      text: `Kategori "${category.name}" akan dihapus permanen.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteCategory(category.id);

      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kategori berhasil dihapus",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchCategories();

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus kategori",
      });
    }
  };

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const openCreateModal = () => {
    setFormName("");
    setFormCode(generateCode());

    setNameError(false);
    setCodeError(false);

    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    try {
      if (nameError || codeError) return;

      const formData = new FormData();
      formData.append("name", formName);
      formData.append("code", formCode);

      if (formImage) {
        formData.append("image", formImage);
      }

      await createCategory(formData);

      setIsCreateOpen(false);
      fetchCategories();

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Kategori berhasil ditambahkan",
        timer: 1500,
        showConfirmButton: false,
      });

    } catch (err: any) {
      console.error("FULL ERROR:", err);
      console.error("RESPONSE:", err?.response);
      console.error("DATA:", err?.response?.data);
    }
  };

  const generateCode = () => {
    if (!categories.length) return "ANND-001";

    const numbers = categories
      .map((c) => {
        const match = c.code?.match(/ANND-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));

    const max = numbers.length ? Math.max(...numbers) : 0;
    const next = max + 1;

    return `ANND-${String(next).padStart(3, "0")}`;
  };

return (
  <div className="p-6 text-sm">

    <GroupingSection refreshCategories={fetchCategories} />

    {/* HEADER */}
    <div className="flex items-center justify-between mb-6">
      <p className="text-sm font-bold text-black">
        Total Category: {filtered.length}
      </p>

      <button
        onClick={() => openCreateModal()}
        className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
      >
        + Tambah Category
      </button>
    </div>

    <div className="overflow-x-auto border rounded-xl">
      <table className="min-w-full text-xs table-fixed">
        <thead className="text-gray-600 bg-gray-50">

          {/* SEARCH ROW */}
          <tr>
            <th
              colSpan={4} // sebelumnya 5, sekarang 4
              className="px-4 py-3 bg-white border-b border-gray-200"
            >
              <div className="flex justify-end">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="absolute w-4 h-4 text-gray-400 right-3 top-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </th>
          </tr>

          {/* HEADER KOLOM */}
          <tr>
            <th className="px-3 py-2 text-left w-[35%]">Nama</th>
            <th className="px-3 py-2 text-left">Kode</th>
            <th className="px-3 py-2 text-center">Total Produk</th>
            <th className="px-3 py-2 text-center">Aksi</th>
          </tr>

        </thead>

        <tbody>
          {getPaginatedData().map((cat) => (
            <tr key={cat.id} className="bg-white border-t">

              <td className="px-3 py-2 font-medium">{cat.name}</td>
              <td className="px-3 py-2">{cat.code}</td>
              <td className="px-3 py-2 text-center">{cat.total_products}</td>

              <td className="px-3 py-2">
                <div className="flex justify-center gap-4">
                  {/* UBAH */}
                  <button
                    onClick={() => openEditModal(cat)}
                    className="flex items-center gap-1 font-semibold text-blue-600 transition hover:text-blue-800"
                  >
                    <ArrowTopRightOnSquareIcon
                      className="w-4 h-4"
                      strokeWidth={2.5}
                    />
                    <span>Ubah</span>
                  </button>

                  {/* HAPUS */}
                  <button
                    onClick={() => handleDelete(cat)}
                    className="flex items-center gap-1 font-semibold text-red-600 transition hover:text-red-800"
                  >
                    <TrashIcon
                      className="w-4 h-4"
                      strokeWidth={2.5}
                    />
                    <span>Hapus</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>

        {filtered.length > limit && (
          <tfoot>
            <tr>
              <td
                colSpan={4} // sebelumnya 5, sekarang 4
                className="px-4 py-4 bg-white border-t border-gray-200"
              >
                  <div className="flex items-center justify-between text-sm">

                  {/* KIRI — SHOW ENTRIES */}
                  <div className="flex items-center gap-2">
                    <span>Show</span>

                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="px-2 py-1 border border-gray-300 rounded focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={40}>40</option>
                      <option value={50}>50</option>
                    </select>

                    <span>entries</span>
                  </div>

                  {/* KANAN — PAGINATION */}
                  <div className="flex items-center gap-2">

                    <button
                      disabled={page === 1}
                      onClick={() => setPage(1)}
                      className="px-2 disabled:opacity-30"
                    >
                      {"<<"}
                    </button>

                    <button
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-2 disabled:opacity-30"
                    >
                      {"<"}
                    </button>

                    {[...Array(lastPage)].map((_, i) => {
                      const num = i + 1;
                      return (
                        <button
                          key={num}
                          onClick={() => setPage(num)}
                          className={`px-2 ${
                            page === num
                              ? "font-semibold text-blue-600"
                              : "text-gray-600"
                          }`}
                        >
                          {num}
                        </button>
                      );
                    })}

                    <button
                      disabled={page === lastPage}
                      onClick={() => setPage(page + 1)}
                      className="px-2 disabled:opacity-30"
                    >
                      {">"}
                    </button>

                    <button
                      disabled={page === lastPage}
                      onClick={() => setPage(lastPage)}
                      className="px-2 disabled:opacity-30"
                    >
                      {">>"}
                    </button>

                  </div>
                </div>
                </td>
              </tr>
            </tfoot>
          )}
        </table>

        {filtered.length === 0 && (
          <p className="mt-4">Tidak ada kategori</p>
        )}
      </div>
      {/* ================= MODAL EDIT ================= */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] bg-white rounded-xl shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Edit Category</h2>
              <button onClick={() => setIsEditOpen(false)}>✕</button>
            </div>

            {/* NAME */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Nama Category*
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md outline-none ${
                  nameError
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-500">
                  Nama category sudah digunakan
                </p>
              )}
            </div>

            {/* CODE */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium">
                Code Category*
              </label>
              <input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md outline-none ${
                  codeError
                    ? "border-red-500 focus:ring-red-400"
                    : "focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {codeError && (
                <p className="mt-1 text-xs text-red-500">
                  Code category sudah digunakan
                </p>
              )}
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>

              <button
                disabled={nameError || codeError}
                onClick={handleSave}
                className={`px-4 py-2 text-sm text-white rounded-md ${
                  nameError || codeError
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ================= END MODAL ================= */}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] bg-white rounded-xl shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Tambah Category</h2>
              <button onClick={() => setIsCreateOpen(false)}>✕</button>
            </div>

            {/* NAME */}
            <div className="mb-4">
              <label className="block mb-1 text-sm font-medium">
                Nama Category*
              </label>
              <input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md ${
                  nameError
                    ? "border-red-500"
                    : "focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-500">
                  Nama category sudah digunakan
                </p>
              )}
            </div>

            {/* CODE */}
            <div className="mb-6">
              <label className="block mb-1 text-sm font-medium">
                Code Category*
              </label>
              <input
                value={formCode}
                disabled
                onChange={(e) => setFormCode(e.target.value)}
                className={`w-full px-3 py-2 text-sm border rounded-md ${
                  codeError
                    ? "border-red-500"
                    : "focus:ring-1 focus:ring-blue-500"
                }`}
              />
              {codeError && (
                <p className="mt-1 text-xs text-red-500">
                  Code category sudah digunakan
                </p>
              )}
            </div>

            {/* BUTTON */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 text-sm bg-gray-200 rounded-md"
              >
                Batal
              </button>

              <button
                disabled={nameError || codeError}
                onClick={handleCreate}
                className={`px-4 py-2 text-sm text-white rounded-md ${
                  nameError || codeError
                    ? "bg-blue-300"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}