import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { getProducts } from "../../services/productService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getCategories } from "../../services/adminCategoryService";
import { getBanners } from "../../services/bannerService";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../../components/ProductCard";
import LoadMoreButton from "../../components/LoadMoreButton";
import CategoryProductSection from "../../components/CategoryProductSection";
import GlassParticlesBackground from "../../components/GlassParticleBackground";
import ProductCardSkeleton from "../../components/ProductCardSkeleton";
import LandingCategorySection from "../../components/LandingCategorySection";
import { OfficialBrandSection } from "../../components/OfficialBrand";
import { getGroupings } from "../../services/groupingService";
import GroupingProductSlider from "../../components/GroupingProduct";
import PopularProduct from "../../components/PopularProduct";
import { getTikTokLiveStatus } from "../../services/tiktokService";
import PromoProductSlider from "../../components/PromoProduct";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    setIsMobile(media.matches);

    const listener = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return isMobile;
}

export default function LandingPage() {
  const scrollPositionRef = useRef(0);
  const shouldRestoreScroll = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [activeSearch, setActiveSearch] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    if (searchQuery !== null) {
      setActiveSearch(searchQuery);
      setSearchParams({}, { replace: true });
    }
  }, [searchQuery, setSearchParams]);

  const [categories, setCategories] = useState<any[]>([]);

  const scrollLeft = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const card = container.querySelector(".product-slide") as HTMLElement;

    if (!card) return;

    const gap = 24; 
    const cardWidth = card.offsetWidth + gap;

    container.scrollBy({
      left: -cardWidth,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    if (!scrollRef.current) return;

    const container = scrollRef.current;
    const card = container.querySelector(".product-slide") as HTMLElement;

    if (!card) return;

    const gap = 24; 
    const cardWidth = card.offsetWidth + gap;

    container.scrollBy({
      left: cardWidth,
      behavior: "smooth",
    });
  };

  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [searchProducts, setSearchProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  const [promoProducts, setPromoProducts] = useState<any[]>([]);

  const fetchPromoProducts = async () => {
    try {
      const res = await getProducts({
        is_promo: true,
        limit: 10,
      });
      setPromoProducts(res.data || []);
    } catch (err) {
      console.error("Gagal fetch promo products", err);
    }
  };

  const fetchPopularProducts = async () => {
    try {
      const res = await getProducts({
        is_popular: true,
        limit: 10,
      });

      setPopularProducts(res.data || []);
    } catch (err) {
      console.error("Gagal fetch popular products", err);
    }
  };

  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;

    isDragging.current = true;

    startX.current = e.clientX;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;

    const walk = (e.clientX - startX.current) * 1.5;

    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const isMobile = useIsMobile();
  const [banners, setBanners] = useState<any[]>([]);
  const [loadingBanners, setLoadingBanners] = useState(true);

  const heroBanners = banners.filter((b) => b.slot === "hero");
  const bannerPromoMobile = banners.find((b) => b.slot === "banner-after-category-mobile")
  const bannerPromoDesktop = banners.find((b) => b.slot === "banner-after-category")
  const bannerAfterPopularCenters = banners.find(
    (b) => b.slot === "banner-promo"
  );
  const bannerPromoProductSlider = banners.find(
    (b) => b.slot === "banner-promo-product" 
  );

  const [isHovered, setIsHovered] = useState(false);

  const isDragClickRef = useRef<boolean>(true);

  // ==========================================
  // LOGIKA INFINITE CAROUSEL HERO BANNER
  // ==========================================
  const displayHeroBanners = useMemo(() => {
    if (heroBanners.length <= 1) return heroBanners;
    return [
      heroBanners[heroBanners.length - 1], // Kloning elemen terakhir di depan
      ...heroBanners,
      heroBanners[0]                       // Kloning elemen pertama di belakang
    ];
  }, [heroBanners]);

  const [currentHero, setCurrentHero] = useState(1); // Mulai dari index 1 (karena 0 adalah kloningan)
  const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const startAutoSlide = useCallback(() => {
    if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    if (heroBanners.length <= 1) return;

    autoSlideRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrentHero((prev) => prev + 1);
    }, 4000);
  }, [heroBanners.length]);

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (autoSlideRef.current) clearInterval(autoSlideRef.current);
    };
  }, [startAutoSlide]);

  const nextHero = () => {
    setIsTransitioning(true);
    setCurrentHero((prev) => prev + 1);
    startAutoSlide();
  };

  const prevHero = () => {
    setIsTransitioning(true);
    setCurrentHero((prev) => prev - 1);
    startAutoSlide();
  };

  // Logika Teleportasi (Bypass animasi)
  useEffect(() => {
    if (heroBanners.length <= 1) return;

    if (currentHero === displayHeroBanners.length - 1) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentHero(1);
      }, 500); 
      return () => clearTimeout(timer);
    }

    if (currentHero === 0) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentHero(displayHeroBanners.length - 2);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentHero, heroBanners.length, displayHeroBanners.length]);

  // ==========================================

  const getImageUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return `${import.meta.env.VITE_API_BASE}${url}`;
  };

  const handleLoadMore = useCallback(() => {
    scrollPositionRef.current = window.scrollY;
    shouldRestoreScroll.current = true;

    setCurrentPage((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (!shouldRestoreScroll.current) return;

    window.scrollTo({
      top: scrollPositionRef.current,
    });

    shouldRestoreScroll.current = false;
  }, [products]);

  useEffect(() => {
    fetchPopularProducts();
    fetchCategories();
    fetchBanners();
    fetchPromoProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setProducts([]);
  }, [activeSearch]);

  
  useEffect(() => {
    const stopDragging = () => {
      isDragging.current = false;
    };

    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mouseup", stopDragging);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res);
    } catch (err) {
      console.error("Gagal fetch kategori", err);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await getBanners();
      setBanners(res || []);
    } catch (err) {
      console.error("Gagal fetch banner", err);
    } finally {
      setLoadingBanners(false);
    }
  };

  const dragStartX = useRef<number>(0);
  const dragOffsetRef = useRef<number>(0); 
  const sliderTrackRef = useRef<HTMLDivElement>(null); 

  const handleBannerDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
  if (e.type === 'mousedown') e.preventDefault();

  setIsTransitioning(false);
  isDragClickRef.current = true; // Reset: asumsikan awalnya adalah klik

  if ('touches' in e) {
    dragStartX.current = e.touches[0].clientX;
  } else {
    dragStartX.current = e.pageX;
  }
  };

  const handleBannerDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (dragStartX.current === 0) return;
    
    let currentX = 0;
    if ('touches' in e) {
      currentX = e.touches[0].clientX;
    } else {
      currentX = e.pageX;
    }
    
    const diff = currentX - dragStartX.current;
    
    // Jika geser lebih dari 5 pixel, tandai sebagai DRAG (bukan klik)
    if (Math.abs(diff) > 5) {
      isDragClickRef.current = false;
    }

    dragOffsetRef.current = diff; 
    if (sliderTrackRef.current) {
      sliderTrackRef.current.style.transform = `translateX(calc(-${currentHero * 100}% + ${diff}px))`;
    }
  };

  // Fungsi baru untuk handle navigasi ke Promo Page
  const handleBannerClick = (banner: any) => {
    if (isDragClickRef.current) {
      // Arahkan ke Promo Page berdasarkan ID Banner
      navigate(`/promo/${banner.id}`);
    }
  };

  const handleBannerDragEnd = () => {
    if (dragStartX.current === 0) return;

    setIsTransitioning(true); 

    const diff = dragOffsetRef.current; 
    
    if (diff < -50) {
      nextHero();
    } else if (diff > 50) {
      prevHero();
    } else {
       if (sliderTrackRef.current) {
         sliderTrackRef.current.style.transform = `translateX(-${currentHero * 100}%)`;
       }
    }
    
    dragStartX.current = 0;
    dragOffsetRef.current = 0; 
    
    startAutoSlide();
  };
  
  const [groupings, setGroupings] = useState<any[]>([]);
  const [isGroupingLoaded, setIsGroupingLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const data = await getGroupings();
      setGroupings(data);
      setIsGroupingLoaded(true); 
    };

    fetch();
  }, []);

  const excludedCategoryIds = useMemo(() => {
    const targetGroups = [
      "Komponen & Peripheral",
      "Monitor & Display",
      "Laptop",
      "Printer & Scanner",
      "Desktop & PC"
    ];

    const ids: string[] = [];
    
    groupings.forEach((group: any) => {
      if (targetGroups.includes(group.name)) {
        if (group.children && Array.isArray(group.children)) {
          group.children.forEach((child: any) => ids.push(child.id));
        }
      }
    });
    
    return ids;
  }, [groupings]);


  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      
      const params: any = {
        page,
        limit: isMobile ? 32 : 30, 
        sort: 'recommend', 
        exclude_category_ids: excludedCategoryIds.join(',') 
      };

      if (activeSearch) {
        params.search = activeSearch;
        delete params.sort; 
      }

      const res = await getProducts(params);
      const newProducts = res.data || [];

      if (page === 1) {
        setProducts(newProducts);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
      }
      
      setTotalPages(res.last_page || 1);
    } catch (err) {
      console.error("Gagal fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGroupingLoaded) {
      fetchProducts(currentPage);
    }
  }, [currentPage, activeSearch, isGroupingLoaded, excludedCategoryIds]);


  const displayedProducts = products;

  const fetchProductsByParent = async (parentSlug: string) => {
    try {
      const res = await getProducts({
        parent: parentSlug,
        limit: 10,
      });

      return res.data || [];
    } catch (err) {
      console.error("Gagal fetch parent products", err);
      return [];
    }
  };

  const [parentProducts, setParentProducts] = useState<{
    [key: string]: any[];
  }>({});

  const [showLiveModal, setShowLiveModal] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);

  const isDraggingModal = useRef(false);
  const hasDragged = useRef(false); 
  const offset = useRef({ x: 0, y: 0 });

  const handleMouseDownModal = (e: React.MouseEvent) => {
    if (!modalRef.current) return;

    isDraggingModal.current = true;
    hasDragged.current = false; 

    const rect = modalRef.current.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseMoveModal = (e: MouseEvent) => {
    if (!isDraggingModal.current || !modalRef.current) return;

    hasDragged.current = true; 

    modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
    modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
  };

  const handleMouseUpModal = () => {
    isDraggingModal.current = false;
    setTimeout(() => {
      hasDragged.current = false;
    }, 50);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMoveModal);
    window.addEventListener("mouseup", handleMouseUpModal);

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveModal);
      window.removeEventListener("mouseup", handleMouseUpModal);
    };
  }, []);

  const handleLiveClick = (e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault(); 
    }
  };

  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const checkTikTokLiveStatus = async () => {
      try {
        const res = await getTikTokLiveStatus();
        setIsLive(res.is_live);
      } catch (err) {
        console.error("Gagal cek status live:", err);
        setIsLive(false);
      }
    };

    checkTikTokLiveStatus();

    const interval = setInterval(checkTikTokLiveStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* ================= HERO BANNER ================= */}
      <section className="w-full bg-white">
        {loadingBanners ? (
          <div className="w-full aspect-[16/5] shimmer"></div>
        ) : heroBanners.length > 0 && (
          <div 
            className="relative w-full overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div 
              className="relative w-full aspect-[16/5] overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
              onMouseDown={handleBannerDragStart}
              onMouseMove={handleBannerDragMove}
              onMouseUp={handleBannerDragEnd}
              onMouseLeave={handleBannerDragEnd}
              onTouchStart={handleBannerDragStart}
              onTouchMove={handleBannerDragMove}
              onTouchEnd={handleBannerDragEnd}
              onDragStart={(e) => e.preventDefault()}
            >
              {/* SLIDER TRACK */}
              <div
                className="flex w-full h-full"
                ref={sliderTrackRef}
                style={{
                  transform: `translateX(-${currentHero * 100}%)`,
                  transition: isTransitioning ? "transform 500ms ease-in-out" : "none"
                }}
              >
                {displayHeroBanners.map((banner, i) => (
                  <div
                    key={`${banner.id}-${i}`}
                    className="w-full h-full flex-shrink-0 cursor-pointer" // Tambah cursor pointer
                    onClick={() => handleBannerClick(banner)} // Panggil fungsi navigasi
                  >
                    <img
                      src={getImageUrl(banner.image_url)}
                      className="w-full h-full object-cover object-top select-none pointer-events-none"
                      alt={banner.title || "Hero Banner"}
                      draggable={false}
                    />
                  </div>
                ))}
              </div>

              {/* CHEVRON LEFT */}
              {heroBanners.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); prevHero(); }}
                  className={`
                    absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-10
                    bg-black/40 hover:bg-black/60 text-white
                    p-2 md:p-3 rounded-full backdrop-blur
                    transition-all duration-300
                    ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                  `}
                >
                  <ChevronLeft size={20} className="md:w-[26px] md:h-[26px]" />
                </button>
              )}

              {/* CHEVRON RIGHT */}
              {heroBanners.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); nextHero(); }}
                  className={`
                    absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-10
                    bg-black/40 hover:bg-black/60 text-white
                    p-2 md:p-3 rounded-full backdrop-blur
                    transition-all duration-300
                    ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
                  `}
                >
                  <ChevronRight size={20} className="md:w-[26px] md:h-[26px]" />
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ================= CATEGORY ================= */}
      <LandingCategorySection
        groupings={groupings}
        getImageUrl={getImageUrl}
      />

      {/* ================= BANNER BRAND ================= */}
      <section className="w-full pb-10 pt-10 bg-white border-gray-200 border-b-[1px] relative overflow-hidden"> 
        <div className="flex justify-center w-full">
          <div className="relative w-full max-w-7xl 2xl:max-w-screen-2xl px-4 sm:px-6 lg:px-0">
            
            {bannerAfterPopularCenters && bannerAfterPopularCenters.image_url && (
              <div 
                onClick={() => navigate(`/promo/${bannerAfterPopularCenters.id || 'special'}`)}
                className="w-full aspect-[3/1] rounded-xl overflow-hidden mx-auto cursor-pointer hover:opacity-95 transition-opacity"
              >
                <img
                  src={getImageUrl(bannerAfterPopularCenters.image_url)}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  alt="Banner Brand"
                  draggable={false}
                />
              </div>
            )}

          </div>
        </div>
      </section>

      <PromoProductSlider 
        products={promoProducts}
        promoImageUrl={
          bannerPromoProductSlider?.image_url 
            ? getImageUrl(bannerPromoProductSlider.image_url) 
            : undefined
        }
      />

      <PopularProduct popularProducts={popularProducts} />

      <GroupingProductSlider/>

      <OfficialBrandSection />

      {/* ================= PRODUCT LAINNYA ================= */}
      <section className="w-full bg-white mt-4 border-gray-200 border-y pt-6">
        <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-0 pb-10">

          <h2
            className="mb-6 text-2xl md:text-3xl lg:text-4xl 
                      font-bold
                      bg-gray-800
                      text-transparent bg-clip-text
                      text-center"
          >
            Produk Lainnya
          </h2>

          <div className="
            grid
            grid-cols-2
            sm:grid-cols-3
            md:grid-cols-4
            lg:grid-cols-5
            2xl:grid-cols-6 
            gap-3 sm:gap-4
          ">
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}

            {loading &&
              Array.from({ length: isMobile ? 16 : 18 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
          </div>

          {/* ================= TARGET INFINITE SCROLL ================= */}
          <LoadMoreButton
            loading={loading}
            hasMore={currentPage < totalPages}
            onLoadMore={handleLoadMore}
          />
        </div>
      </section>

      {/* Modal Tiktok */}
      {showLiveModal && isLive && (
        <div
          ref={modalRef}
          onMouseDown={handleMouseDownModal}
          className="
            fixed z-[9999]
            w-[220px] sm:w-[260px]
            bg-black rounded-xl overflow-hidden shadow-2xl
            cursor-move
          "
          style={{
            top: "100px",
            left: "20px",
          }}
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              setShowLiveModal(false);
            }}
            className="absolute top-1 right-1 z-10 bg-black/60 text-white text-xs px-2 py-1 rounded"
          >
            ✕
          </button>

          {/* CONTENT */}
          <a
            href="https://www.tiktok.com/@anandamidstore/live" 
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLiveClick}
            className="select-none block" 
            draggable="false" 
          >
            <div className="relative pointer-events-none">
              <img
                src="/public/tiktoklive.svg"
                className="w-full h-[140px] object-cover"
                alt="Live Thumbnail"
              />

              {/* LIVE BADGE */}
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                LIVE
              </div>

            </div>

            <div className="p-2 text-white text-sm pointer-events-none">
              🔴 Live sekarang di TikTok
            </div>
          </a>
        </div>
      )}

    </div>
  );
}