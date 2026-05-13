import React, { useEffect, useState } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/adminOrderService";
import { Eye, CheckCircle, XCircle, X, Search, MapPin, Phone, User, Copy, ExternalLink, Home } from "lucide-react"; 
import Swal from "sweetalert2";

import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 16);
  }, [center, map]);
  return null;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchInvoice, setSearchInvoice] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({ status: filterStatus });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const confirm = await Swal.fire({
      title: `Ubah status ke ${newStatus}?`,
      text: newStatus === "LUNAS" ? "Stok barang akan otomatis dikurangi." : "Status akan diperbarui.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: newStatus === "LUNAS" ? "#10b981" : "#ef4444",
      confirmButtonText: "Ya, Update",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        await updateOrderStatus(orderId, newStatus);
        Swal.fire("Berhasil!", `Pesanan menjadi ${newStatus}`, "success");
        fetchOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } catch (err: any) {
        Swal.fire("Gagal", err.response?.data?.message || "Terjadi kesalahan", "error");
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      LUNAS: "text-green-600 bg-green-50 border border-green-200",
      PENDING: "text-orange-600 bg-orange-50 border border-orange-200",
      BATAL: "text-red-600 bg-red-50 border border-red-200",
    };
    const badgeStyle = styles[status] || "text-gray-600 bg-gray-50 border-gray-200";
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${badgeStyle}`}>
        {status}
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => 
    order.invoice_number?.toLowerCase().includes(searchInvoice.toLowerCase())
  );

  // =========================================================
  // HELPER UNTUK MENGAMBIL ALAMAT (SUPER ROBUST)
  // =========================================================
  const getDeliveryInfo = (order: any) => {
    if (!order) return null;

    const user = order.user;
    
    const addressArray = user?.addresses || user?.Address || user?.user_addresses || user?.address || [];
    
    if (Array.isArray(addressArray) && addressArray.length > 0) {
      return addressArray.find((addr: any) => addr.is_default) || addressArray[0];
    }

    if (order.address && typeof order.address === 'object') return order.address;
    
    if (order.shipping_address) return { full_address: order.shipping_address };
    if (order.address && typeof order.address === 'string') return { full_address: order.address };
    if (user?.address && typeof user.address === 'string') return { full_address: user.address };

    return null;
  };

  const handleCopy = (text: string, label: string) => {
    if (!text || text === "Alamat tidak tersedia") return;
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${label} disalin!`,
      showConfirmButton: false,
      timer: 1500
    });
  };

  const addr = getDeliveryInfo(selectedOrder);
  const lat = addr?.latitude ? Number(addr.latitude) : null;
  const lng = addr?.longitude ? Number(addr.longitude) : null;

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HEADER & FILTER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h1>
            <p className="text-sm text-gray-500 mt-1">Kelola dan pantau semua transaksi masuk.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Paste No. Invoice di sini..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                value={searchInvoice}
                onChange={(e) => setSearchInvoice(e.target.value)}
              />
            </div>

            <select
              className="w-full sm:w-auto bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Semua Status</option>
              <option value="PENDING">Belum Bayar (Pending)</option>
              <option value="LUNAS">Selesai (Lunas)</option>
              <option value="BATAL">Dibatalkan</option>
            </select>
          </div>
        </div>

        {/* --- TABLE --- */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Invoice & Tanggal</th>
                  <th className="p-4 font-semibold">Pelanggan</th>
                  <th className="p-4 font-semibold">Total Tagihan</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-500">Memuat data...</td></tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{order.invoice_number}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-gray-800">{order.user?.full_name}</div>
                        <div className="text-xs text-gray-500">{order.user?.phone_number || "No HP tidak ada"}</div>
                      </td>
                      <td className="p-4 font-bold text-blue-600">Rp {Number(order.total_price).toLocaleString('id-ID')}</td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status === "PENDING" && (
                            <>
                              <button onClick={() => handleUpdateStatus(order.id, "LUNAS")} className="text-white bg-green-500 hover:bg-green-600 p-1.5 rounded-md transition shadow-sm" title="Tandai Lunas"><CheckCircle size={16} /></button>
                              <button onClick={() => handleUpdateStatus(order.id, "BATAL")} className="text-white bg-red-500 hover:bg-red-600 p-1.5 rounded-md transition shadow-sm" title="Batalkan"><XCircle size={16} /></button>
                            </>
                          )}
                          <button onClick={() => setSelectedOrder(order)} className="text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-blue-600 px-3 py-1.5 rounded-md transition font-medium text-xs flex items-center gap-1.5 shadow-sm">
                            <Eye size={14} /> Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-10 text-center text-gray-500">Tidak ada pesanan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL DETAIL PESANAN --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-none mb-1">Detail Pesanan</h2>
                <p className="text-xs text-gray-500">{selectedOrder.invoice_number}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-700 hover:bg-gray-200 p-1.5 rounded-full transition"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6 text-sm text-gray-700 overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Waktu Pemesanan</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedOrder.created_at).toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>

              {/* INFORMASI PENGIRIMAN & MAP */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <User size={16} className="text-blue-500" /> Informasi Pengiriman
                </h3>
                
                <div className="space-y-4">
                  {/* LEAFLET MAP CONTAINER */}
                  {lat && lng ? (
                    <div className="relative group">
                      <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 z-10 relative shadow-inner bg-gray-50">
                        <MapContainer 
                          center={[lat, lng]} 
                          zoom={16} 
                          style={{ height: "100%", width: "100%" }}
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[lat, lng]} />
                          <MapController center={[lat, lng]} />
                        </MapContainer>
                      </div>
                      <a 
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-2 right-2 z-[11] bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 hover:bg-white transition-all shadow-sm"
                      >
                        <ExternalLink size={12} /> Buka di Google Maps
                      </a>
                    </div>
                  ) : (
                    <div className="bg-gray-100 h-[80px] flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-400 italic text-xs">
                      <MapPin size={20} className="mb-1 opacity-50" />
                      Pin lokasi tidak tersedia
                    </div>
                  )}

                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
                    
                    {/* Row Nama & Email */}
                    <div className="flex gap-3 group items-start">
                      <User size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">
                          {addr?.recipient_name || selectedOrder.user?.full_name || "Nama tidak tersedia"}
                        </p>
                        <p className="text-xs text-gray-500">{selectedOrder.user?.email}</p>
                      </div>
                      <button onClick={() => handleCopy(selectedOrder.user?.email, "Email")} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition-opacity"><Copy size={14} /></button>
                    </div>

                    {/* Row No WA */}
                    <div className="flex gap-3 group items-center">
                      <Phone size={16} className="text-gray-400 flex-shrink-0" />
                      <p className="font-medium text-gray-800 flex-1">
                        {addr?.phone_number || selectedOrder.user?.phone_number || "Nomor HP belum diisi"}
                      </p>
                      <button onClick={() => handleCopy(addr?.phone_number || selectedOrder.user?.phone_number, "No WA")} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition-opacity"><Copy size={14} /></button>
                    </div>

                    {/* Row Detail Alamat */}
                    <div className="flex gap-3 items-start group">
                      <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        {addr?.label && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 mb-1.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wide">
                            <Home size={10} /> {addr.label}
                          </span>
                        )}
                        <p className="text-gray-700 leading-relaxed">
                          {addr?.full_address || "Alamat tidak tersedia. (User mungkin belum mengisi alamat di profilnya)"}
                        </p>
                      </div>
                      <button onClick={() => handleCopy(addr?.full_address, "Alamat")} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-blue-600 transition-opacity mt-0.5"><Copy size={14} /></button>
                    </div>

                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3">Rincian Barang</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-gray-800 line-clamp-2">{item.product_name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {item.variasi && <span className="mr-2">Var: {item.variasi}</span>}
                          {item.quantity} x Rp {Number(item.price).toLocaleString('id-ID')}
                        </div>
                      </div>
                      <div className="font-bold text-gray-900">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                  <div className="text-xs font-bold text-orange-600 mb-1 italic">Catatan Pembeli:</div>
                  <div className="text-gray-700 italic">"{selectedOrder.notes}"</div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <span className="font-bold text-gray-800 text-base">Total Tagihan</span>
                <span className="font-bold text-2xl text-blue-600">Rp {Number(selectedOrder.total_price).toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setSelectedOrder(null)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold text-sm transition">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}