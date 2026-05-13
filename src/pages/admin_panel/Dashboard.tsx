import React, { useEffect, useState } from 'react';
import { Eye, TrendingUp, CalendarRange, Search } from 'lucide-react';
import { getTopViewedProducts } from '../../services/adminProductService';

type Period = 'today' | 'week' | 'month' | 'custom';

const PERIODS = [
  { key: 'today', label: 'Hari ini' },
  { key: 'week',  label: 'Minggu ini' },
  { key: 'month', label: 'Bulan ini' },
  { key: 'custom', label: 'Rentang' },
] as const;

export default function DashboardPage() {
  const [data, setData]       = useState<any[]>([]);
  const [period, setPeriod]   = useState<Period>('week');
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [sort, setSort]       = useState<'desc' | 'asc'>('desc');

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState(weekAgo);
  const [dateTo, setDateTo]     = useState(today);

  useEffect(() => {
    if (period !== 'custom') fetchData();
  }, [period]);

  const fetchData = async (from?: string, to?: string) => {
    setLoading(true);
    try {
      const res = await getTopViewedProducts(period, {
        limit: 20,
        from: from ?? dateFrom,
        to: to ?? dateTo,
      });
      setData(res || []);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCustom = () => {
    if (!dateFrom || !dateTo) return;
    fetchData(dateFrom, dateTo);
  };

  const filtered = data
    .filter(d => d.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sort === 'desc'
        ? b.total_views - a.total_views
        : a.total_views - b.total_views
    );

  const maxViews = Math.max(...filtered.map(d => d.total_views), 1);
  const totalViews = filtered.reduce((s, d) => s + Number(d.total_views), 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Statistik Produk</h1>
        <p className="text-sm text-gray-400 mt-0.5">Pantau produk mana yang paling banyak dilirik pelanggan</p>
      </div>

      {/* PERIOD TABS */}
      <div className="flex items-center gap-2 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p.key
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            {p.key === 'custom' && <CalendarRange size={14} />}
            {p.label}
          </button>
        ))}
      </div>

      {/* CUSTOM DATE PICKER */}
      {period === 'custom' && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-wrap items-end gap-4 shadow-sm">
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Dari tanggal</label>
            <input
              type="date"
              value={dateFrom}
              max={dateTo}
              onChange={e => setDateFrom(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 font-medium block mb-1">Sampai tanggal</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={today}
              onChange={e => setDateTo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button
            onClick={handleApplyCustom}
            className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
          >
            Terapkan
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-1">Total views</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '—' : totalViews.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-medium mb-1">Produk terlacak</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? '—' : data.length}
          </p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm col-span-2 sm:col-span-1">
          <p className="text-xs text-gray-400 font-medium mb-1">Produk teratas</p>
          <p className="text-sm font-bold text-gray-900 truncate">
            {loading ? '—' : (data[0]?.name ?? 'Belum ada data')}
          </p>
          {!loading && data[0] && (
            <p className="text-xs text-primary font-semibold mt-0.5">
              {Number(data[0].total_views).toLocaleString()} views
            </p>
          )}
        </div>
      </div>

      {/* TABLE AREA */}
      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        {/* TABLE TOOLBAR */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Eye size={15} className="text-gray-400" />
            Ranking produk
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-44"
              />
            </div>
            <button
              onClick={() => setSort(s => s === 'desc' ? 'asc' : 'desc')}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-300 transition-all"
            >
              <TrendingUp size={13} />
              {sort === 'desc' ? 'Tertinggi' : 'Terendah'}
            </button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="space-y-0">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50">
                <div className="w-6 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" />
                <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {data.length === 0 ? 'Belum ada data kunjungan untuk periode ini.' : 'Produk tidak ditemukan.'}
          </div>
        ) : (
          <div>
            {filtered.map((item, i) => {
              const pct = Math.round((item.total_views / maxViews) * 100);
              const isTop = i === 0 && sort === 'desc';
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group ${isTop ? 'bg-blue-50/40' : ''}`}
                >
                  {/* RANK */}
                  <div className={`w-6 text-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? 'text-amber-500' :
                    i === 1 ? 'text-gray-400' :
                    i === 2 ? 'text-orange-400' :
                    'text-gray-300'
                  }`}>
                    {i + 1}
                  </div>

                  {/* NAME + BAR */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate mb-1.5 ${isTop ? 'text-primary' : 'text-gray-800'}`}>
                      {item.name}
                    </p>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-primary' : 'bg-gray-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* VIEWS */}
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${isTop ? 'text-primary' : 'text-gray-700'}`}>
                      {Number(item.total_views).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">views</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}