import { Product } from '../types';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
}

const SKELETON_COUNT = 6;

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-16 flex flex-col items-center gap-4 text-gray-500">
        <span className="text-6xl">🔍</span>
        <p className="text-lg font-medium">לא נמצאו מוצרים בקטגוריה זו</p>
        <p className="text-sm">נסה לבחור קטגוריה אחרת</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
