import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: any;
  key?: string | number;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const price = product.priceRange.minVariantPrice;
  const image = product.images.edges[0]?.node;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card group"
    >
      <Link to={`/product/${product.handle}`} className="block relative aspect-[4/5] overflow-hidden">
        <img 
          src={image?.url} 
          alt={image?.altText || product.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <span className="text-white font-medium flex items-center gap-2">
            View Details <ArrowRight size={16} />
          </span>
        </div>
      </Link>
      
      <div className="p-5 space-y-3">
        <div className="flex justify-between items-start gap-2">
          <Link to={`/product/${product.handle}`}>
            <h3 className="font-display font-bold text-lg group-hover:text-brand-orange transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <span className="text-brand-orange font-mono font-bold">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
        </div>
        
        <p className="text-text-secondary text-sm line-clamp-2 min-h-[2.5rem]">
          {product.description}
        </p>
        
        <button 
          onClick={() => addToCart({
            id: product.id,
            variantId: product.variants?.edges[0]?.node?.id || product.id,
            title: product.title,
            handle: product.handle,
            price: price.amount,
            currencyCode: price.currencyCode,
            image: image?.url
          })}
          className="w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingCart size={16} className="group-hover/btn:text-brand-orange transition-colors" />
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}
