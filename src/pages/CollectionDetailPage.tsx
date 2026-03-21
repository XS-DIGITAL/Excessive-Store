import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { getProductsByCollection } from '../lib/shopify';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { ArrowLeft } from 'lucide-react';

export default function CollectionDetailPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (!handle) return;
      try {
        const data = await getProductsByCollection(handle);
        setProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [handle]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <button 
        onClick={() => navigate('/collections')}
        className="flex items-center gap-2 text-text-secondary hover:text-brand-orange transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Back to Collections
      </button>

      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase">
          {handle?.replace('-', ' ')} <span className="text-brand-orange">COLLECTION</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Discover the unique pieces in our {handle?.replace('-', ' ')} drop. 
          Limited availability, engineered for the street.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map(i => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center space-y-4">
              <p className="text-xl text-text-secondary">No products found in this collection.</p>
              <button onClick={() => navigate('/collections')} className="text-brand-orange font-bold">Browse All Collections</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
