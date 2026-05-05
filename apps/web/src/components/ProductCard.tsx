import { useState } from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);

  return (
    <span className="flex items-center gap-0.5 text-yellow-400 text-sm">
      {Array.from({ length: full }).map((_, i) => (
        <span key={`f-${i}`}>★</span>
      ))}
      {half && <span>½</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <span key={`e-${i}`} className="text-gray-300">
          ★
        </span>
      ))}
      <span className="text-gray-500 text-xs ml-1">({rating.toFixed(1)})</span>
    </span>
  );
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        {!imgError ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-gray-400 text-4xl flex flex-col items-center gap-2">
            <span>🚗</span>
            <span className="text-xs">תמונה לא זמינה</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category badge */}
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full self-start mb-2"
          style={{ backgroundColor: '#fff0f0', color: '#ff4747' }}
        >
          {product.category}
        </span>

        {/* Title */}
        <p
          className="text-sm text-gray-800 font-medium leading-snug mb-2 line-clamp-2 flex-1"
          title={product.title}
        >
          {product.title}
        </p>

        {/* Price */}
        <p className="text-lg font-bold mb-1" style={{ color: '#ff4747' }}>
          ${product.price.toFixed(2)}{' '}
          <span className="text-xs font-normal text-gray-400">{product.currency}</span>
        </p>

        {/* Rating */}
        {product.rating != null && (
          <div className="mb-1">
            <StarRating rating={product.rating} />
          </div>
        )}

        {/* Sold count */}
        {product.soldCount != null && product.soldCount > 0 && (
          <p className="text-xs text-gray-400 mb-3">
            {product.soldCount.toLocaleString()} נמכרו
          </p>
        )}

        {/* CTA */}
        <a
          href={product.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto block text-center py-2 px-4 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#ff4747' }}
        >
          צפה ב-AliExpress
        </a>
      </div>
    </div>
  );
}
