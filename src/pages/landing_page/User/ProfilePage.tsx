import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Loader2, Camera, AlertTriangle } from "lucide-react";
import { getUserProfile, updateUserProfile, uploadAvatar } from "../../../services/userAuthService";
import Swal from "sweetalert2";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    avatar_url: "",
    gender: "", 
    date_of_birth: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []); 

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await getUserProfile();
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        phone_number: data.phone_number || "",
        avatar_url: data.avatar_url || "",
        gender: data.gender || "",
        date_of_birth: data.birth_date ? data.birth_date.split("T")[0] : "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      Swal.fire("Ukuran Terlalu Besar", "Maksimal ukuran gambar adalah 1 MB", "error");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    try {
      setSaving(true);
      const res = await uploadAvatar(file);
      setFormData({ ...formData, avatar_url: res.avatar_url });
      Swal.fire({ icon: 'success', title: 'Foto diunggah', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    } catch (err) {
      Swal.fire("Gagal", "Gagal mengunggah gambar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        gender: formData.gender,
        avatar_url: formData.avatar_url,
        birth_date: formData.date_of_birth,
      };

      await updateUserProfile(payload);
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Profil diperbarui!', timer: 1500, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal update data.' });
    } finally {
      setSaving(false);
    }
  };

  const [errors, setErrors] = useState({ full_name: "", phone_number: "" });
  const validate = () => {
    const newErrors = { full_name: "", phone_number: "" };
    if (!formData.full_name.trim()) newErrors.full_name = "Nama wajib diisi";
    if (!formData.phone_number.trim()) newErrors.phone_number = "Nomor WhatsApp wajib diisi";
    setErrors(newErrors);
    return !newErrors.full_name && !newErrors.phone_number;
  };

  const getAvatarUrl = () => {
    if (imagePreview) return imagePreview;
    if (!formData.avatar_url) return "/default-avatar.png";
    if (formData.avatar_url.startsWith("http")) return formData.avatar_url;
    return `${import.meta.env.VITE_API_BASE}${formData.avatar_url}`;
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="animate-fadeIn w-full max-w-4xl mx-auto">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Profil Saya</h2>
        {/* <p className="text-sm text-gray-500 mt-1">Kelola informasi profil untuk keamanan akun Anda.</p> */}
      </div>

      {!formData.phone_number && (
        <div className="mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-3">
          <AlertTriangle className="text-orange-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-semibold text-orange-800">Lengkapi Nomor WhatsApp</h4>
            <p className="text-xs text-orange-700 mt-1">
              Wajib diisi sebelum melakukan pesanan.
            </p>
          </div>
        </div>
      )}

      {/* flex-col-reverse membuat foto ada di atas saat versi mobile */}
      <div className="flex flex-col-reverse md:flex-row gap-8 md:gap-12">
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-2 md:gap-4">
            <label className="text-sm font-medium text-gray-700">Nama <span className="text-red-500">*</span></label>
            <div>
              <input 
                type="text" 
                value={formData.full_name} 
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
                className={`w-full px-3 py-2 border rounded-md outline-none transition-colors text-sm ${errors.full_name ? "border-red-500 focus:border-red-500" : "focus:border-primary border-gray-300"}`} 
              />
              {errors.full_name && <p className="text-xs text-red-500 mt-1">{errors.full_name}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-2 md:gap-4">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <span className="text-sm text-gray-600 px-3 py-2 bg-gray-50 border border-gray-100 rounded-md block w-full md:w-auto md:inline-block">
              {formData.email}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-2 md:gap-4">
            <label className="text-sm font-medium text-gray-700">No WhatsApp <span className="text-red-500">*</span></label>
            <div>
              <input 
                type="tel" 
                value={formData.phone_number} 
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} 
                placeholder="Contoh: 081234567890" 
                className={`w-full px-3 py-2 border rounded-md outline-none transition-colors text-sm ${errors.phone_number || !formData.phone_number ? "border-orange-400 focus:border-orange-500 bg-orange-50/30" : "focus:border-primary border-gray-300"}`} 
              />
              {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-start md:items-center gap-2 md:gap-4">
            <label className="text-sm font-medium text-gray-700">Jenis Kelamin</label>
            <div className="flex flex-wrap gap-4 md:gap-6 mt-1 md:mt-0">
              {[{ label: 'Laki-laki', value: 'MALE' }, { label: 'Perempuan', value: 'FEMALE' }, { label: 'Lainnya', value: 'OTHER' }].map(g => (
                <label key={g.value} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input 
                    type="radio" 
                    name="gender" 
                    value={g.value} 
                    checked={formData.gender === g.value} 
                    onChange={(e) => setFormData({...formData, gender: e.target.value})} 
                    className="accent-primary w-4 h-4" 
                  /> 
                  {g.label}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] items-center gap-2 md:gap-4">
            <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
            <input 
              type="date" 
              value={formData.date_of_birth} 
              onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} 
              className="w-full md:w-auto px-3 py-2 border border-gray-300 rounded-md outline-none focus:border-primary text-sm text-gray-700" 
            />
          </div>

          <div className="pt-6 md:ml-[156px]">
            <button 
              type="submit" 
              disabled={saving} 
              className="w-full md:w-auto bg-primary text-white px-8 py-2.5 rounded-md font-medium hover:bg-primary-dark disabled:opacity-70 transition-colors flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Simpan Profil"}
            </button>
          </div>
        </form>

        <div className="w-full md:w-48 flex flex-col items-center md:border-l border-gray-200 md:pl-8">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border bg-gray-100">
              <img src={getAvatarUrl()} className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="text-white" size={24} />
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/png, image/jpeg" onChange={handleFileChange} />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 border border-gray-300 text-gray-700 px-4 py-1.5 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            Pilih Foto
          </button>
          
          <p className="mt-3 text-[11px] text-gray-400 text-center leading-relaxed">
            Ukuran maks: 1 MB <br/> Format: JPEG, PNG
          </p>
        </div>
      </div>
    </div>
  );
}