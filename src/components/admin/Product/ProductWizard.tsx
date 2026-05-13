import { useState, useEffect, useRef } from "react";
import { getOriginalUrl } from "../../imageHelper";
import { deleteProductImage } from "../../../services/adminProductImageService";
import { ChevronLeft, ChevronRight, Plus, Trash2, Tag } from "lucide-react";

interface ProductWizardProps {
  mode: "create" | "edit";
  categories: any[];
  initialData?: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ProductWizard({
  mode, categories, initialData, onClose, onSubmit,
}: ProductWizardProps) {

  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================
  // HELPER: Deteksi apakah produk punya variasi
  // ============================================================
  const detectHasVariants = (data?: any) => {
    if (!data?.variants) return false;
    if (data.variants.length === 0) return false;
    if (data.variants.length === 1 && data.variants[0].variant_name === "Default") return false;
    return true;
  };

  const getInitialForm = () => {
    const hasVar = detectHasVariants(initialData);
    const defaultVariant = initialData?.variants?.[0];

    return {
      category_id: initialData?.category?.id || "",
      name: initialData?.name || "",
      description: initialData?.description || "",
      warranty: initialData?.warranty || "",
      socket_type: initialData?.socket_type || "",
      ram_type: initialData?.ram_type || "",
      download_url: initialData?.download_url || "",
      is_active: initialData?.is_active ?? true,
      is_popular: initialData?.is_popular ?? false,

      sku_seller: defaultVariant?.sku_seller || "",
      stock: defaultVariant?.stock ?? 0,
      price_normal: defaultVariant?.price_normal || 0,
      price_discount: defaultVariant?.price_discount || 0,

      has_variants: hasVar,
      variant_type_name: initialData?.variant_type_name || "",
      variants: hasVar
        ? initialData.variants.map((v: any) => ({
            id: v.id || null,
            variant_name: v.variant_name || "",
            price_normal: v.price_normal || 0,
            price_discount: v.price_discount || 0,
            stock: v.stock || 0,
            sku_seller: v.sku_seller || "",
            images: (v.images || [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((img: any) => ({ id: img.id, image_url: img.image_url, file: null, variant_id: v.id || null })),
          }))
        : [],

      images: (!hasVar && initialData?.images)
        ? initialData.images
            .filter((img: any) => !img.variant_id)
            .sort((a: any, b: any) => a.sort_order - b.sort_order)
            .map((img: any) => ({ id: img.id, image_url: img.image_url, file: null }))
        : [],
    };
  };

  const [form, setForm] = useState(getInitialForm());

  // State gambar
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [draggedImgIndex, setDraggedImgIndex] = useState<number | null>(null);
  const [draggedVariantImgIndex, setDraggedVariantImgIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(getInitialForm());
    setStep(1);
    setErrors({});
    setActiveVariantIndex(0);
    setCurrentImageIndex(0);
  }, [initialData, mode]);

  const selectedCategory = categories.find((c) => c.id === form.category_id);
  const isProcessor = selectedCategory?.name?.toLowerCase().includes("processor");
  const isMotherboard = selectedCategory?.name?.toLowerCase().includes("motherboard");
  const isRam = selectedCategory?.name?.toLowerCase().includes("ram");
  const isPCComponent = isProcessor || isMotherboard || isRam;

  const finalPrice = Math.max(0, form.price_normal - form.price_discount);

  const formatRupiah = (value: number | string) => {
    if (!value) return "";
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRupiah = (value: string) => Number(value.replace(/\./g, ""));

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // ============================================================
  // VARIANT HELPERS
  // ============================================================
  const addVariant = () => {
    const newVariant = { id: null, variant_name: "", price_normal: 0, price_discount: 0, stock: 0, sku_seller: "", images: [] };
    handleChange("variants", [...form.variants, newVariant]);
    setActiveVariantIndex(form.variants.length);
  };

  const removeVariant = (idx: number) => {
    const updated = form.variants.filter((_: any, i: number) => i !== idx);
    handleChange("variants", updated);
    setActiveVariantIndex(Math.max(0, idx - 1));
  };

  const updateVariant = (idx: number, field: string, value: any) => {
    const updated = form.variants.map((v: any, i: number) => i === idx ? { ...v, [field]: value } : v);
    handleChange("variants", updated);
    if (errors[`variant_${idx}_${field}`]) setErrors((prev) => ({ ...prev, [`variant_${idx}_${field}`]: "" }));
  };

  // ============================================================
  // GAMBAR — NON VARIASI
  // ============================================================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const updated = [...form.images, { image_url: "", file: e.target.files[0] }];
    handleChange("images", updated);
    setCurrentImageIndex(updated.length - 1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const moveImage = (direction: "left" | "right") => {
    if (form.images.length <= 1) return;
    const newIndex = direction === "left" ? currentImageIndex - 1 : currentImageIndex + 1;
    if (newIndex < 0 || newIndex >= form.images.length) return;
    const updated = [...form.images];
    [updated[currentImageIndex], updated[newIndex]] = [updated[newIndex], updated[currentImageIndex]];
    handleChange("images", updated);
    setCurrentImageIndex(newIndex);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => { setDraggedImgIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedImgIndex === null || draggedImgIndex === targetIndex) return;
    const updated = [...form.images];
    const [draggedItem] = updated.splice(draggedImgIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    handleChange("images", updated);
    setCurrentImageIndex(targetIndex);
    setDraggedImgIndex(null);
  };

  // ============================================================
  // GAMBAR — PER VARIASI (🔥🔥 FIX DRAG & DROP)
  // ============================================================
  const handleVariantImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const updatedVariants = [...form.variants];
    const variantImages = updatedVariants[activeVariantIndex].images || [];
    updatedVariants[activeVariantIndex].images = [...variantImages, { image_url: "", file: e.target.files[0], variant_id: updatedVariants[activeVariantIndex].id }];
    handleChange("variants", updatedVariants);
    setCurrentImageIndex(updatedVariants[activeVariantIndex].images.length - 1);
    if (variantFileInputRef.current) variantFileInputRef.current.value = "";
  };

  const moveVariantImage = (direction: "left" | "right") => {
    const updatedVariants = [...form.variants];
    const images = updatedVariants[activeVariantIndex].images || [];
    if (images.length <= 1) return;
    const newIndex = direction === "left" ? currentImageIndex - 1 : currentImageIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;
    [images[currentImageIndex], images[newIndex]] = [images[newIndex], images[currentImageIndex]];
    handleChange("variants", updatedVariants);
    setCurrentImageIndex(newIndex);
  };

  const handleVariantDragStart = (e: React.DragEvent, index: number) => { setDraggedVariantImgIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleVariantDragOver = (e: React.DragEvent, index: number) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleVariantDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedVariantImgIndex === null || draggedVariantImgIndex === targetIndex) return;
    const updatedVariants = [...form.variants];
    const images = updatedVariants[activeVariantIndex].images || [];
    const [draggedItem] = images.splice(draggedVariantImgIndex, 1);
    images.splice(targetIndex, 0, draggedItem);
    handleChange("variants", updatedVariants);
    setCurrentImageIndex(targetIndex);
    setDraggedVariantImgIndex(null);
  };

  const removeVariantImage = async (variantIdx: number, imgIdx: number) => {
    if (!confirm("Hapus gambar ini?")) return;
    const img = form.variants[variantIdx].images[imgIdx];
    try {
      if (img.id) await deleteProductImage(img.id);
      const updatedVariants = [...form.variants];
      updatedVariants[variantIdx].images.splice(imgIdx, 1);
      handleChange("variants", updatedVariants);
      setCurrentImageIndex((prev) => Math.min(prev, updatedVariants[variantIdx].images.length - 1));
    } catch { alert("Gagal menghapus gambar"); }
  };

  // ============================================================
  // VALIDASI & SCROLL (🔥🔥 FIX AUTO SCROLL)
  // ============================================================
  const scrollToError = (errs: Record<string, string>) => {
    const firstErrorKey = Object.keys(errs)[0];
    if (firstErrorKey) {
      setTimeout(() => {
        const el = document.getElementById(firstErrorKey);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus({ preventScroll: true });
        }
      }, 50);
    }
  };

  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!form.category_id) { newErrors.category_id = "Kategori wajib dipilih"; isValid = false; }
      if (!form.name.trim()) { newErrors.name = "Nama produk wajib diisi"; isValid = false; }
      if (form.has_variants && !form.variant_type_name.trim()) {
        newErrors.variant_type_name = "Nama tipe variasi wajib diisi"; isValid = false;
      }
    }

    if (currentStep === 2) {
      if (!form.has_variants) {
        if (!form.price_normal || form.price_normal <= 0) { newErrors.price_normal = "Harga normal wajib diisi"; isValid = false; }
        if (form.stock === null || form.stock === undefined || form.stock < 0 || String(form.stock) === "") {
          newErrors.stock = "Stock wajib diisi"; isValid = false;
        }
      } else {
        if (form.variants.length === 0) { newErrors.variants = "Minimal 1 variasi harus ditambahkan"; isValid = false; }
        form.variants.forEach((v: any, idx: number) => {
          if (!v.variant_name.trim()) { newErrors[`variant_${idx}_name`] = "Nama variasi wajib diisi"; isValid = false; }
          if (!v.price_normal || v.price_normal <= 0) { newErrors[`variant_${idx}_price`] = "Harga wajib diisi"; isValid = false; }
        });
      }
    }

    setErrors(newErrors);
    if (!isValid) scrollToError(newErrors);
    return isValid;
  };

  const nextStep = () => { if (validateStep(step)) setStep((prev) => prev + 1); };
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSimpan = () => {
    // Validasi beruntun, pastikan cek step 1 & 2
    if (step === 1 && !validateStep(1)) return;
    if (step === 2 && !validateStep(2)) return;
    if (step === 3 && (!validateStep(1) || !validateStep(2))) {
       alert("Ada kolom yang belum terisi di step sebelumnya.");
       return;
    }

    const finalPayload = {
      ...form,
      images: form.images.map((img: any, index: number) => ({ ...img, sort_order: index })),
      variants: form.has_variants
        ? form.variants.map((v: any) => ({
            ...v,
            images: (v.images || []).map((img: any, index: number) => ({ ...img, sort_order: index })),
          }))
        : [],
    };

    onSubmit(finalPayload);
  };

  // ============================================================
  // RENDER GALERI
  // ============================================================
  const renderGallery = (
    images: any[], onUpload: () => void, onDelete: (idx: number) => void,
    onMove?: (dir: "left" | "right") => void, activeIdx?: number, onSetActive?: (idx: number) => void,
    onDragStart?: (e: React.DragEvent, idx: number) => void, onDragOver?: (e: React.DragEvent, idx: number) => void, onDrop?: (e: React.DragEvent, idx: number) => void,
  ) => {
    const curIdx = activeIdx ?? 0;
    const setIdx = onSetActive ?? (() => {});

    return images.length > 0 ? (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
        {/* Preview utama */}
        <div className="relative flex justify-center mb-4 bg-white border border-gray-200 rounded-lg shadow-sm aspect-video group overflow-hidden">
          {onMove && curIdx > 0 && (
            <button type="button" onClick={() => onMove("left")} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition z-10">
              <ChevronLeft size={20} />
            </button>
          )}
          <img
            src={images[curIdx]?.file ? URL.createObjectURL(images[curIdx].file!) : images[curIdx]?.image_url ? getOriginalUrl(images[curIdx].image_url!) : "https://via.placeholder.com/300"}
            className="object-contain w-full h-full rounded-lg" alt="Preview"
          />
          {onMove && curIdx < images.length - 1 && (
            <button type="button" onClick={() => onMove("right")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition z-10">
              <ChevronRight size={20} />
            </button>
          )}
          <button type="button" onClick={() => onDelete(curIdx)} className="absolute top-2 right-2 p-2 text-white bg-red-500 rounded-full shadow-md hover:bg-red-600 transition">
            <Trash2 size={14} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded font-medium">
            {curIdx + 1} / {images.length}
          </div>
        </div>
        {/* Thumbnail strip */}
        <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
          {images.map((img: any, idx: number) => (
            <button key={idx} type="button" draggable onDragStart={(e) => onDragStart?.(e, idx)} onDragOver={(e) => onDragOver?.(e, idx)} onDrop={(e) => onDrop?.(e, idx)} onClick={() => setIdx(idx)}
              className={`relative flex-shrink-0 w-14 h-14 rounded-lg transition-all cursor-grab active:cursor-grabbing  ${curIdx === idx ? "ring-2 ring-blue-500 ring-offset-2 scale-105 ml-2" : "opacity-60 hover:opacity-100"}`}>
              <img src={img.file ? URL.createObjectURL(img.file) : img.image_url ? getOriginalUrl(img.image_url) : "https://via.placeholder.com/150"} className="object-cover w-full h-full rounded-lg pointer-events-none" />
            </button>
          ))}
          <button type="button" onClick={onUpload} className="flex items-center justify-center flex-shrink-0 w-14 h-14 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition">
            <Plus size={20} className="text-gray-400" />
          </button>
        </div>
      </div>
    ) : (
      <div onClick={onUpload} className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 group transition">
        <Plus size={32} className="text-blue-400 mb-2" />
        <p className="text-sm font-medium text-gray-700 group-hover:text-blue-600">Klik untuk unggah gambar</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, JPEG up to 5MB</p>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-3xl p-6 bg-white rounded-xl">

        <div className="mb-6 text-sm font-semibold">
          {mode === "create" ? "Tambah Product" : "Ubah Product"}
        </div>

        <div className="flex flex-col max-h-[85vh]">

          {/* STEP INDICATOR */}
          <div className="flex justify-between mb-6 text-sm font-medium">
            {[{ id: 1, label: "Informasi Dasar" }, { id: 2, label: "Harga & Variasi" }, { id: 3, label: "Media & Status" }].map((item) => (
              <div key={item.id} className={`flex items-center gap-2 ${step === item.id ? "text-blue-600" : "text-gray-400"}`}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border ${step === item.id ? "border-blue-600 bg-blue-50" : "border-gray-300"}`}>
                  {`0${item.id}`}
                </div>
                <span className="hidden sm:inline">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 pr-1 overflow-y-auto">

            {/* ==================== STEP 1 ==================== */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-lg font-semibold">Informasi Dasar Produk</div>

                {/* Kategori */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Kategori <span className="text-red-500">*</span></label>
                  <select id="category_id" value={form.category_id} onChange={(e) => handleChange("category_id", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.category_id ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {errors.category_id && <p className="mt-1 text-xs text-red-500">{errors.category_id}</p>}
                </div>

                {/* Nama Produk */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Nama Produk <span className="text-red-500">*</span></label>
                  <input id="name" type="text" value={form.name} onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.name ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                {/* Deskripsi */}
                <div>
                  <label className="block mb-1 text-sm font-medium">Deskripsi</label>
                  <textarea id="description" value={form.description} onChange={(e) => handleChange("description", e.target.value)}
                    className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg" />
                </div>

                {/* PC Spec */}
                {isPCComponent && (
                  <div className="pt-4 border-t">
                    <div className="mb-4 font-semibold text-sm">Spesifikasi PC Builder</div>
                    <div className="grid grid-cols-2 gap-4">
                      {(isProcessor || isMotherboard) && (
                        <div>
                          <label className="block mb-1 text-sm font-medium">Socket Type</label>
                          <input type="text" placeholder="AM4, LGA1700" value={form.socket_type}
                            onChange={(e) => handleChange("socket_type", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                      )}
                      {(isMotherboard || isRam) && (
                        <div>
                          <label className="block mb-1 text-sm font-medium">RAM Type</label>
                          <input type="text" placeholder="DDR4, DDR5" value={form.ram_type}
                            onChange={(e) => handleChange("ram_type", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Inventory */}
                <div className="pt-4 border-t">
                  <div className="mb-4 font-semibold text-sm">Informasi Inventory</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-sm font-medium">Warranty</label>
                      <input type="text" placeholder="1 Tahun" value={form.warranty}
                        onChange={(e) => handleChange("warranty", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  </div>
                </div>

                {/* TOGGLE VARIASI */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div>
                      <div className="text-sm font-semibold text-gray-800">Produk ini punya variasi?</div>
                      <div className="text-xs text-gray-500 mt-0.5">Misal: Warna, Kapasitas, Tipe, dll</div>
                    </div>
                    <button type="button"
                      onClick={() => {
                        handleChange("has_variants", !form.has_variants);
                        if (!form.has_variants && form.variants.length === 0) addVariant();
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${form.has_variants ? "bg-blue-600" : "bg-gray-300"}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${form.has_variants ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>

                  {/* Input nama tipe variasi */}
                  {form.has_variants && (
                    <div className="mt-4">
                      <label className="block mb-1 text-sm font-medium">
                        <Tag size={13} className="inline mr-1" />
                        Nama Tipe Variasi <span className="text-red-500">*</span>
                      </label>
                      <input id="variant_type_name" type="text" placeholder="Contoh: Warna, Kapasitas, Tipe..."
                        value={form.variant_type_name}
                        onChange={(e) => handleChange("variant_type_name", e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg ${errors.variant_type_name ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                      {errors.variant_type_name && <p className="mt-1 text-xs text-red-500">{errors.variant_type_name}</p>}
                      <p className="text-xs text-gray-400 mt-1">Ini akan jadi label kolom di tabel variasi, misal "Warna" → "Merah, Biru, Hitam"</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== STEP 2 ==================== */}
            {step === 2 && (
              <div className="space-y-4">

                {/* MODE TANPA VARIASI */}
                {!form.has_variants && (
                  <>
                    <div className="text-lg font-semibold">Harga & Stock</div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-xs font-medium">Harga Normal <span className="text-red-500">*</span></label>
                        <div className={`flex overflow-hidden border rounded-lg ${errors.price_normal ? "border-red-500 bg-red-50" : "border-gray-300"}`}>
                          <div className="flex items-center px-3 text-xs bg-gray-100">Rp</div>
                          <input id="price_normal" type="text" value={formatRupiah(form.price_normal || "")}
                            onChange={(e) => handleChange("price_normal", parseRupiah(e.target.value))}
                            className="w-full px-3 py-1.5 text-sm outline-none bg-transparent" />
                        </div>
                        {errors.price_normal && <p className="mt-1 text-xs text-red-500">{errors.price_normal}</p>}
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium">Harga Diskon</label>
                        <div className="flex overflow-hidden border border-gray-300 rounded-lg">
                          <div className="flex items-center px-3 text-xs bg-gray-100">Rp</div>
                          <input type="text" value={formatRupiah(form.price_discount || "")}
                            onChange={(e) => handleChange("price_discount", parseRupiah(e.target.value))}
                            className="w-full px-3 py-1.5 text-sm outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs font-medium">Stock <span className="text-red-500">*</span></label>
                        <input id="stock" type="number" min="0" value={form.stock !== null ? form.stock : ""}
                          onChange={(e) => handleChange("stock", e.target.value === "" ? "" : Number(e.target.value))}
                          className={`w-full px-3 py-1.5 text-sm border rounded-lg outline-none ${errors.stock ? "border-red-500 bg-red-50" : "border-gray-300"}`} />
                        {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium">SKU Seller</label>
                      <input type="text" value={form.sku_seller}
                        onChange={(e) => handleChange("sku_seller", e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg outline-none" />
                    </div>
                    <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="text-xs text-gray-500">Harga Final</div>
                      <div className="text-lg font-semibold text-blue-700">Rp {finalPrice.toLocaleString()}</div>
                    </div>
                  </>
                )}

                {/* MODE VARIASI — tabel */}
                {form.has_variants && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold">Daftar Variasi</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          Tipe: <span className="font-semibold text-blue-600">{form.variant_type_name || "—"}</span>
                        </div>
                      </div>
                      <button type="button" onClick={addVariant}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
                        <Plus size={14} /> Tambah Variasi
                      </button>
                    </div>

                    {errors.variants && <p id="variants" className="text-xs text-red-500">{errors.variants}</p>}

                    {form.variants.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400">
                        <Tag size={32} className="mb-2 opacity-30" />
                        <p className="text-sm">Belum ada variasi. Klik "Tambah Variasi"</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Header tabel */}
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 rounded-lg">
                          <div className="col-span-3">{form.variant_type_name || "Variasi"}</div>
                          <div className="col-span-2">Harga Normal</div>
                          <div className="col-span-2">Diskon</div>
                          <div className="col-span-2">Final</div>
                          <div className="col-span-2">Stock</div>
                          <div className="col-span-1"></div>
                        </div>

                        {form.variants.map((v: any, idx: number) => {
                          const vFinal = Math.max(0, (v.price_normal || 0) - (v.price_discount || 0));
                          return (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center px-3 py-3 border border-gray-100 rounded-xl hover:border-blue-200 transition bg-white">
                              {/* Nama Variasi */}
                              <div className="col-span-3">
                                <input id={`variant_${idx}_name`} type="text" placeholder={`Misal: Merah`}
                                  value={v.variant_name}
                                  onChange={(e) => updateVariant(idx, "variant_name", e.target.value)}
                                  className={`w-full px-2 py-1.5 text-sm border rounded-lg outline-none ${errors[`variant_${idx}_name`] ? "border-red-400 bg-red-50" : "border-gray-200"} focus:border-blue-400`} />
                                {errors[`variant_${idx}_name`] && <p className="text-[10px] text-red-500 mt-0.5">{errors[`variant_${idx}_name`]}</p>}
                              </div>
                              {/* Harga Normal */}
                              <div className="col-span-2">
                                <div className={`flex overflow-hidden border rounded-lg text-xs ${errors[`variant_${idx}_price`] ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                                  <span className="px-1.5 py-1.5 bg-gray-50 text-gray-400 text-[10px]">Rp</span>
                                  <input id={`variant_${idx}_price`} type="text" value={formatRupiah(v.price_normal || "")}
                                    onChange={(e) => updateVariant(idx, "price_normal", parseRupiah(e.target.value))}
                                    className="w-full px-1.5 py-1.5 text-xs outline-none bg-transparent" />
                                </div>
                                {errors[`variant_${idx}_price`] && <p className="text-[10px] text-red-500 mt-0.5">{errors[`variant_${idx}_price`]}</p>}
                              </div>
                              {/* Diskon */}
                              <div className="col-span-2">
                                <div className="flex overflow-hidden border border-gray-200 rounded-lg text-xs">
                                  <span className="px-1.5 py-1.5 bg-gray-50 text-gray-400 text-[10px]">Rp</span>
                                  <input type="text" value={formatRupiah(v.price_discount || "")}
                                    onChange={(e) => updateVariant(idx, "price_discount", parseRupiah(e.target.value))}
                                    className="w-full px-1.5 py-1.5 text-xs outline-none" />
                                </div>
                              </div>
                              {/* Final */}
                              <div className="col-span-2">
                                <div className="px-2 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg text-center">
                                  {vFinal.toLocaleString("id-ID")}
                                </div>
                              </div>
                              {/* Stock */}
                              <div className="col-span-2">
                                <input type="number" min="0" value={v.stock}
                                  onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
                              </div>
                              {/* Hapus */}
                              <div className="col-span-1 flex justify-center">
                                <button type="button" onClick={() => removeVariant(idx)}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              {/* SKU per variasi */}
                              <div className="col-span-12 mt-1">
                                <input type="text" placeholder="SKU Seller (opsional)"
                                  value={v.sku_seller || ""}
                                  onChange={(e) => updateVariant(idx, "sku_seller", e.target.value)}
                                  className="w-full px-2 py-1 text-xs border border-gray-100 bg-gray-50 rounded-lg outline-none focus:border-blue-300" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ==================== STEP 3 ==================== */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="pb-2 text-lg font-semibold border-b border-gray-100">Media & Status Produk</div>

                {/* Hidden file inputs */}
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                <input type="file" accept="image/*" ref={variantFileInputRef} onChange={handleVariantImageUpload} className="hidden" />

                {/* GALERI TANPA VARIASI */}
                {!form.has_variants && (
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">Galeri Produk</label>
                    {renderGallery(
                      form.images,
                      () => fileInputRef.current?.click(),
                      async (idx) => {
                        const image = form.images[idx];
                        if (!confirm("Hapus gambar ini?")) return;
                        try {
                          if (image.id) await deleteProductImage(image.id);
                          const updated = [...form.images];
                          updated.splice(idx, 1);
                          handleChange("images", updated);
                          setCurrentImageIndex((prev) => Math.min(prev, updated.length - 1));
                        } catch { alert("Gagal menghapus gambar"); }
                      },
                      moveImage,
                      currentImageIndex,
                      setCurrentImageIndex,
                      handleDragStart,
                      handleDragOver,
                      handleDrop,
                    )}
                  </div>
                )}

                {/* GALERI PER VARIASI */}
                {form.has_variants && (
                  <div>
                    <label className="block mb-3 text-sm font-medium text-gray-700">Gambar per Variasi</label>

                    {form.variants.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        Tambahkan variasi di step sebelumnya terlebih dahulu
                      </div>
                    ) : (
                      <div className="flex gap-4">
                        {/* Sidebar pilih variasi */}
                        <div className="w-36 flex-shrink-0 space-y-1.5">
                          {form.variants.map((v: any, idx: number) => (
                            <button key={idx} type="button"
                              onClick={() => { setActiveVariantIndex(idx); setCurrentImageIndex(0); }}
                              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition border ${
                                activeVariantIndex === idx
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                              }`}>
                              <div className="truncate">{v.variant_name || `Variasi ${idx + 1}`}</div>
                              <div className={`text-[10px] mt-0.5 ${activeVariantIndex === idx ? "text-blue-200" : "text-gray-400"}`}>
                                {v.images?.length || 0} foto
                              </div>
                            </button>
                          ))}
                        </div>

                        {/* Area galeri variasi aktif (🔥🔥 FIX DRAG AND DROP DITAMBAHKAN DISINI) */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest">
                            Foto: {form.variants[activeVariantIndex]?.variant_name || `Variasi ${activeVariantIndex + 1}`}
                          </div>
                          {renderGallery(
                            form.variants[activeVariantIndex]?.images || [],
                            () => variantFileInputRef.current?.click(),
                            (imgIdx) => removeVariantImage(activeVariantIndex, imgIdx),
                            moveVariantImage,         // <--- FIX GESER PANAH
                            currentImageIndex,        // <--- FIX STATE AKTIF
                            setCurrentImageIndex,     // <--- FIX KLIK FOTO
                            handleVariantDragStart,   // <--- FIX DRAG & DROP
                            handleVariantDragOver,
                            handleVariantDrop
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Status */}
                <div className="pt-4 border-t border-gray-100">
                  <label className="block mb-4 text-sm font-medium text-gray-700">Pengaturan Status</label>
                  <div className="flex flex-col gap-3">
                    {[
                      { field: "is_active", label: "Status Aktif", desc: "Produk akan ditampilkan ke pembeli", color: "bg-blue-600" },
                      { field: "is_popular", label: "Produk Populer", desc: "Tampilkan di halaman utama (Trending)", color: "bg-amber-500" },
                    ].map(({ field, label, desc, color }) => (
                      <div key={field} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-800">{label}</div>
                          <div className="text-xs text-gray-500">{desc}</div>
                        </div>
                        <button type="button" onClick={() => handleChange(field, !(form as any)[field])}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${(form as any)[field] ? color : "bg-gray-300"}`}>
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${(form as any)[field] ? "translate-x-5" : "translate-x-0"}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* ============================================================ */}
          {/* NAVIGASI (🔥🔥 FIX LAYOUT FIXED DI SEMUA STEP) */}
          {/* ============================================================ */}
          <div className="flex flex-col gap-3 mt-4 pt-4 border-t bg-white">
            {/* Baris Atas: Tombol Step Navigasi */}
            <div className="flex items-center justify-between w-full">
              <div>
                {step > 1 ? (
                  <button onClick={prevStep} className="px-4 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                    ← Sebelumnya
                  </button>
                ) : <span />}
              </div>
              <div>
                {step < 3 && (
                  <button onClick={nextStep} className="px-4 py-1.5 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-medium">
                    Selanjutnya →
                  </button>
                )}
              </div>
            </div>

            {/* Baris Bawah: Tombol Action (Selalu Muncul) */}
            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition">
                Batal
              </button>
              <button onClick={handleSimpan} className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm">
                Simpan
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}