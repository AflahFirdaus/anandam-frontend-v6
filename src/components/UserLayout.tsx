import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
// Tambahkan ArrowLeft disini
import { User, MapPin, Lock, ShoppingBag, ChevronRight, ArrowLeft, Info, FileText } from "lucide-react";
import { getMyAddresses } from "../services/userAuthService";

const isDataMissing = (data: any) => {
  if (data === null || data === undefined) return true;
  if (typeof data === "string") {
    const trimmed = data.trim().toLowerCase();
    if (trimmed === "" || trimmed === "null" || trimmed === "undefined" || trimmed === "[]" || trimmed === "{}") return true;
  }
  if (Array.isArray(data)) return data.length === 0;
  if (typeof data === "object" && !Array.isArray(data)) return Object.keys(data).length === 0;
  return false;
};

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState(() => 
    JSON.parse(localStorage.getItem("user_data") || "{}")
  );

  const [isAddressMissing, setIsAddressMissing] = useState(false);

  // LOGIKA PINTAR: Cek apakah user sedang berada tepat di "/user"
  const isRoot = location.pathname === "/user" || location.pathname === "/user/";

  // AUTO-REDIRECT KHUSUS DESKTOP
  // Jika dibuka di PC dan ada di "/user", langsung lempar ke profil supaya layar kanan tidak kosong
  useEffect(() => {
    if (window.innerWidth >= 768 && isRoot) {
      navigate("/user/account/profile", { replace: true });
    }
  }, [isRoot, navigate]);

  useEffect(() => {
    const handleUserDataUpdate = () => {
      setUserData(JSON.parse(localStorage.getItem("user_data") || "{}"));
      const hasAddr = localStorage.getItem("user_has_address");
      if (hasAddr === "true") setIsAddressMissing(false);
      else if (hasAddr === "false") setIsAddressMissing(true);
    };
    
    window.addEventListener("userDataUpdated", handleUserDataUpdate);
    window.addEventListener("storage", handleUserDataUpdate);
    
    const verifyAddressRightAway = async () => {
      try {
        const addresses = await getMyAddresses();
        if (addresses && addresses.length > 0) {
          setIsAddressMissing(false);
          localStorage.setItem("user_has_address", "true");
        } else {
          setIsAddressMissing(true);
          localStorage.setItem("user_has_address", "false");
        }
      } catch (err) {
        setIsAddressMissing(isDataMissing(JSON.parse(localStorage.getItem("user_data") || "{}")?.address));
      }
    };

    verifyAddressRightAway();
    
    return () => {
      window.removeEventListener("userDataUpdated", handleUserDataUpdate);
      window.removeEventListener("storage", handleUserDataUpdate);
    };
  }, []);

  const isPhoneMissing = isDataMissing(userData?.phone_number);

  const avatarUrl = userData.avatar_url?.startsWith("http")
    ? userData.avatar_url
    : userData.avatar_url 
      ? `${import.meta.env.VITE_API_BASE}${userData.avatar_url}`
      : "/default-avatar.png";

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const desktopMenuClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all
    ${isActive 
      ? "text-primary font-semibold bg-blue-50" 
      : "text-gray-600 hover:bg-gray-100"
    }`;

  const mobileMenuClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 text-sm transition-colors active:bg-gray-50
    ${isActive 
      ? "text-primary font-bold" 
      : "text-gray-700 font-medium"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 md:pt-12 pb-24 md:pb-12 md:px-4 sm:px-6 lg:px-8">
      
      {/* ============================================================== */}
      {/* 1. HEADER & MENU MOBILE (Hanya Tampil Jika di Root "/user")    */}
      {/* ============================================================== */}
      <div className={`md:hidden ${!isRoot ? 'hidden' : 'block'}`}>
        {/* Header Biru */}
        <div className="bg-primary w-full px-5 py-6 shadow-sm flex items-center gap-4">
          <div className="relative w-14 h-14 flex-shrink-0 rounded-full border-2 border-white shadow-md bg-white flex items-center justify-center">
            {userData.avatar_url ? (
              <img src={avatarUrl} className="w-full h-full object-cover rounded-full" alt="profile" />
            ) : (
              <span className="text-primary font-bold text-xl">{getInitials(userData.full_name)}</span>
            )}
            {(isPhoneMissing || isAddressMissing) && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border-2 border-white"></span>
              </span>
            )}
          </div>
          <div className="text-white min-w-0 flex-1">
            <h2 className="font-bold text-lg leading-tight truncate">
              {userData.full_name || "User Anandam"}
            </h2>
            <p className="text-white/80 text-xs mt-0.5 truncate">{userData.email}</p>
          </div>
        </div>

        {/* List Menu */}
        <div className="w-full bg-white shadow-sm mb-4">
          <div className="px-5 py-3 bg-gray-100/80 border-b border-gray-200">
            <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-widest">Akun Saya</p>
          </div>
          <div className="flex flex-col">
            <NavLink to="/user/account/profile" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <User size={18} className="text-gray-400" />
                <span>Biodata Diri</span>
                {isPhoneMissing && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse ml-1"></span>}
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>
            
            <NavLink to="/user/account/addresses" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-gray-400" />
                <span>Pengaturan Alamat</span>
                {isAddressMissing && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse ml-1"></span>}
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>

            <NavLink to="/user/account/change-password" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-gray-400" />
                <span>Pengaturan Keamanan</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>
          </div>

          <div className="px-5 py-3 bg-gray-100/80 border-y border-gray-200 mt-2">
            <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-widest">Transaksi</p>
          </div>
          <div className="flex flex-col">
            <NavLink to="/user/purchase" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} className="text-gray-400" />
                <span>Riwayat Pesanan</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>
          </div>

          <div className="px-5 py-3 bg-gray-100/80 border-y border-gray-200 mt-2">
            <p className="text-[11px] text-gray-500 font-extrabold uppercase tracking-widest">Anandam Computer</p>
          </div>
          <div className="flex flex-col">
            <NavLink to="/company-profile" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <Info size={18} className="text-gray-400" />
                <span>Tentang Kami</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>
            
            <NavLink to="/terms" className={mobileMenuClass}>
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-gray-400" />
                <span>Syarat & Ketentuan</span>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </NavLink>
          </div>
          
          <div className="h-6"></div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. HEADER KEMBALI MOBILE (Hanya Tampil Jika BUKAN di Root)     */}
      {/* ============================================================== */}
      <div className={`md:hidden bg-white border-b border-gray-200 p-4 sticky top-[60px] z-40 transition-all ${isRoot ? 'hidden' : 'flex items-center gap-3 shadow-sm'}`}>
        <button 
          onClick={() => navigate('/user')} 
          className="p-1 hover:bg-gray-100 rounded-lg active:scale-95 transition-all"
        >
          <ArrowLeft size={22} className="text-gray-700" />
        </button>
        <span className="font-bold text-gray-800 text-sm">Kembali ke Menu</span>
      </div>

      {/* ============================================================== */}
      {/* 3. KONTEN UTAMA (Desktop Wrapper & Outlet)                     */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 mt-0 md:mt-0 px-0 md:px-0">
        
        {/* SIDEBAR DESKTOP (Selalu tampil di Desktop, Sembunyi di Mobile) */}
        <div className="hidden md:block w-64 shrink-0 h-fit bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b mb-4">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 border flex-shrink-0">
              <img src={avatarUrl} className="w-full h-full object-cover rounded-full" alt="profile" />
              {(isPhoneMissing || isAddressMissing) && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white"></span>
                </span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {userData.full_name || "Username"}
              </p>
              <NavLink to="/user/account/profile" className="text-[11px] text-gray-500 hover:text-primary transition-colors">
                Edit Profil
              </NavLink>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 px-3">Akun Saya</p>
            <div className="flex flex-col gap-1">
              <NavLink to="/user/account/profile" className={desktopMenuClass}>
                <div className="flex items-center gap-3"><User size={16} /> Profil</div>
                {isPhoneMissing && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
              </NavLink>
              <NavLink to="/user/account/addresses" className={desktopMenuClass}>
                <div className="flex items-center gap-3"><MapPin size={16} /> Alamat</div>
                {isAddressMissing && <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>}
              </NavLink>
              <NavLink to="/user/account/change-password" className={desktopMenuClass}>
                <div className="flex items-center gap-3"><Lock size={16} /> Ubah Password</div>
              </NavLink>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 px-3">Pesanan</p>
            <NavLink to="/user/purchase" className={desktopMenuClass}>
              <div className="flex items-center gap-3"><ShoppingBag size={16} /> Pesanan Saya</div>
            </NavLink>
          </div>
        </div>

        {/* AREA FORM */}
        <div className={`flex-1 bg-white md:shadow-sm md:border md:border-gray-100 md:rounded-xl px-5 py-6 md:p-8 min-h-[400px] ${isRoot ? 'hidden md:block' : 'block'}`}>
          <Outlet />
        </div>

      </div>
    </div>
  );
}