import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCertificateById } from "../../services/certificateService"
import type { Certificate } from "../../services/certificateService"
import { ArrowLeft, Download } from "lucide-react"

export default function CertificateVerifyPage(){

    const { id } = useParams()

    const [query,setQuery] = useState("")

    const [duplicateResults, setDuplicateResults] = useState<Certificate[]>([])
    const [showDuplicateModal, setShowDuplicateModal] = useState(false)
    const [selectedSchool, setSelectedSchool] = useState("")

    const formatDate = (dateString: string) => {
        if (!dateString) return "-"

        const date = new Date(dateString)

        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    }

    const handleSearch = async () => {

        if(!query) return

        setLoading(true)
        setNotFound(false)
        setDuplicateResults([])
        setShowDuplicateModal(false)
        setSelectedSchool("")

        try{

            const res = await fetch(
            `${import.meta.env.VITE_API_BASE}/api/v1/certificates/search?q=${query}`
            )

            if(!res.ok){
            setCertificate(null)
            setNotFound(true)
            setLoading(false)
            return
            }

            const result = await res.json()

            console.log("SEARCH RESULT:", result)
            console.log("IS ARRAY:", Array.isArray(result))
            console.log("LENGTH:", result?.length)

            if(!result || result.length === 0){
                setCertificate(null)
                setNotFound(true)
            }else if(result.length === 1){
                setCertificate(result[0])
            }else{
                setDuplicateResults(result)
                setShowDuplicateModal(true)
            }

        }catch{
            setCertificate(null)
            setNotFound(true)
        }

        

        setLoading(false)
    }

    const handleSelectSchool = () => {

        const cert = duplicateResults.find(
            (c) => c.id === selectedSchool
        )

        console.log("SELECTED CERT:", cert)

        if(cert){
            setCertificate(cert)
            setShowDuplicateModal(false)
        }
    }

    const handleDownload = async (url: string, filename: string) => {
        try {
            const res = await fetch(url)
            const blob = await res.blob()

            const link = document.createElement("a")
            link.href = window.URL.createObjectURL(blob)
            link.download = filename

            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch {
            alert("Gagal download sertifikat")
        }
    }

    const handleReset = () => {
        setCertificate(null)
        setQuery("")
        setNotFound(false)
    }

    const [certificate,setCertificate] = useState<Certificate | null>(null)
    const [loading,setLoading] = useState(true)
    const [notFound,setNotFound] = useState(false)

    useEffect(() => {

        if (!id) {
            setLoading(false)
            return
        }

        const fetchCertificate = async () => {
            try {
            const data = await getCertificateById(id)
            setCertificate(data)
            } catch {
            setCertificate(null)
            }

            setLoading(false)
        }

        fetchCertificate()

    }, [id])

    if(loading){
        return (
        <div className="flex items-center justify-center h-[60vh]">
            <p className="text-gray-500">Memuat sertifikat...</p>
        </div>
        )
    }

    if(!id && !certificate && !showDuplicateModal){
        return (

            <div className="max-w-xl px-6 py-16 mx-auto">

                <div className="p-8 bg-white border shadow rounded-2xl">

                    <h1 className="mb-6 text-2xl font-bold text-center">
                    Verifikasi Sertifikat
                    </h1>

                    <p className="mb-6 text-sm text-center text-gray-500">
                    Masukkan nama peserta atau nomor sertifikat
                    </p>

                    <div className="flex gap-2">

                        <input
                            type="text"
                            placeholder="Nama atau nomor sertifikat..."
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg"
                        />

                        <button
                            onClick={handleSearch}
                            className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            Cari
                        </button>

                        </div>

                        {notFound && (
                        <p className="mt-4 text-sm text-center text-red-500">
                            Nama atau nomor sertifikat tidak ditemukan
                        </p>
                    )}

                </div>

            </div>
            

        )
    }

    if(id && !certificate){
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
            <h1 className="text-2xl font-bold text-red-500">
                Sertifikat Tidak Valid
            </h1>
            <p className="text-gray-500">
                Sertifikat tidak ditemukan di sistem
            </p>
            </div>
        )
    }

    if (!certificate && showDuplicateModal) {
        return (
            <>
                <div className="min-h-[60vh]"></div>

                {showDuplicateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-xl">

                        <h2 className="text-lg font-semibold text-center">
                            Nama Duplikat Terdeteksi
                        </h2>

                        <p className="mt-2 text-sm text-center text-gray-500">
                            Terdapat lebih dari satu sertifikat dengan nama yang sama.
                            Silakan pilih sekolah untuk menentukan data yang benar.
                        </p>

                        <div className="mt-4">
                            <select
                            value={selectedSchool}
                            onChange={(e)=>setSelectedSchool(e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            >
                            <option value="">Pilih Sekolah</option>

                            {duplicateResults.map((cert)=>(
                                <option key={cert.id} value={cert.id}>
                                    {cert.school} — {cert.certificate_number}
                                </option>
                            ))}

                            </select>
                        </div>

                        <div className="flex justify-end gap-2 mt-5">
                            <button
                            onClick={()=>setShowDuplicateModal(false)}
                            className="px-4 py-2 text-sm border rounded-lg"
                            >
                            Batal
                            </button>

                            <button
                                disabled={!selectedSchool}
                                onClick={handleSelectSchool}
                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg disabled:bg-gray-300"
                            >
                            Lihat Sertifikat
                            </button>
                        </div>

                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <div className="max-w-2xl px-6 py-12 mx-auto">

            {/* SEARCH FORM */}
            {!certificate && !showDuplicateModal && (
                <div className="p-8 bg-white border shadow rounded-2xl">

                    <h1 className="mb-6 text-2xl font-bold text-center">
                        Verifikasi Sertifikat
                    </h1>

                    <p className="mb-6 text-sm text-center text-gray-500">
                        Masukkan nama peserta atau nomor sertifikat
                    </p>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Nama atau nomor sertifikat..."
                            value={query}
                            onChange={(e)=>setQuery(e.target.value)}
                            className="flex-1 px-3 py-2 border rounded-lg"
                        />

                        <button
                            onClick={handleSearch}
                            className="px-5 py-2 text-white bg-blue-600 rounded-lg"
                        >
                            Cari
                        </button>
                    </div>

                    {notFound && (
                        <p className="mt-4 text-sm text-center text-red-500">
                            Nama atau nomor sertifikat tidak ditemukan
                        </p>
                    )}

                </div>
            )}

            {/* CERTIFICATE RESULT */}
            {certificate && (
                <div className="p-8 bg-white border shadow rounded-2xl">

                    <div className="flex items-center mb-4">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 text-sm text-gray-600"
                        >
                            <ArrowLeft size={18}/>
                            Cek Sertifikat Lainnya
                        </button>
                    </div>

                    <h1
                        className={`mb-6 text-2xl font-bold text-center
                            ${
                            certificate.status === "lulus"
                                ? "text-green-600"
                                : certificate.status === "gagal"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }
                        `}
                        >
                        {certificate.status === "lulus"
                            ? "Sertifikat Terverifikasi"
                            : certificate.status === "gagal"
                            ? "Peserta Tidak Lulus"
                            : "Status Sertifikat"}
                    </h1>

                    <div className="space-y-3 text-sm">

                        <div>
                            <b>Nama :</b> {certificate.name}
                        </div>

                        <div>
                            <b>Sekolah :</b> {certificate.school}
                        </div>

                        <div>
                            <b>Nomor Sertifikat :</b> {certificate.certificate_number}
                        </div>

                        <div>
                            <div>
                                <b>Tanggal :</b> {formatDate(certificate.start_date)} - {formatDate(certificate.end_date)}
                            </div>
                        </div>

                        <div>
                            <b>Status :</b>{" "}
                            <span
                                className={`px-2 py-1 text-xs rounded-full ml-2
                                ${
                                    certificate.status === "lulus"
                                    ? "bg-green-100 text-green-700"
                                    : certificate.status === "gagal"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }
                                `}
                            >
                                {certificate.status}
                            </span>
                        </div>

                        {certificate.status === "lainnya" && certificate.reason && (
                            <div>
                                <b>Keterangan :</b>
                                <div className="mt-1 px-3 py-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                                {certificate.reason}
                                </div>
                            </div>
                        )}

                    </div>

                    {certificate.pdf_url && (
                        <div className="flex justify-center mt-6">
                            <button
                            onClick={()=>handleDownload(
                                `${import.meta.env.VITE_API_BASE}${certificate.pdf_url}`,
                                certificate.certificate_number + ".pdf"
                            )}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg"
                            >
                            <Download size={18}/>
                            Download Sertifikat
                            </button>
                        </div>
                    )}

                </div>
            )}

        </div>
    )

}