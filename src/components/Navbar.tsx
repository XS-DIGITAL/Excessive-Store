import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sun, Moon, ArrowRight, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { searchProducts } from '../lib/shopify';
import { formatPrice } from '../lib/utils';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [siteName, setSiteName] = useState('EXCESSIVE STORE');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load site name from local storage
    const savedSettings = localStorage.getItem('excessive_store_settings');
    if (savedSettings) {
      setSiteName(JSON.parse(savedSettings).siteName);
    }

    // Listen for settings updates
    const handleSettingsUpdate = (e: any) => {
      if (e.detail?.siteName) {
        setSiteName(e.detail.siteName);
      }
    };

    window.addEventListener('settingsUpdated', handleSettingsUpdate);
    return () => window.removeEventListener('settingsUpdated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark/80 backdrop-blur-lg border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-brand-orange rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform">
              <span className="text-black font-black text-xl uppercase">{siteName.charAt(0)}</span>
            </div>
            <span className="font-display font-bold text-2xl tracking-tighter uppercase">
              {siteName.slice(1)}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/shop" className="text-text-secondary hover:text-brand-orange transition-colors font-medium">Shop All</Link>
            <Link to="/collections" className="text-text-secondary hover:text-brand-orange transition-colors font-medium">Collections</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-text-secondary hover:text-brand-orange transition-colors"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-text-secondary hover:text-brand-orange transition-colors"
              title="Search"
            >
              <Search size={22} />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="p-2 text-text-secondary hover:text-brand-orange transition-colors relative"
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-brand-orange text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              className="md:hidden p-2 text-text-secondary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface border-b border-border-color overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              <Link to="/shop" className="block text-lg font-medium text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
              <Link to="/collections" className="block text-lg font-medium text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="absolute inset-0 bg-bg-dark/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-surface border border-border-color rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-display font-black tracking-tighter uppercase">Search Products</h2>
                  <button 
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={24} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-bg-dark border-2 border-border-color rounded-2xl py-6 pl-16 pr-6 text-xl focus:border-brand-orange outline-none transition-all"
                  />
                  {isSearching && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <Loader2 className="animate-spin text-brand-orange" size={24} />
                    </div>
                  )}
                </div>

                <div className="mt-8 overflow-y-auto max-h-[50vh] pr-4 custom-scrollbar">
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          to={`/product/${product.handle}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex gap-4 p-4 bg-bg-dark/50 hover:bg-bg-dark border border-border-color rounded-xl transition-all group"
                        >
                          <div className="w-20 h-20 bg-surface rounded-lg overflow-hidden shrink-0">
                            <img 
                              src={product.images?.edges?.[0]?.node?.url || product.image} 
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h3 className="font-bold group-hover:text-brand-orange transition-colors">{product.title}</h3>
                            <p className="text-brand-orange font-mono text-sm mt-1">
                              {formatPrice(
                                product.priceRange?.minVariantPrice?.amount || product.price, 
                                product.priceRange?.minVariantPrice?.currencyCode || product.currencyCode || 'USD'
                              )}
                            </p>
                          </div>
                          <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowRight size={20} className="text-brand-orange" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 && !isSearching ? (
                    <div className="text-center py-12">
                      <p className="text-text-secondary text-lg">No products found for "{searchQuery}"</p>
                    </div>
                  ) : searchQuery.length <= 2 ? (
                    <div className="text-center py-12">
                      <p className="text-text-muted text-sm uppercase font-bold tracking-widest">Type at least 3 characters to search...</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
}
