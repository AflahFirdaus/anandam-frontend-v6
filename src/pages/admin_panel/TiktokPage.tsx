import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Power, Wifi, WifiOff, Activity } from "lucide-react";
import {
  getTikTokLiveStatus,
  setTikTokLiveStatus,
} from "../../services/tiktokService";

export default function TiktokPage() {
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await getTikTokLiveStatus();
      setIsLive(res.is_live);
    } catch (err) {
      console.error("Gagal fetch status live", err);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await setTikTokLiveStatus(!isLive);
      setIsLive(res.is_live);
    } catch (err) {
      console.error("Gagal update live status", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-gradient-to-br from-slate-900 via-gray-900 to-black rounded-xl">
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] transition-colors duration-1000 ${isLive ? 'bg-red-500/20' : 'bg-blue-500/10'}`} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md overflow-hidden border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl rounded-3xl"
      >
        <div className="p-8">
          {/* HEADER */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Live Control</h1>
              <p className="text-sm text-gray-400">Manage your TikTok stream</p>
            </div>
            <div className={`p-3 rounded-2xl ${isLive ? 'bg-red-500/10 text-red-500' : 'bg-gray-500/10 text-gray-400'}`}>
              {isLive ? <Radio className="w-6 h-6 animate-pulse" /> : <WifiOff className="w-6 h-6" />}
            </div>
          </div>

          {/* STATUS CARD */}
          <div className="relative flex flex-col items-center justify-center p-10 mb-8 border border-white/5 bg-white/5 rounded-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLive ? "live" : "offline"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center"
              >
                {isLive ? (
                  <>
                    <div className="relative mb-4">
                      <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25" />
                      <div className="relative p-4 bg-red-500 rounded-full">
                        <Activity className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-red-500 uppercase">Streaming Now</span>
                  </>
                ) : (
                  <>
                    <div className="p-4 mb-4 bg-gray-700 rounded-full">
                      <Power className="w-8 h-8 text-gray-400" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">System Offline</span>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* TOGGLE BUTTON */}
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`
              relative w-full py-4 overflow-hidden rounded-2xl font-bold text-white transition-all duration-300
              active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
              ${isLive 
                ? "bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 shadow-lg shadow-black/20" 
                : "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-lg shadow-red-500/20"
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Power className="w-5 h-5" />
                  {isLive ? "Terminate Stream" : "Go Live Now"}
                </>
              )}
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}