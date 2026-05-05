import { useState, useEffect } from 'react';
import { Product } from './types';
import { CATEGORIES } from './types';
import { fetchProducts } from './api';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import ProductGrid from './components/ProductGrid';

function App() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchProducts(selectedCategory || undefined)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message ?? 'שגיאה בטעינת המוצרים');
        setLoading(false);
      });
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <CategoryFilter
          categories={CATEGORIES}
          selected={selectedCategory}
          onSelect={setSelectedCategory}
        />

        {error ? (
          <div className="mt-8 text-center text-red-500 font-medium">{error}</div>
        ) : (
          <ProductGrid products={products} loading={loading} />
        )}
      </main>
    </div>
  );
}

export default App;
