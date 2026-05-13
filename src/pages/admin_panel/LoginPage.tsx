import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { FiUser, FiEye, FiEyeOff, FiX, FiAlertCircle } from "react-icons/fi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // State untuk validasi field
  const [errors, setErrors] = useState({ username: "", password: "" });
  
  // State untuk modal error login
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleLogin = async (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();

    // Reset error
    let newErrors = { username: "", password: "" };
    let hasError = false;

    // Validasi kosong
    if (!username.trim()) {
      newErrors.username = "Username harus diisi";
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = "Password harus diisi";
      hasError = true;
    }

    setErrors(newErrors);

    // Jika ada yang kosong, hentikan proses
    if (hasError) return;

    try {
      await login({
        username,
        password,
      });

      navigate("/ayamgoreng/dashboard");
    } catch (err: any) {
      // Tangkap error dari API dan tampilkan di modal
      setModalMessage(
        err.response?.data?.message || "Kombinasi username dan password salah atau terjadi kesalahan server."
      );
      setIsModalOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#818cf8]">
        
        {/* LEFT SIDE */}
        <div className="hidden w-1/2 lg:flex items-center justify-center">
          <img
            src="/logoanandam.svg"
            alt="logo"
            className="w-[500px]"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center justify-center w-full lg:w-1/2">
          <div className="w-full max-w-md p-10 bg-white shadow-2xl rounded-2xl">

            <h2 className="mb-2 text-2xl font-semibold text-center">
              Welkam Bek
            </h2>
            <p className="mb-8 text-sm text-center text-gray-500">
              Semoga kita selalu dilindungi Tuhan Yang Maha Esa dalam setiap langkah kita. Aamiin.
            </p>

            <form onSubmit={handleLogin} className="space-y-6">

              {/* Username */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errors.username) setErrors({ ...errors, username: "" });
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full py-3 pr-10 border-b focus:outline-none placeholder-gray-400 text-black transition-colors ${
                      errors.username ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                    }`}
                  />
                  <FiUser className={`absolute right-2 top-3 ${errors.username ? "text-red-500" : "text-gray-400"}`} />
                </div>
                {errors.username && (
                  <p className="mt-1 text-xs font-medium text-red-500 animate-pulse">*{errors.username}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    onKeyDown={handleKeyDown}
                    className={`w-full py-3 pr-10 transition-all duration-300 border-b focus:outline-none ${
                      errors.password ? "border-red-500 focus:border-red-500" : "border-gray-300 focus:border-indigo-500"
                    }`}
                  />

                  {/* TOGGLE SHOW/HIDE */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs font-medium text-red-500 animate-pulse">*{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 font-semibold text-white transition duration-300 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
              >
                Login
              </button>
            </form>

          </div>
        </div>
      </div>

      {/* MODAL ERROR LOGIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm p-6 bg-white rounded-2xl shadow-xl transform transition-all animate-slideUp">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <FiAlertCircle size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Login Gagal</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {modalMessage}
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full py-2.5 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}