// src/components/Skeleton.jsx - Reusable skeleton components

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 animate-pulse">
      <div className="aspect-square bg-neutral-200" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="h-10 bg-neutral-200 rounded-xl" />
      </div>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Skeleton */}
        <div className="space-y-4">
          <div className="aspect-square bg-neutral-200 rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-neutral-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-8 bg-neutral-200 rounded w-1/4" />
            <div className="h-10 bg-neutral-200 rounded w-3/4" />
          </div>
          
          <div className="h-12 bg-neutral-200 rounded w-1/3" />
          
          <div className="space-y-2">
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded" />
            <div className="h-4 bg-neutral-200 rounded w-5/6" />
          </div>
          
          <div className="h-16 bg-neutral-200 rounded-xl" />
          
          <div className="flex gap-3">
            <div className="flex-1 h-14 bg-neutral-200 rounded-xl" />
            <div className="w-14 h-14 bg-neutral-200 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CartItemSkeleton() {
  return (
    <div className="flex gap-4 sm:gap-6 p-4 sm:p-6 bg-white rounded-2xl border border-neutral-100 animate-pulse">
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="flex items-center justify-between">
          <div className="h-10 bg-neutral-200 rounded w-24" />
          <div className="h-6 bg-neutral-200 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

export function OrderCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-neutral-200 rounded w-32" />
          <div className="h-6 bg-neutral-200 rounded-full w-20" />
        </div>
        
        <div className="space-y-2">
          <div className="h-4 bg-neutral-200 rounded w-1/4" />
          <div className="h-4 bg-neutral-200 rounded w-1/3" />
        </div>
        
        <div className="border-t border-neutral-100 pt-4 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-12 h-12 bg-neutral-200 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4" />
                <div className="h-3 bg-neutral-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-neutral-100 pt-4 flex justify-between items-center">
          <div className="h-5 bg-neutral-200 rounded w-24" />
          <div className="h-7 bg-neutral-200 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export function FavoriteCardSkeleton() {
  return (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-neutral-100 animate-pulse">
      <div className="w-24 h-24 bg-neutral-200 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-neutral-200 rounded w-3/4" />
        <div className="h-4 bg-neutral-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-10 bg-neutral-200 rounded-lg flex-1" />
          <div className="h-10 bg-neutral-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3, type = 'product' }) {
  const SkeletonComponent = {
    product: ProductCardSkeleton,
    cart: CartItemSkeleton,
    order: OrderCardSkeleton,
    favorite: FavoriteCardSkeleton,
  }[type] || ProductCardSkeleton;

  return (
    <>
      {[...Array(count)].map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </>
  );
}
