import { useEffect, useState, useCallback } from "react";
import { Search, Users, MapPin, Phone, Mail, Calendar, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { adminGetAllUsers, type UserAdminDto } from "../../services/userAuthService";

// ============================================================
// HELPERS
// ============================================================
const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const getInitials = (name: string) =>
  name?.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";

const AVATAR_COLORS = [
  "bg-blue-500", "bg-violet-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-cyan-500",
];
const getAvatarColor = (id: string) =>
  AVATAR_COLORS[id?.charCodeAt(0) % AVATAR_COLORS.length] || "bg-gray-400";

// ============================================================
// SUB-COMPONENTS
// ============================================================

function UserAvatar({ user }: { user: UserAdminDto }) {
  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
    );
  }
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${getAvatarColor(user.id)}`}>
      {getInitials(user.full_name)}
    </div>
  );
}

function GenderBadge({ gender }: { gender?: string }) {
  if (!gender) return <span className="text-gray-300">—</span>;
  const map: Record<string, { label: string; cls: string }> = {
    MALE:   { label: "Pria",    cls: "bg-blue-50 text-blue-600" },
    FEMALE: { label: "Wanita",  cls: "bg-pink-50 text-pink-600" },
    OTHER:  { label: "Lainnya", cls: "bg-gray-100 text-gray-500" },
  };
  const { label, cls } = map[gender] || map.OTHER;
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${cls}`}>{label}</span>
  );
}

// ============================================================
// DETAIL DRAWER
// ============================================================
function UserDetailDrawer({ user, onClose }: {
  user: UserAdminDto;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full overflow-y-auto animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-base font-bold text-gray-800">Detail User</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Card */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            {user.avatar_url ? (
              <img src={user.avatar_url} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow" alt={user.full_name} />
            ) : (
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow ${getAvatarColor(user.id)}`}>
                {getInitials(user.full_name)}
              </div>
            )}
            <div>
              <p className="font-bold text-gray-900 text-base">{user.full_name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-1.5">
                <GenderBadge gender={user.gender} />
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Informasi Kontak</h3>
            <div className="space-y-2">
              {[
                { icon: Mail,     label: "Email",     value: user.email },
                { icon: Phone,    label: "Telepon",   value: user.phone_number || "—" },
                { icon: Calendar, label: "Tgl Lahir", value: formatDate(user.birth_date) },
                { icon: Calendar, label: "Bergabung", value: formatDate(user.created_at) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-sm text-gray-700 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          {user.addresses && user.addresses.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Alamat ({user.addresses.length})
              </h3>
              <div className="space-y-2">
                {user.addresses.map((addr: any) => (
                  <div key={addr.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        {addr.label}
                      </span>
                      {addr.is_default && (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          Utama
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-700">{addr.recipient_name} · {addr.phone_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-start gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-gray-400" />
                      {addr.full_address}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// USER ROW
// ============================================================
function UserRow({ user, onViewDetail }: {
  user: UserAdminDto;
  onViewDetail: (u: UserAdminDto) => void;
}) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user.full_name}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {user.phone_number || <span className="text-gray-300">—</span>}
      </td>
      <td className="px-4 py-3">
        <GenderBadge gender={user.gender} />
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="w-3 h-3" />
          {user.addresses?.length ?? 0}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
        {formatDate(user.created_at)}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onViewDetail(user)}
          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition opacity-80 group-hover:opacity-100"
        >
          Detail
        </button>
      </td>
    </tr>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAdminDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserAdminDto | null>(null);
  const [sortField, setSortField] = useState<string>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminGetAllUsers({ page, limit, search });
      setUsers(res.data);
      setTotal(res.total);
      setLastPage(res.last_page);
    } catch (err) {
      console.error("Gagal memuat users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(lastPage, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown size={12} className="text-gray-300" />;
    return sortDir === "asc"
      ? <ChevronUp size={12} className="text-blue-500" />
      : <ChevronDown size={12} className="text-blue-500" />;
  };

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen User
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Total {total.toLocaleString("id-ID")} pengguna terdaftar</p>
        </div>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
        <div className="w-full overflow-x-auto">
          <table className="min-w-[650px] w-full text-xs table-auto">
            <thead className="bg-white">
              <tr className="border-b">
                <th colSpan={6} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 font-normal">
                      Menampilkan <span className="font-semibold text-gray-700">{users.length}</span> dari{" "}
                      <span className="font-semibold text-gray-700">{total}</span> user
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Cari nama, email, telepon..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="w-56 sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </th>
              </tr>
              <tr className="border-b bg-gray-50 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <th className="px-4 py-2.5 text-left min-w-[220px]">
                  <button className="flex items-center gap-1" onClick={() => handleSort("full_name")}>
                    User <SortIcon field="full_name" />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-left min-w-[130px]">Telepon</th>
                <th className="px-4 py-2.5 text-left min-w-[80px]">Gender</th>
                <th className="px-4 py-2.5 text-center min-w-[80px]">Alamat</th>
                <th className="px-4 py-2.5 text-left min-w-[110px]">
                  <button className="flex items-center gap-1" onClick={() => handleSort("created_at")}>
                    Bergabung <SortIcon field="created_at" />
                  </button>
                </th>
                <th className="px-4 py-2.5 text-center min-w-[80px]">Aksi</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" style={{ width: j === 0 ? "80%" : "60%" }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">Tidak ada user ditemukan</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <UserRow key={user.id} user={user} onViewDetail={setSelectedUser} />
                ))
              )}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={6} className="px-4 py-4 bg-white border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Show</span>
                      <select
                        value={limit}
                        onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                        className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                      >
                        {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                      <span>entries</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <button disabled={page === 1} onClick={() => setPage(1)} className="px-2 py-1 disabled:opacity-30 hover:text-blue-600">{"<<"}</button>
                      <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 disabled:opacity-30 hover:text-blue-600">{"<"}</button>
                      {getPageNumbers().map((num) => (
                        <button key={num} onClick={() => setPage(num)}
                          className={`px-2.5 py-1 rounded ${page === num ? "font-bold text-blue-600 bg-blue-50" : "text-gray-600 hover:text-blue-600"}`}>
                          {num}
                        </button>
                      ))}
                      {lastPage > 5 && page + 2 < lastPage && <span className="px-1 text-gray-400">...</span>}
                      <button disabled={page === lastPage} onClick={() => setPage(p => p + 1)} className="px-2 py-1 disabled:opacity-30 hover:text-blue-600">{">"}</button>
                      <button disabled={page === lastPage} onClick={() => setPage(lastPage)} className="px-2 py-1 disabled:opacity-30 hover:text-blue-600">{">>"}</button>
                    </div>
                  </div>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {selectedUser && (
        <UserDetailDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.22s ease-out; }
      `}</style>
    </div>
  );
}
