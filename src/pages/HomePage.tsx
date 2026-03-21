import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../lib/shopify';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(data => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-dark via-bg-dark/60 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-xs font-bold uppercase tracking-widest">
              <Zap size={14} /> New Collection 2026
            </div>
            <h1 className="text-6xl md:text-8xl font-display font-black leading-[0.9] tracking-tighter">
              EQUIP FOR THE <br />
              <span className="text-brand-orange">UNKNOWN.</span>
            </h1>
            <p className="text-xl text-text-secondary max-w-lg leading-relaxed">
              High-performance gear designed for urban explorers and modern pioneers. 
              Engineered for durability, styled for the street.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary px-8 py-4 text-lg">
                Shop Collection <ArrowRight size={20} />
              </button>
              <button className="btn-secondary px-8 py-4 text-lg">
                Our Story
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="text-brand-orange" />, title: "Built to Last", desc: "Military-grade materials and reinforced stitching in every piece." },
            { icon: <Globe className="text-accent-blue" />, title: "Global Shipping", desc: "Fast, reliable delivery to over 150 countries worldwide." },
            { icon: <Zap className="text-accent-orange" />, title: "Instant Support", desc: "24/7 expert assistance for all your gear requirements." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-8 space-y-4 hover:bg-surface transition-colors"
            >
              <div className="w-12 h-12 bg-bg-dark rounded-xl flex items-center justify-center border border-white/5">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-display font-black">FEATURED DROPS</h2>
            <p className="text-text-secondary">The latest additions to our tactical lineup.</p>
          </div>
          <Link to="/" className="text-brand-orange font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All Products <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card bg-brand-orange p-12 md:p-20 text-bg-dark relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <h2 className="text-4xl md:text-6xl font-display font-black leading-none">JOIN THE <br />INNER CIRCLE</h2>
            <p className="text-bg-dark/80 text-lg font-medium">Get early access to drops, exclusive discounts, and tactical insights.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/20 border-2 border-bg-dark/10 rounded-xl px-6 py-4 placeholder:text-bg-dark/50 focus:outline-none focus:border-bg-dark/30 transition-colors font-bold"
              />
              <button className="bg-bg-dark text-white px-8 py-4 rounded-xl font-bold hover:scale-105 transition-transform">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
