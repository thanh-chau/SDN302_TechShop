import { useState, useEffect } from "react";
import { productAPI } from "../utils/api";

const PLACEHOLDER = "https://placehold.co/400x400?text=No+Image";

function transform(product) {
  return {
    ...product,
    image: product.imgUrl || product.image || PLACEHOLDER,
    price: product.price || 0,
    rating: 4.5,
    reviews: 0,
  };
}

export function useProductLoader() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI
      .getAll()
      .then((data) => setProducts((data || []).map(transform)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  return { products, setProducts, loading };
}
