import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

export default function PageLoader() {
  const location = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    const handleLoad = () => {
      setTimeout(() => {
        setLoading(false)
      }, 300) // biar animasi smooth
    }

    if (document.readyState === "complete") {
      requestAnimationFrame(handleLoad)
    } else {
      window.addEventListener("load", handleLoad)
      return () => window.removeEventListener("load", handleLoad)
    }

  }, [location.pathname])

  if (!loading) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center backdrop-blur-sm bg-white/40">
      
      <div className="flex flex-col items-center gap-4">

        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-sm text-gray-600">
          Memuat halaman...
        </p>

      </div>

    </div>
  )
}