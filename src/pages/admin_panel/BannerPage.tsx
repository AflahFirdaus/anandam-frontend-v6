import { useEffect, useState, useMemo } from "react";
import {
  getBanners,
  uploadBanner,
  deleteBanner,
  updateBanner,
  updateBannerTitle,
  updateBannerSlot,
  type Banner,
} from "../../services/bannerService";
import { 
  Upload, Trash2, RefreshCw, Pencil, Tag, 
  Layers, Briefcase, Search, X, CheckCircle2 
} from "lucide-react";
import Swal from "sweetalert2";
import { getCategories } from "../../services/adminCategoryService";
import { getBrands } from "../../services/brandService";

const updateBannerMetadataInternal = async (
  id: string,
  payload: { slot: string; promo: string; categoryIds: string[]; brandIds: string[] }
) => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/v1/banner-image/${id}/metadata`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Gagal update metadata");
  return res.json();
};

const BASE_FILE_URL = `${import.meta.env.VITE_API_BASE}`;

export default function BannerPage() {
  const [data, setData] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Mode State
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [promoText, setPromoText] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Data Options
  const [categoryOptions, setCategoryOptions] = useState<any[]>([]);
  const [brandOptions, setBrandOptions] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");

  const filteredCategories = useMemo(() => {
    return categoryOptions.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categoryOptions, categorySearch]);

  const filteredBrands = useMemo(() => {
    return brandOptions.filter((brand) =>
      brand.name.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandOptions, brandSearch]);

  const SLOT_OPTIONS = ["hero", "banner-promo", "banner-promo-product"];

  const fetchData = async () => {
    try {
      const [bannerRes, catRes, brandRes] = await Promise.all([
        getBanners(),
        getCategories(),
        getBrands(),
      ]);
      setData(bannerRes);
      setCategoryOptions(catRes || []);
      setBrandOptions(brandRes || []);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setIsEditMode(false);
    setEditingBannerId(null);
    setSelectedFile(null);
    setSelectedSlot("");
    setPromoText("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setCategorySearch("");
    setBrandSearch("");
  };

  const handleEditClick = (banner: any) => {
    setIsEditMode(true);
    setEditingBannerId(banner.id);
    setSelectedSlot(banner.slot);
    setPromoText(banner.promo || "");
    setSelectedCategories(banner.categories?.map((c: any) => c.id) || []);
    setSelectedBrands(banner.brands?.map((b: any) => b.id) || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleSelection = (id: string, list: string[], setList: any) => {
    if (list.includes(id)) {
      setList(list.filter((item) => item !== id));
    } else {
      setList([...list, id]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSlot.trim()) {
      Swal.fire("Oops", "Slot wajib diisi!", "warning");
      return;
    }

    try {
      setUploading(true);

      if (isEditMode && editingBannerId) {
        // ACTION: UPDATE METADATA
        await updateBannerMetadataInternal(editingBannerId, {
          slot: selectedSlot,
          promo: promoText,
          categoryIds: selectedCategories,
          brandIds: selectedBrands,
        });
        Swal.fire("Berhasil", "Metadata banner diperbarui", "success");
      } else {
        // ACTION: UPLOAD NEW
        if (!selectedFile) {
          Swal.fire("Oops", "File gambar wajib dipilih!", "warning");
          return;
        }
        await uploadBanner(
          selectedFile,
          selectedSlot.trim(),
          selectedCategories,
          selectedBrands,
          promoText
        );
        Swal.fire("Berhasil", "Banner baru telah diupload", "success");
      }

      resetForm();
      await fetchData();
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan pada server", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveTitle = async (id: string) => {
    try {
      await updateBannerTitle(id, tempTitle);
      setEditingId(null);
      await fetchData();
    } catch {
      alert("Gagal update title");
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Hapus banner?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Ya, Hapus",
    });

    if (result.isConfirmed) {
      try {
        await deleteBanner(id);
        await fetchData();
        Swal.fire("Dihapus!", "Banner telah dihapus.", "success");
      } catch {
        Swal.fire("Gagal", "Gagal menghapus banner", "error");
      }
    }
  };

  const handleReplace = async (id: string, file: File) => {
    try {
      await updateBanner(id, file);
      await fetchData();
      Swal.fire("Berhasil", "Gambar banner diperbarui", "success");
    } catch {
      Swal.fire("Gagal", "Gagal mengganti gambar", "error");
    }
  };

  if (loading) return <div className="p-10 text-center font-medium">Memuat data...</div>;

  return (
    <div className="flex items-start gap-8 p-10 bg-gray-50 min-h-screen">
      {/* LEFT SIDE - LIST BANNER */}
      <div className="flex-1">
        {data.length === 0 && <p className="text-gray-500 italic">Belum ada banner yang diupload.</p>}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {data.map((banner: any) => (
            <div key={banner.id} className={`bg-white border ${editingBannerId === banner.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'} shadow-sm rounded-2xl overflow-hidden flex flex-col transition-all`}>
              {/* HEADER INFO */}
              <div className="p-4 border-b border-gray-50 flex justify-between items-start gap-4">
                <div className="flex-1">
                  {editingId === banner.id ? (
                    <input
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={() => handleSaveTitle(banner.id)}
                      className="w-full px-2 py-1 text-sm font-semibold border rounded outline-blue-500"
                      autoFocus
                    />
                  ) : (
                    <h3
                      onClick={() => { setEditingId(banner.id); setTempTitle(banner.title || ""); }}
                      className="text-sm font-bold flex items-center gap-2 cursor-pointer hover:text-blue-600 transition"
                    >
                      {banner.title || "Banner Tanpa Judul"} <Pencil size={12} className="text-gray-400" />
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-1 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full font-mono uppercase">
                      Slot: {banner.slot}
                    </span>
                    {banner.promo && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-bold flex items-center gap-1">
                        <Tag size={8} /> {banner.promo}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditClick(banner)} 
                    className={`p-2 rounded-lg transition ${editingBannerId === banner.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-blue-600'}`}
                  >
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => handleDelete(banner.id)} className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* IMAGE PREVIEW */}
              <div className="relative group aspect-video overflow-hidden bg-gray-100">
                <img
                  src={`${BASE_FILE_URL}${banner.image_url}`}
                  alt="banner"
                  onClick={() => setPreviewImage(`${BASE_FILE_URL}${banner.image_url}`)}
                  className="w-full h-full object-cover cursor-zoom-in group-hover:scale-105 transition duration-500"
                />
                <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition">
                  <span className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm cursor-pointer flex items-center gap-2 border border-gray-200 hover:bg-white">
                    <RefreshCw size={14} /> Ganti Gambar
                  </span>
                  <input type="file" className="hidden" onChange={(e) => e.target.files && handleReplace(banner.id, e.target.files[0])} />
                </label>
              </div>

              {/* METADATA FOOTER */}
              <div className="p-4 bg-gray-50/50 text-[11px] space-y-1.5 border-t border-gray-100">
                <div className="flex gap-2">
                  <span className="text-gray-400 font-bold uppercase w-16">Kategori:</span>
                  <span className="text-gray-600 flex-1">{banner.categories?.map((c: any) => c.name).join(", ") || "-"}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-gray-400 font-bold uppercase w-16">Brands:</span>
                  <span className="text-gray-600 flex-1">{banner.brands?.map((b: any) => b.name).join(", ") || "-"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SIDE - PANEL */}
      <div className={`w-[360px] bg-white border ${isEditMode ? 'border-blue-200' : 'border-gray-200'} p-6 rounded-3xl shadow-sm sticky top-10 flex flex-col gap-5 max-h-[calc(100vh-80px)] overflow-y-auto custom-scrollbar transition-colors`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-bold mb-1 ${isEditMode ? 'text-blue-600' : 'text-black'}`}>
              {isEditMode ? "Edit Metadata" : "Upload Banner"}
            </h3>
            <p className="text-xs text-gray-400">
              {isEditMode ? "Ubah pengaturan target banner ini." : "Pastikan dimensi gambar sesuai slot."}
            </p>
          </div>
          {isEditMode && (
            <button onClick={resetForm} className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition">
              <X size={16} />
            </button>
          )}
        </div>

        {/* IMAGE INPUT (Hanya muncul saat mode upload) */}
        {!isEditMode && (
          <label className="group flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50 hover:border-black transition">
            {selectedFile ? (
              <div className="text-center p-4">
                <Upload size={24} className="mx-auto mb-2 text-green-500" />
                <p className="text-xs font-medium text-gray-700 truncate max-w-[280px]">{selectedFile.name}</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <Upload size={24} className="mx-auto mb-2 text-gray-400 group-hover:text-black transition" />
                <p className="text-xs font-semibold text-gray-500 group-hover:text-black">Klik untuk upload gambar</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          </label>
        )}

        {/* SLOT & PROMO */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Pilih Slot Placement</label>
            <select
              value={selectedSlot}
              onChange={(e) => setSelectedSlot(e.target.value)}
              className="w-full h-11 px-4 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition font-medium"
            >
              <option value="">Pilih Slot</option>
              {SLOT_OPTIONS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Tipe Promo (Opsional)</label>
            <div className="relative">
              <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Misal: Flash Sale, New Year"
                value={promoText}
                onChange={(e) => setPromoText(e.target.value)}
                className="w-full h-11 pl-11 pr-4 text-sm bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>
          </div>
        </div>

        {/* MULTI SELECT CATEGORIES */}
        <div className="space-y-2">
          <div className="flex justify-between items-end ml-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <Layers size={12} /> Target Kategori
            </label>
            <span className="text-[10px] text-gray-400 font-medium">{selectedCategories.length} Terpilih</span>
          </div>
          
          <div className="relative">
            <input 
              type="text"
              placeholder="Cari kategori..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-1 border border-transparent focus-within:border-gray-200 transition">
            {filteredCategories.length > 0 ? filteredCategories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition text-sm">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => handleToggleSelection(cat.id, selectedCategories, setSelectedCategories)}
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 focus:ring-blue-500"
                />
                <span className={selectedCategories.includes(cat.id) ? "font-bold text-blue-600" : "text-gray-600"}>{cat.name}</span>
              </label>
            )) : <p className="text-[10px] text-gray-400 text-center py-2">Kategori tidak ditemukan</p>}
          </div>
        </div>

        {/* MULTI SELECT BRANDS */}
        <div className="space-y-2">
          <div className="flex justify-between items-end ml-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2">
              <Briefcase size={12} /> Target Brand
            </label>
            <span className="text-[10px] text-gray-400 font-medium">{selectedBrands.length} Terpilih</span>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="Cari brand..."
              value={brandSearch}
              onChange={(e) => setBrandSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 text-xs bg-gray-100 border-none rounded-lg focus:ring-1 focus:ring-blue-500 outline-none transition"
            />
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-3 max-h-40 overflow-y-auto space-y-1 border border-transparent focus-within:border-gray-200 transition">
            {filteredBrands.length > 0 ? filteredBrands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => handleToggleSelection(brand.id, selectedBrands, setSelectedBrands)}
                  className="w-4 h-4 rounded border-gray-300 accent-blue-600 focus:ring-blue-500"
                />
                <span className={selectedBrands.includes(brand.id) ? "font-bold text-blue-600" : "text-gray-600"}>{brand.name}</span>
              </label>
            )) : <p className="text-[10px] text-gray-400 text-center py-2">Brand tidak ditemukan</p>}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={uploading || (!isEditMode && !selectedFile)}
          className={`w-full h-12 rounded-2xl text-white font-bold transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
            uploading || (!isEditMode && !selectedFile)
              ? "bg-gray-300 shadow-none cursor-not-allowed" 
              : isEditMode 
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" 
                : "bg-black hover:bg-gray-800 shadow-black/20"
          }`}
        >
          {uploading ? (
            "Memproses..."
          ) : isEditMode ? (
            <><CheckCircle2 size={18} /> Simpan Perubahan</>
          ) : (
            "Upload Banner Sekarang"
          )}
        </button>
      </div>

      {/* MODAL PREVIEW */}
      {previewImage && (
        <div onClick={() => setPreviewImage(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-10 cursor-zoom-out">
          <img src={previewImage} alt="preview" className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}