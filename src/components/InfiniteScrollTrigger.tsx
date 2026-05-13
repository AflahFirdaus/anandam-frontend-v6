import { useEffect, useRef } from "react";

interface InfiniteScrollTriggerProps {
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function InfiniteScrollTrigger({
  loading,
  hasMore,
  onLoadMore,
}: InfiniteScrollTriggerProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0
      }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [loading, hasMore, onLoadMore]);

  if (!hasMore) return null;

  return (
    <div
      ref={observerRef}
      className="flex justify-center mt-10 h-10 items-center"
    >
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">
            Memuat lebih banyak...
          </span>
        </div>
      )}
    </div>
  );
}