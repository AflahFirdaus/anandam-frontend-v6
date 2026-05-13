import React from "react";

interface LoadMoreButtonProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  label?: string;
}

export default function LoadMoreButton({
  loading,
  hasMore,
  onLoadMore,
  label = "Tampilkan Lebih Banyak",
}: LoadMoreButtonProps) {
  if (!hasMore) return null;

  return (
    <div className="flex justify-center mt-10">
        <button
            type="button"
            onClick={onLoadMore}
            disabled={loading}
            className="
                px-6 py-2 rounded-md
                bg-primary text-white border border-white
                font-semibold
                hover:bg-white hover:text-primary hover:border-primary
                transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
            "
            >
            {loading ? "Memuat..." : "Tampilkan Lebih Banyak"}
        </button>
    </div>
  );
}