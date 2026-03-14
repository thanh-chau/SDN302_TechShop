export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  category?: string;
  description?: string;
  stock?: number;
  avgRating?: number;
  reviewCount?: number;
  rating?: number;
  reviews?: number;
  flashSaleEnd?: string;
  flashSalePrice?: number;
}

export interface Category {
  id: string;
  name: string;
  category?: string;
  keywords?: string[] | null;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userName?: string;
  createdAt: string;
}
