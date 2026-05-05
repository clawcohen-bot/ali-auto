export interface Product {
  id: number;
  aliId: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string;
  productUrl: string;
  category: string;
  rating?: number | null;
  soldCount?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  data: Product[];
  total: number;
  page: number;
}

export const CATEGORIES: { label: string; value: string }[] = [
  { label: 'כל המוצרים', value: '' },
  { label: 'תאורה', value: 'תאורה' },
  { label: 'טיפול', value: 'טיפול' },
  { label: 'מולטימדיה', value: 'מולטימדיה' },
  { label: 'ניקוי', value: 'ניקוי' },
  { label: 'בטיחות', value: 'בטיחות' },
  { label: 'אביזרי פנים', value: 'אביזרי פנים' },
];
