import { motion, AnimatePresence } from "framer-motion"
import type { Variants } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import {
  BadgeCheck,
  Truck,
  Wallet,
  Boxes,
  ShieldCheck,
  Users,
  ShoppingCart,
  Award
} from "lucide-react"
import Breadcrumb from "../../../components/Breadcrumb"

const items = [1,2,3,4,5,6]

export default function CompanyProfile() {

const [name, setName] = useState("")
const [email, setEmail] = useState("")
const [message, setMessage] = useState("")
const [loading, setLoading] = useState(false)

const API_BASE = import.meta.env.VITE_API_BASE

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const res = await fetch(`${API_BASE}/api/v1/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name,
            email,
            message,
        }),
    })

    if (res.ok) {
      alert("Pesan berhasil dikirim!")
      setName("")
      setEmail("")
      setMessage("")
    } else {
      alert("Gagal kirim pesan")
    }
  } catch (err) {
    console.error(err)
    alert("Terjadi error")
  } finally {
    setLoading(false)
  }
}

const komponenIcons = [
  "/icons/cpu1.svg",
  "/icons/pc-rakitan.svg",
  "/icons/ssd-ram.svg",
  "/icons/printer.svg",
]

const laptopIcons = [
  "/icons/laptop1.svg",
  "/icons/laptop2.svg",
  "/icons/laptop3.svg",
  "/icons/laptop4.svg",
]

const serviceIcons = [
  "/icons/customer-service.png",
  "/icons/software-application.png",
  "/icons/warranty-card.png"
]

const [openIndex, setOpenIndex] = useState<number | null>(0)
const faqs = [
  {
    question: "Bagaimana cara memesan produk di Anandam.id?",
    answer:
      "Bisa langsung cek dan chat dengan CS kami. WA kami ada di setiap produk, jadi langsung bisa ditanyakan."
  },
  {
    question: "Apakah semua produk memiliki garansi resmi?",
    answer:
      "Kami hanya menjual produk baru dan bergaransi resmi dari distributor di Indonesia. Masa garansi bervariasi tergantung merek dan jenis komponen (umumnya 1–3 tahun)."
  },
  {
    question: "Apakah bisa membantu merakit PC (Custom Build)?",
    answer:
      "Anda bisa memilih komponen sendiri melalui menu 'Rakitan' kami, dan tim teknisi ahli kami akan merakit serta melakukan stress-test sebelum dikirimkan ke alamat Anda."
  },
  {
    question: "Apakah melayani pengiriman ke luar kota/pulau?",
    answer:
      "Kami melayani pengiriman ke seluruh wilayah Indonesia menggunakan ekspedisi terpercaya. Untuk barang sensitif seperti monitor atau PC rakitan, kami sangat menyarankan penambahan packing kayu."
  },
  {
    question: "Untuk Pembelian apakah bisa Faktur Pajak?",
    answer:
      "Kami adalah Pengusaha Kena Pajak yang taat. Ketika kebutuhan anda menggunakan faktur atau bahkan NTPN kita bisa bantu lebih lanjut."
  },
  {
    question: "Pengiriman benar Gratis kak di DI Yogyakarta?",
    answer:
      "Pengiriman kami gratis diseluruh DI Yogyakarta dan sekitar nya kak. Dikirim menggunakan armada kami, jadi keamanan barang terjamin."
  }
]

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.12
    }
  }
}

const item: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.98
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: "easeOut"
    }
  }
}

// ================= MODAL GALERI LOGIC =================
const [isGalleryOpen, setIsGalleryOpen] = useState(false)
const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0)

const galleryImages = [
  "/gallery/galeri1.JPG",
  "/gallery/galeri2.JPG",
  "/gallery/galeri3.JPG",
  "/gallery/galeri4.JPG",
  "/gallery/galeri5.JPG",
  "/gallery/galeri13.jpg",
  "/gallery/galeri6.JPG",
  "/gallery/galeri10.JPG",
  "/gallery/galeri11.jpg",
  "/gallery/galeri12.jpg",
  "/gallery/galeri14.jpg",
  "/gallery/galeri15.JPG",
]

const openGallery = (index: number) => {
  setCurrentGalleryIndex(index)
  setIsGalleryOpen(true)
}

const closeGallery = () => setIsGalleryOpen(false)

const nextImage = (e: React.MouseEvent) => {
  e.stopPropagation() // Mencegah modal tertutup saat klik tombol
  setCurrentGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1))
}

const prevImage = (e: React.MouseEvent) => {
  e.stopPropagation() // Mencegah modal tertutup saat klik tombol
  setCurrentGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1))
}
// ======================================================

    return (
        <div className="bg-white overflow-x-hidden md:overflow-visible">
            {/* ================= BREADCRUMB BAR ================= */}
            <div className="w-full bg-white">
                <div className="max-w-7xl w-full mx-auto h-14 flex items-center px-4 sm:px-6 lg:px-8">
                    <Breadcrumb
                        items={[
                            { label: "Home", path: "/" },
                            { label: "Profile Perusahaan" },
                        ]}
                    />
                </div>
            </div>

            {/* HERO */}
            <section className="relative w-full min-h-[420px] md:min-h-[500px] 2xl:min-h-[600px] flex items-center">

                {/* BACKGROUND IMAGE */}
                <div className="absolute inset-0">
                    <img
                        src="/anandam-depan.svg"
                        alt="Background"
                        className="w-full h-full object-cover max-w-full object-center md:object-right"
                    />
                </div>

                {/* OVERLAY GRADIENT HITAM */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent md:from-black/60 md:via-black/30"></div>

                {/* CONTENT */}
                <div className="relative px-4 sm:px-6 md:px-8 lg:px-10 2xl:px-32 2xl:max-w-[1536px] 2xl:mx-auto w-full grid md:grid-cols-2 items-center gap-6 md:gap-10">

                    {/* TEXT */}
                    <div className="text-left text-white">

                        <h1 className="
                            text-2xl sm:text-3xl md:text-5xl 2xl:text-6xl
                            font-bold leading-snug md:leading-tight
                        ">
                            Apapun Setup-nya,{" "}
                            <span className="text-primary">Anandam</span> Andalannya
                        </h1>

                        <p className="
                            mt-4 md:mt-6
                            text-sm sm:text-base md:text-lg 2xl:text-xl
                            text-gray-200
                            max-w-full md:max-w-xl 2xl:max-w-2xl
                        ">
                            Mulai dari komponen PC, laptop, hingga layanan servis — semua kebutuhan teknologi tersedia dalam satu tempat. Cepat, aman, dan terpercaya sejak 2014.
                        </p>

                    </div>

                </div>
            </section>

            {/* TENTANG */}
            <section
                id="tentang"
                className="border-gray-300 border-b-2 mt-10 md:mt-6 pt-8 md:pt-0 pb-12 2xl:pb-20"
            >
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-20 2xl:px-32">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

                        {/* TEXT */}
                        <div data-aos="fade-up" className="order-2 md:order-1">
                            <h2 className="text-xl sm:text-2xl 2xl:text-3xl font-bold mb-4 text-primary">
                            Tentang Kami
                            </h2>

                            <h3 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold mb-4 text-primary2">
                            Anandam Id
                            </h3>

                            <p className="text-gray-600 leading-relaxed text-sm sm:text-base 2xl:text-lg text-justify">
                            Anandam adalah perusahaan yang bergerak di bidang penjualan perangkat
                            elektronik dan perlengkapan teknologi, seperti komputer, notebook,
                            printer, server, proyektor, serta berbagai perangkat pendukung
                            lainnya. Berdiri sejak tahun 2014, kami berkomitmen menyediakan produk
                            dari merek terpercaya dengan kualitas terbaik serta memberikan
                            pengalaman belanja yang mudah, cepat, dan terpercaya.
                            </p>
                        </div>

                        {/* IMAGE */}
                        <div
                            data-aos="fade-left"
                            className="flex justify-center order-1 md:order-2 mt-4 md:mt-0"
                        >
                            <img
                            src="/struktur_anandam.svg"
                            alt="Struktur Anandam"
                            className="w-[250px] sm:w-[280px] md:w-[360px] lg:w-[440px] 2xl:w-[540px]"
                            />
                        </div>

                    </div>
                </div>

                {/* ================= KEUNGGULAN ================= */}
                <div className="mt-10 md:mt-16 2xl:mt-24 max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-20 2xl:px-32">

                    <div className="mb-10 text-left md:text-left">
                        <h3
                            data-aos="fade-up"
                            className="text-xl sm:text-3xl md:text-4xl 2xl:text-5xl font-bold text-primary2 mb-4"
                        >
                            Mengapa Memilih Anandam?
                        </h3>

                        <p data-aos="fade-up" className="text-gray-600 max-w-2xl 2xl:max-w-3xl 2xl:text-lg text-justify">
                            Kami berkomitmen memberikan pengalaman berbelanja perangkat teknologi
                            yang mudah, aman, dan terpercaya dengan dukungan produk berkualitas
                            serta layanan profesional.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 2xl:gap-14">

                    {/* ITEM */}
                    <div data-aos="fade-up" className="flex flex-col items-center text-center gap-3">
                        <Award className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Produk Berkualitas</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Menyediakan produk dari brand terpercaya dengan kualitas terbaik.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="150" className="flex flex-col items-center text-center gap-3">
                        <Wallet className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Harga Kompetitif</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Harga selalu diperbarui dan bersaing sesuai kondisi pasar.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col items-center text-center gap-3">
                        <Boxes className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Beragam Brand</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Berbagai merek ternama tersedia untuk memenuhi kebutuhan Anda.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="450" className="flex flex-col items-center text-center gap-3">
                        <ShieldCheck className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Terpercaya</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Kami menjaga kepercayaan pelanggan dengan layanan transparan.
                        </p>
                    </div>

                    <div data-aos="fade-up" className="flex flex-col items-center text-center gap-3">
                        <Truck className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Pengiriman Cepat</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Pesanan diproses dan dikirim secepat mungkin.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="150" className="flex flex-col items-center text-center gap-3">
                        <Users className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Tim Profesional</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Didukung staf berpengalaman yang siap membantu.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="300" className="flex flex-col items-center text-center gap-3">
                        <ShoppingCart className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Belanja Mudah</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Sistem pembelian dirancang praktis dan nyaman.
                        </p>
                    </div>

                    <div data-aos="fade-up" data-aos-delay="450" className="flex flex-col items-center text-center gap-3">
                        <BadgeCheck className="w-7 h-7 md:w-8 md:h-8 2xl:w-10 2xl:h-10 text-blue-600"/>
                        <h4 className="font-semibold text-sm md:text-base 2xl:text-lg">Garansi Produk</h4>
                        <p className="text-gray-500 text-xs md:text-sm 2xl:text-base">
                        Produk dilengkapi garansi resmi dari masing-masing brand.
                        </p>
                    </div>

                    </div>

                </div>
            </section>

            {/* LAYANAN */}
            <section id="layanan" className="py-16 md:py-24 2xl:py-32">
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-20 2xl:px-32">

                    {/* TITLE */}
                    <h2
                    data-aos="fade-up"
                    className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-bold mb-10 2xl:mb-14 text-primary"
                    >
                    Layanan
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 2xl:gap-32">

                    {/* ================= LEFT CONTENT ================= */}
                    <div className="space-y-20 md:space-y-32">

                        {/* LANTAI 1 */}
                        <div>
                        <h2 data-aos="fade-up" className="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-2">
                            Lantai 1
                        </h2>

                        <h3 data-aos="fade-up" className="text-xl md:text-3xl 2xl:text-4xl font-semibold mb-6">
                            Komponen & Printer
                        </h3>

                        <div className="flex gap-6 flex-wrap mb-6">
                            {komponenIcons.map((icon, i) => (
                            <img
                                key={i}
                                src={icon}
                                alt="service icon"
                                data-aos="fade-right"
                                data-aos-delay={i * 150}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 2xl:w-28 2xl:h-28 object-contain"
                            />
                            ))}
                        </div>

                        <p data-aos="fade-up" className="text-gray-600 2xl:text-lg text-justify">
                            Lantai 1 melayani penjualan berbagai komponen komputer seperti RAM,
                            SSD, motherboard, processor, casing, serta printer dan berbagai
                            perangkat pendukung lainnya.
                        </p>
                        </div>

                        {/* LANTAI 2 */}
                        <div>
                        <h2 data-aos="fade-up" className="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-2">
                            Lantai 2
                        </h2>

                        <h3 data-aos="fade-up" className="text-xl md:text-3xl 2xl:text-4xl font-semibold mb-6">
                            Notebook
                        </h3>

                        <div className="flex gap-6 flex-wrap mb-6">
                            {laptopIcons.map((icon, i) => (
                            <img
                                key={i}
                                src={icon}
                                alt="laptop icon"
                                data-aos="fade-right"
                                data-aos-delay={i * 150}
                                className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 2xl:w-28 2xl:h-28 object-contain"
                            />
                            ))}
                        </div>

                        <p data-aos="fade-up" className="text-gray-600 2xl:text-lg text-justify">
                            Lantai 2 menyediakan berbagai pilihan notebook dari berbagai
                            merek ternama dengan spesifikasi yang beragam sesuai kebutuhan
                            kerja, pendidikan, maupun gaming.
                        </p>
                        </div>

                        {/* LANTAI 3 */}
                        <div>
                        <h2 data-aos="fade-up" className="text-2xl md:text-4xl 2xl:text-5xl font-bold mb-2">
                            Lantai 3
                        </h2>

                        <h3 data-aos="fade-up" className="text-xl md:text-3xl 2xl:text-4xl font-semibold mb-6">
                            Service Center
                        </h3>

                        <div className="flex gap-6 flex-wrap mb-6">
                            {serviceIcons.map((icon, i) => (
                            <img
                                key={i}
                                src={icon}
                                alt="service icon"
                                data-aos="fade-right"
                                data-aos-delay={i * 150}
                                className="w-14 h-14 sm:w-16 sm:h-16 2xl:w-20 2xl:h-20 object-contain"
                            />
                            ))}
                        </div>

                        <p data-aos="fade-up" className="text-gray-600 2xl:text-lg text-justify">
                            Lantai 3 merupakan pusat layanan servis untuk berbagai perangkat
                            komputer dan notebook. Kami menyediakan layanan klaim garansi yang
                            diproses melalui RMA, konsultasi langsung dengan customer service,
                            serta perbaikan perangkat oleh teknisi yang berpengalaman.
                        </p>
                        </div>

                        {/* PENGIRIMAN */}
                        <div className="flex flex-col items-center text-center md:text-left md:items-start">

                        <h3 data-aos="fade-up" className="text-xl md:text-3xl 2xl:text-4xl font-bold mb-4">
                            Pengiriman Gratis Seluruh Jogja
                        </h3>

                        <img
                            src="/icons/map-jogja.svg"
                            className="w-[160px] sm:w-[200px] md:w-[220px] 2xl:w-[280px] mb-4"
                            data-aos="zoom-in"
                        />

                        <p data-aos="fade-up" className="text-gray-600 max-w-xl 2xl:max-w-2xl 2xl:text-lg text-justify">
                            Kami menyediakan layanan pengiriman gratis untuk seluruh wilayah
                            Yogyakarta sehingga pelanggan dapat berbelanja dengan lebih nyaman
                            dan praktis.
                        </p>

                        </div>

                    </div>

                    {/* ================= RIGHT STICKY IMAGE ================= */}
                    <div
                        data-aos="fade-left"
                        className="relative hidden lg:block"
                    >
                        <div className="sticky top-32">
                        <img
                            src="/talent_anandam3.svg"
                            alt="Talent"
                            className="rounded-xl w-full max-w-md 2xl:max-w-lg ml-auto"
                        />
                        </div>
                    </div>

                    </div>
                </div>
            </section>
            
            {/* GALERI */}
            <section id="galeri" className="py-12 md:py-16 2xl:py-24 border-gray-300 border-t-2">
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-20 2xl:px-32">

                    <h2 className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-bold text-center mb-10 md:mb-16 2xl:mb-20">
                    Galeri Anandam
                    </h2>

                    <div className="columns-2 md:columns-3 2xl:columns-4 gap-4 md:gap-6 2xl:gap-8 space-y-4 md:space-y-6 2xl:space-y-8">

                    {galleryImages.map((src, i) => {
                        const randomDelay = Math.floor(Math.random() * 600);

                        return (
                        <div
                            key={i}
                            data-aos="zoom-in"
                            data-aos-delay={randomDelay}
                            className="overflow-hidden rounded-md group break-inside-avoid cursor-pointer"
                            onClick={() => openGallery(i)}
                        >
                            <img
                            src={src}
                            className="w-full object-cover transition duration-500 group-hover:scale-110"
                            loading="lazy"
                            />
                        </div>
                        );
                    })}

                    </div>

                </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="pt-16 md:pt-24 2xl:pt-32 pb-12 md:pb-14 2xl:pb-20 border-gray-300 border-t-2">
                <div className="max-w-7xl 2xl:max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-20 2xl:px-32">

                    {/* Title */}
                    <div className="text-center mb-10 md:mb-14 2xl:mb-20">
                        <h2
                            data-aos="fade-up"
                            className="text-2xl sm:text-3xl md:text-4xl 2xl:text-5xl font-bold mb-3 2xl:mb-5"
                        >
                            Frequently Asked Questions
                        </h2>

                        <p
                            data-aos="fade-up"
                            data-aos-delay="100"
                            className="text-gray-600 text-sm sm:text-base 2xl:text-lg"
                        >
                            Pertanyaan yang sering ditanyakan pelanggan kami
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 2xl:gap-24">

                        {/* ================= LEFT - FAQ ================= */}
                        <motion.div
                            className="space-y-3 md:space-y-4 2xl:space-y-6"
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {faqs.map((faq, i) => (
                            <motion.div
                                key={i}
                                variants={item}
                                layout
                                className={`border rounded-lg p-4 md:p-5 2xl:p-6 cursor-pointer transition ${
                                openIndex === i
                                    ? "bg-blue-100 border-blue-300"
                                    : "bg-white"
                                }`}
                                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            >

                                <div className="flex justify-between items-center gap-4">
                                <h4 className="font-semibold text-sm sm:text-base 2xl:text-lg">
                                    {faq.question}
                                </h4>

                                <span className="text-blue-500 text-lg md:text-xl 2xl:text-2xl">
                                    {openIndex === i ? "−" : "+"}
                                </span>
                                </div>

                                <AnimatePresence>
                                {openIndex === i && (
                                    <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{
                                        duration: 0.35,
                                        ease: "easeInOut"
                                    }}
                                    className="overflow-hidden"
                                    >
                                    <p className="text-gray-600 mt-3 2xl:mt-4 text-sm 2xl:text-base leading-relaxed text-justify">
                                        {faq.answer}
                                    </p>
                                    </motion.div>
                                )}
                                </AnimatePresence>

                            </motion.div>
                            ))}
                        </motion.div>

                        {/* ================= RIGHT - FORM ================= */}
                        <div
                            data-aos="fade-left"
                            data-aos-delay="600"
                            className="bg-white rounded-xl shadow-sm p-5 sm:p-6 md:p-8 2xl:p-10 border"
                        >
                            <h3 className="text-lg md:text-xl 2xl:text-2xl font-semibold mb-2 2xl:mb-4">
                            Ada pertanyaan lain?
                            </h3>

                            <p className="text-gray-500 mb-6 2xl:mb-8 text-sm 2xl:text-base">
                            Silakan kirim pertanyaan Anda melalui form berikut.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 2xl:space-y-6">

                            <div>
                                <label className="text-sm 2xl:text-base text-gray-500">Nama</label>
                                <input
                                type="text"
                                    placeholder="User"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full border rounded-md px-4 py-2 2xl:py-3 mt-1 text-sm 2xl:text-base"
                                />
                            </div>

                            <div>
                                <label className="text-sm 2xl:text-base text-gray-500">Email</label>
                                <input
                                    type="email"
                                    placeholder="email@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full border rounded-md px-4 py-2 2xl:py-3 mt-1 text-sm 2xl:text-base"
                                />
                            </div>

                            <div>
                                <label className="text-sm 2xl:text-base text-gray-500">
                                    Pertanyaan
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Tulis pertanyaan disini..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full border rounded-md px-4 py-2 2xl:py-3 mt-1 text-sm 2xl:text-base"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 2xl:py-3 2xl:px-8 rounded-md hover:bg-blue-700 transition 2xl:text-lg disabled:opacity-50"
                            >
                                {loading ? "Mengirim..." : "Kirim Pertanyaan"}
                            </button>

                            </form>
                        </div>

                    </div>
                </div>
            </section>

            {/* MODAL GALERI LIGHTBOX */}
            <AnimatePresence>
                {isGalleryOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeGallery}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
                    >
                        {/* Tombol Close */}
                        <button
                            onClick={closeGallery}
                            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-gray-300 p-2 z-50 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Tombol Prev */}
                        <button
                            onClick={prevImage}
                            className="absolute left-2 md:left-8 text-white hover:text-gray-300 p-2 z-50 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        {/* Gambar */}
                        <div 
                            className="relative max-w-[90vw] max-h-[85vh] flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()} 
                        >
                            <motion.img
                                key={currentGalleryIndex}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                src={galleryImages[currentGalleryIndex]}
                                alt={`Gallery ${currentGalleryIndex + 1}`}
                                className="max-w-full max-h-[85vh] object-contain rounded-md"
                            />
                            
                            {/* Counter */}
                            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white text-sm md:text-base tracking-widest">
                                {currentGalleryIndex + 1} / {galleryImages.length}
                            </div>
                        </div>

                        {/* Tombol Next */}
                        <button
                            onClick={nextImage}
                            className="absolute right-2 md:right-8 text-white hover:text-gray-300 p-2 z-50 transition"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}