import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  variantId: string;
  title: string;
  handle: string;
  price: string;
  currencyCode: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  completeOrder: (shippingDetails: any) => Promise<string>;
  isCheckingOut: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('excessive_store_cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('excessive_store_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.variantId === newItem.variantId);
      if (existingItem) {
        return prevCart.map((item) =>
          item.variantId === newItem.variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.variantId === variantId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const completeOrder = async (shippingDetails: any) => {
    if (cart.length === 0) throw new Error('Cart is empty');
    setIsCheckingOut(true);
    setError(null);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderNumber = `ES-${Math.floor(100000 + Math.random() * 900000)}`;
      const orderId = `order-${Date.now()}`;
      
      const orderData = {
        id: orderId,
        items: cart,
        total: totalPrice,
        currency: cart[0]?.currencyCode || 'USD',
        shipping: shippingDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        orderNumber
      };

      // Save to local storage for Admin panel
      const existingOrders = JSON.parse(localStorage.getItem('excessive_store_orders') || '[]');
      localStorage.setItem('excessive_store_orders', JSON.stringify([orderData, ...existingOrders]));

      clearCart();
      return orderId;
    } catch (err) {
      setError('Failed to complete order. Please try again.');
      throw err;
    } finally {
      setIsCheckingOut(false);
    }
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        completeOrder,
        isCheckingOut,
        error,
        totalItems,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
