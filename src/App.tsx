/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AdminPage from './pages/AdminPage';
import ShopPage from './pages/ShopPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebase';

function Footer() {
  const [siteName, setSiteName] = useState('EXCESSIVE STORE');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSiteName(docSnap.data().siteName);
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, 'settings/global');
    });
    return () => unsub();
  }, []);

  return (
    <footer className="bg-surface border-t border-border-color py-12 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-orange rounded flex items-center justify-center">
                <span className="text-black font-black text-sm uppercase">{siteName.charAt(0)}</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tighter uppercase">
                {siteName.slice(1)}
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed">
              Premium tactical gear and urban essentials for the modern pioneer. 
              Designed in London, tested worldwide.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Shop</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><Link to="/shop" className="hover:text-brand-orange transition-colors">All Products</Link></li>
              <li><Link to="/collections" className="hover:text-brand-orange transition-colors">Collections</Link></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Best Sellers</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Sale</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Support</h4>
            <ul className="space-y-4 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-brand-orange transition-colors">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Returns & Exchanges</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand-orange transition-colors">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 uppercase tracking-widest text-xs">Follow Us</h4>
            <div className="flex gap-4">
              {['Instagram', 'Twitter', 'TikTok'].map(platform => (
                <a key={platform} href="#" className="w-10 h-10 bg-surface rounded-xl flex items-center justify-center hover:bg-brand-orange hover:text-black transition-all">
                  <span className="sr-only">{platform}</span>
                  <div className="w-5 h-5 bg-current opacity-20" />
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border-color flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-text-muted">
          <p>© 2026 {siteName.toUpperCase()}. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
            <span>Apple Pay</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <CartDrawer />
            
            <main className="flex-grow">
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/collections" element={<CollectionsPage />} />
                  <Route path="/collections/:handle" element={<CollectionDetailPage />} />
                  <Route path="/product/:handle" element={<ProductPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </AnimatePresence>
            </main>

            <Footer />
          </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}
