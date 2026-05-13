import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { resetPasswordUser } from "../../../services/userAuthService";
import Swal from "sweetalert2";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [formData, setFormData] = useState({ password: "", confirm_password: "" });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      return Swal.fire("Error", "Password baru minimal 6 karakter", "error");
    }

    if (formData.password !== formData.confirm_password) {
      return Swal.fire("Error", "Konfirmasi password tidak cocok", "error");
    }
    
    if (!token) {
      return Swal.fire("Error", "Token tidak valid atau sudah kadaluarsa. Silakan minta link baru.", "error");
    }

    setLoading(true);
    try {
      await resetPasswordUser({ token, password: formData.password });
      
      await Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Password Anda telah diperbarui.",
        timer: 2000,
        showConfirmButton: false
      });
      
      navigate("/"); 
    } catch (err: any) {
      Swal.fire("Gagal", err.response?.data?.message || "Token expired atau tidak valid", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-md border border-gray-200 animate-fadeIn">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-gray-50 text-primary rounded-md flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <ShieldCheck size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Atur Ulang Password</h2>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Masukkan password baru yang kuat untuk mengamankan akun Anda kembali.
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {/* Kolom Password Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Password Baru</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                required
                type={showPass ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowPass(!showPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Kolom Konfirmasi Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600 ml-1">Konfirmasi Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                required
                type={showConfirmPass ? "text" : "password"}
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Ulangi password baru"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPass(!showConfirmPass)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-white font-bold rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 mt-4 text-sm uppercase tracking-wider"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Simpan Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full text-xs text-gray-500 font-medium hover:text-primary transition-colors py-2"
          >
            Batal & Kembali ke Beranda
          </button>
        </form>
      </div>
    </div>
  );
}