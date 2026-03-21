import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { getCollections } from '../lib/shopify';
import { ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await getCollections();
        setCollections(data);
      } catch (error) {
        console.error('Failed to load collections:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCollections();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter uppercase">
          OUR <span className="text-brand-orange">COLLECTIONS</span>
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl">
          Explore curated drops and tactical gear designed for specific environments. 
          Each collection is a unique chapter in our design journey.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card aspect-video animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((collection, i) => (
            <motion.div 
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[400px] rounded-3xl overflow-hidden glass-card"
            >
              <img 
                src={collection.image?.url || 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800'} 
                alt={collection.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/90 via-bg-dark/20 to-transparent flex flex-col justify-end p-8 space-y-4">
                <h2 className="text-4xl font-display font-black tracking-tighter uppercase leading-none">
                  {collection.title}
                </h2>
                <p className="text-text-secondary max-w-md line-clamp-2">
                  {collection.description}
                </p>
                <Link 
                  to={`/collections/${collection.handle}`}
                  className="btn-primary w-fit px-6 py-3 flex items-center gap-2 group/btn"
                >
                  Explore <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
