import { useState } from "react";
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { changePasswordUser } from "../../../services/userAuthService";
import Swal from "sweetalert2";

import ForgotPasswordModal from "../../../components/ForgotPassword"; 

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      return Swal.fire("Error", "Konfirmasi password baru tidak cocok", "error");
    }
    if (formData.new_password.length < 6) {
      return Swal.fire("Error", "Password baru minimal 6 karakter", "error");
    }

    setLoading(true);
    try {
      await changePasswordUser({
        old_password: formData.old_password,
        new_password: formData.new_password,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password Anda telah diubah!",
        timer: 2000,
        showConfirmButton: false,
      });

      setFormData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Gagal mengubah password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn w-full max-w-2xl mx-auto">
      {/* Header Halaman */}
      <div className="border-b border-gray-100 pb-4 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Ubah Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Demi keamanan akun, pastikan password Anda kuat dan tidak mudah ditebak.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        {/* Password Lama */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600 ml-1">Password Saat Ini</label>
          <div className="relative">
            <input
              required
              type={showOld ? "text" : "password"}
              value={formData.old_password}
              onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
              placeholder="Masukkan password lama"
            />
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          <div className="text-right">
            <button 
              type="button"
              onClick={() => setIsForgotModalOpen(true)} 
              className="text-[11px] text-primary font-bold hover:underline"
            >
              Lupa password?
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 space-y-5">
          {/* Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Password Baru</label>
            <div className="relative">
              <input
                required
                type={showNew ? "text" : "password"}
                value={formData.new_password}
                onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
                placeholder="Minimal 6 karakter"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Konfirmasi Password Baru</label>
            <input
              required
              type="password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
              placeholder="Ulangi password baru"
            />
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-white px-10 py-2.5 rounded-md font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm uppercase tracking-wider"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            Simpan Password
          </button>
        </div>
      </form>

      <ForgotPasswordModal 
        isOpen={isForgotModalOpen} 
        onClose={() => setIsForgotModalOpen(false)} 
      />
    </div>
  );
}