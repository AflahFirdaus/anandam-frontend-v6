import { useState } from "react";
import { Loader2, Mail, X } from "lucide-react";
import { forgotPasswordUser } from "../services/userAuthService";
import Swal from "sweetalert2";

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await forgotPasswordUser(email);
            Swal.fire({
                icon: "success",
                title: "Email Terkirim",
                text: "Silakan cek kotak masuk email Anda untuk link reset password.",
                didOpen: (toast) => {
                    if (toast.parentElement) toast.parentElement.style.zIndex = "10000"; 
                }
            });
            setEmail("");
            onClose(); 
        } catch (error: any) {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: error.response?.data?.message || "Email tidak terdaftar",
                didOpen: (toast) => {
                    if (toast.parentElement) toast.parentElement.style.zIndex = "10000"; 
                }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
            <div className="max-w-md w-full bg-white rounded-md border border-gray-200 shadow-lg animate-popIn relative overflow-hidden">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded-md"
                >
                    <X size={18} />
                </button>
                
                <div className="p-6 sm:p-8">
                    <div className="text-center mb-8 mt-2">
                        <h2 className="text-xl font-bold text-gray-800 uppercase tracking-tight">Lupa Password</h2>
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                            Masukkan alamat email akun Anda. Kami akan mengirimkan tautan untuk mengatur ulang password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-600 ml-1">Alamat Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-md outline-none focus:border-primary transition-colors text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 text-gray-600 text-sm font-bold rounded-md border border-gray-300 hover:bg-gray-50 transition-colors uppercase tracking-wider"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] py-2.5 bg-primary text-white text-sm font-bold rounded-md hover:bg-primary-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wider"
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : "Kirim Link"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}