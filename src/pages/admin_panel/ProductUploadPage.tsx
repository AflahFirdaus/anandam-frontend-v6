import { useState, useRef, useEffect } from "react";
import { downloadTemplate } from "../../services/productImportService";
import { FileDown, HelpCircle, X } from "lucide-react";
import { useGlobalImport } from "../../components/admin/NotificationUpdateUpload";
import { getCategories } from "../../services/adminCategoryService";

export default function ProductUploadPage() {
  const { startUpload, isUploading } = useGlobalImport();

  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  // 🔥 State untuk Modal Panduan
  const [isHintOpen, setIsHintOpen] = useState(false);

  // Fetch kategori untuk mapping pesan error dari backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Gagal load kategori", err);
      }
    };
    fetchCategories();
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Pilih file dulu");

    // Jalankan upload via global context
    await startUpload(file, categories);

    // Reset local file state agar UI bersih
    setFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (isUploading) return; // Prevent drop saat lagi proses upload
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xlsx")) {
      setFile(droppedFile);
    } else {
      alert("File harus format .xlsx");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-10 relative">
      {/* Note: Error Modal dan Success Notification sekarang dirender 
          oleh GlobalImportProvider di level layout 
      */}

      {/* ================= MODAL PANDUAN ================= */}
      {isHintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-md w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-5 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600" />
                Panduan Upload Produk
              </h2>
              <button 
                onClick={() => setIsHintOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded-md hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  "Download template Excel terlebih dahulu.",
                  "Isi data produk utama dan variasi pertama di satu baris penuh.",
                  <span key="var-add"><b>Variasi Tambahan:</b> Tambahkan di baris bawahnya. Kosongkan kolom Nama Produk dll, cukup isi detail variasinya (Harga, Stok, SKU).</span>,
                  "Upload kembali file Excel.",
                  "Sistem akan memproses upload produk di background.",
                ].map((text, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="w-6 font-semibold text-blue-600 flex-shrink-0">{i + 1}.</span>
                    <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>

              {/* Info Box Tambahan biar makin jelas */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-[12px] text-blue-800 leading-relaxed">
                  <b>Note:</b><br/>
                  • <b>SKU Seller</b> wajib diisi untuk setiap baris produk maupun variasi.<br/>
                  • <b>Gambar Utama:</b> Isi link gambar di kolom <code className="bg-blue-100 px-1 rounded-md">image_1</code> s/d <code className="bg-blue-100 px-1 rounded-md">image_10</code> pada baris produk utama.<br/>
                  • <b>Gambar Variasi:</b> Jika variasi punya gambar khusus, isi link gambarnya di kolom <code className="bg-blue-100 px-1 rounded-md">image_1</code> pada baris variasi tersebut.
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsHintOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Upload Massal Produk</h1>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-[1fr_340px] gap-10">
        
        {/* ================= LEFT UPLOAD ================= */}
        <div className="space-y-6">
          
          {/* ================= DROPZONE ================= */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => !isUploading && setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-md
              flex flex-col items-center justify-center
              p-32 text-center transition
              ${
                dragging
                  ? "border-green-600 bg-green-50"
                  : "border-gray-300 bg-white"
              }
              ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <p className="text-xl font-medium text-gray-600">
              Drag & Drop File Excel
            </p>
            <p className="text-gray-400 my-2">atau</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              disabled={isUploading}
            >
              Browse Files
            </button>

            {file && (
              <p className="mt-4 text-sm text-gray-700 font-semibold">
                {file.name}
              </p>
            )}

            <input
              key={file ? file.name : "empty"}
              type="file"
              accept=".xlsx"
              ref={inputRef}
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f && f.name.endsWith(".xlsx")) {
                  setFile(f);
                } else if (f) {
                  alert("File harus format .xlsx");
                }
              }}
            />
          </div>

          {/* ================= STATUS IN PAGE (Mirroring Global State) ================= */}
          {(file || isUploading) && (
            <div className="p-5 border rounded-md bg-white shadow-sm transition-all">
              <div className="text-sm">
                <span className="font-medium text-gray-700">
                  {isUploading
                    ? "Sedang memproses upload di server... (boleh pindah halaman)"
                    : file?.name}
                </span>
              </div>
            </div>
          )}

          {/* ================= START BUTTON ================= */}
          {file && !isUploading && (
            <button
              onClick={handleUpload}
              className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 shadow-sm transition-all"
            >
              Upload Produk
            </button>
          )}
        </div>

        {/* ================= PANEL MENU (Kanan) ================= */}
        <div className="sticky top-10 h-fit">
          <div className="bg-white border rounded-md p-6 shadow-sm">
            <h2 className="font-semibold text-lg mb-4">Aksi Template</h2>
            
            {/* Tombol Buka Modal Panduan */}
            <button
              onClick={() => setIsHintOpen(true)}
              className="w-full mb-6 flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-md transition font-medium"
            >
              <HelpCircle size={16} /> Cara Upload Produk
            </button>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Template Excel</p>
              <button
                onClick={downloadTemplate}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                <FileDown size={16} /> Download Template
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}