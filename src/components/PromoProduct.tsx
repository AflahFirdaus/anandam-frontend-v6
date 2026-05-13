import React, { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard"; // Sesuaikan path jika error
import { useNavigate } from "react-router-dom";

interface PromoProductSliderProps {
  products: any[];
  promoImageUrl?: string; 
}

export default function PromoProductSlider({ products, promoImageUrl }: PromoProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // State untuk drag & animasi
  const [isSwiping, setIsSwiping] = useState(false); 
  const [isAnimating, setIsAnimating] = useState(false); 

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const dragDistance = useRef(0);

  // === LOGIC FILTER DISKON ===
  const discountedProducts = products.filter(
    (p) => p.discount > 0 || p.discount_price > 0 || p.is_promo === true
  );

  // ==========================================
  // 🔥 FUNGSI ANIMASI SMOOTH & PELAN (CUSTOM)
  // ==========================================
  const animateScroll = (container: HTMLDivElement, targetPosition: number, duration: number) => {
    setIsAnimating(true);
    const startPosition = container.scrollLeft;
    const distance = targetPosition - startPosition;
    let startTime: number | null = null;

    // Easing function (easeInOutCubic) agar mulus di awal dan akhir
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const animation = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      container.scrollLeft = startPosition + distance * ease(progress);

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animation);
  };

  const getScrollAmount = () => {
    if (!scrollRef.current) return 0;
    const card = scrollRef.current.querySelector(".product-slide") as HTMLElement;
    const gap = 24; 
    return card ? card.offsetWidth + gap : 0;
  };

  const scrollLeft = () => {
    if (!scrollRef.current || isAnimating) return;
    const container = scrollRef.current;
    if (container.scrollLeft <= 5) {
      animateScroll(container, container.scrollWidth, 800); // 800ms
    } else {
      animateScroll(container, container.scrollLeft - getScrollAmount(), 800);
    }
  };

  const scrollRight = () => {
    if (!scrollRef.current || isAnimating) return;
    const container = scrollRef.current;
    const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
    
    if (isEnd) {
      animateScroll(container, 0, 800); // 800ms
    } else {
      animateScroll(container, container.scrollLeft + getScrollAmount(), 800);
    }
  };

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/product-katalog?promo=true");
  };

  // ==========================================
  // 🔥 AUTO SCROLL BERHASIL DIPERBAIKI
  // ==========================================
  useEffect(() => {
    // Kalau kursor ada di atas slider, lagi drag, atau animasi jalan -> matikan auto slide sementara
    if (isHovered || isSwiping || isAnimating || discountedProducts.length === 0) return;

    const interval = setInterval(() => {
      scrollRight();
    }, 4000); // Slide otomatis tiap 4 detik

    return () => clearInterval(interval);
    // 🔥 PENTING: Gunakan .length agar re-render tidak me-reset timer terus-terusan
  }, [isHovered, isSwiping, isAnimating, discountedProducts.length]); 

  // --- FUNGSI DRAG ---
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current || isAnimating) return;
    isDragging.current = true;
    dragDistance.current = 0;

    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    startX.current = pageX;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current || !scrollRef.current) return;
    
    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const walk = (pageX - startX.current) * 1.5; 
    
    dragDistance.current = Math.abs(walk); 

    if (dragDistance.current > 5 && !isSwiping) {
      setIsSwiping(true);
    }

    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleDragEnd = () => { 
    if (!isDragging.current) return;
    isDragging.current = false; 

    // 🔥 Logika perhitungan Snap halus setelah Drag selesai
    if (isSwiping && scrollRef.current) {
      const container = scrollRef.current;
      const scrollAmount = getScrollAmount();
      const currentScroll = container.scrollLeft;

      // Hitung posisi card terdekat
      const targetIndex = Math.round(currentScroll / scrollAmount);
      let targetScroll = targetIndex * scrollAmount;

      // Pastikan target tidak melewati batas scroll
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (targetScroll > maxScroll) targetScroll = maxScroll;
      if (targetScroll < 0) targetScroll = 0;

      // Animasi Snap 400ms biar nge-pas ke tengah dengan mulus
      animateScroll(container, targetScroll, 400);
    }

    setIsSwiping(false); 
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragDistance.current > 10) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  if (discountedProducts.length === 0) return null;

  return (
    <section className="py-6 md:py-10 bg-white mb-4 mt-4 border-y">
      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-0">
        
        <div className="bg-blue-700 border border-primary6/20 rounded-2xl p-4 sm:p-6 md:p-6 shadow-sm overflow-hidden">
          
          <div className="w-full mb-3 md:mb-4 rounded-2xl overflow-hidden flex justify-center">
            {promoImageUrl ? (
              <img 
                src={promoImageUrl} 
                alt="Promo Special" 
                className="mx-auto w-full max-w-3xl h-auto object-contain max-h-[120px] rounded-md"
              />
            ) : (
              <div className="w-full h-32 md:h-48 bg-gradient-to-r from-primary6/80 to-primary6 flex items-center justify-center rounded-2xl">
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* BUTTON LEFT */}
            <button
              onClick={scrollLeft}
              className={`hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-[100] 
              w-12 h-12 items-center justify-center bg-white/90 backdrop-blur-md border border-gray-200 
              shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full text-primary transition-all duration-500 ease-out
              ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
              hover:bg-primary hover:text-white hover:scale-110 active:scale-90`}
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>

            {/* BUTTON RIGHT */}
            <button
              onClick={scrollRight}
              className={`hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-[100] 
              w-12 h-12 items-center justify-center bg-white/90 backdrop-blur-md border border-gray-200 
              shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full text-primary transition-all duration-500 ease-out
              ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
              hover:bg-primary hover:text-white hover:scale-110 active:scale-90`}
            >
              <ChevronRight size={24} strokeWidth={2.5} />
            </button>

            {/* SLIDER CONTAINER */}
            <div
              ref={scrollRef}
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
              onClickCapture={handleClickCapture}
              // 🔥 Snap dimatikan saat swiping/animating agar tidak kaku
              className={`flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing touch-pan-y ${
                isSwiping || isAnimating ? "snap-none" : "snap-x snap-mandatory"
              }`}
            >
              {discountedProducts.map((product) => (
                  <div
                      key={product.id}
                      className="product-slide flex-shrink-0 snap-start select-none w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]"
                  >
                    <div className={isSwiping ? "pointer-events-none select-none" : ""}>
                      <ProductCard product={product} />
                    </div>
                  </div>
              ))}

                {/* CARD LIHAT SEMUA PROMO */}
                <div
                    className="product-slide flex-shrink-0 snap-start select-none w-[calc((100%-24px)/2)] md:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]"
                >
                    <div
                        onClick={handleNavigate}
                        className={`h-full min-h-[280px] bg-primary6 border border-white/80 rounded-2xl flex flex-col items-center justify-center p-4 md:p-6 text-center hover:shadow-xl transition-all cursor-pointer group ${
                        isSwiping ? "pointer-events-none select-none" : ""
                        }`}
                    >
                        {/* ICON */}
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:bg-white group-hover:text-primary transition-all duration-300">
                            <ArrowRight size={26} />
                        </div>

                        {/* TITLE */}
                        <h3 className="font-bold text-white text-base md:text-lg mb-1">
                            Promo Lainnya
                        </h3>

                        {/* DESC */}
                        <p className="text-xs md:text-sm text-gray-100 mb-4 line-clamp-2">
                            Berburu diskon menarik lainnya di sini
                        </p>

                        {/* BUTTON */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNavigate();
                            }}
                            className="px-5 py-2 bg-white text-primary text-sm font-bold rounded-full w-full mt-auto transition-all duration-300 hover:bg-blue-50 border border-transparent"
                        >
                            Cek Semua
                        </button>
                    </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}