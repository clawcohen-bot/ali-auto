import { ProductsResponse } from './types';

export async function fetchProducts(
  category?: string,
  page = 1,
  limit = 20,
): Promise<ProductsResponse> {
  const params = new URLSearchParams();

  if (category) {
    params.set('category', category);
  }

  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await fetch(`/products?${params.toString()}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch products: ${res.status}`);
  }

  return res.json();
}
