import { useState, useEffect, useRef } from "react";

export default function ServerBusyPage() {
  const [loading, setLoading] = useState(false);
  const isRedirecting = useRef(false);

  const checkServer = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE}/api/v1`, {
        method: "GET",
      });

      if (!isRedirecting.current) {
        isRedirecting.current = true;
        window.location.href = "/";
      }
    } catch {
      // masih down → diem aja
    }
  };

  // 🔥 AUTO CHECK TIAP 5 DETIK
  useEffect(() => {
    const interval = setInterval(() => {
      checkServer();
    }, 5000);

    return () => clearInterval(interval); // cleanup
  }, []);

  // 🔥 MANUAL RETRY
  const handleRetry = async () => {
    setLoading(true);

    try {
      await checkServer();
    } catch (err) {
      console.error(err);
      alert("Server masih belum tersedia, coba lagi ya.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">

        <div className="text-6xl mb-4">⚠️</div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Server Sedang Sibuk
        </h1>

        <p className="text-gray-500 text-sm mb-6">
          Maaf, server sedang tidak dapat diakses.
          <br />
          Kemungkinan sedang maintenance atau koneksi terputus.
        </p>

        <button
          onClick={handleRetry}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Mengecek..." : "Coba Lagi"}
        </button>

        {/* optional indicator */}
        <div className="mt-4 text-xs text-gray-400">
          Mengecek koneksi otomatis setiap 5 detik...
        </div>
      </div>
    </div>
  );
}