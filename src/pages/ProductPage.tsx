import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowLeft, Shield, Truck, RefreshCcw, Star } from 'lucide-react';
import { getProduct } from '../lib/shopify';
import { formatPrice } from '../lib/utils';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { handle } = useParams<{ handle: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (handle) {
      getProduct(handle).then(data => {
        setProduct(data);
        setLoading(false);
      });
    }
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <button onClick={() => navigate('/')} className="btn-secondary">Go Back Home</button>
      </div>
    );
  }

  const price = product.priceRange.minVariantPrice;
  const images = product.images.edges.map((e: any) => e.node);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-brand-orange transition-colors font-medium"
      >
        <ArrowLeft size={20} /> Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
        {/* Images */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] bg-surface rounded-3xl overflow-hidden border border-white/5"
          >
            <img 
              src={images[activeImage]?.url} 
              alt={product.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="grid grid-cols-5 gap-4">
            {images.map((img: any, i: number) => (
              <button 
                key={i}
                onClick={() => setActiveImage(i)}
                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-brand-orange' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-accent-orange">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} fill="currentColor" />)}
              </div>
              <span className="text-sm font-bold text-text-secondary">4.9 (128 reviews)</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none">
              {product.title}
            </h1>
            <p className="text-3xl font-mono font-bold text-brand-orange">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
          </div>

          <p className="text-xl text-text-secondary leading-relaxed">
            {product.description}
          </p>

          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => addToCart({
                  id: product.id,
                  variantId: product.variants.edges[0].node.id,
                  title: product.title,
                  handle: product.handle,
                  price: price.amount,
                  currencyCode: price.currencyCode,
                  image: images[0]?.url
                })}
                className="btn-primary flex-1 py-5 text-xl"
              >
                <ShoppingCart size={24} /> Add to Cart
              </button>
              <button className="btn-secondary px-8">
                Wishlist
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: <Truck size={18} />, label: "Free Shipping" },
                { icon: <Shield size={18} />, label: "2 Year Warranty" },
                { icon: <RefreshCcw size={18} />, label: "30 Day Returns" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-text-muted text-sm font-medium">
                  <span className="text-brand-orange">{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Details Tabs (Simplified) */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold uppercase tracking-widest text-xs text-text-muted">Specifications</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-text-secondary">Material</span>
                <span className="font-medium">100% Recycled Nylon</span>
              </li>
              <li className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-text-secondary">Weight</span>
                <span className="font-medium">450g</span>
              </li>
              <li className="flex justify-between">
                <span className="text-text-secondary">Fit</span>
                <span className="font-medium">Athletic / Modern</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
