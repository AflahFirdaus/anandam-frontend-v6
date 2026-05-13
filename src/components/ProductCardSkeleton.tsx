import React from "react";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex-shrink-0 w-[210px] rounded-lg border border-gray-200 overflow-hidden bg-white">
      
      {/* IMAGE */}
      <div className="aspect-square shimmer" />

      {/* CONTENT */}
      <div className="p-3 space-y-2">
        <div className="h-3 rounded shimmer w-3/4" />
        <div className="h-3 rounded shimmer w-1/2" /> 
        <div className="mt-3 h-5 rounded shimmer w-24" />
      </div>

    </div>
  );
};

export default ProductCardSkeleton;