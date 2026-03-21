import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Sun, Moon, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteName, setSiteName] = useState('LOOKOUTPOST');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteName(docSnap.data().siteName);
      }
    });
    return () => unsub();
  }, []);

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
            <Link to="/admin" className="text-text-secondary hover:text-brand-orange transition-colors font-medium flex items-center gap-1">
              <Shield size={14} /> Admin
            </Link>
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
            <button className="p-2 text-text-secondary hover:text-brand-orange transition-colors">
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
              <Link to="/" className="block text-lg font-medium text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Shop All</Link>
              <Link to="/" className="block text-lg font-medium text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
              <Link to="/admin" className="block text-lg font-medium text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
