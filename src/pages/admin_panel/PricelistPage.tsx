import { useEffect, useState } from "react";
import {
  getPricelists,
  uploadPricelist,
} from "../../services/pricelistService";
import type {
  Pricelist,
  PricelistType,
} from "../../services/pricelistService";
import { Upload, Laptop, Cpu } from "lucide-react";

const BASE_FILE_URL =
  `${import.meta.env.VITE_API_BASE}/uploads/pricelists`;

export default function AdminPricelistPage() {
  const [data, setData] = useState<Pricelist[]>([]);
  const [activeType, setActiveType] =
    useState<PricelistType>("laptop");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchData = async () => {
    try {
      const res = await getPricelists();
      setData(res);
    } catch {
      setError("Gagal mengambil pricelist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      await uploadPricelist(activeType, selectedFile);
      setSelectedFile(null);
      await fetchData();
      alert("Upload berhasil");
    } catch {
      alert("Upload gagal");
    } finally {
      setUploading(false);
    }
  };

  const activeFile = data.find(
    (item) => item.type === activeType
  );

  if (loading)
    return <div className="p-10">Loading...</div>;

  if (error)
    return <div className="p-10 text-red-500">{error}</div>;

  return (
    <div className="flex items-start gap-10 p-10">
      {/* LEFT SIDE - PDF VIEWER */}
      <div className="flex-1">
        {activeFile ? (
          <iframe
            src={`${BASE_FILE_URL}/${activeFile.file_path}`}
            title="Pricelist PDF"
            className="w-full h-[650px] border border-gray-200 rounded-2xl shadow-sm"
          />
        ) : (
          <div className="text-gray-500">
            Pricelist tidak tersedia
          </div>
        )}
      </div>

      {/* RIGHT SIDE - CONTROL PANEL */}
      <div className="w-[340px] border border-gray-200 rounded-2xl p-6 shadow-sm bg-white flex flex-col gap-8">
        {/* Toggle Type */}
        <div>
          <p className="mb-4 font-semibold">
            Pilih Tipe
          </p>

          <div className="flex p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setActiveType("laptop")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition ${
                activeType === "laptop"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Laptop size={16} />
              Laptop
            </button>

            <button
              onClick={() => setActiveType("komponen")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition ${
                activeType === "komponen"
                  ? "bg-black text-white"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Cpu size={16} />
              Komponen
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div>
          <p className="mb-4 font-semibold">
            Upload Pricelist
          </p>

          <label className="flex items-center gap-3 p-3 transition border border-gray-400 border-dashed cursor-pointer rounded-xl hover:bg-gray-50">
            <Upload size={18} />
            <span className="text-sm text-gray-600 truncate">
              {selectedFile
                ? selectedFile.name
                : "Pilih file PDF"}
            </span>

            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files
                    ? e.target.files[0]
                    : null
                )
              }
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`mt-4 w-full h-10 rounded-xl text-sm font-medium text-white transition ${
              uploading || !selectedFile
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black hover:bg-gray-800"
            }`}
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}