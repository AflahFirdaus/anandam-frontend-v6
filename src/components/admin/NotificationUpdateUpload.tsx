import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { updateMassProduct, uploadMassProduct } from "../../services/productImportService";
import { CheckCircle, XCircle, X } from "lucide-react";

interface ErrorModalState {
  message: string;
  errors?: string[];
}

interface ImportContextProps {
  isUpdating: boolean;
  isUploading: boolean;
  showSuccess: boolean;
  errorModal: ErrorModalState | null;
  startUpdate: (file: File, categories: any[]) => Promise<void>;
  startUpload: (file: File, categories: any[]) => Promise<void>;
  closeError: () => void;
  closeSuccess: () => void;
}

const GlobalImportContext = createContext<ImportContextProps | undefined>(undefined);

export const useGlobalImport = () => {
  const context = useContext(GlobalImportContext);
  if (!context) throw new Error("useGlobalImport harus digunakan di dalam GlobalImportProvider");
  return context;
};

export const GlobalImportProvider = ({ children }: { children: ReactNode }) => {
  // State ini dipertahankan hanya untuk me-disable tombol agar user tidak spam klik
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [actionType, setActionType] = useState<"update" | "upload" | null>(null); 
  const [errorModal, setErrorModal] = useState<ErrorModalState | null>(null);
  const [visible, setVisible] = useState(false);

  // ==========================================
  // DENGARKAN SSE DARI BACKEND
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token") || ""; 
    const baseUrl = import.meta.env.VITE_API_BASE;

    const sseUrl = `${baseUrl}/api/v1/product-import/progress?token=${token}`;

    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      const payload = parsed.data?.payload;

      if (payload) {
        if (payload.status === 'SUCCESS') {
          setActionType(payload.action); // 'update' atau 'upload'
          setIsUpdating(false);
          setIsUploading(false);
          
          // Tampilkan notifikasi sukses
          setShowSuccess(true);
          setVisible(true);

          setTimeout(() => {
            setVisible(false);
            setTimeout(() => setShowSuccess(false), 300);
          }, 4000);

        } else if (payload.status === 'ERROR') {
          setActionType(payload.action);
          setIsUpdating(false);
          setIsUploading(false);
          
          // Tampilkan modal error beserta list-nya
          setErrorModal({
            message: "Proses selesai dengan beberapa error:",
            errors: payload.errors
          });
        }
      }
    };

    return () => eventSource.close();
  }, []);

  // Handler untuk error API secara langsung (misal jaringan putus pas kirim file)
  const handleError = (err: any, categories: any[]) => {
    const isTimeout = 
      err.code === 'ECONNABORTED' || 
      err.message === 'Network Error' || 
      err.response?.status === 504 || 
      err.response?.status === 524 ||
      err.response?.status === 502;

    if (isTimeout) {
      setErrorModal({ 
        message: "Koneksi terputus saat mengirim file, tapi proses mungkin masih berjalan di background. Silakan pantau produk kamu.", 
        errors: [] 
      });
      return;
    }

    const message = err.response?.data?.message || "Terjadi kesalahan";
    let rawErrors: string[] = err.response?.data?.errors || [];

    const enhancedErrors = rawErrors.map((errorStr: string) => {
        const foundCategory = categories.find((cat) =>
        errorStr.toLowerCase().includes(cat.name.toLowerCase())
     );
    return foundCategory 
        ? `${errorStr} (Kode: ${foundCategory.code})` 
        : errorStr;
     });
        setErrorModal({ message, errors: enhancedErrors });
  };

  const startUpdate = async (file: File, categories: any[]) => {
    try {
        setIsUpdating(true); // Disable tombol di UI
        setActionType("update");
        setShowSuccess(false);
        setErrorModal(null);

        // Hanya mengirim request, notifikasi diurus oleh SSE
        await updateMassProduct(file);
    } catch (err: any) {
        setIsUpdating(false);
        handleError(err, categories);
    }
  };

  const startUpload = async (file: File, categories: any[]) => {
    try {
      setIsUploading(true); // Disable tombol di UI
      setActionType("upload");
      setShowSuccess(false);
      setErrorModal(null);

      // Hanya mengirim request, notifikasi diurus oleh SSE
      await uploadMassProduct(file);
    } catch (err: any) {
      setIsUploading(false);
      handleError(err, categories);
    }
  };

  return (
    <GlobalImportContext.Provider
      value={{
        isUpdating,
        isUploading,
        showSuccess,
        errorModal,
        startUpdate,
        startUpload,
        closeError: () => setErrorModal(null),
        closeSuccess: () => setShowSuccess(false),
      }}
    >
        {children}

        {/* ================= TOAST NOTIFICATION (HANYA SUKSES) ================= */}
        {showSuccess && (
            <div
                className={`
                fixed top-6 left-1/2 -translate-x-1/2 z-[999]
                w-[360px] bg-white rounded-2xl shadow-xl border p-4
                transition-all duration-300 ease-out
                ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}
                `}
            >
                <div className="flex items-center gap-3 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                    {actionType === "upload" ? "Upload" : "Update"} produk berhasil!
                    </span>
                    <button
                    onClick={() => {
                        setVisible(false);
                        setTimeout(() => setShowSuccess(false), 300);
                    }}
                    className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                    <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

      {/* ================= ERROR MODAL ================= */}
      {errorModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] max-h-[85vh] bg-white rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <XCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">{actionType === 'upload' ? 'Upload' : 'Update'} Gagal</h2>
            </div>

            <p className="text-gray-600 mb-4 font-medium">{errorModal.message}</p>

            <div className="flex-1 overflow-y-auto bg-red-50 rounded-xl p-4 mb-6 border border-red-100">
              {errorModal.errors?.length ? (
                <ul className="space-y-2">
                  {errorModal.errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-700 flex gap-2">
                      <span className="font-bold">•</span> {err}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-500 italic">Tidak ada detail error tambahan.</p>
              )}
            </div>

            <button
              onClick={() => setErrorModal(null)}
              className="w-full py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-semibold"
            >
              Tutup & Perbaiki File
            </button>
          </div>
        </div>
      )}

    </GlobalImportContext.Provider>
  );
};