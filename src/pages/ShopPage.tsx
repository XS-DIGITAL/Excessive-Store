import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { getProducts } from '../lib/shopify';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase">
          SHOP <span className="text-brand-orange">ALL</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Browse our complete catalog of tactical urban essentials. 
          Engineered for performance, designed for the street.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface border border-border-color rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
          />
        </div>
        <button className="btn-secondary flex items-center gap-2 w-full md:w-auto">
          <SlidersHorizontal size={20} /> Filters
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-xl text-text-secondary">No products found matching your search.</p>
              <button onClick={() => setSearchQuery('')} className="text-brand-orange font-bold">Clear Search</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
