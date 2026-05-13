import { useLocation, useNavigate } from "react-router-dom";
import Breadcrumb from "../../components/Breadcrumb";
import { Printer, ChevronLeft } from "lucide-react";

export default function PCBuilderPreviewPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { parts, grandTotal } = location.state || { parts: [], grandTotal: 0 };

    if (!parts || parts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Belum ada komponen terpilih</h2>
                <button 
                    onClick={() => navigate("/pc-builder")}
                    className="bg-primary text-white px-6 py-2 rounded-md font-bold uppercase tracking-widest text-xs"
                >
                    Kembali ke PC Builder
                </button>
            </div>
        );
    }

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* BREADCRUMB - Hidden on Print */}
            <div className="w-full bg-white border-b border-gray-100 no-print">
                <div className="max-w-7xl mx-auto h-12 flex items-center px-4 lg:px-8">
                    <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Rakit PC", path: "/pc-builder" }, { label: "Preview" }]} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* HEADER - Hidden on Print */}
                <div className="flex justify-between items-center mb-6 no-print">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate("/pc-builder")}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ChevronLeft size={20} className="text-gray-900" />
                        </button>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-tight">Preview Rakitan</h1>
                            <p className="hidden md:block text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Review Spesifikasi & Estimasi Biaya</p>
                        </div>
                    </div>
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-5 py-2.5 rounded-md hover:bg-primary/20 transition-all border border-primary/20"
                    >
                        <Printer size={14} />
                        Cetak
                    </button>
                </div>

                {/* WATERMARK / PRICE NOTE - ALWAYS VISIBLE */}
                <div className="mb-2 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                    <p className="text-[10px] md:text-[11px] text-blue-800 font-bold uppercase tracking-widest text-center leading-relaxed">
                        Harga adalah harga update ({new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}), jika ada perubahan harga maka perlu dikomunikasikan dan dihitung kembali.
                    </p>
                </div>

                {/* WARNING NOTE - DANGER/ACTION BLUE */}
                <div className="mb-5 p-2 bg-indigo-600 border border-indigo-700 rounded-lg shadow-md">
                    <p className="text-[10px] md:text-[11px] text-white font-bold uppercase tracking-widest text-center leading-relaxed">
                        Ini hanyalah preview, jika keluar halaman maka akan hilang. segera screenshot!!
                    </p>
                </div>

                {/* PRINTABLE AREA START */}
                <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden print:border-0 print:shadow-none">
                    {/* Print Header */}
                    <div className="p-6 border-b border-gray-100 flex justify-between items-end">
                        <div className="hidden print:block text-left">
                            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Anandam Computer</h1>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Estimasi Rakitan PC</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tanggal</p>
                            <p className="text-sm font-bold text-gray-800">{new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* DESKTOP TABLE VIEW - Hidden on small mobile screens, shown on print and MD up */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Komponen</th>
                                    <th className="w-2/5 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Produk</th>
                                    <th className="w-1/12 px-2 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qty</th>
                                    <th className="w-1/6 px-4 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Harga</th>
                                    <th className="w-1/6 px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parts.map((p: any, index: number) => {
                                    const subtotal = p.item.final_price * p.qty;
                                    return (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-5 align-top">
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-tight bg-primary/5 px-2 py-1 rounded">
                                                    {p.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <p className="text-sm font-bold text-gray-800 leading-relaxed whitespace-normal break-words">
                                                    {p.item.name}
                                                </p>
                                            </td>
                                            <td className="px-2 py-5 text-center align-top">
                                                <span className="text-sm font-bold text-gray-700">{p.qty}</span>
                                            </td>
                                            <td className="px-4 py-5 text-right align-top">
                                                <p className="text-[10px] text-gray-400 line-through">
                                                    {p.item.price_discount ? p.item.price_normal.toLocaleString("id-ID") : ""}
                                                </p>
                                                <p className="text-sm font-bold text-gray-800">
                                                    {p.item.final_price.toLocaleString("id-ID")}
                                                </p>
                                            </td>
                                            <td className="px-6 py-5 text-right align-top">
                                                <p className="text-sm font-bold text-primary">
                                                    {subtotal.toLocaleString("id-ID")}
                                                </p>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* MOBILE CARD VIEW - Shown only on small screens, hidden on print and MD up */}
                    <div className="md:hidden divide-y divide-gray-100 print:hidden">
                        {parts.map((p: any, index: number) => {
                            const subtotal = p.item.final_price * p.qty;
                            return (
                                <div key={index} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[9px] font-bold text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded">
                                            {p.label}
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                            x{p.qty}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 leading-relaxed">
                                        {p.item.name}
                                    </p>
                                    <div className="flex justify-between items-end pt-1">
                                        <div className="text-left">
                                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Harga Unit</p>
                                            <p className="text-xs font-bold text-gray-600">{p.item.final_price.toLocaleString("id-ID")}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Subtotal</p>
                                            <p className="text-sm font-bold text-primary">{subtotal.toLocaleString("id-ID")}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Summary Footer (Both views) */}
                    <div className="bg-gray-50/50 p-6 md:p-8 border-t border-gray-100">
                        <div className="flex justify-between items-center max-w-md ml-auto">
                            <span className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">Grand Total</span>
                            <span className="text-xl md:text-2xl font-bold text-primary">
                                {grandTotal.toLocaleString("id-ID")}
                            </span>
                        </div>
                    </div>

                    {/* PRINT FOOTER NOTE - Limit of Print */}
                    <div className="p-6 border-t border-gray-50 text-center">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            * Harga dapat berubah sewaktu-waktu tergantung stok dan promo yang berlaku.
                        </p>
                    </div>
                </div>
                {/* PRINTABLE AREA END */}

                <div className="mt-8 text-center no-print">
                    <p className="text-[11px] text-gray-300 font-medium italic">
                        "Terima kasih telah mempercayai Anandam Computer"
                    </p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background-color: white !important; -webkit-print-color-adjust: exact; }
                    .print\\:border-0 { border: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:block { display: block !important; }
                    .bg-amber-50 { background-color: #fffbeb !important; }
                    .bg-primary\\/5 { background-color: rgba(37, 99, 235, 0.05) !important; }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    
                    /* Ensure table rows don't break across pages */
                    tr { page-break-inside: avoid; }
                    .md\\:block { display: table !important; width: 100% !important; }
                }
                
                /* Hide print-only elements on screen */
                @media screen {
                    .print-only { display: none; }
                }
            `}</style>
        </div>
    );
}
