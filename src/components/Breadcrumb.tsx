import { Link } from "react-router-dom";

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-black w-full overflow-hidden">
      {/* flex-wrap memungkinkan item terakhir pindah ke baris bawah jika lebarnya 100% */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div
              key={index}
              /* isLast: w-full bikin nama produk turun ke baris baru di mobile.
                 min-w-0: supaya truncate bisa jalan.
                 !isLast: shrink-0 supaya teks 'Home' & 'Katalog' tidak gepeng/terpotong. */
              className={`flex items-center gap-2 ${isLast ? "w-full sm:w-auto min-w-0" : "shrink-0"}`}
            >
              {item.path && !isLast ? (
                <Link
                  to={item.path}
                  /* Hapus max-w dan truncate di sini agar Home & Katalog tampil utuh */
                  className="hover:text-primary transition whitespace-nowrap"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  title={item.label}
                  /* truncate & block: khusus baris terakhir biar sebaris & ada titik tiga.
                     sm:inline: di desktop balik lagi jadi sejajar ke samping. */
                  className={`text-black font-medium ${isLast ? "truncate block sm:inline w-full" : "whitespace-nowrap"}`}
                >
                  {item.label}
                </span>
              )}

              {/* Pemisah › */}
              {!isLast && (
                <span className="text-black shrink-0">›</span>
              )}
            </div>
          );
        })}

      </div>
    </nav>
  );
}