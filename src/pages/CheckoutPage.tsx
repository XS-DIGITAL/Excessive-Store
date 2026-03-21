import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  ShoppingBag,
  ShieldCheck
} from 'lucide-react';

type CheckoutStep = 'shipping' | 'payment' | 'success';

export default function CheckoutPage() {
  const { cart, totalPrice, completeOrder, isCheckingOut } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United Kingdom'
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiry: '12/26',
    cvv: '123'
  });

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-6">
        <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-text-muted">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-display font-black">YOUR CART IS EMPTY</h1>
        <p className="text-text-secondary max-w-md">You don't have any items in your cart to checkout. Head back to the shop to find something you like.</p>
        <button onClick={() => navigate('/shop')} className="btn-primary px-8 py-4">
          Back to Shop
        </button>
      </div>
    );
  }

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = await completeOrder(shippingData);
      setOrderId(id);
      setStep('success');
    } catch (err) {
      // Error handled by context
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Progress Bar */}
            <div className="flex items-center gap-4 mb-12">
              {[
                { id: 'shipping', label: 'Shipping', icon: Truck },
                { id: 'payment', label: 'Payment', icon: CreditCard },
                { id: 'success', label: 'Success', icon: CheckCircle }
              ].map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={`flex items-center gap-2 ${step === s.id ? 'text-brand-orange' : 'text-text-muted'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === s.id ? 'border-brand-orange bg-brand-orange/10' : 'border-text-muted/20'}`}>
                      <s.icon size={16} />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-widest hidden sm:block">{s.label}</span>
                  </div>
                  {i < 2 && <div className="flex-grow h-px bg-white/5" />}
                </React.Fragment>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 'shipping' && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-black uppercase italic">Shipping Details</h2>
                    <p className="text-text-secondary">Where should we send your gear?</p>
                  </div>

                  <form onSubmit={handleShippingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">First Name</label>
                      <input 
                        required
                        type="text" 
                        value={shippingData.firstName}
                        onChange={e => setShippingData({...shippingData, firstName: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">Last Name</label>
                      <input 
                        required
                        type="text" 
                        value={shippingData.lastName}
                        onChange={e => setShippingData({...shippingData, lastName: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={shippingData.email}
                        onChange={e => setShippingData({...shippingData, email: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">Address</label>
                      <input 
                        required
                        type="text" 
                        value={shippingData.address}
                        onChange={e => setShippingData({...shippingData, address: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="123 Tactical Way"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">City</label>
                      <input 
                        required
                        type="text" 
                        value={shippingData.city}
                        onChange={e => setShippingData({...shippingData, city: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="London"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-text-muted">ZIP / Postcode</label>
                      <input 
                        required
                        type="text" 
                        value={shippingData.zipCode}
                        onChange={e => setShippingData({...shippingData, zipCode: e.target.value})}
                        className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange transition-colors"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                    
                    <div className="md:col-span-2 pt-6">
                      <button type="submit" className="btn-primary w-full py-4 flex items-center justify-center gap-2 group">
                        Continue to Payment
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="space-y-2">
                    <h2 className="text-3xl font-display font-black uppercase italic">Payment Method</h2>
                    <p className="text-text-secondary">This is a demo checkout. No real charges will be made.</p>
                  </div>

                  <div className="glass-card p-6 border-brand-orange/20 bg-brand-orange/5 flex items-start gap-4">
                    <ShieldCheck className="text-brand-orange shrink-0" size={24} />
                    <div className="space-y-1">
                      <p className="font-bold text-sm">DEMO MODE ACTIVE</p>
                      <p className="text-xs text-text-secondary">We've pre-filled demo card details for you. Just click "Complete Order" to see the success state.</p>
                    </div>
                  </div>

                  <form onSubmit={handlePaymentSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-text-muted">Card Number</label>
                        <div className="relative">
                          <input 
                            readOnly
                            type="text" 
                            value={paymentData.cardNumber}
                            className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 pl-12 focus:outline-none"
                          />
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-text-muted">Expiry Date</label>
                          <input 
                            readOnly
                            type="text" 
                            value={paymentData.expiry}
                            className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-text-muted">CVV</label>
                          <input 
                            readOnly
                            type="text" 
                            value={paymentData.cvv}
                            className="w-full bg-surface border border-white/5 rounded-xl px-4 py-3 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                      <button 
                        type="button" 
                        onClick={() => setStep('shipping')}
                        className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={20} /> Back to Shipping
                      </button>
                      <button 
                        type="submit" 
                        disabled={isCheckingOut}
                        className="btn-primary flex-[2] py-4 flex items-center justify-center gap-2"
                      >
                        {isCheckingOut ? 'Processing...' : 'Complete Order'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8 py-12"
                >
                  <div className="w-24 h-24 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto text-brand-green">
                    <CheckCircle size={48} />
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl font-display font-black uppercase italic">Order Confirmed!</h2>
                    <p className="text-text-secondary max-w-md mx-auto">
                      Thank you for your order. Your order number is <span className="text-text-primary font-mono font-bold">#{orderId?.slice(-6).toUpperCase()}</span>.
                      We've sent a confirmation email to {shippingData.email}.
                    </p>
                  </div>
                  <div className="pt-8">
                    <button onClick={() => navigate('/')} className="btn-primary px-12 py-4">
                      Return to Home
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Order Summary */}
          {step !== 'success' && (
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-32 space-y-6">
                <h3 className="font-display font-bold text-xl uppercase tracking-tighter">Order Summary</h3>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.variantId} className="flex gap-4">
                      <div className="w-16 h-16 bg-surface rounded-lg overflow-hidden shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-bold truncate">{item.title}</h4>
                        <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
                        <p className="text-sm font-mono text-brand-orange mt-1">
                          {formatPrice(item.price, item.currencyCode)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/5 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Subtotal</span>
                    <span>{formatPrice(totalPrice.toString(), cart[0]?.currencyCode || 'USD')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Shipping</span>
                    <span className="text-brand-green">FREE</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-white/5">
                    <span>Total</span>
                    <span className="text-brand-orange">
                      {formatPrice(totalPrice.toString(), cart[0]?.currencyCode || 'USD')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
