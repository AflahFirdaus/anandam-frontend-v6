import { useEffect, useState } from "react";
import {
  getCertificates,
  createCertificate,
} from "../../services/certificateService";
import { Eye, Download } from "lucide-react";

import type { Certificate } from "../../services/certificateService";

export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"lulus" | "gagal" | "lainnya">("lulus");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchCertificates = async () => {
    const data = await getCertificates();
    setCertificates(data);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const handleGenerate = async () => {
    if (!name || !school || !startDate || !endDate)
      return alert("Semua field harus diisi");

    setLoading(true);

    try {
      await createCertificate({
        name,
        school,
        start_date: startDate,
        end_date: endDate,
        status,
        reason
      });

      setName("");
      setSchool("");
      setStartDate("");
      setEndDate("");

      setShowModal(false);

      fetchCertificates();
    } catch {
      alert("Gagal generate certificate");
    }

    setLoading(false);
  };

  const [step, setStep] = useState(1);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Gagal download file");
    }
  };

  const [search, setSearch] = useState("");
  const filteredCertificates = certificates.filter((cert) =>
    cert.name.toLowerCase().includes(search.toLowerCase()) ||
    cert.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between">

        {/* <h1 className="text-xl font-semibold">
          Certificate Management
        </h1> */}

        <button
          onClick={() => {
            setShowModal(true);
            setStep(1);
          }}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Buat Sertifikat
        </button>

      </div>

      {/* TABLE */}
      <div className="bg-white border border-gray-200 shadow rounded-2xl">

        {/* SEARCH */}
        <div className="flex items-center justify-end p-4 border-b">

          <input
            type="text"
            placeholder="Cari nama atau sekolah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-72 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

        </div>

        <div className="overflow-x-auto">

          <table className="min-w-full text-sm">

            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Nama
                </th>

                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Nomor Sertifikat
                </th>

                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Sekolah
                </th>

                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Periode
                </th>

                <th className="px-6 py-3 text-left font-semibold text-gray-600">
                  Status
                </th>

                <th className="px-6 py-3 text-center font-semibold text-gray-600">
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredCertificates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : (
                filteredCertificates.map((cert) => (
                  <tr
                    key={cert.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-medium">
                      {cert.name}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {cert.certificate_number}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {cert.school}
                    </td>

                    <td className="px-6 py-4 text-gray-600">

                      {new Date(cert.start_date).toLocaleDateString("id-ID", {
                        month: "long",
                      })}

                      {" - "}

                      {new Date(cert.end_date).toLocaleDateString("id-ID", {
                        month: "long",
                      })}

                      {" "}

                      {new Date(cert.start_date).getFullYear()}

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-2 py-1 text-xs rounded-full
                          ${
                            cert.status === "lulus"
                              ? "bg-green-100 text-green-700"
                              : cert.status === "gagal"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }
                        `}
                      >
                        {cert.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">

                        {cert.pdf_url ? (
                          <>
                            {/* VIEW */}
                            <a
                              href={`${import.meta.env.VITE_API_BASE}${cert.pdf_url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-50"
                            >
                              <Eye size={18} />
                            </a>

                            {/* DOWNLOAD */}
                            <button
                              onClick={() =>
                                handleDownload(
                                  `${import.meta.env.VITE_API_BASE}${cert.pdf_url}`,
                                  `${cert.name}.pdf`
                                )
                              }
                              className="p-2 text-green-600 transition rounded-lg hover:bg-green-50"
                            >
                              <Download size={18} />
                            </button>
                          </>
                        ) : cert.status === "gagal" ? (
                          <span className="text-xs text-gray-400 italic">
                            Tidak ada sertifikat
                          </span>
                        ) : null}

                      </div>
                    </td>

                  </tr>
                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl">

            {/* HEADER */}
            <div className="px-6 py-4 border-b">

              <h2 className="text-lg font-semibold">
                Generate Certificate
              </h2>

              <div className="flex gap-6 mt-3 text-sm">

                <div className={`flex items-center gap-2 font-medium ${step === 1 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`flex items-center justify-center w-8 h-8 border rounded-full ${step === 1 ? "border-blue-600" : ""}`}>
                    01
                  </div>
                  Informasi Peserta
                </div>

                <div className={`flex items-center gap-2 font-medium ${step === 2 ? "text-blue-600" : "text-gray-400"}`}>
                  <div className={`flex items-center justify-center w-8 h-8 border rounded-full ${step === 2 ? "border-blue-600" : ""}`}>
                    02
                  </div>
                  Konfirmasi
                </div>

              </div>

            </div>


            {/* BODY */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">

            {step === 1 && (
              <>
                <h3 className="font-semibold text-gray-800">
                Informasi Sertifikat
                </h3>

                <div className="grid grid-cols-2 gap-4">

                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">
                    Nama Peserta
                    </label>

                    <input
                      value={name}
                      onChange={(e)=>setName(e.target.value)}
                      className="w-full px-3 py-2 mt-1 border rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">
                    Asal Sekolah
                    </label>

                    <input
                      value={school}
                      onChange={(e)=>setSchool(e.target.value)}
                      className="w-full px-3 py-2 mt-1 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                    Tanggal Mulai
                    </label>

                    <input
                      type="date"
                      value={startDate}
                      onChange={(e)=>setStartDate(e.target.value)}
                      className="w-full px-3 py-2 mt-1 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-gray-600">
                    Tanggal Selesai
                    </label>

                    <input
                      type="date"
                      value={endDate}
                      onChange={(e)=>setEndDate(e.target.value)}
                      className="w-full px-3 py-2 mt-1 border rounded-lg"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-sm text-gray-600">
                      Status Sertifikat
                    </label>

                    <select
                      value={status}
                      onChange={(e)=>setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 mt-1 border rounded-lg"
                    >
                      <option value="lulus">Lulus</option>
                      <option value="gagal">Tidak Lulus</option>
                      <option value="lainnya">Lainnya</option>
                    </select>
                  </div>

                  {status === "lainnya" && (
                    <div className="col-span-2">
                      <label className="text-sm text-gray-600">
                        Alasan
                      </label>

                      <textarea
                        value={reason}
                        onChange={(e)=>setReason(e.target.value)}
                        className="w-full px-3 py-2 mt-1 border rounded-lg"
                      />
                    </div>
                  )}

                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h3 className="font-semibold text-gray-800">
                  Konfirmasi Data Sertifikat
                </h3>

                <div className="space-y-4 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-500">Nama</span>
                    <span className="font-medium">{name}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Sekolah</span>
                    <span className="font-medium">{school}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Periode</span>
                    <span className="font-medium">
                      {new Date(startDate).toLocaleDateString("id-ID")} -{" "}
                      {new Date(endDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">Status</span>
                    <span className="font-medium">{status}</span>
                  </div>

                  {status === "lainnya" && reason && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Alasan</span>
                      <span className="font-medium text-right max-w-[60%]">
                        {reason}
                      </span>
                    </div>
                  )}

                </div>

                <p className="text-xs text-gray-500">
                Pastikan data sudah benar sebelum generate sertifikat.
                </p>
              </>
            )}

            </div>

            {/* FOOTER */}
            <div className="flex justify-between px-6 py-4 border-t">

              <button
                onClick={() => {
                  if (step === 1) {
                    setShowModal(false);
                  } else {
                    setStep(1);
                  }
                }}
                className="px-4 py-2 border rounded-lg"
              >
              {step === 1 ? "Batal" : "Kembali"}
              </button>

              {step === 1 && (
                <button
                  onClick={() => {
                    if (!name || !school || !startDate || !endDate)
                      return alert("Semua field harus diisi");

                    setStep(2);
                  }}
                  className="px-5 py-2 text-white bg-blue-600 rounded-lg"
                >
                Lanjut
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-5 py-2 text-white bg-blue-600 rounded-lg disabled:opacity-50"
                >
                {loading ? "Generating..." : "Generate"}
                </button>
              )}

            </div>

          </div>

        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="flex flex-col items-center gap-4 px-8 py-6 bg-white shadow-xl rounded-2xl">

            {/* spinner */}
            <div className="w-10 h-10 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>

            <p className="text-sm text-gray-600">
              Generating certificate...
            </p>

          </div>

        </div>
      )}

    </div>
    
  );
}