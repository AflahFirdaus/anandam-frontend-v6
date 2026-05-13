import { useState } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getThumbnailUrl } from "../../imageHelper";
import { ChevronDown, ChevronRight } from "lucide-react";
import api from "../../../services/api";

interface ProductRowProps {
  product: any;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInlineUpdate: (id: string, updates: any) => Promise<void>;
  onToggle: (id: string, field: "is_active" | "is_popular", currentValue: boolean) => void;
  onEdit: (product: any) => void;
  onImageClick: (url: string) => void;
  duplicateRowClass?: string;
}

export default function ProductRow({
  product, onToggle, onEdit, onImageClick, isSelected, onSelect, onInlineUpdate,
  duplicateRowClass,
}: ProductRowProps) {

  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingVariantField, setEditingVariantField] = useState<string | null>(null);
  const [tempVariantValue, setTempVariantValue] = useState<any>(null);

  const hasVariants = product.variants?.length > 0 && product.variants[0]?.variant_name !== "Default";
  const defaultVariant = product.variants?.[0] || {};
  
  const currentPriceNormal = defaultVariant?.price_normal ?? 0;
  const currentPriceDiscount = defaultVariant?.price_discount ?? 0;
  const currentStock = defaultVariant?.stock ?? 0;
  const finalPrice = Number(currentPriceNormal) - Number(currentPriceDiscount);

  const variantSummary = hasVariants ? (() => {
    const prices = product.variants.map((v: any) => Number(v.price_normal || 0) - Number(v.price_discount || 0));
    const totalStock = product.variants.reduce((sum: number, v: any) => sum + Number(v.stock || 0), 0);
    return { minPrice: Math.min(...prices), maxPrice: Math.max(...prices), totalStock, count: product.variants.length };
  })() : null;

  const getCurrentValue = (field: string) => {
    if (field === "price_normal") return currentPriceNormal;
    if (field === "price_discount") return currentPriceDiscount;
    if (field === "stock") return currentStock;
    return product[field];
  };

  const handleBlur = async (field: string) => {
    const originalValue = getCurrentValue(field);

    if (tempValue !== originalValue) {
      try {
        const variantId = product.variants?.[0]?.id;

        if (["price_normal", "price_discount", "stock"].includes(field) && variantId) {
          // 🔥 Untuk harga/stok, kita update via endpoint variant (meskipun produk tanpa variasi)
          await api.put(`/admin/products/variants/${variantId}`, { [field]: tempValue });
          // Update lokal agar UI tidak reset
          if (product.variants[0]) product.variants[0][field] = tempValue;
        } else {
          // 🔥 Untuk nama produk, tetap pakai onInlineUpdate
          await onInlineUpdate(product.id, { [field]: tempValue });
        }
      } catch (err) {
        console.error("Gagal update produk", err);
      }
    }
    setEditingField(null);
  };

  const startEditing = (field: string) => {
    if (hasVariants && ["price_normal", "price_discount", "stock"].includes(field)) return;
    setEditingField(field);
    setTempValue(getCurrentValue(field));
  };

  const startEditingVariant = (variantId: string, field: string, currentVal: any) => {
    setEditingVariantField(`${variantId}_${field}`);
    setTempVariantValue(currentVal);
  };

  const handleVariantBlur = async (variantId: string, field: string, originalVal: any) => {
    if (tempVariantValue !== originalVal) {
      try {
        await api.put(`/admin/products/variants/${variantId}`, { [field]: tempVariantValue });
        const variantIndex = product.variants.findIndex((v: any) => v.id === variantId);
        if (variantIndex !== -1) product.variants[variantIndex][field] = tempVariantValue;
      } catch (err) {
        console.error("Gagal update variant", err);
      }
    }
    setEditingVariantField(null);
  };

  const formatRp = (value: number | string) => {
    if (!value && value !== 0) return "";
    return Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseRp = (value: string) => {
    if (!value) return 0;
    const clean = String(value).replace(/\./g, "");
    return isNaN(Number(clean)) ? 0 : Number(clean);
  };

  const renderInlineInput = (field: string, onBlurFn: () => void, isRupiah = false, isVariant = false) => {
    const value = isVariant ? tempVariantValue : tempValue;
    const setter = isVariant ? setTempVariantValue : setTempValue;

    const displayValue = isRupiah ? formatRp(value || "") : (value ?? "");
    const minChars = field === "name" ? 20 : field === "stock" ? 3 : 8;
    const dynamicWidth = Math.max(String(displayValue).length, minChars);

    return (
      <input
        autoFocus
        type="text"
        style={{ width: `${dynamicWidth + 1.5}ch`, maxWidth: "100%" }}
        className="px-1 py-0.5 text-xs border border-blue-500 rounded focus:outline-none bg-white"
        value={displayValue}
        onChange={(e) => { 
          const val = e.target.value; 
          setter(isRupiah ? parseRp(val) : val); 
        }}
        onBlur={onBlurFn}
        onKeyDown={(e) => {
          if (e.key === "Enter") onBlurFn();
          if (e.key === "Escape") { 
            setEditingField(null); 
            setEditingVariantField(null); 
          }
        }}
      />
    );
  };

  return (
    <>
      <tr className={`transition border-b border-gray-100 hover:bg-opacity-80 ${duplicateRowClass || "bg-white hover:bg-gray-50"}`}>
        <td className="px-3 py-2 text-center sticky left-0 bg-transparent z-10">
          <input type="checkbox" checked={isSelected} onChange={() => onSelect(product.id)} />
        </td>

        <td className="px-3 py-2">
          {(() => {
            const thumbnail = product.thumbnail_url || product.images?.[0]?.thumbnail_url || product.images?.[0]?.image_url;
            return thumbnail ? (
              <img
                loading="lazy"
                src={getThumbnailUrl(thumbnail)}
                alt={product.name}
                width={32}
                height={32}
                onClick={(e) => { const img = e.target as HTMLImageElement; onImageClick(img.src); }}
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.dataset.fallbackApplied === "true") { img.src = "/icon-anandam.svg"; return; }
                  img.dataset.fallbackApplied = "true";
                  const filename = thumbnail.split("/").pop();
                  img.src = `${import.meta.env.VITE_API_BASE}/uploads/products/original/${filename}`;
                }}
                className="object-cover w-8 h-8 rounded cursor-pointer hover:opacity-80 flex-shrink-0"
              />
            ) : (
              <div className="flex items-center justify-center w-8 h-8 text-xs text-gray-400 bg-gray-100 rounded">—</div>
            );
          })()}
        </td>

        <td className="px-3 py-2 font-medium cursor-pointer hover:bg-black/5" onClick={() => startEditing("name")}>
          {editingField === "name" ? renderInlineInput("name", () => handleBlur("name"), false, false) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {hasVariants && (
                <button type="button" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                  className={`flex-shrink-0 p-0.5 rounded transition-colors ${isExpanded ? "text-blue-600 bg-blue-50" : "text-gray-400 hover:text-blue-500"}`}>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              )}
              <span className="line-clamp-2">{product.name}</span>
              {hasVariants && (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold uppercase flex-shrink-0">
                  {variantSummary?.count} VAR
                </span>
              )}
              {product.is_duplicate && (
                <span className="text-[9px] px-1.5 py-0.5 bg-red-500 text-white rounded font-bold uppercase flex-shrink-0">DUP</span>
              )}
              {!product.category && (
                <span className="text-[9px] px-1.5 py-0.5 bg-amber-500 text-white rounded font-bold uppercase flex-shrink-0">NO CAT</span>
              )}
            </div>
          )}
        </td>

        <td className="px-3 py-2 text-center cursor-pointer hover:bg-black/5" onClick={() => !hasVariants && startEditing("stock")}>
          {!hasVariants && editingField === "stock"
            ? renderInlineInput("stock", () => handleBlur("stock"), false, false)
            : hasVariants
            ? <span className="text-xs font-semibold text-gray-700">{variantSummary?.totalStock}</span>
            : currentStock}
        </td>

        <td className="px-2 py-2 whitespace-nowrap cursor-pointer hover:bg-black/5" onClick={() => !hasVariants && startEditing("price_normal")}>
          {!hasVariants && editingField === "price_normal"
            ? renderInlineInput("price_normal", () => handleBlur("price_normal"), true, false)
            : hasVariants ? <span className="text-xs text-gray-500">—</span>
            : `Rp ${Number(currentPriceNormal).toLocaleString()}`}
        </td>

        <td className="px-2 py-2 whitespace-nowrap cursor-pointer hover:bg-black/5" onClick={() => !hasVariants && startEditing("price_discount")}>
          {!hasVariants && editingField === "price_discount"
            ? renderInlineInput("price_discount", () => handleBlur("price_discount"), true, false)
            : hasVariants ? <span className="text-xs text-gray-500">—</span>
            : `Rp ${Number(currentPriceDiscount).toLocaleString()}`}
        </td>

        <td className="px-2 py-2 whitespace-nowrap bg-black/5 font-bold">
          {hasVariants && variantSummary ? (
            variantSummary.minPrice === variantSummary.maxPrice
              ? <span className="text-xs">Rp {variantSummary.minPrice.toLocaleString("id-ID")}</span>
              : <span className="text-xs">Rp {variantSummary.minPrice.toLocaleString("id-ID")} – {variantSummary.maxPrice.toLocaleString("id-ID")}</span>
          ) : (
            `Rp ${Number(finalPrice).toLocaleString()}`
          )}
        </td>

        <td className="px-3 py-2 text-center">
          <div className="flex justify-center">
            <button type="button" onClick={() => onToggle(product.id, "is_active", product.is_active)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${product.is_active ? "bg-blue-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${product.is_active ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </td>

        <td className="px-3 py-2 text-center">
          <div className="flex justify-center">
            <button type="button" onClick={() => onToggle(product.id, "is_popular", product.is_popular)}
              className={`relative w-10 h-5 rounded-full transition-colors duration-300 ${product.is_popular ? "bg-blue-500" : "bg-gray-300"}`}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${product.is_popular ? "translate-x-5" : ""}`} />
            </button>
          </div>
        </td>

        <td className="px-3 py-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <button onClick={() => onEdit(product)} className="flex items-center justify-center gap-1 font-semibold text-blue-600 hover:text-blue-800">
              <ArrowTopRightOnSquareIcon className="w-4 h-4" strokeWidth={2.5} />
              <span>Ubah</span>
            </button>
          </div>
        </td>
      </tr>

      {hasVariants && isExpanded && (
        <>
          <tr className="bg-blue-50 border-b border-blue-100">
            <td colSpan={2} />
            <td className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500">{product.variant_type_name || "Variasi"}</td>
            <td className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500 text-center">Stok</td>
            <td className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500">Harga Normal</td>
            <td className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500">Diskon</td>
            <td className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-500">Final</td>
            <td colSpan={3} />
          </tr>

          {product.variants.map((v: any) => {
            const vFinal = Math.max(0, Number(v.price_normal || 0) - Number(v.price_discount || 0));
            const isEditingThis = (field: string) => editingVariantField === `${v.id}_${field}`;

            return (
              <tr key={v.id} className="bg-blue-50/40 border-b border-blue-50 hover:bg-blue-50 transition">
                <td colSpan={2} className="px-3 py-2">
                  <div className="flex justify-end">
                    {v.images?.[0] ? (
                      <img src={getThumbnailUrl(v.images[0].thumbnail_url || v.images[0].image_url)} className="w-7 h-7 rounded object-cover cursor-pointer" onClick={() => onImageClick(v.images[0].image_url)} />
                    ) : (
                      <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">—</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-medium text-gray-700">{v.variant_name}</span>
                    {v.sku_seller && <span className="text-[11px] text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{v.sku_seller}</span>}
                  </div>
                </td>
                <td className="px-3 py-2 text-center cursor-pointer hover:bg-blue-100 rounded" onClick={() => startEditingVariant(v.id, "stock", v.stock)}>
                  {isEditingThis("stock") ? renderInlineInput("stock", () => handleVariantBlur(v.id, "stock", v.stock), false, true) : <span className="text-xs">{v.stock}</span>}
                </td>
                <td className="px-2 py-2 cursor-pointer hover:bg-blue-100" onClick={() => startEditingVariant(v.id, "price_normal", v.price_normal)}>
                  {isEditingThis("price_normal") ? renderInlineInput("price_normal", () => handleVariantBlur(v.id, "price_normal", v.price_normal), true, true) : <span className="text-xs">Rp {Number(v.price_normal || 0).toLocaleString("id-ID")}</span>}
                </td>
                <td className="px-2 py-2 cursor-pointer hover:bg-blue-100" onClick={() => startEditingVariant(v.id, "price_discount", v.price_discount)}>
                  {isEditingThis("price_discount") ? renderInlineInput("price_discount", () => handleVariantBlur(v.id, "price_discount", v.price_discount), true, true) : <span className="text-xs">Rp {Number(v.price_discount || 0).toLocaleString("id-ID")}</span>}
                </td>
                <td className="px-2 py-2 font-semibold text-blue-700 text-xs">
                  Rp {vFinal.toLocaleString("id-ID")}
                </td>
                <td colSpan={3} />
              </tr>
            );
          })}
        </>
      )}
    </>
  );
}