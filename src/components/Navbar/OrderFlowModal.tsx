import { useEffect, useState } from "react";
import { Workflow, X, CheckCircle2, MessageCircleQuestion, ReceiptText } from "lucide-react";

interface OrderFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderFlowModal({ isOpen, onClose }: OrderFlowModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  // Efek untuk reset state isClosing saat modal dibuka lagi
  useEffect(() => {
    if (isOpen) setIsClosing(false);
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Durasi ini harus sama dengan durasi animasi exit di CSS
  };

  if (!isOpen && !isClosing) return null;

  const steps = [
    { 
      step: 1, 
      icon: <Workflow size={16} />, 
      title: "Pilih Produk", 
      text: "Cari produk melalui Home, Kategori, atau fitur Cari Produk." 
    },
    { 
      step: 2, 
      icon: <MessageCircleQuestion size={16} />, 
      title: "Tanya-Tanya (Opsional)", 
      text: "Bingung? Klik 'Tanya Produk' di halaman detail untuk chat langsung ke Admin." 
    },
    { 
      step: 3, 
      icon: <CheckCircle2 size={16} />, 
      title: "Tentukan Pilihan", 
      text: "Pilih jumlah (Qty) dan variasi yang diinginkan sesuai stok." 
    },
    { 
      step: 4, 
      icon: <ReceiptText size={16} />, 
      title: "Checkout / Beli Langsung", 
      text: "Klik 'Beli Langsung' atau melalui Keranjang untuk membuat Invoice otomatis." 
    },
    { 
      step: 6, 
      icon: <CheckCircle2 size={16} />, 
      title: "Pembayaran & Pengiriman", 
      text: "Bayar via Transfer atau COD sesuai instruksi Admin, lalu barang dikirim." 
    }
  ];

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 transition-all duration-300
        ${isClosing ? "opacity-0" : "opacity-100"}`}
      onClick={handleClose}
    >
      <div 
        className={`relative bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden
          ${isClosing ? "animate-zoom-out-smooth" : "animate-zoom-in-smooth"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="bg-primary p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-md">
              <Workflow size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">Alur Pemesanan</h3>
              <p className="text-[9px] font-medium opacity-70 uppercase tracking-widest">Anandam Computer ID</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="hover:bg-white/20 p-2 rounded-md transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* BODY */}
        <div className="p-6">
          <div className="grid grid-cols-1 gap-5">
            {steps.map((item) => (
              <div key={item.step} className="flex gap-4 group">
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-md bg-gray-50 text-primary flex items-center justify-center font-bold text-xs border border-gray-100 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    {item.step}
                  </div>
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight flex items-center gap-2">
                    {item.step === 5 ? <span className="text-green-500 italic">via WhatsApp</span> : item.title}
                  </h4>
                  <p className="text-[12px] text-gray-500 leading-relaxed font-medium">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER ACTION */}
          <div className="mt-8 pt-6 border-t border-gray-50">
            <button 
              onClick={handleClose}
              className="w-full bg-primary text-white py-3.5 rounded-md font-bold text-xs uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-lg shadow-primary/10 active:scale-[0.98]"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes zoomInSmooth {
          from { opacity: 0; transform: scale(0.95) translateY(15px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes zoomOutSmooth {
          from { opacity: 1; transform: scale(1) translateY(0); }
          to { opacity: 0; transform: scale(0.95) translateY(15px); }
        }
        .animate-zoom-in-smooth {
          animation: zoomInSmooth 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-zoom-out-smooth {
          animation: zoomOutSmooth 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}