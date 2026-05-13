import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { getPricelists } from "../../services/pricelistService";
import type { Pricelist, PricelistType } from "../../services/pricelistService";
import Breadcrumb from "../../components/Breadcrumb";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

import workerSrc from "pdfjs-dist/build/pdf.worker.min?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const BASE_URL_PDF = `${import.meta.env.VITE_API_BASE}/uploads/pricelists`;

export default function PublicPricelistPage() {
    const [pricelists, setPricelists] = useState<Pricelist[]>([]);
    const [activeType, setActiveType] = useState<PricelistType>("laptop");
    const [numPages, setNumPages] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricelists = async () => {
            try {
                const data = await getPricelists();
                setPricelists(data);
            } catch (err) {
                console.error("Gagal mengambil pricelist", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPricelists();
    }, []);

    const currentPricelist = pricelists.find(p => p.type === activeType);
    const pdfUrl = currentPricelist ? `${BASE_URL_PDF}/${currentPricelist.file_path}` : null;

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
    }

    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    if (loading) return <div className="flex justify-center items-center h-screen">Memuat Katalog...</div>;

    return (
        <div>
            {/* ================= BREADCRUMB BAR ================= */}
            <div className="w-full bg-white">
                <div className="h-14 flex items-center px-8">
                    <div className="w-ful items-center">
                        <Breadcrumb
                            items={[
                                { label: "Home", path: "/" },
                                { label: "Pricelist" },
                            ]}
                        />
                    </div>
                </div>
            </div>

            <div className="min-h-screen py-10 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Pricelist Anandam</h1>
                    
                    {/* INFO LAST UPDATED */}
                    {currentPricelist && (
                        <p className="text-sm text-gray-500 mb-8 italic">
                            Terakhir diperbarui: <span className="font-semibold text-blue-600">
                                {formatDate(currentPricelist.updated_at)}
                            </span>
                        </p>
                    )}

                    {/* Tab Switcher */}
                    <div className="flex justify-center gap-4 mb-10">
                        {["laptop", "komponen"].map((type) => (
                            <button
                                key={type}
                                onClick={() => {
                                    setActiveType(type as PricelistType);
                                    setNumPages(0);
                                }}
                                className={`px-8 py-2 rounded-md font-bold transition-all ${
                                    activeType === type 
                                    ? "bg-blue-600 text-white shadow-md" 
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
                                }`}
                            >
                                {type.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex justify-center">
                    {pdfUrl ? (
                        <div className="w-full max-w-5xl h-[80vh] bg-white shadow-xl border rounded-lg overflow-hidden">
                        <iframe
                            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                            className="w-full h-full"
                        />
                        </div>
                    ) : (
                        <div className="p-20 bg-white rounded-xl shadow-md border border-gray-300 text-gray-400">
                        Pricelist tidak ditemukan.
                        </div>
                    )}
                    </div>
                </div>
            </div>
        </div> 
    );
}