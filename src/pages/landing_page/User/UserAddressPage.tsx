import { useEffect, useState } from "react";
import { MapPin, Home, Plus, Edit2, Loader2, Trash2, X, Save, Search, Map } from "lucide-react";
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  useMapEvents, 
  useMap 
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { 
  getMyAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress,
  type AddressDto
} from "../../../services/userAuthService";

import Swal from "sweetalert2";

// =====================
// KONFIGURASI API KEY
// =====================
const MAPTILER_KEY = "mEBKHAAL6hkAnRPRJsY4";
const LOCATIONIQ_KEY = "pk.197110fb96d20fe4f9d2e54938cea48c";

// ==========================================
// FIX UNTUK ICON MARKER LEAFLET DI REACT
// ==========================================
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ==========================================
// KOMPONEN UNTUK GERAKAN MAP (FlyTo)
// ==========================================
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { duration: 1.5 });
  }, [center, map]);
  return null;
}

// ==========================================
// KOMPONEN UNTUK KLIK MAP & REVERSE GEOCODE
// ==========================================
function LocationMarker({ position, setPosition, onAddressFound }: { position: any, setPosition: any, onAddressFound: (addr: string) => void }) {
  useMapEvents({
    async click(e) {
      setPosition(e.latlng);
      
      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/reverse.php?key=${LOCATIONIQ_KEY}&lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`
        );
        const data = await response.json();
        if (data && data.display_name) {
          onAddressFound(data.display_name);
        }
      } catch (err) {
        console.error("Gagal geocode:", err);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function UserAddressPage() {
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal & Animasinya
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Lokasi & Pencarian
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.175110, 106.827152]);
  const [searchRegion, setSearchRegion] = useState("");
  const [isSearchingMap, setIsSearchingMap] = useState(false);
  const [detailAddress, setDetailAddress] = useState("");

  // State baru untuk Dropdown Autocomplete
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false);

  const defaultCenter: [number, number] = [-7.782703877088118, 110.3670649669019];

  const [formData, setFormData] = useState<AddressDto>({
    label: "Rumah",
    recipient_name: "",
    phone_number: "",
    full_address: "",
    is_default: false,
  });

  useEffect(() => { fetchAddresses(); }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchRegion.trim().length > 3) {
        fetchSuggestions(searchRegion);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 700);

    return () => clearTimeout(delayDebounceFn);
  }, [searchRegion]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await getMyAddresses();
      setAddresses(data);

      const currentUserData = JSON.parse(localStorage.getItem("user_data") || "{}");
      
      if (data && data.length > 0) {
        const defaultAddr = data.find((a: AddressDto) => a.is_default) || data[0];
        currentUserData.address = defaultAddr.full_address;
        localStorage.setItem("user_has_address", "true");
      } else {
        currentUserData.address = "";
        localStorage.setItem("user_has_address", "false");
      }
      
      localStorage.setItem("user_data", JSON.stringify(currentUserData));
      window.dispatchEvent(new Event("userDataUpdated"));

    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchSuggestions = async (query: string) => {
    setIsSearchingSuggestions(true);
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=id`
      );
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const formattedResults = data.map((item: any) => {
          const shortName = item.address?.road || item.address?.village || item.address?.suburb || "Lokasi";
          return {
            lat: item.lat,
            lon: item.lon,
            name: shortName,
            display_name: item.display_name
          };
        });
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
      setShowSuggestions(true);
    } catch (err) {
      console.error("Gagal memuat saran lokasi", err);
    } finally {
      setIsSearchingSuggestions(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    
    setMapCenter([newLat, newLng]);
    setMapPosition({ lat: newLat, lng: newLng });
    setSearchRegion(item.display_name);
    setFormData((prev) => ({ ...prev, full_address: item.display_name }));
    
    setShowSuggestions(false);
  };

  const handleSearchRegion = async () => {
    if (!searchRegion.trim()) return;
    setIsSearchingMap(true);
    setShowSuggestions(false);

    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_KEY}&q=${encodeURIComponent(searchRegion)}&format=json&limit=1&countrycodes=id`
      );
      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        const bestMatch = data[0];
        const newLat = parseFloat(bestMatch.lat);
        const newLng = parseFloat(bestMatch.lon);
        
        setMapCenter([newLat, newLng]);
        setMapPosition({ lat: newLat, lng: newLng }); 
        setFormData((prev) => ({ ...prev, full_address: bestMatch.display_name }));
      } else {
        Swal.fire({ 
          icon: 'info', 
          title: 'Lokasi tidak ditemukan', 
          text: 'Coba cari nama kecamatan/kota saja, lalu geser pin manual.',
          toast: true, 
          position: 'top-end', 
          timer: 3000, 
          showConfirmButton: false,
          didOpen: (toast) => {
             const container = toast.parentElement;
             if (container) container.style.zIndex = "99999"; 
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingMap(false);
    }
  };

  const handleOpenModal = (addr?: AddressDto) => {
    if (addr) {
      setFormData(addr);

      const match = addr.full_address.match(/^(.*?)(?:\s*\((.*)\))?$/);
      if (match) {
        setFormData(prev => ({ ...prev, full_address: match[1] || "" }));
        setDetailAddress(match[2] || "");
      }

      if (addr.latitude && addr.longitude) {
        setMapPosition({ lat: addr.latitude, lng: addr.longitude });
        setMapCenter([addr.latitude, addr.longitude]);
      } else {
        setMapPosition(null);
        setMapCenter(defaultCenter);
      }
    } else {
      setFormData({
        label: "Rumah",
        recipient_name: "",
        phone_number: "",
        full_address: "",
        is_default: addresses.length === 0
      });
      setDetailAddress("");
      setMapPosition(null);
      setMapCenter(defaultCenter);
    }

    setSearchRegion("");
    setShowSuggestions(false);
    setShowModal(true);
    setIsClosing(false); 
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 300); 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const combinedAddress = detailAddress
      ? `${formData.full_address} (${detailAddress})`
      : formData.full_address;

    const payload = {
      ...formData,
      full_address: combinedAddress,
      latitude: mapPosition ? mapPosition.lat : undefined,
      longitude: mapPosition ? mapPosition.lng : undefined
    };

    try {
      if (formData.id) {
        await updateAddress(formData.id, payload);
      } else {
        await addAddress(payload);
      }

      Swal.fire({ 
        icon: "success", 
        title: "Berhasil!", 
        timer: 1500, 
        showConfirmButton: false,
        didOpen: (toast) => {
           if (toast.parentElement) toast.parentElement.style.zIndex = "99999"; 
        }
      });
      handleCloseModal();
      fetchAddresses();
    } catch (err) {
      Swal.fire({ 
        icon: "error", 
        title: "Gagal", 
        text: "Cek kembali koneksi Anda.",
        didOpen: (toast) => {
           if (toast.parentElement) toast.parentElement.style.zIndex = "99999"; 
        }
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({ title: "Hapus Alamat?", text: "Alamat akan hilang permanen.", icon: "warning", showCancelButton: true, confirmButtonColor: "#ef4444", confirmButtonText: "Ya, Hapus!" });
    if (result.isConfirmed) {
      try { await deleteAddress(id); fetchAddresses(); } 
      catch (err) { Swal.fire("Gagal", "Terjadi kesalahan.", "error"); }
    }
  };

  const handleSetDefault = async (id: string) => {
    try { await setDefaultAddress(id); fetchAddresses(); } 
    catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-primary">
      <Loader2 className="animate-spin mb-3" size={32} />
      <p className="text-sm font-medium text-gray-500">Memuat alamat Anda...</p>
    </div>
  );

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Alamat Saya</h2>
          <p className="text-sm text-gray-500 mt-1">Kelola daftar lokasi pengiriman pesanan Anda</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} /> Tambah Alamat
        </button>
      </div>

      {/* List Alamat */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 border border-gray-200 rounded-md">
            <Map className="text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium text-sm">Belum ada alamat tersimpan</p>
          </div>
        ) : (
          addresses.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 sm:p-5 rounded-md border transition-colors ${
                item.is_default 
                  ? "border-primary bg-blue-50/30" 
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                
                <div className="flex gap-3 sm:gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-md flex items-center justify-center shrink-0 ${
                    item.is_default ? "bg-primary text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Home size={18} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-800 text-sm sm:text-base">{item.label}</span>
                      {item.is_default && (
                        <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded-md uppercase tracking-wider">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {item.recipient_name} <span className="text-gray-400 font-normal mx-1">|</span> {item.phone_number}
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed mb-2">
                      {item.full_address}
                    </p>
                    
                    {(item.latitude && item.longitude) && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                        <MapPin size={14} /> Titik peta tersimpan
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(item)} 
                      className="text-sm font-medium text-primary hover:text-primary-dark transition-colors px-2 py-1"
                    >
                      Ubah
                    </button>
                    {!item.is_default && (
                      <button 
                        onClick={() => item.id && handleDelete(item.id)} 
                        className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-1"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  {!item.is_default && (
                    <button 
                      onClick={() => item.id && handleSetDefault(item.id)} 
                      className="text-xs font-medium text-gray-600 border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Jadikan Utama
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal  */}
      {showModal && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
            isClosing ? "opacity-0" : "opacity-100"
          }`}
        >
          <div 
            className={`bg-white w-full max-w-2xl rounded-md shadow-lg flex flex-col max-h-[90vh] overflow-hidden transition-all duration-300 ease-in-out transform ${
              isClosing ? "scale-95 translate-y-4 opacity-0" : "scale-100 translate-y-0 opacity-100"
            }`}
          >
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-800">
                {formData.id ? "Ubah Alamat" : "Tambah Alamat"}
              </h3>
              <button 
                onClick={handleCloseModal} 
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar">
              <form id="addressForm" onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Label Alamat</label>
                    <input 
                      required type="text" 
                      value={formData.label} 
                      onChange={(e) => setFormData({...formData, label: e.target.value})} 
                      placeholder="Rumah, Kantor, dll" 
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Penerima</label>
                    <input 
                      required type="text" 
                      value={formData.recipient_name} 
                      onChange={(e) => setFormData({...formData, recipient_name: e.target.value})} 
                      placeholder="Nama Lengkap" 
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon / WhatsApp</label>
                  <input 
                    required type="tel" 
                    value={formData.phone_number} 
                    onChange={(e) => setFormData({...formData, phone_number: e.target.value})} 
                    placeholder="08xxxxxxxxxx" 
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors" 
                  />
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tentukan Titik Peta</label>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Cari nama jalan atau area..." 
                        value={searchRegion}
                        onChange={(e) => setSearchRegion(e.target.value)}
                        onFocus={() => { if (searchResults.length > 0) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 250)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchRegion())}
                        className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                      />

                      {/* DROPDOWN HASIL PENCARIAN */}
                      {showSuggestions && searchRegion.length > 3 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-md z-[99999] overflow-hidden">
                          {isSearchingSuggestions ? (
                            <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                              <Loader2 size={16} className="animate-spin text-primary" /> Mencari...
                            </div>
                          ) : searchResults.length > 0 ? (
                            <ul className="max-h-60 overflow-y-auto custom-scrollbar">
                              {searchResults.map((item, idx) => (
                                <li
                                  key={idx}
                                  onClick={() => handleSelectSuggestion(item)}
                                  className="px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                >
                                  <div className="font-medium truncate">{item.name || "Lokasi"}</div>
                                  <div className="text-xs text-gray-500 truncate mt-0.5">{item.display_name}</div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500">Tidak ada hasil ditemukan</div>
                          )}
                        </div>
                      )}

                    </div>
                    <button 
                      type="button" 
                      onClick={handleSearchRegion} 
                      disabled={isSearchingMap} 
                      className="px-4 bg-gray-100 text-gray-700 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {isSearchingMap ? <Loader2 size={16} className="animate-spin" /> : "Cari"}
                    </button>
                  </div>

                  <div className="h-[200px] sm:h-[250px] w-full rounded-md overflow-hidden border border-gray-300 relative bg-gray-50 z-10">
                    <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%", zIndex: 1 }}>
                      <TileLayer 
                        url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`} 
                        attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' 
                      />
                      <MapController center={mapCenter} />
                      <LocationMarker 
                        position={mapPosition} 
                        setPosition={setMapPosition} 
                        onAddressFound={(addr) => setFormData(prev => ({ ...prev, full_address: addr }))} 
                      />
                    </MapContainer>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[1001] bg-white/90 backdrop-blur text-gray-800 px-3 py-1 rounded-md text-[11px] sm:text-xs font-medium border border-gray-200 pointer-events-none">
                      Klik peta untuk menaruh pin
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap</label>
                  <textarea
                    required
                    rows={2}
                    value={formData.full_address}
                    onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Detail / Patokan (Opsional)</label>
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="Cth: Pagar warna hijau, samping masjid"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>

                <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-100 transition-colors mt-2">
                  <input 
                    type="checkbox" 
                    checked={formData.is_default} 
                    onChange={(e) => setFormData({...formData, is_default: e.target.checked})} 
                    className="w-4 h-4 rounded-sm border-gray-300 text-primary focus:ring-primary" 
                  />
                  <span className="text-sm font-medium text-gray-700">Jadikan sebagai alamat utama</span>
                </label>
                
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                type="button" 
                onClick={handleCloseModal} 
                className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="addressForm" 
                disabled={isSubmitting} 
                className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                Simpan
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}