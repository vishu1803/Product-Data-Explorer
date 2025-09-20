export function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded w-4/5 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
        <div className="flex items-center mb-4">
          <div className="flex space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-3 bg-gray-200 rounded w-16 ml-2" />
        </div>
        <div className="h-3 bg-gray-200 rounded mb-2" />
        <div className="h-3 bg-gray-200 rounded w-3/4 mb-4" />
        <div className="h-10 bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
      <div className="p-8">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-6 bg-gray-200 rounded mb-3" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
        <div className="flex items-center justify-between mb-6">
          <div className="h-3 bg-gray-200 rounded w-20" />
          <div className="h-3 bg-gray-200 rounded w-16" />
        </div>
        <div className="flex space-x-3">
          <div className="flex-1 h-12 bg-gray-200 rounded-xl" />
          <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
